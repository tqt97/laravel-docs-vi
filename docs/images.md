# Xử lý hình ảnh

<a name="introduction"></a>
## Giới thiệu
Laravel cung cấp API fluent để xử lý image, cho phép resize, crop, encode và lưu ảnh theo cùng convention biểu đạt quen thuộc của framework. Khả năng xử lý ảnh của Laravel được xây trên [Intervention Image](https://image.intervention.io/) và hỗ trợ PHP extension GD cùng Imagick.
Image API hữu ích khi làm việc với file upload, file lưu trên [filesystem disk](/docs/{{version}}/filesystem), local file, remote URL hoặc raw image bytes:
```php
use Illuminate\Support\Facades\Image;

$path = Image::fromStorage('avatars/photo.jpg', 'public')
    ->cover(400, 400)
    ->toWebp()
    ->quality(80)
    ->storePublicly('avatars', 'public');
```
> [!WARNING]
> Xử lý image có thể tiêu tốn nhiều CPU và memory. Với workload xử lý ảnh lớn, hãy cân nhắc thực hiện trong [queued job](/docs/{{version}}/queues) thay vì ngay trong HTTP request nhận file upload.
<a name="installation"></a>
## Cài đặt
Trước khi dùng chức năng xử lý ảnh của Laravel, hãy cài package Intervention Image qua Composer:
```shell
composer require intervention/image:^4.0
```
Hãy đảm bảo PHP đã cài extension GD hoặc Imagick tùy driver ứng dụng sử dụng.
<a name="configuration"></a>
### Cấu hình
File cấu hình image của Laravel nằm tại `config/images.php`. Nếu ứng dụng chưa có file cấu hình `images`, bạn có thể publish bằng command Artisan `config:publish`:
```shell
php artisan config:publish images
```
File cấu hình image cho phép chỉ định image driver mặc định. Bạn cũng có thể dùng environment variable `IMAGE_DRIVER`. Các driver được hỗ trợ gồm `gd` và `imagick`:
```ini
IMAGE_DRIVER=imagick
```

<a name="reading-images"></a>
## Đọc Image
Facade `Image` cung cấp nhiều phương thức để đọc image từ các nguồn phổ biến. Nội dung ảnh được load lazy, vì vậy source thường chưa được đọc cho tới khi image được xử lý hoặc bytes của nó được yêu cầu.
<a name="uploaded-files"></a>
### Uploaded Files
Bạn có thể lấy image upload từ request bằng phương thức `image`. Phương thức trả instance `Illuminate\Image\Image` cho file đã upload, hoặc `null` nếu file không tồn tại:
```php
use Illuminate\Http\Request;

Route::post('/avatar', function (Request $request) {
    $request->validate(['avatar' => ['required', 'image']]);

    $path = $request->image('avatar')
        ->cover(400, 400)
        ->toWebp()
        ->storePublicly('avatars', 'public');

    // ...
});
```
Ngoài ra, bạn có thể tạo image instance từ `Illuminate\Http\UploadedFile` bằng phương thức `fromUpload`:
```php
use Illuminate\Support\Facades\Image;

$image = Image::fromUpload($request->file('avatar'));
```
Khi image được tạo từ uploaded file, bạn có thể lấy uploaded file bên dưới bằng phương thức `file`:
```php
$file = $image->file();
```

<a name="storage-files"></a>
### Storage Files
Bạn có thể tạo image instance từ file lưu trên một [filesystem disk](/docs/{{version}}/filesystem) bằng phương thức `fromStorage`. Argument đầu là path, argument thứ hai là tên disk:
```php
use Illuminate\Support\Facades\Image;

$image = Image::fromStorage('avatars/photo.jpg', disk: 'public');
```
Bạn cũng có thể tạo image instance trực tiếp từ filesystem disk instance bằng phương thức `image`:
```php
use Illuminate\Support\Facades\Storage;

$image = Storage::disk('public')->image('avatars/photo.jpg');
```

<a name="other-sources"></a>
### Nguồn khác
Facade `Image` còn có các phương thức tạo image instance từ raw bytes, local file path, remote URL và string Base64 encoded:
```php
use Illuminate\Support\Facades\Image;

$image = Image::fromBytes($contents);
$image = Image::fromBase64($base64);
$image = Image::fromPath(storage_path('app/avatars/photo.jpg'));
$image = Image::fromUrl('https://example.com/photo.jpg');
```

<a name="manipulating-images"></a>
## Biến đổi Image
Image instance là immutable. Mỗi phương thức manipulation trả về image instance mới với transformation được nối vào processing pipeline, cho phép chain method theo fluent style:
```php
$image = $request->image('avatar')
    ->orient()
    ->cover(400, 400)
    ->sharpen(10);
```
Các transformation được xử lý theo đúng thứ tự thêm vào pipeline và image chỉ được encode một lần ở cuối.
<a name="resizing-images"></a>
### Resize Image
Phương thức `resize` đổi kích thước image theo dimension đã cho. Bạn có thể truyền cả width và height hoặc chỉ một dimension bằng named argument:
```php
$image = $image->resize(800, 600);
$image = $image->resize(width: 800);
$image = $image->resize(height: 600);
```
Phương thức `scale` scale image theo tỷ lệ để vừa trong dimension đã cho. Phương thức này không bao giờ phóng lớn image:
```php
$image = $image->scale(800, 600);
$image = $image->scale(width: 800);
$image = $image->scale(height: 600);
```
Phương thức `cover` resize và crop image để phủ hoàn toàn dimension đã cho:
```php
$image = $image->cover(400, 400);
```
Phương thức `contain` resize image để vừa trong dimension đã cho nhưng vẫn giữ toàn bộ ảnh. Nếu cần, khoảng trống được lấp bằng background color tùy chọn:
```php
$image = $image->contain(400, 400);
$image = $image->contain(400, 400, '#ffffff');
$image = $image->contain(400, 400, 'dominant');
```
Bạn có thể truyền `dominant` làm background color để lấp khoảng trống bằng màu chủ đạo của image.
Bạn có thể crop image bằng `crop`. Hai argument đầu là width và height mong muốn; argument thứ ba và thứ tư tùy chọn là tọa độ `x`, `y` của vùng crop:
```php
$image = $image->crop(300, 200);
$image = $image->crop(300, 200, x: 50, y: 25);
```

<a name="other-transformations"></a>
### Các Transformation khác
Laravel còn cung cấp nhiều phương thức transformation image khác:
```php
$image = $image->orient();
$image = $image->rotate(90);
$image = $image->rotate(90, '#ffffff');
$image = $image->rotate(90, 'dominant');
$image = $image->blur(5);
$image = $image->grayscale();
$image = $image->sharpen(10);
$image = $image->flipVertically();
$image = $image->flipHorizontally();
```
`orient` xoay image theo dữ liệu EXIF orientation. `rotate` xoay theo chiều kim đồng hồ với góc đã cho và chấp nhận background color tùy chọn. `blur` và `sharpen` nhận value từ `0` tới `100`.
<a name="conditional-transformations"></a>
#### Transformation có điều kiện
Image instance hỗ trợ trait `Conditionable` của Laravel, cho phép áp transformation có điều kiện bằng `when` và `unless`:
```php
$image = $request->image('avatar')
    ->when($request->boolean('crop'), fn ($image) => $image->cover(400, 400))
    ->unless($request->boolean('preserve_format'), fn ($image) => $image->toWebp());
```

<a name="encoding-images"></a>
## Encode Image
Mặc định, image sau xử lý được encode bằng format gốc. Tuy nhiên, bạn có thể chuyển sang format được hỗ trợ khác trước khi lấy hoặc lưu ảnh:
```php
$image = $image->toWebp();
$image = $image->toJpg();
$image = $image->toJpeg();
$image = $image->toPng();
$image = $image->toGif();
$image = $image->toAvif();
$image = $image->toBmp();
```
Dùng `quality` để đặt chất lượng output. Giá trị quality được giới hạn trong khoảng `1` đến `100`:
```php
$image = $image->toWebp()->quality(80);
```
`optimize` là shortcut thuận tiện để chuyển image sang format chỉ định và đặt quality. Mặc định image được optimize thành WebP với quality `70`:
```php
$image = $image->optimize();

$image = $image->optimize(format: 'jpg', quality: 85);
```
Bạn có thể lấy nội dung image đã xử lý dưới dạng byte string, Base64 encoded string hoặc data URI:
```php
$bytes = $image->toBytes();
$base64 = $image->toBase64();
$dataUri = $image->toDataUri();
```
Image instance cũng có thể cast sang string để lấy data URI:
```php
$dataUri = (string) $image;
```

<a name="storing-images"></a>
## Lưu Image
Phương thức `store` lưu image đã xử lý trên filesystem disk của ứng dụng. Tương tự uploaded file, Laravel tạo filename duy nhất và trả về path đã lưu. Argument thứ hai có thể dùng để chỉ định disk:
```php
$path = $request->image('avatar')
    ->cover(400, 400)
    ->store(path: 'avatars');

$path = $request->image('avatar')
    ->cover(400, 400)
    ->store(path: 'avatars', disk: 's3');
```
Dùng `storeAs` nếu muốn chỉ định filename khi lưu:
```php
$path = $request->image('avatar')
    ->cover(400, 400)
    ->storeAs(path: 'avatars', name: 'avatar.jpg', disk: 'public');
```
`storePublicly` và `storePubliclyAs` lưu image với visibility `public`:
```php
$path = $request->image('avatar')
    ->cover(400, 400)
    ->storePublicly(path: 'avatars', disk: 'public');

$path = $request->image('avatar')
    ->cover(400, 400)
    ->storePubliclyAs(path: 'avatars', name: 'avatar.webp', disk: 'public');
```
Nếu không thể lưu image, các storage method trả `false`.
<a name="inspecting-images"></a>
## Đọc thông tin Image
Bạn có thể lấy MIME type, extension, dimensions, width, height và dominant color của image bằng các phương thức sau:
```php
$mimeType = $image->mimeType();
$extension = $image->extension();

[$width, $height] = $image->dimensions();
$width = $image->width();
$height = $image->height();

$dominantColor = $image->dominantColor();
```
Các phương thức này hoạt động trên image sau xử lý. Ví dụ, gọi `width` sau `cover(400, 400)` sẽ trả `400`.
<a name="image-drivers"></a>
## Image Drivers
<a name="custom-image-drivers"></a>
### Custom Image Drivers
Image manager của Laravel kế thừa base class `Illuminate\Support\Manager`. Vì vậy bạn có thể đăng ký custom image driver bằng phương thức `extend` trên image manager và facade `Image`.
Custom image driver nên implement interface `Illuminate\Contracts\Image\Driver`. Phương thức `process` nhận nội dung image gốc cùng `Illuminate\Image\ImagePipeline` theo đúng thứ tự cần áp dụng và phải trả về bytes của image đã xử lý:
```php
<?php

namespace App\Images;

use Illuminate\Contracts\Image\Driver;
use Illuminate\Image\ImagePipeline;

class VipsDriver implements Driver
{
    /**
     * Process the given image contents with the specified pipeline.
     */
    public function process(string $contents, ImagePipeline $pipeline): string
    {
        // Apply the pipeline's transformations and output options...

        return $contents;
    }

    /**
     * Register a transformation handler.
     */
    public function transformUsing(string $transformation, callable $callback): static
    {
        // Store the handler so it may be applied while processing the pipeline...

        return $this;
    }
}
```
> [!NOTE]
> Để hiểu rõ hơn cách implement custom image driver, bạn có thể xem class có sẵn `Illuminate\Image\Drivers\InterventionDriver` trong framework.
Sau khi implement custom driver, đăng ký bằng phương thức `extend` của facade `Image`. Thông thường nên làm việc này trong phương thức `boot` của service provider:
```php
use App\Images\VipsDriver;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\Image;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Image::extend('vips', function (Application $app) {
        return new VipsDriver;
    });
}
```
Sau khi đăng ký, có thể dùng driver cho một image cụ thể qua phương thức `using`:
```php
$image = $request->image('avatar')
    ->using('vips')
    ->cover(400, 400);
```
Bạn cũng có thể cấu hình custom driver làm default image driver qua option `default` trong `config/images.php` hoặc environment variable `IMAGE_DRIVER`:
```ini
IMAGE_DRIVER=vips
```

<a name="custom-transformations"></a>
### Custom Transformations
Ứng dụng và package có thể định nghĩa custom transformation bằng class implement contract `Illuminate\Contracts\Image\Transformation`. Sau đó transformation được thêm vào image pipeline bằng phương thức `transform`:
```php
<?php

namespace App\Images\Transformations;

use Illuminate\Contracts\Image\Transformation;

class Pixelate implements Transformation
{
    public function __construct(
        public readonly int $size,
    ) {
        //
    }
}
```
Tiếp theo, đăng ký handler cho transformation và driver bằng phương thức `transformUsing` của facade `Image`. Thông thường việc này nên thực hiện trong `boot` của service provider:
```php
use App\Images\Transformations\Pixelate;
use Illuminate\Support\Facades\Image;
use Intervention\Image\Interfaces\ImageInterface;

Image::transformUsing('gd', Pixelate::class, function (ImageInterface $image, Pixelate $transformation) {
    return $image->pixelate($transformation->size);
});
```
Sau khi transformation handler được đăng ký, bạn có thể áp transformation cho image:
```php
use App\Images\Transformations\Pixelate;

$image = $request->image('avatar')
    ->transform(new Pixelate(12))
    ->store('avatars');
```
