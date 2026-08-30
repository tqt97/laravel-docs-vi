# Eloquent: Bắt đầu

<a name="introduction"></a>
## Giới thiệu

Laravel cung cấp Eloquent, một trình ánh xạ đối tượng-quan hệ (ORM) giúp việc tương tác với cơ sở dữ liệu trở nên thuận tiện. Khi sử dụng Eloquent, mỗi bảng trong cơ sở dữ liệu có một "Model" tương ứng dùng để tương tác với bảng đó. Ngoài việc truy xuất các bản ghi từ bảng, Eloquent model còn cho phép bạn thêm, cập nhật và xóa các bản ghi.

> [!NOTE]
> Trước khi bắt đầu, hãy đảm bảo bạn đã cấu hình kết nối cơ sở dữ liệu trong file cấu hình `config/database.php` của ứng dụng. Để biết thêm thông tin, hãy xem [tài liệu cấu hình cơ sở dữ liệu](/docs/{{version}}/database#configuration).

<a name="generating-model-classes"></a>
## Tạo các lớp Model

Để bắt đầu, hãy tạo một Eloquent model. Model thường nằm trong thư mục `app\Models` và kế thừa lớp `Illuminate\Database\Eloquent\Model`. Bạn có thể sử dụng [lệnh Artisan](/docs/{{version}}/artisan) `make:model` để tạo model mới:

```shell
php artisan make:model Flight
```

Nếu muốn tạo luôn một [database migration](/docs/{{version}}/migrations) khi tạo model, bạn có thể sử dụng tùy chọn `--migration` hoặc `-m`:

```shell
php artisan make:model Flight --migration
```

Khi tạo model, bạn cũng có thể tạo nhiều loại lớp liên quan khác như factory, seeder, policy, controller và form request. Ngoài ra, các tùy chọn này có thể kết hợp với nhau để tạo nhiều lớp cùng lúc:

```shell
# Generate a model and a FlightFactory class...
php artisan make:model Flight --factory
php artisan make:model Flight -f

# Generate a model and a FlightSeeder class...
php artisan make:model Flight --seed
php artisan make:model Flight -s

# Generate a model and a FlightController class...
php artisan make:model Flight --controller
php artisan make:model Flight -c

# Generate a model, FlightController resource class, and form request classes...
php artisan make:model Flight --controller --resource --requests
php artisan make:model Flight -crR

# Generate a model and a FlightPolicy class...
php artisan make:model Flight --policy

# Generate a model and a migration, factory, seeder, and controller...
php artisan make:model Flight -mfsc

# Shortcut to generate a model, migration, factory, seeder, policy, controller, and form requests...
php artisan make:model Flight --all
php artisan make:model Flight -a

# Generate a pivot model...
php artisan make:model Member --pivot
php artisan make:model Member -p
```

<a name="inspecting-models"></a>
#### Kiểm tra Model

Đôi khi rất khó xác định toàn bộ thuộc tính và relationship có sẵn của một model chỉ bằng cách đọc lướt code. Thay vào đó, bạn có thể dùng lệnh Artisan `model:show`; lệnh này cung cấp cái nhìn tổng quan thuận tiện về tất cả thuộc tính và relationship của model:

```shell
php artisan model:show Flight
```

<a name="eloquent-model-conventions"></a>
## Các quy ước của Eloquent Model

Các model được tạo bằng lệnh `make:model` sẽ nằm trong thư mục `app/Models`. Hãy xem một lớp model cơ bản và tìm hiểu một số quy ước quan trọng của Eloquent:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    // ...
}
```

<a name="table-names"></a>
### Tên bảng

Trong ví dụ trên, bạn có thể nhận thấy chúng ta không chỉ định cho Eloquent bảng cơ sở dữ liệu nào tương ứng với model `Flight`. Theo quy ước, tên lớp ở dạng số nhiều và `snake_case` sẽ được dùng làm tên bảng, trừ khi bạn chỉ định rõ một tên khác. Vì vậy, Eloquent sẽ giả định model `Flight` lưu bản ghi trong bảng `flights`, còn model `AirTrafficController` sẽ lưu bản ghi trong bảng `air_traffic_controllers`.

Nếu bảng tương ứng với model không tuân theo quy ước này, bạn có thể chỉ định thủ công tên bảng của model bằng attribute `Table`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('my_flights')]
class Flight extends Model
{
    // ...
}
```


<a name="primary-keys"></a>
### Khóa chính

Eloquent cũng giả định bảng tương ứng với mỗi model có cột khóa chính tên là `id`. Khi cần, bạn có thể chỉ định một cột khác làm khóa chính của model thông qua đối số `key` của attribute `Table`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(key: 'flight_id')]
class Flight extends Model
{
    // ...
}
```

Ngoài ra, Eloquent giả định khóa chính là một số nguyên tự tăng, vì vậy Eloquent sẽ tự động cast khóa chính thành integer. Nếu muốn sử dụng khóa chính không tự tăng hoặc không phải kiểu số, bạn nên chỉ định các đối số `keyType` và `incrementing` trên attribute `Table`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(key: 'uuid', keyType: 'string', incrementing: false)]
class Flight extends Model
{
    // ...
}
```

Nếu chỉ cần tắt ID tự tăng, bạn có thể sử dụng attribute `WithoutIncrementing`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\WithoutIncrementing;
use Illuminate\Database\Eloquent\Model;

#[WithoutIncrementing]
class Flight extends Model
{
    // ...
}
```

<a name="composite-primary-keys"></a>
#### Khóa chính "Composite"

Eloquent yêu cầu mỗi model phải có ít nhất một "ID" định danh duy nhất có thể dùng làm khóa chính. Eloquent model không hỗ trợ khóa chính "composite" (khóa chính kết hợp). Tuy nhiên, ngoài khóa chính định danh duy nhất của bảng, bạn vẫn có thể thêm các unique index gồm nhiều cột vào bảng cơ sở dữ liệu.

<a name="uuid-and-ulid-keys"></a>
### Khóa UUID và ULID

Thay vì sử dụng số nguyên tự tăng làm khóa chính cho Eloquent model, bạn có thể chọn UUID. UUID là định danh chữ-số duy nhất trên phạm vi toàn cầu, có độ dài 36 ký tự.

Nếu muốn model sử dụng khóa UUID thay cho khóa số nguyên tự tăng, bạn có thể dùng trait `Illuminate\Database\Eloquent\Concerns\HasUuids` trên model. Tất nhiên, bạn cần đảm bảo model có [cột khóa chính kiểu UUID tương ứng](/docs/{{version}}/migrations#column-method-uuid):

```php
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUuids;

    // ...
}

$article = Article::create(['title' => 'Traveling to Europe']);

$article->id; // "018f2b5c-6a7f-7b12-9d6f-2f8a4e0c9c11"
```

Theo mặc định, trait `HasUuids` sẽ tạo các định danh [UUIDv7](/docs/{{version}}/strings#method-str-uuid7) cho model. Các UUID này hiệu quả hơn khi lưu trữ trong index của cơ sở dữ liệu vì có thể được sắp xếp theo thứ tự từ điển.

Bạn có thể ghi đè quá trình tạo UUID cho một model bằng cách định nghĩa phương thức `newUniqueId` trên model. Ngoài ra, bạn có thể chỉ định những cột sẽ nhận UUID bằng cách định nghĩa phương thức `uniqueIds` trên model:

```php
use Ramsey\Uuid\Uuid;

/**
 * Generate a new UUID for the model.
 */
public function newUniqueId(): string
{
    return (string) Uuid::uuid4();
}

/**
 * Get the columns that should receive a unique identifier.
 *
 * @return array<int, string>
 */
public function uniqueIds(): array
{
    return ['id', 'discount_code'];
}
```

Nếu muốn, bạn có thể sử dụng "ULID" thay cho UUID. ULID tương tự UUID nhưng chỉ dài 26 ký tự. Giống UUID có thứ tự, ULID có thể sắp xếp theo thứ tự từ điển, giúp việc lập index cơ sở dữ liệu hiệu quả. Để sử dụng ULID, hãy dùng trait `Illuminate\Database\Eloquent\Concerns\HasUlids` trên model. Đồng thời, hãy đảm bảo model có [cột khóa chính kiểu ULID tương ứng](/docs/{{version}}/migrations#column-method-ulid):

```php
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasUlids;

    // ...
}

$article = Article::create(['title' => 'Traveling to Asia']);

$article->id; // "01gd4d3tgrrfqeda94gdbtdk5c"
```

<a name="timestamps"></a>
### Dấu thời gian

Theo mặc định, Eloquent kỳ vọng bảng cơ sở dữ liệu tương ứng với model có các cột `created_at` và `updated_at`. Eloquent sẽ tự động thiết lập giá trị của các cột này khi model được tạo hoặc cập nhật. Nếu không muốn Eloquent tự động quản lý các cột này, bạn có thể đặt `timestamps` thành `false` trên attribute `Table` của model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(timestamps: false)]
class Flight extends Model
{
    // ...
}
```

Nếu chỉ cần tắt timestamps, bạn có thể sử dụng attribute `WithoutTimestamps`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Model;

#[WithoutTimestamps]
class Flight extends Model
{
    // ...
}
```

Nếu cần tùy chỉnh định dạng timestamp của model, bạn có thể sử dụng đối số `dateFormat` trên attribute `Table`. Giá trị này quyết định cách các attribute ngày tháng được lưu trong cơ sở dữ liệu cũng như định dạng của chúng khi model được serialize thành array hoặc JSON:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table(dateFormat: 'U')]
class Flight extends Model
{
    // ...
}
```

Nếu chỉ cần định nghĩa định dạng ngày tháng, bạn có thể sử dụng attribute `DateFormat`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\DateFormat;
use Illuminate\Database\Eloquent\Model;

#[DateFormat('U')]
class Flight extends Model
{
    // ...
}
```

Nếu cần tùy chỉnh tên các cột dùng để lưu timestamp, bạn có thể định nghĩa các hằng `CREATED_AT` và `UPDATED_AT` trên model:

```php
<?php

class Flight extends Model
{
    /**
     * The name of the "created at" column.
     *
     * @var string|null
     */
    public const CREATED_AT = 'creation_date';

    /**
     * The name of the "updated at" column.
     *
     * @var string|null
     */
    public const UPDATED_AT = 'updated_date';
}
```

Nếu muốn thực hiện các thao tác trên model mà không làm thay đổi timestamp `updated_at`, bạn có thể thao tác với model bên trong closure được truyền cho phương thức `withoutTimestamps`:

```php
Model::withoutTimestamps(fn () => $post->increment('reads'));
```

<a name="database-connections"></a>
### Kết nối cơ sở dữ liệu

Theo mặc định, mọi Eloquent model sẽ sử dụng kết nối cơ sở dữ liệu mặc định được cấu hình cho ứng dụng. Nếu muốn chỉ định một kết nối khác khi tương tác với một model cụ thể, bạn có thể sử dụng attribute `Connection`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Connection;
use Illuminate\Database\Eloquent\Model;

#[Connection('mysql')]
class Flight extends Model
{
    // ...
}
```

<a name="default-attribute-values"></a>
### Giá trị mặc định của Attribute

Theo mặc định, một instance model vừa được khởi tạo sẽ không chứa giá trị attribute nào. Nếu muốn định nghĩa giá trị mặc định cho một số attribute của model, bạn có thể khai báo property `$attributes` trên model. Các giá trị đặt trong mảng `$attributes` phải ở định dạng thô có thể lưu trữ, giống như khi chúng vừa được đọc từ cơ sở dữ liệu:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'options' => '[]',
        'delayed' => false,
    ];
}
```

<a name="configuring-eloquent-strictness"></a>
### Cấu hình chế độ nghiêm ngặt của Eloquent

Laravel cung cấp một số phương thức cho phép bạn cấu hình hành vi và mức độ "nghiêm ngặt" của Eloquent trong nhiều tình huống.

Trước tiên, phương thức `preventLazyLoading` nhận một đối số boolean tùy chọn để xác định có ngăn lazy loading hay không. Ví dụ, bạn có thể chỉ vô hiệu hóa lazy loading ở các môi trường không phải production để môi trường production vẫn hoạt động bình thường ngay cả khi code production vô tình chứa một relationship được lazy load. Thông thường, phương thức này nên được gọi trong phương thức `boot` của `AppServiceProvider`:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

Ngoài ra, bạn có thể yêu cầu Laravel ném exception khi cố gắng gán giá trị cho một attribute không được phép mass assign bằng cách gọi phương thức `preventSilentlyDiscardingAttributes`. Điều này giúp tránh các lỗi khó nhận biết trong quá trình phát triển local khi bạn cố gắng thiết lập một attribute chưa được thêm vào mảng `fillable` của model:

```php
Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
```

<a name="retrieving-models"></a>
## Truy xuất Model

Sau khi đã tạo model và [bảng cơ sở dữ liệu tương ứng](/docs/{{version}}/migrations#generating-migrations), bạn có thể bắt đầu truy xuất dữ liệu từ cơ sở dữ liệu. Có thể xem mỗi Eloquent model như một [query builder](/docs/{{version}}/queries) mạnh mẽ, cho phép bạn xây dựng truy vấn một cách fluent trên bảng tương ứng với model. Phương thức `all` của model sẽ truy xuất tất cả bản ghi từ bảng tương ứng:

```php
use App\Models\Flight;

foreach (Flight::all() as $flight) {
    echo $flight->name;
}
```

<a name="building-queries"></a>
#### Xây dựng truy vấn

Phương thức `all` của Eloquent trả về toàn bộ kết quả trong bảng của model. Tuy nhiên, vì mỗi Eloquent model hoạt động như một [query builder](/docs/{{version}}/queries), bạn có thể thêm các điều kiện ràng buộc vào truy vấn rồi gọi phương thức `get` để lấy kết quả:

```php
$flights = Flight::where('active', 1)
    ->orderBy('name')
    ->limit(10)
    ->get();
```

> [!NOTE]
> Vì Eloquent model cũng là query builder, bạn nên xem toàn bộ các phương thức mà [query builder](/docs/{{version}}/queries) của Laravel cung cấp. Bạn có thể sử dụng bất kỳ phương thức nào trong số đó khi viết truy vấn Eloquent.

<a name="refreshing-models"></a>
#### Làm mới Model

Nếu đã có một instance Eloquent model được truy xuất từ cơ sở dữ liệu, bạn có thể "làm mới" model bằng các phương thức `fresh` và `refresh`. Phương thức `fresh` sẽ truy xuất lại model từ cơ sở dữ liệu và không làm thay đổi instance model hiện tại:

```php
$flight = Flight::where('number', 'FR 900')->first();

$freshFlight = $flight->fresh();
```

Phương thức `refresh` sẽ hydrate lại instance model hiện tại bằng dữ liệu mới từ cơ sở dữ liệu. Đồng thời, tất cả relationship đã được load của model cũng sẽ được làm mới:

```php
$flight = Flight::where('number', 'FR 900')->first();

$flight->number = 'FR 456';

$flight->refresh();

$flight->number; // "FR 900"
```

Nếu cần làm mới model đồng thời lấy pessimistic lock bên trong transaction, bạn có thể sử dụng phương thức `refreshForUpdate`. Phương thức này tải lại model với khóa `FOR UPDATE`:

```php
DB::transaction(function () use ($flight) {
    $flight->refreshForUpdate();

    // Update the locked model...
});
```

<a name="collections"></a>
### Collection

Như đã thấy, các phương thức Eloquent như `all` và `get` truy xuất nhiều bản ghi từ cơ sở dữ liệu. Tuy nhiên, các phương thức này không trả về một PHP array thông thường mà trả về một instance của `Illuminate\Database\Eloquent\Collection`.

Class `Collection` của Eloquent kế thừa class nền `Illuminate\Support\Collection` của Laravel, cung cấp [nhiều phương thức hữu ích](/docs/{{version}}/collections#available-methods) để làm việc với tập dữ liệu. Ví dụ, phương thức `reject` có thể loại các model khỏi collection dựa trên kết quả của closure được gọi:

```php
$flights = Flight::where('destination', 'Paris')->get();

$flights = $flights->reject(function (Flight $flight) {
    return $flight->cancelled;
});
```

Ngoài các phương thức do class collection nền của Laravel cung cấp, Eloquent collection còn có [một số phương thức bổ sung](/docs/{{version}}/eloquent-collections#available-methods) dành riêng cho việc làm việc với collection của các Eloquent model.

Vì tất cả collection của Laravel đều implement các iterable interface của PHP, bạn có thể lặp qua collection giống như với array:

```php
foreach ($flights as $flight) {
    echo $flight->name;
}
```

<a name="chunking-results"></a>
### Chia nhỏ kết quả

Ứng dụng có thể hết bộ nhớ nếu bạn cố gắng tải hàng chục nghìn bản ghi Eloquent bằng `all` hoặc `get`. Thay vào đó, có thể sử dụng phương thức `chunk` để xử lý số lượng lớn model hiệu quả hơn.

Phương thức `chunk` truy xuất một tập con các Eloquent model rồi truyền chúng vào closure để xử lý. Vì mỗi lần chỉ tải chunk hiện tại, `chunk` giúp giảm đáng kể lượng bộ nhớ sử dụng khi làm việc với số lượng lớn model:

```php
use App\Models\Flight;
use Illuminate\Database\Eloquent\Collection;

Flight::chunk(200, function (Collection $flights) {
    foreach ($flights as $flight) {
        // ...
    }
});
```

Đối số đầu tiên truyền cho `chunk` là số bản ghi muốn nhận trong mỗi "chunk". Closure ở đối số thứ hai sẽ được gọi cho từng chunk được truy xuất từ cơ sở dữ liệu. Mỗi chunk được truyền vào closure tương ứng với một truy vấn cơ sở dữ liệu.

Nếu đang lọc kết quả của `chunk` theo một cột mà bạn cũng sẽ cập nhật trong lúc duyệt kết quả, hãy sử dụng `chunkById`. Dùng `chunk` trong trường hợp này có thể dẫn đến kết quả ngoài dự kiến hoặc không nhất quán. Bên trong, `chunkById` luôn truy xuất các model có cột `id` lớn hơn model cuối cùng của chunk trước:

```php
Flight::where('departed', true)
    ->chunkById(200, function (Collection $flights) {
        $flights->each->update(['departed' => false]);
    }, column: 'id');
```

Vì `chunkById` và `lazyById` tự thêm các điều kiện `where` vào truy vấn đang thực thi, thông thường bạn nên [nhóm logic](/docs/{{version}}/queries#logical-grouping) các điều kiện của mình bên trong một closure:

```php
Flight::where(function ($query) {
    $query->where('delayed', true)->orWhere('cancelled', true);
})->chunkById(200, function (Collection $flights) {
    $flights->each->update([
        'departed' => false,
        'cancelled' => true
    ]);
}, column: 'id');
```

<a name="chunking-using-lazy-collections"></a>
### Chia nhỏ bằng Lazy Collection

Phương thức `lazy` hoạt động tương tự [phương thức `chunk`](#chunking-results): ở bên trong, truy vấn được thực thi theo từng chunk. Tuy nhiên, thay vì truyền trực tiếp từng chunk vào callback, `lazy` trả về một [LazyCollection](/docs/{{version}}/collections#lazy-collections) phẳng gồm các Eloquent model, cho phép bạn làm việc với kết quả như một luồng duy nhất:

```php
use App\Models\Flight;

foreach (Flight::lazy() as $flight) {
    // ...
}
```

Nếu đang lọc kết quả của `lazy` theo một cột mà bạn cũng sẽ cập nhật trong lúc duyệt kết quả, hãy sử dụng `lazyById`. Bên trong, `lazyById` luôn truy xuất các model có cột `id` lớn hơn model cuối cùng của chunk trước:

```php
Flight::where('departed', true)
    ->lazyById(200, column: 'id')
    ->each->update(['departed' => false]);
```

Bạn có thể xử lý kết quả theo thứ tự giảm dần của `id` bằng phương thức `lazyByIdDesc`.

<a name="cursors"></a>
### Cursor

Tương tự `lazy`, phương thức `cursor` có thể giảm đáng kể mức sử dụng bộ nhớ của ứng dụng khi duyệt qua hàng chục nghìn bản ghi Eloquent model.

Phương thức `cursor` chỉ thực thi một truy vấn cơ sở dữ liệu; tuy nhiên, từng Eloquent model riêng lẻ chỉ được hydrate khi thực sự được duyệt tới. Vì vậy, tại mỗi thời điểm trong quá trình duyệt cursor, chỉ một Eloquent model được giữ trong bộ nhớ.

> [!WARNING]
> Vì `cursor` chỉ giữ một Eloquent model trong bộ nhớ tại một thời điểm nên nó không thể eager load relationship. Nếu cần eager load relationship, hãy cân nhắc sử dụng [phương thức `lazy`](#chunking-using-lazy-collections) thay thế.

Ở bên trong, phương thức `cursor` sử dụng [generator](https://www.php.net/manual/en/language.generators.overview.php) của PHP để triển khai chức năng này:

```php
use App\Models\Flight;

foreach (Flight::where('destination', 'Zurich')->cursor() as $flight) {
    // ...
}
```

`cursor` trả về một instance `Illuminate\Support\LazyCollection`. [Lazy collection](/docs/{{version}}/collections#lazy-collections) cho phép bạn sử dụng nhiều phương thức collection quen thuộc của Laravel trong khi mỗi thời điểm chỉ tải một model vào bộ nhớ:

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

Mặc dù `cursor` sử dụng ít bộ nhớ hơn nhiều so với truy vấn thông thường vì mỗi thời điểm chỉ giữ một Eloquent model trong bộ nhớ, cuối cùng nó vẫn có thể hết bộ nhớ. Nguyên nhân là [PDO driver của PHP lưu toàn bộ kết quả truy vấn thô vào buffer ở bên trong](https://www.php.net/manual/en/mysqlinfo.concepts.buffering.php). Nếu phải xử lý số lượng Eloquent record rất lớn, hãy cân nhắc sử dụng [phương thức `lazy`](#chunking-using-lazy-collections) thay thế.

<a name="advanced-subqueries"></a>
### Subquery nâng cao

<a name="subquery-selects"></a>
#### Select bằng Subquery

Eloquent cũng hỗ trợ subquery nâng cao, cho phép bạn lấy thông tin từ các bảng liên quan chỉ bằng một truy vấn. Ví dụ, giả sử chúng ta có bảng `destinations` chứa các điểm đến và bảng `flights` chứa các chuyến bay tới những điểm đến đó. Bảng `flights` có cột `arrived_at` cho biết thời điểm chuyến bay đến điểm đến.

Sử dụng khả năng subquery của các phương thức `select` và `addSelect` trên query builder, chúng ta có thể lấy toàn bộ `destinations` cùng tên chuyến bay đến điểm đó gần đây nhất chỉ bằng một truy vấn:

```php
use App\Models\Destination;
use App\Models\Flight;

return Destination::addSelect(['last_flight' => Flight::select('name')
    ->whereColumn('destination_id', 'destinations.id')
    ->orderByDesc('arrived_at')
    ->limit(1)
])->get();
```

<a name="subquery-ordering"></a>
#### Sắp xếp bằng Subquery

Ngoài ra, hàm `orderBy` của query builder hỗ trợ subquery. Tiếp tục ví dụ về chuyến bay, chúng ta có thể dùng chức năng này để sắp xếp tất cả điểm đến theo thời điểm chuyến bay gần nhất đến điểm đó. Một lần nữa, toàn bộ việc này có thể được thực hiện chỉ với một truy vấn cơ sở dữ liệu:

```php
return Destination::orderByDesc(
    Flight::select('arrived_at')
        ->whereColumn('destination_id', 'destinations.id')
        ->orderByDesc('arrived_at')
        ->limit(1)
)->get();
```

<a name="retrieving-single-models"></a>
## Truy xuất Model đơn lẻ / Giá trị tổng hợp

Ngoài việc truy xuất tất cả bản ghi khớp với một truy vấn, bạn cũng có thể truy xuất từng bản ghi riêng lẻ bằng các phương thức `find`, `first` hoặc `firstWhere`. Thay vì trả về một collection các model, những phương thức này trả về một instance model duy nhất:

```php
use App\Models\Flight;

// Retrieve a model by its primary key...
$flight = Flight::find(1);

// Retrieve the first model matching the query constraints...
$flight = Flight::where('active', 1)->first();

// Alternative to retrieving the first model matching the query constraints...
$flight = Flight::firstWhere('active', 1);
```

Đôi khi bạn có thể muốn thực hiện một hành động khác nếu không tìm thấy kết quả. Các phương thức `findOr` và `firstOr` sẽ trả về một instance model; nếu không tìm thấy kết quả, closure được cung cấp sẽ được thực thi. Giá trị mà closure trả về sẽ được xem là kết quả của phương thức:

```php
$flight = Flight::findOr(1, function () {
    // ...
});

$flight = Flight::where('legs', '>', 3)->firstOr(function () {
    // ...
});
```

<a name="not-found-exceptions"></a>
#### Ngoại lệ khi không tìm thấy Model

Đôi khi bạn có thể muốn ném exception nếu không tìm thấy model. Điều này đặc biệt hữu ích trong route hoặc controller. Các phương thức `findOrFail` và `firstOrFail` sẽ truy xuất kết quả đầu tiên của truy vấn; tuy nhiên, nếu không tìm thấy kết quả, một `Illuminate\Database\Eloquent\ModelNotFoundException` sẽ được ném ra:

```php
$flight = Flight::findOrFail(1);

$flight = Flight::where('legs', '>', 3)->firstOrFail();
```

Nếu `ModelNotFoundException` không được bắt, Laravel sẽ tự động gửi HTTP response 404 về client:

```php
use App\Models\Flight;

Route::get('/api/flights/{id}', function (string $id) {
    return Flight::findOrFail($id);
});
```

<a name="retrieving-or-creating-models"></a>
### Truy xuất hoặc tạo Model

Phương thức `firstOrCreate` sẽ tìm một bản ghi trong cơ sở dữ liệu bằng các cặp cột / giá trị được cung cấp. Nếu không tìm thấy model, một bản ghi sẽ được thêm với các attribute được tạo bằng cách hợp nhất array đối số thứ nhất với array đối số thứ hai (nếu có).

Tương tự `firstOrCreate`, phương thức `firstOrNew` sẽ tìm bản ghi trong cơ sở dữ liệu khớp với các attribute được cung cấp. Tuy nhiên, nếu không tìm thấy model, một instance model mới sẽ được trả về. Lưu ý rằng model do `firstOrNew` trả về chưa được lưu vào cơ sở dữ liệu. Bạn cần gọi `save` thủ công để lưu model:

```php
use App\Models\Flight;

// Retrieve flight by name or create it if it doesn't exist...
$flight = Flight::firstOrCreate([
    'name' => 'London to Paris'
]);

// Retrieve flight by name or create it with the name, delayed, and arrival_time attributes...
$flight = Flight::firstOrCreate(
    ['name' => 'London to Paris'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);

// Retrieve flight by name or instantiate a new Flight instance...
$flight = Flight::firstOrNew([
    'name' => 'London to Paris'
]);

// Retrieve flight by name or instantiate with the name, delayed, and arrival_time attributes...
$flight = Flight::firstOrNew(
    ['name' => 'Tokyo to Sydney'],
    ['delayed' => 1, 'arrival_time' => '11:30']
);
```

<a name="retrieving-aggregates"></a>
### Truy xuất giá trị tổng hợp

Khi làm việc với Eloquent model, bạn cũng có thể sử dụng `count`, `sum`, `max` và các [phương thức tổng hợp](/docs/{{version}}/queries#aggregates) khác do [query builder](/docs/{{version}}/queries) của Laravel cung cấp. Các phương thức này trả về một giá trị scalar thay vì một instance Eloquent model:

```php
$count = Flight::where('active', 1)->count();

$max = Flight::where('active', 1)->max('price');
```

<a name="inserting-and-updating-models"></a>
## Thêm và cập nhật Model

<a name="inserts"></a>
### Thêm Model

Khi sử dụng Eloquent, chúng ta không chỉ truy xuất model từ cơ sở dữ liệu mà còn cần thêm các bản ghi mới. Eloquent giúp việc này trở nên đơn giản. Để thêm một bản ghi mới, hãy tạo một instance model, gán các attribute cho model, sau đó gọi phương thức `save` trên instance đó:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * Store a new flight in the database.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the request...

        $flight = new Flight;

        $flight->name = $request->name;

        $flight->save();

        return redirect('/flights');
    }
}
```

Trong ví dụ này, trường `name` từ HTTP request được gán cho attribute `name` của instance `App\Models\Flight`. Khi gọi `save`, một bản ghi sẽ được thêm vào cơ sở dữ liệu. Các timestamp `created_at` và `updated_at` của model được tự động thiết lập khi gọi `save`, vì vậy bạn không cần gán chúng thủ công.

Nếu muốn lưu model bên trong database transaction, bạn có thể dùng `saveOrFail`. Nếu xảy ra exception trong quá trình lưu, transaction sẽ tự động rollback:

```php
$flight->saveOrFail();
```

Ngoài ra, bạn có thể dùng `create` để "lưu" một model mới chỉ bằng một câu lệnh PHP. Phương thức `create` sẽ trả về instance model vừa được thêm:

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

Tuy nhiên, trước khi dùng `create`, bạn cần khai báo attribute `Fillable` hoặc `Guarded` trên class model. Các attribute này là bắt buộc vì mặc định mọi Eloquent model đều được bảo vệ trước lỗ hổng mass assignment. Để tìm hiểu thêm, hãy xem [tài liệu mass assignment](#mass-assignment).

<a name="updates"></a>
### Cập nhật Model

Phương thức `save` cũng có thể được dùng để cập nhật model đã tồn tại trong cơ sở dữ liệu. Hãy truy xuất model, gán các attribute cần thay đổi rồi gọi `save`. Timestamp `updated_at` sẽ tự động được cập nhật nên bạn không cần thiết lập thủ công:

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->name = 'Paris to London';

$flight->save();
```

Nếu muốn cập nhật model bên trong database transaction, bạn có thể dùng `updateOrFail`. Nếu xảy ra exception trong quá trình cập nhật, transaction sẽ tự động rollback:

```php
$flight->updateOrFail(['name' => 'Paris to London']);
```

Đôi khi bạn cần cập nhật một model hiện có hoặc tạo model mới nếu không có model nào khớp. Tương tự `firstOrCreate`, `updateOrCreate` sẽ tự lưu model nên không cần gọi `save` thủ công.

Trong ví dụ dưới đây, nếu tồn tại chuyến bay có `departure` là `Oakland` và `destination` là `San Diego`, các cột `price` và `discounted` của nó sẽ được cập nhật. Nếu không tồn tại, một chuyến bay mới sẽ được tạo với các attribute là kết quả hợp nhất hai array đối số:

```php
$flight = Flight::updateOrCreate(
    ['departure' => 'Oakland', 'destination' => 'San Diego'],
    ['price' => 99, 'discounted' => 1]
);
```

Khi dùng các phương thức như `firstOrCreate` hoặc `updateOrCreate`, bạn có thể cần biết model vừa được tạo mới hay model hiện có được cập nhật. Thuộc tính `wasRecentlyCreated` cho biết model có được tạo trong lifecycle hiện tại hay không:

```php
$flight = Flight::updateOrCreate(
    // ...
);

if ($flight->wasRecentlyCreated) {
    // New flight record was inserted...
}
```

<a name="mass-updates"></a>
#### Cập nhật hàng loạt

Bạn cũng có thể cập nhật các model khớp với một truy vấn. Trong ví dụ này, tất cả chuyến bay đang `active` và có `destination` là `San Diego` sẽ được đánh dấu là bị trễ:

```php
Flight::where('active', 1)
    ->where('destination', 'San Diego')
    ->update(['delayed' => 1]);
```

Phương thức `update` nhận một array các cặp cột và giá trị biểu thị những cột cần cập nhật. Phương thức trả về số hàng bị ảnh hưởng.

> [!WARNING]
> Khi thực hiện cập nhật hàng loạt qua Eloquent, các model event `saving`, `saved`, `updating` và `updated` sẽ không được phát cho những model được cập nhật. Nguyên nhân là các model không thực sự được truy xuất khi thực hiện mass update.

<a name="examining-attribute-changes"></a>
#### Kiểm tra thay đổi của Attribute

Eloquent cung cấp các phương thức `isDirty`, `isClean` và `wasChanged` để kiểm tra trạng thái nội bộ của model và xác định các attribute đã thay đổi như thế nào kể từ khi model được truy xuất ban đầu.

Phương thức `isDirty` xác định có attribute nào của model đã thay đổi kể từ khi model được truy xuất hay không. Bạn có thể truyền tên một attribute hoặc array các attribute để kiểm tra chúng có đang "dirty" hay không. Ngược lại, `isClean` xác định attribute có giữ nguyên kể từ khi model được truy xuất hay không và cũng nhận đối số attribute tùy chọn:

```php
use App\Models\User;

$user = User::create([
    'first_name' => 'Taylor',
    'last_name' => 'Otwell',
    'title' => 'Developer',
]);

$user->title = 'Painter';

$user->isDirty(); // true
$user->isDirty('title'); // true
$user->isDirty('first_name'); // false
$user->isDirty(['first_name', 'title']); // true

$user->isClean(); // false
$user->isClean('title'); // false
$user->isClean('first_name'); // true
$user->isClean(['first_name', 'title']); // false

$user->save();

$user->isDirty(); // false
$user->isClean(); // true
```

Phương thức `wasChanged` xác định liệu có attribute nào đã thay đổi khi model được lưu lần gần nhất trong vòng đời request hiện tại hay không. Khi cần, bạn có thể truyền tên attribute để kiểm tra một attribute cụ thể có thay đổi hay không:

```php
$user = User::create([
    'first_name' => 'Taylor',
    'last_name' => 'Otwell',
    'title' => 'Developer',
]);

$user->title = 'Painter';

$user->save();

$user->wasChanged(); // true
$user->wasChanged('title'); // true
$user->wasChanged(['title', 'slug']); // true
$user->wasChanged('first_name'); // false
$user->wasChanged(['first_name', 'title']); // true
```

Phương thức `getOriginal` trả về một mảng chứa các attribute ban đầu của model, bất kể model đã được thay đổi như thế nào kể từ khi được truy xuất. Khi cần, bạn có thể truyền tên một attribute cụ thể để lấy giá trị ban đầu của attribute đó:

```php
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->name = 'Jack';
$user->name; // Jack

$user->getOriginal('name'); // John
$user->getOriginal(); // Array of original attributes...
```

Phương thức `getChanges` trả về một mảng chứa các attribute đã thay đổi khi model được lưu lần gần nhất, trong khi `getPrevious` trả về một mảng chứa các giá trị attribute ban đầu trước lần lưu gần nhất:

```php
$user = User::find(1);

$user->name; // John
$user->email; // john@example.com

$user->update([
    'name' => 'Jack',
    'email' => 'jack@example.com',
]);

$user->getChanges();

/*
    [
        'name' => 'Jack',
        'email' => 'jack@example.com',
    ]
*/

$user->getPrevious();

/*
    [
        'name' => 'John',
        'email' => 'john@example.com',
    ]
*/
```

<a name="mass-assignment"></a>
### Mass Assignment (Gán hàng loạt)

Bạn có thể dùng phương thức `create` để "lưu" một model mới chỉ với một câu lệnh PHP. Phương thức sẽ trả về instance model vừa được thêm:

```php
use App\Models\Flight;

$flight = Flight::create([
    'name' => 'London to Paris',
]);
```

Tuy nhiên, trước khi dùng `create`, bạn cần khai báo attribute `Fillable` hoặc `Guarded` trên class model. Các attribute này là bắt buộc vì mặc định mọi Eloquent model đều được bảo vệ trước lỗ hổng mass assignment.

Lỗ hổng mass assignment xảy ra khi người dùng gửi một field HTTP request ngoài dự kiến và field đó làm thay đổi một cột database mà ứng dụng không chủ ý cho phép. Ví dụ, người dùng độc hại có thể gửi tham số `is_admin` qua HTTP request, sau đó tham số này được truyền vào phương thức `create` của model, cho phép họ tự nâng quyền thành quản trị viên.

Vì vậy, trước tiên bạn nên xác định những attribute nào của model được phép mass assign. Bạn có thể làm điều này bằng attribute `Fillable` trên model. Ví dụ, hãy cho phép mass assignment đối với attribute `name` của model `Flight`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name'])]
class Flight extends Model
{
    // ...
}
```

Sau khi xác định các attribute được phép mass assign, bạn có thể dùng `create` để thêm một record mới vào database. Phương thức `create` trả về instance model vừa được tạo:

```php
$flight = Flight::create(['name' => 'London to Paris']);
```

Nếu đã có một instance model, bạn có thể dùng `fill` để điền dữ liệu từ một mảng attribute:

```php
$flight->fill(['name' => 'Amsterdam to Frankfurt']);
```

<a name="mass-assignment-json-columns"></a>
#### Mass Assignment và cột JSON

Khi gán dữ liệu cho cột JSON, mỗi key được phép mass assign của cột phải được khai báo trong attribute `Fillable` của model. Vì lý do bảo mật, Laravel không hỗ trợ cập nhật nested JSON attribute khi sử dụng attribute `Guarded`:

```php
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['options->enabled'])]
class Flight extends Model
{
    // ...
}
```

<a name="allowing-mass-assignment"></a>
#### Cho phép Mass Assignment

Nếu muốn cho phép mass assignment với mọi attribute, bạn có thể dùng attribute `Unguarded` trên model. Nếu bỏ cơ chế bảo vệ này, bạn cần đặc biệt cẩn thận và luôn tự xây dựng chính xác các mảng được truyền vào `fill`, `create` và `update` của Eloquent:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Flight extends Model
{
    // ...
}
```

<a name="mass-assignment-exceptions"></a>
#### Exception của Mass Assignment

Mặc định, các attribute không nằm trong `Fillable` sẽ bị bỏ qua một cách im lặng khi thực hiện mass assignment. Trên production đây là hành vi được mong đợi; tuy nhiên trong quá trình phát triển local, nó có thể gây khó hiểu khi các thay đổi trên model không có hiệu lực.

Nếu muốn, bạn có thể yêu cầu Laravel ném exception khi cố gắng gán một attribute không được phép bằng cách gọi `preventSilentlyDiscardingAttributes`. Thông thường, phương thức này nên được gọi trong `boot` của class `AppServiceProvider`:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
}
```

<a name="upserts"></a>
### Upsert

Phương thức `upsert` của Eloquent có thể cập nhật hoặc tạo record trong một thao tác atomic duy nhất. Đối số thứ nhất chứa các giá trị cần insert hoặc update; đối số thứ hai liệt kê các cột dùng để định danh duy nhất record trong bảng tương ứng; đối số thứ ba và cuối cùng là mảng các cột cần cập nhật nếu record khớp đã tồn tại trong database. `upsert` sẽ tự động thiết lập timestamp `created_at` và `updated_at` nếu timestamps được bật trên model:

```php
Flight::upsert([
    ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
    ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
], uniqueBy: ['departure', 'destination'], update: ['price']);
```

> [!WARNING]
> Tất cả database ngoại trừ SQL Server đều yêu cầu các cột trong đối số thứ hai của `upsert` phải có index "primary" hoặc "unique". Ngoài ra, driver MariaDB và MySQL bỏ qua đối số thứ hai của `upsert` và luôn sử dụng các index "primary" và "unique" của bảng để phát hiện record đã tồn tại.

<a name="deleting-models"></a>
## Xóa Model

Để xóa một model, bạn có thể gọi `delete` trên instance model:

```php
use App\Models\Flight;

$flight = Flight::find(1);

$flight->delete();
```

Nếu muốn xóa model bên trong database transaction, bạn có thể dùng `deleteOrFail`. Nếu một exception được ném ra trong quá trình xóa, transaction sẽ tự động rollback:

```php
$flight->deleteOrFail();
```

<a name="deleting-an-existing-model-by-its-primary-key"></a>
#### Xóa Model hiện có bằng Primary Key

Trong ví dụ trên, model được truy xuất từ database trước khi gọi `delete`. Tuy nhiên, nếu biết primary key của model, bạn có thể xóa model mà không cần tự truy xuất trước bằng cách gọi `destroy`. Ngoài một primary key đơn lẻ, `destroy` còn chấp nhận nhiều primary key, một mảng primary key hoặc một [collection](/docs/{{version}}/collections) các primary key:

```php
Flight::destroy(1);

Flight::destroy(1, 2, 3);

Flight::destroy([1, 2, 3]);

Flight::destroy(collect([1, 2, 3]));
```

Nếu đang sử dụng [soft delete](#soft-deleting), bạn có thể xóa vĩnh viễn model bằng `forceDestroy`:

```php
Flight::forceDestroy(1);
```

> [!WARNING]
> Phương thức `destroy` tải từng model riêng lẻ và gọi `delete` để các event `deleting` và `deleted` được dispatch đúng cho từng model.

<a name="deleting-models-using-queries"></a>
#### Xóa Model bằng Query

Bạn cũng có thể xây dựng Eloquent query để xóa mọi model khớp điều kiện truy vấn. Trong ví dụ này, tất cả chuyến bay được đánh dấu inactive sẽ bị xóa. Tương tự mass update, mass delete sẽ không dispatch model event cho các model bị xóa:

```php
$deleted = Flight::where('active', 0)->delete();
```

Để xóa tất cả model trong một bảng, hãy thực thi query mà không thêm điều kiện:

```php
$deleted = Flight::query()->delete();
```

> [!WARNING]
> Khi thực thi mass delete qua Eloquent, các model event `deleting` và `deleted` sẽ không được dispatch cho các model bị xóa. Nguyên nhân là các model không thực sự được truy xuất khi câu lệnh delete được thực thi.

<a name="soft-deleting"></a>
### Soft Delete

Ngoài việc thực sự loại bỏ record khỏi database, Eloquent còn có thể "soft delete" model. Khi model được soft delete, record không thực sự bị xóa khỏi database. Thay vào đó, attribute `deleted_at` được thiết lập để ghi nhận ngày giờ model được "xóa". Để bật soft delete cho model, thêm trait `Illuminate\Database\Eloquent\SoftDeletes` vào model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Flight extends Model
{
    use SoftDeletes;
}
```

> [!NOTE]
> Trait `SoftDeletes` sẽ tự động cast attribute `deleted_at` thành instance `DateTime` / `Carbon`.

Bạn cũng cần thêm cột `deleted_at` vào bảng database. [Schema builder](/docs/{{version}}/migrations) của Laravel cung cấp helper để tạo cột này:

```php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::table('flights', function (Blueprint $table) {
    $table->softDeletes();
});

Schema::table('flights', function (Blueprint $table) {
    $table->dropSoftDeletes();
});
```

Bây giờ, khi gọi `delete` trên model, cột `deleted_at` sẽ được đặt thành ngày giờ hiện tại, nhưng record của model vẫn được giữ trong bảng. Khi truy vấn model sử dụng soft delete, các model đã soft delete sẽ tự động bị loại khỏi mọi kết quả query.

Để xác định một instance model đã bị soft delete hay chưa, bạn có thể dùng `trashed`:

```php
if ($flight->trashed()) {
    // ...
}
```

<a name="restoring-soft-deleted-models"></a>
#### Khôi phục Model đã Soft Delete

Đôi khi bạn có thể muốn "hoàn tác xóa" một model đã soft delete. Để khôi phục, gọi `restore` trên instance model. Phương thức `restore` sẽ đặt cột `deleted_at` của model về `null`:

```php
$flight->restore();
```

Bạn cũng có thể dùng `restore` trong query để khôi phục nhiều model. Tương tự các thao tác "mass" khác, cách này sẽ không dispatch model event cho các model được khôi phục:

```php
Flight::withTrashed()
    ->where('airline_id', 1)
    ->restore();
```

`restore` cũng có thể được dùng khi xây dựng query [relationship](/docs/{{version}}/eloquent-relationships):

```php
$flight->history()->restore();
```

<a name="permanently-deleting-models"></a>
#### Xóa Model vĩnh viễn

Đôi khi bạn cần thực sự loại bỏ model khỏi database. Bạn có thể dùng `forceDelete` để xóa vĩnh viễn model đã soft delete khỏi bảng database:

```php
$flight->forceDelete();
```

Bạn cũng có thể dùng `forceDelete` khi xây dựng Eloquent relationship query:

```php
$flight->history()->forceDelete();
```

<a name="querying-soft-deleted-models"></a>
### Truy vấn Model đã Soft Delete

<a name="including-soft-deleted-models"></a>
#### Bao gồm Model đã Soft Delete

Như đã đề cập, model đã soft delete sẽ tự động bị loại khỏi kết quả query. Tuy nhiên, bạn có thể buộc query bao gồm chúng bằng cách gọi `withTrashed`:

```php
use App\Models\Flight;

$flights = Flight::withTrashed()
    ->where('account_id', 1)
    ->get();
```

`withTrashed` cũng có thể được gọi khi xây dựng query [relationship](/docs/{{version}}/eloquent-relationships):

```php
$flight->history()->withTrashed()->get();
```

<a name="retrieving-only-soft-deleted-models"></a>
#### Chỉ truy xuất Model đã Soft Delete

Phương thức `onlyTrashed` sẽ **chỉ** truy xuất các model đã soft delete:

```php
$flights = Flight::onlyTrashed()
    ->where('airline_id', 1)
    ->get();
```

<a name="pruning-models"></a>
## Dọn dẹp Model

Đôi khi bạn có thể muốn định kỳ xóa những model không còn cần thiết. Để thực hiện việc này, bạn có thể thêm trait `Illuminate\Database\Eloquent\Prunable` hoặc `Illuminate\Database\Eloquent\MassPrunable` vào các model cần được dọn dẹp định kỳ. Sau khi thêm một trong các trait này vào model, hãy triển khai phương thức `prunable` trả về một Eloquent query builder xác định các model không còn cần thiết:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class Flight extends Model
{
    use Prunable;

    /**
     * Get the prunable model query.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->minus(months: 1));
    }
}
```

Khi đánh dấu model là `Prunable`, bạn cũng có thể định nghĩa phương thức `pruning` trên model. Phương thức này sẽ được gọi trước khi model bị xóa. Nó hữu ích để xóa các tài nguyên bổ sung liên quan đến model, chẳng hạn các file đã lưu trữ, trước khi model bị xóa vĩnh viễn khỏi cơ sở dữ liệu:

```php
/**
 * Prepare the model for pruning.
 */
protected function pruning(): void
{
    // ...
}
```

Sau khi cấu hình model có thể dọn dẹp, bạn nên lên lịch command Artisan `model:prune` trong file `routes/console.php` của ứng dụng. Bạn có thể tự chọn chu kỳ chạy command phù hợp:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune')->daily();
```

Ở bên trong, command `model:prune` sẽ tự động phát hiện các model "Prunable" trong thư mục `app/Models` của ứng dụng. Nếu model nằm ở vị trí khác, bạn có thể dùng tùy chọn `--model` để chỉ định tên class model:

```php
Schedule::command('model:prune', [
    '--model' => [Address::class, Flight::class],
])->daily();
```

Nếu muốn loại trừ một số model khỏi quá trình dọn dẹp trong khi vẫn dọn tất cả model khác được phát hiện, bạn có thể dùng tùy chọn `--except`:

```php
Schedule::command('model:prune', [
    '--except' => [Address::class, Flight::class],
])->daily();
```

Bạn có thể kiểm tra query `prunable` bằng cách chạy command `model:prune` với tùy chọn `--pretend`. Ở chế độ này, command chỉ báo cáo số record sẽ bị dọn dẹp nếu command thực sự được chạy:

```shell
php artisan model:prune --pretend
```

> [!WARNING]
> Các model đã soft delete sẽ bị xóa vĩnh viễn (`forceDelete`) nếu chúng khớp với query dọn dẹp.

<a name="mass-pruning"></a>
#### Dọn dẹp hàng loạt

Khi model được đánh dấu bằng trait `Illuminate\Database\Eloquent\MassPrunable`, các model sẽ được xóa khỏi cơ sở dữ liệu bằng query xóa hàng loạt. Vì vậy, phương thức `pruning` sẽ không được gọi và các model event `deleting`, `deleted` cũng không được dispatch. Nguyên nhân là các model không thực sự được truy xuất trước khi xóa, nhờ đó quá trình dọn dẹp hiệu quả hơn đáng kể:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\MassPrunable;

class Flight extends Model
{
    use MassPrunable;

    /**
     * Get the prunable model query.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->minus(months: 1));
    }
}
```

<a name="replicating-models"></a>
## Sao chép Model

Bạn có thể tạo một bản sao chưa được lưu của một model instance hiện có bằng phương thức `replicate`. Phương thức này đặc biệt hữu ích khi các model instance có nhiều attribute giống nhau:

```php
use App\Models\Address;

$shipping = Address::create([
    'type' => 'shipping',
    'line_1' => '123 Example Street',
    'city' => 'Victorville',
    'state' => 'CA',
    'postcode' => '90001',
]);

$billing = $shipping->replicate()->fill([
    'type' => 'billing'
]);

$billing->save();
```

Để loại trừ một hoặc nhiều attribute khỏi việc sao chép sang model mới, bạn có thể truyền một mảng vào phương thức `replicate`:

```php
$flight = Flight::create([
    'destination' => 'LAX',
    'origin' => 'LHR',
    'last_flown' => '2020-03-04 11:00:00',
    'last_pilot_id' => 747,
]);

$flight = $flight->replicate([
    'last_flown',
    'last_pilot_id'
]);
```

<a name="query-scopes"></a>
## Query Scope

<a name="global-scopes"></a>
### Global Scope

Global scope cho phép bạn thêm các ràng buộc vào mọi query của một model nhất định. Chức năng [soft delete](#soft-deleting) của Laravel sử dụng global scope để chỉ truy xuất các model "chưa bị xóa" từ cơ sở dữ liệu. Việc tự viết global scope là một cách thuận tiện để bảo đảm mọi query của model đều nhận các ràng buộc nhất định.

<a name="generating-scopes"></a>
#### Tạo Scope

Để tạo global scope mới, bạn có thể chạy command Artisan `make:scope`. Scope được tạo sẽ nằm trong thư mục `app/Models/Scopes` của ứng dụng:

```shell
php artisan make:scope AncientScope
```

<a name="writing-global-scopes"></a>
#### Viết Global Scope

Viết global scope khá đơn giản. Trước tiên, dùng command `make:scope` để tạo một class triển khai interface `Illuminate\Database\Eloquent\Scope`. Interface `Scope` yêu cầu triển khai một phương thức là `apply`. Phương thức `apply` có thể thêm các ràng buộc `where` hoặc những loại clause khác vào query khi cần:

```php
<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class AncientScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('created_at', '<', now()->minus(years: 2000));
    }
}
```

> [!NOTE]
> Nếu global scope thêm column vào select clause của query, bạn nên dùng phương thức `addSelect` thay vì `select`. Điều này tránh vô tình thay thế select clause hiện có của query.

<a name="applying-global-scopes"></a>
#### Áp dụng Global Scope

Để gán global scope cho model, bạn chỉ cần đặt attribute `ScopedBy` trên model:

```php
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;

#[ScopedBy([AncientScope::class])]
class User extends Model
{
    //
}
```

Hoặc, bạn có thể đăng ký global scope thủ công bằng cách override phương thức `booted` của model và gọi phương thức `addGlobalScope`. Phương thức `addGlobalScope` nhận một instance của scope làm đối số duy nhất:

```php
<?php

namespace App\Models;

use App\Models\Scopes\AncientScope;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new AncientScope);
    }
}
```

Sau khi thêm scope trong ví dụ trên vào model `App\Models\User`, lời gọi phương thức `User::all()` sẽ thực thi SQL query sau:

```sql
select * from `users` where `created_at` < 0021-02-18 00:00:00
```

<a name="anonymous-global-scopes"></a>
#### Global Scope ẩn danh

Eloquent cũng cho phép định nghĩa global scope bằng closure. Cách này đặc biệt hữu ích với những scope đơn giản không cần một class riêng. Khi định nghĩa global scope bằng closure, bạn nên cung cấp tên scope tự chọn làm đối số đầu tiên của phương thức `addGlobalScope`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('ancient', function (Builder $builder) {
            $builder->where('created_at', '<', now()->minus(years: 2000));
        });
    }
}
```

<a name="removing-global-scopes"></a>
#### Loại bỏ Global Scope

Nếu muốn loại bỏ một global scope khỏi một query cụ thể, bạn có thể dùng phương thức `withoutGlobalScope`. Phương thức này nhận tên class của global scope làm đối số duy nhất:

```php
User::withoutGlobalScope(AncientScope::class)->get();
```

Nếu global scope được định nghĩa bằng closure, hãy truyền tên dạng chuỗi mà bạn đã gán cho global scope:

```php
User::withoutGlobalScope('ancient')->get();
```

Nếu muốn loại bỏ nhiều hoặc toàn bộ global scope của query, bạn có thể dùng các phương thức `withoutGlobalScopes` và `withoutGlobalScopesExcept`:

```php
// Remove all of the global scopes...
User::withoutGlobalScopes()->get();

// Remove some of the global scopes...
User::withoutGlobalScopes([
    FirstScope::class, SecondScope::class
])->get();

// Remove all global scopes except the given ones...
User::withoutGlobalScopesExcept([
    SecondScope::class,
])->get();
```

<a name="local-scopes"></a>
### Local Scope

Local scope cho phép bạn định nghĩa các tập ràng buộc query phổ biến để dễ dàng tái sử dụng trong toàn ứng dụng. Ví dụ, bạn có thể thường xuyên cần truy xuất tất cả user được xem là "phổ biến". Để định nghĩa scope, hãy thêm attribute `Scope` vào một phương thức Eloquent.

Scope phải luôn trả về chính query builder instance đó hoặc `void`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Scope a query to only include popular users.
     */
    #[Scope]
    protected function popular(Builder $query): void
    {
        $query->where('votes', '>', 100);
    }

    /**
     * Scope a query to only include active users.
     */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('active', 1);
    }
}
```

<a name="utilizing-a-local-scope"></a>
#### Sử dụng Local Scope

Sau khi scope được định nghĩa, bạn có thể gọi các phương thức scope khi query model. Bạn cũng có thể chain nhiều scope với nhau:

```php
use App\Models\User;

$users = User::popular()->active()->orderBy('created_at')->get();
```

Khi kết hợp nhiều Eloquent model scope bằng toán tử query `or`, bạn có thể cần dùng closure để đạt được [logical grouping](/docs/{{version}}/queries#logical-grouping) chính xác:

```php
$users = User::popular()->orWhere(function (Builder $query) {
    $query->active();
})->get();
```

Tuy nhiên, vì cách này có thể khá rườm rà, Laravel cung cấp phương thức `orWhere` dạng "higher order", cho phép chain các scope một cách fluent mà không cần closure:

```php
$users = User::popular()->orWhere->active()->get();
```

<a name="dynamic-scopes"></a>
#### Dynamic Scope

Đôi khi bạn có thể muốn định nghĩa scope nhận tham số. Chỉ cần thêm các tham số bổ sung vào signature của phương thức scope. Các tham số của scope phải được định nghĩa sau tham số `$query`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Scope a query to only include users of a given type.
     */
    #[Scope]
    protected function ofType(Builder $query, string $type): void
    {
        $query->where('type', $type);
    }
}
```

Sau khi thêm các đối số cần thiết vào signature của phương thức scope, bạn có thể truyền chúng khi gọi scope:

```php
$users = User::ofType('admin')->get();
```

Các phương thức scope có attribute nên là `protected`. Khi gọi một attributed scope từ bên trong class model, hãy gọi scope thông qua một query builder instance, chẳng hạn `static::query()->ofType('admin')`, để bảo đảm lời gọi được chuyển qua cơ chế xử lý scope của Eloquent.

<a name="pending-attributes"></a>
### Attribute đang chờ

Nếu muốn dùng scope để tạo model có cùng các attribute được sử dụng làm điều kiện ràng buộc scope, bạn có thể dùng phương thức `withAttributes` khi xây dựng scope query:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /**
     * Scope the query to only include drafts.
     */
    #[Scope]
    protected function draft(Builder $query): void
    {
        $query->withAttributes([
            'hidden' => true,
        ]);
    }
}
```

Phương thức `withAttributes` sẽ thêm các điều kiện `where` vào query dựa trên những attribute đã cho, đồng thời thêm các attribute đó vào mọi model được tạo thông qua scope:

```php
$draft = Post::draft()->create(['title' => 'In Progress']);

$draft->hidden; // true
```

Để yêu cầu phương thức `withAttributes` không thêm điều kiện `where` vào query, bạn có thể đặt đối số `asConditions` thành `false`:

```php
$query->withAttributes([
    'hidden' => true,
], asConditions: false);
```

<a name="comparing-models"></a>
## So sánh Model

Đôi khi bạn cần xác định hai model có phải là "cùng một" model hay không. Các phương thức `is` và `isNot` có thể được dùng để nhanh chóng kiểm tra hai model có cùng primary key, table và database connection hay không:

```php
if ($post->is($anotherPost)) {
    // ...
}

if ($post->isNot($anotherPost)) {
    // ...
}
```

Các phương thức `is` và `isNot` cũng khả dụng khi sử dụng các [relationship](/docs/{{version}}/eloquent-relationships) `belongsTo`, `hasOne`, `morphTo` và `morphOne`. Cách này đặc biệt hữu ích khi bạn muốn so sánh một model liên quan mà không cần thực hiện query để truy xuất model đó:

```php
if ($post->author()->is($user)) {
    // ...
}
```

<a name="events"></a>
## Event

> [!NOTE]
> Bạn muốn broadcast Eloquent event trực tiếp đến ứng dụng phía client? Hãy xem [broadcast model event](/docs/{{version}}/broadcasting#model-broadcasting) của Laravel.

Eloquent model dispatch nhiều event, cho phép bạn hook vào các thời điểm sau trong vòng đời model: `retrieved`, `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `trashed`, `forceDeleting`, `forceDeleted`, `restoring`, `restored` và `replicating`.

Event `retrieved` được dispatch khi một model hiện có được truy xuất từ cơ sở dữ liệu. Khi model mới được lưu lần đầu, các event `creating` và `created` sẽ được dispatch. Các event `updating` / `updated` được dispatch khi model hiện có bị thay đổi và phương thức `save` được gọi. Các event `saving` / `saved` được dispatch khi model được tạo hoặc cập nhật, kể cả khi attribute của model không thay đổi. Event có tên kết thúc bằng `-ing` được dispatch trước khi thay đổi được persist vào model, còn event kết thúc bằng `-ed` được dispatch sau khi thay đổi đã được persist.

Để bắt đầu lắng nghe model event, hãy định nghĩa property `$dispatchesEvents` trên Eloquent model. Property này ánh xạ các thời điểm khác nhau trong vòng đời Eloquent model tới các [event class](/docs/{{version}}/events) của bạn. Mỗi model event class nên nhận một instance của model bị tác động thông qua constructor:

```php
<?php

namespace App\Models;

use App\Events\UserDeleted;
use App\Events\UserSaved;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The event map for the model.
     *
     * @var array<string, string>
     */
    protected $dispatchesEvents = [
        'saved' => UserSaved::class,
        'deleted' => UserDeleted::class,
    ];
}
```

Sau khi định nghĩa và ánh xạ Eloquent event, bạn có thể dùng [event listener](/docs/{{version}}/events#defining-listeners) để xử lý các event.

> [!WARNING]
> Khi thực hiện query cập nhật hoặc xóa hàng loạt qua Eloquent, các model event `saved`, `updated`, `deleting` và `deleted` sẽ không được dispatch cho các model bị tác động. Nguyên nhân là các model không thực sự được truy xuất khi thực hiện cập nhật hoặc xóa hàng loạt.

<a name="events-using-closures"></a>
### Sử dụng Closure

Thay vì dùng custom event class, bạn có thể đăng ký closure để thực thi khi các model event tương ứng được dispatch. Thông thường, bạn nên đăng ký các closure này trong phương thức `booted` của model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::created(function (User $user) {
            // ...
        });
    }
}
```

Nếu cần, bạn có thể sử dụng [queueable anonymous event listener](/docs/{{version}}/events#queueable-anonymous-event-listeners) khi đăng ký model event. Điều này yêu cầu Laravel thực thi model event listener ở background bằng [queue](/docs/{{version}}/queues) của ứng dụng:

```php
use function Illuminate\Events\queueable;

static::created(queueable(function (User $user) {
    // ...
}));
```

<a name="observers"></a>
### Observer

<a name="defining-observers"></a>
#### Định nghĩa Observer

Nếu lắng nghe nhiều event trên một model, bạn có thể dùng observer để gom tất cả listener vào một class duy nhất. Các phương thức trong observer có tên tương ứng với Eloquent event mà bạn muốn lắng nghe. Mỗi phương thức nhận model bị tác động làm đối số duy nhất. Command Artisan `make:observer` là cách đơn giản nhất để tạo observer class mới:

```shell
php artisan make:observer UserObserver --model=User
```

Command này sẽ đặt observer mới trong thư mục `app/Observers`. Nếu thư mục chưa tồn tại, Artisan sẽ tạo nó. Observer mới sẽ có dạng như sau:

```php
<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        // ...
    }

    /**
     * Handle the User "forceDeleted" event.
     */
    public function forceDeleted(User $user): void
    {
        // ...
    }
}
```

Để đăng ký observer, bạn có thể đặt attribute `ObservedBy` trên model tương ứng:

```php
use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

#[ObservedBy([UserObserver::class])]
class User extends Authenticatable
{
    //
}
```

Hoặc, bạn có thể đăng ký observer thủ công bằng cách gọi phương thức `observe` trên model cần theo dõi. Bạn có thể đăng ký observer trong phương thức `boot` của class `AppServiceProvider` của ứng dụng:

```php
use App\Models\User;
use App\Observers\UserObserver;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    User::observe(UserObserver::class);
}
```

> [!NOTE]
> Observer còn có thể lắng nghe các event khác như `saving` và `retrieved`. Các event này được mô tả trong tài liệu [event](#events).

<a name="observers-and-database-transactions"></a>
#### Observer và Database Transaction

Khi model được tạo bên trong database transaction, bạn có thể muốn observer chỉ thực thi event handler sau khi transaction được commit. Bạn có thể làm điều này bằng cách triển khai interface `ShouldHandleEventsAfterCommit` trên observer. Nếu không có database transaction đang diễn ra, các event handler sẽ được thực thi ngay lập tức:

```php
<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class UserObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // ...
    }
}
```

<a name="muting-events"></a>
### Tạm tắt Event

Đôi khi bạn cần tạm thời "tắt" tất cả event do model phát ra. Bạn có thể thực hiện bằng phương thức `withoutEvents`. Phương thức này nhận một closure làm đối số duy nhất. Mọi code thực thi bên trong closure sẽ không dispatch model event, và giá trị closure trả về cũng sẽ được phương thức `withoutEvents` trả về:

```php
use App\Models\User;

$user = User::withoutEvents(function () {
    User::findOrFail(1)->delete();

    return User::find(2);
});
```

<a name="saving-a-single-model-without-events"></a>
#### Lưu một Model mà không phát Event

Đôi khi bạn có thể muốn "lưu" một model mà không dispatch bất kỳ event nào. Bạn có thể thực hiện bằng phương thức `saveQuietly`:

```php
$user = User::findOrFail(1);

$user->name = 'Victoria Faith';

$user->saveQuietly();
```

Bạn cũng có thể "update", "delete", "soft delete", "restore" và "replicate" một model mà không dispatch bất kỳ event nào:

```php
$user->deleteQuietly();
$user->forceDeleteQuietly();
$user->restoreQuietly();
```
