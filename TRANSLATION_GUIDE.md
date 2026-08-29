# Quy chuẩn biên tập bản dịch

## Mục tiêu

Bản dịch phải chính xác về behavior, dễ đọc với developer Việt Nam và vẫn giúp người đọc tra cứu được API/source tiếng Anh.

## Giữ nguyên

`Request`, `Response`, `Middleware`, `Service Container`, `Service Provider`, `Facade`, `Eloquent`, `Query Builder`, `Model`, `Migration`, `Seeder`, `Factory`, `Queue`, `Job`, `Event`, `Listener`, `Cache`, `Session` có thể giữ nguyên khi đây là cách gọi phổ biến trong cộng đồng Laravel.

Tên API/code luôn giữ nguyên: `Route::get`, `Model::query()`, `config()`, `APP_ENV`, `php artisan`, namespace, class, method, package và đường dẫn file.

## Ưu tiên cách diễn đạt

- “The request will be...” → “Request sẽ...” hoặc “Laravel sẽ...” tùy chủ thể thực tế.
- “You may...” → “Bạn có thể...”.
- “Under the hood...” → “Ở bên trong, ...” thay vì dịch sát thành “dưới mui xe”.
- “Expensive query/operation” → “truy vấn/thao tác tốn nhiều tài nguyên” thay vì “đắt”.
- “Eager loading” → “eager loading (tải trước quan hệ)” ở lần xuất hiện đầu nếu cần.
- “Lazy loading” → “lazy loading (tải quan hệ khi truy cập)” ở lần xuất hiện đầu nếu cần.

## Không làm

- Không dịch code comment nếu việc dịch khiến snippet khác source chính thức, trừ khi cả block là ví dụ prose không dùng để copy.
- Không thay đổi signature/API.
- Không viết thêm kết luận kỹ thuật không có nguồn.
