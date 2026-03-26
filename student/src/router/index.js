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
        {
          path: "/subject/list",
          name: "SubjectList",
          component: () => import("@/views/subject/SubjectList.vue"),
        },
        {
          path: "/subject/my",
          name: "MySubject",
          component: () => import("@/views/subject/MySubject.vue"),
        },
        {
          path: "/task/book",
          name: "TaskBook",
          component: () => import("@/views/task/TaskBook.vue"),
        },
        {
          path: "/proposal/submit",
          name: "ProposalSubmit",
          component: () => import("@/views/proposal/ProposalSubmit.vue"),
        },
        {
          path: "/mid/submit",
          name: "MidSubmit",
          component: () => import("@/views/midCheck/MidSubmit.vue"),
        },
        {
          path: "/thesis/submit",
          name: "ThesisSubmit",
          component: () => import("@/views/thesis/ThesisSubmit.vue"),
        },
        {
          path: "/paper/submit",
          name: "PaperSubmit",
          component: () => import("@/views/paper/PaperSubmit.vue"),
        },
        {
          path: "/defense/arrangement",
          name: "DefenseArrangement",
          component: () => import("@/views/defense/Defense.vue"),
        },
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
      // 未登录，跳转到登录页
      next("/login");
      return;
    }

    // 有 token 但用户信息为空，验证登录状态
    if (!userStore.userInfo) {
      try {
        const isValid = await userStore.checkLoginStatus();
        if (!isValid) {
          next("/login");
          return;
        }
      } catch (error) {
        console.error("路由守卫验证失败:", error);
        next("/login");
        return;
      }
    }

    next();
  } else if (to.path === "/login" && token) {
    // 已登录但访问登录页，跳转到首页
    next("/home");
  } else {
    next();
  }
});

export default router;
