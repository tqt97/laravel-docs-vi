import fs from 'node:fs'
import path from 'node:path'

const docsDir = path.resolve('docs')
const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md'))
const failures = []
const englishHeavy = []

for (const file of files) {
  const full = path.join(docsDir, file)
  const text = fs.readFileSync(full, 'utf8')
  const fences = (text.match(/^```/gm) || []).length
  if (fences % 2 !== 0) failures.push(`${file}: code fence không cân bằng`)
  if (file !== 'index.md' && !/^#\s+.+/m.test(text)) failures.push(`${file}: thiếu H1`)

  const prose = text
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/https?:\/\/\S+/g, '')
  const en = (prose.match(/\b(the|and|you|your|with|from|this|that|when|will|can|should|Laravel is|Introduction)\b/gi) || []).length
  if (en > 35) englishHeavy.push(`${file}(${en})`)
}

if (failures.length) {
  console.error('[FAIL]')
  failures.forEach((x) => console.error(`- ${x}`))
  process.exit(1)
}

console.log(`[PASS] ${files.length} Markdown pages have valid H1/home layout and balanced code fences`)
console.log(`[INFO] English-leak candidates: ${englishHeavy.length ? englishHeavy.join(', ') : 'none'}`)
if (englishHeavy.length) process.exitCode = 2
