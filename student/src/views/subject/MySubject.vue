<template>
  <div class="my-subject-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>我的课题</span>
        </div>
      </template>

      <!-- 无课题提示 -->
      <el-empty
        v-if="!mySubject.id"
        description="暂无课题，请先选题"
        :image-size="120"
      >
        <template #image>
          <el-icon :size="80" color="#909399">
            <Document />
          </el-icon>
        </template>
        <el-button type="primary" @click="goToSubjectList">去选题</el-button>
      </el-empty>

      <!-- 课题信息 -->
      <div v-else>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课题名称" :span="2">{{
            mySubject.topicName
          }}</el-descriptions-item>
          <el-descriptions-item label="指导教师">{{
            mySubject.teacherName
          }}</el-descriptions-item>
          <el-descriptions-item label="教师工号">{{
            mySubject.teacherAccount
          }}</el-descriptions-item>
          <el-descriptions-item label="学生姓名">{{
            mySubject.studentName
          }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{
            mySubject.studentAccount
          }}</el-descriptions-item>
          <el-descriptions-item label="所属系部">{{
            mySubject.deptName
          }}</el-descriptions-item>
          <el-descriptions-item label="课题状态">{{
            getStatusText(mySubject.applyStatusStudent)
          }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px">
          <h4>课题简介：</h4>
          <el-card>
            {{ mySubject.topicDesc }}
          </el-card>
        </div>

        <div style="margin-top: 20px">
          <h4>研究内容：</h4>
          <el-card>
            {{ mySubject.researchContent || "暂无研究内容" }}
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { topicApi } from "@/utils/apiRequest";
import { Document } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const userStore = useUserStore();

// 当前登录用户学号
const currentStudentAccount = computed(() => {
  return (
    userStore.userInfo?.studentAccount ||
    userStore.userInfo?.student_account ||
    ""
  );
});

// 我的课题数据
const mySubject = ref({});
const loading = ref(false);

// 获取我的课题
const getMySubject = async () => {
  loading.value = true;
  try {
    // 构建请求参数，添加当前学号
    const requestData = {
      pageNum: 1,
      pageSize: 10,
    };

    // 添加学号筛选条件
    if (currentStudentAccount.value) {
      requestData.studentAccount = currentStudentAccount.value;
    }

    console.log("=== 请求参数 ===");
    console.log(requestData);

    const response = await topicApi.getTopicSelection(requestData);

    console.log("=== 响应数据 ===");
    console.log(response);

    if (response?.status === "success" && response.code === 200) {
      const list = response.data?.list || response.data?.records || [];

      console.log("=== 课题列表 ===");
      console.log(list);

      // 筛选出当前用户已选的课题（applyStatusStudent === 1）
      const selectedSubject = list.find((item) => {
        // 兼容多种字段命名
        const studentAccount = item.studentAccount || item.student_account;
        const applyStatusStudent =
          item.applyStatusStudent ?? item.apply_status_student;

        console.log("检查课题:", {
          topicName: item.topicName,
          studentAccount,
          applyStatusStudent,
          currentStudentAccount: currentStudentAccount.value,
        });

        // 已确认的课题且是当前学生
        if (applyStatusStudent === 1) {
          return true;
        }
        return false;
      });

      console.log("=== 选中的课题 ===");
      console.log(selectedSubject);

      if (selectedSubject) {
        mySubject.value = selectedSubject;
      } else {
        mySubject.value = {};
        ElMessage.info("暂未选择课题，请先选题");
      }
    }
  } catch (error) {
    console.error("获取我的课题失败:", error);
    ElMessage.error("获取课题信息失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 状态显示
const getStatusText = (status) => {
  switch (status) {
    case 0:
      return "未申请";
    case 1:
      return "已确认";
    case 2:
      return "已驳回";
    default:
      return "未知";
  }
};

// 跳转到选题列表
const goToSubjectList = () => {
  router.push("/subject/list");
};

onMounted(() => {
  getMySubject();
});
</script>

<style scoped>
.my-subject-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  color: #333;
}

h4 {
  margin: 10px 0;
  color: #606266;
  font-size: 14px;
}
</style>
