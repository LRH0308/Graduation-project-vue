<template>
  <div class="task-apply-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务书申请</span>
        </div>
      </template>
      
      <el-form
        ref="taskFormRef"
        :model="taskForm"
        label-width="100px"
        class="task-form"
      >
        <el-form-item label="选择学生" required>
          <el-select
            v-model="taskForm.studentId"
            placeholder="请选择学生"
            style="width: 100%;"
            @change="handleStudentChange"
          >
            <el-option
              v-for="student in studentList"
              :key="student.id"
              :label="student.studentName"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="课题名称">
          <el-input
            v-model="taskForm.topicName"
            disabled
          />
        </el-form-item>
        
        <el-form-item label="上传文件" required>
          <input
            type="file"
            @change="handleFileChange"
            accept=".doc,.docx,.pdf"
          />
          <p class="tips">支持格式：doc, docx, pdf，最大 50MB</p>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { taskBookApi, fileApi } from '@/utils/apiRequest'

const taskFormRef = ref(null)
const submitting = ref(false)

const taskForm = reactive({
  studentId: null,
  studentAccount: '',
  studentName: '',
  projectId: null,
  topicName: ''
})

const studentList = ref([
  { id: 1, studentAccount: '2020001', studentName: '张三', projectId: 5 },
  { id: 2, studentAccount: '2020002', studentName: '李四', projectId: 6 }
])

const uploadFile = ref(null)

// 学生选择变化
const handleStudentChange = (studentId) => {
  const student = studentList.value.find(s => s.id === studentId)
  if (student) {
    taskForm.studentAccount = student.studentAccount
    taskForm.studentName = student.studentName
    taskForm.projectId = student.projectId
    taskForm.topicName = student.topicName
  }
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 50 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过 50MB')
      event.target.value = ''
      return
    }
    uploadFile.value = file
  }
}

// 提交
const handleSubmit = async () => {
  if (!taskForm.studentId) {
    ElMessage.warning('请选择学生')
    return
  }
  if (!uploadFile.value) {
    ElMessage.warning('请上传文件')
    return
  }
  
  submitting.value = true
  try {
    // 上传文件
    const uploadRes = await fileApi.upload(uploadFile.value, {
      fileType: 1,
      projectId: taskForm.projectId
    })
    
    if (uploadRes?.status === 'success') {
      const fileId = uploadRes.data.id
      
      // 申请任务书
      const res = await taskBookApi.applyTaskBook({
        taskBookDTO: {
          projectId: taskForm.projectId,
          fileId: fileId
        },
        studentInfoDTO: {
          id: taskForm.studentId,
          studentAccount: taskForm.studentAccount,
          name: taskForm.studentName
        }
      })
      
      if (res?.status === 'success') {
        ElMessage.success('任务书申请成功')
        handleReset()
      }
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 重置
const handleReset = () => {
  taskForm.studentId = null
  taskForm.studentAccount = ''
  taskForm.studentName = ''
  taskForm.projectId = null
  taskForm.topicName = ''
  uploadFile.value = null
}
</script>

<style scoped>
.task-apply-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.task-form {
  max-width: 600px;
  margin: 0 auto;
}

.tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>