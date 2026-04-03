<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="login-title">毕业设计管理系统 - 管理员端</h2>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
      >
        <el-form-item label="账号" prop="account">
          <el-input
            v-model="loginForm.account"
            placeholder="请输入管理员账号"
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
  checkCodeKey: '',
})

// 表单验证规则
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

// 获取验证码（参考 student 端实现）
const getCaptcha = async () => {
  try {
    const response = await userStore.checkCode()
    
    if (response.status === 'success') {
      captchaImage.value = response.data.checkCode
      loginForm.checkCodeKey = response.data.checkCodeKey
      loginForm.checkCode = ''
      console.log('验证码获取成功，checkCodeKey:', loginForm.checkCodeKey)
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败')
  }
}

// 处理登录（参考 student 端实现）
const handleLogin = async () => {
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 验证 checkCodeKey 是否存在
    if (!loginForm.checkCodeKey) {
      ElMessage.error('验证码已过期，请重新获取')
      getCaptcha()
      return
    }
    
    loading.value = true
    try {
      // 直接传递 loginForm 对象（参考 student 端）
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

// 组件挂载时获取验证码
onMounted(() => {
  getCaptcha()
})
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.login-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-image {
  width: 120px;
  height: 40px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.captcha-image:hover {
  border-color: #409eff;
}

.captcha-placeholder {
  width: 120px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  color: #909399;
  font-size: 12px;
}

.captcha-placeholder:hover {
  border-color: #409eff;
  color: #409eff;
}
</style>