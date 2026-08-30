# HTTP Session

<a name="introduction"></a>

## Giới thiệu

Vì ứng dụng dựa trên HTTP có tính stateless, session cung cấp cách lưu thông tin người dùng qua nhiều request. Dữ liệu này thường được lưu trong một persistent store / backend để các request sau có thể truy cập lại.
Laravel đi kèm nhiều session backend khác nhau nhưng được truy cập thông qua một API thống nhất và dễ dùng. Các backend phổ biến như [Memcached](https://memcached.org), [Redis](https://redis.io) và database đều được hỗ trợ.
<a name="configuration"></a>
Vì ứng dụng dựa trên HTTP có tính stateless, session cung cấp cách lưu thông tin người dùng qua nhiều request. Dữ liệu này thường được lưu trong một persistent store / backend để các request sau có thể truy cập lại.
Laravel đi kèm nhiều session backend khác nhau nhưng được truy cập thông qua một API thống nhất và dễ dùng. Các backend phổ biến như [Memcached](https://memcached.org), [Redis](https://redis.io) và database đều được hỗ trợ.
> [!NOTE]
> Driver `array` chủ yếu dùng trong [testing](/docs/{{version}}/testing) và không persist dữ liệu session.
<a name="driver-prerequisites"></a>
Cấu hình session của ứng dụng nằm trong `config/session.php`. Bạn nên xem qua các option có sẵn. Mặc định, Laravel dùng session driver `database`.
<a name="database"></a>

#### Database

Khi dùng session driver `database`, bạn cần đảm bảo database có table để lưu session data. Table này thường đã được tạo trong migration mặc định `0001_01_01_000000_create_users_table.php`; nếu chưa có table `sessions`, dùng Artisan command `make:session-table` để tạo migration:

```shell
php artisan make:session-table

php artisan migrate
```

<a name="redis"></a>

#### Redis

Trước khi dùng Redis session với Laravel, bạn cần cài extension PHP PhpRedis qua PECL hoặc package `predis/predis` qua Composer. Xem [tài liệu Redis](/docs/{{version}}/redis#configuration) để biết cách cấu hình.
> [!NOTE]
> Biến môi trường `SESSION_CONNECTION`, hoặc option `connection` trong `session.php`, dùng để chỉ định Redis connection dành cho session storage.
<a name="interacting-with-the-session"></a>

## Làm việc với session

<a name="retrieving-data"></a>
Khi dùng session driver `database`, bạn cần đảm bảo database có table để lưu session data. Table này thường đã được tạo trong migration mặc định `0001_01_01_000000_create_users_table.php`; nếu chưa có table `sessions`, dùng Artisan command `make:session-table` để tạo migration:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     */
    public function show(Request $request, string $id): View
    {
        $value = $request->session()->get('key');

        // ...

        $user = $this->users->find($id);

        return view('user.profile', ['user' => $user]);
    }
}
```

Khi lấy một item từ session, bạn có thể truyền default value làm đối số thứ hai của `get`. Giá trị này được trả về nếu key không tồn tại. Nếu default value là closure và key không tồn tại, closure sẽ được thực thi và kết quả của nó được trả về:

```php
$value = $request->session()->get('key', 'default');

$value = $request->session()->get('key', function () {
    return 'default';
});
```

#### Redis

<a name="the-global-session-helper"></a>
> [!NOTE]
> Biến môi trường `SESSION_CONNECTION`, hoặc option `connection` trong `session.php`, dùng để chỉ định Redis connection dành cho session storage.

```php
Route::get('/home', function () {
    // Retrieve a piece of data from the session...
    $value = session('key');

    // Specifying a default value...
    $value = session('key', 'default');

    // Store a piece of data in the session...
    session(['key' => 'value']);
});
```

## Làm việc với session

<a name="retrieving-all-session-data"></a>

### Lấy dữ liệu

```php
$data = $request->session()->all();
```

<a name="retrieving-a-portion-of-the-session-data"></a>

#### Lấy một phần session data

Các method `only` và `except` dùng để lấy một tập con dữ liệu session:

```php
$data = $request->session()->only(['username', 'email']);

$data = $request->session()->except(['username', 'email']);
```

<a name="determining-if-an-item-exists-in-the-session"></a>
Bạn cũng có thể dùng global PHP function `session` để lấy và lưu dữ liệu. Khi gọi với một string duy nhất, helper trả về giá trị của session key đó. Khi gọi với mảng key / value, các giá trị sẽ được lưu vào session:

```php
if ($request->session()->has('users')) {
    // ...
}
```

> [!NOTE]
> Về thực tế, dùng session qua HTTP request instance hay global helper `session` gần như không khác biệt. Cả hai đều có thể [test](/docs/{{version}}/testing) bằng method `assertSessionHas` có sẵn trong test case.

```php
if ($request->session()->exists('users')) {
    // ...
}
```

#### Lấy toàn bộ session data

```php
if ($request->session()->missing('users')) {
    // ...
}
```

<a name="storing-data"></a>

### Lưu dữ liệu

Để lưu dữ liệu vào session, thông thường dùng method `put` trên request instance hoặc global helper `session`:

```php
// Via a request instance...
$request->session()->put('key', 'value');

// Via the global "session" helper...
session(['key' => 'value']);
```

Các method `only` và `except` dùng để lấy một tập con dữ liệu session:
<a name="pushing-to-array-session-values"></a>

#### Thêm phần tử vào giá trị session dạng array

Method `push` dùng để thêm giá trị mới vào session item dạng array. Ví dụ, nếu key `user.teams` chứa mảng tên team, bạn có thể thêm phần tử như sau:

```php
$request->session()->push('user.teams', 'developers');
```

#### Kiểm tra item có tồn tại trong session

<a name="retrieving-deleting-an-item"></a>

#### Lấy và xóa item

Method `pull` lấy và xóa item khỏi session trong cùng một câu lệnh:

```php
$value = $request->session()->pull('key', 'default');
```

<a name="incrementing-and-decrementing-session-values"></a>

#### Tăng và giảm giá trị session

Nếu session data chứa integer cần tăng hoặc giảm, dùng các method `increment` và `decrement`:

```php
$request->session()->increment('count');

$request->session()->increment('count', $incrementBy = 2);

$request->session()->decrement('count');

$request->session()->decrement('count', $decrementBy = 2);
```

<a name="flash-data"></a>
Để lưu dữ liệu vào session, thông thường dùng method `put` trên request instance hoặc global helper `session`:

```php
$request->session()->flash('status', 'Task was successful!');
```

Nếu cần giữ flash data qua thêm một vài request, dùng `reflash` để giữ toàn bộ flash data thêm một request. Nếu chỉ muốn giữ một số key cụ thể, dùng `keep`:

```php
$request->session()->reflash();

$request->session()->keep(['username', 'email']);
```

#### Thêm phần tử vào giá trị session dạng array

```php
$request->session()->now('status', 'Task was successful!');
```

<a name="deleting-data"></a>

### Xóa dữ liệu

Method `forget` xóa một phần dữ liệu khỏi session. Để xóa toàn bộ session data, dùng `flush`:

```php
// Forget a single key...
$request->session()->forget('name');

// Forget multiple keys...
$request->session()->forget(['name', 'status']);

$request->session()->flush();
```

Method `pull` lấy và xóa item khỏi session trong cùng một câu lệnh:
<a name="regenerating-the-session-id"></a>

### Tạo lại session ID

Regenerate session ID thường được thực hiện để ngăn attacker khai thác [session fixation](https://owasp.org/www-community/attacks/Session_fixation).
Laravel tự động regenerate session ID trong quá trình authentication nếu dùng [application starter kit](/docs/{{version}}/starter-kits) hoặc [Laravel Fortify](/docs/{{version}}/fortify). Nếu cần tự thực hiện, dùng method `regenerate`:

```php
$request->session()->regenerate();
```

#### Tăng và giảm giá trị session

```php
$request->session()->invalidate();
```

<a name="session-cache"></a>

## Session cache

Session cache của Laravel cung cấp cách cache dữ liệu theo phạm vi từng user session. Khác global application cache, dữ liệu session cache được tự động cô lập theo session và được dọn khi session hết hạn hoặc bị hủy. Session cache hỗ trợ các method quen thuộc của [Laravel cache](/docs/{{version}}/cache) như `get`, `put`, `remember`, `forget`... nhưng scoped vào session hiện tại.
Session cache phù hợp với dữ liệu tạm thời theo người dùng cần tồn tại qua nhiều request trong cùng session nhưng không cần lưu vĩnh viễn, chẳng hạn form data, kết quả tính tạm, API response hoặc dữ liệu ngắn hạn khác.
Bạn có thể truy cập session cache thông qua method `cache` trên session:

```php
$discount = $request->session()->cache()->get('discount');

$request->session()->cache()->put(
    'discount', 10, now()->plus(minutes: 5)
);
```

Đôi khi bạn muốn lưu item trong session chỉ cho request kế tiếp. Method `flash` thực hiện việc này. Dữ liệu flash có sẵn ngay trong request hiện tại và request HTTP tiếp theo, sau đó sẽ bị xóa. Flash data đặc biệt phù hợp với status message ngắn hạn:
<a name="session-blocking"></a>
Nếu cần giữ flash data qua thêm một vài request, dùng `reflash` để giữ toàn bộ flash data thêm một request. Nếu chỉ muốn giữ một số key cụ thể, dùng `keep`:

```php
Route::post('/profile', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);

Route::post('/order', function () {
    // ...
})->block($lockSeconds = 10, $waitSeconds = 10);
```

Nếu chỉ muốn flash data tồn tại trong request hiện tại, dùng method `now`:

```php
Route::post('/profile', function () {
    // ...
})->block();
```

<a name="adding-custom-session-drivers"></a>

### Xóa dữ liệu

<a name="implementing-the-driver"></a>

### Implement driver

Nếu không session driver nào phù hợp, Laravel cho phép viết session handler riêng. Custom driver phải implement interface PHP `SessionHandlerInterface`, chỉ gồm một số method đơn giản. Ví dụ stub implementation cho MongoDB như sau:

```php
<?php

namespace App\Extensions;

class MongoSessionHandler implements \SessionHandlerInterface
{
    public function open($savePath, $sessionName) {}
    public function close() {}
    public function read($sessionId) {}
    public function write($sessionId, $data) {}
    public function destroy($sessionId) {}
    public function gc($lifetime) {}
}
```

Laravel không có thư mục mặc định dành cho extension, vì vậy bạn có thể đặt chúng ở bất kỳ đâu. Trong ví dụ này, một thư mục `Extensions` được tạo để chứa `MongoSessionHandler`.
Vì mục đích của các method trong interface có thể chưa rõ, dưới đây là tổng quan:

### Tạo lại session ID

<a name="registering-the-driver"></a>
Laravel tự động regenerate session ID trong quá trình authentication nếu dùng [application starter kit](/docs/{{version}}/starter-kits) hoặc [Laravel Fortify](/docs/{{version}}/fortify). Nếu cần tự thực hiện, dùng method `regenerate`:

```php
<?php

namespace App\Providers;

use App\Extensions\MongoSessionHandler;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;

class SessionServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Session::extend('mongo', function (Application $app) {
            // Return an implementation of SessionHandlerInterface...
            return new MongoSessionHandler;
        });
    }
}
```

Nếu muốn regenerate session ID đồng thời xóa toàn bộ session data trong một lệnh, dùng method `invalidate`:

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/session). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
