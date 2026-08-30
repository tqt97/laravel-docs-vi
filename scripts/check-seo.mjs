import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('docs/.vitepress/dist')
const failures = []

if (!fs.existsSync(dist)) {
  console.error('[FAIL] Missing VitePress dist. Run npm run docs:build first.')
  process.exit(1)
}

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name)
  return entry.isDirectory() ? walk(full) : [full]
})

const htmlFiles = walk(dist).filter((file) => file.endsWith('.html') && path.basename(file) !== '404.html')
const required = [
  ['meta description', /<meta name="description" content="[^"]{50,}"/],
  ['canonical', /<link rel="canonical" href="https?:\/\/[^"]+"/],
  ['og:title', /<meta property="og:title" content="[^"]+"/],
  ['og:description', /<meta property="og:description" content="[^"]{50,}"/],
  ['og:url', /<meta property="og:url" content="https?:\/\/[^"]+"/],
  ['og:image', /<meta property="og:image" content="https?:\/\/[^"]+\/og-image\.png"/],
  ['twitter:description', /<meta name="twitter:description" content="[^"]{50,}"/],
  ['JSON-LD', /<script type="application\/ld\+json">\{[\s\S]*?"@context":"https:\/\/schema\.org"/],
]

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
  for (const [label, regex] of required) {
    if (!regex.test(html)) failures.push(`${path.relative(dist, file)}: missing ${label}`)
  }
}

for (const filename of ['sitemap.xml', 'robots.txt', 'og-image.png']) {
  if (!fs.existsSync(path.join(dist, filename))) failures.push(`missing ${filename}`)
}

const robotsPath = path.join(dist, 'robots.txt')
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf8')
  if (!/^Sitemap: https?:\/\/.+\/sitemap\.xml$/m.test(robots)) failures.push('robots.txt: missing absolute Sitemap URL')
}

if (failures.length) {
  console.error(`[FAIL] SEO audit found ${failures.length} issue(s)`)
  failures.slice(0, 100).forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`[PASS] SEO audit passed for ${htmlFiles.length} generated HTML page(s)`)
