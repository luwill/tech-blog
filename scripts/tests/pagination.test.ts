import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server'
import { MAX_QUERY_OFFSET } from '../../src/lib/pagination'

const queries: Array<{ take: number; skip: number; where: { published: boolean } }> = []
// db.ts 首先使用全局客户端；这里明确替换为内存实现，绝不创建数据库连接。
Object.assign(globalThis, {
  prisma: {
    post: {
      findMany: async (query: typeof queries[number]) => {
        queries.push(query)
        return [{ title: 'fixture', tags: [] }]
      },
      count: async () => 1,
    },
  },
})

test('search pagination remains finite and bounded for malformed requests', async () => {
  const { GET } = await import('../../src/app/api/search/route')
  for (const [value, expected] of [['abc', 10], ['0', 1], ['-3', 1], ['999', 50], ['12.5', 10], ['10x', 10], ['1e309', 10], ['999999999999999999', 10], ['12', 12]] as const) {
    const response = await GET(new NextRequest(`http://localhost/api/search?q=fixture&limit=${value}&offset=abc`))
    assert.equal(response.status, 200)
    const data = await response.json()
    assert.equal(data.data.pagination.limit, expected)
    assert.equal(data.data.pagination.offset, 0)
    assert.ok(Number.isFinite(data.data.pagination.totalPages))
    assert.ok(Number.isFinite(data.data.pagination.currentPage))
    assert.deepEqual({ take: queries.at(-1)?.take, skip: queries.at(-1)?.skip }, { take: expected, skip: 0 })
    assert.equal(queries.at(-1)?.where.published, true)
  }
  const response = await GET(new NextRequest('http://localhost/api/search?q=fixture&offset=9999999999'))
  assert.equal((await response.json()).data.pagination.offset, MAX_QUERY_OFFSET)
  assert.equal((await GET(new NextRequest('http://localhost/api/search'))).status, 400)
})

test('posts page/limit use the same safeguards and never overflow skip', async () => {
  const { GET } = await import('../../src/app/api/posts/route')
  for (const params of ['page=abc&limit=abc', 'page=-1&limit=0', 'page=9999999999&limit=50', 'page=1e309&limit=1e309']) {
    const response = await GET(new NextRequest(`http://localhost/api/posts?${params}`))
    assert.equal(response.status, 200)
    const query = queries.at(-1)!
    assert.ok(Number.isSafeInteger(query.skip) && query.skip >= 0 && query.skip <= MAX_QUERY_OFFSET)
    assert.ok(query.take >= 1 && query.take <= 50)
    assert.equal(query.where.published, true)
  }
})
