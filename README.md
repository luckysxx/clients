# clients

前端客户端仓库，采用 **一个 Git 仓库维护多个应用** 的方式。

当前仓库定位是：

- `web`：Web 端 monorepo，承载多个前端应用和共享包
- `mobile`：预留给未来移动端客户端

这不是“一个 app 一个仓库”的拆法，而是更接近团队协作里的前端 monorepo 结构。

---

## 为什么这样维护

这个仓库里会有多个客户端应用，但它们通常会共享很多前端基础设施：

- 鉴权流程
- 请求封装
- 类型定义
- SSO 逻辑
- 通用 UI 和工具函数

如果每个 app 各自一个仓库，后面维护共享逻辑会很容易出现：

- 重复实现
- 升级不同步
- 一次改动要跨多个仓库提交

所以当前选择是：

- **Git 维度**：`clients` 一个独立仓库
- **工程维度**：多个应用 + 多个共享包

---

## 当前目录结构

```text
clients/
├── web/
│   ├── apps/
│   │   ├── user-platform/
│   │   ├── go-note/
│   │   └── go-chat/
│   ├── packages/
│   │   ├── auth/
│   │   ├── request/
│   │   ├── shared/
│   │   ├── types/
│   │   └── ui/
│   ├── package.json
│   ├── pnpm-workspace.yaml
│   └── README.md
└── mobile/
    └── README.md
```

含义：

- `web/apps/`：面向最终用户的具体前端应用
- `web/packages/`：跨应用复用的共享包
- `mobile/`：未来移动端工程入口，当前还未正式脚手架化

---

## 目录约定

### 什么放进 `apps/`

放“能独立运行”的业务应用，例如：

- 用户中心前端
- 笔记前端
- 聊天前端

判断标准：

- 有自己的页面路由
- 有自己的入口文件
- 可以单独 `dev/build`

---

### 什么放进 `packages/`

放“多个 app 都可能共用”的能力，例如：

- `auth`：登录态、token 刷新、路由守卫
- `request`：HTTP 请求封装
- `types`：共享类型定义
- `shared`：通用业务常量、存储工具、SSO 辅助逻辑
- `ui`：共享组件或 UI 抽象

判断标准：

- 至少两个 app 会复用
- 不应该绑死某一个 app 的页面结构
- 能被明确命名成一个独立能力

如果某段代码只服务单一 app，就优先留在 app 内，别过早抽包。

---

## 当前状态

### `web`

`web` 已经是一个实际运行中的 pnpm workspace。

当前活跃应用：

- `apps/user-platform`
- `apps/go-note`

预留应用：

- `apps/go-chat`

当前共享包：

- `packages/auth`
- `packages/request`
- `packages/shared`
- `packages/types`
- `packages/ui`

详细说明见 [web/README.md](/Users/luckys/Code/Project/clients/web/README.md)。

### `mobile`

当前只是预留目录，还没有正式移动端脚手架。

详细说明见 [mobile/README.md](/Users/luckys/Code/Project/clients/mobile/README.md)。

---

## 常用命令

当前命令主要在 `web` 工作区执行：

```sh
cd clients/web
pnpm install
pnpm dev:user-platform
pnpm dev:go-note
pnpm build
pnpm lint
pnpm type-check
```

如果未来 `mobile` 正式接入，再补它自己的启动命令和工程说明。

---

## Git 维护建议

这个仓库建议按“一个仓库，多应用”的方式维护。

### 提交信息建议

可以在提交信息里带上范围，便于以后回看历史：

- `feat(user-platform-web): add sso callback page`
- `fix(go-note-web): handle 401 refresh retry`
- `refactor(shared-auth): unify token storage`
- `docs(clients): update monorepo structure`

这样即使是一个仓库，也能很清楚地看出改动影响的是哪个 app 或哪个共享包。

### 什么时候考虑拆仓

暂时不建议拆。

只有当出现下面情况时，再考虑把某部分单独拆成新仓库：

- Web 和 Mobile 已经完全独立演化
- 团队边界和权限边界明显分开
- 发布节奏差异非常大
- 仓库体量和 CI 成本明显过高

在当前阶段，`clients` 作为一个独立仓库会更省心。

---

## 维护原则

1. 新增页面型应用，优先放 `web/apps/`
2. 出现跨 app 复用，再抽到 `web/packages/`
3. 不要为了“看起来高级”过早抽共享包
4. 每次结构变化后，同步更新 README
5. 客户端层的工程变动，尽量和 `docs` 中相关笔记保持一致

---

## 一句话总结

`clients` 仓库的目标不是“堆很多前端代码”，而是把多个客户端应用和共享能力放在一个清晰、可演进、方便协作的结构里长期维护。
