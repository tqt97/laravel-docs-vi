# Service Providers

<a name="introduction"></a>
## Giới thiệu
Service provider là nơi trung tâm thực hiện quá trình bootstrap cho ứng dụng Laravel. Chính ứng dụng của bạn cũng như toàn bộ dịch vụ cốt lõi của Laravel đều được bootstrap thông qua service provider.
Vậy "bootstrap" ở đây nghĩa là gì? Nhìn chung, đó là quá trình **đăng ký** các thành phần như service container binding, event listener, middleware và thậm chí cả route. Service provider là nơi trung tâm để cấu hình ứng dụng.
Laravel sử dụng hàng chục service provider nội bộ để bootstrap các dịch vụ cốt lõi như mailer, queue, cache và nhiều thành phần khác. Nhiều provider trong số này là provider "deferred", nghĩa là chúng không được load ở mọi request mà chỉ được load khi dịch vụ do chúng cung cấp thực sự cần được sử dụng.
Tất cả service provider do ứng dụng định nghĩa đều được đăng ký trong file `bootstrap/providers.php`. Trong phần tài liệu dưới đây, bạn sẽ học cách viết service provider riêng và đăng ký chúng với ứng dụng Laravel.
> [!NOTE]
> Nếu muốn hiểu sâu hơn cách Laravel xử lý request và hoạt động bên trong, hãy xem tài liệu về [request lifecycle](/docs/{{version}}/lifecycle) của Laravel.
<a name="writing-service-providers"></a>
## Viết Service Provider
Tất cả service provider đều kế thừa class `Illuminate\Support\ServiceProvider`. Phần lớn provider có hai phương thức `register` và `boot`. Trong `register`, bạn **chỉ nên bind dependency vào [service container](/docs/{{version}}/container)**. Không nên đăng ký event listener, route hay bất kỳ chức năng nào khác trong `register`.
Artisan CLI có thể tạo provider mới bằng command `make:provider`. Laravel sẽ tự động đăng ký provider mới vào file `bootstrap/providers.php` của ứng dụng:
```shell
php artisan make:provider RiakServiceProvider
```

<a name="the-register-method"></a>
### Phương thức Register
Như đã đề cập, trong phương thức `register` bạn chỉ nên bind dependency vào [service container](/docs/{{version}}/container). Không nên đăng ký event listener, route hoặc chức năng khác tại đây. Nếu làm vậy, bạn có thể vô tình sử dụng một service do service provider khác cung cấp trong khi provider đó chưa được load.
Hãy xem một service provider cơ bản. Trong bất kỳ phương thức nào của service provider, bạn luôn có thể truy cập property `$app`, qua đó truy cập service container:
```php
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(Connection::class, function (Application $app) {
            return new Connection(config('riak'));
        });
    }
}
```
Service provider này chỉ định nghĩa phương thức `register` và sử dụng nó để khai báo implementation của `App\Services\Riak\Connection` trong service container. Nếu bạn chưa quen với service container của Laravel, hãy xem [tài liệu Service Container](/docs/{{version}}/container).
<a name="the-bindings-and-singletons-properties"></a>
#### Các property `bindings` và `singletons`
Nếu service provider đăng ký nhiều binding đơn giản, bạn có thể dùng các property `bindings` và `singletons` thay vì tự đăng ký từng container binding. Khi provider được framework load, Laravel sẽ tự động kiểm tra các property này và đăng ký những binding tương ứng:
```php
<?php

namespace App\Providers;

use App\Contracts\DowntimeNotifier;
use App\Contracts\ServerProvider;
use App\Services\DigitalOceanServerProvider;
use App\Services\PingdomDowntimeNotifier;
use App\Services\ServerToolsProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * All of the container bindings that should be registered.
     *
     * @var array
     */
    public $bindings = [
        ServerProvider::class => DigitalOceanServerProvider::class,
    ];

    /**
     * All of the container singletons that should be registered.
     *
     * @var array
     */
    public $singletons = [
        DowntimeNotifier::class => PingdomDowntimeNotifier::class,
        ServerProvider::class => ServerToolsProvider::class,
    ];
}
```

<a name="the-boot-method"></a>
### Phương thức Boot
Nếu cần đăng ký một [view composer](/docs/{{version}}/views#view-composers) trong service provider thì sao? Việc này nên được thực hiện trong phương thức `boot`. **Phương thức này được gọi sau khi tất cả service provider khác đã được đăng ký**, vì vậy tại thời điểm đó bạn có thể truy cập toàn bộ service mà framework đã đăng ký:
```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        View::composer('view', function () {
            // ...
        });
    }
}
```

<a name="boot-method-dependency-injection"></a>
#### Dependency Injection cho phương thức Boot
Bạn có thể type-hint dependency cho phương thức `boot` của service provider. [Service container](/docs/{{version}}/container) sẽ tự động inject các dependency cần thiết:
```php
use Illuminate\Contracts\Routing\ResponseFactory;

/**
 * Bootstrap any application services.
 */
public function boot(ResponseFactory $response): void
{
    $response->macro('serialized', function (mixed $value) {
        // ...
    });
}
```

<a name="registering-providers"></a>
## Đăng ký Provider
Tất cả service provider được đăng ký trong file cấu hình `bootstrap/providers.php`. File này trả về một array chứa tên class của các service provider thuộc ứng dụng:
```php
<?php

return [
    App\Providers\AppServiceProvider::class,
];
```
Khi chạy command Artisan `make:provider`, Laravel sẽ tự động thêm provider vừa tạo vào `bootstrap/providers.php`. Tuy nhiên, nếu bạn tự tạo provider class bằng tay, hãy tự thêm class đó vào array:
```php
<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\ComposerServiceProvider::class, // [tl! add]
];
```

<a name="deferred-providers"></a>
## Deferred Providers
Nếu provider của bạn **chỉ** đăng ký binding trong [service container](/docs/{{version}}/container), bạn có thể trì hoãn việc đăng ký provider cho đến khi một trong các binding đó thực sự được cần đến. Cách này có thể cải thiện hiệu năng vì provider không phải được load từ filesystem trên mọi request.
Laravel biên dịch và lưu danh sách toàn bộ service do deferred service provider cung cấp cùng tên class provider tương ứng. Chỉ khi bạn cố resolve một service trong danh sách đó, Laravel mới load service provider cần thiết.
Để trì hoãn việc load provider, hãy implement interface `\Illuminate\Contracts\Support\DeferrableProvider` và định nghĩa phương thức `provides`. Phương thức `provides` phải trả về các service container binding mà provider đăng ký:
```php
<?php

namespace App\Providers;

use App\Services\Riak\Connection;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Support\DeferrableProvider;
use Illuminate\Support\ServiceProvider;

class RiakServiceProvider extends ServiceProvider implements DeferrableProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(Connection::class, function (Application $app) {
            return new Connection($app['config']['riak']);
        });
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array<int, string>
     */
    public function provides(): array
    {
        return [Connection::class];
    }
}
```
