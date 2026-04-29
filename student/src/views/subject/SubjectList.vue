<template>
  <div class="subject-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课题列表</span>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="课题名称">
          <el-input
            v-model="searchForm.topicName"
            placeholder="请输入课题名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 课题列表 -->
      <el-table
        :data="subjectList"
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="topicName" label="课题名称" width="200" />
        <el-table-column prop="topicDesc" label="课题描述" width="300" />
        <el-table-column prop="teacherName" label="指导教师" width="120" />
        <el-table-column prop="teacherAccount" label="工号" width="100" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.applyStatusStudent)"
              size="small"
            >
              {{ getStatusText(scope.row.applyStatusStudent) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              link
              size="small"
              @click="handleViewDetail(scope.row)"
            >
              详情
            </el-button>
            <!-- 选题按钮：课题未被选择时显示 -->
            <el-button
              type="primary"
              size="small"
              v-if="canSelectTopic(scope.row)"
              @click="handleSelect(scope.row)"
            >
              选题
            </el-button>
            <!-- 退选按钮：课题已被当前用户选择时显示 -->
            <el-button
              type="danger"
              size="small"
              v-if="canCancelTopic(scope.row)"
              @click="handleCancel(scope.row)"
            >
              退选
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 无数据展示 -->
      <el-empty
        v-if="!loading && subjectList.length === 0"
        description="暂无课题数据"
        :image-size="120"
      >
        <template #image>
          <el-icon :size="80" color="#909399">
            <Document />
          </el-icon>
        </template>
      </el-empty>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :total-text="'共'"
        :prev-text="'上一页'"
        :next-text="'下一页'"
        @size-change="getSubjectList"
        @current-change="getSubjectList"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="课题详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="课题名称">{{
          currentSubject.topicName
        }}</el-descriptions-item>
        <el-descriptions-item label="课题描述">{{
          currentSubject.topicDesc
        }}</el-descriptions-item>
        <el-descriptions-item label="指导教师">{{
          currentSubject.teacherName
        }}</el-descriptions-item>
        <el-descriptions-item label="教师工号">{{
          currentSubject.teacherAccount
        }}</el-descriptions-item>
        <el-descriptions-item label="申请学号/学生名">
          {{ getStudentInfo(currentSubject) }}
        </el-descriptions-item>
        <el-descriptions-item label="申请状态">{{
          getStatusText(currentSubject.applyStatusStudent)
        }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Document } from "@element-plus/icons-vue";
import { topicApi } from "@/utils/apiRequest";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

// 当前登录用户 ID（兼容多种字段）
const currentUserId = computed(() => {
  return (
    userStore.userInfo?.studentAccount ||
    userStore.userInfo?.studentId ||
    userStore.userInfo?.id
  );
});

// 搜索表单
const searchForm = reactive({
  topicName: "",
  teacherName: "",
  teacherAccount: "", // 新增：教师工号搜索
  deptName: "", // 新增：系部搜索
});

// 课题列表数据
const subjectList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// 详情对话框
const detailDialogVisible = ref(false);
const currentSubject = ref({});

// 获取课题列表
const getSubjectList = async () => {
  loading.value = true;
  try {
    // 构建请求参数
    const requestData = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    };

    // 只添加非空的搜索条件
    if (searchForm.topicName && searchForm.topicName.trim()) {
      requestData.topicName = searchForm.topicName.trim();
    }
    if (searchForm.teacherName && searchForm.teacherName.trim()) {
      requestData.teacherName = searchForm.teacherName.trim();
    }
    if (searchForm.teacherAccount && searchForm.teacherAccount.trim()) {
      requestData.teacherAccount = searchForm.teacherAccount.trim();
    }
    if (searchForm.deptName && searchForm.deptName.trim()) {
      requestData.deptName = searchForm.deptName.trim();
    }

    const response = await topicApi.getTopicSelection(requestData);

    if (response?.status === "success" && response.code === 200) {
      subjectList.value = response.data?.list || response.data?.records || [];
      total.value = response.data?.total || 0;
    } else {
      subjectList.value = [];
      total.value = 0;
      ElMessage.warning("暂无课题数据");
    }
  } catch (error) {
    console.error("获取课题列表失败:", error);
    ElMessage.error("获取课题列表失败，请稍后重试");
    subjectList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  getSubjectList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.topicName = "";
  searchForm.teacherName = "";
  searchForm.teacherAccount = "";
  searchForm.deptName = "";
  currentPage.value = 1;
  getSubjectList();
};

// 查看详情
const handleViewDetail = (row) => {
  currentSubject.value = { ...row };
  detailDialogVisible.value = true;
};

// 判断是否可以选题（课题未被选择）
const canSelectTopic = (row) => {
  // studentId 和 studentAccount 都为空表示未被选择
  const studentId = row.studentId || row.student_id;
  const studentAccount = row.studentAccount || row.student_account;
  return (
    (!studentId || studentId === null) &&
    (!studentAccount || studentAccount === null)
  );
};

// 判断是否可以退选（课题已被当前用户选择）
const canCancelTopic = (row) => {
  // 兼容多种字段命名
  const studentId = row.studentId || row.student_id;
  const studentAccount = row.studentAccount || row.student_account;

  // 当前用户标识
  const userId = currentUserId.value;

  if ((!studentId && !studentAccount) || !userId) {
    return false;
  }

  // 优先用学号比较，其次用 ID 比较
  if (studentAccount && userId) {
    return String(studentAccount) === String(userId);
  }
  if (studentId && userId) {
    return String(studentId) === String(userId);
  }

  return false;
};

// 选题
const handleSelect = async (row) => {
  ElMessageBox.confirm("确定要选择该课题吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const response = await topicApi.submitTopicSelection({
          topicId: row.id,
          applyStatusStudent: 1,
        });

        if (response?.status === "success" && response.code === 200) {
          ElMessage.success("选题成功");
          getSubjectList();
        }
      } catch (error) {
        console.error("选题失败:", error);
        ElMessage.error("选题失败，请重试");
      }
    })
    .catch(() => {});
};

// 退选
const handleCancel = async (row) => {
  ElMessageBox.confirm("确定要退选该课题吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const response = await topicApi.submitTopicSelection({
          topicId: row.id,
          applyStatusStudent: 0,
        });

        if (response?.status === "success" && response.code === 200) {
          ElMessage.success("退选成功");
          getSubjectList();
        }
      } catch (error) {
        console.error("退选失败:", error);
        ElMessage.error("退选失败，请重试");
      }
    })
    .catch(() => {});
};

// 状态显示
const getStatusText = (status) => {
  const map = { 0: "未申请", 1: "已确认", 2: "已驳回" };
  return map[status] || "未知";
};

const getStatusType = (status) => {
  const map = { 0: "info", 1: "success", 2: "danger" };
  return map[status] || "info";
};

// 获取学生信息
const getStudentInfo = (row) => {
  // 兼容多种字段命名（驼峰和下划线）
  const studentId = row.studentId || row.student_id;
  const studentAccount = row.studentAccount || row.student_account;
  const studentName = row.studentName || row.student_name;

  // 未被选择
  if (
    (!studentId || studentId === null) &&
    (!studentAccount || studentAccount === null)
  ) {
    return "暂未选择";
  }

  // 优先显示学号/姓名
  if (studentAccount && studentName) {
    return `${studentAccount} / ${studentName}`;
  }

  // 只有学号
  if (studentAccount) {
    return studentAccount;
  }

  // 只有学生 ID
  if (studentId) {
    return `学生 ID: ${studentId}`;
  }

  return "暂未选择";
};

onMounted(() => {
  getSubjectList();
});
</script>

<style scoped>
.subject-list-container {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  color: #333;
}

.el-empty {
  padding: 40px 0;
}
</style>
