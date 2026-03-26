<template>
  <div class="defense-arrange-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>答辩安排</span>
          <el-button type="primary" @click="getDefenseList" :loading="loading">
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
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentAccount" label="学号" width="120" />
        <el-table-column prop="teacherName" label="指导教师" width="120" />
        <el-table-column prop="projectId" label="毕业设计ID" width="120" />
        <el-table-column prop="defenseTime" label="答辩时间" width="160" />
        <el-table-column prop="defenseLocation" label="答辩地点" width="120" />
        <el-table-column prop="defenseGroup" label="答辩分组" width="100" />
        <el-table-column prop="remark" label="备注" width="150" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
            <el-button 
              v-if="!row.defenseTime" 
              type="success" 
              size="small" 
              @click="handleArrange(row)"
            >
              安排
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
        @current-change="getDefenseList"
        @size-change="getDefenseList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 安排答辩对话框 -->
    <el-dialog v-model="arrangeDialogVisible" title="安排答辩" width="600px">
      <el-form :model="arrangeForm" label-width="100px">
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
          <el-input v-model="arrangeForm.defenseLocation" placeholder="请输入答辩地点" />
        </el-form-item>
        <el-form-item label="答辩分组">
          <el-input v-model="arrangeForm.defenseGroup" placeholder="请输入答辩分组" />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input
            v-model="arrangeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注说明"
          />
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
        <el-descriptions-item label="学生姓名">{{ currentDefense.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentDefense.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{ currentDefense.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="毕业设计ID">{{ currentDefense.projectId }}</el-descriptions-item>
        <el-descriptions-item label="答辩时间">{{ currentDefense.defenseTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="答辩地点">{{ currentDefense.defenseLocation || '-' }}</el-descriptions-item>
        <el-descriptions-item label="答辩分组">{{ currentDefense.defenseGroup || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注说明">{{ currentDefense.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="系部名称">{{ currentDefense.deptName || '-' }}</el-descriptions-item>
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
const arrangeForm = reactive({
  projectId: null,
  studentId: null,
  defenseTime: '',
  defenseLocation: '',
  defenseGroup: '',
  remark: ''
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentDefense = ref({})

// 获取答辩安排列表
const getDefenseList = async () => {
  loading.value = true
  try {
    const response = await defenseApi.getDefenseArrangement({
      deptCode: '', // 从 Token 自动获取
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

// 查看详情
const handleDetail = (row) => {
  currentDefense.value = { ...row }
  detailDialogVisible.value = true
}

// 安排答辩
const handleArrange = (row) => {
  arrangeForm.projectId = row.projectId
  arrangeForm.studentId = row.studentId
  arrangeForm.defenseTime = ''
  arrangeForm.defenseLocation = ''
  arrangeForm.defenseGroup = ''
  arrangeForm.remark = ''
  arrangeDialogVisible.value = true
}

// 提交安排
const submitArrange = async () => {
  submitLoading.value = true
  try {
    const response = await defenseApi.deptArrange({
      projectId: arrangeForm.projectId,
      studentId: arrangeForm.studentId,
      defenseTime: arrangeForm.defenseTime,
      defenseLocation: arrangeForm.defenseLocation,
      defenseGroup: arrangeForm.defenseGroup,
      remark: arrangeForm.remark
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

.search-form {
  margin-bottom: 20px;
}
</style>