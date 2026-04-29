<template>
  <div class="student-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学生管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button type="success" @click="handleDownloadTemplate">下载导入模板</el-button>
            <el-upload
              class="upload-demo"
              action=""
              :auto-upload="false"
              :on-change="handleFileChange"
              :show-file-list="false"
              accept=".xlsx,.xls"
            >
              <el-button type="warning">Excel导入</el-button>
            </el-upload>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedStudents.length === 0">批量删除</el-button>
          </div>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="studentAccount" label="学号" width="120" align="center" />
        <el-table-column prop="name" label="姓名" width="100" align="center" />
        <el-table-column prop="deptName" label="所属系部" width="160" align="center" />
        <el-table-column prop="className" label="班级" width="120" align="center" />
        <el-table-column prop="topicName" label="课题名称" min-width="200" align="center" />
        <el-table-column prop="graduationTime" label="毕业时间" width="100" align="center" />
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

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑学生" width="500px">
      <el-form :model="editFormData" label-width="100px" size="small" :rules="editFormRules" ref="editFormRef">
        <el-form-item label="学号">
          <el-input v-model="editFormData.studentAccount" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editFormData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="所属系部" prop="deptName">
          <el-input v-model="editFormData.deptName" placeholder="请输入所属系部" />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-input v-model="editFormData.className" placeholder="请输入班级" />
        </el-form-item>
        <el-form-item label="毕业时间" prop="graduationTime">
          <el-input v-model="editFormData.graduationTime" placeholder="如：2026届" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增学生" width="500px">
      <el-form :model="addFormData" label-width="100px" size="small" :rules="addFormRules" ref="addFormRef">
        <el-form-item label="学号" prop="studentAccount">
          <el-input v-model="addFormData.studentAccount" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addFormData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="所属系部" prop="deptName">
          <el-input v-model="addFormData.deptName" placeholder="请输入所属系部" />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-input v-model="addFormData.className" placeholder="请输入班级" />
        </el-form-item>
        <el-form-item label="毕业时间" prop="graduationTime">
          <el-input v-model="addFormData.graduationTime" placeholder="如：2026届" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { post, download } from '@/utils/request'

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

// 选择的学生列表
const selectedStudents = ref([])

// 编辑对话框
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editFormData = reactive({
  id: '',
  studentAccount: '',
  name: '',
  deptName: '',
  className: '',
  graduationTime: ''
})
const editFormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  deptName: [
    { required: true, message: '请输入所属系部', trigger: 'blur' }
  ],
  className: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ]
}

// 新增对话框
const addDialogVisible = ref(false)
const addFormRef = ref(null)
const addFormData = reactive({
  studentAccount: '',
  name: '',
  deptName: '',
  className: '',
  graduationTime: ''
})
const addFormRules = {
  studentAccount: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  deptName: [
    { required: true, message: '请输入所属系部', trigger: 'blur' }
  ],
  className: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ]
}

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

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedStudents.value = val
}

// 新增学生
const handleAdd = () => {
  // 重置表单
  addFormData.studentAccount = ''
  addFormData.name = ''
  addFormData.deptName = ''
  addFormData.className = ''
  addFormData.graduationTime = ''
  addDialogVisible.value = true
}

// 提交新增
const handleAddSubmit = async () => {
  if (!addFormRef.value) return

  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await post('/student/addStudent', addFormData)

        if (response?.status === 'success') {
          ElMessage.success('新增成功')
          addDialogVisible.value = false
          getStudentList()
        }
      } catch (error) {
        console.error('新增学生失败:', error)
        ElMessage.error('新增学生失败')
      }
    }
  })
}

// 编辑学生
const handleEdit = (row) => {
  // 填充表单
  editFormData.id = row.id
  editFormData.studentAccount = row.studentAccount
  editFormData.name = row.name
  editFormData.deptName = row.deptName
  editFormData.className = row.className
  editFormData.graduationTime = row.graduationTime
  editDialogVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await post('/student/updateStudent', editFormData)

        if (response?.status === 'success') {
          ElMessage.success('编辑成功')
          editDialogVisible.value = false
          getStudentList()
        }
      } catch (error) {
        console.error('编辑学生失败:', error)
        ElMessage.error('编辑学生失败')
      }
    }
  })
}

// 删除学生
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该学生吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await post('/student/deleteStudent', { id: row.id })
      if (response?.status === 'success') {
        ElMessage.success('删除成功')
        getStudentList()
      }
    } catch (error) {
      console.error('删除学生失败:', error)
      ElMessage.error('删除学生失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 批量删除学生
const handleBatchDelete = () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请选择要删除的学生')
    return
  }

  ElMessageBox.confirm('确定要删除选中的学生吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedStudents.value.map(student => student.id).filter(id => id != null)
      const response = await post('/student/deleteStudents', ids)
      if (response?.status === 'success') {
        ElMessage.success('批量删除成功')
        selectedStudents.value = []
        getStudentList()
      }
    } catch (error) {
      console.error('批量删除学生失败:', error)
      ElMessage.error('批量删除学生失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    const response = await download('/student/downloadTemplate')

    if (!response) {
      throw new Error('下载失败')
    }

    const url = window.URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href = url
    link.download = '学生信息导入模板.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败')
  }
}

// 处理文件上传
const handleFileChange = async (file) => {
  if (!file) return

  // 检查文件类型
  const fileName = file.name
  if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
    ElMessage.error('请上传 Excel 格式的文件（.xlsx 或 .xls）')
    return
  }

  const formData = new FormData()
  formData.append('file', file.raw)

  try {
    const response = await post('/student/importFromExcel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response?.status === 'success') {
      ElMessage.success(`导入成功，共导入 ${response.data} 条记录`)
      getStudentList()
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.upload-demo {
  display: inline-block;
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