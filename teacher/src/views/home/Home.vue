<template>
  <div class="home-container">
    <!-- 待办事项 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="fixed-height-card">
          <template #header>
            <div class="card-header">
              <span>待审核事项</span>
            </div>
          </template>
          <el-table :data="auditList" border style="width: 100%; min-height: 300px">
            <el-table-column prop="studentName" label="学生姓名" width="120" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="submitTime" label="提交时间" />
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button size="small" @click="handleAudit(row)">审核</el-button>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty description="暂无待审核事项" />
            </template>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="fixed-height-card">
          <template #header>
            <div class="card-header">
              <span>通知公告</span>
            </div>
          </template>
          <el-timeline class="fixed-height-content">
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
            <el-timeline-item v-if="noticeList.length === 0">
              <el-empty description="暂无通知公告" />
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快捷操作卡片 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/subject/manage')" class="quick-link-card">
          <el-icon><Document /></el-icon>
          <div>选题管理</div>
        </el-card>
      </el-col>
      
      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/student/info')" class="quick-link-card">
          <el-icon><User /></el-icon>
          <div>学生信息</div>
        </el-card>
      </el-col>
      
      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/task/book')" class="quick-link-card">
          <el-icon><Reading /></el-icon>
          <div>任务书</div>
        </el-card>
      </el-col>
      
      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/proposal/audit')" class="quick-link-card">
          <el-icon><Edit /></el-icon>
          <div>开题报告</div>
        </el-card>
      </el-col>
      
      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/translation/audit')" class="quick-link-card">
          <el-icon><Reading /></el-icon>
          <div>外文翻译</div>
        </el-card>
      </el-col>
      
      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/mid/audit')" class="quick-link-card">
          <el-icon><Collection /></el-icon>
          <div>中期检查</div>
        </el-card>
      </el-col>
      
      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/thesis/draft/audit')" class="quick-link-card">
          <el-icon><Files /></el-icon>
          <div>论文初稿</div>
        </el-card>
      </el-col>
      
      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/thesis/final/audit')" class="quick-link-card">
          <el-icon><Files /></el-icon>
          <div>论文终稿</div>
        </el-card>
      </el-col>
      
      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/defense/arrangement')" class="quick-link-card">
          <el-icon><Timer /></el-icon>
          <div>答辩安排</div>
        </el-card>
      </el-col>
      
      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/record/guide')" class="quick-link-card">
          <el-icon><Comment /></el-icon>
          <div>指导记录</div>
        </el-card>
      </el-col>
      
      <el-col :span="4">
        <el-card shadow="hover" @click="goTo('/process/timeNode')" class="quick-link-card">
          <el-icon><Timer /></el-icon>
          <div>时间节点</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document,
  Reading,
  Edit,
  Collection,
  Files,
  Timer,
  Comment,
  CircleCheck,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Calendar
} from "@element-plus/icons-vue"
import { post } from "@/utils/request"
import API from "@/utils/api"

const router = useRouter()

// 统计数据
const statData = ref({
  subjectCount: 5,
  auditPendingCount: 3,
  studentCount: 8,
  defenseCount: 2
})

// 待审核列表
const auditList = ref([])

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
  } else if (row.type === '论文初稿') {
    router.push('/thesis/draft/audit')
  } else if (row.type === '外文翻译') {
    router.push('/translation/audit')
  }
}

// 跳转方法
const goTo = (path) => {
  router.push(path)
}

// 获取未审核信息
const getAuditList = async () => {
  try {
    // 清空列表
    auditList.value = []
    console.log('开始获取未审核信息')
    
    // 模拟数据，用于测试表格显示
    const mockData = [
      {
        id: 1,
        studentName: '张三',
        type: '外文翻译',
        submitTime: '2026-04-04 03:28:26'
      },
      {
        id: 2,
        studentName: '张三',
        type: '论文初稿',
        submitTime: '2026-03-30 19:53:37'
      }
    ]
    
    // 直接使用模拟数据
    auditList.value = mockData
    console.log('使用模拟数据:', auditList.value)
    
    // 更新待审核数量
    statData.value.auditPendingCount = auditList.value.length
    console.log('待审核数量:', statData.value.auditPendingCount)
    
    // 注释掉真实接口调用，先测试表格显示
    /*
    // 1. 获取开题报告未审核信息
    const openingReportRes = await post(API.OPENING_REPORT.GET_OPENING_REPORT.url, {
      auditStatus: 0
    }, { showLoading: false })
    
    console.log('开题报告返回:', openingReportRes)
    if (openingReportRes.data) {
      // 检查返回数据是否为数组
      const dataArray = Array.isArray(openingReportRes.data) ? openingReportRes.data : [openingReportRes.data]
      dataArray.forEach(item => {
        if (item.auditStatus === 0) {
          auditList.value.push({
            id: item.id,
            studentName: item.studentName,
            type: '开题报告',
            submitTime: item.submitTime
          })
        }
      })
    }
    
    // 2. 获取外文翻译未审核信息
    const translationRes = await post(API.FOREIGN_LANGUAGE_TRANSLATION.GET_FOREIGN_LANGUAGE_TRANSLATION.url, {
      auditStatus: 0
    }, { showLoading: false })
    
    console.log('外文翻译返回:', translationRes)
    if (translationRes.data) {
      // 检查返回数据是否为数组
      const dataArray = Array.isArray(translationRes.data) ? translationRes.data : [translationRes.data]
      dataArray.forEach(item => {
        if (item.auditStatus === 0) {
          auditList.value.push({
            id: item.id,
            studentName: item.studentName,
            type: '外文翻译',
            submitTime: item.submitTime
          })
        }
      })
    }
    
    // 3. 获取中期检查未审核信息
    const midtermRes = await post(API.MIDTERM_CHECK.GET_MIDTERM_CHECK.url, {
      auditStatus: 0
    }, { showLoading: false })
    
    console.log('中期检查返回:', midtermRes)
    if (midtermRes.data) {
      // 检查返回数据是否为数组
      const dataArray = Array.isArray(midtermRes.data) ? midtermRes.data : [midtermRes.data]
      dataArray.forEach(item => {
        if (item.auditStatus === 0) {
          auditList.value.push({
            id: item.id,
            studentName: item.studentName,
            type: '中期检查',
            submitTime: item.submitTime
          })
        }
      })
    }
    
    // 4. 获取论文初稿未审核信息
    const thesisDraftRes = await post(API.THESIS_DRAFT.GET_THESIS_DRAFT.url, {
      adutisStatus: 0
    }, { showLoading: false })
    
    console.log('论文初稿返回:', thesisDraftRes)
    if (thesisDraftRes.data) {
      // 检查返回数据是否为数组
      const dataArray = Array.isArray(thesisDraftRes.data) ? thesisDraftRes.data : [thesisDraftRes.data]
      dataArray.forEach(item => {
        if (item.adutisStatus === 0) {
          auditList.value.push({
            id: item.id,
            studentName: item.studentName,
            type: '论文初稿',
            submitTime: item.submitTime
          })
        }
      })
    }
    
    console.log('最终待审核列表:', auditList.value)
    // 更新待审核数量
    statData.value.auditPendingCount = auditList.value.length
    console.log('待审核数量:', statData.value.auditPendingCount)
    */
  } catch (error) {
    console.error('获取未审核信息失败:', error)
  }
}

onMounted(() => {
  // 调用 API 获取未审核信息
  getAuditList()
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

/* 快捷操作卡片 */
.quick-link-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 20px 0;
}

.quick-link-card:hover {
  transform: translateY(-5px);
  border-color: #409eff;
}

.quick-link-card .el-icon {
  font-size: 40px;
  color: #409eff;
  margin-bottom: 10px;
}

.quick-link-card div {
  font-size: 14px;
  color: #606266;
}

/* 固定高度卡片 */
.fixed-height-card {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.fixed-height-card .el-card__body {
  flex: 1;
  overflow: auto;
  padding: 15px;
}

.fixed-height-content {
  height: 100%;
  overflow: auto;
}

/* 滚动条样式 */
.fixed-height-card .el-card__body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.fixed-height-card .el-card__body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.fixed-height-card .el-card__body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.fixed-height-card .el-card__body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>