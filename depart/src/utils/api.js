// src/utils/api.js

/**
 * API 接口路径统一管理（系主任端）
 * 根据 API 文档 v1.0 版本整理
 */

export const API = {
  // ==================== 账户管理 ====================
  USER: {
    CHECK_CODE: { url: "/users/checkCode", method: "get" },
    REGISTER: { url: "/users/register", method: "post" },
    LOGIN: { url: "/users/login", method: "post" },
    GET_LOGIN_INFO: { url: "/users/getLoginInfo", method: "get" },
    LOGOUT: { url: "/users/logout", method: "get" },
    UPDATE_PASSWORD: { url: "/users/updatePassword", method: "post" },
  },

  // ==================== 选题管理 ====================
  TOPIC_SELECT: {
    // 系主任审核选题
    APPROVE: { url: "/topicSelect/approve", method: "post" },
    // 获取选题信息（系主任查看本系所有选题）
    GET_TOPIC_SELECTION: {
      url: "/topicSelect/getTopicSelection",
      method: "post",
    },
  },

  // ==================== 任务书 ====================
  TASK_BOOK: {
    // 获取任务书信息（待审核）
    GET_TASK_BOOK: { url: "/taskBook/getTaskBook", method: "post" },
    // 系主任审核任务书
    DEPART_APPROVE: { url: "/taskBook/departApprove", method: "post" },
  },

  // ==================== 答辩安排 ====================
  DEFENSE_ARRANGEMENT: {
    // 获取答辩安排信息
    GET_DEFENSE_ARRANGEMENT: {
      url: "/defenseArrangement/getDefenseArrangement",
      method: "post",
    },
    // 安排答辩
    DEPT_ARRANGE: { url: "/defenseArrangement/deptArrange", method: "post" },
  },

  // ==================== 文件管理 ====================
  FILE: {
    UPLOAD: { url: "/file/upload", method: "post" },
    DOWNLOAD: { url: "/file/download", method: "get" },
  },
};
