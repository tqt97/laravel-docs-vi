# Service Container

<a name="introduction"></a>
## Giới thiệu

Service Container của Laravel là một công cụ mạnh mẽ để quản lý dependency giữa các class và thực hiện dependency injection. Nói một cách trực tiếp, dependency injection có nghĩa là các dependency mà một class cần sẽ được "inject" vào class đó thông qua constructor hoặc, trong một số trường hợp, thông qua các phương thức "setter".

Hãy xem một ví dụ đơn giản:

```php
<?php

namespace App\Http\Controllers;

use App\Services\AppleMusic;
use Illuminate\View\View;

class PodcastController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected AppleMusic $apple,
    ) {}

    /**
     * Show information about the given podcast.
     */
    public function show(string $id): View
    {
        return view('podcasts.show', [
            'podcast' => $this->apple->findPodcast($id)
        ]);
    }
}
```

Trong ví dụ này, `PodcastController` cần lấy podcast từ một nguồn dữ liệu như Apple Music. Vì vậy, chúng ta sẽ **inject** một service có khả năng truy xuất podcast. Do service được inject từ bên ngoài, khi kiểm thử ứng dụng chúng ta có thể dễ dàng "mock" service `AppleMusic`, tức tạo một implementation giả phục vụ cho test.

Hiểu sâu Service Container của Laravel là nền tảng quan trọng khi xây dựng các ứng dụng lớn, có kiến trúc vững chắc, đồng thời cũng cần thiết nếu bạn muốn đóng góp vào chính Laravel core.

<a name="zero-configuration-resolution"></a>
### Phân giải không cần cấu hình

Nếu một class không có dependency, hoặc chỉ phụ thuộc vào các concrete class khác (không phải interface), bạn không cần chỉ dẫn cho container cách phân giải class đó. Ví dụ, bạn có thể đặt đoạn code sau trong file `routes/web.php`:

```php
<?php

class Service
{
    // ...
}

Route::get('/', function (Service $service) {
    dd($service::class);
});
```

Trong ví dụ này, khi truy cập route `/` của ứng dụng, Laravel sẽ tự động phân giải class `Service` và inject instance tương ứng vào handler của route. Đây là một khả năng rất quan trọng: bạn có thể tận dụng dependency injection trong quá trình phát triển mà không phải duy trì những file cấu hình binding cồng kềnh.

Trong ứng dụng Laravel, rất nhiều class bạn viết sẽ tự động nhận dependency thông qua container, bao gồm [controller](/controllers), [event listener](/events), [middleware](/middleware) và nhiều thành phần khác. Bạn cũng có thể type-hint dependency trong phương thức `handle` của [queued job](/queues). Khi đã quen với khả năng dependency injection tự động và không cần cấu hình này, nó sẽ trở thành một phần tự nhiên trong cách bạn phát triển ứng dụng Laravel.

<a name="when-to-use-the-container"></a>
### Khi nào nên sử dụng Container

Nhờ khả năng phân giải không cần cấu hình, bạn thường chỉ cần type-hint dependency trong route, controller, event listener và nhiều vị trí khác mà không phải trực tiếp thao tác với container. Ví dụ, bạn có thể type-hint đối tượng `Illuminate\Http\Request` trong định nghĩa route để dễ dàng truy cập request hiện tại. Dù đoạn code này không trực tiếp gọi container, phía sau Laravel vẫn sử dụng container để quản lý và inject dependency:

```php
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    // ...
});
```

Trong nhiều trường hợp, nhờ dependency injection tự động và [facade](/facades), bạn có thể xây dựng ứng dụng Laravel mà **không bao giờ** phải tự binding hoặc phân giải dependency từ container. **Vậy khi nào chúng ta thực sự cần thao tác trực tiếp với container?** Có hai tình huống chính.

Thứ nhất, nếu bạn viết một class triển khai một interface và muốn type-hint interface đó trong route hoặc constructor của class, bạn phải [chỉ cho container cách phân giải interface đó](#binding-interfaces-to-implementations). Thứ hai, nếu bạn đang [phát triển một Laravel package](/packages) để chia sẻ cho các Laravel developer khác, bạn có thể cần binding các service của package vào container.

<a name="binding"></a>
## Binding

<a name="binding-basics"></a>
### Kiến thức cơ bản về Binding

<a name="simple-bindings"></a>
#### Binding cơ bản

Hầu hết binding của Service Container sẽ được đăng ký trong [service provider](/providers), vì vậy phần lớn ví dụ trong tài liệu này sẽ minh họa việc sử dụng container trong ngữ cảnh đó.

Bên trong service provider, bạn luôn có thể truy cập container thông qua property `$this->app`. Để đăng ký một binding, hãy gọi phương thức `bind`, truyền vào tên class hoặc interface cần đăng ký cùng một closure trả về instance của class:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

Lưu ý rằng resolver nhận chính container làm tham số. Từ đó, chúng ta có thể dùng container để phân giải các dependency con của đối tượng đang được khởi tạo.

Như đã đề cập, thông thường bạn sẽ thao tác với container bên trong service provider. Tuy nhiên, nếu cần sử dụng container bên ngoài service provider, bạn có thể thực hiện thông qua [facade](/facades) `App`:

```php
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\App;

App::bind(Transistor::class, function (Application $app) {
    // ...
});
```

Bạn có thể dùng phương thức `bindIf` để chỉ đăng ký binding khi type tương ứng chưa có binding nào trong container:

```php
$this->app->bindIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

Để thuận tiện, bạn có thể bỏ qua đối số riêng chứa tên class hoặc interface cần đăng ký và để Laravel suy luận type từ return type của closure được truyền vào phương thức `bind`:

```php
App::bind(function (Application $app): Transistor {
    return new Transistor($app->make(PodcastParser::class));
});
```

> [!NOTE]
> Bạn không cần binding một class vào container nếu class đó không phụ thuộc vào interface nào. Container có thể tự động phân giải và khởi tạo những đối tượng này bằng reflection, nên không cần cấu hình cách tạo chúng.

<a name="binding-a-singleton"></a>
#### Binding Singleton

Phương thức `singleton` binding một class hoặc interface vào container theo cách chỉ phân giải một lần. Sau khi singleton binding đã được phân giải, các lần yêu cầu tiếp theo từ container sẽ nhận lại cùng một object instance:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->singleton(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

Bạn có thể dùng phương thức `singletonIf` để chỉ đăng ký singleton binding khi type tương ứng chưa được binding trong container:

```php
$this->app->singletonIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="singleton-attribute"></a>
#### Attribute Singleton

Ngoài ra, bạn có thể đánh dấu interface hoặc class bằng attribute `#[Singleton]` để chỉ định rằng container chỉ nên phân giải type đó một lần:

```php
<?php

namespace App\Services;

use Illuminate\Container\Attributes\Singleton;

#[Singleton]
class Transistor
{
    // ...
}
```

<a name="binding-scoped"></a>
#### Binding Scoped Singleton

Phương thức `scoped` binding một class hoặc interface vào container sao cho type đó chỉ được phân giải một lần trong một lifecycle request / job cụ thể của Laravel. Cách hoạt động này tương tự `singleton`, nhưng instance đăng ký bằng `scoped` sẽ được loại bỏ mỗi khi ứng dụng Laravel bắt đầu một "lifecycle" mới, chẳng hạn khi worker của [Laravel Octane](/octane) xử lý request mới hoặc khi [queue worker](/queues) của Laravel xử lý job mới:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;
use Illuminate\Contracts\Foundation\Application;

$this->app->scoped(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

Bạn có thể dùng phương thức `scopedIf` để chỉ đăng ký scoped binding khi type tương ứng chưa có binding trong container:

```php
$this->app->scopedIf(Transistor::class, function (Application $app) {
    return new Transistor($app->make(PodcastParser::class));
});
```

<a name="scoped-attribute"></a>
#### Attribute Scoped

Ngoài ra, bạn có thể đánh dấu interface hoặc class bằng attribute `#[Scoped]` để chỉ định rằng container chỉ phân giải type đó một lần trong mỗi lifecycle request / job của Laravel:

```php
<?php

namespace App\Services;

use Illuminate\Container\Attributes\Scoped;

#[Scoped]
class Transistor
{
    // ...
}
```

<a name="binding-instances"></a>
#### Binding Instance

Bạn cũng có thể binding trực tiếp một object instance đã tồn tại vào container bằng phương thức `instance`. Sau đó, mọi lần phân giải type này từ container đều sẽ trả về chính instance đã đăng ký:

```php
use App\Services\Transistor;
use App\Services\PodcastParser;

$service = new Transistor(new PodcastParser);

$this->app->instance(Transistor::class, $service);
```

<a name="binding-interfaces-to-implementations"></a>
### Binding Interface với Implementation

Một khả năng rất mạnh của Service Container là binding một interface với một implementation cụ thể. Ví dụ, giả sử chúng ta có interface `EventPusher` và implementation `RedisEventPusher`. Sau khi triển khai `RedisEventPusher` cho interface này, chúng ta có thể đăng ký nó với Service Container như sau:

```php
use App\Contracts\EventPusher;
use App\Services\RedisEventPusher;

$this->app->bind(EventPusher::class, RedisEventPusher::class);
```

Khai báo này cho container biết rằng khi một class cần implementation của `EventPusher`, container phải inject `RedisEventPusher`. Từ đây, chúng ta có thể type-hint interface `EventPusher` trong constructor của class được container phân giải. Hãy nhớ rằng controller, event listener, middleware và nhiều loại class khác trong ứng dụng Laravel đều được phân giải thông qua container:

```php
use App\Contracts\EventPusher;

/**
 * Create a new class instance.
 */
public function __construct(
    protected EventPusher $pusher,
) {}
```

<a name="bind-attribute"></a>
#### Attribute Bind

Laravel cũng cung cấp attribute `Bind` để việc khai báo thuận tiện hơn. Bạn có thể gắn attribute này vào bất kỳ interface nào để chỉ cho Laravel implementation nào phải được tự động inject mỗi khi interface đó được yêu cầu. Khi sử dụng `Bind`, bạn không cần đăng ký service bổ sung trong các service provider của ứng dụng.

Ngoài ra, một interface có thể khai báo nhiều attribute `Bind` để cấu hình implementation khác nhau sẽ được inject cho từng nhóm environment cụ thể:

```php
<?php

namespace App\Contracts;

use App\Services\FakeEventPusher;
use App\Services\RedisEventPusher;
use Illuminate\Container\Attributes\Bind;

#[Bind(RedisEventPusher::class)]
#[Bind(FakeEventPusher::class, environments: ['local', 'testing'])]
interface EventPusher
{
    // ...
}
```

Bạn cũng có thể áp dụng các attribute [Singleton](#singleton-attribute) và [Scoped](#scoped-attribute) để xác định binding của container sẽ chỉ được phân giải một lần cho toàn bộ vòng đời tương ứng, hoặc một lần trong mỗi lifecycle request / job:

```php
use App\Services\RedisEventPusher;
use Illuminate\Container\Attributes\Bind;
use Illuminate\Container\Attributes\Singleton;

#[Bind(RedisEventPusher::class)]
#[Singleton]
interface EventPusher
{
    // ...
}
```

Với binding phụ thuộc vào một điều kiện tùy ý, bạn có thể sử dụng attribute `BindWhen`. Closure có thể nhận container và phải trả về `true` khi binding cần được áp dụng. Các attribute `Bind` và `BindWhen` được đánh giá theo đúng thứ tự khai báo:

```php
use App\Services\BetaEventPusher;
use Illuminate\Container\Attributes\BindWhen;
use Laravel\Pennant\Feature;

#[BindWhen(BetaEventPusher::class, static fn () => Feature::active('beta-events'))]
interface EventPusher
{
    // ...
}
```

> [!NOTE]
> Attribute `BindWhen` yêu cầu PHP 8.5 trở lên.

<a name="contextual-binding"></a>
### Contextual Binding

Đôi khi hai class cùng sử dụng một interface nhưng bạn muốn inject implementation khác nhau cho từng class. Ví dụ, hai controller có thể phụ thuộc vào các implementation khác nhau của [contract](/contracts) `Illuminate\Contracts\Filesystem\Filesystem`. Laravel cung cấp một fluent interface đơn giản để định nghĩa hành vi này:

```php
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\VideoController;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

$this->app->when(PhotoController::class)
    ->needs(Filesystem::class)
    ->give(function () {
        return Storage::disk('local');
    });

$this->app->when([VideoController::class, UploadController::class])
    ->needs(Filesystem::class)
    ->give(function () {
        return Storage::disk('s3');
    });
```

<a name="contextual-attributes"></a>
### Contextual Attribute

Vì contextual binding thường được dùng để inject implementation của driver hoặc các giá trị cấu hình, Laravel cung cấp nhiều contextual binding attribute cho phép inject trực tiếp các loại giá trị này mà không phải tự định nghĩa contextual binding trong service provider.

Ví dụ, attribute `Storage` có thể được dùng để inject một [storage disk](/filesystem) cụ thể:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Container\Attributes\Storage;
use Illuminate\Contracts\Filesystem\Filesystem;

class PhotoController extends Controller
{
    public function __construct(
        #[Storage('local')] protected Filesystem $filesystem
    ) {
        // ...
    }
}
```

Ngoài attribute `Storage`, Laravel còn cung cấp các attribute `Auth`, `Cache`, `Config`, `Context`, `DB`, `Give`, `Log`, `RequestAttribute`, `RouteParameter` và [Tag](#tagging):

```php
<?php

namespace App\Http\Controllers;

use App\Contracts\UserRepository;
use App\Models\Organization;
use App\Models\Photo;
use App\Repositories\DatabaseRepository;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Container\Attributes\Cache;
use Illuminate\Container\Attributes\Config;
use Illuminate\Container\Attributes\Context;
use Illuminate\Container\Attributes\DB;
use Illuminate\Container\Attributes\Give;
use Illuminate\Container\Attributes\Log;
use Illuminate\Container\Attributes\RequestAttribute;
use Illuminate\Container\Attributes\RouteParameter;
use Illuminate\Container\Attributes\Tag;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Database\Connection;
use Psr\Log\LoggerInterface;

class PhotoController extends Controller
{
    public function __construct(
        #[Auth('web')] protected Guard $auth,
        #[Cache('redis')] protected Repository $cache,
        #[Config('app.timezone')] protected string $timezone,
        #[Context('uuid')] protected string $uuid,
        #[Context('ulid', hidden: true)] protected string $ulid,
        #[DB('mysql')] protected Connection $connection,
        #[Give(DatabaseRepository::class)] protected UserRepository $users,
        #[Log('daily')] protected LoggerInterface $log,
        #[RequestAttribute('organization')] protected Organization $organization,
        #[RouteParameter] protected Photo $photo,
        #[Tag('reports')] protected iterable $reports,
    ) {
        // ...
    }
}
```

Attribute `RouteParameter` sẽ phân giải route parameter có tên khớp với tên biến. Khi cần, bạn có thể chỉ định rõ tên route parameter: `#[RouteParameter('photo')]`.

Attribute `RequestAttribute` sẽ phân giải giá trị được lưu dưới key tương ứng trong [attribute bag](https://symfony.com/doc/current/components/http_foundation.html#accessing-request-data) của request hiện tại: `#[RequestAttribute('organization')]`.

Ngoài ra, Laravel cung cấp attribute `CurrentUser` để inject user đang được xác thực vào route hoặc class cần sử dụng:

```php
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;

Route::get('/user', function (#[CurrentUser] User $user) {
    return $user;
})->middleware('auth');
```

<a name="defining-custom-attributes"></a>
#### Định nghĩa Custom Attribute

Bạn có thể tự tạo contextual attribute bằng cách implement contract `Illuminate\Contracts\Container\ContextualAttribute`. Container sẽ gọi phương thức `resolve` của attribute; phương thức này chịu trách nhiệm phân giải giá trị cần inject vào class đang sử dụng attribute đó. Trong ví dụ dưới đây, chúng ta sẽ tự triển khai lại attribute `Config` có sẵn của Laravel:

```php
<?php

namespace App\Attributes;

use Attribute;
use Illuminate\Contracts\Container\Container;
use Illuminate\Contracts\Container\ContextualAttribute;
use ReflectionParameter;

#[Attribute(Attribute::TARGET_PARAMETER)]
class Config implements ContextualAttribute
{
    /**
     * Create a new attribute instance.
     */
    public function __construct(public string $key, public mixed $default = null)
    {
    }

    /**
     * Resolve the configuration value.
     *
     * @param  self  $attribute
     * @param  \Illuminate\Contracts\Container\Container  $container
     * @param  \ReflectionParameter  $parameter
     * @return mixed
     */
    public static function resolve(self $attribute, Container $container, ReflectionParameter $parameter)
    {
        return $container->make('config')->get($attribute->key, $attribute->default);
    }
}
```

<a name="binding-primitives"></a>
### Binding giá trị primitive

Đôi khi một class vừa nhận các class được inject, vừa cần một giá trị primitive như số nguyên. Bạn có thể sử dụng contextual binding để inject bất kỳ giá trị nào mà class cần:

```php
use App\Http\Controllers\UserController;

$this->app->when(UserController::class)
    ->needs('$variableName')
    ->give($value);
```

Đôi khi một class phụ thuộc vào một mảng các instance đã được [gắn tag](#tagging). Với phương thức `giveTagged`, bạn có thể dễ dàng inject toàn bộ binding trong container mang tag đó:

```php
$this->app->when(ReportAggregator::class)
    ->needs('$reports')
    ->giveTagged('reports');
```

Nếu cần inject một giá trị từ file cấu hình của ứng dụng, bạn có thể sử dụng phương thức `giveConfig`:

```php
$this->app->when(ReportAggregator::class)
    ->needs('$timezone')
    ->giveConfig('app.timezone');
```

<a name="binding-typed-variadics"></a>
### Binding tham số variadic có kiểu

Trong một số trường hợp, một class có thể nhận nhiều object cùng kiểu thông qua một tham số variadic trong constructor:

```php
<?php

use App\Models\Filter;
use App\Services\Logger;

class Firewall
{
    /**
     * The filter instances.
     *
     * @var array
     */
    protected $filters;

    /**
     * Create a new class instance.
     */
    public function __construct(
        protected Logger $logger,
        Filter ...$filters,
    ) {
        $this->filters = $filters;
    }
}
```

Với contextual binding, bạn có thể phân giải dependency này bằng cách truyền cho phương thức `give` một closure trả về mảng các instance `Filter` đã được phân giải:

```php
$this->app->when(Firewall::class)
    ->needs(Filter::class)
    ->give(function (Application $app) {
          return [
              $app->make(NullFilter::class),
              $app->make(ProfanityFilter::class),
              $app->make(TooLongFilter::class),
          ];
    });
```

Để thuận tiện hơn, bạn cũng có thể truyền trực tiếp một mảng tên class; container sẽ phân giải các class này mỗi khi `Firewall` cần các instance `Filter`:

```php
$this->app->when(Firewall::class)
    ->needs(Filter::class)
    ->give([
        NullFilter::class,
        ProfanityFilter::class,
        TooLongFilter::class,
    ]);
```

<a name="variadic-tag-dependencies"></a>
#### Dependency variadic theo tag

Đôi khi một class có dependency variadic được type-hint bằng một class cụ thể (`Report ...$reports`). Bằng các phương thức `needs` và `giveTagged`, bạn có thể inject toàn bộ binding trong container có [tag](#tagging) tương ứng vào dependency đó:

```php
$this->app->when(ReportAggregator::class)
    ->needs(Report::class)
    ->giveTagged('reports');
```

<a name="tagging"></a>
### Gắn tag

Trong một số trường hợp, bạn cần phân giải toàn bộ binding thuộc cùng một "nhóm". Ví dụ, bạn đang xây dựng một bộ phân tích báo cáo nhận vào nhiều implementation khác nhau của interface `Report`. Sau khi đăng ký các implementation `Report`, bạn có thể gán cho chúng một tag bằng phương thức `tag`:

```php
$this->app->bind(CpuReport::class, function () {
    // ...
});

$this->app->bind(MemoryReport::class, function () {
    // ...
});

$this->app->tag([CpuReport::class, MemoryReport::class], 'reports');
```

Sau khi các service đã được gắn tag, bạn có thể dễ dàng phân giải tất cả chúng thông qua phương thức `tagged` của container:

```php
$this->app->bind(ReportAnalyzer::class, function (Application $app) {
    return new ReportAnalyzer($app->tagged('reports'));
});
```

<a name="extending-bindings"></a>
### Mở rộng Binding

Phương thức `extend` cho phép thay đổi một service sau khi service đó được phân giải. Chẳng hạn, khi một service được phân giải, bạn có thể chạy thêm logic để decorate hoặc cấu hình service. `extend` nhận hai đối số: class của service cần mở rộng và một closure trả về service sau khi đã được thay đổi. Closure nhận service đang được phân giải cùng instance của container:

```php
$this->app->extend(Service::class, function (Service $service, Application $app) {
    return new DecoratedService($service);
});
```

<a name="resolving"></a>
## Phân giải

<a name="the-make-method"></a>
### Phương thức `make`

Bạn có thể dùng phương thức `make` để phân giải một instance của class từ container. Phương thức `make` nhận tên class hoặc interface mà bạn muốn phân giải:

```php
use App\Services\Transistor;

$transistor = $this->app->make(Transistor::class);
```

Nếu một số dependency của class không thể được container tự phân giải, bạn có thể cung cấp chúng bằng cách truyền một associative array vào phương thức `makeWith`. Ví dụ, ta có thể truyền thủ công tham số constructor `$id` mà service `Transistor` yêu cầu:

```php
use App\Services\Transistor;

$transistor = $this->app->makeWith(Transistor::class, ['id' => 1]);
```

Phương thức `bound` có thể được dùng để kiểm tra một class hoặc interface đã được bind tường minh vào container hay chưa:

```php
if ($this->app->bound(Transistor::class)) {
    // ...
}
```

Nếu đang ở bên ngoài service provider, tại một vị trí trong code không thể truy cập biến `$app`, bạn có thể sử dụng [facade](/facades) `App` hoặc [helper](/helpers#method-app) `app` để phân giải một instance của class từ container:

```php
use App\Services\Transistor;
use Illuminate\Support\Facades\App;

$transistor = App::make(Transistor::class);

$transistor = app(Transistor::class);
```

Nếu muốn chính instance của Laravel container được inject vào một class đang được container phân giải, bạn có thể type-hint class `Illuminate\Container\Container` trong constructor của class đó:

```php
use Illuminate\Container\Container;

/**
 * Create a new class instance.
 */
public function __construct(
    protected Container $container,
) {}
```

<a name="automatic-injection"></a>
### Tự động inject dependency

Một cách khác — và cũng là cách quan trọng nhất trong thực tế — là type-hint dependency trong constructor của class được container phân giải, chẳng hạn [controller](/controllers), [event listener](/events), [middleware](/middleware) và nhiều loại class khác. Bạn cũng có thể type-hint dependency trong phương thức `handle` của [queued job](/queues). Trong thực tế, đây là cách phần lớn object trong ứng dụng nên được container phân giải.

Ví dụ, bạn có thể type-hint một service do ứng dụng định nghĩa trong constructor của controller. Service đó sẽ được container tự động phân giải và inject vào class:

```php
<?php

namespace App\Http\Controllers;

use App\Services\AppleMusic;

class PodcastController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected AppleMusic $apple,
    ) {}

    /**
     * Show information about the given podcast.
     */
    public function show(string $id): Podcast
    {
        return $this->apple->findPodcast($id);
    }
}
```

<a name="method-invocation-and-injection"></a>
## Gọi phương thức và inject dependency

Đôi khi bạn muốn gọi một phương thức trên một object đồng thời để container tự động inject các dependency của phương thức đó. Ví dụ, với class sau:

```php
<?php

namespace App;

use App\Services\AppleMusic;

class PodcastStats
{
    /**
     * Generate a new podcast stats report.
     */
    public function generate(AppleMusic $apple): array
    {
        return [
            // ...
        ];
    }
}
```

Bạn có thể gọi phương thức `generate` thông qua container như sau:

```php
use App\PodcastStats;
use Illuminate\Support\Facades\App;

$stats = App::call([new PodcastStats, 'generate']);
```

Phương thức `call` chấp nhận bất kỳ PHP callable nào. Bạn thậm chí có thể dùng `call` của container để gọi một closure và đồng thời tự động inject các dependency của closure đó:

```php
use App\Services\AppleMusic;
use Illuminate\Support\Facades\App;

$result = App::call(function (AppleMusic $apple) {
    // ...
});
```

<a name="container-events"></a>
## Sự kiện của Container

Service Container phát một event mỗi khi phân giải một object. Bạn có thể lắng nghe event này bằng phương thức `resolving`:

```php
use App\Services\Transistor;
use Illuminate\Contracts\Foundation\Application;

$this->app->resolving(Transistor::class, function (Transistor $transistor, Application $app) {
    // Called when container resolves objects of type "Transistor"...
});

$this->app->resolving(function (mixed $object, Application $app) {
    // Called when container resolves object of any type...
});
```

Như bạn có thể thấy, object đang được phân giải sẽ được truyền vào callback. Nhờ đó, bạn có thể thiết lập thêm các property cho object trước khi object được chuyển đến nơi sử dụng.

<a name="rebinding"></a>
### Rebinding

Phương thức `rebinding` cho phép bạn lắng nghe thời điểm một service được bind lại vào container, tức service được đăng ký lại hoặc bị ghi đè sau binding ban đầu. Cơ chế này hữu ích khi bạn cần cập nhật dependency hoặc thay đổi hành vi mỗi khi một binding cụ thể được cập nhật:

```php
use App\Contracts\PodcastPublisher;
use App\Services\SpotifyPublisher;
use App\Services\TransistorPublisher;
use Illuminate\Contracts\Foundation\Application;

$this->app->bind(PodcastPublisher::class, SpotifyPublisher::class);

$this->app->rebinding(
    PodcastPublisher::class,
    function (Application $app, PodcastPublisher $newInstance) {
        //
    },
);

// New binding will trigger rebinding closure...
$this->app->bind(PodcastPublisher::class, TransistorPublisher::class);
```

<a name="psr-11"></a>
## PSR-11

Service Container của Laravel implement interface [PSR-11](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-11-container.md). Vì vậy, bạn có thể type-hint interface container của PSR-11 để nhận instance của Laravel container:

```php
use App\Services\Transistor;
use Psr\Container\ContainerInterface;

Route::get('/', function (ContainerInterface $container) {
    $service = $container->get(Transistor::class);

    // ...
});
```

Một exception sẽ được ném ra nếu identifier được cung cấp không thể phân giải. Nếu identifier chưa từng được bind, exception sẽ là một instance của `Psr\Container\NotFoundExceptionInterface`. Nếu identifier đã được bind nhưng quá trình phân giải thất bại, Laravel sẽ ném một instance của `Psr\Container\ContainerExceptionInterface`.
