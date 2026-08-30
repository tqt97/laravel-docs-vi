# Redis

<a name="introduction"></a>
## Giới thiệu
[Redis](https://redis.io) là một key-value store mã nguồn mở với nhiều khả năng nâng cao. Redis thường được gọi là một data structure server vì mỗi key có thể chứa [string](https://redis.io/docs/latest/develop/data-types/strings/), [hash](https://redis.io/docs/latest/develop/data-types/hashes/), [list](https://redis.io/docs/latest/develop/data-types/lists/), [set](https://redis.io/docs/latest/develop/data-types/sets/) và [sorted set](https://redis.io/docs/latest/develop/data-types/sorted-sets/).
Trước khi dùng Redis với Laravel, bạn nên cài extension PHP [PhpRedis](https://github.com/phpredis/phpredis) qua PECL. So với package PHP thuần user-land, extension này phức tạp hơn khi cài đặt nhưng có thể mang lại hiệu năng tốt hơn cho ứng dụng sử dụng Redis nhiều. Nếu dùng [Laravel Sail](/sail), extension này đã được cài sẵn trong Docker container của ứng dụng.
Nếu không thể cài PhpRedis, bạn có thể cài package `predis/predis` bằng Composer. Predis là Redis client được viết hoàn toàn bằng PHP và không yêu cầu extension bổ sung:
```shell
composer require predis/predis
```

<a name="configuration"></a>
## Cấu hình
Bạn có thể cấu hình Redis của ứng dụng trong file `config/database.php`. File này chứa mảng `redis`, mô tả các Redis server mà ứng dụng sử dụng:
```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],

    'default' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
    ],

    'cache' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'username' => env('REDIS_USERNAME'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_CACHE_DB', '1'),
    ],

],
```
Mỗi Redis server trong file cấu hình cần có tên, host và port, trừ khi bạn định nghĩa một URL duy nhất đại diện cho connection Redis:
```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],

    'default' => [
        'url' => 'tcp://127.0.0.1:6379?database=0',
    ],

    'cache' => [
        'url' => 'tls://user:password@127.0.0.1:6380?database=1',
    ],

],
```

<a name="configuring-the-connection-scheme"></a>
#### Cấu hình connection scheme
Mặc định, Redis client dùng scheme `tcp` khi kết nối tới Redis server. Nếu cần mã hóa TLS / SSL, hãy khai báo tùy chọn `scheme` trong mảng cấu hình Redis server:
```php
'default' => [
    'scheme' => 'tls',
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
],
```

<a name="clusters"></a>
### Clusters
Nếu ứng dụng dùng một cụm Redis server, hãy định nghĩa cluster trong key `clusters` của cấu hình Redis. Key này không tồn tại mặc định, vì vậy bạn cần tự thêm nó vào file `config/database.php`:
```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],

    'clusters' => [
        'default' => [
            [
                'url' => env('REDIS_URL'),
                'host' => env('REDIS_HOST', '127.0.0.1'),
                'username' => env('REDIS_USERNAME'),
                'password' => env('REDIS_PASSWORD'),
                'port' => env('REDIS_PORT', '6379'),
                'database' => env('REDIS_DB', '0'),
            ],
        ],
    ],

    // ...
],
```
Mặc định, Laravel dùng Redis clustering native vì giá trị `options.cluster` được đặt thành `redis`. Đây là lựa chọn mặc định phù hợp vì Redis cluster xử lý failover tốt.
Khi dùng Predis, Laravel còn hỗ trợ client-side sharding. Tuy nhiên, client-side sharding không xử lý failover, nên chủ yếu phù hợp với dữ liệu cache tạm thời có thể khôi phục từ một data store chính khác.
Nếu muốn dùng client-side sharding thay cho Redis clustering native, bạn có thể loại bỏ giá trị cấu hình `options.cluster` khỏi `config/database.php`:
```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'clusters' => [
        // ...
    ],

    // ...
],
```

<a name="predis"></a>
### Predis
Nếu muốn ứng dụng tương tác với Redis thông qua package Predis, hãy đảm bảo biến môi trường `REDIS_CLIENT` có giá trị `predis`:
```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'predis'),

    // ...
],
```
Ngoài các tùy chọn mặc định, Predis hỗ trợ thêm nhiều [connection parameter](https://github.com/nrk/predis/wiki/Connection-Parameters) cho từng Redis server. Để sử dụng, hãy thêm các tùy chọn này vào cấu hình server trong `config/database.php`:
```php
'default' => [
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
    'read_write_timeout' => 60,
],
```

<a name="phpredis"></a>
### PhpRedis
Mặc định, Laravel dùng extension PhpRedis để giao tiếp với Redis. Client Laravel sử dụng được quyết định bởi tùy chọn `redis.client`, thường phản ánh giá trị của biến môi trường `REDIS_CLIENT`:
```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    // ...
],
```
Ngoài các tùy chọn mặc định, PhpRedis hỗ trợ các connection parameter: `name`, `persistent`, `persistent_id`, `prefix`, `read_timeout`, `retry_interval`, `max_retries`, `backoff_algorithm`, `backoff_base`, `backoff_cap`, `timeout` và `context`. Bạn có thể thêm các tùy chọn này vào cấu hình Redis server trong `config/database.php`:
```php
'default' => [
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
    'read_timeout' => 60,
    'context' => [
        // 'auth' => ['username', 'secret'],
        // 'stream' => ['verify_peer' => false],
    ],
],
```

<a name="retry-and-backoff-configuration"></a>
#### Cấu hình retry và backoff
Các tùy chọn `retry_interval`, `max_retries`, `backoff_algorithm`, `backoff_base` và `backoff_cap` kiểm soát cách PhpRedis thử kết nối lại tới Redis server. Các thuật toán backoff được hỗ trợ gồm `default`, `decorrelated_jitter`, `equal_jitter`, `exponential`, `uniform` và `constant`:
```php
'default' => [
    'url' => env('REDIS_URL'),
    'host' => env('REDIS_HOST', '127.0.0.1'),
    'username' => env('REDIS_USERNAME'),
    'password' => env('REDIS_PASSWORD'),
    'port' => env('REDIS_PORT', '6379'),
    'database' => env('REDIS_DB', '0'),
    'max_retries' => env('REDIS_MAX_RETRIES', 3),
    'backoff_algorithm' => env('REDIS_BACKOFF_ALGORITHM', 'decorrelated_jitter'),
    'backoff_base' => env('REDIS_BACKOFF_BASE', 100),
    'backoff_cap' => env('REDIS_BACKOFF_CAP', 1000),
],
```
Laravel tự động retry các read command an toàn một lần sau transient connection failure. Bạn có thể dùng tùy chọn `command_retries` để cấu hình số lần retry cho toàn bộ Redis command:
```php
'default' => [
    // ...
    'command_retries' => env('REDIS_COMMAND_RETRIES', 0),
],
```
Predis 3.4.0 trở lên hỗ trợ retry và backoff tích hợp thông qua class `Retry`. Số lần retry được cấu hình bằng `max_retries`, còn chiến lược backoff được cấu hình qua tùy chọn `retry`. Tùy chọn `retry` là một mảng được key bởi một trong các strategy class: `NoBackoff`, `EqualBackoff` hoặc `ExponentialBackoff`:
```php
use Predis\Retry\Strategy\ExponentialBackoff;

'default' => [
    'url' => env('REDIS_URL'),
    // ...
    'retry' => [
        ExponentialBackoff::class => [
            env('REDIS_BACKOFF_BASE', 100),
            env('REDIS_BACKOFF_CAP', 1000),
            true, // Enable jitter...
        ],
    ],
    'max_retries' => env('REDIS_MAX_RETRIES', 3),
],
```
Khi dùng Predis với Redis cluster, bạn có thể khai báo cấu hình retry trong tùy chọn `parameters` của cluster:
```php
use Predis\Retry\Strategy\NoBackoff;

'clusters' => [
    'default' => [
        // ...
    ],
],

'options' => [
    'cluster' => env('REDIS_CLUSTER', 'redis'),
    'parameters' => [
        'retry' => [
            NoBackoff::class => [],
        ],
        'max_retries' => env('REDIS_MAX_RETRIES', 3),
    ],
],
```

<a name="unix-socket-connections"></a>
#### Kết nối qua Unix socket
Redis connection cũng có thể dùng Unix socket thay vì TCP. Nếu Redis chạy cùng máy chủ với ứng dụng, cách này có thể cải thiện hiệu năng nhờ loại bỏ overhead của TCP. Để dùng Unix socket, đặt `REDIS_HOST` thành đường dẫn socket Redis và `REDIS_PORT` thành `0`:
```env
REDIS_HOST=/run/redis/redis.sock
REDIS_PORT=0
```

<a name="phpredis-serialization"></a>
#### Serialization và compression với PhpRedis
Extension PhpRedis có thể được cấu hình để dùng nhiều serializer và thuật toán nén khác nhau. Các tùy chọn này được khai báo trong mảng `options` của cấu hình Redis:
```php
'redis' => [

    'client' => env('REDIS_CLIENT', 'phpredis'),

    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
        'serializer' => Redis::SERIALIZER_MSGPACK,
        'compression' => Redis::COMPRESSION_LZ4,
    ],

    // ...
],
```
Các serializer hiện được hỗ trợ gồm `Redis::SERIALIZER_NONE` (mặc định), `Redis::SERIALIZER_PHP`, `Redis::SERIALIZER_JSON`, `Redis::SERIALIZER_IGBINARY` và `Redis::SERIALIZER_MSGPACK`.
Các thuật toán nén được hỗ trợ gồm `Redis::COMPRESSION_NONE` (mặc định), `Redis::COMPRESSION_LZF`, `Redis::COMPRESSION_ZSTD` và `Redis::COMPRESSION_LZ4`.
<a name="interacting-with-redis"></a>
## Tương tác với Redis
Bạn có thể tương tác với Redis bằng cách gọi các method trên [facade](/facades) `Redis`. Facade này hỗ trợ dynamic method, nghĩa là bạn có thể gọi bất kỳ [Redis command](https://redis.io/commands) nào và command sẽ được chuyển trực tiếp tới Redis. Ví dụ sau gọi Redis command `GET` thông qua method `get` của facade `Redis`:
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redis;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     */
    public function show(string $id): View
    {
        return view('user.profile', [
            'user' => Redis::get('user:profile:'.$id)
        ]);
    }
}
```
Như đã nói ở trên, bạn có thể gọi bất kỳ Redis command nào qua facade `Redis`. Laravel dùng magic method để chuyển command tới Redis server. Nếu command cần đối số, hãy truyền chúng vào method tương ứng của facade:
```php
use Illuminate\Support\Facades\Redis;

Redis::set('name', 'Taylor');

$values = Redis::lrange('names', 5, 10);
```
Ngoài ra, bạn có thể gửi command tới server bằng method `command` của facade `Redis`. Method này nhận tên command làm đối số thứ nhất và một mảng giá trị làm đối số thứ hai:
```php
$values = Redis::command('lrange', ['name', 5, 10]);
```

<a name="using-multiple-redis-connections"></a>
#### Dùng nhiều Redis connection
File `config/database.php` cho phép định nghĩa nhiều Redis connection / server. Để lấy một connection cụ thể, hãy dùng method `connection` của facade `Redis`:
```php
$redis = Redis::connection('connection-name');
```
Để lấy instance của Redis connection mặc định, gọi `connection` mà không truyền thêm đối số:
```php
$redis = Redis::connection();
```

<a name="transactions"></a>
### Transactions
Method `transaction` của facade `Redis` là wrapper thuận tiện quanh các command native `MULTI` và `EXEC` của Redis. Method này nhận một closure duy nhất; closure nhận instance Redis connection và có thể gửi các command cần thiết. Toàn bộ command được phát hành trong closure sẽ chạy trong một transaction atomic duy nhất:
```php
use Redis;
use Illuminate\Support\Facades;

Facades\Redis::transaction(function (Redis $redis) {
    $redis->incr('user_visits', 1);
    $redis->incr('total_visits', 1);
});
```
> [!WARNING]
> Khi định nghĩa Redis transaction, bạn không thể đọc giá trị từ Redis connection trong lúc xây dựng transaction. Transaction được thực thi như một thao tác atomic duy nhất và chỉ thực sự chạy sau khi closure đã hoàn tất việc khai báo toàn bộ command.
#### Lua scripts
Method `eval` là một cách khác để thực thi nhiều Redis command trong một thao tác atomic duy nhất. Điểm mạnh của `eval` là script có thể tương tác và kiểm tra giá trị Redis key ngay trong thao tác đó. Redis script được viết bằng [ngôn ngữ Lua](https://www.lua.org).
Thoạt đầu `eval` có thể hơi khó tiếp cận, nhưng ví dụ cơ bản sau sẽ giúp bạn hình dung. Method này nhận nhiều đối số: trước hết là Lua script dưới dạng string; tiếp theo là số lượng key mà script thao tác; sau đó là tên các key; cuối cùng là những đối số bổ sung mà script cần truy cập.
Trong ví dụ này, ta tăng một counter, kiểm tra giá trị mới, rồi tăng counter thứ hai nếu counter đầu tiên lớn hơn năm. Cuối cùng, script trả về giá trị của counter thứ nhất:
```php
$value = Redis::eval(<<<'LUA'
    local counter = redis.call("incr", KEYS[1])

    if counter > 5 then
        redis.call("incr", KEYS[2])
    end

    return counter
LUA, 2, 'first-counter', 'second-counter');
```
> [!WARNING]
> Hãy tham khảo [tài liệu Redis](https://redis.io/commands/eval) để biết thêm chi tiết về Redis scripting.
<a name="pipelining-commands"></a>
### Pipeline command
Đôi khi bạn cần thực thi hàng chục Redis command. Thay vì tạo một network round-trip cho từng command, có thể dùng method `pipeline`. Method này nhận một closure chứa instance Redis; mọi command gửi tới instance đó sẽ được gửi tới Redis server cùng lúc để giảm số lần truyền qua mạng. Các command vẫn được thực thi theo thứ tự đã khai báo:
```php
use Redis;
use Illuminate\Support\Facades;

Facades\Redis::pipeline(function (Redis $pipe) {
    for ($i = 0; $i < 1000; $i++) {
        $pipe->set("key:$i", $i);
    }
});
```

<a name="pubsub"></a>
## Pub / Sub
Laravel cung cấp interface thuận tiện cho các Redis command `publish` và `subscribe`. Những command này cho phép lắng nghe thông điệp trên một "channel". Bạn có thể publish message từ ứng dụng khác, thậm chí từ ngôn ngữ lập trình khác, nhờ đó các ứng dụng và process có thể giao tiếp với nhau dễ dàng.
Trước tiên, hãy thiết lập listener cho channel bằng method `subscribe`. Ta đặt lệnh này bên trong một [Artisan command](/artisan), vì gọi `subscribe` sẽ khởi động một process chạy lâu dài:
```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class RedisSubscribe extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'redis:subscribe';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Subscribe to a Redis channel';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        Redis::subscribe(['test-channel'], function (string $message) {
            echo $message;
        });
    }
}
```
Bây giờ có thể publish message lên channel bằng method `publish`:
```php
use Illuminate\Support\Facades\Redis;

Route::get('/publish', function () {
    // ...

    Redis::publish('test-channel', json_encode([
        'name' => 'Adam Wathan'
    ]));
});
```

<a name="wildcard-subscriptions"></a>
#### Wildcard subscription
Với method `psubscribe`, bạn có thể subscribe theo wildcard channel, hữu ích khi muốn bắt message trên nhiều channel cùng một pattern. Tên channel sẽ được truyền làm đối số thứ hai vào closure:
```php
Redis::psubscribe(['*'], function (string $message, string $channel) {
    echo $message;
});

Redis::psubscribe(['users.*'], function (string $message, string $channel) {
    echo $message;
});
```
