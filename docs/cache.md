# Cache

<a name="introduction"></a>
## Giới thiệu

Một số tác vụ truy xuất hoặc xử lý dữ liệu của ứng dụng có thể tiêu tốn nhiều CPU hoặc mất vài giây để hoàn thành. Trong trường hợp này, thông thường bạn sẽ lưu dữ liệu đã truy xuất vào cache trong một khoảng thời gian để các request tiếp theo cho cùng dữ liệu có thể lấy lại nhanh chóng. Dữ liệu cache thường được lưu trong một data store có tốc độ rất cao như [Memcached](https://memcached.org) hoặc [Redis](https://redis.io).

Laravel cung cấp một API thống nhất, giàu tính biểu đạt cho nhiều cache backend khác nhau, giúp bạn tận dụng khả năng truy xuất dữ liệu rất nhanh của chúng để tăng tốc ứng dụng web.

<a name="configuration"></a>
## Cấu hình

File cấu hình cache của ứng dụng nằm tại `config/cache.php`. Trong file này, bạn có thể chỉ định cache store mặc định được sử dụng trong toàn bộ ứng dụng. Laravel hỗ trợ sẵn các cache backend phổ biến như [Memcached](https://memcached.org), [Redis](https://redis.io), [DynamoDB](https://aws.amazon.com/dynamodb), cơ sở dữ liệu quan hệ và filesystem disk. Ngoài ra còn có cache driver dựa trên file, trong khi các driver `array` và `null` cung cấp backend cache thuận tiện cho automated test.

File cấu hình cache cũng chứa nhiều tùy chọn khác mà bạn có thể xem xét. Theo mặc định, Laravel được cấu hình sử dụng cache driver `database`, lưu các object đã được tuần tự hóa và cache trong cơ sở dữ liệu của ứng dụng.

<a name="driver-prerequisites"></a>
### Điều kiện tiên quyết của driver

<a name="prerequisites-database"></a>
#### Database

Khi sử dụng cache driver `database`, bạn cần một bảng cơ sở dữ liệu để chứa dữ liệu cache. Thông thường bảng này được tạo bởi [database migration](/migrations) mặc định `0001_01_01_000001_create_cache_table.php` của Laravel. Tuy nhiên, nếu ứng dụng không có migration này, bạn có thể dùng lệnh Artisan `make:cache-table` để tạo:

```shell
php artisan make:cache-table

php artisan migrate
```

<a name="memcached"></a>
#### Memcached

Để sử dụng driver Memcached, bạn cần cài đặt [package Memcached PECL](https://pecl.php.net/package/memcached). Bạn có thể khai báo tất cả server Memcached trong file cấu hình `config/cache.php`. File này đã có sẵn mục `memcached.servers` để bạn bắt đầu:

```php
'memcached' => [
    // ...

    'servers' => [
        [
            'host' => env('MEMCACHED_HOST', '127.0.0.1'),
            'port' => env('MEMCACHED_PORT', 11211),
            'weight' => 100,
        ],
    ],
],
```

Nếu cần, bạn có thể đặt tùy chọn `host` thành đường dẫn UNIX socket. Khi đó, tùy chọn `port` nên được đặt thành `0`:

```php
'memcached' => [
    // ...

    'servers' => [
        [
            'host' => '/var/run/memcached/memcached.sock',
            'port' => 0,
            'weight' => 100
        ],
    ],
],
```

<a name="redis"></a>
#### Redis

Trước khi sử dụng Redis cache với Laravel, bạn cần cài extension PHP PhpRedis thông qua PECL hoặc cài package `predis/predis` bằng Composer. [Laravel Sail](/sail) đã bao gồm extension này. Ngoài ra, các nền tảng ứng dụng Laravel chính thức như [Laravel Cloud](https://cloud.laravel.com) và [Laravel Forge](https://forge.laravel.com) cũng cài sẵn extension PhpRedis theo mặc định.

Để biết thêm thông tin về cấu hình Redis, hãy xem [trang tài liệu Redis của Laravel](/redis#configuration).

<a name="storage"></a>
#### Storage

Driver cache `storage` cho phép bạn lưu các giá trị cache trên bất kỳ [filesystem disk](/filesystem) nào đã được cấu hình cho ứng dụng. Điều này hữu ích khi bạn muốn dùng một disk hiện có, chẳng hạn S3 disk, làm cache store dạng key / value:

```php
'storage' => [
    'driver' => 'storage',
    'disk' => env('CACHE_STORAGE_DISK'),
    'path' => env('CACHE_STORAGE_PATH', 'framework/cache/data'),
],
```

<a name="dynamodb"></a>
#### DynamoDB

Trước khi sử dụng cache driver [DynamoDB](https://aws.amazon.com/dynamodb), bạn phải tạo một bảng DynamoDB để lưu toàn bộ dữ liệu cache. Thông thường bảng này nên có tên `cache`. Tuy nhiên, tên bảng nên tương ứng với giá trị cấu hình `stores.dynamodb.table` trong file cấu hình `cache`. Bạn cũng có thể đặt tên bảng thông qua biến môi trường `DYNAMODB_CACHE_TABLE`.

Bảng này cũng cần có partition key kiểu chuỗi với tên tương ứng với giá trị của mục cấu hình `stores.dynamodb.attributes.key` trong file cấu hình `cache` của ứng dụng. Theo mặc định, partition key nên có tên `key`.

Thông thường DynamoDB không chủ động xóa các item đã hết hạn khỏi bảng. Vì vậy, bạn nên [bật Time to Live (TTL)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html) cho bảng. Khi cấu hình TTL, hãy đặt tên thuộc tính TTL là `expires_at`.

Tiếp theo, hãy cài AWS SDK để ứng dụng Laravel có thể giao tiếp với DynamoDB:

```shell
composer require aws/aws-sdk-php
```

Ngoài ra, hãy bảo đảm các tùy chọn cấu hình của DynamoDB cache store đã được cung cấp giá trị. Thông thường các tùy chọn như `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` nên được định nghĩa trong file `.env` của ứng dụng:

```php
'dynamodb' => [
    'driver' => 'dynamodb',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => env('DYNAMODB_CACHE_TABLE', 'cache'),
    'endpoint' => env('DYNAMODB_ENDPOINT'),
],
```

<a name="mongodb"></a>
#### MongoDB

Nếu sử dụng MongoDB, package chính thức `mongodb/laravel-mongodb` cung cấp cache driver `mongodb`, có thể được cấu hình thông qua database connection `mongodb`. MongoDB hỗ trợ TTL index, cho phép tự động xóa các item cache đã hết hạn.

Để biết thêm thông tin về cấu hình MongoDB, hãy xem tài liệu [Cache and Locks](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/cache/) của MongoDB.

<a name="cache-usage"></a>
## Sử dụng cache

<a name="obtaining-a-cache-instance"></a>
### Lấy một cache instance

Để lấy một cache store instance, bạn có thể sử dụng facade `Cache`; đây cũng là cách được dùng xuyên suốt tài liệu này. Facade `Cache` cung cấp cách truy cập ngắn gọn, thuận tiện đến các implementation bên dưới của cache contract trong Laravel:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    /**
     * Show a list of all users of the application.
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

<a name="accessing-multiple-cache-stores"></a>
#### Truy cập nhiều cache store

Với facade `Cache`, bạn có thể truy cập nhiều cache store thông qua phương thức `store`. Key truyền vào `store` phải tương ứng với một store được liệt kê trong mảng cấu hình `stores` của file cấu hình `cache`:

```php
$value = Cache::store('file')->get('foo');

Cache::store('redis')->put('bar', 'baz', 600); // 10 Minutes
```

<a name="retrieving-items-from-the-cache"></a>
### Lấy item từ cache

Phương thức `get` của facade `Cache` dùng để lấy item từ cache. Nếu item không tồn tại, phương thức sẽ trả về `null`. Bạn cũng có thể truyền đối số thứ hai cho `get` để chỉ định giá trị mặc định được trả về khi item không tồn tại:

```php
$value = Cache::get('key');

$value = Cache::get('key', 'default');
```

Bạn thậm chí có thể truyền closure làm giá trị mặc định. Kết quả của closure sẽ được trả về nếu item được chỉ định không tồn tại trong cache. Việc truyền closure cho phép trì hoãn việc lấy giá trị mặc định từ cơ sở dữ liệu hoặc dịch vụ bên ngoài cho đến khi thực sự cần:

```php
$value = Cache::get('key', function () {
    return DB::table(/* ... */)->get();
});
```

<a name="determining-item-existence"></a>
#### Xác định item có tồn tại

Phương thức `has` có thể được dùng để xác định một item có tồn tại trong cache hay không. Phương thức này cũng trả về `false` nếu item tồn tại nhưng giá trị của nó là `null`:

```php
if (Cache::has('key')) {
    // ...
}
```

<a name="incrementing-decrementing-values"></a>
#### Tăng / giảm giá trị

Các phương thức `increment` và `decrement` dùng để điều chỉnh giá trị của các item số nguyên trong cache. Cả hai phương thức đều nhận đối số thứ hai tùy chọn để chỉ định lượng cần tăng hoặc giảm:

```php
// Initialize the value if it does not exist...
Cache::add('key', 0, now()->plus(hours: 4));

// Increment or decrement the value...
Cache::increment('key');
Cache::increment('key', $amount);
Cache::decrement('key');
Cache::decrement('key', $amount);
```

<a name="retrieve-store"></a>
#### Lấy và lưu

Đôi khi bạn muốn lấy một item từ cache, đồng thời lưu một giá trị mặc định nếu item được yêu cầu chưa tồn tại. Ví dụ, bạn có thể muốn lấy toàn bộ user từ cache; nếu chưa có, lấy chúng từ cơ sở dữ liệu rồi thêm vào cache. Bạn có thể thực hiện việc này bằng phương thức `Cache::remember`:

```php
$value = Cache::remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

Nếu item không tồn tại trong cache, closure truyền vào phương thức `remember` sẽ được thực thi và kết quả của nó sẽ được lưu vào cache.

Nếu cần biết item được lấy trực tiếp từ cache hay được tạo ra bằng cách thực thi closure, bạn có thể dùng `rememberWithWarmth`. Phương thức này trả về một mảng gồm giá trị cache và một boolean cho biết item có ở trạng thái "warm" hay không, tức là giá trị được lấy từ cache thay vì được resolve từ closure:

```php
[$value, $warm] = Cache::rememberWithWarmth('users', $seconds, function () {
    return DB::table('users')->get();
});
```

Bạn có thể dùng `rememberForever` để lấy item từ cache hoặc lưu item vĩnh viễn nếu nó chưa tồn tại:

```php
$value = Cache::rememberForever('users', function () {
    return DB::table('users')->get();
});
```

<a name="swr"></a>
#### Stale While Revalidate

Khi sử dụng `Cache::remember`, một số request có thể phản hồi chậm nếu giá trị cache đã hết hạn. Với một số loại dữ liệu, việc tạm thời phục vụ dữ liệu đã cũ trong khi giá trị cache được tính lại ở background có thể hữu ích, nhờ đó tránh để người dùng phải chờ quá lâu trong lúc tính lại cache. Mẫu này thường được gọi là "stale-while-revalidate", và phương thức `Cache::flexible` cung cấp implementation cho mẫu này.

Phương thức `flexible` nhận một mảng xác định khoảng thời gian giá trị cache được xem là "fresh" và khi nào nó trở thành "stale". Giá trị đầu tiên trong mảng là số giây cache được xem là fresh; giá trị thứ hai xác định khoảng thời gian dữ liệu stale vẫn có thể được phục vụ trước khi bắt buộc phải tính lại.

Nếu request đến trong giai đoạn fresh (trước mốc đầu tiên), giá trị cache được trả về ngay mà không cần tính lại. Nếu request đến trong giai đoạn stale (giữa hai mốc), giá trị stale được trả cho người dùng và một [deferred function](/helpers#deferred-functions) được đăng ký để làm mới cache sau khi response đã gửi đi. Nếu request đến sau mốc thứ hai, cache được xem là đã hết hạn và giá trị sẽ được tính lại ngay lập tức, vì vậy response có thể chậm hơn:

```php
$value = Cache::flexible('users', [5, 10], function () {
    return DB::table('users')->get();
});
```

<a name="retrieve-delete"></a>
#### Lấy và xóa

Nếu cần lấy một item từ cache rồi xóa item đó, bạn có thể dùng phương thức `pull`. Tương tự `get`, phương thức sẽ trả về `null` nếu item không tồn tại trong cache:

```php
$value = Cache::pull('key');

$value = Cache::pull('key', 'default');
```

<a name="storing-items-in-the-cache"></a>
### Lưu item vào cache

Bạn có thể dùng phương thức `put` trên facade `Cache` để lưu item vào cache:

```php
Cache::put('key', 'value', $seconds = 10);
```

Nếu không truyền thời gian lưu cho `put`, item sẽ được lưu không thời hạn:

```php
Cache::put('key', 'value');
```

Thay vì truyền số giây dưới dạng số nguyên, bạn cũng có thể truyền một instance `DateTime` biểu thị thời điểm hết hạn mong muốn của item cache:

```php
Cache::put('key', 'value', now()->plus(minutes: 10));
```

<a name="store-if-not-present"></a>
#### Chỉ lưu khi chưa tồn tại

Phương thức `add` chỉ thêm item vào cache nếu item chưa tồn tại trong cache store. Phương thức trả về `true` nếu item thực sự được thêm; ngược lại trả về `false`. `add` là một atomic operation:

```php
Cache::add('key', 'value', $seconds);
```

<a name="extending-item-lifetime"></a>
### Gia hạn thời gian tồn tại của item

Phương thức `touch` cho phép gia hạn thời gian tồn tại (TTL) của một cache item hiện có. `touch` trả về `true` nếu item tồn tại và thời điểm hết hạn được gia hạn thành công. Nếu item không tồn tại trong cache, phương thức trả về `false`:

```php
Cache::touch('key', 3600);
```

Bạn có thể truyền instance `DateTimeInterface`, `DateInterval` hoặc `Carbon` để chỉ định chính xác thời điểm hết hạn:

```php
Cache::touch('key', now()->addHours(2));
```

<a name="storing-items-forever"></a>
#### Lưu item vĩnh viễn

Phương thức `forever` có thể được dùng để lưu item vĩnh viễn trong cache. Vì các item này không tự hết hạn, bạn phải xóa chúng thủ công bằng phương thức `forget`:

```php
Cache::forever('key', 'value');
```

> [!NOTE]
> Nếu sử dụng driver Memcached, các item được lưu "vĩnh viễn" vẫn có thể bị loại bỏ khi cache đạt giới hạn dung lượng.

<a name="removing-items-from-the-cache"></a>
### Xóa item khỏi cache

Bạn có thể xóa item khỏi cache bằng phương thức `forget`:

```php
Cache::forget('key');
```

Bạn cũng có thể xóa item bằng cách cung cấp số giây hết hạn bằng 0 hoặc số âm:

```php
Cache::put('key', 'value', 0);

Cache::put('key', 'value', -5);
```

Bạn có thể xóa toàn bộ cache bằng phương thức `flush`:

```php
Cache::flush();
```

Bạn có thể xóa toàn bộ atomic lock trong cache bằng phương thức `flushLocks`:

```php
Cache::flushLocks();
```

> [!WARNING]
> Việc flush cache không tuân theo "prefix" cache đã cấu hình và sẽ xóa tất cả entry trong cache. Hãy cân nhắc kỹ khi xóa một cache đang được dùng chung với các ứng dụng khác.

<a name="cache-memoization"></a>
### Memoization cache

Cache driver `memo` của Laravel cho phép tạm thời lưu các giá trị cache đã resolve trong bộ nhớ trong suốt một request hoặc một lần thực thi job. Điều này tránh việc truy cập cache lặp lại trong cùng lần thực thi và có thể cải thiện hiệu năng đáng kể.

Để sử dụng memoized cache, hãy gọi phương thức `memo`:

```php
use Illuminate\Support\Facades\Cache;

$value = Cache::memo()->get('key');
```

Phương thức `memo` có thể nhận tên cache store để chỉ định store bên dưới mà memoized driver sẽ bao bọc:

```php
// Using the default cache store...
$value = Cache::memo()->get('key');

// Using the Redis cache store...
$value = Cache::memo('redis')->get('key');
```

Lần gọi `get` đầu tiên cho một key sẽ lấy giá trị từ cache store; các lần gọi tiếp theo trong cùng request hoặc job sẽ lấy giá trị từ bộ nhớ:

```php
// Hits the cache...
$value = Cache::memo()->get('key');

// Does not hit the cache, returns memoized value...
$value = Cache::memo()->get('key');
```

Khi gọi các phương thức thay đổi giá trị cache như `put`, `increment`, `remember`, v.v., memoized cache sẽ tự động quên giá trị đã memoize và chuyển lời gọi thay đổi xuống cache store bên dưới:

```php
Cache::memo()->put('name', 'Taylor'); // Writes to underlying cache...
Cache::memo()->get('name');           // Hits underlying cache...
Cache::memo()->get('name');           // Memoized, does not hit cache...

Cache::memo()->put('name', 'Tim');    // Forgets memoized value, writes new value...
Cache::memo()->get('name');           // Hits underlying cache again...
```

<a name="the-cache-helper"></a>
### Helper cache

Ngoài facade `Cache`, bạn cũng có thể dùng hàm global `cache` để lấy và lưu dữ liệu qua cache. Khi `cache` được gọi với một đối số chuỗi duy nhất, hàm sẽ trả về giá trị của key tương ứng:

```php
$value = cache('key');
```

Nếu truyền một mảng các cặp key / value cùng thời gian hết hạn, hàm sẽ lưu các giá trị vào cache trong khoảng thời gian được chỉ định:

```php
cache(['key' => 'value'], $seconds);

cache(['key' => 'value'], now()->plus(minutes: 10));
```

Khi hàm `cache` được gọi mà không có đối số, nó trả về một instance của implementation `Illuminate\Contracts\Cache\Factory`, cho phép bạn gọi các phương thức cache khác:

```php
cache()->remember('users', $seconds, function () {
    return DB::table('users')->get();
});
```

> [!NOTE]
> Khi kiểm thử các lời gọi đến hàm `cache` toàn cục, bạn có thể sử dụng phương thức `Cache::shouldReceive` tương tự như khi [kiểm thử facade](/mocking#mocking-facades).

<a name="cache-tags"></a>
## Cache tag

> [!WARNING]
> Cache tag không được hỗ trợ khi sử dụng các cache driver `file`, `dynamodb`, `database` hoặc `storage`.

<a name="storing-tagged-cache-items"></a>
### Lưu cache item có tag

Cache tag cho phép gắn tag cho các item liên quan trong cache, sau đó flush toàn bộ giá trị cache được gán một tag cụ thể. Bạn có thể truy cập tagged cache bằng cách truyền một mảng tên tag theo đúng thứ tự. Ví dụ, hãy truy cập một tagged cache và `put` một giá trị vào cache:

```php
use Illuminate\Support\Facades\Cache;

Cache::tags(['people', 'artists'])->put('John', $john, $seconds);
Cache::tags(['people', 'authors'])->put('Anne', $anne, $seconds);
```

<a name="accessing-tagged-cache-items"></a>
### Truy cập cache item có tag

Các item được lưu bằng tag không thể được truy cập nếu không cung cấp các tag đã dùng khi lưu. Để lấy một tagged cache item, hãy truyền cùng danh sách tag theo đúng thứ tự vào phương thức `tags`, sau đó gọi `get` với key cần lấy:

```php
$john = Cache::tags(['people', 'artists'])->get('John');

$anne = Cache::tags(['people', 'authors'])->get('Anne');
```

<a name="removing-tagged-cache-items"></a>
### Xóa cache item có tag

Bạn có thể flush toàn bộ item được gán một tag hoặc một danh sách tag. Ví dụ, đoạn code sau sẽ xóa mọi cache được gắn tag `people`, `authors` hoặc cả hai. Vì vậy, cả `Anne` và `John` đều sẽ bị xóa khỏi cache:

```php
Cache::tags(['people', 'authors'])->flush();
```

Ngược lại, đoạn code dưới đây chỉ xóa các giá trị cache được gắn tag `authors`, vì vậy `Anne` sẽ bị xóa nhưng `John` thì không:

```php
Cache::tags('authors')->flush();
```

<a name="atomic-locks"></a>
## Atomic lock

> [!WARNING]
> Để sử dụng tính năng này, ứng dụng phải dùng cache driver `memcached`, `redis`, `dynamodb`, `database`, `file` hoặc `array` làm cache driver mặc định. Ngoài ra, tất cả server phải giao tiếp với cùng một cache server trung tâm.

<a name="managing-locks"></a>
### Quản lý lock

Atomic lock cho phép thao tác với distributed lock mà không phải tự xử lý race condition. Ví dụ, [Laravel Cloud](https://cloud.laravel.com) sử dụng atomic lock để bảo đảm tại một thời điểm chỉ có một remote task được thực thi trên server. Bạn có thể tạo và quản lý lock bằng phương thức `Cache::lock`:

```php
use Illuminate\Support\Facades\Cache;

$lock = Cache::lock('foo', 10);

if ($lock->get()) {
    // Lock acquired for 10 seconds...

    $lock->release();
}
```

Phương thức `get` cũng nhận một closure. Sau khi closure được thực thi, Laravel sẽ tự động giải phóng lock:

```php
Cache::lock('foo', 10)->get(function () {
    // Lock acquired for 10 seconds and automatically released...
});
```

Nếu lock chưa khả dụng tại thời điểm bạn yêu cầu, bạn có thể chỉ định Laravel chờ trong một số giây nhất định. Nếu không thể lấy được lock trong khoảng thời gian đó, `Illuminate\Contracts\Cache\LockTimeoutException` sẽ được ném ra:

```php
use Illuminate\Contracts\Cache\LockTimeoutException;

$lock = Cache::lock('foo', 10);

try {
    $lock->block(5);

    // Lock acquired after waiting a maximum of 5 seconds...
} catch (LockTimeoutException $e) {
    // Unable to acquire lock...
} finally {
    $lock->release();
}
```

Ví dụ trên có thể được rút gọn bằng cách truyền một closure vào phương thức `block`. Khi nhận closure, Laravel sẽ cố lấy lock trong số giây được chỉ định và tự động giải phóng lock sau khi closure thực thi xong:

```php
Cache::lock('foo', 10)->block(5, function () {
    // Lock acquired for 10 seconds after waiting a maximum of 5 seconds...
});
```

<a name="managing-locks-across-processes"></a>
### Quản lý lock giữa các process

Đôi khi bạn cần lấy lock trong một process và giải phóng nó ở process khác. Ví dụ, bạn có thể lấy lock trong một web request rồi muốn giải phóng lock ở cuối queued job được request đó kích hoạt. Trong trường hợp này, hãy truyền "owner token" có phạm vi của lock vào queued job để job có thể khởi tạo lại lock bằng token đã cho.

Trong ví dụ dưới đây, chúng ta dispatch một queued job khi lấy lock thành công. Đồng thời, owner token của lock được truyền vào queued job thông qua phương thức `owner`:

```php
$podcast = Podcast::find($id);

$lock = Cache::lock('processing', 120);

if ($lock->get()) {
    ProcessPodcast::dispatch($podcast, $lock->owner());
}
```

Trong job `ProcessPodcast` của ứng dụng, chúng ta có thể khôi phục và giải phóng lock bằng owner token:

```php
Cache::restoreLock('processing', $this->owner)->release();
```

Nếu muốn giải phóng lock mà không xét owner hiện tại, bạn có thể dùng phương thức `forceRelease`:

```php
Cache::lock('processing')->forceRelease();
```

<a name="refreshing-locks"></a>
### Gia hạn lock

Nếu cần kéo dài thời gian hết hạn của lock mà bạn hiện đang sở hữu, hãy dùng phương thức `refresh`. Nếu không truyền số giây, Laravel sẽ dùng thời lượng ban đầu của lock. Cách này hữu ích cho các tác vụ chạy lâu khi bạn muốn lấy một lock ngắn rồi gia hạn định kỳ thay vì tạo ngay một lock có thời gian hết hạn rất dài:

```php
$lock = Cache::lock('generate-reports', 60);

if ($lock->get()) {
    foreach ($reports as $report) {
        $report->generate();

        // Extend the lock for another 60 seconds...
        $lock->refresh();
    }

    $lock->release();
}
```

<a name="concurrency-limiting"></a>
### Giới hạn thực thi đồng thời

Chức năng atomic lock của Laravel cũng cung cấp một số cách giới hạn việc thực thi closure đồng thời. Dùng `withoutOverlapping` khi bạn chỉ muốn cho phép một instance chạy trên toàn bộ hạ tầng tại một thời điểm:

```php
Cache::withoutOverlapping('foo', function () {
    // Lock acquired after waiting a maximum of 10 seconds...
});
```

Mặc định, lock được giữ cho đến khi closure thực thi xong và phương thức sẽ chờ tối đa 10 giây để lấy lock. Bạn có thể tùy chỉnh các giá trị này bằng các đối số bổ sung:

```php
Cache::withoutOverlapping('foo', function () {
    // Lock acquired for 120 seconds after waiting a maximum of 5 seconds...
}, lockFor: 120, waitFor: 5);
```

Nếu không thể lấy lock trong thời gian chờ đã chỉ định, `Illuminate\Contracts\Cache\LockTimeoutException` sẽ được ném ra.

Nếu muốn kiểm soát mức độ chạy song song, hãy dùng phương thức `funnel` để đặt số lượng thực thi đồng thời tối đa. Phương thức `funnel` hoạt động với mọi cache driver hỗ trợ lock:

```php
Cache::funnel('foo')
    ->limit(3)
    ->releaseAfter(60)
    ->block(10)
    ->then(function () {
        // Concurrency lock acquired...
    }, function () {
        // Could not acquire concurrency lock...
    });
```

Key của `funnel` xác định resource đang được giới hạn. Phương thức `limit` xác định số lượng thực thi đồng thời tối đa. `releaseAfter` đặt thời gian an toàn tính bằng giây trước khi một slot đã lấy được tự động giải phóng. `block` xác định số giây chờ một slot khả dụng.

Nếu muốn xử lý timeout bằng exception thay vì cung cấp failure closure, bạn có thể bỏ closure thứ hai. `Illuminate\Cache\Limiters\LimiterTimeoutException` sẽ được ném ra nếu không thể lấy lock trong thời gian chờ đã chỉ định:

```php
use Illuminate\Cache\Limiters\LimiterTimeoutException;

try {
    Cache::funnel('foo')
        ->limit(3)
        ->releaseAfter(60)
        ->block(10)
        ->then(function () {
            // Concurrency lock acquired...
        });
} catch (LimiterTimeoutException $e) {
    // Unable to acquire concurrency lock...
}
```

Nếu muốn dùng một cache store cụ thể cho concurrency limiter, bạn có thể gọi phương thức `funnel` trên store mong muốn:

```php
Cache::store('redis')->funnel('foo')
    ->limit(3)
    ->block(10)
    ->then(function () {
        // Concurrency lock acquired using the "redis" store...
    });
```

> [!NOTE]
> Phương thức `funnel` yêu cầu cache store implement interface `Illuminate\Contracts\Cache\LockProvider`. Nếu cố dùng `funnel` với cache store không hỗ trợ lock, `BadMethodCallException` sẽ được ném ra.

<a name="cache-failover"></a>
## Cache failover

Cache driver `failover` cung cấp khả năng tự động chuyển sang store dự phòng khi thao tác với cache. Nếu cache store chính của store `failover` gặp lỗi vì bất kỳ lý do nào, Laravel sẽ tự động thử store tiếp theo trong danh sách cấu hình. Điều này đặc biệt hữu ích để bảo đảm tính sẵn sàng cao trong môi trường production, nơi độ tin cậy của cache rất quan trọng.

Để cấu hình một failover cache store, hãy chỉ định driver `failover` và cung cấp một mảng tên store theo thứ tự cần thử. Mặc định, Laravel có sẵn cấu hình failover mẫu trong file `config/cache.php` của ứng dụng:

```php
'failover' => [
    'driver' => 'failover',
    'stores' => [
        'database',
        'array',
    ],
],
```

Sau khi cấu hình store sử dụng driver `failover`, bạn cần đặt failover store làm cache store mặc định trong file `.env` để sử dụng chức năng này:

```ini
CACHE_STORE=failover
```

Khi một thao tác cache store thất bại và failover được kích hoạt, Laravel sẽ dispatch event `Illuminate\Cache\Events\CacheFailedOver`, cho phép bạn báo cáo hoặc ghi log việc cache store gặp lỗi.

<a name="adding-custom-cache-drivers"></a>
## Thêm cache driver tùy chỉnh

<a name="writing-the-driver"></a>
### Viết driver

Để tạo cache driver tùy chỉnh, trước tiên chúng ta cần implement [contract](/contracts) `Illuminate\Contracts\Cache\Store`. Vì vậy, một implementation cache bằng MongoDB có thể trông như sau:

```php
<?php

namespace App\Extensions;

use Illuminate\Contracts\Cache\Store;

class MongoStore implements Store
{
    public function get($key) {}
    public function many(array $keys) {}
    public function put($key, $value, $seconds) {}
    public function putMany(array $values, $seconds) {}
    public function increment($key, $value = 1) {}
    public function decrement($key, $value = 1) {}
    public function forever($key, $value) {}
    public function forget($key) {}
    public function flush() {}
    public function getPrefix() {}
}
```

Chúng ta chỉ cần implement từng phương thức trên bằng kết nối MongoDB. Để xem ví dụ triển khai từng phương thức, hãy tham khảo `Illuminate\Cache\MemcachedStore` trong [source code Laravel framework](https://github.com/laravel/framework). Sau khi implementation hoàn tất, chúng ta có thể hoàn thành việc đăng ký driver tùy chỉnh bằng cách gọi phương thức `extend` của facade `Cache`:

```php
Cache::extend('mongo', function (Application $app) {
    return Cache::repository(new MongoStore);
});
```

> [!NOTE]
> Nếu đang cân nhắc đặt code cache driver tùy chỉnh ở đâu, bạn có thể tạo namespace `Extensions` bên trong thư mục `app`. Tuy nhiên, Laravel không áp đặt cấu trúc ứng dụng cứng nhắc, vì vậy bạn có thể tổ chức ứng dụng theo nhu cầu của mình.

<a name="registering-the-driver"></a>
### Đăng ký driver

Để đăng ký cache driver tùy chỉnh với Laravel, chúng ta sẽ dùng phương thức `extend` trên facade `Cache`. Vì các service provider khác có thể cố đọc giá trị cache trong phương thức `boot`, driver tùy chỉnh sẽ được đăng ký bên trong callback `booting`. Cách này bảo đảm driver được đăng ký ngay trước khi phương thức `boot` được gọi trên các service provider của ứng dụng, nhưng sau khi phương thức `register` đã được gọi trên tất cả service provider. Callback `booting` sẽ được đăng ký trong phương thức `register` của class `App\Providers\AppServiceProvider`:

```php
<?php

namespace App\Providers;

use App\Extensions\MongoStore;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->booting(function () {
             Cache::extend('mongo', function (Application $app) {
                 return Cache::repository(new MongoStore);
             });
         });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ...
    }
}
```

Đối số đầu tiên truyền vào phương thức `extend` là tên driver. Tên này tương ứng với option `driver` trong file cấu hình `config/cache.php`. Đối số thứ hai là một closure phải trả về instance `Illuminate\Cache\Repository`. Closure nhận `$app`, là một instance của [service container](/container).

Sau khi extension được đăng ký, hãy cập nhật biến môi trường `CACHE_STORE` hoặc option `default` trong file `config/cache.php` thành tên extension của bạn.

<a name="events"></a>
## Event

Để thực thi code trên mọi thao tác cache, bạn có thể lắng nghe các [event](/events) khác nhau do cache dispatch:

<div class="overflow-auto">

| Tên event                                       |
|-------------------------------------------------|
| `Illuminate\Cache\Events\CacheFlushed`          |
| `Illuminate\Cache\Events\CacheFlushing`         |
| `Illuminate\Cache\Events\CacheFlushFailed`      |
| `Illuminate\Cache\Events\CacheLocksFlushed`     |
| `Illuminate\Cache\Events\CacheLocksFlushing`    |
| `Illuminate\Cache\Events\CacheLocksFlushFailed` |
| `Illuminate\Cache\Events\CacheHit`              |
| `Illuminate\Cache\Events\CacheMissed`           |
| `Illuminate\Cache\Events\ForgettingKey`         |
| `Illuminate\Cache\Events\KeyForgetFailed`       |
| `Illuminate\Cache\Events\KeyForgotten`          |
| `Illuminate\Cache\Events\KeyWriteFailed`        |
| `Illuminate\Cache\Events\KeyWritten`            |
| `Illuminate\Cache\Events\RetrievingKey`         |
| `Illuminate\Cache\Events\RetrievingManyKeys`    |
| `Illuminate\Cache\Events\WritingKey`            |
| `Illuminate\Cache\Events\WritingManyKeys`       |

</div>

Để cải thiện hiệu năng, bạn có thể tắt cache event bằng cách đặt option cấu hình `events` thành `false` cho cache store tương ứng trong file `config/cache.php`:

```php
'database' => [
    'driver' => 'database',
    // ...
    'events' => false,
],
```
