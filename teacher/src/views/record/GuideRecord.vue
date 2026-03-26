<template>
  <div class="guide-record-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>过程指导记录</span>
          <el-button type="primary" @click="handleFill">填写指导记录</el-button>
        </div>
      </template>
      
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
        <el-table-column prop="studentName" label="学生姓名" />
        <el-table-column prop="studentAccount" label="学号" />
        <el-table-column prop="topicName" label="课题名称" />
        <el-table-column prop="guidanceTime" label="指导时间" />
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
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="指导记录详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">{{ currentRecord.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentRecord.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentRecord.topicName }}</el-descriptions-item>
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

// 获取指导记录列表
const getGuideRecordList = async () => {
  loading.value = true
  try {
    const response = await guidanceApi.getProcessGuidanceRecord({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
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

// 填写指导记录
const handleFill = () => {
  router.push('/record/guide-fill')
}

onMounted(() => {
  getGuideRecordList()
})
</script>

<style scoped>
.guide-record-container {
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