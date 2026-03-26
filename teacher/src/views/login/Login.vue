<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>毕业设计管理系统 - 教师登录</span>
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
            <img
              v-if="captchaImage"
              :src="captchaImage"
              alt="验证码"
              class="captcha-image"
              @click="getCaptcha"
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

// 获取验证码
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

// 处理登录
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
  font-weight: bold;
  font-size: 18px;
  text-align: center;
}

.login-form {
  padding: 20px;
}

.code-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-image {
  height: 40px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
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