import fs from 'node:fs'
import path from 'node:path'

const docsDir = path.resolve('docs')
const sourceDir = process.env.LARAVEL_SOURCE_DIR ? path.resolve(process.env.LARAVEL_SOURCE_DIR) : null
const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md')).sort()
const failures = []
const editorialCandidates = []
const reports = []
const strictEditorial = process.argv.includes('--strict-editorial')

const codeBlocks = (text) => [...text.matchAll(/```[^\n]*\n[\s\S]*?```/g)].map((m) => m[0])
const anchors = (text) => [...text.matchAll(/<a\s+name="([^"]+)"><\/a>/g)].map((m) => m[1])
const vietnameseChars = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/gi
const englishFunctionWords = new Set('the this that these those you your yours we our they their when where why how with from into should would could can will may might must for of to is are was were be been being have has had do does did not and or but if then else before after while during without within about between because therefore however following typically instead'.split(' '))
const vietnameseFunctionWords = new Set('và hoặc nhưng nếu thì khi bạn chúng ta họ này đó những là được có sẽ với từ trong trên dưới trước sau không về giữa vì do cho để của một các hãy cũng mà như'.split(' '))

function normalizedWords(value) {
  return (value.match(/[A-Za-zÀ-ỹ]+/g) || []).map((word) => word.toLowerCase())
}

function findEnglishProseCandidates(text) {
  const candidates = []
  const lines = text.split(/\r?\n/)
  let inFence = false
  let inFrontmatter = lines[0]?.trim() === '---'

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const trimmed = raw.trim()

    if (i === 0 && inFrontmatter) continue
    if (inFrontmatter) {
      if (trimmed === '---') inFrontmatter = false
      continue
    }
    if (/^```/.test(trimmed) || /^~~~/.test(trimmed)) {
      inFence = !inFence
      continue
    }
    if (inFence || !trimmed) continue
    if (/^<a\s+name=/.test(trimmed) || /^<\/?(?:div|style|script|template|section|aside)\b/.test(trimmed)) continue
    if (/^\|.*\|$/.test(trimmed) || /^[-:| ]+$/.test(trimmed)) continue

    const isHeading = /^#{1,6}\s+/.test(trimmed)
    const cleaned = trimmed
      .replace(/^#{1,6}\s+/, '')
      .replace(/`[^`]*`/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[>*_~]/g, ' ')

    const words = normalizedWords(cleaned)
    if (words.length < 4) continue
    const en = words.filter((word) => englishFunctionWords.has(word)).length
    const vi = words.filter((word) => vietnameseFunctionWords.has(word)).length
    const accents = (cleaned.match(vietnameseChars) || []).length

    // Sentence-like English prose: several English grammar words and almost no Vietnamese signal.
    const englishSentence = words.length >= 8 && en >= 4 && en / words.length >= 0.22 && vi <= 1 && accents <= 2
    // Headings are shorter, so catch phrases such as "When to use this skill" separately.
    const englishHeading = isHeading && words.length >= 4 && en >= 2 && vi === 0 && accents === 0 && !/[`_:]/.test(trimmed)

    if (englishSentence || englishHeading) {
      candidates.push({ line: i + 1, text: cleaned.trim() })
    }
  }

  return candidates
}

const themeIndex = fs.readFileSync(path.join(docsDir, '.vitepress/theme/index.ts'), 'utf8')
const noticePath = path.join(docsDir, '.vitepress/theme/components/LearningNotice.vue')
if (!fs.existsSync(noticePath)) failures.push('theme: thiếu LearningNotice.vue')
if (!themeIndex.includes("'doc-after': () => h(LearningNotice)")) failures.push('theme: LearningNotice phải nằm ở doc-after')
if (themeIndex.includes('OfficialSource')) failures.push('theme: OfficialSource vẫn còn được render')

for (const file of files) {
  const full = path.join(docsDir, file)
  const text = fs.readFileSync(full, 'utf8')
  const pageFailures = []

  if (file !== 'index.md' && !/^#\s+.+/m.test(text)) pageFailures.push('thiếu H1')
  if ((text.match(/^```/gm) || []).length % 2 !== 0) pageFailures.push('code fence không cân bằng')
  const openDivs = (text.match(/<div(?:\s[^>]*)?>/g) || []).length
  const closeDivs = (text.match(/<\/div>/g) || []).length
  if (openDivs !== closeDivs) pageFailures.push(`HTML div không cân bằng (${openDivs} mở/${closeDivs} đóng)`)

  const lines = text.split(/\r?\n/)
  const h1Index = lines.findIndex((line) => /^#\s+/.test(line))
  if (h1Index >= 0) {
    let cursor = h1Index + 1
    while (cursor < lines.length && !lines[cursor].trim()) cursor++
    if (/^\s*- \[[^\]]+\]\(#[^)]+\)\s*$/.test(lines[cursor] || '')) {
      pageFailures.push('còn TOC thủ công ở đầu bài; dùng VitePress outline thay thế')
    }
  }

  if (/##\s+Tài liệu chính thức/.test(text)) pageFailures.push('còn footer “Tài liệu chính thức” trong Markdown')
  if (/Đối chiếu tài liệu gốc:/.test(text)) pageFailures.push('còn dòng “Đối chiếu tài liệu gốc”')

  const candidates = findEnglishProseCandidates(text)
  editorialCandidates.push(...candidates.map((item) => ({ file, ...item })))

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

  for (const m of text.matchAll(/\]\(\/docs\/\{\{version\}\}\/([^#)]+)(?:#[^)]*)?\)/g)) {
    const target = `${m[1]}.md`
    if (!fs.existsSync(path.join(docsDir, target))) pageFailures.push(`internal Laravel docs target không tồn tại: ${target}`)
  }

  if (pageFailures.length) failures.push(...pageFailures.map((x) => `${file}: ${x}`))
  reports.push({ file, englishProseCandidates: candidates.length, status: pageFailures.length ? 'FAIL' : 'PASS' })
}

console.log(`[INFO] Reviewed ${files.length}/103 Laravel documentation articles one-by-one`)
console.log(`[INFO] English prose candidates: ${editorialCandidates.length}`)
if (editorialCandidates.length) {
  editorialCandidates.slice(0, 100).forEach((item) => console.log(`- ${item.file}:${item.line}: ${item.text}`))
}
if (failures.length) {
  console.error(`[FAIL] ${failures.length} structural/regression issue(s)`)
  failures.slice(0, 100).forEach((x) => console.error(`- ${x}`))
  process.exit(1)
}
if (editorialCandidates.length && strictEditorial) {
  console.error(`[FAIL] Editorial gate: ${editorialCandidates.length} likely-English prose line(s) require review`)
  process.exit(2)
}
if (editorialCandidates.length) console.warn(`[WARN] Editorial review suggested; run npm run validate:strict to enforce this gate`)
console.log('[PASS] Structural docs validation passed')
