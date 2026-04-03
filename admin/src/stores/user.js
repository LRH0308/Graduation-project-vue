import { defineStore } from "pinia";
import { userApi } from "@/utils/apiRequest";

export const useUserStore = defineStore("user", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    userInfo: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo?.name || "",
    userAccount: (state) => state.userInfo?.teacherAccount || "",
  },

  actions: {
    // 清除用户状态
    clearUserState() {
      this.token = null;
      this.userInfo = null;
      localStorage.removeItem("token");
    },

    // 获取验证码（参考 student 端实现）
    async checkCode(config = {}) {
      try {
        const response = await userApi.checkCode(config);
        console.log("checkCode 响应:", response);
        return response;
      } catch (error) {
        console.error("checkCode 错误:", error);
        throw error;
      }
    },

    // 用户登录（参考 student 端实现）
    async login(loginData) {
      console.log("userStore.login 接收到的数据:", loginData);
      try {
        const response = await userApi.login(loginData);
        console.log("登录响应:", response);
        if (response.status === "success") {
          this.token = response.data.token;
          this.userInfo = response.data;
          localStorage.setItem("token", response.data.token);
        }
        return response;
      } catch (error) {
        console.error("登录错误:", error);
        throw error;
      }
    },

    // 获取登录信息
    async getLoginInfo() {
      try {
        const response = await userApi.getLoginInfo();
        if (response.status === "success") {
          this.userInfo = response.data;
          return response.data;
        }
        return null;
      } catch (error) {
        console.error("获取登录信息失败:", error);
        throw error;
      }
    },

    // 退出登录
    async logout() {
      await userApi.logout();
      this.clearUserState();
    },

    // 验证 Token
    async validateToken() {
      if (!this.token) return false;
      try {
        await this.getLoginInfo();
        return true;
      } catch (error) {
        this.clearUserState();
        return false;
      }
    },
  },
});
