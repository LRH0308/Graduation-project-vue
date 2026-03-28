<template>
  <div class="task-book-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务书管理</span>
        </div>
      </template>
      
      <!-- 标签页 -->
      <el-tabs v-model="activeTab">
        <!-- 任务书申请标签页 -->
        <el-tab-pane label="任务书申请" name="apply">
          <el-form
            ref="taskFormRef"
            :model="taskForm"
            :rules="taskRules"
            label-width="100px"
            class="task-form"
          >
            <el-form-item label="选择学生" prop="studentId">
              <el-select
                v-model="taskForm.studentId"
                placeholder="请选择学生"
                style="width: 100%;"
                :loading="studentLoading"
                @change="handleStudentChange"
              >
                <el-option
                  v-for="student in studentList"
                  :key="student.id"
                  :label="student.studentName"
                  :value="student.id"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="课题名称">
              <el-input
                v-model="taskForm.topicName"
                disabled
              />
            </el-form-item>
            
            <el-form-item label="主要内容">
              <el-input
                v-model="taskForm.content"
                type="textarea"
                :rows="4"
                placeholder="请输入主要内容"
              />
            </el-form-item>
            
            <el-form-item label="参考文献">
              <el-input
                v-model="taskForm.reference"
                type="textarea"
                :rows="3"
                placeholder="请输入参考文献"
              />
            </el-form-item>
            
            <el-form-item label="上传文件" prop="fileId">
              <input
                type="file"
                @change="handleFileChange"
                accept=".doc,.docx,.pdf"
              />
              <p class="tips">支持格式：doc, docx, pdf，最大 50MB</p>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 任务书列表标签页 -->
        <el-tab-pane label="任务书列表" name="list">
          <!-- 搜索表单 -->
          <el-form :model="searchForm" inline class="search-form">
            <el-form-item label="学生姓名">
              <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" />
            </el-form-item>
            <el-form-item label="审核状态">
              <el-select v-model="searchForm.auditStatus" placeholder="请选择" style="width: 120px">
                <el-option label="待审核" :value="0" />
                <el-option label="已通过" :value="1" />
                <el-option label="已驳回" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
          
          <!-- 列表 -->
          <el-table :data="taskBookList" v-loading="loading" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column label="学号/学生名" width="150">
              <template #default="{ row }">
                {{ row.studentAccount }}/{{ row.studentName }}
              </template>
            </el-table-column>
            <el-table-column prop="submitTime" label="导师提交时间" width="160"/>
            <el-table-column prop="auditStatus" label="审核状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getAuditStatusType(row.auditStatus)">
                  {{ getAuditStatusText(row.auditStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="工号/系主任" width="150">
              <template #default="{ row }">
                {{ row.auditAccount }}/{{ row.auditName }}
              </template>
            </el-table-column>
            <el-table-column prop="auditTime" label="审核时间" width="160"/>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="handleViewDetail(row)">详情</el-button>
                <el-button
                  v-if="row.fileId"
                  size="small"
                  type="success"
                  @click="downloadFile(row)"
                >
                  下载文件
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="getTaskBookList"
            @current-change="getTaskBookList"
            style="margin-top: 20px; text-align: right;"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="任务书详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">{{ currentTaskBook.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentTaskBook.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentTaskBook.projectName }}</el-descriptions-item>
        <el-descriptions-item label="课题内容">{{ currentTaskBook.content || '无' }}</el-descriptions-item>
        <el-descriptions-item label="参考文献">{{ currentTaskBook.reference || '无' }}</el-descriptions-item>
        <el-descriptions-item label="导师">{{ currentTaskBook.teacherAccount }}/{{ currentTaskBook.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentTaskBook.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentTaskBook.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ currentTaskBook.auditAccount }}/{{ currentTaskBook.auditName }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentTaskBook.auditTime }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">
          {{ currentTaskBook.auditRemark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      

      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { taskBookApi, fileApi, topicApi } from '@/utils/apiRequest'

// 标签页
const activeTab = ref('list')

// 任务书申请表单
const taskFormRef = ref(null)
const submitting = ref(false)

const taskForm = reactive({
  studentId: null,
  studentAccount: '',
  studentName: '',
  projectId: null,
  topicName: '',
  content: '',
  reference: ''
})

const taskRules = {
  studentId: [
    { required: true, message: '请选择学生', trigger: 'change' }
  ],
  fileId: [
    { required: true, message: '请上传文件', trigger: 'change' }
  ]
}

const studentList = ref([])
const studentLoading = ref(false)

const uploadFile = ref(null)

// 获取学生和课题列表
const getStudentList = async () => {
  studentLoading.value = true
  try {
    const response = await topicApi.getTopicSelection({})
    if (response?.status === 'success') {
      const subjects = response.data?.records || response.data?.list || []
      // 过滤出已选题的课题，包含学生信息
      studentList.value = subjects
        .filter(subject => subject.applyStatusStudent)
        .map(subject => ({
          id: subject.studentId,
          studentAccount: subject.studentAccount,
          studentName: subject.studentName,
          projectId: subject.id,
          topicName: subject.topicName
        }))
    } else {
      ElMessage.warning('获取学生列表失败')
      studentList.value = []
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
    studentList.value = []
  } finally {
    studentLoading.value = false
  }
}

// 学生选择变化
const handleStudentChange = (studentId) => {
  const student = studentList.value.find(s => s.id === studentId)
  if (student) {
    taskForm.studentAccount = student.studentAccount
    taskForm.studentName = student.studentName
    taskForm.projectId = student.projectId
    taskForm.topicName = student.topicName
  }
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 50 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过 50MB')
      event.target.value = ''
      return
    }
    uploadFile.value = file
  }
}

// 提交
const handleSubmit = async () => {
  if (!taskForm.studentId) {
    ElMessage.warning('请选择学生')
    return
  }
  if (!uploadFile.value) {
    ElMessage.warning('请上传文件')
    return
  }
  
  submitting.value = true
  try {
    // 上传文件
    const uploadRes = await fileApi.upload(uploadFile.value, {
      fileType: 1,
      projectId: taskForm.projectId
    })
    
    if (uploadRes?.code === 200) {
      const fileId = uploadRes.data.id
      
      // 申请任务书
      const res = await taskBookApi.applyTaskBook({
        projectId: taskForm.projectId,
        fileId: fileId,
        content: taskForm.content,
        reference: taskForm.reference,
        studentId: taskForm.studentId,
        studentAccount: taskForm.studentAccount,
        studentName: taskForm.studentName
      })
      
      if (res?.code === 200) {
        ElMessage.success('任务书申请成功')
        handleReset()
      }
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 重置申请表单
const handleReset = () => {
  taskForm.studentId = null
  taskForm.studentAccount = ''
  taskForm.studentName = ''
  taskForm.projectId = null
  taskForm.topicName = ''
  taskForm.content = ''
  taskForm.reference = ''
  uploadFile.value = null
  if (taskFormRef.value) {
    taskFormRef.value.clearValidate()
  }
}

// 搜索表单
const searchForm = reactive({
  studentName: '',
  auditStatus: null
})

// 任务书列表
const taskBookList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentTaskBook = ref({})

// 获取任务书列表
const getTaskBookList = async () => {
  loading.value = true
  try {
    const response = await taskBookApi.getTaskBook({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    })
    
    if (response?.code === 200) {
      taskBookList.value = response.data?.records || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取任务书列表失败')
      taskBookList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取任务书列表失败:', error)
    ElMessage.error('获取任务书列表失败')
    taskBookList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}



// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getTaskBookList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.auditStatus = null
  currentPage.value = 1
  getTaskBookList()
}

// 查看详情
const handleViewDetail = (row) => {
  currentTaskBook.value = row
  detailDialogVisible.value = true
}

// 下载文件
const downloadFile = async (row) => {
  if (!row.fileId) {
    ElMessage.warning('暂无可下载文件')
    return
  }
  
  try {
    ElMessage.info('正在下载文件...')
    // 获取文件详情
    const detailRes = await fileApi.getFileDetail(row.fileId)
    if (detailRes?.code !== 200 || !detailRes.data) {
      ElMessage.error('获取文件信息失败')
      return
    }
    
    const fileInfo = detailRes.data
    
    // 下载文件
    const response = await fileApi.download(row.fileId)
    
    // 创建Blob并下载
    const blob = new Blob([response], { 
      type: fileInfo.fileType || 'application/octet-stream' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileInfo.fileName || '下载文件'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('下载文件失败:', error)
    ElMessage.error('下载文件失败，请重试')
  }
}

// 获取状态文本
const getAuditStatusText = (status) => {
  const map = { 0: '待审核', 1: '审核通过', 2: '审核驳回' }
  return map[status] || '未知'
}

// 获取状态类型
const getAuditStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

onMounted(() => {
  getTaskBookList()
  getStudentList()
})
</script>

<style scoped>
.task-book-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.search-form {
  margin-bottom: 20px;
}

.task-form {
  max-width: 600px;
  margin: 0 auto;
}

.tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

/* 表格文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}
</style>
