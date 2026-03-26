import { createRouter, createWebHistory } from "vue-router";
import Layout from "@/components/Layout.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/Login.vue"),
  },
  {
    path: "/",
    component: Layout,
    redirect: "/home",
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/home/Home.vue"),
      },
      {
        path: "subject/audit",
        name: "TopicAudit",
        component: () => import("@/views/subject/TopicAudit.vue"),
      },
      {
        path: "task/audit",
        name: "TaskAudit",
        component: () => import("@/views/task/TaskAudit.vue"),
      },
      {
        path: "defense/arrange",
        name: "DefenseArrange",
        component: () => import("@/views/defense/DefenseArrange.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.path !== "/login" && !token) {
    next("/login");
  } else {
    next();
  }
});

export default router;
