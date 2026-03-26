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
            <div v-if="currentNotice" class="notice-item current">
              <div class="notice-header">
                <el-tag :type="currentNotice.type" size="small">进行中</el-tag>
                <span class="notice-date"
                  >{{ currentNotice.startDate }} 至
                  {{ currentNotice.endDate }}</span
                >
              </div>
              <h4 class="notice-title">{{ currentNotice.title }}</h4>
              <p class="notice-desc">{{ currentNotice.content }}</p>
              <div class="notice-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="goTo(currentNotice.link)"
                >
                  立即处理
                </el-button>
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
      <el-col :span="6">
        <el-card
          shadow="hover"
          @click="goTo('/subject/list')"
          class="quick-link-card"
        >
          <el-icon><Document /></el-icon>
          <div>课题列表</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card
          shadow="hover"
          @click="goTo('/task/book')"
          class="quick-link-card"
        >
          <el-icon><Reading /></el-icon>
          <div>任务书</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card
          shadow="hover"
          @click="goTo('/proposal/submit')"
          class="quick-link-card"
        >
          <el-icon><Edit /></el-icon>
          <div>开题报告</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card
          shadow="hover"
          @click="goTo('/mid/submit')"
          class="quick-link-card"
        >
          <el-icon><Collection /></el-icon>
          <div>中期成果</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card
          shadow="hover"
          @click="goTo('/thesis/submit')"
          class="quick-link-card"
        >
          <el-icon><Files /></el-icon>
          <div>论文初稿</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card
          shadow="hover"
          @click="goTo('/paper/submit')"
          class="quick-link-card"
        >
          <el-icon><Files /></el-icon>
          <div>论文终稿</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card
          shadow="hover"
          @click="goTo('/defense/arrangement')"
          class="quick-link-card"
        >
          <el-icon><Timer /></el-icon>
          <div>答辩安排</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card
          shadow="hover"
          @click="goTo('/record/guide')"
          class="quick-link-card"
        >
          <el-icon><Comment /></el-icon>
          <div>指导记录</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/check')" class="quick-link-card">
          <el-icon><CircleCheck /></el-icon>
          <div>检查</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// script 部分保持不变
import { useRouter } from "vue-router";
import { computed, ref, onMounted } from "vue";
import {
  Document,
  Reading,
  Edit,
  Collection,
  Files,
  Timer,
  Comment,
  CircleCheck,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

// 任务阶段配置
const taskStages = ref([
  {
    startDate: "2025-03-01",
    endDate: "2025-03-14",
    title: "课题选题",
    content: "请各位同学及时登录系统完成课题选择",
    type: "primary",
    link: "/subject/list",
  },
  {
    startDate: "2025-03-15",
    endDate: "2025-03-31",
    title: "任务书下达",
    content: "导师将下达任务书，请及时查看并确认",
    type: "success",
    link: "/task/book",
  },
  {
    startDate: "2025-04-01",
    endDate: "2025-04-19",
    title: "开题报告提交",
    content: "完成开题报告并提交导师审核",
    type: "warning",
    link: "/proposal/submit",
  },
  {
    startDate: "2025-04-20",
    endDate: "2025-04-30",
    title: "中期检查",
    content: "提交中期研究成果报告",
    type: "info",
    link: "/mid/submit",
  },
  {
    startDate: "2025-05-01",
    endDate: "2025-05-19",
    title: "论文初稿",
    content: "完成论文初稿并提交",
    type: "success",
    link: "/thesis/submit",
  },
  {
    startDate: "2025-05-20",
    endDate: "2025-05-31",
    title: "论文终稿",
    content: "完成论文终稿并提交",
    type: "warning",
    link: "/paper/submit",
  },
  {
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    title: "答辩",
    content: "参加毕业答辩",
    type: "danger",
    link: "/defense/arrangement",
  },
]);

const currentNotice = computed(() => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  for (const stage of taskStages.value) {
    if (todayStr >= stage.startDate && todayStr <= stage.endDate) {
      return stage;
    }
  }
  return null;
});

const goTo = (path) => {
  router.push(path);
};

onMounted(() => {
  if (!userStore.userInfo) {
    userStore.getLoginInfo();
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

.notice-item {
  padding: 10px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.notice-item.current {
  border-left-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2f1 100%);
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.notice-date {
  font-size: 12px;
  color: #909399;
}

.notice-title {
  margin: 0 0 6px 0;
  font-size: 16px;
  color: #303133;
  font-weight: bold;
}

.notice-desc {
  margin: 0 0 10px 0;
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
