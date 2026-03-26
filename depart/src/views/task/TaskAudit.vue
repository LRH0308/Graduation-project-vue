<template>
  <div class="task-audit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务书审核</span>
          <el-button type="primary" @click="getTaskList" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.departAuditStatus" placeholder="请选择" clearable style="width: 150px;">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 任务书列表 -->
      <el-table :data="taskList" v-loading="loading" border stripe>
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentAccount" label="学号" width="120" />
        <el-table-column prop="teacherName" label="指导教师" width="120" />
        <el-table-column prop="projectName" label="课题名称" min-width="200" />
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column label="导师审核" width="100">
          <template #default="{ row }">
            <el-tag :type="getTeacherAuditStatusType(row.auditStatus)">
              {{ getTeacherAuditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="系主任审核" width="100">
          <template #default="{ row }">
            <el-tag :type="getDepartAuditStatusType(row.departAuditStatus)">
              {{ getDepartAuditStatusText(row.departAuditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
            <el-button 
              v-if="row.departAuditStatus === 0" 
              type="success" 
              size="small" 
              @click="handleAudit(row, 1)"
            >
              通过
            </el-button>
            <el-button 
              v-if="row.departAuditStatus === 0" 
              type="danger" 
              size="small" 
              @click="handleAudit(row, 2)"
            >
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="getTaskList"
        @size-change="getTaskList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" :title="auditTitle" width="500px">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核状态">
          <el-radio-group v-model="auditForm.departAuditStatus">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.departAuditRemark"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="任务书详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">{{ currentTask.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentTask.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ currentTask.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentTask.projectName }}</el-descriptions-item>
        <el-descriptions-item label="设计内容">{{ currentTask.content || '-' }}</el-descriptions-item>
        <el-descriptions-item label="设计目标">{{ currentTask.target || '-' }}</el-descriptions-item>
        <el-descriptions-item label="进度安排">{{ currentTask.schedule || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentTask.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="导师审核">{{ getTeacherAuditStatusText(currentTask.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="导师审核时间">{{ currentTask.auditTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="导师审核意见">{{ currentTask.auditRemark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="系主任审核">{{ getDepartAuditStatusText(currentTask.departAuditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="系主任审核时间">{{ currentTask.departAuditTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="系主任审核意见">{{ currentTask.departAuditRemark || '-' }}</el-descriptions-item>
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
import { taskBookApi } from '@/utils/apiRequest'
import { Refresh } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  departAuditStatus: ''
})

// 列表数据
const taskList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 审核对话框
const auditDialogVisible = ref(false)
const auditTitle = ref('任务书审核')
const submitLoading = ref(false)
const auditForm = reactive({
  id: null,
  departAuditStatus: 1,
  departAuditRemark: ''
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentTask = ref({})

// 获取任务书列表
const getTaskList = async () => {
  loading.value = true
  try {
    const response = await taskBookApi.getTaskBook({
      auditId: '', // 从 Token 自动获取
      departAuditStatus: searchForm.departAuditStatus !== '' ? searchForm.departAuditStatus : undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response?.status === 'success') {
      taskList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取任务书列表失败')
    }
  } catch (error) {
    console.error('获取任务书列表失败:', error)
    ElMessage.error('获取任务书列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getTaskList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.departAuditStatus = ''
  currentPage.value = 1
  getTaskList()
}

// 获取导师审核状态文本
const getTeacherAuditStatusText = (status) => {
  const map = { 1: '已通过', 2: '已驳回' }
  return map[status] || '未知'
}

// 获取导师审核状态类型
const getTeacherAuditStatusType = (status) => {
  const map = { 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

// 获取系主任审核状态文本
const getDepartAuditStatusText = (status) => {
  const map = { 0: '待审核', 1: '已通过', 2: '已驳回' }
  return map[status] || '未知'
}

// 获取系主任审核状态类型
const getDepartAuditStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

// 查看详情
const handleDetail = (row) => {
  currentTask.value = { ...row }
  detailDialogVisible.value = true
}

// 审核
const handleAudit = (row, status) => {
  auditForm.id = row.id
  auditForm.departAuditStatus = status
  auditForm.departAuditRemark = ''
  auditTitle.value = status === 1 ? '通过任务书' : '驳回任务书'
  auditDialogVisible.value = true
}

// 提交审核
const submitAudit = async () => {
  submitLoading.value = true
  try {
    const response = await taskBookApi.departApprove({
      id: auditForm.id,
      departAuditStatus: auditForm.departAuditStatus,
      departAuditRemark: auditForm.departAuditRemark
    })
    
    if (response?.status === 'success') {
      ElMessage.success('审核成功')
      auditDialogVisible.value = false
      getTaskList()
    } else {
      ElMessage.error('审核失败')
    }
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  getTaskList()
})
</script>

<style scoped>
.task-audit-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>