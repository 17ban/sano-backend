import marked from 'marked'
import createDOMPurify from 'dompurify'
import hljs from 'highlight.js'
import { JSDOM } from 'jsdom'

export function isMarkdown(text: string): boolean {
  const firstLine = text.split('\n')[0]
  const startIndex = firstLine.indexOf('<!--')
  if (startIndex < 0)
    return false
  const endIndex = firstLine.indexOf('-->')
  if (endIndex < 0)
    return false
  const comment = firstLine.slice(startIndex + 4, endIndex)
    .trim()
    .toLowerCase()
  if (!(['md', 'markdown'].includes(comment)))
    return false
  return true
}

const domPurifyWindow = new JSDOM('').window
const domPurify = createDOMPurify(<Window><unknown>domPurifyWindow)

export function markdownToHtml(markdownText: string) {
  const html = marked(markdownText)
  // html purify
  const cleanHtml = domPurify.sanitize(html)
  // code highlight
  const window = new JSDOM(cleanHtml).window
  window.document.querySelectorAll('pre code').forEach((el) => {
    hljs.highlightElement(el as HTMLElement)
  })
  // return the processed html text
  return window.document.body.innerHTML
}
