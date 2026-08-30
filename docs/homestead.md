# Laravel Homestead

- [Giới thiệu](#introduction)
- [Cài đặt và thiết lập](#installation-and-setup)
    - [Các bước đầu tiên](#first-steps)
    - [Cấu hình Homestead](#configuring-homestead)
    - [Cấu hình site Nginx](#configuring-nginx-sites)
    - [Cấu hình dịch vụ](#configuring-services)
    - [Khởi chạy Vagrant box](#launching-the-vagrant-box)
    - [Cài đặt theo từng dự án](#per-project-installation)
    - [Cài đặt các tính năng tùy chọn](#installing-optional-features)
    - [Alias](#aliases)
- [Cập nhật Homestead](#updating-homestead)
- [Sử dụng hằng ngày](#daily-usage)
    - [Kết nối qua SSH](#connecting-via-ssh)
    - [Thêm site bổ sung](#adding-additional-sites)
    - [Biến môi trường](#environment-variables)
    - [Cổng](#ports)
    - [Phiên bản PHP](#php-versions)
    - [Kết nối tới cơ sở dữ liệu](#connecting-to-databases)
    - [Sao lưu cơ sở dữ liệu](#database-backups)
    - [Cấu hình lịch Cron](#configuring-cron-schedules)
    - [Cấu hình Mailpit](#configuring-mailpit)
    - [Cấu hình Minio](#configuring-minio)
    - [Laravel Dusk](#laravel-dusk)
    - [Chia sẻ môi trường](#sharing-your-environment)
- [Debug và profiling](#debugging-and-profiling)
    - [Debug web request bằng Xdebug](#debugging-web-requests)
    - [Debug ứng dụng CLI](#debugging-cli-applications)
    - [Profiling ứng dụng bằng Blackfire](#profiling-applications-with-blackfire)
- [Giao diện mạng](#network-interfaces)
- [Mở rộng Homestead](#extending-homestead)
- [Thiết lập riêng theo provider](#provider-specific-settings)
    - [VirtualBox](#provider-specific-virtualbox)

<a name="introduction"></a>
## Giới thiệu

> [!WARNING]
> Laravel Homestead là một package cũ (legacy) không còn được duy trì tích cực. Bạn có thể sử dụng [Laravel Sail](/docs/{{version}}/sail) như một giải pháp thay thế hiện đại.

Laravel luôn hướng tới việc mang lại trải nghiệm phát triển PHP dễ chịu trong mọi khía cạnh, bao gồm cả môi trường phát triển cục bộ. [Laravel Homestead](https://github.com/laravel/homestead) là một Vagrant box chính thức, được đóng gói sẵn, cung cấp môi trường phát triển hoàn chỉnh mà không yêu cầu bạn cài PHP, web server hay bất kỳ phần mềm máy chủ nào khác trực tiếp trên máy cục bộ.

[Vagrant](https://www.vagrantup.com) cung cấp một cách đơn giản và thuận tiện để quản lý cũng như provision máy ảo. Các Vagrant box hoàn toàn có thể được tạo lại. Nếu có sự cố, bạn có thể hủy và tạo lại box chỉ trong vài phút.

Homestead chạy trên Windows, macOS hoặc Linux và bao gồm Nginx, PHP, MySQL, PostgreSQL, Redis, Memcached, Node cùng các phần mềm khác cần thiết để phát triển ứng dụng Laravel.

> [!WARNING]
> Nếu sử dụng Windows, bạn có thể cần bật ảo hóa phần cứng (VT-x). Thông thường, tùy chọn này có thể được bật trong BIOS. Nếu đang sử dụng Hyper-V trên hệ thống UEFI, bạn cũng có thể cần tắt Hyper-V để truy cập VT-x.

<a name="included-software"></a>
### Phần mềm đi kèm

<style>
    #software-list > ul {
        column-count: 2; -moz-column-count: 2; -webkit-column-count: 2;
        column-gap: 5em; -moz-column-gap: 5em; -webkit-column-gap: 5em;
        line-height: 1.9;
    }
</style>

<div id="software-list" markdown="1">

- Ubuntu 22.04
- Git
- PHP 8.3
- PHP 8.2
- PHP 8.1
- PHP 8.0
- PHP 7.4
- PHP 7.3
- PHP 7.2
- PHP 7.1
- PHP 7.0
- PHP 5.6
- Nginx
- MySQL 8.0
- lmm
- Sqlite3
- PostgreSQL 15
- Composer
- Docker
- Node (With Yarn, Bower, Grunt, and Gulp)
- Redis
- Memcached
- Beanstalkd
- Mailpit
- avahi
- ngrok
- Xdebug
- XHProf / Tideways / XHGui
- wp-cli

</div>

<a name="optional-software"></a>
### Phần mềm tùy chọn

<style>
    #software-list > ul {
        column-count: 2; -moz-column-count: 2; -webkit-column-count: 2;
        column-gap: 5em; -moz-column-gap: 5em; -webkit-column-gap: 5em;
        line-height: 1.9;
    }
</style>

<div id="software-list" markdown="1">

- Apache
- Blackfire
- Cassandra
- Chronograf
- CouchDB
- Crystal & Lucky Framework
- Elasticsearch
- EventStoreDB
- Flyway
- Gearman
- Go
- Grafana
- InfluxDB
- Logstash
- MariaDB
- Meilisearch
- MinIO
- MongoDB
- Neo4j
- Oh My Zsh
- Open Resty
- PM2
- Python
- R
- RabbitMQ
- Rust
- RVM (Ruby Version Manager)
- Solr
- TimescaleDB
- Trader <small>(PHP extension)</small>
- Webdriver & Laravel Dusk Utilities

</div>

<a name="installation-and-setup"></a>
## Cài đặt và thiết lập

<a name="first-steps"></a>
### Các bước đầu tiên

Trước khi khởi chạy môi trường Homestead, bạn phải cài đặt [Vagrant](https://developer.hashicorp.com/vagrant/downloads) cùng một trong các provider được hỗ trợ sau:

- [VirtualBox 6.1.x](https://www.virtualbox.org/wiki/Download_Old_Builds_6_1)
- [Parallels](https://www.parallels.com/products/desktop/)

Tất cả các package phần mềm này đều cung cấp trình cài đặt đồ họa dễ sử dụng cho các hệ điều hành phổ biến.

Để sử dụng provider Parallels, bạn cần cài [Parallels Vagrant plug-in](https://github.com/Parallels/vagrant-parallels). Plug-in này được cung cấp miễn phí.

<a name="installing-homestead"></a>
#### Cài đặt Homestead

Bạn có thể cài Homestead bằng cách clone repository Homestead về máy host. Nên clone repository vào thư mục `Homestead` bên trong thư mục "home", vì máy ảo Homestead sẽ đóng vai trò host cho tất cả ứng dụng Laravel của bạn. Trong tài liệu này, chúng tôi sẽ gọi thư mục đó là "thư mục Homestead":

```shell
git clone https://github.com/laravel/homestead.git ~/Homestead
```

Sau khi clone repository Laravel Homestead, bạn nên checkout branch `release`. Branch này luôn chứa bản phát hành Homestead ổn định mới nhất:

```shell
cd ~/Homestead

git checkout release
```

Tiếp theo, chạy lệnh `bash init.sh` từ thư mục Homestead để tạo file cấu hình `Homestead.yaml`. Đây là nơi bạn cấu hình toàn bộ thiết lập cho Homestead. File này sẽ được đặt trong thư mục Homestead:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

<a name="configuring-homestead"></a>
### Cấu hình Homestead

<a name="setting-your-provider"></a>
#### Thiết lập provider

Khóa `provider` trong file `Homestead.yaml` xác định Vagrant provider sẽ được sử dụng: `virtualbox` hoặc `parallels`:

    provider: virtualbox

> [!WARNING]
> Nếu đang sử dụng Apple Silicon, bạn bắt buộc phải dùng provider Parallels.

<a name="configuring-shared-folders"></a>
#### Cấu hình thư mục dùng chung

Thuộc tính `folders` của file `Homestead.yaml` liệt kê tất cả thư mục bạn muốn chia sẻ với môi trường Homestead. Khi các file trong những thư mục này thay đổi, chúng sẽ được đồng bộ giữa máy cục bộ và môi trường ảo Homestead. Bạn có thể cấu hình bao nhiêu thư mục dùng chung tùy nhu cầu:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
```

> [!WARNING]
> Người dùng Windows không nên sử dụng cú pháp đường dẫn `~/`; thay vào đó hãy dùng đường dẫn đầy đủ tới project, chẳng hạn `C:\Users\user\Code\project1`.

Bạn nên luôn ánh xạ từng ứng dụng vào mapping thư mục riêng thay vì ánh xạ một thư mục lớn chứa tất cả ứng dụng. Khi một thư mục được ánh xạ, máy ảo phải theo dõi toàn bộ disk I/O của *mọi* file trong thư mục đó. Hiệu năng có thể giảm nếu thư mục chứa số lượng file lớn:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
    - map: ~/code/project2
      to: /home/vagrant/project2
```

> [!WARNING]
> Bạn không bao giờ nên mount `.` (thư mục hiện tại) khi sử dụng Homestead. Việc này khiến Vagrant không ánh xạ thư mục hiện tại tới `/vagrant`, làm hỏng các tính năng tùy chọn và có thể gây kết quả không mong muốn trong quá trình provision.

Để bật [NFS](https://developer.hashicorp.com/vagrant/docs/synced-folders/nfs), bạn có thể thêm tùy chọn `type` vào mapping thư mục:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "nfs"
```

> [!WARNING]
> Khi sử dụng NFS trên Windows, bạn nên cân nhắc cài plug-in [vagrant-winnfsd](https://github.com/winnfsd/vagrant-winnfsd). Plug-in này duy trì đúng quyền user / group cho file và thư mục bên trong máy ảo Homestead.

Bạn cũng có thể truyền bất kỳ tùy chọn nào được [Synced Folders](https://developer.hashicorp.com/vagrant/docs/synced-folders/basic_usage) của Vagrant hỗ trợ bằng cách liệt kê chúng dưới khóa `options`:

```yaml
folders:
    - map: ~/code/project1
      to: /home/vagrant/project1
      type: "rsync"
      options:
          rsync__args: ["--verbose", "--archive", "--delete", "-zz"]
          rsync__exclude: ["node_modules"]
```

<a name="configuring-nginx-sites"></a>
### Cấu hình site Nginx

Chưa quen với Nginx? Không sao. Thuộc tính `sites` trong file `Homestead.yaml` cho phép bạn dễ dàng ánh xạ một "domain" tới một thư mục trong môi trường Homestead. File `Homestead.yaml` có sẵn một cấu hình site mẫu. Bạn có thể thêm bao nhiêu site vào môi trường Homestead tùy nhu cầu. Homestead có thể đóng vai trò môi trường ảo hóa thuận tiện cho mọi ứng dụng Laravel mà bạn đang phát triển:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
```

Nếu thay đổi thuộc tính `sites` sau khi đã provision máy ảo Homestead, bạn nên chạy lệnh `vagrant reload --provision` trong terminal để cập nhật cấu hình Nginx trên máy ảo.

> [!WARNING]
> Các script của Homestead được xây dựng để có tính idempotent cao nhất có thể. Tuy nhiên, nếu gặp sự cố trong quá trình provision, bạn nên hủy và tạo lại máy bằng cách chạy lệnh `vagrant destroy && vagrant up`.

<a name="hostname-resolution"></a>
#### Phân giải hostname

Homestead công bố hostname bằng `mDNS` để tự động phân giải host. Nếu bạn đặt `hostname: homestead` trong file `Homestead.yaml`, host sẽ khả dụng tại `homestead.local`. Các bản phân phối desktop macOS, iOS và Linux hỗ trợ `mDNS` theo mặc định. Nếu đang sử dụng Windows, bạn phải cài đặt [Bonjour Print Services for Windows](https://support.apple.com/kb/DL999?viewlocale=en_US&locale=en_US).

Hostname tự động hoạt động tốt nhất với [cài đặt theo từng project](#per-project-installation) của Homestead. Nếu host nhiều site trên một instance Homestead, bạn có thể thêm các "domain" của website vào file `hosts` trên máy. File `hosts` sẽ chuyển hướng request dành cho các site Homestead vào máy ảo Homestead. Trên macOS và Linux, file này nằm tại `/etc/hosts`. Trên Windows, file nằm tại `C:\Windows\System32\drivers\etc\hosts`. Các dòng thêm vào file sẽ có dạng sau:

```text
192.168.56.56  homestead.test
```

Hãy đảm bảo địa chỉ IP được liệt kê chính là địa chỉ đã cấu hình trong file `Homestead.yaml`. Sau khi thêm domain vào file `hosts` và khởi chạy Vagrant box, bạn có thể truy cập site qua trình duyệt web:

```shell
http://homestead.test
```

<a name="configuring-services"></a>
### Cấu hình service

Homestead khởi động một số service theo mặc định; tuy nhiên, bạn có thể tùy chỉnh service nào được bật hoặc tắt trong quá trình provisioning. Ví dụ, bạn có thể bật PostgreSQL và tắt MySQL bằng cách chỉnh tùy chọn `services` trong file `Homestead.yaml`:

```yaml
services:
    - enabled:
        - "postgresql"
    - disabled:
        - "mysql"
```

Các service được chỉ định sẽ được khởi động hoặc dừng dựa trên thứ tự của chúng trong các directive `enabled` và `disabled`.

<a name="launching-the-vagrant-box"></a>
### Khởi chạy Vagrant box

Sau khi chỉnh sửa `Homestead.yaml` theo nhu cầu, hãy chạy lệnh `vagrant up` từ thư mục Homestead. Vagrant sẽ khởi động máy ảo và tự động cấu hình các thư mục dùng chung cùng các site Nginx.

Để hủy máy ảo, bạn có thể dùng lệnh `vagrant destroy`.

<a name="per-project-installation"></a>
### Cài đặt theo từng project

Thay vì cài Homestead toàn cục và dùng chung một máy ảo Homestead cho tất cả project, bạn có thể cấu hình một instance Homestead cho từng project mà mình quản lý. Cài Homestead theo từng project có thể hữu ích nếu bạn muốn phân phối `Vagrantfile` cùng project, cho phép những người khác làm việc trên project chạy `vagrant up` ngay sau khi clone repository.

Bạn có thể cài Homestead vào project bằng Composer package manager:

```shell
composer require laravel/homestead --dev
```

Sau khi cài Homestead, hãy gọi lệnh `make` của Homestead để tạo `Vagrantfile` và file `Homestead.yaml` cho project. Các file này sẽ được đặt tại thư mục gốc của project. Lệnh `make` sẽ tự động cấu hình các directive `sites` và `folders` trong file `Homestead.yaml`:

```shell
# macOS / Linux...
php vendor/bin/homestead make

# Windows...
vendor\\bin\\homestead make
```

Tiếp theo, chạy lệnh `vagrant up` trong terminal và truy cập project tại `http://homestead.test` trong trình duyệt. Hãy nhớ rằng bạn vẫn cần thêm một entry cho `homestead.test` hoặc domain tùy chọn vào file `/etc/hosts` nếu không sử dụng [phân giải hostname](#hostname-resolution) tự động.

<a name="installing-optional-features"></a>
### Cài đặt các tính năng tùy chọn

Phần mềm tùy chọn được cài đặt bằng tùy chọn `features` trong file `Homestead.yaml`. Phần lớn tính năng có thể bật hoặc tắt bằng giá trị boolean, trong khi một số tính năng cho phép nhiều tùy chọn cấu hình:

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
    - cassandra: true
    - chronograf: true
    - couchdb: true
    - crystal: true
    - dragonflydb: true
    - elasticsearch:
        version: 7.9.0
    - eventstore: true
        version: 21.2.0
    - flyway: true
    - gearman: true
    - golang: true
    - grafana: true
    - influxdb: true
    - logstash: true
    - mariadb: true
    - meilisearch: true
    - minio: true
    - mongodb: true
    - neo4j: true
    - ohmyzsh: true
    - openresty: true
    - pm2: true
    - python: true
    - r-base: true
    - rabbitmq: true
    - rustc: true
    - rvm: true
    - solr: true
    - timescaledb: true
    - trader: true
    - webdriver: true
```

<a name="elasticsearch"></a>
#### Elasticsearch

Bạn có thể chỉ định một phiên bản Elasticsearch được hỗ trợ, và đó phải là số phiên bản chính xác (major.minor.patch). Cài đặt mặc định sẽ tạo cluster có tên `homestead`. Bạn không bao giờ nên cấp cho Elasticsearch nhiều hơn một nửa bộ nhớ của hệ điều hành, vì vậy hãy đảm bảo máy ảo Homestead có ít nhất gấp đôi lượng bộ nhớ được cấp cho Elasticsearch.

> [!NOTE]
> Hãy xem [tài liệu Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current) để tìm hiểu cách tùy chỉnh cấu hình.

<a name="mariadb"></a>
#### MariaDB

Bật MariaDB sẽ gỡ MySQL và cài MariaDB. MariaDB thường có thể được dùng như một giải pháp thay thế trực tiếp cho MySQL, vì vậy bạn vẫn nên sử dụng database driver `mysql` trong cấu hình database của ứng dụng.

<a name="mongodb"></a>
#### MongoDB

Cài đặt MongoDB mặc định sẽ đặt database username là `homestead` và password tương ứng là `secret`.

<a name="neo4j"></a>
#### Neo4j

Cài đặt Neo4j mặc định sẽ đặt database username là `homestead` và password tương ứng là `secret`. Để truy cập trình duyệt Neo4j, hãy mở `http://homestead.test:7474` trong trình duyệt web. Các port `7687` (Bolt), `7474` (HTTP) và `7473` (HTTPS) đã sẵn sàng phục vụ request từ Neo4j client.

<a name="aliases"></a>
### Alias

Bạn có thể thêm Bash alias vào máy ảo Homestead bằng cách chỉnh file `aliases` trong thư mục Homestead:

```shell
alias c='clear'
alias ..='cd ..'
```

Sau khi cập nhật file `aliases`, bạn nên provision lại máy ảo Homestead bằng lệnh `vagrant reload --provision`. Việc này đảm bảo các alias mới khả dụng trên máy.

<a name="updating-homestead"></a>
## Cập nhật Homestead

Trước khi bắt đầu cập nhật Homestead, hãy đảm bảo bạn đã xóa máy ảo hiện tại bằng cách chạy lệnh sau trong thư mục Homestead:

```shell
vagrant destroy
```

Tiếp theo, bạn cần cập nhật source code Homestead. Nếu đã clone repository, bạn có thể chạy các lệnh sau tại vị trí ban đầu đã clone repository:

```shell
git fetch

git pull origin release
```

Các lệnh này lấy code Homestead mới nhất từ GitHub repository, lấy các tag mới nhất rồi checkout bản phát hành được gắn tag mới nhất. Bạn có thể tìm phiên bản stable mới nhất trên [trang GitHub releases của Homestead](https://github.com/laravel/homestead/releases).

Nếu đã cài Homestead thông qua file `composer.json` của project, hãy đảm bảo file `composer.json` chứa `"laravel/homestead": "^12"` và cập nhật dependencies:

```shell
composer update
```

Tiếp theo, hãy cập nhật Vagrant box bằng lệnh `vagrant box update`:

```shell
vagrant box update
```

Sau khi cập nhật Vagrant box, bạn nên chạy lệnh `bash init.sh` từ thư mục Homestead để cập nhật các file cấu hình bổ sung của Homestead. Bạn sẽ được hỏi có muốn ghi đè các file `Homestead.yaml`, `after.sh` và `aliases` hiện có hay không:

```shell
# macOS / Linux...
bash init.sh

# Windows...
init.bat
```

Cuối cùng, bạn cần tạo lại máy ảo Homestead để sử dụng bản cài đặt Vagrant mới nhất:

```shell
vagrant up
```

<a name="daily-usage"></a>
## Sử dụng hằng ngày

<a name="connecting-via-ssh"></a>
### Kết nối qua SSH

Bạn có thể SSH vào máy ảo bằng cách chạy lệnh terminal `vagrant ssh` từ thư mục Homestead.

<a name="adding-additional-sites"></a>
### Thêm site bổ sung

Sau khi môi trường Homestead đã được provision và đang chạy, bạn có thể muốn thêm các site Nginx cho những dự án Laravel khác. Bạn có thể chạy bao nhiêu dự án Laravel tùy ý trên một môi trường Homestead. Để thêm site, hãy thêm site đó vào file `Homestead.yaml`.

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
    - map: another.test
      to: /home/vagrant/project2/public
```

> [!WARNING]
> Bạn nên đảm bảo đã cấu hình [ánh xạ thư mục](#configuring-shared-folders) cho thư mục của dự án trước khi thêm site.

Nếu Vagrant không tự động quản lý file "hosts", bạn cũng có thể cần thêm site mới vào file này. Trên macOS và Linux, file nằm tại `/etc/hosts`. Trên Windows, file nằm tại `C:\Windows\System32\drivers\etc\hosts`:

```text
192.168.56.56  homestead.test
192.168.56.56  another.test
```

Sau khi thêm site, hãy chạy lệnh terminal `vagrant reload --provision` từ thư mục Homestead.

<a name="site-types"></a>
#### Loại site

Homestead hỗ trợ một số "loại" site, cho phép bạn dễ dàng chạy các dự án không dựa trên Laravel. Ví dụ, bạn có thể dễ dàng thêm ứng dụng Statamic vào Homestead bằng loại site `statamic`:

```yaml
sites:
    - map: statamic.test
      to: /home/vagrant/my-symfony-project/web
      type: "statamic"
```

Các loại site khả dụng gồm: `apache`, `apache-proxy`, `apigility`, `expressive`, `laravel` (mặc định), `proxy` (cho nginx), `silverstripe`, `statamic`, `symfony2`, `symfony4` và `zf`.

<a name="site-parameters"></a>
#### Tham số site

Bạn có thể thêm các giá trị Nginx `fastcgi_param` bổ sung cho site thông qua directive `params` của site:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      params:
          - key: FOO
            value: BAR
```

<a name="environment-variables"></a>
### Biến môi trường

Bạn có thể định nghĩa các biến môi trường toàn cục bằng cách thêm chúng vào file `Homestead.yaml`:

```yaml
variables:
    - key: APP_ENV
      value: local
    - key: FOO
      value: bar
```

Sau khi cập nhật file `Homestead.yaml`, hãy nhớ provision lại máy bằng lệnh `vagrant reload --provision`. Thao tác này sẽ cập nhật cấu hình PHP-FPM cho tất cả phiên bản PHP đã cài đặt và đồng thời cập nhật môi trường cho user `vagrant`.

<a name="ports"></a>
### Cổng

Theo mặc định, các cổng sau được forward tới môi trường Homestead:

<div class="content-list" markdown="1">

- **HTTP:** 8000 &rarr; Forward tới 80
- **HTTPS:** 44300 &rarr; Forward tới 443

</div>

<a name="forwarding-additional-ports"></a>
#### Forward các cổng bổ sung

Nếu muốn, bạn có thể forward thêm cổng tới Vagrant box bằng cách định nghĩa mục cấu hình `ports` trong file `Homestead.yaml`. Sau khi cập nhật file, hãy provision lại máy bằng lệnh `vagrant reload --provision`:

```yaml
ports:
    - send: 50000
      to: 5000
    - send: 7777
      to: 777
      protocol: udp
```

Dưới đây là danh sách các cổng dịch vụ Homestead bổ sung mà bạn có thể muốn ánh xạ từ máy host tới Vagrant box:

<div class="content-list" markdown="1">

- **SSH:** 2222 &rarr; To 22
- **ngrok UI:** 4040 &rarr; To 4040
- **MySQL:** 33060 &rarr; To 3306
- **PostgreSQL:** 54320 &rarr; To 5432
- **MongoDB:** 27017 &rarr; To 27017
- **Mailpit:** 8025 &rarr; To 8025
- **Minio:** 9600 &rarr; To 9600

</div>

<a name="php-versions"></a>
### Phiên bản PHP

Homestead hỗ trợ chạy nhiều phiên bản PHP trên cùng một máy ảo. Bạn có thể chỉ định phiên bản PHP dùng cho từng site trong file `Homestead.yaml`. Các phiên bản PHP khả dụng là: "5.6", "7.0", "7.1", "7.2", "7.3", "7.4", "8.0", "8.1", "8.2" và "8.3" (mặc định):

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      php: "7.1"
```

[Bên trong máy ảo Homestead](#connecting-via-ssh), bạn có thể sử dụng bất kỳ phiên bản PHP được hỗ trợ nào thông qua CLI:

```shell
php5.6 artisan list
php7.0 artisan list
php7.1 artisan list
php7.2 artisan list
php7.3 artisan list
php7.4 artisan list
php8.0 artisan list
php8.1 artisan list
php8.2 artisan list
php8.3 artisan list
```

Bạn có thể thay đổi phiên bản PHP mặc định mà CLI sử dụng bằng cách chạy các lệnh sau bên trong máy ảo Homestead:

```shell
php56
php70
php71
php72
php73
php74
php80
php81
php82
php83
```

<a name="connecting-to-databases"></a>
### Kết nối tới cơ sở dữ liệu

Một database `homestead` được cấu hình sẵn cho cả MySQL và PostgreSQL. Để kết nối tới MySQL hoặc PostgreSQL từ database client trên máy host, hãy kết nối tới `127.0.0.1` qua cổng `33060` (MySQL) hoặc `54320` (PostgreSQL). Username và password cho cả hai database là `homestead` / `secret`.

> [!WARNING]
> Bạn chỉ nên sử dụng các cổng không chuẩn này khi kết nối tới database từ máy host. Trong file cấu hình `database` của ứng dụng Laravel, bạn sẽ sử dụng các cổng mặc định 3306 và 5432 vì Laravel đang chạy _bên trong_ máy ảo.

<a name="database-backups"></a>
### Sao lưu cơ sở dữ liệu

Homestead có thể tự động sao lưu database khi máy ảo Homestead bị hủy. Để sử dụng tính năng này, bạn phải dùng Vagrant 2.1.0 trở lên. Nếu dùng phiên bản Vagrant cũ hơn, bạn phải cài plug-in `vagrant-triggers`. Để bật sao lưu database tự động, hãy thêm dòng sau vào file `Homestead.yaml`:

```yaml
backup: true
```

Sau khi cấu hình, Homestead sẽ export database vào các thư mục `.backup/mysql_backup` và `.backup/postgres_backup` khi lệnh `vagrant destroy` được thực thi. Các thư mục này nằm trong thư mục cài Homestead hoặc tại thư mục gốc của dự án nếu bạn sử dụng phương thức [cài đặt theo từng dự án](#per-project-installation).

<a name="configuring-cron-schedules"></a>
### Cấu hình lịch Cron

Laravel cung cấp cách thuận tiện để [lập lịch cron job](/docs/{{version}}/scheduling) bằng cách lên lịch một lệnh Artisan `schedule:run` duy nhất chạy mỗi phút. Lệnh `schedule:run` sẽ kiểm tra lịch job được định nghĩa trong file `routes/console.php` để xác định các tác vụ đã lên lịch cần chạy.

Nếu muốn lệnh `schedule:run` được chạy cho một site Homestead, bạn có thể đặt tùy chọn `schedule` thành `true` khi định nghĩa site:

```yaml
sites:
    - map: homestead.test
      to: /home/vagrant/project1/public
      schedule: true
```

Cron job của site sẽ được định nghĩa trong thư mục `/etc/cron.d` của máy ảo Homestead.

<a name="configuring-mailpit"></a>
### Cấu hình Mailpit

[Mailpit](https://github.com/axllent/mailpit) cho phép bạn chặn email gửi đi và kiểm tra chúng mà không thực sự gửi mail tới người nhận. Để bắt đầu, hãy cập nhật file `.env` của ứng dụng với các thiết lập mail sau:

```ini
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Sau khi cấu hình Mailpit, bạn có thể truy cập dashboard Mailpit tại `http://localhost:8025`.

<a name="configuring-minio"></a>
### Cấu hình Minio

[Minio](https://github.com/minio/minio) là object storage server mã nguồn mở với API tương thích Amazon S3. Để cài Minio, hãy cập nhật file `Homestead.yaml` với tùy chọn cấu hình sau trong phần [features](#installing-optional-features):

    minio: true

Theo mặc định, Minio khả dụng trên cổng 9600. Bạn có thể truy cập bảng điều khiển Minio tại `http://localhost:9600`. Access key mặc định là `homestead`, còn secret key mặc định là `secretkey`. Khi truy cập Minio, bạn nên luôn sử dụng region `us-east-1`.

Để sử dụng Minio, hãy đảm bảo file `.env` có các tùy chọn sau:

```ini
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_ENDPOINT=http://localhost:9600
AWS_ACCESS_KEY_ID=homestead
AWS_SECRET_ACCESS_KEY=secretkey
AWS_DEFAULT_REGION=us-east-1
```

Để provision các bucket "S3" do Minio cung cấp, hãy thêm directive `buckets` vào file `Homestead.yaml`. Sau khi định nghĩa bucket, hãy chạy lệnh `vagrant reload --provision` trong terminal:

```yaml
buckets:
    - name: your-bucket
      policy: public
    - name: your-private-bucket
      policy: none
```

Các giá trị `policy` được hỗ trợ gồm: `none`, `download`, `upload` và `public`.

<a name="laravel-dusk"></a>
### Laravel Dusk

Để chạy test [Laravel Dusk](/docs/{{version}}/dusk) bên trong Homestead, bạn nên bật [tính năng webdriver](#installing-optional-features) trong cấu hình Homestead:

```yaml
features:
    - webdriver: true
```

Sau khi bật tính năng `webdriver`, hãy chạy lệnh `vagrant reload --provision` trong terminal.

<a name="sharing-your-environment"></a>
### Chia sẻ môi trường

Đôi khi bạn có thể muốn chia sẻ nội dung đang làm với đồng nghiệp hoặc khách hàng. Vagrant hỗ trợ sẵn việc này qua lệnh `vagrant share`; tuy nhiên, cách này sẽ không hoạt động nếu bạn cấu hình nhiều site trong file `Homestead.yaml`.

Để giải quyết vấn đề này, Homestead cung cấp lệnh `share` riêng. Để bắt đầu, hãy [SSH vào máy ảo Homestead](#connecting-via-ssh) bằng `vagrant ssh` và chạy lệnh `share homestead.test`. Lệnh này sẽ chia sẻ site `homestead.test` từ file cấu hình `Homestead.yaml`. Bạn có thể thay `homestead.test` bằng bất kỳ site nào khác đã cấu hình:

```shell
share homestead.test
```

Sau khi chạy lệnh, màn hình Ngrok sẽ xuất hiện với activity log và các URL công khai để truy cập site được chia sẻ. Nếu muốn chỉ định region, subdomain hoặc tùy chọn runtime Ngrok khác, bạn có thể thêm chúng vào lệnh `share`:

```shell
share homestead.test -region=eu -subdomain=laravel
```

Nếu cần chia sẻ nội dung qua HTTPS thay vì HTTP, hãy sử dụng lệnh `sshare` thay cho `share`.

> [!WARNING]
> Hãy nhớ rằng Vagrant vốn không an toàn và bạn đang đưa máy ảo của mình ra Internet khi chạy lệnh `share`.

<a name="debugging-and-profiling"></a>
## Debug và profiling

<a name="debugging-web-requests"></a>
### Debug web request bằng Xdebug

Homestead hỗ trợ step debugging bằng [Xdebug](https://xdebug.org). Ví dụ, bạn có thể truy cập một trang trong trình duyệt và PHP sẽ kết nối tới IDE để cho phép kiểm tra và sửa đổi code đang chạy.

Theo mặc định, Xdebug đã chạy và sẵn sàng nhận kết nối. Nếu cần bật Xdebug trên CLI, hãy chạy `sudo phpenmod xdebug` bên trong máy ảo Homestead. Tiếp theo, làm theo hướng dẫn của IDE để bật debugging. Cuối cùng, cấu hình trình duyệt để kích hoạt Xdebug bằng extension hoặc [bookmarklet](https://www.jetbrains.com/phpstorm/marklets/).

> [!WARNING]
> Xdebug khiến PHP chạy chậm hơn đáng kể. Để tắt Xdebug, hãy chạy `sudo phpdismod xdebug` bên trong máy ảo Homestead và khởi động lại dịch vụ FPM.

<a name="autostarting-xdebug"></a>
#### Tự động khởi động Xdebug

Khi debug functional test có request tới web server, việc tự động khởi động debugging thuận tiện hơn so với sửa test để truyền custom header hoặc cookie nhằm kích hoạt debugging. Để buộc Xdebug tự động khởi động, hãy sửa file `/etc/php/7.x/fpm/conf.d/20-xdebug.ini` bên trong máy ảo Homestead và thêm cấu hình sau:

```ini
; If Homestead.yaml contains a different subnet for the IP address, this address may be different...
xdebug.client_host = 192.168.10.1
xdebug.mode = debug
xdebug.start_with_request = yes
```

<a name="debugging-cli-applications"></a>
### Debug ứng dụng CLI

Để debug một ứng dụng PHP CLI, hãy sử dụng shell alias `xphp` bên trong máy ảo Homestead:

```shell
xphp /path/to/script
```

<a name="profiling-applications-with-blackfire"></a>
### Profiling ứng dụng bằng Blackfire

[Blackfire](https://blackfire.io/docs/introduction) là dịch vụ profiling web request và ứng dụng CLI. Nó cung cấp giao diện tương tác hiển thị dữ liệu profile dưới dạng call graph và timeline. Blackfire được xây dựng để dùng trong development, staging và production mà không tạo overhead cho người dùng cuối. Ngoài ra, Blackfire cung cấp các kiểm tra về hiệu năng, chất lượng, bảo mật của code và thiết lập `php.ini`.

[Blackfire Player](https://blackfire.io/docs/player/index) là ứng dụng Web Crawling, Web Testing và Web Scraping mã nguồn mở, có thể phối hợp với Blackfire để script các kịch bản profiling.

Để bật Blackfire, hãy sử dụng thiết lập "features" trong file cấu hình Homestead:

```yaml
features:
    - blackfire:
        server_id: "server_id"
        server_token: "server_value"
        client_id: "client_id"
        client_token: "client_value"
```

Thông tin xác thực server và client của Blackfire [yêu cầu tài khoản Blackfire](https://blackfire.io/signup). Blackfire cung cấp nhiều cách để profile ứng dụng, gồm công cụ CLI và browser extension. Hãy [xem tài liệu Blackfire để biết thêm chi tiết](https://blackfire.io/docs/php/integrations/laravel/index).

<a name="network-interfaces"></a>
## Giao diện mạng

Thuộc tính `networks` của file `Homestead.yaml` cấu hình các giao diện mạng cho máy ảo Homestead. Bạn có thể cấu hình số lượng interface tùy nhu cầu:

```yaml
networks:
    - type: "private_network"
      ip: "192.168.10.20"
```

Để bật interface [bridged](https://developer.hashicorp.com/vagrant/docs/networking/public_network), hãy cấu hình thiết lập `bridge` cho network và đổi loại network thành `public_network`:

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
```

Để bật [DHCP](https://developer.hashicorp.com/vagrant/docs/networking/public_network#dhcp), chỉ cần xóa tùy chọn `ip` khỏi cấu hình:

```yaml
networks:
    - type: "public_network"
      bridge: "en1: Wi-Fi (AirPort)"
```

Để thay đổi thiết bị mà network sử dụng, bạn có thể thêm tùy chọn `dev` vào cấu hình network. Giá trị `dev` mặc định là `eth0`:

```yaml
networks:
    - type: "public_network"
      ip: "192.168.10.20"
      bridge: "en1: Wi-Fi (AirPort)"
      dev: "enp2s0"
```

<a name="extending-homestead"></a>
## Mở rộng Homestead

Bạn có thể mở rộng Homestead bằng script `after.sh` ở thư mục gốc Homestead. Trong file này, bạn có thể thêm bất kỳ shell command nào cần thiết để cấu hình và tùy biến máy ảo.

Khi tùy biến Homestead, Ubuntu có thể hỏi bạn muốn giữ cấu hình gốc của package hay ghi đè bằng file cấu hình mới. Để tránh việc này, bạn nên sử dụng lệnh sau khi cài package nhằm tránh ghi đè bất kỳ cấu hình nào mà Homestead đã ghi trước đó:

```shell
sudo apt-get -y \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    install package-name
```

<a name="user-customizations"></a>
### Tùy biến người dùng

Khi sử dụng Homestead cùng team, bạn có thể muốn tinh chỉnh Homestead để phù hợp hơn với phong cách phát triển cá nhân. Để làm vậy, bạn có thể tạo file `user-customizations.sh` ở thư mục gốc Homestead (cùng thư mục chứa `Homestead.yaml`). Trong file này, bạn có thể thực hiện các tùy biến mong muốn; tuy nhiên, `user-customizations.sh` không nên được đưa vào version control.

<a name="provider-specific-settings"></a>
## Thiết lập riêng theo provider

<a name="provider-specific-virtualbox"></a>
### VirtualBox

<a name="natdnshostresolver"></a>
#### `natdnshostresolver`

Theo mặc định, Homestead cấu hình thiết lập `natdnshostresolver` thành `on`. Điều này cho phép Homestead sử dụng thiết lập DNS của hệ điều hành host. Nếu muốn ghi đè hành vi này, hãy thêm các tùy chọn cấu hình sau vào file `Homestead.yaml`:

```yaml
provider: virtualbox
natdnshostresolver: 'off'
```

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/homestead). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
