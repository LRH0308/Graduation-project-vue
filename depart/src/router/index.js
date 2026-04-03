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
        path: "teacherStudent/student",
        name: "StudentManagement",
        component: () => import("@/views/teacherStudent/Student.vue"),
      },
      {
        path: "teacherStudent/teacher",
        name: "TeacherManagement",
        component: () => import("@/views/teacherStudent/Teacher.vue"),
      },
      {
        path: "teacherStudent/guidance",
        name: "GuidanceRelationship",
        component: () => import("@/views/teacherStudent/Guidance.vue"),
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
      {
        path: "openingReport/list",
        name: "OpeningReport",
        component: () => import("@/views/openingReport/OpeningReport.vue"),
      },
      {
        path: "foreignTranslation/list",
        name: "ForeignTranslation",
        component: () => import("@/views/translation/ForeignTranslation.vue"),
      },
      {
        path: "midtermCheck/list",
        name: "MidtermCheck",
        component: () => import("@/views/midtermCheck/MidtermCheck.vue"),
      },
      {
        path: "thesisDraft/list",
        name: "ThesisDraft",
        component: () => import("@/views/thesisDraft/ThesisDraft.vue"),
      },
      {
        path: "thesisFinal/list",
        name: "ThesisFinal",
        component: () => import("@/views/thesisFinal/ThesisFinal.vue"),
      },
      {
        path: "processGuidance/list",
        name: "ProcessGuidanceRecord",
        component: () => import("@/views/processGuidance/ProcessGuidanceRecord.vue"),
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
