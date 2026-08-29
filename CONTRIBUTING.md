# Hướng dẫn đóng góp

Cảm ơn bạn muốn đóng góp cho Laravel 13 Documentation Tiếng Việt.

## Nguyên tắc dịch

- Không dịch tên class, namespace, method, facade, command, environment variable, config key hoặc code identifier.
- Ưu tiên câu tiếng Việt tự nhiên, đúng kỹ thuật; tránh dịch từng từ khiến nghĩa khó hiểu.
- Các thuật ngữ phổ biến như middleware, request, response, queue, job, cache, event, listener, service container, service provider, facade, model, migration có thể giữ tiếng Anh khi cách đó quen thuộc và chính xác hơn.
- Không tự bổ sung claim kỹ thuật không có trong tài liệu gốc vào phần bản dịch.
- Nếu cần thêm giải thích của người dịch, phải đánh dấu rõ đó là ghi chú cộng đồng.

## Quy trình

1. Fork repository và tạo branch mới.
2. Chỉ sửa các bài liên quan tới mục tiêu PR.
3. Chạy `npm run validate`.
4. Nếu có dependency, chạy thêm `npm run docs:build`.
5. Tạo Pull Request và mô tả bài gốc đã đối chiếu.

## Commit convention

```text
docs: translate queue documentation
docs: improve Vietnamese wording for validation
fix: repair internal documentation links
style: improve VitePress reading typography
chore: update documentation validation
```
