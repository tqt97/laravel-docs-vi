# Database: Seeding

<a name="introduction"></a>
## Giới thiệu

Laravel cho phép bạn đưa dữ liệu mẫu hoặc dữ liệu khởi tạo vào database thông qua các seed class. Tất cả seed class được lưu trong thư mục `database/seeders`. Mặc định, Laravel tạo sẵn class `DatabaseSeeder`. Từ class này, bạn có thể dùng method `call` để chạy các seed class khác và chủ động kiểm soát thứ tự seeding.

> [!NOTE]
> Cơ chế [bảo vệ mass assignment](/docs/{{version}}/eloquent#mass-assignment) tự động được tắt trong quá trình database seeding.

<a name="writing-seeders"></a>
## Viết Seeder

Để tạo một seeder, hãy chạy [Artisan command](/docs/{{version}}/artisan) `make:seeder`. Mọi seeder do framework tạo sẽ nằm trong thư mục `database/seeders`:

```shell
php artisan make:seeder UserSeeder
```

Mặc định, một seeder class chỉ có một method là `run`. Method này được gọi khi [Artisan command](/docs/{{version}}/artisan) `db:seed` được thực thi. Bên trong `run`, bạn có thể insert dữ liệu vào database theo bất kỳ cách nào phù hợp. Bạn có thể dùng [query builder](/docs/{{version}}/queries) để insert thủ công hoặc dùng [Eloquent model factories](/docs/{{version}}/eloquent-factories).

Ví dụ, ta có thể sửa class `DatabaseSeeder` mặc định và thêm một câu lệnh insert vào method `run`:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'name' => Str::random(10),
            'email' => Str::random(10).'@example.com',
            'password' => Hash::make('password'),
        ]);
    }
}
```

> [!NOTE]
> Bạn có thể type-hint bất kỳ dependency nào cần dùng trong signature của method `run`. Laravel sẽ tự động resolve chúng thông qua [service container](/docs/{{version}}/container).

<a name="using-model-factories"></a>
### Sử dụng Model Factory

Việc khai báo thủ công attribute cho từng model cần seed sẽ nhanh chóng trở nên rườm rà. Thay vào đó, bạn có thể dùng [model factories](/docs/{{version}}/eloquent-factories) để tạo lượng lớn record một cách thuận tiện. Trước tiên, hãy xem [tài liệu model factory](/docs/{{version}}/eloquent-factories) để biết cách định nghĩa factory.

Ví dụ, đoạn code sau tạo 50 user và mỗi user có một post liên quan:

```php
use App\Models\User;

/**
 * Run the database seeders.
 */
public function run(): void
{
    User::factory()
        ->count(50)
        ->hasPosts(1)
        ->create();
}
```

<a name="calling-additional-seeders"></a>
### Gọi thêm Seeder

Trong class `DatabaseSeeder`, bạn có thể dùng method `call` để chạy thêm các seed class khác. Cách này giúp chia logic seeding thành nhiều file, tránh việc một seeder duy nhất trở nên quá lớn. Method `call` nhận một mảng các seeder class cần thực thi:

```php
/**
 * Run the database seeders.
 */
public function run(): void
{
    $this->call([
        UserSeeder::class,
        PostSeeder::class,
        CommentSeeder::class,
    ]);
}
```

<a name="muting-model-events"></a>
### Tắt Model Event khi seed

Trong lúc chạy seed, có thể bạn không muốn model dispatch event. Bạn có thể dùng trait `WithoutModelEvents` cho mục đích này. Khi trait được sử dụng, Laravel bảo đảm model event không được dispatch, kể cả khi `DatabaseSeeder` gọi thêm các seed class khác thông qua `call`:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
        ]);
    }
}
```

<a name="running-seeders"></a>
## Chạy Seeder

Bạn có thể chạy Artisan command `db:seed` để seed database. Mặc định, `db:seed` chạy class `Database\Seeders\DatabaseSeeder`, và class này có thể tiếp tục gọi các seed class khác. Nếu muốn chạy riêng một seeder cụ thể, hãy dùng tùy chọn `--class`:

```shell
php artisan db:seed

php artisan db:seed --class=UserSeeder
```

Bạn cũng có thể seed database khi chạy `migrate:fresh` bằng cách kết hợp tùy chọn `--seed`. Lệnh này xóa toàn bộ table rồi chạy lại tất cả migration, vì vậy rất hữu ích khi cần dựng lại hoàn toàn database. Tùy chọn `--seeder` cho phép chỉ định seeder cụ thể cần chạy:

```shell
php artisan migrate:fresh --seed

php artisan migrate:fresh --seed --seeder=UserSeeder
```

<a name="forcing-seeding-production"></a>
#### Bắt buộc chạy Seeder trong Production

Một số thao tác seeding có thể làm thay đổi hoặc mất dữ liệu. Để tránh vô tình chạy seeding command trên production database, Laravel sẽ yêu cầu xác nhận trước khi thực thi seeder trong environment `production`. Nếu thực sự cần chạy mà không hiện prompt xác nhận, hãy dùng flag `--force`:

```shell
php artisan db:seed --force
```
