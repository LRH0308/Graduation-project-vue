<template>
  <div class="topic-apply-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课题申请</span>
        </div>
      </template>
      
      <el-form
        ref="topicFormRef"
        :model="topicForm"
        :rules="topicRules"
        label-width="100px"
        class="topic-form"
      >
        <el-form-item label="课题名称" prop="topicName">
          <el-input
            v-model="topicForm.topicName"
            placeholder="请输入课题名称"
          />
        </el-form-item>
        
        <el-form-item label="课题描述" prop="topicDesc">
          <el-input
            v-model="topicForm.topicDesc"
            type="textarea"
            :rows="4"
            placeholder="请输入课题描述"
          />
        </el-form-item>
        
        <el-form-item label="所属系部" prop="deptCode">
          <el-select
            v-model="topicForm.deptCode"
            placeholder="请选择系部"
            style="width: 100%;"
          >
            <el-option label="计算机系" value="D001" />
            <el-option label="软件工程系" value="D002" />
            <el-option label="网络工程系" value="D003" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="毕业时间" prop="graduationTime">
          <el-input
            v-model="topicForm.graduationTime"
            placeholder="如：2026 届"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交申请</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { topicApi } from '@/utils/apiRequest'

const topicFormRef = ref(null)

const topicForm = reactive({
  topicName: '',
  topicDesc: '',
  deptCode: '',
  graduationTime: ''
})

const topicRules = {
  topicName: [
    { required: true, message: '请输入课题名称', trigger: 'blur' }
  ],
  topicDesc: [
    { required: true, message: '请输入课题描述', trigger: 'blur' }
  ],
  deptCode: [
    { required: true, message: '请选择系部', trigger: 'change' }
  ],
  graduationTime: [
    { required: true, message: '请输入毕业时间', trigger: 'blur' }
  ]
}

// 提交申请
const handleSubmit = async () => {
  if (!topicFormRef.value) return
  
  await topicFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      // 直接传递表单数据，不包装
      const res = await topicApi.apply(topicForm)
      if (res?.status === 'success') {
        ElMessage.success('申请提交成功')
        handleReset()
      }
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败，请重试')
    }
  })
}

// 重置
const handleReset = () => {
  topicForm.topicName = ''
  topicForm.topicDesc = ''
  topicForm.deptCode = ''
  topicForm.graduationTime = ''
  if (topicFormRef.value) {
    topicFormRef.value.clearValidate()
  }
}
</script>

<style scoped>
.topic-apply-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.topic-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>