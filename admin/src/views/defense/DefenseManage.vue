<template>
  <div class="defense-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>答辩安排管理</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="80px" size="small" class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="系编号">
              <el-input v-model="searchForm.deptCode" placeholder="请输入系编号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="学生">
              <el-input v-model="searchForm.studentId" placeholder="请输入学生ID" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="答辩状态">
              <el-select v-model="searchForm.defenseStatus" placeholder="请选择" clearable>
                <el-option :value="0" label="未答辩" />
                <el-option :value="1" label="已答辩" />
                <el-option :value="2" label="缓答辩" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="系部">
              <el-input v-model="searchForm.deptName" placeholder="请输入系部名称" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" style="text-align: right;">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
      
      <!-- 数据表格 -->
      <el-table 
        :data="defenseList" 
        border 
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        align="center"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="deptName" label="所属系部" width="120" align="center" />
        <el-table-column prop="projectId" label="项目ID" width="80" align="center" />
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
        <el-table-column prop="defensePlace" label="答辩地点" width="120" align="center" />
        <el-table-column prop="defenseTime" label="答辩时间" width="160" align="center" />
        <el-table-column prop="grade" label="成绩" width="80" align="center" />
        <el-table-column label="答辩状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getDefenseStatusType(row.defenseStatus)">
              {{ getDefenseStatusText(row.defenseStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="120" align="center">
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
      <!-- 答辩安排信息 -->
      <el-descriptions title="答辩安排信息" :column="2" border>
        <el-descriptions-item label="安排ID">{{ currentDefense.id }}</el-descriptions-item>
        <el-descriptions-item label="项目ID">{{ currentDefense.projectId }}</el-descriptions-item>
        <el-descriptions-item label="系部编号">{{ currentDefense.deptCode || '无' }}</el-descriptions-item>
        <el-descriptions-item label="所属系部">{{ currentDefense.deptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="答辩地点">{{ currentDefense.defensePlace }}</el-descriptions-item>
        <el-descriptions-item label="答辩时间">{{ currentDefense.defenseTime }}</el-descriptions-item>
        <el-descriptions-item label="答辩状态">{{ getDefenseStatusText(currentDefense.defenseStatus) }}</el-descriptions-item>
        <el-descriptions-item label="成绩">{{ currentDefense.grade || '无' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="1" border style="margin-top: 20px;">
        <el-descriptions-item label="评委ID">{{ currentDefense.judgeIds || '无' }}</el-descriptions-item>
        <el-descriptions-item label="评委名单">{{ currentDefense.judgeNames || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 导师信息 -->
      <el-descriptions title="导师信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="指导教师">{{ currentDefense.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="教师账号">{{ currentDefense.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="导师ID">{{ currentDefense.teacherId }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 学生信息 -->
      <el-descriptions title="学生信息" :column="2" border style="margin-top: 20px;">
        <el-descriptions-item label="学生">{{ currentDefense.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生学号">{{ currentDefense.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="学生ID">{{ currentDefense.studentId }}</el-descriptions-item>
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
  defenseStatus: '',
  deptName: ''
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
      defenseList.value = response.data?.records || []
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
const handleSizeChange = (val) => {
  pageSize.value = val
  getDefenseList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getDefenseList()
}

// 查看详情
const handleView = (row) => {
  currentDefense.value = { ...row }
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
}

.search-form {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>