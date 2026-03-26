<template>
  <div class="topic-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>选题管理</span>
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
                <el-option :value="2" label="已下线" />
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
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="projectName" label="课题名称" min-width="200" />
        <el-table-column prop="projectType" label="课题类型" width="120" />
        <el-table-column prop="projectSource" label="课题来源" width="120" />
        <el-table-column prop="projectRequirement" label="课题要求" min-width="250" show-overflow-tooltip />
        <el-table-column prop="teacherName" label="指导教师" width="120" />
        <el-table-column label="发布状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getPublishStatusType(row.publishStatus)">
              {{ getPublishStatusText(row.publishStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getApplyStatusType(row.applyStatus)">
              {{ getApplyStatusText(row.applyStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="学生选中状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.applyStatusStudent ? 'success' : 'warning'">
              {{ row.applyStatusStudent ? '已被选' : '无人选' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="系主任审核状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getDeptAuditStatusType(row.deptAuditStatus)">
              {{ getDeptAuditStatusText(row.deptAuditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deptAuditTime" label="审核时间" width="160" />
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
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
      <el-descriptions :column="2" border>
        <el-descriptions-item label="课题ID">{{ currentTopic.id }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentTopic.projectName }}</el-descriptions-item>
        <el-descriptions-item label="课题类型">{{ currentTopic.projectType }}</el-descriptions-item>
        <el-descriptions-item label="课题来源">{{ currentTopic.projectSource }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ currentTopic.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="导师ID">{{ currentTopic.teacherId }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">{{ getPublishStatusText(currentTopic.publishStatus) }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">{{ getApplyStatusText(currentTopic.applyStatus) }}</el-descriptions-item>
        <el-descriptions-item label="学生选中状态">{{ currentTopic.applyStatusStudent ? '已被选' : '无人选' }}</el-descriptions-item>
        <el-descriptions-item label="系主任审核状态">{{ getDeptAuditStatusText(currentTopic.deptAuditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentTopic.deptAuditTime || '未审核' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="课题要求">{{ currentTopic.projectRequirement }}</el-descriptions-item>
        <el-descriptions-item label="审核意见">{{ currentTopic.deptAuditRemark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { get, post } from '@/utils/request'

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
      topicList.value = response.data?.list || []
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

const getDeptAuditStatusText = (status) => {
  const map = { 0: '待审核', 1: '通过', 2: '不通过' }
  return map[status] || '未知'
}

const getDeptAuditStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
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
}

.search-form {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>