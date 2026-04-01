<template>
  <div class="topic-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>选题管理</span>
          <div class="header-buttons">
            <el-button type="primary" @click="handleAdd">新增选题</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedTopics.length === 0">批量删除</el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="80px" size="small" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="系部">
              <el-input v-model="searchForm.deptCode" placeholder="请输入系部编号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="导师">
              <el-input v-model="searchForm.teacherId" placeholder="请输入导师ID" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="毕业时间">
              <el-input v-model="searchForm.graduationTime" placeholder="如：2026届" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请状态">
              <el-select v-model="searchForm.applyStatus" placeholder="请选择" clearable>
                <el-option :value="0" label="申请中" />
                <el-option :value="1" label="已通过" />
                <el-option :value="2" label="已驳回" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="发布状态">
              <el-select v-model="searchForm.publishStatus" placeholder="请选择" clearable>
                <el-option :value="0" label="未发布" />
                <el-option :value="1" label="已发布" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="学生选题">
              <el-select v-model="searchForm.applyStatusStudent" placeholder="请选择" clearable>
                <el-option :value="0" label="未申请" />
                <el-option :value="1" label="已确认" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="text-align: right;">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
      
      <!-- 数据表格 -->
      <el-table 
        :data="topicList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="deptName" label="系部" width="100" align="center" />
        <el-table-column prop="topicName" label="课题名称" min-width="200" align="center" />
        <el-table-column label="工号/导师名" width="150" align="center">
          <template #default="{ row }">
            {{ row.teacherAccount }}/{{ row.teacherName }}
          </template>
        </el-table-column>
        <el-table-column label="申请状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getApplyStatusType(row.applyStatus)">
              {{ getApplyStatusText(row.applyStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="工号/系主任" width="150" align="center">
          <template #default="{ row }">
            {{ row.departmentheadAccount }}/{{ row.departmentheadName }}
          </template>
        </el-table-column>
        <el-table-column label="发布状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getPublishStatusType(row.publishStatus)">
              {{ getPublishStatusText(row.publishStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="学号/学生名" width="150" align="center">
          <template #default="{ row }">
            {{ row.studentAccount ? `${row.studentAccount}/${row.studentName}` : '未分配' }}
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
    <el-dialog v-model="detailDialogVisible" title="课题详情" width="800px">
      <!-- 课题信息 -->
      <el-descriptions title="课题信息" :column="2" border>
        <el-descriptions-item label="课题ID">{{ currentTopic.id }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentTopic.topicName }}</el-descriptions-item>
        <el-descriptions-item label="系部编号">{{ currentTopic.deptCode }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentTopic.deptName }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">{{ getApplyStatusText(currentTopic.applyStatus) }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentTopic.applyTime || '未申请' }}</el-descriptions-item>
        <el-descriptions-item label="毕业时间">{{ currentTopic.graduationTime }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="课题描述">{{ currentTopic.topicDesc }}</el-descriptions-item>
        <el-descriptions-item label="研究内容">{{ currentTopic.researchContent || '无' }}</el-descriptions-item>
        <el-descriptions-item label="审核意见">{{ currentTopic.departmentheadOpinion || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 导师信息 -->
      <el-descriptions title="导师信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="导师ID">{{ currentTopic.teacherId }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ currentTopic.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师账号">{{ currentTopic.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">{{ getPublishStatusText(currentTopic.publishStatus) }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentTopic.publishTime || '未发布' }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 系主任信息 -->
      <el-descriptions title="系主任信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="系主任ID">{{ currentTopic.departmentheadId }}</el-descriptions-item>
        <el-descriptions-item label="系主任">{{ currentTopic.departmentheadName }}</el-descriptions-item>
        <el-descriptions-item label="系主任账号">{{ currentTopic.departmentheadAccount }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentTopic.auditTime || '未审核' }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 学生信息 -->
      <el-descriptions title="学生信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="学生ID">{{ currentTopic.studentId || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="学生">{{ currentTopic.studentName || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="学生账号">{{ currentTopic.studentAccount || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="学生申请状态">{{ currentTopic.applyStatusStudent ? '已被选' : '无人选' }}</el-descriptions-item>
        <el-descriptions-item label="学生申请时间">{{ currentTopic.studentApplyTime || '未申请' }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑选题' : '新增选题'" width="800px">
      <el-form :model="formData" label-width="100px" size="small" :rules="formRules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课题名称" prop="topicName">
              <el-input v-model="formData.topicName" placeholder="请输入课题名称" />
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
            <el-form-item label="毕业时间" prop="graduationTime">
              <el-input v-model="formData.graduationTime" placeholder="如：2026届" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="课题描述" prop="topicDesc">
              <el-input v-model="formData.topicDesc" type="textarea" placeholder="请输入课题描述" rows="3" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="研究内容" prop="researchContent">
              <el-input v-model="formData.researchContent" type="textarea" placeholder="请输入研究内容" rows="3" />
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
  deptCode: '',
  teacherId: '',
  graduationTime: '',
  applyStatus: '',
  publishStatus: '',
  applyStatusStudent: ''
})

// 数据列表
const topicList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentTopic = ref({})

// 选择的选题列表
const selectedTopics = ref([])

// 新增/编辑对话框
const formDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: '',
  topicName: '',
  deptCode: '',
  deptName: '',
  teacherId: '',
  teacherAccount: '',
  teacherName: '',
  graduationTime: '',
  topicDesc: '',
  researchContent: ''
})

// 表单验证规则
const formRules = {
  topicName: [
    { required: true, message: '请输入课题名称', trigger: 'blur' }
  ],
  deptCode: [
    { required: true, message: '请输入系部编号', trigger: 'blur' }
  ],
  teacherId: [
    { required: true, message: '请输入导师ID', trigger: 'blur' }
  ],
  graduationTime: [
    { required: true, message: '请输入毕业时间', trigger: 'blur' }
  ],
  topicDesc: [
    { required: true, message: '请输入课题描述', trigger: 'blur' }
  ]
}

// 获取选题列表
const getTopicList = async () => {
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
    
    const response = await post('/topicSelect/getTopicSelection', params)
    if (response?.status === 'success') {
      topicList.value = response.data?.records || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取选题列表失败:', error)
    ElMessage.error('获取选题列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getTopicList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getTopicList()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getTopicList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getTopicList()
}

// 查看详情
const handleView = (row) => {
  currentTopic.value = { ...row }
  detailDialogVisible.value = true
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedTopics.value = val
}

// 新增选题
const handleAdd = () => {
  isEdit.value = false
  // 重置表单
  formData.id = ''
  formData.topicName = ''
  formData.deptCode = ''
  formData.deptName = ''
  formData.teacherId = ''
  formData.teacherAccount = ''
  formData.teacherName = ''
  formData.graduationTime = ''
  formData.topicDesc = ''
  formData.researchContent = ''
  formDialogVisible.value = true
}

// 编辑选题
const handleEdit = (row) => {
  isEdit.value = true
  // 填充表单
  formData.id = row.id
  formData.topicName = row.topicName
  formData.deptCode = row.deptCode
  formData.deptName = row.deptName
  formData.teacherId = row.teacherId
  formData.teacherAccount = row.teacherAccount
  formData.teacherName = row.teacherName
  formData.graduationTime = row.graduationTime
  formData.topicDesc = row.topicDesc
  formData.researchContent = row.researchContent
  formDialogVisible.value = true
}

// 删除选题
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该选题吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await del(`/topicSelect/deleteTopic/${row.id}`)
      if (response?.status === 'success') {
        ElMessage.success('删除成功')
        getTopicList()
      }
    } catch (error) {
      console.error('删除选题失败:', error)
      ElMessage.error('删除选题失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 批量删除选题
const handleBatchDelete = () => {
  if (selectedTopics.value.length === 0) {
    ElMessage.warning('请选择要删除的选题')
    return
  }
  
  ElMessageBox.confirm('确定要删除选中的选题吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const topicIds = selectedTopics.value.map(topic => topic.id)
      const response = await post('/topicSelect/deleteTopics', topicIds)
      if (response?.status === 'success') {
        ElMessage.success('批量删除成功')
        selectedTopics.value = []
        getTopicList()
      }
    } catch (error) {
      console.error('批量删除选题失败:', error)
      ElMessage.error('批量删除选题失败')
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
          // 编辑选题
          response = await put('/topicSelect/updateTopic', formData)
        } else {
          // 新增选题
          response = await post('/topicSelect/createTopic', formData)
        }
        
        if (response?.status === 'success') {
          ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
          formDialogVisible.value = false
          getTopicList()
        }
      } catch (error) {
        console.error(isEdit.value ? '编辑选题失败:' : '新增选题失败:', error)
        ElMessage.error(isEdit.value ? '编辑选题失败' : '新增选题失败')
      }
    }
  })
}

// 状态文本映射
const getApplyStatusText = (status) => {
  const map = { 0: '待审核', 1: '已通过', 2: '不通过' }
  return map[status] || '未知'
}

const getApplyStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const getPublishStatusText = (status) => {
  const map = { 0: '未发布', 1: '已发布' }
  return map[status] || '未知'
}

const getPublishStatusType = (status) => {
  const map = { 0: 'info', 1: 'success' }
  return map[status] || 'info'
}

onMounted(() => {
  getTopicList()
})
</script>

<style scoped>
.topic-manage-container {
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