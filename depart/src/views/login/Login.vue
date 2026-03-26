<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>毕业设计管理系统 - 系主任登录</span>
        </div>
      </template>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
        class="login-form"
      >
        <el-form-item label="工号" prop="account">
          <el-input
            v-model="loginForm.account"
            placeholder="请输入工号"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="验证码" prop="checkCode">
          <div class="code-input">
            <el-input
              v-model="loginForm.checkCode"
              placeholder="请输入验证码"
              style="width: 150px;"
            />
            <div 
              class="captcha-box"
              @click="getCaptcha"
            >
              <img
                v-if="captchaImage"
                :src="captchaImage"
                alt="验证码"
                class="captcha-image"
                @error="handleImageError"
              />
              <span v-else class="captcha-placeholder">获取验证码</span>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%;"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '@/utils/apiRequest'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)
const captchaImage = ref('')
const imageError = ref(false)

const loginForm = reactive({
  account: '',
  password: '',
  checkCode: '',
  checkCodeKey: '',
  role: 3 // 系主任角色ID
})

const loginRules = {
  account: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  checkCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

// 获取验证码
const getCaptcha = async () => {
  try {
    imageError.value = false
    const res = await userApi.checkCode()
    if (res?.status === 'success') {
      loginForm.checkCodeKey = res.data.checkCodeKey
      captchaImage.value = res.data.checkCode
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败')
  }
}

// 处理图片加载错误
const handleImageError = () => {
  imageError.value = true
  captchaImage.value = ''
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      const response = await userStore.login(loginForm)
      if (response?.status === 'success') {
        ElMessage.success('登录成功')
        router.push('/home')
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error(error.message || '登录失败，请检查账号密码')
      getCaptcha()
      loginForm.checkCode = ''
    } finally {
      loading.value = false
    }
  })
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 450px;
}

.card-header {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.login-form {
  margin-top: 20px;
}

.code-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-box {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.captcha-placeholder {
  color: #909399;
  font-size: 12px;
}
</style>