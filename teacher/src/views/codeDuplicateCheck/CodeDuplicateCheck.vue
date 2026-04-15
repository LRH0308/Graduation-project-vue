<template>
  <div class="code-duplicate-check-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>代码查重</span>
          <el-button type="primary" @click="openUploadDialog" style="margin-left: 20px;">
            新增查重
          </el-button>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operatorName" placeholder="请输入操作人姓名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 列表 -->
      <el-table :data="checkList" v-loading="loading" border style="width: 100%">
        <el-table-column type="index" label="序列" width="80" />
        <el-table-column prop="operatorName" label="操作人" width="120" />
        <el-table-column prop="similarityRate" label="相似度" width="100">
          <template #default="scope">
            {{ scope.row.similarityRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="sourceFileName" label="源文件名" min-width="150" />
        <el-table-column prop="comparisonFileName" label="对比文件名" min-width="150" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" @click="downloadResult(scope.row.id)">
              下载结果
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 无数据提示 -->
      <el-empty v-if="checkList.length === 0 && !loading" description="当前无查重记录" />
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getCheckList"
        @current-change="getCheckList"
        style="margin-top: 20px; text-align: right;"
      />
    </el-card>
    
    <!-- 上传文件对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="代码查重"
      width="500px"
    >
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="源文件">
          <el-upload
            class="upload-demo"
            action=""
            :auto-upload="false"
            :on-change="handleSourceFileChange"
            :file-list="sourceFileList"
            :limit="1"
            accept=".java,.py,.js,.cpp,.c"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                请选择要查重的源文件，支持 .java, .py, .js, .cpp, .c 文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="对比文件">
          <el-upload
            class="upload-demo"
            action=""
            :auto-upload="false"
            :on-change="handleComparisonFileChange"
            :file-list="comparisonFileList"
            :limit="1"
            accept=".java,.py,.js,.cpp,.c"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                请选择要对比的文件，支持 .java, .py, .js, .cpp, .c 文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCheck">开始查重</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { codeDuplicateCheckApi } from '@/utils/apiRequest'

// 搜索表单
const searchForm = reactive({
  operatorName: ''
})

// 查重记录列表数据
const checkList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 上传对话框
const uploadDialogVisible = ref(false)
const uploadForm = reactive({})
const sourceFileList = ref([])
const comparisonFileList = ref([])
let sourceFile = null
let comparisonFile = null

// 获取查重记录列表
const getCheckList = async () => {
  loading.value = true
  try {
    const response = await codeDuplicateCheckApi.getList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    })
    
    if (response?.code === 200) {
      checkList.value = response.data?.records || []
      total.value = response.data?.total || 0
    } else {
      ElMessage.warning('获取查重记录列表失败')
      checkList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取查重记录列表失败:', error)
    ElMessage.error('获取查重记录列表失败')
    checkList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getCheckList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.operatorName = ''
  currentPage.value = 1
  getCheckList()
}

// 打开上传对话框
const openUploadDialog = () => {
  sourceFileList.value = []
  comparisonFileList.value = []
  sourceFile = null
  comparisonFile = null
  uploadDialogVisible.value = true
}

// 处理源文件选择
const handleSourceFileChange = (file) => {
  sourceFileList.value = [file]
  sourceFile = file.raw
}

// 处理对比文件选择
const handleComparisonFileChange = (file) => {
  comparisonFileList.value = [file]
  comparisonFile = file.raw
}

// 提交查重
const submitCheck = async () => {
  if (!sourceFile) {
    ElMessage.warning('请选择源文件')
    return
  }
  if (!comparisonFile) {
    ElMessage.warning('请选择对比文件')
    return
  }
  
  try {
    const response = await codeDuplicateCheckApi.uploadAndCompare(sourceFile, comparisonFile)
    
    if (response?.code === 200) {
      ElMessage.success('查重成功')
      uploadDialogVisible.value = false
      getCheckList()
    } else {
      ElMessage.warning('查重失败')
    }
  } catch (error) {
    console.error('查重失败:', error)
    ElMessage.error('查重失败')
  }
}

// 下载查重结果
const downloadResult = async (id) => {
  try {
    const response = await codeDuplicateCheckApi.downloadResult(id)
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `查重结果_${id}.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载查重结果失败:', error)
    ElMessage.error('下载查重结果失败')
  }
}

onMounted(() => {
  getCheckList()
})
</script>

<style scoped>
.code-duplicate-check-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>