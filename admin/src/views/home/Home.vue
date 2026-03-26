<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <div class="welcome-content">
        <h2>欢迎使用毕业设计管理系统 - 管理员端</h2>
        <p>当前用户：{{ userStore.userName || '管理员' }}</p>
        <p class="tips">请在左侧菜单选择功能模块进行管理</p>
      </div>
    </el-card>
    
    <el-row :gutter="20" class="quick-links">
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/topic/manage')" class="quick-link-card">
          <el-icon><Document /></el-icon>
          <div>选题管理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/taskbook/manage')" class="quick-link-card">
          <el-icon><Reading /></el-icon>
          <div>任务书管理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/openingreport/manage')" class="quick-link-card">
          <el-icon><Edit /></el-icon>
          <div>开题报告管理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/midtermcheck/manage')" class="quick-link-card">
          <el-icon><Collection /></el-icon>
          <div>中期检查管理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/thesis/manage')" class="quick-link-card">
          <el-icon><Files /></el-icon>
          <div>论文提交管理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/defense/manage')" class="quick-link-card">
          <el-icon><Timer /></el-icon>
          <div>答辩管理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/guidance/manage')" class="quick-link-card">
          <el-icon><Comment /></el-icon>
          <div>过程指导管理</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Document, Reading, Edit, Collection, Files, Timer, Comment } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const goTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-content {
  text-align: center;
  padding: 20px 0;
}

.welcome-content h2 {
  margin: 0 0 15px 0;
  color: #303133;
}

.welcome-content p {
  font-size: 16px;
  color: #606266;
  margin: 10px 0;
}

.welcome-content .tips {
  font-size: 14px;
  color: #909399;
}

.quick-links {
  margin-bottom: 20px;
}

.quick-link-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 20px 0;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.quick-link-card:hover {
  transform: translateY(-5px);
  border-color: #409eff;
}

.quick-link-card .el-icon {
  font-size: 40px;
  color: #409eff;
  margin-bottom: 10px;
}

.quick-link-card div {
  font-size: 14px;
  color: #606266;
}
</style>