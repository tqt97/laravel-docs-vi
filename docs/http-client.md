# HTTP Client

<a name="introduction"></a>
## Giới thiệu

Laravel cung cấp một API tối giản nhưng giàu khả năng biểu đạt trên [Guzzle HTTP client](http://docs.guzzlephp.org/en/stable/), cho phép bạn nhanh chóng gửi các HTTP request ra ngoài để giao tiếp với những ứng dụng web khác. Lớp wrapper của Laravel quanh Guzzle tập trung vào các trường hợp sử dụng phổ biến nhất và mang lại trải nghiệm phát triển thuận tiện.

<a name="making-requests"></a>
## Thực hiện request

Để thực hiện request, bạn có thể dùng các phương thức `head`, `get`, `post`, `put`, `patch` và `delete` do facade `Http` cung cấp. Trước tiên, hãy xem cách gửi một request `GET` cơ bản đến một URL khác:

```php
use Illuminate\Support\Facades\Http;

$response = Http::get('http://example.com');
```

Phương thức `get` trả về một instance của `Illuminate\Http\Client\Response`, cung cấp nhiều phương thức để kiểm tra response:

```php
$response->body() : string;
$response->json($key = null, $default = null, $flags = null) : mixed;
$response->object() : object;
$response->collect($key = null) : Illuminate\Support\Collection;
$response->resource() : resource;
$response->status() : int;
$response->successful() : bool;
$response->redirect(): bool;
$response->failed() : bool;
$response->clientError() : bool;
$response->header($header) : string;
$response->headers() : array;
```

Đối tượng `Illuminate\Http\Client\Response` cũng triển khai interface `ArrayAccess` của PHP, cho phép bạn truy cập trực tiếp dữ liệu JSON trên response:

```php
return Http::get('http://example.com/users/1')['name'];
```

Ngoài các phương thức response ở trên, bạn có thể dùng các phương thức sau để xác định response có một mã trạng thái cụ thể hay không:

```php
$response->ok() : bool;                  // 200 OK
$response->created() : bool;             // 201 Created
$response->accepted() : bool;            // 202 Accepted
$response->noContent() : bool;           // 204 No Content
$response->movedPermanently() : bool;    // 301 Moved Permanently
$response->found() : bool;               // 302 Found
$response->badRequest() : bool;          // 400 Bad Request
$response->unauthorized() : bool;        // 401 Unauthorized
$response->paymentRequired() : bool;     // 402 Payment Required
$response->forbidden() : bool;           // 403 Forbidden
$response->notFound() : bool;            // 404 Not Found
$response->requestTimeout() : bool;      // 408 Request Timeout
$response->conflict() : bool;            // 409 Conflict
$response->unprocessableEntity() : bool; // 422 Unprocessable Entity
$response->tooManyRequests() : bool;     // 429 Too Many Requests
$response->serverError() : bool;         // 500 Internal Server Error
```

<a name="uri-templates"></a>
#### URI Template

HTTP client cũng cho phép xây dựng URL request theo [đặc tả URI template](https://www.rfc-editor.org/rfc/rfc6570). Để định nghĩa các tham số URL có thể được URI template mở rộng, bạn có thể dùng phương thức `withUrlParameters`:

```php
Http::withUrlParameters([
    'endpoint' => 'https://laravel.com',
    'page' => 'docs',
    'version' => '13.x',
    'topic' => 'validation',
])->get('{+endpoint}/{page}/{version}/{topic}');
```

<a name="dumping-requests"></a>
#### Dump request

Nếu muốn dump instance của request sắp gửi trước khi nó được gửi đi và dừng thực thi script, bạn có thể thêm phương thức `dd` vào đầu phần định nghĩa request:

```php
return Http::dd()->get('http://example.com');
```

<a name="request-data"></a>
### Dữ liệu request

Khi gửi request `POST`, `PUT` và `PATCH`, việc gửi thêm dữ liệu cùng request là rất phổ biến. Vì vậy, các phương thức này nhận một mảng dữ liệu làm đối số thứ hai. Mặc định, dữ liệu được gửi với content type `application/json`:

```php
use Illuminate\Support\Facades\Http;

$response = Http::post('http://example.com/users', [
    'name' => 'Steve',
    'role' => 'Network Administrator',
]);
```

<a name="get-request-query-parameters"></a>
#### Tham số query của request GET

Khi gửi request `GET`, bạn có thể nối query string trực tiếp vào URL hoặc truyền một mảng các cặp key / value làm đối số thứ hai cho phương thức `get`:

```php
$response = Http::get('http://example.com/users', [
    'name' => 'Taylor',
    'page' => 1,
]);
```

Ngoài ra, bạn có thể dùng phương thức `withQueryParameters`:

```php
Http::retry(3, 100)->withQueryParameters([
    'name' => 'Taylor',
    'page' => 1,
])->get('http://example.com/users');
```

<a name="sending-form-url-encoded-requests"></a>
#### Gửi request dạng form URL encoded

Nếu muốn gửi dữ liệu với content type `application/x-www-form-urlencoded`, bạn nên gọi phương thức `asForm` trước khi thực hiện request:

```php
$response = Http::asForm()->post('http://example.com/users', [
    'name' => 'Sara',
    'role' => 'Privacy Consultant',
]);
```

<a name="sending-a-raw-request-body"></a>
#### Gửi raw request body

Bạn có thể dùng phương thức `withBody` để cung cấp raw request body khi thực hiện request. Content type có thể được truyền qua đối số thứ hai của phương thức:

```php
$response = Http::withBody(
    base64_encode($photo), 'image/jpeg'
)->post('http://example.com/photo');
```

<a name="multi-part-requests"></a>
#### Request multipart

Nếu muốn gửi file dưới dạng request multipart, bạn nên gọi phương thức `attach` trước khi thực hiện request. Phương thức này nhận tên file và nội dung file. Khi cần, bạn có thể truyền đối số thứ ba làm filename của file, còn đối số thứ tư dùng để cung cấp các header liên quan đến file:

```php
$response = Http::attach(
    'attachment', file_get_contents('photo.jpg'), 'photo.jpg', ['Content-Type' => 'image/jpeg']
)->post('http://example.com/attachments');
```

Thay vì truyền trực tiếp nội dung thô của file, bạn có thể truyền một stream resource:

```php
$photo = fopen('photo.jpg', 'r');

$response = Http::attach(
    'attachment', $photo, 'photo.jpg'
)->post('http://example.com/attachments');
```

<a name="headers"></a>
### Header

Bạn có thể thêm header vào request bằng phương thức `withHeaders`. Phương thức này nhận một mảng các cặp key / value:

```php
$response = Http::withHeaders([
    'X-First' => 'foo',
    'X-Second' => 'bar'
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

Bạn có thể dùng phương thức `accept` để chỉ định content type mà ứng dụng mong đợi trong response:

```php
$response = Http::accept('application/json')->get('http://example.com/users');
```

Để thuận tiện, bạn có thể dùng phương thức `acceptJson` để nhanh chóng chỉ định rằng ứng dụng mong đợi content type `application/json` trong response:

```php
$response = Http::acceptJson()->get('http://example.com/users');
```

Phương thức `withHeaders` merge các header mới vào những header hiện có của request. Khi cần, bạn có thể thay thế toàn bộ header bằng phương thức `replaceHeaders`:

```php
$response = Http::withHeaders([
    'X-Original' => 'foo',
])->replaceHeaders([
    'X-Replacement' => 'bar',
])->post('http://example.com/users', [
    'name' => 'Taylor',
]);
```

<a name="authentication"></a>
### Xác thực

Bạn có thể chỉ định thông tin xác thực Basic và Digest lần lượt bằng các phương thức `withBasicAuth` và `withDigestAuth`:

```php
// Basic authentication...
$response = Http::withBasicAuth('taylor@laravel.com', 'secret')->post(/* ... */);

// Digest authentication...
$response = Http::withDigestAuth('taylor@laravel.com', 'secret')->post(/* ... */);
```

<a name="bearer-tokens"></a>
#### Bearer token

Nếu muốn nhanh chóng thêm bearer token vào header `Authorization` của request, bạn có thể dùng phương thức `withToken`:

```php
$response = Http::withToken('token')->post(/* ... */);
```

<a name="timeout"></a>
### Timeout

Phương thức `timeout` dùng để chỉ định số giây tối đa chờ response. Mặc định, HTTP client sẽ timeout sau 30 giây:

```php
$response = Http::timeout(3)->get(/* ... */);
```

Nếu vượt quá timeout đã chỉ định, một instance của `Illuminate\Http\Client\ConnectionException` sẽ được throw.

Bạn có thể chỉ định số giây tối đa chờ khi cố gắng kết nối đến server bằng phương thức `connectTimeout`. Giá trị mặc định là 10 giây:

```php
$response = Http::connectTimeout(3)->get(/* ... */);
```

<a name="retries"></a>
### Thử lại

Nếu muốn HTTP client tự động thử lại request khi xảy ra lỗi phía client hoặc server, bạn có thể dùng phương thức `retry`. Phương thức `retry` nhận số lần thử tối đa và số mili giây Laravel cần chờ giữa các lần thử:

```php
$response = Http::retry(3, 100)->post(/* ... */);
```

Nếu muốn tự tính số mili giây chờ giữa các lần thử, bạn có thể truyền một closure làm đối số thứ hai cho phương thức `retry`:

```php
use Exception;

$response = Http::retry(3, function (int $attempt, Exception $exception) {
    return $attempt * 100;
})->post(/* ... */);
```

Để thuận tiện, bạn cũng có thể truyền một mảng làm đối số đầu tiên cho phương thức `retry`. Mảng này được dùng để xác định số mili giây cần chờ giữa các lần thử kế tiếp:

```php
$response = Http::retry([100, 200])->post(/* ... */);
```

Khi cần, bạn có thể truyền argument thứ ba cho method `retry`. Argument này phải là một callable quyết định có thực sự retry hay không. Ví dụ, bạn có thể chỉ muốn retry request khi lần request đầu tiên gặp `ConnectionException`:

```php
use Illuminate\Http\Client\PendingRequest;
use Throwable;

$response = Http::retry(3, 100, function (Throwable $exception, PendingRequest $request) {
    return $exception instanceof ConnectionException;
})->post(/* ... */);
```

Nếu một lần request thất bại, bạn có thể muốn thay đổi request trước khi thực hiện attempt mới. Bạn có thể làm điều này bằng cách chỉnh sửa argument request được truyền vào callable của method `retry`. Ví dụ, bạn có thể retry request với authorization token mới nếu attempt đầu tiên trả về authentication error:

```php
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Throwable;

$response = Http::withToken($this->getToken())->retry(2, 0, function (Throwable $exception, PendingRequest $request) {
    if (! $exception instanceof RequestException || $exception->response->status() !== 401) {
        return false;
    }

    $request->withToken($this->getNewToken());

    return true;
})->post(/* ... */);
```

Nếu tất cả request đều thất bại, một instance của `Illuminate\Http\Client\RequestException` sẽ được throw. Nếu muốn tắt hành vi này, bạn có thể truyền đối số `throw` với giá trị `false`. Khi đó, response cuối cùng mà client nhận được sẽ được trả về sau khi đã thực hiện hết các lần thử lại:

```php
$response = Http::retry(3, 100, throw: false)->post(/* ... */);
```

> [!WARNING]
> Nếu tất cả request đều thất bại do sự cố kết nối, `Illuminate\Http\Client\ConnectionException` vẫn sẽ được throw ngay cả khi đối số `throw` được đặt thành `false`.

<a name="error-handling"></a>
### Xử lý lỗi

Khác với hành vi mặc định của Guzzle, HTTP client wrapper của Laravel không throw exception khi gặp lỗi phía client hoặc server (response nhóm `400` và `500`). Bạn có thể xác định một trong các lỗi này có được trả về hay không bằng các phương thức `successful`, `clientError` hoặc `serverError`:

```php
// Determine if the status code is >= 200 and < 300...
$response->successful();

// Determine if the status code is >= 400...
$response->failed();

// Determine if the response has a 400 level status code...
$response->clientError();

// Determine if the response has a 500 level status code...
$response->serverError();

// Immediately execute the given callback if there was a client or server error...
$response->onError(callable $callback);
```

<a name="throwing-exceptions"></a>
#### Throw exception

Nếu có một response instance và muốn throw `Illuminate\Http\Client\RequestException` khi status code cho biết có lỗi phía client hoặc server, bạn có thể sử dụng phương thức `throw` hoặc `throwIf`:

```php
use Illuminate\Http\Client\Response;

$response = Http::post(/* ... */);

// Throw an exception if a client or server error occurred...
$response->throw();

// Throw an exception if an error occurred and the given condition is true...
$response->throwIf($condition);

// Throw an exception if an error occurred and the given closure resolves to true...
$response->throwIf(fn (Response $response) => true);

// Throw an exception if an error occurred and the given condition is false...
$response->throwUnless($condition);

// Throw an exception if an error occurred and the given closure resolves to false...
$response->throwUnless(fn (Response $response) => false);

// Throw an exception if the response has a specific status code...
$response->throwIfStatus(403);

// Throw an exception unless the response has a specific status code...
$response->throwUnlessStatus(200);

// Throw an exception if a server error occurred (status >500)...
$response->throwIfServerError();

// Throw an exception if a client error occurred (status >400 and <500)...
$response->throwIfClientError();

return $response['user']['id'];
```

Instance `Illuminate\Http\Client\RequestException` có thuộc tính public `$response`, cho phép bạn kiểm tra response được trả về.

Phương thức `throw` trả về instance response nếu không xảy ra lỗi, nhờ đó bạn có thể tiếp tục chain các thao tác khác sau `throw`:

```php
return Http::post(/* ... */)->throw()->json();
```

Nếu muốn thực hiện logic bổ sung trước khi exception được throw, bạn có thể truyền một closure cho method `throw`. Exception sẽ tự động được throw sau khi closure được gọi, vì vậy bạn không cần tự re-throw exception bên trong closure:

```php
use Illuminate\Http\Client\Response;
use Illuminate\Http\Client\RequestException;

return Http::post(/* ... */)->throw(function (Response $response, RequestException $e) {
    // ...
})->json();
```

Mặc định, message của `RequestException` bị truncate còn 120 ký tự khi được log hoặc report. Để tùy biến hoặc tắt hành vi này, bạn có thể dùng method `truncateAt` và `dontTruncate` khi cấu hình behavior đã đăng ký của ứng dụng trong file `bootstrap/app.php`:

```php
use Illuminate\Http\Client\RequestException;

->registered(function (): void {
    // Truncate request exception messages to 240 characters...
    RequestException::truncateAt(240);

    // Disable request exception message truncation...
    RequestException::dontTruncate();
})
```

Ngoài ra, bạn có thể tùy biến behavior truncate exception theo từng request bằng method `truncateExceptionsAt`:

```php
return Http::truncateExceptionsAt(240)->post(/* ... */);
```

<a name="guzzle-middleware"></a>
### Middleware của Guzzle

Vì HTTP client của Laravel được xây trên Guzzle, bạn có thể tận dụng [Guzzle Middleware](https://docs.guzzlephp.org/en/stable/handlers-and-middleware.html) để thay đổi outgoing request hoặc inspect incoming response. Để thay đổi outgoing request, hãy đăng ký Guzzle middleware bằng method `withRequestMiddleware`:

```php
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\RequestInterface;

$response = Http::withRequestMiddleware(
    function (RequestInterface $request) {
        return $request->withHeader('X-Example', 'Value');
    }
)->get('http://example.com');
```

Tương tự, bạn có thể inspect incoming HTTP response bằng cách đăng ký middleware qua method `withResponseMiddleware`:

```php
use Illuminate\Support\Facades\Http;
use Psr\Http\Message\ResponseInterface;

$response = Http::withResponseMiddleware(
    function (ResponseInterface $response) {
        $header = $response->getHeader('X-Example');

        // ...

        return $response;
    }
)->get('http://example.com');
```

<a name="global-middleware"></a>
#### Middleware toàn cục

Đôi khi bạn muốn đăng ký middleware áp dụng cho mọi request gửi đi và response nhận về. Khi đó, có thể dùng `globalRequestMiddleware` và `globalResponseMiddleware`. Thông thường, các phương thức này nên được gọi trong `boot` của `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Http;

Http::globalRequestMiddleware(fn ($request) => $request->withHeader(
    'User-Agent', 'Example Application/1.0'
));

Http::globalResponseMiddleware(fn ($response) => $response->withHeader(
    'X-Finished-At', now()->toDateTimeString()
));
```

<a name="guzzle-options"></a>
### Tùy chọn Guzzle

Bạn có thể chỉ định thêm [Guzzle request option](http://docs.guzzlephp.org/en/stable/request-options.html) cho outgoing request bằng method `withOptions`. Method `withOptions` nhận một mảng key / value:

```php
$response = Http::withOptions([
    'debug' => true,
])->get('http://example.com/users');
```

<a name="global-options"></a>
#### Tùy chọn toàn cục

Để cấu hình tùy chọn mặc định cho mọi request gửi đi, bạn có thể dùng `globalOptions`. Thông thường, phương thức này nên được gọi từ `boot` của `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Http;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Http::globalOptions([
        'allow_redirects' => false,
    ]);
}
```

<a name="concurrent-requests"></a>
## Request đồng thời

Đôi khi bạn cần thực hiện nhiều HTTP request đồng thời, tức là gửi nhiều request cùng lúc thay vì tuần tự. Cách này có thể cải thiện đáng kể hiệu năng khi làm việc với các HTTP API phản hồi chậm.

<a name="request-pooling"></a>
### Gom request vào pool

Bạn có thể thực hiện việc này bằng phương thức `pool`. Phương thức `pool` nhận một closure với instance `Illuminate\Http\Client\Pool`, cho phép dễ dàng thêm các request vào pool để gửi đi:

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$responses = Http::pool(fn (Pool $pool) => [
    $pool->get('http://localhost/first'),
    $pool->get('http://localhost/second'),
    $pool->get('http://localhost/third'),
]);

return $responses[0]->ok() &&
       $responses[1]->ok() &&
       $responses[2]->ok();
```

Như bạn thấy, mỗi response instance có thể được truy cập dựa trên thứ tự request được thêm vào pool. Nếu muốn, bạn có thể đặt tên request bằng method `as`, từ đó truy cập response tương ứng theo tên:

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$responses = Http::pool(fn (Pool $pool) => [
    $pool->as('first')->get('http://localhost/first'),
    $pool->as('second')->get('http://localhost/second'),
    $pool->as('third')->get('http://localhost/third'),
]);

return $responses['first']->ok();
```

Maximum concurrency của request pool có thể được kiểm soát bằng argument `concurrency` của method `pool`. Giá trị này xác định số HTTP request tối đa có thể đồng thời in-flight trong lúc xử lý request pool:

```php
$responses = Http::pool(fn (Pool $pool) => [
    // ...
], concurrency: 5);
```

Nếu một pooled request thất bại ở connection level, chẳng hạn timeout hoặc DNS failure, entry tương ứng trong mảng `$responses` sẽ là instance `Illuminate\Http\Client\ConnectionException` thay vì instance `Response`:

```php
foreach ($responses as $response) {
    if ($response instanceof Throwable) {
        // The request failed to connect...
    } elseif ($response->failed()) {
        // The request connected but received an error response...
    }
}
```

<a name="customizing-concurrent-requests"></a>
#### Tùy chỉnh request đồng thời

Method `pool` không thể chain với các HTTP client method khác như `withHeaders` hoặc `middleware`. Nếu muốn áp dụng custom header hay middleware cho pooled request, bạn nên cấu hình các option đó trên từng request trong pool:

```php
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;

$headers = [
    'X-Example' => 'example',
];

$responses = Http::pool(fn (Pool $pool) => [
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
    $pool->withHeaders($headers)->get('http://laravel.test/test'),
]);
```

<a name="request-batching"></a>
### Gom request thành batch

Một cách khác để xử lý concurrent request trong Laravel là dùng method `batch`. Tương tự `pool`, method này nhận một closure nhận instance `Illuminate\Http\Client\Batch`, cho phép bạn dễ dàng thêm request vào request pool để dispatch, đồng thời còn cho phép định nghĩa completion callback:

```php
use Illuminate\Http\Client\Batch;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

$responses = Http::batch(fn (Batch $batch) => [
    $batch->get('http://localhost/first'),
    $batch->get('http://localhost/second'),
    $batch->get('http://localhost/third'),
])->before(function (Batch $batch) {
    // The batch has been created but no requests have been initialized...
})->progress(function (Batch $batch, int|string $key, Response $response) {
    // An individual request has completed successfully...
})->then(function (Batch $batch, array $results) {
    // All requests completed successfully...
})->catch(function (Batch $batch, int|string $key, Response|RequestException|ConnectionException $response) {
    // Batch request failure detected...
})->finally(function (Batch $batch, array $results) {
    // The batch has finished executing...
})->send();
```

Tương tự method `pool`, bạn có thể dùng method `as` để đặt tên request:

```php
$responses = Http::batch(fn (Batch $batch) => [
    $batch->as('first')->get('http://localhost/first'),
    $batch->as('second')->get('http://localhost/second'),
    $batch->as('third')->get('http://localhost/third'),
])->send();
```

Sau khi `batch` được start bằng cách gọi method `send`, bạn không thể thêm request mới. Nếu cố làm vậy, Laravel sẽ throw exception `Illuminate\Http\Client\BatchInProgressException`.

Maximum concurrency của request batch có thể được kiểm soát bằng method `concurrency`. Giá trị này xác định số HTTP request tối đa có thể đồng thời in-flight trong lúc xử lý batch:

```php
$responses = Http::batch(fn (Batch $batch) => [
    // ...
])->concurrency(5)->send();
```

<a name="inspecting-batches"></a>
#### Kiểm tra batch

Instance `Illuminate\Http\Client\Batch` được truyền cho các batch completion callback có nhiều property và method giúp bạn tương tác với và inspect một request batch cụ thể:

```php
// The number of requests assigned to the batch...
$batch->totalRequests;
 
// The number of requests that have not been processed yet...
$batch->pendingRequests;
 
// The number of requests that have failed...
$batch->failedRequests;

// The number of requests that have been processed thus far...
$batch->processedRequests();

// Indicates if the batch has finished executing...
$batch->finished();

// Indicates if the batch has request failures...
$batch->hasFailures();
```
<a name="deferring-batches"></a>
#### Trì hoãn batch

Khi method `defer` được gọi, batch request không được thực thi ngay. Thay vào đó, Laravel sẽ thực thi batch sau khi HTTP response của application request hiện tại đã được gửi về người dùng, giúp ứng dụng luôn phản hồi nhanh và mượt:

```php
use Illuminate\Http\Client\Batch;
use Illuminate\Support\Facades\Http;

$responses = Http::batch(fn (Batch $batch) => [
    $batch->get('http://localhost/first'),
    $batch->get('http://localhost/second'),
    $batch->get('http://localhost/third'),
])->then(function (Batch $batch, array $results) {
    // All requests completed successfully...
})->defer();
```

<a name="macros"></a>
## Macro

HTTP client của Laravel cho phép bạn định nghĩa "macro", đóng vai trò là cơ chế fluent và dễ diễn đạt để cấu hình các request path và header dùng chung khi tương tác với service trong toàn ứng dụng. Để bắt đầu, bạn có thể định nghĩa macro trong method `boot` của class `App\Providers\AppServiceProvider`:

```php
use Illuminate\Support\Facades\Http;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Http::macro('github', function () {
        return Http::withHeaders([
            'X-Example' => 'example',
        ])->baseUrl('https://github.com');
    });
}
```

Sau khi macro đã được cấu hình, bạn có thể gọi nó ở bất kỳ đâu trong ứng dụng để tạo pending request với cấu hình đã chỉ định:

```php
$response = Http::github()->get('/');
```

<a name="testing"></a>
## Kiểm thử

Nhiều service của Laravel cung cấp các tiện ích giúp viết test dễ dàng và rõ ràng; HTTP client cũng vậy. Phương thức `fake` của facade `Http` cho phép HTTP client trả về response giả lập khi request được thực hiện.

<a name="faking-responses"></a>
### Giả lập response

Ví dụ, để yêu cầu HTTP client trả về response rỗng với status code `200` cho mọi request, bạn có thể gọi method `fake` không truyền argument:

```php
use Illuminate\Support\Facades\Http;

Http::fake();

$response = Http::post(/* ... */);
```

<a name="faking-specific-urls"></a>
#### Giả lập URL cụ thể

Ngoài ra, bạn có thể truyền một array cho method `fake`. Key của array nên là URL pattern cần fake và value là response tương ứng. Ký tự `*` có thể dùng làm wildcard. Bạn có thể dùng method `response` của facade `Http` để tạo stub / fake response cho các endpoint này:

```php
Http::fake([
    // Stub a JSON response for GitHub endpoints...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, $headers),

    // Stub a string response for Google endpoints...
    'google.com/*' => Http::response('Hello World', 200, $headers),
]);
```

Mọi request tới URL chưa được fake sẽ thực sự được thực thi. Nếu muốn chỉ định fallback URL pattern để stub mọi URL không khớp, bạn có thể dùng một ký tự `*` duy nhất:

```php
Http::fake([
    // Stub a JSON response for GitHub endpoints...
    'github.com/*' => Http::response(['foo' => 'bar'], 200, ['Headers']),

    // Stub a string response for all other endpoints...
    '*' => Http::response('Hello World', 200, ['Headers']),
]);
```

Để thuận tiện, bạn có thể tạo response string, JSON hoặc empty đơn giản bằng cách truyền string, array hoặc integer làm response:

```php
Http::fake([
    'google.com/*' => 'Hello World',
    'github.com/*' => ['foo' => 'bar'],
    'chatgpt.com/*' => 200,
]);
```

<a name="faking-connection-exceptions"></a>
#### Giả lập exception

Đôi khi bạn cần test behavior của ứng dụng khi HTTP client gặp `Illuminate\Http\Client\ConnectionException` trong lúc thực hiện request. Bạn có thể yêu cầu HTTP client throw connection exception bằng method `failedConnection`:

```php
Http::fake([
    'github.com/*' => Http::failedConnection(),
]);
```

Để test behavior của ứng dụng khi `Illuminate\Http\Client\RequestException` bị throw, bạn có thể dùng method `failedRequest`:

```php
$this->mock(GithubService::class);
    ->shouldReceive('getUser')
    ->andThrow(
        Http::failedRequest(['code' => 'not_found'], 404)
    );
```

<a name="faking-response-sequences"></a>
#### Giả lập chuỗi response

Đôi khi bạn cần quy định một URL duy nhất trả về một chuỗi fake response theo thứ tự cụ thể. Bạn có thể dùng method `Http::sequence` để xây dựng các response:

```php
Http::fake([
    // Stub a series of responses for GitHub endpoints...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->pushStatus(404),
]);
```

Khi toàn bộ response trong response sequence đã được consume, các request tiếp theo sẽ khiến sequence throw exception. Nếu muốn chỉ định default response được trả về khi sequence rỗng, bạn có thể dùng method `whenEmpty`:

```php
Http::fake([
    // Stub a series of responses for GitHub endpoints...
    'github.com/*' => Http::sequence()
        ->push('Hello World', 200)
        ->push(['foo' => 'bar'], 200)
        ->whenEmpty(Http::response()),
]);
```

Nếu muốn fake một sequence response nhưng không cần chỉ định URL pattern cụ thể, bạn có thể dùng method `Http::fakeSequence`:

```php
Http::fakeSequence()
    ->push('Hello World', 200)
    ->whenEmpty(Http::response());
```

<a name="fake-callback"></a>
#### Callback giả lập

Nếu cần logic phức tạp hơn để quyết định response nào được trả về cho từng endpoint, bạn có thể truyền closure cho method `fake`. Closure này nhận instance `Illuminate\Http\Client\Request` và phải trả về response instance. Bên trong closure, bạn có thể thực hiện logic cần thiết để xác định loại response cần trả về:

```php
use Illuminate\Http\Client\Request;

Http::fake(function (Request $request) {
    return Http::response('Hello World', 200);
});
```

<a name="inspecting-requests"></a>
### Kiểm tra request

Khi fake response, đôi khi bạn muốn inspect các request mà client nhận được để bảo đảm ứng dụng gửi đúng data hoặc header. Bạn có thể làm điều này bằng cách gọi method `Http::assertSent` sau `Http::fake`.

Method `assertSent` nhận một closure, closure này nhận instance `Illuminate\Http\Client\Request` và phải trả về boolean cho biết request có khớp expectation hay không. Để test pass, phải có ít nhất một request đã được gửi và khớp expectation đã cho:

```php
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

Http::fake();

Http::withHeaders([
    'X-First' => 'foo',
])->post('http://example.com/users', [
    'name' => 'Taylor',
    'role' => 'Developer',
]);

Http::assertSent(function (Request $request) {
    return $request->hasHeader('X-First', 'foo') &&
           $request->url() == 'http://example.com/users' &&
           $request['name'] == 'Taylor' &&
           $request['role'] == 'Developer';
});
```

Khi cần, bạn có thể assert một request cụ thể đã không được gửi bằng method `assertNotSent`:

```php
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

Http::fake();

Http::post('http://example.com/users', [
    'name' => 'Taylor',
    'role' => 'Developer',
]);

Http::assertNotSent(function (Request $request) {
    return $request->url() === 'http://example.com/posts';
});
```

Bạn có thể dùng method `assertSentCount` để assert số lượng request đã được "sent" trong test:

```php
Http::fake();

Http::assertSentCount(5);
```

Hoặc, bạn có thể dùng method `assertNothingSent` để assert không có request nào được gửi trong test:

```php
Http::fake();

Http::assertNothingSent();
```

<a name="recording-requests-and-responses"></a>
#### Ghi lại request / response

Bạn có thể dùng method `recorded` để thu thập toàn bộ request và response tương ứng. Method `recorded` trả về collection các array chứa instance `Illuminate\Http\Client\Request` và `Illuminate\Http\Client\Response`:

```php
Http::fake([
    'https://laravel.com' => Http::response(status: 500),
    'https://nova.laravel.com/' => Http::response(),
]);

Http::get('https://laravel.com');
Http::get('https://nova.laravel.com/');

$recorded = Http::recorded();

[$request, $response] = $recorded[0];
```

Ngoài ra, method `recorded` nhận một closure, closure này nhận instance `Illuminate\Http\Client\Request` và `Illuminate\Http\Client\Response`, và có thể được dùng để filter các cặp request / response theo expectation của bạn:

```php
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\Response;

Http::fake([
    'https://laravel.com' => Http::response(status: 500),
    'https://nova.laravel.com/' => Http::response(),
]);

Http::get('https://laravel.com');
Http::get('https://nova.laravel.com/');

$recorded = Http::recorded(function (Request $request, Response $response) {
    return $request->url() !== 'https://laravel.com' &&
           $response->successful();
});
```

<a name="preventing-stray-requests"></a>
### Ngăn request ngoài dự kiến

Nếu muốn bảo đảm toàn bộ request gửi qua HTTP client đều được fake trong từng test hoặc toàn bộ test suite, bạn có thể gọi method `preventStrayRequests`. Sau khi gọi method này, mọi request không có fake response tương ứng sẽ throw exception thay vì thực hiện HTTP request thật:

```php
use Illuminate\Support\Facades\Http;

Http::preventStrayRequests();

Http::fake([
    'github.com/*' => Http::response('ok'),
]);

// An "ok" response is returned...
Http::get('https://github.com/laravel/framework');

// An exception is thrown...
Http::get('https://laravel.com');
```

Đôi khi, bạn muốn chặn hầu hết stray request nhưng vẫn cho phép một số request cụ thể được thực thi. Bạn có thể truyền mảng URL pattern cho method `allowStrayRequests`. Request khớp một trong các pattern sẽ được phép thực thi, còn các request khác vẫn tiếp tục throw exception:

```php
use Illuminate\Support\Facades\Http;

Http::preventStrayRequests();

Http::allowStrayRequests([
    'http://127.0.0.1:5000/*',
]);

// This request is executed...
Http::get('http://127.0.0.1:5000/generate');

// An exception is thrown...
Http::get('https://laravel.com');
```

<a name="events"></a>
## Event

Laravel phát ba event trong quá trình gửi HTTP request. Event `RequestSending` được phát trước khi gửi request, `ResponseReceived` được phát sau khi nhận response của request, và `ConnectionFailed` được phát nếu không nhận được response cho request.

Event `RequestSending` và `ConnectionFailed` đều chứa public property `$request` để bạn inspect instance `Illuminate\Http\Client\Request`. Tương tự, event `ResponseReceived` chứa property `$request` cùng property `$response` để inspect instance `Illuminate\Http\Client\Response`. Bạn có thể tạo [event listener](/docs/{{version}}/events) cho các event này trong ứng dụng:

```php
use Illuminate\Http\Client\Events\RequestSending;

class LogRequest
{
    /**
     * Handle the event.
     */
    public function handle(RequestSending $event): void
    {
        // $event->request ...
    }
}
```
