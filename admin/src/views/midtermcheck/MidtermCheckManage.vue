<template>
  <div class="midterm-check-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>中期检查管理</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="80px" size="small" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="学生ID">
              <el-input v-model="searchForm.studentId" placeholder="请输入学生ID" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="导师ID">
              <el-input v-model="searchForm.teacherId" placeholder="请输入导师ID" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="审核状态">
              <el-select v-model="searchForm.auditStatus" placeholder="请选择" clearable>
                <el-option :value="0" label="待审核" />
                <el-option :value="1" label="审核通过" />
              </el-select>
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
        :data="midtermCheckList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="projectId" label="项目ID" width="80" />
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="studentAccount" label="学生学号" width="120" />
        <el-table-column prop="teacherName" label="指导教师" width="100" />
        <el-table-column prop="teacherAccount" label="教师工号" width="120" />
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.auditStatus)">
              {{ getAuditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditTime" label="审核时间" width="160" />
        <el-table-column prop="score" label="评分" width="80" />
        <el-table-column fixed="right" label="操作" width="120">
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
    <el-dialog v-model="detailDialogVisible" title="中期检查详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="检查ID">{{ currentMidtermCheck.id }}</el-descriptions-item>
        <el-descriptions-item label="项目ID">{{ currentMidtermCheck.projectId }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentMidtermCheck.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生学号">{{ currentMidtermCheck.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ currentMidtermCheck.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师工号">{{ currentMidtermCheck.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentMidtermCheck.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentMidtermCheck.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentMidtermCheck.auditTime || '未审核' }}</el-descriptions-item>
        <el-descriptions-item label="评分">{{ currentMidtermCheck.score || '无' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="审核备注">{{ currentMidtermCheck.auditRemark || '无' }}</el-descriptions-item>
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
  auditStatus: ''
})

// 数据列表
const midtermCheckList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentMidtermCheck = ref({})

// 获取中期检查列表
const getMidtermCheckList = async () => {
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
    
    const response = await post('/midtermCheck/getMidtermCheck', params)
    if (response?.status === 'success') {
      midtermCheckList.value = response.data?.list || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取中期检查列表失败:', error)
    ElMessage.error('获取中期检查列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getMidtermCheckList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getMidtermCheckList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getMidtermCheckList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getMidtermCheckList()
}

// 查看详情
const handleView = (row) => {
  currentMidtermCheck.value = { ...row }
  detailDialogVisible.value = true
}

// 状态文本映射
const getAuditStatusText = (status) => {
  const map = { 0: '待审核', 1: '审核通过' }
  return map[status] || '未知'
}

const getAuditStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success' }
  return map[status] || 'info'
}

onMounted(() => {
  getMidtermCheckList()
})
</script>

<style scoped>
.midterm-check-manage-container {
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