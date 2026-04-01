<template>
  <div class="thesis-draft-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>论文初稿管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">新增论文初稿</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedThesisDrafts.length === 0">批量删除</el-button>
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
            <el-form-item label="审核状态">
              <el-select v-model="searchForm.adutisStatus" placeholder="请选择" clearable>
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
        :data="thesisDraftList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="deptName" label="所属系部" width="120" align="center" />
        <el-table-column prop="version" label="版本" width="80" align="center" />
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
        <el-table-column prop="submitTime" label="提交时间" width="160" align="center" />
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.adutisStatus)">
              {{ getAuditStatusText(row.adutisStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="adutisTime" label="审核时间" width="160" align="center" />
        <el-table-column prop="duplicateCheckRate" label="查重率" width="100" align="center" />
        <el-table-column label="格式检查" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getFormatCheckStatusType(row.formatCheckStatus)">
              {{ getFormatCheckStatusText(row.formatCheckStatus) }}
            </el-tag>
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
    <el-dialog v-model="detailDialogVisible" title="论文初稿详情" width="800px">
      <!-- 论文初稿信息 -->
      <el-descriptions title="论文初稿信息" :column="2" border>
        <el-descriptions-item label="ID">{{ currentThesisDraft.id }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ currentThesisDraft.version || '无' }}</el-descriptions-item>
        <el-descriptions-item label="项目ID">{{ currentThesisDraft.projectId }}</el-descriptions-item>
        <el-descriptions-item label="文件ID">{{ currentThesisDraft.fileId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="系部编号">{{ currentThesisDraft.deptCode }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentThesisDraft.deptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentThesisDraft.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentThesisDraft.adutisStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentThesisDraft.adutisTime || '未审核' }}</el-descriptions-item>
        <el-descriptions-item label="查重状态">{{ currentThesisDraft.duplicateCheckStatus === 1 ? '正常' : '异常' }}</el-descriptions-item>
        <el-descriptions-item label="查重时间">{{ currentThesisDraft.duplicateCheckTime || '未查重' }}</el-descriptions-item>
        <el-descriptions-item label="查重率">{{ currentThesisDraft.duplicateCheckRate || '无' }}</el-descriptions-item>
        <el-descriptions-item label="格式检查状态">{{ getFormatCheckStatusText(currentThesisDraft.formatCheckStatus) }}</el-descriptions-item>
        <el-descriptions-item label="格式检查时间">{{ currentThesisDraft.formatCheckTime || '未检查' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="审核意见">{{ currentThesisDraft.adutisRemark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 导师信息 -->
      <el-descriptions title="导师信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="指导教师">{{ currentThesisDraft.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师账号">{{ currentThesisDraft.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="导师ID">{{ currentThesisDraft.teacherId }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 学生信息 -->
      <el-descriptions title="学生信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="学生">{{ currentThesisDraft.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生学号">{{ currentThesisDraft.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="学生ID">{{ currentThesisDraft.studentId }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑论文初稿' : '新增论文初稿'" width="800px">
      <el-form :model="formData" label-width="100px" size="small" :rules="formRules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="版本" prop="version">
              <el-input v-model="formData.version" placeholder="请输入版本" />
            </el-form-item>
          </el-col>
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
            <el-form-item label="教师账号" prop="teacherAccount">
              <el-input v-model="formData.teacherAccount" placeholder="请输入教师账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教师姓名" prop="teacherName">
              <el-input v-model="formData.teacherName" placeholder="请输入教师姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件ID" prop="fileId">
              <el-input v-model="formData.fileId" placeholder="请输入文件ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审核状态" prop="adutisStatus">
              <el-select v-model="formData.adutisStatus" placeholder="请选择审核状态">
                <el-option :value="0" label="待审核" />
                <el-option :value="1" label="已通过" />
                <el-option :value="2" label="不通过" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="查重状态" prop="duplicateCheckStatus">
              <el-select v-model="formData.duplicateCheckStatus" placeholder="请选择查重状态">
                <el-option :value="0" label="未查重" />
                <el-option :value="1" label="正常" />
                <el-option :value="2" label="异常" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="查重率" prop="duplicateCheckRate">
              <el-input v-model="formData.duplicateCheckRate" placeholder="请输入查重率" type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="格式检查状态" prop="formatCheckStatus">
              <el-select v-model="formData.formatCheckStatus" placeholder="请选择格式检查状态">
                <el-option :value="0" label="待检查" />
                <el-option :value="1" label="通过" />
                <el-option :value="2" label="不通过" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="审核意见" prop="adutisRemark">
              <el-input v-model="formData.adutisRemark" type="textarea" placeholder="请输入审核意见" rows="3" />
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
import { post, put, del } from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  deptName: '',
  teacherId: '',
  studentId: '',
  adutisStatus: ''
})

// 数据列表
const thesisDraftList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentThesisDraft = ref({})

// 选择的论文初稿列表
const selectedThesisDrafts = ref([])

// 新增/编辑对话框
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: '',
  version: '',
  projectId: '',
  deptCode: '',
  deptName: '',
  teacherId: '',
  teacherAccount: '',
  teacherName: '',
  studentId: '',
  studentAccount: '',
  studentName: '',
  fileId: '',
  adutisStatus: 0,
  adutisRemark: '',
  duplicateCheckStatus: 0,
  duplicateCheckRate: '',
  formatCheckStatus: 0
})

// 表单验证规则
const formRules = {
  version: [
    { required: true, message: '请输入版本', trigger: 'blur' }
  ],
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
  ]
}

// 获取论文初稿列表
const getThesisDraftList = async () => {
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
    
    const response = await post('/ThesisDraft/getThesisDraft', params)
    if (response?.status === 'success') {
      thesisDraftList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取论文初稿列表失败:', error)
    ElMessage.error('获取论文初稿列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getThesisDraftList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getThesisDraftList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getThesisDraftList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getThesisDraftList()
}

// 查看详情
const handleView = (row) => {
  currentThesisDraft.value = { ...row }
  detailDialogVisible.value = true
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedThesisDrafts.value = val
}

// 新增论文初稿
const handleAdd = () => {
  isEdit.value = false
  // 重置表单
  formData.id = ''
  formData.version = ''
  formData.projectId = ''
  formData.deptCode = ''
  formData.deptName = ''
  formData.teacherId = ''
  formData.teacherAccount = ''
  formData.teacherName = ''
  formData.studentId = ''
  formData.studentAccount = ''
  formData.studentName = ''
  formData.fileId = ''
  formData.adutisStatus = 0
  formData.adutisRemark = ''
  formData.duplicateCheckStatus = 0
  formData.duplicateCheckRate = ''
  formData.formatCheckStatus = 0
  formDialogVisible.value = true
}

// 编辑论文初稿
const handleEdit = (row) => {
  isEdit.value = true
  // 填充表单
  formData.id = row.id
  formData.version = row.version
  formData.projectId = row.projectId
  formData.deptCode = row.deptCode
  formData.deptName = row.deptName
  formData.teacherId = row.teacherId
  formData.teacherAccount = row.teacherAccount
  formData.teacherName = row.teacherName
  formData.studentId = row.studentId
  formData.studentAccount = row.studentAccount
  formData.studentName = row.studentName
  formData.fileId = row.fileId
  formData.adutisStatus = row.adutisStatus
  formData.adutisRemark = row.adutisRemark
  formData.duplicateCheckStatus = row.duplicateCheckStatus
  formData.duplicateCheckRate = row.duplicateCheckRate
  formData.formatCheckStatus = row.formatCheckStatus
  formDialogVisible.value = true
}

// 删除论文初稿
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该论文初稿吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await del(`/ThesisDraft/deleteThesisDraft/${row.id}`)
      if (response?.status === 'success') {
        ElMessage.success('删除成功')
        getThesisDraftList()
      }
    } catch (error) {
      console.error('删除论文初稿失败:', error)
      ElMessage.error('删除论文初稿失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 批量删除论文初稿
const handleBatchDelete = () => {
  if (selectedThesisDrafts.value.length === 0) {
    ElMessage.warning('请选择要删除的论文初稿')
    return
  }
  
  ElMessageBox.confirm('确定要删除选中的论文初稿吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedThesisDrafts.value.map(thesisDraft => thesisDraft.id)
      const response = await post('/ThesisDraft/deleteThesisDrafts', ids)
      if (response?.status === 'success') {
        ElMessage.success('批量删除成功')
        selectedThesisDrafts.value = []
        getThesisDraftList()
      }
    } catch (error) {
      console.error('批量删除论文初稿失败:', error)
      ElMessage.error('批量删除论文初稿失败')
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
        let response
        if (isEdit.value) {
          // 编辑论文初稿
          response = await put('/ThesisDraft/updateThesisDraft', formData)
        } else {
          // 新增论文初稿
          response = await post('/ThesisDraft/createThesisDraft', formData)
        }
        
        if (response?.status === 'success') {
          ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
          formDialogVisible.value = false
          getThesisDraftList()
        }
      } catch (error) {
        console.error(isEdit.value ? '编辑论文初稿失败:' : '新增论文初稿失败:', error)
        ElMessage.error(isEdit.value ? '编辑论文初稿失败' : '新增论文初稿失败')
      }
    }
  })
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

onMounted(() => {
  getThesisDraftList()
})
</script>

<style scoped>
.thesis-draft-manage-container {
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
</style>