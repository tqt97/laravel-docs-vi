# HTTP Request

<a name="introduction"></a>
## Giới thiệu

Class `Illuminate\Http\Request` của Laravel cung cấp cách tiếp cận hướng đối tượng để tương tác với HTTP request hiện tại mà ứng dụng đang xử lý, đồng thời lấy dữ liệu đầu vào, cookie và file được gửi kèm request.

<a name="interacting-with-the-request"></a>
## Tương tác với Request

<a name="accessing-the-request"></a>
### Truy cập Request

Để nhận instance của HTTP request hiện tại thông qua dependency injection, hãy type-hint class `Illuminate\Http\Request` trong route closure hoặc controller method. Laravel [service container](/container) sẽ tự động inject instance của request đến:

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
        $name = $request->input('name');

        // Store the user...

        return redirect('/users');
    }
}
```

Tương tự, bạn cũng có thể type-hint `Illuminate\Http\Request` trong route closure. Service container sẽ tự động inject request đến vào closure khi closure được thực thi:

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

<a name="dependency-injection-route-parameters"></a>
#### Dependency Injection và Route Parameter

Nếu controller method đồng thời nhận dữ liệu từ route parameter, bạn nên khai báo các route parameter sau những dependency khác. Ví dụ, với route sau:

```php
use App\Http\Controllers\UserController;

Route::put('/user/{id}', [UserController::class, 'update']);
```

Bạn vẫn có thể type-hint `Illuminate\Http\Request` và truy cập route parameter `id` bằng cách định nghĩa controller method như sau:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the specified user.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        // Update the user...

        return redirect('/users');
    }
}
```

<a name="request-path-and-method"></a>
### Path, Host và Method của Request

Instance `Illuminate\Http\Request` cung cấp nhiều method để kiểm tra HTTP request đến và kế thừa class `Symfony\Component\HttpFoundation\Request`. Dưới đây là một số method quan trọng nhất.

<a name="retrieving-the-request-path"></a>
#### Lấy path của Request

Method `path` trả về thông tin path của request. Ví dụ, nếu request đến `http://example.com/foo/bar`, method `path` sẽ trả về `foo/bar`:

```php
$uri = $request->path();
```

<a name="inspecting-the-request-path"></a>
#### Kiểm tra Request Path / Route

Method `is` cho phép kiểm tra path của request đến có khớp với một pattern cho trước hay không. Bạn có thể dùng ký tự `*` làm wildcard:

```php
if ($request->is('admin/*')) {
    // ...
}
```

Với method `routeIs`, bạn có thể xác định request đến có khớp với một [named route](/routing#named-routes) hay không:

```php
if ($request->routeIs('admin.*')) {
    // ...
}
```

<a name="retrieving-the-request-url"></a>
#### Lấy URL của Request

Để lấy URL đầy đủ của request đến, bạn có thể dùng method `url` hoặc `fullUrl`. `url` trả về URL không bao gồm query string, trong khi `fullUrl` bao gồm cả query string:

```php
$url = $request->url();

$urlWithQueryString = $request->fullUrl();
```

Nếu muốn thêm dữ liệu query string vào URL hiện tại, bạn có thể gọi `fullUrlWithQuery`. Method này gộp mảng biến query string được truyền vào với query string hiện tại:

```php
$request->fullUrlWithQuery(['type' => 'phone']);
```

Nếu muốn lấy URL hiện tại nhưng loại bỏ một query string parameter cụ thể, bạn có thể dùng `fullUrlWithoutQuery`:

```php
$request->fullUrlWithoutQuery(['type']);
```

<a name="retrieving-the-request-host"></a>
#### Lấy Host của Request

Bạn có thể lấy "host" của request đến thông qua các method `host`, `httpHost` và `schemeAndHttpHost`:

```php
// http://localhost:8000
$request->host(); // localhost
$request->httpHost(); // localhost:8000
$request->schemeAndHttpHost(); // http://localhost:8000
```

<a name="retrieving-the-request-method"></a>
#### Lấy HTTP Method của Request

Method `method` trả về HTTP verb của request. Bạn có thể dùng `isMethod` để kiểm tra HTTP verb có khớp với chuỗi cho trước hay không:

```php
$method = $request->method();

if ($request->isMethod('post')) {
    // ...
}
```

<a name="request-headers"></a>
### Header của Request

Bạn có thể lấy header từ instance `Illuminate\Http\Request` bằng method `header`. Nếu header không tồn tại trong request, method trả về `null`. Tuy nhiên, `header` nhận đối số thứ hai tùy chọn để làm giá trị mặc định khi header không tồn tại:

```php
$value = $request->header('X-Header-Name');

$value = $request->header('X-Header-Name', 'default');
```

Method `hasHeader` có thể được dùng để xác định request có chứa một header cụ thể hay không:

```php
if ($request->hasHeader('X-Header-Name')) {
    // ...
}
```

Để thuận tiện, method `bearerToken` có thể được dùng để lấy bearer token từ header `Authorization`. Nếu header này không tồn tại, một chuỗi rỗng sẽ được trả về:

```php
$token = $request->bearerToken();
```

<a name="request-ip-address"></a>
### Địa chỉ IP của Request

Method `ip` có thể được dùng để lấy địa chỉ IP của client đã gửi request đến ứng dụng:

```php
$ipAddress = $request->ip();
```

Nếu muốn lấy mảng địa chỉ IP, bao gồm toàn bộ địa chỉ IP client được proxy chuyển tiếp, bạn có thể dùng method `ips`. Địa chỉ IP client "gốc" sẽ nằm ở cuối mảng:

```php
$ipAddresses = $request->ips();
```

Nhìn chung, địa chỉ IP nên được xem là dữ liệu đầu vào không đáng tin cậy và có thể bị người dùng kiểm soát; chỉ nên sử dụng cho mục đích cung cấp thông tin.

<a name="content-negotiation"></a>
### Content Negotiation

Laravel cung cấp một số method để kiểm tra các content type mà request yêu cầu thông qua header `Accept`. Trước tiên, `getAcceptableContentTypes` trả về mảng chứa tất cả content type mà request chấp nhận:

```php
$contentTypes = $request->getAcceptableContentTypes();
```

Method `accepts` nhận một mảng content type và trả về `true` nếu request chấp nhận ít nhất một content type trong số đó. Ngược lại, method trả về `false`:

```php
if ($request->accepts(['text/html', 'application/json'])) {
    // ...
}
```

Bạn có thể dùng `prefers` để xác định content type nào trong mảng được request ưu tiên nhất. Nếu request không chấp nhận content type nào được cung cấp, method trả về `null`:

```php
$preferred = $request->prefers(['text/html', 'application/json']);
```

Vì nhiều ứng dụng chỉ phục vụ HTML hoặc JSON, bạn có thể dùng `expectsJson` để nhanh chóng xác định request đến có mong đợi JSON response hay không:

```php
if ($request->expectsJson()) {
    // ...
}
```

Nếu cần xác định request có ưu tiên riêng Markdown hay chấp nhận Markdown cùng các content type khác — chẳng hạn khi phục vụ AI agent hoặc client tiêu thụ Markdown response — bạn có thể dùng `wantsMarkdown` và `acceptsMarkdown`:

```php
if ($request->wantsMarkdown()) {
    // The client's most preferred content type is text/markdown...
}

if ($request->acceptsMarkdown()) {
    // The client accepts Markdown responses...
}
```

<a name="psr7-requests"></a>
### PSR-7 Request

[Tiêu chuẩn PSR-7](https://www.php-fig.org/psr/psr-7/) định nghĩa các interface cho HTTP message, bao gồm request và response. Nếu muốn nhận một instance PSR-7 request thay vì Laravel request, trước tiên bạn cần cài đặt một số thư viện. Laravel sử dụng component *Symfony HTTP Message Bridge* để chuyển đổi request và response Laravel thông thường thành các implementation tương thích PSR-7:

```shell
composer require symfony/psr-http-message-bridge
composer require nyholm/psr7
```

Sau khi cài đặt các thư viện này, bạn có thể nhận PSR-7 request bằng cách type-hint request interface trong route closure hoặc controller method:

```php
use Psr\Http\Message\ServerRequestInterface;

Route::get('/', function (ServerRequestInterface $request) {
    // ...
});
```

> [!NOTE]
> Nếu trả về một instance PSR-7 response từ route hoặc controller, Laravel sẽ tự động chuyển đổi nó trở lại thành Laravel response trước khi framework gửi response đến client.

<a name="input"></a>
## Dữ liệu đầu vào

<a name="retrieving-input"></a>
### Lấy dữ liệu đầu vào

<a name="retrieving-all-input-data"></a>
#### Lấy toàn bộ dữ liệu đầu vào

Bạn có thể lấy toàn bộ dữ liệu đầu vào của request dưới dạng `array` bằng method `all`. Method này có thể được sử dụng bất kể request đến từ HTML form hay là XHR request:

```php
$input = $request->all();
```

Với method `collect`, bạn có thể lấy toàn bộ dữ liệu đầu vào của request dưới dạng [collection](/collections):

```php
$input = $request->collect();
```

Method `collect` cũng cho phép lấy một phần dữ liệu đầu vào của request dưới dạng collection:

```php
$request->collect('users')->each(function (string $user) {
    // ...
});
```

<a name="retrieving-an-input-value"></a>
#### Lấy một giá trị đầu vào

Thông qua một số method đơn giản, bạn có thể truy cập toàn bộ dữ liệu đầu vào của người dùng từ instance `Illuminate\Http\Request` mà không cần quan tâm request sử dụng HTTP verb nào. Bất kể HTTP verb là gì, method `input` đều có thể được dùng để lấy dữ liệu đầu vào:

```php
$name = $request->input('name');
```

Bạn có thể truyền giá trị mặc định làm argument thứ hai cho method `input`. Giá trị này sẽ được trả về nếu request không chứa input được yêu cầu:

```php
$name = $request->input('name', 'Sally');
```

Khi làm việc với form chứa input dạng array, hãy sử dụng cú pháp "dot" để truy cập các phần tử:

```php
$name = $request->input('products.0.name');

$names = $request->input('products.*.name');
```

Bạn có thể gọi method `input` mà không truyền argument để lấy toàn bộ giá trị đầu vào dưới dạng associative array:

```php
$input = $request->input();
```

<a name="retrieving-input-from-the-query-string"></a>
#### Lấy dữ liệu đầu vào từ Query String

Trong khi method `input` lấy giá trị từ toàn bộ request payload, bao gồm cả query string, method `query` chỉ lấy các giá trị từ query string:

```php
$name = $request->query('name');
```

Nếu query string không chứa giá trị được yêu cầu, argument thứ hai của method sẽ được trả về:

```php
$name = $request->query('name', 'Helen');
```

Bạn có thể gọi method `query` mà không truyền argument để lấy toàn bộ giá trị query string dưới dạng associative array:

```php
$query = $request->query();
```

<a name="retrieving-json-input-values"></a>
#### Lấy giá trị đầu vào JSON

Khi gửi JSON request đến ứng dụng, bạn có thể truy cập dữ liệu JSON thông qua method `input`, miễn là header `Content-Type` của request được đặt chính xác thành `application/json`. Bạn cũng có thể dùng cú pháp "dot" để lấy các giá trị lồng bên trong JSON array / object:

```php
$name = $request->input('user.name');
```

<a name="retrieving-stringable-input-values"></a>
#### Lấy giá trị đầu vào dạng Stringable

Thay vì lấy dữ liệu đầu vào của request dưới dạng `string` nguyên thủy, bạn có thể dùng method `string` để nhận dữ liệu dưới dạng instance [Illuminate\Support\Stringable](/strings):

```php
$name = $request->string('name')->trim();
```

<a name="retrieving-integer-input-values"></a>
#### Lấy giá trị đầu vào dạng Integer

Để lấy giá trị đầu vào dưới dạng integer, bạn có thể dùng method `integer`. Method này sẽ cố gắng cast giá trị đầu vào thành integer. Nếu input không tồn tại hoặc việc cast thất bại, method sẽ trả về giá trị mặc định mà bạn chỉ định. Điều này đặc biệt hữu ích với pagination hoặc các input dạng số khác:

```php
$perPage = $request->integer('per_page');
```

<a name="retrieving-boolean-input-values"></a>
#### Lấy giá trị đầu vào dạng Boolean

Khi xử lý các phần tử HTML như checkbox, ứng dụng có thể nhận những giá trị mang nghĩa đúng nhưng thực tế lại là string, chẳng hạn `"true"` hoặc `"on"`. Để thuận tiện, bạn có thể dùng method `boolean` để lấy các giá trị này dưới dạng boolean. Method `boolean` trả về `true` đối với `1`, `"1"`, `true`, `"true"`, `"on"` và `"yes"`; mọi giá trị khác sẽ trả về `false`:

```php
$archived = $request->boolean('archived');
```

<a name="retrieving-array-input-values"></a>
#### Lấy giá trị đầu vào dạng Array

Các giá trị đầu vào chứa array có thể được lấy bằng method `array`. Method này luôn cast giá trị đầu vào thành array. Nếu request không chứa input với tên đã cho, một array rỗng sẽ được trả về:

```php
$versions = $request->array('versions');
```

<a name="retrieving-date-input-values"></a>
#### Lấy giá trị đầu vào dạng Date

Để thuận tiện, các input chứa ngày / giờ có thể được lấy dưới dạng Carbon instance bằng method `date`. Nếu request không chứa input với tên đã cho, `null` sẽ được trả về:

```php
$birthday = $request->date('birthday');
```

Argument thứ hai và thứ ba của method `date` lần lượt được dùng để chỉ định format và timezone của ngày:

```php
$elapsed = $request->date('elapsed', '!H:i', 'Europe/Madrid');
```

Nếu input tồn tại nhưng có format không hợp lệ, `InvalidArgumentException` sẽ được throw; vì vậy, bạn nên validate input trước khi gọi method `date`.

<a name="retrieving-interval-input-values"></a>
#### Lấy giá trị đầu vào dạng Interval

Các input biểu diễn khoảng thời gian có thể được lấy dưới dạng instance `CarbonInterval` bằng method `interval`. Nếu request không chứa input với tên đã cho, `null` sẽ được trả về:

```php
$duration = $request->interval('duration');
```

Nếu input là giá trị số, bạn có thể truyền đơn vị làm argument thứ hai. Đơn vị có thể là string như `second`, `minute`, `day`, hoặc một instance enum `Carbon\Unit`:

```php
use Carbon\Unit;

$timeout = $request->interval('timeout', 'second');

$delay = $request->interval('delay', Unit::Minute);
```

Nếu input tồn tại nhưng có format không hợp lệ, `InvalidArgumentException` sẽ được throw; vì vậy, bạn nên validate input trước khi gọi method `interval`.

<a name="retrieving-enum-input-values"></a>
#### Lấy giá trị đầu vào dạng Enum

Các input tương ứng với [PHP enum](https://www.php.net/manual/en/language.types.enumerations.php) cũng có thể được lấy trực tiếp từ request. Nếu request không chứa input với tên đã cho hoặc enum không có backing value khớp với input, `null` sẽ được trả về. Method `enum` nhận tên input và enum class lần lượt làm argument thứ nhất và thứ hai:

```php
use App\Enums\Status;

$status = $request->enum('status', Status::class);
```

Bạn cũng có thể cung cấp giá trị mặc định để trả về khi input bị thiếu hoặc không hợp lệ:

```php
$status = $request->enum('status', Status::class, Status::Pending);
```

Nếu input là một array các giá trị tương ứng với PHP enum, bạn có thể dùng method `enums` để lấy array đó dưới dạng các enum instance:

```php
use App\Enums\Product;

$products = $request->enums('products', Product::class);
```

<a name="retrieving-input-via-dynamic-properties"></a>
#### Lấy dữ liệu đầu vào qua Dynamic Property

Bạn cũng có thể truy cập input của người dùng thông qua dynamic property trên instance `Illuminate\Http\Request`. Ví dụ, nếu một form của ứng dụng có field `name`, bạn có thể truy cập giá trị của field như sau:

```php
$name = $request->name;
```

Khi sử dụng dynamic property, Laravel trước tiên tìm giá trị của parameter trong request payload. Nếu không tồn tại, Laravel sẽ tiếp tục tìm field đó trong parameter của route đã match.

<a name="retrieving-a-portion-of-the-input-data"></a>
#### Lấy một phần dữ liệu đầu vào

Nếu chỉ cần lấy một phần dữ liệu đầu vào, bạn có thể dùng các method `only` và `except`. Cả hai method đều nhận một `array` hoặc danh sách argument động:

```php
$input = $request->only(['username', 'password']);

$input = $request->only('username', 'password');

$input = $request->except(['credit_card']);

$input = $request->except('credit_card');
```

> [!WARNING]
> Method `only` trả về các cặp key / value mà bạn yêu cầu; tuy nhiên, nó sẽ không trả về những cặp key / value không tồn tại trong request.

<a name="input-presence"></a>
### Kiểm tra sự tồn tại của dữ liệu đầu vào

Bạn có thể dùng method `has` để xác định một giá trị có tồn tại trong request hay không. Method `has` trả về `true` nếu giá trị tồn tại trong request:

```php
if ($request->has('name')) {
    // ...
}
```

Khi nhận một array, method `has` sẽ xác định liệu tất cả các giá trị được chỉ định có tồn tại hay không:

```php
if ($request->has(['name', 'email'])) {
    // ...
}
```

Method `hasAny` trả về `true` nếu có ít nhất một trong các giá trị được chỉ định tồn tại:

```php
if ($request->hasAny(['name', 'email'])) {
    // ...
}
```

Method `whenHas` sẽ thực thi closure được cung cấp nếu giá trị tồn tại trong request:

```php
$request->whenHas('name', function (string $input) {
    // ...
});
```

Bạn có thể truyền closure thứ hai cho method `whenHas`; closure này sẽ được thực thi nếu giá trị được chỉ định không tồn tại trong request:

```php
$request->whenHas('name', function (string $input) {
    // The "name" value is present...
}, function () {
    // The "name" value is not present...
});
```

Nếu muốn xác định một giá trị vừa tồn tại trong request vừa không phải string rỗng, bạn có thể dùng method `filled`:

```php
if ($request->filled('name')) {
    // ...
}
```

Nếu muốn xác định một giá trị không tồn tại trong request hoặc là string rỗng, bạn có thể dùng method `isNotFilled`:

```php
if ($request->isNotFilled('name')) {
    // ...
}
```

Khi nhận một array, method `isNotFilled` sẽ xác định liệu tất cả các giá trị được chỉ định đều bị thiếu hoặc rỗng hay không:

```php
if ($request->isNotFilled(['name', 'email'])) {
    // ...
}
```

Method `anyFilled` trả về `true` nếu có ít nhất một giá trị được chỉ định không phải string rỗng:

```php
if ($request->anyFilled(['name', 'email'])) {
    // ...
}
```

Method `whenFilled` sẽ thực thi closure được cung cấp nếu giá trị tồn tại trong request và không phải string rỗng:

```php
$request->whenFilled('name', function (string $input) {
    // ...
});
```

Bạn có thể truyền closure thứ hai cho method `whenFilled`; closure này sẽ được thực thi nếu giá trị được chỉ định không ở trạng thái "filled":

```php
$request->whenFilled('name', function (string $input) {
    // The "name" value is filled...
}, function () {
    // The "name" value is not filled...
});
```

Để xác định một key có vắng mặt trong request hay không, bạn có thể dùng các method `missing` và `whenMissing`:

```php
if ($request->missing('name')) {
    // ...
}

$request->whenMissing('name', function () {
    // The "name" value is missing...
}, function () {
    // The "name" value is present...
});
```

<a name="merging-additional-input"></a>
### Gộp thêm dữ liệu đầu vào

Đôi khi bạn cần gộp thủ công dữ liệu đầu vào bổ sung vào dữ liệu hiện có của request. Bạn có thể dùng method `merge` cho mục đích này. Nếu một input key đã tồn tại trong request, giá trị của nó sẽ bị ghi đè bởi dữ liệu truyền vào `merge`:

```php
$request->merge(['votes' => 0]);
```

Method `mergeIfMissing` có thể được dùng để gộp input vào request nếu các key tương ứng chưa tồn tại trong dữ liệu đầu vào của request:

```php
$request->mergeIfMissing(['votes' => 0]);
```

<a name="old-input"></a>
### Dữ liệu đầu vào cũ

Laravel cho phép giữ lại dữ liệu đầu vào của một request để sử dụng trong request kế tiếp. Tính năng này đặc biệt hữu ích khi cần điền lại form sau khi phát hiện lỗi validation. Tuy nhiên, nếu đang sử dụng [các tính năng validation](/validation) có sẵn của Laravel, bạn có thể không cần gọi trực tiếp các method flash input vào session vì một số cơ chế validation tích hợp sẵn sẽ tự động thực hiện việc này.

<a name="flashing-input-to-the-session"></a>
#### Flash dữ liệu đầu vào vào Session

Method `flash` trên class `Illuminate\Http\Request` sẽ flash dữ liệu đầu vào hiện tại vào [session](/session), nhờ đó dữ liệu có thể được sử dụng trong request kế tiếp của người dùng:

```php
$request->flash();
```

Bạn cũng có thể dùng `flashOnly` và `flashExcept` để chỉ flash một phần dữ liệu request vào session. Các method này hữu ích khi cần tránh lưu thông tin nhạy cảm như password vào session:

```php
$request->flashOnly(['username', 'email']);

$request->flashExcept('password');
```

<a name="flashing-input-then-redirecting"></a>
#### Flash dữ liệu đầu vào rồi Redirect

Vì bạn thường cần flash input vào session rồi redirect về trang trước, có thể chain việc flash input trực tiếp vào redirect bằng method `withInput`:

```php
return redirect('/form')->withInput();

return redirect()->route('user.create')->withInput();

return redirect('/form')->withInput(
    $request->except('password')
);
```

<a name="retrieving-old-input"></a>
#### Lấy dữ liệu đầu vào cũ

Để lấy dữ liệu đầu vào đã được flash từ request trước, hãy gọi method `old` trên instance `Illuminate\Http\Request`. Method `old` sẽ lấy dữ liệu đã flash trước đó từ [session](/session):

```php
$username = $request->old('username');
```

Laravel cũng cung cấp helper global `old`. Khi hiển thị dữ liệu đầu vào cũ trong [Blade template](/blade), sử dụng helper `old` sẽ thuận tiện hơn để điền lại form. Nếu field không có dữ liệu cũ, `null` sẽ được trả về:

```blade
<input type="text" name="username" value="{{ old('username') }}">
```

<a name="cookies"></a>
### Cookies

<a name="retrieving-cookies-from-requests"></a>
#### Lấy Cookie từ Request

Tất cả cookie do Laravel tạo đều được mã hóa và ký bằng authentication code, vì vậy chúng sẽ bị xem là không hợp lệ nếu đã bị client thay đổi. Để lấy giá trị cookie từ request, hãy dùng method `cookie` trên instance `Illuminate\Http\Request`:

```php
$value = $request->cookie('name');
```

<a name="input-trimming-and-normalization"></a>
## Cắt khoảng trắng và chuẩn hóa dữ liệu đầu vào

Mặc định, Laravel bao gồm middleware `Illuminate\Foundation\Http\Middleware\TrimStrings` và `Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull` trong global middleware stack của ứng dụng. Các middleware này tự động trim mọi field dạng string trong request và chuyển các string rỗng thành `null`. Nhờ đó, bạn không cần tự xử lý các vấn đề chuẩn hóa này trong route và controller.

#### Tắt chuẩn hóa dữ liệu đầu vào

Nếu muốn tắt hành vi này cho mọi request, bạn có thể loại bỏ hai middleware khỏi middleware stack bằng cách gọi `$middleware->remove` trong file `bootstrap/app.php`:

```php
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\TrimStrings;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->remove([
        ConvertEmptyStringsToNull::class,
        TrimStrings::class,
    ]);
})
```

Nếu chỉ muốn tắt việc trim string và chuyển string rỗng thành `null` cho một nhóm request, bạn có thể dùng các method middleware `trimStrings` và `convertEmptyStringsToNull` trong `bootstrap/app.php`. Cả hai method nhận một array closure; mỗi closure cần trả về `true` hoặc `false` để cho biết có bỏ qua việc chuẩn hóa input hay không:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->convertEmptyStringsToNull(except: [
        fn (Request $request) => $request->is('admin/*'),
    ]);

    $middleware->trimStrings(except: [
        fn (Request $request) => $request->is('admin/*'),
    ]);
})
```

<a name="files"></a>
## File

<a name="retrieving-uploaded-files"></a>
### Lấy file đã upload

Bạn có thể lấy file đã upload từ instance `Illuminate\Http\Request` bằng method `file` hoặc dynamic property. Method `file` trả về instance của class `Illuminate\Http\UploadedFile`, class này kế thừa PHP `SplFileInfo` và cung cấp nhiều method để tương tác với file:

```php
$file = $request->file('photo');

$file = $request->photo;
```

Bạn có thể xác định một file có tồn tại trong request hay không bằng method `hasFile`:

```php
if ($request->hasFile('photo')) {
    // ...
}
```

Nếu file upload là hình ảnh cần xử lý trước khi lưu, bạn có thể dùng method `image` để lấy instance `Illuminate\Image\Image`, hoặc `null` nếu file không tồn tại:

```php
$image = $request->image('photo');
```

Để biết thêm về xử lý hình ảnh, hãy xem [tài liệu xử lý hình ảnh](/images) đầy đủ.

<a name="validating-successful-uploads"></a>
#### Kiểm tra upload thành công

Ngoài việc kiểm tra file có tồn tại, bạn có thể xác minh quá trình upload không gặp lỗi bằng method `isValid`:

```php
if ($request->file('photo')->isValid()) {
    // ...
}
```

<a name="file-paths-extensions"></a>
#### Path và extension của file

Class `UploadedFile` cũng cung cấp các method để truy cập path đầy đủ và extension của file. Method `extension` sẽ cố gắng xác định extension dựa trên nội dung file. Extension này có thể khác với extension do client cung cấp:

```php
$path = $request->photo->path();

$extension = $request->photo->extension();
```

<a name="other-file-methods"></a>
#### Các method khác của File

Instance `UploadedFile` còn cung cấp nhiều method khác. Hãy xem [tài liệu API của class](https://github.com/symfony/symfony/blob/6.0/src/Symfony/Component/HttpFoundation/File/UploadedFile.php) để biết thêm chi tiết.

<a name="storing-uploaded-files"></a>
### Lưu file đã upload

Để lưu file đã upload, thông thường bạn sẽ sử dụng một trong các [filesystem](/filesystem) đã cấu hình. Class `UploadedFile` có method `store` để chuyển file upload vào một disk; disk này có thể nằm trên filesystem cục bộ hoặc cloud storage như Amazon S3.

Method `store` nhận path nơi file sẽ được lưu, tính tương đối từ root directory đã cấu hình của filesystem. Path này không nên chứa filename vì Laravel sẽ tự động tạo một ID duy nhất làm filename.

Method `store` cũng nhận argument thứ hai tùy chọn là tên disk dùng để lưu file. Method sẽ trả về path của file tính tương đối từ root của disk:

```php
$path = $request->photo->store('images');

$path = $request->photo->store('images', 's3');
```

Nếu không muốn filename được tạo tự động, bạn có thể dùng method `storeAs`, nhận path, filename và tên disk làm các argument:

```php
$path = $request->photo->storeAs('images', 'filename.jpg');

$path = $request->photo->storeAs('images', 'filename.jpg', 's3');
```

> [!NOTE]
> Để biết thêm về lưu trữ file trong Laravel, hãy xem [tài liệu filesystem](/filesystem) đầy đủ.

<a name="configuring-trusted-proxies"></a>
## Cấu hình Trusted Proxy

Khi ứng dụng chạy phía sau load balancer thực hiện TLS / SSL termination, đôi khi ứng dụng có thể không tạo HTTPS link khi dùng helper `url`. Nguyên nhân thường là load balancer forward traffic đến ứng dụng qua port 80, khiến ứng dụng không biết rằng nó cần tạo secure link.

Để xử lý vấn đề này, bạn có thể bật middleware `Illuminate\Http\Middleware\TrustProxies` có sẵn trong Laravel. Middleware này cho phép cấu hình nhanh các load balancer hoặc proxy mà ứng dụng tin cậy. Trusted proxy được chỉ định bằng method middleware `trustProxies` trong file `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(at: [
        '192.168.1.1',
        '10.0.0.0/8',
    ]);
})
```

Ngoài việc cấu hình trusted proxy, bạn cũng có thể cấu hình các proxy header được tin cậy:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(headers: Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB
    );
})
```

> [!NOTE]
> Nếu sử dụng AWS Elastic Load Balancing, giá trị `headers` nên là `Request::HEADER_X_FORWARDED_AWS_ELB`. Nếu load balancer sử dụng header `Forwarded` tiêu chuẩn theo [RFC 7239](https://www.rfc-editor.org/rfc/rfc7239#section-4), giá trị `headers` nên là `Request::HEADER_FORWARDED`. Để biết thêm về các constant có thể dùng cho `headers`, hãy xem tài liệu Symfony về [trusted proxy](https://symfony.com/doc/current/deployment/proxies.html).

<a name="trusting-all-proxies"></a>
#### Tin cậy tất cả Proxy

Nếu sử dụng Amazon AWS hoặc một nhà cung cấp load balancer "cloud" khác, bạn có thể không biết IP thực tế của các balancer. Trong trường hợp này, có thể dùng `*` để tin cậy tất cả proxy:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(at: '*');
})
```

<a name="configuring-trusted-hosts"></a>
## Cấu hình Trusted Host

Mặc định, Laravel phản hồi mọi request nhận được bất kể nội dung header `Host` của HTTP request. Ngoài ra, giá trị header `Host` sẽ được sử dụng khi tạo absolute URL đến ứng dụng trong quá trình xử lý web request.

Thông thường, bạn nên cấu hình web server như Nginx hoặc Apache chỉ chuyển đến ứng dụng các request khớp với hostname cho phép. Tuy nhiên, nếu không thể trực tiếp tùy chỉnh web server và cần yêu cầu Laravel chỉ phản hồi một số hostname nhất định, bạn có thể bật middleware `Illuminate\Http\Middleware\TrustHosts`.

Để bật middleware `TrustHosts`, hãy gọi method middleware `trustHosts` trong file `bootstrap/app.php`. Thông qua argument `at`, bạn có thể chỉ định các hostname mà ứng dụng được phép phản hồi. Chuỗi hostname được xử lý như regular expression. Request có header `Host` khác sẽ bị từ chối:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustHosts(at: ['^laravel\.test$']);
})
```

Mặc định, request đến từ subdomain của URL ứng dụng cũng tự động được tin cậy. Nếu muốn tắt hành vi này, bạn có thể dùng argument `subdomains`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustHosts(at: ['^laravel\.test$'], subdomains: false);
})
```

Nếu cần truy cập file cấu hình hoặc database của ứng dụng để xác định trusted host, bạn có thể truyền closure cho argument `at`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustHosts(at: fn () => config('app.trusted_hosts'));
})
```
