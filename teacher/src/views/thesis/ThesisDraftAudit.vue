<template>
  <div class="thesis-draft-audit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>论文初稿审核</span>
          <el-button type="primary" @click="handleSetThreshold">设置查重率阈值</el-button>
        </div>
      </template>
      
      <!-- 查重率阈值提示 -->
      <el-alert
        v-if="maxAllowRate !== null"
        title="查重率要求"
        type="info"
        :closable="false"
        show-icon
        class="rate-alert"
      >
        <template #default>
          当前设置的最大查重率为：
          <span class="rate-value">{{ maxAllowRate }}%</span>
          ，超过该阈值的论文初稿将被标记
        </template>
      </el-alert>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="学生">
          <el-select v-model="searchForm.studentId" placeholder="请选择学生" style="width: 200px;">
            <el-option label="全部学生" :value="null" />
            <el-option
              v-for="student in studentList"
              :key="student.studentId"
              :label="student.studentName + ' (' + student.studentAccount + ') '"
              :value="student.studentId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.adutisStatus" placeholder="请选择" style="width: 150px;">
            <el-option label="待审核" :value="0" />
            <el-option label="通过" :value="1" />
            <el-option label="驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 列表 -->
      <el-table :data="thesisList" v-loading="loading" border style="width: 100%" class="center-table">
        <el-table-column prop="id" label="序号" width="80" />
        <el-table-column prop="version" label="版本号" width="80" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentAccount" label="学号" width="120" />
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column prop="adutisStatus" label="审核状态" width="100">
          <template #default="scope">
            <el-tag :type="getAuditStatusType(scope.row.adutisStatus)">
              {{ getAuditStatusText(scope.row.adutisStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duplicateCheckRate" label="查重率" width="100">
          <template #default="scope">
            <span :class="getRateClass(scope.row.duplicateCheckRate)">
              {{ scope.row.duplicateCheckRate ? scope.row.duplicateCheckRate + '%' : '未查重' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="formatCheckStatus" label="格式审核" width="100">
          <template #default="scope">
            <el-tag :type="getFormatCheckStatusType(scope.row.formatCheckStatus)">
              {{ getFormatCheckStatusText(scope.row.formatCheckStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button
              v-if="scope.row.adutisStatus === 0"
              size="small"
              type="primary"
              @click="handleAudit(scope.row)"
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
        @size-change="getThesisList"
        @current-change="getThesisList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="论文初稿详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="版本号">{{ currentThesis.version || '-' }}</el-descriptions-item>
        <el-descriptions-item label="系部名称">{{ currentThesis.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentThesis.studentName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentThesis.studentAccount || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentThesis.submitTime || '-' }}</el-descriptions-item>
         <el-descriptions-item label="查重率">
          <span :class="getRateClass(currentThesis.duplicateCheckRate)">
            {{ currentThesis.duplicateCheckRate ? currentThesis.duplicateCheckRate + '%' : '未查重' }}
          </span>
          <el-tag
            v-if="currentThesis.duplicateCheckRate !== null && maxAllowRate !== null"
            :type="currentThesis.duplicateCheckRate <= maxAllowRate ? 'success' : 'danger'"
            size="small"
            style="margin-left: 8px"
          >
            {{ currentThesis.duplicateCheckRate <= maxAllowRate ? '符合要求' : '超出阈值' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="查重时间">{{ currentThesis.duplicateCheckTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="格式检查状态">
          <el-tag :type="getFormatCheckStatusType(currentThesis.formatCheckStatus)">
            {{ getFormatCheckStatusText(currentThesis.formatCheckStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="格式检查时间">{{ currentThesis.formatCheckTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getAuditStatusType(currentThesis.adutisStatus)">
            {{ getAuditStatusText(currentThesis.adutisStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentThesis.adutisTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核意见">{{ currentThesis.adutisRemark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-top: 20px;">
        <el-button type="primary" @click="handleDownload(currentThesis)">下载论文初稿</el-button>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" title="审核论文初稿" width="500px">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.adutisStatus">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="格式审核">
          <el-radio-group v-model="auditForm.formatCheckStatus">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.adutisRemark"
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
    
    <!-- 查重率阈值设置对话框 -->
    <el-dialog v-model="thresholdDialogVisible" title="设置查重率阈值" width="400px">
      <el-form :model="thresholdForm" label-width="120px">
        <el-form-item label="最大允许查重率" prop="maxAllowRate">
          <el-input
            v-model="thresholdForm.maxAllowRate"
            type="number"
            placeholder="请输入最大允许查重率"
            min="0"
            max="100"
            step="0.1"
          >
            <template #append>%</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="thresholdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitThreshold">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { thesisDraftApi, fileApi, guidanceRelationApi } from '@/utils/apiRequest'

// 搜索表单
const searchForm = reactive({
  studentId: null,
  studentName: '',
  adutisStatus: null
})

// 学生列表
const studentList = ref([])

// 论文初稿列表
const thesisList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentThesis = ref({})

// 审核对话框
const auditDialogVisible = ref(false)
const auditForm = reactive({
  id: null,
  studentId: null,
  teacherId: null,
  adutisStatus: 1,
  formatCheckStatus: 1,
  adutisRemark: ''
})

// 查重率阈值
const maxAllowRate = ref(null)
const thresholdDialogVisible = ref(false)
const thresholdForm = reactive({
  maxAllowRate: ''
})

// 获取学生列表
const getStudentList = async () => {
  try {
    // 这里假设使用指导关系接口获取学生列表
    const response = await guidanceRelationApi.getGuidanceRelation({})
    if (response?.status === 'success' && response.code === 200) {
      studentList.value = response.data?.records || response.data?.list || []
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
  }
}

// 获取论文初稿列表
const getThesisList = async () => {
  loading.value = true
  try {
    const response = await thesisDraftApi.getThesisDraft({
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
    console.error('获取论文初稿列表失败:', error)
    ElMessage.error('获取论文初稿列表失败')
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
  searchForm.studentId = null
  searchForm.studentName = ''
  searchForm.adutisStatus = null
  currentPage.value = 1
  getThesisList()
}

// 查看详情
const handleViewDetail = (row) => {
  currentThesis.value = row
  detailDialogVisible.value = true
}

// 审核
const handleAudit = (row) => {
  auditForm.id = row.id
  auditForm.studentId = row.studentId
  auditForm.teacherId = row.teacherId
  auditForm.adutisStatus = 1
  auditForm.adutisRemark = ''
  auditDialogVisible.value = true
}

// 提交审核
const submitAudit = async () => {
  try {
    const res = await thesisDraftApi.teacherAudit(auditForm)
    if (res?.status === 'success' && res.code === 200) {
      ElMessage.success('审核成功')
      auditDialogVisible.value = false
      getThesisList()
    } else {
      ElMessage.error(res?.info || '审核失败')
    }
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败，请重试')
  }
}

// 下载文件
const handleDownload = async (row) => {
  if (!row.fileId) {
    ElMessage.warning('暂无可下载文件')
    return
  }

  try {
    ElMessage.info('开始下载文件...')
    const response = await fileApi.download(row.fileId, {
      showLoading: true,
    })

    // 创建下载链接
    const blob = new Blob([response])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = row.fileName || '论文初稿.docx'
    link.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

// 获取审核状态文本
const getAuditStatusText = (status) => {
  const map = { 0: '待审核', 1: '通过', 2: '驳回' }
  return map[status] || '未知'
}

// 获取审核状态类型
const getAuditStatusType = (status) => {
  const map = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

// 获取查重率样式类
const getRateClass = (rate) => {
  if (!rate) return ''
  if (maxAllowRate.value === null) return ''
  return rate <= maxAllowRate.value ? 'rate-pass' : 'rate-fail'
}

// 获取格式审核状态文本
const getFormatCheckStatusText = (status) => {
  const map = { 0: '待审核', 1: '通过', 2: '不通过' }
  return map[status] || '未知'
}

// 获取格式审核状态类型
const getFormatCheckStatusType = (status) => {
  const map = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

// 获取查重率阈值
const getMaxAllowRate = async () => {
  try {
    const response = await thesisDraftApi.getDuplicateCheckThreshold({})
    if (response?.status === 'success' && response.code === 200) {
      maxAllowRate.value = response.data?.maxAllowRate ?? null
    }
  } catch (error) {
    console.error('获取查重率阈值失败:', error)
  }
}

// 处理设置阈值
const handleSetThreshold = () => {
  thresholdForm.maxAllowRate = maxAllowRate.value || ''
  thresholdDialogVisible.value = true
}

// 提交阈值设置
const submitThreshold = async () => {
  if (!thresholdForm.maxAllowRate) {
    ElMessage.warning('请输入查重率阈值')
    return
  }

  try {
    const response = await thesisDraftApi.setDuplicateCheckThreshold({
      maxAllowRate: parseFloat(thresholdForm.maxAllowRate)
    })
    if (response?.status === 'success' && response.code === 200) {
      ElMessage.success('设置成功')
      thresholdDialogVisible.value = false
      getMaxAllowRate()
    } else {
      ElMessage.error(response?.info || '设置失败')
    }
  } catch (error) {
    console.error('设置查重率阈值失败:', error)
    ElMessage.error('设置失败，请重试')
  }
}

onMounted(() => {
  getStudentList()
  getMaxAllowRate()
  getThesisList()
})
</script>

<style scoped>
.thesis-draft-audit-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

.search-form {
  margin-bottom: 20px;
}

.rate-alert {
  margin-bottom: 20px;
}

.rate-value {
  font-weight: bold;
  color: #f56c6c;
  font-size: 16px;
}

/* 表格文字居中 */
.center-table :deep(.el-table__cell) {
  text-align: center;
}

/* 查重率样式 */
.rate-pass {
  color: #67c23a;
  font-weight: bold;
}

.rate-fail {
  color: #f56c6c;
  font-weight: bold;
}
</style>