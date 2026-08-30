# HTTP Responses (Phản hồi HTTP)

<a name="creating-responses"></a>
## Tạo response

<a name="strings-arrays"></a>
#### Chuỗi và mảng

Mọi route và controller đều nên trả về một response để gửi lại cho trình duyệt của người dùng. Laravel cung cấp nhiều cách khác nhau để trả về response. Cách cơ bản nhất là trả về một chuỗi từ route hoặc controller; framework sẽ tự động chuyển chuỗi đó thành một HTTP response hoàn chỉnh:

```php
Route::get('/', function () {
    return 'Hello World';
});
```

Ngoài việc trả về chuỗi từ route và controller, bạn cũng có thể trả về mảng. Framework sẽ tự động chuyển mảng thành JSON response:

```php
Route::get('/', function () {
    return [1, 2, 3];
});
```

> [!NOTE]
> Bạn cũng có thể trả về [Eloquent collection](/docs/{{version}}/eloquent-collections) trực tiếp từ route hoặc controller. Laravel sẽ tự động chuyển chúng thành JSON.

<a name="response-objects"></a>
#### Đối tượng Response

Thông thường, action của route không chỉ trả về chuỗi hoặc mảng đơn giản. Thay vào đó, bạn sẽ trả về một đối tượng `Illuminate\Http\Response` hoàn chỉnh hoặc một [view](/docs/{{version}}/views).

Việc trả về một đối tượng `Response` hoàn chỉnh cho phép bạn tùy chỉnh HTTP status code và header của response. `Response` kế thừa lớp `Symfony\Component\HttpFoundation\Response`, lớp này cung cấp nhiều phương thức để xây dựng HTTP response:

```php
Route::get('/home', function () {
    return response('Hello World', 200)
        ->header('Content-Type', 'text/plain');
});
```

<a name="eloquent-models-and-collections"></a>
#### Model và collection Eloquent

Bạn cũng có thể trả về trực tiếp model và collection của [Eloquent ORM](/docs/{{version}}/eloquent) từ route và controller. Khi đó, Laravel tự động chuyển model và collection thành JSON response, đồng thời vẫn tôn trọng các [thuộc tính bị ẩn](/docs/{{version}}/eloquent-serialization#hiding-attributes-from-json) của model:

```php
use App\Models\User;

Route::get('/user/{user}', function (User $user) {
    return $user;
});
```

<a name="attaching-headers-to-responses"></a>
### Gắn header vào response

Hầu hết các phương thức của response đều có thể gọi nối tiếp, nhờ đó bạn có thể xây dựng response theo fluent API. Ví dụ, phương thức `header` cho phép thêm nhiều header vào response trước khi gửi về cho người dùng:

```php
return response($content)
    ->header('Content-Type', $type)
    ->header('X-Header-One', 'Header Value')
    ->header('X-Header-Two', 'Header Value');
```

Hoặc, bạn có thể dùng `withHeaders` để truyền vào một mảng các header cần thêm vào response:

```php
return response($content)
    ->withHeaders([
        'Content-Type' => $type,
        'X-Header-One' => 'Header Value',
        'X-Header-Two' => 'Header Value',
    ]);
```

Bạn có thể loại bỏ một hoặc nhiều header cụ thể khỏi response sắp gửi bằng phương thức `withoutHeader`:

```php
return response($content)->withoutHeader('X-Debug');

return response($content)->withoutHeader(['X-Debug', 'X-Powered-By']);
```

<a name="cache-control-middleware"></a>
#### Middleware Cache Control

Laravel cung cấp middleware `cache.headers`, cho phép thiết lập nhanh header `Cache-Control` cho một nhóm route. Các directive phải được viết dưới dạng "snake case" tương ứng với cache-control directive và phân tách bằng dấu chấm phẩy. Nếu danh sách directive có `etag`, Laravel sẽ tự động lấy MD5 hash của nội dung response làm định danh ETag:

```php
Route::middleware('cache.headers:public;max_age=30;s_maxage=300;stale_while_revalidate=600;etag')->group(function () {
    Route::get('/privacy', function () {
        // ...
    });

    Route::get('/terms', function () {
        // ...
    });
});
```

<a name="attaching-cookies-to-responses"></a>
### Gắn cookie vào response

Bạn có thể gắn cookie vào đối tượng `Illuminate\Http\Response` sắp gửi bằng phương thức `cookie`. Hãy truyền tên, giá trị và số phút cookie được xem là còn hiệu lực vào phương thức này:

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes
);
```

Phương thức `cookie` còn nhận một số đối số ít được sử dụng hơn. Nhìn chung, mục đích và ý nghĩa của chúng tương ứng với các đối số của hàm [setcookie](https://secure.php.net/manual/en/function.setcookie.php) nguyên bản trong PHP:

```php
return response('Hello World')->cookie(
    'name', 'value', $minutes, $path, $domain, $secure, $httpOnly
);
```

Nếu cần bảo đảm cookie được gửi cùng response nhưng chưa có đối tượng response tại thời điểm đó, bạn có thể dùng facade `Cookie` để đưa cookie vào "queue" và gắn nó khi response được gửi. Phương thức `queue` nhận các đối số cần thiết để tạo cookie. Các cookie này sẽ được gắn vào response trước khi response được gửi tới trình duyệt:

```php
use Illuminate\Support\Facades\Cookie;

Cookie::queue('name', 'value', $minutes);
```

<a name="generating-cookie-instances"></a>
#### Tạo đối tượng cookie

Nếu muốn tạo một đối tượng `Symfony\Component\HttpFoundation\Cookie` để gắn vào response ở thời điểm sau, bạn có thể dùng helper toàn cục `cookie`. Cookie này sẽ không được gửi về client cho đến khi nó được gắn vào một response:

```php
$cookie = cookie('name', 'value', $minutes);

return response('Hello World')->cookie($cookie);
```

<a name="expiring-cookies-early"></a>
#### Cho cookie hết hạn sớm

Bạn có thể xóa cookie bằng cách làm cho nó hết hạn thông qua `withoutCookie` hoặc `withoutCookies` trên response sắp gửi:

```php
return response('Hello World')->withoutCookie('name');

return response('Hello World')->withoutCookies([
    'name',
    'email',
    'preferences',
]);
```

Nếu chưa có đối tượng response sắp gửi, bạn có thể dùng phương thức `expire` của facade `Cookie` để làm cookie hết hạn:

```php
Cookie::expire('name');
```

<a name="cookies-and-encryption"></a>
### Cookie và mã hóa

Mặc định, nhờ middleware `Illuminate\Cookie\Middleware\EncryptCookies`, mọi cookie do Laravel tạo đều được mã hóa và ký để client không thể đọc hoặc sửa đổi nội dung. Nếu muốn tắt mã hóa cho một số cookie cụ thể của ứng dụng, bạn có thể dùng phương thức `encryptCookies` trong file `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->encryptCookies(except: [
        'cookie_name',
    ]);
})
```

> [!NOTE]
> Nhìn chung, bạn không nên tắt mã hóa cookie vì điều đó có thể khiến dữ liệu cookie bị lộ hoặc bị chỉnh sửa từ phía client.

<a name="redirects"></a>
## Chuyển hướng

Redirect response là các đối tượng của lớp `Illuminate\Http\RedirectResponse` và chứa những header cần thiết để chuyển hướng người dùng sang URL khác. Laravel cung cấp nhiều cách tạo `RedirectResponse`; đơn giản nhất là dùng helper toàn cục `redirect`:

```php
Route::get('/dashboard', function () {
    return redirect('/home/dashboard');
});
```

Đôi khi bạn cần chuyển người dùng về vị trí trước đó, chẳng hạn khi form được gửi lên không hợp lệ. Bạn có thể dùng helper toàn cục `back`. Vì cơ chế này sử dụng [session](/docs/{{version}}/session), hãy bảo đảm route gọi `back` sử dụng middleware group `web`:

```php
Route::post('/user/profile', function () {
    // Validate the request...

    return back()->withInput();
});
```

<a name="redirecting-named-routes"></a>
### Chuyển hướng đến route có tên

Khi gọi helper `redirect` mà không truyền tham số, Laravel trả về một đối tượng `Illuminate\Routing\Redirector`, cho phép bạn gọi các phương thức của `Redirector`. Ví dụ, để tạo `RedirectResponse` tới một route có tên, hãy dùng phương thức `route`:

```php
return redirect()->route('login');
```

Nếu route có tham số, bạn có thể truyền chúng làm đối số thứ hai của phương thức `route`:

```php
// For a route with the following URI: /profile/{id}

return redirect()->route('profile', ['id' => 1]);
```

<a name="populating-parameters-via-eloquent-models"></a>
#### Điền tham số bằng Eloquent Model

Nếu chuyển hướng tới một route có tham số "ID" được lấy từ Eloquent model, bạn có thể truyền trực tiếp model. Laravel sẽ tự động lấy ID:

```php
// For a route with the following URI: /profile/{id}

return redirect()->route('profile', [$user]);
```

Nếu muốn tùy chỉnh giá trị được đưa vào route parameter, bạn có thể chỉ định column ngay trong định nghĩa tham số (`/profile/{id:slug}`), hoặc override phương thức `getRouteKey` trên Eloquent model:

```php
/**
 * Get the value of the model's route key.
 */
public function getRouteKey(): mixed
{
    return $this->slug;
}
```

<a name="redirecting-controller-actions"></a>
### Chuyển hướng đến action của controller

Bạn cũng có thể tạo redirect tới [action của controller](/docs/{{version}}/controllers). Hãy truyền controller và tên action vào phương thức `action`:

```php
use App\Http\Controllers\UserController;

return redirect()->action([UserController::class, 'index']);
```

Nếu route của controller yêu cầu tham số, bạn có thể truyền chúng làm đối số thứ hai của `action`:

```php
return redirect()->action(
    [UserController::class, 'profile'], ['id' => 1]
);
```

<a name="redirecting-external-domains"></a>
### Chuyển hướng đến domain bên ngoài

Đôi khi bạn cần chuyển hướng tới một domain bên ngoài ứng dụng. Có thể dùng phương thức `away`; phương thức này tạo `RedirectResponse` mà không thực hiện thêm URL encoding, validation hoặc verification:

```php
return redirect()->away('https://www.google.com');
```

<a name="redirecting-with-flashed-session-data"></a>
### Chuyển hướng kèm dữ liệu flash trong session

Chuyển hướng tới URL mới và [flash dữ liệu vào session](/docs/{{version}}/session#flash-data) thường được thực hiện cùng lúc. Trường hợp phổ biến là sau khi một thao tác thành công, ứng dụng flash thông báo thành công vào session. Laravel cho phép tạo `RedirectResponse` và flash dữ liệu trong cùng một chuỗi fluent call:

```php
Route::post('/user/profile', function () {
    // ...

    return redirect('/dashboard')->with('status', 'Profile updated!');
});
```

Sau khi người dùng được chuyển hướng, bạn có thể hiển thị thông báo đã flash từ [session](/docs/{{version}}/session). Ví dụ với [cú pháp Blade](/docs/{{version}}/blade):

```blade
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```

<a name="redirecting-with-input"></a>
#### Chuyển hướng kèm input

Bạn có thể dùng `withInput` của `RedirectResponse` để flash dữ liệu input của request hiện tại vào session trước khi chuyển hướng. Cách này thường được dùng khi validation thất bại. Sau khi input được flash vào session, request kế tiếp có thể dễ dàng [lấy lại dữ liệu đó](/docs/{{version}}/requests#retrieving-old-input) để điền lại form:

```php
return back()->withInput();
```

<a name="other-response-types"></a>
## Các loại response khác

Helper `response` có thể tạo nhiều loại response khác. Khi gọi `response` không có đối số, Laravel trả về một implementation của [contract](/docs/{{version}}/contracts) `Illuminate\Contracts\Routing\ResponseFactory`. Contract này cung cấp nhiều phương thức hữu ích để tạo response.

<a name="view-responses"></a>
### View response

Nếu cần kiểm soát status code và header của response, đồng thời muốn dùng một [view](/docs/{{version}}/views) làm nội dung response, hãy sử dụng phương thức `view`:

```php
return response()
    ->view('hello', $data, 200)
    ->header('Content-Type', $type);
```

Nếu không cần HTTP status code hoặc header tùy chỉnh, bạn có thể dùng trực tiếp helper toàn cục `view`.

<a name="json-responses"></a>
### JSON response

Phương thức `json` tự động đặt header `Content-Type` thành `application/json`, đồng thời chuyển mảng được cung cấp thành JSON bằng hàm PHP `json_encode`:

```php
return response()->json([
    'name' => 'Abigail',
    'state' => 'CA',
]);
```

Nếu muốn tạo JSONP response, bạn có thể kết hợp phương thức `json` với `withCallback`:

```php
return response()
    ->json(['name' => 'Abigail', 'state' => 'CA'])
    ->withCallback($request->input('callback'));
```

<a name="file-downloads"></a>
### Tải file

Phương thức `download` tạo response buộc trình duyệt tải file tại đường dẫn được chỉ định. Đối số thứ hai là tên file mà người dùng sẽ thấy khi tải xuống; đối số thứ ba, nếu có, là một mảng HTTP header:

```php
return response()->download($pathToFile);

return response()->download($pathToFile, $name, $headers);
```

> [!WARNING]
> Symfony HttpFoundation, thành phần xử lý việc tải file, yêu cầu tên file tải xuống phải sử dụng ký tự ASCII.

<a name="file-responses"></a>
### File response

Phương thức `file` cho phép hiển thị trực tiếp một file, chẳng hạn ảnh hoặc PDF, trong trình duyệt thay vì bắt đầu tải xuống. Đối số thứ nhất là đường dẫn tuyệt đối tới file, đối số thứ hai là một mảng header:

```php
return response()->file($pathToFile);

return response()->file($pathToFile, $headers);
```

<a name="streamed-responses"></a>
## Streamed response

Bằng cách stream dữ liệu tới client ngay khi dữ liệu được tạo ra, bạn có thể giảm đáng kể mức sử dụng bộ nhớ và cải thiện hiệu năng, đặc biệt với response rất lớn. Streamed response cho phép client bắt đầu xử lý dữ liệu trước khi server gửi xong toàn bộ response:

```php
Route::get('/stream', function () {
    return response()->stream(function (): void {
        foreach (['developer', 'admin'] as $string) {
            echo $string;
            ob_flush();
            flush();
            sleep(2); // Simulate delay between chunks...
        }
    }, 200, ['X-Accel-Buffering' => 'no']);
});
```

Nếu closure truyền vào `stream` trả về một [Generator](https://www.php.net/manual/en/language.generators.overview.php), Laravel sẽ tự động flush output buffer giữa các chuỗi do generator trả về, đồng thời tắt output buffering của Nginx:

```php
Route::post('/chat', function () {
    return response()->stream(function (): Generator {
        $stream = OpenAI::client()->chat()->createStreamed(...);

        foreach ($stream as $response) {
            yield $response->choices[0];
        }
    });
});
```

<a name="consuming-streamed-responses"></a>
### Tiêu thụ streamed response

Streamed response có thể được tiêu thụ bằng package npm `stream` của Laravel, cung cấp API thuận tiện để tương tác với response stream và event stream của Laravel. Trước tiên, hãy cài `@laravel/stream-react`, `@laravel/stream-vue` hoặc `@laravel/stream-svelte`:

```shell tab=React
npm install @laravel/stream-react
```

```shell tab=Vue
npm install @laravel/stream-vue
```

```shell tab=Svelte
npm install @laravel/stream-svelte
```

Sau đó, bạn có thể dùng `useStream` để tiêu thụ stream. Khi cung cấp URL của stream, hook sẽ tự động cập nhật `data` bằng nội dung response được nối dần khi ứng dụng Laravel trả dữ liệu về:

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, isFetching, isStreaming, send } = useStream("chat");

    const sendMessage = () => {
        send({
            message: `Current timestamp: ${Date.now()}`,
        });
    };

    return (
        <div>
            <div>{data}</div>
            {isFetching && <div>Connecting...</div>}
            {isStreaming && <div>Generating...</div>}
            <button onClick={sendMessage}>Send Message</button>
        </div>
    );
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data, isFetching, isStreaming, send } = useStream("chat");

const sendMessage = () => {
    send({
        message: `Current timestamp: ${Date.now()}`,
    });
};
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <div v-if="isFetching">Connecting...</div>
        <div v-if="isStreaming">Generating...</div>
        <button @click="sendMessage">Send Message</button>
    </div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat");

const sendMessage = () => {
    stream.send({
        message: `Current timestamp: ${Date.now()}`,
    });
};
</script>

<div>
    <div>{$stream.data}</div>
    {#if $stream.isFetching}
        <div>Connecting...</div>
    {/if}
    {#if $stream.isStreaming}
        <div>Generating...</div>
    {/if}
    <button onclick={sendMessage}>Send Message</button>
</div>
```

Khi gửi dữ liệu trở lại stream qua `send`, kết nối stream đang hoạt động sẽ bị hủy trước khi dữ liệu mới được gửi. Tất cả request đều được gửi dưới dạng JSON `POST`.

> [!WARNING]
> Vì hook `useStream` gửi `POST` request tới ứng dụng, request cần CSRF token hợp lệ. Cách đơn giản nhất là [khai báo token qua meta tag trong phần head của layout ứng dụng](/docs/{{version}}/csrf#csrf-x-csrf-token).

Đối số thứ hai của `useStream` là một object tùy chọn để điều chỉnh hành vi tiêu thụ stream. Các giá trị mặc định của object này như sau:

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data } = useStream("chat", {
        id: undefined,
        initialInput: undefined,
        headers: undefined,
        csrfToken: undefined,
        onResponse: (response: Response) => void,
        onData: (data: string) => void,
        onCancel: () => void,
        onFinish: () => void,
        onError: (error: Error) => void,
    });

    return <div>{data}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data } = useStream("chat", {
    id: undefined,
    initialInput: undefined,
    headers: undefined,
    csrfToken: undefined,
    onResponse: (response: Response) => void,
    onData: (data: string) => void,
    onCancel: () => void,
    onFinish: () => void,
    onError: (error: Error) => void,
});
</script>

<template>
    <div>{{ data }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat", {
    id: undefined,
    initialInput: undefined,
    headers: undefined,
    csrfToken: undefined,
    onResponse: (response) => {},
    onData: (data) => {},
    onCancel: () => {},
    onFinish: () => {},
    onError: (error) => {},
});
</script>

<div>{$stream.data}</div>
```

`onResponse` được kích hoạt sau khi nhận thành công response ban đầu từ stream và callback nhận [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) nguyên bản. `onData` được gọi mỗi khi nhận một chunk và callback nhận chính chunk hiện tại. `onFinish` được gọi khi stream kết thúc, cũng như khi phát sinh lỗi trong chu kỳ fetch / read.

Mặc định, hook không gửi request tới stream ngay khi khởi tạo. Bạn có thể cung cấp payload ban đầu thông qua tùy chọn `initialInput`:

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data } = useStream("chat", {
        initialInput: {
            message: "Introduce yourself.",
        },
    });

    return <div>{data}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data } = useStream("chat", {
    initialInput: {
        message: "Introduce yourself.",
    },
});
</script>

<template>
    <div>{{ data }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat", {
    initialInput: {
        message: "Introduce yourself.",
    },
});
</script>

<div>{$stream.data}</div>
```

Để hủy stream thủ công, hãy dùng phương thức `cancel` do hook trả về:

```tsx tab=React
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, cancel } = useStream("chat");

    return (
        <div>
            <div>{data}</div>
            <button onClick={cancel}>Cancel</button>
        </div>
    );
}
```

```vue tab=Vue
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const { data, cancel } = useStream("chat");
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <button @click="cancel">Cancel</button>
    </div>
</template>
```

```svelte tab=Svelte
<script>
import { useStream } from "@laravel/stream-svelte";

const stream = useStream("chat");
</script>

<div>
    <div>{$stream.data}</div>
    <button onclick={() => stream.cancel()}>Cancel</button>
</div>
```

Mỗi lần dùng hook `useStream`, Laravel tạo một `id` ngẫu nhiên để định danh stream. ID này được gửi tới server trong header `X-STREAM-ID` của mỗi request. Khi nhiều component cùng sử dụng một stream, bạn có thể đọc và ghi vào cùng stream bằng cách cung cấp `id` của riêng mình:

```tsx tab=React
// App.tsx
import { useStream } from "@laravel/stream-react";

function App() {
    const { data, id } = useStream("chat");

    return (
        <div>
            <div>{data}</div>
            <StreamStatus id={id} />
        </div>
    );
}

// StreamStatus.tsx
import { useStream } from "@laravel/stream-react";

function StreamStatus({ id }) {
    const { isFetching, isStreaming } = useStream("chat", { id });

    return (
        <div>
            {isFetching && <div>Connecting...</div>}
            {isStreaming && <div>Generating...</div>}
        </div>
    );
}
```

```vue tab=Vue
<!-- App.vue -->
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";
import StreamStatus from "./StreamStatus.vue";

const { data, id } = useStream("chat");
</script>

<template>
    <div>
        <div>{{ data }}</div>
        <StreamStatus :id="id" />
    </div>
</template>

<!-- StreamStatus.vue -->
<script setup lang="ts">
import { useStream } from "@laravel/stream-vue";

const props = defineProps<{
    id: string;
}>();

const { isFetching, isStreaming } = useStream("chat", { id: props.id });
</script>

<template>
    <div>
        <div v-if="isFetching">Connecting...</div>
        <div v-if="isStreaming">Generating...</div>
    </div>
</template>
```

```svelte tab=Svelte
<!-- App.svelte -->
<script>
import { useStream } from "@laravel/stream-svelte";
import StreamStatus from "./StreamStatus.svelte";

const stream = useStream("chat");
</script>

<div>
    <div>{$stream.data}</div>
    <StreamStatus id={stream.id} />
</div>

<!-- StreamStatus.svelte -->
<script>
import { useStream } from "@laravel/stream-svelte";

let { id } = $props();

const stream = useStream("chat", { id });
</script>

<div>
    {#if $stream.isFetching}
        <div>Connecting...</div>
    {/if}
    {#if $stream.isStreaming}
        <div>Generating...</div>
    {/if}
</div>
```

<a name="streamed-json-responses"></a>
### Streamed JSON response

Nếu cần stream dữ liệu JSON theo từng phần, bạn có thể dùng `streamJson`. Phương thức này đặc biệt hữu ích với dataset lớn cần được gửi dần tới trình duyệt dưới định dạng JavaScript có thể parse thuận tiện:

```php
use App\Models\User;

Route::get('/users.json', function () {
    return response()->streamJson([
        'users' => User::cursor(),
    ]);
});
```

Hook `useJsonStream` hoạt động giống [hook `useStream`](#consuming-streamed-responses), ngoại trừ việc nó sẽ cố gắng parse dữ liệu thành JSON sau khi quá trình stream hoàn tất:

```tsx tab=React
import { useJsonStream } from "@laravel/stream-react";

type User = {
    id: number;
    name: string;
    email: string;
};

function App() {
    const { data, send } = useJsonStream<{ users: User[] }>("users");

    const loadUsers = () => {
        send({
            query: "taylor",
        });
    };

    return (
        <div>
            <ul>
                {data?.users.map((user) => (
                    <li>
                        {user.id}: {user.name}
                    </li>
                ))}
            </ul>
            <button onClick={loadUsers}>Load Users</button>
        </div>
    );
}
```

```vue tab=Vue
<script setup lang="ts">
import { useJsonStream } from "@laravel/stream-vue";

type User = {
    id: number;
    name: string;
    email: string;
};

const { data, send } = useJsonStream<{ users: User[] }>("users");

const loadUsers = () => {
    send({
        query: "taylor",
    });
};
</script>

<template>
    <div>
        <ul>
            <li v-for="user in data?.users" :key="user.id">
                {{ user.id }}: {{ user.name }}
            </li>
        </ul>
        <button @click="loadUsers">Load Users</button>
    </div>
</template>
```

```svelte tab=Svelte
<script>
import { useJsonStream } from "@laravel/stream-svelte";

const stream = useJsonStream("users");

const loadUsers = () => {
    stream.send({
        query: "taylor",
    });
};
</script>

<div>
    <ul>
        {#if $stream.data?.users}
            {#each $stream.data.users as user (user.id)}
                <li>{user.id}: {user.name}</li>
            {/each}
        {/if}
    </ul>
    <button onclick={loadUsers}>Load Users</button>
</div>
```

<a name="event-streams"></a>
### Event stream (SSE)

Phương thức `eventStream` dùng để trả về streamed response theo chuẩn Server-Sent Events (SSE) với content type `text/event-stream`. `eventStream` nhận một closure; closure này nên [yield](https://www.php.net/manual/en/language.generators.overview.php) từng response vào stream ngay khi chúng sẵn sàng:

```php
Route::get('/chat', function () {
    return response()->eventStream(function () {
        $stream = OpenAI::client()->chat()->createStreamed(...);

        foreach ($stream as $response) {
            yield $response->choices[0];
        }
    });
});
```

Nếu muốn tùy chỉnh tên event, bạn có thể yield một đối tượng của lớp `StreamedEvent`:

```php
use Illuminate\Http\StreamedEvent;

yield new StreamedEvent(
    event: 'update',
    data: $response->choices[0],
);
```

<a name="consuming-event-streams"></a>
#### Tiêu thụ event stream

Event stream có thể được tiêu thụ bằng package npm `stream` của Laravel, cung cấp API thuận tiện để tương tác với Laravel event stream. Trước tiên, hãy cài `@laravel/stream-react`, `@laravel/stream-vue` hoặc `@laravel/stream-svelte`:

```shell tab=React
npm install @laravel/stream-react
```

```shell tab=Vue
npm install @laravel/stream-vue
```

```shell tab=Svelte
npm install @laravel/stream-svelte
```

Sau đó, bạn có thể dùng `useEventStream` để tiêu thụ event stream. Khi cung cấp URL của stream, hook sẽ tự động cập nhật `message` bằng các response được nối lại khi ứng dụng Laravel trả message về:

```jsx tab=React
import { useEventStream } from "@laravel/stream-react";

function App() {
  const { message } = useEventStream("/chat");

  return <div>{message}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useEventStream } from "@laravel/stream-vue";

const { message } = useEventStream("/chat");
</script>

<template>
  <div>{{ message }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useEventStream } from "@laravel/stream-svelte";

const eventStream = useEventStream("/chat");
</script>

<div>{$eventStream.message}</div>
```

Đối số thứ hai của `useEventStream` là một object tùy chọn để điều chỉnh cách tiêu thụ stream. Các giá trị mặc định được trình bày bên dưới:

```jsx tab=React
import { useEventStream } from "@laravel/stream-react";

function App() {
  const { message } = useEventStream("/stream", {
    eventName: "update",
    onMessage: (message) => {
      //
    },
    onError: (error) => {
      //
    },
    onComplete: () => {
      //
    },
    endSignal: "</stream>",
    glue: " ",
  });

  return <div>{message}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useEventStream } from "@laravel/stream-vue";

const { message } = useEventStream("/chat", {
  eventName: "update",
  onMessage: (message) => {
    // ...
  },
  onError: (error) => {
    // ...
  },
  onComplete: () => {
    // ...
  },
  endSignal: "</stream>",
  glue: " ",
});
</script>
```

```svelte tab=Svelte
<script>
import { useEventStream } from "@laravel/stream-svelte";

const eventStream = useEventStream("/chat", {
    eventName: "update",
    onMessage: (event) => {
        //
    },
    onError: (error) => {
        //
    },
    onComplete: () => {
        //
    },
    endSignal: "</stream>",
    glue: " ",
    replace: false,
});
</script>
```

Frontend của ứng dụng cũng có thể tự tiêu thụ event stream bằng đối tượng [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). Khi stream hoàn tất, phương thức `eventStream` sẽ tự động gửi bản cập nhật `</stream>` vào event stream:

```js
const source = new EventSource('/chat');

source.addEventListener('update', (event) => {
    if (event.data === '</stream>') {
        source.close();

        return;
    }

    console.log(event.data);
});
```

Để tùy chỉnh event cuối cùng được gửi vào event stream, hãy truyền một đối tượng `StreamedEvent` vào đối số `endStreamWith` của phương thức `eventStream`:

```php
return response()->eventStream(function () {
    // ...
}, endStreamWith: new StreamedEvent(event: 'update', data: '</stream>'));
```

<a name="streamed-downloads"></a>
### Tải xuống dạng stream

Đôi khi bạn muốn biến chuỗi kết quả của một thao tác thành response có thể tải xuống mà không cần ghi nội dung đó ra đĩa. Trong trường hợp này, hãy dùng `streamDownload`. Phương thức nhận callback, tên file và một mảng header tùy chọn:

```php
use App\Services\GitHub;

return response()->streamDownload(function () {
    echo GitHub::api('repo')
        ->contents()
        ->readme('laravel', 'laravel')['contents'];
}, 'laravel-readme.md');
```

<a name="response-macros"></a>
## Response macro

Nếu muốn định nghĩa một response tùy chỉnh có thể tái sử dụng trong nhiều route và controller, bạn có thể dùng phương thức `macro` trên facade `Response`. Thông thường, phương thức này nên được gọi trong `boot` của một [service provider](/docs/{{version}}/providers), chẳng hạn `App\Providers\AppServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Response;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Response::macro('caps', function (string $value) {
            return Response::make(strtoupper($value));
        });
    }
}
```

Hàm `macro` nhận tên macro làm đối số thứ nhất và closure làm đối số thứ hai. Closure của macro sẽ được thực thi khi gọi tên macro từ một implementation của `ResponseFactory` hoặc từ helper `response`:

```php
return response()->caps('foo');
```
