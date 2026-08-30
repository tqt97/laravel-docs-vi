# Laravel Pennant

- [Giới thiệu](#introduction)
- [Cài đặt](#installation)
- [Cấu hình](#configuration)
- [Định nghĩa feature](#defining-features)
    - [Feature dựa trên class](#class-based-features)
- [Kiểm tra feature](#checking-features)
    - [Thực thi có điều kiện](#conditional-execution)
    - [Trait `HasFeatures`](#the-has-features-trait)
    - [Blade Directive](#blade-directive)
    - [Middleware](#middleware)
    - [Chặn quá trình kiểm tra feature](#intercepting-feature-checks)
    - [Cache in-memory](#in-memory-cache)
- [Scope](#scope)
    - [Chỉ định scope](#specifying-the-scope)
    - [Scope toàn cục](#global-scope)
    - [Scope mặc định](#default-scope)
    - [Scope có thể null](#nullable-scope)
    - [Định danh scope](#identifying-scope)
    - [Serialize scope](#serializing-scope)
- [Giá trị feature phong phú](#rich-feature-values)
- [Lấy nhiều feature](#retrieving-multiple-features)
- [Eager Loading](#eager-loading)
- [Cập nhật giá trị](#updating-values)
    - [Cập nhật hàng loạt](#bulk-updates)
    - [Xóa sạch feature](#purging-features)
- [Testing](#testing)
- [Thêm Pennant driver tùy chỉnh](#adding-custom-pennant-drivers)
    - [Triển khai driver](#implementing-the-driver)
    - [Đăng ký driver](#registering-the-driver)
    - [Định nghĩa feature bên ngoài](#defining-features-externally)
- [Events](#events)

<a name="introduction"></a>
## Giới thiệu

[Laravel Pennant](https://github.com/laravel/pennant) là một package feature flag đơn giản, nhẹ và không kèm những thành phần dư thừa. Feature flag cho phép bạn tự tin triển khai dần các tính năng mới của ứng dụng, A/B test thiết kế giao diện mới, bổ trợ cho chiến lược phát triển trunk-based và nhiều trường hợp khác.

<a name="installation"></a>
## Cài đặt

Trước tiên, hãy cài đặt Pennant vào dự án bằng trình quản lý package Composer:

```shell
composer require laravel/pennant
```

Tiếp theo, bạn nên publish các file cấu hình và migration của Pennant bằng lệnh Artisan `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
```

Cuối cùng, bạn nên chạy các database migration của ứng dụng. Thao tác này sẽ tạo bảng `features` mà Pennant sử dụng cho driver `database`:

```shell
php artisan migrate
```

<a name="configuration"></a>
## Cấu hình

Sau khi publish các asset của Pennant, file cấu hình sẽ nằm tại `config/pennant.php`. File cấu hình này cho phép bạn chỉ định cơ chế lưu trữ mặc định mà Pennant sử dụng để lưu các giá trị feature flag đã được resolve.

Pennant hỗ trợ lưu các giá trị feature flag đã resolve trong một mảng in-memory thông qua driver `array`. Ngoài ra, Pennant có thể lưu bền vững các giá trị này trong relational database thông qua driver `database`, đây là cơ chế lưu trữ mặc định của Pennant.

<a name="defining-features"></a>
## Định nghĩa feature

Để định nghĩa một feature, bạn có thể sử dụng phương thức `define` do facade `Feature` cung cấp. Bạn cần cung cấp tên của feature cùng một closure sẽ được gọi để resolve giá trị ban đầu của feature.

Thông thường, feature được định nghĩa trong service provider bằng facade `Feature`. Closure sẽ nhận "scope" của lần kiểm tra feature. Phổ biến nhất, scope là người dùng hiện đang được xác thực. Trong ví dụ này, chúng ta sẽ định nghĩa một feature để triển khai dần API mới cho người dùng của ứng dụng:

```php
<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Lottery;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::define('new-api', fn (User $user) => match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        });
    }
}
```

Như bạn có thể thấy, feature của chúng ta có các quy tắc sau:

- Tất cả thành viên nội bộ của team sẽ sử dụng API mới.
- Những khách hàng có lưu lượng truy cập cao sẽ không sử dụng API mới.
- Trong các trường hợp còn lại, feature sẽ được gán ngẫu nhiên cho người dùng với xác suất kích hoạt là 1 trên 100.

Lần đầu feature `new-api` được kiểm tra cho một người dùng cụ thể, kết quả của closure sẽ được storage driver lưu lại. Ở lần kiểm tra tiếp theo với cùng người dùng, giá trị sẽ được lấy từ storage và closure sẽ không được gọi lại.

Để thuận tiện, nếu định nghĩa feature chỉ trả về một lottery, bạn có thể bỏ hoàn toàn closure:

    Feature::define('site-redesign', Lottery::odds(1, 1000));

<a name="class-based-features"></a>
### Feature dựa trên class

Pennant cũng cho phép bạn định nghĩa feature dựa trên class. Không giống định nghĩa feature bằng closure, feature dựa trên class không cần được đăng ký trong service provider. Để tạo một feature dựa trên class, bạn có thể chạy lệnh Artisan `pennant:feature`. Theo mặc định, feature class sẽ được đặt trong thư mục `app/Features` của ứng dụng:

```shell
php artisan pennant:feature NewApi
```

Khi viết một feature class, bạn chỉ cần định nghĩa phương thức `resolve`; phương thức này sẽ được gọi để resolve giá trị ban đầu của feature cho một scope cụ thể. Một lần nữa, scope thường là người dùng hiện đang được xác thực:

```php
<?php

namespace App\Features;

use App\Models\User;
use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * Resolve the feature's initial value.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

Nếu muốn tự resolve một instance của feature dựa trên class, bạn có thể gọi phương thức `instance` trên facade `Feature`:

```php
use Illuminate\Support\Facades\Feature;

$instance = Feature::instance(NewApi::class);
```

> [!NOTE]
> Feature class được resolve thông qua [container](/docs/{{version}}/container), vì vậy bạn có thể inject dependency vào constructor của feature class khi cần.

#### Tùy chỉnh tên feature được lưu trữ

Theo mặc định, Pennant sẽ lưu fully qualified class name của feature class. Nếu muốn tách tên feature được lưu khỏi cấu trúc nội bộ của ứng dụng, bạn có thể thêm attribute `Name` vào feature class. Giá trị của attribute này sẽ được lưu thay cho tên class:

```php
<?php

namespace App\Features;

use Laravel\Pennant\Attributes\Name;

#[Name('new-api')]
class NewApi
{
    // ...
}
```

<a name="checking-features"></a>
## Kiểm tra feature

Để xác định một feature có đang active hay không, bạn có thể sử dụng phương thức `active` trên facade `Feature`. Theo mặc định, feature được kiểm tra đối với người dùng hiện đang được xác thực:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Feature::active('new-api')
            ? $this->resolveNewApiResponse($request)
            : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

Mặc dù theo mặc định feature được kiểm tra đối với người dùng hiện đang được xác thực, bạn có thể dễ dàng kiểm tra feature với một người dùng hoặc [scope](#scope) khác. Để thực hiện việc này, hãy sử dụng phương thức `for` do facade `Feature` cung cấp:

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

Pennant cũng cung cấp một số phương thức tiện ích khác hữu ích khi xác định một feature đang active hay inactive:

```php
// Determine if all of the given features are active...
Feature::allAreActive(['new-api', 'site-redesign']);

// Determine if any of the given features are active...
Feature::someAreActive(['new-api', 'site-redesign']);

// Determine if a feature is inactive...
Feature::inactive('new-api');

// Determine if all of the given features are inactive...
Feature::allAreInactive(['new-api', 'site-redesign']);

// Determine if any of the given features are inactive...
Feature::someAreInactive(['new-api', 'site-redesign']);
```

> [!NOTE]
> Khi sử dụng Pennant bên ngoài HTTP context, chẳng hạn trong Artisan command hoặc queued job, thông thường bạn nên [chỉ định rõ scope của feature](#specifying-the-scope). Ngoài ra, bạn có thể định nghĩa một [scope mặc định](#default-scope) có tính đến cả HTTP context đã xác thực và context chưa xác thực.

<a name="checking-class-based-features"></a>
#### Kiểm tra feature dựa trên class

Đối với feature dựa trên class, bạn nên cung cấp tên class khi kiểm tra feature:

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Feature::active(NewApi::class)
            ? $this->resolveNewApiResponse($request)
            : $this->resolveLegacyApiResponse($request);
    }

    // ...
}
```

<a name="conditional-execution"></a>
### Thực thi có điều kiện

Phương thức `when` có thể được sử dụng để thực thi một closure theo cách fluent khi một feature đang active. Ngoài ra, bạn có thể cung cấp closure thứ hai và closure này sẽ được thực thi nếu feature đang inactive:

```php
<?php

namespace App\Http\Controllers;

use App\Features\NewApi;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Feature;

class PodcastController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Feature::when(NewApi::class,
            fn () => $this->resolveNewApiResponse($request),
            fn () => $this->resolveLegacyApiResponse($request),
        );
    }

    // ...
}
```

Phương thức `unless` hoạt động ngược lại với phương thức `when`, thực thi closure đầu tiên nếu feature đang inactive:

```php
return Feature::unless(NewApi::class,
    fn () => $this->resolveLegacyApiResponse($request),
    fn () => $this->resolveNewApiResponse($request),
);
```

<a name="the-has-features-trait"></a>
### Trait `HasFeatures`

Trait `HasFeatures` của Pennant có thể được thêm vào model `User` của ứng dụng (hoặc bất kỳ model nào có feature) để cung cấp cách kiểm tra feature trực tiếp từ model một cách fluent và thuận tiện:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Pennant\Concerns\HasFeatures;

class User extends Authenticatable
{
    use HasFeatures;

    // ...
}
```

Sau khi trait được thêm vào model, bạn có thể dễ dàng kiểm tra feature bằng cách gọi phương thức `features`:

```php
if ($user->features()->active('new-api')) {
    // ...
}
```

Tất nhiên, phương thức `features` cũng cung cấp quyền truy cập vào nhiều phương thức tiện ích khác để tương tác với feature:

```php
// Values...
$value = $user->features()->value('purchase-button')
$values = $user->features()->values(['new-api', 'purchase-button']);

// State...
$user->features()->active('new-api');
$user->features()->allAreActive(['new-api', 'server-api']);
$user->features()->someAreActive(['new-api', 'server-api']);

$user->features()->inactive('new-api');
$user->features()->allAreInactive(['new-api', 'server-api']);
$user->features()->someAreInactive(['new-api', 'server-api']);

// Conditional execution...
$user->features()->when('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);

$user->features()->unless('new-api',
    fn () => /* ... */,
    fn () => /* ... */,
);
```

<a name="blade-directive"></a>
### Blade Directive

Để việc kiểm tra feature trong Blade trở nên liền mạch, Pennant cung cấp các directive `@feature` và `@featureany`:

```blade
@feature('site-redesign')
    <!-- 'site-redesign' is active -->
@else
    <!-- 'site-redesign' is inactive -->
@endfeature

@featureany(['site-redesign', 'beta'])
    <!-- 'site-redesign' or `beta` is active -->
@endfeatureany
```

<a name="middleware"></a>
### Middleware

Pennant cũng cung cấp một [middleware](/docs/{{version}}/middleware) có thể dùng để xác minh người dùng hiện đang được xác thực có quyền truy cập một feature trước cả khi route được thực thi. Bạn có thể gán middleware này cho một route và chỉ định các feature bắt buộc để truy cập route đó. Nếu bất kỳ feature nào được chỉ định đang inactive đối với người dùng hiện tại, route sẽ trả về HTTP response `400 Bad Request`. Có thể truyền nhiều feature vào phương thức static `using`.

```php
use Illuminate\Support\Facades\Route;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

Route::get('/api/servers', function () {
    // ...
})->middleware(EnsureFeaturesAreActive::using('new-api', 'servers-api'));
```

<a name="customizing-the-response"></a>
#### Tùy chỉnh response

Nếu muốn tùy chỉnh response mà middleware trả về khi một trong các feature được liệt kê đang inactive, bạn có thể sử dụng phương thức `whenInactive` do middleware `EnsureFeaturesAreActive` cung cấp. Thông thường, phương thức này nên được gọi trong phương thức `boot` của một service provider trong ứng dụng:

```php
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Pennant\Middleware\EnsureFeaturesAreActive;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    EnsureFeaturesAreActive::whenInactive(
        function (Request $request, array $features) {
            return new Response(status: 403);
        }
    );

    // ...
}
```

<a name="intercepting-feature-checks"></a>
### Chặn quá trình kiểm tra feature

Đôi khi việc thực hiện một số kiểm tra in-memory trước khi lấy giá trị đã lưu của một feature sẽ hữu ích. Hãy tưởng tượng bạn đang phát triển một API mới phía sau feature flag và muốn có khả năng tắt API mới mà không làm mất các giá trị feature đã được resolve trong storage. Nếu phát hiện lỗi trong API mới, bạn có thể dễ dàng tắt nó với tất cả mọi người ngoại trừ thành viên nội bộ, sửa lỗi rồi bật lại API mới cho những người dùng trước đó đã có quyền truy cập feature.

Bạn có thể thực hiện điều này bằng phương thức `before` của [feature dựa trên class](#class-based-features). Khi tồn tại, phương thức `before` luôn được chạy in-memory trước khi lấy giá trị từ storage. Nếu phương thức trả về một giá trị khác `null`, giá trị đó sẽ được sử dụng thay cho giá trị đã lưu của feature trong suốt request:

```php
<?php

namespace App\Features;

use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Lottery;

class NewApi
{
    /**
     * Run an always-in-memory check before the stored value is retrieved.
     */
    public function before(User $user): mixed
    {
        if (Config::get('features.new-api.disabled')) {
            return $user->isInternalTeamMember();
        }
    }

    /**
     * Resolve the feature's initial value.
     */
    public function resolve(User $user): mixed
    {
        return match (true) {
            $user->isInternalTeamMember() => true,
            $user->isHighTrafficCustomer() => false,
            default => Lottery::odds(1 / 100),
        };
    }
}
```

Bạn cũng có thể sử dụng cơ chế này để lên lịch rollout toàn cục cho một feature trước đó được đặt phía sau feature flag:

```php
<?php

namespace App\Features;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;

class NewApi
{
    /**
     * Run an always-in-memory check before the stored value is retrieved.
     */
    public function before(User $user): mixed
    {
        if (Config::get('features.new-api.disabled')) {
            return $user->isInternalTeamMember();
        }

        if (Carbon::parse(Config::get('features.new-api.rollout-date'))->isPast()) {
            return true;
        }
    }

    // ...
}
```

<a name="in-memory-cache"></a>
### Cache in-memory

Khi kiểm tra một feature, Pennant sẽ tạo cache in-memory cho kết quả. Nếu đang sử dụng driver `database`, điều này có nghĩa việc kiểm tra lại cùng một feature flag trong một request sẽ không kích hoạt thêm database query. Cơ chế này cũng đảm bảo feature có kết quả nhất quán trong suốt request.

Nếu cần tự xóa cache in-memory, bạn có thể sử dụng phương thức `flushCache` do facade `Feature` cung cấp:

```php
Feature::flushCache();
```

<a name="scope"></a>
## Scope

<a name="specifying-the-scope"></a>
### Chỉ định scope

Như đã đề cập, feature thường được kiểm tra đối với người dùng hiện đang được xác thực. Tuy nhiên, điều này không phải lúc nào cũng phù hợp với nhu cầu của bạn. Vì vậy, bạn có thể chỉ định scope mà mình muốn dùng để kiểm tra một feature thông qua phương thức `for` của facade `Feature`:

```php
return Feature::for($user)->active('new-api')
    ? $this->resolveNewApiResponse($request)
    : $this->resolveLegacyApiResponse($request);
```

Tất nhiên, scope của feature không chỉ giới hạn ở "người dùng". Hãy tưởng tượng bạn đã xây dựng trải nghiệm billing mới và đang rollout cho toàn bộ team thay vì từng người dùng riêng lẻ. Có thể bạn muốn các team lâu đời được rollout chậm hơn các team mới. Closure resolve feature có thể trông như sau:

```php
use App\Models\Team;
use Illuminate\Support\Carbon;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('billing-v2', function (Team $team) {
    if ($team->created_at->isAfter(new Carbon('1st Jan, 2023'))) {
        return true;
    }

    if ($team->created_at->isAfter(new Carbon('1st Jan, 2019'))) {
        return Lottery::odds(1 / 100);
    }

    return Lottery::odds(1 / 1000);
});
```

Bạn sẽ thấy closure đã định nghĩa không nhận `User` mà thay vào đó nhận model `Team`. Để xác định feature này có active đối với team của một người dùng hay không, bạn nên truyền team vào phương thức `for` do facade `Feature` cung cấp:

```php
if (Feature::for($user->team)->active('billing-v2')) {
    return redirect('/billing/v2');
}

// ...
```

<a name="global-scope"></a>
### Scope toàn cục

Để kiểm tra hoặc tương tác với một feature bằng scope toàn cục, bất kể default scope resolver đã cấu hình, hãy sử dụng phương thức `globally`. Cách này hữu ích cho các feature flag áp dụng toàn ứng dụng, chẳng hạn tạm thời bật hành vi bảo trì hoặc rollout một feature cho mọi người dùng:

```php
Feature::globally()->active('new-api');

Feature::globally()->activate('new-api');
```

<a name="default-scope"></a>
### Scope mặc định

Bạn cũng có thể tùy chỉnh scope mặc định mà Pennant sử dụng để kiểm tra feature. Ví dụ, có thể tất cả feature của bạn được kiểm tra đối với team của người dùng hiện đang được xác thực thay vì chính người dùng. Thay vì phải gọi `Feature::for($user->team)` mỗi lần kiểm tra feature, bạn có thể chỉ định team làm scope mặc định. Thông thường, việc này nên được thực hiện trong một service provider của ứng dụng:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::resolveScopeUsing(fn ($driver) => Auth::user()?->team);

        // ...
    }
}
```

Nếu không có scope nào được cung cấp rõ ràng thông qua phương thức `for`, quá trình kiểm tra feature giờ đây sẽ sử dụng team của người dùng hiện đang được xác thực làm scope mặc định:

```php
Feature::active('billing-v2');

// Is now equivalent to...

Feature::for($user->team)->active('billing-v2');
```

<a name="nullable-scope"></a>
### Scope có thể null

Nếu scope bạn cung cấp khi kiểm tra feature là `null` và định nghĩa feature không hỗ trợ `null` thông qua nullable type hoặc bằng cách bao gồm `null` trong union type, Pennant sẽ tự động trả về `false` làm giá trị kết quả của feature.

Vì vậy, nếu scope truyền vào feature có khả năng là `null` và bạn muốn value resolver của feature được gọi, bạn cần xử lý trường hợp đó trong định nghĩa feature. Scope `null` có thể xuất hiện khi bạn kiểm tra feature trong Artisan command, queued job hoặc route chưa xác thực. Vì các context này thường không có người dùng đã xác thực, scope mặc định sẽ là `null`.

Nếu không phải lúc nào bạn cũng [chỉ định rõ scope của feature](#specifying-the-scope), hãy đảm bảo kiểu của scope là "nullable" và xử lý giá trị scope `null` trong logic định nghĩa feature:

```php
use App\Models\User;
use Illuminate\Support\Lottery;
use Laravel\Pennant\Feature;

Feature::define('new-api', fn (User $user) => match (true) {// [tl! remove]
Feature::define('new-api', fn (User|null $user) => match (true) {// [tl! add]
    $user === null => true,// [tl! add]
    $user->isInternalTeamMember() => true,
    $user->isHighTrafficCustomer() => false,
    default => Lottery::odds(1 / 100),
});
```

<a name="identifying-scope"></a>
### Định danh scope

Các storage driver `array` và `database` tích hợp sẵn của Pennant biết cách lưu đúng identifier của scope cho mọi kiểu dữ liệu PHP cũng như Eloquent model. Tuy nhiên, nếu ứng dụng sử dụng Pennant driver của bên thứ ba, driver đó có thể không biết cách lưu đúng identifier cho Eloquent model hoặc các kiểu tùy chỉnh khác trong ứng dụng.

Vì vậy, Pennant cho phép bạn định dạng giá trị scope để lưu trữ bằng cách implement contract `FeatureScopeable` trên các object trong ứng dụng được sử dụng làm Pennant scope.

Ví dụ, hãy tưởng tượng bạn đang sử dụng hai feature driver khác nhau trong cùng một ứng dụng: driver `database` tích hợp sẵn và driver bên thứ ba "Flag Rocket". Driver "Flag Rocket" không biết cách lưu đúng một Eloquent model mà yêu cầu instance `FlagRocketUser`. Bằng cách implement `toFeatureIdentifier` được định nghĩa bởi contract `FeatureScopeable`, chúng ta có thể tùy chỉnh giá trị scope có thể lưu được cung cấp cho từng driver mà ứng dụng sử dụng:

```php
<?php

namespace App\Models;

use FlagRocket\FlagRocketUser;
use Illuminate\Database\Eloquent\Model;
use Laravel\Pennant\Contracts\FeatureScopeable;

class User extends Model implements FeatureScopeable
{
    /**
     * Cast the object to a feature scope identifier for the given driver.
     */
    public function toFeatureIdentifier(string $driver): mixed
    {
        return match($driver) {
            'database' => $this,
            'flag-rocket' => FlagRocketUser::fromId($this->flag_rocket_id),
        };
    }
}
```

<a name="serializing-scope"></a>
### Serialize scope

Theo mặc định, Pennant sẽ sử dụng fully qualified class name khi lưu một feature gắn với Eloquent model. Nếu bạn đã sử dụng [Eloquent morph map](/docs/{{version}}/eloquent-relationships#custom-polymorphic-types), bạn có thể cho Pennant sử dụng morph map để tách feature đã lưu khỏi cấu trúc ứng dụng.

Để thực hiện điều này, sau khi định nghĩa Eloquent morph map trong service provider, bạn có thể gọi phương thức `useMorphMap` của facade `Feature`:

```php
use Illuminate\Database\Eloquent\Relations\Relation;
use Laravel\Pennant\Feature;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);

Feature::useMorphMap();
```

<a name="rich-feature-values"></a>
## Giá trị feature phong phú

Cho đến giờ, chúng ta chủ yếu minh họa feature ở trạng thái nhị phân, nghĩa là "active" hoặc "inactive". Tuy nhiên, Pennant cũng cho phép bạn lưu các giá trị phong phú hơn.

Ví dụ, giả sử bạn đang thử nghiệm ba màu mới cho nút "Buy now" của ứng dụng. Thay vì trả về `true` hoặc `false` từ định nghĩa feature, bạn có thể trả về một chuỗi:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn (User $user) => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

Bạn có thể lấy giá trị của feature `purchase-button` bằng phương thức `value`:

```php
$color = Feature::value('purchase-button');
```

Blade directive đi kèm Pennant cũng giúp bạn dễ dàng render nội dung có điều kiện dựa trên giá trị hiện tại của feature:

```blade
@feature('purchase-button', 'blue-sapphire')
    <!-- 'blue-sapphire' is active -->
@elsefeature('purchase-button', 'seafoam-green')
    <!-- 'seafoam-green' is active -->
@elsefeature('purchase-button', 'tart-orange')
    <!-- 'tart-orange' is active -->
@endfeature
```

> [!NOTE]
> Khi sử dụng rich value, cần lưu ý rằng một feature được xem là "active" khi nó có bất kỳ giá trị nào khác `false`.

Khi gọi phương thức [`when` có điều kiện](#conditional-execution), rich value của feature sẽ được truyền vào closure đầu tiên:

```php
Feature::when('purchase-button',
    fn ($color) => /* ... */,
    fn () => /* ... */,
);
```

Tương tự, khi gọi phương thức `unless` có điều kiện, rich value của feature sẽ được truyền vào closure thứ hai nếu closure này được cung cấp:

```php
Feature::unless('purchase-button',
    fn () => /* ... */,
    fn ($color) => /* ... */,
);
```

<a name="retrieving-multiple-features"></a>
## Lấy nhiều feature

Phương thức `values` cho phép lấy nhiều feature cho một scope nhất định:

```php
Feature::values(['billing-v2', 'purchase-button']);

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
// ]
```

Hoặc, bạn có thể dùng phương thức `all` để lấy giá trị của tất cả feature đã định nghĩa cho một scope nhất định:

```php
Feature::all();

// [
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

Tuy nhiên, các feature dựa trên class được đăng ký động và Pennant sẽ chưa biết đến chúng cho tới khi chúng được kiểm tra một cách tường minh. Điều này có nghĩa các class-based feature của ứng dụng có thể không xuất hiện trong kết quả của phương thức `all` nếu chúng chưa được kiểm tra trong request hiện tại.

Nếu muốn đảm bảo các feature class luôn được bao gồm khi dùng phương thức `all`, bạn có thể sử dụng khả năng feature discovery của Pennant. Để bắt đầu, hãy gọi phương thức `discover` trong một service provider của ứng dụng:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Feature::discover();

        // ...
    }
}
```

Phương thức `discover` sẽ đăng ký tất cả feature class trong thư mục `app/Features` của ứng dụng. Từ đó, phương thức `all` sẽ bao gồm các class này trong kết quả bất kể chúng đã được kiểm tra trong request hiện tại hay chưa:

```php
Feature::all();

// [
//     'App\Features\NewApi' => true,
//     'billing-v2' => false,
//     'purchase-button' => 'blue-sapphire',
//     'site-redesign' => true,
// ]
```

<a name="eager-loading"></a>
## Eager Loading

Mặc dù Pennant duy trì cache in-memory cho tất cả feature đã resolve trong một request, bạn vẫn có thể gặp vấn đề hiệu năng. Để giảm vấn đề này, Pennant cung cấp khả năng eager load giá trị feature.

Để minh họa, giả sử chúng ta kiểm tra một feature có active hay không bên trong vòng lặp:

```php
use Laravel\Pennant\Feature;

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

Giả sử đang dùng database driver, đoạn code này sẽ thực thi một database query cho mỗi user trong vòng lặp, có thể dẫn đến hàng trăm query. Tuy nhiên, bằng phương thức `load` của Pennant, chúng ta có thể loại bỏ nút thắt hiệu năng này bằng cách eager load giá trị feature cho một collection user hoặc scope:

```php
Feature::for($users)->load(['notifications-beta']);

foreach ($users as $user) {
    if (Feature::for($user)->active('notifications-beta')) {
        $user->notify(new RegistrationSuccess);
    }
}
```

Để chỉ load các giá trị feature chưa được load, bạn có thể dùng phương thức `loadMissing`:

```php
Feature::for($users)->loadMissing([
    'new-api',
    'purchase-button',
    'notifications-beta',
]);
```

Bạn có thể load tất cả feature đã định nghĩa bằng phương thức `loadAll`:

```php
Feature::for($users)->loadAll();
```

<a name="updating-values"></a>
## Cập nhật giá trị

Khi giá trị của một feature được resolve lần đầu, driver bên dưới sẽ lưu kết quả vào storage. Điều này thường cần thiết để đảm bảo trải nghiệm nhất quán cho user giữa các request. Tuy nhiên, đôi lúc bạn có thể muốn cập nhật thủ công giá trị đã lưu của feature.

Để làm điều đó, bạn có thể dùng các phương thức `activate` và `deactivate` để bật hoặc tắt một feature:

```php
use Laravel\Pennant\Feature;

// Activate the feature for the default scope...
Feature::activate('new-api');

// Deactivate the feature for the given scope...
Feature::for($user->team)->deactivate('billing-v2');
```

Bạn cũng có thể đặt thủ công rich value cho một feature bằng cách truyền đối số thứ hai vào phương thức `activate`:

```php
Feature::activate('purchase-button', 'seafoam-green');
```

Để yêu cầu Pennant quên giá trị đã lưu của một feature, bạn có thể dùng phương thức `forget`. Khi feature được kiểm tra lại, Pennant sẽ resolve giá trị từ định nghĩa feature:

```php
Feature::forget('purchase-button');
```

<a name="bulk-updates"></a>
### Cập nhật hàng loạt

Để cập nhật hàng loạt các giá trị feature đã lưu, bạn có thể dùng các phương thức `activateForEveryone` và `deactivateForEveryone`.

Ví dụ, giả sử bạn đã tin tưởng vào độ ổn định của feature `new-api` và đã chọn được màu tốt nhất cho `purchase-button` trong checkout flow; bạn có thể cập nhật giá trị đã lưu tương ứng cho tất cả user:

```php
use Laravel\Pennant\Feature;

Feature::activateForEveryone('new-api');

Feature::activateForEveryone('purchase-button', 'seafoam-green');
```

Ngoài ra, bạn có thể deactivate feature cho tất cả user:

```php
Feature::deactivateForEveryone('new-api');
```

> [!NOTE]
> Thao tác này chỉ cập nhật các giá trị feature đã resolve và được storage driver của Pennant lưu lại. Bạn cũng cần cập nhật định nghĩa feature trong ứng dụng.

<a name="purging-features"></a>
### Xóa sạch feature

Đôi khi, việc xóa sạch toàn bộ một feature khỏi storage là hữu ích. Điều này thường cần thiết khi bạn đã loại bỏ feature khỏi ứng dụng hoặc đã điều chỉnh định nghĩa feature và muốn rollout thay đổi đó cho tất cả user.

Bạn có thể xóa tất cả giá trị đã lưu của một feature bằng phương thức `purge`:

```php
// Purging a single feature...
Feature::purge('new-api');

// Purging multiple features...
Feature::purge(['new-api', 'purchase-button']);
```

Nếu muốn xóa _tất cả_ feature khỏi storage, bạn có thể gọi phương thức `purge` mà không truyền đối số:

```php
Feature::purge();
```

Vì việc purge feature có thể hữu ích trong deployment pipeline của ứng dụng, Pennant cung cấp Artisan command `pennant:purge` để xóa các feature được chỉ định khỏi storage:

```shell
php artisan pennant:purge new-api

php artisan pennant:purge new-api purchase-button
```

Bạn cũng có thể purge tất cả feature _ngoại trừ_ những feature trong một danh sách nhất định. Ví dụ, nếu muốn purge mọi feature nhưng giữ lại giá trị của "new-api" và "purchase-button" trong storage, hãy truyền tên các feature đó vào tùy chọn `--except`:

```shell
php artisan pennant:purge --except=new-api --except=purchase-button
```

Để thuận tiện, command `pennant:purge` cũng hỗ trợ flag `--except-registered`. Flag này chỉ định rằng tất cả feature, ngoại trừ những feature được đăng ký tường minh trong service provider, sẽ bị purge:

```shell
php artisan pennant:purge --except-registered
```

<a name="testing"></a>
## Testing

Khi test code tương tác với feature flag, cách đơn giản nhất để kiểm soát giá trị feature flag trả về trong test là định nghĩa lại feature. Ví dụ, giả sử bạn có feature sau được định nghĩa trong một service provider của ứng dụng:

```php
use Illuminate\Support\Arr;
use Laravel\Pennant\Feature;

Feature::define('purchase-button', fn () => Arr::random([
    'blue-sapphire',
    'seafoam-green',
    'tart-orange',
]));
```

Để thay đổi giá trị feature trả về trong test, bạn có thể định nghĩa lại feature ở đầu test. Test sau sẽ luôn pass, dù implementation `Arr::random()` vẫn còn trong service provider:

```php tab=Pest
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define('purchase-button', 'seafoam-green');

    expect(Feature::value('purchase-button'))->toBe('seafoam-green');
});
```

```php tab=PHPUnit
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define('purchase-button', 'seafoam-green');

    $this->assertSame('seafoam-green', Feature::value('purchase-button'));
}
```

Cách tiếp cận tương tự có thể được dùng cho class-based feature:

```php tab=Pest
use Laravel\Pennant\Feature;

test('it can control feature values', function () {
    Feature::define(NewApi::class, true);

    expect(Feature::value(NewApi::class))->toBeTrue();
});
```

```php tab=PHPUnit
use App\Features\NewApi;
use Laravel\Pennant\Feature;

public function test_it_can_control_feature_values()
{
    Feature::define(NewApi::class, true);

    $this->assertTrue(Feature::value(NewApi::class));
}
```

Nếu feature trả về một instance `Lottery`, Laravel cung cấp một số [testing helper hữu ích](/docs/{{version}}/helpers#testing-lotteries).

<a name="store-configuration"></a>
#### Cấu hình store

Bạn có thể cấu hình store mà Pennant sử dụng khi testing bằng cách định nghĩa biến môi trường `PENNANT_STORE` trong file `phpunit.xml` của ứng dụng:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit colors="true">
    <!-- ... -->
    <php>
        <env name="PENNANT_STORE" value="array"/>
        <!-- ... -->
    </php>
</phpunit>
```

<a name="adding-custom-pennant-drivers"></a>
## Thêm Pennant driver tùy chỉnh

<a name="implementing-the-driver"></a>
#### Triển khai driver

Nếu không storage driver hiện có nào của Pennant phù hợp nhu cầu ứng dụng, bạn có thể tự viết storage driver. Driver tùy chỉnh cần implement interface `Laravel\Pennant\Contracts\Driver`:

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;

class RedisFeatureDriver implements Driver
{
    public function define(string $feature, callable $resolver): void {}
    public function defined(): array {}
    public function getAll(array $features): array {}
    public function get(string $feature, mixed $scope): mixed {}
    public function set(string $feature, mixed $scope, mixed $value): void {}
    public function setForAllScopes(string $feature, mixed $value): void {}
    public function delete(string $feature, mixed $scope): void {}
    public function purge(array|null $features): void {}
}
```

Bây giờ, chúng ta chỉ cần triển khai từng phương thức bằng kết nối Redis. Để xem ví dụ cách triển khai từng phương thức, hãy tham khảo `Laravel\Pennant\Drivers\DatabaseDriver` trong [source code Pennant](https://github.com/laravel/pennant/blob/1.x/src/Drivers/DatabaseDriver.php).

> [!NOTE]
> Laravel không cung cấp sẵn thư mục dành cho các extension. Bạn có thể đặt chúng ở bất kỳ đâu. Trong ví dụ này, chúng ta tạo thư mục `Extensions` để chứa `RedisFeatureDriver`.

<a name="registering-the-driver"></a>
#### Đăng ký driver

Sau khi triển khai driver, bạn có thể đăng ký nó với Laravel. Để thêm driver vào Pennant, hãy dùng phương thức `extend` do facade `Feature` cung cấp. Bạn nên gọi `extend` từ phương thức `boot` của một [service provider](/docs/{{version}}/providers) trong ứng dụng:

```php
<?php

namespace App\Providers;

use App\Extensions\RedisFeatureDriver;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

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
        Feature::extend('redis', function (Application $app) {
            return new RedisFeatureDriver($app->make('redis'), $app->make('events'), []);
        });
    }
}
```

Sau khi driver được đăng ký, bạn có thể sử dụng driver `redis` trong file cấu hình `config/pennant.php` của ứng dụng:

```php
'stores' => [

    'redis' => [
        'driver' => 'redis',
        'connection' => null,
    ],

    // ...

],
```

<a name="defining-features-externally"></a>
### Định nghĩa feature bên ngoài

Nếu driver của bạn là wrapper cho một nền tảng feature flag bên thứ ba, nhiều khả năng bạn sẽ định nghĩa feature trên nền tảng đó thay vì dùng phương thức `Feature::define` của Pennant. Trong trường hợp này, driver tùy chỉnh cũng cần implement interface `Laravel\Pennant\Contracts\DefinesFeaturesExternally`:

```php
<?php

namespace App\Extensions;

use Laravel\Pennant\Contracts\Driver;
use Laravel\Pennant\Contracts\DefinesFeaturesExternally;

class FeatureFlagServiceDriver implements Driver, DefinesFeaturesExternally
{
    /**
     * Get the features defined for the given scope.
     */
    public function definedFeaturesForScope(mixed $scope): array {}

    /* ... */
}
```

Phương thức `definedFeaturesForScope` cần trả về danh sách tên feature được định nghĩa cho scope đã cung cấp.

<a name="events"></a>
## Events

Pennant dispatch nhiều event hữu ích khi theo dõi feature flag trong toàn bộ ứng dụng.

### `Laravel\Pennant\Events\FeatureRetrieved`

Event này được dispatch mỗi khi một [feature được kiểm tra](#checking-features). Event này có thể hữu ích để tạo và theo dõi metric về việc sử dụng feature flag trong toàn ứng dụng.

### `Laravel\Pennant\Events\FeatureResolved`

Event này được dispatch lần đầu tiên giá trị của một feature được resolve cho một scope cụ thể.

### `Laravel\Pennant\Events\UnknownFeatureResolved`

Event này được dispatch lần đầu tiên một feature không xác định được resolve cho một scope cụ thể. Lắng nghe event này có thể hữu ích nếu bạn định xóa một feature flag nhưng vô tình vẫn còn các tham chiếu rải rác tới nó trong ứng dụng:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Laravel\Pennant\Events\UnknownFeatureResolved;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(function (UnknownFeatureResolved $event) {
            Log::error("Resolving unknown feature [{$event->feature}].");
        });
    }
}
```

### `Laravel\Pennant\Events\DynamicallyRegisteringFeatureClass`

Event này được dispatch khi một [class-based feature](#class-based-features) được kiểm tra động lần đầu trong một request.

### `Laravel\Pennant\Events\UnexpectedNullScopeEncountered`

Event này được dispatch khi scope `null` được truyền vào một định nghĩa feature [không hỗ trợ null](#nullable-scope).

Tình huống này được xử lý an toàn và feature sẽ trả về `false`. Tuy nhiên, nếu không muốn sử dụng hành vi mặc định này, bạn có thể đăng ký listener cho event trong phương thức `boot` của `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Log;
use Laravel\Pennant\Events\UnexpectedNullScopeEncountered;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(UnexpectedNullScopeEncountered::class, fn () => abort(500));
}
```

### `Laravel\Pennant\Events\FeatureUpdated`

Event này được dispatch khi cập nhật một feature cho một scope, thường thông qua `activate` hoặc `deactivate`.

### `Laravel\Pennant\Events\FeatureUpdatedForAllScopes`

Event này được dispatch khi cập nhật một feature cho tất cả scope, thường thông qua `activateForEveryone` hoặc `deactivateForEveryone`.

### `Laravel\Pennant\Events\FeatureDeleted`

Event này được dispatch khi xóa một feature cho một scope, thường thông qua `forget`.

### `Laravel\Pennant\Events\FeaturesPurged`

Event này được dispatch khi purge các feature cụ thể.

### `Laravel\Pennant\Events\AllFeaturesPurged`

Event này được dispatch khi purge tất cả feature.

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/pennant). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
