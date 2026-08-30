# Phát triển package

<a name="introduction"></a>
## Giới thiệu
Package là cách chính để bổ sung chức năng cho Laravel. Package có thể là thư viện xử lý ngày giờ như [Carbon](https://github.com/briannesbitt/Carbon), hoặc package cho phép gắn file với Eloquent model như [Laravel Media Library](https://github.com/spatie/laravel-medialibrary) của Spatie.
Có nhiều loại package khác nhau. Một số package hoạt động độc lập với framework, nghĩa là có thể dùng với bất kỳ PHP framework nào. Carbon và Pest là ví dụ. Bạn chỉ cần require chúng trong `composer.json` để sử dụng với Laravel.
Ngược lại, một số package được thiết kế riêng cho Laravel. Chúng có thể cung cấp route, controller, view và configuration để mở rộng ứng dụng Laravel. Phần hướng dẫn này chủ yếu tập trung vào loại package dành riêng cho Laravel.
<a name="creating-a-package"></a>
### Tạo package
Cách đơn giản nhất để bắt đầu package Laravel mới là dùng [Laravel package skeleton](https://github.com/laravel/package-skeleton) chính thức. Skeleton cung cấp sẵn service provider, test bằng Pest, static analysis bằng Larastan, format code bằng Pint và một workbench application để phát triển package end-to-end. Bạn có thể tạo package mới bằng command `package` của [Laravel installer CLI](/docs/{{version}}/installation#creating-a-laravel-project):
```shell
laravel package my-package
```
Một script cấu hình tương tác sẽ cá nhân hóa skeleton cho package, thiết lập namespace, service provider và chỉ bật những thành phần bạn cần như file cấu hình, route, view, translation, migration, asset, command và facade.
<a name="a-note-on-facades"></a>
### Lưu ý về facade
Khi viết ứng dụng Laravel, việc dùng contract hay facade thường không tạo khác biệt lớn về khả năng test vì cả hai đều hỗ trợ test tốt. Tuy nhiên, khi viết package, package thường không có quyền truy cập toàn bộ testing helper của Laravel. Nếu muốn test package như thể nó được cài trong một ứng dụng Laravel thông thường, bạn có thể dùng package [Orchestral Testbench](https://github.com/orchestral/testbench).
<a name="package-discovery"></a>
## Tự động khám phá package
File `bootstrap/providers.php` của ứng dụng Laravel chứa danh sách service provider Laravel cần load. Thay vì yêu cầu người dùng tự thêm service provider của package vào danh sách, bạn có thể khai báo provider trong phần `extra` của `composer.json` của package để Laravel tự load. Ngoài service provider, bạn cũng có thể khai báo các [facade](/docs/{{version}}/facades) cần đăng ký:
```json
"extra": {
    "laravel": {
        "providers": [
            "Barryvdh\\Debugbar\\ServiceProvider"
        ],
        "aliases": {
            "Debugbar": "Barryvdh\\Debugbar\\Facade"
        }
    }
},
```
Sau khi package được cấu hình discovery, Laravel sẽ tự động đăng ký service provider và facade khi package được cài, giúp trải nghiệm cài đặt đơn giản hơn cho người dùng.
<a name="opting-out-of-package-discovery"></a>
#### Tắt package discovery
Nếu bạn là người sử dụng package và muốn tắt discovery cho package cụ thể, hãy thêm tên package vào phần `extra` của `composer.json` ứng dụng:
```json
"extra": {
    "laravel": {
        "dont-discover": [
            "barryvdh/laravel-debugbar"
        ]
    }
},
```
Bạn có thể tắt package discovery cho toàn bộ package bằng ký tự `*` trong directive `dont-discover` của ứng dụng:
```json
"extra": {
    "laravel": {
        "dont-discover": [
            "*"
        ]
    }
},
```

<a name="service-providers"></a>
## Service provider
[Service provider](/docs/{{version}}/providers) là điểm kết nối giữa package và Laravel. Service provider chịu trách nhiệm bind các thành phần vào [service container](/docs/{{version}}/container), đồng thời cho Laravel biết nơi load resource của package như view, configuration và file ngôn ngữ.
Service provider extends class `Illuminate\Support\ServiceProvider` và chứa hai method `register` và `boot`. Class `ServiceProvider` cơ sở nằm trong Composer package `illuminate/support`, vì vậy package của bạn nên khai báo dependency này. Xem [tài liệu service provider](/docs/{{version}}/providers) để hiểu thêm cấu trúc và mục đích.
<a name="resources"></a>
## Tài nguyên
<a name="configuration"></a>
### Cấu hình
Thông thường, bạn cần cho phép publish file cấu hình của package vào thư mục `config` của ứng dụng để người dùng dễ override option mặc định. Để file cấu hình có thể được publish, gọi method `publishes` trong `boot` của service provider:
```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../config/courier.php' => config_path('courier.php'),
    ]);
}
```
Sau đó, khi người dùng chạy command `vendor:publish`, file sẽ được copy tới vị trí đã chỉ định. Khi cấu hình đã được publish, giá trị của nó có thể được truy cập giống bất kỳ file cấu hình nào khác:
```php
$value = config('courier.option');
```
> [!WARNING]
> Không nên định nghĩa closure trong file cấu hình. Closure không thể serialize đúng khi người dùng chạy command Artisan `config:cache`.
<a name="default-package-configuration"></a>
#### Cấu hình mặc định của package
Bạn cũng có thể merge file cấu hình mặc định của package với bản đã được publish trong ứng dụng. Cách này cho phép người dùng chỉ định nghĩa những option thực sự muốn override. Để merge, dùng method `mergeConfigFrom` trong `register` của service provider.
Method `mergeConfigFrom` nhận path tới file cấu hình package làm đối số thứ nhất và tên bản cấu hình phía ứng dụng làm đối số thứ hai:
```php
/**
 * Register any package services.
 */
public function register(): void
{
    $this->mergeConfigFrom(
        __DIR__.'/../config/courier.php', 'courier'
    );
}
```
> [!WARNING]
> Method này chỉ merge level đầu tiên của configuration array. Nếu người dùng chỉ định nghĩa một phần của mảng nhiều chiều, các option còn thiếu sẽ không tự được merge.
<a name="routes"></a>
### Routes
Nếu package có route, bạn có thể load chúng bằng method `loadRoutesFrom`. Method này tự kiểm tra route của ứng dụng đã được cache hay chưa và sẽ không load file route package nếu route cache đã tồn tại:
```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
}
```

<a name="migrations"></a>
### Migrations
Nếu package có [database migration](/docs/{{version}}/migrations), bạn có thể dùng method `publishesMigrations` để cho Laravel biết thư mục hoặc file nào chứa migration. Khi publish, Laravel tự cập nhật timestamp trong tên migration theo thời điểm hiện tại:
```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishesMigrations([
        __DIR__.'/../database/migrations' => database_path('migrations'),
    ]);
}
```

<a name="language-files"></a>
### File ngôn ngữ
Nếu package có [file ngôn ngữ](/docs/{{version}}/localization), dùng method `loadTranslationsFrom` để cho Laravel biết nơi load chúng. Ví dụ, nếu package tên `courier`, thêm cấu hình sau vào `boot` của service provider:
```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');
}
```
Translation line của package được tham chiếu theo cú pháp `package::file.line`. Vì vậy, bạn có thể lấy line `welcome` từ file `messages` của package `courier` như sau:
```php
echo trans('courier::messages.welcome');
```
Bạn có thể đăng ký JSON translation file cho package bằng method `loadJsonTranslationsFrom`. Method nhận path tới thư mục chứa các file JSON translation của package:
```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadJsonTranslationsFrom(__DIR__.'/../lang');
}
```

<a name="publishing-language-files"></a>
#### Publish file ngôn ngữ
Nếu muốn publish file ngôn ngữ của package vào thư mục `lang/vendor` của ứng dụng, dùng method `publishes` của service provider. Method này nhận một mảng map giữa path trong package và vị trí publish mong muốn. Ví dụ để publish file ngôn ngữ của package `courier`:
```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadTranslationsFrom(__DIR__.'/../lang', 'courier');

    $this->publishes([
        __DIR__.'/../lang' => $this->app->langPath('vendor/courier'),
    ]);
}
```
Sau đó, khi người dùng chạy lệnh Artisan `vendor:publish`, các file ngôn ngữ của package sẽ được publish tới vị trí đã cấu hình.
<a name="views"></a>
### Views
Để đăng ký [view](/docs/{{version}}/views) của package với Laravel, bạn cần cho Laravel biết chúng nằm ở đâu bằng method `loadViewsFrom` của service provider. Method nhận hai đối số: path tới view template và tên package. Ví dụ, với package `courier`, thêm cấu hình sau vào `boot`:
```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');
}
```
View package được tham chiếu theo cú pháp `package::view`. Vì vậy, sau khi đăng ký view path, bạn có thể load view `dashboard` của package `courier` như sau:
```php
Route::get('/dashboard', function () {
    return view('courier::dashboard');
});
```

<a name="overriding-package-views"></a>
#### Override view của package
Khi dùng `loadViewsFrom`, Laravel thực tế đăng ký hai vị trí view: `resources/views/vendor` của ứng dụng và thư mục bạn chỉ định trong package. Với package `courier`, Laravel trước tiên kiểm tra xem developer có đặt bản view tùy chỉnh trong `resources/views/vendor/courier` hay không. Nếu không có, Laravel mới tìm view trong thư mục package. Cơ chế này giúp người dùng dễ dàng override view của package.
<a name="publishing-views"></a>
#### Publish views
Nếu muốn view của package có thể được publish vào `resources/views/vendor`, hãy dùng method `publishes` của service provider với mảng path view package và vị trí publish mong muốn:
```php
/**
 * Bootstrap the package services.
 */
public function boot(): void
{
    $this->loadViewsFrom(__DIR__.'/../resources/views', 'courier');

    $this->publishes([
        __DIR__.'/../resources/views' => resource_path('views/vendor/courier'),
    ]);
}
```
Sau đó, khi người dùng chạy `vendor:publish`, các view của package sẽ được copy tới vị trí đã cấu hình.
<a name="view-components"></a>
### View components
Nếu package dùng Blade component hoặc đặt component ở thư mục không theo convention, bạn cần đăng ký thủ công component class và alias HTML tag để Laravel biết vị trí component. Thông thường nên đăng ký trong `boot` của service provider:
```php
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::component('package-alert', AlertComponent::class);
}
```
Sau khi đăng ký, component có thể được render bằng tag alias:
```blade
<x-package-alert/>
```

<a name="autoloading-package-components"></a>
#### Autoload package components
Ngoài cách đăng ký thủ công, bạn có thể dùng method `componentNamespace` để autoload component class theo convention. Ví dụ package `Nightshade` có component `Calendar` và `ColorPicker` trong namespace `Nightshade\Views\Components`:
```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```
Sau đó, component package có thể được dùng theo vendor namespace với cú pháp `package-name::`:
```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```
Blade tự động tìm class liên kết với component bằng cách chuyển tên component sang PascalCase. Subdirectory cũng được hỗ trợ thông qua cú pháp dot.
<a name="anonymous-components"></a>
#### Anonymous components
Nếu package có anonymous component, chúng phải nằm trong thư mục `components` bên trong thư mục "views" của package, tức view path đã đăng ký bằng [loadViewsFrom](#views). Khi render, hãy prefix tên component bằng view namespace của package:
```blade
<x-courier::alert />
```

<a name="about-artisan-command"></a>
### Artisan command "About"
Command Artisan `about` tích hợp của Laravel hiển thị tổng quan environment và configuration của ứng dụng. Package có thể đẩy thêm thông tin vào output thông qua class `AboutCommand`. Thông thường, thông tin này được thêm trong `boot` của package service provider:
```php
use Illuminate\Foundation\Console\AboutCommand;

/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    AboutCommand::add('My Package', fn () => ['Version' => '1.0.0']);
}
```

<a name="commands"></a>
## Commands
Để đăng ký Artisan command của package với Laravel, dùng method `commands` và truyền mảng tên command class. Sau khi đăng ký, command có thể được chạy qua [Artisan CLI](/docs/{{version}}/artisan):
```php
use Courier\Console\Commands\InstallCommand;
use Courier\Console\Commands\NetworkCommand;

/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    if ($this->app->runningInConsole()) {
        $this->commands([
            InstallCommand::class,
            NetworkCommand::class,
        ]);
    }
}
```

<a name="optimize-commands"></a>
### Optimize commands
[Command optimize](/docs/{{version}}/deployment#optimization) của Laravel cache configuration, event, route và view. Với method `optimizes`, package có thể đăng ký command riêng sẽ được gọi khi `optimize` và `optimize:clear` được thực thi:
```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    if ($this->app->runningInConsole()) {
        $this->optimizes(
            optimize: 'package:optimize',
            clear: 'package:clear-optimizations',
        );
    }
}
```

<a name="reload-commands"></a>
### Reload commands
[Command reload](/docs/{{version}}/deployment#reloading-services) của Laravel kết thúc các service đang chạy để system process monitor có thể tự khởi động lại. Với method `reloads`, package có thể đăng ký command riêng được gọi khi `reload` chạy:
```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    if ($this->app->runningInConsole()) {
        $this->reloads('package:reload');
    }
}
```

<a name="public-assets"></a>
## Public assets
Package có thể chứa asset như JavaScript, CSS và hình ảnh. Để publish chúng vào thư mục `public` của ứng dụng, dùng method `publishes`. Trong ví dụ này, ta cũng thêm tag group `public` để dễ publish một nhóm asset liên quan:
```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../public' => public_path('vendor/courier'),
    ], 'public');
}
```
Sau đó, khi người dùng chạy `vendor:publish`, asset được copy tới vị trí đã chỉ định. Vì thường cần ghi đè asset mỗi lần package update, người dùng có thể dùng flag `--force`:
```shell
php artisan vendor:publish --tag=public --force
```

<a name="publishing-file-groups"></a>
## Publish theo nhóm file
Bạn có thể muốn publish các nhóm asset và resource riêng biệt. Ví dụ, cho phép người dùng publish file cấu hình mà không phải publish asset. Có thể làm điều này bằng cách "tag" các group khi gọi `publishes` trong service provider. Ví dụ sau định nghĩa hai group cho package `courier`: `courier-config` và `courier-migrations`:
```php
/**
 * Bootstrap any package services.
 */
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../config/package.php' => config_path('package.php')
    ], 'courier-config');

    $this->publishesMigrations([
        __DIR__.'/../database/migrations/' => database_path('migrations')
    ], 'courier-migrations');
}
```
Người dùng có thể publish từng group riêng bằng cách truyền tag khi chạy `vendor:publish`:
```shell
php artisan vendor:publish --tag=courier-config
```
Người dùng cũng có thể publish toàn bộ file do service provider của package khai báo bằng flag `--provider`:
```shell
php artisan vendor:publish --provider="Your\Package\ServiceProvider"
```
