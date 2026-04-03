import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import { ElMessage } from "element-plus";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/login/Login.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/",
      component: () => import("@/components/Layout.vue"),
      redirect: "/home",
      meta: { requiresAuth: true },
      children: [
        {
          path: "home",
          name: "Home",
          component: () => import("@/views/home/Home.vue"),
        },
        {
          path: "topic/manage",
          name: "TopicManage",
          component: () => import("@/views/topic/TopicManage.vue"),
        },
        {
          path: "taskbook/manage",
          name: "TaskBookManage",
          component: () => import("@/views/taskbook/TaskBookManage.vue"),
        },
        {
          path: "openingreport/manage",
          name: "OpeningReportManage",
          component: () =>
            import("@/views/openingreport/OpeningReportManage.vue"),
        },
        {
          path: "midtermcheck/manage",
          name: "MidtermCheckManage",
          component: () =>
            import("@/views/midtermcheck/MidtermCheckManage.vue"),
        },
        {
          path: "thesis/draft",
          name: "ThesisDraftManage",
          component: () => import("@/views/thesis/ThesisDraftManage.vue"),
        },
        {
          path: "thesis/final",
          name: "ThesisFinalManage",
          component: () => import("@/views/thesis/ThesisFinalManage.vue"),
        },
        {
          path: "defense/manage",
          name: "DefenseManage",
          component: () => import("@/views/defense/DefenseManage.vue"),
        },
        {
          path: "guidance/manage",
          name: "GuidanceManage",
          component: () => import("@/views/guidance/GuidanceManage.vue"),
        },
        {
          path: "user/manage",
          name: "UserManage",
          component: () => import("@/views/user/UserManage.vue"),
        },
        {
          path: "student/manage",
          name: "StudentManage",
          component: () => import("@/views/student/StudentManage.vue"),
        },
        {
          path: "teacher/manage",
          name: "TeacherManage",
          component: () => import("@/views/teacher/TeacherManage.vue"),
        },
        {
          path: "guidance/relation",
          name: "GuidanceRelationManage",
          component: () => import("@/views/guidance/GuidanceRelationManage.vue"),
        },
        {
          path: "file/manage",
          name: "FileManage",
          component: () => import("@/views/file/FileManage.vue"),
        },
        {
          path: "plagiarism/setting",
          name: "PlagiarismSetting",
          component: () => import("@/views/plagiarism/PlagiarismSetting.vue"),
        },
      ],
    },
  ],
});

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  // 不需要认证的路由（如登录页）
  if (to.meta.requiresAuth === false) {
    // 已登录用户访问登录页，跳转到首页
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      next("/home");
    } else {
      next();
    }
    return;
  }

  // 需要认证的路由
  const token = localStorage.getItem("token");
  const userStore = useUserStore();

  // 检查 token 是否存在
  if (!token || token === "undefined" || token === "null") {
    ElMessage.error("请先登录");
    next("/login");
    return;
  }

  // 每次路由切换都验证登录状态
  try {
    // 检查用户信息是否存在，不存在则获取
    if (!userStore.userInfo) {
      await userStore.getLoginInfo();
    } else {
      // 已存在用户信息，再次验证登录状态
      await userStore.getLoginInfo();
    }
    next();
  } catch (error) {
    console.error("验证登录状态失败:", error);
    userStore.clearUserState();
    ElMessage.error("登录已过期，请重新登录");
    next("/login");
  }
});

export default router;
