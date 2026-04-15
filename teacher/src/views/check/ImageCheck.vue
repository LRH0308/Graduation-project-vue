<template>
  <div class="image-check-container">
    <el-result
      icon="info"
      title="正在跳转到 Figcheck 图片查重网站..."
      sub-title="如果没有自动跳转，请点击下方按钮"
    >
      <template #extra>
        <el-button type="primary" @click="openFigcheck">
          打开 Figcheck 图片查重
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

const openFigcheck = () => {
  window.open('https://www.figcheck.com/imagecheck', '_blank');
};

// 组件挂载时自动跳转
onMounted(() => {
  openFigcheck();
});
</script>

<style scoped>
.image-check-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>