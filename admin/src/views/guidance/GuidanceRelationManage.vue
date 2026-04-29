<template>
  <div class="guidance-relation-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>师生关系管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">新增关系</el-button>
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
          <el-col :span="6" style="text-align: right;">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
      
      <!-- 数据表格 -->
      <el-table 
        :data="relationList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="deptName" label="所属系部" width="120" align="center" />
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
        <el-table-column prop="createTime" label="创建时间" width="160" align="center" />
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
    <el-dialog v-model="detailDialogVisible" title="师生关系详情" width="800px">
      <el-descriptions title="师生关系信息" :column="2" border>
        <el-descriptions-item label="关系ID">{{ currentRelation.id }}</el-descriptions-item>
        <el-descriptions-item label="项目ID">{{ currentRelation.projectId || '无' }}</el-descriptions-item>
        <el-descriptions-item label="系部编号">{{ currentRelation.deptCode }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentRelation.deptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRelation.createTime }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 导师信息 -->
      <el-descriptions title="导师信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="指导教师">{{ currentRelation.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师账号">{{ currentRelation.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="导师ID">{{ currentRelation.teacherId }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 学生信息 -->
      <el-descriptions title="学生信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="学生">{{ currentRelation.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生账号">{{ currentRelation.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="学生ID">{{ currentRelation.studentId }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑师生关系' : '新增师生关系'" width="600px">
      <el-form :model="formData" label-width="120px" size="small" :rules="formRules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="系编码" prop="deptCode">
              <el-input v-model="formData.deptCode" placeholder="请输入系编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系名称" prop="deptName">
              <el-input v-model="formData.deptName" placeholder="请输入系名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">导师信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="导师ID" prop="teacherId">
              <el-input v-model="formData.teacherId" placeholder="请输入导师ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工号" prop="teacherAccount">
              <el-input v-model="formData.teacherAccount" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="导师名" prop="teacherName">
              <el-input v-model="formData.teacherName" placeholder="请输入导师名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">学生信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学生ID">
              <el-input v-model="formData.studentId" placeholder="请输入学生ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学号">
              <el-input v-model="formData.studentAccount" placeholder="请输入学号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学生名">
              <el-input v-model="formData.studentName" placeholder="请输入学生名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="毕业年份">
              <el-input v-model="formData.graduationTime" placeholder="请输入毕业年份（如：2025）" />
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
  deptName: '',
  teacherId: '',
  studentId: ''
})

// 数据列表
const relationList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentRelation = ref({})

// 新增/编辑对话框
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: '',
  deptCode: '',
  deptName: '',
  teacherId: '',
  teacherAccount: '',
  teacherName: '',
  studentId: '',
  studentAccount: '',
  studentName: '',
  graduationTime: ''
})

// 表单验证规则
const formRules = {
  deptCode: [
    { required: true, message: '请输入系编码', trigger: 'blur' }
  ],
  deptName: [
    { required: true, message: '请输入系名称', trigger: 'blur' }
  ],
  teacherId: [
    { required: true, message: '请输入导师ID', trigger: 'blur' }
  ],
  teacherAccount: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  teacherName: [
    { required: true, message: '请输入导师名', trigger: 'blur' }
  ]
}

// 获取师生关系列表
const getRelationList = async () => {
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
    
    const response = await post('/guidanceRelation/getGuidanceRelation', params)
    if (response?.status === 'success') {
      relationList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取师生关系列表失败:', error)
    ElMessage.error('获取师生关系列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getRelationList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getRelationList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getRelationList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getRelationList()
}

// 查看详情
const handleView = (row) => {
  currentRelation.value = { ...row }
  detailDialogVisible.value = true
}

// 新增师生关系
const handleAdd = () => {
  isEdit.value = false
  // 重置表单
  formData.id = ''
  formData.deptCode = ''
  formData.deptName = ''
  formData.teacherId = ''
  formData.teacherAccount = ''
  formData.teacherName = ''
  formData.studentId = ''
  formData.studentAccount = ''
  formData.studentName = ''
  formData.graduationTime = ''
  formDialogVisible.value = true
}

// 编辑师生关系
const handleEdit = (row) => {
  isEdit.value = true
  // 填充表单
  formData.id = row.id
  formData.deptCode = row.deptCode || ''
  formData.deptName = row.deptName || ''
  formData.teacherId = row.teacherId || ''
  formData.teacherAccount = row.teacherAccount || ''
  formData.teacherName = row.teacherName || ''
  formData.studentId = row.studentId || ''
  formData.studentAccount = row.studentAccount || ''
  formData.studentName = row.studentName || ''
  formData.graduationTime = row.graduationTime || ''
  formDialogVisible.value = true
}

// 删除师生关系
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该师生关系吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await post('/guidanceRelation/deleteRelation', { id: row.id })
      if (response?.status === 'success') {
        ElMessage.success('删除成功')
        getRelationList()
      }
    } catch (error) {
      console.error('删除师生关系失败:', error)
      ElMessage.error('删除师生关系失败')
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
        const submitData = {
          id: formData.id,
          deptCode: formData.deptCode,
          deptName: formData.deptName,
          teacherId: formData.teacherId,
          teacherAccount: formData.teacherAccount,
          teacherName: formData.teacherName,
          studentId: formData.studentId,
          studentAccount: formData.studentAccount,
          studentName: formData.studentName,
          graduationTime: formData.graduationTime
        }
        const url = isEdit.value ? '/guidanceRelation/updateRelation' : '/guidanceRelation/assignRelation'
        const response = await post(url, submitData)
        
        if (response?.status === 'success') {
          ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
          formDialogVisible.value = false
          getRelationList()
        }
      } catch (error) {
        console.error(isEdit.value ? '编辑师生关系失败:' : '新增师生关系失败:', error)
        ElMessage.error(isEdit.value ? '编辑师生关系失败' : '新增师生关系失败')
      }
    }
  })
}

onMounted(() => {
  getRelationList()
})
</script>

<style scoped>
.guidance-relation-manage-container {
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
