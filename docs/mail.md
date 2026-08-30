# Mail

- [Giới thiệu](#introduction)
    - [Cấu hình](#configuration)
    - [Điều kiện tiên quyết của driver](#driver-prerequisites)
    - [Cấu hình failover](#failover-configuration)
    - [Cấu hình Round Robin](#round-robin-configuration)
- [Tạo Mailable](#generating-mailables)
- [Viết Mailable](#writing-mailables)
    - [Cấu hình người gửi](#configuring-the-sender)
    - [Cấu hình view](#configuring-the-view)
    - [Dữ liệu view](#view-data)
    - [Tệp đính kèm](#attachments)
    - [Tệp đính kèm nội tuyến](#inline-attachments)
    - [Đối tượng có thể đính kèm](#attachable-objects)
    - [Header](#headers)
    - [Tag và metadata](#tags-and-metadata)
    - [Tùy chỉnh Symfony Message](#customizing-the-symfony-message)
- [Markdown Mailable](#markdown-mailables)
    - [Tạo Markdown Mailable](#generating-markdown-mailables)
    - [Viết Markdown Message](#writing-markdown-messages)
    - [Tùy chỉnh component](#customizing-the-components)
- [Gửi mail](#sending-mail)
    - [Đưa mail vào queue](#queueing-mail)
- [Render Mailable](#rendering-mailables)
    - [Xem trước Mailable trong trình duyệt](#previewing-mailables-in-the-browser)
- [Bản địa hóa Mailable](#localizing-mailables)
- [Kiểm thử](#testing-mailables)
    - [Kiểm thử nội dung Mailable](#testing-mailable-content)
    - [Kiểm thử việc gửi Mailable](#testing-mailable-sending)
- [Mail và môi trường phát triển local](#mail-and-local-development)
- [Event](#events)
- [Transport tùy chỉnh](#custom-transports)
    - [Các Symfony Transport bổ sung](#additional-symfony-transports)

<a name="introduction"></a>
## Giới thiệu

Việc gửi email không nhất thiết phải phức tạp. Laravel cung cấp một API email gọn gàng, đơn giản, được xây dựng trên component [Symfony Mailer](https://symfony.com/doc/current/mailer.html) phổ biến. Laravel và Symfony Mailer cung cấp các driver để gửi email qua SMTP, Cloudflare, Mailgun, Postmark, Resend, Amazon SES và `sendmail`, giúp bạn nhanh chóng bắt đầu gửi mail thông qua dịch vụ local hoặc dịch vụ đám mây tùy chọn.

<a name="configuration"></a>
### Cấu hình

Các dịch vụ email của Laravel có thể được cấu hình thông qua file `config/mail.php` của ứng dụng. Mỗi mailer được khai báo trong file này có thể có cấu hình riêng, thậm chí sử dụng một "transport" riêng, cho phép ứng dụng dùng các dịch vụ email khác nhau cho từng loại thư. Ví dụ, ứng dụng có thể dùng Postmark để gửi email giao dịch và Amazon SES để gửi email hàng loạt.

Trong file cấu hình `mail`, bạn sẽ thấy mảng cấu hình `mailers`. Mảng này chứa cấu hình mẫu cho từng driver / transport mail chính mà Laravel hỗ trợ, trong khi giá trị cấu hình `default` xác định mailer mặc định được sử dụng khi ứng dụng cần gửi email.

<a name="driver-prerequisites"></a>
### Điều kiện tiên quyết của Driver / Transport

Các driver dựa trên API như Mailgun, Postmark và Resend thường đơn giản và nhanh hơn so với gửi mail qua máy chủ SMTP. Khi có thể, chúng tôi khuyến nghị sử dụng một trong các driver này.

<a name="cloudflare-driver"></a>
#### Driver Cloudflare

Để sử dụng driver Cloudflare, hãy cài đặt HTTP Client của Symfony qua Composer:

```shell
composer require symfony/http-client
```

Tiếp theo, bạn cần thực hiện hai thay đổi trong file cấu hình `config/mail.php` của ứng dụng. Đầu tiên, đặt mailer mặc định thành `cloudflare`:

```php
'default' => env('MAIL_MAILER', 'cloudflare'),
```

Thứ hai, thêm mảng cấu hình sau vào mảng `mailers`:

```php
'cloudflare' => [
    'transport' => 'cloudflare',
],
```

Sau khi cấu hình mailer mặc định của ứng dụng, hãy thêm các tùy chọn sau vào file cấu hình `config/services.php`:

```php
'cloudflare' => [
    'account_id' => env('CLOUDFLARE_ACCOUNT_ID'),
    'key' => env('CLOUDFLARE_KEY'),
],
```

<a name="mailgun-driver"></a>
#### Driver Mailgun

Để sử dụng driver Mailgun, hãy cài đặt transport Mailgun Mailer của Symfony qua Composer:

```shell
composer require symfony/mailgun-mailer symfony/http-client
```

Tiếp theo, bạn cần thực hiện hai thay đổi trong file cấu hình `config/mail.php` của ứng dụng. Trước tiên, hãy đặt mailer mặc định thành `mailgun`:

```php
'default' => env('MAIL_MAILER', 'mailgun'),
```

Thứ hai, thêm mảng cấu hình sau vào mảng `mailers`:

```php
'mailgun' => [
    'transport' => 'mailgun',
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

Sau khi cấu hình mailer mặc định của ứng dụng, hãy thêm các tùy chọn sau vào file cấu hình `config/services.php`:

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    'scheme' => 'https',
],
```

Nếu không sử dụng [region Mailgun](https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview#mailgun-regions) tại Hoa Kỳ, bạn có thể khai báo endpoint của region đang dùng trong file cấu hình `services`:

```php
'mailgun' => [
    'domain' => env('MAILGUN_DOMAIN'),
    'secret' => env('MAILGUN_SECRET'),
    'endpoint' => env('MAILGUN_ENDPOINT', 'api.eu.mailgun.net'),
    'scheme' => 'https',
],
```

<a name="postmark-driver"></a>
#### Driver Postmark

Để sử dụng driver [Postmark](https://postmarkapp.com/), hãy cài đặt transport Postmark Mailer của Symfony qua Composer:

```shell
composer require symfony/postmark-mailer symfony/http-client
```

Tiếp theo, đặt tùy chọn `default` trong file cấu hình `config/mail.php` thành `postmark`. Sau khi cấu hình mailer mặc định, hãy bảo đảm file `config/services.php` chứa các tùy chọn sau:

```php
'postmark' => [
    'key' => env('POSTMARK_API_KEY'),
],
```

Nếu muốn chỉ định message stream của Postmark mà một mailer sẽ sử dụng, bạn có thể thêm tùy chọn `message_stream_id` vào mảng cấu hình của mailer. Mảng cấu hình này nằm trong file `config/mail.php` của ứng dụng:

```php
'postmark' => [
    'transport' => 'postmark',
    'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
    // 'client' => [
    //     'timeout' => 5,
    // ],
],
```

Theo cách này, bạn cũng có thể thiết lập nhiều mailer Postmark với các message stream khác nhau.

<a name="resend-driver"></a>
#### Driver Resend

Để sử dụng driver [Resend](https://resend.com/), hãy cài đặt PHP SDK của Resend qua Composer:

```shell
composer require resend/resend-php
```

Tiếp theo, đặt tùy chọn `default` trong file cấu hình `config/mail.php` thành `resend`. Sau khi cấu hình mailer mặc định, hãy bảo đảm file `config/services.php` chứa các tùy chọn sau:

```php
'resend' => [
    'key' => env('RESEND_API_KEY'),
],
```

<a name="ses-driver"></a>
#### Driver SES

Để sử dụng driver Amazon SES, trước tiên bạn phải cài đặt Amazon AWS SDK for PHP. Bạn có thể cài thư viện này bằng Composer:

```shell
composer require aws/aws-sdk-php
```

Tiếp theo, đặt tùy chọn `default` trong file cấu hình `config/mail.php` thành `ses` và kiểm tra file `config/services.php` có các tùy chọn sau:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
],
```

Để sử dụng [temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html) của AWS thông qua session token, bạn có thể thêm key `token` vào cấu hình SES của ứng dụng:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'token' => env('AWS_SESSION_TOKEN'),
],
```

Để tương tác với [các tính năng quản lý subscription](https://docs.aws.amazon.com/ses/latest/dg/sending-email-subscription-management.html) của SES, bạn có thể trả về header `X-Ses-List-Management-Options` trong mảng được phương thức [headers](#headers) của mail message trả về:

```php
/**
 * Get the message headers.
 */
public function headers(): Headers
{
    return new Headers(
        text: [
            'X-Ses-List-Management-Options' => 'contactListName=MyContactList;topicName=MyTopic',
        ],
    );
}
```

Để gửi email thông qua một [tenant](https://docs.aws.amazon.com/ses/latest/dg/tenants.html) của SES, bạn có thể trả về header `X-Ses-Tenant-Name` từ phương thức `headers`. Laravel sẽ truyền giá trị header này dưới dạng tùy chọn `TenantName` cho SES khi gửi message:

```php
public function headers(): Headers
{
    return new Headers(
        text: [
            'X-Ses-Tenant-Name' => 'tenant-id',
        ],
    );
}
```

Nếu muốn định nghĩa [các tùy chọn bổ sung](https://docs.aws.amazon.com/aws-sdk-php/v3/api/api-sesv2-2019-09-27.html#sendemail) mà Laravel sẽ truyền cho phương thức `SendEmail` của AWS SDK khi gửi email, bạn có thể định nghĩa mảng `options` trong cấu hình `ses`:

```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'options' => [
        'ConfigurationSetName' => 'MyConfigurationSet',
        'EmailTags' => [
            ['Name' => 'foo', 'Value' => 'bar'],
        ],
    ],
],
```

<a name="failover-configuration"></a>
### Cấu hình Failover

Đôi khi dịch vụ bên ngoài được cấu hình để gửi mail cho ứng dụng có thể ngừng hoạt động. Trong trường hợp này, việc định nghĩa một hoặc nhiều cấu hình gửi mail dự phòng sẽ hữu ích để sử dụng khi driver gửi mail chính gặp sự cố.

Để thực hiện điều này, hãy định nghĩa một mailer sử dụng transport `failover` trong file cấu hình `mail` của ứng dụng. Mảng cấu hình của mailer `failover` cần chứa mảng `mailers`, xác định thứ tự các mailer đã cấu hình sẽ được chọn để gửi:

```php
'mailers' => [
    'failover' => [
        'transport' => 'failover',
        'mailers' => [
            'postmark',
            'mailgun',
            'sendmail',
        ],
        'retry_after' => 60,
    ],

    // ...
],
```

Sau khi cấu hình mailer sử dụng transport `failover`, bạn cần đặt mailer failover làm mailer mặc định trong file `.env` của ứng dụng để sử dụng chức năng failover:

```ini
MAIL_MAILER=failover
```

<a name="round-robin-configuration"></a>
### Cấu hình Round Robin

Transport `roundrobin` cho phép phân phối khối lượng gửi mail giữa nhiều mailer. Để bắt đầu, hãy định nghĩa một mailer sử dụng transport `roundrobin` trong file cấu hình `mail` của ứng dụng. Mảng cấu hình của mailer `roundrobin` cần chứa mảng `mailers`, xác định các mailer đã cấu hình sẽ được sử dụng để gửi:

```php
'mailers' => [
    'roundrobin' => [
        'transport' => 'roundrobin',
        'mailers' => [
            'ses',
            'postmark',
        ],
        'retry_after' => 60,
    ],

    // ...
],
```

Sau khi định nghĩa mailer round robin, hãy đặt mailer này làm mailer mặc định của ứng dụng bằng cách chỉ định tên của nó làm giá trị cho key cấu hình `default` trong file cấu hình `mail`:

```php
'default' => env('MAIL_MAILER', 'roundrobin'),
```

Transport round robin chọn ngẫu nhiên một mailer từ danh sách đã cấu hình, sau đó chuyển sang mailer khả dụng tiếp theo cho mỗi email kế tiếp. Khác với transport `failover`, vốn giúp đạt được *[tính sẵn sàng cao](https://en.wikipedia.org/wiki/High_availability)*, transport `roundrobin` cung cấp *[cân bằng tải](https://en.wikipedia.org/wiki/Load_balancing_(computing))*.

<a name="generating-mailables"></a>
## Tạo Mailable

Khi xây dựng ứng dụng Laravel, mỗi loại email mà ứng dụng gửi được biểu diễn bằng một class "mailable". Các class này được lưu trong thư mục `app/Mail`. Nếu chưa thấy thư mục này trong ứng dụng thì cũng không cần lo lắng, vì Laravel sẽ tự tạo nó khi bạn tạo class mailable đầu tiên bằng lệnh Artisan `make:mail`:

```shell
php artisan make:mail OrderShipped
```

<a name="writing-mailables"></a>
## Xây dựng Mailable

Sau khi tạo class mailable, hãy mở class đó để xem nội dung. Việc cấu hình mailable được thực hiện thông qua một số phương thức, bao gồm `envelope`, `content` và `attachments`.

Phương thức `envelope` trả về đối tượng `Illuminate\Mail\Mailables\Envelope`, dùng để định nghĩa tiêu đề và đôi khi cả người nhận của message. Phương thức `content` trả về đối tượng `Illuminate\Mail\Mailables\Content`, dùng để định nghĩa [Blade template](/docs/{{version}}/blade) sẽ được sử dụng để tạo nội dung message.

<a name="configuring-the-sender"></a>
### Cấu hình người gửi

<a name="using-the-envelope"></a>
#### Sử dụng Envelope

Trước tiên, hãy tìm hiểu cách cấu hình người gửi email, hay nói cách khác là địa chỉ mà email sẽ được gửi "từ" đó. Có hai cách để cấu hình người gửi. Cách đầu tiên là chỉ định địa chỉ `from` trên envelope của message:

```php
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Get the message envelope.
 */
public function envelope(): Envelope
{
    return new Envelope(
        from: new Address('jeffrey@example.com', 'Jeffrey Way'),
        subject: 'Order Shipped',
    );
}
```

Nếu muốn, bạn cũng có thể chỉ định địa chỉ `replyTo`:

```php
return new Envelope(
    from: new Address('jeffrey@example.com', 'Jeffrey Way'),
    replyTo: [
        new Address('taylor@example.com', 'Taylor Otwell'),
    ],
    subject: 'Order Shipped',
);
```

<a name="using-a-global-from-address"></a>
#### Sử dụng địa chỉ `from` toàn cục

Tuy nhiên, nếu ứng dụng sử dụng cùng một địa chỉ `from` cho tất cả email, việc thêm địa chỉ đó vào từng class mailable sẽ khá bất tiện. Thay vào đó, bạn có thể chỉ định địa chỉ `from` toàn cục trong file cấu hình `config/mail.php`. Địa chỉ này sẽ được sử dụng khi class mailable không chỉ định địa chỉ `from` khác:

```php
'from' => [
    'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
    'name' => env('MAIL_FROM_NAME', 'Example'),
],
```

Ngoài ra, bạn có thể định nghĩa địa chỉ `reply_to` toàn cục trong file cấu hình `config/mail.php`:

```php
'reply_to' => [
    'address' => 'example@example.com',
    'name' => 'App Name',
],
```

<a name="configuring-the-view"></a>
### Cấu hình View

Trong phương thức `content` của class mailable, bạn có thể định nghĩa `view`, tức template sẽ được sử dụng khi render nội dung email. Vì mỗi email thường sử dụng [Blade template](/docs/{{version}}/blade) để render nội dung, bạn có thể tận dụng đầy đủ sức mạnh và sự tiện lợi của Blade khi xây dựng HTML cho email:

```php
/**
 * Get the message content definition.
 */
public function content(): Content
{
    return new Content(
        view: 'mail.orders.shipped',
    );
}
```

> [!NOTE]
> Bạn có thể tạo thư mục `resources/views/mail` để chứa toàn bộ template email; tuy nhiên, bạn vẫn có thể đặt chúng ở bất kỳ vị trí nào trong thư mục `resources/views`.

<a name="plain-text-emails"></a>
#### Email dạng văn bản thuần

Nếu muốn định nghĩa phiên bản văn bản thuần cho email, bạn có thể chỉ định template văn bản thuần khi tạo định nghĩa `Content` của message. Tương tự tham số `view`, tham số `text` phải là tên template dùng để render nội dung email. Bạn có thể định nghĩa đồng thời cả phiên bản HTML và văn bản thuần của message:

```php
/**
 * Get the message content definition.
 */
public function content(): Content
{
    return new Content(
        view: 'mail.orders.shipped',
        text: 'mail.orders.shipped-text'
    );
}
```

Để rõ nghĩa hơn, có thể sử dụng tham số `html` như một alias của tham số `view`:

```php
return new Content(
    html: 'mail.orders.shipped',
    text: 'mail.orders.shipped-text'
);
```

<a name="view-data"></a>
### Dữ liệu của View

<a name="via-public-properties"></a>
#### Thông qua thuộc tính public

Thông thường, bạn sẽ muốn truyền dữ liệu vào view để sử dụng khi render HTML của email. Có hai cách để cung cấp dữ liệu cho view. Cách đầu tiên là mọi thuộc tính public được định nghĩa trên class mailable sẽ tự động khả dụng trong view. Ví dụ, bạn có thể truyền dữ liệu vào constructor của class mailable và gán dữ liệu đó cho các thuộc tính public của class:

```php
<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Order $order,
    ) {}

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.orders.shipped',
        );
    }
}
```

Sau khi dữ liệu được gán vào thuộc tính public, dữ liệu đó sẽ tự động khả dụng trong view và bạn có thể truy cập giống như mọi dữ liệu khác trong Blade template:

```blade
<div>
    Price: {{ $order->price }}
</div>
```

<a name="via-the-with-parameter"></a>
#### Thông qua tham số `with`

Nếu muốn tùy chỉnh định dạng dữ liệu email trước khi truyền vào template, bạn có thể truyền dữ liệu thủ công vào view thông qua tham số `with` của định nghĩa `Content`. Thông thường, dữ liệu vẫn được truyền qua constructor của class mailable; tuy nhiên, bạn nên lưu dữ liệu trong thuộc tính `protected` hoặc `private` để chúng không tự động được cung cấp cho template:

```php
<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        protected Order $order,
    ) {}

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.orders.shipped',
            with: [
                'orderName' => $this->order->name,
                'orderPrice' => $this->order->price,
            ],
        );
    }
}
```

Sau khi dữ liệu được truyền qua tham số `with`, dữ liệu đó sẽ tự động khả dụng trong view và bạn có thể truy cập giống như mọi dữ liệu khác trong Blade template:

```blade
<div>
    Price: {{ $orderPrice }}
</div>
```

<a name="attachments"></a>
### File đính kèm

Để thêm file đính kèm vào email, hãy thêm chúng vào mảng được phương thức `attachments` của message trả về. Trước tiên, bạn có thể thêm file đính kèm bằng cách truyền đường dẫn file vào phương thức `fromPath` của class `Attachment`:

```php
use Illuminate\Mail\Mailables\Attachment;

/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromPath('/path/to/file'),
    ];
}
```

Khi đính kèm file vào message, bạn cũng có thể chỉ định tên hiển thị và/hoặc MIME type của file bằng các phương thức `as` và `withMime`:

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromPath('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a name="attaching-files-from-disk"></a>
#### Đính kèm file từ disk

Nếu đã lưu file trên một trong các [filesystem disk](/docs/{{version}}/filesystem), bạn có thể đính kèm file đó vào email bằng phương thức `fromStorage`:

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file'),
    ];
}
```

Tất nhiên, bạn cũng có thể chỉ định tên và MIME type của file đính kèm:

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

Có thể sử dụng phương thức `fromStorageDisk` nếu cần chỉ định storage disk khác với disk mặc định:

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromStorageDisk('s3', '/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a name="raw-data-attachments"></a>
#### Đính kèm dữ liệu thô

Phương thức `fromData` có thể được dùng để đính kèm một chuỗi byte thô. Ví dụ, bạn có thể sử dụng phương thức này khi đã tạo PDF trong bộ nhớ và muốn đính kèm vào email mà không ghi file ra disk. Phương thức `fromData` nhận một closure trả về dữ liệu byte thô và tên sẽ được gán cho file đính kèm:

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [
        Attachment::fromData(fn () => $this->pdf, 'Report.pdf')
            ->withMime('application/pdf'),
    ];
}
```

<a name="inline-attachments"></a>
### File đính kèm inline

Việc nhúng ảnh inline vào email thường khá bất tiện; tuy nhiên, Laravel cung cấp một cách thuận tiện để đính kèm ảnh. Để nhúng ảnh inline, hãy sử dụng phương thức `embed` trên biến `$message` trong template email. Laravel tự động cung cấp biến `$message` cho mọi template email, vì vậy bạn không cần truyền biến này thủ công:

```blade
<body>
    Here is an image:

    <img src="{{ $message->embed($pathToImage) }}">
</body>
```

> [!WARNING]
> Biến `$message` không khả dụng trong template message dạng văn bản thuần vì loại message này không sử dụng file đính kèm inline.

<a name="embedding-raw-data-attachments"></a>
#### Nhúng file đính kèm từ dữ liệu thô

Nếu đã có chuỗi dữ liệu ảnh thô muốn nhúng vào template email, bạn có thể gọi phương thức `embedData` trên biến `$message`. Khi gọi `embedData`, bạn cần cung cấp tên file sẽ được gán cho ảnh được nhúng:

```blade
<body>
    Here is an image from raw data:

    <img src="{{ $message->embedData($data, 'example-image.jpg') }}">
</body>
```

<a name="attachable-objects"></a>
### Đối tượng có thể đính kèm

Mặc dù đính kèm file vào message bằng đường dẫn chuỗi thường đã đủ, trong nhiều trường hợp các thực thể có thể đính kèm trong ứng dụng lại được biểu diễn bằng class. Ví dụ, nếu ứng dụng đính kèm một ảnh vào message, ứng dụng cũng có thể có model `Photo` đại diện cho ảnh đó. Khi ấy, sẽ thuận tiện hơn nếu có thể truyền trực tiếp model `Photo` vào phương thức `attach`. Các đối tượng có thể đính kèm cho phép bạn làm chính xác điều đó.

Để bắt đầu, hãy implement interface `Illuminate\Contracts\Mail\Attachable` trên đối tượng sẽ được đính kèm vào message. Interface này yêu cầu class định nghĩa phương thức `toMailAttachment` trả về một instance `Illuminate\Mail\Attachment`:

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Mail\Attachable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Mail\Attachment;

class Photo extends Model implements Attachable
{
    /**
     * Get the attachable representation of the model.
     */
    public function toMailAttachment(): Attachment
    {
        return Attachment::fromPath('/path/to/file');
    }
}
```

Sau khi đã định nghĩa đối tượng có thể đính kèm, bạn có thể trả về một instance của đối tượng đó từ phương thức `attachments` khi xây dựng email:

```php
/**
 * Get the attachments for the message.
 *
 * @return array<int, \Illuminate\Mail\Mailables\Attachment>
 */
public function attachments(): array
{
    return [$this->photo];
}
```

Dữ liệu đính kèm có thể được lưu trên dịch vụ lưu trữ file từ xa như Amazon S3. Vì vậy, Laravel cũng cho phép bạn tạo các instance attachment từ dữ liệu được lưu trên một trong các [filesystem disk](/docs/{{version}}/filesystem) của ứng dụng:

```php
// Create an attachment from a file on your default disk...
return Attachment::fromStorage($this->path);

// Create an attachment from a file on a specific disk...
return Attachment::fromStorageDisk('backblaze', $this->path);
```

Ngoài ra, bạn có thể tạo instance attachment từ dữ liệu đang có trong bộ nhớ. Để thực hiện, hãy truyền một closure vào phương thức `fromData`. Closure phải trả về dữ liệu thô đại diện cho file đính kèm:

```php
return Attachment::fromData(fn () => $this->content, 'Photo Name');
```

Laravel cũng cung cấp thêm các phương thức để tùy chỉnh tệp đính kèm. Ví dụ, bạn có thể dùng `as` và `withMime` để tùy chỉnh tên file và MIME type:

```php
return Attachment::fromPath('/path/to/file')
    ->as('Photo Name')
    ->withMime('image/jpeg');
```

<a name="headers"></a>
### Header

Đôi khi bạn cần thêm các header bổ sung vào message gửi đi. Chẳng hạn, bạn có thể cần đặt `Message-Id` tùy chỉnh hoặc các text header khác.

Để thực hiện, hãy định nghĩa phương thức `headers` trên mailable. Phương thức `headers` phải trả về một instance `Illuminate\Mail\Mailables\Headers`. Class này nhận các tham số `messageId`, `references` và `text`. Tất nhiên, bạn chỉ cần truyền những tham số cần thiết cho message cụ thể của mình:

```php
use Illuminate\Mail\Mailables\Headers;

/**
 * Get the message headers.
 */
public function headers(): Headers
{
    return new Headers(
        messageId: 'custom-message-id@example.com',
        references: ['previous-message@example.com'],
        text: [
            'X-Custom-Header' => 'Custom Value',
        ],
    );
}
```

<a name="tags-and-metadata"></a>
### Tag và metadata

Một số nhà cung cấp email bên thứ ba như Mailgun và Postmark hỗ trợ `tags` và `metadata` cho message, có thể dùng để nhóm và theo dõi các email do ứng dụng gửi. Bạn có thể thêm tag và metadata vào email thông qua định nghĩa `Envelope`:

```php
use Illuminate\Mail\Mailables\Envelope;

/**
 * Get the message envelope.
 *
 * @return \Illuminate\Mail\Mailables\Envelope
 */
public function envelope(): Envelope
{
    return new Envelope(
        subject: 'Order Shipped',
        tags: ['shipment'],
        metadata: [
            'order_id' => $this->order->id,
        ],
    );
}
```

Nếu ứng dụng sử dụng driver Mailgun, bạn có thể tham khảo tài liệu Mailgun để biết thêm về [tags](https://documentation.mailgun.com/docs/mailgun/user-manual/tracking-messages/#tags) và [metadata](https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#attaching-metadata-to-messages). Tương tự, tài liệu Postmark cung cấp thêm thông tin về hỗ trợ [tags](https://postmarkapp.com/blog/tags-support-for-smtp) và [metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq).

Nếu ứng dụng sử dụng Amazon SES để gửi email, hãy dùng phương thức `metadata` để gắn [SES "tags"](https://docs.aws.amazon.com/ses/latest/APIReference/API_MessageTag.html) vào message.

<a name="customizing-the-symfony-message"></a>
### Tùy chỉnh Symfony Message

Khả năng gửi mail của Laravel được xây dựng trên Symfony Mailer. Laravel cho phép đăng ký các callback tùy chỉnh, được gọi với instance Symfony Message trước khi message được gửi. Nhờ đó, bạn có thể tùy chỉnh sâu message trước khi gửi. Để thực hiện, hãy định nghĩa tham số `using` trong `Envelope`:

```php
use Illuminate\Mail\Mailables\Envelope;
use Symfony\Component\Mime\Email;

/**
 * Get the message envelope.
 */
public function envelope(): Envelope
{
    return new Envelope(
        subject: 'Order Shipped',
        using: [
            function (Email $message) {
                // ...
            },
        ]
    );
}
```

<a name="markdown-mailables"></a>
## Mailable Markdown

Mailable Markdown cho phép bạn tận dụng các template và component dựng sẵn của [mail notification](/docs/{{version}}/notifications#mail-notifications). Vì message được viết bằng Markdown, Laravel có thể render template HTML đẹp, responsive, đồng thời tự động tạo phiên bản plain-text tương ứng.

<a name="generating-markdown-mailables"></a>
### Tạo Mailable Markdown

Để tạo mailable cùng template Markdown tương ứng, bạn có thể dùng tùy chọn `--markdown` của lệnh Artisan `make:mail`:

```shell
php artisan make:mail OrderShipped --markdown=mail.orders.shipped
```

Sau đó, khi cấu hình định nghĩa `Content` của mailable trong phương thức `content`, hãy dùng tham số `markdown` thay cho `view`:

```php
use Illuminate\Mail\Mailables\Content;

/**
 * Get the message content definition.
 */
public function content(): Content
{
    return new Content(
        markdown: 'mail.orders.shipped',
        with: [
            'url' => $this->orderUrl,
        ],
    );
}
```

<a name="writing-markdown-messages"></a>
### Viết message Markdown

Mailable Markdown kết hợp Blade component với cú pháp Markdown, giúp bạn dễ dàng xây dựng mail message đồng thời tận dụng các UI component email dựng sẵn của Laravel:

```blade
<x-mail::message>
# Order Shipped

Your order has been shipped!

<x-mail::button :url="$url">
View Order
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
```

> [!NOTE]
> Không sử dụng thụt lề quá mức khi viết email Markdown. Theo chuẩn Markdown, parser sẽ render nội dung được thụt lề thành code block.

<a name="button-component"></a>
#### Component Button

Component button render một liên kết dạng nút được căn giữa. Component nhận hai đối số: `url` và `color` tùy chọn. Các màu được hỗ trợ gồm `primary`, `success` và `error`. Bạn có thể thêm bao nhiêu button component vào message tùy ý:

```blade
<x-mail::button :url="$url" color="success">
View Order
</x-mail::button>
```

<a name="panel-component"></a>
#### Component Panel

Component panel render khối văn bản được cung cấp trong một panel có màu nền hơi khác phần còn lại của message, giúp làm nổi bật một khối nội dung cụ thể:

```blade
<x-mail::panel>
This is the panel content.
</x-mail::panel>
```

<a name="table-component"></a>
#### Component Table

Component table cho phép chuyển bảng Markdown thành bảng HTML. Component nhận bảng Markdown làm nội dung và hỗ trợ căn chỉnh cột bằng cú pháp căn chỉnh bảng mặc định của Markdown:

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

Bạn có thể xuất toàn bộ Markdown mail component vào ứng dụng để tùy chỉnh. Hãy dùng lệnh Artisan `vendor:publish` để publish asset tag `laravel-mail`:

```shell
php artisan vendor:publish --tag=laravel-mail
```

Lệnh này sẽ publish các Markdown mail component vào thư mục `resources/views/vendor/mail`. Thư mục `mail` chứa hai thư mục `html` và `text`, mỗi thư mục chứa phiên bản tương ứng của mọi component có sẵn. Bạn có thể tùy chỉnh các component này theo nhu cầu.

<a name="customizing-the-css"></a>
#### Tùy chỉnh CSS

Sau khi xuất component, thư mục `resources/views/vendor/mail/html/themes` sẽ chứa file `default.css`. Bạn có thể tùy chỉnh CSS trong file này; các style sẽ tự động được chuyển thành inline CSS trong phiên bản HTML của Markdown mail message.

Nếu muốn xây dựng theme hoàn toàn mới cho Markdown component của Laravel, hãy đặt file CSS trong thư mục `html/themes`. Sau khi đặt tên và lưu file CSS, cập nhật tùy chọn `theme` trong `config/mail.php` để khớp với tên theme mới.

Để tùy chỉnh theme cho một mailable riêng lẻ, hãy đặt property `$theme` của class mailable thành tên theme sẽ được sử dụng khi gửi mailable đó.

<a name="sending-mail"></a>
## Gửi email

Để gửi message, hãy dùng phương thức `to` trên [facade](/docs/{{version}}/facades) `Mail`. Phương thức `to` nhận địa chỉ email, một instance user hoặc collection các user. Nếu truyền object hoặc collection object, mailer sẽ tự động dùng các property `email` và `name` để xác định người nhận, vì vậy hãy đảm bảo các attribute này tồn tại trên object. Sau khi xác định người nhận, hãy truyền instance mailable vào phương thức `send`:

```php
<?php

namespace App\Http\Controllers;

use App\Mail\OrderShipped;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OrderShipmentController extends Controller
{
    /**
     * Ship the given order.
     */
    public function store(Request $request): RedirectResponse
    {
        $order = Order::findOrFail($request->order_id);

        // Ship the order...

        Mail::to($request->user())->send(new OrderShipped($order));

        return redirect('/orders');
    }
}
```

Khi gửi message, bạn không bị giới hạn ở việc chỉ định người nhận "to". Bạn có thể thiết lập người nhận "to", "cc" và "bcc" bằng cách nối chuỗi các phương thức tương ứng:

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->send(new OrderShipped($order));
```

<a name="looping-over-recipients"></a>
#### Lặp qua danh sách người nhận

Đôi khi, bạn cần gửi một mailable đến danh sách người nhận bằng cách lặp qua mảng người nhận / địa chỉ email. Tuy nhiên, vì phương thức `to` thêm địa chỉ email vào danh sách người nhận của mailable, mỗi vòng lặp sẽ gửi thêm email đến tất cả người nhận trước đó. Vì vậy, bạn nên luôn tạo lại instance mailable cho từng người nhận:

```php
foreach (['taylor@example.com', 'dries@example.com'] as $recipient) {
    Mail::to($recipient)->send(new OrderShipped($order));
}
```

<a name="sending-mail-via-a-specific-mailer"></a>
#### Gửi email qua một mailer cụ thể

Mặc định, Laravel gửi email bằng mailer được cấu hình là `default` trong file cấu hình `mail` của ứng dụng. Tuy nhiên, bạn có thể dùng phương thức `mailer` để gửi message bằng một cấu hình mailer cụ thể:

```php
Mail::mailer('postmark')
    ->to($request->user())
    ->send(new OrderShipped($order));
```

<a name="queueing-mail"></a>
### Đưa email vào queue

<a name="queueing-a-mail-message"></a>
#### Đưa một email vào queue

Vì việc gửi email có thể làm tăng thời gian phản hồi của ứng dụng, nhiều developer chọn đưa email vào queue để gửi ở background. Laravel hỗ trợ việc này thuận tiện thông qua [queue API thống nhất](/docs/{{version}}/queues). Để đưa mail message vào queue, hãy gọi phương thức `queue` trên facade `Mail` sau khi chỉ định người nhận:

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue(new OrderShipped($order));
```

Phương thức này tự động đẩy một job vào queue để message được gửi ở background. Bạn cần [cấu hình queue](/docs/{{version}}/queues) trước khi sử dụng tính năng này.

<a name="delayed-message-queueing"></a>
#### Trì hoãn email trong queue

Nếu muốn trì hoãn việc gửi một email đã được đưa vào queue, bạn có thể dùng phương thức `later`. Đối số đầu tiên của `later` là một instance `DateTime` cho biết thời điểm message sẽ được gửi:

```php
Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->later(now()->plus(minutes: 10), new OrderShipped($order));
```

<a name="pushing-to-specific-queues"></a>
#### Đưa email vào queue cụ thể

Vì mọi class mailable được tạo bằng lệnh `make:mail` đều sử dụng trait `Illuminate\Bus\Queueable`, bạn có thể gọi `onQueue` và `onConnection` trên bất kỳ instance mailable nào để chỉ định connection và tên queue cho message:

```php
$message = (new OrderShipped($order))
    ->onConnection('sqs')
    ->onQueue('emails');

Mail::to($request->user())
    ->cc($moreUsers)
    ->bcc($evenMoreUsers)
    ->queue($message);
```

Ngoài ra, bạn có thể chỉ định connection và queue bằng các attribute `Connection` và `Queue` trên class mailable:

```php
use Illuminate\Queue\Attributes\Connection;
use Illuminate\Queue\Attributes\Queue;

#[Connection('sqs')]
#[Queue('emails')]
class OrderShipped extends Mailable
{
    // ...
}
```

<a name="queueing-by-default"></a>
#### Mặc định đưa vào queue

Nếu có các class mailable mà bạn luôn muốn đưa vào queue, hãy triển khai contract `ShouldQueue` trên class. Khi đó, ngay cả khi gọi phương thức `send`, mailable vẫn được đưa vào queue vì nó triển khai contract này:

```php
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderShipped extends Mailable implements ShouldQueue
{
    // ...
}
```

<a name="queued-mailables-and-database-transactions"></a>
#### Mailable trong queue và database transaction

Khi mailable trong queue được dispatch bên trong database transaction, queue có thể xử lý chúng trước khi transaction được commit. Khi đó, các thay đổi đối với model hoặc bản ghi database trong transaction có thể chưa được phản ánh trong database. Ngoài ra, các model hoặc bản ghi được tạo trong transaction có thể chưa tồn tại trong database. Nếu mailable phụ thuộc vào các model này, lỗi ngoài dự kiến có thể xảy ra khi job gửi mailable được xử lý.

Nếu tùy chọn cấu hình `after_commit` của queue connection được đặt thành `false`, bạn vẫn có thể chỉ định một mailable cụ thể chỉ được dispatch sau khi mọi database transaction đang mở đã commit bằng cách gọi `afterCommit` khi gửi mail message:

```php
Mail::to($request->user())->send(
    (new OrderShipped($order))->afterCommit()
);
```

Ngoài ra, bạn có thể gọi phương thức `afterCommit` từ constructor của mailable:

```php
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct()
    {
        $this->afterCommit();
    }
}
```

> [!NOTE]
> Để tìm hiểu thêm về cách xử lý các vấn đề này, hãy xem tài liệu về [queued job và database transaction](/docs/{{version}}/queues#jobs-and-database-transactions).

<a name="queued-email-failures"></a>
#### Lỗi khi xử lý email trong queue

Khi một email trong queue thất bại, phương thức `failed` trên class mailable sẽ được gọi nếu đã được định nghĩa. Instance `Throwable` gây ra lỗi sẽ được truyền vào phương thức `failed`:

```php
<?php

namespace App\Mail;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Throwable;

class OrderDelayed extends Mailable implements ShouldQueue
{
    use SerializesModels;

    /**
     * Handle a queued email's failure.
     */
    public function failed(Throwable $exception): void
    {
        // ...
    }
}
```

<a name="rendering-mailables"></a>
## Render Mailable

Đôi khi bạn muốn lấy nội dung HTML của mailable mà không gửi nó. Bạn có thể gọi phương thức `render` của mailable. Phương thức này trả về nội dung HTML đã được render dưới dạng chuỗi:

```php
use App\Mail\InvoicePaid;
use App\Models\Invoice;

$invoice = Invoice::find(1);

return (new InvoicePaid($invoice))->render();
```

<a name="previewing-mailables-in-the-browser"></a>
### Xem trước Mailable trong trình duyệt

Khi thiết kế template của mailable, bạn có thể xem trước nhanh mailable đã render trong trình duyệt tương tự một template Blade thông thường. Vì vậy, Laravel cho phép trả về trực tiếp bất kỳ mailable nào từ route closure hoặc controller. Khi được trả về, mailable sẽ được render và hiển thị trong trình duyệt, giúp bạn xem trước thiết kế mà không cần gửi đến một địa chỉ email thực:

```php
Route::get('/mailable', function () {
    $invoice = App\Models\Invoice::find(1);

    return new App\Mail\InvoicePaid($invoice);
});
```

<a name="localizing-mailables"></a>
## Bản địa hóa Mailable

Laravel cho phép gửi mailable bằng locale khác với locale hiện tại của request, đồng thời ghi nhớ locale này nếu email được đưa vào queue.

Để thực hiện điều này, facade `Mail` cung cấp phương thức `locale` để thiết lập ngôn ngữ mong muốn. Ứng dụng sẽ chuyển sang locale này khi template của mailable được xử lý, sau đó quay lại locale trước đó khi quá trình xử lý hoàn tất:

```php
Mail::to($request->user())->locale('es')->send(
    new OrderShipped($order)
);
```

<a name="user-preferred-locales"></a>
#### Locale ưu tiên của người dùng

Đôi khi ứng dụng lưu locale ưu tiên của từng người dùng. Bằng cách triển khai contract `HasLocalePreference` trên một hoặc nhiều model, bạn có thể yêu cầu Laravel sử dụng locale đã lưu này khi gửi email:

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

Sau khi triển khai interface này, Laravel sẽ tự động sử dụng locale ưu tiên khi gửi mailable và notification đến model. Vì vậy, khi sử dụng interface này, bạn không cần gọi phương thức `locale`:

```php
Mail::to($request->user())->send(new OrderShipped($order));
```

<a name="testing-mailables"></a>
## Kiểm thử

<a name="testing-mailable-content"></a>
### Kiểm thử Mailable Content

Laravel cung cấp nhiều phương thức để kiểm tra cấu trúc của mailable. Ngoài ra, framework còn cung cấp các phương thức tiện lợi để xác nhận mailable chứa đúng nội dung bạn mong đợi:

```php tab=Pest
use App\Mail\InvoicePaid;
use App\Models\User;

test('mailable content', function () {
    $user = User::factory()->create();

    $mailable = new InvoicePaid($user);

    $mailable->assertFrom('jeffrey@example.com');
    $mailable->assertTo('taylor@example.com');
    $mailable->assertHasCc('abigail@example.com');
    $mailable->assertHasBcc('victoria@example.com');
    $mailable->assertHasReplyTo('tyler@example.com');
    $mailable->assertHasSubject('Invoice Paid');
    $mailable->assertHasTag('example-tag');
    $mailable->assertHasMetadata('key', 'value');

    $mailable->assertSeeInHtml($user->email);
    $mailable->assertDontSeeInHtml('Invoice Not Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertDontSeeInText('Invoice Not Paid');
    $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

    $mailable->assertHasAttachment('/path/to/file');
    $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
    $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
});
```

```php tab=PHPUnit
use App\Mail\InvoicePaid;
use App\Models\User;

public function test_mailable_content(): void
{
    $user = User::factory()->create();

    $mailable = new InvoicePaid($user);

    $mailable->assertFrom('jeffrey@example.com');
    $mailable->assertTo('taylor@example.com');
    $mailable->assertHasCc('abigail@example.com');
    $mailable->assertHasBcc('victoria@example.com');
    $mailable->assertHasReplyTo('tyler@example.com');
    $mailable->assertHasSubject('Invoice Paid');
    $mailable->assertHasTag('example-tag');
    $mailable->assertHasMetadata('key', 'value');

    $mailable->assertSeeInHtml($user->email);
    $mailable->assertDontSeeInHtml('Invoice Not Paid');
    $mailable->assertSeeInOrderInHtml(['Invoice Paid', 'Thanks']);

    $mailable->assertSeeInText($user->email);
    $mailable->assertDontSeeInText('Invoice Not Paid');
    $mailable->assertSeeInOrderInText(['Invoice Paid', 'Thanks']);

    $mailable->assertHasAttachment('/path/to/file');
    $mailable->assertHasAttachment(Attachment::fromPath('/path/to/file'));
    $mailable->assertHasAttachedData($pdfData, 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorage('/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
    $mailable->assertHasAttachmentFromStorageDisk('s3', '/path/to/file', 'name.pdf', ['mime' => 'application/pdf']);
}
```

Như bạn có thể dự đoán, các assertion "HTML" xác nhận phiên bản HTML của mailable chứa chuỗi được chỉ định, còn các assertion "text" xác nhận phiên bản plain-text chứa chuỗi đó.

<a name="testing-mailable-sending"></a>
### Kiểm thử Mailable Sending

Bạn nên kiểm thử nội dung của mailable tách biệt với các test xác nhận một mailable cụ thể đã được "gửi" đến người dùng. Thông thường, nội dung mailable không liên quan trực tiếp đến đoạn code đang được kiểm thử, vì vậy chỉ cần xác nhận Laravel đã được yêu cầu gửi mailable tương ứng là đủ.

Bạn có thể dùng phương thức `fake` của facade `Mail` để ngăn email thực sự được gửi. Sau khi gọi `Mail::fake`, bạn có thể xác nhận các mailable đã được yêu cầu gửi đến người dùng và thậm chí kiểm tra dữ liệu mà mailable nhận được:

```php tab=Pest
<?php

use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;

test('orders can be shipped', function () {
    Mail::fake();

    // Perform order shipping...

    // Assert that no mailables were sent...
    Mail::assertNothingSent();

    // Assert that a mailable was sent...
    Mail::assertSent(OrderShipped::class);

    // Assert a mailable was sent twice...
    Mail::assertSent(OrderShipped::class, 2);

    // Assert a mailable was sent to an email address...
    Mail::assertSent(OrderShipped::class, 'example@laravel.com');

    // Assert a mailable was sent to multiple email addresses...
    Mail::assertSent(OrderShipped::class, ['example@laravel.com', '...']);

    // Assert a mailable was not sent...
    Mail::assertNotSent(AnotherMailable::class);

    // Assert a mailable was sent twice...
    Mail::assertSentTimes(OrderShipped::class, 2);

    // Assert 3 total mailables were sent...
    Mail::assertSentCount(3);
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use App\Mail\OrderShipped;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_orders_can_be_shipped(): void
    {
        Mail::fake();

        // Perform order shipping...

        // Assert that no mailables were sent...
        Mail::assertNothingSent();

        // Assert that a mailable was sent...
        Mail::assertSent(OrderShipped::class);

        // Assert a mailable was sent twice...
        Mail::assertSent(OrderShipped::class, 2);

        // Assert a mailable was sent to an email address...
        Mail::assertSent(OrderShipped::class, 'example@laravel.com');

        // Assert a mailable was sent to multiple email addresses...
        Mail::assertSent(OrderShipped::class, ['example@laravel.com', '...']);

        // Assert a mailable was not sent...
        Mail::assertNotSent(AnotherMailable::class);

        // Assert a mailable was sent twice...
        Mail::assertSentTimes(OrderShipped::class, 2);

        // Assert 3 total mailables were sent...
        Mail::assertSentCount(3);
    }
}
```

Nếu đưa mailable vào queue để gửi ở background, bạn nên dùng phương thức `assertQueued` thay cho `assertSent`:

```php
Mail::assertQueued(OrderShipped::class);
Mail::assertNotQueued(OrderShipped::class);
Mail::assertNothingQueued();
Mail::assertQueuedCount(3);
```

Bạn cũng có thể xác nhận tổng số mailable đã được gửi hoặc đưa vào queue bằng phương thức `assertOutgoingCount`:

```php
Mail::assertOutgoingCount(3);
```

Bạn có thể truyền closure vào các phương thức `assertSent`, `assertNotSent`, `assertQueued` hoặc `assertNotQueued` để xác nhận một mailable thỏa mãn điều kiện kiểm tra đã cho. Assertion sẽ thành công nếu có ít nhất một mailable được gửi và thỏa mãn điều kiện đó:

```php
Mail::assertSent(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

Khi gọi các phương thức assertion của facade `Mail`, instance mailable được closure nhận vào cung cấp nhiều phương thức hữu ích để kiểm tra mailable:

```php
Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($user) {
    return $mail->hasTo($user->email) &&
           $mail->hasCc('...') &&
           $mail->hasBcc('...') &&
           $mail->hasReplyTo('...') &&
           $mail->hasFrom('...') &&
           $mail->hasSubject('...') &&
           $mail->hasMetadata('order_id', $mail->order->id);
           $mail->usesMailer('ses');
});
```

Instance mailable cũng cung cấp một số phương thức hữu ích để kiểm tra các attachment của mailable:

```php
use Illuminate\Mail\Mailables\Attachment;

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
    return $mail->hasAttachment(
        Attachment::fromPath('/path/to/file')
            ->as('name.pdf')
            ->withMime('application/pdf')
    );
});

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) {
    return $mail->hasAttachment(
        Attachment::fromStorageDisk('s3', '/path/to/file')
    );
});

Mail::assertSent(OrderShipped::class, function (OrderShipped $mail) use ($pdfData) {
    return $mail->hasAttachment(
        Attachment::fromData(fn () => $pdfData, 'name.pdf')
    );
});
```

Bạn có thể nhận thấy có hai phương thức để xác nhận email không được gửi: `assertNotSent` và `assertNotQueued`. Đôi khi bạn cần xác nhận rằng không có email nào được gửi **hoặc** đưa vào queue. Khi đó, hãy sử dụng `assertNothingOutgoing` và `assertNotOutgoing`:

```php
Mail::assertNothingOutgoing();

Mail::assertNotOutgoing(function (OrderShipped $mail) use ($order) {
    return $mail->order->id === $order->id;
});
```

<a name="mail-and-local-development"></a>
## Mail và môi trường phát triển local

Khi phát triển ứng dụng có chức năng gửi email, bạn thường không muốn gửi email thật đến các địa chỉ đang hoạt động. Laravel cung cấp một số cách để "vô hiệu hóa" việc gửi email thực tế trong quá trình phát triển local.

<a name="log-driver"></a>
#### Driver Log

Thay vì gửi email, mail driver `log` sẽ ghi toàn bộ message email vào file log để bạn kiểm tra. Thông thường driver này chỉ được dùng trong môi trường phát triển local. Để biết thêm về cách cấu hình ứng dụng theo từng môi trường, hãy xem [tài liệu cấu hình](/docs/{{version}}/configuration#environment-configuration).

<a name="mailtrap"></a>
#### HELO / Mailtrap / Mailpit

Ngoài ra, bạn có thể dùng dịch vụ như [HELO](https://usehelo.com) hoặc [Mailtrap](https://mailtrap.io) cùng driver `smtp` để gửi email đến một mailbox thử nghiệm và xem chúng trong email client thực tế. Cách này cho phép bạn kiểm tra email cuối cùng bằng trình xem message của Mailtrap.

Nếu đang sử dụng [Laravel Sail](/docs/{{version}}/sail), bạn có thể xem trước message bằng [Mailpit](https://github.com/axllent/mailpit). Khi Sail đang chạy, giao diện Mailpit có thể được truy cập tại: `http://localhost:8025`.

<a name="using-a-global-to-address"></a>
#### Sử dụng địa chỉ `to` toàn cục

Cuối cùng, bạn có thể chỉ định địa chỉ "to" toàn cục bằng phương thức `alwaysTo` của facade `Mail`. Thông thường, phương thức này nên được gọi từ `boot` của một service provider trong ứng dụng:

```php
use Illuminate\Support\Facades\Mail;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    if ($this->app->environment('local')) {
        Mail::alwaysTo('taylor@example.com');
    }
}
```

Khi sử dụng phương thức `alwaysTo`, mọi địa chỉ "cc" hoặc "bcc" bổ sung trên email sẽ bị loại bỏ.

<a name="events"></a>
## Event

Laravel dispatch hai event trong quá trình gửi email. Event `MessageSending` được dispatch trước khi message được gửi, còn `MessageSent` được dispatch sau khi message đã được gửi. Lưu ý rằng các event này được dispatch khi email thực sự đang được *gửi*, không phải khi nó được đưa vào queue. Bạn có thể tạo [event listener](/docs/{{version}}/events) cho các event này trong ứng dụng:

```php
use Illuminate\Mail\Events\MessageSending;
// use Illuminate\Mail\Events\MessageSent;

class LogMessage
{
    /**
     * Handle the event.
     */
    public function handle(MessageSending $event): void
    {
        // ...
    }
}
```

<a name="custom-transports"></a>
## Transport tùy chỉnh

Laravel tích hợp nhiều mail transport; tuy nhiên, bạn có thể muốn tự viết transport để gửi email qua những dịch vụ Laravel chưa hỗ trợ sẵn. Để bắt đầu, hãy định nghĩa một class kế thừa `Symfony\Component\Mailer\Transport\AbstractTransport`. Sau đó triển khai các phương thức `doSend` và `__toString` trên transport:

```php
<?php

namespace App\Mail;

use MailchimpTransactional\ApiClient;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\MessageConverter;

class MailchimpTransport extends AbstractTransport
{
    /**
     * Create a new Mailchimp transport instance.
     */
    public function __construct(
        protected ApiClient $client,
    ) {
        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $this->client->messages->send(['message' => [
            'from_email' => $email->getFrom(),
            'to' => collect($email->getTo())->map(function (Address $email) {
                return ['email' => $email->getAddress(), 'type' => 'to'];
            })->all(),
            'subject' => $email->getSubject(),
            'text' => $email->getTextBody(),
        ]]);
    }

    /**
     * Get the string representation of the transport.
     */
    public function __toString(): string
    {
        return 'mailchimp';
    }
}
```

Sau khi định nghĩa custom transport, bạn có thể đăng ký nó bằng phương thức `extend` của facade `Mail`. Thông thường, việc này nên được thực hiện trong phương thức `boot` của `AppServiceProvider`. Một đối số `$config` sẽ được truyền vào closure của `extend`; đối số này chứa mảng cấu hình được định nghĩa cho mailer trong file `config/mail.php` của ứng dụng:

```php
use App\Mail\MailchimpTransport;
use Illuminate\Support\Facades\Mail;
use MailchimpTransactional\ApiClient;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Mail::extend('mailchimp', function (array $config = []) {
        $client = new ApiClient;

        $client->setApiKey($config['key']);

        return new MailchimpTransport($client);
    });
}
```

Sau khi custom transport được định nghĩa và đăng ký, bạn có thể tạo một cấu hình mailer trong `config/mail.php` của ứng dụng để sử dụng transport mới:

```php
'mailchimp' => [
    'transport' => 'mailchimp',
    'key' => env('MAILCHIMP_API_KEY'),
    // ...
],
```

<a name="additional-symfony-transports"></a>
### Các Symfony Transport bổ sung

Laravel hỗ trợ sẵn một số mail transport do Symfony duy trì như Mailgun và Postmark. Tuy nhiên, bạn có thể mở rộng Laravel để hỗ trợ thêm các transport khác của Symfony bằng cách cài mailer cần thiết qua Composer và đăng ký transport với Laravel. Ví dụ, bạn có thể cài đặt và đăng ký Symfony mailer "Brevo" (trước đây là "Sendinblue"):

```shell
composer require symfony/brevo-mailer symfony/http-client
```

Sau khi cài package Brevo mailer, bạn có thể thêm thông tin xác thực Brevo API vào file cấu hình `services` của ứng dụng:

```php
'brevo' => [
    'key' => env('BREVO_API_KEY'),
],
```

Tiếp theo, bạn có thể dùng phương thức `extend` của facade `Mail` để đăng ký transport với Laravel. Thông thường, việc này nên được thực hiện trong phương thức `boot` của service provider:

```php
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Mail::extend('brevo', function () {
        return (new BrevoTransportFactory)->create(
            new Dsn(
                'brevo+api',
                'default',
                config('services.brevo.key')
            )
        );
    });
}
```

Sau khi transport được đăng ký, bạn có thể tạo cấu hình mailer trong `config/mail.php` của ứng dụng để sử dụng transport mới:

```php
'brevo' => [
    'transport' => 'brevo',
    // ...
],
```

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/mail). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
