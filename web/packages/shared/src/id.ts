export type SnowflakeId = string

/**
 * 安全比较两个 ID，不受其类型影响（number 或 string 都可）。
 * 这可以避免 64 位 Snowflake ID 在与 JSON 解析出的原生 Number
 * 进行比较时出现安全整数截断问题。
 */
export const isSameId = (a: any, b: any): boolean => {
  if (a == null && b == null) return true
  if (a == null || b == null) return false
  return String(a) === String(b)
}

/**
 * 安全地将路由查询参数或原始输入解析为 Snowflake ID 字符串。
 */
export const parseRouteId = (val: any): SnowflakeId | undefined => {
  if (val == null || val === '') return undefined
  return String(Array.isArray(val) ? val[0] : val)
}
