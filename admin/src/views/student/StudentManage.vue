<template>
  <div class="student-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学生管理</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="80px" size="small" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="学号">
              <el-input v-model="searchForm.studentAccount" placeholder="请输入学号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="姓名">
              <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="系部">
              <el-input v-model="searchForm.deptName" placeholder="请输入系部" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="班级">
              <el-input v-model="searchForm.className" placeholder="请输入班级" clearable />
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
        :data="studentList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="studentAccount" label="学号" width="120" align="center" />
        <el-table-column prop="name" label="姓名" width="100" align="center" />
        <el-table-column prop="deptName" label="所属系部" width="160" align="center" />
        <el-table-column prop="className" label="班级" width="120" align="center" />
        <el-table-column prop="topicName" label="课题名称" min-width="200" align="center" />
        <el-table-column prop="graduationTime" label="毕业时间" width="100" align="center" />
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
    <el-dialog v-model="detailDialogVisible" title="学生详情" width="800px">
      <!-- 学生信息 -->
      <el-descriptions title="学生信息" :column="2" border>
        <el-descriptions-item label="学号">{{ currentStudent.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentStudent.name }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentStudent.deptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ currentStudent.className || '无' }}</el-descriptions-item>
        <el-descriptions-item label="毕业时间">{{ currentStudent.graduationTime || '无' }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{ currentStudent.collegeName || '无' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="课题名称">{{ currentStudent.topicName || '无' }}</el-descriptions-item>
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
  studentAccount: '',
  name: '',
  deptName: '',
  className: ''
})

// 数据列表
const studentList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentStudent = ref({})

// 获取学生列表
const getStudentList = async () => {
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
    
    const response = await post('/student/getStudentInfo', params)
    if (response?.status === 'success') {
      studentList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getStudentList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getStudentList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getStudentList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getStudentList()
}

// 查看详情
const handleView = (row) => {
  currentStudent.value = { ...row }
  detailDialogVisible.value = true
}

onMounted(() => {
  getStudentList()
})
</script>

<style scoped>
.student-manage-container {
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
