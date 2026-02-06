# 📚 项目文档中心

> Hospital Medical System — Documentation Hub

欢迎来到医院病历管理系统的文档中心。本目录包含系统的所有技术文档和使用指南。

---

## 📖 文档索引

### 核心文档

| 文档 | 说明 | 适用读者 |
|------|------|---------|
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | 🏗 系统架构设计 | 开发人员、架构师 |
| [**USER_GUIDE.md**](USER_GUIDE.md) | 📖 使用说明 | 所有用户 |
| [**API_REFERENCE.md**](API_REFERENCE.md) | 📡 API 接口文档 | 前端/后端开发人员 |
| [**ROLE_MANAGEMENT.md**](ROLE_MANAGEMENT.md) | 🔐 角色权限管理 | 管理员、开发人员 |

### 部署与运维

| 文档 | 说明 | 适用读者 |
|------|------|---------|
| [**SETUP.md**](SETUP.md) | ⚙️ 部署指南 (英文) | 运维人员、开发人员 |
| [**SETUP.zh-CN.md**](SETUP.zh-CN.md) | ⚙️ 部署指南 (中文) | 运维人员、开发人员 |

### 项目管理

| 文档 | 说明 |
|------|------|
| [**PROJECT_STATUS.md**](PROJECT_STATUS.md) | 📋 项目总体状态 (英文) |
| [**PROJECT_STATUS.zh-CN.md**](PROJECT_STATUS.zh-CN.md) | 📋 项目总体状态 (中文) |
| [**PROJECT_COMPLETION.md**](PROJECT_COMPLETION.md) | ✅ 项目完成度评估 |

### 开发阶段总结

| 文档 | 阶段内容 |
|------|---------|
| [**PHASE1_SUMMARY.md**](PHASE1_SUMMARY.md) / [中文](PHASE1_SUMMARY.zh-CN.md) | 第一阶段：基础架构搭建、数据库设计、核心 CRUD |
| [**PHASE2_SUMMARY.md**](PHASE2_SUMMARY.md) / [中文](PHASE2_SUMMARY.zh-CN.md) | 第二阶段：病历管理、处方附件、统计分析 |
| [**PHASE3_SUMMARY.md**](PHASE3_SUMMARY.md) / [中文](PHASE3_SUMMARY.zh-CN.md) | 第三阶段：国际化、科室管理、系统管理、报告导出 |

---

## 🗂 文档内容概要

### 🏗 系统架构设计 (ARCHITECTURE.md)

涵盖系统的整体技术架构：
- **三层架构**: 前端 SPA → REST API → MySQL 数据库
- **后端分层**: Routes → Middleware → Controller → Service → Prisma
- **数据库设计**: 8 张核心表的 ER 图、字段详述、枚举类型
- **安全架构**: JWT 认证流程、RBAC 权限控制、安全防护措施
- **数据流**: CRUD 流程、文件上传流程、病历状态流转
- **部署架构**: 开发/生产环境配置

### 📖 使用说明 (USER_GUIDE.md)

面向所有系统用户的操作指南：
- **登录/登出**: 系统访问和退出
- **仪表板**: 概览数据和快捷操作
- **患者管理**: 患者信息的增删改查
- **医生管理**: 医生档案管理
- **病历管理**: 病历创建、状态流转、处方和附件管理
- **科室管理**: 科室的增删改查和启停用
- **统计分析**: 7 个维度的统计和报告导出
- **系统管理**: 用户管理和操作日志（管理员）

### 📡 API 接口文档 (API_REFERENCE.md)

面向开发人员的完整 REST API 参考：
- **9 个 API 模块**: 认证、患者、医生、科室、病历、处方、附件、统计、系统
- **61 个端点**: 完整的请求/响应格式
- **认证方式**: JWT Bearer Token
- **统一响应格式**: code + message + data + timestamp
- **错误码**: 完整的 HTTP 状态码和业务错误码

### 🔐 角色权限管理 (ROLE_MANAGEMENT.md)

角色和权限的完整说明：
- **4 种角色**: admin / doctor / nurse / receptionist
- **功能权限矩阵**: 模块级和操作级权限对照表
- **API 权限矩阵**: 每个 API 端点的访问权限
- **前端权限控制**: 菜单可见性、按钮显隐、路由守卫
- **实现机制**: 后端中间件 + 前端 Store + 路由守卫
- **安全策略**: 密码安全、令牌安全、请求安全、操作审计

---

## 🚀 快速导航

- 📌 [项目 README](../README.md) — 项目总览和快速开始
- 🏗 [架构设计](ARCHITECTURE.md) — 理解系统如何构建
- 📖 [使用说明](USER_GUIDE.md) — 学习如何使用系统
- 📡 [API 文档](API_REFERENCE.md) — 开发和集成参考
- 🔐 [角色权限](ROLE_MANAGEMENT.md) — 了解权限体系

---

*最后更新: 2026-02-06*
