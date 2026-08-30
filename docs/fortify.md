# Laravel Fortify

- [Giới thiệu](#introduction)
    - [Fortify là gì?](#what-is-fortify)
    - [Khi nào nên sử dụng Fortify?](#when-should-i-use-fortify)
- [Cài đặt](#installation)
    - [Các tính năng của Fortify](#fortify-features)
    - [Vô hiệu hóa view](#disabling-views)
- [Xác thực](#authentication)
    - [Tùy biến xác thực người dùng](#customizing-user-authentication)
    - [Tùy biến pipeline xác thực](#customizing-the-authentication-pipeline)
    - [Tùy biến chuyển hướng](#customizing-authentication-redirects)
- [Xác thực hai yếu tố](#two-factor-authentication)
    - [Bật xác thực hai yếu tố](#enabling-two-factor-authentication)
    - [Xác thực bằng xác thực hai yếu tố](#authenticating-with-two-factor-authentication)
    - [Vô hiệu hóa xác thực hai yếu tố](#disabling-two-factor-authentication)
- [Passkeys](#passkeys)
    - [Bật Passkey](#enabling-passkeys)
    - [JavaScript Client](#passkeys-javascript-client)
    - [Xác thực bằng Passkey](#authenticating-with-passkeys)
    - [Xác nhận mật khẩu bằng Passkey](#confirming-password-with-passkeys)
    - [Đăng ký Passkey](#registering-passkeys)
    - [Xóa Passkey](#deleting-passkeys)
- [Đăng ký](#registration)
    - [Tùy biến đăng ký](#customizing-registration)
- [Đặt lại mật khẩu](#password-reset)
    - [Yêu cầu liên kết đặt lại mật khẩu](#requesting-a-password-reset-link)
    - [Đặt lại mật khẩu](#resetting-the-password)
    - [Tùy biến việc đặt lại mật khẩu](#customizing-password-resets)
- [Xác minh email](#email-verification)
    - [Bảo vệ route](#protecting-routes)
- [Xác nhận mật khẩu](#password-confirmation)

<a name="introduction"></a>
## Giới thiệu

[Laravel Fortify](https://github.com/laravel/fortify) là một triển khai backend xác thực không phụ thuộc frontend dành cho Laravel. Fortify đăng ký các route và controller cần thiết để triển khai toàn bộ tính năng xác thực của Laravel, bao gồm đăng nhập, đăng ký, đặt lại mật khẩu, xác minh email và nhiều tính năng khác. Sau khi cài đặt Fortify, bạn có thể chạy lệnh Artisan `route:list` để xem các route mà Fortify đã đăng ký.

Vì Fortify không cung cấp giao diện người dùng riêng, nó được thiết kế để kết hợp với giao diện người dùng của chính bạn, giao diện này sẽ gửi request đến các route mà Fortify đăng ký. Trong phần còn lại của tài liệu này, chúng ta sẽ trình bày chính xác cách gửi request đến các route đó.

> [!NOTE]
> Hãy nhớ rằng Fortify là package giúp bạn có điểm khởi đầu nhanh khi triển khai các tính năng xác thực của Laravel. **Bạn không bắt buộc phải sử dụng Fortify.** Bạn luôn có thể tương tác thủ công với các dịch vụ xác thực của Laravel bằng cách làm theo tài liệu về [xác thực](/docs/{{version}}/authentication), [đặt lại mật khẩu](/docs/{{version}}/passwords) và [xác minh email](/docs/{{version}}/verification).

<a name="what-is-fortify"></a>
### Fortify là gì?

Như đã đề cập, Laravel Fortify là một triển khai backend xác thực không phụ thuộc frontend dành cho Laravel. Fortify đăng ký các route và controller cần thiết để triển khai toàn bộ tính năng xác thực của Laravel, bao gồm đăng nhập, đăng ký, đặt lại mật khẩu, xác minh email và nhiều tính năng khác.

**Bạn không bắt buộc phải sử dụng Fortify để dùng các tính năng xác thực của Laravel.** Bạn luôn có thể tương tác thủ công với các dịch vụ xác thực của Laravel bằng cách làm theo tài liệu về [xác thực](/docs/{{version}}/authentication), [đặt lại mật khẩu](/docs/{{version}}/passwords) và [xác minh email](/docs/{{version}}/verification).

Nếu bạn mới làm quen với Laravel, bạn có thể tìm hiểu [các application starter kit](/docs/{{version}}/starter-kits). Các starter kit của Laravel sử dụng Fortify bên trong để cung cấp scaffolding xác thực cho ứng dụng, bao gồm giao diện người dùng được xây dựng bằng [Tailwind CSS](https://tailwindcss.com). Nhờ đó, bạn có thể nghiên cứu và làm quen với các tính năng xác thực của Laravel.

Về cơ bản, Laravel Fortify lấy các route và controller từ application starter kit và cung cấp chúng dưới dạng một package không kèm giao diện người dùng. Điều này cho phép bạn nhanh chóng dựng phần backend cho lớp xác thực của ứng dụng mà không bị ràng buộc vào một lựa chọn frontend cụ thể.

<a name="when-should-i-use-fortify"></a>
### Khi nào nên sử dụng Fortify?

Bạn có thể đang tự hỏi khi nào nên sử dụng Laravel Fortify. Trước hết, nếu đang dùng một trong các [application starter kit](/docs/{{version}}/starter-kits) của Laravel, bạn không cần cài Laravel Fortify vì tất cả starter kit của Laravel đều sử dụng Fortify và đã cung cấp sẵn một triển khai xác thực đầy đủ.

Nếu không sử dụng application starter kit và ứng dụng cần các tính năng xác thực, bạn có hai lựa chọn: tự triển khai thủ công các tính năng xác thực hoặc sử dụng Laravel Fortify để cung cấp phần triển khai backend cho các tính năng này.

Nếu chọn cài Fortify, giao diện người dùng của bạn sẽ gửi request đến các route xác thực của Fortify được mô tả trong tài liệu này để xác thực và đăng ký người dùng.

Nếu chọn tương tác thủ công với các dịch vụ xác thực của Laravel thay vì sử dụng Fortify, bạn có thể làm theo tài liệu về [xác thực](/docs/{{version}}/authentication), [đặt lại mật khẩu](/docs/{{version}}/passwords) và [xác minh email](/docs/{{version}}/verification).

<a name="laravel-fortify-and-laravel-sanctum"></a>
#### Laravel Fortify và Laravel Sanctum

Một số lập trình viên nhầm lẫn về sự khác biệt giữa [Laravel Sanctum](/docs/{{version}}/sanctum) và Laravel Fortify. Vì hai package giải quyết hai vấn đề khác nhau nhưng có liên quan, Laravel Fortify và Laravel Sanctum không loại trừ lẫn nhau và cũng không phải các package cạnh tranh.

Laravel Sanctum chỉ tập trung vào việc quản lý API token và xác thực người dùng hiện có bằng session cookie hoặc token. Sanctum không cung cấp các route xử lý đăng ký người dùng, đặt lại mật khẩu, v.v.

Nếu đang tự xây dựng lớp xác thực cho một ứng dụng cung cấp API hoặc đóng vai trò backend cho single-page application, bạn hoàn toàn có thể sử dụng đồng thời Laravel Fortify (đăng ký người dùng, đặt lại mật khẩu, v.v.) và Laravel Sanctum (quản lý API token, xác thực session).

<a name="installation"></a>
## Cài đặt

Để bắt đầu, hãy cài đặt Fortify bằng trình quản lý package Composer:

```shell
composer require laravel/fortify
```

Tiếp theo, publish các resource của Fortify bằng lệnh Artisan `fortify:install`:

```shell
php artisan fortify:install
```

Lệnh này sẽ publish các action của Fortify vào thư mục `app/Actions`; thư mục này sẽ được tạo nếu chưa tồn tại. Ngoài ra, `FortifyServiceProvider`, file cấu hình và toàn bộ database migration cần thiết cũng sẽ được publish.

Tiếp theo, bạn nên chạy migration cho cơ sở dữ liệu:

```shell
php artisan migrate
```

<a name="fortify-features"></a>
### Các tính năng của Fortify

File cấu hình `fortify` chứa mảng cấu hình `features`. Mảng này xác định những route / tính năng backend mà Fortify sẽ cung cấp theo mặc định. Chúng tôi khuyến nghị chỉ bật các tính năng sau, đây là những tính năng xác thực cơ bản được phần lớn ứng dụng Laravel cung cấp:

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
],
```

<a name="disabling-views"></a>
### Vô hiệu hóa view

Theo mặc định, Fortify định nghĩa các route dùng để trả về view, chẳng hạn màn hình đăng nhập hoặc đăng ký. Tuy nhiên, nếu đang xây dựng single-page application bằng JavaScript, bạn có thể không cần các route này. Vì vậy, bạn có thể vô hiệu hóa hoàn toàn chúng bằng cách đặt giá trị cấu hình `views` trong file `config/fortify.php` của ứng dụng thành `false`:

```php
'views' => false,
```

<a name="disabling-views-and-password-reset"></a>
#### Vô hiệu hóa view và đặt lại mật khẩu

Nếu bạn vô hiệu hóa các view của Fortify nhưng vẫn triển khai tính năng đặt lại mật khẩu, bạn vẫn nên định nghĩa route có tên `password.reset` chịu trách nhiệm hiển thị view "đặt lại mật khẩu" của ứng dụng. Điều này là cần thiết vì notification `Illuminate\Auth\Notifications\ResetPassword` của Laravel sẽ tạo URL đặt lại mật khẩu thông qua named route `password.reset`.

<a name="authentication"></a>
## Xác thực

Để bắt đầu, chúng ta cần chỉ cho Fortify cách trả về view "đăng nhập". Hãy nhớ rằng Fortify là một thư viện xác thực headless. Nếu bạn muốn có sẵn phần triển khai frontend cho các tính năng xác thực của Laravel, bạn nên sử dụng một [application starter kit](/docs/{{version}}/starter-kits).

Toàn bộ logic render view xác thực có thể được tùy biến bằng các method tương ứng trên class `Laravel\Fortify\Fortify`. Thông thường, bạn nên gọi method này từ method `boot` của class `App\Providers\FortifyServiceProvider`. Fortify sẽ tự định nghĩa route `/login` trả về view này:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::loginView(function () {
        return view('auth.login');
    });

    // ...
}
```

Template đăng nhập nên chứa form gửi POST request đến `/login`. Endpoint `/login` yêu cầu chuỗi `email` / `username` và `password`. Tên field email / username phải khớp với giá trị `username` trong file cấu hình `config/fortify.php`. Ngoài ra, có thể gửi field boolean `remember` để cho biết người dùng muốn sử dụng chức năng "remember me" của Laravel.

Nếu đăng nhập thành công, Fortify sẽ redirect đến URI được cấu hình bằng option `home` trong file cấu hình `fortify` của ứng dụng. Nếu request đăng nhập là XHR request, HTTP response 200 sẽ được trả về.

Nếu request không thành công, người dùng sẽ được redirect trở lại màn hình đăng nhập và validation error có thể được truy cập qua [biến template Blade](/docs/{{version}}/validation#quick-displaying-the-validation-errors) `$errors` dùng chung. Với XHR request, validation error sẽ được trả về cùng HTTP response 422.

<a name="customizing-user-authentication"></a>
### Tùy biến xác thực người dùng

Fortify sẽ tự động truy xuất và xác thực người dùng dựa trên credentials được cung cấp và authentication guard được cấu hình cho ứng dụng. Tuy nhiên, đôi khi bạn có thể muốn tùy biến hoàn toàn cách xác thực credentials và truy xuất người dùng. Fortify cho phép thực hiện điều này dễ dàng bằng method `Fortify::authenticateUsing`.

Method này nhận một closure với HTTP request đầu vào. Closure chịu trách nhiệm validate credentials đăng nhập trong request và trả về user instance tương ứng. Nếu credentials không hợp lệ hoặc không tìm thấy người dùng, closure nên trả về `null` hoặc `false`. Thông thường, method này nên được gọi từ method `boot` của `FortifyServiceProvider`:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::authenticateUsing(function (Request $request) {
        $user = User::where('email', $request->email)->first();

        if ($user &&
            Hash::check($request->password, $user->password)) {
            return $user;
        }
    });

    // ...
}
```

<a name="authentication-guard"></a>
#### Guard xác thực

Bạn có thể tùy biến authentication guard mà Fortify sử dụng trong file cấu hình `fortify` của ứng dụng. Tuy nhiên, cần đảm bảo guard được cấu hình là một implementation của `Illuminate\Contracts\Auth\StatefulGuard`. Nếu sử dụng Laravel Fortify để xác thực SPA, bạn nên dùng guard `web` mặc định của Laravel kết hợp với [Laravel Sanctum](https://laravel.com/docs/sanctum).

<a name="customizing-the-authentication-pipeline"></a>
### Tùy biến pipeline xác thực

Laravel Fortify xác thực các request đăng nhập thông qua một pipeline gồm các invokable class. Nếu muốn, bạn có thể định nghĩa pipeline class tùy chỉnh mà request đăng nhập sẽ đi qua. Mỗi class nên có method `__invoke` nhận instance `Illuminate\Http\Request` đầu vào và, tương tự [middleware](/docs/{{version}}/middleware), biến `$next` được gọi để chuyển request sang class tiếp theo trong pipeline.

Để định nghĩa pipeline tùy chỉnh, bạn có thể dùng method `Fortify::authenticateThrough`. Method này nhận một closure trả về mảng class mà request đăng nhập sẽ đi qua. Thông thường, method này nên được gọi từ method `boot` của class `App\Providers\FortifyServiceProvider`.

Ví dụ dưới đây chứa định nghĩa pipeline mặc định mà bạn có thể dùng làm điểm khởi đầu cho các tùy chỉnh của mình:

```php
use Laravel\Fortify\Actions\AttemptToAuthenticate;
use Laravel\Fortify\Actions\CanonicalizeUsername;
use Laravel\Fortify\Actions\EnsureLoginIsNotThrottled;
use Laravel\Fortify\Actions\PrepareAuthenticatedSession;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

Fortify::authenticateThrough(function (Request $request) {
    return array_filter([
            config('fortify.limiters.login') ? null : EnsureLoginIsNotThrottled::class,
            config('fortify.lowercase_usernames') ? CanonicalizeUsername::class : null,
            Features::enabled(Features::twoFactorAuthentication()) ? RedirectIfTwoFactorAuthenticatable::class : null,
            AttemptToAuthenticate::class,
            PrepareAuthenticatedSession::class,
    ]);
});
```

#### Giới hạn tần suất xác thực

Theo mặc định, Fortify giới hạn tần suất các lần xác thực bằng middleware `EnsureLoginIsNotThrottled`. Middleware này giới hạn các lần thử theo tổ hợp username và địa chỉ IP.

Một số ứng dụng có thể cần cách giới hạn lần xác thực khác, chẳng hạn chỉ giới hạn theo địa chỉ IP. Vì vậy, Fortify cho phép bạn chỉ định [rate limiter](/docs/{{version}}/routing#rate-limiting) riêng thông qua option cấu hình `fortify.limiters.login`. Option này nằm trong file cấu hình `config/fortify.php` của ứng dụng.

> [!NOTE]
> Kết hợp throttling, [xác thực hai yếu tố](/docs/{{version}}/fortify#two-factor-authentication) và web application firewall (WAF) bên ngoài sẽ mang lại lớp phòng vệ mạnh mẽ nhất cho người dùng hợp lệ của ứng dụng.

<a name="customizing-authentication-redirects"></a>
### Tùy biến chuyển hướng

Nếu đăng nhập thành công, Fortify sẽ redirect đến URI được cấu hình bằng option `home` trong file cấu hình `fortify` của ứng dụng. Nếu request đăng nhập là XHR request, HTTP response 200 sẽ được trả về. Sau khi người dùng đăng xuất khỏi ứng dụng, họ sẽ được chuyển hướng đến URI `/`.

Nếu cần tùy biến nâng cao hành vi này, bạn có thể bind các implementation của contract `LoginResponse` và `LogoutResponse` vào [service container](/docs/{{version}}/container) của Laravel. Thông thường, việc này nên được thực hiện trong method `register` của class `App\Providers\FortifyServiceProvider`:

```php
use Laravel\Fortify\Contracts\LogoutResponse;

/**
 * Register any application services.
 */
public function register(): void
{
    $this->app->instance(LogoutResponse::class, new class implements LogoutResponse {
        public function toResponse($request)
        {
            return redirect('/');
        }
    });
}
```

<a name="two-factor-authentication"></a>
## Xác thực hai yếu tố

Khi tính năng xác thực hai yếu tố của Fortify được bật, người dùng phải nhập một token số gồm sáu chữ số trong quá trình xác thực. Token này được tạo bằng mật khẩu dùng một lần dựa trên thời gian (TOTP), có thể lấy từ bất kỳ ứng dụng xác thực di động nào tương thích TOTP như Google Authenticator.

Trước khi bắt đầu, trước tiên bạn nên đảm bảo model `App\Models\User` của ứng dụng sử dụng trait `Laravel\Fortify\TwoFactorAuthenticatable`:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use Notifiable, TwoFactorAuthenticatable;
}
```

Tiếp theo, bạn nên xây dựng một màn hình trong ứng dụng để người dùng quản lý cài đặt xác thực hai yếu tố. Màn hình này nên cho phép người dùng bật và tắt xác thực hai yếu tố, đồng thời tạo lại các mã khôi phục xác thực hai yếu tố.

> Theo mặc định, mảng `features` trong file cấu hình `fortify` yêu cầu phải xác nhận mật khẩu trước khi thay đổi cài đặt xác thực hai yếu tố của Fortify. Vì vậy, ứng dụng của bạn nên triển khai tính năng [xác nhận mật khẩu](#password-confirmation) của Fortify trước khi tiếp tục.

<a name="enabling-two-factor-authentication"></a>
### Bật xác thực hai yếu tố

Để bắt đầu bật xác thực hai yếu tố, ứng dụng của bạn nên gửi request POST đến endpoint `/user/two-factor-authentication` do Fortify định nghĩa. Nếu request thành công, người dùng sẽ được chuyển hướng về URL trước đó và biến session `status` sẽ được đặt thành `two-factor-authentication-enabled`. Bạn có thể kiểm tra biến session `status` này trong template để hiển thị thông báo thành công phù hợp. Nếu đây là request XHR, response HTTP `200` sẽ được trả về.

Sau khi chọn bật xác thực hai yếu tố, người dùng vẫn phải "xác nhận" cấu hình xác thực hai yếu tố bằng cách cung cấp một mã xác thực hai yếu tố hợp lệ. Vì vậy, thông báo "thành công" của bạn nên cho người dùng biết rằng vẫn cần xác nhận xác thực hai yếu tố:

```html
@if (session('status') == 'two-factor-authentication-enabled')
    <div class="mb-4 font-medium text-sm">
        Please finish configuring two-factor authentication below.
    </div>
@endif
```

Tiếp theo, bạn nên hiển thị mã QR xác thực hai yếu tố để người dùng quét bằng ứng dụng xác thực của họ. Nếu sử dụng Blade để render frontend, bạn có thể lấy SVG của mã QR bằng method `twoFactorQrCodeSvg` có trên instance người dùng:

```php
$request->user()->twoFactorQrCodeSvg();
```

Nếu đang xây dựng frontend bằng JavaScript, bạn có thể gửi request XHR GET đến endpoint `/user/two-factor-qr-code` để lấy mã QR xác thực hai yếu tố của người dùng. Endpoint này trả về một object JSON chứa key `svg`.

<a name="confirming-two-factor-authentication"></a>
#### Xác nhận xác thực hai yếu tố

Ngoài việc hiển thị mã QR xác thực hai yếu tố của người dùng, bạn nên cung cấp một ô nhập văn bản để người dùng nhập mã xác thực hợp lệ nhằm "xác nhận" cấu hình xác thực hai yếu tố. Mã này nên được gửi đến ứng dụng Laravel thông qua request POST tới endpoint `/user/confirmed-two-factor-authentication` do Fortify định nghĩa.

Nếu request thành công, người dùng sẽ được chuyển hướng về URL trước đó và biến session `status` sẽ được đặt thành `two-factor-authentication-confirmed`:

```html
@if (session('status') == 'two-factor-authentication-confirmed')
    <div class="mb-4 font-medium text-sm">
        Two-factor authentication confirmed and enabled successfully.
    </div>
@endif
```

Nếu request đến endpoint xác nhận xác thực hai yếu tố được thực hiện qua XHR, response HTTP `200` sẽ được trả về.

<a name="displaying-the-recovery-codes"></a>
#### Hiển thị mã khôi phục

Bạn cũng nên hiển thị các mã khôi phục xác thực hai yếu tố của người dùng. Các mã khôi phục này cho phép người dùng xác thực nếu họ mất quyền truy cập vào thiết bị di động. Nếu sử dụng Blade để render frontend của ứng dụng, bạn có thể truy cập các mã khôi phục thông qua instance người dùng đã xác thực:

```php
(array) $request->user()->recoveryCodes()
```

Nếu đang xây dựng frontend bằng JavaScript, bạn có thể gửi request XHR GET đến endpoint `/user/two-factor-recovery-codes`. Endpoint này sẽ trả về một mảng JSON chứa các mã khôi phục của người dùng.

Để tạo lại các mã khôi phục của người dùng, ứng dụng nên gửi request POST đến endpoint `/user/two-factor-recovery-codes`.

<a name="authenticating-with-two-factor-authentication"></a>
### Xác thực bằng xác thực hai yếu tố

Trong quá trình xác thực, Fortify sẽ tự động chuyển hướng người dùng đến màn hình thử thách xác thực hai yếu tố của ứng dụng. Tuy nhiên, nếu ứng dụng thực hiện request đăng nhập qua XHR, response JSON được trả về sau một lần xác thực thành công sẽ chứa object JSON có property boolean `two_factor`. Bạn nên kiểm tra giá trị này để xác định có cần chuyển hướng đến màn hình thử thách xác thực hai yếu tố của ứng dụng hay không.

Để bắt đầu triển khai chức năng xác thực hai yếu tố, chúng ta cần chỉ cho Fortify cách trả về view thử thách xác thực hai yếu tố. Toàn bộ logic render view xác thực của Fortify có thể được tùy biến bằng các method phù hợp có sẵn trên class `Laravel\Fortify\Fortify`. Thông thường, bạn nên gọi method này từ method `boot` của class `App\Providers\FortifyServiceProvider` trong ứng dụng:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::twoFactorChallengeView(function () {
        return view('auth.two-factor-challenge');
    });

    // ...
}
```

Fortify sẽ đảm nhiệm việc định nghĩa route `/two-factor-challenge` trả về view này. Template `two-factor-challenge` nên chứa một form gửi request POST đến endpoint `/two-factor-challenge`. Action `/two-factor-challenge` yêu cầu field `code` chứa token TOTP hợp lệ hoặc field `recovery_code` chứa một trong các mã khôi phục của người dùng.

Nếu lần đăng nhập thành công, Fortify sẽ chuyển hướng người dùng đến URI được cấu hình thông qua tùy chọn `home` trong file cấu hình `fortify` của ứng dụng. Nếu request đăng nhập là request XHR, response HTTP 204 sẽ được trả về.

Nếu request không thành công, người dùng sẽ được chuyển hướng trở lại màn hình thử thách xác thực hai yếu tố và các lỗi validation sẽ có sẵn thông qua [biến template Blade `$errors`](/docs/{{version}}/validation#quick-displaying-the-validation-errors) được chia sẻ. Với request XHR, các lỗi validation sẽ được trả về cùng response HTTP 422.

<a name="disabling-two-factor-authentication"></a>
### Vô hiệu hóa xác thực hai yếu tố

Để vô hiệu hóa xác thực hai yếu tố, ứng dụng nên gửi request DELETE đến endpoint `/user/two-factor-authentication`. Hãy nhớ rằng các endpoint xác thực hai yếu tố của Fortify yêu cầu [xác nhận mật khẩu](#password-confirmation) trước khi được gọi.

<a name="passkeys"></a>
## Passkeys

Fortify hỗ trợ xác thực bằng passkey thông qua WebAuthn. Passkey cho phép người dùng xác thực không cần mật khẩu bằng các trình xác thực nền tảng như Face ID, Touch ID, Windows Hello hoặc khóa bảo mật phần cứng.

<a name="enabling-passkeys"></a>
### Bật Passkey

Để bắt đầu, hãy đảm bảo tính năng `passkeys` đã được bật trong file cấu hình `fortify` của ứng dụng:

```php
use Laravel\Fortify\Features;

'features' => [
    // ...
    Features::passkeys([
        'confirmPassword' => true,
    ]),
],
```

Tùy chọn `confirmPassword` xác định Fortify có yêu cầu [xác nhận mật khẩu](#password-confirmation) trước khi có thể đăng ký hoặc xóa passkey hay không.

Tiếp theo, hãy đảm bảo model `App\Models\User` của ứng dụng implements `Laravel\Fortify\Contracts\PasskeyUser` và sử dụng trait `Laravel\Fortify\PasskeyAuthenticatable`:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;

class User extends Authenticatable implements PasskeyUser
{
    use Notifiable, PasskeyAuthenticatable;
}
```

Các tùy chọn cấu hình passkey của Fortify có thể được tùy biến bằng mảng cấu hình `passkeys` trong file `config/fortify.php` của ứng dụng:

```php
'passkeys' => [
    'relying_party_id' => parse_url(config('app.url'), PHP_URL_HOST),
    'allowed_origins' => [config('app.url')],
    'user_handle_secret' => config('app.key'),
    'timeout' => 60000,
],
```

> [!NOTE]
> Fortify bao bọc package Composer `laravel/passkeys` và cấu hình package này cho bạn. Nếu sử dụng tính năng passkey của Fortify, bạn nên cấu hình passkey bằng file `config/fortify.php` của ứng dụng. Bạn không cần publish file cấu hình của `laravel/passkeys`; mọi giá trị được định nghĩa trong đó sẽ bị Fortify ghi đè.

`relying_party_id` nên khớp với domain của ứng dụng. Mảng `allowed_origins` liệt kê các origin của trình duyệt được phép hoàn tất việc đăng ký và xác thực passkey. `user_handle_secret` được dùng để tạo ra các định danh người dùng không để lộ thông tin, bảo đảm cùng một người dùng được nhận diện nhất quán giữa các lần đăng ký passkey. Tùy chọn `timeout` kiểm soát khoảng thời gian các thao tác đăng ký và xác thực passkey có thể duy trì trạng thái hoạt động.

Fortify áp dụng rate limiter riêng cho các route đăng nhập, xác nhận và đăng ký passkey. Khi cần, bạn có thể tùy biến limiter này bằng tùy chọn cấu hình `fortify.limiters.passkeys` và định nghĩa `RateLimiter::for(...)` tương ứng.

<a name="passkeys-javascript-client"></a>
### Client JavaScript

Nếu đang xây dựng frontend tùy biến, bao gồm ứng dụng Blade có script chạy phía trình duyệt, bạn có thể sử dụng package chính thức [`@laravel/passkeys`](https://www.npmjs.com/package/@laravel/passkeys). Package này xử lý các nghi thức WebAuthn trên trình duyệt và gửi request đến các endpoint passkey của Fortify.

Cài đặt package bằng npm:

```shell
npm install @laravel/passkeys
```

Sau đó, bạn có thể khởi tạo việc đăng ký và xác minh passkey từ frontend:

```js
import { Passkeys } from "@laravel/passkeys";

await Passkeys.register({ name: "MacBook Pro" });
await Passkeys.verify();
```

Nếu ứng dụng sử dụng URI endpoint passkey tùy biến, bạn có thể ghi đè các route cho từng lần gọi:

```js
await Passkeys.verify({
    routes: {
        options: "/passkeys/confirm/options",
        submit: "/passkeys/confirm",
    },
});

await Passkeys.register({
    name: "MacBook Pro",
    routes: {
        options: "/user/passkeys/options",
        submit: "/user/passkeys",
    },
});
```

Package này cũng cung cấp các helper cho React, Vue và Svelte thông qua `@laravel/passkeys/react`, `@laravel/passkeys/vue` và `@laravel/passkeys/svelte`.

<a name="authenticating-with-passkeys"></a>
### Xác thực bằng Passkey

Để xác thực người dùng bằng passkey, trước tiên ứng dụng nên gửi request GET đến endpoint `/passkeys/login/options`. Endpoint này trả về các tùy chọn WebAuthn challenge mà frontend nên truyền cho `navigator.credentials.get(...)`.

Sau khi trình duyệt trả về credential, ứng dụng nên gửi request POST đến `/passkeys/login` cùng payload credential. Bạn cũng có thể gửi thêm field boolean `remember`.

Nếu request thành công, Fortify sẽ đăng nhập người dùng vào guard đã cấu hình và trả về một trong các response sau:

<div class="content-list" markdown="1">

- Response chuyển hướng đến đích dự kiến đối với request thông thường.
- Response HTTP `200` chứa payload JSON với key `redirect` đối với request XHR.

</div>

<a name="confirming-password-with-passkeys"></a>
### Xác nhận mật khẩu bằng Passkey

Đối với session đã xác thực, Fortify cung cấp các endpoint xác nhận bằng passkey để đáp ứng yêu cầu xác nhận mật khẩu của Laravel cho session hiện tại.

Để xác nhận bằng passkey, trước tiên ứng dụng nên gửi request GET đến `/passkeys/confirm/options`. Endpoint này trả về các tùy chọn WebAuthn challenge mà frontend nên truyền cho `navigator.credentials.get(...)`.

Sau khi trình duyệt trả về credential, ứng dụng nên gửi request POST đến `/passkeys/confirm` cùng payload credential.

Nếu request thành công, Fortify đánh dấu session hiện tại là đã xác nhận mật khẩu và trả về một trong các response sau:

<div class="content-list" markdown="1">

- Response chuyển hướng đến đích dự kiến đối với request thông thường.
- Response HTTP `200` chứa payload JSON với key `redirect` đối với request XHR.

</div>

<a name="registering-passkeys"></a>
### Đăng ký Passkey

Để đăng ký passkey cho người dùng đã xác thực, trước tiên ứng dụng nên gửi request GET đến `/user/passkeys/options`. Endpoint này trả về các tùy chọn tạo WebAuthn mà frontend nên truyền cho `navigator.credentials.create(...)`.

Sau khi trình duyệt trả về credential, ứng dụng nên gửi request POST đến `/user/passkeys` với field `name` và field `credential` chứa object [`PublicKeyCredential`](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential) đã được serialize do `navigator.credentials.create(...)` trả về.

Nếu request thành công, Fortify sẽ trả về một trong các response sau:

<div class="content-list" markdown="1">

- Response chuyển hướng trở lại với status `passkey-registered` trong session đối với request thông thường.
- Response HTTP `200` với payload JSON chứa key `status`, cùng `id` và `name` của passkey vừa đăng ký.

</div>

<a name="deleting-passkeys"></a>
### Xóa Passkey

Để xóa passkey, ứng dụng nên gửi request DELETE đến `/user/passkeys/{passkey}`.

Nếu request thành công, Fortify sẽ trả về một trong các response sau:

<div class="content-list" markdown="1">

- Response chuyển hướng trở lại với status `passkey-deleted` trong session đối với request thông thường.
- Response HTTP `200` với payload JSON chứa key `status` đối với request XHR.

</div>

<a name="registration"></a>
## Đăng ký

Để bắt đầu triển khai chức năng đăng ký của ứng dụng, chúng ta cần chỉ cho Fortify cách trả về view "register". Hãy nhớ rằng Fortify là thư viện xác thực headless. Nếu muốn dùng một frontend đã triển khai sẵn các tính năng xác thực của Laravel, bạn nên sử dụng [application starter kit](/docs/{{version}}/starter-kits).

Toàn bộ logic render view của Fortify có thể được tùy biến bằng các method tương ứng trên class `Laravel\Fortify\Fortify`. Thông thường, bạn nên gọi method này từ method `boot` của class `App\Providers\FortifyServiceProvider`:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::registerView(function () {
        return view('auth.register');
    });

    // ...
}
```

Fortify sẽ tự định nghĩa route `/register` trả về view này. Template `register` của bạn nên chứa form gửi POST request đến endpoint `/register` do Fortify định nghĩa.

Endpoint `/register` yêu cầu các field `name` dạng string, địa chỉ email / username dạng string, `password` và `password_confirmation`. Tên field email / username phải khớp với giá trị cấu hình `username` trong file cấu hình `fortify` của ứng dụng.

Nếu đăng ký thành công, Fortify sẽ redirect người dùng đến URI được cấu hình qua option `home` trong file cấu hình `fortify`. Nếu request là XHR, HTTP response 201 sẽ được trả về.

Nếu request không thành công, người dùng sẽ được redirect trở lại màn hình đăng ký và validation error có thể được truy cập qua [biến template Blade](/docs/{{version}}/validation#quick-displaying-the-validation-errors) `$errors` dùng chung. Với XHR request, validation error sẽ được trả về cùng HTTP response 422.

<a name="customizing-registration"></a>
### Tùy biến đăng ký

Quy trình validate và tạo user có thể được tùy biến bằng cách sửa action `App\Actions\Fortify\CreateNewUser` được tạo khi cài Laravel Fortify.

<a name="password-reset"></a>
## Đặt lại mật khẩu

<a name="requesting-a-password-reset-link"></a>
### Yêu cầu liên kết đặt lại mật khẩu

Để bắt đầu triển khai chức năng đặt lại mật khẩu, chúng ta cần chỉ cho Fortify cách trả về view "forgot password". Fortify là thư viện xác thực headless; nếu muốn dùng frontend đã triển khai sẵn các tính năng xác thực Laravel, bạn nên sử dụng [application starter kit](/docs/{{version}}/starter-kits).

Toàn bộ logic render view của Fortify có thể được tùy biến bằng các method tương ứng trên class `Laravel\Fortify\Fortify`. Thông thường, bạn nên gọi method này từ method `boot` của class `App\Providers\FortifyServiceProvider` của ứng dụng:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::requestPasswordResetLinkView(function () {
        return view('auth.forgot-password');
    });

    // ...
}
```

Fortify sẽ tự định nghĩa endpoint `/forgot-password` trả về view này. Template `forgot-password` nên chứa form gửi POST request đến endpoint `/forgot-password`.

Endpoint `/forgot-password` yêu cầu field `email` dạng string. Tên field / database column này phải khớp với giá trị cấu hình `email` trong file cấu hình `fortify`.

<a name="handling-the-password-reset-link-request-response"></a>
#### Xử lý response khi yêu cầu liên kết đặt lại mật khẩu

Nếu yêu cầu liên kết đặt lại mật khẩu thành công, Fortify sẽ redirect người dùng trở lại endpoint `/forgot-password` và gửi email chứa liên kết bảo mật để đặt lại mật khẩu. Với XHR request, HTTP response 200 sẽ được trả về.

Sau khi request thành công và được redirect về endpoint `/forgot-password`, biến session `status` có thể được dùng để hiển thị trạng thái của yêu cầu liên kết đặt lại mật khẩu.

Giá trị biến session `$status` sẽ khớp với một trong các chuỗi dịch được định nghĩa trong [language file](/docs/{{version}}/localization) `passwords` của ứng dụng. Nếu muốn tùy biến giá trị này và chưa publish language file của Laravel, bạn có thể dùng Artisan command `lang:publish`:

```html
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

Nếu request không thành công, người dùng sẽ được redirect về màn hình yêu cầu liên kết đặt lại mật khẩu và validation error có thể truy cập qua [biến template Blade](/docs/{{version}}/validation#quick-displaying-the-validation-errors) `$errors`. Với XHR request, validation error được trả về cùng HTTP response 422.

<a name="resetting-the-password"></a>
### Đặt lại mật khẩu

Để hoàn tất việc triển khai chức năng đặt lại mật khẩu, chúng ta cần chỉ cho Fortify cách trả về view "reset password".

Toàn bộ logic render view của Fortify có thể được tùy biến bằng các method tương ứng trên class `Laravel\Fortify\Fortify`. Thông thường, bạn nên gọi method này từ method `boot` của class `App\Providers\FortifyServiceProvider` của ứng dụng:

```php
use Laravel\Fortify\Fortify;
use Illuminate\Http\Request;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::resetPasswordView(function (Request $request) {
        return view('auth.reset-password', ['request' => $request]);
    });

    // ...
}
```

Fortify sẽ tự định nghĩa route hiển thị view này. Template `reset-password` nên chứa form gửi POST request đến `/reset-password`.

Endpoint `/reset-password` yêu cầu field `email` dạng string, field `password`, field `password_confirmation` và hidden field `token` chứa giá trị `request()->route('token')`. Tên field / database column "email" phải khớp với giá trị cấu hình `email` trong file cấu hình `fortify`.

<a name="handling-the-password-reset-response"></a>
#### Xử lý response đặt lại mật khẩu

Nếu request đặt lại mật khẩu thành công, Fortify sẽ redirect về route `/login` để người dùng đăng nhập bằng mật khẩu mới. Đồng thời, biến session `status` sẽ được thiết lập để bạn có thể hiển thị trạng thái đặt lại thành công trên màn hình đăng nhập:

```blade
@if (session('status'))
    <div class="mb-4 font-medium text-sm text-green-600">
        {{ session('status') }}
    </div>
@endif
```

Nếu request là XHR, HTTP response 200 sẽ được trả về.

Nếu request không thành công, người dùng sẽ được redirect về màn hình đặt lại mật khẩu và validation error có thể truy cập qua [biến template Blade](/docs/{{version}}/validation#quick-displaying-the-validation-errors) `$errors`. Với XHR request, validation error được trả về cùng HTTP response 422.

<a name="customizing-password-resets"></a>
### Tùy biến việc đặt lại mật khẩu

Quy trình đặt lại mật khẩu có thể được tùy biến bằng cách sửa action `App\Actions\ResetUserPassword` được tạo khi cài Laravel Fortify.

<a name="email-verification"></a>
## Xác minh email

Sau khi đăng ký, bạn có thể yêu cầu người dùng xác minh địa chỉ email trước khi tiếp tục truy cập ứng dụng. Trước tiên, hãy bảo đảm feature `emailVerification` được bật trong array `features` của file cấu hình `fortify`. Sau đó, bảo đảm class `App\Models\User` implement interface `Illuminate\Contracts\Auth\MustVerifyEmail`.

Sau khi hoàn tất hai bước thiết lập này, user mới đăng ký sẽ nhận email yêu cầu xác minh quyền sở hữu địa chỉ email. Tuy nhiên, chúng ta vẫn cần chỉ cho Fortify cách hiển thị màn hình xác minh email để hướng dẫn người dùng nhấp vào liên kết xác minh trong email.

Toàn bộ logic render view của Fortify có thể được tùy biến bằng các method tương ứng trên class `Laravel\Fortify\Fortify`. Thông thường, bạn nên gọi method này từ method `boot` của class `App\Providers\FortifyServiceProvider` của ứng dụng:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::verifyEmailView(function () {
        return view('auth.verify-email');
    });

    // ...
}
```

Fortify sẽ tự định nghĩa route hiển thị view này khi user được middleware `verified` tích hợp sẵn của Laravel redirect đến endpoint `/email/verify`.

Template `verify-email` nên chứa thông báo hướng dẫn user nhấp vào liên kết xác minh đã được gửi đến địa chỉ email của họ.

<a name="resending-email-verification-links"></a>
#### Gửi lại liên kết xác minh email

Nếu muốn, bạn có thể thêm button vào template `verify-email` để gửi POST request đến endpoint `/email/verification-notification`. Khi nhận request, endpoint này sẽ gửi một liên kết xác minh mới qua email, cho phép user lấy lại liên kết nếu liên kết trước bị xóa hoặc thất lạc.

Nếu request gửi lại email xác minh thành công, Fortify sẽ redirect user về endpoint `/email/verify` cùng biến session `status`, cho phép hiển thị thông báo thao tác thành công. Với XHR request, HTTP response 202 sẽ được trả về:

```blade
@if (session('status') == 'verification-link-sent')
    <div class="mb-4 font-medium text-sm text-green-600">
        A new email verification link has been emailed to you!
    </div>
@endif
```

<a name="protecting-routes"></a>
### Bảo vệ route

Để chỉ định một route hoặc nhóm route yêu cầu user đã xác minh email, hãy gắn middleware `verified` tích hợp sẵn của Laravel vào route. Alias middleware `verified` được Laravel đăng ký tự động và là alias của middleware `Illuminate\Auth\Middleware\EnsureEmailIsVerified`:

```php
Route::get('/dashboard', function () {
    // ...
})->middleware(['verified']);
```

<a name="password-confirmation"></a>
## Xác nhận mật khẩu

Khi xây dựng ứng dụng, đôi lúc bạn có các action cần yêu cầu user xác nhận mật khẩu trước khi thực thi. Thông thường, các route này được bảo vệ bằng middleware `password.confirm` tích hợp sẵn của Laravel.

Để bắt đầu triển khai chức năng xác nhận mật khẩu, chúng ta cần chỉ cho Fortify cách trả về view "password confirmation" của ứng dụng. Fortify là thư viện xác thực headless; nếu muốn dùng frontend đã triển khai sẵn các tính năng xác thực Laravel, bạn nên sử dụng [application starter kit](/docs/{{version}}/starter-kits).

Toàn bộ logic render view của Fortify có thể được tùy biến bằng các method tương ứng trên class `Laravel\Fortify\Fortify`. Thông thường, bạn nên gọi method này từ method `boot` của class `App\Providers\FortifyServiceProvider` của ứng dụng:

```php
use Laravel\Fortify\Fortify;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Fortify::confirmPasswordView(function () {
        return view('auth.confirm-password');
    });

    // ...
}
```

Fortify sẽ tự định nghĩa endpoint `/user/confirm-password` trả về view này. Template `confirm-password` nên chứa form gửi POST request đến endpoint `/user/confirm-password`. Endpoint này yêu cầu field `password` chứa mật khẩu hiện tại của user.

Nếu mật khẩu khớp với mật khẩu hiện tại của user, Fortify sẽ redirect user đến route họ đang cố truy cập. Với XHR request, HTTP response 201 sẽ được trả về.

Nếu request không thành công, user sẽ được redirect về màn hình xác nhận mật khẩu và validation error có thể truy cập qua biến template Blade `$errors`. Với XHR request, validation error được trả về cùng HTTP response 422.

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/fortify). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
