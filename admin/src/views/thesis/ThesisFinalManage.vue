<template>
  <div class="thesis-final-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>论文终稿管理</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="80px" size="small" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="系部">
              <el-input v-model="searchForm.deptName" placeholder="请输入系部名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="导师">
              <el-input v-model="searchForm.teacherId" placeholder="请输入导师ID" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="学生">
              <el-input v-model="searchForm.studentId" placeholder="请输入学生ID" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="审核状态">
              <el-select v-model="searchForm.auditStatus" placeholder="请选择" clearable>
                <el-option :value="0" label="待审核" />
                <el-option :value="1" label="已通过" />
                <el-option :value="2" label="不通过" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" style="text-align: right;">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
      
      <!-- 数据表格 -->
      <el-table 
        :data="thesisFinalList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="projectName" label="项目名称" min-width="200" align="center" />
        <el-table-column prop="deptName" label="所属系部" width="120" align="center" />
        <el-table-column label="工号/导师名" width="150" align="center">
          <template #default="{ row }">
            {{ row.teacherAccount }}/{{ row.teacherName }}
          </template>
        </el-table-column>
        <el-table-column label="学号/学生名" width="150" align="center">
          <template #default="{ row }">
            {{ row.studentAccount ? `${row.studentAccount}/${row.studentName}` : '未分配' }}
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="160" align="center" />
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.finalStatus)">
              {{ getAuditStatusText(row.finalStatus) }}
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
    <el-dialog v-model="detailDialogVisible" title="论文终稿详情" width="800px">
      <!-- 论文终稿信息 -->
      <el-descriptions title="论文终稿信息" :column="2" border>
        <el-descriptions-item label="终稿ID">{{ currentThesisFinal.id }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentThesisFinal.deptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="项目ID">{{ currentThesisFinal.projectId }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ currentThesisFinal.projectName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="文件ID">{{ currentThesisFinal.finalFileId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="文件类型">{{ getFileTypeText(currentThesisFinal.fileType) }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentThesisFinal.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentThesisFinal.finalStatus) }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="查看链接">{{ currentThesisFinal.viewUrl || '无' }}</el-descriptions-item>
        <el-descriptions-item label="论文标题">{{ currentThesisFinal.finalTitle || '无' }}</el-descriptions-item>
        <el-descriptions-item label="关键词">{{ currentThesisFinal.finalKeywords || '无' }}</el-descriptions-item>
        <el-descriptions-item label="摘要">{{ currentThesisFinal.finalAbstract || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 导师信息 -->
      <el-descriptions title="导师信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="指导教师">{{ currentThesisFinal.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师账号">{{ currentThesisFinal.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="导师ID">{{ currentThesisFinal.teacherId }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 学生信息 -->
      <el-descriptions title="学生信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="学生">{{ currentThesisFinal.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生学号">{{ currentThesisFinal.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="学生ID">{{ currentThesisFinal.studentId }}</el-descriptions-item>
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
  deptName: '',
  teacherId: '',
  studentId: '',
  auditStatus: ''
})

// 数据列表
const thesisFinalList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentThesisFinal = ref({})

// 获取论文终稿列表
const getThesisFinalList = async () => {
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
    
    const response = await post('/ThesisFinal/getThesisFinalList', params)
    if (response?.status === 'success') {
      thesisFinalList.value = response.data?.records || []
      total.value = response.data?.total || 0
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
  getThesisFinalList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getThesisFinalList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getThesisFinalList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getThesisFinalList()
}

// 查看详情
const handleView = (row) => {
  currentThesisFinal.value = { ...row }
  detailDialogVisible.value = true
}

// 状态文本映射
const getAuditStatusText = (status) => {
  const map = { 0: '待审核', 1: '已通过', 2: '不通过' }
  return map[status] || '未知'
}

const getAuditStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const getFormatCheckStatusText = (status) => {
  const map = { 0: '待检查', 1: '通过', 2: '不通过' }
  return map[status] || '未知'
}

const getFormatCheckStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

// 文件类型文本映射
const getFileTypeText = (type) => {
  const map = { 1: '任务书', 2: '开题报告', 3: '中期成果', 4: '论文初稿', 5: '论文终稿', 6: '答辩材料' }
  return map[type] || '无'
}

onMounted(() => {
  getThesisFinalList()
})
</script>

<style scoped>
.thesis-final-manage-container {
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
</style>