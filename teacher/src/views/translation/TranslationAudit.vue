<template>
  <div class="translation-audit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>外文翻译审核</span>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="学生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.auditStatus" placeholder="请选择" style="width: 120px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 列表 -->
      <el-table :data="translationList" v-loading="loading" border style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="学号/学生名" width="150">
          <template #default="{ row }">
            {{ row.studentAccount }}/{{ row.studentName }}
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="课题名称" />
        <el-table-column prop="submitTime" label="提交时间" width="160"/>
        <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusType(row.auditStatus)">
              {{ getAuditStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditTime" label="审核时间" width="160"/>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button
              v-if="row.auditStatus === 0"
              size="small"
              type="primary"
              @click="handleAudit(row)"
            >
              审核
            </el-button>
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
        @size-change="getTranslationList"
        @current-change="getTranslationList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="外文翻译详情" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="学生姓名">{{ currentTranslation.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentTranslation.studentAccount }}</el-descriptions-item>
        <el-descriptions-item label="院系">{{ currentTranslation.deptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="课题名称">{{ currentTranslation.projectName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="导师">{{ currentTranslation.teacherAccount }}/{{ currentTranslation.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentTranslation.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ getAuditStatusText(currentTranslation.auditStatus) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentTranslation.auditTime || '无' }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">
          {{ currentTranslation.auditRemark || '无' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 文件信息 -->
      <div class="file-section" style="margin-top: 20px;">
        <h4>文件信息：</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="外文原文">
            <div class="file-item">
              <span>{{ fileNames.originalFileName || '外文原文文件' }}</span>
              <el-button
                v-if="currentTranslation.originalFileId"
                type="primary"
                link
                size="small"
                @click="downloadFile(currentTranslation.originalFileId, fileNames.originalFileName || '外文原文')"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <span v-else class="no-file">未上传</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="外文翻译">
            <div class="file-item">
              <span>{{ fileNames.translateFileName || '外文翻译文件' }}</span>
              <el-button
                v-if="currentTranslation.translateFileId"
                type="primary"
                link
                size="small"
                @click="downloadFile(currentTranslation.translateFileId, fileNames.translateFileName || '外文翻译')"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <span v-else class="no-file">未上传</span>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" title="审核外文翻译" width="500px">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.auditStatus">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="auditForm.auditRemark"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { foreignTranslationApi, fileApi } from '@/utils/apiRequest'

// 搜索表单
const searchForm = reactive({
  studentName: '',
  auditStatus: null
})

// 外文翻译列表
const translationList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 文件名称缓存
const fileNames = reactive({
  originalFileName: '',
  translateFileName: ''
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentTranslation = ref({})

// 审核对话框
const auditDialogVisible = ref(false)
const auditForm = reactive({
  id: null,
  auditStatus: 1,
  auditRemark: ''
})

// 获取文件名称
const getFileName = async (fileId) => {
  if (!fileId) return ''
  try {
    const res = await fileApi.getFileDetail(fileId)
    if (res?.status === 'success' && res.data) {
      return res.data.fileName || ''
    }
  } catch (error) {
    console.error('获取文件详情失败:', error)
  }
  return ''
}

// 获取外文翻译列表
const getTranslationList = async () => {
  loading.value = true
  try {
    const response = await foreignTranslationApi.getForeignLanguageTranslation({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    })

    if (response?.status === 'success') {
      translationList.value = response.data?.records || response.data?.list || []
      total.value = response.data?.total || 0
    } else {
      useMockData()
    }
  } catch (error) {
    console.error('获取外文翻译列表失败:', error)
    ElMessage.error('获取外文翻译列表失败')
    useMockData()
  } finally {
    loading.value = false
  }
}

// 使用模拟数据
const useMockData = () => {
  translationList.value = [
    {
      id: 1,
      deptName: '软件工程系',
      projectName: '基于 Spring Boot 的毕设管理系统',
      originalFileId: 27,
      translateFileId: 28,
      studentId: 1,
      studentAccount: '2020001',
      studentName: '张三',
      submitTime: '2025-03-10 14:00:00',
      auditStatus: 0,
      teacherId: 1,
      teacherAccount: 'T001',
      teacherName: '赵老师',
      auditTime: null,
      auditRemark: null,
      createTime: '2025-03-10 14:00:00',
      updateTime: null
    }
  ]
  total.value = translationList.value.length
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getTranslationList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.studentName = ''
  searchForm.auditStatus = null
  currentPage.value = 1
  getTranslationList()
}

// 查看详情
const handleViewDetail = async (row) => {
  currentTranslation.value = row
  // 获取文件名称
  fileNames.originalFileName = ''
  fileNames.translateFileName = ''
  if (row.originalFileId) {
    fileNames.originalFileName = await getFileName(row.originalFileId)
  }
  if (row.translateFileId) {
    fileNames.translateFileName = await getFileName(row.translateFileId)
  }
  detailDialogVisible.value = true
}

// 审核
const handleAudit = (row) => {
  auditForm.id = row.id
  auditForm.auditStatus = 1
  auditForm.auditRemark = ''
  auditDialogVisible.value = true
}

// 提交审核
const submitAudit = async () => {
  try {
    const res = await foreignTranslationApi.teacherAudit(auditForm)
    if (res?.status === 'success') {
      ElMessage.success('审核成功')
      auditDialogVisible.value = false
      getTranslationList()
    }
  } catch (error) {
    console.error('审核失败:', error)
  }
}

// 下载文件
const downloadFile = async (fileId, fileName) => {
  if (!fileId) {
    ElMessage.warning('暂无可下载文件')
    return
  }

  try {
    ElMessage.info('正在下载文件...')
    // 获取文件详情
    const detailRes = await fileApi.getFileDetail(fileId)
    if (detailRes?.code !== 200 || !detailRes.data) {
      ElMessage.error('获取文件信息失败')
      return
    }

    const fileInfo = detailRes.data

    // 下载文件
    const response = await fileApi.download(fileId)

    // 创建Blob并下载
    const blob = new Blob([response], {
      type: fileInfo.fileType || 'application/octet-stream'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || fileInfo.fileName || '下载文件'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('下载文件失败:', error)
    ElMessage.error('下载文件失败，请重试')
  }
}

// 获取状态文本
const getAuditStatusText = (status) => {
  const map = { 0: '待审核', 1: '审核通过', 2: '审核驳回' }
  return map[status] || '未知'
}

// 获取状态类型
const getAuditStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

onMounted(() => {
  getTranslationList()
})
</script>

<style scoped>
.translation-audit-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.search-form {
  margin-bottom: 20px;
}

/* 表格文本居中 */
:deep(.el-table th),
:deep(.el-table td) {
  text-align: center;
}

.file-section h4 {
  margin: 10px 0;
  color: #606266;
  font-size: 16px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-file {
  color: #909399;
  font-size: 12px;
}
</style>
