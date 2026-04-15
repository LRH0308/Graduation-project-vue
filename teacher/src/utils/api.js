// src/utils/api.js

/**
 * API 接口路径统一管理（教师端）
 * 所有接口路径在此集中定义，便于维护和修改
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
    APPLY: { url: "/topicSelect/apply", method: "post" },
    GET_TOPIC_SELECTION: {
      url: "/topicSelect/getTopicSelection",
      method: "post",
    },
    PUBLISH: { url: "/topicSelect/publish", method: "get" },
    GET_DEPT: { url: "/topicSelect/getDept", method: "get" },
  },

  // ==================== 任务书 ====================
  TASK_BOOK: {
    GET_TASK_BOOK: { url: "/taskBook/getTaskBook", method: "post" },
    APPLY_TASK_BOOK: { url: "/taskBook/applyTaskBook", method: "post" },
  },

  // ==================== 开题报告 ====================
  OPENING_REPORT: {
    GET_OPENING_REPORT: {
      url: "/openingReport/getOpeningReport",
      method: "post",
    },
    TEACHER_AUDIT: { url: "/openingReport/teacherAudit", method: "post" },
  },

  // ==================== 中期检查 ====================
  MIDTERM_CHECK: {
    GET_MIDTERM_CHECK: { url: "/midtermCheck/getMidtermCheck", method: "post" },
    TEACHER_AUDIT: { url: "/midtermCheck/teacherAudit", method: "post" },
  },

  // ==================== 论文初稿 ====================
  THESIS_DRAFT: {
    GET_THESIS_DRAFT: { url: "/ThesisDraft/getThesisDraft", method: "post" },
    TEACHER_AUDIT: { url: "/ThesisDraft/teacherAudit", method: "post" },
    GET_DUPLICATE_CHECK_THRESHOLD: { url: "/ThesisDraft/getDuplicateCheckThreshold", method: "post" },
    SET_DUPLICATE_CHECK_THRESHOLD: { url: "/ThesisDraft/setDuplicateCheckThreshold", method: "post" },
  },

  // ==================== 论文终稿 ====================
  THESIS_FINAL: {
    GET_THESIS_FINAL_LIST: { url: "/ThesisFinal/getThesisFinalList", method: "post" },
  },

  // ==================== 论文审核 ====================
  THESIS: {
    GET_THESIS_SUBMISSION: { url: "/thesis/getThesisSubmission", method: "post" },
    TEACHER_AUDIT: { url: "/thesis/teacherAudit", method: "post" },
  },

  // ==================== 答辩安排 ====================
  DEFENSE_ARRANGEMENT: {
    GET_DEFENSE_ARRANGEMENT: {
      url: "/defenseArrangement/getDefenseArrangement",
      method: "post",
    },
  },

  // ==================== 过程指导 ====================
  PROCESS_GUIDANCE_RECORD: {
    GET_PROCESS_GUIDANCE_RECORD: {
      url: "/processGuidanceRecord/getProcessGuidanceRecord",
      method: "post",
    },
    TEACHER_FILL: { url: "/processGuidanceRecord/teacherFill", method: "post" },
  },

  // ==================== 外文翻译 ====================
  FOREIGN_LANGUAGE_TRANSLATION: {
    GET_FOREIGN_LANGUAGE_TRANSLATION: {
      url: "/foreignLanguageTranslation/getForeignLanguageTranslation",
      method: "post",
    },
    TEACHER_AUDIT: {
      url: "/foreignLanguageTranslation/teacherAudit",
      method: "post",
    },
  },

  // ==================== 指导关系 ====================
  GUIDANCE_RELATION: {
    GET_GUIDANCE_RELATION: { url: "/GuidanceRelation/getGuidanceRelation", method: "post" },
  },

  // ==================== 文件管理 ====================
  FILE: {
    UPLOAD: { url: "/file/upload", method: "post" },
    DOWNLOAD: { url: "/file/download", method: "get" },
    GET_FILE_DETAIL: { url: "/file/getFileDetail", method: "post" },
    GET_PREVIEW_URL: { url: "/file/getPreviewUrl", method: "post" },
  },

  // ==================== 代码查重 ====================
  CODE_DUPLICATE_CHECK: {
    UPLOAD_AND_COMPARE: { url: "/codeDuplicateCheck/uploadAndCompare", method: "post" },
    GET_LIST: { url: "/codeDuplicateCheck/getList", method: "post" },
    GET_DETAIL: { url: "/codeDuplicateCheck/getDetail", method: "post" },
    DOWNLOAD_RESULT: { url: "/codeDuplicateCheck/downloadResult", method: "get" },
  },
  
  // ==================== 参考文献格式校对 ====================
  REFERENCE_CHECK: {
    CHECK_REFERENCE: { url: "/referenceCheck/checkReference", method: "post" },
  },
};

/**
 * 获取接口配置工具函数
 * @param {string} module - 模块名 (如 'USER', 'TOPIC_SELECT')
 * @param {string} api - 接口名 (如 'LOGIN', 'APPLY')
 * @returns {Object|null} API 配置对象
 */
export const getApiConfig = (module, api) => {
  if (!API[module] || !API[module][api]) {
    console.error(`API 配置不存在：${module}.${api}`);
    return null;
  }
  return API[module][api];
};

export default API;
