# 🏗 系统架构设计

> Hospital Medical System — Architecture Design Document

本文档详细描述医院病历管理系统的整体架构设计，包括技术选型、分层架构、数据库设计、安全架构和数据流。

---

## 目录

- [1. 整体架构](#1-整体架构)
- [2. 技术选型与理由](#2-技术选型与理由)
- [3. 后端架构](#3-后端架构)
- [4. 前端架构](#4-前端架构)
- [5. 数据库设计](#5-数据库设计)
- [6. 安全架构](#6-安全架构)
- [7. 数据流](#7-数据流)
- [8. 目录结构详解](#8-目录结构详解)
- [9. 部署架构](#9-部署架构)

---

## 1. 整体架构

系统采用经典的**三层架构**（3-Tier Architecture），前后端完全分离：

```
┌───────────────────────────────────────────────────────┐
│                    展示层 (Presentation)                │
│           Vue 3 SPA + Element Plus + ECharts           │
│              http://localhost:5173                      │
└──────────────────────┬────────────────────────────────┘
                       │ HTTP/JSON (RESTful API)
                       ▼
┌───────────────────────────────────────────────────────┐
│                   业务逻辑层 (Business)                  │
│          Express.js + TypeScript + JWT + RBAC           │
│              http://localhost:3000                      │
└──────────────────────┬────────────────────────────────┘
                       │ Prisma ORM (TypeScript 类型安全)
                       ▼
┌───────────────────────────────────────────────────────┐
│                    数据层 (Data)                        │
│                MySQL 8.x (InnoDB)                      │
│        8 张核心表 + 外键约束 + 索引优化                   │
└───────────────────────────────────────────────────────┘
```

### 架构特点

| 特点 | 说明 |
|------|------|
| **前后端分离** | 前端 SPA 通过 RESTful API 与后端通信，可独立部署 |
| **类型安全** | 前后端均使用 TypeScript，Prisma 自动生成数据库类型 |
| **分层解耦** | Routes → Middleware → Controller → Service → Prisma → DB |
| **无状态认证** | JWT Token，服务器不存储会话状态 |
| **RBAC 权限控制** | 基于角色的访问控制，4 级权限体系 |

---

## 2. 技术选型与理由

### 2.1 前端技术栈

| 技术 | 版本 | 选型理由 |
|------|------|---------|
| **Vue 3** | 3.x | Composition API 更好的逻辑复用和 TypeScript 支持 |
| **Vite** | 5.x | 极速冷启动，原生 ESM HMR，比 Webpack 快 10-100 倍 |
| **TypeScript** | 5.x | 类型安全，减少运行时错误，IDE 智能提示 |
| **Element Plus** | 2.x | Vue 3 企业级 UI 组件库，表格/表单/对话框等开箱即用 |
| **Pinia** | 2.x | 官方推荐状态管理，比 Vuex 更轻量、更好的 TypeScript 支持 |
| **ECharts** | 5.x | 功能强大的图表库，支持多种图表类型 |
| **TailwindCSS** | 3.x | 原子化 CSS，快速构建响应式布局 |
| **vue-i18n** | 9.x | Vue 3 国际化解决方案，支持中英文动态切换 |
| **Axios** | 1.x | HTTP 客户端，支持拦截器和请求/响应转换 |

### 2.2 后端技术栈

| 技术 | 版本 | 选型理由 |
|------|------|---------|
| **Express.js** | 4.x | 最流行的 Node.js Web 框架，生态成熟、中间件丰富 |
| **TypeScript** | 5.x | 与前端一致的类型系统，全栈类型安全 |
| **Prisma** | 5.x | 下一代 ORM，自动类型生成，迁移管理，Prisma Studio |
| **MySQL** | 8.x | 成熟的关系型数据库，适合结构化医疗数据 |
| **JWT** | - | 无状态认证，适合前后端分离架构 |
| **bcrypt** | - | 工业标准密码哈希算法，自带盐值 |
| **Helmet** | - | HTTP 安全头，防止常见 Web 攻击 |
| **Winston** | - | 结构化日志，支持文件和控制台输出 |
| **express-validator** | - | 声明式请求参数验证 |
| **multer** | - | 文件上传处理中间件 |

---

## 3. 后端架构

### 3.1 分层架构

后端采用清晰的**五层架构**，每层职责分明：

```
请求 → [路由层] → [中间件层] → [控制器层] → [服务层] → [数据层] → 响应
        Routes    Middleware   Controller    Service     Prisma
```

#### 各层职责

| 层级 | 目录 | 职责 | 示例 |
|------|------|------|------|
| **路由层** | `routes/` | URL 路径映射，HTTP 方法绑定，中间件组合 | `router.get('/', authenticate, getAll)` |
| **中间件层** | `middlewares/` | 请求预处理：认证、授权、验证、日志、错误处理 | `authenticate`, `authorize('admin')` |
| **验证层** | `validators/` | 请求参数校验规则，使用 express-validator | `body('name').notEmpty()` |
| **控制器层** | `controllers/` | 接收请求、调用服务、格式化响应 | `req.body → service → res.json()` |
| **服务层** | `services/` | 核心业务逻辑，数据库操作封装 | `prisma.patient.findMany(...)` |

#### 后端入口 (app.ts)

```
应用启动流程:
1. 加载环境变量
2. 创建 Express 应用
3. 配置基础中间件 (JSON, CORS, Helmet, 速率限制)
4. 配置日志中间件
5. 注册 API 路由 (/api/v1/*)
6. 配置静态文件服务 (/uploads)
7. 配置 404 和全局错误处理
8. 连接数据库并启动监听
```

### 3.2 中间件链

请求通过以下中间件链依次处理：

```
客户端请求
    │
    ▼
[express.json()]          # JSON 请求体解析
    │
    ▼
[helmet()]                # 安全 HTTP 头
    │
    ▼
[cors()]                  # 跨域处理
    │
    ▼
[rateLimit()]             # 速率限制 (100次/15分钟)
    │
    ▼
[loggerMiddleware()]      # 请求日志记录
    │
    ▼
[路由匹配]
    │
    ▼
[authenticate]            # JWT 令牌验证 (受保护路由)
    │
    ▼
[authorize(...roles)]     # 角色权限检查 (需要时)
    │
    ▼
[validationRules]         # 请求参数验证 (需要时)
    │
    ▼
[validate]                # 验证结果检查
    │
    ▼
[controller]              # 业务处理
    │
    ▼
[errorMiddleware]         # 全局错误捕获
```

### 3.3 路由模块

系统包含 **9 个路由模块**，全部挂载在 `/api/v1` 下：

| 模块 | 路径前缀 | 文件 | 端点数量 |
|------|---------|------|---------|
| 认证 | `/auth` | auth.routes.ts | 6 |
| 患者 | `/patients` | patient.routes.ts | 8 |
| 医生 | `/doctors` | doctor.routes.ts | 7 |
| 科室 | `/departments` | department.routes.ts | 6 |
| 病历 | `/medical-records` | medicalRecord.routes.ts | 11 |
| 处方 | `/prescriptions` | prescription.routes.ts | 4 |
| 附件 | `/attachments` | attachment.routes.ts | 4 |
| 统计 | `/statistics` | statistics.routes.ts | 9 |
| 系统 | `/system` | system.routes.ts | 6 |

### 3.4 统一响应格式

所有 API 响应遵循统一的 JSON 格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... },
  "timestamp": "2026-02-06T12:00:00.000Z"
}
```

分页响应在 `data` 中包含分页信息：

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

---

## 4. 前端架构

### 4.1 组件架构

```
App.vue
├── MainLayout.vue                  # 主布局 (侧边栏 + 头部 + 内容)
│   ├── Sidebar                     # 侧边栏导航
│   ├── Header                      # 顶部栏 (用户信息 + 语言切换)
│   └── <router-view>               # 动态路由内容
│       ├── DashboardView.vue       # 仪表板
│       ├── PatientListView.vue     # 患者列表
│       ├── DoctorListView.vue      # 医生列表
│       ├── MedicalRecordView.vue   # 病历列表
│       ├── DepartmentView.vue      # 科室管理
│       ├── StatisticsView.vue      # 统计分析 (7个Tab)
│       └── SystemView.vue          # 系统管理 (用户+日志Tab)
│
└── LoginView.vue                   # 登录页 (独立布局)
```

### 4.2 状态管理 (Pinia)

系统使用 **6 个 Pinia Store** 管理全局状态：

| Store | 文件 | 职责 |
|-------|------|------|
| `useAuthStore` | auth.ts | 用户认证状态、令牌管理、角色判断 |
| `usePatientStore` | patient.ts | 患者列表、搜索、CRUD 操作 |
| `useDoctorStore` | doctor.ts | 医生列表、科室筛选 |
| `useMedicalRecordStore` | medicalRecord.ts | 病历列表、状态筛选、处方/附件 |
| `useStatisticsStore` | statistics.ts | 各维度统计数据 |
| `useDepartmentStore` | department.ts | 科室列表、CRUD 操作 |

### 4.3 路由设计

```
/login                    # 登录页 (无需认证)
/                        # 重定向到 /dashboard
/dashboard               # 仪表板
/patients                # 患者列表
/patients/:id            # 患者详情
/doctors                 # 医生列表
/doctors/:id             # 医生详情
/medical-records         # 病历列表
/medical-records/:id     # 病历详情
/departments             # 科室管理 (requiresAuth)
/statistics              # 统计分析 (requiresAuth)
/system                  # 系统管理 (requiresAdmin)
/403                     # 权限不足
/404                     # 页面未找到
```

**路由守卫逻辑**:
1. 未认证用户访问需认证路由 → 重定向到 `/login`
2. 已认证用户访问 `/login` → 重定向到 `/dashboard`
3. 非管理员访问 `requiresAdmin` 路由 → 重定向到 `/403`

### 4.4 国际化 (i18n)

- 支持**中文 (zh-CN)** 和**英文 (en)** 双语
- 语言包包含 **500+** 翻译键
- 覆盖所有页面文案、表单标签、提示信息、错误消息、表格列头等
- 语言偏好存储在 `localStorage` 中，持久化

翻译键结构：

```
common.*        # 通用文案 (确认/取消/搜索/操作等)
auth.*          # 认证相关 (登录/注册/密码等)
dashboard.*     # 仪表板
patient.*       # 患者管理
doctor.*        # 医生管理
medicalRecord.* # 病历管理
department.*    # 科室管理
statistics.*    # 统计分析
system.*        # 系统管理
menu.*          # 导航菜单
validation.*    # 表单验证
```

### 4.5 HTTP 请求层

使用 Axios 封装 HTTP 请求，提供统一的拦截器：

```
请求拦截器:
  → 自动添加 Authorization: Bearer <token>

响应拦截器:
  → 401 错误: 自动清除令牌，跳转登录页
  → 其他错误: 统一 Element Plus 消息提示
```

---

## 5. 数据库设计

### 5.1 ER 图

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Department │     │     User     │     │    Doctor    │
│──────────────│     │──────────────│     │──────────────│
│ id (PK)      │◄────│ departmentId │     │ id (PK)      │
│ name         │     │ id (PK)      │◄────│ userId (FK)  │
│ code         │     │ username     │     │ departmentId │──►│Department│
│ description  │     │ password     │     │ title        │
│ isActive     │     │ realName     │     │ speciality   │
│ sortOrder    │     │ role         │     │ licenseNumber│
│ createdAt    │     │ email        │     │ phone        │
│ updatedAt    │     │ phone        │     │ description  │
└──────────────┘     │ avatar       │     │ createdAt    │
                     │ status       │     │ updatedAt    │
                     │ createdAt    │     └──────┬───────┘
                     │ updatedAt    │            │
                     └──────────────┘            │ 1:N
                                                 ▼
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Patient    │     │  MedicalRecord   │     │  Prescription    │
│──────────────│     │──────────────────│     │──────────────────│
│ id (PK)      │◄────│ patientId (FK)   │     │ id (PK)          │
│ medicalRecNo │     │ id (PK)          │◄────│ medicalRecordId  │
│ name         │     │ doctorId (FK)    │     │ medicineName     │
│ gender       │     │ visitDate        │     │ dosage           │
│ dateOfBirth  │     │ visitType        │     │ frequency        │
│ idCard       │     │ chiefComplaint   │     │ duration         │
│ phone        │     │ presentIllness   │     │ quantity         │
│ address      │     │ pastHistory      │     │ notes            │
│ bloodType    │     │ diagnosis        │     │ createdAt        │
│ allergies    │     │ treatment        │     │ updatedAt        │
│ emergContact │     │ notes            │     └──────────────────┘
│ emergPhone   │     │ status           │
│ createdAt    │     │ createdAt        │     ┌──────────────────┐
│ updatedAt    │     │ updatedAt        │     │   Attachment     │
└──────────────┘     └──────────┬───────┘     │──────────────────│
                                │◄────────────│ medicalRecordId  │
                                              │ id (PK)          │
┌──────────────────┐                          │ fileName         │
│  OperationLog    │                          │ originalName     │
│──────────────────│                          │ filePath         │
│ id (PK)          │                          │ fileSize         │
│ userId (FK)      │                          │ mimeType         │
│ module           │                          │ description      │
│ action           │                          │ uploadedBy (FK)  │
│ target           │                          │ createdAt        │
│ targetId         │                          │ updatedAt        │
│ detail           │                          └──────────────────┘
│ ip               │
│ userAgent        │
│ createdAt        │
└──────────────────┘
```

### 5.2 数据表详述

#### users — 用户表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 登录用户名 |
| password | VARCHAR(255) | NOT NULL | bcrypt 哈希密码 |
| realName | VARCHAR(50) | NOT NULL | 真实姓名 |
| role | ENUM | NOT NULL | 角色: admin/doctor/nurse/receptionist |
| email | VARCHAR(100) | UNIQUE, NULLABLE | 邮箱 |
| phone | VARCHAR(20) | NULLABLE | 手机号 |
| avatar | VARCHAR(255) | NULLABLE | 头像路径 |
| status | ENUM | DEFAULT 'active' | 状态: active/inactive/locked |
| departmentId | INT | FK → departments | 所属科室 |
| createdAt | DATETIME | DEFAULT NOW | 创建时间 |
| updatedAt | DATETIME | AUTO UPDATE | 更新时间 |

#### departments — 科室表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 科室ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | 科室名称 |
| code | VARCHAR(20) | UNIQUE, NOT NULL | 科室代码 |
| description | TEXT | NULLABLE | 科室描述 |
| isActive | BOOLEAN | DEFAULT true | 是否启用 |
| sortOrder | INT | DEFAULT 0 | 排序顺序 |
| createdAt | DATETIME | DEFAULT NOW | 创建时间 |
| updatedAt | DATETIME | AUTO UPDATE | 更新时间 |

#### doctors — 医生表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 医生ID |
| userId | INT | FK → users, UNIQUE | 关联用户 |
| departmentId | INT | FK → departments | 所属科室 |
| title | VARCHAR(50) | NULLABLE | 职称 |
| speciality | VARCHAR(200) | NULLABLE | 专业特长 |
| licenseNumber | VARCHAR(50) | UNIQUE, NULLABLE | 执业证号 |
| phone | VARCHAR(20) | NULLABLE | 联系电话 |
| description | TEXT | NULLABLE | 个人简介 |
| createdAt | DATETIME | DEFAULT NOW | 创建时间 |
| updatedAt | DATETIME | AUTO UPDATE | 更新时间 |

#### patients — 患者表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 患者ID |
| medicalRecordNumber | VARCHAR(20) | UNIQUE, NOT NULL | 病历号 (自动生成) |
| name | VARCHAR(50) | NOT NULL | 姓名 |
| gender | ENUM | NOT NULL | 性别: M/F |
| dateOfBirth | DATE | NOT NULL | 出生日期 |
| idCard | VARCHAR(18) | UNIQUE, NULLABLE | 身份证号 |
| phone | VARCHAR(20) | NOT NULL | 手机号 |
| address | TEXT | NULLABLE | 家庭住址 |
| bloodType | ENUM | DEFAULT 'Unknown' | 血型: A/B/AB/O/Unknown |
| allergies | TEXT | NULLABLE | 过敏史 |
| emergencyContact | VARCHAR(50) | NULLABLE | 紧急联系人 |
| emergencyPhone | VARCHAR(20) | NULLABLE | 紧急联系电话 |
| createdAt | DATETIME | DEFAULT NOW | 创建时间 |
| updatedAt | DATETIME | AUTO UPDATE | 更新时间 |

#### medical_records — 病历表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 病历ID |
| patientId | INT | FK → patients | 关联患者 |
| doctorId | INT | FK → doctors | 接诊医生 |
| visitDate | DATETIME | NOT NULL | 就诊日期 |
| visitType | ENUM | NOT NULL | 就诊类型: outpatient/emergency/inpatient |
| chiefComplaint | TEXT | NOT NULL | 主诉 |
| presentIllness | TEXT | NULLABLE | 现病史 |
| pastHistory | TEXT | NULLABLE | 既往史 |
| diagnosis | TEXT | NOT NULL | 诊断 |
| treatment | TEXT | NULLABLE | 治疗方案 |
| notes | TEXT | NULLABLE | 备注 |
| status | ENUM | DEFAULT 'draft' | 状态: draft/confirmed/archived |
| createdAt | DATETIME | DEFAULT NOW | 创建时间 |
| updatedAt | DATETIME | AUTO UPDATE | 更新时间 |

**状态工作流**: `draft（草稿）` → `confirmed（已确认）` → `archived（已归档）`

#### prescriptions — 处方表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 处方ID |
| medicalRecordId | INT | FK → medical_records | 关联病历 |
| medicineName | VARCHAR(100) | NOT NULL | 药品名称 |
| dosage | VARCHAR(50) | NOT NULL | 剂量 |
| frequency | VARCHAR(50) | NOT NULL | 用药频次 |
| duration | VARCHAR(50) | NULLABLE | 疗程 |
| quantity | INT | NULLABLE | 数量 |
| notes | TEXT | NULLABLE | 用药说明 |
| createdAt | DATETIME | DEFAULT NOW | 创建时间 |
| updatedAt | DATETIME | AUTO UPDATE | 更新时间 |

#### attachments — 附件表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 附件ID |
| medicalRecordId | INT | FK → medical_records | 关联病历 |
| fileName | VARCHAR(255) | NOT NULL | 存储文件名 |
| originalName | VARCHAR(255) | NOT NULL | 原始文件名 |
| filePath | VARCHAR(500) | NOT NULL | 文件存储路径 |
| fileSize | INT | NOT NULL | 文件大小 (字节) |
| mimeType | VARCHAR(100) | NOT NULL | MIME 类型 |
| description | TEXT | NULLABLE | 附件描述 |
| uploadedBy | INT | FK → users | 上传人 |
| createdAt | DATETIME | DEFAULT NOW | 创建时间 |
| updatedAt | DATETIME | AUTO UPDATE | 更新时间 |

**支持的文件类型**: PDF、JPEG、PNG（最大 10MB）

#### operation_logs — 操作日志表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 日志ID |
| userId | INT | FK → users | 操作用户 |
| module | VARCHAR(50) | NOT NULL | 操作模块 |
| action | VARCHAR(50) | NOT NULL | 操作类型 |
| target | VARCHAR(100) | NULLABLE | 操作目标 |
| targetId | VARCHAR(50) | NULLABLE | 目标ID |
| detail | TEXT | NULLABLE | 操作详情 (JSON) |
| ip | VARCHAR(50) | NULLABLE | 客户端 IP |
| userAgent | VARCHAR(500) | NULLABLE | 浏览器 UA |
| createdAt | DATETIME | DEFAULT NOW | 创建时间 |

### 5.3 枚举类型

```
UserRole:        admin | doctor | nurse | receptionist
UserStatus:      active | inactive | locked
Gender:          M | F
BloodType:       A | B | AB | O | Unknown
VisitType:       outpatient | emergency | inpatient
RecordStatus:    draft | confirmed | archived
```

### 5.4 索引设计

| 表 | 索引 | 类型 | 用途 |
|----|------|------|------|
| users | username | UNIQUE | 登录查询 |
| users | email | UNIQUE | 邮箱唯一性 |
| patients | medicalRecordNumber | UNIQUE | 病历号快速查询 |
| patients | idCard | UNIQUE | 身份证唯一性 |
| doctors | userId | UNIQUE | 用户关联 |
| doctors | licenseNumber | UNIQUE | 执业证号唯一性 |
| departments | name | UNIQUE | 科室名唯一性 |
| departments | code | UNIQUE | 科室代码唯一性 |

---

## 6. 安全架构

### 6.1 认证流程

```
登录流程:
┌────────┐   POST /auth/login    ┌────────┐   验证密码    ┌────────┐
│ 客户端  │ ──────────────────→  │ 后端   │ ────────→   │ bcrypt │
│        │   {username,password}  │        │              │ compare│
│        │ ◄──────────────────── │        │ ◄────────    │        │
│        │   {accessToken,       │        │   match?     │        │
│        │    refreshToken,      │        │              └────────┘
│        │    user}              │        │
└────────┘                       └────────┘

请求认证:
┌────────┐  Authorization:       ┌────────┐  验证JWT     ┌────────┐
│ 客户端  │  Bearer <token>      │ 中间件  │ ────────→  │ jsonweb│
│        │ ──────────────────→  │authenticate│           │ token  │
│        │                      │        │ ◄────────    │ verify │
│        │  401 / 继续处理       │        │  {userId,    └────────┘
│        │ ◄──────────────────  │        │   role}
└────────┘                       └────────┘

令牌刷新:
┌────────┐  POST /auth/refresh   ┌────────┐
│ 客户端  │  {refreshToken}      │ 后端   │
│        │ ──────────────────→  │        │  验证refresh token
│        │ ◄──────────────────  │        │  颁发新access token
│        │  {accessToken}        │        │
└────────┘                       └────────┘
```

### 6.2 JWT 令牌配置

| 参数 | 值 | 说明 |
|------|-----|------|
| 访问令牌有效期 | 2 小时 | 短期令牌，用于 API 请求 |
| 刷新令牌有效期 | 7 天 | 长期令牌，用于续签 |
| 加密算法 | HS256 | HMAC-SHA256 |
| 密钥 | 环境变量配置 | JWT_SECRET |

### 6.3 密码安全

| 策略 | 配置 |
|------|------|
| 哈希算法 | bcrypt |
| 盐值轮数 | 10 |
| 最小长度 | 6 字符 |
| 存储方式 | 仅存储哈希值，不存储明文 |

### 6.4 安全防护措施

| 措施 | 说明 |
|------|------|
| **Helmet** | 设置安全 HTTP 头（X-Frame-Options, CSP 等） |
| **CORS** | 限制允许的跨域源 |
| **速率限制** | 通用: 100 次/15 分钟；登录: 10 次/15 分钟 |
| **输入验证** | express-validator 对所有输入进行白名单验证 |
| **SQL 注入防护** | Prisma ORM 参数化查询 |
| **密码加密** | bcrypt 哈希，禁止明文传输/存储 |

---

## 7. 数据流

### 7.1 典型 CRUD 流程 (以创建患者为例)

```
1. 前端表单提交
   PatientForm.vue → patientStore.create(formData)

2. API 请求
   patientApi.create(data) → POST /api/v1/patients
   Headers: { Authorization: Bearer <token> }
   Body: { name, gender, dateOfBirth, phone, ... }

3. 后端处理链
   patient.routes.ts
     → authenticate (JWT 验证)
     → createPatientRules (参数验证)
     → validate (验证结果检查)
     → patientController.create (请求处理)
       → patientService.create (业务逻辑)
         → 生成病历号 (medicalRecordNumber)
         → prisma.patient.create({ data })
         → 返回新患者数据

4. 响应返回
   { code: 201, message: "创建成功", data: { patient }, timestamp: "..." }

5. 前端更新
   patientStore → 更新列表 → UI 刷新
```

### 7.2 文件上传流程

```
1. 选择文件 (PDF/JPG/PNG, ≤10MB)
2. FormData 提交 → POST /api/v1/medical-records/:id/attachments
3. multer 中间件处理
   → 文件类型检查
   → 文件大小检查
   → 保存到 uploads/attachments/
4. 数据库记录附件信息
5. 返回附件元数据
```

### 7.3 病历状态流转

```
创建病历 → [draft 草稿]
               │
               │ PATCH /status {status: "confirmed"}
               ▼
          [confirmed 已确认]
               │
               │ PATCH /status {status: "archived"}
               ▼
          [archived 已归档]
```

---

## 8. 目录结构详解

### 8.1 后端目录

```
backend/
├── prisma/
│   ├── schema.prisma           # Prisma 数据模型定义
│   │                            # 所有 8 张表的模型、关系、枚举
│   ├── migrations/             # 数据库迁移历史
│   ├── seed.ts                 # 种子数据脚本
│   └── test_data.sql           # 完整测试数据 (SQL)
│
├── src/
│   ├── app.ts                  # 应用入口 & 中间件配置
│   │
│   ├── config/
│   │   ├── index.ts            # 统一配置导出
│   │   ├── database.ts         # 数据库连接 (Prisma Client 单例)
│   │   └── jwt.ts              # JWT 密钥和过期时间配置
│   │
│   ├── routes/                 # 路由定义 (9 个模块)
│   │   ├── index.ts            # 路由聚合注册
│   │   ├── auth.routes.ts      # 认证路由
│   │   ├── patient.routes.ts   # 患者路由
│   │   ├── doctor.routes.ts    # 医生路由
│   │   ├── department.routes.ts # 科室路由
│   │   ├── medicalRecord.routes.ts # 病历路由
│   │   ├── prescription.routes.ts  # 处方路由
│   │   ├── attachment.routes.ts    # 附件路由
│   │   ├── statistics.routes.ts    # 统计路由
│   │   └── system.routes.ts       # 系统管理路由
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # JWT 认证 + 角色授权
│   │   ├── error.middleware.ts # 全局错误处理
│   │   ├── logger.middleware.ts # 请求日志
│   │   ├── upload.middleware.ts # 文件上传 (multer)
│   │   └── validation.middleware.ts # 参数验证结果检查
│   │
│   ├── controllers/            # 控制器层 (接收请求、返回响应)
│   ├── services/               # 服务层 (业务逻辑、数据库操作)
│   ├── validators/             # 参数验证规则 (express-validator)
│   ├── types/                  # TypeScript 类型定义
│   └── utils/
│       ├── logger.ts           # Winston 日志配置
│       ├── response.ts         # 统一响应工具函数
│       └── helpers.ts          # 通用辅助函数
│
├── uploads/                    # 上传文件存储
│   └── attachments/            # 附件文件
│
├── logs/                       # 日志文件
├── package.json
├── tsconfig.json
└── nodemon.json               # 开发热重载配置
```

### 8.2 前端目录

```
frontend/
├── src/
│   ├── App.vue                 # 根组件
│   ├── main.ts                 # 应用入口 (注册插件)
│   │
│   ├── api/                    # API 请求封装
│   │   ├── auth.ts             # 认证 API
│   │   ├── patient.ts          # 患者 API
│   │   ├── doctor.ts           # 医生 API
│   │   ├── department.ts       # 科室 API
│   │   ├── medicalRecord.ts    # 病历 API
│   │   ├── statistics.ts       # 统计 API
│   │   └── system.ts           # 系统管理 API
│   │
│   ├── views/                  # 页面组件
│   │   ├── auth/LoginView.vue
│   │   ├── dashboard/DashboardView.vue
│   │   ├── patient/PatientListView.vue
│   │   ├── doctor/DoctorListView.vue
│   │   ├── medicalRecord/MedicalRecordListView.vue
│   │   ├── department/DepartmentView.vue
│   │   ├── statistics/StatisticsView.vue
│   │   ├── system/SystemView.vue
│   │   └── error/NotFoundView.vue, ForbiddenView.vue
│   │
│   ├── stores/                 # Pinia 状态管理
│   ├── router/                 # Vue Router 路由配置
│   ├── layouts/                # 布局组件 (MainLayout)
│   ├── locales/                # 国际化语言包
│   │   ├── zh-CN.ts            # 中文 (500+ 键)
│   │   └── en.ts               # 英文
│   ├── types/                  # TypeScript 类型
│   ├── utils/                  # 工具函数
│   ├── composables/            # Vue Composables
│   ├── directives/             # Vue 自定义指令
│   └── styles/                 # 全局样式 (TailwindCSS)
│
├── public/                     # 静态资源
├── index.html                  # HTML 入口
├── vite.config.ts              # Vite 配置
├── tailwind.config.js          # TailwindCSS 配置
├── tsconfig.json               # TypeScript 配置
└── package.json
```

---

## 9. 部署架构

### 9.1 开发环境

```
开发者电脑:
├── Vite Dev Server (localhost:5173)    ← HMR 热重载
├── Nodemon + ts-node (localhost:3000)  ← 文件变更自动重启
└── MySQL (localhost:3306)
```

### 9.2 生产环境 (Docker)

```
Docker Compose:
├── Nginx (80)
│   ├── 静态文件 (Vue 构建产物)
│   └── 反向代理 /api → backend:3000
├── Node.js (3000)
│   └── Express.js 生产模式
└── MySQL (3306)
    └── 数据卷持久化
```

### 9.3 推荐生产配置

| 组件 | 推荐配置 |
|------|---------|
| 前端 | Nginx 静态托管 + Gzip 压缩 |
| 后端 | PM2 进程管理器，集群模式 |
| 数据库 | MySQL 主从复制，定期备份 |
| HTTPS | Let's Encrypt 免费证书 |
| 日志 | ELK Stack (Elasticsearch + Logstash + Kibana) |

---

*📖 返回 [项目 README](../README.md) | 查看 [API 文档](API_REFERENCE.md) | 查看 [角色权限](ROLE_MANAGEMENT.md)*
