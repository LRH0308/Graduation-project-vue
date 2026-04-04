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
      <!-- 师生管理 -->
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/teacherStudent/student')" class="quick-link-card">
          <el-icon><User /></el-icon>
          <div>学生管理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/teacherStudent/teacher')" class="quick-link-card">
          <el-icon><User /></el-icon>
          <div>教师管理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/teacherStudent/guidance')" class="quick-link-card">
          <el-icon><Comment /></el-icon>
          <div>指导关系</div>
        </el-card>
      </el-col>
      
      <!-- 时间节点 -->
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/process/config')" class="quick-link-card">
          <el-icon><Timer /></el-icon>
          <div>时间节点</div>
        </el-card>
      </el-col>
      
      <!-- 流程管理 -->
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
        <el-card shadow="hover" @click="goTo('/openingReport/list')" class="quick-link-card">
          <el-icon><Edit /></el-icon>
          <div>开题报告</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/foreignTranslation/list')" class="quick-link-card">
          <el-icon><Reading /></el-icon>
          <div>外文翻译</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/midtermCheck/list')" class="quick-link-card">
          <el-icon><Collection /></el-icon>
          <div>中期检查</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/thesisDraft/list')" class="quick-link-card">
          <el-icon><Files /></el-icon>
          <div>论文初稿</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/thesisFinal/list')" class="quick-link-card">
          <el-icon><Files /></el-icon>
          <div>论文终稿</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/defense/arrange')" class="quick-link-card">
          <el-icon><Timer /></el-icon>
          <div>答辩安排</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/processGuidance/list')" class="quick-link-card">
          <el-icon><Comment /></el-icon>
          <div>指导记录</div>
        </el-card>
      </el-col>
    </el-row>
      
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Document, Reading, Timer, Comment, User, Calendar, Files, Collection, Edit } from '@element-plus/icons-vue'
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