<template>
  <div class="ai-check-container">
    <el-result
      icon="info"
      title="正在跳转到AI率查询网站..."
      sub-title="如果没有自动跳转，请点击下方按钮"
    >
      <template #extra>
        <el-button type="primary" @click="openAiCheck">
          打开AI率查询网站
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

const openAiCheck = () => {
  window.open('https://www.qianbixiezuo.com/paper_aigc_check', '_blank');
};

// 组件挂载时自动跳转
onMounted(() => {
  openAiCheck();
});
</script>

<style scoped>
.ai-check-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>