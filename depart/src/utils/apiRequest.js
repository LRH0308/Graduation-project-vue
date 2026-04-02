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
  // 获取验证码（不需要 Token）
  checkCode: (config = {}) =>
    apiCall(API.USER.CHECK_CODE, {}, { ...config, showLoading: false }),
  // 用户注册（不需要 Token）
  register: (data, config = {}) => apiCall(API.USER.REGISTER, data, config),
  // 用户登录（不需要 Token）
  login: (data, config = {}) =>
    apiCall(API.USER.LOGIN, data, {
      ...config,
      isForm: true,
      showLoading: false,
    }),
  // 获取登录信息（需要 Token）
  getLoginInfo: (config = {}) => apiCall(API.USER.GET_LOGIN_INFO, {}, config),
  // 退出登录（需要 Token）
  logout: (config = {}) => apiCall(API.USER.LOGOUT, {}, config),
  // 修改密码（需要 Token）
  updatePassword: (data, config = {}) =>
    apiCall(API.USER.UPDATE_PASSWORD, data, config),
};

// ==================== 选题管理接口 ====================

export const topicApi = {
  // 系主任审核选题（需要 Token）
  approve: (data, config = {}) =>
    apiCall(API.TOPIC_SELECT.APPROVE, data, config),
  // 获取选题信息（需要 Token）
  getTopicSelection: (data = {}, config = {}) =>
    apiCall(API.TOPIC_SELECT.GET_TOPIC_SELECTION, data, config),
};

// ==================== 任务书接口 ====================

export const taskBookApi = {
  // 获取任务书信息（需要 Token）
  getTaskBook: (data = {}, config = {}) =>
    apiCall(API.TASK_BOOK.GET_TASK_BOOK, data, config),
  // 系主任审核任务书（需要 Token）
  departApprove: (data, config = {}) =>
    apiCall(API.TASK_BOOK.DEPART_APPROVE, data, config),
};

// ==================== 答辩安排接口 ====================

export const defenseApi = {
  // 获取答辩安排信息（需要 Token）
  getDefenseArrangement: (data = {}, config = {}) =>
    apiCall(API.DEFENSE_ARRANGEMENT.GET_DEFENSE_ARRANGEMENT, data, config),
  // 安排答辩（需要 Token）
  deptArrange: (data, config = {}) =>
    apiCall(API.DEFENSE_ARRANGEMENT.DEPT_ARRANGE, data, config),
};

// ==================== 开题报告接口 ====================

export const openingReportApi = {
  // 获取开题报告信息（需要 Token）
  getOpeningReport: (data = {}, config = {}) =>
    apiCall(API.OPENING_REPORT.GET_OPENING_REPORT, data, config),
};

// ==================== 中期检查接口 ====================

export const midtermCheckApi = {
  // 获取中期检查信息（需要 Token）
  getMidtermCheck: (data = {}, config = {}) =>
    apiCall(API.MIDTERM_CHECK.GET_MIDTERM_CHECK, data, config),
};

// ==================== 论文初稿接口 ====================

export const thesisDraftApi = {
  // 获取论文初稿信息（需要 Token）
  getThesisDraft: (data = {}, config = {}) =>
    apiCall(API.THESIS_DRAFT.GET_THESIS_DRAFT, data, config),
};

// ==================== 论文终稿接口 ====================

export const thesisFinalApi = {
  // 获取论文终稿信息（需要 Token）
  getThesisFinalList: (data = {}, config = {}) =>
    apiCall(API.THESIS_FINAL.GET_THESIS_FINAL_LIST, data, config),
};

// ==================== 过程指导记录接口 ====================

export const processGuidanceApi = {
  // 获取过程指导记录信息（需要 Token）
  getProcessGuidanceRecord: (data = {}, config = {}) =>
    apiCall(API.PROCESS_GUIDANCE_RECORD.GET_PROCESS_GUIDANCE_RECORD, data, config),
};

// ==================== 学生管理接口 ====================

export const studentApi = {
  // 获取学生信息列表
  getStudentInfo: (data = {}, config = {}) =>
    apiCall(API.STUDENT.GET_STUDENT_INFO, data, config),
};

// ==================== 教师管理接口 ====================

export const teacherApi = {
  // 获取教师信息列表
  getTeacherInfo: (data = {}, config = {}) =>
    apiCall(API.TEACHER.GET_TEACHER_INFO, data, config),
};

// ==================== 指导关系管理接口 ====================

export const guidanceRelationApi = {
  // 获取指导关系列表
  getGuidanceRelation: (data = {}, config = {}) =>
    apiCall(API.GUIDANCE_RELATION.GET_GUIDANCE_RELATION, data, config),
  // 批量导入师生关系
  batchImportRelations: (data, config = {}) =>
    apiCall(API.GUIDANCE_RELATION.BATCH_IMPORT_RELATIONS, data, config),
};

// ==================== 文件管理接口 ====================

export const fileApi = {
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
};
