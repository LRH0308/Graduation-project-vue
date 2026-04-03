<template>
  <div class="foreign-translation-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>外文翻译管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">新增外文翻译</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedForeignTranslations.length === 0">批量删除</el-button>
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
        :data="foreignTranslationList" 
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
        <el-table-column fixed="right" label="操作" width="250" align="center">
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
    <el-dialog v-model="detailDialogVisible" title="外文翻译详情" width="800px">
      <!-- 外文翻译信息 -->
      <el-descriptions title="外文翻译信息" :column="2" border>
        <el-descriptions-item label="ID">{{ currentForeignTranslation.id }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ currentForeignTranslation.projectName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="系部编号">{{ currentForeignTranslation.deptCode }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentForeignTranslation.deptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentForeignTranslation.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentForeignTranslation.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentForeignTranslation.auditTime || '未审核' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="审核备注">{{ currentForeignTranslation.auditRemark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 文件信息 -->
      <div class="file-section" style="margin-top: 20px;">
        <h4>文件信息：</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="外文原文">
            <div class="file-item">
              <span>{{ fileNames.originalFileName || '外文原文文件' }}</span>
              <el-button
                v-if="currentForeignTranslation.originalFileId"
                type="primary"
                link
                size="small"
                @click="handleDownload(currentForeignTranslation.originalFileId, fileNames.originalFileName || '外文原文')"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <span v-else class="no-file">未上传</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="外文翻译">
            <div class="file-item">
              <span>{{ fileNames.translateFileName || '外文翻译文件' }}</span>
              <el-button
                v-if="currentForeignTranslation.translateFileId"
                type="primary"
                link
                size="small"
                @click="handleDownload(currentForeignTranslation.translateFileId, fileNames.translateFileName || '外文翻译')"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <span v-else class="no-file">未上传</span>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 导师信息 -->
      <el-descriptions title="导师信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="指导教师">{{ currentForeignTranslation.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师账号">{{ currentForeignTranslation.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="导师ID">{{ currentForeignTranslation.teacherId }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 学生信息 -->
      <el-descriptions title="学生信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="学生">{{ currentForeignTranslation.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生账号">{{ currentForeignTranslation.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="学生ID">{{ currentForeignTranslation.studentId }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑外文翻译' : '新增外文翻译'" width="800px">
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
import { fileApi } from '@/utils/apiRequest'
import { Download } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  deptName: '',
  teacherId: '',
  studentId: '',
  auditStatus: ''
})

// 数据列表
const foreignTranslationList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 文件名称缓存
const fileNames = reactive({
  originalFileName: '',
  translateFileName: ''
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentForeignTranslation = ref({})

// 选择的外文翻译列表
const selectedForeignTranslations = ref([])

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

// 获取文件名称
const getFileName = async (fileId) => {
  if (!fileId) return ''
  try {
    const res = await fileApi.getFileDetail(fileId)
    if (res?.status === 'success' && res.data) {
      return res.data.fileName || ''
    }
  } catch (error) {
    console.error('获取文件详情失败:', error)
  }
  return ''
}

// 获取外文翻译列表
const getForeignTranslationList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    }
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await post('/foreignLanguageTranslation/getForeignLanguageTranslation', params)
    if (response?.status === 'success') {
      foreignTranslationList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取外文翻译列表失败:', error)
    ElMessage.error('获取外文翻译列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getForeignTranslationList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getForeignTranslationList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getForeignTranslationList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getForeignTranslationList()
}

// 查看详情
const handleView = async (row) => {
  currentForeignTranslation.value = { ...row }
  fileNames.originalFileName = ''
  fileNames.translateFileName = ''
  if (row.originalFileId) {
    fileNames.originalFileName = await getFileName(row.originalFileId)
  }
  if (row.translateFileId) {
    fileNames.translateFileName = await getFileName(row.translateFileId)
  }
  detailDialogVisible.value = true
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedForeignTranslations.value = val
}

// 新增外文翻译
const handleAdd = () => {
  isEdit.value = false
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

// 编辑外文翻译
const handleEdit = (row) => {
  isEdit.value = true
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

// 删除外文翻译
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该外文翻译吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await del(`/foreignLanguageTranslation/delete/${row.id}`)
      if (response?.status === 'success') {
        ElMessage.success('删除成功')
        getForeignTranslationList()
      }
    } catch (error) {
      console.error('删除外文翻译失败:', error)
      ElMessage.error('删除外文翻译失败')
    }
  }).catch(() => {})
}

// 批量删除外文翻译
const handleBatchDelete = () => {
  if (selectedForeignTranslations.value.length === 0) {
    ElMessage.warning('请选择要删除的外文翻译')
    return
  }

  ElMessageBox.confirm('确定要删除选中的外文翻译吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedForeignTranslations.value.map(translation => translation.id)
      const response = await post('/foreignLanguageTranslation/batchDelete', ids)
      if (response?.status === 'success') {
        ElMessage.success('批量删除成功')
        selectedForeignTranslations.value = []
        getForeignTranslationList()
      }
    } catch (error) {
      console.error('批量删除外文翻译失败:', error)
      ElMessage.error('批量删除外文翻译失败')
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response
        if (isEdit.value) {
          response = await put('/foreignLanguageTranslation/update', formData)
        } else {
          response = await post('/foreignLanguageTranslation/create', formData)
        }

        if (response?.status === 'success') {
          ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
          formDialogVisible.value = false
          getForeignTranslationList()
        }
      } catch (error) {
        console.error(isEdit.value ? '编辑外文翻译失败:' : '新增外文翻译失败:', error)
        ElMessage.error(isEdit.value ? '编辑外文翻译失败' : '新增外文翻译失败')
      }
    }
  })
}

// 下载文件
const handleDownload = async (fileId, fileName) => {
  if (!fileId) {
    ElMessage.error('文件ID不能为空')
    return
  }

  try {
    const response = await fileApi.download(fileId, {
      showLoading: true
    })

    if (response instanceof Blob) {
      const url = URL.createObjectURL(response)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      ElMessage.success('文件下载成功')
    } else {
      ElMessage.error('文件下载失败')
    }
  } catch (error) {
    console.error('文件下载失败:', error)
    ElMessage.error('文件下载失败')
  }
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
  getForeignTranslationList()
})
</script>

<style scoped>
.foreign-translation-manage-container {
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

.file-section h4 {
  margin: 10px 0;
  color: #606266;
  font-size: 16px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-file {
  color: #909399;
  font-size: 12px;
}
</style>
