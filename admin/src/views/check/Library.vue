<template>
  <div class="library-container">
    <el-result
      icon="info"
      title="正在跳转到图书馆网站..."
      sub-title="如果没有自动跳转，请点击下方按钮"
    >
      <template #extra>
        <el-button type="primary" @click="openLibrary">
          打开图书馆网站
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

const openLibrary = () => {
  window.open('https://lib.gcut.edu.cn/', '_blank');
};

// 组件挂载时自动跳转
onMounted(() => {
  openLibrary();
});
</script>

<style scoped>
.library-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>