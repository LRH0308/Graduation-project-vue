<template>
  <div class="home-container">
    <!-- 统计概览 -->
    <el-row :gutter="20" class="stat-links">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.teacherCount }}/{{ statData.studentCount }}</div>
              <div class="stat-label">导师/学生总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a;">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.topicAuditCount }}</div>
              <div class="stat-label">待审核课题</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c;">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.taskAuditCount }}</div>
              <div class="stat-label">待审核任务书</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f56c6c;">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statData.defenseCount }}</div>
              <div class="stat-label">待安排答辩</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 可视化图表 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 审核状态分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ currentNode ? currentNode.nodeName : '当前流程' }}审核状态分布</span>
            </div>
          </template>
          <div ref="auditStatusChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <!-- 流程进度 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>流程进度统计</span>
            </div>
          </template>
          <div ref="processChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快捷操作 -->
    <el-row :gutter="20" class="quick-links" style="margin-top: 20px;">
      <!-- 师生管理 -->
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/teacherStudent/student')" class="quick-link-card">
          <el-icon><User /></el-icon>
          <div>学生管理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/teacherStudent/teacher')" class="quick-link-card">
          <el-icon><User /></el-icon>
          <div>教师管理</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/teacherStudent/guidance')" class="quick-link-card">
          <el-icon><Comment /></el-icon>
          <div>指导关系</div>
        </el-card>
      </el-col>
      
      <!-- 时间节点 -->
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/process/config')" class="quick-link-card">
          <el-icon><Timer /></el-icon>
          <div>时间节点</div>
        </el-card>
      </el-col>
      
      <!-- 流程管理 -->
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/subject/audit')" class="quick-link-card">
          <el-icon><Document /></el-icon>
          <div>课题审核</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/task/audit')" class="quick-link-card">
          <el-icon><Reading /></el-icon>
          <div>任务书审核</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/openingReport/list')" class="quick-link-card">
          <el-icon><Edit /></el-icon>
          <div>开题报告</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/foreignTranslation/list')" class="quick-link-card">
          <el-icon><Reading /></el-icon>
          <div>外文翻译</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/midtermCheck/list')" class="quick-link-card">
          <el-icon><Collection /></el-icon>
          <div>中期检查</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/thesisDraft/list')" class="quick-link-card">
          <el-icon><Files /></el-icon>
          <div>论文初稿</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/thesisFinal/list')" class="quick-link-card">
          <el-icon><Files /></el-icon>
          <div>论文终稿</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/defense/arrange')" class="quick-link-card">
          <el-icon><Timer /></el-icon>
          <div>答辩安排</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" @click="goTo('/processGuidance/list')" class="quick-link-card">
          <el-icon><Comment /></el-icon>
          <div>指导记录</div>
        </el-card>
      </el-col>
    </el-row>
      
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { Document, Reading, Timer, Comment, User, Calendar, Files, Collection, Edit } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { studentApi, teacherApi, topicApi, taskBookApi, defenseApi, openingReportApi, midtermCheckApi, thesisDraftApi, thesisFinalApi, foreignTranslationApi } from '@/utils/apiRequest'
import { ElMessage } from 'element-plus'
import { post } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

// 统计数据
const statData = reactive({
  studentCount: 0,
  teacherCount: 0,
  topicAuditCount: 0,
  taskAuditCount: 0,
  defenseCount: 0
})

// 图表引用
const auditStatusChart = ref(null)
const processChart = ref(null)

// 时间节点相关
const processNodeList = ref([])
const currentNode = ref(null)
const currentNodeAuditData = ref({
  pending: 0,
  approved: 0,
  rejected: 0
})

// 流程进度数据
const processProgressData = ref({
  topic: 0,      // 选题完成率
  task: 0,       // 任务书完成率
  opening: 0,    // 开题报告完成率
  midterm: 0,    // 中期检查完成率
  draft: 0,      // 论文初稿完成率
  final: 0,      // 论文终稿完成率
  translation: 0 // 外文翻译完成率
})

// 跳转到指定页面
const goTo = (path) => {
  router.push(path)
}

// 获取学生总数
const getStudentCount = async () => {
  try {
    const response = await studentApi.getStudentInfo({ pageNum: 1, pageSize: 1 })
    if (response?.status === 'success') {
      statData.studentCount = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取学生总数失败:', error)
  }
}

// 获取教师总数
const getTeacherCount = async () => {
  try {
    const response = await teacherApi.getTeacherInfo({ pageNum: 1, pageSize: 1 })
    if (response?.status === 'success') {
      statData.teacherCount = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取教师总数失败:', error)
  }
}

// 获取待审核课题数量
const getTopicAuditCount = async () => {
  try {
    const response = await topicApi.getTopicSelection({ applyStatus: 0, pageNum: 1, pageSize: 1 })
    if (response?.status === 'success') {
      statData.topicAuditCount = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取待审核课题数量失败:', error)
  }
}

// 获取待审核任务书数量
const getTaskAuditCount = async () => {
  try {
    const response = await taskBookApi.getTaskBook({ auditStatus: 0, pageNum: 1, pageSize: 1 })
    if (response?.status === 'success') {
      statData.taskAuditCount = response.data?.total || 0
    }
  } catch (error) {
    console.error('获取待审核任务书数量失败:', error)
  }
}

// 获取待安排答辩数量
const getDefenseCount = async () => {
  try {
    const response = await defenseApi.getDefenseArrangement({ pageNum: 1, pageSize: 1 })
    if (response?.status === 'success') {
      const arrangedCount = response.data?.total || 0
      // 待安排答辩数量 = 学生总数 - 已安排答辩数量
      statData.defenseCount = Math.max(0, statData.studentCount - arrangedCount)
    }
  } catch (error) {
    console.error('获取待安排答辩数量失败:', error)
  }
}

// 获取流程进度数据
const getProcessProgressData = async () => {
  try {
    // 获取选题完成率（applyStatusStudent：1）
    const topicResponse = await topicApi.getTopicSelection({ applyStatusStudent: 1, pageNum: 1, pageSize: 100 })
    if (topicResponse?.status === 'success') {
      const selectedCount = topicResponse.data?.total || 0
      processProgressData.value.topic = statData.studentCount > 0 ? Math.round((selectedCount / statData.studentCount) * 100) : 0
    }
    
    // 获取任务书完成率（auditStatus：1）
    const taskResponse = await taskBookApi.getTaskBook({ auditStatus: 1, pageNum: 1, pageSize: 100 })
    if (taskResponse?.status === 'success') {
      const approvedCount = taskResponse.data?.total || 0
      processProgressData.value.task = statData.studentCount > 0 ? Math.round((approvedCount / statData.studentCount) * 100) : 0
    }
    
    // 获取开题报告完成率（auditStatus：1）
    const openingResponse = await openingReportApi.getOpeningReport({ auditStatus: 1, pageNum: 1, pageSize: 100 })
    if (openingResponse?.status === 'success') {
      const approvedCount = openingResponse.data?.total || 0
      processProgressData.value.opening = statData.studentCount > 0 ? Math.round((approvedCount / statData.studentCount) * 100) : 0
    }
    
    // 获取外文翻译完成率（auditStatus：1）
    const translationResponse = await foreignTranslationApi.getForeignLanguageTranslation({ auditStatus: 1, pageNum: 1, pageSize: 100 })
    if (translationResponse?.status === 'success') {
      const approvedCount = translationResponse.data?.total || 0
      processProgressData.value.translation = statData.studentCount > 0 ? Math.round((approvedCount / statData.studentCount) * 100) : 0
    }
    
    // 获取中期检查完成率（auditStatus：1）
    const midtermResponse = await midtermCheckApi.getMidtermCheck({ auditStatus: 1, pageNum: 1, pageSize: 100 })
    if (midtermResponse?.status === 'success') {
      const approvedCount = midtermResponse.data?.total || 0
      processProgressData.value.midterm = statData.studentCount > 0 ? Math.round((approvedCount / statData.studentCount) * 100) : 0
    }
    
    // 获取论文初稿完成率（auditStatus：1）
    const draftResponse = await thesisDraftApi.getThesisDraft({ adutisStatus: 1, pageNum: 1, pageSize: 100 })
    if (draftResponse?.status === 'success') {
      const approvedCount = draftResponse.data?.total || 0
      processProgressData.value.draft = statData.studentCount > 0 ? Math.round((approvedCount / statData.studentCount) * 100) : 0
    }
    
    // 获取论文终稿完成率（查出来就算是）
    const finalResponse = await thesisFinalApi.getThesisFinalList({ pageNum: 1, pageSize: 100 })
    if (finalResponse?.status === 'success') {
      const finalCount = finalResponse.data?.total || 0
      processProgressData.value.final = statData.studentCount > 0 ? Math.round((finalCount / statData.studentCount) * 100) : 0
    }
  } catch (error) {
    console.error('获取流程进度数据失败:', error)
  }
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

// 根据当前流程节点获取审核数据
const getCurrentNodeAuditData = async () => {
  if (!currentNode.value) {
    currentNodeAuditData.value = {
      pending: 0,
      approved: 0,
      rejected: 0
    }
    return
  }
  
  const nodeName = currentNode.value.nodeName
  let pendingCount = 0
  let approvedCount = 0
  let rejectedCount = 0
  
  try {
    switch (nodeName) {
      case '选题':
        // 获取选题审核数据
        const topicResponse = await topicApi.getTopicSelection({
          teacherId: '', // 从 Token 自动获取
          pageNum: 1,
          pageSize: 100
        })
        if (topicResponse?.status === 'success') {
          const topics = topicResponse.data?.records || topicResponse.data?.list || []
          topics.forEach(topic => {
            switch (topic.applyStatus) {
              case 0: pendingCount++;
                break;
              case 1: approvedCount++;
                break;
              case 2: rejectedCount++;
                break;
            }
          })
        }
        break
      case '任务书':
        // 获取任务书审核数据
        const taskResponse = await taskBookApi.getTaskBook({
          auditId: '', // 从 Token 自动获取
          pageNum: 1,
          pageSize: 100
        })
        if (taskResponse?.status === 'success') {
          const tasks = taskResponse.data?.records || taskResponse.data?.list || []
          tasks.forEach(task => {
            switch (task.auditStatus) {
              case 0: pendingCount++;
                break;
              case 1: approvedCount++;
                break;
              case 2: rejectedCount++;
                break;
            }
          })
        }
        break
      case '开题报告':
        // 获取开题报告审核数据
        const openingResponse = await openingReportApi.getOpeningReport({
          deptName: '', // 从 Token 自动获取
          pageNum: 1,
          pageSize: 100
        })
        if (openingResponse?.status === 'success') {
          const reports = openingResponse.data?.records || openingResponse.data?.list || []
          reports.forEach(report => {
            switch (report.auditStatus) {
              case 0: pendingCount++;
                break;
              case 1: approvedCount++;
                break;
              case 2: rejectedCount++;
                break;
            }
          })
        }
        break
      case '中期检查':
        // 获取中期检查审核数据
        const midtermResponse = await midtermCheckApi.getMidtermCheck({
          deptName: '', // 从 Token 自动获取
          pageNum: 1,
          pageSize: 100
        })
        if (midtermResponse?.status === 'success') {
          const checks = midtermResponse.data?.records || midtermResponse.data?.list || []
          checks.forEach(check => {
            switch (check.auditStatus) {
              case 0: pendingCount++;
                break;
              case 1: approvedCount++;
                break;
              case 2: rejectedCount++;
                break;
            }
          })
        }
        break
      case '论文初稿':
        // 获取论文初稿审核数据
        const draftResponse = await thesisDraftApi.getThesisDraft({
          deptName: '', // 从 Token 自动获取
          pageNum: 1,
          pageSize: 100
        })
        if (draftResponse?.status === 'success') {
          const drafts = draftResponse.data?.records || draftResponse.data?.list || []
          drafts.forEach(draft => {
            switch (draft.auditStatus) {
              case 0: pendingCount++;
                break;
              case 1: approvedCount++;
                break;
              case 2: rejectedCount++;
                break;
            }
          })
        }
        break
      case '论文终稿':
        // 获取论文终稿审核数据
        const finalResponse = await thesisFinalApi.getThesisFinalList({
          deptName: '', // 从 Token 自动获取
          pageNum: 1,
          pageSize: 100
        })
        if (finalResponse?.status === 'success') {
          const finals = finalResponse.data?.records || finalResponse.data?.list || []
          finals.forEach(final => {
            switch (final.auditStatus) {
              case 0: pendingCount++;
                break;
              case 1: approvedCount++;
                break;
              case 2: rejectedCount++;
                break;
            }
          })
        }
        break
      case '外文翻译':
        // 获取外文翻译审核数据
        const translationResponse = await foreignTranslationApi.getForeignLanguageTranslation({
          deptName: '', // 从 Token 自动获取
          pageNum: 1,
          pageSize: 100
        })
        if (translationResponse?.status === 'success') {
          const translations = translationResponse.data?.records || translationResponse.data?.list || []
          translations.forEach(translation => {
            switch (translation.auditStatus) {
              case 0: pendingCount++;
                break;
              case 1: approvedCount++;
                break;
              case 2: rejectedCount++;
                break;
            }
          })
        }
        break
      default:
        break
    }
    
    currentNodeAuditData.value = {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    }
  } catch (error) {
    console.error('获取当前节点审核数据失败:', error)
    currentNodeAuditData.value = {
      pending: 0,
      approved: 0,
      rejected: 0
    }
  }
}

// 初始化审核状态分布图表
const initAuditStatusChart = () => {
  const chart = echarts.init(auditStatusChart.value)
  const option = {
    title: {
      text: `${currentNode.value ? currentNode.value.nodeName : '当前流程'}审核状态分布`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '审核状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: currentNodeAuditData.value.pending, name: '待审核' },
          { value: currentNodeAuditData.value.approved, name: '已通过' },
          { value: currentNodeAuditData.value.rejected, name: '已驳回' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 初始化流程进度图表
const initProcessChart = () => {
  const chart = echarts.init(processChart.value)
  const option = {
    title: {
      text: '流程进度统计',
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
      name: '完成率 (%)'
    },
    series: [
      {
        name: '完成率',
        type: 'bar',
        data: [
          processProgressData.value.topic,
          processProgressData.value.task,
          processProgressData.value.opening,
          processProgressData.value.translation,
          processProgressData.value.midterm,
          processProgressData.value.draft,
          processProgressData.value.final
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

// 页面挂载时初始化数据和图表
onMounted(async () => {
  // 先获取学生总数
  await getStudentCount()
  // 获取流程节点列表
  await getProcessNodeList()
  console.log('当前流程节点:', currentNode.value)
  // 获取当前节点的审核数据
  await getCurrentNodeAuditData()
  console.log('当前节点审核数据:', currentNodeAuditData.value)
  // 获取流程进度数据
  await getProcessProgressData()
  console.log('流程进度数据:', processProgressData.value)
  // 然后获取其他数据
  await Promise.all([
    getTeacherCount(),
    getTopicAuditCount(),
    getTaskAuditCount(),
    getDefenseCount()
  ])
  
  // 初始化图表
  initAuditStatusChart()
  initProcessChart()
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}



.quick-links, .stat-links {
  margin-bottom: 20px;
}

.quick-link-card, .stat-card {
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

.stat-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .el-icon {
  font-size: 30px;
  color: #fff;
}

.stat-info {
  text-align: left;
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

/* 图表容器样式 */
.chart-container {
  width: 100%;
  height: 400px;
}

.card-header {
  font-weight: bold;
}
</style>