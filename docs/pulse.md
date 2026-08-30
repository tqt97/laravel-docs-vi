# Laravel Pulse

<a name="introduction"></a>
## Giới thiệu

[Laravel Pulse](https://github.com/laravel/pulse) cung cấp cái nhìn tổng quan nhanh về hiệu năng và mức sử dụng của ứng dụng. Với Pulse, bạn có thể xác định các điểm nghẽn như job và endpoint chậm, tìm những người dùng hoạt động tích cực nhất và nhiều thông tin khác.

Để debug chuyên sâu từng event riêng lẻ, hãy tham khảo [Laravel Telescope](/docs/{{version}}/telescope).

<a name="installation"></a>
## Cài đặt

> [!WARNING]
> Hiện tại, implementation lưu trữ first-party của Pulse yêu cầu cơ sở dữ liệu MySQL, MariaDB hoặc PostgreSQL. Nếu đang sử dụng một database engine khác, bạn sẽ cần một cơ sở dữ liệu MySQL, MariaDB hoặc PostgreSQL riêng để lưu dữ liệu Pulse.

Bạn có thể cài đặt Pulse bằng trình quản lý package Composer:

```shell
composer require laravel/pulse
```

Tiếp theo, bạn nên publish các file cấu hình và migration của Pulse bằng lệnh Artisan `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Pulse\PulseServiceProvider"
```

Cuối cùng, bạn nên chạy lệnh `migrate` để tạo các bảng cần thiết cho việc lưu trữ dữ liệu của Pulse:

```shell
php artisan migrate
```

Sau khi các database migration của Pulse đã được chạy, bạn có thể truy cập dashboard Pulse thông qua route `/pulse`.

> [!NOTE]
> Nếu không muốn lưu dữ liệu Pulse trong cơ sở dữ liệu chính của ứng dụng, bạn có thể [chỉ định một kết nối cơ sở dữ liệu riêng](#using-a-different-database).

<a name="configuration"></a>
### Cấu hình

Nhiều tùy chọn cấu hình của Pulse có thể được điều khiển bằng biến môi trường. Để xem các tùy chọn khả dụng, đăng ký recorder mới hoặc cấu hình các tùy chọn nâng cao, bạn có thể publish file cấu hình `config/pulse.php`:

```shell
php artisan vendor:publish --tag=pulse-config
```

<a name="dashboard"></a>
## Dashboard

<a name="dashboard-authorization"></a>
### Phân quyền

Dashboard Pulse có thể được truy cập thông qua route `/pulse`. Theo mặc định, bạn chỉ có thể truy cập dashboard này trong môi trường `local`, vì vậy bạn cần cấu hình phân quyền cho môi trường production bằng cách tùy biến authorization gate `'viewPulse'`. Bạn có thể thực hiện việc này trong file `app/Providers/AppServiceProvider.php` của ứng dụng:

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Gate::define('viewPulse', function (User $user) {
        return $user->isAdmin();
    });

    // ...
}
```

<a name="dashboard-customization"></a>
### Tùy biến

Các card và layout của dashboard Pulse có thể được cấu hình bằng cách publish dashboard view. Dashboard view sẽ được publish tới `resources/views/vendor/pulse/dashboard.blade.php`:

```shell
php artisan vendor:publish --tag=pulse-dashboard
```

Dashboard được vận hành bởi [Livewire](https://livewire.laravel.com/) và cho phép bạn tùy biến các card cũng như layout mà không cần build lại bất kỳ JavaScript asset nào.

Trong file này, component `<x-pulse>` chịu trách nhiệm render dashboard và cung cấp grid layout cho các card. Nếu muốn dashboard trải rộng toàn bộ chiều rộng màn hình, bạn có thể truyền prop `full-width` cho component:

```blade
<x-pulse full-width>
    ...
</x-pulse>
```

Theo mặc định, component `<x-pulse>` sẽ tạo grid 12 cột, nhưng bạn có thể tùy biến bằng prop `cols`:

```blade
<x-pulse cols="16">
    ...
</x-pulse>
```

Mỗi card chấp nhận prop `cols` và `rows` để kiểm soát không gian và vị trí:

```blade
<livewire:pulse.usage cols="4" rows="2" />
```

Hầu hết các card cũng chấp nhận prop `expand` để hiển thị toàn bộ card thay vì phải cuộn:

```blade
<livewire:pulse.slow-queries expand />
```

<a name="dashboard-resolving-users"></a>
### Phân giải người dùng

Đối với các card hiển thị thông tin về người dùng, chẳng hạn card Application Usage, Pulse chỉ ghi lại ID của người dùng. Khi render dashboard, Pulse sẽ phân giải các trường `name` và `email` từ model `Authenticatable` mặc định của bạn và hiển thị avatar bằng dịch vụ web Gravatar.

Bạn có thể tùy biến các trường và avatar bằng cách gọi method `Pulse::user` trong class `App\Providers\AppServiceProvider` của ứng dụng.

Method `user` nhận một closure; closure này sẽ nhận model `Authenticatable` cần hiển thị và phải trả về một mảng chứa thông tin `name`, `extra` và `avatar` của người dùng:

```php
use Laravel\Pulse\Facades\Pulse;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Pulse::user(fn ($user) => [
        'name' => $user->name,
        'extra' => $user->email,
        'avatar' => $user->avatar_url,
    ]);

    // ...
}
```

> [!NOTE]
> Bạn có thể tùy biến hoàn toàn cách người dùng đã xác thực được thu thập và truy xuất bằng cách implement contract `Laravel\Pulse\Contracts\ResolvesUsers` và bind nó trong [service container](/docs/{{version}}/container#binding-a-singleton) của Laravel.

<a name="dashboard-cards"></a>
### Các card

<a name="servers-card"></a>
#### Server

Card `<livewire:pulse.servers />` hiển thị mức sử dụng tài nguyên hệ thống của tất cả server đang chạy lệnh `pulse:check`. Hãy tham khảo tài liệu về [servers recorder](#servers-recorder) để biết thêm thông tin về việc báo cáo tài nguyên hệ thống.

Nếu thay thế một server trong hạ tầng, bạn có thể muốn ngừng hiển thị server không còn hoạt động trên dashboard Pulse sau một khoảng thời gian nhất định. Có thể thực hiện bằng prop `ignore-after`, nhận số giây mà sau đó server không hoạt động sẽ bị loại khỏi dashboard Pulse. Ngoài ra, bạn có thể cung cấp chuỗi thời gian tương đối như `1 hour` hoặc `3 days and 1 hour`:

```blade
<livewire:pulse.servers ignore-after="3 hours" />
```

<a name="application-usage-card"></a>
#### Mức sử dụng ứng dụng

Card `<livewire:pulse.usage />` hiển thị 10 người dùng hàng đầu đang gửi request tới ứng dụng, dispatch job và gặp các request chậm.

Nếu muốn xem đồng thời tất cả metric sử dụng trên màn hình, bạn có thể thêm card nhiều lần và chỉ định thuộc tính `type`:

```blade
<livewire:pulse.usage type="requests" />
<livewire:pulse.usage type="slow_requests" />
<livewire:pulse.usage type="jobs" />
```

Để tìm hiểu cách tùy biến việc Pulse truy xuất và hiển thị thông tin người dùng, hãy xem tài liệu về [phân giải người dùng](#dashboard-resolving-users).

> [!NOTE]
> Nếu ứng dụng nhận nhiều request hoặc dispatch nhiều job, bạn có thể muốn bật [sampling](#sampling). Hãy xem tài liệu về [user requests recorder](#user-requests-recorder), [user jobs recorder](#user-jobs-recorder) và [slow jobs recorder](#slow-jobs-recorder) để biết thêm thông tin.

<a name="exceptions-card"></a>
#### Exception

Card `<livewire:pulse.exceptions />` hiển thị tần suất và mức độ gần đây của các exception xảy ra trong ứng dụng. Theo mặc định, exception được nhóm dựa trên class exception và vị trí nơi nó xảy ra. Xem tài liệu [exceptions recorder](#exceptions-recorder) để biết thêm thông tin.

<a name="queues-card"></a>
#### Queue

Card `<livewire:pulse.queues />` hiển thị throughput của các queue trong ứng dụng, bao gồm số lượng job đang chờ, đang xử lý, đã xử lý, được release và thất bại. Xem tài liệu [queues recorder](#queues-recorder) để biết thêm thông tin.

<a name="slow-requests-card"></a>
#### Request chậm

Card `<livewire:pulse.slow-requests />` hiển thị các request đến ứng dụng vượt quá threshold đã cấu hình, mặc định là 1.000ms. Xem tài liệu [slow requests recorder](#slow-requests-recorder) để biết thêm thông tin.

<a name="slow-jobs-card"></a>
#### Job chậm

Card `<livewire:pulse.slow-jobs />` hiển thị các queued job trong ứng dụng vượt quá threshold đã cấu hình, mặc định là 1.000ms. Xem tài liệu [slow jobs recorder](#slow-jobs-recorder) để biết thêm thông tin.

<a name="slow-queries-card"></a>
#### Query chậm

Card `<livewire:pulse.slow-queries />` hiển thị các database query trong ứng dụng vượt quá threshold đã cấu hình, mặc định là 1.000ms.

Theo mặc định, các query chậm được nhóm dựa trên câu SQL (không gồm binding) và vị trí nơi chúng xảy ra, nhưng bạn có thể chọn không thu thập vị trí nếu chỉ muốn nhóm theo câu SQL.

Nếu gặp vấn đề hiệu năng render do các câu SQL cực lớn được syntax highlighting, bạn có thể tắt highlighting bằng cách thêm prop `without-highlighting`:

```blade
<livewire:pulse.slow-queries without-highlighting />
```

Xem tài liệu [slow queries recorder](#slow-queries-recorder) để biết thêm thông tin.

<a name="slow-outgoing-requests-card"></a>
#### Request gửi đi chậm

Card `<livewire:pulse.slow-outgoing-requests />` hiển thị các request gửi đi được thực hiện bằng [HTTP client](/docs/{{version}}/http-client) của Laravel và vượt quá threshold đã cấu hình, mặc định là 1.000ms.

Theo mặc định, các entry được nhóm theo URL đầy đủ. Tuy nhiên, bạn có thể muốn chuẩn hóa hoặc nhóm các request gửi đi tương tự nhau bằng regular expression. Xem tài liệu [slow outgoing requests recorder](#slow-outgoing-requests-recorder) để biết thêm thông tin.

<a name="cache-card"></a>
#### Cache

Card `<livewire:pulse.cache />` hiển thị thống kê cache hit và miss của ứng dụng, cả ở phạm vi toàn cục lẫn từng key riêng lẻ.

Theo mặc định, các entry được nhóm theo key. Tuy nhiên, bạn có thể muốn chuẩn hóa hoặc nhóm các key tương tự nhau bằng regular expression. Xem tài liệu [cache interactions recorder](#cache-interactions-recorder) để biết thêm thông tin.

<a name="capturing-entries"></a>
## Thu thập entry

Hầu hết recorder của Pulse sẽ tự động thu thập entry dựa trên các framework event do Laravel dispatch. Tuy nhiên, [servers recorder](#servers-recorder) và một số card của bên thứ ba phải định kỳ poll thông tin. Để sử dụng các card này, bạn phải chạy daemon `pulse:check` trên từng application server:

```php
php artisan pulse:check
```

> [!NOTE]
> Để giữ process `pulse:check` chạy liên tục ở background, bạn nên sử dụng process monitor như Supervisor để đảm bảo command không bị dừng.

Vì command `pulse:check` là một process chạy lâu dài, nó sẽ không nhận thấy các thay đổi trong codebase nếu không được restart. Bạn nên restart command một cách graceful bằng cách gọi `pulse:restart` trong quá trình deploy ứng dụng:

```shell
php artisan pulse:restart
```

> [!NOTE]
> Pulse sử dụng [cache](/docs/{{version}}/cache) để lưu các tín hiệu restart, vì vậy bạn nên xác minh rằng một cache driver đã được cấu hình đúng cho ứng dụng trước khi sử dụng tính năng này.

<a name="recorders"></a>
### Recorder

Recorder chịu trách nhiệm thu thập các entry từ ứng dụng để ghi vào cơ sở dữ liệu Pulse. Các recorder được đăng ký và cấu hình trong phần `recorders` của [file cấu hình Pulse](#configuration).

<a name="cache-interactions-recorder"></a>
#### Tương tác cache

Recorder `CacheInteractions` thu thập thông tin về các lần [cache](/docs/{{version}}/cache) hit và miss xảy ra trong ứng dụng để hiển thị trên card [Cache](#cache-card).

Bạn có thể tùy chọn điều chỉnh [tỷ lệ lấy mẫu](#sampling) và các pattern key cần bỏ qua.

Bạn cũng có thể cấu hình việc nhóm key để các key tương tự được gom thành một entry duy nhất. Ví dụ, bạn có thể muốn loại bỏ các ID duy nhất khỏi những key cache cùng một loại thông tin. Các nhóm được cấu hình bằng regular expression để "tìm và thay thế" một phần của key. File cấu hình có sẵn một ví dụ:

```php
Recorders\CacheInteractions::class => [
    // ...
    'groups' => [
        // '/:\d+/' => ':*',
    ],
],
```

Pattern khớp đầu tiên sẽ được sử dụng. Nếu không có pattern nào khớp, key sẽ được thu thập nguyên trạng.

<a name="exceptions-recorder"></a>
#### Exception

Recorder `Exceptions` thu thập thông tin về các exception có thể report xảy ra trong ứng dụng để hiển thị trên card [Exceptions](#exceptions-card).

Bạn có thể tùy chọn điều chỉnh [tỷ lệ lấy mẫu](#sampling) và các pattern exception cần bỏ qua. Bạn cũng có thể cấu hình có thu thập vị trí nơi exception phát sinh hay không. Vị trí được thu thập sẽ hiển thị trên dashboard Pulse, giúp truy tìm nguồn gốc exception; tuy nhiên, nếu cùng một exception xảy ra ở nhiều vị trí thì nó sẽ xuất hiện nhiều lần, tương ứng với từng vị trí duy nhất.

<a name="queues-recorder"></a>
#### Queue

Recorder `Queues` thu thập thông tin về các queue của ứng dụng để hiển thị trên card [Queues](#queues-card).

Bạn có thể tùy chọn điều chỉnh [tỷ lệ lấy mẫu](#sampling) và các pattern job cần bỏ qua.

<a name="slow-jobs-recorder"></a>
#### Job chậm

Recorder `SlowJobs` thu thập thông tin về các job chậm xảy ra trong ứng dụng để hiển thị trên card [Slow Jobs](#slow-jobs-recorder).

Bạn có thể tùy chọn điều chỉnh ngưỡng job chậm, [tỷ lệ lấy mẫu](#sampling) và các pattern job cần bỏ qua.

Bạn có thể có một số job được dự kiến sẽ mất nhiều thời gian hơn các job khác. Trong những trường hợp đó, bạn có thể cấu hình ngưỡng riêng cho từng job:

```php
Recorders\SlowJobs::class => [
    // ...
    'threshold' => [
        '#^App\\Jobs\\GenerateYearlyReports$#' => 5000,
        'default' => env('PULSE_SLOW_JOBS_THRESHOLD', 1000),
    ],
],
```

Nếu không có pattern regular expression nào khớp với classname của job, giá trị `'default'` sẽ được sử dụng.

<a name="slow-outgoing-requests-recorder"></a>
#### Request gửi đi chậm

Recorder `SlowOutgoingRequests` thu thập thông tin về các HTTP request gửi đi bằng [HTTP client](/docs/{{version}}/http-client) của Laravel vượt quá ngưỡng đã cấu hình để hiển thị trên card [Slow Outgoing Requests](#slow-outgoing-requests-card).

Bạn có thể tùy chọn điều chỉnh ngưỡng request gửi đi chậm, [tỷ lệ lấy mẫu](#sampling) và các pattern URL cần bỏ qua.

Bạn có thể có một số request gửi đi được dự kiến sẽ mất nhiều thời gian hơn các request khác. Trong những trường hợp đó, bạn có thể cấu hình ngưỡng riêng cho từng request:

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'threshold' => [
        '#backup.zip$#' => 5000,
        'default' => env('PULSE_SLOW_OUTGOING_REQUESTS_THRESHOLD', 1000),
    ],
],
```

Nếu không có pattern regular expression nào khớp với URL của request, giá trị `'default'` sẽ được sử dụng.

Bạn cũng có thể cấu hình việc nhóm URL để các URL tương tự được gom thành một entry duy nhất. Ví dụ, bạn có thể muốn loại bỏ các ID duy nhất khỏi path của URL hoặc chỉ nhóm theo domain. Các nhóm được cấu hình bằng regular expression để "tìm và thay thế" một phần của URL. File cấu hình có sẵn một số ví dụ:

```php
Recorders\SlowOutgoingRequests::class => [
    // ...
    'groups' => [
        // '#^https://api\.github\.com/repos/.*$#' => 'api.github.com/repos/*',
        // '#^https?://([^/]*).*$#' => '\1',
        // '#/\d+#' => '/*',
    ],
],
```

Pattern khớp đầu tiên sẽ được sử dụng. Nếu không có pattern nào khớp, URL sẽ được thu thập nguyên trạng.

<a name="slow-queries-recorder"></a>
#### Query chậm

Recorder `SlowQueries` thu thập mọi database query trong ứng dụng vượt quá ngưỡng đã cấu hình để hiển thị trên card [Slow Queries](#slow-queries-card).

Bạn có thể tùy chọn điều chỉnh ngưỡng query chậm, [tỷ lệ lấy mẫu](#sampling) và các pattern query cần bỏ qua. Bạn cũng có thể cấu hình có thu thập vị trí thực hiện query hay không. Vị trí được thu thập sẽ hiển thị trên dashboard Pulse, giúp truy tìm nguồn gốc query; tuy nhiên, nếu cùng một query được thực hiện ở nhiều vị trí thì nó sẽ xuất hiện nhiều lần, tương ứng với từng vị trí duy nhất.

Bạn có thể có một số query được dự kiến sẽ mất nhiều thời gian hơn các query khác. Trong những trường hợp đó, bạn có thể cấu hình ngưỡng riêng cho từng query:

```php
Recorders\SlowQueries::class => [
    // ...
    'threshold' => [
        '#^insert into `yearly_reports`#' => 5000,
        'default' => env('PULSE_SLOW_QUERIES_THRESHOLD', 1000),
    ],
],
```

Nếu không có pattern regular expression nào khớp với SQL của query, giá trị `'default'` sẽ được sử dụng.

<a name="slow-requests-recorder"></a>
#### Request chậm

Recorder `Requests` thu thập thông tin về các request gửi đến ứng dụng để hiển thị trên các card [Slow Requests](#slow-requests-card) và [Application Usage](#application-usage-card).

Bạn có thể tùy chọn điều chỉnh ngưỡng route chậm, [tỷ lệ lấy mẫu](#sampling) và các path cần bỏ qua.

Bạn có thể có một số request được dự kiến sẽ mất nhiều thời gian hơn các request khác. Trong những trường hợp đó, bạn có thể cấu hình ngưỡng riêng cho từng request:

```php
Recorders\SlowRequests::class => [
    // ...
    'threshold' => [
        '#^/admin/#' => 5000,
        'default' => env('PULSE_SLOW_REQUESTS_THRESHOLD', 1000),
    ],
],
```

Nếu không có pattern regular expression nào khớp với URL của request, giá trị `'default'` sẽ được sử dụng.

<a name="servers-recorder"></a>
#### Server

Recorder `Servers` thu thập mức sử dụng CPU, bộ nhớ và storage của các server vận hành ứng dụng để hiển thị trên card [Servers](#servers-card). Recorder này yêu cầu [command pulse:check](#capturing-entries) phải chạy trên từng server mà bạn muốn giám sát.

Mỗi server gửi báo cáo phải có một tên duy nhất. Theo mặc định, Pulse sử dụng giá trị được trả về bởi hàm `gethostname` của PHP. Nếu muốn tùy biến, bạn có thể đặt biến môi trường `PULSE_SERVER_NAME`:

```env
PULSE_SERVER_NAME=load-balancer
```

File cấu hình Pulse cũng cho phép bạn tùy biến các thư mục được giám sát.

<a name="user-jobs-recorder"></a>
#### Job của người dùng

Recorder `UserJobs` thu thập thông tin về những người dùng dispatch job trong ứng dụng để hiển thị trên card [Application Usage](#application-usage-card).

Bạn có thể tùy chọn điều chỉnh [tỷ lệ lấy mẫu](#sampling) và các pattern job cần bỏ qua.

<a name="user-requests-recorder"></a>
#### Request của người dùng

Recorder `UserRequests` thu thập thông tin về những người dùng gửi request đến ứng dụng để hiển thị trên card [Application Usage](#application-usage-card).

Bạn có thể tùy chọn điều chỉnh [tỷ lệ lấy mẫu](#sampling) và các pattern URL cần bỏ qua.

<a name="filtering"></a>
### Lọc

Như đã thấy, nhiều [recorder](#recorders) cho phép, thông qua cấu hình, "bỏ qua" các entry đến dựa trên giá trị của chúng, chẳng hạn URL của request. Tuy nhiên, đôi khi việc lọc record dựa trên các yếu tố khác, chẳng hạn người dùng hiện đang được xác thực, có thể hữu ích. Để lọc các record này, bạn có thể truyền một closure vào phương thức `filter` của Pulse. Thông thường, phương thức `filter` nên được gọi trong phương thức `boot` của `AppServiceProvider` trong ứng dụng:

```php
use Illuminate\Support\Facades\Auth;
use Laravel\Pulse\Entry;
use Laravel\Pulse\Facades\Pulse;
use Laravel\Pulse\Value;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Pulse::filter(function (Entry|Value $entry) {
        return Auth::user()->isNotAdmin();
    });

    // ...
}
```

<a name="performance"></a>
## Hiệu năng

Pulse được thiết kế để có thể tích hợp vào một ứng dụng hiện có mà không yêu cầu bất kỳ hạ tầng bổ sung nào. Tuy nhiên, đối với các ứng dụng có lưu lượng truy cập cao, có một số cách để loại bỏ tác động mà Pulse có thể gây ra đối với hiệu năng của ứng dụng.

<a name="using-a-different-database"></a>
### Sử dụng cơ sở dữ liệu khác

Đối với các ứng dụng có lưu lượng truy cập cao, bạn có thể muốn sử dụng một kết nối cơ sở dữ liệu chuyên dụng cho Pulse để tránh ảnh hưởng đến cơ sở dữ liệu của ứng dụng.

Bạn có thể tùy biến [kết nối cơ sở dữ liệu](/docs/{{version}}/database#configuration) mà Pulse sử dụng bằng cách đặt biến môi trường `PULSE_DB_CONNECTION`.

```env
PULSE_DB_CONNECTION=pulse
```

<a name="ingest"></a>
### Thu nạp qua Redis

> [!WARNING]
> Tính năng thu nạp qua Redis yêu cầu Redis 6.2 trở lên và `phpredis` hoặc `predis` được cấu hình làm Redis client driver của ứng dụng.

Theo mặc định, Pulse sẽ lưu entry trực tiếp vào [kết nối cơ sở dữ liệu đã cấu hình](#using-a-different-database) sau khi HTTP response được gửi đến client hoặc một job đã được xử lý; tuy nhiên, bạn có thể sử dụng Redis ingest driver của Pulse để gửi entry đến một Redis stream thay thế. Có thể bật tính năng này bằng cách cấu hình biến môi trường `PULSE_INGEST_DRIVER`:

```ini
PULSE_INGEST_DRIVER=redis
```

Theo mặc định, Pulse sẽ sử dụng [kết nối Redis](/docs/{{version}}/redis#configuration) mặc định của bạn, nhưng bạn có thể tùy biến thông qua biến môi trường `PULSE_REDIS_CONNECTION`:

```ini
PULSE_REDIS_CONNECTION=pulse
```

> [!WARNING]
> Khi sử dụng Redis ingest driver, bản cài đặt Pulse của bạn phải luôn sử dụng một kết nối Redis khác với queue sử dụng Redis, nếu có.

Khi sử dụng tính năng thu nạp qua Redis, bạn cần chạy command `pulse:work` để giám sát stream và chuyển các entry từ Redis vào các bảng cơ sở dữ liệu của Pulse.

```php
php artisan pulse:work
```

> [!NOTE]
> Để giữ process `pulse:work` chạy liên tục ở background, bạn nên sử dụng process monitor như Supervisor để đảm bảo Pulse worker không bị dừng.

Vì command `pulse:work` là một process chạy lâu dài, nó sẽ không nhận thấy các thay đổi trong codebase nếu không được restart. Bạn nên restart command một cách graceful bằng cách gọi command `pulse:restart` trong quá trình deploy ứng dụng:

```shell
php artisan pulse:restart
```

> [!NOTE]
> Pulse sử dụng [cache](/docs/{{version}}/cache) để lưu các tín hiệu restart, vì vậy bạn nên xác minh rằng một cache driver đã được cấu hình đúng cho ứng dụng trước khi sử dụng tính năng này.

<a name="sampling"></a>
### Lấy mẫu

Theo mặc định, Pulse sẽ thu thập mọi event liên quan xảy ra trong ứng dụng. Đối với các ứng dụng có lưu lượng truy cập cao, điều này có thể dẫn đến việc phải tổng hợp hàng triệu dòng dữ liệu trên dashboard, đặc biệt với các khoảng thời gian dài hơn.

Thay vào đó, bạn có thể bật "lấy mẫu" cho một số recorder dữ liệu của Pulse. Ví dụ, đặt tỷ lệ lấy mẫu thành `0.1` trên recorder [User Requests](#user-requests-recorder) có nghĩa là bạn chỉ ghi lại khoảng 10% request đến ứng dụng. Trên dashboard, các giá trị sẽ được quy đổi tăng tương ứng và có tiền tố `~` để cho biết đó là giá trị xấp xỉ.

Nhìn chung, bạn càng có nhiều entry cho một metric cụ thể thì càng có thể giảm tỷ lệ lấy mẫu mà vẫn không làm mất quá nhiều độ chính xác.

<a name="trimming"></a>
### Cắt tỉa dữ liệu

Pulse sẽ tự động cắt tỉa các entry đã lưu khi chúng nằm ngoài khoảng thời gian của dashboard. Việc cắt tỉa diễn ra trong quá trình thu nạp dữ liệu bằng một cơ chế lottery có thể được tùy biến trong [file cấu hình](#configuration) của Pulse.

<a name="pulse-exceptions"></a>
### Xử lý exception của Pulse

Nếu xảy ra exception trong khi thu thập dữ liệu Pulse, chẳng hạn không thể kết nối đến cơ sở dữ liệu lưu trữ, Pulse sẽ âm thầm bỏ qua lỗi để tránh ảnh hưởng đến ứng dụng.

Nếu muốn tùy biến cách xử lý các exception này, bạn có thể truyền một closure vào phương thức `handleExceptionsUsing`:

```php
use Laravel\Pulse\Facades\Pulse;
use Illuminate\Support\Facades\Log;

Pulse::handleExceptionsUsing(function ($e) {
    Log::debug('An exception happened in Pulse', [
        'message' => $e->getMessage(),
        'stack' => $e->getTraceAsString(),
    ]);
});
```

<a name="custom-cards"></a>
## Card tùy chỉnh

Pulse cho phép bạn xây dựng các card tùy chỉnh để hiển thị dữ liệu phù hợp với nhu cầu cụ thể của ứng dụng. Pulse sử dụng [Livewire](https://livewire.laravel.com), vì vậy bạn có thể muốn [xem lại tài liệu của Livewire](https://livewire.laravel.com/docs) trước khi xây dựng card tùy chỉnh đầu tiên.

<a name="custom-card-components"></a>
### Component của card

Việc tạo một card tùy chỉnh trong Laravel Pulse bắt đầu bằng cách kế thừa component Livewire `Card` cơ sở và định nghĩa một view tương ứng:

```php
namespace App\Livewire\Pulse;

use Laravel\Pulse\Livewire\Card;
use Livewire\Attributes\Lazy;

#[Lazy]
class TopSellers extends Card
{
    public function render()
    {
        return view('livewire.pulse.top-sellers');
    }
}
```

Khi sử dụng tính năng [lazy loading](https://livewire.laravel.com/docs/lazy) của Livewire, component `Card` sẽ tự động cung cấp một placeholder tuân theo các thuộc tính `cols` và `rows` được truyền vào component của bạn.

Khi viết view tương ứng cho card Pulse, bạn có thể tận dụng các Blade component của Pulse để có giao diện và trải nghiệm nhất quán:

```blade
<x-pulse::card :cols="$cols" :rows="$rows" :class="$class" wire:poll.5s="">
    <x-pulse::card-header name="Top Sellers">
        <x-slot:icon>
            ...
        </x-slot:icon>
    </x-pulse::card-header>

    <x-pulse::scroll :expand="$expand">
        ...
    </x-pulse::scroll>
</x-pulse::card>
```

Các biến `$cols`, `$rows`, `$class` và `$expand` nên được truyền vào các Blade component tương ứng để layout của card có thể được tùy biến từ view dashboard. Bạn cũng có thể thêm thuộc tính `wire:poll.5s=""` vào view để card tự động cập nhật.

Sau khi đã định nghĩa component Livewire và template, bạn có thể đưa card vào [view dashboard](#dashboard-customization):

```blade
<x-pulse>
    ...

    <livewire:pulse.top-sellers cols="4" />
</x-pulse>
```

> [!NOTE]
> Nếu card của bạn nằm trong một package, bạn cần đăng ký component với Livewire bằng phương thức `Livewire::component`.

<a name="custom-card-styling"></a>
### Tạo kiểu

Nếu card cần thêm style ngoài các class và component có sẵn trong Pulse, bạn có một số lựa chọn để đưa CSS tùy chỉnh vào card.

<a name="custom-card-styling-vite"></a>
#### Tích hợp Laravel Vite

Nếu card tùy chỉnh nằm trong codebase của ứng dụng và bạn đang sử dụng [tích hợp Vite](/docs/{{version}}/vite) của Laravel, bạn có thể cập nhật file `vite.config.js` để thêm một CSS entry point riêng cho card:

```js
laravel({
    input: [
        'resources/css/pulse/top-sellers.css',
        // ...
    ],
}),
```

Sau đó, bạn có thể sử dụng Blade directive `@vite` trong [view dashboard](#dashboard-customization), chỉ định CSS entry point cho card:

```blade
<x-pulse>
    @vite('resources/css/pulse/top-sellers.css')

    ...
</x-pulse>
```

<a name="custom-card-styling-css"></a>
#### File CSS

Đối với các trường hợp sử dụng khác, bao gồm card Pulse nằm trong một package, bạn có thể yêu cầu Pulse tải thêm stylesheet bằng cách định nghĩa phương thức `css` trên component Livewire, phương thức này trả về đường dẫn đến file CSS:

```php
class TopSellers extends Card
{
    // ...

    protected function css()
    {
        return __DIR__.'/../../dist/top-sellers.css';
    }
}
```

Khi card này được đưa vào dashboard, Pulse sẽ tự động nhúng nội dung file vào một thẻ `<style>`, vì vậy file không cần được publish vào thư mục `public`.

<a name="custom-card-styling-tailwind"></a>
#### Tailwind CSS

Khi sử dụng Tailwind CSS, bạn nên tạo một CSS entry point riêng. Ví dụ sau loại trừ các base style [Preflight](https://tailwindcss.com/docs/preflight) của Tailwind vốn đã được Pulse bao gồm, đồng thời giới hạn phạm vi Tailwind bằng CSS selector để tránh xung đột với các class Tailwind của Pulse:

```css
@import "tailwindcss/theme.css";

@custom-variant dark (&:where(.dark, .dark *));
@source "./../../views/livewire/pulse/top-sellers.blade.php";

@theme {
  /* ... */
}

#top-sellers {
  @import "tailwindcss/utilities.css" source(none);
}
```

Bạn cũng cần thêm thuộc tính `id` hoặc `class` vào view của card sao cho khớp với CSS selector trong entry point:

```blade
<x-pulse::card id="top-sellers" :cols="$cols" :rows="$rows" class="$class">
    ...
</x-pulse::card>
```

<a name="custom-card-data"></a>
### Thu thập và tổng hợp dữ liệu

Card tùy chỉnh có thể lấy và hiển thị dữ liệu từ bất kỳ đâu; tuy nhiên, bạn có thể muốn tận dụng hệ thống ghi nhận và tổng hợp dữ liệu mạnh mẽ, hiệu quả của Pulse.

<a name="custom-card-data-capture"></a>
#### Thu thập entry

Pulse cho phép bạn ghi lại các "entry" bằng phương thức `Pulse::record`:

```php
use Laravel\Pulse\Facades\Pulse;

Pulse::record('user_sale', $user->id, $sale->amount)
    ->sum()
    ->count();
```

Đối số đầu tiên truyền vào phương thức `record` là `type` của entry đang ghi, còn đối số thứ hai là `key` quyết định cách nhóm dữ liệu tổng hợp. Với hầu hết phương thức tổng hợp, bạn cũng cần chỉ định một `value` để tổng hợp. Trong ví dụ trên, giá trị được tổng hợp là `$sale->amount`. Sau đó, bạn có thể gọi một hoặc nhiều phương thức tổng hợp (chẳng hạn `sum`) để Pulse thu thập các giá trị đã được tổng hợp trước vào các "bucket", giúp truy xuất hiệu quả về sau.

Các phương thức tổng hợp khả dụng gồm:

* `avg`
* `count`
* `max`
* `min`
* `sum`

> [!NOTE]
> Khi xây dựng một package card có thu thập ID của người dùng hiện đang được xác thực, bạn nên sử dụng phương thức `Pulse::resolveAuthenticatedUserId()`, phương thức này tôn trọng mọi [tùy biến user resolver](#dashboard-resolving-users) đã được thực hiện trong ứng dụng.

<a name="custom-card-data-retrieval"></a>
#### Truy xuất dữ liệu tổng hợp

Khi kế thừa component Livewire `Card` của Pulse, bạn có thể sử dụng phương thức `aggregate` để truy xuất dữ liệu tổng hợp cho khoảng thời gian đang được xem trên dashboard:

```php
class TopSellers extends Card
{
    public function render()
    {
        return view('livewire.pulse.top-sellers', [
            'topSellers' => $this->aggregate('user_sale', ['sum', 'count'])
        ]);
    }
}
```

Phương thức `aggregate` trả về một collection gồm các object PHP `stdClass`. Mỗi object sẽ chứa property `key` đã được thu thập trước đó, cùng với các key cho từng phép tổng hợp được yêu cầu:

```blade
@foreach ($topSellers as $seller)
    {{ $seller->key }}
    {{ $seller->sum }}
    {{ $seller->count }}
@endforeach
```

Pulse chủ yếu truy xuất dữ liệu từ các bucket đã được tổng hợp trước; vì vậy, các phép tổng hợp được chỉ định phải được thu thập từ trước bằng phương thức `Pulse::record`. Bucket cũ nhất thường sẽ nằm một phần ngoài khoảng thời gian, nên Pulse sẽ tổng hợp các entry cũ nhất để bù phần thiếu và cung cấp giá trị chính xác cho toàn bộ khoảng thời gian mà không cần tổng hợp lại toàn bộ khoảng thời gian ở mỗi poll request.

Bạn cũng có thể truy xuất giá trị tổng cho một type nhất định bằng phương thức `aggregateTotal`. Ví dụ, đoạn sau sẽ truy xuất tổng doanh số của tất cả người dùng thay vì nhóm theo từng người dùng.

```php
$total = $this->aggregateTotal('user_sale', 'sum');
```

<a name="custom-card-displaying-users"></a>
#### Hiển thị người dùng

Khi làm việc với dữ liệu tổng hợp ghi ID người dùng làm key, bạn có thể phân giải các key thành record người dùng bằng phương thức `Pulse::resolveUsers`:

```php
$aggregates = $this->aggregate('user_sale', ['sum', 'count']);

$users = Pulse::resolveUsers($aggregates->pluck('key'));

return view('livewire.pulse.top-sellers', [
    'sellers' => $aggregates->map(fn ($aggregate) => (object) [
        'user' => $users->find($aggregate->key),
        'sum' => $aggregate->sum,
        'count' => $aggregate->count,
    ])
]);
```

Phương thức `find` trả về một object chứa các key `name`, `extra` và `avatar`; bạn có thể tùy chọn truyền trực tiếp object này vào Blade component `<x-pulse::user-card>`:

```blade
<x-pulse::user-card :user="{{ $seller->user }}" :stats="{{ $seller->sum }}" />
```

<a name="custom-recorders"></a>
#### Recorder tùy chỉnh

Tác giả package có thể muốn cung cấp các recorder class để cho phép người dùng cấu hình việc thu thập dữ liệu.

Các recorder được đăng ký trong phần `recorders` của file cấu hình `config/pulse.php` của ứng dụng:

```php
[
    // ...
    'recorders' => [
        Acme\Recorders\Deployments::class => [
            // ...
        ],

        // ...
    ],
]
```

Recorder có thể lắng nghe event bằng cách chỉ định property `$listen`. Pulse sẽ tự động đăng ký các listener và gọi phương thức `record` của recorder:

```php
<?php

namespace Acme\Recorders;

use Acme\Events\Deployment;
use Illuminate\Support\Facades\Config;
use Laravel\Pulse\Facades\Pulse;

class Deployments
{
    /**
     * The events to listen for.
     *
     * @var array<int, class-string>
     */
    public array $listen = [
        Deployment::class,
    ];

    /**
     * Record the deployment.
     */
    public function record(Deployment $event): void
    {
        $config = Config::get('pulse.recorders.'.static::class);

        Pulse::record(
            // ...
        );
    }
}
```
