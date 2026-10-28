import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseFrontmatter, toMarkdownFile, validateFrontmatter, markImportStatus } from '../../src/lib/frontmatter'
import { serializeJsonLd } from '../../src/lib/json-ld'
import { generateArticleStructuredData } from '../../src/lib/seo'

test('JSON-LD preserves data without allowing an extra HTML script element', () => {
  const title = '</script><script>globalThis.probe=1</script>中文'
  const data = generateArticleStructuredData({
    title, description: title, content: 'body', publishedAt: '2026-10-28',
    updatedAt: '2026-10-28', slug: 'test', author: title, tags: [title],
  })
  const json = serializeJsonLd(data)
  assert.deepEqual(JSON.parse(json), JSON.parse(JSON.stringify(data)))
  const html = renderToStaticMarkup(createElement('script', {
    type: 'application/ld+json', dangerouslySetInnerHTML: { __html: json },
  }))
  assert.equal((html.match(/<script/g) ?? []).length, 1)
  assert.equal((html.match(/<\/script>/g) ?? []).length, 1)
})

for (const title of ['true', 'false', '123', '引号"，反斜线\\，换行\n制表\t回车\r']) {
  test(`frontmatter roundtrip preserves string: ${JSON.stringify(title)}`, () => {
    const tags = ['a,b', '中文,标签', 'it\'s "quoted"', 'true', 'a\\b']
    const document = toMarkdownFile({
      title, slug: 'demo', createdAt: '2026-10-28', content: '正文', published: true,
      category: { name: '中文分类', slug: 'category' }, tags: tags.map(name => ({ name })),
    })
    const parsed = parseFrontmatter(document)
    assert.equal(parsed.frontmatter.title, title)
    assert.deepEqual(parsed.frontmatter.tags, tags)
    assert.equal(parsed.frontmatter.categorySlug, 'category')
    assert.equal(parsed.frontmatter.published, true)
    assert.equal(parsed.content, '正文')
    assert.equal(validateFrontmatter(parsed.frontmatter).isValid, true)
  })
}

test('YAML handles comments, single-quoted escapes and block lists', () => {
  const { frontmatter } = parseFrontmatter("---\ntitle: 'it''s valid'\ndate: 2026-10-28\npublished: true # note\ntags:\n  - 'a,b'\n  - \"true\"\n---\nbody")
  assert.equal(frontmatter.title, "it's valid")
  assert.equal(frontmatter.published, true)
  assert.deepEqual(frontmatter.tags, ['a,b', 'true'])
})

test('invalid field types, duplicate keys and aliases fail before publishing', () => {
  for (const fields of ['title: true', 'title: valid\npublished: "false"', 'title: valid\ntags: text', 'title: a\ntitle: b', 'title: &name test\nexcerpt: *name']) {
    assert.throws(() => parseFrontmatter(`---\n${fields}\n---\nbody`))
  }
  assert.equal(validateFrontmatter({ title: true } as never).isValid, false)
})

test('import state preserves custom metadata and makes failures/previews drafts', () => {
  const raw = '---\ntitle: fixture\ncustom: keep-me\npublished: true\n---\nbody'
  for (const state of ['failed', 'preview'] as const) {
    const marked = markImportStatus(raw, state)
    assert.match(marked, /custom: keep-me/)
    assert.equal(parseFrontmatter(marked).frontmatter.importStatus, state)
    assert.equal(parseFrontmatter(marked).frontmatter.published, false)
  }
  assert.equal(parseFrontmatter(markImportStatus(raw, 'ready')).frontmatter.published, true)
})
