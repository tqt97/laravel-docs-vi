# Bảo vệ CSRF

<a name="csrf-introduction"></a>
## Giới thiệu
Cross-site request forgery là một dạng tấn công trong đó lệnh trái phép được thực hiện thay mặt cho một người dùng đã xác thực. Laravel cung cấp sẵn cơ chế thuận tiện để bảo vệ ứng dụng khỏi các cuộc tấn công [cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery) (CSRF).
<a name="csrf-explanation"></a>
#### Giải thích lỗ hổng
Nếu bạn chưa quen với cross-site request forgery, hãy xem một ví dụ. Giả sử ứng dụng có route `/user/email` nhận request `POST` để thay đổi địa chỉ email của người dùng đã xác thực. Thông thường route này sẽ nhận field `email` chứa địa chỉ email mới mà người dùng muốn sử dụng.
Nếu không có bảo vệ CSRF, một website độc hại có thể tạo form HTML trỏ tới route `/user/email` của ứng dụng và submit địa chỉ email do kẻ tấn công kiểm soát:
```blade
<form action="https://your-application.com/user/email" method="POST">
    <input type="email" value="malicious-email@example.com">
</form>

<script>
    document.forms[0].submit();
</script>
```
Nếu website độc hại tự động submit form khi trang được load, kẻ tấn công chỉ cần dụ một người dùng đang đăng nhập ứng dụng truy cập website đó; địa chỉ email của người dùng có thể bị thay đổi mà họ không chủ động thực hiện thao tác.
Để ngăn lỗ hổng này, chúng ta cần kiểm tra mọi request `POST`, `PUT`, `PATCH` hoặc `DELETE` gửi vào ứng dụng và xác minh một giá trị bí mật trong session mà website độc hại không thể truy cập.
<a name="preventing-csrf-requests"></a>
## Ngăn chặn request CSRF
Middleware `Illuminate\Foundation\Http\Middleware\PreventRequestForgery`, mặc định nằm trong nhóm middleware `web`, bảo vệ ứng dụng khỏi cross-site request forgery bằng cơ chế hai lớp.
Đầu tiên, middleware kiểm tra header `Sec-Fetch-Site` của trình duyệt. Trình duyệt hiện đại tự động gửi header này trên mỗi request để cho biết request bắt nguồn từ cùng origin, cùng site hay từ một nguồn cross-site. Nếu header cho thấy request đến từ cùng origin, request được chấp nhận ngay mà không cần xác minh token.
Nếu bước xác minh origin không thành công — chẳng hạn request đến từ trình duyệt cũ không gửi `Sec-Fetch-Site` hoặc kết nối không bảo mật — middleware sẽ fallback sang cơ chế kiểm tra CSRF token truyền thống.
Laravel tự động tạo một CSRF "token" cho mỗi [user session](/session) đang hoạt động do ứng dụng quản lý. Token này được dùng để xác minh chính người dùng đã xác thực là người thực sự gửi request tới ứng dụng. Vì token được lưu trong session và thay đổi mỗi khi session được regenerate, ứng dụng độc hại không thể truy cập token này.
CSRF token của session hiện tại có thể được truy cập qua session của request hoặc helper `csrf_token`:
```php
use Illuminate\Http\Request;

Route::get('/token', function (Request $request) {
    $token = $request->session()->token();

    $token = csrf_token();

    // ...
});
```
Bất cứ khi nào bạn định nghĩa form HTML gửi `POST`, `PUT`, `PATCH` hoặc `DELETE`, hãy thêm field CSRF ẩn `_token` để middleware bảo vệ CSRF có thể xác minh request. Để thuận tiện, bạn có thể dùng Blade directive `@csrf` để tạo hidden input chứa token:
```blade
<form method="POST" action="/profile">
    @csrf

    <!-- Equivalent to... -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />
</form>
```

<a name="csrf-tokens-and-spas"></a>
#### CSRF Token và SPA
Nếu bạn đang xây dựng SPA sử dụng Laravel làm API backend, hãy xem [tài liệu Laravel Sanctum](/sanctum) để tìm hiểu cách xác thực với API và bảo vệ khỏi lỗ hổng CSRF.
<a name="origin-verification"></a>
### Xác minh Origin
Như đã trình bày, middleware chống giả mạo request của Laravel trước tiên kiểm tra header `Sec-Fetch-Site` để xác định request có đến từ cùng origin hay không. Mặc định, nếu bước kiểm tra này không đạt, middleware sẽ fallback sang xác minh CSRF token.
Nếu muốn chỉ dựa vào origin verification và tắt hoàn toàn cơ chế fallback sang CSRF token, bạn có thể cấu hình qua phương thức `preventRequestForgery` trong file `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(originOnly: true);
})
```
Khi dùng chế độ chỉ xác minh origin, request không vượt qua bước xác minh sẽ nhận HTTP response `403` thay vì response `419` thường liên quan đến CSRF token không khớp.
> [!WARNING]
> Header `Sec-Fetch-Site` chỉ được trình duyệt gửi qua kết nối bảo mật (HTTPS). Nếu ứng dụng không chạy qua HTTPS, origin verification sẽ không khả dụng và middleware sẽ fallback sang kiểm tra CSRF token.
Nếu ứng dụng cần nhận request từ subdomain — ví dụ `dashboard.example.com` nhận request từ `example.com` — bạn có thể cho phép request cùng site bên cạnh request cùng origin:
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(allowSameSite: true);
})
```

<a name="csrf-excluding-uris"></a>
### Loại trừ URI khỏi bảo vệ CSRF
Đôi khi bạn cần loại trừ một số URI khỏi cơ chế CSRF. Ví dụ, nếu dùng [Stripe](https://stripe.com) để xử lý thanh toán và nhận webhook từ Stripe, route xử lý webhook cần được loại khỏi CSRF protection vì Stripe không biết CSRF token nào phải gửi tới route của bạn.
Thông thường, các route kiểu này nên nằm ngoài nhóm middleware `web` mà Laravel áp dụng cho route trong `routes/web.php`. Tuy nhiên, bạn cũng có thể loại trừ từng route bằng cách truyền URI của chúng vào phương thức `preventRequestForgery` trong `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(except: [
        'stripe/*',
        'http://example.com/foo/bar',
        'http://example.com/foo/*',
    ]);
})
```
> [!NOTE]
> Để thuận tiện, middleware CSRF được tự động tắt cho mọi route khi [chạy test](/testing).
<a name="csrf-x-csrf-token"></a>
## X-CSRF-TOKEN
Bên cạnh việc kiểm tra CSRF token dưới dạng POST parameter, middleware `PreventRequestForgery` còn kiểm tra request header `X-CSRF-TOKEN`. Ví dụ, bạn có thể lưu token trong thẻ HTML `meta`:
```blade
<meta name="csrf-token" content="{{ csrf_token() }}">
```
Sau đó, bạn có thể cấu hình một thư viện như jQuery tự động thêm token vào tất cả request header. Cách này cung cấp cơ chế CSRF đơn giản, tiện lợi cho các ứng dụng AJAX sử dụng JavaScript theo kiểu truyền thống:
```js
$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
```

<a name="csrf-x-xsrf-token"></a>
## X-XSRF-TOKEN
Laravel lưu CSRF token hiện tại trong cookie được mã hóa `XSRF-TOKEN`, cookie này được gửi kèm mỗi response do framework tạo. Bạn có thể dùng value của cookie để thiết lập request header `X-XSRF-TOKEN`.
Cookie này chủ yếu được gửi để thuận tiện cho developer, vì một số JavaScript framework và library như Angular hay Axios tự động đưa value của nó vào header `X-XSRF-TOKEN` trên các request cùng origin.
