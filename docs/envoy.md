# Laravel Envoy

<a name="introduction"></a>
## Giới thiệu
[Laravel Envoy](https://github.com/laravel/envoy) là công cụ giúp thực thi các tác vụ thường gặp trên máy chủ từ xa. Bằng cú pháp theo phong cách [Blade](/blade), bạn có thể dễ dàng thiết lập các tác vụ triển khai, lệnh Artisan và nhiều công việc khác. Hiện tại, Envoy chỉ hỗ trợ macOS và Linux. Tuy nhiên, trên Windows bạn vẫn có thể sử dụng Envoy thông qua [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10).
<a name="installation"></a>
## Cài đặt
Trước tiên, cài Envoy vào dự án bằng Composer:
```shell
composer require laravel/envoy --dev
```
Sau khi cài đặt, binary của Envoy sẽ nằm trong thư mục `vendor/bin` của ứng dụng:
```shell
php vendor/bin/envoy
```

<a name="writing-tasks"></a>
## Viết tác vụ
<a name="defining-tasks"></a>
### Định nghĩa tác vụ
Task là khối xây dựng cơ bản của Envoy. Mỗi task định nghĩa các lệnh shell sẽ được thực thi trên máy chủ từ xa khi task được gọi. Ví dụ, bạn có thể tạo một task chạy lệnh `php artisan queue:restart` trên tất cả máy chủ đang chạy queue worker của ứng dụng.
Tất cả task Envoy nên được định nghĩa trong file `Envoy.blade.php` ở thư mục gốc của ứng dụng. Ví dụ sau là một cấu hình khởi đầu:
```blade
@servers(['web' => ['user@192.168.1.1'], 'workers' => ['user@192.168.1.2']])

@task('restart-queues', ['on' => 'workers'])
    cd /home/user/example.com
    php artisan queue:restart
@endtask
```
Như bạn thấy, một mảng `@servers` được khai báo ở đầu file, cho phép tham chiếu các máy chủ này qua tùy chọn `on` trong khai báo task. Khai báo `@servers` luôn phải nằm trên một dòng. Bên trong mỗi `@task`, hãy đặt các lệnh shell cần chạy trên máy chủ khi task được gọi.
<a name="local-tasks"></a>
#### Tác vụ cục bộ
Bạn có thể buộc một script chạy trên máy tính cục bộ bằng cách chỉ định địa chỉ IP máy chủ là `127.0.0.1`:
```blade
@servers(['localhost' => '127.0.0.1'])
```

<a name="importing-envoy-tasks"></a>
#### Import tác vụ Envoy
Với directive `@import`, bạn có thể import các file Envoy khác để đưa stories và tasks của chúng vào file hiện tại. Sau khi import, các task trong đó có thể được thực thi như thể chúng được định nghĩa trực tiếp trong file Envoy của bạn:
```blade
@import('vendor/package/Envoy.blade.php')
```

<a name="multiple-servers"></a>
### Nhiều máy chủ
Envoy giúp chạy một task trên nhiều máy chủ rất thuận tiện. Trước tiên, thêm các máy chủ vào khai báo `@servers`; mỗi máy chủ phải có tên duy nhất. Sau đó, liệt kê các máy chủ cần chạy task trong mảng `on` của task:
```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2']])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a name="parallel-execution"></a>
#### Thực thi song song
Mặc định, task được thực thi tuần tự trên từng máy chủ: task phải chạy xong ở máy chủ thứ nhất rồi mới chuyển sang máy chủ thứ hai. Nếu muốn chạy task đồng thời trên nhiều máy chủ, hãy thêm tùy chọn `parallel` vào khai báo task:
```blade
@servers(['web-1' => '192.168.1.1', 'web-2' => '192.168.1.2'])

@task('deploy', ['on' => ['web-1', 'web-2'], 'parallel' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate --force
@endtask
```

<a name="setup"></a>
### Thiết lập
Đôi khi bạn cần chạy một đoạn PHP tùy ý trước khi các task Envoy bắt đầu. Directive `@setup` cho phép định nghĩa một khối PHP sẽ được thực thi trước các task:
```php
@setup
    $now = new DateTime;
@endsetup
```
Nếu cần nạp các file PHP khác trước khi task chạy, bạn có thể dùng directive `@include` ở đầu file `Envoy.blade.php`:
```blade
@include('vendor/autoload.php')

@task('restart-queues')
    # ...
@endtask
```

<a name="variables"></a>
### Biến
Khi cần, bạn có thể truyền đối số cho task Envoy bằng cách chỉ định chúng trên command line khi gọi Envoy:
```shell
php vendor/bin/envoy run deploy --branch=master
```
Bên trong task, bạn có thể truy cập các tùy chọn bằng cú pháp "echo" của Blade. Bạn cũng có thể dùng câu lệnh `if` và vòng lặp Blade. Ví dụ sau kiểm tra sự tồn tại của biến `$branch` trước khi chạy lệnh `git pull`:
```blade
@servers(['web' => ['user@192.168.1.1']])

@task('deploy', ['on' => 'web'])
    cd /home/user/example.com

    @if ($branch)
        git pull origin {{ $branch }}
    @endif

    php artisan migrate --force
@endtask
```

<a name="stories"></a>
### Stories
Story gom nhiều task dưới một tên duy nhất, thuận tiện để thực thi theo nhóm. Ví dụ, story `deploy` có thể chạy lần lượt các task `update-code` và `install-dependencies` bằng cách liệt kê tên task trong định nghĩa của story:
```blade
@servers(['web' => ['user@192.168.1.1']])

@story('deploy')
    update-code
    install-dependencies
@endstory

@task('update-code')
    cd /home/user/example.com
    git pull origin master
@endtask

@task('install-dependencies')
    cd /home/user/example.com
    composer install
@endtask
```
Sau khi định nghĩa story, bạn có thể gọi nó giống như gọi một task:
```shell
php vendor/bin/envoy run deploy
```

<a name="completion-hooks"></a>
### Hooks
Khi task và story chạy, Envoy kích hoạt một số hook. Các loại hook được hỗ trợ gồm `@before`, `@after`, `@error`, `@success` và `@finished`. Toàn bộ code trong các hook này được diễn giải như PHP và chạy **trên máy cục bộ**, không phải trên các máy chủ từ xa mà task đang thao tác.
Bạn có thể định nghĩa nhiều hook cùng loại tùy ý. Chúng được thực thi theo đúng thứ tự xuất hiện trong script Envoy.
<a name="hook-before"></a>
#### `@before`

Trước mỗi lần thực thi task, toàn bộ hook `@before` đã đăng ký sẽ chạy. Hook `@before` nhận tên của task sắp được thực thi:
```blade
@before
    if ($task === 'deploy') {
        // ...
    }
@endbefore
```

<a name="completion-after"></a>
#### `@after`

Sau mỗi lần thực thi task, toàn bộ hook `@after` đã đăng ký sẽ chạy. Hook `@after` nhận tên của task vừa được thực thi:
```blade
@after
    if ($task === 'deploy') {
        // ...
    }
@endafter
```

<a name="completion-error"></a>
#### `@error`

Sau mỗi lần task thất bại (thoát với status code lớn hơn `0`), toàn bộ hook `@error` đã đăng ký sẽ chạy. Hook `@error` nhận tên của task vừa được thực thi:
```blade
@error
    if ($task === 'deploy') {
        // ...
    }
@enderror
```

<a name="completion-success"></a>
#### `@success`

Nếu tất cả task hoàn tất mà không có lỗi, toàn bộ hook `@success` đã đăng ký sẽ chạy:
```blade
@success
    // ...
@endsuccess
```

<a name="completion-finished"></a>
#### `@finished`

Sau khi tất cả task đã thực thi xong, bất kể exit status, các hook `@finished` sẽ chạy. Hook `@finished` nhận status code của task đã hoàn tất; giá trị này có thể là `null` hoặc một số nguyên lớn hơn hoặc bằng `0`:
```blade
@finished
    if ($exitCode > 0) {
        // There were errors in one of the tasks...
    }
@endfinished
```

<a name="running-tasks"></a>
## Chạy tác vụ
Để chạy một task hoặc story đã định nghĩa trong `Envoy.blade.php`, hãy thực thi lệnh `run` của Envoy và truyền tên task hoặc story. Envoy sẽ chạy task và hiển thị output từ các máy chủ từ xa trong quá trình thực thi:
```shell
php vendor/bin/envoy run deploy
```

<a name="confirming-task-execution"></a>
### Xác nhận thực thi tác vụ
Nếu muốn Envoy hỏi xác nhận trước khi chạy một task trên máy chủ, hãy thêm directive `confirm` vào khai báo task. Tùy chọn này đặc biệt hữu ích với các thao tác có tính phá hủy hoặc khó hoàn tác:
```blade
@task('deploy', ['on' => 'web', 'confirm' => true])
    cd /home/user/example.com
    git pull origin {{ $branch }}
    php artisan migrate
@endtask
```

<a name="notifications"></a>
## Thông báo
<a name="slack"></a>
### Slack
Envoy hỗ trợ gửi thông báo tới [Slack](https://slack.com) sau mỗi task. Directive `@slack` nhận URL Slack webhook và tên channel / user. Bạn có thể lấy webhook URL bằng cách tạo integration "Incoming WebHooks" trong bảng điều khiển Slack.
Hãy truyền toàn bộ webhook URL làm đối số đầu tiên cho directive `@slack`. Đối số thứ hai phải là tên channel (`#channel`) hoặc user (`@user`):
```blade
@finished
    @slack('webhook-url', '#bots')
@endfinished
```
Mặc định, notification của Envoy sẽ gửi một thông điệp tới channel mô tả task vừa được thực thi. Tuy nhiên, bạn có thể thay thông điệp này bằng nội dung tùy chỉnh thông qua đối số thứ ba của directive `@slack`:
```blade
@finished
    @slack('webhook-url', '#bots', 'Hello, Slack.')
@endfinished
```

<a name="discord"></a>
### Discord
Envoy cũng hỗ trợ gửi notification tới [Discord](https://discord.com) sau mỗi task. Directive `@discord` nhận một Discord webhook URL và nội dung thông điệp. Bạn có thể lấy webhook URL bằng cách tạo "Webhook" trong Server Settings và chọn channel mà webhook sẽ gửi tới. Hãy truyền toàn bộ webhook URL vào directive `@discord`:
```blade
@finished
    @discord('discord-webhook-url')
@endfinished
```

<a name="telegram"></a>
### Telegram
Envoy cũng hỗ trợ gửi notification tới [Telegram](https://telegram.org) sau mỗi task. Directive `@telegram` nhận Telegram Bot ID và Chat ID. Bạn có thể lấy Bot ID bằng cách tạo bot mới qua [BotFather](https://t.me/botfather), và lấy Chat ID hợp lệ bằng [@username_to_id_bot](https://t.me/username_to_id_bot). Hãy truyền đầy đủ Bot ID và Chat ID vào directive `@telegram`:
```blade
@finished
    @telegram('bot-id','chat-id')
@endfinished
```

<a name="microsoft-teams"></a>
### Microsoft Teams
Envoy cũng hỗ trợ gửi notification tới [Microsoft Teams](https://www.microsoft.com/en-us/microsoft-teams) sau mỗi task. Directive `@microsoftTeams` nhận Teams Webhook (bắt buộc), nội dung thông điệp, theme color (`success`, `info`, `warning`, `error`) và một mảng tùy chọn. Bạn có thể lấy Teams Webhook bằng cách tạo [incoming webhook](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook). Teams API còn hỗ trợ nhiều thuộc tính để tùy biến message box như title, summary và sections; xem thêm [tài liệu Microsoft Teams](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using?tabs=cURL#example-of-connector-message). Hãy truyền toàn bộ Webhook URL vào directive `@microsoftTeams`:
```blade
@finished
    @microsoftTeams('webhook-url')
@endfinished
```
