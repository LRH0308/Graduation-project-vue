<template>
  <div class="task-book-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>过程指导记录</span>
        </div>
      </template>
      
      <!-- 标签页 -->
      <el-tabs v-model="activeTab">
        <!-- 指导记录列表标签页 -->
        <el-tab-pane label="指导记录列表" name="list">
          <!-- 搜索表单 -->
          <el-form :model="searchForm" inline class="search-form">
            <el-form-item label="学生姓名">
              <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
          
          <!-- 列表 -->
          <el-table :data="guideRecordList" v-loading="loading" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column label="学号/学生" width="150">
              <template #default="{ row }">
                {{ row.studentAccount }}/{{ row.studentName }}
              </template>
            </el-table-column>
            <el-table-column prop="guidanceTime" label="指导时间" width="180"/>
            <el-table-column prop="guidanceContent" label="指导内容" show-overflow-tooltip />
            <el-table-column prop="studentFeedback" label="学生反馈" show-overflow-tooltip />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
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
            @size-change="getGuideRecordList"
            @current-change="getGuideRecordList"
            style="margin-top: 20px; text-align: right;"
          />
        </el-tab-pane>
        
        <!-- 填写指导记录标签页 -->
        <el-tab-pane label="填写指导记录" name="fill">
          <el-form
            ref="guideFormRef"
            :model="guideForm"
            label-width="100px"
            class="guide-form"
          >
            <el-form-item label="指导学生" required>
              <el-select
                v-model="guideForm.studentId"
                placeholder="请选择学生"
                style="width: 100%;"
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
                v-model="guideForm.topicName"
                disabled
                placeholder="自动获取"
              />
            </el-form-item>
            
            <el-form-item label="指导时间">
              <el-date-picker
                v-model="guideForm.guidanceTime"
                type="datetime"
                placeholder="选择指导时间"
                style="width: 100%;"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
            
            <el-form-item label="指导内容" required>
              <el-input
                v-model="guideForm.guidanceContent"
                type="textarea"
                :rows="6"
                placeholder="请输入指导内容"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">提交</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="指导记录详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">{{ currentRecord.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentRecord.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="指导时间">{{ currentRecord.guidanceTime }}</el-descriptions-item>
        <el-descriptions-item label="指导内容" :span="2">
          {{ currentRecord.guidanceContent }}
        </el-descriptions-item>
        <el-descriptions-item label="学生反馈" :span="2">
          {{ currentRecord.studentFeedback || '暂无反馈' }}
        </el-descriptions-item>
        <el-descriptions-item label="反馈时间">{{ currentRecord.feedbackTime || '未反馈' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { guidanceApi } from '@/utils/apiRequest'

const router = useRouter()

// 标签页
const activeTab = ref('list')

// 搜索表单
const searchForm = reactive({
  studentName: ''
})

// 指导记录列表
const guideRecordList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentRecord = ref({})

// 填写指导记录表单
const guideFormRef = ref(null)
// 格式化当前时间为 yyyy-MM-dd HH:mm:ss 格式
const formatCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const guideForm = reactive({
  projectId: null,
  studentId: null,
  topicName: '',
  guidanceTime: formatCurrentTime(),
  guidanceContent: ''
})

// 学生列表
const studentList = ref([])

// 获取指导记录列表
const getGuideRecordList = async () => {
  loading.value = true
  try {
    const response = await guidanceApi.getProcessGuidanceRecord({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    })
    
    if (response?.status === 'success') {
      guideRecordList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      useMockData()
    }
  } catch (error) {
    console.error('获取指导记录失败:', error)
    ElMessage.error('获取指导记录失败')
    useMockData()
  } finally {
    loading.value = false
  }
}

// 使用模拟数据
const useMockData = () => {
  guideRecordList.value = [
    {
      id: 1,
      studentName: '张三',
      studentAccount: '2020001',
      topicName: '基于 Spring Boot 的毕设管理系统',
      guidanceTime: '2025-03-15 14:00:00',
      guidanceContent: '讨论了系统架构设计，建议采用前后端分离架构',
      studentFeedback: '明白了，我会按照建议修改',
      feedbackTime: '2025-03-15 16:00:00'
    }
  ]
  total.value = guideRecordList.value.length
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getGuideRecordList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  currentPage.value = 1
  getGuideRecordList()
}

// 查看详情
const handleViewDetail = (row) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

// 获取学生列表
const getStudentList = async () => {
  try {
    // 调用 API 获取所指导学生列表
    // const res = await xxxApi.getStudentList()
    // studentList.value = res.data || []
    
    // 模拟数据
    studentList.value = [
      { id: 1, studentName: '张三', studentAccount: '2020001', projectId: 5, topicName: '基于 Spring Boot 的毕设管理系统' },
      { id: 2, studentName: '李四', studentAccount: '2020002', projectId: 6, topicName: '人工智能在教育中的应用' }
    ]
  } catch (error) {
    console.error('获取学生列表失败:', error)
  }
}

// 学生选择变化
const handleStudentChange = (studentId) => {
  const student = studentList.value.find(s => s.id === studentId)
  if (student) {
    guideForm.projectId = student.projectId
    guideForm.topicName = student.topicName
  }
}

// 提交
const handleSubmit = async () => {
  if (!guideForm.studentId) {
    ElMessage.warning('请选择学生')
    return
  }
  if (!guideForm.guidanceContent) {
    ElMessage.warning('请输入指导内容')
    return
  }
  
  try {
    const res = await guidanceApi.teacherFill({
      projectId: guideForm.projectId,
      studentId: guideForm.studentId,
      guidanceContent: guideForm.guidanceContent,
      guidanceTime: guideForm.guidanceTime
    })
    
    if (res?.status === 'success') {
      ElMessage.success('填写成功')
      // 切换到列表标签页并刷新数据
      activeTab.value = 'list'
      getGuideRecordList()
      // 重置表单
      handleReset()
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  }
}

// 重置
const handleReset = () => {
  guideForm.studentId = null
  guideForm.topicName = ''
  guideForm.guidanceTime = formatCurrentTime()
  guideForm.guidanceContent = ''
}

onMounted(() => {
  getGuideRecordList()
  getStudentList()
})
</script>

<style scoped>
.task-book-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.guide-form {
  max-width: 600px;
  margin: 0 auto;
}

/* 表格文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}
</style>