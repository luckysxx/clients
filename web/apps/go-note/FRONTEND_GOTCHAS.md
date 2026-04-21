# Frontend Guidelines & Recurring Gotchas

This document records recurring technical issues, anti-patterns, and project-specific best practices encountered during the development of Go-Note's frontend. 

**All contributors (including AI assistants) MUST read and heed these guidelines to prevent relapsing into old bugs.**

---

## 1. 🚨 JavaScript 精度丢失问题 (Snowflake IDs)

**问题现象：**
后端使用 64 位整数 (`int64`) 的 Snowflake IDs 作为主键（如 `id: 1845115264359055361`）。当此 ID 通过 JSON 传递给前端时，如果将其解析为 JavaScript 原生 `Number`，会超出 `Number.MAX_SAFE_INTEGER` (53 bits)，导致后几位被截断篡改，进而导致页面跳转、数据更新等操作的 ID 匹配失败（如 404 Not Found 或是数据错乱）。

**防范守则与最佳实践：**
- **网络层封装**：API 层已经将大数（BigInt）安全地转换为 `string`，或者通过配置使后端的序列化强制返回字符串形式。
- **TypeScript 类型**：所有需要保存 ID 的接口字段，**务必**定义为 `id: string | number`。在组件内部处理和保存时，优先级始终倾向于 `string`。
- **比较 ID：** 永远不要使用 `===` 直接比较路由传参中的 ID 和数据状态库里的 ID（它们可能一个是字符串一个是数字）。**必须使用共享包提供的 `isSameId` 工具函数**：
  ```typescript
  import { isSameId } from '@clients/shared'
  
  // ❌ 错误示范：
  if (route.query.group_id === activeGroup.id) { ... }
  
  // ✅ 正确示范：
  if (isSameId(route.query.group_id, activeGroup.id)) { ... }
  ```

---

## 2. 🚨 UI 数据更新时的“防闪烁” (Anti-Flash States)

**问题现象：**
在进行分页加载、重新排序、或者条件过滤时，开发者经常在调用网络请求前习惯性地做一次数据清理：
```typescript
// ❌ 错误示范：导致极其难看的 “这里还没有文档” 闪烁现象
const resetAndFetch = async () => {
  snippets.value = [] // 这里触发了 DOM 的清空，暴露出无数据的 Empty State 插画
  await fetchSnippets() // 网络请求需要几十到上百毫秒，期间页面在一直闪
}
```

**防范守则与最佳实践：**
- **保留旧视图等新视图**：在发起异步更新请求之前，**绝对不要**因为要换数据就去同步地清空主要状态数组。应该通过专门的 `loading` 骨架屏状态或视图过渡逻辑来接管用户的视线。
- **复用过渡系统**：对于列表数据的更迭（如搜索、切分组、切标签、切排序），统一将响应式变量挂载到 `switchContext` 的 `watch` 里。
  ```typescript
  // ✅ 正确示范：使用通用的平滑过渡逻辑
  // 哪怕是切换 sortBy，也是让视图瞬间隐藏 -> 默默拿到数据 -> 滑入新数据，掩盖请求延迟。
  watch([groupId, selectedTagIds, keyword, sortBy], switchContext, { immediate: true })
  ```

---

## 3. 💅 UI 构建与 Tailwind Css v4 现代语法

**问题现象：**
在演进 UI 过程中，很容易遗留旧的 Element Plus 风格代码，或者滥用难以维护的 Tailwind 随意值 (Arbitrary values) 语法（如 `bg-[#ffffff]`）。

**防范守则与最佳实践：**
1. **排斥 arbitrary values**：禁止写 `h-[14px]`，应当寻找最贴合的 `h-3.5` 等原生设计系统里的 token。
2. **极简 SaaS 审美**：
   - 弃用大量强烈的实线 `border-gray-200`，改用带有通透感的透明度黑白：`border-black/6`、`bg-black/4`，使组件更好的融入各种主题色或深色模式。
   - 使用微动画反馈（如 `transition-all duration-150` 并搭配轻微的位移或阴影来响应 hover）。
3. **数据标签状态：** 使用 `ui-button` 或等特制的基础类名来取代繁琐的 utility class 堆砌。

---

> 📝 **维护注记：** 
> *无论你是新接手的同事还是正在辅助的 AI，在处理 Go-Note 前端的组件交互或数据模型时，请以此文档作为审查自己代码的 Checklist 之一。* 
