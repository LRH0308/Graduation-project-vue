<template>
  <div class="process-guidance-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>过程指导记录管理</span>
          <el-button type="primary" @click="getProcessGuidanceRecordList" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="导师姓名">
          <el-input v-model="searchForm.teacherName" placeholder="请输入导师姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 过程指导记录列表 -->
      <el-table :data="processGuidanceRecordList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序列" width="60" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentAccount" label="学生学号" width="120" />
        <el-table-column prop="teacherName" label="导师姓名" width="120" />
        <el-table-column prop="teacherAccount" label="导师工号" width="120" />
        <el-table-column prop="guidanceTime" label="指导时间" width="160" />
        <el-table-column prop="feedbackTime" label="反馈时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="handleDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="getProcessGuidanceRecordList"
        @size-change="getProcessGuidanceRecordList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="过程指导记录详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">{{ currentRecord.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生学号">{{ currentRecord.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="导师姓名">{{ currentRecord.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="导师工号">{{ currentRecord.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="项目ID">{{ currentRecord.projectId }}</el-descriptions-item>
        <el-descriptions-item label="指导时间">{{ currentRecord.guidanceTime }}</el-descriptions-item>
        <el-descriptions-item label="指导内容" :span="2">{{ currentRecord.guidanceContent }}</el-descriptions-item>
        <el-descriptions-item label="反馈时间">{{ currentRecord.feedbackTime || '无' }}</el-descriptions-item>
        <el-descriptions-item label="学生反馈" :span="2">{{ currentRecord.studentFeedback || '无' }}</el-descriptions-item>
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
import { processGuidanceApi } from '@/utils/apiRequest'
import { Refresh } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  teacherName: ''
})

// 列表数据
const processGuidanceRecordList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentRecord = ref({})

// 获取过程指导记录列表
const getProcessGuidanceRecordList = async () => {
  loading.value = true
  try {
    const response = await processGuidanceApi.getProcessGuidanceRecord({
      deptName: '', // 从 Token 自动获取
      studentName: searchForm.studentName || undefined,
      teacherName: searchForm.teacherName || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response?.status === 'success') {
      processGuidanceRecordList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取过程指导记录列表失败')
    }
  } catch (error) {
    console.error('获取过程指导记录列表失败:', error)
    ElMessage.error('获取过程指导记录列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getProcessGuidanceRecordList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.teacherName = ''
  currentPage.value = 1
  getProcessGuidanceRecordList()
}

// 查看详情
const handleDetail = (row) => {
  currentRecord.value = { ...row }
  detailDialogVisible.value = true
}

onMounted(() => {
  getProcessGuidanceRecordList()
})
</script>

<style scoped>
.process-guidance-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

/* 列表文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}
</style>