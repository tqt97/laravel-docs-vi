# Định tuyến

<a name="basic-routing"></a>
## Định tuyến cơ bản

Route cơ bản nhất trong Laravel nhận một URI và một closure, cung cấp cách rất đơn giản và rõ ràng để định nghĩa route cũng như hành vi của route mà không cần các file cấu hình định tuyến phức tạp:

```php
use Illuminate\Support\Facades\Route;

Route::get('/greeting', function () {
    return 'Hello World';
});
```

<a name="the-default-route-files"></a>
### Các file route mặc định

Tất cả route của Laravel được định nghĩa trong các file route nằm trong thư mục `routes`. Laravel tự động nạp các file này dựa trên cấu hình được khai báo trong file `bootstrap/app.php` của ứng dụng. File `routes/web.php` định nghĩa các route dành cho giao diện web. Những route này được gán [nhóm middleware](/docs/{{version}}/middleware#laravels-default-middleware-groups) `web`, cung cấp các tính năng như trạng thái session và bảo vệ CSRF.

Với phần lớn ứng dụng, bạn sẽ bắt đầu bằng việc định nghĩa route trong file `routes/web.php`. Có thể truy cập các route được định nghĩa tại đây bằng cách nhập URL tương ứng vào trình duyệt. Ví dụ, route sau có thể được truy cập tại `http://example.com/user`:

```php
use App\Http\Controllers\UserController;

Route::get('/user', [UserController::class, 'index']);
```

<a name="api-routes"></a>
#### API Route

Nếu ứng dụng cũng cung cấp API stateless, bạn có thể bật định tuyến API bằng lệnh Artisan `install:api`:

```shell
php artisan install:api
```

Lệnh `install:api` cài đặt [Laravel Sanctum](/docs/{{version}}/sanctum), cung cấp một authentication guard dựa trên API token vừa mạnh mẽ vừa đơn giản, có thể dùng để xác thực các client API bên thứ ba, SPA hoặc ứng dụng di động. Đồng thời, lệnh `install:api` cũng tạo file `routes/api.php`:

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

Tất nhiên, với những route cần được truy cập công khai, bạn có thể không sử dụng middleware `auth:sanctum`.

Các route trong `routes/api.php` là stateless và được gán vào [nhóm middleware](/docs/{{version}}/middleware#laravels-default-middleware-groups) `api`. Ngoài ra, tiền tố URI `/api` được tự động áp dụng cho các route này, vì vậy bạn không cần thêm thủ công vào từng route trong file. Có thể thay đổi tiền tố bằng cách chỉnh file `bootstrap/app.php` của ứng dụng:

```php
->withRouting(
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api/admin',
    // ...
)
```

<a name="available-router-methods"></a>
#### Các method định tuyến khả dụng

Router cho phép đăng ký route phản hồi bất kỳ HTTP verb nào:

```php
Route::get($uri, $callback);
Route::post($uri, $callback);
Route::put($uri, $callback);
Route::patch($uri, $callback);
Route::delete($uri, $callback);
Route::options($uri, $callback);
```

Đôi khi bạn cần đăng ký một route phản hồi nhiều HTTP verb. Có thể thực hiện bằng method `match`. Hoặc dùng method `any` để đăng ký route phản hồi tất cả HTTP verb:

```php
Route::match(['get', 'post'], '/', function () {
    // ...
});

Route::any('/', function () {
    // ...
});
```

> [!NOTE]
> Khi định nghĩa nhiều route dùng chung một URI, các route sử dụng `get`, `post`, `put`, `patch`, `delete` và `options` nên được khai báo trước các route dùng `any`, `match` và `redirect`. Điều này bảo đảm request đi vào được khớp với đúng route.

<a name="dependency-injection"></a>
#### Dependency Injection

Bạn có thể type-hint bất kỳ dependency nào mà route cần ngay trong signature của callback. Các dependency đã khai báo sẽ được [service container](/docs/{{version}}/container) của Laravel tự động resolve và inject vào callback. Ví dụ, có thể type-hint class `Illuminate\Http\Request` để HTTP request hiện tại được tự động inject vào callback của route:

```php
use Illuminate\Http\Request;

Route::get('/users', function (Request $request) {
    // ...
});
```

<a name="csrf-protection"></a>
#### Bảo vệ CSRF

Hãy nhớ rằng mọi HTML form gửi tới route `POST`, `PUT`, `PATCH` hoặc `DELETE` được định nghĩa trong file route `web` đều cần chứa trường CSRF token. Nếu không, request sẽ bị từ chối. Bạn có thể tìm hiểu thêm trong [tài liệu CSRF](/docs/{{version}}/csrf):

```blade
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

<a name="redirect-routes"></a>
### Route chuyển hướng

Nếu cần định nghĩa một route chuyển hướng sang URI khác, bạn có thể dùng method `Route::redirect`. Đây là cách viết tắt tiện lợi, giúp không phải định nghĩa đầy đủ một route hoặc controller chỉ để thực hiện chuyển hướng đơn giản:

```php
Route::redirect('/here', '/there');
```

Mặc định, `Route::redirect` trả về status code `302`. Bạn có thể tùy chỉnh status code bằng tham số thứ ba tùy chọn:

```php
Route::redirect('/here', '/there', 301);
```

Hoặc có thể dùng `Route::permanentRedirect` để trả về status code `301`:

```php
Route::permanentRedirect('/here', '/there');
```

> [!WARNING]
> Khi sử dụng tham số route trong redirect route, Laravel dành riêng các tên sau và bạn không thể sử dụng chúng: `destination` và `status`.

<a name="view-routes"></a>
### Route trả về view

Nếu route chỉ cần trả về một [view](/docs/{{version}}/views), bạn có thể dùng method `Route::view`. Tương tự `redirect`, method này là cách viết tắt giúp bạn không phải định nghĩa đầy đủ route hoặc controller. `view` nhận URI làm đối số thứ nhất và tên view làm đối số thứ hai. Ngoài ra, bạn có thể truyền một mảng dữ liệu cho view thông qua đối số thứ ba tùy chọn:

```php
Route::view('/welcome', 'welcome');

Route::view('/welcome', 'welcome', ['name' => 'Taylor']);
```

> [!WARNING]
> Khi sử dụng tham số route trong view route, Laravel dành riêng các tên sau và bạn không thể sử dụng chúng: `view`, `data`, `status` và `headers`.

<a name="listing-your-routes"></a>
### Liệt kê các route

Lệnh Artisan `route:list` giúp bạn nhanh chóng xem tổng quan tất cả route đã được định nghĩa trong ứng dụng:

```shell
php artisan route:list
```

Mặc định, middleware được gán cho từng route sẽ không hiển thị trong kết quả của `route:list`. Tuy nhiên, bạn có thể yêu cầu Laravel hiển thị middleware của route và tên các middleware group bằng cách thêm tùy chọn `-v`:

```shell
php artisan route:list -v

# Expand middleware groups...
php artisan route:list -vv
```

Bạn cũng có thể yêu cầu Laravel chỉ hiển thị các route bắt đầu bằng một URI nhất định:

```shell
php artisan route:list --path=api
```

Ngoài ra, bạn có thể ẩn các route do package bên thứ ba định nghĩa bằng tùy chọn `--except-vendor` khi chạy `route:list`:

```shell
php artisan route:list --except-vendor
```

Tương tự, bạn có thể chỉ hiển thị các route do package bên thứ ba định nghĩa bằng tùy chọn `--only-vendor` khi chạy `route:list`:

```shell
php artisan route:list --only-vendor
```

<a name="routing-customization"></a>
### Tùy chỉnh định tuyến

Mặc định, các route của ứng dụng được cấu hình và nạp bởi file `bootstrap/app.php`:

```php
<?php

use Illuminate\Foundation\Application;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )->create();
```

Tuy nhiên, đôi khi bạn có thể muốn tạo một file hoàn toàn mới để chứa một nhóm route của ứng dụng. Khi đó, hãy truyền một closure `then` vào method `withRouting`. Bên trong closure này, bạn có thể đăng ký bất kỳ route bổ sung nào mà ứng dụng cần:

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
    then: function () {
        Route::middleware('api')
            ->prefix('webhooks')
            ->name('webhooks.')
            ->group(base_path('routes/webhooks.php'));
    },
)
```

Hoặc bạn có thể kiểm soát hoàn toàn việc đăng ký route bằng cách truyền closure `using` vào `withRouting`. Khi đối số này được cung cấp, framework sẽ không tự đăng ký bất kỳ HTTP route nào và bạn phải tự đăng ký toàn bộ route:

```php
use Illuminate\Support\Facades\Route;

->withRouting(
    commands: __DIR__.'/../routes/console.php',
    using: function () {
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        Route::middleware('web')
            ->group(base_path('routes/web.php'));
    },
)
```

<a name="route-parameters"></a>
## Tham số route

<a name="required-parameters"></a>
### Tham số bắt buộc

Đôi khi bạn cần lấy một số segment của URI trong route. Ví dụ, bạn có thể cần lấy ID của người dùng từ URL. Bạn có thể thực hiện bằng cách định nghĩa tham số route:

```php
Route::get('/user/{id}', function (string $id) {
    return 'User '.$id;
});
```

Bạn có thể định nghĩa bao nhiêu tham số route tùy theo nhu cầu:

```php
Route::get('/posts/{post}/comments/{comment}', function (string $postId, string $commentId) {
    // ...
});
```

Tham số route luôn được đặt trong dấu ngoặc nhọn `{}` và nên gồm các ký tự chữ cái. Dấu gạch dưới (`_`) cũng được chấp nhận trong tên tham số. Các tham số route được inject vào callback / controller theo thứ tự xuất hiện; tên đối số trong callback / controller không ảnh hưởng đến việc ánh xạ.

<a name="parameters-and-dependency-injection"></a>
#### Tham số và Dependency Injection

Nếu route có dependency mà bạn muốn Laravel service container tự động inject vào callback, hãy khai báo các tham số route sau các dependency:

```php
use Illuminate\Http\Request;

Route::get('/user/{id}', function (Request $request, string $id) {
    return 'User '.$id;
});
```

<a name="parameters-optional-parameters"></a>
### Tham số tùy chọn

Đôi khi bạn cần định nghĩa một tham số route không phải lúc nào cũng xuất hiện trong URI. Hãy đặt dấu `?` sau tên tham số và đảm bảo biến tương ứng của route có giá trị mặc định:

```php
Route::get('/user/{name?}', function (?string $name = null) {
    return $name;
});

Route::get('/user/{name?}', function (?string $name = 'John') {
    return $name;
});
```

<a name="parameters-regular-expression-constraints"></a>
### Ràng buộc bằng biểu thức chính quy

Bạn có thể giới hạn định dạng của tham số route bằng method `where` trên route instance. Method `where` nhận tên tham số và một biểu thức chính quy mô tả ràng buộc của tham số đó:

```php
Route::get('/user/{name}', function (string $name) {
    // ...
})->where('name', '[A-Za-z]+');

Route::get('/user/{id}', function (string $id) {
    // ...
})->where('id', '[0-9]+');

Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->where(['id' => '[0-9]+', 'name' => '[a-z]+']);
```

Để thuận tiện, Laravel cung cấp các helper method cho một số mẫu biểu thức chính quy thường dùng, giúp bạn nhanh chóng thêm ràng buộc pattern cho route:

```php
Route::get('/user/{id}/{name}', function (string $id, string $name) {
    // ...
})->whereNumber('id')->whereAlpha('name');

Route::get('/user/{name}', function (string $name) {
    // ...
})->whereAlphaNumeric('name');

Route::get('/user/{id}', function (string $id) {
    // ...
})->whereUuid('id');

Route::get('/user/{id}', function (string $id) {
    // ...
})->whereUlid('id');

Route::get('/category/{category}', function (string $category) {
    // ...
})->whereIn('category', ['movie', 'song', 'painting']);

Route::get('/category/{category}', function (string $category) {
    // ...
})->whereIn('category', CategoryEnum::cases());
```

Nếu request đến không khớp với các ràng buộc pattern của route, Laravel sẽ trả về HTTP response 404.

<a name="parameters-global-constraints"></a>
#### Ràng buộc toàn cục

Nếu muốn một tham số route luôn bị ràng buộc bởi một biểu thức chính quy nhất định, bạn có thể dùng method `pattern`. Các pattern này nên được định nghĩa trong method `boot` của class `App\Providers\AppServiceProvider`:

```php
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::pattern('id', '[0-9]+');
}
```

Sau khi pattern được định nghĩa, nó sẽ tự động áp dụng cho mọi route sử dụng tên tham số đó:

```php
Route::get('/user/{id}', function (string $id) {
    // Only executed if {id} is numeric...
});
```

<a name="parameters-encoded-forward-slashes"></a>
#### Dấu gạch chéo đã mã hóa

Thành phần routing của Laravel cho phép mọi ký tự ngoại trừ `/` xuất hiện trong giá trị tham số route. Nếu muốn `/` là một phần của placeholder, bạn phải cho phép rõ ràng bằng biểu thức chính quy trong điều kiện `where`:

```php
Route::get('/search/{search}', function (string $search) {
    return $search;
})->where('search', '.*');
```

> [!WARNING]
> Dấu gạch chéo đã mã hóa chỉ được hỗ trợ trong segment cuối cùng của route.

<a name="named-routes"></a>
## Route có tên

Route có tên giúp tạo URL hoặc redirect đến một route cụ thể thuận tiện hơn. Bạn có thể đặt tên route bằng cách chain method `name` vào định nghĩa route:

```php
Route::get('/user/profile', function () {
    // ...
})->name('profile');
```

Bạn cũng có thể đặt tên route cho các action của controller:

```php
Route::get(
    '/user/profile',
    [UserProfileController::class, 'show']
)->name('profile');
```

> [!WARNING]
> Tên route phải luôn là duy nhất.

<a name="generating-urls-to-named-routes"></a>
#### Tạo URL đến route có tên

Sau khi đã đặt tên cho route, bạn có thể dùng tên đó để tạo URL hoặc redirect thông qua các helper `route` và `redirect` của Laravel:

```php
// Generating URLs...
$url = route('profile');

// Generating Redirects...
return redirect()->route('profile');

return to_route('profile');
```

Nếu route có tên định nghĩa tham số, bạn có thể truyền các tham số đó làm đối số thứ hai của hàm `route`. Laravel sẽ tự động chèn chúng vào đúng vị trí trong URL được tạo:

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1]);
```

Nếu truyền thêm tham số trong mảng, các cặp key / value bổ sung sẽ tự động được thêm vào query string của URL được tạo:

```php
Route::get('/user/{id}/profile', function (string $id) {
    // ...
})->name('profile');

$url = route('profile', ['id' => 1, 'photos' => 'yes']);

// http://example.com/user/1/profile?photos=yes
```

> [!NOTE]
> Đôi khi bạn có thể muốn chỉ định giá trị mặc định cho tham số URL trên toàn bộ request, chẳng hạn locale hiện tại. Khi đó, bạn có thể sử dụng [method URL::defaults](/docs/{{version}}/urls#default-values).

<a name="inspecting-the-current-route"></a>
#### Kiểm tra route hiện tại

Nếu muốn xác định request hiện tại có được định tuyến đến một route có tên cụ thể hay không, bạn có thể dùng method `named` trên Route instance. Ví dụ, bạn có thể kiểm tra tên route hiện tại từ route middleware:

```php
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Handle an incoming request.
 *
 * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
 */
public function handle(Request $request, Closure $next): Response
{
    if ($request->route()->named('profile')) {
        // ...
    }

    return $next($request);
}
```

<a name="route-groups"></a>
## Nhóm route

Nhóm route cho phép chia sẻ các thuộc tính của route, chẳng hạn middleware, cho nhiều route mà không cần khai báo lặp lại trên từng route.

Các group lồng nhau sẽ cố gắng "merge" thuộc tính với group cha một cách phù hợp. Middleware và điều kiện `where` được hợp nhất, còn tên và prefix được nối thêm. Dấu phân cách namespace và dấu gạch chéo trong URI prefix được tự động thêm khi cần.

<a name="route-group-middleware"></a>
### Middleware

Để gán [middleware](/docs/{{version}}/middleware) cho tất cả route trong một group, hãy dùng method `middleware` trước khi định nghĩa group. Middleware được thực thi theo thứ tự xuất hiện trong mảng:

```php
Route::middleware(['first', 'second'])->group(function () {
    Route::get('/', function () {
        // Uses first & second middleware...
    });

    Route::get('/user/profile', function () {
        // Uses first & second middleware...
    });
});
```

<a name="route-group-controllers"></a>
### Controller

Nếu một nhóm route đều sử dụng cùng một [controller](/docs/{{version}}/controllers), bạn có thể dùng method `controller` để xác định controller chung cho cả group. Sau đó, khi định nghĩa route, bạn chỉ cần chỉ định method của controller cần gọi:

```php
use App\Http\Controllers\OrderController;

Route::controller(OrderController::class)->group(function () {
    Route::get('/orders/{id}', 'show');
    Route::post('/orders', 'store');
});
```

<a name="route-group-subdomain-routing"></a>
### Định tuyến subdomain

Nhóm route cũng có thể dùng để xử lý định tuyến subdomain. Subdomain có thể nhận tham số route tương tự URI, cho phép bạn lấy một phần subdomain để sử dụng trong route hoặc controller. Bạn có thể chỉ định subdomain bằng method `domain` trước khi định nghĩa group:

```php
Route::domain('{account}.example.com')->group(function () {
    Route::get('/user/{id}', function (string $account, string $id) {
        // ...
    });
});
```

<a name="route-group-prefixes"></a>
### Prefix của route

Method `prefix` có thể thêm một URI prefix cho mọi route trong group. Ví dụ, bạn có thể thêm `admin` vào đầu tất cả URI của route trong group:

```php
Route::prefix('admin')->group(function () {
    Route::get('/users', function () {
        // Matches The "/admin/users" URL
    });
});
```

<a name="route-group-name-prefixes"></a>
### Prefix cho tên route

Method `name` có thể thêm một chuỗi prefix cho tên của mọi route trong group. Ví dụ, bạn có thể thêm `admin` vào đầu tên tất cả route. Chuỗi được nối chính xác như đã chỉ định, vì vậy cần cung cấp cả dấu `.` ở cuối prefix:

```php
Route::name('admin.')->group(function () {
    Route::get('/users', function () {
        // Route assigned name "admin.users"...
    })->name('users');
});
```

<a name="route-model-binding"></a>
## Route Model Binding

Khi truyền ID của model vào route hoặc controller action, thông thường bạn phải query database để lấy model tương ứng. Route Model Binding của Laravel cung cấp cách thuận tiện để tự động inject trực tiếp model instance vào route. Ví dụ, thay vì nhận ID người dùng, bạn có thể nhận toàn bộ `User` model instance tương ứng với ID đó.

<a name="implicit-binding"></a>
### Binding ngầm định

Laravel tự động resolve các Eloquent model trong route hoặc controller action khi tên biến được type-hint trùng với tên segment của route. Ví dụ:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
});
```

Vì biến `$user` được type-hint là Eloquent model `App\Models\User` và tên biến khớp với segment URI `{user}`, Laravel sẽ tự động inject model instance có ID tương ứng với giá trị trong URI của request. Nếu không tìm thấy model phù hợp trong database, Laravel tự động tạo HTTP response 404.

Implicit binding cũng hoạt động với controller method. Hãy lưu ý segment URI `{user}` khớp với biến `$user` trong controller và biến này có type-hint `App\Models\User`:

```php
use App\Http\Controllers\UserController;
use App\Models\User;

// Route definition...
Route::get('/users/{user}', [UserController::class, 'show']);

// Controller method definition...
public function show(User $user)
{
    return view('user.profile', ['user' => $user]);
}
```

<a name="implicit-soft-deleted-models"></a>
#### Model đã soft delete

Thông thường, implicit model binding sẽ không lấy các model đã được [soft delete](/docs/{{version}}/eloquent#soft-deleting). Tuy nhiên, bạn có thể yêu cầu implicit binding lấy cả các model này bằng cách chain method `withTrashed` vào định nghĩa route:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    return $user->email;
})->withTrashed();
```

<a name="customizing-the-default-key-name"></a>
#### Tùy chỉnh key

Đôi khi bạn muốn resolve Eloquent model bằng một column khác `id`. Khi đó, hãy chỉ định column ngay trong định nghĩa tham số route:

```php
use App\Models\Post;

Route::get('/posts/{post:slug}', function (Post $post) {
    return $post;
});
```

Nếu muốn model binding luôn sử dụng một database column khác `id` khi truy xuất một model class cụ thể, bạn có thể áp dụng attribute `RouteKey` cho Eloquent model:

```php
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Model;

#[RouteKey('slug')]
class Post extends Model
{
    // ...
}
```

<a name="implicit-model-binding-scoping"></a>
#### Custom key và scoping

Khi implicit binding nhiều Eloquent model trong cùng một route, bạn có thể muốn giới hạn model thứ hai để nó bắt buộc là model con của model trước đó. Ví dụ, route sau lấy một bài viết theo slug thuộc về một người dùng cụ thể:

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
});
```

Khi dùng implicit binding với custom key cho tham số route lồng nhau, Laravel sẽ tự động scope query để lấy model con thông qua model cha, đồng thời dùng convention để suy đoán tên relationship trên model cha. Trong trường hợp này, Laravel giả định model `User` có relationship tên `posts` (dạng số nhiều của tên tham số route) để truy xuất model `Post`.

Bạn cũng có thể yêu cầu Laravel scope các binding "con" ngay cả khi không cung cấp custom key bằng method `scopeBindings` khi định nghĩa route:

```php
use App\Models\Post;
use App\Models\User;

Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    return $post;
})->scopeBindings();
```

Hoặc bạn có thể yêu cầu toàn bộ một nhóm route sử dụng scoped binding:

```php
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
        return $post;
    });
});
```

Tương tự, bạn có thể yêu cầu Laravel không scope binding bằng method `withoutScopedBindings`:

```php
Route::get('/users/{user}/posts/{post:slug}', function (User $user, Post $post) {
    return $post;
})->withoutScopedBindings();
```

<a name="customizing-missing-model-behavior"></a>
#### Tùy chỉnh hành vi khi không tìm thấy model

Thông thường, Laravel tạo HTTP response 404 nếu không tìm thấy model được implicit binding. Tuy nhiên, bạn có thể tùy chỉnh hành vi này bằng method `missing` khi định nghĩa route. Method `missing` nhận một closure sẽ được gọi khi không tìm thấy model:

```php
use App\Http\Controllers\LocationsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::get('/locations/{location:slug}', [LocationsController::class, 'show'])
    ->name('locations.view')
    ->missing(function (Request $request) {
        return Redirect::route('locations.index');
    });
```

<a name="implicit-enum-binding"></a>
### Enum Binding ngầm định

PHP 8.1 bổ sung hỗ trợ [Enum](https://www.php.net/manual/en/language.enumerations.backed.php). Laravel hỗ trợ type-hint một [string-backed Enum](https://www.php.net/manual/en/language.enumerations.backed.php) trong định nghĩa route và chỉ thực thi route nếu segment tương ứng là một giá trị Enum hợp lệ. Nếu không, Laravel tự động trả về HTTP response 404. Ví dụ với Enum sau:

```php
<?php

namespace App\Enums;

enum Category: string
{
    case Fruits = 'fruits';
    case People = 'people';
}
```

Bạn có thể định nghĩa route chỉ được thực thi khi segment `{category}` là `fruits` hoặc `people`. Nếu không, Laravel sẽ trả về HTTP response 404:

```php
use App\Enums\Category;
use Illuminate\Support\Facades\Route;

Route::get('/categories/{category}', function (Category $category) {
    return $category->value;
});
```

<a name="explicit-binding"></a>
### Binding tường minh

Bạn không bắt buộc phải dùng cơ chế resolve model ngầm định theo convention của Laravel để sử dụng model binding. Bạn cũng có thể định nghĩa tường minh cách tham số route ánh xạ tới model. Để đăng ký explicit binding, dùng method `model` của router để chỉ định class cho một tham số. Các explicit model binding nên được khai báo ở đầu method `boot` của `AppServiceProvider`:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::model('user', User::class);
}
```

Tiếp theo, định nghĩa một route chứa tham số `{user}`:

```php
use App\Models\User;

Route::get('/users/{user}', function (User $user) {
    // ...
});
```

Vì mọi tham số `{user}` đã được bind với model `App\Models\User`, một instance của class đó sẽ được inject vào route. Ví dụ, request tới `users/1` sẽ inject `User` instance trong database có ID bằng `1`.

Nếu không tìm thấy model instance phù hợp trong database, Laravel sẽ tự động tạo HTTP response 404.

<a name="customizing-the-resolution-logic"></a>
#### Tùy chỉnh logic resolve

Nếu muốn tự định nghĩa logic resolve model binding, bạn có thể dùng `Route::bind`. Closure truyền vào `bind` nhận giá trị của URI segment và phải trả về instance của class cần inject vào route. Việc tùy chỉnh này cũng nên được thực hiện trong method `boot` của `AppServiceProvider`:

```php
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::bind('user', function (string $value) {
        return User::where('name', $value)->firstOrFail();
    });
}
```

Ngoài ra, bạn có thể override method `resolveRouteBinding` trên Eloquent model. Method này nhận giá trị URI segment và phải trả về instance của class cần inject vào route:

```php
/**
 * Retrieve the model for a bound value.
 *
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveRouteBinding($value, $field = null)
{
    return $this->where('name', $value)->firstOrFail();
}
```

Nếu route sử dụng [implicit binding scoping](#implicit-model-binding-scoping), method `resolveChildRouteBinding` sẽ được dùng để resolve binding con của model cha:

```php
/**
 * Retrieve the child model for a bound value.
 *
 * @param  string  $childType
 * @param  mixed  $value
 * @param  string|null  $field
 * @return \Illuminate\Database\Eloquent\Model|null
 */
public function resolveChildRouteBinding($childType, $value, $field)
{
    return parent::resolveChildRouteBinding($childType, $value, $field);
}
```

<a name="fallback-routes"></a>
## Fallback Route

Với method `Route::fallback`, bạn có thể định nghĩa một route được thực thi khi không có route nào khác khớp với request đến. Thông thường, request không được xử lý sẽ tự động render trang "404" thông qua exception handler của ứng dụng. Tuy nhiên, vì `fallback` route thường được định nghĩa trong `routes/web.php`, toàn bộ middleware thuộc group `web` sẽ áp dụng cho route này. Bạn có thể bổ sung middleware khác nếu cần:

```php
Route::fallback(function () {
    // ...
});
```

<a name="rate-limiting"></a>
## Giới hạn tần suất

<a name="defining-rate-limiters"></a>
### Định nghĩa Rate Limiter

Laravel cung cấp dịch vụ rate limiting mạnh mẽ và có thể tùy chỉnh để giới hạn lượng traffic tới một route hoặc nhóm route. Trước tiên, hãy định nghĩa cấu hình rate limiter phù hợp với nhu cầu của ứng dụng.

Rate limiter có thể được định nghĩa trong method `boot` của class `App\Providers\AppServiceProvider`:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });
}
```

Rate limiter được định nghĩa bằng method `for` của facade `RateLimiter`. Method `for` nhận tên rate limiter và một closure trả về cấu hình giới hạn áp dụng cho các route được gán limiter đó. Cấu hình giới hạn là instance của class `Illuminate\Cache\RateLimiting\Limit`. Class này cung cấp các builder method giúp định nghĩa giới hạn nhanh chóng. Tên rate limiter có thể là bất kỳ chuỗi nào:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(1000);
    });
}
```

Nếu request đến vượt quá rate limit đã chỉ định, Laravel tự động trả về response với HTTP status 429. Nếu muốn tùy chỉnh response khi vượt giới hạn, bạn có thể dùng method `response`:

```php
RateLimiter::for('global', function (Request $request) {
    return Limit::perMinute(1000)->response(function (Request $request, array $headers) {
        return response('Custom response...', 429, $headers);
    });
});
```

Vì callback của rate limiter nhận HTTP request instance hiện tại, bạn có thể xây dựng rate limit động dựa trên request hoặc người dùng đã xác thực:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()?->vipCustomer()
        ? Limit::none()
        : Limit::perHour(10);
});
```

<a name="segmenting-rate-limits"></a>
#### Phân đoạn Rate Limit

Đôi khi bạn muốn phân tách rate limit theo một giá trị bất kỳ. Ví dụ, cho phép truy cập một route tối đa 100 lần mỗi phút cho từng địa chỉ IP. Khi đó, hãy dùng method `by` khi xây dựng rate limit:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()->vipCustomer()
        ? Limit::none()
        : Limit::perMinute(100)->by($request->ip());
});
```

Ví dụ khác, ta có thể giới hạn route ở mức 100 lần mỗi phút cho từng ID người dùng đã xác thực hoặc 10 lần mỗi phút cho từng địa chỉ IP của guest:

```php
RateLimiter::for('uploads', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(100)->by($request->user()->id)
        : Limit::perMinute(10)->by($request->ip());
});
```

<a name="multiple-rate-limits"></a>
#### Nhiều Rate Limit

Nếu cần, bạn có thể trả về một mảng gồm nhiều rate limit cho cùng một cấu hình limiter. Mỗi giới hạn sẽ được đánh giá theo thứ tự xuất hiện trong mảng:

```php
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(500),
        Limit::perMinute(3)->by($request->input('email')),
    ];
});
```

Nếu gán nhiều rate limit được phân đoạn bằng các giá trị `by` giống nhau, hãy đảm bảo từng giá trị `by` là duy nhất. Cách đơn giản nhất là thêm prefix vào giá trị truyền cho method `by`:

```php
RateLimiter::for('uploads', function (Request $request) {
    return [
        Limit::perMinute(10)->by('minute:'.$request->user()->id),
        Limit::perDay(1000)->by('day:'.$request->user()->id),
    ];
});
```

<a name="response-base-rate-limiting"></a>
#### Rate Limiting dựa trên response

Ngoài việc giới hạn request đến, Laravel cho phép rate limit dựa trên response thông qua method `after`. Cách này hữu ích khi bạn chỉ muốn tính một số response nhất định vào giới hạn, chẳng hạn validation error, response 404 hoặc các HTTP status cụ thể khác.

Method `after` nhận một closure chứa response và phải trả về `true` nếu response đó cần được tính vào rate limit, hoặc `false` nếu bỏ qua. Điều này đặc biệt hữu ích để ngăn enumeration attack bằng cách giới hạn các response 404 liên tiếp, hoặc cho phép người dùng retry request thất bại validation mà không làm cạn rate limit trên endpoint chỉ nên throttle các thao tác thành công:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

RateLimiter::for('resource-not-found', function (Request $request) {
    return Limit::perMinute(10)
        ->by($request->user()?->id ?: $request->ip())
        ->after(function (Response $response) {
            // Only count 404 responses toward the rate limit to prevent enumeration...
            return $response->status() === 404;
        });
});
```

<a name="attaching-rate-limiters-to-routes"></a>
### Gắn Rate Limiter vào route

Rate limiter có thể được gắn vào route hoặc nhóm route bằng [middleware](/docs/{{version}}/middleware) `throttle`. Middleware này nhận tên rate limiter bạn muốn gán cho route:

```php
Route::middleware(['throttle:uploads'])->group(function () {
    Route::post('/audio', function () {
        // ...
    });

    Route::post('/video', function () {
        // ...
    });
});
```

<a name="throttling-with-redis"></a>
#### Throttling bằng Redis

Mặc định, middleware `throttle` được ánh xạ tới class `Illuminate\Routing\Middleware\ThrottleRequests`. Tuy nhiên, nếu ứng dụng sử dụng Redis làm cache driver, bạn có thể yêu cầu Laravel dùng Redis để quản lý rate limiting. Hãy gọi method `throttleWithRedis` trong `bootstrap/app.php`. Method này ánh xạ middleware `throttle` tới class `Illuminate\Routing\Middleware\ThrottleRequestsWithRedis`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->throttleWithRedis();
    // ...
})
```

<a name="form-method-spoofing"></a>
## Giả lập HTTP method cho form

HTML form không hỗ trợ trực tiếp các action `PUT`, `PATCH` hoặc `DELETE`. Vì vậy, khi route `PUT`, `PATCH` hoặc `DELETE` được gọi từ HTML form, bạn cần thêm field ẩn `_method`. Giá trị của field `_method` sẽ được Laravel sử dụng làm HTTP request method:

```blade
<form action="/example" method="POST">
    <input type="hidden" name="_method" value="PUT">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
</form>
```

Để thuận tiện, bạn có thể dùng [Blade directive](/docs/{{version}}/blade) `@method` để tạo input `_method`:

```blade
<form action="/example" method="POST">
    @method('PUT')
    @csrf
</form>
```

<a name="accessing-the-current-route"></a>
## Truy cập route hiện tại

Bạn có thể dùng các method `current`, `currentRouteName` và `currentRouteAction` trên facade `Route` để truy cập thông tin về route đang xử lý request hiện tại:

```php
use Illuminate\Support\Facades\Route;

$route = Route::current(); // Illuminate\Routing\Route
$name = Route::currentRouteName(); // string
$action = Route::currentRouteAction(); // string
```

Bạn có thể tham khảo tài liệu API của [class nền bên dưới facade Route](https://api.laravel.com/docs/{{version}}/Illuminate/Routing/Router.html) và [Route instance](https://api.laravel.com/docs/{{version}}/Illuminate/Routing/Route.html) để xem toàn bộ method có trên router và route class.

<a name="cors"></a>
## Cross-Origin Resource Sharing (CORS)

Laravel có thể tự động phản hồi các HTTP request CORS `OPTIONS` bằng các giá trị bạn cấu hình. Request `OPTIONS` được xử lý tự động bởi [middleware](/docs/{{version}}/middleware) `HandleCors`, vốn được đưa sẵn vào global middleware stack của ứng dụng.

Đôi khi bạn cần tùy chỉnh cấu hình CORS của ứng dụng. Bạn có thể publish file cấu hình `cors` bằng lệnh Artisan `config:publish`:

```shell
php artisan config:publish cors
```

Lệnh này sẽ tạo file cấu hình `cors.php` trong thư mục `config` của ứng dụng.

> [!NOTE]
> Để tìm hiểu thêm về CORS và các CORS header, hãy tham khảo [tài liệu CORS trên MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers).

<a name="route-caching"></a>
## Cache route

Khi deploy ứng dụng lên production, bạn nên tận dụng route cache của Laravel. Route cache giúp giảm đáng kể thời gian đăng ký toàn bộ route của ứng dụng. Để tạo route cache, hãy chạy lệnh Artisan `route:cache`:

```shell
php artisan route:cache
```

Sau khi chạy lệnh này, file route đã cache sẽ được nạp cho mọi request. Nếu thêm route mới, bạn cần tạo lại route cache. Vì vậy, chỉ nên chạy `route:cache` trong quá trình deployment của dự án.

Bạn có thể dùng lệnh `route:clear` để xóa route cache:

```shell
php artisan route:clear
```
