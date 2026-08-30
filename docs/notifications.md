# Thông báo

- [Giới thiệu](#introduction)
- [Tạo thông báo](#generating-notifications)
- [Gửi thông báo](#sending-notifications)
    - [Sử dụng trait Notifiable](#using-the-notifiable-trait)
    - [Sử dụng facade Notification](#using-the-notification-facade)
    - [Chỉ định kênh gửi](#specifying-delivery-channels)
    - [Đưa thông báo vào hàng đợi](#queueing-notifications)
    - [Thông báo theo yêu cầu](#on-demand-notifications)
- [Thông báo qua mail](#mail-notifications)
    - [Formatting Mail Messages](#formatting-mail-messages)
    - [Customizing the Sender](#customizing-the-sender)
    - [Customizing the Recipient](#customizing-the-recipient)
    - [Customizing the Subject](#customizing-the-subject)
    - [Customizing the Mailer](#customizing-the-mailer)
    - [Customizing the Templates](#customizing-the-templates)
    - [Attachments](#mail-attachments)
    - [Adding Tags and Metadata](#adding-tags-metadata)
    - [Customizing the Symfony Message](#customizing-the-symfony-message)
    - [Using Mailables](#using-mailables)
    - [Previewing Mail Notifications](#previewing-mail-notifications)
- [Markdown Mail Notifications](#markdown-mail-notifications)
    - [Generating the Message](#generating-the-message)
    - [Writing the Message](#writing-the-message)
    - [Customizing the Components](#customizing-the-components)
- [Database Notifications](#database-notifications)
    - [Prerequisites](#database-prerequisites)
    - [Formatting Database Notifications](#formatting-database-notifications)
    - [Accessing the Notifications](#accessing-the-notifications)
    - [Marking Notifications as Read](#marking-notifications-as-read)
- [Broadcast Notifications](#broadcast-notifications)
    - [Prerequisites](#broadcast-prerequisites)
    - [Formatting Broadcast Notifications](#formatting-broadcast-notifications)
    - [Listening for Notifications](#listening-for-notifications)
- [SMS Notifications](#sms-notifications)
    - [Prerequisites](#sms-prerequisites)
    - [Formatting SMS Notifications](#formatting-sms-notifications)
    - [Customizing the "From" Number](#customizing-the-from-number)
    - [Adding a Client Reference](#adding-a-client-reference)
    - [Routing SMS Notifications](#routing-sms-notifications)
- [Slack Notifications](#slack-notifications)
    - [Prerequisites](#slack-prerequisites)
    - [Formatting Slack Notifications](#formatting-slack-notifications)
    - [Slack Interactivity](#slack-interactivity)
    - [Routing Slack Notifications](#routing-slack-notifications)
    - [Notifying External Slack Workspaces](#notifying-external-slack-workspaces)
- [Localizing Notifications](#localizing-notifications)
- [Testing](#testing)
- [Notification Events](#notification-events)
- [Custom Channels](#custom-channels)

<a name="introduction"></a>
## Giới thiệu

Ngoài khả năng [gửi email](/docs/{{version}}/mail), Laravel còn hỗ trợ gửi thông báo qua nhiều kênh khác nhau, bao gồm email, SMS (thông qua [Vonage](https://www.vonage.com/communications-apis/), trước đây được gọi là Nexmo) và [Slack](https://slack.com). Ngoài ra, cộng đồng đã xây dựng nhiều [kênh thông báo](https://laravel-notification-channels.com/about/#suggesting-a-new-channel) để gửi thông báo qua hàng chục kênh khác nhau. Thông báo cũng có thể được lưu trong cơ sở dữ liệu để hiển thị trên giao diện web của ứng dụng.

Thông thường, thông báo nên là những thông điệp ngắn gọn, cung cấp thông tin về một sự kiện đã xảy ra trong ứng dụng. Ví dụ, nếu đang xây dựng ứng dụng thanh toán, bạn có thể gửi thông báo "Invoice Paid" cho người dùng qua email và SMS.

<a name="generating-notifications"></a>
## Tạo thông báo

Trong Laravel, mỗi thông báo được biểu diễn bởi một class, thường được lưu trong thư mục `app/Notifications`. Nếu chưa thấy thư mục này trong ứng dụng, bạn không cần tạo thủ công; Laravel sẽ tạo nó khi chạy lệnh Artisan `make:notification`:

```shell
php artisan make:notification InvoicePaid
```

Lệnh này sẽ tạo một class thông báo mới trong thư mục `app/Notifications`. Mỗi class thông báo chứa phương thức `via` cùng một số phương thức xây dựng message như `toMail` hoặc `toDatabase`; các phương thức này chuyển thông báo thành message phù hợp với từng kênh cụ thể.

<a name="sending-notifications"></a>
## Gửi thông báo

<a name="using-the-notifiable-trait"></a>
### Sử dụng trait Notifiable

Có hai cách để gửi thông báo: sử dụng phương thức `notify` của trait `Notifiable`, hoặc sử dụng [facade](/docs/{{version}}/facades) `Notification`. Theo mặc định, trait `Notifiable` đã được dùng trong model `App\Models\User` của ứng dụng:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;
}
```

Phương thức `notify` do trait này cung cấp nhận vào một instance thông báo:

```php
use App\Notifications\InvoicePaid;

$user->notify(new InvoicePaid($invoice));
```

> [!NOTE]
> Bạn có thể sử dụng trait `Notifiable` trên bất kỳ model nào, không chỉ riêng model `User`.

<a name="using-the-notification-facade"></a>
### Sử dụng facade Notification

Ngoài ra, bạn có thể gửi thông báo thông qua [facade](/docs/{{version}}/facades) `Notification`. Cách này hữu ích khi cần gửi một thông báo cho nhiều đối tượng có thể nhận thông báo, chẳng hạn một collection người dùng. Để gửi bằng facade, truyền tất cả đối tượng nhận thông báo và instance thông báo vào phương thức `send`:

```php
use Illuminate\Support\Facades\Notification;

Notification::send($users, new InvoicePaid($invoice));
```

Bạn cũng có thể gửi thông báo ngay lập tức bằng phương thức `sendNow`. Phương thức này sẽ gửi thông báo ngay cả khi notification triển khai interface `ShouldQueue`:

```php
Notification::sendNow($developers, new DeploymentCompleted($deployment));
```

<a name="specifying-delivery-channels"></a>
### Chỉ định kênh gửi

Mỗi class thông báo đều có phương thức `via` để xác định các kênh mà thông báo sẽ được gửi qua. Thông báo có thể được gửi qua các kênh `mail`, `database`, `broadcast`, `vonage` và `slack`.

> [!NOTE]
> Nếu muốn sử dụng các kênh khác như Telegram hoặc Pusher, hãy tham khảo [Laravel Notification Channels](http://laravel-notification-channels.com) do cộng đồng phát triển.

Phương thức `via` nhận một instance `$notifiable`, tức instance của class mà thông báo sẽ được gửi tới. Bạn có thể sử dụng `$notifiable` để xác định những kênh cần dùng để gửi thông báo:

```php
/**
 * Get the notification's delivery channels.
 *
 * @return array<int, string>
 */
public function via(object $notifiable): array
{
    return $notifiable->prefers_sms ? ['vonage'] : ['mail', 'database'];
}
```

<a name="queueing-notifications"></a>
### Đưa thông báo vào hàng đợi

> [!WARNING]
> Trước khi đưa thông báo vào hàng đợi, bạn nên cấu hình queue và [khởi động worker](/docs/{{version}}/queues#running-the-queue-worker).

Việc gửi thông báo có thể mất thời gian, đặc biệt khi kênh gửi cần gọi API bên ngoài. Để cải thiện thời gian phản hồi của ứng dụng, hãy đưa thông báo vào hàng đợi bằng cách thêm interface `ShouldQueue` và trait `Queueable` vào class. Interface và trait này đã được import trong các notification được tạo bằng lệnh `make:notification`, vì vậy bạn có thể sử dụng ngay:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    // ...
}
```

Sau khi thêm interface `ShouldQueue`, bạn vẫn gửi thông báo như bình thường. Laravel sẽ phát hiện interface `ShouldQueue` trên class và tự động đưa việc gửi thông báo vào hàng đợi:

```php
$user->notify(new InvoicePaid($invoice));
```

Khi đưa thông báo vào hàng đợi, Laravel sẽ tạo một queued job cho mỗi tổ hợp giữa người nhận và kênh gửi. Ví dụ, nếu thông báo có ba người nhận và hai kênh, sáu job sẽ được dispatch vào hàng đợi.

<a name="delaying-notifications"></a>
#### Trì hoãn thông báo

Nếu muốn trì hoãn việc gửi thông báo, bạn có thể chain phương thức `delay` khi khởi tạo notification:

```php
$delay = now()->plus(minutes: 10);

$user->notify((new InvoicePaid($invoice))->delay($delay));
```

Bạn có thể truyền một mảng vào phương thức `delay` để chỉ định thời gian trì hoãn riêng cho từng kênh:

```php
$user->notify((new InvoicePaid($invoice))->delay([
    'mail' => now()->plus(minutes: 5),
    'sms' => now()->plus(minutes: 10),
]));
```

Ngoài ra, bạn có thể định nghĩa phương thức `withDelay` ngay trên class notification. Phương thức `withDelay` cần trả về một mảng gồm tên kênh và giá trị thời gian trì hoãn tương ứng:

```php
/**
 * Determine the notification's delivery delay.
 *
 * @return array<string, \Illuminate\Support\Carbon>
 */
public function withDelay(object $notifiable): array
{
    return [
        'mail' => now()->plus(minutes: 5),
        'sms' => now()->plus(minutes: 10),
    ];
}
```

<a name="customizing-the-notification-queue-connection"></a>
#### Tùy chỉnh connection hàng đợi của thông báo

Theo mặc định, thông báo trong hàng đợi sử dụng queue connection mặc định của ứng dụng. Nếu muốn chỉ định connection khác cho một notification cụ thể, bạn có thể gọi phương thức `onConnection` trong constructor của notification:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        $this->onConnection('redis');
    }
}
```

Hoặc, nếu muốn chỉ định queue connection riêng cho từng kênh mà notification hỗ trợ, bạn có thể định nghĩa phương thức `viaConnections`. Phương thức này cần trả về một mảng các cặp tên kênh / tên queue connection:

```php
/**
 * Determine which connections should be used for each notification channel.
 *
 * @return array<string, string>
 */
public function viaConnections(): array
{
    return [
        'mail' => 'redis',
        'database' => 'sync',
    ];
}
```

<a name="customizing-notification-channel-queues"></a>
#### Tùy chỉnh hàng đợi cho từng kênh thông báo

Nếu muốn chỉ định queue riêng cho từng kênh notification, bạn có thể định nghĩa phương thức `viaQueues`. Phương thức này cần trả về một mảng các cặp tên kênh / tên queue:

```php
/**
 * Determine which queues should be used for each notification channel.
 *
 * @return array<string, string>
 */
public function viaQueues(): array
{
    return [
        'mail' => 'mail-queue',
        'slack' => 'slack-queue',
    ];
}
```

<a name="customizing-queued-notification-job-properties"></a>
#### Tùy chỉnh thuộc tính job của thông báo trong hàng đợi

Bạn có thể tùy chỉnh hành vi của queued job bên dưới bằng cách định nghĩa các queue attribute trên class notification. Các attribute này sẽ được job gửi thông báo kế thừa:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\Attributes\FailOnTimeout;
use Illuminate\Queue\Attributes\MaxExceptions;
use Illuminate\Queue\Attributes\Timeout;
use Illuminate\Queue\Attributes\Tries;

#[Tries(5)]
#[Timeout(120)]
#[MaxExceptions(3)]
#[FailOnTimeout]
class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    // ...
}
```

Nếu muốn bảo đảm tính riêng tư và toàn vẹn của dữ liệu notification trong hàng đợi bằng [mã hóa](/docs/{{version}}/encryption), hãy thêm interface `ShouldBeEncrypted` vào class notification:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue, ShouldBeEncrypted
{
    use Queueable;

    // ...
}
```

Ngoài việc định nghĩa trực tiếp các attribute này trên class notification, bạn cũng có thể định nghĩa các phương thức `backoff` và `retryUntil` để chỉ định chiến lược backoff và thời điểm dừng retry cho queued notification job:

```php
use DateTime;

/**
 * Calculate the number of seconds to wait before retrying the notification.
 */
public function backoff(): int
{
    return 3;
}

/**
 * Determine the time at which the notification should timeout.
 */
public function retryUntil(): DateTime
{
    return now()->plus(minutes: 5);
}
```

> [!NOTE]
> Để biết thêm về các attribute và phương thức của job, hãy xem tài liệu về [queued job](/docs/{{version}}/queues#max-job-attempts-and-timeout).

<a name="queued-notification-middleware"></a>
#### Middleware cho thông báo trong hàng đợi

Notification trong hàng đợi có thể định nghĩa middleware [tương tự queued job](/docs/{{version}}/queues#job-middleware). Để bắt đầu, hãy định nghĩa phương thức `middleware` trên class notification. Phương thức này nhận các biến `$notifiable` và `$channel`, cho phép tùy chỉnh middleware trả về dựa trên đích gửi của notification:

```php
use Illuminate\Queue\Middleware\RateLimited;

/**
 * Get the middleware the notification job should pass through.
 *
 * @return array<int, object>
 */
public function middleware(object $notifiable, string $channel)
{
    return match ($channel) {
        'mail' => [new RateLimited('postmark')],
        'slack' => [new RateLimited('slack')],
        default => [],
    };
}
```

<a name="queued-notifications-and-database-transactions"></a>
#### Thông báo trong hàng đợi và transaction cơ sở dữ liệu

Khi notification trong hàng đợi được dispatch bên trong transaction cơ sở dữ liệu, queue có thể xử lý chúng trước khi transaction được commit. Khi đó, các thay đổi bạn đã thực hiện trên model hoặc bản ghi trong transaction có thể chưa được phản ánh trong cơ sở dữ liệu. Ngoài ra, model hoặc bản ghi được tạo bên trong transaction có thể vẫn chưa tồn tại trong cơ sở dữ liệu. Nếu notification phụ thuộc vào các model này, lỗi ngoài mong đợi có thể xảy ra khi job gửi notification được xử lý.

Nếu tùy chọn cấu hình `after_commit` của queue connection được đặt thành `false`, bạn vẫn có thể chỉ định một notification cụ thể trong hàng đợi chỉ được dispatch sau khi tất cả transaction cơ sở dữ liệu đang mở đã được commit bằng cách gọi phương thức `afterCommit` khi gửi notification:

```php
use App\Notifications\InvoicePaid;

$user->notify((new InvoicePaid($invoice))->afterCommit());
```

Ngoài ra, bạn có thể gọi phương thức `afterCommit` từ constructor của notification:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> [!NOTE]
> Để tìm hiểu thêm cách xử lý các vấn đề này, hãy xem tài liệu về [queued job và transaction cơ sở dữ liệu](/docs/{{version}}/queues#jobs-and-database-transactions).

<a name="determining-if-the-queued-notification-should-be-sent"></a>
#### Xác định có nên gửi thông báo trong hàng đợi hay không

Sau khi notification trong hàng đợi được dispatch để xử lý nền, thông thường queue worker sẽ nhận notification và gửi đến người nhận dự kiến.

Tuy nhiên, nếu muốn đưa ra quyết định cuối cùng về việc có gửi notification hay không sau khi queue worker bắt đầu xử lý, bạn có thể định nghĩa phương thức `shouldSend` trên class notification. Nếu phương thức này trả về `false`, notification sẽ không được gửi:

```php
/**
 * Determine if the notification should be sent.
 */
public function shouldSend(object $notifiable, string $channel): bool
{
    return $this->invoice->isPaid();
}
```

<a name="after-sending-notifications"></a>
#### Sau khi gửi thông báo

Nếu muốn thực thi code sau khi notification đã được gửi, bạn có thể định nghĩa phương thức `afterSending` trên class notification. Phương thức này nhận entity có thể nhận notification, tên channel và response từ channel:

```php
/**
 * Handle the notification after it has been sent.
 */
public function afterSending(object $notifiable, string $channel, mixed $response): void
{
    // ...
}
```

<a name="on-demand-notifications"></a>
### Thông báo theo yêu cầu

Đôi khi bạn cần gửi notification cho một người không được lưu dưới dạng "user" trong ứng dụng. Với phương thức `route` của facade `Notification`, bạn có thể chỉ định thông tin định tuyến notification tùy thời điểm trước khi gửi:

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Notification;

Notification::route('mail', 'taylor@example.com')
    ->route('vonage', '5555555555')
    ->route('slack', '#slack-channel')
    ->route('broadcast', [new Channel('channel-name')])
    ->notify(new InvoicePaid($invoice));
```

Nếu muốn cung cấp tên người nhận khi gửi notification theo yêu cầu đến route `mail`, bạn có thể truyền một mảng trong đó địa chỉ email là key và tên người nhận là value của phần tử đầu tiên:

```php
Notification::route('mail', [
    'barrett@example.com' => 'Barrett Blair',
])->notify(new InvoicePaid($invoice));
```

Với phương thức `routes`, bạn có thể cung cấp thông tin định tuyến tùy thời điểm cho nhiều notification channel cùng lúc:

```php
Notification::routes([
    'mail' => ['barrett@example.com' => 'Barrett Blair'],
    'vonage' => '5555555555',
])->notify(new InvoicePaid($invoice));
```

<a name="mail-notifications"></a>
## Thông báo qua mail

<a name="formatting-mail-messages"></a>
### Định dạng mail

Nếu notification hỗ trợ gửi qua email, bạn nên định nghĩa phương thức `toMail` trên class notification. Phương thức này nhận entity `$notifiable` và phải trả về một instance `Illuminate\Notifications\Messages\MailMessage`.

Class `MailMessage` cung cấp một số phương thức đơn giản để xây dựng email giao dịch. Mail message có thể chứa các dòng văn bản cũng như một lời kêu gọi hành động (call to action). Hãy xem ví dụ về phương thức `toMail`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    $url = url('/invoice/'.$this->invoice->id);

    return (new MailMessage)
        ->greeting('Hello!')
        ->line('One of your invoices has been paid!')
        ->lineIf($this->amount > 0, "Amount paid: {$this->amount}")
        ->action('View Invoice', $url)
        ->line('Thank you for using our application!');
}
```

> [!NOTE]
> Lưu ý rằng ví dụ đang sử dụng `$this->invoice->id` trong phương thức `toMail`. Bạn có thể truyền mọi dữ liệu mà notification cần để tạo message vào constructor của notification.

Trong ví dụ này, chúng ta khai báo lời chào, một dòng văn bản, một lời kêu gọi hành động rồi thêm một dòng văn bản khác. Các phương thức do `MailMessage` cung cấp giúp định dạng các email giao dịch nhỏ một cách đơn giản và nhanh chóng. Sau đó, mail channel sẽ chuyển các thành phần của message thành template email HTML responsive, đồng thời tạo phiên bản văn bản thuần tương ứng. Dưới đây là ví dụ email được tạo bởi channel `mail`:

<img src="https://laravel.com/img/docs/notification-example-2.png">

> [!NOTE]
> Khi gửi notification qua mail, hãy bảo đảm đã thiết lập tùy chọn cấu hình `name` trong file `config/app.php`. Giá trị này sẽ được sử dụng trong phần header và footer của mail notification.

<a name="error-messages"></a>
#### Thông báo lỗi

Một số notification dùng để thông báo lỗi cho người dùng, chẳng hạn thanh toán hóa đơn thất bại. Bạn có thể chỉ định mail message là thông báo lỗi bằng cách gọi phương thức `error` khi xây dựng message. Khi sử dụng `error`, nút kêu gọi hành động sẽ có màu đỏ thay vì màu đen:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->error()
        ->subject('Invoice Payment Failed')
        ->line('...');
}
```

<a name="other-mail-notification-formatting-options"></a>
#### Các tùy chọn định dạng mail notification khác

Thay vì định nghĩa các "dòng" văn bản trong class notification, bạn có thể dùng phương thức `view` để chỉ định template tùy chỉnh dùng để render email notification:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->view(
        'mail.invoice.paid', ['invoice' => $this->invoice]
    );
}
```

Bạn có thể chỉ định view văn bản thuần cho mail message bằng cách truyền tên view ở phần tử thứ hai của mảng được cung cấp cho phương thức `view`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->view(
        ['mail.invoice.paid', 'mail.invoice.paid-text'],
        ['invoice' => $this->invoice]
    );
}
```

Hoặc, nếu message của bạn chỉ có view văn bản thuần, bạn có thể sử dụng phương thức `text`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)->text(
        'mail.invoice.paid-text', ['invoice' => $this->invoice]
    );
}
```

<a name="customizing-the-sender"></a>
### Tùy chỉnh người gửi

Theo mặc định, địa chỉ người gửi / địa chỉ `from` của email được định nghĩa trong file cấu hình `config/mail.php`. Tuy nhiên, bạn có thể chỉ định địa chỉ gửi cho một notification cụ thể bằng phương thức `from`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->from('barrett@example.com', 'Barrett Blair')
        ->line('...');
}
```

<a name="customizing-the-recipient"></a>
### Tùy chỉnh người nhận

Khi gửi notification qua channel `mail`, hệ thống notification sẽ tự động tìm thuộc tính `email` trên entity notifiable. Bạn có thể tùy chỉnh địa chỉ email dùng để nhận notification bằng cách định nghĩa phương thức `routeNotificationForMail` trên entity notifiable:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the mail channel.
     *
     * @return  array<string, string>|string
     */
    public function routeNotificationForMail(Notification $notification): array|string
    {
        // Return email address only...
        return $this->email_address;

        // Return email address and name...
        return [$this->email_address => $this->name];
    }
}
```

<a name="customizing-the-subject"></a>
### Tùy chỉnh tiêu đề

Theo mặc định, tiêu đề email là tên class của notification được định dạng theo "Title Case". Vì vậy, nếu class notification có tên `InvoicePaid`, tiêu đề email sẽ là `Invoice Paid`. Nếu muốn chỉ định tiêu đề khác cho message, bạn có thể gọi phương thức `subject` khi xây dựng message:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->subject('Notification Subject')
        ->line('...');
}
```

<a name="customizing-the-mailer"></a>
### Tùy chỉnh Mailer

Theo mặc định, email notification sẽ được gửi bằng mailer mặc định được định nghĩa trong file cấu hình `config/mail.php`. Tuy nhiên, bạn có thể chỉ định mailer khác tại runtime bằng cách gọi phương thức `mailer` khi xây dựng message:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->mailer('postmark')
        ->line('...');
}
```

<a name="customizing-the-templates"></a>
### Tùy chỉnh template

Bạn có thể sửa các template HTML và văn bản thuần được mail notification sử dụng bằng cách publish resource của package notification. Sau khi chạy lệnh sau, các template mail notification sẽ nằm trong thư mục `resources/views/vendor/notifications`:

```shell
php artisan vendor:publish --tag=laravel-notifications
```

<a name="mail-attachments"></a>
### File đính kèm

Để thêm file đính kèm vào email notification, hãy sử dụng phương thức `attach` khi xây dựng message. Phương thức `attach` nhận đường dẫn tuyệt đối tới file làm đối số đầu tiên:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attach('/path/to/file');
}
```

> [!NOTE]
> Phương thức `attach` của notification mail message cũng chấp nhận [đối tượng có thể đính kèm](/docs/{{version}}/mail#attachable-objects). Hãy tham khảo [tài liệu đầy đủ về đối tượng có thể đính kèm](/docs/{{version}}/mail#attachable-objects) để tìm hiểu thêm.

Khi đính kèm file vào message, bạn cũng có thể chỉ định tên hiển thị và / hoặc MIME type bằng cách truyền một `array` làm đối số thứ hai cho phương thức `attach`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attach('/path/to/file', [
            'as' => 'name.pdf',
            'mime' => 'application/pdf',
        ]);
}
```

Khi cần, bạn có thể đính kèm nhiều file vào một message bằng phương thức `attachMany`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attachMany([
            '/path/to/forge.svg',
            '/path/to/vapor.svg' => [
                'as' => 'Logo.svg',
                'mime' => 'image/svg+xml',
            ],
        ]);
}
```

Bạn có thể dùng phương thức `attachFromStorageDisk` để đính kèm file tồn tại trên một [filesystem disk](/docs/{{version}}/filesystem) cụ thể. Phương thức này nhận tên disk và đường dẫn tới file trên disk đó:

```php
use App\Mail\InvoicePaid as InvoicePaidMailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    return (new InvoicePaidMailable($this->invoice))
        ->to($notifiable->email)
        ->attachFromStorageDisk('s3', '/path/to/file', 'invoice.pdf', [
            'mime' => 'application/pdf',
        ]);
}
```

<a name="raw-data-attachments"></a>
#### Đính kèm dữ liệu thô

Phương thức `attachData` có thể được dùng để đính kèm một chuỗi byte thô. Khi gọi `attachData`, bạn cần cung cấp tên file sẽ được gán cho file đính kèm:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Hello!')
        ->attachData($this->pdf, 'name.pdf', [
            'mime' => 'application/pdf',
        ]);
}
```

<a name="adding-tags-metadata"></a>
### Thêm tag và metadata

Một số nhà cung cấp email bên thứ ba như Mailgun và Postmark hỗ trợ "tag" và "metadata" cho message, có thể dùng để nhóm và theo dõi email do ứng dụng gửi. Bạn có thể thêm tag và metadata vào email message thông qua các phương thức `tag` và `metadata`:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->greeting('Comment Upvoted!')
        ->tag('upvote')
        ->metadata('comment_id', $this->comment->id);
}
```

Nếu ứng dụng đang sử dụng driver Mailgun, bạn có thể tham khảo tài liệu Mailgun để biết thêm về [tag](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags) và [metadata](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages). Tương tự, bạn có thể tham khảo tài liệu Postmark để biết thêm về hỗ trợ [tag](https://postmarkapp.com/blog/tags-support-for-smtp) và [metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq).

Nếu ứng dụng sử dụng Amazon SES để gửi email, bạn nên dùng phương thức `metadata` để gắn ["tag" của SES](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) vào message.

<a name="customizing-the-symfony-message"></a>
### Tùy chỉnh Symfony Message

Phương thức `withSymfonyMessage` của class `MailMessage` cho phép bạn đăng ký một closure sẽ được gọi với instance Symfony Message trước khi message được gửi. Điều này cho phép bạn tùy chỉnh sâu message trước khi nó được phân phối:

```php
use Symfony\Component\Mime\Email;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->withSymfonyMessage(function (Email $message) {
            $message->getHeaders()->addTextHeader(
                'Custom-Header', 'Header Value'
            );
        });
}
```

<a name="using-mailables"></a>
### Sử dụng Mailable

Nếu cần, bạn có thể trả về một [đối tượng mailable](/docs/{{version}}/mail) đầy đủ từ phương thức `toMail` của notification. Khi trả về `Mailable` thay cho `MailMessage`, bạn cần chỉ định người nhận message bằng phương thức `to` của đối tượng mailable:

```php
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Mail\Mailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    return (new InvoicePaidMailable($this->invoice))
        ->to($notifiable->email);
}
```

<a name="mailables-and-on-demand-notifications"></a>
#### Mailable và On-Demand Notification

Nếu đang gửi [on-demand notification](#on-demand-notifications), instance `$notifiable` được truyền vào phương thức `toMail` sẽ là một instance của `Illuminate\Notifications\AnonymousNotifiable`, cung cấp phương thức `routeNotificationFor` để lấy địa chỉ email mà on-demand notification cần được gửi tới:

```php
use App\Mail\InvoicePaid as InvoicePaidMailable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Mail\Mailable;

/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): Mailable
{
    $address = $notifiable instanceof AnonymousNotifiable
        ? $notifiable->routeNotificationFor('mail')
        : $notifiable->email;

    return (new InvoicePaidMailable($this->invoice))
        ->to($address);
}
```

<a name="previewing-mail-notifications"></a>
### Xem trước Mail Notification

Khi thiết kế template mail notification, việc xem trước nhanh mail message đã render trong trình duyệt giống như một template Blade thông thường rất tiện lợi. Vì vậy, Laravel cho phép bạn trả về trực tiếp bất kỳ mail message nào do mail notification tạo ra từ route closure hoặc controller. Khi `MailMessage` được trả về, nó sẽ được render và hiển thị trong trình duyệt, giúp bạn nhanh chóng xem trước thiết kế mà không cần gửi tới một địa chỉ email thực:

```php
use App\Models\Invoice;
use App\Notifications\InvoicePaid;

Route::get('/notification', function () {
    $invoice = Invoice::find(1);

    return (new InvoicePaid($invoice))
        ->toMail($invoice->user);
});
```

<a name="markdown-mail-notifications"></a>
## Mail Notification Markdown

Mail notification Markdown cho phép bạn tận dụng các template dựng sẵn của mail notification, đồng thời có nhiều tự do hơn khi viết các message dài và tùy chỉnh. Vì message được viết bằng Markdown, Laravel có thể render các template HTML đẹp, responsive, đồng thời tự động tạo phiên bản văn bản thuần tương ứng.

<a name="generating-the-message"></a>
### Tạo Message

Để tạo notification kèm template Markdown tương ứng, bạn có thể sử dụng tùy chọn `--markdown` của lệnh Artisan `make:notification`:

```shell
php artisan make:notification InvoicePaid --markdown=mail.invoice.paid
```

Giống các mail notification khác, notification sử dụng template Markdown nên định nghĩa phương thức `toMail` trên class notification. Tuy nhiên, thay vì dùng `line` và `action` để xây dựng notification, hãy dùng phương thức `markdown` để chỉ định tên template Markdown cần sử dụng. Bạn có thể truyền mảng dữ liệu muốn cung cấp cho template làm đối số thứ hai của phương thức:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    $url = url('/invoice/'.$this->invoice->id);

    return (new MailMessage)
        ->subject('Invoice Paid')
        ->markdown('mail.invoice.paid', ['url' => $url]);
}
```

<a name="writing-the-message"></a>
### Viết Message

Mail notification Markdown kết hợp các component Blade và cú pháp Markdown, giúp bạn dễ dàng xây dựng notification đồng thời tận dụng các component notification được Laravel chuẩn bị sẵn:

```blade
<x-mail::message>
# Invoice Paid

Your invoice has been paid!

<x-mail::button :url="$url">
View Invoice
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
```

> [!NOTE]
> Không sử dụng thụt lề quá mức khi viết email Markdown. Theo chuẩn Markdown, parser Markdown sẽ render nội dung được thụt lề thành code block.

<a name="button-component"></a>
#### Component Button

Component button render một liên kết dạng nút được căn giữa. Component nhận hai đối số: `url` và `color` tùy chọn. Các màu được hỗ trợ là `primary`, `green` và `red`. Bạn có thể thêm bao nhiêu component button vào notification tùy ý:

```blade
<x-mail::button :url="$url" color="green">
View Invoice
</x-mail::button>
```

<a name="panel-component"></a>
#### Component Panel

Component panel render khối văn bản được cung cấp trong một panel có màu nền hơi khác phần còn lại của notification. Điều này giúp thu hút sự chú ý vào một khối văn bản cụ thể:

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### Component Table

Component table cho phép chuyển một bảng Markdown thành bảng HTML. Component nhận bảng Markdown làm nội dung. Việc căn chỉnh cột được hỗ trợ bằng cú pháp căn chỉnh bảng Markdown mặc định:

```blade
<x-mail::table>
| Laravel       | Table         | Example       |
| ------------- | :-----------: | ------------: |
| Col 2 is      | Centered      | $10           |
| Col 3 is      | Right-Aligned | $20           |
</x-mail::table>
```

<a name="customizing-the-components"></a>
### Tùy chỉnh component

Bạn có thể export toàn bộ component Markdown notification vào ứng dụng để tùy chỉnh. Để export các component, hãy dùng lệnh Artisan `vendor:publish` để publish asset tag `laravel-mail`:

```shell
php artisan vendor:publish --tag=laravel-mail
```

Lệnh này sẽ publish các component Markdown mail vào thư mục `resources/views/vendor/mail`. Thư mục `mail` sẽ chứa hai thư mục `html` và `text`, mỗi thư mục chứa biểu diễn tương ứng của tất cả component có sẵn. Bạn có thể tùy chỉnh các component này theo nhu cầu.

<a name="customizing-the-css"></a>
#### Tùy biến CSS

Sau khi export các component, thư mục `resources/views/vendor/mail/html/themes` sẽ chứa file `default.css`. Bạn có thể tùy chỉnh CSS trong file này và các style sẽ tự động được inline vào phần HTML của Markdown notification.

Nếu muốn xây dựng một theme hoàn toàn mới cho các component Markdown của Laravel, bạn có thể đặt file CSS trong thư mục `html/themes`. Sau khi đặt tên và lưu file CSS, hãy cập nhật tùy chọn `theme` trong file cấu hình `mail` để khớp với tên theme mới.

Để tùy chỉnh theme cho một notification cụ thể, bạn có thể gọi phương thức `theme` khi xây dựng mail message của notification. Phương thức `theme` nhận tên theme sẽ được sử dụng khi gửi notification:

```php
/**
 * Get the mail representation of the notification.
 */
public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->theme('invoice')
        ->subject('Invoice Paid')
        ->markdown('mail.invoice.paid', ['url' => $url]);
}
```

<a name="database-notifications"></a>
## Database Notifications

<a name="database-prerequisites"></a>
### Điều kiện tiên quyết

Channel notification `database` lưu thông tin notification trong một bảng database. Bảng này chứa các thông tin như loại notification cùng cấu trúc dữ liệu JSON mô tả notification.

Bạn có thể truy vấn bảng này để hiển thị notification trong giao diện người dùng của ứng dụng. Tuy nhiên, trước đó bạn cần tạo bảng database để lưu các notification. Bạn có thể dùng lệnh `make:notifications-table` để tạo một [migration](/docs/{{version}}/migrations) với schema phù hợp:

```shell
php artisan make:notifications-table

php artisan migrate
```

> [!NOTE]
> Nếu các model có thể nhận notification của bạn sử dụng [UUID hoặc ULID làm khóa chính](/docs/{{version}}/eloquent#uuid-and-ulid-keys), bạn nên thay phương thức `morphs` bằng [uuidMorphs](/docs/{{version}}/migrations#column-method-uuidMorphs) hoặc [ulidMorphs](/docs/{{version}}/migrations#column-method-ulidMorphs) trong migration của bảng notification.

<a name="formatting-database-notifications"></a>
### Định dạng Database Notification

Nếu một notification hỗ trợ lưu trong bảng database, bạn nên định nghĩa phương thức `toDatabase` hoặc `toArray` trên class notification. Phương thức này nhận entity `$notifiable` và trả về một PHP array thông thường. Array trả về sẽ được mã hóa thành JSON và lưu trong cột `data` của bảng `notifications`. Ví dụ với phương thức `toArray`:

```php
/**
 * Get the array representation of the notification.
 *
 * @return array<string, mixed>
 */
public function toArray(object $notifiable): array
{
    return [
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ];
}
```

Khi một notification được lưu vào database của ứng dụng, mặc định cột `type` sẽ được đặt thành tên class của notification và cột `read_at` sẽ là `null`. Tuy nhiên, bạn có thể tùy chỉnh hành vi này bằng cách định nghĩa các phương thức `databaseType` và `initialDatabaseReadAtValue` trong class notification:

```php
use Illuminate\Support\Carbon;

/**
 * Get the notification's database type.
 */
public function databaseType(object $notifiable): string
{
    return 'invoice-paid';
}

/**
 * Get the initial value for the "read_at" column.
 */
public function initialDatabaseReadAtValue(): ?Carbon
{
    return null;
}
```

<a name="todatabase-vs-toarray"></a>
#### `toDatabase` vs. `toArray`

Phương thức `toArray` cũng được channel `broadcast` sử dụng để xác định dữ liệu nào sẽ được broadcast tới frontend JavaScript. Nếu muốn có hai biểu diễn array khác nhau cho channel `database` và `broadcast`, bạn nên định nghĩa phương thức `toDatabase` thay vì `toArray`.

<a name="accessing-the-notifications"></a>
### Truy cập Notification

Sau khi notification được lưu trong database, bạn cần một cách thuận tiện để truy cập chúng từ các entity có thể nhận notification. Trait `Illuminate\Notifications\Notifiable`, được tích hợp trong model `App\Models\User` mặc định của Laravel, cung cấp [Eloquent relationship](/docs/{{version}}/eloquent-relationships) `notifications` trả về các notification của entity. Bạn có thể truy cập relationship này như bất kỳ Eloquent relationship nào khác. Mặc định, notification được sắp xếp theo timestamp `created_at`, với notification mới nhất nằm đầu collection:

```php
$user = App\Models\User::find(1);

foreach ($user->notifications as $notification) {
    echo $notification->type;
}
```

Nếu chỉ muốn lấy các notification "chưa đọc", bạn có thể sử dụng relationship `unreadNotifications`. Các notification này cũng được sắp xếp theo timestamp `created_at`, với notification mới nhất nằm đầu collection:

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    echo $notification->type;
}
```

Nếu chỉ muốn lấy các notification "đã đọc", bạn có thể sử dụng relationship `readNotifications`:

```php
$user = App\Models\User::find(1);

foreach ($user->readNotifications as $notification) {
    echo $notification->type;
}
```

> [!NOTE]
> Để truy cập notification từ JavaScript client, bạn nên định nghĩa một notification controller trong ứng dụng để trả về notification của một entity có thể nhận notification, chẳng hạn người dùng hiện tại. Sau đó, JavaScript client có thể gửi HTTP request tới URL của controller đó.

<a name="marking-notifications-as-read"></a>
### Đánh dấu Notification là đã đọc

Thông thường, bạn sẽ muốn đánh dấu notification là "đã đọc" khi người dùng xem nó. Trait `Illuminate\Notifications\Notifiable` cung cấp phương thức `markAsRead`, phương thức này cập nhật cột `read_at` trên bản ghi notification trong database:

```php
$user = App\Models\User::find(1);

foreach ($user->unreadNotifications as $notification) {
    $notification->markAsRead();
}
```

Tuy nhiên, thay vì lặp qua từng notification, bạn có thể gọi trực tiếp phương thức `markAsRead` trên collection notification:

```php
$user->unreadNotifications->markAsRead();
```

Bạn cũng có thể dùng truy vấn cập nhật hàng loạt để đánh dấu tất cả notification là đã đọc mà không cần lấy chúng từ database:

```php
$user = App\Models\User::find(1);

$user->unreadNotifications()->update(['read_at' => now()]);
```

Bạn có thể `delete` notification để xóa hoàn toàn chúng khỏi bảng:

```php
$user->notifications()->delete();
```

<a name="broadcast-notifications"></a>
## Broadcast Notifications

<a name="broadcast-prerequisites"></a>
### Điều kiện tiên quyết

Trước khi broadcast notification, bạn nên cấu hình và làm quen với dịch vụ [event broadcasting](/docs/{{version}}/broadcasting) của Laravel. Event broadcasting cho phép frontend JavaScript phản ứng với các event Laravel phía server.

<a name="formatting-broadcast-notifications"></a>
### Định dạng Broadcast Notification

Channel `broadcast` phát notification bằng dịch vụ [event broadcasting](/docs/{{version}}/broadcasting) của Laravel, cho phép frontend JavaScript nhận notification theo thời gian thực. Nếu notification hỗ trợ broadcasting, bạn có thể định nghĩa phương thức `toBroadcast` trên class notification. Phương thức này nhận entity `$notifiable` và trả về một instance `BroadcastMessage`. Nếu không có phương thức `toBroadcast`, phương thức `toArray` sẽ được dùng để lấy dữ liệu cần broadcast. Dữ liệu trả về được mã hóa thành JSON và broadcast tới frontend JavaScript. Ví dụ với phương thức `toBroadcast`:

```php
use Illuminate\Notifications\Messages\BroadcastMessage;

/**
 * Get the broadcastable representation of the notification.
 */
public function toBroadcast(object $notifiable): BroadcastMessage
{
    return new BroadcastMessage([
        'invoice_id' => $this->invoice->id,
        'amount' => $this->invoice->amount,
    ]);
}
```

<a name="broadcast-queue-configuration"></a>
#### Cấu hình Queue cho Broadcast

Tất cả broadcast notification đều được đưa vào queue để broadcast. Nếu muốn cấu hình queue connection hoặc tên queue dùng cho thao tác broadcast, bạn có thể sử dụng các phương thức `onConnection` và `onQueue` của `BroadcastMessage`:

```php
return (new BroadcastMessage($data))
    ->onConnection('sqs')
    ->onQueue('broadcasts');
```

<a name="customizing-the-notification-type"></a>
#### Tùy chỉnh loại Notification

Ngoài dữ liệu bạn chỉ định, mọi broadcast notification còn có trường `type` chứa tên class đầy đủ của notification. Nếu muốn tùy chỉnh `type` của notification, bạn có thể định nghĩa phương thức `broadcastType` trên class notification:

```php
/**
 * Get the type of the notification being broadcast.
 */
public function broadcastType(): string
{
    return 'broadcast.message';
}
```

<a name="listening-for-notifications"></a>
### Lắng nghe Notification

Notification sẽ được broadcast trên private channel theo quy ước `{notifiable}.{id}`. Vì vậy, nếu bạn gửi notification tới instance `App\Models\User` có ID `1`, notification sẽ được broadcast trên private channel `App.Models.User.1`. Khi sử dụng [Laravel Echo](/docs/{{version}}/broadcasting#client-side-installation), bạn có thể dễ dàng lắng nghe notification trên channel bằng phương thức `notification`:

```js
Echo.private('App.Models.User.' + userId)
    .notification((notification) => {
        console.log(notification.type);
    });
```

<a name="using-react-or-vue"></a>
#### Sử dụng React, Vue hoặc Svelte

Laravel Echo cung cấp các hook cho React, Vue và Svelte giúp việc lắng nghe notification trở nên đơn giản. Để bắt đầu, hãy gọi hook `useEchoNotification` dùng để lắng nghe notification. Hook `useEchoNotification` sẽ tự động rời channel khi component sử dụng nó bị unmount:

```js tab=React
import { useEchoNotification } from "@laravel/echo-react";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoNotification } from "@laravel/echo-vue";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
</script>
```

```svelte tab=Svelte
<script>
import { useEchoNotification } from "@laravel/echo-svelte";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
);
</script>
```

Theo mặc định, hook sẽ lắng nghe tất cả notification. Để chỉ định các loại notification muốn lắng nghe, bạn có thể truyền một chuỗi hoặc một mảng type vào `useEchoNotification`:

```js tab=React
import { useEchoNotification } from "@laravel/echo-react";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoNotification } from "@laravel/echo-vue";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
</script>
```

```svelte tab=Svelte
<script>
import { useEchoNotification } from "@laravel/echo-svelte";

useEchoNotification(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
</script>
```

Bạn cũng có thể chỉ định cấu trúc dữ liệu payload của notification để tăng tính an toàn về kiểu và thuận tiện hơn khi chỉnh sửa:

```ts
type InvoicePaidNotification = {
    invoice_id: number;
    created_at: string;
};

useEchoNotification<InvoicePaidNotification>(
    `App.Models.User.${userId}`,
    (notification) => {
        console.log(notification.invoice_id);
        console.log(notification.created_at);
        console.log(notification.type);
    },
    'App.Notifications.InvoicePaid',
);
```

<a name="customizing-the-notification-channel"></a>
#### Tùy chỉnh channel của Notification

Nếu muốn tùy chỉnh channel mà broadcast notification của một entity được phát trên đó, bạn có thể định nghĩa phương thức `receivesBroadcastNotificationsOn` trên notifiable entity:

```php
<?php

namespace App\Models;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The channels the user receives notification broadcasts on.
     */
    public function receivesBroadcastNotificationsOn(): string
    {
        return 'users.'.$this->id;
    }
}
```

<a name="sms-notifications"></a>
## Notification qua SMS

<a name="sms-prerequisites"></a>
### Điều kiện tiên quyết

Việc gửi notification SMS trong Laravel được hỗ trợ bởi [Vonage](https://www.vonage.com/) (trước đây là Nexmo). Trước khi có thể gửi notification qua Vonage, bạn cần cài đặt các package `laravel/vonage-notification-channel` và `guzzlehttp/guzzle`:

```shell
composer require laravel/vonage-notification-channel guzzlehttp/guzzle
```

Package này bao gồm một [file cấu hình](https://github.com/laravel/vonage-notification-channel/blob/3.x/config/vonage.php). Tuy nhiên, bạn không bắt buộc phải export file cấu hình này vào ứng dụng. Bạn chỉ cần sử dụng các biến môi trường `VONAGE_KEY` và `VONAGE_SECRET` để khai báo public key và secret key của Vonage.

Sau khi khai báo các key, bạn nên thiết lập biến môi trường `VONAGE_SMS_FROM` để xác định số điện thoại mặc định dùng để gửi SMS. Bạn có thể tạo số điện thoại này trong bảng điều khiển Vonage:

```ini
VONAGE_SMS_FROM=15556666666
```

<a name="formatting-sms-notifications"></a>
### Định dạng Notification SMS

Nếu một notification hỗ trợ gửi qua SMS, bạn nên định nghĩa phương thức `toVonage` trên class notification. Phương thức này nhận một entity `$notifiable` và phải trả về một instance `Illuminate\Notifications\Messages\VonageMessage`:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your SMS message content');
}
```

<a name="unicode-content"></a>
#### Nội dung Unicode

Nếu SMS chứa ký tự Unicode, bạn nên gọi phương thức `unicode` khi tạo instance `VonageMessage`:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your unicode message')
        ->unicode();
}
```

<a name="customizing-the-from-number"></a>
### Tùy chỉnh số điện thoại "From"

Nếu muốn gửi một số notification từ số điện thoại khác với số được cấu hình trong biến môi trường `VONAGE_SMS_FROM`, bạn có thể gọi phương thức `from` trên instance `VonageMessage`:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->content('Your SMS message content')
        ->from('15554443333');
}
```

<a name="adding-a-client-reference"></a>
### Thêm Client Reference

Nếu muốn theo dõi chi phí theo từng user, team hoặc client, bạn có thể thêm một "client reference" vào notification. Vonage cho phép tạo báo cáo dựa trên client reference này để bạn hiểu rõ hơn mức sử dụng SMS của từng khách hàng. Client reference có thể là bất kỳ chuỗi nào dài tối đa 40 ký tự:

```php
use Illuminate\Notifications\Messages\VonageMessage;

/**
 * Get the Vonage / SMS representation of the notification.
 */
public function toVonage(object $notifiable): VonageMessage
{
    return (new VonageMessage)
        ->clientReference((string) $notifiable->id)
        ->content('Your SMS message content');
}
```

<a name="routing-sms-notifications"></a>
### Định tuyến Notification SMS

Để định tuyến notification Vonage đến đúng số điện thoại, hãy định nghĩa phương thức `routeNotificationForVonage` trên notifiable entity:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the Vonage channel.
     */
    public function routeNotificationForVonage(Notification $notification): string
    {
        return $this->phone_number;
    }
}
```

<a name="slack-notifications"></a>
## Notification qua Slack

<a name="slack-prerequisites"></a>
### Điều kiện tiên quyết

Trước khi gửi notification Slack, bạn cần cài đặt Slack notification channel thông qua Composer:

```shell
composer require laravel/slack-notification-channel
```

Ngoài ra, bạn phải tạo một [Slack App](https://api.slack.com/apps?new_app=1) cho Slack workspace của mình.

Nếu chỉ cần gửi notification đến chính Slack workspace nơi App được tạo, hãy đảm bảo App có các scope `chat:write`, `chat:write.public` và `chat:write.customize`. Bạn có thể thêm các scope này từ tab quản lý App "OAuth & Permissions" trong Slack.

Tiếp theo, sao chép "Bot User OAuth Token" của App và đặt token đó vào mảng cấu hình `slack` trong file `services.php` của ứng dụng. Bạn có thể tìm token này trong tab "OAuth & Permissions" của Slack:

```php
'slack' => [
    'notifications' => [
        'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
        'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
    ],
],
```

<a name="slack-app-distribution"></a>
#### Phân phối ứng dụng

Nếu ứng dụng sẽ gửi notification đến các Slack workspace bên ngoài thuộc sở hữu của người dùng ứng dụng, bạn cần "phân phối" App thông qua Slack. Việc phân phối App có thể được quản lý từ tab "Manage Distribution" của App trong Slack. Sau khi App được phân phối, bạn có thể dùng [Socialite](/docs/{{version}}/socialite) để [lấy Slack Bot token](/docs/{{version}}/socialite#slack-bot-scopes) thay mặt người dùng ứng dụng.

<a name="formatting-slack-notifications"></a>
### Định dạng Notification Slack

Nếu một notification hỗ trợ gửi dưới dạng Slack message, bạn nên định nghĩa phương thức `toSlack` trên class notification. Phương thức này nhận một entity `$notifiable` và phải trả về instance `Illuminate\Notifications\Slack\SlackMessage`. Bạn có thể xây dựng notification phong phú bằng [Slack Block Kit API](https://api.slack.com/block-kit). Ví dụ sau có thể được xem trước trong [Slack Block Kit Builder](https://app.slack.com/block-kit-builder/T01KWS6K23Z#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Invoice%20Paid%22%7D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22plain_text%22,%22text%22:%22Customer%20%231234%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22An%20invoice%20has%20been%20paid.%22%7D,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20No:*%5Cn1000%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Invoice%20Recipient:*%5Cntaylor@laravel.com%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Congratulations!%22%7D%7D%5D%7D):

```php
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
            $block->field("*Invoice No:*\n1000")->markdown();
            $block->field("*Invoice Recipient:*\ntaylor@laravel.com")->markdown();
        })
        ->dividerBlock()
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('Congratulations!');
        });
}
```

<a name="using-slacks-block-kit-builder-template"></a>
#### Sử dụng template của Slack Block Kit Builder

Thay vì dùng các fluent method của message builder để dựng Block Kit message, bạn có thể truyền raw JSON payload do Slack Block Kit Builder tạo vào method `usingBlockKitTemplate`:

```php
use Illuminate\Notifications\Slack\SlackMessage;
use Illuminate\Support\Str;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    $template = <<<JSON
        {
          "blocks": [
            {
              "type": "header",
              "text": {
                "type": "plain_text",
                "text": "Team Announcement"
              }
            },
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": "We are hiring!"
              }
            }
          ]
        }
    JSON;

    return (new SlackMessage)
        ->usingBlockKitTemplate($template);
}
```

<a name="slack-interactivity"></a>
### Tương tác trong Slack

Hệ thống notification Block Kit của Slack cung cấp các tính năng mạnh để [xử lý tương tác người dùng](https://api.slack.com/interactivity/handling). Để dùng các tính năng này, Slack App của bạn cần bật "Interactivity" và cấu hình "Request URL" trỏ tới một URL do ứng dụng của bạn phục vụ. Bạn có thể quản lý các thiết lập này trong tab "Interactivity & Shortcuts" của trang quản trị Slack App.

Trong ví dụ sau sử dụng method `actionsBlock`, Slack sẽ gửi một `POST` request tới "Request URL" cùng payload chứa người dùng Slack đã nhấn button, ID của button đã nhấn và các dữ liệu khác. Ứng dụng của bạn sau đó có thể xác định hành động cần thực hiện dựa trên payload. Bạn cũng nên [xác minh request](https://api.slack.com/authentication/verifying-requests-from-slack) thực sự được gửi từ Slack:

```php
use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
        })
        ->actionsBlock(function (ActionsBlock $block) {
             // ID defaults to "button_acknowledge_invoice"...
            $block->button('Acknowledge Invoice')->primary();

            // Manually configure the ID...
            $block->button('Deny')->danger()->id('deny_invoice');
        });
}
```

<a name="slack-confirmation-modals"></a>
#### Modal xác nhận

Nếu muốn yêu cầu người dùng xác nhận trước khi thực hiện một action, bạn có thể gọi phương thức `confirm` khi định nghĩa button. Phương thức `confirm` nhận một message và một closure nhận instance `ConfirmObject`:

```php
use Illuminate\Notifications\Slack\BlockKit\Blocks\ActionsBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\ContextBlock;
use Illuminate\Notifications\Slack\BlockKit\Blocks\SectionBlock;
use Illuminate\Notifications\Slack\BlockKit\Composites\ConfirmObject;
use Illuminate\Notifications\Slack\SlackMessage;

/**
 * Get the Slack representation of the notification.
 */
public function toSlack(object $notifiable): SlackMessage
{
    return (new SlackMessage)
        ->text('One of your invoices has been paid!')
        ->headerBlock('Invoice Paid')
        ->contextBlock(function (ContextBlock $block) {
            $block->text('Customer #1234');
        })
        ->sectionBlock(function (SectionBlock $block) {
            $block->text('An invoice has been paid.');
        })
        ->actionsBlock(function (ActionsBlock $block) {
            $block->button('Acknowledge Invoice')
                ->primary()
                ->confirm(
                    'Acknowledge the payment and send a thank you email?',
                    function (ConfirmObject $dialog) {
                        $dialog->confirm('Yes');
                        $dialog->deny('No');
                    }
                );
        });
}
```

<a name="inspecting-slack-blocks"></a>
#### Kiểm tra Slack Block

Nếu muốn kiểm tra nhanh các block đang xây dựng, bạn có thể gọi phương thức `dd` trên instance `SlackMessage`. Phương thức `dd` sẽ tạo và dump một URL đến [Block Kit Builder](https://app.slack.com/block-kit-builder/) của Slack, nơi hiển thị bản xem trước payload và notification trong trình duyệt. Bạn có thể truyền `true` vào `dd` để dump raw payload:

```php
return (new SlackMessage)
    ->text('One of your invoices has been paid!')
    ->headerBlock('Invoice Paid')
    ->dd();
```

<a name="routing-slack-notifications"></a>
### Định tuyến Notification Slack

Để định tuyến notification Slack đến đúng Slack team và channel, hãy định nghĩa phương thức `routeNotificationForSlack` trên notifiable model. Phương thức này có thể trả về một trong ba giá trị:

- `null` - trì hoãn việc xác định route cho channel được cấu hình ngay trong notification. Bạn có thể dùng method `to` khi xây dựng `SlackMessage` để cấu hình channel trong notification.
- Một string chỉ định Slack channel nhận notification, ví dụ `#support-channel`.
- Một instance `SlackRoute`, cho phép bạn chỉ định OAuth token và channel name, ví dụ `SlackRoute::make($this->slack_channel, $this->slack_token)`. Cách này nên được dùng khi gửi notification tới workspace bên ngoài.

Ví dụ, trả về `#support-channel` từ phương thức `routeNotificationForSlack` sẽ gửi notification đến channel `#support-channel` trong workspace được liên kết với Bot User OAuth token nằm trong file cấu hình `services.php` của ứng dụng:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the Slack channel.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return '#support-channel';
    }
}
```

<a name="notifying-external-slack-workspaces"></a>
### Gửi Notification đến Slack Workspace bên ngoài

> [!NOTE]
> Trước khi gửi notification đến Slack workspace bên ngoài, Slack App của bạn phải được [phân phối](#slack-app-distribution).

Thông thường, bạn sẽ muốn gửi notification tới các Slack workspace thuộc sở hữu của người dùng ứng dụng. Để làm điều đó, trước tiên bạn cần lấy Slack OAuth token của người dùng. May mắn là [Laravel Socialite](/docs/{{version}}/socialite) có Slack driver giúp bạn dễ dàng xác thực người dùng ứng dụng với Slack và [lấy bot token](/docs/{{version}}/socialite#slack-bot-scopes).

Sau khi lấy bot token và lưu vào database của ứng dụng, bạn có thể sử dụng phương thức `SlackRoute::make` để định tuyến notification đến workspace của người dùng. Ngoài ra, ứng dụng thường cần cho phép người dùng chỉ định channel mà notification sẽ được gửi đến:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Slack\SlackRoute;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * Route notifications for the Slack channel.
     */
    public function routeNotificationForSlack(Notification $notification): mixed
    {
        return SlackRoute::make($this->slack_channel, $this->slack_token);
    }
}
```

<a name="localizing-notifications"></a>
## Bản địa hóa Notification

Laravel cho phép bạn gửi notification bằng locale khác với locale hiện tại của HTTP request, đồng thời vẫn ghi nhớ locale này nếu notification được đưa vào queue.

Để thực hiện điều này, class `Illuminate\Notifications\Notification` cung cấp phương thức `locale` để đặt ngôn ngữ mong muốn. Ứng dụng sẽ chuyển sang locale này khi notification được xử lý, sau đó quay lại locale trước đó khi hoàn tất:

```php
$user->notify((new InvoicePaid($invoice))->locale('es'));
```

Bạn cũng có thể bản địa hóa nhiều entity nhận notification thông qua facade `Notification`:

```php
Notification::locale('es')->send(
    $users, new InvoicePaid($invoice)
);
```

<a name="user-preferred-locales"></a>
#### Locale ưu tiên của người dùng

Đôi khi ứng dụng lưu locale ưu tiên của từng người dùng. Bằng cách implement contract `HasLocalePreference` trên model có thể nhận notification, bạn có thể yêu cầu Laravel sử dụng locale đã lưu khi gửi notification:

```php
use Illuminate\Contracts\Translation\HasLocalePreference;

class User extends Model implements HasLocalePreference
{
    /**
     * Get the user's preferred locale.
     */
    public function preferredLocale(): string
    {
        return $this->locale;
    }
}
```

Sau khi implement interface này, Laravel sẽ tự động sử dụng locale ưu tiên khi gửi notification và mailable tới model. Vì vậy, bạn không cần gọi phương thức `locale` khi sử dụng interface này:

```php
$user->notify(new InvoicePaid($invoice));
```

<a name="testing"></a>
## Kiểm thử

Bạn có thể dùng phương thức `fake` của facade `Notification` để ngăn notification thực sự được gửi. Thông thường, việc gửi notification không liên quan trực tiếp đến phần code bạn đang kiểm thử. Trong đa số trường hợp, chỉ cần assert rằng Laravel đã được yêu cầu gửi một notification cụ thể là đủ.

Sau khi gọi phương thức `fake` của facade `Notification`, bạn có thể assert rằng notification đã được yêu cầu gửi tới người dùng và thậm chí kiểm tra dữ liệu mà notification nhận được:

```php tab=Pest
<?php

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;

test('orders can be shipped', function () {
    Notification::fake();

    // Perform order shipping...

    // Assert that no notifications were sent...
    Notification::assertNothingSent();

    // Assert a notification was sent to the given users...
    Notification::assertSentTo(
        [$user], OrderShipped::class
    );

    // Assert a notification was not sent...
    Notification::assertNotSentTo(
        [$user], AnotherNotification::class
    );

    // Assert a notification was sent twice...
    Notification::assertSentTimes(WeeklyReminder::class, 2);

    // Assert that a given number of notifications were sent...
    Notification::assertCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Notifications\OrderShipped;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Notification::fake();

        // Perform order shipping...

        // Assert that no notifications were sent...
        Notification::assertNothingSent();

        // Assert a notification was sent to the given users...
        Notification::assertSentTo(
            [$user], OrderShipped::class
        );

        // Assert a notification was not sent...
        Notification::assertNotSentTo(
            [$user], AnotherNotification::class
        );

        // Assert a notification was sent twice...
        Notification::assertSentTimes(WeeklyReminder::class, 2);

        // Assert that a given number of notifications were sent...
        Notification::assertCount(3);
    }
}
```

Bạn có thể truyền closure vào phương thức `assertSentTo` hoặc `assertNotSentTo` để assert rằng một notification thỏa mãn "truth test" đã được gửi. Nếu có ít nhất một notification được gửi và vượt qua truth test đã cho, assertion sẽ thành công:

```php
Notification::assertSentTo(
    $user,
    function (OrderShipped $notification, array $channels) use ($order) {
        return $notification->order->id === $order->id;
    }
);
```

<a name="testing-on-demand-notifications"></a>
#### Thông báo theo yêu cầu

Nếu code đang kiểm thử gửi [notification theo yêu cầu](#on-demand-notifications), bạn có thể kiểm tra notification đó đã được gửi bằng phương thức `assertSentOnDemand`:

```php
Notification::assertSentOnDemand(OrderShipped::class);
```

Bằng cách truyền closure làm đối số thứ hai cho phương thức `assertSentOnDemand`, bạn có thể xác định notification theo yêu cầu có được gửi tới đúng địa chỉ "route" hay không:

```php
Notification::assertSentOnDemand(
    OrderShipped::class,
    function (OrderShipped $notification, array $channels, object $notifiable) use ($user) {
        return $notifiable->routes['mail'] === $user->email;
    }
);
```

<a name="notification-events"></a>
## Event của Notification

<a name="notification-sending-event"></a>
#### Event Notification Sending

Khi một notification đang được gửi, hệ thống notification sẽ dispatch event `Illuminate\Notifications\Events\NotificationSending`. Event này chứa entity "notifiable" và chính instance notification. Bạn có thể tạo [event listener](/docs/{{version}}/events) cho event này trong ứng dụng:

```php
use Illuminate\Notifications\Events\NotificationSending;

class CheckNotificationStatus
{
    /**
     * Handle the event.
     */
    public function handle(NotificationSending $event): void
    {
        // ...
    }
}
```

Notification sẽ không được gửi nếu một event listener của event `NotificationSending` trả về `false` từ phương thức `handle`:

```php
/**
 * Handle the event.
 */
public function handle(NotificationSending $event): bool
{
    return false;
}
```

Trong event listener, bạn có thể truy cập các thuộc tính `notifiable`, `notification` và `channel` trên event để biết thêm thông tin về người nhận hoặc chính notification:

```php
/**
 * Handle the event.
 */
public function handle(NotificationSending $event): void
{
    // $event->channel
    // $event->notifiable
    // $event->notification
}
```

<a name="notification-sent-event"></a>
#### Event Notification Sent

Khi một notification được gửi, hệ thống notification sẽ dispatch [event](/docs/{{version}}/events) `Illuminate\Notifications\Events\NotificationSent`. Event này chứa entity "notifiable" và chính instance notification. Bạn có thể tạo [event listener](/docs/{{version}}/events) cho event này trong ứng dụng:

```php
use Illuminate\Notifications\Events\NotificationSent;

class LogNotification
{
    /**
     * Handle the event.
     */
    public function handle(NotificationSent $event): void
    {
        // ...
    }
}
```

Trong event listener, bạn có thể truy cập các thuộc tính `notifiable`, `notification`, `channel` và `response` trên event để biết thêm thông tin về người nhận hoặc chính notification:

```php
/**
 * Handle the event.
 */
public function handle(NotificationSent $event): void
{
    // $event->channel
    // $event->notifiable
    // $event->notification
    // $event->response
}
```

<a name="custom-channels"></a>
## Channel tùy chỉnh

Laravel cung cấp sẵn một số notification channel, nhưng bạn có thể muốn tự viết driver để gửi notification qua các channel khác. Laravel giúp việc này khá đơn giản. Để bắt đầu, hãy định nghĩa một class có phương thức `send`. Phương thức này nhận hai đối số: `$notifiable` và `$notification`.

Trong phương thức `send`, bạn có thể gọi các phương thức trên notification để lấy message object mà channel của bạn hiểu được, sau đó gửi notification tới instance `$notifiable` theo cách mong muốn:

```php
<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class VoiceChannel
{
    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        $message = $notification->toVoice($notifiable);

        // Send notification to the $notifiable instance...
    }
}
```

Sau khi định nghĩa class notification channel, bạn có thể trả về tên class đó từ phương thức `via` của bất kỳ notification nào. Trong ví dụ này, phương thức `toVoice` của notification có thể trả về bất kỳ object nào bạn chọn để biểu diễn voice message. Chẳng hạn, bạn có thể tự định nghĩa class `VoiceMessage` để biểu diễn các message này:

```php
<?php

namespace App\Notifications;

use App\Notifications\Messages\VoiceMessage;
use App\Notifications\VoiceChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvoicePaid extends Notification
{
    use Queueable;

    /**
     * Get the notification channels.
     */
    public function via(object $notifiable): string
    {
        return VoiceChannel::class;
    }

    /**
     * Get the voice representation of the notification.
     */
    public function toVoice(object $notifiable): VoiceMessage
    {
        // ...
    }
}
```

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/notifications). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
