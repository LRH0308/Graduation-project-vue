// src/utils/request.js
import axios from "axios";
import { ElLoading, ElMessage } from "element-plus";
import router from "@/router";

// ==================== 常量定义 ====================

// 不需要 Token 的接口路径（白名单）
const NO_AUTH_PATHS = ["/users/login", "/users/register", "/users/checkCode"];

// 内容类型常量
const CONTENT_TYPE_FORM = "application/x-www-form-urlencoded;charset=UTF-8";
const CONTENT_TYPE_JSON = "application/json;charset=UTF-8";
const CONTENT_TYPE_MULTIPART = "multipart/form-data";

// ==================== 创建 axios 实例 ====================

const request = axios.create({
  baseURL: "/teacher", // 与 vite.config.js 代理配置一致
  timeout: 10000,
  withCredentials: true,
});

// ==================== 请求拦截器 ====================

request.interceptors.request.use(
  (config) => {
    // 显示 loading（可配置关闭）
    if (config.showLoading !== false) {
      config.loadingInstance = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
    }

    // 检查是否需要 Token
    const needAuth = !NO_AUTH_PATHS.some((path) => config.url.includes(path));

    if (needAuth) {
      // 直接从 localStorage 获取 Token
      const token = localStorage.getItem("token");

      if (!token || token === "undefined" || token === "null") {
        console.error("请求需要 Token 但未提供，请求路径:", config.url);
        ElMessage.error("登录已过期，请重新登录");
        // 清除本地存储
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login");
        return Promise.reject(new Error("未授权访问"));
      }

      // 支持两种 token 传递方式（兼容后端）
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.token = token;
    }

    // 设置 Content-Type
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = config.isForm
        ? CONTENT_TYPE_FORM
        : CONTENT_TYPE_JSON;
    }

    // 表单数据序列化
    if (config.isForm && config.data) {
      const params = new URLSearchParams();
      Object.keys(config.data).forEach((key) => {
        params.append(key, config.data[key] ?? "");
      });
      config.data = params;
    } else if (
      config.data &&
      config.headers["Content-Type"]?.includes("json") &&
      !(config.data instanceof FormData)
    ) {
      config.data = JSON.stringify(config.data);
    }

    return config;
  },
  (error) => {
    console.error("请求拦截器错误:", error);
    error.config?.loadingInstance?.close();
    return Promise.reject(error);
  },
);

// ==================== 响应拦截器 ====================

request.interceptors.response.use(
  (response) => {
    // 关闭 loading
    response.config.loadingInstance?.close();

    // 处理二进制响应（文件下载）
    if (
      response.config.responseType === "blob" ||
      response.config.responseType === "arraybuffer"
    ) {
      return response.data;
    }

    const responseData = response.data;

    // 统一响应处理（兼容 code 和 status 两种格式）
    if (responseData.code === 200 || responseData.status === "success") {
      return responseData;
    } else if (
      responseData.code === 901 ||
      responseData.code === 401 ||
      responseData.status === 401
    ) {
      // Token 失效，需要重新登录
      // 直接清除本地存储
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      ElMessage.error("登录已过期，请重新登录");
      router.push("/login");
      return Promise.reject({ showError: false, msg: "未授权" });
    } else {
      // 业务错误
      const showError = response.config.showError !== false;
      if (showError && responseData.info) {
        ElMessage.error(responseData.info);
      }
      return Promise.reject({
        showError,
        msg: responseData.info || "请求失败",
        data: responseData,
      });
    }
  },
  (error) => {
    // 关闭 loading
    error.config?.loadingInstance?.close();

    // 处理 401 错误
    if (error.response?.status === 401) {
      // 直接清除本地存储
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      ElMessage.error("登录已过期，请重新登录");
      router.push("/login");
    }

    // 网络错误
    const showError = error.config?.showError !== false;
    if (showError) {
      ElMessage.error(error.message || "网络异常");
    }

    return Promise.reject({
      showError,
      msg: error.message || "网络异常",
      error,
    });
  },
);

// ==================== 快捷请求方法 ====================

/**
 * GET 请求
 * @param {string} url - 请求路径
 * @param {Object} params - 请求参数
 * @param {Object} config - 额外配置
 * @returns {Promise}
 */
export const get = (url, params = {}, config = {}) => {
  return request({ url, method: "get", params, ...config });
};

/**
 * POST 请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求数据
 * @param {Object} config - 额外配置
 * @returns {Promise}
 */
export const post = (url, data = {}, config = {}) => {
  return request({ url, method: "post", data, ...config });
};

/**
 * PUT 请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求数据
 * @param {Object} config - 额外配置
 * @returns {Promise}
 */
export const put = (url, data = {}, config = {}) => {
  return request({ url, method: "put", data, ...config });
};

/**
 * DELETE 请求
 * @param {string} url - 请求路径
 * @param {Object} params - 请求参数
 * @param {Object} config - 额外配置
 * @returns {Promise}
 */
export const del = (url, params = {}, config = {}) => {
  return request({ url, method: "delete", params, ...config });
};

/**
 * 文件上传请求
 * @param {string} url - 请求路径
 * @param {File} file - 上传的文件
 * @param {Object} data - 额外数据
 * @param {Object} config - 额外配置
 * @returns {Promise}
 */
export const upload = (url, file, data = {}, config = {}) => {
  const formData = new FormData();
  formData.append("file", file);
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key] ?? "");
  });

  return request({
    url,
    method: "post",
    data: formData,
    isForm: false,
    headers: { "Content-Type": CONTENT_TYPE_MULTIPART },
    ...config,
  });
};

// ==================== 导出 ====================

export default request;
