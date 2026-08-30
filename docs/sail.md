# Laravel Sail

<a name="introduction"></a>
## Giới thiệu

[Laravel Sail](https://github.com/laravel/sail) là giao diện dòng lệnh gọn nhẹ để làm việc với môi trường phát triển Docker mặc định của Laravel. Sail cung cấp điểm khởi đầu thuận tiện để xây dựng ứng dụng Laravel bằng PHP, MySQL và Redis mà không yêu cầu bạn phải có kinh nghiệm Docker từ trước.

Về bản chất, Sail gồm file `compose.yaml` và script `sail` được lưu tại thư mục gốc của project. Script `sail` cung cấp CLI với các lệnh thuận tiện để tương tác với những Docker container được định nghĩa trong file `compose.yaml`.

Laravel Sail hỗ trợ macOS, Linux và Windows (thông qua [WSL2](https://docs.microsoft.com/en-us/windows/wsl/about)).

<a name="installation"></a>
## Cài đặt và thiết lập

Bạn có thể cài đặt Sail bằng Composer:

```shell
composer require laravel/sail --dev
```

Sau khi cài đặt Sail, bạn có thể chạy lệnh Artisan `sail:install`. Lệnh này sẽ publish file `compose.yaml` của Sail vào thư mục gốc của ứng dụng và cập nhật file `.env` với các biến môi trường cần thiết để kết nối tới các dịch vụ Docker:

```shell
php artisan sail:install
```

Cuối cùng, bạn có thể khởi động Sail. Để tìm hiểu thêm cách sử dụng Sail, hãy tiếp tục đọc các phần còn lại của tài liệu này:

```shell
./vendor/bin/sail up
```

> [!WARNING]
> Nếu sử dụng Docker Desktop trên Linux, bạn nên dùng Docker context `default` bằng cách chạy lệnh: `docker context use default`. Ngoài ra, nếu gặp lỗi quyền truy cập file bên trong container, bạn có thể cần đặt biến môi trường `SUPERVISOR_PHP_USER` thành `root`.

<a name="adding-additional-services"></a>
#### Thêm dịch vụ bổ sung

Nếu muốn thêm một dịch vụ vào cài đặt Sail hiện có, bạn có thể chạy lệnh Artisan `sail:add`:

```shell
php artisan sail:add
```

<a name="using-devcontainers"></a>
#### Sử dụng Devcontainer

Nếu muốn phát triển bên trong [Devcontainer](https://code.visualstudio.com/docs/remote/containers), bạn có thể truyền tùy chọn `--devcontainer` cho lệnh `sail:install`. Tùy chọn này yêu cầu `sail:install` publish file `.devcontainer/devcontainer.json` mặc định vào thư mục gốc của ứng dụng:

```shell
php artisan sail:install --devcontainer
```

<a name="rebuilding-sail-images"></a>
### Build lại image của Sail

Đôi khi bạn có thể muốn build lại hoàn toàn các image của Sail để bảo đảm mọi package và phần mềm trong image đều được cập nhật. Bạn có thể thực hiện bằng lệnh `build`:

```shell
docker compose down -v

sail build --no-cache

sail up
```

<a name="configuring-a-shell-alias"></a>
### Cấu hình alias cho shell

Theo mặc định, các lệnh Sail được gọi thông qua script `vendor/bin/sail` có sẵn trong mọi ứng dụng Laravel mới:

```shell
./vendor/bin/sail up
```

Tuy nhiên, thay vì phải nhập `vendor/bin/sail` mỗi lần chạy lệnh Sail, bạn có thể cấu hình một shell alias để thực thi các lệnh Sail thuận tiện hơn:

```shell
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
```

Để alias luôn khả dụng, bạn có thể thêm cấu hình này vào file cấu hình shell trong thư mục home, chẳng hạn `~/.zshrc` hoặc `~/.bashrc`, sau đó khởi động lại shell.

Sau khi cấu hình shell alias, bạn chỉ cần nhập `sail` để thực thi lệnh. Các ví dụ còn lại trong tài liệu này giả định rằng bạn đã cấu hình alias này:

```shell
sail up
```

<a name="starting-and-stopping-sail"></a>
## Khởi động và dừng Sail

File `compose.yaml` của Laravel Sail định nghĩa nhiều Docker container phối hợp với nhau để hỗ trợ phát triển ứng dụng Laravel. Mỗi container là một mục trong cấu hình `services` của file `compose.yaml`. Container `laravel.test` là container ứng dụng chính, chịu trách nhiệm phục vụ ứng dụng của bạn.

Trước khi khởi động Sail, hãy bảo đảm không có web server hoặc database khác đang chạy trên máy local. Để khởi động tất cả Docker container được định nghĩa trong `compose.yaml`, hãy chạy lệnh `up`:

```shell
sail up
```

Để chạy tất cả Docker container ở chế độ nền, bạn có thể khởi động Sail ở chế độ "detached":

```shell
sail up -d
```

Sau khi các container của ứng dụng đã khởi động, bạn có thể truy cập project trên trình duyệt tại: http://localhost.

Để dừng tất cả container, bạn có thể nhấn Control + C. Nếu các container đang chạy nền, hãy sử dụng lệnh `stop`:

```shell
sail stop
```

<a name="executing-sail-commands"></a>
## Thực thi lệnh

Khi sử dụng Laravel Sail, ứng dụng chạy bên trong Docker container và được cô lập khỏi máy local. Tuy nhiên, Sail cung cấp cách thuận tiện để chạy nhiều loại lệnh cho ứng dụng, bao gồm lệnh PHP tùy ý, Artisan, Composer và Node / NPM.

**Khi đọc tài liệu Laravel, bạn thường thấy các lệnh Composer, Artisan và Node / NPM không nhắc đến Sail.** Các ví dụ đó giả định những công cụ này đã được cài trên máy local. Nếu dùng Sail làm môi trường phát triển Laravel local, bạn nên thực thi các lệnh đó thông qua Sail:

```shell
# Running Artisan commands locally...
php artisan queue:work

# Running Artisan commands within Laravel Sail...
sail artisan queue:work
```

<a name="executing-php-commands"></a>
### Thực thi lệnh PHP

Bạn có thể thực thi lệnh PHP bằng lệnh `php`. Các lệnh này sẽ chạy bằng phiên bản PHP được cấu hình cho ứng dụng. Để tìm hiểu các phiên bản PHP mà Laravel Sail hỗ trợ, hãy xem [tài liệu về phiên bản PHP](#sail-php-versions):

```shell
sail php --version

sail php script.php
```

<a name="executing-composer-commands"></a>
### Thực thi lệnh Composer

Bạn có thể thực thi lệnh Composer bằng lệnh `composer`. Container ứng dụng của Laravel Sail đã cài sẵn Composer:

```shell
sail composer require laravel/sanctum
```

<a name="executing-artisan-commands"></a>
### Thực thi lệnh Artisan

Bạn có thể thực thi các lệnh Laravel Artisan bằng lệnh `artisan`:

```shell
sail artisan queue:work
```

<a name="executing-node-npm-commands"></a>
### Thực thi lệnh Node / NPM

Bạn có thể thực thi lệnh Node bằng `node`, còn lệnh NPM bằng `npm`:

```shell
sail node --version

sail npm run dev
```

Nếu muốn, bạn có thể sử dụng Yarn thay cho NPM:

```shell
sail yarn
```

<a name="interacting-with-sail-databases"></a>
## Làm việc với cơ sở dữ liệu

<a name="mysql"></a>
### MySQL

Như bạn có thể thấy, file `compose.yaml` của ứng dụng chứa một service cho MySQL container. Container này sử dụng [Docker volume](https://docs.docker.com/storage/volumes/) để dữ liệu trong database vẫn được lưu giữ ngay cả khi bạn dừng rồi khởi động lại container.

Ngoài ra, trong lần khởi động đầu tiên, MySQL container sẽ tạo hai database. Database thứ nhất có tên lấy từ biến môi trường `DB_DATABASE` và được dùng cho phát triển local. Database thứ hai có tên `testing`, dành riêng cho test để bảo đảm dữ liệu test không ảnh hưởng đến dữ liệu phát triển.

Sau khi khởi động các container, bạn có thể kết nối ứng dụng tới MySQL bằng cách đặt biến môi trường `DB_HOST` trong file `.env` thành `mysql`.

Để kết nối tới MySQL database của ứng dụng từ máy local, bạn có thể dùng công cụ quản trị database có giao diện đồ họa như [TablePlus](https://tableplus.com). Theo mặc định, MySQL khả dụng tại `localhost`, cổng 3306; thông tin đăng nhập tương ứng với `DB_USERNAME` và `DB_PASSWORD`. Bạn cũng có thể đăng nhập bằng user `root`, với mật khẩu là giá trị của `DB_PASSWORD`.

<a name="mongodb"></a>
### MongoDB

Nếu chọn cài dịch vụ [MongoDB](https://www.mongodb.com/) khi cài Sail, file `compose.yaml` sẽ có service cho container [MongoDB Atlas Local](https://www.mongodb.com/docs/atlas/cli/current/atlas-cli-local-cloud/), cung cấp document database MongoDB cùng các tính năng Atlas như [Search Indexes](https://www.mongodb.com/docs/atlas/atlas-search/). Container sử dụng [Docker volume](https://docs.docker.com/storage/volumes/) để dữ liệu vẫn được lưu giữ khi container dừng và khởi động lại.

Sau khi khởi động container, bạn có thể kết nối ứng dụng tới MongoDB bằng cách đặt `MONGODB_URI` trong `.env` thành `mongodb://mongodb:27017`. Authentication mặc định bị tắt; bạn có thể đặt `MONGODB_USERNAME` và `MONGODB_PASSWORD` để bật authentication trước khi khởi động container `mongodb`, sau đó thêm thông tin đăng nhập vào connection string:

```ini
MONGODB_USERNAME=user
MONGODB_PASSWORD=laravel
MONGODB_URI=mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@mongodb:27017
```

Để tích hợp MongoDB với ứng dụng một cách thuận tiện, bạn có thể cài [package chính thức do MongoDB duy trì](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/).

Để kết nối tới MongoDB của ứng dụng từ máy local, bạn có thể dùng giao diện đồ họa như [Compass](https://www.mongodb.com/products/tools/compass). Theo mặc định, MongoDB khả dụng tại `localhost`, cổng `27017`.

<a name="redis"></a>
### Redis

File `compose.yaml` của ứng dụng cũng chứa service cho [Redis](https://redis.io). Container này sử dụng [Docker volume](https://docs.docker.com/storage/volumes/) để dữ liệu Redis vẫn được lưu giữ khi container dừng và khởi động lại. Sau khi khởi động container, hãy đặt `REDIS_HOST` trong file `.env` thành `redis` để ứng dụng kết nối tới Redis.

Để kết nối tới Redis của ứng dụng từ máy local, bạn có thể dùng công cụ quản trị database như [TablePlus](https://tableplus.com). Theo mặc định, Redis khả dụng tại `localhost`, cổng 6379.

<a name="valkey"></a>
### Valkey

Nếu chọn cài Valkey cùng Sail, file `compose.yaml` sẽ có service cho [Valkey](https://valkey.io/). Container này dùng [Docker volume](https://docs.docker.com/storage/volumes/) để dữ liệu Valkey vẫn được lưu giữ khi container dừng và khởi động lại. Để ứng dụng kết nối tới container này, hãy đặt `REDIS_HOST` trong `.env` thành `valkey`.

Để kết nối tới Valkey của ứng dụng từ máy local, bạn có thể dùng công cụ quản trị database như [TablePlus](https://tableplus.com). Theo mặc định, Valkey khả dụng tại `localhost`, cổng 6379.

<a name="meilisearch"></a>
### Meilisearch

Nếu chọn cài [Meilisearch](https://www.meilisearch.com) cùng Sail, file `compose.yaml` sẽ có service cho search engine này, vốn được tích hợp với [Laravel Scout](/docs/{{version}}/scout). Sau khi khởi động container, hãy đặt `MEILISEARCH_HOST` thành `http://meilisearch:7700` để ứng dụng kết nối tới Meilisearch.

Từ máy local, bạn có thể truy cập giao diện quản trị web của Meilisearch tại `http://localhost:7700`.

<a name="typesense"></a>
### Typesense

Nếu chọn cài [Typesense](https://typesense.org) cùng Sail, file `compose.yaml` sẽ có service cho search engine mã nguồn mở có tốc độ cao này, được tích hợp trực tiếp với [Laravel Scout](/docs/{{version}}/scout#typesense). Sau khi khởi động container, bạn có thể kết nối ứng dụng tới Typesense bằng các biến môi trường sau:

```ini
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

Từ máy local, bạn có thể truy cập API của Typesense qua `http://localhost:8108`.

<a name="file-storage"></a>
## Lưu trữ file

Nếu dự định sử dụng Amazon S3 để lưu file ở production, bạn có thể cài dịch vụ [RustFS](https://rustfs.com) cùng Sail. RustFS cung cấp API tương thích S3, cho phép phát triển local bằng driver lưu trữ `s3` của Laravel mà không cần tạo bucket "test" trong môi trường S3 production. Khi chọn RustFS, một phần cấu hình RustFS sẽ được thêm vào `compose.yaml`.

Theo mặc định, file cấu hình `filesystems` đã có cấu hình disk `s3`. Ngoài Amazon S3, bạn có thể dùng disk này với bất kỳ dịch vụ lưu trữ tương thích S3 nào như RustFS bằng cách thay đổi các biến môi trường liên quan. Ví dụ, khi dùng RustFS, cấu hình biến môi trường cho filesystem nên như sau:

```ini
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=sail
AWS_SECRET_ACCESS_KEY=password
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=local
AWS_ENDPOINT=http://rustfs:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

<a name="running-tests"></a>
## Chạy test

Laravel cung cấp sẵn khả năng testing mạnh mẽ và bạn có thể dùng lệnh `test` của Sail để chạy [feature test và unit test](/docs/{{version}}/testing) của ứng dụng. Mọi tùy chọn CLI được Pest / PHPUnit chấp nhận cũng có thể truyền cho lệnh `test`:

```shell
sail test

sail test --group orders
```

Lệnh `test` của Sail tương đương với việc chạy lệnh Artisan `test`:

```shell
sail artisan test
```

Theo mặc định, Sail tạo database `testing` riêng để test không ảnh hưởng tới trạng thái database hiện tại. Trong cài đặt Laravel mặc định, Sail cũng cấu hình file `phpunit.xml` để sử dụng database này khi chạy test:

```xml
<env name="DB_DATABASE" value="testing"/>
```

<a name="laravel-dusk"></a>
### Laravel Dusk

[Laravel Dusk](/docs/{{version}}/dusk) cung cấp API trực quan, dễ sử dụng cho browser automation và testing. Nhờ Sail, bạn có thể chạy các test này mà không cần cài Selenium hoặc công cụ liên quan trên máy local. Để bắt đầu, hãy bỏ comment service Selenium trong file `compose.yaml`:

```yaml
selenium:
    image: 'selenium/standalone-chrome'
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

Tiếp theo, hãy bảo đảm service `laravel.test` trong `compose.yaml` có `selenium` trong `depends_on`:

```yaml
depends_on:
    - mysql
    - redis
    - selenium
```

Cuối cùng, bạn có thể chạy Dusk test suite bằng cách khởi động Sail và chạy lệnh `dusk`:

```shell
sail dusk
```

<a name="selenium-on-apple-silicon"></a>
#### Selenium trên Apple Silicon

Nếu máy local sử dụng chip Apple Silicon, service `selenium` phải dùng image `selenium/standalone-chromium`:

```yaml
selenium:
    image: 'selenium/standalone-chromium'
    extra_hosts:
        - 'host.docker.internal:host-gateway'
    volumes:
        - '/dev/shm:/dev/shm'
    networks:
        - sail
```

<a name="previewing-emails"></a>
## Xem trước email

File `compose.yaml` mặc định của Laravel Sail có service [Mailpit](https://github.com/axllent/mailpit). Mailpit chặn các email do ứng dụng gửi trong quá trình phát triển local và cung cấp giao diện web để xem trước email trên trình duyệt. Khi dùng Sail, host mặc định của Mailpit là `mailpit` và dịch vụ hoạt động qua cổng 1025:

```ini
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

Khi Sail đang chạy, bạn có thể truy cập giao diện web Mailpit tại: http://localhost:8025

<a name="sail-container-cli"></a>
## CLI của container

Đôi khi bạn có thể muốn mở một phiên Bash bên trong container của ứng dụng. Lệnh `shell` cho phép kết nối vào container để kiểm tra file, các service đã cài đặt và thực thi lệnh shell tùy ý:

```shell
sail shell

sail root-shell
```

Để mở một phiên [Laravel Tinker](https://github.com/laravel/tinker) mới, hãy chạy lệnh `tinker`:

```shell
sail tinker
```

<a name="sail-php-versions"></a>
## Phiên bản PHP

Sail hiện hỗ trợ chạy ứng dụng với PHP 8.5, 8.4, 8.3, 8.2, 8.1 hoặc PHP 8.0. Phiên bản mặc định hiện tại là PHP 8.5. Để thay đổi phiên bản PHP dùng cho ứng dụng, hãy cập nhật cấu hình `build` của container `laravel.test` trong `compose.yaml`:

```yaml
# PHP 8.5
context: ./vendor/laravel/sail/runtimes/8.5

# PHP 8.4
context: ./vendor/laravel/sail/runtimes/8.4

# PHP 8.3
context: ./vendor/laravel/sail/runtimes/8.3

# PHP 8.2
context: ./vendor/laravel/sail/runtimes/8.2

# PHP 8.1
context: ./vendor/laravel/sail/runtimes/8.1

# PHP 8.0
context: ./vendor/laravel/sail/runtimes/8.0
```

Ngoài ra, bạn có thể cập nhật tên `image` để phản ánh phiên bản PHP mà ứng dụng đang sử dụng. Tùy chọn này cũng được định nghĩa trong file `compose.yaml`:

```yaml
image: sail-8.2/app
```

Sau khi cập nhật file `compose.yaml`, bạn nên build lại các container image:

```shell
sail build --no-cache

sail up
```

<a name="sail-php-extensions"></a>
### PHP extension bổ sung

Runtime image của Sail bao gồm một tập hợp PHP extension phổ biến. Nếu ứng dụng cần extension bổ sung, bạn có thể cài chúng khi build image bằng cách thêm build argument `PHP_EXTENSIONS`, với các extension phân tách bằng dấu cách, vào service `laravel.test` trong `compose.yaml`:

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        PHP_EXTENSIONS: 'gmp imagick'
```

Sau khi cập nhật file `compose.yaml`, bạn nên build lại các container image.

<a name="sail-node-versions"></a>
## Phiên bản Node

Sail cài Node 24 theo mặc định. Để thay đổi phiên bản Node được cài khi build image, hãy cập nhật `build.args` của service `laravel.test` trong `compose.yaml`:

```yaml
build:
    args:
        WWWGROUP: '${WWWGROUP}'
        NODE_VERSION: '18'
```

Sau khi cập nhật file `compose.yaml`, bạn nên build lại các container image:

```shell
sail build --no-cache

sail up
```

<a name="sharing-your-site"></a>
## Chia sẻ website

Đôi khi bạn cần công khai tạm thời website để đồng nghiệp xem trước hoặc để kiểm thử tích hợp webhook. Bạn có thể dùng lệnh `share` để chia sẻ website. Sau khi chạy lệnh, bạn sẽ nhận được một URL `laravel-sail.site` ngẫu nhiên để truy cập ứng dụng:

```shell
sail share
```

Khi chia sẻ website bằng lệnh `share`, bạn nên cấu hình trusted proxy bằng method middleware `trustProxies` trong `bootstrap/app.php`. Nếu không, các helper tạo URL như `url` và `route` sẽ không xác định được HTTP host chính xác khi tạo URL:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->trustProxies(at: '*');
})
```

Nếu muốn tự chọn subdomain cho website được chia sẻ, hãy truyền tùy chọn `subdomain` khi chạy lệnh `share`:

```shell
sail share --subdomain=my-sail-site
```

> [!NOTE]
> Lệnh `share` được cung cấp bởi [Expose](https://github.com/beyondcode/expose), một dịch vụ tunneling mã nguồn mở của [BeyondCode](https://beyondco.de).

<a name="debugging-with-xdebug"></a>
## Debug với Xdebug

Cấu hình Docker của Laravel Sail hỗ trợ [Xdebug](https://xdebug.org/), debugger PHP phổ biến và mạnh mẽ. Để bật Xdebug, hãy bảo đảm bạn đã [publish cấu hình Sail](#sail-customization), sau đó thêm các biến sau vào `.env` để cấu hình Xdebug:

```ini
SAIL_XDEBUG_MODE=develop,debug,coverage
```

Tiếp theo, hãy bảo đảm file `php.ini` đã publish chứa cấu hình sau để Xdebug được kích hoạt với các mode đã chỉ định:

```ini
[xdebug]
xdebug.mode=${XDEBUG_MODE}
```

Sau khi chỉnh sửa `php.ini`, hãy nhớ build lại Docker image để các thay đổi trong file có hiệu lực:

```shell
sail build --no-cache
```

#### Cấu hình IP host trên Linux

Bên trong Sail, biến môi trường `XDEBUG_CONFIG` được đặt thành `client_host=host.docker.internal` để Xdebug hoạt động đúng trên Mac và Windows (WSL2). Nếu máy local chạy Linux với Docker 20.10 trở lên, `host.docker.internal` đã khả dụng nên không cần cấu hình thủ công.

Với Docker phiên bản cũ hơn 20.10, Linux không hỗ trợ `host.docker.internal`, vì vậy bạn cần tự khai báo IP của host. Hãy cấu hình IP tĩnh cho container bằng một custom network trong file `compose.yaml`:

```yaml
networks:
  custom_network:
    ipam:
      config:
        - subnet: 172.20.0.0/16

services:
  laravel.test:
    networks:
      custom_network:
        ipv4_address: 172.20.0.2
```

Sau khi thiết lập IP tĩnh, hãy khai báo biến `SAIL_XDEBUG_CONFIG` trong file `.env` của ứng dụng:

```ini
SAIL_XDEBUG_CONFIG="client_host=172.20.0.2"
```

<a name="xdebug-cli-usage"></a>
### Sử dụng Xdebug trên CLI

Bạn có thể dùng lệnh `sail debug` để bắt đầu một phiên debug khi chạy lệnh Artisan:

```shell
# Run an Artisan command without Xdebug...
sail artisan migrate

# Run an Artisan command with Xdebug...
sail debug migrate
```

<a name="xdebug-browser-usage"></a>
### Sử dụng Xdebug trên trình duyệt

Để debug ứng dụng trong khi tương tác qua trình duyệt, hãy làm theo [hướng dẫn của Xdebug](https://xdebug.org/docs/step_debug#web-application) để khởi tạo phiên Xdebug từ trình duyệt.

Nếu sử dụng PhpStorm, hãy tham khảo tài liệu JetBrains về [debug không cần cấu hình](https://www.jetbrains.com/help/phpstorm/zero-configuration-debugging.html).

> [!WARNING]
> Laravel Sail sử dụng `artisan serve` để phục vụ ứng dụng. Lệnh `artisan serve` chỉ hỗ trợ các biến `XDEBUG_CONFIG` và `XDEBUG_MODE` từ Laravel 8.53.0. Các phiên bản Laravel cũ hơn (8.52.0 trở xuống) không hỗ trợ những biến này và sẽ không nhận kết nối debug.

<a name="sail-customization"></a>
## Tùy biến

Vì Sail về bản chất là Docker, bạn có thể tùy biến gần như mọi thành phần. Để publish các Dockerfile của Sail, hãy chạy lệnh `sail:publish`:

```shell
sail artisan sail:publish
```

Sau khi chạy lệnh này, Dockerfile và các file cấu hình khác của Laravel Sail sẽ được đặt trong thư mục `docker` ở thư mục gốc ứng dụng. Sau khi tùy biến Sail, bạn có thể đổi tên image của application container trong `compose.yaml`. Tiếp đó, hãy build lại container bằng lệnh `build`. Việc đặt tên image riêng biệt đặc biệt quan trọng nếu bạn dùng Sail để phát triển nhiều ứng dụng Laravel trên cùng một máy:

```shell
sail build --no-cache
```
