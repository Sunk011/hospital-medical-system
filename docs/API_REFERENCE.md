# 📡 API 接口文档

> Hospital Medical System — REST API Reference

本文档详细描述系统所有 REST API 端点，包括请求方法、路径、参数、响应格式和权限要求。

---

## 目录

- [概述](#概述)
- [认证方式](#认证方式)
- [统一响应格式](#统一响应格式)
- [错误码](#错误码)
- [1. 认证模块 /auth](#1-认证模块-auth)
- [2. 患者模块 /patients](#2-患者模块-patients)
- [3. 医生模块 /doctors](#3-医生模块-doctors)
- [4. 科室模块 /departments](#4-科室模块-departments)
- [5. 病历模块 /medical-records](#5-病历模块-medical-records)
- [6. 处方模块 /prescriptions](#6-处方模块-prescriptions)
- [7. 附件模块 /attachments](#7-附件模块-attachments)
- [8. 统计模块 /statistics](#8-统计模块-statistics)
- [9. 系统管理模块 /system](#9-系统管理模块-system)

---

## 概述

| 项目 | 值 |
|------|-----|
| 基础路径 | `/api/v1` |
| 协议 | HTTP / HTTPS |
| 数据格式 | JSON (`Content-Type: application/json`) |
| 字符编码 | UTF-8 |
| 开发环境地址 | `http://localhost:3000/api/v1` |

---

## 认证方式

系统使用 **JWT Bearer Token** 进行身份认证。

### 请求头

```
Authorization: Bearer <access_token>
```

### 令牌获取

通过 `POST /api/v1/auth/login` 登录获取令牌。

### 令牌刷新

访问令牌过期后，使用 `POST /api/v1/auth/refresh` 和 `refreshToken` 获取新的访问令牌。

### 令牌有效期

| 令牌类型 | 有效期 |
|---------|--------|
| Access Token | 2 小时 |
| Refresh Token | 7 天 |

---

## 统一响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... },
  "timestamp": "2026-02-06T12:00:00.000Z"
}
```

### 分页响应

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100,
      "totalPages": 10
    }
  },
  "timestamp": "2026-02-06T12:00:00.000Z"
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "请求参数错误",
  "errors": [
    {
      "field": "name",
      "message": "姓名不能为空"
    }
  ],
  "timestamp": "2026-02-06T12:00:00.000Z"
}
```

---

## 错误码

| HTTP 状态码 | code | 说明 |
|-------------|------|------|
| 200 | 200 | 请求成功 |
| 201 | 201 | 创建成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未认证（令牌缺失或失效） |
| 403 | 403 | 权限不足 |
| 404 | 404 | 资源不存在 |
| 409 | 409 | 资源冲突（如重复创建） |
| 429 | 429 | 请求过于频繁（速率限制） |
| 500 | 500 | 服务器内部错误 |

---

## 1. 认证模块 /auth

### POST /auth/login

用户登录，获取访问令牌。

| 项目 | 说明 |
|------|------|
| **权限** | 公开（无需认证） |
| **速率限制** | 10 次 / 15 分钟 |

**请求体:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | ✅ | 用户名 |
| password | string | ✅ | 密码（最少 6 位） |

**成功响应 (200):**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员",
      "role": "admin",
      "email": "admin@hospital.com",
      "departmentId": null
    }
  }
}
```

---

### POST /auth/logout

用户登出。

| 项目 | 说明 |
|------|------|
| **权限** | 需要认证 |

**成功响应 (200):**

```json
{
  "code": 200,
  "message": "登出成功"
}
```

---

### GET /auth/profile

获取当前登录用户信息。

| 项目 | 说明 |
|------|------|
| **权限** | 需要认证 |

**成功响应 (200):**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "系统管理员",
    "role": "admin",
    "email": "admin@hospital.com",
    "phone": "13800000000",
    "avatar": null,
    "status": "active",
    "department": {
      "id": 1,
      "name": "内科"
    }
  }
}
```

---

### GET /auth/users

获取可分配的用户列表（用于医生管理的用户选择）。

| 项目 | 说明 |
|------|------|
| **权限** | 需要认证 |

**成功响应 (200):**

```json
{
  "code": 200,
  "data": [
    {
      "id": 2,
      "username": "doctor1",
      "realName": "张三",
      "role": "doctor"
    }
  ]
}
```

---

### PUT /auth/password

修改当前用户密码。

| 项目 | 说明 |
|------|------|
| **权限** | 需要认证 |

**请求体:**

```json
{
  "oldPassword": "admin123",
  "newPassword": "newpass123"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| oldPassword | string | ✅ | 当前密码 |
| newPassword | string | ✅ | 新密码（最少 6 位） |

---

### POST /auth/refresh

刷新访问令牌。

| 项目 | 说明 |
|------|------|
| **权限** | 公开（需提供 refreshToken） |

**请求体:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**成功响应 (200):**

```json
{
  "code": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 2. 患者模块 /patients

> 所有端点需要认证

### GET /patients

获取患者列表（分页）。

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码，默认 1 |
| pageSize | number | ❌ | 每页条数，默认 10 |
| keyword | string | ❌ | 搜索关键字（姓名/病历号/手机号） |
| gender | string | ❌ | 性别筛选 (M/F) |
| bloodType | string | ❌ | 血型筛选 |

**成功响应 (200):**

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "medicalRecordNumber": "MR20260205001",
        "name": "李明",
        "gender": "M",
        "dateOfBirth": "1985-03-15",
        "phone": "13912345678",
        "bloodType": "A",
        "allergies": "青霉素过敏",
        "createdAt": "2026-02-05T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 30,
      "totalPages": 3
    }
  }
}
```

---

### GET /patients/:id

获取单个患者详情。

**路径参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 患者 ID |

---

### POST /patients

创建新患者。

**请求体:**

```json
{
  "name": "张三",
  "gender": "M",
  "dateOfBirth": "1990-01-15",
  "phone": "13912345678",
  "idCard": "310101199001150011",
  "address": "上海市浦东新区XX路100号",
  "bloodType": "A",
  "allergies": "无",
  "emergencyContact": "张父",
  "emergencyPhone": "13900000001"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✅ | 姓名 |
| gender | string | ✅ | 性别 (M/F) |
| dateOfBirth | string | ✅ | 出生日期 (YYYY-MM-DD) |
| phone | string | ✅ | 手机号 |
| idCard | string | ❌ | 身份证号 (18位) |
| address | string | ❌ | 家庭住址 |
| bloodType | string | ❌ | 血型 (A/B/AB/O/Unknown) |
| allergies | string | ❌ | 过敏史 |
| emergencyContact | string | ❌ | 紧急联系人 |
| emergencyPhone | string | ❌ | 紧急联系电话 |

**成功响应 (201):**

病历号 `medicalRecordNumber` 自动生成。

---

### PUT /patients/:id

更新患者信息。请求体字段同创建，所有字段可选。

---

### DELETE /patients/:id

删除患者。若有关联病历记录则返回 409。

---

### GET /patients/statistics

获取患者统计数据。

---

### GET /patients/:id/records

获取指定患者的病历列表。

---

### GET /patients/:id/history

获取指定患者的就诊历史。

---

## 3. 医生模块 /doctors

> 所有端点需要认证，部分端点需要管理员权限

### GET /doctors

获取医生列表（分页）。

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| pageSize | number | ❌ | 每页条数 |
| keyword | string | ❌ | 搜索关键字（姓名/专业） |
| departmentId | number | ❌ | 科室 ID 筛选 |

---

### GET /doctors/:id

获取单个医生详情，包含关联的用户和科室信息。

---

### GET /doctors/by-department/:departmentId

获取指定科室的所有医生。

---

### GET /doctors/statistics

获取医生统计数据。

---

### POST /doctors

创建新医生。**仅管理员**。

**请求体:**

```json
{
  "userId": 5,
  "departmentId": 1,
  "title": "主任医师",
  "speciality": "心血管内科",
  "licenseNumber": "110108198001010001",
  "phone": "13800001234",
  "description": "从事心血管内科临床工作20年"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | number | ✅ | 关联的用户 ID |
| departmentId | number | ✅ | 科室 ID |
| title | string | ❌ | 职称 |
| speciality | string | ❌ | 专业特长 |
| licenseNumber | string | ❌ | 执业证号（唯一） |
| phone | string | ❌ | 联系电话 |
| description | string | ❌ | 个人简介 |

---

### PUT /doctors/:id

更新医生信息。**仅管理员**。

---

### DELETE /doctors/:id

删除医生。**仅管理员**。若有关联病历则返回 409。

---

## 4. 科室模块 /departments

> 查询端点需认证，管理端点需管理员权限

### GET /departments

获取科室列表（分页）。

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| pageSize | number | ❌ | 每页条数 |
| keyword | string | ❌ | 搜索关键字 |
| isActive | boolean | ❌ | 是否启用 |

---

### GET /departments/active

获取所有启用状态的科室列表（不分页，用于下拉选择）。

**成功响应 (200):**

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "内科",
      "code": "NEI"
    },
    {
      "id": 2,
      "name": "外科",
      "code": "WAI"
    }
  ]
}
```

---

### GET /departments/:id

获取单个科室详情，包含下属医生列表。

---

### POST /departments

创建新科室。**仅管理员**。

**请求体:**

```json
{
  "name": "内科",
  "code": "NEI",
  "description": "内科诊疗服务",
  "isActive": true,
  "sortOrder": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✅ | 科室名称（唯一） |
| code | string | ✅ | 科室代码（唯一） |
| description | string | ❌ | 科室描述 |
| isActive | boolean | ❌ | 是否启用，默认 true |
| sortOrder | number | ❌ | 排序顺序，默认 0 |

---

### PUT /departments/:id

更新科室信息。**仅管理员**。

---

### DELETE /departments/:id

删除科室。**仅管理员**。若有关联医生则返回 409。

---

## 5. 病历模块 /medical-records

> 所有端点需要认证

### GET /medical-records

获取病历列表（分页）。

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| pageSize | number | ❌ | 每页条数 |
| keyword | string | ❌ | 搜索关键字（患者姓名/诊断） |
| status | string | ❌ | 状态 (draft/confirmed/archived) |
| visitType | string | ❌ | 就诊类型 (outpatient/emergency/inpatient) |
| doctorId | number | ❌ | 医生 ID |
| startDate | string | ❌ | 开始日期 |
| endDate | string | ❌ | 结束日期 |

---

### GET /medical-records/:id

获取病历详情，包含患者信息、医生信息、处方列表和附件列表。

**成功响应 (200):**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "visitDate": "2026-02-05T09:00:00.000Z",
    "visitType": "outpatient",
    "chiefComplaint": "头痛3天",
    "diagnosis": "偏头痛",
    "treatment": "口服止痛药",
    "status": "confirmed",
    "patient": {
      "id": 1,
      "name": "李明",
      "medicalRecordNumber": "MR20260205001"
    },
    "doctor": {
      "id": 1,
      "user": { "realName": "张医生" },
      "department": { "name": "内科" }
    },
    "prescriptions": [ ... ],
    "attachments": [ ... ]
  }
}
```

---

### POST /medical-records

创建新病历。

**请求体:**

```json
{
  "patientId": 1,
  "doctorId": 1,
  "visitDate": "2026-02-05T09:00:00.000Z",
  "visitType": "outpatient",
  "chiefComplaint": "头痛3天，加重1天",
  "presentIllness": "3天前无明显诱因出现头痛...",
  "pastHistory": "既往体健",
  "diagnosis": "偏头痛",
  "treatment": "口服布洛芬 400mg tid",
  "notes": "1周后复诊"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| patientId | number | ✅ | 患者 ID |
| doctorId | number | ✅ | 医生 ID |
| visitDate | string | ✅ | 就诊日期 (ISO 8601) |
| visitType | string | ✅ | 就诊类型 |
| chiefComplaint | string | ✅ | 主诉 |
| presentIllness | string | ❌ | 现病史 |
| pastHistory | string | ❌ | 既往史 |
| diagnosis | string | ✅ | 诊断 |
| treatment | string | ❌ | 治疗方案 |
| notes | string | ❌ | 备注 |

---

### PUT /medical-records/:id

更新病历。仅 `draft` 状态的病历可以编辑。

---

### PATCH /medical-records/:id/status

更新病历状态。

**请求体:**

```json
{
  "status": "confirmed"
}
```

**状态流转规则:**
- `draft` → `confirmed` ✅
- `confirmed` → `archived` ✅
- 其他转换 ❌

---

### DELETE /medical-records/:id

删除病历。仅 `draft` 状态的病历可以删除。

---

### GET /medical-records/statistics

获取病历统计数据。

---

### GET /medical-records/:recordId/prescriptions

获取指定病历的处方列表。

---

### POST /medical-records/:recordId/prescriptions/batch

批量创建处方（替换现有处方）。

**请求体:**

```json
{
  "prescriptions": [
    {
      "medicineName": "布洛芬缓释胶囊",
      "dosage": "400mg",
      "frequency": "每日2次",
      "duration": "7天",
      "quantity": 14,
      "notes": "饭后服用"
    },
    {
      "medicineName": "奥美拉唑肠溶胶囊",
      "dosage": "20mg",
      "frequency": "每日1次",
      "duration": "14天",
      "quantity": 14,
      "notes": "早餐前服用"
    }
  ]
}
```

---

### DELETE /medical-records/:recordId/prescriptions

删除指定病历的所有处方。

---

### GET /medical-records/:recordId/attachments

获取指定病历的附件列表。

---

### POST /medical-records/:recordId/attachments

上传附件到指定病历。

| 项目 | 说明 |
|------|------|
| **Content-Type** | `multipart/form-data` |
| **文件字段名** | `file` |
| **支持格式** | PDF, JPEG, PNG |
| **最大文件大小** | 10MB |

**表单字段:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | ✅ | 上传的文件 |
| description | string | ❌ | 附件描述 |

---

## 6. 处方模块 /prescriptions

> 所有端点需要认证

### GET /prescriptions/:id

获取单个处方详情。

---

### POST /prescriptions

创建单个处方。

**请求体:**

```json
{
  "medicalRecordId": 1,
  "medicineName": "阿莫西林胶囊",
  "dosage": "500mg",
  "frequency": "每日3次",
  "duration": "7天",
  "quantity": 21,
  "notes": "饭后服用"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| medicalRecordId | number | ✅ | 关联病历 ID |
| medicineName | string | ✅ | 药品名称 |
| dosage | string | ✅ | 剂量 |
| frequency | string | ✅ | 用药频次 |
| duration | string | ❌ | 疗程 |
| quantity | number | ❌ | 数量 |
| notes | string | ❌ | 用药说明 |

---

### PUT /prescriptions/:id

更新处方。

---

### DELETE /prescriptions/:id

删除处方。

---

## 7. 附件模块 /attachments

> 所有端点需要认证

### GET /attachments/:id

获取附件元数据信息。

---

### GET /attachments/:id/download

下载附件文件。

**响应:**
- Content-Type: 文件的 MIME 类型
- Content-Disposition: attachment; filename="原始文件名"

---

### PUT /attachments/:id

更新附件描述信息。

**请求体:**

```json
{
  "description": "2026年2月5日胸部X光报告"
}
```

---

### DELETE /attachments/:id

删除附件（同时删除物理文件和数据库记录）。

---

## 8. 统计模块 /statistics

> 所有端点需要认证

### GET /statistics/dashboard

获取仪表板概览数据。

**成功响应 (200):**

```json
{
  "code": 200,
  "data": {
    "totalPatients": 30,
    "totalDoctors": 10,
    "totalRecords": 50,
    "todayVisits": 5,
    "recentTrend": [
      { "date": "2026-02-01", "count": 8 },
      { "date": "2026-02-02", "count": 12 }
    ]
  }
}
```

---

### GET /statistics/visits

获取就诊统计数据。

**查询参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |

---

### GET /statistics/visits/trend

获取就诊趋势数据（用于折线图）。

**查询参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |
| granularity | string | 粒度: day/week/month |

---

### GET /statistics/departments

获取科室统计数据。

---

### GET /statistics/doctors

获取医生接诊量统计。

---

### GET /statistics/patients

获取患者统计数据（新增趋势、年龄分布、性别比例）。

---

### GET /statistics/diseases

获取疾病统计数据（诊断排名）。

---

### GET /statistics/prescriptions

获取处方统计数据（药品使用频率）。

---

### GET /statistics/report

生成统计报告数据（用于 CSV 导出）。

**查询参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |

**成功响应 (200):**

```json
{
  "code": 200,
  "data": {
    "summary": {
      "totalVisits": 150,
      "totalPatients": 80,
      "totalPrescriptions": 200
    },
    "visitsByType": { ... },
    "visitsByDepartment": [ ... ],
    "topDoctors": [ ... ],
    "topDiseases": [ ... ],
    "topMedicines": [ ... ]
  }
}
```

---

## 9. 系统管理模块 /system

> ⚠️ 所有端点需要**管理员 (admin)** 权限

### GET /system/users

获取系统用户列表（分页）。

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| pageSize | number | ❌ | 每页条数 |
| keyword | string | ❌ | 搜索关键字（用户名/姓名） |
| role | string | ❌ | 角色筛选 |
| status | string | ❌ | 状态筛选 |

---

### POST /system/users

创建新用户。**仅管理员**。

**请求体:**

```json
{
  "username": "newdoctor",
  "password": "password123",
  "realName": "新医生",
  "role": "doctor",
  "email": "newdoctor@hospital.com",
  "phone": "13800001111",
  "departmentId": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | ✅ | 用户名（唯一） |
| password | string | ✅ | 密码（最少 6 位） |
| realName | string | ✅ | 真实姓名 |
| role | string | ✅ | 角色 (admin/doctor/nurse/receptionist) |
| email | string | ❌ | 邮箱 |
| phone | string | ❌ | 手机号 |
| departmentId | number | ❌ | 所属科室 |

---

### PUT /system/users/:id

更新用户信息。**仅管理员**。

---

### PATCH /system/users/:id/status

切换用户状态。**仅管理员**。

**请求体:**

```json
{
  "status": "inactive"
}
```

| 状态值 | 说明 |
|--------|------|
| active | 活跃（可正常登录） |
| inactive | 停用（无法登录） |
| locked | 锁定（无法登录） |

---

### PATCH /system/users/:id/reset-password

重置用户密码。**仅管理员**。

**请求体:**

```json
{
  "newPassword": "newpassword123"
}
```

---

### GET /system/logs

获取操作日志列表（分页）。**仅管理员**。

**查询参数:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| pageSize | number | ❌ | 每页条数 |
| module | string | ❌ | 模块筛选 |
| action | string | ❌ | 操作类型筛选 |
| userId | number | ❌ | 操作人筛选 |
| startDate | string | ❌ | 开始时间 |
| endDate | string | ❌ | 结束时间 |

**成功响应 (200):**

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "userId": 1,
        "module": "patient",
        "action": "CREATE",
        "target": "患者:李明",
        "targetId": "1",
        "detail": "{\"name\":\"李明\"}",
        "ip": "127.0.0.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2026-02-05T10:00:00.000Z",
        "user": {
          "username": "admin",
          "realName": "系统管理员"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 30,
      "totalPages": 2
    }
  }
}
```

---

*📖 返回 [项目 README](../README.md) | 查看 [架构设计](ARCHITECTURE.md) | 查看 [角色权限](ROLE_MANAGEMENT.md)*
