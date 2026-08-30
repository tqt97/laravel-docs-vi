# Laravel Horizon

<a name="introduction"></a>
## Giới thiệu

> [!NOTE]
> Trước khi tìm hiểu Laravel Horizon, bạn nên làm quen với [dịch vụ queue](/queues) cơ bản của Laravel. Horizon bổ sung thêm nhiều tính năng cho queue của Laravel; những tính năng này có thể khó hiểu nếu bạn chưa nắm các chức năng queue nền tảng mà Laravel cung cấp.

[Laravel Horizon](https://github.com/laravel/horizon) cung cấp dashboard trực quan và cơ chế cấu hình bằng code cho [Redis queue](/queues) của ứng dụng Laravel. Horizon giúp bạn dễ dàng theo dõi các metric quan trọng của hệ thống queue như thông lượng job, thời gian chạy và các job thất bại.

Khi sử dụng Horizon, toàn bộ cấu hình queue worker được lưu trong một file cấu hình duy nhất, đơn giản. Việc định nghĩa cấu hình worker của ứng dụng trong file được quản lý bằng version control giúp bạn dễ dàng scale hoặc thay đổi các queue worker khi triển khai ứng dụng.

<img src="https://laravel.com/img/docs/horizon-example.png">

<a name="installation"></a>
## Cài đặt

> [!WARNING]
> Laravel Horizon yêu cầu queue của bạn sử dụng [Redis](https://redis.io). Vì vậy, hãy đảm bảo queue connection được đặt thành `redis` trong file cấu hình `config/queue.php` của ứng dụng. Hiện tại Horizon không tương thích với Redis Cluster.

Bạn có thể cài Horizon vào project bằng Composer:

```shell
composer require laravel/horizon
```

Sau khi cài Horizon, hãy publish các asset của Horizon bằng lệnh Artisan `horizon:install`:

```shell
php artisan horizon:install
```

<a name="configuration"></a>
### Cấu hình

Sau khi publish asset của Horizon, file cấu hình chính sẽ nằm tại `config/horizon.php`. File này cho phép bạn cấu hình các tùy chọn queue worker của ứng dụng. Mỗi tùy chọn đều có phần mô tả mục đích, vì vậy bạn nên xem kỹ toàn bộ file này.

> [!WARNING]
> Horizon sử dụng nội bộ một Redis connection có tên `horizon`. Tên connection này được dành riêng và không nên được gán cho Redis connection khác trong file cấu hình `database.php`, cũng như không được dùng làm giá trị của tùy chọn `use` trong file `horizon.php`.

<a name="content-security-policy-csp-nonce"></a>
#### Nonce cho Content Security Policy (CSP)

Nếu muốn sử dụng [thuộc tính nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) cho các thẻ script và style trong view của Horizon như một phần của [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), bạn có thể dùng phương thức `Horizon::cspNonce` để chỉ định nonce. Thông thường, phương thức này nên được gọi trong middleware để mỗi request được gán một nonce mới:

```php
use Closure;
use Illuminate\Http\Request;
use Laravel\Horizon\Horizon;
use Symfony\Component\HttpFoundation\Response;

public function handle(Request $request, Closure $next): Response
{
    Horizon::cspNonce('csp-nonce');

    return $next($request);
}
```

Bạn có thể thêm middleware này vào tùy chọn `middleware` trong file cấu hình `config/horizon.php` của ứng dụng:

```php
'middleware' => [
    'web',
    App\Http\Middleware\AddHorizonCspNonce::class,
],
```

<a name="environments"></a>
#### Environment

Sau khi cài đặt, tùy chọn cấu hình Horizon quan trọng nhất mà bạn nên làm quen là `environments`. Đây là một mảng các environment mà ứng dụng chạy trên đó và định nghĩa các tùy chọn worker process cho từng environment. Mặc định, cấu hình này có environment `production` và `local`; tuy nhiên, bạn có thể thêm các environment khác khi cần:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],
    ],

    'local' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],
    ],
],
```

Bạn cũng có thể định nghĩa environment wildcard (`*`), được sử dụng khi không tìm thấy environment nào khác khớp:

```php
'environments' => [
    // ...

    '*' => [
        'supervisor-1' => [
            'maxProcesses' => 3,
        ],
    ],
],
```

Khi khởi động Horizon, nó sẽ sử dụng các tùy chọn cấu hình worker process tương ứng với environment hiện tại của ứng dụng. Thông thường, environment được xác định bởi giá trị của [biến môi trường](/configuration#determining-the-current-environment) `APP_ENV`. Ví dụ, environment `local` mặc định của Horizon được cấu hình để khởi động ba worker process và tự động cân bằng số worker được gán cho từng queue. Environment `production` mặc định được cấu hình để khởi động tối đa 10 worker process và tự động cân bằng số worker giữa các queue.

> [!WARNING]
> Hãy đảm bảo phần `environments` trong file cấu hình `horizon` có entry cho từng [environment](/configuration#environment-configuration) mà bạn dự định chạy Horizon.

<a name="supervisors"></a>
#### Supervisor

Như bạn có thể thấy trong file cấu hình mặc định của Horizon, mỗi environment có thể chứa một hoặc nhiều "supervisor". Mặc định, file cấu hình định nghĩa supervisor là `supervisor-1`; tuy nhiên, bạn có thể đặt tên supervisor tùy ý. Về cơ bản, mỗi supervisor chịu trách nhiệm giám sát một nhóm worker process và cân bằng các worker process giữa các queue.

Bạn có thể thêm supervisor vào một environment nếu muốn định nghĩa một nhóm worker process mới chạy trong environment đó. Cách này hữu ích khi bạn muốn áp dụng chiến lược cân bằng khác hoặc số lượng worker process khác cho một queue cụ thể của ứng dụng.

<a name="maintenance-mode"></a>
#### Maintenance Mode

Khi ứng dụng ở [maintenance mode](/configuration#maintenance-mode), Horizon sẽ không xử lý queued job trừ khi tùy chọn `force` của supervisor được đặt thành `true` trong file cấu hình Horizon:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'force' => true,
        ],
    ],
],
```

<a name="default-values"></a>
#### Giá trị mặc định

Trong file cấu hình mặc định của Horizon có tùy chọn `defaults`. Tùy chọn này chỉ định các giá trị mặc định cho [supervisor](#supervisors) của ứng dụng. Các giá trị cấu hình mặc định sẽ được merge vào cấu hình supervisor của từng environment, giúp tránh lặp lại không cần thiết khi định nghĩa supervisor.

<a name="dashboard-authorization"></a>
### Ủy quyền Dashboard

Dashboard Horizon có thể được truy cập qua route `/horizon`. Mặc định, bạn chỉ có thể truy cập dashboard này trong environment `local`. Tuy nhiên, file `app/Providers/HorizonServiceProvider.php` có định nghĩa một [authorization gate](/authorization#gates). Gate này kiểm soát quyền truy cập Horizon trong các environment **không phải local**. Bạn có thể sửa gate theo nhu cầu để giới hạn quyền truy cập vào Horizon:

```php
/**
 * Register the Horizon gate.
 *
 * This gate determines who can access Horizon in non-local environments.
 */
protected function gate(): void
{
    Gate::define('viewHorizon', function (User $user) {
        return in_array($user->email, [
            'taylor@laravel.com',
        ]);
    });
}
```

<a name="alternative-authentication-strategies"></a>
#### Chiến lược xác thực thay thế

Laravel tự động inject người dùng đã xác thực vào gate closure. Nếu ứng dụng bảo vệ Horizon bằng phương thức khác, chẳng hạn giới hạn IP, người dùng Horizon có thể không cần "đăng nhập". Khi đó, bạn cần đổi signature của closure từ `function (User $user)` thành `function (User $user = null)` để Laravel không bắt buộc authentication.

<a name="max-job-attempts"></a>
### Số lần thử tối đa của Job

> [!NOTE]
> Trước khi tinh chỉnh các tùy chọn này, hãy chắc chắn rằng bạn đã quen với [dịch vụ queue](/queues#max-job-attempts-and-timeout) mặc định của Laravel và khái niệm "attempt".

Bạn có thể định nghĩa số lần thử tối đa mà một job được phép sử dụng trong cấu hình của supervisor:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'tries' => 10,
        ],
    ],
],
```

> [!NOTE]
> Tùy chọn này tương tự tùy chọn `--tries` khi sử dụng lệnh Artisan để xử lý queue.

Việc điều chỉnh tùy chọn `tries` đặc biệt quan trọng khi sử dụng middleware như `WithoutOverlapping` hoặc `RateLimited` vì chúng tiêu tốn số lần thử. Bạn có thể xử lý bằng cách điều chỉnh `tries` ở cấp supervisor hoặc định nghĩa property `$tries` trên job class.

Nếu không thiết lập `tries`, Horizon mặc định chỉ thử một lần, trừ khi job class định nghĩa `$tries`; giá trị trên job class sẽ được ưu tiên hơn cấu hình Horizon.

Đặt `tries` hoặc `$tries` thành `0` cho phép thử không giới hạn, phù hợp khi không thể xác định trước số lần thử cần thiết. Để tránh job thất bại vô hạn, bạn có thể giới hạn số exception được phép bằng property `$maxExceptions` trên job class.

<a name="job-timeout"></a>
### Timeout của Job

Tương tự, bạn có thể đặt giá trị `timeout` ở cấp supervisor để xác định số giây tối đa một worker process được phép chạy job trước khi bị buộc dừng. Sau khi bị dừng, job sẽ được thử lại hoặc đánh dấu thất bại tùy theo cấu hình queue:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'timeout' => 60,
        ],
    ],
],
```

> [!WARNING]
> Khi sử dụng chiến lược cân bằng `auto`, trong quá trình scale down Horizon sẽ xem các worker đang chạy quá thời gian timeout của Horizon là "bị treo" và buộc dừng chúng. Hãy luôn đảm bảo timeout của Horizon lớn hơn mọi timeout ở cấp job, nếu không job có thể bị dừng giữa chừng. Ngoài ra, giá trị `timeout` phải luôn ngắn hơn ít nhất vài giây so với `retry_after` trong file `config/queue.php`; nếu không, job có thể bị xử lý hai lần.

<a name="job-backoff"></a>
### Backoff của Job

Bạn có thể định nghĩa `backoff` ở cấp supervisor để chỉ định Horizon phải chờ bao lâu trước khi thử lại một job gặp exception chưa được xử lý:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'backoff' => 10,
        ],
    ],
],
```

Bạn cũng có thể cấu hình backoff tăng dần bằng cách dùng một mảng cho giá trị `backoff`. Trong ví dụ này, độ trễ retry là 1 giây cho lần retry đầu tiên, 5 giây cho lần thứ hai, 10 giây cho lần thứ ba và 10 giây cho mọi lần retry tiếp theo nếu vẫn còn lượt thử:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'backoff' => [1, 5, 10],
        ],
    ],
],
```

<a name="other-worker-options"></a>
### Các tùy chọn Worker khác

Ngoài `tries`, `timeout` và `backoff`, mỗi supervisor còn nhận một số tùy chọn khác để kiểm soát cách worker process hoạt động và thời điểm chúng tự động restart. Restart worker định kỳ là thực hành tốt cho các process chạy lâu vì giúp hạn chế memory leak:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'memory' => 128,
            'maxJobs' => 1000,
            'maxTime' => 3600,
            'sleep' => 3,
            'rest' => 0,
            'nice' => 0,
        ],
    ],
],
```

<div class="content-list" markdown="1">

- `memory` xác định lượng bộ nhớ tối đa, tính bằng megabyte, mà một worker process có thể sử dụng trước khi được restart. Mặc định là `128`.
- `maxJobs` xác định số job worker xử lý trước khi restart. Giá trị `0` nghĩa là worker không restart dựa trên số job đã xử lý. Mặc định là `0`.
- `maxTime` xác định số giây worker được chạy trước khi restart. Giá trị `0` nghĩa là worker không restart dựa trên thời gian. Mặc định là `0`.
- `sleep` xác định số giây worker chờ khi không có job trước khi poll queue để tìm job mới. Mặc định là `3`.
- `rest` xác định số giây tạm nghỉ giữa mỗi job được xử lý. Mặc định là `0`.
- `nice` xác định mức "niceness" (độ ưu tiên scheduling) của worker process. Giá trị càng cao thì process có độ ưu tiên càng thấp. Mặc định là `0`.

</div>

<a name="silenced-jobs"></a>
### Ẩn Job

Đôi khi bạn không cần xem một số job được dispatch bởi ứng dụng hoặc package bên thứ ba. Thay vì để các job này chiếm chỗ trong danh sách "Completed Jobs", bạn có thể ẩn chúng. Để bắt đầu, hãy thêm tên class của job vào tùy chọn `silenced` trong file cấu hình `horizon` của ứng dụng:

```php
'silenced' => [
    App\Jobs\ProcessPodcast::class,
],
```

Ngoài việc ẩn từng job class, Horizon còn hỗ trợ ẩn job dựa trên [tag](#tags). Điều này hữu ích khi bạn muốn ẩn nhiều job có chung một tag:

```php
'silenced_tags' => [
    'notifications'
],
```

Ngoài ra, job bạn muốn ẩn có thể triển khai interface `Laravel\Horizon\Contracts\Silenced`. Nếu job triển khai interface này, nó sẽ tự động bị ẩn ngay cả khi không có trong mảng cấu hình `silenced`:

```php
use Laravel\Horizon\Contracts\Silenced;

class ProcessPodcast implements ShouldQueue, Silenced
{
    use Queueable;

    // ...
}
```

<a name="balancing-strategies"></a>
## Chiến lược cân bằng

Mỗi supervisor có thể xử lý một hoặc nhiều queue. Khác với hệ thống queue mặc định của Laravel, Horizon cho phép bạn chọn một trong ba chiến lược cân bằng worker: `auto`, `simple` và `false`.

<a name="auto-balancing"></a>
### Cân bằng tự động

Chiến lược `auto`, cũng là chiến lược mặc định, điều chỉnh số worker process cho mỗi queue dựa trên workload hiện tại. Ví dụ, nếu queue `notifications` có 1.000 job đang chờ trong khi queue `default` trống, Horizon sẽ phân bổ thêm worker cho queue `notifications` cho đến khi queue được xử lý hết.

Khi sử dụng chiến lược `auto`, bạn cũng có thể cấu hình các tùy chọn `minProcesses` và `maxProcesses`:

<div class="content-list" markdown="1">

- `minProcesses` xác định số worker process tối thiểu cho mỗi queue. Giá trị này phải lớn hơn hoặc bằng 1.
- `maxProcesses` xác định tổng số worker process tối đa mà Horizon có thể scale lên trên tất cả queue. Thông thường, giá trị này nên lớn hơn số queue nhân với `minProcesses`. Để ngăn supervisor tạo bất kỳ process nào, bạn có thể đặt giá trị này thành `0`.

</div>

Ví dụ, bạn có thể cấu hình Horizon duy trì ít nhất một process cho mỗi queue và scale tối đa tổng cộng 10 worker process:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection' => 'redis',
            'queue' => ['default', 'notifications'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'minProcesses' => 1,
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],
    ],
],
```

Tùy chọn cấu hình `autoScalingStrategy` xác định cách Horizon phân bổ thêm worker process cho các queue. Bạn có thể chọn một trong hai chiến lược:

<div class="content-list" markdown="1">

- Chiến lược `time` phân bổ worker dựa trên tổng thời gian ước tính cần thiết để xử lý hết queue.
- Chiến lược `size` phân bổ worker dựa trên tổng số job trong queue.

</div>

Các giá trị cấu hình `balanceMaxShift` và `balanceCooldown` xác định tốc độ Horizon scale để đáp ứng nhu cầu worker. Trong ví dụ trên, tối đa một process mới sẽ được tạo hoặc hủy sau mỗi ba giây. Bạn có thể điều chỉnh các giá trị này khi cần dựa trên nhu cầu của ứng dụng.

<a name="auto-queue-priorities"></a>
#### Độ ưu tiên Queue và Cân bằng tự động

Khi sử dụng chiến lược cân bằng `auto`, Horizon không áp đặt độ ưu tiên nghiêm ngặt giữa các queue. Thứ tự queue trong cấu hình của supervisor không ảnh hưởng đến cách worker process được phân bổ. Thay vào đó, Horizon dựa vào `autoScalingStrategy` đã chọn để phân bổ động worker process theo tải của queue.

Ví dụ, trong cấu hình sau, queue `high` không được ưu tiên hơn queue `default`, dù nó xuất hiện trước trong danh sách:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['high', 'default'],
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],
    ],
],
```

Nếu cần áp đặt độ ưu tiên tương đối giữa các queue, bạn có thể định nghĩa nhiều supervisor và phân bổ tài nguyên xử lý một cách tường minh:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default'],
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],
        'supervisor-2' => [
            // ...
            'queue' => ['images'],
            'minProcesses' => 1,
            'maxProcesses' => 1,
        ],
    ],
],
```

Trong ví dụ này, queue `default` có thể scale lên tối đa 10 process, trong khi queue `images` bị giới hạn ở một process. Cấu hình này đảm bảo các queue có thể scale độc lập.

> [!NOTE]
> Khi dispatch các job tiêu tốn nhiều tài nguyên, đôi khi tốt nhất là đưa chúng vào một queue riêng với giá trị `maxProcesses` bị giới hạn. Nếu không, các job này có thể sử dụng quá nhiều tài nguyên CPU và làm hệ thống quá tải.

<a name="simple-balancing"></a>
### Cân bằng đơn giản

Chiến lược `simple` phân bổ đều worker process cho các queue đã chỉ định. Với chiến lược này, Horizon không tự động scale số lượng worker process mà sử dụng một số lượng process cố định:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default', 'notifications'],
            'balance' => 'simple',
            'processes' => 10,
        ],
    ],
],
```

Trong ví dụ trên, Horizon sẽ phân bổ 5 process cho mỗi queue, chia đều tổng số 10 process.

Nếu muốn kiểm soát riêng số worker process được phân bổ cho từng queue, bạn có thể định nghĩa nhiều supervisor:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default'],
            'balance' => 'simple',
            'processes' => 10,
        ],
        'supervisor-notifications' => [
            // ...
            'queue' => ['notifications'],
            'balance' => 'simple',
            'processes' => 2,
        ],
    ],
],
```

Với cấu hình này, Horizon sẽ phân bổ 10 process cho queue `default` và 2 process cho queue `notifications`.

<a name="no-balancing"></a>
### Không cân bằng

Khi tùy chọn `balance` được đặt thành `false`, Horizon xử lý các queue nghiêm ngặt theo thứ tự chúng được liệt kê, tương tự hệ thống queue mặc định của Laravel. Tuy nhiên, Horizon vẫn sẽ scale số lượng worker process nếu job bắt đầu tồn đọng:

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            // ...
            'queue' => ['default', 'notifications'],
            'balance' => false,
            'minProcesses' => 1,
            'maxProcesses' => 10,
        ],
    ],
],
```

Trong ví dụ trên, các job trong queue `default` luôn được ưu tiên hơn các job trong queue `notifications`. Chẳng hạn, nếu `default` có 1.000 job và `notifications` chỉ có 10 job, Horizon sẽ xử lý xong toàn bộ job trong `default` trước khi xử lý bất kỳ job nào từ `notifications`.

Bạn có thể kiểm soát khả năng scale worker process của Horizon bằng các tùy chọn `minProcesses` và `maxProcesses`:

<div class="content-list" markdown="1">

- `minProcesses` xác định tổng số worker process tối thiểu. Giá trị này phải lớn hơn hoặc bằng 1.
- `maxProcesses` xác định tổng số worker process tối đa mà Horizon có thể scale lên.

</div>

<a name="upgrading-horizon"></a>
## Nâng cấp Horizon

Khi nâng cấp lên một phiên bản major mới của Horizon, bạn nên xem kỹ [hướng dẫn nâng cấp](https://github.com/laravel/horizon/blob/master/UPGRADE.md).

<a name="running-horizon"></a>
## Chạy Horizon

Sau khi cấu hình các supervisor và worker trong file cấu hình `config/horizon.php` của ứng dụng, bạn có thể khởi động Horizon bằng lệnh Artisan `horizon`. Lệnh duy nhất này sẽ khởi động tất cả worker process đã được cấu hình cho environment hiện tại:

```shell
php artisan horizon
```

Bạn có thể tạm dừng process Horizon và yêu cầu nó tiếp tục xử lý job bằng các lệnh Artisan `horizon:pause` và `horizon:continue`:

```shell
php artisan horizon:pause

php artisan horizon:continue
```

Bạn cũng có thể tạm dừng và tiếp tục từng [supervisor](#supervisors) Horizon cụ thể bằng các lệnh Artisan `horizon:pause-supervisor` và `horizon:continue-supervisor`:

```shell
php artisan horizon:pause-supervisor supervisor-1

php artisan horizon:continue-supervisor supervisor-1
```

Bạn có thể kiểm tra trạng thái hiện tại của process Horizon bằng lệnh Artisan `horizon:status`:

```shell
php artisan horizon:status
```

Bạn có thể kiểm tra trạng thái hiện tại của một [supervisor](#supervisors) Horizon cụ thể bằng lệnh Artisan `horizon:supervisor-status`:

```shell
php artisan horizon:supervisor-status supervisor-1
```

Bạn có thể kết thúc process Horizon một cách an toàn bằng lệnh Artisan `horizon:terminate`. Mọi job đang được xử lý sẽ hoàn tất trước khi Horizon dừng chạy:

```shell
php artisan horizon:terminate
```

<a name="automatically-restarting-horizon"></a>
#### Tự động khởi động lại Horizon

Trong quá trình phát triển local, bạn có thể chạy lệnh `horizon:listen`. Khi sử dụng `horizon:listen`, bạn không cần tự khởi động lại Horizon mỗi khi muốn nạp lại code vừa cập nhật. Trước khi dùng tính năng này, hãy đảm bảo [Node](https://nodejs.org) đã được cài đặt trong môi trường phát triển local. Ngoài ra, bạn nên cài thư viện theo dõi file [Chokidar](https://github.com/paulmillr/chokidar) vào project:

```shell
npm install --save-dev chokidar
```

Sau khi cài Chokidar, bạn có thể khởi động Horizon bằng lệnh `horizon:listen`:

```shell
php artisan horizon:listen
```

Khi chạy trong Docker hoặc Vagrant, bạn nên sử dụng tùy chọn `--poll`:

```shell
php artisan horizon:listen --poll
```

Bạn có thể cấu hình các thư mục và file cần được theo dõi bằng tùy chọn `watch` trong file cấu hình `config/horizon.php` của ứng dụng:

```php
'watch' => [
    'app',
    'bootstrap',
    'config',
    'database',
    'public/**/*.php',
    'resources/**/*.php',
    'routes',
    'composer.lock',
    '.env',
],
```

<a name="deploying-horizon"></a>
### Deploy Horizon

Khi sẵn sàng deploy Horizon lên server thực tế của ứng dụng, bạn nên cấu hình một process monitor để giám sát lệnh `php artisan horizon` và khởi động lại nếu process thoát ngoài dự kiến. Phần dưới sẽ trình bày cách cài đặt process monitor.

Trong quá trình deploy ứng dụng, bạn nên yêu cầu process Horizon kết thúc để process monitor khởi động lại nó và nạp các thay đổi code mới:

```shell
php artisan horizon:terminate
```

<a name="installing-supervisor"></a>
#### Cài đặt Supervisor

Supervisor là một process monitor dành cho hệ điều hành Linux và sẽ tự động khởi động lại process `horizon` nếu process này ngừng chạy. Để cài Supervisor trên Ubuntu, bạn có thể dùng lệnh sau. Nếu không sử dụng Ubuntu, bạn thường có thể cài Supervisor bằng package manager của hệ điều hành:

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> Nếu việc tự cấu hình Supervisor có vẻ phức tạp, hãy cân nhắc sử dụng [Laravel Cloud](https://cloud.laravel.com), dịch vụ có thể quản lý các background process cho ứng dụng Laravel của bạn.

<a name="supervisor-configuration"></a>
#### Cấu hình Supervisor

Các file cấu hình Supervisor thường được lưu trong thư mục `/etc/supervisor/conf.d` trên server. Trong thư mục này, bạn có thể tạo nhiều file cấu hình để chỉ dẫn Supervisor cách giám sát các process. Ví dụ, hãy tạo file `horizon.conf` để khởi động và giám sát một process `horizon`:

```ini
[program:horizon]
process_name=%(program_name)s
command=php /home/forge/example.com/artisan horizon
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/home/forge/example.com/horizon.log
stopwaitsecs=3600
```

Khi định nghĩa cấu hình Supervisor, hãy đảm bảo giá trị `stopwaitsecs` lớn hơn số giây mà job chạy lâu nhất cần để hoàn thành. Nếu không, Supervisor có thể kill job trước khi nó xử lý xong.

> [!WARNING]
> Mặc dù các ví dụ trên phù hợp với server dựa trên Ubuntu, vị trí và phần mở rộng file mà Supervisor yêu cầu có thể khác trên các hệ điều hành server khác. Hãy tham khảo tài liệu của server để biết thêm thông tin.

<a name="starting-supervisor"></a>
#### Khởi động Supervisor

Sau khi tạo file cấu hình, bạn có thể cập nhật cấu hình Supervisor và khởi động các process được giám sát bằng các lệnh sau:

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start horizon
```

> [!NOTE]
> Để biết thêm thông tin về cách chạy Supervisor, hãy tham khảo [tài liệu Supervisor](http://supervisord.org/index.html).

<a name="tags"></a>
## Tag

Horizon cho phép bạn gán "tag" cho job, bao gồm mailables, broadcast event, notification và queued event listener. Trên thực tế, Horizon sẽ tự động gắn tag một cách thông minh cho hầu hết job dựa trên các Eloquent model được gắn với job. Ví dụ, hãy xem job sau:

```php
<?php

namespace App\Jobs;

use App\Models\Video;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RenderVideo implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Video $video,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // ...
    }
}
```

Nếu job này được đưa vào queue cùng một instance `App\Models\Video` có thuộc tính `id` bằng `1`, nó sẽ tự động nhận tag `App\Models\Video:1`. Lý do là Horizon sẽ tìm các Eloquent model trong các property của job. Nếu tìm thấy Eloquent model, Horizon sẽ gắn tag cho job bằng tên class của model và primary key:

```php
use App\Jobs\RenderVideo;
use App\Models\Video;

$video = Video::find(1);

RenderVideo::dispatch($video);
```

<a name="manually-tagging-jobs"></a>
#### Gắn tag cho Job thủ công

Nếu muốn tự định nghĩa tag cho một queueable object, bạn có thể định nghĩa method `tags` trên class:

```php
class RenderVideo implements ShouldQueue
{
    /**
     * Get the tags that should be assigned to the job.
     *
     * @return array<int, string>
     */
    public function tags(): array
    {
        return ['render', 'video:'.$this->video->id];
    }
}
```

<a name="manually-tagging-event-listeners"></a>
#### Gắn tag cho Event Listener thủ công

Khi lấy tag cho một queued event listener, Horizon sẽ tự động truyền event instance vào method `tags`, cho phép bạn đưa dữ liệu của event vào tag:

```php
class SendRenderNotifications implements ShouldQueue
{
    /**
     * Get the tags that should be assigned to the listener.
     *
     * @return array<int, string>
     */
    public function tags(VideoRendered $event): array
    {
        return ['video:'.$event->video->id];
    }
}
```

<a name="notifications"></a>
## Thông báo

> [!WARNING]
> Khi cấu hình Horizon gửi thông báo qua Slack hoặc SMS, bạn nên xem lại [các điều kiện tiên quyết của notification channel tương ứng](/notifications).

Nếu muốn nhận thông báo khi một queue có thời gian chờ quá lâu, bạn có thể sử dụng các method `Horizon::routeMailNotificationsTo`, `Horizon::routeSlackNotificationsTo` và `Horizon::routeSmsNotificationsTo`. Bạn có thể gọi các method này từ method `boot` của `App\Providers\HorizonServiceProvider` trong ứng dụng:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    parent::boot();

    Horizon::routeSmsNotificationsTo('15556667777');
    Horizon::routeMailNotificationsTo('example@example.com');
    Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
}
```

<a name="configuring-notification-wait-time-thresholds"></a>
#### Cấu hình ngưỡng thời gian chờ của thông báo

Bạn có thể cấu hình số giây được xem là "thời gian chờ lâu" trong file cấu hình `config/horizon.php` của ứng dụng. Tùy chọn cấu hình `waits` trong file này cho phép kiểm soát ngưỡng chờ lâu cho từng tổ hợp connection / queue. Mọi tổ hợp connection / queue chưa được định nghĩa sẽ mặc định sử dụng ngưỡng 60 giây:

```php
'waits' => [
    'redis:critical' => 30,
    'redis:default' => 60,
    'redis:batch' => 120,
],
```

Đặt ngưỡng của một queue thành `0` sẽ tắt thông báo thời gian chờ lâu cho queue đó.

<a name="metrics"></a>
## Metrics

Horizon cung cấp dashboard metrics hiển thị thông tin về thời gian chờ và throughput của job cũng như queue. Để cung cấp dữ liệu cho dashboard này, bạn nên cấu hình lệnh Artisan `snapshot` của Horizon chạy mỗi năm phút trong file `routes/console.php` của ứng dụng:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('horizon:snapshot')->everyFiveMinutes();
```

Bạn có thể cấu hình số snapshot Horizon giữ lại cho các biểu đồ metrics bằng tùy chọn `metrics.trim_snapshots` trong file cấu hình `config/horizon.php` của ứng dụng. Vì tùy chọn này giới hạn số lượng snapshot thay vì tuổi của chúng, thời gian lưu giữ phụ thuộc vào tần suất chạy lệnh `horizon:snapshot`:

```php
'metrics' => [
    'trim_snapshots' => [
        'job' => 24,
        'queue' => 24,
    ],
],
```

Nếu muốn xóa toàn bộ dữ liệu metrics, bạn có thể gọi lệnh Artisan `horizon:clear-metrics`:

```shell
php artisan horizon:clear-metrics
```

<a name="deleting-failed-jobs"></a>
## Xóa Job thất bại

Nếu muốn xóa một job thất bại, bạn có thể sử dụng lệnh `horizon:forget`. Lệnh `horizon:forget` nhận ID hoặc UUID của job thất bại làm đối số duy nhất:

```shell
php artisan horizon:forget 5
```

Nếu muốn xóa tất cả job thất bại, bạn có thể truyền tùy chọn `--all` cho lệnh `horizon:forget`:

```shell
php artisan horizon:forget --all
```

<a name="clearing-jobs-from-queues"></a>
## Xóa Job khỏi Queue

Nếu muốn xóa tất cả job khỏi queue mặc định của ứng dụng, bạn có thể thực hiện bằng lệnh Artisan `horizon:clear`:

```shell
php artisan horizon:clear
```

Bạn có thể truyền tùy chọn `queue` để xóa job khỏi một queue cụ thể:

```shell
php artisan horizon:clear --queue=emails
```
