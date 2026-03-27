<template>
  <div class="subject-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课题列表</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="课题名称">
          <el-input v-model="searchForm.topicName" placeholder="请输入课题名称" />
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
      <el-table :data="subjectList" v-loading="loading" border style="width: 100%">
        <el-table-column prop="topicName" label="课题名称" />
        <el-table-column prop="teacherName" label="指导教师" />
        <el-table-column prop="deptName" label="所属系部" />
        <el-table-column prop="studentName" label="选题学生" />
        <el-table-column prop="applyStatusStudent" label="学生选题状态">
          <template #default="{ row }">
            <el-tag :type="row.applyStatusStudent ? 'success' : 'info'">
              {{ row.applyStatusStudent ? '已选题' : '未选题' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="departmentheadName" label="系主任" />
        <el-table-column prop="departmentheadOpinion" label="系主任意见" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getSubjectList"
        @current-change="getSubjectList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="课题详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="课题名称">{{ currentSubject.topicName }}</el-descriptions-item>
        <el-descriptions-item label="课题描述">{{ currentSubject.topicDesc }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ currentSubject.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师工号">{{ currentSubject.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentSubject.deptName }}</el-descriptions-item>
        <el-descriptions-item label="系主任">{{ currentSubject.departmentheadName }}</el-descriptions-item>
        <el-descriptions-item label="系主任工号">{{ currentSubject.departmentheadAccount }}</el-descriptions-item>
        <el-descriptions-item label="系主任意见">{{ currentSubject.departmentheadOpinion || '无' }}</el-descriptions-item>
        <el-descriptions-item label="选题学生">{{ currentSubject.studentName || '未选题' }}</el-descriptions-item>
        <el-descriptions-item label="学生工号">{{ currentSubject.studentAccount || '无' }}</el-descriptions-item>
        <el-descriptions-item label="学生选题状态">{{ currentSubject.applyStatusStudent ? '已选题' : '未选题' }}</el-descriptions-item>
        <el-descriptions-item label="学生申请时间">{{ currentSubject.studentApplyTime || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { topicApi } from '@/utils/apiRequest'

// 搜索表单
const searchForm = reactive({
  topicName: '',
  graduationTime: ''
})

// 课题列表数据
const subjectList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentSubject = ref({})

// 获取课题列表
const getSubjectList = async () => {
  loading.value = true
  try {
    const response = await topicApi.getTopicSelection({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    
    if (response?.status === 'success') {
      subjectList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      useMockData()
    }
  } catch (error) {
    console.error('获取课题列表失败:', error)
    ElMessage.error('获取课题列表失败')
    useMockData()
  } finally {
    loading.value = false
  }
}

// 使用模拟数据
const useMockData = () => {
  subjectList.value = [
    {
      id: 1,
      topicName: '基于 Spring Boot 的毕业设计管理系统',
      topicDesc: '开发一个基于 Spring Boot 的毕业设计管理系统',
      teacherAccount: 'T001',
      teacherName: '赵老师',
      deptName: '计算机系',
      applyStatus: 1,
      publishStatus: 1,
      studentName: '张三'
    },
    {
      id: 2,
      topicName: '人工智能在教育中的应用',
      topicDesc: '研究人工智能技术在教育领域的应用',
      teacherAccount: 'T001',
      teacherName: '赵老师',
      deptName: '计算机系',
      applyStatus: 1,
      publishStatus: 0,
      studentName: null
    }
  ]
  total.value = subjectList.value.length
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getSubjectList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.topicName = ''
  searchForm.graduationTime = ''
  currentPage.value = 1
  getSubjectList()
}

// 查看详情
const handleViewDetail = (row) => {
  currentSubject.value = row
  detailDialogVisible.value = true
}



onMounted(() => {
  getSubjectList()
})
</script>

<style scoped>
.subject-list-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.search-form {
  margin-bottom: 20px;
}
</style>