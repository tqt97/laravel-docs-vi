# Testing: Bắt đầu

<a name="introduction"></a>
## Giới thiệu

Laravel được xây dựng với testing là một phần quan trọng ngay từ đầu. Thực tế, framework hỗ trợ sẵn việc kiểm thử bằng [Pest](https://pestphp.com) và [PHPUnit](https://phpunit.de), đồng thời file `phpunit.xml` đã được cấu hình cho ứng dụng. Framework cũng cung cấp các helper method tiện dụng để bạn có thể kiểm thử ứng dụng một cách rõ ràng và biểu đạt tốt.

Mặc định, directory `tests` của ứng dụng chứa hai directory: `Feature` và `Unit`. Unit test tập trung vào một phần rất nhỏ và cô lập của code. Trên thực tế, phần lớn unit test thường chỉ tập trung vào một method. Các test trong directory `Unit` không boot ứng dụng Laravel, vì vậy chúng không thể truy cập database của ứng dụng hoặc các service khác của framework.

Feature test có thể kiểm thử một phần lớn hơn của code, bao gồm cách nhiều object tương tác với nhau hoặc thậm chí toàn bộ HTTP request tới một JSON endpoint. **Nhìn chung, phần lớn test của bạn nên là feature test. Những test này mang lại mức độ tin cậy cao nhất rằng toàn bộ hệ thống đang hoạt động đúng như mong đợi.**

File `ExampleTest.php` được cung cấp trong cả directory test `Feature` và `Unit`. Sau khi cài đặt một ứng dụng Laravel mới, hãy chạy command `vendor/bin/pest`, `vendor/bin/phpunit` hoặc `php artisan test` để thực thi các test.

<a name="environment"></a>
## Môi trường

Khi chạy test, Laravel sẽ tự động đặt [configuration environment](/docs/{{version}}/configuration#environment-configuration) thành `testing` dựa trên các environment variable được định nghĩa trong file `phpunit.xml`. Laravel cũng tự động cấu hình session và cache sử dụng driver `array`, nhờ đó dữ liệu session hoặc cache sẽ không được persist trong quá trình test.

Bạn có thể tự do định nghĩa thêm các giá trị cấu hình dành cho môi trường testing khi cần. Các environment variable của môi trường `testing` có thể được cấu hình trong file `phpunit.xml` của ứng dụng, nhưng hãy nhớ xóa configuration cache bằng command Artisan `config:clear` trước khi chạy test.

<a name="the-env-testing-environment-file"></a>
#### File môi trường `.env.testing`

Ngoài ra, bạn có thể tạo file `.env.testing` tại root của project. File này sẽ được sử dụng thay cho file `.env` khi chạy test bằng Pest và PHPUnit hoặc khi thực thi Artisan command với option `--env=testing`.

<a name="creating-tests"></a>
## Tạo test

Để tạo một test case mới, hãy sử dụng command Artisan `make:test`. Mặc định, test sẽ được đặt trong directory `tests/Feature`:

```shell
php artisan make:test UserTest
```

Nếu muốn tạo test trong directory `tests/Unit`, bạn có thể sử dụng option `--unit` khi chạy command `make:test`:

```shell
php artisan make:test UserTest --unit
```

Nếu test class của bạn chủ yếu dựa vào các tính năng testing của Laravel nhưng một test method cụ thể không cần framework được boot, bạn có thể áp dụng attribute `#[UnitTest]` cho method đó để chỉ bỏ qua việc boot ứng dụng đối với test này:

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\Attributes\UnitTest;
use Tests\TestCase;

class LocationServiceTest extends TestCase
{
    public function test_get_coordinates_resolves_address(): void
    {
        // This test uses Laravel's testing features...
    }

    #[UnitTest]
    public function test_get_state_returns_state_from_abbreviation(): void
    {
        // This test runs without booting the application...
    }
}
```

> [!NOTE]
> Các test stub có thể được tùy chỉnh bằng tính năng [publish stub](/docs/{{version}}/artisan#stub-customization).

Sau khi test được tạo, bạn có thể định nghĩa test như bình thường bằng Pest hoặc PHPUnit:

```php tab=Pest
<?php

test('basic', function () {
    expect(true)->toBeTrue();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_basic_test(): void
    {
        $this->assertTrue(true);
    }
}
```

> [!WARNING]
> Nếu tự định nghĩa các method `setUp` / `tearDown` trong test class, hãy nhớ gọi các method `parent::setUp()` / `parent::tearDown()` tương ứng của parent class. Thông thường, bạn nên gọi `parent::setUp()` ở đầu method `setUp` và `parent::tearDown()` ở cuối method `tearDown`.

<a name="running-tests"></a>
## Chạy test

Như đã đề cập, sau khi viết test, bạn có thể chạy chúng bằng `pest` hoặc `phpunit`:

```shell tab=Pest
./vendor/bin/pest
```

```shell tab=PHPUnit
./vendor/bin/phpunit
```

Ngoài các command `pest` hoặc `phpunit`, bạn có thể sử dụng command Artisan `test` để chạy test. Artisan test runner cung cấp báo cáo test chi tiết nhằm hỗ trợ quá trình phát triển và debug:

```shell
php artisan test
```

Mọi argument có thể truyền cho command `pest` hoặc `phpunit` cũng có thể được truyền cho command Artisan `test`:

```shell
php artisan test --testsuite=Feature --stop-on-failure
```

<a name="running-tests-in-parallel"></a>
### Chạy test song song

Mặc định, Laravel và Pest / PHPUnit thực thi các test tuần tự trong một process duy nhất. Tuy nhiên, bạn có thể giảm đáng kể thời gian chạy test bằng cách chạy nhiều test đồng thời trên nhiều process.

Để bắt đầu, hãy cài package Composer `brianium/paratest` dưới dạng dependency dành cho môi trường development. Sau đó, thêm option `--parallel` khi chạy command Artisan `test`:

```shell
composer require brianium/paratest --dev

php artisan test --parallel
```

Mặc định, Laravel sẽ tạo số process bằng số CPU core khả dụng trên máy. Tuy nhiên, bạn có thể điều chỉnh số lượng process bằng option `--processes`:

```shell
php artisan test --parallel --processes=4
```

> [!WARNING]
> Khi chạy test song song, một số option của Pest / PHPUnit, chẳng hạn `--do-not-cache-result`, có thể không khả dụng.

<a name="parallel-testing-and-databases"></a>
#### Parallel Testing và database

Miễn là bạn đã cấu hình primary database connection, Laravel sẽ tự động tạo và migrate một test database cho mỗi parallel process đang chạy test. Tên các test database sẽ được thêm hậu tố là process token duy nhất cho từng process. Ví dụ, nếu có hai parallel test process, Laravel sẽ tạo và sử dụng các database `your_db_test_1` và `your_db_test_2`.

Mặc định, test database được giữ lại giữa các lần gọi command Artisan `test` để có thể tái sử dụng trong những lần chạy test tiếp theo. Tuy nhiên, bạn có thể tạo lại chúng bằng option `--recreate-databases`:

```shell
php artisan test --parallel --recreate-databases
```

<a name="parallel-testing-hooks"></a>
#### Parallel Testing Hooks

Đôi khi, bạn cần chuẩn bị một số resource được sử dụng bởi test của ứng dụng để chúng có thể được nhiều test process sử dụng một cách an toàn.

Với facade `ParallelTesting`, bạn có thể chỉ định code được thực thi trong `setUp` và `tearDown` của một process hoặc test case. Các closure được truyền vào sẽ nhận `$token` và `$testCase`, lần lượt chứa process token và test case hiện tại:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\ParallelTesting;
use Illuminate\Support\ServiceProvider;
use PHPUnit\Framework\TestCase;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ParallelTesting::setUpProcess(function (int $token) {
            // ...
        });

        ParallelTesting::setUpTestCase(function (int $token, TestCase $testCase) {
            // ...
        });

        // Executed when a test database is created...
        ParallelTesting::setUpTestDatabase(function (string $database, int $token) {
            Artisan::call('db:seed');
        });

        ParallelTesting::tearDownTestCase(function (int $token, TestCase $testCase) {
            // ...
        });

        ParallelTesting::tearDownProcess(function (int $token) {
            // ...
        });
    }
}
```

<a name="accessing-the-parallel-testing-token"></a>
#### Truy cập Parallel Testing Token

Nếu muốn truy cập "token" của parallel process hiện tại từ bất kỳ vị trí nào khác trong test code của ứng dụng, bạn có thể sử dụng method `token`. Token này là một string identifier duy nhất cho từng test process và có thể được dùng để phân tách resource giữa các parallel test process.

Ví dụ, Laravel tự động nối token này vào cuối tên các test database được tạo cho mỗi parallel testing process:

```php
$token = ParallelTesting::token();
```

<a name="reporting-test-coverage"></a>
### Báo cáo độ bao phủ test

> [!WARNING]
> Tính năng này yêu cầu [Xdebug](https://xdebug.org) hoặc [PCOV](https://pecl.php.net/package/pcov).

Khi chạy test cho ứng dụng, bạn có thể muốn xác định liệu các test case có thực sự bao phủ application code hay không và có bao nhiêu application code được sử dụng khi chạy test. Để thực hiện việc này, hãy cung cấp option `--coverage` khi gọi command `test`:

```shell
php artisan test --coverage
```

<a name="enforcing-a-minimum-coverage-threshold"></a>
#### Áp dụng ngưỡng coverage tối thiểu

Bạn có thể sử dụng option `--min` để định nghĩa ngưỡng test coverage tối thiểu cho ứng dụng. Test suite sẽ thất bại nếu không đạt ngưỡng này:

```shell
php artisan test --coverage --min=80.3
```

<a name="profiling-tests"></a>
### Phân tích hiệu năng test

Artisan test runner cũng cung cấp một cơ chế tiện dụng để liệt kê các test chậm nhất của ứng dụng. Chạy command `test` với option `--profile` để hiển thị danh sách mười test chậm nhất, giúp bạn dễ dàng xác định những test có thể được cải thiện nhằm tăng tốc test suite:

```shell
php artisan test --profile
```

<a name="configuration-caching"></a>
## Cache cấu hình

Khi chạy test, Laravel boot ứng dụng cho từng test method riêng lẻ. Nếu không có file configuration cache, mỗi file cấu hình của ứng dụng phải được load ở đầu mỗi test. Để build cấu hình một lần và tái sử dụng cho tất cả test trong cùng một lần chạy, bạn có thể sử dụng trait `Illuminate\Foundation\Testing\WithCachedConfig`:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\WithCachedConfig;

pest()->use(WithCachedConfig::class);

// ...
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\WithCachedConfig;
use Tests\TestCase;

class ConfigTest extends TestCase
{
    use WithCachedConfig;

    // ...
}
```
