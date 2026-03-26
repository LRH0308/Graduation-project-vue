<template>
  <div class="defense-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>答辩安排管理</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="系编号">
          <el-input v-model="searchForm.deptCode" placeholder="请输入系编号" clearable />
        </el-form-item>
        <el-form-item label="学生 ID">
          <el-input v-model="searchForm.studentId" placeholder="请输入学生 ID" clearable />
        </el-form-item>
        <el-form-item label="答辩状态">
          <el-select v-model="searchForm.defenseStatus" placeholder="请选择" clearable>
            <el-option label="未答辩" :value="0" />
            <el-option label="已答辩" :value="1" />
            <el-option label="缓答辩" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 数据表格 -->
      <el-table :data="defenseList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="projectId" label="项目 ID" width="100" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentAccount" label="学号" width="130" />
        <el-table-column prop="deptName" label="系部" width="120" />
        <el-table-column prop="defensePlace" label="答辩地点" width="150" />
        <el-table-column prop="defenseTime" label="答辩时间" width="180" />
        <el-table-column prop="teacherName" label="指导教师" width="120" />
        <el-table-column prop="defenseStatus" label="答辩状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getDefenseStatusType(row.defenseStatus)">
              {{ getDefenseStatusText(row.defenseStatus) }}
            </el-tag>
          </template>
        </el-table-column>
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
    <el-dialog v-model="detailDialogVisible" title="答辩安排详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="安排 ID">{{ currentDefense.id }}</el-descriptions-item>
        <el-descriptions-item label="项目 ID">{{ currentDefense.projectId }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentDefense.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生学号">{{ currentDefense.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="系部编号">{{ currentDefense.deptCode }}</el-descriptions-item>
        <el-descriptions-item label="系部名称">{{ currentDefense.deptName }}</el-descriptions-item>
        <el-descriptions-item label="答辩地点">{{ currentDefense.defensePlace }}</el-descriptions-item>
        <el-descriptions-item label="答辩时间">{{ currentDefense.defenseTime }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ currentDefense.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师工号">{{ currentDefense.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="答辩状态">{{ getDefenseStatusText(currentDefense.defenseStatus) }}</el-descriptions-item>
        <el-descriptions-item label="评委名单" :span="2">{{ currentDefense.judgeNames }}</el-descriptions-item>
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
  deptCode: '',
  studentId: '',
  defenseStatus: ''
})

// 数据列表
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
    
    const response = await post('/defenseArrangement/getDefenseArrangement', params)
    if (response?.status === 'success') {
      defenseList.value = response.data?.list || []
      total.value = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取答辩安排列表失败:', error)
    ElMessage.error('获取答辩安排列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getDefenseList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getDefenseList()
}

// 分页处理
const handleSizeChange = () => {
  getDefenseList()
}

const handleCurrentChange = () => {
  getDefenseList()
}

// 查看详情
const handleView = (row) => {
  currentDefense.value = row
  detailDialogVisible.value = true
}

// 状态文本映射
const getDefenseStatusText = (status) => {
  const map = { 0: '未答辩', 1: '已答辩', 2: '缓答辩' }
  return map[status] || '未知'
}

const getDefenseStatusType = (status) => {
  const map = { 0: 'info', 1: 'success', 2: 'warning' }
  return map[status] || 'info'
}

onMounted(() => {
  getDefenseList()
})
</script>

<style scoped>
.defense-manage-container {
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