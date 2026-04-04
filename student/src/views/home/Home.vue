<template>
  <div class="home-container">
    <!-- 顶部信息区域 - 一分为二 -->
    <el-row :gutter="20" class="top-section">
      <!-- 左侧：重要通知 -->
      <el-col :span="15">
        <el-card class="notice-card">
          <template #header>
            <div class="card-header">
              <span>📢 重要通知</span>
            </div>
          </template>
          <div class="notice-content">
            <div v-if="loading" class="notice-loading">
              <el-skeleton :rows="3" animated />
            </div>
            <div v-else-if="processNodes.length > 0" class="timeline-container">
              <div class="timeline-wrapper" ref="timelineWrapper">
                <div class="timeline" :style="{ transform: `translateX(-${scrollPosition}px)` }">
                  <div 
                    v-for="(node, index) in processNodes" 
                    :key="node.nodeCode"
                    class="timeline-item"
                    :class="{ 'current': isCurrentNode(node), 'past': isPastNode(node), 'future': isFutureNode(node) }"
                  >
                    <div class="timeline-item-content">
                      <div class="timeline-item-header">
                        <el-tag :type="getTagType(node)" size="small">
                          {{ getNodeStatus(node) }}
                        </el-tag>
                        <span class="notice-date">
                          {{ formatDate(node.startTime) }} 至 {{ formatDate(node.endTime) }}
                        </span>
                      </div>
                      <h4 class="notice-title">{{ node.nodeName }}</h4>
                      <p class="notice-desc">{{ node.remark || '无描述' }}</p>
                      <div class="notice-actions">
                        <el-button
                          type="primary"
                          size="small"
                          @click="goTo(getNodeLink(node.nodeCode))"
                          :disabled="!isCurrentNode(node)"
                        >
                          立即处理
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="timeline-controls">
                <el-button 
                  type="primary" 
                  :icon="ArrowLeft" 
                  circle 
                  @click="scrollLeft"
                  :disabled="scrollPosition <= 0"
                />
                <el-button 
                  type="primary" 
                  :icon="ArrowRight" 
                  circle 
                  @click="scrollRight"
                  :disabled="scrollPosition >= maxScrollPosition"
                />
              </div>
            </div>
            <div v-else class="notice-empty">
              <el-empty description="当前暂无任务" :image-size="60" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：个人信息 -->
      <el-col :span="9">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>👤 个人信息</span>
            </div>
          </template>
          <div class="info-content">
            <div class="info-item">
              <span class="label">学号/姓名：</span>
              <span class="value">
                {{ userStore.userInfo?.studentAccount || "-" }} /
                {{ userStore.userInfo?.name || "-" }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">工号/导师：</span>
              <span class="value">
                {{ userStore.userInfo?.teacherAccount || "-" }} /
                {{ userStore.userInfo?.teacherName || "-" }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">班级：</span>
              <span class="value">{{
                userStore.userInfo?.className || "-"
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">所属院：</span>
              <span class="value">{{
                userStore.userInfo?.deptName || "-"
              }}</span>
            </div>
            <div class="info-item topic">
              <span class="label">课题名称：</span>
              <span class="value topic-value">{{
                userStore.userInfo?.topicName || "暂未选择课题"
              }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷跳转卡片 -->
    <el-row :gutter="20" class="quick-links">
      <el-col :span="4">
        <el-card
          shadow="hover"
          @click="goTo('/subject/list')"
          class="quick-link-card"
        >
          <el-icon><Document /></el-icon>
          <div>选题列表</div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card
          shadow="hover"
          @click="goTo('/task/book')"
          class="quick-link-card"
        >
          <el-icon><Reading /></el-icon>
          <div>任务书</div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card
          shadow="hover"
          @click="goTo('/proposal/submit')"
          class="quick-link-card"
        >
          <el-icon><Edit /></el-icon>
          <div>开题报告</div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card
          shadow="hover"
          @click="goTo('/translation/submit')"
          class="quick-link-card"
        >
          <el-icon><Reading /></el-icon>
          <div>外文翻译</div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card
          shadow="hover"
          @click="goTo('/mid/submit')"
          class="quick-link-card"
        >
          <el-icon><Collection /></el-icon>
          <div>中期成果</div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card
          shadow="hover"
          @click="goTo('/thesis/submit')"
          class="quick-link-card"
        >
          <el-icon><Files /></el-icon>
          <div>论文初稿</div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card
          shadow="hover"
          @click="goTo('/paper/submit')"
          class="quick-link-card"
        >
          <el-icon><Files /></el-icon>
          <div>论文终稿</div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card
          shadow="hover"
          @click="goTo('/defense/arrangement')"
          class="quick-link-card"
        >
          <el-icon><Timer /></el-icon>
          <div>答辩安排</div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card
          shadow="hover"
          @click="goTo('/record/guide')"
          class="quick-link-card"
        >
          <el-icon><Comment /></el-icon>
          <div>指导记录</div>
        </el-card>
      </el-col>

      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/check')" class="quick-link-card">
          <el-icon><CircleCheck /></el-icon>
          <div>检查</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, computed, nextTick, watch } from "vue";
import {
  Document,
  Reading,
  Edit,
  Collection,
  Files,
  Timer,
  Comment,
  CircleCheck,
  ArrowLeft,
  ArrowRight,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/user";
import { processNodeApi } from "@/utils/apiRequest";

const router = useRouter();
const userStore = useUserStore();

// 流程节点数据
const processNodes = ref([]);
const loading = ref(true);
const scrollPosition = ref(0);
const maxScrollPosition = ref(0);
const timelineWrapper = ref(null);

// 获取流程节点配置列表
const fetchProcessNodes = async () => {
  try {
    loading.value = true;
    const response = await processNodeApi.getList({});
    processNodes.value = response.data?.records || [];
    console.log('Process Nodes:', processNodes.value);
    // 按开始日期排序
    processNodes.value.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    console.log('Sorted Process Nodes:', processNodes.value);
    // 锚定到当前节点
    await nextTick();
    anchorToCurrentNode();
  } catch (error) {
    console.error("获取流程节点失败:", error);
  } finally {
    loading.value = false;
  }
};

// 格式化日期，从"YYYY-MM-DD HH:mm:ss"格式转换为"YYYY-MM-DD"
const formatDate = (dateString) => {
  if (!dateString) return '';
  return dateString.split(' ')[0];
};

// 检查是否为当前节点
const isCurrentNode = (node) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const startDate = formatDate(node.startTime);
  const endDate = formatDate(node.endTime);
  return todayStr >= startDate && todayStr <= endDate;
};

// 检查是否为过去节点
const isPastNode = (node) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const endDate = formatDate(node.endTime);
  return todayStr > endDate;
};

// 检查是否为未来节点
const isFutureNode = (node) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const startDate = formatDate(node.startTime);
  return todayStr < startDate;
};

// 获取节点状态
const getNodeStatus = (node) => {
  if (isCurrentNode(node)) return "进行中";
  if (isPastNode(node)) return "已完成";
  if (isFutureNode(node)) return "未开始";
  return "未知";
};

// 获取标签类型
const getTagType = (node) => {
  if (isCurrentNode(node)) return "success";
  if (isPastNode(node)) return "info";
  if (isFutureNode(node)) return "warning";
  return "default";
};

// 获取节点链接
const getNodeLink = (nodeCode) => {
  const linkMap = {
    TOPIC_SELECTION: "/subject/list",
    TASK_BOOK: "/task/book",
    OPENING: "/proposal/submit",
    TRANSLATION: "/translation/submit",
    MIDTERM: "/mid/submit",
    THESIS_DRAFT: "/thesis/submit",
    THESIS_FINAL: "/paper/submit",
    DEFENSE: "/defense/arrangement",
    GUIDANCE: "/record/guide",
  };
  return linkMap[nodeCode] || "/home";
};

// 滚动到左侧
const scrollLeft = () => {
  scrollPosition.value = Math.max(0, scrollPosition.value - 240); // 220px + 20px gap
};

// 滚动到右侧
const scrollRight = () => {
  scrollPosition.value = Math.min(maxScrollPosition.value, scrollPosition.value + 240); // 220px + 20px gap
};

// 锚定到当前节点
const anchorToCurrentNode = () => {
  if (!timelineWrapper.value || processNodes.value.length === 0) return;
  
  // 找到当前节点的索引
  const currentIndex = processNodes.value.findIndex(isCurrentNode);
  
  // 计算容器宽度和时间轴总宽度
  const containerWidth = timelineWrapper.value.clientWidth;
  const itemWidth = 220; // 每个节点的宽度（与CSS一致，减少三分之一）
  const gap = 20; // 节点之间的间距
  const totalItemWidth = itemWidth + gap; // 每个节点的实际宽度（包括间距）
  const timelineWidth = processNodes.value.length * totalItemWidth - gap; // 时间轴总宽度（减去最后一个节点的间距）
  
  // 计算最大滚动位置
  maxScrollPosition.value = Math.max(0, timelineWidth - containerWidth);
  
  if (currentIndex !== -1) {
    // 计算滚动位置，使当前节点居中
    const scrollTo = currentIndex * totalItemWidth - (containerWidth / 2) + (itemWidth / 2);
    scrollPosition.value = Math.max(0, Math.min(maxScrollPosition.value, scrollTo));
  } else {
    // 如果没有当前节点，滚动到最开始
    scrollPosition.value = 0;
  }
};

// 监听窗口大小变化，重新计算滚动范围
const handleResize = () => {
  if (timelineWrapper.value && processNodes.value.length > 0) {
    const containerWidth = timelineWrapper.value.clientWidth;
    const itemWidth = 220; // 每个节点的宽度（与CSS一致，减少三分之一）
    const gap = 20; // 节点之间的间距
    const totalItemWidth = itemWidth + gap; // 每个节点的实际宽度（包括间距）
    const timelineWidth = processNodes.value.length * totalItemWidth - gap; // 时间轴总宽度（减去最后一个节点的间距）
    maxScrollPosition.value = Math.max(0, timelineWidth - containerWidth);
    // 确保滚动位置在有效范围内
    scrollPosition.value = Math.min(scrollPosition.value, maxScrollPosition.value);
  }
};

const goTo = (path) => {
  router.push(path);
};

onMounted(() => {
  if (!userStore.userInfo) {
    userStore.getLoginInfo();
  }
  fetchProcessNodes();
  window.addEventListener('resize', handleResize);
});

// 监听processNodes变化，重新计算滚动位置
watch(() => processNodes.value.length, () => {
  if (processNodes.value.length > 0) {
    // 延迟执行，确保DOM已经渲染
    setTimeout(() => {
      anchorToCurrentNode();
    }, 100);
  }
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 顶部信息区域 */
.top-section {
  margin-bottom: 20px;
}

.notice-card,
.info-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

/* 通知内容 - 高度减少 */
.notice-content {
  padding: 5px 0;
}

.notice-loading {
  padding: 20px 0;
}

.timeline-container {
  position: relative;
  min-height: 200px;
}

.timeline-wrapper {
  width: 100%;
  overflow: hidden;
  margin-bottom: 15px;
}

.timeline {
  display: flex;
  transition: transform 0.3s ease;
  gap: 20px;
  padding: 10px 0;
}

.timeline-item {
  flex: 0 0 220px; /* 减少三分之一，从330px改为220px */
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  border-radius: 8px;
  border-left: 4px solid #409eff;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.timeline-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.timeline-item.current {
  border-left-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2f1 100%);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

.timeline-item.past {
  border-left-color: #909399;
  background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%);
  opacity: 0.8;
}

.timeline-item.future {
  border-left-color: #e6a23c;
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
}

.timeline-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.notice-date {
  font-size: 12px;
  color: #909399;
  flex: 1;
  min-width: 180px;
}

.notice-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
  font-weight: bold;
}

.notice-desc {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice-actions {
  display: flex;
  gap: 8px;
}

.notice-empty {
  padding: 20px 0;
  text-align: center;
}

.timeline-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

/* 个人信息 - 高度和宽度减少 */
.info-content {
  padding: 5px 0;
}

.info-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  width: 80px;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.info-item .value {
  flex: 1;
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-item.topic .value {
  color: #409eff;
  font-weight: 500;
}

/* 快捷跳转卡片 */
.quick-links {
  margin-bottom: 20px;
}

.quick-link-card {
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

.quick-link-card div {
  font-size: 14px;
  color: #606266;
}
</style>
