<template>
  <div class="process-node-time-setting-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>时间设置</span>
          <div class="header-buttons">
            <el-button 
              type="success" 
              @click="handleAllEnable"
              :loading="batchLoading"
            >
              全部启用
            </el-button>
            <el-button 
              type="danger" 
              @click="handleAllDisable"
              :loading="batchLoading"
            >
              全部禁用
            </el-button>
          </div>
        </div>
      </template>

      <!-- 流程节点列表 -->
      <el-table 
        :data="processNodeList" 
        border 
        style="width: 100%"
        v-loading="loading"
        align="center"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="nodeCode" label="节点编码" width="150" align="center" />
        <el-table-column prop="nodeName" label="节点名称" width="150" align="center" />
        <el-table-column label="开始时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column fixed="right" label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑流程节点配置" width="600px">
      <el-form :model="editForm" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="节点编码">
          <el-input v-model="editForm.nodeCode" disabled />
        </el-form-item>
        <el-form-item label="节点名称">
          <el-input v-model="editForm.nodeName" disabled />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="editForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="editForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="editForm.remark" 
            type="textarea" 
            placeholder="请输入备注"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { post } from '@/utils/request'

// 流程节点列表
const processNodeList = ref([])
const loading = ref(false)
const batchLoading = ref(false)

// 编辑对话框
const editDialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

// 编辑表单
const editForm = reactive({
  id: null,
  nodeCode: '',
  nodeName: '',
  startTime: '',
  endTime: '',
  status: 1,
  remark: ''
})

// 表单验证规则
const formRules = {
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 获取流程节点列表
const getProcessNodeList = async () => {
  loading.value = true
  try {
    const response = await post('/processNode/getList', {
      pageNum: 1,
      pageSize: 100
    })
    if (response?.status === 'success') {
      processNodeList.value = response.data?.records || []
    }
  } catch (error) {
    console.error('获取流程节点列表失败:', error)
    ElMessage.error('获取流程节点列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '未设置'
  return datetime
}

// 编辑节点
const handleEdit = (row) => {
  editForm.id = row.id
  editForm.nodeCode = row.nodeCode
  editForm.nodeName = row.nodeName
  editForm.startTime = row.startTime
  editForm.endTime = row.endTime
  editForm.status = row.status
  editForm.remark = row.remark || ''
  editDialogVisible.value = true
}

// 提交编辑
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const response = await post('/processNode/update', editForm)
        if (response?.status === 'success') {
          ElMessage.success('更新成功')
          editDialogVisible.value = false
          getProcessNodeList()
        }
      } catch (error) {
        console.error('更新流程节点失败:', error)
        ElMessage.error('更新失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 全部启用
const handleAllEnable = () => {
  ElMessageBox.confirm('确定要启用所有流程节点吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    batchLoading.value = true
    try {
      const response = await post('/processNode/allStartOrStop?status=1')
      if (response?.status === 'success') {
        ElMessage.success('已全部启用')
        getProcessNodeList()
      }
    } catch (error) {
      console.error('批量启用失败:', error)
      ElMessage.error('操作失败')
    } finally {
      batchLoading.value = false
    }
  }).catch(() => {})
}

// 全部禁用
const handleAllDisable = () => {
  ElMessageBox.confirm('确定要禁用所有流程节点吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    batchLoading.value = true
    try {
      const response = await post('/processNode/allStartOrStop?status=0')
      if (response?.status === 'success') {
        ElMessage.success('已全部禁用')
        getProcessNodeList()
      }
    } catch (error) {
      console.error('批量禁用失败:', error)
      ElMessage.error('操作失败')
    } finally {
      batchLoading.value = false
    }
  }).catch(() => {})
}

onMounted(() => {
  getProcessNodeList()
})
</script>

<style scoped>
.process-node-time-setting-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}
</style>
