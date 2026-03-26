<template>
  <div class="task-book-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务书管理</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.auditStatus" placeholder="请选择">
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
        <el-table-column prop="studentName" label="学生姓名" />
        <el-table-column prop="studentAccount" label="学号" />
        <el-table-column prop="topicName" label="课题名称" />
        <el-table-column prop="submitTime" label="提交时间" />
        <el-table-column prop="auditStatus" label="审核状态">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.auditStatus)">
              {{ getAuditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button
              v-if="!row.id"
              size="small"
              type="primary"
              @click="handleApply(row)"
            >
              申请
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
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="任务书详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">{{ currentTaskBook.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentTaskBook.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentTaskBook.topicName }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentTaskBook.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentTaskBook.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">
          {{ currentTaskBook.auditRemark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-top: 20px;">
        <el-button type="primary" @click="downloadFile">下载任务书</el-button>
      </div>
      
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
      ...searchForm.value
    })
    
    if (response?.status === 'success') {
      taskBookList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      useMockData()
    }
  } catch (error) {
    console.error('获取任务书列表失败:', error)
    ElMessage.error('获取任务书列表失败')
    useMockData()
  } finally {
    loading.value = false
  }
}

// 使用模拟数据
const useMockData = () => {
  taskBookList.value = [
    {
      id: 1,
      studentName: '张三',
      studentAccount: '2020001',
      topicName: '基于 Spring Boot 的毕设管理系统',
      submitTime: '2025-03-01 10:00:00',
      auditStatus: 1,
      auditRemark: '任务书内容完整，同意通过',
      fileId: 10
    }
  ]
  total.value = taskBookList.value.length
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

// 申请任务书
const handleApply = (row) => {
  ElMessage.info('跳转到任务书申请页面')
  // TODO: 跳转到申请页面
}

// 下载文件
const downloadFile = () => {
  if (currentTaskBook.value.fileId) {
    ElMessage.info('开始下载文件...')
    // TODO: 实现文件下载逻辑
  } else {
    ElMessage.warning('暂无可下载文件')
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
</style>