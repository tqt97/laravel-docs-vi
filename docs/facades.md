# Facades

<a name="introduction"></a>
## Giới thiệu
Trong tài liệu Laravel, bạn sẽ thường thấy code tương tác với feature của Laravel thông qua "facade". Facade cung cấp interface dạng "static" tới các class đang có trong [service container](/docs/{{version}}/container). Laravel đi kèm nhiều facade, cho phép truy cập gần như toàn bộ feature của framework.
Facade Laravel đóng vai trò "static proxy" tới class bên dưới trong service container. Chúng cho syntax ngắn gọn, biểu đạt tốt nhưng vẫn giữ khả năng kiểm thử và linh hoạt hơn static method truyền thống. Nếu chưa hiểu hoàn toàn facade hoạt động thế nào cũng không sao; bạn có thể tiếp tục học và quay lại phần này sau.
Toàn bộ facade của Laravel được định nghĩa trong namespace `Illuminate\Support\Facades`. Vì vậy, có thể truy cập facade như sau:
```php
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/cache', function () {
    return Cache::get('key');
});
```
Trong tài liệu Laravel, nhiều ví dụ sử dụng facade để minh họa các feature khác nhau của framework.
<a name="helper-functions"></a>
#### Helper Functions
Bên cạnh facade, Laravel cung cấp nhiều global "helper function" giúp tương tác với feature phổ biến dễ hơn nữa. Một số helper thường gặp gồm `view`, `response`, `url`, `config`, v.v. Mỗi helper được mô tả cùng feature tương ứng; danh sách đầy đủ nằm trong [tài liệu Helpers](/docs/{{version}}/helpers).
Ví dụ, thay vì dùng facade `Illuminate\Support\Facades\Response` để tạo JSON response, bạn có thể dùng trực tiếp function `response`. Vì helper function có sẵn toàn cục, không cần import class để sử dụng:
```php
use Illuminate\Support\Facades\Response;

Route::get('/users', function () {
    return Response::json([
        // ...
    ]);
});

Route::get('/users', function () {
    return response()->json([
        // ...
    ]);
});
```

<a name="when-to-use-facades"></a>
## Khi nào nên sử dụng Facade
Facade có nhiều lợi ích. Chúng cung cấp syntax ngắn gọn, dễ nhớ, cho phép sử dụng feature Laravel mà không cần ghi nhớ tên class dài để inject hoặc cấu hình thủ công. Ngoài ra, nhờ cách sử dụng dynamic method của PHP, facade cũng dễ kiểm thử.
Tuy nhiên, cần thận trọng khi dùng facade. Rủi ro chính là class bị "scope creep" — phạm vi trách nhiệm phình to. Vì facade quá dễ dùng và không cần injection, một class có thể dần gọi quá nhiều facade. Với dependency injection, constructor quá lớn là tín hiệu trực quan cho thấy class đang có quá nhiều trách nhiệm. Vì vậy khi dùng facade, hãy chú ý kích thước class và giữ trách nhiệm đủ hẹp. Nếu class trở nên quá lớn, cân nhắc tách thành nhiều class nhỏ hơn.
<a name="facades-vs-dependency-injection"></a>
### Facade và dependency injection
Một lợi ích chính của dependency injection là có thể thay implementation của class được inject. Điều này hữu ích khi test vì bạn có thể inject mock hoặc stub và assertion các method được gọi trên stub.
Thông thường, static method thực sự không thể dễ dàng mock hoặc stub. Tuy nhiên, facade sử dụng dynamic method để proxy lời gọi tới object được resolve từ service container, nên facade vẫn có thể được test tương tự class instance được inject. Ví dụ, với route sau:
```php
use Illuminate\Support\Facades\Cache;

Route::get('/cache', function () {
    return Cache::get('key');
});
```
Dùng các phương thức test facade của Laravel, ta có thể viết test xác minh `Cache::get` đã được gọi với argument mong đợi:
```php tab=Pest
use Illuminate\Support\Facades\Cache;

test('basic example', function () {
    Cache::shouldReceive('get')
        ->with('key')
        ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
});
```

```php tab=PHPUnit
use Illuminate\Support\Facades\Cache;

/**
 * A basic functional test example.
 */
public function test_basic_example(): void
{
    Cache::shouldReceive('get')
        ->with('key')
        ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
}
```

<a name="facades-vs-helper-functions"></a>
### Facade và hàm helper
Ngoài facade, Laravel có nhiều helper function thực hiện tác vụ phổ biến như tạo view, fire event, dispatch job hoặc gửi HTTP response. Nhiều helper thực hiện chức năng tương đương facade tương ứng. Ví dụ hai lời gọi sau là tương đương:
```php
return Illuminate\Support\Facades\View::make('profile');

return view('profile');
```
Về thực tế không có khác biệt đáng kể giữa facade và helper function. Khi dùng helper, bạn vẫn có thể test giống facade tương ứng. Ví dụ, với route sau:
```php
Route::get('/cache', function () {
    return cache('key');
});
```
Helper `cache` sẽ gọi phương thức `get` trên class bên dưới facade `Cache`. Vì vậy dù dùng helper function, ta vẫn có thể viết test xác minh method được gọi với argument mong đợi:
```php
use Illuminate\Support\Facades\Cache;

/**
 * A basic functional test example.
 */
public function test_basic_example(): void
{
    Cache::shouldReceive('get')
        ->with('key')
        ->andReturn('value');

    $response = $this->get('/cache');

    $response->assertSee('value');
}
```

<a name="how-facades-work"></a>
## Facade hoạt động như thế nào
Trong ứng dụng Laravel, facade là class cung cấp quyền truy cập tới một object trong container. Cơ chế này được triển khai trong class `Facade`. Facade có sẵn của Laravel và custom facade bạn tạo đều kế thừa base class `Illuminate\Support\Facades\Facade`.
Base class `Facade` sử dụng magic method `__callStatic()` để chuyển lời gọi từ facade tới object được resolve trong container. Ở ví dụ dưới, code gọi hệ thống cache của Laravel. Nhìn qua có thể tưởng rằng static method `get` đang được gọi trực tiếp trên class `Cache`:
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     */
    public function showProfile(string $id): View
    {
        $user = Cache::get('user:'.$id);

        return view('profile', ['user' => $user]);
    }
}
```
Lưu ý ở đầu file ta "import" facade `Cache`. Facade này là proxy để truy cập implementation bên dưới của interface `Illuminate\Contracts\Cache\Factory`. Mọi lời gọi qua facade được chuyển tới instance của cache service Laravel.
Nếu nhìn vào class `Illuminate\Support\Facades\Cache`, bạn sẽ thấy không hề có static method `get`:
```php
class Cache extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return 'cache';
    }
}
```
Thay vào đó, facade `Cache` kế thừa base class `Facade` và định nghĩa `getFacadeAccessor()`. Phương thức này trả tên service container binding. Khi người dùng gọi bất kỳ static method nào trên facade `Cache`, Laravel resolve binding `cache` từ [service container](/docs/{{version}}/container) rồi chạy method được yêu cầu — trong trường hợp này là `get` — trên object đó.
<a name="real-time-facades"></a>
## Facade thời gian thực
Với real-time facade, bạn có thể sử dụng bất kỳ class nào trong ứng dụng như facade. Để minh họa, trước tiên hãy xem code không dùng real-time facade. Giả sử model `Podcast` có method `publish`, nhưng để publish podcast ta cần inject instance `Publisher`:
```php
<?php

namespace App\Models;

use App\Contracts\Publisher;
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publish the podcast.
     */
    public function publish(Publisher $publisher): void
    {
        $this->update(['publishing' => now()]);

        $publisher->publish($this);
    }
}
```
Inject implementation publisher vào method giúp dễ test method độc lập vì có thể mock publisher. Tuy nhiên, ta phải luôn truyền publisher instance mỗi lần gọi `publish`. Real-time facade giữ cùng khả năng test nhưng không yêu cầu truyền `Publisher` tường minh. Để tạo real-time facade, thêm prefix `Facades` vào namespace của class được import:
```php
<?php

namespace App\Models;

use App\Contracts\Publisher; // [tl! remove]
use Facades\App\Contracts\Publisher; // [tl! add]
use Illuminate\Database\Eloquent\Model;

class Podcast extends Model
{
    /**
     * Publish the podcast.
     */
    public function publish(Publisher $publisher): void // [tl! remove]
    public function publish(): void // [tl! add]
    {
        $this->update(['publishing' => now()]);

        $publisher->publish($this); // [tl! remove]
        Publisher::publish($this); // [tl! add]
    }
}
```
Khi real-time facade được dùng, implementation publisher được resolve từ service container dựa trên phần interface hoặc class name nằm sau prefix `Facades`. Khi test, bạn có thể dùng helper test facade có sẵn của Laravel để mock lời gọi method này:
```php tab=Pest
<?php

use App\Models\Podcast;
use Facades\App\Contracts\Publisher;
use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->use(RefreshDatabase::class);

test('podcast can be published', function () {
    $podcast = Podcast::factory()->create();

    Publisher::shouldReceive('publish')->once()->with($podcast);

    $podcast->publish();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Models\Podcast;
use Facades\App\Contracts\Publisher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PodcastTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A test example.
     */
    public function test_podcast_can_be_published(): void
    {
        $podcast = Podcast::factory()->create();

        Publisher::shouldReceive('publish')->once()->with($podcast);

        $podcast->publish();
    }
}
```

<a name="facade-class-reference"></a>
## Danh sách Facade Class
Bên dưới là toàn bộ facade và class nằm phía sau chúng. Đây là tài liệu tra cứu nhanh hữu ích khi cần đi sâu vào API của một facade root. Key [service container binding](/docs/{{version}}/container) cũng được liệt kê khi có.
<div class="overflow-auto">

| Facade | Class | Service Container Binding |
| --- | --- | --- |
| App | [Illuminate\Foundation\Application](https://api.laravel.com/docs/{{version}}/Illuminate/Foundation/Application.html) | `app` |
| Artisan | [Illuminate\Contracts\Console\Kernel](https://api.laravel.com/docs/{{version}}/Illuminate/Contracts/Console/Kernel.html) | `artisan` |
| Auth (Instance) | [Illuminate\Contracts\Auth\Guard](https://api.laravel.com/docs/{{version}}/Illuminate/Contracts/Auth/Guard.html) | `auth.driver` |
| Auth | [Illuminate\Auth\AuthManager](https://api.laravel.com/docs/{{version}}/Illuminate/Auth/AuthManager.html) | `auth` |
| Blade | [Illuminate\View\Compilers\BladeCompiler](https://api.laravel.com/docs/{{version}}/Illuminate/View/Compilers/BladeCompiler.html) | `blade.compiler` |
| Broadcast (Instance) | [Illuminate\Contracts\Broadcasting\Broadcaster](https://api.laravel.com/docs/{{version}}/Illuminate/Contracts/Broadcasting/Broadcaster.html) | &nbsp; |
| Broadcast | [Illuminate\Contracts\Broadcasting\Factory](https://api.laravel.com/docs/{{version}}/Illuminate/Contracts/Broadcasting/Factory.html) | &nbsp; |
| Bus | [Illuminate\Contracts\Bus\Dispatcher](https://api.laravel.com/docs/{{version}}/Illuminate/Contracts/Bus/Dispatcher.html) | &nbsp; |
| Cache (Instance) | [Illuminate\Cache\Repository](https://api.laravel.com/docs/{{version}}/Illuminate/Cache/Repository.html) | `cache.store` |
| Cache | [Illuminate\Cache\CacheManager](https://api.laravel.com/docs/{{version}}/Illuminate/Cache/CacheManager.html) | `cache` |
| Cloud | [Illuminate\Foundation\Cloud\CloudManager](https://api.laravel.com/docs/{{version}}/Illuminate/Foundation/Cloud/CloudManager.html) | &nbsp; |
| Config | [Illuminate\Config\Repository](https://api.laravel.com/docs/{{version}}/Illuminate/Config/Repository.html) | `config` |
| Context | [Illuminate\Log\Context\Repository](https://api.laravel.com/docs/{{version}}/Illuminate/Log/Context/Repository.html) | &nbsp; |
| Cookie | [Illuminate\Cookie\CookieJar](https://api.laravel.com/docs/{{version}}/Illuminate/Cookie/CookieJar.html) | `cookie` |
| Crypt | [Illuminate\Encryption\Encrypter](https://api.laravel.com/docs/{{version}}/Illuminate/Encryption/Encrypter.html) | `encrypter` |
| Date | [Illuminate\Support\DateFactory](https://api.laravel.com/docs/{{version}}/Illuminate/Support/DateFactory.html) | `date` |
| DB (Instance) | [Illuminate\Database\Connection](https://api.laravel.com/docs/{{version}}/Illuminate/Database/Connection.html) | `db.connection` |
| DB | [Illuminate\Database\DatabaseManager](https://api.laravel.com/docs/{{version}}/Illuminate/Database/DatabaseManager.html) | `db` |
| Event | [Illuminate\Events\Dispatcher](https://api.laravel.com/docs/{{version}}/Illuminate/Events/Dispatcher.html) | `events` |
| Exceptions (Instance) | [Illuminate\Contracts\Debug\ExceptionHandler](https://api.laravel.com/docs/{{version}}/Illuminate/Contracts/Debug/ExceptionHandler.html) | &nbsp; |
| Exceptions | [Illuminate\Foundation\Exceptions\Handler](https://api.laravel.com/docs/{{version}}/Illuminate/Foundation/Exceptions/Handler.html) | &nbsp; |
| File | [Illuminate\Filesystem\Filesystem](https://api.laravel.com/docs/{{version}}/Illuminate/Filesystem/Filesystem.html) | `files` |
| Gate | [Illuminate\Contracts\Auth\Access\Gate](https://api.laravel.com/docs/{{version}}/Illuminate/Contracts/Auth/Access/Gate.html) | &nbsp; |
| Hash | [Illuminate\Contracts\Hashing\Hasher](https://api.laravel.com/docs/{{version}}/Illuminate/Contracts/Hashing/Hasher.html) | `hash` |
| Http | [Illuminate\Http\Client\Factory](https://api.laravel.com/docs/{{version}}/Illuminate/Http/Client/Factory.html) | &nbsp; |
| Lang | [Illuminate\Translation\Translator](https://api.laravel.com/docs/{{version}}/Illuminate/Translation/Translator.html) | `translator` |
| Log | [Illuminate\Log\LogManager](https://api.laravel.com/docs/{{version}}/Illuminate/Log/LogManager.html) | `log` |
| Mail | [Illuminate\Mail\Mailer](https://api.laravel.com/docs/{{version}}/Illuminate/Mail/Mailer.html) | `mailer` |
| Notification | [Illuminate\Notifications\ChannelManager](https://api.laravel.com/docs/{{version}}/Illuminate/Notifications/ChannelManager.html) | &nbsp; |
| Password (Instance) | [Illuminate\Auth\Passwords\PasswordBroker](https://api.laravel.com/docs/{{version}}/Illuminate/Auth/Passwords/PasswordBroker.html) | `auth.password.broker` |
| Password | [Illuminate\Auth\Passwords\PasswordBrokerManager](https://api.laravel.com/docs/{{version}}/Illuminate/Auth/Passwords/PasswordBrokerManager.html) | `auth.password` |
| Pipeline (Instance) | [Illuminate\Pipeline\Pipeline](https://api.laravel.com/docs/{{version}}/Illuminate/Pipeline/Pipeline.html) | &nbsp; |
| Process | [Illuminate\Process\Factory](https://api.laravel.com/docs/{{version}}/Illuminate/Process/Factory.html) | &nbsp; |
| Queue (Base Class) | [Illuminate\Queue\Queue](https://api.laravel.com/docs/{{version}}/Illuminate/Queue/Queue.html) | &nbsp; |
| Queue (Instance) | [Illuminate\Contracts\Queue\Queue](https://api.laravel.com/docs/{{version}}/Illuminate/Contracts/Queue/Queue.html) | `queue.connection` |
| Queue | [Illuminate\Queue\QueueManager](https://api.laravel.com/docs/{{version}}/Illuminate/Queue/QueueManager.html) | `queue` |
| RateLimiter | [Illuminate\Cache\RateLimiter](https://api.laravel.com/docs/{{version}}/Illuminate/Cache/RateLimiter.html) | &nbsp; |
| Redirect | [Illuminate\Routing\Redirector](https://api.laravel.com/docs/{{version}}/Illuminate/Routing/Redirector.html) | `redirect` |
| Redis (Instance) | [Illuminate\Redis\Connections\Connection](https://api.laravel.com/docs/{{version}}/Illuminate/Redis/Connections/Connection.html) | `redis.connection` |
| Redis | [Illuminate\Redis\RedisManager](https://api.laravel.com/docs/{{version}}/Illuminate/Redis/RedisManager.html) | `redis` |
| Request | [Illuminate\Http\Request](https://api.laravel.com/docs/{{version}}/Illuminate/Http/Request.html) | `request` |
| Response (Instance) | [Illuminate\Http\Response](https://api.laravel.com/docs/{{version}}/Illuminate/Http/Response.html) | &nbsp; |
| Response | [Illuminate\Contracts\Routing\ResponseFactory](https://api.laravel.com/docs/{{version}}/Illuminate/Contracts/Routing/ResponseFactory.html) | &nbsp; |
| Route | [Illuminate\Routing\Router](https://api.laravel.com/docs/{{version}}/Illuminate/Routing/Router.html) | `router` |
| Schedule | [Illuminate\Console\Scheduling\Schedule](https://api.laravel.com/docs/{{version}}/Illuminate/Console/Scheduling/Schedule.html) | &nbsp; |
| Schema | [Illuminate\Database\Schema\Builder](https://api.laravel.com/docs/{{version}}/Illuminate/Database/Schema/Builder.html) | &nbsp; |
| Session (Instance) | [Illuminate\Session\Store](https://api.laravel.com/docs/{{version}}/Illuminate/Session/Store.html) | `session.store` |
| Session | [Illuminate\Session\SessionManager](https://api.laravel.com/docs/{{version}}/Illuminate/Session/SessionManager.html) | `session` |
| Storage (Instance) | [Illuminate\Contracts\Filesystem\Filesystem](https://api.laravel.com/docs/{{version}}/Illuminate/Contracts/Filesystem/Filesystem.html) | `filesystem.disk` |
| Storage | [Illuminate\Filesystem\FilesystemManager](https://api.laravel.com/docs/{{version}}/Illuminate/Filesystem/FilesystemManager.html) | `filesystem` |
| URL | [Illuminate\Routing\UrlGenerator](https://api.laravel.com/docs/{{version}}/Illuminate/Routing/UrlGenerator.html) | `url` |
| Validator (Instance) | [Illuminate\Validation\Validator](https://api.laravel.com/docs/{{version}}/Illuminate/Validation/Validator.html) | &nbsp; |
| Validator | [Illuminate\Validation\Factory](https://api.laravel.com/docs/{{version}}/Illuminate/Validation/Factory.html) | `validator` |
| View (Instance) | [Illuminate\View\View](https://api.laravel.com/docs/{{version}}/Illuminate/View/View.html) | &nbsp; |
| View | [Illuminate\View\Factory](https://api.laravel.com/docs/{{version}}/Illuminate/View/Factory.html) | `view` |
| Vite | [Illuminate\Foundation\Vite](https://api.laravel.com/docs/{{version}}/Illuminate/Foundation/Vite.html) | &nbsp; |

</div>
