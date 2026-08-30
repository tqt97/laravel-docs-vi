# Mocking

<a name="introduction"></a>
## Giới thiệu
Khi kiểm thử ứng dụng Laravel, đôi lúc bạn cần "mock" một số phần để chúng không thực sự được thực thi trong test. Ví dụ, khi kiểm thử controller có dispatch event, bạn có thể muốn mock event listener để chúng không thực sự được thực thi trong quá trình test. Nhờ đó, bạn chỉ cần kiểm thử HTTP response của controller mà không phải bận tâm đến việc thực thi các event listener, bởi các listener có thể được kiểm thử trong test case riêng.
Laravel cung cấp sẵn các phương thức hữu ích để mock event, job và các facade khác. Các helper này chủ yếu là một lớp tiện ích trên Mockery, giúp bạn tránh phải tự viết những lời gọi Mockery phức tạp.
<a name="mocking-objects"></a>
## Mocking đối tượng
Khi mock một object sẽ được inject vào ứng dụng thông qua [service container](/container), bạn cần bind instance mock vào container dưới dạng binding `instance`. Điều này yêu cầu container sử dụng object mock của bạn thay vì tự khởi tạo object thật:
```php tab=Pest
use App\Service;
use Mockery;
use Mockery\MockInterface;

test('something can be mocked', function () {
    $this->instance(
        Service::class,
        Mockery::mock(Service::class, function (MockInterface $mock) {
            $mock->expects('process');
        })
    );
});
```

```php tab=PHPUnit
use App\Service;
use Mockery;
use Mockery\MockInterface;

public function test_something_can_be_mocked(): void
{
    $this->instance(
        Service::class,
        Mockery::mock(Service::class, function (MockInterface $mock) {
            $mock->expects('process');
        })
    );
}
```
Để thao tác thuận tiện hơn, bạn có thể dùng phương thức `mock` được cung cấp bởi base test case của Laravel. Ví dụ dưới đây tương đương với ví dụ phía trên:
```php
use App\Service;
use Mockery\MockInterface;

$mock = $this->mock(Service::class, function (MockInterface $mock) {
    $mock->expects('process');
});
```
Bạn có thể dùng `partialMock` khi chỉ cần mock một vài method của object. Những method không bị mock vẫn được thực thi bình thường khi được gọi:
```php
use App\Service;
use Mockery\MockInterface;

$mock = $this->partialMock(Service::class, function (MockInterface $mock) {
    $mock->expects('process');
});
```
Tương tự, nếu muốn [spy](http://docs.mockery.io/en/latest/reference/spies.html) một object, base test case của Laravel cung cấp phương thức `spy` như một wrapper tiện lợi quanh `Mockery::spy`. Spy tương tự mock, nhưng nó ghi lại các tương tác giữa spy và code đang được test, nhờ đó bạn có thể thực hiện assertion sau khi code đã thực thi:
```php
use App\Service;

$spy = $this->spy(Service::class);

// ...

$spy->shouldHaveReceived('process');
```

<a name="mocking-facades"></a>
## Mocking facade
Khác với lời gọi static method truyền thống, [facade](/facades) — bao gồm cả [real-time facade](/facades#real-time-facades) — có thể được mock. Đây là lợi thế lớn so với static method thông thường và mang lại khả năng kiểm thử tương tự dependency injection truyền thống. Khi test, bạn thường có thể muốn mock lời gọi tới một Laravel facade xuất hiện trong controller. Ví dụ, hãy xem action controller sau:
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * Retrieve a list of all users of the application.
     */
    public function index(): array
    {
        $value = Cache::get('key');

        return [
            // ...
        ];
    }
}
```
Bạn có thể mock lời gọi tới facade `Cache` bằng phương thức `expects`, phương thức này trả về một instance mock của [Mockery](https://github.com/padraic/mockery). Vì facade thực chất được resolve và quản lý bởi [service container](/container), chúng dễ kiểm thử hơn nhiều so với một static class thông thường. Ví dụ, hãy mock lời gọi tới phương thức `get` của facade `Cache`:
```php tab=Pest
<?php

use Illuminate\Support\Facades\Cache;

test('get index', function () {
    Cache::expects('get')
        ->with('key')
        ->andReturn('value');

    $response = $this->get('/users');

    // ...
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    public function test_get_index(): void
    {
        Cache::expects('get')
            ->with('key')
            ->andReturn('value');

        $response = $this->get('/users');

        // ...
    }
}
```
> [!WARNING]
> Bạn không nên mock facade `Request`. Thay vào đó, hãy truyền input mong muốn vào các [HTTP testing method](/http-tests) như `get` và `post` khi chạy test. Tương tự, thay vì mock facade `Config`, hãy gọi `Config::set` trong test.
<a name="facade-spies"></a>
### Spy facade
Nếu muốn [spy](http://docs.mockery.io/en/latest/reference/spies.html) một facade, bạn có thể gọi phương thức `spy` trên facade tương ứng. Spy tương tự mock, nhưng nó ghi lại mọi tương tác giữa spy và code đang được test, cho phép bạn thực hiện assertion sau khi code đã chạy:
```php tab=Pest
<?php

use Illuminate\Support\Facades\Cache;

test('values are stored in cache', function () {
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->with('name', 'Taylor', 10);
});
```

```php tab=PHPUnit
use Illuminate\Support\Facades\Cache;

public function test_values_are_stored_in_cache(): void
{
    Cache::spy();

    $response = $this->get('/');

    $response->assertStatus(200);

    Cache::shouldHaveReceived('put')->with('name', 'Taylor', 10);
}
```

<a name="interacting-with-time"></a>
## Tương tác với thời gian
Khi test, đôi lúc bạn cần thay đổi thời gian được trả về bởi helper như `now` hoặc `Illuminate\Support\Carbon::now()`. Base feature test class của Laravel cung cấp các helper để thao tác thời gian hiện tại:
```php tab=Pest
test('time can be manipulated', function () {
    // Travel into the future...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // Travel into the past...
    $this->travel(-5)->hours();

    // Travel to an explicit time...
    $this->travelTo(now()->minus(hours: 6));

    // Return back to the present time...
    $this->travelBack();
});
```

```php tab=PHPUnit
public function test_time_can_be_manipulated(): void
{
    // Travel into the future...
    $this->travel(5)->milliseconds();
    $this->travel(5)->seconds();
    $this->travel(5)->minutes();
    $this->travel(5)->hours();
    $this->travel(5)->days();
    $this->travel(5)->weeks();
    $this->travel(5)->years();

    // Travel into the past...
    $this->travel(-5)->hours();

    // Travel to an explicit time...
    $this->travelTo(now()->minus(hours: 6));

    // Return back to the present time...
    $this->travelBack();
}
```
Bạn cũng có thể truyền closure cho các phương thức time travel. Closure sẽ được gọi trong khi thời gian đang bị đóng băng tại mốc chỉ định. Sau khi closure thực thi xong, thời gian tiếp tục chạy bình thường:
```php
$this->travel(5)->days(function () {
    // Test something five days into the future...
});

$this->travelTo(now()->mins(days: 10), function () {
    // Test something during a given moment...
});
```
Phương thức `freezeTime` có thể dùng để đóng băng thời gian hiện tại. Tương tự, `freezeSecond` cũng đóng băng thời gian nhưng tại thời điểm bắt đầu của giây hiện tại:
```php
use Illuminate\Support\Carbon;

// Freeze time and resume normal time after executing closure...
$this->freezeTime(function (Carbon $time) {
    // ...
});

// Freeze time at the current second and resume normal time after executing closure...
$this->freezeSecond(function (Carbon $time) {
    // ...
})
```
Như bạn có thể hình dung, các phương thức trên đặc biệt hữu ích khi kiểm thử hành vi nhạy cảm với thời gian của ứng dụng, chẳng hạn việc khóa các bài viết không còn hoạt động trên diễn đàn:
```php tab=Pest
use App\Models\Thread;

test('forum threads lock after one week of inactivity', function () {
    $thread = Thread::factory()->create();

    $this->travel(1)->week();

    expect($thread->isLockedByInactivity())->toBeTrue();
});
```

```php tab=PHPUnit
use App\Models\Thread;

public function test_forum_threads_lock_after_one_week_of_inactivity()
{
    $thread = Thread::factory()->create();

    $this->travel(1)->week();

    $this->assertTrue($thread->isLockedByInactivity());
}
```
