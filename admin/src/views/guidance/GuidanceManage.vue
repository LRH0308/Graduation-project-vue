<template>
  <div class="guidance-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>过程指导管理</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="学生 ID">
          <el-input v-model="searchForm.studentId" placeholder="请输入学生 ID" clearable />
        </el-form-item>
        <el-form-item label="教师 ID">
          <el-input v-model="searchForm.teacherId" placeholder="请输入教师 ID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 数据表格 -->
      <el-table :data="guidanceList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="projectId" label="项目 ID" width="100" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentAccount" label="学号" width="130" />
        <el-table-column prop="teacherName" label="指导教师" width="120" />
        <el-table-column prop="teacherAccount" label="教师工号" width="120" />
        <el-table-column prop="guidanceTime" label="指导时间" width="180" />
        <el-table-column prop="guidanceContent" label="指导内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
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
    <el-dialog v-model="detailDialogVisible" title="指导记录详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="记录 ID">{{ currentGuidance.id }}</el-descriptions-item>
        <el-descriptions-item label="项目 ID">{{ currentGuidance.projectId }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentGuidance.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生学号">{{ currentGuidance.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ currentGuidance.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师工号">{{ currentGuidance.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="指导时间">{{ currentGuidance.guidanceTime }}</el-descriptions-item>
        <el-descriptions-item label="反馈时间">{{ currentGuidance.feedbackTime || '未反馈' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="指导内容">{{ currentGuidance.guidanceContent || '无' }}</el-descriptions-item>
        <el-descriptions-item label="学生反馈">{{ currentGuidance.studentFeedback || '无' }}</el-descriptions-item>
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
import { post } from '@/utils/request'

// 搜索表单
const searchForm = reactive({
  studentId: '',
  teacherId: ''
})

// 数据列表
const guidanceList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentGuidance = ref({})

// 获取指导记录列表
const getGuidanceList = async () => {
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
    
    const response = await post('/processGuidanceRecord/getProcessGuidanceRecord', params)
    if (response?.status === 'success') {
      guidanceList.value = response.data?.list || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取指导记录列表失败:', error)
    ElMessage.error('获取指导记录列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getGuidanceList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getGuidanceList()
}

// 分页处理
const handleSizeChange = () => {
  getGuidanceList()
}

const handleCurrentChange = () => {
  getGuidanceList()
}

// 查看详情
const handleView = (row) => {
  currentGuidance.value = row
  detailDialogVisible.value = true
}

onMounted(() => {
  getGuidanceList()
})
</script>

<style scoped>
.guidance-manage-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.search-form {
  margin-bottom: 20px;
}
</style>