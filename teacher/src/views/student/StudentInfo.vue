<template>
  <div class="student-info-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>指导学生</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="searchForm.studentAccount" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="毕业时间">
          <el-input v-model="searchForm.graduationTime" placeholder="如：2026 届" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 列表 -->
      <el-table :data="studentList" v-loading="loading" border style="width: 100%">
        <el-table-column type="index" label="序列" width="80" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentAccount" label="学号" width="150" />
        <el-table-column prop="graduationTime" label="毕业届别" width="100" />
        <el-table-column prop="teacherAccount" label="教师工号" width="120" />
        <el-table-column prop="teacherName" label="教师姓名" width="120" />
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getStudentList"
        @current-change="getStudentList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { guidanceRelationApi } from '@/utils/apiRequest'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  studentAccount: '',
  graduationTime: ''
})

// 学生列表数据
const studentList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 获取学生列表
const getStudentList = async () => {
  loading.value = true
  try {
    const response = await guidanceRelationApi.getGuidanceRelation({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    })
    
    if (response?.code === 200) {
      studentList.value = response.data?.records || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取学生列表失败')
      studentList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
    studentList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getStudentList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.studentAccount = ''
  searchForm.graduationTime = ''
  currentPage.value = 1
  getStudentList()
}

onMounted(() => {
  getStudentList()
})
</script>

<style scoped>
.student-info-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.search-form {
  margin-bottom: 20px;
}

/* 表格文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}
</style>
