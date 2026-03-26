import axios from "axios";
import { ElMessage } from "element-plus";
import qs from "qs";

// 创建 axios 实例
const request = axios.create({
  baseURL: "/admin",
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = token;
    }

    // 登录/注册接口使用表单格式
    if (
      config.method === "post" &&
      (config.url === "/users/login" || config.url === "/users/register")
    ) {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
      config.data = qs.stringify(config.data);
    }

    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200 && res.status !== "success") {
      ElMessage.error(res.info || "请求失败");
      return Promise.reject(new Error(res.info || "请求失败"));
    }
    return res;
  },
  (error) => {
    console.error("响应错误:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    ElMessage.error(error.message || "网络错误");
    return Promise.reject(error);
  },
);

export default request;

export const get = (url, params = {}) => {
  return request.get(url, { params });
};

export const post = (url, data = {}) => {
  return request.post(url, data);
};

export const upload = (url, file, data = {}) => {
  const formData = new FormData();
  formData.append("file", file);
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });
  return request.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
