# MongoDB

- [Giới thiệu](#introduction)
- [Cài đặt](#installation)
    - [MongoDB Driver](#mongodb-driver)
    - [Khởi động MongoDB Server](#starting-a-mongodb-server)
    - [Cài Laravel MongoDB Package](#install-the-laravel-mongodb-package)
- [Cấu hình](#configuration)
- [Tính năng](#features)

<a name="introduction"></a>
## Giới thiệu

[MongoDB](https://www.mongodb.com/resources/products/fundamentals/why-use-mongodb) là một trong những document-oriented NoSQL database phổ biến nhất. MongoDB phù hợp với workload có lượng ghi lớn, chẳng hạn analytics hoặc IoT, đồng thời hỗ trợ high availability nhờ việc cấu hình replica set và automatic failover tương đối thuận tiện. Database cũng có thể được shard để scale theo chiều ngang và cung cấp query language mạnh cho aggregation, text search hay geospatial query.

Thay vì lưu dữ liệu trong table gồm row và column như SQL database, mỗi record trong MongoDB là một document được mô tả bằng BSON — biểu diễn nhị phân của dữ liệu. Ứng dụng sau đó có thể truy xuất thông tin này ở định dạng JSON. MongoDB hỗ trợ nhiều kiểu dữ liệu, bao gồm document, array, embedded document và binary data.

Trước khi dùng MongoDB với Laravel, Laravel khuyến nghị cài package `mongodb/laravel-mongodb` qua Composer. Package `laravel-mongodb` được MongoDB chính thức duy trì. Dù PHP hỗ trợ MongoDB trực tiếp thông qua MongoDB driver, package [Laravel MongoDB](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/) cung cấp mức tích hợp sâu hơn với Eloquent và các tính năng khác của Laravel:

```shell
composer require mongodb/laravel-mongodb
```

<a name="installation"></a>
## Cài đặt

<a name="mongodb-driver"></a>
### MongoDB Driver

Để kết nối tới MongoDB database, PHP cần extension `mongodb`. Nếu bạn phát triển local bằng [Laravel Herd](https://herd.laravel.com) hoặc cài PHP thông qua `php.new`, extension này đã có sẵn trên hệ thống. Nếu cần cài thủ công, bạn có thể sử dụng PECL:

```shell
pecl install mongodb
```

Để biết thêm thông tin, hãy xem [hướng dẫn cài MongoDB PHP extension](https://www.php.net/manual/en/mongodb.installation.php).

<a name="starting-a-mongodb-server"></a>
### Khởi động MongoDB Server

MongoDB Community Server có thể được dùng để chạy MongoDB local và hỗ trợ cài đặt trên Windows, macOS, Linux hoặc dưới dạng Docker container. Để biết cách cài MongoDB, hãy tham khảo [hướng dẫn cài MongoDB Community chính thức](https://docs.mongodb.com/manual/administration/install-community/).

Connection string của MongoDB server có thể được khai báo trong file `.env`:

```ini
MONGODB_URI="mongodb://localhost:27017"
MONGODB_DATABASE="laravel_app"
```

Nếu muốn host MongoDB trên cloud, bạn có thể cân nhắc [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
Để ứng dụng local truy cập được một MongoDB Atlas cluster, bạn cần [thêm IP address của mình trong network settings của cluster](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/) vào IP Access List của project.

Connection string cho MongoDB Atlas cũng có thể đặt trong `.env`:

```ini
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"
MONGODB_DATABASE="laravel_app"
```

<a name="install-the-laravel-mongodb-package"></a>
### Cài Laravel MongoDB Package

Cuối cùng, dùng Composer để cài Laravel MongoDB package:

```shell
composer require mongodb/laravel-mongodb
```

> [!NOTE]
> Việc cài package sẽ thất bại nếu PHP extension `mongodb` chưa được cài. Cấu hình PHP của CLI và web server có thể khác nhau, vì vậy hãy bảo đảm extension được bật ở cả hai môi trường.

<a name="configuration"></a>
## Cấu hình

Bạn có thể cấu hình kết nối MongoDB trong file `config/database.php` của ứng dụng. Bên trong file này, thêm connection `mongodb` sử dụng driver `mongodb`:

```php
'connections' => [
    'mongodb' => [
        'driver' => 'mongodb',
        'dsn' => env('MONGODB_URI', 'mongodb://localhost:27017'),
        'database' => env('MONGODB_DATABASE', 'laravel_app'),
    ],
],
```

<a name="features"></a>
## Tính năng

Sau khi cấu hình hoàn tất, bạn có thể sử dụng package `mongodb` và database connection trong ứng dụng để tận dụng nhiều tính năng:

- Với [Eloquent](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/eloquent-models/), model có thể được lưu trong MongoDB collection. Bên cạnh các tính năng Eloquent tiêu chuẩn, Laravel MongoDB package còn cung cấp các khả năng như embedded relationships. Package cũng cho phép truy cập trực tiếp MongoDB driver để thực hiện raw query và aggregation pipeline.
- [Viết query phức tạp](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/query-builder/) bằng query builder.
- [Similarity / vector search](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/fundamentals/vector-search/) với vector embedding và Eloquent method `vectorSearch`.
- [Cache driver](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/cache/) `mongodb` được tối ưu để sử dụng các tính năng MongoDB như TTL index nhằm tự động xóa cache entry hết hạn.
- [Dispatch và xử lý queued job](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/queues/) bằng queue driver `mongodb`.
- [Lưu file trong GridFS](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/filesystems/) thông qua [GridFS Adapter for Flysystem](https://flysystem.thephpleague.com/docs/adapter/gridfs/).
- [Full-text search](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/scout/) bằng Scout engine `mongodb`.
- Phần lớn package bên thứ ba sử dụng database connection hoặc Eloquent có thể hoạt động với MongoDB.

Để tiếp tục tìm hiểu cách sử dụng MongoDB cùng Laravel, hãy xem [Quick Start guide](https://www.mongodb.com/docs/drivers/php/laravel-mongodb/current/quick-start/) của MongoDB.

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/mongodb). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
