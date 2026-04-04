<template>
  <div class="defense-arrangement-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>答辩安排</span>
          <div class="header-buttons">
            <el-button type="primary" @click="getDefenseList" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="答辩状态">
          <el-select v-model="searchForm.defenseStatus" placeholder="请选择">
            <el-option label="未答辩" :value="0" />
            <el-option label="已答辩" :value="1" />
            <el-option label="缓答辩" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 列表 -->
      <el-table :data="defenseList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序列" width="60" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentAccount" label="学号" width="120" />
        <el-table-column prop="teacherName" label="指导教师" width="120" />
        <el-table-column prop="teacherAccount" label="工号" width="120" />
        <el-table-column prop="defenseTime" label="答辩时间" width="160" />
        <el-table-column prop="defensePlace" label="答辩地点" width="120" />
        <el-table-column prop="judgeNames" label="评委姓名" width="180" />
        <el-table-column prop="defenseStatus" label="答辩状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.defenseStatus)">
              {{ getStatusText(row.defenseStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="成绩" width="80" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">详情</el-button>
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
        <el-descriptions-item label="系部名称">{{ currentDefense.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentDefense.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentDefense.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ currentDefense.teacherName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ currentDefense.teacherAccount || '-' }}</el-descriptions-item>
        <el-descriptions-item label="答辩时间">{{ currentDefense.defenseTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="答辩地点">{{ currentDefense.defensePlace || '-' }}</el-descriptions-item>
        <el-descriptions-item label="评委姓名">{{ currentDefense.judgeNames || '-' }}</el-descriptions-item>
        <el-descriptions-item label="答辩状态">{{ getStatusText(currentDefense.defenseStatus) }}</el-descriptions-item>
        <el-descriptions-item label="成绩">{{ currentDefense.grade || '-' }}</el-descriptions-item>
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
import { Refresh } from '@element-plus/icons-vue'

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
      deptCode: 'DEP001',
      deptName: '软件工程系',
      projectId: 1,
      studentId: 1,
      studentAccount: '2022001',
      studentName: '张三',
      defensePlace: 'A301教室',
      defenseTime: '2026-05-20 09:00:00',
      judgeIds: '1,2,3',
      judgeNames: '赵老师,钱老师,孙主任',
      teacherId: 1,
      teacherAccount: 'T001',
      teacherName: '赵老师',
      fileId: 5,
      defenseStatus: 1,
      grade: 87.56
    },
    {
      id: 2,
      deptCode: 'DEP001',
      deptName: '软件工程系',
      projectId: 2,
      studentId: 2,
      studentAccount: '2022002',
      studentName: '李四',
      defensePlace: 'A301教室',
      defenseTime: '2026-05-20 09:30:00',
      judgeIds: '1,2,3',
      judgeNames: '赵老师,钱老师,孙主任',
      teacherId: 1,
      teacherAccount: 'T001',
      teacherName: '赵老师',
      fileId: null,
      defenseStatus: 0,
      grade: null
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

.header-buttons {
  display: flex;
  gap: 10px;
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