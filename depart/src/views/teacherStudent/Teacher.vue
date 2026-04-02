<template>
  <div class="teacher-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>导师管理</span>
          <el-button type="primary" @click="getTeacherList" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
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
      
      <!-- 教师列表 -->
      <el-table :data="teacherList" v-loading="loading" border stripe>
        <el-table-column type="index" label="序列" width="60" />
        <el-table-column prop="teacherAccount" label="工号" width="180" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="deptName" label="所属系部" width="180" />
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="getTeacherList"
        @size-change="getTeacherList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { teacherApi } from '@/utils/apiRequest'
import { Refresh } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  teacherName: '',
  teacherAccount: ''
})

// 列表数据
const teacherList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 获取教师列表
const getTeacherList = async () => {
  loading.value = true
  try {
    const response = await teacherApi.getTeacherInfo({
      teacherId: searchForm.teacherAccount || undefined,
      teacherName: searchForm.teacherName || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response?.status === 'success') {
      teacherList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取教师列表失败')
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getTeacherList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.teacherName = ''
  searchForm.teacherAccount = ''
  currentPage.value = 1
  getTeacherList()
}

onMounted(() => {
  getTeacherList()
})
</script>

<style scoped>
.teacher-management {
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

/* 表格文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}
</style>