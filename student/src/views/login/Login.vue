<template>
  <div class="login-container">
    <div class="login-left">
      <div class="login-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="content-wrapper">
          <h1 class="system-name">毕业设计管理系统</h1>
          <p class="system-subtitle">学生端</p>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon><Document /></el-icon>
              <span>论文管理</span>
            </div>
            <div class="feature-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>师生互动</span>
            </div>
            <div class="feature-item">
              <el-icon><DataAnalysis /></el-icon>
              <span>进度追踪</span>
            </div>
            <div class="feature-item">
              <el-icon><Files /></el-icon>
              <span>文件共享</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="login-right">
      <div class="login-form-wrapper">
        <div class="login-header">
          <h2 class="login-title">欢迎登录</h2>
          <p class="login-hint">请输入您的学号和密码登录系统</p>
        </div>
        
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
        >
          <el-form-item prop="account">
            <div class="input-wrapper">
              <el-icon class="input-icon"><User /></el-icon>
              <el-input
                v-model="loginForm.account"
                placeholder="请输入学号"
                maxlength="12"
                clearable
              />
            </div>
          </el-form-item>
          
          <el-form-item prop="password">
            <div class="input-wrapper">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                maxlength="32"
                show-password
                clearable
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>
          
          <el-form-item prop="checkCode">
            <div class="captcha-wrapper">
              <div class="input-wrapper captcha-input">
                <el-icon class="input-icon"><CircleCheck /></el-icon>
                <el-input
                  v-model="loginForm.checkCode"
                  placeholder="请输入验证码"
                  clearable
                  @keyup.enter="handleLogin"
                />
              </div>
              <div class="captcha-image-wrapper" @click="getCaptcha">
                <img
                  v-if="captchaImage"
                  :src="captchaImage"
                  alt="验证码"
                  class="captcha-image"
                />
                <div v-else class="captcha-placeholder">
                  <el-icon><RefreshRight /></el-icon>
                  <span>点击获取</span>
                </div>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { User, Lock, CircleCheck, RefreshRight, Document, ChatDotRound, DataAnalysis, Files } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)
const captchaImage = ref('')

const loginForm = reactive({
  account: '',
  password: '',
  checkCode: '',
  checkCodeKey: ''
})

const loginRules = {
  account: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 1, max: 12, message: '学号长度在 1 到 12 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 32, message: '密码长度在 8 到 32 个字符', trigger: 'blur' }
  ],
  checkCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const getCaptcha = async () => {
  try {
    const response = await userStore.getCaptcha()
    
    if (response.status === 'success') {
      captchaImage.value = response.data.checkCode
      loginForm.checkCodeKey = response.data.checkCodeKey
      loginForm.checkCode = ''
    } else {
      ElMessage.error('获取验证码失败')
    }
  } catch (error) {
    console.error('获取验证码异常:', error)
    ElMessage.error('获取验证码失败，请重试')
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!loginForm.checkCodeKey) {
        ElMessage.error('验证码信息不完整，请刷新验证码')
        await getCaptcha()
        return
      }
      
      loading.value = true
      
      try {
        const loginData = {
          account: loginForm.account.trim(),
          password: loginForm.password.trim(),
          checkCode: loginForm.checkCode.trim(),
          checkCodeKey: loginForm.checkCodeKey
        }
        
        const result = await userStore.login(loginData)
        
        if (result.status === 'success') {
          ElMessage.success('登录成功！')
          setTimeout(() => {
            router.push('/home')
          }, 500)
        } else {
          ElMessage.error(result.info || '登录失败')
          await getCaptcha()
        }
      } catch (error) {
        console.error('登录异常:', error)
        const errorMsg = error.response?.data?.info || error.message || '登录失败，请重试'
        ElMessage.error(errorMsg)
        await getCaptcha()
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(async () => {
  if (userStore.token) {
    try {
      const isValid = await userStore.validateToken()
      if (isValid) {
        router.push('/home')
        return
      }
    } catch (error) {
      console.error('验证登录状态失败:', error)
    }
  }
  
  getCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-decoration {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -50px;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
}

.content-wrapper {
  position: relative;
  z-index: 1;
  color: white;
  text-align: center;
  padding: 40px;
}

.system-name {
  font-size: 42px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: 2px;
}

.system-subtitle {
  font-size: 24px;
  opacity: 0.9;
  margin-bottom: 60px;
  letter-spacing: 8px;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 400px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.feature-item .el-icon {
  font-size: 24px;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
}

.login-header {
  margin-bottom: 40px;
}

.login-title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.login-hint {
  font-size: 14px;
  color: #999;
}

.login-form {
  margin-top: 20px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-icon {
  color: #999;
  margin-right: 12px;
  font-size: 18px;
}

.captcha-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-image-wrapper {
  flex-shrink: 0;
}

.captcha-image {
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #e8e8e8;
  transition: opacity 0.3s;
}

.captcha-image:hover {
  opacity: 0.8;
}

.captcha-placeholder {
  height: 44px;
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.captcha-placeholder:hover {
  background: #e8e8e8;
}

.captcha-placeholder .el-icon {
  font-size: 18px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__inner) {
  border: none;
  background: transparent;
  padding: 0;
}

:deep(.el-input__inner:focus) {
  box-shadow: none;
}
</style>
