<template>
  <div class="department-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>院系管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedDepartments.length === 0">批量删除</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="80px" size="small" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="名称">
              <el-input v-model="searchForm.deptName" placeholder="请输入名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="编号">
              <el-input v-model="searchForm.deptCode" placeholder="请输入编号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="类型">
              <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
                <el-option label="院" :value="1" />
                <el-option label="系" :value="2" />
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
        :data="departmentList"
        border
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="deptCode" label="编号" width="120" align="center" />
        <el-table-column prop="deptName" label="名称" width="160" align="center" />
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'primary' : 'success'">
              {{ row.type === 1 ? '院' : '系' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="collegeCode" label="院编号" width="120" align="center" />
        <el-table-column prop="collegeName" label="院名称" width="160" align="center" />
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
    <el-dialog v-model="detailDialogVisible" title="院系详情" width="600px">
      <el-descriptions title="院系信息" :column="2" border>
        <el-descriptions-item label="编号">{{ currentDepartment.deptCode }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ currentDepartment.deptName }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="currentDepartment.type === 1 ? 'primary' : 'success'">
            {{ currentDepartment.type === 1 ? '院' : '系' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="院编号">{{ currentDepartment.collegeCode || '无' }}</el-descriptions-item>
        <el-descriptions-item label="院名称">{{ currentDepartment.collegeName || '无' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑院系" width="500px">
      <el-form :model="editFormData" label-width="100px" size="small" :rules="editFormRules" ref="editFormRef">
        <el-form-item label="类型">
          <el-select v-model="editFormData.type" disabled>
            <el-option label="院" :value="1" />
            <el-option label="系" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="编号" prop="deptCode">
          <el-input v-model="editFormData.deptCode" disabled />
        </el-form-item>
        <el-form-item label="名称" prop="deptName">
          <el-input v-model="editFormData.deptName" placeholder="请输入名称" />
        </el-form-item>
        <template v-if="editFormData.type === 2">
          <el-form-item label="所属院" prop="collegeCode">
            <el-select v-model="editFormData.collegeCode" placeholder="请选择所属院">
              <el-option
                v-for="college in collegeList"
                :key="college.deptCode || college.collegeCode"
                :label="`${college.deptCode || college.collegeCode || 'N/A'} - ${college.deptName || college.collegeName || 'N/A'}`"
                :value="college.deptCode || college.collegeCode"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增院系" width="500px">
      <el-form :model="addFormData" label-width="100px" size="small" :rules="addFormRules" ref="addFormRef">
        <el-form-item label="类型" prop="type">
          <el-select v-model="addFormData.type" placeholder="请选择类型">
            <el-option label="院" :value="1" />
            <el-option label="系" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="编号" prop="deptCode">
          <el-input v-model="addFormData.deptCode" placeholder="请输入编号" />
        </el-form-item>
        <el-form-item label="名称" prop="deptName">
          <el-input v-model="addFormData.deptName" placeholder="请输入名称" />
        </el-form-item>
        <template v-if="addFormData.type === 2">
          <el-form-item label="所属院" prop="collegeCode">
            <el-select v-model="addFormData.collegeCode" placeholder="请选择所属院">
              <el-option
                v-for="college in collegeList"
                :key="college.deptCode || college.collegeCode"
                :label="`${college.deptCode || college.collegeCode || 'N/A'} - ${college.deptName || college.collegeName || 'N/A'}`"
                :value="college.deptCode || college.collegeCode"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { post } from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  deptName: '',
  deptCode: '',
  type: ''
})

// 数据列表
const departmentList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 院列表（用于下拉框）
const collegeList = ref([])

// 详情对话框
const detailDialogVisible = ref(false)
const currentDepartment = ref({})

// 选择的院系列表
const selectedDepartments = ref([])

// 编辑对话框
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editFormData = reactive({
  id: '',
  type: 1,
  deptCode: '',
  deptName: '',
  collegeCode: '',
  collegeName: ''
})
const editFormRules = {
  deptName: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  collegeCode: [
    { required: true, message: '请选择所属院', trigger: 'blur' }
  ]
}

// 新增对话框
const addDialogVisible = ref(false)
const addFormRef = ref(null)
const addFormData = reactive({
  type: '',
  deptCode: '',
  deptName: '',
  collegeCode: '',
  collegeName: ''
})
const addFormRules = {
  type: [
    { required: true, message: '请选择类型', trigger: 'blur' }
  ],
  deptCode: [
    { required: true, message: '请输入编号', trigger: 'blur' }
  ],
  deptName: [
    { required: true, message: '请输入名称', trigger: 'blur' }
  ],
  collegeCode: [
    { required: true, message: '请选择所属院', trigger: 'blur' }
  ]
}

// 监听类型变化，清空所属院
watch(() => addFormData.type, (newVal) => {
  if (newVal !== 2) {
    addFormData.collegeCode = ''
    addFormData.collegeName = ''
  }
})

// 获取院系列表
const getDepartmentList = async () => {
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

    const response = await post('/department/getDepartmentList', params)
    if (response?.status === 'success') {
      departmentList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取院系列表失败:', error)
    ElMessage.error('获取院系列表失败')
  } finally {
    loading.value = false
  }
}

// 获取院列表（用于下拉框）
const getCollegeList = async () => {
  try {
    const response = await post('/department/getDepartmentList', { type: 1 })
    if (response?.status === 'success') {
      collegeList.value = response.data?.records || []
    }
  } catch (error) {
    console.error('获取院列表失败:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getDepartmentList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getDepartmentList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getDepartmentList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getDepartmentList()
}

// 查看详情
const handleView = (row) => {
  currentDepartment.value = { ...row }
  detailDialogVisible.value = true
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedDepartments.value = val
}

// 新增院系
const handleAdd = async () => {
  // 获取院列表
  await getCollegeList()
  // 重置表单
  addFormData.type = ''
  addFormData.deptCode = ''
  addFormData.deptName = ''
  addFormData.collegeCode = ''
  addFormData.collegeName = ''
  addDialogVisible.value = true
}

// 提交新增
const handleAddSubmit = async () => {
  if (!addFormRef.value) return

  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let requestData = {}
        
        if (addFormData.type === 1) {
          // 院：只传院编号、院名称、类型
          requestData = {
            type: addFormData.type,
            collegeCode: addFormData.deptCode,
            collegeName: addFormData.deptName
          }
        } else {
          // 系：传系编号、系名称、院编号、院名称、类型
          let collegeName = ''
          if (addFormData.collegeCode) {
            const college = collegeList.value.find(c => 
              (c.deptCode === addFormData.collegeCode) || (c.collegeCode === addFormData.collegeCode)
            )
            if (college) {
              collegeName = college.deptName || college.collegeName || ''
            }
          }
          requestData = {
            type: addFormData.type,
            deptCode: addFormData.deptCode,
            deptName: addFormData.deptName,
            collegeCode: addFormData.collegeCode,
            collegeName: collegeName
          }
        }
        
        const response = await post('/department/addDepartment', requestData)

        if (response?.status === 'success') {
          ElMessage.success('新增成功')
          addDialogVisible.value = false
          getDepartmentList()
        }
      } catch (error) {
        console.error('新增院系失败:', error)
        ElMessage.error('新增院系失败')
      }
    }
  })
}

// 编辑院系
const handleEdit = async () => {
  // 获取院列表
  await getCollegeList()
  // 填充表单
  editFormData.id = currentDepartment.value.id
  editFormData.type = currentDepartment.value.type
  editFormData.deptCode = currentDepartment.value.deptCode
  editFormData.deptName = currentDepartment.value.deptName
  editFormData.collegeCode = currentDepartment.value.collegeCode
  editFormData.collegeName = currentDepartment.value.collegeName
  editDialogVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 如果是系，需要从院列表中获取院名称
        if (editFormData.type === 2 && editFormData.collegeCode) {
          const college = collegeList.value.find(c => c.deptCode === editFormData.collegeCode)
          if (college) {
            editFormData.collegeName = college.deptName
          }
        }
        
        const response = await post('/department/updateDepartment', editFormData)

        if (response?.status === 'success') {
          ElMessage.success('编辑成功')
          editDialogVisible.value = false
          getDepartmentList()
        }
      } catch (error) {
        console.error('编辑院系失败:', error)
        ElMessage.error('编辑院系失败')
      }
    }
  })
}

// 删除院系
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该院系吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await post('/department/deleteDepartment', { id: row.id }, { isForm: true })
      if (response?.status === 'success') {
        ElMessage.success('删除成功')
        getDepartmentList()
      }
    } catch (error) {
      console.error('删除院系失败:', error)
      ElMessage.error('删除院系失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 批量删除院系
const handleBatchDelete = () => {
  if (selectedDepartments.value.length === 0) {
    ElMessage.warning('请选择要删除的院系')
    return
  }

  ElMessageBox.confirm('确定要删除选中的院系吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      let successCount = 0
      for (const dept of selectedDepartments.value) {
        if (dept.id) {
          const response = await post('/department/deleteDepartment', { id: dept.id }, { isForm: true, showLoading: false })
          if (response?.status === 'success') {
            successCount++
          }
        }
      }
      ElMessage.success(`批量删除成功，共删除 ${successCount} 条记录`)
      selectedDepartments.value = []
      getDepartmentList()
    } catch (error) {
      console.error('批量删除院系失败:', error)
      ElMessage.error('批量删除院系失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

onMounted(() => {
  getDepartmentList()
})
</script>

<style scoped>
.department-manage-container {
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