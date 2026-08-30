# Cơ sở dữ liệu: Bắt đầu

- [Giới thiệu](#introduction)
    - [Cấu hình](#configuration)
    - [Kết nối đọc và ghi](#read-and-write-connections)
    - [Kết nối PostgreSQL qua connection pool](#pooled-postgresql-connections)
- [Thực thi truy vấn SQL](#running-queries)
    - [Sử dụng nhiều kết nối cơ sở dữ liệu](#using-multiple-database-connections)
    - [Lắng nghe sự kiện truy vấn](#listening-for-query-events)
    - [Theo dõi tổng thời gian truy vấn](#monitoring-cumulative-query-time)
- [Transaction cơ sở dữ liệu](#database-transactions)
- [Kết nối đến CLI của cơ sở dữ liệu](#connecting-to-the-database-cli)
- [Kiểm tra cơ sở dữ liệu](#inspecting-your-databases)
- [Giám sát cơ sở dữ liệu](#monitoring-your-databases)

<a name="introduction"></a>
## Giới thiệu

Hầu hết mọi ứng dụng web hiện đại đều tương tác với cơ sở dữ liệu. Laravel giúp việc làm việc với nhiều hệ quản trị cơ sở dữ liệu được hỗ trợ trở nên rất đơn giản thông qua SQL thuần, [Query Builder với API fluent](/docs/{{version}}/queries) và [Eloquent ORM](/docs/{{version}}/eloquent). Hiện tại, Laravel cung cấp hỗ trợ first-party cho năm hệ cơ sở dữ liệu:

<div class="content-list" markdown="1">

- MariaDB 10.3+ ([Version Policy](https://mariadb.org/about/#maintenance-policy))
- MySQL 5.7+ ([Version Policy](https://en.wikipedia.org/wiki/MySQL#Release_history))
- PostgreSQL 10.0+ ([Version Policy](https://www.postgresql.org/support/versioning/))
- SQLite 3.26.0+
- SQL Server 2017+ ([Version Policy](https://docs.microsoft.com/en-us/lifecycle/products/?products=sql-server))

</div>

Ngoài ra, MongoDB được hỗ trợ thông qua package `mongodb/laravel-mongodb`, do chính MongoDB duy trì chính thức. Xem tài liệu [Laravel MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/) để biết thêm thông tin.

<a name="configuration"></a>
### Cấu hình

Cấu hình cho các dịch vụ cơ sở dữ liệu của Laravel nằm trong file `config/database.php` của ứng dụng. Tại đây, bạn có thể định nghĩa toàn bộ kết nối cơ sở dữ liệu và chỉ định kết nối nào được sử dụng mặc định. Phần lớn tùy chọn trong file này lấy giá trị từ các biến môi trường của ứng dụng. Laravel cũng cung cấp sẵn cấu hình mẫu cho hầu hết các hệ cơ sở dữ liệu được hỗ trợ.

Mặc định, [cấu hình môi trường](/docs/{{version}}/configuration#environment-configuration) mẫu của Laravel đã sẵn sàng để sử dụng với [Laravel Sail](/docs/{{version}}/sail), môi trường Docker dành cho việc phát triển ứng dụng Laravel trên máy local. Tuy nhiên, bạn hoàn toàn có thể điều chỉnh cấu hình cơ sở dữ liệu để phù hợp với cơ sở dữ liệu đang chạy trên môi trường phát triển của mình.

<a name="sqlite-configuration"></a>
#### Cấu hình SQLite

Cơ sở dữ liệu SQLite được lưu trong một file duy nhất trên filesystem. Bạn có thể tạo cơ sở dữ liệu SQLite mới bằng lệnh `touch` trong terminal: `touch database/database.sqlite`. Sau khi tạo database, hãy cấu hình biến môi trường trỏ đến database này bằng cách đặt đường dẫn tuyệt đối của file vào biến `DB_DATABASE`:

```ini
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

Mặc định, ràng buộc khóa ngoại được bật đối với các kết nối SQLite. Nếu muốn tắt chúng, hãy đặt biến môi trường `DB_FOREIGN_KEYS` thành `false`:

```ini
DB_FOREIGN_KEYS=false
```

> [!NOTE]
> Nếu sử dụng [Laravel installer](/docs/{{version}}/installation#creating-a-laravel-project) để tạo ứng dụng và chọn SQLite làm cơ sở dữ liệu, Laravel sẽ tự động tạo file `database/database.sqlite` và chạy các [database migration](/docs/{{version}}/migrations) mặc định cho bạn.

<a name="mssql-configuration"></a>
#### Cấu hình Microsoft SQL Server

Để sử dụng Microsoft SQL Server, hãy bảo đảm các PHP extension `sqlsrv` và `pdo_sqlsrv` đã được cài đặt cùng những dependency cần thiết, chẳng hạn Microsoft SQL ODBC driver.

<a name="configuration-using-urls"></a>
#### Cấu hình bằng URL

Thông thường, một kết nối cơ sở dữ liệu được cấu hình bằng nhiều giá trị như `host`, `database`, `username`, `password`, v.v. Mỗi giá trị cấu hình có một biến môi trường tương ứng. Vì vậy, khi cấu hình thông tin kết nối cơ sở dữ liệu trên server production, bạn thường phải quản lý nhiều biến môi trường.

Một số nhà cung cấp cơ sở dữ liệu managed như AWS và Heroku cung cấp một "URL" duy nhất chứa toàn bộ thông tin kết nối trong một chuỗi. Ví dụ, database URL có thể có dạng như sau:

```html
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

Các URL này thường tuân theo một schema chuẩn như sau:

```html
driver://username:password@host:port/database?options
```

Để thuận tiện, Laravel hỗ trợ URL này như một lựa chọn thay thế cho việc cấu hình kết nối bằng nhiều tùy chọn riêng lẻ. Nếu tùy chọn `url` (hoặc biến môi trường tương ứng `DB_URL`) tồn tại, Laravel sẽ dùng nó để trích xuất thông tin kết nối và thông tin xác thực của cơ sở dữ liệu.

<a name="read-and-write-connections"></a>
### Kết nối đọc và ghi

Trong một số trường hợp, bạn có thể muốn dùng một kết nối cơ sở dữ liệu cho các câu lệnh SELECT và một kết nối khác cho INSERT, UPDATE và DELETE. Laravel hỗ trợ mô hình này trực tiếp và luôn chọn đúng kết nối, bất kể bạn đang sử dụng truy vấn SQL thuần, Query Builder hay Eloquent ORM.

Hãy xem ví dụ sau để hiểu cách cấu hình các kết nối đọc / ghi:

```php
'mysql' => [
    'driver' => 'mysql',
    
    'read' => [
        'host' => [
            '192.168.1.1',
            '196.168.1.2',
        ],
    ],
    'write' => [
        'host' => [
            '192.168.1.3',
        ],
    ],
    'sticky' => true,
    
    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'unix_socket' => env('DB_SOCKET', ''),
    'charset' => env('DB_CHARSET', 'utf8mb4'),
    'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
    'prefix' => '',
    'prefix_indexes' => true,
    'strict' => true,
    'engine' => null,
    'options' => extension_loaded('pdo_mysql') ? array_filter([
        (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
    ]) : [],
],
```

Lưu ý rằng ba key đã được thêm vào mảng cấu hình: `read`, `write` và `sticky`. Hai key `read` và `write` chứa các mảng có một key là `host`. Những tùy chọn cơ sở dữ liệu còn lại của kết nối `read` và `write` sẽ được hợp nhất từ mảng cấu hình `mysql` chính.

Bạn chỉ cần khai báo giá trị trong các mảng `read` và `write` khi muốn ghi đè giá trị từ mảng `mysql` chính. Trong ví dụ này, `192.168.1.1` được dùng làm host cho kết nối "read", còn `192.168.1.3` được dùng cho kết nối "write". Thông tin xác thực cơ sở dữ liệu, prefix, character set và các tùy chọn khác trong mảng `mysql` chính được dùng chung cho cả hai kết nối. Khi mảng cấu hình `host` chứa nhiều giá trị, Laravel sẽ chọn ngẫu nhiên một database host cho mỗi request.

<a name="the-sticky-option"></a>
#### Tùy chọn `sticky`

Tùy chọn `sticky` là một giá trị *không bắt buộc*, cho phép đọc ngay các bản ghi vừa được ghi vào cơ sở dữ liệu trong cùng request hiện tại. Nếu `sticky` được bật và một thao tác "write" đã xảy ra trong request đó, mọi thao tác "read" tiếp theo sẽ sử dụng chính kết nối "write". Cơ chế này bảo đảm dữ liệu vừa ghi trong request có thể được đọc lại ngay trong cùng request, tránh độ trễ đồng bộ thường gặp khi đọc từ replica. Bạn cần tự quyết định liệu hành vi này có phù hợp với ứng dụng của mình hay không.

<a name="pooled-postgresql-connections"></a>
### Kết nối PostgreSQL qua connection pool

Nhiều nhà cung cấp PostgreSQL managed hỗ trợ connection pooling ở chế độ transaction thông qua các dịch vụ như PgBouncer hoặc connection proxy. Các pooler này rất phù hợp cho truy vấn của ứng dụng, nhưng một số thao tác schema, migration và lệnh bảo trì cần kết nối trực tiếp đến cơ sở dữ liệu.

Để sử dụng transaction pooler với PostgreSQL, hãy cấu hình pooled connection như bình thường và cung cấp thông tin kết nối trực tiếp thông qua tùy chọn `direct`:

```php
'pgsql' => [
    'driver' => 'pgsql',
    // ...
    'pooled' => env('DB_POOLED', false),
    'direct' => array_filter([
        'host' => env('DB_DIRECT_HOST'),
        'port' => env('DB_DIRECT_PORT'),
        'username' => env('DB_DIRECT_USERNAME'),
        'password' => env('DB_DIRECT_PASSWORD'),
        'sslmode' => env('DB_DIRECT_SSLMODE'),
    ]),
],
```

Khi một kết nối PostgreSQL được cấu hình ở chế độ pooled, Laravel tự động bật emulated prepares cho pooled connection. Direct connection sẽ kế thừa những tùy chọn không được khai báo rõ trong cấu hình `direct` và mặc định sử dụng native prepares.

Laravel tự động sử dụng direct connection cho migration, dump và restore schema, cũng như các lệnh `db:wipe`, `db:show` và `db:table`. Lệnh `db` cũng mặc định dùng direct connection khi pooled mode được bật và direct connection đã được cấu hình; bạn có thể truyền tùy chọn `--pooled` để kết nối đến pooled connection thay thế:

```shell
php artisan db --pooled
```

Nếu cần chủ động sử dụng direct connection trong code ứng dụng, hãy thêm hậu tố `::direct` vào tên connection:

```php
DB::connection('pgsql::direct')->statement('create extension if not exists "uuid-ossp"');
```

<a name="running-queries"></a>
## Thực thi truy vấn SQL

Sau khi cấu hình kết nối cơ sở dữ liệu, bạn có thể thực thi truy vấn thông qua facade `DB`. Facade `DB` cung cấp các method tương ứng với từng loại truy vấn: `select`, `update`, `insert`, `delete` và `statement`.

<a name="running-a-select-query"></a>
#### Thực thi truy vấn SELECT

Để thực thi một truy vấn SELECT cơ bản, hãy sử dụng method `select` trên facade `DB`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show a list of all of the application's users.
     */
    public function index(): View
    {
        $users = DB::select('select * from users where active = ?', [1]);

        return view('user.index', ['users' => $users]);
    }
}
```

Đối số đầu tiên truyền vào method `select` là câu SQL, còn đối số thứ hai chứa các parameter binding cần bind vào truy vấn. Thông thường đây là các giá trị dùng trong điều kiện của mệnh đề `where`. Parameter binding giúp bảo vệ truy vấn trước SQL injection.

Method `select` luôn trả về một `array` kết quả. Mỗi phần tử trong mảng là một object PHP `stdClass` đại diện cho một bản ghi trong cơ sở dữ liệu:

```php
use Illuminate\Support\Facades\DB;

$users = DB::select('select * from users');

foreach ($users as $user) {
    echo $user->name;
}
```

<a name="selecting-scalar-values"></a>
#### Lấy giá trị scalar

Đôi khi truy vấn cơ sở dữ liệu chỉ trả về một giá trị scalar duy nhất. Thay vì phải lấy giá trị này từ object đại diện cho bản ghi, Laravel cho phép bạn nhận trực tiếp giá trị đó bằng method `scalar`:

```php
$burgers = DB::scalar(
    "select count(case when food = 'burger' then 1 end) as burgers from menu"
);
```

<a name="selecting-multiple-result-sets"></a>
#### Lấy nhiều result set

Nếu ứng dụng gọi stored procedure trả về nhiều result set, bạn có thể sử dụng method `selectResultSets` để lấy toàn bộ các result set mà stored procedure trả về:

```php
[$options, $notifications] = DB::selectResultSets(
    "CALL get_user_options_and_notifications(?)", $request->user()->id
);
```

<a name="using-named-bindings"></a>
#### Sử dụng named binding

Thay vì dùng `?` để biểu diễn parameter binding, bạn có thể thực thi truy vấn bằng named binding:

```php
$results = DB::select('select * from users where id = :id', ['id' => 1]);
```

<a name="running-an-insert-statement"></a>
#### Thực thi câu lệnh INSERT

Để thực thi câu lệnh `insert`, hãy sử dụng method `insert` trên facade `DB`. Tương tự `select`, method này nhận câu SQL làm đối số đầu tiên và các binding làm đối số thứ hai:

```php
use Illuminate\Support\Facades\DB;

DB::insert('insert into users (id, name) values (?, ?)', [1, 'Marc']);
```

<a name="running-an-update-statement"></a>
#### Thực thi câu lệnh UPDATE

Method `update` được dùng để cập nhật các bản ghi hiện có trong cơ sở dữ liệu. Method sẽ trả về số lượng dòng bị tác động bởi câu lệnh:

```php
use Illuminate\Support\Facades\DB;

$affected = DB::update(
    'update users set votes = 100 where name = ?',
    ['Anita']
);
```

<a name="running-a-delete-statement"></a>
#### Thực thi câu lệnh DELETE

Method `delete` được dùng để xóa các bản ghi khỏi cơ sở dữ liệu. Tương tự `update`, method này trả về số lượng dòng bị tác động:

```php
use Illuminate\Support\Facades\DB;

$deleted = DB::delete('delete from users');
```

<a name="running-a-general-statement"></a>
#### Thực thi câu lệnh SQL thông thường

Một số câu lệnh cơ sở dữ liệu không trả về giá trị. Với những thao tác dạng này, bạn có thể sử dụng method `statement` của facade `DB`:

```php
DB::statement('drop table users');
```

<a name="running-an-unprepared-statement"></a>
#### Thực thi câu lệnh không qua prepared statement

Đôi khi bạn cần thực thi một câu lệnh SQL mà không binding bất kỳ giá trị nào. Bạn có thể sử dụng method `unprepared` của facade `DB` cho trường hợp này:

```php
DB::unprepared('update users set votes = 100 where name = "Dries"');
```

> [!WARNING]
> Vì các câu lệnh `unprepared` không binding tham số, chúng có thể tạo ra lỗ hổng SQL injection. Tuyệt đối không đưa giá trị do người dùng kiểm soát trực tiếp vào một câu lệnh `unprepared`.

<a name="implicit-commits-in-transactions"></a>
#### Commit ngầm định

Khi sử dụng các method `statement` và `unprepared` của facade `DB` bên trong transaction, bạn phải tránh những câu lệnh gây ra [implicit commit](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html). Các câu lệnh này khiến database engine tự commit toàn bộ transaction mà Laravel không nhận biết được trạng thái transaction thực tế của database. Ví dụ, việc tạo một bảng cơ sở dữ liệu có thể gây ra hành vi này:

```php
DB::unprepared('create table a (col varchar(1) null)');
```

Hãy tham khảo tài liệu MySQL để xem [danh sách đầy đủ các câu lệnh](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html) có thể kích hoạt implicit commit.

<a name="using-multiple-database-connections"></a>
### Sử dụng nhiều kết nối cơ sở dữ liệu

Nếu ứng dụng định nghĩa nhiều connection trong file cấu hình `config/database.php`, bạn có thể truy cập từng connection thông qua method `connection` của facade `DB`. Tên connection truyền vào method `connection` phải tương ứng với một connection được khai báo trong `config/database.php`, hoặc một connection được cấu hình tại runtime bằng helper `config`:

```php
use Illuminate\Support\Facades\DB;

$users = DB::connection('sqlite')->select(/* ... */);
```

Bạn có thể truy cập trực tiếp PDO instance nằm bên dưới một connection bằng method `getPdo` trên connection instance đó:

```php
$pdo = DB::connection()->getPdo();
```

<a name="listening-for-query-events"></a>
### Lắng nghe sự kiện truy vấn

Nếu muốn một closure được gọi mỗi khi ứng dụng thực thi một truy vấn SQL, bạn có thể sử dụng method `listen` của facade `DB`. Cơ chế này hữu ích khi ghi log truy vấn hoặc debug. Bạn có thể đăng ký closure lắng nghe truy vấn trong method `boot` của một [service provider](/docs/{{version}}/providers):

```php
<?php

namespace App\Providers;

use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
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
        DB::listen(function (QueryExecuted $query) {
            // $query->sql;
            // $query->bindings;
            // $query->time;
            // $query->toRawSql();
        });
    }
}
```

<a name="monitoring-cumulative-query-time"></a>
### Theo dõi tổng thời gian truy vấn

Một nút thắt hiệu năng phổ biến của các ứng dụng web hiện đại là tổng thời gian dành cho việc truy vấn cơ sở dữ liệu. Laravel có thể gọi closure hoặc callback do bạn chỉ định khi tổng thời gian truy vấn database trong một request vượt quá ngưỡng cho phép. Để sử dụng, hãy truyền ngưỡng thời gian truy vấn (tính bằng mili giây) cùng closure vào method `whenQueryingForLongerThan`. Bạn có thể gọi method này trong `boot` của một [service provider](/docs/{{version}}/providers):

```php
<?php

namespace App\Providers;

use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Events\QueryExecuted;

class AppServiceProvider extends ServiceProvider
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
        DB::whenQueryingForLongerThan(500, function (Connection $connection, QueryExecuted $event) {
            // Notify development team...
        });
    }
}
```

<a name="database-transactions"></a>
## Transaction cơ sở dữ liệu

Bạn có thể sử dụng method `transaction` của facade `DB` để thực thi một nhóm thao tác bên trong database transaction. Nếu closure của transaction phát sinh exception, transaction sẽ tự động rollback và exception được ném lại. Nếu closure thực thi thành công, transaction sẽ tự động commit. Vì vậy, khi sử dụng `transaction`, bạn không cần tự xử lý `rollback` hoặc `commit` thủ công:

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
});
```

<a name="handling-deadlocks"></a>
#### Xử lý deadlock

Method `transaction` nhận đối số thứ hai tùy chọn để xác định số lần Laravel sẽ thử lại transaction khi xảy ra deadlock. Khi đã sử dụng hết số lần thử, một exception sẽ được ném ra:

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    DB::update('update users set votes = 1');

    DB::delete('delete from posts');
}, attempts: 5);
```

<a name="manually-using-transactions"></a>
#### Điều khiển transaction thủ công

Nếu muốn tự bắt đầu transaction và kiểm soát hoàn toàn việc rollback cũng như commit, bạn có thể sử dụng method `beginTransaction` của facade `DB`:

```php
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
```

Bạn có thể rollback transaction bằng method `rollBack`:

```php
DB::rollBack();
```

Cuối cùng, bạn có thể commit transaction bằng method `commit`:

```php
DB::commit();
```

> [!NOTE]
> Các method transaction của facade `DB` kiểm soát transaction cho cả [Query Builder](/docs/{{version}}/queries) và [Eloquent ORM](/docs/{{version}}/eloquent).

<a name="connecting-to-the-database-cli"></a>
## Kết nối tới CLI của cơ sở dữ liệu

Nếu muốn kết nối tới CLI của cơ sở dữ liệu, bạn có thể sử dụng Artisan command `db`:

```shell
php artisan db
```

Khi cần, bạn có thể chỉ định tên database connection để kết nối tới một connection khác với connection mặc định:

```shell
php artisan db mysql
```

<a name="inspecting-your-databases"></a>
## Kiểm tra cơ sở dữ liệu

Các Artisan command `db:show` và `db:table` cung cấp thông tin hữu ích về cơ sở dữ liệu và các bảng liên quan. Để xem tổng quan database, bao gồm dung lượng, loại database, số connection đang mở và thông tin tóm tắt về các bảng, bạn có thể sử dụng command `db:show`:

```shell
php artisan db:show
```

Bạn có thể chỉ định database connection cần kiểm tra bằng cách truyền tên connection qua option `--database`:

```shell
php artisan db:show --database=pgsql
```

Nếu muốn output bao gồm số lượng dòng của các bảng và thông tin chi tiết về database view, hãy lần lượt sử dụng các option `--counts` và `--views`. Với database lớn, việc lấy row count và thông tin view có thể mất nhiều thời gian:

```shell
php artisan db:show --counts --views
```

Ngoài ra, bạn có thể sử dụng các method sau của `Schema` để kiểm tra database:

```php
use Illuminate\Support\Facades\Schema;

$tables = Schema::getTables();
$views = Schema::getViews();
$columns = Schema::getColumns('users');
$indexes = Schema::getIndexes('users');
$foreignKeys = Schema::getForeignKeys('users');
```

Nếu muốn kiểm tra một database connection không phải connection mặc định của ứng dụng, bạn có thể sử dụng method `connection`:

```php
$columns = Schema::connection('sqlite')->getColumns('users');
```

<a name="table-overview"></a>
#### Tổng quan bảng

Nếu muốn xem tổng quan một bảng cụ thể trong database, bạn có thể chạy Artisan command `db:table`. Command này cung cấp thông tin tổng quan về bảng, bao gồm các column, type, attribute, key và index:

```shell
php artisan db:table users
```

<a name="monitoring-your-databases"></a>
## Theo dõi cơ sở dữ liệu

Với Artisan command `db:monitor`, bạn có thể yêu cầu Laravel dispatch event `Illuminate\Database\Events\DatabaseBusy` khi database đang quản lý số lượng connection mở vượt quá ngưỡng được chỉ định.

Để bắt đầu, bạn nên lên lịch cho command `db:monitor` [chạy mỗi phút](/docs/{{version}}/scheduling). Command nhận danh sách tên các database connection cần theo dõi cùng số connection mở tối đa được chấp nhận trước khi dispatch event:

```shell
php artisan db:monitor --databases=mysql,pgsql --max=100
```

Chỉ lên lịch command này chưa đủ để gửi notification cảnh báo về số lượng connection đang mở. Khi command phát hiện một database có số connection mở vượt quá ngưỡng, event `DatabaseBusy` sẽ được dispatch. Bạn nên lắng nghe event này trong `AppServiceProvider` của ứng dụng để gửi notification cho bạn hoặc đội ngũ phát triển:

```php
use App\Notifications\DatabaseApproachingMaxConnections;
use Illuminate\Database\Events\DatabaseBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(function (DatabaseBusy $event) {
        Notification::route('mail', 'dev@example.com')
            ->notify(new DatabaseApproachingMaxConnections(
                $event->connectionName,
                $event->connections
            ));
    });
}
```

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/database). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
