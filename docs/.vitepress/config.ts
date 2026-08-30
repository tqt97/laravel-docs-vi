import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitepress'

const base = process.env.DOCS_BASE || '/'
const siteOrigin = (process.env.SITE_URL || 'https://tqt97.github.io/laravel-docs-vi/').replace(/\/$/, '')
const repoUrl = process.env.REPO_URL || 'https://github.com/tqt97/laravel-docs-vi'
const normalizedBase = base === '/' ? '/' : `/${base.replace(/^\/+|\/+$/g, '')}/`
const siteRoot = `${siteOrigin}${normalizedBase}`
const socialImage = `${siteRoot}og-image.png`
const docsDir = path.resolve('docs')

const pageUrl = (relativePath: string) => {
  const route = relativePath
    .replace(/\\/g, '/')
    .replace(/index\.md$/, '')
    .replace(/\.md$/, '')
    .replace(/^\/+/, '')

  return route ? `${siteRoot}${route}` : siteRoot
}

const truncateDescription = (value: string, max = 158) => {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  const sliced = normalized.slice(0, max + 1)
  const boundary = sliced.lastIndexOf(' ')
  return `${sliced.slice(0, boundary > 120 ? boundary : max).replace(/[.,;:!?-]+$/, '')}…`
}

const extractDescription = (relativePath: string) => {
  if (relativePath === 'index.md') {
    return 'Tài liệu Laravel 13 tiếng Việt: hướng dẫn cài đặt, kiến trúc, database, Eloquent, queue, testing, bảo mật và các package chính thức.'
  }

  const file = path.join(docsDir, relativePath)
  if (!fs.existsSync(file)) return 'Tài liệu Laravel 13 tiếng Việt, bám sát Laravel Documentation chính thức để học tập, tra cứu API và triển khai ứng dụng.'

  const source = fs.readFileSync(file, 'utf8')
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<a\s+name="[^"]+"><\/a>/g, '')

  const paragraphs = source.split(/\n\s*\n/)
  for (const paragraph of paragraphs) {
    const prose = paragraph
      .split('\n')
      .filter((line) => !/^\s*(#{1,6}\s|[-*+]\s+\[[^\]]+\]\(#|>|:::|<)/.test(line))
      .join(' ')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_~]/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (prose.length >= 70 && !prose.startsWith('Laravel 13.x —')) return truncateDescription(prose)
  }

  return 'Tài liệu Laravel 13 tiếng Việt, bám sát Laravel Documentation chính thức để học tập, tra cứu API và triển khai ứng dụng.'
}

const sidebar = [
  { text: 'Mở đầu', collapsed: false, items: [
    { text: 'Ghi chú phát hành', link: '/releases' },
    { text: 'Hướng dẫn nâng cấp', link: '/upgrade' },
    { text: 'Hướng dẫn đóng góp', link: '/contributions' },
  ]},
  { text: 'Bắt đầu', collapsed: false, items: [
    { text: 'Cài đặt', link: '/installation' },
    { text: 'Cấu hình', link: '/configuration' },
    { text: 'Phát triển với AI Agent', link: '/ai' },
    { text: 'Cấu trúc thư mục', link: '/structure' },
    { text: 'Frontend', link: '/frontend' },
    { text: 'Starter Kits', link: '/starter-kits' },
    { text: 'Triển khai', link: '/deployment' },
  ]},
  { text: 'Khái niệm kiến trúc', collapsed: true, items: [
    { text: 'Vòng đời request', link: '/lifecycle' },
    { text: 'Service Container', link: '/container' },
    { text: 'Service Providers', link: '/providers' },
    { text: 'Facades', link: '/facades' },
  ]},
  { text: 'Kiến thức cơ bản', collapsed: true, items: [
    { text: 'Routing', link: '/routing' },
    { text: 'Middleware', link: '/middleware' },
    { text: 'Bảo vệ CSRF', link: '/csrf' },
    { text: 'Controllers', link: '/controllers' },
    { text: 'Requests', link: '/requests' },
    { text: 'Responses', link: '/responses' },
    { text: 'Views', link: '/views' },
    { text: 'Blade Templates', link: '/blade' },
    { text: 'Đóng gói asset với Vite', link: '/vite' },
    { text: 'Sinh URL', link: '/urls' },
    { text: 'Session', link: '/session' },
    { text: 'Validation', link: '/validation' },
    { text: 'Xử lý lỗi', link: '/errors' },
    { text: 'Logging', link: '/logging' },
  ]},
  { text: 'Chuyên sâu', collapsed: true, items: [
    { text: 'Artisan Console', link: '/artisan' },
    { text: 'Broadcasting', link: '/broadcasting' },
    { text: 'Cache', link: '/cache' },
    { text: 'Collections', link: '/collections' },
    { text: 'Concurrency', link: '/concurrency' },
    { text: 'Context', link: '/context' },
    { text: 'Contracts', link: '/contracts' },
    { text: 'Events', link: '/events' },
    { text: 'Lưu trữ file', link: '/filesystem' },
    { text: 'Helpers', link: '/helpers' },
    { text: 'HTTP Client', link: '/http-client' },
    { text: 'Images', link: '/images' },
    { text: 'Localization', link: '/localization' },
    { text: 'Mail', link: '/mail' },
    { text: 'Notifications', link: '/notifications' },
    { text: 'Phát triển package', link: '/packages' },
    { text: 'Processes', link: '/processes' },
    { text: 'Queues', link: '/queues' },
    { text: 'Rate Limiting', link: '/rate-limiting' },
    { text: 'Search', link: '/search' },
    { text: 'Strings', link: '/strings' },
    { text: 'Task Scheduling', link: '/scheduling' },
  ]},
  { text: 'Bảo mật', collapsed: true, items: [
    { text: 'Authentication', link: '/authentication' },
    { text: 'Authorization', link: '/authorization' },
    { text: 'Xác minh email', link: '/verification' },
    { text: 'Encryption', link: '/encryption' },
    { text: 'Hashing', link: '/hashing' },
    { text: 'Đặt lại mật khẩu', link: '/passwords' },
  ]},
  { text: 'Cơ sở dữ liệu', collapsed: true, items: [
    { text: 'Bắt đầu', link: '/database' },
    { text: 'Query Builder', link: '/queries' },
    { text: 'Pagination', link: '/pagination' },
    { text: 'Migrations', link: '/migrations' },
    { text: 'Seeding', link: '/seeding' },
    { text: 'Redis', link: '/redis' },
    { text: 'MongoDB', link: '/mongodb' },
  ]},
  { text: 'Eloquent ORM', collapsed: true, items: [
    { text: 'Bắt đầu', link: '/eloquent' },
    { text: 'Relationships', link: '/eloquent-relationships' },
    { text: 'Collections', link: '/eloquent-collections' },
    { text: 'Mutators / Casts', link: '/eloquent-mutators' },
    { text: 'API Resources', link: '/eloquent-resources' },
    { text: 'Serialization', link: '/eloquent-serialization' },
    { text: 'Factories', link: '/eloquent-factories' },
  ]},
  { text: 'AI', collapsed: true, items: [
    { text: 'AI SDK', link: '/ai-sdk' },
    { text: 'MCP', link: '/mcp' },
    { text: 'Boost', link: '/boost' },
  ]},
  { text: 'Testing', collapsed: true, items: [
    { text: 'Bắt đầu', link: '/testing' },
    { text: 'HTTP Tests', link: '/http-tests' },
    { text: 'Console Tests', link: '/console-tests' },
    { text: 'Browser Tests', link: '/dusk' },
    { text: 'Database Testing', link: '/database-testing' },
    { text: 'Mocking', link: '/mocking' },
  ]},
  { text: 'Packages', collapsed: true, items: [
    { text: 'Cashier (Stripe)', link: '/billing' },
    { text: 'Cashier (Paddle)', link: '/cashier-paddle' },
    { text: 'Dusk', link: '/dusk' },
    { text: 'Envoy', link: '/envoy' },
    { text: 'Fortify', link: '/fortify' },
    { text: 'Folio', link: '/folio' },
    { text: 'Head', link: '/head' },
    { text: 'Homestead', link: '/homestead' },
    { text: 'Horizon', link: '/horizon' },
    { text: 'Mix', link: '/mix' },
    { text: 'Octane', link: '/octane' },
    { text: 'Passport', link: '/passport' },
    { text: 'Pennant', link: '/pennant' },
    { text: 'Pint', link: '/pint' },
    { text: 'Precognition', link: '/precognition' },
    { text: 'Prompts', link: '/prompts' },
    { text: 'Pulse', link: '/pulse' },
    { text: 'Reverb', link: '/reverb' },
    { text: 'Sail', link: '/sail' },
    { text: 'Sanctum', link: '/sanctum' },
    { text: 'Scout', link: '/scout' },
    { text: 'Socialite', link: '/socialite' },
    { text: 'Telescope', link: '/telescope' },
    { text: 'Valet', link: '/valet' },
  ]},
]

export default defineConfig({
  lang: 'vi-VN',
  title: 'Laravel 13 Docs Tiếng Việt',
  titleTemplate: ':title | Laravel 13 Docs Tiếng Việt',
  description: 'Bản dịch tiếng Việt không chính thức của Laravel 13 Documentation, phục vụ học tập và tham khảo.',
  base,
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: siteRoot, lastmodDateOnly: false },
  head: [
    ['meta', { name: 'theme-color', content: '#ff2d20' }],
    ['meta', { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' }],
    ['meta', { property: 'og:locale', content: 'vi_VN' }],
    ['meta', { property: 'og:site_name', content: 'Laravel 13 Docs Tiếng Việt' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${normalizedBase}laravel-mark.svg` }],
  ],
  transformPageData(pageData) {
    return { description: extractDescription(pageData.relativePath) }
  },
  transformHead({ pageData, description }) {
    if (pageData.relativePath === '404.md') {
      return [['meta', { name: 'robots', content: 'noindex,nofollow' }]]
    }

    const canonical = pageUrl(pageData.relativePath)
    const title = pageData.frontmatter.layout === 'home'
      ? 'Laravel 13 Documentation Tiếng Việt'
      : `${pageData.title} | Laravel 13 Docs Tiếng Việt`
    const type = pageData.frontmatter.layout === 'home' ? 'website' : 'article'
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': pageData.frontmatter.layout === 'home' ? 'WebSite' : 'TechArticle',
      name: title,
      headline: pageData.title || title,
      description,
      url: canonical,
      inLanguage: 'vi-VN',
      image: socialImage,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Laravel 13 Docs Tiếng Việt',
        url: siteRoot,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Laravel 13 Docs Tiếng Việt',
        url: siteRoot,
      },
      ...(pageData.lastUpdated ? { dateModified: new Date(pageData.lastUpdated).toISOString() } : {}),
    }

    return [
      ['link', { rel: 'canonical', href: canonical }],
      ['meta', { property: 'og:type', content: type }],
      ['meta', { property: 'og:url', content: canonical }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:image', content: socialImage }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      ['meta', { property: 'og:image:alt', content: 'Laravel 13 Documentation Tiếng Việt' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: socialImage }],
      ['script', { type: 'application/ld+json' }, JSON.stringify(structuredData)],
    ]
  },
  buildEnd(siteConfig) {
    const robots = [
      'User-agent: *',
      'Allow: /',
      `Sitemap: ${siteRoot}sitemap.xml`,
      '',
    ].join('\n')
    fs.writeFileSync(path.join(siteConfig.outDir, 'robots.txt'), robots)
  },
  markdown: {
    lineNumbers: true,
    config(md) {
      const defaultRender = md.renderer.rules.link_open || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
      md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const hrefIndex = token.attrIndex('href')
        if (hrefIndex >= 0) {
          const href = token.attrs![hrefIndex][1]
          const match = href.match(/^\/docs\/\{\{version\}\}\/([^#]+)(#.*)?$/)
          if (match) token.attrs![hrefIndex][1] = `./${match[1]}${match[2] || ''}`
        }
        return defaultRender(tokens, idx, options, env, self)
      }
    },
  },
  themeConfig: {
    logo: '/laravel-mark.svg',
    siteTitle: 'Laravel 13 Docs VI',
    nav: [
      { text: 'Tài liệu', link: '/installation' },
      { text: 'Laravel chính thức', link: 'https://laravel.com/docs/13.x' },
      { text: 'GitHub Laravel', link: 'https://github.com/laravel/docs/tree/13.x' },
    ],
    sidebar,
    outline: { level: [2, 3], label: 'Trong bài này' },
    docFooter: { prev: 'Bài trước', next: 'Bài tiếp theo' },
    lastUpdated: { text: 'Cập nhật lần cuối', formatOptions: { dateStyle: 'medium', timeStyle: 'short' } },
    search: { provider: 'local', options: { translations: { button: { buttonText: 'Tìm kiếm', buttonAriaLabel: 'Tìm kiếm' }, modal: { noResultsText: 'Không tìm thấy kết quả', resetButtonTitle: 'Xóa truy vấn', footer: { selectText: 'chọn', navigateText: 'di chuyển', closeText: 'đóng' } } } } },
    socialLinks: [
      { icon: 'github', link: repoUrl },
    ],
    footer: {
      message: 'Dự án cộng đồng không chính thức, phục vụ học tập. Laravel là thương hiệu của các chủ sở hữu tương ứng.',
      copyright: 'Nội dung dựa trên Laravel Documentation chính thức.'
    },
  },
})
