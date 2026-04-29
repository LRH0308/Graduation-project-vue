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

  // ==================== 开题报告 ====================
  OPENING_REPORT: {
    // 获取开题报告信息
    GET_OPENING_REPORT: { url: "/openingReport/getOpeningReport", method: "post" },
  },

  // ==================== 中期检查 ====================
  MIDTERM_CHECK: {
    // 获取中期检查信息
    GET_MIDTERM_CHECK: { url: "/midtermCheck/getMidtermCheck", method: "post" },
  },

  // ==================== 论文初稿 ====================
  THESIS_DRAFT: {
    // 获取论文初稿信息
    GET_THESIS_DRAFT: { url: "/ThesisDraft/getThesisDraft", method: "post" },
  },

  // ==================== 论文终稿 ====================
  THESIS_FINAL: {
    // 获取论文终稿信息
    GET_THESIS_FINAL_LIST: { url: "/ThesisFinal/getThesisFinalList", method: "post" },
  },

  // ==================== 过程指导记录 ====================
  PROCESS_GUIDANCE_RECORD: {
    // 获取过程指导记录信息
    GET_PROCESS_GUIDANCE_RECORD: { url: "/processGuidanceRecord/getProcessGuidanceRecord", method: "post" },
  },

  // ==================== 外文翻译 ====================
  FOREIGN_LANGUAGE_TRANSLATION: {
    // 获取外文翻译信息
    GET_FOREIGN_LANGUAGE_TRANSLATION: {
      url: "/foreignLanguageTranslation/getForeignLanguageTranslation",
      method: "post",
    },
  },

  // ==================== 学生管理 ====================
  STUDENT: {
    // 获取学生信息列表
    GET_STUDENT_INFO: { url: "/student/getStudentInfo", method: "post" },
  },

  // ==================== 教师管理 ====================
  TEACHER: {
    // 获取教师信息列表
    GET_TEACHER_INFO: { url: "/teacher/getTeacherInfo", method: "post" },
  },

  // ==================== 指导关系管理 ====================
  GUIDANCE_RELATION: {
    // 获取指导关系列表
    GET_GUIDANCE_RELATION: { url: "/guidanceRelation/getGuidanceRelation", method: "post" },
    // 批量导入师生关系
    BATCH_IMPORT_RELATIONS: { url: "/guidanceRelation/batchImportRelations", method: "post" },
    // 更新师生关系（系主任）
    UPDATE_GUIDANCE_RELATION: { url: "/guidanceRelation/updateGuidanceRelation", method: "post" },
  },

  // ==================== 文件管理 ====================
  FILE: {
    UPLOAD: { url: "/file/upload", method: "post" },
    DOWNLOAD: { url: "/file/download", method: "get" },
    GET_FILE_DETAIL: { url: "/file/getFileDetail", method: "post" },
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
