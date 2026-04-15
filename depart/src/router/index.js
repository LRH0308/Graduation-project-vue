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
        path: "process/config",
        name: "ProcessNodeConfig",
        component: () => import("@/views/process/ProcessNodeConfig.vue"),
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
      // 检查工具
      {
        path: "check",
        name: "Check",
        component: () => import("@/views/check/Check.vue"),
      },
      {
        path: "check/library",
        name: "Library",
        component: () => import("@/views/check/Library.vue"),
      },
      {
        path: "check/ai-check",
        name: "AiCheck",
        component: () => import("@/views/check/AiCheck.vue"),
      },
      {
        path: "check/image-check",
        name: "ImageCheck",
        component: () => import("@/views/check/ImageCheck.vue"),
      },
      {
        path: "check/reference-check",
        name: "ReferenceCheck",
        component: () => import("@/views/check/ReferenceCheck.vue"),
      },
      {
        path: "check/code-duplicate-check",
        name: "CodeDuplicateCheck",
        component: () => import("@/views/check/CodeDuplicateCheck.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from) => {
  const token = localStorage.getItem("token");
  if (to.path !== "/login" && !token) {
    return "/login";
  }
  return true;
});

export default router;
