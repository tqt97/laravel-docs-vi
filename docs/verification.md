# Xác minh Email

- [Giới thiệu](#introduction)
- [Chuẩn bị Model](#model-preparation)
- [Chuẩn bị Database](#database-preparation)
- [Routing](#verification-routing)
    - [Thông báo xác minh Email](#the-email-verification-notice)
    - [Xử lý xác minh Email](#the-email-verification-handler)
    - [Gửi lại Email xác minh](#resending-the-verification-email)
- [Bảo vệ Route](#protecting-routes)
- [Tùy biến](#customization)
- [Events](#events)

<a name="introduction"></a>
## Giới thiệu

Nhiều ứng dụng web yêu cầu người dùng xác minh địa chỉ email trước khi sử dụng ứng dụng. Thay vì buộc bạn phải tự triển khai lại tính năng này cho từng ứng dụng, Laravel cung cấp sẵn các service tiện lợi để gửi và xử lý các yêu cầu xác minh email.

> [!NOTE]
> Muốn bắt đầu nhanh? Hãy cài đặt một trong các [Laravel application starter kit](/docs/{{version}}/starter-kits) vào một ứng dụng Laravel mới. Starter kit sẽ đảm nhiệm việc scaffold toàn bộ hệ thống xác thực, bao gồm cả hỗ trợ xác minh email.

<a name="model-preparation"></a>
### Chuẩn bị Model

Trước khi bắt đầu, hãy đảm bảo model `App\Models\User` implement contract `Illuminate\Contracts\Auth\MustVerifyEmail`:

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;

    // ...
}
```

Sau khi interface này được thêm vào model, những người dùng mới đăng ký sẽ tự động nhận được email chứa liên kết xác minh. Điều này diễn ra tự động vì Laravel đăng ký [listener](/docs/{{version}}/events) `Illuminate\Auth\Listeners\SendEmailVerificationNotification` cho event `Illuminate\Auth\Events\Registered`.

Nếu bạn tự triển khai luồng đăng ký trong ứng dụng thay vì sử dụng [starter kit](/docs/{{version}}/starter-kits), hãy đảm bảo dispatch event `Illuminate\Auth\Events\Registered` sau khi đăng ký người dùng thành công:

```php
use Illuminate\Auth\Events\Registered;

event(new Registered($user));
```

<a name="database-preparation"></a>
### Chuẩn bị Database

Tiếp theo, table `users` của bạn phải có column `email_verified_at` để lưu ngày và giờ địa chỉ email của người dùng được xác minh. Thông thường, column này đã được bao gồm trong database migration mặc định `0001_01_01_000000_create_users_table.php` của Laravel.

<a name="verification-routing"></a>
## Routing

Để triển khai xác minh email đúng cách, bạn cần định nghĩa ba route. Đầu tiên, cần một route để hiển thị thông báo cho người dùng rằng họ nên nhấp vào liên kết xác minh email trong email xác minh mà Laravel đã gửi sau khi đăng ký.

Thứ hai, cần một route để xử lý request được tạo khi người dùng nhấp vào liên kết xác minh email trong email.

Thứ ba, cần một route để gửi lại liên kết xác minh nếu người dùng vô tình làm mất liên kết xác minh đầu tiên.

<a name="the-email-verification-notice"></a>
### Thông báo xác minh Email

Như đã đề cập trước đó, bạn nên định nghĩa một route trả về view hướng dẫn người dùng nhấp vào liên kết xác minh email mà Laravel đã gửi cho họ sau khi đăng ký. View này sẽ được hiển thị khi người dùng cố truy cập các phần khác của ứng dụng trước khi xác minh địa chỉ email. Hãy nhớ rằng liên kết sẽ được tự động gửi qua email cho người dùng miễn là model `App\Models\User` implement interface `MustVerifyEmail`:

```php
Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth')->name('verification.notice');
```

Route trả về thông báo xác minh email nên được đặt tên là `verification.notice`. Việc route được gán chính xác tên này rất quan trọng vì middleware `verified` [đi kèm Laravel](#protecting-routes) sẽ tự động redirect đến tên route này nếu người dùng chưa xác minh địa chỉ email.

> [!NOTE]
> Khi tự triển khai xác minh email, bạn phải tự định nghĩa nội dung của view thông báo xác minh. Nếu muốn có sẵn scaffold bao gồm tất cả các view xác thực và xác minh cần thiết, hãy tham khảo [Laravel application starter kit](/docs/{{version}}/starter-kits).

<a name="the-email-verification-handler"></a>
### Xử lý xác minh Email

Tiếp theo, chúng ta cần định nghĩa một route xử lý các request được tạo khi người dùng nhấp vào liên kết xác minh email đã được gửi cho họ. Route này nên được đặt tên `verification.verify` và được gán các middleware `auth` và `signed`:

```php
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    return redirect('/home');
})->middleware(['auth', 'signed'])->name('verification.verify');
```

Trước khi tiếp tục, hãy xem kỹ route này. Đầu tiên, bạn sẽ thấy chúng ta sử dụng request type `EmailVerificationRequest` thay cho instance `Illuminate\Http\Request` thông thường. `EmailVerificationRequest` là một [form request](/docs/{{version}}/validation#form-request-validation) đi kèm Laravel. Request này sẽ tự động đảm nhiệm việc validate các parameter `id` và `hash` của request.

Tiếp theo, chúng ta có thể gọi trực tiếp method `fulfill` trên request. Method này sẽ gọi method `markEmailAsVerified` trên người dùng đã xác thực và dispatch event `Illuminate\Auth\Events\Verified`. Method `markEmailAsVerified` có sẵn trên model `App\Models\User` mặc định thông qua base class `Illuminate\Foundation\Auth\User`. Sau khi địa chỉ email của người dùng được xác minh, bạn có thể redirect họ đến bất kỳ đâu tùy ý.

<a name="resending-the-verification-email"></a>
### Gửi lại Email xác minh

Đôi khi người dùng có thể làm thất lạc hoặc vô tình xóa email xác minh địa chỉ email. Để xử lý trường hợp này, bạn có thể định nghĩa một route cho phép người dùng yêu cầu gửi lại email xác minh. Sau đó, bạn có thể gửi request đến route này bằng cách đặt một nút submit form đơn giản trong [view thông báo xác minh](#the-email-verification-notice):

```php
use Illuminate\Http\Request;

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return back()->with('message', 'Verification link sent!');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');
```

<a name="protecting-routes"></a>
### Bảo vệ Route

[Route middleware](/docs/{{version}}/middleware) có thể được sử dụng để chỉ cho phép những người dùng đã xác minh truy cập một route nhất định. Laravel cung cấp alias middleware `verified` [middleware alias](/docs/{{version}}/middleware#middleware-aliases), đây là alias của class middleware `Illuminate\Auth\Middleware\EnsureEmailIsVerified`. Vì alias này đã được Laravel tự động đăng ký, bạn chỉ cần gắn middleware `verified` vào định nghĩa route. Thông thường, middleware này được sử dụng cùng middleware `auth`:

```php
Route::get('/profile', function () {
    // Only verified users may access this route...
})->middleware(['auth', 'verified']);
```

Nếu người dùng chưa xác minh cố truy cập một route được gán middleware này, họ sẽ tự động được redirect đến [named route](/docs/{{version}}/routing#named-routes) `verification.notice`.

<a name="customization"></a>
## Tùy biến

<a name="verification-email-customization"></a>
#### Tùy biến Email xác minh

Mặc dù notification xác minh email mặc định đáp ứng được yêu cầu của hầu hết ứng dụng, Laravel cho phép bạn tùy biến cách xây dựng mail message xác minh email.

Để bắt đầu, hãy truyền một closure vào method `toMailUsing` do notification `Illuminate\Auth\Notifications\VerifyEmail` cung cấp. Closure sẽ nhận instance model notifiable đang nhận notification cùng URL xác minh email đã ký mà người dùng phải truy cập để xác minh địa chỉ email. Closure phải trả về một instance của `Illuminate\Notifications\Messages\MailMessage`.

Thông thường, bạn nên gọi method `toMailUsing` từ method `boot` của class `AppServiceProvider` trong ứng dụng:

```php
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // ...

    VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
        return (new MailMessage)
            ->subject('Verify Email Address')
            ->line('Click the button below to verify your email address.')
            ->action('Verify Email Address', $url);
    });
}
```

> [!NOTE]
> Để tìm hiểu thêm về mail notification, hãy tham khảo [tài liệu Mail Notifications](/docs/{{version}}/notifications#mail-notifications).

<a name="events"></a>
## Events

Khi sử dụng [Laravel application starter kit](/docs/{{version}}/starter-kits), Laravel sẽ dispatch [event](/docs/{{version}}/events) `Illuminate\Auth\Events\Verified` trong quá trình xác minh email. Nếu bạn tự xử lý việc xác minh email cho ứng dụng, bạn có thể muốn tự dispatch event này sau khi quá trình xác minh hoàn tất.

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/verification). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
