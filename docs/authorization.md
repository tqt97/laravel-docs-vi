# Phân quyền

<a name="introduction"></a>
## Giới thiệu

Bên cạnh các dịch vụ [xác thực](/authentication) được tích hợp sẵn, Laravel còn cung cấp một cơ chế đơn giản để xác định người dùng có được phép thực hiện một hành động trên một tài nguyên cụ thể hay không. Ví dụ, một người dùng dù đã được xác thực vẫn có thể không có quyền cập nhật hoặc xóa một số Eloquent model hay bản ghi cơ sở dữ liệu do ứng dụng quản lý. Các tính năng phân quyền của Laravel giúp bạn tổ chức và quản lý những phép kiểm tra quyền này một cách rõ ràng.

Laravel cung cấp hai cơ chế chính để phân quyền hành động: [gate](#gates) và [policy](#creating-policies). Có thể hình dung gate và policy tương tự mối quan hệ giữa route và controller. Gate cung cấp cách phân quyền đơn giản dựa trên closure, còn policy, tương tự controller, gom nhóm logic xoay quanh một model hoặc tài nguyên cụ thể. Tài liệu này sẽ trình bày gate trước, sau đó đi sâu vào policy.

Khi xây dựng ứng dụng, bạn không cần phải chọn duy nhất gate hoặc duy nhất policy. Phần lớn ứng dụng thực tế sẽ kết hợp cả hai và đây hoàn toàn là cách sử dụng bình thường. Gate phù hợp nhất với những hành động không gắn với một model hay tài nguyên cụ thể, chẳng hạn quyền xem dashboard quản trị. Ngược lại, policy nên được dùng khi cần phân quyền một hành động đối với một model hoặc tài nguyên cụ thể.

<a name="gates"></a>
## Gates

<a name="writing-gates"></a>
### Định nghĩa Gate

> [!WARNING]
> Gate là cách rất tốt để làm quen với những nguyên tắc cơ bản của hệ thống phân quyền trong Laravel. Tuy nhiên, khi xây dựng ứng dụng Laravel có quy mô và yêu cầu tổ chức chặt chẽ, bạn nên cân nhắc sử dụng [policy](#creating-policies) để tổ chức các quy tắc phân quyền.

Gate về bản chất là các closure dùng để xác định một người dùng có được phép thực hiện một hành động cụ thể hay không. Thông thường, gate được định nghĩa trong phương thức `boot` của lớp `App\Providers\AppServiceProvider` thông qua facade `Gate`. Gate luôn nhận instance người dùng làm đối số đầu tiên và có thể nhận thêm các đối số khác, chẳng hạn Eloquent model liên quan.

Trong ví dụ sau, chúng ta định nghĩa một gate để xác định người dùng có thể cập nhật một `App\Models\Post` cụ thể hay không. Gate thực hiện việc này bằng cách so sánh `id` của người dùng với `user_id` của người đã tạo bài viết:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Gate::define('update-post', function (User $user, Post $post) {
        return $user->id === $post->user_id;
    });
}
```

Tương tự controller, gate cũng có thể được định nghĩa bằng một mảng callback gồm class và phương thức:

```php
use App\Policies\PostPolicy;
use Illuminate\Support\Facades\Gate;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Gate::define('update-post', [PostPolicy::class, 'update']);
}
```

<a name="authorizing-actions-via-gates"></a>
### Phân quyền hành động

Để phân quyền một hành động bằng gate, hãy sử dụng phương thức `allows` hoặc `denies` do facade `Gate` cung cấp. Bạn không cần truyền người dùng đang được xác thực vào các phương thức này; Laravel sẽ tự động truyền người dùng đó vào closure của gate. Thông thường, các phương thức kiểm tra quyền của gate được gọi trong controller trước khi thực hiện hành động cần phân quyền:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * Update the given post.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        if (! Gate::allows('update-post', $post)) {
            abort(403);
        }

        // Update the post...

        return redirect('/posts');
    }
}
```

Nếu cần kiểm tra quyền của một người dùng khác với người dùng đang được xác thực, bạn có thể sử dụng phương thức `forUser` trên facade `Gate`:

```php
if (Gate::forUser($user)->allows('update-post', $post)) {
    // The user can update the post...
}

if (Gate::forUser($user)->denies('update-post', $post)) {
    // The user can't update the post...
}
```

Bạn có thể kiểm tra nhiều hành động cùng lúc bằng phương thức `any` hoặc `none`:

```php
if (Gate::any(['update-post', 'delete-post'], $post)) {
    // The user can update or delete the post...
}

if (Gate::none(['update-post', 'delete-post'], $post)) {
    // The user can't update or delete the post...
}
```

<a name="authorizing-or-throwing-exceptions"></a>
#### Phân quyền hoặc ném exception

Nếu muốn kiểm tra quyền và tự động ném `Illuminate\Auth\Access\AuthorizationException` khi người dùng không được phép thực hiện hành động, bạn có thể sử dụng phương thức `authorize` của facade `Gate`. Laravel tự động chuyển các instance `AuthorizationException` thành HTTP response có mã trạng thái 403:

```php
Gate::authorize('update-post', $post);

// The action is authorized...
```

<a name="gates-supplying-additional-context"></a>
#### Cung cấp ngữ cảnh bổ sung

Các phương thức gate dùng để kiểm tra ability (`allows`, `denies`, `check`, `any`, `none`, `authorize`, `can`, `cannot`) và các [Blade directive](#via-blade-templates) dành cho phân quyền (`@can`, `@cannot`, `@canany`) có thể nhận một mảng làm đối số thứ hai. Các phần tử trong mảng sẽ được truyền thành tham số cho closure của gate, nhờ đó bạn có thể cung cấp thêm ngữ cảnh phục vụ quyết định phân quyền:

```php
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::define('create-post', function (User $user, Category $category, bool $pinned) {
    if (! $user->canPublishToGroup($category->group)) {
        return false;
    } elseif ($pinned && ! $user->canPinPosts()) {
        return false;
    }

    return true;
});

if (Gate::check('create-post', [$category, $pinned])) {
    // The user can create the post...
}
```

<a name="gate-responses"></a>
### Phản hồi của Gate

Cho đến đây, các gate được minh họa chỉ trả về giá trị boolean đơn giản. Tuy nhiên, trong một số trường hợp bạn cần phản hồi chi tiết hơn, chẳng hạn kèm thông báo lỗi. Khi đó, gate có thể trả về một `Illuminate\Auth\Access\Response`:

```php
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
        ? Response::allow()
        : Response::deny('You must be an administrator.');
});
```

Ngay cả khi gate trả về một authorization response, `Gate::allows` vẫn chỉ trả về giá trị boolean. Nếu cần lấy đầy đủ response do gate trả về, hãy sử dụng `Gate::inspect`:

```php
$response = Gate::inspect('edit-settings');

if ($response->allowed()) {
    // The action is authorized...
} else {
    echo $response->message();
}
```

Khi sử dụng `Gate::authorize`, phương thức sẽ ném `AuthorizationException` nếu hành động không được cấp quyền; thông báo lỗi trong authorization response sẽ được chuyển tiếp sang HTTP response:

```php
Gate::authorize('edit-settings');

// The action is authorized...
```

<a name="customizing-gate-response-status"></a>
#### Tùy chỉnh mã trạng thái HTTP response

Khi một hành động bị từ chối bởi Gate, Laravel mặc định trả về HTTP response `403`. Tuy nhiên, đôi khi ứng dụng cần trả về một mã trạng thái khác. Bạn có thể tùy chỉnh mã HTTP cho phép kiểm tra quyền thất bại bằng static constructor `denyWithStatus` của lớp `Illuminate\Auth\Access\Response`:

```php
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
        ? Response::allow()
        : Response::denyWithStatus(404);
});
```

Do việc ẩn sự tồn tại của tài nguyên bằng response `404` là một pattern phổ biến trong ứng dụng web, Laravel cung cấp phương thức tiện ích `denyAsNotFound`:

```php
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Gate;

Gate::define('edit-settings', function (User $user) {
    return $user->isAdmin
        ? Response::allow()
        : Response::denyAsNotFound();
});
```

<a name="intercepting-gate-checks"></a>
### Chặn trước và xử lý sau khi kiểm tra Gate

Đôi khi, bạn có thể muốn cấp mọi quyền cho một người dùng cụ thể. Bạn có thể sử dụng phương thức `before` để định nghĩa một closure được thực thi trước tất cả các kiểm tra phân quyền khác:

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::before(function (User $user, string $ability) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

Nếu closure `before` trả về một giá trị khác `null`, giá trị đó sẽ được xem là kết quả cuối cùng của phép kiểm tra phân quyền.

Bạn có thể sử dụng phương thức `after` để định nghĩa một closure được thực thi sau tất cả các kiểm tra phân quyền khác:

```php
use App\Models\User;

Gate::after(function (User $user, string $ability, bool|null $result, mixed $arguments) {
    if ($user->isAdministrator()) {
        return true;
    }
});
```

Giá trị do closure `after` trả về sẽ không ghi đè kết quả của phép kiểm tra phân quyền, trừ khi Gate hoặc Policy trả về `null`.

<a name="inline-authorization"></a>
### Phân quyền trực tiếp

Trong một số trường hợp, bạn có thể muốn xác định người dùng hiện đã xác thực có được phép thực hiện một hành động hay không mà không cần khai báo một Gate riêng cho hành động đó. Laravel hỗ trợ kiểu kiểm tra phân quyền "trực tiếp" này thông qua `Gate::allowIf` và `Gate::denyIf`. Phân quyền trực tiếp không thực thi các [hook phân quyền `before` hoặc `after`](#intercepting-gate-checks) đã định nghĩa:

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

Gate::allowIf(fn (User $user) => $user->isAdministrator());

Gate::denyIf(fn (User $user) => $user->banned());
```

Nếu hành động không được cấp quyền hoặc hiện không có người dùng nào được xác thực, Laravel sẽ tự động ném `Illuminate\Auth\Access\AuthorizationException`. Exception `AuthorizationException` sẽ được exception handler của Laravel tự động chuyển thành HTTP response có status code `403`.

<a name="creating-policies"></a>
## Tạo Policy

<a name="generating-policies"></a>
### Sinh Policy

Policy là các class tổ chức logic phân quyền xoay quanh một model hoặc resource cụ thể. Ví dụ, với ứng dụng blog, bạn có thể có model `App\Models\Post` và `App\Policies\PostPolicy` tương ứng để phân quyền cho các thao tác như tạo hoặc cập nhật bài viết.

Bạn có thể tạo Policy bằng lệnh Artisan `make:policy`. Policy được sinh ra sẽ nằm trong thư mục `app/Policies`. Nếu thư mục này chưa tồn tại, Laravel sẽ tự động tạo:

```shell
php artisan make:policy PostPolicy
```

Lệnh `make:policy` mặc định tạo một Policy class rỗng. Nếu muốn class được sinh sẵn các phương thức Policy mẫu cho việc xem, tạo, cập nhật và xóa resource, hãy truyền option `--model` khi chạy lệnh:

```shell
php artisan make:policy PostPolicy --model=Post
```

<a name="registering-policies"></a>
### Đăng ký Policy

<a name="policy-discovery"></a>
#### Tự động phát hiện Policy

Mặc định, Laravel tự động phát hiện Policy miễn là model và Policy tuân theo quy ước đặt tên chuẩn của Laravel. Cụ thể, Policy phải nằm trong thư mục `Policies` ở cùng cấp hoặc cấp cha của thư mục chứa model. Ví dụ, model có thể nằm trong `app/Models`, còn Policy nằm trong `app/Policies`. Khi đó Laravel sẽ lần lượt tìm Policy trong `app/Models/Policies` rồi `app/Policies`. Ngoài ra, tên Policy phải tương ứng với tên model và có hậu tố `Policy`; vì vậy model `User` sẽ tương ứng với class `UserPolicy`.

Nếu muốn tự định nghĩa logic phát hiện Policy, bạn có thể đăng ký callback tùy chỉnh bằng `Gate::guessPolicyNamesUsing`. Thông thường phương thức này nên được gọi trong phương thức `boot` của `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Gate;

Gate::guessPolicyNamesUsing(function (string $modelClass) {
    // Return the name of the policy class for the given model...
});
```

<a name="manually-registering-policies"></a>
#### Đăng ký Policy thủ công

Thông qua Facade `Gate`, bạn có thể đăng ký thủ công Policy và model tương ứng trong phương thức `boot` của `AppServiceProvider`:

```php
use App\Models\Order;
use App\Policies\OrderPolicy;
use Illuminate\Support\Facades\Gate;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Gate::policy(Order::class, OrderPolicy::class);
}
```

Ngoài ra, bạn có thể gắn attribute `UsePolicy` lên model class để khai báo cho Laravel Policy tương ứng của model:

```php
<?php

namespace App\Models;

use App\Policies\OrderPolicy;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Model;

#[UsePolicy(OrderPolicy::class)]
class Order extends Model
{
    //
}
```

<a name="writing-policies"></a>
## Viết Policy

<a name="policy-methods"></a>
### Các phương thức Policy

Sau khi Policy class được đăng ký, bạn có thể thêm phương thức cho từng hành động cần phân quyền. Ví dụ, hãy định nghĩa phương thức `update` trong `PostPolicy` để xác định một `App\Models\User` có được phép cập nhật một instance `App\Models\Post` cụ thể hay không.

Phương thức `update` nhận một instance `User` và một instance `Post`, sau đó trả về `true` hoặc `false` để biểu thị người dùng có được phép cập nhật `Post` đó hay không. Trong ví dụ này, ta kiểm tra `id` của người dùng có khớp với `user_id` của bài viết hay không:

```php
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determine if the given post can be updated by the user.
     */
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}
```

Bạn có thể tiếp tục định nghĩa thêm các phương thức trong Policy tùy theo những hành động cần phân quyền. Chẳng hạn, có thể thêm `view` hoặc `delete` cho các thao tác liên quan đến `Post`; tên phương thức Policy không bị giới hạn ở các tên này.

Nếu sử dụng option `--model` khi sinh Policy bằng Artisan, class được tạo sẽ có sẵn các phương thức cho `viewAny`, `view`, `create`, `update`, `delete`, `restore` và `forceDelete`.

> [!NOTE]
> Tất cả Policy đều được phân giải thông qua [Service Container](/container) của Laravel, vì vậy bạn có thể type-hint các dependency cần thiết trong constructor của Policy để chúng được tự động inject.

<a name="policy-responses"></a>
### Response của Policy

Cho đến đây, các phương thức Policy chỉ trả về giá trị boolean đơn giản. Tuy nhiên, đôi khi bạn cần trả về response chi tiết hơn, chẳng hạn kèm thông báo lỗi. Khi đó, phương thức Policy có thể trả về một instance `Illuminate\Auth\Access\Response`:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Determine if the given post can be updated by the user.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::deny('You do not own this post.');
}
```

Khi Policy trả về authorization response, `Gate::allows` vẫn chỉ trả về giá trị boolean. Nếu cần lấy đầy đủ authorization response do Gate trả về, hãy sử dụng `Gate::inspect`:

```php
use Illuminate\Support\Facades\Gate;

$response = Gate::inspect('update', $post);

if ($response->allowed()) {
    // The action is authorized...
} else {
    echo $response->message();
}
```

Khi sử dụng `Gate::authorize`, phương thức sẽ ném `AuthorizationException` nếu hành động không được cấp quyền; thông báo lỗi trong authorization response sẽ được chuyển tiếp sang HTTP response:

```php
Gate::authorize('update', $post);

// The action is authorized...
```

<a name="customizing-policy-response-status"></a>
#### Tùy chỉnh HTTP response status

Khi một hành động bị từ chối bởi phương thức Policy, Laravel mặc định trả về HTTP response `403`. Trong một số trường hợp, bạn có thể cần status code khác. Có thể tùy chỉnh HTTP status code của phép kiểm tra phân quyền thất bại bằng static constructor `denyWithStatus` trên class `Illuminate\Auth\Access\Response`:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Determine if the given post can be updated by the user.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::denyWithStatus(404);
}
```

Do việc ẩn sự tồn tại của tài nguyên bằng response `404` là một pattern phổ biến trong ứng dụng web, Laravel cung cấp phương thức tiện ích `denyAsNotFound`:

```php
use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Determine if the given post can be updated by the user.
 */
public function update(User $user, Post $post): Response
{
    return $user->id === $post->user_id
        ? Response::allow()
        : Response::denyAsNotFound();
}
```

<a name="methods-without-models"></a>
### Phương thức không cần Model

Một số phương thức Policy chỉ nhận instance của người dùng hiện đã xác thực. Trường hợp này thường gặp nhất khi phân quyền hành động `create`. Ví dụ, trong ứng dụng blog, bạn có thể cần xác định người dùng có được phép tạo bài viết hay không. Khi đó, phương thức Policy chỉ cần nhận instance người dùng:

```php
/**
 * Determine if the given user can create posts.
 */
public function create(User $user): bool
{
    return $user->role == 'writer';
}
```

<a name="guest-users"></a>
### Người dùng chưa xác thực

Mặc định, mọi Gate và Policy tự động trả về `false` nếu HTTP request đến không được khởi tạo bởi người dùng đã xác thực. Tuy nhiên, bạn có thể cho phép phép kiểm tra tiếp tục đi vào Gate hoặc Policy bằng cách khai báo type-hint nullable hoặc cung cấp giá trị mặc định `null` cho tham số người dùng:

```php
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determine if the given post can be updated by the user.
     */
    public function update(?User $user, Post $post): bool
    {
        return $user?->id === $post->user_id;
    }
}
```

<a name="policy-filters"></a>
### Bộ lọc Policy

Với một số người dùng, bạn có thể muốn cho phép mọi hành động trong một Policy. Để làm điều này, hãy định nghĩa phương thức `before` trên Policy. `before` được thực thi trước mọi phương thức khác của Policy, cho phép bạn cấp quyền trước khi phương thức Policy tương ứng thực sự được gọi. Cách này thường được dùng để cho phép quản trị viên ứng dụng thực hiện mọi hành động:

```php
use App\Models\User;

/**
 * Perform pre-authorization checks.
 */
public function before(User $user, string $ability): bool|null
{
    if ($user->isAdministrator()) {
        return true;
    }

    return null;
}
```

Nếu muốn từ chối mọi phép kiểm tra phân quyền đối với một loại người dùng cụ thể, hãy trả về `false` từ `before`. Nếu trả về `null`, quá trình kiểm tra sẽ tiếp tục đến phương thức Policy tương ứng.

> [!WARNING]
> Phương thức `before` của Policy class sẽ không được gọi nếu class không có phương thức có tên tương ứng với ability đang được kiểm tra.

<a name="authorizing-actions-using-policies"></a>
## Phân quyền hành động bằng Policy

<a name="via-the-user-model"></a>
### Thông qua User Model

Model `App\Models\User` đi kèm ứng dụng Laravel cung cấp hai phương thức hữu ích để phân quyền hành động: `can` và `cannot`. Hai phương thức này nhận tên hành động cần kiểm tra cùng model liên quan. Ví dụ, ta có thể xác định người dùng có được phép cập nhật một `App\Models\Post` cụ thể hay không; việc này thường được thực hiện trong phương thức controller:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Update the given post.
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        if ($request->user()->cannot('update', $post)) {
            abort(403);
        }

        // Update the post...

        return redirect('/posts');
    }
}
```

Nếu model đã được [đăng ký Policy](#registering-policies), `can` sẽ tự động gọi Policy phù hợp và trả về kết quả boolean. Nếu model không có Policy được đăng ký, `can` sẽ thử gọi Gate dạng closure có tên khớp với hành động.

<a name="user-model-actions-that-dont-require-models"></a>
#### Hành động không cần Model

Một số hành động tương ứng với phương thức Policy như `create` không cần một model instance. Trong trường hợp này, bạn có thể truyền tên class vào `can`; Laravel sẽ dùng tên class để xác định Policy cần sử dụng khi phân quyền:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Create a post.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->cannot('create', Post::class)) {
            abort(403);
        }

        // Create the post...

        return redirect('/posts');
    }
}
```

<a name="via-the-gate-facade"></a>
### Thông qua Facade `Gate`

Bên cạnh các phương thức tiện ích trên `App\Models\User`, bạn luôn có thể phân quyền hành động thông qua phương thức `authorize` của Facade `Gate`.

Tương tự `can`, phương thức này nhận tên hành động cần phân quyền và model liên quan. Nếu hành động không được cấp quyền, `authorize` sẽ ném `Illuminate\Auth\Access\AuthorizationException`; exception handler của Laravel tự động chuyển exception này thành HTTP response có status code `403`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * Update the given blog post.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update(Request $request, Post $post): RedirectResponse
    {
        Gate::authorize('update', $post);

        // The current user can update the blog post...

        return redirect('/posts');
    }
}
```

<a name="controller-actions-that-dont-require-models"></a>
#### Hành động không cần Model

Như đã đề cập, một số phương thức Policy như `create` không cần model instance. Trong trường hợp này, hãy truyền tên class vào `authorize`; Laravel sẽ dùng tên class đó để xác định Policy cần sử dụng:

```php
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Create a new blog post.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function create(Request $request): RedirectResponse
{
    Gate::authorize('create', Post::class);

    // The current user can create blog posts...

    return redirect('/posts');
}
```

<a name="via-middleware"></a>
### Thông qua Middleware

Laravel cung cấp middleware có thể phân quyền hành động trước khi request đi đến route hoặc controller. Mặc định, middleware `Illuminate\Auth\Middleware\Authorize` có thể được gắn vào route thông qua [middleware alias](/middleware#middleware-aliases) `can`, alias này được Laravel đăng ký tự động. Ví dụ sau dùng middleware `can` để kiểm tra người dùng có quyền cập nhật bài viết:

```php
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->middleware('can:update,post');
```

Trong ví dụ này, middleware `can` nhận hai đối số: đối số đầu là tên hành động cần phân quyền, đối số thứ hai là route parameter sẽ được truyền vào phương thức Policy. Vì đang sử dụng [implicit model binding](/routing#implicit-binding), một model `App\Models\Post` sẽ được truyền vào phương thức Policy. Nếu người dùng không được phép thực hiện hành động, middleware sẽ trả về HTTP response có status code `403`.

Để thuận tiện, bạn cũng có thể gắn middleware `can` vào route bằng phương thức `can`:

```php
use App\Models\Post;

Route::put('/post/{post}', function (Post $post) {
    // The current user may update the post...
})->can('update', 'post');
```

Nếu sử dụng [controller middleware attributes](/controllers#middleware-attributes), bạn có thể áp dụng middleware `can` thông qua attribute `Authorize`:

```php
use Illuminate\Routing\Attributes\Controllers\Authorize;

#[Authorize('update', 'post')]
public function update(Post $post)
{
    // The current user may update the post...
}
```

<a name="middleware-actions-that-dont-require-models"></a>
#### Hành động không cần Model

Tương tự, một số phương thức Policy như `create` không cần model instance. Trong trường hợp này, bạn có thể truyền tên class vào middleware; tên class sẽ được dùng để xác định Policy cần áp dụng:

```php
Route::post('/post', function () {
    // The current user may create posts...
})->middleware('can:create,App\Models\Post');
```

Việc ghi đầy đủ tên class trong chuỗi khai báo middleware có thể khá dài dòng. Vì vậy, bạn có thể gắn middleware `can` vào route bằng phương thức `can`:

```php
use App\Models\Post;

Route::post('/post', function () {
    // The current user may create posts...
})->can('create', Post::class);
```

<a name="via-blade-templates"></a>
### Thông qua Blade Template

Khi viết Blade template, bạn có thể chỉ muốn hiển thị một phần giao diện nếu người dùng được phép thực hiện hành động tương ứng. Ví dụ, form cập nhật bài viết chỉ nên xuất hiện khi người dùng thực sự có quyền cập nhật bài viết đó. Trong trường hợp này, hãy sử dụng directive `@can` và `@cannot`:

```blade
@can('update', $post)
    <!-- The current user can update the post... -->
@elsecan('create', App\Models\Post::class)
    <!-- The current user can create new posts... -->
@else
    <!-- ... -->
@endcan

@cannot('update', $post)
    <!-- The current user cannot update the post... -->
@elsecannot('create', App\Models\Post::class)
    <!-- The current user cannot create new posts... -->
@endcannot
```

Các directive này là cách viết rút gọn thuận tiện cho `@if` và `@unless`. Các câu lệnh `@can` và `@cannot` ở trên tương đương với:

```blade
@if (Auth::user()->can('update', $post))
    <!-- The current user can update the post... -->
@endif

@unless (Auth::user()->can('update', $post))
    <!-- The current user cannot update the post... -->
@endunless
```

Bạn cũng có thể kiểm tra người dùng có được phép thực hiện ít nhất một hành động trong một mảng hành động hay không bằng directive `@canany`:

```blade
@canany(['update', 'view', 'delete'], $post)
    <!-- The current user can update, view, or delete the post... -->
@elsecanany(['create'], \App\Models\Post::class)
    <!-- The current user can create a post... -->
@endcanany
```

<a name="blade-actions-that-dont-require-models"></a>
#### Hành động không cần Model

Tương tự các cơ chế phân quyền khác, nếu hành động không cần model instance, bạn có thể truyền tên class vào directive `@can` và `@cannot`:

```blade
@can('create', App\Models\Post::class)
    <!-- The current user can create posts... -->
@endcan

@cannot('create', App\Models\Post::class)
    <!-- The current user can't create posts... -->
@endcannot
```

<a name="supplying-additional-context"></a>
### Cung cấp ngữ cảnh bổ sung

Khi phân quyền bằng Policy, bạn có thể truyền một mảng làm đối số thứ hai cho các hàm và helper phân quyền. Phần tử đầu tiên của mảng được dùng để xác định Policy cần gọi; các phần tử còn lại được truyền thành tham số cho phương thức Policy và có thể cung cấp ngữ cảnh bổ sung cho quyết định phân quyền. Ví dụ, phương thức `PostPolicy` sau nhận thêm tham số `$category`:

```php
/**
 * Determine if the given post can be updated by the user.
 */
public function update(User $user, Post $post, int $category): bool
{
    return $user->id === $post->user_id &&
           $user->canUpdateCategory($category);
}
```

Khi cần xác định người dùng đã xác thực có thể cập nhật một bài viết cụ thể hay không, ta có thể gọi phương thức Policy như sau:

```php
/**
 * Update the given blog post.
 *
 * @throws \Illuminate\Auth\Access\AuthorizationException
 */
public function update(Request $request, Post $post): RedirectResponse
{
    Gate::authorize('update', [$post, $request->category]);

    // The current user can update the blog post...

    return redirect('/posts');
}
```

<a name="authorization-and-inertia"></a>
## Phân quyền & Inertia

Mặc dù việc phân quyền luôn phải được thực thi ở phía server, việc cung cấp dữ liệu phân quyền cho frontend thường hữu ích để giao diện có thể render đúng theo quyền của người dùng. Laravel không áp đặt một quy ước bắt buộc nào về cách cung cấp thông tin phân quyền cho frontend sử dụng Inertia.

Tuy nhiên, nếu sử dụng một trong các [starter kit](/starter-kits) dựa trên Inertia của Laravel, ứng dụng đã có middleware `HandleInertiaRequests`. Trong phương thức `share` của middleware này, bạn có thể trả về dữ liệu dùng chung được cung cấp cho mọi trang Inertia. Đây là vị trí thuận tiện để khai báo thông tin phân quyền của người dùng:

```php
<?php

namespace App\Http\Middleware;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    // ...

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request)
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => [
                    'post' => [
                        'create' => $request->user()->can('create', Post::class),
                    ],
                ],
            ],
        ];
    }
}
```
