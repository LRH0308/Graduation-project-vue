<template>
  <div class="refresh-container">
    <el-icon class="loading-icon" :size="50"><Loading /></el-icon>
    <p>正在刷新页面...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const redirect = route.query.redirect || '/home'
  setTimeout(() => {
    router.replace(redirect)
  }, 100)
})
</script>

<style scoped>
.refresh-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
}

.loading-icon {
  animation: rotate 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>