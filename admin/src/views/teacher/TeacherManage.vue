<template>
  <div class="teacher-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>导师管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">新增教师</el-button>
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
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedTeachers.length === 0">批量删除</el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="80px" size="small" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="工号">
              <el-input v-model="searchForm.teacherAccount" placeholder="请输入工号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="姓名">
              <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="类型">
              <el-select v-model="searchForm.roleType" placeholder="请选择类型" clearable>
                <el-option label="导师" :value="2" />
                <el-option label="系主任" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="系部">
              <el-input v-model="searchForm.deptName" placeholder="请输入系部" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="学院">
              <el-input v-model="searchForm.collegeName" placeholder="请输入学院" clearable />
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
        :data="teacherList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="teacherAccount" label="工号" width="120" align="center" />
        <el-table-column prop="name" label="姓名" width="100" align="center" />
        <el-table-column prop="deptName" label="所属系部" width="160" align="center" />
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
    <el-dialog v-model="detailDialogVisible" title="导师详情" width="800px">
      <el-descriptions title="导师信息" :column="2" border>
        <el-descriptions-item label="工号">{{ currentTeacher.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentTeacher.name }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentTeacher.deptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{ currentTeacher.collegeName || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑导师' : '新增导师'" width="500px">
      <el-form :model="formData" label-width="100px" size="small" :rules="formRules" ref="formRef">
        <el-form-item label="工号" prop="teacherAccount">
          <el-input v-model="formData.teacherAccount" placeholder="请输入工号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色类型" prop="roleType">
          <el-select v-model="formData.roleType" placeholder="请选择角色类型">
            <el-option label="导师" :value="2" />
            <el-option label="系主任" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属系部" prop="deptName">
          <el-input v-model="formData.deptName" placeholder="请输入所属系部" />
        </el-form-item>
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
import { post, download } from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  teacherAccount: '',
  name: '',
  deptName: '',
  collegeName: '',
  roleType: ''
})

// 数据列表
const teacherList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentTeacher = ref({})

// 选择的导师列表
const selectedTeachers = ref([])

// 新增/编辑对话框
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: '',
  teacherAccount: '',
  name: '',
  deptName: '',
  roleType: 2
})

// 表单验证规则
const formRules = {
  teacherAccount: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  deptName: [
    { required: true, message: '请输入所属系部', trigger: 'blur' }
  ],
  roleType: [
    { required: true, message: '请选择角色类型', trigger: 'change' }
  ]
}

// 获取导师列表
const getTeacherList = async () => {
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
    
    const response = await post('/teacher/getTeacherInfo', params)
    if (response?.status === 'success') {
      teacherList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取导师列表失败:', error)
    ElMessage.error('获取导师列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getTeacherList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getTeacherList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getTeacherList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getTeacherList()
}

// 查看详情
const handleView = (row) => {
  currentTeacher.value = { ...row }
  detailDialogVisible.value = true
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedTeachers.value = val
}

// 新增导师
const handleAdd = () => {
  isEdit.value = false
  // 重置表单
  formData.id = ''
  formData.teacherAccount = ''
  formData.name = ''
  formData.roleType = 2
  formData.deptName = ''
  formDialogVisible.value = true
}

// 编辑导师
const handleEdit = (row) => {
  isEdit.value = true
  // 填充表单
  formData.id = row.id
  formData.teacherAccount = row.teacherAccount
  formData.name = row.name
  formData.roleType = row.roleType || 2
  formData.deptName = row.deptName
  formDialogVisible.value = true
}

// 删除导师
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该导师吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await post('/teacher/deleteTeacher', { id: row.id })
      if (response?.status === 'success') {
        ElMessage.success('删除成功')
        getTeacherList()
      }
    } catch (error) {
      console.error('删除导师失败:', error)
      ElMessage.error('删除导师失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 批量删除导师
const handleBatchDelete = () => {
  if (selectedTeachers.value.length === 0) {
    ElMessage.warning('请选择要删除的导师')
    return
  }
  
  ElMessageBox.confirm('确定要删除选中的导师吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedTeachers.value.map(teacher => teacher.id).filter(id => id != null)
      console.log('准备删除的 ids:', ids)
      const response = await post('/teacher/deleteTeachers', ids)
      if (response?.status === 'success') {
        ElMessage.success('批量删除成功')
        selectedTeachers.value = []
        getTeacherList()
      }
    } catch (error) {
      console.error('批量删除导师失败:', error)
      ElMessage.error('批量删除导师失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 只提交后端支持的字段
        const submitData = {
          id: formData.id,
          teacherAccount: formData.teacherAccount,
          name: formData.name,
          roleType: formData.roleType,
          deptName: formData.deptName
        }
        const url = isEdit.value ? '/teacher/updateTeacher' : '/teacher/addTeacher'
        const response = await post(url, submitData)
        
        if (response?.status === 'success') {
          ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
          formDialogVisible.value = false
          getTeacherList()
        }
      } catch (error) {
        console.error(isEdit.value ? '编辑导师失败:' : '新增导师失败:', error)
        ElMessage.error(isEdit.value ? '编辑导师失败' : '新增导师失败')
      }
    }
  })
}

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    // 使用 download 方法请求文件流
    const response = await download('/teacher/downloadTemplate')
    
    if (!response) {
      throw new Error('下载失败')
    }
    
    // 创建下载链接
    const url = window.URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href = url
    link.download = '教师信息导入模板.xlsx'
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
    const response = await post('/teacher/importFromExcel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response?.status === 'success') {
      ElMessage.success(`导入成功，共导入 ${response.data} 条记录`)
      getTeacherList()
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  }
}

onMounted(() => {
  getTeacherList()
})
</script>

<style scoped>
.teacher-manage-container {
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
