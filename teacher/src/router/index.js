// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Layout from "@/components/Layout.vue";
import Login from "@/views/login/Login.vue";
import { useUserStore } from "@/stores/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: "/",
      redirect: "/home",
    },
    {
      path: "/home",
      component: Layout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "Home",
          component: () => import("@/views/home/Home.vue"),
        },
        // 指导学生信息// 指导师生
        {
          path: "/student/info",
          name: "StudentInfo",
          component: () => import("@/views/student/StudentInfo.vue"),
        },
        // 时间节点
        {
          path: "/process/timeNode",
          name: "TimeNodeConfig",
          component: () => import("@/views/process/TimeNodeConfig.vue"),
        },
        // 过程指导选题管理
        {
          path: "/subject/manage",
          name: "SubjectManage",
          component: () => import("@/views/subject/SubjectManage.vue"),
        },
        // 任务书
        {
          path: "/task/book",
          name: "TaskBook",
          component: () => import("@/views/task/TaskBook.vue"),
        },
        // 开题报告
        {
          path: "/proposal/audit",
          name: "ProposalAudit",
          component: () => import("@/views/proposal/ProposalAudit.vue"),
        },
        // 外文翻译审核
        {
          path: "/translation/audit",
          name: "TranslationAudit",
          component: () => import("@/views/translation/TranslationAudit.vue"),
        },
        // 中期检查
        {
          path: "/mid/audit",
          name: "MidAudit",
          component: () => import("@/views/midCheck/MidAudit.vue"),
        },
        // 论文初稿审核
        {
          path: "/thesis/draft/audit",
          name: "ThesisDraftAudit",
          component: () => import("@/views/thesis/ThesisDraftAudit.vue"),
        },
        // 论文终稿审核
        {
          path: "/thesis/final/audit",
          name: "ThesisFinalAudit",
          component: () => import("@/views/thesis/ThesisFinalAudit.vue"),
        },
        // 答辩安排
        {
          path: "/defense/arrangement",
          name: "DefenseArrangement",
          component: () => import("@/views/defense/DefenseArrangement.vue"),
        },
        // 过程指导
        {
          path: "/record/guide",
          name: "GuideRecord",
          component: () => import("@/views/record/GuideRecord.vue"),
        },
      ],
    },
  ],
});

// 导航守卫
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");
  const userStore = useUserStore();

  // 需要认证的路由
  if (to.meta.requiresAuth !== false) {
    if (!token || token === "undefined" || token === "null") {
      next("/login");
      return;
    }

    // 有 token 但用户信息为空，验证登录状态
    if (!userStore.userInfo) {
      try {
        const isValid = await userStore.getLoginInfo();
        if (!isValid) {
          next("/login");
          return;
        }
      } catch (error) {
        console.error("路由守卫验证失败:", error);
        // 清除token，避免无限循环
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        next("/login");
        return;
      }
    }

    next();
  } else {
    // 不需要认证的路由（如登录页）
    if (token && to.path === "/login") {
      next("/home");
    } else {
      next();
    }
  }
});

export default router;
