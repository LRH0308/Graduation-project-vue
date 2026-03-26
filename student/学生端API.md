# Student 模块 API 接口文档

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

**作用：** 学生用户注册

**请求方式：** POST

**Content-Type:** `application/x-www-form-urlencoded`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| checkCodeKey | String | 是 | 验证码 key（从获取验证码接口获得） |
| checkCode | String | 是 | 用户输入的验证码 |
| account | String | 是 | 学号（最大 12 字符） |
| password | String | 是 | 密码（8-18 字符） |

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

**作用：** 学生用户登录

**请求方式：** POST

**Content-Type:** `application/x-www-form-urlencoded`

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| checkCodeKey | String | 是 | 验证码 key |
| checkCode | String | 是 | 用户输入的验证码 |
| account | String | 是 | 学号 |
| password | String | 是 | 密码 |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "登录成功",
  "data": {
    "id": 1,
    "studentAccount": "2022001",
    "name": "张三",
    "gender": "男",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "grade": "2022 级",
    "major": "计算机科学与技术",
    "teacherId": 10,
    "teacherName": "赵老师",
    "topicId": 5,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

---

### 1.4 获取登录信息

**接口路径：** `GET /users/getLoginInfo`

**作用：** 获取当前登录学生的信息

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

**作用：** 获取可选择的课题列表

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "teacherId": 10,
  "graduationTime": "2026"
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teacherId | Integer | 否 | 导师 ID（自动填充） |
| graduationTime | String | 否 | 毕业时间（自动填充） |

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
        "applyStatusStudent": 0
      }
    ],
    "total": 10,
    "size": 10,
    "current": 1
  }
}
```

---

### 2.2 提交/退选课题

**接口路径：** `POST /topicSelect/submitTopicSelection`

**作用：** 学生选择或退选课题

**请求方式：** POST

**Content-Type:** `application/x-www-form-urlencoded`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| applyStatusStudent | Integer | 是 | 0-退选，1-提交 |
| topicId | Integer | 是 | 课题 ID |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "操作成功",
  "data": null
}
```

---

## 3. 任务书

### 3.1 获取任务书信息

**接口路径：** `POST /taskBook/getTaskBook`

**作用：** 查看导师发布的任务书

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "studentId": 1,
  "teacherId": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| studentId | Integer | 否 | 学生 ID（自动填充） |
| teacherId | Integer | 否 | 导师 ID（自动填充） |

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
        "submitTime": "2025-03-01 10:00:00",
        "auditStatus": 1,
        "auditRemark": "审核通过"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1
  }
}
```

---

## 4. 开题报告

### 4.1 获取开题报告信息

**接口路径：** `POST /openingReport/getOpeningReport`

**作用：** 获取开题报告提交状态和审核结果

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "studentId": 1,
  "teacherId": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| studentId | Integer | 否 | 学生 ID（自动填充） |
| teacherId | Integer | 否 | 导师 ID（自动填充） |

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
    "total": 1,
    "size": 10,
    "current": 1
  }
}
```

---

### 4.2 提交开题报告

**接口路径：** `POST /openingReport/studentApply`

**作用：** 学生提交开题报告

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "fileId": 2
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | Integer | 是 | 上传的文件 ID（需先调用文件上传接口） |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "提交成功",
  "data": null
}
```

---

## 5. 中期检查

### 5.1 获取中期检查信息

**接口路径：** `POST /midtermCheck/getMidtermCheck`

**作用：** 获取中期检查提交状态和评分

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "studentId": 1,
  "teacherId": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| studentId | Integer | 否 | 学生 ID（自动填充） |
| teacherId | Integer | 否 | 导师 ID（自动填充） |

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
    "total": 1,
    "size": 10,
    "current": 1
  }
}
```

---

### 5.2 提交中期检查

**接口路径：** `POST /midtermCheck/studentApply`

**作用：** 学生提交中期检查材料

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "fileId": 3
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | Integer | 是 | 上传的文件 ID |

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "提交成功",
  "data": null
}
```

---

## 6. 论文初稿

### 6.1 获取论文初稿信息

**接口路径：** `POST /ThesisDraft/getThesisDraft`

**作用：** 获取论文初稿提交状态和导师评阅信息

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "studentId": 1,
  "teacherId": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| studentId | Integer | 否 | 学生 ID（自动填充） |
| teacherId | Integer | 否 | 导师 ID（自动填充） |

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
    "total": 1,
    "size": 10,
    "current": 1
  }
}
```

---

### 6.2 提交论文初稿

**接口路径：** `POST /ThesisDraft/studentApply`

**作用：** 学生提交论文初稿（带查重率校验）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "fileId": 4,
  "duplicateCheckRate": 12.50
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileId | Integer | 是 | 上传的文件 ID |
| duplicateCheckRate | BigDecimal | 否 | 查重率（如 12.50 表示 12.5%） |

**说明：** 
- 如果提供了查重率，系统会自动与导师设置的阈值比较
- 超过阈值无法提交，会返回错误提示

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "提交成功",
  "data": null
}
```

**错误示例：**
```json
{
  "status": "error",
  "code": 600,
  "info": "论文查重率为 35.50%，超过规定的阈值 30.00%，无法提交！",
  "data": null
}
```

---

### 6.3 获取查重率阈值

**接口路径：** `GET /ThesisDraft/getDuplicateCheckThreshold`

**作用：** 获取导师设置的查重率阈值

**请求方式：** GET

**Content-Type:** `application/json`

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
    "teacherId": 10,
    "maxAllowRate": 30.00,
    "setTime": "2025-03-01 10:00:00",
    "createTime": "2025-03-01 10:00:00",
    "updateTime": "2025-03-01 10:00:00"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 ID |
| teacherId | Integer | 导师 ID |
| maxAllowRate | BigDecimal | 最大允许查重率（如 30.00 = 30%） |
| setTime | Date | 设置时间 |

---

## 7. 论文终稿

### 7.1 获取论文终稿信息

**接口路径：** `POST /ThesisFinal/getThesisFinalList`

**作用：** 获取论文终稿提交状态和详细信息

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "studentId": 1,
  "tutorId": 10,
  "pageNum": 1,
  "pageSize": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| studentId | Integer | 否 | 学生 ID（自动填充） |
| tutorId | Integer | 否 | 导师 ID（自动填充） |
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
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
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

### 7.2 提交论文终稿

**接口路径：** `POST /ThesisFinal/studentApply`

**作用：** 学生提交论文终稿（带查重率校验）

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "finalFileId": 123,
  "fileType": 1,
  "viewUrl": "/files/thesis/final_123.pdf",
  "finalTitle": "基于 Spring Boot 的毕业设计管理系统",
  "finalKeywords": "Spring Boot;毕业设计;管理系统",
  "finalAbstract": "本文设计并实现了一个...",
  "duplicateCheckRate": 12.50
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| finalFileId | Integer | 是 | 上传的文件 ID |
| fileType | Integer | 否 | 文件类型 |
| viewUrl | String | 否 | 在线查看地址 |
| finalTitle | String | 否 | 论文标题 |
| finalKeywords | String | 否 | 关键词 |
| finalAbstract | String | 否 | 摘要 |
| duplicateCheckRate | BigDecimal | 否 | 查重率（如 12.50 表示 12.5%） |

**说明：** 
- 如果提供了查重率，系统会自动与导师设置的阈值比较
- 超过阈值无法提交，会返回错误提示
- 学生信息、导师信息、项目 ID 会自动从登录信息中填充

**返回参数：**
```json
{
  "status": "success",
  "code": 200,
  "info": "提交成功",
  "data": null
}
```

**错误示例：**
```json
{
  "status": "error",
  "code": 600,
  "info": "论文查重率为 35.50%，超过规定的阈值 30.00%，无法提交！",
  "data": null
}
```

---

## 8. 答辩安排

### 7.1 获取答辩安排信息

**接口路径：** `POST /defenseArrangement/getDefenseArrangement`

**作用：** 获取答辩时间安排和分组信息

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "studentId": 1,
  "teacherId": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| studentId | Integer | 否 | 学生 ID（自动填充） |
| teacherId | Integer | 否 | 导师 ID（自动填充） |

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
        "studentName": "张三",
        "remark": "请提前 15 分钟到场"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1
  }
}
```

---

## 9. 过程指导记录

### 8.1 获取指导记录信息

**接口路径：** `POST /processGuidanceRecord/getProcessGuidanceRecord`

**作用：** 查看导师的指导记录和学生反馈

**请求方式：** POST

**Content-Type:** `application/json`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "studentId": 1,
  "teacherId": 10
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| studentId | Integer | 否 | 学生 ID（自动填充） |
| teacherId | Integer | 否 | 导师 ID（自动填充） |

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
    "total": 5,
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

### 文件上传

所有需要上传文件的接口，都需要先调用文件上传接口（未在此文档列出），获取 fileId 后再调用相应的业务接口。

---

**文档版本：** v1.0  
**最后更新：** 2026-03-25
