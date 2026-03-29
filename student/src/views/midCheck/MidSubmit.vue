<template>
  <div class="mid-submit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>中期检查</span>
        </div>
      </template>

      <div v-loading="loading">
        <!-- 已提交状态 -->
        <div v-if="midCheckInfo.id" class="mid-detail">
          <!-- 顶部：只显示设计题目 -->
          <div class="project-title-section">
            <h3 class="project-title">
              {{ midCheckInfo.projectName || midCheckInfo.topicName }}
            </h3>
          </div>

          <!-- 中间区域：审核意见 -->
          <div class="audit-remark-section" style="margin-top: 20px">
            <h4>审核意见：</h4>
            <el-card>
              <p class="audit-remark">
                {{ midCheckInfo.auditRemark || "暂无审核意见" }}
              </p>
            </el-card>
          </div>

          <!-- 底部：提交人、审核人信息 -->
          <div class="audit-section" style="margin-top: 20px">
            <h4>审核信息：</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="提交人">{{
                midCheckInfo.studentName || "未提交"
              }}</el-descriptions-item>
              <el-descriptions-item label="提交时间">{{
                midCheckInfo.submitTime || "未提交"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核人">{{
                midCheckInfo.teacherName || "未审核"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核时间">{{
                midCheckInfo.auditTime || "未审核"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核状态">
                <el-tag :type="getAuditStatusType(midCheckInfo.auditStatus)">
                  {{ getAuditStatusText(midCheckInfo.auditStatus) }}
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
              accept=".doc,.docx,.pdf,.zip,.rar"
            >
              <el-button type="primary" :loading="uploading">
                <el-icon><Upload /></el-icon>
                上传中期检查
              </el-button>
            </el-upload>

            <el-button
              type="success"
              @click="downloadFile"
              :disabled="!canDownload"
            >
              <el-icon><Download /></el-icon>
              下载中期检查
            </el-button>

            <el-button
              v-if="midCheckInfo.auditStatus === 2"
              type="warning"
              @click="handleResubmit"
            >
              重新提交
            </el-button>
          </div>
        </div>

        <!-- 无中期检查信息时 -->
        <div v-else-if="!loading" class="no-mid-section">
          <el-empty description="暂无中期检查信息">
            <div class="empty-actions">
              <el-upload
                ref="uploadRef"
                :http-request="handleFileUpload"
                :show-file-list="false"
                :before-upload="beforeUpload"
                accept=".doc,.docx,.pdf,.zip,.rar"
              >
                <el-button type="primary" :loading="uploading">
                  <el-icon><Upload /></el-icon>
                  提交中期检查
                </el-button>
              </el-upload>
              <el-button type="default" @click="goToProposal">
                查看开题报告
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
import { midtermCheckApi, fileApi } from "@/utils/apiRequest";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const midFormRef = ref(null);
const uploadRef = ref(null);
const midCheckInfo = ref({});
const loading = ref(false);
const uploading = ref(false);
const submitting = ref(false);

// 判断是否可以上传（未提交或审核驳回时）
const canUpload = computed(() => {
  return !midCheckInfo.value.fileId || midCheckInfo.value.auditStatus === 2;
});

// 判断是否可以下载（上传后才允许下载）
const canDownload = computed(() => {
  return !!midCheckInfo.value.fileId;
});

// 获取中期检查信息
const getMidCheckInfo = async () => {
  loading.value = true;
  try {
    // 调用实际接口：POST /midtermCheck/getMidtermCheck
    const response = await midtermCheckApi.getMidtermCheck({
      projectId: midCheckInfo.value.projectId || "",
    });

    if (response?.status === "success" && response.code === 200) {
      // 适配返回格式
      const records = response.data?.records || response.data?.list || [];
      const data = records[0] || response.data;

      if (data && data.id) {
        midCheckInfo.value = data;
        console.log("中期检查信息:", midCheckInfo.value);
      }
    } else {
      ElMessage.error(response?.info || "获取中期检查失败");
    }
  } catch (error) {
    console.error("获取中期检查信息失败:", error);
    ElMessage.error("获取中期检查信息失败");
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
    "application/zip",
    "application/x-rar-compressed",
  ];

  if (
    !validTypes.includes(file.type) &&
    !file.name.match(/\.(doc|docx|pdf|zip|rar)$/i)
  ) {
    ElMessage.error("只能上传 Word、PDF、ZIP 或 RAR 文件");
    return false;
  }

  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error("文件大小不能超过 50MB");
    return false;
  }

  return true;
};

// 处理文件上传并提交中期检查
const handleFileUpload = async (param) => {
  uploading.value = true;
  try {
    const file = param.file;

    // 调用实际接口：POST /file/upload
    const uploadRes = await fileApi.upload(file, {
      fileType: 3, // 3-中期成果
      projectId: midCheckInfo.value.projectId || "",
    });

    if (uploadRes?.status === "success" && uploadRes.data) {
      const fileId = uploadRes.data.id;
      
      // 直接提交中期检查
      const submitRes = await midtermCheckApi.studentApply({
        fileId: fileId,
      });

      if (submitRes?.status === "success" && submitRes.code === 200) {
        ElMessage.success("中期检查提交成功");
        await getMidCheckInfo();
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
    "确定要重新提交中期检查吗？重新提交后将覆盖之前的记录。",
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      midCheckInfo.value = {};
    })
    .catch(() => {});
};

// 下载文件
const downloadFile = async () => {
  if (!midCheckInfo.value.fileId) {
    ElMessage.warning("暂无可下载文件");
    return;
  }
  
  try {
    ElMessage.info("正在下载文件...");
    // 获取文件详情
    const detailRes = await fileApi.getFileDetail(midCheckInfo.value.fileId);
    if (detailRes?.status !== "success" || !detailRes.data) {
      ElMessage.error("获取文件信息失败");
      return;
    }
    
    const fileInfo = detailRes.data;
    
    // 下载文件
    const response = await fileApi.download(midCheckInfo.value.fileId);
    
    // 创建Blob并下载
    const blob = new Blob([response], { 
      type: fileInfo.fileType || 'application/octet-stream' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileInfo.fileName || `中期检查_${midCheckInfo.value.projectName || '未命名'}.pdf`;
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

// 跳转到开题报告
const goToProposal = () => {
  window.location.href = "/proposal/submit";
};

onMounted(() => {
  getMidCheckInfo();
});
</script>

<style scoped>
.mid-submit-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.mid-detail {
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

/* 无中期检查时的按钮布局 */
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
