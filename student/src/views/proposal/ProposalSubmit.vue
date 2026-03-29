<template>
  <div class="proposal-submit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>开题报告</span>
        </div>
      </template>

      <div v-loading="loading">
        <!-- 已提交状态 -->
        <div v-if="proposalInfo.id" class="proposal-detail">
          <!-- 顶部：只显示设计题目 -->
          <div class="project-title-section">
            <h3 class="project-title">
              {{ proposalInfo.projectName || proposalInfo.topicName }}
            </h3>
          </div>

          <!-- 中间区域：审核意见 -->
          <div class="audit-remark-section" style="margin-top: 20px">
            <h4>审核意见：</h4>
            <el-card>
              <p class="audit-remark">
                {{ proposalInfo.auditRemark || "暂无审核意见" }}
              </p>
            </el-card>
          </div>

          <!-- 底部：提交人、审核人信息 -->
          <div class="audit-section" style="margin-top: 20px">
            <h4>审核信息：</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="提交人">{{
                proposalInfo.studentName || "未提交"
              }}</el-descriptions-item>
              <el-descriptions-item label="提交时间">{{
                proposalInfo.submitTime || "未提交"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核人">{{
                proposalInfo.teacherName || "未审核"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核时间">{{
                proposalInfo.auditTime || "未审核"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核状态">
                <el-tag :type="getAuditStatusType(proposalInfo.auditStatus)">
                  {{ getAuditStatusText(proposalInfo.auditStatus) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 操作按钮：上传和下载 -->
          <div class="actions" style="margin-top: 20px">
            <el-upload
              v-if="canUpload"
              ref="uploadRef"
              :http-request="handleFileUpload"
              :show-file-list="false"
              :before-upload="beforeUpload"
              accept=".doc,.docx,.pdf"
            >
              <el-button type="primary" :loading="uploading">
                <el-icon><Upload /></el-icon>
                上传开题报告
              </el-button>
            </el-upload>

            <el-button
              type="success"
              @click="downloadFile"
              :disabled="!canDownload"
            >
              <el-icon><Download /></el-icon>
              下载开题报告
            </el-button>

            <el-button
              v-if="proposalInfo.auditStatus === 2"
              type="warning"
              @click="handleResubmit"
            >
              重新提交
            </el-button>
          </div>
        </div>

        <!-- 无开题报告信息时 -->
        <div v-else-if="!loading" class="no-proposal-section">
          <el-empty description="暂无开题报告信息">
            <div class="empty-actions">
              <el-upload
                ref="uploadRef"
                :http-request="handleFileUpload"
                :show-file-list="false"
                :before-upload="beforeUpload"
                accept=".doc,.docx,.pdf"
              >
                <el-button type="primary" :loading="uploading">
                  <el-icon><Upload /></el-icon>
                  提交开题报告
                </el-button>
              </el-upload>
              <el-button type="default" @click="goToTaskBook">
                查看任务书
              </el-button>
            </div>
          </el-empty>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Upload, Download } from "@element-plus/icons-vue";
import { openingReportApi, fileApi } from "@/utils/apiRequest";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const proposalFormRef = ref(null);
const uploadRef = ref(null);
const proposalInfo = ref({});
const loading = ref(false);
const uploading = ref(false);
const submitting = ref(false);

const uploadFile = ref(null);

// 判断是否可以上传（未提交或审核驳回时）
const canUpload = computed(() => {
  return !proposalInfo.value.fileId || proposalInfo.value.auditStatus === 2;
});

// 判断是否可以下载（上传后才允许下载）
const canDownload = computed(() => {
  return !!proposalInfo.value.fileId;
});

// 获取开题报告信息
const getProposalInfo = async () => {
  loading.value = true;
  try {
    // 调用实际接口：POST /openingReport/getOpeningReport
    const response = await openingReportApi.getOpeningReport({
      projectId: proposalInfo.value.projectId || "",
    });

    if (response?.status === "success" && response.code === 200) {
      // 适配返回格式
      const records = response.data?.records || response.data?.list || [];
      const data = records[0] || response.data;

      if (data && data.id) {
        proposalInfo.value = data;
        console.log("开题报告信息:", proposalInfo.value);
      }
    } else {
      ElMessage.error(response?.info || "获取开题报告失败");
    }
  } catch (error) {
    console.error("获取开题报告信息失败:", error);
    ElMessage.error("获取开题报告信息失败");
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

// 处理文件上传并提交开题报告
const handleFileUpload = async (param) => {
  uploading.value = true;
  try {
    const file = param.file;

    // 调用实际接口：POST /file/upload
    const uploadRes = await fileApi.upload(file, {
      fileType: 2, // 2-开题报告
      projectId: proposalInfo.value.projectId || "",
    });

    if (uploadRes?.status === "success" && uploadRes.data) {
      const fileId = uploadRes.data.id;
      
      // 直接提交开题报告
      const submitRes = await openingReportApi.studentApply({
        fileId: fileId,
      });

      if (submitRes?.status === "success" && submitRes.code === 200) {
        ElMessage.success("开题报告提交成功");
        await getProposalInfo();
      } else {
        ElMessage.error(submitRes?.info || "提交失败");
        return Promise.reject(new Error("提交失败"));
      }
    } else {
      ElMessage.error(uploadRes?.info || "文件上传失败");
      return Promise.reject(new Error("上传失败"));
    }
  } catch (error) {
    console.error("提交失败:", error);
    ElMessage.error("提交失败，请重试");
    return Promise.reject(error);
  } finally {
    uploading.value = false;
  }
};

// 重新提交
const handleResubmit = () => {
  ElMessageBox.confirm(
    "确定要重新提交开题报告吗？重新提交后将覆盖之前的记录。",
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      proposalInfo.value = {};
    })
    .catch(() => {});
};

// 下载文件
const downloadFile = async () => {
  if (!proposalInfo.value.fileId) {
    ElMessage.warning("暂无可下载文件");
    return;
  }
  
  try {
    ElMessage.info("正在下载文件...");
    // 获取文件详情
    const detailRes = await fileApi.getFileDetail(proposalInfo.value.fileId);
    if (detailRes?.status !== "success" || !detailRes.data) {
      ElMessage.error("获取文件信息失败");
      return;
    }
    
    const fileInfo = detailRes.data;
    
    // 下载文件
    const response = await fileApi.download(proposalInfo.value.fileId);
    
    // 创建Blob并下载
    const blob = new Blob([response], { 
      type: fileInfo.fileType || 'application/octet-stream' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileInfo.fileName || `开题报告_${proposalInfo.value.projectName || '未命名'}.pdf`;
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

// 跳转到任务书
const goToTaskBook = () => {
  window.location.href = "/task/book";
};

onMounted(() => {
  getProposalInfo();
});
</script>

<style scoped>
.proposal-submit-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.proposal-detail {
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
.audit-remark-section h4 {
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
.audit-section h4 {
  margin: 10px 0;
  color: #606266;
  font-size: 16px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.audit-section {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
}

/* 操作按钮区域 - 按钮齐平 */
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

/* 表单样式 */
.proposal-form {
  max-width: 800px;
  margin: 0 auto;
}

.tips {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

/* 无开题报告时的按钮布局 */
.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.empty-actions .el-button {
  margin: 0;
}
</style>
