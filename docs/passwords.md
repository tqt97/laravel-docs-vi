# Đặt lại mật khẩu

<a name="introduction"></a>
## Giới thiệu
Hầu hết ứng dụng web đều cho phép người dùng đặt lại mật khẩu đã quên. Thay vì phải tự xây lại chức năng này cho từng ứng dụng, Laravel cung cấp các service thuận tiện để gửi link đặt lại mật khẩu và thực hiện quá trình đổi mật khẩu một cách an toàn.
> [!NOTE]
> Muốn bắt đầu nhanh? Hãy cài một [application starter kit](/docs/{{version}}/starter-kits) cho ứng dụng Laravel mới. Starter kit sẽ scaffold toàn bộ hệ thống authentication, bao gồm cả chức năng đặt lại mật khẩu đã quên.
<a name="configuration"></a>
### Cấu hình
Cấu hình đặt lại mật khẩu của ứng dụng nằm trong file `config/auth.php`. Bạn nên xem qua các tùy chọn trong file này. Mặc định, Laravel dùng password reset driver `database`.
Tùy chọn cấu hình `driver` xác định nơi lưu dữ liệu đặt lại mật khẩu. Laravel cung cấp hai driver:
<div class="content-list" markdown="1">

- `database` - dữ liệu đặt lại mật khẩu được lưu trong relational database.
- `cache` - dữ liệu đặt lại mật khẩu được lưu trong một cache store.
</div>

<a name="driver-prerequisites"></a>
### Điều kiện của driver
<a name="database"></a>
#### Database
Khi dùng driver `database` mặc định, ứng dụng cần một table để lưu password reset token. Thông thường table này đã được tạo trong migration mặc định `0001_01_01_000000_create_users_table.php` của Laravel.
<a name="cache"></a>
#### Cache
Laravel còn có cache driver cho password reset, không cần table database riêng. Mỗi entry được key theo email người dùng, vì vậy hãy đảm bảo ứng dụng không dùng email làm cache key cho mục đích khác trong cùng store:
```php
'passwords' => [
    'users' => [
        'driver' => 'cache',
        'provider' => 'users',
        'store' => 'passwords', // Optional...
        'expire' => 60,
        'throttle' => 60,
    ],
],
```
Để tránh việc chạy `artisan cache:clear` xóa dữ liệu password reset, bạn có thể chỉ định một cache store riêng bằng key cấu hình `store`. Giá trị này phải tương ứng với một store được khai báo trong `config/cache.php`.
<a name="model-preparation"></a>
### Chuẩn bị model
Trước khi dùng chức năng password reset của Laravel, model `App\Models\User` phải sử dụng trait `Illuminate\Notifications\Notifiable`. Trait này thường đã có sẵn trong model `User` mặc định của ứng dụng Laravel mới.
Tiếp theo, hãy xác nhận model `App\Models\User` implement contract `Illuminate\Contracts\Auth\CanResetPassword`. Model `User` mặc định của framework đã implement interface này và dùng trait `Illuminate\Auth\Passwords\CanResetPassword` để cung cấp các method cần thiết.
<a name="configuring-trusted-hosts"></a>
### Cấu hình trusted hosts
Mặc định, Laravel phản hồi mọi request nhận được bất kể nội dung header HTTP `Host`. Giá trị của header `Host` cũng được dùng khi tạo absolute URL tới ứng dụng trong quá trình xử lý web request.
Thông thường, bạn nên cấu hình web server như Nginx hoặc Apache để chỉ chuyển request tới ứng dụng khi hostname khớp với domain mong muốn. Nếu không thể cấu hình trực tiếp web server và cần Laravel chỉ phản hồi một số hostname nhất định, hãy dùng method middleware `trustHosts` trong `bootstrap/app.php`. Điều này đặc biệt quan trọng với ứng dụng có chức năng password reset.
Để tìm hiểu thêm, xem [tài liệu middleware TrustHosts](/docs/{{version}}/requests#configuring-trusted-hosts).
<a name="routing"></a>
## Routing
Để triển khai đầy đủ chức năng đặt lại mật khẩu, ta cần định nghĩa một số route. Trước hết là một cặp route cho phép người dùng yêu cầu link reset thông qua email. Sau đó là một cặp route xử lý quá trình đặt mật khẩu mới khi người dùng mở link được gửi qua email và submit form reset.
<a name="requesting-the-password-reset-link"></a>
### Yêu cầu link đặt lại mật khẩu
<a name="the-password-reset-link-request-form"></a>
#### Form yêu cầu link đặt lại mật khẩu
Trước tiên, định nghĩa route hiển thị view chứa form yêu cầu link reset mật khẩu:
```php
Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
})->middleware('guest')->name('password.request');
```
View được route này trả về nên có form chứa field `email`, cho phép người dùng yêu cầu link reset cho địa chỉ email cụ thể.
<a name="password-reset-link-handling-the-form-submission"></a>
#### Xử lý form submission
Tiếp theo, định nghĩa route xử lý form gửi từ màn hình "forgot password". Route này chịu trách nhiệm validate email và gửi yêu cầu đặt lại mật khẩu tới người dùng tương ứng:
```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);

    $status = Password::sendResetLink(
        $request->only('email')
    );

    return $status === Password::ResetLinkSent
        ? back()->with(['status' => __($status)])
        : back()->withErrors(['email' => __($status)]);
})->middleware('guest')->name('password.email');
```
Hãy xem kỹ route này. Trước tiên, attribute `email` của request được validate. Sau đó, ta dùng "password broker" tích hợp của Laravel thông qua facade `Password` để gửi link reset. Password broker chịu trách nhiệm tìm user theo field được cung cấp — trong trường hợp này là email — và gửi link đặt lại mật khẩu thông qua [notification system](/docs/{{version}}/notifications) của Laravel.
Method `sendResetLink` trả về một "status" slug. Bạn có thể dịch status này bằng các helper [localization](/docs/{{version}}/localization) của Laravel để hiển thị thông báo thân thiện cho người dùng. Bản dịch của password reset status được xác định trong file `lang/{lang}/passwords.php`; file này có entry cho từng giá trị status slug có thể xảy ra.
> [!NOTE]
> Mặc định, skeleton ứng dụng Laravel không có thư mục `lang`. Nếu muốn tùy biến các file ngôn ngữ, bạn có thể publish chúng bằng lệnh Artisan `lang:publish`.
Có thể bạn đang thắc mắc Laravel biết cách lấy user record từ database khi gọi `Password::sendResetLink` như thế nào. Password broker sử dụng "user provider" của authentication system để truy xuất record. User provider mà password broker sử dụng được cấu hình trong mảng `passwords` của file `config/auth.php`. Xem [tài liệu authentication](/docs/{{version}}/authentication#adding-custom-user-providers) để tìm hiểu cách viết custom user provider.
> [!NOTE]
> Khi tự triển khai password reset, bạn phải tự định nghĩa nội dung view và route. Nếu muốn scaffold sẵn toàn bộ authentication và verification logic cần thiết, hãy xem [Laravel application starter kits](/docs/{{version}}/starter-kits).
<a name="resetting-the-password"></a>
### Đặt lại mật khẩu
<a name="the-password-reset-form"></a>
#### Form đặt lại mật khẩu
Tiếp theo, định nghĩa các route thực sự đặt lại mật khẩu sau khi người dùng bấm link được gửi qua email và nhập mật khẩu mới. Trước hết là route hiển thị form reset. Route này nhận parameter `token`, sau đó sẽ được dùng để xác minh yêu cầu đặt lại mật khẩu:
```php
Route::get('/reset-password/{token}', function (string $token) {
    return view('auth.reset-password', ['token' => $token]);
})->middleware('guest')->name('password.reset');
```
View được route này trả về nên hiển thị form có các field `email`, `password`, `password_confirmation` và một field ẩn `token` chứa giá trị `$token` bí mật mà route nhận được.
<a name="password-reset-handling-the-form-submission"></a>
#### Xử lý form submission
Ta cũng cần route thực sự xử lý form reset mật khẩu. Route này chịu trách nhiệm validate request và cập nhật mật khẩu của user trong database:
```php
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->setRememberToken(Str::random(60));

            $user->save();

            event(new PasswordReset($user));
        }
    );

    return $status === Password::PasswordReset
        ? redirect()->route('login')->with('status', __($status))
        : back()->withErrors(['email' => [__($status)]]);
})->middleware('guest')->name('password.update');
```
Hãy xem route này kỹ hơn. Trước tiên, các attribute `token`, `email` và `password` được validate. Tiếp theo, ta dùng password broker tích hợp thông qua facade `Password` để xác minh thông tin của yêu cầu reset.
Nếu token, email và password truyền cho password broker hợp lệ, closure truyền vào method `reset` sẽ được gọi. Closure nhận user instance và plain-text password từ form; bên trong closure, ta có thể cập nhật mật khẩu của user trong database.
Method `reset` trả về một "status" slug. Status có thể được dịch bằng helper [localization](/docs/{{version}}/localization) để hiển thị thông báo thân thiện. Bản dịch nằm trong `lang/{lang}/passwords.php`, với entry cho từng status slug có thể xảy ra. Nếu ứng dụng chưa có thư mục `lang`, bạn có thể tạo bằng lệnh Artisan `lang:publish`.
Tương tự `sendResetLink`, khi gọi `Password::reset`, Laravel tìm user record thông qua "user provider" của hệ thống authentication. User provider của password broker được cấu hình trong mảng `passwords` của `config/auth.php`. Xem [tài liệu authentication](/docs/{{version}}/authentication#adding-custom-user-providers) để tìm hiểu custom user provider.
<a name="deleting-expired-tokens"></a>
## Xóa token hết hạn
Nếu dùng driver `database`, các password reset token đã hết hạn vẫn tồn tại trong database. Bạn có thể xóa chúng bằng lệnh Artisan `auth:clear-resets`:
```shell
php artisan auth:clear-resets
```
Nếu muốn tự động hóa việc này, hãy cân nhắc thêm command vào [scheduler](/docs/{{version}}/scheduling) của ứng dụng:
```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('auth:clear-resets')->everyFifteenMinutes();
```

<a name="password-customization"></a>
## Tùy biến
<a name="reset-link-customization"></a>
#### Tùy biến reset link
Bạn có thể tùy biến URL của password reset link bằng method `createUrlUsing` trên notification class `ResetPassword`. Method nhận một closure với user instance đang nhận notification và password reset token. Thông thường, hãy gọi method này trong `boot` của `AppServiceProvider`:
```php
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    ResetPassword::createUrlUsing(function (User $user, string $token) {
        return 'https://example.com/reset-password?token='.$token;
    });
}
```

<a name="reset-email-customization"></a>
#### Tùy biến email reset mật khẩu
Bạn có thể dễ dàng thay notification class dùng để gửi password reset link. Hãy override method `sendPasswordResetNotification` trên model `App\Models\User`. Trong method này, bạn có thể gửi bất kỳ [notification class](/docs/{{version}}/notifications) tùy chỉnh nào. Password reset `$token` là đối số đầu tiên được truyền vào method; bạn có thể dùng token này để tạo URL reset theo ý muốn và gửi notification tới user:
```php
use App\Notifications\ResetPasswordNotification;

/**
 * Send a password reset notification to the user.
 *
 * @param  string  $token
 */
public function sendPasswordResetNotification($token): void
{
    $url = 'https://example.com/reset-password?token='.$token;

    $this->notify(new ResetPasswordNotification($url));
}
```
