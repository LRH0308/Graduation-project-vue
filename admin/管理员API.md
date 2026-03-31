# Administrator 模块 API 接口文档

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
10. [师生关系](#10-师生关系)
11. [文件管理](#11-文件管理)
12. [学生管理](#12-学生管理)
13. [导师管理](#13-导师管理)
14. [论文查重设置](#14-论文查重设置)

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

### 1.2 管理员登录

**接口路径：** `POST /users/login`

**作用：** 系统管理员登录

**请求方式：** POST

**Content-Type:** `application/x-www-form-urlencoded`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| checkCodeKey | String | 是 | 验证码 key |
| checkCode | String | 是 | 用户输入的验证码 |
| account | String | 是 | 管理员账号（最大 12 字符） |
| password | String | 是 | 密码（8-18 字符） |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "登录成功",
  "data": {
    "id": 1,
    "account": "admin001",
    "name": "系统管理员",
    "gender": "男",
    "email": "admin@example.com",
    "phone": "13800138000",
    "role": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

---

### 1.3 获取登录信息

**接口路径：** `GET /users/getLoginInfo`

**作用：** 获取当前登录管理员的信息

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
  "info": "操作成功",
  "data": {
    "id": 1,
    "account": "admin001",
    "name": "系统管理员",
    "gender": "男",
    "email": "admin@example.com",
    "phone": "13800138000",
    "role": 1
  }
}
```

---

### 1.4 退出登录

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

## 2. 选题管理

### 2.1 获取选题信息

**接口路径：** `POST /topicSelect/getTopicSelection`

**作用：** 查看全校所有课题信息（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "graduationTime": "2026"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
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
        "department": "计算机系",
        "publishStatus": 1,
        "applyStatus": 1,
        "applyStatusStudent": 1,
        "deptAuditStatus": 1,
        "studentId": 1,
        "studentAccount": "2022001",
        "studentName": "张三"
      }
    ],
    "total": 200,
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
| department | String | 所属系部 |
| publishStatus | Integer | 发布状态：0-未发布，1-已发布 |
| applyStatus | Integer | 申请状态：0-待审核，1-已通过，2-不通过 |
| applyStatusStudent | Integer | 学生选中状态：0-无人选，1-已被选 |
| deptAuditStatus | Integer | 系主任审核状态：0-待审核，1-通过，2-不通过 |
| studentId | Integer | 学生 ID |
| studentAccount | String | 学生学号 |
| studentName | String | 学生姓名 |

---

## 3. 任务书

### 3.1 获取任务书信息

**接口路径：** `POST /taskBook/getTaskBook`

**作用：** 查看全校所有任务书信息（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
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
    "total": 200,
    "size": 10,
    "current": 1
  }
}
```

---

## 4. 开题报告

### 4.1 获取开题报告信息

**接口路径：** `POST /openingReport/getOpeningReport`

**作用：** 查看全校所有开题报告提交情况（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
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
    "total": 200,
    "size": 10,
    "current": 1
  }
}
```

---

## 5. 中期检查

### 5.1 获取中期检查信息

**接口路径：** `POST /midtermCheck/getMidtermCheck`

**作用：** 查看全校所有中期检查提交情况（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
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
    "total": 200,
    "size": 10,
    "current": 1
  }
}
```

---

## 6. 论文初稿

### 6.1 获取论文初稿信息

**接口路径：** `POST /ThesisDraft/getThesisDraft`

**作用：** 查看全校所有论文初稿提交情况（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
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
        "auditStatus": 1,
        "teacherId": 10,
        "teacherName": "赵老师",
        "auditTime": "2025-05-03 14:00:00",
        "auditRemark": "论文结构合理，建议增加实验对比",
        "duplicateCheckStatus": 1,
        "duplicateCheckRate": 12.50,
        "formatCheckStatus": 1
      }
    ],
    "total": 200,
    "size": 10,
    "current": 1
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| auditStatus | Integer | 导师审核状态：1-通过，2-不通过 |
| duplicateCheckStatus | Integer | 查重状态：1-正常，2-异常 |
| duplicateCheckRate | BigDecimal | 查重率 |
| formatCheckStatus | Integer | 格式检查状态：1-通过，2-不通过 |

---

## 7. 论文终稿

### 7.1 获取论文终稿信息

**接口路径：** `POST /ThesisFinal/getThesisFinalList`

**作用：** 查看全校所有论文终稿提交情况（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
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
        "fileId": 5,
        "fileName": "论文终稿.pdf",
        "studentId": 1,
        "studentAccount": "2022001",
        "studentName": "张三",
        "submitTime": "2025-05-20 16:00:00",
        "auditStatus": 1,
        "teacherId": 10,
        "teacherName": "赵老师",
        "auditTime": "2025-05-22 10:00:00",
        "auditRemark": "同意归档",
        "score": 90.00
      }
    ],
    "total": 200,
    "size": 10,
    "current": 1
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| auditStatus | Integer | 导师审核状态：1-通过，2-不通过 |
| score | BigDecimal | 论文评分 |

---

## 8. 答辩安排

### 8.1 获取答辩安排信息

**接口路径：** `POST /defenseArrangement/getDefenseArrangement`

**作用：** 查看全校所有答辩安排情况（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
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
      }
    ],
    "total": 200,
    "size": 10,
    "current": 1
  }
}
```

---

## 9. 过程指导记录

### 9.1 获取指导记录信息

**接口路径：** `POST /processGuidanceRecord/getProcessGuidanceRecord`

**作用：** 查看全校所有指导记录（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
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
    "total": 500,
    "size": 10,
    "current": 1
  }
}
```

---

## 10. 师生关系

### 10.1 获取师生关系信息

**接口路径：** `POST /guidanceRelation/getGuidanceRelation`

**作用：** 查看全校所有师生关系信息（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
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
        "teacherId": 10,
        "teacherName": "赵老师",
        "teacherAccount": "t001",
        "studentId": 1,
        "studentName": "张三",
        "studentAccount": "2022001",
        "projectId": 5,
        "projectName": "基于 Spring Boot 的毕业设计管理系统",
        "relationType": 1,
        "buildTime": "2025-03-01 10:00:00"
      }
    ],
    "total": 200,
    "size": 10,
    "current": 1
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| relationType | Integer | 关系类型：1-指导关系，2-评阅关系 |
| buildTime | Date | 建立时间 |

---

## 11. 文件管理

### 11.1 上传文件

**接口路径：** `POST /file/upload`

**作用：** 上传文件到系统

**请求方式：** POST

**Content-Type:** `multipart/form-data`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 上传的文件 |
| fileType | Integer | 是 | 文件类型：1-任务书 2-开题报告 3-中期成果 4-论文初稿 5-论文终稿 6-答辩材料 |
| projectId | Integer | 是 | 毕业设计 ID |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "id": 1,
    "fileName": "论文初稿.docx",
    "filePath": "/files/2025/03/abc123.docx",
    "fileSize": 1024000,
    "fileType": 4,
    "projectId": 5,
    "uploadId": 1,
    "uploadAccount": "admin001",
    "uploadTime": "2025-03-20 10:00:00"
  }
}
```

---

### 11.2 查询课题文件列表

**接口路径：** `POST /file/getFileList`

**作用：** 查询指定课题的所有文件列表

**请求方式：** POST

**Content-Type:** `application/x-www-form-urlencoded`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| projectId | Integer | 是 | 毕业设计 ID |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": [
    {
      "id": 1,
      "fileName": "任务书.docx",
      "filePath": "/files/2025/03/task.docx",
      "fileSize": 512000,
      "fileType": 1,
      "projectId": 5,
      "uploadTime": "2025-03-01 10:00:00"
    }
  ]
}
```

---

### 11.3 查询文件详情

**接口路径：** `POST /file/getFileDetail`

**作用：** 查询单个文件的详细信息

**请求方式：** POST

**Content-Type:** `application/x-www-form-urlencoded`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | Integer | 是 | 文件 ID |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "id": 1,
    "fileName": "论文初稿.docx",
    "filePath": "/files/2025/03/abc123.docx",
    "fileSize": 1024000,
    "fileType": 4,
    "projectId": 5,
    "uploadId": 1,
    "uploadAccount": "admin001",
    "uploadTime": "2025-03-20 10:00:00"
  }
}
```

---

### 11.4 下载文件

**接口路径：** `GET /file/download`

**作用：** 下载指定文件

**请求方式：** GET

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | Integer | 是 | 文件 ID |

**返回：** 文件二进制流

---

### 11.5 分页查询文件信息

**接口路径：** `POST /file/getFileListByCondition`

**作用：** 根据条件分页查询文件信息

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10,
  "fileType": 4,
  "projectId": 5
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认 1 |
| pageSize | Integer | 否 | 每页数量，默认 10 |
| fileType | Integer | 否 | 文件类型 |
| projectId | Integer | 否 | 毕业设计 ID |

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
        "fileName": "论文初稿.docx",
        "filePath": "/files/2025/03/abc123.docx",
        "fileSize": 1024000,
        "fileType": 4,
        "projectId": 5,
        "uploadTime": "2025-03-20 10:00:00"
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1
  }
}
```

---

## 12. 学生管理

### 12.1 获取学生信息

**接口路径：** `POST /student/getStudentInfo`

**作用：** 查看全校所有学生信息（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10,
  "account": "2022001",
  "name": "张三"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认 1 |
| pageSize | Integer | 否 | 每页数量，默认 10 |
| account | String | 否 | 学号 |
| name | String | 否 | 姓名 |

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
        "account": "2022001",
        "name": "张三",
        "gender": "男",
        "email": "zhangsan@example.com",
        "phone": "13800138000",
        "class": "计算机 2201",
        "major": "计算机科学与技术",
        "department": "计算机系",
        "grade": "2022"
      }
    ],
    "total": 500,
    "size": 10,
    "current": 1
  }
}
```

---

## 13. 导师管理

### 13.1 获取导师信息

**接口路径：** `POST /teacher/getTeacherInfo`

**作用：** 查看全校所有导师信息（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10,
  "account": "t001",
  "name": "赵老师"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认 1 |
| pageSize | Integer | 否 | 每页数量，默认 10 |
| account | String | 否 | 账号 |
| name | String | 否 | 姓名 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": {
    "records": [
      {
        "id": 10,
        "account": "t001",
        "name": "赵老师",
        "gender": "男",
        "email": "zhao@example.com",
        "phone": "13900139000",
        "department": "计算机系",
        "title": "副教授",
        "researchDirection": "软件工程、人工智能"
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1
  }
}
```

---

## 14. 论文查重设置

### 14.1 获取查重率设置

**接口路径：** `POST /ThesisDuplicateCheck/getDuplicateCheckSetting`

**作用：** 查看全校所有导师的论文查重率设置（全局监控）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "pageNum": 1,
  "pageSize": 10,
  "teacherId": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认 1 |
| pageSize | Integer | 否 | 每页数量，默认 10 |
| teacherId | Integer | 否 | 导师 ID |

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
        "teacherId": 10,
        "teacherName": "赵老师",
        "duplicateCheckRate": 20.00,
        "remark": "查重率要求低于 20%",
        "createTime": "2025-03-01 10:00:00",
        "updateTime": "2025-03-15 14:00:00"
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1
  }
}
```

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

## 管理员核心职责说明

管理员模块主要提供以下**全局监控和统计**功能：

### 1. **全局数据查看**
- 查看全校所有毕业设计相关数据
- 跨系部、跨专业、跨班级的数据汇总
- 不参与具体业务操作（审核、安排等）

### 2. **数据统计与分析**
- 统计各系部毕业设计进展情况
- 分析各环节完成率和通过率
- 生成全校毕业设计工作报告

### 3. **系统运维**
- 用户账号管理（登录、退出）
- 系统参数配置
- 数据备份与恢复

### 4. **权限管理**
- 管理不同角色的访问权限
- 确保数据安全和系统稳定

---

## 与其他角色的区别

| 角色 | 主要职责 | 操作权限 |
|------|---------|---------|
| **管理员** | 全局监控、数据统计 | 只读权限，无业务操作 |
| **系主任** | 审核选题、审核任务书、安排答辩 | 审核权、安排权 |
| **导师** | 指导学生、审核材料、填写指导记录 | 指导权、审核权 |
| **学生** | 提交各类材料、查看反馈 | 提交权、查看权 |

---

## 管理员特有功能

### 数据优势
- ✅ **跨系部查看**：可以同时查看多个系部的数据
- ✅ **全局统计**：获取全校维度的统计数据
- ✅ **历史数据**：查看历年毕业设计数据

### 典型使用场景

#### 1. 毕业设计工作汇报
```javascript
// 获取全校选题情况
axios.post('/topicSelect/getTopicSelection', {
  graduationTime: '2026'
})

// 获取全校任务书提交情况
axios.post('/taskBook/getTaskBook', {
  pageNum: 1,
  pageSize: 100
})
```

#### 2. 进度监控
```javascript
// 查看各环节完成率
- 选题完成率 = 已选题数 / 总课题数
- 任务书提交率 = 已提交数 / 已选题数
- 开题报告提交率 = 已提交数 / 应提交数
// ... 以此类推
```

#### 3. 质量分析
```javascript
// 分析查重率分布
- 查重率 < 20%: 优秀
- 20% <= 查重率 < 30%: 良好
- 30% <= 查重率 < 40%: 合格
- 查重率 >= 40%: 需重点检查
```

---

**文档版本：** v1.0  
**最后更新：** 2026-03-31  
**适用对象：** 前端开发人员、测试人员、项目管理人员
