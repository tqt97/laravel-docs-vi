# Process

<a name="introduction"></a>
## Giới thiệu

Laravel cung cấp một API tối giản nhưng giàu khả năng biểu đạt trên [Symfony Process component](https://symfony.com/doc/current/components/process.html), cho phép bạn thuận tiện gọi các process bên ngoài từ ứng dụng Laravel. Các tính năng process của Laravel tập trung vào những use case phổ biến nhất và mang lại trải nghiệm phát triển thuận tiện.

<a name="invoking-processes"></a>
## Gọi process

Để gọi một process, bạn có thể dùng các method `run` và `start` do facade `Process` cung cấp. Method `run` sẽ gọi process và chờ process thực thi xong, còn `start` dùng để thực thi process bất đồng bộ. Tài liệu này sẽ trình bày cả hai cách. Trước tiên, hãy xem cách gọi một process đồng bộ cơ bản và kiểm tra kết quả của nó:

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

return $result->output();
```

Instance `Illuminate\Contracts\Process\ProcessResult` do method `run` trả về cung cấp nhiều method hữu ích để kiểm tra kết quả của process:

```php
$result = Process::run('ls -la');

$result->command();
$result->successful();
$result->failed();
$result->output();
$result->errorOutput();
$result->exitCode();
```

<a name="throwing-exceptions"></a>
#### Ném exception

Nếu đã có kết quả process và muốn ném một instance `Illuminate\Process\Exceptions\ProcessFailedException` khi exit code lớn hơn `0` (nghĩa là process thất bại), bạn có thể dùng các method `throw` và `throwIf`. Nếu process không thất bại, instance `ProcessResult` sẽ được trả về:

```php
$result = Process::run('ls -la')->throw();

$result = Process::run('ls -la')->throwIf($condition);
```

<a name="process-options"></a>
### Tùy chọn process

Bạn có thể cần tùy biến hành vi của process trước khi gọi nó. Laravel cho phép điều chỉnh nhiều đặc tính của process như working directory, timeout và biến môi trường.

<a name="working-directory-path"></a>
#### Đường dẫn working directory

Bạn có thể dùng method `path` để chỉ định working directory của process. Nếu không gọi method này, process sẽ kế thừa working directory của PHP script đang thực thi:

```php
$result = Process::path(__DIR__)->run('ls -la');
```

<a name="input"></a>
#### Input

Bạn có thể cung cấp input thông qua "standard input" của process bằng method `input`:

```php
$result = Process::input('Hello World')->run('cat');
```

<a name="timeouts"></a>
#### Timeout

Mặc định, process sẽ ném một instance `Illuminate\Process\Exceptions\ProcessTimedOutException` nếu thực thi quá 60 giây. Bạn có thể tùy biến hành vi này bằng method `timeout`:

```php
$result = Process::timeout(120)->run('bash import.sh');
```

Các method `timeout` và `idleTimeout` cũng chấp nhận instance `CarbonInterval`:

```php
use function Illuminate\Support\minutes;

$result = Process::timeout(minutes(2))->run('bash import.sh');
```

Hoặc, nếu muốn vô hiệu hóa hoàn toàn timeout của process, bạn có thể gọi method `forever`:

```php
$result = Process::forever()->run('bash import.sh');
```

Method `idleTimeout` có thể dùng để chỉ định số giây tối đa process được phép chạy mà không trả về bất kỳ output nào:

```php
$result = Process::timeout(60)->idleTimeout(30)->run('bash import.sh');
```

<a name="environment-variables"></a>
#### Biến môi trường

Có thể truyền biến môi trường cho process qua method `env`. Process được gọi cũng sẽ kế thừa toàn bộ biến môi trường được định nghĩa trong hệ thống:

```php
$result = Process::forever()
    ->env(['IMPORT_PATH' => __DIR__])
    ->run('bash import.sh');
```

Nếu muốn loại bỏ một biến môi trường được kế thừa khỏi process được gọi, hãy truyền biến môi trường đó với giá trị `false`:

```php
$result = Process::forever()
    ->env(['LOAD_PATH' => false])
    ->run('bash import.sh');
```

<a name="tty-mode"></a>
#### Chế độ TTY

Method `tty` có thể dùng để bật chế độ TTY cho process. Chế độ TTY kết nối input và output của process với input và output của chương trình, nhờ đó process có thể mở editor như Vim hoặc Nano:

```php
Process::forever()->tty()->run('vim');
```

> [!WARNING]
> Chế độ TTY không được hỗ trợ trên Windows.

<a name="process-output"></a>
### Đầu ra của process

Như đã đề cập, có thể truy cập output của process bằng các method `output` (stdout) và `errorOutput` (stderr) trên kết quả process:

```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');

echo $result->output();
echo $result->errorOutput();
```

Bạn cũng có thể thu thập output theo thời gian thực bằng cách truyền một closure làm argument thứ hai cho method `run`. Closure nhận hai argument: "loại" output (`stdout` hoặc `stderr`) và chính chuỗi output:

```php
$result = Process::run('ls -la', function (string $type, string $output) {
    echo $output;
});
```

Laravel cũng cung cấp các method `seeInOutput` và `seeInErrorOutput`, giúp kiểm tra thuận tiện xem một chuỗi nhất định có xuất hiện trong output của process hay không:

```php
if (Process::run('ls -la')->seeInOutput('laravel')) {
    // ...
}
```

<a name="disabling-process-output"></a>
#### Vô hiệu hóa output của process

Nếu process tạo ra lượng output lớn mà bạn không cần sử dụng, có thể tiết kiệm bộ nhớ bằng cách vô hiệu hóa hoàn toàn việc thu thập output. Để thực hiện, gọi method `quietly` khi xây dựng process:

```php
use Illuminate\Support\Facades\Process;

$result = Process::quietly()->run('bash import.sh');
```

<a name="process-pipelines"></a>
### Pipeline

Đôi khi bạn muốn dùng output của một process làm input cho process khác. Cách này thường được gọi là "pipe" output của process này sang process khác. Method `pipe` do facade `Process` cung cấp giúp thực hiện việc này dễ dàng. `pipe` sẽ thực thi đồng bộ các process trong pipeline và trả về kết quả của process cuối cùng:

```php
use Illuminate\Process\Pipe;
use Illuminate\Support\Facades\Process;

$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
});

if ($result->successful()) {
    // ...
}
```

Nếu không cần tùy biến từng process trong pipeline, bạn chỉ cần truyền một mảng command string cho method `pipe`:

```php
$result = Process::pipe([
    'cat example.txt',
    'grep -i "laravel"',
]);
```

Có thể thu thập output của process theo thời gian thực bằng cách truyền một closure làm argument thứ hai cho method `pipe`. Closure nhận hai argument: "loại" output (`stdout` hoặc `stderr`) và chuỗi output:

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->command('cat example.txt');
    $pipe->command('grep -i "laravel"');
}, function (string $type, string $output) {
    echo $output;
});
```

Laravel cũng cho phép gán string key cho từng process trong pipeline thông qua method `as`. Key này cũng được truyền vào output closure của method `pipe`, nhờ đó bạn có thể xác định output thuộc process nào:

```php
$result = Process::pipe(function (Pipe $pipe) {
    $pipe->as('first')->command('cat example.txt');
    $pipe->as('second')->command('grep -i "laravel"');
}, function (string $type, string $output, string $key) {
    // ...
});
```

<a name="asynchronous-processes"></a>
## Process bất đồng bộ

Trong khi method `run` gọi process theo cách đồng bộ, method `start` có thể dùng để gọi process bất đồng bộ. Điều này cho phép ứng dụng tiếp tục thực hiện công việc khác trong lúc process chạy nền. Sau khi gọi process, bạn có thể dùng method `running` để xác định process còn đang chạy hay không:

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    // ...
}

$result = $process->wait();
```

Bạn có thể gọi method `wait` để chờ đến khi process thực thi xong và lấy instance `ProcessResult`:

```php
$process = Process::timeout(120)->start('bash import.sh');

// ...

$result = $process->wait();
```

<a name="process-ids-and-signals"></a>
### Process ID và signal

Method `id` có thể dùng để lấy process ID do hệ điều hành cấp cho process đang chạy:

```php
$process = Process::start('bash import.sh');

return $process->id();
```

Bạn có thể dùng method `signal` để gửi một "signal" tới process đang chạy. Danh sách các hằng signal được định nghĩa sẵn có trong [tài liệu PHP](https://www.php.net/manual/en/pcntl.constants.php):

```php
$process->signal(SIGUSR2);
```

<a name="asynchronous-process-output"></a>
### Đầu ra của process bất đồng bộ

Khi một process bất đồng bộ đang chạy, bạn có thể truy cập toàn bộ output hiện tại bằng các method `output` và `errorOutput`. Tuy nhiên, `latestOutput` và `latestErrorOutput` cho phép chỉ lấy phần output phát sinh kể từ lần lấy output gần nhất:

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    echo $process->latestOutput();
    echo $process->latestErrorOutput();

    sleep(1);
}
```

Tương tự method `run`, output của process bất đồng bộ cũng có thể được thu thập theo thời gian thực bằng cách truyền một closure làm argument thứ hai cho method `start`. Closure nhận hai argument: "loại" output (`stdout` hoặc `stderr`) và chuỗi output:

```php
$process = Process::start('bash import.sh', function (string $type, string $output) {
    echo $output;
});

$result = $process->wait();
```

Thay vì chờ process chạy xong, bạn có thể dùng method `waitUntil` để dừng chờ dựa trên output của process. Laravel sẽ ngừng chờ process hoàn tất khi closure truyền cho `waitUntil` trả về `true`:

```php
$process = Process::start('bash import.sh');

$process->waitUntil(function (string $type, string $output) {
    return $output === 'Ready...';
});
```

<a name="asynchronous-process-timeouts"></a>
### Timeout của process bất đồng bộ

Khi process bất đồng bộ đang chạy, bạn có thể dùng method `ensureNotTimedOut` để kiểm tra process chưa bị timeout. Method này sẽ ném [timeout exception](#timeouts) nếu process đã quá thời gian cho phép:

```php
$process = Process::timeout(120)->start('bash import.sh');

while ($process->running()) {
    $process->ensureNotTimedOut();

    // ...

    sleep(1);
}
```

<a name="concurrent-processes"></a>
## Process đồng thời

Laravel cũng giúp việc quản lý một pool gồm nhiều process bất đồng bộ chạy đồng thời trở nên đơn giản, cho phép thực thi nhiều tác vụ cùng lúc. Để bắt đầu, gọi method `pool`; method này nhận một closure, và closure nhận instance `Illuminate\Process\Pool`.

Trong closure này, bạn có thể định nghĩa các process thuộc pool. Sau khi process pool được khởi động bằng method `start`, có thể truy cập [collection](/collections) chứa các process đang chạy thông qua method `running`:

```php
use Illuminate\Process\Pool;
use Illuminate\Support\Facades\Process;

$pool = Process::pool(function (Pool $pool) {
    $pool->path(__DIR__)->command('bash import-1.sh');
    $pool->path(__DIR__)->command('bash import-2.sh');
    $pool->path(__DIR__)->command('bash import-3.sh');
})->start(function (string $type, string $output, int $key) {
    // ...
});

while ($pool->running()->isNotEmpty()) {
    // ...
}

$results = $pool->wait();
```

Bạn có thể chờ toàn bộ process trong pool thực thi xong và lấy kết quả của chúng bằng method `wait`. Method `wait` trả về một object có thể truy cập như mảng, cho phép lấy instance `ProcessResult` của từng process trong pool theo key:

```php
$results = $pool->wait();

echo $results[0]->output();
```

Hoặc, để thuận tiện, có thể dùng method `concurrently` để khởi động một process pool bất đồng bộ và ngay lập tức chờ kết quả. Cách viết này đặc biệt rõ ràng khi kết hợp với khả năng array destructuring của PHP:

```php
[$first, $second, $third] = Process::concurrently(function (Pool $pool) {
    $pool->path(__DIR__)->command('ls -la');
    $pool->path(app_path())->command('ls -la');
    $pool->path(storage_path())->command('ls -la');
});

echo $first->output();
```

<a name="naming-pool-processes"></a>
### Đặt tên process trong pool

Truy cập kết quả process pool bằng numeric key không thực sự dễ đọc; vì vậy Laravel cho phép gán string key cho từng process trong pool thông qua method `as`. Key này cũng được truyền vào closure của method `start`, giúp xác định output thuộc process nào:

```php
$pool = Process::pool(function (Pool $pool) {
    $pool->as('first')->command('bash import-1.sh');
    $pool->as('second')->command('bash import-2.sh');
    $pool->as('third')->command('bash import-3.sh');
})->start(function (string $type, string $output, string $key) {
    // ...
});

$results = $pool->wait();

return $results['first']->output();
```

<a name="pool-process-ids-and-signals"></a>
### Process ID và signal trong pool

Vì method `running` của process pool cung cấp collection của toàn bộ process đã được gọi trong pool, bạn có thể dễ dàng truy cập process ID tương ứng:

```php
$processIds = $pool->running()->each->id();
```

Ngoài ra, bạn có thể gọi method `signal` trên process pool để gửi signal tới mọi process trong pool:

```php
$pool->signal(SIGUSR2);
```

<a name="testing"></a>
## Testing

Nhiều service của Laravel cung cấp tính năng giúp viết test dễ dàng và rõ ràng, và process service cũng vậy. Method `fake` của facade `Process` cho phép yêu cầu Laravel trả về kết quả stub / giả lập khi process được gọi.

<a name="faking-processes"></a>
### Fake process

Để tìm hiểu khả năng fake process của Laravel, hãy giả sử có một route gọi process:

```php
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    Process::run('bash import.sh');

    return 'Import complete!';
});
```

Khi test route này, ta có thể yêu cầu Laravel trả về một kết quả process giả lập thành công cho mọi process được gọi bằng cách gọi method `fake` trên facade `Process` mà không truyền argument. Ngoài ra, ta còn có thể [assert](#available-assertions) rằng một process cụ thể đã được "chạy":

```php tab=Pest
<?php

use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\Process;

test('process is invoked', function () {
    Process::fake();

    $response = $this->get('/import');

    // Simple process assertion...
    Process::assertRan('bash import.sh');

    // Or, inspecting the process configuration...
    Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
        return $process->command === 'bash import.sh' &&
               $process->timeout === 60;
    });
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_process_is_invoked(): void
    {
        Process::fake();

        $response = $this->get('/import');

        // Simple process assertion...
        Process::assertRan('bash import.sh');

        // Or, inspecting the process configuration...
        Process::assertRan(function (PendingProcess $process, ProcessResult $result) {
            return $process->command === 'bash import.sh' &&
                   $process->timeout === 60;
        });
    }
}
```

Như đã đề cập, gọi method `fake` trên facade `Process` sẽ yêu cầu Laravel luôn trả về kết quả process thành công và không có output. Tuy nhiên, bạn có thể dễ dàng chỉ định output và exit code cho process giả lập bằng method `result` của facade `Process`:

```php
Process::fake([
    '*' => Process::result(
        output: 'Test output',
        errorOutput: 'Test error output',
        exitCode: 1,
    ),
]);
```

<a name="faking-specific-processes"></a>
### Fake process cụ thể

Như ví dụ trước, facade `Process` cho phép chỉ định kết quả giả lập khác nhau cho từng process bằng cách truyền một mảng vào method `fake`.

Key của mảng biểu diễn các command pattern bạn muốn fake, còn value là kết quả tương ứng. Ký tự `*` có thể dùng làm wildcard. Bất kỳ process command nào chưa được fake sẽ thực sự được gọi. Bạn có thể dùng method `result` của facade `Process` để tạo kết quả stub / giả lập cho các command này:

```php
Process::fake([
    'cat *' => Process::result(
        output: 'Test "cat" output',
    ),
    'ls *' => Process::result(
        output: 'Test "ls" output',
    ),
]);
```

Nếu không cần tùy biến exit code hoặc error output của process giả lập, bạn có thể khai báo kết quả giả lập trực tiếp dưới dạng string:

```php
Process::fake([
    'cat *' => 'Test "cat" output',
    'ls *' => 'Test "ls" output',
]);
```

<a name="faking-process-sequences"></a>
### Fake chuỗi process

Nếu code đang test gọi nhiều process với cùng một command, bạn có thể muốn gán kết quả giả lập khác nhau cho từng lần gọi. Có thể thực hiện bằng method `sequence` của facade `Process`:

```php
Process::fake([
    'ls *' => Process::sequence()
        ->push(Process::result('First invocation'))
        ->push(Process::result('Second invocation')),
]);
```

<a name="faking-asynchronous-process-lifecycles"></a>
### Fake vòng đời process bất đồng bộ

Cho đến đây, chúng ta chủ yếu đề cập đến việc fake các process được gọi đồng bộ bằng method `run`. Tuy nhiên, khi test code tương tác với process bất đồng bộ được gọi qua `start`, bạn có thể cần cách mô tả process giả lập chi tiết hơn.

Ví dụ, hãy xem route sau tương tác với một process bất đồng bộ:

```php
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/import', function () {
    $process = Process::start('bash import.sh');

    while ($process->running()) {
        Log::info($process->latestOutput());
        Log::info($process->latestErrorOutput());
    }

    return 'Done';
});
```

Để fake chính xác process này, cần mô tả số lần method `running` phải trả về `true`. Ngoài ra, ta có thể muốn chỉ định nhiều dòng output được trả về theo thứ tự. Để làm điều đó, có thể dùng method `describe` của facade `Process`:

```php
Process::fake([
    'bash import.sh' => Process::describe()
        ->output('First line of standard output')
        ->errorOutput('First line of error output')
        ->output('Second line of standard output')
        ->exitCode(0)
        ->iterations(3),
]);
```

Xét kỹ ví dụ trên: các method `output` và `errorOutput` cho phép chỉ định nhiều dòng output được trả về theo thứ tự. Method `exitCode` dùng để chỉ định exit code cuối cùng của process giả lập. Cuối cùng, method `iterations` chỉ định số lần `running` sẽ trả về `true`.

<a name="available-assertions"></a>
### Các assertion có sẵn

Như [đã đề cập](#faking-processes), Laravel cung cấp nhiều process assertion cho feature test. Các assertion này được trình bày bên dưới.

<a name="assert-process-ran"></a>
#### assertRan

Assert rằng một process cụ thể đã được gọi:

```php
use Illuminate\Support\Facades\Process;

Process::assertRan('ls -la');
```

Khi process được gọi bằng một mảng argument, bạn có thể truyền chính mảng đó vào assertion:

```php
Process::assertRan(['php', 'artisan', 'migrate']);
```

Các method `assertRanTimes` và `assertDidntRun` cũng chấp nhận command dạng mảng.

Method `assertRan` cũng chấp nhận một closure. Closure nhận instance của process và kết quả process, cho phép kiểm tra các option đã cấu hình. Nếu closure trả về `true`, assertion sẽ "pass":

```php
Process::assertRan(fn ($process, $result) =>
    $process->command === 'ls -la' &&
    $process->path === __DIR__ &&
    $process->timeout === 60
);
```

`$process` được truyền vào closure của `assertRan` là instance `Illuminate\Process\PendingProcess`, còn `$result` là instance `Illuminate\Contracts\Process\ProcessResult`.

<a name="assert-process-didnt-run"></a>
#### assertDidntRun

Assert rằng một process cụ thể không được gọi:

```php
use Illuminate\Support\Facades\Process;

Process::assertDidntRun('ls -la');
```

Tương tự `assertRan`, method `assertDidntRun` cũng chấp nhận một closure nhận instance process và kết quả process, cho phép kiểm tra các option đã cấu hình. Nếu closure trả về `true`, assertion sẽ "fail":

```php
Process::assertDidntRun(fn (PendingProcess $process, ProcessResult $result) =>
    $process->command === 'ls -la'
);
```

<a name="assert-process-ran-times"></a>
#### assertRanTimes

Assert rằng một process cụ thể đã được gọi đúng số lần chỉ định:

```php
use Illuminate\Support\Facades\Process;

Process::assertRanTimes('ls -la', times: 3);
```

Method `assertRanTimes` cũng chấp nhận một closure nhận instance `PendingProcess` và `ProcessResult`, cho phép kiểm tra các option đã cấu hình. Nếu closure trả về `true` và process được gọi đúng số lần chỉ định, assertion sẽ "pass":

```php
Process::assertRanTimes(function (PendingProcess $process, ProcessResult $result) {
    return $process->command === 'ls -la';
}, times: 3);
```

<a name="assert-processes-ran-in-order"></a>
#### assertRanInOrder

Assert rằng các process được gọi theo đúng thứ tự chỉ định:

```php
Process::assertRanInOrder([
    'git fetch',
    'composer install',
]);
```

Method `assertRanInOrder` chấp nhận command string, mảng command argument hoặc closure tương tự các process assertion khác.

<a name="preventing-stray-processes"></a>
### Ngăn process ngoài dự kiến

Nếu muốn bảo đảm mọi process được gọi trong một test hoặc toàn bộ test suite đều đã được fake, bạn có thể gọi method `preventStrayProcesses`. Sau khi gọi method này, bất kỳ process nào không có kết quả fake tương ứng sẽ ném exception thay vì khởi động process thật:

```php
use Illuminate\Support\Facades\Process;

Process::preventStrayProcesses();

Process::fake([
    'ls *' => 'Test output...',
]);

// Fake response is returned...
Process::run('ls -la');

// An exception is thrown...
Process::run('bash import.sh');
```
