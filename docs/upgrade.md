# Hướng dẫn nâng cấp

<a name="high-impact-changes"></a>
## Thay đổi có mức ảnh hưởng cao

<div class="content-list" markdown="1">

- [Cập nhật dependency](#updating-dependencies)
- [Cập nhật Laravel Installer](#updating-the-laravel-installer)
- [Bảo vệ chống request giả mạo](#request-forgery-protection)

</div>

<a name="medium-impact-changes"></a>
## Thay đổi có mức ảnh hưởng trung bình

<div class="content-list" markdown="1">

- [Cấu hình cache `serializable_classes`](#cache-serializable_classes-configuration)
- [`upsert` database với MySQL hoặc MariaDB](#database-upsert-mariadb-mysql)

</div>

<a name="low-impact-changes"></a>
## Thay đổi có mức ảnh hưởng thấp

<div class="content-list" markdown="1">

- [Cache prefix và tên session cookie](#cache-prefixes-and-session-cookie-names)
- [Serialize collection model khôi phục eager-loaded relation](#collection-model-serialization-restores-eager-loaded-relations)
- [`Container::call` và giá trị mặc định nullable class](#containercall-and-nullable-class-defaults)
- [Độ ưu tiên khi đăng ký domain route](#domain-route-registration-precedence)
- [Exception payload của event `JobAttempted`](#jobattempted-event-exception-payload)
- [Binding callback `extend` của Manager](#manager-extend-callback-binding)
- [Query MySQL `DELETE` với `JOIN`, `ORDER BY` và `LIMIT`](#mysql-delete-queries-with-join-order-by-and-limit)
- [Tên view Bootstrap của pagination](#pagination-bootstrap-view-names)
- [Sinh tên polymorphic pivot table](#polymorphic-pivot-table-name-generation)
- [Đổi tên property của event `QueueBusy`](#queuebusy-event-property-rename)
- [Cấu hình session `serialization`](#session-serialization-configuration)
- [Reset `Str` factory giữa các test](#str-factories-reset-between-tests)

</div>

<a name="upgrade-13.0"></a>
## Nâng cấp từ 12.x lên 13.0

#### Thời gian nâng cấp ước tính: 10 phút

> [!NOTE]
> Laravel cố gắng ghi lại mọi breaking change có thể xảy ra. Tuy nhiên, vì một số thay đổi nằm ở các phần ít được sử dụng của framework, chỉ một phần trong số này có thể ảnh hưởng tới ứng dụng của bạn. Để tiết kiệm thời gian, bạn có thể dùng [Shift](https://laravelshift.com), một dịch vụ do cộng đồng duy trì để tự động hóa việc nâng cấp Laravel.

<a name="upgrading-using-ai"></a>
### Nâng cấp bằng AI

Bạn có thể tự động hóa quá trình nâng cấp bằng [Laravel Boost](https://github.com/laravel/boost). Boost là MCP server first-party cung cấp các prompt nâng cấp có hướng dẫn cho AI assistant. Sau khi cài vào ứng dụng Laravel 12, hãy dùng slash command `/upgrade-laravel-v13` trong Claude Code, Cursor, OpenCode, Gemini hoặc VS Code để bắt đầu nâng cấp lên Laravel 13. Command này yêu cầu Laravel Boost `^2.0`.

<a name="updating-dependencies"></a>
### Cập nhật dependency

**Khả năng ảnh hưởng: Cao**

Bạn nên cập nhật các dependency sau trong file `composer.json` của ứng dụng:

<div class="content-list" markdown="1">

- `laravel/framework` lên `^13.0`
- `laravel/boost` lên `^2.0`
- `laravel/tinker` lên `^3.0`
- `phpunit/phpunit` lên `^12.0`
- `pestphp/pest` lên `^4.0`

</div>

<a name="updating-the-laravel-installer"></a>
### Cập nhật Laravel Installer

Nếu dùng Laravel installer CLI để tạo ứng dụng Laravel mới, bạn nên cập nhật installer để tương thích với Laravel 13.x.

Nếu đã cài Laravel installer qua `composer global require`, bạn có thể cập nhật bằng `composer global update`:

```shell
composer global update laravel/installer
```

Hoặc, nếu dùng bản Laravel installer đi kèm [Laravel Herd](https://herd.laravel.com), hãy cập nhật Herd lên release mới nhất.

<a name="cache"></a>
### Cache

<a name="cache-prefixes-and-session-cookie-names"></a>
#### Cache prefix và tên session cookie

**Khả năng ảnh hưởng: Thấp**

Cache prefix và Redis key prefix mặc định của Laravel giờ sử dụng hậu tố có dấu gạch nối.

Với phần lớn ứng dụng, thay đổi này không áp dụng vì file cấu hình cấp ứng dụng đã định nghĩa các giá trị tương ứng. Nó chủ yếu ảnh hưởng ứng dụng dựa vào fallback configuration ở cấp framework khi config của ứng dụng không có giá trị tương ứng.

Nếu ứng dụng dựa vào các giá trị mặc định được sinh này, cache key và tên session cookie có thể thay đổi sau khi nâng cấp:

```php
// Laravel <= 12.x
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_cache_';
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_database_';
Str::slug((string) env('APP_NAME', 'laravel'), '_').'_session';

// Laravel >= 13.x
Str::slug((string) env('APP_NAME', 'laravel')).'-cache-';
Str::slug((string) env('APP_NAME', 'laravel')).'-database-';
Str::slug((string) env('APP_NAME', 'laravel')).'-session';
```

Để giữ hành vi trước đây, hãy cấu hình rõ `CACHE_PREFIX`, `REDIS_PREFIX` và `SESSION_COOKIE` trong environment.

<a name="store-and-repository-contracts-touch"></a>
#### Contract `Store` và `Repository`: `touch`

**Khả năng ảnh hưởng: Rất thấp**

Các cache contract giờ có thêm method `touch` để kéo dài TTL của item. Nếu duy trì custom cache store implementation, bạn nên thêm method này:

```php
// Illuminate\Contracts\Cache\Store
public function touch($key, $seconds);
```

<a name="cache-serializable_classes-configuration"></a>
#### Cấu hình cache `serializable_classes`

**Khả năng ảnh hưởng: Trung bình**

Cấu hình `cache` mặc định của ứng dụng giờ có option `serializable_classes` đặt thành `false`. Thay đổi này tăng cường bảo vệ quá trình cache unserialization, giúp ngăn PHP deserialization gadget chain attack nếu `APP_KEY` của ứng dụng bị lộ. Nếu ứng dụng chủ động lưu PHP object trong cache, bạn nên liệt kê rõ các class được phép unserialize:

```php
'serializable_classes' => [
    App\Data\CachedDashboardStats::class,
    App\Support\CachedPricingSnapshot::class,
],
```

Nếu trước đây ứng dụng dựa vào việc unserialize tùy ý object trong cache, bạn cần chuyển sang allow-list class rõ ràng hoặc dùng cache payload không phải object, chẳng hạn array.

<a name="container"></a>
### Container

<a name="containercall-and-nullable-class-defaults"></a>
#### `Container::call` và giá trị mặc định nullable class

**Khả năng ảnh hưởng: Thấp**

`Container::call` giờ tôn trọng giá trị mặc định của nullable class parameter khi không có binding, đồng nhất với hành vi constructor injection được đưa vào Laravel 12:

```php
$container->call(function (?Carbon $date = null) {
    return $date;
});

// Laravel <= 12.x: Carbon instance
// Laravel >= 13.x: null
```

Nếu logic method-call injection của bạn phụ thuộc vào hành vi cũ, bạn có thể cần cập nhật.

<a name="contracts"></a>
### Contracts

<a name="dispatcher-contract-dispatchafterresponse"></a>
#### Contract `Dispatcher`: `dispatchAfterResponse`

**Khả năng ảnh hưởng: Rất thấp**

Contract `Illuminate\Contracts\Bus\Dispatcher` giờ có method `dispatchAfterResponse($command, $handler = null)`.

Nếu duy trì custom dispatcher implementation, hãy thêm method này vào class.

<a name="responsefactory-contract-eventstream"></a>
#### Contract `ResponseFactory`: `eventStream`

**Khả năng ảnh hưởng: Rất thấp**

Contract `Illuminate\Contracts\Routing\ResponseFactory` giờ có signature `eventStream`.

Nếu duy trì custom implementation của contract này, hãy bổ sung method tương ứng.

<a name="mustverifyemail-contract-markemailasunverified"></a>
#### Contract `MustVerifyEmail`: `markEmailAsUnverified`

**Khả năng ảnh hưởng: Rất thấp**

Contract `Illuminate\Contracts\Auth\MustVerifyEmail` giờ có `markEmailAsUnverified()`.

Nếu cung cấp custom implementation của contract này, hãy thêm method để giữ tương thích.

<a name="database"></a>
### Database

<a name="database-upsert-mariadb-mysql"></a>
#### Database `upsert` với MySQL hoặc MariaDB

**Khả năng ảnh hưởng: Trung bình**

Laravel giờ kiểm tra caller có truyền giá trị không rỗng cho `uniqueBy`; nếu rỗng, framework sẽ throw `InvalidArgumentException` thay vì sinh SQL không hợp lệ.

Dù driver MariaDB và MySQL bỏ qua giá trị `uniqueBy` và luôn dùng primary / unique index của table để phát hiện record đã tồn tại, validation này vẫn được áp dụng. `InvalidArgumentException` sẽ được throw nếu `uniqueBy` rỗng.

<a name="mysql-delete-queries-with-join-order-by-and-limit"></a>
#### Query MySQL `DELETE` với `JOIN`, `ORDER BY` và `LIMIT`

**Khả năng ảnh hưởng: Thấp**

Laravel giờ compile đầy đủ query `DELETE ... JOIN`, bao gồm `ORDER BY` và `LIMIT`, cho MySQL grammar.

Ở các phiên bản trước, clause `ORDER BY` / `LIMIT` có thể bị âm thầm bỏ qua với joined delete. Trong Laravel 13, các clause này được đưa vào SQL sinh ra. Do đó, database engine không hỗ trợ cú pháp này, chẳng hạn các biến thể MySQL / MariaDB tiêu chuẩn, có thể throw `QueryException` thay vì thực thi một delete không giới hạn.

<a name="eloquent"></a>
### Eloquent

<a name="model-booting-and-nested-instantiation"></a>
#### Model booting và nested instantiation

**Khả năng ảnh hưởng: Rất thấp**

Việc tạo model instance mới trong khi chính model đó vẫn đang boot giờ không được phép và sẽ throw `LogicException`.

Thay đổi này ảnh hưởng code instantiate model bên trong method `boot` của model hoặc các method `boot*` của trait:

```php
protected static function boot()
{
    parent::boot();

    // No longer allowed during booting...
    (new static())->getTable();
}
```

Hãy chuyển logic này ra ngoài boot cycle để tránh nested booting.

<a name="polymorphic-pivot-table-name-generation"></a>
#### Sinh tên polymorphic pivot table

**Khả năng ảnh hưởng: Thấp**

Khi Laravel suy luận tên table cho polymorphic pivot model sử dụng custom pivot model class, framework giờ sinh tên ở dạng số nhiều.

Nếu ứng dụng phụ thuộc vào tên số ít được suy luận trước đây cho morph pivot table và dùng custom pivot class, hãy định nghĩa rõ tên table trên pivot model.

<a name="collection-model-serialization-restores-eager-loaded-relations"></a>
#### Serialize collection model khôi phục eager-loaded relation

**Khả năng ảnh hưởng: Thấp**

Khi Eloquent model collection được serialize và khôi phục, chẳng hạn trong queued job, các eager-loaded relation giờ cũng được khôi phục cho model trong collection.

Nếu code phụ thuộc vào việc relation không tồn tại sau deserialization, bạn có thể cần điều chỉnh logic.

<a name="http-client"></a>
### HTTP Client

<a name="http-client-response-throw-and-throwif-signatures"></a>
#### Signature `Response::throw` và `throwIf` của HTTP Client

**Khả năng ảnh hưởng: Rất thấp**

Các response method của HTTP client giờ khai báo callback parameter trực tiếp trong method signature:

```php
public function throw($callback = null);
public function throwIf($condition, $callback = null);
```

Nếu override các method này trong custom response class, hãy bảo đảm method signature tương thích.

<a name="notifications"></a>
### Notifications

<a name="default-password-reset-subject"></a>
#### Subject mặc định của password reset

**Khả năng ảnh hưởng: Rất thấp**

Subject email password reset mặc định của Laravel đã thay đổi:

```text
// Laravel <= 12.x
Reset Password Notification

// Laravel >= 13.x
Reset your password
```

Nếu test, assertion hoặc translation override phụ thuộc vào chuỗi mặc định trước đây, hãy cập nhật tương ứng.

<a name="queued-notifications-and-missing-models"></a>
#### Queued notification và model bị thiếu

**Khả năng ảnh hưởng: Rất thấp**

Queued notification giờ tôn trọng attribute `#[DeleteWhenMissingModels]` và property `$deleteWhenMissingModels` được định nghĩa trên notification class.

Ở phiên bản trước, model bị thiếu vẫn có thể khiến queued notification job fail trong trường hợp bạn kỳ vọng job sẽ bị xóa.

<a name="queue"></a>
### Queue

<a name="jobattempted-event-exception-payload"></a>
#### Exception payload của event `JobAttempted`

**Khả năng ảnh hưởng: Thấp**

Event `Illuminate\Queue\Events\JobAttempted` giờ expose exception object (hoặc `null`) qua `$exception`, thay cho boolean property `$exceptionOccurred` trước đây:

```php
// Laravel <= 12.x
$event->exceptionOccurred;

// Laravel >= 13.x
$event->exception;
```

Nếu listen event này, hãy cập nhật listener tương ứng.

<a name="queuebusy-event-property-rename"></a>
#### Đổi tên property của event `QueueBusy`

**Khả năng ảnh hưởng: Thấp**

Property `$connection` của event `Illuminate\Queue\Events\QueueBusy` đã được đổi tên thành `$connectionName` để nhất quán với các queue event khác.

Nếu listener tham chiếu `$connection`, hãy cập nhật thành `$connectionName`.

<a name="queue-contract-method-additions"></a>
#### Bổ sung method cho contract `Queue`

**Khả năng ảnh hưởng: Rất thấp**

Contract `Illuminate\Contracts\Queue\Queue` giờ có các method kiểm tra kích thước queue mà trước đây chỉ được khai báo trong docblock. Nếu duy trì custom queue driver implementation của contract này, hãy thêm implementation cho:

<div class="content-list" markdown="1">

- `pendingSize`
- `delayedSize`
- `reservedSize`
- `creationTimeOfOldestPendingJob`

</div>

<a name="routing"></a>
### Routing

<a name="domain-route-registration-precedence"></a>
#### Độ ưu tiên khi đăng ký domain route

**Khả năng ảnh hưởng: Thấp**

Route có domain rõ ràng giờ được ưu tiên trước route không có domain khi matching route.

Điều này cho phép catch-all subdomain route hoạt động nhất quán ngay cả khi non-domain route được đăng ký trước. Nếu ứng dụng phụ thuộc vào thứ tự đăng ký trước đây giữa domain và non-domain route, hãy review hành vi route matching.

<a name="session"></a>
### Session

<a name="session-serialization-configuration"></a>
#### Cấu hình session `serialization`

**Khả năng ảnh hưởng: Thấp**

Để giúp ngăn PHP deserialization gadget chain attack, application skeleton mặc định giờ đặt option session `serialization` thành `json` trong `config/session.php`.

Nếu nâng cấp ứng dụng hiện có và đồng bộ file cấu hình với skeleton Laravel 13, việc đổi giá trị từ `php` sang `json` sẽ làm mất hiệu lực tất cả user session đang hoạt động.

Nếu muốn duy trì session đang hoạt động một cách liền mạch trong quá trình nâng cấp, hãy giữ giá trị là `php`. Tuy nhiên, nếu ứng dụng không lưu PHP object trong session và bạn chấp nhận yêu cầu người dùng đăng nhập lại, Laravel khuyến nghị đổi sang `json` để tăng bảo mật.

<a name="scheduling"></a>
### Scheduling

<a name="withscheduling-registration-timing"></a>
#### Thời điểm đăng ký `withScheduling`

**Khả năng ảnh hưởng: Rất thấp**

Schedule đăng ký qua `ApplicationBuilder::withScheduling()` giờ được defer cho tới khi `Schedule` được resolve.

Nếu ứng dụng phụ thuộc vào việc schedule được đăng ký ngay trong bootstrap, bạn có thể cần điều chỉnh logic.

<a name="security"></a>
### Security

<a name="request-forgery-protection"></a>
#### Bảo vệ chống request giả mạo

**Khả năng ảnh hưởng: Cao**

CSRF middleware của Laravel đã được đổi tên từ `VerifyCsrfToken` thành `PreventRequestForgery`, đồng thời giờ có thêm kiểm tra origin của request bằng header `Sec-Fetch-Site`.

`VerifyCsrfToken` và `ValidateCsrfToken` vẫn tồn tại dưới dạng alias deprecated, nhưng các tham chiếu trực tiếp nên được cập nhật sang `PreventRequestForgery`, đặc biệt khi loại trừ middleware trong test hoặc route definition:

```php
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

// Laravel <= 12.x
->withoutMiddleware([VerifyCsrfToken::class]);

// Laravel >= 13.x
->withoutMiddleware([PreventRequestForgery::class]);
```

API cấu hình middleware giờ cũng cung cấp `preventRequestForgery(...)`.

<a name="support"></a>
### Support

<a name="manager-extend-callback-binding"></a>
#### Binding callback `extend` của Manager

**Khả năng ảnh hưởng: Thấp**

Custom driver closure đăng ký qua các method `extend` của manager giờ được bind vào manager instance.

Nếu trước đây bạn dựa vào một bound object khác, chẳng hạn service provider instance, làm `$this` bên trong callback, hãy đưa các giá trị đó vào closure capture bằng `use (...)`.

<a name="str-factories-reset-between-tests"></a>
#### Reset `Str` factory giữa các test

**Khả năng ảnh hưởng: Thấp**

Laravel giờ reset custom `Str` factory trong quá trình test teardown.

Nếu test phụ thuộc vào custom UUID / ULID / random string factory tồn tại xuyên qua nhiều test method, hãy thiết lập chúng trong từng test hoặc setup hook tương ứng.

<a name="jsfrom-uses-unescaped-unicode-by-default"></a>
#### `Js::from` mặc định dùng Unicode không escape

**Khả năng ảnh hưởng: Rất thấp**

`Illuminate\Support\Js::from` giờ mặc định dùng `JSON_UNESCAPED_UNICODE`.

Nếu test hoặc frontend output comparison phụ thuộc vào Unicode sequence đã escape, ví dụ `\u00e8`, hãy cập nhật expectation.

<a name="utilities"></a>
### Utilities

<a name="symfony-polyfill"></a>
#### Symfony PHP 8.5 polyfill và xung đột global function

**Khả năng ảnh hưởng: Thấp**

Laravel 13 thêm dependency `symfony/polyfill-php85`. Trên PHP thấp hơn 8.5, polyfill này định nghĩa các global function như `array_first()` và `array_last()` nếu chúng chưa được định nghĩa trước đó trong quá trình bootstrap.

Các function này có thể xung đột với helper package cũ như `laravel/helpers` hoặc custom global helper trùng tên. Ví dụ, helper `array_first()` trước đây nhận callback để trả về phần tử đầu tiên khớp điều kiện, trong khi bản polyfill chỉ trả về phần tử đầu tiên của array.

Để tránh xung đột và bảo đảm hành vi nhất quán giữa các phiên bản PHP, hãy ưu tiên các method của `Illuminate\Support\Arr`:

```php
use Illuminate\Support\Arr;

Arr::first($array, function ($value) {
  return /* condition */;
});
```

<a name="views"></a>
### Views

<a name="pagination-bootstrap-view-names"></a>
#### Tên view Bootstrap của pagination

**Khả năng ảnh hưởng: Thấp**

Tên internal pagination view cho Bootstrap 3 mặc định giờ được chỉ định rõ:

```nothing
// Laravel <= 12.x
pagination::default
pagination::simple-default

// Laravel >= 13.x
pagination::bootstrap-3
pagination::simple-bootstrap-3
```

Nếu ứng dụng tham chiếu trực tiếp tên pagination view cũ, hãy cập nhật các tham chiếu đó.

<a name="miscellaneous"></a>
### Khác

Laravel cũng khuyến nghị bạn xem các thay đổi trong [repository `laravel/laravel`](https://github.com/laravel/laravel). Nhiều thay đổi không bắt buộc nhưng bạn có thể muốn giữ các file này đồng bộ với ứng dụng. Một số thay đổi được đề cập trong upgrade guide, nhưng các thay đổi khác như file cấu hình hoặc comment sẽ không được ghi lại.

Bạn có thể dễ dàng xem các thay đổi bằng [GitHub comparison tool](https://github.com/laravel/laravel/compare/12.x...13.x) và chọn những update quan trọng với ứng dụng của mình.
