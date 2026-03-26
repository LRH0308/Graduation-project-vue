// src/stores/user.js

import { defineStore } from "pinia";
import { userApi } from "@/utils/apiRequest";
import { ElMessage } from "element-plus";
import router from "@/router";

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: null,
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || 3, // 系主任角色固定为 3
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    displayName: (state) => {
      if (!state.userInfo) return "";
      return `${state.userInfo.deptName} ${state.userInfo.teacherAccount}【${state.userInfo.name}】`;
    },
  },

  actions: {
    // 获取验证码（不需要 Token）
    async getCaptcha() {
      try {
        const response = await userApi.checkCode();
        return response;
      } catch (error) {
        console.error("获取验证码失败:", error);
        throw error;
      }
    },

    // 用户登录（不需要 Token）
    async login(loginData) {
      try {
        // 验证必填字段
        if (!loginData.account) {
          throw new Error("工号不能为空");
        }
        if (!loginData.password) {
          throw new Error("密码不能为空");
        }
        if (!loginData.checkCode) {
          throw new Error("验证码不能为空");
        }
        if (!loginData.checkCodeKey) {
          throw new Error("验证码 Key 不能为空，请刷新验证码");
        }

        // 系主任端 role 固定为 3
        const requestData = {
          ...loginData,
          role: 3,
        };

        const response = await userApi.login(requestData);
        if (response.status === "success" && response.data) {
          this.token = response.data.token;
          this.userInfo = response.data;
          this.role = 3; // 设置系主任角色
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("role", "3");
        }
        return response;
      } catch (error) {
        console.error("登录失败:", error);
        throw error;
      }
    },

    // 获取登录信息（需要 Token）
    async getLoginInfo() {
      try {
        const response = await userApi.getLoginInfo();
        if (response.status === "success" && response.data) {
          this.userInfo = response.data;
          this.token = response.data.token;
          this.role = response.data.role || 3;
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("role", "3");
          return true;
        }
        return false;
      } catch (error) {
        console.error("获取登录信息失败:", error);
        throw error;
      }
    },

    // 退出登录（需要 Token）
    async logout() {
      try {
        await userApi.logout();
      } catch (error) {
        console.error("退出登录 API 调用失败:", error);
      } finally {
        this.clearUserState();
        router.push("/login");
      }
      return { status: "success", info: "退出成功" };
    },

    // 清除用户状态
    clearUserState() {
      this.userInfo = null;
      this.token = null;
      this.role = 3;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  },
});
