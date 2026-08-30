# Laravel Valet

<a name="introduction"></a>
## Giới thiệu

> [!NOTE]
> Bạn đang tìm một cách còn dễ hơn để phát triển ứng dụng Laravel trên macOS hoặc Windows? Hãy xem [Laravel Herd](https://herd.laravel.com). Herd bao gồm mọi thứ bạn cần để bắt đầu phát triển Laravel, bao gồm Valet, PHP và Composer.

[Laravel Valet](https://github.com/laravel/valet) là môi trường phát triển dành cho những người dùng macOS yêu thích sự tối giản. Laravel Valet cấu hình máy Mac của bạn để luôn chạy [Nginx](https://www.nginx.com/) ở chế độ nền khi máy khởi động. Sau đó, bằng [DnsMasq](https://en.wikipedia.org/wiki/Dnsmasq), Valet proxy mọi request trên domain `*.test` tới các site được cài đặt trên máy local của bạn.

Nói cách khác, Valet là một môi trường phát triển Laravel cực kỳ nhanh, chỉ sử dụng khoảng 7 MB RAM. Valet không thay thế hoàn toàn [Sail](/sail) hoặc [Homestead](/homestead), nhưng là một lựa chọn thay thế tuyệt vời nếu bạn cần những thành phần cơ bản linh hoạt, ưu tiên tốc độ tối đa hoặc đang làm việc trên máy có lượng RAM hạn chế.

Ngay khi cài đặt, Valet hỗ trợ nhiều nền tảng, bao gồm nhưng không giới hạn ở:

<style>
    #valet-support > ul {
        column-count: 3; -moz-column-count: 3; -webkit-column-count: 3;
        line-height: 1.9;
    }
</style>

<div id="valet-support" markdown="1">

- [Laravel](https://laravel.com)
- [Bedrock](https://roots.io/bedrock/)
- [CakePHP 3](https://cakephp.org)
- [ConcreteCMS](https://www.concretecms.com/)
- [Contao](https://contao.org/en/)
- [Craft](https://craftcms.com)
- [Drupal](https://www.drupal.org/)
- [ExpressionEngine](https://www.expressionengine.com/)
- [Jigsaw](https://jigsaw.tighten.co)
- [Joomla](https://www.joomla.org/)
- [Katana](https://github.com/themsaid/katana)
- [Kirby](https://getkirby.com/)
- [Magento](https://magento.com/)
- [OctoberCMS](https://octobercms.com/)
- [Sculpin](https://sculpin.io/)
- [Slim](https://www.slimframework.com)
- [Statamic](https://statamic.com)
- Static HTML
- [Symfony](https://symfony.com)
- [WordPress](https://wordpress.org)
- [Zend](https://framework.zend.com)

</div>

Tuy nhiên, bạn có thể mở rộng Valet bằng các [driver tùy chỉnh](#custom-valet-drivers) của riêng mình.

<a name="installation"></a>
## Cài đặt

> [!WARNING]
> Valet yêu cầu macOS và [Homebrew](https://brew.sh/). Trước khi cài đặt, bạn nên đảm bảo không có chương trình nào khác như Apache hoặc Nginx đang bind vào cổng 80 trên máy local.

Để bắt đầu, trước tiên bạn cần đảm bảo Homebrew đã được cập nhật bằng lệnh `update`:

```shell
brew update
```

Tiếp theo, bạn nên sử dụng Homebrew để cài đặt PHP:

```shell
brew install php
```

Sau khi cài đặt PHP, bạn đã sẵn sàng cài đặt [trình quản lý package Composer](https://getcomposer.org). Ngoài ra, bạn nên đảm bảo thư mục `$HOME/.composer/vendor/bin` nằm trong `PATH` của hệ thống. Sau khi Composer được cài đặt, bạn có thể cài Laravel Valet dưới dạng một Composer package global:

```shell
composer global require laravel/valet
```

Cuối cùng, bạn có thể thực thi lệnh `install` của Valet. Lệnh này sẽ cấu hình và cài đặt Valet cùng DnsMasq. Ngoài ra, các daemon mà Valet phụ thuộc vào sẽ được cấu hình để khởi chạy khi hệ thống của bạn khởi động:

```shell
valet install
```

Sau khi Valet được cài đặt, hãy thử ping một domain `*.test` bất kỳ trong terminal bằng lệnh như `ping foobar.test`. Nếu Valet được cài đặt đúng, bạn sẽ thấy domain này phản hồi tại `127.0.0.1`.

Valet sẽ tự động khởi động các service cần thiết mỗi khi máy của bạn khởi động.

<a name="php-versions"></a>
#### Phiên bản PHP

> [!NOTE]
> Thay vì thay đổi phiên bản PHP global, bạn có thể yêu cầu Valet sử dụng phiên bản PHP riêng cho từng site thông qua [lệnh](#per-site-php-versions) `isolate`.

Valet cho phép bạn chuyển đổi phiên bản PHP bằng lệnh `valet use php@version`. Valet sẽ cài phiên bản PHP được chỉ định thông qua Homebrew nếu phiên bản đó chưa được cài đặt:

```shell
valet use php@8.2

valet use php
```

Bạn cũng có thể tạo file `.valetrc` tại thư mục gốc của project. File `.valetrc` nên chứa phiên bản PHP mà site sẽ sử dụng:

```shell
php=php@8.2
```

Sau khi file này được tạo, bạn chỉ cần thực thi lệnh `valet use`; lệnh sẽ đọc file để xác định phiên bản PHP mà site ưu tiên sử dụng.

> [!WARNING]
> Valet chỉ phục vụ một phiên bản PHP tại một thời điểm, ngay cả khi bạn đã cài đặt nhiều phiên bản PHP.

<a name="database"></a>
#### Cơ sở dữ liệu

Nếu ứng dụng của bạn cần cơ sở dữ liệu, hãy xem [DBngin](https://dbngin.com), một công cụ quản lý cơ sở dữ liệu miễn phí, tất cả trong một, bao gồm MySQL, PostgreSQL và Redis. Sau khi cài đặt DBngin, bạn có thể kết nối tới cơ sở dữ liệu tại `127.0.0.1` bằng username `root` và password là chuỗi rỗng.

<a name="resetting-your-installation"></a>
#### Đặt lại cài đặt

Nếu gặp vấn đề khiến Valet không hoạt động đúng, việc thực thi `composer global require laravel/valet` rồi `valet install` sẽ đặt lại cài đặt và có thể giải quyết nhiều loại sự cố. Trong một số trường hợp hiếm gặp, bạn có thể cần "hard reset" Valet bằng cách chạy `valet uninstall --force`, sau đó chạy `valet install`.

<a name="upgrading-valet"></a>
### Nâng cấp Valet

Bạn có thể cập nhật Valet bằng cách thực thi lệnh `composer global require laravel/valet` trong terminal. Sau khi nâng cấp, bạn nên chạy `valet install` để Valet có thể thực hiện thêm các nâng cấp cần thiết cho những file cấu hình của bạn.

<a name="upgrading-to-valet-4"></a>
#### Nâng cấp lên Valet 4

Nếu đang nâng cấp từ Valet 3 lên Valet 4, hãy thực hiện các bước sau để nâng cấp Valet đúng cách:

<div class="content-list" markdown="1">

- Nếu bạn đã thêm các file `.valetphprc` để tùy chỉnh phiên bản PHP của site, hãy đổi tên từng file `.valetphprc` thành `.valetrc`. Sau đó, thêm `php=` vào đầu nội dung hiện có của file `.valetrc`.
- Cập nhật mọi custom driver để khớp namespace, extension, type-hint và return type-hint của hệ thống driver mới. Bạn có thể tham khảo [SampleValetDriver](https://github.com/laravel/valet/blob/d7787c025e60abc24a5195dc7d4c5c6f2d984339/cli/stubs/SampleValetDriver.php) của Valet làm ví dụ.
- Nếu sử dụng PHP 7.1 - 7.4 để phục vụ các site, hãy đảm bảo bạn vẫn dùng Homebrew để cài PHP 8.0 trở lên, vì Valet sẽ dùng phiên bản này để chạy một số script, ngay cả khi đó không phải phiên bản được link chính của bạn.

</div>

<a name="serving-sites"></a>
## Phục vụ các site

Sau khi Valet được cài đặt, bạn đã sẵn sàng phục vụ các ứng dụng Laravel. Valet cung cấp hai lệnh giúp bạn phục vụ ứng dụng: `park` và `link`.

<a name="the-park-command"></a>
### Lệnh `park`

Lệnh `park` đăng ký một thư mục trên máy chứa các ứng dụng của bạn. Sau khi thư mục được "park" với Valet, tất cả thư mục con bên trong sẽ có thể truy cập từ trình duyệt tại `http://<directory-name>.test`:

```shell
cd ~/Sites

valet park
```

Chỉ vậy là xong. Từ giờ, mọi ứng dụng bạn tạo trong thư mục đã "park" sẽ tự động được phục vụ theo quy ước `http://<directory-name>.test`. Ví dụ, nếu thư mục đã park chứa thư mục tên "laravel", ứng dụng trong đó sẽ có thể truy cập tại `http://laravel.test`. Ngoài ra, Valet tự động cho phép truy cập site bằng wildcard subdomain (`http://foo.laravel.test`).

<a name="the-link-command"></a>
### Lệnh `link`

Lệnh `link` cũng có thể được dùng để phục vụ ứng dụng Laravel. Lệnh này hữu ích khi bạn muốn phục vụ một site riêng lẻ trong một thư mục thay vì toàn bộ thư mục:

```shell
cd ~/Sites/laravel

valet link
```

Sau khi ứng dụng được link với Valet bằng lệnh `link`, bạn có thể truy cập ứng dụng bằng tên thư mục của nó. Vì vậy, site được link trong ví dụ trên có thể truy cập tại `http://laravel.test`. Ngoài ra, Valet tự động cho phép bạn truy cập site bằng wildcard subdomain (`http://foo.laravel.test`).

Nếu muốn phục vụ ứng dụng bằng hostname khác, bạn có thể truyền hostname vào lệnh `link`. Ví dụ, bạn có thể chạy lệnh sau để ứng dụng khả dụng tại `http://application.test`:

```shell
cd ~/Sites/laravel

valet link application
```

Dĩ nhiên, bạn cũng có thể phục vụ ứng dụng trên subdomain bằng lệnh `link`:

```shell
valet link api.application
```

Bạn có thể thực thi lệnh `links` để hiển thị danh sách tất cả thư mục đã được link:

```shell
valet links
```

Lệnh `unlink` có thể được dùng để xóa symbolic link của một site:

```shell
cd ~/Sites/laravel

valet unlink
```

<a name="securing-sites"></a>
### Bảo mật site bằng TLS

Mặc định, Valet phục vụ site qua HTTP. Tuy nhiên, nếu muốn phục vụ site qua TLS được mã hóa bằng HTTP/2, bạn có thể dùng lệnh `secure`. Ví dụ, nếu site đang được Valet phục vụ trên domain `laravel.test`, bạn nên chạy lệnh sau để bảo mật site:

```shell
valet secure laravel
```

Để bỏ chế độ bảo mật của một site và quay lại phục vụ traffic qua HTTP thông thường, hãy dùng lệnh `unsecure`. Tương tự `secure`, lệnh này nhận hostname của site bạn muốn bỏ bảo mật:

```shell
valet unsecure laravel
```

<a name="serving-a-default-site"></a>
### Phục vụ site mặc định

Đôi khi, bạn có thể muốn cấu hình Valet phục vụ một site "mặc định" thay vì trả về `404` khi truy cập một domain `test` không xác định. Để làm điều này, hãy thêm option `default` vào file cấu hình `~/.config/valet/config.json`, với giá trị là đường dẫn tới site sẽ được dùng làm site mặc định:

    "default": "/Users/Sally/Sites/example-site",

<a name="per-site-php-versions"></a>
### Phiên bản PHP theo từng site

Mặc định, Valet sử dụng bản PHP global để phục vụ các site. Tuy nhiên, nếu cần hỗ trợ nhiều phiên bản PHP trên các site khác nhau, bạn có thể dùng lệnh `isolate` để chỉ định phiên bản PHP cho một site cụ thể. Lệnh `isolate` cấu hình Valet sử dụng phiên bản PHP được chỉ định cho site nằm trong thư mục làm việc hiện tại:

```shell
cd ~/Sites/example-site

valet isolate php@8.0
```

Nếu tên site không trùng với tên thư mục chứa nó, bạn có thể chỉ định tên site bằng option `--site`:

```shell
valet isolate php@8.0 --site="site-name"
```

Để thuận tiện, bạn có thể dùng các lệnh `valet php`, `composer` và `which-php` để proxy lời gọi tới PHP CLI hoặc công cụ phù hợp dựa trên phiên bản PHP đã cấu hình cho site:

```shell
valet php
valet composer
valet which-php
```

Bạn có thể chạy lệnh `isolated` để hiển thị danh sách tất cả các site đang được isolate cùng phiên bản PHP tương ứng:

```shell
valet isolated
```

Để đưa một site trở lại phiên bản PHP được cài đặt toàn cục của Valet, bạn có thể chạy lệnh `unisolate` từ thư mục gốc của site:

```shell
valet unisolate
```

<a name="sharing-sites"></a>
## Chia sẻ site

Valet cung cấp lệnh để chia sẻ các site cục bộ ra Internet, giúp bạn dễ dàng kiểm thử site trên thiết bị di động hoặc chia sẻ với thành viên trong nhóm và khách hàng.

Mặc định, Valet hỗ trợ chia sẻ site thông qua ngrok hoặc Expose. Trước khi chia sẻ một site, bạn nên cập nhật cấu hình Valet bằng lệnh `share-tool`, chỉ định `ngrok`, `expose` hoặc `cloudflared`:

```shell
valet share-tool ngrok
```

Nếu bạn chọn một công cụ nhưng chưa cài đặt nó qua Homebrew (đối với ngrok và cloudflared) hoặc Composer (đối với Expose), Valet sẽ tự động nhắc bạn cài đặt. Các công cụ này yêu cầu bạn xác thực tài khoản tương ứng trước khi có thể bắt đầu chia sẻ site.

Để chia sẻ một site, hãy chuyển đến thư mục của site trong terminal và chạy lệnh `share` của Valet. Một URL có thể truy cập công khai sẽ được sao chép vào clipboard để bạn dán trực tiếp vào trình duyệt hoặc chia sẻ với nhóm:

```shell
cd ~/Sites/laravel

valet share
```

Để dừng chia sẻ site, bạn có thể nhấn `Control + C`.

> [!WARNING]
> Nếu bạn đang dùng DNS server tùy chỉnh (như `1.1.1.1`), việc chia sẻ qua ngrok có thể không hoạt động chính xác. Trong trường hợp đó, hãy mở cài đặt hệ thống của Mac, vào Network, mở Advanced, chuyển đến tab DNS và thêm `127.0.0.1` làm DNS server đầu tiên.

<a name="sharing-sites-via-ngrok"></a>
#### Chia sẻ site via Ngrok

Để chia sẻ site bằng ngrok, bạn cần [tạo tài khoản ngrok](https://dashboard.ngrok.com/signup) và [thiết lập authentication token](https://dashboard.ngrok.com/get-started/your-authtoken). Sau khi có token, bạn có thể cập nhật cấu hình Valet bằng token đó:

```shell
valet set-ngrok-token YOUR_TOKEN_HERE
```

> [!NOTE]
> Bạn có thể truyền thêm các tham số ngrok cho lệnh share, chẳng hạn `valet share --region=eu`. Để biết thêm thông tin, hãy tham khảo [tài liệu ngrok](https://ngrok.com/docs).

<a name="sharing-sites-via-expose"></a>
#### Chia sẻ site via Expose

Để chia sẻ site bằng Expose, bạn cần [tạo tài khoản Expose](https://expose.dev/register) và [xác thực với Expose bằng authentication token](https://expose.dev/docs/getting-started/getting-your-token).

Bạn có thể tham khảo [tài liệu Expose](https://expose.dev/docs) để biết thêm về các tham số dòng lệnh mà công cụ hỗ trợ.

<a name="sharing-sites-on-your-local-network"></a>
### Chia sẻ site trong mạng cục bộ

Mặc định, Valet giới hạn lưu lượng truy cập đến ở interface nội bộ `127.0.0.1` để máy phát triển của bạn không bị phơi bày trước các rủi ro bảo mật từ Internet.

Nếu muốn cho phép các thiết bị khác trong mạng cục bộ truy cập các site Valet trên máy thông qua địa chỉ IP của máy (ví dụ `192.168.1.10/application.test`), bạn cần chỉnh sửa thủ công file cấu hình Nginx tương ứng của site để bỏ giới hạn trên directive `listen`. Hãy xóa tiền tố `127.0.0.1:` khỏi directive `listen` cho các cổng 80 và 443.

Nếu chưa chạy `valet secure` cho project, bạn có thể mở quyền truy cập mạng cho tất cả site không dùng HTTPS bằng cách chỉnh sửa file `/usr/local/etc/nginx/valet/valet.conf`. Tuy nhiên, nếu site đang được phục vụ qua HTTPS (đã chạy `valet secure`), bạn nên chỉnh sửa file `~/.config/valet/Nginx/app-name.test`.

Sau khi cập nhật cấu hình Nginx, hãy chạy lệnh `valet restart` để áp dụng các thay đổi.

<a name="site-specific-environment-variables"></a>
## Biến môi trường riêng cho từng site

Một số ứng dụng sử dụng framework khác có thể phụ thuộc vào biến môi trường của server nhưng không cung cấp cách cấu hình các biến đó bên trong project. Valet cho phép cấu hình biến môi trường riêng cho từng site bằng cách thêm file `.valet-env.php` vào thư mục gốc của project. File này phải trả về một mảng các cặp site / biến môi trường; các giá trị này sẽ được thêm vào mảng toàn cục `$_SERVER` cho từng site được chỉ định:

```php
<?php

return [
    // Set $_SERVER['key'] to "value" for the laravel.test site...
    'laravel' => [
        'key' => 'value',
    ],

    // Set $_SERVER['key'] to "value" for all sites...
    '*' => [
        'key' => 'value',
    ],
];
```

<a name="proxying-services"></a>
## Proxy dịch vụ

Đôi khi bạn có thể muốn proxy một domain Valet đến một dịch vụ khác trên máy cục bộ. Ví dụ, bạn có thể cần chạy Valet đồng thời với một site riêng trong Docker; tuy nhiên Valet và Docker không thể cùng bind vào cổng 80.

Để giải quyết vấn đề này, bạn có thể dùng lệnh `proxy` để tạo proxy. Ví dụ, bạn có thể proxy toàn bộ traffic từ `http://elasticsearch.test` đến `http://127.0.0.1:9200`:

```shell
# Proxy over HTTP...
valet proxy elasticsearch http://127.0.0.1:9200

# Proxy over TLS + HTTP/2...
valet proxy elasticsearch http://127.0.0.1:9200 --secure
```

Bạn có thể xóa proxy bằng lệnh `unproxy`:

```shell
valet unproxy elasticsearch
```

Bạn có thể dùng lệnh `proxies` để liệt kê tất cả cấu hình site đang được proxy:

```shell
valet proxies
```

<a name="custom-valet-drivers"></a>
## Driver Valet tùy chỉnh

Bạn có thể tự viết "driver" Valet để phục vụ các ứng dụng PHP chạy trên framework hoặc CMS mà Valet không hỗ trợ sẵn. Khi cài Valet, thư mục `~/.config/valet/Drivers` được tạo cùng file `SampleValetDriver.php`. File này chứa một implementation mẫu minh họa cách viết driver tùy chỉnh. Để viết driver, bạn chỉ cần triển khai ba phương thức: `serves`, `isStaticFile` và `frontControllerPath`.

Cả ba phương thức đều nhận các giá trị `$sitePath`, `$siteName` và `$uri` làm tham số. `$sitePath` là đường dẫn đầy đủ đến site đang được phục vụ trên máy, chẳng hạn `/Users/Lisa/Sites/my-project`. `$siteName` là phần "host" / "site name" của domain (`my-project`). `$uri` là URI của request đến (`/foo/bar`).

Sau khi hoàn thành driver Valet tùy chỉnh, hãy đặt nó trong thư mục `~/.config/valet/Drivers` theo quy ước đặt tên `FrameworkValetDriver.php`. Ví dụ, nếu viết driver tùy chỉnh cho WordPress, tên file nên là `WordPressValetDriver.php`.

Hãy xem implementation mẫu cho từng phương thức mà driver Valet tùy chỉnh cần triển khai.

<a name="the-serves-method"></a>
#### Phương thức `serves`

Phương thức `serves` phải trả về `true` nếu driver cần xử lý request đến. Ngược lại, phương thức phải trả về `false`. Vì vậy, trong phương thức này, bạn nên xác định xem `$sitePath` được cung cấp có chứa loại project mà driver cần phục vụ hay không.

Ví dụ, giả sử chúng ta đang viết `WordPressValetDriver`. Phương thức `serves` có thể trông như sau:

```php
/**
 * Determine if the driver serves the request.
 */
public function serves(string $sitePath, string $siteName, string $uri): bool
{
    return is_dir($sitePath.'/wp-admin');
}
```

<a name="the-isstaticfile-method"></a>
#### Phương thức `isStaticFile`

Phương thức `isStaticFile` phải xác định request đến có yêu cầu một file "static", chẳng hạn hình ảnh hoặc stylesheet, hay không. Nếu là file static, phương thức phải trả về đường dẫn đầy đủ đến file trên ổ đĩa. Nếu request không dành cho file static, phương thức phải trả về `false`:

```php
/**
 * Determine if the incoming request is for a static file.
 *
 * @return string|false
 */
public function isStaticFile(string $sitePath, string $siteName, string $uri)
{
    if (file_exists($staticFilePath = $sitePath.'/public/'.$uri)) {
        return $staticFilePath;
    }

    return false;
}
```

> [!WARNING]
> Phương thức `isStaticFile` chỉ được gọi nếu `serves` trả về `true` cho request đến và URI của request không phải `/`.

<a name="the-frontcontrollerpath-method"></a>
#### Phương thức `frontControllerPath`

Phương thức `frontControllerPath` phải trả về đường dẫn đầy đủ đến "front controller" của ứng dụng, thường là file `index.php` hoặc tương đương:

```php
/**
 * Get the fully resolved path to the application's front controller.
 */
public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
{
    return $sitePath.'/public/index.php';
}
```

<a name="local-drivers"></a>
### Driver cục bộ

Nếu muốn định nghĩa driver Valet tùy chỉnh cho một ứng dụng duy nhất, hãy tạo file `LocalValetDriver.php` trong thư mục gốc của ứng dụng. Driver tùy chỉnh có thể kế thừa class cơ sở `ValetDriver` hoặc một driver dành riêng cho ứng dụng đã có như `LaravelValetDriver`:

```php
use Valet\Drivers\LaravelValetDriver;

class LocalValetDriver extends LaravelValetDriver
{
    /**
     * Determine if the driver serves the request.
     */
    public function serves(string $sitePath, string $siteName, string $uri): bool
    {
        return true;
    }

    /**
     * Get the fully resolved path to the application's front controller.
     */
    public function frontControllerPath(string $sitePath, string $siteName, string $uri): string
    {
        return $sitePath.'/public_html/index.php';
    }
}
```

<a name="other-valet-commands"></a>
## Các lệnh Valet khác

<div class="overflow-auto">

| Command | Description |
| --- | --- |
| `valet list` | Hiển thị danh sách tất cả lệnh Valet. |
| `valet diagnose` | Xuất thông tin chẩn đoán để hỗ trợ debug Valet. |
| `valet directory-listing` | Xác định hành vi liệt kê thư mục. Mặc định là "off", khi đó thư mục sẽ trả về trang 404. |
| `valet forget` | Chạy lệnh này từ một thư mục đã "park" để xóa nó khỏi danh sách thư mục đã park. |
| `valet log` | Xem danh sách log được các dịch vụ của Valet ghi lại. |
| `valet paths` | Xem tất cả đường dẫn đã "park". |
| `valet restart` | Khởi động lại các daemon Valet. |
| `valet start` | Khởi động các daemon Valet. |
| `valet stop` | Dừng các daemon Valet. |
| `valet trust` | Thêm file sudoers cho Brew và Valet để chạy các lệnh Valet mà không cần nhập mật khẩu. |
| `valet uninstall` | Gỡ cài đặt Valet: hiển thị hướng dẫn gỡ thủ công. Truyền tùy chọn `--force` để xóa toàn bộ tài nguyên Valet một cách triệt để. |

</div>

<a name="valet-directories-and-files"></a>
## Thư mục và file của Valet

Thông tin về các thư mục và file sau có thể hữu ích khi bạn xử lý sự cố với môi trường Valet:

#### `~/.config/valet`

Chứa toàn bộ cấu hình của Valet. Bạn có thể muốn duy trì một bản sao lưu của thư mục này.

#### `~/.config/valet/dnsmasq.d/`

Thư mục này chứa cấu hình của DNSMasq.

#### `~/.config/valet/Drivers/`

Thư mục này chứa các driver của Valet. Driver quyết định cách một framework / CMS cụ thể được phục vụ.

#### `~/.config/valet/Nginx/`

Thư mục này chứa toàn bộ cấu hình site Nginx của Valet. Các file này được tạo lại khi chạy các lệnh `install` và `secure`.

#### `~/.config/valet/Sites/`

Thư mục này chứa toàn bộ symbolic link cho các [project đã link](#the-link-command).

#### `~/.config/valet/config.json`

Đây là file cấu hình chính của Valet.

#### `~/.config/valet/valet.sock`

Đây là PHP-FPM socket được bản cài đặt Nginx của Valet sử dụng. File này chỉ tồn tại khi PHP đang chạy đúng cách.

#### `~/.config/valet/Log/fpm-php.www.log`

Đây là log cấp người dùng cho các lỗi PHP.

#### `~/.config/valet/Log/nginx-error.log`

Đây là log cấp người dùng cho các lỗi Nginx.

#### `/usr/local/var/log/php-fpm.log`

Đây là log hệ thống cho các lỗi PHP-FPM.

#### `/usr/local/var/log/nginx`

Thư mục này chứa access log và error log của Nginx.

#### `/usr/local/etc/php/X.X/conf.d`

Thư mục này chứa các file `*.ini` cho nhiều thiết lập cấu hình PHP.

#### `/usr/local/etc/php/X.X/php-fpm.d/valet-fpm.conf`

Đây là file cấu hình pool PHP-FPM.

#### `~/.composer/vendor/laravel/valet/cli/stubs/secure.valet.conf`

Đây là cấu hình Nginx mặc định được dùng khi tạo chứng chỉ SSL cho các site.

<a name="disk-access"></a>
### Quyền truy cập ổ đĩa

Kể từ macOS 10.14, [quyền truy cập một số file và thư mục bị giới hạn theo mặc định](https://manuals.info.apple.com/MANUALS/1000/MA1902/en_US/apple-platform-security-guide.pdf). Các giới hạn này bao gồm thư mục Desktop, Documents và Downloads. Ngoài ra, quyền truy cập network volume và removable volume cũng bị hạn chế. Vì vậy, Valet khuyến nghị đặt thư mục site bên ngoài các vị trí được bảo vệ này.

Tuy nhiên, nếu muốn phục vụ site từ một trong các vị trí đó, bạn cần cấp cho Nginx quyền "Full Disk Access". Nếu không, bạn có thể gặp lỗi server hoặc hành vi khó dự đoán từ Nginx, đặc biệt khi phục vụ static asset. Thông thường macOS sẽ tự động yêu cầu bạn cấp quyền truy cập đầy đủ cho Nginx. Bạn cũng có thể thực hiện thủ công qua `System Preferences` > `Security & Privacy` > `Privacy`, chọn `Full Disk Access`, sau đó bật các mục `nginx` trong cửa sổ chính.
