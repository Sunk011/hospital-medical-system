# 🏥 医院病历管理系统 — 完整启动运行指南

> 本文档提供从零开始完整启动运行本项目的详细步骤，涵盖**本地开发**和 **Docker 部署**两种方式。

---

## 📋 目录

- [一、环境要求](#一环境要求)
- [二、获取源码](#二获取源码)
- [三、本地开发启动（推荐开发阶段使用）](#三本地开发启动推荐开发阶段使用)
  - [3.1 安装 MySQL 数据库](#31-安装-mysql-数据库)
  - [3.2 创建数据库](#32-创建数据库)
  - [3.3 后端配置与启动](#33-后端配置与启动)
  - [3.4 导入测试数据](#34-导入测试数据)
  - [3.5 前端配置与启动](#35-前端配置与启动)
  - [3.6 访问系统](#36-访问系统)
- [四、Docker 一键部署](#四docker-一键部署)
- [五、环境变量说明](#五环境变量说明)
  - [5.1 后端环境变量 (backend/.env)](#51-后端环境变量-backendenv)
  - [5.2 前端环境变量 (frontend/.env.development)](#52-前端环境变量-frontendenvdevelopment)
- [六、测试账户](#六测试账户)
- [七、常用命令速查](#七常用命令速查)
- [八、常见问题排查](#八常见问题排查)
- [九、生产部署注意事项](#九生产部署注意事项)

---

## 一、环境要求

### 本地开发方式

| 软件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| **Node.js** | 20.x | 20.x LTS | 前后端运行时 |
| **npm** | 10.x | 随 Node.js 附带 | 包管理器 |
| **MySQL** | 8.0 | 8.0+ | 关系型数据库 |
| **Git** | 2.x | 最新版 | 版本控制 |

### Docker 部署方式

| 软件 | 最低版本 | 说明 |
|------|---------|------|
| **Docker** | 20.x | 容器引擎 |
| **Docker Compose** | 2.x | 容器编排 |

> 💡 **提示**: 使用 Docker 方式无需单独安装 Node.js 和 MySQL。

### 验证环境

```bash
# 检查 Node.js 版本
node -v
# 期望输出: v20.x.x

# 检查 npm 版本
npm -v
# 期望输出: 10.x.x

# 检查 MySQL 版本
mysql --version
# 期望输出: mysql  Ver 8.x.x

# 检查 Docker 版本（如使用 Docker 方式）
docker --version
docker compose version
```

---

## 二、获取源码

```bash
# 克隆项目仓库
git clone <repository-url>
cd hospital-medical-system
```

项目目录结构概览：

```
hospital-medical-system/
├── backend/           # 后端 Express + Prisma + TypeScript
│   ├── prisma/        # 数据库 Schema、迁移、种子数据
│   ├── src/           # 后端源码
│   ├── package.json
│   └── .env           # ← 需要手动创建
├── frontend/          # 前端 Vue 3 + Vite + Element Plus
│   ├── src/           # 前端源码
│   ├── package.json
│   └── .env.development  # ← 可选自定义
├── docs/              # 项目文档
├── docker-compose.yml # Docker 编排配置
└── README.md
```

---

## 三、本地开发启动（推荐开发阶段使用）

### 3.1 安装 MySQL 数据库

**Windows:**
- 下载 [MySQL Installer](https://dev.mysql.com/downloads/installer/) 并安装
- 或使用 [Scoop](https://scoop.sh): `scoop install mysql`
- 安装后启动服务：`net start MySQL80`

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 3.2 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 在 MySQL 命令行中执行：
CREATE DATABASE hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 验证数据库已创建
SHOW DATABASES;

# 退出
exit;
```

### 3.3 后端配置与启动

#### 步骤 1: 安装依赖

```bash
cd backend
npm install
```

#### 步骤 2: 创建环境变量文件

在 `backend/` 目录下创建 `.env` 文件：

```env
# 服务器配置
NODE_ENV=development
PORT=3000

# 数据库连接（请修改为你的 MySQL 密码）
DATABASE_URL="mysql://root:你的MySQL密码@localhost:3306/hospital_db"

# JWT 认证配置
JWT_SECRET=hospital-medical-system-jwt-secret-key-2024
JWT_EXPIRES_IN=2h
JWT_REFRESH_SECRET=hospital-medical-system-refresh-secret-key-2024
JWT_REFRESH_EXPIRES_IN=7d

# 密码加密
BCRYPT_ROUNDS=10

# 跨域配置
CORS_ORIGIN=http://localhost:5173

# 速率限制（15 分钟内最多 100 次请求）
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

> ⚠️ **重要**: 请将 `DATABASE_URL` 中的 `你的MySQL密码` 替换为你实际的 MySQL root 密码。

#### 步骤 3: 生成 Prisma 客户端 & 执行数据库迁移

```bash
# 生成 Prisma 客户端类型
npx prisma generate

# 执行数据库迁移（创建表结构）
npx prisma migrate dev --name init
```

> 如果迁移已存在，Prisma 会自动检测并应用。首次运行时会创建所有数据库表。

#### 步骤 4: 启动后端开发服务器

```bash
npm run dev
```

看到以下输出表示后端启动成功：

```
[nodemon] watching path(s): src/**/*
[nodemon] starting `ts-node src/app.ts`
Server is running on port 3000
```

后端 API 地址：**http://localhost:3000**

### 3.4 导入测试数据

系统提供了丰富的测试数据，包含 22 个用户、13 个科室、10 个医生、30 个患者、50 条病历等。

#### 方式一：SQL 文件导入（推荐，数据最完整）

```bash
# 在 backend 目录下执行
mysql -u root -p hospital_db < prisma/test_data.sql
```

#### 方式二：种子脚本导入（基础数据）

```bash
# 在 backend 目录下执行
npm run prisma:seed
```

> 💡 **区别**: SQL 文件包含完整的测试数据（22 用户、30 患者、50 病历等），种子脚本仅包含基础数据（管理员、1 个医生、1 个护士、1 个前台、5 个科室）。推荐使用方式一。

### 3.5 前端配置与启动

打开新的终端窗口：

```bash
cd frontend
npm install
npm run dev
```

看到以下输出表示前端启动成功：

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://xxx.xxx.xxx.xxx:5173/
```

前端地址：**http://localhost:5173**

> 💡 前端已配置 API 代理，所有 `/api` 请求会自动转发到后端 `http://localhost:3000`，无需额外配置。

### 3.6 访问系统

1. 打开浏览器访问 **http://localhost:5173**
2. 使用测试账户登录（见[第六节](#六测试账户)）
3. 开始使用系统 🎉

---

## 四、Docker 一键部署

Docker 方式会自动启动 MySQL、后端和前端三个服务，无需手动配置数据库。

### 步骤 1: 启动所有服务

```bash
# 在项目根目录下执行
docker compose up -d --build
```

> 首次构建可能需要几分钟，请耐心等待。

### 步骤 2: 查看服务状态

```bash
# 查看所有服务状态
docker compose ps

# 查看实时日志
docker compose logs -f

# 查看某个服务日志
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

### 步骤 3: 访问系统

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端** | http://localhost | Nginx 托管 |
| **后端 API** | http://localhost:3000 | Express 服务 |
| **MySQL** | localhost:3306 | 数据库服务 |

> 💡 Docker 启动时会自动导入 `test_data.sql` 测试数据。

### 停止与清理

```bash
# 停止所有服务
docker compose down

# 停止并删除数据卷（清除数据库数据）
docker compose down -v

# 重新构建并启动
docker compose up -d --build
```

---

## 五、环境变量说明

### 5.1 后端环境变量 (backend/.env)

| 变量名 | 默认值 | 必填 | 说明 |
|--------|--------|------|------|
| `NODE_ENV` | `development` | 否 | 运行环境：`development` / `production` |
| `PORT` | `3000` | 否 | 后端服务端口 |
| `DATABASE_URL` | — | **是** | MySQL 连接字符串，格式：`mysql://用户名:密码@主机:端口/数据库名` |
| `JWT_SECRET` | `default-secret-key` | 是 | JWT 访问令牌签名密钥 |
| `JWT_EXPIRES_IN` | `2h` | 否 | 访问令牌有效期 |
| `JWT_REFRESH_SECRET` | `default-refresh-secret` | 是 | JWT 刷新令牌签名密钥 |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | 否 | 刷新令牌有效期 |
| `BCRYPT_ROUNDS` | `10` | 否 | 密码哈希轮数 |
| `CORS_ORIGIN` | `http://localhost:5173` | 否 | 允许的跨域来源，多个用逗号分隔 |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 否 | 速率限制时间窗口（毫秒），默认 15 分钟 |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | 否 | 时间窗口内最大请求数 |

### 5.2 前端环境变量 (frontend/.env.development)

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_API_BASE_URL` | `http://localhost:3000/api/v1` | 后端 API 基础地址 |
| `VITE_APP_TITLE` | `Hospital Medical System` | 应用标题 |

> 💡 前端在 `vite.config.ts` 中已配置了开发代理，通常不需要创建 `.env.development` 文件。

---

## 六、测试账户

导入测试数据后，可使用以下账户登录系统：

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 👑 管理员 | `admin` | `admin123` | 系统管理员，拥有全部权限 |
| 👑 管理员 | `superadmin` | `superadmin123` | 超级管理员 |
| 👨‍⚕️ 医生 | `doctor1` | `doctor1123` | 内科医生 |
| 👨‍⚕️ 医生 | `doctor2` | `doctor2123` | 外科医生 |
| 👨‍⚕️ 医生 | `doctor3` ~ `doctor10` | `doctor{N}123` | 其他科室医生 |
| 👩‍⚕️ 护士 | `nurse1` | `nurse1123` | 护士 |
| 👩‍⚕️ 护士 | `nurse2` ~ `nurse5` | `nurse{N}123` | 其他护士 |
| 💁 前台 | `reception1` | `reception1123` | 前台接待 |
| 💁 前台 | `reception2` ~ `reception4` | `reception{N}123` | 其他前台 |

> 📌 **密码规则**: 所有测试账户密码 = 用户名 + `123`

### 角色权限说明

| 角色 | 患者管理 | 医生管理 | 病历管理 | 科室管理 | 统计分析 | 系统管理 |
|------|---------|---------|---------|---------|---------|---------|
| 管理员 | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ 完整 |
| 医生 | ✅ 完整 | 👁 查看 | ✅ 完整 | 👁 查看 | ✅ 完整 | ❌ 无 |
| 护士 | ✅ 完整 | 👁 查看 | ✅ 完整 | 👁 查看 | ✅ 完整 | ❌ 无 |
| 前台 | ✅ 完整 | 👁 查看 | ✅ 完整 | 👁 查看 | ✅ 完整 | ❌ 无 |

---

## 七、常用命令速查

### 后端命令 (在 `backend/` 目录下)

```bash
npm run dev             # 启动开发服务器（热重载）
npm run build           # 编译 TypeScript 为 JavaScript
npm start               # 启动生产服务器（需先 build）
npm run prisma:generate # 重新生成 Prisma 客户端
npm run prisma:migrate  # 执行数据库迁移
npm run prisma:seed     # 运行种子脚本导入基础数据
npm run prisma:studio   # 打开 Prisma Studio 数据库可视化界面
npm run test            # 运行单元测试
npm run test:watch      # 监听模式运行测试
npm run test:coverage   # 运行测试并生成覆盖率报告
npm run lint            # 代码静态检查
npm run typecheck       # TypeScript 类型检查
```

### 前端命令 (在 `frontend/` 目录下)

```bash
npm run dev             # 启动开发服务器（Vite HMR 热更新）
npm run build           # 构建生产版本
npm run preview         # 预览生产构建结果
npm run lint            # 代码静态检查
npm run typecheck       # TypeScript / Vue 类型检查
```

### Docker 命令 (在项目根目录下)

```bash
docker compose up -d --build   # 构建并启动所有服务（后台运行）
docker compose up -d           # 启动所有服务（不重新构建）
docker compose down            # 停止所有服务
docker compose down -v         # 停止服务并删除数据卷
docker compose ps              # 查看服务状态
docker compose logs -f         # 查看实时日志
docker compose restart backend # 重启后端服务
```

### 数据库命令

```bash
# 打开 Prisma Studio（浏览器数据库管理）
cd backend && npx prisma studio

# 重置数据库（清空所有数据并重新迁移）
cd backend && npx prisma migrate reset

# 查看迁移状态
cd backend && npx prisma migrate status
```

---

## 八、常见问题排查

### 1. MySQL 连接失败

**错误**: `Can't connect to MySQL server` 或 `Access denied`

**解决方法**:
```bash
# Windows - 确认 MySQL 服务已启动
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql

# 验证连接
mysql -u root -p -e "SELECT 1"
```

确认 `backend/.env` 中的 `DATABASE_URL` 用户名密码正确。

### 2. 端口被占用

**错误**: `EADDRINUSE: address already in use :::3000`

**解决方法**:
```bash
# Windows - 查找占用端口的进程
netstat -ano | findstr :3000
# 终止进程
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

或者在 `backend/.env` 中修改 `PORT` 为其他端口。

### 3. Prisma 客户端错误

**错误**: `@prisma/client did not initialize yet`

**解决方法**:
```bash
cd backend
npx prisma generate
```

### 4. 数据库迁移失败

**错误**: `Migration failed` 或表已存在

**解决方法**:
```bash
# 重置数据库（⚠️ 会清空所有数据）
cd backend
npx prisma migrate reset

# 然后重新导入测试数据
mysql -u root -p hospital_db < prisma/test_data.sql
```

### 5. 前端无法连接后端 API

**现象**: 页面显示网络错误或 CORS 错误

**排查步骤**:
1. 确认后端已启动并运行在 `http://localhost:3000`
2. 检查 `backend/.env` 中 `CORS_ORIGIN` 是否包含前端地址
3. 确认 `frontend/vite.config.ts` 中代理配置正确
4. 浏览器控制台查看具体错误信息

### 6. npm install 失败

**解决方法**:
```bash
# 清除缓存重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 如果网络问题，使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 7. Docker 构建失败

**解决方法**:
```bash
# 清除 Docker 构建缓存
docker compose build --no-cache

# 确保 Docker 服务正在运行
docker info
```

---

## 九、生产部署注意事项

> ⚠️ 以下是将系统部署到生产环境时的安全建议，开发阶段可忽略。

1. **更改所有默认密钥**
   ```bash
   # 生成安全的 JWT 密钥
   openssl rand -base64 32
   ```

2. **使用强密码** — 修改 MySQL root 密码和所有默认账户密码

3. **启用 HTTPS** — 配置 SSL/TLS 证书

4. **限制 CORS** — 将 `CORS_ORIGIN` 设置为实际前端域名

5. **调整速率限制** — 根据实际流量设置合理的请求频率限制

6. **启用数据库备份** — 配置 MySQL 定期自动备份

7. **设置日志轮转** — 配置 winston 日志文件大小限制和轮转策略

8. **环境隔离** — 确保 `NODE_ENV=production`，关闭调试日志

---

## 📎 相关文档

| 文档 | 说明 |
|------|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | 🏗 系统架构设计 |
| [API_REFERENCE.md](API_REFERENCE.md) | 📡 API 接口文档 |
| [USER_GUIDE.md](USER_GUIDE.md) | 📖 用户使用手册 |
| [ROLE_MANAGEMENT.md](ROLE_MANAGEMENT.md) | 🔐 角色权限管理 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 🚀 部署指南 |

---

> 📝 最后更新: 2026-02-09
