import { defineConfig } from 'vitepress'

const base = process.env.DOCS_BASE || '/'
const siteUrl = (process.env.SITE_URL || 'https://example.com/').replace(/\/$/, '')
const repoUrl = process.env.REPO_URL || 'https://github.com/your-username/laravel-docs-vi'

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
  sitemap: { hostname: siteUrl },
  head: [
    ['meta', { name: 'theme-color', content: '#ff2d20' }],
    ['meta', { name: 'robots', content: 'index,follow,max-image-preview:large' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'vi_VN' }],
    ['meta', { property: 'og:site_name', content: 'Laravel 13 Docs Tiếng Việt' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],
  transformHead({ pageData }) {
    const relative = pageData.relativePath.replace(/\.md$/, '').replace(/index$/, '')
    const canonical = `${siteUrl}/${relative}`.replace(/([^:]\/)\/+/, '$1')
    return [
      ['link', { rel: 'canonical', href: canonical }],
      ['meta', { property: 'og:url', content: canonical }],
      ['meta', { property: 'og:title', content: pageData.title || 'Laravel 13 Docs Tiếng Việt' }],
      ['meta', { name: 'twitter:title', content: pageData.title || 'Laravel 13 Docs Tiếng Việt' }],
    ]
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
