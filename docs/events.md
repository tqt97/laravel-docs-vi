# Sự kiện

- [Giới thiệu](#introduction)
- [Tạo Event và Listener](#generating-events-and-listeners)
- [Đăng ký Event và Listener](#registering-events-and-listeners)
    - [Tự động khám phá Event](#event-discovery)
    - [Đăng ký Event thủ công](#manually-registering-events)
    - [Closure Listener](#closure-listeners)
- [Định nghĩa Event](#defining-events)
- [Định nghĩa Listener](#defining-listeners)
- [Event Listener trong Queue](#queued-event-listeners)
    - [Tương tác thủ công với Queue](#manually-interacting-with-the-queue)
    - [Queued Event Listener và Database Transaction](#queued-event-listeners-and-database-transactions)
    - [Middleware cho Queued Listener](#queued-listener-middleware)
    - [Encrypted Queued Listeners](#encrypted-queued-listeners)
    - [Event Listener duy nhất](#unique-event-listeners)
        - [Giữ Listener duy nhất cho đến khi bắt đầu xử lý](#keeping-listeners-unique-until-processing-begins)
        - [Lock của Unique Listener](#unique-listener-locks)
    - [Debounced Event Listener](#debounced-event-listeners)
    - [Handling Failed Jobs](#handling-failed-jobs)
- [Dispatch Event](#dispatching-events)
    - [Dispatch Event sau Database Transaction](#dispatching-events-after-database-transactions)
    - [Deferring Events](#deferring-events)
- [Event Subscriber](#event-subscribers)
    - [Viết Event Subscriber](#writing-event-subscribers)
    - [Đăng ký Event Subscriber](#registering-event-subscribers)
- [Kiểm thử](#testing)
    - [Fake một tập con event](#faking-a-subset-of-events)
    - [Fake Event theo phạm vi](#scoped-event-fakes)

<a name="introduction"></a>
## Giới thiệu

Event của Laravel cung cấp một cách triển khai đơn giản cho mẫu thiết kế observer, cho phép bạn đăng ký và lắng nghe nhiều event khác nhau xảy ra trong ứng dụng. Các lớp event thường được lưu trong thư mục `app/Events`, còn listener của chúng được lưu trong `app/Listeners`. Nếu chưa thấy các thư mục này trong ứng dụng, bạn không cần lo lắng vì chúng sẽ được tạo khi bạn sinh event và listener bằng các lệnh Artisan.

Event là một cách hiệu quả để giảm sự phụ thuộc giữa các phần khác nhau của ứng dụng, vì một event có thể có nhiều listener không phụ thuộc lẫn nhau. Ví dụ, bạn có thể muốn gửi thông báo Slack cho người dùng mỗi khi một đơn hàng được giao. Thay vì gắn chặt code xử lý đơn hàng với code gửi thông báo Slack, bạn có thể phát event `App\Events\OrderShipped`; một listener sẽ tiếp nhận event này và gửi thông báo Slack.

<a name="generating-events-and-listeners"></a>
## Tạo Event và Listener

Để nhanh chóng tạo event và listener, bạn có thể sử dụng các lệnh Artisan `make:event` và `make:listener`:

```shell
php artisan make:event PodcastProcessed

php artisan make:listener SendPodcastNotification --event=PodcastProcessed
```

Để thuận tiện, bạn cũng có thể gọi các lệnh Artisan `make:event` và `make:listener` mà không truyền thêm đối số. Khi đó, Laravel sẽ tự động hỏi tên lớp và, khi tạo listener, event mà listener đó cần lắng nghe:

```shell
php artisan make:event

php artisan make:listener
```

<a name="registering-events-and-listeners"></a>
## Đăng ký Event và Listener

<a name="event-discovery"></a>
### Tự động khám phá Event

Theo mặc định, Laravel sẽ tự động tìm và đăng ký các event listener bằng cách quét thư mục `Listeners` của ứng dụng. Khi tìm thấy phương thức của lớp listener bắt đầu bằng `handle` hoặc `__invoke`, Laravel sẽ đăng ký phương thức đó làm event listener cho event được khai báo type-hint trong chữ ký phương thức:

```php
use App\Events\PodcastProcessed;

class SendPodcastNotification
{
    /**
     * Handle the event.
     */
    public function handle(PodcastProcessed $event): void
    {
        // ...
    }
}
```

Bạn có thể lắng nghe nhiều event bằng union type của PHP:

```php
/**
 * Handle the event.
 */
public function handle(PodcastProcessed|PodcastPublished $event): void
{
    // ...
}
```

Nếu dự định lưu listener trong thư mục khác hoặc trong nhiều thư mục, bạn có thể yêu cầu Laravel quét các thư mục đó bằng phương thức `withEvents` trong file `bootstrap/app.php` của ứng dụng:

```php
->withEvents(discover: [
    __DIR__.'/../app/Domain/Orders/Listeners',
])
```

Bạn có thể quét listener trong nhiều thư mục có cấu trúc tương tự bằng cách dùng ký tự `*` làm wildcard:

```php
->withEvents(discover: [
    __DIR__.'/../app/Domain/*/Listeners',
])
```

Bạn có thể dùng lệnh `event:list` để liệt kê toàn bộ listener đã được đăng ký trong ứng dụng:

```shell
php artisan event:list
```

<a name="event-discovery-in-production"></a>
#### Tự động khám phá Event trong Production

Để tăng tốc ứng dụng, bạn nên cache manifest chứa toàn bộ listener của ứng dụng bằng các lệnh Artisan `optimize` hoặc `event:cache`. Thông thường, lệnh này nên được chạy như một phần của [quy trình deployment](/docs/{{version}}/deployment#optimization). Framework sẽ sử dụng manifest này để tăng tốc quá trình đăng ký event. Bạn có thể dùng lệnh `event:clear` để xóa event cache.

<a name="dynamic-event-discovery"></a>
#### Tự động khám phá Event động

Để kiểm soát động việc một listener có được tự động khám phá hay không, bạn có thể triển khai interface `ShouldBeDiscovered` trên lớp listener và định nghĩa phương thức `shouldBeDiscovered` trả về giá trị boolean. Nếu phương thức trả về `false`, listener sẽ không được đăng ký trong quá trình tự động khám phá event:

```php
use Illuminate\Contracts\Events\ShouldBeDiscovered;

class SendPodcastNotification implements ShouldBeDiscovered
{
    /**
     * Handle the event.
     */
    public function handle(PodcastProcessed $event): void
    {
        // ...
    }

    /**
     * Determine if the listener should be discovered.
     */
    public static function shouldBeDiscovered(): bool
    {
        return app()->environment('production');
    }
}
```

<a name="manually-registering-events"></a>
### Đăng ký Event thủ công

Sử dụng facade `Event`, bạn có thể đăng ký thủ công event và listener tương ứng trong phương thức `boot` của `AppServiceProvider` trong ứng dụng:

```php
use App\Domain\Orders\Events\PodcastProcessed;
use App\Domain\Orders\Listeners\SendPodcastNotification;
use Illuminate\Support\Facades\Event;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(
        PodcastProcessed::class,
        SendPodcastNotification::class,
    );
}
```

Bạn có thể dùng lệnh `event:list` để liệt kê toàn bộ listener đã được đăng ký trong ứng dụng:

```shell
php artisan event:list
```

<a name="closure-listeners"></a>
### Closure Listener

Thông thường listener được định nghĩa dưới dạng class; tuy nhiên, bạn cũng có thể đăng ký thủ công event listener dựa trên closure trong phương thức `boot` của `AppServiceProvider`:

```php
use App\Events\PodcastProcessed;
use Illuminate\Support\Facades\Event;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(function (PodcastProcessed $event) {
        // ...
    });
}
```

<a name="queueable-anonymous-event-listeners"></a>
#### Anonymous Event Listener có thể đưa vào Queue

Khi đăng ký event listener dựa trên closure, bạn có thể bọc closure của listener bằng hàm `Illuminate\Events\queueable` để yêu cầu Laravel thực thi listener thông qua [queue](/docs/{{version}}/queues):

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(queueable(function (PodcastProcessed $event) {
        // ...
    }));
}
```

Tương tự queued job, bạn có thể sử dụng các phương thức `onConnection`, `onQueue` và `delay` để tùy chỉnh cách thực thi listener trong queue:

```php
Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->onConnection('redis')->onQueue('podcasts')->delay(now()->plus(seconds: 10)));
```

Nếu muốn xử lý lỗi của anonymous queued listener, bạn có thể truyền một closure vào phương thức `catch` khi định nghĩa listener bằng `queueable`. Closure này sẽ nhận instance của event và instance `Throwable` gây ra lỗi của listener:

```php
use App\Events\PodcastProcessed;
use function Illuminate\Events\queueable;
use Illuminate\Support\Facades\Event;
use Throwable;

Event::listen(queueable(function (PodcastProcessed $event) {
    // ...
})->catch(function (PodcastProcessed $event, Throwable $e) {
    // The queued listener failed...
}));
```

<a name="wildcard-event-listeners"></a>
#### Sự kiện Listener dùng Wildcard

Bạn cũng có thể đăng ký listener bằng ký tự `*` làm tham số wildcard, cho phép bắt nhiều event trong cùng một listener. Wildcard listener nhận tên event làm đối số thứ nhất và toàn bộ mảng dữ liệu event làm đối số thứ hai:

```php
Event::listen('event.*', function (string $eventName, array $data) {
    // ...
});
```

<a name="defining-events"></a>
## Định nghĩa Event

Về bản chất, event class là một container dữ liệu chứa thông tin liên quan đến event. Ví dụ, giả sử event `App\Events\OrderShipped` nhận một đối tượng [Eloquent ORM](/docs/{{version}}/eloquent):

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Order $order,
    ) {}
}
```

Như bạn có thể thấy, event class này không chứa logic. Nó là container cho instance `App\Models\Order` đã được mua. Trait `SerializesModels` mà event sử dụng sẽ serialize các Eloquent model một cách phù hợp nếu đối tượng event được serialize bằng hàm `serialize` của PHP, chẳng hạn khi sử dụng [queued listener](#queued-event-listeners).

<a name="defining-listeners"></a>
## Định nghĩa Listener

Tiếp theo, hãy xem listener cho event ví dụ. Event listener nhận instance của event trong phương thức `handle`. Khi lệnh Artisan `make:listener` được gọi với tùy chọn `--event`, Laravel sẽ tự động import event class phù hợp và type-hint event trong phương thức `handle`. Bên trong `handle`, bạn có thể thực hiện mọi hành động cần thiết để phản hồi event:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;

class SendShipmentNotification
{
    /**
     * Create the event listener.
     */
    public function __construct() {}

    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        // Access the order using $event->order...
    }
}
```

> [!NOTE]
> Event listener cũng có thể type-hint các dependency cần thiết trong constructor. Tất cả event listener đều được resolve thông qua [service container](/docs/{{version}}/container) của Laravel, vì vậy dependency sẽ được tự động inject.

<a name="stopping-the-propagation-of-an-event"></a>
#### Dừng lan truyền Event

Đôi khi bạn có thể muốn ngăn event tiếp tục lan truyền đến các listener khác. Bạn có thể thực hiện điều này bằng cách trả về `false` từ phương thức `handle` của listener.

<a name="queued-event-listeners"></a>
## Sự kiện Listener trong Queue

Đưa listener vào queue rất hữu ích nếu listener thực hiện tác vụ chậm như gửi email hoặc thực hiện HTTP request. Trước khi sử dụng queued listener, hãy đảm bảo bạn đã [cấu hình queue](/docs/{{version}}/queues) và khởi động queue worker trên server hoặc môi trường phát triển local.

Để chỉ định listener cần được đưa vào queue, hãy thêm interface `ShouldQueue` vào listener class. Các listener được tạo bởi lệnh Artisan `make:listener` đã import sẵn interface này vào namespace hiện tại để bạn có thể sử dụng ngay:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

Vậy là xong. Khi một event do listener này xử lý được dispatch, event dispatcher sẽ tự động đưa listener vào [hệ thống queue](/docs/{{version}}/queues) của Laravel. Nếu không có exception nào được throw khi queue thực thi listener, queued job sẽ tự động bị xóa sau khi xử lý xong.

<a name="customizing-the-queue-connection-queue-name"></a>
#### Tùy chỉnh Queue Connection, tên Queue và Delay

Nếu muốn tùy chỉnh queue connection, tên queue hoặc thời gian delay của event listener, bạn có thể sử dụng các attribute `Connection`, `Queue` và `Delay` trên listener class:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Connection;
use Illuminate\Queue\Attributes\Delay;
use Illuminate\Queue\Attributes\Queue;

#[Connection('sqs')]
#[Queue('listeners')]
#[Delay(60)]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```
Nếu muốn xác định queue connection, tên queue hoặc delay của listener tại runtime, bạn có thể định nghĩa các phương thức `viaConnection`, `viaQueue` hoặc `withDelay` trên listener:

```php
/**
 * Get the name of the listener's queue connection.
 */
public function viaConnection(): string
{
    return 'sqs';
}

/**
 * Get the name of the listener's queue.
 */
public function viaQueue(): string
{
    return 'listeners';
}

/**
 * Get the number of seconds before the job should be processed.
 */
public function withDelay(OrderShipped $event): int
{
    return $event->highPriority ? 0 : 60;
}
```

<a name="conditionally-queueing-listeners"></a>
#### Đưa Listener vào Queue có điều kiện

Đôi khi bạn cần xác định listener có nên được đưa vào queue dựa trên dữ liệu chỉ có tại runtime. Để làm điều này, bạn có thể thêm phương thức `shouldQueue` vào listener. Nếu `shouldQueue` trả về `false`, listener sẽ không được đưa vào queue:

```php
<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;

class RewardGiftCard implements ShouldQueue
{
    /**
     * Reward a gift card to the customer.
     */
    public function handle(OrderCreated $event): void
    {
        // ...
    }

    /**
     * Determine whether the listener should be queued.
     */
    public function shouldQueue(OrderCreated $event): bool
    {
        return $event->order->subtotal >= 5000;
    }
}
```

<a name="manually-interacting-with-the-queue"></a>
### Tương tác thủ công với Queue

Nếu cần truy cập thủ công các phương thức `delete` và `release` của queue job bên dưới listener, bạn có thể sử dụng trait `Illuminate\Queue\InteractsWithQueue`. Trait này được import mặc định trong các listener được tạo và cung cấp quyền truy cập các phương thức đó:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        if ($condition) {
            $this->release(30);
        }
    }
}
```

<a name="queued-event-listeners-and-database-transactions"></a>
### Sự kiện Listener trong Queue and Database Transactions

Khi queued listener được dispatch bên trong database transaction, queue có thể xử lý chúng trước khi transaction được commit. Khi đó, các thay đổi đối với model hoặc bản ghi database trong transaction có thể chưa được phản ánh trong database. Ngoài ra, model hoặc bản ghi được tạo trong transaction có thể vẫn chưa tồn tại trong database. Nếu listener phụ thuộc vào các model này, lỗi không mong muốn có thể xảy ra khi job dispatch queued listener được xử lý.

Nếu tùy chọn cấu hình `after_commit` của queue connection được đặt thành `false`, bạn vẫn có thể chỉ định một queued listener cụ thể chỉ được dispatch sau khi tất cả database transaction đang mở đã commit bằng cách implement interface `ShouldQueueAfterCommit` trên listener class:

```php
<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Queue\InteractsWithQueue;

class SendShipmentNotification implements ShouldQueueAfterCommit
{
    use InteractsWithQueue;
}
```

> [!NOTE]
> Để tìm hiểu thêm cách xử lý các vấn đề này, hãy xem tài liệu về [queued job và database transaction](/docs/{{version}}/queues#jobs-and-database-transactions).

<a name="queued-listener-middleware"></a>
### Middleware cho Queued Listener

Queued listener cũng có thể sử dụng [job middleware](/docs/{{version}}/queues#job-middleware). Job middleware cho phép bọc logic tùy chỉnh quanh quá trình thực thi queued listener, giúp giảm boilerplate trong chính listener. Sau khi tạo job middleware, bạn có thể gắn chúng vào listener bằng cách trả về chúng từ phương thức `middleware` của listener:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use App\Jobs\Middleware\RateLimited;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        // Process the event...
    }

    /**
     * Get the middleware the listener should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(OrderShipped $event): array
    {
        return [new RateLimited];
    }
}
```

<a name="encrypted-queued-listeners"></a>
#### Mã hóa Queued Listener

Laravel cho phép bảo đảm tính riêng tư và toàn vẹn của dữ liệu queued listener thông qua [mã hóa](/docs/{{version}}/encryption). Để bắt đầu, chỉ cần thêm interface `ShouldBeEncrypted` vào listener class. Khi interface này được thêm, Laravel sẽ tự động mã hóa listener trước khi đẩy nó vào queue:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendShipmentNotification implements ShouldQueue, ShouldBeEncrypted
{
    // ...
}
```

<a name="unique-event-listeners"></a>
### Event Listener duy nhất

> [!WARNING]
> Unique listener yêu cầu cache driver hỗ trợ [lock](/docs/{{version}}/cache#atomic-locks). Hiện tại, các cache driver `memcached`, `redis`, `dynamodb`, `database`, `file` và `array` hỗ trợ atomic lock.

Đôi khi, bạn có thể muốn bảo đảm tại bất kỳ thời điểm nào chỉ có một instance của một listener cụ thể nằm trong queue. Bạn có thể thực hiện điều này bằng cách triển khai interface `ShouldBeUnique` trên class listener:

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;

class AcquireProductKey implements ShouldQueue, ShouldBeUnique
{
    public function __invoke(LicenseSaved $event): void
    {
        // ...
    }
}
```

Trong ví dụ trên, listener `AcquireProductKey` là duy nhất. Vì vậy, listener sẽ không được đưa vào queue nếu một instance khác của listener đã có trong queue và chưa xử lý xong. Điều này bảo đảm mỗi license chỉ nhận một product key, ngay cả khi license được lưu nhiều lần liên tiếp trong thời gian ngắn.

Trong một số trường hợp, bạn có thể muốn định nghĩa một "key" cụ thể để xác định tính duy nhất của listener hoặc chỉ định khoảng thời gian mà sau đó listener không còn được giữ ở trạng thái duy nhất. Để làm điều này, bạn có thể định nghĩa property hoặc method `uniqueId` và `uniqueFor` trên class listener. Các method nhận instance của event, cho phép bạn dùng dữ liệu event để tạo giá trị trả về:

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;

class AcquireProductKey implements ShouldQueue, ShouldBeUnique
{
    /**
     * The number of seconds after which the listener's unique lock will be released.
     *
     * @var int
     */
    public $uniqueFor = 3600;

    public function __invoke(LicenseSaved $event): void
    {
        // ...
    }

    /**
     * Get the unique ID for the listener.
     */
    public function uniqueId(LicenseSaved $event): string
    {
        return 'listener:'.$event->license->id;
    }
}
```

Trong ví dụ trên, listener `AcquireProductKey` là duy nhất theo license ID. Vì vậy, mọi lần dispatch mới của listener cho cùng license sẽ bị bỏ qua cho đến khi listener hiện tại xử lý xong. Điều này ngăn việc cấp trùng product key cho cùng một license. Ngoài ra, nếu listener hiện tại không được xử lý trong vòng một giờ, unique lock sẽ được giải phóng và một listener khác có cùng unique key có thể được đưa vào queue.

> [!WARNING]
> Nếu ứng dụng dispatch event từ nhiều web server hoặc container, bạn nên bảo đảm tất cả server đều kết nối tới cùng một cache server trung tâm để Laravel có thể xác định chính xác listener có phải là duy nhất hay không.

<a name="keeping-listeners-unique-until-processing-begins"></a>
#### Giữ Listener duy nhất cho đến khi bắt đầu xử lý

Mặc định, unique listener được "unlock" sau khi listener xử lý xong hoặc thất bại sau tất cả lần retry. Tuy nhiên, có những trường hợp bạn muốn listener được unlock ngay trước khi bắt đầu xử lý. Khi đó, listener nên triển khai contract `ShouldBeUniqueUntilProcessing` thay cho `ShouldBeUnique`:

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;
use Illuminate\Contracts\Queue\ShouldQueue;

class AcquireProductKey implements ShouldQueue, ShouldBeUniqueUntilProcessing
{
    // ...
}
```

<a name="unique-listener-locks"></a>
#### Lock của Unique Listener

Ở phía sau, khi một listener `ShouldBeUnique` được dispatch, Laravel cố gắng lấy một [lock](/docs/{{version}}/cache#atomic-locks) bằng key `uniqueId`. Nếu lock đã được giữ, listener sẽ không được dispatch. Lock này được giải phóng khi listener xử lý xong hoặc thất bại sau tất cả lần retry. Mặc định, Laravel sử dụng cache driver mặc định để lấy lock. Nếu muốn dùng driver khác, bạn có thể định nghĩa method `uniqueVia` trả về cache driver cần sử dụng:

```php
<?php

namespace App\Listeners;

use App\Events\LicenseSaved;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

class AcquireProductKey implements ShouldQueue, ShouldBeUnique
{
    // ...

    /**
     * Get the cache driver for the unique listener lock.
     */
    public function uniqueVia(LicenseSaved $event): Repository
    {
        return Cache::driver('redis');
    }
}
```

> [!NOTE]
> Nếu bạn chỉ cần giới hạn việc xử lý đồng thời của một listener, hãy sử dụng job middleware [WithoutOverlapping](/docs/{{version}}/queues#preventing-job-overlaps).

<a name="debounced-event-listeners"></a>
### Sự kiện Listener có Debounce

Đôi khi, bạn chỉ muốn xử lý instance mới nhất của một event được dispatch lặp lại trong một khoảng thời gian ngắn. Bạn có thể làm điều này bằng cách thêm attribute `DebounceFor` vào queued listener:

```php
<?php

namespace App\Listeners;

use App\Events\ProductUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\DebounceFor;

#[DebounceFor(30)]
class UpdateProductSearchIndex implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(ProductUpdated $event): void
    {
        // Update the product's search index...
    }

    /**
     * Get the debounce ID for the listener.
     */
    public function debounceId(ProductUpdated $event): string
    {
        return (string) $event->product->getKey();
    }
}
```

Trong ví dụ trên, việc liên tục dispatch các event `ProductUpdated` cho cùng một sản phẩm trong vòng `30` giây sẽ debounce listener để chỉ event mới nhất được xử lý. Các debounce ID khác nhau được xử lý độc lập.

Nếu muốn giới hạn thời gian tối đa mà một event được dispatch thường xuyên có thể trì hoãn listener, bạn có thể truyền tham số `maxWait` cho attribute `DebounceFor`:

```php
#[DebounceFor(30, maxWait: 120)]
class UpdateProductSearchIndex implements ShouldQueue
{
    // ...
}
```

Bạn có thể tùy chỉnh cache store dùng để theo dõi debounce bằng cách định nghĩa phương thức `debounceVia` trên listener. Phương thức nhận instance của event và phải trả về một cache repository:

```php
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

public function debounceVia(ProductUpdated $event): Repository
{
    return Cache::driver('redis');
}
```

Debounced listener và unique listener loại trừ lẫn nhau. Listener sử dụng attribute `DebounceFor` không nên implement `ShouldBeUnique`.

> [!WARNING]
> Nếu ứng dụng dispatch event từ nhiều web server hoặc container, bạn cần bảo đảm tất cả server đều giao tiếp với cùng một cache server trung tâm.

<a name="handling-failed-jobs"></a>
### Xử lý Job thất bại

Đôi khi queued event listener có thể thất bại. Nếu listener vượt quá số lần thử tối đa do queue worker quy định, phương thức `failed` sẽ được gọi trên listener. Phương thức `failed` nhận instance của event và `Throwable` gây ra lỗi:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Throwable;

class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        // ...
    }

    /**
     * Handle a job failure.
     */
    public function failed(OrderShipped $event, Throwable $exception): void
    {
        // ...
    }
}
```

<a name="specifying-queued-listener-maximum-attempts"></a>
#### Chỉ định số lần thử tối đa cho Queued Listener

Nếu một queued listener gặp lỗi, bạn thường không muốn nó retry vô hạn. Vì vậy, Laravel cung cấp nhiều cách để chỉ định số lần hoặc khoảng thời gian listener được phép thử lại.

Bạn có thể sử dụng attribute `Tries` trên listener class để chỉ định số lần listener được thử trước khi được xem là thất bại:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;

#[Tries(5)]
class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    // ...
}
```

Thay vì định nghĩa số lần listener được thử trước khi thất bại, bạn có thể định nghĩa thời điểm mà sau đó listener không được thử lại nữa. Cách này cho phép listener được thử bất kỳ số lần nào trong một khoảng thời gian nhất định. Để định nghĩa thời điểm dừng retry, hãy thêm method `retryUntil` vào class listener. Method này phải trả về một instance `DateTimeInterface`:

```php
use DateTimeInterface;

/**
 * Determine the time at which the listener should timeout.
 */
public function retryUntil(): DateTimeInterface
{
    return now()->plus(minutes: 5);
}
```

Nếu cả `retryUntil` và `tries` đều được định nghĩa, Laravel ưu tiên phương thức `retryUntil`.

<a name="specifying-queued-listener-backoff"></a>
#### Chỉ định Backoff cho Queued Listener

Nếu muốn cấu hình số giây Laravel cần chờ trước khi retry một listener gặp exception, bạn có thể sử dụng attribute `Backoff` trên listener class:

```php
<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Backoff;

#[Backoff(3)]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

Nếu cần logic phức tạp hơn để xác định thời gian backoff của listener, bạn có thể định nghĩa phương thức `backoff` trên listener class:

```php
/**
 * Calculate the number of seconds to wait before retrying the queued listener.
 */
public function backoff(OrderShipped $event): int
{
    return 3;
}
```

Bạn có thể dễ dàng cấu hình backoff kiểu "exponential" bằng cách trả về một mảng giá trị backoff từ method `backoff`. Trong ví dụ này, độ trễ retry là 1 giây cho lần đầu, 5 giây cho lần thứ hai, 10 giây cho lần thứ ba và 10 giây cho mọi lần retry tiếp theo nếu vẫn còn lượt thử:

```php
/**
 * Calculate the number of seconds to wait before retrying the queued listener.
 *
 * @return list<int>
 */
public function backoff(OrderShipped $event): array
{
    return [1, 5, 10];
}
```

<a name="specifying-queued-listener-max-exceptions"></a>
#### Chỉ định số Exception tối đa cho Queued Listener

Đôi khi bạn muốn một queued listener có thể được thử nhiều lần nhưng phải thất bại nếu các lần retry được kích hoạt bởi một số lượng exception chưa được xử lý nhất định, thay vì được giải phóng trực tiếp bằng method `release`. Để làm điều này, bạn có thể dùng các attribute `Tries` và `MaxExceptions` trên class listener:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\MaxExceptions;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;

#[Tries(25)]
#[MaxExceptions(3)]
class SendShipmentNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(OrderShipped $event): void
    {
        // Process the event...
    }
}
```

Trong ví dụ này, listener sẽ được retry tối đa 25 lần. Tuy nhiên, listener sẽ thất bại nếu phát sinh ba exception chưa được xử lý.

<a name="specifying-queued-listener-timeout"></a>
#### Chỉ định Timeout cho Queued Listener

Thông thường, bạn biết tương đối thời gian một queued listener cần để xử lý. Vì vậy, Laravel cho phép chỉ định giá trị "timeout". Nếu listener xử lý lâu hơn số giây được chỉ định, worker đang xử lý listener sẽ thoát với lỗi. Bạn có thể định nghĩa số giây tối đa listener được phép chạy bằng attribute `Timeout` trên class listener:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Timeout;

#[Timeout(120)]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

Nếu muốn listener được đánh dấu thất bại khi timeout, bạn có thể dùng attribute `FailOnTimeout` trên class listener:

```php
<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\FailOnTimeout;

#[FailOnTimeout]
class SendShipmentNotification implements ShouldQueue
{
    // ...
}
```

<a name="dispatching-events"></a>
## Dispatching Events

Để dispatch một event, bạn có thể gọi phương thức static `dispatch` trên event. Phương thức này được trait `Illuminate\Foundation\Events\Dispatchable` cung cấp cho event. Mọi đối số truyền vào `dispatch` sẽ được chuyển tiếp đến constructor của event:

```php
<?php

namespace App\Http\Controllers;

use App\Events\OrderShipped;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrderShipmentController extends Controller
{
    /**
     * Ship the given order.
     */
    public function store(Request $request): RedirectResponse
    {
        $order = Order::findOrFail($request->order_id);

        // Order shipment logic...

        OrderShipped::dispatch($order);

        return redirect('/orders');
    }
}
```

Nếu muốn dispatch event có điều kiện, bạn có thể sử dụng các phương thức `dispatchIf` và `dispatchUnless`:

```php
OrderShipped::dispatchIf($condition, $order);

OrderShipped::dispatchUnless($condition, $order);
```

> [!NOTE]
> Khi kiểm thử, việc xác nhận một số event đã được dispatch mà không thực sự kích hoạt listener của chúng có thể rất hữu ích. Các [testing helper tích hợp sẵn](#testing) của Laravel giúp việc này trở nên đơn giản.

<a name="dispatching-events-after-database-transactions"></a>
## Dispatch Event sau Database Transaction

Đôi khi bạn có thể muốn Laravel chỉ dispatch event sau khi database transaction hiện tại đã commit. Để làm điều đó, hãy implement interface `ShouldDispatchAfterCommit` trên event class.

Interface này yêu cầu Laravel không dispatch event cho đến khi database transaction hiện tại được commit. Nếu transaction thất bại, event sẽ bị loại bỏ. Nếu không có database transaction nào đang diễn ra khi event được dispatch, event sẽ được dispatch ngay lập tức:

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped implements ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Order $order,
    ) {}
}
```

<a name="deferring-events"></a>
### Deferring Events

Deferred event cho phép trì hoãn việc dispatch model event và thực thi event listener cho đến khi một block code cụ thể hoàn tất. Điều này đặc biệt hữu ích khi bạn cần bảo đảm tất cả record liên quan đã được tạo trước khi event listener được kích hoạt.

Để trì hoãn event, hãy truyền một closure vào method `Event::defer()`:

```php
use App\Models\User;
use Illuminate\Support\Facades\Event;

Event::defer(function () {
    $user = User::create(['name' => 'Victoria Otwell']);

    $user->posts()->create(['title' => 'My first post!']);
});
```

Tất cả event được kích hoạt bên trong closure sẽ được dispatch sau khi closure thực thi xong. Điều này bảo đảm event listener có thể truy cập mọi record liên quan được tạo trong quá trình thực thi trì hoãn. Nếu closure phát sinh exception, các deferred event sẽ không được dispatch.

Để chỉ trì hoãn một số event cụ thể, hãy truyền mảng event làm tham số thứ hai của method `defer`:

```php
use App\Models\User;
use Illuminate\Support\Facades\Event;

Event::defer(function () {
    $user = User::create(['name' => 'Victoria Otwell']);

    $user->posts()->create(['title' => 'My first post!']);
}, ['eloquent.created: '.User::class]);
```

<a name="event-subscribers"></a>
## Sự kiện Subscriber

<a name="writing-event-subscribers"></a>
### Viết Event Subscriber

Event subscriber là các class có thể subscribe nhiều event ngay trong chính class subscriber, cho phép bạn định nghĩa nhiều event handler trong một class. Subscriber nên định nghĩa method `subscribe`, nhận một instance event dispatcher. Bạn có thể gọi method `listen` trên dispatcher để đăng ký event listener:

```php
<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Events\Dispatcher;

class UserEventSubscriber
{
    /**
     * Handle user login events.
     */
    public function handleUserLogin(Login $event): void {}

    /**
     * Handle user logout events.
     */
    public function handleUserLogout(Logout $event): void {}

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            Login::class,
            [UserEventSubscriber::class, 'handleUserLogin']
        );

        $events->listen(
            Logout::class,
            [UserEventSubscriber::class, 'handleUserLogout']
        );
    }
}
```

Nếu các method event listener được định nghĩa ngay trong subscriber, bạn có thể thuận tiện hơn khi trả về một mảng gồm event và tên method từ method `subscribe` của subscriber. Laravel sẽ tự động xác định tên class subscriber khi đăng ký event listener:

```php
<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Events\Dispatcher;

class UserEventSubscriber
{
    /**
     * Handle user login events.
     */
    public function handleUserLogin(Login $event): void {}

    /**
     * Handle user logout events.
     */
    public function handleUserLogout(Logout $event): void {}

    /**
     * Register the listeners for the subscriber.
     *
     * @return array<string, string>
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            Login::class => 'handleUserLogin',
            Logout::class => 'handleUserLogout',
        ];
    }
}
```

<a name="registering-event-subscribers"></a>
### Đăng ký Event Subscriber

Sau khi viết subscriber, Laravel sẽ tự động đăng ký các handler method bên trong subscriber nếu chúng tuân theo [quy ước event discovery](#event-discovery) của Laravel. Nếu không, bạn có thể đăng ký subscriber thủ công bằng method `subscribe` của facade `Event`. Thông thường, việc này nên được thực hiện trong method `boot` của `AppServiceProvider`:

```php
<?php

namespace App\Providers;

use App\Listeners\UserEventSubscriber;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::subscribe(UserEventSubscriber::class);
    }
}
```

<a name="testing"></a>
## Kiểm thử

Khi kiểm thử code dispatch event, bạn có thể muốn Laravel không thực sự chạy các listener của event, vì code của listener có thể được kiểm thử trực tiếp và tách biệt với code dispatch event tương ứng. Để kiểm thử chính listener, bạn có thể tạo instance listener và gọi trực tiếp method `handle` trong test.

Bằng method `fake` của facade `Event`, bạn có thể ngăn listener thực thi, chạy code cần kiểm thử, rồi assert các event đã được ứng dụng dispatch bằng các method `assertDispatched`, `assertNotDispatched` và `assertNothingDispatched`:

```php tab=Pest
<?php

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;

test('orders can be shipped', function () {
    Event::fake();

    // Perform order shipping...

    // Assert that an event was dispatched...
    Event::assertDispatched(OrderShipped::class);

    // Assert an event was dispatched twice...
    Event::assertDispatched(OrderShipped::class, 2);

    // Assert an event was dispatched once...
    Event::assertDispatchedOnce(OrderShipped::class);

    // Assert an event was not dispatched...
    Event::assertNotDispatched(OrderFailedToShip::class);

    // Assert that no events were dispatched...
    Event::assertNothingDispatched();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Events\OrderFailedToShip;
use App\Events\OrderShipped;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test order shipping.
     */
    public function test_orders_can_be_shipped(): void
    {
        Event::fake();

        // Perform order shipping...

        // Assert that an event was dispatched...
        Event::assertDispatched(OrderShipped::class);

        // Assert an event was dispatched twice...
        Event::assertDispatched(OrderShipped::class, 2);

        // Assert an event was dispatched once...
        Event::assertDispatchedOnce(OrderShipped::class);

        // Assert an event was not dispatched...
        Event::assertNotDispatched(OrderFailedToShip::class);

        // Assert that no events were dispatched...
        Event::assertNothingDispatched();
    }
}
```

Bạn có thể truyền closure vào `assertDispatched` hoặc `assertNotDispatched` để assert rằng một event được dispatch thỏa mãn "truth test" đã cho. Nếu có ít nhất một event được dispatch thỏa mãn điều kiện, assertion sẽ thành công:

```php
Event::assertDispatched(function (OrderShipped $event) use ($order) {
    return $event->order->id === $order->id;
});
```

Nếu chỉ muốn assert rằng một event listener đang lắng nghe một event cụ thể, bạn có thể dùng method `assertListening`:

```php
Event::assertListening(
    OrderShipped::class,
    SendShipmentNotification::class
);
```

> [!WARNING]
> Sau khi gọi `Event::fake()`, không event listener nào được thực thi. Vì vậy, nếu test dùng model factory phụ thuộc vào event, chẳng hạn tạo UUID trong event `creating` của model, bạn nên gọi `Event::fake()` **sau khi** sử dụng factory.

<a name="faking-a-subset-of-events"></a>
### Fake một tập con event

Nếu chỉ muốn fake event listener cho một tập event cụ thể, bạn có thể truyền chúng vào method `fake` hoặc `fakeFor`:

```php tab=Pest
test('orders can be processed', function () {
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // Other events are dispatched as normal...
    $order->update([
        // ...
    ]);
});
```

```php tab=PHPUnit
/**
 * Test order process.
 */
public function test_orders_can_be_processed(): void
{
    Event::fake([
        OrderCreated::class,
    ]);

    $order = Order::factory()->create();

    Event::assertDispatched(OrderCreated::class);

    // Other events are dispatched as normal...
    $order->update([
        // ...
    ]);
}
```

Bạn có thể fake tất cả event ngoại trừ một tập event được chỉ định bằng method `except`:

```php
Event::fake()->except([
    OrderCreated::class,
]);
```

<a name="scoped-event-fakes"></a>
### Sự kiện Fake theo phạm vi

Nếu chỉ muốn fake event listener trong một phần của test, bạn có thể dùng method `fakeFor`:

```php tab=Pest
<?php

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Support\Facades\Event;

test('orders can be processed', function () {
    $order = Event::fakeFor(function () {
        $order = Order::factory()->create();

        Event::assertDispatched(OrderCreated::class);

        return $order;
    });

    // Events are dispatched as normal and observers will run...
    $order->update([
        // ...
    ]);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Events\OrderCreated;
use App\Models\Order;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test order process.
     */
    public function test_orders_can_be_processed(): void
    {
        $order = Event::fakeFor(function () {
            $order = Order::factory()->create();

            Event::assertDispatched(OrderCreated::class);

            return $order;
        });

        // Events are dispatched as normal and observers will run...
        $order->update([
            // ...
        ]);
    }
}
```

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/events). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
