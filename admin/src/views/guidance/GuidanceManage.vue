<template>
  <div class="guidance-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>过程指导管理</span>
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
            <el-form-item label="项目ID">
              <el-input v-model="searchForm.projectId" placeholder="请输入项目ID" clearable />
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
        :data="guidanceList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="deptName" label="所属系部" width="120" align="center" />
        <el-table-column prop="projectId" label="项目ID" width="80" align="center" />
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
        <el-table-column prop="guidanceTime" label="指导时间" width="160" align="center" />
        <el-table-column prop="feedbackTime" label="反馈时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.feedbackTime || '未反馈' }}
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
    <el-dialog v-model="detailDialogVisible" title="指导记录详情" width="800px">
      <!-- 指导记录信息 -->
      <el-descriptions title="指导记录信息" :column="2" border>
        <el-descriptions-item label="记录ID">{{ currentGuidance.id }}</el-descriptions-item>
        <el-descriptions-item label="项目ID">{{ currentGuidance.projectId }}</el-descriptions-item>
        <el-descriptions-item label="系部编号">{{ currentGuidance.deptCode || '无' }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentGuidance.deptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="指导时间">{{ currentGuidance.guidanceTime }}</el-descriptions-item>
        <el-descriptions-item label="反馈时间">{{ currentGuidance.feedbackTime || '未反馈' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="指导内容">{{ currentGuidance.guidanceContent || '无' }}</el-descriptions-item>
        <el-descriptions-item label="学生反馈">{{ currentGuidance.studentFeedback || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 导师信息 -->
      <el-descriptions title="导师信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="指导教师">{{ currentGuidance.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师账号">{{ currentGuidance.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="导师ID">{{ currentGuidance.teacherId }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 学生信息 -->
      <el-descriptions title="学生信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="学生">{{ currentGuidance.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生学号">{{ currentGuidance.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="学生ID">{{ currentGuidance.studentId }}</el-descriptions-item>
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
  deptName: '',
  projectId: ''
})

// 数据列表
const guidanceList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentGuidance = ref({})

// 获取指导记录列表
const getGuidanceList = async () => {
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
    
    const response = await post('/processGuidanceRecord/getProcessGuidanceRecord', params)
    if (response?.status === 'success') {
      guidanceList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取指导记录列表失败:', error)
    ElMessage.error('获取指导记录列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getGuidanceList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getGuidanceList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getGuidanceList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getGuidanceList()
}

// 查看详情
const handleView = (row) => {
  currentGuidance.value = { ...row }
  detailDialogVisible.value = true
}

onMounted(() => {
  getGuidanceList()
})
</script>

<style scoped>
.guidance-manage-container {
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

:deep(.el-table) {
  border-left: 1px solid #ebeef5;
}

:deep(.el-table th.el-table__cell:first-child),
:deep(.el-table td.el-table__cell:first-child) {
  border-left: 1px solid #ebeef5;
}
</style>