<template>
  <div class="plagiarism-setting-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>论文查重设置</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">新增查重设置</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedSettings.length === 0">批量删除</el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="100px" size="small" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="导师工号">
              <el-input v-model="searchForm.teacherAccount" placeholder="请输入导师工号" clearable />
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
        :data="settingList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="teacherAccount" label="导师工号" width="120" align="center" />
        <el-table-column prop="maxAllowRate" label="最大允许查重率" width="140" align="center">
          <template #default="{ row }">
            <el-tag :type="getRateTagType(row.maxAllowRate)">
              {{ row.maxAllowRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="setTime" label="设置时间" width="160" align="center" />
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
    <el-dialog v-model="detailDialogVisible" width="800px">
      <el-descriptions title="查重设置信息" :column="2" border>
        <el-descriptions-item label="设置ID">{{ currentSetting.id }}</el-descriptions-item>
        <el-descriptions-item label="导师工号">{{ currentSetting.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="最大允许查重率">
          <el-tag :type="getRateTagType(currentSetting.maxAllowRate)">
            {{ currentSetting.maxAllowRate }}%
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设置时间">{{ currentSetting.setTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑查重设置' : '新增查重设置'" width="500px">
      <el-form :model="formData" label-width="120px" size="small" :rules="formRules" ref="formRef">
        <el-form-item label="导师工号" prop="teacherAccount">
          <el-input v-model="formData.teacherAccount" placeholder="请输入导师工号" />
        </el-form-item>
        <el-form-item label="最大允许查重率" prop="maxAllowRate">
          <el-input-number v-model="formData.maxAllowRate" :min="0" :max="100" :precision="2" placeholder="请输入最大允许查重率" style="width: 100%;" />
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
import { post } from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  teacherAccount: ''
})

// 数据列表
const settingList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentSetting = ref({})

// 选择的查重设置列表
const selectedSettings = ref([])

// 新增/编辑对话框
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: '',
  teacherAccount: '',
  maxAllowRate: 30.00
})

// 表单验证规则
const formRules = {
  teacherAccount: [
    { required: true, message: '请输入导师工号', trigger: 'blur' }
  ],
  maxAllowRate: [
    { required: true, message: '请输入最大允许查重率', trigger: 'blur' }
  ]
}

// 获取查重设置列表
const getSettingList = async () => {
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
    
    const response = await post('/ThesisDuplicateCheck/getDuplicateCheckSetting', params)
    if (response?.status === 'success') {
      settingList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取查重设置列表失败:', error)
    ElMessage.error('获取查重设置列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getSettingList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getSettingList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getSettingList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getSettingList()
}

// 查看详情
const handleView = (row) => {
  currentSetting.value = { ...row }
  detailDialogVisible.value = true
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedSettings.value = val
}

// 新增查重设置
const handleAdd = () => {
  isEdit.value = false
  // 重置表单
  formData.id = ''
  formData.teacherAccount = ''
  formData.maxAllowRate = 30.00
  formDialogVisible.value = true
}

// 编辑查重设置
const handleEdit = (row) => {
  isEdit.value = true
  // 填充表单
  formData.id = row.id
  formData.teacherAccount = row.teacherAccount
  formData.maxAllowRate = row.maxAllowRate
  formDialogVisible.value = true
}

// 删除查重设置
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该查重设置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await post('/ThesisDuplicateCheck/deleteDuplicateCheckSetting', { id: row.id })
      if (response?.status === 'success') {
        ElMessage.success('删除成功')
        getSettingList()
      }
    } catch (error) {
      console.error('删除查重设置失败:', error)
      ElMessage.error('删除查重设置失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 批量删除查重设置
const handleBatchDelete = () => {
  if (selectedSettings.value.length === 0) {
    ElMessage.warning('请选择要删除的查重设置')
    return
  }
  
  ElMessageBox.confirm('确定要删除选中的查重设置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedSettings.value.map(setting => setting.id)
      const response = await post('/ThesisDuplicateCheck/deleteDuplicateCheckSettingBatch', ids)
      if (response?.status === 'success') {
        ElMessage.success('批量删除成功')
        selectedSettings.value = []
        getSettingList()
      }
    } catch (error) {
      console.error('批量删除查重设置失败:', error)
      ElMessage.error('批量删除查重设置失败')
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
        // 构建提交数据
        const submitData = {
          teacherAccount: formData.teacherAccount,
          maxAllowRate: formData.maxAllowRate
        }
        
        // 如果是编辑，添加id
        if (isEdit.value) {
          submitData.id = formData.id
        }
        
        const response = await post('/ThesisDuplicateCheck/saveOrUpdateDuplicateCheckSetting', submitData)
        
        if (response?.status === 'success') {
          ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
          formDialogVisible.value = false
          getSettingList()
        }
      } catch (error) {
        console.error(isEdit.value ? '编辑查重设置失败:' : '新增查重设置失败:', error)
        ElMessage.error(isEdit.value ? '编辑查重设置失败' : '新增查重设置失败')
      }
    }
  })
}

// 根据查重率获取标签类型
const getRateTagType = (rate) => {
  if (rate <= 20) return 'success'
  if (rate <= 30) return 'warning'
  return 'danger'
}

onMounted(() => {
  getSettingList()
})
</script>

<style scoped>
.plagiarism-setting-container {
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
