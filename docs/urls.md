# Tạo URL

<a name="introduction"></a>
## Giới thiệu

Laravel cung cấp một số helper hỗ trợ tạo URL cho ứng dụng. Các helper này đặc biệt hữu ích khi tạo liên kết trong template và API response, hoặc khi tạo redirect response tới một phần khác của ứng dụng.

<a name="the-basics"></a>
## Kiến thức cơ bản

<a name="generating-urls"></a>
### Tạo URL

Helper `url` có thể được dùng để tạo URL bất kỳ cho ứng dụng. URL được tạo sẽ tự động sử dụng scheme (HTTP hoặc HTTPS) và host của request hiện tại mà ứng dụng đang xử lý:

```php
$post = App\Models\Post::find(1);

echo url("/posts/{$post->id}");

// http://example.com/posts/1
```

Để tạo URL có query string parameter, bạn có thể sử dụng phương thức `query`:

```php
echo url()->query('/posts', ['search' => 'Laravel']);

// https://example.com/posts?search=Laravel

echo url()->query('/posts?sort=latest', ['search' => 'Laravel']);

// http://example.com/posts?sort=latest&search=Laravel
```

Nếu query string parameter đã tồn tại trong path, giá trị mới được cung cấp sẽ ghi đè giá trị hiện có:

```php
echo url()->query('/posts?sort=latest', ['sort' => 'oldest']);

// http://example.com/posts?sort=oldest
```

Bạn cũng có thể truyền array làm query parameter. Các giá trị này sẽ được đánh key và encode chính xác trong URL được tạo:

```php
echo $url = url()->query('/posts', ['columns' => ['title', 'body']]);

// http://example.com/posts?columns%5B0%5D=title&columns%5B1%5D=body

echo urldecode($url);

// http://example.com/posts?columns[0]=title&columns[1]=body
```

<a name="accessing-the-current-url"></a>
### Truy cập URL hiện tại

Nếu không truyền path cho helper `url`, Laravel sẽ trả về instance `Illuminate\Routing\UrlGenerator`, cho phép bạn truy cập thông tin về URL hiện tại:

```php
// Get the current URL without the query string...
echo url()->current();

// Get the current URL including the query string...
echo url()->full();
```

Mỗi phương thức này cũng có thể được truy cập thông qua [facade](/facades) `URL`:

```php
use Illuminate\Support\Facades\URL;

echo URL::current();
```

<a name="accessing-the-previous-url"></a>
#### Truy cập URL trước đó

Đôi khi bạn cần biết URL trước đó mà người dùng đã truy cập. Bạn có thể lấy URL này thông qua các phương thức `previous` và `previousPath` của helper `url`:

```php
// Get the full URL for the previous request...
echo url()->previous();

// Get the path for the previous request...
echo url()->previousPath();
```

Hoặc thông qua [session](/session), bạn có thể lấy URL trước đó dưới dạng instance [fluent URI](#fluent-uri-objects):

```php
use Illuminate\Http\Request;

Route::post('/users', function (Request $request) {
    $previousUri = $request->session()->previousUri();

    // ...
});
```

Bạn cũng có thể lấy tên route của URL đã truy cập trước đó thông qua session:

```php
$previousRoute = $request->session()->previousRoute();
```

<a name="urls-for-named-routes"></a>
## URL cho named route

Helper `route` có thể được dùng để tạo URL tới [named route](/routing#named-routes). Named route cho phép tạo URL mà không phụ thuộc trực tiếp vào URL thực tế được định nghĩa trên route. Vì vậy, nếu URL của route thay đổi, các lời gọi tới hàm `route` không cần thay đổi. Ví dụ, giả sử ứng dụng có route sau:

```php
Route::get('/post/{post}', function (Post $post) {
    // ...
})->name('post.show');
```

Để tạo URL tới route này, bạn có thể dùng helper `route` như sau:

```php
echo route('post.show', ['post' => 1]);

// http://example.com/post/1
```

Tất nhiên, helper `route` cũng có thể tạo URL cho route có nhiều parameter:

```php
Route::get('/post/{post}/comment/{comment}', function (Post $post, Comment $comment) {
    // ...
})->name('comment.show');

echo route('comment.show', ['post' => 1, 'comment' => 3]);

// http://example.com/post/1/comment/3
```

Mọi phần tử bổ sung trong array không tương ứng với parameter trong định nghĩa route sẽ được thêm vào query string của URL:

```php
echo route('post.show', ['post' => 1, 'search' => 'rocket']);

// http://example.com/post/1?search=rocket
```

<a name="eloquent-models"></a>
#### Eloquent Model

Bạn thường sẽ tạo URL bằng route key (thường là primary key) của [Eloquent model](/eloquent). Vì vậy, bạn có thể truyền trực tiếp Eloquent model làm giá trị parameter. Helper `route` sẽ tự động lấy route key của model:

```php
echo route('post.show', ['post' => $post]);
```

<a name="signed-urls"></a>
## Signed URL

Laravel cho phép dễ dàng tạo "signed" URL tới named route. Các URL này có hash "signature" được thêm vào query string, nhờ đó Laravel có thể xác minh URL chưa bị thay đổi kể từ khi được tạo. Signed URL đặc biệt hữu ích cho route có thể truy cập công khai nhưng vẫn cần một lớp bảo vệ chống chỉnh sửa URL.

Ví dụ, bạn có thể dùng signed URL để triển khai liên kết "unsubscribe" công khai được gửi qua email cho khách hàng. Để tạo signed URL tới named route, hãy sử dụng phương thức `signedRoute` của facade `URL`:

```php
use Illuminate\Support\Facades\URL;

return URL::signedRoute('unsubscribe', ['user' => 1]);
```

Bạn có thể loại domain khỏi hash của signed URL bằng cách truyền argument `absolute` cho phương thức `signedRoute`:

```php
return URL::signedRoute('unsubscribe', ['user' => 1], absolute: false);
```

Nếu muốn tạo signed route URL tạm thời và hết hạn sau một khoảng thời gian xác định, bạn có thể dùng phương thức `temporarySignedRoute`. Khi Laravel xác thực URL signed tạm thời, framework sẽ đảm bảo timestamp hết hạn được encode trong URL chưa trôi qua:

```php
use Illuminate\Support\Facades\URL;

return URL::temporarySignedRoute(
    'unsubscribe', now()->plus(minutes: 30), ['user' => 1]
);
```

<a name="validating-signed-route-requests"></a>
### Xác thực request của signed route

Để xác minh request gửi đến có signature hợp lệ, hãy gọi phương thức `hasValidSignature` trên instance `Illuminate\Http\Request` của request:

```php
use Illuminate\Http\Request;

Route::get('/unsubscribe/{user}', function (Request $request) {
    if (! $request->hasValidSignature()) {
        abort(401);
    }

    // ...
})->name('unsubscribe');
```

Đôi khi frontend của ứng dụng cần thêm dữ liệu vào signed URL, chẳng hạn khi thực hiện pagination phía client. Vì vậy, bạn có thể chỉ định các query parameter cần bỏ qua khi xác thực signed URL bằng phương thức `hasValidSignatureWhileIgnoring`. Lưu ý rằng việc bỏ qua parameter đồng nghĩa bất kỳ ai cũng có thể thay đổi các parameter đó trên request:

```php
if (! $request->hasValidSignatureWhileIgnoring(['page', 'order'])) {
    abort(401);
}
```

Thay vì xác thực signed URL trực tiếp trên request instance, bạn có thể gán [middleware](/middleware) `signed` (`Illuminate\Routing\Middleware\ValidateSignature`) cho route. Nếu request gửi đến không có signature hợp lệ, middleware sẽ tự động trả về HTTP response `403`:

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed');
```

Nếu signed URL không bao gồm domain trong URL hash, hãy truyền argument `relative` cho middleware:

```php
Route::post('/unsubscribe/{user}', function (Request $request) {
    // ...
})->name('unsubscribe')->middleware('signed:relative');
```

<a name="responding-to-invalid-signed-routes"></a>
### Phản hồi khi signed route không hợp lệ

Khi người dùng truy cập một signed URL đã hết hạn, họ sẽ nhận trang lỗi chung cho HTTP status code `403`. Tuy nhiên, bạn có thể tùy chỉnh hành vi này bằng cách định nghĩa closure `render` tùy chỉnh cho exception `InvalidSignatureException` trong file `bootstrap/app.php` của ứng dụng:

```php
use Illuminate\Routing\Exceptions\InvalidSignatureException;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (InvalidSignatureException $e) {
        return response()->view('errors.link-expired', status: 403);
    });
})
```

<a name="urls-for-controller-actions"></a>
## URL cho controller action

Hàm `action` tạo URL cho controller action được chỉ định:

```php
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

Nếu controller method nhận route parameter, bạn có thể truyền associative array chứa các route parameter làm argument thứ hai của hàm:

```php
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="fluent-uri-objects"></a>
## Fluent URI Object

Class `Uri` của Laravel cung cấp interface thuận tiện và fluent để tạo cũng như thao tác URI thông qua object. Class này bao bọc chức năng do package League URI bên dưới cung cấp và tích hợp liền mạch với hệ thống routing của Laravel.

Bạn có thể dễ dàng tạo instance `Uri` bằng các static method:

```php
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvokableController;
use Illuminate\Support\Uri;

// Generate a URI instance from the given string...
$uri = Uri::of('https://example.com/path');

// Generate URI instances to paths, named routes, or controller actions...
$uri = Uri::to('/dashboard');
$uri = Uri::route('users.show', ['user' => 1]);
$uri = Uri::signedRoute('users.show', ['user' => 1]);
$uri = Uri::temporarySignedRoute('user.index', now()->plus(minutes: 5));
$uri = Uri::action([UserController::class, 'index']);
$uri = Uri::action(InvokableController::class);

// Generate a URI instance from the current request URL...
$uri = $request->uri();

// Generate a URI instance from the previous request URL...
$uri = $request->session()->previousUri();
```

Sau khi có URI instance, bạn có thể chain method để thay đổi URI:

```php
$uri = Uri::of('https://example.com')
    ->withScheme('http')
    ->withHost('test.com')
    ->withPort(8000)
    ->withPath('/users')
    ->withQuery(['page' => 2])
    ->withFragment('section-1');
```

Để tìm hiểu thêm về fluent URI object, hãy xem [tài liệu URI](/helpers#uri).

<a name="default-values"></a>
## Giá trị mặc định

Với một số ứng dụng, bạn có thể muốn chỉ định giá trị mặc định trên toàn request cho một số URL parameter. Ví dụ, giả sử nhiều route định nghĩa parameter `{locale}`:

```php
Route::get('/{locale}/posts', function () {
    // ...
})->name('post.index');
```

Việc luôn phải truyền `locale` mỗi khi gọi helper `route` khá bất tiện. Vì vậy, bạn có thể sử dụng phương thức `URL::defaults` để định nghĩa giá trị mặc định cho parameter này và giá trị đó sẽ luôn được áp dụng trong request hiện tại. Bạn có thể gọi phương thức này từ [route middleware](/middleware#assigning-middleware-to-routes) để có quyền truy cập request hiện tại:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class SetDefaultLocaleForUrls
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        URL::defaults(['locale' => $request->user()->locale]);

        return $next($request);
    }
}
```

Sau khi đã đặt giá trị mặc định cho parameter `locale`, bạn không còn phải truyền giá trị này khi tạo URL thông qua helper `route`.

<a name="url-defaults-middleware-priority"></a>
### Giá trị URL mặc định và độ ưu tiên middleware

Việc đặt giá trị URL mặc định có thể ảnh hưởng đến cách Laravel xử lý implicit model binding. Vì vậy, bạn nên [ưu tiên middleware](/middleware#sorting-middleware) thiết lập URL mặc định để middleware đó chạy trước middleware `SubstituteBindings` của Laravel.

Bạn có thể thực hiện điều này bằng phương thức middleware `priority` trong file `bootstrap/app.php` của ứng dụng:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->prependToPriorityList(
        before: \Illuminate\Routing\Middleware\SubstituteBindings::class,
        prepend: \App\Http\Middleware\SetDefaultLocaleForUrls::class,
    );
})
```
