<template>
  <div class="opening-report-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>开题报告管理</span>
          <el-button type="primary" @click="getOpeningReportList" :loading="loading">
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
      
      <!-- 开题报告列表 -->
      <el-table :data="openingReportList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序列" width="60" />
        <el-table-column prop="projectName" label="选题" width="180" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentAccount" label="学生学号" width="120" />
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column prop="auditStatus" label="审核状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.auditStatus)">
              {{ getAuditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="导师姓名" width="120" />
        <el-table-column prop="teacherAccount" label="导师工号" width="120" />
        <el-table-column prop="auditTime" label="审核时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="handleDetail(row)">
              详情
            </el-button>
            <el-button type="primary" size="small" @click="handleDownload(row.fileId, row.fileName)">
              下载
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
        @current-change="getOpeningReportList"
        @size-change="getOpeningReportList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="开题报告详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="选题">{{ currentReport.projectName }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentReport.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生学号">{{ currentReport.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentReport.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentReport.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="导师姓名">{{ currentReport.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="导师工号">{{ currentReport.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentReport.auditTime || '无' }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ currentReport.auditRemark || '无' }}</el-descriptions-item>
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
import { openingReportApi, fileApi } from '@/utils/apiRequest'
import { Refresh } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  auditStatus: ''
})

// 列表数据
const openingReportList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentReport = ref({})

// 获取开题报告列表
const getOpeningReportList = async () => {
  loading.value = true
  try {
    const response = await openingReportApi.getOpeningReport({
      deptName: '', // 从 Token 自动获取
      studentName: searchForm.studentName || undefined,
      auditStatus: searchForm.auditStatus !== '' ? searchForm.auditStatus : undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response?.status === 'success') {
      openingReportList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取开题报告列表失败')
    }
  } catch (error) {
    console.error('获取开题报告列表失败:', error)
    ElMessage.error('获取开题报告列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getOpeningReportList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.auditStatus = ''
  currentPage.value = 1
  getOpeningReportList()
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
  currentReport.value = { ...row }
  detailDialogVisible.value = true
}

// 下载文件
const handleDownload = async (fileId, fileName) => {
  if (!fileId) {
    ElMessage.error('文件ID不能为空')
    return
  }
  
  try {
    const response = await fileApi.download(fileId, {
      showLoading: true
    })
    
    if (response instanceof Blob) {
      // 创建下载链接
      const url = URL.createObjectURL(response)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      ElMessage.success('文件下载成功')
    } else {
      ElMessage.error('文件下载失败')
    }
  } catch (error) {
    console.error('文件下载失败:', error)
    ElMessage.error('文件下载失败')
  }
}

onMounted(() => {
  getOpeningReportList()
})
</script>

<style scoped>
.opening-report-container {
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

/* 列表文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}
</style>