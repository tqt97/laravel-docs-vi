# Cấu trúc thư mục

<a name="introduction"></a>
## Giới thiệu

Cấu trúc mặc định của ứng dụng Laravel được thiết kế để trở thành điểm khởi đầu phù hợp cho cả ứng dụng nhỏ lẫn ứng dụng quy mô lớn. Tuy nhiên, bạn hoàn toàn có thể tổ chức ứng dụng theo cách phù hợp với dự án. Laravel gần như không áp đặt vị trí của một class cụ thể, miễn là Composer có thể autoload class đó.

<a name="the-root-directory"></a>
## Thư mục gốc

<a name="the-root-app-directory"></a>
### Thư mục App

Thư mục `app` chứa phần code cốt lõi của ứng dụng. Chúng ta sẽ tìm hiểu kỹ hơn về thư mục này ở phần sau; nhìn chung, gần như toàn bộ class của ứng dụng sẽ nằm tại đây.

<a name="the-bootstrap-directory"></a>
### Thư mục Bootstrap

Thư mục `bootstrap` chứa file `app.php`, chịu trách nhiệm khởi động framework. Thư mục này cũng chứa thư mục `cache`, nơi lưu các file do framework tạo ra nhằm tối ưu hiệu năng, chẳng hạn như route cache và service cache.

<a name="the-config-directory"></a>
### Thư mục Config

Đúng như tên gọi, thư mục `config` chứa toàn bộ file cấu hình của ứng dụng. Bạn nên đọc qua các file này để làm quen với những tùy chọn cấu hình mà Laravel cung cấp.

<a name="the-database-directory"></a>
### Thư mục Database

Thư mục `database` chứa database migration, model factory và seeder. Nếu muốn, bạn cũng có thể lưu database SQLite trong thư mục này.

<a name="the-public-directory"></a>
### Thư mục Public

Thư mục `public` chứa file `index.php`, là entry point cho mọi request đi vào ứng dụng và cũng là nơi cấu hình autoloading. Thư mục này còn chứa các asset công khai như hình ảnh, JavaScript và CSS.

<a name="the-resources-directory"></a>
### Thư mục Resources

Thư mục `resources` chứa các [view](/docs/{{version}}/views), cùng các asset nguồn chưa được biên dịch như CSS hoặc JavaScript.

<a name="the-routes-directory"></a>
### Thư mục Routes

Thư mục `routes` chứa toàn bộ định nghĩa route của ứng dụng. Mặc định, Laravel cung cấp hai file route: `web.php` và `console.php`.

File `web.php` chứa các route được Laravel đưa vào middleware group `web`, cung cấp session state, CSRF protection và cookie encryption. Nếu ứng dụng không cung cấp RESTful API dạng stateless, phần lớn route của bạn thường sẽ được định nghĩa trong file `web.php`.

File `console.php` là nơi bạn có thể định nghĩa các console command dựa trên closure. Mỗi closure được bind với một command instance, nhờ đó có thể tương tác thuận tiện với các phương thức I/O của command. Mặc dù file này không định nghĩa HTTP route, nó định nghĩa các entry point dạng console vào ứng dụng. Bạn cũng có thể [lập lịch](/docs/{{version}}/scheduling) tác vụ trong file `console.php`.

Nếu cần, bạn có thể cài đặt thêm file route dành cho API (`api.php`) và broadcasting channel (`channels.php`) thông qua các lệnh Artisan `install:api` và `install:broadcasting`.

File `api.php` chứa các route được thiết kế theo hướng stateless. Vì vậy, request đi vào ứng dụng qua những route này thường được xác thực [bằng token](/docs/{{version}}/sanctum) và không có quyền truy cập session state.

File `channels.php` là nơi đăng ký các channel [event broadcasting](/docs/{{version}}/broadcasting) mà ứng dụng hỗ trợ.

<a name="the-storage-directory"></a>
### Thư mục Storage

Thư mục `storage` chứa log, Blade template đã biên dịch, file session, file cache và những file khác do framework tạo ra. Thư mục này được chia thành `app`, `framework` và `logs`. Thư mục `app` có thể dùng để lưu các file do ứng dụng tạo ra. Thư mục `framework` lưu file và cache do framework sinh ra. Cuối cùng, thư mục `logs` chứa các file log của ứng dụng.

Thư mục `storage/app/public` có thể dùng để lưu các file do người dùng tạo và cần truy cập công khai, chẳng hạn như ảnh đại diện. Bạn nên tạo symbolic link `public/storage` trỏ tới thư mục này. Có thể tạo liên kết bằng lệnh Artisan `php artisan storage:link`.

<a name="the-tests-directory"></a>
### Thư mục Tests

Thư mục `tests` chứa các automated test của ứng dụng. Laravel cung cấp sẵn các ví dụ unit test và feature test bằng [Pest](https://pestphp.com) hoặc [PHPUnit](https://phpunit.de/). Tên mỗi test class nên kết thúc bằng `Test`. Bạn có thể chạy test bằng `/vendor/bin/pest` hoặc `/vendor/bin/phpunit`. Nếu muốn xem kết quả chi tiết và trực quan hơn, có thể sử dụng lệnh Artisan `php artisan test`.

<a name="the-vendor-directory"></a>
### Thư mục Vendor

Thư mục `vendor` chứa các dependency được cài đặt thông qua [Composer](https://getcomposer.org).

<a name="the-app-directory"></a>
## Thư mục App

Phần lớn code của ứng dụng nằm trong thư mục `app`. Mặc định, thư mục này sử dụng namespace `App` và được Composer autoload theo [chuẩn PSR-4](https://www.php-fig.org/psr/psr-4/).

Mặc định, thư mục `app` chứa các thư mục `Http`, `Models` và `Providers`. Theo thời gian, khi bạn sử dụng các lệnh Artisan `make` để tạo class, Laravel sẽ sinh thêm nhiều thư mục khác bên trong `app`. Ví dụ, thư mục `app/Console` chỉ xuất hiện sau khi bạn chạy lệnh Artisan `make:command` để tạo một command class.

Hai thư mục `Console` và `Http` được giải thích chi tiết ở các phần tương ứng bên dưới. Có thể xem chúng như những API để tương tác với phần lõi của ứng dụng. HTTP protocol và CLI đều là cơ chế để giao tiếp với ứng dụng, nhưng bản thân chúng không nên chứa business logic. Nói cách khác, đây là hai cách để gửi lệnh vào ứng dụng. Thư mục `Console` chứa các Artisan command, còn thư mục `Http` chứa controller, middleware và request.

> [!NOTE]
> Nhiều class trong thư mục `app` có thể được tạo bằng Artisan. Để xem các lệnh khả dụng, hãy chạy `php artisan list make` trong terminal.

<a name="the-broadcasting-directory"></a>
### Thư mục Broadcasting

Thư mục `Broadcasting` chứa các broadcast channel class của ứng dụng. Các class này được tạo bằng lệnh `make:channel`. Thư mục này không tồn tại mặc định và sẽ được tạo khi bạn tạo channel đầu tiên. Để tìm hiểu thêm, hãy xem tài liệu về [event broadcasting](/docs/{{version}}/broadcasting).

<a name="the-console-directory"></a>
### Thư mục Console

Thư mục `Console` chứa các Artisan command tùy chỉnh của ứng dụng. Bạn có thể tạo các command này bằng lệnh `make:command`.

<a name="the-events-directory"></a>
### Thư mục Events

Thư mục này không tồn tại mặc định, nhưng sẽ được tạo bởi các lệnh Artisan `event:generate` và `make:event`. Thư mục `Events` chứa các [event class](/docs/{{version}}/events). Event có thể dùng để thông báo cho những phần khác của ứng dụng rằng một hành động cụ thể đã xảy ra, qua đó tăng tính linh hoạt và giảm coupling giữa các thành phần.

<a name="the-exceptions-directory"></a>
### Thư mục Exceptions

Thư mục `Exceptions` chứa các custom exception của ứng dụng. Bạn có thể tạo exception bằng lệnh `make:exception`.

<a name="the-http-directory"></a>
### Thư mục Http

Thư mục `Http` chứa controller, middleware và form request. Gần như toàn bộ logic xử lý request đi vào ứng dụng sẽ được đặt trong thư mục này.

<a name="the-jobs-directory"></a>
### Thư mục Jobs

Thư mục này không tồn tại mặc định, nhưng sẽ được tạo khi bạn chạy lệnh Artisan `make:job`. Thư mục `Jobs` chứa các [job có thể đưa vào queue](/docs/{{version}}/queues) của ứng dụng. Job có thể được đưa vào queue hoặc chạy đồng bộ ngay trong request lifecycle hiện tại. Các job chạy đồng bộ trong request hiện tại đôi khi được gọi là "command" vì chúng là một implementation của [Command Pattern](https://en.wikipedia.org/wiki/Command_pattern).

<a name="the-listeners-directory"></a>
### Thư mục Listeners

Thư mục này không tồn tại mặc định, nhưng sẽ được tạo khi bạn chạy `event:generate` hoặc `make:listener`. Thư mục `Listeners` chứa các class xử lý [event](/docs/{{version}}/events). Event listener nhận một event instance và thực thi logic để phản hồi event đó. Ví dụ, event `UserRegistered` có thể được xử lý bởi listener `SendWelcomeEmail`.

<a name="the-mail-directory"></a>
### Thư mục Mail

Thư mục này không tồn tại mặc định, nhưng sẽ được tạo khi bạn chạy lệnh Artisan `make:mail`. Thư mục `Mail` chứa các [class đại diện cho email](/docs/{{version}}/mail) mà ứng dụng gửi đi. Mail object cho phép đóng gói toàn bộ logic xây dựng một email trong một class đơn giản và có thể gửi bằng phương thức `Mail::send`.

<a name="the-models-directory"></a>
### Thư mục Models

Thư mục `Models` chứa toàn bộ [Eloquent model class](/docs/{{version}}/eloquent). Eloquent ORM đi kèm Laravel cung cấp một implementation Active Record đơn giản và giàu tính biểu đạt để làm việc với database. Mỗi bảng database có một "Model" tương ứng dùng để tương tác với bảng đó. Model cho phép query dữ liệu cũng như chèn record mới vào bảng.

<a name="the-notifications-directory"></a>
### Thư mục Notifications

Thư mục này không tồn tại mặc định, nhưng sẽ được tạo khi bạn chạy lệnh Artisan `make:notification`. Thư mục `Notifications` chứa các [notification](/docs/{{version}}/notifications) mang tính "transactional" mà ứng dụng gửi đi, chẳng hạn thông báo đơn giản về một sự kiện vừa xảy ra. Tính năng notification của Laravel trừu tượng hóa việc gửi thông báo qua nhiều driver như email, Slack, SMS hoặc lưu vào database.

<a name="the-policies-directory"></a>
### Thư mục Policies

Thư mục này không tồn tại mặc định, nhưng sẽ được tạo khi bạn chạy lệnh Artisan `make:policy`. Thư mục `Policies` chứa các [authorization policy class](/docs/{{version}}/authorization) của ứng dụng. Policy được dùng để xác định liệu một user có được phép thực hiện một hành động cụ thể trên resource hay không.

<a name="the-providers-directory"></a>
### Thư mục Providers

Thư mục `Providers` chứa toàn bộ [service provider](/docs/{{version}}/providers) của ứng dụng. Service provider tham gia bootstrap ứng dụng bằng cách bind service vào service container, đăng ký event hoặc thực hiện những tác vụ cần thiết khác để chuẩn bị ứng dụng tiếp nhận request.

Trong một ứng dụng Laravel mới, thư mục này đã có sẵn `AppServiceProvider`. Bạn có thể bổ sung các provider riêng vào đây khi cần.

<a name="the-rules-directory"></a>
### Thư mục Rules

Thư mục này không tồn tại mặc định, nhưng sẽ được tạo khi bạn chạy lệnh Artisan `make:rule`. Thư mục `Rules` chứa các object đại diện cho custom validation rule của ứng dụng. Rule giúp đóng gói validation logic phức tạp trong một object đơn giản. Để tìm hiểu thêm, hãy xem [tài liệu Validation](/docs/{{version}}/validation).
