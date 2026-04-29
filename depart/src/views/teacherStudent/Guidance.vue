<template>
  <div class="guidance-relationship">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>指导关系管理</span>
          <div class="header-buttons">
            <el-button type="success" @click="openImportDialog" :loading="loadingTeachers || loadingStudents">
              <el-icon><Upload /></el-icon>
              指定
            </el-button>
            <el-button type="primary" @click="getGuidanceList" :loading="loading">
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
        <el-form-item label="学号">
          <el-input v-model="searchForm.studentAccount" placeholder="请输入学号" clearable />
        </el-form-item>
        <el-form-item label="教师姓名">
          <el-input v-model="searchForm.teacherName" placeholder="请输入教师姓名" clearable />
        </el-form-item>
        <el-form-item label="工号">
          <el-input v-model="searchForm.teacherAccount" placeholder="请输入工号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 指导关系列表 -->
      <el-table :data="guidanceList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序列" width="60" />
        <el-table-column prop="studentAccount" label="学号" width="180" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="teacherAccount" label="导师工号" width="180" />
        <el-table-column prop="teacherName" label="导师姓名" width="120" />
        <el-table-column prop="deptName" label="所属系部" width="180" />
        <el-table-column prop="graduationTime" label="毕业届次" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
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
        @current-change="getGuidanceList"
        @size-change="getGuidanceList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑指导关系" width="500px">
      <el-form :model="editForm" label-width="100px" size="small">
        <el-form-item label="学号" prop="studentAccount">
          <el-input v-model="editForm.studentAccount" disabled />
        </el-form-item>
        <el-form-item label="学生姓名" prop="studentName">
          <el-input v-model="editForm.studentName" disabled />
        </el-form-item>
        <el-form-item label="导师" prop="teacherId" :rules="[{ required: true, message: '请选择导师' }]">
          <el-select v-model="editForm.teacherId" placeholder="请选择导师" filterable :loading="loadingTeachers" @change="handleTeacherSelect">
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="`${teacher.teacherAccount}/${teacher.name}`"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属系部" prop="deptName">
          <el-input v-model="editForm.deptName" disabled />
        </el-form-item>
        <el-form-item label="毕业届次">
          <el-input v-model="editForm.graduationTime" placeholder="请输入毕业届次" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit" :loading="editLoading">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入师生关系" width="700px">
      <!-- 顶部提示信息 -->
      <el-alert
        title="导入说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px;"
      >
        <div>
          <p>1. 每个导师可以分配多个学生</p>
          <p>2. 选择导师后，再选择该导师对应的学生</p>
          <p>3. 系统会自动检查学生是否已有导师</p>
        </div>
      </el-alert>
      
      <el-form :model="importForm" label-width="80px">
        <el-form-item label="导入数据">
          <el-button type="primary" @click="addImportItem" :loading="loadingTeachers || loadingStudents">
            <el-icon><Plus /></el-icon>
            添加导师
          </el-button>
        </el-form-item>
        
        <div v-for="(item, index) in importForm.importItems" :key="index" class="import-item">
          <el-form-item :label="`导师 ${index + 1}`" :prop="`importItems.${index}.teacherId`" :rules="[{ required: true, message: '请选择导师' }]">
            <el-select v-model="item.teacherId" placeholder="请选择导师" filterable @change="handleTeacherChange(item)">
              <el-option
                v-for="teacher in teachers"
                :key="teacher.id"
                :label="`${teacher.teacherAccount}/${teacher.name}`"
                :value="teacher.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="`学生 ${index + 1}`" :prop="`importItems.${index}.studentIds`" :rules="[{ required: true, message: '请选择学生' }]">
            <el-select v-model="item.studentIds" placeholder="请选择学生" multiple filterable>
              <el-option
                v-for="student in students"
                :key="student.id"
                :label="`${student.studentAccount}/${student.name}`"
                :value="student.id"
              />
            </el-select>
          </el-form-item>
          <el-button type="danger" @click="removeImportItem(index)" style="margin-left: 80px;">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitImport" :loading="importLoading">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { guidanceRelationApi, studentApi, teacherApi } from '@/utils/apiRequest'
import { Refresh, Upload, Plus, Delete } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  studentAccount: '',
  teacherName: '',
  teacherAccount: ''
})

// 列表数据
const guidanceList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 导入相关
const importDialogVisible = ref(false)
const importLoading = ref(false)
const loadingTeachers = ref(false)
const loadingStudents = ref(false)
const teachers = ref([])
const students = ref([])
const importForm = reactive({
  importItems: [
    {
      teacherId: '',
      studentIds: []
    }
  ]
})

// 编辑相关
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editForm = reactive({
  id: '',
  studentAccount: '',
  studentName: '',
  teacherId: null,
  teacherAccount: '',
  teacherName: '',
  deptName: '',
  graduationTime: ''
})

// 获取指导关系列表
const getGuidanceList = async () => {
  loading.value = true
  try {
    const response = await guidanceRelationApi.getGuidanceRelation({
      studentName: searchForm.studentName || undefined,
      studentAccount: searchForm.studentAccount || undefined,
      teacherName: searchForm.teacherName || undefined,
      teacherAccount: searchForm.teacherAccount || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response?.status === 'success') {
      guidanceList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取指导关系列表失败')
    }
  } catch (error) {
    console.error('获取指导关系列表失败:', error)
    ElMessage.error('获取指导关系列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getGuidanceList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.studentAccount = ''
  searchForm.teacherName = ''
  searchForm.teacherAccount = ''
  currentPage.value = 1
  getGuidanceList()
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

// 打开导入对话框
const openImportDialog = async () => {
  await Promise.all([getTeachers(), getStudents()])
  importDialogVisible.value = true
}

// 导入相关方法
const addImportItem = () => {
  importForm.importItems.push({
    teacherId: '',
    studentIds: []
  })
}

// 处理导师选择变化
const handleTeacherChange = (item) => {
  // 可以在这里添加逻辑，比如根据导师筛选学生
}

const removeImportItem = (index) => {
  if (importForm.importItems.length > 1) {
    importForm.importItems.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一个导师')
  }
}

const submitImport = async () => {
  // 验证数据
  const validData = importForm.importItems.filter(item => {
    return item.teacherId && item.studentIds && item.studentIds.length > 0
  })
  
  if (validData.length === 0) {
    ElMessage.warning('请填写导入数据')
    return
  }
  
  // 转换数据格式
  const importData = validData.map(item => {
    return {
      teacherId: parseInt(item.teacherId),
      studentIds: item.studentIds.map(id => parseInt(id)).filter(id => !isNaN(id))
    }
  })
  
  // 检查学生ID列表
  const hasValidStudents = importData.some(item => item.studentIds.length > 0)
  if (!hasValidStudents) {
    ElMessage.warning('请至少为一个导师分配学生')
    return
  }
  
  importLoading.value = true
  try {
    const response = await guidanceRelationApi.batchImportRelations(importData)
    
    if (response?.status === 'success') {
      ElMessage.success('导入成功')
      importDialogVisible.value = false
      getGuidanceList()
    } else {
      ElMessage.error('导入失败')
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请重试')
  } finally {
    importLoading.value = false
  }
}

// 处理导师选择
const handleTeacherSelect = () => {
  if (editForm.teacherId !== null && editForm.teacherId !== undefined && editForm.teacherId !== '') {
    const teacherId = typeof editForm.teacherId === 'number' ? editForm.teacherId : parseInt(editForm.teacherId)
    const teacher = teachers.value.find(t => {
      const tId = typeof t.id === 'number' ? t.id : parseInt(t.id)
      return tId === teacherId
    })
    if (teacher) {
      editForm.teacherAccount = teacher.teacherAccount || ''
      editForm.teacherName = teacher.name || ''
    } else {
      editForm.teacherAccount = ''
      editForm.teacherName = ''
    }
  } else {
    editForm.teacherAccount = ''
    editForm.teacherName = ''
  }
}

// 编辑指导关系
const handleEdit = async (row) => {
  // 加载教师列表
  await getTeachers()
  
  editForm.id = row.id
  editForm.studentAccount = row.studentAccount || ''
  editForm.studentName = row.studentName || ''
  editForm.teacherId = row.teacherId !== null && row.teacherId !== undefined ? row.teacherId : null
  editForm.teacherAccount = row.teacherAccount || ''
  editForm.teacherName = row.teacherName || ''
  editForm.deptName = row.deptName || ''
  editForm.graduationTime = row.graduationTime || ''
  editDialogVisible.value = true
}

// 提交编辑
const submitEdit = async () => {
  if (!editForm.id) {
    ElMessage.warning('数据异常，请刷新页面重试')
    return
  }
  
  if (!editForm.teacherId) {
    ElMessage.warning('请选择导师')
    return
  }
  
  editLoading.value = true
  try {
    const response = await guidanceRelationApi.updateGuidanceRelation({
      id: editForm.id,
      teacherId: parseInt(editForm.teacherId),
      teacherAccount: editForm.teacherAccount,
      teacherName: editForm.teacherName,
      graduationTime: editForm.graduationTime
    })
    
    if (response?.status === 'success') {
      ElMessage.success('修改成功')
      editDialogVisible.value = false
      getGuidanceList()
    } else {
      ElMessage.error('修改失败')
    }
  } catch (error) {
    console.error('修改指导关系失败:', error)
    ElMessage.error('修改失败，请重试')
  } finally {
    editLoading.value = false
  }
}

onMounted(() => {
  getGuidanceList()
})
</script>

<style scoped>
.guidance-relationship {
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

.header-buttons {
  display: flex;
  gap: 10px;
}

.import-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

/* 表格文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}
</style>