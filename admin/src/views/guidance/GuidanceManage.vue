<template>
  <div class="guidance-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>过程指导管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">新增指导记录</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedGuidances.length === 0">批量删除</el-button>
          </div>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
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
        <el-table-column fixed="right" label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
            <el-button size="small" type="success" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
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
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑指导记录' : '新增指导记录'" width="800px">
      <el-form :model="formData" label-width="100px" size="small" :rules="formRules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目ID" prop="projectId">
              <el-input v-model="formData.projectId" placeholder="请输入项目ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系部编号" prop="deptCode">
              <el-input v-model="formData.deptCode" placeholder="请输入系部编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系部名称" prop="deptName">
              <el-input v-model="formData.deptName" placeholder="请输入系部名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="导师ID" prop="teacherId">
              <el-input v-model="formData.teacherId" placeholder="请输入导师ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="导师账号" prop="teacherAccount">
              <el-input v-model="formData.teacherAccount" placeholder="请输入导师账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="导师姓名" prop="teacherName">
              <el-input v-model="formData.teacherName" placeholder="请输入导师姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学生ID" prop="studentId">
              <el-input v-model="formData.studentId" placeholder="请输入学生ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学生账号" prop="studentAccount">
              <el-input v-model="formData.studentAccount" placeholder="请输入学生账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学生姓名" prop="studentName">
              <el-input v-model="formData.studentName" placeholder="请输入学生姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="指导时间" prop="guidanceTime">
              <el-date-picker v-model="formData.guidanceTime" type="datetime" placeholder="选择指导时间" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="反馈时间" prop="feedbackTime">
              <el-date-picker v-model="formData.feedbackTime" type="datetime" placeholder="选择反馈时间" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="指导内容" prop="guidanceContent">
              <el-input v-model="formData.guidanceContent" type="textarea" placeholder="请输入指导内容" rows="3" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="学生反馈" prop="studentFeedback">
              <el-input v-model="formData.studentFeedback" type="textarea" placeholder="请输入学生反馈" rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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

// 选择的指导记录列表
const selectedGuidances = ref([])

// 新增/编辑对话框
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: '',
  projectId: '',
  deptCode: '',
  deptName: '',
  teacherId: '',
  teacherAccount: '',
  teacherName: '',
  studentId: '',
  studentAccount: '',
  studentName: '',
  guidanceTime: '',
  feedbackTime: '',
  guidanceContent: '',
  studentFeedback: ''
})

// 表单验证规则
const formRules = {
  projectId: [
    { required: true, message: '请输入项目ID', trigger: 'blur' }
  ],
  deptCode: [
    { required: true, message: '请输入系部编号', trigger: 'blur' }
  ],
  deptName: [
    { required: true, message: '请输入系部名称', trigger: 'blur' }
  ],
  teacherId: [
    { required: true, message: '请输入导师ID', trigger: 'blur' }
  ],
  studentId: [
    { required: true, message: '请输入学生ID', trigger: 'blur' }
  ],
  guidanceTime: [
    { required: true, message: '请选择指导时间', trigger: 'change' }
  ],
  guidanceContent: [
    { required: true, message: '请输入指导内容', trigger: 'blur' }
  ]
}

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

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedGuidances.value = val
}

// 新增指导记录
const handleAdd = () => {
  isEdit.value = false
  // 重置表单
  formData.id = ''
  formData.projectId = ''
  formData.deptCode = ''
  formData.deptName = ''
  formData.teacherId = ''
  formData.teacherAccount = ''
  formData.teacherName = ''
  formData.studentId = ''
  formData.studentAccount = ''
  formData.studentName = ''
  formData.guidanceTime = ''
  formData.feedbackTime = ''
  formData.guidanceContent = ''
  formData.studentFeedback = ''
  formDialogVisible.value = true
}

// 编辑指导记录
const handleEdit = (row) => {
  isEdit.value = true
  // 填充表单
  formData.id = row.id
  formData.projectId = row.projectId
  formData.deptCode = row.deptCode
  formData.deptName = row.deptName
  formData.teacherId = row.teacherId
  formData.teacherAccount = row.teacherAccount
  formData.teacherName = row.teacherName
  formData.studentId = row.studentId
  formData.studentAccount = row.studentAccount
  formData.studentName = row.studentName
  formData.guidanceTime = row.guidanceTime
  formData.feedbackTime = row.feedbackTime
  formData.guidanceContent = row.guidanceContent
  formData.studentFeedback = row.studentFeedback
  formDialogVisible.value = true
}

// 删除指导记录
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该指导记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await post('/processGuidanceRecord/delete', { id: row.id })
      if (response?.status === 'success') {
        ElMessage.success('删除成功')
        getGuidanceList()
      }
    } catch (error) {
      console.error('删除指导记录失败:', error)
      ElMessage.error('删除指导记录失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 批量删除指导记录
const handleBatchDelete = () => {
  if (selectedGuidances.value.length === 0) {
    ElMessage.warning('请选择要删除的指导记录')
    return
  }
  
  ElMessageBox.confirm('确定要删除选中的指导记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedGuidances.value.map(guidance => guidance.id)
      const response = await post('/processGuidanceRecord/batchDelete', ids)
      if (response?.status === 'success') {
        ElMessage.success('批量删除成功')
        selectedGuidances.value = []
        getGuidanceList()
      }
    } catch (error) {
      console.error('批量删除指导记录失败:', error)
      ElMessage.error('批量删除指导记录失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 格式化日期为 yyyy-MM-dd HH:mm:ss
const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 格式化日期字段
        const submitData = {
          ...formData,
          guidanceTime: formatDateTime(formData.guidanceTime),
          feedbackTime: formatDateTime(formData.feedbackTime)
        }
        
        let response
        if (isEdit.value) {
          // 编辑指导记录
          response = await post('/processGuidanceRecord/update', submitData)
        } else {
          // 新增指导记录
          response = await post('/processGuidanceRecord/create', submitData)
        }
        
        if (response?.status === 'success') {
          ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
          formDialogVisible.value = false
          getGuidanceList()
        }
      } catch (error) {
        console.error(isEdit.value ? '编辑指导记录失败:' : '新增指导记录失败:', error)
        ElMessage.error(isEdit.value ? '编辑指导记录失败' : '新增指导记录失败')
      }
    }
  })
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
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