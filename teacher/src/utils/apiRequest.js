// src/utils/apiRequest.js
import request from "./request";
import { API } from "./api";

/**
 * 统一 API 调用方法
 * @param {Object} apiConfig - API 配置 { url, method }
 * @param {Object} data - 请求数据
 * @param {Object} config - 额外配置
 * @returns {Promise}
 */
const apiCall = (apiConfig, data = {}, config = {}) => {
  if (!apiConfig || !apiConfig.url) {
    console.error("API 配置无效");
    return Promise.reject(new Error("API 配置无效"));
  }

  const { url, method } = apiConfig;

  return request({
    url,
    method: method || "post",
    data,
    ...config,
  });
};

// ==================== 用户相关接口 ====================

export const userApi = {
  checkCode: (config = {}) =>
    apiCall(API.USER.CHECK_CODE, {}, { ...config, showLoading: false }),
  register: (data, config = {}) => apiCall(API.USER.REGISTER, data, config),
  login: (data, config = {}) =>
    apiCall(API.USER.LOGIN, data, {
      ...config,
      isForm: true,
      showLoading: false,
    }),
  getLoginInfo: (config = {}) => apiCall(API.USER.GET_LOGIN_INFO, {}, config),
  logout: (config = {}) => apiCall(API.USER.LOGOUT, {}, config),
  updatePassword: (data, config = {}) =>
    apiCall(API.USER.UPDATE_PASSWORD, data, config),
};

// ==================== 选题管理接口 ====================

export const topicApi = {
  apply: (data, config = {}) => apiCall(API.TOPIC_SELECT.APPLY, data, config),
  getTopicSelection: (data = {}, config = {}) =>
    apiCall(API.TOPIC_SELECT.GET_TOPIC_SELECTION, data, config),
  publish: (topicId, config = {}) =>
    apiCall(API.TOPIC_SELECT.PUBLISH, {}, { ...config, params: { topicId } }),
  getDept: (config = {}) => apiCall(API.TOPIC_SELECT.GET_DEPT, {}, config),
};

// ==================== 任务书接口 ====================

export const taskBookApi = {
  getTaskBook: (data = {}, config = {}) =>
    apiCall(API.TASK_BOOK.GET_TASK_BOOK, data, config),
  applyTaskBook: (data, config = {}) =>
    apiCall(API.TASK_BOOK.APPLY_TASK_BOOK, data, config),
};

// ==================== 开题报告接口 ====================

export const openingReportApi = {
  getOpeningReport: (data = {}, config = {}) =>
    apiCall(API.OPENING_REPORT.GET_OPENING_REPORT, data, config),
  teacherAudit: (data, config = {}) =>
    apiCall(API.OPENING_REPORT.TEACHER_AUDIT, data, config),
};

// ==================== 中期检查接口 ====================

export const midtermCheckApi = {
  getMidtermCheck: (data = {}, config = {}) =>
    apiCall(API.MIDTERM_CHECK.GET_MIDTERM_CHECK, data, config),
  teacherAudit: (data, config = {}) =>
    apiCall(API.MIDTERM_CHECK.TEACHER_AUDIT, data, config),
};

// ==================== 论文初稿接口 ====================

export const thesisDraftApi = {
  getThesisDraft: (data = {}, config = {}) =>
    apiCall(API.THESIS_DRAFT.GET_THESIS_DRAFT, data, config),
  teacherAudit: (data, config = {}) =>
    apiCall(API.THESIS_DRAFT.TEACHER_AUDIT, data, config),
  getDuplicateCheckThreshold: (config = {}) =>
    apiCall(API.THESIS_DRAFT.GET_DUPLICATE_CHECK_THRESHOLD, {}, config),
  setDuplicateCheckThreshold: (data, config = {}) =>
    apiCall(API.THESIS_DRAFT.SET_DUPLICATE_CHECK_THRESHOLD, data, config),
};

// ==================== 论文终稿接口 ====================

export const thesisFinalApi = {
  getThesisFinalList: (data = {}, config = {}) =>
    apiCall(API.THESIS_FINAL.GET_THESIS_FINAL_LIST, data, config),
};

// ==================== 答辩安排接口 ====================

export const defenseApi = {
  getDefenseArrangement: (data = {}, config = {}) =>
    apiCall(API.DEFENSE_ARRANGEMENT.GET_DEFENSE_ARRANGEMENT, data, config),
};

// ==================== 过程指导接口 ====================

export const guidanceApi = {
  getProcessGuidanceRecord: (data = {}, config = {}) =>
    apiCall(
      API.PROCESS_GUIDANCE_RECORD.GET_PROCESS_GUIDANCE_RECORD,
      data,
      config,
    ),
  teacherFill: (data, config = {}) =>
    apiCall(API.PROCESS_GUIDANCE_RECORD.TEACHER_FILL, data, config),
};

// ==================== 指导关系接口 ====================

export const guidanceRelationApi = {
  getGuidanceRelation: (data = {}, config = {}) =>
    apiCall(API.GUIDANCE_RELATION.GET_GUIDANCE_RELATION, data, config),
};

// ==================== 外文翻译接口 ====================

export const foreignTranslationApi = {
  getForeignLanguageTranslation: (data = {}, config = {}) =>
    apiCall(API.FOREIGN_LANGUAGE_TRANSLATION.GET_FOREIGN_LANGUAGE_TRANSLATION, data, config),
  teacherAudit: (data, config = {}) =>
    apiCall(API.FOREIGN_LANGUAGE_TRANSLATION.TEACHER_AUDIT, data, config),
};

// ==================== 文件管理接口 ====================

export const thesisApi = {
  getThesisSubmission: (data = {}, config = {}) =>
    apiCall(API.THESIS.GET_THESIS_SUBMISSION, data, config),
  teacherAudit: (data, config = {}) =>
    apiCall(API.THESIS.TEACHER_AUDIT, data, config),
};

// ==================== 文件管理接口 ====================

export const fileApi = {
  upload: (file, data = {}, config = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key] ?? "");
    });
    return apiCall(API.FILE.UPLOAD, formData, {
      ...config,
      isForm: false,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  // 下载文件
  download: (fileId, config = {}) => {
    return apiCall(API.FILE.DOWNLOAD, {}, {
      ...config,
      params: { fileId },
      responseType: 'blob'
    });
  },
  // 获取文件详情
  getFileDetail: (fileId, config = {}) => {
    return apiCall(API.FILE.GET_FILE_DETAIL, {}, {
      ...config,
      params: { fileId }
    });
  },
  // 获取文件预览URL
  getPreviewUrl: (fileId, config = {}) => {
    return apiCall(API.FILE.GET_PREVIEW_URL, {}, {
      ...config,
      params: { fileId }
    });
  },
};

// ==================== 代码查重接口 ====================

export const codeDuplicateCheckApi = {
  // 上传两个文件并进行代码相似度比对
  uploadAndCompare: (sourceFile, comparisonFile, config = {}) => {
    const formData = new FormData();
    formData.append("sourceFile", sourceFile);
    formData.append("comparisonFile", comparisonFile);
    return apiCall(API.CODE_DUPLICATE_CHECK.UPLOAD_AND_COMPARE, formData, {
      ...config,
      isForm: false,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  // 分页查询代码查重记录列表
  getList: (data = {}, config = {}) => {
    return apiCall(API.CODE_DUPLICATE_CHECK.GET_LIST, data, config);
  },
  // 查询单个查重记录详情
  getDetail: (data, config = {}) => {
    return apiCall(API.CODE_DUPLICATE_CHECK.GET_DETAIL, data, config);
  },
  // 下载查重结果文件
  downloadResult: (id, config = {}) => {
    return apiCall(API.CODE_DUPLICATE_CHECK.DOWNLOAD_RESULT, {}, {
      ...config,
      params: { id },
      responseType: 'blob'
    });
  },
};

// ==================== 参考文献格式校对接口 ====================

export const referenceCheckApi = {
  // 参考文献格式校对
  checkReference: (data, config = {}) => {
    return apiCall(API.REFERENCE_CHECK.CHECK_REFERENCE, data, config);
  },
};

// ==================== 统一导出 ====================

export default {
  userApi,
  topicApi,
  taskBookApi,
  openingReportApi,
  midtermCheckApi,
  thesisDraftApi,
  thesisFinalApi,
  thesisApi,
  defenseApi,
  guidanceApi,
  guidanceRelationApi,
  foreignTranslationApi,
  fileApi,
  codeDuplicateCheckApi,
  referenceCheckApi,
};
