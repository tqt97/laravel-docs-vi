# Kiểm thử cơ sở dữ liệu
- [Giới thiệu](#introduction)
    - [Đặt lại cơ sở dữ liệu sau mỗi test](#resetting-the-database-after-each-test)
- [Model factory](#model-factories)
- [Chạy Seeders](#running-seeders)
- [Các Assertion có sẵn](#available-assertions)
<a name="introduction"></a>
## Giới thiệu
Laravel cung cấp nhiều công cụ và assertion hữu ích giúp việc kiểm thử ứng dụng sử dụng database trở nên thuận tiện hơn. Bên cạnh đó, model factory và seeder của Laravel giúp bạn dễ dàng tạo dữ liệu test bằng chính Eloquent model và relationship của ứng dụng. Phần dưới đây sẽ trình bày các khả năng này.
<a name="resetting-the-database-after-each-test"></a>
### Đặt lại cơ sở dữ liệu sau mỗi test
Trước khi đi sâu hơn, cần hiểu cách reset database sau mỗi test để dữ liệu từ test trước không ảnh hưởng tới test sau. Trait `Illuminate\Foundation\Testing\RefreshDatabase` đi kèm Laravel sẽ xử lý việc này. Bạn chỉ cần sử dụng trait trong test class:
```php tab=Pest
<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->use(RefreshDatabase::class);

test('basic example', function () {
    $response = $this->get('/');

    // ...
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic functional test example.
     */
    public function test_basic_example(): void
    {
        $response = $this->get('/');

        // ...
    }
}
```
Trait `Illuminate\Foundation\Testing\RefreshDatabase` không chạy migration lại nếu schema của database đã ở trạng thái mới nhất. Thay vào đó, test sẽ được thực thi trong một database transaction. Vì vậy, những record được thêm bởi test case không dùng trait này vẫn có thể còn tồn tại trong database.
Nếu muốn reset database hoàn toàn, bạn có thể dùng trait `Illuminate\Foundation\Testing\DatabaseMigrations` hoặc `Illuminate\Foundation\Testing\DatabaseTruncation`. Tuy nhiên, cả hai lựa chọn này đều chậm hơn đáng kể so với `RefreshDatabase`.
<a name="model-factories"></a>
## Model factory
Khi test, bạn có thể cần thêm một số record vào database trước khi thực thi test. Thay vì tự chỉ định giá trị từng column cho dữ liệu test, Laravel cho phép định nghĩa một tập attribute mặc định cho mỗi [Eloquent model](/docs/{{version}}/eloquent) bằng [model factory](/docs/{{version}}/eloquent-factories).
Để tìm hiểu đầy đủ cách tạo và sử dụng model factory, hãy xem [tài liệu Model Factory](/docs/{{version}}/eloquent-factories). Sau khi định nghĩa factory, bạn có thể dùng nó trong test để tạo model:
```php tab=Pest
use App\Models\User;

test('models can be instantiated', function () {
    $user = User::factory()->create();

    // ...
});
```

```php tab=PHPUnit
use App\Models\User;

public function test_models_can_be_instantiated(): void
{
    $user = User::factory()->create();

    // ...
}
```

<a name="running-seeders"></a>
## Chạy Seeders
Nếu muốn dùng [database seeder](/docs/{{version}}/seeding) để đưa dữ liệu vào database trong feature test, bạn có thể gọi phương thức `seed`. Mặc định, `seed` sẽ chạy `DatabaseSeeder`, và seeder này nên gọi các seeder khác của ứng dụng. Ngoài ra, bạn có thể truyền trực tiếp tên class seeder cụ thể cho `seed`:
```php tab=Pest
<?php

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

pest()->use(RefreshDatabase::class);

test('orders can be created', function () {
    // Run the DatabaseSeeder...
    $this->seed();

    // Run a specific seeder...
    $this->seed(OrderStatusSeeder::class);

    // ...

    // Run an array of specific seeders...
    $this->seed([
        OrderStatusSeeder::class,
        TransactionStatusSeeder::class,
        // ...
    ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Database\Seeders\OrderStatusSeeder;
use Database\Seeders\TransactionStatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test creating a new order.
     */
    public function test_orders_can_be_created(): void
    {
        // Run the DatabaseSeeder...
        $this->seed();

        // Run a specific seeder...
        $this->seed(OrderStatusSeeder::class);

        // ...

        // Run an array of specific seeders...
        $this->seed([
            OrderStatusSeeder::class,
            TransactionStatusSeeder::class,
            // ...
        ]);
    }
}
```
Ngoài ra, bạn có thể yêu cầu Laravel tự động seed database trước mỗi test sử dụng trait `RefreshDatabase`. Để làm vậy, hãy thêm attribute `Seed` vào base test class:
```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\Attributes\Seed;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

#[Seed]
abstract class TestCase extends BaseTestCase
{
}
```
Khi có attribute `Seed`, test sẽ chạy class `Database\Seeders\DatabaseSeeder` trước mỗi test dùng `RefreshDatabase`. Nếu chỉ muốn chạy một seeder cụ thể, bạn có thể sử dụng attribute `Seeder` trên test class:
```php
<?php

namespace Tests\Feature;

use Database\Seeders\OrderStatusSeeder;
use Illuminate\Foundation\Testing\Attributes\Seeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

#[Seeder(OrderStatusSeeder::class)]
class OrderTest extends TestCase
{
    use RefreshDatabase;

    // ...
}
```

<a name="available-assertions"></a>
## Các Assertion có sẵn
Laravel cung cấp nhiều database assertion cho feature test viết bằng [Pest](https://pestphp.com) hoặc [PHPUnit](https://phpunit.de). Chúng ta sẽ lần lượt tìm hiểu từng assertion bên dưới.
<a name="assert-database-count"></a>
#### assertDatabaseCount

Kiểm tra một table trong database có đúng số lượng record được chỉ định:
```php
$this->assertDatabaseCount('users', 5);
```

<a name="assert-database-empty"></a>
#### assertDatabaseEmpty

Kiểm tra một table trong database không có record nào:
```php
$this->assertDatabaseEmpty('users');
```

<a name="assert-database-has"></a>
#### assertDatabaseHas

Kiểm tra một table trong database có record khớp với các điều kiện key / value đã cho:
```php
$this->assertDatabaseHas('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-database-missing"></a>
#### assertDatabaseMissing

Kiểm tra một table trong database không có record khớp với các điều kiện key / value đã cho:
```php
$this->assertDatabaseMissing('users', [
    'email' => 'sally@example.com',
]);
```

<a name="assert-deleted"></a>
#### assertSoftDeleted

Phương thức `assertSoftDeleted` có thể dùng để xác nhận một Eloquent model đã được "soft delete":
```php
$this->assertSoftDeleted($user);
```

<a name="assert-not-deleted"></a>
#### assertNotSoftDeleted

Phương thức `assertNotSoftDeleted` có thể dùng để xác nhận một Eloquent model chưa bị "soft delete":
```php
$this->assertNotSoftDeleted($user);
```

<a name="assert-model-exists"></a>
#### assertModelExists

Kiểm tra một model hoặc collection model đã tồn tại trong database:
```php
use App\Models\User;

$user = User::factory()->create();

$this->assertModelExists($user);
```

<a name="assert-model-missing"></a>
#### assertModelMissing

Kiểm tra một model hoặc collection model không tồn tại trong database:
```php
use App\Models\User;

$user = User::factory()->create();

$user->delete();

$this->assertModelMissing($user);
```

<a name="expects-database-query-count"></a>
#### expectsDatabaseQueryCount

Bạn có thể gọi `expectsDatabaseQueryCount` ở đầu test để chỉ định tổng số database query dự kiến được thực thi. Nếu số query thực tế không khớp chính xác với giá trị mong đợi, test sẽ thất bại:
```php
$this->expectsDatabaseQueryCount(5);

// Test...
```

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/database-testing). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
