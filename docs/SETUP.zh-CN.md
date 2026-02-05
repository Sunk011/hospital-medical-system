# 医院病历管理系统 - 设置指南

## 前置要求

在开始之前，请确保已安装以下软件：

- **Node.js**: v20.x LTS 或更高版本
- **MySQL**: v8.x 或更高版本
- **npm**: v10.x 或更高版本（随 Node.js 一起提供）

## 快速启动

### 1. 数据库设置

首先，创建 MySQL 数据库：

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 退出 MySQL
exit;
```

### 2. 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖（如果已有 node_modules 则已完成）
npm install

# 配置环境变量
# 编辑 .env 文件并使用您的 MySQL 凭据更新 DATABASE_URL
# 默认值: DATABASE_URL="mysql://root:password@localhost:3306/hospital_db"

# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

# 使用初始数据填充数据库
npm run prisma:seed

# 启动后端服务器
npm run dev
```

后端服务器将在 **http://localhost:3000** 启动

### 3. 前端设置

打开新的终端窗口：

```bash
# 进入前端目录
cd frontend

# 安装依赖（如果已有 node_modules 则已完成）
npm install

# 启动前端开发服务器
npm run dev
```

前端将在 **http://localhost:5173** 启动

### 4. 访问应用

在浏览器中打开：
- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3000/api/v1

## 演示账户

填充数据库后，您可以使用以下账户登录：

| 角色 | 用户名 | 密码 | 描述 |
|------|----------|----------|-------------|
| 管理员 | `admin` | `admin123` | 系统管理员 |
| 医生 | `doctor1` | `doctor123` | 医生 - 内科 |
| 护士 | `nurse1` | `nurse123` | 护士 |
| 前台 | `reception1` | `reception123` | 前台接待 |

## 项目结构

```
hospital-medical-system/
├── backend/                    # 后端 API（Node.js + Express + Prisma）
│   ├── prisma/
│   │   ├── schema.prisma      # 数据库模式
│   │   ├── migrations/        # 数据库迁移
│   │   └── seed.ts            # 种子数据
│   ├── src/
│   │   ├── config/            # 配置文件
│   │   ├── controllers/       # 路由控制器
│   │   ├── middlewares/       # Express 中间件
│   │   ├── routes/            # API 路由
│   │   ├── services/          # 业务逻辑
│   │   ├── types/             # TypeScript 类型
│   │   ├── utils/             # 工具函数
│   │   ├── validators/        # 请求验证器
│   │   └── app.ts             # 应用入口
│   ├── logs/                  # 应用日志
│   ├── uploads/               # 上传的文件
│   ├── .env                   # 环境变量
│   └── package.json
│
└── frontend/                   # 前端应用（Vue 3 + TypeScript）
    ├── src/
    │   ├── api/               # API 服务层
    │   ├── assets/            # 静态资源
    │   ├── components/        # Vue 组件
    │   ├── layouts/           # 布局组件
    │   ├── router/            # Vue Router 配置
    │   ├── stores/            # Pinia 存储
    │   ├── styles/            # 全局样式
    │   ├── types/             # TypeScript 类型
    │   ├── utils/             # 工具函数
    │   ├── views/             # 页面组件
    │   ├── App.vue            # 根组件
    │   └── main.ts            # 应用入口
    ├── public/                # 公共静态文件
    └── package.json
```

## 可用脚本

### 后端

```bash
npm run dev          # 启动开发服务器，支持热重载
npm run build        # 将 TypeScript 编译为 JavaScript
npm start            # 启动生产服务器
npm run prisma:seed  # 使用初始数据填充数据库
npm run prisma:studio # 打开 Prisma Studio（数据库 GUI）
```

### 前端

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
```

## API 文档

### 基础 URL
```
http://localhost:3000/api/v1
```

### 认证端点

#### 登录
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

响应:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "name": "系统管理员",
      "role": "ADMIN",
      "email": "admin@hospital.com",
      "phone": "13800138000",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 获取资料
```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

#### 登出
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

#### 修改密码
```http
PUT /api/v1/auth/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

注意: 新密码必须包含至少一个小写字母、一个大写字母和一个数字。

#### 刷新令牌
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 数据库模式

系统包含以下表：

1. **users** - 系统用户（管理员、医生、护士、前台）
2. **departments** - 医院科室
3. **doctors** - 医生档案
4. **patients** - 患者信息
5. **medical_records** - 病历
6. **prescriptions** - 处方详情
7. **attachments** - 病历的文件附件
8. **operation_logs** - 系统操作日志

## 环境变量

### 后端（.env）

```env
# 服务器配置
NODE_ENV=development
PORT=3000

# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/hospital_db"

# JWT 配置
JWT_SECRET=hospital-medical-system-jwt-secret-key-2024
JWT_EXPIRES_IN=2h
JWT_REFRESH_SECRET=hospital-medical-system-refresh-secret-key-2024
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt 配置
BCRYPT_ROUNDS=10

# CORS 配置
CORS_ORIGIN=http://localhost:5173

# 速率限制
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 前端（.env.development）

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_TITLE=医院病历管理系统
```

## 故障排除

### 数据库连接问题

如果遇到数据库连接错误：

1. 验证 MySQL 正在运行:
   ```bash
   # Windows
   net start MySQL80

   # Linux/Mac
   sudo systemctl start mysql
   ```

2. 检查 `backend/.env` 中的数据库凭据
3. 确保数据库 `hospital_db` 存在

### 端口已被占用

如果端口 3000 或 5173 已被使用：

**后端**: 在 `backend/.env` 中更改 `PORT`
**前端**: Vite 将自动尝试下一个可用端口

### Prisma 客户端问题

如果遇到 Prisma 客户端错误：

```bash
cd backend
npx prisma generate
```

### TypeScript 编译错误

```bash
# 后端
cd backend
npm run build

# 前端
cd frontend
npm run build
```

## 安全注意事项

⚠️ **生产环境重要提示**:

1. 更改 `.env` 中的所有默认密码和密钥
2. 使用强 JWT 密钥（使用 `openssl rand -base64 32` 生成）
3. 启用 HTTPS
4. 配置适当的 CORS 源
5. 设置速率限制
6. 启用数据库备份
7. 审查和更新安全头部

## 下一步

成功设置后，您可以：

1. **探索仪表板**: 登录并浏览界面
2. **测试 API 端点**: 使用 Postman 或 curl 测试 API
3. **查看数据库**: 在后端目录中运行 `npm run prisma:studio`
4. **阅读文档**: 查看 `README.md` 了解详细的项目信息
5. **开始开发**: 开始实施第二阶段功能（患者管理、病历等）

## 支持

如有问题或疑问：
- 查看主 `README.md` 了解项目文档
- 查看源文件中的代码注释
- 检查 `backend/logs/` 目录中的日志

## 许可证

本项目用于教育和演示目的。
