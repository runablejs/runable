/**
 * Native HTML and SVG tags: never interpreted as components, even if a
 * user component accidentally shares the same kebab-case name (e.g. avoid
 * a native <button> matching a user component named "Button").
 */
export const HTML_TAGS = new Set([
  // document structure
  'html', 'head', 'body', 'title', 'meta', 'link', 'style', 'script', 'noscript',
  // sections
  'header', 'footer', 'main', 'section', 'article', 'aside', 'nav', 'address',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup',
  // text content
  'div', 'span', 'p', 'a', 'b', 'i', 'u', 's', 'strong', 'em', 'small', 'mark',
  'abbr', 'cite', 'code', 'pre', 'blockquote', 'q', 'sub', 'sup', 'br', 'hr',
  'time', 'data', 'var', 'samp', 'kbd', 'wbr', 'bdi', 'bdo', 'ruby', 'rt', 'rp',
  // lists
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  // tables
  'table', 'caption', 'colgroup', 'col', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th',
  // forms
  'form', 'input', 'textarea', 'button', 'select', 'option', 'optgroup', 'label',
  'fieldset', 'legend', 'datalist', 'output', 'progress', 'meter',
  // media / embedded content
  'img', 'picture', 'source', 'video', 'audio', 'track', 'canvas', 'iframe',
  'embed', 'object', 'param', 'map', 'area',
  // interactive elements
  'details', 'summary', 'dialog', 'menu',
  // misc
  'figure', 'figcaption',
  // SVG (common subset)
  'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse',
  'g', 'defs', 'use', 'symbol', 'text', 'tspan', 'linearGradient', 'radialGradient',
  'stop', 'clipPath', 'mask', 'pattern', 'filter',
])
