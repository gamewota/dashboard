import DOMPurify from 'dompurify'

/**
 * Returns sanitized HTML safe to inject via dangerouslySetInnerHTML.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(String(html ?? ''))
}

/**
 * Returns plain-text extracted from HTML. Uses DOMPurify configured to
 * strip all tags; falls back to a simple regex if DOMPurify throws.
 */
export function stripHtml(html: string): string {
  try {
    return DOMPurify.sanitize(String(html ?? ''), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
  } catch {
    return String(html ?? '').replace(/<[^>]*>/g, '')
  }
}

export default sanitizeHtml
