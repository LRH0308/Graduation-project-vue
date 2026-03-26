// src/utils/request.js
import axios from "axios";
import { ElLoading, ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
import router from "@/router";

// ==================== 常量定义 ====================

// 内容类型常量
const CONTENT_TYPE_FORM = "application/x-www-form-urlencoded;charset=UTF-8";
const CONTENT_TYPE_JSON = "application/json;charset=UTF-8";

// 不需要 Token 的接口路径（白名单）
const NO_AUTH_PATHS = ["/users/login", "/users/register", "/users/checkCode"];

// ==================== 工具函数 ====================

/**
 * 下划线转驼峰命名
 * @param {string} str - 下划线命名的字符串
 * @returns {string} 驼峰命名的字符串
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * 递归转换对象键名为驼峰命名
 * @param {any} obj - 需要转换的对象/数组
 * @returns {any} 转换后的对象/数组
 */
const convertKeysToCamel = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamel(item));
  }

  const converted = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamel(key);
      converted[camelKey] = convertKeysToCamel(obj[key]);
    }
  }
  return converted;
};

// ==================== 创建 axios 实例 ====================

const request = axios.create({
  baseURL: "/student",
  timeout: 10000,
  withCredentials: true,
});

// ==================== 请求拦截器 ====================

request.interceptors.request.use(
  (config) => {
    // 显示 loading
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
      // 需要 Token 的接口，必须携带有效 Token
      const token = localStorage.getItem("token");

      if (!token || token === "undefined" || token === "null") {
        // Token 不存在或无效，跳转到登录页
        console.error("请求需要 Token 但未提供，请求路径:", config.url);
        ElMessage.error("登录已过期，请重新登录");
        localStorage.removeItem("token");
        router.push("/login");
        return Promise.reject(new Error("未授权访问"));
      }

      // 同时支持两种 token 传递方式
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
      Object.keys(config.data).length > 0 &&
      config.headers["Content-Type"]?.includes("json")
    ) {
      config.data = JSON.stringify(config.data);
    }

    return config;
  },
  (error) => {
    console.error("请求拦截器错误:", error);
    if (error.config?.loadingInstance) {
      error.config.loadingInstance.close();
    }
    return Promise.reject(error);
  },
);

// ==================== 响应拦截器 ====================

request.interceptors.response.use(
  (response) => {
    // 关闭 loading
    if (response.config.loadingInstance) {
      response.config.loadingInstance.close();
    }

    const responseData = response.data;

    // 处理二进制响应（文件下载）
    if (
      response.config.responseType === "blob" ||
      response.config.responseType === "arraybuffer"
    ) {
      return responseData;
    }

    // 转换响应数据中的键名为驼峰命名
    if (responseData.data) {
      responseData.data = convertKeysToCamel(responseData.data);
    }

    // 统一响应处理
    if (responseData.code === 200) {
      return responseData;
    } else if (responseData.code === 901 || responseData.code === 401) {
      // Token 失效，需要重新登录
      const userStore = useUserStore();
      userStore.clearUserState();
      ElMessage.error("登录已过期，请重新登录");
      router.push("/login");
      return Promise.reject({ showError: false });
    } else {
      // 业务错误
      const showError = response.config.showError !== false;
      if (showError && responseData.info) {
        ElMessage.error(responseData.info);
      }
      return Promise.reject({
        showError,
        msg: responseData.info,
        data: responseData,
      });
    }
  },
  (error) => {
    // 关闭 loading
    if (error.config?.loadingInstance) {
      error.config.loadingInstance.close();
    }

    // 处理 401 错误
    if (error.response?.status === 401) {
      const userStore = useUserStore();
      userStore.clearUserState();
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
    });
  },
);

// ==================== 统一请求方法 ====================

/**
 * 统一请求方法
 * @param {Object} config - 请求配置
 * @param {string} config.url - 请求路径
 * @param {Object} config.data - 请求数据
 * @param {Object} config.params - URL Query 参数
 * @param {string} config.method - 请求方法 (get/post/put/delete)
 * @param {boolean} config.showLoading - 是否显示 loading
 * @param {boolean} config.showError - 是否显示错误提示
 * @param {boolean} config.isForm - 是否为表单数据
 * @param {string} config.responseType - 响应类型
 * @param {Function} config.uploadProgressCallback - 上传进度回调
 * @param {Function} config.errorCallback - 错误回调
 * @returns {Promise}
 */
const apiRequest = (config) => {
  const {
    url,
    data = {},
    params = {},
    method = "post",
    showLoading = true,
    showError = true,
    isForm = false,
    responseType = "json",
    uploadProgressCallback,
    errorCallback,
  } = config;

  return request({
    url,
    method,
    data,
    params,
    showLoading,
    showError,
    isForm,
    responseType,
    onUploadProgress: uploadProgressCallback
      ? (event) => uploadProgressCallback(event)
      : undefined,
  }).catch((error) => {
    if (errorCallback) {
      errorCallback(error);
    }
    if (error.showError && error.msg) {
      ElMessage.error(error.msg);
    }
    return null;
  });
};

// ==================== 快捷请求方法 ====================

/**
 * GET 请求
 * @param {string} url - 请求路径
 * @param {Object} params - 请求参数
 * @param {Object} config - 额外配置
 * @returns {Promise}
 */
export const get = (url, params = {}, config = {}) => {
  return apiRequest({ url, data: params, method: "get", ...config });
};

/**
 * POST 请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求数据
 * @param {Object} config - 额外配置
 * @returns {Promise}
 */
export const post = (url, data = {}, config = {}) => {
  return apiRequest({ url, data, method: "post", ...config });
};

/**
 * PUT 请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求数据
 * @param {Object} config - 额外配置
 * @returns {Promise}
 */
export const put = (url, data = {}, config = {}) => {
  return apiRequest({ url, data, method: "put", ...config });
};

/**
 * DELETE 请求
 * @param {string} url - 请求路径
 * @param {Object} params - 请求参数
 * @param {Object} config - 额外配置
 * @returns {Promise}
 */
export const del = (url, params = {}, config = {}) => {
  return apiRequest({ url, data: params, method: "delete", ...config });
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

  return apiRequest({
    url,
    data: formData,
    method: "post",
    isForm: false,
    ...config,
  });
};

export const download = (url, params = {}, config = {}) => {
  return request({
    url,
    method: "get",
    params,
    responseType: "blob",
    ...config,
  });
};

// ==================== 导出 ====================

export default apiRequest;
