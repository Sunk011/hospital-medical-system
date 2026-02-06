# 🔐 角色权限管理

> Hospital Medical System — Role & Permission Management

本文档详细描述系统的角色体系、权限控制模型和安全机制。

---

## 目录

- [1. 角色体系](#1-角色体系)
- [2. 功能权限矩阵](#2-功能权限矩阵)
- [3. API 权限矩阵](#3-api-权限矩阵)
- [4. 前端菜单权限](#4-前端菜单权限)
- [5. 权限实现机制](#5-权限实现机制)
- [6. 安全策略](#6-安全策略)

---

## 1. 角色体系

系统定义了 **4 种用户角色**，每种角色拥有不同的操作权限：

### 1.1 角色定义

| 角色 | 英文标识 | 说明 | 适用人员 |
|------|---------|------|---------|
| **管理员** | `admin` | 系统最高权限，可管理所有功能和用户 | IT 管理员、医院管理层 |
| **医生** | `doctor` | 核心业务操作权限，可管理患者、病历等 | 临床医生 |
| **护士** | `nurse` | 辅助业务操作权限，可查看和管理部分业务数据 | 护理人员 |
| **前台** | `receptionist` | 基础业务操作权限，主要负责患者登记和接待 | 前台接待、挂号人员 |

### 1.2 角色层级

```
admin (管理员) ──── 最高权限
    │
    ├── 所有业务模块的完整 CRUD 权限
    ├── 系统管理（用户管理 + 操作日志）
    └── 可分配和管理其他用户角色
    
doctor (医生) ──── 核心业务权限
    │
    ├── 患者管理: 完整 CRUD
    ├── 病历管理: 完整 CRUD + 状态流转
    ├── 医生信息: 仅查看
    └── 统计分析: 查看

nurse (护士) ──── 辅助业务权限
    │
    ├── 患者管理: 完整 CRUD
    ├── 病历管理: 完整 CRUD
    ├── 医生信息: 仅查看
    └── 统计分析: 查看

receptionist (前台) ──── 基础业务权限
    │
    ├── 患者管理: 完整 CRUD
    ├── 病历管理: 完整 CRUD
    ├── 医生信息: 仅查看
    └── 统计分析: 查看
```

---

## 2. 功能权限矩阵

### 2.1 模块级权限

| 功能模块 | 管理员 (admin) | 医生 (doctor) | 护士 (nurse) | 前台 (receptionist) |
|---------|:---:|:---:|:---:|:---:|
| **仪表板** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ 完整 |
| **患者管理** | ✅ 完整 CRUD | ✅ 完整 CRUD | ✅ 完整 CRUD | ✅ 完整 CRUD |
| **医生管理** | ✅ 完整 CRUD | 👁 仅查看 | 👁 仅查看 | 👁 仅查看 |
| **病历管理** | ✅ 完整 CRUD | ✅ 完整 CRUD | ✅ 完整 CRUD | ✅ 完整 CRUD |
| **科室管理** | ✅ 完整 CRUD | 👁 仅查看 | 👁 仅查看 | 👁 仅查看 |
| **统计分析** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ 完整 |
| **系统管理** | ✅ 完整 | ❌ 不可见 | ❌ 不可见 | ❌ 不可见 |

### 2.2 操作级权限

| 操作 | 管理员 | 医生 | 护士 | 前台 |
|------|:---:|:---:|:---:|:---:|
| 创建用户 | ✅ | ❌ | ❌ | ❌ |
| 重置密码 (他人) | ✅ | ❌ | ❌ | ❌ |
| 修改密码 (自己) | ✅ | ✅ | ✅ | ✅ |
| 创建/编辑医生 | ✅ | ❌ | ❌ | ❌ |
| 删除医生 | ✅ | ❌ | ❌ | ❌ |
| 创建/编辑科室 | ✅ | ❌ | ❌ | ❌ |
| 删除科室 | ✅ | ❌ | ❌ | ❌ |
| 启用/停用科室 | ✅ | ❌ | ❌ | ❌ |
| 创建/编辑患者 | ✅ | ✅ | ✅ | ✅ |
| 删除患者 | ✅ | ✅ | ✅ | ✅ |
| 创建/编辑病历 | ✅ | ✅ | ✅ | ✅ |
| 病历状态变更 | ✅ | ✅ | ✅ | ✅ |
| 管理处方 | ✅ | ✅ | ✅ | ✅ |
| 上传/下载附件 | ✅ | ✅ | ✅ | ✅ |
| 查看统计 | ✅ | ✅ | ✅ | ✅ |
| 导出报告 | ✅ | ✅ | ✅ | ✅ |
| 查看操作日志 | ✅ | ❌ | ❌ | ❌ |
| 管理用户状态 | ✅ | ❌ | ❌ | ❌ |

---

## 3. API 权限矩阵

### 3.1 认证要求说明

| 标记 | 说明 |
|------|------|
| 🌐 公开 | 无需认证即可访问 |
| 🔑 认证 | 需要有效的 JWT 令牌 |
| 🛡 管理员 | 需要 admin 角色 |

### 3.2 完整 API 权限表

#### 认证模块

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/auth/login` | POST | 🌐 公开 | 用户登录 |
| `/auth/logout` | POST | 🔑 认证 | 用户登出 |
| `/auth/profile` | GET | 🔑 认证 | 获取个人信息 |
| `/auth/users` | GET | 🔑 认证 | 获取用户列表 (供选择) |
| `/auth/password` | PUT | 🔑 认证 | 修改自己的密码 |
| `/auth/refresh` | POST | 🌐 公开 | 刷新访问令牌 |

#### 患者模块

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/patients` | GET | 🔑 认证 | 获取患者列表 |
| `/patients/:id` | GET | 🔑 认证 | 获取患者详情 |
| `/patients` | POST | 🔑 认证 | 创建患者 |
| `/patients/:id` | PUT | 🔑 认证 | 更新患者 |
| `/patients/:id` | DELETE | 🔑 认证 | 删除患者 |
| `/patients/statistics` | GET | 🔑 认证 | 患者统计 |
| `/patients/:id/records` | GET | 🔑 认证 | 获取患者病历 |
| `/patients/:id/history` | GET | 🔑 认证 | 获取就诊历史 |

#### 医生模块

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/doctors` | GET | 🔑 认证 | 获取医生列表 |
| `/doctors/:id` | GET | 🔑 认证 | 获取医生详情 |
| `/doctors/by-department/:id` | GET | 🔑 认证 | 按科室查医生 |
| `/doctors/statistics` | GET | 🔑 认证 | 医生统计 |
| `/doctors` | POST | 🛡 管理员 | 创建医生 |
| `/doctors/:id` | PUT | 🛡 管理员 | 更新医生 |
| `/doctors/:id` | DELETE | 🛡 管理员 | 删除医生 |

#### 科室模块

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/departments` | GET | 🔑 认证 | 获取科室列表 |
| `/departments/active` | GET | 🔑 认证 | 获取启用科室 |
| `/departments/:id` | GET | 🔑 认证 | 获取科室详情 |
| `/departments` | POST | 🛡 管理员 | 创建科室 |
| `/departments/:id` | PUT | 🛡 管理员 | 更新科室 |
| `/departments/:id` | DELETE | 🛡 管理员 | 删除科室 |

#### 病历模块

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/medical-records` | GET | 🔑 认证 | 获取病历列表 |
| `/medical-records/:id` | GET | 🔑 认证 | 获取病历详情 |
| `/medical-records` | POST | 🔑 认证 | 创建病历 |
| `/medical-records/:id` | PUT | 🔑 认证 | 更新病历 |
| `/medical-records/:id/status` | PATCH | 🔑 认证 | 变更状态 |
| `/medical-records/:id` | DELETE | 🔑 认证 | 删除病历 |
| `/medical-records/statistics` | GET | 🔑 认证 | 病历统计 |
| `/medical-records/:id/prescriptions` | GET | 🔑 认证 | 获取处方 |
| `/medical-records/:id/prescriptions/batch` | POST | 🔑 认证 | 批量创建处方 |
| `/medical-records/:id/prescriptions` | DELETE | 🔑 认证 | 删除处方 |
| `/medical-records/:id/attachments` | GET | 🔑 认证 | 获取附件 |
| `/medical-records/:id/attachments` | POST | 🔑 认证 | 上传附件 |

#### 处方模块

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/prescriptions/:id` | GET | 🔑 认证 | 获取处方详情 |
| `/prescriptions` | POST | 🔑 认证 | 创建处方 |
| `/prescriptions/:id` | PUT | 🔑 认证 | 更新处方 |
| `/prescriptions/:id` | DELETE | 🔑 认证 | 删除处方 |

#### 附件模块

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/attachments/:id` | GET | 🔑 认证 | 获取附件信息 |
| `/attachments/:id/download` | GET | 🔑 认证 | 下载附件 |
| `/attachments/:id` | PUT | 🔑 认证 | 更新附件描述 |
| `/attachments/:id` | DELETE | 🔑 认证 | 删除附件 |

#### 统计模块

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/statistics/dashboard` | GET | 🔑 认证 | 仪表板概览 |
| `/statistics/visits` | GET | 🔑 认证 | 就诊统计 |
| `/statistics/visits/trend` | GET | 🔑 认证 | 就诊趋势 |
| `/statistics/departments` | GET | 🔑 认证 | 科室统计 |
| `/statistics/doctors` | GET | 🔑 认证 | 医生统计 |
| `/statistics/patients` | GET | 🔑 认证 | 患者统计 |
| `/statistics/diseases` | GET | 🔑 认证 | 疾病统计 |
| `/statistics/prescriptions` | GET | 🔑 认证 | 处方统计 |
| `/statistics/report` | GET | 🔑 认证 | 生成报告 |

#### 系统管理模块

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/system/users` | GET | 🛡 管理员 | 获取用户列表 |
| `/system/users` | POST | 🛡 管理员 | 创建用户 |
| `/system/users/:id` | PUT | 🛡 管理员 | 更新用户 |
| `/system/users/:id/status` | PATCH | 🛡 管理员 | 切换用户状态 |
| `/system/users/:id/reset-password` | PATCH | 🛡 管理员 | 重置密码 |
| `/system/logs` | GET | 🛡 管理员 | 查询操作日志 |

---

## 4. 前端菜单权限

### 4.1 侧边栏菜单可见性

| 菜单项 | 图标 | 路由 | 可见角色 | 控制方式 |
|--------|------|------|---------|---------|
| 仪表板 | 🏠 | `/dashboard` | 所有角色 | 始终显示 |
| 患者管理 | 👥 | `/patients` | 所有角色 | 始终显示 |
| 医生管理 | 👨‍⚕️ | `/doctors` | 所有角色 | 始终显示 |
| 病历管理 | 📋 | `/medical-records` | 所有角色 | 始终显示 |
| 科室管理 | 🏢 | `/departments` | 所有角色 | 始终显示 |
| 统计分析 | 📊 | `/statistics` | 所有角色 | 始终显示 |
| 系统管理 | ⚙️ | `/system` | 仅 admin | `v-if="authStore.isAdmin()"` |

### 4.2 页面内权限控制

在非管理员角色下，部分页面元素会被隐藏：

| 页面 | 隐藏元素 | 控制条件 |
|------|---------|---------|
| 医生管理 | 新增/编辑/删除按钮 | `v-if="isAdmin"` |
| 科室管理 | 新增/编辑/删除/启停用按钮 | `v-if="isAdmin"` |
| 病历管理 | 编辑/删除按钮 (已确认/归档) | `record.status === 'draft'` |

### 4.3 路由守卫

```
路由守卫逻辑:
1. 访问 requiresAuth 路由:
   → 未登录 → 重定向到 /login
   → 已登录 → 允许访问

2. 访问 requiresAdmin 路由 (/system):
   → 未登录 → 重定向到 /login
   → 已登录 + 非 admin → 重定向到 /403
   → 已登录 + admin → 允许访问

3. 访问 /login:
   → 已登录 → 重定向到 /dashboard
   → 未登录 → 显示登录页
```

---

## 5. 权限实现机制

### 5.1 后端实现

#### 认证中间件 (authenticate)

```
功能: 验证 JWT 令牌的有效性
流程:
1. 从请求头提取 Authorization: Bearer <token>
2. 使用 jsonwebtoken 验证令牌
3. 解码获取 { userId, role }
4. 查询数据库确认用户存在且状态为 active
5. 将 user 对象挂载到 req.user
6. 验证失败返回 401 Unauthorized
```

#### 授权中间件 (authorize)

```
功能: 检查用户角色是否在允许列表中
用法: authorize('admin') 或 authorize('admin', 'doctor')
流程:
1. 获取 req.user.role
2. 检查角色是否在允许的角色数组中
3. 不匹配返回 403 Forbidden
```

#### 使用示例

```
// 仅认证即可访问
router.get('/patients', authenticate, patientController.getAll)

// 需要管理员权限
router.post('/doctors', authenticate, authorize('admin'), doctorController.create)

// 多角色授权
router.get('/reports', authenticate, authorize('admin', 'doctor'), reportController.get)
```

### 5.2 前端实现

#### Auth Store (Pinia)

```
角色判断方法:
- authStore.isAdmin()     → role === 'admin'
- authStore.isDoctor()    → role === 'doctor'
- authStore.isNurse()     → role === 'nurse'
- authStore.isReceptionist() → role === 'receptionist'
```

#### 模板中使用

```
<!-- 仅管理员可见 -->
<el-button v-if="authStore.isAdmin()">删除</el-button>

<!-- 仅管理员可见的菜单 -->
<el-menu-item v-if="authStore.isAdmin()" index="/system">
  系统管理
</el-menu-item>
```

#### Axios 拦截器

```
自动处理:
- 请求拦截: 自动添加 Authorization 头
- 响应 401: 清除令牌，跳转登录页
- 响应 403: 显示"权限不足"提示
```

---

## 6. 安全策略

### 6.1 密码安全

| 策略 | 实现 |
|------|------|
| 存储加密 | bcrypt 哈希（10 轮盐值） |
| 最小长度 | 6 个字符 |
| 传输安全 | HTTPS 加密传输（生产环境） |
| 密码重置 | 仅管理员可操作他人密码重置 |

### 6.2 令牌安全

| 策略 | 实现 |
|------|------|
| 短期访问令牌 | 2 小时过期，减少泄露风险 |
| 长期刷新令牌 | 7 天过期，用于续签 |
| 令牌刷新 | 无感知刷新，用户体验无中断 |
| 前端存储 | localStorage（配合 HTTPS） |
| 注销清理 | 登出时清除所有本地令牌 |

### 6.3 请求安全

| 策略 | 实现 |
|------|------|
| CORS | 限制允许的跨域来源 |
| 速率限制 | 通用 100次/15分钟，登录 10次/15分钟 |
| Helmet | 安全 HTTP 头 (X-Frame-Options, CSP 等) |
| 输入验证 | express-validator 白名单校验 |
| SQL 注入防护 | Prisma ORM 参数化查询 |

### 6.4 操作审计

| 策略 | 实现 |
|------|------|
| 操作日志 | 记录所有关键操作 (CRUD) |
| 日志字段 | 操作人、模块、操作类型、目标、详情、IP、UA |
| 日志查询 | 管理员可按多维度查询和筛选 |
| 日志不可篡改 | 日志表无更新/删除接口 |

### 6.5 安全建议（生产环境）

| 建议 | 说明 |
|------|------|
| 启用 HTTPS | 使用 TLS 证书加密所有通信 |
| 更改 JWT 密钥 | 使用高强度随机密钥替换默认密钥 |
| 数据库访问 | 使用独立数据库用户，最小权限原则 |
| 环境变量 | 使用 .env 文件管理敏感配置，不提交到版本控制 |
| 定期备份 | 数据库自动备份，异地容灾 |
| 日志监控 | 配置日志告警，监控异常登录和操作 |
| 依赖更新 | 定期更新 npm 依赖，修复安全漏洞 |

---

*📖 返回 [项目 README](../README.md) | 查看 [架构设计](ARCHITECTURE.md) | 查看 [API 文档](API_REFERENCE.md)*
