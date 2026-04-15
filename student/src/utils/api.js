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
    // 提交/退选选题 POST /topicSelect/submitTopicSelection
    SUBMIT_TOPIC_SELECTION: {
      url: "/topicSelect/submitTopicSelection",
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
    // 提交开题报告 POST /openingReport/studentApply
    STUDENT_APPLY: { url: "/openingReport/studentApply", method: "post" },
  },

  // ==================== 中期检查 ====================
  MIDTERM_CHECK: {
    // 获取中期检查信息 POST /midtermCheck/getMidtermCheck
    GET_MIDTERM_CHECK: { url: "/midtermCheck/getMidtermCheck", method: "post" },
    // 提交中期检查 POST /midtermCheck/studentApply
    STUDENT_APPLY: { url: "/midtermCheck/studentApply", method: "post" },
  },

  // ==================== 论文初稿 ====================
  THESIS_DRAFT: {
    // 获取论文初稿信息 POST /ThesisDraft/getThesisDraft
    GET_THESIS_DRAFT: {
      url: "/ThesisDraft/getThesisDraft",
      method: "post",
    },
    // 提交论文初稿 POST /ThesisDraft/studentApply
    STUDENT_APPLY: { url: "/ThesisDraft/studentApply", method: "post" },
    // 获取查重率阈值 GET /ThesisDraft/getDuplicateCheckThreshold
    GET_DUPLICATE_CHECK_THRESHOLD: {
      url: "/ThesisDraft/getDuplicateCheckThreshold",
      method: "get",
    },
  },

  // ==================== 论文终稿 ====================
  THESIS_FINAL: {
    // 获取论文终稿信息 POST /ThesisFinal/getThesisFinalList
    GET_THESIS_FINAL_LIST: {
      url: "/ThesisFinal/getThesisFinalList",
      method: "post",
    },
    // 提交论文终稿 POST /ThesisFinal/studentApply
    STUDENT_APPLY: { url: "/ThesisFinal/studentApply", method: "post" },
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
    // 提交外文翻译 POST /foreignLanguageTranslation/studentApply
    STUDENT_APPLY: {
      url: "/foreignLanguageTranslation/studentApply",
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

  // ==================== 流程节点配置 ====================
  PROCESS_NODE_CONFIG: {
    // 时间验证 GET /processNode/timeVerification
    TIME_VERIFICATION: { url: "/processNode/timeVerification", method: "get" },
    // 获取流程节点配置列表 POST /processNode/getList
    GET_LIST: { url: "/processNode/getList", method: "post" },
  },

  // ==================== 参考文献格式校对 ====================
  REFERENCE_CHECK: {
    // 参考文献格式校对 POST /referenceCheck/checkReference
    CHECK_REFERENCE: { url: "/referenceCheck/checkReference", method: "post" },
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
