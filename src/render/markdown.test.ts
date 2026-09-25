import { expect, it } from 'vitest'
import { renderMarkdown } from './markdown'
it('renders markdown while removing executable HTML and external image requests', async () => {
  const html = await renderMarkdown('**hello**\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n![preview](https://example.test/image.png)')
  expect(html).toContain('<strong>hello</strong>')
  expect(html).not.toContain('<script>')
  expect(html).not.toContain('href="javascript:')
  expect(html).not.toContain('<img')
  expect(html).toContain('href="https://example.test/image.png"')
})
