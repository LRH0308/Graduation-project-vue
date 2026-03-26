<template>
  <div class="paper-audit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>论文审核</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="审阅状态">
          <el-select v-model="searchForm.adutisStatus" placeholder="请选择">
            <el-option label="待审阅" :value="0" />
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
      <el-table :data="paperList" v-loading="loading" border style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" />
        <el-table-column prop="studentAccount" label="学号" />
        <el-table-column prop="topicName" label="课题名称" />
        <el-table-column prop="submitTime" label="提交时间" />
        <el-table-column prop="adutisStatus" label="审阅状态">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.adutisStatus)">
              {{ getAuditStatusText(row.adutisStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duplicateCheckRate" label="查重率">
          <template #default="{ row }">
            {{ row.duplicateCheckRate ? row.duplicateCheckRate + '%' : '未查重' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button
              v-if="row.adutisStatus === 0"
              size="small"
              type="primary"
              @click="handleAudit(row)"
            >
              审核
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
        @size-change="getPaperList"
        @current-change="getPaperList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="论文详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">{{ currentPaper.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentPaper.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentPaper.topicName }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentPaper.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审阅状态">{{ getAuditStatusText(currentPaper.adutisStatus) }}</el-descriptions-item>
        <el-descriptions-item label="查重率">{{ currentPaper.duplicateCheckRate ? currentPaper.duplicateCheckRate + '%' : '未查重' }}</el-descriptions-item>
        <el-descriptions-item label="审阅意见" :span="2">
          {{ currentPaper.adutisRemark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-top: 20px;">
        <el-button type="primary" @click="downloadFile">下载论文</el-button>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" title="审核论文" width="500px">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审阅结果">
          <el-radio-group v-model="auditForm.adutisStatus">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审阅意见">
          <el-input
            v-model="auditForm.adutisRemark"
            type="textarea"
            :rows="4"
            placeholder="请输入审阅意见"
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
import { thesisApi } from '@/utils/apiRequest'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  adutisStatus: null
})

// 论文列表
const paperList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentPaper = ref({})

// 审核对话框
const auditDialogVisible = ref(false)
const auditForm = reactive({
  id: null,
  adutisStatus: 1,
  adutisRemark: ''
})

// 获取论文列表
const getPaperList = async () => {
  loading.value = true
  try {
    const response = await thesisApi.getThesisSubmission({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    
    if (response?.status === 'success') {
      paperList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      useMockData()
    }
  } catch (error) {
    console.error('获取论文列表失败:', error)
    ElMessage.error('获取论文列表失败')
    useMockData()
  } finally {
    loading.value = false
  }
}

// 使用模拟数据
const useMockData = () => {
  paperList.value = [
    {
      id: 1,
      studentName: '张三',
      studentAccount: '2020001',
      topicName: '基于 Spring Boot 的毕设管理系统',
      submitTime: '2025-05-01 10:00:00',
      adutisStatus: 0,
      adutisRemark: null,
      duplicateCheckRate: 15.5,
      fileId: 13
    }
  ]
  total.value = paperList.value.length
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getPaperList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.adutisStatus = null
  currentPage.value = 1
  getPaperList()
}

// 查看详情
const handleViewDetail = (row) => {
  currentPaper.value = row
  detailDialogVisible.value = true
}

// 审核
const handleAudit = (row) => {
  auditForm.id = row.id
  auditForm.adutisStatus = 1
  auditForm.adutisRemark = ''
  auditDialogVisible.value = true
}

// 提交审核
const submitAudit = async () => {
  try {
    const res = await thesisApi.teacherAudit(auditForm)
    if (res?.status === 'success') {
      ElMessage.success('审核成功')
      auditDialogVisible.value = false
      getPaperList()
    }
  } catch (error) {
    console.error('审核失败:', error)
  }
}

// 下载文件
const downloadFile = () => {
  if (currentPaper.value.fileId) {
    ElMessage.info('开始下载文件...')
    // TODO: 实现文件下载逻辑
  } else {
    ElMessage.warning('暂无可下载文件')
  }
}

// 获取状态文本
const getAuditStatusText = (status) => {
  const map = { 0: '待审阅', 1: '审阅通过', 2: '审阅驳回' }
  return map[status] || '未知'
}

// 获取状态类型
const getAuditStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

onMounted(() => {
  getPaperList()
})
</script>

<style scoped>
.paper-audit-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.search-form {
  margin-bottom: 20px;
}
</style>