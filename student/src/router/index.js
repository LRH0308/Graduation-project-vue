// src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import Layout from "@/components/Layout.vue";
import Login from "@/views/login/Login.vue";
import { useUserStore } from "@/stores/user";
import { processNodeApi } from "@/utils/apiRequest";
import { ElMessage } from "element-plus";

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
          meta: { nodeCode: null }, // 首页不需要时间验证
        },
        {
          path: "/subject/list",
          name: "SubjectList",
          component: () => import("@/views/subject/SubjectList.vue"),
          meta: { nodeCode: "TOPIC_SELECTION" },
        },
        {
          path: "/subject/my",
          name: "MySubject",
          component: () => import("@/views/subject/MySubject.vue"),
          meta: { nodeCode: "TOPIC_SELECTION" },
        },
        {
          path: "/task/book",
          name: "TaskBook",
          component: () => import("@/views/task/TaskBook.vue"),
          meta: { nodeCode: "TASK_BOOK" },
        },
        {
          path: "/proposal/submit",
          name: "ProposalSubmit",
          component: () => import("@/views/proposal/ProposalSubmit.vue"),
          meta: { nodeCode: "OPENING" },
        },
        {
          path: "/translation/submit",
          name: "ForeignTranslation",
          component: () => import("@/views/translation/ForeignTranslation.vue"),
          meta: { nodeCode: "TRANSLATION" },
        },
        {
          path: "/mid/submit",
          name: "MidSubmit",
          component: () => import("@/views/midCheck/MidSubmit.vue"),
          meta: { nodeCode: "MIDTERM" },
        },
        {
          path: "/thesis/submit",
          name: "ThesisSubmit",
          component: () => import("@/views/thesis/ThesisSubmit.vue"),
          meta: { nodeCode: "THESIS_DRAFT" },
        },
        {
          path: "/paper/submit",
          name: "PaperSubmit",
          component: () => import("@/views/paper/PaperSubmit.vue"),
          meta: { nodeCode: "THESIS_FINAL" },
        },
        {
          path: "/defense/arrangement",
          name: "DefenseArrangement",
          component: () => import("@/views/defense/Defense.vue"),
          meta: { nodeCode: "DEFENSE" },
        },
        {
          path: "/record/guide",
          name: "GuideRecord",
          component: () => import("@/views/record/GuideRecord.vue"),
          meta: { nodeCode: "GUIDANCE" },
        },
        {
          path: "/check",
          name: "Check",
          component: () => import("@/views/check/Check.vue"),
          meta: { nodeCode: null },
        },
        {
          path: "/check/library",
          name: "Library",
          component: () => import("@/views/check/Library.vue"),
          meta: { nodeCode: null },
        },
        {
          path: "/check/ai-check",
          name: "AiCheck",
          component: () => import("@/views/check/AiCheck.vue"),
          meta: { nodeCode: null },
        },
      ],
    },
  ],
});

// 导航守卫
router.beforeEach(async (to, from) => {
  const token = localStorage.getItem("token");
  const userStore = useUserStore();

  // 需要认证的路由
  if (to.meta.requiresAuth !== false) {
    if (!token || token === "undefined" || token === "null") {
      // 未登录，跳转到登录页
      return "/login";
    }

    // 有 token 但用户信息为空，验证登录状态
    if (!userStore.userInfo) {
      try {
        const isValid = await userStore.checkLoginStatus();
        if (!isValid) {
          return "/login";
        }
      } catch (error) {
        console.error("路由守卫验证失败:", error);
        return "/login";
      }
    }

    // 重置时间验证状态（每次路由变化都重置）
    userStore.resetTimeVerificationStatus();
    console.log("重置时间验证状态:", userStore.timeVerificationFailed);

    // 除了首页，其他页面需要时间验证
    if (to.meta.nodeCode) {
      try {
        console.log("开始时间验证:", to.meta.nodeCode);
        await processNodeApi.timeVerification(to.meta.nodeCode);
        console.log("时间验证成功:", to.meta.nodeCode);
      } catch (error) {
        console.error("时间验证失败:", error);
        userStore.setTimeVerificationStatus(true, to.meta.nodeCode);
        console.log("设置时间验证失败状态:", userStore.timeVerificationFailed);
      }
    }

    return true;
  } else if (to.path === "/login" && token) {
    // 已登录但访问登录页，跳转到首页
    return "/home";
  } else {
    return true;
  }
});

export default router;
