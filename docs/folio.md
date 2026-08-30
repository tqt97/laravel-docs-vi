# Laravel Folio

<a name="introduction"></a>
## Giới thiệu
[Laravel Folio](https://github.com/laravel/folio) là page-based router mạnh mẽ được thiết kế để đơn giản hóa routing trong ứng dụng Laravel. Với Folio, việc tạo route gần như chỉ đơn giản là tạo một Blade template trong thư mục `resources/views/pages` của ứng dụng.
Ví dụ, để tạo trang truy cập tại URL `/greeting`, bạn chỉ cần tạo file `greeting.blade.php` trong `resources/views/pages`:
```php
<div>
    Hello World
</div>
```

<a name="installation"></a>
## Cài đặt
Để bắt đầu, hãy cài Folio vào project bằng Composer:
```shell
composer require laravel/folio
```
Sau khi cài Folio, chạy command Artisan `folio:install`. Command này cài service provider của Folio vào ứng dụng. Service provider đăng ký directory mà Folio sẽ tìm route / page:
```shell
php artisan folio:install
```

<a name="page-paths-uris"></a>
### Page Path / URI
Mặc định, Folio phục vụ page từ `resources/views/pages`, nhưng bạn có thể tùy chỉnh các directory này trong phương thức `boot` của Folio service provider.
Ví dụ, đôi khi sẽ tiện hơn nếu một ứng dụng Laravel có nhiều Folio path. Bạn có thể muốn tách directory page dành cho khu vực "admin" khỏi directory page của phần còn lại của ứng dụng.
Có thể thực hiện bằng `Folio::path` và `Folio::uri`. Phương thức `path` đăng ký directory mà Folio scan để tìm page khi route HTTP request, còn `uri` chỉ định "base URI" cho directory đó:
```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages/guest'))->uri('/');

Folio::path(resource_path('views/pages/admin'))
    ->uri('/admin')
    ->middleware([
        '*' => [
            'auth',
            'verified',

            // ...
        ],
    ]);
```

<a name="subdomain-routing"></a>
### Routing theo Subdomain
Bạn cũng có thể route tới page dựa trên subdomain của request. Ví dụ, request từ `admin.example.com` có thể được đưa tới directory page khác với phần còn lại của Folio page. Hãy gọi `domain` sau `Folio::path`:
```php
use Laravel\Folio\Folio;

Folio::domain('admin.example.com')
    ->path(resource_path('views/pages/admin'));
```
Phương thức `domain` còn cho phép capture một phần domain hoặc subdomain làm parameter. Các parameter này sẽ được inject vào page template:
```php
use Laravel\Folio\Folio;

Folio::domain('{account}.example.com')
    ->path(resource_path('views/pages/admin'));
```

<a name="creating-routes"></a>
## Tạo Route
Bạn tạo Folio route bằng cách đặt Blade template trong một directory đã được Folio mount. Mặc định Folio mount `resources/views/pages`, nhưng có thể tùy chỉnh trong phương thức `boot` của service provider.
Ngay khi Blade template được đặt trong Folio directory, bạn có thể truy cập nó từ browser. Ví dụ, page `pages/schedule.blade.php` có thể được truy cập tại `http://example.com/schedule`.
Để nhanh chóng xem danh sách toàn bộ Folio page / route, hãy chạy command Artisan `folio:list`:
```shell
php artisan folio:list
```

<a name="nested-routes"></a>
### Nested Routes
Bạn có thể tạo nested route bằng cách tạo một hoặc nhiều directory bên trong Folio directory. Ví dụ, để tạo page tại `/user/profile`, hãy tạo template `profile.blade.php` trong `pages/user`:
```shell
php artisan folio:page user/profile

# pages/user/profile.blade.php → /user/profile
```

<a name="index-routes"></a>
### Index Routes
Đôi khi bạn muốn một page đóng vai trò "index" của directory. Khi đặt template `index.blade.php` trong Folio directory, mọi request tới root của directory đó sẽ được route tới page này:
```shell
php artisan folio:page index
# pages/index.blade.php → /

php artisan folio:page users/index
# pages/users/index.blade.php → /users
```

<a name="route-parameters"></a>
## Route Parameters
Bạn thường cần lấy segment từ URL request và inject vào page để sử dụng. Ví dụ, cần lấy "ID" của user đang được hiển thị profile. Để làm vậy, hãy đặt một segment trong tên file page vào dấu ngoặc vuông:
```shell
php artisan folio:page "users/[id]"

# pages/users/[id].blade.php → /users/1
```
Segment đã capture có thể được truy cập như variable trong Blade template:
```html
<div>
    User {{ $id }}
</div>
```
Để capture nhiều segment, thêm ba dấu chấm `...` trước segment trong ngoặc:
```shell
php artisan folio:page "users/[...ids]"

# pages/users/[...ids].blade.php → /users/1/2/3
```
Khi capture nhiều segment, các segment đó sẽ được inject vào page dưới dạng array:
```html
<ul>
    @foreach ($ids as $id)
        <li>User {{ $id }}</li>
    @endforeach
</ul>
```

<a name="route-model-binding"></a>
## Route Model Binding
Nếu wildcard segment trong tên file page tương ứng với một Eloquent model của ứng dụng, Folio tự động tận dụng route model binding của Laravel và cố resolve rồi inject model instance vào page:
```shell
php artisan folio:page "users/[User]"

# pages/users/[User].blade.php → /users/1
```
Model đã capture có thể được truy cập như variable trong Blade template. Tên variable của model sẽ được chuyển sang "camel case":
```html
<div>
    User {{ $user->id }}
</div>
```
#### Tùy chỉnh Key
Đôi khi bạn muốn resolve Eloquent model bằng column khác `id`. Hãy chỉ định column trong tên file page. Ví dụ, file `[Post:slug].blade.php` sẽ resolve model qua column `slug` thay vì `id`.
Trên Windows, hãy dùng `-` để phân tách tên model và key: `[Post-slug].blade.php`.
#### Vị trí Model
Mặc định Folio tìm model trong directory `app/Models`. Nếu cần, bạn có thể chỉ định fully-qualified model class name trong tên file template:
```shell
php artisan folio:page "users/[.App.Models.User]"

# pages/users/[.App.Models.User].blade.php → /users/1
```

<a name="soft-deleted-models"></a>
### Soft Deleted Models
Mặc định, model đã soft delete không được lấy khi resolve implicit model binding. Nếu muốn, bạn có thể yêu cầu Folio lấy cả soft deleted model bằng function `withTrashed` trong page template:
```php
<?php

use function Laravel\Folio\{withTrashed};

withTrashed();

?>

<div>
    User {{ $user->id }}
</div>
```

<a name="render-hooks"></a>
## Render Hooks
Mặc định Folio trả nội dung Blade template của page làm response cho request. Tuy nhiên, bạn có thể tùy chỉnh response bằng function `render` bên trong page template.
Function `render` nhận closure, closure này nhận instance `View` mà Folio đang render, cho phép thêm data vào view hoặc tùy chỉnh toàn bộ response. Ngoài `View`, các route parameter hoặc model binding bổ sung cũng được truyền vào closure `render`:
```php
<?php

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

use function Laravel\Folio\render;

render(function (View $view, Post $post) {
    if (! Auth::user()->can('view', $post)) {
        return response('Unauthorized', 403);
    }

    return $view->with('photos', $post->author->photos);
}); ?>

<div>
    {{ $post->content }}
</div>

<div>
    This author has also taken {{ count($photos) }} photos.
</div>
```

<a name="named-routes"></a>
## Named Routes
Bạn có thể đặt tên cho route của một page bằng function `name`:
```php
<?php

use function Laravel\Folio\name;

name('users.index');
```
Tương tự named route Laravel, bạn có thể dùng function `route` để tạo URL tới Folio page đã được gán tên:
```php
<a href="{{ route('users.index') }}">
    All Users
</a>
```
Nếu page có parameter, chỉ cần truyền value tương ứng cho function `route`:
```php
route('users.show', ['user' => $user]);
```

<a name="middleware"></a>
## Middleware
Bạn có thể áp middleware cho một page cụ thể bằng function `middleware` trong page template:
```php
<?php

use function Laravel\Folio\{middleware};

middleware(['auth', 'verified']);

?>

<div>
    Dashboard
</div>
```
Hoặc để gán middleware cho một nhóm page, chain method `middleware` sau `Folio::path`.
Để chỉ định page nào được áp middleware, array middleware có thể được đánh key bằng URL pattern tương ứng. Ký tự `*` có thể được dùng làm wildcard:
```php
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        // ...
    ],
]);
```
Bạn có thể đưa closure vào array middleware để định nghĩa anonymous middleware inline:
```php
use Closure;
use Illuminate\Http\Request;
use Laravel\Folio\Folio;

Folio::path(resource_path('views/pages'))->middleware([
    'admin/*' => [
        'auth',
        'verified',

        function (Request $request, Closure $next) {
            // ...

            return $next($request);
        },
    ],
]);
```

<a name="route-caching"></a>
## Route Caching
Khi dùng Folio, bạn nên tận dụng [route caching của Laravel](/docs/{{version}}/routing#route-caching). Folio lắng nghe command Artisan `route:cache` để đảm bảo định nghĩa page và route name của Folio được cache đúng cách, đạt hiệu năng tốt nhất.
