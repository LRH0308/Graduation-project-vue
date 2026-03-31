<template>
  <div class="thesis-final-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>论文终稿管理</span>
          <el-button type="primary" @click="getThesisFinalList" :loading="loading">
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
        <el-form-item label="状态">
          <el-select v-model="searchForm.finalStatus" placeholder="请选择" clearable style="width: 150px;">
            <el-option label="正常" :value="1" />
            <el-option label="已归档" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 论文终稿列表 -->
      <el-table :data="thesisFinalList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序列" width="60" />
        <el-table-column prop="projectName" label="选题" min-width="180" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentAccount" label="学生学号" width="120" />
        <el-table-column prop="teacherName" label="导师姓名" width="120" />
        <el-table-column prop="teacherAccount" label="导师工号" width="120" />
        <el-table-column prop="finalStatus" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getFinalStatusType(row.finalStatus)">
              {{ getFinalStatusText(row.finalStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="handleDetail(row)">
              详情
            </el-button>
            <el-button type="primary" size="small" @click="handleDownload(row.finalFileId, row.finalTitle)">
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
        @current-change="getThesisFinalList"
        @size-change="getThesisFinalList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="论文终稿详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="选题">{{ currentFinal.projectName }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ getFinalStatusText(currentFinal.finalStatus) }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentFinal.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentFinal.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生学号">{{ currentFinal.studentAccount }}</el-descriptions-item>
         <el-descriptions-item label="导师姓名">{{ currentFinal.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="导师工号">{{ currentFinal.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="论文标题">{{ currentFinal.finalTitle }}</el-descriptions-item>
        <el-descriptions-item label="关键词">{{ currentFinal.finalKeywords }}</el-descriptions-item>
        <el-descriptions-item label="摘要" :span="2">{{ currentFinal.finalAbstract }}</el-descriptions-item>
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
import { thesisFinalApi, fileApi } from '@/utils/apiRequest'
import { Refresh } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  finalStatus: ''
})

// 列表数据
const thesisFinalList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentFinal = ref({})

// 获取论文终稿列表
const getThesisFinalList = async () => {
  loading.value = true
  try {
    const response = await thesisFinalApi.getThesisFinalList({
      deptName: '', // 从 Token 自动获取
      studentName: searchForm.studentName || undefined,
      finalStatus: searchForm.finalStatus !== '' ? searchForm.finalStatus : undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response?.status === 'success') {
      thesisFinalList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取论文终稿列表失败')
    }
  } catch (error) {
    console.error('获取论文终稿列表失败:', error)
    ElMessage.error('获取论文终稿列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getThesisFinalList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.finalStatus = ''
  currentPage.value = 1
  getThesisFinalList()
}

// 获取终稿状态文本
const getFinalStatusText = (status) => {
  const map = { 1: '正常', 2: '已归档' }
  return map[status] || '未知'
}

// 获取终稿状态类型
const getFinalStatusType = (status) => {
  const map = { 1: 'success', 2: 'info' }
  return map[status] || 'info'
}

// 查看详情
const handleDetail = (row) => {
  currentFinal.value = { ...row }
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
  getThesisFinalList()
})
</script>

<style scoped>
.thesis-final-container {
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