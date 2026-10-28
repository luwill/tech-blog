/** JSON 编码本身不转义 HTML 的 </script>，所有 JSON-LD 输出统一经过此处。 */
export function serializeJsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
