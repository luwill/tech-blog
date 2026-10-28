/** 非整数字符串使用默认值；有效整数按查询边界钳制。 */
export function paginationInteger(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  if (raw === null || !/^-?\d+$/.test(raw)) return fallback
  const value = Number(raw)
  if (!Number.isSafeInteger(value)) return fallback
  return Math.min(Math.max(value, min), max)
}

export const MAX_QUERY_OFFSET = 2_147_483_647
