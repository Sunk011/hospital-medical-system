# 🏥 医院病历管理系统

> Hospital Medical Record Management System

一个功能完整的医院病历管理系统，采用前后端分离架构，支持多角色权限管理、患者管理、医生管理、科室管理、病历管理、处方管理、统计分析、系统管理等核心功能。

---

## 📋 目录

- [技术栈](#-技术栈)
- [系统架构](#-系统架构)
- [功能模块](#-功能模块)
- [快速开始](#-快速开始)
- [测试数据](#-导入测试数据)
- [测试账户](#-测试账户)
- [项目结构](#-项目结构)
- [API 端点](#-api-端点)
- [常用命令](#-常用命令)
- [详细文档](#-详细文档)

---

## 🛠 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | Vue.js | 3.x | Composition API + `<script setup>` |
| **构建工具** | Vite | 5.x | 极速 HMR 开发体验 |
| **类型系统** | TypeScript | 5.x | 前后端全栈严格类型 |
| **UI 组件库** | Element Plus | 2.x | 企业级 Vue 3 组件 |
| **CSS 框架** | TailwindCSS | 3.x | 原子化 CSS |
| **状态管理** | Pinia | 2.x | 下一代 Vue 状态管理 |
| **图表可视化** | ECharts | 5.x | 数据统计图表 |
| **国际化** | vue-i18n | 9.x | 中英文双语切换 |
| **后端框架** | Express.js | 4.x | 轻量级 Web 框架 |
| **ORM** | Prisma | 5.x | 类型安全的数据库操作 |
| **数据库** | MySQL | 8.x | 关系型数据库 |
| **认证** | JWT | - | 无状态令牌认证 |
| **加密** | bcrypt | - | 密码哈希 |
| **日志** | winston | - | 结构化日志 |

---

## 🏗 系统架构

```
┌────────────────────────────────────────────────────────────┐
│                   浏览器 (Vue 3 SPA)                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │仪表板│ │患者  │ │医生  │ │病历  │ │科室  │ │系统  │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
│     Pinia (状态管理) + Axios (HTTP) + vue-i18n (国际化)     │
└────────────────────┬───────────────────────────────────────┘
                     │ RESTful API (JSON)
                     ▼
┌────────────────────────────────────────────────────────────┐
│               Express.js + TypeScript                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 路由层   │→│ 中间件层 │→│ 控制器层 │→│ 服务层   │      │
│  │ Routes   │ │Middleware│ │Controller│ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  JWT认证 | RBAC权限 | 请求验证 | 速率限制 | 日志记录       │
└────────────────────┬───────────────────────────────────────┘
                     │ Prisma ORM
                     ▼
┌────────────────────────────────────────────────────────────┐
│                    MySQL 8.x                                │
│  users | departments | doctors | patients                   │
│  medical_records | prescriptions | attachments              │
│  operation_logs                                             │
└────────────────────────────────────────────────────────────┘
```

> 📖 详细架构设计请参考 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 📊 功能模块

### 核心业务模块

| 模块 | 功能说明 | 可用角色 |
|------|---------|---------|
| **🏠 仪表板** | 系统概览、关键指标、快捷操作、就诊趋势图 | 所有角色 |
| **👥 患者管理** | 患者信息 CRUD、病历号自动生成、就诊历史、病史管理 | 所有角色 |
| **👨‍⚕️ 医生管理** | 医生档案 CRUD、科室分配、执业信息、统计查看 | 管理员(管理) / 其他(查看) |
| **📋 病历管理** | 病历 CRUD、状态工作流(草稿→确认→归档)、处方管理、附件上传 | 所有角色 |
| **🏢 科室管理** | 科室 CRUD、启用/停用、医生关联检查 | 管理员(管理) / 其他(查看) |
| **📊 统计分析** | 7 个统计维度、ECharts 图表、CSV 报告导出 | 所有角色 |
| **⚙️ 系统管理** | 用户 CRUD、密码重置、状态管理、操作日志查询 | 仅管理员 |

### 基础能力

| 能力 | 说明 |
|------|------|
| **🔐 认证授权** | JWT 令牌 + 刷新令牌、4 级角色权限(admin/doctor/nurse/receptionist) |
| **🌐 国际化** | 中英文双语切换，500+ 翻译键完整覆盖 |
| **📎 附件管理** | PDF/JPG/PNG 文件上传下载，10MB 大小限制 |
| **🛡 安全防护** | Helmet 安全头、CORS、速率限制、bcrypt 密码加密 |
| **📝 操作日志** | 全量操作审计日志，支持模块/操作/时间范围查询 |
| **📦 报告导出** | CSV 格式统计报告，支持日期范围筛选 |

> 📖 角色权限详情请参考 [docs/ROLE_MANAGEMENT.md](docs/ROLE_MANAGEMENT.md)
>
> 📖 完整使用指南请参考 [docs/USER_GUIDE.md](docs/USER_GUIDE.md)

---

## 🚀 快速开始

### 前置要求

- **Node.js** 20.x LTS
- **MySQL** 8.x
- **npm** 10.x

### 1. 克隆项目

```bash
git clone <repository-url>
cd hospital-medical-system
```

### 2. 数据库设置

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 3. 后端设置

```bash
cd backend

# 安装依赖
npm install

# 创建环境变量文件 (编辑 .env，设置数据库连接)
# DATABASE_URL="mysql://root:your_password@localhost:3306/hospital_db"

# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

# 启动后端服务
npm run dev
```

后端将在 **http://localhost:3000** 启动

### 4. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动前端服务
npm run dev
```

前端将在 **http://localhost:5173** 启动

### 5. 访问系统

打开浏览器访问 `http://localhost:5173`，使用测试账户登录即可。

---

## 📦 导入测试数据

系统提供了完整的测试数据集，包含用户、科室、医生、患者、病历、处方等信息。

### 方式一：SQL 文件导入（推荐）

```bash
# 确保数据库已创建并完成迁移后
cd backend
mysql -u root -p hospital_db < prisma/test_data.sql
```

### 方式二：种子脚本

```bash
cd backend
npm run prisma:seed
```

> **注意**: 种子脚本只包含基础 4 个用户，完整测试数据请使用方式一。

### 测试数据概览

| 数据类型 | 数量 | 说明 |
|---------|------|------|
| 用户账户 | 22 | 含管理员、医生、护士、前台 |
| 科室 | 13 | 内科、外科、儿科等 |
| 医生档案 | 10 | 关联用户和科室 |
| 患者记录 | 30 | 完整的患者信息 |
| 病历 | 50 | 包含诊断和治疗方案 |
| 处方 | 76 | 药品和用法用量 |
| 操作日志 | 30 | 系统操作记录 |

---

## 👤 测试账户

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | `admin` | `admin123` | 系统管理员（全部权限） |
| 管理员 | `superadmin` | `superadmin123` | 超级管理员 |
| 医生 | `doctor1` | `doctor1123` | 内科医生 |
| 医生 | `doctor2` | `doctor2123` | 外科医生 |
| 医生 | `doctor3` ~ `doctor10` | `doctor{N}123` | 其他科室医生 |
| 护士 | `nurse1` | `nurse1123` | 护士 |
| 护士 | `nurse2` ~ `nurse5` | `nurse{N}123` | 其他护士 |
| 前台 | `reception1` | `reception1123` | 前台接待 |
| 前台 | `reception2` ~ `reception4` | `reception{N}123` | 其他前台 |

> 💡 **密码规则**: 所有测试账户密码格式为 `用户名 + 123`

---

## 📁 项目结构

```
hospital-medical-system/
├── README.md                        # 项目总览
├── docs/                            # 📚 项目文档
│   ├── README.md                    # 文档索引
│   ├── ARCHITECTURE.md              # 系统架构设计
│   ├── USER_GUIDE.md                # 使用说明
│   ├── API_REFERENCE.md             # API 接口文档
│   ├── ROLE_MANAGEMENT.md           # 角色权限管理
│   ├── SETUP.md / SETUP.zh-CN.md   # 部署指南
│   └── PHASE*.md                    # 开发阶段总结
│
├── backend/                         # 🖥 后端服务
│   ├── prisma/
│   │   ├── schema.prisma            # 数据库模型定义
│   │   ├── seed.ts                  # 种子数据脚本
│   │   ├── test_data.sql            # 完整测试数据
│   │   └── migrations/              # 数据库迁移文件
│   ├── src/
│   │   ├── app.ts                   # 应用入口
│   │   ├── config/                  # 配置文件
│   │   ├── controllers/             # 控制器层 (请求处理)
│   │   ├── services/                # 服务层 (业务逻辑)
│   │   ├── routes/                  # 路由定义
│   │   ├── middlewares/             # 中间件 (认证/日志/验证)
│   │   ├── validators/              # 请求参数验证
│   │   ├── types/                   # TypeScript 类型定义
│   │   └── utils/                   # 工具函数
│   └── uploads/                     # 上传文件存储
│
└── frontend/                        # 🎨 前端应用
    ├── src/
    │   ├── App.vue                  # 根组件
    │   ├── main.ts                  # 应用入口
    │   ├── api/                     # API 请求封装
    │   ├── views/                   # 页面组件
    │   │   ├── auth/                # 登录页
    │   │   ├── dashboard/           # 仪表板
    │   │   ├── patient/             # 患者管理
    │   │   ├── doctor/              # 医生管理
    │   │   ├── medicalRecord/       # 病历管理
    │   │   ├── department/          # 科室管理
    │   │   ├── statistics/          # 统计分析 (7个子Tab)
    │   │   ├── system/              # 系统管理 (用户+日志)
    │   │   └── error/               # 错误页
    │   ├── stores/                  # Pinia 状态管理
    │   ├── router/                  # 路由配置
    │   ├── layouts/                 # 布局组件
    │   ├── locales/                 # 国际化语言包
    │   ├── types/                   # TypeScript 类型
    │   ├── utils/                   # 工具函数
    │   └── styles/                  # 全局样式
    └── public/                      # 静态资源
```

---

## 📝 API 端点

所有 API 基础路径: `/api/v1`

| 模块 | 路径 | 说明 | 权限 |
|------|------|------|------|
| 认证 | `/auth/*` | 登录、登出、刷新令牌、个人信息、修改密码 | 公开/私有 |
| 患者 | `/patients/*` | 患者 CRUD、就诊记录、病史 | 认证用户 |
| 医生 | `/doctors/*` | 医生 CRUD、按科室查询、统计 | 认证/管理员 |
| 科室 | `/departments/*` | 科室 CRUD、启用科室列表 | 认证/管理员 |
| 病历 | `/medical-records/*` | 病历 CRUD、状态流转、处方、附件 | 认证用户 |
| 处方 | `/prescriptions/*` | 处方 CRUD | 认证用户 |
| 附件 | `/attachments/*` | 附件查看、下载、更新、删除 | 认证用户 |
| 统计 | `/statistics/*` | 仪表板、多维度统计、报告生成 | 认证用户 |
| 系统 | `/system/*` | 用户管理、操作日志 | 仅管理员 |

> 📖 完整 API 文档请参考 [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

---

## 🔧 常用命令

### 后端

```bash
npm run dev           # 启动开发服务器 (热重载)
npm run build         # 编译 TypeScript
npm run prisma:seed   # 运行种子脚本
npm run prisma:studio # 打开 Prisma 数据库管理界面
npm run test          # 运行单元测试
npm run lint          # 代码检查
```

### 前端

```bash
npm run dev           # 启动开发服务器 (Vite HMR)
npm run build         # 构建生产版本
npm run preview       # 预览生产版本
npm run lint          # 代码检查
```

### Docker

```bash
docker compose up -d --build  # 启动所有服务
docker compose down           # 停止所有服务
docker compose logs -f        # 查看日志
```

---

## 📚 详细文档

| 文档 | 说明 |
|------|------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 🏗 系统架构设计 — 技术选型、分层架构、数据库设计、数据流 |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | 📖 使用说明 — 各模块操作指南、界面说明 |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | 📡 API 接口文档 — 完整 REST API 参考 |
| [docs/ROLE_MANAGEMENT.md](docs/ROLE_MANAGEMENT.md) | 🔐 角色权限管理 — 权限矩阵、安全模型 |
| [docs/SETUP.md](docs/SETUP.md) | ⚙️ 部署指南 — 开发/生产环境部署 |
| [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) | 📋 项目状态 — 各阶段完成情况 |

> 📌 部分文档提供中文版本 (`*.zh-CN.md`)

---

## 📄 许可证

本项目用于学习和演示目的。

---

*最后更新: 2026-02-06*
