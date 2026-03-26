<template>
  <div class="task-book-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务书</span>
        </div>
      </template>

      <div v-loading="loading">
        <div v-if="taskBook.id" class="task-book-detail">
          <!-- 顶部：只显示设计题目 -->
          <div class="project-title-section">
            <h3 class="project-title">
              {{ taskBook.projectName || taskBook.topicName }}
            </h3>
          </div>

          <!-- 任务书内容区域：只保留内容与要求、参考文献 -->
          <div class="content-section" style="margin-top: 20px">
            <h4>任务书内容：</h4>
            <el-card>
              <div class="content-item">
                <p><strong>主要内容和要求：</strong></p>
                <el-input
                  v-if="isEditMode"
                  v-model="taskBook.content"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入主要内容和要求"
                />
                <p v-else>{{ taskBook.content || "暂无内容" }}</p>
              </div>

              <div class="content-item" style="margin-top: 20px">
                <p><strong>参考文献：</strong></p>
                <el-input
                  v-if="isEditMode"
                  v-model="taskBook.references"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入参考文献"
                />
                <p v-else>{{ taskBook.reference || "暂无内容" }}</p>
              </div>
            </el-card>
          </div>

          <!-- 底部：提交人、审核人信息和意见 -->
          <div class="audit-section" style="margin-top: 20px">
            <h4>审核信息：</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="提交人">{{
                taskBook.teacherName || "未提交"
              }}</el-descriptions-item>
              <el-descriptions-item label="提交时间">{{
                taskBook.submitTime || "未提交"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核人">{{
                taskBook.auditName || taskBook.auditorName || "未审核"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核时间">{{
                taskBook.auditTime || "未审核"
              }}</el-descriptions-item>
              <el-descriptions-item label="审核状态">
                <el-tag :type="getAuditStatusType(taskBook.auditStatus)">
                  {{ getAuditStatusText(taskBook.auditStatus) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="审核意见" :span="2">
                {{ taskBook.auditRemark || "无" }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 操作按钮：上传和下载 -->
          <div class="actions" style="margin-top: 20px">
            <el-upload
              v-if="canUpload"
              ref="uploadRef"
              :http-request="uploadFile"
              :show-file-list="false"
              :before-upload="beforeUpload"
              accept=".doc,.docx,.pdf"
            >
              <el-button type="primary" :loading="uploading">
                <el-icon><Upload /></el-icon>
                上传任务书
              </el-button>
            </el-upload>

            <el-button
              type="success"
              @click="downloadFile"
              :disabled="!canDownload"
            >
              <el-icon><Download /></el-icon>
              下载任务书
            </el-button>
          </div>
        </div>

        <el-empty v-if="!taskBook.id && !loading" description="暂无任务书信息">
          <el-button type="primary" @click="goToSubjectList">去选题</el-button>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Upload, Download } from "@element-plus/icons-vue";
import { taskBookApi, fileApi } from "@/utils/apiRequest";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const uploadRef = ref(null);
const taskBook = ref({});
const loading = ref(false);
const uploading = ref(false);
const isEditMode = ref(false);

// 判断是否可以上传（教师未提交时）
const canUpload = computed(() => {
  // 学生不能上传，只有教师可以上传
  // 这里假设当前页面是教师端，如果是学生端则隐藏上传按钮
  return !taskBook.value.fileId && taskBook.value.auditStatus === 0;
});

// 判断是否可以下载（上传后才允许下载）
const canDownload = computed(() => {
  return !!taskBook.value.fileId;
});

// 获取任务书
const getTaskBook = async () => {
  loading.value = true;
  try {
    const response = await taskBookApi.getTaskBook({});

    if (response?.status === "success") {
      // 适配新的返回格式：可能是 records 数组的第一个元素
      const records = response.data?.records || response.data?.list || [];
      taskBook.value = records[0] || response.data || {};

      console.log("任务书数据:", taskBook.value);
    } else {
      ElMessage.error(response?.info || "获取任务书失败");
    }
  } catch (error) {
    console.error("获取任务书失败:", error);
    ElMessage.error("获取任务书失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 上传前验证
const beforeUpload = (file) => {
  const validTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
  ];

  if (!validTypes.includes(file.type)) {
    ElMessage.error("只能上传 Word 或 PDF 文件");
    return false;
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    ElMessage.error("文件大小不能超过 10MB");
    return false;
  }

  return true;
};

// 上传文件
const uploadFile = async (param) => {
  uploading.value = true;
  try {
    // 1. 先上传文件
    const uploadResponse = await fileApi.upload(param.file, {
      fileType: 1, // 1-任务书
      projectId: taskBook.value.projectId || "",
    });

    if (uploadResponse?.status === "success" && uploadResponse.data) {
      const fileId = uploadResponse.data.id;

      // 2. 提交任务书
      const submitResponse = await taskBookApi.applyTaskBook({
        fileId: fileId,
        projectId: taskBook.value.projectId || "",
      });

      if (submitResponse?.status === "success") {
        ElMessage.success("任务书上传成功");
        // 刷新数据
        await getTaskBook();
      } else {
        ElMessage.error(submitResponse?.info || "提交任务书失败");
      }
    } else {
      ElMessage.error(uploadResponse?.info || "文件上传失败");
    }
  } catch (error) {
    console.error("上传失败:", error);
    ElMessage.error("上传失败，请稍后重试");
  } finally {
    uploading.value = false;
  }
};

// 下载文件
const downloadFile = () => {
  if (taskBook.value.fileId) {
    ElMessage.info("开始下载任务书...");
    // TODO: 实现文件下载逻辑，调用文件下载接口
    // 示例：window.open(`/api/file/download/${taskBook.value.fileId}`);
  } else {
    ElMessage.warning("暂无可下载文件，请先上传");
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

// 跳转到选题列表
const goToSubjectList = () => {
  window.location.href = "/subject/list";
};

onMounted(() => {
  getTaskBook();
});
</script>

<style scoped>
.task-book-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
}

.task-book-detail {
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

/* 内容区域 */
.content-section h4,
.audit-section h4 {
  margin: 10px 0;
  color: #606266;
  font-size: 16px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.content-item p {
  margin: 5px 0;
  line-height: 1.8;
  white-space: pre-wrap;
}

.content-item strong {
  color: #303133;
  font-weight: 600;
}

/* 审核信息区域 */
.audit-section {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
}

/* 操作按钮区域 */
.actions {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

.actions .el-button {
  margin: 0 10px;
}
</style>
