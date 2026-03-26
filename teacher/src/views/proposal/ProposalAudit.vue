<template>
  <div class="proposal-audit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>开题报告审核</span>
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
      <el-table :data="proposalList" v-loading="loading" border style="width: 100%">
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
              v-if="row.auditStatus === 0"
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
        @size-change="getProposalList"
        @current-change="getProposalList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="开题报告详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">{{ currentProposal.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentProposal.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentProposal.topicName }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentProposal.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentProposal.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">
          {{ currentProposal.auditRemark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-top: 20px;">
        <el-button type="primary" @click="downloadFile">下载开题报告</el-button>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" title="审核开题报告" width="500px">
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
import { openingReportApi, fileApi } from '@/utils/apiRequest'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  auditStatus: null
})

// 开题报告列表
const proposalList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentProposal = ref({})

// 审核对话框
const auditDialogVisible = ref(false)
const auditForm = reactive({
  id: null,
  auditStatus: 1,
  auditRemark: ''
})

// 获取开题报告列表
const getProposalList = async () => {
  loading.value = true
  try {
    const response = await openingReportApi.getOpeningReport({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    
    if (response?.status === 'success') {
      proposalList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      useMockData()
    }
  } catch (error) {
    console.error('获取开题报告列表失败:', error)
    ElMessage.error('获取开题报告列表失败')
    useMockData()
  } finally {
    loading.value = false
  }
}

// 使用模拟数据
const useMockData = () => {
  proposalList.value = [
    {
      id: 1,
      studentName: '张三',
      studentAccount: '2020001',
      topicName: '基于 Spring Boot 的毕设管理系统',
      submitTime: '2025-03-10 14:00:00',
      auditStatus: 0,
      auditRemark: null,
      fileId: 11
    }
  ]
  total.value = proposalList.value.length
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getProposalList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.auditStatus = null
  currentPage.value = 1
  getProposalList()
}

// 查看详情
const handleViewDetail = (row) => {
  currentProposal.value = row
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
    const res = await openingReportApi.teacherAudit(auditForm)
    if (res?.status === 'success') {
      ElMessage.success('审核成功')
      auditDialogVisible.value = false
      getProposalList()
    }
  } catch (error) {
    console.error('审核失败:', error)
  }
}

// 下载文件
const downloadFile = () => {
  if (currentProposal.value.fileId) {
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
  getProposalList()
})
</script>

<style scoped>
.proposal-audit-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.search-form {
  margin-bottom: 20px;
}
</style>