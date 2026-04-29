<template>
  <div class="login-container">
    <div class="login-left">
      <div class="info-panel">
        <div class="logo-area">
          <div class="logo-icon">
            <el-icon><School /></el-icon>
          </div>
          <div class="logo-text">
            <h1>毕业设计管理系统</h1>
            <p>系主任管理端</p>
          </div>
        </div>
        
        <div class="welcome-text">
          <h2>欢迎登录</h2>
          <p>统一管理毕业设计全过程</p>
        </div>
        
        <div class="stats-area">
          <div class="stat-item">
            <span class="stat-number">100%</span>
            <span class="stat-label">流程覆盖</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">24h</span>
            <span class="stat-label">实时监控</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">∞</span>
            <span class="stat-label">便捷管理</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="login-right">
      <div class="form-container">
        <div class="form-header">
          <h2>用户登录</h2>
          <p>请输入您的账号信息</p>
        </div>
        
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
              style="width: 60%;"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '@/utils/apiRequest'
import { useUserStore } from '@/stores/user'
import { User, Lock, CircleCheck, RefreshRight, School } from '@element-plus/icons-vue'

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
  role: 3
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
    ElMessage.error('获取验证码失败')
  }
}

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

onMounted(() => {
  getCaptcha()
})
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
}

.login-left {
  flex: 1.2;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffc371 100%);
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  width: 150%;
  height: 150%;
  top: -25%;
  left: -25%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 30px,
    rgba(255, 255, 255, 0.03) 30px,
    rgba(255, 255, 255, 0.03) 60px
  );
}

.login-left::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  bottom: -100px;
  right: -50px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.info-panel {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 80px;
  color: white;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 60px;
}

.logo-icon {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.logo-icon .el-icon {
  font-size: 36px;
  color: white;
}

.logo-text h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.logo-text p {
  font-size: 14px;
  opacity: 0.9;
  letter-spacing: 2px;
}

.welcome-text {
  margin-bottom: 60px;
}

.welcome-text h2 {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.welcome-text p {
  font-size: 18px;
  opacity: 0.9;
}

.stats-area {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.85;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  padding: 40px;
}

.form-container {
  width: 100%;
  max-width: 380px;
}

.form-header {
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-header p {
  font-size: 14px;
  color: #999;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-input__wrapper) {
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid transparent;
  transition: all 0.3s;
}

.login-form :deep(.el-input__wrapper:hover),
.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #ff6b35;
  box-shadow: 0 2px 12px rgba(255, 107, 53, 0.15);
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
  border-radius: 12px;
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
  border-radius: 12px;
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
  height: 50px;
  font-size: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border: none;
  font-weight: 500;
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.35);
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}
</style>
