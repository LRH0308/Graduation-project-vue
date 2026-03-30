<template>
  <div class="subject-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>过程指导记录</span>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 指导记录列表 -->
      <el-table
        :data="guideRecordList"
        border
        style="width: 100%"
        v-loading="loading"
        class="center-table"
      >
        <!-- 序号列 -->
        <el-table-column
          type="index"
          label="序号"
          width="80"
          align="center"
          :index="indexMethod"
        />
        <el-table-column prop="teacherName" label="指导教师" width="120" />
        <el-table-column prop="teacherAccount" label="教师工号" width="120" />
        <el-table-column prop="guidanceTime" label="指导时间" width="180" />
        <el-table-column
          prop="guidanceContent"
          label="指导内容"
          min-width="200"
        >
          <template #default="scope">
            <el-text type="info" truncated>
              {{ scope.row.guidanceContent || "-" }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column
          prop="studentFeedback"
          label="学生反馈"
          min-width="150"
        >
          <template #default="scope">
            <el-text type="info" truncated>
              {{ scope.row.studentFeedback || "-" }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
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
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getGuideRecordList"
        @current-change="getGuideRecordList"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="指导记录详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="指导教师">
          {{ currentRecord.teacherName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="教师工号">
          {{ currentRecord.teacherAccount || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="指导时间">
          {{ currentRecord.guidanceTime || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="指导内容" :span="1">
          <div style="white-space: pre-wrap; line-height: 1.6">
            {{ currentRecord.guidanceContent || "-" }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="学生姓名">
          {{ currentRecord.studentName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="学生学号">
          {{ currentRecord.studentAccount || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="学生反馈" :span="1">
          <div style="white-space: pre-wrap; line-height: 1.6">
            {{ currentRecord.studentFeedback || "-" }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="反馈时间">
          {{ currentRecord.feedbackTime || "-" }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { guidanceApi } from "@/utils/apiRequest";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

// 搜索表单
const searchForm = reactive({
  dateRange: [],
});

// 指导记录列表数据
const guideRecordList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// 详情对话框
const detailDialogVisible = ref(false);
const currentRecord = ref({});

// 计算序号（考虑分页）
const indexMethod = (index) => {
  return (currentPage.value - 1) * pageSize.value + index + 1;
};

// 获取指导记录列表
const getGuideRecordList = async () => {
  loading.value = true;
  try {
    const requestData = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      studentId: userStore.userInfo?.id,
      teacherId: userStore.userInfo?.teacherId,
    };

    // 添加日期范围筛选
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      requestData.startTime = searchForm.dateRange[0];
      requestData.endTime = searchForm.dateRange[1];
    }

    const response = await guidanceApi.getProcessGuidanceRecord(requestData);

    if (response?.status === "success" && response.code === 200) {
      guideRecordList.value = response.data?.records || [];
      total.value = response.data?.total || 0;
    } else {
      guideRecordList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("获取指导记录失败:", error);
    ElMessage.error("获取指导记录失败");
    guideRecordList.value = [];
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  getGuideRecordList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.dateRange = [];
  currentPage.value = 1;
  getGuideRecordList();
};

// 查看详情
const handleViewDetail = (row) => {
  currentRecord.value = { ...row };
  detailDialogVisible.value = true;
};

onMounted(() => {
  getGuideRecordList();
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

/* 表格文字居中 */
.center-table :deep(.el-table__cell) {
  text-align: center;
}

/* 子文本样式（用于显示第二行信息） */
.sub-text {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .subject-list-container {
    padding: 10px;
  }

  :deep(.el-form--inline .el-form-item) {
    margin-bottom: 10px;
  }
}
</style>