import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/login/Login.vue"),
    },
    {
      path: "/",
      component: () => import("@/components/Layout.vue"),
      redirect: "/home",
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
          path: "thesis/manage",
          name: "ThesisManage",
          component: () => import("@/views/thesis/ThesisManage.vue"),
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
      ],
    },
  ],
});

export default router;
