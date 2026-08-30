# Ghi log

<a name="introduction"></a>
## Giới thiệu

Để giúp bạn hiểu rõ hơn những gì đang diễn ra bên trong ứng dụng, Laravel cung cấp các dịch vụ ghi log mạnh mẽ, cho phép ghi thông điệp vào file, system error log, và thậm chí gửi tới Slack để thông báo cho toàn bộ đội ngũ.

Hệ thống logging của Laravel được xây dựng dựa trên các "channel". Mỗi channel đại diện cho một cách cụ thể để ghi thông tin log. Ví dụ, channel `single` ghi log vào một file duy nhất, trong khi channel `slack` gửi thông điệp log tới Slack. Tùy theo mức độ nghiêm trọng, một thông điệp log có thể được ghi vào nhiều channel.

Bên dưới, Laravel sử dụng thư viện [Monolog](https://github.com/Seldaek/monolog), cung cấp nhiều log handler mạnh mẽ. Laravel giúp việc cấu hình các handler này trở nên đơn giản, cho phép bạn kết hợp chúng để tùy chỉnh cách ứng dụng xử lý log.

<a name="configuration"></a>
## Cấu hình

Tất cả tùy chọn kiểm soát hành vi logging của ứng dụng nằm trong file cấu hình `config/logging.php`. File này cho phép cấu hình các log channel của ứng dụng, vì vậy bạn nên xem qua từng channel có sẵn cùng các tùy chọn của chúng. Một số tùy chọn thường dùng sẽ được trình bày bên dưới.

Mặc định, Laravel sử dụng channel `stack` khi ghi log. Channel `stack` dùng để tập hợp nhiều log channel thành một channel duy nhất. Để biết thêm về cách xây dựng stack, hãy xem [phần tài liệu bên dưới](#building-log-stacks).

<a name="available-channel-drivers"></a>
### Các driver channel có sẵn

Mỗi log channel được vận hành bởi một "driver". Driver quyết định thông điệp log thực sự được ghi bằng cách nào và ở đâu. Các log channel driver sau có sẵn trong mọi ứng dụng Laravel. Phần lớn các driver này đã có mục cấu hình trong file `config/logging.php` của ứng dụng, vì vậy hãy xem file này để làm quen với nội dung của nó:

<div class="overflow-auto">

| Tên          | Mô tả                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `custom`     | Driver gọi một factory được chỉ định để tạo channel.                  |
| `daily`      | Driver Monolog dựa trên `RotatingFileHandler`, xoay vòng hằng ngày.   |
| `monthly`    | Driver Monolog dựa trên `RotatingFileHandler`, xoay vòng hằng tháng.  |
| `errorlog`   | Driver Monolog dựa trên `ErrorLogHandler`.                            |
| `monolog`    | Driver factory Monolog có thể dùng bất kỳ Monolog handler được hỗ trợ. |
| `papertrail` | Driver Monolog dựa trên `SyslogUdpHandler`.                           |
| `single`     | Channel logger dựa trên một file hoặc đường dẫn duy nhất (`StreamHandler`). |
| `slack`      | Driver Monolog dựa trên `SlackWebhookHandler`.                        |
| `stack`      | Lớp bao hỗ trợ tạo channel "đa channel".                             |
| `syslog`     | Driver Monolog dựa trên `SyslogHandler`.                              |

</div>

> [!NOTE]
> Xem tài liệu về [tùy chỉnh channel nâng cao](#monolog-channel-customization) để tìm hiểu thêm về các driver `monolog` và `custom`.

<a name="configuring-the-channel-name"></a>
#### Cấu hình tên channel

Mặc định, Monolog được khởi tạo với một "tên channel" trùng với môi trường hiện tại, chẳng hạn `production` hoặc `local`. Để thay đổi giá trị này, bạn có thể thêm tùy chọn `name` vào cấu hình channel:

```php
'stack' => [
    'driver' => 'stack',
    'name' => 'channel-name',
    'channels' => ['single', 'slack'],
],
```

<a name="channel-prerequisites"></a>
### Điều kiện tiên quyết của channel

<a name="configuring-the-single-daily-and-monthly-channels"></a>
#### Cấu hình các channel Single, Daily và Monthly

Các channel `single`, `daily` và `monthly` có ba tùy chọn cấu hình không bắt buộc: `bubble`, `permission` và `locking`.

<div class="overflow-auto">

| Tên          | Mô tả                                                                          | Mặc định |
| ------------ | ----------------------------------------------------------------------------- | ------- |
| `bubble`     | Cho biết thông điệp có tiếp tục được chuyển lên các channel khác sau khi xử lý hay không. | `true` |
| `locking`    | Thử khóa file log trước khi ghi.                                                | `false` |
| `permission` | Quyền của file log.                                                             | `0644` |

</div>

Ngoài ra, chính sách lưu giữ của các channel `daily` và `monthly` có thể được cấu hình bằng tùy chọn `max_files`. Biến môi trường `LOG_DAILY_DAYS` cũng có thể được dùng để cấu hình thời gian lưu giữ cho channel `daily`.

<a name="configuring-the-papertrail-channel"></a>
#### Cấu hình channel Papertrail

Channel `papertrail` yêu cầu các tùy chọn cấu hình `host` và `port`. Có thể định nghĩa chúng qua các biến môi trường `PAPERTRAIL_URL` và `PAPERTRAIL_PORT`. Bạn có thể lấy các giá trị này từ [Papertrail](https://help.papertrailapp.com/kb/configuration/configuring-centralized-logging-from-php-apps/#send-events-from-php-app).

<a name="configuring-the-slack-channel"></a>
#### Cấu hình channel Slack

Channel `slack` yêu cầu tùy chọn cấu hình `url`. Giá trị này có thể được định nghĩa bằng biến môi trường `LOG_SLACK_WEBHOOK_URL`. URL này phải khớp với URL của một [incoming webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) mà bạn đã cấu hình cho đội ngũ Slack.

Mặc định, Slack chỉ nhận log ở mức `critical` trở lên; tuy nhiên, bạn có thể điều chỉnh bằng biến môi trường `LOG_LEVEL` hoặc sửa tùy chọn `level` trong mảng cấu hình log channel Slack.

<a name="logging-deprecation-warnings"></a>
### Ghi log Deprecation Warnings

PHP, Laravel và các thư viện khác thường thông báo rằng một số tính năng đã bị deprecated và sẽ bị loại bỏ trong phiên bản tương lai. Nếu muốn ghi lại các cảnh báo deprecated này, bạn có thể chỉ định log channel `deprecations` mong muốn bằng biến môi trường `LOG_DEPRECATIONS_CHANNEL` hoặc trong file cấu hình `config/logging.php` của ứng dụng:

```php
'deprecations' => [
    'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
    'trace' => env('LOG_DEPRECATIONS_TRACE', false),
],

'channels' => [
    // ...
]
```

Hoặc, bạn có thể định nghĩa một log channel tên `deprecations`. Nếu channel có tên này tồn tại, nó sẽ luôn được dùng để ghi các cảnh báo deprecated:

```php
'channels' => [
    'deprecations' => [
        'driver' => 'single',
        'path' => storage_path('logs/php-deprecation-warnings.log'),
    ],
],
```

<a name="building-log-stacks"></a>
## Xây dựng log stack

Như đã đề cập, driver `stack` cho phép kết hợp nhiều channel thành một log channel duy nhất. Để minh họa cách sử dụng log stack, hãy xem một cấu hình ví dụ thường gặp trong ứng dụng production:

```php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['syslog', 'slack'], // [tl! add]
        'ignore_exceptions' => false,
    ],

    'syslog' => [
        'driver' => 'syslog',
        'level' => env('LOG_LEVEL', 'debug'),
        'facility' => env('LOG_SYSLOG_FACILITY', LOG_USER),
        'replace_placeholders' => true,
    ],

    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => env('LOG_SLACK_USERNAME', 'Laravel Log'),
        'emoji' => env('LOG_SLACK_EMOJI', ':boom:'),
        'level' => env('LOG_LEVEL', 'critical'),
        'replace_placeholders' => true,
    ],
],
```

Hãy phân tích cấu hình này. Trước tiên, channel `stack` tập hợp hai channel khác thông qua tùy chọn `channels`: `syslog` và `slack`. Vì vậy, khi ghi log, cả hai channel đều có cơ hội ghi thông điệp. Tuy nhiên, như sẽ thấy bên dưới, việc các channel này có thực sự ghi thông điệp hay không có thể phụ thuộc vào mức độ nghiêm trọng / "level" của thông điệp.

<a name="log-levels"></a>
#### Mức log

Hãy lưu ý tùy chọn cấu hình `level` trong các channel `syslog` và `slack` ở ví dụ trên. Tùy chọn này xác định "level" tối thiểu mà một thông điệp phải đạt để được channel ghi lại. Monolog, nền tảng cho dịch vụ logging của Laravel, cung cấp tất cả mức log được định nghĩa trong [đặc tả RFC 5424](https://tools.ietf.org/html/rfc5424). Theo thứ tự mức độ nghiêm trọng giảm dần, các mức này là: **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info** và **debug**.

Giả sử chúng ta ghi một thông điệp bằng phương thức `debug`:

```php
Log::debug('An informational message.');
```

Với cấu hình trên, channel `syslog` sẽ ghi thông điệp vào system log; tuy nhiên, vì thông điệp chưa đạt mức `critical` trở lên nên nó sẽ không được gửi tới Slack. Nếu ghi một thông điệp `emergency`, thông điệp sẽ được gửi tới cả system log và Slack vì mức `emergency` cao hơn ngưỡng tối thiểu của cả hai channel:

```php
Log::emergency('The system is down!');
```

<a name="writing-log-messages"></a>
## Ghi thông điệp log

Bạn có thể ghi thông tin vào log bằng [facade](/docs/{{version}}/facades) `Log`. Như đã đề cập, logger cung cấp tám mức logging được định nghĩa trong [đặc tả RFC 5424](https://tools.ietf.org/html/rfc5424): **emergency**, **alert**, **critical**, **error**, **warning**, **notice**, **info** và **debug**:

```php
use Illuminate\Support\Facades\Log;

Log::emergency($message);
Log::alert($message);
Log::critical($message);
Log::error($message);
Log::warning($message);
Log::notice($message);
Log::info($message);
Log::debug($message);
```

Bạn có thể gọi bất kỳ phương thức nào trong số này để ghi thông điệp ở mức tương ứng. Mặc định, thông điệp sẽ được ghi vào log channel mặc định được thiết lập trong file cấu hình `logging`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show the profile for the given user.
     */
    public function show(string $id): View
    {
        Log::info('Showing the user profile for user: {id}', ['id' => $id]);

        return view('user.profile', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```

<a name="contextual-information"></a>
### Thông tin ngữ cảnh

Có thể truyền một mảng dữ liệu ngữ cảnh vào các phương thức log. Dữ liệu ngữ cảnh này sẽ được định dạng và hiển thị cùng thông điệp log:

```php
use Illuminate\Support\Facades\Log;

Log::info('User {id} failed to login.', ['id' => $user->id]);
```

Đôi khi, bạn có thể muốn chỉ định một số thông tin ngữ cảnh cần được đưa vào tất cả log entry tiếp theo của một channel cụ thể. Ví dụ, bạn có thể muốn ghi request ID gắn với từng request đi vào ứng dụng. Để thực hiện điều này, hãy gọi phương thức `withContext` của facade `Log`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();

        Log::withContext([
            'request-id' => $requestId
        ]);

        $response = $next($request);

        $response->headers->set('Request-Id', $requestId);

        return $response;
    }
}
```

Nếu muốn chia sẻ thông tin ngữ cảnh trên _tất cả_ logging channel, bạn có thể gọi phương thức `Log::shareContext()`. Phương thức này cung cấp thông tin ngữ cảnh cho mọi channel đã được tạo và cả các channel được tạo sau đó:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();

        Log::shareContext([
            'request-id' => $requestId
        ]);

        // ...
    }
}
```

> [!NOTE]
> Nếu cần chia sẻ ngữ cảnh log khi xử lý queued job, bạn có thể sử dụng [job middleware](/docs/{{version}}/queues#job-middleware).

<a name="writing-to-specific-channels"></a>
### Ghi vào channel cụ thể

Đôi khi, bạn có thể muốn ghi thông điệp vào một channel khác với channel mặc định của ứng dụng. Bạn có thể dùng phương thức `channel` trên facade `Log` để lấy và ghi vào bất kỳ channel nào được định nghĩa trong file cấu hình:

```php
use Illuminate\Support\Facades\Log;

Log::channel('slack')->info('Something happened!');
```

Nếu muốn tạo một logging stack theo yêu cầu gồm nhiều channel, bạn có thể dùng phương thức `stack`:

```php
Log::stack(['single', 'slack'])->info('Something happened!');
```

<a name="on-demand-channels"></a>
#### Channel theo yêu cầu

Bạn cũng có thể tạo channel theo yêu cầu bằng cách cung cấp cấu hình tại runtime mà không cần cấu hình đó tồn tại trong file cấu hình `logging` của ứng dụng. Để thực hiện, hãy truyền một mảng cấu hình vào phương thức `build` của facade `Log`:

```php
use Illuminate\Support\Facades\Log;

Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
])->info('Something happened!');
```

Bạn cũng có thể đưa một channel theo yêu cầu vào logging stack theo yêu cầu. Chỉ cần thêm instance của channel đó vào mảng truyền cho phương thức `stack`:

```php
use Illuminate\Support\Facades\Log;

$channel = Log::build([
  'driver' => 'single',
  'path' => storage_path('logs/custom.log'),
]);

Log::stack(['slack', $channel])->info('Something happened!');
```

<a name="monolog-channel-customization"></a>
## Tùy chỉnh channel Monolog

<a name="customizing-monolog-for-channels"></a>
### Tùy chỉnh Monolog cho channel

Đôi khi bạn cần toàn quyền kiểm soát cách Monolog được cấu hình cho một channel hiện có. Ví dụ, bạn có thể muốn cấu hình một implementation Monolog `FormatterInterface` tùy chỉnh cho channel `single` tích hợp sẵn của Laravel.

Để bắt đầu, hãy định nghĩa mảng `tap` trong cấu hình channel. Mảng `tap` chứa danh sách các class được phép tùy chỉnh (hay "tap" vào) instance Monolog sau khi nó được tạo. Không có vị trí quy ước bắt buộc cho các class này, vì vậy bạn có thể tự tạo một thư mục trong ứng dụng để chứa chúng:

```php
'single' => [
    'driver' => 'single',
    'tap' => [App\Logging\CustomizeFormatter::class],
    'path' => storage_path('logs/laravel.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'replace_placeholders' => true,
],
```

Sau khi cấu hình tùy chọn `tap` cho channel, bạn có thể định nghĩa class dùng để tùy chỉnh instance Monolog. Class này chỉ cần một phương thức `__invoke`, nhận vào instance `Illuminate\Log\Logger`. Instance `Illuminate\Log\Logger` sẽ proxy mọi lời gọi phương thức tới instance Monolog bên dưới:

```php
<?php

namespace App\Logging;

use Illuminate\Log\Logger;
use Monolog\Formatter\LineFormatter;

class CustomizeFormatter
{
    /**
     * Customize the given logger instance.
     */
    public function __invoke(Logger $logger): void
    {
        foreach ($logger->getHandlers() as $handler) {
            $handler->setFormatter(new LineFormatter(
                '[%datetime%] %channel%.%level_name%: %message% %context% %extra%'
            ));
        }
    }
}
```

> [!NOTE]
> Tất cả class "tap" được resolve bởi [service container](/docs/{{version}}/container), vì vậy mọi dependency trong constructor mà chúng yêu cầu sẽ tự động được inject.

<a name="creating-monolog-handler-channels"></a>
### Tạo channel dùng Monolog handler

Monolog có nhiều [handler sẵn có](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Handler), và Laravel không cung cấp channel tích hợp sẵn cho từng handler. Trong một số trường hợp, bạn có thể muốn tạo một channel tùy chỉnh chỉ đơn giản là instance của một Monolog handler cụ thể chưa có Laravel log driver tương ứng. Có thể dễ dàng tạo các channel này bằng driver `monolog`.

Khi dùng driver `monolog`, tùy chọn cấu hình `handler` chỉ định handler nào sẽ được khởi tạo. Nếu cần, các tham số constructor của handler có thể được khai báo bằng tùy chọn `handler_with`:

```php
'logentries' => [
    'driver'  => 'monolog',
    'handler' => Monolog\Handler\SyslogUdpHandler::class,
    'handler_with' => [
        'host' => 'my.logentries.internal.datahubhost.company.com',
        'port' => '10000',
    ],
],
```

<a name="monolog-formatters"></a>
#### Formatter của Monolog

Khi dùng driver `monolog`, Monolog `LineFormatter` được sử dụng làm formatter mặc định. Tuy nhiên, bạn có thể tùy chỉnh loại formatter truyền cho handler bằng các tùy chọn `formatter` và `formatter_with`:

```php
'browser' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\BrowserConsoleHandler::class,
    'formatter' => Monolog\Formatter\HtmlFormatter::class,
    'formatter_with' => [
        'dateFormat' => 'Y-m-d',
    ],
],
```

Nếu đang dùng một Monolog handler có khả năng cung cấp formatter riêng, bạn có thể đặt giá trị tùy chọn cấu hình `formatter` thành `default`:

```php
'newrelic' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\NewRelicHandler::class,
    'formatter' => 'default',
],
```

<a name="monolog-processors"></a>
#### Processor của Monolog

Monolog cũng có thể xử lý thông điệp trước khi ghi log. Bạn có thể tự tạo processor hoặc dùng các [processor có sẵn do Monolog cung cấp](https://github.com/Seldaek/monolog/tree/main/src/Monolog/Processor).

Nếu muốn tùy chỉnh processor cho driver `monolog`, hãy thêm giá trị cấu hình `processors` vào cấu hình channel:

```php
'memory' => [
    'driver' => 'monolog',
    'handler' => Monolog\Handler\StreamHandler::class,
    'handler_with' => [
        'stream' => 'php://stderr',
    ],
    'processors' => [
        // Simple syntax...
        Monolog\Processor\MemoryUsageProcessor::class,

        // With options...
        [
            'processor' => Monolog\Processor\PsrLogMessageProcessor::class,
            'with' => ['removeUsedContextFields' => true],
        ],
    ],
],
```

<a name="creating-custom-channels-via-factories"></a>
### Tạo channel tùy chỉnh bằng factory

Nếu muốn định nghĩa một channel hoàn toàn tùy chỉnh, nơi bạn toàn quyền kiểm soát việc khởi tạo và cấu hình Monolog, hãy chỉ định loại driver `custom` trong file `config/logging.php`. Cấu hình cần có tùy chọn `via` chứa tên factory class sẽ được gọi để tạo instance Monolog:

```php
'channels' => [
    'example-custom-channel' => [
        'driver' => 'custom',
        'via' => App\Logging\CreateCustomLogger::class,
    ],
],
```

Sau khi cấu hình channel dùng driver `custom`, bạn có thể định nghĩa class tạo instance Monolog. Class này chỉ cần một phương thức `__invoke` trả về instance Monolog logger. Phương thức nhận mảng cấu hình channel làm đối số duy nhất:

```php
<?php

namespace App\Logging;

use Monolog\Logger;

class CreateCustomLogger
{
    /**
     * Create a custom Monolog instance.
     */
    public function __invoke(array $config): Logger
    {
        return new Logger(/* ... */);
    }
}
```

<a name="tailing-log-messages-using-pail"></a>
## Theo dõi log theo thời gian thực bằng Pail

Bạn thường cần theo dõi log của ứng dụng theo thời gian thực, chẳng hạn khi debug một vấn đề hoặc giám sát log để tìm các loại lỗi cụ thể.

Laravel Pail là package cho phép bạn dễ dàng theo dõi các file log của ứng dụng Laravel trực tiếp từ command line. Khác với lệnh `tail` tiêu chuẩn, Pail được thiết kế để hoạt động với mọi log driver, bao gồm [Laravel Nightwatch](https://nightwatch.laravel.com), Sentry hoặc Flare. Ngoài ra, Pail cung cấp nhiều bộ lọc hữu ích giúp bạn nhanh chóng tìm thấy thông tin cần thiết.

<img src="https://laravel.com/img/docs/pail-example.png">

<a name="pail-installation"></a>
### Cài đặt

> [!WARNING]
> Laravel Pail yêu cầu PHP extension [PCNTL](https://www.php.net/manual/en/book.pcntl.php).

Để bắt đầu, hãy cài Pail vào project bằng Composer:

```shell
composer require --dev laravel/pail
```

<a name="pail-usage"></a>
### Cách sử dụng

Để bắt đầu theo dõi log, hãy chạy lệnh `pail`:

```shell
php artisan pail
```

Để tăng mức độ chi tiết của output và tránh bị cắt ngắn (…), hãy dùng tùy chọn `-v`:

```shell
php artisan pail -v
```

Để có mức chi tiết tối đa và hiển thị stack trace của exception, hãy dùng tùy chọn `-vv`:

```shell
php artisan pail -vv
```

Để dừng theo dõi log, nhấn `Ctrl+C` bất kỳ lúc nào.

<a name="pail-filtering-logs"></a>
### Lọc log

<a name="pail-filtering-logs-filter-option"></a>
#### `--filter`

Bạn có thể dùng tùy chọn `--filter` để lọc log theo loại, file, thông điệp và nội dung stack trace:

```shell
php artisan pail --filter="QueryException"
```

<a name="pail-filtering-logs-message-option"></a>
#### `--message`

Để chỉ lọc log theo thông điệp, bạn có thể dùng tùy chọn `--message`:

```shell
php artisan pail --message="User created"
```

<a name="pail-filtering-logs-level-option"></a>
#### `--level`

Tùy chọn `--level` có thể được dùng để lọc log theo [mức log](#log-levels):

```shell
php artisan pail --level=error
```

<a name="pail-filtering-logs-user-option"></a>
#### `--user`

Để chỉ hiển thị các log được ghi khi một người dùng cụ thể đang được xác thực, hãy truyền ID của người dùng vào tùy chọn `--user`:

```shell
php artisan pail --user=1
```
