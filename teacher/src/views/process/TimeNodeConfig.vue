<template>
  <div class="time-node-config-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>时间节点</span>
        </div>
      </template>

      <el-table 
        :data="timeNodeList" 
        border 
        style="width: 100%"
        v-loading="loading"
        align="center"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
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
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { post } from '@/utils/request'

// 时间节点列表
const timeNodeList = ref([])
const loading = ref(false)

// 获取时间节点列表
const getTimeNodeList = async () => {
  loading.value = true
  try {
    const response = await post('/processNode/getList', {
      pageNum: 1,
      pageSize: 100
    })
    if (response?.status === 'success') {
      timeNodeList.value = response.data?.records || []
    }
  } catch (error) {
    console.error('获取时间节点列表失败:', error)
    ElMessage.error('获取时间节点列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '未设置'
  return datetime
}

onMounted(() => {
  getTimeNodeList()
})
</script>

<style scoped>
.time-node-config-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}
</style>
