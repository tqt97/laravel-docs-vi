# Laravel 13 Documentation Tiếng Việt 🇻🇳

Bản dịch tiếng Việt **không chính thức** của [Laravel 13 Documentation](https://laravel.com/docs/13.x), được xây dựng bằng [VitePress](https://vitepress.dev/) để có thể đọc nhanh, tìm kiếm tốt và deploy miễn phí lên GitHub Pages.

> [!WARNING]
> Dự án được thực hiện với mục đích **học tập và tham khảo**. Laravel Documentation chính thức luôn là nguồn chuẩn khi cần xác minh API, behavior hoặc thông tin có thể thay đổi theo phiên bản.

## Mục tiêu

- Dịch đầy đủ tài liệu Laravel 13.x sang tiếng Việt theo văn phong kỹ thuật rõ ràng, dễ hiểu.
- Giữ nguyên code, class, method, namespace, command, config key và thuật ngữ cần thiết để tra cứu source.
- Mỗi bài có liên kết về đúng trang Laravel Documentation chính thức để đối chiếu.
- Tạo môi trường đọc tài liệu nhanh bằng VitePress, có local search, responsive UI và SEO cơ bản.
- Chào đón cộng đồng sửa lỗi dịch, bổ sung diễn giải và cập nhật khi upstream thay đổi.

## Chạy local

```bash
npm install
npm run docs:dev
```

Build production:

```bash
npm run validate
npm run docs:build
npm run docs:preview
```

## Deploy GitHub Pages

Repo đã có `.github/workflows/deploy.yml`. Sau khi push lên GitHub:

1. Mở **Settings → Pages**.
2. Ở **Build and deployment → Source**, chọn **GitHub Actions**.
3. Push hoặc merge vào `main`.
4. Workflow sẽ tự tính `base` theo tên repository và deploy site.

## Nguồn chính thức

- Laravel Documentation: https://laravel.com/docs/13.x
- Laravel Docs repository: https://github.com/laravel/docs/tree/13.x
- Laravel Framework: https://github.com/laravel/framework/tree/13.x

## Đóng góp

Mọi đóng góp đều được chào đón. Hãy đọc [CONTRIBUTING.md](CONTRIBUTING.md) trước khi tạo Pull Request.

Bạn có thể giúp bằng cách sửa lỗi chính tả, làm rõ câu khó hiểu, kiểm tra bản dịch so với upstream, sửa link, cải thiện VitePress hoặc cập nhật nội dung khi Laravel 13.x thay đổi.

## Pháp lý

Đây là dự án cộng đồng, không phải tài liệu chính thức và không được Laravel tài trợ hay chứng thực. Nội dung gốc thuộc dự án Laravel theo giấy phép tương ứng. Xem [LICENSE.md](LICENSE.md) và [NOTICE.md](NOTICE.md).
