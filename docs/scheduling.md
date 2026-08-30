# Lập lịch tác vụ

- [Giới thiệu](#introduction)
- [Định nghĩa lịch chạy](#defining-schedules)
    - [Lập lịch lệnh Artisan](#scheduling-artisan-commands)
    - [Lập lịch queued job](#scheduling-queued-jobs)
    - [Lập lịch lệnh shell](#scheduling-shell-commands)
    - [Các tùy chọn tần suất](#schedule-frequency-options)
    - [Múi giờ](#timezones)
    - [Ngăn tác vụ chạy chồng lấn](#preventing-task-overlaps)
    - [Chỉ chạy tác vụ trên một server](#running-tasks-on-one-server)
    - [Tác vụ nền](#background-tasks)
    - [Chế độ bảo trì](#maintenance-mode)
    - [Tạm dừng tác vụ đã lập lịch](#pausing-scheduled-tasks)
    - [Nhóm lịch chạy](#schedule-groups)
- [Chạy scheduler](#running-the-scheduler)
    - [Tác vụ có chu kỳ dưới một phút](#sub-minute-scheduled-tasks)
    - [Chạy scheduler ở môi trường local](#running-the-scheduler-locally)
- [Output của tác vụ](#task-output)
- [Hook của tác vụ](#task-hooks)
- [Sự kiện](#events)

<a name="introduction"></a>
## Giới thiệu

Trước đây, bạn có thể phải tạo một mục cấu hình cron riêng cho từng tác vụ cần lập lịch trên server. Cách làm này nhanh chóng trở nên khó quản lý vì lịch chạy không nằm trong hệ thống quản lý mã nguồn; mỗi khi cần xem hoặc bổ sung cron entry, bạn lại phải SSH vào server.

Command scheduler của Laravel cung cấp một cách tiếp cận gọn gàng hơn để quản lý các tác vụ định kỳ trên server. Bạn có thể định nghĩa lịch chạy ngay trong ứng dụng Laravel bằng API fluent, rõ ràng và dễ đọc. Khi sử dụng scheduler, server chỉ cần **một cron entry duy nhất**; lịch của từng tác vụ thường được khai báo trong file `routes/console.php` của ứng dụng.

<a name="defining-schedules"></a>
## Định nghĩa lịch chạy

Bạn có thể định nghĩa toàn bộ tác vụ đã lập lịch trong file `routes/console.php` của ứng dụng. Ví dụ dưới đây lập lịch để một closure được gọi vào nửa đêm mỗi ngày; bên trong closure, một truy vấn database được thực thi để xóa dữ liệu của bảng:

```php
<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    DB::table('recent_users')->delete();
})->daily();
```

Ngoài closure, bạn cũng có thể lập lịch cho [invokable object](https://secure.php.net/manual/en/language.oop5.magic.php#object.invoke). Đây là các class PHP có định nghĩa phương thức `__invoke`:

```php
Schedule::call(new DeleteRecentUsers)->daily();
```

Nếu muốn dành `routes/console.php` chỉ cho việc định nghĩa command, bạn có thể khai báo các tác vụ đã lập lịch bằng phương thức `withSchedule` trong `bootstrap/app.php`. Phương thức này nhận một closure, và closure đó nhận instance của scheduler:

```php
use Illuminate\Console\Scheduling\Schedule;

->withSchedule(function (Schedule $schedule) {
    $schedule->call(new DeleteRecentUsers)->daily();
})
```

Để xem tổng quan các tác vụ đã lập lịch cùng thời điểm chạy kế tiếp của chúng, hãy sử dụng lệnh Artisan `schedule:list`:

```shell
php artisan schedule:list
```

<a name="scheduling-artisan-commands"></a>
### Lập lịch lệnh Artisan

Ngoài closure, bạn có thể lập lịch cho [lệnh Artisan](/docs/{{version}}/artisan) và command của hệ thống. Phương thức `command` cho phép lập lịch một Artisan command bằng tên command hoặc class của command đó.

Khi lập lịch Artisan command bằng tên class, bạn có thể truyền thêm một mảng các đối số dòng lệnh để Laravel cung cấp cho command lúc thực thi:

```php
use App\Console\Commands\SendEmailsCommand;
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send Taylor --force')->daily();

Schedule::command(SendEmailsCommand::class, ['Taylor', '--force'])->daily();
```

<a name="scheduling-artisan-closure-commands"></a>
#### Lập lịch Artisan command định nghĩa bằng closure

Nếu muốn lập lịch một Artisan command được định nghĩa bằng closure, bạn có thể chain các phương thức lập lịch ngay sau phần định nghĩa command:

```php
Artisan::command('delete:recent-users', function () {
    DB::table('recent_users')->delete();
})->purpose('Delete recent users')->daily();
```

Nếu closure command cần đối số, hãy truyền các đối số đó cho phương thức `schedule`:

```php
Artisan::command('emails:send {user} {--force}', function ($user) {
    // ...
})->purpose('Send emails to the specified user')->schedule(['Taylor', '--force'])->daily();
```

<a name="scheduling-queued-jobs"></a>
### Lập lịch queued job

Phương thức `job` được dùng để lập lịch một [queued job](/docs/{{version}}/queues). Nhờ đó, bạn có thể đưa job vào queue theo lịch mà không cần dùng `call` để tạo một closure chỉ nhằm dispatch job:

```php
use App\Jobs\Heartbeat;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new Heartbeat)->everyFiveMinutes();
```

Đối số thứ hai và thứ ba của `job` là tùy chọn, lần lượt cho phép chỉ định tên queue và queue connection mà job sẽ được đưa vào:

```php
use App\Jobs\Heartbeat;
use Illuminate\Support\Facades\Schedule;

// Dispatch the job to the "heartbeats" queue on the "sqs" connection...
Schedule::job(new Heartbeat, 'heartbeats', 'sqs')->everyFiveMinutes();
```

<a name="scheduling-shell-commands"></a>
### Lập lịch lệnh shell

Phương thức `exec` có thể được dùng để thực thi một command của hệ điều hành:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::exec('node /home/forge/script.js')->daily();
```

<a name="schedule-frequency-options"></a>
### Các tùy chọn tần suất

Ở trên, chúng ta đã thấy một số cách cấu hình tác vụ chạy theo những khoảng thời gian nhất định. Laravel còn cung cấp nhiều tần suất lập lịch khác mà bạn có thể áp dụng cho tác vụ:

<div class="overflow-auto">

| Method                             | Description                                              |
| ---------------------------------- | -------------------------------------------------------- |
| `->cron('* * * * *');`             | Chạy tác vụ theo biểu thức cron tùy chỉnh.                  |
| `->everySecond();`                 | Chạy tác vụ mỗi giây.                               |
| `->everyTwoSeconds();`             | Chạy tác vụ mỗi hai giây.                          |
| `->everyFiveSeconds();`            | Chạy tác vụ mỗi năm giây.                         |
| `->everyTenSeconds();`             | Chạy tác vụ mỗi mười giây.                          |
| `->everyFifteenSeconds();`         | Chạy tác vụ mỗi mười lăm giây.                      |
| `->everyTwentySeconds();`          | Chạy tác vụ mỗi hai mươi giây.                       |
| `->everyThirtySeconds();`          | Chạy tác vụ mỗi ba mươi giây.                       |
| `->everyMinute();`                 | Chạy tác vụ mỗi phút.                               |
| `->everyTwoMinutes();`             | Chạy tác vụ mỗi hai phút.                          |
| `->everyThreeMinutes();`           | Chạy tác vụ mỗi ba phút.                        |
| `->everyFourMinutes();`            | Chạy tác vụ mỗi bốn phút.                         |
| `->everyFiveMinutes();`            | Chạy tác vụ mỗi năm phút.                         |
| `->everyTenMinutes();`             | Chạy tác vụ mỗi mười phút.                          |
| `->everyFifteenMinutes();`         | Chạy tác vụ mỗi mười lăm phút.                      |
| `->everyThirtyMinutes();`          | Chạy tác vụ mỗi ba mươi phút.                       |
| `->hourly();`                      | Chạy tác vụ mỗi giờ.                                 |
| `->hourlyAt(17);`                  | Chạy tác vụ mỗi giờ, tại phút thứ 17.     |
| `->everyOddHour($minutes = 0);`    | Chạy tác vụ vào mỗi giờ lẻ.                             |
| `->everyTwoHours($minutes = 0);`   | Chạy tác vụ mỗi hai giờ.                            |
| `->everyThreeHours($minutes = 0);` | Chạy tác vụ mỗi ba giờ.                          |
| `->everyFourHours($minutes = 0);`  | Chạy tác vụ mỗi bốn giờ.                           |
| `->everySixHours($minutes = 0);`   | Chạy tác vụ mỗi sáu giờ.                            |
| `->daily();`                       | Chạy tác vụ mỗi ngày lúc nửa đêm.                      |
| `->dailyAt('13:00');`              | Chạy tác vụ mỗi ngày lúc 13:00.                         |
| `->twiceDaily(1, 13);`             | Chạy tác vụ mỗi ngày lúc 1:00 và 13:00.                      |
| `->twiceDailyAt(1, 13, 15);`       | Chạy tác vụ mỗi ngày lúc 1:15 và 13:15.                      |
| `->daysOfMonth([1, 10, 20]);`      | Chạy tác vụ vào các ngày cụ thể trong tháng.              |
| `->weekly();`                      | Chạy tác vụ mỗi Chủ nhật lúc 00:00.                      |
| `->weeklyOn(1, '8:00');`           | Chạy tác vụ mỗi tuần vào thứ Hai lúc 8:00.               |
| `->monthly();`                     | Chạy tác vụ vào ngày đầu tiên mỗi tháng lúc 00:00.   |
| `->monthlyOn(4, '15:00');`         | Chạy tác vụ vào ngày 4 mỗi tháng lúc 15:00.            |
| `->twiceMonthly(1, 16, '13:00');`  | Chạy tác vụ vào ngày 1 và 16 mỗi tháng lúc 13:00.       |
| `->lastDayOfMonth('15:00');`       | Chạy tác vụ vào ngày cuối tháng lúc 15:00.      |
| `->quarterly();`                   | Chạy tác vụ vào ngày đầu tiên mỗi quý lúc 00:00. |
| `->quarterlyOn(4, '14:00');`       | Chạy tác vụ vào ngày 4 của mỗi quý lúc 14:00.          |
| `->yearly();`                      | Chạy tác vụ vào ngày đầu tiên mỗi năm lúc 00:00.    |
| `->yearlyOn(6, 1, '17:00');`       | Chạy tác vụ hằng năm vào ngày 1 tháng 6 lúc 17:00.            |
| `->timezone('America/New_York');`  | Đặt múi giờ cho tác vụ.                           |

</div>

Các phương thức này có thể kết hợp với những ràng buộc bổ sung để tạo lịch chạy chính xác hơn, chẳng hạn chỉ chạy vào một số ngày nhất định trong tuần. Ví dụ, bạn có thể lập lịch command chạy hằng tuần vào thứ Hai:

```php
use Illuminate\Support\Facades\Schedule;

// Run once per week on Monday at 1 PM...
Schedule::call(function () {
    // ...
})->weekly()->mondays()->at('13:00');

// Run hourly from 8 AM to 5 PM on weekdays...
Schedule::command('foo')
    ->weekdays()
    ->hourly()
    ->timezone('America/Chicago')
    ->between('8:00', '17:00');
```

Các ràng buộc lịch chạy bổ sung gồm:

<div class="overflow-auto">

| Method                                   | Description                                            |
| ---------------------------------------- | ------------------------------------------------------ |
| `->weekdays();`                          | Chỉ chạy tác vụ vào ngày trong tuần.                            |
| `->weekends();`                          | Chỉ chạy tác vụ vào cuối tuần.                            |
| `->sundays();`                           | Chỉ chạy tác vụ vào Chủ nhật.                              |
| `->mondays();`                           | Chỉ chạy tác vụ vào thứ Hai.                              |
| `->tuesdays();`                          | Chỉ chạy tác vụ vào thứ Ba.                             |
| `->wednesdays();`                        | Chỉ chạy tác vụ vào thứ Tư.                           |
| `->thursdays();`                         | Chỉ chạy tác vụ vào thứ Năm.                            |
| `->fridays();`                           | Chỉ chạy tác vụ vào thứ Sáu.                              |
| `->saturdays();`                         | Chỉ chạy tác vụ vào thứ Bảy.                            |
| `->days(array\|mixed);`                  | Chỉ chạy tác vụ vào các ngày cụ thể.                       |
| `->between($startTime, $endTime);`       | Chỉ chạy tác vụ trong khoảng thời gian bắt đầu và kết thúc.     |
| `->unlessBetween($startTime, $endTime);` | Không chạy tác vụ trong khoảng thời gian bắt đầu và kết thúc. |
| `->when(Closure);`                       | Giới hạn tác vụ dựa trên một điều kiện boolean.                  |
| `->environments($env);`                  | Chỉ chạy tác vụ trong các environment cụ thể.               |

</div>

<a name="day-constraints"></a>
#### Ràng buộc theo ngày

Phương thức `days` giới hạn tác vụ chỉ được thực thi vào những ngày cụ thể trong tuần. Ví dụ, command sau chạy mỗi giờ vào Chủ nhật và thứ Tư:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->hourly()
    ->days([0, 3]);
```

Ngoài ra, khi chỉ định ngày chạy, bạn có thể sử dụng các constant được cung cấp bởi class `Illuminate\Console\Scheduling\Schedule`:

```php
use Illuminate\Support\Facades;
use Illuminate\Console\Scheduling\Schedule;

Facades\Schedule::command('emails:send')
    ->hourly()
    ->days([Schedule::SUNDAY, Schedule::WEDNESDAY]);
```

<a name="between-time-constraints"></a>
#### Ràng buộc theo khoảng thời gian

Phương thức `between` giới hạn việc thực thi tác vụ trong một khoảng thời gian của ngày:

```php
Schedule::command('emails:send')
    ->hourly()
    ->between('7:00', '22:00');
```

Ngược lại, `unlessBetween` có thể được dùng để loại trừ một khoảng thời gian mà tác vụ không được phép chạy:

```php
Schedule::command('emails:send')
    ->hourly()
    ->unlessBetween('23:00', '4:00');
```

<a name="truth-test-constraints"></a>
#### Ràng buộc bằng điều kiện boolean

Phương thức `when` cho phép quyết định việc chạy tác vụ dựa trên kết quả của một điều kiện. Nếu closure được cung cấp trả về `true`, tác vụ sẽ được thực thi miễn là không có ràng buộc nào khác ngăn nó chạy:

```php
Schedule::command('emails:send')->daily()->when(function () {
    return true;
});
```

Có thể xem `skip` là phép đảo của `when`. Nếu callback của `skip` trả về `true`, tác vụ đã lập lịch sẽ không được thực thi:

```php
Schedule::command('emails:send')->daily()->skip(function () {
    return true;
});
```

Khi chain nhiều `when`, command chỉ được thực thi nếu **tất cả** điều kiện `when` đều trả về `true`.

<a name="environment-constraints"></a>
#### Ràng buộc theo môi trường

Phương thức `environments` giới hạn tác vụ chỉ chạy trong các environment được chỉ định (theo [biến môi trường](/docs/{{version}}/configuration#environment-configuration) `APP_ENV`):

```php
Schedule::command('emails:send')
    ->daily()
    ->environments(['staging', 'production']);
```

<a name="timezones"></a>
### Múi giờ

Với phương thức `timezone`, bạn có thể yêu cầu Laravel diễn giải thời gian của tác vụ theo một múi giờ cụ thể:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('report:generate')
    ->timezone('America/New_York')
    ->at('2:00')
```

Nếu tất cả tác vụ đều dùng cùng một múi giờ, bạn có thể đặt múi giờ mặc định cho toàn bộ lịch chạy bằng option `schedule_timezone` trong file cấu hình `app`:

```php
'timezone' => 'UTC',

'schedule_timezone' => 'America/Chicago',
```

> [!WARNING]
> Hãy lưu ý rằng một số múi giờ áp dụng giờ mùa hè (daylight saving time). Khi thời điểm chuyển đổi DST xảy ra, tác vụ đã lập lịch có thể chạy hai lần hoặc thậm chí không chạy. Vì vậy, Laravel khuyến nghị tránh lập lịch phụ thuộc múi giờ khi có thể.

<a name="preventing-task-overlaps"></a>
### Ngăn tác vụ chạy chồng lấn

Mặc định, một lần chạy mới của tác vụ vẫn được khởi động ngay cả khi lần chạy trước chưa kết thúc. Để ngăn các lần thực thi chồng lấn nhau, hãy sử dụng `withoutOverlapping`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')->withoutOverlapping();
```

Trong ví dụ này, [Artisan command](/docs/{{version}}/artisan) `emails:send` sẽ chạy mỗi phút nếu chưa có một instance của chính tác vụ đó đang chạy. `withoutOverlapping` đặc biệt hữu ích với các tác vụ có thời gian xử lý biến động lớn, khiến bạn khó dự đoán chính xác mỗi lần chạy sẽ kéo dài bao lâu.

Nếu cần, bạn có thể chỉ định số phút trước khi lock của `withoutOverlapping` hết hạn. Mặc định lock hết hạn sau 24 giờ:

```php
Schedule::command('emails:send')->withoutOverlapping(10);
```

Ở bên trong, `withoutOverlapping` sử dụng [cache](/docs/{{version}}/cache) của ứng dụng để tạo lock. Khi cần, bạn có thể xóa các lock này bằng Artisan command `schedule:clear-cache`. Thông thường thao tác này chỉ cần thiết khi tác vụ bị kẹt do sự cố server ngoài dự kiến.

<a name="running-tasks-on-one-server"></a>
### Chỉ chạy tác vụ trên một server

> [!WARNING]
> Để sử dụng tính năng này, ứng dụng phải dùng `database`, `memcached`, `dynamodb` hoặc `redis` làm cache driver mặc định. Đồng thời, tất cả server phải kết nối tới cùng một cache server trung tâm.

Nếu scheduler của ứng dụng chạy trên nhiều server, bạn có thể giới hạn một tác vụ chỉ được thực thi trên một server. Ví dụ, giả sử có tác vụ tạo báo cáo mới vào mỗi tối thứ Sáu. Nếu scheduler đang chạy trên ba worker server, mặc định tác vụ sẽ chạy trên cả ba server và tạo báo cáo ba lần — rõ ràng đây không phải hành vi mong muốn.

Để yêu cầu tác vụ chỉ chạy trên một server, hãy gọi `onOneServer` khi định nghĩa lịch. Server đầu tiên giành được quyền thực thi sẽ giữ một **atomic lock**, nhờ đó các server còn lại không thể chạy cùng tác vụ tại cùng thời điểm:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('report:generate')
    ->fridays()
    ->at('17:00')
    ->onOneServer();
```

Bạn có thể dùng `useCache` để chỉ định cache store mà scheduler sử dụng để tạo atomic lock cho các tác vụ chỉ chạy trên một server:

```php
Schedule::useCache('database');
```

<a name="naming-unique-jobs"></a>
#### Đặt tên cho job chỉ chạy trên một server

Đôi khi bạn cần lập lịch cùng một job với nhiều bộ tham số khác nhau nhưng vẫn muốn mỗi biến thể chỉ chạy trên một server. Khi đó, hãy gán tên duy nhất cho từng định nghĩa lịch bằng phương thức `name`:

```php
Schedule::job(new CheckUptime('https://laravel.com'))
    ->name('check_uptime:laravel.com')
    ->everyFiveMinutes()
    ->onOneServer();

Schedule::job(new CheckUptime('https://vapor.laravel.com'))
    ->name('check_uptime:vapor.laravel.com')
    ->everyFiveMinutes()
    ->onOneServer();
```

Tương tự, closure đã lập lịch cũng phải được đặt tên nếu bạn muốn nó chỉ chạy trên một server:

```php
Schedule::call(fn () => User::resetApiRequestCount())
    ->name('reset-api-request-count')
    ->daily()
    ->onOneServer();
```

<a name="background-tasks"></a>
### Tác vụ nền

Mặc định, nhiều tác vụ có cùng thời điểm chạy sẽ được thực thi tuần tự theo thứ tự chúng được định nghĩa. Nếu một tác vụ chạy lâu, các tác vụ phía sau có thể bắt đầu trễ đáng kể. Để cho phép chúng chạy nền và có thể thực thi đồng thời, hãy sử dụng `runInBackground`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('analytics:report')
    ->daily()
    ->runInBackground();
```

> [!WARNING]
> Phương thức `runInBackground` chỉ dùng được với tác vụ được lập lịch thông qua `command` và `exec`.

<a name="maintenance-mode"></a>
### Chế độ bảo trì

Các tác vụ đã lập lịch sẽ không chạy khi ứng dụng ở [chế độ bảo trì](/docs/{{version}}/configuration#maintenance-mode), nhằm tránh việc tác vụ can thiệp vào quá trình bảo trì chưa hoàn tất trên server. Nếu một tác vụ vẫn phải chạy trong maintenance mode, hãy gọi `evenInMaintenanceMode` khi định nghĩa tác vụ:

```php
Schedule::command('emails:send')->evenInMaintenanceMode();
```

<a name="pausing-scheduled-tasks"></a>
### Tạm dừng tác vụ đã lập lịch

Bạn có thể tạm dừng việc xử lý các tác vụ đã lập lịch mà không cần thay đổi code đã deploy bằng Artisan command `schedule:pause`:

```shell
php artisan schedule:pause
```

Trong thời gian scheduler bị tạm dừng, không có tác vụ đã lập lịch nào được chạy. Để tiếp tục xử lý, sử dụng command `schedule:continue`:

```shell
php artisan schedule:continue
```

Nếu một tác vụ vẫn phải chạy ngay cả khi scheduler đang tạm dừng, hãy đánh dấu tác vụ bằng `evenWhenPaused`:

```php
Schedule::command('emails:send')->evenWhenPaused();
```

<a name="schedule-groups"></a>
### Nhóm lịch chạy

Khi nhiều tác vụ có cấu hình lịch giống nhau, bạn có thể dùng tính năng nhóm tác vụ của Laravel để tránh lặp lại cùng một thiết lập cho từng tác vụ. Việc nhóm giúp code ngắn gọn hơn và bảo đảm cấu hình nhất quán giữa các tác vụ liên quan.

Để tạo một nhóm, hãy gọi các phương thức cấu hình chung trước rồi gọi `group`. Phương thức `group` nhận một closure dùng để định nghĩa các tác vụ cùng chia sẻ cấu hình đó:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::daily()
    ->onOneServer()
    ->timezone('America/New_York')
    ->group(function () {
        Schedule::command('emails:send --force');
        Schedule::command('emails:prune');
    });
```

<a name="running-the-scheduler"></a>
## Chạy scheduler

Sau khi đã biết cách định nghĩa lịch, bước tiếp theo là thực thi scheduler trên server. Artisan command `schedule:run` sẽ đánh giá toàn bộ tác vụ đã lập lịch và xác định tác vụ nào cần chạy dựa trên thời gian hiện tại của server.

Vì vậy, khi dùng Laravel scheduler, server chỉ cần một cron entry duy nhất để chạy `schedule:run` mỗi phút. Nếu không muốn tự quản lý cron trên server, bạn có thể sử dụng nền tảng được quản lý như [Laravel Cloud](https://cloud.laravel.com), nơi có thể quản lý việc thực thi scheduled task thay bạn:

```shell
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

<a name="sub-minute-scheduled-tasks"></a>
### Tác vụ có chu kỳ dưới một phút

Trên phần lớn hệ điều hành, cron job chỉ có thể chạy tối đa một lần mỗi phút. Tuy nhiên, Laravel scheduler hỗ trợ tần suất ngắn hơn, thậm chí tới một lần mỗi giây:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    DB::table('recent_users')->delete();
})->everySecond();
```

Khi ứng dụng có tác vụ với chu kỳ dưới một phút, `schedule:run` sẽ tiếp tục chạy cho đến hết phút hiện tại thay vì thoát ngay. Nhờ đó command có thể kích hoạt đầy đủ các tác vụ sub-minute trong suốt phút đó.

Vì một tác vụ sub-minute chạy lâu hơn dự kiến có thể làm trễ các tác vụ sub-minute phía sau, Laravel khuyến nghị các tác vụ loại này chỉ dispatch queued job hoặc command chạy nền để xử lý công việc thực tế:

```php
use App\Jobs\DeleteRecentUsers;

Schedule::job(new DeleteRecentUsers)->everyTenSeconds();

Schedule::command('users:delete')->everyTenSeconds()->runInBackground();
```

<a name="interrupting-sub-minute-tasks"></a>
#### Ngắt tác vụ có chu kỳ dưới một phút

Do `schedule:run` sẽ tồn tại trong suốt phút hiện tại khi có sub-minute task, trong lúc deploy bạn có thể cần ngắt instance đang chạy. Nếu không, instance đó sẽ tiếp tục sử dụng phiên bản code cũ đã deploy cho tới khi phút hiện tại kết thúc.

Để ngắt các lần chạy `schedule:run` đang hoạt động, hãy thêm command `schedule:interrupt` vào deployment script. Command này nên được gọi sau khi quá trình deploy ứng dụng hoàn tất:

```shell
php artisan schedule:interrupt
```

<a name="running-the-scheduler-locally"></a>
### Chạy scheduler Locally

Thông thường bạn không cần thêm cron entry cho scheduler trên máy phát triển local. Thay vào đó, hãy dùng Artisan command `schedule:work`. Command này chạy ở foreground và kích hoạt scheduler mỗi phút cho đến khi bạn chủ động dừng nó. Nếu có sub-minute task, scheduler tiếp tục hoạt động trong từng phút để xử lý các tác vụ đó:

```shell
php artisan schedule:work
```

<a name="task-output"></a>
## Đầu ra của tác vụ

Laravel scheduler cung cấp một số phương thức thuận tiện để xử lý đầu ra do các tác vụ đã lập lịch tạo ra. Trước tiên, với phương thức `sendOutputTo`, bạn có thể ghi đầu ra vào một tệp để kiểm tra sau:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->daily()
    ->sendOutputTo($filePath);
```

Nếu muốn nối thêm đầu ra vào một tệp đã chỉ định thay vì ghi đè nội dung hiện có, bạn có thể sử dụng phương thức `appendOutputTo`:

```php
Schedule::command('emails:send')
    ->daily()
    ->appendOutputTo($filePath);
```

Với phương thức `emailOutputTo`, bạn có thể gửi đầu ra qua email đến địa chỉ mong muốn. Trước khi gửi đầu ra của tác vụ qua email, bạn cần cấu hình [dịch vụ email](/docs/{{version}}/mail) của Laravel:

```php
Schedule::command('report:generate')
    ->daily()
    ->sendOutputTo($filePath)
    ->emailOutputTo('taylor@example.com');
```

Nếu chỉ muốn gửi đầu ra qua email khi lệnh Artisan hoặc lệnh hệ thống đã lập lịch kết thúc với exit code khác `0`, hãy sử dụng phương thức `emailOutputOnFailure`:

```php
Schedule::command('report:generate')
    ->daily()
    ->emailOutputOnFailure('taylor@example.com');
```

> [!WARNING]
> Các phương thức `emailOutputTo`, `emailOutputOnFailure`, `sendOutputTo` và `appendOutputTo` chỉ áp dụng cho các tác vụ được định nghĩa bằng `command` và `exec`.

<a name="task-hooks"></a>
## Hook của tác vụ

Với các phương thức `before` và `after`, bạn có thể chỉ định đoạn mã cần chạy tương ứng trước và sau khi tác vụ đã lập lịch được thực thi:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('emails:send')
    ->daily()
    ->before(function () {
        // The task is about to execute...
    })
    ->after(function () {
        // The task has executed...
    });
```

Các phương thức `onSuccess` và `onFailure` cho phép bạn chỉ định đoạn mã cần chạy khi tác vụ đã lập lịch thành công hoặc thất bại. Tác vụ được xem là thất bại khi lệnh Artisan hoặc lệnh hệ thống đã lập lịch kết thúc với exit code khác `0`:

```php
Schedule::command('emails:send')
    ->daily()
    ->onSuccess(function () {
        // The task succeeded...
    })
    ->onFailure(function () {
        // The task failed...
    });
```

Nếu lệnh có tạo đầu ra, bạn có thể truy cập đầu ra đó trong các hook `after`, `onSuccess` hoặc `onFailure` bằng cách type-hint `Illuminate\Support\Stringable` cho tham số `$output` trong closure của hook:

```php
use Illuminate\Support\Stringable;

Schedule::command('emails:send')
    ->daily()
    ->onSuccess(function (Stringable $output) {
        // The task succeeded...
    })
    ->onFailure(function (Stringable $output) {
        // The task failed...
    });
```

<a name="pinging-urls"></a>
#### Gửi ping đến URL

Với các phương thức `pingBefore` và `thenPing`, scheduler có thể tự động gửi request đến một URL đã chỉ định trước hoặc sau khi tác vụ được thực thi. Cơ chế này hữu ích khi cần thông báo cho một dịch vụ bên ngoài, chẳng hạn [Envoyer](https://envoyer.io), rằng tác vụ đã lập lịch đang bắt đầu hoặc đã thực thi xong:

```php
Schedule::command('emails:send')
    ->daily()
    ->pingBefore($url)
    ->thenPing($url);
```

Các phương thức `pingOnSuccess` và `pingOnFailure` có thể được dùng để chỉ gửi ping đến URL đã chỉ định khi tác vụ tương ứng thành công hoặc thất bại. Tác vụ được xem là thất bại khi lệnh Artisan hoặc lệnh hệ thống đã lập lịch kết thúc với exit code khác `0`:

```php
Schedule::command('emails:send')
    ->daily()
    ->pingOnSuccess($successUrl)
    ->pingOnFailure($failureUrl);
```

Các phương thức `pingBeforeIf`, `thenPingIf`, `pingOnSuccessIf` và `pingOnFailureIf` cho phép chỉ gửi ping đến URL đã chỉ định khi điều kiện được cung cấp có giá trị `true`:

```php
Schedule::command('emails:send')
    ->daily()
    ->pingBeforeIf($condition, $url)
    ->thenPingIf($condition, $url);

Schedule::command('emails:send')
    ->daily()
    ->pingOnSuccessIf($condition, $successUrl)
    ->pingOnFailureIf($condition, $failureUrl);
```

<a name="events"></a>
## Sự kiện

Laravel dispatch nhiều [sự kiện](/docs/{{version}}/events) trong quá trình lập lịch. Bạn có thể [định nghĩa listener](/docs/{{version}}/events) cho bất kỳ sự kiện nào sau đây:

<div class="overflow-auto">

| Tên sự kiện                                                 |
| ----------------------------------------------------------- |
| `Illuminate\Console\Events\ScheduledTaskStarting`           |
| `Illuminate\Console\Events\ScheduledTaskFinished`           |
| `Illuminate\Console\Events\ScheduledBackgroundTaskFinished` |
| `Illuminate\Console\Events\ScheduledTaskSkipped`            |
| `Illuminate\Console\Events\ScheduledTaskFailed`             |

</div>

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/scheduling). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
