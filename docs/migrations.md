# Database: Migration

- [Giới thiệu](#introduction)
- [Tạo migration](#generating-migrations)
    - [Gộp migration](#squashing-migrations)
- [Cấu trúc migration](#migration-structure)
- [Chạy migration](#running-migrations)
    - [Rollback migration](#rolling-back-migrations)
- [Bảng](#tables)
    - [Tạo bảng](#creating-tables)
    - [Cập nhật bảng](#updating-tables)
    - [Đổi tên / Xóa bảng](#renaming-and-dropping-tables)
- [Cột](#columns)
    - [Tạo cột](#creating-columns)
    - [Các kiểu cột khả dụng](#available-column-types)
    - [Các modifier của cột](#column-modifiers)
    - [Thay đổi cột](#modifying-columns)
    - [Đổi tên cột](#renaming-columns)
    - [Xóa cột](#dropping-columns)
- [Index](#indexes)
    - [Tạo index](#creating-indexes)
    - [Đổi tên index](#renaming-indexes)
    - [Xóa index](#dropping-indexes)
    - [Ràng buộc khóa ngoại](#foreign-key-constraints)
- [Event](#events)

<a name="introduction"></a>
## Giới thiệu

Migration hoạt động tương tự hệ thống quản lý phiên bản dành cho database, cho phép đội ngũ định nghĩa và chia sẻ schema database của ứng dụng. Nếu bạn từng phải yêu cầu đồng đội tự thêm một cột vào schema database trên máy local sau khi họ pull thay đổi của bạn từ source control, thì đó chính là vấn đề mà database migration giải quyết.

[Facade](/docs/{{version}}/facades) `Schema` của Laravel cung cấp API không phụ thuộc vào hệ quản trị database để tạo và thao tác với bảng trên tất cả các hệ database mà Laravel hỗ trợ. Thông thường, migration sử dụng facade này để tạo và thay đổi bảng cũng như cột trong database.

<a name="generating-migrations"></a>
## Tạo migration

Bạn có thể sử dụng [lệnh Artisan](/docs/{{version}}/artisan) `make:migration` để tạo database migration. Migration mới sẽ được đặt trong thư mục `database/migrations`. Tên file của mỗi migration chứa timestamp để Laravel xác định thứ tự chạy migration:

```shell
php artisan make:migration create_flights_table
```

Laravel sẽ dựa vào tên migration để thử suy đoán tên bảng và migration đó có tạo bảng mới hay không. Nếu xác định được tên bảng từ tên migration, Laravel sẽ điền sẵn bảng tương ứng vào file migration được tạo. Nếu không, bạn chỉ cần tự chỉ định bảng trong file migration.

Nếu muốn chỉ định đường dẫn tùy chỉnh cho migration được tạo, bạn có thể dùng tùy chọn `--path` khi chạy lệnh `make:migration`. Đường dẫn được cung cấp phải là đường dẫn tương đối so với base path của ứng dụng.

> [!NOTE]
> Có thể tùy chỉnh migration stub bằng cách [publish stub](/docs/{{version}}/artisan#stub-customization).

<a name="squashing-migrations"></a>
### Gộp migration

Trong quá trình phát triển ứng dụng, số lượng migration có thể tăng dần theo thời gian, khiến thư mục `database/migrations` phình to với hàng trăm migration. Nếu muốn, bạn có thể "gộp" các migration thành một file SQL duy nhất. Để bắt đầu, hãy chạy lệnh `schema:dump`:

```shell
php artisan schema:dump

# Dump the current database schema and prune all existing migrations...
php artisan schema:dump --prune
```

Khi chạy lệnh này, Laravel sẽ ghi một file "schema" vào thư mục `database/schema` của ứng dụng. Tên file schema sẽ tương ứng với database connection. Sau đó, khi bạn chạy migration trên một database chưa có migration nào được thực thi, Laravel trước tiên sẽ chạy các câu lệnh SQL trong file schema của database connection đang sử dụng. Sau khi chạy các câu lệnh SQL trong file schema, Laravel sẽ tiếp tục chạy những migration còn lại không nằm trong schema dump.

Nếu test của ứng dụng sử dụng database connection khác với connection thường dùng khi phát triển local, bạn nên đảm bảo đã dump một file schema bằng connection đó để test có thể dựng database. Bạn có thể thực hiện việc này sau khi dump connection thường dùng cho môi trường local:

```shell
php artisan schema:dump
php artisan schema:dump --database=testing --prune
```

Bạn nên commit file database schema vào source control để các developer mới trong đội ngũ có thể nhanh chóng tạo cấu trúc database ban đầu của ứng dụng.

> [!WARNING]
> Tính năng gộp migration chỉ khả dụng với MariaDB, MySQL, PostgreSQL và SQLite, đồng thời sử dụng command-line client của database tương ứng.

<a name="migration-structure"></a>
## Cấu trúc migration

Một class migration chứa hai method: `up` và `down`. Method `up` được dùng để thêm bảng, cột hoặc index mới vào database; trong khi method `down` phải đảo ngược các thao tác đã được thực hiện bởi method `up`.

Trong cả hai method này, bạn có thể sử dụng schema builder của Laravel để tạo và thay đổi bảng bằng API rõ ràng, dễ đọc. Để tìm hiểu tất cả method có trên `Schema` builder, hãy [xem tài liệu tương ứng](#creating-tables). Ví dụ, migration sau tạo bảng `flights`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('airline');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('flights');
    }
};
```

<a name="setting-the-migration-connection"></a>
#### Thiết lập database connection cho migration

Nếu migration tương tác với database connection khác connection mặc định của ứng dụng, bạn nên thiết lập property `$connection` của migration:

```php
/**
 * The database connection that should be used by the migration.
 *
 * @var string
 */
protected $connection = 'pgsql';

/**
 * Run the migrations.
 */
public function up(): void
{
    // ...
}
```

<a name="skipping-migrations"></a>
#### Bỏ qua migration

Đôi khi migration được tạo để hỗ trợ một tính năng chưa kích hoạt và bạn chưa muốn migration đó chạy. Trong trường hợp này, bạn có thể định nghĩa method `shouldRun` trên migration. Nếu `shouldRun` trả về `false`, migration sẽ được bỏ qua:

```php
use App\Models\Flight;
use Laravel\Pennant\Feature;

/**
 * Determine if this migration should run.
 */
public function shouldRun(): bool
{
    return Feature::active(Flight::class);
}
```

<a name="running-migrations"></a>
## Chạy migration

Để chạy tất cả migration đang chờ, hãy thực thi lệnh Artisan `migrate`:

```shell
php artisan migrate
```

Nếu muốn xem migration nào đã chạy và migration nào vẫn đang chờ, bạn có thể sử dụng lệnh Artisan `migrate:status`:

```shell
php artisan migrate:status
```

Nếu truyền tùy chọn `--step` cho lệnh `migrate`, mỗi migration sẽ được chạy như một batch riêng, cho phép bạn rollback từng migration sau đó bằng lệnh `migrate:rollback`:

```shell
php artisan migrate --step
```

Nếu muốn xem các câu lệnh SQL mà migration sẽ thực thi nhưng không thực sự chạy chúng, bạn có thể truyền flag `--pretend` cho lệnh `migrate`:

```shell
php artisan migrate --pretend
```

<a name="isolating-migration-execution"></a>
#### Cô lập quá trình chạy migration

Nếu triển khai ứng dụng trên nhiều server và chạy migration như một phần của quy trình deployment, bạn thường không muốn hai server cố gắng migrate database cùng lúc. Để tránh tình trạng này, bạn có thể sử dụng tùy chọn `isolated` khi gọi lệnh `migrate`.

Khi có tùy chọn `isolated`, Laravel sẽ lấy một atomic lock thông qua cache driver của ứng dụng trước khi cố gắng chạy migration. Mọi lần gọi `migrate` khác trong khi lock đang được giữ sẽ không thực thi migration; tuy nhiên, lệnh vẫn kết thúc với exit status thành công:

```shell
php artisan migrate --isolated
```

> [!WARNING]
> Để sử dụng tính năng này, ứng dụng phải dùng `memcached`, `redis`, `dynamodb`, `database`, `file` hoặc `array` làm cache driver mặc định. Ngoài ra, tất cả server phải giao tiếp với cùng một cache server trung tâm.

<a name="forcing-migrations-to-run-in-production"></a>
#### Buộc chạy migration trong production

Một số thao tác migration có tính phá hủy dữ liệu, nghĩa là chúng có thể khiến bạn mất dữ liệu. Để tránh vô tình chạy các lệnh này trên production database, Laravel sẽ yêu cầu xác nhận trước khi thực thi. Để buộc lệnh chạy mà không hỏi xác nhận, hãy dùng flag `--force`:

```shell
php artisan migrate --force
```

<a name="rolling-back-migrations"></a>
### Rollback migration

Để rollback lần chạy migration gần nhất, bạn có thể sử dụng lệnh Artisan `rollback`. Lệnh này rollback "batch" migration cuối cùng, batch đó có thể chứa nhiều file migration:

```shell
php artisan migrate:rollback
```

Bạn có thể giới hạn số migration cần rollback bằng tùy chọn `step` của lệnh `rollback`. Ví dụ, lệnh sau rollback năm migration gần nhất:

```shell
php artisan migrate:rollback --step=5
```

Bạn có thể rollback một "batch" migration cụ thể bằng tùy chọn `batch` của lệnh `rollback`; giá trị này tương ứng với giá trị batch trong bảng `migrations` của database ứng dụng. Ví dụ, lệnh sau rollback toàn bộ migration thuộc batch số ba:

```shell
php artisan migrate:rollback --batch=3
```

Nếu muốn xem các câu lệnh SQL mà migration sẽ thực thi mà không thực sự chạy chúng, bạn có thể truyền flag `--pretend` cho command `migrate:rollback`:

```shell
php artisan migrate:rollback --pretend
```

Lệnh `migrate:reset` sẽ rollback toàn bộ migration của ứng dụng:

```shell
php artisan migrate:reset
```

<a name="roll-back-migrate-using-a-single-command"></a>
#### Rollback và migrate bằng một lệnh

Lệnh `migrate:refresh` sẽ rollback toàn bộ migration rồi chạy lệnh `migrate`. Về bản chất, lệnh này tạo lại toàn bộ database:

```shell
php artisan migrate:refresh

# Refresh the database and run all database seeds...
php artisan migrate:refresh --seed
```

Bạn có thể giới hạn số migration được rollback và migrate lại bằng tùy chọn `step` của lệnh `refresh`. Ví dụ, lệnh sau rollback rồi migrate lại năm migration gần nhất:

```shell
php artisan migrate:refresh --step=5
```

<a name="drop-all-tables-migrate"></a>
#### Xóa toàn bộ bảng và migrate

Command `migrate:fresh` sẽ xóa toàn bộ table khỏi database rồi thực thi command `migrate`:

```shell
php artisan migrate:fresh

php artisan migrate:fresh --seed
```

Theo mặc định, lệnh `migrate:fresh` chỉ xóa các bảng thuộc database connection mặc định. Tuy nhiên, bạn có thể dùng tùy chọn `--database` để chỉ định database connection cần migrate. Tên connection phải tương ứng với một connection được định nghĩa trong [file cấu hình](/docs/{{version}}/configuration) `database` của ứng dụng:

```shell
php artisan migrate:fresh --database=admin
```

> [!WARNING]
> Lệnh `migrate:fresh` sẽ xóa toàn bộ bảng trong database bất kể prefix của chúng. Hãy đặc biệt thận trọng khi dùng lệnh này trên database được chia sẻ với các ứng dụng khác.

<a name="tables"></a>
## Bảng

<a name="creating-tables"></a>
### Tạo bảng

Để tạo bảng database mới, hãy dùng method `create` trên facade `Schema`. Method `create` nhận hai đối số: đối số thứ nhất là tên bảng; đối số thứ hai là một closure nhận object `Blueprint`, được dùng để định nghĩa bảng mới:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email');
    $table->timestamps();
});
```

Khi tạo bảng, bạn có thể dùng bất kỳ [column method](#creating-columns) nào của schema builder để định nghĩa các cột của bảng.

<a name="determining-table-column-existence"></a>
#### Kiểm tra sự tồn tại của bảng / cột

Bạn có thể kiểm tra sự tồn tại của bảng, cột hoặc index bằng các method `hasTable`, `hasColumn` và `hasIndex`:

```php
if (Schema::hasTable('users')) {
    // The "users" table exists...
}

if (Schema::hasColumn('users', 'email')) {
    // The "users" table exists and has an "email" column...
}

if (Schema::hasIndex('users', ['email'], 'unique')) {
    // The "users" table exists and has a unique index on the "email" column...
}
```

<a name="database-connection-table-options"></a>
#### Database connection và các tùy chọn của bảng

Nếu muốn thực hiện thao tác schema trên database connection không phải connection mặc định của ứng dụng, hãy dùng method `connection`:

```php
Schema::connection('sqlite')->create('users', function (Blueprint $table) {
    $table->id();
});
```

Ngoài ra, một số property và method khác có thể được dùng để định nghĩa các khía cạnh khác khi tạo bảng. Property `engine` cho phép chỉ định storage engine của bảng khi sử dụng MariaDB hoặc MySQL:

```php
Schema::create('users', function (Blueprint $table) {
    $table->engine('InnoDB');

    // ...
});
```

Các property `charset` và `collation` có thể được dùng để chỉ định character set và collation cho bảng được tạo khi sử dụng MariaDB hoặc MySQL:

```php
Schema::create('users', function (Blueprint $table) {
    $table->charset('utf8mb4');
    $table->collation('utf8mb4_unicode_ci');

    // ...
});
```

Method `temporary` có thể được dùng để đánh dấu bảng là bảng "tạm thời". Bảng tạm chỉ hiển thị trong database session của connection hiện tại và tự động bị xóa khi connection đóng:

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->temporary();

    // ...
});
```

Nếu muốn thêm "comment" cho một bảng database, bạn có thể gọi method `comment` trên table instance. Hiện tại table comment chỉ được hỗ trợ bởi MariaDB, MySQL và PostgreSQL:

```php
Schema::create('calculations', function (Blueprint $table) {
    $table->comment('Business calculations');

    // ...
});
```

<a name="updating-tables"></a>
### Cập nhật bảng

Method `table` trên facade `Schema` có thể được dùng để cập nhật bảng hiện có. Tương tự `create`, method `table` nhận hai đối số: tên bảng và một closure nhận instance `Blueprint` mà bạn có thể dùng để thêm cột hoặc index vào bảng:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="renaming-and-dropping-tables"></a>
### Đổi tên / Xóa bảng

Để đổi tên một bảng database hiện có, hãy dùng method `rename`:

```php
use Illuminate\Support\Facades\Schema;

Schema::rename($from, $to);
```

Để xóa một bảng hiện có, bạn có thể dùng method `drop` hoặc `dropIfExists`:

```php
Schema::drop('users');

Schema::dropIfExists('users');
```

<a name="renaming-tables-with-foreign-keys"></a>
#### Đổi tên bảng có khóa ngoại

Trước khi đổi tên bảng, bạn nên đảm bảo mọi ràng buộc khóa ngoại trên bảng đều được đặt tên tường minh trong file migration thay vì để Laravel tự gán tên theo convention. Nếu không, tên ràng buộc khóa ngoại sẽ vẫn tham chiếu đến tên bảng cũ.

<a name="columns"></a>
## Cột

<a name="creating-columns"></a>
### Tạo cột

Method `table` trên facade `Schema` có thể được dùng để cập nhật bảng hiện có. Tương tự method `create`, `table` nhận hai đối số: tên bảng và một closure nhận instance `Illuminate\Database\Schema\Blueprint` mà bạn có thể dùng để thêm cột vào bảng:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->integer('votes');
});
```

<a name="available-column-types"></a>
### Các kiểu cột khả dụng

Blueprint của schema builder cung cấp nhiều method tương ứng với các kiểu cột khác nhau mà bạn có thể thêm vào bảng database. Các method khả dụng được liệt kê bên dưới:

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

    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<a name="booleans-method-list"></a>
#### Kiểu Boolean

<div class="collection-method-list" markdown="1">

[boolean](#column-method-boolean)

</div>

<a name="strings-and-texts-method-list"></a>
#### Kiểu String & Text

<div class="collection-method-list" markdown="1">

[char](#column-method-char)
[longText](#column-method-longText)
[mediumText](#column-method-mediumText)
[string](#column-method-string)
[text](#column-method-text)
[tinyText](#column-method-tinyText)

</div>

<a name="numbers--method-list"></a>
#### Kiểu số

<div class="collection-method-list" markdown="1">

[bigIncrements](#column-method-bigIncrements)
[bigInteger](#column-method-bigInteger)
[decimal](#column-method-decimal)
[double](#column-method-double)
[float](#column-method-float)
[id](#column-method-id)
[increments](#column-method-increments)
[integer](#column-method-integer)
[mediumIncrements](#column-method-mediumIncrements)
[mediumInteger](#column-method-mediumInteger)
[smallIncrements](#column-method-smallIncrements)
[smallInteger](#column-method-smallInteger)
[tinyIncrements](#column-method-tinyIncrements)
[tinyInteger](#column-method-tinyInteger)
[unsignedBigInteger](#column-method-unsignedBigInteger)
[unsignedInteger](#column-method-unsignedInteger)
[unsignedMediumInteger](#column-method-unsignedMediumInteger)
[unsignedSmallInteger](#column-method-unsignedSmallInteger)
[unsignedTinyInteger](#column-method-unsignedTinyInteger)

</div>

<a name="dates-and-times-method-list"></a>
#### Kiểu ngày & giờ

<div class="collection-method-list" markdown="1">

[dateTime](#column-method-dateTime)
[dateTimeTz](#column-method-dateTimeTz)
[date](#column-method-date)
[time](#column-method-time)
[timeTz](#column-method-timeTz)
[timestamp](#column-method-timestamp)
[timestamps](#column-method-timestamps)
[timestampsTz](#column-method-timestampsTz)
[softDeletes](#column-method-softDeletes)
[softDeletesTz](#column-method-softDeletesTz)
[year](#column-method-year)

</div>

<a name="binaries-method-list"></a>
#### Kiểu Binary

<div class="collection-method-list" markdown="1">

[binary](#column-method-binary)

</div>

<a name="object-and-jsons-method-list"></a>
#### Kiểu Object & JSON

<div class="collection-method-list" markdown="1">

[json](#column-method-json)
[jsonb](#column-method-jsonb)

</div>

<a name="uuids-and-ulids-method-list"></a>
#### Kiểu UUID & ULID

<div class="collection-method-list" markdown="1">

[ulid](#column-method-ulid)
[ulidMorphs](#column-method-ulidMorphs)
[uuid](#column-method-uuid)
[uuidMorphs](#column-method-uuidMorphs)
[nullableUlidMorphs](#column-method-nullableUlidMorphs)
[nullableUuidMorphs](#column-method-nullableUuidMorphs)

</div>

<a name="spatials-method-list"></a>
#### Kiểu Spatial

<div class="collection-method-list" markdown="1">

[geography](#column-method-geography)
[geometry](#column-method-geometry)

</div>

<a name="relationship-method-list"></a>
#### Relationship Types

<div class="collection-method-list" markdown="1">

[foreignId](#column-method-foreignId)
[foreignIdFor](#column-method-foreignIdFor)
[foreignUlid](#column-method-foreignUlid)
[foreignUuid](#column-method-foreignUuid)
[foreignUuidFor](#column-method-foreignUuidFor)
[morphs](#column-method-morphs)
[nullableMorphs](#column-method-nullableMorphs)

</div>

<a name="specifics-method-list"></a>
#### Specialty Types

<div class="collection-method-list" markdown="1">

[enum](#column-method-enum)
[set](#column-method-set)
[macAddress](#column-method-macAddress)
[ipAddress](#column-method-ipAddress)
[rememberToken](#column-method-rememberToken)
[vector](#column-method-vector)

</div>

<a name="column-method-bigIncrements"></a>
#### `bigIncrements()` {.collection-method .first-collection-method}

Method `bigIncrements` tạo một column `UNSIGNED BIGINT` tự tăng, tương đương primary key:

```php
$table->bigIncrements('id');
```

<a name="column-method-bigInteger"></a>
#### `bigInteger()` {.collection-method}

Phương thức `bigInteger` tạo một cột tương đương `BIGINT`:

```php
$table->bigInteger('votes');
```

<a name="column-method-binary"></a>
#### `binary()` {.collection-method}

Phương thức `binary` tạo một cột tương đương `BLOB`:

```php
$table->binary('photo');
```

Khi sử dụng MySQL, MariaDB hoặc SQL Server, bạn có thể truyền các đối số `length` và `fixed` để tạo cột tương đương `VARBINARY` hoặc `BINARY`:

```php
$table->binary('data', length: 16); // VARBINARY(16)

$table->binary('data', length: 16, fixed: true); // BINARY(16)
```

<a name="column-method-boolean"></a>
#### `boolean()` {.collection-method}

Phương thức `boolean` tạo một cột tương đương `BOOLEAN`:

```php
$table->boolean('confirmed');
```

<a name="column-method-char"></a>
#### `char()` {.collection-method}

Phương thức `char` tạo một cột tương đương `CHAR` với độ dài được chỉ định:

```php
$table->char('name', length: 100);
```

<a name="column-method-dateTimeTz"></a>
#### `dateTimeTz()` {.collection-method}

Phương thức `dateTimeTz` tạo một cột tương đương `DATETIME` (có múi giờ), với độ chính xác phần thập phân của giây là tùy chọn:

```php
$table->dateTimeTz('created_at', precision: 0);
```

<a name="column-method-dateTime"></a>
#### `dateTime()` {.collection-method}

Phương thức `dateTime` tạo một cột tương đương `DATETIME`, với độ chính xác phần thập phân của giây là tùy chọn:

```php
$table->dateTime('created_at', precision: 0);
```

<a name="column-method-date"></a>
#### `date()` {.collection-method}

Phương thức `date` tạo một cột tương đương `DATE`:

```php
$table->date('created_at');
```

<a name="column-method-decimal"></a>
#### `decimal()` {.collection-method}

Phương thức `decimal` tạo một cột tương đương `DECIMAL` với precision (tổng số chữ số) và scale (số chữ số thập phân) được chỉ định:

```php
$table->decimal('amount', total: 8, places: 2);
```

<a name="column-method-double"></a>
#### `double()` {.collection-method}

Phương thức `double` tạo một cột tương đương `DOUBLE`:

```php
$table->double('amount');
```

<a name="column-method-enum"></a>
#### `enum()` {.collection-method}

Phương thức `enum` tạo một cột tương đương `ENUM` với các giá trị hợp lệ được chỉ định:

```php
$table->enum('difficulty', ['easy', 'hard']);
```

Bạn cũng có thể sử dụng phương thức `Enum::cases()` thay vì tự định nghĩa mảng các giá trị được phép:

```php
use App\Enums\Difficulty;

$table->enum('difficulty', Difficulty::cases());
```

<a name="column-method-float"></a>
#### `float()` {.collection-method}

Phương thức `float` tạo một cột tương đương `FLOAT` với precision được chỉ định:

```php
$table->float('amount', precision: 53);
```

<a name="column-method-foreignId"></a>
#### `foreignId()` {.collection-method}

Phương thức `foreignId` tạo một cột tương đương `UNSIGNED BIGINT`:

```php
$table->foreignId('user_id');
```

<a name="column-method-foreignIdFor"></a>
#### `foreignIdFor()` {.collection-method}

Phương thức `foreignIdFor` thêm một cột `{column}_id` tương ứng cho model class được chỉ định. Kiểu cột sẽ là `UNSIGNED BIGINT`, `CHAR(36)` hoặc `CHAR(26)` tùy theo kiểu khóa của model:

```php
$table->foreignIdFor(User::class);
```

<a name="column-method-foreignUlid"></a>
#### `foreignUlid()` {.collection-method}

Phương thức `foreignUlid` tạo một cột tương đương `ULID`:

```php
$table->foreignUlid('user_id');
```

<a name="column-method-foreignUuid"></a>
#### `foreignUuid()` {.collection-method}

Phương thức `foreignUuid` tạo một cột tương đương `UUID`:

```php
$table->foreignUuid('user_id');
```

<a name="column-method-foreignUuidFor"></a>
#### `foreignUuidFor()` {.collection-method}

Phương thức `foreignUuidFor` thêm một cột `{column}_id` tương đương UUID cho model class được chỉ định:

```php
$table->foreignUuidFor(User::class);
```

<a name="column-method-geography"></a>
#### `geography()` {.collection-method}

Phương thức `geography` tạo một cột tương đương `GEOGRAPHY` với kiểu dữ liệu không gian và SRID (Spatial Reference System Identifier) được chỉ định:

```php
$table->geography('coordinates', subtype: 'point', srid: 4326);
```

> [!NOTE]
> Khả năng hỗ trợ các kiểu dữ liệu không gian phụ thuộc vào database driver. Hãy tham khảo tài liệu của cơ sở dữ liệu bạn đang sử dụng. Nếu ứng dụng sử dụng PostgreSQL, bạn phải cài extension [PostGIS](https://postgis.net) trước khi có thể dùng phương thức `geography`.

<a name="column-method-geometry"></a>
#### `geometry()` {.collection-method}

Phương thức `geometry` tạo một cột tương đương `GEOMETRY` với kiểu dữ liệu không gian và SRID (Spatial Reference System Identifier) được chỉ định:

```php
$table->geometry('positions', subtype: 'point', srid: 0);
```

> [!NOTE]
> Khả năng hỗ trợ các kiểu dữ liệu không gian phụ thuộc vào database driver. Hãy tham khảo tài liệu của cơ sở dữ liệu bạn đang sử dụng. Nếu ứng dụng sử dụng PostgreSQL, bạn phải cài extension [PostGIS](https://postgis.net) trước khi có thể dùng phương thức `geometry`.

<a name="column-method-id"></a>
#### `id()` {.collection-method}

Phương thức `id` là alias của `bigIncrements`. Theo mặc định, phương thức này tạo cột `id`; tuy nhiên, bạn có thể truyền tên cột nếu muốn sử dụng một tên khác:

```php
$table->id();
```

<a name="column-method-increments"></a>
#### `increments()` {.collection-method}

Phương thức `increments` tạo một cột tương đương `UNSIGNED INTEGER` tự tăng làm khóa chính:

```php
$table->increments('id');
```

<a name="column-method-integer"></a>
#### `integer()` {.collection-method}

Phương thức `integer` tạo một cột tương đương `INTEGER`:

```php
$table->integer('votes');
```

<a name="column-method-ipAddress"></a>
#### `ipAddress()` {.collection-method}

Phương thức `ipAddress` tạo một cột tương đương `VARCHAR`:

```php
$table->ipAddress('visitor');
```

Khi sử dụng PostgreSQL, một cột `INET` sẽ được tạo.

<a name="column-method-json"></a>
#### `json()` {.collection-method}

Phương thức `json` tạo một cột tương đương `JSON`:

```php
$table->json('options');
```

Khi sử dụng SQLite, một cột `TEXT` sẽ được tạo.

<a name="column-method-jsonb"></a>
#### `jsonb()` {.collection-method}

Phương thức `jsonb` tạo một cột tương đương `JSONB`:

```php
$table->jsonb('options');
```

Khi sử dụng SQLite, một cột `TEXT` sẽ được tạo.

<a name="column-method-longText"></a>
#### `longText()` {.collection-method}

Phương thức `longText` tạo một cột tương đương `LONGTEXT`:

```php
$table->longText('description');
```

Khi sử dụng MySQL hoặc MariaDB, bạn có thể áp dụng character set `binary` cho cột để tạo một cột tương đương `LONGBLOB`:

```php
$table->longText('data')->charset('binary'); // LONGBLOB
```

<a name="column-method-macAddress"></a>
#### `macAddress()` {.collection-method}

Phương thức `macAddress` tạo một cột dùng để lưu địa chỉ MAC. Một số hệ quản trị cơ sở dữ liệu như PostgreSQL có kiểu cột chuyên dụng cho loại dữ liệu này; các hệ khác sẽ sử dụng cột tương đương kiểu chuỗi:

```php
$table->macAddress('device');
```

<a name="column-method-mediumIncrements"></a>
#### `mediumIncrements()` {.collection-method}

Phương thức `mediumIncrements` tạo một cột tương đương `UNSIGNED MEDIUMINT` tự tăng làm khóa chính:

```php
$table->mediumIncrements('id');
```

<a name="column-method-mediumInteger"></a>
#### `mediumInteger()` {.collection-method}

Phương thức `mediumInteger` tạo một cột tương đương `MEDIUMINT`:

```php
$table->mediumInteger('votes');
```

<a name="column-method-mediumText"></a>
#### `mediumText()` {.collection-method}

Phương thức `mediumText` tạo một cột tương đương `MEDIUMTEXT`:

```php
$table->mediumText('description');
```

Khi sử dụng MySQL hoặc MariaDB, bạn có thể áp dụng character set `binary` cho cột để tạo một cột tương đương `MEDIUMBLOB`:

```php
$table->mediumText('data')->charset('binary'); // MEDIUMBLOB
```

<a name="column-method-morphs"></a>
#### `morphs()` {.collection-method}

Phương thức `morphs` là một phương thức tiện ích, thêm cột `{column}_type` tương đương `VARCHAR` và cột `{column}_id` tương ứng. Kiểu của cột `{column}_id` sẽ là `UNSIGNED BIGINT`, `CHAR(36)` hoặc `CHAR(26)` tùy theo kiểu khóa của model.

Phương thức này được dùng khi định nghĩa các cột cần thiết cho [quan hệ Eloquent đa hình](/docs/{{version}}/eloquent-relationships). Trong ví dụ sau, các cột `taggable_type` và `taggable_id` sẽ được tạo:

```php
$table->morphs('taggable');
```

<a name="column-method-nullableMorphs"></a>
#### `nullableMorphs()` {.collection-method}

Phương thức này tương tự [morphs](#column-method-morphs), nhưng các cột được tạo sẽ cho phép `null`:

```php
$table->nullableMorphs('taggable');
```

<a name="column-method-nullableUlidMorphs"></a>
#### `nullableUlidMorphs()` {.collection-method}

Phương thức này tương tự [ulidMorphs](#column-method-ulidMorphs), nhưng các cột được tạo sẽ cho phép `null`:

```php
$table->nullableUlidMorphs('taggable');
```

<a name="column-method-nullableUuidMorphs"></a>
#### `nullableUuidMorphs()` {.collection-method}

Phương thức này tương tự [uuidMorphs](#column-method-uuidMorphs), nhưng các cột được tạo sẽ cho phép `null`:

```php
$table->nullableUuidMorphs('taggable');
```

<a name="column-method-rememberToken"></a>
#### `rememberToken()` {.collection-method}

Phương thức `rememberToken` tạo một cột tương đương `VARCHAR(100)` cho phép `null`, dùng để lưu [authentication token](/docs/{{version}}/authentication#remembering-users) hiện tại của chức năng "remember me":

```php
$table->rememberToken();
```

<a name="column-method-set"></a>
#### `set()` {.collection-method}

Phương thức `set` tạo một cột tương đương `SET` với danh sách các giá trị hợp lệ được chỉ định:

```php
$table->set('flavors', ['strawberry', 'vanilla']);
```

<a name="column-method-smallIncrements"></a>
#### `smallIncrements()` {.collection-method}

Phương thức `smallIncrements` tạo một cột tương đương `UNSIGNED SMALLINT` tự tăng làm khóa chính:

```php
$table->smallIncrements('id');
```

<a name="column-method-smallInteger"></a>
#### `smallInteger()` {.collection-method}

Phương thức `smallInteger` tạo một cột tương đương `SMALLINT`:

```php
$table->smallInteger('votes');
```

<a name="column-method-softDeletesTz"></a>
#### `softDeletesTz()` {.collection-method}

Phương thức `softDeletesTz` thêm cột `deleted_at` tương đương `TIMESTAMP` (có múi giờ), cho phép `null` và có thể chỉ định độ chính xác phần thập phân của giây. Cột này lưu timestamp `deleted_at` cần cho chức năng "soft delete" của Eloquent:

```php
$table->softDeletesTz('deleted_at', precision: 0);
```

<a name="column-method-softDeletes"></a>
#### `softDeletes()` {.collection-method}

Phương thức `softDeletes` thêm cột `deleted_at` tương đương `TIMESTAMP`, cho phép `null` và có thể chỉ định độ chính xác phần thập phân của giây. Cột này lưu timestamp `deleted_at` cần cho chức năng "soft delete" của Eloquent:

```php
$table->softDeletes('deleted_at', precision: 0);
```

<a name="column-method-string"></a>
#### `string()` {.collection-method}

Phương thức `string` tạo một cột tương đương `VARCHAR` với độ dài được chỉ định:

```php
$table->string('name', length: 100);
```

<a name="column-method-text"></a>
#### `text()` {.collection-method}

Phương thức `text` tạo một cột tương đương `TEXT`:

```php
$table->text('description');
```

Khi sử dụng MySQL hoặc MariaDB, bạn có thể áp dụng character set `binary` cho cột để tạo một cột tương đương `BLOB`:

```php
$table->text('data')->charset('binary'); // BLOB
```

<a name="column-method-timeTz"></a>
#### `timeTz()` {.collection-method}

Phương thức `timeTz` tạo một cột tương đương `TIME` (có múi giờ), với độ chính xác phần thập phân của giây là tùy chọn:

```php
$table->timeTz('sunrise', precision: 0);
```

<a name="column-method-time"></a>
#### `time()` {.collection-method}

Phương thức `time` tạo một cột tương đương `TIME`, với độ chính xác phần thập phân của giây là tùy chọn:

```php
$table->time('sunrise', precision: 0);
```

<a name="column-method-timestampTz"></a>
#### `timestampTz()` {.collection-method}

Phương thức `timestampTz` tạo một cột tương đương `TIMESTAMP` (có múi giờ), với độ chính xác phần thập phân của giây là tùy chọn:

```php
$table->timestampTz('added_at', precision: 0);
```

<a name="column-method-timestamp"></a>
#### `timestamp()` {.collection-method}

Phương thức `timestamp` tạo một cột tương đương `TIMESTAMP`, với độ chính xác phần thập phân của giây là tùy chọn:

```php
$table->timestamp('added_at', precision: 0);
```

<a name="column-method-timestampsTz"></a>
#### `timestampsTz()` {.collection-method}

Phương thức `timestampsTz` tạo các cột `created_at` và `updated_at` tương đương `TIMESTAMP` (có múi giờ), với độ chính xác phần thập phân của giây là tùy chọn:

```php
$table->timestampsTz(precision: 0);
```

<a name="column-method-timestamps"></a>
#### `timestamps()` {.collection-method}

Phương thức `timestamps` tạo các cột `created_at` và `updated_at` tương đương `TIMESTAMP`, với độ chính xác phần thập phân của giây là tùy chọn:

```php
$table->timestamps(precision: 0);
```

<a name="column-method-tinyIncrements"></a>
#### `tinyIncrements()` {.collection-method}

Phương thức `tinyIncrements` tạo một cột tương đương `UNSIGNED TINYINT` tự tăng làm khóa chính:

```php
$table->tinyIncrements('id');
```

<a name="column-method-tinyInteger"></a>
#### `tinyInteger()` {.collection-method}

Phương thức `tinyInteger` tạo một cột tương đương `TINYINT`:

```php
$table->tinyInteger('votes');
```

<a name="column-method-tinyText"></a>
#### `tinyText()` {.collection-method}

Phương thức `tinyText` tạo một cột tương đương `TINYTEXT`:

```php
$table->tinyText('notes');
```

Khi sử dụng MySQL hoặc MariaDB, bạn có thể áp dụng character set `binary` cho cột để tạo một cột tương đương `TINYBLOB`:

```php
$table->tinyText('data')->charset('binary'); // TINYBLOB
```

<a name="column-method-unsignedBigInteger"></a>
#### `unsignedBigInteger()` {.collection-method}

Phương thức `unsignedBigInteger` tạo một cột tương đương `UNSIGNED BIGINT`:

```php
$table->unsignedBigInteger('votes');
```

<a name="column-method-unsignedInteger"></a>
#### `unsignedInteger()` {.collection-method}

Phương thức `unsignedInteger` tạo một cột tương đương `UNSIGNED INTEGER`:

```php
$table->unsignedInteger('votes');
```

<a name="column-method-unsignedMediumInteger"></a>
#### `unsignedMediumInteger()` {.collection-method}

Phương thức `unsignedMediumInteger` tạo một cột tương đương `UNSIGNED MEDIUMINT`:

```php
$table->unsignedMediumInteger('votes');
```

<a name="column-method-unsignedSmallInteger"></a>
#### `unsignedSmallInteger()` {.collection-method}

Phương thức `unsignedSmallInteger` tạo một cột tương đương `UNSIGNED SMALLINT`:

```php
$table->unsignedSmallInteger('votes');
```

<a name="column-method-unsignedTinyInteger"></a>
#### `unsignedTinyInteger()` {.collection-method}

Phương thức `unsignedTinyInteger` tạo một cột tương đương `UNSIGNED TINYINT`:

```php
$table->unsignedTinyInteger('votes');
```

<a name="column-method-ulidMorphs"></a>
#### `ulidMorphs()` {.collection-method}

Phương thức `ulidMorphs` là một phương thức tiện ích, thêm cột `{column}_type` tương đương `VARCHAR` và cột `{column}_id` tương đương `CHAR(26)`.

Phương thức này được dùng khi định nghĩa các cột cần thiết cho [quan hệ Eloquent đa hình](/docs/{{version}}/eloquent-relationships) sử dụng định danh ULID. Trong ví dụ sau, các cột `taggable_type` và `taggable_id` sẽ được tạo:

```php
$table->ulidMorphs('taggable');
```

<a name="column-method-uuidMorphs"></a>
#### `uuidMorphs()` {.collection-method}

Phương thức `uuidMorphs` là một phương thức tiện ích, thêm cột `{column}_type` tương đương `VARCHAR` và cột `{column}_id` tương đương `CHAR(36)`.

Phương thức này được dùng khi định nghĩa các cột cần thiết cho [quan hệ Eloquent đa hình](/docs/{{version}}/eloquent-relationships#polymorphic-relationships) sử dụng định danh UUID. Trong ví dụ sau, các cột `taggable_type` và `taggable_id` sẽ được tạo:

```php
$table->uuidMorphs('taggable');
```

<a name="column-method-ulid"></a>
#### `ulid()` {.collection-method}

Phương thức `ulid` tạo một cột tương đương `ULID`:

```php
$table->ulid('id');
```

<a name="column-method-uuid"></a>
#### `uuid()` {.collection-method}

Phương thức `uuid` tạo một cột tương đương `UUID`:

```php
$table->uuid('id');
```

<a name="column-method-vector"></a>
#### `vector()` {.collection-method}

Phương thức `vector` tạo một cột tương đương `vector`:

```php
$table->vector('embedding', dimensions: 100);
```

Khi sử dụng PostgreSQL, extension `pgvector` phải được nạp trước khi có thể tạo các cột `vector`:

```php
Schema::ensureVectorExtensionExists();
```

<a name="column-method-year"></a>
#### `year()` {.collection-method}

Phương thức `year` tạo một cột tương đương `YEAR`:

```php
$table->year('birth_year');
```

<a name="column-modifiers"></a>
### Bộ điều chỉnh cột

Ngoài các kiểu cột được liệt kê ở trên, Laravel cung cấp một số "modifier" mà bạn có thể dùng khi thêm cột vào bảng cơ sở dữ liệu. Ví dụ, để cho phép cột nhận giá trị `null`, bạn có thể sử dụng phương thức `nullable`:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable();
});
```

Bảng sau liệt kê toàn bộ column modifier hiện có. Danh sách này không bao gồm [index modifier](#creating-indexes):

<div class="overflow-auto">

| Modifier                            | Description                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| `->after('column')`                 | Đặt cột "sau" một cột khác (MariaDB / MySQL).                                     |
| `->autoIncrement()`                 | Đặt cột `INTEGER` thành tự tăng (khóa chính).                                      |
| `->charset('utf8mb4')`              | Chỉ định character set cho cột (MariaDB / MySQL).                                      |
| `->collation('utf8mb4_unicode_ci')` | Chỉ định collation cho cột.                                                            |
| `->comment('my comment')`           | Add a comment to a column (MariaDB / MySQL / PostgreSQL).                                      |
| `->default($value)`                 | Chỉ định value "default" cho column.                                                        |
| `->first()`                         | Đặt column ở vị trí "đầu tiên" trong table (MariaDB / MySQL).                               |
| `->from($integer)`                  | Đặt giá trị bắt đầu của field tự tăng (MariaDB / MySQL / PostgreSQL).                         |
| `->instant()`                       | Thêm hoặc chỉnh sửa column bằng instant operation (MySQL).                                    |
| `->invisible()`                     | Làm column "ẩn" khỏi các query `SELECT *` (MariaDB / MySQL).                                 |
| `->lock($mode)`                     | Specify a lock mode for the column operation (MySQL).                                          |
| `->nullable($value = true)`         | Cho phép chèn giá trị `NULL` vào cột.                                            |
| `->storedAs($expression)`           | Create a stored generated column (MariaDB / MySQL / PostgreSQL / SQLite).                      |
| `->unsigned()`                      | Đặt cột `INTEGER` thành `UNSIGNED` (MariaDB / MySQL).                                         |
| `->using($expression)`              | Specify a casting expression when changing the column type (PostgreSQL).                       |
| `->useCurrent()`                    | Đặt column `TIMESTAMP` dùng `CURRENT_TIMESTAMP` làm default value.                             |
| `->useCurrentOnUpdate()`            | Đặt column `TIMESTAMP` dùng `CURRENT_TIMESTAMP` khi record được update (MariaDB / MySQL).      |
| `->virtualAs($expression)`          | Create a virtual generated column (MariaDB / MySQL / SQLite).                                  |
| `->generatedAs($expression)`        | Tạo identity column với sequence option đã chỉ định (PostgreSQL).                              |
| `->always()`                        | Định nghĩa độ ưu tiên của sequence value so với input cho identity column (PostgreSQL).        |

</div>

<a name="default-expressions"></a>
#### Biểu thức mặc định

Modifier `default` chấp nhận một giá trị hoặc một instance của `Illuminate\Database\Query\Expression`. Khi dùng `Expression`, Laravel sẽ không đặt giá trị trong dấu nháy, nhờ đó bạn có thể sử dụng các hàm đặc thù của cơ sở dữ liệu. Cách này đặc biệt hữu ích khi cần gán giá trị mặc định cho các cột JSON:

```php
<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->json('movies')->default(new Expression('(JSON_ARRAY())'));
            $table->timestamps();
        });
    }
};
```

> [!WARNING]
> Khả năng hỗ trợ default expression phụ thuộc vào database driver, phiên bản cơ sở dữ liệu và kiểu trường. Hãy tham khảo tài liệu của cơ sở dữ liệu bạn đang sử dụng.

<a name="column-order"></a>
#### Thứ tự cột

Khi sử dụng MariaDB hoặc MySQL, bạn có thể dùng phương thức `after` để thêm các cột sau một cột đã tồn tại trong schema:

```php
$table->after('password', function (Blueprint $table) {
    $table->string('address_line1');
    $table->string('address_line2');
    $table->string('city');
});
```

<a name="instant-column-operations"></a>
#### Thao tác cột tức thời

Khi sử dụng MySQL, bạn có thể nối modifier `instant` vào định nghĩa cột để yêu cầu thêm hoặc sửa cột bằng thuật toán "instant" của MySQL. Thuật toán này cho phép thực hiện một số thay đổi schema mà không cần rebuild toàn bộ bảng, vì vậy thao tác gần như tức thời bất kể kích thước bảng:

```php
$table->string('name')->nullable()->instant();
```

Việc thêm cột bằng `instant` chỉ có thể nối cột vào cuối bảng, vì vậy modifier `instant` không thể kết hợp với `after` hoặc `first`. Ngoài ra, thuật toán này không hỗ trợ mọi kiểu cột hay mọi thao tác. Nếu thao tác được yêu cầu không tương thích, MySQL sẽ phát sinh lỗi.

Hãy tham khảo [tài liệu MySQL](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl-operations.html) để xác định những thao tác nào tương thích với việc sửa cột bằng `instant`.

<a name="ddl-locking"></a>
#### Khóa DDL

Khi sử dụng MySQL, bạn có thể nối modifier `lock` vào định nghĩa cột, index hoặc foreign key để kiểm soát việc khóa bảng trong các thao tác schema. MySQL hỗ trợ nhiều chế độ khóa: `none` cho phép đọc và ghi đồng thời; `shared` cho phép đọc đồng thời nhưng chặn ghi; `exclusive` chặn mọi truy cập đồng thời; còn `default` để MySQL tự chọn chế độ phù hợp nhất:

```php
$table->string('name')->lock('none');

$table->index('email')->lock('shared');
```

Nếu chế độ khóa được yêu cầu không tương thích với thao tác, MySQL sẽ phát sinh lỗi. Modifier `lock` có thể kết hợp với `instant` để tối ưu thêm các thay đổi schema:

```php
$table->string('name')->instant()->lock('none');
```

<a name="modifying-columns"></a>
### Sửa đổi cột

Phương thức `change` cho phép bạn thay đổi kiểu và các thuộc tính của cột hiện có. Ví dụ, bạn có thể muốn tăng kích thước của một cột `string`. Trong ví dụ sau, kích thước cột `name` được tăng từ 25 lên 50 bằng cách định nghĩa trạng thái mới của cột rồi gọi `change`:

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('name', 50)->change();
});
```

Khi sửa một cột, bạn phải khai báo rõ tất cả modifier muốn giữ lại trong định nghĩa cột; mọi thuộc tính bị bỏ sót sẽ bị loại bỏ. Ví dụ, để giữ các thuộc tính `unsigned`, `default` và `comment`, bạn phải gọi rõ từng modifier khi thay đổi cột:

```php
Schema::table('users', function (Blueprint $table) {
    $table->integer('votes')->unsigned()->default(1)->comment('my comment')->change();
});
```

Phương thức `change` không thay đổi các index của cột. Vì vậy, bạn có thể sử dụng index modifier để thêm hoặc xóa index một cách tường minh khi sửa cột:

```php
// Add an index...
$table->bigIncrements('id')->primary()->change();

// Drop an index...
$table->char('postal_code', 10)->unique(false)->change();
```

<a name="postgresql-column-modifications"></a>
#### Sửa đổi cột trên PostgreSQL

Khi thay đổi kiểu của cột trên PostgreSQL, bạn có thể dùng modifier `using` để chỉ định biểu thức dùng để ép kiểu các giá trị hiện có:

```php
Schema::table('users', function (Blueprint $table) {
    $table->date('birthday')->using('birthday::date')->change();
});
```

<a name="renaming-columns"></a>
### Đổi tên cột

Để đổi tên một cột, bạn có thể sử dụng phương thức `renameColumn` do schema builder cung cấp:

```php
Schema::table('users', function (Blueprint $table) {
    $table->renameColumn('from', 'to');
});
```

<a name="dropping-columns"></a>
### Xóa cột

Để xóa một cột, bạn có thể sử dụng phương thức `dropColumn` trên schema builder:

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn('votes');
});
```

Bạn có thể xóa nhiều cột khỏi một bảng bằng cách truyền mảng tên cột vào phương thức `dropColumn`:

```php
Schema::table('users', function (Blueprint $table) {
    $table->dropColumn(['votes', 'avatar', 'location']);
});
```

<a name="available-command-aliases"></a>
#### Các command alias hiện có

Laravel cung cấp một số phương thức tiện ích để xóa các loại cột thường gặp. Các phương thức này được mô tả trong bảng dưới đây:

<div class="overflow-auto">

| Command                             | Description                                           |
| ----------------------------------- | ----------------------------------------------------- |
| `$table->dropMorphs('morphable');`  | Xóa các cột `morphable_type` và `morphable_id`. |
| `$table->dropRememberToken();`      | Xóa cột `remember_token`.                     |
| `$table->dropSoftDeletes();`        | Xóa cột `deleted_at`.                         |
| `$table->dropSoftDeletesTz();`      | Alias của phương thức `dropSoftDeletes()`.                  |
| `$table->dropTimestamps();`         | Xóa các cột `created_at` và `updated_at`.       |
| `$table->dropTimestampsTz();`       | Alias của phương thức `dropTimestamps()`.                   |

</div>

<a name="indexes"></a>
## Chỉ mục

<a name="creating-indexes"></a>
### Tạo chỉ mục

Schema Builder của Laravel hỗ trợ nhiều loại chỉ mục. Ví dụ sau tạo một cột `email` mới và quy định rằng các giá trị của cột này phải là duy nhất. Để tạo chỉ mục, chúng ta có thể nối phương thức `unique` vào định nghĩa cột:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('users', function (Blueprint $table) {
    $table->string('email')->unique();
});
```

Ngoài ra, bạn có thể tạo chỉ mục sau khi đã định nghĩa cột. Để thực hiện, hãy gọi phương thức `unique` trên blueprint của Schema Builder. Phương thức này nhận tên cột cần được tạo chỉ mục duy nhất:

```php
$table->unique('email');
```

Bạn cũng có thể truyền một mảng các cột vào phương thức tạo chỉ mục để tạo chỉ mục ghép (compound hoặc composite index):

```php
$table->index(['account_id', 'created_at']);
```

Khi tạo chỉ mục, Laravel sẽ tự động sinh tên chỉ mục dựa trên tên bảng, tên các cột và loại chỉ mục. Tuy nhiên, bạn có thể truyền đối số thứ hai cho phương thức để tự chỉ định tên chỉ mục:

```php
$table->unique('email', 'unique_email');
```

<a name="available-index-types"></a>
#### Các loại chỉ mục hiện có

Lớp blueprint của Schema Builder cung cấp các phương thức để tạo từng loại chỉ mục mà Laravel hỗ trợ. Mỗi phương thức tạo chỉ mục nhận một đối số thứ hai tùy chọn để chỉ định tên chỉ mục. Nếu bỏ qua, tên sẽ được suy ra từ tên bảng, tên cột hoặc các cột được dùng cho chỉ mục và loại chỉ mục. Các phương thức tạo chỉ mục hiện có được mô tả trong bảng dưới đây:

<div class="overflow-auto">

| Lệnh                                             | Mô tả                                                          |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `$table->primary('id');`                         | Thêm khóa chính.                                               |
| `$table->primary(['id', 'parent_id']);`          | Thêm khóa chính ghép.                                          |
| `$table->unique('email');`                       | Thêm chỉ mục duy nhất.                                         |
| `$table->index('state');`                        | Thêm chỉ mục.                                                  |
| `$table->fullText('body');`                      | Thêm chỉ mục full-text (MariaDB / MySQL / PostgreSQL).         |
| `$table->fullText('body')->language('english');` | Thêm chỉ mục full-text cho ngôn ngữ được chỉ định (PostgreSQL). |
| `$table->spatialIndex('location');`              | Thêm chỉ mục không gian (ngoại trừ SQLite).                    |

</div>

<a name="online-index-creation"></a>
#### Tạo chỉ mục online

Theo mặc định, việc tạo chỉ mục trên một bảng lớn có thể khóa bảng và chặn thao tác đọc hoặc ghi trong khi chỉ mục đang được xây dựng. Khi sử dụng PostgreSQL hoặc SQL Server, bạn có thể nối phương thức `online` vào định nghĩa chỉ mục để tạo chỉ mục mà không khóa bảng, nhờ đó ứng dụng vẫn có thể tiếp tục đọc và ghi dữ liệu trong quá trình tạo chỉ mục:

```php
$table->string('email')->unique()->online();
```

Khi sử dụng PostgreSQL, thao tác này thêm tùy chọn `CONCURRENTLY` vào câu lệnh tạo chỉ mục. Khi sử dụng SQL Server, nó thêm tùy chọn `WITH (online = on)`.

<a name="renaming-indexes"></a>
### Đổi tên chỉ mục

Để đổi tên một chỉ mục, bạn có thể sử dụng phương thức `renameIndex` do blueprint của Schema Builder cung cấp. Phương thức này nhận tên hiện tại của chỉ mục làm đối số thứ nhất và tên mong muốn làm đối số thứ hai:

```php
$table->renameIndex('from', 'to')
```

<a name="dropping-indexes"></a>
### Xóa chỉ mục

Để xóa một chỉ mục, bạn phải chỉ định tên của chỉ mục. Theo mặc định, Laravel tự động gán tên chỉ mục dựa trên tên bảng, tên cột được đánh chỉ mục và loại chỉ mục. Dưới đây là một số ví dụ:

<div class="overflow-auto">

| Lệnh                                                     | Mô tả                                                      |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| `$table->dropPrimary('users_id_primary');`               | Xóa khóa chính khỏi bảng `users`.                          |
| `$table->dropUnique('users_email_unique');`              | Xóa chỉ mục duy nhất khỏi bảng `users`.                    |
| `$table->dropIndex('geo_state_index');`                  | Xóa chỉ mục cơ bản khỏi bảng `geo`.                        |
| `$table->dropFullText('posts_body_fulltext');`           | Xóa chỉ mục full-text khỏi bảng `posts`.                   |
| `$table->dropSpatialIndex('geo_location_spatialindex');` | Xóa chỉ mục không gian khỏi bảng `geo` (ngoại trừ SQLite). |

</div>

Nếu truyền một mảng cột vào phương thức xóa chỉ mục, tên chỉ mục theo convention sẽ được tạo dựa trên tên bảng, các cột và loại chỉ mục:

```php
Schema::table('geo', function (Blueprint $table) {
    $table->dropIndex(['state']); // Drops index 'geo_state_index'
});
```

<a name="foreign-key-constraints"></a>
### Ràng buộc khóa ngoại

Laravel cũng hỗ trợ tạo các ràng buộc khóa ngoại, được dùng để đảm bảo tính toàn vẹn tham chiếu ở cấp cơ sở dữ liệu. Ví dụ, hãy định nghĩa cột `user_id` trên bảng `posts` tham chiếu đến cột `id` của bảng `users`:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('posts', function (Blueprint $table) {
    $table->unsignedBigInteger('user_id');

    $table->foreign('user_id')->references('id')->on('users');
});
```

Vì cú pháp này khá dài, Laravel cung cấp thêm các phương thức ngắn gọn hơn, tận dụng convention để mang lại trải nghiệm phát triển thuận tiện hơn. Khi sử dụng phương thức `foreignId` để tạo cột, ví dụ trên có thể được viết lại như sau:

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained();
});
```

Phương thức `foreignId` tạo một cột tương đương `UNSIGNED BIGINT`, còn phương thức `constrained` sử dụng convention để xác định bảng và cột được tham chiếu. Nếu tên bảng không tuân theo convention của Laravel, bạn có thể truyền tên bảng thủ công vào phương thức `constrained`. Ngoài ra, bạn cũng có thể chỉ định tên cho chỉ mục được tạo:

```php
Schema::table('posts', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained(
        table: 'users', indexName: 'posts_user_id'
    );
});
```

Bạn cũng có thể chỉ định hành động mong muốn cho các thuộc tính "on delete" và "on update" của ràng buộc:

```php
$table->foreignId('user_id')
    ->constrained()
    ->onUpdate('cascade')
    ->onDelete('cascade');
```

Laravel cũng cung cấp một cú pháp thay thế dễ đọc hơn cho các hành động này:

<div class="overflow-auto">

| Phương thức                    | Mô tả                                             |
| ----------------------------- | ------------------------------------------------- |
| `$table->cascadeOnUpdate();`  | Các cập nhật sẽ được cascade.                     |
| `$table->restrictOnUpdate();` | Hạn chế thao tác cập nhật.                        |
| `$table->nullOnUpdate();`     | Khi cập nhật, đặt giá trị khóa ngoại thành null.  |
| `$table->noActionOnUpdate();` | Không thực hiện hành động khi cập nhật.           |
| `$table->cascadeOnDelete();`  | Các thao tác xóa sẽ được cascade.                 |
| `$table->restrictOnDelete();` | Hạn chế thao tác xóa.                             |
| `$table->nullOnDelete();`     | Khi xóa, đặt giá trị khóa ngoại thành null.       |
| `$table->noActionOnDelete();` | Ngăn thao tác xóa nếu tồn tại bản ghi con.        |

</div>

Mọi [column modifier](#column-modifiers) bổ sung phải được gọi trước phương thức `constrained`:

```php
$table->foreignId('user_id')
    ->nullable()
    ->constrained();
```

<a name="dropping-foreign-keys"></a>
#### Xóa khóa ngoại

Để xóa một khóa ngoại, bạn có thể sử dụng phương thức `dropForeign` và truyền tên ràng buộc khóa ngoại cần xóa làm đối số. Ràng buộc khóa ngoại sử dụng cùng convention đặt tên với chỉ mục. Nói cách khác, tên ràng buộc khóa ngoại được tạo dựa trên tên bảng và các cột trong ràng buộc, sau đó thêm hậu tố `\_foreign`:

```php
$table->dropForeign('posts_user_id_foreign');
```

Ngoài ra, bạn có thể truyền vào phương thức `dropForeign` một mảng chứa tên cột giữ khóa ngoại. Mảng này sẽ được chuyển thành tên ràng buộc khóa ngoại theo convention đặt tên ràng buộc của Laravel:

```php
$table->dropForeign(['user_id']);
```

<a name="toggling-foreign-key-constraints"></a>
#### Bật và tắt ràng buộc khóa ngoại

Bạn có thể bật hoặc tắt các ràng buộc khóa ngoại trong migration bằng các phương thức sau:

```php
Schema::enableForeignKeyConstraints();

Schema::disableForeignKeyConstraints();

Schema::withoutForeignKeyConstraints(function () {
    // Constraints disabled within this closure...
});
```

> [!WARNING]
> SQLite mặc định tắt các ràng buộc khóa ngoại. Khi sử dụng SQLite, hãy đảm bảo đã [bật hỗ trợ khóa ngoại](/docs/{{version}}/database#configuration) trong cấu hình cơ sở dữ liệu trước khi cố gắng tạo chúng trong migration.

<a name="events"></a>
## Sự kiện

Để thuận tiện, mỗi thao tác migration sẽ phát một [event](/docs/{{version}}/events). Tất cả các event sau đều kế thừa lớp cơ sở `Illuminate\Database\Events\MigrationEvent`:

<div class="overflow-auto">

| Class                                            | Mô tả                                            |
| ------------------------------------------------ | ------------------------------------------------ |
| `Illuminate\Database\Events\DatabaseRefreshed`   | Lệnh `migrate:refresh` đã hoàn tất.              |
| `Illuminate\Database\Events\MigrationsStarted`   | Một batch migration sắp được thực thi.           |
| `Illuminate\Database\Events\MigrationsEnded`     | Một batch migration đã hoàn tất.                 |
| `Illuminate\Database\Events\MigrationStarted`    | Một migration đơn lẻ sắp được thực thi.          |
| `Illuminate\Database\Events\MigrationEnded`      | Một migration đơn lẻ đã hoàn tất.                |
| `Illuminate\Database\Events\NoPendingMigrations` | Lệnh migration không tìm thấy migration đang chờ.|
| `Illuminate\Database\Events\SchemaDumped`        | Quá trình dump schema cơ sở dữ liệu đã hoàn tất. |
| `Illuminate\Database\Events\SchemaLoaded`        | Một bản dump schema hiện có đã được nạp.          |

</div>

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/migrations). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
