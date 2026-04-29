<template>
  <el-container class="layout-container">
    <!-- 顶部蓝色信息栏（固定） -->
    <el-header class="layout-header">
      <h1 class="system-title">毕业设计管理系统 - 学生端</h1>
      <div class="header-right">
        <!-- 用户信息方格展示 -->
        <div class="user-info-box">
          <div class="info-grid">
            <span class="grid-label">毕业时间</span>
            <span class="grid-value">{{
              userStore.userInfo?.graduationTime || "-"
            }}</span>
          </div>

          <div class="info-grid">
            <span class="grid-label">所属院</span>
            <span class="grid-value">{{
              userStore.userInfo?.deptName || "-"
            }}</span>
          </div>
          <div class="info-grid">
            <span class="grid-label">学号/学生名</span>
            <span class="grid-value">
              {{ userStore.userInfo?.studentAccount || "-" }}/{{
                userStore.userInfo?.name || "-"
              }}
            </span>
          </div>
          <div class="info-grid">
            <span class="grid-label">班级</span>
            <span class="grid-value">{{
              userStore.userInfo?.className || "-"
            }}</span>
          </div>
          <div class="info-grid">
            <span class="grid-label">工号/导师名</span>
            <span class="grid-value">
              {{ userStore.userInfo?.teacherAccount || "-" }}/{{
                userStore.userInfo?.teacherName || "-"
              }}
            </span>
          </div>
        </div>

        <!-- 用户下拉菜单 -->
        <el-dropdown @command="handleUserCommand">
          <div class="user-dropdown-trigger">
            <el-icon class="user-icon"><User /></el-icon>
            <span class="user-text">用户</span>
            <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="updatePassword">
                <el-icon><Lock /></el-icon>
                更改密码
              </el-dropdown-item>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 更改密码对话框 -->
        <el-dialog title="更改密码" v-model="showPasswordDialog" width="400px">
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（8-18位）" />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showPasswordDialog = false">取消</el-button>
            <el-button type="primary" @click="handleUpdatePassword">确定</el-button>
          </template>
        </el-dialog>
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

          <el-sub-menu index="subject">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>选题管理</span>
            </template>
            <el-menu-item index="/subject/list">选题列表</el-menu-item>
            <el-menu-item index="/subject/my">我的选题</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/task/book">
            <el-icon><Reading /></el-icon>
            <span>任务书</span>
          </el-menu-item>

          <el-menu-item index="/proposal/submit">
            <el-icon><Edit /></el-icon>
            <span>开题报告</span>
          </el-menu-item>

          <el-menu-item index="/translation/submit">
            <el-icon><DocumentCopy /></el-icon>
            <span>外文翻译</span>
          </el-menu-item>

          <el-menu-item index="/mid/submit">
            <el-icon><Collection /></el-icon>
            <span>中期成果</span>
          </el-menu-item>

          <el-menu-item index="/thesis/submit">
            <el-icon><Files /></el-icon>
            <span>论文初稿</span>
          </el-menu-item>

          <el-menu-item index="/paper/submit">
            <el-icon><Files /></el-icon>
            <span>论文终稿</span>
          </el-menu-item>

          <el-menu-item index="/defense/arrangement">
            <el-icon><Timer /></el-icon>
            <span>答辩</span>
          </el-menu-item>

          <el-menu-item index="/record/guide">
            <el-icon><Comment /></el-icon>
            <span>过程指导记录</span>
          </el-menu-item>

          <el-sub-menu index="check">
            <template #title>
              <el-icon><CircleCheck /></el-icon>
              <span>检查</span>
            </template>
            <el-menu-item index="/check">检查工具</el-menu-item>
            <el-menu-item index="/check/library">图书馆</el-menu-item>
            <el-menu-item index="/check/ai-check">AI率查询</el-menu-item>
            <el-menu-item index="/check/image-check">图片查重</el-menu-item>
            <el-menu-item index="/reference/check">文献格式</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 右侧白色内容区域（可滚动） -->
      <el-main class="layout-main">
        <div :class="{ 'page-disabled': isTimeVerificationFailed }">
          <router-view />
        </div>
        <!-- 时间验证失败提示 - 居中显示 -->
        <div v-if="isTimeVerificationFailed" class="time-verification-overlay">
          <div class="time-verification-content">
            <el-alert
              title="当前页面暂未开放"
              type="warning"
              description="该功能的开放时间尚未到达或已过期，请在规定时间内操作。"
              show-icon
              :closable="false"
            />
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
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
  CircleCheck,
  User,
  ArrowDown,
  Lock,
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const showPasswordDialog = ref(false);
const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const passwordFormRef = ref(null);
const passwordRules = {
  oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    {
      min: 8,
      max: 18,
      message: "密码长度为8-18位",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 计算属性：时间验证是否失败
const isTimeVerificationFailed = computed(() => userStore.timeVerificationFailed);

// 监听路由变化，重置时间验证状态
watch(() => route.path, () => {
  console.log("路由变化:", route.path);
  console.log("当前时间验证状态:", userStore.timeVerificationFailed);
});

// 获取当前激活的菜单项
const activeMenu = computed(() => {
  const path = route.path;
  if (path.startsWith("/subject")) return "subject";
  if (path.startsWith("/defense")) return "defense";
  if (path.startsWith("/check")) return "check";
  if (path.startsWith("/reference")) return "check";
  return path;
});

// 处理用户命令
const handleUserCommand = (command) => {
  if (command === "updatePassword") {
    showPasswordDialog.value = true;
  } else if (command === "logout") {
    handleLogout();
  }
};

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

// 处理更改密码
const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return;
  try {
    await passwordFormRef.value.validate();
    const response = await userStore.updatePassword(
      passwordForm.value.oldPassword,
      passwordForm.value.newPassword
    );
    if (response.status === "success") {
      ElMessage.success("密码修改成功");
      showPasswordDialog.value = false;
      passwordForm.value = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    } else {
      ElMessage.error(response.info || "修改密码失败");
    }
  } catch (error) {
    console.error("修改密码失败:", error);
    ElMessage.error(error.message || "修改密码失败");
  }
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
  position: relative;
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

/* 时间验证失败提示 - 居中显示 */
.time-verification-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

.time-verification-content {
  max-width: 500px;
  width: 90%;
  pointer-events: auto;
}

/* 用户下拉菜单 */
.user-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.user-dropdown-trigger:hover {
  background: rgba(255, 255, 255, 0.25);
}

.user-icon {
  font-size: 16px;
}

.user-text {
  font-size: 14px;
  font-weight: 500;
}

.arrow-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.el-dropdown:focus .arrow-icon,
.el-dropdown:hover .arrow-icon {
  transform: rotate(180deg);
}

/* 页面禁用状态 */
.page-disabled {
  opacity: 0.5;
  pointer-events: none;
  position: relative;
  filter: grayscale(30%);
}

.page-disabled::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  z-index: 1;
  border-radius: 4px;
}

.page-disabled > * {
  position: relative;
  z-index: 0;
}
</style>
