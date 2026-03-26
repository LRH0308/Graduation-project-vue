<template>
  <div class="home-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409EFF;">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.subjectCount }}</div>
              <div class="stat-label">我的课题</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67C23A;">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.auditPendingCount }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #E6A23C;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.studentCount }}</div>
              <div class="stat-label">指导学生</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #F56C6C;">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.defenseCount }}</div>
              <div class="stat-label">答辩安排</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 待办事项 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待审核事项</span>
            </div>
          </template>
          <el-table :data="auditList" border style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" />
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="submitTime" label="提交时间" />
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button size="small" @click="handleAudit(row)">审核</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>通知公告</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="notice in noticeList"
              :key="notice.id"
              :timestamp="notice.time"
              placement="top"
            >
              <el-card>
                <h4>{{ notice.title }}</h4>
                <p>{{ notice.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 统计数据
const statData = ref({
  subjectCount: 5,
  auditPendingCount: 3,
  studentCount: 8,
  defenseCount: 2
})

// 待审核列表
const auditList = ref([
  { id: 1, studentName: '张三', type: '开题报告', submitTime: '2025-03-10 14:00:00' },
  { id: 2, studentName: '李四', type: '中期检查', submitTime: '2025-04-01 10:00:00' },
  { id: 3, studentName: '王五', type: '论文提交', submitTime: '2025-05-01 09:00:00' }
])

// 通知公告
const noticeList = ref([
  { id: 1, title: '关于 2026 届毕业设计工作安排的通知', content: '请各位教师按时完成各阶段审核工作', time: '2025-03-01' },
  { id: 2, title: '答辩时间安排', content: '答辩将于 6 月 1 日开始，请提前做好准备', time: '2025-05-15' }
])

// 处理审核
const handleAudit = (row) => {
  if (row.type === '开题报告') {
    router.push('/proposal/audit')
  } else if (row.type === '中期检查') {
    router.push('/mid/audit')
  } else if (row.type === '论文提交') {
    router.push('/paper/audit')
  }
}

onMounted(() => {
  // 可以调用 API 获取统计数据
})
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 30px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.card-header {
  font-weight: bold;
}
</style>