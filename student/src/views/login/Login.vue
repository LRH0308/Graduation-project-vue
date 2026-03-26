<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="login-title">毕业设计管理系统 - 学生端</h2>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
      >
        <el-form-item label="学号" prop="account">
          <el-input
            v-model="loginForm.account"
            placeholder="请输入学号"
            maxlength="12"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            maxlength="32"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item label="验证码" prop="checkCode">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.checkCode"
              placeholder="请输入验证码"
              clearable
              style="width: 150px;"
              @keyup.enter="handleLogin"
            />
            <img
              v-if="captchaImage"
              :src="captchaImage"
              alt="验证码"
              class="captcha-image"
              @click="getCaptcha"
              title="点击刷新验证码"
            />
            <div v-else class="captcha-placeholder" @click="getCaptcha">
              点击获取验证码
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)
const captchaImage = ref('')

// 登录表单数据
const loginForm = reactive({
  account: '',
  password: '',
  checkCode: '',
  checkCodeKey: ''
})

// 表单验证规则（移除验证码长度限制）
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
    // 移除验证码长度限制
  ]
}

// 获取验证码
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

// 登录
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

// 重置表单
const resetForm = () => {
  if (!loginFormRef.value) return
  loginFormRef.value.resetFields()
  loginForm.account = ''
  loginForm.password = ''
  loginForm.checkCode = ''
  getCaptcha()
}

// 组件挂载时检查登录状态
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
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-image {
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 40px;
  transition: opacity 0.3s;
}

.captcha-image:hover {
  opacity: 0.8;
}

.captcha-placeholder {
  width: 120px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #999;
  cursor: pointer;
  background: #f5f5f5;
}

.captcha-placeholder:hover {
  background: #e5e5e5;
}
</style>