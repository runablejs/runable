export interface SfcBlockInfo {
  /** Index of the opening `<` of the block's start tag. */
  start: number
  /** Index right after the block's closing tag. */
  end: number
  /** Index right after the opening tag (where `content` begins). */
  contentStart: number
  /** Index of the last character of `content`. */
  contentEnd: number
  content: string
  attrs: string
}

/**
 * Extracts the first `<template>` or the most relevant `<script>` block of
 * a `.vue` SFC using a lightweight regex-based scan (no full HTML/SFC
 * parser). For `<script>`, a `<script setup>` block is preferred over a
 * plain one, matching how components are actually made available to a
 * template.
 */
function findBlock(source: string, tagName: 'template' | 'script'): SfcBlockInfo | null {
  const re = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, 'g')
  let match: RegExpExecArray | null
  let best: SfcBlockInfo | null = null

  while ((match = re.exec(source))) {
    const [full, attrs, content] = match
    const start = match.index
    const end = start + full.length
    const closeTagLen = `</${tagName}>`.length
    const contentEnd = end - closeTagLen
    const contentStart = contentEnd - content.length

    const info: SfcBlockInfo = { start, end, contentStart, contentEnd, content, attrs }

    if (tagName === 'template') return info

    // <script setup> wins immediately; a plain <script> is kept as fallback.
    if (/(^|\s)setup(\s|=|$)/.test(attrs)) return info
    if (!best) best = info
  }

  return best
}

export function parseSfc(source: string): { template: SfcBlockInfo | null; script: SfcBlockInfo | null } {
  return {
    template: findBlock(source, 'template'),
    script: findBlock(source, 'script'),
  }
}

const TAG_RE = /<\/?([A-Za-z][-\w]*)(?=[\s/>])/g

/** Extracts every element tag name found in a `<template>` block's content. */
export function extractTemplateTags(templateContent: string): Set<string> {
  const withoutComments = templateContent.replace(/<!--[\s\S]*?-->/g, '')
  const tags = new Set<string>()
  TAG_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TAG_RE.exec(withoutComments))) {
    tags.add(match[1])
  }
  return tags
}
