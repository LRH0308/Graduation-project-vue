<template>
  <div class="translation-submit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>外文翻译</span>
        </div>
      </template>

      <div v-loading="loading">
        <!-- 已提交状态 -->
        <div v-if="translationInfo.id" class="translation-detail">
          <!-- 顶部：只显示设计题目 -->
          <div class="project-title-section">
            <h3 class="project-title">
              {{ translationInfo.projectName || translationInfo.topicName }}
            </h3>
          </div>

          <!-- 中间区域：审核意见 -->
          <div class="audit-remark-section" style="margin-top: 20px">
            <h4>审核意见：</h4>
            <el-card>
              <p class="audit-remark">
                {{ translationInfo.auditRemark || "暂无审核意见" }}
              </p>
            </el-card>
          </div>

          <!-- 底部：提交人、审核人信息 -->
          <div class="audit-section" style="margin-top: 20px">
            <h4>审核信息：</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="提交人">{{
                translationInfo.studentName || "未提交"
              }}</el-descriptions-item>
              <el-descriptions-item label="提交时间">{{
                translationInfo.submitTime || "未提交"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核人">{{
                translationInfo.teacherName || "未审核"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核时间">{{
                translationInfo.auditTime || "未审核"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核状态">
                <el-tag :type="getAuditStatusType(translationInfo.auditStatus)">
                  {{ getAuditStatusText(translationInfo.auditStatus) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 文件信息展示 -->
          <div class="files-section" style="margin-top: 20px">
            <h4>文件信息：</h4>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="外文原文">
                <div class="file-item">
                  <span :title="fileNames.originalFileName">{{ fileNames.originalFileName || '外文原文文件' }}</span>
                  <el-button
                    v-if="translationInfo.originalFileId"
                    type="primary"
                    link
                    size="small"
                    @click="downloadFile(translationInfo.originalFileId, fileNames.originalFileName || '外文原文')"
                  >
                    <el-icon><Download /></el-icon>
                    下载
                  </el-button>
                  <span v-else class="no-file">未上传</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="外文翻译">
                <div class="file-item">
                  <span :title="fileNames.translateFileName">{{ fileNames.translateFileName || '外文翻译文件' }}</span>
                  <el-button
                    v-if="translationInfo.translateFileId"
                    type="primary"
                    link
                    size="small"
                    @click="downloadFile(translationInfo.translateFileId, fileNames.translateFileName || '外文翻译')"
                  >
                    <el-icon><Download /></el-icon>
                    下载
                  </el-button>
                  <span v-else class="no-file">未上传</span>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 操作按钮 -->
          <div class="actions" style="margin-top: 20px">
            <el-button
              v-if="canResubmit"
              type="warning"
              @click="handleResubmit"
            >
              重新提交
            </el-button>
          </div>
        </div>

        <!-- 无外文翻译信息时 - 提交表单 -->
        <div v-else-if="!loading" class="submit-form-section">
          <el-form :model="submitForm" label-width="120px">
            <el-form-item label="外文原文" required>
              <el-upload
                ref="originalUploadRef"
                :http-request="handleOriginalFileUpload"
                :show-file-list="true"
                :before-upload="beforeUpload"
                :limit="1"
                accept=".doc,.docx,.pdf"
                class="upload-item"
              >
                <el-button type="primary">
                  <el-icon><Upload /></el-icon>
                  选择外文原文
                </el-button>
                <template #tip>
                  <div class="el-upload__tip">只能上传 Word/PDF 文件，且不超过 50MB</div>
                </template>
              </el-upload>
            </el-form-item>

            <el-form-item label="外文翻译" required>
              <el-upload
                ref="translationUploadRef"
                :http-request="handleTranslationFileUpload"
                :show-file-list="true"
                :before-upload="beforeUpload"
                :limit="1"
                accept=".doc,.docx,.pdf"
                class="upload-item"
              >
                <el-button type="primary">
                  <el-icon><Upload /></el-icon>
                  选择外文翻译
                </el-button>
                <template #tip>
                  <div class="el-upload__tip">只能上传 Word/PDF 文件，且不超过 50MB</div>
                </template>
              </el-upload>
            </el-form-item>

            <el-form-item>
              <el-button
                type="success"
                :loading="submitting"
                :disabled="!canSubmit"
                @click="handleSubmit"
              >
                <el-icon><Check /></el-icon>
                提交
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Upload, Download, Check } from "@element-plus/icons-vue";
import { foreignTranslationApi, fileApi } from "@/utils/apiRequest";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const originalUploadRef = ref(null);
const translationUploadRef = ref(null);
const translationInfo = ref({});
const loading = ref(false);
const submitting = ref(false);

// 文件名称缓存
const fileNames = reactive({
  originalFileName: '',
  translateFileName: ''
});

// 提交表单数据
const submitForm = reactive({
  originalFileId: null,
  translateFileId: null,
});

// 判断是否可以重新提交（未提交或审核驳回时）
const canResubmit = computed(() => {
  return !translationInfo.value.id || translationInfo.value.auditStatus === 2;
});

// 判断是否可以提交（两个文件都已上传）
const canSubmit = computed(() => {
  return submitForm.originalFileId && submitForm.translateFileId;
});

// 获取文件名称
const getFileName = async (fileId) => {
  if (!fileId) return '';
  try {
    const res = await fileApi.getFileDetail(fileId);
    if (res?.status === 'success' && res.data) {
      return res.data.fileName || '';
    }
  } catch (error) {
    console.error('获取文件详情失败:', error);
  }
  return '';
};

// 获取外文翻译信息
const getTranslationInfo = async () => {
  loading.value = true;
  try {
    const response = await foreignTranslationApi.getForeignLanguageTranslation({
      projectId: translationInfo.value.projectId || "",
    });

    if (response?.status === "success" && response.code === 200) {
      const records = response.data?.records || response.data?.list || [];
      const data = records[0] || response.data;

      if (data && data.id) {
        translationInfo.value = data;
        // 获取文件名称
        if (data.originalFileId) {
          fileNames.originalFileName = await getFileName(data.originalFileId);
        }
        if (data.translateFileId) {
          fileNames.translateFileName = await getFileName(data.translateFileId);
        }
      }
    } else {
      ElMessage.error(response?.info || "获取外文翻译失败");
    }
  } catch (error) {
    console.error("获取外文翻译信息失败:", error);
    ElMessage.error("获取外文翻译信息失败");
  } finally {
    loading.value = false;
  }
};

// 获取状态文本
const getAuditStatusText = (status) => {
  const map = { 0: "待审核", 1: "审核通过", 2: "审核驳回" };
  return map[status] || "未知";
};

// 获取状态类型
const getAuditStatusType = (status) => {
  const map = { 0: "warning", 1: "success", 2: "danger" };
  return map[status] || "info";
};

// 文件上传前验证
const beforeUpload = (file) => {
  const validTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
  ];

  if (
    !validTypes.includes(file.type) &&
    !file.name.match(/\.(doc|docx|pdf)$/i)
  ) {
    ElMessage.error("只能上传 Word 或 PDF 文件");
    return false;
  }

  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error("文件大小不能超过 50MB");
    return false;
  }

  return true;
};

// 处理外文原文文件上传
const handleOriginalFileUpload = async (param) => {
  try {
    const file = param.file;
    const uploadRes = await fileApi.upload(file, {
      fileType: 6, // 6-外文原文
      projectId: translationInfo.value.projectId || "",
    });

    if (uploadRes?.status === "success" && uploadRes.data) {
      submitForm.originalFileId = uploadRes.data.id;
      ElMessage.success("外文原文上传成功");
    } else {
      ElMessage.error(uploadRes?.info || "文件上传失败");
      return Promise.reject(new Error("上传失败"));
    }
  } catch (error) {
    console.error("上传失败:", error);
    ElMessage.error("上传失败，请重试");
    return Promise.reject(error);
  }
};

// 处理外文翻译文件上传
const handleTranslationFileUpload = async (param) => {
  try {
    const file = param.file;
    const uploadRes = await fileApi.upload(file, {
      fileType: 5, // 5-外文翻译
      projectId: translationInfo.value.projectId || "",
    });

    if (uploadRes?.status === "success" && uploadRes.data) {
      submitForm.translateFileId = uploadRes.data.id;
      ElMessage.success("外文翻译上传成功");
    } else {
      ElMessage.error(uploadRes?.info || "文件上传失败");
      return Promise.reject(new Error("上传失败"));
    }
  } catch (error) {
    console.error("上传失败:", error);
    ElMessage.error("上传失败，请重试");
    return Promise.reject(error);
  }
};

// 提交外文翻译
const handleSubmit = async () => {
  if (!submitForm.originalFileId || !submitForm.translateFileId) {
    ElMessage.warning("请上传外文原文和外文翻译两个文件");
    return;
  }

  submitting.value = true;
  try {
    const submitRes = await foreignTranslationApi.studentApply({
      originalFileId: submitForm.originalFileId,
      translateFileId: submitForm.translateFileId,
    });

    if (submitRes?.status === "success" && submitRes.code === 200) {
      ElMessage.success("外文翻译提交成功");
      // 重置表单
      handleReset();
      // 刷新数据
      await getTranslationInfo();
    } else {
      ElMessage.error(submitRes?.info || "提交失败");
    }
  } catch (error) {
    console.error("提交失败:", error);
    ElMessage.error("提交失败，请重试");
  } finally {
    submitting.value = false;
  }
};

// 重置表单
const handleReset = () => {
  submitForm.originalFileId = null;
  submitForm.translateFileId = null;
  if (originalUploadRef.value) {
    originalUploadRef.value.clearFiles();
  }
  if (translationUploadRef.value) {
    translationUploadRef.value.clearFiles();
  }
};

// 重新提交
const handleResubmit = () => {
  ElMessageBox.confirm(
    "确定要重新提交外文翻译吗？重新提交后将覆盖之前的记录。",
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      translationInfo.value = {};
      handleReset();
    })
    .catch(() => {});
};

// 下载文件
const downloadFile = async (fileId, fileName) => {
  if (!fileId) {
    ElMessage.warning("暂无可下载文件");
    return;
  }

  try {
    ElMessage.info("正在下载文件...");
    // 获取文件详情
    const detailRes = await fileApi.getFileDetail(fileId);
    if (detailRes?.status !== "success" || !detailRes.data) {
      ElMessage.error("获取文件信息失败");
      return;
    }

    const fileInfo = detailRes.data;

    // 下载文件
    const response = await fileApi.download(fileId);

    // 创建Blob并下载
    const blob = new Blob([response], {
      type: fileInfo.fileType || 'application/octet-stream'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || fileInfo.fileName || '未命名文件.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success("文件下载成功");
  } catch (error) {
    console.error("下载文件失败:", error);
    ElMessage.error("下载文件失败，请重试");
  }
};

onMounted(() => {
  getTranslationInfo();
});
</script>

<style scoped>
.translation-submit-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.translation-detail {
  padding: 10px 0;
}

/* 设计题目区域 */
.project-title-section {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  margin-bottom: 20px;
}

.project-title {
  color: #fff;
  font-size: 24px;
  margin: 0;
  font-weight: 600;
}

/* 审核意见区域 */
.audit-remark-section h4,
.audit-section h4,
.files-section h4 {
  margin: 10px 0;
  color: #606266;
  font-size: 16px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.audit-remark {
  line-height: 1.8;
  color: #606266;
  margin: 0;
}

/* 审核信息区域 */
.audit-section,
.files-section {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
}

/* 文件项样式 */
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-file {
  color: #909399;
  font-size: 12px;
}

/* 操作按钮区域 */
.actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #ebeef5;
  margin-top: 20px;
}

.actions .el-button {
  margin: 0;
}

/* 提交表单区域 */
.submit-form-section {
  padding: 20px;
  max-width: 600px;
}

.upload-item {
  width: 100%;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>
