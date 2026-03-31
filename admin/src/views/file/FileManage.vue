<template>
  <div class="file-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文件管理</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="80px" size="small" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="文件名">
              <el-input v-model="searchForm.fileName" placeholder="请输入文件名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="文件类型">
              <el-select v-model="searchForm.fileType" placeholder="请选择文件类型" clearable>
                <el-option label="任务书" :value="1" />
                <el-option label="开题报告" :value="2" />
                <el-option label="中期成果" :value="3" />
                <el-option label="论文初稿" :value="4" />
                <el-option label="论文终稿" :value="5" />
                <el-option label="答辩材料" :value="6" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="上传人">
              <el-input v-model="searchForm.uploadName" placeholder="请输入上传人" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6" style="text-align: right;">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
      
      <!-- 数据表格 -->
      <el-table 
        :data="fileList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="fileName" label="文件名" min-width="200" align="center" />
        <el-table-column label="文件类型" width="120" align="center">
          <template #default="{ row }">
            {{ getFileTypeText(row.fileType) }}
          </template>
        </el-table-column>
        <el-table-column label="文件大小" width="120" align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="uploadName" label="上传人" width="100" align="center" />
        <el-table-column prop="uploadAccount" label="上传账号" width="120" align="center" />
        <el-table-column prop="uploadTime" label="上传时间" width="160" align="center" />
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.auditStatus)">
              {{ getAuditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="文件详情" width="800px">
      <!-- 文件信息 -->
      <el-descriptions title="文件信息" :column="2" border>
        <el-descriptions-item label="文件名">{{ currentFile.fileName }}</el-descriptions-item>
        <el-descriptions-item label="文件新名称">{{ currentFile.fileNewName }}</el-descriptions-item>
        <el-descriptions-item label="文件类型">{{ getFileTypeText(currentFile.fileType) }}</el-descriptions-item>
        <el-descriptions-item label="文件扩展名">{{ currentFile.fileExt }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ formatFileSize(currentFile.fileSize) }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ currentFile.uploadTime }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="文件路径">{{ currentFile.filePath || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 上传人信息 -->
      <el-descriptions title="上传人信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="上传人">{{ currentFile.uploadName }}</el-descriptions-item>
        <el-descriptions-item label="上传账号">{{ currentFile.uploadAccount }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 审核信息 -->
      <el-descriptions title="审核信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentFile.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentFile.auditTime || '未审核' }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ currentFile.auditName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="审核账号">{{ currentFile.auditAccount || '无' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="审核备注">{{ currentFile.auditRemark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 其他信息 -->
      <el-descriptions title="其他信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="查重率">{{ currentFile.duplicateCheckRate !== null ? currentFile.duplicateCheckRate + '%' : '无' }}</el-descriptions-item>
        <el-descriptions-item label="格式检查">{{ getFormatCheckStatusText(currentFile.formatCheckStatus) }}</el-descriptions-item>
        <el-descriptions-item label="归档状态">{{ currentFile.archived === 1 ? '已归档' : '未归档' }}</el-descriptions-item>
        <el-descriptions-item label="归档时间">{{ currentFile.archiveTime || '未归档' }}</el-descriptions-item>
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
import { post } from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  fileName: '',
  fileType: '',
  uploadName: ''
})

// 数据列表
const fileList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentFile = ref({})

// 获取文件列表
const getFileList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    }
    // 移除空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await post('/file/getFileListByCondition', params)
    if (response?.status === 'success') {
      fileList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取文件列表失败:', error)
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getFileList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getFileList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getFileList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getFileList()
}

// 查看详情
const handleView = (row) => {
  currentFile.value = { ...row }
  detailDialogVisible.value = true
}

// 文件类型文本映射
const getFileTypeText = (type) => {
  const map = { 1: '任务书', 2: '开题报告', 3: '中期成果', 4: '论文初稿', 5: '论文终稿', 6: '答辩材料' }
  return map[type] || '未知'
}

// 审核状态文本映射
const getAuditStatusText = (status) => {
  if (status === null || status === undefined) return '未审核'
  const map = { 0: '待审核', 1: '已通过', 2: '不通过' }
  return map[status] || '未知'
}

// 审核状态标签类型
const getAuditStatusType = (status) => {
  if (status === null || status === undefined) return 'info'
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

// 格式检查状态文本映射
const getFormatCheckStatusText = (status) => {
  if (status === null || status === undefined) return '无'
  const map = { 0: '待检查', 1: '通过', 2: '不通过' }
  return map[status] || '未知'
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size || size === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  let fileSize = size
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  return fileSize.toFixed(2) + ' ' + units[index]
}

onMounted(() => {
  getFileList()
})
</script>

<style scoped>
.file-manage-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.search-form {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

:deep(.el-table) {
  border-left: 1px solid #ebeef5;
}

:deep(.el-table th.el-table__cell:first-child),
:deep(.el-table td.el-table__cell:first-child) {
  border-left: 1px solid #ebeef5;
}
</style>
