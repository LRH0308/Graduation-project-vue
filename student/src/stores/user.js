// src/stores/user.js

import { defineStore } from "pinia";
import { userApi } from "@/utils/apiRequest";
import { ElMessage } from "element-plus";
import router from "@/router";

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: null,
    token: localStorage.getItem("token") || null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    displayName: (state) => {
      if (!state.userInfo) return "";
      return `${state.userInfo.graduationTime} ${state.userInfo.className} ${state.userInfo.studentAccount}【${state.userInfo.name}】`;
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
          throw new Error("学号不能为空");
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

        const response = await userApi.login(loginData);
        if (response.status === "success" && response.data) {
          this.token = response.data.token;
          this.userInfo = response.data;
          localStorage.setItem("token", response.data.token);
        }
        // 新增：登录成功后获取完整用户信息
        await this.getLoginInfo();
        return response;
      } catch (error) {
        console.error("登录失败:", error);
        throw error;
      }
    },

    // 用户注册（不需要 Token）
    async register(registerData) {
      try {
        const response = await userApi.register(registerData);
        return response;
      } catch (error) {
        console.error("注册失败:", error);
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
          localStorage.setItem("token", response.data.token);
        }
        return response;
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
        // 无论 API 是否成功，都清除本地状态
        this.clearUserState();
        router.push("/login");
      }
      return { status: "success", info: "退出成功" };
    },

    // 修改密码（需要 Token）
    async updatePassword(oldPassword, newPassword) {
      try {
        const response = await userApi.updatePassword({
          oldPassword,
          password: newPassword,
        });
        return response;
      } catch (error) {
        console.error("修改密码失败:", error);
        throw error;
      }
    },

    // 验证登录状态（页面刷新时使用，需要 Token）
    async checkLoginStatus() {
      const token = localStorage.getItem("token");
      if (!token || token === "undefined" || token === "null") {
        return false;
      }

      try {
        const response = await this.getLoginInfo();
        if (response.status === "success") {
          return true;
        }
        return false;
      } catch (error) {
        console.error("验证登录状态失败:", error);
        this.clearUserState();
        return false;
      }
    },

    // 清除用户状态
    clearUserState() {
      this.token = null;
      this.userInfo = null;
      localStorage.removeItem("token");
    },
  },
});
