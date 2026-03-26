<template>
  <div class="defense-container">
    <!-- 答辩安排 -->
    <el-card class="defense-card">
      <template #header>
        <div class="card-header">
          <span>答辩安排</span>
        </div>
      </template>

      <div v-loading="arrangementLoading">
        <div v-if="defenseInfo.id" class="defense-detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="学号">
              {{ defenseInfo.studentAccount || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="学生姓名">
              {{ defenseInfo.studentName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="答辩时间">
              {{ defenseInfo.defenseTime || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="答辩地点">
              {{ defenseInfo.defensePlace || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="指导教师">
              {{ defenseInfo.teacherName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="答辩状态">
              <el-tag :type="getStatusType(defenseInfo.defenseStatus)">
                {{ getStatusText(defenseInfo.defenseStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="评委名单" :span="2">
              {{ defenseInfo.judgeNames || "未安排" }}
            </el-descriptions-item>
            <el-descriptions-item label="所属院系" :span="2">
              {{ defenseInfo.deptName || "-" }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="actions" style="margin-top: 20px; text-align: center">
            <el-button type="primary" @click="downloadMaterial">
              下载答辩材料
            </el-button>
          </div>
        </div>

        <el-empty
          v-if="!defenseInfo.id && !arrangementLoading"
          description="暂无答辩安排"
        />
      </div>
    </el-card>

    <!-- 答辩成绩 -->
    <el-card class="defense-card">
      <template #header>
        <div class="card-header">
          <span>答辩成绩</span>
        </div>
      </template>

      <div v-loading="resultLoading">
        <el-table
          v-if="defenseResultList.length > 0"
          :data="defenseResultList"
          border
          style="width: 100%"
        >
          <el-table-column prop="teacherName" label="指导教师" width="120" />
          <el-table-column prop="studentName" label="学生姓名" width="100" />
          <el-table-column prop="studentAccount" label="学号" width="120" />
          <el-table-column prop="grade" label="成绩" width="80">
            <template #default="scope">
              <span :class="getScoreClass(scope.row.grade)">
                {{ scope.row.grade ?? "-" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="成绩等级" width="100">
            <template #default="scope">
              <el-tag
                v-if="scope.row.grade !== null && scope.row.grade !== undefined"
                :type="getGradeTypeByScore(scope.row.grade)"
                size="small"
              >
                {{ getGradeTextByScore(scope.row.grade) }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                link
                size="small"
                :disabled="
                  scope.row.grade === null || scope.row.grade === undefined
                "
                @click="handleViewDetail(scope.row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty
          v-if="defenseResultList.length === 0 && !resultLoading"
          :description="
            defenseInfo.defenseStatus === 0
              ? '答辩尚未进行，成绩待公布'
              : '暂无答辩成绩'
          "
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="答辩成绩详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="课题名称">
          {{ currentRow.topicName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="指导教师">
          {{ currentRow.teacherName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="学生姓名">
          {{ currentRow.studentName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="学号">
          {{ currentRow.studentAccount || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="成绩">
          <span :class="getScoreClass(currentRow.grade)">
            {{ currentRow.grade ?? "-" }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="成绩等级">
          <el-tag
            v-if="currentRow.grade !== null && currentRow.grade !== undefined"
            :type="getGradeTypeByScore(currentRow.grade)"
            size="small"
          >
            {{ getGradeTextByScore(currentRow.grade) }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="评语" :span="1">
          {{ currentRow.comments || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="答辩问题" :span="1">
          <div style="white-space: pre-wrap">
            {{ currentRow.questions || "-" }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { defenseApi, fileApi } from "@/utils/apiRequest";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

// 答辩安排
const defenseInfo = ref({});
const arrangementLoading = ref(false);

// 答辩成绩
const defenseResultList = ref([]);
const resultLoading = ref(false);

// 详情对话框
const detailDialogVisible = ref(false);
const currentRow = ref({});

// 获取答辩信息（安排 + 成绩）
const getDefenseInfo = async () => {
  arrangementLoading.value = true;
  resultLoading.value = true;

  try {
    const requestData = {
      studentId: userStore.userInfo?.id,
      teacherId: userStore.userInfo?.teacherId,
    };

    const response = await defenseApi.getDefenseArrangement(requestData);

    if (response?.status === "success" && response.code === 200) {
      const records = response.data?.records || [];

      if (records.length > 0) {
        const data = records[0];

        // 提取答辩安排信息（根据实际接口返回字段）
        defenseInfo.value = {
          id: data.id,
          projectId: data.projectId,
          deptCode: data.deptCode,
          deptName: data.deptName,
          defenseTime: data.defenseTime,
          defensePlace: data.defensePlace,
          teacherId: data.teacherId,
          teacherAccount: data.teacherAccount,
          teacherName: data.teacherName,
          studentId: data.studentId,
          studentAccount: data.studentAccount,
          studentName: data.studentName,
          judgeIds: data.judgeIds,
          judgeNames: data.judgeNames,
          fileId: data.fileId,
          defenseStatus: data.defenseStatus,
          grade: data.grade,
        };

        // 提取答辩成绩信息
        // 如果已答辩且有成绩，构造成绩数据
        if (data.defenseStatus === 1 && data.grade !== null) {
          defenseResultList.value = [
            {
              id: data.id,
              projectId: data.projectId,
              topicName: data.topicName || "毕业设计项目",
              studentId: data.studentId,
              studentAccount: data.studentAccount,
              studentName: data.studentName,
              teacherId: data.teacherId,
              teacherName: data.teacherName,
              grade: data.grade,
              comments: data.comments,
              questions: data.questions,
            },
          ];
        } else {
          // 未答辩或无成绩，显示空列表
          defenseResultList.value = [];
        }
      }
    } else {
      ElMessage.warning(response?.info || "暂无答辩信息");
    }
  } catch (error) {
    console.error("获取答辩信息失败:", error);
    ElMessage.error("获取答辩信息失败，请稍后重试");
  } finally {
    arrangementLoading.value = false;
    resultLoading.value = false;
  }
};

// 下载答辩材料
const downloadMaterial = async () => {
  if (defenseInfo.value.fileId) {
    try {
      ElMessage.info("开始下载答辩材料...");
      const response = await fileApi.download(defenseInfo.value.fileId, {
        showLoading: true,
      });

      const blob = new Blob([response]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "答辩材料.pdf";
      link.click();
      window.URL.revokeObjectURL(url);

      ElMessage.success("下载成功");
    } catch (error) {
      console.error("下载失败:", error);
      ElMessage.error("下载失败，请重试");
    }
  } else {
    ElMessage.warning("暂无答辩材料");
  }
};

// 查看详情
const handleViewDetail = (row) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 获取状态文本
const getStatusText = (status) => {
  const map = { 0: "未答辩", 1: "已答辩", 2: "缓答辩" };
  return map[status] || "未知";
};

// 获取状态类型
const getStatusType = (status) => {
  const map = { 0: "info", 1: "success", 2: "warning" };
  return map[status] || "info";
};

// 根据分数获取成绩等级文本
const getGradeTextByScore = (score) => {
  if (score === null || score === undefined) return "-";
  if (score >= 90) return "优秀";
  if (score >= 80) return "良好";
  if (score >= 70) return "中等";
  if (score >= 60) return "及格";
  return "不及格";
};

// 根据分数获取成绩等级类型
const getGradeTypeByScore = (score) => {
  if (score === null || score === undefined) return "info";
  if (score >= 90) return "success";
  if (score >= 80) return "primary";
  if (score >= 70) return "warning";
  if (score >= 60) return "info";
  return "danger";
};

// 获取分数样式类
const getScoreClass = (score) => {
  if (score === null || score === undefined) return "";
  if (score >= 90) return "score-excellent";
  if (score >= 80) return "score-good";
  if (score >= 70) return "score-medium";
  if (score >= 60) return "score-pass";
  return "score-fail";
};

onMounted(() => {
  getDefenseInfo();
});
</script>

<style scoped>
.defense-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.defense-card {
  width: 100%;
}

.card-header {
  font-weight: bold;
  color: #333;
  font-size: 16px;
}

.defense-detail {
  padding: 10px 0;
}

/* 分数样式 */
.score-excellent {
  color: #67c23a;
  font-weight: bold;
  font-size: 16px;
}

.score-good {
  color: #409eff;
  font-weight: bold;
  font-size: 16px;
}

.score-medium {
  color: #e6a23c;
  font-weight: bold;
  font-size: 16px;
}

.score-pass {
  color: #909399;
  font-weight: bold;
  font-size: 16px;
}

.score-fail {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .defense-container {
    padding: 10px;
  }

  :deep(.el-descriptions__label) {
    width: 100px;
  }
}
</style>
