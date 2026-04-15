<template>
  <div class="check-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>检查工具</span>
        </div>
      </template>
      <div class="check-tools">
        <el-card class="tool-card" @click="navigateToLibrary">
          <div class="tool-icon">
            <el-icon class="icon-large"><Reading /></el-icon>
          </div>
          <div class="tool-info">
            <h3>图书馆</h3>
            <p>访问广州城市理工学院图书馆网站</p>
          </div>
          <el-button type="primary" class="tool-button">
            访问
          </el-button>
        </el-card>
        
        <el-card class="tool-card" @click="navigateToAiCheck">
          <div class="tool-icon">
            <el-icon class="icon-large"><DataAnalysis /></el-icon>
          </div>
          <div class="tool-info">
            <h3>AI率查询</h3>
            <p>检查论文的AI生成率</p>
          </div>
          <el-button type="primary" class="tool-button">
            访问
          </el-button>
        </el-card>
        
        <el-card class="tool-card" @click="navigateToImageCheck">
          <div class="tool-icon">
            <el-icon class="icon-large"><Picture /></el-icon>
          </div>
          <div class="tool-info">
            <h3>图片查重</h3>
            <p>使用Figcheck进行图片查重</p>
          </div>
          <el-button type="primary" class="tool-button">
            访问
          </el-button>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { Reading, DataAnalysis, Picture } from '@element-plus/icons-vue';

const router = useRouter();

const navigateToLibrary = () => {
  router.push('/check/library');
};

const navigateToAiCheck = () => {
  router.push('/check/ai-check');
};

const navigateToImageCheck = () => {
  router.push('/check/image-check');
};
</script>

<style scoped>
.check-container {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.check-tools {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.tool-card {
  width: 300px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.icon-large {
  font-size: 48px;
  color: #409eff;
}

.tool-info {
  text-align: center;
  margin-bottom: 20px;
}

.tool-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
}

.tool-info p {
  margin: 0;
  color: #606266;
}

.tool-button {
  width: 100%;
}
</style>