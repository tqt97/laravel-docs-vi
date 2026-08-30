# Lưu trữ file

<a name="introduction"></a>
## Giới thiệu

Laravel cung cấp một lớp trừu tượng filesystem mạnh mẽ nhờ package PHP [Flysystem](https://github.com/thephpleague/flysystem) của Frank de Jonge. Tích hợp Flysystem của Laravel cung cấp các driver đơn giản để làm việc với filesystem local, SFTP và Amazon S3. Đặc biệt, bạn có thể chuyển đổi rất dễ dàng giữa các tùy chọn lưu trữ này trên máy phát triển local và máy chủ production vì API của từng hệ thống vẫn giống nhau.

<a name="configuration"></a>
## Cấu hình

File cấu hình filesystem của Laravel nằm tại `config/filesystems.php`. Trong file này, bạn có thể cấu hình tất cả các "disk" của filesystem. Mỗi disk đại diện cho một driver lưu trữ và một vị trí lưu trữ cụ thể. File cấu hình đã bao gồm cấu hình mẫu cho từng driver được hỗ trợ để bạn có thể điều chỉnh theo lựa chọn lưu trữ và thông tin xác thực của mình.

Driver `local` tương tác với các file được lưu cục bộ trên máy chủ chạy ứng dụng Laravel, trong khi driver lưu trữ `sftp` được dùng cho FTP dựa trên khóa SSH. Driver `s3` được dùng để ghi dữ liệu lên dịch vụ lưu trữ đám mây Amazon S3.

> [!NOTE]
> Bạn có thể cấu hình bao nhiêu disk tùy ý và thậm chí có thể có nhiều disk sử dụng cùng một driver.

<a name="the-local-driver"></a>
### Driver Local

Khi sử dụng driver `local`, mọi thao tác với file đều tương đối so với thư mục `root` được định nghĩa trong file cấu hình `filesystems`. Theo mặc định, giá trị này là thư mục `storage/app/private`. Vì vậy, đoạn mã sau sẽ ghi vào `storage/app/private/example.txt`:

```php
use Illuminate\Support\Facades\Storage;

Storage::disk('local')->put('example.txt', 'Contents');
```

<a name="the-public-disk"></a>
### Disk Public

Disk `public` có sẵn trong file cấu hình `filesystems` của ứng dụng dành cho các file cần được truy cập công khai. Theo mặc định, disk `public` sử dụng driver `local` và lưu file trong `storage/app/public`.

Nếu disk `public` sử dụng driver `local` và bạn muốn các file này có thể truy cập từ web, hãy tạo symbolic link từ thư mục nguồn `storage/app/public` đến thư mục đích `public/storage`:

Để tạo symbolic link, bạn có thể sử dụng lệnh Artisan `storage:link`:

```shell
php artisan storage:link
```

Sau khi file được lưu và symbolic link đã được tạo, bạn có thể tạo URL đến file bằng helper `asset`:

```php
echo asset('storage/file.txt');
```

Bạn có thể cấu hình thêm các symbolic link trong file cấu hình `filesystems`. Mỗi link đã cấu hình sẽ được tạo khi bạn chạy lệnh `storage:link`:

```php
'links' => [
    public_path('storage') => storage_path('app/public'),
    public_path('images') => storage_path('app/images'),
],
```

Bạn có thể dùng lệnh `storage:unlink` để xóa các symbolic link đã cấu hình:

```shell
php artisan storage:unlink
```

<a name="driver-prerequisites"></a>
### Điều kiện tiên quyết của driver

<a name="s3-driver-configuration"></a>
#### Cấu hình driver S3

Trước khi sử dụng driver S3, bạn cần cài package Flysystem S3 thông qua Composer:

```shell
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
```

Mảng cấu hình cho disk S3 nằm trong file cấu hình `config/filesystems.php`. Thông thường, bạn nên cấu hình thông tin và credential S3 bằng các biến môi trường sau, vốn được tham chiếu từ file cấu hình `config/filesystems.php`:

```ini
AWS_ACCESS_KEY_ID=<your-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=<your-bucket-name>
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Để thuận tiện, các biến môi trường này tuân theo quy ước đặt tên được AWS CLI sử dụng.

<a name="ftp-driver-configuration"></a>
#### Cấu hình driver FTP

Trước khi sử dụng driver FTP, bạn cần cài package Flysystem FTP thông qua Composer:

```shell
composer require league/flysystem-ftp "^3.0"
```

Tích hợp Flysystem của Laravel hoạt động tốt với FTP; tuy nhiên, file `config/filesystems.php` mặc định của framework không bao gồm cấu hình mẫu. Nếu cần cấu hình FTP filesystem, bạn có thể tham khảo ví dụ dưới đây:

```php
'ftp' => [
    'driver' => 'ftp',
    'host' => env('FTP_HOST'),
    'username' => env('FTP_USERNAME'),
    'password' => env('FTP_PASSWORD'),

    // Optional FTP Settings...
    // 'port' => env('FTP_PORT', 21),
    // 'root' => env('FTP_ROOT'),
    // 'passive' => true,
    // 'ssl' => true,
    // 'timeout' => 30,
],
```

<a name="sftp-driver-configuration"></a>
#### Cấu hình driver SFTP

Trước khi sử dụng driver SFTP, bạn cần cài package Flysystem SFTP thông qua Composer:

```shell
composer require league/flysystem-sftp-v3 "^3.0"
```

Tích hợp Flysystem của Laravel hoạt động tốt với SFTP; tuy nhiên, file `config/filesystems.php` mặc định của framework không bao gồm cấu hình mẫu. Nếu cần cấu hình SFTP filesystem, bạn có thể tham khảo ví dụ dưới đây:

```php
'sftp' => [
    'driver' => 'sftp',
    'host' => env('SFTP_HOST'),

    // Settings for basic authentication...
    'username' => env('SFTP_USERNAME'),
    'password' => env('SFTP_PASSWORD'),

    // Settings for SSH key-based authentication with encryption password...
    'privateKey' => env('SFTP_PRIVATE_KEY'),
    'passphrase' => env('SFTP_PASSPHRASE'),

    // Settings for file / directory permissions...
    'visibility' => 'private', // `private` = 0600, `public` = 0644
    'directory_visibility' => 'private', // `private` = 0700, `public` = 0755

    // Optional SFTP Settings...
    // 'hostFingerprint' => env('SFTP_HOST_FINGERPRINT'),
    // 'maxTries' => 4,
    // 'passphrase' => env('SFTP_PASSPHRASE'),
    // 'port' => env('SFTP_PORT', 22),
    // 'root' => env('SFTP_ROOT', ''),
    // 'timeout' => 30,
    // 'useAgent' => true,
],
```

<a name="scoped-and-read-only-filesystems"></a>
### Filesystem Scoped, Read-Only và Read-Through

Scoped disk cho phép bạn định nghĩa một filesystem mà mọi đường dẫn đều tự động được thêm một tiền tố đường dẫn đã chỉ định. Trước khi tạo scoped filesystem disk, bạn cần cài thêm một package Flysystem thông qua Composer:

```shell
composer require league/flysystem-path-prefixing "^3.0"
```

Bạn có thể tạo một instance giới hạn theo đường dẫn từ bất kỳ filesystem disk hiện có nào bằng cách định nghĩa disk sử dụng driver `scoped`. Ví dụ, bạn có thể giới hạn disk `s3` hiện có vào một tiền tố đường dẫn cụ thể; sau đó mọi thao tác file qua scoped disk sẽ sử dụng tiền tố đó:

```php
's3-videos' => [
    'driver' => 'scoped',
    'disk' => 's3',
    'prefix' => 'path/to/videos',
],
```

Disk "read-only" cho phép bạn tạo filesystem disk không cho phép thao tác ghi. Trước khi sử dụng tùy chọn cấu hình `read-only`, bạn cần cài thêm một package Flysystem thông qua Composer:

```shell
composer require league/flysystem-read-only "^3.0"
```

Tiếp theo, bạn có thể thêm tùy chọn cấu hình `read-only` vào một hoặc nhiều mảng cấu hình disk:

```php
's3-videos' => [
    'driver' => 's3',
    // ...
    'read-only' => true,
],
```

Read-through disk cho phép bạn di chuyển file giữa các disk mà không cần downtime. Khi đọc một file, Laravel kiểm tra primary disk trước. Nếu file chỉ tồn tại trên fallback disk, Laravel sẽ đọc file từ fallback disk và sao chép sang primary disk để phục vụ các request sau:

```php
'assets' => [
    'driver' => 'read-through',
    'primary' => 's3',
    'fallback' => 'legacy-s3',
],
```

Các thao tác ghi và liệt kê thư mục sử dụng primary disk. Việc kiểm tra file tồn tại và metadata có thể dùng một trong hai disk mà không sao chép file sang primary disk. Nếu việc sao chép file từ fallback disk sang primary disk thất bại, thao tác đọc mặc định vẫn thành công. Nếu muốn ném exception thay vào đó, hãy đặt tùy chọn cấu hình `throw_on_promotion_failure` thành `true`.

<a name="amazon-s3-compatible-filesystems"></a>
### Filesystem tương thích Amazon S3

Mặc định, file cấu hình `filesystems` của ứng dụng chứa cấu hình disk `s3`. Ngoài việc dùng disk này để tương tác với [Amazon S3](https://aws.amazon.com/s3/), bạn cũng có thể dùng nó với bất kỳ dịch vụ lưu trữ file tương thích S3 nào như [RustFS](https://github.com/rustfs/rustfs), [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/), [Vultr Object Storage](https://www.vultr.com/products/object-storage/), [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/) hoặc [Hetzner Cloud Storage](https://www.hetzner.com/storage/object-storage/).

Thông thường, sau khi cập nhật thông tin xác thực của disk cho phù hợp với dịch vụ sẽ sử dụng, bạn chỉ cần cập nhật giá trị tùy chọn cấu hình `endpoint`. Giá trị này thường được định nghĩa qua biến môi trường `AWS_ENDPOINT`:

```php
'endpoint' => env('AWS_ENDPOINT', 'https://rustfs:9000'),
```

<a name="obtaining-disk-instances"></a>
## Lấy instance của disk

Facade `Storage` có thể được dùng để tương tác với bất kỳ disk nào đã cấu hình. Ví dụ, bạn có thể dùng phương thức `put` trên facade để lưu avatar vào disk mặc định. Nếu gọi phương thức trên facade `Storage` mà không gọi `disk` trước, phương thức sẽ tự động được chuyển đến disk mặc định:

```php
use Illuminate\Support\Facades\Storage;

Storage::put('avatars/1', $content);
```

Nếu ứng dụng tương tác với nhiều disk, bạn có thể dùng phương thức `disk` trên facade `Storage` để làm việc với file trên một disk cụ thể:

```php
Storage::disk('s3')->put('avatars/1', $content);
```

<a name="on-demand-disks"></a>
### Disk theo yêu cầu

Đôi khi bạn cần tạo disk tại runtime từ một cấu hình nhất định mà không cần cấu hình đó tồn tại trong file cấu hình `filesystems` của ứng dụng. Để thực hiện, hãy truyền một mảng cấu hình vào phương thức `build` của facade `Storage`:

```php
use Illuminate\Support\Facades\Storage;

$disk = Storage::build([
    'driver' => 'local',
    'root' => '/path/to/root',
]);

$disk->put('image.jpg', $content);
```

<a name="retrieving-files"></a>
## Truy xuất file

Phương thức `get` có thể được dùng để lấy nội dung của file. Phương thức trả về nội dung chuỗi thô của file. Hãy nhớ rằng mọi đường dẫn file phải được chỉ định tương đối so với vị trí `root` của disk:

```php
$contents = Storage::get('file.jpg');
```

Nếu file cần lấy chứa JSON, bạn có thể dùng phương thức `json` để lấy file và giải mã nội dung:

```php
$orders = Storage::json('orders.json');
```

Phương thức `exists` có thể được dùng để xác định một file có tồn tại trên disk hay không:

```php
if (Storage::disk('s3')->exists('file.jpg')) {
    // ...
}
```

Phương thức `missing` có thể được dùng để xác định một file có không tồn tại trên disk hay không:

```php
if (Storage::disk('s3')->missing('file.jpg')) {
    // ...
}
```

<a name="downloading-files"></a>
### Tải file xuống

Phương thức `download` có thể tạo response buộc trình duyệt của người dùng tải file tại đường dẫn đã cho. Đối số thứ hai của `download` là tên file mà người dùng sẽ thấy khi tải xuống. Cuối cùng, bạn có thể truyền một mảng HTTP header làm đối số thứ ba:

```php
return Storage::download('file.jpg');

return Storage::download('file.jpg', $name, $headers);
```

<a name="file-urls"></a>
### URL của file

Bạn có thể dùng phương thức `url` để lấy URL của một file. Với driver `local`, phương thức thường chỉ thêm `/storage` vào đầu đường dẫn và trả về URL tương đối của file. Với driver `s3`, phương thức trả về remote URL đầy đủ:

```php
use Illuminate\Support\Facades\Storage;

$url = Storage::url('file.jpg');
```

Khi dùng driver `local`, mọi file cần truy cập công khai nên được đặt trong thư mục `storage/app/public`. Ngoài ra, bạn nên [tạo symbolic link](#the-public-disk) tại `public/storage` trỏ tới thư mục `storage/app/public`.

> [!WARNING]
> Khi dùng driver `local`, giá trị trả về của `url` không được URL encode. Vì vậy, bạn nên luôn lưu file với tên có thể tạo thành URL hợp lệ.

<a name="url-host-customization"></a>
#### Tùy chỉnh host của URL

Nếu muốn thay đổi host cho URL được tạo bằng facade `Storage`, bạn có thể thêm hoặc thay đổi tùy chọn `url` trong mảng cấu hình disk:

```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
    'throw' => false,
],
```

<a name="temporary-urls"></a>
### URL tạm thời

Với phương thức `temporaryUrl`, bạn có thể tạo URL tạm thời cho file được lưu bằng driver `local` và `s3`. Phương thức nhận một đường dẫn và một instance `DateTime` xác định thời điểm URL hết hạn:

```php
use Illuminate\Support\Facades\Storage;

$url = Storage::temporaryUrl(
    'file.jpg', now()->plus(minutes: 5)
);
```

<a name="enabling-local-temporary-urls"></a>
#### Bật URL tạm thời cho Local

Nếu ứng dụng được phát triển trước khi driver `local` hỗ trợ URL tạm thời, bạn có thể cần bật tính năng này. Hãy thêm tùy chọn `serve` vào mảng cấu hình disk `local` trong file `config/filesystems.php`:

```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app/private'),
    'serve' => true, // [tl! add]
    'throw' => false,
],
```

<a name="s3-request-parameters"></a>
#### Tham số request S3

Nếu cần chỉ định thêm [tham số request S3](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html#RESTObjectGET-requests), bạn có thể truyền mảng tham số request làm đối số thứ ba cho `temporaryUrl`:

```php
$url = Storage::temporaryUrl(
    'file.jpg',
    now()->plus(minutes: 5),
    [
        'ResponseContentType' => 'application/octet-stream',
        'ResponseContentDisposition' => 'attachment; filename=file2.jpg',
    ]
);
```

<a name="customizing-temporary-urls"></a>
#### Tùy chỉnh URL tạm thời

Nếu cần tùy chỉnh cách tạo URL tạm thời cho một storage disk cụ thể, bạn có thể dùng `buildTemporaryUrlsUsing`. Ví dụ, cách này hữu ích khi có controller cho phép tải file từ một disk vốn không hỗ trợ URL tạm thời. Thông thường, phương thức này nên được gọi trong `boot` của service provider:

```php
<?php

namespace App\Providers;

use DateTime;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Storage::disk('local')->buildTemporaryUrlsUsing(
            function (string $path, DateTime $expiration, array $options) {
                return URL::temporarySignedRoute(
                    'files.download',
                    $expiration,
                    array_merge($options, ['path' => $path])
                );
            }
        );
    }
}
```

<a name="temporary-upload-urls"></a>
#### URL upload tạm thời

> [!WARNING]
> Khả năng tạo URL upload tạm thời chỉ được hỗ trợ bởi driver `s3` và `local`.

Nếu cần tạo URL tạm thời để ứng dụng phía client upload file trực tiếp, bạn có thể dùng `temporaryUploadUrl`. Phương thức nhận một đường dẫn và một instance `DateTime` xác định thời điểm URL hết hạn. `temporaryUploadUrl` trả về associative array có thể destructure thành URL upload và các header cần gửi kèm request upload:

```php
use Illuminate\Support\Facades\Storage;

['url' => $url, 'headers' => $headers] = Storage::temporaryUploadUrl(
    'file.jpg', now()->plus(minutes: 5)
);
```

Phương thức này đặc biệt hữu ích trong môi trường serverless, nơi ứng dụng phía client cần tải file trực tiếp lên hệ thống lưu trữ đám mây như Amazon S3.

<a name="file-metadata"></a>
### Metadata của file

Ngoài việc đọc và ghi file, Laravel còn có thể cung cấp thông tin về chính các file đó. Ví dụ, phương thức `size` có thể được dùng để lấy kích thước file theo byte:

```php
use Illuminate\Support\Facades\Storage;

$size = Storage::size('file.jpg');
```

Phương thức `lastModified` trả về UNIX timestamp của lần cuối file được chỉnh sửa:

```php
$time = Storage::lastModified('file.jpg');
```

Có thể lấy MIME type của một file bằng phương thức `mimeType`:

```php
$mime = Storage::mimeType('file.jpg');
```

<a name="file-paths"></a>
#### Đường dẫn file

Bạn có thể dùng phương thức `path` để lấy đường dẫn của một file. Nếu sử dụng driver `local`, phương thức này trả về đường dẫn tuyệt đối tới file. Nếu sử dụng driver `s3`, phương thức này trả về đường dẫn tương đối của file trong S3 bucket:

```php
use Illuminate\Support\Facades\Storage;

$path = Storage::path('file.jpg');
```

<a name="storing-files"></a>
## Lưu file

Phương thức `put` có thể được dùng để lưu nội dung file vào một disk. Bạn cũng có thể truyền một PHP `resource` cho `put`; khi đó Flysystem sẽ sử dụng cơ chế stream bên dưới. Lưu ý rằng mọi đường dẫn file phải được chỉ định tương đối so với vị trí "root" đã cấu hình cho disk:

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents);

Storage::put('file.jpg', $resource);
```

<a name="failed-writes"></a>
#### Ghi file thất bại

Nếu phương thức `put` (hoặc thao tác "write" khác) không thể ghi file vào disk, giá trị `false` sẽ được trả về:

```php
if (! Storage::put('file.jpg', $contents)) {
    // The file could not be written to disk...
}
```

Nếu muốn, bạn có thể khai báo tùy chọn `throw` trong mảng cấu hình filesystem disk. Khi tùy chọn này là `true`, các phương thức ghi như `put` sẽ ném một instance của `League\Flysystem\UnableToWriteFile` khi thao tác ghi thất bại:

```php
'public' => [
    'driver' => 'local',
    // ...
    'throw' => true,
],
```

<a name="prepending-appending-to-files"></a>
### Thêm nội dung vào đầu và cuối file

Các phương thức `prepend` và `append` cho phép ghi nội dung vào đầu hoặc cuối file:

```php
Storage::prepend('file.log', 'Prepended Text');

Storage::append('file.log', 'Appended Text');
```

<a name="copying-moving-files"></a>
### Sao chép và di chuyển file

Phương thức `copy` có thể sao chép một file hiện có sang vị trí mới trên disk, còn `move` có thể đổi tên hoặc di chuyển file sang vị trí mới:

```php
Storage::copy('old/file.jpg', 'new/file.jpg');

Storage::move('old/file.jpg', 'new/file.jpg');
```

<a name="automatic-streaming"></a>
### Streaming tự động

Streaming file vào storage giúp giảm đáng kể mức sử dụng bộ nhớ. Nếu muốn Laravel tự động quản lý việc stream file tới vị trí lưu trữ, bạn có thể dùng `putFile` hoặc `putFileAs`. Các phương thức này nhận instance `Illuminate\Http\File` hoặc `Illuminate\Http\UploadedFile` và tự động stream file tới vị trí mong muốn:

```php
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;

// Automatically generate a unique ID for filename...
$path = Storage::putFile('photos', new File('/path/to/photo'));

// Manually specify a filename...
$path = Storage::putFileAs('photos', new File('/path/to/photo'), 'photo.jpg');
```

Có một số điểm quan trọng cần lưu ý về `putFile`. Trong ví dụ trên, chúng ta chỉ chỉ định tên thư mục mà không chỉ định tên file. Mặc định, `putFile` tạo một ID duy nhất làm tên file. Phần mở rộng được xác định dựa trên MIME type của file. `putFile` trả về đường dẫn file, bao gồm cả tên file đã sinh, để bạn có thể lưu đường dẫn đó vào cơ sở dữ liệu.

Các phương thức `putFile` và `putFileAs` cũng nhận một đối số để chỉ định "visibility" của file được lưu. Điều này đặc biệt hữu ích khi lưu file trên cloud disk như Amazon S3 và muốn file có thể được truy cập công khai thông qua URL được tạo:

```php
Storage::putFile('photos', new File('/path/to/photo'), 'public');
```

<a name="file-uploads"></a>
### Upload file

Trong ứng dụng web, một trong những trường hợp lưu file phổ biến nhất là lưu các file người dùng tải lên, chẳng hạn ảnh và tài liệu. Laravel giúp việc này rất đơn giản thông qua phương thức `store` trên instance file đã upload. Hãy gọi `store` với đường dẫn nơi bạn muốn lưu file:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserAvatarController extends Controller
{
    /**
     * Update the avatar for the user.
     */
    public function update(Request $request): string
    {
        $path = $request->file('avatar')->store('avatars');

        return $path;
    }
}
```

Có một số điểm quan trọng cần lưu ý trong ví dụ này. Chúng ta chỉ chỉ định tên thư mục, không chỉ định tên file. Mặc định, `store` tạo một ID duy nhất làm tên file. Phần mở rộng được xác định dựa trên MIME type của file. `store` trả về đường dẫn file, bao gồm tên file đã sinh, để bạn có thể lưu đường dẫn đó vào cơ sở dữ liệu.

Bạn cũng có thể gọi `putFile` trên facade `Storage` để thực hiện thao tác lưu file tương tự ví dụ trên:

```php
$path = Storage::putFile('avatars', $request->file('avatar'));
```

<a name="specifying-a-file-name"></a>
#### Chỉ định tên file

Nếu không muốn tên file được tự động gán, bạn có thể dùng `storeAs`, phương thức nhận đường dẫn, tên file và disk (tùy chọn) làm đối số:

```php
$path = $request->file('avatar')->storeAs(
    'avatars', $request->user()->id
);
```

Bạn cũng có thể dùng `putFileAs` trên facade `Storage` để thực hiện thao tác lưu file tương tự ví dụ trên:

```php
$path = Storage::putFileAs(
    'avatars', $request->file('avatar'), $request->user()->id
);
```

> [!WARNING]
> Các ký tự Unicode không thể in hoặc không hợp lệ sẽ tự động bị loại bỏ khỏi đường dẫn file. Vì vậy, bạn nên làm sạch đường dẫn trước khi truyền vào các phương thức lưu trữ file của Laravel. Đường dẫn được chuẩn hóa bằng phương thức `League\Flysystem\WhitespacePathNormalizer::normalizePath`.

<a name="specifying-a-disk"></a>
#### Chỉ định disk

Mặc định, phương thức `store` của file đã upload sẽ sử dụng disk mặc định. Nếu muốn chỉ định disk khác, hãy truyền tên disk làm đối số thứ hai cho `store`:

```php
$path = $request->file('avatar')->store(
    'avatars/'.$request->user()->id, 's3'
);
```

Nếu sử dụng `storeAs`, bạn có thể truyền tên disk làm đối số thứ ba:

```php
$path = $request->file('avatar')->storeAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="other-uploaded-file-information"></a>
#### Thông tin khác của file đã upload

Nếu muốn lấy tên và phần mở rộng gốc của file đã upload, bạn có thể dùng `getClientOriginalName` và `getClientOriginalExtension`:

```php
$file = $request->file('avatar');

$name = $file->getClientOriginalName();
$extension = $file->getClientOriginalExtension();
```

Tuy nhiên, `getClientOriginalName` và `getClientOriginalExtension` được xem là không an toàn vì tên và phần mở rộng file có thể bị người dùng độc hại giả mạo. Vì vậy, thông thường bạn nên ưu tiên `hashName` và `extension` để lấy tên và phần mở rộng cho file đã upload:

```php
$file = $request->file('avatar');

$name = $file->hashName(); // Generate a unique, random name...
$extension = $file->extension(); // Determine the file's extension based on the file's MIME type...
```

<a name="file-visibility"></a>
### Khả năng truy cập file

Trong tích hợp Flysystem của Laravel, "visibility" là lớp trừu tượng hóa quyền truy cập file trên nhiều nền tảng. File có thể được khai báo là `public` hoặc `private`. Khi một file là `public`, điều đó cho biết file nhìn chung có thể được người khác truy cập. Ví dụ, với driver S3, bạn có thể lấy URL cho các file `public`.

Bạn có thể thiết lập visibility khi ghi file thông qua phương thức `put`:

```php
use Illuminate\Support\Facades\Storage;

Storage::put('file.jpg', $contents, 'public');
```

Nếu file đã được lưu, bạn có thể lấy và thiết lập visibility bằng `getVisibility` và `setVisibility`:

```php
$visibility = Storage::getVisibility('file.jpg');

Storage::setVisibility('file.jpg', 'public');
```

Khi làm việc với file đã upload, bạn có thể dùng `storePublicly` và `storePubliclyAs` để lưu file với visibility `public`:

```php
$path = $request->file('avatar')->storePublicly('avatars', 's3');

$path = $request->file('avatar')->storePubliclyAs(
    'avatars',
    $request->user()->id,
    's3'
);
```

<a name="image-manipulation"></a>
### Xử lý ảnh

Nếu cần thay đổi kích thước, cắt hoặc chuyển đổi ảnh đã upload trước khi lưu, bạn có thể dùng [tính năng xử lý ảnh](/images) của Laravel:

```php
$path = $request->image('avatar')
    ->cover(400, 400)
    ->toWebp()
    ->storePublicly('avatars', 'public');
```

Bạn cũng có thể tạo image instance từ một file đã được lưu trên một filesystem disk:

```php
$image = Storage::disk('public')->image('avatars/photo.jpg');
```

<a name="local-files-and-visibility"></a>
#### File Local và khả năng truy cập

Khi dùng driver `local`, [visibility](#file-visibility) `public` tương ứng với quyền `0755` cho thư mục và `0644` cho file. Bạn có thể thay đổi ánh xạ quyền trong file cấu hình `filesystems` của ứng dụng:

```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app'),
    'permissions' => [
        'file' => [
            'public' => 0644,
            'private' => 0600,
        ],
        'dir' => [
            'public' => 0755,
            'private' => 0700,
        ],
    ],
    'throw' => false,
],
```

<a name="deleting-files"></a>
## Xóa file

Phương thức `delete` nhận một tên file hoặc một mảng các file cần xóa:

```php
use Illuminate\Support\Facades\Storage;

Storage::delete('file.jpg');

Storage::delete(['file.jpg', 'file2.jpg']);
```

Nếu cần, bạn có thể chỉ định disk chứa file cần xóa:

```php
use Illuminate\Support\Facades\Storage;

Storage::disk('s3')->delete('path/file.jpg');
```

<a name="directories"></a>
## Thư mục

<a name="get-all-files-within-a-directory"></a>
#### Lấy tất cả file trong một thư mục

Phương thức `files` trả về mảng gồm tất cả file trong một thư mục. Nếu muốn lấy danh sách tất cả file bao gồm cả các thư mục con, bạn có thể dùng `allFiles`:

```php
use Illuminate\Support\Facades\Storage;

$files = Storage::files($directory);

$files = Storage::allFiles($directory);
```

<a name="get-all-directories-within-a-directory"></a>
#### Lấy tất cả thư mục con trong một thư mục

Phương thức `directories` trả về mảng gồm tất cả thư mục con trực tiếp trong một thư mục. Nếu muốn lấy toàn bộ thư mục con ở mọi cấp, bạn có thể dùng `allDirectories`:

```php
$directories = Storage::directories($directory);

$directories = Storage::allDirectories($directory);
```

<a name="create-a-directory"></a>
#### Tạo thư mục

Phương thức `makeDirectory` tạo thư mục được chỉ định, bao gồm cả các thư mục cha/con cần thiết:

```php
Storage::makeDirectory($directory);
```

<a name="delete-a-directory"></a>
#### Xóa thư mục

Cuối cùng, `deleteDirectory` có thể được dùng để xóa một thư mục cùng toàn bộ file bên trong:

```php
Storage::deleteDirectory($directory);
```

<a name="testing"></a>
## Kiểm thử

Phương thức `fake` của facade `Storage` cho phép dễ dàng tạo một fake disk. Khi kết hợp với các tiện ích tạo file của `Illuminate\Http\UploadedFile`, việc kiểm thử upload file trở nên đơn giản hơn đáng kể. Ví dụ:

```php tab=Pest
<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('albums can be uploaded', function () {
    Storage::fake('photos');

    $response = $this->json('POST', '/photos', [
        UploadedFile::fake()->image('photo1.jpg'),
        UploadedFile::fake()->image('photo2.jpg')
    ]);

    // Assert one or more files were stored...
    Storage::disk('photos')->assertExists('photo1.jpg');
    Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

    // Assert one or more files were not stored...
    Storage::disk('photos')->assertMissing('missing.jpg');
    Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

    // Assert that the number of files in a given directory matches the expected count...
    Storage::disk('photos')->assertCount('/wallpapers', 2);

    // Assert that a given directory is empty...
    Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');

    // Assert that the disk contains no files...
    Storage::disk('photos')->assertEmpty();
});
```

```php tab=PHPUnit
<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_albums_can_be_uploaded(): void
    {
        Storage::fake('photos');

        $response = $this->json('POST', '/photos', [
            UploadedFile::fake()->image('photo1.jpg'),
            UploadedFile::fake()->image('photo2.jpg')
        ]);

        // Assert one or more files were stored...
        Storage::disk('photos')->assertExists('photo1.jpg');
        Storage::disk('photos')->assertExists(['photo1.jpg', 'photo2.jpg']);

        // Assert one or more files were not stored...
        Storage::disk('photos')->assertMissing('missing.jpg');
        Storage::disk('photos')->assertMissing(['missing.jpg', 'non-existing.jpg']);

        // Assert that the number of files in a given directory matches the expected count...
        Storage::disk('photos')->assertCount('/wallpapers', 2);

        // Assert that a given directory is empty...
        Storage::disk('photos')->assertDirectoryEmpty('/wallpapers');

        // Assert that the disk contains no files...
        Storage::disk('photos')->assertEmpty();
    }
}
```

Mặc định, `fake` sẽ xóa toàn bộ file trong thư mục tạm. Nếu muốn giữ lại các file này, bạn có thể dùng `persistentFake`. Để biết thêm về kiểm thử upload file, hãy tham khảo [phần upload file trong tài liệu HTTP testing](/http-tests#testing-file-uploads).

> [!WARNING]
> Phương thức `image` yêu cầu [extension GD](https://www.php.net/manual/en/book.image.php).

<a name="custom-filesystems"></a>
## Filesystem tùy chỉnh

Tích hợp Flysystem của Laravel hỗ trợ sẵn một số driver; tuy nhiên, Flysystem không chỉ giới hạn ở các driver này mà còn có adapter cho nhiều hệ thống lưu trữ khác. Bạn có thể tạo custom driver nếu muốn sử dụng một trong các adapter bổ sung đó trong ứng dụng Laravel.

Để định nghĩa một filesystem tùy chỉnh, bạn cần một Flysystem adapter. Hãy thêm Dropbox adapter do cộng đồng duy trì vào dự án:

```shell
composer require spatie/flysystem-dropbox
```

Tiếp theo, bạn có thể đăng ký driver trong phương thức `boot` của một [service provider](/providers) trong ứng dụng. Để thực hiện, hãy dùng phương thức `extend` của facade `Storage`:

```php
<?php

namespace App\Providers;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\Filesystem;
use Spatie\Dropbox\Client as DropboxClient;
use Spatie\FlysystemDropbox\DropboxAdapter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ...
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Storage::extend('dropbox', function (Application $app, array $config) {
            $adapter = new DropboxAdapter(new DropboxClient(
                $config['authorization_token']
            ));

            return new FilesystemAdapter(
                new Filesystem($adapter, $config),
                $adapter,
                $config
            );
        });
    }
}
```

Đối số đầu tiên của `extend` là tên driver; đối số thứ hai là closure nhận các biến `$app` và `$config`. Closure phải trả về một instance của `Illuminate\Filesystem\FilesystemAdapter`. Biến `$config` chứa các giá trị được định nghĩa trong `config/filesystems.php` cho disk tương ứng.

Sau khi tạo và đăng ký extension trong service provider, bạn có thể sử dụng driver `dropbox` trong file cấu hình `config/filesystems.php`.
