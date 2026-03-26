<template>
  <div class="subject-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>论文初稿</span>
          <el-button type="primary" @click="handleAdd">新增</el-button>
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

      <!-- 课题列表 -->
      <el-table
        :data="subjectList"
        border
        style="width: 100%"
        v-loading="loading"
        class="center-table"
      >
        <!-- 版本号 -->
        <el-table-column prop="version" label="版本号" width="100">
          <template #default="scope">
            {{ scope.row.version ?? "" }}
          </template>
        </el-table-column>

        <!-- 工号/导师名 -->
        <el-table-column label="工号/导师名" width="180">
          <template #default="scope">
            <div>
              {{ scope.row.teacherAccount || "-" }}/{{
                scope.row.teacherName || "-"
              }}
            </div>
          </template>
        </el-table-column>

        <!-- 学号/学生名 -->
        <el-table-column label="学号/学生名" width="180">
          <template #default="scope">
            <div>
              {{ scope.row.studentAccount || "-" }}/{{
                scope.row.studentName || "-"
              }}
            </div>
          </template>
        </el-table-column>

        <!-- 提交时间 -->
        <el-table-column prop="submitTime" label="提交时间" width="180" />

        <!-- 查重率 -->
        <el-table-column label="查重率" width="100">
          <template #default="scope">
            <span :class="getRateClass(scope.row.duplicateCheckRate)">
              {{ scope.row.duplicateCheckRate ?? "-" }}%
            </span>
          </template>
        </el-table-column>

        <!-- 操作列 - 详情 -->
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleViewDetail(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>

        <!-- 操作列 - 下载 -->
        <el-table-column label="下载" width="100" fixed="right">
          <template #default="scope">
            <el-button
              type="success"
              link
              size="small"
              :disabled="!canDownload(scope.row)"
              @click="handleDownload(scope.row)"
            >
              下载文件
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 无数据提示 -->
      <el-empty
        v-if="subjectList.length === 0 && !loading"
        description="暂无课题数据"
      />

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :prev-text="'上一页'"
        :next-text="'下一页'"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>

    <!-- 新增对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="提交论文初稿"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
      >
        <el-form-item label="选择文件" prop="file">
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
              <div class="el-upload__tip">只能上传 doc/docx/pdf 文件</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="查重率" prop="duplicateCheckRate">
          <el-input
            v-model="addForm.duplicateCheckRate"
            type="number"
            placeholder="请输入查重率（如 12.50）"
            :disabled="!addForm.file"
            clearable
          >
            <template #append>%</template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="maxAllowRate !== null" label="阈值提示">
          <el-alert
            :title="`导师要求的最大查重率为 ${maxAllowRate}%`"
            :type="
              addForm.duplicateCheckRate &&
              addForm.duplicateCheckRate <= maxAllowRate
                ? 'success'
                : 'warning'
            "
            :closable="false"
            show-icon
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitLoading"
        >
          提交
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="版本号">{{
          currentRow.version ?? "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="工号/导师名">
          {{ currentRow.teacherAccount || "-" }} /
          {{ currentRow.teacherName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="学号/学生名">
          {{ currentRow.studentAccount || "-" }} /
          {{ currentRow.studentName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{
          currentRow.submitTime || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="文件状态">
          <el-tag :type="getFileStatusType(currentRow.fileStatus)">
            {{ getFileStatusText(currentRow.fileStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="查重率">
          <span :class="getRateClass(currentRow.duplicateCheckRate)">
            {{ currentRow.duplicateCheckRate ?? "-" }}%
          </span>
          <el-tag
            v-if="
              currentRow.duplicateCheckRate !== null && maxAllowRate !== null
            "
            :type="
              currentRow.duplicateCheckRate <= maxAllowRate
                ? 'success'
                : 'danger'
            "
            size="small"
            style="margin-left: 8px"
          >
            {{
              currentRow.duplicateCheckRate <= maxAllowRate
                ? "符合要求"
                : "超出阈值"
            }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最大允许查重率">
          {{ maxAllowRate ?? "-" }}%
        </el-descriptions-item>
        <el-descriptions-item label="审核意见">
          {{ currentRow.auditRemark || "-" }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          type="success"
          :disabled="!canDownload(currentRow)"
          @click="handleDownload(currentRow)"
        >
          下载文件
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import { thesisDraftApi, fileApi } from "@/utils/apiRequest";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

// 最大允许查重率
const maxAllowRate = ref(null);

// 列表数据
const subjectList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// 新增对话框
const addDialogVisible = ref(false);
const addFormRef = ref(null);
const uploadRef = ref(null);
const submitLoading = ref(false);
const addForm = reactive({
  file: null,
  duplicateCheckRate: "",
});

const addFormRules = {
  file: [{ required: true, message: "请选择文件", trigger: "change" }],
  duplicateCheckRate: [
    { required: true, message: "请输入查重率", trigger: "blur" },
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: "查重率格式不正确（如 12.50）",
      trigger: "blur",
    },
  ],
};

// 详情对话框
const detailDialogVisible = ref(false);
const currentRow = ref({});

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

// 获取列表数据
const getSubjectList = async () => {
  loading.value = true;
  try {
    const requestData = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      studentId: userStore.userInfo?.id,
      teacherId: userStore.userInfo?.teacherId,
    };

    // 调用论文初稿接口
    const response = await thesisDraftApi.getThesisDraft(requestData);

    if (response?.status === "success" && response.code === 200) {
      const records = response.data?.records || response.data?.list || [];
      // 数据转换，适配页面显示字段
      subjectList.value = records.map((item) => ({
        ...item,
        version: item.version ?? item.id ?? "",
        fileStatus: item.adutisStatus || item.auditStatus,
        auditRemark: item.adutisRemark || item.auditRemark,
      }));
      total.value = response.data?.total || 0;
    } else {
      subjectList.value = [];
      total.value = 0;
      ElMessage.warning("暂无数据");
    }
  } catch (error) {
    console.error("获取列表失败:", error);
    ElMessage.error("获取列表失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 处理新增
const handleAdd = () => {
  addForm.file = null;
  addForm.duplicateCheckRate = "";
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
  addDialogVisible.value = true;
};

// 处理文件选择
const handleFileChange = (file) => {
  addForm.file = file.raw;
};

// 处理文件超出限制
const handleExceed = () => {
  ElMessage.warning("只能上传一个文件");
};

// 提交论文初稿
const handleSubmit = async () => {
  if (!addFormRef.value) return;

  await addFormRef.value.validate(async (valid) => {
    if (!valid) return;

    // 检查查重率是否超过阈值
    if (
      maxAllowRate.value !== null &&
      parseFloat(addForm.duplicateCheckRate) > maxAllowRate.value
    ) {
      ElMessage.error(
        `查重率 ${addForm.duplicateCheckRate}% 超过规定的阈值 ${maxAllowRate.value}%，无法提交！`,
      );
      return;
    }

    submitLoading.value = true;
    try {
      // 1. 上传文件
      const uploadResponse = await fileApi.upload(
        addForm.file,
        {},
        {
          showLoading: true,
        },
      );

      if (uploadResponse?.status !== "success" || uploadResponse.code !== 200) {
        ElMessage.error("文件上传失败");
        return;
      }

      const fileId = uploadResponse.data?.fileId || uploadResponse.data?.id;

      if (!fileId) {
        ElMessage.error("文件上传失败，未获取到文件 ID");
        return;
      }

      // 2. 提交论文初稿
      const submitResponse = await thesisDraftApi.studentApply(
        {
          fileId: fileId,
          duplicateCheckRate: parseFloat(addForm.duplicateCheckRate),
        },
        { showLoading: false },
      );

      if (submitResponse?.status === "success" && submitResponse.code === 200) {
        ElMessage.success("提交成功");
        addDialogVisible.value = false;
        getSubjectList();
      } else {
        ElMessage.error(submitResponse?.info || "提交失败");
      }
    } catch (error) {
      console.error("提交失败:", error);
      ElMessage.error("提交失败，请重试");
    } finally {
      submitLoading.value = false;
    }
  });
};

// 判断是否可以下载（有 fileId 才允许下载）
const canDownload = (row) => {
  return !!row.fileId;
};

// 查看详情
const handleViewDetail = (row) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 下载文件
const handleDownload = async (row) => {
  if (!row.fileId) {
    ElMessage.warning("暂无可下载文件");
    return;
  }

  try {
    ElMessage.info("开始下载文件...");
    const response = await fileApi.download(row.fileId, {
      showLoading: true,
    });

    // 创建下载链接
    const blob = new Blob([response]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = row.fileName || "论文初稿.docx";
    link.click();
    window.URL.revokeObjectURL(url);

    ElMessage.success("下载成功");
  } catch (error) {
    console.error("下载失败:", error);
    ElMessage.error("下载失败，请重试");
  }
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  getSubjectList();
};

// 页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val;
  getSubjectList();
};

// 获取文件状态文本
const getFileStatusText = (status) => {
  const map = { 0: "未提交", 1: "已提交", 2: "已审核" };
  return map[status] || "未知";
};

// 获取文件状态类型
const getFileStatusType = (status) => {
  const map = { 0: "info", 1: "warning", 2: "success" };
  return map[status] || "info";
};

// 获取查重率样式类
const getRateClass = (rate) => {
  if (rate === null || rate === undefined) return "";
  if (maxAllowRate.value === null) return "";
  return rate <= maxAllowRate.value ? "rate-pass" : "rate-fail";
};

onMounted(() => {
  getMaxAllowRate();
  getSubjectList();
});
</script>

<style scoped>
.subject-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 表格文字居中 */
.center-table :deep(.el-table__cell) {
  text-align: center;
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

/* 子文本样式（用于显示第二行信息） */
.sub-text {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

/* 上传区域样式 */
.upload-demo {
  width: 100%;
}
</style>
