<template>
  <div class="login-container">
    <div class="bg-particles">
      <div class="particle" v-for="i in 6" :key="i"></div>
    </div>
    
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>
    
    <div class="login-card">
      <div class="card-header">
        <div class="logo-badge">
          <el-icon><Key /></el-icon>
        </div>
        <div class="header-text">
          <h1>毕业设计管理系统</h1>
          <p>系统管理后台</p>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <h2 class="form-title">管理员登录</h2>
      <p class="form-subtitle">请输入您的管理员账号信息</p>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="account">
          <div class="input-group">
            <div class="input-icon">
              <el-icon><User /></el-icon>
            </div>
            <el-input
              v-model="loginForm.account"
              placeholder="请输入管理员账号"
              size="large"
              clearable
            />
          </div>
        </el-form-item>
        
        <el-form-item prop="password">
          <div class="input-group">
            <div class="input-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              clearable
              @keyup.enter="handleLogin"
            />
          </div>
        </el-form-item>
        
        <el-form-item prop="checkCode">
          <div class="captcha-group">
            <div class="input-group captcha-input">
              <div class="input-icon">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <el-input
                v-model="loginForm.checkCode"
                placeholder="验证码"
                size="large"
                clearable
                @keyup.enter="handleLogin"
              />
            </div>
            <div class="captcha-img" @click="getCaptcha">
              <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
              <div v-else class="captcha-loading">
                <el-icon><RefreshRight /></el-icon>
              </div>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-btn"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="system-info">
      <span>Graduation Design Management System</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { Key, User, Lock, CircleCheck, RefreshRight } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)
const captchaImage = ref('')

const loginForm = reactive({
  account: '',
  password: '',
  checkCode: '',
  checkCodeKey: '',
})

const loginRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 1, max: 12, message: '账号长度在 1 到 12 个字符', trigger: 'blur' }
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
    const response = await userStore.checkCode()
    
    if (response.status === 'success') {
      captchaImage.value = response.data.checkCode
      loginForm.checkCodeKey = response.data.checkCodeKey
      loginForm.checkCode = ''
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败')
  }
}

const handleLogin = async () => {
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    if (!loginForm.checkCodeKey) {
      ElMessage.error('验证码已过期，请重新获取')
      getCaptcha()
      return
    }
    
    loading.value = true
    try {
      const response = await userStore.login(loginForm)
      
      if (response.status === 'success') {
        ElMessage.success('登录成功')
        router.push('/home')
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error(error.message || '登录失败')
      getCaptcha()
      loginForm.checkCode = ''
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  getCaptcha()
})
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow: hidden;
}

.bg-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s ease-in-out infinite;
}

.particle:nth-child(1) {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.particle:nth-child(2) {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
}

.particle:nth-child(3) {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 10%;
  animation-delay: -10s;
}

.particle:nth-child(4) {
  width: 100px;
  height: 100px;
  top: 20%;
  right: 20%;
  animation-delay: -15s;
}

.particle:nth-child(5) {
  width: 80px;
  height: 80px;
  bottom: 30%;
  left: 20%;
  animation-delay: -7s;
}

.particle:nth-child(6) {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 10%;
  animation-delay: -12s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.05);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(20px, 30px) scale(1.02);
  }
}

.bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.shape-1 {
  width: 600px;
  height: 600px;
  top: -300px;
  right: -200px;
  animation: rotate 30s linear infinite;
}

.shape-2 {
  width: 400px;
  height: 400px;
  bottom: -200px;
  left: -100px;
  animation: rotate 25s linear infinite reverse;
}

.shape-3 {
  width: 300px;
  height: 300px;
  top: 40%;
  left: 50%;
  animation: rotate 20s linear infinite;
}

.shape-4 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 30%;
  animation: rotate 15s linear infinite reverse;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.login-card {
  position: relative;
  z-index: 10;
  width: 420px;
  padding: 40px 50px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.logo-badge {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(26, 26, 46, 0.3);
}

.logo-badge .el-icon {
  font-size: 28px;
  color: white;
}

.header-text h1 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 2px;
}

.header-text p {
  font-size: 13px;
  color: #666;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e8e8e8, transparent);
  margin: 0 -50px 28px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 14px;
  color: #888;
  margin-bottom: 32px;
}

.login-form {
  width: 100%;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 16px;
  z-index: 10;
  color: #888;
  font-size: 18px;
  pointer-events: none;
}

.input-group :deep(.el-input__wrapper) {
  padding: 14px 16px 14px 48px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8e8e8;
  transition: all 0.3s;
}

.input-group :deep(.el-input__wrapper:hover),
.input-group :deep(.el-input__wrapper.is-focus) {
  border-color: #1a1a2e;
  box-shadow: 0 4px 16px rgba(26, 26, 46, 0.1);
}

.input-group :deep(.el-input__inner) {
  font-size: 15px;
}

.captcha-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  flex-shrink: 0;
  cursor: pointer;
}

.captcha-img img {
  height: 44px;
  width: 100px;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s;
  object-fit: cover;
}

.captcha-img img:hover {
  border-color: #1a1a2e;
  transform: scale(1.02);
}

.captcha-loading {
  width: 100px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  color: #888;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.login-btn {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 4px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(26, 26, 46, 0.4);
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

.system-info {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
}
</style>
