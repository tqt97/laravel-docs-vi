# View

<a name="introduction"></a>
## Giới thiệu

Dĩ nhiên, việc trả trực tiếp toàn bộ chuỗi tài liệu HTML từ route và controller là không thực tế. May mắn thay, view cung cấp một cách thuận tiện để đặt toàn bộ HTML vào các file riêng biệt. View tách logic controller / ứng dụng khỏi logic trình bày và được lưu trong thư mục `resources/views`. Khi sử dụng Laravel, template view thường được viết bằng [ngôn ngữ template Blade](/docs/{{version}}/blade). Một view đơn giản có thể trông như sau:

```blade
<!-- View stored in resources/views/greeting.blade.php -->

<html>
    <body>
        <h1>Hello, {{ $name }}</h1>
    </body>
</html>
```

Vì view này được lưu tại `resources/views/greeting.blade.php`, chúng ta có thể trả về view bằng helper `view` toàn cục như sau:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

> [!NOTE]
> Bạn muốn tìm hiểu thêm về cách viết Blade template? Hãy xem đầy đủ [tài liệu Blade](/docs/{{version}}/blade) để bắt đầu.

<a name="writing-views-in-react-svelte-or-vue"></a>
### Viết view bằng React / Svelte / Vue

Thay vì viết template frontend bằng PHP thông qua Blade, nhiều developer hiện thích viết template bằng React, Svelte hoặc Vue. Laravel giúp việc này trở nên đơn giản nhờ [Inertia](https://inertiajs.com/), một thư viện giúp kết nối frontend React / Svelte / Vue với backend Laravel mà không phải xử lý những phức tạp thường gặp khi xây dựng SPA.

Các [starter kit ứng dụng React, Svelte và Vue](/docs/{{version}}/starter-kits) cung cấp điểm khởi đầu tốt cho ứng dụng Laravel tiếp theo sử dụng Inertia.

<a name="creating-and-rendering-views"></a>
## Tạo và render view

Bạn có thể tạo view bằng cách đặt file có phần mở rộng `.blade.php` trong thư mục `resources/views` của ứng dụng hoặc sử dụng lệnh Artisan `make:view`:

```shell
php artisan make:view greeting
```

Phần mở rộng `.blade.php` cho framework biết file chứa một [Blade template](/docs/{{version}}/blade). Blade template gồm HTML cùng các Blade directive cho phép bạn dễ dàng hiển thị giá trị, tạo câu lệnh `if`, lặp qua dữ liệu và nhiều thao tác khác.

Sau khi tạo view, bạn có thể trả view từ một route hoặc controller của ứng dụng bằng helper `view` toàn cục:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'James']);
});
```

View cũng có thể được trả về bằng facade `View`:

```php
use Illuminate\Support\Facades\View;

return View::make('greeting', ['name' => 'James']);
```

Như bạn thấy, đối số đầu tiên truyền vào helper `view` tương ứng với tên file view trong thư mục `resources/views`. Đối số thứ hai là một mảng dữ liệu cần được cung cấp cho view. Trong trường hợp này, chúng ta truyền biến `name`, biến này được hiển thị trong view bằng [cú pháp Blade](/docs/{{version}}/blade).

<a name="nested-view-directories"></a>
### Thư mục view lồng nhau

View cũng có thể được đặt trong các thư mục con của `resources/views`. Bạn có thể dùng ký pháp dấu chấm để tham chiếu view lồng nhau. Ví dụ, nếu view được lưu tại `resources/views/admin/profile.blade.php`, bạn có thể trả nó từ một route / controller như sau:

```php
return view('admin.profile', $data);
```

> [!WARNING]
> Tên thư mục view không nên chứa ký tự `.`.

<a name="creating-the-first-available-view"></a>
### Tạo view khả dụng đầu tiên

Sử dụng phương thức `first` của facade `View`, bạn có thể tạo view đầu tiên tồn tại trong một mảng các view. Điều này có thể hữu ích nếu ứng dụng hoặc package cho phép tùy chỉnh hay ghi đè view:

```php
use Illuminate\Support\Facades\View;

return View::first(['custom.admin', 'admin'], $data);
```

<a name="determining-if-a-view-exists"></a>
### Kiểm tra view có tồn tại

Nếu cần xác định một view có tồn tại hay không, bạn có thể sử dụng facade `View`. Phương thức `exists` trả về `true` nếu view tồn tại:

```php
use Illuminate\Support\Facades\View;

if (View::exists('admin.profile')) {
    // ...
}
```

<a name="passing-data-to-views"></a>
## Truyền dữ liệu vào view

Như trong các ví dụ trước, bạn có thể truyền một mảng dữ liệu vào view để dữ liệu đó khả dụng bên trong view:

```php
return view('greetings', ['name' => 'Victoria']);
```

Khi truyền thông tin theo cách này, dữ liệu nên là một mảng các cặp key / value. Sau khi cung cấp dữ liệu cho view, bạn có thể truy cập từng giá trị trong view bằng key tương ứng, chẳng hạn `<?php echo $name; ?>`.

Thay vì truyền toàn bộ mảng dữ liệu vào helper `view`, bạn có thể dùng phương thức `with` để thêm từng phần dữ liệu riêng lẻ vào view. Phương thức `with` trả về một instance của view object, vì vậy bạn có thể tiếp tục chain các phương thức trước khi trả view:

```php
return view('greeting')
    ->with('name', 'Victoria')
    ->with('occupation', 'Astronaut');
```

<a name="sharing-data-with-all-views"></a>
### Chia sẻ dữ liệu với tất cả view

Đôi khi, bạn có thể cần chia sẻ dữ liệu với tất cả view được ứng dụng render. Bạn có thể thực hiện điều này bằng phương thức `share` của facade `View`. Thông thường, bạn nên đặt lời gọi phương thức `share` trong phương thức `boot` của một service provider. Bạn có thể thêm chúng vào class `App\Providers\AppServiceProvider` hoặc tạo một service provider riêng để chứa chúng:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;

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
        View::share('key', 'value');
    }
}
```

<a name="view-composers"></a>
## View Composer

View composer là callback hoặc phương thức của class được gọi khi một view được render. Nếu có dữ liệu cần được bind vào một view mỗi lần view đó được render, view composer giúp bạn tổ chức logic này tại một nơi duy nhất. View composer đặc biệt hữu ích nếu cùng một view được nhiều route hoặc controller trong ứng dụng trả về và luôn cần một phần dữ liệu cụ thể.

Thông thường, view composer được đăng ký trong một [service provider](/docs/{{version}}/providers) của ứng dụng. Trong ví dụ này, chúng ta giả sử `App\Providers\AppServiceProvider` sẽ chứa logic đó. Chúng ta sử dụng phương thức `composer` của facade `View` để đăng ký view composer. Laravel không cung cấp thư mục mặc định cho class-based view composer, vì vậy bạn có thể tổ chức chúng theo cách mình muốn. Ví dụ, bạn có thể tạo thư mục `app/View/Composers` để chứa tất cả view composer của ứng dụng:

```php
<?php

namespace App\Providers;

use App\View\Composers\ProfileComposer;
use Illuminate\Support\Facades;
use Illuminate\Support\ServiceProvider;
use Illuminate\View\View;

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
        // Using class-based composers...
        Facades\View::composer('profile', ProfileComposer::class);

        // Using closure-based composers...
        Facades\View::composer('welcome', function (View $view) {
            // ...
        });

        Facades\View::composer('dashboard', function (View $view) {
            // ...
        });
    }
}
```

Sau khi composer được đăng ký, phương thức `compose` của class `App\View\Composers\ProfileComposer` sẽ được thực thi mỗi khi view `profile` được render. Hãy xem một ví dụ về class composer:

```php
<?php

namespace App\View\Composers;

use App\Repositories\UserRepository;
use Illuminate\View\View;

class ProfileComposer
{
    /**
     * Create a new profile composer.
     */
    public function __construct(
        protected UserRepository $users,
    ) {}

    /**
     * Bind data to the view.
     */
    public function compose(View $view): void
    {
        $view->with('count', $this->users->count());
    }
}
```

Như bạn thấy, tất cả view composer đều được resolve thông qua [service container](/docs/{{version}}/container), vì vậy bạn có thể type-hint bất kỳ dependency nào cần thiết trong constructor của composer.

<a name="attaching-a-composer-to-multiple-views"></a>
#### Gắn composer vào nhiều view

Bạn có thể gắn một view composer vào nhiều view cùng lúc bằng cách truyền một mảng view làm đối số đầu tiên của phương thức `composer`:

```php
use App\Views\Composers\MultiComposer;
use Illuminate\Support\Facades\View;

View::composer(
    ['profile', 'dashboard'],
    MultiComposer::class
);
```

Phương thức `composer` cũng chấp nhận ký tự `*` làm wildcard, cho phép bạn gắn composer vào tất cả view:

```php
use Illuminate\Support\Facades;
use Illuminate\View\View;

Facades\View::composer('*', function (View $view) {
    // ...
});
```

<a name="view-creators"></a>
### View Creator

View "creator" rất giống view composer; tuy nhiên, chúng được thực thi ngay sau khi view được khởi tạo thay vì đợi đến khi view sắp được render. Để đăng ký view creator, hãy sử dụng phương thức `creator`:

```php
use App\View\Creators\ProfileCreator;
use Illuminate\Support\Facades\View;

View::creator('profile', ProfileCreator::class);
```

<a name="optimizing-views"></a>
## Tối ưu view

Theo mặc định, các Blade template view được compile theo nhu cầu. Khi một request render view được thực thi, Laravel sẽ xác định xem phiên bản đã compile của view có tồn tại hay không. Nếu file tồn tại, Laravel tiếp tục xác định xem view chưa compile có được chỉnh sửa gần đây hơn phiên bản đã compile hay không. Nếu view đã compile không tồn tại hoặc view chưa compile đã được chỉnh sửa, Laravel sẽ compile lại view.

Việc compile view trong lúc xử lý request có thể gây ảnh hưởng nhỏ đến hiệu năng, vì vậy Laravel cung cấp lệnh Artisan `view:cache` để compile trước tất cả view được ứng dụng sử dụng. Để tăng hiệu năng, bạn có thể chạy lệnh này như một phần của quy trình deployment:

```shell
php artisan view:cache
```

Bạn có thể sử dụng lệnh `view:clear` để xóa view cache:

```shell
php artisan view:clear
```
