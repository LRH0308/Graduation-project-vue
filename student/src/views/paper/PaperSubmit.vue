<template>
  <div class="paper-submit-container">
    <el-card class="paper-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Document /></el-icon>
          <span class="header-title">论文终稿</span>
        </div>
      </template>

      <div v-loading="loading" class="content-container">
        <!-- 已提交状态 -->
        <div v-if="paperInfo.id" class="submitted-status">
          <el-card class="status-card" :body-style="{ padding: '20px' }">
            <div class="status-header">
              <el-tag :type="paperInfo.finalStatus === 2 ? 'warning' : 'success'" size="large" effect="dark">
                {{ paperInfo.finalStatus === 2 ? '论文已归档' : '已提交论文' }}
              </el-tag>
            </div>
            
            <div class="status-content">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="提交时间">{{ paperInfo.submitTime || "-" }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ getStatusText(paperInfo.finalStatus) }}</el-descriptions-item>
                <el-descriptions-item label="论文标题">{{ paperInfo.finalTitle || "-" }}</el-descriptions-item>
                
                <el-descriptions-item label="关键词">{{ paperInfo.finalKeywords || "-" }}</el-descriptions-item>
                <el-descriptions-item label="摘要">{{ paperInfo.finalAbstract || "-" }}</el-descriptions-item>
              </el-descriptions>
            </div>
            
            <div class="action-buttons" style="margin-top: 20px">
              <el-button type="success" @click="handleDownload" size="large">
                <el-icon><Download /></el-icon>
                下载文件
              </el-button>
            </div>
          </el-card>
        </div>

        <!-- 提交表单 -->
        <div v-else class="submit-form">
          <el-card class="form-card" :body-style="{ padding: '25px' }">
            <el-form
              ref="paperFormRef"
              :model="paperForm"
              :rules="formRules"
              label-width="120px"
            >
              <el-form-item label="论文标题" prop="finalTitle">
                <el-input
                  v-model="paperForm.finalTitle"
                  placeholder="请输入论文标题"
                  maxlength="200"
                  show-word-limit
                  size="large"
                />
              </el-form-item>

              <el-form-item label="关键词" prop="finalKeywords">
                <el-input
                  v-model="paperForm.finalKeywords"
                  placeholder="请输入关键词，用分号分隔"
                  maxlength="100"
                  show-word-limit
                  size="large"
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
                  size="large"
                />
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
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
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
                <div class="form-actions">
                  <el-button
                    type="primary"
                    @click="handleSubmit"
                    :loading="submitting"
                    size="large"
                  >
                    <el-icon><Check /></el-icon>
                    提交
                  </el-button>
                  <el-button @click="handleReset" size="large">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { UploadFilled, QuestionFilled, Document, Download, Check, Refresh } from "@element-plus/icons-vue";
import { thesisFinalApi, fileApi } from "@/utils/apiRequest";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const paperFormRef = ref(null);
const uploadRef = ref(null);

const paperInfo = ref({});
const loading = ref(false);
const submitting = ref(false);
const uploadFile = ref(null);

const paperForm = reactive({
  finalTitle: "",
  finalKeywords: "",
  finalAbstract: "",
  fileType: 5,
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
  uploadFile.value = null;
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
  if (paperFormRef.value) {
    paperFormRef.value.clearValidate();
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

onMounted(() => {
  getPaperInfo();
});
</script>

<style scoped>
.paper-submit-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.paper-card {
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-icon {
  margin-right: 10px;
  font-size: 20px;
  color: #409eff;
}

.content-container {
  padding: 20px 0;
}

/* 已提交状态样式 */
.submitted-status {
  animation: fadeIn 0.5s ease-in-out;
}

.status-card {
  border-radius: 8px;
  overflow: hidden;
}

.status-header {
  margin-bottom: 20px;
  text-align: center;
}

.status-content {
  margin-bottom: 20px;
}

/* 提交表单样式 */
.submit-form {
  animation: fadeIn 0.5s ease-in-out;
}

.form-card {
  border-radius: 8px;
  overflow: hidden;
}

.upload-demo {
  width: 100%;
  margin-top: 10px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .paper-submit-container {
    padding: 10px;
  }
  
  .paper-card {
    max-width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>