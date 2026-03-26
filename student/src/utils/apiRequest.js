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

  // 提交/退选选题（需要 Token）POST /topicSelect/submitTopicSelection
  submitTopicSelection: (data, config = {}) =>
    apiCall(API.TOPIC_SELECT.SUBMIT_TOPIC_SELECTION, data, {
      ...config,
      isForm: true,
    }),
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

  // 提交开题报告（需要 Token）POST /openingReport/studentApply
  studentApply: (data, config = {}) =>
    apiCall(API.OPENING_REPORT.STUDENT_APPLY, data, config),
};

// ==================== 中期检查 ====================
export const midtermCheckApi = {
  // 获取中期检查信息（需要 Token）POST /midtermCheck/getMidtermCheck
  getMidtermCheck: (data = {}, config = {}) =>
    apiCall(API.MIDTERM_CHECK.GET_MIDTERM_CHECK, data, config),

  // 提交中期检查（需要 Token）POST /midtermCheck/studentApply
  studentApply: (data, config = {}) =>
    apiCall(API.MIDTERM_CHECK.STUDENT_APPLY, data, config),
};

// ==================== 论文初稿 ====================
export const thesisDraftApi = {
  // 获取论文初稿信息（需要 Token）POST /ThesisDraft/getThesisDraft
  getThesisDraft: (data = {}, config = {}) =>
    apiCall(API.THESIS_DRAFT.GET_THESIS_DRAFT, data, config),

  // 提交论文初稿（需要 Token）POST /ThesisDraft/studentApply
  studentApply: (data, config = {}) =>
    apiCall(API.THESIS_DRAFT.STUDENT_APPLY, data, config),

  // 获取查重率阈值（需要 Token）GET /ThesisDraft/getDuplicateCheckThreshold
  getDuplicateCheckThreshold: (config = {}) =>
    apiCall(API.THESIS_DRAFT.GET_DUPLICATE_CHECK_THRESHOLD, {}, config),
};

// ==================== 论文终稿 ====================
export const thesisFinalApi = {
  // 获取论文终稿信息（需要 Token）POST /ThesisFinal/getThesisFinalList
  getThesisFinalList: (data = {}, config = {}) =>
    apiCall(API.THESIS_FINAL.GET_THESIS_FINAL_LIST, data, config),

  // 提交论文终稿（需要 Token）POST /ThesisFinal/studentApply
  studentApply: (data, config = {}) =>
    apiCall(API.THESIS_FINAL.STUDENT_APPLY, data, config),
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
      ...config,
    });
  },

  // 下载文件（需要 Token）GET /file/download/{fileId}
  download: (fileId, config = {}) => {
    return request({
      url: `${API.FILE.DOWNLOAD.url}/${fileId}`,
      method: API.FILE.DOWNLOAD.method,
      responseType: "blob",
      ...config,
    });
  },
};

export default {
  userApi,
  topicApi,
  taskBookApi,
  openingReportApi,
  midtermCheckApi,
  thesisDraftApi,
  thesisFinalApi,
  defenseApi,
  guidanceApi,
  fileApi,
};
