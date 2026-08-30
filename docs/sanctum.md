# Laravel Sanctum

<a name="introduction"></a>
## Giới thiệu

[Laravel Sanctum](https://github.com/laravel/sanctum) cung cấp một hệ thống xác thực gọn nhẹ cho SPA (single page application), ứng dụng di động và các API đơn giản sử dụng token. Sanctum cho phép mỗi người dùng tạo nhiều API token cho tài khoản của mình. Các token này có thể được cấp các ability / scope để xác định những hành động mà token được phép thực hiện.

<a name="how-it-works"></a>
### Cách hoạt động

Laravel Sanctum được xây dựng để giải quyết hai bài toán riêng biệt. Hãy xem từng bài toán trước khi tìm hiểu sâu hơn về thư viện.

<a name="how-it-works-api-tokens"></a>
#### API Token

Thứ nhất, Sanctum là một package đơn giản cho phép bạn cấp API token cho người dùng mà không phải xử lý sự phức tạp của OAuth. Tính năng này được lấy cảm hứng từ GitHub và các ứng dụng khác có cơ chế cấp "personal access token". Ví dụ, trang "cài đặt tài khoản" của ứng dụng có thể cung cấp màn hình để người dùng tạo API token cho tài khoản. Bạn có thể dùng Sanctum để tạo và quản lý các token đó. Những token này thường có thời hạn rất dài (nhiều năm), nhưng người dùng có thể chủ động thu hồi bất cứ lúc nào.

Laravel Sanctum cung cấp tính năng này bằng cách lưu API token của người dùng trong một bảng cơ sở dữ liệu duy nhất và xác thực HTTP request gửi đến thông qua header `Authorization`, trong đó phải chứa một API token hợp lệ.

<a name="how-it-works-spa-authentication"></a>
#### Xác thực SPA

Thứ hai, Sanctum cung cấp một cách đơn giản để xác thực các single page application (SPA) cần giao tiếp với API được xây dựng bằng Laravel. SPA có thể nằm cùng repository với ứng dụng Laravel hoặc nằm trong một repository hoàn toàn riêng biệt, chẳng hạn SPA được xây dựng bằng Next.js hoặc Nuxt.

Với tính năng này, Sanctum không sử dụng bất kỳ loại token nào. Thay vào đó, Sanctum sử dụng cơ chế xác thực session dựa trên cookie có sẵn của Laravel. Thông thường, Sanctum sử dụng guard xác thực `web` của Laravel. Cách tiếp cận này mang lại khả năng bảo vệ CSRF, xác thực bằng session, đồng thời hạn chế việc thông tin xác thực bị rò rỉ thông qua XSS.

Sanctum chỉ thử xác thực bằng cookie khi request đến bắt nguồn từ SPA frontend của chính ứng dụng. Khi kiểm tra một HTTP request gửi đến, Sanctum trước tiên tìm cookie xác thực; nếu không có, Sanctum sẽ kiểm tra header `Authorization` để tìm API token hợp lệ.

> [!NOTE]
> Bạn hoàn toàn có thể chỉ dùng Sanctum để xác thực bằng API token hoặc chỉ dùng để xác thực SPA. Việc sử dụng Sanctum không có nghĩa là bạn bắt buộc phải sử dụng cả hai tính năng này.

<a name="installation"></a>
## Cài đặt

Bạn có thể cài đặt Laravel Sanctum bằng lệnh Artisan `install:api`:

```shell
php artisan install:api
```

Tiếp theo, nếu dự định dùng Sanctum để xác thực SPA, hãy tham khảo phần [Xác thực SPA](#spa-authentication) của tài liệu này.

<a name="configuration"></a>
## Cấu hình

<a name="overriding-default-models"></a>
### Ghi đè Model mặc định

Mặc dù thông thường không cần thiết, bạn có thể mở rộng model `PersonalAccessToken` mà Sanctum sử dụng nội bộ:

```php
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // ...
}
```

Sau đó, bạn có thể yêu cầu Sanctum sử dụng model tùy chỉnh thông qua method `usePersonalAccessTokenModel`. Thông thường, bạn nên gọi method này trong method `boot` của file `AppServiceProvider` của ứng dụng:

```php
use App\Models\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
}
```

<a name="api-token-authentication"></a>
## Xác thực bằng API Token

> [!NOTE]
> Bạn không nên dùng API token để xác thực SPA first-party của chính mình. Thay vào đó, hãy sử dụng [tính năng xác thực SPA](#spa-authentication) có sẵn của Sanctum.

<a name="issuing-api-tokens"></a>
### Cấp API Token

Sanctum cho phép bạn cấp API token / personal access token để xác thực các request API gửi tới ứng dụng. Khi thực hiện request bằng API token, token phải được gửi trong header `Authorization` dưới dạng `Bearer` token.

Để bắt đầu cấp token cho người dùng, model User cần sử dụng trait `Laravel\Sanctum\HasApiTokens`:

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

Để cấp token, bạn có thể sử dụng method `createToken`. Method này trả về một instance `Laravel\Sanctum\NewAccessToken`. API token được hash bằng SHA-256 trước khi lưu vào database, nhưng bạn có thể lấy giá trị dạng văn bản thuần của token thông qua property `plainTextToken` trên instance `NewAccessToken`. Bạn nên hiển thị giá trị này cho người dùng ngay sau khi token được tạo:

```php
use Illuminate\Http\Request;

Route::post('/tokens/create', function (Request $request) {
    $token = $request->user()->createToken($request->token_name);

    return ['token' => $token->plainTextToken];
});
```

Bạn có thể truy cập toàn bộ token của người dùng thông qua relationship Eloquent `tokens` do trait `HasApiTokens` cung cấp:

```php
foreach ($user->tokens as $token) {
    // ...
}
```

<a name="token-abilities"></a>
### Khả năng của Token

Sanctum cho phép gán các "ability" cho token. Ability có vai trò tương tự "scope" trong OAuth. Bạn có thể truyền một mảng chuỗi ability làm đối số thứ hai của method `createToken`:

```php
return $user->createToken('token-name', ['server:update'])->plainTextToken;
```

Khi xử lý request đến đã được Sanctum xác thực, bạn có thể kiểm tra token có một ability cụ thể hay không bằng các method `tokenCan` hoặc `tokenCant`:

```php
if ($user->tokenCan('server:update')) {
    // ...
}

if ($user->tokenCant('server:update')) {
    // ...
}
```

<a name="token-ability-middleware"></a>
#### Middleware kiểm tra khả năng của Token

Sanctum cũng cung cấp hai middleware để xác minh request đến đã được xác thực bằng một token được cấp ability cụ thể. Để bắt đầu, hãy định nghĩa các alias middleware sau trong file `bootstrap/app.php` của ứng dụng:

```php
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'abilities' => CheckAbilities::class,
        'ability' => CheckForAnyAbility::class,
    ]);
})
```

Bạn có thể gán middleware `abilities` cho một route để xác minh token của request đến có **tất cả** các ability được liệt kê:

```php
Route::get('/orders', function () {
    // Token has both "check-status" and "place-orders" abilities...
})->middleware(['auth:sanctum', 'abilities:check-status,place-orders']);
```

Bạn có thể gán middleware `ability` cho một route để xác minh token của request đến có *ít nhất một* trong các ability được liệt kê:

```php
Route::get('/orders', function () {
    // Token has the "check-status" or "place-orders" ability...
})->middleware(['auth:sanctum', 'ability:check-status,place-orders']);
```

<a name="first-party-ui-initiated-requests"></a>
#### Request khởi tạo từ UI first-party

Để thuận tiện, method `tokenCan` sẽ luôn trả về `true` nếu request đã xác thực đến từ SPA first-party của bạn và bạn đang sử dụng cơ chế [xác thực SPA](#spa-authentication) tích hợp sẵn của Sanctum.

Tuy nhiên, điều này không có nghĩa ứng dụng bắt buộc phải cho phép người dùng thực hiện hành động đó. Thông thường, [policy phân quyền](/authorization#creating-policies) của ứng dụng sẽ xác định token có được cấp quyền thực hiện ability hay không, đồng thời kiểm tra chính instance người dùng có được phép thực hiện hành động đó hay không.

Ví dụ, với một ứng dụng quản lý server, điều này có thể đồng nghĩa với việc kiểm tra token được phép cập nhật server **và** server đó thuộc về người dùng:

```php
return $request->user()->id === $server->user_id &&
       $request->user()->tokenCan('server:update')
```

Thoạt nhìn, việc cho phép gọi `tokenCan` và luôn trả về `true` đối với request khởi tạo từ UI first-party có thể khá lạ. Tuy nhiên, cách này giúp bạn luôn có thể giả định rằng có một API token để kiểm tra thông qua `tokenCan`. Nhờ đó, bạn có thể luôn gọi `tokenCan` bên trong policy phân quyền của ứng dụng mà không cần quan tâm request được tạo từ UI của chính ứng dụng hay từ một consumer bên thứ ba của API.

<a name="protecting-routes"></a>
### Bảo vệ Route

Để bảo vệ route và yêu cầu mọi request đến đều phải được xác thực, hãy gắn guard xác thực `sanctum` vào các route cần bảo vệ trong `routes/web.php` và `routes/api.php`. Guard này bảo đảm request đến được xác thực dưới dạng request stateful sử dụng cookie, hoặc chứa API token hợp lệ trong header nếu request đến từ bên thứ ba.

Bạn có thể thắc mắc tại sao các route trong `routes/web.php` cũng được khuyến nghị xác thực bằng guard `sanctum`. Hãy nhớ rằng Sanctum trước tiên sẽ thử xác thực request đến bằng session cookie xác thực thông thường của Laravel. Nếu cookie đó không tồn tại, Sanctum sẽ thử xác thực request bằng token trong header `Authorization`. Ngoài ra, xác thực mọi request bằng Sanctum bảo đảm chúng ta luôn có thể gọi `tokenCan` trên instance người dùng hiện đang được xác thực:

```php
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="revoking-tokens"></a>
### Thu hồi Token

Bạn có thể "thu hồi" token bằng cách xóa chúng khỏi cơ sở dữ liệu thông qua relationship `tokens` do trait `Laravel\Sanctum\HasApiTokens` cung cấp:

```php
// Revoke all tokens...
$user->tokens()->delete();

// Revoke the token that was used to authenticate the current request...
$request->user()->currentAccessToken()->delete();

// Revoke a specific token...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="token-expiration"></a>
### Thời hạn Token

Mặc định, token Sanctum không bao giờ hết hạn và chỉ có thể bị vô hiệu hóa bằng cách [thu hồi token](#revoking-tokens). Tuy nhiên, nếu muốn cấu hình thời gian hết hạn cho API token của ứng dụng, bạn có thể sử dụng tùy chọn `expiration` trong file cấu hình `sanctum`. Tùy chọn này xác định số phút kể từ khi token được cấp cho đến khi token được xem là hết hạn:

```php
'expiration' => 525600,
```

Nếu muốn chỉ định thời gian hết hạn riêng cho từng token, hãy truyền thời điểm hết hạn làm argument thứ ba của method `createToken`:

```php
return $user->createToken(
    'token-name', ['*'], now()->plus(weeks: 1)
)->plainTextToken;
```

Nếu đã cấu hình thời gian hết hạn token cho ứng dụng, bạn cũng có thể [lên lịch một tác vụ](/scheduling) để dọn dẹp các token đã hết hạn. Sanctum cung cấp Artisan command `sanctum:prune-expired` cho mục đích này. Ví dụ, bạn có thể cấu hình một tác vụ được lên lịch để xóa tất cả bản ghi token đã hết hạn ít nhất 24 giờ:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily();
```

<a name="spa-authentication"></a>
## Xác thực SPA

Sanctum cũng cung cấp một phương thức đơn giản để xác thực các ứng dụng single-page (SPA) cần giao tiếp với API được xây dựng bằng Laravel. SPA có thể nằm trong cùng repository với ứng dụng Laravel hoặc trong một repository hoàn toàn riêng biệt.

Với tính năng này, Sanctum không sử dụng bất kỳ loại token nào. Thay vào đó, Sanctum sử dụng dịch vụ xác thực session dựa trên cookie được tích hợp sẵn trong Laravel. Cách xác thực này mang lại khả năng bảo vệ CSRF, xác thực session, đồng thời giúp ngăn thông tin xác thực bị rò rỉ thông qua XSS.

> [!WARNING]
> Để có thể xác thực, SPA và API phải dùng chung top-level domain. Tuy nhiên, chúng có thể nằm trên các subdomain khác nhau. Ngoài ra, hãy bảo đảm request gửi header `Accept: application/json` và một trong hai header `Referer` hoặc `Origin`.

<a name="spa-configuration"></a>
### Cấu hình

<a name="configuring-your-first-party-domains"></a>
#### Cấu hình domain first-party

Trước tiên, hãy cấu hình các domain mà SPA sẽ gửi request từ đó. Bạn có thể cấu hình chúng bằng tùy chọn `stateful` trong file cấu hình `sanctum`. Thiết lập này xác định những domain nào sẽ duy trì cơ chế xác thực "stateful" bằng session cookie của Laravel khi gửi request tới API.

Để hỗ trợ thiết lập các domain first-party có trạng thái, Sanctum cung cấp hai helper function có thể dùng trong cấu hình. `Sanctum::currentApplicationUrlWithPort()` trả về URL hiện tại của ứng dụng từ biến môi trường `APP_URL`; còn `Sanctum::currentRequestHost()` chèn một placeholder vào danh sách domain stateful. Khi runtime, placeholder này sẽ được thay bằng host của request hiện tại để mọi request có cùng domain được xem là stateful.

> [!WARNING]
> Nếu truy cập ứng dụng qua URL có kèm port (`127.0.0.1:8000`), hãy bảo đảm domain cấu hình cũng bao gồm số port.

<a name="sanctum-middleware"></a>
#### Middleware Sanctum

Tiếp theo, hãy cấu hình để Laravel cho phép request từ SPA xác thực bằng session cookie của Laravel, trong khi request từ bên thứ ba hoặc ứng dụng di động vẫn có thể xác thực bằng API token. Bạn có thể thực hiện điều này bằng cách gọi method middleware `statefulApi` trong `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->statefulApi();
})
```

<a name="cors-and-cookies"></a>
#### CORS và Cookie

Nếu gặp vấn đề xác thực từ một SPA chạy trên subdomain riêng, nhiều khả năng cấu hình CORS (Cross-Origin Resource Sharing) hoặc session cookie của ứng dụng chưa chính xác.

File cấu hình `config/cors.php` mặc định không được publish. Nếu cần tùy chỉnh các tùy chọn CORS của Laravel, hãy publish toàn bộ file cấu hình `cors` bằng Artisan command `config:publish`:

```shell
php artisan config:publish cors
```

Tiếp theo, hãy bảo đảm cấu hình CORS của ứng dụng trả về header `Access-Control-Allow-Credentials` với giá trị `True`. Bạn có thể thực hiện bằng cách đặt tùy chọn `supports_credentials` trong `config/cors.php` thành `true`.

Ngoài ra, hãy bật các tùy chọn `withCredentials` và `withXSRFToken` trên global `axios` instance của ứng dụng. Bạn có thể cấu hình trong `resources/js/app.js`. Nếu frontend không sử dụng Axios để gửi HTTP request, hãy áp dụng cấu hình tương đương cho HTTP client đang sử dụng:

```js
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

Cuối cùng, hãy bảo đảm cấu hình domain của session cookie hỗ trợ mọi subdomain thuộc root domain. Bạn có thể thực hiện bằng cách thêm dấu `.` ở đầu domain trong file `config/session.php`:

```php
'domain' => '.domain.com',
```

<a name="spa-authenticating"></a>
### Xác thực

<a name="csrf-protection"></a>
#### Bảo vệ CSRF

Để xác thực SPA, trang "đăng nhập" của SPA trước tiên nên gửi request tới endpoint `/sanctum/csrf-cookie` để khởi tạo cơ chế bảo vệ CSRF cho ứng dụng:

```js
axios.get('/sanctum/csrf-cookie').then(response => {
    // Login...
});
```

Trong request này, Laravel sẽ thiết lập cookie `XSRF-TOKEN` chứa CSRF token hiện tại. Sau đó token này cần được URL-decode và gửi trong header `X-XSRF-TOKEN` ở các request tiếp theo; một số thư viện HTTP client như Axios và Angular HttpClient sẽ tự động thực hiện việc này. Nếu thư viện HTTP JavaScript của bạn không tự thiết lập giá trị, bạn cần tự đặt header `X-XSRF-TOKEN` bằng giá trị đã URL-decode của cookie `XSRF-TOKEN` được route này thiết lập.

<a name="logging-in"></a>
#### Đăng nhập

Sau khi cơ chế bảo vệ CSRF được khởi tạo, hãy gửi request `POST` tới route `/login` của ứng dụng Laravel. Route `/login` có thể được [tự triển khai](/authentication#authenticating-users) hoặc cung cấp bởi một package xác thực headless như [Laravel Fortify](/fortify).

Nếu request đăng nhập thành công, bạn sẽ được xác thực và các request tiếp theo tới route của ứng dụng sẽ tự động được xác thực bằng session cookie mà ứng dụng Laravel đã cấp cho client. Đồng thời, vì ứng dụng đã gửi request tới `/sanctum/csrf-cookie`, các request tiếp theo sẽ tự động được bảo vệ CSRF miễn là HTTP client JavaScript gửi giá trị cookie `XSRF-TOKEN` trong header `X-XSRF-TOKEN`.

Nếu session của người dùng hết hạn do không hoạt động, các request tiếp theo tới ứng dụng Laravel có thể nhận HTTP response lỗi 401 hoặc 419. Trong trường hợp này, bạn nên chuyển hướng người dùng về trang đăng nhập của SPA.

Vì cách xác thực SPA này dựa trên session, bạn có thể sử dụng các dịch vụ xác thực tiêu chuẩn của Laravel, bao gồm chức năng ["remember me"](/authentication#remembering-users).

> [!WARNING]
> Bạn có thể tự viết endpoint `/login`; tuy nhiên, hãy bảo đảm endpoint xác thực người dùng bằng [dịch vụ xác thực dựa trên session mà Laravel cung cấp](/authentication#authenticating-users). Thông thường, điều này có nghĩa là sử dụng guard xác thực `web`.

<a name="protecting-spa-routes"></a>
### Bảo vệ Route

Để bảo vệ route và yêu cầu mọi request đến đều phải được xác thực, hãy gắn guard xác thực `sanctum` vào các API route trong `routes/api.php`. Guard này bảo đảm request đến hoặc là request stateful đã xác thực từ SPA, hoặc chứa API token hợp lệ trong header nếu request đến từ bên thứ ba:

```php
use Illuminate\Http\Request;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="authorizing-private-broadcast-channels"></a>
### Phân quyền Broadcast Channel riêng tư

Nếu SPA cần xác thực với [broadcast channel private / presence](/broadcasting#authorizing-channels), hãy xóa entry `channels` khỏi method `withRouting` trong `bootstrap/app.php`. Thay vào đó, hãy gọi `withBroadcasting` để có thể chỉ định đúng middleware cho các broadcasting route của ứng dụng:

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        // ...
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']],
    )
```

Tiếp theo, để các request phân quyền của Pusher thành công, bạn cần cung cấp một Pusher `authorizer` tùy chỉnh khi khởi tạo [Laravel Echo](/broadcasting#client-side-installation). Cách này cho phép ứng dụng cấu hình Pusher sử dụng `axios` instance đã được [cấu hình đúng cho request cross-domain](#cors-and-cookies):

```js
window.Echo = new Echo({
    broadcaster: "pusher",
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    encrypted: true,
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axios.post('/api/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
})
```

<a name="mobile-application-authentication"></a>
## Xác thực ứng dụng di động

Bạn cũng có thể sử dụng token Sanctum để xác thực các request từ ứng dụng di động tới API. Quy trình xác thực request của ứng dụng di động tương tự xác thực request API từ bên thứ ba; tuy nhiên, cách cấp API token có một vài khác biệt nhỏ.

<a name="issuing-mobile-api-tokens"></a>
### Cấp API Token

Để bắt đầu, hãy tạo một route nhận email / username, password và tên thiết bị của người dùng, sau đó đổi các thông tin xác thực này lấy một token Sanctum mới. "Tên thiết bị" truyền tới endpoint chỉ phục vụ mục đích nhận diện và có thể là bất kỳ giá trị nào bạn muốn. Thông thường, nên dùng tên mà người dùng dễ nhận ra, chẳng hạn "Nuno's iPhone 17".

Thông thường, màn hình "đăng nhập" của ứng dụng di động sẽ gửi request tới token endpoint. Endpoint trả về API token dạng dạng văn bản thuần; token này sau đó có thể được lưu trên thiết bị di động và dùng để gửi các request API tiếp theo:

```php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

Route::post('/sanctum/token', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'device_name' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    return $user->createToken($request->device_name)->plainTextToken;
});
```

Khi ứng dụng di động dùng token để gửi request API tới ứng dụng, token cần được truyền trong header `Authorization` dưới dạng `Bearer` token.

> [!NOTE]
> Khi cấp token cho ứng dụng di động, bạn cũng có thể chỉ định [ability của token](#token-abilities).

<a name="protecting-mobile-api-routes"></a>
### Bảo vệ Route

Như đã trình bày ở trên, bạn có thể bảo vệ route để mọi request đến đều phải được xác thực bằng cách gắn guard xác thực `sanctum` vào route:

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

<a name="revoking-mobile-api-tokens"></a>
### Thu hồi Token

Để cho phép người dùng thu hồi API token đã cấp cho thiết bị di động, bạn có thể hiển thị danh sách token theo tên cùng nút "Thu hồi" trong khu vực "cài đặt tài khoản" của giao diện web. Khi người dùng nhấn nút "Thu hồi", bạn có thể xóa token khỏi cơ sở dữ liệu. Hãy nhớ rằng API token của người dùng có thể được truy cập thông qua relationship `tokens` do trait `Laravel\Sanctum\HasApiTokens` cung cấp:

```php
// Revoke all tokens...
$user->tokens()->delete();

// Revoke a specific token...
$user->tokens()->where('id', $tokenId)->delete();
```

<a name="testing"></a>
## Kiểm thử

Khi kiểm thử, bạn có thể dùng method `Sanctum::actingAs` để xác thực một người dùng và chỉ định các ability được cấp cho token của họ:

```php tab=Pest
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('task list can be retrieved', function () {
    Sanctum::actingAs(
        User::factory()->create(),
        ['view-tasks']
    );

    $response = $this->get('/api/task');

    $response->assertOk();
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Sanctum\Sanctum;

public function test_task_list_can_be_retrieved(): void
{
    Sanctum::actingAs(
        User::factory()->create(),
        ['view-tasks']
    );

    $response = $this->get('/api/task');

    $response->assertOk();
}
```

Nếu muốn cấp tất cả ability cho token, hãy thêm `*` vào danh sách ability truyền cho method `actingAs`:

```php
Sanctum::actingAs(
    User::factory()->create(),
    ['*']
);
```
