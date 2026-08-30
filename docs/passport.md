# Laravel Passport

- [Giới thiệu](#introduction)
    - [Passport hay Sanctum?](#passport-or-sanctum)
- [Cài đặt](#installation)
    - [Triển khai Passport](#deploying-passport)
    - [Nâng cấp Passport](#upgrading-passport)
- [Cấu hình](#configuration)
    - [Thời hạn token](#token-lifetimes)
    - [Ghi đè model mặc định](#overriding-default-models)
    - [Ghi đè route](#overriding-routes)
- [Authorization Code Grant](#authorization-code-grant)
    - [Quản lý client](#managing-clients)
    - [Yêu cầu token](#requesting-tokens)
    - [Quản lý token](#managing-tokens)
    - [Làm mới token](#refreshing-tokens)
    - [Thu hồi token](#revoking-tokens)
    - [Dọn dẹp token](#purging-tokens)
- [Authorization Code Grant với PKCE](#code-grant-pkce)
    - [Tạo client](#creating-a-auth-pkce-grant-client)
    - [Yêu cầu token](#requesting-auth-pkce-grant-tokens)
- [Device Authorization Grant](#device-authorization-grant)
    - [Tạo Device Code Grant Client](#creating-a-device-authorization-grant-client)
    - [Yêu cầu token](#requesting-device-authorization-grant-tokens)
- [Password Grant](#password-grant)
    - [Tạo Password Grant Client](#creating-a-password-grant-client)
    - [Yêu cầu token](#requesting-password-grant-tokens)
    - [Yêu cầu tất cả scope](#requesting-all-scopes)
    - [Tùy chỉnh User Provider](#customizing-the-user-provider)
    - [Tùy chỉnh trường Username](#customizing-the-username-field)
    - [Tùy chỉnh xác thực Password](#customizing-the-password-validation)
- [Implicit Grant](#implicit-grant)
- [Client Credentials Grant](#client-credentials-grant)
    - [Lấy token](#retrieving-tokens)
- [Personal Access Token](#personal-access-tokens)
    - [Tạo Personal Access Client](#creating-a-personal-access-client)
    - [Tùy chỉnh User Provider](#customizing-the-user-provider-for-pat)
    - [Quản lý Personal Access Token](#managing-personal-access-tokens)
- [Bảo vệ route](#protecting-routes)
    - [Qua middleware](#via-middleware)
    - [Truyền Access Token](#passing-the-access-token)
- [Token Scope](#token-scopes)
    - [Định nghĩa scope](#defining-scopes)
    - [Scope mặc định](#default-scope)
    - [Gán scope cho token](#assigning-scopes-to-tokens)
    - [Kiểm tra scope](#checking-scopes)
- [Xác thực SPA](#spa-authentication)
- [Sự kiện](#events)
- [Kiểm thử](#testing)

<a name="introduction"></a>
## Giới thiệu

[Laravel Passport](https://github.com/laravel/passport) cung cấp một triển khai máy chủ OAuth2 đầy đủ cho ứng dụng Laravel của bạn chỉ trong vài phút. Passport được xây dựng dựa trên [League OAuth2 server](https://github.com/thephpleague/oauth2-server), được duy trì bởi Andy Millington và Simon Hamp.

> [!NOTE]
> Tài liệu này giả định rằng bạn đã quen thuộc với OAuth2. Nếu chưa biết về OAuth2, hãy cân nhắc làm quen với [thuật ngữ](https://oauth2.thephpleague.com/terminology/) chung và các tính năng của OAuth2 trước khi tiếp tục.

<a name="passport-or-sanctum"></a>
### Passport hay Sanctum?

Trước khi bắt đầu, bạn nên xác định ứng dụng của mình phù hợp hơn với Laravel Passport hay [Laravel Sanctum](/docs/{{version}}/sanctum). Nếu ứng dụng bắt buộc phải hỗ trợ OAuth2, bạn nên sử dụng Laravel Passport.

Tuy nhiên, nếu bạn cần xác thực ứng dụng single-page, ứng dụng di động hoặc phát hành API token, bạn nên sử dụng [Laravel Sanctum](/docs/{{version}}/sanctum). Laravel Sanctum không hỗ trợ OAuth2, nhưng cung cấp trải nghiệm phát triển xác thực API đơn giản hơn đáng kể.

<a name="installation"></a>
## Cài đặt

Bạn có thể cài đặt Laravel Passport thông qua lệnh Artisan `install:api`:

```shell
php artisan install:api --passport
```

Lệnh này sẽ publish và chạy các database migration cần thiết để tạo những bảng mà ứng dụng dùng để lưu OAuth2 client và access token. Lệnh cũng sẽ tạo các khóa mã hóa cần thiết để sinh access token an toàn.

Sau khi chạy lệnh `install:api`, hãy thêm trait `Laravel\Passport\HasApiTokens` và interface `Laravel\Passport\Contracts\OAuthenticatable` vào model `App\Models\User`. Trait này cung cấp một số phương thức hỗ trợ cho model, cho phép bạn kiểm tra token và scope của người dùng đã xác thực:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

Cuối cùng, trong file cấu hình `config/auth.php` của ứng dụng, bạn nên định nghĩa authentication guard `api` và đặt tùy chọn `driver` thành `passport`. Điều này chỉ thị ứng dụng sử dụng `TokenGuard` của Passport khi xác thực các API request gửi đến:

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
],
```

<a name="deploying-passport"></a>
### Triển khai Passport

Khi triển khai Passport lên máy chủ của ứng dụng lần đầu, bạn thường cần chạy lệnh `passport:keys`. Lệnh này tạo các khóa mã hóa mà Passport cần để sinh access token. Các khóa được tạo thường không được lưu trong source control:

```shell
php artisan passport:keys
```

Nếu cần, bạn có thể chỉ định đường dẫn mà Passport sẽ nạp khóa từ đó. Bạn có thể sử dụng phương thức `Passport::loadKeysFrom` cho mục đích này. Thông thường, phương thức này nên được gọi từ phương thức `boot` của class `App\Providers\AppServiceProvider` trong ứng dụng:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
}
```

<a name="loading-keys-from-the-environment"></a>
#### Nạp khóa từ biến môi trường

Ngoài ra, bạn có thể publish file cấu hình của Passport bằng lệnh Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag=passport-config
```

Sau khi file cấu hình được publish, bạn có thể nạp các khóa mã hóa của ứng dụng bằng cách định nghĩa chúng dưới dạng biến môi trường:

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<private key here>
-----END RSA PRIVATE KEY-----"

PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<public key here>
-----END PUBLIC KEY-----"
```

<a name="upgrading-passport"></a>
### Nâng cấp Passport

Khi nâng cấp lên một major version mới của Passport, điều quan trọng là bạn phải xem xét kỹ [hướng dẫn nâng cấp](https://github.com/laravel/passport/blob/master/UPGRADE.md).

<a name="configuration"></a>
## Cấu hình

<a name="token-lifetimes"></a>
### Thời hạn token

Theo mặc định, Passport phát hành access token có thời hạn dài và hết hạn sau một năm. Nếu muốn cấu hình thời hạn token dài hơn hoặc ngắn hơn, bạn có thể sử dụng các phương thức `tokensExpireIn`, `refreshTokensExpireIn` và `personalAccessTokensExpireIn`. Các phương thức này nên được gọi từ phương thức `boot` của class `App\Providers\AppServiceProvider` trong ứng dụng:

```php
use Carbon\CarbonInterval;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::tokensExpireIn(CarbonInterval::days(15));
    Passport::refreshTokensExpireIn(CarbonInterval::days(30));
    Passport::personalAccessTokensExpireIn(CarbonInterval::months(6));
}
```

> [!WARNING]
> Các cột `expires_at` trong bảng cơ sở dữ liệu của Passport là chỉ đọc và chỉ dùng cho mục đích hiển thị. Khi phát hành token, Passport lưu thông tin hết hạn bên trong token đã được ký và mã hóa. Nếu cần vô hiệu hóa một token, bạn nên [thu hồi token đó](#revoking-tokens).

<a name="overriding-default-models"></a>
### Ghi đè model mặc định

Bạn có thể tự do mở rộng các model được Passport sử dụng nội bộ bằng cách định nghĩa model riêng và kế thừa model Passport tương ứng:

```php
use Laravel\Passport\Client as PassportClient;

class Client extends PassportClient
{
    // ...
}
```

Sau khi định nghĩa model, bạn có thể chỉ thị Passport sử dụng model tùy chỉnh thông qua class `Laravel\Passport\Passport`. Thông thường, bạn nên khai báo các model tùy chỉnh với Passport trong phương thức `boot` của class `App\Providers\AppServiceProvider`:

```php
use App\Models\Passport\AuthCode;
use App\Models\Passport\Client;
use App\Models\Passport\DeviceCode;
use App\Models\Passport\RefreshToken;
use App\Models\Passport\Token;
use Laravel\Passport\Passport;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::useTokenModel(Token::class);
    Passport::useRefreshTokenModel(RefreshToken::class);
    Passport::useAuthCodeModel(AuthCode::class);
    Passport::useClientModel(Client::class);
    Passport::useDeviceCodeModel(DeviceCode::class);
}
```

<a name="overriding-routes"></a>
### Ghi đè route

Đôi khi bạn có thể muốn tùy chỉnh các route do Passport định nghĩa. Để thực hiện việc này, trước tiên bạn cần bỏ qua các route mà Passport đăng ký bằng cách thêm `Passport::ignoreRoutes` vào phương thức `register` của `AppServiceProvider`:

```php
use Laravel\Passport\Passport;

/**
 * Register any application services.
 */
public function register(): void
{
    Passport::ignoreRoutes();
}
```

Sau đó, bạn có thể sao chép các route do Passport định nghĩa trong [file route của Passport](https://github.com/laravel/passport/blob/master/routes/web.php) vào file `routes/web.php` của ứng dụng và chỉnh sửa theo nhu cầu:

```php
Route::group([
    'as' => 'passport.',
    'prefix' => config('passport.path', 'oauth'),
    'namespace' => '\Laravel\Passport\Http\Controllers',
], function () {
    // Passport routes...
});
```

<a name="authorization-code-grant"></a>
## Authorization Code Grant

Sử dụng OAuth2 thông qua authorization code là cách mà phần lớn lập trình viên quen thuộc khi làm việc với OAuth2. Khi sử dụng authorization code, ứng dụng client sẽ chuyển hướng người dùng đến máy chủ của bạn, nơi họ có thể chấp thuận hoặc từ chối yêu cầu phát hành access token cho client.

Để bắt đầu, chúng ta cần chỉ cho Passport cách trả về view "authorization".

Toàn bộ logic render của authorization view có thể được tùy chỉnh bằng các phương thức thích hợp có sẵn trên class `Laravel\Passport\Passport`. Thông thường, bạn nên gọi phương thức này từ phương thức `boot` của class `App\Providers\AppServiceProvider`:

```php
use Inertia\Inertia;
use Laravel\Passport\Passport;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // By providing a view name...
    Passport::authorizationView('auth.oauth.authorize');

    // By providing a closure...
    Passport::authorizationView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Authorize', [
            'request' => $parameters['request'],
            'authToken' => $parameters['authToken'],
            'client' => $parameters['client'],
            'user' => $parameters['user'],
            'scopes' => $parameters['scopes'],
        ])
    );
}
```

Passport sẽ tự động định nghĩa route `/oauth/authorize` để trả về view này. Template `auth.oauth.authorize` nên chứa một form gửi POST request đến route `passport.authorizations.approve` để chấp thuận việc cấp quyền và một form gửi DELETE request đến route `passport.authorizations.deny` để từ chối. Các route `passport.authorizations.approve` và `passport.authorizations.deny` yêu cầu các trường `state`, `client_id` và `auth_token`.

<a name="managing-clients"></a>
### Quản lý client

Các lập trình viên xây dựng ứng dụng cần tương tác với API của bạn phải đăng ký ứng dụng của họ với ứng dụng của bạn bằng cách tạo một "client". Thông thường, việc này bao gồm cung cấp tên ứng dụng và một URI mà ứng dụng của bạn có thể chuyển hướng đến sau khi người dùng chấp thuận yêu cầu cấp quyền.

<a name="managing-first-party-clients"></a>
#### Client first-party

Cách đơn giản nhất để tạo client là sử dụng lệnh Artisan `passport:client`. Lệnh này có thể được dùng để tạo first-party client hoặc kiểm thử chức năng OAuth2. Khi chạy `passport:client`, Passport sẽ yêu cầu thêm thông tin về client và cung cấp cho bạn client ID cùng secret:

```shell
php artisan passport:client
```

Nếu muốn cho phép nhiều redirect URI cho client, bạn có thể chỉ định chúng dưới dạng danh sách phân tách bằng dấu phẩy khi lệnh `passport:client` yêu cầu URI. Bất kỳ URI nào có chứa dấu phẩy đều phải được URI encode:

```shell
https://third-party-app.com/callback,https://example.com/oauth/redirect
```

<a name="managing-third-party-clients"></a>
#### Client third-party

Vì người dùng của ứng dụng không thể sử dụng lệnh `passport:client`, bạn có thể dùng phương thức `createAuthorizationCodeGrantClient` của class `Laravel\Passport\ClientRepository` để đăng ký client cho một người dùng cụ thể:

```php
use App\Models\User;
use Laravel\Passport\ClientRepository;

$user = User::find($userId);

// Creating an OAuth app client that belongs to the given user...
$client = app(ClientRepository::class)->createAuthorizationCodeGrantClient(
    user: $user,
    name: 'Example App',
    redirectUris: ['https://third-party-app.com/callback'],
    confidential: false,
    enableDeviceFlow: true
);

// Retrieving all the OAuth app clients that belong to the user...
$clients = $user->oauthApps()->get();
```

Phương thức `createAuthorizationCodeGrantClient` trả về một instance của `Laravel\Passport\Client`. Bạn có thể hiển thị `$client->id` làm client ID và `$client->plainSecret` làm client secret cho người dùng.

<a name="requesting-tokens"></a>
### Yêu cầu token

<a name="requesting-tokens-redirecting-for-authorization"></a>
#### Chuyển hướng để cấp quyền

Sau khi client được tạo, lập trình viên có thể sử dụng client ID và secret để yêu cầu authorization code và access token từ ứng dụng của bạn. Trước tiên, ứng dụng sử dụng API nên thực hiện một yêu cầu chuyển hướng đến route `/oauth/authorize` của ứng dụng như sau:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
        'state' => $state,
        // 'prompt' => '', // "none", "consent", or "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

Tham số `prompt` có thể được sử dụng để chỉ định hành vi xác thực của ứng dụng Passport.

Nếu giá trị `prompt` là `none`, Passport luôn phát sinh lỗi xác thực nếu người dùng chưa được xác thực với ứng dụng Passport. Nếu giá trị là `consent`, Passport luôn hiển thị màn hình phê duyệt cấp quyền, ngay cả khi tất cả scope đã được cấp trước đó cho ứng dụng sử dụng API. Khi giá trị là `login`, ứng dụng Passport luôn yêu cầu người dùng đăng nhập lại, ngay cả khi họ đã có session hiện hữu.

Nếu không cung cấp giá trị `prompt`, người dùng chỉ được yêu cầu cấp quyền khi trước đó họ chưa cấp quyền truy cập cho ứng dụng sử dụng API đối với các scope được yêu cầu.

> [!NOTE]
> Hãy nhớ rằng route `/oauth/authorize` đã được Passport định nghĩa sẵn. Bạn không cần tự định nghĩa route này.

<a name="approving-the-request"></a>
#### Phê duyệt yêu cầu

Khi nhận yêu cầu cấp quyền, Passport sẽ tự động phản hồi dựa trên giá trị của tham số `prompt` (nếu có) và có thể hiển thị template để người dùng chấp thuận hoặc từ chối yêu cầu. Nếu chấp thuận, họ sẽ được chuyển hướng trở lại `redirect_uri` do ứng dụng sử dụng API chỉ định. `redirect_uri` phải khớp với URL `redirect` đã được chỉ định khi tạo client.

Đôi khi bạn có thể muốn bỏ qua bước hỏi cấp quyền, chẳng hạn khi cấp quyền cho first-party client. Bạn có thể thực hiện bằng cách [mở rộng model `Client`](#overriding-default-models) và định nghĩa phương thức `skipsAuthorization`. Nếu `skipsAuthorization` trả về `true`, client sẽ được chấp thuận và người dùng được chuyển hướng ngay về `redirect_uri`, trừ khi ứng dụng sử dụng API đã đặt rõ tham số `prompt` khi chuyển hướng để cấp quyền:

```php
<?php

namespace App\Models\Passport;

use Illuminate\Contracts\Auth\Authenticatable;
use Laravel\Passport\Client as BaseClient;

class Client extends BaseClient
{
    /**
     * Determine if the client should skip the authorization prompt.
     *
     * @param  \Laravel\Passport\Scope[]  $scopes
     */
    public function skipsAuthorization(Authenticatable $user, array $scopes): bool
    {
        return $this->firstParty();
    }
}
```

<a name="requesting-tokens-converting-authorization-codes-to-access-tokens"></a>
#### Chuyển authorization code thành access token

Nếu người dùng chấp thuận yêu cầu cấp quyền, họ sẽ được chuyển hướng trở lại ứng dụng sử dụng API. Ứng dụng đó trước tiên nên xác minh tham số `state` với giá trị đã lưu trước khi chuyển hướng. Nếu `state` khớp, ứng dụng sử dụng API nên gửi `POST` request đến ứng dụng của bạn để yêu cầu access token. Request phải bao gồm authorization code mà ứng dụng của bạn đã phát hành khi người dùng chấp thuận yêu cầu cấp quyền:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class,
        'Invalid state value.'
    );

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'code' => $request->code,
    ]);

    return $response->json();
});
```

Route `/oauth/token` này sẽ trả về JSON response chứa các thuộc tính `access_token`, `refresh_token` và `expires_in`. Thuộc tính `expires_in` chứa số giây còn lại trước khi access token hết hạn.

> [!NOTE]
> Tương tự route `/oauth/authorize`, route `/oauth/token` đã được Passport định nghĩa sẵn cho bạn. Không cần tự định nghĩa route này.

<a name="managing-tokens"></a>
### Quản lý token

Bạn có thể lấy các token đã được cấp quyền của người dùng bằng phương thức `tokens` của trait `Laravel\Passport\HasApiTokens`. Ví dụ, điều này có thể được dùng để cung cấp dashboard giúp người dùng theo dõi các kết nối của họ với ứng dụng third-party:

```php
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// Retrieving all of the valid tokens for the user...
$tokens = $user->tokens()
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get();

// Retrieving all the user's connections to third-party OAuth app clients...
$connections = $tokens->load('client')
    ->reject(fn (Token $token) => $token->client->firstParty())
    ->groupBy('client_id')
    ->map(fn (Collection $tokens) => [
        'client' => $tokens->first()->client,
        'scopes' => $tokens->pluck('scopes')->flatten()->unique()->values()->all(),
        'tokens_count' => $tokens->count(),
    ])
    ->values();
```

<a name="refreshing-tokens"></a>
### Làm mới token

Nếu ứng dụng phát hành access token có thời hạn ngắn, người dùng sẽ cần làm mới access token thông qua refresh token được cung cấp khi access token được phát hành:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'refresh_token',
    'refresh_token' => 'the-refresh-token',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // Required for confidential clients only...
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

Route `/oauth/token` này sẽ trả về JSON response chứa các thuộc tính `access_token`, `refresh_token` và `expires_in`. Thuộc tính `expires_in` chứa số giây còn lại trước khi access token hết hạn.

<a name="revoking-tokens"></a>
### Thu hồi token

Bạn có thể thu hồi token bằng phương thức `revoke` trên model `Laravel\Passport\Token`. Bạn có thể thu hồi refresh token của token bằng phương thức `revoke` trên model `Laravel\Passport\RefreshToken`:

```php
use Laravel\Passport\Passport;
use Laravel\Passport\Token;

$token = Passport::token()->find($tokenId);

// Revoke an access token...
$token->revoke();

// Revoke the token's refresh token...
$token->refreshToken?->revoke();

// Revoke all of the user's tokens...
User::find($userId)->tokens()->each(function (Token $token) {
    $token->revoke();
    $token->refreshToken?->revoke();
});
```

<a name="purging-tokens"></a>
### Dọn dẹp token

Khi token đã bị thu hồi hoặc hết hạn, bạn có thể muốn dọn chúng khỏi cơ sở dữ liệu. Lệnh Artisan `passport:purge` đi kèm Passport có thể thực hiện việc này:

```shell
# Purge revoked and expired tokens, auth codes, and device codes...
php artisan passport:purge

# Only purge tokens expired for more than 6 hours...
php artisan passport:purge --hours=6

# Only purge revoked tokens, auth codes, and device codes...
php artisan passport:purge --revoked

# Only purge expired tokens, auth codes, and device codes...
php artisan passport:purge --expired
```

Bạn cũng có thể cấu hình một [scheduled job](/docs/{{version}}/scheduling) trong file `routes/console.php` của ứng dụng để tự động dọn token theo lịch:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('passport:purge')->hourly();
```

<a name="code-grant-pkce"></a>
## Authorization Code Grant với PKCE

Authorization Code grant với "Proof Key for Code Exchange" (PKCE) là một cách an toàn để xác thực các ứng dụng single-page hoặc ứng dụng di động khi truy cập API của bạn. Grant này nên được sử dụng khi bạn không thể đảm bảo client secret sẽ được lưu trữ bí mật, hoặc khi muốn giảm thiểu nguy cơ authorization code bị kẻ tấn công chặn lấy. Sự kết hợp giữa "code verifier" và "code challenge" sẽ thay thế client secret khi trao đổi authorization code để lấy access token.

<a name="creating-a-auth-pkce-grant-client"></a>
### Tạo client

Trước khi ứng dụng có thể phát hành token thông qua Authorization Code grant với PKCE, bạn cần tạo một client hỗ trợ PKCE. Bạn có thể thực hiện việc này bằng lệnh Artisan `passport:client` với tùy chọn `--public`:

```shell
php artisan passport:client --public
```

<a name="requesting-auth-pkce-grant-tokens"></a>
### Yêu cầu token

<a name="code-verifier-code-challenge"></a>
#### Code Verifier và Code Challenge

Vì authorization grant này không cung cấp client secret, lập trình viên cần tạo một cặp code verifier và code challenge để yêu cầu token.

Code verifier phải là một chuỗi ngẫu nhiên dài từ 43 đến 128 ký tự, gồm chữ cái, chữ số và các ký tự `"-"`, `"."`, `"_"`, `"~"`, theo định nghĩa trong [đặc tả RFC 7636](https://tools.ietf.org/html/rfc7636).

Code challenge phải là chuỗi được mã hóa Base64 sử dụng các ký tự an toàn cho URL và tên tệp. Các ký tự `'='` ở cuối phải được loại bỏ và chuỗi không được chứa xuống dòng, khoảng trắng hoặc ký tự bổ sung khác.

```php
$encoded = base64_encode(hash('sha256', $codeVerifier, true));

$codeChallenge = strtr(rtrim($encoded, '='), '+/', '-_');
```

<a name="code-grant-pkce-redirecting-for-authorization"></a>
#### Chuyển hướng để cấp quyền

Sau khi client được tạo, bạn có thể sử dụng client ID cùng code verifier và code challenge đã tạo để yêu cầu authorization code và access token từ ứng dụng. Trước tiên, ứng dụng tiêu thụ cần thực hiện yêu cầu chuyển hướng đến route `/oauth/authorize` của ứng dụng:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Str;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $request->session()->put(
        'code_verifier', $codeVerifier = Str::random(128)
    );

    $codeChallenge = strtr(rtrim(
        base64_encode(hash('sha256', $codeVerifier, true))
    , '='), '+/', '-_');

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
        'state' => $state,
        'code_challenge' => $codeChallenge,
        'code_challenge_method' => 'S256',
        // 'prompt' => '', // "none", "consent", or "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="code-grant-pkce-converting-authorization-codes-to-access-tokens"></a>
#### Chuyển authorization code thành access token

Nếu người dùng chấp thuận yêu cầu cấp quyền, họ sẽ được chuyển hướng trở lại ứng dụng tiêu thụ. Ứng dụng tiêu thụ nên xác minh tham số `state` với giá trị đã được lưu trước khi chuyển hướng, tương tự Authorization Code Grant tiêu chuẩn.

Nếu tham số state khớp, ứng dụng tiêu thụ nên gửi một yêu cầu `POST` đến ứng dụng của bạn để yêu cầu access token. Yêu cầu phải bao gồm authorization code mà ứng dụng đã phát hành khi người dùng chấp thuận yêu cầu cấp quyền, cùng với code verifier được tạo ban đầu:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/callback', function (Request $request) {
    $state = $request->session()->pull('state');

    $codeVerifier = $request->session()->pull('code_verifier');

    throw_unless(
        strlen($state) > 0 && $state === $request->state,
        InvalidArgumentException::class
    );

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'code_verifier' => $codeVerifier,
        'code' => $request->code,
    ]);

    return $response->json();
});
```

<a name="device-authorization-grant"></a>
## Device Authorization Grant

OAuth2 Device Authorization Grant cho phép các thiết bị không có trình duyệt hoặc có khả năng nhập liệu hạn chế, chẳng hạn TV và máy chơi game, nhận access token bằng cách trao đổi một "device code". Khi sử dụng device flow, device client sẽ hướng dẫn người dùng dùng một thiết bị thứ hai, chẳng hạn máy tính hoặc điện thoại thông minh, kết nối đến máy chủ của bạn, nhập "user code" được cung cấp rồi chấp thuận hoặc từ chối yêu cầu truy cập.

Để bắt đầu, chúng ta cần chỉ cho Passport cách trả về các view "user code" và "authorization".

Toàn bộ logic render của các authorization view có thể được tùy chỉnh bằng những phương thức phù hợp có sẵn thông qua class `Laravel\Passport\Passport`. Thông thường, bạn nên gọi các phương thức này từ phương thức `boot` của class `App\Providers\AppServiceProvider` trong ứng dụng.

```php
use Inertia\Inertia;
use Laravel\Passport\Passport;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // By providing a view name...
    Passport::deviceUserCodeView('auth.oauth.device.user-code');
    Passport::deviceAuthorizationView('auth.oauth.device.authorize');

    // By providing a closure...
    Passport::deviceUserCodeView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Device/UserCode')
    );

    Passport::deviceAuthorizationView(
        fn ($parameters) => Inertia::render('Auth/OAuth/Device/Authorize', [
            'request' => $parameters['request'],
            'authToken' => $parameters['authToken'],
            'client' => $parameters['client'],
            'user' => $parameters['user'],
            'scopes' => $parameters['scopes'],
        ])
    );

    // ...
}
```

Passport sẽ tự động định nghĩa các route trả về những view này. Template `auth.oauth.device.user-code` nên chứa một form gửi yêu cầu GET đến route `passport.device.authorizations.authorize`. Route `passport.device.authorizations.authorize` yêu cầu query parameter `user_code`.

Template `auth.oauth.device.authorize` nên chứa một form gửi yêu cầu POST đến route `passport.device.authorizations.approve` để chấp thuận cấp quyền và một form gửi yêu cầu DELETE đến route `passport.device.authorizations.deny` để từ chối cấp quyền. Các route `passport.device.authorizations.approve` và `passport.device.authorizations.deny` yêu cầu các trường `state`, `client_id` và `auth_token`.

<a name="creating-a-device-authorization-grant-client"></a>
### Tạo Device Authorization Grant client

Trước khi ứng dụng có thể phát hành token thông qua Device Authorization Grant, bạn cần tạo một client hỗ trợ device flow. Bạn có thể thực hiện việc này bằng lệnh Artisan `passport:client` với tùy chọn `--device`. Lệnh này sẽ tạo một first-party client hỗ trợ device flow và cung cấp client ID cùng secret:

```shell
php artisan passport:client --device
```

Ngoài ra, bạn có thể sử dụng phương thức `createDeviceAuthorizationGrantClient` trên class `ClientRepository` để đăng ký một third-party client thuộc về người dùng được chỉ định:

```php
use App\Models\User;
use Laravel\Passport\ClientRepository;

$user = User::find($userId);

$client = app(ClientRepository::class)->createDeviceAuthorizationGrantClient(
    user: $user,
    name: 'Example Device',
    confidential: false,
);
```

<a name="requesting-device-authorization-grant-tokens"></a>
### Yêu cầu token

<a name="device-code"></a>
#### Yêu cầu Device Code

Sau khi client được tạo, lập trình viên có thể sử dụng client ID để yêu cầu device code từ ứng dụng. Trước tiên, thiết bị tiêu thụ cần gửi yêu cầu `POST` đến route `/oauth/device/code` của ứng dụng để yêu cầu device code:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/device/code', [
    'client_id' => 'your-client-id',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

Thao tác này sẽ trả về JSON response chứa các thuộc tính `device_code`, `user_code`, `verification_uri`, `interval` và `expires_in`. Thuộc tính `expires_in` chứa số giây cho đến khi device code hết hạn. Thuộc tính `interval` chứa số giây mà thiết bị tiêu thụ nên chờ giữa các yêu cầu khi polling route `/oauth/token` để tránh lỗi rate limit.

> [!NOTE]
> Hãy nhớ rằng route `/oauth/device/code` đã được Passport định nghĩa sẵn. Bạn không cần tự định nghĩa route này.

<a name="user-code"></a>
#### Hiển thị Verification URI và User Code

Sau khi nhận được device code, thiết bị tiêu thụ nên hướng dẫn người dùng sử dụng một thiết bị khác, truy cập `verification_uri` được cung cấp và nhập `user_code` để chấp thuận yêu cầu cấp quyền.

<a name="polling-token-request"></a>
#### Polling yêu cầu token

Vì người dùng sẽ sử dụng một thiết bị riêng để cấp hoặc từ chối quyền truy cập, thiết bị tiêu thụ nên polling route `/oauth/token` của ứng dụng để xác định khi nào người dùng đã phản hồi yêu cầu. Thiết bị tiêu thụ nên sử dụng `interval` polling tối thiểu được cung cấp trong JSON response khi yêu cầu device code để tránh lỗi rate limit:

```php
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;

$interval = 5;

do {
    Sleep::for($interval)->seconds();

    $response = Http::asForm()->post('https://passport-app.test/oauth/token', [
        'grant_type' => 'urn:ietf:params:oauth:grant-type:device_code',
        'client_id' => 'your-client-id',
        'client_secret' => 'your-client-secret', // Required for confidential clients only...
        'device_code' => 'the-device-code',
    ]);

    if ($response->json('error') === 'slow_down') {
        $interval += 5;
    }
} while (in_array($response->json('error'), ['authorization_pending', 'slow_down']));

return $response->json();
```

Nếu người dùng đã chấp thuận yêu cầu cấp quyền, thao tác này sẽ trả về JSON response chứa các thuộc tính `access_token`, `refresh_token` và `expires_in`. Thuộc tính `expires_in` chứa số giây cho đến khi access token hết hạn.

<a name="password-grant"></a>
## Password Grant

> [!WARNING]
> Chúng tôi không còn khuyến nghị sử dụng password grant token. Thay vào đó, bạn nên chọn [một grant type hiện được OAuth2 Server khuyến nghị](https://oauth2.thephpleague.com/authorization-server/which-grant/).

OAuth2 Password Grant cho phép các first-party client khác của bạn, chẳng hạn ứng dụng di động, nhận access token bằng địa chỉ email / username và password. Điều này cho phép bạn phát hành access token một cách an toàn cho các first-party client mà không yêu cầu người dùng đi qua toàn bộ luồng chuyển hướng OAuth2 authorization code.

Để bật Password Grant, hãy gọi phương thức `enablePasswordGrant` trong phương thức `boot` của class `App\Providers\AppServiceProvider` trong ứng dụng:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::enablePasswordGrant();
}
```

<a name="creating-a-password-grant-client"></a>
### Tạo Password Grant client

Trước khi ứng dụng có thể phát hành token thông qua Password Grant, bạn cần tạo một Password Grant client. Bạn có thể thực hiện việc này bằng lệnh Artisan `passport:client` với tùy chọn `--password`.

```shell
php artisan passport:client --password
```

<a name="requesting-password-grant-tokens"></a>
### Yêu cầu token

Sau khi bật grant và tạo Password Grant client, bạn có thể yêu cầu access token bằng cách gửi yêu cầu `POST` đến route `/oauth/token` cùng địa chỉ email và password của người dùng. Hãy nhớ rằng route này đã được Passport đăng ký sẵn nên không cần tự định nghĩa. Nếu yêu cầu thành công, bạn sẽ nhận được `access_token` và `refresh_token` trong JSON response từ server:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // Required for confidential clients only...
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => 'user:read orders:create',
]);

return $response->json();
```

> [!NOTE]
> Hãy nhớ rằng access token mặc định có thời hạn dài. Tuy nhiên, bạn có thể [cấu hình thời hạn tối đa của access token](#configuration) nếu cần.

<a name="requesting-all-scopes"></a>
### Yêu cầu tất cả scope

Khi sử dụng Password Grant hoặc Client Credentials Grant, bạn có thể muốn cấp quyền cho token đối với tất cả scope mà ứng dụng hỗ trợ. Bạn có thể làm điều này bằng cách yêu cầu scope `*`. Nếu yêu cầu scope `*`, phương thức `can` trên token instance sẽ luôn trả về `true`. Scope này chỉ có thể được gán cho token được phát hành bằng grant `password` hoặc `client_credentials`:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'password',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret', // Required for confidential clients only...
    'username' => 'taylor@laravel.com',
    'password' => 'my-password',
    'scope' => '*',
]);
```

<a name="customizing-the-user-provider"></a>
### Tùy chỉnh User Provider

Nếu ứng dụng sử dụng nhiều hơn một [authentication user provider](/docs/{{version}}/authentication#introduction), bạn có thể chỉ định user provider mà Password Grant client sử dụng bằng tùy chọn `--provider` khi tạo client qua lệnh `artisan passport:client --password`. Tên provider được cung cấp phải khớp với một provider hợp lệ được định nghĩa trong file cấu hình `config/auth.php` của ứng dụng. Sau đó, bạn có thể [bảo vệ route bằng middleware](#multiple-authentication-guards) để đảm bảo chỉ người dùng từ provider được guard chỉ định mới được cấp quyền.

<a name="customizing-the-username-field"></a>
### Tùy chỉnh trường Username

Khi xác thực bằng Password Grant, Passport sẽ sử dụng thuộc tính `email` của authenticatable model làm "username". Tuy nhiên, bạn có thể tùy chỉnh hành vi này bằng cách định nghĩa phương thức `findForPassport` trên model:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Bridge\Client;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * Find the user instance for the given username.
     */
    public function findForPassport(string $username, Client $client): User
    {
        return $this->where('username', $username)->first();
    }
}
```

<a name="customizing-the-password-validation"></a>
### Tùy chỉnh việc xác thực Password

Khi xác thực bằng Password Grant, Passport sẽ sử dụng thuộc tính `password` của model để xác thực password được cung cấp. Nếu model không có thuộc tính `password` hoặc bạn muốn tùy chỉnh logic xác thực password, bạn có thể định nghĩa phương thức `validateForPassportPasswordGrant` trên model:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable implements OAuthenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * Validate the password of the user for the Passport password grant.
     */
    public function validateForPassportPasswordGrant(string $password): bool
    {
        return Hash::check($password, $this->password);
    }
}
```

<a name="implicit-grant"></a>
## Implicit Grant (cấp quyền ngầm định)

> [!WARNING]
> Chúng tôi không còn khuyến nghị sử dụng token theo implicit grant. Thay vào đó, bạn nên chọn [một grant type hiện được OAuth2 Server khuyến nghị](https://oauth2.thephpleague.com/authorization-server/which-grant/).

Implicit grant tương tự authorization code grant; tuy nhiên, token được trả trực tiếp cho client mà không cần đổi authorization code. Grant này thường được dùng cho ứng dụng JavaScript hoặc mobile, nơi client credentials không thể được lưu trữ an toàn. Để bật grant này, hãy gọi phương thức `enableImplicitGrant` trong phương thức `boot` của lớp `App\Providers\AppServiceProvider`:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::enableImplicitGrant();
}
```

Trước khi ứng dụng có thể phát hành token thông qua implicit grant, bạn cần tạo một implicit grant client. Bạn có thể thực hiện việc này bằng lệnh Artisan `passport:client` với tùy chọn `--implicit`.

```shell
php artisan passport:client --implicit
```

Sau khi grant được bật và implicit client đã được tạo, lập trình viên có thể dùng client ID để yêu cầu access token từ ứng dụng của bạn. Ứng dụng tiêu thụ API nên thực hiện redirect request đến route `/oauth/authorize` của ứng dụng như sau:

```php
use Illuminate\Http\Request;

Route::get('/redirect', function (Request $request) {
    $request->session()->put('state', $state = Str::random(40));

    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'token',
        'scope' => 'user:read orders:create',
        'state' => $state,
        // 'prompt' => '', // "none", "consent", or "login"
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

> [!NOTE]
> Hãy nhớ rằng route `/oauth/authorize` đã được Passport định nghĩa sẵn. Bạn không cần tự định nghĩa route này.

<a name="client-credentials-grant"></a>
## Client Credentials Grant

Client credentials grant phù hợp cho xác thực machine-to-machine. Ví dụ, bạn có thể dùng grant này trong một scheduled job thực hiện các tác vụ bảo trì thông qua API.

Trước khi ứng dụng có thể phát hành token thông qua client credentials grant, bạn cần tạo một client credentials grant client. Bạn có thể thực hiện việc này bằng tùy chọn `--client` của lệnh Artisan `passport:client`:

```shell
php artisan passport:client --client
```

Tiếp theo, gán middleware `Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner` cho một route:

```php
use Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner;

Route::get('/orders', function (Request $request) {
    // Access token is valid and the client is resource owner...
})->middleware(EnsureClientIsResourceOwner::class);
```

Để giới hạn quyền truy cập route theo các scope cụ thể, bạn có thể truyền danh sách scope bắt buộc vào phương thức `using`:

```php
Route::get('/orders', function (Request $request) {
    // Access token is valid, the client is resource owner, and has both "servers:read" and "servers:create" scopes...
})->middleware(EnsureClientIsResourceOwner::using('servers:read', 'servers:create'));
```

> [!WARNING]
> [OAuth2 server bên dưới](https://oauth2.thephpleague.com/database-setup/#:~:text=Please%20note%20that,the%20bearer%20token.) đặt claim `sub` của token thành định danh client đối với client credentials token. Mặc định, Passport dùng UUID cho client nên giá trị này không thể xung đột với khóa chính kiểu số nguyên của user. Tuy nhiên, nếu bạn đặt `Passport::$clientUuids` thành `false`, một client credentials token có thể vô tình resolve thành user có ID trùng với client ID. Trong trường hợp đó, middleware này không thể đảm bảo token gửi đến thực sự là client credentials token.

<a name="retrieving-tokens"></a>
### Lấy token

Để lấy token bằng grant type này, hãy gửi request đến endpoint `oauth/token`:

```php
use Illuminate\Support\Facades\Http;

$response = Http::asForm()->post('https://passport-app.test/oauth/token', [
    'grant_type' => 'client_credentials',
    'client_id' => 'your-client-id',
    'client_secret' => 'your-client-secret',
    'scope' => 'servers:read servers:create',
]);

return $response->json()['access_token'];
```

<a name="personal-access-tokens"></a>
## Personal Access Token

Đôi khi, user có thể muốn tự phát hành access token mà không cần đi qua luồng redirect authorization code thông thường. Cho phép user tự phát hành token thông qua UI của ứng dụng có thể hữu ích để họ thử nghiệm API, hoặc đơn giản là một cách phát hành access token thuận tiện hơn.

> [!NOTE]
> Nếu ứng dụng chủ yếu dùng Passport để phát hành personal access token, hãy cân nhắc sử dụng [Laravel Sanctum](/docs/{{version}}/sanctum), thư viện first-party gọn nhẹ của Laravel dành cho việc phát hành API access token.

<a name="creating-a-personal-access-client"></a>
### Tạo Personal Access Client

Trước khi ứng dụng có thể phát hành personal access token, bạn cần tạo một personal access client. Bạn có thể thực hiện bằng lệnh Artisan `passport:client` với tùy chọn `--personal`. Nếu đã chạy lệnh `passport:install`, bạn không cần chạy lệnh này:

```shell
php artisan passport:client --personal
```

<a name="customizing-the-user-provider-for-pat"></a>
### Tùy chỉnh User Provider

Nếu ứng dụng sử dụng nhiều [authentication user provider](/docs/{{version}}/authentication#introduction), bạn có thể chỉ định user provider mà personal access grant client sử dụng bằng tùy chọn `--provider` khi tạo client qua lệnh `artisan passport:client --personal`. Tên provider phải khớp với một provider hợp lệ được định nghĩa trong file cấu hình `config/auth.php`. Sau đó, bạn có thể [bảo vệ route bằng middleware](#multiple-authentication-guards) để bảo đảm chỉ user thuộc provider được guard chỉ định mới được cấp quyền.

<a name="managing-personal-access-tokens"></a>
### Quản lý Personal Access Token

Sau khi tạo personal access client, bạn có thể phát hành token cho một user bằng phương thức `createToken` trên instance model `App\Models\User`. Phương thức `createToken` nhận tên token làm đối số thứ nhất và một mảng [scope](#token-scopes) tùy chọn làm đối số thứ hai:

```php
use App\Models\User;
use Illuminate\Support\Facades\Date;
use Laravel\Passport\Token;

$user = User::find($userId);

// Creating a token without scopes...
$token = $user->createToken('My Token')->accessToken;

// Creating a token with scopes...
$token = $user->createToken('My Token', ['user:read', 'orders:create'])->accessToken;

// Creating a token with all scopes...
$token = $user->createToken('My Token', ['*'])->accessToken;

// Retrieving all the valid personal access tokens that belong to the user...
$tokens = $user->tokens()
    ->with('client')
    ->where('revoked', false)
    ->where('expires_at', '>', Date::now())
    ->get()
    ->filter(fn (Token $token) => $token->client->hasGrantType('personal_access'));
```

<a name="protecting-routes"></a>
## Bảo vệ route

<a name="via-middleware"></a>
### Qua middleware

Passport cung cấp một [authentication guard](/docs/{{version}}/authentication#adding-custom-guards) để xác thực access token trên request gửi đến. Sau khi cấu hình guard `api` sử dụng driver `passport`, bạn chỉ cần gắn middleware `auth:api` vào các route yêu cầu access token hợp lệ:

```php
Route::get('/user', function () {
    // Only API authenticated users may access this route...
})->middleware('auth:api');
```

> [!WARNING]
> Nếu đang sử dụng [client credentials grant](#client-credentials-grant), bạn nên dùng [middleware `Laravel\Passport\Http\Middleware\EnsureClientIsResourceOwner`](#client-credentials-grant) để bảo vệ route thay cho middleware `auth:api`.

<a name="multiple-authentication-guards"></a>
#### Nhiều Authentication Guard

Nếu ứng dụng xác thực nhiều loại user khác nhau, có thể sử dụng các Eloquent model hoàn toàn khác nhau, bạn thường cần định nghĩa cấu hình guard cho từng loại user provider. Điều này cho phép bảo vệ các request dành cho những user provider cụ thể. Ví dụ, với cấu hình guard sau trong file `config/auth.php`:

```php
'guards' => [
    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],

    'api-customers' => [
        'driver' => 'passport',
        'provider' => 'customers',
    ],
],
```

Route sau sẽ sử dụng guard `api-customers`, guard này dùng user provider `customers`, để xác thực các request gửi đến:

```php
Route::get('/customer', function () {
    // ...
})->middleware('auth:api-customers');
```

> [!NOTE]
> Để biết thêm về việc sử dụng nhiều user provider với Passport, hãy tham khảo [tài liệu personal access token](#customizing-the-user-provider-for-pat) và [tài liệu password grant](#customizing-the-user-provider).

<a name="passing-the-access-token"></a>
### Truyền Access Token

Khi gọi các route được Passport bảo vệ, client tiêu thụ API của ứng dụng nên truyền access token dưới dạng `Bearer` token trong header `Authorization` của request. Ví dụ, khi sử dụng `Http` Facade:

```php
use Illuminate\Support\Facades\Http;

$response = Http::withHeaders([
    'Accept' => 'application/json',
    'Authorization' => "Bearer $accessToken",
])->get('https://passport-app.test/api/user');

return $response->json();
```

<a name="token-scopes"></a>
## Token Scope

Scope cho phép API client yêu cầu một tập quyền cụ thể khi xin quyền truy cập tài khoản. Ví dụ, trong ứng dụng thương mại điện tử, không phải mọi API consumer đều cần khả năng đặt hàng. Thay vào đó, bạn có thể chỉ cho phép họ yêu cầu quyền xem trạng thái vận chuyển đơn hàng. Nói cách khác, scope cho phép user giới hạn những hành động mà ứng dụng bên thứ ba có thể thực hiện thay mặt họ.

<a name="defining-scopes"></a>
### Định nghĩa scope

Bạn có thể định nghĩa scope của API bằng phương thức `Passport::tokensCan` trong phương thức `boot` của lớp `App\Providers\AppServiceProvider`. Phương thức `tokensCan` nhận một mảng gồm tên scope và mô tả scope. Nội dung mô tả có thể tùy ý và sẽ được hiển thị cho user trên màn hình phê duyệt authorization:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::tokensCan([
        'user:read' => 'Retrieve the user info',
        'orders:create' => 'Place orders',
        'orders:read:status' => 'Check order status',
    ]);
}
```

<a name="default-scope"></a>
### Scope mặc định

Nếu client không yêu cầu scope cụ thể nào, bạn có thể cấu hình Passport server gắn các scope mặc định vào token bằng phương thức `defaultScopes`. Thông thường, phương thức này nên được gọi từ phương thức `boot` của lớp `App\Providers\AppServiceProvider`:

```php
use Laravel\Passport\Passport;

Passport::tokensCan([
    'user:read' => 'Retrieve the user info',
    'orders:create' => 'Place orders',
    'orders:read:status' => 'Check order status',
]);

Passport::defaultScopes([
    'user:read',
    'orders:create',
]);
```

<a name="assigning-scopes-to-tokens"></a>
### Gán scope cho token

<a name="when-requesting-authorization-codes"></a>
#### Khi yêu cầu Authorization Code

Khi yêu cầu access token bằng authorization code grant, consumer nên chỉ định các scope mong muốn qua query string parameter `scope`. Tham số `scope` phải là danh sách scope được phân tách bằng dấu cách:

```php
Route::get('/redirect', function () {
    $query = http_build_query([
        'client_id' => 'your-client-id',
        'redirect_uri' => 'https://third-party-app.com/callback',
        'response_type' => 'code',
        'scope' => 'user:read orders:create',
    ]);

    return redirect('https://passport-app.test/oauth/authorize?'.$query);
});
```

<a name="when-issuing-personal-access-tokens"></a>
#### Khi phát hành Personal Access Token

Nếu phát hành personal access token bằng phương thức `createToken` của model `App\Models\User`, bạn có thể truyền mảng scope mong muốn làm đối số thứ hai:

```php
$token = $user->createToken('My Token', ['orders:create'])->accessToken;
```

<a name="checking-scopes"></a>
### Kiểm tra scope

Passport cung cấp hai middleware có thể dùng để xác minh request gửi đến được xác thực bằng token đã được cấp một scope nhất định.

<a name="check-for-all-scopes"></a>
#### Kiểm tra tất cả scope

Middleware `Laravel\Passport\Http\Middleware\CheckToken` có thể được gán cho route để xác minh access token của request gửi đến có tất cả các scope được liệt kê:

```php
use Laravel\Passport\Http\Middleware\CheckToken;

Route::get('/orders', function () {
    // Access token has both "orders:read" and "orders:create" scopes...
})->middleware(['auth:api', CheckToken::using('orders:read', 'orders:create')]);
```

<a name="check-for-any-scopes"></a>
#### Kiểm tra bất kỳ scope nào

Middleware `Laravel\Passport\Http\Middleware\CheckTokenForAnyScope` có thể được gán cho route để xác minh access token của request gửi đến có *ít nhất một* trong các scope được liệt kê:

```php
use Laravel\Passport\Http\Middleware\CheckTokenForAnyScope;

Route::get('/orders', function () {
    // Access token has either "orders:read" or "orders:create" scope...
})->middleware(['auth:api', CheckTokenForAnyScope::using('orders:read', 'orders:create')]);
```

<a name="scope-attributes"></a>
#### Scope Attribute

Nếu ứng dụng sử dụng [controller middleware attribute](/docs/{{version}}/controllers#middleware-attributes), bạn có thể dùng attribute `Laravel\Passport\Attributes\AuthorizeToken` như một cách viết tắt thuận tiện cho scope middleware của Passport:

```php
<?php

namespace App\Http\Controllers;

use Laravel\Passport\Attributes\AuthorizeToken;

#[AuthorizeToken('orders:read')]
#[AuthorizeToken('orders:create', only: ['store'])]
class OrderController
{
    #[AuthorizeToken(['orders:read', 'orders:create'], anyScope: true)]
    public function index()
    {
        // Access token has either "orders:read" or "orders:create" scope...
    }

    public function store()
    {
        // Access token has both "orders:read" and "orders:create" scopes...
    }
}
```

Mặc định, attribute `AuthorizeToken` yêu cầu tất cả scope được truyền vào. Nếu truyền `anyScope: true`, request sẽ được cấp quyền khi token có ít nhất một trong các scope đó.

<a name="checking-scopes-on-a-token-instance"></a>
#### Kiểm tra scope trên Token Instance

Sau khi request được xác thực bằng access token đi vào ứng dụng, bạn vẫn có thể kiểm tra token có một scope nhất định hay không bằng phương thức `tokenCan` trên instance `App\Models\User` đã xác thực:

```php
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    if ($request->user()->tokenCan('orders:create')) {
        // ...
    }
});
```

<a name="additional-scope-methods"></a>
#### Các phương thức scope bổ sung

Phương thức `scopeIds` trả về mảng chứa tất cả ID / tên đã định nghĩa:

```php
use Laravel\Passport\Passport;

Passport::scopeIds();
```

Phương thức `scopes` trả về mảng tất cả scope đã định nghĩa dưới dạng các instance của `Laravel\Passport\Scope`:

```php
Passport::scopes();
```

Phương thức `scopesFor` trả về mảng các instance `Laravel\Passport\Scope` khớp với ID / tên được truyền vào:

```php
Passport::scopesFor(['user:read', 'orders:create']);
```

Bạn có thể xác định một scope đã được định nghĩa hay chưa bằng phương thức `hasScope`:

```php
Passport::hasScope('orders:create');
```

<a name="spa-authentication"></a>
## Xác thực SPA

Khi xây dựng API, khả năng sử dụng chính API đó từ ứng dụng JavaScript của bạn có thể rất hữu ích. Cách tiếp cận này cho phép ứng dụng của bạn dùng cùng API đang được cung cấp ra bên ngoài. Cùng một API có thể được sử dụng bởi web application, mobile application, ứng dụng bên thứ ba và các SDK mà bạn phát hành trên nhiều package manager.

Thông thường, nếu muốn sử dụng API từ ứng dụng JavaScript, bạn phải tự gửi access token đến ứng dụng và truyền token theo từng request. Tuy nhiên, Passport cung cấp middleware xử lý việc này. Bạn chỉ cần thêm middleware `CreateFreshApiToken` vào cuối middleware group `web` trong file `bootstrap/app.php`:

```php
use Laravel\Passport\Http\Middleware\CreateFreshApiToken;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        CreateFreshApiToken::class,
    ]);
})
```

> [!WARNING]
> Bạn nên bảo đảm middleware `CreateFreshApiToken` là middleware cuối cùng trong middleware stack.

Middleware này sẽ gắn cookie `laravel_token` vào response trả về. Cookie chứa một JWT đã mã hóa mà Passport dùng để xác thực API request từ ứng dụng JavaScript. Thời hạn của JWT bằng giá trị cấu hình `session.lifetime`. Vì trình duyệt tự động gửi cookie trong các request tiếp theo, bạn có thể gọi API của ứng dụng mà không cần truyền access token một cách tường minh:

```js
axios.get('/api/user')
    .then(response => {
        console.log(response.data);
    });
```

<a name="customizing-the-cookie-name"></a>
#### Tùy chỉnh tên cookie

Nếu cần, bạn có thể tùy chỉnh tên cookie `laravel_token` bằng phương thức `Passport::cookie`. Thông thường, phương thức này nên được gọi từ phương thức `boot` của lớp `App\Providers\AppServiceProvider`:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Passport::cookie('custom_name');
}
```

<a name="csrf-protection"></a>
#### Bảo vệ CSRF

Khi sử dụng phương thức xác thực này, bạn cần bảo đảm request có header CSRF token hợp lệ. JavaScript scaffolding mặc định của Laravel trong skeleton application và tất cả starter kit đều cung cấp một instance [Axios](https://github.com/axios/axios), tự động dùng giá trị cookie `XSRF-TOKEN` đã mã hóa để gửi header `X-XSRF-TOKEN` trong các same-origin request.

> [!NOTE]
> Nếu chọn gửi header `X-CSRF-TOKEN` thay cho `X-XSRF-TOKEN`, bạn cần dùng token chưa mã hóa được cung cấp bởi `csrf_token()`.

<a name="events"></a>
## Sự kiện

Passport phát sinh các event khi phát hành access token và refresh token. Bạn có thể [lắng nghe các event này](/docs/{{version}}/events) để dọn dẹp hoặc thu hồi các access token khác trong database:

<div class="overflow-auto">

| Tên event                                     |
| --------------------------------------------- |
| `Laravel\Passport\Events\AccessTokenCreated`  |
| `Laravel\Passport\Events\AccessTokenRevoked`  |
| `Laravel\Passport\Events\RefreshTokenCreated` |

</div>

<a name="testing"></a>
## Kiểm thử

Phương thức `actingAs` của Passport có thể được dùng để chỉ định user hiện đang được xác thực cùng các scope của họ. Đối số thứ nhất của `actingAs` là user instance, đối số thứ hai là mảng scope cần cấp cho token của user:

```php tab=Pest
use App\Models\User;
use Laravel\Passport\Passport;

test('orders can be created', function () {
    Passport::actingAs(
        User::factory()->create(),
        ['orders:create']
    );

    $response = $this->post('/api/orders');

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
use App\Models\User;
use Laravel\Passport\Passport;

public function test_orders_can_be_created(): void
{
    Passport::actingAs(
        User::factory()->create(),
        ['orders:create']
    );

    $response = $this->post('/api/orders');

    $response->assertStatus(201);
}
```

Phương thức `actingAsClient` của Passport có thể được dùng để chỉ định client hiện đang được xác thực cùng các scope của client. Đối số thứ nhất của `actingAsClient` là client instance, đối số thứ hai là mảng scope cần cấp cho token của client:

```php tab=Pest
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

test('servers can be retrieved', function () {
    Passport::actingAsClient(
        Client::factory()->create(),
        ['servers:read']
    );

    $response = $this->get('/api/servers');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

public function test_servers_can_be_retrieved(): void
{
    Passport::actingAsClient(
        Client::factory()->create(),
        ['servers:read']
    );

    $response = $this->get('/api/servers');

    $response->assertStatus(200);
}
```

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/passport). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
