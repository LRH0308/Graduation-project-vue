<template>
  <div class="task-book-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>论文终稿审核</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.finalStatus" placeholder="请选择" style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="已归档" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 列表 -->
      <el-table :data="thesisList" v-loading="loading" border style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="学号/学生" width="150">
          <template #default="scope">
            {{ scope.row.studentAccount }}/{{ scope.row.studentName }}
          </template>
        </el-table-column>
        <el-table-column prop="finalTitle" label="论文标题" />
        <el-table-column prop="submitTime" label="提交时间" width="180"/>
        <el-table-column prop="finalStatus" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.finalStatus)">
              {{ getStatusText(scope.row.finalStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button size="small" type="success" @click="handleDownload(scope.row)">下载</el-button>
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
        @size-change="getThesisList"
        @current-change="getThesisList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="论文终稿详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学号/学生">
          {{ currentThesis.studentAccount || '-' }}/{{ currentThesis.studentName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="论文标题">{{ currentThesis.finalTitle || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关键词">{{ currentThesis.finalKeywords || '-' }}</el-descriptions-item>
        <el-descriptions-item label="摘要" :span="2">{{ currentThesis.finalAbstract || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ getStatusText(currentThesis.finalStatus) }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentThesis.submitTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-top: 20px;">
        <el-button type="primary" @click="handleDownload(currentThesis)">下载论文终稿</el-button>
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
import { thesisFinalApi, fileApi } from '@/utils/apiRequest'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  finalStatus: null
})

// 论文终稿列表
const thesisList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentThesis = ref({})

// 获取论文终稿列表
const getThesisList = async () => {
  loading.value = true
  try {
    const response = await thesisFinalApi.getThesisFinalList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    })
    
    if (response?.status === 'success' && response.code === 200) {
      thesisList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      thesisList.value = []
      total.value = 0
      ElMessage.warning('暂无数据')
    }
  } catch (error) {
    console.error('获取论文终稿列表失败:', error)
    ElMessage.error('获取论文终稿列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getThesisList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.finalStatus = null
  currentPage.value = 1
  getThesisList()
}

// 查看详情
const handleViewDetail = (row) => {
  currentThesis.value = row
  detailDialogVisible.value = true
}

// 下载文件
const handleDownload = async (row) => {
  if (!row.finalFileId) {
    ElMessage.warning('暂无可下载文件')
    return
  }

  try {
    ElMessage.info('开始下载文件...')
    const response = await fileApi.download(row.finalFileId, {
      showLoading: true,
    })

    // 创建下载链接
    const blob = new Blob([response])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = row.finalTitle || '论文终稿.docx'
    link.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}



// 获取状态文本
const getStatusText = (status) => {
  const map = { 1: '正常', 2: '已归档' }
  return map[status] || '未知'
}

// 获取状态类型
const getStatusType = (status) => {
  const map = { 1: 'success', 2: 'info' }
  return map[status] || 'info'
}

onMounted(() => {
  getThesisList()
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

/* 表格文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}
</style>