<template>
  <div class="mid-audit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>中期检查审核</span>
        </div>
      </template>
      
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
      <el-table :data="midCheckList" v-loading="loading" border style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="学号/学生名" width="150">
          <template #default="{ row }">
            {{ row.studentAccount }}/{{ row.studentName }}
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="课题名称" />
        <el-table-column prop="submitTime" label="提交时间" width="160"/>
        <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.auditStatus)">
              {{ getAuditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditTime" label="审核时间" width="160"/>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button
              v-if="row.auditStatus === 0"
              size="small"
              type="primary"
              @click="handleAudit(row)"
            >
              审核
            </el-button>
            <el-button
              v-if="row.fileId"
              size="small"
              type="success"
              @click="downloadFileFromList(row)"
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
        @size-change="getMidCheckList"
        @current-change="getMidCheckList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="中期检查详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">{{ currentMidCheck.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentMidCheck.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="院系">{{ currentMidCheck.deptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentMidCheck.projectName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="导师">{{ currentMidCheck.teacherAccount }}/{{ currentMidCheck.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentMidCheck.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentMidCheck.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentMidCheck.auditTime || '无' }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">
          {{ currentMidCheck.auditRemark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-top: 20px;">
        <el-button type="primary" @click="downloadFile">下载中期检查</el-button>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" title="审核中期检查" width="500px">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
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
        <el-button type="primary" @click="submitAudit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { midtermCheckApi, fileApi } from '@/utils/apiRequest'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  auditStatus: null
})

// 中期检查列表
const midCheckList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentMidCheck = ref({})

// 审核对话框
const auditDialogVisible = ref(false)
const auditForm = reactive({
  id: null,
  auditStatus: 1,
  auditRemark: ''
})

// 获取中期检查列表
const getMidCheckList = async () => {
  loading.value = true
  try {
    const response = await midtermCheckApi.getMidtermCheck({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    
    if (response?.status === 'success') {
      midCheckList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      midCheckList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取中期检查列表失败:', error)
    ElMessage.error('获取中期检查列表失败')
    midCheckList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getMidCheckList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.auditStatus = null
  currentPage.value = 1
  getMidCheckList()
}

// 查看详情
const handleViewDetail = (row) => {
  currentMidCheck.value = row
  detailDialogVisible.value = true
}

// 审核
const handleAudit = (row) => {
  auditForm.id = row.id
  auditForm.auditStatus = 1
  auditForm.auditRemark = ''
  auditDialogVisible.value = true
}

// 提交审核
const submitAudit = async () => {
  try {
    const res = await midtermCheckApi.teacherAudit(auditForm)
    if (res?.status === 'success') {
      ElMessage.success('审核成功')
      auditDialogVisible.value = false
      getMidCheckList()
    }
  } catch (error) {
    console.error('审核失败:', error)
  }
}

// 下载文件
const downloadFile = async () => {
  if (!currentMidCheck.value.fileId) {
    ElMessage.warning('暂无可下载文件')
    return
  }
  
  try {
    ElMessage.info('正在下载文件...')
    // 获取文件详情
    const detailRes = await fileApi.getFileDetail(currentMidCheck.value.fileId)
    if (detailRes?.code !== 200 || !detailRes.data) {
      ElMessage.error('获取文件信息失败')
      return
    }
    
    const fileInfo = detailRes.data
    
    // 下载文件
    const response = await fileApi.download(currentMidCheck.value.fileId)
    
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

// 从列表下载文件
const downloadFileFromList = async (row) => {
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
  getMidCheckList()
})
</script>

<style scoped>
.mid-audit-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
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
