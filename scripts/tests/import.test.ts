import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { parseFrontmatter } from '../../src/lib/frontmatter'

async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), 'tech-blog-regression-'))
  const guard = join(dir, 'guard.mjs')
  await writeFile(guard, `
    globalThis.fetch = async () => { throw new Error('NETWORK_BLOCKED') };
    globalThis.prisma = new Proxy({}, { get: (_, key) => {
      if (key === '$disconnect') return async () => {};
      throw new Error('DATABASE_BLOCKED');
    }});
  `)
  const run = (script: string, args: string[]) => spawnSync(process.execPath, [
    '--import', 'tsx', '--import', guard, script, ...args,
  ], {
    cwd: process.cwd(), encoding: 'utf8', timeout: 20_000,
    env: { PATH: process.env.PATH, NODE_ENV: 'test', BLOB_READ_WRITE_TOKEN: 'test-placeholder' },
  })
  return { dir, run }
}

test('failed convert and preview output cannot reach the publishing database', async () => {
  const { dir, run } = await fixture()
  const manifest = JSON.parse(await readFile('scripts/wechat-import/manifest.json', 'utf8'))
  const post = manifest.posts[0]
  await writeFile(join(dir, post.file), '---\ntitle: fixture\ndate: 2026-10-28\n---\n![img](https://example.invalid/image.png)')
  const out = join(dir, 'out')
  const args = ['convert', '--vault', dir, '--out', out, '--only', post.slug]
  const failed = run('scripts/wechat-import/import.ts', args)
  assert.equal(failed.status, 1, failed.stderr)
  const target = join(out, `${post.slug}.md`)
  const failure = await readFile(target, 'utf8')
  assert.equal(parseFrontmatter(failure).frontmatter.published, false)
  assert.equal(parseFrontmatter(failure).frontmatter.importStatus, 'failed')
  const preview = run('scripts/wechat-import/import.ts', [...args, '--dry-run'])
  assert.equal(preview.status, 0, preview.stderr)
  assert.equal(await readFile(target, 'utf8'), failure)
  for (const file of [target, join(out, 'preview', `${post.slug}.md`)]) {
    for (const flag of ['--dry-run', '--draft']) {
      const publish = run('scripts/post-cli.ts', ['publish', file, flag])
      assert.equal(publish.status, 1)
      assert.match(publish.stderr, /complete image conversion/)
      assert.doesNotMatch(publish.stderr, /DATABASE_BLOCKED/)
    }
  }
})

test('rehost preserves metadata, rejects failures, and accepts fully cached images', async () => {
  const { dir, run } = await fixture()
  const file = join(dir, 'fixture.md')
  const url = 'https://example.invalid/image.png'
  const blob = 'https://test.public.blob.vercel-storage.com/image.webp'
  const raw = `---\ntitle: fixture\nslug: fixture\npublished: true\ncustom: keep\nexcerpt: '![img](${url})'\n---\nfixture\n\n![img](${url})`
  await writeFile(file, raw)
  const failed = run('scripts/wechat-import/import.ts', ['rehost', file, '--out', join(dir, 'failed')])
  assert.equal(failed.status, 1)
  assert.equal(parseFrontmatter(await readFile(join(dir, 'failed', 'fixture.md'), 'utf8')).frontmatter.importStatus, 'failed')
  const out = join(dir, 'ready')
  await mkdir(out)
  await writeFile(join(out, 'image-map.json'), JSON.stringify({ [url]: blob }))
  const success = run('scripts/wechat-import/import.ts', ['rehost', file, '--out', out])
  assert.equal(success.status, 0, success.stderr)
  const result = await readFile(join(out, 'fixture.md'), 'utf8')
  const parsed = parseFrontmatter(result)
  assert.equal(parsed.frontmatter.importStatus, 'ready')
  assert.equal(parsed.frontmatter.published, true)
  assert.equal(parsed.frontmatter.excerpt, `![img](${url})`)
  assert.match(parsed.content, /https:\/\/test.public.blob.vercel-storage.com\/image.webp/)
  assert.match(result, /custom: keep/)
  assert.equal(await readFile(file, 'utf8'), raw)
})
