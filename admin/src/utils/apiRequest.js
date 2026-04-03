// src/utils/apiRequest.js

import request from "./request";
import { API } from "./api";

/**
 * 统一 API 请求方法
 * @param {Object} apiConfig - API 配置 { url, method }
 * @param {Object} data - 请求数据
 * @param {Object} config - 额外配置
 * @returns {Promise}
 */
export const apiCall = (apiConfig, data = {}, config = {}) => {
  if (!apiConfig || !apiConfig.url) {
    console.error("API 配置无效");
    return Promise.reject(new Error("API 配置无效"));
  }

  const { url, method } = apiConfig;

  return request({
    url,
    method: method || "post",
    data,
    params: config.params,
    ...config,
  });
};

/**
 * 模块化的 API 调用方法
 */

// ==================== 账户管理 ====================
export const userApi = {
  // 获取验证码（不需要 Token）GET /users/checkCode
  checkCode: (config = {}) =>
    apiCall(API.USER.CHECK_CODE, {}, { ...config, showLoading: false }),

  // 用户注册（不需要 Token）POST /users/register
  register: (data, config = {}) =>
    apiCall(API.USER.REGISTER, data, { ...config, isForm: true }),

  // 用户登录（不需要 Token）POST /users/login
  login: (data, config = {}) =>
    apiCall(API.USER.LOGIN, data, {
      ...config,
      isForm: true,
      showLoading: false,
    }),

  // 获取登录信息（需要 Token）GET /users/getLoginInfo
  getLoginInfo: (config = {}) => apiCall(API.USER.GET_LOGIN_INFO, {}, config),

  // 退出登录（需要 Token）GET /users/logout
  logout: (config = {}) => apiCall(API.USER.LOGOUT, {}, config),

  // 修改密码（需要 Token）POST /users/updatePassword
  updatePassword: (data, config = {}) =>
    apiCall(API.USER.UPDATE_PASSWORD, data, { ...config, isForm: true }),
};

// ==================== 选题管理 ====================
export const topicApi = {
  // 获取选题信息（需要 Token）POST /topicSelect/getTopicSelection
  getTopicSelection: (data = {}, config = {}) =>
    apiCall(API.TOPIC_SELECT.GET_TOPIC_SELECTION, data, config),
};

// ==================== 任务书 ====================
export const taskBookApi = {
  // 获取任务书信息（需要 Token）POST /taskBook/getTaskBook
  getTaskBook: (data = {}, config = {}) =>
    apiCall(API.TASK_BOOK.GET_TASK_BOOK, data, config),
};

// ==================== 开题报告 ====================
export const openingReportApi = {
  // 获取开题报告信息（需要 Token）POST /openingReport/getOpeningReport
  getOpeningReport: (data = {}, config = {}) =>
    apiCall(API.OPENING_REPORT.GET_OPENING_REPORT, data, config),
};

// ==================== 中期检查 ====================
export const midtermCheckApi = {
  // 获取中期检查信息（需要 Token）POST /midtermCheck/getMidtermCheck
  getMidtermCheck: (data = {}, config = {}) =>
    apiCall(API.MIDTERM_CHECK.GET_MIDTERM_CHECK, data, config),
};

// ==================== 论文初稿 ====================
export const thesisDraftApi = {
  // 获取论文初稿信息（需要 Token）POST /ThesisDraft/getThesisDraft
  getThesisDraft: (data = {}, config = {}) =>
    apiCall(API.THESIS_DRAFT.GET_THESIS_DRAFT, data, config),
};

// ==================== 答辩安排 ====================
export const defenseApi = {
  // 获取答辩安排信息（需要 Token）POST /defenseArrangement/getDefenseArrangement
  getDefenseArrangement: (data = {}, config = {}) =>
    apiCall(API.DEFENSE_ARRANGEMENT.GET_DEFENSE_ARRANGEMENT, data, config),
};

// ==================== 过程指导记录 ====================
export const guidanceApi = {
  // 获取过程指导记录（需要 Token）POST /processGuidanceRecord/getProcessGuidanceRecord
  getProcessGuidanceRecord: (data = {}, config = {}) =>
    apiCall(
      API.PROCESS_GUIDANCE_RECORD.GET_PROCESS_GUIDANCE_RECORD,
      data,
      config,
    ),
};

// ==================== 外文翻译 ====================
export const foreignTranslationApi = {
  // 获取外文翻译信息（需要 Token）POST /foreignLanguageTranslation/getForeignLanguageTranslation
  getForeignLanguageTranslation: (data = {}, config = {}) =>
    apiCall(API.FOREIGN_LANGUAGE_TRANSLATION.GET_FOREIGN_LANGUAGE_TRANSLATION, data, config),
};

// ==================== 文件管理 ====================
export const fileApi = {
  // 上传文件（需要 Token）POST /file/upload
  upload: (file, data = {}, config = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key] ?? "");
    });

    return request({
      url: API.FILE.UPLOAD.url,
      method: API.FILE.UPLOAD.method,
      data: formData,
      isForm: false,
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    });
  },

  // 下载文件（需要 Token）GET /file/download
  download: (fileId, config = {}) => {
    return request({
      url: API.FILE.DOWNLOAD.url,
      method: API.FILE.DOWNLOAD.method,
      params: { fileId },
      responseType: "blob",
      ...config,
    });
  },

  // 获取文件详情（需要 Token）POST /file/getFileDetail
  getFileDetail: (fileId, config = {}) => {
    return request({
      url: API.FILE.GET_FILE_DETAIL.url,
      method: API.FILE.GET_FILE_DETAIL.method,
      params: { fileId },
      ...config,
    });
  },
};

// ==================== 学生管理 ====================
export const studentApi = {
  // 获取学生列表（需要 Token）POST /student/getStudentList
  getStudentList: (data = {}, config = {}) =>
    apiCall(API.STUDENT.GET_STUDENT_LIST, data, config),
};

// ==================== 导师管理 ====================
export const teacherApi = {
  // 获取导师列表（需要 Token）POST /teacher/getTeacherList
  getTeacherList: (data = {}, config = {}) =>
    apiCall(API.TEACHER.GET_TEACHER_LIST, data, config),
};

// ==================== 论文查重设置 ====================
export const plagiarismApi = {
  // 获取查重设置（需要 Token）GET /plagiarism/getSetting
  getSetting: (config = {}) => apiCall(API.PLAGIARISM.GET_SETTING, {}, config),

  // 保存查重设置（需要 Token）POST /plagiarism/saveSetting
  saveSetting: (data, config = {}) =>
    apiCall(API.PLAGIARISM.SAVE_SETTING, data, config),
};

export default {
  userApi,
  topicApi,
  taskBookApi,
  openingReportApi,
  midtermCheckApi,
  thesisDraftApi,
  defenseApi,
  guidanceApi,
  foreignTranslationApi,
  fileApi,
  studentApi,
  teacherApi,
  plagiarismApi,
};
