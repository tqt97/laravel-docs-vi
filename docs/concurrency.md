# Thực thi đồng thời (Concurrency)

<a name="introduction"></a>
## Giới thiệu

Đôi khi bạn cần thực thi nhiều tác vụ chậm nhưng không phụ thuộc lẫn nhau. Trong nhiều trường hợp, chạy các tác vụ này đồng thời có thể cải thiện đáng kể hiệu năng. Facade `Concurrency` của Laravel cung cấp một API đơn giản và thuận tiện để chạy nhiều closure song song.

<a name="how-it-works"></a>
#### Cơ chế hoạt động

Laravel thực hiện concurrency bằng cách serialize các closure được cung cấp rồi gửi chúng tới một Artisan CLI command nội bộ. Command này unserialize các closure và gọi từng closure trong một PHP process riêng. Sau khi closure hoàn tất, giá trị kết quả được serialize và gửi trở lại process cha.

Facade `Concurrency` hỗ trợ ba driver: `process` (mặc định), `fork` và `sync`.

Driver `fork` có hiệu năng tốt hơn driver `process` mặc định, nhưng chỉ có thể sử dụng trong ngữ cảnh PHP CLI vì PHP không hỗ trợ fork process trong lúc xử lý web request. Trước khi dùng driver `fork`, bạn cần cài package `spatie/fork`:

```shell
composer require spatie/fork
```

Driver `sync` chủ yếu hữu ích trong testing khi bạn muốn vô hiệu hóa concurrency và đơn giản là chạy tuần tự các closure trong process cha.

<a name="running-concurrent-tasks"></a>
## Chạy các tác vụ đồng thời

Để chạy các tác vụ đồng thời, bạn có thể gọi method `run` trên facade `Concurrency`. Method `run` nhận một mảng closure và thực thi chúng cùng lúc trong các PHP process con:

```php
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;

[$userCount, $orderCount] = Concurrency::run([
    fn () => DB::table('users')->count(),
    fn () => DB::table('orders')->count(),
]);
```

Để sử dụng một driver cụ thể, hãy gọi method `driver`:

```php
$results = Concurrency::driver('fork')->run(...);
```

Hoặc nếu muốn thay đổi concurrency driver mặc định, hãy publish file cấu hình `concurrency` bằng Artisan command `config:publish`, sau đó cập nhật tùy chọn `default` trong file:

```shell
php artisan config:publish concurrency
```

<a name="named-results"></a>
### Kết quả có tên

Nếu muốn truy cập kết quả theo tên thay vì vị trí trong mảng, bạn có thể truyền một associative array các closure. Mỗi kết quả sẽ được trả về với cùng key tương ứng với closure của nó:

```php
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;

$results = Concurrency::run([
    'users' => fn () => DB::table('users')->count(),
    'orders' => fn () => DB::table('orders')->count(),
]);

$userCount = $results['users'];
$orderCount = $results['orders'];
```

<a name="task-timeouts"></a>
### Thời gian chờ của tác vụ

Khi dùng driver `process` (mặc định), bạn có thể chỉ định số giây tối đa mà một tác vụ được phép chạy trước khi bị kết thúc bằng cách truyền `timeout` vào method `run`:

```php
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;

[$userCount, $orderCount] = Concurrency::run([
    fn () => DB::table('users')->count(),
    fn () => DB::table('orders')->count(),
], timeout: 30);
```

Bạn cũng có thể truyền một instance `CarbonInterval` nếu muốn biểu diễn timeout rõ nghĩa hơn:

```php
use Illuminate\Support\Facades\Concurrency;

use function Illuminate\Support\seconds;

Concurrency::run([...], timeout: seconds(30));
```

<a name="deferring-concurrent-tasks"></a>
## Trì hoãn các tác vụ đồng thời

Nếu muốn chạy đồng thời một mảng closure nhưng không cần quan tâm tới giá trị trả về, bạn nên cân nhắc method `defer`. Khi `defer` được gọi, các closure không chạy ngay lập tức. Thay vào đó, Laravel sẽ chạy chúng đồng thời sau khi HTTP response đã được gửi cho người dùng:

```php
use App\Services\Metrics;
use Illuminate\Support\Facades\Concurrency;

Concurrency::defer([
    fn () => Metrics::report('users'),
    fn () => Metrics::report('orders'),
]);
```
