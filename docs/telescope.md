# Laravel Telescope
<a name="introduction"></a>
## Giới thiệu
[Laravel Telescope](https://github.com/laravel/telescope) là công cụ rất hữu ích cho môi trường phát triển Laravel cục bộ. Telescope giúp quan sát request đi vào ứng dụng, exception, log entry, database query, queued job, mail, notification, thao tác cache, scheduled task, variable dump và nhiều dữ liệu khác.
<img src="https://laravel.com/img/docs/telescope-example.png">

<a name="installation"></a>
[Laravel Telescope](https://github.com/laravel/telescope) là công cụ rất hữu ích cho môi trường phát triển Laravel cục bộ. Telescope giúp quan sát request đi vào ứng dụng, exception, log entry, database query, queued job, mail, notification, thao tác cache, scheduled task, variable dump và nhiều dữ liệu khác.
```shell
composer require laravel/telescope
```
Sau khi cài Telescope, hãy publish asset và migration bằng lệnh Artisan `telescope:install`. Tiếp theo, chạy `migrate` để tạo các table cần thiết cho việc lưu dữ liệu Telescope:
```shell
php artisan telescope:install

php artisan migrate
```
Bạn có thể cài Telescope vào dự án Laravel bằng Composer:
<a name="local-only-installation"></a>
Sau khi cài Telescope, hãy publish asset và migration bằng lệnh Artisan `telescope:install`. Tiếp theo, chạy `migrate` để tạo các table cần thiết cho việc lưu dữ liệu Telescope:
```shell
composer require laravel/telescope --dev

php artisan telescope:install

php artisan migrate
```
Sau đó, bạn có thể truy cập dashboard Telescope qua route `/telescope`.
```php
/**
 * Register any application services.
 */
public function register(): void
{
    if ($this->app->environment('local') && class_exists(\Laravel\Telescope\TelescopeServiceProvider::class)) {
        $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
        $this->app->register(TelescopeServiceProvider::class);
    }
}
```
### Chỉ cài cho local
```json
"extra": {
    "laravel": {
        "dont-discover": [
            "laravel/telescope"
        ]
    }
},
```

<a name="configuration"></a>
### Cấu hình
Sau khi publish asset, file cấu hình chính của Telescope nằm tại `config/telescope.php`. File này cho phép cấu hình các [watcher](#available-watchers). Mỗi option đều có mô tả mục đích, vì vậy bạn nên đọc kỹ file để hiểu toàn bộ khả năng tùy chỉnh.
Nếu cần, bạn có thể tắt hoàn toàn việc thu thập dữ liệu của Telescope thông qua option `enabled`:
```php
'enabled' => env('TELESCOPE_ENABLED', true),
```

<a name="content-security-policy-csp-nonce"></a>
#### Nonce cho Content Security Policy (CSP)
Nếu muốn dùng [nonce attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) trên các thẻ script và style của Telescope như một phần của [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), hãy dùng method `Telescope::cspNonce` để chỉ định nonce. Thông thường method này nên được gọi trong middleware để mỗi request có nonce mới:
```php
use Closure;
use Illuminate\Http\Request;
use Laravel\Telescope\Telescope;
use Symfony\Component\HttpFoundation\Response;

public function handle(Request $request, Closure $next): Response
{
    Telescope::cspNonce('csp-nonce');

    return $next($request);
}
```
Sau khi publish asset, file cấu hình chính của Telescope nằm tại `config/telescope.php`. File này cho phép cấu hình các [watcher](#available-watchers). Mỗi option đều có mô tả mục đích, vì vậy bạn nên đọc kỹ file để hiểu toàn bộ khả năng tùy chỉnh.
```php
'middleware' => [
    'web',
    App\Http\Middleware\AddTelescopeCspNonce::class,
    Authorize::class,
],
```

<a name="data-pruning"></a>
### Dọn dữ liệu
Nếu không dọn định kỳ, table `telescope_entries` có thể tăng rất nhanh. Để kiểm soát dung lượng, hãy [schedule](/docs/{{version}}/scheduling) lệnh Artisan `telescope:prune` chạy hằng ngày:
```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune')->daily();
```
Nếu muốn dùng [nonce attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) trên các thẻ script và style của Telescope như một phần của [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), hãy dùng method `Telescope::cspNonce` để chỉ định nonce. Thông thường method này nên được gọi trong middleware để mỗi request có nonce mới:
```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('telescope:prune --hours=48')->daily();
```
Bạn có thể thêm middleware này vào option `middleware` trong `config/telescope.php`:
<a name="dashboard-authorization"></a>
### Phân quyền dashboard
Dashboard Telescope được truy cập qua route `/telescope`. Mặc định, dashboard chỉ có thể truy cập trong environment `local`. File `app/Providers/TelescopeServiceProvider.php` chứa định nghĩa [authorization gate](/docs/{{version}}/authorization#gates) kiểm soát quyền truy cập Telescope ở environment **không phải local**. Bạn có thể sửa gate này để giới hạn quyền truy cập phù hợp với ứng dụng:
```php
use App\Models\User;

/**
 * Register the Telescope gate.
 *
 * This gate determines who can access Telescope in non-local environments.
 */
protected function gate(): void
{
    Gate::define('viewTelescope', function (User $user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```
### Dọn dữ liệu
<a name="upgrading-telescope"></a>
## Nâng cấp Telescope
Khi nâng cấp lên major version mới của Telescope, bạn nên đọc kỹ [upgrade guide](https://github.com/laravel/telescope/blob/master/UPGRADE.md).
Ngoài ra, mỗi khi nâng cấp Telescope, bạn nên publish lại các asset của package:
```shell
php artisan telescope:publish
```
Để asset luôn đồng bộ và tránh lỗi ở các lần update sau, bạn có thể thêm command `vendor:publish --tag=laravel-assets` vào script `post-update-cmd` trong `composer.json`:
```json
{
    "scripts": {
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ]
    }
}
```

<a name="filtering"></a>
Dashboard Telescope được truy cập qua route `/telescope`. Mặc định, dashboard chỉ có thể truy cập trong environment `local`. File `app/Providers/TelescopeServiceProvider.php` chứa định nghĩa [authorization gate](/docs/{{version}}/authorization#gates) kiểm soát quyền truy cập Telescope ở environment **không phải local**. Bạn có thể sửa gate này để giới hạn quyền truy cập phù hợp với ứng dụng:
<a name="filtering-entries"></a>
> [!WARNING]
> Hãy đảm bảo biến môi trường `APP_ENV` được đặt thành `production` trên production. Nếu không, Telescope có thể bị public ra ngoài.
```php
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::filter(function (IncomingEntry $entry) {
        if ($this->app->environment('local')) {
            return true;
        }

        return $entry->isReportableException() ||
            $entry->isFailedJob() ||
            $entry->isScheduledTask() ||
            $entry->isSlowQuery() ||
            $entry->hasMonitoredTag();
    });
}
```
## Nâng cấp Telescope
<a name="filtering-batches"></a>
Ngoài ra, mỗi khi nâng cấp Telescope, bạn nên publish lại các asset của package:
```php
use Illuminate\Support\Collection;
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::filterBatch(function (Collection $entries) {
        if ($this->app->environment('local')) {
            return true;
        }

        return $entries->contains(function (IncomingEntry $entry) {
            return $entry->isReportableException() ||
                $entry->isFailedJob() ||
                $entry->isScheduledTask() ||
                $entry->isSlowQuery() ||
                $entry->hasMonitoredTag();
            });
    });
}
```
Để asset luôn đồng bộ và tránh lỗi ở các lần update sau, bạn có thể thêm command `vendor:publish --tag=laravel-assets` vào script `post-update-cmd` trong `composer.json`:
<a name="tagging"></a>
## Gắn tag
Telescope cho phép tìm entry theo "tag". Tag thường là tên class Eloquent model hoặc ID của authenticated user và được Telescope tự động thêm. Khi cần tag riêng, dùng method `Telescope::tag`. Method nhận closure trả về mảng tag; các tag này được merge với tag Telescope tự thêm. Thông thường, hãy gọi `tag` trong method `register` của `App\Providers\TelescopeServiceProvider`:
```php
use Laravel\Telescope\EntryType;
use Laravel\Telescope\IncomingEntry;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->hideSensitiveRequestDetails();

    Telescope::tag(function (IncomingEntry $entry) {
        return $entry->type === EntryType::REQUEST
            ? ['status:'.$entry->content['response_status']]
            : [];
    });
}
```
## Lọc dữ liệu
<a name="available-watchers"></a>
### Entries
```php
'watchers' => [
    Watchers\CacheWatcher::class => true,
    Watchers\CommandWatcher::class => true,
    // ...
],
```
Một số watcher còn hỗ trợ các option tùy chỉnh bổ sung:
```php
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 100,
    ],
    // ...
],
```

<a name="batch-watcher"></a>
Trong khi closure `filter` lọc từng entry riêng lẻ, method `filterBatch` cho phép đăng ký closure lọc toàn bộ dữ liệu của một request hoặc console command. Nếu closure trả về `true`, tất cả entry trong batch sẽ được Telescope ghi lại:
<a name="cache-watcher"></a>
### Cache Watcher
Cache watcher ghi dữ liệu khi cache key được hit, miss, cập nhật hoặc bị xóa.
<a name="command-watcher"></a>
## Gắn tag
```php
'watchers' => [
    Watchers\CommandWatcher::class => [
        'enabled' => env('TELESCOPE_COMMAND_WATCHER', true),
        'ignore' => ['key:generate'],
    ],
    // ...
],
```

<a name="dump-watcher"></a>
### Dump Watcher
Dump watcher ghi và hiển thị variable dump trong Telescope. Với Laravel, bạn có thể dump biến bằng global function `dump`. Tab dump watcher phải đang mở trong trình duyệt thì dump mới được ghi; nếu không, các dump sẽ bị watcher bỏ qua.
<a name="event-watcher"></a>
"Watcher" của Telescope thu thập dữ liệu ứng dụng khi request hoặc console command được thực thi. Bạn có thể tùy chỉnh danh sách watcher được bật trong `config/telescope.php`:
<a name="exception-watcher"></a>
Một số watcher còn hỗ trợ các option tùy chỉnh bổ sung:
<a name="gate-watcher"></a>
### Gate Watcher
Gate watcher ghi dữ liệu và kết quả của các lần kiểm tra [gate và policy](/docs/{{version}}/authorization). Nếu muốn loại trừ một số ability, hãy thêm chúng vào option `ignore_abilities` trong `config/telescope.php`:
```php
'watchers' => [
    Watchers\GateWatcher::class => [
        'enabled' => env('TELESCOPE_GATE_WATCHER', true),
        'ignore_abilities' => ['viewNova'],
    ],
    // ...
],
```
### Batch Watcher
<a name="http-client-watcher"></a>
### HTTP Client Watcher
HTTP client watcher ghi các [HTTP client request](/docs/{{version}}/http-client) đi ra ngoài do ứng dụng thực hiện.
<a name="job-watcher"></a>
Cache watcher ghi dữ liệu khi cache key được hit, miss, cập nhật hoặc bị xóa.
<a name="log-watcher"></a>
### Command Watcher
```php
'watchers' => [
    Watchers\LogWatcher::class => [
        'enabled' => env('TELESCOPE_LOG_WATCHER', true),
        'level' => 'debug',
    ],

    // ...
],
```

<a name="mail-watcher"></a>
### Mail Watcher
Mail watcher cho phép preview [email](/docs/{{version}}/mail) đã gửi ngay trong trình duyệt cùng dữ liệu liên quan. Bạn cũng có thể tải email dưới dạng file `.eml`.
<a name="model-watcher"></a>
Dump watcher ghi và hiển thị variable dump trong Telescope. Với Laravel, bạn có thể dump biến bằng global function `dump`. Tab dump watcher phải đang mở trong trình duyệt thì dump mới được ghi; nếu không, các dump sẽ bị watcher bỏ qua.
```php
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
    ],
    // ...
],
```
### Event Watcher
```php
'watchers' => [
    Watchers\ModelWatcher::class => [
        'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
        'events' => ['eloquent.created*', 'eloquent.updated*'],
        'hydrations' => true,
    ],
    // ...
],
```

<a name="notification-watcher"></a>
Exception watcher ghi dữ liệu và stack trace của mọi reportable exception được ứng dụng throw ra.
<a name="query-watcher"></a>
### Gate Watcher
```php
'watchers' => [
    Watchers\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 50,
    ],
    // ...
],
```

<a name="redis-watcher"></a>
### Redis Watcher
Redis watcher ghi mọi command [Redis](/docs/{{version}}/redis) mà ứng dụng thực thi. Nếu dùng Redis làm cache, cache command cũng được Redis watcher ghi lại.
<a name="request-watcher"></a>
HTTP client watcher ghi các [HTTP client request](/docs/{{version}}/http-client) đi ra ngoài do ứng dụng thực hiện.
```php
'watchers' => [
    Watchers\RequestWatcher::class => [
        'enabled' => env('TELESCOPE_REQUEST_WATCHER', true),
        'size_limit' => env('TELESCOPE_RESPONSE_SIZE_LIMIT', 64),
    ],
    // ...
],
```
### Job Watcher
<a name="schedule-watcher"></a>
### Schedule Watcher
Schedule watcher ghi command và output của mọi [scheduled task](/docs/{{version}}/scheduling) được ứng dụng chạy.
<a name="view-watcher"></a>
Log watcher ghi [log data](/docs/{{version}}/logging) cho các log do ứng dụng tạo.
<a name="displaying-user-avatars"></a>
## Hiển thị avatar người dùng
Dashboard Telescope hiển thị avatar của user đã được authenticate tại thời điểm entry được lưu. Mặc định, Telescope lấy avatar từ dịch vụ Gravatar. Bạn có thể tùy biến URL avatar bằng cách đăng ký callback trong `App\Providers\TelescopeServiceProvider`. Callback nhận user ID và email, sau đó phải trả về URL ảnh avatar của user:
```php
use App\Models\User;
use Laravel\Telescope\Telescope;

/**
 * Register any application services.
 */
public function register(): void
{
    // ...

    Telescope::avatar(function (?string $id, ?string $email) {
        return ! is_null($id)
            ? '/avatars/'.User::find($id)->avatar_path
            : '/generic-avatar.jpg';
    });
}
```
