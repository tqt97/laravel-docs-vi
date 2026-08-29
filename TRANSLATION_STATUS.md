# Trạng thái bản dịch Laravel 13

Tài liệu nguồn: Laravel Documentation nhánh `13.x`.

## Quality gate

Một bài chỉ được xem là đã dịch khi prose kỹ thuật đã được biên tập bằng tiếng Việt, code/API/identifier được giữ nguyên và anchor/link không bị phá vỡ. Repo không đánh dấu các file tiếng Anh còn lại là "đã dịch" chỉ để đạt đủ số lượng.

## Quy ước

- Giữ nguyên code block, command, class, method, namespace và config key.
- Giữ các thuật ngữ Laravel phổ biến khi dịch sát chữ làm giảm khả năng tra cứu.
- Cuối mỗi trang web có link về tài liệu Laravel 13 chính thức theo slug tương ứng.
- Nội dung chính thức tại https://laravel.com/docs/13.x luôn là source of truth.

## Kiểm tra tiến độ

Chạy:

```bash
npm run validate
```

Validator báo các trang có dấu hiệu còn nhiều prose tiếng Anh để tiếp tục editorial pass.
