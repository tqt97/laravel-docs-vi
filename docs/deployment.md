# Triển khai ứng dụng

<a name="introduction"></a>
## Giới thiệu
Khi chuẩn bị deploy ứng dụng Laravel lên production, có một số việc quan trọng giúp đảm bảo ứng dụng vận hành hiệu quả nhất có thể. Phần này trình bày các điểm khởi đầu cần thiết để triển khai Laravel đúng cách.
<a name="server-requirements"></a>
## Yêu cầu máy chủ
Laravel framework có một số yêu cầu hệ thống. Hãy đảm bảo web server có tối thiểu phiên bản PHP và các extension sau:
<div class="content-list" markdown="1">

- PHP >= 8.3
- Ctype PHP Extension
- cURL PHP Extension
- DOM PHP Extension
- Fileinfo PHP Extension
- Filter PHP Extension
- Hash PHP Extension
- Mbstring PHP Extension
- OpenSSL PHP Extension
- PCRE PHP Extension
- PDO PHP Extension
- Session PHP Extension
- Tokenizer PHP Extension
- XML PHP Extension

</div>

<a name="server-configuration"></a>
## Cấu hình máy chủ
<a name="nginx"></a>
### Nginx
Nếu deploy ứng dụng lên server chạy Nginx, bạn có thể dùng file cấu hình bên dưới làm điểm khởi đầu. Gần như chắc chắn bạn sẽ cần điều chỉnh theo cấu hình server thực tế. **Nếu muốn có nền tảng quản lý server hoàn chỉnh, hãy cân nhắc một platform Laravel được quản lý toàn phần như [Laravel Cloud](https://cloud.laravel.com).**
Hãy đảm bảo web server chuyển toàn bộ request tới file `public/index.php` của ứng dụng như cấu hình bên dưới. **Không nên di chuyển `index.php` lên root project**, vì phục vụ ứng dụng trực tiếp từ project root có thể làm lộ nhiều file cấu hình nhạy cảm ra Internet:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com;
    root /srv/example.com/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_buffer_size 32k;
        fastcgi_buffers 8 32k;
        fastcgi_busy_buffers_size 64k;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

<a name="frankenphp"></a>
### FrankenPHP
[FrankenPHP](https://frankenphp.dev/) cũng có thể dùng để phục vụ ứng dụng Laravel. FrankenPHP là PHP application server hiện đại viết bằng Go. Để phục vụ Laravel bằng FrankenPHP, bạn có thể chạy command `php-server`:
```shell
frankenphp php-server -r public/
```
Để tận dụng các tính năng mạnh hơn của FrankenPHP như tích hợp [Laravel Octane](/octane), HTTP/3, compression hiện đại hoặc đóng gói ứng dụng Laravel thành standalone binary, hãy xem [tài liệu Laravel của FrankenPHP](https://frankenphp.dev/docs/laravel/).
<a name="directory-permissions"></a>
### Quyền thư mục
Laravel cần ghi dữ liệu vào các directory `bootstrap/cache` và `storage`, vì vậy hãy đảm bảo user chạy web server process có quyền ghi vào các directory này.
<a name="optimization"></a>
## Tối ưu
Khi deploy production, có nhiều loại dữ liệu nên được cache gồm configuration, events, routes và views. Laravel cung cấp command Artisan `optimize` để cache tất cả những thành phần này trong một lần chạy. Thông thường command nên nằm trong deployment process:
```shell
php artisan optimize
```
Phương thức `optimize:clear` dùng để xóa toàn bộ cache file được tạo bởi `optimize`, đồng thời xóa tất cả key trong default cache driver:
```shell
php artisan optimize:clear
```
Phần dưới đây trình bày chi tiết từng command tối ưu riêng lẻ được `optimize` thực thi.
<a name="optimizing-configuration-loading"></a>
### Cache cấu hình
Khi deploy production, hãy đảm bảo chạy command Artisan `config:cache` trong deployment process:
```shell
php artisan config:cache
```
Command này kết hợp toàn bộ file cấu hình Laravel thành một cache file duy nhất, giảm đáng kể số lần framework phải truy cập filesystem khi load configuration value.
> [!WARNING]
> Nếu chạy `config:cache` trong deployment process, hãy đảm bảo chỉ gọi function `env` bên trong configuration file. Sau khi configuration được cache, file `.env` không còn được load và mọi lời gọi `env` cho variable trong `.env` sẽ trả `null`.
<a name="caching-events"></a>
### Cache sự kiện
Bạn nên cache mapping event-to-listener được auto-discover trong deployment process. Thực hiện bằng command Artisan `event:cache`:
```shell
php artisan event:cache
```

<a name="optimizing-route-loading"></a>
### Cache Routes
Nếu xây dựng ứng dụng lớn có nhiều route, hãy chạy command Artisan `route:cache` trong deployment process:
```shell
php artisan route:cache
```
Command này rút gọn toàn bộ route registration vào một method call trong cache file, cải thiện hiệu năng đăng ký route khi ứng dụng có hàng trăm route.
<a name="optimizing-view-loading"></a>
### Cache Views
Khi deploy production, hãy đảm bảo chạy command Artisan `view:cache`:
```shell
php artisan view:cache
```
Command này precompile toàn bộ Blade view để chúng không phải compile theo nhu cầu, cải thiện hiệu năng cho mỗi request trả về view.
<a name="reloading-services"></a>
## Reload Services
> [!NOTE]
> Khi deploy bằng [Laravel Cloud](https://cloud.laravel.com), không cần dùng command `reload` vì việc graceful reload toàn bộ service được xử lý tự động.
Sau khi deploy phiên bản mới, các long-running service như queue worker, Laravel Reverb hoặc Laravel Octane cần được reload / restart để sử dụng code mới. Laravel cung cấp command Artisan `reload` để terminate các service này:
```shell
php artisan reload
```
Nếu không dùng [Laravel Cloud](https://cloud.laravel.com), hãy tự cấu hình process monitor có thể phát hiện process reloadable đã exit và tự động restart.
<a name="debug-mode"></a>
## Debug Mode
Option debug trong `config/app.php` quyết định mức độ thông tin lỗi được hiển thị cho người dùng. Mặc định option này lấy value từ environment variable `APP_DEBUG` trong file `.env`.
> [!WARNING]
> **Trong production, value này phải luôn là `false`. Nếu `APP_DEBUG=true` trên production, ứng dụng có nguy cơ làm lộ configuration value nhạy cảm cho end user.**
<a name="the-health-route"></a>
## Health Route
Laravel có sẵn health check route để theo dõi trạng thái ứng dụng. Trong production, route này có thể báo tình trạng ứng dụng cho uptime monitor, load balancer hoặc orchestration system như Kubernetes.
Mặc định health check route nằm tại `/up` và trả HTTP `200` nếu application bootstrap không có exception. Nếu bootstrap lỗi, response là `500`. Bạn có thể cấu hình URI trong file `bootstrap/app`:
```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up', // [tl! remove]
    health: '/status', // [tl! add]
)
```
Khi có HTTP request tới route này, Laravel cũng dispatch event `Illuminate\Foundation\Events\DiagnosingHealth`, cho phép thực hiện health check bổ sung phù hợp với ứng dụng. Trong [listener](/events), bạn có thể kiểm tra database hoặc cache. Nếu phát hiện vấn đề, chỉ cần throw exception từ listener.
<a name="deploying-with-cloud-or-forge"></a>
## Deploy bằng Laravel Cloud hoặc Forge
<a name="laravel-cloud"></a>
#### Laravel Cloud
Nếu muốn nền tảng deploy auto-scaling được quản lý toàn phần và tối ưu riêng cho Laravel, hãy xem [Laravel Cloud](https://cloud.laravel.com). Laravel Cloud cung cấp managed compute, database, cache và object storage.
Bạn có thể đưa ứng dụng Laravel lên Cloud mà vẫn tiếp tục viết application theo cách quen thuộc; nền tảng được chính đội ngũ Laravel tối ưu để làm việc liền mạch với framework.
<a name="laravel-forge"></a>
#### Laravel Forge
Nếu muốn tự quản server nhưng không muốn tự cấu hình tất cả service cần thiết để chạy Laravel ổn định, [Laravel Forge](https://forge.laravel.com) là nền tảng quản lý VPS dành cho ứng dụng Laravel.
Laravel Forge có thể tạo server trên nhiều hạ tầng như DigitalOcean, Linode, AWS và các provider khác. Forge cũng cài đặt, quản lý những công cụ cần thiết cho Laravel như Nginx, MySQL, Redis, Memcached, Beanstalk và nhiều service khác.
