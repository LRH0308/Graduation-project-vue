<template>
  <div class="login-container">
    <div class="bg-decoration">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>
    
    <div class="login-wrapper">
      <div class="login-header">
        <div class="logo-icon">
          <el-icon><Reading /></el-icon>
        </div>
        <h1 class="system-title">毕业设计管理系统</h1>
        <p class="system-desc">教师端</p>
      </div>
      
      <div class="login-card">
        <h2 class="card-title">账号登录</h2>
        
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
        >
          <el-form-item prop="account">
            <el-input
              v-model="loginForm.account"
              placeholder="请输入工号"
              size="large"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item prop="checkCode">
            <el-input
              v-model="loginForm.checkCode"
              placeholder="请输入验证码"
              size="large"
              :prefix-icon="CircleCheck"
              style="width: 55%;"
              clearable
              @keyup.enter="handleLogin"
            />
            <div class="captcha-wrapper" @click="getCaptcha">
              <img
                v-if="captchaImage"
                :src="captchaImage"
                alt="验证码"
                class="captcha-img"
              />
              <div v-else class="captcha-placeholder">
                <el-icon><RefreshRight /></el-icon>
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
    </div>
    
    <div class="footer-hint">
      <span>© 2024 毕业设计管理系统</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '@/utils/apiRequest'
import { useUserStore } from '@/stores/user'
import { User, Lock, CircleCheck, RefreshRight, Reading } from '@element-plus/icons-vue'

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
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  checkCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const getCaptcha = async () => {
  try {
    const res = await userApi.checkCode()
    if (res?.status === 'success') {
      loginForm.checkCodeKey = res.data.checkCodeKey
      captchaImage.value = res.data.checkCode
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      const res = await userStore.login({
        account: loginForm.account,
        password: loginForm.password,
        checkCode: loginForm.checkCode,
        checkCodeKey: loginForm.checkCodeKey
      })

      if (res?.status === 'success') {
        userStore.token = res.data.token
        userStore.userInfo = res.data
        localStorage.setItem('token', res.data.token)
        ElMessage.success('登录成功')
        router.push('/home')
      }
    } catch (error) {
      console.error('登录失败:', error)
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
  min-height: 100vh;
  background: linear-gradient(120deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%);
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.wave {
  position: absolute;
  width: 200%;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.wave1 {
  top: -100px;
  left: -50%;
  animation: waveMove 8s ease-in-out infinite;
}

.wave2 {
  bottom: -150px;
  right: -50%;
  animation: waveMove 10s ease-in-out infinite reverse;
}

.wave3 {
  top: 50%;
  left: -30%;
  animation: waveMove 12s ease-in-out infinite;
}

@keyframes waveMove {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(-5%) translateY(10px);
  }
}

.login-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.logo-icon .el-icon {
  font-size: 40px;
  color: white;
}

.system-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.system-desc {
  font-size: 18px;
  opacity: 0.9;
  letter-spacing: 4px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-input__wrapper) {
  padding: 12px 16px;
  border-radius: 10px;
}

.login-form :deep(.el-input__inner) {
  font-size: 15px;
}

.captcha-wrapper {
  margin-left: 12px;
  cursor: pointer;
}

.captcha-img {
  height: 44px;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  transition: opacity 0.3s;
}

.captcha-img:hover {
  opacity: 0.8;
}

.captcha-placeholder {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  color: #999;
  transition: all 0.3s;
}

.captcha-placeholder:hover {
  background: #ebeef5;
  color: #666;
}

.captcha-placeholder .el-icon {
  font-size: 20px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 10px;
  background: linear-gradient(120deg, #0077b6 0%, #00b4d8 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 119, 182, 0.4);
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

.footer-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}
</style>
