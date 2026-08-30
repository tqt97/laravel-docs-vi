# Xác thực

- [Giới thiệu](#introduction)
    - [Starter Kit](#starter-kits)
    - [Các lưu ý về cơ sở dữ liệu](#introduction-database-considerations)
    - [Tổng quan hệ sinh thái](#ecosystem-overview)
- [Bắt đầu nhanh với xác thực](#authentication-quickstart)
    - [Cài đặt Starter Kit](#install-a-starter-kit)
    - [Lấy người dùng đã xác thực](#retrieving-the-authenticated-user)
    - [Bảo vệ route](#protecting-routes)
    - [Giới hạn tần suất đăng nhập](#login-throttling)
- [Manually Authenticating Users](#authenticating-users)
    - [Remembering Users](#remembering-users)
    - [Other Authentication Methods](#other-authentication-methods)
- [HTTP Basic Authentication](#http-basic-authentication)
    - [Stateless HTTP Basic Authentication](#stateless-http-basic-authentication)
- [Logging Out](#logging-out)
    - [Invalidating Sessions on Other Devices](#invalidating-sessions-on-other-devices)
- [Password Confirmation](#password-confirmation)
    - [Configuration](#password-confirmation-configuration)
    - [Routing](#password-confirmation-routing)
    - [Protecting Routes](#password-confirmation-protecting-routes)
- [Adding Custom Guards](#adding-custom-guards)
    - [Closure Request Guards](#closure-request-guards)
- [Adding Custom User Providers](#adding-custom-user-providers)
    - [The User Provider Contract](#the-user-provider-contract)
    - [The Authenticatable Contract](#the-authenticatable-contract)
- [Automatic Password Rehashing](#automatic-password-rehashing)
- [Social Authentication](/docs/{{version}}/socialite)
- [Events](#events)

<a name="introduction"></a>
## Giới thiệu

Nhiều ứng dụng web cung cấp cách để người dùng xác thực với ứng dụng và "đăng nhập". Việc triển khai tính năng này trong ứng dụng web có thể phức tạp và tiềm ẩn rủi ro. Vì vậy, Laravel cố gắng cung cấp các công cụ cần thiết để bạn triển khai xác thực nhanh chóng, an toàn và dễ dàng.

Về cốt lõi, cơ chế xác thực của Laravel được cấu thành từ "guard" và "provider". Guard xác định cách người dùng được xác thực cho mỗi request. Ví dụ, Laravel đi kèm guard `session`, guard này duy trì trạng thái bằng session storage và cookie.

Provider xác định cách lấy người dùng từ nơi lưu trữ bền vững của ứng dụng. Laravel hỗ trợ sẵn việc lấy người dùng bằng [Eloquent](/docs/{{version}}/eloquent) và database query builder. Tuy nhiên, bạn có thể tự định nghĩa thêm provider theo nhu cầu của ứng dụng.

File cấu hình xác thực của ứng dụng nằm tại `config/auth.php`. File này chứa nhiều tùy chọn được tài liệu hóa đầy đủ để điều chỉnh hành vi của các dịch vụ xác thực Laravel.

> [!NOTE]
> Không nên nhầm guard và provider với "role" và "permission". Để tìm hiểu thêm về việc phân quyền hành động của người dùng thông qua permission, hãy tham khảo tài liệu [phân quyền](/docs/{{version}}/authorization).

<a name="starter-kits"></a>
### Starter Kit

Muốn bắt đầu nhanh? Hãy cài đặt một [Laravel application starter kit](/docs/{{version}}/starter-kits) trong ứng dụng Laravel mới. Sau khi migrate cơ sở dữ liệu, truy cập `/register` hoặc URL khác được gán cho ứng dụng. Starter kit sẽ đảm nhiệm việc scaffold toàn bộ hệ thống xác thực cho bạn!

**Ngay cả khi bạn quyết định không dùng starter kit trong ứng dụng Laravel cuối cùng, việc cài đặt một [starter kit](/docs/{{version}}/starter-kits) vẫn là cơ hội rất tốt để học cách triển khai toàn bộ chức năng xác thực của Laravel trong một dự án Laravel thực tế.** Vì các Laravel starter kit đã cung cấp controller, route và view phục vụ xác thực, bạn có thể xem mã nguồn trong các file này để tìm hiểu cách triển khai các tính năng xác thực của Laravel.

<a name="introduction-database-considerations"></a>
### Các lưu ý về cơ sở dữ liệu

Theo mặc định, Laravel cung cấp [Eloquent model](/docs/{{version}}/eloquent) `App\Models\User` trong thư mục `app/Models`. Model này có thể được sử dụng với Eloquent authentication driver mặc định.

Nếu ứng dụng không sử dụng Eloquent, bạn có thể dùng authentication provider `database`, vốn sử dụng Laravel query builder. Nếu ứng dụng sử dụng MongoDB, hãy xem [tài liệu xác thực người dùng Laravel](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/user-authentication/) chính thức của MongoDB.

Khi xây dựng schema cơ sở dữ liệu cho model `App\Models\User`, hãy đảm bảo cột password có độ dài ít nhất 60 ký tự. Migration bảng `users` đi kèm ứng dụng Laravel mới đã tạo sẵn một cột có độ dài vượt yêu cầu này.

Bạn cũng nên xác minh bảng `users` (hoặc bảng tương đương) có cột chuỗi `remember_token`, cho phép null và dài 100 ký tự. Cột này được dùng để lưu token cho người dùng chọn tùy chọn "remember me" khi đăng nhập vào ứng dụng. Migration bảng `users` mặc định đi kèm ứng dụng Laravel mới đã có sẵn cột này.

<a name="ecosystem-overview"></a>
### Tổng quan hệ sinh thái

Laravel cung cấp một số package liên quan đến xác thực. Trước khi tiếp tục, chúng ta sẽ xem tổng quan hệ sinh thái xác thực của Laravel và mục đích sử dụng của từng package.

Trước tiên, hãy xem cách xác thực hoạt động. Khi sử dụng trình duyệt web, người dùng cung cấp tên đăng nhập và mật khẩu qua form đăng nhập. Nếu thông tin xác thực chính xác, ứng dụng sẽ lưu thông tin về người dùng đã xác thực trong [session](/docs/{{version}}/session) của họ. Cookie được gửi tới trình duyệt chứa session ID để các request tiếp theo tới ứng dụng có thể được liên kết với đúng session. Khi nhận được session cookie, ứng dụng lấy dữ liệu session dựa trên session ID, nhận biết thông tin xác thực đã được lưu trong session và xem người dùng là "đã xác thực".

Khi một dịch vụ từ xa cần xác thực để truy cập API, cookie thường không được dùng vì không có trình duyệt web. Thay vào đó, dịch vụ từ xa gửi API token tới API trong mỗi request. Ứng dụng có thể đối chiếu token nhận được với bảng API token hợp lệ và "xác thực" request là do người dùng gắn với API token đó thực hiện.

<a name="laravels-built-in-browser-authentication-services"></a>
#### Các dịch vụ xác thực trình duyệt tích hợp sẵn của Laravel

Laravel cung cấp sẵn các dịch vụ xác thực và session, thường được truy cập thông qua facade `Auth` và `Session`. Các tính năng này cung cấp xác thực dựa trên cookie cho những request khởi tạo từ trình duyệt web. Chúng cung cấp các phương thức để kiểm tra thông tin đăng nhập và xác thực người dùng. Ngoài ra, các dịch vụ này tự động lưu dữ liệu xác thực thích hợp vào session của người dùng và phát hành session cookie. Cách sử dụng các dịch vụ này được trình bày trong tài liệu này.

**Application Starter Kit**

Như đã trình bày trong tài liệu này, bạn có thể tương tác thủ công với các dịch vụ xác thực để xây dựng lớp xác thực riêng cho ứng dụng. Tuy nhiên, để giúp bạn bắt đầu nhanh hơn, chúng tôi cung cấp các [starter kit miễn phí](/docs/{{version}}/starter-kits) với scaffold hiện đại và đầy đủ cho toàn bộ lớp xác thực.

<a name="laravels-api-authentication-services"></a>
#### Các dịch vụ xác thực API của Laravel

Laravel cung cấp hai package tùy chọn giúp quản lý API token và xác thực các request sử dụng API token: [Passport](/docs/{{version}}/passport) và [Sanctum](/docs/{{version}}/sanctum). Lưu ý rằng các thư viện này và cơ chế xác thực dựa trên cookie tích hợp sẵn của Laravel không loại trừ lẫn nhau. Các thư viện này chủ yếu tập trung vào xác thực bằng API token, trong khi dịch vụ xác thực tích hợp tập trung vào xác thực trình duyệt dựa trên cookie. Nhiều ứng dụng sẽ sử dụng đồng thời dịch vụ xác thực cookie tích hợp của Laravel và một package xác thực API của Laravel.

**Passport**

Passport là authentication provider OAuth2, cung cấp nhiều "grant type" OAuth2 cho phép phát hành nhiều loại token khác nhau. Nhìn chung, đây là package mạnh mẽ nhưng phức tạp cho xác thực API. Tuy nhiên, phần lớn ứng dụng không cần các tính năng phức tạp của đặc tả OAuth2, vốn có thể gây khó hiểu cho cả người dùng lẫn developer. Ngoài ra, developer trước đây thường gặp khó khăn khi xác thực ứng dụng SPA hoặc mobile bằng các OAuth2 authentication provider như Passport.

**Sanctum**

Để giải quyết sự phức tạp của OAuth2 và những nhầm lẫn mà developer thường gặp, chúng tôi xây dựng một package xác thực đơn giản và tinh gọn hơn, có thể xử lý cả request web first-party từ trình duyệt lẫn request API thông qua token. Mục tiêu này được hiện thực hóa với [Laravel Sanctum](/docs/{{version}}/sanctum), package xác thực nên được ưu tiên và khuyến nghị cho ứng dụng vừa cung cấp giao diện web first-party vừa có API, ứng dụng single-page application (SPA) tách biệt với backend Laravel, hoặc ứng dụng có mobile client.

Laravel Sanctum là package xác thực lai web / API có thể quản lý toàn bộ quy trình xác thực của ứng dụng. Khi ứng dụng dùng Sanctum nhận một request, Sanctum trước tiên xác định request có chứa session cookie tham chiếu đến một session đã xác thực hay không. Sanctum thực hiện việc này bằng cách gọi các dịch vụ xác thực tích hợp của Laravel đã đề cập ở trên. Nếu request không được xác thực qua session cookie, Sanctum sẽ kiểm tra API token. Nếu có API token, Sanctum sẽ xác thực request bằng token đó. Để tìm hiểu thêm về quy trình này, hãy tham khảo tài liệu ["cách hoạt động"](/docs/{{version}}/sanctum#how-it-works) của Sanctum.

<a name="summary-choosing-your-stack"></a>
#### Tổng kết và lựa chọn stack

Tóm lại, nếu ứng dụng được truy cập bằng trình duyệt và bạn đang xây dựng một ứng dụng Laravel monolith, ứng dụng sẽ sử dụng các dịch vụ xác thực tích hợp sẵn của Laravel.

Tiếp theo, nếu ứng dụng cung cấp API cho bên thứ ba sử dụng, bạn sẽ chọn [Passport](/docs/{{version}}/passport) hoặc [Sanctum](/docs/{{version}}/sanctum) để cung cấp xác thực API token. Nhìn chung nên ưu tiên Sanctum khi có thể vì đây là giải pháp đơn giản, đầy đủ cho xác thực API, SPA và mobile, bao gồm hỗ trợ "scope" hoặc "ability".

Nếu đang xây dựng single-page application (SPA) dùng Laravel làm backend, bạn nên sử dụng [Laravel Sanctum](/docs/{{version}}/sanctum). Khi dùng Sanctum, bạn cần [tự triển khai các route xác thực backend](#authenticating-users) hoặc sử dụng [Laravel Fortify](/docs/{{version}}/fortify) làm dịch vụ backend xác thực headless, cung cấp route và controller cho các tính năng như đăng ký, đặt lại mật khẩu, xác minh email và nhiều tính năng khác.

Có thể chọn Passport khi ứng dụng thực sự cần toàn bộ tính năng mà đặc tả OAuth2 cung cấp. Ngoài ra, nếu đang xây dựng [MCP server](/docs/{{version}}/mcp) để các AI client truy cập, bạn nên dùng Passport vì MCP client thường kỳ vọng [xác thực bằng OAuth](/docs/{{version}}/mcp#oauth).

Nếu muốn bắt đầu nhanh, chúng tôi khuyến nghị [application starter kit](/docs/{{version}}/starter-kits) như một cách nhanh chóng để tạo ứng dụng Laravel mới đã sử dụng stack xác thực được khuyến nghị dựa trên các dịch vụ xác thực tích hợp của Laravel.

<a name="authentication-quickstart"></a>
## Bắt đầu nhanh với xác thực

> [!WARNING]
> Phần tài liệu này trình bày việc xác thực người dùng thông qua [Laravel application starter kit](/docs/{{version}}/starter-kits), bao gồm UI scaffold giúp bạn bắt đầu nhanh chóng. Nếu muốn tích hợp trực tiếp với hệ thống xác thực của Laravel, hãy xem tài liệu về [xác thực người dùng thủ công](#authenticating-users).

<a name="install-a-starter-kit"></a>
### Cài đặt Starter Kit

Trước tiên, bạn nên [cài đặt Laravel application starter kit](/docs/{{version}}/starter-kits). Các starter kit cung cấp điểm khởi đầu được thiết kế hoàn chỉnh để tích hợp xác thực vào ứng dụng Laravel mới.

<a name="retrieving-the-authenticated-user"></a>
### Lấy người dùng đã xác thực

Sau khi tạo ứng dụng từ starter kit và cho phép người dùng đăng ký, xác thực với ứng dụng, bạn thường cần tương tác với người dùng hiện đang được xác thực. Khi xử lý request đến, bạn có thể truy cập người dùng đã xác thực thông qua phương thức `user` của facade `Auth`:

```php
use Illuminate\Support\Facades\Auth;

// Retrieve the currently authenticated user...
$user = Auth::user();

// Retrieve the currently authenticated user's ID...
$id = Auth::id();
```

Ngoài ra, sau khi người dùng được xác thực, bạn có thể truy cập họ thông qua instance `Illuminate\Http\Request`. Hãy nhớ rằng các class được type-hint sẽ tự động được inject vào phương thức controller. Bằng cách type-hint đối tượng `Illuminate\Http\Request`, bạn có thể thuận tiện truy cập người dùng đã xác thực từ bất kỳ phương thức controller nào thông qua phương thức `user` của request:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * Update the flight information for an existing flight.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        // ...

        return redirect('/flights');
    }
}
```

<a name="determining-if-the-current-user-is-authenticated"></a>
#### Xác định người dùng hiện tại đã được xác thực hay chưa

Để xác định người dùng thực hiện HTTP request đến đã được xác thực hay chưa, bạn có thể dùng phương thức `check` trên facade `Auth`. Phương thức này trả về `true` nếu người dùng đã được xác thực:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::check()) {
    // The user is logged in...
}
```

> [!NOTE]
> Mặc dù có thể dùng phương thức `check` để xác định người dùng đã được xác thực hay chưa, thông thường bạn sẽ dùng middleware để xác minh người dùng đã xác thực trước khi cho phép truy cập một số route / controller. Để tìm hiểu thêm, hãy xem tài liệu về [bảo vệ route](/docs/{{version}}/authentication#protecting-routes).

<a name="protecting-routes"></a>
### Bảo vệ route

Bạn có thể sử dụng [route middleware](/docs/{{version}}/middleware) để chỉ cho phép người dùng đã xác thực truy cập một route nhất định. Laravel cung cấp sẵn middleware `auth`, đây là một [middleware alias](/docs/{{version}}/middleware#middleware-aliases) cho class `Illuminate\Auth\Middleware\Authenticate`. Vì middleware này đã được Laravel đăng ký alias nội bộ, bạn chỉ cần gắn middleware vào định nghĩa route:

```php
Route::get('/flights', function () {
    // Only authenticated users may access this route...
})->middleware('auth');
```

<a name="redirecting-unauthenticated-users"></a>
#### Chuyển hướng người dùng chưa xác thực

Khi middleware `auth` phát hiện người dùng chưa xác thực, nó sẽ chuyển hướng người dùng đến [named route](/docs/{{version}}/routing#named-routes) `login`. Bạn có thể thay đổi hành vi này bằng phương thức `redirectGuestsTo` trong file `bootstrap/app.php` của ứng dụng:

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->redirectGuestsTo('/login');

    // Using a closure...
    $middleware->redirectGuestsTo(fn (Request $request) => route('login'));
})
```

<a name="redirecting-authenticated-users"></a>
#### Chuyển hướng người dùng đã xác thực

Khi middleware `guest` phát hiện người dùng đã xác thực, nó sẽ chuyển hướng người dùng đến named route `dashboard` hoặc `home`. Bạn có thể thay đổi hành vi này bằng phương thức `redirectUsersTo` trong file `bootstrap/app.php` của ứng dụng:

```php
use Illuminate\Http\Request;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->redirectUsersTo('/panel');

    // Using a closure...
    $middleware->redirectUsersTo(fn (Request $request) => route('panel'));
})
```

<a name="specifying-a-guard"></a>
#### Chỉ định guard

Khi gắn middleware `auth` vào route, bạn cũng có thể chỉ định "guard" dùng để xác thực người dùng. Guard được chỉ định phải tương ứng với một key trong mảng `guards` của file cấu hình `auth.php`:

```php
Route::get('/flights', function () {
    // Only authenticated users may access this route...
})->middleware('auth:admin');
```

<a name="login-throttling"></a>
### Giới hạn tần suất đăng nhập

Nếu đang sử dụng một trong các [application starter kit](/docs/{{version}}/starter-kits), rate limiting sẽ tự động được áp dụng cho các lần thử đăng nhập. Theo mặc định, người dùng sẽ không thể đăng nhập trong một phút nếu nhập sai thông tin xác thực sau nhiều lần thử. Cơ chế throttling được xác định riêng theo username / địa chỉ email và địa chỉ IP của người dùng.

> [!NOTE]
> Nếu muốn áp dụng rate limit cho các route khác trong ứng dụng, hãy xem [tài liệu rate limiting](/docs/{{version}}/routing#rate-limiting).

<a name="authenticating-users"></a>
## Xác thực người dùng thủ công

Bạn không bắt buộc phải sử dụng phần khung xác thực đi kèm với [application starter kit](/docs/{{version}}/starter-kits) của Laravel. Nếu không sử dụng phần khung này, bạn sẽ cần quản lý việc xác thực người dùng trực tiếp bằng các lớp xác thực của Laravel. Việc này khá đơn giản.

Chúng ta sẽ truy cập các dịch vụ xác thực của Laravel thông qua [facade](/docs/{{version}}/facades) `Auth`, vì vậy hãy đảm bảo import facade `Auth` ở đầu lớp. Tiếp theo, hãy xem phương thức `attempt`. Phương thức `attempt` thường được dùng để xử lý các lần thử xác thực từ form "đăng nhập" của ứng dụng. Nếu xác thực thành công, bạn nên tạo lại [session](/docs/{{version}}/session) của người dùng để ngăn chặn [session fixation](https://en.wikipedia.org/wiki/Session_fixation):

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Handle an authentication attempt.
     */
    public function authenticate(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            return redirect()->intended('dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }
}
```

Phương thức `attempt` nhận một mảng các cặp key / value làm đối số đầu tiên. Các giá trị trong mảng sẽ được dùng để tìm người dùng trong bảng cơ sở dữ liệu. Vì vậy, trong ví dụ trên, người dùng sẽ được truy xuất dựa trên giá trị của cột `email`. Nếu tìm thấy người dùng, mật khẩu đã băm lưu trong cơ sở dữ liệu sẽ được so sánh với giá trị `password` được truyền vào phương thức qua mảng. Bạn không nên tự băm giá trị `password` của request đầu vào, vì framework sẽ tự động xử lý việc băm trước khi so sánh với mật khẩu đã băm trong cơ sở dữ liệu. Một session đã xác thực sẽ được khởi tạo cho người dùng nếu hai mật khẩu khớp nhau.

Hãy nhớ rằng các dịch vụ xác thực của Laravel sẽ truy xuất người dùng từ cơ sở dữ liệu dựa trên cấu hình "provider" của authentication guard. Trong file cấu hình mặc định `config/auth.php`, Eloquent user provider được chỉ định sử dụng model `App\Models\User` khi truy xuất người dùng. Bạn có thể thay đổi các giá trị này trong file cấu hình tùy theo nhu cầu của ứng dụng.

Phương thức `attempt` sẽ trả về `true` nếu xác thực thành công. Nếu không, phương thức sẽ trả về `false`.

Phương thức `intended` do redirector của Laravel cung cấp sẽ chuyển hướng người dùng đến URL mà họ đã cố truy cập trước khi bị authentication middleware chặn lại. Bạn có thể truyền một URI dự phòng cho phương thức này trong trường hợp đích dự kiến không khả dụng.

<a name="specifying-additional-conditions"></a>
#### Chỉ định các điều kiện bổ sung

Nếu muốn, ngoài email và mật khẩu của người dùng, bạn cũng có thể thêm các điều kiện truy vấn bổ sung vào truy vấn xác thực. Để thực hiện, chỉ cần thêm các điều kiện truy vấn vào mảng truyền cho phương thức `attempt`. Ví dụ, chúng ta có thể xác minh người dùng được đánh dấu là "active":

```php
if (Auth::attempt(['email' => $email, 'password' => $password, 'active' => 1])) {
    // Authentication was successful...
}
```

Đối với các điều kiện truy vấn phức tạp, bạn có thể cung cấp một closure trong mảng thông tin xác thực. Closure này sẽ được gọi với query instance, cho phép bạn tùy chỉnh truy vấn theo nhu cầu của ứng dụng:

```php
use Illuminate\Database\Eloquent\Builder;

if (Auth::attempt([
    'email' => $email,
    'password' => $password,
    fn (Builder $query) => $query->has('activeSubscription'),
])) {
    // Authentication was successful...
}
```

> [!WARNING]
> Trong các ví dụ này, `email` không phải là tùy chọn bắt buộc mà chỉ được dùng làm ví dụ. Bạn nên sử dụng tên cột tương ứng với "username" trong bảng cơ sở dữ liệu của mình.

Phương thức `attemptWhen`, nhận một closure làm đối số thứ hai, có thể được dùng để kiểm tra kỹ hơn người dùng tiềm năng trước khi thực sự xác thực. Closure nhận người dùng tiềm năng và phải trả về `true` hoặc `false` để cho biết người dùng có được phép xác thực hay không:

```php
if (Auth::attemptWhen([
    'email' => $email,
    'password' => $password,
], function (User $user) {
    return $user->isNotBanned();
})) {
    // Authentication was successful...
}
```

<a name="accessing-specific-guard-instances"></a>
#### Truy cập một guard instance cụ thể

Thông qua phương thức `guard` của facade `Auth`, bạn có thể chỉ định guard instance muốn sử dụng khi xác thực người dùng. Điều này cho phép quản lý xác thực cho các phần riêng biệt của ứng dụng bằng những model có thể xác thực hoặc bảng người dùng hoàn toàn tách biệt.

Tên guard truyền vào phương thức `guard` phải tương ứng với một trong các guard được cấu hình trong file `auth.php`:

```php
if (Auth::guard('admin')->attempt($credentials)) {
    // ...
}
```

<a name="remembering-users"></a>
### Ghi nhớ người dùng

Nhiều ứng dụng web cung cấp checkbox "remember me" trên form đăng nhập. Nếu muốn cung cấp chức năng "ghi nhớ đăng nhập" trong ứng dụng, bạn có thể truyền một giá trị boolean làm đối số thứ hai cho phương thức `attempt`.

Khi giá trị này là `true`, Laravel sẽ giữ người dùng ở trạng thái đã xác thực vô thời hạn hoặc cho đến khi họ chủ động đăng xuất. Bảng `users` phải có cột chuỗi `remember_token`, dùng để lưu token "remember me". Migration của bảng `users` đi kèm các ứng dụng Laravel mới đã bao gồm cột này:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::attempt(['email' => $email, 'password' => $password], $remember)) {
    // The user is being remembered...
}
```

Nếu ứng dụng cung cấp chức năng "remember me", bạn có thể dùng phương thức `viaRemember` để xác định người dùng hiện đang được xác thực có đăng nhập thông qua cookie "remember me" hay không:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::viaRemember()) {
    // ...
}
```

<a name="other-authentication-methods"></a>
### Các phương thức xác thực khác

<a name="authenticate-a-user-instance"></a>
#### Xác thực một user instance

Nếu cần đặt một user instance hiện có làm người dùng đang được xác thực, bạn có thể truyền user instance đó vào phương thức `login` của facade `Auth`. User instance được truyền vào phải triển khai [contract](/docs/{{version}}/contracts) `Illuminate\Contracts\Auth\Authenticatable`. Model `App\Models\User` đi kèm Laravel đã triển khai interface này. Cách xác thực này hữu ích khi bạn đã có một user instance hợp lệ, chẳng hạn ngay sau khi người dùng đăng ký ứng dụng:

```php
use Illuminate\Support\Facades\Auth;

Auth::login($user);
```

Bạn có thể truyền một giá trị boolean làm đối số thứ hai cho phương thức `login`. Giá trị này cho biết có sử dụng chức năng "remember me" cho session đã xác thực hay không. Hãy nhớ rằng điều này có nghĩa session sẽ duy trì trạng thái xác thực vô thời hạn hoặc cho đến khi người dùng chủ động đăng xuất khỏi ứng dụng:

```php
Auth::login($user, $remember = true);
```

Nếu cần, bạn có thể chỉ định authentication guard trước khi gọi phương thức `login`:

```php
Auth::guard('admin')->login($user);
```

<a name="authenticate-a-user-by-id"></a>
#### Xác thực người dùng theo ID

Để xác thực người dùng bằng khóa chính của bản ghi trong cơ sở dữ liệu, bạn có thể dùng phương thức `loginUsingId`. Phương thức này nhận khóa chính của người dùng mà bạn muốn xác thực:

```php
Auth::loginUsingId(1);
```

Bạn có thể truyền một giá trị boolean cho đối số `remember` của phương thức `loginUsingId`. Giá trị này cho biết có sử dụng chức năng "remember me" cho session đã xác thực hay không. Điều này có nghĩa session sẽ duy trì trạng thái xác thực vô thời hạn hoặc cho đến khi người dùng chủ động đăng xuất khỏi ứng dụng:

```php
Auth::loginUsingId(1, remember: true);
```

<a name="authenticate-a-user-once"></a>
#### Xác thực người dùng một lần

Bạn có thể dùng phương thức `once` để xác thực người dùng với ứng dụng chỉ cho một request duy nhất. Khi gọi phương thức này, session và cookie sẽ không được sử dụng, đồng thời event `Login` cũng sẽ không được dispatch:

```php
if (Auth::once($credentials)) {
    // ...
}
```

<a name="http-basic-authentication"></a>
## Xác thực HTTP Basic

[HTTP Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) cung cấp một cách nhanh chóng để xác thực người dùng của ứng dụng mà không cần thiết lập trang "đăng nhập" riêng. Để bắt đầu, hãy gắn [middleware](/docs/{{version}}/middleware) `auth.basic` vào một route. Middleware `auth.basic` đã được tích hợp trong Laravel framework nên bạn không cần tự định nghĩa:

```php
Route::get('/profile', function () {
    // Only authenticated users may access this route...
})->middleware('auth.basic');
```

Sau khi middleware được gắn vào route, trình duyệt sẽ tự động yêu cầu bạn nhập thông tin xác thực khi truy cập route đó. Theo mặc định, middleware `auth.basic` giả định cột `email` trong bảng `users` là "username" của người dùng.

<a name="a-note-on-fastcgi"></a>
#### Lưu ý về FastCGI

Nếu đang sử dụng [PHP FastCGI](https://www.php.net/manual/en/install.fpm.php) và Apache để phục vụ ứng dụng Laravel, HTTP Basic Authentication có thể hoạt động không chính xác. Để khắc phục, bạn có thể thêm các dòng sau vào file `.htaccess` của ứng dụng:

```apache
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

<a name="stateless-http-basic-authentication"></a>
### Xác thực HTTP Basic không trạng thái

Bạn cũng có thể sử dụng HTTP Basic Authentication mà không đặt cookie định danh người dùng trong session. Cách này đặc biệt hữu ích nếu bạn chọn HTTP Authentication để xác thực các request tới API của ứng dụng. Để thực hiện, hãy [định nghĩa một middleware](/docs/{{version}}/middleware) gọi phương thức `onceBasic`. Nếu phương thức `onceBasic` không trả về response, request có thể tiếp tục được chuyển sâu hơn vào ứng dụng:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateOnceWithBasicAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return Auth::onceBasic() ?: $next($request);
    }

}
```

Tiếp theo, hãy gắn middleware vào một route:

```php
Route::get('/api/user', function () {
    // Only authenticated users may access this route...
})->middleware(AuthenticateOnceWithBasicAuth::class);
```

<a name="logging-out"></a>
## Đăng xuất

Để đăng xuất người dùng khỏi ứng dụng theo cách thủ công, bạn có thể dùng phương thức `logout` do facade `Auth` cung cấp. Thao tác này sẽ xóa thông tin xác thực khỏi session của người dùng để các request tiếp theo không còn được xác thực.

Ngoài việc gọi phương thức `logout`, bạn nên vô hiệu hóa session của người dùng và tạo lại [CSRF token](/docs/{{version}}/csrf). Sau khi đăng xuất người dùng, thông thường bạn sẽ chuyển hướng họ về trang gốc của ứng dụng:

```php
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Log the user out of the application.
 */
public function logout(Request $request): RedirectResponse
{
    Auth::logout();

    $request->session()->invalidate();

    $request->session()->regenerateToken();

    return redirect('/');
}
```

<a name="invalidating-sessions-on-other-devices"></a>
### Vô hiệu hóa session trên các thiết bị khác

Laravel cũng cung cấp cơ chế để vô hiệu hóa và "đăng xuất" các session của người dùng đang hoạt động trên những thiết bị khác mà không vô hiệu hóa session trên thiết bị hiện tại. Tính năng này thường được sử dụng khi người dùng thay đổi hoặc cập nhật mật khẩu và bạn muốn vô hiệu hóa session trên các thiết bị khác nhưng vẫn giữ thiết bị hiện tại ở trạng thái đã xác thực.

Trước khi bắt đầu, hãy đảm bảo middleware `Illuminate\Session\Middleware\AuthenticateSession` được áp dụng cho các route cần xác thực bằng session. Thông thường, bạn nên đặt middleware này trên một route group để có thể áp dụng cho phần lớn route của ứng dụng. Theo mặc định, middleware `AuthenticateSession` có thể được gắn vào route bằng [middleware alias](/docs/{{version}}/middleware#middleware-aliases) `auth.session`:

```php
Route::middleware(['auth', 'auth.session'])->group(function () {
    Route::get('/', function () {
        // ...
    });
});
```

Sau đó, bạn có thể sử dụng phương thức `logoutOtherDevices` do facade `Auth` cung cấp. Phương thức này yêu cầu người dùng xác nhận mật khẩu hiện tại, và ứng dụng nên nhận mật khẩu đó thông qua một form nhập liệu:

```php
use Illuminate\Support\Facades\Auth;

Auth::logoutOtherDevices($currentPassword);
```

Khi phương thức `logoutOtherDevices` được gọi, các session khác của người dùng sẽ bị vô hiệu hóa hoàn toàn, nghĩa là họ sẽ bị "đăng xuất" khỏi tất cả guard mà trước đó họ đã được xác thực.

<a name="password-confirmation"></a>
## Xác nhận mật khẩu

Trong quá trình xây dựng ứng dụng, đôi khi bạn sẽ có những hành động yêu cầu người dùng xác nhận mật khẩu trước khi hành động được thực hiện hoặc trước khi người dùng được chuyển hướng đến một khu vực nhạy cảm của ứng dụng. Laravel cung cấp sẵn middleware để giúp quá trình này trở nên đơn giản. Để triển khai tính năng này, bạn cần định nghĩa hai route: một route hiển thị view yêu cầu người dùng xác nhận mật khẩu và một route khác để xác nhận mật khẩu hợp lệ rồi chuyển hướng người dùng đến đích mà họ dự định truy cập.

> [!NOTE]
> Phần tài liệu sau trình bày cách tích hợp trực tiếp với các tính năng xác nhận mật khẩu của Laravel; tuy nhiên, nếu muốn bắt đầu nhanh hơn, các [starter kit ứng dụng Laravel](/docs/{{version}}/starter-kits) đã hỗ trợ sẵn tính năng này!

<a name="password-confirmation-configuration"></a>
### Cấu hình

Sau khi xác nhận mật khẩu, người dùng sẽ không bị yêu cầu xác nhận lại mật khẩu trong ba giờ. Tuy nhiên, bạn có thể cấu hình khoảng thời gian trước khi người dùng được yêu cầu nhập lại mật khẩu bằng cách thay đổi giá trị cấu hình `password_timeout` trong file cấu hình `config/auth.php` của ứng dụng.

<a name="password-confirmation-routing"></a>
### Định tuyến

<a name="the-password-confirmation-form"></a>
#### Form xác nhận mật khẩu

Đầu tiên, chúng ta sẽ định nghĩa một route để hiển thị view yêu cầu người dùng xác nhận mật khẩu:

```php
Route::get('/confirm-password', function () {
    return view('auth.confirm-password');
})->middleware('auth')->name('password.confirm');
```

Như bạn có thể dự đoán, view được route này trả về nên có một form chứa trường `password`. Ngoài ra, bạn có thể thêm nội dung trong view để giải thích rằng người dùng đang truy cập một khu vực được bảo vệ của ứng dụng và phải xác nhận mật khẩu.

<a name="confirming-the-password"></a>
#### Xác nhận mật khẩu

Tiếp theo, chúng ta sẽ định nghĩa một route xử lý request từ form của view "confirm password". Route này chịu trách nhiệm kiểm tra mật khẩu và chuyển hướng người dùng đến đích mà họ dự định truy cập:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

Route::post('/confirm-password', function (Request $request) {
    if (! Hash::check($request->password, $request->user()->password)) {
        return back()->withErrors([
            'password' => ['The provided password does not match our records.']
        ]);
    }

    $request->session()->passwordConfirmed();

    return redirect()->intended();
})->middleware(['auth', 'throttle:6,1']);
```

Trước khi tiếp tục, hãy xem xét route này chi tiết hơn. Trước tiên, trường `password` của request được kiểm tra để đảm bảo thực sự khớp với mật khẩu của người dùng đã xác thực. Nếu mật khẩu hợp lệ, chúng ta cần thông báo cho session của Laravel rằng người dùng đã xác nhận mật khẩu. Phương thức `passwordConfirmed` sẽ lưu một timestamp trong session của người dùng để Laravel có thể xác định lần gần nhất người dùng xác nhận mật khẩu. Cuối cùng, chúng ta có thể chuyển hướng người dùng đến đích mà họ dự định truy cập.

<a name="password-confirmation-protecting-routes"></a>
### Bảo vệ route

Bạn nên đảm bảo mọi route thực hiện hành động yêu cầu xác nhận mật khẩu gần đây đều được gán middleware `password.confirm`. Middleware này được bao gồm trong cài đặt mặc định của Laravel và sẽ tự động lưu đích mà người dùng dự định truy cập vào session để có thể chuyển hướng họ trở lại vị trí đó sau khi xác nhận mật khẩu. Sau khi lưu đích dự định vào session, middleware sẽ chuyển hướng người dùng đến [named route](/docs/{{version}}/routing#named-routes) `password.confirm`:

```php
Route::get('/settings', function () {
    // ...
})->middleware(['password.confirm']);

Route::post('/settings', function () {
    // ...
})->middleware(['password.confirm']);
```

<a name="adding-custom-guards"></a>
## Thêm guard tùy chỉnh

Bạn có thể định nghĩa các authentication guard của riêng mình bằng phương thức `extend` trên facade `Auth`. Bạn nên đặt lời gọi phương thức `extend` trong một [service provider](/docs/{{version}}/providers). Vì Laravel đã cung cấp sẵn `AppServiceProvider`, chúng ta có thể đặt đoạn mã trong provider này:

```php
<?php

namespace App\Providers;

use App\Services\Auth\JwtGuard;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // ...

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::extend('jwt', function (Application $app, string $name, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\Guard...

            return new JwtGuard(Auth::createUserProvider($config['provider']));
        });
    }
}
```

Như bạn có thể thấy trong ví dụ trên, callback được truyền vào phương thức `extend` phải trả về một implementation của `Illuminate\Contracts\Auth\Guard`. Interface này chứa một số phương thức bạn cần triển khai để định nghĩa guard tùy chỉnh. Sau khi guard tùy chỉnh được định nghĩa, bạn có thể tham chiếu guard đó trong cấu hình `guards` của file cấu hình `auth.php`:

```php
'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

<a name="closure-request-guards"></a>
### Closure request guard

Cách đơn giản nhất để triển khai một hệ thống xác thực tùy chỉnh dựa trên HTTP request là sử dụng phương thức `Auth::viaRequest`. Phương thức này cho phép bạn nhanh chóng định nghĩa quy trình xác thực bằng một closure duy nhất.

Để bắt đầu, hãy gọi phương thức `Auth::viaRequest` trong phương thức `boot` của `AppServiceProvider` trong ứng dụng. Phương thức `viaRequest` nhận tên authentication driver làm đối số đầu tiên. Tên này có thể là bất kỳ chuỗi nào mô tả guard tùy chỉnh của bạn. Đối số thứ hai là một closure nhận HTTP request đến và trả về một user instance hoặc `null` nếu xác thực thất bại:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Auth::viaRequest('custom-token', function (Request $request) {
        return User::where('token', (string) $request->token)->first();
    });
}
```

Sau khi authentication driver tùy chỉnh được định nghĩa, bạn có thể cấu hình nó làm driver trong cấu hình `guards` của file `auth.php`:

```php
'guards' => [
    'api' => [
        'driver' => 'custom-token',
    ],
],
```

Cuối cùng, bạn có thể tham chiếu guard khi gán authentication middleware cho một route:

```php
Route::middleware('auth:api')->group(function () {
    // ...
});
```

<a name="adding-custom-user-providers"></a>
## Thêm user provider tùy chỉnh

Nếu không sử dụng cơ sở dữ liệu quan hệ truyền thống để lưu trữ người dùng, bạn sẽ cần mở rộng Laravel bằng authentication user provider của riêng mình. Chúng ta sẽ sử dụng phương thức `provider` trên facade `Auth` để định nghĩa một user provider tùy chỉnh. User provider resolver phải trả về một implementation của `Illuminate\Contracts\Auth\UserProvider`:

```php
<?php

namespace App\Providers;

use App\Extensions\MongoUserProvider;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    // ...

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::provider('mongo', function (Application $app, array $config) {
            // Return an instance of Illuminate\Contracts\Auth\UserProvider...

            return new MongoUserProvider($app->make('mongo.connection'));
        });
    }
}
```

Sau khi đăng ký provider bằng phương thức `provider`, bạn có thể chuyển sang user provider mới trong file cấu hình `auth.php`. Trước tiên, hãy định nghĩa một `provider` sử dụng driver mới:

```php
'providers' => [
    'users' => [
        'driver' => 'mongo',
    ],
],
```

Cuối cùng, bạn có thể tham chiếu provider này trong cấu hình `guards`:

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
],
```

<a name="the-user-provider-contract"></a>
### Contract User Provider

Các implementation của `Illuminate\Contracts\Auth\UserProvider` chịu trách nhiệm lấy một implementation của `Illuminate\Contracts\Auth\Authenticatable` từ hệ thống lưu trữ bền vững, chẳng hạn như MySQL, MongoDB, v.v. Hai interface này cho phép cơ chế xác thực của Laravel tiếp tục hoạt động bất kể dữ liệu người dùng được lưu trữ theo cách nào hoặc loại class nào được dùng để biểu diễn người dùng đã xác thực.

Hãy xem contract `Illuminate\Contracts\Auth\UserProvider`:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface UserProvider
{
    public function retrieveById($identifier);
    public function retrieveByToken($identifier, $token);
    public function updateRememberToken(Authenticatable $user, $token);
    public function retrieveByCredentials(array $credentials);
    public function validateCredentials(Authenticatable $user, array $credentials);
    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false);
}
```

Hàm `retrieveById` thường nhận một khóa đại diện cho người dùng, chẳng hạn ID tự tăng từ cơ sở dữ liệu MySQL. Implementation `Authenticatable` khớp với ID phải được phương thức này truy xuất và trả về.

Hàm `retrieveByToken` truy xuất người dùng bằng `$identifier` duy nhất và `$token` "remember me", thường được lưu trong một cột cơ sở dữ liệu như `remember_token`. Tương tự phương thức trước, implementation `Authenticatable` có giá trị token khớp phải được phương thức này trả về.

Phương thức `updateRememberToken` cập nhật `remember_token` của instance `$user` bằng `$token` mới. Một token mới được gán cho người dùng khi lần xác thực "remember me" thành công hoặc khi người dùng đăng xuất.

Phương thức `retrieveByCredentials` nhận mảng thông tin xác thực được truyền vào phương thức `Auth::attempt` khi cố gắng xác thực với ứng dụng. Sau đó, phương thức phải "truy vấn" hệ thống lưu trữ bền vững bên dưới để tìm người dùng khớp với các thông tin xác thực đó. Thông thường, phương thức sẽ chạy truy vấn với điều kiện "where" để tìm bản ghi người dùng có "username" khớp với giá trị `$credentials['username']`. Phương thức phải trả về một implementation của `Authenticatable`. **Phương thức này không được thực hiện bất kỳ việc kiểm tra mật khẩu hay xác thực nào.**

Phương thức `validateCredentials` phải so sánh `$user` đã cho với `$credentials` để xác thực người dùng. Ví dụ, phương thức này thường sử dụng `Hash::check` để so sánh giá trị `$user->getAuthPassword()` với `$credentials['password']`. Phương thức phải trả về `true` hoặc `false` cho biết mật khẩu có hợp lệ hay không.

Phương thức `rehashPasswordIfRequired` phải rehash mật khẩu của `$user` đã cho nếu cần và nếu được hỗ trợ. Ví dụ, phương thức này thường sử dụng `Hash::needsRehash` để xác định giá trị `$credentials['password']` có cần được rehash hay không. Nếu cần, phương thức phải sử dụng `Hash::make` để rehash mật khẩu và cập nhật bản ghi người dùng trong hệ thống lưu trữ bền vững bên dưới.

<a name="the-authenticatable-contract"></a>
### Contract Authenticatable

Sau khi đã tìm hiểu từng phương thức của `UserProvider`, hãy xem contract `Authenticatable`. Hãy nhớ rằng user provider phải trả về các implementation của interface này từ các phương thức `retrieveById`, `retrieveByToken` và `retrieveByCredentials`:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface Authenticatable
{
    public function getAuthIdentifierName();
    public function getAuthIdentifier();
    public function getAuthPasswordName();
    public function getAuthPassword();
    public function getRememberToken();
    public function setRememberToken($value);
    public function getRememberTokenName();
}
```

Interface này khá đơn giản. Phương thức `getAuthIdentifierName` phải trả về tên cột "primary key" của người dùng và phương thức `getAuthIdentifier` phải trả về "primary key" của người dùng. Khi sử dụng backend MySQL, đây thường là khóa chính tự tăng được gán cho bản ghi người dùng. Phương thức `getAuthPasswordName` phải trả về tên cột mật khẩu của người dùng. Phương thức `getAuthPassword` phải trả về mật khẩu đã được hash của người dùng.

Interface này cho phép hệ thống xác thực hoạt động với bất kỳ class "user" nào, bất kể bạn đang sử dụng ORM hay lớp abstraction lưu trữ nào. Theo mặc định, Laravel cung cấp class `App\Models\User` trong thư mục `app/Models` và class này triển khai interface đó.

<a name="automatic-password-rehashing"></a>
## Tự động rehash mật khẩu

Thuật toán hash mật khẩu mặc định của Laravel là bcrypt. "Work factor" cho hash bcrypt có thể được điều chỉnh thông qua file cấu hình `config/hashing.php` của ứng dụng hoặc biến môi trường `BCRYPT_ROUNDS`.

Thông thường, work factor của bcrypt nên được tăng dần theo thời gian khi năng lực xử lý CPU / GPU tăng lên. Nếu bạn tăng work factor bcrypt cho ứng dụng, Laravel sẽ tự động và an toàn rehash mật khẩu người dùng khi họ xác thực với ứng dụng thông qua starter kit của Laravel hoặc khi bạn [xác thực người dùng thủ công](#authenticating-users) bằng phương thức `attempt`.

Thông thường, việc tự động rehash mật khẩu không gây gián đoạn ứng dụng; tuy nhiên, bạn có thể tắt hành vi này bằng cách publish file cấu hình `hashing`:

```shell
php artisan config:publish hashing
```

Sau khi file cấu hình được publish, bạn có thể đặt giá trị cấu hình `rehash_on_login` thành `false`:

```php
'rehash_on_login' => false,
```

<a name="events"></a>
## Events

Laravel dispatch nhiều [event](/docs/{{version}}/events) trong quá trình xác thực. Bạn có thể [định nghĩa listener](/docs/{{version}}/events) cho bất kỳ event nào sau đây:

<div class="overflow-auto">

| Event Name                                     |
| ---------------------------------------------- |
| `Illuminate\Auth\Events\Registered`            |
| `Illuminate\Auth\Events\Attempting`            |
| `Illuminate\Auth\Events\Authenticated`         |
| `Illuminate\Auth\Events\Login`                 |
| `Illuminate\Auth\Events\Failed`                |
| `Illuminate\Auth\Events\Validated`             |
| `Illuminate\Auth\Events\Verified`              |
| `Illuminate\Auth\Events\Logout`                |
| `Illuminate\Auth\Events\CurrentDeviceLogout`   |
| `Illuminate\Auth\Events\OtherDeviceLogout`     |
| `Illuminate\Auth\Events\Lockout`               |
| `Illuminate\Auth\Events\PasswordReset`         |
| `Illuminate\Auth\Events\PasswordResetLinkSent` |

</div>

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/authentication). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
