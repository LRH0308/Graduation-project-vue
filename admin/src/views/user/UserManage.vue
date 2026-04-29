<template>
  <div class="user-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleRegisterUser" style="margin-left: 20px;">
            注册学生和教师
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="80px" size="small" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="账号">
              <el-input v-model="searchForm.account" placeholder="请输入账号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="角色">
              <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
                <el-option label="管理员" :value="4" />
                <el-option label="学生" :value="1" />
                <el-option label="导师" :value="2" />
                <el-option label="系主任" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                <el-option :value="0" label="禁用" />
                <el-option :value="1" label="启用" />
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
        :data="userList"
        border
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="account" label="账号" width="120" align="center" />
        <el-table-column label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="280" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              type="danger"
              link
              @click="handleDisable(row)"
              :disabled="row.status === 0"
            >
              禁用
            </el-button>
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
    <el-dialog v-model="detailDialogVisible" title="用户详情" width="800px">
      <el-descriptions title="用户信息" :column="2" border>
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ currentUser.account }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="getRoleType(currentUser.role)">
            {{ getRoleText(currentUser.role) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentUser.status)">
            {{ getStatusText(currentUser.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑用户" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户ID">
          <el-input v-model="editForm.id" disabled />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="editForm.account" disabled />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="请选择角色" style="width: 100%;">
            <el-option label="管理员" :value="4" />
            <el-option label="学生" :value="1" />
            <el-option label="导师" :value="2" />
            <el-option label="系主任" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择状态" style="width: 100%;">
            <el-option :value="0" label="禁用" />
            <el-option :value="1" label="启用" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { post, get } from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  account: '',
  role: '',
  status: ''
})

// 数据列表
const userList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentUser = ref({})

// 编辑对话框
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  id: '',
  account: '',
  role: '',
  status: ''
})
const editRules = {
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 获取用户列表
const getUserList = async () => {
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

    const response = await post('/user/getUserList', params)
    if (response?.status === 'success') {
      userList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getUserList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getUserList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getUserList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getUserList()
}

// 查看详情
const handleView = (row) => {
  currentUser.value = { ...row }
  detailDialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  editForm.id = row.id
  editForm.account = row.account
  editForm.role = row.role
  editForm.status = row.status
  editDialogVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  try {
    await editFormRef.value.validate()
    const response = await post('/user/updateUser', editForm)
    if (response?.status === 'success') {
      ElMessage.success('用户信息更新成功')
      editDialogVisible.value = false
      getUserList()
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    if (error !== false) {
      ElMessage.error('更新用户信息失败')
    }
  }
}

// 禁用用户
const handleDisable = (row) => {
  ElMessageBox.confirm(`确定要禁用用户 ${row.account} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await post('/user/deleteUser', { id: row.id }, { isForm: true })
      if (response?.status === 'success') {
        ElMessage.success('用户已成功禁用')
        getUserList()
      }
    } catch (error) {
      console.error('禁用用户失败:', error)
      ElMessage.error('禁用用户失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 注册学生和教师
const handleRegisterUser = async () => {
  try {
    const response = await get('/user/registerUser')
    if (response?.status === 'success') {
      ElMessage.success(`成功注册 ${response.data} 个用户`)
      // 刷新用户列表
      getUserList()
    }
  } catch (error) {
    console.error('注册学生和教师失败:', error)
    ElMessage.error('注册学生和教师失败')
  }
}

// 角色文本映射
const getRoleText = (role) => {
  const map = { '': '管理员', 1: '学生', 2: '导师', 3: '系主任' }
  return map[role] || '未知'
}

const getRoleType = (role) => {
  const map = { '': 'danger', 1: 'success', 2: 'primary', 3: 'warning' }
  return map[role] || 'info'
}

// 状态文本映射
const getStatusText = (status) => {
  const map = { 0: '禁用', 1: '启用' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 0: 'danger', 1: 'success' }
  return map[status] || 'info'
}

onMounted(() => {
  getUserList()
})
</script>

<style scoped>
.user-manage-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
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