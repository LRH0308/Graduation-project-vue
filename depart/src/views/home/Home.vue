<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用毕业设计管理系统 - 系主任端</span>
        </div>
      </template>
      <div class="welcome-content">
        <p>您好！{{ userStore.displayName }}，请通过左侧菜单选择相应功能模块进行操作。</p>
        <p class="tips">系主任端主要负责课题审核、任务书审核、答辩安排等管理工作。</p>
      </div>
    </el-card>
    
    <el-row :gutter="20" class="quick-links">
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/subject/audit')" class="quick-link-card">
          <el-icon><Document /></el-icon>
          <div>课题审核</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/task/audit')" class="quick-link-card">
          <el-icon><Reading /></el-icon>
          <div>任务书审核</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/defense/arrange')" class="quick-link-card">
          <el-icon><Timer /></el-icon>
          <div>答辩安排</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/record/guide')" class="quick-link-card">
          <el-icon><Comment /></el-icon>
          <div>指导记录</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 待办事项统计 -->
    <el-row :gutter="20" class="stat-links">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409EFF;">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.topicAuditCount }}</div>
              <div class="stat-label">待审核课题</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67C23A;">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.taskAuditCount }}</div>
              <div class="stat-label">待审核任务书</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #E6A23C;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.studentCount }}</div>
              <div class="stat-label">本系学生数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #F56C6C;">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.defenseCount }}</div>
              <div class="stat-label">待安排答辩</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Document, Reading, Timer, Comment, User, Calendar } from '@element-plus/icons-vue'
import { reactive } from 'vue'

const router = useRouter()
const userStore = useUserStore()

const statData = reactive({
  topicAuditCount: 0,
  taskAuditCount: 0,
  studentCount: 0,
  defenseCount: 0
})

// 跳转到指定页面
const goTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-content {
  text-align: center;
  padding: 20px 0;
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

.quick-links, .stat-links {
  margin-bottom: 20px;
}

.quick-link-card, .stat-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 20px 0;
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

.stat-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .el-icon {
  font-size: 30px;
  color: #fff;
}

.stat-info {
  text-align: left;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}
</style>