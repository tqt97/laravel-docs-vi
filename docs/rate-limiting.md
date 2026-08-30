# Giới hạn tần suất (Rate Limiting)

<a name="introduction"></a>
## Giới thiệu

Laravel cung cấp một abstraction rate limiting dễ sử dụng. Khi kết hợp với [cache](cache) của ứng dụng, abstraction này cho phép bạn giới hạn số lần một hành động bất kỳ được thực hiện trong một khoảng thời gian xác định.

> [!NOTE]
> Nếu bạn muốn giới hạn tần suất các HTTP request đi vào ứng dụng, hãy xem [tài liệu rate limiter middleware](/docs/{{version}}/routing#rate-limiting).

<a name="cache-configuration"></a>
### Cấu hình cache

Thông thường, rate limiter sử dụng cache mặc định của ứng dụng được khai báo bởi key `default` trong file cấu hình `cache`. Tuy nhiên, bạn có thể chỉ định cache driver riêng cho rate limiter bằng cách thêm key `limiter` trong file cấu hình `cache`:

```php
'default' => env('CACHE_STORE', 'database'),

'limiter' => 'redis', // [tl! add]
```

<a name="basic-usage"></a>
## Cách sử dụng cơ bản

Bạn có thể tương tác với rate limiter thông qua facade `Illuminate\Support\Facades\RateLimiter`. Method đơn giản nhất là `attempt`, dùng để giới hạn số lần một callback được phép thực thi trong một khoảng thời gian.

Method `attempt` trả về `false` khi callback đã hết số lần thử cho phép; ngược lại, method sẽ trả về kết quả của callback hoặc `true`. Tham số đầu tiên của `attempt` là một "key" của rate limiter. Key có thể là bất kỳ chuỗi nào bạn chọn để đại diện cho hành động cần giới hạn:

```php
use Illuminate\Support\Facades\RateLimiter;

$executed = RateLimiter::attempt(
    'send-message:'.$user->id,
    $perMinute = 5,
    function() {
        // Send message...
    }
);

if (! $executed) {
    return 'Too many messages sent!';
}
```

Khi cần, bạn có thể truyền tham số thứ tư cho `attempt` là "decay rate" — số giây trước khi số lần thử khả dụng được reset. Ví dụ, ta có thể sửa ví dụ trên để cho phép năm lần thử trong mỗi hai phút:

```php
$executed = RateLimiter::attempt(
    'send-message:'.$user->id,
    $perTwoMinutes = 5,
    function() {
        // Send message...
    },
    $decayRate = 120,
);
```

<a name="manually-incrementing-attempts"></a>
### Tăng số lần thử thủ công

Nếu muốn tương tác trực tiếp hơn với rate limiter, Laravel cung cấp nhiều method khác. Chẳng hạn, bạn có thể gọi `tooManyAttempts` để xác định một key đã vượt quá số lần thử tối đa được phép trong mỗi phút hay chưa:

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    return 'Too many attempts!';
}

RateLimiter::increment('send-message:'.$user->id);

// Send message...
```

Khi rate-limit một endpoint có thể nhận nhiều request đồng thời, bạn có thể kiểm tra trực tiếp giá trị trả về từ `increment` thay vì gọi riêng `tooManyAttempts` rồi `increment`. Với cache store `redis`, `memcached` hoặc `database`, giá trị này được tăng theo cách atomic, bảo đảm mỗi request đồng thời nhận được một counter riêng và nhất quán:

```php
use Illuminate\Support\Facades\RateLimiter;

$perMinute = 5;

if (RateLimiter::increment('send-message:'.$user->id) > $perMinute) {
    return 'Too many attempts!';
}

// Send message...
```

Ngoài ra, bạn có thể dùng `remaining` để lấy số lần thử còn lại của một key. Nếu key vẫn còn lượt thử, bạn có thể gọi `increment` để tăng tổng số lần đã thử:

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::remaining('send-message:'.$user->id, $perMinute = 5)) {
    RateLimiter::increment('send-message:'.$user->id);

    // Send message...
}
```

Nếu muốn tăng counter của một rate limiter key nhiều hơn một đơn vị, hãy truyền số lượng mong muốn vào `increment`:

```php
RateLimiter::increment('send-message:'.$user->id, amount: 5);
```

<a name="determining-limiter-availability"></a>
#### Xác định khi nào limiter khả dụng trở lại

Khi một key không còn lượt thử, method `availableIn` trả về số giây còn lại trước khi có thêm lượt thử mới:

```php
use Illuminate\Support\Facades\RateLimiter;

if (RateLimiter::tooManyAttempts('send-message:'.$user->id, $perMinute = 5)) {
    $seconds = RateLimiter::availableIn('send-message:'.$user->id);

    return 'You may try again in '.$seconds.' seconds.';
}

RateLimiter::increment('send-message:'.$user->id);

// Send message...
```

<a name="clearing-attempts"></a>
### Xóa số lần thử

Bạn có thể reset số lần thử của một rate limiter key bằng method `clear`. Ví dụ, có thể reset counter khi message tương ứng đã được người nhận đọc:

```php
use App\Models\Message;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Mark the message as read.
 */
public function read(Message $message): Message
{
    $message->markAsRead();

    RateLimiter::clear('send-message:'.$message->user_id);

    return $message;
}
```
