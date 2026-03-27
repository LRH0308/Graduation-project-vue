<template>
  <div class="subject-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课题管理</span>
        </div>
      </template>
      
      <!-- 标签页 -->
      <el-tabs v-model="activeTab">
        <!-- 课题申请标签页 -->
        <el-tab-pane label="课题申请" name="apply">
          <el-form
            ref="topicFormRef"
            :model="topicForm"
            :rules="topicRules"
            label-width="100px"
            class="topic-form"
          >
            <el-form-item label="课题名称" prop="topicName">
              <el-input
                v-model="topicForm.topicName"
                placeholder="请输入课题名称"
              />
            </el-form-item>
            
            <el-form-item label="课题描述" prop="topicDesc">
              <el-input
                v-model="topicForm.topicDesc"
                type="textarea"
                :rows="4"
                placeholder="请输入课题描述"
              />
            </el-form-item>
            
            <el-form-item label="所属系部" prop="deptCode">
              <el-select
                v-model="topicForm.deptCode"
                placeholder="请选择系部"
                style="width: 100%;"
                :loading="deptLoading"
              >
                <el-option
                  v-for="dept in deptList"
                  :key="dept.value"
                  :label="dept.label"
                  :value="dept.value"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="毕业时间" prop="graduationTime">
              <el-input
                v-model="topicForm.graduationTime"
                placeholder="如：2026 届"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">提交申请</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 课题列表标签页 -->
        <el-tab-pane label="课题列表" name="list">
          <!-- 搜索表单 -->
          <el-form :model="searchForm" inline class="search-form">
            <el-form-item label="课题名称">
              <el-input v-model="searchForm.topicName" placeholder="请输入课题名称" />
            </el-form-item>
            <el-form-item label="毕业时间">
              <el-input v-model="searchForm.graduationTime" placeholder="如：2026 届" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
          
          <!-- 列表 -->
          <el-table :data="subjectList" v-loading="loading" border style="width: 100%">
            <el-table-column type="index" label="序列" width="80" />
            <el-table-column prop="topicName" label="课题名称" width="150" />
            <el-table-column prop="graduationTime" label="毕业时间" width="100" />
            <el-table-column prop="deptName" label="所属系部" width="100" />
            <el-table-column prop="applyStatus" label="审核状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getDeptAuditStatusType(row.applyStatus)">
                  {{ getDeptAuditStatusText(row.applyStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="系主任" width="150">
              <template #default="{ row }">
                {{ row.departmentheadAccount || '-' }}/{{ row.departmentheadName || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="applyStatusStudent" label="选题状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.applyStatusStudent ? 'success' : 'info'">
                  {{ row.applyStatusStudent ? '已选题' : '未选题' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="选题学生" width="150">
              <template #default="{ row }">
                {{ row.studentAccount || '-' }}/{{ row.studentName || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="publishStatus" label="发布状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getPublishStatusType(row.publishStatus)">
                  {{ getPublishStatusText(row.publishStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
                <el-button 
                  v-if="row.applyStatus === 1 && row.publishStatus === 0" 
                  size="small" 
                  type="primary" 
                  @click="handlePublish(row)"
                >
                  发布
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
            @size-change="getSubjectList"
            @current-change="getSubjectList"
            style="margin-top: 20px; text-align: right;"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="课题详情" width="700px">
      <!-- 选题信息 -->
      <div class="detail-section">
        <div class="section-title">选题信息</div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="课题名称">{{ currentSubject.topicName }}</el-descriptions-item>
          <el-descriptions-item label="课题描述">{{ currentSubject.topicDesc }}</el-descriptions-item>
          <el-descriptions-item label="研究内容">{{ currentSubject.researchContent || '无' }}</el-descriptions-item>
          <el-descriptions-item label="所属系部">{{ currentSubject.deptName }}</el-descriptions-item>
          <el-descriptions-item label="毕业时间">{{ currentSubject.graduationTime }}</el-descriptions-item>
          <el-descriptions-item label="课题申请时间">{{ currentSubject.applyTime }}</el-descriptions-item>
          <el-descriptions-item label="发布状态">
            <el-tag :type="getPublishStatusType(currentSubject.publishStatus)">
              {{ getPublishStatusText(currentSubject.publishStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ currentSubject.publishTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 导师信息 -->
      <div class="detail-section">
        <div class="section-title">导师信息</div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="指导教师">{{ currentSubject.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="教师工号">{{ currentSubject.teacherAccount }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 系主任信息 -->
      <div class="detail-section">
        <div class="section-title">系主任信息</div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getDeptAuditStatusType(currentSubject.applyStatus)">
              {{ getDeptAuditStatusText(currentSubject.applyStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="系主任">{{ currentSubject.departmentheadName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="系主任工号">{{ currentSubject.departmentheadAccount || '-' }}</el-descriptions-item>
          <el-descriptions-item label="系主任意见">{{ currentSubject.departmentheadOpinion || '无' }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ currentSubject.auditTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 学生信息 -->
      <div class="detail-section">
        <div class="section-title">学生信息</div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="选题状态">
            <el-tag :type="currentSubject.applyStatusStudent ? 'success' : 'info'">
              {{ currentSubject.applyStatusStudent ? '已选题' : '未选题' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="选题学生">{{ currentSubject.studentName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学生工号">{{ currentSubject.studentAccount || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学生申请时间">{{ currentSubject.studentApplyTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { topicApi } from '@/utils/apiRequest'

// 标签页
const activeTab = ref('list')

// 课题申请表单
const topicFormRef = ref(null)
const topicForm = reactive({
  topicName: '',
  topicDesc: '',
  deptCode: '',
  graduationTime: ''
})

// 院系列表
const deptList = ref([])
const deptLoading = ref(false)

const topicRules = {
  topicName: [
    { required: true, message: '请输入课题名称', trigger: 'blur' }
  ],
  topicDesc: [
    { required: true, message: '请输入课题描述', trigger: 'blur' }
  ],
  deptCode: [
    { required: true, message: '请选择系部', trigger: 'change' }
  ],
  graduationTime: [
    { required: true, message: '请输入毕业时间', trigger: 'blur' }
  ]
}

// 搜索表单
const searchForm = reactive({
  topicName: '',
  graduationTime: ''
})

// 课题列表数据
const subjectList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentSubject = ref({})

// 提交申请
const handleSubmit = async () => {
  if (!topicFormRef.value) return
  
  await topicFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      // 直接传递表单数据，不包装
      const res = await topicApi.apply(topicForm)
      if (res?.status === 'success') {
        ElMessage.success('申请提交成功')
        handleReset()
      }
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败，请重试')
    }
  })
}

// 重置
const handleReset = () => {
  topicForm.topicName = ''
  topicForm.topicDesc = ''
  topicForm.deptCode = ''
  topicForm.graduationTime = ''
  if (topicFormRef.value) {
    topicFormRef.value.clearValidate()
  }
}

// 获取课题列表
const getSubjectList = async () => {
  loading.value = true
  try {
    const response = await topicApi.getTopicSelection({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    })
    
    if (response?.status === 'success') {
      subjectList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取课题列表失败')
      subjectList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取课题列表失败:', error)
    ElMessage.error('获取课题列表失败')
    subjectList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getSubjectList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.topicName = ''
  searchForm.graduationTime = ''
  currentPage.value = 1
  getSubjectList()
}

// 查看详情
const handleViewDetail = (row) => {
  currentSubject.value = row
  detailDialogVisible.value = true
}

// 发布课题
const handlePublish = async (row) => {
  try {
    const res = await topicApi.publish(row.id)
    if (res?.status === 'success') {
      ElMessage.success('发布成功')
      getSubjectList()
    }
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败，请重试')
  }
}

// 获取系主任审核状态文本
const getDeptAuditStatusText = (status) => {
  const map = { 0: '待审核', 1: '通过', 2: '不通过' }
  return map[status] || '未知'
}

// 获取系主任审核状态类型
const getDeptAuditStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

// 获取发布状态文本
const getPublishStatusText = (status) => {
  const map = { 0: '未发布', 1: '已发布' }
  return map[status] || '未知'
}

// 获取发布状态类型
const getPublishStatusType = (status) => {
  const map = { 0: 'info', 1: 'success' }
  return map[status] || 'info'
}

// 获取院系列表
const getDeptList = async () => {
  deptLoading.value = true
  try {
    const response = await topicApi.getDept()
    if (response?.status === 'success' && response.data?.records) {
      // 过滤掉学院记录，只保留系记录（deptCode以DEP开头）
      // 并转换为label和value格式
      deptList.value = response.data.records
        .filter(dept => dept.deptCode.startsWith('DEP'))
        .map(dept => ({
          label: dept.deptName,
          value: dept.deptCode
        }))
    } else {
      ElMessage.error('获取院系列表失败')
    }
  } catch (error) {
    console.error('获取院系列表失败:', error)
    ElMessage.error('获取院系列表失败')
  } finally {
    deptLoading.value = false
  }
}

onMounted(() => {
  // 默认加载课题列表
  getSubjectList()
  // 获取院系列表
  getDeptList()
})
</script>

<style scoped>
.subject-manage-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.search-form {
  margin-bottom: 20px;
}

.topic-form {
  max-width: 600px;
  margin: 0 auto;
}

/* 课题列表文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}

/* 详情表标题列一行完整展示 */
:deep(.el-descriptions__label) {
  white-space: nowrap;
  min-width: 120px;
}

/* 确保详情表布局正确 */
:deep(.el-descriptions__row) {
  display: flex;
}

:deep(.el-descriptions__cell) {
  flex: 0 0 auto;
}

/* 详情分区块样式 */
.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}
</style>