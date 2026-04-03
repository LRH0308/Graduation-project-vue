// src/utils/api.js

/**
 * API 接口路径统一管理
 * 根据 API 文档 v1.0 版本整理
 */

export const API = {
  // ==================== 账户管理 ====================
  USER: {
    // 获取验证码 GET /users/checkCode
    CHECK_CODE: { url: "/users/checkCode", method: "get" },
    // 用户注册 POST /users/register
    REGISTER: { url: "/users/register", method: "post" },
    // 用户登录 POST /users/login
    LOGIN: { url: "/users/login", method: "post" },
    // 获取登录信息 GET /users/getLoginInfo
    GET_LOGIN_INFO: { url: "/users/getLoginInfo", method: "get" },
    // 退出登录 GET /users/logout
    LOGOUT: { url: "/users/logout", method: "get" },
    // 修改密码 POST /users/updatePassword
    UPDATE_PASSWORD: { url: "/users/updatePassword", method: "post" },
  },

  // ==================== 选题管理 ====================
  TOPIC_SELECT: {
    // 获取选题信息 POST /topicSelect/getTopicSelection
    GET_TOPIC_SELECTION: {
      url: "/topicSelect/getTopicSelection",
      method: "post",
    },
  },

  // ==================== 任务书 ====================
  TASK_BOOK: {
    // 获取任务书信息 POST /taskBook/getTaskBook
    GET_TASK_BOOK: { url: "/taskBook/getTaskBook", method: "post" },
  },

  // ==================== 开题报告 ====================
  OPENING_REPORT: {
    // 获取开题报告信息 POST /openingReport/getOpeningReport
    GET_OPENING_REPORT: {
      url: "/openingReport/getOpeningReport",
      method: "post",
    },
  },

  // ==================== 中期检查 ====================
  MIDTERM_CHECK: {
    // 获取中期检查信息 POST /midtermCheck/getMidtermCheck
    GET_MIDTERM_CHECK: { url: "/midtermCheck/getMidtermCheck", method: "post" },
  },

  // ==================== 论文初稿 ====================
  THESIS_DRAFT: {
    // 获取论文初稿信息 POST /ThesisDraft/getThesisDraft
    GET_THESIS_DRAFT: {
      url: "/ThesisDraft/getThesisDraft",
      method: "post",
    },
  },

  // ==================== 答辩安排 ====================
  DEFENSE_ARRANGEMENT: {
    // 获取答辩安排信息 POST /defenseArrangement/getDefenseArrangement
    GET_DEFENSE_ARRANGEMENT: {
      url: "/defenseArrangement/getDefenseArrangement",
      method: "post",
    },
  },

  // ==================== 过程指导记录 ====================
  PROCESS_GUIDANCE_RECORD: {
    // 获取过程指导记录 POST /processGuidanceRecord/getProcessGuidanceRecord
    GET_PROCESS_GUIDANCE_RECORD: {
      url: "/processGuidanceRecord/getProcessGuidanceRecord",
      method: "post",
    },
  },

  // ==================== 外文翻译 ====================
  FOREIGN_LANGUAGE_TRANSLATION: {
    // 获取外文翻译信息 POST /foreignLanguageTranslation/getForeignLanguageTranslation
    GET_FOREIGN_LANGUAGE_TRANSLATION: {
      url: "/foreignLanguageTranslation/getForeignLanguageTranslation",
      method: "post",
    },
  },

  // ==================== 文件管理 ====================
  FILE: {
    // 上传文件 POST /file/upload
    UPLOAD: { url: "/file/upload", method: "post" },
    // 下载文件 GET /file/download
    DOWNLOAD: { url: "/file/download", method: "get" },
    // 获取文件详情 POST /file/getFileDetail
    GET_FILE_DETAIL: { url: "/file/getFileDetail", method: "post" },
  },

  // ==================== 学生管理 ====================
  STUDENT: {
    // 获取学生列表 POST /student/getStudentList
    GET_STUDENT_LIST: { url: "/student/getStudentList", method: "post" },
  },

  // ==================== 导师管理 ====================
  TEACHER: {
    // 获取导师列表 POST /teacher/getTeacherList
    GET_TEACHER_LIST: { url: "/teacher/getTeacherList", method: "post" },
  },

  // ==================== 论文查重设置 ====================
  PLAGIARISM: {
    // 获取查重设置 GET /plagiarism/getSetting
    GET_SETTING: { url: "/plagiarism/getSetting", method: "get" },
    // 保存查重设置 POST /plagiarism/saveSetting
    SAVE_SETTING: { url: "/plagiarism/saveSetting", method: "post" },
  },
};

/**
 * 获取接口配置
 * @param {Object} module - 模块对象
 * @param {String} apiName - 接口名称
 * @returns {Object} API 配置 { url, method }
 */
export const getApiConfig = (module, apiName) => {
  if (!module || !apiName || !module[apiName]) {
    console.error(`无效的 API 配置：${apiName}`);
    return null;
  }
  return module[apiName];
};

export default API;
