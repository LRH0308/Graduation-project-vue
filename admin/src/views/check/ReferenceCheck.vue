<template>
  <div class="reference-check-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>参考文献格式校对</span>
        </div>
      </template>
      
      <el-form :model="form" label-width="100px">
        <el-form-item label="参考文献文本">
          <el-input
            v-model="form.referenceText"
            type="textarea"
            :rows="10"
            placeholder="请输入要校对的参考文献文本，每行一条"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitCheck">开始校对</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 校对结果 -->
      <el-card v-if="result" class="result-card">
        <template #header>
          <div class="result-header">
            <span>校对结果</span>
          </div>
        </template>
        
        <div class="result-content">
          <div class="result-item">
            <h4>原格式：</h4>
            <pre class="original-text">{{ form.referenceText }}</pre>
          </div>
          
          <div class="result-item">
            <h4>建议格式：</h4>
            <pre class="suggested-text">{{ result.correctedReference }}</pre>
          </div>
          
          <div class="result-item" v-if="result.problems && result.problems.length > 0">
            <h4>问题分析：</h4>
            <div class="problems-list">
              <div v-for="(problem, index) in result.problems" :key="index" class="problem-item">
                {{ problem }}
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { referenceCheckApi } from '@/utils/apiRequest'

// 表单数据
const form = reactive({
  referenceText: ''
})

// 校对结果
const result = ref(null)

// 提交校对
const submitCheck = async () => {
  if (!form.referenceText.trim()) {
    ElMessage.warning('请输入参考文献文本')
    return
  }
  
  try {
    const response = await referenceCheckApi.checkReference({
      referenceText: form.referenceText
    })
    
    if (response?.code === 200) {
      result.value = response.data
    } else {
      ElMessage.warning('校对失败')
    }
  } catch (error) {
    console.error('校对失败:', error)
    ElMessage.error('校对失败')
  }
}

// 重置表单
const resetForm = () => {
  form.referenceText = ''
  result.value = null
}
</script>

<style scoped>
.reference-check-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.result-card {
  margin-top: 20px;
}

.result-header {
  font-weight: bold;
  color: #409eff;
}

.result-content {
  margin-top: 10px;
}

.result-item {
  margin-bottom: 20px;
}

.result-item h4 {
  margin-bottom: 10px;
  color: #303133;
}

.original-text,
.suggested-text {
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f5f7fa;
  white-space: pre-wrap;
  font-family: 'Courier New', Courier, monospace;
}

.suggested-text {
  background-color: #f0f9eb;
  border-color: #c2e7b0;
}

.problems-list {
  margin-top: 10px;
}

.problem-item {
  margin-bottom: 8px;
  padding: 8px 12px;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #cf1322;
}
</style>