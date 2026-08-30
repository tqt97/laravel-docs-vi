# Laravel 13 Documentation Tiếng Việt 🇻🇳

Bản dịch tiếng Việt **không chính thức** của [Laravel 13 Documentation](https://laravel.com/docs/13.x), được xây dựng bằng [VitePress](https://vitepress.dev/) để có thể đọc nhanh, tìm kiếm tốt và deploy miễn phí lên GitHub Pages.

> [!WARNING]
> Dự án được thực hiện với mục đích **học tập và tham khảo**. Laravel Documentation chính thức luôn là nguồn chuẩn khi cần xác minh API, behavior hoặc thông tin có thể thay đổi theo phiên bản.

## Mục tiêu

- Dịch đầy đủ tài liệu Laravel 13.x sang tiếng Việt theo văn phong kỹ thuật rõ ràng, dễ hiểu.
- Giữ nguyên code, class, method, namespace, command, config key và thuật ngữ cần thiết để tra cứu source.
- Mỗi bài có lưu ý cộng đồng ở cuối trang và liên kết tới Laravel Documentation chính thức khi cần xác minh.
- Tạo môi trường đọc tài liệu nhanh bằng VitePress, có local search, responsive UI và SEO kỹ thuật theo từng trang.
- Chào đón cộng đồng sửa lỗi dịch, bổ sung diễn giải và cập nhật khi upstream thay đổi.

## Chạy local

```bash
npm install
npm run docs:dev
```

Build production:

```bash
npm run validate
npm run validate:strict
npm run docs:build
npm run docs:preview
```

## Deploy GitHub Pages

Repo đã có `.github/workflows/deploy.yml` và tự động deploy khi push vào `main` hoặc `master`.

### Kiểm tra trước khi deploy

```bash
npm ci
npm run validate
npm run docs:build
npm run docs:preview
```

### Bật GitHub Pages

1. Push repository lên GitHub.
2. Mở **Settings → Pages**.
3. Ở **Build and deployment → Source**, chọn **GitHub Actions**.
4. Push hoặc merge vào `main` / `master`, hoặc chạy workflow thủ công tại tab **Actions**.
5. Workflow sẽ chạy validation, build VitePress và deploy thư mục `docs/.vitepress/dist`.

Workflow tự đặt `DOCS_BASE` thành `/<repository>/`, vì vậy project Pages sẽ hoạt động tại dạng:

```text
https://<github-user>.github.io/<repository>/
```

Không cần hard-code `base` trong `config.ts`. Khi chạy local, `base` mặc định vẫn là `/`.

> Nếu dùng custom domain hoặc repository tên `<github-user>.github.io`, hãy đổi `DOCS_BASE` thành `/` và đặt `SITE_URL` thành origin thực tế, ví dụ `https://docs.example.com` (không kèm path repo).

## SEO và cấu trúc bài viết

Repo dùng VitePress outline (`Trong bài này`) làm TOC duy nhất. Các danh sách TOC thủ công ở đầu file Markdown đã được loại bỏ để tránh trùng nội dung và giảm nhiễu khi đọc.

Lưu ý “Tài liệu cộng đồng, không chính thức” được render một lần ở **cuối mỗi bài** qua slot `doc-after`. Repo không còn footer “Đối chiếu tài liệu gốc” hay section `## Tài liệu chính thức` lặp lại trong từng file Markdown.

`npm run validate:strict` thực hiện editorial gate theo câu prose, bỏ qua code fence, inline code, URL, HTML/table và các identifier kỹ thuật để tránh false positive từ các từ như `request`, `response`, `method`, `class` hoặc tên validation rule.

SEO được tạo tự động theo từng trang khi build:

- `title` và `meta description` riêng cho từng bài, description lấy từ nội dung bài và được rút gọn phù hợp.
- canonical URL nhận biết `DOCS_BASE`, phù hợp GitHub Project Pages và custom domain.
- Open Graph + Twitter Card dùng social image 1200×630.
- JSON-LD `TechArticle` cho trang tài liệu và `WebSite` cho trang chủ.
- `sitemap.xml`, `robots.txt`, `lang=vi-VN`, `lastUpdated` và favicon.
- CI chạy `npm run seo:check` sau production build để phát hiện thiếu metadata quan trọng.

Kiểm tra SEO local theo đúng dạng GitHub Pages:

```bash
DOCS_BASE=/laravel-docs-vi/ \
SITE_URL=https://example.github.io \
npm run docs:build

npm run seo:check
```

Trên PowerShell:

```powershell
$env:DOCS_BASE='/laravel-docs-vi/'
$env:SITE_URL='https://example.github.io'
npm run docs:build
npm run seo:check
```

## Nguồn chính thức

- Laravel Documentation: https://laravel.com/docs/13.x
- Laravel Docs repository: https://github.com/laravel/docs/tree/13.x
- Laravel Framework: https://github.com/laravel/framework/tree/13.x

## Đóng góp

Mọi đóng góp đều được chào đón. Hãy đọc [CONTRIBUTING.md](CONTRIBUTING.md) trước khi tạo Pull Request.

Bạn có thể giúp bằng cách sửa lỗi chính tả, làm rõ câu khó hiểu, kiểm tra bản dịch so với upstream, sửa link, cải thiện VitePress hoặc cập nhật nội dung khi Laravel 13.x thay đổi.

## Pháp lý

Đây là dự án cộng đồng, không phải tài liệu chính thức và không được Laravel tài trợ hay chứng thực. Nội dung gốc thuộc dự án Laravel theo giấy phép tương ứng. Xem [LICENSE.md](LICENSE.md) và [NOTICE.md](NOTICE.md).
