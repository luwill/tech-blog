import assert from 'node:assert/strict'
import { test } from 'node:test'
import sharp from 'sharp'
import { MockAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici'
import { rehostImages } from '../wechat-import/images'

test('native WebP conversion and Blob token upload preserve the existing options', async (t) => {
  const originalDispatcher = getGlobalDispatcher()
  const agent = new MockAgent()
  agent.disableNetConnect()
  setGlobalDispatcher(agent)
  const previousToken = process.env.BLOB_READ_WRITE_TOKEN
  process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_fixture_synthetic'
  t.after(async () => {
    setGlobalDispatcher(originalDispatcher)
    await agent.close()
    if (previousToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN
    else process.env.BLOB_READ_WRITE_TOKEN = previousToken
  })
  const input = await sharp({ create: { width: 1700, height: 100, channels: 3, background: '#336699' } }).png().toBuffer()
  t.mock.method(globalThis, 'fetch', async () => new Response(new Uint8Array(input), {
    headers: { 'content-type': 'image/png' },
  }))
  let uploaded: Buffer | undefined
  let headers: Headers | undefined
  const url = 'https://fixture.public.blob.vercel-storage.com/image.webp'
  agent.get('https://vercel.com').intercept({ path: () => true, method: 'PUT' }).reply((options) => {
    uploaded = Buffer.from(options.body as Uint8Array)
    headers = new Headers(options.headers as Record<string, string>)
    return { statusCode: 200, data: { url, downloadUrl: url, pathname: 'image.webp', contentType: 'image/webp', contentDisposition: 'inline' } }
  })
  const result = await rehostImages('![图片](https://example.invalid/source.png)', 'fixture', {})
  assert.deepEqual(result.failed, [])
  assert.equal(result.uploaded, 1)
  assert.equal(result.content, `![](${url})`)
  assert.equal(headers?.get('authorization'), 'Bearer vercel_blob_rw_fixture_synthetic')
  assert.equal(headers?.get('x-allow-overwrite'), '1')
  assert.equal(headers?.get('x-add-random-suffix'), '0')
  assert.ok(uploaded)
  const metadata = await sharp(uploaded).metadata()
  assert.equal(metadata.format, 'webp')
  assert.equal(metadata.width, 1600)
  agent.assertNoPendingInterceptors()
})
