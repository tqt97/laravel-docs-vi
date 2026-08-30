# Middleware

<a name="introduction"></a>
## Giới thiệu
Middleware cung cấp một cơ chế thuận tiện để kiểm tra và lọc các HTTP request đi vào ứng dụng. Ví dụ, Laravel có middleware dùng để xác minh người dùng đã được xác thực. Nếu chưa đăng nhập, middleware sẽ chuyển hướng người dùng tới màn hình đăng nhập; nếu đã xác thực, middleware cho phép request tiếp tục đi sâu vào ứng dụng.
Ngoài authentication, bạn có thể viết middleware để thực hiện nhiều nhiệm vụ khác. Chẳng hạn, logging middleware có thể ghi lại mọi request đi vào ứng dụng. Laravel đã tích hợp nhiều middleware cho authentication, CSRF protection và các nhu cầu phổ biến khác; middleware do ứng dụng tự định nghĩa thường nằm trong thư mục `app/Http/Middleware`.
<a name="defining-middleware"></a>
## Định nghĩa middleware
Để tạo middleware mới, hãy dùng lệnh Artisan `make:middleware`:
```shell
php artisan make:middleware EnsureTokenIsValid
```
Lệnh này sẽ tạo class `EnsureTokenIsValid` trong thư mục `app/Http/Middleware`. Trong middleware này, route chỉ được phép tiếp tục nếu input `token` khớp với giá trị yêu cầu; nếu không, người dùng sẽ được chuyển hướng về URI `/home`:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->input('token') !== 'my-secret-token') {
            return redirect('/home');
        }

        return $next($request);
    }
}
```
Như bạn thấy, nếu `token` được cung cấp không khớp secret token, middleware trả về một HTTP redirect cho client. Ngược lại, request được chuyển tiếp sâu hơn vào ứng dụng. Để request tiếp tục đi qua middleware, hãy gọi callback `$next` và truyền `$request` vào đó.
Có thể hình dung middleware như một chuỗi "lớp" mà HTTP request phải đi qua trước khi chạm tới logic ứng dụng. Mỗi lớp có thể kiểm tra request và thậm chí từ chối hoàn toàn request đó.
> [!NOTE]
> Tất cả middleware đều được resolve thông qua [service container](/docs/{{version}}/container), vì vậy bạn có thể type-hint bất kỳ dependency nào cần thiết trong constructor của middleware.
<a name="middleware-and-responses"></a>
#### Middleware và response
Middleware có thể thực hiện công việc trước hoặc sau khi chuyển request sâu hơn vào ứng dụng. Ví dụ, middleware sau thực hiện một tác vụ **trước khi** request được ứng dụng xử lý:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BeforeMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Perform action

        return $next($request);
    }
}
```
Ngược lại, middleware sau thực hiện tác vụ **sau khi** request đã được ứng dụng xử lý:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AfterMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Perform action

        return $response;
    }
}
```

<a name="registering-middleware"></a>
## Đăng ký middleware
<a name="global-middleware"></a>
### Middleware toàn cục
Nếu muốn một middleware chạy trong mọi HTTP request đến ứng dụng, bạn có thể append nó vào global middleware stack trong file `bootstrap/app.php`:
```php
use App\Http\Middleware\EnsureTokenIsValid;

->withMiddleware(function (Middleware $middleware): void {
     $middleware->append(EnsureTokenIsValid::class);
})
```
Object `$middleware` được truyền vào closure `withMiddleware` là instance của `Illuminate\Foundation\Configuration\Middleware`, chịu trách nhiệm quản lý middleware được gán cho các route của ứng dụng. Method `append` thêm middleware vào cuối danh sách global middleware. Nếu muốn thêm vào đầu danh sách, hãy dùng `prepend`.
<a name="manually-managing-laravels-default-global-middleware"></a>
#### Quản lý thủ công global middleware mặc định của Laravel
Nếu muốn tự quản lý global middleware stack của Laravel, bạn có thể truyền stack mặc định của Laravel vào method `use`, sau đó điều chỉnh danh sách theo nhu cầu:
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->use([
        \Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks::class,
        // \Illuminate\Http\Middleware\TrustHosts::class,
        \Illuminate\Http\Middleware\TrustProxies::class,
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Http\Middleware\ValidatePostSize::class,
        \Illuminate\Foundation\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ]);
})
```

<a name="assigning-middleware-to-routes"></a>
### Gán middleware cho route
Để gán middleware cho một route cụ thể, hãy gọi method `middleware` khi định nghĩa route:
```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::get('/profile', function () {
    // ...
})->middleware(EnsureTokenIsValid::class);
```
Bạn có thể gán nhiều middleware cho một route bằng cách truyền một mảng tên middleware vào method `middleware`:
```php
Route::get('/', function () {
    // ...
})->middleware([First::class, Second::class]);
```

<a name="excluding-middleware"></a>
#### Loại trừ middleware
Khi gán middleware cho một nhóm route, đôi khi bạn cần loại trừ middleware khỏi một route riêng lẻ trong nhóm. Có thể làm điều này bằng method `withoutMiddleware`:
```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::middleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/', function () {
        // ...
    });

    Route::get('/profile', function () {
        // ...
    })->withoutMiddleware([EnsureTokenIsValid::class]);
});
```
Bạn cũng có thể loại trừ một tập middleware khỏi toàn bộ [group](/docs/{{version}}/routing#route-groups) route:
```php
use App\Http\Middleware\EnsureTokenIsValid;

Route::withoutMiddleware([EnsureTokenIsValid::class])->group(function () {
    Route::get('/profile', function () {
        // ...
    });
});
```
Method `withoutMiddleware` chỉ có thể loại bỏ route middleware; nó không áp dụng cho [global middleware](#global-middleware).
<a name="middleware-groups"></a>
### Nhóm middleware
Đôi khi bạn muốn gom nhiều middleware dưới một key duy nhất để việc gán cho route thuận tiện hơn. Bạn có thể làm điều này bằng method `appendToGroup` trong file `bootstrap/app.php`:
```php
use App\Http\Middleware\First;
use App\Http\Middleware\Second;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->appendToGroup('group-name', [
        First::class,
        Second::class,
    ]);

    $middleware->prependToGroup('group-name', [
        First::class,
        Second::class,
    ]);
})
```
Middleware group có thể được gán cho route và controller action bằng cùng cú pháp như một middleware riêng lẻ:
```php
Route::get('/', function () {
    // ...
})->middleware('group-name');

Route::middleware(['group-name'])->group(function () {
    // ...
});
```

<a name="laravels-default-middleware-groups"></a>
#### Các nhóm middleware mặc định của Laravel
Laravel cung cấp sẵn các middleware group `web` và `api`, chứa những middleware thường dùng cho web route và API route. Laravel tự động áp dụng các nhóm này cho các file tương ứng `routes/web.php` và `routes/api.php`:
<div class="overflow-auto">

| Middleware group `web`                                   |
| --------------------------------------------------------- |
| `Illuminate\Cookie\Middleware\EncryptCookies`             |
| `Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse` |
| `Illuminate\Session\Middleware\StartSession`              |
| `Illuminate\View\Middleware\ShareErrorsFromSession`       |
| `Illuminate\Foundation\Http\Middleware\PreventRequestForgery` |
| `Illuminate\Routing\Middleware\SubstituteBindings`        |
</div>

<div class="overflow-auto">

| Middleware group `api`                            |
| -------------------------------------------------- |
| `Illuminate\Routing\Middleware\SubstituteBindings` |
</div>

Để append hoặc prepend middleware vào các group này, bạn có thể dùng method `web` và `api` trong `bootstrap/app.php`. Đây là các cách viết tiện lợi thay cho `appendToGroup`:
```php
use App\Http\Middleware\EnsureTokenIsValid;
use App\Http\Middleware\EnsureUserIsSubscribed;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        EnsureUserIsSubscribed::class,
    ]);

    $middleware->api(prepend: [
        EnsureTokenIsValid::class,
    ]);
})
```
Bạn thậm chí có thể thay một middleware mặc định trong group bằng middleware tùy chỉnh của mình:
```php
use App\Http\Middleware\StartCustomSession;
use Illuminate\Session\Middleware\StartSession;

$middleware->web(replace: [
    StartSession::class => StartCustomSession::class,
]);
```
Hoặc có thể loại bỏ hẳn một middleware:
```php
$middleware->web(remove: [
    StartSession::class,
]);
```

<a name="manually-managing-laravels-default-middleware-groups"></a>
#### Quản lý thủ công các middleware group mặc định
Nếu muốn tự quản lý toàn bộ middleware trong các group `web` và `api`, bạn có thể định nghĩa lại hoàn toàn các group này. Ví dụ dưới đây khai báo lại `web` và `api` với middleware mặc định, từ đó bạn có thể tùy chỉnh chúng theo nhu cầu:
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->group('web', [
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        // \Illuminate\Session\Middleware\AuthenticateSession::class,
    ]);

    $middleware->group('api', [
        // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // 'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ]);
})
```
> [!NOTE]
> Mặc định, các middleware group `web` và `api` được file `bootstrap/app.php` tự động áp dụng cho các file route tương ứng `routes/web.php` và `routes/api.php`.
<a name="middleware-aliases"></a>
### Alias middleware
Bạn có thể gán alias cho middleware trong file `bootstrap/app.php`. Alias giúp đặt một tên ngắn cho class middleware, đặc biệt hữu ích với những class có tên dài:
```php
use App\Http\Middleware\EnsureUserIsSubscribed;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'subscribed' => EnsureUserIsSubscribed::class
    ]);
})
```
Sau khi alias được định nghĩa trong `bootstrap/app.php`, bạn có thể dùng alias đó khi gán middleware cho route:
```php
Route::get('/profile', function () {
    // ...
})->middleware('subscribed');
```
Để thuận tiện, một số middleware tích hợp của Laravel đã có alias mặc định. Ví dụ, middleware `auth` là alias của `Illuminate\Auth\Middleware\Authenticate`. Bảng dưới liệt kê các alias middleware mặc định:
<div class="overflow-auto">

| Alias              | Middleware                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `auth`             | `Illuminate\Auth\Middleware\Authenticate`                                                                     |
| `auth.basic`       | `Illuminate\Auth\Middleware\AuthenticateWithBasicAuth`                                                        |
| `auth.session`     | `Illuminate\Session\Middleware\AuthenticateSession`                                                           |
| `cache.headers`    | `Illuminate\Http\Middleware\SetCacheHeaders`                                                                  |
| `can`              | `Illuminate\Auth\Middleware\Authorize`                                                                        |
| `guest`            | `Illuminate\Auth\Middleware\RedirectIfAuthenticated`                                                          |
| `password.confirm` | `Illuminate\Auth\Middleware\RequirePassword`                                                                  |
| `precognitive`     | `Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests`                                            |
| `signed`           | `Illuminate\Routing\Middleware\ValidateSignature`                                                             |
| `subscribed`       | `\Spark\Http\Middleware\VerifyBillableIsSubscribed`                                                           |
| `throttle`         | `Illuminate\Routing\Middleware\ThrottleRequests` hoặc `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis` |
| `verified`         | `Illuminate\Auth\Middleware\EnsureEmailIsVerified`                                                            |
</div>

<a name="sorting-middleware"></a>
### Sắp xếp middleware
Trong một số trường hợp hiếm, middleware cần được thực thi theo thứ tự cụ thể nhưng bạn không kiểm soát được thứ tự chúng được gán cho route. Khi đó, có thể khai báo độ ưu tiên bằng method `priority` trong `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->priority([
        \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestForgery::class,
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        \Illuminate\Routing\Middleware\ThrottleRequests::class,
        \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
        \Illuminate\Auth\Middleware\Authorize::class,
    ]);
})
```
Nếu muốn thêm middleware vào priority list hiện tại mà không thay thế toàn bộ danh sách, hãy dùng `prependToPriorityList` hoặc `appendToPriorityList`. `prependToPriorityList` chèn middleware trước một middleware khác, còn `appendToPriorityList` chèn nó sau middleware khác:
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->prependToPriorityList(
        before: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        prepend: \App\Http\Middleware\EnsureTokenIsValid::class,
    );

    $middleware->appendToPriorityList(
        after: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        append: \App\Http\Middleware\EnsureUserIsSubscribed::class,
    );
})
```
Các đối số `before` và `after` cũng có thể là một mảng class middleware.
<a name="middleware-parameters"></a>
## Tham số middleware
Middleware cũng có thể nhận thêm tham số. Ví dụ, nếu ứng dụng cần kiểm tra người dùng đã xác thực có một "role" nhất định trước khi thực hiện hành động, bạn có thể tạo middleware `EnsureUserHasRole` nhận tên role làm đối số bổ sung.
Các tham số bổ sung của middleware sẽ được truyền vào sau đối số `$next`:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user()->hasRole($role)) {
            // Redirect...
        }

        return $next($request);
    }
}
```
Khi định nghĩa route, tham số middleware được chỉ định bằng cách phân tách tên middleware và tham số bằng dấu `:`:
```php
use App\Http\Middleware\EnsureUserHasRole;

Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor');
```
Nhiều tham số có thể được phân tách bằng dấu phẩy:
```php
Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware(EnsureUserHasRole::class.':editor,publisher');
```

<a name="terminable-middleware"></a>
## Middleware có thể kết thúc
Đôi khi middleware cần thực hiện công việc sau khi HTTP response đã được gửi về trình duyệt. Nếu middleware định nghĩa method `terminate` và web server đang dùng [FastCGI](https://www.php.net/manual/en/install.fpm.php), method `terminate` sẽ tự động được gọi sau khi response được gửi:
```php
<?php

namespace Illuminate\Session\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TerminatingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    /**
     * Handle tasks after the response has been sent to the browser.
     */
    public function terminate(Request $request, Response $response): void
    {
        // ...
    }
}
```
Method `terminate` nên nhận cả request và response. Sau khi định nghĩa terminable middleware, hãy thêm nó vào route hoặc global middleware trong file `bootstrap/app.php`.
Khi gọi method `terminate`, Laravel sẽ resolve một instance middleware mới từ [service container](/docs/{{version}}/container). Nếu muốn dùng cùng một instance middleware cho cả `handle` và `terminate`, hãy đăng ký middleware với container bằng method `singleton`. Thông thường việc này được thực hiện trong method `register` của `AppServiceProvider`:
```php
use App\Http\Middleware\TerminatingMiddleware;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->singleton(TerminatingMiddleware::class);
}
```
