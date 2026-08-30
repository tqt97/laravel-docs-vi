# Artisan Console

<a name="introduction"></a>
## Giới thiệu

Artisan là command-line interface đi kèm Laravel. Artisan nằm ở thư mục gốc của ứng dụng dưới dạng script `artisan` và cung cấp nhiều command hữu ích hỗ trợ bạn trong quá trình xây dựng ứng dụng. Để xem danh sách tất cả Artisan command hiện có, bạn có thể sử dụng command `list`:

```shell
php artisan list
```

Mỗi command cũng có màn hình "help" hiển thị và mô tả các argument và option hiện có của command. Để xem màn hình trợ giúp, hãy đặt `help` trước tên command:

```shell
php artisan help migrate
```

<a name="laravel-sail"></a>
#### Laravel Sail

Nếu bạn sử dụng [Laravel Sail](/sail) làm môi trường phát triển local, hãy nhớ dùng command line `sail` để gọi Artisan command. Sail sẽ thực thi Artisan command bên trong các Docker container của ứng dụng:

```shell
./vendor/bin/sail artisan list
```

<a name="tinker"></a>
### Tinker (REPL)

[Laravel Tinker](https://github.com/laravel/tinker) là một REPL mạnh mẽ cho Laravel framework, được xây dựng trên package [PsySH](https://github.com/bobthecow/psysh).

<a name="installation"></a>
#### Cài đặt

Mọi ứng dụng Laravel đều bao gồm Tinker theo mặc định. Tuy nhiên, nếu trước đó đã gỡ Tinker khỏi ứng dụng, bạn có thể cài lại bằng Composer:

```shell
composer require laravel/tinker
```

> [!NOTE]
> Bạn đang tìm hot reloading, chỉnh sửa code nhiều dòng và tự động hoàn thành khi tương tác với ứng dụng Laravel? Hãy xem [Tinkerwell](https://tinkerwell.app)!

<a name="usage"></a>
#### Cách sử dụng

Tinker cho phép bạn tương tác với toàn bộ ứng dụng Laravel qua command line, bao gồm Eloquent model, job, event và nhiều thành phần khác. Để vào môi trường Tinker, hãy chạy Artisan command `tinker`:

```shell
php artisan tinker
```

Bạn có thể publish file cấu hình của Tinker bằng command `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"
```

> [!WARNING]
> Helper function `dispatch` và method `dispatch` trên class `Dispatchable` phụ thuộc vào garbage collection để đưa job vào queue. Vì vậy, khi sử dụng Tinker, bạn nên dùng `Bus::dispatch` hoặc `Queue::push` để dispatch job.

<a name="command-allow-list"></a>
#### Danh sách command được phép

Tinker sử dụng một danh sách "allow" để xác định Artisan command nào được phép chạy trong shell. Mặc định, bạn có thể chạy các command `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `migrate:install`, `up`, và `optimize`. Nếu muốn cho phép thêm command, hãy thêm chúng vào array `commands` trong file cấu hình `tinker.php`:

```php
'commands' => [
    // App\Console\Commands\ExampleCommand::class,
],
```

<a name="classes-that-should-not-be-aliased"></a>
#### Các class không nên được alias

Thông thường, Tinker tự động alias các class khi bạn tương tác với chúng. Tuy nhiên, có thể bạn muốn một số class không bao giờ được alias. Bạn có thể thực hiện điều này bằng cách liệt kê các class trong array `dont_alias` của file cấu hình `tinker.php`:

```php
'dont_alias' => [
    App\Models\User::class,
],
```

<a name="writing-commands"></a>
## Viết command

Ngoài các command do Artisan cung cấp, bạn có thể xây dựng command tùy chỉnh của riêng mình. Command thường được lưu trong thư mục `app/Console/Commands`; tuy nhiên, bạn có thể chọn vị trí lưu trữ khác miễn là hướng dẫn Laravel [scan các thư mục khác để tìm Artisan command](#registering-commands).

<a name="generating-commands"></a>
### Tạo command

Để tạo command mới, bạn có thể sử dụng Artisan command `make:command`. Command này sẽ tạo một command class mới trong thư mục `app/Console/Commands`. Đừng lo nếu thư mục này chưa tồn tại trong ứng dụng — nó sẽ được tạo trong lần đầu bạn chạy Artisan command `make:command`:

```shell
php artisan make:command SendEmails
```

<a name="command-structure"></a>
### Cấu trúc command

Sau khi tạo command, bạn nên định nghĩa signature và description của command bằng các attribute `Signature` và `Description`. Attribute `Signature` cũng cho phép bạn định nghĩa [input mà command mong đợi](#defining-input-expectations). Method `handle` sẽ được gọi khi command được thực thi. Bạn có thể đặt logic của command trong method này.

Hãy xem một command ví dụ. Lưu ý rằng chúng ta có thể yêu cầu mọi dependency cần thiết thông qua method `handle` của command. [Service container](/container) của Laravel sẽ tự động inject tất cả dependency được type-hint trong signature của method này:

```php
<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\DripEmailer;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('mail:send {user}')]
#[Description('Send a marketing email to a user')]
class SendEmails extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(DripEmailer $drip): void
    {
        $drip->send(User::find($this->argument('user')));
    }
}
```

> [!NOTE]
> Để tái sử dụng code tốt hơn, bạn nên giữ console command gọn nhẹ và giao phần xử lý cho các application service. Trong ví dụ trên, hãy lưu ý rằng chúng ta inject một service class để thực hiện phần xử lý chính của việc gửi email.

<a name="exit-codes"></a>
#### Exit code

Nếu method `handle` không trả về gì và command thực thi thành công, command sẽ kết thúc với exit code `0`, biểu thị thành công. Tuy nhiên, method `handle` có thể tùy chọn trả về một số nguyên để chỉ định thủ công exit code của command:

```php
$this->error('Something went wrong.');

return 1;
```

Nếu muốn command "fail" từ bất kỳ method nào bên trong command, bạn có thể sử dụng method `fail`. Method `fail` sẽ lập tức kết thúc việc thực thi command và trả về exit code `1`:

```php
$this->fail('Something went wrong.');
```

<a name="closure-commands"></a>
### Closure command

Command dựa trên closure là một lựa chọn thay thế cho việc định nghĩa console command dưới dạng class. Tương tự như route closure là lựa chọn thay thế cho controller, bạn có thể xem command closure là lựa chọn thay thế cho command class.

Mặc dù file `routes/console.php` không định nghĩa HTTP route, nó định nghĩa các entry point (route) dựa trên console vào ứng dụng. Trong file này, bạn có thể định nghĩa tất cả console command dựa trên closure bằng method `Artisan::command`. Method `command` nhận hai đối số: [command signature](#defining-input-expectations) và một closure nhận các argument và option của command:

```php
Artisan::command('mail:send {user}', function (string $user) {
    $this->info("Sending email to: {$user}!");
});
```

Closure được bind vào command instance bên dưới, vì vậy bạn có toàn quyền truy cập tất cả helper method mà thông thường có thể dùng trên một command class đầy đủ.

<a name="type-hinting-dependencies"></a>
#### Type-hint dependency

Ngoài việc nhận argument và option của command, command closure cũng có thể type-hint các dependency bổ sung mà bạn muốn resolve từ [service container](/container):

```php
use App\Models\User;
use App\Support\DripEmailer;
use Illuminate\Support\Facades\Artisan;

Artisan::command('mail:send {user}', function (DripEmailer $drip, string $user) {
    $drip->send(User::find($user));
});
```

<a name="closure-command-descriptions"></a>
#### Mô tả closure command

Khi định nghĩa command dựa trên closure, bạn có thể dùng method `purpose` để thêm mô tả cho command. Mô tả này sẽ được hiển thị khi chạy các command `php artisan list` hoặc `php artisan help`:

```php
Artisan::command('mail:send {user}', function (string $user) {
    // ...
})->purpose('Send a marketing email to a user');
```

<a name="isolatable-commands"></a>
### Command có thể cô lập

> [!WARNING]
> Để sử dụng tính năng này, ứng dụng phải dùng cache driver `memcached`, `redis`, `dynamodb`, `database`, `file`, hoặc `array` làm cache driver mặc định. Ngoài ra, tất cả server phải giao tiếp với cùng một cache server trung tâm.

Đôi khi bạn muốn đảm bảo chỉ một instance của command có thể chạy tại một thời điểm. Để làm điều này, bạn có thể implement interface `Illuminate\Contracts\Console\Isolatable` trên command class:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\Isolatable;

class SendEmails extends Command implements Isolatable
{
    // ...
}
```

Khi đánh dấu một command là `Isolatable`, Laravel tự động cung cấp option `--isolated` cho command mà không cần bạn định nghĩa rõ option này. Khi command được gọi với option đó, Laravel sẽ đảm bảo không có instance nào khác của command đang chạy. Laravel thực hiện điều này bằng cách cố gắng lấy atomic lock thông qua cache driver mặc định của ứng dụng. Nếu có instance khác đang chạy, command sẽ không được thực thi; tuy nhiên, command vẫn kết thúc với exit status code thành công:

```shell
php artisan mail:send 1 --isolated
```

Nếu muốn chỉ định exit status code mà command nên trả về khi không thể thực thi, bạn có thể cung cấp status code mong muốn thông qua option `isolated`:

```shell
php artisan mail:send 1 --isolated=12
```

<a name="lock-id"></a>
#### Lock ID

Mặc định, Laravel dùng tên command để tạo string key dùng khi lấy atomic lock trong cache của ứng dụng. Tuy nhiên, bạn có thể tùy chỉnh key này bằng cách định nghĩa method `isolatableId` trên Artisan command class, cho phép đưa argument hoặc option của command vào key:

```php
/**
 * Get the isolatable ID for the command.
 */
public function isolatableId(): string
{
    return $this->argument('user');
}
```

<a name="lock-expiration-time"></a>
#### Thời gian hết hạn lock

Mặc định, isolation lock hết hạn sau khi command hoàn tất. Hoặc nếu command bị gián đoạn và không thể hoàn tất, lock sẽ hết hạn sau một giờ. Tuy nhiên, bạn có thể điều chỉnh thời gian hết hạn bằng cách định nghĩa method `isolationLockExpiresAt` trên command:

```php
use DateTimeInterface;
use DateInterval;

/**
 * Determine when an isolation lock expires for the command.
 */
public function isolationLockExpiresAt(): DateTimeInterface|DateInterval
{
    return now()->plus(minutes: 5);
}
```

<a name="defining-input-expectations"></a>
## Định nghĩa input mong đợi

Khi viết console command, việc thu thập input từ người dùng thông qua argument hoặc option là rất phổ biến. Laravel giúp bạn định nghĩa input mong đợi từ người dùng một cách thuận tiện bằng property `signature` trên command. Property `signature` cho phép định nghĩa tên, argument và option của command trong một cú pháp duy nhất, rõ ràng và tương tự route.

<a name="arguments"></a>
### Argument

Tất cả argument và option do người dùng cung cấp được đặt trong dấu ngoặc nhọn. Trong ví dụ sau, command định nghĩa một argument bắt buộc: `user`:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user}';
```

Bạn cũng có thể đặt argument thành tùy chọn hoặc định nghĩa giá trị mặc định cho argument:

```php
// Optional argument...
'mail:send {user?}'

// Optional argument with default value...
'mail:send {user=foo}'
```

<a name="options"></a>
### Option

Option, giống argument, là một dạng input khác của người dùng. Option được đặt sau hai dấu gạch ngang (`--`) khi truyền qua command line. Có hai loại option: loại nhận value và loại không nhận value. Option không nhận value hoạt động như một "switch" boolean. Hãy xem ví dụ về loại option này:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue}';
```

Trong ví dụ này, switch `--queue` có thể được chỉ định khi gọi Artisan command. Nếu truyền switch `--queue`, giá trị của option sẽ là `true`. Nếu không, giá trị sẽ là `false`:

```shell
php artisan mail:send 1 --queue
```

<a name="options-with-values"></a>
#### Option có value

Tiếp theo, hãy xem một option cần value. Nếu người dùng phải chỉ định value cho option, bạn nên thêm dấu `=` vào cuối tên option:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send {user} {--queue=}';
```

Trong ví dụ này, người dùng có thể truyền value cho option như sau. Nếu option không được chỉ định khi gọi command, giá trị của nó sẽ là `null`:

```shell
php artisan mail:send 1 --queue=default
```

Bạn có thể gán giá trị mặc định cho option bằng cách chỉ định giá trị mặc định sau tên option. Nếu người dùng không truyền value cho option, giá trị mặc định sẽ được sử dụng:

```php
'mail:send {user} {--queue=default}'
```

<a name="option-shortcuts"></a>
#### Shortcut của option

Để gán shortcut khi định nghĩa option, bạn có thể đặt nó trước tên option và dùng ký tự `|` làm dấu phân cách giữa shortcut và tên đầy đủ của option:

```php
'mail:send {user} {--Q|queue=}'
```

Khi gọi command trong terminal, shortcut của option phải có một dấu gạch ngang ở trước và không được chứa ký tự `=` khi chỉ định value cho option:

```shell
php artisan mail:send 1 -Qdefault
```

<a name="input-arrays"></a>
### Mảng input

Nếu muốn định nghĩa argument hoặc option nhận nhiều giá trị input, bạn có thể dùng ký tự `*`. Trước tiên, hãy xem ví dụ định nghĩa một argument như vậy:

```php
'mail:send {user*}'
```

Khi chạy command này, các argument `user` có thể được truyền lần lượt trên command line. Ví dụ, command sau sẽ đặt giá trị của `user` thành array chứa `1` và `2`:

```shell
php artisan mail:send 1 2
```

Ký tự `*` này có thể kết hợp với định nghĩa argument tùy chọn để cho phép không có hoặc có nhiều instance của argument:

```php
'mail:send {user?*}'
```

<a name="option-arrays"></a>
#### Mảng option

Khi định nghĩa option nhận nhiều giá trị input, mỗi value của option truyền vào command phải được đặt sau tên option:

```php
'mail:send {--id=*}'
```

Một command như vậy có thể được gọi bằng cách truyền nhiều argument `--id`:

```shell
php artisan mail:send --id=1 --id=2
```

<a name="input-descriptions"></a>
### Mô tả input

Bạn có thể gán mô tả cho input argument và option bằng cách phân tách tên argument với mô tả bằng dấu hai chấm. Nếu cần thêm không gian để định nghĩa command, bạn có thể trải định nghĩa trên nhiều dòng:

```php
/**
 * The name and signature of the console command.
 *
 * @var string
 */
protected $signature = 'mail:send
                        {user : The ID of the user}
                        {--queue : Whether the job should be queued}';
```

<a name="prompting-for-missing-input"></a>
### Prompt khi thiếu input

Nếu command chứa argument bắt buộc, người dùng sẽ nhận thông báo lỗi khi không cung cấp chúng. Ngoài ra, bạn có thể cấu hình command tự động prompt người dùng khi thiếu argument bắt buộc bằng cách implement interface `PromptsForMissingInput`:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Contracts\Console\PromptsForMissingInput;

class SendEmails extends Command implements PromptsForMissingInput
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user}';

    // ...
}
```

Nếu Laravel cần thu thập một argument bắt buộc từ người dùng, framework sẽ tự động hỏi bằng cách diễn đạt câu hỏi hợp lý dựa trên tên hoặc mô tả của argument. Nếu muốn tùy chỉnh câu hỏi dùng để thu thập argument bắt buộc, bạn có thể implement method `promptForMissingArgumentsUsing`, trả về một array câu hỏi được key theo tên argument:

```php
/**
 * Prompt for missing input arguments using the returned questions.
 *
 * @return array<string, string>
 */
protected function promptForMissingArgumentsUsing(): array
{
    return [
        'user' => 'Which user ID should receive the mail?',
    ];
}
```

Bạn cũng có thể cung cấp placeholder text bằng tuple chứa câu hỏi và placeholder:

```php
return [
    'user' => ['Which user ID should receive the mail?', 'E.g. 123'],
];
```

Nếu muốn toàn quyền kiểm soát prompt, bạn có thể cung cấp một closure có nhiệm vụ prompt người dùng và trả về câu trả lời của họ:

```php
use App\Models\User;
use function Laravel\Prompts\search;

// ...

return [
    'user' => fn () => search(
        label: 'Search for a user:',
        placeholder: 'E.g. Taylor Otwell',
        options: fn ($value) => strlen($value) > 0
            ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
            : []
    ),
];
```

> [!NOTE]
> Tài liệu đầy đủ về [Laravel Prompts](/prompts) cung cấp thêm thông tin về các prompt hiện có và cách sử dụng chúng.

Nếu muốn prompt người dùng chọn hoặc nhập [option](#options), bạn có thể đặt prompt trong method `handle` của command. Tuy nhiên, nếu chỉ muốn prompt người dùng khi họ cũng đã được tự động prompt vì thiếu argument, bạn có thể implement method `afterPromptingForMissingArguments`:

```php
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use function Laravel\Prompts\confirm;

// ...

/**
 * Perform actions after the user was prompted for missing arguments.
 */
protected function afterPromptingForMissingArguments(InputInterface $input, OutputInterface $output): void
{
    $input->setOption('queue', confirm(
        label: 'Would you like to queue the mail?',
        default: $this->option('queue')
    ));
}
```

<a name="command-io"></a>
## I/O của command

<a name="retrieving-input"></a>
### Lấy dữ liệu đầu vào

Trong khi command đang thực thi, bạn thường cần truy cập giá trị của các argument và option mà command chấp nhận. Bạn có thể sử dụng các method `argument` và `option` để thực hiện việc này. Nếu argument hoặc option không tồn tại, `null` sẽ được trả về:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $userId = $this->argument('user');
}
```

Nếu cần lấy tất cả argument dưới dạng `array`, hãy gọi method `arguments`:

```php
$arguments = $this->arguments();
```

Option có thể được lấy tương tự argument bằng method `option`. Để lấy tất cả option dưới dạng mảng, hãy gọi method `options`:

```php
// Retrieve a specific option...
$queueName = $this->option('queue');

// Retrieve all options as an array...
$options = $this->options();
```

Bạn có thể sử dụng method `input` để lấy argument và option của command dưới dạng instance `Illuminate\Console\CommandInput`, cung cấp các accessor có kiểu tương tự những accessor có trên HTTP request và các data container khác:

```php
use App\Enums\ReportType;

/**
 * Execute the console command.
 */
public function handle(): void
{
    $input = $this->input()->date('from');

    // ...
}
```

Method `input` cũng có thể được dùng để lấy một giá trị đầu vào riêng lẻ từ argument hoặc option:

```php
$queue = $this->input('queue', 'default');
```

<a name="prompting-for-input"></a>
### Yêu cầu dữ liệu đầu vào

> [!NOTE]
> [Laravel Prompts](/prompts) là package PHP giúp thêm các form đẹp mắt, thân thiện với người dùng vào ứng dụng command-line, với những tính năng tương tự trình duyệt như placeholder và validation.

Ngoài việc hiển thị đầu ra, bạn cũng có thể yêu cầu người dùng cung cấp dữ liệu trong khi command thực thi. Method `ask` sẽ hiển thị câu hỏi, nhận dữ liệu người dùng nhập và trả dữ liệu đó về command:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $name = $this->ask('What is your name?');

    // ...
}
```

Method `ask` cũng nhận argument thứ hai tùy chọn để chỉ định giá trị mặc định sẽ được trả về nếu người dùng không nhập dữ liệu:

```php
$name = $this->ask('What is your name?', 'Taylor');
```

Method `secret` tương tự `ask`, nhưng dữ liệu người dùng nhập sẽ không hiển thị khi họ gõ trong console. Method này hữu ích khi yêu cầu thông tin nhạy cảm như mật khẩu:

```php
$password = $this->secret('What is the password?');
```

<a name="asking-for-confirmation"></a>
#### Yêu cầu xác nhận

Nếu cần yêu cầu người dùng xác nhận đơn giản "yes hoặc no", bạn có thể sử dụng method `confirm`. Mặc định, method này trả về `false`. Tuy nhiên, nếu người dùng nhập `y` hoặc `yes`, method sẽ trả về `true`.

```php
if ($this->confirm('Do you wish to continue?')) {
    // ...
}
```

Nếu cần, bạn có thể quy định prompt xác nhận mặc định trả về `true` bằng cách truyền `true` làm argument thứ hai cho method `confirm`:

```php
if ($this->confirm('Do you wish to continue?', true)) {
    // ...
}
```

<a name="auto-completion"></a>
#### Tự động hoàn thành

Method `anticipate` có thể cung cấp tính năng tự động hoàn thành cho các lựa chọn khả dĩ. Người dùng vẫn có thể nhập bất kỳ câu trả lời nào, bất kể các gợi ý tự động hoàn thành:

```php
$name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);
```

Ngoài ra, bạn có thể truyền một closure làm argument thứ hai cho method `anticipate`. Closure sẽ được gọi mỗi khi người dùng nhập một ký tự. Closure cần nhận tham số string chứa dữ liệu người dùng đã nhập đến thời điểm đó và trả về một mảng option dùng cho tự động hoàn thành:

```php
use App\Models\Address;

$name = $this->anticipate('What is your address?', function (string $input) {
    return Address::whereLike('name', "{$input}%")
        ->limit(5)
        ->pluck('name')
        ->all();
});
```

<a name="multiple-choice-questions"></a>
#### Câu hỏi nhiều lựa chọn

Nếu cần cung cấp một tập lựa chọn định sẵn khi đặt câu hỏi, bạn có thể sử dụng method `choice`. Bạn có thể đặt index trong mảng của giá trị mặc định sẽ được trả về khi không có option nào được chọn bằng cách truyền index làm argument thứ ba:

```php
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex
);
```

Ngoài ra, method `choice` nhận argument thứ tư và thứ năm tùy chọn để xác định số lần thử tối đa nhằm chọn câu trả lời hợp lệ và có cho phép chọn nhiều mục hay không:

```php
$name = $this->choice(
    'What is your name?',
    ['Taylor', 'Dayle'],
    $defaultIndex,
    $maxAttempts = null,
    $allowMultipleSelections = false
);
```

<a name="writing-output"></a>
### Ghi đầu ra

Để gửi đầu ra tới console, bạn có thể sử dụng các method `line`, `newLine`, `info`, `comment`, `question`, `warn`, `alert` và `error`. Mỗi method sử dụng màu ANSI phù hợp với mục đích của nó. Ví dụ, để hiển thị thông tin chung cho người dùng, method `info` thường hiển thị văn bản màu xanh lá trong console:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    // ...

    $this->info('The command was successful!');
}
```

Để hiển thị thông báo lỗi, hãy sử dụng method `error`. Nội dung lỗi thường được hiển thị màu đỏ:

```php
$this->error('Something went wrong!');
```

Bạn có thể sử dụng method `line` để hiển thị văn bản thuần không màu:

```php
$this->line('Display this on the screen');
```

Bạn có thể sử dụng method `newLine` để hiển thị dòng trống:

```php
// Write a single blank line...
$this->newLine();

// Write three blank lines...
$this->newLine(3);
```

<a name="tables"></a>
#### Bảng

Method `table` giúp định dạng đúng dữ liệu gồm nhiều hàng / cột một cách dễ dàng. Bạn chỉ cần cung cấp tên cột và dữ liệu của bảng; Laravel sẽ tự động tính chiều rộng và chiều cao phù hợp:

```php
use App\Models\User;

$this->table(
    ['Name', 'Email'],
    User::all(['name', 'email'])->toArray()
);
```

<a name="progress-bars"></a>
#### Thanh tiến trình

Với các tác vụ chạy lâu, việc hiển thị thanh tiến trình giúp người dùng biết tác vụ đã hoàn thành đến đâu. Khi sử dụng method `withProgressBar`, Laravel sẽ hiển thị thanh tiến trình và tăng tiến độ sau mỗi lần lặp qua giá trị iterable được cung cấp:

```php
use App\Models\User;

$users = $this->withProgressBar(User::all(), function (User $user) {
    $this->performTask($user);
});
```

Đôi khi bạn cần kiểm soát thủ công hơn cách thanh tiến trình được tăng. Trước tiên, hãy xác định tổng số bước mà process sẽ lặp qua. Sau đó tăng thanh tiến trình sau khi xử lý từng mục:

```php
$users = App\Models\User::all();

$bar = $this->output->createProgressBar(count($users));

$bar->start();

foreach ($users as $user) {
    $this->performTask($user);

    $bar->advance();
}

$bar->finish();
```

> [!NOTE]
> Để tìm hiểu các tùy chọn nâng cao hơn, hãy xem [tài liệu component Symfony Progress Bar](https://symfony.com/doc/current/components/console/helpers/progressbar.html).

<a name="registering-commands"></a>
## Đăng ký command

Mặc định, Laravel tự động đăng ký tất cả command trong thư mục `app/Console/Commands`. Tuy nhiên, bạn có thể yêu cầu Laravel quét các thư mục khác để tìm Artisan command bằng method `withCommands` trong file `bootstrap/app.php` của ứng dụng:

```php
->withCommands([
    __DIR__.'/../app/Domain/Orders/Commands',
])
```

Nếu cần, bạn cũng có thể đăng ký command thủ công bằng cách truyền tên class của command cho method `withCommands`:

```php
use App\Domain\Orders\Commands\SendEmails;

->withCommands([
    SendEmails::class,
])
```

Khi Artisan khởi động, tất cả command trong ứng dụng sẽ được [service container](/container) resolve và đăng ký với Artisan.

<a name="programmatically-executing-commands"></a>
## Thực thi command bằng chương trình

Đôi khi bạn có thể muốn thực thi Artisan command bên ngoài CLI, chẳng hạn từ route hoặc controller. Bạn có thể sử dụng method `call` trên facade `Artisan`. Method `call` nhận tên signature hoặc tên class của command làm argument đầu tiên và mảng tham số command làm argument thứ hai. Exit code sẽ được trả về:

```php
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::post('/user/{user}/mail', function (string $user) {
    $exitCode = Artisan::call('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

Ngoài ra, bạn có thể truyền toàn bộ Artisan command cho method `call` dưới dạng string:

```php
Artisan::call('mail:send 1 --queue=default');
```

<a name="passing-array-values"></a>
#### Truyền giá trị mảng

Nếu command định nghĩa một option nhận mảng, bạn có thể truyền một mảng giá trị cho option đó:

```php
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::post('/mail', function () {
    $exitCode = Artisan::call('mail:send', [
        '--id' => [5, 13]
    ]);
});
```

<a name="passing-boolean-values"></a>
#### Truyền giá trị boolean

Nếu cần chỉ định giá trị cho một option không nhận giá trị string, chẳng hạn flag `--force` của command `migrate:refresh`, bạn nên truyền `true` hoặc `false` làm giá trị của option:

```php
$exitCode = Artisan::call('migrate:refresh', [
    '--force' => true,
]);
```

<a name="queueing-artisan-commands"></a>
#### Đưa Artisan command vào queue

Với method `queue` trên facade `Artisan`, bạn có thể đưa Artisan command vào queue để chúng được [queue worker](/queues) xử lý ở background. Trước khi sử dụng method này, hãy đảm bảo queue đã được cấu hình và queue listener đang chạy:

```php
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::post('/user/{user}/mail', function (string $user) {
    Artisan::queue('mail:send', [
        'user' => $user, '--queue' => 'default'
    ]);

    // ...
});
```

Bằng các method `onConnection` và `onQueue`, bạn có thể chỉ định connection hoặc queue mà Artisan command sẽ được dispatch tới:

```php
Artisan::queue('mail:send', [
    'user' => 1, '--queue' => 'default'
])->onConnection('redis')->onQueue('commands');
```

<a name="calling-commands-from-other-commands"></a>
### Gọi command từ command khác

Đôi khi bạn có thể muốn gọi command khác từ một Artisan command hiện có. Bạn có thể thực hiện bằng method `call`. Method này nhận tên command cùng mảng argument / option:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $this->call('mail:send', [
        'user' => 1, '--queue' => 'default'
    ]);

    // ...
}
```

Nếu muốn gọi một console command khác và ẩn toàn bộ đầu ra của nó, bạn có thể sử dụng method `callSilently`. Method `callSilently` có cùng signature với method `call`:

```php
$this->callSilently('mail:send', [
    'user' => 1, '--queue' => 'default'
]);
```

<a name="signal-handling"></a>
## Xử lý signal

Hệ điều hành cho phép gửi signal tới các process đang chạy. Ví dụ, signal `SIGTERM` là cách hệ điều hành yêu cầu chương trình kết thúc một cách an toàn. Nếu muốn lắng nghe signal trong Artisan console command và thực thi code khi signal xuất hiện, bạn có thể sử dụng method `trap`:

```php
/**
 * Execute the console command.
 */
public function handle(): void
{
    $this->trap(SIGTERM, fn () => $this->shouldKeepRunning = false);

    while ($this->shouldKeepRunning) {
        // ...
    }
}
```

Để lắng nghe nhiều signal cùng lúc, bạn có thể truyền một mảng signal cho method `trap`:

```php
$this->trap([SIGTERM, SIGQUIT], function (int $signal) {
    $this->shouldKeepRunning = false;

    dump($signal); // SIGTERM / SIGQUIT
});
```

<a name="the-dev-command"></a>
## Command Dev

Artisan command `dev` khởi chạy tất cả process cần thiết cho phát triển local trong một cửa sổ terminal. Mặc định, command này chạy đồng thời PHP development server, một queue worker, theo dõi log qua [Pail](/logging#tailing-log-messages-using-pail) và biên dịch asset bằng Vite:

```shell
php artisan dev
```

Bên dưới, command `dev` sử dụng package npm `@laravel/multiplex` để quản lý các process, cung cấp cho mỗi process một tab riêng với đầu ra có thể tìm kiếm và cuộn. Mỗi process có nhãn và màu riêng để dễ phân biệt. Nếu process bị crash, nó sẽ tự động được khởi động lại; khi bạn thoát, toàn bộ đầu ra được ghi trở lại terminal để không mất thông tin.

> [!NOTE]
> Command `dev` yêu cầu Node 22.13 trở lên. Trên Windows, command sẽ fallback sang package npm `concurrently` và giao diện dạng tab không khả dụng.

Các process mặc định gồm:

| Name | Command |
| --- | --- |
| `server` | `php artisan serve --host=localhost` |
| `queue` | `php artisan queue:listen --tries=1 --timeout=0` |
| `logs` | `php artisan pail --timeout=0` |
| `vite` | `npm run dev` |

> [!NOTE]
> Process `vite` tự động phát hiện Node package manager của bạn (npm, pnpm, Yarn hoặc Bun) và sử dụng run command phù hợp.

<a name="customizing-dev-processes"></a>
### Tùy chỉnh các process Dev

Bạn có thể tùy chỉnh các process mà command `dev` chạy bằng class `DevCommands`, thường trong method `boot` của `AppServiceProvider`. Method `register` nhận một command string và tên tùy chọn:

```php
use Illuminate\Foundation\DevCommands;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    DevCommands::register('some-command --flag', 'my-process');
}
```

Khi đăng ký Artisan command, bạn có thể sử dụng method `artisan`; method này tự động thêm prefix `php artisan` vào command:

```php
DevCommands::artisan('horizon', 'horizon');
```

Tương tự, method `node` thêm prefix là run command của package manager được phát hiện (ví dụ `npm run`), còn method `nodeExec` thêm prefix là exec command của package manager (ví dụ `npx`):

```php
DevCommands::node('storybook', 'storybook');

DevCommands::nodeExec('tailwindcss -i resources/css/app.css -o public/css/app.css --watch', 'tailwind');
```

Nếu đăng ký process có cùng tên với process mặc định, process của bạn sẽ thay thế process mặc định. Ví dụ, bạn có thể tùy chỉnh server process để sử dụng port khác:

```php
DevCommands::artisan('serve --host=localhost --port=9000', 'server');
```

Bạn cũng có thể tùy chỉnh màu nhãn process trong terminal. Các method màu khả dụng gồm `blue`, `purple`, `pink`, `orange`, `green` và `yellow`. Bạn cũng có thể truyền mã màu hex tùy chỉnh cho method `color`:

```php
DevCommands::register('my-command', 'my-process')->green();

DevCommands::register('my-command', 'my-process')->color('#ff6347');
```

Để xem tất cả dev process đã đăng ký mà không khởi chạy chúng, hãy sử dụng command `dev:list`:

```shell
php artisan dev:list
```

<a name="restarting-failed-processes"></a>
#### Khởi động lại process bị lỗi

Nếu một process bị crash, Laravel sẽ khởi động lại process đó sau một khoảng trễ ngắn, tối đa năm lần, trước khi đánh dấu là thất bại. Process dừng trong vòng một giây sau khi khởi động sẽ không được khởi động lại vì nhiều khả năng nó chưa từng khởi động thành công. Khởi động lại process thủ công bằng `r` sẽ reset bộ đếm.

Bạn có thể tắt hành vi này cho một lần chạy bằng option `--no-restart`:

```shell
php artisan dev --no-restart
```

Hoặc bạn có thể tắt hành vi này cho toàn bộ ứng dụng bằng method `disableAutoRestart`:

```php
DevCommands::disableAutoRestart();
```

<a name="filtering-dev-processes"></a>
### Lọc các process Dev

Bạn có thể yêu cầu command `dev` chỉ chạy các process cụ thể bằng method `only`. Tương tự, bạn có thể loại trừ các process cụ thể bằng method `except`:

```php
// Only run the server and vite processes...
DevCommands::only('server', 'vite');

// Run all processes except the queue worker...
DevCommands::except('queue');
```

<a name="stub-customization"></a>
## Tùy chỉnh stub

Các command `make` của Artisan console được dùng để tạo nhiều loại class như controller, job, migration và test. Các class này được sinh từ file "stub", trong đó các giá trị được điền dựa trên dữ liệu đầu vào của bạn. Tuy nhiên, bạn có thể muốn điều chỉnh nhỏ các file do Artisan sinh ra. Để làm việc này, hãy dùng command `stub:publish` để publish các stub phổ biến nhất vào ứng dụng và tùy chỉnh chúng:

```shell
php artisan stub:publish
```

Các stub đã publish nằm trong thư mục `stubs` ở root của ứng dụng. Mọi thay đổi đối với các stub này sẽ được phản ánh khi bạn sinh các class tương ứng bằng command `make` của Artisan.

<a name="events"></a>
## Event

Artisan dispatch ba event khi chạy command: `Illuminate\Console\Events\ArtisanStarting`, `Illuminate\Console\Events\CommandStarting` và `Illuminate\Console\Events\CommandFinished`. Event `ArtisanStarting` được dispatch ngay khi Artisan bắt đầu chạy. Tiếp theo, `CommandStarting` được dispatch ngay trước khi một command chạy. Cuối cùng, `CommandFinished` được dispatch sau khi command thực thi xong.
