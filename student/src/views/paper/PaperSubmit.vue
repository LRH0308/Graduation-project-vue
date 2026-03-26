<template>
  <div class="paper-submit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>论文终稿</span>
        </div>
      </template>

      <!-- 查重率提示 -->
      <el-alert
        v-if="maxAllowRate !== null"
        title="查重率要求"
        type="info"
        :closable="false"
        show-icon
        class="rate-alert"
      >
        <template #default>
          当前导师要求的最大查重率为：
          <span class="rate-value">{{ maxAllowRate }}%</span>
          ，请确保论文查重率不超过该阈值
        </template>
      </el-alert>

      <div v-loading="loading">
        <!-- 已提交状态 -->
        <div v-if="paperInfo.id" class="submitted-info">
          <el-alert
            :title="paperInfo.finalStatus === 2 ? '论文已归档' : '已提交论文'"
            :type="paperInfo.finalStatus === 2 ? 'warning' : 'success'"
            :closable="false"
            show-icon
          >
            <p><strong>论文标题：</strong>{{ paperInfo.finalTitle || "-" }}</p>
            <p><strong>提交时间：</strong>{{ paperInfo.submitTime || "-" }}</p>
            <p>
              <strong>状态：</strong>{{ getStatusText(paperInfo.finalStatus) }}
            </p>
            <p v-if="paperInfo.duplicateCheckRate">
              <strong>查重率：</strong>
              <span :class="getRateClass(paperInfo.duplicateCheckRate)">
                {{ paperInfo.duplicateCheckRate }}%
              </span>
            </p>
            <p><strong>关键词：</strong>{{ paperInfo.finalKeywords || "-" }}</p>
            <p><strong>摘要：</strong>{{ paperInfo.finalAbstract || "-" }}</p>
          </el-alert>

          <div class="action-buttons" style="margin-top: 20px">
            <el-button
              v-if="paperInfo.viewUrl"
              type="primary"
              @click="handleViewPaper"
            >
              在线查看
            </el-button>
            <el-button type="success" @click="handleDownload">
              下载文件
            </el-button>
          </div>
        </div>

        <!-- 提交表单 -->
        <el-form
          v-else
          ref="paperFormRef"
          :model="paperForm"
          :rules="formRules"
          label-width="120px"
          class="paper-form"
        >
          <el-form-item label="论文标题" prop="finalTitle">
            <el-input
              v-model="paperForm.finalTitle"
              placeholder="请输入论文标题"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="关键词" prop="finalKeywords">
            <el-input
              v-model="paperForm.finalKeywords"
              placeholder="请输入关键词，用分号分隔"
              maxlength="100"
              show-word-limit
            >
              <template #append>
                <el-tooltip content="多个关键词请用分号分隔">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="摘要" prop="finalAbstract">
            <el-input
              v-model="paperForm.finalAbstract"
              type="textarea"
              :rows="6"
              placeholder="请输入论文摘要（300-500 字）"
              maxlength="2000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="查重率" prop="duplicateCheckRate">
            <el-input
              v-model="paperForm.duplicateCheckRate"
              type="number"
              placeholder="请输入查重率（如 12.50）"
              :disabled="!uploadFile"
              clearable
            >
              <template #append>%</template>
            </el-input>
            <el-alert
              v-if="maxAllowRate !== null && paperForm.duplicateCheckRate"
              :type="
                parseFloat(paperForm.duplicateCheckRate) <= maxAllowRate
                  ? 'success'
                  : 'error'
              "
              :closable="false"
              show-icon
              style="margin-top: 10px"
            >
              {{
                parseFloat(paperForm.duplicateCheckRate) <= maxAllowRate
                  ? `查重率符合要求（≤${maxAllowRate}%）`
                  : `查重率超过阈值（>${maxAllowRate}%），无法提交`
              }}
            </el-alert>
          </el-form-item>

          <el-form-item label="上传文件" prop="file">
            <el-upload
              ref="uploadRef"
              class="upload-demo"
              drag
              :auto-upload="false"
              :on-change="handleFileChange"
              :limit="1"
              :on-exceed="handleExceed"
              accept=".doc,.docx,.pdf"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持格式：doc, docx, pdf，最大 50MB
                </div>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleSubmit"
              :loading="submitting"
              :disabled="isOverRate"
            >
              提交
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { UploadFilled, QuestionFilled } from "@element-plus/icons-vue";
import { thesisFinalApi, fileApi, thesisDraftApi } from "@/utils/apiRequest";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const paperFormRef = ref(null);
const uploadRef = ref(null);

const paperInfo = ref({});
const loading = ref(false);
const submitting = ref(false);
const maxAllowRate = ref(null);
const uploadFile = ref(null);

const paperForm = reactive({
  finalTitle: "",
  finalKeywords: "",
  finalAbstract: "",
  duplicateCheckRate: "",
  fileType: 1,
  viewUrl: "",
});

const formRules = {
  finalTitle: [
    { required: true, message: "请输入论文标题", trigger: "blur" },
    { min: 5, max: 200, message: "标题长度在 5-200 个字符", trigger: "blur" },
  ],
  finalKeywords: [{ required: true, message: "请输入关键词", trigger: "blur" }],
  finalAbstract: [
    { required: true, message: "请输入摘要", trigger: "blur" },
    { min: 50, message: "摘要至少 50 个字符", trigger: "blur" },
  ],
  duplicateCheckRate: [
    { required: true, message: "请输入查重率", trigger: "blur" },
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: "查重率格式不正确（如 12.50）",
      trigger: "blur",
    },
  ],
};

// 判断是否超过查重率阈值
const isOverRate = computed(() => {
  if (!maxAllowRate.value || !paperForm.duplicateCheckRate) return false;
  return parseFloat(paperForm.duplicateCheckRate) > maxAllowRate.value;
});

// 获取最大查重率阈值
const getMaxAllowRate = async () => {
  try {
    const response = await thesisDraftApi.getDuplicateCheckThreshold({
      showLoading: false,
    });
    if (response?.status === "success" && response.code === 200) {
      maxAllowRate.value = response.data?.maxAllowRate ?? null;
    }
  } catch (error) {
    console.error("获取查重率阈值失败:", error);
  }
};

// 获取论文终稿信息
const getPaperInfo = async () => {
  loading.value = true;
  try {
    const requestData = {
      studentId: userStore.userInfo?.id,
      tutorId: userStore.userInfo?.teacherId,
      pageNum: 1,
      pageSize: 10,
    };

    const response = await thesisFinalApi.getThesisFinalList(requestData);

    if (response?.status === "success" && response.code === 200) {
      const records = response.data?.records || [];
      paperInfo.value = records[0] || {};
    }
  } catch (error) {
    console.error("获取论文信息失败:", error);
  } finally {
    loading.value = false;
  }
};

// 处理文件选择
const handleFileChange = (file) => {
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.error("文件大小不能超过 50MB");
    if (uploadRef.value) {
      uploadRef.value.clearFiles();
    }
    uploadFile.value = null;
    return;
  }
  uploadFile.value = file.raw;
};

// 处理文件超出限制
const handleExceed = () => {
  ElMessage.warning("只能上传一个文件");
};

// 提交论文终稿
const handleSubmit = async () => {
  if (!paperFormRef.value) return;

  await paperFormRef.value.validate(async (valid) => {
    if (!valid) return;

    if (!uploadFile.value) {
      ElMessage.warning("请先上传文件");
      return;
    }

    // 检查查重率是否超过阈值
    if (isOverRate.value) {
      ElMessage.error(
        `查重率 ${paperForm.duplicateCheckRate}% 超过规定的阈值 ${maxAllowRate.value}%，无法提交！`,
      );
      return;
    }

    try {
      // 确认提交
      await ElMessageBox.confirm(
        "确认提交论文终稿？提交后不可修改！",
        "提交确认",
        {
          confirmButtonText: "确认提交",
          cancelButtonText: "取消",
          type: "warning",
        },
      );

      submitting.value = true;

      // 1. 上传文件
      const uploadRes = await fileApi.upload(uploadFile.value, {
        fileType: paperForm.fileType,
      });

      if (uploadRes?.status !== "success" || uploadRes.code !== 200) {
        ElMessage.error("文件上传失败");
        return;
      }

      const fileId = uploadRes.data?.fileId || uploadRes.data?.id;

      if (!fileId) {
        ElMessage.error("文件上传失败，未获取到文件 ID");
        return;
      }

      // 2. 提交论文终稿
      const submitData = {
        finalFileId: fileId,
        fileType: paperForm.fileType,
        viewUrl: `/files/thesis/final_${fileId}.pdf`,
        finalTitle: paperForm.finalTitle,
        finalKeywords: paperForm.finalKeywords,
        finalAbstract: paperForm.finalAbstract,
        duplicateCheckRate: parseFloat(paperForm.duplicateCheckRate),
      };

      const res = await thesisFinalApi.studentApply(submitData);

      if (res?.status === "success" && res.code === 200) {
        ElMessage.success("论文终稿提交成功");
        handleReset();
        getPaperInfo();
      } else {
        ElMessage.error(res?.info || "提交失败");
      }
    } catch (error) {
      if (error !== "cancel") {
        console.error("提交失败:", error);
        ElMessage.error("提交失败，请重试");
      }
    } finally {
      submitting.value = false;
    }
  });
};

// 重置表单
const handleReset = () => {
  paperForm.finalTitle = "";
  paperForm.finalKeywords = "";
  paperForm.finalAbstract = "";
  paperForm.duplicateCheckRate = "";
  uploadFile.value = null;
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
  if (paperFormRef.value) {
    paperFormRef.value.clearValidate();
  }
};

// 在线查看论文
const handleViewPaper = () => {
  if (paperInfo.value.viewUrl) {
    window.open(paperInfo.value.viewUrl, "_blank");
  } else {
    ElMessage.warning("暂无在线查看地址");
  }
};

// 下载文件
const handleDownload = async () => {
  if (!paperInfo.value.finalFileId) {
    ElMessage.warning("暂无可下载文件");
    return;
  }

  try {
    ElMessage.info("开始下载文件...");
    const response = await fileApi.download(paperInfo.value.finalFileId, {
      showLoading: true,
    });

    const blob = new Blob([response]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${paperInfo.value.finalTitle || "论文终稿"}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);

    ElMessage.success("下载成功");
  } catch (error) {
    console.error("下载失败:", error);
    ElMessage.error("下载失败，请重试");
  }
};

// 获取状态文本
const getStatusText = (status) => {
  const map = { 1: "正常", 2: "已归档" };
  return map[status] || "未知";
};

// 获取查重率样式类
const getRateClass = (rate) => {
  if (rate === null || rate === undefined) return "";
  if (maxAllowRate.value === null) return "";
  return rate <= maxAllowRate.value ? "rate-pass" : "rate-fail";
};

onMounted(() => {
  getMaxAllowRate();
  getPaperInfo();
});
</script>

<style scoped>
.paper-submit-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  color: #333;
}

/* 查重率提示框 */
.rate-alert {
  margin-bottom: 20px;
}

.rate-value {
  font-weight: bold;
  color: #f56c6c;
  font-size: 16px;
}

.submitted-info {
  margin-bottom: 20px;
}

.submitted-info p {
  margin: 8px 0;
  line-height: 1.6;
}

.paper-form {
  margin-top: 20px;
}

.upload-demo {
  width: 100%;
}

/* 查重率样式 */
.rate-pass {
  color: #67c23a;
  font-weight: bold;
}

.rate-fail {
  color: #f56c6c;
  font-weight: bold;
}

.tips {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}
</style>
