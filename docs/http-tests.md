# Kiểm thử HTTP

<a name="introduction"></a>
## Giới thiệu

Laravel cung cấp một API rất mạch lạc để thực hiện các HTTP request đến ứng dụng và kiểm tra response. Ví dụ, hãy xem feature test được định nghĩa bên dưới:

```php tab=Pest
<?php

test('the application returns a successful response', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

Phương thức `get` thực hiện một request `GET` đến ứng dụng, trong khi phương thức `assertStatus` xác nhận rằng response trả về có HTTP status code đã cho. Ngoài assertion đơn giản này, Laravel còn cung cấp nhiều assertion khác để kiểm tra header, nội dung, cấu trúc JSON của response và nhiều thành phần khác.

<a name="making-requests"></a>
## Thực hiện request

Để thực hiện request đến ứng dụng, bạn có thể gọi các phương thức `get`, `post`, `put`, `patch` hoặc `delete` trong test. Các phương thức này không thực sự gửi một HTTP request "thật" đến ứng dụng. Thay vào đó, toàn bộ network request được mô phỏng nội bộ.

Thay vì trả về một instance `Illuminate\Http\Response`, các phương thức request trong test trả về một instance `Illuminate\Testing\TestResponse`, cung cấp [nhiều assertion hữu ích](#available-assertions) để bạn kiểm tra response của ứng dụng:

```php tab=Pest
<?php

test('basic request', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_a_basic_request(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
```

Nhìn chung, mỗi test chỉ nên thực hiện một request đến ứng dụng. Hành vi không mong đợi có thể xảy ra nếu nhiều request được thực thi trong cùng một test method.

> [!NOTE]
> Để thuận tiện, middleware CSRF sẽ tự động được vô hiệu hóa khi chạy test.

<a name="customizing-request-headers"></a>
### Tùy chỉnh header của request

Bạn có thể sử dụng phương thức `withHeaders` để tùy chỉnh header của request trước khi request được gửi đến ứng dụng. Phương thức này cho phép bạn thêm bất kỳ custom header nào mong muốn vào request:

```php tab=Pest
<?php

test('interacting with headers', function () {
    $response = $this->withHeaders([
        'X-Header' => 'Value',
    ])->post('/user', ['name' => 'Sally']);

    $response->assertStatus(201);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_interacting_with_headers(): void
    {
        $response = $this->withHeaders([
            'X-Header' => 'Value',
        ])->post('/user', ['name' => 'Sally']);

        $response->assertStatus(201);
    }
}
```

<a name="cookies"></a>
### Cookie

Bạn có thể sử dụng phương thức `withCookie` hoặc `withCookies` để thiết lập giá trị cookie trước khi thực hiện request. Phương thức `withCookie` nhận tên và giá trị cookie làm hai đối số, trong khi `withCookies` nhận một mảng các cặp tên / giá trị:

```php tab=Pest
<?php

test('interacting with cookies', function () {
    $response = $this->withCookie('color', 'blue')->get('/');

    $response = $this->withCookies([
        'color' => 'blue',
        'name' => 'Taylor',
    ])->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_cookies(): void
    {
        $response = $this->withCookie('color', 'blue')->get('/');

        $response = $this->withCookies([
            'color' => 'blue',
            'name' => 'Taylor',
        ])->get('/');

        //
    }
}
```

<a name="session-and-authentication"></a>
### Session / Xác thực

Laravel cung cấp một số helper để tương tác với session trong quá trình kiểm thử HTTP. Trước tiên, bạn có thể thiết lập dữ liệu session bằng một mảng cho trước thông qua phương thức `withSession`. Điều này hữu ích khi cần nạp dữ liệu vào session trước khi gửi request đến ứng dụng:

```php tab=Pest
<?php

test('interacting with the session', function () {
    $response = $this->withSession(['banned' => false])->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_interacting_with_the_session(): void
    {
        $response = $this->withSession(['banned' => false])->get('/');

        //
    }
}
```

Session của Laravel thường được dùng để duy trì trạng thái cho người dùng hiện đang được xác thực. Vì vậy, helper `actingAs` cung cấp một cách đơn giản để xác thực một user cụ thể làm user hiện tại. Ví dụ, chúng ta có thể sử dụng [model factory](/docs/{{version}}/eloquent-factories) để tạo và xác thực một user:

```php tab=Pest
<?php

use App\Models\User;

test('an action that requires authentication', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withSession(['banned' => false])
        ->get('/');

    //
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_an_action_that_requires_authentication(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withSession(['banned' => false])
            ->get('/');

        //
    }
}
```

Bạn cũng có thể chỉ định guard được dùng để xác thực user bằng cách truyền tên guard làm đối số thứ hai cho phương thức `actingAs`. Guard được truyền vào `actingAs` cũng sẽ trở thành guard mặc định trong suốt thời gian chạy test:

```php
$this->actingAs($user, 'web');
```

Nếu muốn đảm bảo request ở trạng thái chưa xác thực, bạn có thể sử dụng phương thức `actingAsGuest`:

```php
$this->actingAsGuest();
```

<a name="debugging-responses"></a>
### Debug response

Sau khi thực hiện một test request đến ứng dụng, bạn có thể sử dụng các phương thức `dump`, `dumpHeaders` và `dumpSession` để kiểm tra và debug nội dung response:

```php tab=Pest
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->dump();
    $response->dumpHeaders();
    $response->dumpSession();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->dump();
        $response->dumpHeaders();
        $response->dumpSession();
    }
}
```

Ngoài ra, bạn có thể sử dụng các phương thức `dd`, `ddHeaders`, `ddBody`, `ddJson` và `ddSession` để dump thông tin về response rồi dừng thực thi:

```php tab=Pest
<?php

test('basic test', function () {
    $response = $this->get('/');

    $response->dd();
    $response->ddHeaders();
    $response->ddBody();
    $response->ddJson();
    $response->ddSession();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $response = $this->get('/');

        $response->dd();
        $response->ddHeaders();
        $response->ddBody();
        $response->ddJson();
        $response->ddSession();
    }
}
```

<a name="exception-handling"></a>
### Xử lý exception

Đôi khi bạn cần kiểm thử rằng ứng dụng đang ném ra một exception cụ thể. Để thực hiện việc này, bạn có thể "fake" exception handler thông qua facade `Exceptions`. Sau khi exception handler được fake, bạn có thể sử dụng các phương thức `assertReported` và `assertNotReported` để assertion đối với các exception được ném ra trong request:

```php tab=Pest
<?php

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;

test('exception is thrown', function () {
    Exceptions::fake();

    $response = $this->get('/order/1');

    // Assert an exception was thrown...
    Exceptions::assertReported(InvalidOrderException::class);

    // Assert against the exception...
    Exceptions::assertReported(function (InvalidOrderException $e) {
        return $e->getMessage() === 'The order was invalid.';
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Exceptions\InvalidOrderException;
use Illuminate\Support\Facades\Exceptions;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_exception_is_thrown(): void
    {
        Exceptions::fake();

        $response = $this->get('/');

        // Assert an exception was thrown...
        Exceptions::assertReported(InvalidOrderException::class);

        // Assert against the exception...
        Exceptions::assertReported(function (InvalidOrderException $e) {
            return $e->getMessage() === 'The order was invalid.';
        });
    }
}
```

Các phương thức `assertNotReported` và `assertNothingReported` có thể được dùng để xác nhận rằng một exception cụ thể không được ném ra trong request hoặc không có exception nào được ném ra:

```php
Exceptions::assertNotReported(InvalidOrderException::class);

Exceptions::assertNothingReported();
```

Bạn có thể vô hiệu hóa hoàn toàn việc xử lý exception cho một request cụ thể bằng cách gọi phương thức `withoutExceptionHandling` trước khi thực hiện request:

```php
$response = $this->withoutExceptionHandling()->get('/');
```

Ngoài ra, nếu muốn đảm bảo ứng dụng không sử dụng các tính năng đã bị PHP hoặc các thư viện mà ứng dụng sử dụng đánh dấu deprecated, bạn có thể gọi phương thức `withoutDeprecationHandling` trước khi thực hiện request. Khi xử lý deprecation bị vô hiệu hóa, các cảnh báo deprecation sẽ được chuyển thành exception, khiến test thất bại:

```php
$response = $this->withoutDeprecationHandling()->get('/');
```

Phương thức `assertThrows` có thể được dùng để xác nhận rằng code bên trong một closure ném ra exception thuộc kiểu được chỉ định:

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    OrderInvalid::class
);
```

Nếu muốn kiểm tra và thực hiện assertion đối với exception được ném ra, bạn có thể truyền một closure làm đối số thứ hai cho phương thức `assertThrows`:

```php
$this->assertThrows(
    fn () => (new ProcessOrder)->execute(),
    fn (OrderInvalid $e) => $e->orderId() === 123;
);
```

Phương thức `assertDoesntThrow` có thể được dùng để xác nhận rằng code bên trong một closure không ném ra bất kỳ exception nào:

```php
$this->assertDoesntThrow(fn () => (new ProcessOrder)->execute());
```

<a name="testing-json-apis"></a>
## Kiểm thử JSON API

Laravel cũng cung cấp một số helper để kiểm thử JSON API và response của chúng. Ví dụ, các phương thức `json`, `getJson`, `postJson`, `putJson`, `patchJson`, `deleteJson` và `optionsJson` có thể được dùng để gửi JSON request với nhiều HTTP verb khác nhau. Bạn cũng có thể dễ dàng truyền dữ liệu và header cho các phương thức này. Để bắt đầu, hãy viết một test thực hiện request `POST` đến `/api/user` và xác nhận rằng dữ liệu JSON mong đợi được trả về:

```php tab=Pest
<?php

test('making an api request', function () {
    $response = $this->postJson('/api/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertJson([
            'created' => true,
        ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_making_an_api_request(): void
    {
        $response = $this->postJson('/api/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJson([
                'created' => true,
            ]);
    }
}
```

Ngoài ra, dữ liệu JSON response có thể được truy cập như các biến mảng trên response, giúp bạn thuận tiện kiểm tra từng giá trị được trả về trong JSON response:

```php tab=Pest
expect($response['created'])->toBeTrue();
```

```php tab=PHPUnit
$this->assertTrue($response['created']);
```

> [!NOTE]
> Phương thức `assertJson` chuyển response thành một mảng để xác minh rằng mảng được cung cấp tồn tại trong JSON response do ứng dụng trả về. Vì vậy, nếu JSON response còn có các thuộc tính khác, test vẫn pass miễn là fragment được cung cấp có mặt.

<a name="verifying-exact-match"></a>
#### Xác nhận JSON khớp chính xác

Như đã đề cập, phương thức `assertJson` có thể được dùng để xác nhận một fragment JSON tồn tại trong JSON response. Nếu muốn xác minh rằng một mảng cho trước **khớp chính xác** với JSON do ứng dụng trả về, bạn nên dùng phương thức `assertExactJson`:

```php tab=Pest
<?php

test('asserting an exact json match', function () {
    $response = $this->postJson('/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertExactJson([
            'created' => true,
        ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_asserting_an_exact_json_match(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertExactJson([
                'created' => true,
            ]);
    }
}
```

<a name="verifying-json-paths"></a>
#### Xác nhận theo JSON path

Nếu muốn xác minh JSON response chứa dữ liệu được cung cấp tại một path cụ thể, bạn nên dùng phương thức `assertJsonPath`:

```php tab=Pest
<?php

test('asserting a json path value', function () {
    $response = $this->postJson('/user', ['name' => 'Sally']);

    $response
        ->assertStatus(201)
        ->assertJsonPath('team.owner.name', 'Darian');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic functional test example.
     */
    public function test_asserting_a_json_paths_value(): void
    {
        $response = $this->postJson('/user', ['name' => 'Sally']);

        $response
            ->assertStatus(201)
            ->assertJsonPath('team.owner.name', 'Darian');
    }
}
```

Phương thức `assertJsonPath` cũng chấp nhận một closure, có thể dùng để xác định động assertion có nên pass hay không:

```php
$response->assertJsonPath('team.owner.name', fn (string $name) => strlen($name) >= 3);
```

Nếu cần xác nhận nhiều JSON path cùng lúc, bạn có thể dùng phương thức `assertJsonPaths`. Giá trị mong đợi cho mỗi path cũng có thể là một closure:

```php
$response->assertJsonPaths([
    'team.owner.name' => 'Darian',
    'team.owner.email' => fn (string $email) => str($email)->is('*@laravel.com'),
    'team.members.0.name' => 'Sally',
]);
```

Bạn có thể dùng phương thức `assertJsonMissingPaths` để xác nhận nhiều JSON path không tồn tại trong response:

```php
$response->assertJsonMissingPaths([
    'team.owner.password',
    'team.members.0.api_token',
]);
```

<a name="fluent-json-testing"></a>
### Kiểm thử JSON theo Fluent API

Laravel cũng cung cấp một cách thuận tiện để kiểm thử JSON response của ứng dụng theo fluent API. Để bắt đầu, hãy truyền một closure vào phương thức `assertJson`. Closure này sẽ được gọi với một instance của `Illuminate\Testing\Fluent\AssertableJson`, cho phép thực hiện assertion trên JSON do ứng dụng trả về. Phương thức `where` dùng để assertion một thuộc tính cụ thể của JSON, còn `missing` dùng để xác nhận một thuộc tính cụ thể không tồn tại trong JSON:

```php tab=Pest
use Illuminate\Testing\Fluent\AssertableJson;

test('fluent json', function () {
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                ->where('name', 'Victoria Faith')
                ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                ->whereNot('status', 'pending')
                ->missing('password')
                ->etc()
        );
});
```

```php tab=PHPUnit
use Illuminate\Testing\Fluent\AssertableJson;

/**
 * A basic functional test example.
 */
public function test_fluent_json(): void
{
    $response = $this->getJson('/users/1');

    $response
        ->assertJson(fn (AssertableJson $json) =>
            $json->where('id', 1)
                ->where('name', 'Victoria Faith')
                ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                ->whereNot('status', 'pending')
                ->missing('password')
                ->etc()
        );
}
```

#### Tìm hiểu phương thức `etc`

Trong ví dụ trên, bạn có thể nhận thấy phương thức `etc` được gọi ở cuối chuỗi assertion. Phương thức này cho Laravel biết JSON object có thể chứa thêm các thuộc tính khác. Nếu không dùng `etc`, test sẽ fail khi JSON object có các thuộc tính khác mà bạn chưa thực hiện assertion.

Mục đích của hành vi này là bảo vệ bạn khỏi việc vô tình làm lộ thông tin nhạy cảm trong JSON response bằng cách buộc bạn phải assertion rõ ràng thuộc tính đó hoặc chủ động cho phép các thuộc tính bổ sung thông qua phương thức `etc`.

Tuy nhiên, cần lưu ý rằng việc không đưa `etc` vào chuỗi assertion không đảm bảo rằng các thuộc tính bổ sung không được thêm vào những mảng lồng bên trong JSON object. Phương thức `etc` chỉ đảm bảo không có thuộc tính bổ sung tại đúng cấp lồng nơi phương thức `etc` được gọi.

<a name="asserting-json-attribute-presence-and-absence"></a>
#### Xác nhận thuộc tính tồn tại / không tồn tại

Để xác nhận một thuộc tính tồn tại hoặc không tồn tại, bạn có thể dùng các phương thức `has` và `missing`:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('data')
        ->missing('message')
);
```

Ngoài ra, các phương thức `hasAll` và `missingAll` cho phép xác nhận đồng thời sự tồn tại hoặc không tồn tại của nhiều thuộc tính:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->hasAll(['status', 'data'])
        ->missingAll(['message', 'code'])
);
```

Bạn có thể dùng phương thức `hasAny` để xác định liệu có ít nhất một thuộc tính trong danh sách được cung cấp tồn tại hay không:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->has('status')
        ->hasAny('data', 'message', 'code')
);
```

<a name="asserting-against-json-collections"></a>
#### Xác nhận trên JSON collection

Thông thường, route sẽ trả về JSON response chứa nhiều phần tử, chẳng hạn nhiều user:

```php
Route::get('/users', function () {
    return User::all();
});
```

Trong những trường hợp này, chúng ta có thể dùng phương thức `has` của fluent JSON object để thực hiện assertion trên các user có trong response. Ví dụ, trước tiên hãy xác nhận JSON response chứa ba user. Sau đó, dùng phương thức `first` để thực hiện một số assertion đối với user đầu tiên trong collection. Phương thức `first` nhận một closure, closure này nhận một đối tượng JSON có thể assertion khác để chúng ta kiểm tra object đầu tiên trong JSON collection:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has(3)
            ->first(fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

Nếu muốn thực hiện cùng một nhóm assertion trên mọi phần tử của JSON collection, bạn có thể dùng phương thức `each`:

```php
$response
  ->assertJson(fn (AssertableJson $json) =>
      $json->has(3)
          ->each(fn (AssertableJson $json) =>
              $json->whereType('id', 'integer')
                  ->whereType('name', 'string')
                  ->whereType('email', 'string')
                  ->missing('password')
                  ->etc()
          )
  );
```

<a name="scoping-json-collection-assertions"></a>
#### Giới hạn phạm vi assertion cho JSON collection

Đôi khi, route của ứng dụng sẽ trả về các JSON collection được gán vào những key có tên:

```php
Route::get('/users', function () {
    return [
        'meta' => [...],
        'users' => User::all(),
    ];
})
```

Khi kiểm thử các route này, bạn có thể dùng phương thức `has` để xác nhận số lượng phần tử trong collection. Ngoài ra, bạn cũng có thể dùng `has` để giới hạn phạm vi cho một chuỗi assertion:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
            ->has('users', 3)
            ->has('users.0', fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

Tuy nhiên, thay vì gọi riêng phương thức `has` hai lần để assertion collection `users`, bạn có thể chỉ gọi một lần và truyền closure làm tham số thứ ba. Khi đó, closure sẽ tự động được gọi và giới hạn phạm vi vào phần tử đầu tiên của collection:

```php
$response
    ->assertJson(fn (AssertableJson $json) =>
        $json->has('meta')
            ->has('users', 3, fn (AssertableJson $json) =>
                $json->where('id', 1)
                    ->where('name', 'Victoria Faith')
                    ->where('email', fn (string $email) => str($email)->is('victoria@gmail.com'))
                    ->missing('password')
                    ->etc()
            )
    );
```

<a name="asserting-json-types"></a>
#### Xác nhận kiểu dữ liệu JSON

Có thể bạn chỉ muốn xác nhận các thuộc tính trong JSON response thuộc một kiểu dữ liệu nhất định. Class `Illuminate\Testing\Fluent\AssertableJson` cung cấp các phương thức `whereType` và `whereAllType` cho mục đích này:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('id', 'integer')
        ->whereAllType([
            'users.0.name' => 'string',
            'meta' => 'array'
        ])
);
```

Bạn có thể chỉ định nhiều kiểu bằng ký tự `|`, hoặc truyền một mảng kiểu dữ liệu làm tham số thứ hai cho phương thức `whereType`. Assertion sẽ thành công nếu giá trị response thuộc bất kỳ kiểu nào trong danh sách:

```php
$response->assertJson(fn (AssertableJson $json) =>
    $json->whereType('name', 'string|null')
        ->whereType('id', ['string', 'integer'])
);
```

Các phương thức `whereType` và `whereAllType` nhận diện các kiểu sau: `string`, `integer`, `double`, `boolean`, `array` và `null`.

<a name="testing-file-uploads"></a>
## Kiểm thử upload file

Class `Illuminate\Http\UploadedFile` cung cấp phương thức `fake` để tạo file hoặc hình ảnh giả phục vụ kiểm thử. Khi kết hợp với phương thức `fake` của facade `Storage`, việc kiểm thử upload file trở nên đơn giản hơn nhiều. Ví dụ, bạn có thể kết hợp hai tính năng này để dễ dàng kiểm thử form upload avatar:

```php tab=Pest
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('avatars can be uploaded', function () {
    Storage::fake('avatars');

    $file = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->post('/avatar', [
        'avatar' => $file,
    ]);

    Storage::disk('avatars')->assertExists($file->hashName());
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_avatars_can_be_uploaded(): void
    {
        Storage::fake('avatars');

        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->post('/avatar', [
            'avatar' => $file,
        ]);

        Storage::disk('avatars')->assertExists($file->hashName());
    }
}
```

Nếu muốn xác nhận một file nhất định không tồn tại, bạn có thể dùng phương thức `assertMissing` do facade `Storage` cung cấp:

```php
Storage::fake('avatars');

// ...

Storage::disk('avatars')->assertMissing('missing.jpg');
```

<a name="fake-file-customization"></a>
#### Tùy chỉnh file giả

Khi tạo file bằng phương thức `fake` do class `UploadedFile` cung cấp, bạn có thể chỉ định chiều rộng, chiều cao và kích thước ảnh (tính bằng kilobyte) để kiểm thử các validation rule của ứng dụng tốt hơn:

```php
UploadedFile::fake()->image('avatar.jpg', $width, $height)->size(100);
```

Ngoài việc tạo hình ảnh, bạn có thể tạo file thuộc bất kỳ loại nào khác bằng phương thức `create`:

```php
UploadedFile::fake()->create('document.pdf', $sizeInKilobytes);
```

Nếu cần, bạn có thể truyền đối số `$mimeType` vào phương thức để định nghĩa rõ MIME type mà file sẽ trả về:

```php
UploadedFile::fake()->create(
    'document.pdf', $sizeInKilobytes, 'application/pdf'
);
```

<a name="testing-views"></a>
## Kiểm thử View

Laravel cũng cho phép render một view mà không cần tạo HTTP request mô phỏng tới ứng dụng. Để thực hiện, bạn có thể gọi phương thức `view` trong test. Phương thức `view` nhận tên view và một mảng dữ liệu tùy chọn. Phương thức này trả về một instance của `Illuminate\Testing\TestView`, cung cấp nhiều phương thức thuận tiện để assertion nội dung của view:

```php tab=Pest
<?php

test('a welcome view can be rendered', function () {
    $view = $this->view('welcome', ['name' => 'Taylor']);

    $view->assertSee('Taylor');
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_a_welcome_view_can_be_rendered(): void
    {
        $view = $this->view('welcome', ['name' => 'Taylor']);

        $view->assertSee('Taylor');
    }
}
```

Class `TestView` cung cấp các phương thức assertion sau: `assertSee`, `assertSeeInOrder`, `assertSeeText`, `assertSeeTextInOrder`, `assertDontSee` và `assertDontSeeText`.

Nếu cần, bạn có thể lấy nội dung view thô đã render bằng cách ép instance `TestView` sang string:

```php
$contents = (string) $this->view('welcome');
```

<a name="sharing-errors"></a>
#### Chia sẻ lỗi

Một số view có thể phụ thuộc vào các lỗi được chia sẻ trong [global error bag do Laravel cung cấp](/docs/{{version}}/validation#quick-displaying-the-validation-errors). Để nạp các error message vào error bag, bạn có thể dùng phương thức `withViewErrors`:

```php
$view = $this->withViewErrors([
    'name' => ['Please provide a valid name.']
])->view('form');

$view->assertSee('Please provide a valid name.');
```

<a name="rendering-blade-and-components"></a>
### Render Blade và Component

Nếu cần, bạn có thể dùng phương thức `blade` để evaluate và render một chuỗi [Blade](/docs/{{version}}/blade) thô. Tương tự phương thức `view`, phương thức `blade` trả về một instance của `Illuminate\Testing\TestView`:

```php
$view = $this->blade(
    '<x-component :name="$name" />',
    ['name' => 'Taylor']
);

$view->assertSee('Taylor');
```

Bạn có thể dùng phương thức `component` để evaluate và render một [Blade component](/docs/{{version}}/blade#components). Phương thức `component` trả về một instance của `Illuminate\Testing\TestComponent`:

```php
$view = $this->component(Profile::class, ['name' => 'Taylor']);

$view->assertSee('Taylor');
```

<a name="caching-routes"></a>
## Cache Route

Trước khi một test chạy, Laravel khởi động một instance mới của ứng dụng, bao gồm việc thu thập tất cả route đã định nghĩa. Nếu ứng dụng có nhiều file route, bạn có thể thêm trait `Illuminate\Foundation\Testing\WithCachedRoutes` vào test case. Với các test dùng trait này, route được xây dựng một lần và lưu trong bộ nhớ, nghĩa là quá trình thu thập route chỉ chạy một lần cho toàn bộ test suite:

```php tab=Pest
<?php

use App\Http\Controllers\UserController;
use Illuminate\Foundation\Testing\WithCachedRoutes;

pest()->use(WithCachedRoutes::class);

test('basic example', function () {
    $this->get(action([UserController::class, 'index']));

    // ...
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Http\Controllers\UserController;
use Illuminate\Foundation\Testing\WithCachedRoutes;
use Tests\TestCase;

class BasicTest extends TestCase
{
    use WithCachedRoutes;

    /**
     * A basic functional test example.
     */
    public function test_basic_example(): void
    {
        $response = $this->get(action([UserController::class, 'index']));

        // ...
    }
}
```

<a name="available-assertions"></a>
## Các assertion khả dụng

<a name="response-assertions"></a>
### Response assertion

Class `Illuminate\Testing\TestResponse` của Laravel cung cấp nhiều phương thức assertion tùy chỉnh mà bạn có thể sử dụng khi kiểm thử ứng dụng. Các assertion này có thể được gọi trên response do các phương thức test `json`, `get`, `post`, `put` và `delete` trả về:

<style>
    .collection-method-list > p {
        columns: 14.4em 2; -moz-columns: 14.4em 2; -webkit-columns: 14.4em 2;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<div class="collection-method-list" markdown="1">

[assertAccepted](#assert-accepted)
[assertBadRequest](#assert-bad-request)
[assertClientError](#assert-client-error)
[assertConflict](#assert-conflict)
[assertCookie](#assert-cookie)
[assertCookieExpired](#assert-cookie-expired)
[assertCookieNotExpired](#assert-cookie-not-expired)
[assertCookieMissing](#assert-cookie-missing)
[assertCreated](#assert-created)
[assertDontSee](#assert-dont-see)
[assertDontSeeText](#assert-dont-see-text)
[assertDownload](#assert-download)
[assertExactJson](#assert-exact-json)
[assertExactJsonStructure](#assert-exact-json-structure)
[assertFailedDependency](#assert-failed-dependency)
[assertForbidden](#assert-forbidden)
[assertFound](#assert-found)
[assertGone](#assert-gone)
[assertHeader](#assert-header)
[assertHeaderContains](#assert-header-contains)
[assertHeaderMissing](#assert-header-missing)
[assertInternalServerError](#assert-internal-server-error)
[assertJson](#assert-json)
[assertJsonCount](#assert-json-count)
[assertJsonFragment](#assert-json-fragment)
[assertJsonIsArray](#assert-json-is-array)
[assertJsonIsObject](#assert-json-is-object)
[assertJsonMissing](#assert-json-missing)
[assertJsonMissingExact](#assert-json-missing-exact)
[assertJsonMissingValidationErrors](#assert-json-missing-validation-errors)
[assertJsonPath](#assert-json-path)
[assertJsonPaths](#assert-json-paths)
[assertJsonMissingPath](#assert-json-missing-path)
[assertJsonMissingPaths](#assert-json-missing-paths)
[assertJsonStructure](#assert-json-structure)
[assertJsonValidationErrors](#assert-json-validation-errors)
[assertJsonValidationErrorFor](#assert-json-validation-error-for)
[assertLocation](#assert-location)
[assertMethodNotAllowed](#assert-method-not-allowed)
[assertMovedPermanently](#assert-moved-permanently)
[assertContent](#assert-content)
[assertNoContent](#assert-no-content)
[assertStreamed](#assert-streamed)
[assertStreamedContent](#assert-streamed-content)
[assertNotFound](#assert-not-found)
[assertOk](#assert-ok)
[assertPaymentRequired](#assert-payment-required)
[assertPlainCookie](#assert-plain-cookie)
[assertRedirect](#assert-redirect)
[assertRedirectBack](#assert-redirect-back)
[assertRedirectBackWithErrors](#assert-redirect-back-with-errors)
[assertRedirectBackWithoutErrors](#assert-redirect-back-without-errors)
[assertRedirectContains](#assert-redirect-contains)
[assertRedirectToRoute](#assert-redirect-to-route)
[assertRedirectToSignedRoute](#assert-redirect-to-signed-route)
[assertRequestTimeout](#assert-request-timeout)
[assertSee](#assert-see)
[assertSeeInOrder](#assert-see-in-order)
[assertSeeText](#assert-see-text)
[assertSeeTextInOrder](#assert-see-text-in-order)
[assertServerError](#assert-server-error)
[assertServiceUnavailable](#assert-service-unavailable)
[assertSessionHas](#assert-session-has)
[assertSessionHasInput](#assert-session-has-input)
[assertSessionHasAll](#assert-session-has-all)
[assertSessionHasErrors](#assert-session-has-errors)
[assertSessionHasErrorsIn](#assert-session-has-errors-in)
[assertSessionHasNoErrors](#assert-session-has-no-errors)
[assertSessionDoesntHaveErrors](#assert-session-doesnt-have-errors)
[assertSessionMissing](#assert-session-missing)
[assertSessionMissingInput](#assert-session-missing-input)
[assertStatus](#assert-status)
[assertSuccessful](#assert-successful)
[assertTooManyRequests](#assert-too-many-requests)
[assertUnauthorized](#assert-unauthorized)
[assertUnprocessable](#assert-unprocessable)
[assertUnsupportedMediaType](#assert-unsupported-media-type)
[assertValid](#assert-valid)
[assertInvalid](#assert-invalid)
[assertViewHas](#assert-view-has)
[assertViewHasAll](#assert-view-has-all)
[assertViewIs](#assert-view-is)
[assertViewMissing](#assert-view-missing)

</div>

<a name="assert-accepted"></a>
#### assertAccepted

Xác nhận response có mã trạng thái HTTP accepted (202):

```php
$response->assertAccepted();
```

<a name="assert-bad-request"></a>
#### assertBadRequest

Xác nhận response có mã trạng thái HTTP bad request (400):

```php
$response->assertBadRequest();
```

<a name="assert-client-error"></a>
#### assertClientError

Xác nhận response có mã trạng thái HTTP thuộc nhóm client error (>= 400, < 500):

```php
$response->assertClientError();
```

<a name="assert-conflict"></a>
#### assertConflict

Xác nhận response có mã trạng thái HTTP conflict (409):

```php
$response->assertConflict();
```

<a name="assert-cookie"></a>
#### assertCookie

Xác nhận response chứa cookie đã cho:

```php
$response->assertCookie($cookieName, $value = null);
```

<a name="assert-cookie-expired"></a>
#### assertCookieExpired

Xác nhận response chứa cookie đã cho và cookie đó đã hết hạn:

```php
$response->assertCookieExpired($cookieName);
```

<a name="assert-cookie-not-expired"></a>
#### assertCookieNotExpired

Xác nhận response chứa cookie đã cho và cookie đó chưa hết hạn:

```php
$response->assertCookieNotExpired($cookieName);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

Xác nhận response không chứa cookie đã cho:

```php
$response->assertCookieMissing($cookieName);
```

<a name="assert-created"></a>
#### assertCreated

Xác nhận response có mã trạng thái HTTP 201:

```php
$response->assertCreated();
```

<a name="assert-dont-see"></a>
#### assertDontSee

Xác nhận chuỗi đã cho không xuất hiện trong response do ứng dụng trả về. Assertion này sẽ tự động escape chuỗi đã cho, trừ khi bạn truyền đối số thứ hai là `false`:

```php
$response->assertDontSee($value, $escape = true);
```

<a name="assert-dont-see-text"></a>
#### assertDontSeeText

Xác nhận chuỗi đã cho không xuất hiện trong phần văn bản của response. Assertion này sẽ tự động escape chuỗi đã cho, trừ khi bạn truyền đối số thứ hai là `false`. Phương thức này sẽ truyền nội dung response qua hàm PHP `strip_tags` trước khi thực hiện assertion:

```php
$response->assertDontSeeText($value, $escape = true);
```

<a name="assert-download"></a>
#### assertDownload

Xác nhận response là một phản hồi "download". Thông thường, điều này có nghĩa route được gọi đã trả về response `Response::download`, `BinaryFileResponse` hoặc `Storage::download`:

```php
$response->assertDownload();
```

Nếu muốn, bạn có thể xác nhận file tải xuống được gán một tên file cụ thể:

```php
$response->assertDownload('image.jpg');
```

<a name="assert-exact-json"></a>
#### assertExactJson

Xác nhận response khớp chính xác với dữ liệu JSON đã cho:

```php
$response->assertExactJson(array $data);
```

<a name="assert-exact-json-structure"></a>
#### assertExactJsonStructure

Xác nhận response khớp chính xác với cấu trúc JSON đã cho:

```php
$response->assertExactJsonStructure(array $data);
```

Phương thức này là biến thể nghiêm ngặt hơn của [assertJsonStructure](#assert-json-structure). Khác với `assertJsonStructure`, phương thức này sẽ thất bại nếu response chứa bất kỳ key nào không được khai báo rõ trong cấu trúc JSON mong đợi.

<a name="assert-failed-dependency"></a>
#### assertFailedDependency

Xác nhận response có mã trạng thái HTTP failed dependency (424):

```php
$response->assertFailedDependency();
```

<a name="assert-forbidden"></a>
#### assertForbidden

Xác nhận response có mã trạng thái HTTP forbidden (403):

```php
$response->assertForbidden();
```

<a name="assert-found"></a>
#### assertFound

Xác nhận response có mã trạng thái HTTP found (302):

```php
$response->assertFound();
```

<a name="assert-gone"></a>
#### assertGone

Xác nhận response có mã trạng thái HTTP gone (410):

```php
$response->assertGone();
```

<a name="assert-header"></a>
#### assertHeader

Xác nhận header và giá trị đã cho tồn tại trong response:

```php
$response->assertHeader($headerName, $value = null);
```

<a name="assert-header-contains"></a>
#### assertHeaderContains

Xác nhận header đã cho chứa giá trị chuỗi con được chỉ định:

```php
$response->assertHeaderContains($headerName, $value);
```

<a name="assert-header-missing"></a>
#### assertHeaderMissing

Xác nhận header đã cho không tồn tại trong response:

```php
$response->assertHeaderMissing($headerName);
```

<a name="assert-internal-server-error"></a>
#### assertInternalServerError

Xác nhận response có mã trạng thái HTTP "Internal Server Error" (500):

```php
$response->assertInternalServerError();
```

<a name="assert-json"></a>
#### assertJson

Xác nhận response chứa dữ liệu JSON đã cho:

```php
$response->assertJson(array $data, $strict = false);
```

Phương thức `assertJson` chuyển response thành một mảng để xác minh mảng đã cho tồn tại trong JSON response do ứng dụng trả về. Vì vậy, ngay cả khi JSON response có các thuộc tính khác, test vẫn pass miễn là fragment đã cho tồn tại.

<a name="assert-json-count"></a>
#### assertJsonCount

Xác nhận JSON response có một mảng với số lượng phần tử mong đợi tại key đã cho:

```php
$response->assertJsonCount($count, $key = null);
```

<a name="assert-json-fragment"></a>
#### assertJsonFragment

Xác nhận response chứa dữ liệu JSON đã cho ở bất kỳ vị trí nào:

```php
Route::get('/users', function () {
    return [
        'users' => [
            [
                'name' => 'Taylor Otwell',
            ],
        ],
    ];
});

$response->assertJsonFragment(['name' => 'Taylor Otwell']);
```

<a name="assert-json-is-array"></a>
#### assertJsonIsArray

Xác nhận JSON response là một mảng:

```php
$response->assertJsonIsArray();
```

<a name="assert-json-is-object"></a>
#### assertJsonIsObject

Xác nhận JSON response là một object:

```php
$response->assertJsonIsObject();
```

<a name="assert-json-missing"></a>
#### assertJsonMissing

Xác nhận response không chứa dữ liệu JSON đã cho:

```php
$response->assertJsonMissing(array $data);
```

<a name="assert-json-missing-exact"></a>
#### assertJsonMissingExact

Xác nhận response không chứa chính xác dữ liệu JSON đã cho:

```php
$response->assertJsonMissingExact(array $data);
```

<a name="assert-json-missing-validation-errors"></a>
#### assertJsonMissingValidationErrors

Xác nhận response không có lỗi validation JSON đối với các key đã cho:

```php
$response->assertJsonMissingValidationErrors($keys);
```

> [!NOTE]
> Method tổng quát hơn [assertValid](#assert-valid) có thể được dùng để xác nhận response không có validation error được trả về dưới dạng JSON **và** không có error nào được flash vào session storage.

<a name="assert-json-path"></a>
#### assertJsonPath

Xác nhận response chứa dữ liệu đã cho tại path được chỉ định:

```php
$response->assertJsonPath($path, $expectedValue);
```

Ví dụ, nếu ứng dụng của bạn trả về JSON response sau:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Bạn có thể xác nhận thuộc tính `name` của object `user` khớp với một giá trị đã cho như sau:

```php
$response->assertJsonPath('user.name', 'Steve Schoger');
```

<a name="assert-json-paths"></a>
#### assertJsonPaths

Xác nhận response chứa dữ liệu đã cho tại các path được chỉ định:

```php
$response->assertJsonPaths(array $paths);
```

Ví dụ, bạn có thể xác nhận nhiều giá trị trong response cùng lúc:

```php
$response->assertJsonPaths([
    'user.name' => 'Steve Schoger',
    'user.email' => fn (string $email) => str($email)->endsWith('@laravel.com'),
]);
```

<a name="assert-json-missing-path"></a>
#### assertJsonMissingPath

Xác nhận response không chứa path đã cho:

```php
$response->assertJsonMissingPath($path);
```

Ví dụ, nếu ứng dụng của bạn trả về JSON response sau:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Bạn có thể xác nhận response không chứa thuộc tính `email` của object `user`:

```php
$response->assertJsonMissingPath('user.email');
```

<a name="assert-json-missing-paths"></a>
#### assertJsonMissingPaths

Xác nhận response không chứa các path đã cho:

```php
$response->assertJsonMissingPaths($paths);
```

Ví dụ, bạn có thể xác nhận nhiều path không tồn tại trong response:

```php
$response->assertJsonMissingPaths([
    'user.email',
    'user.password',
]);
```

<a name="assert-json-structure"></a>
#### assertJsonStructure

Xác nhận response có cấu trúc JSON đã cho:

```php
$response->assertJsonStructure(array $structure);
```

Ví dụ, nếu JSON response do ứng dụng trả về chứa dữ liệu sau:

```json
{
    "user": {
        "name": "Steve Schoger"
    }
}
```

Bạn có thể xác nhận cấu trúc JSON khớp với mong đợi như sau:

```php
$response->assertJsonStructure([
    'user' => [
        'name',
    ]
]);
```

Đôi khi, JSON response do ứng dụng trả về có thể chứa các mảng object:

```json
{
    "user": [
        {
            "name": "Steve Schoger",
            "age": 55,
            "location": "Earth"
        },
        {
            "name": "Mary Schoger",
            "age": 60,
            "location": "Earth"
        }
    ]
}
```

Trong trường hợp này, bạn có thể dùng ký tự `*` để assertion cấu trúc của tất cả object trong mảng:

```php
$response->assertJsonStructure([
    'user' => [
        '*' => [
             'name',
             'age',
             'location'
        ]
    ]
]);
```

<a name="assert-json-validation-errors"></a>
#### assertJsonValidationErrors

Xác nhận response có các lỗi validation JSON đối với các key đã cho. Nên dùng phương thức này khi assertion response mà lỗi validation được trả về dưới dạng cấu trúc JSON thay vì được flash vào session:

```php
$response->assertJsonValidationErrors(array $data, $responseKey = 'errors');
```

> [!NOTE]
> Method tổng quát hơn [assertInvalid](#assert-invalid) có thể được dùng để xác nhận response có validation error được trả về dưới dạng JSON **hoặc** error được flash vào session storage.

<a name="assert-json-validation-error-for"></a>
#### assertJsonValidationErrorFor

Xác nhận response có lỗi validation JSON bất kỳ đối với key đã cho:

```php
$response->assertJsonValidationErrorFor(string $key, $responseKey = 'errors');
```

<a name="assert-method-not-allowed"></a>
#### assertMethodNotAllowed

Xác nhận response có mã trạng thái HTTP method not allowed (405):

```php
$response->assertMethodNotAllowed();
```

<a name="assert-moved-permanently"></a>
#### assertMovedPermanently

Xác nhận response có mã trạng thái HTTP moved permanently (301):

```php
$response->assertMovedPermanently();
```

<a name="assert-location"></a>
#### assertLocation

Xác nhận response có giá trị URI đã cho trong header `Location`:

```php
$response->assertLocation($uri);
```

<a name="assert-content"></a>
#### assertContent

Xác nhận chuỗi đã cho khớp với nội dung response:

```php
$response->assertContent($value);
```

<a name="assert-no-content"></a>
#### assertNoContent

Xác nhận response có mã trạng thái HTTP đã cho và không có nội dung:

```php
$response->assertNoContent($status = 204);
```

<a name="assert-streamed"></a>
#### assertStreamed

Xác nhận response là streamed response:

    $response->assertStreamed();

<a name="assert-streamed-content"></a>
#### assertStreamedContent

Xác nhận chuỗi đã cho khớp với nội dung streamed response:

```php
$response->assertStreamedContent($value);
```

<a name="assert-not-found"></a>
#### assertNotFound

Xác nhận response có mã trạng thái HTTP not found (404):

```php
$response->assertNotFound();
```

<a name="assert-ok"></a>
#### assertOk

Xác nhận response có mã trạng thái HTTP 200:

```php
$response->assertOk();
```

<a name="assert-payment-required"></a>
#### assertPaymentRequired

Xác nhận response có mã trạng thái HTTP payment required (402):

```php
$response->assertPaymentRequired();
```

<a name="assert-plain-cookie"></a>
#### assertPlainCookie

Xác nhận response chứa cookie chưa mã hóa đã cho:

```php
$response->assertPlainCookie($cookieName, $value = null);
```

<a name="assert-redirect"></a>
#### assertRedirect

Xác nhận response redirect đến URI đã cho:

```php
$response->assertRedirect($uri = null);
```

<a name="assert-redirect-back"></a>
#### assertRedirectBack

Xác nhận response đang redirect trở lại trang trước:

```php
$response->assertRedirectBack();
```

<a name="assert-redirect-back-with-errors"></a>
#### assertRedirectBackWithErrors

Xác nhận response đang redirect trở lại trang trước và [session có các lỗi đã cho](#assert-session-has-errors):

```php
$response->assertRedirectBackWithErrors(
    array $keys = [], $format = null, $errorBag = 'default'
);
```

<a name="assert-redirect-back-without-errors"></a>
#### assertRedirectBackWithoutErrors

Xác nhận response đang redirect trở lại trang trước và session không chứa thông báo lỗi nào:

```php
$response->assertRedirectBackWithoutErrors();
```

<a name="assert-redirect-contains"></a>
#### assertRedirectContains

Xác nhận response đang redirect đến URI có chứa chuỗi đã cho:

```php
$response->assertRedirectContains($string);
```

<a name="assert-redirect-to-route"></a>
#### assertRedirectToRoute

Xác nhận response redirect đến [named route](/docs/{{version}}/routing#named-routes) đã cho:

```php
$response->assertRedirectToRoute($name, $parameters = []);
```

<a name="assert-redirect-to-signed-route"></a>
#### assertRedirectToSignedRoute

Xác nhận response redirect đến [signed route](/docs/{{version}}/urls#signed-urls) đã cho:

```php
$response->assertRedirectToSignedRoute($name = null, $parameters = []);
```

<a name="assert-request-timeout"></a>
#### assertRequestTimeout

Xác nhận response có mã trạng thái HTTP request timeout (408):

```php
$response->assertRequestTimeout();
```

<a name="assert-see"></a>
#### assertSee

Xác nhận chuỗi đã cho xuất hiện trong response. Assertion này sẽ tự động escape chuỗi đã cho, trừ khi bạn truyền đối số thứ hai là `false`:

```php
$response->assertSee($value, $escape = true);
```

<a name="assert-see-in-order"></a>
#### assertSeeInOrder

Xác nhận các chuỗi đã cho xuất hiện đúng thứ tự trong response. Assertion này sẽ tự động escape các chuỗi đã cho, trừ khi bạn truyền đối số thứ hai là `false`:

```php
$response->assertSeeInOrder(array $values, $escape = true);
```

<a name="assert-see-text"></a>
#### assertSeeText

Xác nhận chuỗi đã cho xuất hiện trong phần văn bản của response. Assertion này sẽ tự động escape chuỗi đã cho, trừ khi bạn truyền đối số thứ hai là `false`. Nội dung response sẽ được truyền qua hàm PHP `strip_tags` trước khi thực hiện assertion:

```php
$response->assertSeeText($value, $escape = true);
```

<a name="assert-see-text-in-order"></a>
#### assertSeeTextInOrder

Xác nhận các chuỗi đã cho xuất hiện đúng thứ tự trong phần văn bản của response. Assertion này sẽ tự động escape các chuỗi đã cho, trừ khi bạn truyền đối số thứ hai là `false`. Nội dung response sẽ được truyền qua hàm PHP `strip_tags` trước khi thực hiện assertion:

```php
$response->assertSeeTextInOrder(array $values, $escape = true);
```

<a name="assert-server-error"></a>
#### assertServerError

Xác nhận response có mã trạng thái HTTP thuộc nhóm server error (>= 500, < 600):

```php
$response->assertServerError();
```

<a name="assert-service-unavailable"></a>
#### assertServiceUnavailable

Xác nhận response có mã trạng thái HTTP "Service Unavailable" (503):

```php
$response->assertServiceUnavailable();
```

<a name="assert-session-has"></a>
#### assertSessionHas

Xác nhận session chứa dữ liệu đã cho:

```php
$response->assertSessionHas($key, $value = null);
```

Khi cần, bạn có thể truyền một closure làm argument thứ hai cho method `assertSessionHas`. Assertion sẽ pass nếu closure trả về `true`:

```php
$response->assertSessionHas($key, function (User $value) {
    return $value->name === 'Taylor Otwell';
});
```

<a name="assert-session-has-input"></a>
#### assertSessionHasInput

Xác nhận session có giá trị đã cho trong [mảng input được flash](/docs/{{version}}/responses#redirecting-with-flashed-session-data):

```php
$response->assertSessionHasInput($key, $value = null);
```

Khi cần, bạn có thể truyền một closure làm argument thứ hai cho method `assertSessionHasInput`. Assertion sẽ pass nếu closure trả về `true`:

```php
use Illuminate\Support\Facades\Crypt;

$response->assertSessionHasInput($key, function (string $value) {
    return Crypt::decryptString($value) === 'secret';
});
```

<a name="assert-session-has-all"></a>
#### assertSessionHasAll

Xác nhận session chứa mảng các cặp key / value đã cho:

```php
$response->assertSessionHasAll(array $data);
```

Ví dụ, nếu session của ứng dụng chứa các key `name` và `status`, bạn có thể xác nhận cả hai đều tồn tại và có các giá trị được chỉ định như sau:

```php
$response->assertSessionHasAll([
    'name' => 'Taylor Otwell',
    'status' => 'active',
]);
```

<a name="assert-session-has-errors"></a>
#### assertSessionHasErrors

Xác nhận session chứa lỗi đối với `$keys` đã cho. Nếu `$keys` là associative array, xác nhận session chứa thông báo lỗi cụ thể (value) cho từng field (key). Nên dùng phương thức này khi kiểm thử các route flash lỗi validation vào session thay vì trả chúng dưới dạng cấu trúc JSON:

```php
$response->assertSessionHasErrors(
    array $keys = [], $format = null, $errorBag = 'default'
);
```

Ví dụ, để xác nhận các field `name` và `email` có thông báo lỗi validation đã được flash vào session, bạn có thể gọi phương thức `assertSessionHasErrors` như sau:

```php
$response->assertSessionHasErrors(['name', 'email']);
```

Hoặc, bạn có thể xác nhận một field đã cho có thông báo lỗi validation cụ thể:

```php
$response->assertSessionHasErrors([
    'name' => 'The given name was invalid.'
]);
```

> [!NOTE]
> Method tổng quát hơn [assertInvalid](#assert-invalid) có thể được dùng để xác nhận response có validation error được trả về dưới dạng JSON **hoặc** error được flash vào session storage.

<a name="assert-session-has-errors-in"></a>
#### assertSessionHasErrorsIn

Xác nhận session chứa lỗi đối với `$keys` đã cho trong một [error bag](/docs/{{version}}/validation#named-error-bags) cụ thể. Nếu `$keys` là associative array, xác nhận session chứa thông báo lỗi cụ thể (value) cho từng field (key) trong error bag:

```php
$response->assertSessionHasErrorsIn($errorBag, $keys = [], $format = null);
```

<a name="assert-session-has-no-errors"></a>
#### assertSessionHasNoErrors

Xác nhận session không có lỗi validation:

```php
$response->assertSessionHasNoErrors();
```

<a name="assert-session-doesnt-have-errors"></a>
#### assertSessionDoesntHaveErrors

Xác nhận session không có lỗi validation đối với các key đã cho:

```php
$response->assertSessionDoesntHaveErrors($keys = [], $format = null, $errorBag = 'default');
```

> [!NOTE]
> Method tổng quát hơn [assertValid](#assert-valid) có thể được dùng để xác nhận response không có validation error được trả về dưới dạng JSON **và** không có error nào được flash vào session storage.

<a name="assert-session-missing"></a>
#### assertSessionMissing

Xác nhận session không chứa key đã cho:

```php
$response->assertSessionMissing($key);
```

<a name="assert-session-missing-input"></a>
#### assertSessionMissingInput

Xác nhận session không có input key đã cho trong mảng input được flash:

```php
$response->assertSessionMissingInput($key);
```

<a name="assert-status"></a>
#### assertStatus

Xác nhận response có mã trạng thái HTTP đã cho:

```php
$response->assertStatus($code);
```

<a name="assert-successful"></a>
#### assertSuccessful

Xác nhận response có mã trạng thái HTTP thành công (>= 200 và < 300):

```php
$response->assertSuccessful();
```

<a name="assert-too-many-requests"></a>
#### assertTooManyRequests

Xác nhận response có mã trạng thái HTTP too many requests (429):

```php
$response->assertTooManyRequests();
```

<a name="assert-unauthorized"></a>
#### assertUnauthorized

Xác nhận response có mã trạng thái HTTP unauthorized (401):

```php
$response->assertUnauthorized();
```

<a name="assert-unprocessable"></a>
#### assertUnprocessable

Xác nhận response có mã trạng thái HTTP unprocessable entity (422):

```php
$response->assertUnprocessable();
```

<a name="assert-unsupported-media-type"></a>
#### assertUnsupportedMediaType

Xác nhận response có mã trạng thái HTTP unsupported media type (415):

```php
$response->assertUnsupportedMediaType();
```

<a name="assert-valid"></a>
#### assertValid

Xác nhận response không có lỗi validation đối với các key đã cho. Phương thức này có thể dùng để assertion các response mà lỗi validation được trả về dưới dạng cấu trúc JSON hoặc đã được flash vào session:

```php
// Assert that no validation errors are present...
$response->assertValid();

// Assert that the given keys do not have validation errors...
$response->assertValid(['name', 'email']);
```

<a name="assert-invalid"></a>
#### assertInvalid

Xác nhận response có lỗi validation đối với các key đã cho. Phương thức này có thể dùng để assertion các response mà lỗi validation được trả về dưới dạng cấu trúc JSON hoặc đã được flash vào session:

```php
$response->assertInvalid(['name', 'email']);
```

Bạn cũng có thể xác nhận một key đã cho có thông báo lỗi validation cụ thể. Khi đó, bạn có thể cung cấp toàn bộ thông báo hoặc chỉ một phần nhỏ của thông báo:

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```

Nếu muốn xác nhận các field đã cho là những field duy nhất có lỗi validation, bạn có thể dùng phương thức `assertOnlyInvalid`:

```php
$response->assertOnlyInvalid(['name', 'email']);
```

<a name="assert-view-has"></a>
#### assertViewHas

Xác nhận view của response chứa dữ liệu đã cho:

```php
$response->assertViewHas($key, $value = null);
```

Truyền một closure làm đối số thứ hai cho phương thức `assertViewHas` cho phép bạn kiểm tra và thực hiện assertion trên một phần dữ liệu cụ thể của view:

```php
$response->assertViewHas('user', function (User $user) {
    return $user->name === 'Taylor';
});
```

Ngoài ra, dữ liệu view có thể được truy cập như các biến mảng trên response, giúp bạn kiểm tra thuận tiện:

```php tab=Pest
expect($response['name'])->toBe('Taylor');
```

```php tab=PHPUnit
$this->assertEquals('Taylor', $response['name']);
```

<a name="assert-view-has-all"></a>
#### assertViewHasAll

Xác nhận view của response có danh sách dữ liệu đã cho:

```php
$response->assertViewHasAll(array $data);
```

Phương thức này có thể dùng để xác nhận view đơn giản là chứa dữ liệu khớp với các key đã cho:

```php
$response->assertViewHasAll([
    'name',
    'email',
]);
```

Hoặc, bạn có thể xác nhận dữ liệu view tồn tại và có các giá trị cụ thể:

```php
$response->assertViewHasAll([
    'name' => 'Taylor Otwell',
    'email' => 'taylor@example.com,',
]);
```

<a name="assert-view-is"></a>
#### assertViewIs

Xác nhận route đã trả về view được chỉ định:

```php
$response->assertViewIs($value);
```

<a name="assert-view-missing"></a>
#### assertViewMissing

Xác nhận data key đã cho không được cung cấp cho view trong response của ứng dụng:

```php
$response->assertViewMissing($key);
```

<a name="authentication-assertions"></a>
### Assertion xác thực

Laravel cũng cung cấp nhiều assertion liên quan đến xác thực mà bạn có thể sử dụng trong feature test của ứng dụng. Lưu ý rằng các phương thức này được gọi trực tiếp trên test class, không phải trên instance `Illuminate\Testing\TestResponse` được trả về bởi các phương thức như `get` và `post`.

<a name="assert-authenticated"></a>
#### assertAuthenticated

Xác nhận một user đã được xác thực:

```php
$this->assertAuthenticated($guard = null);
```

<a name="assert-guest"></a>
#### assertGuest

Xác nhận một user chưa được xác thực:

```php
$this->assertGuest($guard = null);
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

Xác nhận một user cụ thể đã được xác thực:

```php
$this->assertAuthenticatedAs($user, $guard = null);
```

<a name="validation-assertions"></a>
## Assertion validation

Laravel cung cấp hai assertion chính liên quan đến validation mà bạn có thể dùng để đảm bảo dữ liệu được cung cấp trong request là hợp lệ hoặc không hợp lệ.

<a name="validation-assert-valid"></a>
#### assertValid

Xác nhận response không có lỗi validation đối với các key đã cho. Phương thức này có thể dùng để assertion các response mà lỗi validation được trả về dưới dạng cấu trúc JSON hoặc đã được flash vào session:

```php
// Assert that no validation errors are present...
$response->assertValid();

// Assert that the given keys do not have validation errors...
$response->assertValid(['name', 'email']);
```

<a name="validation-assert-invalid"></a>
#### assertInvalid

Xác nhận response có lỗi validation đối với các key đã cho. Phương thức này có thể dùng để assertion các response mà lỗi validation được trả về dưới dạng cấu trúc JSON hoặc đã được flash vào session:

```php
$response->assertInvalid(['name', 'email']);
```

Bạn cũng có thể xác nhận một key đã cho có thông báo lỗi validation cụ thể. Khi đó, bạn có thể cung cấp toàn bộ thông báo hoặc chỉ một phần nhỏ của thông báo:

```php
$response->assertInvalid([
    'name' => 'The name field is required.',
    'email' => 'valid email address',
]);
```
