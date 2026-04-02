# go-note Web 待做清单

本文档用于追踪 `clients/web/apps/go-note` 当前已预留的接口、仍待实现的后端能力，以及页面侧尚未接入的功能。

状态说明：

- `已完成`：前端 API 封装或页面逻辑已经落地
- `已预留`：前端 API 方法已创建，但后端或页面未接入完成
- `未开始`：尚未落地 API 封装或页面逻辑

## 1. 当前状态总览

### 已完成

- 登录接口封装
- 刷新 Token 接口封装
- 退出登录接口封装
- 我的片段列表接口
- 片段详情接口
- 创建片段接口
- 更新片段接口
- SSO 回跳处理

### 已预留

- 删除片段接口
- 最近访问列表接口
- 与我共享列表接口
- 收藏列表接口
- 搜索接口
- 收藏 / 取消收藏接口
- 分组增删改查接口
- 标签查询 / 创建 / 删除接口
- 模板列表 / 模板详情接口
- 从模板创建片段接口
- 文件上传转草稿接口
- 公开片段详情接口

### 未开始

- 删除确认弹窗与交互
- 收藏入口与收藏态展示
- 最近访问真实数据接入
- 与我共享页面
- 自定义分组页面
- 标签管理页面
- 模板库页面
- 上传文件流程
- 匿名公开片段访问页
- 公开分享链接页
- 列表分页、后端筛选、排序

## 2. 已落地 API 文件

当前接口已收口到以下文件：

- `src/api/user.ts`
- `src/api/snippet.ts`

说明：

- 已使用接口和预留接口都先统一放在 API 层
- 预留接口采用的是前端建议契约，后端实现时可以对齐这份约定
- 若网关最终路径调整，需要同步修改 `API.md` 和本文件

## 3. 待后端补齐的接口

以下接口目前前端已预留，但网关和下游服务尚未实现：

### 3.1 片段扩展能力

- `DELETE /api/v1/notes/snippets/:id`
- `GET /api/v1/notes/snippets/search`
- `GET /api/v1/notes/public/snippets/:id`
- `POST /api/v1/notes/snippets/:id/favorite`
- `DELETE /api/v1/notes/snippets/:id/favorite`
- `POST /api/v1/notes/snippets/from-template`

### 3.2 工作区列表能力

- `GET /api/v1/notes/me/snippets/recent`
- `GET /api/v1/notes/me/snippets/shared`
- `GET /api/v1/notes/me/snippets/favorites`

### 3.3 分组与标签

- `GET /api/v1/notes/groups`
- `POST /api/v1/notes/groups`
- `PUT /api/v1/notes/groups/:id`
- `DELETE /api/v1/notes/groups/:id`
- `GET /api/v1/notes/tags`
- `POST /api/v1/notes/tags`
- `DELETE /api/v1/notes/tags/:id`

### 3.4 模板与上传

- `GET /api/v1/notes/templates`
- `GET /api/v1/notes/templates/:id`
- `POST /api/v1/notes/uploads`

## 4. 待页面接入的功能

这些功能在 UI 中已有占位文案或交互入口，但还没有接真实接口：

### 首页

- 筛选
- 显示设置
- 卡片视图
- 上传本地文件
- 模板库
- 最近访问 Tab
- 与我共享 Tab
- 收藏 Tab
- 自定义分组

### 顶部与侧边栏

- 全局搜索
- 分享工作区
- 消息中心
- 应用中心
- 个人中心
- 工作区导航
- 置顶文档快捷入口

### 详情页 / 编辑页

- 收藏操作
- 删除操作
- 公开分享
- 基于模板新建
- 标签与分组编辑

## 5. 建议的推进顺序

推荐先按下面顺序推进，联调成本最低：

1. 删除片段接口与删除交互
2. 搜索接口，把首页本地搜索升级为后端搜索
3. 最近访问 / 收藏 / 与我共享列表
4. 模板库与上传草稿
5. 分组和标签
6. 公开访问与分享链路

## 6. 联调注意事项

### 6.1 网关返回格式

建议新增接口继续保持：

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

原因：

- 当前前端请求层依赖统一 envelope 解包
- 如果返回格式变化，会影响整个 app 的错误处理逻辑

### 6.2 空响应问题

当前前端请求层默认要求 `data !== null`。

因此新增删除、取消收藏这类接口时，建议不要返回空值，推荐返回：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 123
  }
}
```

或：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "snippet_id": 123,
    "favorite": false
  }
}
```

这样可以直接复用现有请求层，不需要改动全局封装。
