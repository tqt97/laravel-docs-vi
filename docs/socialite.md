# Laravel Socialite

<a name="introduction"></a>

## Giới thiệu

Bên cạnh authentication dựa trên form truyền thống, Laravel còn cung cấp cách đơn giản và thuận tiện để xác thực với các OAuth provider thông qua [Laravel Socialite](https://github.com/laravel/socialite). Socialite hiện hỗ trợ Facebook, X, LinkedIn, Google, GitHub, GitLab, Bitbucket và Slack.
> [!NOTE]
> Adapter cho các nền tảng khác có thể được tìm thấy trên website cộng đồng [Socialite Providers](https://socialiteproviders.com/).
<a name="installation"></a>
Bên cạnh authentication dựa trên form truyền thống, Laravel còn cung cấp cách đơn giản và thuận tiện để xác thực với các OAuth provider thông qua [Laravel Socialite](https://github.com/laravel/socialite). Socialite hiện hỗ trợ Facebook, X, LinkedIn, Google, GitHub, GitLab, Bitbucket và Slack.

```shell
composer require laravel/socialite
```

<a name="upgrading-socialite"></a>
Để bắt đầu với Socialite, hãy dùng Composer để thêm package vào dependency của project:
<a name="configuration"></a>

## Cấu hình

Trước khi dùng Socialite, bạn cần thêm credential cho các OAuth provider mà ứng dụng sử dụng. Thông thường, credential được lấy bằng cách tạo một "developer application" trong dashboard của dịch vụ mà ứng dụng sẽ dùng để xác thực.
Các credential này nên được đặt trong file cấu hình `config/services.php`, với key `facebook`, `x`, `linkedin-openid`, `google`, `github`, `gitlab`, `bitbucket`, `slack` hoặc `slack-openid` tùy provider ứng dụng cần:

```php
'github' => [
    'client_id' => env('GITHUB_CLIENT_ID'),
    'client_secret' => env('GITHUB_CLIENT_SECRET'),
    'redirect' => 'http://example.com/callback-url',
],
```

## Nâng cấp Socialite

<a name="authentication"></a>

## Authentication

<a name="routing"></a>
Trước khi dùng Socialite, bạn cần thêm credential cho các OAuth provider mà ứng dụng sử dụng. Thông thường, credential được lấy bằng cách tạo một "developer application" trong dashboard của dịch vụ mà ứng dụng sẽ dùng để xác thực.

```php
use Laravel\Socialite\Socialite;

Route::get('/auth/redirect', function () {
    return Socialite::driver('github')->redirect();
});

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // $user->token
});
```

Phương thức `redirect` của facade `Socialite` xử lý việc redirect người dùng tới OAuth provider, còn `user` sẽ đọc request callback và lấy thông tin người dùng từ provider sau khi họ chấp thuận yêu cầu xác thực.
<a name="authentication-and-storage"></a>

### Authentication và lưu trữ

Sau khi lấy người dùng từ OAuth provider, bạn có thể kiểm tra người dùng đó đã tồn tại trong database hay chưa và [authenticate user](/docs/{{version}}/authentication#authenticate-a-user-instance). Nếu chưa tồn tại, thông thường bạn sẽ tạo record mới để đại diện cho người dùng:

```php
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Socialite;

Route::get('/auth/callback', function () {
    $githubUser = Socialite::driver('github')->user();

    $user = User::updateOrCreate([
        'github_id' => $githubUser->id,
    ], [
        'name' => $githubUser->name,
        'email' => $githubUser->email,
        'github_token' => $githubUser->token,
        'github_refresh_token' => $githubUser->refreshToken,
    ]);

    Auth::login($user);

    return redirect('/dashboard');
});
```

> [!NOTE]
> Để biết provider cụ thể trả về những thông tin người dùng nào, hãy xem phần [lấy thông tin người dùng](#retrieving-user-details).
<a name="access-scopes"></a>
Để xác thực người dùng bằng OAuth provider, bạn cần hai route: một route redirect người dùng tới provider và một route nhận callback từ provider sau khi xác thực. Ví dụ dưới đây triển khai cả hai route:

```php
use Laravel\Socialite\Socialite;

return Socialite::driver('github')
    ->scopes(['read:user', 'public_repo'])
    ->redirect();
```

Phương thức `redirect` của facade `Socialite` xử lý việc redirect người dùng tới OAuth provider, còn `user` sẽ đọc request callback và lấy thông tin người dùng từ provider sau khi họ chấp thuận yêu cầu xác thực.

```php
return Socialite::driver('github')
    ->setScopes(['read:user', 'public_repo'])
    ->redirect();
```

### Authentication và lưu trữ

<a name="slack-bot-scopes"></a>

### Slack Bot Scopes

API của Slack cung cấp [nhiều loại access token](https://api.slack.com/authentication/token-types), mỗi loại có tập [permission scope](https://api.slack.com/scopes) riêng. Socialite tương thích với hai loại Slack access token sau:

> [!NOTE]
> Để biết provider cụ thể trả về những thông tin người dùng nào, hãy xem phần [lấy thông tin người dùng](#retrieving-user-details).
Mặc định, driver `slack` tạo token loại `user`, và khi gọi phương thức `user` của driver, Socialite trả về thông tin người dùng.
Bot token đặc biệt hữu ích nếu ứng dụng cần gửi notification tới Slack workspace bên ngoài thuộc sở hữu của người dùng ứng dụng. Để tạo bot token, hãy gọi `asBotUser` trước khi redirect người dùng sang Slack để xác thực:

```php
return Socialite::driver('slack')
    ->asBotUser()
    ->setScopes(['chat:write', 'chat:write.public', 'chat:write.customize'])
    ->redirect();
```

Trước khi redirect người dùng, bạn có thể dùng `scopes` để chỉ định các "scope" cần đưa vào request xác thực. Phương thức này merge các scope đã khai báo trước đó với scope mới bạn truyền vào:

```php
$user = Socialite::driver('slack')->asBotUser()->user();
```

Bạn có thể ghi đè toàn bộ scope hiện tại trên request xác thực bằng `setScopes`:
<a name="optional-parameters"></a>

### Tham số tùy chọn

Một số OAuth provider hỗ trợ thêm parameter tùy chọn trên redirect request. Để thêm parameter, hãy gọi `with` với associative array:

```php
use Laravel\Socialite\Socialite;

return Socialite::driver('google')
    ->with(['hd' => 'example.com'])
    ->redirect();
```

### Slack Bot Scopes

<a name="retrieving-user-details"></a>

## Lấy thông tin người dùng

Sau khi người dùng được redirect về route callback xác thực của ứng dụng, bạn có thể lấy thông tin của họ bằng phương thức `user` của Socialite. Object người dùng được trả về cung cấp nhiều property và method để bạn lưu thông tin cần thiết vào database của mình.
Các property và method khả dụng có thể khác nhau tùy OAuth provider đang dùng hỗ trợ OAuth 1.0 hay OAuth 2.0:

```php
use Laravel\Socialite\Socialite;

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // OAuth 2.0 providers...
    $token = $user->token;
    $refreshToken = $user->refreshToken;
    $expiresIn = $user->expiresIn;

    // OAuth 1.0 providers...
    $token = $user->token;
    $tokenSecret = $user->tokenSecret;

    // All providers...
    $user->getId();
    $user->getNickname();
    $user->getName();
    $user->getEmail();
    $user->getAvatar();
});
```

<a name="retrieving-user-details-from-a-token-oauth2"></a>
Bot token đặc biệt hữu ích nếu ứng dụng cần gửi notification tới Slack workspace bên ngoài thuộc sở hữu của người dùng ứng dụng. Để tạo bot token, hãy gọi `asBotUser` trước khi redirect người dùng sang Slack để xác thực:

```php
use Laravel\Socialite\Socialite;

$user = Socialite::driver('github')->userFromToken($token);
```

Ngoài ra, bạn cũng phải gọi `asBotUser` trước `user` sau khi Slack redirect người dùng quay lại ứng dụng:

```php
$user = Socialite::driver('facebook')->userFromToken($token, $nonce);
```

Khi tạo bot token, phương thức `user` vẫn trả về instance `Laravel\Socialite\Two\User`; tuy nhiên chỉ property `token` được hydrate. Token này có thể được lưu để [gửi notification tới Slack workspace của người dùng đã xác thực](/docs/{{version}}/notifications#notifying-external-slack-workspaces).
<a name="stateless-authentication"></a>

### Tham số tùy chọn

```php
use Laravel\Socialite\Socialite;

return Socialite::driver('google')->stateless()->user();
```

<a name="testing"></a>

## Kiểm thử

Laravel Socialite cung cấp cách thuận tiện để kiểm thử OAuth authentication flow mà không gửi request thật tới OAuth provider. Phương thức `fake` cho phép mock behavior của provider và định nghĩa dữ liệu người dùng sẽ được trả về.
<a name="faking-the-redirect"></a>
Sau khi người dùng được redirect về route callback xác thực của ứng dụng, bạn có thể lấy thông tin của họ bằng phương thức `user` của Socialite. Object người dùng được trả về cung cấp nhiều property và method để bạn lưu thông tin cần thiết vào database của mình.

```php
use Laravel\Socialite\Socialite;

test('user is redirected to github', function () {
    Socialite::fake('github');

    $response = $this->get('/auth/github/redirect');

    $response->assertRedirect();
});
```

<a name="faking-the-callback"></a>

#### Fake Callback

Để kiểm thử callback route, hãy gọi `fake` và truyền instance `User` sẽ được trả về khi ứng dụng yêu cầu thông tin người dùng từ provider. Instance `User` có thể được tạo bằng phương thức `fake`:

```php
use Laravel\Socialite\Socialite;
use Laravel\Socialite\Two\User;

test('user can login with github', function () {
    Socialite::fake('github', User::fake([
        'id' => 'github-123',
        'name' => 'Jason Beggs',
        'email' => 'jason@example.com',
    ]));

    $response = $this->get('/auth/github/callback');

    $response->assertRedirect('/dashboard');

    $this->assertDatabaseHas('users', [
        'name' => 'Jason Beggs',
        'email' => 'jason@example.com',
        'github_id' => 'github-123',
    ]);
});
```

Nếu đã có access token hợp lệ của người dùng, bạn có thể lấy thông tin bằng phương thức `userFromToken` của Socialite:

```php
$fakeUser = User::fake([
    'id' => 'github-123',
    'name' => 'Jason Beggs',
    'email' => 'jason@example.com',
    'token' => 'fake-token',
    'refreshToken' => 'fake-refresh-token',
    'expiresIn' => 3600,
    'approvedScopes' => ['read', 'write'],
]);
```

Nếu dùng Facebook Limited Login trong ứng dụng iOS, Facebook trả về OIDC token thay vì access token. Để lấy thông tin người dùng từ OIDC token, hãy truyền nonce dùng khi khởi tạo login vào `userFromToken`:
Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/socialite). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
