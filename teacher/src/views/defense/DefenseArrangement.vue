<template>
  <div class="defense-arrangement-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>答辩安排</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="答辩状态">
          <el-select v-model="searchForm.defenseStatus" placeholder="请选择">
            <el-option label="未答辩" :value="0" />
            <el-option label="已答辩" :value="1" />
            <el-option label="缓答辩" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 列表 -->
      <el-table :data="defenseList" v-loading="loading" border style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" />
        <el-table-column prop="studentAccount" label="学号" />
        <el-table-column prop="topicName" label="课题名称" />
        <el-table-column prop="defensePlace" label="答辩地点" />
        <el-table-column prop="defenseTime" label="答辩时间" />
        <el-table-column prop="defenseStatus" label="答辩状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.defenseStatus)">
              {{ getStatusText(row.defenseStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
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
        @size-change="getDefenseList"
        @current-change="getDefenseList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="答辩安排详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">{{ currentDefense.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentDefense.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentDefense.topicName }}</el-descriptions-item>
        <el-descriptions-item label="答辩地点">{{ currentDefense.defensePlace }}</el-descriptions-item>
        <el-descriptions-item label="答辩时间">{{ currentDefense.defenseTime }}</el-descriptions-item>
        <el-descriptions-item label="答辩状态">{{ getStatusText(currentDefense.defenseStatus) }}</el-descriptions-item>
        <el-descriptions-item label="评委名单" :span="2">
          {{ currentDefense.judgeNames || '未安排' }}
        </el-descriptions-item>
        <el-descriptions-item label="注意事项" :span="2">
          {{ currentDefense.notice || '无' }}
        </el-descriptions-item>
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
import { defenseApi } from '@/utils/apiRequest'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  defenseStatus: null
})

// 答辩安排列表
const defenseList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentDefense = ref({})

// 获取答辩安排列表
const getDefenseList = async () => {
  loading.value = true
  try {
    const response = await defenseApi.getDefenseArrangement({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    
    if (response?.status === 'success') {
      defenseList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      useMockData()
    }
  } catch (error) {
    console.error('获取答辩安排失败:', error)
    ElMessage.error('获取答辩安排失败')
    useMockData()
  } finally {
    loading.value = false
  }
}

// 使用模拟数据
const useMockData = () => {
  defenseList.value = [
    {
      id: 1,
      studentName: '张三',
      studentAccount: '2020001',
      topicName: '基于 Spring Boot 的毕设管理系统',
      defensePlace: '教学楼 A301',
      defenseTime: '2025-06-01 09:00:00',
      judgeNames: '李老师，王老师，赵老师',
      defenseStatus: 0,
      notice: '请提前 15 分钟到场'
    }
  ]
  total.value = defenseList.value.length
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getDefenseList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.defenseStatus = null
  currentPage.value = 1
  getDefenseList()
}

// 查看详情
const handleViewDetail = (row) => {
  currentDefense.value = row
  detailDialogVisible.value = true
}

// 获取状态文本
const getStatusText = (status) => {
  const map = { 0: '未答辩', 1: '已答辩', 2: '缓答辩' }
  return map[status] || '未知'
}

// 获取状态类型
const getStatusType = (status) => {
  const map = { 0: 'info', 1: 'success', 2: 'warning' }
  return map[status] || 'info'
}

onMounted(() => {
  getDefenseList()
})
</script>

<style scoped>
.defense-arrangement-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.search-form {
  margin-bottom: 20px;
}
</style>