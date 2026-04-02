<template>
  <div class="defense-arrange-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>答辩安排</span>
          <div class="header-buttons">
            <el-button type="success" @click="openArrangeDialog">
              <el-icon><Plus /></el-icon>
              安排
            </el-button>
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
        <el-form-item label="答辩分组">
          <el-input v-model="searchForm.defenseGroup" placeholder="请输入答辩分组" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 答辩安排列表 -->
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
            <el-tag :type="getDefenseStatusType(row.defenseStatus)">
              {{ getDefenseStatusText(row.defenseStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="成绩" width="80" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
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
        @current-change="getDefenseList"
        @size-change="getDefenseList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 安排答辩对话框 -->
    <el-dialog v-model="arrangeDialogVisible" title="安排答辩" width="600px">
      <el-form :model="arrangeForm" label-width="100px">
        <el-form-item label="学生">
          <el-select v-model="arrangeForm.studentId" placeholder="请选择学生" style="width: 100%;" filterable :loading="loadingStudents">
            <el-option
              v-for="student in students"
              :key="student.id"
              :label="`${student.studentAccount}/${student.name}`"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="答辩时间">
          <el-date-picker
            v-model="arrangeForm.defenseTime"
            type="datetime"
            placeholder="请选择答辩时间"
            style="width: 100%;"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="答辩地点">
          <el-input v-model="arrangeForm.defensePlace" placeholder="请输入答辩地点" />
        </el-form-item>
        <el-form-item label="评委">
          <el-select v-model="arrangeForm.judgeIds" multiple placeholder="请选择评委" style="width: 100%;" filterable :loading="loadingTeachers">
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="`${teacher.teacherAccount}/${teacher.name}`"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="arrangeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitArrange" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="答辩安排详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="系部名称">{{ currentDefense.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentDefense.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentDefense.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ currentDefense.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ currentDefense.teacherAccount }}</el-descriptions-item>
        <el-descriptions-item label="答辩时间">{{ currentDefense.defenseTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="答辩地点">{{ currentDefense.defensePlace || '-' }}</el-descriptions-item>
        <el-descriptions-item label="评委姓名">{{ currentDefense.judgeNames || '-' }}</el-descriptions-item>
        <el-descriptions-item label="答辩状态">{{ getDefenseStatusText(currentDefense.defenseStatus) }}</el-descriptions-item>
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
import { defenseApi, studentApi, teacherApi } from '@/utils/apiRequest'
import { Refresh, Plus } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  defenseGroup: ''
})

// 列表数据
const defenseList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 安排对话框
const arrangeDialogVisible = ref(false)
const submitLoading = ref(false)
const loadingStudents = ref(false)
const loadingTeachers = ref(false)
const arrangeForm = reactive({
  projectId: null,
  studentId: null,
  defenseTime: '',
  defensePlace: '',
  judgeIds: []
})

// 学生列表
const students = ref([])
// 教师列表
const teachers = ref([])

// 详情对话框
const detailDialogVisible = ref(false)
const currentDefense = ref({})



// 获取答辩安排列表
const getDefenseList = async () => {
  loading.value = true
  try {
    const response = await defenseApi.getDefenseArrangement({
      studentName: searchForm.studentName || undefined,
      defenseGroup: searchForm.defenseGroup || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response?.status === 'success') {
      defenseList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取答辩安排列表失败')
    }
  } catch (error) {
    console.error('获取答辩安排列表失败:', error)
    ElMessage.error('获取答辩安排列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getDefenseList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.defenseGroup = ''
  currentPage.value = 1
  getDefenseList()
}

// 获取答辩状态文本
const getDefenseStatusText = (status) => {
  const map = { 0: '未答辩', 1: '通过', 2: '缓答辩', 3: '不通过' }
  return map[status] || '未知'
}

// 获取答辩状态类型
const getDefenseStatusType = (status) => {
  const map = { 0: 'info', 1: 'success', 2: 'warning', 3: 'danger' }
  return map[status] || 'info'
}

// 查看详情
const handleDetail = (row) => {
  currentDefense.value = { ...row }
  detailDialogVisible.value = true
}

// 获取学生列表
const getStudents = async () => {
  loadingStudents.value = true
  try {
    const response = await studentApi.getStudentInfo({})
    if (response?.status === 'success') {
      students.value = response.data?.records || response.data?.list || []
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
  } finally {
    loadingStudents.value = false
  }
}

// 获取教师列表
const getTeachers = async () => {
  loadingTeachers.value = true
  try {
    const response = await teacherApi.getTeacherInfo({})
    if (response?.status === 'success') {
      teachers.value = response.data?.records || response.data?.list || []
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
  } finally {
    loadingTeachers.value = false
  }
}

// 打开安排答辩对话框
const openArrangeDialog = async () => {
  arrangeForm.projectId = null
  arrangeForm.studentId = null
  arrangeForm.defenseTime = ''
  arrangeForm.defensePlace = ''
  arrangeForm.judgeIds = []
  // 获取学生和教师列表
  await Promise.all([getStudents(), getTeachers()])
  arrangeDialogVisible.value = true
}

// 安排答辩（用于从表格操作列调用）
const handleArrange = async (row) => {
  arrangeForm.projectId = row.projectId
  arrangeForm.studentId = row.studentId
  arrangeForm.defenseTime = ''
  arrangeForm.defensePlace = ''
  arrangeForm.judgeIds = []
  // 获取学生和教师列表
  await Promise.all([getStudents(), getTeachers()])
  arrangeDialogVisible.value = true
}



// 格式化日期为后端期望的格式
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 提交安排
const submitArrange = async () => {
  submitLoading.value = true
  try {
    const response = await defenseApi.deptArrange({
      projectId: arrangeForm.projectId,
      studentId: arrangeForm.studentId,
      defenseTime: formatDate(arrangeForm.defenseTime),
      defensePlace: arrangeForm.defensePlace,
      judgeIds: arrangeForm.judgeIds.join(',')
    })
    
    if (response?.status === 'success') {
      ElMessage.success('安排成功')
      arrangeDialogVisible.value = false
      getDefenseList()
    } else {
      ElMessage.error('安排失败')
    }
  } catch (error) {
    console.error('安排失败:', error)
    ElMessage.error('安排失败')
  } finally {
    submitLoading.value = false
  }
}



onMounted(() => {
  getDefenseList()
})
</script>

<style scoped>
.defense-arrange-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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