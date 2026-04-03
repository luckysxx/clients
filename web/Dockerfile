# syntax=docker/dockerfile:1

# ======== 阶段 1：依赖安装 ========
FROM docker.m.daocloud.io/library/node:22-alpine AS deps

# 启用 corepack 内置的 pnpm（无需额外安装）
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

WORKDIR /app

# 先只拷贝依赖清单，最大化利用 Docker 层缓存
# 只要这些文件没变，下面的 pnpm install 就会命中缓存
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# 拷贝每个子包的 package.json（保持目录结构）
COPY apps/user-platform/package.json apps/user-platform/
COPY apps/go-note/package.json       apps/go-note/
COPY apps/go-chat/package.json       apps/go-chat/
COPY packages/ui/package.json        packages/ui/
COPY packages/types/package.json     packages/types/
COPY packages/auth/package.json      packages/auth/
COPY packages/shared/package.json    packages/shared/
COPY packages/request/package.json   packages/request/

# 安装全部依赖
# 这里不用 BuildKit 的 cache mount，兼容服务器上当前的 Docker 构建器。
RUN pnpm install --frozen-lockfile

# ======== 阶段 2：构建指定 App ========
FROM deps AS builder

# 通过构建参数选择要构建的 app（默认 user-platform）
ARG APP_NAME=user-platform
ARG VITE_API_BASE_URL=
ARG VITE_SSO_LOGIN_URL=
ARG VITE_USER_PLATFORM_URL=

# Vite 在构建时会把 VITE_ 前缀的环境变量注入到客户端代码中
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SSO_LOGIN_URL=${VITE_SSO_LOGIN_URL}
ENV VITE_USER_PLATFORM_URL=${VITE_USER_PLATFORM_URL}

WORKDIR /app

# 拷贝全部源码
COPY . .

# 只构建目标 app 及其依赖的 workspace packages
RUN pnpm --filter @clients/app-${APP_NAME}... run build

# ======== 阶段 3：生产镜像（仅 Nginx + 静态文件）========
FROM docker.m.daocloud.io/library/nginx:stable-alpine AS production

# 安全加固：移除默认页面
RUN rm -rf /usr/share/nginx/html/*

# 通过构建参数决定复制哪个 app 的产物和 nginx 配置
ARG APP_NAME=user-platform

# 复制构建产物到 Nginx 静态目录
COPY --from=builder /app/apps/${APP_NAME}/dist /usr/share/nginx/html

# 复制该 app 专属的 Nginx 配置
COPY apps/${APP_NAME}/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
