# Cấu hình

- [Giới thiệu](#introduction)
- [Cấu hình môi trường](#environment-configuration)
    - [Kiểu dữ liệu của biến môi trường](#environment-variable-types)
    - [Truy xuất cấu hình môi trường](#retrieving-environment-configuration)
    - [Xác định môi trường hiện tại](#determining-the-current-environment)
    - [Mã hóa file môi trường](#encrypting-environment-files)
- [Truy cập giá trị cấu hình](#accessing-configuration-values)
- [Cache cấu hình](#configuration-caching)
- [Publish cấu hình](#configuration-publishing)
- [Chế độ debug](#debug-mode)
- [Chế độ bảo trì](#maintenance-mode)

<a name="introduction"></a>
## Giới thiệu

Tất cả file cấu hình của Laravel framework được lưu trong thư mục `config`. Mỗi tùy chọn đều có phần mô tả, vì vậy bạn nên xem qua các file này để làm quen với những tùy chọn cấu hình mà ứng dụng có thể sử dụng.

Các file cấu hình này cho phép bạn thiết lập thông tin kết nối cơ sở dữ liệu, thông tin mail server, cũng như nhiều giá trị cấu hình cốt lõi khác như URL của ứng dụng và khóa mã hóa.

<a name="the-about-command"></a>
#### Lệnh `about`

Laravel có thể hiển thị tổng quan về cấu hình, driver và môi trường của ứng dụng thông qua lệnh Artisan `about`.

```shell
php artisan about
```

Nếu chỉ quan tâm đến một phần cụ thể trong kết quả tổng quan của ứng dụng, bạn có thể lọc phần đó bằng tùy chọn `--only`:

```shell
php artisan about --only=environment
```

Hoặc, để xem chi tiết các giá trị trong một file cấu hình cụ thể, bạn có thể sử dụng lệnh Artisan `config:show`:

```shell
php artisan config:show database
```

<a name="environment-configuration"></a>
## Cấu hình môi trường

Trong thực tế, mỗi môi trường chạy ứng dụng thường cần những giá trị cấu hình khác nhau. Chẳng hạn, ở môi trường local bạn có thể muốn sử dụng cache driver khác với môi trường production.

Để việc này trở nên đơn giản, Laravel sử dụng thư viện PHP [DotEnv](https://github.com/vlucas/phpdotenv). Trong một bản cài đặt Laravel mới, thư mục gốc của ứng dụng chứa file `.env.example`, nơi khai báo nhiều biến môi trường thông dụng. Trong quá trình cài đặt Laravel, file này sẽ tự động được sao chép thành `.env`.

File `.env` mặc định của Laravel chứa một số giá trị cấu hình thường thay đổi tùy theo ứng dụng đang chạy local hay trên web server production. Sau đó, các file trong thư mục `config` đọc những giá trị này thông qua hàm `env` của Laravel.

Nếu phát triển theo nhóm, bạn nên tiếp tục đưa file `.env.example` vào source control và cập nhật file này khi cần. Bằng cách đặt các giá trị mẫu trong file cấu hình ví dụ, những thành viên khác có thể dễ dàng biết ứng dụng cần những biến môi trường nào để chạy.

> [!NOTE]
> Mọi biến trong file `.env` đều có thể bị ghi đè bởi biến môi trường bên ngoài, chẳng hạn biến môi trường ở cấp server hoặc cấp hệ điều hành.

<a name="environment-file-security"></a>
#### Bảo mật file môi trường

Không nên commit file `.env` vào source control của ứng dụng, vì mỗi developer hoặc server có thể cần cấu hình môi trường khác nhau. Việc commit file này còn tạo ra rủi ro bảo mật: nếu kẻ tấn công truy cập được repository, các thông tin xác thực nhạy cảm trong `.env` cũng có thể bị lộ.

Tuy nhiên, bạn có thể mã hóa file môi trường bằng tính năng [mã hóa môi trường](#encrypting-environment-files) tích hợp sẵn của Laravel. File môi trường đã mã hóa có thể được lưu trong source control một cách an toàn.

<a name="additional-environment-files"></a>
#### Các file môi trường bổ sung

Trước khi nạp các biến môi trường của ứng dụng, Laravel kiểm tra xem biến môi trường `APP_ENV` có được cung cấp từ bên ngoài hay tham số CLI `--env` có được chỉ định hay không. Nếu có, Laravel sẽ cố gắng nạp file `.env.[APP_ENV]` tương ứng nếu file tồn tại; nếu không, framework sẽ nạp file `.env` mặc định.

<a name="environment-variable-types"></a>
### Kiểu dữ liệu của biến môi trường

Các biến trong file `.env` thường được phân tích dưới dạng chuỗi. Vì vậy, Laravel định nghĩa một số giá trị dành riêng để hàm `env()` có thể trả về nhiều kiểu dữ liệu hơn:

<div class="overflow-auto">

| `.env` Value | `env()` Value |
| ------------ | ------------- |
| true         | (bool) true   |
| (true)       | (bool) true   |
| false        | (bool) false  |
| (false)      | (bool) false  |
| empty        | (string) ''   |
| (empty)      | (string) ''   |
| null         | (null) null   |
| (null)       | (null) null   |

</div>

Nếu cần khai báo biến môi trường có giá trị chứa khoảng trắng, hãy đặt giá trị đó trong dấu ngoặc kép:

```ini
APP_NAME="My Application"
```

<a name="retrieving-environment-configuration"></a>
### Truy xuất cấu hình môi trường

Khi ứng dụng nhận một request, tất cả biến được khai báo trong file `.env` sẽ được nạp vào superglobal `$_ENV` của PHP. Tuy nhiên, trong các file cấu hình, bạn có thể dùng hàm `env` để lấy giá trị của những biến này. Nếu xem các file cấu hình mặc định của Laravel, bạn sẽ thấy nhiều tùy chọn đã sử dụng hàm này:

```php
'debug' => (bool) env('APP_DEBUG', false),
```

Giá trị thứ hai truyền vào hàm `env` là "giá trị mặc định". Giá trị này sẽ được trả về khi không tồn tại biến môi trường tương ứng với key đã cho.

<a name="determining-the-current-environment"></a>
### Xác định môi trường hiện tại

Môi trường hiện tại của ứng dụng được xác định bởi biến `APP_ENV` trong file `.env`. Bạn có thể truy cập giá trị này thông qua phương thức `environment` trên [facade](/docs/{{version}}/facades) `App`:

```php
use Illuminate\Support\Facades\App;

$environment = App::environment();
```

Bạn cũng có thể truyền tham số vào phương thức `environment` để kiểm tra môi trường hiện tại có khớp với một giá trị cho trước hay không. Phương thức trả về `true` nếu môi trường khớp với bất kỳ giá trị nào được truyền vào:

```php
if (App::environment('local')) {
    // The environment is local
}

if (App::environment(['local', 'staging'])) {
    // The environment is either local OR staging...
}
```

> [!NOTE]
> Cơ chế xác định môi trường hiện tại của ứng dụng có thể bị ghi đè bằng cách khai báo biến môi trường `APP_ENV` ở cấp server.

<a name="encrypting-environment-files"></a>
### Mã hóa file môi trường

Không bao giờ nên lưu file môi trường chưa mã hóa trong source control. Laravel cho phép mã hóa các file môi trường để bạn có thể lưu chúng an toàn cùng với phần còn lại của source code ứng dụng.

<a name="encryption"></a>
#### Mã hóa

Để mã hóa một file môi trường, bạn có thể sử dụng lệnh `env:encrypt`:

```shell
php artisan env:encrypt
```

Khi chạy `env:encrypt`, Laravel sẽ mã hóa file `.env` và lưu nội dung đã mã hóa vào `.env.encrypted`. Khóa giải mã được hiển thị trong output của lệnh và nên được lưu trong một trình quản lý mật khẩu an toàn. Nếu muốn cung cấp khóa mã hóa của riêng mình, bạn có thể dùng tùy chọn `--key` khi gọi lệnh:

```shell
php artisan env:encrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

> [!NOTE]
> Độ dài của khóa phải phù hợp với độ dài mà thuật toán mã hóa đang sử dụng yêu cầu. Mặc định Laravel dùng `AES-256-CBC`, thuật toán này yêu cầu khóa dài 32 ký tự. Bạn có thể sử dụng bất kỳ cipher nào được hỗ trợ bởi encrypter của Laravel bằng cách truyền tùy chọn `--cipher` khi gọi lệnh.

Nếu ứng dụng có nhiều file môi trường, chẳng hạn `.env` và `.env.staging`, bạn có thể chỉ định file cần mã hóa bằng cách truyền tên môi trường qua tùy chọn `--env`:

```shell
php artisan env:encrypt --env=staging
```

<a name="readable-variable-names"></a>
#### Giữ tên biến ở dạng có thể đọc

Khi mã hóa file môi trường, bạn có thể dùng tùy chọn `--readable` để giữ tên biến ở dạng có thể đọc trong khi chỉ mã hóa giá trị của chúng:

```shell
php artisan env:encrypt --readable
```

Kết quả sẽ là một file mã hóa có định dạng như sau:

```ini
APP_NAME=eyJpdiI6...
APP_ENV=eyJpdiI6...
APP_KEY=eyJpdiI6...
APP_DEBUG=eyJpdiI6...
APP_URL=eyJpdiI6...
```

Định dạng readable cho phép bạn biết những biến môi trường nào đang tồn tại mà không làm lộ dữ liệu nhạy cảm. Cách này cũng giúp review pull request thuận tiện hơn vì có thể nhận biết biến nào được thêm, xóa hoặc đổi tên mà không cần giải mã file.

Khi giải mã file môi trường, Laravel tự động nhận biết định dạng đã được sử dụng, vì vậy lệnh `env:decrypt` không cần thêm tùy chọn nào.

> [!NOTE]
> Khi sử dụng tùy chọn `--readable`, comment và dòng trống trong file môi trường gốc sẽ không được đưa vào output đã mã hóa.

<a name="decryption"></a>
#### Giải mã

Để giải mã một file môi trường, bạn có thể dùng lệnh `env:decrypt`. Lệnh này cần khóa giải mã; Laravel sẽ lấy khóa từ biến môi trường `LARAVEL_ENV_ENCRYPTION_KEY`:

```shell
php artisan env:decrypt
```

Hoặc bạn có thể truyền trực tiếp khóa cho lệnh bằng tùy chọn `--key`:

```shell
php artisan env:decrypt --key=3UVsEgGVK36XN82KKeyLFMhvosbZN1aF
```

Khi gọi `env:decrypt`, Laravel sẽ giải mã nội dung của `.env.encrypted` và ghi nội dung đã giải mã vào file `.env`.

Bạn có thể truyền tùy chọn `--cipher` cho `env:decrypt` để sử dụng một thuật toán mã hóa tùy chỉnh:

```shell
php artisan env:decrypt --key=qUWuNRdfuImXcKxZ --cipher=AES-128-CBC
```

Nếu ứng dụng có nhiều file môi trường, chẳng hạn `.env` và `.env.staging`, bạn có thể chỉ định file cần giải mã bằng cách truyền tên môi trường qua tùy chọn `--env`:

```shell
php artisan env:decrypt --env=staging
```

Để ghi đè một file môi trường đã tồn tại, bạn có thể truyền tùy chọn `--force` cho lệnh `env:decrypt`:

```shell
php artisan env:decrypt --force
```

<a name="accessing-configuration-values"></a>
## Truy cập giá trị cấu hình

Bạn có thể dễ dàng truy cập các giá trị cấu hình từ bất kỳ đâu trong ứng dụng bằng facade `Config` hoặc hàm global `config`. Giá trị cấu hình được truy cập bằng cú pháp "dot", trong đó bao gồm tên file và tên tùy chọn cần truy cập. Bạn cũng có thể chỉ định giá trị mặc định để trả về khi tùy chọn cấu hình không tồn tại:

```php
use Illuminate\Support\Facades\Config;

$value = Config::get('app.timezone');

$value = config('app.timezone');

// Retrieve a default value if the configuration value does not exist...
$value = config('app.timezone', 'Asia/Seoul');
```

Để thiết lập giá trị cấu hình tại runtime, bạn có thể gọi phương thức `set` của facade `Config` hoặc truyền một mảng vào hàm `config`:

```php
Config::set('app.timezone', 'America/Chicago');

config(['app.timezone' => 'America/Chicago']);
```

Để hỗ trợ static analysis, facade `Config` còn cung cấp các phương thức truy xuất cấu hình có kiểu dữ liệu cụ thể. Nếu giá trị lấy được không khớp với kiểu mong đợi, một exception sẽ được ném ra:

```php
Config::string('config-key');
Config::integer('config-key');
Config::float('config-key');
Config::boolean('config-key');
Config::array('config-key');
Config::collection('config-key');
```

<a name="configuration-caching"></a>
## Cache cấu hình

Để cải thiện tốc độ ứng dụng, bạn nên cache toàn bộ file cấu hình thành một file duy nhất bằng lệnh Artisan `config:cache`. Lệnh này kết hợp tất cả tùy chọn cấu hình của ứng dụng vào một file để framework có thể nạp nhanh hơn.

Thông thường, bạn nên chạy `php artisan config:cache` như một phần của quy trình deploy production. Không nên chạy lệnh này trong quá trình phát triển local vì các tùy chọn cấu hình thường xuyên cần được thay đổi.

Sau khi cấu hình đã được cache, framework sẽ không nạp file `.env` của ứng dụng trong quá trình xử lý request hoặc chạy lệnh Artisan; do đó, hàm `env` lúc này chỉ trả về các biến môi trường bên ngoài ở cấp hệ thống.

Vì lý do đó, hãy bảo đảm rằng bạn chỉ gọi hàm `env` bên trong các file cấu hình (`config`) của ứng dụng. Các file cấu hình mặc định của Laravel cung cấp nhiều ví dụ cho cách làm này. Sau khi cấu hình đã được cache, bạn có thể truy cập các giá trị từ bất kỳ đâu trong ứng dụng bằng hàm `config` đã mô tả ở trên.

Bạn có thể dùng lệnh `config:clear` để xóa cấu hình đã cache:

```shell
php artisan config:clear
```

> [!WARNING]
> Nếu chạy `config:cache` trong quá trình deploy, hãy bảo đảm hàm `env` chỉ được gọi trong các file cấu hình. Sau khi cấu hình được cache, file `.env` sẽ không được nạp; vì vậy hàm `env` chỉ trả về các biến môi trường bên ngoài ở cấp hệ thống.

<a name="configuration-publishing"></a>
## Publish cấu hình

Hầu hết file cấu hình của Laravel đã được publish vào thư mục `config` của ứng dụng. Tuy nhiên, một số file như `cors.php` và `view.php` mặc định không được publish vì phần lớn ứng dụng không cần chỉnh sửa chúng.

Dù vậy, bạn có thể sử dụng lệnh Artisan `config:publish` để publish những file cấu hình chưa được publish mặc định:

```shell
php artisan config:publish

php artisan config:publish --all
```

<a name="debug-mode"></a>
## Chế độ debug

Tùy chọn `debug` trong file cấu hình `config/app.php` quyết định lượng thông tin về lỗi được hiển thị cho người dùng. Mặc định, tùy chọn này lấy giá trị từ biến môi trường `APP_DEBUG`, được lưu trong file `.env`.

> [!WARNING]
> Khi phát triển local, bạn nên đặt biến môi trường `APP_DEBUG` thành `true`. **Trong môi trường production, giá trị này phải luôn là `false`. Nếu đặt thành `true` trên production, bạn có nguy cơ làm lộ các giá trị cấu hình nhạy cảm cho người dùng cuối của ứng dụng.**

<a name="maintenance-mode"></a>
## Chế độ bảo trì

Khi ứng dụng ở chế độ bảo trì, một view tùy chỉnh sẽ được hiển thị cho mọi request gửi tới ứng dụng. Nhờ đó, bạn có thể dễ dàng "tạm ngưng" ứng dụng trong lúc cập nhật hoặc thực hiện bảo trì. Middleware kiểm tra chế độ bảo trì được đưa vào middleware stack mặc định của ứng dụng. Nếu ứng dụng đang ở chế độ bảo trì, Laravel sẽ ném `Symfony\Component\HttpKernel\Exception\HttpException` với mã trạng thái 503.

Để bật chế độ bảo trì, hãy chạy lệnh Artisan `down`:

```shell
php artisan down
```

Nếu muốn gửi HTTP header `Refresh` cùng mọi response trong chế độ bảo trì, bạn có thể truyền tùy chọn `refresh` khi gọi lệnh `down`. Header `Refresh` sẽ yêu cầu trình duyệt tự động tải lại trang sau số giây đã chỉ định:

```shell
php artisan down --refresh=15
```

Bạn cũng có thể truyền tùy chọn `retry` cho lệnh `down`; giá trị này sẽ được đặt làm giá trị của HTTP header `Retry-After`, mặc dù các trình duyệt thường bỏ qua header này:

```shell
php artisan down --retry=60
```

<a name="bypassing-maintenance-mode"></a>
#### Bỏ qua chế độ bảo trì

Để cho phép bỏ qua chế độ bảo trì bằng một secret token, bạn có thể dùng tùy chọn `secret` để chỉ định token:

```shell
php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"
```

Sau khi đưa ứng dụng vào chế độ bảo trì, bạn có thể truy cập URL của ứng dụng tương ứng với token này. Laravel sẽ cấp một cookie cho trình duyệt để bỏ qua chế độ bảo trì:

```shell
https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515
```

Nếu muốn Laravel tự tạo secret token, bạn có thể dùng tùy chọn `with-secret`. Secret sẽ được hiển thị sau khi ứng dụng được đưa vào chế độ bảo trì:

```shell
php artisan down --with-secret
```

Khi truy cập route ẩn này, bạn sẽ được chuyển hướng tới route `/` của ứng dụng. Sau khi cookie được cấp cho trình duyệt, bạn có thể duyệt ứng dụng bình thường như khi ứng dụng không ở chế độ bảo trì.

> [!NOTE]
> Secret của chế độ bảo trì thường chỉ nên gồm chữ cái, chữ số và tùy chọn dấu gạch ngang. Tránh sử dụng các ký tự có ý nghĩa đặc biệt trong URL như `?` hoặc `&`.

<a name="maintenance-mode-on-multiple-servers"></a>
#### Chế độ bảo trì trên nhiều server

Mặc định, Laravel xác định ứng dụng có đang ở chế độ bảo trì hay không bằng cơ chế dựa trên file. Điều này có nghĩa là để kích hoạt chế độ bảo trì, bạn phải chạy `php artisan down` trên từng server đang host ứng dụng.

Ngoài ra, Laravel cung cấp cơ chế dựa trên cache để quản lý chế độ bảo trì. Với cách này, bạn chỉ cần chạy `php artisan down` trên một server. Để sử dụng cơ chế này, hãy chỉnh các biến cấu hình maintenance mode trong file `config/app.php` của ứng dụng. Sau đó, chọn cache `store` mà tất cả server có thể truy cập. Điều này đảm bảo trạng thái maintenance mode được duy trì nhất quán trên mọi server.

```ini
APP_MAINTENANCE_DRIVER=cache
APP_MAINTENANCE_STORE=database
```

<a name="pre-rendering-the-maintenance-mode-view"></a>
#### Render trước view chế độ bảo trì

Nếu sử dụng `php artisan down` trong quá trình deploy, người dùng đôi khi vẫn có thể gặp lỗi nếu truy cập ứng dụng đúng lúc Composer dependencies hoặc các thành phần hạ tầng khác đang được cập nhật. Nguyên nhân là một phần đáng kể của Laravel framework phải khởi động để xác định ứng dụng đang ở chế độ bảo trì và render view tương ứng bằng templating engine.

Vì vậy, Laravel cho phép render trước một maintenance mode view để trả về ngay từ đầu request lifecycle. View này được render trước khi bất kỳ dependency nào của ứng dụng được nạp. Bạn có thể render trước template mong muốn bằng tùy chọn `render` của lệnh `down`:

```shell
php artisan down --render="errors::503"
```

<a name="redirecting-maintenance-mode-requests"></a>
#### Chuyển hướng request trong chế độ bảo trì

Trong chế độ bảo trì, Laravel sẽ hiển thị maintenance mode view cho mọi URL mà người dùng cố gắng truy cập. Nếu muốn, bạn có thể yêu cầu Laravel chuyển hướng tất cả request tới một URL cụ thể bằng tùy chọn `redirect`. Ví dụ, bạn có thể chuyển hướng toàn bộ request tới URI `/`:

```shell
php artisan down --redirect=/
```

<a name="disabling-maintenance-mode"></a>
#### Tắt chế độ bảo trì

Để tắt chế độ bảo trì, hãy sử dụng lệnh `up`:

```shell
php artisan up
```

> [!NOTE]
> Bạn có thể tùy chỉnh template mặc định của chế độ bảo trì bằng cách tạo template riêng tại `resources/views/errors/503.blade.php`.

<a name="maintenance-mode-queues"></a>
#### Chế độ bảo trì và Queue

Khi ứng dụng đang ở chế độ bảo trì, không có [queued job](/docs/{{version}}/queues) nào được xử lý. Các job sẽ tiếp tục được xử lý bình thường sau khi ứng dụng thoát khỏi chế độ bảo trì.

<a name="alternatives-to-maintenance-mode"></a>
#### Giải pháp thay thế chế độ bảo trì

Vì chế độ bảo trì khiến ứng dụng phải ngừng hoạt động trong vài giây, bạn có thể cân nhắc chạy ứng dụng trên một nền tảng được quản lý toàn diện như [Laravel Cloud](https://cloud.laravel.com) để triển khai zero-downtime với Laravel.

---

## Tài liệu chính thức

- [Laravel 13.x — configuration](https://laravel.com/docs/13.x/configuration)
