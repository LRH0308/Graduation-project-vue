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
          <el-select v-model="searchForm.auditStatus" placeholder="请选择" clearable style="width: 150px;">
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
        <el-table-column type="index" label="序列" width="60" />
        <el-table-column label="学生" width="150">
          <template #default="{ row }">
            {{ row.studentAccount }}/{{ row.studentName }}
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="课题名称" min-width="200" />
        <el-table-column label="指导教师" width="120">
          <template #default="{ row }">
            {{ row.teacherAccount || '-' }}/{{ row.teacherName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.auditStatus)">
              {{ getAuditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditTime" label="审核时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
            <el-button 
              v-if="row.auditStatus === 0" 
              type="success" 
              size="small" 
              @click="handleAudit(row, 1)"
            >
              通过
            </el-button>
            <el-button 
              v-if="row.auditStatus === 0" 
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
          <el-radio-group v-model="auditForm.auditStatus">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.auditRemark"
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
    <el-dialog v-model="detailDialogVisible" title="任务书详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentTask.id }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentTask.projectName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="文件ID">{{ currentTask.fileId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentTask.deptName || '-' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider content-position="left">导师信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="导师工号">{{ currentTask.teacherAccount || '-' }}</el-descriptions-item>
        <el-descriptions-item label="导师姓名">{{ currentTask.teacherName || '-' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider content-position="left">学生信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="学号">{{ currentTask.studentAccount || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentTask.studentName || '-' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider content-position="left">任务书内容</el-divider>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="主要内容">{{ currentTask.content || '-' }}</el-descriptions-item>
        <el-descriptions-item label="参考文献">{{ currentTask.reference || '-' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider content-position="left">提交信息</el-divider>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="提交时间">{{ currentTask.submitTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider content-position="left">审核信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="审核人工号">{{ currentTask.auditAccount || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核人姓名">{{ currentTask.auditName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentTask.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentTask.auditTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ currentTask.auditRemark || '-' }}</el-descriptions-item>
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
  auditStatus: ''
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
  auditStatus: 1,
  auditRemark: ''
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
      auditStatus: searchForm.auditStatus !== '' ? searchForm.auditStatus : undefined,
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
  searchForm.auditStatus = ''
  currentPage.value = 1
  getTaskList()
}

// 获取审核状态文本
const getAuditStatusText = (status) => {
  const map = { 0: '待审核', 1: '已通过', 2: '已驳回' }
  return map[status] || '未知'
}

// 获取审核状态类型
const getAuditStatusType = (status) => {
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
  auditForm.auditStatus = status
  auditForm.auditRemark = ''
  auditTitle.value = status === 1 ? '通过任务书' : '驳回任务书'
  auditDialogVisible.value = true
}

// 提交审核
const submitAudit = async () => {
  submitLoading.value = true
  try {
    const response = await taskBookApi.departApprove({
      id: auditForm.id,
      auditStatus: auditForm.auditStatus,
      auditRemark: auditForm.auditRemark
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

/* 表格文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}
</style>