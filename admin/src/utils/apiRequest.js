import { get, post } from "./request";

// 用户相关 API（参考 student 端实现）
export const userApi = {
  // 获取验证码
  getCaptcha: () => {
    console.log("userApi.getCaptcha 调用");
    return get("/users/checkCode");
  },

  // 用户登录
  login: (data) => {
    console.log("userApi.login 发送的数据:", data);
    return post("/users/login", data);
  },

  // 获取登录信息
  getLoginInfo: () => {
    console.log("userApi.getLoginInfo 调用");
    return get("/users/getLoginInfo");
  },

  // 退出登录
  logout: () => {
    console.log("userApi.logout 调用");
    return get("/users/logout");
  },

  // 修改密码
  updatePassword: (data) => post("/users/updatePassword", data),
};

// 选题管理 API
export const topicApi = {
  // 获取选题列表
  getTopicSelection: (params) => post("/topicSelect/getTopicSelection", params),

  // 审核选题
  approve: (data) => post("/topicSelect/approve", data),
};

// 任务书 API
export const taskBookApi = {
  // 获取任务书列表
  getTaskBook: (params) => post("/taskBook/getTaskBook", params),

  // 审核任务书
  departApprove: (data) => post("/taskBook/departApprove", data),
};

// 答辩安排 API
export const defenseApi = {
  // 获取答辩安排列表
  getDefenseArrangement: (params) =>
    post("/defenseArrangement/getDefenseArrangement", params),

  // 安排答辩
  deptArrange: (data) => post("/defenseArrangement/deptArrange", data),
};

// 文件上传 API
export const fileApi = {
  upload: (file, data) => {
    const formData = new FormData();
    formData.append("file", file);
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return post("/file/upload", formData);
  },
};
