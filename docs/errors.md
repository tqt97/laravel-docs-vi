# Xử lý lỗi
- [Giới thiệu](#introduction)
- [Cấu hình](#configuration)
- [Xử lý exception](#handling-exceptions)
    - [Report exception](#reporting-exceptions)
    - [Log level cho exception](#exception-log-levels)
    - [Bỏ qua exception theo type](#ignoring-exceptions-by-type)
    - [Render exception](#rendering-exceptions)
    - [Reportable và renderable exception](#renderable-exceptions)
- [Giới hạn exception được report](#throttling-reported-exceptions)
- [HTTP exception](#http-exceptions)
    - [Trang lỗi HTTP tùy chỉnh](#custom-http-error-pages)
<a name="introduction"></a>
## Giới thiệu
Khi tạo dự án Laravel mới, cơ chế xử lý error và exception đã được cấu hình sẵn. Khi cần tùy chỉnh, bạn có thể dùng method `withExceptions` trong `bootstrap/app.php` để quản lý cách ứng dụng report và render exception.
Object `$exceptions` được truyền vào closure `withExceptions` là instance của `Illuminate\Foundation\Configuration\Exceptions`, chịu trách nhiệm quản lý exception handling trong ứng dụng. Các phần dưới sẽ đi sâu vào object này.
<a name="configuration"></a>
## Cấu hình
Option `debug` trong `config/app.php` quyết định lượng thông tin lỗi thực tế được hiển thị cho người dùng. Mặc định, option này lấy giá trị từ biến môi trường `APP_DEBUG` trong file `.env`.
Trong local development, bạn nên đặt `APP_DEBUG=true`.
> [!WARNING]
> Trong production, `APP_DEBUG` **luôn nên là `false`**. Nếu bật `true` trên production, ứng dụng có nguy cơ để lộ các giá trị cấu hình nhạy cảm cho người dùng cuối.
<a name="handling-exceptions"></a>
## Xử lý exception
<a name="reporting-exceptions"></a>
### Report exception
Trong Laravel, report exception được dùng để ghi exception vào log hoặc gửi tới dịch vụ bên ngoài như [Laravel Nightwatch](https://nightwatch.laravel.com), [Sentry](https://github.com/getsentry/sentry-laravel) hay [Flare](https://flareapp.io). Mặc định, exception được log dựa trên cấu hình [logging](/docs/{{version}}/logging), nhưng bạn có thể tùy biến cách report theo nhu cầu.
Nếu cần report từng loại exception theo cách khác nhau, hãy dùng method exception `report` trong `bootstrap/app.php` để đăng ký closure chạy khi một exception tương ứng cần được report. Laravel xác định loại exception bằng type-hint của closure:
```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    });
})
```
Khi đăng ký callback report tùy chỉnh bằng method `report`, Laravel vẫn tiếp tục log exception theo cấu hình logging mặc định. Nếu muốn ngăn exception tiếp tục đi vào default logging stack, hãy gọi `stop` khi định nghĩa callback hoặc trả về `false` từ callback:
```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->report(function (InvalidOrderException $e) {
        // ...
    })->stop();

    $exceptions->report(function (InvalidOrderException $e) {
        return false;
    });
})
```
> [!NOTE]
> Để tùy biến cách report cho một exception cụ thể, bạn cũng có thể dùng [reportable exception](/docs/{{version}}/errors#renderable-exceptions).
<a name="global-log-context"></a>
#### Context log toàn cục
Khi có thể, Laravel tự động thêm ID của user hiện tại vào log message của exception dưới dạng context data. Bạn có thể định nghĩa global context riêng bằng method exception `context` trong `bootstrap/app.php`; dữ liệu này sẽ được đưa vào mọi exception log message do ứng dụng ghi:
```php
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->context(fn () => [
        'foo' => 'bar',
    ]);
})
```

<a name="exception-log-context"></a>
#### Context riêng của exception
Global context hữu ích cho dữ liệu chung, nhưng một exception cụ thể đôi khi có context riêng cần đưa vào log. Bằng cách định nghĩa method `context` trên exception của ứng dụng, bạn có thể trả về dữ liệu liên quan cần được thêm vào log entry của exception đó:
```php
<?php

namespace App\Exceptions;

use Exception;

class InvalidOrderException extends Exception
{
    // ...

    /**
     * Get the exception's context information.
     *
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return ['order_id' => $this->orderId];
    }
}
```

<a name="the-report-helper"></a>
#### Helper `report`
Đôi khi bạn cần report exception nhưng vẫn muốn tiếp tục xử lý request hiện tại. Helper `report` cho phép nhanh chóng report exception mà không render error page cho người dùng:
```php
public function isValid(string $value): bool
{
    try {
        // Validate the value...
    } catch (Throwable $e) {
        report($e);

        return false;
    }
}
```

<a name="deduplicating-reported-exceptions"></a>
#### Loại bỏ report trùng lặp
Nếu dùng hàm `report` ở nhiều nơi trong ứng dụng, đôi khi cùng một exception instance có thể bị report nhiều lần, tạo log entry trùng lặp.
Để đảm bảo một exception instance chỉ được report một lần, hãy gọi method `dontReportDuplicates` trong `bootstrap/app.php`:
```php
->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->dontReportDuplicates();
})
```
Sau đó, khi helper `report` được gọi nhiều lần với cùng một exception instance, chỉ lần gọi đầu tiên được report:
```php
$original = new RuntimeException('Whoops!');

report($original); // reported

try {
    throw $original;
} catch (Throwable $caught) {
    report($caught); // ignored
}

report($original); // ignored
report($caught); // ignored
```

<a name="exception-log-levels"></a>
### Log level cho exception
Khi message được ghi vào [log](/docs/{{version}}/logging), mỗi message có một [log level](/docs/{{version}}/logging#log-levels) thể hiện mức độ nghiêm trọng hoặc tầm quan trọng.
Như đã nói ở trên, ngay cả khi bạn đăng ký callback report tùy chỉnh bằng `report`, Laravel vẫn log exception theo cấu hình mặc định. Vì log level có thể ảnh hưởng tới channel nhận message, đôi khi bạn cần cấu hình level riêng cho một số exception.
Để làm điều này, dùng method exception `level` trong `bootstrap/app.php`. Method nhận exception type làm đối số thứ nhất và log level làm đối số thứ hai:
```php
use PDOException;
use Psr\Log\LogLevel;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->level(PDOException::class, LogLevel::CRITICAL);
})
```

<a name="ignoring-exceptions-by-type"></a>
### Bỏ qua exception theo type
Trong ứng dụng sẽ có một số loại exception bạn không muốn report. Dùng method exception `dontReport` trong `bootstrap/app.php` để bỏ qua chúng. Các class được truyền vào method sẽ không được report, dù vẫn có thể có logic render tùy chỉnh:
```php
use App\Exceptions\InvalidOrderException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->dontReport([
        InvalidOrderException::class,
    ]);
})
```
Ngoài ra, bạn có thể "đánh dấu" exception class bằng interface `Illuminate\Contracts\Debug\ShouldntReport`. Exception implement interface này sẽ không được Laravel report:
```php
<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Contracts\Debug\ShouldntReport;

class PodcastProcessingException extends Exception implements ShouldntReport
{
    //
}
```
Nếu cần kiểm soát chi tiết hơn thời điểm một exception type bị bỏ qua, hãy truyền closure vào method `dontReportWhen`:
```php
use App\Exceptions\InvalidOrderException;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->dontReportWhen(function (Throwable $e) {
        return $e instanceof PodcastProcessingException &&
               $e->reason() === 'Subscription expired';
    });
})
```
Bên trong framework, Laravel đã tự bỏ qua một số lỗi phổ biến, chẳng hạn exception từ HTTP 404, HTTP 403 do origin mismatch hoặc HTTP 419 do CSRF token không hợp lệ. Nếu muốn Laravel ngừng bỏ qua một exception type nào đó, hãy dùng method `stopIgnoring` trong `bootstrap/app.php`:
```php
use Symfony\Component\HttpKernel\Exception\HttpException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->stopIgnoring(HttpException::class);
})
```

<a name="rendering-exceptions"></a>
### Render exception
Mặc định, Laravel exception handler tự chuyển exception thành HTTP response. Tuy nhiên, bạn có thể đăng ký closure render tùy chỉnh cho từng exception type bằng method `render` trong `bootstrap/app.php`.
Closure truyền vào `render` nên trả về instance `Illuminate\Http\Response`, có thể được tạo bằng helper `response`. Laravel xác định exception type từ type-hint của closure:
```php
use App\Exceptions\InvalidOrderException;
use Illuminate\Http\Request;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (InvalidOrderException $e, Request $request) {
        return response()->view('errors.invalid-order', status: 500);
    });
})
```
Bạn cũng có thể dùng `render` để override hành vi render của exception tích hợp từ Laravel hoặc Symfony như `NotFoundHttpException`. Nếu closure không trả về giá trị, Laravel sẽ dùng cơ chế render exception mặc định:
```php
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (NotFoundHttpException $e, Request $request) {
        if ($request->is('api/*')) {
            return response()->json([
                'message' => 'Record not found.'
            ], 404);
        }
    });
})
```

<a name="rendering-exceptions-as-json"></a>
#### Render exception dưới dạng JSON
Khi render exception, Laravel tự xác định response nên là HTML hay JSON dựa trên header `Accept` của request. Nếu muốn tùy chỉnh cách Laravel ra quyết định này, hãy dùng method `shouldRenderJsonWhen`:
```php
use Illuminate\Http\Request;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
        if ($request->is('admin/*')) {
            return true;
        }

        return $request->expectsJson();
    });
})
```

<a name="customizing-the-exception-response"></a>
#### Tùy biến exception response
Trong một số trường hợp hiếm, bạn cần tùy biến toàn bộ HTTP response do exception handler render. Hãy đăng ký closure tùy biến response bằng method `respond`:
```php
use Symfony\Component\HttpFoundation\Response;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->respond(function (Response $response) {
        if ($response->getStatusCode() === 419) {
            return back()->with([
                'message' => 'The page expired, please try again.',
            ]);
        }

        return $response;
    });
})
```

<a name="renderable-exceptions"></a>
### Reportable và renderable exception
Thay vì định nghĩa hành vi report và render tùy chỉnh trong `bootstrap/app.php`, bạn có thể định nghĩa trực tiếp các method `report` và `render` trên exception class của ứng dụng. Khi tồn tại, framework tự động gọi các method này:
```php
<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvalidOrderException extends Exception
{
    /**
     * Report the exception.
     */
    public function report(): void
    {
        // ...
    }

    /**
     * Render the exception as an HTTP response.
     */
    public function render(Request $request): Response
    {
        return response(/* ... */);
    }
}
```
Nếu exception của bạn extends một exception vốn đã renderable, chẳng hạn exception tích hợp của Laravel hoặc Symfony, bạn có thể trả về `false` từ method `render` để framework dùng HTTP response mặc định của exception đó:
```php
/**
 * Render the exception as an HTTP response.
 */
public function render(Request $request): Response|bool
{
    if (/** Determine if the exception needs custom rendering */) {

        return response(/* ... */);
    }

    return false;
}
```
Nếu exception có logic report tùy chỉnh chỉ cần trong một số điều kiện, bạn có thể trả về `false` từ method `report` để yêu cầu Laravel dùng cấu hình exception handling mặc định trong những trường hợp còn lại:
```php
/**
 * Report the exception.
 */
public function report(): bool
{
    if (/** Determine if the exception needs custom reporting */) {

        // ...

        return true;
    }

    return false;
}
```
> [!NOTE]
> Bạn có thể type-hint dependency cần thiết trong method `report`; Laravel sẽ tự động inject chúng thông qua [service container](/docs/{{version}}/container).
<a name="throttling-reported-exceptions"></a>
### Giới hạn exception được report
Nếu ứng dụng phát sinh số lượng exception rất lớn, bạn có thể cần giới hạn số exception thực sự được ghi log hoặc gửi tới dịch vụ error tracking bên ngoài.
Để lấy mẫu ngẫu nhiên một tỷ lệ exception, dùng method exception `throttle` trong `bootstrap/app.php`. Method nhận closure và closure nên trả về instance `Lottery`:
```php
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->throttle(function (Throwable $e) {
        return Lottery::odds(1, 1000);
    });
})
```
Bạn cũng có thể lấy mẫu có điều kiện theo exception type. Nếu chỉ muốn sample một exception class cụ thể, hãy chỉ trả về `Lottery` cho class đó:
```php
use App\Exceptions\ApiMonitoringException;
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof ApiMonitoringException) {
            return Lottery::odds(1, 1000);
        }
    });
})
```
Ngoài sampling, bạn có thể rate-limit exception được log hoặc gửi tới error tracking service bằng cách trả về instance `Limit` thay cho `Lottery`. Điều này hữu ích để tránh một đợt exception đột biến làm tràn log, chẳng hạn khi dịch vụ bên thứ ba mà ứng dụng phụ thuộc bị down:
```php
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof BroadcastException) {
            return Limit::perMinute(300);
        }
    });
})
```
Mặc định, limit dùng class của exception làm rate-limit key. Bạn có thể tùy biến key bằng method `by` trên `Limit`:
```php
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->throttle(function (Throwable $e) {
        if ($e instanceof BroadcastException) {
            return Limit::perMinute(300)->by($e->getMessage());
        }
    });
})
```
Tất nhiên, bạn có thể kết hợp `Lottery` và `Limit` cho các exception khác nhau:
```php
use App\Exceptions\ApiMonitoringException;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Lottery;
use Throwable;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->throttle(function (Throwable $e) {
        return match (true) {
            $e instanceof BroadcastException => Limit::perMinute(300),
            $e instanceof ApiMonitoringException => Lottery::odds(1, 1000),
            default => Limit::none(),
        };
    });
})
```

<a name="http-exceptions"></a>
## HTTP exception
Một số exception đại diện cho HTTP error code từ server, chẳng hạn "page not found" (404), "unauthorized" (401) hoặc lỗi 500 do developer tạo. Để tạo response tương ứng ở bất kỳ đâu trong ứng dụng, bạn có thể dùng helper `abort`:
```php
abort(404);
```

<a name="custom-http-error-pages"></a>
### Trang lỗi HTTP tùy chỉnh
Laravel giúp hiển thị custom error page cho từng HTTP status code rất đơn giản. Ví dụ, để tùy biến trang 404, hãy tạo view `resources/views/errors/404.blade.php`. View này được render cho mọi lỗi 404 do ứng dụng tạo. Các view trong thư mục nên được đặt tên theo status code tương ứng. Instance `Symfony\Component\HttpKernel\Exception\HttpException` được tạo bởi hàm `abort` sẽ được truyền vào view qua biến `$exception`:
```blade
<h2>{{ $exception->getMessage() }}</h2>
```
Bạn có thể publish các template error page mặc định của Laravel bằng lệnh Artisan `vendor:publish`. Sau khi publish, hãy tùy chỉnh theo nhu cầu:
```shell
php artisan vendor:publish --tag=laravel-errors
```

<a name="fallback-http-error-pages"></a>
#### Trang lỗi HTTP fallback
Bạn cũng có thể định nghĩa error page "fallback" cho một nhóm HTTP status code. Page này được render khi không có page riêng cho status code cụ thể. Để làm vậy, tạo template `4xx.blade.php` và `5xx.blade.php` trong `resources/views/errors`.
Fallback page không ảnh hưởng tới response `404`, `500` và `503` vì Laravel có page nội bộ riêng cho các status code này. Muốn tùy biến chúng, hãy tạo page riêng tương ứng cho từng status code.
## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/errors). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
