<template>
  <div class="topic-audit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课题审核</span>
          <el-button type="primary" @click="getTopicList" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="课题名称">
          <el-input v-model="searchForm.topicName" placeholder="请输入课题名称" clearable />
        </el-form-item>
        <el-form-item label="毕业时间">
          <el-input v-model="searchForm.graduationTime" placeholder="如：2026" clearable />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.applyStatus" placeholder="请选择" clearable style="width: 150px;">
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
      
      <!-- 课题列表 -->
      <el-table :data="topicList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序列" width="80" />
        <el-table-column prop="topicName" label="课题名称" min-width="200" />
        <el-table-column prop="graduationTime" label="毕业时间" width="100" />
        <el-table-column label="指导教师">
          <template #default="{ row }">
            {{ row.teacherAccount || '-' }}/{{ row.teacherName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="deptName" label="所属系部" width="120" />
        <el-table-column prop="applyStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.applyStatus)">
              {{ getAuditStatusText(row.applyStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditTime" label="审核时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
            <el-button 
              v-if="row.applyStatus === 0" 
              type="success" 
              size="small" 
              @click="handleAudit(row, 1)"
            >
              通过
            </el-button>
            <el-button 
              v-if="row.applyStatus === 0" 
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
        @current-change="getTopicList"
        @size-change="getTopicList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" :title="auditTitle" width="500px">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核状态">
          <el-radio-group v-model="auditForm.applyStatus">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.departmentheadOpinion"
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
    <el-dialog v-model="detailDialogVisible" title="课题详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="课题名称">{{ currentTopic.topicName }}</el-descriptions-item>
        <el-descriptions-item label="课题描述">{{ currentTopic.topicDesc }}</el-descriptions-item>
        <el-descriptions-item label="研究内容" :span="2">{{ currentTopic.researchContent || '无' }}</el-descriptions-item>
        <el-descriptions-item label="毕业时间">{{ currentTopic.graduationTime }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentTopic.deptName }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">{{ getPublishStatusText(currentTopic.publishStatus) }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentTopic.publishTime || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider content-position="left">导师信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="导师姓名">{{ currentTopic.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="导师工号">{{ currentTopic.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentTopic.applyTime || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider content-position="left">系主任审核信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="系主任">{{ currentTopic.departmentheadName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="系主任工号">{{ currentTopic.departmentheadAccount || '无' }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentTopic.applyStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentTopic.auditTime || '无' }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ currentTopic.departmentheadOpinion || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider content-position="left">学生选题信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="选题状态">{{ currentTopic.applyStatusStudent ? '已选题' : '未选题' }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentTopic.studentName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="学生工号">{{ currentTopic.studentAccount || '无' }}</el-descriptions-item>
        <el-descriptions-item label="学生申请时间">{{ currentTopic.studentApplyTime || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { topicApi } from '@/utils/apiRequest'
import { Refresh } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  topicName: '',
  graduationTime: '',
  applyStatus: ''
})

// 列表数据
const topicList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 审核对话框
const auditDialogVisible = ref(false)
const auditTitle = ref('课题审核')
const submitLoading = ref(false)
const auditForm = reactive({
  id: null,
  applyStatus: 1,
  departmentheadOpinion: ''
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentTopic = ref({})

// 获取课题列表
const getTopicList = async () => {
  loading.value = true
  try {
    const response = await topicApi.getTopicSelection({
      teacherId: '', // 从 Token 自动获取
      graduationTime: searchForm.graduationTime || undefined,
      topicName: searchForm.topicName || undefined,
      applyStatus: searchForm.applyStatus !== '' ? searchForm.applyStatus : undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response?.status === 'success') {
      topicList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取课题列表失败')
    }
  } catch (error) {
    console.error('获取课题列表失败:', error)
    ElMessage.error('获取课题列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getTopicList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.topicName = ''
  searchForm.graduationTime = ''
  searchForm.applyStatus = ''
  currentPage.value = 1
  getTopicList()
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

// 获取发布状态文本
const getPublishStatusText = (status) => {
  const map = { 0: '未发布', 1: '已发布' }
  return map[status] || '未知'
}

// 获取发布状态类型
const getPublishStatusType = (status) => {
  const map = { 0: 'info', 1: 'success' }
  return map[status] || 'info'
}

// 查看详情
const handleDetail = (row) => {
  currentTopic.value = { ...row }
  detailDialogVisible.value = true
}

// 审核
const handleAudit = (row, status) => {
  auditForm.id = row.id
  auditForm.applyStatus = status
  auditForm.departmentheadOpinion = ''
  auditTitle.value = status === 1 ? '通过课题' : '驳回课题'
  auditDialogVisible.value = true
}

// 提交审核
const submitAudit = async () => {
  // 校验字段
  if (!auditForm.id) {
    ElMessage.error('课题ID不能为空')
    return
  }
  if (!auditForm.departmentheadOpinion || auditForm.departmentheadOpinion.trim() === '') {
    ElMessage.error('审核意见不能为空')
    return
  }
  if (auditForm.applyStatus === null || auditForm.applyStatus === undefined) {
    ElMessage.error('审核状态不能为空')
    return
  }

  submitLoading.value = true
  try {
    // 使用表单数据格式提交
    const formData = new URLSearchParams()
    formData.append('id', auditForm.id)
    formData.append('applyStatus', auditForm.applyStatus)
    formData.append('departmentheadOpinion', auditForm.departmentheadOpinion)
    
    const response = await topicApi.approve(formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    if (response?.status === 'success') {
      ElMessage.success('审核成功')
      auditDialogVisible.value = false
      getTopicList()
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
  getTopicList()
})
</script>

<style scoped>
.topic-audit-container {
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

/* 课题列表文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}

/* 详情表标题列一行完整展示 */
:deep(.el-descriptions__label) {
  white-space: nowrap;
  min-width: 120px;
}

/* 确保详情表布局正确 */
:deep(.el-descriptions__row) {
  display: flex;
}

:deep(.el-descriptions__cell) {
  flex: 0 0 auto;
}
</style>