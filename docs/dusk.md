# Laravel Dusk

<a name="introduction"></a>
## Giới thiệu

> [!WARNING]
> [Pest 4](https://pestphp.com/) hiện đã bao gồm kiểm thử trình duyệt tự động, mang lại những cải thiện đáng kể về hiệu năng và khả năng sử dụng so với Laravel Dusk. Với dự án mới, chúng tôi khuyến nghị sử dụng Pest để kiểm thử trình duyệt.

[Laravel Dusk](https://github.com/laravel/dusk) cung cấp API tự động hóa trình duyệt và kiểm thử có tính biểu đạt cao, dễ sử dụng. Theo mặc định, Dusk không yêu cầu bạn cài đặt JDK hoặc Selenium trên máy tính cục bộ. Thay vào đó, Dusk sử dụng một bản cài đặt [ChromeDriver](https://sites.google.com/chromium.org/driver) độc lập. Tuy nhiên, bạn có thể sử dụng bất kỳ driver nào khác tương thích với Selenium.

<a name="installation"></a>
## Cài đặt

Để bắt đầu, bạn nên cài đặt [Google Chrome](https://www.google.com/chrome) và thêm dependency Composer `laravel/dusk` vào dự án:

```shell
composer require laravel/dusk --dev
```

> [!WARNING]
> Nếu bạn đăng ký service provider của Dusk theo cách thủ công, bạn **không bao giờ** nên đăng ký nó trong môi trường production, vì điều đó có thể khiến người dùng bất kỳ có khả năng xác thực với ứng dụng của bạn.

Sau khi cài đặt package Dusk, hãy chạy lệnh Artisan `dusk:install`. Lệnh `dusk:install` sẽ tạo thư mục `tests/Browser`, một Dusk test mẫu và cài đặt binary ChromeDriver cho hệ điều hành của bạn:

```shell
php artisan dusk:install
```

Tiếp theo, hãy thiết lập biến môi trường `APP_URL` trong file `.env` của ứng dụng. Giá trị này phải khớp với URL mà bạn sử dụng để truy cập ứng dụng trong trình duyệt.

> [!NOTE]
> Nếu bạn đang sử dụng [Laravel Sail](/sail) để quản lý môi trường phát triển cục bộ, hãy tham khảo thêm tài liệu Sail về [cấu hình và chạy Dusk test](/sail#laravel-dusk).

<a name="managing-chromedriver-installations"></a>
### Quản lý cài đặt ChromeDriver

Nếu muốn cài đặt một phiên bản ChromeDriver khác với phiên bản được Laravel Dusk cài qua lệnh `dusk:install`, bạn có thể sử dụng lệnh `dusk:chrome-driver`:

```shell
# Install the latest version of ChromeDriver for your OS...
php artisan dusk:chrome-driver

# Install a given version of ChromeDriver for your OS...
php artisan dusk:chrome-driver 86

# Install a given version of ChromeDriver for all supported OSs...
php artisan dusk:chrome-driver --all

# Install the version of ChromeDriver that matches the detected version of Chrome / Chromium for your OS...
php artisan dusk:chrome-driver --detect
```

> [!WARNING]
> Dusk yêu cầu các binary `chromedriver` phải có quyền thực thi. Nếu gặp vấn đề khi chạy Dusk, bạn nên bảo đảm các binary có thể thực thi bằng lệnh sau: `chmod -R 0755 vendor/laravel/dusk/bin/`.

<a name="using-other-browsers"></a>
### Sử dụng trình duyệt khác

Theo mặc định, Dusk sử dụng Google Chrome và một bản cài đặt [ChromeDriver](https://sites.google.com/chromium.org/driver) độc lập để chạy browser test. Tuy nhiên, bạn có thể tự khởi động Selenium server và chạy test trên bất kỳ trình duyệt nào mong muốn.

Để bắt đầu, hãy mở file `tests/DuskTestCase.php`, đây là Dusk test case cơ sở của ứng dụng. Trong file này, bạn có thể bỏ lời gọi đến phương thức `startChromeDriver`. Việc này sẽ ngăn Dusk tự động khởi động ChromeDriver:

```php
/**
 * Prepare for Dusk test execution.
 *
 * @beforeClass
 */
public static function prepare(): void
{
    // static::startChromeDriver();
}
```

Tiếp theo, bạn có thể sửa phương thức `driver` để kết nối tới URL và port mong muốn. Ngoài ra, bạn có thể thay đổi các "desired capabilities" được truyền cho WebDriver:

```php
use Facebook\WebDriver\Remote\RemoteWebDriver;

/**
 * Create the RemoteWebDriver instance.
 */
protected function driver(): RemoteWebDriver
{
    return RemoteWebDriver::create(
        'http://localhost:4444/wd/hub', DesiredCapabilities::phantomjs()
    );
}
```

<a name="getting-started"></a>
## Bắt đầu

<a name="generating-tests"></a>
### Tạo test

Để tạo một Dusk test, hãy sử dụng lệnh Artisan `dusk:make`. Test được tạo sẽ nằm trong thư mục `tests/Browser`:

```shell
php artisan dusk:make LoginTest
```

<a name="resetting-the-database-after-each-test"></a>
### Đặt lại cơ sở dữ liệu sau mỗi test

Phần lớn test bạn viết sẽ tương tác với các trang truy xuất dữ liệu từ cơ sở dữ liệu của ứng dụng; tuy nhiên, Dusk test không bao giờ nên sử dụng trait `RefreshDatabase`. Trait `RefreshDatabase` tận dụng transaction của cơ sở dữ liệu, vốn không áp dụng hoặc không khả dụng xuyên qua các HTTP request. Thay vào đó, bạn có hai lựa chọn: trait `DatabaseMigrations` và trait `DatabaseTruncation`.

<a name="reset-migrations"></a>
#### Sử dụng Database Migrations

Trait `DatabaseMigrations` sẽ chạy các database migration trước mỗi test. Tuy nhiên, xóa và tạo lại các bảng cơ sở dữ liệu cho từng test thường chậm hơn việc truncate các bảng:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;

pest()->use(DatabaseMigrations::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    //
}
```

> [!WARNING]
> Không thể sử dụng cơ sở dữ liệu SQLite in-memory khi chạy Dusk test. Vì trình duyệt chạy trong process riêng, nó sẽ không thể truy cập cơ sở dữ liệu in-memory của process khác.

<a name="reset-truncation"></a>
#### Sử dụng Database Truncation

Trait `DatabaseTruncation` sẽ migrate cơ sở dữ liệu ở test đầu tiên để bảo đảm các bảng đã được tạo đúng cách. Tuy nhiên, ở những test tiếp theo, các bảng chỉ được truncate, giúp tăng tốc so với việc chạy lại toàn bộ database migration:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseTruncation;

pest()->use(DatabaseTruncation::class);

//
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseTruncation;

    //
}
```

Theo mặc định, trait này sẽ truncate tất cả bảng ngoại trừ bảng `migrations`. Nếu muốn tùy chỉnh các bảng cần truncate, bạn có thể định nghĩa property `$tablesToTruncate` trên test class:

> [!NOTE]
> Nếu đang sử dụng Pest, bạn nên định nghĩa các property hoặc method trên class cơ sở `DuskTestCase` hoặc trên bất kỳ class nào mà file test của bạn kế thừa.

```php
/**
 * Indicates which tables should be truncated.
 *
 * @var array
 */
protected $tablesToTruncate = ['users'];
```

Ngoài ra, bạn có thể định nghĩa property `$exceptTables` trên test class để chỉ định những bảng cần loại trừ khỏi quá trình truncate:

```php
/**
 * Indicates which tables should be excluded from truncation.
 *
 * @var array
 */
protected $exceptTables = ['users'];
```

Để chỉ định các kết nối cơ sở dữ liệu có bảng cần được truncate, bạn có thể định nghĩa property `$connectionsToTruncate` trên test class:

```php
/**
 * Indicates which connections should have their tables truncated.
 *
 * @var array
 */
protected $connectionsToTruncate = ['mysql'];
```

Nếu muốn thực thi code trước hoặc sau khi quá trình truncate cơ sở dữ liệu được thực hiện, bạn có thể định nghĩa các phương thức `beforeTruncatingDatabase` hoặc `afterTruncatingDatabase` trên test class:

```php
/**
 * Perform any work that should take place before the database has started truncating.
 */
protected function beforeTruncatingDatabase(): void
{
    //
}

/**
 * Perform any work that should take place after the database has finished truncating.
 */
protected function afterTruncatingDatabase(): void
{
    //
}
```

<a name="running-tests"></a>
### Chạy test

Để chạy browser test, hãy thực thi lệnh Artisan `dusk`:

```shell
php artisan dusk
```

Nếu lần chạy lệnh `dusk` trước có test thất bại, bạn có thể tiết kiệm thời gian bằng cách chạy lại các test thất bại trước với lệnh `dusk:fails`:

```shell
php artisan dusk:fails
```

Lệnh `dusk` chấp nhận mọi argument thường được Pest / PHPUnit test runner hỗ trợ, chẳng hạn cho phép bạn chỉ chạy test thuộc một [group](https://docs.phpunit.de/en/10.5/annotations.html#group) nhất định:

```shell
php artisan dusk --group=foo
```

> [!NOTE]
> Nếu bạn đang sử dụng [Laravel Sail](/sail) để quản lý môi trường phát triển cục bộ, hãy tham khảo tài liệu Sail về [cấu hình và chạy Dusk test](/sail#laravel-dusk).

<a name="manually-starting-chromedriver"></a>
#### Khởi động ChromeDriver thủ công

Theo mặc định, Dusk sẽ tự động cố gắng khởi động ChromeDriver. Nếu cách này không hoạt động trên hệ thống của bạn, bạn có thể khởi động ChromeDriver thủ công trước khi chạy lệnh `dusk`. Nếu chọn khởi động ChromeDriver thủ công, bạn nên comment dòng sau trong file `tests/DuskTestCase.php`:

```php
/**
 * Prepare for Dusk test execution.
 *
 * @beforeClass
 */
public static function prepare(): void
{
    // static::startChromeDriver();
}
```

Ngoài ra, nếu bạn khởi động ChromeDriver trên port khác 9515, hãy sửa phương thức `driver` của cùng class để sử dụng đúng port:

```php
use Facebook\WebDriver\Remote\RemoteWebDriver;

/**
 * Create the RemoteWebDriver instance.
 */
protected function driver(): RemoteWebDriver
{
    return RemoteWebDriver::create(
        'http://localhost:9515', DesiredCapabilities::chrome()
    );
}
```

<a name="environment-handling"></a>
### Xử lý môi trường

Để buộc Dusk sử dụng file môi trường riêng khi chạy test, hãy tạo file `.env.dusk.{environment}` tại thư mục gốc của dự án. Ví dụ, nếu bạn chạy lệnh `dusk` từ môi trường `local`, hãy tạo file `.env.dusk.local`.

Khi chạy test, Dusk sẽ sao lưu file `.env` và đổi tên file môi trường Dusk thành `.env`. Sau khi test hoàn tất, file `.env` của bạn sẽ được khôi phục.

<a name="browser-basics"></a>
## Kiến thức cơ bản về trình duyệt

<a name="creating-browsers"></a>
### Tạo trình duyệt

Để bắt đầu, hãy viết một test xác minh rằng chúng ta có thể đăng nhập vào ứng dụng. Sau khi tạo test, chúng ta có thể chỉnh sửa nó để điều hướng đến trang đăng nhập, nhập thông tin xác thực và nhấn nút "Login". Để tạo một browser instance, bạn có thể gọi phương thức `browse` bên trong Dusk test:

```php tab=Pest
<?php

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;

pest()->use(DatabaseMigrations::class);

test('basic example', function () {
    $user = User::factory()->create([
        'email' => 'taylor@laravel.com',
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit('/login')
            ->type('email', $user->email)
            ->type('password', 'password')
            ->press('Login')
            ->assertPathIs('/home');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    use DatabaseMigrations;

    /**
     * A basic browser test example.
     */
    public function test_basic_example(): void
    {
        $user = User::factory()->create([
            'email' => 'taylor@laravel.com',
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->visit('/login')
                ->type('email', $user->email)
                ->type('password', 'password')
                ->press('Login')
                ->assertPathIs('/home');
        });
    }
}
```

Như bạn có thể thấy trong ví dụ trên, phương thức `browse` nhận một closure. Dusk sẽ tự động truyền một browser instance vào closure này; đây là đối tượng chính được dùng để tương tác với ứng dụng và thực hiện các assertion.

<a name="creating-multiple-browsers"></a>
#### Tạo nhiều trình duyệt

Đôi khi bạn có thể cần nhiều trình duyệt để thực hiện test đúng cách. Ví dụ, có thể cần nhiều trình duyệt để kiểm thử một màn hình chat tương tác qua WebSocket. Để tạo nhiều trình duyệt, chỉ cần thêm các browser argument vào signature của closure được truyền cho phương thức `browse`:

```php
$this->browse(function (Browser $first, Browser $second) {
    $first->loginAs(User::find(1))
        ->visit('/home')
        ->waitForText('Message');

    $second->loginAs(User::find(2))
        ->visit('/home')
        ->waitForText('Message')
        ->type('message', 'Hey Taylor')
        ->press('Send');

    $first->waitForText('Hey Taylor')
        ->assertSee('Jeffrey Way');
});
```

<a name="navigation"></a>
### Điều hướng

Phương thức `visit` có thể được dùng để điều hướng đến một URI nhất định trong ứng dụng:

```php
$browser->visit('/login');
```

Bạn có thể sử dụng phương thức `visitRoute` để điều hướng đến một [named route](/routing#named-routes):

```php
$browser->visitRoute($routeName, $parameters);
```

Bạn có thể điều hướng "quay lại" và "tiến tới" bằng các phương thức `back` và `forward`:

```php
$browser->back();

$browser->forward();
```

Bạn có thể sử dụng phương thức `refresh` để tải lại trang:

```php
$browser->refresh();
```

<a name="resizing-browser-windows"></a>
### Thay đổi kích thước cửa sổ trình duyệt

Bạn có thể sử dụng phương thức `resize` để điều chỉnh kích thước cửa sổ trình duyệt:

```php
$browser->resize(1920, 1080);
```

Phương thức `maximize` có thể được dùng để phóng to tối đa cửa sổ trình duyệt:

```php
$browser->maximize();
```

Phương thức `fitContent` sẽ thay đổi kích thước cửa sổ trình duyệt để khớp với kích thước nội dung:

```php
$browser->fitContent();
```

Khi một test thất bại, Dusk sẽ tự động thay đổi kích thước trình duyệt để vừa với nội dung trước khi chụp ảnh màn hình. Bạn có thể tắt tính năng này bằng cách gọi phương thức `disableFitOnFailure` trong test:

```php
$browser->disableFitOnFailure();
```

Bạn có thể sử dụng phương thức `move` để di chuyển cửa sổ trình duyệt đến một vị trí khác trên màn hình:

```php
$browser->move($x = 100, $y = 100);
```

<a name="browser-macros"></a>
### Browser Macro

Nếu muốn định nghĩa một phương thức browser tùy chỉnh có thể tái sử dụng trong nhiều test, bạn có thể dùng phương thức `macro` trên class `Browser`. Thông thường, bạn nên gọi phương thức này từ phương thức `boot` của một [service provider](/providers):

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Dusk\Browser;

class DuskServiceProvider extends ServiceProvider
{
    /**
     * Register Dusk's browser macros.
     */
    public function boot(): void
    {
        Browser::macro('scrollToElement', function (string $element = null) {
            $this->script("$('html, body').animate({ scrollTop: $('$element').offset().top }, 0);");

            return $this;
        });
    }
}
```

Hàm `macro` nhận tên làm argument đầu tiên và một closure làm argument thứ hai. Closure của macro sẽ được thực thi khi gọi macro như một phương thức trên `Browser` instance:

```php
$this->browse(function (Browser $browser) use ($user) {
    $browser->visit('/pay')
        ->scrollToElement('#credit-card-details')
        ->assertSee('Enter Credit Card Details');
});
```

<a name="authentication"></a>
### Xác thực

Thông thường, bạn sẽ kiểm thử các trang yêu cầu xác thực. Bạn có thể sử dụng phương thức `loginAs` của Dusk để tránh phải tương tác với màn hình đăng nhập của ứng dụng trong mỗi test. Phương thức `loginAs` nhận primary key liên kết với authenticatable model hoặc một authenticatable model instance:

```php
use App\Models\User;
use Laravel\Dusk\Browser;

$this->browse(function (Browser $browser) {
    $browser->loginAs(User::find(1))
        ->visit('/home');
});
```

> [!WARNING]
> Sau khi sử dụng phương thức `loginAs`, session của người dùng sẽ được duy trì cho tất cả test trong file.

<a name="cookies"></a>
### Cookie

Bạn có thể sử dụng phương thức `cookie` để lấy hoặc thiết lập giá trị của cookie đã mã hóa. Theo mặc định, tất cả cookie do Laravel tạo đều được mã hóa:

```php
$browser->cookie('name');

$browser->cookie('name', 'Taylor');
```

Bạn có thể sử dụng phương thức `plainCookie` để lấy hoặc thiết lập giá trị của cookie không mã hóa:

```php
$browser->plainCookie('name');

$browser->plainCookie('name', 'Taylor');
```

Bạn có thể sử dụng phương thức `deleteCookie` để xóa cookie đã cho:

```php
$browser->deleteCookie('name');
```

<a name="executing-javascript"></a>
### Thực thi JavaScript

Bạn có thể sử dụng phương thức `script` để thực thi các câu lệnh JavaScript tùy ý bên trong trình duyệt:

```php
$browser->script('document.documentElement.scrollTop = 0');

$browser->script([
    'document.body.scrollTop = 0',
    'document.documentElement.scrollTop = 0',
]);

$output = $browser->script('return window.location.pathname');
```

<a name="taking-a-screenshot"></a>
### Chụp ảnh màn hình

Bạn có thể sử dụng phương thức `screenshot` để chụp ảnh màn hình và lưu với tên file đã cho. Tất cả ảnh chụp màn hình sẽ được lưu trong thư mục `tests/Browser/screenshots`:

```php
$browser->screenshot('filename');
```

Phương thức `responsiveScreenshots` có thể được dùng để chụp một loạt ảnh màn hình tại nhiều breakpoint khác nhau:

```php
$browser->responsiveScreenshots('filename');
```

Phương thức `screenshotElement` có thể được dùng để chụp ảnh màn hình của một element cụ thể trên trang:

```php
$browser->screenshotElement('#selector', 'filename');
```

<a name="storing-console-output-to-disk"></a>
### Lưu output của console xuống đĩa

Bạn có thể sử dụng phương thức `storeConsoleLog` để ghi console output của trình duyệt hiện tại xuống đĩa với tên file đã cho. Console output sẽ được lưu trong thư mục `tests/Browser/console`:

```php
$browser->storeConsoleLog('filename');
```

<a name="storing-page-source-to-disk"></a>
### Lưu source của trang xuống đĩa

Bạn có thể sử dụng phương thức `storeSource` để ghi source của trang hiện tại xuống đĩa với tên file đã cho. Source của trang sẽ được lưu trong thư mục `tests/Browser/source`:

```php
$browser->storeSource('filename');
```

<a name="interacting-with-elements"></a>
## Tương tác với phần tử

<a name="dusk-selectors"></a>
### Selector của Dusk

Việc chọn CSS selector phù hợp để tương tác với các phần tử là một trong những phần khó nhất khi viết test Dusk. Theo thời gian, các thay đổi ở frontend có thể khiến những CSS selector như sau làm test của bạn bị hỏng:

```html
// HTML...

<button>Login</button>
```

```php
// Test...

$browser->click('.login-page .container div > button');
```

Selector của Dusk giúp bạn tập trung vào việc viết test hiệu quả thay vì phải ghi nhớ CSS selector. Để định nghĩa một selector, hãy thêm thuộc tính `dusk` vào phần tử HTML. Sau đó, khi tương tác với trình duyệt Dusk, hãy thêm tiền tố `@` vào selector để thao tác với phần tử tương ứng trong test:

```html
// HTML...

<button dusk="login-button">Login</button>
```

```php
// Test...

$browser->click('@login-button');
```

Nếu muốn, bạn có thể tùy chỉnh thuộc tính HTML mà selector Dusk sử dụng thông qua phương thức `selectorHtmlAttribute`. Thông thường, phương thức này nên được gọi từ phương thức `boot` của `AppServiceProvider` trong ứng dụng:

```php
use Laravel\Dusk\Dusk;

Dusk::selectorHtmlAttribute('data-dusk');
```

<a name="text-values-and-attributes"></a>
### Văn bản, giá trị và thuộc tính

<a name="retrieving-setting-values"></a>
#### Lấy và thiết lập giá trị

Dusk cung cấp một số phương thức để tương tác với giá trị hiện tại, văn bản hiển thị và thuộc tính của các phần tử trên trang. Ví dụ, để lấy "value" của phần tử khớp với CSS selector hoặc Dusk selector đã cho, hãy sử dụng phương thức `value`:

```php
// Retrieve the value...
$value = $browser->value('selector');

// Set the value...
$browser->value('selector', 'value');
```

Bạn có thể sử dụng phương thức `inputValue` để lấy "value" của phần tử input có tên trường đã cho:

```php
$value = $browser->inputValue('field');
```

<a name="retrieving-text"></a>
#### Lấy văn bản

Phương thức `text` có thể được dùng để lấy văn bản hiển thị của phần tử khớp với selector đã cho:

```php
$text = $browser->text('selector');
```

<a name="retrieving-attributes"></a>
#### Lấy thuộc tính

Cuối cùng, phương thức `attribute` có thể được dùng để lấy giá trị của một thuộc tính trên phần tử khớp với selector đã cho:

```php
$attribute = $browser->attribute('selector', 'value');
```

<a name="interacting-with-forms"></a>
### Tương tác với biểu mẫu

<a name="typing-values"></a>
#### Nhập giá trị

Dusk cung cấp nhiều phương thức để tương tác với biểu mẫu và các phần tử input. Trước tiên, hãy xem ví dụ nhập văn bản vào một trường input:

```php
$browser->type('email', 'taylor@laravel.com');
```

Lưu ý rằng mặc dù phương thức chấp nhận CSS selector khi cần, chúng ta không bắt buộc phải truyền selector vào phương thức `type`. Nếu không cung cấp CSS selector, Dusk sẽ tìm trường `input` hoặc `textarea` có thuộc tính `name` tương ứng.

Để nối thêm văn bản vào một trường mà không xóa nội dung hiện có, bạn có thể sử dụng phương thức `append`:

```php
$browser->type('tags', 'foo')
    ->append('tags', ', bar, baz');
```

Bạn có thể xóa giá trị của input bằng phương thức `clear`:

```php
$browser->clear('email');
```

Bạn có thể yêu cầu Dusk nhập chậm bằng phương thức `typeSlowly`. Mặc định, Dusk sẽ tạm dừng 100 mili giây giữa mỗi lần nhấn phím. Để tùy chỉnh khoảng thời gian này, hãy truyền số mili giây thích hợp làm đối số thứ ba của phương thức:

```php
$browser->typeSlowly('mobile', '+1 (202) 555-5555');

$browser->typeSlowly('mobile', '+1 (202) 555-5555', 300);
```

Bạn có thể sử dụng phương thức `appendSlowly` để nối thêm văn bản một cách chậm rãi:

```php
$browser->type('tags', 'foo')
    ->appendSlowly('tags', ', bar, baz');
```

<a name="dropdowns"></a>
#### Danh sách thả xuống

Để chọn một giá trị có sẵn trên phần tử `select`, bạn có thể sử dụng phương thức `select`. Tương tự `type`, phương thức `select` không yêu cầu CSS selector đầy đủ. Khi truyền giá trị cho `select`, bạn nên truyền giá trị thực của option thay vì văn bản hiển thị:

```php
$browser->select('size', 'Large');
```

Bạn có thể chọn ngẫu nhiên một option bằng cách bỏ qua đối số thứ hai:

```php
$browser->select('size');
```

Bằng cách truyền một mảng làm đối số thứ hai cho `select`, bạn có thể yêu cầu phương thức chọn nhiều option:

```php
$browser->select('categories', ['Art', 'Music']);
```

<a name="checkboxes"></a>
#### Checkbox

Để đánh dấu một checkbox, bạn có thể sử dụng phương thức `check`. Giống nhiều phương thức liên quan đến input khác, không cần CSS selector đầy đủ. Nếu không tìm thấy CSS selector phù hợp, Dusk sẽ tìm checkbox có thuộc tính `name` tương ứng:

```php
$browser->check('terms');
```

Phương thức `uncheck` có thể được dùng để bỏ đánh dấu checkbox:

```php
$browser->uncheck('terms');
```

<a name="radio-buttons"></a>
#### Nút radio

Để chọn một tùy chọn `radio`, bạn có thể sử dụng phương thức `radio`. Giống nhiều phương thức input khác, không cần CSS selector đầy đủ. Nếu không tìm thấy CSS selector phù hợp, Dusk sẽ tìm input `radio` có thuộc tính `name` và `value` tương ứng:

```php
$browser->radio('size', 'large');
```

<a name="attaching-files"></a>
### Đính kèm tệp

Phương thức `attach` có thể được dùng để đính kèm tệp vào phần tử input `file`. Giống nhiều phương thức input khác, không cần CSS selector đầy đủ. Nếu không tìm thấy selector phù hợp, Dusk sẽ tìm input `file` có thuộc tính `name` tương ứng:

```php
$browser->attach('photo', __DIR__.'/photos/mountains.png');
```

> [!WARNING]
> Hàm attach yêu cầu PHP extension `Zip` được cài đặt và bật trên máy chủ.

<a name="pressing-buttons"></a>
### Nhấn nút

Phương thức `press` có thể được dùng để nhấp một phần tử button trên trang. Đối số truyền cho `press` có thể là văn bản hiển thị của nút hoặc CSS / Dusk selector:

```php
$browser->press('Login');
```

Khi gửi biểu mẫu, nhiều ứng dụng vô hiệu hóa nút submit sau khi được nhấn và bật lại khi HTTP request gửi biểu mẫu hoàn tất. Để nhấn nút và chờ nút được bật lại, bạn có thể sử dụng phương thức `pressAndWaitFor`:

```php
// Press the button and wait a maximum of 5 seconds for it to be enabled...
$browser->pressAndWaitFor('Save');

// Press the button and wait a maximum of 1 second for it to be enabled...
$browser->pressAndWaitFor('Save', 1);
```

<a name="clicking-links"></a>
### Nhấp liên kết

Để nhấp một liên kết, bạn có thể sử dụng phương thức `clickLink` trên browser instance. `clickLink` sẽ nhấp liên kết có văn bản hiển thị đã cho:

```php
$browser->clickLink($linkText);
```

Bạn có thể sử dụng phương thức `seeLink` để xác định liệu liên kết có văn bản hiển thị đã cho có xuất hiện trên trang hay không:

```php
if ($browser->seeLink($linkText)) {
    // ...
}
```

> [!WARNING]
> Các phương thức này tương tác với jQuery. Nếu jQuery không có sẵn trên trang, Dusk sẽ tự động inject jQuery để sử dụng trong suốt thời gian chạy test.

<a name="using-the-keyboard"></a>
### Sử dụng bàn phím

Phương thức `keys` cho phép bạn cung cấp chuỗi nhập liệu phức tạp hơn cho một phần tử so với phương thức `type`. Ví dụ, bạn có thể yêu cầu Dusk giữ phím bổ trợ trong khi nhập giá trị. Trong ví dụ này, phím `shift` được giữ khi nhập `taylor` vào phần tử khớp selector; sau đó `swift` được nhập mà không giữ phím bổ trợ:

```php
$browser->keys('selector', ['{shift}', 'taylor'], 'swift');
```

Một trường hợp hữu ích khác của `keys` là gửi tổ hợp phím tắt đến CSS selector chính của ứng dụng:

```php
$browser->keys('.app', ['{command}', 'j']);
```

> [!NOTE]
> Tất cả phím bổ trợ như `{command}` đều được bao quanh bởi ký tự `{}` và tương ứng với các hằng được định nghĩa trong lớp `Facebook\WebDriver\WebDriverKeys`, có thể [xem trên GitHub](https://github.com/php-webdriver/php-webdriver/blob/master/lib/WebDriverKeys.php).

<a name="fluent-keyboard-interactions"></a>
#### Tương tác bàn phím theo fluent API

Dusk cũng cung cấp phương thức `withKeyboard`, cho phép bạn thực hiện các tương tác bàn phím phức tạp theo fluent API thông qua lớp `Laravel\Dusk\Keyboard`. Lớp `Keyboard` cung cấp các phương thức `press`, `release`, `type` và `pause`:

```php
use Laravel\Dusk\Keyboard;

$browser->withKeyboard(function (Keyboard $keyboard) {
    $keyboard->press('c')
        ->pause(1000)
        ->release('c')
        ->type(['c', 'e', 'o']);
});
```

<a name="keyboard-macros"></a>
#### Macro bàn phím

Nếu muốn định nghĩa các tương tác bàn phím tùy chỉnh để dễ dàng tái sử dụng trong toàn bộ test suite, bạn có thể dùng phương thức `macro` của lớp `Keyboard`. Thông thường, phương thức này nên được gọi từ `boot` của một [service provider](/providers):

```php
<?php

namespace App\Providers;

use Facebook\WebDriver\WebDriverKeys;
use Illuminate\Support\ServiceProvider;
use Laravel\Dusk\Keyboard;
use Laravel\Dusk\OperatingSystem;

class DuskServiceProvider extends ServiceProvider
{
    /**
     * Register Dusk's browser macros.
     */
    public function boot(): void
    {
        Keyboard::macro('copy', function (string $element = null) {
            $this->type([
                OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'c',
            ]);

            return $this;
        });

        Keyboard::macro('paste', function (string $element = null) {
            $this->type([
                OperatingSystem::onMac() ? WebDriverKeys::META : WebDriverKeys::CONTROL, 'v',
            ]);

            return $this;
        });
    }
}
```

Hàm `macro` nhận tên làm đối số thứ nhất và closure làm đối số thứ hai. Closure của macro sẽ được thực thi khi gọi macro như một phương thức trên instance `Keyboard`:

```php
$browser->click('@textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->copy())
    ->click('@another-textarea')
    ->withKeyboard(fn (Keyboard $keyboard) => $keyboard->paste());
```

<a name="using-the-mouse"></a>
### Sử dụng chuột

<a name="clicking-on-elements"></a>
#### Nhấp vào phần tử

Phương thức `click` có thể được dùng để nhấp vào phần tử khớp với CSS hoặc Dusk selector đã cho:

```php
$browser->click('.selector');
```

Phương thức `clickAtXPath` có thể được dùng để nhấp vào phần tử khớp với biểu thức XPath đã cho:

```php
$browser->clickAtXPath('//div[@class = "selector"]');
```

Phương thức `clickAtPoint` có thể được dùng để nhấp vào phần tử nằm trên cùng tại cặp tọa độ đã cho, tính tương đối với vùng hiển thị của trình duyệt:

```php
$browser->clickAtPoint($x = 0, $y = 0);
```

Phương thức `doubleClick` có thể được dùng để mô phỏng thao tác nhấp đúp chuột:

```php
$browser->doubleClick();

$browser->doubleClick('.selector');
```

Phương thức `rightClick` có thể được dùng để mô phỏng thao tác nhấp chuột phải:

```php
$browser->rightClick();

$browser->rightClick('.selector');
```

Phương thức `clickAndHold` có thể được dùng để mô phỏng việc nhấn và giữ nút chuột. Sau đó, gọi `releaseMouse` sẽ kết thúc hành vi này và thả nút chuột:

```php
$browser->clickAndHold('.selector');

$browser->clickAndHold()
    ->pause(1000)
    ->releaseMouse();
```

Phương thức `controlClick` có thể được dùng để mô phỏng sự kiện `ctrl+click` trong trình duyệt:

```php
$browser->controlClick();

$browser->controlClick('.selector');
```

Phương thức `clickWhenVisible` hoặc `clickWhenEnabled` có thể được dùng để chờ phần tử sẵn sàng trước khi nhấp chính xác một lần:

```php
$browser->clickWhenVisible('@save-button');
$browser->clickWhenEnabled('@submit-button');
```

<a name="mouseover"></a>
#### Di chuột qua phần tử

Phương thức `mouseover` có thể được dùng khi bạn cần di chuột lên phần tử khớp với CSS hoặc Dusk selector đã cho:

```php
$browser->mouseover('.selector');
```

<a name="drag-drop"></a>
#### Kéo và thả

Phương thức `drag` có thể được dùng để kéo phần tử khớp selector đã cho sang một phần tử khác:

```php
$browser->drag('.from-selector', '.to-selector');
```

Hoặc, bạn có thể kéo phần tử theo một hướng cụ thể:

```php
$browser->dragLeft('.selector', $pixels = 10);
$browser->dragRight('.selector', $pixels = 10);
$browser->dragUp('.selector', $pixels = 10);
$browser->dragDown('.selector', $pixels = 10);
```

Cuối cùng, bạn có thể kéo phần tử theo một độ lệch đã cho:

```php
$browser->dragOffset('.selector', $x = 10, $y = 10);
```

<a name="javascript-dialogs"></a>
### Hộp thoại JavaScript

Dusk cung cấp nhiều phương thức để tương tác với hộp thoại JavaScript. Ví dụ, bạn có thể dùng `waitForDialog` để chờ hộp thoại JavaScript xuất hiện. Phương thức này nhận một đối số tùy chọn cho biết số giây tối đa cần chờ:

```php
$browser->waitForDialog($seconds = null);
```

Phương thức `assertDialogOpened` có thể được dùng để xác nhận rằng một hộp thoại đã hiển thị và chứa thông báo đã cho:

```php
$browser->assertDialogOpened('Dialog message');
```

Nếu hộp thoại JavaScript chứa prompt, bạn có thể dùng `typeInDialog` để nhập giá trị vào prompt:

```php
$browser->typeInDialog('Hello World');
```

Để đóng hộp thoại JavaScript đang mở bằng cách nhấp nút "OK", bạn có thể gọi `acceptDialog`:

```php
$browser->acceptDialog();
```

Để đóng hộp thoại JavaScript đang mở bằng cách nhấp nút "Cancel", bạn có thể gọi `dismissDialog`:

```php
$browser->dismissDialog();
```

<a name="interacting-with-iframes"></a>
### Tương tác với inline frame

Nếu cần tương tác với các phần tử bên trong iframe, bạn có thể dùng `withinFrame`. Mọi tương tác phần tử diễn ra trong closure truyền cho `withinFrame` sẽ được giới hạn trong ngữ cảnh của iframe đã chỉ định:

```php
$browser->withinFrame('#credit-card-details', function ($browser) {
    $browser->type('input[name="cardnumber"]', '4242424242424242')
        ->type('input[name="exp-date"]', '1224')
        ->type('input[name="cvc"]', '123')
        ->press('Pay');
});
```

<a name="scoping-selectors"></a>
### Giới hạn phạm vi selector

Đôi khi bạn muốn thực hiện nhiều thao tác nhưng giới hạn tất cả chúng trong một selector nhất định. Ví dụ, bạn có thể muốn xác nhận một đoạn văn bản chỉ tồn tại trong bảng rồi nhấp một nút bên trong bảng đó. Bạn có thể dùng `with` để thực hiện việc này. Mọi thao tác trong closure truyền cho `with` sẽ được giới hạn theo selector ban đầu:

```php
$browser->with('.table', function (Browser $table) {
    $table->assertSee('Hello World')
        ->clickLink('Delete');
});
```

Đôi khi bạn cần thực thi assertion bên ngoài phạm vi hiện tại. Bạn có thể dùng `elsewhere` và `elsewhereWhenAvailable` để thực hiện việc này:

```php
$browser->with('.table', function (Browser $table) {
    // Current scope is `body .table`...

    $browser->elsewhere('.page-title', function (Browser $title) {
        // Current scope is `body .page-title`...
        $title->assertSee('Hello World');
    });

    $browser->elsewhereWhenAvailable('.page-title', function (Browser $title) {
        // Current scope is `body .page-title`...
        $title->assertSee('Hello World');
    });
});
```

<a name="waiting-for-elements"></a>
### Chờ phần tử

Khi kiểm thử các ứng dụng sử dụng JavaScript nhiều, bạn thường cần "chờ" một số phần tử hoặc dữ liệu sẵn sàng trước khi tiếp tục test. Dusk giúp việc này trở nên đơn giản. Với nhiều phương thức khác nhau, bạn có thể chờ phần tử hiển thị trên trang hoặc thậm chí chờ đến khi một biểu thức JavaScript trả về `true`.

<a name="waiting"></a>
#### Chờ

Nếu chỉ cần tạm dừng test trong một số mili giây nhất định, hãy dùng `pause`:

```php
$browser->pause(1000);
```

Nếu chỉ cần tạm dừng test khi một điều kiện nhất định là `true`, hãy dùng `pauseIf`:

```php
$browser->pauseIf(App::environment('production'), 1000);
```

Tương tự, nếu cần tạm dừng test trừ khi một điều kiện nhất định là `true`, bạn có thể dùng `pauseUnless`:

```php
$browser->pauseUnless(App::environment('testing'), 1000);
```

<a name="waiting-for-selectors"></a>
#### Chờ selector

Phương thức `waitFor` có thể được dùng để tạm dừng thực thi test cho đến khi phần tử khớp với CSS hoặc Dusk selector đã cho hiển thị trên trang. Mặc định, test sẽ chờ tối đa năm giây trước khi ném exception. Nếu cần, bạn có thể truyền ngưỡng timeout tùy chỉnh làm đối số thứ hai:

```php
// Wait a maximum of five seconds for the selector...
$browser->waitFor('.selector');

// Wait a maximum of one second for the selector...
$browser->waitFor('.selector', 1);
```

Bạn cũng có thể chờ đến khi phần tử khớp selector đã cho chứa văn bản chỉ định:

```php
// Wait a maximum of five seconds for the selector to contain the given text...
$browser->waitForTextIn('.selector', 'Hello World');

// Wait a maximum of one second for the selector to contain the given text...
$browser->waitForTextIn('.selector', 'Hello World', 1);
```

Bạn cũng có thể chờ đến khi phần tử khớp selector đã cho biến mất khỏi trang:

```php
// Wait a maximum of five seconds until the selector is missing...
$browser->waitUntilMissing('.selector');

// Wait a maximum of one second until the selector is missing...
$browser->waitUntilMissing('.selector', 1);
```

Hoặc, bạn có thể chờ đến khi phần tử khớp selector đã cho được bật hoặc bị vô hiệu hóa:

```php
// Wait a maximum of five seconds until the selector is enabled...
$browser->waitUntilEnabled('.selector');

// Wait a maximum of one second until the selector is enabled...
$browser->waitUntilEnabled('.selector', 1);

// Wait a maximum of five seconds until the selector is disabled...
$browser->waitUntilDisabled('.selector');

// Wait a maximum of one second until the selector is disabled...
$browser->waitUntilDisabled('.selector', 1);
```

<a name="scoping-selectors-when-available"></a>
#### Giới hạn phạm vi selector khi khả dụng

Đôi khi bạn muốn chờ một phần tử khớp selector xuất hiện rồi tương tác với phần tử đó. Ví dụ, bạn có thể chờ modal khả dụng rồi nhấn nút "OK" bên trong modal. Phương thức `whenAvailable` có thể được dùng cho mục đích này. Mọi thao tác phần tử trong closure đã cho sẽ được giới hạn theo selector ban đầu:

```php
$browser->whenAvailable('.modal', function (Browser $modal) {
    $modal->assertSee('Hello World')
        ->press('OK');
});
```

<a name="waiting-for-text"></a>
#### Chờ văn bản

Phương thức `waitForText` có thể được dùng để chờ đến khi văn bản đã cho hiển thị trên trang:

```php
// Wait a maximum of five seconds for the text...
$browser->waitForText('Hello World');

// Wait a maximum of one second for the text...
$browser->waitForText('Hello World', 1);
```

Bạn có thể dùng `waitUntilMissingText` để chờ đến khi văn bản đang hiển thị được loại khỏi trang:

```php
// Wait a maximum of five seconds for the text to be removed...
$browser->waitUntilMissingText('Hello World');

// Wait a maximum of one second for the text to be removed...
$browser->waitUntilMissingText('Hello World', 1);
```

<a name="waiting-for-links"></a>
#### Chờ liên kết

Phương thức `waitForLink` có thể được dùng để chờ đến khi văn bản liên kết đã cho hiển thị trên trang:

```php
// Wait a maximum of five seconds for the link...
$browser->waitForLink('Create');

// Wait a maximum of one second for the link...
$browser->waitForLink('Create', 1);
```

<a name="waiting-for-inputs"></a>
#### Chờ input

Phương thức `waitForInput` có thể được dùng để chờ đến khi trường input đã cho hiển thị trên trang:

```php
// Wait a maximum of five seconds for the input...
$browser->waitForInput($field);

// Wait a maximum of one second for the input...
$browser->waitForInput($field, 1);
```

<a name="waiting-on-the-page-location"></a>
#### Chờ vị trí trang

Khi thực hiện path assertion như `$browser->assertPathIs('/home')`, assertion có thể thất bại nếu `window.location.pathname` đang được cập nhật bất đồng bộ. Bạn có thể dùng `waitForLocation` để chờ location đạt đến giá trị đã cho:

```php
$browser->waitForLocation('/secret');
```

`waitForLocation` cũng có thể được dùng để chờ location của cửa sổ hiện tại trở thành một URL đầy đủ:

```php
$browser->waitForLocation('https://example.com/path');
```

Bạn cũng có thể chờ location của một [named route](/routing#named-routes):

```php
$browser->waitForRoute($routeName, $parameters);
```

<a name="waiting-for-page-reloads"></a>
#### Chờ tải lại trang

Nếu cần chờ trang tải lại sau khi thực hiện một thao tác, hãy dùng `waitForReload`:

```php
use Laravel\Dusk\Browser;

$browser->waitForReload(function (Browser $browser) {
    $browser->press('Submit');
})
->assertSee('Success!');
```

Vì nhu cầu chờ trang tải lại thường xảy ra sau khi nhấp nút, bạn có thể dùng `clickAndWaitForReload` để thuận tiện hơn:

```php
$browser->clickAndWaitForReload('.selector')
    ->assertSee('something');
```

<a name="waiting-on-javascript-expressions"></a>
#### Chờ biểu thức JavaScript

Đôi khi bạn muốn tạm dừng thực thi test cho đến khi một biểu thức JavaScript trả về `true`. Bạn có thể dễ dàng thực hiện bằng `waitUntil`. Khi truyền biểu thức cho phương thức này, bạn không cần thêm từ khóa `return` hoặc dấu chấm phẩy ở cuối:

```php
// Wait a maximum of five seconds for the expression to be true...
$browser->waitUntil('App.data.servers.length > 0');

// Wait a maximum of one second for the expression to be true...
$browser->waitUntil('App.data.servers.length > 0', 1);
```

<a name="waiting-on-vue-expressions"></a>
#### Chờ biểu thức Vue

Các phương thức `waitUntilVue` và `waitUntilVueIsNot` có thể được dùng để chờ đến khi một thuộc tính của [Vue component](https://vuejs.org) có giá trị đã cho:

```php
// Wait until the component attribute contains the given value...
$browser->waitUntilVue('user.name', 'Taylor', '@user');

// Wait until the component attribute doesn't contain the given value...
$browser->waitUntilVueIsNot('user.name', null, '@user');
```

<a name="waiting-for-javascript-events"></a>
#### Chờ sự kiện JavaScript

Phương thức `waitForEvent` có thể được dùng để tạm dừng thực thi test cho đến khi một sự kiện JavaScript xảy ra:

```php
$browser->waitForEvent('load');
```

Event listener được gắn vào phạm vi hiện tại, mặc định là phần tử `body`. Khi dùng selector có giới hạn phạm vi, event listener sẽ được gắn vào phần tử khớp:

```php
$browser->with('iframe', function (Browser $iframe) {
    // Wait for the iframe's load event...
    $iframe->waitForEvent('load');
});
```

Bạn cũng có thể truyền selector làm đối số thứ hai của `waitForEvent` để gắn event listener vào một phần tử cụ thể:

```php
$browser->waitForEvent('load', '.selector');
```

Bạn cũng có thể chờ sự kiện trên các đối tượng `document` và `window`:

```php
// Wait until the document is scrolled...
$browser->waitForEvent('scroll', 'document');

// Wait a maximum of five seconds until the window is resized...
$browser->waitForEvent('resize', 'window', 5);
```

<a name="waiting-with-a-callback"></a>
#### Chờ bằng callback

Nhiều phương thức "wait" của Dusk dựa trên `waitUsing`. Bạn có thể dùng trực tiếp phương thức này để chờ một closure trả về `true`. `waitUsing` nhận số giây tối đa cần chờ, khoảng thời gian giữa các lần đánh giá closure, closure và một thông báo lỗi tùy chọn:

```php
$browser->waitUsing(10, 1, function () use ($something) {
    return $something->isReady();
}, "Something wasn't ready in time.");
```

<a name="scrolling-an-element-into-view"></a>
### Cuộn phần tử vào vùng hiển thị

Đôi khi bạn không thể nhấp vào một phần tử vì nó nằm ngoài vùng hiển thị của trình duyệt. `scrollIntoView` sẽ cuộn cửa sổ trình duyệt cho đến khi phần tử tại selector đã cho nằm trong vùng hiển thị:

```php
$browser->scrollIntoView('.selector')
    ->click('.selector');
```

<a name="available-assertions"></a>
## Các assertion khả dụng

Dusk cung cấp nhiều assertion để kiểm tra ứng dụng. Toàn bộ assertion khả dụng được liệt kê và mô tả bên dưới:

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

<div class="collection-method-list" markdown="1">

[assertTitle](#assert-title)
[assertTitleContains](#assert-title-contains)
[assertUrlIs](#assert-url-is)
[assertSchemeIs](#assert-scheme-is)
[assertSchemeIsNot](#assert-scheme-is-not)
[assertHostIs](#assert-host-is)
[assertHostIsNot](#assert-host-is-not)
[assertPortIs](#assert-port-is)
[assertPortIsNot](#assert-port-is-not)
[assertPathBeginsWith](#assert-path-begins-with)
[assertPathEndsWith](#assert-path-ends-with)
[assertPathContains](#assert-path-contains)
[assertPathIs](#assert-path-is)
[assertPathIsNot](#assert-path-is-not)
[assertRouteIs](#assert-route-is)
[assertQueryStringHas](#assert-query-string-has)
[assertQueryStringMissing](#assert-query-string-missing)
[assertFragmentIs](#assert-fragment-is)
[assertFragmentBeginsWith](#assert-fragment-begins-with)
[assertFragmentIsNot](#assert-fragment-is-not)
[assertHasCookie](#assert-has-cookie)
[assertHasPlainCookie](#assert-has-plain-cookie)
[assertCookieMissing](#assert-cookie-missing)
[assertPlainCookieMissing](#assert-plain-cookie-missing)
[assertCookieValue](#assert-cookie-value)
[assertPlainCookieValue](#assert-plain-cookie-value)
[assertSee](#assert-see)
[assertDontSee](#assert-dont-see)
[assertSeeIn](#assert-see-in)
[assertDontSeeIn](#assert-dont-see-in)
[assertSeeAnythingIn](#assert-see-anything-in)
[assertSeeNothingIn](#assert-see-nothing-in)
[assertCount](#assert-count)
[assertScript](#assert-script)
[assertSourceHas](#assert-source-has)
[assertSourceMissing](#assert-source-missing)
[assertSeeLink](#assert-see-link)
[assertDontSeeLink](#assert-dont-see-link)
[assertInputValue](#assert-input-value)
[assertInputValueIsNot](#assert-input-value-is-not)
[assertChecked](#assert-checked)
[assertNotChecked](#assert-not-checked)
[assertIndeterminate](#assert-indeterminate)
[assertRadioSelected](#assert-radio-selected)
[assertRadioNotSelected](#assert-radio-not-selected)
[assertSelected](#assert-selected)
[assertNotSelected](#assert-not-selected)
[assertSelectHasOptions](#assert-select-has-options)
[assertSelectMissingOptions](#assert-select-missing-options)
[assertSelectHasOption](#assert-select-has-option)
[assertSelectMissingOption](#assert-select-missing-option)
[assertValue](#assert-value)
[assertValueIsNot](#assert-value-is-not)
[assertAttribute](#assert-attribute)
[assertAttributeMissing](#assert-attribute-missing)
[assertAttributeContains](#assert-attribute-contains)
[assertAttributeDoesntContain](#assert-attribute-doesnt-contain)
[assertAriaAttribute](#assert-aria-attribute)
[assertDataAttribute](#assert-data-attribute)
[assertVisible](#assert-visible)
[assertPresent](#assert-present)
[assertNotPresent](#assert-not-present)
[assertMissing](#assert-missing)
[assertInputPresent](#assert-input-present)
[assertInputMissing](#assert-input-missing)
[assertDialogOpened](#assert-dialog-opened)
[assertEnabled](#assert-enabled)
[assertDisabled](#assert-disabled)
[assertButtonEnabled](#assert-button-enabled)
[assertButtonDisabled](#assert-button-disabled)
[assertFocused](#assert-focused)
[assertNotFocused](#assert-not-focused)
[assertAuthenticated](#assert-authenticated)
[assertGuest](#assert-guest)
[assertAuthenticatedAs](#assert-authenticated-as)
[assertVue](#assert-vue)
[assertVueIsNot](#assert-vue-is-not)
[assertVueContains](#assert-vue-contains)
[assertVueDoesntContain](#assert-vue-doesnt-contain)

</div>

<a name="assert-title"></a>
#### assertTitle

Xác nhận tiêu đề trang khớp với văn bản đã cho:

```php
$browser->assertTitle($title);
```

<a name="assert-title-contains"></a>
#### assertTitleContains

Xác nhận tiêu đề trang chứa văn bản đã cho:

```php
$browser->assertTitleContains($title);
```

<a name="assert-url-is"></a>
#### assertUrlIs

Xác nhận URL hiện tại (không gồm query string) khớp với chuỗi đã cho:

```php
$browser->assertUrlIs($url);
```

<a name="assert-scheme-is"></a>
#### assertSchemeIs

Xác nhận scheme của URL hiện tại khớp với scheme đã cho:

```php
$browser->assertSchemeIs($scheme);
```

<a name="assert-scheme-is-not"></a>
#### assertSchemeIsNot

Xác nhận scheme của URL hiện tại không khớp với scheme đã cho:

```php
$browser->assertSchemeIsNot($scheme);
```

<a name="assert-host-is"></a>
#### assertHostIs

Xác nhận host của URL hiện tại khớp với host đã cho:

```php
$browser->assertHostIs($host);
```

<a name="assert-host-is-not"></a>
#### assertHostIsNot

Xác nhận host của URL hiện tại không khớp với host đã cho:

```php
$browser->assertHostIsNot($host);
```

<a name="assert-port-is"></a>
#### assertPortIs

Xác nhận port của URL hiện tại khớp với port đã cho:

```php
$browser->assertPortIs($port);
```

<a name="assert-port-is-not"></a>
#### assertPortIsNot

Xác nhận port của URL hiện tại không khớp với port đã cho:

```php
$browser->assertPortIsNot($port);
```

<a name="assert-path-begins-with"></a>
#### assertPathBeginsWith

Xác nhận path của URL hiện tại bắt đầu bằng path đã cho:

```php
$browser->assertPathBeginsWith('/home');
```

<a name="assert-path-ends-with"></a>
#### assertPathEndsWith

Xác nhận path của URL hiện tại kết thúc bằng path đã cho:

```php
$browser->assertPathEndsWith('/home');
```

<a name="assert-path-contains"></a>
#### assertPathContains

Xác nhận path của URL hiện tại chứa path đã cho:

```php
$browser->assertPathContains('/home');
```

<a name="assert-path-is"></a>
#### assertPathIs

Xác nhận path hiện tại khớp với path đã cho:

```php
$browser->assertPathIs('/home');
```

<a name="assert-path-is-not"></a>
#### assertPathIsNot

Xác nhận path hiện tại không khớp với path đã cho:

```php
$browser->assertPathIsNot('/home');
```

<a name="assert-route-is"></a>
#### assertRouteIs

Xác nhận URL hiện tại khớp với URL của [named route](/routing#named-routes) đã cho:

```php
$browser->assertRouteIs($name, $parameters);
```

<a name="assert-query-string-has"></a>
#### assertQueryStringHas

Xác nhận tham số query string đã cho tồn tại:

```php
$browser->assertQueryStringHas($name);
```

Xác nhận tham số query string đã cho tồn tại và có giá trị đã cho:

```php
$browser->assertQueryStringHas($name, $value);
```

<a name="assert-query-string-missing"></a>
#### assertQueryStringMissing

Xác nhận tham số query string đã cho không tồn tại:

```php
$browser->assertQueryStringMissing($name);
```

<a name="assert-fragment-is"></a>
#### assertFragmentIs

Xác nhận hash fragment hiện tại của URL khớp với fragment đã cho:

```php
$browser->assertFragmentIs('anchor');
```

<a name="assert-fragment-begins-with"></a>
#### assertFragmentBeginsWith

Xác nhận hash fragment hiện tại của URL bắt đầu bằng fragment đã cho:

```php
$browser->assertFragmentBeginsWith('anchor');
```

<a name="assert-fragment-is-not"></a>
#### assertFragmentIsNot

Xác nhận hash fragment hiện tại của URL không khớp với fragment đã cho:

```php
$browser->assertFragmentIsNot('anchor');
```

<a name="assert-has-cookie"></a>
#### assertHasCookie

Xác nhận cookie đã mã hóa được chỉ định tồn tại:

```php
$browser->assertHasCookie($name);
```

<a name="assert-has-plain-cookie"></a>
#### assertHasPlainCookie

Xác nhận cookie không mã hóa được chỉ định tồn tại:

```php
$browser->assertHasPlainCookie($name);
```

<a name="assert-cookie-missing"></a>
#### assertCookieMissing

Xác nhận cookie đã mã hóa được chỉ định không tồn tại:

```php
$browser->assertCookieMissing($name);
```

<a name="assert-plain-cookie-missing"></a>
#### assertPlainCookieMissing

Xác nhận cookie không mã hóa được chỉ định không tồn tại:

```php
$browser->assertPlainCookieMissing($name);
```

<a name="assert-cookie-value"></a>
#### assertCookieValue

Xác nhận cookie đã mã hóa có giá trị đã cho:

```php
$browser->assertCookieValue($name, $value);
```

<a name="assert-plain-cookie-value"></a>
#### assertPlainCookieValue

Xác nhận cookie không mã hóa có giá trị đã cho:

```php
$browser->assertPlainCookieValue($name, $value);
```

<a name="assert-see"></a>
#### assertSee

Xác nhận văn bản đã cho xuất hiện trên trang:

```php
$browser->assertSee($text);
```

<a name="assert-dont-see"></a>
#### assertDontSee

Xác nhận văn bản đã cho không xuất hiện trên trang:

```php
$browser->assertDontSee($text);
```

<a name="assert-see-in"></a>
#### assertSeeIn

Xác nhận văn bản đã cho xuất hiện bên trong selector:

```php
$browser->assertSeeIn($selector, $text);
```

<a name="assert-dont-see-in"></a>
#### assertDontSeeIn

Xác nhận văn bản đã cho không xuất hiện bên trong selector:

```php
$browser->assertDontSeeIn($selector, $text);
```

<a name="assert-see-anything-in"></a>
#### assertSeeAnythingIn

Xác nhận có văn bản xuất hiện bên trong selector:

```php
$browser->assertSeeAnythingIn($selector);
```

<a name="assert-see-nothing-in"></a>
#### assertSeeNothingIn

Xác nhận không có văn bản nào xuất hiện bên trong selector:

```php
$browser->assertSeeNothingIn($selector);
```

<a name="assert-count"></a>
#### assertCount

Xác nhận các phần tử khớp selector đã cho xuất hiện đúng số lần được chỉ định:

```php
$browser->assertCount($selector, $count);
```

<a name="assert-script"></a>
#### assertScript

Xác nhận biểu thức JavaScript đã cho trả về giá trị được chỉ định:

```php
$browser->assertScript('window.isLoaded')
    ->assertScript('document.readyState', 'complete');
```

<a name="assert-source-has"></a>
#### assertSourceHas

Xác nhận mã nguồn đã cho xuất hiện trên trang:

```php
$browser->assertSourceHas($code);
```

<a name="assert-source-missing"></a>
#### assertSourceMissing

Xác nhận mã nguồn đã cho không xuất hiện trên trang:

```php
$browser->assertSourceMissing($code);
```

<a name="assert-see-link"></a>
#### assertSeeLink

Xác nhận liên kết đã cho xuất hiện trên trang:

```php
$browser->assertSeeLink($linkText);
```

<a name="assert-dont-see-link"></a>
#### assertDontSeeLink

Xác nhận liên kết đã cho không xuất hiện trên trang:

```php
$browser->assertDontSeeLink($linkText);
```

<a name="assert-input-value"></a>
#### assertInputValue

Xác nhận trường input đã cho có giá trị được chỉ định:

```php
$browser->assertInputValue($field, $value);
```

<a name="assert-input-value-is-not"></a>
#### assertInputValueIsNot

Xác nhận trường input đã cho không có giá trị được chỉ định:

```php
$browser->assertInputValueIsNot($field, $value);
```

<a name="assert-checked"></a>
#### assertChecked

Xác nhận checkbox đã cho đang được chọn:

```php
$browser->assertChecked($field);
```

<a name="assert-not-checked"></a>
#### assertNotChecked

Xác nhận checkbox đã cho không được chọn:

```php
$browser->assertNotChecked($field);
```

<a name="assert-indeterminate"></a>
#### assertIndeterminate

Xác nhận checkbox đã cho đang ở trạng thái indeterminate:

```php
$browser->assertIndeterminate($field);
```

<a name="assert-radio-selected"></a>
#### assertRadioSelected

Xác nhận radio field đã cho đang được chọn:

```php
$browser->assertRadioSelected($field, $value);
```

<a name="assert-radio-not-selected"></a>
#### assertRadioNotSelected

Xác nhận radio field đã cho không được chọn:

```php
$browser->assertRadioNotSelected($field, $value);
```

<a name="assert-selected"></a>
#### assertSelected

Xác nhận dropdown đã cho đang chọn giá trị được chỉ định:

```php
$browser->assertSelected($field, $value);
```

<a name="assert-not-selected"></a>
#### assertNotSelected

Xác nhận dropdown đã cho không chọn giá trị được chỉ định:

```php
$browser->assertNotSelected($field, $value);
```

<a name="assert-select-has-options"></a>
#### assertSelectHasOptions

Xác nhận mảng giá trị đã cho có sẵn để lựa chọn:

```php
$browser->assertSelectHasOptions($field, $values);
```

<a name="assert-select-missing-options"></a>
#### assertSelectMissingOptions

Xác nhận mảng giá trị đã cho không có sẵn để lựa chọn:

```php
$browser->assertSelectMissingOptions($field, $values);
```

<a name="assert-select-has-option"></a>
#### assertSelectHasOption

Xác nhận giá trị đã cho có sẵn để lựa chọn trên field được chỉ định:

```php
$browser->assertSelectHasOption($field, $value);
```

<a name="assert-select-missing-option"></a>
#### assertSelectMissingOption

Xác nhận giá trị đã cho không có sẵn để lựa chọn:

```php
$browser->assertSelectMissingOption($field, $value);
```

<a name="assert-value"></a>
#### assertValue

Xác nhận phần tử khớp selector đã cho có giá trị được chỉ định:

```php
$browser->assertValue($selector, $value);
```

<a name="assert-value-is-not"></a>
#### assertValueIsNot

Xác nhận phần tử khớp selector đã cho không có giá trị được chỉ định:

```php
$browser->assertValueIsNot($selector, $value);
```

<a name="assert-attribute"></a>
#### assertAttribute

Xác nhận phần tử khớp selector đã cho có giá trị được chỉ định trong attribute đã cung cấp:

```php
$browser->assertAttribute($selector, $attribute, $value);
```

<a name="assert-attribute-missing"></a>
#### assertAttributeMissing

Xác nhận phần tử khớp selector đã cho không có attribute được cung cấp:

```php
$browser->assertAttributeMissing($selector, $attribute);
```

<a name="assert-attribute-contains"></a>
#### assertAttributeContains

Xác nhận attribute được chỉ định của phần tử khớp selector đã cho chứa giá trị được cung cấp:

```php
$browser->assertAttributeContains($selector, $attribute, $value);
```

<a name="assert-attribute-doesnt-contain"></a>
#### assertAttributeDoesntContain

Xác nhận attribute được chỉ định của phần tử khớp selector đã cho không chứa giá trị được cung cấp:

```php
$browser->assertAttributeDoesntContain($selector, $attribute, $value);
```

<a name="assert-aria-attribute"></a>
#### assertAriaAttribute

Xác nhận phần tử khớp selector đã cho có giá trị được chỉ định trong aria attribute đã cung cấp:

```php
$browser->assertAriaAttribute($selector, $attribute, $value);
```

Ví dụ, với markup `<button aria-label="Add"></button>`, bạn có thể assertion đối với attribute `aria-label` như sau:

```php
$browser->assertAriaAttribute('button', 'label', 'Add')
```

<a name="assert-data-attribute"></a>
#### assertDataAttribute

Xác nhận phần tử khớp selector đã cho có giá trị được chỉ định trong data attribute đã cung cấp:

```php
$browser->assertDataAttribute($selector, $attribute, $value);
```

Ví dụ, với markup `<tr id="row-1" data-content="attendees"></tr>`, bạn có thể assertion đối với attribute `data-content` như sau:

```php
$browser->assertDataAttribute('#row-1', 'content', 'attendees')
```

<a name="assert-visible"></a>
#### assertVisible

Xác nhận phần tử khớp selector đã cho đang hiển thị:

```php
$browser->assertVisible($selector);
```

<a name="assert-present"></a>
#### assertPresent

Xác nhận phần tử khớp selector đã cho tồn tại trong source:

```php
$browser->assertPresent($selector);
```

<a name="assert-not-present"></a>
#### assertNotPresent

Xác nhận phần tử khớp selector đã cho không tồn tại trong source:

```php
$browser->assertNotPresent($selector);
```

<a name="assert-missing"></a>
#### assertMissing

Xác nhận phần tử khớp selector đã cho không hiển thị:

```php
$browser->assertMissing($selector);
```

<a name="assert-input-present"></a>
#### assertInputPresent

Xác nhận input có name đã cho tồn tại:

```php
$browser->assertInputPresent($name);
```

<a name="assert-input-missing"></a>
#### assertInputMissing

Xác nhận input có name đã cho không tồn tại trong source:

```php
$browser->assertInputMissing($name);
```

<a name="assert-dialog-opened"></a>
#### assertDialogOpened

Xác nhận JavaScript dialog với message đã cho đã được mở:

```php
$browser->assertDialogOpened($message);
```

<a name="assert-enabled"></a>
#### assertEnabled

Xác nhận field đã cho đang được bật:

```php
$browser->assertEnabled($field);
```

<a name="assert-disabled"></a>
#### assertDisabled

Xác nhận field đã cho đang bị vô hiệu hóa:

```php
$browser->assertDisabled($field);
```

<a name="assert-button-enabled"></a>
#### assertButtonEnabled

Xác nhận button đã cho đang được bật:

```php
$browser->assertButtonEnabled($button);
```

<a name="assert-button-disabled"></a>
#### assertButtonDisabled

Xác nhận button đã cho đang bị vô hiệu hóa:

```php
$browser->assertButtonDisabled($button);
```

<a name="assert-focused"></a>
#### assertFocused

Xác nhận field đã cho đang được focus:

```php
$browser->assertFocused($field);
```

<a name="assert-not-focused"></a>
#### assertNotFocused

Xác nhận field đã cho không được focus:

```php
$browser->assertNotFocused($field);
```

<a name="assert-authenticated"></a>
#### assertAuthenticated

Xác nhận người dùng đã được xác thực:

```php
$browser->assertAuthenticated();
```

<a name="assert-guest"></a>
#### assertGuest

Xác nhận người dùng chưa được xác thực:

```php
$browser->assertGuest();
```

<a name="assert-authenticated-as"></a>
#### assertAuthenticatedAs

Xác nhận người dùng đang được xác thực với user đã cho:

```php
$browser->assertAuthenticatedAs($user);
```

<a name="assert-vue"></a>
#### assertVue

Dusk thậm chí cho phép bạn assertion trạng thái dữ liệu của [Vue component](https://vuejs.org). Ví dụ, giả sử ứng dụng chứa Vue component sau:

    // HTML...

    <profile dusk="profile-component"></profile>

    // Component Definition...

    Vue.component('profile', {
        template: '<div>{{ user.name }}</div>',

        data: function () {
            return {
                user: {
                    name: 'Taylor'
                }
            };
        }
    });

Bạn có thể assertion trạng thái của Vue component như sau:

```php tab=Pest
test('vue', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->assertVue('user.name', 'Taylor', '@profile-component');
    });
});
```

```php tab=PHPUnit
/**
 * A basic Vue test example.
 */
public function test_vue(): void
{
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->assertVue('user.name', 'Taylor', '@profile-component');
    });
}
```

<a name="assert-vue-is-not"></a>
#### assertVueIsNot

Xác nhận thuộc tính dữ liệu của Vue component đã cho không khớp với giá trị được chỉ định:

```php
$browser->assertVueIsNot($property, $value, $componentSelector = null);
```

<a name="assert-vue-contains"></a>
#### assertVueContains

Xác nhận thuộc tính dữ liệu của Vue component đã cho là một array và chứa giá trị được chỉ định:

```php
$browser->assertVueContains($property, $value, $componentSelector = null);
```

<a name="assert-vue-doesnt-contain"></a>
#### assertVueDoesntContain

Xác nhận thuộc tính dữ liệu của Vue component đã cho là một array và không chứa giá trị được chỉ định:

```php
$browser->assertVueDoesntContain($property, $value, $componentSelector = null);
```

<a name="pages"></a>
## Pages

Đôi khi, các bài kiểm thử yêu cầu thực hiện liên tiếp nhiều thao tác phức tạp. Điều này có thể khiến bài kiểm thử khó đọc và khó hiểu hơn. Dusk Pages cho phép bạn định nghĩa các thao tác có tính biểu đạt cao, sau đó thực hiện chúng trên một trang cụ thể chỉ bằng một phương thức. Pages cũng cho phép bạn định nghĩa các lối tắt cho những selector thường dùng trong ứng dụng hoặc trên một trang cụ thể.

<a name="generating-pages"></a>
### Tạo Page

Để tạo một page object, hãy chạy lệnh Artisan `dusk:page`. Tất cả page object sẽ được đặt trong thư mục `tests/Browser/Pages` của ứng dụng:

```shell
php artisan dusk:page Login
```

<a name="configuring-pages"></a>
### Cấu hình Page

Theo mặc định, page có ba phương thức: `url`, `assert` và `elements`. Phần này sẽ trình bày các phương thức `url` và `assert`. Phương thức `elements` sẽ được [trình bày chi tiết hơn ở phần bên dưới](#shorthand-selectors).

<a name="the-url-method"></a>
#### Phương thức `url`

Phương thức `url` phải trả về path của URL đại diện cho page. Dusk sẽ sử dụng URL này khi điều hướng trình duyệt đến page:

```php
/**
 * Get the URL for the page.
 */
public function url(): string
{
    return '/login';
}
```

<a name="the-assert-method"></a>
#### Phương thức `assert`

Phương thức `assert` có thể thực hiện bất kỳ assertion nào cần thiết để xác minh rằng trình duyệt thực sự đang ở page đã cho. Bạn không bắt buộc phải đặt nội dung trong phương thức này; tuy nhiên, bạn có thể thêm các assertion nếu muốn. Các assertion này sẽ tự động được chạy khi điều hướng đến page:

```php
/**
 * Assert that the browser is on the page.
 */
public function assert(Browser $browser): void
{
    $browser->assertPathIs($this->url());
}
```

<a name="navigating-to-pages"></a>
### Điều hướng đến Page

Sau khi đã định nghĩa page, bạn có thể điều hướng đến page đó bằng phương thức `visit`:

```php
use Tests\Browser\Pages\Login;

$browser->visit(new Login);
```

Đôi khi bạn đã ở một page nhất định và cần "nạp" các selector cùng phương thức của page vào ngữ cảnh kiểm thử hiện tại. Trường hợp này thường xảy ra khi nhấn một nút và được chuyển hướng đến page khác mà không điều hướng tường minh. Khi đó, bạn có thể sử dụng phương thức `on` để nạp page:

```php
use Tests\Browser\Pages\CreatePlaylist;

$browser->visit('/dashboard')
    ->clickLink('Create Playlist')
    ->on(new CreatePlaylist)
    ->assertSee('@create');
```

<a name="shorthand-selectors"></a>
### Selector viết tắt

Phương thức `elements` trong các page class cho phép bạn định nghĩa những lối tắt ngắn gọn, dễ nhớ cho bất kỳ CSS selector nào trên page. Ví dụ, hãy định nghĩa một lối tắt cho trường nhập "email" trên trang đăng nhập của ứng dụng:

```php
/**
 * Get the element shortcuts for the page.
 *
 * @return array<string, string>
 */
public function elements(): array
{
    return [
        '@email' => 'input[name=email]',
    ];
}
```

Sau khi lối tắt được định nghĩa, bạn có thể sử dụng selector viết tắt ở bất kỳ nơi nào mà thông thường bạn sẽ dùng một CSS selector đầy đủ:

```php
$browser->type('@email', 'taylor@laravel.com');
```

<a name="global-shorthand-selectors"></a>
#### Selector viết tắt toàn cục

Sau khi cài đặt Dusk, một class `Page` cơ sở sẽ được đặt trong thư mục `tests/Browser/Pages`. Class này chứa phương thức `siteElements`, có thể dùng để định nghĩa các selector viết tắt toàn cục khả dụng trên mọi page trong ứng dụng:

```php
/**
 * Get the global element shortcuts for the site.
 *
 * @return array<string, string>
 */
public static function siteElements(): array
{
    return [
        '@element' => '#selector',
    ];
}
```

<a name="page-methods"></a>
### Các phương thức của Page

Ngoài các phương thức mặc định được định nghĩa trên page, bạn có thể định nghĩa thêm các phương thức để sử dụng xuyên suốt bộ kiểm thử. Ví dụ, giả sử chúng ta đang xây dựng một ứng dụng quản lý âm nhạc. Một thao tác phổ biến trên một page có thể là tạo playlist. Thay vì viết lại logic tạo playlist trong từng bài kiểm thử, bạn có thể định nghĩa phương thức `createPlaylist` trên page class:

```php
<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Page;

class Dashboard extends Page
{
    // Other page methods...

    /**
     * Create a new playlist.
     */
    public function createPlaylist(Browser $browser, string $name): void
    {
        $browser->type('name', $name)
            ->check('share')
            ->press('Create Playlist');
    }
}
```

Sau khi phương thức được định nghĩa, bạn có thể sử dụng nó trong bất kỳ bài kiểm thử nào sử dụng page đó. Browser instance sẽ tự động được truyền làm đối số đầu tiên cho các phương thức page tùy chỉnh:

```php
use Tests\Browser\Pages\Dashboard;

$browser->visit(new Dashboard)
    ->createPlaylist('My Playlist')
    ->assertSee('My Playlist');
```

<a name="components"></a>
## Components

Components tương tự "page objects" của Dusk, nhưng được thiết kế cho các phần UI và chức năng được tái sử dụng xuyên suốt ứng dụng, chẳng hạn thanh điều hướng hoặc cửa sổ thông báo. Vì vậy, component không bị ràng buộc với URL cụ thể.

<a name="generating-components"></a>
### Tạo Component

Để tạo một component, hãy chạy lệnh Artisan `dusk:component`. Các component mới sẽ được đặt trong thư mục `tests/Browser/Components`:

```shell
php artisan dusk:component DatePicker
```

Như ví dụ trên, "date picker" là một component có thể xuất hiện trên nhiều page khác nhau trong ứng dụng. Việc tự viết logic browser automation để chọn ngày trong hàng chục bài kiểm thử có thể trở nên rườm rà. Thay vào đó, chúng ta có thể định nghĩa một Dusk component đại diện cho date picker, qua đó đóng gói logic này bên trong component:

```php
<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class DatePicker extends BaseComponent
{
    /**
     * Get the root selector for the component.
     */
    public function selector(): string
    {
        return '.date-picker';
    }

    /**
     * Assert that the browser page contains the component.
     */
    public function assert(Browser $browser): void
    {
        $browser->assertVisible($this->selector());
    }

    /**
     * Get the element shortcuts for the component.
     *
     * @return array<string, string>
     */
    public function elements(): array
    {
        return [
            '@date-field' => 'input.datepicker-input',
            '@year-list' => 'div > div.datepicker-years',
            '@month-list' => 'div > div.datepicker-months',
            '@day-list' => 'div > div.datepicker-days',
        ];
    }

    /**
     * Select the given date.
     */
    public function selectDate(Browser $browser, int $year, int $month, int $day): void
    {
        $browser->click('@date-field')
            ->within('@year-list', function (Browser $browser) use ($year) {
                $browser->click($year);
            })
            ->within('@month-list', function (Browser $browser) use ($month) {
                $browser->click($month);
            })
            ->within('@day-list', function (Browser $browser) use ($day) {
                $browser->click($day);
            });
    }
}
```

<a name="using-components"></a>
### Sử dụng Component

Sau khi component được định nghĩa, chúng ta có thể dễ dàng chọn ngày trong date picker từ bất kỳ bài kiểm thử nào. Nếu logic cần thiết để chọn ngày thay đổi, chúng ta chỉ cần cập nhật component:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\Browser\Components\DatePicker;

pest()->use(DatabaseMigrations::class);

test('basic example', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/')
            ->within(new DatePicker, function (Browser $browser) {
                $browser->selectDate(2019, 1, 30);
            })
            ->assertSee('January');
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\DatePicker;
use Tests\DuskTestCase;

class ExampleTest extends DuskTestCase
{
    /**
     * A basic component test example.
     */
    public function test_basic_example(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/')
                ->within(new DatePicker, function (Browser $browser) {
                    $browser->selectDate(2019, 1, 30);
                })
                ->assertSee('January');
        });
    }
}
```

Phương thức `component` có thể được dùng để lấy một browser instance được giới hạn phạm vi trong component đã cho:

```php
$datePicker = $browser->component(new DatePickerComponent);

$datePicker->selectDate(2019, 1, 30);

$datePicker->assertSee('January');
```

<a name="continuous-integration"></a>
## Continuous Integration

> [!WARNING]
> Hầu hết cấu hình continuous integration của Dusk đều kỳ vọng ứng dụng Laravel được phục vụ bằng development server tích hợp của PHP trên cổng 8000. Vì vậy, trước khi tiếp tục, hãy đảm bảo môi trường continuous integration có biến môi trường `APP_URL` với giá trị `http://127.0.0.1:8000`.

<a name="running-tests-on-heroku-ci"></a>
### Heroku CI

Để chạy các bài kiểm thử Dusk trên [Heroku CI](https://www.heroku.com/continuous-integration), hãy thêm Google Chrome buildpack và các script sau vào file `app.json` của Heroku:

```json
{
  "environments": {
    "test": {
      "buildpacks": [
        { "url": "heroku/php" },
        { "url": "https://github.com/heroku/heroku-buildpack-chrome-for-testing" }
      ],
      "scripts": {
        "test-setup": "cp .env.testing .env",
        "test": "nohup bash -c './vendor/laravel/dusk/bin/chromedriver-linux --port=9515 > /dev/null 2>&1 &' && nohup bash -c 'php artisan serve --no-reload > /dev/null 2>&1 &' && php artisan dusk"
      }
    }
  }
}
```

<a name="running-tests-on-travis-ci"></a>
### Travis CI

Để chạy các bài kiểm thử Dusk trên [Travis CI](https://travis-ci.org), hãy sử dụng cấu hình `.travis.yml` sau. Vì Travis CI không phải môi trường đồ họa, chúng ta cần thực hiện thêm một số bước để khởi chạy trình duyệt Chrome. Ngoài ra, chúng ta sẽ dùng `php artisan serve` để khởi chạy web server tích hợp của PHP:

```yaml
language: php

php:
  - 8.2

addons:
  chrome: stable

install:
  - cp .env.testing .env
  - travis_retry composer install --no-interaction --prefer-dist
  - php artisan key:generate
  - php artisan dusk:chrome-driver

before_script:
  - google-chrome-stable --headless --disable-gpu --remote-debugging-port=9222 http://localhost &
  - php artisan serve --no-reload &

script:
  - php artisan dusk
```

<a name="running-tests-on-github-actions"></a>
### GitHub Actions

Nếu sử dụng [GitHub Actions](https://github.com/features/actions) để chạy các bài kiểm thử Dusk, bạn có thể dùng file cấu hình sau làm điểm khởi đầu. Tương tự Travis CI, chúng ta sẽ dùng lệnh `php artisan serve` để khởi chạy web server tích hợp của PHP:

```yaml
name: CI
on: [push]
jobs:

  dusk-php:
    runs-on: ubuntu-latest
    env:
      APP_URL: "http://127.0.0.1:8000"
      DB_USERNAME: root
      DB_PASSWORD: root
      MAIL_MAILER: log
    steps:
      - uses: actions/checkout@v5
      - name: Prepare The Environment
        run: cp .env.example .env
      - name: Create Database
        run: |
          sudo systemctl start mysql
          mysql --user="root" --password="root" -e "CREATE DATABASE \`my-database\` character set UTF8mb4 collate utf8mb4_bin;"
      - name: Install Composer Dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader
      - name: Generate Application Key
        run: php artisan key:generate
      - name: Upgrade Chrome Driver
        run: php artisan dusk:chrome-driver --detect
      - name: Start Chrome Driver
        run: ./vendor/laravel/dusk/bin/chromedriver-linux --port=9515 &
      - name: Run Laravel Server
        run: php artisan serve --no-reload &
      - name: Run Dusk Tests
        run: php artisan dusk
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: screenshots
          path: tests/Browser/screenshots
      - name: Upload Console Logs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: console
          path: tests/Browser/console
```

<a name="running-tests-on-chipper-ci"></a>
### Chipper CI

Nếu sử dụng [Chipper CI](https://chipperci.com) để chạy các bài kiểm thử Dusk, bạn có thể dùng file cấu hình sau làm điểm khởi đầu. Chúng ta sẽ sử dụng server tích hợp của PHP để chạy Laravel nhằm có thể lắng nghe các request:

```yaml
# file .chipperci.yml
version: 1

environment:
  php: 8.2
  node: 16

# Include Chrome in the build environment
services:
  - dusk

# Build all commits
on:
   push:
      branches: .*

pipeline:
  - name: Setup
    cmd: |
      cp -v .env.example .env
      composer install --no-interaction --prefer-dist --optimize-autoloader
      php artisan key:generate

      # Create a dusk env file, ensuring APP_URL uses BUILD_HOST
      cp -v .env .env.dusk.ci
      sed -i "s@APP_URL=.*@APP_URL=http://$BUILD_HOST:8000@g" .env.dusk.ci

  - name: Compile Assets
    cmd: |
      npm ci --no-audit
      npm run build

  - name: Browser Tests
    cmd: |
      php -S [::0]:8000 -t public 2>server.log &
      sleep 2
      php artisan dusk:chrome-driver $CHROME_DRIVER
      php artisan dusk --env=ci
```

Để tìm hiểu thêm về cách chạy các bài kiểm thử Dusk trên Chipper CI, bao gồm cách sử dụng database, hãy tham khảo [tài liệu Chipper CI chính thức](https://chipperci.com/docs/testing/laravel-dusk-new/).
