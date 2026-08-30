# Validation (Xác thực dữ liệu)

- [Giới thiệu](#introduction)
- [Bắt đầu nhanh với Validation](#validation-quickstart)
    - [Định nghĩa route](#quick-defining-the-routes)
    - [Tạo Controller](#quick-creating-the-controller)
    - [Viết logic validation](#quick-writing-the-validation-logic)
    - [Hiển thị lỗi validation](#quick-displaying-the-validation-errors)
    - [Điền lại dữ liệu vào form](#repopulating-forms)
    - [Lưu ý về các trường tùy chọn](#a-note-on-optional-fields)
    - [Định dạng response lỗi validation](#validation-error-response-format)
- [Validation bằng Form Request](#form-request-validation)
    - [Tạo Form Request](#creating-form-requests)
    - [Phân quyền Form Request](#authorizing-form-requests)
    - [Tùy chỉnh thông báo lỗi](#customizing-the-error-messages)
    - [Chuẩn bị input trước khi validation](#preparing-input-for-validation)
- [Tạo Validator thủ công](#manually-creating-validators)
    - [Tự động chuyển hướng](#automatic-redirection)
    - [Error Bag có tên](#named-error-bags)
    - [Customizing the Error Messages](#manual-customizing-the-error-messages)
    - [Thực hiện validation bổ sung](#performing-additional-validation)
- [Làm việc với input đã được validation](#working-with-validated-input)
- [Làm việc với thông báo lỗi](#working-with-error-messages)
    - [Specifying Custom Messages in Language Files](#specifying-custom-messages-in-language-files)
    - [Specifying Attributes in Language Files](#specifying-attribute-in-language-files)
    - [Specifying Values in Language Files](#specifying-values-in-language-files)
- [Các validation rule có sẵn](#available-validation-rules)
- [Thêm rule theo điều kiện](#conditionally-adding-rules)
- [Validation mảng](#validating-arrays)
    - [Validating Nested Array Input](#validating-nested-array-input)
    - [Error Message Indexes and Positions](#error-message-indexes-and-positions)
- [Validation file](#validating-files)
- [Validation mật khẩu](#validating-passwords)
- [Validation rule tùy chỉnh](#custom-validation-rules)
    - [Using Rule Objects](#using-rule-objects)
    - [Using Closures](#using-closures)
    - [Implicit Rules](#implicit-rules)

<a name="introduction"></a>
## Giới thiệu

Laravel cung cấp nhiều cách khác nhau để validation dữ liệu đầu vào của ứng dụng. Cách phổ biến nhất là sử dụng method `validate` có sẵn trên mọi HTTP request đi vào ứng dụng. Tuy nhiên, tài liệu này cũng sẽ trình bày các cách validation khác.

Laravel cung cấp rất nhiều validation rule tiện dụng để áp dụng lên dữ liệu, bao gồm cả khả năng kiểm tra một giá trị có duy nhất trong một bảng database hay không. Chúng ta sẽ tìm hiểu chi tiết từng rule để bạn nắm được đầy đủ các khả năng validation của Laravel.

<a name="validation-quickstart"></a>
## Bắt đầu nhanh với Validation

Để tìm hiểu các tính năng validation mạnh mẽ của Laravel, hãy xem một ví dụ hoàn chỉnh về việc validation một form và hiển thị thông báo lỗi cho người dùng. Qua phần tổng quan này, bạn sẽ có được cách hiểu tổng thể về quy trình validation dữ liệu request đầu vào bằng Laravel:

<a name="quick-defining-the-routes"></a>
### Định nghĩa route

Trước tiên, giả sử chúng ta có các route sau được định nghĩa trong file `routes/web.php`:

```php
use App\Http\Controllers\PostController;

Route::get('/post/create', [PostController::class, 'create']);
Route::post('/post', [PostController::class, 'store']);
```

Route `GET` sẽ hiển thị form để người dùng tạo một bài blog mới, trong khi route `POST` sẽ lưu bài blog mới vào database.

<a name="quick-creating-the-controller"></a>
### Tạo Controller

Tiếp theo, hãy xem một controller đơn giản xử lý các request gửi đến những route này. Tạm thời chúng ta sẽ để trống method `store`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PostController extends Controller
{
    /**
     * Show the form to create a new blog post.
     */
    public function create(): View
    {
        return view('post.create');
    }

    /**
     * Store a new blog post.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate and store the blog post...

        $post = /** ... */

        return to_route('post.show', ['post' => $post->id]);
    }
}
```

<a name="quick-writing-the-validation-logic"></a>
### Viết logic validation

Bây giờ chúng ta có thể bổ sung logic validation bài blog mới vào method `store`. Để làm việc này, chúng ta sẽ sử dụng method `validate` do object `Illuminate\Http\Request` cung cấp. Nếu các validation rule đều đạt, code sẽ tiếp tục thực thi bình thường; ngược lại, nếu validation thất bại, exception `Illuminate\Validation\ValidationException` sẽ được ném ra và response lỗi phù hợp sẽ tự động được gửi về cho người dùng.

Nếu validation thất bại trong một HTTP request truyền thống, Laravel sẽ tạo redirect response về URL trước đó. Nếu request đầu vào là XHR request, Laravel sẽ trả về [JSON response chứa các thông báo lỗi validation](#validation-error-response-format).

Để hiểu rõ hơn method `validate`, hãy quay lại method `store`:

```php
/**
 * Store a new blog post.
 */
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'title' => ['required', 'unique:posts', 'max:255'],
        'body' => ['required'],
    ]);

    // The blog post is valid...

    return redirect('/posts');
}
```

Như bạn thấy, các validation rule được truyền vào method `validate`. Tất cả validation rule có sẵn đều được [tài liệu hóa](#available-validation-rules). Nếu validation thất bại, response phù hợp sẽ tự động được tạo; nếu validation thành công, controller sẽ tiếp tục thực thi bình thường.

Ngoài ra, bạn có thể sử dụng method `validateWithBag` để validation request và lưu các thông báo lỗi vào một [error bag có tên](#named-error-bags):

```php
$validated = $request->validateWithBag('post', [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

<a name="stopping-on-first-validation-failure"></a>
#### Dừng khi gặp lỗi validation đầu tiên

Đôi khi bạn muốn dừng chạy các validation rule của một attribute ngay sau lần validation thất bại đầu tiên. Để làm điều đó, hãy gán rule `bail` cho attribute:

```php
$request->validate([
    'title' => ['bail', 'required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

Trong ví dụ này, nếu rule `unique` của attribute `title` thất bại thì rule `max` sẽ không được kiểm tra. Các rule được validation theo đúng thứ tự chúng được khai báo.

<a name="a-note-on-nested-attributes"></a>
#### Lưu ý về attribute lồng nhau

Nếu HTTP request đầu vào chứa dữ liệu field "lồng nhau", bạn có thể khai báo các field này trong validation rule bằng cú pháp "dot":

```php
$request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'author.name' => ['required'],
    'author.description' => ['required'],
]);
```

Ngược lại, nếu tên field thực sự chứa dấu chấm, bạn có thể ngăn Laravel diễn giải nó theo cú pháp "dot" bằng cách escape dấu chấm bằng dấu gạch chéo ngược:

```php
$request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'v1\.0' => ['required'],
]);
```

<a name="quick-displaying-the-validation-errors"></a>
### Hiển thị lỗi validation

Vậy điều gì xảy ra nếu các field trong request đầu vào không vượt qua những validation rule đã cho? Như đã đề cập, Laravel sẽ tự động chuyển hướng người dùng về vị trí trước đó. Đồng thời, toàn bộ lỗi validation và [input của request](/docs/{{version}}/requests#retrieving-old-input) sẽ tự động được [flash vào session](/docs/{{version}}/session#flash-data).

Middleware `Illuminate\View\Middleware\ShareErrorsFromSession`, thuộc middleware group `web`, chia sẻ biến `$errors` với tất cả view của ứng dụng. Khi middleware này được áp dụng, `$errors` luôn khả dụng trong view, vì vậy bạn có thể xem biến này là luôn được định nghĩa và sử dụng an toàn. `$errors` là một instance của `Illuminate\Support\MessageBag`. Để biết thêm về cách làm việc với object này, hãy xem [phần tài liệu tương ứng](#working-with-error-messages).

Trong ví dụ của chúng ta, khi validation thất bại, người dùng sẽ được chuyển hướng về method `create` của controller, từ đó chúng ta có thể hiển thị các thông báo lỗi trong view:

```blade
<!-- /resources/views/post/create.blade.php -->

<h1>Create Post</h1>

@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<!-- Create Post Form -->
```

<a name="quick-customizing-the-error-messages"></a>
#### Tùy chỉnh thông báo lỗi

Mỗi validation rule tích hợp sẵn của Laravel đều có một thông báo lỗi nằm trong file `lang/en/validation.php` của ứng dụng. Nếu ứng dụng chưa có thư mục `lang`, bạn có thể yêu cầu Laravel tạo thư mục này bằng Artisan command `lang:publish`.

Trong file `lang/en/validation.php`, bạn sẽ thấy một translation entry cho từng validation rule. Bạn có thể thay đổi các thông báo này theo nhu cầu của ứng dụng.

Ngoài ra, bạn có thể sao chép file này sang thư mục ngôn ngữ khác để dịch thông báo theo ngôn ngữ của ứng dụng. Để tìm hiểu thêm về localization trong Laravel, hãy xem đầy đủ [tài liệu localization](/docs/{{version}}/localization).

> [!WARNING]
> Theo mặc định, bộ khung ứng dụng Laravel không bao gồm thư mục `lang`. Nếu muốn tùy chỉnh các file ngôn ngữ của Laravel, bạn có thể publish chúng bằng Artisan command `lang:publish`.

<a name="quick-xhr-requests-and-validation"></a>
#### XHR Request và Validation

Trong ví dụ này, chúng ta sử dụng form truyền thống để gửi dữ liệu đến ứng dụng. Tuy nhiên, nhiều ứng dụng nhận XHR request từ frontend chạy bằng JavaScript. Khi sử dụng method `validate` với XHR request, Laravel sẽ không tạo redirect response. Thay vào đó, Laravel tạo [JSON response chứa toàn bộ lỗi validation](#validation-error-response-format). JSON response này được gửi với HTTP status code 422.

<a name="the-at-error-directive"></a>
#### Directive `@error`

Bạn có thể sử dụng directive `@error` của [Blade](/docs/{{version}}/blade) để nhanh chóng xác định một attribute có thông báo lỗi validation hay không. Bên trong directive `@error`, bạn có thể xuất biến `$message` để hiển thị thông báo lỗi:

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input
    id="title"
    type="text"
    name="title"
    class="@error('title') is-invalid @enderror"
/>

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

Nếu đang sử dụng [error bag có tên](#named-error-bags), bạn có thể truyền tên của error bag làm đối số thứ hai cho directive `@error`:

```blade
<input ... class="@error('title', 'post') is-invalid @enderror">
```

<a name="repopulating-forms"></a>
### Điền lại dữ liệu cho form

Khi Laravel tạo redirect response do lỗi validation, framework sẽ tự động [flash toàn bộ input của request vào session](/docs/{{version}}/session#flash-data). Nhờ đó, bạn có thể thuận tiện truy cập lại input trong request tiếp theo và điền lại form mà người dùng đã cố gắng gửi.

Để lấy input đã được flash từ request trước, hãy gọi method `old` trên một instance của `Illuminate\Http\Request`. Method `old` sẽ lấy dữ liệu input đã được flash trước đó từ [session](/docs/{{version}}/session):

```php
$title = $request->old('title');
```

Laravel cũng cung cấp helper global `old`. Nếu hiển thị old input trong một [Blade template](/docs/{{version}}/blade), sử dụng helper `old` sẽ thuận tiện hơn để điền lại form. Nếu field tương ứng không có old input, `null` sẽ được trả về:

```blade
<input type="text" name="title" value="{{ old('title') }}">
```

<a name="a-note-on-optional-fields"></a>
### Lưu ý về các field tùy chọn

Theo mặc định, Laravel bao gồm middleware `TrimStrings` và `ConvertEmptyStringsToNull` trong global middleware stack của ứng dụng. Vì vậy, bạn thường cần đánh dấu các field request "tùy chọn" là `nullable` nếu không muốn validator xem giá trị `null` là không hợp lệ. Ví dụ:

```php
$request->validate([
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
    'publish_at' => ['nullable', 'date'],
]);
```

Trong ví dụ này, chúng ta chỉ định rằng field `publish_at` có thể là `null` hoặc một biểu diễn ngày hợp lệ. Nếu không thêm modifier `nullable` vào định nghĩa rule, validator sẽ xem `null` là một giá trị ngày không hợp lệ.

<a name="validation-error-response-format"></a>
### Định dạng response lỗi validation

Khi ứng dụng ném exception `Illuminate\Validation\ValidationException` và HTTP request đầu vào mong đợi JSON response, Laravel sẽ tự động định dạng các thông báo lỗi và trả về HTTP response `422 Unprocessable Entity`.

Dưới đây là ví dụ về định dạng JSON response cho lỗi validation. Lưu ý rằng các error key lồng nhau được làm phẳng theo cú pháp "dot":

```json
{
    "message": "The team name must be a string. (and 4 more errors)",
    "errors": {
        "team_name": [
            "The team name must be a string.",
            "The team name must be at least 1 characters."
        ],
        "authorization.role": [
            "The selected authorization.role is invalid."
        ],
        "users.0.email": [
            "The users.0.email field is required."
        ],
        "users.2.email": [
            "The users.2.email must be a valid email address."
        ]
    }
}
```

<a name="form-request-validation"></a>
## Validation bằng Form Request

<a name="creating-form-requests"></a>
### Tạo Form Request

Với các kịch bản validation phức tạp hơn, bạn có thể tạo một "form request". Form request là các request class tùy chỉnh đóng gói logic validation và authorization của riêng chúng. Để tạo một form request class, bạn có thể sử dụng Artisan CLI command `make:request`:

```shell
php artisan make:request StorePostRequest
```

Form request class được tạo sẽ nằm trong thư mục `app/Http/Requests`. Nếu thư mục này chưa tồn tại, Laravel sẽ tạo nó khi bạn chạy command `make:request`. Mỗi form request do Laravel tạo có hai method: `authorize` và `rules`.

Như bạn có thể đoán, method `authorize` chịu trách nhiệm xác định người dùng đang được xác thực có được phép thực hiện hành động mà request đại diện hay không, trong khi method `rules` trả về các validation rule cần áp dụng cho dữ liệu của request:

```php
/**
 * Get the validation rules that apply to the request.
 *
 * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
 */
public function rules(): array
{
    return [
        'title' => ['required', 'unique:posts', 'max:255'],
        'body' => ['required'],
    ];
}
```

> [!NOTE]
> Bạn có thể type-hint bất kỳ dependency nào cần thiết trong signature của method `rules`. Laravel sẽ tự động resolve chúng thông qua [service container](/docs/{{version}}/container).

Vậy các validation rule được đánh giá như thế nào? Bạn chỉ cần type-hint request trong controller method. Form request đầu vào sẽ được validation trước khi controller method được gọi, vì vậy bạn không cần đưa thêm logic validation vào controller:

```php
/**
 * Store a new blog post.
 */
public function store(StorePostRequest $request): RedirectResponse
{
    // The incoming request is valid...

    // Retrieve the validated input data...
    $validated = $request->validated();

    // Retrieve a portion of the validated input data...
    $validated = $request->safe()->only(['name', 'email']);
    $validated = $request->safe()->except(['name', 'email']);

    // Store the blog post...

    return redirect('/posts');
}
```

Nếu validation thất bại, Laravel sẽ tạo redirect response để đưa người dùng trở lại vị trí trước đó. Các lỗi cũng được flash vào session để có thể hiển thị. Nếu request là XHR request, Laravel sẽ trả về HTTP response có status code 422, kèm theo [biểu diễn JSON của các lỗi validation](#validation-error-response-format).

> [!NOTE]
> Cần bổ sung validation Form Request theo thời gian thực cho frontend Laravel sử dụng Inertia? Hãy xem [Laravel Precognition](/docs/{{version}}/precognition).

<a name="performing-additional-validation-on-form-requests"></a>
#### Thực hiện validation bổ sung

Đôi khi bạn cần thực hiện validation bổ sung sau khi quá trình validation ban đầu hoàn tất. Bạn có thể thực hiện việc này bằng method `after` của form request.

Method `after` phải trả về một mảng các callable hoặc closure sẽ được gọi sau khi validation hoàn tất. Các callable này nhận một instance `Illuminate\Validation\Validator`, cho phép bạn bổ sung thông báo lỗi khi cần:

```php
use Illuminate\Validation\Validator;

/**
 * Get the "after" validation callables for the request.
 */
public function after(): array
{
    return [
        function (Validator $validator) {
            if ($this->somethingElseIsInvalid()) {
                $validator->errors()->add(
                    'field',
                    'Something is wrong with this field!'
                );
            }
        }
    ];
}
```

Như đã đề cập, mảng do method `after` trả về cũng có thể chứa các invokable class. Method `__invoke` của các class này sẽ nhận một instance `Illuminate\Validation\Validator`:

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;
use Illuminate\Validation\Validator;

/**
 * Get the "after" validation callables for the request.
 */
public function after(): array
{
    return [
        new ValidateUserStatus,
        new ValidateShippingTime,
        function (Validator $validator) {
            //
        }
    ];
}
```

<a name="request-stopping-on-first-validation-rule-failure"></a>
#### Dừng khi gặp lỗi validation đầu tiên

Bằng cách thêm attribute `StopOnFirstFailure` vào request class, bạn có thể yêu cầu validator dừng validation tất cả attribute ngay khi xảy ra một lỗi validation:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\StopOnFirstFailure;
use Illuminate\Foundation\Http\FormRequest;

#[StopOnFirstFailure]
class StorePostRequest extends FormRequest
{
    // ...
}
```

<a name="request-failing-on-unknown-fields"></a>
#### Thất bại khi có field không xác định

Bằng cách thêm attribute `FailOnUnknownFields` vào request class, bạn có thể yêu cầu Laravel từ chối mọi field đầu vào không được định nghĩa trong validation rule của request:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\FailOnUnknownFields;
use Illuminate\Foundation\Http\FormRequest;

#[FailOnUnknownFields]
class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string'],
            'body' => ['required', 'string'],
        ];
    }
}
```

Bạn cũng có thể bật hành vi này trên toàn cục cho tất cả form request từ `AppServiceProvider`:

```php
use Illuminate\Foundation\Http\FormRequest;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    FormRequest::failOnUnknownFields();
}
```

Nếu cần, bạn có thể tắt hành vi này cho một request cụ thể bằng cách truyền `false` vào attribute:

```php
#[FailOnUnknownFields(false)]
class PublicWebhookRequest extends FormRequest
{
    // ...
}
```

Việc từ chối các field không xác định có thể tăng mức bảo vệ trước các vấn đề kiểu mass assignment bằng cách ngăn những input key ngoài dự kiến đi sâu hơn vào ứng dụng. Tuy nhiên, bạn vẫn nên cấu hình các property `$fillable` / `$guarded` của model và chỉ lưu dữ liệu đầu vào đáng tin cậy đã được validation.

<a name="customizing-the-redirect-location"></a>
#### Tùy chỉnh vị trí redirect

Khi validation của form request thất bại, Laravel sẽ tạo redirect response để đưa người dùng trở lại vị trí trước đó. Tuy nhiên, bạn có thể tùy chỉnh hành vi này bằng attribute `RedirectTo` trên form request:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\RedirectTo;
use Illuminate\Foundation\Http\FormRequest;

#[RedirectTo('/dashboard')]
class StorePostRequest extends FormRequest
{
    // ...
}
```

Hoặc, nếu muốn redirect người dùng tới một named route, bạn có thể sử dụng attribute `RedirectToRoute` thay thế:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\RedirectToRoute;
use Illuminate\Foundation\Http\FormRequest;

#[RedirectToRoute('dashboard')]
class StorePostRequest extends FormRequest
{
    // ...
}
```

<a name="customizing-the-error-bag"></a>
#### Tùy chỉnh Error Bag

Khi validation của form request thất bại, các lỗi sẽ được flash vào error bag `default`. Nếu cần lưu lỗi vào một [error bag có tên](#named-error-bags) khác, bạn có thể sử dụng attribute `ErrorBag` trên form request:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\Attributes\ErrorBag;
use Illuminate\Foundation\Http\FormRequest;

#[ErrorBag('login')]
class LoginRequest extends FormRequest
{
    // ...
}
```

<a name="authorizing-form-requests"></a>
### Phân quyền cho Form Request

Form request class cũng chứa method `authorize`. Trong method này, bạn có thể xác định người dùng đã xác thực có thực sự được phép cập nhật một resource cụ thể hay không. Ví dụ, bạn có thể kiểm tra người dùng có sở hữu blog comment mà họ đang cố cập nhật hay không. Trong phần lớn trường hợp, bạn sẽ tương tác với [authorization Gate và Policy](/docs/{{version}}/authorization) trong method này:

```php
use App\Models\Comment;

/**
 * Determine if the user is authorized to make this request.
 */
public function authorize(): bool
{
    $comment = Comment::find($this->route('comment'));

    return $comment && $this->user()->can('update', $comment);
}
```

Vì mọi form request đều kế thừa request class cơ sở của Laravel, chúng ta có thể dùng method `user` để truy cập người dùng hiện đang được xác thực. Đồng thời, hãy chú ý lời gọi method `route` trong ví dụ trên. Method này cho phép truy cập các URI parameter được định nghĩa trên route đang được gọi, chẳng hạn parameter `{comment}` trong ví dụ sau:

```php
Route::post('/comment/{comment}');
```

Do đó, nếu ứng dụng đang sử dụng [route model binding](/docs/{{version}}/routing#route-model-binding), bạn có thể viết code ngắn gọn hơn bằng cách truy cập model đã được resolve như một property của request:

```php
return $this->user()->can('update', $this->comment);
```

Nếu method `authorize` trả về `false`, Laravel sẽ tự động trả về HTTP response có status code 403 và controller method sẽ không được thực thi.

Nếu dự định xử lý logic authorization của request ở một phần khác trong ứng dụng, bạn có thể xóa hoàn toàn method `authorize`, hoặc đơn giản trả về `true`:

```php
/**
 * Determine if the user is authorized to make this request.
 */
public function authorize(): bool
{
    return true;
}
```

> [!NOTE]
> Bạn có thể type-hint bất kỳ dependency nào cần thiết trong signature của method `authorize`. Laravel sẽ tự động resolve chúng thông qua [service container](/docs/{{version}}/container).

<a name="customizing-the-error-messages"></a>
### Tùy chỉnh thông báo lỗi

Bạn có thể tùy chỉnh các thông báo lỗi mà form request sử dụng bằng cách override method `messages`. Method này phải trả về một mảng gồm các cặp attribute / rule và thông báo lỗi tương ứng:

```php
/**
 * Get the error messages for the defined validation rules.
 *
 * @return array<string, string>
 */
public function messages(): array
{
    return [
        'title.required' => 'A title is required',
        'body.required' => 'A message is required',
    ];
}
```

<a name="customizing-the-validation-attributes"></a>
#### Tùy chỉnh tên attribute trong thông báo validation

Nhiều thông báo lỗi của validation rule tích hợp sẵn trong Laravel chứa placeholder `:attribute`. Nếu muốn thay `:attribute` trong thông báo validation bằng một tên attribute tùy chỉnh, bạn có thể khai báo các tên tùy chỉnh bằng cách override method `attributes`. Method này phải trả về một mảng gồm các cặp attribute / tên:

```php
/**
 * Get custom attributes for validator errors.
 *
 * @return array<string, string>
 */
public function attributes(): array
{
    return [
        'email' => 'email address',
    ];
}
```

<a name="preparing-input-for-validation"></a>
### Chuẩn bị input trước khi validation

Nếu cần chuẩn bị hoặc làm sạch dữ liệu từ request trước khi áp dụng validation rule, bạn có thể sử dụng method `prepareForValidation`:

```php
use Illuminate\Support\Str;

/**
 * Prepare the data for validation.
 */
protected function prepareForValidation(): void
{
    $this->merge([
        'slug' => Str::slug($this->slug),
    ]);
}
```

Tương tự, nếu cần chuẩn hóa dữ liệu request sau khi validation hoàn tất, bạn có thể sử dụng method `passedValidation`:

```php
/**
 * Handle a passed validation attempt.
 */
protected function passedValidation(): void
{
    $this->replace(['name' => 'Taylor']);
}
```

<a name="manually-creating-validators"></a>
## Tạo Validator thủ công

Nếu không muốn sử dụng method `validate` trên request, bạn có thể tạo thủ công một validator instance bằng [facade](/docs/{{version}}/facades) `Validator`. Method `make` trên facade sẽ tạo một validator instance mới:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Store a new blog post.
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'unique:posts', 'max:255'],
            'body' => ['required'],
        ]);

        if ($validator->fails()) {
            return redirect('/post/create')
                ->withErrors($validator)
                ->withInput();
        }

        // Retrieve the validated input...
        $validated = $validator->validated();

        // Retrieve a portion of the validated input...
        $validated = $validator->safe()->only(['name', 'email']);
        $validated = $validator->safe()->except(['name', 'email']);

        // Store the blog post...

        return redirect('/posts');
    }
}
```

Argument đầu tiên truyền vào method `make` là dữ liệu cần validation. Argument thứ hai là mảng các validation rule sẽ được áp dụng cho dữ liệu đó.

Sau khi xác định validation của request thất bại, bạn có thể dùng method `withErrors` để flash các thông báo lỗi vào session. Khi sử dụng method này, biến `$errors` sẽ tự động được chia sẻ với view sau khi redirect, giúp bạn dễ dàng hiển thị lỗi cho người dùng. Method `withErrors` chấp nhận một validator, một `MessageBag` hoặc một PHP `array`.

#### Dừng khi gặp lỗi validation đầu tiên

Method `stopOnFirstFailure` yêu cầu validator dừng validation tất cả attribute ngay khi xuất hiện một lỗi validation:

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="automatic-redirection"></a>
### Redirect tự động

Nếu muốn tạo validator instance thủ công nhưng vẫn tận dụng cơ chế redirect tự động mà method `validate` của HTTP request cung cấp, bạn có thể gọi method `validate` trên validator instance hiện có. Nếu validation thất bại, người dùng sẽ tự động được redirect; với XHR request, Laravel sẽ [trả về JSON response](#validation-error-response-format):

```php
Validator::make($request->all(), [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
])->validate();
```

Bạn có thể sử dụng method `validateWithBag` để lưu các thông báo lỗi vào một [error bag có tên](#named-error-bags) nếu validation thất bại:

```php
Validator::make($request->all(), [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
])->validateWithBag('post');
```

<a name="named-error-bags"></a>
### Error Bag có tên

Nếu có nhiều form trên cùng một trang, bạn có thể đặt tên cho `MessageBag` chứa lỗi validation để lấy thông báo lỗi của từng form cụ thể. Để thực hiện, hãy truyền tên làm argument thứ hai cho `withErrors`:

```php
return redirect('/register')->withErrors($validator, 'login');
```

Sau đó, bạn có thể truy cập `MessageBag` có tên từ biến `$errors`:

```blade
{{ $errors->login->first('email') }}
```

<a name="manual-customizing-the-error-messages"></a>
### Tùy chỉnh thông báo lỗi

Khi cần, bạn có thể cung cấp các thông báo lỗi tùy chỉnh để validator instance sử dụng thay cho thông báo mặc định của Laravel. Có nhiều cách khai báo thông báo tùy chỉnh. Trước hết, bạn có thể truyền chúng làm argument thứ ba cho method `Validator::make`:

```php
$validator = Validator::make($input, $rules, $messages = [
    'required' => 'The :attribute field is required.',
]);
```

Trong ví dụ này, placeholder `:attribute` sẽ được thay bằng tên thực tế của field đang được validation. Bạn cũng có thể sử dụng các placeholder khác trong thông báo validation. Ví dụ:

```php
$messages = [
    'same' => 'The :attribute and :other must match.',
    'size' => 'The :attribute must be exactly :size.',
    'between' => 'The :attribute value :input is not between :min - :max.',
    'in' => 'The :attribute must be one of the following types: :values',
];
```

<a name="specifying-a-custom-message-for-a-given-attribute"></a>
#### Chỉ định thông báo tùy chỉnh cho một attribute cụ thể

Đôi khi bạn chỉ muốn chỉ định thông báo lỗi tùy chỉnh cho một attribute cụ thể. Bạn có thể thực hiện bằng cú pháp "dot": khai báo tên attribute trước, sau đó là rule:

```php
$messages = [
    'email.required' => 'We need to know your email address!',
];
```

<a name="specifying-custom-attribute-values"></a>
#### Chỉ định giá trị attribute tùy chỉnh

Nhiều thông báo lỗi tích hợp sẵn của Laravel chứa placeholder `:attribute`, được thay bằng tên field hoặc attribute đang được validation. Để tùy chỉnh giá trị thay thế placeholder này cho các field cụ thể, bạn có thể truyền một mảng custom attribute làm argument thứ tư cho method `Validator::make`:

```php
$validator = Validator::make($input, $rules, $messages, [
    'email' => 'email address',
]);
```

<a name="performing-additional-validation"></a>
### Thực hiện validation bổ sung

Đôi khi bạn cần thực hiện validation bổ sung sau khi validation ban đầu hoàn tất. Bạn có thể làm điều này bằng method `after` của validator. Method `after` chấp nhận một closure hoặc một mảng callable được gọi sau khi validation hoàn tất. Các callable này nhận một instance `Illuminate\Validation\Validator`, cho phép bạn bổ sung thông báo lỗi khi cần:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make(/* ... */);

$validator->after(function ($validator) {
    if ($this->somethingElseIsInvalid()) {
        $validator->errors()->add(
            'field', 'Something is wrong with this field!'
        );
    }
});

if ($validator->fails()) {
    // ...
}
```

Như đã đề cập, method `after` cũng chấp nhận một mảng callable. Cách này đặc biệt thuận tiện khi logic "sau validation" được đóng gói trong các invokable class; các class này sẽ nhận một instance `Illuminate\Validation\Validator` thông qua method `__invoke`:

```php
use App\Validation\ValidateShippingTime;
use App\Validation\ValidateUserStatus;

$validator->after([
    new ValidateUserStatus,
    new ValidateShippingTime,
    function ($validator) {
        // ...
    },
]);
```

<a name="working-with-validated-input"></a>
## Làm việc với input đã được validation

Sau khi validation dữ liệu request đầu vào bằng form request hoặc validator instance được tạo thủ công, bạn có thể cần lấy phần dữ liệu thực sự đã trải qua validation. Có nhiều cách thực hiện. Trước hết, bạn có thể gọi method `validated` trên form request hoặc validator instance. Method này trả về một mảng dữ liệu đã được validation:

```php
$validated = $request->validated();

$validated = $validator->validated();
```

Ngoài ra, bạn có thể gọi method `safe` trên form request hoặc validator instance. Method này trả về một instance `Illuminate\Support\ValidatedInput`. Object này cung cấp các method `only`, `except` và `all` để lấy một phần hoặc toàn bộ dữ liệu đã được validation:

```php
$validated = $request->safe()->only(['name', 'email']);

$validated = $request->safe()->except(['name', 'email']);

$validated = $request->safe()->all();
```

Ngoài ra, instance `Illuminate\Support\ValidatedInput` có thể được duyệt và truy cập giống như một array:

```php
// Validated data may be iterated...
foreach ($request->safe() as $key => $value) {
    // ...
}

// Validated data may be accessed as an array...
$validated = $request->safe();

$email = $validated['email'];
```

Nếu muốn thêm field vào dữ liệu đã được validation, bạn có thể gọi method `merge`:

```php
$validated = $request->safe()->merge(['name' => 'Taylor Otwell']);
```

Nếu muốn lấy dữ liệu đã được validation dưới dạng một instance [collection](/docs/{{version}}/collections), bạn có thể gọi method `collect`:

```php
$collection = $request->safe()->collect();
```

<a name="working-with-error-messages"></a>
## Làm việc với thông báo lỗi

Sau khi gọi method `errors` trên một `Validator` instance, bạn sẽ nhận được một instance `Illuminate\Support\MessageBag`, cung cấp nhiều method tiện lợi để làm việc với thông báo lỗi. Biến `$errors` được Laravel tự động cung cấp cho mọi view cũng là một instance của class `MessageBag`.

<a name="retrieving-the-first-error-message-for-a-field"></a>
#### Lấy thông báo lỗi đầu tiên của một field

Để lấy thông báo lỗi đầu tiên của một field cụ thể, hãy sử dụng method `first`:

```php
$errors = $validator->errors();

echo $errors->first('email');
```

<a name="retrieving-all-error-messages-for-a-field"></a>
#### Lấy tất cả thông báo lỗi của một field

Nếu cần lấy một mảng chứa tất cả thông báo lỗi của một field cụ thể, hãy sử dụng method `get`:

```php
foreach ($errors->get('email') as $message) {
    // ...
}
```

Nếu đang validation một field dạng mảng, bạn có thể lấy tất cả thông báo của từng phần tử trong mảng bằng ký tự `*`:

```php
foreach ($errors->get('attachments.*') as $message) {
    // ...
}
```

<a name="retrieving-all-error-messages-for-all-fields"></a>
#### Lấy tất cả thông báo lỗi của mọi field

Để lấy một mảng chứa tất cả thông báo của mọi field, hãy sử dụng method `all`:

```php
foreach ($errors->all() as $message) {
    // ...
}
```

<a name="determining-if-messages-exist-for-a-field"></a>
#### Kiểm tra một field có thông báo lỗi hay không

Method `has` có thể được dùng để kiểm tra một field cụ thể có bất kỳ thông báo lỗi nào hay không:

```php
if ($errors->has('email')) {
    // ...
}
```

<a name="specifying-custom-messages-in-language-files"></a>
### Khai báo thông báo tùy chỉnh trong file ngôn ngữ

Mỗi validation rule tích hợp sẵn của Laravel đều có một thông báo lỗi nằm trong file `lang/en/validation.php` của ứng dụng. Nếu ứng dụng chưa có thư mục `lang`, bạn có thể yêu cầu Laravel tạo thư mục này bằng Artisan command `lang:publish`.

Trong file `lang/en/validation.php`, bạn sẽ thấy một translation entry cho từng validation rule. Bạn có thể thay đổi các thông báo này theo nhu cầu của ứng dụng.

Ngoài ra, bạn có thể sao chép file này sang thư mục ngôn ngữ khác để dịch thông báo theo ngôn ngữ của ứng dụng. Để tìm hiểu thêm về localization trong Laravel, hãy xem đầy đủ [tài liệu localization](/docs/{{version}}/localization).

> [!WARNING]
> Theo mặc định, bộ khung ứng dụng Laravel không bao gồm thư mục `lang`. Nếu muốn tùy chỉnh các file ngôn ngữ của Laravel, bạn có thể publish chúng bằng Artisan command `lang:publish`.

<a name="custom-messages-for-specific-attributes"></a>
#### Thông báo tùy chỉnh cho attribute cụ thể

Bạn có thể tùy chỉnh thông báo lỗi cho từng tổ hợp attribute và rule cụ thể trong file ngôn ngữ validation của ứng dụng. Để thực hiện, hãy thêm các thông báo tùy chỉnh vào mảng `custom` trong file `lang/xx/validation.php` của ứng dụng:

```php
'custom' => [
    'email' => [
        'required' => 'We need to know your email address!',
        'max' => 'Your email address is too long!'
    ],
],
```

<a name="specifying-attribute-in-language-files"></a>
### Khai báo tên attribute trong file ngôn ngữ

Nhiều thông báo lỗi tích hợp sẵn của Laravel chứa placeholder `:attribute`, placeholder này sẽ được thay bằng tên field hoặc attribute đang được validation. Nếu muốn phần `:attribute` trong thông báo validation được thay bằng một giá trị tùy chỉnh, bạn có thể khai báo tên attribute tùy chỉnh trong mảng `attributes` của file ngôn ngữ `lang/xx/validation.php`:

```php
'attributes' => [
    'email' => 'email address',
],
```

> [!WARNING]
> Theo mặc định, bộ khung ứng dụng Laravel không bao gồm thư mục `lang`. Nếu muốn tùy chỉnh các file ngôn ngữ của Laravel, bạn có thể publish chúng bằng Artisan command `lang:publish`.

<a name="specifying-values-in-language-files"></a>
### Khai báo giá trị trong file ngôn ngữ

Một số thông báo lỗi của validation rule tích hợp sẵn trong Laravel chứa placeholder `:value`, placeholder này được thay bằng giá trị hiện tại của request attribute. Tuy nhiên, đôi khi bạn có thể muốn phần `:value` trong thông báo validation được thay bằng cách biểu diễn thân thiện hơn. Ví dụ, rule sau yêu cầu số thẻ tín dụng khi `payment_type` có giá trị `cc`:

```php
Validator::make($request->all(), [
    'credit_card_number' => ['required_if:payment_type,cc']
]);
```

Nếu validation rule này thất bại, nó sẽ tạo ra thông báo lỗi sau:

```text
The credit card number field is required when payment type is cc.
```

Thay vì hiển thị `cc` làm giá trị loại thanh toán, bạn có thể khai báo cách biểu diễn thân thiện hơn trong file ngôn ngữ `lang/xx/validation.php` bằng cách định nghĩa mảng `values`:

```php
'values' => [
    'payment_type' => [
        'cc' => 'credit card'
    ],
],
```

> [!WARNING]
> Theo mặc định, bộ khung ứng dụng Laravel không bao gồm thư mục `lang`. Nếu muốn tùy chỉnh các file ngôn ngữ của Laravel, bạn có thể publish chúng bằng Artisan command `lang:publish`.

Sau khi định nghĩa giá trị này, validation rule sẽ tạo ra thông báo lỗi sau:

```text
The credit card number field is required when payment type is credit card.
```

<a name="available-validation-rules"></a>
## Các Validation Rule có sẵn

Dưới đây là danh sách tất cả validation rule có sẵn cùng chức năng của chúng:

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

#### Boolean

<div class="collection-method-list" markdown="1">

[Accepted](#rule-accepted)
[Accepted If](#rule-accepted-if)
[Boolean](#rule-boolean)
[Declined](#rule-declined)
[Declined If](#rule-declined-if)

</div>

#### Chuỗi

<div class="collection-method-list" markdown="1">

[Active URL](#rule-active-url)
[Alpha](#rule-alpha)
[Alpha Dash](#rule-alpha-dash)
[Alpha Numeric](#rule-alpha-num)
[Ascii](#rule-ascii)
[Confirmed](#rule-confirmed)
[Current Password](#rule-current-password)
[Different](#rule-different)
[Doesnt Start With](#rule-doesnt-start-with)
[Doesnt End With](#rule-doesnt-end-with)
[Email](#rule-email)
[Ends With](#rule-ends-with)
[Enum](#rule-enum)
[Hex Color](#rule-hex-color)
[In](#rule-in)
[IP Address](#rule-ip)
[JSON](#rule-json)
[Lowercase](#rule-lowercase)
[MAC Address](#rule-mac)
[Max](#rule-max)
[Min](#rule-min)
[Not In](#rule-not-in)
[Regular Expression](#rule-regex)
[Not Regular Expression](#rule-not-regex)
[Same](#rule-same)
[Size](#rule-size)
[Starts With](#rule-starts-with)
[String](#rule-string)
[Uppercase](#rule-uppercase)
[URL](#rule-url)
[ULID](#rule-ulid)
[UUID](#rule-uuid)

</div>

#### Số

<div class="collection-method-list" markdown="1">

[Between](#rule-between)
[Decimal](#rule-decimal)
[Different](#rule-different)
[Digits](#rule-digits)
[Digits Between](#rule-digits-between)
[Greater Than](#rule-gt)
[Greater Than Or Equal](#rule-gte)
[Integer](#rule-integer)
[Less Than](#rule-lt)
[Less Than Or Equal](#rule-lte)
[Max](#rule-max)
[Max Digits](#rule-max-digits)
[Min](#rule-min)
[Min Digits](#rule-min-digits)
[Multiple Of](#rule-multiple-of)
[Numeric](#rule-numeric)
[Same](#rule-same)
[Size](#rule-size)

</div>

#### Mảng

<div class="collection-method-list" markdown="1">

[Array](#rule-array)
[Array Keys](#rule-array-keys)
[Between](#rule-between)
[Contains](#rule-contains)
[Doesnt Contain](#rule-doesnt-contain)
[Distinct](#rule-distinct)
[In Array](#rule-in-array)
[In Array Keys](#rule-in-array-keys)
[List](#rule-list)
[Max](#rule-max)
[Min](#rule-min)
[Size](#rule-size)

</div>

#### Ngày tháng

<div class="collection-method-list" markdown="1">

[After](#rule-after)
[After Or Equal](#rule-after-or-equal)
[Before](#rule-before)
[Before Or Equal](#rule-before-or-equal)
[Date](#rule-date)
[Date Equals](#rule-date-equals)
[Date Format](#rule-date-format)
[Different](#rule-different)
[Timezone](#rule-timezone)

</div>

#### File

<div class="collection-method-list" markdown="1">

[Between](#rule-between)
[Dimensions](#rule-dimensions)
[Encoding](#rule-encoding)
[Extensions](#rule-extensions)
[File](#rule-file)
[Image](#rule-image)
[Max](#rule-max)
[Min](#rule-min)
[MIME Types](#rule-mimetypes)
[MIME Type By File Extension](#rule-mimes)
[Size](#rule-size)

</div>

#### Cơ sở dữ liệu

<div class="collection-method-list" markdown="1">

[Exists](#rule-exists)
[Unique](#rule-unique)

</div>

#### Tiện ích

<div class="collection-method-list" markdown="1">

[Any Of](#rule-anyof)
[Bail](#rule-bail)
[Exclude](#rule-exclude)
[Exclude If](#rule-exclude-if)
[Exclude Unless](#rule-exclude-unless)
[Exclude With](#rule-exclude-with)
[Exclude Without](#rule-exclude-without)
[Filled](#rule-filled)
[Missing](#rule-missing)
[Missing If](#rule-missing-if)
[Missing Unless](#rule-missing-unless)
[Missing With](#rule-missing-with)
[Missing With All](#rule-missing-with-all)
[Nullable](#rule-nullable)
[Present](#rule-present)
[Present If](#rule-present-if)
[Present Unless](#rule-present-unless)
[Present With](#rule-present-with)
[Present With All](#rule-present-with-all)
[Prohibited](#rule-prohibited)
[Prohibited If](#rule-prohibited-if)
[Prohibited If Accepted](#rule-prohibited-if-accepted)
[Prohibited If Declined](#rule-prohibited-if-declined)
[Prohibited Unless](#rule-prohibited-unless)
[Prohibits](#rule-prohibits)
[Required](#rule-required)
[Required If](#rule-required-if)
[Required If Accepted](#rule-required-if-accepted)
[Required If Declined](#rule-required-if-declined)
[Required Unless](#rule-required-unless)
[Required With](#rule-required-with)
[Required With All](#rule-required-with-all)
[Required Without](#rule-required-without)
[Required Without All](#rule-required-without-all)
[Required Array Keys](#rule-required-array-keys)
[Sometimes](#validating-when-present)

</div>

<a name="rule-accepted"></a>
#### accepted

Field đang được validation phải có giá trị `"yes"`, `"on"`, `1`, `"1"`, `true` hoặc `"true"`. Rule này hữu ích khi validation việc chấp nhận "Điều khoản dịch vụ" hoặc các field tương tự.

<a name="rule-accepted-if"></a>
#### accepted_if:anotherfield,value,...

Field đang được validation phải có giá trị `"yes"`, `"on"`, `1`, `"1"`, `true` hoặc `"true"` nếu một field khác đang được validation bằng giá trị được chỉ định. Rule này hữu ích khi validation việc chấp nhận "Điều khoản dịch vụ" hoặc các field tương tự.

<a name="rule-active-url"></a>
#### active_url

Field đang được validation phải có bản ghi A hoặc AAAA hợp lệ theo PHP function `dns_get_record`. Hostname của URL được cung cấp sẽ được trích xuất bằng PHP function `parse_url` trước khi truyền vào `dns_get_record`.

Khi test các validation rule thực hiện DNS lookup như `active_url` và `email:dns`, bạn có thể sử dụng method `Validator::fakeDnsLookups`. Method này giả lập DNS lookup nhưng vẫn giữ nguyên các hành vi validation khác của rule:

```php
use Illuminate\Support\Facades\Validator;

Validator::fakeDnsLookups();
```

<a name="rule-after"></a>
#### after:_date_

Field đang được validation phải có giá trị sau ngày được chỉ định. Các ngày sẽ được truyền vào PHP function `strtotime` để chuyển thành một instance `DateTime` hợp lệ:

```php
'start_date' => ['required', 'date', 'after:tomorrow']
```

Thay vì truyền chuỗi ngày để `strtotime` xử lý, bạn có thể chỉ định một field khác để so sánh ngày:

```php
'finish_date' => ['required', 'date', 'after:start_date']
```

Để thuận tiện, các rule dựa trên ngày có thể được xây dựng bằng fluent `date` rule builder:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->after(today()->addDays(7)),
],
```

Các method `afterToday` và `todayOrAfter` có thể được dùng để diễn đạt lần lượt rằng ngày phải sau hôm nay, hoặc bằng hôm nay hay sau hôm nay:

```php
'start_date' => [
    'required',
    Rule::date()->afterToday(),
],
```

<a name="rule-after-or-equal"></a>
#### after\_or\_equal:_date_

Field đang được validation phải có giá trị sau hoặc bằng ngày được chỉ định. Xem rule [after](#rule-after) để biết thêm thông tin.

Để thuận tiện, các rule dựa trên ngày có thể được xây dựng bằng fluent `date` rule builder:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->afterOrEqual(today()->addDays(7)),
],
```

<a name="rule-anyof"></a>
#### anyOf

Validation rule `Rule::anyOf` cho phép bạn quy định field đang được validation chỉ cần thỏa mãn một trong các bộ validation rule được cung cấp. Ví dụ, rule sau xác thực field `username` phải là địa chỉ email hoặc chuỗi chữ-số (có thể chứa dấu gạch ngang) dài ít nhất 6 ký tự:

```php
use Illuminate\Validation\Rule;

'username' => [
    'required',
    Rule::anyOf([
        ['string', 'email'],
        ['string', 'alpha_dash', 'min:6'],
    ]),
],
```

<a name="rule-alpha"></a>
#### alpha

Field đang được validate phải hoàn toàn gồm các ký tự chữ cái Unicode nằm trong [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=) và [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=).

Để giới hạn validation rule này ở các ký tự trong phạm vi ASCII (`a-z` và `A-Z`), bạn có thể truyền option `ascii` cho rule:

```php
'username' => ['alpha:ascii'],
```

<a name="rule-alpha-dash"></a>
#### alpha_dash

Field đang được validate phải hoàn toàn gồm các ký tự chữ và số Unicode nằm trong [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=), [\p{N}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=), cùng với dấu gạch ngang ASCII (`-`) và dấu gạch dưới ASCII (`_`).

Để giới hạn validation rule này ở các ký tự trong phạm vi ASCII (`a-z`, `A-Z` và `0-9`), bạn có thể truyền option `ascii` cho rule:

```php
'username' => ['alpha_dash:ascii'],
```

<a name="rule-alpha-num"></a>
#### alpha_num

Field đang được validate phải hoàn toàn gồm các ký tự chữ và số Unicode nằm trong [\p{L}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AL%3A%5D&g=&i=), [\p{M}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AM%3A%5D&g=&i=) và [\p{N}](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AN%3A%5D&g=&i=).

Để giới hạn validation rule này ở các ký tự trong phạm vi ASCII (`a-z`, `A-Z` và `0-9`), bạn có thể truyền option `ascii` cho rule:

```php
'username' => ['alpha_num:ascii'],
```

<a name="rule-array"></a>
#### array

Field đang được validate phải là một PHP `array`.

Khi truyền thêm value cho rule `array`, mỗi key trong input array phải xuất hiện trong danh sách value được truyền cho rule. Trong ví dụ sau, key `admin` trong input array không hợp lệ vì không nằm trong danh sách value của rule `array`:

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'user' => [
        'name' => 'Taylor Otwell',
        'username' => 'taylorotwell',
        'admin' => true,
    ],
];

Validator::make($input, [
    'user' => ['array:name,username'],
]);
```

Nhìn chung, bạn luôn nên chỉ định rõ các array key được phép xuất hiện trong array.

<a name="rule-array-keys"></a>
#### array_keys:_foo_,_bar_,...

Field đang được validate phải là PHP `array` và toàn bộ key của nó phải nằm trong danh sách đã cho. Cần cung cấp ít nhất một key:

```php
'user' => ['array_keys:name,username'],
```

Để thuận tiện, bạn có thể dùng method `Rule::arrayKeys`:

```php
'user' => [Rule::arrayKeys('name', 'username')],
```

<a name="rule-ascii"></a>
#### ascii

Field đang được validation phải chỉ chứa các ký tự ASCII 7-bit.

<a name="rule-bail"></a>
#### bail

Dừng chạy các validation rule của field ngay sau lỗi validation đầu tiên.

Trong khi rule `bail` chỉ dừng validation cho field cụ thể khi gặp lỗi, method `stopOnFirstFailure` yêu cầu validator dừng validation tất cả attribute ngay khi xuất hiện một lỗi validation:

```php
if ($validator->stopOnFirstFailure()->fails()) {
    // ...
}
```

<a name="rule-before"></a>
#### before:_date_

Field đang được validate phải là một giá trị đứng trước ngày đã cho. Các date sẽ được truyền vào function PHP `strtotime` để chuyển thành instance `DateTime` hợp lệ. Ngoài ra, tương tự rule [after](#rule-after), bạn có thể truyền tên của một field khác đang được validate làm value của `date`.

Để thuận tiện, các rule dựa trên date cũng có thể được xây dựng bằng fluent `date` rule builder:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->before(today()->subDays(7)),
],
```

Bạn có thể dùng method `beforeToday` và `todayOrBefore` để diễn đạt theo fluent API rằng date phải trước hôm nay, hoặc phải là hôm nay hay trước đó:

```php
'start_date' => [
    'required',
    Rule::date()->beforeToday(),
],
```

<a name="rule-before-or-equal"></a>
#### before\_or\_equal:_date_

Field đang được validate phải là một giá trị đứng trước hoặc bằng ngày đã cho. Các date sẽ được truyền vào function PHP `strtotime` để chuyển thành instance `DateTime` hợp lệ. Ngoài ra, tương tự rule [after](#rule-after), bạn có thể truyền tên của một field khác đang được validate làm value của `date`.

Để thuận tiện, các rule dựa trên date cũng có thể được xây dựng bằng fluent `date` rule builder:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->beforeOrEqual(today()->subDays(7)),
],
```

<a name="rule-between"></a>
#### between:_min_,_max_

Field đang được validation phải có kích thước nằm trong khoảng _min_ đến _max_ (bao gồm hai đầu). Chuỗi, giá trị số, mảng và file được đánh giá theo cùng cách với rule [size](#rule-size).

<a name="rule-boolean"></a>
#### boolean

Field đang được validation phải có thể cast thành boolean. Các input được chấp nhận là `true`, `false`, `1`, `0`, `"1"` và `"0"`.

Bạn có thể dùng parameter `strict` để chỉ coi field là hợp lệ khi giá trị của nó là `true` hoặc `false`:

```php
'foo' => ['boolean:strict']
```

<a name="rule-confirmed"></a>
#### confirmed

Field đang được validation phải có field `{field}_confirmation` tương ứng và có cùng giá trị. Ví dụ, nếu field đang validation là `password`, input phải có field `password_confirmation` khớp với nó.

Bạn cũng có thể truyền tên field xác nhận tùy chỉnh. Ví dụ, `confirmed:repeat_username` yêu cầu field `repeat_username` phải khớp với field đang được validation.

<a name="rule-contains"></a>
#### contains:_foo_,_bar_,...

Field đang được validate phải là một array chứa toàn bộ parameter value đã cho. Vì rule này thường yêu cầu bạn `implode` một array, bạn có thể dùng method `Rule::contains` để xây dựng rule theo fluent API:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'roles' => [
        'required',
        'array',
        Rule::contains(['admin', 'editor']),
    ],
]);
```

<a name="rule-doesnt-contain"></a>
#### doesnt_contain:_foo_,_bar_,...

Field đang được validate phải là một array không chứa bất kỳ parameter value nào đã cho. Vì rule này thường yêu cầu bạn `implode` một array, bạn có thể dùng method `Rule::doesntContain` để xây dựng rule theo fluent API:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'roles' => [
        'required',
        'array',
        Rule::doesntContain(['admin', 'editor']),
    ],
]);
```

<a name="rule-current-password"></a>
#### current_password

Field đang được validation phải khớp với mật khẩu của user đã xác thực. Bạn có thể chỉ định một [authentication guard](/docs/{{version}}/authentication) thông qua parameter đầu tiên của rule:

```php
'password' => ['current_password:api']
```

<a name="rule-date"></a>
#### date

Field đang được validation phải là một ngày hợp lệ, không phải ngày tương đối, theo PHP function `strtotime`.

<a name="rule-date-equals"></a>
#### date_equals:_date_

Field đang được validation phải bằng ngày được chỉ định. Các ngày sẽ được truyền vào PHP function `strtotime` để chuyển thành một instance `DateTime` hợp lệ.

<a name="rule-date-format"></a>
#### date_format:_format_,...

Field đang được validate phải khớp với một trong các _format_ đã cho. Khi validate một field, bạn nên dùng **hoặc** `date` **hoặc** `date_format`, không dùng đồng thời cả hai. Validation rule này hỗ trợ toàn bộ format được class PHP [DateTime](https://www.php.net/manual/en/class.datetime.php) hỗ trợ.

Để thuận tiện, các rule dựa trên ngày có thể được xây dựng bằng fluent `date` rule builder:

```php
use Illuminate\Validation\Rule;

'start_date' => [
    'required',
    Rule::date()->format('Y-m-d'),
],
```

<a name="rule-decimal"></a>
#### decimal:_min_,_max_

Field đang được validation phải là giá trị số và phải có số chữ số thập phân được chỉ định:

```php
// Must have exactly two decimal places (9.99)...
'price' => ['decimal:2']

// Must have between 2 and 4 decimal places...
'price' => ['decimal:2,4']
```

<a name="rule-declined"></a>
#### declined

Field đang được validation phải có giá trị `"no"`, `"off"`, `0`, `"0"`, `false` hoặc `"false"`.

<a name="rule-declined-if"></a>
#### declined_if:anotherfield,value,...

Field đang được validate phải là `"no"`, `"off"`, `0`, `"0"`, `false` hoặc `"false"` nếu một field khác đang được validate bằng với value đã chỉ định.

<a name="rule-different"></a>
#### different:_field_

Field đang được validation phải có giá trị khác với _field_.

<a name="rule-digits"></a>
#### digits:_value_

Số nguyên đang được validation phải có độ dài chính xác bằng _value_.

<a name="rule-digits-between"></a>
#### digits_between:_min_,_max_

Số nguyên đang được validation phải có độ dài nằm trong khoảng _min_ đến _max_.

<a name="rule-dimensions"></a>
#### dimensions

File đang được validation phải là ảnh đáp ứng các ràng buộc kích thước được chỉ định bởi parameter của rule:

```php
'avatar' => ['dimensions:min_width=100,min_height=200']
```

Các constraint có sẵn gồm: _min\_width_, _max\_width_, _min\_height_, _max\_height_, _width_, _height_, _ratio_, _min\_ratio_, _max\_ratio_.

Constraint _ratio_ được biểu diễn bằng chiều rộng chia cho chiều cao. Bạn có thể chỉ định bằng phân số như `3/2` hoặc số thực như `1.5`:

```php
'avatar' => ['dimensions:ratio=3/2']
```

Các constraint _min\_ratio_ và _max\_ratio_ có thể được dùng để xác định khoảng tỷ lệ khung hình được chấp nhận:

```php
'avatar' => ['dimensions:min_ratio=1/2,max_ratio=3/2']
```

Vì rule này cần nhiều argument, thường sẽ thuận tiện hơn khi dùng method `Rule::dimensions` để xây dựng rule theo fluent API:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'avatar' => [
        'required',
        Rule::dimensions()
            ->maxWidth(1000)
            ->maxHeight(500)
            ->ratio(3 / 2),
    ],
]);
```

Bạn cũng có thể dùng các method `minRatio`, `maxRatio` và `ratioBetween` để định nghĩa constraint tỷ lệ theo fluent API:

```php
Rule::dimensions()->ratioBetween(min: 1 / 2, max: 3 / 2)
```

<a name="rule-distinct"></a>
#### distinct

Khi validation mảng, field đang được validation không được chứa giá trị trùng lặp:

```php
'foo.*.id' => ['distinct']
```

Mặc định, `distinct` sử dụng phép so sánh lỏng. Để sử dụng so sánh nghiêm ngặt, hãy thêm parameter `strict` vào định nghĩa validation rule:

```php
'foo.*.id' => ['distinct:strict']
```

Bạn có thể thêm `ignore_case` vào argument của validation rule để rule bỏ qua khác biệt chữ hoa/chữ thường:

```php
'foo.*.id' => ['distinct:ignore_case']
```

<a name="rule-doesnt-start-with"></a>
#### doesnt_start_with:_foo_,_bar_,...

Field đang được validation không được bắt đầu bằng bất kỳ giá trị nào được cung cấp.

<a name="rule-doesnt-end-with"></a>
#### doesnt_end_with:_foo_,_bar_,...

Field đang được validation không được kết thúc bằng bất kỳ giá trị nào được cung cấp.

<a name="rule-email"></a>
#### email

Field đang được validation phải có định dạng địa chỉ email. Validation rule này sử dụng package [egulias/email-validator](https://github.com/egulias/EmailValidator) để xác thực địa chỉ email. Mặc định validator `RFCValidation` được áp dụng, nhưng bạn cũng có thể áp dụng các kiểu validation khác:

```php
'email' => ['email:rfc,dns']
```

Ví dụ trên áp dụng cả `RFCValidation` và `DNSCheckValidation`. Danh sách đầy đủ các kiểu validation có thể sử dụng gồm:

<div class="content-list" markdown="1">

- `rfc`: `RFCValidation` - Xác thực địa chỉ email theo các [RFC được hỗ trợ](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs).
- `strict`: `NoRFCWarningsValidation` - Xác thực email theo các [RFC được hỗ trợ](https://github.com/egulias/EmailValidator?tab=readme-ov-file#supported-rfcs), và thất bại khi phát hiện warning (ví dụ dấu chấm ở cuối hoặc nhiều dấu chấm liên tiếp).
- `dns`: `DNSCheckValidation` - Đảm bảo domain của địa chỉ email có bản ghi MX hợp lệ.
- `spoof`: `SpoofCheckValidation` - Đảm bảo địa chỉ email không chứa ký tự Unicode đồng hình hoặc có tính đánh lừa.
- `filter`: `FilterEmailValidation` - Đảm bảo địa chỉ email hợp lệ theo PHP function `filter_var`.
- `filter_unicode`: `FilterEmailValidation::unicode()` - Đảm bảo địa chỉ email hợp lệ theo PHP function `filter_var`, đồng thời cho phép một số ký tự Unicode.

</div>

Để thuận tiện, các email validation rule có thể được xây dựng bằng fluent rule builder:

```php
use Illuminate\Validation\Rule;

$request->validate([
    'email' => [
        'required',
        Rule::email()
            ->rfcCompliant(strict: false)
            ->validateMxRecord()
            ->preventSpoofing()
    ],
]);
```

Validator `dns` thực hiện DNS lookup thực tế để xác nhận domain của địa chỉ có bản ghi MX hợp lệ. Nó không xác định một mailbox cụ thể có thực sự tồn tại hay không.

Vì test không nên phụ thuộc vào DNS lookup thực tế, bạn có thể dùng method `Validator::fakeDnsLookups` để [giả lập DNS lookup](#rule-active-url), trong khi các validation khác được yêu cầu như `rfc` vẫn tiếp tục chạy:

```php
use Illuminate\Support\Facades\Validator;

Validator::fakeDnsLookups();
```

Điều này cho phép ứng dụng tiếp tục sử dụng các validation rule hiện có trong quá trình test:

```php
'email' => ['required', 'email:rfc,dns'],
```

> [!WARNING]
> Các validator `dns` và `spoof` yêu cầu PHP extension `intl`.

<a name="rule-encoding"></a>
#### encoding:*encoding_type*

Field đang được validation phải khớp với character encoding được chỉ định. Rule này sử dụng PHP function `mb_check_encoding` để kiểm tra encoding của file hoặc chuỗi được cung cấp. Để thuận tiện, rule `encoding` có thể được xây dựng bằng fluent file rule builder của Laravel:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'attachment' => [
        'required',
        File::types(['csv'])
            ->encoding('utf-8'),
    ],
]);
```

<a name="rule-ends-with"></a>
#### ends_with:_foo_,_bar_,...

Field đang được validation phải kết thúc bằng một trong các giá trị được cung cấp.

<a name="rule-enum"></a>
#### enum

Rule `Enum` là rule dựa trên class, dùng để kiểm tra field đang được validation có chứa enum value hợp lệ hay không. `Enum` nhận tên enum làm constructor argument duy nhất. Khi validation primitive value, nên truyền một backed Enum cho rule `Enum`:

```php
use App\Enums\ServerStatus;
use Illuminate\Validation\Rule;

$request->validate([
    'status' => [Rule::enum(ServerStatus::class)],
]);
```

Các method `only` và `except` của rule `Enum` có thể được dùng để giới hạn những enum case được coi là hợp lệ:

```php
Rule::enum(ServerStatus::class)
    ->only([ServerStatus::Pending, ServerStatus::Active]);

Rule::enum(ServerStatus::class)
    ->except([ServerStatus::Pending, ServerStatus::Active]);
```

Method `when` có thể được dùng để thay đổi rule `Enum` theo điều kiện:

```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

Rule::enum(ServerStatus::class)
    ->when(
        Auth::user()->isAdmin(),
        fn ($rule) => $rule->only(...),
        fn ($rule) => $rule->only(...),
    );
```

<a name="rule-exclude"></a>
#### exclude

Field đang được validation sẽ bị loại khỏi request data do các method `validate` và `validated` trả về.

<a name="rule-exclude-if"></a>
#### exclude_if:_anotherfield_,_value_

Field đang được validation sẽ bị loại khỏi request data do các method `validate` và `validated` trả về nếu field _anotherfield_ bằng _value_.

Nếu cần logic loại trừ theo điều kiện phức tạp hơn, bạn có thể sử dụng method `Rule::excludeIf`. Method này nhận một boolean hoặc closure. Khi truyền closure, closure phải trả về `true` hoặc `false` để xác định field đang được validation có bị loại khỏi dữ liệu hay không:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::excludeIf($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::excludeIf(fn () => $request->user()->is_admin)],
]);
```

<a name="rule-exclude-unless"></a>
#### exclude_unless:_anotherfield_,_value_

Field đang được validation sẽ bị loại khỏi request data do các method `validate` và `validated` trả về, trừ khi field _anotherfield_ bằng _value_. Nếu _value_ là `null` (`exclude_unless:name,null`), field đang được validation sẽ bị loại trừ trừ khi field dùng để so sánh là `null` hoặc không tồn tại trong request data.

Nếu cần logic loại trừ theo điều kiện phức tạp hơn, bạn có thể sử dụng method `Rule::excludeUnless`. Method này nhận một boolean hoặc closure. Khi truyền closure, closure phải trả về `true` hoặc `false` để xác định field đang được validation có được giữ lại hay không:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::excludeUnless($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::excludeUnless(fn () => $request->user()->is_admin)],
]);
```

<a name="rule-exclude-with"></a>
#### exclude_with:_anotherfield_

Field đang được validation sẽ bị loại khỏi request data do các method `validate` và `validated` trả về nếu field _anotherfield_ tồn tại.

<a name="rule-exclude-without"></a>
#### exclude_without:_anotherfield_

Field đang được validation sẽ bị loại khỏi request data do các method `validate` và `validated` trả về nếu field _anotherfield_ không tồn tại.

<a name="rule-exists"></a>
#### exists:_table_,_column_

Field đang được validation phải tồn tại trong một bảng cơ sở dữ liệu được chỉ định.

<a name="basic-usage-of-exists-rule"></a>
#### Cách sử dụng cơ bản rule Exists

```php
'state' => ['exists:states']
```

Nếu không chỉ định tùy chọn `column`, tên field sẽ được sử dụng. Vì vậy trong trường hợp này, rule sẽ kiểm tra bảng `states` có bản ghi mà giá trị cột `state` khớp với giá trị attribute `state` của request hay không.

<a name="specifying-a-custom-column-name"></a>
#### Chỉ định tên cột tùy chỉnh

Bạn có thể chỉ định rõ tên cột cơ sở dữ liệu mà validation rule sẽ sử dụng bằng cách đặt tên cột sau tên bảng:

```php
'state' => ['exists:states,abbreviation']
```

Đôi khi bạn cần chỉ định một database connection cụ thể cho truy vấn `exists`. Bạn có thể thực hiện bằng cách thêm tên connection trước tên bảng:

```php
'email' => ['exists:connection.staff,email']
```

Thay vì chỉ định trực tiếp tên bảng, bạn có thể chỉ định Eloquent model để Laravel xác định tên bảng:

```php
'user_id' => ['exists:App\Models\User,id']
```

Nếu muốn tùy chỉnh truy vấn do validation rule thực thi, bạn có thể sử dụng class `Rule` để định nghĩa rule theo fluent API.

```php
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::exists('staff')->where(function (Builder $query) {
            $query->where('account_id', 1);
        }),
    ],
]);
```

Bạn có thể chỉ định rõ tên cột cơ sở dữ liệu cho rule `exists` được tạo bởi method `Rule::exists` bằng cách truyền tên cột làm đối số thứ hai của method `exists`:

```php
'state' => [Rule::exists('states', 'abbreviation')],
```

Đôi khi bạn cần kiểm tra một mảng giá trị có tồn tại trong cơ sở dữ liệu hay không. Hãy áp dụng đồng thời rule `exists` và [array](#rule-array) cho field đang được validation:

```php
'states' => ['array', Rule::exists('states', 'abbreviation')],
```

Khi cả hai rule được gán cho một field, Laravel sẽ tự động tạo một truy vấn duy nhất để xác định tất cả giá trị đã cho có tồn tại trong bảng được chỉ định hay không.

<a name="rule-extensions"></a>
#### extensions:_foo_,_bar_,...

File đang được validation phải có phần mở rộng do người dùng cung cấp khớp với một trong các phần mở rộng được liệt kê:

```php
'photo' => ['required', 'extensions:jpg,png'],
```

> [!WARNING]
> Bạn không nên chỉ dựa vào phần mở rộng do người dùng cung cấp để validation file. Thông thường rule này luôn nên được sử dụng cùng rule [mimes](#rule-mimes) hoặc [mimetypes](#rule-mimetypes).

<a name="rule-file"></a>
#### file

Field đang được validation phải là một file đã được upload thành công.

<a name="rule-filled"></a>
#### filled

Field đang được validation không được rỗng khi field đó tồn tại.

<a name="rule-gt"></a>
#### gt:_field_

Field đang được validation phải lớn hơn _field_ hoặc _value_ đã cho. Hai field phải cùng kiểu. String, số, array và file được đánh giá theo cùng quy ước với rule [size](#rule-size).

<a name="rule-gte"></a>
#### gte:_field_

Field đang được validation phải lớn hơn hoặc bằng _field_ hoặc _value_ đã cho. Hai field phải cùng kiểu. String, số, array và file được đánh giá theo cùng quy ước với rule [size](#rule-size).

<a name="rule-hex-color"></a>
#### hex_color

Field đang được validation phải chứa giá trị màu hợp lệ ở định dạng [hexadecimal](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color).

<a name="rule-image"></a>
#### image

File đang được validation phải là ảnh (jpg, jpeg, png, bmp, gif hoặc webp).

> [!WARNING]
> Theo mặc định, rule `image` không cho phép file SVG vì nguy cơ lỗ hổng XSS. Nếu cần cho phép SVG, bạn có thể truyền directive `allow_svg` cho rule `image` (`image:allow_svg`).

<a name="rule-in"></a>
#### in:_foo_,_bar_,...

Field đang được validation phải nằm trong danh sách giá trị đã cho. Vì rule này thường yêu cầu bạn `implode` một mảng, có thể dùng method `Rule::in` để xây dựng rule theo fluent API:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'zones' => [
        'required',
        Rule::in(['first-zone', 'second-zone']),
    ],
]);
```

Khi kết hợp rule `in` với rule `array`, mỗi giá trị trong mảng input phải xuất hiện trong danh sách giá trị được cung cấp cho rule `in`. Trong ví dụ sau, mã sân bay `LAS` trong mảng input không hợp lệ vì không nằm trong danh sách sân bay được cung cấp cho rule `in`:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$input = [
    'airports' => ['NYC', 'LAS'],
];

Validator::make($input, [
    'airports' => [
        'required',
        'array',
    ],
    'airports.*' => Rule::in(['NYC', 'LIT']),
]);
```

<a name="rule-in-array"></a>
#### in_array:_anotherfield_.*

Field đang được validation phải tồn tại trong các giá trị của _anotherfield_.

<a name="rule-in-array-keys"></a>
#### in_array_keys:_value_.*

Field đang được validation phải là một mảng có ít nhất một trong các _value_ đã cho làm key trong mảng:

```php
'config' => ['array', 'in_array_keys:timezone']
```

<a name="rule-integer"></a>
#### integer

Field đang được validation phải là một số nguyên.

Bạn có thể dùng tham số `strict` để chỉ coi field là hợp lệ khi kiểu dữ liệu của nó thực sự là `integer`. Chuỗi chứa giá trị số nguyên sẽ bị coi là không hợp lệ:

```php
'age' => ['integer:strict']
```

> [!WARNING]
> Rule validation này không xác minh input có kiểu biến `integer`; nó chỉ kiểm tra input có thuộc kiểu giá trị được rule `FILTER_VALIDATE_INT` của PHP chấp nhận hay không. Nếu cần xác thực input là một số, hãy kết hợp rule này với [rule validation `numeric`](#rule-numeric).

<a name="rule-ip"></a>
#### ip

Field đang được validation phải là một địa chỉ IP.

<a name="ipv4"></a>
#### ipv4

Field đang được validation phải là một địa chỉ IPv4.

<a name="ipv6"></a>
#### ipv6

Field đang được validation phải là một địa chỉ IPv6.

<a name="rule-json"></a>
#### json

Field đang được validation phải là một chuỗi JSON hợp lệ.

<a name="rule-lt"></a>
#### lt:_field_

Field đang được validation phải nhỏ hơn _field_ đã cho. Hai field phải cùng kiểu dữ liệu. String, numeric, array và file được đánh giá theo cùng quy ước với rule [size](#rule-size).

<a name="rule-lte"></a>
#### lte:_field_

Field đang được validation phải nhỏ hơn hoặc bằng _field_ đã cho. Hai field phải cùng kiểu dữ liệu. String, numeric, array và file được đánh giá theo cùng quy ước với rule [size](#rule-size).

<a name="rule-lowercase"></a>
#### lowercase

Field đang được validation phải ở dạng chữ thường.

<a name="rule-list"></a>
#### list

Field đang được validation phải là một array dạng list. Một array được coi là list nếu các key của nó là các số liên tiếp từ 0 đến `count($array) - 1`.

<a name="rule-mac"></a>
#### mac_address

Field đang được validation phải là một địa chỉ MAC.

<a name="rule-max"></a>
#### max:_value_

Field đang được validation phải nhỏ hơn hoặc bằng _value_ tối đa. String, numeric, array và file được đánh giá giống như rule [size](#rule-size).

<a name="rule-max-digits"></a>
#### max_digits:_value_

Số nguyên đang được validation phải có độ dài tối đa là _value_.

<a name="rule-mimetypes"></a>
#### mimetypes:_text/plain_,...

File đang được validation phải khớp với một trong các MIME type đã cho:

```php
'video' => ['mimetypes:video/avi,video/mpeg,video/quicktime'],

'media' => ['mimetypes:image/*,video/*'],
```

Để xác định MIME type của file upload, framework sẽ đọc nội dung file và cố gắng suy đoán MIME type; giá trị này có thể khác với MIME type do client cung cấp.

<a name="rule-mimes"></a>
#### mimes:_foo_,_bar_,...

File đang được validation phải có MIME type tương ứng với một trong các extension được liệt kê:

```php
'photo' => ['mimes:jpg,bmp,png']
```

Mặc dù bạn chỉ cần chỉ định extension, rule này thực tế xác thực MIME type bằng cách đọc nội dung file và suy đoán MIME type. Danh sách đầy đủ MIME type cùng extension tương ứng có tại:

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="mime-types-and-extensions"></a>
#### MIME type và extension

Rule validation này không kiểm tra MIME type có khớp với extension mà người dùng đặt cho file hay không. Ví dụ, rule `mimes:png` vẫn coi một file chứa nội dung PNG hợp lệ là ảnh PNG hợp lệ ngay cả khi file có tên `photo.txt`. Nếu muốn xác thực extension do người dùng gán cho file, hãy dùng rule [extensions](#rule-extensions).

<a name="rule-min"></a>
#### min:_value_

Field đang được validation phải có _value_ tối thiểu. String, numeric, array và file được đánh giá giống như rule [size](#rule-size).

<a name="rule-min-digits"></a>
#### min_digits:_value_

Số nguyên đang được validation phải có độ dài tối thiểu là _value_.

<a name="rule-multiple-of"></a>
#### multiple_of:_value_

Field đang được validation phải là bội số của _value_.

<a name="rule-missing"></a>
#### missing

Field đang được validation không được xuất hiện trong dữ liệu input.

<a name="rule-missing-if"></a>
#### missing_if:_anotherfield_,_value_,...

Field đang được validation không được xuất hiện nếu field _anotherfield_ bằng bất kỳ _value_ nào.

<a name="rule-missing-unless"></a>
#### missing_unless:_anotherfield_,_value_

Field đang được validation không được xuất hiện trừ khi field _anotherfield_ bằng một trong các _value_.

<a name="rule-missing-with"></a>
#### missing_with:_foo_,_bar_,...

Field đang được validation không được xuất hiện nếu bất kỳ field nào khác được chỉ định đang hiện diện.

<a name="rule-missing-with-all"></a>
#### missing_with_all:_foo_,_bar_,...

Field đang được validation không được xuất hiện nếu tất cả các field khác được chỉ định đều hiện diện.

<a name="rule-not-in"></a>
#### not_in:_foo_,_bar_,...

Field đang được validation không được nằm trong danh sách giá trị đã cho. Có thể dùng method `Rule::notIn` để xây dựng rule theo fluent API:

```php
use Illuminate\Validation\Rule;

Validator::make($data, [
    'toppings' => [
        'required',
        Rule::notIn(['sprinkles', 'cherries']),
    ],
]);
```

<a name="rule-not-regex"></a>
#### not_regex:_pattern_

Field đang được validation không được khớp với regular expression đã cho.

Ở bên trong, rule này sử dụng hàm `preg_match` của PHP. Pattern được chỉ định phải tuân theo định dạng mà `preg_match` yêu cầu, bao gồm delimiter hợp lệ. Ví dụ: `'email' => ['not_regex:/^.+$/i']`.

<a name="rule-nullable"></a>
#### nullable

Field đang được validation có thể là `null`.

<a name="rule-numeric"></a>
#### numeric

Field đang được validation phải là [numeric](https://www.php.net/manual/en/function.is-numeric.php).

Bạn có thể dùng tham số `strict` để chỉ coi field hợp lệ khi giá trị có kiểu integer hoặc float. Numeric string sẽ bị coi là không hợp lệ:

```php
'amount' => ['numeric:strict']
```

<a name="rule-present"></a>
#### present

Field đang được validation phải tồn tại trong dữ liệu input.

<a name="rule-present-if"></a>
#### present_if:_anotherfield_,_value_,...

Field đang được validation phải hiện diện nếu field _anotherfield_ bằng bất kỳ _value_ nào.

<a name="rule-present-unless"></a>
#### present_unless:_anotherfield_,_value_

Field đang được validation phải hiện diện trừ khi field _anotherfield_ bằng một trong các _value_.

<a name="rule-present-with"></a>
#### present_with:_foo_,_bar_,...

Field đang được validation phải hiện diện nếu bất kỳ field nào khác được chỉ định đang hiện diện.

<a name="rule-present-with-all"></a>
#### present_with_all:_foo_,_bar_,...

Field đang được validation phải hiện diện nếu tất cả các field khác được chỉ định đều hiện diện.

<a name="rule-prohibited"></a>
#### prohibited

Field đang được validation phải không tồn tại hoặc phải rỗng. Một field được xem là "rỗng" nếu thỏa một trong các điều kiện sau:

<div class="content-list" markdown="1">

- Giá trị là `null`.
- Giá trị là một chuỗi rỗng.
- Giá trị là một mảng rỗng hoặc object `Countable` rỗng.
- Giá trị là file được upload có path rỗng.

</div>

<a name="rule-prohibited-if"></a>
#### prohibited_if:_anotherfield_,_value_,...

Field đang được validation phải không tồn tại hoặc phải rỗng nếu field _anotherfield_ bằng bất kỳ _value_ nào. Một field được xem là "rỗng" nếu thỏa một trong các điều kiện sau:

<div class="content-list" markdown="1">

- Giá trị là `null`.
- Giá trị là một chuỗi rỗng.
- Giá trị là một mảng rỗng hoặc object `Countable` rỗng.
- Giá trị là file được upload có path rỗng.

</div>

Nếu cần logic điều kiện phức tạp hơn để cấm field, bạn có thể sử dụng method `Rule::prohibitedIf`. Method này nhận một boolean hoặc closure. Khi truyền closure, closure phải trả về `true` hoặc `false` để cho biết field đang được validation có bị cấm hay không:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedIf($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedIf(fn () => $request->user()->is_admin)],
]);
```
<a name="rule-prohibited-if-accepted"></a>
#### prohibited_if_accepted:_anotherfield_,...

Field đang được validation phải không tồn tại hoặc phải rỗng nếu field _anotherfield_ bằng `"yes"`, `"on"`, `1`, `"1"`, `true` hoặc `"true"`.

<a name="rule-prohibited-if-declined"></a>
#### prohibited_if_declined:_anotherfield_,...

Field đang được validation phải không tồn tại hoặc phải rỗng nếu field _anotherfield_ bằng `"no"`, `"off"`, `0`, `"0"`, `false` hoặc `"false"`.

<a name="rule-prohibited-unless"></a>
#### prohibited_unless:_anotherfield_,_value_,...

Field đang được validation phải không tồn tại hoặc phải rỗng, trừ khi field _anotherfield_ bằng một trong các _value_. Một field được xem là "rỗng" nếu thỏa một trong các điều kiện sau:

<div class="content-list" markdown="1">

- Giá trị là `null`.
- Giá trị là một chuỗi rỗng.
- Giá trị là một mảng rỗng hoặc object `Countable` rỗng.
- Giá trị là file được upload có path rỗng.

</div>

Nếu cần logic điều kiện phức tạp hơn, bạn có thể sử dụng method `Rule::prohibitedUnless`. Method này nhận một boolean hoặc closure. Khi truyền closure, closure phải trả về `true` hoặc `false` để cho biết field đang được validation có được phép hay không:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedUnless($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::prohibitedUnless(fn () => $request->user()->is_admin)],
]);
```

<a name="rule-prohibits"></a>
#### prohibits:_anotherfield_,...

Nếu field đang được validation tồn tại và không rỗng, tất cả field trong _anotherfield_ phải không tồn tại hoặc phải rỗng. Một field được xem là "rỗng" nếu thỏa một trong các điều kiện sau:

<div class="content-list" markdown="1">

- Giá trị là `null`.
- Giá trị là một chuỗi rỗng.
- Giá trị là một mảng rỗng hoặc object `Countable` rỗng.
- Giá trị là file được upload có path rỗng.

</div>

<a name="rule-regex"></a>
#### regex:_pattern_

Field đang được validation phải khớp với biểu thức chính quy đã cho.

Ở bên trong, rule này sử dụng hàm PHP `preg_match`. Pattern được chỉ định phải tuân theo định dạng mà `preg_match` yêu cầu, bao gồm cả delimiter hợp lệ. Ví dụ: `'email' => ['regex:/^.+@.+$/i']`.

<a name="rule-required"></a>
#### required

Field đang được validation phải có trong dữ liệu input và không được rỗng. Một field được xem là "rỗng" nếu thỏa một trong các điều kiện sau:

<div class="content-list" markdown="1">

- Giá trị là `null`.
- Giá trị là một chuỗi rỗng.
- Giá trị là một mảng rỗng hoặc object `Countable` rỗng.
- Giá trị là file được upload không có path.

</div>

<a name="rule-required-if"></a>
#### required_if:_anotherfield_,_value_,...

Field đang được validation phải tồn tại và không rỗng nếu field _anotherfield_ bằng bất kỳ _value_ nào.

Nếu muốn xây dựng điều kiện phức tạp hơn cho rule `required_if`, bạn có thể sử dụng method `Rule::requiredIf`. Method này nhận một boolean hoặc closure. Khi truyền closure, closure phải trả về `true` hoặc `false` để cho biết field đang được validation có bắt buộc hay không:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::requiredIf($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::requiredIf(fn () => $request->user()->is_admin)],
]);
```

<a name="rule-required-if-accepted"></a>
#### required_if_accepted:_anotherfield_,...

Field đang được validation phải tồn tại và không rỗng nếu field _anotherfield_ bằng `"yes"`, `"on"`, `1`, `"1"`, `true` hoặc `"true"`.

<a name="rule-required-if-declined"></a>
#### required_if_declined:_anotherfield_,...

Field đang được validation phải tồn tại và không rỗng nếu field _anotherfield_ bằng `"no"`, `"off"`, `0`, `"0"`, `false` hoặc `"false"`.

<a name="rule-required-unless"></a>
#### required_unless:_anotherfield_,_value_,...

Field đang được validation phải tồn tại và không rỗng, trừ khi field _anotherfield_ bằng một trong các _value_. Điều này cũng có nghĩa _anotherfield_ phải có trong dữ liệu request, trừ khi _value_ là `null`. Nếu _value_ là `null` (`required_unless:name,null`), field đang được validation sẽ là bắt buộc, trừ khi field dùng để so sánh có giá trị `null` hoặc không tồn tại trong dữ liệu request.

Nếu muốn xây dựng điều kiện phức tạp hơn cho rule `required_unless`, bạn có thể sử dụng method `Rule::requiredUnless`. Method này nhận một boolean hoặc closure. Khi truyền closure, closure phải trả về `true` hoặc `false` để cho biết field đang được validation có không bắt buộc hay không:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($request->all(), [
    'role_id' => [Rule::requiredUnless($request->user()->is_admin)],
]);

Validator::make($request->all(), [
    'role_id' => [Rule::requiredUnless(fn () => $request->user()->is_admin)],
]);
```

<a name="rule-required-with"></a>
#### required_with:_foo_,_bar_,...

Field đang được validation phải tồn tại và không rỗng _chỉ khi_ có ít nhất một field khác được chỉ định tồn tại và không rỗng.

<a name="rule-required-with-all"></a>
#### required_with_all:_foo_,_bar_,...

Field đang được validation phải tồn tại và không rỗng _chỉ khi_ tất cả field khác được chỉ định đều tồn tại và không rỗng.

<a name="rule-required-without"></a>
#### required_without:_foo_,_bar_,...

Field đang được validation phải tồn tại và không rỗng _chỉ khi_ có ít nhất một field khác được chỉ định bị rỗng hoặc không tồn tại.

<a name="rule-required-without-all"></a>
#### required_without_all:_foo_,_bar_,...

Field đang được validation phải tồn tại và không rỗng _chỉ khi_ tất cả field khác được chỉ định đều rỗng hoặc không tồn tại.

<a name="rule-required-array-keys"></a>
#### required_array_keys:_foo_,_bar_,...

Field đang được validation phải là một mảng và phải chứa ít nhất các key được chỉ định.

<a name="rule-same"></a>
#### same:_field_

_field_ được chỉ định phải có giá trị khớp với field đang được validation.

<a name="rule-size"></a>
#### size:_value_

Field đang được validation phải có kích thước khớp với _value_ đã cho. Với dữ liệu chuỗi, _value_ tương ứng với số ký tự. Với dữ liệu số, _value_ tương ứng với một giá trị số nguyên cụ thể (attribute cũng phải có rule `numeric` hoặc `integer`). Với mảng, _size_ tương ứng với số phần tử (`count`) của mảng. Với file, _size_ tương ứng với kích thước file tính bằng kilobyte. Hãy xem một số ví dụ:

```php
// Validate that a string is exactly 12 characters long...
'title' => ['size:12'];

// Validate that a provided integer equals 10...
'seats' => ['integer', 'size:10'];

// Validate that an array has exactly 5 elements...
'tags' => ['array', 'size:5'];

// Validate that an uploaded file is exactly 512 kilobytes...
'image' => ['file', 'size:512'];
```

<a name="rule-starts-with"></a>
#### starts_with:_foo_,_bar_,...

Field đang được validation phải bắt đầu bằng một trong các giá trị đã cho.

<a name="rule-string"></a>
#### string

Field đang được validation phải là một chuỗi. Nếu muốn cho phép field có giá trị `null`, bạn nên gán thêm rule `nullable` cho field.

Để thuận tiện, các rule validation cho chuỗi cũng có thể được xây dựng bằng fluent rule builder `Rule::string()`:

```php
use Illuminate\Validation\Rule;

'title' => [
    'required',
    Rule::string()
        ->min(3)
        ->max(255)
        ->alphaDash(ascii: true),
],
```

String rule builder cung cấp các method cho những ràng buộc chuỗi phổ biến, gồm `alpha`, `alphaDash`, `alphaNumeric`, `ascii`, `between`, `doesntEndWith`, `doesntStartWith`, `endsWith`, `exactly`, `lowercase`, `max`, `min`, `startsWith` và `uppercase`. Vì rule builder hỗ trợ điều kiện, bạn cũng có thể sử dụng `when` và `unless` để áp dụng các ràng buộc theo điều kiện.

<a name="rule-timezone"></a>
#### timezone

Field đang được validation phải là timezone identifier hợp lệ theo method `DateTimeZone::listIdentifiers`.

Các argument [được method `DateTimeZone::listIdentifiers` chấp nhận](https://www.php.net/manual/en/datetimezone.listidentifiers.php) cũng có thể được truyền cho validation rule này:

```php
'timezone' => ['required', 'timezone:all'];

'timezone' => ['required', 'timezone:Africa'];

'timezone' => ['required', 'timezone:per_country,US'];
```

<a name="rule-unique"></a>
#### unique:_table_,_column_

Field đang được validation không được tồn tại trong bảng database đã chỉ định.

**Chỉ định tên bảng / column tùy chỉnh:**

Thay vì chỉ định trực tiếp tên bảng, bạn có thể chỉ định Eloquent model để Laravel xác định tên bảng:

```php
'email' => ['unique:App\Models\User,email_address']
```

Có thể dùng option `column` để chỉ định database column tương ứng với field. Nếu không chỉ định `column`, Laravel sẽ sử dụng tên của field đang được validation.

```php
'email' => ['unique:users,email_address']
```

**Chỉ định database connection tùy chỉnh**

Đôi khi, bạn cần thiết lập connection tùy chỉnh cho các database query do Validator thực hiện. Để làm điều này, hãy thêm tên connection vào trước tên bảng:

```php
'email' => ['unique:connection.users,email_address']
```

**Buộc rule Unique bỏ qua một ID cụ thể:**

Đôi khi, bạn muốn bỏ qua một ID cụ thể khi validation tính duy nhất. Ví dụ, xét màn hình "cập nhật hồ sơ" gồm tên, địa chỉ email và vị trí của user. Bạn có thể muốn xác minh địa chỉ email là duy nhất. Tuy nhiên, nếu user chỉ thay đổi tên mà không thay đổi email, bạn không muốn phát sinh validation error chỉ vì chính user đó đang sở hữu địa chỉ email này.

Để yêu cầu validator bỏ qua ID của user, chúng ta sẽ dùng class `Rule` để định nghĩa rule theo fluent API.

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

Validator::make($data, [
    'email' => [
        'required',
        Rule::unique('users')->ignore($user->id),
    ],
]);
```

> [!WARNING]
> Bạn tuyệt đối không nên truyền input từ request do user kiểm soát vào method `ignore`. Thay vào đó, chỉ truyền unique ID do hệ thống tạo, chẳng hạn ID tự tăng hoặc UUID từ một Eloquent model instance. Nếu không, ứng dụng có thể bị tấn công SQL injection.

Thay vì truyền giá trị model key vào method `ignore`, bạn cũng có thể truyền toàn bộ model instance. Laravel sẽ tự động lấy key từ model:

```php
Rule::unique('users')->ignore($user)
```

Nếu bảng sử dụng tên primary key column khác `id`, bạn có thể chỉ định tên column khi gọi method `ignore`:

```php
Rule::unique('users')->ignore($user->id, 'user_id')
```

Theo mặc định, rule `unique` kiểm tra tính duy nhất của column có tên trùng với attribute đang được validation. Tuy nhiên, bạn có thể truyền một tên column khác làm argument thứ hai của method `unique`:

```php
Rule::unique('users', 'email_address')->ignore($user->id)
```

**Thêm các mệnh đề Where bổ sung:**

Bạn có thể chỉ định thêm điều kiện query bằng cách tùy chỉnh query qua method `where`. Ví dụ, hãy thêm điều kiện để query chỉ tìm các record có column `account_id` bằng `1`:

```php
'email' => Rule::unique('users')->where(fn (Builder $query) => $query->where('account_id', 1))
```

**Bỏ qua record đã soft delete khi kiểm tra Unique:**

Theo mặc định, rule `unique` vẫn tính cả các record đã soft delete khi xác định tính duy nhất. Để loại các record đã soft delete khỏi phép kiểm tra, bạn có thể gọi method `withoutTrashed`:

```php
Rule::unique('users')->withoutTrashed();
```

Nếu model sử dụng column khác `deleted_at` cho soft delete, bạn có thể truyền tên column đó khi gọi method `withoutTrashed`:

```php
Rule::unique('users')->withoutTrashed('was_deleted_at');
```

<a name="rule-uppercase"></a>
#### uppercase

Field đang được validation phải ở dạng chữ hoa.

<a name="rule-url"></a>
#### url

Field đang được validation phải là một URL hợp lệ.

Nếu muốn chỉ định các URL protocol được xem là hợp lệ, bạn có thể truyền các protocol đó làm parameter của validation rule:

```php
'url' => ['url:http,https'],

'game' => ['url:minecraft,steam'],
```

<a name="rule-ulid"></a>
#### ulid

Field đang được validation phải là một [Universally Unique Lexicographically Sortable Identifier](https://github.com/ulid/spec) (ULID) hợp lệ.

<a name="rule-uuid"></a>
#### uuid

Field đang được validation phải là universally unique identifier (UUID) hợp lệ theo RFC 9562 (phiên bản 1, 3, 4, 5, 6, 7 hoặc 8).

Bạn cũng có thể validation để bảo đảm UUID đã cho khớp với một phiên bản UUID cụ thể:

```php
'uuid' => ['uuid:4']
```

<a name="conditionally-adding-rules"></a>
## Thêm rule theo điều kiện

<a name="skipping-validation-when-fields-have-certain-values"></a>
#### Bỏ qua validation khi field có giá trị nhất định

Đôi khi bạn có thể muốn không validation một field nếu field khác có một giá trị nhất định. Bạn có thể thực hiện điều này bằng rule `exclude_if`. Trong ví dụ sau, các field `appointment_date` và `doctor_name` sẽ không được validation nếu `has_appointment` có giá trị `false`:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($data, [
    'has_appointment' => ['required', 'boolean'],
    'appointment_date' => ['exclude_if:has_appointment,false', 'required', 'date'],
    'doctor_name' => ['exclude_if:has_appointment,false', 'required', 'string'],
]);
```

Ngoài ra, bạn có thể dùng rule `exclude_unless` để không validation một field trừ khi field khác có một giá trị nhất định:

```php
$validator = Validator::make($data, [
    'has_appointment' => ['required', 'boolean'],
    'appointment_date' => ['exclude_unless:has_appointment,true', 'required', 'date'],
    'doctor_name' => ['exclude_unless:has_appointment,true', 'required', 'string'],
]);
```

<a name="validating-when-present"></a>
#### Chỉ validation khi field tồn tại

Trong một số trường hợp, bạn có thể muốn thực hiện validation cho một field **chỉ khi** field đó tồn tại trong dữ liệu đang được validation. Để thực hiện nhanh điều này, hãy thêm rule `sometimes` vào danh sách rule:

```php
$validator = Validator::make($data, [
    'email' => ['sometimes', 'required', 'email'],
]);
```

Trong ví dụ trên, field `email` chỉ được validation nếu nó tồn tại trong mảng `$data`.

> [!NOTE]
> Nếu bạn cần validation một field luôn phải tồn tại nhưng có thể rỗng, hãy xem [ghi chú về các field tùy chọn](#a-note-on-optional-fields).

<a name="complex-conditional-validation"></a>
#### Validation theo điều kiện phức tạp

Đôi khi bạn cần thêm validation rule dựa trên logic điều kiện phức tạp hơn. Ví dụ, một field chỉ bắt buộc khi field khác có giá trị lớn hơn 100; hoặc hai field chỉ cần một giá trị nhất định khi một field khác tồn tại. Trước tiên, hãy tạo một instance `Validator` với các _rule tĩnh_ không thay đổi:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'email' => ['required', 'email'],
    'games' => ['required', 'integer', 'min:0'],
]);
```

Giả sử ứng dụng web dành cho người sưu tầm trò chơi. Nếu một người đăng ký và sở hữu hơn 100 trò chơi, chúng ta muốn họ giải thích lý do. Để thêm yêu cầu này theo điều kiện, có thể dùng method `sometimes` trên instance `Validator`.

```php
use Illuminate\Support\Fluent;

$validator->sometimes('reason', ['required', 'max:500'], function (Fluent $input) {
    return $input->games >= 100;
});
```

Argument đầu tiên của `sometimes` là tên field cần validation theo điều kiện. Argument thứ hai là danh sách rule cần thêm. Nếu closure ở argument thứ ba trả về `true`, các rule sẽ được thêm. Bạn cũng có thể thêm validation theo điều kiện cho nhiều field cùng lúc:

```php
$validator->sometimes(['reason', 'cost'], 'required', function (Fluent $input) {
    return $input->games >= 100;
});
```

> [!NOTE]
> Tham số `$input` truyền vào closure là một instance của `Illuminate\Support\Fluent` và có thể dùng để truy cập input cũng như file đang được validation.

<a name="complex-conditional-array-validation"></a>
#### Validation mảng theo điều kiện phức tạp

Đôi khi bạn muốn validation một field dựa trên field khác trong cùng mảng lồng nhau mà không biết trước index. Trong trường hợp này, closure có thể nhận argument thứ hai là phần tử hiện tại của mảng đang được validation:

```php
$input = [
    'channels' => [
        [
            'type' => 'email',
            'address' => 'abigail@example.com',
        ],
        [
            'type' => 'url',
            'address' => 'https://example.com',
        ],
    ],
];

$validator->sometimes('channels.*.address', 'email', function (Fluent $input, Fluent $item) {
    return $item->type === 'email';
});

$validator->sometimes('channels.*.address', 'url', function (Fluent $input, Fluent $item) {
    return $item->type !== 'email';
});
```

Tương tự `$input`, tham số `$item` là instance của `Illuminate\Support\Fluent` khi dữ liệu attribute là mảng; nếu không, nó là một chuỗi.

<a name="validating-arrays"></a>
## Validation mảng

Như đã trình bày trong [tài liệu rule `array`](#rule-array), rule `array` nhận danh sách các key được phép. Nếu mảng chứa thêm bất kỳ key nào ngoài danh sách này, validation sẽ thất bại:

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'user' => [
        'name' => 'Taylor Otwell',
        'username' => 'taylorotwell',
        'admin' => true,
    ],
];

Validator::make($input, [
    'user' => ['array:name,username'],
]);
```

Nhìn chung, bạn nên luôn chỉ định các key được phép xuất hiện trong mảng. Nếu không, các method `validate` và `validated` của validator sẽ trả về toàn bộ dữ liệu đã validation, bao gồm mảng và tất cả key của nó, ngay cả khi các key đó không được validation bởi rule lồng nhau khác.

<a name="validating-nested-array-input"></a>
### Validation input dạng mảng lồng nhau

Bạn có thể dùng "dot notation" để validation các attribute bên trong mảng lồng nhau. Ví dụ, nếu HTTP request chứa field `photos[profile]`, bạn có thể validation như sau:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'photos.profile' => ['required', 'image'],
]);
```

Bạn cũng có thể validation từng phần tử của mảng. Ví dụ, để bảo đảm mỗi email trong một field dạng mảng là duy nhất, có thể làm như sau:

```php
$validator = Validator::make($request->all(), [
    'users.*.email' => ['email', 'unique:users'],
    'users.*.first_name' => ['required_with:users.*.last_name'],
]);
```

Tương tự, bạn có thể dùng ký tự `*` khi khai báo [validation message tùy chỉnh trong language file](#custom-messages-for-specific-attributes), nhờ đó một message có thể áp dụng cho các field dạng mảng:

```php
'custom' => [
    'users.*.email' => [
        'unique' => 'Each user must have a unique email address',
    ]
],
```

<a name="accessing-nested-array-data"></a>
#### Truy cập dữ liệu mảng lồng nhau

Đôi khi bạn cần truy cập giá trị của một phần tử trong mảng lồng nhau khi gán validation rule cho attribute. Có thể dùng `Rule::forEach`. Method `forEach` nhận một closure được gọi cho từng phần tử của attribute dạng mảng, đồng thời nhận giá trị của attribute và tên attribute đầy đủ đã được mở rộng. Closure phải trả về mảng rule áp dụng cho phần tử đó:

```php
use App\Rules\HasPermission;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$validator = Validator::make($request->all(), [
    'companies.*.id' => Rule::forEach(function (string|null $value, string $attribute) {
        return [
            Rule::exists(Company::class, 'id'),
            new HasPermission('manage-company', $value),
        ];
    }),
]);
```

<a name="error-message-indexes-and-positions"></a>
### Index và vị trí trong error message

Khi validation mảng, bạn có thể muốn tham chiếu index hoặc vị trí của phần tử validation thất bại trong error message. Hãy dùng placeholder `:index` (bắt đầu từ `0`), `:position` (bắt đầu từ `1`) hoặc `:ordinal-position` (bắt đầu từ `1st`) trong [validation message tùy chỉnh](#manual-customizing-the-error-messages):

```php
use Illuminate\Support\Facades\Validator;

$input = [
    'photos' => [
        [
            'name' => 'BeachVacation.jpg',
            'description' => 'A photo of my beach vacation!',
        ],
        [
            'name' => 'GrandCanyon.jpg',
            'description' => '',
        ],
    ],
];

Validator::validate($input, [
    'photos.*.description' => ['required'],
], [
    'photos.*.description.required' => 'Please describe photo #:position.',
]);
```

Với ví dụ trên, validation sẽ thất bại và người dùng nhận được lỗi _"Please describe photo #2."_.

Nếu cần, bạn có thể tham chiếu index và vị trí ở cấp lồng sâu hơn bằng `second-index`, `second-position`, `third-index`, `third-position`, v.v.

```php
'photos.*.attributes.*.string' => 'Invalid attribute for photo #:second-position.',
```

<a name="validating-files"></a>
## Validation file

Laravel cung cấp nhiều validation rule cho file upload như `mimes`, `image`, `min` và `max`. Ngoài việc khai báo từng rule riêng lẻ, Laravel còn cung cấp fluent file validation rule builder để cấu hình thuận tiện hơn:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'attachment' => [
        'required',
        File::types(['mp3', 'wav'])
            ->min(1024)
            ->max(12 * 1024),
    ],
]);
```

<a name="validating-files-file-types"></a>
#### Validating File Types

Mặc dù khi gọi `types` bạn chỉ cần chỉ định extension, method này thực tế validation MIME type bằng cách đọc nội dung file và suy đoán MIME type. Danh sách đầy đủ MIME type và extension tương ứng có tại:

[https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types](https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types)

<a name="validating-files-file-sizes"></a>
#### Validating File Sizes

Để thuận tiện, kích thước file tối thiểu và tối đa có thể được khai báo bằng chuỗi kèm hậu tố đơn vị. Các hậu tố `kb`, `mb`, `gb` và `tb` đều được hỗ trợ:

```php
File::types(['mp3', 'wav'])
    ->min('1kb')
    ->max('10mb');
```

<a name="validating-files-image-files"></a>
#### Validating Image Files

Nếu ứng dụng nhận ảnh do người dùng upload, bạn có thể dùng constructor `image` của rule `File` để bảo đảm file đang validation là ảnh (jpg, jpeg, png, bmp, gif hoặc webp).

Ngoài ra, rule `dimensions` có thể dùng để giới hạn kích thước ảnh:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

Validator::validate($input, [
    'photo' => [
        'required',
        File::image()
            ->min(1024)
            ->max(12 * 1024)
            ->dimensions(Rule::dimensions()->maxWidth(1000)->maxHeight(500)),
    ],
]);
```

> [!NOTE]
> Có thể xem thêm về validation kích thước ảnh trong [tài liệu rule `dimensions`](#rule-dimensions).

> [!WARNING]
> Mặc định, rule `image` không cho phép file SVG do nguy cơ lỗ hổng XSS. Nếu cần cho phép SVG, hãy truyền `allowSvg: true` vào rule `image`: `File::image(allowSvg: true)`.

<a name="validating-files-image-dimensions"></a>
#### Validating Image Dimensions

Bạn cũng có thể validation kích thước ảnh. Ví dụ, để yêu cầu ảnh upload rộng ít nhất 1000 pixel và cao 500 pixel, hãy dùng rule `dimensions`:

```php
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

File::image()->dimensions(
    Rule::dimensions()
        ->maxWidth(1000)
        ->maxHeight(500)
)
```

> [!NOTE]
> Có thể xem thêm về validation kích thước ảnh trong [tài liệu rule `dimensions`](#rule-dimensions).

<a name="validating-passwords"></a>
## Validation mật khẩu

Để bảo đảm mật khẩu có mức độ phức tạp phù hợp, bạn có thể dùng rule object `Password` của Laravel:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

$validator = Validator::make($request->all(), [
    'password' => ['required', 'confirmed', Password::min(8)],
]);
```

Rule object `Password` cho phép tùy chỉnh dễ dàng yêu cầu độ phức tạp của mật khẩu, chẳng hạn bắt buộc ít nhất một chữ cái, chữ số, ký hiệu hoặc cả chữ hoa và chữ thường:

```php
// Require at least 8 characters...
Password::min(8)

// Require at most 256 characters...
Password::min(16)->max(256)

// Require at least one letter...
Password::min(8)->letters()

// Require at least one uppercase and one lowercase letter...
Password::min(8)->mixedCase()

// Require at least one number...
Password::min(8)->numbers()

// Require at least one symbol...
Password::min(8)->symbols()
```

Ngoài ra, bạn có thể dùng method `uncompromised` để bảo đảm mật khẩu chưa xuất hiện trong dữ liệu mật khẩu bị rò rỉ công khai:

```php
Password::min(8)->uncompromised()
```

Ở bên trong, rule object `Password` sử dụng mô hình [k-Anonymity](https://en.wikipedia.org/wiki/K-anonymity) để xác định mật khẩu có bị rò rỉ qua dịch vụ [haveibeenpwned.com](https://haveibeenpwned.com) hay không mà không làm ảnh hưởng đến quyền riêng tư hoặc bảo mật của người dùng.

Mặc định, nếu mật khẩu xuất hiện ít nhất một lần trong dữ liệu rò rỉ, nó sẽ được xem là đã bị lộ. Bạn có thể tùy chỉnh ngưỡng này bằng argument đầu tiên của `uncompromised`:

```php
// Ensure the password appears less than 3 times in the same data leak...
Password::min(8)->uncompromised(3);
```

Bạn có thể chain tất cả method trong các ví dụ trên:

```php
Password::min(8)
    ->max(256)
    ->letters()
    ->mixedCase()
    ->numbers()
    ->symbols()
    ->uncompromised()
```

Bạn có thể dùng `toPasswordRulesString` để chuyển rule object `Password` thành chuỗi phù hợp với attribute HTML `passwordrules`:

```blade
<input
    type="password"
    name="password"
    autocomplete="new-password"
    passwordrules="{{ Password::defaults()->toPasswordRulesString() }}"
/>
```

<a name="defining-default-password-rules"></a>
#### Định nghĩa rule mật khẩu mặc định

Bạn có thể khai báo validation rule mặc định cho mật khẩu tại một vị trí duy nhất trong ứng dụng bằng `Password::defaults`, method nhận một closure. Closure truyền vào `defaults` phải trả về cấu hình mặc định của rule `Password`. Thông thường, `Password::defaults` được gọi trong method `boot` của một service provider:

```php
use Illuminate\Validation\Rules\Password;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Password::defaults(function () {
        $rule = Password::min(8);

        return $this->app->isProduction()
            ? $rule->mixedCase()->uncompromised()
            : $rule;
    });
}
```

Sau đó, khi muốn áp dụng các rule mặc định cho một mật khẩu đang được validation, hãy gọi `defaults` mà không truyền argument:

```php
'password' => ['required', Password::defaults()],
```

Đôi khi bạn muốn gắn thêm validation rule vào bộ rule mật khẩu mặc định. Hãy dùng method `rules`:

```php
use App\Rules\ZxcvbnRule;

Password::defaults(function () {
    $rule = Password::min(8)->rules([new ZxcvbnRule]);

    // ...
});
```

<a name="custom-validation-rules"></a>
## Validation rule tùy chỉnh

<a name="using-rule-objects"></a>
### Sử dụng Rule Object

Laravel cung cấp nhiều validation rule hữu ích, nhưng bạn cũng có thể tự định nghĩa rule. Một cách đăng ký custom validation rule là dùng rule object. Để tạo rule object mới, hãy dùng Artisan command `make:rule`. Ví dụ sau tạo một rule kiểm tra chuỗi viết hoa. Laravel đặt rule mới trong thư mục `app/Rules`; nếu thư mục chưa tồn tại, Laravel sẽ tự tạo khi command được thực thi:

```shell
php artisan make:rule Uppercase
```

Sau khi tạo rule, bạn có thể định nghĩa hành vi của nó. Rule object chứa method `validate`. Method này nhận tên attribute, giá trị của attribute và callback cần được gọi khi validation thất bại kèm error message:

```php
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (strtoupper($value) !== $value) {
            $fail('The :attribute must be uppercase.');
        }
    }
}
```

Sau khi định nghĩa rule, hãy truyền instance của rule object cùng các validation rule khác để gắn nó vào validator:

```php
use App\Rules\Uppercase;

$request->validate([
    'name' => ['required', 'string', new Uppercase],
]);
```

#### Dịch validation message

Thay vì truyền error message trực tiếp cho closure `$fail`, bạn có thể truyền [translation string key](/docs/{{version}}/localization) và yêu cầu Laravel dịch error message:

```php
if (strtoupper($value) !== $value) {
    $fail('validation.uppercase')->translate();
}
```

Nếu cần, bạn có thể truyền các giá trị thay thế placeholder và ngôn ngữ mong muốn lần lượt ở argument thứ nhất và thứ hai của `translate`:

```php
$fail('validation.location')->translate([
    'value' => $this->value,
], 'fr');
```

#### Truy cập dữ liệu bổ sung

Nếu custom validation rule cần truy cập toàn bộ dữ liệu khác đang được validation, class rule có thể implement interface `Illuminate\Contracts\Validation\DataAwareRule`. Interface này yêu cầu định nghĩa method `setData`. Laravel sẽ tự động gọi method này trước khi validation diễn ra và truyền vào toàn bộ dữ liệu đang được validation:

```php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class Uppercase implements DataAwareRule, ValidationRule
{
    /**
     * All of the data under validation.
     *
     * @var array<string, mixed>
     */
    protected $data = [];

    // ...

    /**
     * Set the data under validation.
     *
     * @param  array<string, mixed>  $data
     */
    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }
}
```

Hoặc nếu validation rule cần truy cập instance validator đang thực hiện validation, bạn có thể implement interface `ValidatorAwareRule`:

```php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\ValidatorAwareRule;
use Illuminate\Validation\Validator;

class Uppercase implements ValidationRule, ValidatorAwareRule
{
    /**
     * The validator instance.
     *
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    // ...

    /**
     * Set the current validator.
     */
    public function setValidator(Validator $validator): static
    {
        $this->validator = $validator;

        return $this;
    }
}
```

<a name="using-closures"></a>
### Sử dụng Closure

Nếu chỉ cần custom rule một lần trong ứng dụng, bạn có thể dùng closure thay cho rule object. Closure nhận tên attribute, giá trị attribute và callback `$fail` cần được gọi nếu validation thất bại:

```php
use Illuminate\Support\Facades\Validator;
use Closure;

$validator = Validator::make($request->all(), [
    'title' => [
        'required',
        'max:255',
        function (string $attribute, mixed $value, Closure $fail) {
            if ($value === 'foo') {
                $fail("The {$attribute} is invalid.");
            }
        },
    ],
]);
```

<a name="implicit-rules"></a>
### Implicit Rule

Mặc định, khi attribute đang validation không tồn tại hoặc chứa chuỗi rỗng, các validation rule thông thường, kể cả custom rule, sẽ không chạy. Ví dụ, rule [unique](#rule-unique) sẽ không chạy với chuỗi rỗng:

```php
use Illuminate\Support\Facades\Validator;

$rules = ['name' => ['unique:users,name']];

$input = ['name' => ''];

Validator::make($input, $rules)->passes(); // true
```

Để custom rule vẫn chạy khi attribute rỗng, rule phải ngụ ý rằng attribute là bắt buộc. Để tạo nhanh implicit rule object, hãy dùng Artisan command `make:rule` với tùy chọn `--implicit`:

```shell
php artisan make:rule Uppercase --implicit
```

> [!WARNING]
> Một rule "implicit" chỉ _ngụ ý_ rằng attribute là bắt buộc. Việc rule có thực sự coi attribute bị thiếu hoặc rỗng là không hợp lệ hay không phụ thuộc vào cách bạn triển khai rule.

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/validation). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
