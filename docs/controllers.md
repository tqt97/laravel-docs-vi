# Controller

<a name="introduction"></a>
## Giới thiệu

Thay vì định nghĩa toàn bộ logic xử lý request dưới dạng closure trong các file route, bạn có thể tổ chức logic này bằng các lớp "controller". Controller cho phép gom những logic xử lý request có liên quan vào cùng một lớp. Ví dụ, lớp `UserController` có thể xử lý toàn bộ request liên quan đến người dùng, bao gồm hiển thị, tạo mới, cập nhật và xóa người dùng. Theo mặc định, các controller được lưu trong thư mục `app/Http/Controllers`.

<a name="writing-controllers"></a>
## Viết Controller

<a name="basic-controllers"></a>
### Controller cơ bản

Để tạo nhanh một controller mới, bạn có thể chạy lệnh Artisan `make:controller`. Theo mặc định, toàn bộ controller của ứng dụng được lưu trong thư mục `app/Http/Controllers`:

```shell
php artisan make:controller UserController
```

Hãy xem một ví dụ về controller cơ bản. Một controller có thể chứa nhiều phương thức `public`; mỗi phương thức có thể phản hồi các HTTP request gửi đến ứng dụng:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for a given user.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

Sau khi đã viết lớp controller và phương thức tương ứng, bạn có thể định nghĩa route trỏ đến phương thức controller như sau:

```php
use App\Http\Controllers\UserController;

Route::get('/user/{id}', [UserController::class, 'show']);
```

Khi một request gửi đến khớp với URI của route đã định nghĩa, phương thức `show` trên lớp `App\Http\Controllers\UserController` sẽ được gọi và các tham số của route sẽ được truyền vào phương thức này.

> [!NOTE]
> Controller **không bắt buộc** phải kế thừa một lớp cơ sở. Tuy nhiên, trong một số trường hợp, việc kế thừa một lớp controller cơ sở chứa các phương thức dùng chung cho tất cả controller sẽ thuận tiện hơn.

<a name="single-action-controllers"></a>
### Controller một hành động

Nếu một action của controller đặc biệt phức tạp, bạn có thể dành riêng toàn bộ một lớp controller cho action đó. Để thực hiện, hãy định nghĩa duy nhất phương thức `__invoke` trong controller:

```php
<?php

namespace App\Http\Controllers;

class ProvisionServer extends Controller
{
    /**
     * Provision a new web server.
     */
    public function __invoke()
    {
        // ...
    }
}
```

Khi đăng ký route cho controller một hành động, bạn không cần chỉ định phương thức controller. Thay vào đó, chỉ cần truyền tên lớp controller cho router:

```php
use App\Http\Controllers\ProvisionServer;

Route::post('/server', ProvisionServer::class);
```

Bạn có thể tạo một invokable controller bằng option `--invokable` của lệnh Artisan `make:controller`:

```shell
php artisan make:controller ProvisionServer --invokable
```

> [!NOTE]
> Bạn có thể tùy biến stub của controller thông qua [cơ chế publish stub](/artisan#stub-customization).

<a name="controller-middleware"></a>
## Middleware của Controller

[Middleware](/middleware) có thể được gán cho các route của controller ngay trong file route:

```php
Route::get('/profile', [UserController::class, 'show'])->middleware('auth');
```

Hoặc, bạn có thể khai báo middleware ngay trong lớp controller. Để làm vậy, controller cần implement interface `HasMiddleware`; interface này yêu cầu controller cung cấp phương thức static `middleware`. Phương thức này trả về một mảng middleware sẽ được áp dụng cho các action của controller:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UserController implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            'auth',
            new Middleware('log', only: ['index']),
            new Middleware('subscribed', except: ['store']),
        ];
    }

    // ...
}
```

Bạn cũng có thể định nghĩa middleware của controller bằng closure. Cách này hữu ích khi cần một middleware inline mà không phải tạo riêng cả một lớp middleware:

```php
use Closure;
use Illuminate\Http\Request;

/**
 * Get the middleware that should be assigned to the controller.
 */
public static function middleware(): array
{
    return [
        function (Request $request, Closure $next) {
            return $next($request);
        },
    ];
}
```

<a name="middleware-attributes"></a>
### Attribute Middleware

Bạn cũng có thể gán middleware cho controller bằng PHP attribute:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
#[Middleware('log', only: ['index'])]
#[Middleware('subscribed', except: ['store'])]
class UserController
{
    // ...
}
```

Middleware attribute cũng có thể được đặt trên từng phương thức controller. Middleware được gán ở cấp phương thức sẽ được hợp nhất với middleware được gán ở cấp lớp:

```php
<?php

namespace App\Http\Controllers;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
class UserController
{
    #[Middleware('log')]
    #[Middleware('subscribed')]
    public function index()
    {
        // ...
    }

    #[Middleware(static function (Request $request, Closure $next) {
        // ...

        return $next($request);
    })]
    public function store()
    {
        // ...
    }
}
```

Để loại middleware khỏi một controller hoặc khỏi từng phương thức cụ thể, hãy dùng attribute `WithoutMiddleware`. Bạn có thể dùng các đối số `only` và `except` để giới hạn attribute ở cấp lớp cho những phương thức controller nhất định:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureTokenIsValid;
use Illuminate\Routing\Attributes\Controllers\WithoutMiddleware;

#[WithoutMiddleware('subscribed', except: ['index'])]
class UserController
{
    #[WithoutMiddleware(EnsureTokenIsValid::class)]
    public function index()
    {
        // ...
    }

    public function show()
    {
        // ...
    }
}
```

Attribute `WithoutMiddleware` ở cấp lớp được các controller con kế thừa. Attribute này chỉ có thể loại bỏ route middleware và không áp dụng cho [global middleware](/middleware#global-middleware).

<a name="authorization-attributes"></a>
### Attribute phân quyền

Nếu bạn phân quyền các action của controller thông qua policy, có thể dùng attribute `Authorize` như một cách viết gọn thuận tiện cho middleware `can`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Routing\Attributes\Controllers\Authorize;

class CommentController
{
    #[Authorize('create', [Comment::class, 'post'])]
    public function store(Post $post)
    {
        // ...
    }

    #[Authorize('delete', 'comment')]
    public function destroy(Comment $comment)
    {
        // ...
    }
}
```

Đối số thứ nhất là ability cần kiểm tra quyền. Đối số thứ hai là lớp model, route parameter hoặc các tham số cần truyền vào policy.

<a name="resource-controllers"></a>
## Resource Controller

Nếu xem mỗi Eloquent model trong ứng dụng là một "resource", thông thường bạn sẽ thực hiện cùng một nhóm thao tác trên từng resource. Ví dụ, giả sử ứng dụng có model `Photo` và `Movie`; người dùng nhiều khả năng sẽ cần tạo, đọc, cập nhật hoặc xóa các resource này.

Vì đây là trường hợp sử dụng rất phổ biến, resource routing của Laravel cho phép ánh xạ các route tạo, đọc, cập nhật và xóa ("CRUD") điển hình vào một controller chỉ bằng một dòng code. Để bắt đầu, bạn có thể dùng option `--resource` của lệnh Artisan `make:controller` để nhanh chóng tạo controller xử lý các action này:

```shell
php artisan make:controller PhotoController --resource
```

Lệnh này sẽ tạo controller tại `app/Http/Controllers/PhotoController.php`. Controller sẽ chứa một phương thức tương ứng với từng thao tác resource có sẵn. Tiếp theo, bạn có thể đăng ký một resource route trỏ đến controller:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class);
```

Chỉ với một khai báo route này, Laravel sẽ tạo nhiều route để xử lý các thao tác khác nhau trên resource. Controller được tạo sẵn cũng đã có các phương thức khung tương ứng với từng action. Bạn luôn có thể xem nhanh toàn bộ route của ứng dụng bằng lệnh Artisan `route:list`.

Bạn cũng có thể đăng ký nhiều resource controller cùng lúc bằng cách truyền một mảng vào phương thức `resources`:

```php
Route::resources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

Phương thức `softDeletableResources` đăng ký nhiều resource controller và áp dụng `withTrashed` cho tất cả các resource đó:

```php
Route::softDeletableResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

<a name="actions-handled-by-resource-controllers"></a>
#### Các action được Resource Controller xử lý

<div class="overflow-auto">

| Verb      | URI                    | Action  | Route Name     |
| --------- | ---------------------- | ------- | -------------- |
| GET       | `/photos`              | index   | photos.index   |
| GET       | `/photos/create`       | create  | photos.create  |
| POST      | `/photos`              | store   | photos.store   |
| GET       | `/photos/{photo}`      | show    | photos.show    |
| GET       | `/photos/{photo}/edit` | edit    | photos.edit    |
| PUT/PATCH | `/photos/{photo}`      | update  | photos.update  |
| DELETE    | `/photos/{photo}`      | destroy | photos.destroy |

</div>

<a name="customizing-missing-model-behavior"></a>
#### Tùy chỉnh hành vi khi không tìm thấy Model

Thông thường, Laravel sẽ trả về HTTP response 404 nếu không tìm thấy resource model được bind ngầm định. Tuy nhiên, bạn có thể tùy chỉnh hành vi này bằng cách gọi phương thức `missing` khi định nghĩa resource route. Phương thức `missing` nhận một closure; closure này sẽ được gọi nếu Laravel không thể tìm thấy model được bind ngầm định cho bất kỳ route nào của resource:

```php
use App\Http\Controllers\PhotoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

Route::resource('photos', PhotoController::class)
    ->missing(function (Request $request) {
        return Redirect::route('photos.index');
    });
```

<a name="soft-deleted-models"></a>
#### Model đã Soft Delete

Theo mặc định, implicit model binding sẽ không truy xuất các model đã được [soft delete](/eloquent#soft-deleting) mà sẽ trả về HTTP response 404. Tuy nhiên, bạn có thể yêu cầu framework cho phép lấy cả model đã soft delete bằng cách gọi `withTrashed` khi định nghĩa resource route:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->withTrashed();
```

Gọi `withTrashed` mà không truyền đối số sẽ cho phép model đã soft delete trên các resource route `show`, `edit` và `update`. Bạn có thể giới hạn chỉ một số route bằng cách truyền một mảng vào `withTrashed`:

```php
Route::resource('photos', PhotoController::class)->withTrashed(['show']);
```

<a name="specifying-the-resource-model"></a>
#### Chỉ định Resource Model

Nếu đang sử dụng [route model binding](/routing#route-model-binding) và muốn các phương thức của resource controller type-hint một model instance, bạn có thể dùng option `--model` khi tạo controller:

```shell
php artisan make:controller PhotoController --model=Photo --resource
```

<a name="generating-form-requests"></a>
#### Tạo Form Request

Bạn có thể truyền option `--requests` khi tạo resource controller để yêu cầu Artisan tạo các [lớp form request](/validation#form-request-validation) cho phương thức lưu mới và cập nhật của controller:

```shell
php artisan make:controller PhotoController --model=Photo --resource --requests
```

<a name="restful-partial-resource-routes"></a>
### Resource Route một phần

Khi khai báo resource route, bạn có thể chỉ định một tập con các action mà controller cần xử lý thay vì sử dụng toàn bộ action mặc định:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->only([
    'index', 'show'
]);

Route::resource('photos', PhotoController::class)->except([
    'create', 'store', 'update', 'destroy'
]);
```

<a name="api-resource-routes"></a>
#### API Resource Route

Khi khai báo resource route dành cho API, thông thường bạn sẽ muốn loại bỏ các route dùng để hiển thị HTML template như `create` và `edit`. Laravel cung cấp phương thức `apiResource` để tự động loại hai route này:

```php
use App\Http\Controllers\PhotoController;

Route::apiResource('photos', PhotoController::class);
```

Bạn có thể đăng ký nhiều API resource controller cùng lúc bằng cách truyền một mảng vào phương thức `apiResources`:

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\PostController;

Route::apiResources([
    'photos' => PhotoController::class,
    'posts' => PostController::class,
]);
```

Để tạo nhanh một API resource controller không chứa các phương thức `create` hoặc `edit`, hãy dùng option `--api` khi chạy lệnh `make:controller`:

```shell
php artisan make:controller PhotoController --api
```

<a name="restful-nested-resources"></a>
### Resource lồng nhau

Đôi khi bạn cần định nghĩa route cho một resource lồng nhau. Ví dụ, một photo resource có thể có nhiều comment gắn với ảnh đó. Để lồng các resource controller, bạn có thể sử dụng ký pháp dấu chấm ("dot notation") trong khai báo route:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class);
```

Route này sẽ đăng ký một resource lồng nhau có thể được truy cập bằng URI như sau:

```text
/photos/{photo}/comments/{comment}
```

<a name="scoping-nested-resources"></a>
#### Giới hạn phạm vi Resource lồng nhau

Tính năng [implicit model binding](/routing#implicit-model-binding-scoping) của Laravel có thể tự động giới hạn phạm vi của binding lồng nhau, nhờ đó model con sau khi được resolve sẽ được xác nhận là thuộc model cha. Khi dùng phương thức `scoped` lúc định nghĩa nested resource, bạn vừa có thể bật cơ chế scoping tự động, vừa chỉ định field mà Laravel dùng để truy xuất resource con. Xem thêm phần [giới hạn phạm vi resource route](#restful-scoping-resource-routes).

<a name="shallow-nesting"></a>
#### Lồng nông (Shallow Nesting)

Trong nhiều trường hợp, URI không cần chứa đồng thời ID của resource cha và resource con vì ID của resource con vốn đã là định danh duy nhất. Khi dùng định danh duy nhất, chẳng hạn khóa chính tự tăng, để xác định model trong các segment của URI, bạn có thể sử dụng "shallow nesting":

```php
use App\Http\Controllers\CommentController;

Route::resource('photos.comments', CommentController::class)->shallow();
```

Khai báo trên sẽ tạo các route sau:

<div class="overflow-auto">

| Verb      | URI                               | Action  | Route Name             |
| --------- | --------------------------------- | ------- | ---------------------- |
| GET       | `/photos/{photo}/comments`        | index   | photos.comments.index  |
| GET       | `/photos/{photo}/comments/create` | create  | photos.comments.create |
| POST      | `/photos/{photo}/comments`        | store   | photos.comments.store  |
| GET       | `/comments/{comment}`             | show    | comments.show          |
| GET       | `/comments/{comment}/edit`        | edit    | comments.edit          |
| PUT/PATCH | `/comments/{comment}`             | update  | comments.update        |
| DELETE    | `/comments/{comment}`             | destroy | comments.destroy       |

</div>

<a name="restful-naming-resource-routes"></a>
### Đặt tên Resource Route

Theo mặc định, mọi action của resource controller đều có route name. Tuy nhiên, bạn có thể ghi đè các tên này bằng cách truyền mảng `names` chứa những route name mong muốn:

```php
use App\Http\Controllers\PhotoController;

Route::resource('photos', PhotoController::class)->names([
    'create' => 'photos.build'
]);
```

<a name="restful-naming-resource-route-parameters"></a>
### Đặt tên tham số của Resource Route

Theo mặc định, `Route::resource` sẽ tạo các tham số route cho resource route dựa trên dạng số ít của tên resource. Bạn có thể dễ dàng ghi đè quy tắc này cho từng resource bằng phương thức `parameters`. Mảng truyền vào `parameters` phải là một mảng kết hợp ánh xạ tên resource với tên tham số:

```php
use App\Http\Controllers\AdminUserController;

Route::resource('users', AdminUserController::class)->parameters([
    'users' => 'admin_user'
]);
```

Ví dụ trên tạo URI sau cho route `show` của resource:

```text
/users/{admin_user}
```

<a name="restful-scoping-resource-routes"></a>
### Giới hạn phạm vi Resource Route

Tính năng [giới hạn phạm vi implicit model binding](/routing#implicit-model-binding-scoping) của Laravel có thể tự động giới hạn các binding lồng nhau để bảo đảm model con được phân giải thực sự thuộc model cha. Khi dùng phương thức `scoped` để định nghĩa resource lồng nhau, bạn vừa có thể bật cơ chế giới hạn phạm vi tự động, vừa chỉ định trường mà Laravel phải dùng để truy xuất resource con:

```php
use App\Http\Controllers\PhotoCommentController;

Route::resource('photos.comments', PhotoCommentController::class)->scoped([
    'comment' => 'slug',
]);
```

Route này đăng ký một resource lồng nhau có giới hạn phạm vi, có thể được truy cập bằng URI như sau:

```text
/photos/{photo}/comments/{comment:slug}
```

Khi dùng implicit binding với khóa tùy chỉnh cho một tham số route lồng nhau, Laravel sẽ tự động giới hạn truy vấn lấy model lồng nhau theo model cha, đồng thời dựa trên convention để suy ra tên relationship trên model cha. Trong trường hợp này, Laravel giả định model `Photo` có relationship tên `comments` (dạng số nhiều của tên tham số route) và dùng relationship đó để truy xuất model `Comment`.

<a name="restful-localizing-resource-uris"></a>
### Bản địa hóa URI của Resource

Theo mặc định, `Route::resource` tạo URI của resource bằng các động từ và quy tắc số nhiều trong tiếng Anh. Nếu cần bản địa hóa các động từ cho action `create` và `edit`, bạn có thể dùng phương thức `Route::resourceVerbs`. Việc này có thể được thực hiện ở đầu phương thức `boot` trong `App\Providers\AppServiceProvider` của ứng dụng:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Route::resourceVerbs([
        'create' => 'crear',
        'edit' => 'editar',
    ]);
}
```

Bộ chuyển đổi số nhiều của Laravel hỗ trợ [nhiều ngôn ngữ khác nhau và bạn có thể cấu hình theo nhu cầu](/localization#pluralization-language). Sau khi tùy chỉnh các động từ và ngôn ngữ dùng cho quy tắc số nhiều, một khai báo resource route như `Route::resource('publicacion', PublicacionController::class)` sẽ tạo các URI sau:

```text
/publicacion/crear

/publicacion/{publicaciones}/editar
```

<a name="restful-supplementing-resource-controllers"></a>
### Bổ sung Route cho Resource Controller

Nếu cần thêm các route ngoài tập resource route mặc định cho một resource controller, bạn nên định nghĩa các route bổ sung đó trước khi gọi phương thức `Route::resource`; nếu không, các route do `resource` định nghĩa có thể vô tình được ưu tiên trước các route bổ sung của bạn:

```php
use App\Http\Controller\PhotoController;

Route::get('/photos/popular', [PhotoController::class, 'popular']);
Route::resource('photos', PhotoController::class);
```

> [!NOTE]
> Hãy giữ controller tập trung vào một trách nhiệm rõ ràng. Nếu bạn thường xuyên phải thêm các phương thức nằm ngoài tập resource action thông thường, hãy cân nhắc tách controller thành hai controller nhỏ hơn.

<a name="singleton-resource-controllers"></a>
### Singleton Resource Controller

Đôi khi ứng dụng có những resource chỉ được phép tồn tại một instance. Ví dụ, "profile" của người dùng có thể được chỉnh sửa hoặc cập nhật, nhưng mỗi người dùng không thể có nhiều hơn một "profile". Tương tự, một ảnh có thể chỉ có một "thumbnail". Những resource như vậy được gọi là "singleton resource", nghĩa là chỉ duy nhất một instance của resource được phép tồn tại. Trong các trường hợp này, bạn có thể đăng ký một singleton resource controller:

```php
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::singleton('profile', ProfileController::class);
```

Định nghĩa singleton resource ở trên sẽ đăng ký các route sau. Như bạn có thể thấy, các route dùng để tạo mới không được đăng ký cho singleton resource, và các route được đăng ký cũng không nhận identifier vì resource chỉ có thể tồn tại một instance:

<div class="overflow-auto">

| Verb      | URI             | Action | Route Name     |
| --------- | --------------- | ------ | -------------- |
| GET       | `/profile`      | show   | profile.show   |
| GET       | `/profile/edit` | edit   | profile.edit   |
| PUT/PATCH | `/profile`      | update | profile.update |

</div>

Singleton resource cũng có thể được lồng bên trong một resource thông thường:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class);
```

Trong ví dụ này, resource `photos` nhận đầy đủ [các resource route tiêu chuẩn](#actions-handled-by-resource-controllers); tuy nhiên, resource `thumbnail` là một singleton resource với các route sau:

<div class="overflow-auto">

| Verb      | URI                              | Action | Route Name              |
| --------- | -------------------------------- | ------ | ----------------------- |
| GET       | `/photos/{photo}/thumbnail`      | show   | photos.thumbnail.show   |
| GET       | `/photos/{photo}/thumbnail/edit` | edit   | photos.thumbnail.edit   |
| PUT/PATCH | `/photos/{photo}/thumbnail`      | update | photos.thumbnail.update |

</div>

<a name="creatable-singleton-resources"></a>
#### Singleton Resource có thể tạo mới

Trong một số trường hợp, bạn có thể muốn định nghĩa thêm route tạo mới và lưu trữ cho singleton resource. Để làm điều này, hãy gọi phương thức `creatable` khi đăng ký singleton resource route:

```php
Route::singleton('photos.thumbnail', ThumbnailController::class)->creatable();
```

Trong ví dụ này, các route sau sẽ được đăng ký. Đồng thời, một route `DELETE` cũng được đăng ký cho singleton resource có thể tạo mới:

<div class="overflow-auto">

| Verb      | URI                                | Action  | Route Name               |
| --------- | ---------------------------------- | ------- | ------------------------ |
| GET       | `/photos/{photo}/thumbnail/create` | create  | photos.thumbnail.create  |
| POST      | `/photos/{photo}/thumbnail`        | store   | photos.thumbnail.store   |
| GET       | `/photos/{photo}/thumbnail`        | show    | photos.thumbnail.show    |
| GET       | `/photos/{photo}/thumbnail/edit`   | edit    | photos.thumbnail.edit    |
| PUT/PATCH | `/photos/{photo}/thumbnail`        | update  | photos.thumbnail.update  |
| DELETE    | `/photos/{photo}/thumbnail`        | destroy | photos.thumbnail.destroy |

</div>

Nếu muốn Laravel đăng ký route `DELETE` cho singleton resource nhưng không đăng ký các route tạo mới hoặc lưu trữ, bạn có thể dùng phương thức `destroyable`:

```php
Route::singleton(...)->destroyable();
```

<a name="api-singleton-resources"></a>
#### API Singleton Resource

Phương thức `apiSingleton` có thể được dùng để đăng ký một singleton resource được thao tác thông qua API; vì vậy các route `create` và `edit` không còn cần thiết:

```php
Route::apiSingleton('profile', ProfileController::class);
```

Tất nhiên, API singleton resource cũng có thể được đánh dấu là `creatable`; khi đó Laravel sẽ đăng ký các route `store` và `destroy` cho resource:

```php
Route::apiSingleton('photos.thumbnail', ProfileController::class)->creatable();
```
<a name="middleware-and-resource-controllers"></a>
### Middleware và Resource Controller

Laravel cho phép gán middleware cho toàn bộ hoặc chỉ một số phương thức cụ thể của resource route thông qua `middleware`, `middlewareFor` và `withoutMiddlewareFor`. Các phương thức này cho phép kiểm soát chi tiết middleware nào được áp dụng cho từng resource action.

#### Áp dụng Middleware cho tất cả phương thức

Bạn có thể dùng phương thức `middleware` để gán middleware cho tất cả route được sinh bởi resource route hoặc singleton resource route:

```php
Route::resource('users', UserController::class)
    ->middleware(['auth', 'verified']);

Route::singleton('profile', ProfileController::class)
    ->middleware('auth');
```

#### Áp dụng Middleware cho các phương thức cụ thể

Bạn có thể dùng phương thức `middlewareFor` để gán middleware cho một hoặc nhiều phương thức cụ thể của resource controller:

```php
Route::resource('users', UserController::class)
    ->middlewareFor('show', 'auth');

Route::apiResource('users', UserController::class)
    ->middlewareFor(['show', 'update'], 'auth');

Route::resource('users', UserController::class)
    ->middlewareFor('show', 'auth')
    ->middlewareFor('update', 'auth');

Route::apiResource('users', UserController::class)
    ->middlewareFor(['show', 'update'], ['auth', 'verified']);
```

Phương thức `middlewareFor` cũng có thể được dùng với singleton resource controller và API singleton resource controller:

```php
Route::singleton('profile', ProfileController::class)
    ->middlewareFor('show', 'auth');

Route::apiSingleton('profile', ProfileController::class)
    ->middlewareFor(['show', 'update'], 'auth');
```

#### Loại trừ Middleware khỏi các phương thức cụ thể

Bạn có thể dùng phương thức `withoutMiddlewareFor` để loại trừ middleware khỏi các phương thức cụ thể của resource controller:

```php
Route::middleware(['auth', 'verified', 'subscribed'])->group(function () {
    Route::resource('users', UserController::class)
        ->withoutMiddlewareFor('index', ['auth', 'verified'])
        ->withoutMiddlewareFor(['create', 'store'], 'verified')
        ->withoutMiddlewareFor('destroy', 'subscribed');
});
```

<a name="dependency-injection-and-controllers"></a>
## Dependency Injection và Controller

<a name="constructor-injection"></a>
#### Injection qua Constructor

Laravel sử dụng [service container](/container) để phân giải tất cả controller. Vì vậy, bạn có thể type-hint mọi dependency mà controller cần trong constructor. Các dependency đã khai báo sẽ tự động được container phân giải và inject vào instance của controller:

```php
<?php

namespace App\Http\Controllers;

use App\Repositories\UserRepository;

class UserController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}
}
```

<a name="method-injection"></a>
#### Injection qua phương thức

Ngoài constructor injection, bạn cũng có thể type-hint dependency trực tiếp trên các phương thức của controller. Một trường hợp phổ biến của method injection là inject instance `Illuminate\Http\Request` vào phương thức của controller:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Store a new user.
     */
    public function store(Request $request): RedirectResponse
    {
        $name = $request->name;

        // Store the user...

        return redirect('/users');
    }
}
```

Nếu phương thức controller đồng thời nhận dữ liệu từ route parameter, hãy đặt các đối số của route sau những dependency khác. Ví dụ, nếu route được định nghĩa như sau:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

Bạn vẫn có thể type-hint `Illuminate\Http\Request` và truy cập tham số `id` bằng cách định nghĩa phương thức controller như sau:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the given user.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // Update the user...

        return redirect('/users');
    }
}
```
