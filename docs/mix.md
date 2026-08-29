# Laravel Mix

- [Giới thiệu](#introduction)

<a name="introduction"></a>
## Giới thiệu

> [!WARNING]
> Laravel Mix là một package cũ (legacy) và không còn được duy trì tích cực. Bạn nên sử dụng [Vite](/docs/{{version}}/vite) như một lựa chọn hiện đại thay thế.

[Laravel Mix](https://github.com/laravel-mix/laravel-mix), package được phát triển bởi Jeffrey Way — tác giả của [Laracasts](https://laracasts.com) — cung cấp một API mạch lạc để định nghĩa các bước build bằng [webpack](https://webpack.js.org) cho ứng dụng Laravel, đồng thời hỗ trợ nhiều CSS và JavaScript pre-processor phổ biến.

Nói cách khác, Mix giúp việc biên dịch và thu gọn (minify) các file CSS, JavaScript của ứng dụng trở nên đơn giản. Thông qua chuỗi method call dễ đọc, bạn có thể định nghĩa asset pipeline của mình. Ví dụ:

```js
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css');
```

Nếu bạn từng thấy webpack và quy trình biên dịch asset khó tiếp cận hoặc quá phức tạp khi mới bắt đầu, Laravel Mix có thể giúp mọi thứ đơn giản hơn đáng kể. Tuy nhiên, bạn không bắt buộc phải dùng Mix khi phát triển ứng dụng; bạn có thể sử dụng bất kỳ công cụ asset pipeline nào phù hợp, hoặc không sử dụng công cụ nào nếu dự án không cần.

> [!NOTE]
> Vite đã thay thế Laravel Mix trong các bản cài đặt Laravel mới. Để đọc tài liệu Mix, hãy truy cập website [Laravel Mix chính thức](https://laravel-mix.com/). Nếu muốn chuyển sang Vite, hãy xem [hướng dẫn migration sang Vite](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite).
