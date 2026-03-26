<template>
  <div class="guide-fill-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>填写指导记录</span>
        </div>
      </template>
      
      <el-form
        ref="guideFormRef"
        :model="guideForm"
        label-width="100px"
        class="guide-form"
      >
        <el-form-item label="指导学生" required>
          <el-select
            v-model="guideForm.studentId"
            placeholder="请选择学生"
            style="width: 100%;"
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
            v-model="guideForm.topicName"
            disabled
            placeholder="自动获取"
          />
        </el-form-item>
        
        <el-form-item label="指导时间">
          <el-date-picker
            v-model="guideForm.guidanceTime"
            type="datetime"
            placeholder="选择指导时间"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="指导内容" required>
          <el-input
            v-model="guideForm.guidanceContent"
            type="textarea"
            :rows="6"
            placeholder="请输入指导内容"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { guidanceApi } from '@/utils/apiRequest'

const router = useRouter()

const guideFormRef = ref(null)

const guideForm = reactive({
  projectId: null,
  studentId: null,
  topicName: '',
  guidanceTime: new Date(),
  guidanceContent: ''
})

const studentList = ref([])

// 获取学生列表
const getStudentList = async () => {
  try {
    // 调用 API 获取所指导学生列表
    // const res = await xxxApi.getStudentList()
    // studentList.value = res.data || []
    
    // 模拟数据
    studentList.value = [
      { id: 1, studentName: '张三', studentAccount: '2020001', projectId: 5 },
      { id: 2, studentName: '李四', studentAccount: '2020002', projectId: 6 }
    ]
  } catch (error) {
    console.error('获取学生列表失败:', error)
  }
}

// 学生选择变化
const handleStudentChange = (studentId) => {
  const student = studentList.value.find(s => s.id === studentId)
  if (student) {
    guideForm.projectId = student.projectId
    guideForm.topicName = student.topicName
  }
}

// 提交
const handleSubmit = async () => {
  if (!guideForm.studentId) {
    ElMessage.warning('请选择学生')
    return
  }
  if (!guideForm.guidanceContent) {
    ElMessage.warning('请输入指导内容')
    return
  }
  
  try {
    const res = await guidanceApi.teacherFill({
      projectId: guideForm.projectId,
      studentId: guideForm.studentId,
      guidanceContent: guideForm.guidanceContent,
      guidanceTime: guideForm.guidanceTime
    })
    
    if (res?.status === 'success') {
      ElMessage.success('填写成功')
      router.push('/record/guide')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  }
}

// 重置
const handleReset = () => {
  guideForm.studentId = null
  guideForm.topicName = ''
  guideForm.guidanceTime = new Date()
  guideForm.guidanceContent = ''
}

// 返回
const handleBack = () => {
  router.back()
}

onMounted(() => {
  getStudentList()
})
</script>

<style scoped>
.guide-fill-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.guide-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>