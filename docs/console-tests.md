# Kiểm thử Console

<a name="introduction"></a>
## Giới thiệu

Bên cạnh việc đơn giản hóa HTTP testing, Laravel còn cung cấp một API gọn gàng để kiểm thử các [console command tùy chỉnh](/docs/{{version}}/artisan) của ứng dụng.

<a name="success-failure-expectations"></a>
## Kỳ vọng thành công / thất bại

Trước tiên, hãy xem cách assert exit code của một Artisan command. Ta dùng method `artisan` để gọi command trong test, sau đó dùng `assertExitCode` để xác nhận command kết thúc với exit code mong muốn:

```php tab=Pest
test('console command', function () {
    $this->artisan('inspire')->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('inspire')->assertExitCode(0);
}
```

Bạn có thể dùng `assertNotExitCode` để xác nhận command không kết thúc bằng một exit code cụ thể:

```php
$this->artisan('inspire')->assertNotExitCode(1);
```

Thông thường, command trong terminal trả status code `0` khi thành công và giá trị khác `0` khi thất bại. Vì vậy Laravel cung cấp hai assertion tiện dụng `assertSuccessful` và `assertFailed` để kiểm tra command thành công hay thất bại:

```php
$this->artisan('inspire')->assertSuccessful();

$this->artisan('inspire')->assertFailed();
```

<a name="input-output-expectations"></a>
## Kỳ vọng đầu vào / đầu ra

Laravel cho phép "mock" đầu vào của người dùng cho console command bằng method `expectsQuestion`. Bạn cũng có thể chỉ định exit code và nội dung đầu ra mong đợi thông qua `assertExitCode` và `expectsOutput`. Ví dụ với command sau:

```php
Artisan::command('question', function () {
    $name = $this->ask('What is your name?');

    $language = $this->choice('Which language do you prefer?', [
        'PHP',
        'Ruby',
        'Python',
    ]);

    $this->line('Your name is '.$name.' and you prefer '.$language.'.');
});
```

Bạn có thể kiểm thử command này như sau:

```php tab=Pest
test('console command', function () {
    $this->artisan('question')
        ->expectsQuestion('What is your name?', 'Taylor Otwell')
        ->expectsQuestion('Which language do you prefer?', 'PHP')
        ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
        ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('question')
        ->expectsQuestion('What is your name?', 'Taylor Otwell')
        ->expectsQuestion('Which language do you prefer?', 'PHP')
        ->expectsOutput('Your name is Taylor Otwell and you prefer PHP.')
        ->doesntExpectOutput('Your name is Taylor Otwell and you prefer Ruby.')
        ->assertExitCode(0);
}
```

Nếu đang sử dụng function `search` hoặc `multisearch` của [Laravel Prompts](/docs/{{version}}/prompts), bạn có thể dùng assertion `expectsSearch` để mock đầu vào của người dùng, kết quả tìm kiếm và lựa chọn cuối cùng:

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->expectsSearch('What is your name?', search: 'Tay', answers: [
            'Taylor Otwell',
            'Taylor Swift',
            'Darian Taylor'
        ], answer: 'Taylor Otwell')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('example')
        ->expectsSearch('What is your name?', search: 'Tay', answers: [
            'Taylor Otwell',
            'Taylor Swift',
            'Darian Taylor'
        ], answer: 'Taylor Otwell')
        ->assertExitCode(0);
}
```

Bạn cũng có thể dùng `doesntExpectOutput` để xác nhận console command không tạo bất kỳ đầu ra nào:

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->doesntExpectOutput()
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('example')
        ->doesntExpectOutput()
        ->assertExitCode(0);
}
```

Các method `expectsOutputToContain` và `doesntExpectOutputToContain` dùng để assert một phần nội dung đầu ra:

```php tab=Pest
test('console command', function () {
    $this->artisan('example')
        ->expectsOutputToContain('Taylor')
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
/**
 * Test a console command.
 */
public function test_console_command(): void
{
    $this->artisan('example')
        ->expectsOutputToContain('Taylor')
        ->assertExitCode(0);
}
```

<a name="confirmation-expectations"></a>
#### Kỳ vọng xác nhận

Khi command yêu cầu người dùng xác nhận bằng câu trả lời "yes" hoặc "no", bạn có thể dùng method `expectsConfirmation`:

```php
$this->artisan('module:import')
    ->expectsConfirmation('Do you really wish to run this command?', 'no')
    ->assertExitCode(1);
```

<a name="table-expectations"></a>
#### Kỳ vọng đối với bảng

Nếu command hiển thị dữ liệu dạng bảng bằng method `table` của Artisan, việc viết expectation cho toàn bộ output của bảng sẽ khá rườm rà. Thay vào đó, hãy dùng `expectsTable`. Method này nhận header của bảng ở tham số đầu tiên và dữ liệu bảng ở tham số thứ hai:

```php
$this->artisan('users:all')
    ->expectsTable([
        'ID',
        'Email',
    ], [
        [1, 'taylor@example.com'],
        [2, 'abigail@example.com'],
    ]);
```

<a name="console-events"></a>
## Sự kiện Console

Mặc định, các event `Illuminate\Console\Events\CommandStarting` và `Illuminate\Console\Events\CommandFinished` không được dispatch khi chạy test của ứng dụng. Nếu cần các event này trong một test class, hãy thêm trait `Illuminate\Foundation\Testing\WithConsoleEvents`:

```php tab=Pest
<?php

use Illuminate\Foundation\Testing\WithConsoleEvents;

pest()->use(WithConsoleEvents::class);

// ...
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\WithConsoleEvents;
use Tests\TestCase;

class ConsoleEventTest extends TestCase
{
    use WithConsoleEvents;

    // ...
}
```
