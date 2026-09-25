import type MarkdownIt from 'markdown-it'
let renderer: Promise<(source: string) => string> | undefined
export async function renderMarkdown(source: string) {
  renderer ??= buildRenderer()
  return (await renderer)(source)
}
async function buildRenderer() {
  const [{ default: Markdown }, { default: DOMPurify }, { default: hljs }, { default: json }, { default: bash }, { default: diff }] = await Promise.all([
    import('markdown-it'), import('dompurify'), import('highlight.js/lib/core'),
    import('highlight.js/lib/languages/json'), import('highlight.js/lib/languages/bash'), import('highlight.js/lib/languages/diff'),
  ])
  hljs.registerLanguage('json', json); hljs.registerLanguage('bash', bash); hljs.registerLanguage('diff', diff)
  const md: MarkdownIt = new Markdown({ html: false, breaks: true, linkify: true,
    highlight(code, language) { return language && hljs.getLanguage(language) ? hljs.highlight(code, { language }).value : md.utils.escapeHtml(code) },
  })
  // Remote images are links: viewing a transcript must not make third-party requests.
  md.renderer.rules.image = (tokens, index) => {
    const token = tokens[index]
    const url = token.attrGet('src') ?? ''
    return md.validateLink(url) ? `<a href="${md.utils.escapeHtml(url)}" rel="noreferrer">${md.utils.escapeHtml(token.content || url)}</a>` : md.utils.escapeHtml(token.content)
  }
  return (source: string) => DOMPurify.sanitize(md.render(source))
}
