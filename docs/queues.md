# Hàng đợi

<a name="introduction"></a>
## Giới thiệu

Khi xây dựng ứng dụng web, bạn có thể có những tác vụ, chẳng hạn như phân tích và lưu một file CSV được tải lên, mất quá nhiều thời gian để thực hiện trong một web request thông thường. Laravel cho phép bạn dễ dàng tạo các job đưa vào queue để xử lý ở background. Bằng cách chuyển các tác vụ tốn thời gian sang queue, ứng dụng có thể phản hồi web request nhanh hơn và mang lại trải nghiệm tốt hơn cho người dùng.

Queue của Laravel cung cấp một API thống nhất cho nhiều queue backend khác nhau, chẳng hạn như [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), hoặc thậm chí cơ sở dữ liệu quan hệ.

Các tùy chọn cấu hình queue của Laravel được lưu trong file `config/queue.php` của ứng dụng. Trong file này, bạn sẽ thấy cấu hình connection cho từng queue driver đi kèm framework, bao gồm database, [Amazon SQS](https://aws.amazon.com/sqs/), [Redis](https://redis.io), [Beanstalkd](https://beanstalkd.github.io/), cùng một synchronous driver thực thi job ngay lập tức (dùng trong quá trình phát triển hoặc kiểm thử). Laravel cũng cung cấp queue driver `null`, driver này sẽ loại bỏ các job được đưa vào queue.

> [!NOTE]
> Laravel Horizon là dashboard và hệ thống cấu hình dành cho queue sử dụng Redis. Xem đầy đủ [tài liệu Horizon](/horizon) để biết thêm thông tin.

<a name="connections-vs-queues"></a>
### Connection và queue

Trước khi bắt đầu với queue của Laravel, điều quan trọng là phải hiểu sự khác nhau giữa "connection" và "queue". Trong file cấu hình `config/queue.php` có mảng cấu hình `connections`. Tùy chọn này định nghĩa các connection đến dịch vụ queue backend như Amazon SQS, Beanstalk hoặc Redis. Tuy nhiên, mỗi queue connection có thể chứa nhiều "queue", có thể hiểu là các ngăn hoặc nhóm job khác nhau đang chờ xử lý.

Lưu ý rằng mỗi cấu hình connection mẫu trong file cấu hình `queue` đều có thuộc tính `queue`. Đây là queue mặc định mà job sẽ được dispatch đến khi được gửi qua connection tương ứng. Nói cách khác, nếu bạn dispatch một job mà không chỉ định rõ queue đích, job sẽ được đưa vào queue được định nghĩa bởi thuộc tính `queue` của cấu hình connection:

```php
use App\Jobs\ProcessPodcast;

// This job is sent to the default connection's default queue...
ProcessPodcast::dispatch();

// This job is sent to the default connection's "emails" queue...
ProcessPodcast::dispatch()->onQueue('emails');
```

Một số ứng dụng chỉ cần một queue đơn giản và không cần đưa job vào nhiều queue khác nhau. Tuy nhiên, sử dụng nhiều queue đặc biệt hữu ích khi ứng dụng cần ưu tiên hoặc phân nhóm cách xử lý job, vì queue worker của Laravel cho phép chỉ định thứ tự ưu tiên của các queue cần xử lý. Ví dụ, nếu đưa job vào queue `high`, bạn có thể chạy worker để ưu tiên xử lý queue này trước:

```shell
php artisan queue:work --queue=high,default
```

<a name="driver-prerequisites"></a>
### Lưu ý và điều kiện tiên quyết của driver

<a name="database"></a>
#### Cơ sở dữ liệu

Để sử dụng queue driver `database`, bạn cần một bảng cơ sở dữ liệu để lưu các job. Thông thường bảng này được tạo bởi [database migration](/migrations) mặc định `0001_01_01_000002_create_jobs_table.php` của Laravel; tuy nhiên, nếu ứng dụng không có migration này, bạn có thể dùng lệnh Artisan `make:queue-table` để tạo:

```shell
php artisan make:queue-table

php artisan migrate
```

<a name="redis"></a>
#### Redis

Để sử dụng queue driver `redis`, bạn cần cấu hình một Redis database connection trong file `config/database.php`.

> [!WARNING]
> Các tùy chọn Redis `serializer` và `compression` không được queue driver `redis` hỗ trợ.

<a name="redis-cluster"></a>
##### Redis Cluster

Nếu Redis queue connection sử dụng [Redis Cluster](https://redis.io/docs/latest/operate/rs/databases/durability-ha/clustering), tên queue phải chứa [key hash tag](https://redis.io/docs/latest/develop/using-commands/keyspace/#hashtags). Điều này bảo đảm mọi Redis key của cùng một queue được đặt trong cùng hash slot:

```php
'redis' => [
    'driver' => 'redis',
    'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
    'queue' => env('REDIS_QUEUE', '{default}'),
    'retry_after' => env('REDIS_QUEUE_RETRY_AFTER', 90),
    'block_for' => null,
    'after_commit' => false,
],
```

<a name="blocking"></a>
##### Blocking

Khi sử dụng Redis queue, bạn có thể dùng tùy chọn cấu hình `block_for` để chỉ định khoảng thời gian driver chờ một job xuất hiện trước khi tiếp tục vòng lặp worker và truy vấn lại Redis.

Điều chỉnh giá trị này theo tải của queue có thể hiệu quả hơn việc liên tục polling Redis để tìm job mới. Ví dụ, bạn có thể đặt giá trị thành `5` để driver block trong năm giây khi chờ job xuất hiện:

```php
'redis' => [
    'driver' => 'redis',
    'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
    'queue' => env('REDIS_QUEUE', 'default'),
    'retry_after' => env('REDIS_QUEUE_RETRY_AFTER', 90),
    'block_for' => 5,
    'after_commit' => false,
],
```

> [!WARNING]
> Đặt `block_for` thành `0` sẽ khiến queue worker block vô thời hạn cho đến khi có job. Điều này cũng khiến các signal như `SIGTERM` chưa được xử lý cho đến khi job tiếp theo được xử lý xong.

<a name="sqs-overflow-storage"></a>
#### Lưu trữ payload SQS vượt giới hạn

Amazon SQS giới hạn kích thước tối đa của payload message trong queue. Nếu cần dispatch các job có payload có thể vượt giới hạn này, bạn có thể cấu hình Laravel lưu payload SQS quá lớn trong cache store và chỉ gửi một con trỏ qua SQS. Để bật tính năng này, thêm mảng `overflow` vào cấu hình SQS queue connection:

```php
'sqs' => [
    'driver' => 'sqs',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'prefix' => env('SQS_PREFIX', 'https://sqs.us-east-1.amazonaws.com/your-account-id'),
    'queue' => env('SQS_QUEUE', 'default'),
    'suffix' => env('SQS_SUFFIX'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'after_commit' => false,
    'overflow' => [
        'enabled' => env('SQS_OVERFLOW_ENABLED', false),
        'store' => env('SQS_OVERFLOW_STORE'),
        'always' => false,
        'delete_after_processing' => true,
        'flush_on_clear' => env('SQS_OVERFLOW_FLUSH_ON_CLEAR', false),
    ],
],
```

Khi overflow storage được bật, Laravel sẽ lưu các payload có kích thước từ 1 MB trở lên vào cache store đã cấu hình. Nếu tùy chọn `always` là `true`, mọi payload SQS đều được lưu vào cache store bất kể kích thước. Vì job trong queue cần lấy lại payload từ cache store khi được xử lý, bạn nên chọn store có khả năng giữ payload cho đến khi worker xử lý chúng. Mặc định, payload đã lưu sẽ bị xóa sau khi job được xử lý thành công và bị xóa khỏi SQS.

Nếu tùy chọn `flush_on_clear` là `true`, overflow cache store đã cấu hình sẽ bị flush khi lệnh `queue:clear` xóa SQS queue. Vì việc flush cache store có thể xóa toàn bộ item trong store đó, bạn nên dùng một cache store riêng cho SQS overflow storage khi bật tùy chọn này.

<a name="other-driver-prerequisites"></a>
#### Điều kiện tiên quyết của các driver khác

Các dependency sau là bắt buộc đối với những queue driver tương ứng. Bạn có thể cài đặt chúng bằng Composer:

<div class="content-list" markdown="1">

- Amazon SQS: `aws/aws-sdk-php ~3.0`
- Beanstalkd: `pda/pheanstalk ~5.0`
- Redis: `predis/predis ~3.0` or phpredis PHP extension
- [MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/queues/): `mongodb/laravel-mongodb`

</div>

<a name="creating-jobs"></a>
## Tạo job

<a name="generating-job-classes"></a>
### Tạo class job

Mặc định, tất cả job có thể đưa vào queue của ứng dụng được lưu trong thư mục `app/Jobs`. Nếu thư mục `app/Jobs` chưa tồn tại, Laravel sẽ tạo thư mục này khi bạn chạy lệnh Artisan `make:job`:

```shell
php artisan make:job ProcessPodcast
```

Class được tạo sẽ implement interface `Illuminate\Contracts\Queue\ShouldQueue`, qua đó cho Laravel biết job cần được đưa vào queue để chạy bất đồng bộ.

> [!NOTE]
> Có thể tùy chỉnh stub của job bằng [stub publishing](/artisan#stub-customization).

<a name="class-structure"></a>
### Cấu trúc class

Class job rất đơn giản, thông thường chỉ chứa phương thức `handle`, được gọi khi queue xử lý job. Hãy bắt đầu với một class job mẫu. Trong ví dụ này, giả sử chúng ta quản lý một dịch vụ xuất bản podcast và cần xử lý các file podcast được tải lên trước khi xuất bản:

```php
<?php

namespace App\Jobs;

use App\Models\Podcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AudioProcessor $processor): void
    {
        // Process uploaded podcast...
    }
}
```

Trong ví dụ này, chúng ta có thể truyền trực tiếp một [Eloquent model](/eloquent) vào constructor của job. Nhờ trait `Queueable` mà job sử dụng, Eloquent model và các relationship đã load sẽ được serialize và unserialize phù hợp khi job được xử lý.

Nếu constructor của job nhận một Eloquent model, chỉ identifier của model được serialize vào queue. Khi job thực sự được xử lý, hệ thống queue sẽ tự động lấy lại đầy đủ model instance cùng các relationship đã load từ cơ sở dữ liệu. Cách serialize model này giúp payload job gửi đến queue driver nhỏ hơn đáng kể.

<a name="handle-method-dependency-injection"></a>
#### Dependency injection cho phương thức `handle`

Phương thức `handle` được gọi khi job được queue xử lý. Bạn có thể type-hint các dependency trên phương thức `handle` của job. [Service container](/container) của Laravel sẽ tự động inject các dependency này.

Nếu muốn kiểm soát hoàn toàn cách container inject dependency vào phương thức `handle`, bạn có thể dùng phương thức `bindMethod` của container. `bindMethod` nhận một callback với job và container. Bên trong callback, bạn có thể gọi phương thức `handle` theo cách mong muốn. Thông thường, nên gọi phương thức này từ `boot` của [service provider](/providers) `App\Providers\AppServiceProvider`:

```php
use App\Jobs\ProcessPodcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Foundation\Application;

$this->app->bindMethod([ProcessPodcast::class, 'handle'], function (ProcessPodcast $job, Application $app) {
    return $job->handle($app->make(AudioProcessor::class));
});
```

> [!WARNING]
> Dữ liệu binary, chẳng hạn nội dung ảnh thô, nên được truyền qua hàm `base64_encode` trước khi đưa vào queued job. Nếu không, job có thể không được serialize sang JSON đúng cách khi đưa vào queue.

<a name="handling-relationships"></a>
#### Relationship trong job được đưa vào queue

Vì tất cả relationship đã load của Eloquent model cũng được serialize khi job được đưa vào queue, chuỗi job sau serialize đôi khi có thể rất lớn. Ngoài ra, khi job được deserialize và relationship của model được lấy lại từ cơ sở dữ liệu, chúng sẽ được lấy toàn bộ. Các constraint đã áp dụng cho relationship trước khi model được serialize sẽ không được áp dụng lại khi job được deserialize. Vì vậy, nếu chỉ muốn làm việc với một tập con của relationship, bạn nên áp dụng lại constraint cho relationship đó bên trong queued job.

Hoặc, để ngăn relationship bị serialize, bạn có thể gọi phương thức `withoutRelations` trên model khi gán giá trị property. Phương thức này trả về một model instance không chứa các relationship đã load:

```php
/**
 * Create a new job instance.
 */
public function __construct(
    Podcast $podcast,
) {
    $this->podcast = $podcast->withoutRelations();
}
```

Nếu chỉ cần loại bỏ một số relationship cụ thể và giữ lại các relationship khác, bạn có thể dùng phương thức `withoutRelation`:

```php
$this->podcast = $podcast->withoutRelation('comments');
```

Nếu đang sử dụng [PHP constructor property promotion](https://www.php.net/manual/en/language.oop5.decon.php#language.oop5.decon.constructor.promotion) và muốn chỉ định rằng relationship của Eloquent model không được serialize, bạn có thể dùng attribute `WithoutRelations`:

```php
use Illuminate\Queue\Attributes\WithoutRelations;

/**
 * Create a new job instance.
 */
public function __construct(
    #[WithoutRelations]
    public Podcast $podcast,
) {}
```

Để thuận tiện, nếu muốn serialize tất cả model mà không kèm relationship, bạn có thể áp dụng attribute `WithoutRelations` cho toàn bộ class thay vì từng model:

```php
<?php

namespace App\Jobs;

use App\Models\DistributionPlatform;
use App\Models\Podcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\WithoutRelations;

#[WithoutRelations]
class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Podcast $podcast,
        public DistributionPlatform $platform,
    ) {}
}
```

Nếu job nhận một collection hoặc array các Eloquent model thay vì một model duy nhất, relationship của các model trong collection sẽ không được khôi phục khi job được deserialize và thực thi. Điều này giúp tránh sử dụng tài nguyên quá mức đối với các job xử lý số lượng model lớn.

<a name="unique-jobs"></a>
### Job duy nhất

> [!WARNING]
> Job duy nhất yêu cầu cache driver hỗ trợ [lock](/cache#atomic-locks). Hiện tại các cache driver `memcached`, `redis`, `dynamodb`, `database`, `file` và `array` hỗ trợ atomic lock.

> [!WARNING]
> Constraint của job duy nhất không áp dụng cho các job nằm trong batch.

Đôi khi, bạn muốn bảo đảm tại mọi thời điểm chỉ có một instance của một job cụ thể nằm trong queue. Bạn có thể làm điều này bằng cách implement interface `ShouldBeUnique` trên class job. Interface này không yêu cầu định nghĩa thêm phương thức nào:

```php
<?php

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    // ...
}
```

Trong ví dụ trên, job `UpdateSearchIndex` là duy nhất. Vì vậy, job sẽ không được dispatch nếu một instance khác của job đã nằm trong queue và chưa xử lý xong.

Trong một số trường hợp, bạn có thể muốn định nghĩa một "key" cụ thể để xác định tính duy nhất của job hoặc chỉ định khoảng thời gian mà sau đó job không còn được giữ ở trạng thái duy nhất. Để thực hiện, hãy dùng attribute `UniqueFor` và định nghĩa phương thức `uniqueId` trên class job:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Queue\Attributes\UniqueFor;

#[UniqueFor(3600)]
class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    /**
     * The product instance.
     *
     * @var \App\Models\Product
     */
    public $product;

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return $this->product->id;
    }
}
```
Trong ví dụ trên, job `UpdateSearchIndex` được xác định duy nhất theo product ID. Vì vậy, mọi lần dispatch mới với cùng product ID sẽ bị bỏ qua cho đến khi job hiện tại xử lý xong. Ngoài ra, nếu job hiện tại không được xử lý trong vòng một giờ, unique lock sẽ được giải phóng và một job khác có cùng unique key có thể được dispatch vào queue.

> [!WARNING]
> Nếu ứng dụng dispatch job từ nhiều web server hoặc container, hãy bảo đảm tất cả server đều giao tiếp với cùng một cache server trung tâm để Laravel có thể xác định chính xác job có duy nhất hay không.

<a name="keeping-jobs-unique-until-processing-begins"></a>
#### Giữ job ở trạng thái duy nhất cho đến khi bắt đầu xử lý

Mặc định, job duy nhất được "unlock" sau khi xử lý hoàn tất hoặc thất bại sau tất cả lần retry. Tuy nhiên, có những trường hợp bạn muốn job được unlock ngay trước khi bắt đầu xử lý. Khi đó, job nên implement contract `ShouldBeUniqueUntilProcessing` thay cho `ShouldBeUnique`:

```php
<?php

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUniqueUntilProcessing
{
    // ...
}
```

<a name="unique-job-locks"></a>
#### Lock cho job duy nhất

Bên trong, khi một job `ShouldBeUnique` được dispatch, Laravel cố gắng lấy [lock](/cache#atomic-locks) bằng key `uniqueId`. Nếu lock đã được giữ, job sẽ không được dispatch. Lock được giải phóng khi job xử lý xong hoặc thất bại sau tất cả lần retry. Mặc định, Laravel sử dụng cache driver mặc định để lấy lock. Nếu muốn dùng driver khác, bạn có thể định nghĩa phương thức `uniqueVia` trả về cache driver cần sử dụng:

```php
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

class UpdateSearchIndex implements ShouldQueue, ShouldBeUnique
{
    // ...

    /**
     * Get the cache driver for the unique job lock.
     */
    public function uniqueVia(): Repository
    {
        return Cache::driver('redis');
    }
}
```

> [!NOTE]
> Nếu chỉ cần giới hạn việc xử lý đồng thời một job, hãy dùng job middleware [WithoutOverlapping](/queues#preventing-job-overlaps).

<a name="debounced-jobs"></a>
### Job debounce

Đôi khi, bạn muốn bảo đảm rằng khi cùng một job được dispatch nhiều lần trong khoảng thời gian ngắn, chỉ lần dispatch mới nhất thực sự được thực thi. Bạn có thể làm điều này bằng cách thêm attribute `DebounceFor` vào job:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\DebounceFor;

#[DebounceFor(30)]
class UpdateSearchIndex implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public int $productId)
    {
    }

    /**
     * Get the debounce ID for the job.
     */
    public function debounceId(): string
    {
        return (string) $this->productId;
    }
}
```

Trong ví dụ trên, việc liên tục dispatch `UpdateSearchIndex` cho cùng một sản phẩm trong vòng `30` giây sẽ debounce job để chỉ lần dispatch mới nhất được chạy.

Nếu muốn giới hạn khoảng thời gian tối đa mà một job thường xuyên được dispatch lại có thể bị trì hoãn, bạn có thể truyền đối số `maxWait` cho attribute `DebounceFor`:

```php
#[DebounceFor(30, maxWait: 120)]
class UpdateSearchIndex implements ShouldQueue
{
    use Queueable;

    // ...
}
```

Bạn có thể tùy chỉnh cache store dùng để theo dõi debounce bằng cách định nghĩa phương thức `debounceVia` trên job:

```php
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

public function debounceVia(): Repository
{
    return Cache::driver('redis');
}
```

Nếu một debounced job bị thay thế bởi lần dispatch mới hơn, Laravel sẽ dispatch event `Illuminate\Queue\Events\JobDebounced` và xóa job bị thay thế khỏi queue.

> [!WARNING]
> Debounced job và unique job loại trừ lẫn nhau. Job sử dụng attribute `DebounceFor` không nên implement `ShouldBeUnique`.

> [!WARNING]
> Nếu ứng dụng dispatch debounced job từ nhiều web server hoặc container, hãy bảo đảm tất cả server đều giao tiếp với cùng một cache server trung tâm.

<a name="encrypted-jobs"></a>
### Job được mã hóa

Laravel cho phép bạn bảo đảm tính riêng tư và toàn vẹn của dữ liệu job thông qua [mã hóa](/encryption). Để bắt đầu, chỉ cần thêm interface `ShouldBeEncrypted` vào lớp job. Sau khi interface này được thêm vào lớp, Laravel sẽ tự động mã hóa job trước khi đẩy nó vào queue:

```php
<?php

use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;

class UpdateSearchIndex implements ShouldQueue, ShouldBeEncrypted
{
    // ...
}
```

<a name="job-middleware"></a>
## Middleware cho job

Middleware cho job cho phép bạn bao bọc logic tùy chỉnh quanh quá trình thực thi queued job, nhờ đó giảm mã lặp ngay trong các job. Ví dụ, hãy xem phương thức `handle` sau, sử dụng tính năng rate limiting với Redis của Laravel để chỉ cho phép xử lý một job mỗi năm giây:

```php
use Illuminate\Support\Facades\Redis;

/**
 * Execute the job.
 */
public function handle(): void
{
    Redis::throttle('key')->block(0)->allow(1)->every(5)->then(function () {
        info('Lock obtained...');

        // Handle job...
    }, function () {
        // Could not obtain lock...

        return $this->release(5);
    });
}
```

Mặc dù đoạn mã này hợp lệ, phần triển khai của phương thức `handle` trở nên rối vì bị lẫn với logic rate limiting của Redis. Ngoài ra, logic rate limiting này phải được lặp lại cho mọi job khác mà chúng ta muốn giới hạn tốc độ. Thay vì thực hiện rate limiting trong phương thức `handle`, chúng ta có thể định nghĩa một middleware cho job để đảm nhiệm việc này:

```php
<?php

namespace App\Jobs\Middleware;

use Closure;
use Illuminate\Support\Facades\Redis;

class RateLimited
{
    /**
     * Process the queued job.
     *
     * @param  \Closure(object): void  $next
     */
    public function handle(object $job, Closure $next): void
    {
        Redis::throttle('key')
            ->block(0)->allow(1)->every(5)
            ->then(function () use ($job, $next) {
                // Lock obtained...

                $next($job);
            }, function () use ($job) {
                // Could not obtain lock...

                $job->release(5);
            });
    }
}
```

Như bạn có thể thấy, tương tự [route middleware](/middleware), middleware cho job nhận job đang được xử lý và một callback cần được gọi để tiếp tục xử lý job.

Bạn có thể tạo một lớp middleware mới cho job bằng lệnh Artisan `make:job-middleware`. Sau khi tạo middleware, bạn có thể gắn nó vào job bằng cách trả về middleware từ phương thức `middleware` của job. Phương thức này không có sẵn trong các job được scaffold bởi lệnh Artisan `make:job`, vì vậy bạn cần tự thêm nó vào lớp job:

```php
use App\Jobs\Middleware\RateLimited;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited];
}
```

> [!NOTE]
> Middleware cho job cũng có thể được gán cho [event listener có thể đưa vào queue](/events#queued-event-listeners), [mailable](/mail#queueing-mail) và [notification](/notifications#queueing-notifications).

<a name="rate-limiting"></a>
### Giới hạn tốc độ

Mặc dù chúng ta vừa minh họa cách tự viết middleware rate limiting cho job, Laravel thực tế đã cung cấp middleware rate limiting mà bạn có thể dùng để giới hạn tốc độ job. Tương tự [route rate limiter](/routing#defining-rate-limiters), rate limiter cho job được định nghĩa bằng phương thức `for` của facade `RateLimiter`.

Ví dụ, bạn có thể muốn cho phép người dùng sao lưu dữ liệu một lần mỗi giờ nhưng không áp dụng giới hạn này cho khách hàng premium. Để thực hiện, bạn có thể định nghĩa một `RateLimiter` trong phương thức `boot` của `AppServiceProvider`:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    RateLimiter::for('backups', function (object $job) {
        return $job->user->vipCustomer()
            ? Limit::none()
            : Limit::perHour(1)->by($job->user->id);
    });
}
```

Trong ví dụ trên, chúng ta định nghĩa giới hạn theo giờ; tuy nhiên, bạn có thể dễ dàng định nghĩa giới hạn theo phút bằng phương thức `perMinute`. Ngoài ra, bạn có thể truyền bất kỳ giá trị nào vào phương thức `by` của rate limit; tuy nhiên, giá trị này thường được dùng để phân tách giới hạn theo từng khách hàng:

```php
return Limit::perMinute(50)->by($job->user->id);
```

Sau khi định nghĩa rate limit, bạn có thể gắn rate limiter vào job bằng middleware `Illuminate\Queue\Middleware\RateLimited`. Mỗi khi job vượt quá rate limit, middleware này sẽ đưa job trở lại queue với khoảng trì hoãn phù hợp dựa trên thời lượng của rate limit:

```php
use Illuminate\Queue\Middleware\RateLimited;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new RateLimited('backups')];
}
```

Việc đưa một job bị rate limit trở lại queue vẫn làm tăng tổng số `attempts` của job. Vì vậy, bạn có thể cần điều chỉnh các attribute `Tries` và `MaxExceptions` trên lớp job cho phù hợp. Hoặc bạn có thể dùng [phương thức retryUntil](#time-based-attempts) để xác định thời điểm mà job không nên được thử lại nữa.

Bằng phương thức `releaseAfter`, bạn cũng có thể chỉ định số giây phải trôi qua trước khi job đã được release được thử lại:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new RateLimited('backups'))->releaseAfter(60)];
}
```

Nếu không muốn job được thử lại khi bị rate limit, bạn có thể dùng phương thức `dontRelease`:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new RateLimited('backups'))->dontRelease()];
}
```

<a name="rate-limiting-with-redis"></a>
#### Giới hạn tốc độ With Redis

Nếu đang sử dụng Redis, bạn có thể dùng middleware `Illuminate\Queue\Middleware\RateLimitedWithRedis`, được tối ưu riêng cho Redis và hiệu quả hơn middleware rate limiting cơ bản:

```php
use Illuminate\Queue\Middleware\RateLimitedWithRedis;

public function middleware(): array
{
    return [new RateLimitedWithRedis('backups')];
}
```

Phương thức `connection` có thể được dùng để chỉ định Redis connection mà middleware sẽ sử dụng:

```php
return [(new RateLimitedWithRedis('backups'))->connection('limiter')];
```

<a name="preventing-job-overlaps"></a>
### Ngăn các job chạy chồng lấn

Laravel cung cấp middleware `Illuminate\Queue\Middleware\WithoutOverlapping`, cho phép bạn ngăn các job chạy chồng lấn dựa trên một key tùy ý. Điều này hữu ích khi một queued job đang thay đổi một tài nguyên mà tại mỗi thời điểm chỉ nên được một job chỉnh sửa.

Ví dụ, giả sử bạn có một queued job cập nhật điểm tín dụng của người dùng và muốn ngăn các job cập nhật điểm tín dụng chạy chồng lấn đối với cùng một user ID. Để thực hiện, bạn có thể trả về middleware `WithoutOverlapping` từ phương thức `middleware` của job:

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new WithoutOverlapping($this->user->id)];
}
```

Việc đưa một job đang bị chồng lấn trở lại queue vẫn làm tăng tổng số lần thử của job. Vì vậy, bạn có thể cần điều chỉnh các attribute `Tries` và `MaxExceptions` trên lớp job cho phù hợp. Ví dụ, nếu giữ `Tries` bằng 1 như mặc định, mọi job bị chồng lấn sẽ không được thử lại sau đó.

Mọi job cùng loại bị chồng lấn sẽ được đưa trở lại queue. Bạn cũng có thể chỉ định số giây phải trôi qua trước khi job đã được release được thử lại:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->releaseAfter(60)];
}
```

Nếu muốn xóa ngay các job bị chồng lấn để chúng không được thử lại, bạn có thể dùng phương thức `dontRelease`:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->dontRelease()];
}
```

Middleware `WithoutOverlapping` được xây dựng trên tính năng atomic lock của Laravel. Đôi khi job có thể thất bại hoặc timeout ngoài dự kiến khiến lock không được giải phóng. Vì vậy, bạn có thể định nghĩa rõ thời gian hết hạn của lock bằng phương thức `expireAfter`. Ví dụ dưới đây yêu cầu Laravel giải phóng lock `WithoutOverlapping` sau ba phút kể từ khi job bắt đầu được xử lý:

```php
/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new WithoutOverlapping($this->order->id))->expireAfter(180)];
}
```

> [!WARNING]
> Middleware `WithoutOverlapping` yêu cầu cache driver hỗ trợ [lock](/cache#atomic-locks). Hiện tại, các cache driver `memcached`, `redis`, `dynamodb`, `database`, `file` và `array` hỗ trợ atomic lock.

<a name="sharing-lock-keys"></a>
#### Chia sẻ lock key giữa các lớp job

Theo mặc định, middleware `WithoutOverlapping` chỉ ngăn các job cùng lớp chạy chồng lấn. Vì vậy, dù hai lớp job khác nhau có thể sử dụng cùng một lock key, chúng vẫn không bị ngăn chạy chồng lấn. Tuy nhiên, bạn có thể yêu cầu Laravel áp dụng key trên nhiều lớp job bằng phương thức `shared`:

```php
use Illuminate\Queue\Middleware\WithoutOverlapping;

class ProviderIsDown
{
    // ...

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}

class ProviderIsUp
{
    // ...

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("status:{$this->provider}"))->shared(),
        ];
    }
}
```

<a name="throttling-exceptions"></a>
### Giới hạn ngoại lệ

Laravel cung cấp middleware `Illuminate\Queue\Middleware\ThrottlesExceptions`, cho phép bạn giới hạn ngoại lệ. Khi job đã ném ra một số lượng ngoại lệ nhất định, mọi lần thử thực thi tiếp theo sẽ bị trì hoãn cho đến khi một khoảng thời gian xác định trôi qua. Middleware này đặc biệt hữu ích với các job tương tác với dịch vụ bên thứ ba không ổn định.

Ví dụ, giả sử một queued job tương tác với API bên thứ ba bắt đầu ném ngoại lệ. Để giới hạn ngoại lệ, bạn có thể trả về middleware `ThrottlesExceptions` từ phương thức `middleware` của job. Thông thường, middleware này nên được kết hợp với một job triển khai [số lần thử dựa trên thời gian](#time-based-attempts):

```php
use DateTime;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [new ThrottlesExceptions(10, 5 * 60)];
}

/**
 * Determine the time at which the job should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->plus(minutes: 30);
}
```

Đối số constructor đầu tiên của middleware là số ngoại lệ mà job có thể ném ra trước khi bị throttle, còn đối số thứ hai là số giây phải trôi qua trước khi job được thử lại sau khi bị throttle. Trong ví dụ trên, nếu job ném ra 10 ngoại lệ liên tiếp, chúng ta sẽ chờ 5 phút trước khi thử lại job, trong giới hạn thời gian 30 phút.

Khi job ném ngoại lệ nhưng chưa đạt ngưỡng ngoại lệ, job thường sẽ được thử lại ngay. Tuy nhiên, bạn có thể chỉ định số phút cần trì hoãn job bằng cách gọi phương thức `backoff` khi gắn middleware vào job:

```php
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 5 * 60))->backoff(5)];
}
```

Phương thức `backoff` cũng chấp nhận một closure nhận ngoại lệ đã được ném ra, cho phép xác định khoảng trì hoãn một cách động:

```php
use App\Exceptions\RateLimitedException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;
use Throwable;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 5 * 60))->backoff(
        fn (Throwable $throwable) => $throwable instanceof RateLimitedException
            ? $throwable->retryAfterMinutes()
            : 5
    )];
}
```

Bên trong, middleware này sử dụng hệ thống cache của Laravel để triển khai rate limiting và tên lớp của job được dùng làm cache "key". Bạn có thể ghi đè key này bằng cách gọi phương thức `by` khi gắn middleware vào job. Điều này hữu ích nếu có nhiều job tương tác với cùng một dịch vụ bên thứ ba và bạn muốn chúng dùng chung một "bucket" throttling để bảo đảm tuân theo cùng một giới hạn:

```php
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->by('key')];
}
```

Theo mặc định, middleware này sẽ throttle mọi ngoại lệ. Bạn có thể thay đổi hành vi này bằng cách gọi phương thức `when` khi gắn middleware vào job. Khi đó, ngoại lệ chỉ bị throttle nếu closure truyền cho phương thức `when` trả về `true`:

```php
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->when(
        fn (Throwable $throwable) => $throwable instanceof HttpClientException
    )];
}
```

Khác với phương thức `when`, vốn đưa job trở lại queue hoặc ném ngoại lệ, phương thức `deleteWhen` cho phép bạn xóa hoàn toàn job khi một ngoại lệ nhất định xảy ra:

```php
use App\Exceptions\CustomerDeletedException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(2, 10 * 60))->deleteWhen(CustomerDeletedException::class)];
}
```

Nếu muốn các ngoại lệ bị throttle được báo cáo tới exception handler của ứng dụng, bạn có thể gọi phương thức `report` khi gắn middleware vào job. Tùy chọn, bạn có thể truyền một closure cho phương thức `report`; ngoại lệ khi đó chỉ được báo cáo nếu closure trả về `true`:

```php
use Illuminate\Http\Client\HttpClientException;
use Illuminate\Queue\Middleware\ThrottlesExceptions;

/**
 * Get the middleware the job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(): array
{
    return [(new ThrottlesExceptions(10, 10 * 60))->report(
        fn (Throwable $throwable) => $throwable instanceof HttpClientException
    )];
}
```

<a name="throttling-exceptions-with-redis"></a>
#### Giới hạn ngoại lệ With Redis

Nếu đang sử dụng Redis, bạn có thể dùng middleware `Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis`, được tối ưu riêng cho Redis và hiệu quả hơn middleware giới hạn ngoại lệ cơ bản:

```php
use Illuminate\Queue\Middleware\ThrottlesExceptionsWithRedis;

public function middleware(): array
{
    return [new ThrottlesExceptionsWithRedis(10, 10 * 60)];
}
```

Phương thức `connection` có thể được dùng để chỉ định Redis connection mà middleware sẽ sử dụng:

```php
return [(new ThrottlesExceptionsWithRedis(10, 10 * 60))->connection('limiter')];
```

<a name="releasing-jobs"></a>
### Release job

Middleware `Release` cho phép bạn đưa job trở lại queue mà không thực thi nó. Phương thức `Release::when` sẽ release job nếu điều kiện cho trước được đánh giá là `true`, còn `Release::unless` sẽ release job nếu điều kiện được đánh giá là `false`:

```php
use Illuminate\Queue\Middleware\Release;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [
        Release::when($condition, releaseAfter: 60),
    ];
}
```

Việc đưa job trở lại queue vẫn làm tăng tổng số lần thử của job. Vì vậy, bạn có thể cần điều chỉnh các attribute `Tries` và `MaxExceptions` trên lớp job cho phù hợp.

Bạn cũng có thể truyền một `Closure` vào các phương thức `when` và `unless` để đánh giá các điều kiện phức tạp hơn:

```php
use Illuminate\Queue\Middleware\Release;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [
        Release::when(function (): bool {
            return ! $this->order->isPaid();
        }, releaseAfter: 60),
    ];
}
```

<a name="skipping-jobs"></a>
### Bỏ qua job

Middleware `Skip` cho phép bạn chỉ định rằng một job cần được bỏ qua / xóa mà không phải sửa logic của job. Phương thức `Skip::when` sẽ xóa job nếu điều kiện cho trước được đánh giá là `true`, còn `Skip::unless` sẽ xóa job nếu điều kiện được đánh giá là `false`:

```php
use Illuminate\Queue\Middleware\Skip;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [
        Skip::when($condition),
    ];
}
```

Bạn cũng có thể truyền một `Closure` vào các phương thức `when` và `unless` để đánh giá các điều kiện phức tạp hơn:

```php
use Illuminate\Queue\Middleware\Skip;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [
        Skip::when(function (): bool {
            return $this->shouldSkip();
        }),
    ];
}
```

<a name="dispatching-jobs"></a>
## Dispatch job

Sau khi viết lớp job, bạn có thể dispatch nó bằng phương thức `dispatch` ngay trên job. Các đối số truyền vào phương thức `dispatch` sẽ được chuyển tới constructor của job:

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // ...

        ProcessPodcast::dispatch($podcast);

        return redirect('/podcasts');
    }
}
```

Nếu muốn dispatch job theo điều kiện, bạn có thể dùng các phương thức `dispatchIf` và `dispatchUnless`:

```php
ProcessPodcast::dispatchIf($accountActive, $podcast);

ProcessPodcast::dispatchUnless($accountSuspended, $podcast);
```

Trong các ứng dụng Laravel mới, connection `database` được định nghĩa là queue mặc định. Bạn có thể chỉ định queue connection mặc định khác bằng cách thay đổi biến môi trường `QUEUE_CONNECTION` trong file `.env` của ứng dụng.

<a name="delayed-dispatching"></a>
### Dispatch có trì hoãn

Nếu muốn chỉ định rằng job chưa được queue worker xử lý ngay lập tức, bạn có thể dùng phương thức `delay` khi dispatch job. Ví dụ, hãy chỉ định rằng job chỉ sẵn sàng để xử lý sau 10 phút kể từ khi được dispatch:

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // ...

        ProcessPodcast::dispatch($podcast)
            ->delay(now()->plus(minutes: 10));

        return redirect('/podcasts');
    }
}
```

Trong một số trường hợp, job có thể đã được cấu hình độ trễ mặc định. Nếu cần bỏ qua độ trễ này và dispatch job để xử lý ngay, bạn có thể dùng phương thức `withoutDelay`:

```php
ProcessPodcast::dispatch($podcast)->withoutDelay();
```

> [!WARNING]
> Dịch vụ queue Amazon SQS có thời gian trì hoãn tối đa là 15 phút.

<a name="synchronous-dispatching"></a>
### Dispatch đồng bộ

Nếu muốn dispatch job ngay lập tức (đồng bộ), bạn có thể dùng phương thức `dispatchSync`. Khi dùng phương thức này, job sẽ không được đưa vào queue mà được thực thi ngay trong process hiện tại:

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatchSync($podcast);

        return redirect('/podcasts');
    }
}
```

<a name="deferred-dispatching"></a>
#### Dispatch trì hoãn trong cùng request

Với deferred synchronous dispatching, bạn có thể dispatch một job để xử lý trong process hiện tại nhưng chỉ sau khi HTTP response đã được gửi cho người dùng. Cách này cho phép xử lý các job "queued" theo kiểu đồng bộ mà không làm chậm trải nghiệm của người dùng. Để trì hoãn việc thực thi một job đồng bộ, hãy dispatch job tới connection `deferred`:

```php
RecordDelivery::dispatch($order)->onConnection('deferred');
```

Connection `deferred` cũng đóng vai trò là [failover queue](#queue-failover) mặc định.

Tương tự, connection `background` xử lý job sau khi HTTP response đã được gửi cho người dùng; tuy nhiên, job được xử lý trong một PHP process riêng được tạo mới, nhờ đó PHP-FPM / application worker có thể sẵn sàng xử lý HTTP request khác:

```php
RecordDelivery::dispatch($order)->onConnection('background');
```

<a name="bulk-dispatching"></a>
### Dispatch hàng loạt

Nếu cần dispatch nhiều job độc lập cùng lúc và không cần theo dõi hoặc callback của [batch](#job-batching), bạn có thể dùng phương thức `bulk` của facade `Bus`. Laravel sẽ nhóm các job theo queue connection và tên queue đã cấu hình, sau đó đẩy từng nhóm vào queue tương ứng theo lô:

```php
use App\Jobs\ProcessUser;
use Illuminate\Support\Facades\Bus;

Bus::bulk(
    $users->map(fn ($user) => new ProcessUser($user))
);
```

<a name="preparing-jobs-before-dispatch"></a>
### Chuẩn bị job trước khi dispatch

Nếu một job cần chuẩn bị hoặc kiểm tra trạng thái trước khi được đẩy vào queue, job có thể implement interface `Illuminate\Contracts\Queue\PreparesForDispatch`. Laravel sẽ gọi phương thức `prepareForDispatch` của job trước khi dispatch. Nếu phương thức này trả về `false`, job sẽ không được dispatch:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\PreparesForDispatch;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

class SyncPodcasts implements PreparesForDispatch, ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $podcastIds,
    ) {}

    /**
     * Prepare the job before dispatching.
     */
    public function prepareForDispatch(): bool
    {
        return collect($this->podcastIds)
            ->reject(fn (int $id) => Cache::has("podcast-syncing:{$id}"))
            ->isNotEmpty();
    }
}
```

<a name="jobs-and-database-transactions"></a>
### Job và database transaction

Bạn hoàn toàn có thể dispatch job bên trong database transaction, nhưng cần đặc biệt cẩn thận để bảo đảm job thực sự có thể thực thi thành công. Khi dispatch job trong transaction, worker có thể xử lý job trước khi transaction cha được commit. Khi đó, các thay đổi đối với model hoặc bản ghi database trong transaction có thể chưa được phản ánh vào database. Ngoài ra, model hoặc bản ghi được tạo trong transaction cũng có thể chưa tồn tại trong database.

Laravel cung cấp một số cách để xử lý vấn đề này. Trước tiên, bạn có thể đặt tùy chọn connection `after_commit` trong mảng cấu hình queue connection:

```php
'redis' => [
    'driver' => 'redis',
    // ...
    'after_commit' => true,
],
```

Khi tùy chọn `after_commit` là `true`, bạn có thể dispatch job trong database transaction; tuy nhiên, Laravel sẽ chờ cho đến khi các transaction cha đang mở được commit rồi mới thực sự dispatch job. Nếu hiện không có database transaction nào đang mở, job sẽ được dispatch ngay lập tức.

Nếu transaction bị rollback do exception xảy ra trong quá trình thực thi, các job đã được dispatch trong transaction đó sẽ bị loại bỏ.

> [!NOTE]
> Việc đặt tùy chọn cấu hình `after_commit` thành `true` cũng khiến queued event listener, mailable, notification và broadcast event chỉ được dispatch sau khi tất cả database transaction đang mở đã được commit.

<a name="specifying-commit-dispatch-behavior-inline"></a>
#### Chỉ định hành vi dispatch theo commit trực tiếp

Nếu không đặt tùy chọn cấu hình queue connection `after_commit` thành `true`, bạn vẫn có thể chỉ định một job cụ thể chỉ được dispatch sau khi tất cả database transaction đang mở đã được commit. Để làm điều này, hãy chain phương thức `afterCommit` vào thao tác dispatch:

```php
use App\Jobs\ProcessPodcast;

ProcessPodcast::dispatch($podcast)->afterCommit();
```

Ngược lại, nếu tùy chọn cấu hình `after_commit` được đặt thành `true`, bạn có thể chỉ định một job cụ thể được dispatch ngay mà không chờ các database transaction đang mở commit:

```php
ProcessPodcast::dispatch($podcast)->beforeCommit();
```

<a name="job-chaining"></a>
### Chuỗi job

Job chaining cho phép bạn chỉ định danh sách queued job sẽ chạy tuần tự sau khi job chính thực thi thành công. Nếu một job trong chuỗi thất bại, các job còn lại sẽ không chạy. Để thực thi một chuỗi queued job, bạn có thể dùng phương thức `chain` của facade `Bus`. Command bus của Laravel là thành phần cấp thấp mà cơ chế dispatch queued job được xây dựng dựa trên đó:

```php
use App\Jobs\OptimizePodcast;
use App\Jobs\ProcessPodcast;
use App\Jobs\ReleasePodcast;
use Illuminate\Support\Facades\Bus;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->dispatch();
```

Ngoài việc nối chuỗi các instance của job class, bạn cũng có thể nối chuỗi closure:

```php
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    function () {
        Podcast::update(/* ... */);
    },
])->dispatch();
```

> [!WARNING]
> Việc xóa job bằng phương thức `$this->delete()` bên trong job sẽ không ngăn các job tiếp theo trong chuỗi được xử lý. Chuỗi chỉ dừng thực thi khi một job trong chuỗi thất bại.

<a name="chain-connection-queue"></a>
#### Connection và queue của chuỗi

Nếu muốn chỉ định connection và queue dùng cho các job trong chuỗi, bạn có thể dùng các phương thức `onConnection` và `onQueue`. Các phương thức này xác định queue connection và tên queue sẽ được sử dụng, trừ khi queued job được gán rõ một connection / queue khác:

```php
Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->onConnection('redis')->onQueue('podcasts')->dispatch();
```

<a name="adding-jobs-to-the-chain"></a>
#### Thêm job vào chuỗi

Đôi khi bạn cần thêm một job vào đầu hoặc cuối chuỗi job hiện có từ bên trong một job khác thuộc chính chuỗi đó. Bạn có thể thực hiện bằng các phương thức `prependToChain` và `appendToChain`:

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    // ...

    // Prepend to the current chain, run job immediately after current job...
    $this->prependToChain(new TranscribePodcast);

    // Append to the current chain, run job at end of chain...
    $this->appendToChain(new TranscribePodcast);
}
```

<a name="chain-failures"></a>
#### Lỗi trong chuỗi

Khi nối chuỗi job, bạn có thể dùng phương thức `catch` để chỉ định closure được gọi nếu một job trong chuỗi thất bại. Callback được cung cấp sẽ nhận instance `Throwable` gây ra lỗi của job:

```php
use Illuminate\Support\Facades\Bus;
use Throwable;

Bus::chain([
    new ProcessPodcast,
    new OptimizePodcast,
    new ReleasePodcast,
])->catch(function (Throwable $e) {
    // A job within the chain has failed...
})->dispatch();
```

> [!WARNING]
> Vì callback của chuỗi được serialize và thực thi sau bởi queue Laravel, bạn không nên dùng biến `$this` bên trong các callback này.

<a name="customizing-the-queue-and-connection"></a>
### Tùy chỉnh queue và connection

<a name="dispatching-to-a-particular-queue"></a>
#### Dispatch tới một queue cụ thể

Bằng cách đẩy job vào các queue khác nhau, bạn có thể "phân loại" queued job và thậm chí ưu tiên số lượng worker được gán cho từng queue. Lưu ý rằng cách này không đẩy job sang các queue "connection" khác nhau như định nghĩa trong file cấu hình queue, mà chỉ tới các queue cụ thể trong cùng một connection. Để chỉ định queue, hãy dùng phương thức `onQueue` khi dispatch job:

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onQueue('processing');

        return redirect('/podcasts');
    }
}
```

Ngoài ra, bạn có thể chỉ định queue của job bằng cách gọi phương thức `onQueue` trong constructor của job:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->onQueue('processing');
    }
}
```

<a name="dispatching-to-a-particular-connection"></a>
#### Dispatch tới một connection cụ thể

Nếu ứng dụng tương tác với nhiều queue connection, bạn có thể chỉ định connection mà job sẽ được đẩy tới bằng phương thức `onConnection`:

```php
<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPodcast;
use App\Models\Podcast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    /**
     * Store a new podcast.
     */
    public function store(Request $request): RedirectResponse
    {
        $podcast = Podcast::create(/* ... */);

        // Create podcast...

        ProcessPodcast::dispatch($podcast)->onConnection('sqs');

        return redirect('/podcasts');
    }
}
```

Bạn có thể chain `onConnection` và `onQueue` để chỉ định cả connection lẫn queue cho job:

```php
ProcessPodcast::dispatch($podcast)
    ->onConnection('sqs')
    ->onQueue('processing');
```

Ngoài ra, bạn có thể chỉ định connection của job bằng cách gọi phương thức `onConnection` trong constructor của job:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->onConnection('sqs');
    }
}
```

<a name="queue-routing"></a>
#### Định tuyến queue

Bạn có thể dùng phương thức `route` của facade `Queue` để định nghĩa connection và queue mặc định cho các job class cụ thể. Điều này hữu ích khi muốn bảo đảm một số job luôn dùng queue nhất định mà không cần chỉ định connection hoặc queue trên từng job.

Ngoài việc định tuyến các job class cụ thể, bạn cũng có thể truyền interface, trait hoặc parent class vào phương thức `route`. Khi đó, mọi job implement interface, sử dụng trait hoặc extends parent class sẽ tự động dùng connection và queue đã cấu hình.

Thông thường, bạn nên gọi phương thức `route` từ phương thức `boot` của service provider:

```php
use App\Concerns\RequiresVideo;
use App\Jobs\ProcessPodcast;
use App\Jobs\ProcessVideo;
use Illuminate\Support\Facades\Queue;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Queue::route(ProcessPodcast::class, connection: 'redis', queue: 'podcasts');
    Queue::route(RequiresVideo::class, queue: 'video');
}
```

Khi chỉ định connection mà không chỉ định queue, job sẽ được gửi tới queue mặc định:

```php
Queue::route(ProcessPodcast::class, connection: 'redis');
```

Bạn cũng có thể định tuyến nhiều job class cùng lúc bằng cách truyền một mảng vào phương thức `route`:

```php
Queue::route([
    ProcessPodcast::class => ['redis', 'podcasts'], // Connection and queue
    ProcessVideo::class => 'videos', // Queue only (uses default connection)
]);
```

> [!NOTE]
> Queue routing vẫn có thể được override riêng trên từng job.

Bạn có thể dùng phương thức `forward` để chuyển tiếp job từ queue này sang queue và / hoặc connection khác. Điều này hữu ích khi cần thay đổi hạ tầng queue mà không phải sửa từng job hoặc vị trí dispatch:

```php
Queue::forward('reports', 'reports.fifo', 'sqs');
Queue::forward('payments', connection: 'sqs');
Queue::forward('updates', 'notifications');
```

Bạn cũng có thể chuyển tiếp nhiều queue cùng lúc bằng cách truyền một mảng:

```php
Queue::forward([
    'reports' => 'reports.fifo',
    'emails' => 'emails.fifo',
], connection: 'sqs');
```

Connection được cấu hình rõ trên job sẽ được ưu tiên hơn connection được forward.

<a name="max-job-attempts-and-timeout"></a>
### Chỉ định số lần thử tối đa / giá trị timeout cho job

<a name="max-attempts"></a>
#### Số lần thử tối đa

Số lần thử của job là một khái niệm cốt lõi trong hệ thống queue của Laravel và là nền tảng cho nhiều tính năng nâng cao. Mặc dù ban đầu có thể hơi khó hiểu, bạn nên nắm rõ cách chúng hoạt động trước khi thay đổi cấu hình mặc định.

Khi một job được dispatch, nó sẽ được đưa vào queue. Sau đó, worker lấy job ra và cố gắng thực thi. Đây được tính là một lần thử của job.

Tuy nhiên, một lần thử không nhất thiết có nghĩa là phương thức `handle` của job đã được thực thi. Một lần thử cũng có thể bị "tiêu thụ" theo một số cách:

<div class="content-list" markdown="1">

- Job gặp một exception chưa được xử lý trong quá trình thực thi.
- Job được đưa trở lại queue theo cách thủ công bằng `$this->release()`.
- Middleware như `WithoutOverlapping` hoặc `RateLimited` không lấy được lock và đưa job trở lại queue.
- Job bị timeout.
- Phương thức `handle` của job chạy và hoàn tất mà không ném exception.

</div>

Thông thường, bạn sẽ không muốn tiếp tục thử một job vô thời hạn. Vì vậy, Laravel cung cấp nhiều cách để chỉ định số lần hoặc khoảng thời gian mà một job được phép thử.

> [!NOTE]
> Theo mặc định, Laravel chỉ thử một job một lần. Nếu job sử dụng middleware như `WithoutOverlapping` hoặc `RateLimited`, hoặc nếu bạn chủ động đưa job trở lại queue, bạn thường cần tăng số lần thử được phép thông qua tùy chọn `tries`.

Một cách để chỉ định số lần tối đa mà job có thể được thử là sử dụng tùy chọn `--tries` trên dòng lệnh Artisan. Giá trị này áp dụng cho tất cả job do worker xử lý, trừ khi chính job đang được xử lý chỉ định số lần thử riêng:

```shell
php artisan queue:work --tries=3
```

Nếu job vượt quá số lần thử tối đa, nó sẽ được xem là job "failed". Để biết thêm thông tin về cách xử lý failed job, hãy xem [tài liệu về failed job](#dealing-with-failed-jobs). Nếu truyền `--tries=0` cho lệnh `queue:work`, job sẽ được thử lại vô thời hạn.

Bạn có thể kiểm soát chi tiết hơn bằng cách định nghĩa số lần tối đa một job được phép thử ngay trên lớp job thông qua attribute `Tries`. Nếu số lần thử tối đa được chỉ định trên job, giá trị này sẽ được ưu tiên hơn `--tries` truyền từ dòng lệnh:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\Tries;

#[Tries(5)]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

Nếu cần kiểm soát động số lần thử tối đa của một job cụ thể, bạn có thể định nghĩa phương thức `tries` trên job:

```php
/**
 * Determine number of times the job may be attempted.
 */
public function tries(): int
{
    return 5;
}
```

<a name="time-based-attempts"></a>
#### Số lần thử dựa trên thời gian

Thay vì xác định số lần job được thử trước khi thất bại, bạn có thể xác định thời điểm mà job không còn được phép thử nữa. Cách này cho phép job được thử bất kỳ số lần nào trong một khoảng thời gian nhất định. Để xác định thời điểm dừng thử, hãy thêm phương thức `retryUntil` vào class job. Phương thức này phải trả về một instance `DateTime`:

```php
use DateTime;

/**
 * Determine the time at which the job should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->plus(minutes: 10);
}
```

Nếu cả `retryUntil` và `tries` đều được định nghĩa, Laravel ưu tiên phương thức `retryUntil`.

> [!NOTE]
> Bạn cũng có thể định nghĩa attribute `Tries` hoặc method `retryUntil` trên [queued event listener](/events#queued-event-listeners) và [queued notification](/notifications#queueing-notifications).

<a name="max-exceptions"></a>
#### Số exception tối đa

Đôi khi bạn muốn cho phép job được thử nhiều lần nhưng phải thất bại nếu việc thử lại bị kích hoạt bởi một số lượng exception chưa được xử lý nhất định (thay vì do phương thức `release` trực tiếp đưa job trở lại queue). Để thực hiện điều này, bạn có thể sử dụng các attribute `Tries` và `MaxExceptions` trên class job:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\MaxExceptions;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Support\Facades\Redis;

#[Tries(25)]
#[MaxExceptions(3)]
class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Redis::throttle('key')->allow(10)->every(60)->then(function () {
            // Lock obtained, process the podcast...
        }, function () {
            // Unable to obtain lock...
            return $this->release(10);
        });
    }
}
```

Trong ví dụ này, job được đưa trở lại queue trong mười giây nếu ứng dụng không lấy được Redis lock và sẽ tiếp tục được thử lại tối đa 25 lần. Tuy nhiên, job sẽ thất bại nếu nó ném ra ba exception chưa được xử lý.

<a name="stopping-retries-by-exception"></a>
#### Dừng thử lại theo exception

Đôi khi một exception cho biết queued job nên thất bại ngay lập tức thay vì được đưa trở lại queue để thử lần nữa. Bạn có thể cấu hình các loại exception phải dừng việc thử lại bằng phương thức exception `dontRetry` trong file `bootstrap/app.php` của ứng dụng:

```php
use App\Exceptions\InvalidPodcastSourceException;
use Illuminate\Foundation\Configuration\Exceptions;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->dontRetry([
        InvalidPodcastSourceException::class,
    ]);
})
```

Nếu cần kiểm soát chi tiết hơn thời điểm dừng thử lại, bạn có thể truyền một closure cho phương thức `dontRetryWhen`. Khi closure trả về `true`, job sẽ được đánh dấu là failed và không được thử lại:

```php
use App\Exceptions\PodcastProcessingException;
use Illuminate\Foundation\Configuration\Exceptions;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->dontRetryWhen(function (PodcastProcessingException $e) {
        return $e->reason() === 'Subscription expired';
    });
})
```

<a name="timeout"></a>
#### Timeout

Thông thường, bạn biết tương đối thời gian cần thiết để queued job hoàn thành. Vì vậy, Laravel cho phép chỉ định giá trị "timeout". Mặc định, timeout là 60 giây. Nếu job được xử lý lâu hơn số giây đã chỉ định, worker đang xử lý job sẽ thoát với lỗi. Thông thường, worker sẽ được tự động khởi động lại bởi [process manager được cấu hình trên server](#supervisor-configuration).

Có thể chỉ định số giây tối đa mà job được phép chạy bằng tùy chọn `--timeout` trên dòng lệnh Artisan:

```shell
php artisan queue:work --timeout=30
```

Nếu job vượt quá số lần thử tối đa do liên tục timeout, nó sẽ được đánh dấu là failed.

Bạn cũng có thể định nghĩa số giây tối đa mà job được phép chạy bằng attribute `Timeout` trên lớp job. Nếu timeout được chỉ định trên job, giá trị này sẽ được ưu tiên hơn timeout được chỉ định trên dòng lệnh:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\Timeout;

#[Timeout(120)]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

Đôi khi các tiến trình I/O blocking như socket hoặc kết nối HTTP đi ra có thể không tuân theo timeout bạn đã chỉ định. Vì vậy, khi sử dụng các tính năng này, bạn cũng nên luôn cố gắng chỉ định timeout thông qua API tương ứng. Ví dụ, khi dùng [Guzzle](https://docs.guzzlephp.org), bạn nên luôn chỉ định timeout cho cả connection và request.

> [!WARNING]
> PHP extension [PCNTL](https://www.php.net/manual/en/book.pcntl.php) phải được cài để chỉ định job timeout. Ngoài ra, value "timeout" của job luôn nên nhỏ hơn value ["retry after"](#job-expiration). Nếu không, job có thể bị attempt lại trước khi thực sự chạy xong hoặc timeout. Option `--timeout` không có tác dụng khi command `queue:work` được gọi với option `--once`.

<a name="failing-on-timeout"></a>
#### Đánh dấu failed khi timeout

Nếu muốn job được đánh dấu là [failed](#dealing-with-failed-jobs) khi timeout, bạn có thể sử dụng attribute `FailOnTimeout` trên class job:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\FailOnTimeout;

#[FailOnTimeout]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

> [!NOTE]
> Mặc định, khi job timeout, nó tiêu tốn một attempt và được release trở lại queue nếu retry được cho phép. Tuy nhiên, nếu cấu hình job fail khi timeout, job sẽ không được retry bất kể value của tries.

<a name="sqs-fifo-and-fair-queues"></a>
### SQS FIFO và Fair Queue

Laravel hỗ trợ queue [Amazon SQS FIFO (First-In-First-Out)](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html) và [fair](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fair-queues.html). Queue FIFO cho phép xử lý job theo đúng thứ tự chúng được gửi, đồng thời bảo đảm xử lý đúng một lần thông qua cơ chế loại bỏ message trùng lặp.

FIFO queue cần message group ID để xác định job nào có thể được xử lý song song. Các job có cùng group ID được xử lý tuần tự, trong khi message có group ID khác nhau có thể được xử lý đồng thời.

Laravel cung cấp phương thức fluent `onGroup` để chỉ định message group ID khi dispatch job:

```php
ProcessOrder::dispatch($order)
    ->onGroup("customer-{$order->customer_id}");
```

SQS FIFO queue hỗ trợ message deduplication để bảo đảm xử lý exactly-once. Hãy implement method `deduplicationId` trong job class để cung cấp deduplication ID tùy chỉnh:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessSubscriptionRenewal implements ShouldQueue
{
    use Queueable;

    // ...

    /**
     * Get the job's deduplication ID.
     */
    public function deduplicationId(): string
    {
        return "renewal-{$this->subscription->id}";
    }
}
```

<a name="fair-queues"></a>
#### Fair Queues

Nếu đang sử dụng SQS standard queue, việc đặt message group sẽ bật cơ chế fair queueing. Nói cách khác, sau khi bạn gán group, SQS sẽ dùng chúng để duy trì việc phân phối công bằng giữa các tenant / workload. Laravel không yêu cầu cấu hình bổ sung.

Thay vì gọi `onGroup` khi dispatch, bạn cũng có thể định nghĩa phương thức `messageGroup` trực tiếp trên job:

```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessOrder implements ShouldQueue
{
    use Queueable;

    // ...

    /**
     * Get the job's message group.
     */
    public function messageGroup(): string
    {
        return "customer-{$this->order->customer_id}";
    }
}
```

<a name="fifo-listeners-mail-and-notifications"></a>
#### Listener, Mail và Notification theo FIFO

Khi sử dụng queue FIFO, bạn cũng cần định nghĩa message group cho listener, mail và notification. Hoặc bạn có thể dispatch các instance được queue của những đối tượng này sang một queue không phải FIFO.

Để định nghĩa message group cho một [queued event listener](/events#queued-event-listeners), hãy định nghĩa phương thức `messageGroup` trên listener. Bạn cũng có thể tùy chọn định nghĩa phương thức `deduplicationId`:

```php
<?php

namespace App\Listeners;

class SendShipmentNotification
{
    // ...

    /**
     * Get the job's message group.
     */
    public function messageGroup(): string
    {
        return 'shipments';
    }

    /**
     * Get the job's deduplication ID.
     */
    public function deduplicationId(): string
    {
        return "shipment-notification-{$this->shipment->id}";
    }
}
```

Khi gửi một [mail message](/mail) sẽ được đưa vào queue FIFO, bạn nên gọi phương thức `onGroup` và tùy chọn phương thức `withDeduplicator` khi gửi:

```php
use App\Mail\InvoicePaid;
use Illuminate\Support\Facades\Mail;

$invoicePaid = (new InvoicePaid($invoice))
    ->onGroup('invoices')
    ->withDeduplicator(fn () => 'invoices-'.$invoice->id);

Mail::to($request->user())->send($invoicePaid);
```

Khi gửi một [notification](/notifications) sẽ được đưa vào queue FIFO, bạn nên gọi phương thức `onGroup` và tùy chọn phương thức `withDeduplicator` khi gửi notification:

```php
use App\Notifications\InvoicePaid;

$invoicePaid = (new InvoicePaid($invoice))
    ->onGroup('invoices')
    ->withDeduplicator(fn () => 'invoices-'.$invoice->id);

$user->notify($invoicePaid);
```

<a name="queue-failover"></a>
### Queue Failover

Queue driver `failover` cung cấp khả năng tự động chuyển đổi dự phòng khi đẩy job vào queue. Nếu queue connection chính trong cấu hình `failover` gặp lỗi vì bất kỳ lý do nào, Laravel sẽ tự động thử đẩy job sang connection tiếp theo đã cấu hình trong danh sách. Điều này đặc biệt hữu ích để bảo đảm tính sẵn sàng cao trong môi trường production, nơi độ tin cậy của queue là yếu tố quan trọng.

Để cấu hình một failover queue connection, hãy chỉ định driver `failover` và cung cấp mảng tên connection theo thứ tự cần thử. Mặc định, Laravel cung cấp một cấu hình failover mẫu trong file cấu hình `config/queue.php` của ứng dụng:

```php
'failover' => [
    'driver' => 'failover',
    'connections' => [
        'redis',
        'database',
        'sync',
    ],
],
```

Sau khi cấu hình connection sử dụng driver `failover`, bạn cần đặt failover connection làm queue connection mặc định trong file `.env` của ứng dụng để sử dụng chức năng failover:

```ini
QUEUE_CONNECTION=failover
```

Tiếp theo, hãy khởi chạy ít nhất một worker cho mỗi connection trong danh sách failover connection:

```bash
php artisan queue:work redis
php artisan queue:work database
```

> [!NOTE]
> Bạn không cần chạy worker cho các connection dùng queue driver `sync`, `background` hoặc `deferred`, vì các driver này xử lý job ngay trong PHP process hiện tại.

Khi thao tác trên queue connection thất bại và failover được kích hoạt, Laravel sẽ dispatch event `Illuminate\Queue\Events\QueueFailedOver`, cho phép bạn báo cáo hoặc ghi log việc một queue connection đã thất bại.

> [!NOTE]
> Nếu dùng Laravel Horizon, hãy nhớ Horizon chỉ quản lý Redis queue. Nếu failover list có `database`, bạn nên chạy thêm process `php artisan queue:work database` thông thường song song với Horizon.

<a name="error-handling"></a>
### Error Handling

Nếu một exception được ném ra trong khi job đang được xử lý, job sẽ tự động được release trở lại queue để có thể thử lại. Job tiếp tục được release cho đến khi đạt số lần thử tối đa mà ứng dụng cho phép. Số lần thử tối đa được định nghĩa bởi tùy chọn `--tries` của lệnh Artisan `queue:work`. Ngoài ra, số lần thử tối đa cũng có thể được định nghĩa ngay trên class job. Thông tin chi tiết về cách chạy queue worker [được trình bày bên dưới](#running-the-queue-worker).

<a name="manually-releasing-a-job"></a>
#### Giải phóng job thủ công

Đôi khi bạn có thể muốn tự đưa job trở lại queue để thử lại vào thời điểm sau. Bạn có thể thực hiện việc này bằng cách gọi phương thức `release`:

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    // ...

    $this->release();
}
```

Mặc định, phương thức `release` sẽ đưa job trở lại queue để xử lý ngay. Tuy nhiên, bạn có thể yêu cầu queue chưa cho phép xử lý job cho đến khi một số giây nhất định trôi qua bằng cách truyền một số nguyên hoặc date instance vào phương thức `release`:

```php
$this->release(10);

$this->release(now()->plus(seconds: 10));
```

<a name="manually-failing-a-job"></a>
#### Đánh dấu job thất bại thủ công

Đôi khi bạn cần tự đánh dấu một job là "failed". Để làm điều đó, bạn có thể gọi method `fail`:

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    // ...

    $this->fail();
}
```

Nếu muốn đánh dấu job là thất bại do một exception đã bắt được, bạn có thể truyền exception đó vào phương thức `fail`. Hoặc để thuận tiện, bạn có thể truyền một chuỗi thông báo lỗi và Laravel sẽ chuyển nó thành exception:

```php
$this->fail($exception);

$this->fail('Something went wrong.');
```

> [!NOTE]
> Để biết thêm về failed job, hãy xem [tài liệu xử lý job failure](#dealing-with-failed-jobs).

<a name="fail-jobs-on-exceptions"></a>
#### Đánh fail job với exception cụ thể

[Job middleware](#job-middleware) `FailOnException` cho phép dừng ngay quá trình retry khi các exception cụ thể được ném ra. Nhờ đó, bạn có thể retry với lỗi tạm thời như lỗi API bên ngoài, nhưng đánh dấu job thất bại vĩnh viễn với lỗi kéo dài, chẳng hạn quyền của người dùng bị thu hồi:

```php
<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\Middleware\FailOnException;
use Illuminate\Support\Facades\Http;

#[Tries(3)]
class SyncChatHistory implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public User $user,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->user->authorize('sync-chat-history');

        $response = Http::throw()->get(
            "https://chat.laravel.test/?user={$this->user->uuid}"
        );

        // ...
    }

    /**
     * Get the middleware the job should pass through.
     */
    public function middleware(): array
    {
        return [
            new FailOnException([AuthorizationException::class])
        ];
    }
}
```

<a name="job-batching"></a>
## Job Batching

Tính năng job batching của Laravel cho phép bạn dễ dàng thực thi một nhóm job song song rồi thực hiện một hành động sau khi batch job hoàn tất.

Trước khi bắt đầu, bạn nên tạo database migration để xây dựng bảng chứa metadata về các job batch, chẳng hạn phần trăm hoàn thành. Migration này có thể được tạo bằng lệnh Artisan `make:queue-batches-table`:

```shell
php artisan make:queue-batches-table

php artisan migrate
```

<a name="defining-batchable-jobs"></a>
### Định nghĩa batchable job

Để định nghĩa một batchable job, hãy [tạo queueable job](#creating-jobs) như bình thường; tuy nhiên, bạn cần thêm trait `Illuminate\Bus\Batchable` vào class job. Trait này cung cấp phương thức `batch`, dùng để lấy batch hiện tại mà job đang thực thi bên trong:

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ImportCsv implements ShouldQueue
{
    use Batchable, Queueable;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if ($this->batch()->cancelled()) {
            // Determine if the batch has been cancelled...

            return;
        }

        // Import a portion of the CSV file...
    }
}
```

<a name="dispatching-batches"></a>
### Dispatch batch

Để dispatch một batch job, hãy sử dụng phương thức `batch` của facade `Bus`. Batch đặc biệt hữu ích khi kết hợp với các completion callback. Vì vậy, bạn có thể dùng các phương thức `then`, `catch` và `finally` để định nghĩa completion callback cho batch. Mỗi callback này sẽ nhận một instance `Illuminate\Bus\Batch` khi được gọi.

Khi chạy nhiều queue worker, các job trong batch sẽ được xử lý song song. Vì vậy, thứ tự job hoàn tất có thể không giống thứ tự chúng được thêm vào batch. Hãy xem tài liệu về [job chain và batch](#chains-and-batches) để biết cách chạy một chuỗi job tuần tự.

Trong ví dụ này, giả sử chúng ta đang đưa vào queue một batch gồm các job, mỗi job xử lý một số lượng dòng nhất định từ file CSV:

```php
use App\Jobs\ImportCsv;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;
use Throwable;

$batch = Bus::batch([
    new ImportCsv(1, 100),
    new ImportCsv(101, 200),
    new ImportCsv(201, 300),
    new ImportCsv(301, 400),
    new ImportCsv(401, 500),
])->before(function (Batch $batch) {
    // The batch has been created but no jobs have been added...
})->progress(function (Batch $batch) {
    // A single job has completed successfully...
})->then(function (Batch $batch) {
    // All jobs completed successfully...
})->catch(function (Batch $batch, Throwable $e) {
    // Batch job failure detected...
})->finally(function (Batch $batch) {
    // The batch has finished executing...
})->dispatch();

return $batch->id;
```

ID của batch, có thể truy cập qua property `$batch->id`, có thể được dùng để [truy vấn Laravel command bus](#inspecting-batches) nhằm lấy thông tin về batch sau khi nó được dispatch.

> [!WARNING]
> Vì batch callback được serialize và thực thi sau bởi Laravel queue, bạn không nên dùng variable `$this` bên trong callback. Ngoài ra, do batched job được bọc trong database transaction, các câu lệnh database gây implicit commit không nên được thực thi trong job.

<a name="naming-batches"></a>
#### Đặt tên cho batch

Một số tool như [Laravel Horizon](/horizon) và [Laravel Telescope](/telescope) có thể cung cấp thông tin debug thân thiện hơn nếu batch được đặt tên. Để gán một tên tùy ý cho batch, bạn có thể gọi method `name` khi định nghĩa batch:

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->name('Import CSV')->dispatch();
```

<a name="batch-connection-queue"></a>
#### Connection và queue của batch

Nếu muốn chỉ định connection và queue dùng cho các job trong batch, bạn có thể sử dụng các phương thức `onConnection` và `onQueue`. Tất cả job trong batch phải thực thi trên cùng connection và queue:

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->onConnection('redis')->onQueue('imports')->dispatch();
```

<a name="chains-and-batches"></a>
### Chain và batch

Bạn có thể định nghĩa một tập [chained jobs](#job-chaining) bên trong batch bằng cách đặt các job trong chain vào một mảng. Ví dụ, chúng ta có thể thực thi song song hai job chain và chạy callback khi cả hai chain hoàn tất xử lý:

```php
use App\Jobs\ReleasePodcast;
use App\Jobs\SendPodcastReleaseNotification;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;

Bus::batch([
    [
        new ReleasePodcast(1),
        new SendPodcastReleaseNotification(1),
    ],
    [
        new ReleasePodcast(2),
        new SendPodcastReleaseNotification(2),
    ],
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->dispatch();
```

Ngược lại, bạn có thể chạy các batch job bên trong một [chain](#job-chaining) bằng cách định nghĩa batch trong chain. Ví dụ, bạn có thể chạy một batch job để phát hành nhiều podcast, sau đó chạy một batch khác để gửi notification về việc phát hành:

```php
use App\Jobs\FlushPodcastCache;
use App\Jobs\ReleasePodcast;
use App\Jobs\SendPodcastReleaseNotification;
use Illuminate\Support\Facades\Bus;

Bus::chain([
    new FlushPodcastCache,
    Bus::batch([
        new ReleasePodcast(1),
        new ReleasePodcast(2),
    ]),
    Bus::batch([
        new SendPodcastReleaseNotification(1),
        new SendPodcastReleaseNotification(2),
    ]),
])->dispatch();
```

<a name="adding-jobs-to-batches"></a>
### Thêm job vào batch

Đôi khi việc thêm các job khác vào batch từ bên trong một batched job có thể hữu ích. Mẫu này phù hợp khi bạn cần batch hàng nghìn job và việc dispatch tất cả trong một web request có thể mất quá nhiều thời gian. Thay vào đó, bạn có thể dispatch một batch ban đầu gồm các job "loader" để bổ sung thêm nhiều job vào batch:

```php
$batch = Bus::batch([
    new LoadImportBatch,
    new LoadImportBatch,
    new LoadImportBatch,
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->name('Import Contacts')->dispatch();
```

Trong ví dụ này, chúng ta dùng job `LoadImportBatch` để bổ sung thêm job cho batch. Để thực hiện, bạn có thể dùng method `add` trên batch instance được truy cập thông qua method `batch` của job:

```php
use App\Jobs\ImportContacts;
use Illuminate\Support\Collection;

/**
 * Execute the job.
 */
public function handle(): void
{
    if ($this->batch()->cancelled()) {
        return;
    }

    $this->batch()->add(Collection::times(1000, function () {
        return new ImportContacts;
    }));
}
```

> [!WARNING]
> Bạn chỉ có thể thêm job vào batch từ bên trong một job thuộc chính batch đó.

<a name="inspecting-batches"></a>
### Kiểm tra batch

Instance `Illuminate\Bus\Batch` được truyền vào các callback hoàn tất batch cung cấp nhiều property và method giúp bạn tương tác và kiểm tra một batch job cụ thể:

```php
// The UUID of the batch...
$batch->id;

// The name of the batch (if applicable)...
$batch->name;

// The number of jobs assigned to the batch...
$batch->totalJobs;

// The number of jobs that have not been processed by the queue...
$batch->pendingJobs;

// The number of jobs that have failed...
$batch->failedJobs;

// The number of jobs that have been processed thus far...
$batch->processedJobs();

// The completion percentage of the batch (0-100)...
$batch->progress();

// Indicates if the batch has finished executing...
$batch->finished();

// Cancel the execution of the batch...
$batch->cancel();

// Indicates if the batch has been cancelled...
$batch->cancelled();
```

<a name="returning-batches-from-routes"></a>
#### Trả batch từ route

Mọi instance `Illuminate\Bus\Batch` đều có thể serialize thành JSON, nghĩa là bạn có thể trả chúng trực tiếp từ route của ứng dụng để nhận JSON payload chứa thông tin về batch, bao gồm tiến độ hoàn thành. Điều này giúp việc hiển thị tiến độ hoàn thành batch trên UI của ứng dụng trở nên thuận tiện.

Để lấy một batch theo ID, bạn có thể sử dụng phương thức `findBatch` của facade `Bus`:

```php
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Route;

Route::get('/batch/{batchId}', function (string $batchId) {
    return Bus::findBatch($batchId);
});
```

<a name="cancelling-batches"></a>
### Hủy batch

Đôi khi bạn cần hủy việc thực thi một batch cụ thể. Có thể thực hiện việc này bằng cách gọi phương thức `cancel` trên instance `Illuminate\Bus\Batch`:

```php
/**
 * Execute the job.
 */
public function handle(): void
{
    if ($this->user->exceedsImportLimit()) {
        $this->batch()->cancel();

        return;
    }

    if ($this->batch()->cancelled()) {
        return;
    }
}
```

Như các ví dụ trước, batched job thường nên kiểm tra batch tương ứng đã bị cancel hay chưa trước khi tiếp tục. Tuy nhiên, để thuận tiện, bạn có thể gán [middleware](#job-middleware) `SkipIfBatchCancelled` cho job. Đúng như tên gọi, middleware này yêu cầu Laravel không xử lý job nếu batch tương ứng đã bị cancel:

```php
use Illuminate\Queue\Middleware\SkipIfBatchCancelled;

/**
 * Get the middleware the job should pass through.
 */
public function middleware(): array
{
    return [new SkipIfBatchCancelled];
}
```

<a name="batch-failures"></a>
### Batch Failures

Khi một job trong batch thất bại, callback `catch` (nếu được gán) sẽ được gọi. Callback này chỉ được gọi cho job đầu tiên thất bại trong batch.

<a name="allowing-failures"></a>
#### Allowing Failures

Khi một job trong batch thất bại, Laravel sẽ tự động đánh dấu batch là "cancelled". Nếu muốn, bạn có thể tắt hành vi này để một job thất bại không tự động khiến batch bị đánh dấu đã hủy. Có thể thực hiện bằng cách gọi phương thức `allowFailures` khi dispatch batch:

```php
$batch = Bus::batch([
    // ...
])->then(function (Batch $batch) {
    // All jobs completed successfully...
})->allowFailures()->dispatch();
```

Bạn có thể tùy chọn truyền một closure vào phương thức `allowFailures`; closure này sẽ được thực thi mỗi khi một job thất bại:

```php
$batch = Bus::batch([
    // ...
])->allowFailures(function (Batch $batch, $exception) {
    // Handle individual job failures...
})->dispatch();
```

<a name="retrying-failed-batch-jobs"></a>
#### Retrying Failed Batch Jobs

Để thuận tiện, Laravel cung cấp lệnh Artisan `queue:retry-batch`, cho phép dễ dàng retry tất cả job thất bại của một batch cụ thể. Lệnh nhận UUID của batch có các job thất bại cần retry:

```shell
php artisan queue:retry-batch 32dbc76c-4f82-4749-b610-a639fe0099b5
```

<a name="pruning-batches"></a>
### Pruning Batches

Nếu không prune, table `job_batches` có thể tích lũy record rất nhanh. Để hạn chế điều này, bạn nên [schedule](/scheduling) command Artisan `queue:prune-batches` chạy hằng ngày:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches')->daily();
```

Mặc định, mọi batch đã hoàn tất hơn 24 giờ sẽ bị prune. Bạn có thể dùng tùy chọn `hours` khi gọi lệnh để xác định thời gian giữ dữ liệu batch. Ví dụ, lệnh sau sẽ xóa mọi batch đã hoàn tất hơn 48 giờ trước:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48')->daily();
```

Đôi khi bảng `job_batches` có thể tích lũy các bản ghi batch chưa bao giờ hoàn tất thành công, chẳng hạn batch có một job thất bại và job đó chưa từng được retry thành công. Bạn có thể yêu cầu lệnh `queue:prune-batches` dọn các bản ghi batch chưa hoàn tất này bằng tùy chọn `unfinished`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48 --unfinished=72')->daily();
```

Tương tự, table `job_batches` cũng có thể tích lũy record của các batch đã cancel. Bạn có thể yêu cầu command `queue:prune-batches` prune các record này bằng option `cancelled`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:prune-batches --hours=48 --cancelled=72')->daily();
```

<a name="storing-batches-in-dynamodb"></a>
### Lưu batch trong DynamoDB

Laravel cũng hỗ trợ lưu metadata của batch trong [DynamoDB](https://aws.amazon.com/dynamodb) thay vì relational database. Tuy nhiên, bạn cần tự tạo một DynamoDB table để lưu toàn bộ batch record.

Thông thường table này nên có tên `job_batches`, nhưng bạn nên đặt tên table theo value của cấu hình `queue.batching.table` trong file cấu hình queue của ứng dụng.

<a name="dynamodb-batch-table-configuration"></a>
#### DynamoDB Batch Table Configuration

Bảng `job_batches` cần có primary partition key kiểu chuỗi tên `application` và primary sort key kiểu chuỗi tên `id`. Phần `application` của key chứa tên ứng dụng như được định nghĩa bởi giá trị cấu hình `name` trong file cấu hình `app`. Vì tên ứng dụng là một phần của key trong bảng DynamoDB, bạn có thể dùng cùng một bảng để lưu job batch cho nhiều ứng dụng Laravel.

Ngoài ra, bạn có thể định nghĩa attribute `ttl` cho bảng nếu muốn tận dụng tính năng [tự động dọn batch](#pruning-batches-in-dynamodb).

<a name="dynamodb-configuration"></a>
#### DynamoDB Configuration

Tiếp theo, hãy cài AWS SDK để ứng dụng Laravel có thể giao tiếp với Amazon DynamoDB:

```shell
composer require aws/aws-sdk-php
```

Sau đó, đặt option cấu hình `queue.batching.driver` thành `dynamodb`. Ngoài ra, bạn nên khai báo các option `key`, `secret` và `region` trong mảng cấu hình `batching`; các option này được dùng để xác thực với AWS. Khi dùng driver `dynamodb`, option `queue.batching.database` không cần thiết:

```php
'batching' => [
    'driver' => env('QUEUE_BATCHING_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'job_batches',
],
```

<a name="pruning-batches-in-dynamodb"></a>
#### Prune batch trong DynamoDB

Khi dùng [DynamoDB](https://aws.amazon.com/dynamodb) để lưu thông tin job batch, các lệnh dọn dữ liệu thông thường dành cho batch lưu trong cơ sở dữ liệu quan hệ sẽ không hoạt động. Thay vào đó, bạn có thể dùng [chức năng TTL gốc của DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html) để tự động xóa các bản ghi batch cũ.

Nếu đã định nghĩa bảng DynamoDB với attribute `ttl`, bạn có thể khai báo các tham số cấu hình để chỉ cho Laravel cách dọn bản ghi batch. Giá trị cấu hình `queue.batching.ttl_attribute` xác định tên attribute chứa TTL, còn `queue.batching.ttl` xác định số giây sau lần cập nhật gần nhất mà một bản ghi batch có thể được xóa khỏi bảng DynamoDB:

```php
'batching' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'job_batches',
    'ttl_attribute' => 'ttl',
    'ttl' => 60 * 60 * 24 * 7, // 7 days...
],
```

<a name="queueing-closures"></a>
## Đưa Closure vào hàng đợi

Thay vì dispatch một lớp job vào hàng đợi, bạn cũng có thể dispatch một closure. Cách này phù hợp với các tác vụ nhanh, đơn giản cần được thực thi bên ngoài chu kỳ request hiện tại. Khi dispatch closure vào hàng đợi, nội dung mã của closure được ký bằng mật mã để không thể bị thay đổi trong quá trình truyền:

```php
use App\Models\Podcast;

$podcast = Podcast::find(1);

dispatch(function () use ($podcast) {
    $podcast->publish();
});
```

Để gán tên cho queued closure, tên này có thể được các dashboard báo cáo queue sử dụng và cũng được hiển thị bởi lệnh `queue:work`, bạn có thể dùng phương thức `name`:

```php
dispatch(function () {
    // ...
})->name('Publish Podcast');
```

Thông qua phương thức `catch`, bạn có thể cung cấp một closure sẽ được thực thi nếu queued closure không thể hoàn tất thành công sau khi đã dùng hết số lần [retry được cấu hình](#max-job-attempts-and-timeout) của queue:

```php
use Throwable;

dispatch(function () use ($podcast) {
    $podcast->publish();
})->catch(function (Throwable $e) {
    // This job has failed...
});
```

> [!WARNING]
> Vì các callback `catch` được serialize và được Laravel queue thực thi vào thời điểm sau đó, bạn không nên sử dụng biến `$this` bên trong callback `catch`.

<a name="running-the-queue-worker"></a>
## Chạy Queue Worker

<a name="the-queue-work-command"></a>
### Lệnh `queue:work`

Laravel cung cấp một lệnh Artisan để khởi động queue worker và xử lý các job mới khi chúng được đẩy vào queue. Bạn có thể chạy worker bằng lệnh Artisan `queue:work`. Lưu ý rằng sau khi `queue:work` được khởi động, tiến trình sẽ tiếp tục chạy cho đến khi bạn dừng thủ công hoặc đóng terminal:

```shell
php artisan queue:work
```

> [!NOTE]
> Để giữ tiến trình `queue:work` chạy thường trực trong nền, bạn nên sử dụng một process monitor như [Supervisor](#supervisor-configuration) để đảm bảo queue worker không bị dừng.

Bạn có thể thêm cờ `-v` khi gọi lệnh `queue:work` nếu muốn output của lệnh bao gồm ID của các job đã xử lý, tên connection và tên queue:

```shell
php artisan queue:work -v
```

Hãy nhớ rằng queue worker là tiến trình sống lâu và lưu trạng thái ứng dụng đã boot trong bộ nhớ. Vì vậy, sau khi được khởi động, chúng sẽ không nhận biết các thay đổi trong codebase. Do đó, trong quá trình deploy, hãy bảo đảm [khởi động lại queue worker](#queue-workers-and-deployment). Ngoài ra, mọi trạng thái static do ứng dụng tạo hoặc thay đổi sẽ không tự động được reset giữa các job.

Ngoài ra, bạn có thể chạy lệnh `queue:listen`. Khi sử dụng `queue:listen`, bạn không cần tự khởi động lại worker khi muốn nạp lại code đã cập nhật hoặc reset trạng thái ứng dụng; tuy nhiên, lệnh này kém hiệu quả đáng kể so với `queue:work`:

```shell
php artisan queue:listen
```

<a name="running-multiple-queue-workers"></a>
#### Chạy nhiều Queue Worker

Để gán nhiều worker cho một queue và xử lý job đồng thời, bạn chỉ cần khởi động nhiều tiến trình `queue:work`. Ở local, bạn có thể thực hiện bằng nhiều tab terminal; trong production, hãy dùng cấu hình của process manager. [Khi sử dụng Supervisor](#supervisor-configuration), bạn có thể dùng giá trị cấu hình `numprocs`.

<a name="specifying-the-connection-queue"></a>
#### Chỉ định Connection và Queue

Bạn cũng có thể chỉ định queue connection mà worker sẽ sử dụng. Tên connection truyền cho lệnh `work` phải tương ứng với một trong các connection được định nghĩa trong file cấu hình `config/queue.php`:

```shell
php artisan queue:work redis
```

Mặc định, lệnh `queue:work` chỉ xử lý job của queue mặc định trên connection đã chọn. Tuy nhiên, bạn có thể tùy chỉnh worker để chỉ xử lý một số queue cụ thể trên connection đó. Ví dụ, nếu toàn bộ email được xử lý trong queue `emails` của connection `redis`, bạn có thể chạy lệnh sau để khởi động worker chỉ xử lý queue này:

```shell
php artisan queue:work redis --queue=emails
```

<a name="processing-a-specified-number-of-jobs"></a>
#### Xử lý một số lượng Job xác định

Tùy chọn `--once` có thể được dùng để yêu cầu worker chỉ xử lý một job duy nhất từ queue:

```shell
php artisan queue:work --once
```

Tùy chọn `--max-jobs` có thể được dùng để yêu cầu worker xử lý một số lượng job nhất định rồi thoát. Tùy chọn này hữu ích khi kết hợp với [Supervisor](#supervisor-configuration), nhờ đó worker được tự động khởi động lại sau khi xử lý đủ số job và giải phóng phần bộ nhớ có thể đã tích lũy:

```shell
php artisan queue:work --max-jobs=1000
```

<a name="processing-all-queued-jobs-then-exiting"></a>
#### Xử lý toàn bộ Job trong Queue rồi thoát

Tùy chọn `--stop-when-empty` có thể được dùng để yêu cầu worker xử lý toàn bộ job rồi thoát một cách an toàn. Tùy chọn này hữu ích khi xử lý Laravel queue trong Docker container và bạn muốn tắt container sau khi queue đã trống:

```shell
php artisan queue:work --stop-when-empty
```

<a name="processing-jobs-for-a-given-number-of-seconds"></a>
#### Xử lý Job trong một khoảng thời gian xác định

Tùy chọn `--max-time` có thể được dùng để yêu cầu worker xử lý job trong số giây xác định rồi thoát. Khi kết hợp với [Supervisor](#supervisor-configuration), worker có thể được tự động khởi động lại sau khoảng thời gian đó để giải phóng bộ nhớ đã tích lũy:

```shell
# Process jobs for one hour and then exit...
php artisan queue:work --max-time=3600
```

<a name="worker-sleep-duration"></a>
#### Thời gian Sleep của Worker

Khi queue có job, worker sẽ liên tục xử lý mà không trì hoãn giữa các job. Tuy nhiên, tùy chọn `sleep` xác định số giây worker sẽ "sleep" khi không có job. Trong thời gian sleep, worker sẽ không xử lý job mới:

```shell
php artisan queue:work --sleep=3
```

<a name="maintenance-mode-queues"></a>
#### Maintenance Mode và Queue

Trong khi ứng dụng ở [maintenance mode](/configuration#maintenance-mode), các queued job sẽ không được xử lý. Khi ứng dụng thoát maintenance mode, các job sẽ tiếp tục được xử lý bình thường.

Để buộc queue worker xử lý job ngay cả khi maintenance mode đang bật, bạn có thể dùng tùy chọn `--force`:

```shell
php artisan queue:work --force
```

<a name="resource-considerations"></a>
#### Lưu ý về tài nguyên

Queue worker dạng daemon không "reboot" framework trước khi xử lý từng job. Vì vậy, bạn nên giải phóng các tài nguyên nặng sau khi mỗi job hoàn tất. Ví dụ, nếu đang [xử lý ảnh](/images) bằng [thư viện GD](https://www.php.net/manual/en/book.image.php), bạn nên giải phóng bộ nhớ bằng `imagedestroy` sau khi xử lý ảnh xong.

<a name="queue-priorities"></a>
### Độ ưu tiên của Queue

Đôi khi bạn muốn ưu tiên thứ tự xử lý các queue. Ví dụ, trong `config/queue.php`, bạn có thể đặt `queue` mặc định của connection `redis` là `low`, nhưng đôi lúc muốn đẩy một job vào queue ưu tiên cao `high` như sau:

```php
dispatch((new Job)->onQueue('high'));
```

Để khởi động worker bảo đảm toàn bộ job trong queue `high` được xử lý trước khi tiếp tục với job trong queue `low`, hãy truyền danh sách tên queue phân tách bằng dấu phẩy cho lệnh `work`:

```shell
php artisan queue:work --queue=high,low
```

<a name="queue-workers-and-deployment"></a>
### Queue Worker và Deployment

Vì queue worker là tiến trình sống lâu, chúng sẽ không nhận biết thay đổi code nếu không được khởi động lại. Do đó, cách đơn giản nhất khi deploy ứng dụng sử dụng queue worker là restart worker trong quá trình deployment. Bạn có thể restart an toàn toàn bộ worker bằng lệnh `queue:restart`:

```shell
php artisan queue:restart
```

Lệnh này yêu cầu toàn bộ queue worker thoát an toàn sau khi xử lý xong job hiện tại để không làm mất job đang có. Vì worker sẽ thoát khi `queue:restart` được thực thi, bạn nên chạy một process manager như [Supervisor](#supervisor-configuration) để tự động khởi động lại queue worker.

> [!NOTE]
> Queue dùng [cache](/cache) để lưu restart signal, vì vậy hãy kiểm tra cache driver đã được cấu hình đúng cho ứng dụng trước khi dùng tính năng này.

<a name="reacting-to-worker-signals"></a>
### Phản ứng với tín hiệu của Worker

Khi queue worker nhận tín hiệu kết thúc như `SIGQUIT`, `SIGTERM` hoặc `SIGINT` trong lúc đang xử lý job, worker sẽ hoàn tất job hiện tại trước khi thoát. Tuy nhiên, job của bạn có thể cần phản ứng với tín hiệu trước khi tiến trình bị server hoặc trình điều phối container dừng lại. Ví dụ, một job import chạy lâu có thể cần ngừng lấy thêm bản ghi mới và lưu lại tiến độ hiện tại.

Để phản ứng với tín hiệu của worker ngay bên trong job, hãy implement interface `Illuminate\Contracts\Queue\Interruptible` và định nghĩa phương thức `interrupted` trên job. Số hiệu tín hiệu mà worker nhận được sẽ được truyền vào phương thức `interrupted`:

```php
<?php

namespace App\Jobs;

use App\Models\Import;
use Illuminate\Contracts\Queue\Interruptible;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ImportProducts implements ShouldQueue, Interruptible
{
    use Queueable;

    protected bool $shouldStop = false;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Import $import,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        foreach ($this->import->pendingRows() as $row) {
            if ($this->shouldStop) {
                break;
            }

            // Import the product row...
        }

        $this->import->saveProgress();
    }

    /**
     * Handle a signal received by the queue worker.
     */
    public function interrupted(int $signal): void
    {
        $this->shouldStop = true;
    }
}
```

Phương thức `interrupted` chỉ được gọi khi worker nhận tín hiệu tiến trình trong lúc job đang chạy. Nó không thay thế cho [timeout](#worker-timeouts) hoặc [`failed` method](#cleaning-up-after-failed-jobs) của job.

<a name="job-expirations-and-timeouts"></a>
### Thời hạn và Timeout của Job

<a name="job-expiration"></a>
#### Thời hạn của Job

Trong file cấu hình `config/queue.php`, mỗi queue connection định nghĩa tùy chọn `retry_after`. Tùy chọn này xác định số giây queue connection sẽ chờ trước khi thử lại một job đang được xử lý. Ví dụ, nếu `retry_after` là `90`, job sẽ được đưa trở lại queue nếu đã được xử lý trong 90 giây mà chưa được release hoặc delete. Thông thường, bạn nên đặt `retry_after` bằng số giây tối đa hợp lý mà các job cần để xử lý xong.

> [!WARNING]
> Queue connection duy nhất không có value `retry_after` là Amazon SQS. SQS sẽ retry job dựa trên [Default Visibility Timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/AboutVT.html) được quản lý trong AWS console.

<a name="worker-timeouts"></a>
#### Timeout của Worker

Lệnh Artisan `queue:work` cung cấp tùy chọn `--timeout`. Mặc định, `--timeout` là 60 giây. Nếu một job được xử lý lâu hơn số giây được chỉ định bởi timeout, worker đang xử lý job sẽ thoát với lỗi. Thông thường, worker sẽ tự động được khởi động lại bởi [process manager được cấu hình trên server](#supervisor-configuration):

```shell
php artisan queue:work --timeout=60
```

Tùy chọn cấu hình `retry_after` và tùy chọn CLI `--timeout` có mục đích khác nhau, nhưng phối hợp với nhau để bảo đảm job không bị thất lạc và mỗi job chỉ được xử lý thành công một lần.

> [!WARNING]
> Value `--timeout` luôn nên ngắn hơn value cấu hình `retry_after` ít nhất vài giây. Điều này bảo đảm worker đang xử lý job bị treo sẽ luôn bị terminate trước khi job được retry. Nếu option `--timeout` dài hơn `retry_after`, job có thể bị xử lý hai lần.

<a name="pausing-and-resuming-queue-workers"></a>
### Tạm dừng và tiếp tục Queue Worker

Đôi khi bạn cần tạm thời ngăn queue worker xử lý job mới mà không dừng hẳn worker. Ví dụ, bạn có thể muốn tạm dừng xử lý job trong thời gian bảo trì hệ thống. Laravel cung cấp các lệnh Artisan `queue:pause` và `queue:continue` để tạm dừng và tiếp tục queue worker.

Để tạm dừng một queue cụ thể, hãy cung cấp tên queue connection và tên queue:

```shell
php artisan queue:pause database:default
```

Trong ví dụ này, `database` là tên queue connection và `default` là tên queue. Khi queue bị tạm dừng, các worker đang xử lý job từ queue đó vẫn hoàn tất job hiện tại nhưng sẽ không nhận job mới cho đến khi queue được tiếp tục.

Để tạm dừng xử lý job cho mọi queue trên mọi connection, hãy dùng tùy chọn `--all`:

```shell
php artisan queue:pause --all
```

Để tiếp tục xử lý job trên một queue đang tạm dừng, hãy dùng lệnh `queue:continue`:

```shell
php artisan queue:continue database:default
```

Để tiếp tục xử lý job cho mọi queue trên mọi connection, hãy dùng tùy chọn `--all` với lệnh `queue:resume`:

```shell
php artisan queue:resume --all
```

Sau khi tiếp tục một queue, worker sẽ bắt đầu xử lý ngay các job mới từ queue đó. Việc tiếp tục tất cả queue không tiếp tục những queue đã được tạm dừng riêng lẻ. Lưu ý rằng tạm dừng queue không dừng chính tiến trình worker; thao tác này chỉ ngăn worker xử lý job mới từ queue được chỉ định.

<a name="worker-restart-and-pause-signals"></a>
#### Tín hiệu khởi động lại và tạm dừng Worker

Mặc định, queue worker thăm dò cache driver để tìm tín hiệu restart và pause ở mỗi vòng xử lý job. Việc thăm dò này cần thiết để phản hồi các lệnh `queue:restart` và `queue:pause`, nhưng cũng tạo ra một lượng overhead hiệu năng nhỏ.

Nếu cần tối ưu hiệu năng và không cần các tính năng ngắt này, bạn có thể vô hiệu hóa việc thăm dò trên toàn ứng dụng bằng cách gọi phương thức `withoutInterruptionPolling` trên facade `Queue`. Thông thường, thao tác này nên được thực hiện trong phương thức `boot` của `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Queue;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Queue::withoutInterruptionPolling();
}
```

Ngoài ra, bạn có thể vô hiệu hóa riêng việc thăm dò restart hoặc pause bằng cách đặt các property static `$restartable` hoặc `$pausable` trên class `Illuminate\Queue\Worker`:

```php
use Illuminate\Queue\Worker;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Worker::$restartable = false;
    Worker::$pausable = false;
}
```

> [!WARNING]
> Khi interruption polling bị tắt, worker sẽ không phản hồi command `queue:restart` hoặc `queue:pause`, tùy feature nào đã bị disable.

<a name="supervisor-configuration"></a>
## Cấu hình Supervisor

Trong production, bạn cần một cơ chế giữ các process `queue:work` luôn chạy. Process `queue:work` có thể dừng vì nhiều lý do, chẳng hạn worker vượt timeout hoặc command `queue:restart` được thực thi.

Vì vậy, bạn cần cấu hình process monitor có thể phát hiện khi process `queue:work` thoát và tự động restart chúng. Process monitor cũng cho phép bạn chỉ định số lượng process `queue:work` chạy đồng thời. Supervisor là process monitor thường dùng trên Linux và phần sau sẽ trình bày cách cấu hình.

<a name="installing-supervisor"></a>
#### Cài đặt Supervisor

Supervisor là process monitor cho hệ điều hành Linux và sẽ tự động restart process `queue:work` nếu chúng bị lỗi. Để cài Supervisor trên Ubuntu, bạn có thể dùng command sau:

```shell
sudo apt-get install supervisor
```

> [!NOTE]
> Nếu việc tự cấu hình và quản lý Supervisor quá phức tạp, hãy cân nhắc dùng [Laravel Cloud](https://cloud.laravel.com), nền tảng managed hoàn toàn để chạy Laravel queue worker.

<a name="configuring-supervisor"></a>
#### Cấu hình Supervisor

File cấu hình Supervisor thường nằm trong directory `/etc/supervisor/conf.d`. Trong directory này, bạn có thể tạo nhiều file cấu hình để chỉ dẫn Supervisor cách monitor process. Ví dụ, hãy tạo file `laravel-worker.conf` để khởi chạy và monitor các process `queue:work`:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/forge/app.com/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=forge
numprocs=8
redirect_stderr=true
stdout_logfile=/home/forge/app.com/worker.log
stopwaitsecs=3600
```

Trong ví dụ này, directive `numprocs` yêu cầu Supervisor chạy tám process `queue:work`, monitor tất cả và tự động restart nếu chúng bị lỗi. Bạn nên thay đổi directive `command` trong cấu hình để phản ánh queue connection và worker option mong muốn.

> [!WARNING]
> Hãy bảo đảm value `stopwaitsecs` lớn hơn số giây mà job chạy lâu nhất của bạn cần. Nếu không, Supervisor có thể kill job trước khi job xử lý xong.

<a name="starting-supervisor"></a>
#### Khởi động Supervisor

Sau khi tạo file cấu hình, bạn có thể cập nhật cấu hình Supervisor và khởi động các tiến trình bằng các lệnh sau:

```shell
sudo supervisorctl reread

sudo supervisorctl update

sudo supervisorctl start "laravel-worker:*"
```

Để biết thêm thông tin về Supervisor, hãy tham khảo [tài liệu Supervisor](http://supervisord.org/index.html).

<a name="dealing-with-failed-jobs"></a>
## Xử lý Job thất bại

Đôi khi các job trong queue sẽ thất bại. Laravel cung cấp một cách thuận tiện để [chỉ định số lần tối đa một job được phép thử](#max-job-attempts-and-timeout). Sau khi một job bất đồng bộ vượt quá số lần thử này, nó sẽ được ghi vào bảng `failed_jobs` trong cơ sở dữ liệu. Các [job được dispatch đồng bộ](/queues#synchronous-dispatching) bị lỗi sẽ không được lưu trong bảng này và exception của chúng được ứng dụng xử lý ngay lập tức.

Migration để tạo bảng `failed_jobs` thường đã có sẵn trong các ứng dụng Laravel mới. Tuy nhiên, nếu ứng dụng của bạn chưa có migration cho bảng này, bạn có thể dùng lệnh `make:queue-failed-table` để tạo migration:

```shell
php artisan make:queue-failed-table

php artisan migrate
```

Khi chạy tiến trình [queue worker](#running-the-queue-worker), bạn có thể chỉ định số lần tối đa một job được phép thử bằng tùy chọn `--tries` của lệnh `queue:work`. Nếu không chỉ định giá trị cho `--tries`, job chỉ được thử một lần hoặc theo số lần được chỉ định bởi attribute `Tries` của class job:

```shell
php artisan queue:work redis --tries=3
```

Bằng option `--backoff`, bạn có thể chỉ định số giây Laravel chờ trước khi retry một job gặp exception. Mặc định, job được release trở lại queue ngay để có thể được attempt lại:

```shell
php artisan queue:work redis --tries=3 --backoff=3
```

Nếu muốn cấu hình riêng cho từng job số giây Laravel cần chờ trước khi thử lại một job gặp exception, bạn có thể dùng attribute `Backoff` trên class job:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\Backoff;

#[Backoff(3)]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

Nếu cần logic phức tạp hơn để xác định thời gian backoff của job, bạn có thể định nghĩa phương thức `backoff` trên class job:

```php
/**
 * Calculate the number of seconds to wait before retrying the job.
 */
public function backoff(): int
{
    return 3;
}
```

Bạn có thể dễ dàng cấu hình backoff kiểu "exponential" bằng cách định nghĩa một mảng các giá trị backoff. Trong ví dụ này, độ trễ retry là 1 giây cho lần retry đầu tiên, 5 giây cho lần thứ hai, 10 giây cho lần thứ ba và 10 giây cho mỗi lần retry tiếp theo nếu vẫn còn lượt thử:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\Backoff;

#[Backoff([1, 5, 10])]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

<a name="cleaning-up-after-failed-jobs"></a>
### Dọn dẹp sau khi Job thất bại

Khi một job cụ thể thất bại, bạn có thể muốn gửi cảnh báo cho người dùng hoặc hoàn tác những thao tác mà job mới thực hiện một phần. Để làm điều này, bạn có thể định nghĩa phương thức `failed` trên class job. Instance `Throwable` khiến job thất bại sẽ được truyền vào phương thức `failed`:

```php
<?php

namespace App\Jobs;

use App\Models\Podcast;
use App\Services\AudioProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Podcast $podcast,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AudioProcessor $processor): void
    {
        // Process uploaded podcast...
    }

    /**
     * Handle a job failure.
     */
    public function failed(?Throwable $exception): void
    {
        // Send user notification of failure, etc...
    }
}
```

> [!WARNING]
> Một instance mới của job được khởi tạo trước khi method `failed` được gọi; vì vậy mọi thay đổi property của class đã xảy ra trong method `handle` sẽ bị mất.

Một job thất bại không nhất thiết phải là job gặp exception chưa được xử lý. Job cũng có thể được xem là thất bại khi đã dùng hết số lần thử được phép. Các lượt thử này có thể bị tiêu thụ theo nhiều cách:

<div class="content-list" markdown="1">

- Job bị timeout.
- Job gặp một exception chưa được xử lý trong quá trình thực thi.
- Job được đưa trở lại queue theo cách thủ công hoặc bởi middleware.

</div>

Nếu lần thử cuối cùng thất bại do exception được ném ra trong quá trình thực thi job, exception đó sẽ được truyền vào phương thức `failed` của job. Tuy nhiên, nếu job thất bại vì đã đạt số lần thử tối đa được phép, `$exception` sẽ là một instance của `Illuminate\Queue\MaxAttemptsExceededException`. Tương tự, nếu job thất bại do vượt quá timeout đã cấu hình, `$exception` sẽ là một instance của `Illuminate\Queue\TimeoutExceededException`.

<a name="retrying-failed-jobs"></a>
### Thử lại Job thất bại

Để xem tất cả job thất bại đã được ghi vào bảng `failed_jobs`, bạn có thể dùng lệnh Artisan `queue:failed`:

```shell
php artisan queue:failed
```

Lệnh `queue:failed` sẽ liệt kê ID của job, connection, queue, thời điểm thất bại và các thông tin khác về job. Bạn có thể dùng ID của job để retry job thất bại. Ví dụ, để retry một job thất bại có ID `ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece`, hãy chạy lệnh sau:

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece
```

Nếu cần, bạn có thể truyền nhiều ID cho lệnh:

```shell
php artisan queue:retry ce7bb17c-cdd8-41f0-a8ec-7b4fef4e5ece 91401d2c-0784-4f43-824c-34f94a33c24d
```

Bạn cũng có thể retry tất cả job thất bại của một queue cụ thể:

```shell
php artisan queue:retry --queue=name
```

Để retry tất cả job thất bại, hãy chạy lệnh `queue:retry` và truyền `all` làm ID:

```shell
php artisan queue:retry all
```

Nếu muốn xóa một job thất bại, bạn có thể dùng lệnh `queue:forget`:

```shell
php artisan queue:forget 91401d2c-0784-4f43-824c-34f94a33c24d
```

> [!NOTE]
> Khi dùng [Horizon](/horizon), bạn nên dùng command `horizon:forget` để xóa failed job thay vì command `queue:forget`.

Để xóa tất cả job thất bại khỏi bảng `failed_jobs`, bạn có thể dùng lệnh `queue:flush`:

```shell
php artisan queue:flush
```

Lệnh `queue:flush` xóa tất cả bản ghi job thất bại khỏi queue bất kể job đã thất bại bao lâu. Bạn có thể dùng tùy chọn `--hours` để chỉ xóa những job đã thất bại từ một số giờ nhất định trở về trước:

```shell
php artisan queue:flush --hours=48
```

<a name="ignoring-missing-models"></a>
### Ignoring Missing Models

Khi inject một Eloquent model vào job, model sẽ tự động được serialize trước khi đưa vào queue và được truy xuất lại từ cơ sở dữ liệu khi job được xử lý. Tuy nhiên, nếu model đã bị xóa trong lúc job chờ worker xử lý, job có thể thất bại với `ModelNotFoundException`.

Để thuận tiện, bạn có thể chọn tự động xóa job có model bị thiếu bằng attribute `DeleteWhenMissingModels` trên job class. Khi attribute này có mặt, Laravel sẽ âm thầm discard job mà không throw exception:

```php
<?php

namespace App\Jobs;

use Illuminate\Queue\Attributes\DeleteWhenMissingModels;

#[DeleteWhenMissingModels]
class ProcessPodcast implements ShouldQueue
{
    // ...
}
```

<a name="pruning-failed-jobs"></a>
### Dọn các Job thất bại cũ

Bạn có thể dọn các bản ghi trong bảng `failed_jobs` của ứng dụng bằng lệnh Artisan `queue:prune-failed`:

```shell
php artisan queue:prune-failed
```

Theo mặc định, mọi bản ghi job thất bại cũ hơn 24 giờ sẽ được dọn. Nếu truyền tùy chọn `--hours`, chỉ các bản ghi job thất bại được thêm trong N giờ gần nhất mới được giữ lại. Ví dụ, lệnh sau sẽ xóa mọi bản ghi job thất bại được thêm cách đây hơn 48 giờ:

```shell
php artisan queue:prune-failed --hours=48
```

<a name="storing-failed-jobs-in-dynamodb"></a>
### Lưu Job thất bại trong DynamoDB

Laravel cũng hỗ trợ lưu các bản ghi job thất bại trong [DynamoDB](https://aws.amazon.com/dynamodb) thay vì một bảng cơ sở dữ liệu quan hệ. Tuy nhiên, bạn phải tự tạo bảng DynamoDB để lưu tất cả bản ghi job thất bại. Thông thường bảng này nên có tên `failed_jobs`, nhưng bạn nên đặt tên theo giá trị cấu hình `queue.failed.table` trong file cấu hình `queue` của ứng dụng.

Bảng `failed_jobs` cần có primary partition key kiểu chuỗi tên `application` và primary sort key kiểu chuỗi tên `uuid`. Phần `application` của key chứa tên ứng dụng như được định nghĩa bởi giá trị cấu hình `name` trong file cấu hình `app`. Vì tên ứng dụng là một phần của key trong bảng DynamoDB, bạn có thể dùng cùng một bảng để lưu job thất bại cho nhiều ứng dụng Laravel.

Ngoài ra, hãy bảo đảm đã cài AWS SDK để ứng dụng Laravel có thể giao tiếp với Amazon DynamoDB:

```shell
composer require aws/aws-sdk-php
```

Tiếp theo, đặt option cấu hình `queue.failed.driver` thành `dynamodb`. Ngoài ra, bạn nên khai báo các option `key`, `secret` và `region` trong mảng cấu hình failed job; các option này được dùng để xác thực với AWS. Khi dùng driver `dynamodb`, option `queue.failed.database` không cần thiết:

```php
'failed' => [
    'driver' => env('QUEUE_FAILED_DRIVER', 'dynamodb'),
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'table' => 'failed_jobs',
],
```

<a name="disabling-failed-job-storage"></a>
### Vô hiệu hóa việc lưu Job thất bại

Bạn có thể yêu cầu Laravel loại bỏ job thất bại mà không lưu chúng bằng cách đặt tùy chọn cấu hình `queue.failed.driver` thành `null`. Thông thường có thể thực hiện điều này qua biến môi trường `QUEUE_FAILED_DRIVER`:

```ini
QUEUE_FAILED_DRIVER=null
```

<a name="failed-job-events"></a>
### Event của Job thất bại

Nếu muốn đăng ký event listener được gọi khi một job thất bại, bạn có thể dùng phương thức `failing` của facade `Queue`. Ví dụ, chúng ta có thể gắn một closure vào event này từ phương thức `boot` của `AppServiceProvider` đi kèm Laravel:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobFailed;

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
        Queue::failing(function (JobFailed $event) {
            // $event->connectionName
            // $event->job
            // $event->exception
        });
    }
}
```

<a name="clearing-jobs-from-queues"></a>
## Xóa Job khỏi Queue

> [!NOTE]
> Khi dùng [Horizon](/horizon), bạn nên dùng command `horizon:clear` để xóa job khỏi queue thay vì command `queue:clear`.

Nếu muốn xóa tất cả job khỏi queue mặc định của connection mặc định, bạn có thể dùng lệnh Artisan `queue:clear`:

```shell
php artisan queue:clear
```

Bạn cũng có thể cung cấp đối số `connection` và tùy chọn `queue` để xóa job khỏi một connection và queue cụ thể:

```shell
php artisan queue:clear redis --queue=emails
```

> [!WARNING]
> Việc clear job khỏi queue chỉ khả dụng cho queue driver SQS, Redis và database. Ngoài ra, quá trình xóa message của SQS có thể mất tới 60 giây, vì vậy job được gửi vào SQS queue trong vòng 60 giây sau khi clear queue cũng có thể bị xóa.

<a name="monitoring-your-queues"></a>
## Giám sát Queue

Nếu queue đột ngột nhận một lượng lớn job, nó có thể bị quá tải và khiến thời gian chờ job hoàn thành kéo dài. Nếu muốn, Laravel có thể cảnh báo khi số lượng job trong queue vượt quá một ngưỡng đã chỉ định.

Để bắt đầu, bạn nên lên lịch cho lệnh `queue:monitor` [chạy mỗi phút](/scheduling). Lệnh nhận tên các queue bạn muốn giám sát cùng ngưỡng số lượng job mong muốn:

```shell
php artisan queue:monitor redis:default,redis:deployments --max=100
```

Chỉ schedule command này là chưa đủ để kích hoạt notification cảnh báo queue đang bị quá tải. Khi command phát hiện một queue có số job vượt threshold, event `Illuminate\Queue\Events\QueueBusy` sẽ được dispatch. Bạn có thể listen event này trong `AppServiceProvider` để gửi notification cho chính mình hoặc development team:

```php
use App\Notifications\QueueHasLongWaitTime;
use Illuminate\Queue\Events\QueueBusy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(function (QueueBusy $event) {
        Notification::route('mail', 'dev@example.com')
            ->notify(new QueueHasLongWaitTime(
                $event->connectionName,
                $event->queue,
                $event->size
            ));
    });
}
```

<a name="testing"></a>
## Kiểm thử

Khi kiểm thử code dispatch job, bạn có thể muốn Laravel không thực sự thực thi job, vì code của job có thể được kiểm thử trực tiếp và tách biệt với code dispatch nó. Để kiểm thử chính job, bạn có thể khởi tạo instance của job và gọi trực tiếp phương thức `handle` trong test.

Bạn có thể dùng phương thức `fake` của facade `Queue` để ngăn các queued job thực sự được đẩy vào queue. Sau khi gọi `Queue::fake`, bạn có thể assert rằng ứng dụng đã cố gắng đẩy job vào queue:

```php tab=Pest
<?php

use App\Jobs\AnotherJob;
use App\Jobs\ShipOrder;
use Illuminate\Support\Facades\Queue;

test('orders can be shipped', function () {
    Queue::fake();

    // Perform order shipping...

    // Assert that no jobs were pushed...
    Queue::assertNothingPushed();

    // Assert a job was pushed to a given queue...
    Queue::assertPushedOn('queue-name', ShipOrder::class);

    // Assert a job was pushed
    Queue::assertPushed(ShipOrder::class);

    // Assert a job was pushed exactly once...
    Queue::assertPushedOnce(ShipOrder::class);

    // Assert a job was pushed twice...
    Queue::assertPushedTimes(ShipOrder::class, 2);

    // Assert a job was not pushed...
    Queue::assertNotPushed(AnotherJob::class);

    // Assert that a closure was pushed to the queue...
    Queue::assertClosurePushed();

    // Assert that a closure was not pushed...
    Queue::assertClosureNotPushed();

    // Assert the total number of jobs that were pushed...
    Queue::assertCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Jobs\AnotherJob;
use App\Jobs\ShipOrder;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Queue::fake();

        // Perform order shipping...

        // Assert that no jobs were pushed...
        Queue::assertNothingPushed();

        // Assert a job was pushed to a given queue...
        Queue::assertPushedOn('queue-name', ShipOrder::class);

        // Assert a job was pushed
        Queue::assertPushed(ShipOrder::class);

        // Assert a job was pushed exactly once...
        Queue::assertPushedOnce(ShipOrder::class);

        // Assert a job was pushed twice...
        Queue::assertPushedTimes(ShipOrder::class, 2);

        // Assert a job was not pushed...
        Queue::assertNotPushed(AnotherJob::class);

        // Assert that a closure was pushed to the queue...
        Queue::assertClosurePushed();

        // Assert that a closure was not pushed...
        Queue::assertClosureNotPushed();

        // Assert the total number of jobs that were pushed...
        Queue::assertCount(3);
    }
}
```

Bạn có thể truyền closure cho các phương thức `assertPushed`, `assertNotPushed`, `assertClosurePushed` hoặc `assertClosureNotPushed` để assert rằng một job thỏa điều kiện kiểm tra đã được đẩy. Nếu có ít nhất một job được đẩy thỏa điều kiện đó, assertion sẽ thành công:

```php
use Illuminate\Queue\CallQueuedClosure;

Queue::assertPushed(function (ShipOrder $job) use ($order) {
    return $job->order->id === $order->id;
});

Queue::assertClosurePushed(function (CallQueuedClosure $job) {
    return $job->name === 'validate-order';
});
```

<a name="faking-a-subset-of-jobs"></a>
### Fake một tập con Job

Nếu chỉ cần fake một số job cụ thể trong khi vẫn cho phép các job khác thực thi bình thường, bạn có thể truyền tên class của các job cần fake vào phương thức `fake`:

```php tab=Pest
test('orders can be shipped', function () {
    Queue::fake([
        ShipOrder::class,
    ]);

    // Perform order shipping...

    // Assert a job was pushed twice...
    Queue::assertPushedTimes(ShipOrder::class, 2);
});
```

```php tab=PHPUnit
public function test_orders_can_be_shipped(): void
{
    Queue::fake([
        ShipOrder::class,
    ]);

    // Perform order shipping...

    // Assert a job was pushed twice...
    Queue::assertPushedTimes(ShipOrder::class, 2);
}
```

Bạn có thể fake tất cả job ngoại trừ một tập job được chỉ định bằng phương thức `except`:

```php
Queue::fake()->except([
    ShipOrder::class,
]);
```

<a name="testing-job-chains"></a>
### Kiểm thử Job Chains

Để kiểm thử job chain, bạn cần sử dụng khả năng fake của facade `Bus`. Phương thức `assertChained` của facade `Bus` có thể dùng để assert rằng một [chuỗi job](/queues#job-chaining) đã được dispatch. `assertChained` nhận một mảng các chained job làm đối số đầu tiên:

```php
use App\Jobs\RecordShipment;
use App\Jobs\ShipOrder;
use App\Jobs\UpdateInventory;
use Illuminate\Support\Facades\Bus;

Bus::fake();

// ...

Bus::assertChained([
    ShipOrder::class,
    RecordShipment::class,
    UpdateInventory::class
]);
```

Như bạn thấy trong ví dụ trên, mảng chained job có thể là mảng class name của job. Tuy nhiên, bạn cũng có thể truyền mảng job instance thực tế. Khi đó Laravel sẽ bảo đảm các job instance cùng class và có cùng property value như các chained job do ứng dụng dispatch:

```php
Bus::assertChained([
    new ShipOrder,
    new RecordShipment,
    new UpdateInventory,
]);
```

Bạn có thể dùng phương thức `assertDispatchedWithoutChain` để assert rằng một job được đẩy mà không kèm chain job:

```php
Bus::assertDispatchedWithoutChain(ShipOrder::class);
```

<a name="testing-chain-modifications"></a>
#### Kiểm thử Chain Modifications

Nếu một chained job [thêm job vào đầu hoặc cuối chain hiện có](#adding-jobs-to-the-chain), bạn có thể dùng phương thức `assertHasChain` của job để assert rằng job có chain các job còn lại như mong đợi:

```php
$job = new ProcessPodcast;

$job->handle();

$job->assertHasChain([
    new TranscribePodcast,
    new OptimizePodcast,
    new ReleasePodcast,
]);
```

Phương thức `assertDoesntHaveChain` có thể dùng để assert rằng chain còn lại của job là rỗng:

```php
$job->assertDoesntHaveChain();
```

<a name="testing-chained-batches"></a>
#### Kiểm thử Chained Batches

Nếu job chain [chứa một batch job](#chains-and-batches), bạn có thể assert chained batch khớp với mong đợi bằng cách chèn định nghĩa `Bus::chainedBatch` vào assertion của chain:

```php
use App\Jobs\ShipOrder;
use App\Jobs\UpdateInventory;
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

Bus::assertChained([
    new ShipOrder,
    Bus::chainedBatch(function (PendingBatch $batch) {
        return $batch->jobs->count() === 3;
    }),
    new UpdateInventory,
]);
```

<a name="testing-job-batches"></a>
### Kiểm thử Job Batches

Phương thức `assertBatched` của facade `Bus` có thể dùng để assert rằng một [batch job](/queues#job-batching) đã được dispatch. Closure truyền cho `assertBatched` nhận một instance `Illuminate\Bus\PendingBatch`, có thể dùng để kiểm tra các job trong batch:

```php
use Illuminate\Bus\PendingBatch;
use Illuminate\Support\Facades\Bus;

Bus::fake();

// ...

Bus::assertBatched(function (PendingBatch $batch) {
    return $batch->name == 'Import CSV' &&
           $batch->jobs->count() === 10;
});
```

Có thể dùng phương thức `hasJobs` trên pending batch để xác minh batch chứa các job mong đợi. Phương thức nhận một mảng instance job, tên class hoặc closure:

```php
Bus::assertBatched(function (PendingBatch $batch) {
    return $batch->hasJobs([
        new ProcessCsvRow(row: 1),
        new ProcessCsvRow(row: 2),
        new ProcessCsvRow(row: 3),
    ]);
});
```

Khi dùng closure, closure sẽ nhận instance của job. Kiểu job mong đợi được suy luận từ type hint của closure:

```php
Bus::assertBatched(function (PendingBatch $batch) {
    return $batch->hasJobs([
        fn (ProcessCsvRow $job) => $job->row === 1,
        fn (ProcessCsvRow $job) => $job->row === 2,
        fn (ProcessCsvRow $job) => $job->row === 3,
    ]);
});
```

Bạn có thể dùng phương thức `assertBatchCount` để assert rằng một số lượng batch nhất định đã được dispatch:

```php
Bus::assertBatchCount(3);
```

Bạn có thể dùng `assertNothingBatched` để assert rằng không có batch nào được dispatch:

```php
Bus::assertNothingBatched();
```

<a name="testing-job-batch-interaction"></a>
#### Kiểm thử Job / Batch Interaction

Ngoài ra, đôi khi bạn cần kiểm thử tương tác của một job riêng lẻ với batch chứa nó. Ví dụ, bạn có thể cần kiểm tra liệu job có hủy việc xử lý tiếp theo của batch hay không. Để làm điều này, hãy gán một fake batch cho job bằng phương thức `withFakeBatch`. Phương thức này trả về một tuple gồm instance job và fake batch:

```php
[$job, $batch] = (new ShipOrder)->withFakeBatch();

$job->handle();

$this->assertTrue($batch->cancelled());
$this->assertEmpty($batch->added);
```

<a name="testing-job-queue-interactions"></a>
### Kiểm thử Job / Queue Interactions

Đôi khi bạn cần kiểm thử rằng một queued job [tự release trở lại queue](#manually-releasing-a-job), hoặc kiểm tra rằng job tự xóa chính nó. Bạn có thể kiểm thử các tương tác queue này bằng cách khởi tạo job và gọi phương thức `withFakeQueueInteractions`.

Sau khi các tương tác queue của job đã được fake, bạn có thể gọi phương thức `handle` trên job. Sau khi thực thi job, nhiều phương thức assertion có sẵn để xác minh các tương tác queue của job:

```php
use App\Exceptions\CorruptedAudioException;
use App\Jobs\ProcessPodcast;

$job = (new ProcessPodcast)->withFakeQueueInteractions();

$job->handle();

$job->assertReleased(delay: 30);
$job->assertDeleted();
$job->assertNotDeleted();
$job->assertFailed();
$job->assertFailedWith(CorruptedAudioException::class);
$job->assertNotFailed();
```

<a name="job-events"></a>
## Event của Job

Bằng method `before` và `after` trên [facade](/facades) `Queue`, bạn có thể khai báo callback được thực thi trước hoặc sau khi queued job được xử lý. Các callback này phù hợp để thực hiện logging bổ sung hoặc tăng statistic cho dashboard. Thông thường, bạn nên gọi các method này từ method `boot` của một [service provider](/providers). Ví dụ, chúng ta có thể dùng `AppServiceProvider` đi kèm Laravel:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobProcessing;

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
        Queue::before(function (JobProcessing $event) {
            // $event->connectionName
            // $event->job
            // $event->job->payload()
        });

        Queue::after(function (JobProcessed $event) {
            // $event->connectionName
            // $event->job
            // $event->job->payload()
        });
    }
}
```

Bằng method `looping` trên [facade](/facades) `Queue`, bạn có thể khai báo callback chạy trước khi worker cố lấy một job từ queue. Ví dụ, bạn có thể đăng ký một closure để rollback bất kỳ transaction nào bị để mở bởi job đã fail trước đó:

```php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

Queue::looping(function () {
    while (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
});
```

Laravel cũng dispatch event `Illuminate\Queue\Events\WorkerIdle` khi queue worker không thể lấy được job từ queue:

```php
use Illuminate\Queue\Events\WorkerIdle;
use Illuminate\Support\Facades\Event;

Event::listen(function (WorkerIdle $event) {
    // $event->connectionName
    // $event->queue
    // $event->workerOptions
});
```
