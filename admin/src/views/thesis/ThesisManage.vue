<template>
  <div class="thesis-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>论文提交管理</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="学生 ID">
          <el-input v-model="searchForm.studentId" placeholder="请输入学生 ID" clearable />
        </el-form-item>
        <el-form-item label="教师 ID">
          <el-input v-model="searchForm.teacherId" placeholder="请输入教师 ID" clearable />
        </el-form-item>
        <el-form-item label="审阅状态">
          <el-select v-model="searchForm.adutisStatus" placeholder="请选择" clearable>
            <el-option label="待审阅" :value="0" />
            <el-option label="审阅通过" :value="1" />
            <el-option label="审阅驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="查重状态">
          <el-select v-model="searchForm.duplicateCheckStatus" placeholder="请选择" clearable>
            <el-option label="未查重" :value="0" />
            <el-option label="查重完成" :value="1" />
            <el-option label="查重失败" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 数据表格 -->
      <el-table :data="thesisList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="projectId" label="项目 ID" width="100" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentAccount" label="学号" width="130" />
        <el-table-column prop="teacherName" label="指导教师" width="120" />
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column prop="adutisStatus" label="审阅状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.adutisStatus)">
              {{ getAuditStatusText(row.adutisStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duplicateCheckStatus" label="查重状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getCheckStatusType(row.duplicateCheckStatus)">
              {{ getCheckStatusText(row.duplicateCheckStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duplicateCheckRate" label="查重率" width="100">
          <template #default="{ row }">
            {{ row.duplicateCheckRate ? row.duplicateCheckRate + '%' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
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
    <el-dialog v-model="detailDialogVisible" title="论文提交详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="提交 ID">{{ currentThesis.id }}</el-descriptions-item>
        <el-descriptions-item label="项目 ID">{{ currentThesis.projectId }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentThesis.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生学号">{{ currentThesis.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ currentThesis.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师工号">{{ currentThesis.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentThesis.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审阅状态">{{ getAuditStatusText(currentThesis.adutisStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审阅时间">{{ currentThesis.adutisTime || '未审阅' }}</el-descriptions-item>
        <el-descriptions-item label="查重状态">{{ getCheckStatusText(currentThesis.duplicateCheckStatus) }}</el-descriptions-item>
        <el-descriptions-item label="查重率">{{ currentThesis.duplicateCheckRate ? currentThesis.duplicateCheckRate + '%' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="格式检查">{{ getFormatStatusText(currentThesis.formatCheckStatus) }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="审阅备注">{{ currentThesis.adutisRemark || '无' }}</el-descriptions-item>
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
  studentId: '',
  teacherId: '',
  adutisStatus: '',
  duplicateCheckStatus: ''
})

// 数据列表
const thesisList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentThesis = ref({})

// 获取论文提交列表
const getThesisList = async () => {
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
    
    const response = await post('/ThesisSubmission/getThesisSubmission', params)
    if (response?.status === 'success') {
      thesisList.value = response.data?.list || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取论文提交列表失败:', error)
    ElMessage.error('获取论文提交列表失败')
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
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getThesisList()
}

// 分页处理
const handleSizeChange = () => {
  getThesisList()
}

const handleCurrentChange = () => {
  getThesisList()
}

// 查看详情
const handleView = (row) => {
  currentThesis.value = row
  detailDialogVisible.value = true
}

// 状态文本映射
const getAuditStatusText = (status) => {
  const map = { 0: '待审阅', 1: '审阅通过', 2: '审阅驳回' }
  return map[status] || '未知'
}

const getAuditStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const getCheckStatusText = (status) => {
  const map = { 0: '未查重', 1: '查重完成', 2: '查重失败' }
  return map[status] || '未知'
}

const getCheckStatusType = (status) => {
  const map = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const getFormatStatusText = (status) => {
  const map = { 0: '未检查', 1: '格式合格', 2: '格式不合格' }
  return map[status] || '未知'
}

onMounted(() => {
  getThesisList()
})
</script>

<style scoped>
.thesis-manage-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.search-form {
  margin-bottom: 20px;
}
</style>