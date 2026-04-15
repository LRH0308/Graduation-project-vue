<template>
  <el-container class="layout-container">
    <!-- 顶部蓝色信息栏（固定） -->
    <el-header class="layout-header">
      <h1 class="system-title">毕业设计管理系统 - 教师端</h1>
      <div class="header-right">
        <!-- 用户信息方格展示 -->
        <div class="user-info-box">
          <div class="info-grid">
            <span class="grid-label">所属院</span>
            <span class="grid-value">{{
              userStore.userInfo?.deptName || "-"
            }}</span>
          </div>

          <div class="info-grid">
            <span class="grid-label">工号/教师名</span>
            <span class="grid-value">
              {{ userStore.userInfo?.teacherAccount || "-" }}/{{
                userStore.userInfo?.name || "-"
              }}
            </span>
          </div>
        </div>

        <!-- 退出登录按钮 -->
        <el-button type="danger" size="small" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </el-header>

    <el-container class="main-container">
      <!-- 左侧灰色导航菜单（固定） -->
      <el-aside width="200px" class="layout-aside">
        <el-menu
          :default-active="activeMenu"
          class="aside-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
        >
          <el-menu-item index="/home">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-menu-item index="/student/info">
            <el-icon><User /></el-icon>
            <span>指导学生</span>
          </el-menu-item>

          <el-menu-item index="/process/timeNode">
            <el-icon><Clock /></el-icon>
            <span>时间节点</span>
          </el-menu-item>

          <el-menu-item index="/subject/manage">
            <el-icon><Document /></el-icon>
            <span>选题管理</span>
          </el-menu-item>

          <el-menu-item index="/task/book">
            <el-icon><Reading /></el-icon>
            <span>任务书</span>
          </el-menu-item>

          <el-menu-item index="/proposal/audit">
            <el-icon><Edit /></el-icon>
            <span>开题报告</span>
          </el-menu-item>

          <el-menu-item index="/translation/audit">
            <el-icon><DocumentCopy /></el-icon>
            <span>外文翻译</span>
          </el-menu-item>

          <el-menu-item index="/mid/audit">
            <el-icon><Collection /></el-icon>
            <span>中期检查</span>
          </el-menu-item>

          <el-menu-item index="/thesis/draft/audit">
            <el-icon><Files /></el-icon>
            <span>论文初稿</span>
          </el-menu-item>

          <el-menu-item index="/thesis/final/audit">
            <el-icon><Files /></el-icon>
            <span>论文终稿</span>
          </el-menu-item>

          <el-menu-item index="/defense/arrangement">
            <el-icon><Timer /></el-icon>
            <span>答辩安排</span>
          </el-menu-item>

          <el-menu-item index="/record/guide">
            <el-icon><Comment /></el-icon>
            <span>过程指导</span>
          </el-menu-item>

          <el-menu-item index="/codeDuplicateCheck">
            <el-icon><Files /></el-icon>
            <span>代码查重</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧白色内容区域（可滚动） -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
import {
  House,
  Document,
  Reading,
  Edit,
  DocumentCopy,
  Collection,
  Files,
  Timer,
  Comment,
  SwitchButton,
  User,
  Clock,
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 获取当前激活的菜单项
const activeMenu = computed(() => {
  const path = route.path;
  if (path.startsWith("/defense")) return "defense";
  if (path.startsWith("/thesis")) return "thesis";
  return path;
});

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await userStore.logout();
        ElMessage.success("已退出登录");
        router.push("/login");
      } catch (error) {
        ElMessage.error("退出失败，请重试");
      }
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 组件挂载时检查登录状态
onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    try {
      const isValid = await userStore.validateToken();
      if (!isValid) {
        userStore.token = null;
        localStorage.removeItem("token");
        if (route.path !== "/login") {
          router.push("/login");
        }
      } else {
        await userStore.getLoginInfo();
      }
    } catch (error) {
      console.error("验证 Token 失败:", error);
      userStore.token = null;
      localStorage.removeItem("token");
      if (route.path !== "/login") {
        router.push("/login");
      }
    }
  } else if (!userStore.token && route.path !== "/login") {
    router.push("/login");
  }
});
</script>

<style scoped>
/* 整体容器 - 占满整个视口 */
.layout-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部蓝色信息栏 - 固定高度，不滚动 */
.layout-header {
  height: 60px;
  min-height: 60px;
  max-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #409eff;
  color: white;
  padding: 0 20px;
  flex-shrink: 0; /* 防止被压缩 */
}

.system-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 用户信息方格展示 */
.user-info-box {
  display: flex;
  gap: 10px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 8px 15px;
  min-width: 120px;
}

.grid-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

.grid-value {
  font-size: 13px;
  color: white;
  font-weight: bold;
  text-align: center;
}

/* 主体容器 - 占据顶部下方的剩余空间 */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden; /* 防止溢出 */
}

/* 左侧灰色导航菜单 - 固定宽度，可滚动 */
.layout-aside {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  background: #304156;
  overflow-y: auto; /* 菜单过多时可滚动 */
  overflow-x: hidden;
  flex-shrink: 0; /* 防止被压缩 */
}

/* 左侧导航栏滚动条样式 */
.layout-aside::-webkit-scrollbar {
  width: 6px;
}

.layout-aside::-webkit-scrollbar-track {
  background: #304156;
}

.layout-aside::-webkit-scrollbar-thumb {
  background: #409eff;
  border-radius: 3px;
}

.layout-aside::-webkit-scrollbar-thumb:hover {
  background: #66b1ff;
}

.aside-menu {
  border-right: none;
  height: 100%;
}

/* 右侧白色内容区域 - 可滚动 */
.layout-main {
  flex: 1;
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto; /* 内容过多时可滚动 */
  overflow-x: hidden;
  height: 100%;
}

/* 滚动条样式 */
.layout-main::-webkit-scrollbar {
  width: 0; /* 修改：隐藏滚动条 */
  height: 0;
}

.layout-main::-webkit-scrollbar-thumb {
  background: transparent;
}

.layout-main::-webkit-scrollbar-track {
  background: transparent;
}

/* 兼容 Firefox */
.layout-main {
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
}

/* 兼容 IE/Edge */
.layout-main {
  -ms-overflow-style: none; /* IE/Edge 隐藏滚动条 */
}
</style>