# DepartmentHead 模块 API 接口文档

## 目录

1. [账号管理](#1-账号管理)
2. [选题管理](#2-选题管理)
3. [任务书](#3-任务书)
4. [开题报告](#4-开题报告)
5. [中期检查](#5-中期检查)
6. [论文初稿](#6-论文初稿)
7. [论文终稿](#7-论文终稿)
8. [答辩安排](#8-答辩安排)
9. [过程指导记录](#9-过程指导记录)

---

## 1. 账号管理

### 1.1 获取验证码

**接口路径：** `GET /users/checkCode`

**作用：** 获取算术验证码图片

**请求方式：** GET

**请求参数：** 无

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "checkCode": "data:image/png;base64,iVBOR...",
    "checkCodeKey": "abc123..."
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| checkCode | String | 验证码图片的 Base64 字符串 |
| checkCodeKey | String | 验证码在 Redis 中的 key，用于提交时验证 |

---

### 1.2 用户注册

**接口路径：** `POST /users/register`

**作用：** 系主任用户注册

**请求方式：** POST

**Content-Type:** `application/x-www-form-urlencoded`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| checkCodeKey | String | 是 | 验证码 key（从获取验证码接口获得） |
| checkCode | String | 是 | 用户输入的验证码 |
| account | String | 是 | 工号（最大 12 字符） |
| password | String | 是 | 密码（8-18 字符） |
| role | Integer | 是 | 角色 ID（3-系主任） |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "注册成功",
  "data": null
}
```

---

### 1.3 用户登录

**接口路径：** `POST /users/login`

**作用：** 系主任用户登录

**请求方式：** POST

**Content-Type:** `application/x-www-form-urlencoded`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| checkCodeKey | String | 是 | 验证码 key |
| checkCode | String | 是 | 用户输入的验证码 |
| account | String | 是 | 工号 |
| password | String | 是 | 密码 |
| role | Integer | 是 | 角色 ID（3-系主任） |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "登录成功",
  "data": {
    "id": 20,
    "teacherAccount": "D2022001",
    "name": "王主任",
    "gender": "男",
    "email": "wangzhuren@example.com",
    "phone": "13800138000",
    "title": "教授",
    "department": "计算机系",
    "role": 3,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

---

### 1.4 获取登录信息

**接口路径：** `GET /users/getLoginInfo`

**作用：** 获取当前登录系主任的信息

**请求方式：** GET

**请求头：**
```
Authorization: Bearer {token}
```

**返回参数：** 同登录接口

---

### 1.5 退出登录

**接口路径：** `GET /users/logout`

**作用：** 退出登录，清除 token

**请求方式：** GET

**请求头：**
```
Authorization: Bearer {token}
```

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "退出成功",
  "data": null
}
```

---

### 1.6 修改密码

**接口路径：** `POST /users/updatePassword`

**作用：** 修改登录密码

**请求方式：** POST

**Content-Type:** `application/x-www-form-urlencoded`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| oldPassword | String | 是 | 原密码 |
| password | String | 是 | 新密码 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "密码修改成功",
  "data": null
}
```

---

## 2. 选题管理

### 2.1 获取选题信息

**接口路径：** `POST /topicSelect/getTopicSelection`

**作用：** 查看本系所有课题信息（包括审核状态）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "teacherId": 20,
  "graduationTime": "2026"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teacherId | Integer | 否 | 系主任 ID（自动填充） |
| graduationTime | String | 否 | 毕业时间 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "projectName": "基于 Spring Boot 的毕业设计管理系统",
        "projectType": "系统设计",
        "projectSource": "教师课题",
        "projectRequirement": "熟悉 Java、Spring Boot、Vue 等技术",
        "teacherId": 10,
        "teacherName": "赵老师",
        "publishStatus": 1,
        "applyStatus": 1,
        "applyStatusStudent": 0,
        "deptAuditStatus": 1,
        "deptAuditTime": "2025-02-20 10:00:00",
        "deptAuditRemark": "审核通过"
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 课题 ID |
| projectName | String | 课题名称 |
| projectType | String | 课题类型 |
| projectSource | String | 课题来源 |
| projectRequirement | String | 课题要求 |
| teacherId | Integer | 导师 ID |
| teacherName | String | 导师姓名 |
| publishStatus | Integer | 发布状态：0-未发布，1-已发布 |
| applyStatus | Integer | 申请状态：0-待审核，1-已通过，2-不通过 |
| applyStatusStudent | Integer | 学生选中状态：0-无人选，1-已被选 |
| deptAuditStatus | Integer | 系主任审核状态：0-待审核，1-通过，2-不通过 |
| deptAuditTime | Date | 系主任审核时间 |
| deptAuditRemark | String | 系主任审核意见 |

---

### 2.2 审核选题

**接口路径：** `POST /topicSelect/approve`

**作用：** 系主任审核教师提交的课题

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "id": 1,
  "deptAuditStatus": 1,
  "deptAuditRemark": "课题难度适中，同意立项"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Integer | 是 | 课题 ID |
| deptAuditStatus | Integer | 是 | 审核状态：1-通过，2-不通过 |
| deptAuditRemark | String | 否 | 审核意见 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "审核成功",
  "data": null
}
```

---

## 3. 任务书

### 3.1 获取任务书信息

**接口路径：** `POST /taskBook/getTaskBook`

**作用：** 查看本系所有任务书信息（包括审核状态）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "auditId": 20
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| auditId | Integer | 否 | 审核人 ID（系主任 ID，自动填充） |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "projectId": 5,
        "projectName": "基于 Spring Boot 的毕业设计管理系统",
        "fileId": 1,
        "fileName": "任务书.docx",
        "content": "一、设计内容...",
        "target": "实现一个完整的毕业设计管理系统",
        "schedule": "第 1-2 周：需求分析...",
        "reference": "[1] 张三。Spring Boot 实战...",
        "teacherId": 10,
        "teacherName": "赵老师",
        "studentId": 1,
        "studentAccount": "2022001",
        "studentName": "张三",
        "submitTime": "2025-03-01 10:00:00",
        "auditStatus": 1,
        "auditTime": "2025-03-02 14:00:00",
        "auditRemark": "任务明确，进度合理",
        "departAuditStatus": 1,
        "departAuditTime": "2025-03-03 09:00:00",
        "departAuditRemark": "同意"
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 ID |
| projectId | Integer | 毕业设计 ID |
| projectName | String | 项目名称 |
| fileId | Integer | 文件 ID |
| fileName | String | 文件名 |
| content | String | 设计内容 |
| target | String | 设计目标 |
| schedule | String | 进度安排 |
| reference | String | 参考文献 |
| teacherId | Integer | 导师 ID |
| teacherName | String | 导师姓名 |
| studentId | Integer | 学生 ID |
| studentAccount | String | 学生学号 |
| studentName | String | 学生姓名 |
| submitTime | Date | 提交时间 |
| auditStatus | Integer | 导师审核状态：1-通过，2-不通过 |
| auditTime | Date | 导师审核时间 |
| auditRemark | String | 导师审核意见 |
| departAuditStatus | Integer | 系主任审核状态：0-待审核，1-通过，2-不通过 |
| departAuditTime | Date | 系主任审核时间 |
| departAuditRemark | String | 系主任审核意见 |

---

### 3.2 审核任务书

**接口路径：** `POST /taskBook/departApprove`

**作用：** 系主任审核任务书

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "id": 1,
  "departAuditStatus": 1,
  "departAuditRemark": "任务书内容完整，要求明确，同意"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Integer | 是 | 任务书 ID |
| departAuditStatus | Integer | 是 | 审核状态：1-通过，2-不通过 |
| departAuditRemark | String | 否 | 审核意见 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "审核成功",
  "data": null
}
```

---

## 4. 开题报告

### 4.1 获取开题报告信息

**接口路径：** `POST /openingReport/getOpeningReport`

**作用：** 查看本系所有开题报告提交和审核情况

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "deptName": "计算机系",
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| deptName | String | 否 | 系部名称（自动填充） |
| pageNum | Integer | 否 | 页码，默认 1 |
| pageSize | Integer | 否 | 每页数量，默认 10 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "projectId": 5,
        "fileId": 2,
        "fileName": "开题报告.docx",
        "studentId": 1,
        "studentAccount": "2022001",
        "studentName": "张三",
        "submitTime": "2025-03-15 14:30:00",
        "auditStatus": 1,
        "teacherId": 10,
        "teacherName": "赵老师",
        "auditTime": "2025-03-16 09:00:00",
        "auditRemark": "同意开题"
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1,
    "pages": 5
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 ID |
| projectId | Integer | 毕业设计 ID |
| fileId | Integer | 文件 ID |
| fileName | String | 文件名 |
| studentId | Integer | 学生 ID |
| studentAccount | String | 学生学号 |
| studentName | String | 学生姓名 |
| submitTime | Date | 提交时间 |
| auditStatus | Integer | 审核状态：1-通过，2-不通过 |
| teacherId | Integer | 导师 ID |
| teacherName | String | 导师姓名 |
| auditTime | Date | 审核时间 |
| auditRemark | String | 审核意见 |

---

## 5. 中期检查

### 5.1 获取中期检查信息

**接口路径：** `POST /midtermCheck/getMidtermCheck`

**作用：** 查看本系所有中期检查提交和评分情况

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "deptName": "计算机系",
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| deptName | String | 否 | 系部名称（自动填充） |
| pageNum | Integer | 否 | 页码，默认 1 |
| pageSize | Integer | 否 | 每页数量，默认 10 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "projectId": 5,
        "fileId": 3,
        "fileName": "中期报告.pdf",
        "studentId": 1,
        "studentAccount": "2022001",
        "studentName": "张三",
        "submitTime": "2025-04-10 16:00:00",
        "auditStatus": 1,
        "teacherId": 10,
        "teacherName": "赵老师",
        "auditTime": "2025-04-11 10:00:00",
        "auditRemark": "进度良好，继续保持",
        "score": 85.50
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1,
    "pages": 5
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 ID |
| projectId | Integer | 毕业设计 ID |
| fileId | Integer | 文件 ID |
| fileName | String | 文件名 |
| studentId | Integer | 学生 ID |
| studentAccount | String | 学生学号 |
| studentName | String | 学生姓名 |
| submitTime | Date | 提交时间 |
| auditStatus | Integer | 审核状态：1-通过，2-不通过 |
| teacherId | Integer | 导师 ID |
| teacherName | String | 导师姓名 |
| auditTime | Date | 审核时间 |
| auditRemark | String | 审核意见 |
| score | BigDecimal | 评分 |

---

## 6. 论文初稿

### 6.1 获取论文初稿信息

**接口路径：** `POST /ThesisDraft/getThesisDraft`

**作用：** 查看本系所有论文初稿提交和评阅情况

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "deptName": "计算机系",
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| deptName | String | 否 | 系部名称（自动填充） |
| pageNum | Integer | 否 | 页码，默认 1 |
| pageSize | Integer | 否 | 每页数量，默认 10 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "projectId": 5,
        "fileId": 4,
        "fileName": "论文初稿.docx",
        "studentId": 1,
        "studentAccount": "2022001",
        "studentName": "张三",
        "submitTime": "2025-05-01 10:00:00",
        "adutisStatus": 1,
        "teacherId": 10,
        "teacherName": "赵老师",
        "adutisTime": "2025-05-03 14:00:00",
        "adutisRemark": "论文结构合理，建议增加实验对比",
        "duplicateCheckStatus": 1,
        "duplicateCheckRate": 12.50,
        "formatCheckStatus": 1
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1,
    "pages": 5
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 ID |
| projectId | Integer | 毕业设计 ID |
| fileId | Integer | 文件 ID |
| fileName | String | 文件名 |
| studentId | Integer | 学生 ID |
| studentAccount | String | 学生学号 |
| studentName | String | 学生姓名 |
| submitTime | Date | 提交时间 |
| adutisStatus | Integer | 审核状态：1-通过，2-不通过 |
| teacherId | Integer | 导师 ID |
| teacherName | String | 导师姓名 |
| adutisTime | Date | 审核时间 |
| adutisRemark | String | 审核意见 |
| duplicateCheckStatus | Integer | 查重状态：1-已查重，2-未查重 |
| duplicateCheckRate | BigDecimal | 查重率 |
| formatCheckStatus | Integer | 格式检查状态：1-合格，2-不合格 |

---

## 7. 论文终稿

### 7.1 获取论文终稿信息

**接口路径：** `POST /ThesisFinal/getThesisFinalList`

**作用：** 查看本系所有论文终稿提交情况

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "deptName": "计算机系",
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| deptName | String | 否 | 系部名称（自动填充） |
| pageNum | Integer | 否 | 页码，默认 1 |
| pageSize | Integer | 否 | 每页数量，默认 10 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "projectId": 5,
        "studentId": 1,
        "tutorId": 10,
        "finalFileId": 123,
        "fileType": 1,
        "viewUrl": "/files/thesis/final_123.pdf",
        "finalTitle": "基于 Spring Boot 的毕业设计管理系统",
        "finalKeywords": "Spring Boot;毕业设计;管理系统",
        "finalAbstract": "本文设计并实现了一个...",
        "finalStatus": 1,
        "submitTime": "2025-05-20 10:00:00"
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1,
    "pages": 5
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 ID |
| projectId | Integer | 毕业设计 ID |
| studentId | Integer | 学生 ID |
| tutorId | Integer | 导师 ID |
| finalFileId | Integer | 终稿文件 ID |
| fileType | Integer | 文件类型 |
| viewUrl | String | 在线查看地址 |
| finalTitle | String | 论文最终标题 |
| finalKeywords | String | 最终关键词 |
| finalAbstract | String | 最终摘要 |
| finalStatus | Integer | 状态：1-正常，2-已归档 |
| submitTime | Date | 提交时间 |

---

## 8. 答辩安排

### 4.1 获取答辩安排信息

**接口路径：** `POST /defenseArrangement/getDefenseArrangement`

**作用：** 查看本系答辩安排情况

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "deptCode": "计算机系"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| deptCode | String | 否 | 系部代码（自动填充） |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "projectId": 5,
        "defenseTime": "2025-06-01 09:00:00",
        "defenseLocation": "教学楼 A301",
        "defenseGroup": "第一组",
        "teacherId": 10,
        "teacherName": "赵老师",
        "studentId": 1,
        "studentAccount": "2022001",
        "studentName": "张三",
        "remark": "请提前 15 分钟到场",
        "deptName": "计算机系"
      },
      {
        "id": 2,
        "projectId": 6,
        "defenseTime": "2025-06-01 09:00:00",
        "defenseLocation": "教学楼 A301",
        "defenseGroup": "第一组",
        "teacherId": 11,
        "teacherName": "钱老师",
        "studentId": 2,
        "studentAccount": "2022002",
        "studentName": "李四",
        "remark": "请准备 PPT 演示",
        "deptName": "计算机系"
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 ID |
| projectId | Integer | 毕业设计 ID |
| defenseTime | Date | 答辩时间 |
| defenseLocation | String | 答辩地点 |
| defenseGroup | String | 答辩分组 |
| teacherId | Integer | 导师 ID |
| teacherName | String | 导师姓名 |
| studentId | Integer | 学生 ID |
| studentAccount | String | 学生学号 |
| studentName | String | 学生姓名 |
| remark | String | 备注说明 |
| deptName | String | 系部名称 |

---

### 4.2 安排答辩

**接口路径：** `POST /defenseArrangement/deptArrange`

**作用：** 系主任安排本系学生的答辩时间和分组

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "projectId": 5,
  "studentId": 1,
  "defenseTime": "2025-06-01 09:00:00",
  "defenseLocation": "教学楼 A301",
  "defenseGroup": "第一组",
  "remark": "请提前 15 分钟到场"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| projectId | Integer | 是 | 毕业设计 ID |
| studentId | Integer | 是 | 学生 ID |
| defenseTime | Date | 是 | 答辩时间 |
| defenseLocation | String | 是 | 答辩地点 |
| defenseGroup | String | 是 | 答辩分组 |
| remark | String | 否 | 备注说明 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "安排成功",
  "data": null
}
```

---

## 9. 过程指导记录

### 9.1 获取过程指导记录信息

**接口路径：** `POST /processGuidanceRecord/getProcessGuidanceRecord`

**作用：** 查看本系所有指导记录和学生反馈情况

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "deptName": "计算机系",
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| deptName | String | 否 | 系部名称（自动填充） |
| pageNum | Integer | 否 | 页码，默认 1 |
| pageSize | Integer | 否 | 每页数量，默认 10 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "projectId": 5,
        "teacherId": 10,
        "teacherName": "赵老师",
        "guidanceTime": "2025-03-20 14:00:00",
        "guidanceContent": "指导学生完成系统需求分析和技术方案设计",
        "studentId": 1,
        "studentAccount": "2022001",
        "studentName": "张三",
        "feedbackTime": "2025-03-20 16:00:00",
        "studentFeedback": "已完成需求分析和技术方案设计"
      }
    ],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 ID |
| projectId | Integer | 毕业设计 ID |
| teacherId | Integer | 导师 ID |
| teacherName | String | 导师姓名 |
| guidanceTime | Date | 指导时间 |
| guidanceContent | String | 指导内容 |
| studentId | Integer | 学生 ID |
| studentAccount | String | 学生学号 |
| studentName | String | 学生姓名 |
| feedbackTime | Date | 反馈时间 |
| studentFeedback | String | 学生反馈 |

---

## 通用说明

### 响应状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 500 | 服务器内部错误 |
| 600 | 业务错误 |

### 认证方式

所有需要登录的接口都需要在请求头中携带 token：

```
Authorization: Bearer {token}
```

token 在登录成功后返回，有效期为 7 天。

### 分页参数

所有列表接口都支持分页查询，请求参数中可以包含：

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| pageNum | Integer | 1 | 页码 |
| pageSize | Integer | 10 | 每页数量 |

返回数据格式：

```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "records": [...],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
}
```

---

## 系主任核心职责说明

系主任模块主要提供以下管理功能：

### 1. **选题审核**
- 查看本系教师提交的所有课题
- 审核课题的难度、工作量是否合适
- 给出审核意见，决定是否立项

### 2. **任务书审核**
- 查看本系所有学生的任务书
- 审核任务书的内容是否明确、进度是否合理
- 给出最终审核意见

### 3. **答辩安排**
- 查看本系所有学生的答辩安排
- 统一安排答辩时间、地点和分组
- 确保答辩工作有序进行

### 4. **全局监控**
- 监控本系毕业设计整体进度
- 统计各环节完成情况
- 协调处理异常情况

---

**文档版本：** v1.0  
**最后更新：** 2026-03-25
