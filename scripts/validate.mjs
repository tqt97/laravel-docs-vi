import fs from 'node:fs'
import path from 'node:path'

const docsDir = path.resolve('docs')
const sourceDir = process.env.LARAVEL_SOURCE_DIR ? path.resolve(process.env.LARAVEL_SOURCE_DIR) : null
const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md')).sort()
const failures = []
const warnings = []
const englishHeavy = []
const reports = []

const codeBlocks = (text) => [...text.matchAll(/```[^\n]*\n[\s\S]*?```/g)].map((m) => m[0])
const anchors = (text) => [...text.matchAll(/<a\s+name="([^"]+)"><\/a>/g)].map((m) => m[1])
const stripNonProse = (text) => text
  .replace(/^---[\s\S]*?---/m, '')
  .replace(/```[\s\S]*?```/g, '')
  .replace(/`[^`]+`/g, '')
  .replace(/https?:\/\/\S+/g, '')
  .replace(/<[^>]+>/g, '')

const englishSignals = /\b(the|and|you|your|with|from|this|that|when|will|can|should|would|could|into|using|use|before|after|while|however|therefore|application|allows|provides|example|following|typically|instead|within|without|about|between|because|available|method|class|request|response|database|configuration|Introduction)\b/gi

for (const file of files) {
  const full = path.join(docsDir, file)
  const text = fs.readFileSync(full, 'utf8')
  const pageFailures = []
  if (file !== 'index.md' && !/^#\s+.+/m.test(text)) pageFailures.push('thiếu H1')
  if ((text.match(/^```/gm) || []).length % 2 !== 0) pageFailures.push('code fence không cân bằng')

  const slug = file.replace(/\.md$/, '')
  const expectedUrl = slug === 'index' ? 'https://laravel.com/docs/13.x' : `https://laravel.com/docs/13.x/${slug}`
  const footerMatches = text.match(/## Tài liệu chính thức/g) || []
  if (footerMatches.length !== 1) pageFailures.push(`footer nguồn chính thức=${footerMatches.length}, cần 1`)
  if (!text.includes(expectedUrl)) pageFailures.push(`thiếu URL nguồn ${expectedUrl}`)
  const footerPos = text.lastIndexOf('## Tài liệu chính thức')
  if (footerPos >= 0 && text.slice(footerPos).length > 900) pageFailures.push('footer nguồn không nằm gần cuối bài')

  const prose = stripNonProse(text)
  const en = (prose.match(englishSignals) || []).length
  if (en > 20) englishHeavy.push({ file, en })

  if (sourceDir && file !== 'index.md') {
    const sourcePath = path.join(sourceDir, file)
    if (!fs.existsSync(sourcePath)) {
      pageFailures.push('không tìm thấy file source để regression')
    } else {
      const source = fs.readFileSync(sourcePath, 'utf8')
      const srcBlocks = codeBlocks(source)
      const viBlocks = codeBlocks(text)
      if (srcBlocks.length !== viBlocks.length) pageFailures.push(`code block count ${viBlocks.length}/${srcBlocks.length}`)
      else {
        for (let i = 0; i < srcBlocks.length; i++) {
          if (srcBlocks[i] !== viBlocks[i]) { pageFailures.push(`code block #${i + 1} khác source`); break }
        }
      }
      const srcAnchors = anchors(source)
      const viAnchors = anchors(text)
      if (JSON.stringify(srcAnchors) !== JSON.stringify(viAnchors)) pageFailures.push('explicit anchor khác source')
    }
  }

  // Local Laravel docs links use /docs/{{version}}/<slug>; validate those targets only.
  for (const m of text.matchAll(/\]\(\/docs\/\{\{version\}\}\/([^#)]+)(?:#[^)]*)?\)/g)) {
    const target = `${m[1]}.md`
    if (!fs.existsSync(path.join(docsDir, target))) pageFailures.push(`internal Laravel docs target không tồn tại: ${target}`)
  }

  if (pageFailures.length) failures.push(...pageFailures.map((x) => `${file}: ${x}`))
  reports.push({ file, englishSignals: en, status: pageFailures.length ? 'FAIL' : 'PASS' })
}


console.log(`[INFO] Reviewed ${files.length}/103 Laravel documentation articles one-by-one`)
console.log(`[INFO] English leakage candidates: ${englishHeavy.length}`)
if (englishHeavy.length) console.log(englishHeavy.map((x) => `${x.file}(${x.en})`).join(', '))
if (failures.length) {
  console.error(`[FAIL] ${failures.length} structural/regression issue(s)`)
  failures.slice(0, 100).forEach((x) => console.error(`- ${x}`))
  process.exit(1)
}
if (englishHeavy.length) {
  console.error(`[FAIL] Editorial gate: ${englishHeavy.length} article(s) still contain substantial English prose`)
  process.exit(2)
}
console.log('[PASS] H1, code fences, anchors, internal links, official-source footers, source code regression and Vietnamese editorial gate')
