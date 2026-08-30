# Laravel Octane

- [Giới thiệu](#introduction)
- [Cài đặt](#installation)
- [Yêu cầu máy chủ](#server-prerequisites)
    - [FrankenPHP](#frankenphp)
    - [RoadRunner](#roadrunner)
    - [Swoole](#swoole)
- [Phục vụ ứng dụng](#serving-your-application)
    - [Phục vụ ứng dụng qua HTTPS](#serving-your-application-via-https)
    - [Phục vụ ứng dụng qua Nginx](#serving-your-application-via-nginx)
    - [Theo dõi thay đổi file](#watching-for-file-changes)
    - [Chỉ định số lượng worker](#specifying-the-worker-count)
    - [Chỉ định số request tối đa](#specifying-the-max-request-count)
    - [Chỉ định thời gian thực thi tối đa](#specifying-the-max-execution-time)
    - [Tải lại worker](#reloading-the-workers)
    - [Dừng máy chủ](#stopping-the-server)
- [Dependency Injection và Octane](#dependency-injection-and-octane)
    - [Inject Container](#container-injection)
    - [Inject Request](#request-injection)
    - [Inject Configuration Repository](#configuration-repository-injection)
- [Quản lý rò rỉ bộ nhớ](#managing-memory-leaks)
- [Tác vụ đồng thời](#concurrent-tasks)
- [Tick và khoảng thời gian](#ticks-and-intervals)
- [Octane Cache](#the-octane-cache)
    - [Khoảng thời gian cache](#cache-intervals)
- [Tables](#tables)

<a name="introduction"></a>
## Giới thiệu

[Laravel Octane](https://github.com/laravel/octane) tăng cường mạnh mẽ hiệu năng ứng dụng bằng cách phục vụ ứng dụng thông qua các application server hiệu năng cao, bao gồm [FrankenPHP](https://frankenphp.dev/), [Open Swoole](https://openswoole.com/), [Swoole](https://github.com/swoole/swoole-src) và [RoadRunner](https://roadrunner.dev). Octane khởi động ứng dụng một lần, giữ ứng dụng trong bộ nhớ, sau đó chuyển các request đến ứng dụng với tốc độ cực cao.

<a name="installation"></a>
## Cài đặt

Bạn có thể cài đặt Octane thông qua trình quản lý package Composer:

```shell
composer require laravel/octane
```

Sau khi cài đặt Octane, bạn có thể chạy lệnh Artisan `octane:install`; lệnh này sẽ cài đặt file cấu hình của Octane vào ứng dụng:

```shell
php artisan octane:install
```

<a name="server-prerequisites"></a>
## Yêu cầu máy chủ

<a name="frankenphp"></a>
### FrankenPHP

[FrankenPHP](https://frankenphp.dev) là một PHP application server được viết bằng Go, hỗ trợ các tính năng web hiện đại như early hints, nén Brotli và Zstandard. Khi cài đặt Octane và chọn FrankenPHP làm server, Octane sẽ tự động tải xuống và cài đặt binary FrankenPHP cho bạn.

<a name="frankenphp-via-laravel-sail"></a>
#### FrankenPHP qua Laravel Sail

Nếu dự định phát triển ứng dụng bằng [Laravel Sail](/docs/{{version}}/sail), bạn nên chạy các lệnh sau để cài đặt Octane và FrankenPHP:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane
```

Tiếp theo, bạn nên dùng lệnh Artisan `octane:install` để cài đặt binary FrankenPHP:

```shell
./vendor/bin/sail artisan octane:install --server=frankenphp
```

Cuối cùng, hãy thêm biến môi trường `SUPERVISOR_PHP_COMMAND` vào định nghĩa service `laravel.test` trong file `docker-compose.yml` của ứng dụng. Biến môi trường này chứa lệnh mà Sail sẽ dùng để phục vụ ứng dụng bằng Octane thay cho PHP development server:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=frankenphp --host=0.0.0.0 --admin-port=2019 --port='${APP_PORT:-80}'" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

Để bật HTTPS, HTTP/2 và HTTP/3, hãy áp dụng các thay đổi sau thay thế:

```yaml
services:
  laravel.test:
    ports:
        - '${APP_PORT:-80}:80'
        - '${VITE_PORT:-5173}:${VITE_PORT:-5173}'
        - '443:443' # [tl! add]
        - '443:443/udp' # [tl! add]
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --host=localhost --port=443 --admin-port=2019 --https" # [tl! add]
      XDG_CONFIG_HOME:  /var/www/html/config # [tl! add]
      XDG_DATA_HOME:  /var/www/html/data # [tl! add]
```

Thông thường, bạn nên truy cập ứng dụng FrankenPHP Sail qua `https://localhost`, vì việc sử dụng `https://127.0.0.1` yêu cầu cấu hình bổ sung và [không được khuyến khích](https://frankenphp.dev/docs/known-issues/#using-https127001-with-docker).

<a name="frankenphp-via-docker"></a>
#### FrankenPHP qua Docker

Sử dụng Docker image chính thức của FrankenPHP có thể mang lại hiệu năng tốt hơn và cho phép dùng thêm các extension không có trong bản cài đặt FrankenPHP tĩnh. Ngoài ra, các Docker image chính thức hỗ trợ chạy FrankenPHP trên những nền tảng mà nó không hỗ trợ native, chẳng hạn Windows. Docker image chính thức của FrankenPHP phù hợp cho cả phát triển local lẫn môi trường production.

Bạn có thể dùng Dockerfile sau làm điểm khởi đầu để container hóa ứng dụng Laravel chạy bằng FrankenPHP:

```dockerfile
FROM dunglas/frankenphp

RUN install-php-extensions \
    pcntl
    # Add other PHP extensions here...

COPY . /app

ENTRYPOINT ["php", "artisan", "octane:frankenphp"]
```

Sau đó, trong quá trình phát triển, bạn có thể dùng file Docker Compose sau để chạy ứng dụng:

```yaml
# compose.yaml
services:
  frankenphp:
    build:
      context: .
    entrypoint: php artisan octane:frankenphp --workers=1 --max-requests=1
    ports:
      - "8000:8000"
    volumes:
      - .:/app
```

Nếu option `--log-level` được truyền tường minh vào lệnh `php artisan octane:start`, Octane sẽ sử dụng logger native của FrankenPHP và, trừ khi được cấu hình khác đi, sẽ tạo log JSON có cấu trúc.

Bạn có thể tham khảo [tài liệu FrankenPHP chính thức](https://frankenphp.dev/docs/docker/) để biết thêm thông tin về cách chạy FrankenPHP với Docker.

<a name="frankenphp-caddyfile"></a>
#### Cấu hình Caddyfile tùy chỉnh

Khi sử dụng FrankenPHP, bạn có thể chỉ định một Caddyfile tùy chỉnh bằng option `--caddyfile` khi khởi động Octane:

```shell
php artisan octane:start --server=frankenphp --caddyfile=/path/to/your/Caddyfile
```

Điều này cho phép bạn tùy chỉnh cấu hình FrankenPHP vượt ra ngoài các thiết lập mặc định, chẳng hạn thêm middleware tùy chỉnh, cấu hình routing nâng cao hoặc thiết lập directive tùy chỉnh. Bạn có thể tham khảo [tài liệu Caddy chính thức](https://caddyserver.com/docs/caddyfile) để biết thêm về cú pháp Caddyfile và các tùy chọn cấu hình.

<a name="roadrunner"></a>
### RoadRunner

[RoadRunner](https://roadrunner.dev) hoạt động dựa trên binary RoadRunner được xây dựng bằng Go. Trong lần đầu khởi động Octane server dựa trên RoadRunner, Octane sẽ đề nghị tải xuống và cài đặt binary RoadRunner cho bạn.

<a name="roadrunner-via-laravel-sail"></a>
#### RoadRunner qua Laravel Sail

Nếu dự định phát triển ứng dụng bằng [Laravel Sail](/docs/{{version}}/sail), bạn nên chạy các lệnh sau để cài đặt Octane và RoadRunner:

```shell
./vendor/bin/sail up

./vendor/bin/sail composer require laravel/octane spiral/roadrunner-cli spiral/roadrunner-http
```

Tiếp theo, bạn nên mở Sail shell và dùng executable `rr` để lấy bản build RoadRunner mới nhất dành cho Linux:

```shell
./vendor/bin/sail shell

# Within the Sail shell...
./vendor/bin/rr get-binary
```

Sau đó, hãy thêm biến môi trường `SUPERVISOR_PHP_COMMAND` vào định nghĩa service `laravel.test` trong file `docker-compose.yml` của ứng dụng. Biến này chứa lệnh mà Sail sẽ dùng để phục vụ ứng dụng bằng Octane thay cho PHP development server:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=roadrunner --host=0.0.0.0 --rpc-port=6001 --port='${APP_PORT:-80}'" # [tl! add]
```

Cuối cùng, hãy đảm bảo binary `rr` có quyền thực thi rồi build các Sail image:

```shell
chmod +x ./rr

./vendor/bin/sail build --no-cache
```

<a name="swoole"></a>
### Swoole

Nếu dự định dùng Swoole application server để phục vụ ứng dụng Laravel Octane, bạn phải cài đặt PHP extension Swoole. Thông thường, việc này có thể thực hiện qua PECL:

```shell
pecl install swoole
```

<a name="openswoole"></a>
#### Open Swoole

Nếu muốn dùng Open Swoole application server để phục vụ ứng dụng Laravel Octane, bạn phải cài đặt PHP extension Open Swoole. Thông thường, việc này có thể thực hiện qua PECL:

```shell
pecl install openswoole
```

Sử dụng Laravel Octane với Open Swoole cung cấp cùng các chức năng như Swoole, chẳng hạn concurrent task, tick và interval.

<a name="swoole-via-laravel-sail"></a>
#### Swoole qua Laravel Sail

> [!WARNING]
> Trước khi phục vụ ứng dụng Octane qua Sail, hãy đảm bảo bạn đang dùng phiên bản Laravel Sail mới nhất và chạy `./vendor/bin/sail build --no-cache` trong thư mục gốc của ứng dụng.

Ngoài ra, bạn có thể phát triển ứng dụng Octane dựa trên Swoole bằng [Laravel Sail](/docs/{{version}}/sail), môi trường phát triển dựa trên Docker chính thức của Laravel. Laravel Sail mặc định đã bao gồm extension Swoole. Tuy nhiên, bạn vẫn cần điều chỉnh file `docker-compose.yml` mà Sail sử dụng.

Để bắt đầu, hãy thêm biến môi trường `SUPERVISOR_PHP_COMMAND` vào định nghĩa service `laravel.test` trong file `docker-compose.yml` của ứng dụng. Biến này chứa lệnh mà Sail sẽ dùng để phục vụ ứng dụng bằng Octane thay cho PHP development server:

```yaml
services:
  laravel.test:
    environment:
      SUPERVISOR_PHP_COMMAND: "/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan octane:start --server=swoole --host=0.0.0.0 --port='${APP_PORT:-80}'" # [tl! add]
```

Cuối cùng, hãy build các Sail image:

```shell
./vendor/bin/sail build --no-cache
```

<a name="swoole-configuration"></a>
#### Cấu hình Swoole

Swoole hỗ trợ một số tùy chọn cấu hình bổ sung mà bạn có thể thêm vào file cấu hình `octane` khi cần. Vì hiếm khi cần thay đổi, các tùy chọn này không được đưa vào file cấu hình mặc định:

```php
'swoole' => [
    'options' => [
        'log_file' => storage_path('logs/swoole_http.log'),
        'package_max_length' => 10 * 1024 * 1024,
    ],
],
```

<a name="serving-your-application"></a>
## Phục vụ ứng dụng

Bạn có thể khởi động Octane server bằng lệnh Artisan `octane:start`. Theo mặc định, lệnh này sử dụng server được chỉ định bởi option cấu hình `server` trong file cấu hình `octane` của ứng dụng:

```shell
php artisan octane:start
```

Theo mặc định, Octane khởi động server trên cổng 8000, vì vậy bạn có thể truy cập ứng dụng bằng trình duyệt tại `http://localhost:8000`.

<a name="keeping-octane-running-in-production"></a>
#### Duy trì Octane hoạt động trong môi trường production

Nếu bạn triển khai ứng dụng Octane lên môi trường production, bạn nên sử dụng một trình giám sát tiến trình như Supervisor để đảm bảo Octane server luôn hoạt động. Một file cấu hình Supervisor mẫu cho Octane có thể như sau:

```ini
[program:octane]
process_name=%(program_name)s_%(process_num)02d
command=php /home/forge/example.com/artisan octane:start --server=frankenphp --host=127.0.0.1 --port=8000
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/example.com/storage/logs/octane.log
stopwaitsecs=3600
```

<a name="serving-your-application-via-https"></a>
### Phục vụ ứng dụng qua HTTPS

Theo mặc định, các ứng dụng chạy qua Octane tạo liên kết có tiền tố `http://`. Biến môi trường `OCTANE_HTTPS`, được sử dụng trong file cấu hình `config/octane.php` của ứng dụng, có thể được đặt thành `true` khi phục vụ ứng dụng qua HTTPS. Khi giá trị cấu hình này được đặt thành `true`, Octane sẽ yêu cầu Laravel thêm tiền tố `https://` vào tất cả liên kết được tạo:

```php
'https' => env('OCTANE_HTTPS', false),
```

<a name="serving-your-application-via-nginx"></a>
### Phục vụ ứng dụng qua Nginx

> [!NOTE]
> Nếu bạn chưa sẵn sàng tự quản lý cấu hình server hoặc chưa quen với việc cấu hình tất cả các dịch vụ cần thiết để vận hành một ứng dụng Laravel Octane mạnh mẽ, hãy tham khảo [Laravel Cloud](https://cloud.laravel.com), nền tảng cung cấp hỗ trợ Laravel Octane được quản lý hoàn toàn.

Trong môi trường production, bạn nên phục vụ ứng dụng Octane phía sau một web server truyền thống như Nginx hoặc Apache. Cách này cho phép web server phục vụ các tài nguyên tĩnh như hình ảnh và stylesheet, đồng thời xử lý việc kết thúc kết nối SSL (SSL termination).

Trong ví dụ cấu hình Nginx bên dưới, Nginx sẽ phục vụ các tài nguyên tĩnh của trang web và proxy các request đến Octane server đang chạy trên cổng 8000:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name domain.com;
    server_tokens off;
    root /home/forge/domain.com/public;

    index index.php;

    charset utf-8;

    location /index.php {
        try_files /not_exists @octane;
    }

    location / {
        try_files $uri $uri/ @octane;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    access_log off;
    error_log  /var/log/nginx/domain.com-error.log error;

    error_page 404 /index.php;

    location @octane {
        set $suffix "";

        if ($uri = /index.php) {
            set $suffix ?$query_string;
        }

        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header SERVER_PORT $server_port;
        proxy_set_header REMOTE_ADDR $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        proxy_pass http://127.0.0.1:8000$suffix;
    }
}
```

<a name="watching-for-file-changes"></a>
### Theo dõi thay đổi file

Vì ứng dụng được nạp vào bộ nhớ một lần khi Octane server khởi động, mọi thay đổi đối với các file của ứng dụng sẽ không được phản ánh khi bạn refresh trình duyệt. Ví dụ, các định nghĩa route được thêm vào file `routes/web.php` sẽ không có hiệu lực cho đến khi server được khởi động lại. Để thuận tiện, bạn có thể sử dụng cờ `--watch` để yêu cầu Octane tự động khởi động lại server khi có bất kỳ thay đổi file nào trong ứng dụng:

```shell
php artisan octane:start --watch
```

Trước khi sử dụng tính năng này, bạn nên đảm bảo [Node](https://nodejs.org) đã được cài đặt trong môi trường phát triển local. Ngoài ra, bạn nên cài đặt thư viện theo dõi file [Chokidar](https://github.com/paulmillr/chokidar) trong project:

```shell
npm install --save-dev chokidar
```

Bạn có thể cấu hình các thư mục và file cần theo dõi bằng option cấu hình `watch` trong file cấu hình `config/octane.php` của ứng dụng.

<a name="specifying-the-worker-count"></a>
### Chỉ định số lượng worker

Theo mặc định, Octane sẽ khởi động một application request worker cho mỗi CPU core trên máy của bạn. Các worker này sau đó được sử dụng để phục vụ các HTTP request đi vào ứng dụng. Bạn có thể chỉ định thủ công số lượng worker muốn khởi động bằng option `--workers` khi gọi lệnh `octane:start`:

```shell
php artisan octane:start --workers=4
```

Nếu đang sử dụng Swoole application server, bạn cũng có thể chỉ định số lượng ["task worker"](#concurrent-tasks) muốn khởi động:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

<a name="specifying-the-max-request-count"></a>
### Chỉ định số lượng request tối đa

Để giúp ngăn chặn các memory leak ngoài ý muốn, Octane sẽ khởi động lại worker một cách an toàn sau khi worker đó xử lý 500 request. Để điều chỉnh con số này, bạn có thể sử dụng option `--max-requests`:

```shell
php artisan octane:start --max-requests=250
```

<a name="specifying-the-max-execution-time"></a>
### Chỉ định thời gian thực thi tối đa

Theo mặc định, Laravel Octane đặt thời gian thực thi tối đa là 30 giây cho các request đến thông qua option `max_execution_time` trong file cấu hình `config/octane.php` của ứng dụng:

```php
'max_execution_time' => 30,
```

Thiết lập này xác định số giây tối đa mà một request đến được phép thực thi trước khi bị chấm dứt. Đặt giá trị này thành `0` sẽ vô hiệu hóa hoàn toàn giới hạn thời gian thực thi. Option cấu hình này đặc biệt hữu ích cho các ứng dụng xử lý request chạy lâu, chẳng hạn như upload file, xử lý dữ liệu hoặc gọi API đến các dịch vụ bên ngoài.

> [!WARNING]
> Khi thay đổi cấu hình `max_execution_time`, bạn phải khởi động lại Octane server để thay đổi có hiệu lực.

<a name="reloading-the-workers"></a>
### Tải lại worker

Bạn có thể khởi động lại an toàn các application worker của Octane server bằng lệnh `octane:reload`. Thông thường, thao tác này nên được thực hiện sau khi deploy để code vừa triển khai được nạp vào bộ nhớ và được sử dụng để phục vụ các request tiếp theo:

```shell
php artisan octane:reload
```

<a name="stopping-the-server"></a>
### Dừng server

Bạn có thể dừng Octane server bằng lệnh Artisan `octane:stop`:

```shell
php artisan octane:stop
```

<a name="checking-the-server-status"></a>
#### Kiểm tra trạng thái server

Bạn có thể kiểm tra trạng thái hiện tại của Octane server bằng lệnh Artisan `octane:status`:

```shell
php artisan octane:status
```

<a name="dependency-injection-and-octane"></a>
## Dependency Injection và Octane

Vì Octane boot ứng dụng một lần và giữ ứng dụng trong bộ nhớ trong khi phục vụ các request, có một số điểm bạn cần lưu ý khi xây dựng ứng dụng. Ví dụ, các method `register` và `boot` của service provider trong ứng dụng chỉ được thực thi một lần khi request worker khởi động ban đầu. Ở các request tiếp theo, cùng một application instance sẽ được tái sử dụng.

Vì vậy, bạn cần đặc biệt cẩn thận khi inject application service container hoặc request vào constructor của bất kỳ object nào. Nếu làm như vậy, object đó có thể giữ một phiên bản container hoặc request đã cũ ở các request tiếp theo.

Octane sẽ tự động xử lý việc reset mọi state của framework first-party giữa các request. Tuy nhiên, Octane không phải lúc nào cũng biết cách reset global state do ứng dụng của bạn tạo ra. Vì vậy, bạn cần biết cách xây dựng ứng dụng thân thiện với Octane. Bên dưới, chúng ta sẽ thảo luận những tình huống phổ biến nhất có thể gây vấn đề khi sử dụng Octane.

<a name="container-injection"></a>
### Inject container

Nhìn chung, bạn nên tránh inject application service container hoặc HTTP request instance vào constructor của các object khác. Ví dụ, binding sau inject toàn bộ application service container vào một object được bind dưới dạng singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app);
    });
}
```

Trong ví dụ này, nếu instance `Service` được resolve trong quá trình boot ứng dụng, container sẽ được inject vào service và chính container đó sẽ được instance `Service` giữ lại ở các request tiếp theo. Điều này **có thể** không gây vấn đề cho ứng dụng cụ thể của bạn; tuy nhiên, nó có thể khiến container bất ngờ thiếu các binding được thêm vào sau đó trong chu kỳ boot hoặc bởi một request tiếp theo.

Để khắc phục, bạn có thể ngừng đăng ký binding dưới dạng singleton, hoặc inject một container resolver closure vào service để closure này luôn resolve container instance hiện tại:

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app);
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance());
});
```

Global helper `app` và method `Container::getInstance()` sẽ luôn trả về phiên bản mới nhất của application container.

<a name="request-injection"></a>
### Inject request

Nhìn chung, bạn nên tránh inject application service container hoặc HTTP request instance vào constructor của các object khác. Ví dụ, binding sau inject toàn bộ request instance vào một object được bind dưới dạng singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app['request']);
    });
}
```

Trong ví dụ này, nếu instance `Service` được resolve trong quá trình boot ứng dụng, HTTP request sẽ được inject vào service và chính request đó sẽ được instance `Service` giữ lại ở các request tiếp theo. Do đó, toàn bộ header, input và dữ liệu query string cũng như mọi dữ liệu request khác đều sẽ không chính xác.

Để khắc phục, bạn có thể ngừng đăng ký binding dưới dạng singleton, hoặc inject một request resolver closure vào service để luôn resolve request instance hiện tại. Hoặc, cách được khuyến nghị nhất là chỉ truyền thông tin request cụ thể mà object cần vào một method của object tại runtime:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app['request']);
});

$this->app->singleton(Service::class, function (Application $app) {
    return new Service(fn () => $app['request']);
});

// Or...

$service->method($request->input('name'));
```

Global helper `request` sẽ luôn trả về request mà ứng dụng hiện đang xử lý, vì vậy có thể sử dụng an toàn trong ứng dụng.

> [!WARNING]
> Có thể type-hint instance `Illuminate\Http\Request` trên các controller method và route closure của bạn.

<a name="configuration-repository-injection"></a>
### Inject configuration repository

Nhìn chung, bạn nên tránh inject configuration repository instance vào constructor của các object khác. Ví dụ, binding sau inject configuration repository vào một object được bind dưới dạng singleton:

```php
use App\Service;
use Illuminate\Contracts\Foundation\Application;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(Service::class, function (Application $app) {
        return new Service($app->make('config'));
    });
}
```

Trong ví dụ này, nếu các giá trị cấu hình thay đổi giữa các request, service đó sẽ không truy cập được các giá trị mới vì nó đang phụ thuộc vào repository instance ban đầu.

Để khắc phục, bạn có thể ngừng đăng ký binding dưới dạng singleton, hoặc inject một configuration repository resolver closure vào class:

```php
use App\Service;
use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Service::class, function (Application $app) {
    return new Service($app->make('config'));
});

$this->app->singleton(Service::class, function () {
    return new Service(fn () => Container::getInstance()->make('config'));
});
```

Global helper `config` sẽ luôn trả về phiên bản mới nhất của configuration repository, vì vậy có thể sử dụng an toàn trong ứng dụng.

<a name="managing-memory-leaks"></a>
### Quản lý memory leak

Hãy nhớ rằng Octane giữ ứng dụng trong bộ nhớ giữa các request; do đó, việc thêm dữ liệu vào một mảng được duy trì ở dạng static sẽ gây memory leak. Ví dụ, controller sau có memory leak vì mỗi request đến ứng dụng sẽ tiếp tục thêm dữ liệu vào mảng static `$data`:

```php
use App\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Handle an incoming request.
 */
public function index(Request $request): array
{
    Service::$data[] = Str::random(10);

    return [
        // ...
    ];
}
```

Khi xây dựng ứng dụng, bạn cần đặc biệt cẩn thận để tránh tạo ra các dạng memory leak này. Bạn nên theo dõi mức sử dụng bộ nhớ của ứng dụng trong quá trình phát triển local để đảm bảo không đưa thêm memory leak mới vào ứng dụng.

<a name="concurrent-tasks"></a>
## Tác vụ đồng thời

> [!WARNING]
> Tính năng này yêu cầu [Swoole](#swoole).

Khi sử dụng Swoole, bạn có thể thực thi đồng thời các operation thông qua các background task nhẹ. Bạn có thể thực hiện việc này bằng method `concurrently` của Octane. Có thể kết hợp method này với cú pháp destructuring mảng của PHP để lấy kết quả của từng operation:

```php
use App\Models\User;
use App\Models\Server;
use Laravel\Octane\Facades\Octane;

[$users, $servers] = Octane::concurrently([
    fn () => User::all(),
    fn () => Server::all(),
]);
```

Các tác vụ đồng thời do Octane xử lý sử dụng "task worker" của Swoole và thực thi trong một process hoàn toàn khác với request đến. Số lượng worker khả dụng để xử lý tác vụ đồng thời được xác định bởi directive `--task-workers` trên lệnh `octane:start`:

```shell
php artisan octane:start --workers=4 --task-workers=6
```

Khi gọi method `concurrently`, bạn không nên cung cấp nhiều hơn 1024 task do các giới hạn của hệ thống task của Swoole.

<a name="ticks-and-intervals"></a>
## Tick và interval

> [!WARNING]
> Tính năng này yêu cầu [Swoole](#swoole).

Khi sử dụng Swoole, bạn có thể đăng ký các operation "tick" được thực thi sau mỗi số giây xác định. Bạn có thể đăng ký callback "tick" thông qua method `tick`. Đối số đầu tiên truyền vào method `tick` phải là một chuỗi đại diện cho tên của ticker. Đối số thứ hai phải là một callable được gọi theo interval đã chỉ định.

Trong ví dụ này, chúng ta sẽ đăng ký một closure được gọi mỗi 10 giây. Thông thường, method `tick` nên được gọi trong method `boot` của một trong các service provider của ứng dụng:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
    ->seconds(10);
```

Bằng method `immediate`, bạn có thể yêu cầu Octane gọi tick callback ngay lập tức khi Octane server khởi động ban đầu và sau đó tiếp tục gọi sau mỗi N giây:

```php
Octane::tick('simple-ticker', fn () => ray('Ticking...'))
    ->seconds(10)
    ->immediate();
```

<a name="the-octane-cache"></a>
## Octane Cache

> [!WARNING]
> Tính năng này yêu cầu [Swoole](#swoole).

Khi sử dụng Swoole, bạn có thể tận dụng Octane cache driver, cung cấp tốc độ đọc và ghi lên đến 2 triệu operation mỗi giây. Vì vậy, cache driver này là lựa chọn rất phù hợp cho các ứng dụng cần tốc độ đọc / ghi cực cao từ tầng cache.

Cache driver này được xây dựng trên [Swoole table](https://www.swoole.co.uk/docs/modules/swoole-table). Toàn bộ dữ liệu lưu trong cache đều khả dụng cho tất cả worker trên server. Tuy nhiên, dữ liệu cache sẽ bị xóa khi server được khởi động lại:

```php
Cache::store('octane')->put('framework', 'Laravel', 30);
```

> [!NOTE]
> Số lượng entry tối đa được phép trong Octane cache có thể được định nghĩa trong file cấu hình `octane` của ứng dụng.

<a name="cache-intervals"></a>
### Cache theo interval

Ngoài các method thông thường do hệ thống cache của Laravel cung cấp, Octane cache driver còn hỗ trợ cache dựa trên interval. Các cache này tự động được refresh theo interval đã chỉ định và nên được đăng ký trong method `boot` của một trong các service provider của ứng dụng. Ví dụ, cache sau sẽ được refresh mỗi năm giây:

```php
use Illuminate\Support\Str;

Cache::store('octane')->interval('random', function () {
    return Str::random(10);
}, seconds: 5);
```

<a name="tables"></a>
## Table

> [!WARNING]
> Tính năng này yêu cầu [Swoole](#swoole).

Khi sử dụng Swoole, bạn có thể định nghĩa và tương tác với các [Swoole table](https://www.swoole.co.uk/docs/modules/swoole-table) tùy ý của riêng mình. Swoole table cung cấp throughput hiệu năng cực cao và dữ liệu trong các table này có thể được truy cập bởi tất cả worker trên server. Tuy nhiên, dữ liệu bên trong sẽ bị mất khi server được khởi động lại.

Các table nên được định nghĩa trong mảng cấu hình `tables` của file cấu hình `octane` trong ứng dụng. Một table mẫu cho phép tối đa 1000 row đã được cấu hình sẵn. Kích thước tối đa của các column kiểu string có thể được cấu hình bằng cách chỉ định kích thước column sau kiểu column như bên dưới:

```php
'tables' => [
    'example:1000' => [
        'name' => 'string:1000',
        'votes' => 'int',
    ],
],
```

Để truy cập một table, bạn có thể sử dụng method `Octane::table`:

```php
use Laravel\Octane\Facades\Octane;

Octane::table('example')->set('uuid', [
    'name' => 'Nuno Maduro',
    'votes' => 1000,
]);

return Octane::table('example')->get('uuid');
```

> [!WARNING]
> Các kiểu column được Swoole table hỗ trợ gồm: `string`, `int` và `float`.

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/octane). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
