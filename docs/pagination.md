# Cơ sở dữ liệu: Phân trang

<a name="introduction"></a>
## Giới thiệu

Ở các framework khác, việc phân trang có thể khá phức tạp. Laravel hướng tới một cách tiếp cận đơn giản hơn. Paginator của Laravel được tích hợp với [query builder](/docs/{{version}}/queries) và [Eloquent ORM](/docs/{{version}}/eloquent), cung cấp khả năng phân trang bản ghi cơ sở dữ liệu thuận tiện, dễ sử dụng mà không cần cấu hình.

Theo mặc định, HTML do paginator tạo ra tương thích với [Tailwind CSS](https://tailwindcss.com/); tuy nhiên, Laravel cũng hỗ trợ phân trang bằng Bootstrap.

<a name="tailwind"></a>
#### Tailwind

Nếu bạn sử dụng các view phân trang Tailwind mặc định của Laravel với Tailwind 4.x, file `resources/css/app.css` của ứng dụng đã được cấu hình phù hợp để `@source` các view phân trang của Laravel:

```css
@import 'tailwindcss';

@source '../../vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php';
```

<a name="basic-usage"></a>
## Cách sử dụng cơ bản

<a name="paginating-query-builder-results"></a>
### Phân trang kết quả Query Builder

Có nhiều cách để phân trang dữ liệu. Cách đơn giản nhất là sử dụng phương thức `paginate` trên [query builder](/docs/{{version}}/queries) hoặc một [Eloquent query](/docs/{{version}}/eloquent). Phương thức `paginate` tự động thiết lập `limit` và `offset` của query dựa trên trang hiện tại mà người dùng đang xem. Theo mặc định, trang hiện tại được xác định từ giá trị của tham số query string `page` trong HTTP request. Laravel tự động nhận diện giá trị này và cũng tự động chèn nó vào các liên kết do paginator tạo ra.

Trong ví dụ này, đối số duy nhất được truyền cho phương thức `paginate` là số lượng phần tử muốn hiển thị trên mỗi trang. Ở đây, chúng ta chỉ định hiển thị `15` phần tử mỗi trang:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show all application users.
     */
    public function index(): View
    {
        return view('user.index', [
            'users' => DB::table('users')->paginate(15)
        ]);
    }
}
```

<a name="simple-pagination"></a>
#### Phân trang đơn giản

Phương thức `paginate` đếm tổng số bản ghi khớp với query trước khi lấy dữ liệu từ cơ sở dữ liệu. Việc này giúp paginator biết tổng cộng có bao nhiêu trang. Tuy nhiên, nếu UI của ứng dụng không cần hiển thị tổng số trang thì query đếm bản ghi là không cần thiết.

Vì vậy, nếu UI chỉ cần hiển thị các liên kết đơn giản "Tiếp theo" và "Trước", bạn có thể sử dụng phương thức `simplePaginate` để thực hiện một query duy nhất và hiệu quả:

```php
$users = DB::table('users')->simplePaginate(15);
```

<a name="paginating-eloquent-results"></a>
### Phân trang kết quả Eloquent

Bạn cũng có thể phân trang các [Eloquent](/docs/{{version}}/eloquent) query. Trong ví dụ này, chúng ta sẽ phân trang model `App\Models\User` và chỉ định hiển thị 15 bản ghi mỗi trang. Như bạn có thể thấy, cú pháp gần như giống hệt khi phân trang kết quả query builder:

```php
use App\Models\User;

$users = User::paginate(15);
```

Tất nhiên, bạn có thể gọi phương thức `paginate` sau khi thiết lập các ràng buộc khác cho query, chẳng hạn các mệnh đề `where`:

```php
$users = User::where('votes', '>', 100)->paginate(15);
```

Bạn cũng có thể sử dụng phương thức `simplePaginate` khi phân trang các Eloquent model:

```php
$users = User::where('votes', '>', 100)->simplePaginate(15);
```

Tương tự, bạn có thể sử dụng phương thức `cursorPaginate` để phân trang Eloquent model bằng cursor:

```php
$users = User::where('votes', '>', 100)->cursorPaginate(15);
```

<a name="multiple-paginator-instances-per-page"></a>
#### Nhiều instance paginator trên cùng một trang

Đôi khi bạn cần render hai paginator riêng biệt trên cùng một màn hình. Tuy nhiên, nếu cả hai instance đều sử dụng tham số query string `page` để lưu trang hiện tại, chúng sẽ xung đột với nhau. Để giải quyết vấn đề này, bạn có thể truyền tên tham số query string dùng để lưu trang hiện tại của paginator thông qua đối số thứ ba của các phương thức `paginate`, `simplePaginate` và `cursorPaginate`:

```php
use App\Models\User;

$users = User::where('votes', '>', 100)->paginate(
    $perPage = 15, $columns = ['*'], $pageName = 'users'
);
```

<a name="cursor-pagination"></a>
### Phân trang bằng cursor

Trong khi `paginate` và `simplePaginate` tạo query bằng mệnh đề SQL `offset`, phân trang bằng cursor hoạt động bằng cách xây dựng các mệnh đề `where` để so sánh giá trị của những cột được sắp xếp trong query. Cách này mang lại hiệu năng cơ sở dữ liệu tốt nhất trong các phương thức phân trang của Laravel và đặc biệt phù hợp với tập dữ liệu lớn cũng như giao diện cuộn vô hạn.

Khác với phân trang dựa trên offset, vốn đưa số trang vào query string của URL do paginator tạo ra, phân trang dựa trên cursor đặt một chuỗi `cursor` trong query string. Cursor là một chuỗi đã mã hóa chứa vị trí mà query phân trang tiếp theo cần bắt đầu và hướng phân trang:

```text
http://localhost/users?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

Bạn có thể tạo một paginator dựa trên cursor thông qua phương thức `cursorPaginate` của query builder. Phương thức này trả về một instance của `Illuminate\Pagination\CursorPaginator`:

```php
$users = DB::table('users')->orderBy('id')->cursorPaginate(15);
```

Sau khi nhận được một cursor paginator, bạn có thể [hiển thị kết quả phân trang](#displaying-pagination-results) giống như khi sử dụng các phương thức `paginate` và `simplePaginate`. Để biết thêm về các phương thức mà cursor paginator cung cấp, hãy xem [tài liệu các phương thức của cursor paginator](#cursor-paginator-instance-methods).

> [!WARNING]
> Query của bạn phải chứa mệnh đề `order by` để có thể sử dụng phân trang bằng cursor. Ngoài ra, các cột dùng để sắp xếp query phải thuộc bảng đang được phân trang.

<a name="cursor-vs-offset-pagination"></a>
#### Phân trang cursor và offset

Để minh họa sự khác biệt giữa phân trang offset và cursor, hãy xem một số query SQL ví dụ. Cả hai query sau đều hiển thị "trang thứ hai" của kết quả từ bảng `users` được sắp xếp theo `id`:

```sql
# Offset Pagination...
select * from users order by id asc limit 15 offset 15;

# Cursor Pagination...
select * from users where id > 15 order by id asc limit 15;
```

Query phân trang bằng cursor có các ưu điểm sau so với phân trang bằng offset:

- Với tập dữ liệu lớn, phân trang bằng cursor cho hiệu năng tốt hơn nếu các cột trong `order by` được đánh index. Lý do là mệnh đề `offset` phải quét qua toàn bộ dữ liệu đã khớp trước đó.
- Với tập dữ liệu thường xuyên được ghi, phân trang bằng offset có thể bỏ sót bản ghi hoặc hiển thị trùng nếu dữ liệu vừa được thêm hoặc xóa khỏi trang người dùng đang xem.

Tuy nhiên, phân trang bằng cursor có các hạn chế sau:

- Giống `simplePaginate`, phân trang bằng cursor chỉ có thể hiển thị liên kết "Tiếp theo" và "Trước", không hỗ trợ tạo liên kết theo số trang.
- Việc sắp xếp phải dựa trên ít nhất một cột unique hoặc một tổ hợp cột có tính duy nhất. Các cột có giá trị `null` không được hỗ trợ.
- Biểu thức query trong mệnh đề `order by` chỉ được hỗ trợ khi chúng có alias và cũng được thêm vào mệnh đề `select`.
- Không hỗ trợ biểu thức query có tham số.

<a name="manually-creating-a-paginator"></a>
### Tạo paginator thủ công

Đôi khi bạn muốn tự tạo một instance phân trang và truyền vào một mảng phần tử đã có sẵn trong bộ nhớ. Tùy nhu cầu, bạn có thể tạo instance `Illuminate\Pagination\Paginator`, `Illuminate\Pagination\LengthAwarePaginator` hoặc `Illuminate\Pagination\CursorPaginator`.

Các class `Paginator` và `CursorPaginator` không cần biết tổng số phần tử trong tập kết quả; vì vậy, chúng không có phương thức để lấy chỉ số của trang cuối. `LengthAwarePaginator` nhận gần như cùng các đối số với `Paginator`, nhưng yêu cầu tổng số phần tử trong tập kết quả.

Nói cách khác, `Paginator` tương ứng với phương thức `simplePaginate` trên query builder, `CursorPaginator` tương ứng với `cursorPaginate`, còn `LengthAwarePaginator` tương ứng với `paginate`.

> [!WARNING]
> Khi tạo paginator thủ công, bạn cũng nên tự "cắt" mảng kết quả trước khi truyền cho paginator. Nếu chưa rõ cách thực hiện, hãy xem hàm PHP [array_slice](https://secure.php.net/manual/en/function.array-slice.php).

<a name="customizing-pagination-urls"></a>
### Tùy chỉnh URL phân trang

Theo mặc định, các liên kết do paginator tạo ra sẽ khớp với URI của request hiện tại. Tuy nhiên, phương thức `withPath` cho phép bạn tùy chỉnh URI mà paginator sử dụng khi tạo liên kết. Ví dụ, nếu muốn paginator tạo các liên kết dạng `http://example.com/admin/users?page=N`, hãy truyền `/admin/users` cho phương thức `withPath`:

```php
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->withPath('/admin/users');

    // ...
});
```

<a name="appending-query-string-values"></a>
#### Thêm giá trị query string

Bạn có thể thêm giá trị vào query string của các liên kết phân trang bằng phương thức `appends`. Ví dụ, để thêm `sort=votes` vào mỗi liên kết phân trang, hãy gọi `appends` như sau:

```php
use App\Models\User;

Route::get('/users', function () {
    $users = User::paginate(15);

    $users->appends(['sort' => 'votes']);

    // ...
});
```

Bạn có thể sử dụng phương thức `withQueryString` nếu muốn thêm toàn bộ giá trị query string của request hiện tại vào các liên kết phân trang:

```php
$users = User::paginate(15)->withQueryString();
```

<a name="appending-hash-fragments"></a>
#### Thêm hash fragment

Nếu cần thêm một `hash fragment` vào các URL do paginator tạo ra, bạn có thể sử dụng phương thức `fragment`. Ví dụ, để thêm `#users` vào cuối mỗi liên kết phân trang, hãy gọi phương thức `fragment` như sau:

```php
$users = User::paginate(15)->fragment('users');
```

<a name="displaying-pagination-results"></a>
## Hiển thị kết quả phân trang

Khi gọi phương thức `paginate`, bạn sẽ nhận được một instance của `Illuminate\Pagination\LengthAwarePaginator`, trong khi `simplePaginate` trả về một instance của `Illuminate\Pagination\Paginator`. Cuối cùng, `cursorPaginate` trả về một instance của `Illuminate\Pagination\CursorPaginator`.

Các object này cung cấp nhiều phương thức mô tả tập kết quả. Ngoài các phương thức hỗ trợ đó, các instance paginator còn là iterator và có thể được lặp như một mảng. Vì vậy, sau khi lấy kết quả, bạn có thể hiển thị dữ liệu và render các liên kết trang bằng [Blade](/docs/{{version}}/blade):

```blade
<div class="container">
    @foreach ($users as $user)
        {{ $user->name }}
    @endforeach
</div>

{{ $users->links() }}
```

Phương thức `links` sẽ render các liên kết đến những trang còn lại trong tập kết quả. Mỗi liên kết đã chứa biến query string `page` phù hợp. HTML do phương thức `links` tạo ra tương thích với [Tailwind CSS](https://tailwindcss.com).

<a name="adjusting-the-pagination-link-window"></a>
### Điều chỉnh cửa sổ liên kết phân trang

Khi paginator hiển thị các liên kết phân trang, số trang hiện tại được hiển thị cùng các liên kết của ba trang trước và sau trang hiện tại. Với phương thức `onEachSide`, bạn có thể kiểm soát số lượng liên kết bổ sung được hiển thị ở mỗi phía của trang hiện tại trong cửa sổ liên kết trượt ở giữa do paginator tạo ra:

```blade
{{ $users->onEachSide(5)->links() }}
```

<a name="converting-results-to-json"></a>
### Chuyển kết quả sang JSON

Các class paginator của Laravel implement contract `Illuminate\Contracts\Support\Jsonable` và cung cấp phương thức `toJson`, vì vậy việc chuyển kết quả phân trang sang JSON rất đơn giản. Bạn cũng có thể chuyển một paginator instance sang JSON bằng cách trả trực tiếp nó từ route hoặc controller action:

```php
use App\Models\User;

Route::get('/users', function () {
    return User::paginate();
});
```

JSON từ paginator sẽ bao gồm metadata như `total`, `current_page`, `last_page` và nhiều thông tin khác. Các bản ghi kết quả nằm trong key `data` của mảng JSON. Dưới đây là ví dụ JSON được tạo khi trả về một paginator instance từ route:

```json
{
   "total": 50,
   "per_page": 15,
   "current_page": 1,
   "last_page": 4,
   "current_page_url": "http://laravel.app?page=1",
   "first_page_url": "http://laravel.app?page=1",
   "last_page_url": "http://laravel.app?page=4",
   "next_page_url": "http://laravel.app?page=2",
   "prev_page_url": null,
   "path": "http://laravel.app",
   "from": 1,
   "to": 15,
   "data":[
        {
            // Record...
        },
        {
            // Record...
        }
   ]
}
```

<a name="customizing-the-pagination-view"></a>
## Tùy chỉnh view phân trang

Theo mặc định, các view dùng để hiển thị liên kết phân trang tương thích với [Tailwind CSS](https://tailwindcss.com). Tuy nhiên, nếu không sử dụng Tailwind, bạn có thể tự định nghĩa view để render các liên kết này. Khi gọi phương thức `links` trên một paginator instance, bạn có thể truyền tên view làm đối số đầu tiên:

```blade
{{ $paginator->links('view.name') }}

<!-- Passing additional data to the view... -->
{{ $paginator->links('view.name', ['foo' => 'bar']) }}
```

Tuy nhiên, cách đơn giản nhất để tùy chỉnh các view phân trang là export chúng vào thư mục `resources/views/vendor` bằng command `vendor:publish`:

```shell
php artisan vendor:publish --tag=laravel-pagination
```

Command này sẽ đặt các view vào thư mục `resources/views/vendor/pagination` của ứng dụng. File `tailwind.blade.php` trong thư mục này tương ứng với view phân trang mặc định. Bạn có thể chỉnh sửa file này để thay đổi HTML phân trang.

Nếu muốn chỉ định một file khác làm view phân trang mặc định, bạn có thể gọi các phương thức `defaultView` và `defaultSimpleView` của paginator trong phương thức `boot` của class `App\Providers\AppServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::defaultView('view-name');

        Paginator::defaultSimpleView('view-name');
    }
}
```

<a name="using-bootstrap"></a>
### Sử dụng Bootstrap

Laravel cung cấp sẵn các view phân trang được xây dựng bằng [Bootstrap CSS](https://getbootstrap.com/). Để sử dụng các view này thay cho view Tailwind mặc định, bạn có thể gọi phương thức `useBootstrapFour` hoặc `useBootstrapFive` của paginator trong phương thức `boot` của class `App\Providers\AppServiceProvider`:

```php
use Illuminate\Pagination\Paginator;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Paginator::useBootstrapFive();
    Paginator::useBootstrapFour();
}
```

<a name="paginator-instance-methods"></a>
## Các phương thức của Paginator / LengthAwarePaginator

Mỗi paginator instance cung cấp thêm thông tin phân trang thông qua các phương thức sau:

<div class="overflow-auto">

| Method                                  | Description                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `$paginator->count()`                   | Lấy số lượng phần tử của trang hiện tại.                                                                |
| `$paginator->currentPage()`             | Lấy số trang hiện tại.                                                                                 |
| `$paginator->firstItem()`               | Lấy số thứ tự của phần tử đầu tiên trong kết quả.                                                      |
| `$paginator->getOptions()`              | Lấy các tùy chọn của paginator.                                                                                   |
| `$paginator->getUrlRange($start, $end)` | Tạo một dải URL phân trang.                                                                           |
| `$paginator->hasPages()`                | Xác định có đủ phần tử để chia thành nhiều trang hay không.                                            |
| `$paginator->hasMorePages()`            | Xác định còn phần tử nào khác trong data store hay không.                                                         |
| `$paginator->items()`                   | Lấy các phần tử của trang hiện tại.                                                                          |
| `$paginator->lastItem()`                | Lấy số thứ tự của phần tử cuối cùng trong kết quả.                                                       |
| `$paginator->lastPage()`                | Lấy số của trang cuối cùng hiện có. (Không khả dụng khi dùng `simplePaginate`).                 |
| `$paginator->nextPageUrl()`             | Lấy URL của trang tiếp theo.                                                                               |
| `$paginator->onFirstPage()`             | Xác định paginator có đang ở trang đầu tiên hay không.                                                             |
| `$paginator->onLastPage()`              | Xác định paginator có đang ở trang cuối cùng hay không.                                                              |
| `$paginator->perPage()`                 | Số lượng phần tử được hiển thị trên mỗi trang.                                                                    |
| `$paginator->previousPageUrl()`         | Lấy URL của trang trước.                                                                           |
| `$paginator->total()`                   | Xác định tổng số phần tử khớp trong data store. (Không khả dụng khi dùng `simplePaginate`). |
| `$paginator->url($page)`                | Lấy URL cho một số trang cụ thể.                                                                         |
| `$paginator->getPageName()`             | Lấy biến query string dùng để lưu trang.                                                        |
| `$paginator->setPageName($name)`        | Thiết lập biến query string dùng để lưu trang.                                                        |
| `$paginator->through($callback)`        | Biến đổi từng phần tử bằng callback.                                                                        |

</div>

<a name="cursor-paginator-instance-methods"></a>
## Các phương thức của Cursor Paginator

Mỗi cursor paginator instance cung cấp thêm thông tin phân trang thông qua các phương thức sau:

<div class="overflow-auto">

| Method                          | Description                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `$paginator->count()`           | Lấy số lượng phần tử của trang hiện tại.                     |
| `$paginator->cursor()`          | Lấy cursor instance hiện tại.                                  |
| `$paginator->getOptions()`      | Lấy các tùy chọn của paginator.                                        |
| `$paginator->hasPages()`        | Xác định có đủ phần tử để chia thành nhiều trang hay không. |
| `$paginator->hasMorePages()`    | Xác định còn phần tử nào khác trong data store hay không.              |
| `$paginator->getCursorName()`   | Lấy biến query string dùng để lưu cursor.           |
| `$paginator->items()`           | Lấy các phần tử của trang hiện tại.                               |
| `$paginator->nextCursor()`      | Lấy cursor instance cho tập phần tử tiếp theo.                |
| `$paginator->nextPageUrl()`     | Lấy URL của trang tiếp theo.                                    |
| `$paginator->onFirstPage()`     | Xác định paginator có đang ở trang đầu tiên hay không.                  |
| `$paginator->onLastPage()`      | Xác định paginator có đang ở trang cuối cùng hay không.                   |
| `$paginator->perPage()`         | Số lượng phần tử được hiển thị trên mỗi trang.                         |
| `$paginator->previousCursor()`  | Lấy cursor instance cho tập phần tử trước đó.            |
| `$paginator->previousPageUrl()` | Lấy URL của trang trước.                                |
| `$paginator->setCursorName()`   | Thiết lập biến query string dùng để lưu cursor.           |
| `$paginator->url($cursor)`      | Lấy URL cho một cursor instance cụ thể.                          |

</div>
