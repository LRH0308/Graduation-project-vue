<template>
  <div class="home-container">
    <!-- 可视化图表和待审核事项 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 学生进度 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>学生进度</span>
            </div>
          </template>
          <div ref="studentProgressChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <!-- 待审核事项 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ currentNode ? currentNode.nodeName + '待审核事项' : '待审核事项' }}</span>
            </div>
          </template>
          <el-table :data="auditList" border style="width: 100%;">
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
  Comment
} from "@element-plus/icons-vue"
import { post } from "@/utils/request"
import API from "@/utils/api"
import * as echarts from 'echarts'
import { topicApi, taskBookApi, openingReportApi, midtermCheckApi, thesisDraftApi, thesisFinalApi, foreignTranslationApi, guidanceRelationApi, defenseApi } from '@/utils/apiRequest'

const router = useRouter()

// 统计数据
const statData = ref({
  subjectCount: 0,
  auditPendingCount: 0,
  studentCount: 0,
  defenseCount: 0
})

// 图表引用
const studentProgressChart = ref(null)

// 待审核列表
const auditList = ref([])

// 学生进度数据
const studentProgressData = ref({
  topic: 0,      // 选题完成人数
  task: 0,       // 任务书完成人数
  opening: 0,    // 开题报告完成人数
  translation: 0, // 外文翻译完成人数
  midterm: 0,    // 中期检查完成人数
  draft: 0,      // 论文初稿完成人数
  final: 0       // 论文终稿完成人数
})

// 时间节点相关
const processNodeList = ref([])
const currentNode = ref(null)

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

// 获取流程节点列表
const getProcessNodeList = async () => {
  try {
    const response = await post('/processNode/getList', {
      pageNum: 1,
      pageSize: 100
    })
    if (response?.status === 'success') {
      processNodeList.value = response.data?.records || []
      // 判断当前流程节点
      determineCurrentNode()
    }
  } catch (error) {
    console.error('获取流程节点列表失败:', error)
  }
}

// 判断当前流程节点
const determineCurrentNode = () => {
  const now = new Date()
  // 获取当前月份和日期（1-12月，1-31日）
  const currentMonth = now.getMonth() + 1
  const currentDay = now.getDate()
  
  // 找出当前月日所在的流程节点（排除过程指导和答辩）
  for (const node of processNodeList.value) {
    // 排除过程指导和答辩节点
    if (node.nodeName === '过程指导' || node.nodeName === '答辩') {
      continue
    }
    
    try {
      const startDate = new Date(node.startTime)
      const endDate = new Date(node.endTime)
      
      // 获取节点的开始和结束月日
      const startMonth = startDate.getMonth() + 1
      const startDay = startDate.getDate()
      const endMonth = endDate.getMonth() + 1
      const endDay = endDate.getDate()
      
      // 检查当前月日是否在节点的月日范围内
      if (isDateInRange(currentMonth, currentDay, startMonth, startDay, endMonth, endDay)) {
        currentNode.value = node
        break
      }
    } catch (error) {
      console.error('解析时间节点失败:', error)
    }
  }
  
  // 如果没有找到当前节点，使用第一个非过程指导和非答辩的节点
  if (!currentNode.value) {
    currentNode.value = processNodeList.value.find(node => node.nodeName !== '过程指导' && node.nodeName !== '答辩') || null
  }
}

// 检查日期是否在范围内（只考虑月日）
const isDateInRange = (currentMonth, currentDay, startMonth, startDay, endMonth, endDay) => {
  // 将月日转换为天数（一年中的第几天）
  const currentDayOfYear = getDayOfYear(currentMonth, currentDay)
  const startDayOfYear = getDayOfYear(startMonth, startDay)
  const endDayOfYear = getDayOfYear(endMonth, endDay)
  
  // 处理跨年份的情况（例如12月到1月）
  if (startDayOfYear <= endDayOfYear) {
    // 正常范围（不跨年份）
    return currentDayOfYear >= startDayOfYear && currentDayOfYear <= endDayOfYear
  } else {
    // 跨年份范围
    return currentDayOfYear >= startDayOfYear || currentDayOfYear <= endDayOfYear
  }
}

// 获取月日对应的一年中的第几天
const getDayOfYear = (month, day) => {
  // 每个月的天数
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let dayOfYear = 0
  
  // 累加前面月份的天数
  for (let i = 0; i < month - 1; i++) {
    dayOfYear += daysInMonth[i]
  }
  
  // 加上当前月份的天数
  dayOfYear += day
  
  return dayOfYear
}

// 获取学生进度数据
const getStudentProgressData = async () => {
  try {
    // 获取指导学生数量
    const guidanceResponse = await guidanceRelationApi.getGuidanceRelation({ pageNum: 1, pageSize: 100 })
    if (guidanceResponse?.status === 'success') {
      statData.value.studentCount = guidanceResponse.data?.total || 0
    }
    
    // 获取选题完成人数（applyStatusStudent：1）
    const topicResponse = await topicApi.getTopicSelection({ applyStatusStudent: 1, pageNum: 1, pageSize: 100 })
    if (topicResponse?.status === 'success') {
      studentProgressData.value.topic = topicResponse.data?.total || 0
    }
    
    // 获取任务书完成人数（auditStatus：1）
    const taskResponse = await taskBookApi.getTaskBook({ auditStatus: 1, pageNum: 1, pageSize: 100 })
    if (taskResponse?.status === 'success') {
      studentProgressData.value.task = taskResponse.data?.total || 0
    }
    
    // 获取开题报告完成人数（auditStatus：1）
    const openingResponse = await openingReportApi.getOpeningReport({ auditStatus: 1, pageNum: 1, pageSize: 100 })
    if (openingResponse?.status === 'success') {
      studentProgressData.value.opening = openingResponse.data?.total || 0
    }
    
    // 获取外文翻译完成人数（auditStatus：1）
    const translationResponse = await foreignTranslationApi.getForeignLanguageTranslation({ auditStatus: 1, pageNum: 1, pageSize: 100 })
    if (translationResponse?.status === 'success') {
      studentProgressData.value.translation = translationResponse.data?.total || 0
    }
    
    // 获取中期检查完成人数（auditStatus：1）
    const midtermResponse = await midtermCheckApi.getMidtermCheck({ auditStatus: 1, pageNum: 1, pageSize: 100 })
    if (midtermResponse?.status === 'success') {
      studentProgressData.value.midterm = midtermResponse.data?.total || 0
    }
    
    // 获取论文初稿完成人数（adutisStatus：1）
    const draftResponse = await thesisDraftApi.getThesisDraft({ adutisStatus: 1, pageNum: 1, pageSize: 100 })
    if (draftResponse?.status === 'success') {
      studentProgressData.value.draft = draftResponse.data?.total || 0
    }
    
    // 获取论文终稿完成人数（查出来就算是）
    const finalResponse = await thesisFinalApi.getThesisFinalList({ pageNum: 1, pageSize: 100 })
    if (finalResponse?.status === 'success') {
      studentProgressData.value.final = finalResponse.data?.total || 0
    }
    
    // 获取课题数量
    const topicListResponse = await topicApi.getTopicSelection({ pageNum: 1, pageSize: 100 })
    if (topicListResponse?.status === 'success') {
      statData.value.subjectCount = topicListResponse.data?.total || 0
    }
    
    // 获取答辩安排数量
    const defenseResponse = await defenseApi.getDefenseArrangement({ pageNum: 1, pageSize: 100 })
    if (defenseResponse?.status === 'success') {
      statData.value.defenseCount = defenseResponse.data?.total || 0
    }
  } catch (error) {
    console.error('获取学生进度数据失败:', error)
  }
}

// 初始化学生进度图表
const initStudentProgressChart = () => {
  const chart = echarts.init(studentProgressChart.value)
  const option = {
    title: {
      text: '学生进度',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['选题', '任务书', '开题报告', '外文翻译', '中期检查', '论文初稿', '论文终稿']
    },
    yAxis: {
      type: 'value',
      name: '完成人数'
    },
    series: [
      {
        name: '完成人数',
        type: 'bar',
        data: [
          studentProgressData.value.topic,
          studentProgressData.value.task,
          studentProgressData.value.opening,
          studentProgressData.value.translation,
          studentProgressData.value.midterm,
          studentProgressData.value.draft,
          studentProgressData.value.final
        ],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 获取未审核信息
const getAuditList = async () => {
  try {
    // 清空列表
    auditList.value = []
    console.log('开始获取未审核信息')
    
    if (!currentNode.value) {
      console.log('当前节点未找到')
      statData.value.auditPendingCount = 0
      return
    }
    
    const nodeName = currentNode.value.nodeName
    console.log('当前流程节点:', nodeName)
    
    let response
    switch (nodeName) {
      case '选题':
        // 获取选题待审核信息（applyStatus：2）
        response = await topicApi.getTopicSelection({ applyStatus: 2, pageNum: 1, pageSize: 100 })
        if (response?.status === 'success') {
          const topics = response.data?.records || []
          auditList.value = topics.map(topic => ({
            studentName: topic.studentName || '-',
            type: '选题',
            submitTime: topic.studentApplyTime || '-',
            id: topic.id
          }))
        }
        break
      case '任务书':
        // 获取任务书待审核信息（auditStatus：2）
        response = await taskBookApi.getTaskBook({ auditStatus: 2, pageNum: 1, pageSize: 100 })
        if (response?.status === 'success') {
          const tasks = response.data?.records || []
          auditList.value = tasks.map(task => ({
            studentName: task.studentName || '-',
            type: '任务书',
            submitTime: task.submitTime || '-',
            id: task.id
          }))
        }
        break
      case '开题报告':
        // 获取开题报告待审核信息（auditStatus：0）
        response = await openingReportApi.getOpeningReport({ auditStatus: 0, pageNum: 1, pageSize: 100 })
        if (response?.status === 'success') {
          const reports = response.data?.records || []
          auditList.value = reports.map(report => ({
            studentName: report.studentName || '-',
            type: '开题报告',
            submitTime: report.submitTime || '-',
            id: report.id
          }))
        }
        break
      case '外文翻译':
        // 获取外文翻译待审核信息（auditStatus：0）
        response = await foreignTranslationApi.getForeignLanguageTranslation({ auditStatus: 0, pageNum: 1, pageSize: 100 })
        if (response?.status === 'success') {
          const translations = response.data?.records || []
          auditList.value = translations.map(translation => ({
            studentName: translation.studentName || '-',
            type: '外文翻译',
            submitTime: translation.submitTime || '-',
            id: translation.id
          }))
        }
        break
      case '中期检查':
        // 获取中期检查待审核信息（auditStatus：0）
        response = await midtermCheckApi.getMidtermCheck({ auditStatus: 0, pageNum: 1, pageSize: 100 })
        if (response?.status === 'success') {
          const checks = response.data?.records || []
          auditList.value = checks.map(check => ({
            studentName: check.studentName || '-',
            type: '中期检查',
            submitTime: check.submitTime || '-',
            id: check.id
          }))
        }
        break
      case '论文初稿':
        // 获取论文初稿待审核信息（adutisStatus：0）
        response = await thesisDraftApi.getThesisDraft({ adutisStatus: 0, pageNum: 1, pageSize: 100 })
        if (response?.status === 'success') {
          const drafts = response.data?.records || []
          auditList.value = drafts.map(draft => ({
            studentName: draft.studentName || '-',
            type: '论文初稿',
            submitTime: draft.submitTime || '-',
            id: draft.id
          }))
        }
        break
      default:
        console.log('当前节点无需审核')
        break
    }
    
    // 更新待审核数量
    statData.value.auditPendingCount = auditList.value.length
    console.log('待审核数量:', statData.value.auditPendingCount)
  } catch (error) {
    console.error('获取未审核信息失败:', error)
  }
}

onMounted(async () => {
  // 获取流程节点列表
  await getProcessNodeList()
  console.log('当前流程节点:', currentNode.value)
  // 调用 API 获取学生进度数据
  await getStudentProgressData()
  console.log('学生进度数据:', studentProgressData.value)
  // 调用 API 获取未审核信息
  await getAuditList()
  // 初始化图表
  initStudentProgressChart()
})
</script>

<style scoped>
.home-container {
  padding: 20px;
}



.card-header {
  font-weight: bold;
}

/* 图表容器样式 */
.chart-container {
  width: 100%;
  height: 400px;
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
</style>