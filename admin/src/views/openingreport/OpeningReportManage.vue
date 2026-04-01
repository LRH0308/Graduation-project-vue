<template>
  <div class="opening-report-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>开题报告管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">新增开题报告</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedOpeningReports.length === 0">批量删除</el-button>
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
              <el-select v-model="searchForm.auditStatus" placeholder="请选择" clearable>
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
        :data="openingReportList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="projectName" label="项目名称" min-width="200" align="center" />
        <el-table-column prop="deptName" label="所属系部" width="120" align="center" />
        <el-table-column label="学号/学生名" width="150" align="center">
          <template #default="{ row }">
            {{ row.studentAccount ? `${row.studentAccount}/${row.studentName}` : '未分配' }}
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="160" align="center" />
        <el-table-column label="工号/导师名" width="150" align="center">
          <template #default="{ row }">
            {{ row.teacherAccount }}/{{ row.teacherName }}
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.auditStatus)">
              {{ getAuditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditTime" label="审核时间" width="160" align="center" />
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
    <el-dialog v-model="detailDialogVisible" title="开题报告详情" width="800px">
      <!-- 开题报告信息 -->
      <el-descriptions title="开题报告信息" :column="2" border>
        <el-descriptions-item label="报告ID">{{ currentOpeningReport.id }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ currentOpeningReport.projectName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="系部编号">{{ currentOpeningReport.deptCode }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentOpeningReport.deptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="文件ID">{{ currentOpeningReport.fileId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentOpeningReport.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentOpeningReport.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentOpeningReport.auditTime || '未审核' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="审核备注">{{ currentOpeningReport.auditRemark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 导师信息 -->
      <el-descriptions title="导师信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="指导教师">{{ currentOpeningReport.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师账号">{{ currentOpeningReport.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="导师ID">{{ currentOpeningReport.teacherId }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 学生信息 -->
      <el-descriptions title="学生信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="学生">{{ currentOpeningReport.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生账号">{{ currentOpeningReport.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="学生ID">{{ currentOpeningReport.studentId }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑开题报告' : '新增开题报告'" width="800px">
      <el-form :model="formData" label-width="100px" size="small" :rules="formRules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="formData.projectName" placeholder="请输入项目名称" />
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
            <el-form-item label="审核状态" prop="auditStatus">
              <el-select v-model="formData.auditStatus" placeholder="请选择审核状态">
                <el-option :value="0" label="待审核" />
                <el-option :value="1" label="已通过" />
                <el-option :value="2" label="不通过" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="审核备注" prop="auditRemark">
              <el-input v-model="formData.auditRemark" type="textarea" placeholder="请输入审核备注" rows="3" />
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
  auditStatus: ''
})

// 数据列表
const openingReportList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentOpeningReport = ref({})

// 选择的开题报告列表
const selectedOpeningReports = ref([])

// 新增/编辑对话框
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: '',
  projectName: '',
  deptCode: '',
  deptName: '',
  teacherId: '',
  studentId: '',
  auditStatus: 0,
  auditRemark: ''
})

// 表单验证规则
const formRules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
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

// 获取开题报告列表
const getOpeningReportList = async () => {
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
    
    const response = await post('/openingReport/getOpeningReport', params)
    if (response?.status === 'success') {
      openingReportList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取开题报告列表失败:', error)
    ElMessage.error('获取开题报告列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getOpeningReportList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getOpeningReportList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getOpeningReportList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getOpeningReportList()
}

// 查看详情
const handleView = (row) => {
  currentOpeningReport.value = { ...row }
  detailDialogVisible.value = true
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedOpeningReports.value = val
}

// 新增开题报告
const handleAdd = () => {
  isEdit.value = false
  // 重置表单
  formData.id = ''
  formData.projectName = ''
  formData.deptCode = ''
  formData.deptName = ''
  formData.teacherId = ''
  formData.studentId = ''
  formData.auditStatus = 0
  formData.auditRemark = ''
  formDialogVisible.value = true
}

// 编辑开题报告
const handleEdit = (row) => {
  isEdit.value = true
  // 填充表单
  formData.id = row.id
  formData.projectName = row.projectName
  formData.deptCode = row.deptCode
  formData.deptName = row.deptName
  formData.teacherId = row.teacherId
  formData.studentId = row.studentId
  formData.auditStatus = row.auditStatus
  formData.auditRemark = row.auditRemark
  formDialogVisible.value = true
}

// 删除开题报告
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该开题报告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await del(`/openingReport/delete/${row.id}`)
      if (response?.status === 'success') {
        ElMessage.success('删除成功')
        getOpeningReportList()
      }
    } catch (error) {
      console.error('删除开题报告失败:', error)
      ElMessage.error('删除开题报告失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 批量删除开题报告
const handleBatchDelete = () => {
  if (selectedOpeningReports.value.length === 0) {
    ElMessage.warning('请选择要删除的开题报告')
    return
  }

  ElMessageBox.confirm('确定要删除选中的开题报告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedOpeningReports.value.map(openingReport => openingReport.id)
      const response = await post('/openingReport/batchDelete', ids)
      if (response?.status === 'success') {
        ElMessage.success('批量删除成功')
        selectedOpeningReports.value = []
        getOpeningReportList()
      }
    } catch (error) {
      console.error('批量删除开题报告失败:', error)
      ElMessage.error('批量删除开题报告失败')
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
          // 编辑开题报告
          response = await put('/openingReport/update', formData)
        } else {
          // 新增开题报告
          response = await post('/openingReport/create', formData)
        }

        if (response?.status === 'success') {
          ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
          formDialogVisible.value = false
          getOpeningReportList()
        }
      } catch (error) {
        console.error(isEdit.value ? '编辑开题报告失败:' : '新增开题报告失败:', error)
        ElMessage.error(isEdit.value ? '编辑开题报告失败' : '新增开题报告失败')
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

onMounted(() => {
  getOpeningReportList()
})
</script>

<style scoped>
.opening-report-manage-container {
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