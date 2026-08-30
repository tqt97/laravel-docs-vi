# Laravel Reverb

<a name="introduction"></a>
## Giới thiệu
[Laravel Reverb](https://github.com/laravel/reverb) mang khả năng giao tiếp WebSocket real-time nhanh và có thể mở rộng trực tiếp vào ứng dụng Laravel, đồng thời tích hợp liền mạch với bộ công cụ [event broadcasting](/docs/{{version}}/broadcasting) hiện có của Laravel.
<a name="installation"></a>
## Cài đặt
Bạn có thể cài Reverb bằng lệnh Artisan `install:broadcasting`:
```shell
php artisan install:broadcasting
```

<a name="configuration"></a>
## Cấu hình
Bên dưới, lệnh Artisan `install:broadcasting` sẽ chạy `reverb:install` để cài Reverb với bộ cấu hình mặc định hợp lý. Nếu cần thay đổi, bạn có thể cập nhật các biến môi trường của Reverb hoặc file `config/reverb.php`.
<a name="application-credentials"></a>
### Thông tin xác thực ứng dụng
Để thiết lập connection tới Reverb, client và server cần trao đổi một bộ thông tin xác thực của "ứng dụng" Reverb. Các thông tin xác thực này được cấu hình ở phía server và dùng để xác minh request từ client. Bạn có thể định nghĩa chúng bằng các biến môi trường sau:
```ini
REVERB_APP_ID=my-app-id
REVERB_APP_KEY=my-app-key
REVERB_APP_SECRET=my-app-secret
```

<a name="allowed-origins"></a>
### Origin được phép
Bạn cũng có thể giới hạn các origin được phép gửi request tới Reverb thông qua giá trị `allowed_origins` trong phần `apps` của `config/reverb.php`. Request từ origin không nằm trong danh sách sẽ bị từ chối. Dùng `*` để cho phép mọi origin:
```php
'apps' => [
    [
        'app_id' => 'my-app-id',
        'allowed_origins' => ['laravel.com'],
        // ...
    ]
]
```

<a name="additional-applications"></a>
### Nhiều ứng dụng
Thông thường, Reverb cung cấp WebSocket server cho chính ứng dụng nơi nó được cài. Tuy nhiên, một bản cài đặt Reverb có thể phục vụ nhiều ứng dụng.
Ví dụ, bạn có thể duy trì một ứng dụng Laravel trung tâm sử dụng Reverb để cung cấp khả năng kết nối WebSocket cho nhiều ứng dụng khác. Điều này được thực hiện bằng cách định nghĩa nhiều `apps` trong `config/reverb.php`:
```php
'apps' => [
    [
        'app_id' => 'my-app-one',
        // ...
    ],
    [
        'app_id' => 'my-app-two',
        // ...
    ],
],
```

<a name="ssl"></a>
### SSL
Trong phần lớn trường hợp, kết nối WebSocket bảo mật được web server phía trước như Nginx xử lý trước khi request được proxy tới Reverb server.
Tuy nhiên, trong một số tình huống như local development, bạn có thể muốn Reverb server tự xử lý kết nối bảo mật. Nếu dùng tính năng site bảo mật của [Laravel Herd](https://herd.laravel.com), hoặc dùng [Laravel Valet](/docs/{{version}}/valet) và đã chạy [lệnh secure](/docs/{{version}}/valet#securing-sites), bạn có thể dùng chứng chỉ do Herd / Valet tạo cho site để bảo vệ Reverb connection. Hãy đặt `REVERB_HOST` thành hostname của site hoặc truyền hostname khi khởi động Reverb server:
```shell
php artisan reverb:start --host="0.0.0.0" --port=8080 --hostname="laravel.test"
```
Vì domain của Herd và Valet resolve về `localhost`, lệnh trên sẽ khiến Reverb server có thể được truy cập qua giao thức WebSocket bảo mật (`wss`) tại `wss://laravel.test:8080`.
Bạn cũng có thể chọn chứng chỉ thủ công bằng cách định nghĩa các tùy chọn `tls` trong `config/reverb.php`. Bên trong mảng `tls`, có thể cung cấp bất kỳ tùy chọn nào được [PHP SSL context](https://www.php.net/manual/en/context.ssl.php) hỗ trợ:
```php
'options' => [
    'tls' => [
        'local_cert' => '/path/to/cert.pem'
    ],
],
```

<a name="running-server"></a>
## Chạy server
Reverb server có thể được khởi động bằng lệnh Artisan `reverb:start`:
```shell
php artisan reverb:start
```
Mặc định, Reverb server chạy tại `0.0.0.0:8080`, nên có thể truy cập từ mọi giao diện mạng.
Nếu cần host hoặc cổng riêng, truyền các option `--host` và `--port` khi khởi động server:
```shell
php artisan reverb:start --host=127.0.0.1 --port=9000
```
Ngoài ra, bạn có thể định nghĩa `REVERB_SERVER_HOST` và `REVERB_SERVER_PORT` trong file `.env`.
Không nên nhầm `REVERB_SERVER_HOST` / `REVERB_SERVER_PORT` với `REVERB_HOST` / `REVERB_PORT`. Cặp đầu xác định host và port nơi chính Reverb server chạy; cặp sau cho Laravel biết nơi gửi thông điệp broadcast. Ví dụ trong production, request tới hostname Reverb công khai ở port `443` có thể được proxy về Reverb server chạy tại `0.0.0.0:8080`. Khi đó các biến môi trường có thể được cấu hình như sau:
```ini
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

REVERB_HOST=ws.laravel.com
REVERB_PORT=443
```

<a name="debugging"></a>
### Gỡ lỗi
Để tối ưu hiệu năng, mặc định Reverb không xuất thông tin gỡ lỗi. Nếu muốn xem luồng dữ liệu đi qua Reverb server, hãy truyền option `--debug` cho lệnh `reverb:start`:
```shell
php artisan reverb:start --debug
```

<a name="restarting"></a>
### Khởi động lại
Reverb là process chạy dài hạn, vì vậy thay đổi code sẽ không có hiệu lực cho tới khi server được restart bằng lệnh Artisan `reverb:restart`.
Lệnh `reverb:restart` đảm bảo mọi connection được đóng một cách êm thấm trước khi server dừng. Nếu Reverb được chạy bằng trình quản lý process như Supervisor, trình quản lý process sẽ tự khởi động lại server sau khi toàn bộ connection đã kết thúc:
```shell
php artisan reverb:restart
```

<a name="monitoring"></a>
## Giám sát
Bạn có thể giám sát Reverb thông qua tích hợp với [Laravel Pulse](/docs/{{version}}/pulse). Khi bật tích hợp Pulse, bạn có thể theo dõi số lượng kết nối và thông điệp mà server đang xử lý.
Để bật tích hợp, trước hết hãy đảm bảo đã [cài Pulse](/docs/{{version}}/pulse#installation). Sau đó thêm recorder của Reverb vào `config/pulse.php`:
```php
use Laravel\Reverb\Pulse\Recorders\ReverbConnections;
use Laravel\Reverb\Pulse\Recorders\ReverbMessages;

'recorders' => [
    ReverbConnections::class => [
        'sample_rate' => 1,
    ],

    ReverbMessages::class => [
        'sample_rate' => 1,
    ],

    // ...
],
```
Tiếp theo, thêm Pulse card tương ứng với từng recorder vào [Pulse dashboard](/docs/{{version}}/pulse#dashboard-customization):
```blade
<x-pulse>
    <livewire:reverb.connections cols="full" />
    <livewire:reverb.messages cols="full" />
    ...
</x-pulse>
```
Hoạt động kết nối được ghi nhận bằng cách polling định kỳ để lấy các cập nhật mới. Để dữ liệu hiển thị đúng trên Pulse dashboard, bạn phải chạy daemon `pulse:check` trên Reverb server. Nếu Reverb được [scale theo chiều ngang](#scaling), chỉ nên chạy daemon này trên một server.
<a name="production"></a>
## Chạy Reverb trong production
Vì WebSocket server là process chạy dài hạn, bạn có thể cần tối ưu server và môi trường hosting để Reverb xử lý hiệu quả số lượng kết nối phù hợp với tài nguyên hiện có.
> [!NOTE]
> [Laravel Cloud](https://cloud.laravel.com) cung cấp hạ tầng WebSocket được quản lý dựa trên cụm Laravel Reverb, giúp mở rộng và triển khai ứng dụng Reverb mà không phải tự quản lý infrastructure.
<a name="open-files"></a>
### Số file đang mở
Mỗi kết nối WebSocket được giữ trong memory cho tới khi client hoặc server ngắt kết nối. Trên Unix và hệ điều hành tương tự Unix, mỗi connection được biểu diễn bằng một file descriptor. Tuy nhiên, cả hệ điều hành lẫn ứng dụng thường giới hạn số lượng file được phép mở đồng thời.
<a name="operating-system"></a>
#### Hệ điều hành
Trên hệ điều hành nền Unix, bạn có thể kiểm tra giới hạn số file đang mở bằng lệnh `ulimit`:
```shell
ulimit -n
```
Lệnh này hiển thị giới hạn số file đang mở cho từng user. Bạn có thể thay đổi các giá trị bằng cách chỉnh `/etc/security/limits.conf`. Ví dụ, để tăng số file mở tối đa lên 10.000 cho user `forge`:
```ini
# /etc/security/limits.conf
forge        soft  nofile  10000
forge        hard  nofile  10000
```

<a name="event-loop"></a>
### Vòng lặp sự kiện
Bên dưới, Reverb dùng event loop của ReactPHP để quản lý kết nối WebSocket. Mặc định event loop này dựa trên `stream_select`, không cần extension bổ sung. Tuy nhiên, `stream_select` thường bị giới hạn ở 1.024 open files. Vì vậy, nếu dự kiến xử lý hơn 1.000 kết nối đồng thời, bạn cần dùng event loop khác không bị giới hạn tương tự.
Khi có sẵn, Reverb tự động chuyển sang event loop dựa trên `ext-uv`. PHP extension này có thể được cài qua PECL:
```shell
pecl install uv
```

<a name="web-server"></a>
### Web server
Trong phần lớn trường hợp, Reverb chạy trên một port không public trực tiếp. Vì vậy, để định tuyến traffic tới Reverb, bạn nên cấu hình reverse proxy. Giả sử Reverb chạy ở `0.0.0.0:8080` và server dùng Nginx, bạn có thể cấu hình site Nginx như sau:
```nginx
server {
    ...

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header SERVER_PORT $server_port;
        proxy_set_header REMOTE_ADDR $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";

        proxy_pass http://0.0.0.0:8080;
    }

    ...
}
```
> [!WARNING]
> Reverb lắng nghe kết nối WebSocket tại `/app` và xử lý API request tại `/apps`. Hãy đảm bảo web server đứng trước Reverb có thể phục vụ cả hai URI. Nếu dùng [Laravel Forge](https://forge.laravel.com) để quản lý server, Reverb server sẽ được cấu hình đúng mặc định.
Web server thường giới hạn số connection để tránh quá tải. Để tăng số connection cho Nginx lên 10.000, hãy cập nhật `worker_rlimit_nofile` và `worker_connections` trong `nginx.conf`:
```nginx
user forge;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
worker_rlimit_nofile 10000;

events {
  worker_connections 10000;
  multi_accept on;
}
```
Cấu hình trên cho phép tối đa 10.000 kết nối Nginx trên mỗi worker process và đặt giới hạn file mở của Nginx thành 10.000.
<a name="ports"></a>
### Cổng
Hệ điều hành nền Unix thường giới hạn phạm vi cổng có thể mở. Bạn có thể xem range hiện tại bằng lệnh sau:
```shell
cat /proc/sys/net/ipv4/ip_local_port_range
# 32768	60999
```
Output trên cho thấy server có thể xử lý tối đa 28.231 connection (60.999 - 32.768), vì mỗi connection cần một cổng khả dụng. Dù [mở rộng theo chiều ngang](#scaling) thường là lựa chọn tốt hơn để tăng năng lực xử lý, bạn cũng có thể mở rộng phạm vi cổng trong `/etc/sysctl.conf`.
<a name="process-management"></a>
### Quản lý process
Trong production, bạn nên dùng trình quản lý process như Supervisor để đảm bảo Reverb server luôn chạy. Nếu dùng Supervisor, hãy cập nhật `minfds` trong `supervisor.conf` để Supervisor có thể mở đủ số file cần thiết cho các kết nối của Reverb:
```ini
[supervisord]
...
minfds=10000
```

<a name="scaling"></a>
### Mở rộng hệ thống
Nếu cần xử lý nhiều kết nối hơn khả năng của một server, bạn có thể scale Reverb theo chiều ngang. Nhờ khả năng publish / subscribe của Redis, Reverb quản lý kết nối trên nhiều server. Khi một Reverb server nhận thông điệp, nó dùng Redis để publish thông điệp đó tới các Reverb server còn lại.
Để bật mở rộng theo chiều ngang, đặt biến môi trường `REVERB_SCALING_ENABLED` thành `true` trong `.env`:
```env
REVERB_SCALING_ENABLED=true
```
Tiếp theo, bạn cần một Redis server trung tâm để tất cả Reverb server cùng kết nối. Reverb sử dụng [Redis connection mặc định của ứng dụng](/docs/{{version}}/redis#configuration) để publish thông điệp tới toàn bộ Reverb server.
Sau khi bật scaling và cấu hình Redis, bạn chỉ cần chạy `reverb:start` trên nhiều server có thể giao tiếp với Redis. Các Reverb server này nên nằm sau load balancer để phân phối request đồng đều.
<a name="events"></a>
## Sự kiện
Reverb dispatch các sự kiện nội bộ trong vòng đời của kết nối và quá trình xử lý thông điệp. Bạn có thể [lắng nghe các sự kiện này](/docs/{{version}}/events) để thực hiện hành động khi kết nối được quản lý hoặc thông điệp được trao đổi.
Các sự kiện sau được Reverb dispatch:
#### `Laravel\Reverb\Events\ChannelCreated`

Được dispatch khi một channel được tạo, thường xảy ra khi kết nối đầu tiên subscribe vào channel đó. Sự kiện nhận instance `Laravel\Reverb\Protocols\Pusher\Channel`.
#### `Laravel\Reverb\Events\ChannelRemoved`

Được dispatch khi một channel bị xóa, thường xảy ra khi kết nối cuối cùng unsubscribe khỏi channel. Sự kiện nhận instance `Laravel\Reverb\Protocols\Pusher\Channel`.
#### `Laravel\Reverb\Events\ConnectionPruned`

Được dispatch khi server loại bỏ một kết nối stale. Sự kiện nhận instance `Laravel\Reverb\Contracts\Connection`.
#### `Laravel\Reverb\Events\MessageReceived`

Được dispatch khi server nhận thông điệp từ client connection. Sự kiện nhận instance `Laravel\Reverb\Contracts\Connection` và chuỗi thô `$message`.
#### `Laravel\Reverb\Events\MessageSent`

Được dispatch khi thông điệp được gửi tới kết nối client. Sự kiện nhận instance `Laravel\Reverb\Contracts\Connection` và chuỗi thô `$message`.
