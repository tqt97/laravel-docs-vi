# Cơ sở dữ liệu: Query Builder

- [Giới thiệu](#introduction)
- [Thực thi truy vấn cơ sở dữ liệu](#running-database-queries)
    - [Chia kết quả thành từng khối](#chunking-results)
    - [Duyệt kết quả theo kiểu lazy](#streaming-results-lazily)
    - [Các hàm tổng hợp](#aggregates)
- [Câu lệnh Select](#select-statements)
- [Biểu thức Raw](#raw-expressions)
- [Join](#joins)
- [Union](#unions)
- [Các mệnh đề Where cơ bản](#basic-where-clauses)
    - [Where Clauses](#where-clauses)
    - [Or Where Clauses](#or-where-clauses)
    - [Where Not Clauses](#where-not-clauses)
    - [Where Any / All / None Clauses](#where-any-all-none-clauses)
    - [JSON Where Clauses](#json-where-clauses)
    - [Additional Where Clauses](#additional-where-clauses)
    - [Logical Grouping](#logical-grouping)
- [Các mệnh đề Where nâng cao](#advanced-where-clauses)
    - [Where Exists Clauses](#where-exists-clauses)
    - [Subquery Where Clauses](#subquery-where-clauses)
    - [Full Text Where Clauses](#full-text-where-clauses)
    - [Vector Similarity Clauses](#vector-similarity-clauses)
- [Sắp xếp, nhóm, giới hạn và offset](#ordering-grouping-limit-and-offset)
    - [Ordering](#ordering)
    - [Grouping](#grouping)
    - [Limit and Offset](#limit-and-offset)
- [Mệnh đề có điều kiện](#conditional-clauses)
- [Câu lệnh Insert](#insert-statements)
    - [Upserts](#upserts)
- [Câu lệnh Update](#update-statements)
    - [Updating JSON Columns](#updating-json-columns)
    - [Increment and Decrement](#increment-and-decrement)
- [Câu lệnh Delete](#delete-statements)
- [Pessimistic Locking](#pessimistic-locking)
- [Thành phần truy vấn có thể tái sử dụng](#reusable-query-components)
- [Debug](#debugging)

<a name="introduction"></a>
## Giới thiệu

Query Builder của Laravel cung cấp một giao diện fluent thuận tiện để xây dựng và thực thi các truy vấn cơ sở dữ liệu. Bạn có thể sử dụng nó cho hầu hết các thao tác cơ sở dữ liệu trong ứng dụng và nó hoạt động tốt với tất cả hệ quản trị cơ sở dữ liệu mà Laravel hỗ trợ.

Query Builder của Laravel sử dụng cơ chế parameter binding của PDO để bảo vệ ứng dụng trước các cuộc tấn công SQL injection. Bạn không cần tự làm sạch hoặc sanitize các chuỗi được truyền vào Query Builder dưới dạng query binding.

> [!WARNING]
> PDO không hỗ trợ binding tên cột. Vì vậy, bạn tuyệt đối không nên cho phép input của người dùng quyết định tên cột được tham chiếu trong truy vấn, bao gồm cả các cột dùng trong `order by`.

<a name="running-database-queries"></a>
## Thực thi truy vấn cơ sở dữ liệu

<a name="retrieving-all-rows-from-a-table"></a>
#### Lấy tất cả các dòng từ một bảng

Bạn có thể bắt đầu một truy vấn bằng method `table` do facade `DB` cung cấp. Method `table` trả về một Query Builder instance dạng fluent cho bảng đã cho, cho phép bạn nối thêm các điều kiện vào truy vấn rồi cuối cùng lấy kết quả bằng method `get`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Show a list of all of the application's users.
     */
    public function index(): View
    {
        $users = DB::table('users')->get();

        return view('user.index', ['users' => $users]);
    }
}
```

Method `get` trả về một instance `Illuminate\Support\Collection` chứa kết quả truy vấn, trong đó mỗi kết quả là một object `stdClass` của PHP. Bạn có thể truy cập giá trị của từng cột thông qua property tương ứng trên object:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->get();

foreach ($users as $user) {
    echo $user->name;
}
```

> [!NOTE]
> Laravel Collection cung cấp nhiều method mạnh mẽ để biến đổi và tổng hợp dữ liệu. Để biết thêm thông tin, hãy xem [tài liệu Collection](/docs/{{version}}/collections).

<a name="retrieving-a-single-row-column-from-a-table"></a>
#### Lấy một dòng / cột từ bảng

Nếu chỉ cần lấy một dòng từ bảng, bạn có thể sử dụng method `first` của facade `DB`. Method này trả về một object `stdClass`:

```php
$user = DB::table('users')->where('name', 'John')->first();

return $user->email;
```

Nếu muốn lấy một dòng nhưng ném `Illuminate\Database\RecordNotFoundException` khi không tìm thấy dòng phù hợp, bạn có thể sử dụng `firstOrFail`. Nếu `RecordNotFoundException` không được bắt, Laravel sẽ tự động trả về HTTP response 404 cho client:

```php
$user = DB::table('users')->where('name', 'John')->firstOrFail();
```

Nếu không cần toàn bộ dòng, bạn có thể lấy trực tiếp một giá trị bằng method `value`. Method này trả về trực tiếp giá trị của cột:

```php
$email = DB::table('users')->where('name', 'John')->value('email');
```

Để lấy một dòng theo giá trị của cột `id`, hãy sử dụng method `find`:

```php
$user = DB::table('users')->find(3);
```

<a name="retrieving-a-list-of-column-values"></a>
#### Lấy danh sách giá trị của một cột

Nếu muốn lấy một instance `Illuminate\Support\Collection` chỉ chứa giá trị của một cột, bạn có thể sử dụng method `pluck`. Trong ví dụ sau, chúng ta lấy một collection chứa chức danh của người dùng:

```php
use Illuminate\Support\Facades\DB;

$titles = DB::table('users')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

Bạn có thể chỉ định cột được dùng làm key của collection kết quả bằng cách truyền đối số thứ hai cho method `pluck`:

```php
$titles = DB::table('users')->pluck('title', 'name');

foreach ($titles as $name => $title) {
    echo $title;
}
```

<a name="chunking-results"></a>
### Chia kết quả thành từng khối

Nếu cần xử lý hàng nghìn record, hãy cân nhắc sử dụng method `chunk` do facade `DB` cung cấp. Method này mỗi lần chỉ lấy một khối kết quả nhỏ rồi truyền khối đó vào closure để xử lý. Ví dụ, chúng ta có thể đọc toàn bộ bảng `users` theo từng khối 100 record:

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    foreach ($users as $user) {
        // ...
    }
});
```

Bạn có thể dừng việc xử lý các khối tiếp theo bằng cách trả về `false` từ closure:

```php
DB::table('users')->orderBy('id')->chunk(100, function (Collection $users) {
    // Process the records...

    return false;
});
```

Nếu cập nhật record trong lúc đang chia kết quả thành từng khối, tập kết quả của các khối có thể thay đổi theo cách không mong muốn. Nếu dự định cập nhật các record đã lấy trong quá trình xử lý, tốt nhất bạn nên sử dụng `chunkById`. Method này tự động phân trang kết quả dựa trên primary key của record:

```php
DB::table('users')->where('active', false)
    ->chunkById(100, function (Collection $users) {
        foreach ($users as $user) {
            DB::table('users')
                ->where('id', $user->id)
                ->update(['active' => true]);
        }
    });
```

Vì `chunkById` và `lazyById` tự thêm các điều kiện `where` vào truy vấn đang thực thi, thông thường bạn nên [nhóm logic](#logical-grouping) các điều kiện của mình bên trong một closure:

```php
DB::table('users')->where(function ($query) {
    $query->where('credits', 1)->orWhere('credits', 2);
})->chunkById(100, function (Collection $users) {
    foreach ($users as $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['credits' => 3]);
    }
});
```

> [!WARNING]
> Khi cập nhật hoặc xóa record bên trong callback của `chunk`, mọi thay đổi đối với primary key hoặc foreign key đều có thể ảnh hưởng đến truy vấn chia khối. Điều này có thể khiến một số record không xuất hiện trong kết quả được chia khối.

<a name="streaming-results-lazily"></a>
### Duyệt kết quả theo kiểu lazy

Method `lazy` hoạt động tương tự [method `chunk`](#chunking-results) ở chỗ truy vấn được thực thi theo từng khối. Tuy nhiên, thay vì truyền từng khối vào callback, `lazy()` trả về một [LazyCollection](/docs/{{version}}/collections#lazy-collections), cho phép bạn làm việc với kết quả như một stream duy nhất:

```php
use Illuminate\Support\Facades\DB;

DB::table('users')->orderBy('id')->lazy()->each(function (object $user) {
    // ...
});
```

Tương tự, nếu dự định cập nhật các record trong lúc đang duyệt chúng, tốt nhất bạn nên sử dụng `lazyById` hoặc `lazyByIdDesc`. Các method này tự động phân trang kết quả dựa trên primary key của record:

```php
DB::table('users')->where('active', false)
    ->lazyById()->each(function (object $user) {
        DB::table('users')
            ->where('id', $user->id)
            ->update(['active' => true]);
    });
```

> [!WARNING]
> Khi cập nhật hoặc xóa record trong lúc duyệt kết quả, mọi thay đổi đối với primary key hoặc foreign key đều có thể ảnh hưởng đến truy vấn chia khối. Điều này có thể khiến một số record không xuất hiện trong kết quả.

<a name="aggregates"></a>
### Các hàm tổng hợp

Query Builder cũng cung cấp nhiều method để lấy các giá trị tổng hợp như `count`, `max`, `min`, `avg` và `sum`. Bạn có thể gọi các method này sau khi xây dựng truy vấn:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->count();

$price = DB::table('orders')->max('price');
```

Bạn cũng có thể kết hợp các method này với những mệnh đề khác để kiểm soát chính xác cách tính giá trị tổng hợp:

```php
$price = DB::table('orders')
    ->where('finalized', 1)
    ->avg('price');
```

<a name="determining-if-records-exist"></a>
#### Kiểm tra record có tồn tại hay không

Thay vì dùng `count` để kiểm tra có record nào thỏa điều kiện truy vấn hay không, bạn có thể sử dụng `exists` và `doesntExist`:

```php
if (DB::table('orders')->where('finalized', 1)->exists()) {
    // ...
}

if (DB::table('orders')->where('finalized', 1)->doesntExist()) {
    // ...
}
```

<a name="select-statements"></a>
## Câu lệnh Select

<a name="specifying-a-select-clause"></a>
#### Chỉ định mệnh đề Select

Không phải lúc nào bạn cũng muốn lấy tất cả cột của một bảng. Với method `select`, bạn có thể chỉ định mệnh đề `select` tùy chỉnh cho truy vấn:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->select('name', 'email as user_email')
    ->get();
```

Method `distinct` cho phép buộc truy vấn chỉ trả về các kết quả khác nhau:

```php
$users = DB::table('users')->distinct()->get();
```

Nếu đã có một Query Builder instance và muốn bổ sung cột vào mệnh đề select hiện tại, bạn có thể sử dụng `addSelect`:

```php
$query = DB::table('users')->select('name');

$users = $query->addSelect('age')->get();
```

<a name="raw-expressions"></a>
## Biểu thức Raw

Đôi khi bạn cần chèn trực tiếp một chuỗi tùy ý vào truy vấn. Để tạo một biểu thức raw, bạn có thể sử dụng method `raw` do facade `DB` cung cấp:

```php
$users = DB::table('users')
    ->select(DB::raw('count(*) as user_count, status'))
    ->where('status', '<>', 1)
    ->groupBy('status')
    ->get();
```

> [!WARNING]
> Các raw statement được chèn trực tiếp vào truy vấn dưới dạng chuỗi, vì vậy bạn phải đặc biệt cẩn thận để tránh tạo ra lỗ hổng SQL injection.

<a name="raw-methods"></a>
### Các method Raw

Thay vì sử dụng `DB::raw`, bạn cũng có thể dùng các method sau để chèn biểu thức raw vào nhiều phần khác nhau của truy vấn. **Hãy nhớ rằng Laravel không thể bảo đảm các truy vấn sử dụng raw expression được bảo vệ khỏi lỗ hổng SQL injection.**

<a name="selectraw"></a>
#### `selectRaw`

Có thể sử dụng `selectRaw` thay cho `addSelect(DB::raw(/* ... */))`. Method này nhận một mảng binding tùy chọn làm đối số thứ hai:

```php
$orders = DB::table('orders')
    ->selectRaw('price * ? as price_with_tax', [1.0825])
    ->get();
```

<a name="whereraw-orwhereraw"></a>
#### `whereRaw / orWhereRaw`

Các method `whereRaw` và `orWhereRaw` cho phép chèn một mệnh đề `where` raw vào truy vấn. Chúng nhận một mảng binding tùy chọn làm đối số thứ hai:

```php
$orders = DB::table('orders')
    ->whereRaw('price > IF(state = "TX", ?, 100)', [200])
    ->get();
```

<a name="havingraw-orhavingraw"></a>
#### `havingRaw / orHavingRaw`

Các method `havingRaw` và `orHavingRaw` cho phép cung cấp một chuỗi raw làm giá trị của mệnh đề `having`. Chúng nhận một mảng binding tùy chọn làm đối số thứ hai:

```php
$orders = DB::table('orders')
    ->select('department', DB::raw('SUM(price) as total_sales'))
    ->groupBy('department')
    ->havingRaw('SUM(price) > ?', [2500])
    ->get();
```

<a name="orderbyraw"></a>
#### `orderByRaw`

Method `orderByRaw` cho phép cung cấp một chuỗi raw làm giá trị của mệnh đề `order by`:

```php
$orders = DB::table('orders')
    ->orderByRaw('updated_at - created_at DESC')
    ->get();
```

<a name="groupbyraw"></a>
#### `groupByRaw`

Method `groupByRaw` có thể được dùng để cung cấp một chuỗi raw làm giá trị cho mệnh đề `group by`:

```php
$orders = DB::table('orders')
    ->select('city', 'state')
    ->groupByRaw('city, state')
    ->get();
```

<a name="joins"></a>
## Joins

<a name="inner-join-clause"></a>
#### Mệnh đề Inner Join

Query Builder cũng có thể được dùng để thêm các mệnh đề join vào truy vấn. Để thực hiện một "inner join" cơ bản, bạn có thể sử dụng method `join` trên một Query Builder instance. Đối số đầu tiên truyền vào `join` là tên bảng cần join, còn các đối số còn lại xác định các ràng buộc cột cho phép join. Bạn thậm chí có thể join nhiều bảng trong cùng một truy vấn:

```php
use Illuminate\Support\Facades\DB;

$users = DB::table('users')
    ->join('contacts', 'users.id', '=', 'contacts.user_id')
    ->join('orders', 'users.id', '=', 'orders.user_id')
    ->select('users.*', 'contacts.phone', 'orders.price')
    ->get();
```

<a name="left-join-right-join-clause"></a>
#### Mệnh đề Left Join / Right Join

Nếu muốn thực hiện "left join" hoặc "right join" thay vì "inner join", hãy sử dụng các method `leftJoin` hoặc `rightJoin`. Các method này có cùng signature với method `join`:

```php
$users = DB::table('users')
    ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();

$users = DB::table('users')
    ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();
```

<a name="cross-join-clause"></a>
#### Mệnh đề Cross Join

Bạn có thể sử dụng method `crossJoin` để thực hiện "cross join". Cross join tạo tích Descartes (cartesian product) giữa bảng đầu tiên và bảng được join:

```php
$sizes = DB::table('sizes')
    ->crossJoin('colors')
    ->get();
```

<a name="advanced-join-clauses"></a>
#### Các mệnh đề Join nâng cao

Bạn cũng có thể chỉ định các mệnh đề join nâng cao hơn. Để bắt đầu, hãy truyền một closure làm đối số thứ hai cho method `join`. Closure sẽ nhận một instance `Illuminate\Database\Query\JoinClause`, cho phép bạn chỉ định các ràng buộc cho mệnh đề "join":

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')->orOn(/* ... */);
    })
    ->get();
```

Nếu muốn sử dụng mệnh đề "where" trên các join, bạn có thể dùng các method `where` và `orWhere` do instance `JoinClause` cung cấp. Thay vì so sánh hai cột, các method này sẽ so sánh cột với một giá trị:

```php
DB::table('users')
    ->join('contacts', function (JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')
            ->where('contacts.user_id', '>', 5);
    })
    ->get();
```

<a name="subquery-joins"></a>
#### Join với Subquery

Bạn có thể sử dụng các method `joinSub`, `leftJoinSub` và `rightJoinSub` để join một truy vấn với subquery. Mỗi method nhận ba đối số: subquery, alias của bảng và một closure xác định các cột liên quan. Trong ví dụ này, chúng ta sẽ lấy một collection người dùng, trong đó mỗi record người dùng cũng chứa timestamp `created_at` của bài blog được xuất bản gần đây nhất của người dùng đó:

```php
$latestPosts = DB::table('posts')
    ->select('user_id', DB::raw('MAX(created_at) as last_post_created_at'))
    ->where('is_published', true)
    ->groupBy('user_id');

$users = DB::table('users')
    ->joinSub($latestPosts, 'latest_posts', function (JoinClause $join) {
        $join->on('users.id', '=', 'latest_posts.user_id');
    })->get();
```

<a name="lateral-joins"></a>
#### Lateral Join

> [!WARNING]
> Lateral join hiện được hỗ trợ bởi PostgreSQL, MySQL >= 8.0.14 và SQL Server.

Bạn có thể sử dụng các method `joinLateral` và `leftJoinLateral` để thực hiện "lateral join" với một subquery. Mỗi method nhận hai đối số: subquery và alias của bảng. Các điều kiện join cần được chỉ định trong mệnh đề `where` của subquery đã cho. Lateral join được đánh giá cho từng dòng và có thể tham chiếu đến các cột bên ngoài subquery.

Trong ví dụ này, chúng ta sẽ lấy một collection người dùng cùng ba bài blog gần đây nhất của từng người dùng. Mỗi người dùng có thể tạo tối đa ba dòng trong tập kết quả, tương ứng với từng bài blog gần đây nhất của họ. Điều kiện join được chỉ định bằng mệnh đề `whereColumn` bên trong subquery, tham chiếu đến dòng người dùng hiện tại:

```php
$latestPosts = DB::table('posts')
    ->select('id as post_id', 'title as post_title', 'created_at as post_created_at')
    ->whereColumn('user_id', 'users.id')
    ->orderBy('created_at', 'desc')
    ->limit(3);

$users = DB::table('users')
    ->joinLateral($latestPosts, 'latest_posts')
    ->get();
```

<a name="unions"></a>
## Unions

Query Builder cũng cung cấp method thuận tiện để "union" hai hoặc nhiều truy vấn với nhau. Ví dụ, bạn có thể tạo một truy vấn ban đầu rồi sử dụng method `union` để kết hợp nó với các truy vấn khác:

```php
use Illuminate\Support\Facades\DB;

$usersWithoutFirstName = DB::table('users')
    ->whereNull('first_name');

$users = DB::table('users')
    ->whereNull('last_name')
    ->union($usersWithoutFirstName)
    ->get();
```

Ngoài method `union`, Query Builder còn cung cấp method `unionAll`. Các truy vấn được kết hợp bằng `unionAll` sẽ không loại bỏ các kết quả trùng lặp. Method `unionAll` có cùng signature với method `union`.

<a name="basic-where-clauses"></a>
## Các mệnh đề Where cơ bản

<a name="where-clauses"></a>
### Mệnh đề Where

Bạn có thể sử dụng method `where` của Query Builder để thêm các mệnh đề "where" vào truy vấn. Cách gọi `where` cơ bản nhất cần ba đối số. Đối số đầu tiên là tên cột. Đối số thứ hai là toán tử, có thể là bất kỳ toán tử nào được cơ sở dữ liệu hỗ trợ. Đối số thứ ba là giá trị dùng để so sánh với giá trị của cột.

Ví dụ, truy vấn sau lấy những người dùng có giá trị cột `votes` bằng `100` và giá trị cột `age` lớn hơn `35`:

```php
$users = DB::table('users')
    ->where('votes', '=', 100)
    ->where('age', '>', 35)
    ->get();
```

Để thuận tiện, nếu muốn kiểm tra một cột `=` với giá trị cho trước, bạn có thể truyền giá trị đó làm đối số thứ hai của method `where`. Laravel sẽ tự hiểu rằng bạn muốn sử dụng toán tử `=`:

```php
$users = DB::table('users')->where('votes', 100)->get();
```

Bạn cũng có thể truyền một associative array vào method `where` để nhanh chóng truy vấn theo nhiều cột:

```php
$users = DB::table('users')->where([
    'first_name' => 'Jane',
    'last_name' => 'Doe',
])->get();
```

Như đã đề cập, bạn có thể sử dụng bất kỳ toán tử nào được hệ quản trị cơ sở dữ liệu của mình hỗ trợ:

```php
$users = DB::table('users')
    ->where('votes', '>=', 100)
    ->get();

$users = DB::table('users')
    ->where('votes', '<>', 100)
    ->get();

$users = DB::table('users')
    ->where('name', 'like', 'T%')
    ->get();
```

Bạn cũng có thể truyền một mảng điều kiện vào method `where`. Mỗi phần tử của mảng phải là một mảng chứa ba đối số thường được truyền vào method `where`:

```php
$users = DB::table('users')->where([
    ['status', '=', '1'],
    ['subscribed', '<>', '1'],
])->get();
```

> [!WARNING]
> PDO không hỗ trợ binding tên cột. Vì vậy, bạn tuyệt đối không nên cho phép input của người dùng quyết định tên cột được tham chiếu trong truy vấn, bao gồm cả các cột dùng trong `order by`.

> [!WARNING]
> MySQL và MariaDB tự động ép kiểu chuỗi thành số nguyên khi so sánh chuỗi với số. Trong quá trình này, chuỗi không phải số sẽ được chuyển thành `0`, có thể dẫn đến kết quả ngoài mong đợi. Ví dụ, nếu bảng có cột `secret` mang giá trị `aaa` và bạn chạy `User::where('secret', 0)`, dòng đó sẽ được trả về. Để tránh tình huống này, hãy đảm bảo mọi giá trị được ép về kiểu dữ liệu phù hợp trước khi sử dụng trong truy vấn.

<a name="or-where-clauses"></a>
### Mệnh đề Or Where

Khi nối tiếp nhiều lần gọi method `where` của Query Builder, các mệnh đề "where" sẽ được kết hợp bằng toán tử `and`. Tuy nhiên, bạn có thể sử dụng method `orWhere` để nối một mệnh đề vào truy vấn bằng toán tử `or`. Method `orWhere` nhận cùng các đối số như method `where`:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere('name', 'John')
    ->get();
```

Nếu cần nhóm một điều kiện "or" trong dấu ngoặc đơn, bạn có thể truyền một closure làm đối số đầu tiên cho method `orWhere`:

```php
use Illuminate\Database\Query\Builder;

$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhere(function (Builder $query) {
        $query->where('name', 'Abigail')
            ->where('votes', '>', 50);
        })
    ->get();
```

Ví dụ trên sẽ tạo ra câu SQL sau:

```sql
select * from users where votes > 100 or (name = 'Abigail' and votes > 50)
```

> [!WARNING]
> Bạn nên luôn nhóm các lần gọi `orWhere` để tránh hành vi ngoài mong đợi khi global scope được áp dụng.

<a name="where-not-clauses"></a>
### Mệnh đề Where Not

Các method `whereNot` và `orWhereNot` có thể được dùng để phủ định một nhóm ràng buộc truy vấn. Ví dụ, truy vấn sau loại trừ các sản phẩm đang thanh lý hoặc có giá nhỏ hơn mười:

```php
$products = DB::table('products')
    ->whereNot(function (Builder $query) {
        $query->where('clearance', true)
            ->orWhere('price', '<', 10);
        })
    ->get();
```

<a name="where-any-all-none-clauses"></a>
### Mệnh đề Where Any / All / None

Đôi khi bạn cần áp dụng cùng một ràng buộc truy vấn cho nhiều cột. Ví dụ, bạn có thể muốn lấy tất cả record mà bất kỳ cột nào trong danh sách cho trước đều `LIKE` một giá trị nhất định. Bạn có thể thực hiện điều này bằng method `whereAny`:

```php
$users = DB::table('users')
    ->where('active', true)
    ->whereAny([
        'name',
        'email',
        'phone',
    ], 'like', 'Example%')
    ->get();
```

Truy vấn trên sẽ tạo ra câu SQL sau:

```sql
SELECT *
FROM users
WHERE active = true AND (
    name LIKE 'Example%' OR
    email LIKE 'Example%' OR
    phone LIKE 'Example%'
)
```

Tương tự, method `whereAll` có thể được dùng để lấy các record mà tất cả cột đã cho đều khớp với một ràng buộc nhất định:

```php
$posts = DB::table('posts')
    ->where('published', true)
    ->whereAll([
        'title',
        'content',
    ], 'like', '%Laravel%')
    ->get();
```

Truy vấn trên sẽ tạo ra câu SQL sau:

```sql
SELECT *
FROM posts
WHERE published = true AND (
    title LIKE '%Laravel%' AND
    content LIKE '%Laravel%'
)
```

Method `whereNone` có thể được dùng để lấy các record mà không có cột nào trong số các cột đã cho khớp với ràng buộc nhất định:

```php
$albums = DB::table('albums')
    ->where('published', true)
    ->whereNone([
        'title',
        'lyrics',
        'tags',
    ], 'like', '%explicit%')
    ->get();
```

Truy vấn trên sẽ tạo ra câu SQL sau:

```sql
SELECT *
FROM albums
WHERE published = true AND NOT (
    title LIKE '%explicit%' OR
    lyrics LIKE '%explicit%' OR
    tags LIKE '%explicit%'
)
```

<a name="json-where-clauses"></a>
### Mệnh đề Where cho JSON

Laravel cũng hỗ trợ truy vấn kiểu cột JSON trên các cơ sở dữ liệu có hỗ trợ kiểu dữ liệu này. Hiện tại bao gồm MariaDB 10.3+, MySQL 8.0+, PostgreSQL 12.0+, SQL Server 2017+ và SQLite 3.39.0+. Để truy vấn một cột JSON, hãy sử dụng toán tử `->`:

```php
$users = DB::table('users')
    ->where('preferences->dining->meal', 'salad')
    ->get();

$users = DB::table('users')
    ->whereIn('preferences->dining->meal', ['pasta', 'salad', 'sandwiches'])
    ->get();
```

Bạn có thể sử dụng các method `whereJsonContains` và `whereJsonDoesntContain` để truy vấn JSON array:

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', 'en')
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContain('options->languages', 'en')
    ->get();
```

Nếu ứng dụng sử dụng MariaDB, MySQL hoặc PostgreSQL, bạn có thể truyền một mảng giá trị vào các method `whereJsonContains` và `whereJsonDoesntContain`:

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', ['en', 'de'])
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContain('options->languages', ['en', 'de'])
    ->get();
```

Ngoài ra, bạn có thể sử dụng các method `whereJsonContainsKey` hoặc `whereJsonDoesntContainKey` để lấy kết quả có hoặc không có một JSON key:

```php
$users = DB::table('users')
    ->whereJsonContainsKey('preferences->dietary_requirements')
    ->get();

$users = DB::table('users')
    ->whereJsonDoesntContainKey('preferences->dietary_requirements')
    ->get();
```

Cuối cùng, bạn có thể sử dụng method `whereJsonLength` để truy vấn JSON array dựa trên độ dài của chúng:

```php
$users = DB::table('users')
    ->whereJsonLength('options->languages', 0)
    ->get();

$users = DB::table('users')
    ->whereJsonLength('options->languages', '>', 1)
    ->get();
```

<a name="additional-where-clauses"></a>
### Các mệnh đề Where bổ sung

**whereLike / orWhereLike / whereNotLike / orWhereNotLike**

Method `whereLike` cho phép bạn thêm các mệnh đề "LIKE" vào truy vấn để đối sánh theo mẫu. Các method này cung cấp cách thực hiện truy vấn đối sánh chuỗi không phụ thuộc vào hệ quản trị cơ sở dữ liệu, đồng thời cho phép bật hoặc tắt phân biệt chữ hoa chữ thường. Theo mặc định, việc đối sánh chuỗi không phân biệt chữ hoa chữ thường:

```php
$users = DB::table('users')
    ->whereLike('name', '%John%')
    ->get();
```

Bạn có thể bật tìm kiếm phân biệt chữ hoa chữ thường thông qua đối số `caseSensitive`:

```php
$users = DB::table('users')
    ->whereLike('name', '%John%', caseSensitive: true)
    ->get();
```

Method `orWhereLike` cho phép bạn thêm một mệnh đề "or" với điều kiện LIKE:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereLike('name', '%John%')
    ->get();
```

Method `whereNotLike` cho phép bạn thêm các mệnh đề "NOT LIKE" vào truy vấn:

```php
$users = DB::table('users')
    ->whereNotLike('name', '%John%')
    ->get();
```

Tương tự, bạn có thể sử dụng `orWhereNotLike` để thêm một mệnh đề "or" với điều kiện NOT LIKE:

```php
$users = DB::table('users')
    ->where('votes', '>', 100)
    ->orWhereNotLike('name', '%John%')
    ->get();
```

> [!WARNING]
> Tùy chọn tìm kiếm phân biệt chữ hoa chữ thường của `whereLike` hiện chưa được hỗ trợ trên SQL Server.

**whereIn / whereNotIn / orWhereIn / orWhereNotIn**

Method `whereIn` kiểm tra giá trị của một cột có nằm trong array được cung cấp hay không:

```php
$users = DB::table('users')
    ->whereIn('id', [1, 2, 3])
    ->get();
```

Method `whereNotIn` kiểm tra giá trị của cột được cung cấp không nằm trong array đã cho:

```php
$users = DB::table('users')
    ->whereNotIn('id', [1, 2, 3])
    ->get();
```

Bạn cũng có thể truyền một query object làm đối số thứ hai của method `whereIn`:

```php
$activeUsers = DB::table('users')->select('id')->where('is_active', 1);

$comments = DB::table('comments')
    ->whereIn('user_id', $activeUsers)
    ->get();
```

Ví dụ trên sẽ tạo ra câu SQL sau:

```sql
select * from comments where user_id in (
    select id
    from users
    where is_active = 1
)
```

> [!WARNING]
> Nếu bạn thêm một array lớn gồm các integer binding vào truy vấn, có thể sử dụng `whereIntegerInRaw` hoặc `whereIntegerNotInRaw` để giảm đáng kể lượng bộ nhớ sử dụng.

**whereBetween / orWhereBetween**

Method `whereBetween` kiểm tra giá trị của một cột có nằm giữa hai giá trị hay không:

```php
$users = DB::table('users')
    ->whereBetween('votes', [1, 100])
    ->get();
```

**whereNotBetween / orWhereNotBetween**

Method `whereNotBetween` kiểm tra giá trị của một cột có nằm ngoài khoảng giữa hai giá trị hay không:

```php
$users = DB::table('users')
    ->whereNotBetween('votes', [1, 100])
    ->get();
```

**whereBetweenColumns / whereNotBetweenColumns / orWhereBetweenColumns / orWhereNotBetweenColumns**

Method `whereBetweenColumns` kiểm tra giá trị của một cột có nằm giữa hai giá trị của hai cột khác trong cùng một hàng của bảng hay không:

```php
$patients = DB::table('patients')
    ->whereBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

Method `whereNotBetweenColumns` kiểm tra giá trị của một cột có nằm ngoài khoảng được xác định bởi giá trị của hai cột khác trong cùng một hàng hay không:

```php
$patients = DB::table('patients')
    ->whereNotBetweenColumns('weight', ['minimum_allowed_weight', 'maximum_allowed_weight'])
    ->get();
```

**whereValueBetween / whereValueNotBetween / orWhereValueBetween / orWhereValueNotBetween**

Method `whereValueBetween` kiểm tra một giá trị được cung cấp có nằm giữa giá trị của hai cột cùng kiểu trong cùng một hàng của bảng hay không:

```php
$products = DB::table('products')
    ->whereValueBetween(100, ['min_price', 'max_price'])
    ->get();
```

Method `whereValueNotBetween` kiểm tra một giá trị có nằm ngoài khoảng được xác định bởi giá trị của hai cột trong cùng một hàng hay không:

```php
$products = DB::table('products')
    ->whereValueNotBetween(100, ['min_price', 'max_price'])
    ->get();
```

**whereNull / whereNotNull / orWhereNull / orWhereNotNull**

Method `whereNull` kiểm tra giá trị của cột được cung cấp có phải là `NULL` hay không:

```php
$users = DB::table('users')
    ->whereNull('updated_at')
    ->get();
```

Method `whereNotNull` kiểm tra giá trị của cột không phải là `NULL`:

```php
$users = DB::table('users')
    ->whereNotNull('updated_at')
    ->get();
```

**whereNullSafeEquals / orWhereNullSafeEquals**

Các method `whereNullSafeEquals` và `orWhereNullSafeEquals` có thể được sử dụng để so sánh giá trị của một cột với một giá trị được cung cấp, đồng thời xem hai giá trị `NULL` là bằng nhau:

```php
$lastLoginIp = $request->input('last_login_ip');

$users = DB::table('users')
    ->whereNullSafeEquals('last_login_ip', $lastLoginIp)
    ->get();
```

**whereDate / whereMonth / whereDay / whereYear / whereTime**

Method `whereDate` có thể được sử dụng để so sánh giá trị của một cột với một ngày:

```php
$users = DB::table('users')
    ->whereDate('created_at', '2016-12-31')
    ->get();
```

Method `whereMonth` có thể được sử dụng để so sánh giá trị của một cột với một tháng cụ thể:

```php
$users = DB::table('users')
    ->whereMonth('created_at', '12')
    ->get();
```

Method `whereDay` có thể được sử dụng để so sánh giá trị của một cột với một ngày cụ thể trong tháng:

```php
$users = DB::table('users')
    ->whereDay('created_at', '31')
    ->get();
```

Method `whereYear` có thể được sử dụng để so sánh giá trị của một cột với một năm cụ thể:

```php
$users = DB::table('users')
    ->whereYear('created_at', '2016')
    ->get();
```

Method `whereTime` có thể được sử dụng để so sánh giá trị của một cột với một thời điểm cụ thể:

```php
$users = DB::table('users')
    ->whereTime('created_at', '=', '11:20:45')
    ->get();
```

**wherePast / whereFuture / whereToday / whereBeforeToday / whereAfterToday**

Các method `wherePast` và `whereFuture` có thể được sử dụng để xác định giá trị của một cột nằm trong quá khứ hay tương lai:

```php
$invoices = DB::table('invoices')
    ->wherePast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereFuture('due_at')
    ->get();
```

Các method `whereNowOrPast` và `whereNowOrFuture` có thể được sử dụng để xác định giá trị của một cột nằm trong quá khứ hay tương lai, đồng thời bao gồm cả ngày và thời gian hiện tại:

```php
$invoices = DB::table('invoices')
    ->whereNowOrPast('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereNowOrFuture('due_at')
    ->get();
```

Các method `whereToday`, `whereBeforeToday` và `whereAfterToday` có thể được sử dụng để xác định giá trị của một cột lần lượt là hôm nay, trước hôm nay hoặc sau hôm nay:

```php
$invoices = DB::table('invoices')
    ->whereToday('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereBeforeToday('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereAfterToday('due_at')
    ->get();
```

Tương tự, các method `whereTodayOrBefore` và `whereTodayOrAfter` có thể được sử dụng để xác định giá trị của một cột nằm trước hoặc sau hôm nay, đồng thời bao gồm cả ngày hôm nay:

```php
$invoices = DB::table('invoices')
    ->whereTodayOrBefore('due_at')
    ->get();

$invoices = DB::table('invoices')
    ->whereTodayOrAfter('due_at')
    ->get();
```

**whereColumn / orWhereColumn**

Method `whereColumn` có thể được sử dụng để kiểm tra hai cột có bằng nhau hay không:

```php
$users = DB::table('users')
    ->whereColumn('first_name', 'last_name')
    ->get();
```

Bạn cũng có thể truyền một toán tử so sánh vào method `whereColumn`:

```php
$users = DB::table('users')
    ->whereColumn('updated_at', '>', 'created_at')
    ->get();
```

Bạn cũng có thể truyền một array gồm các phép so sánh cột vào method `whereColumn`. Các điều kiện này sẽ được nối với nhau bằng toán tử `and`:

```php
$users = DB::table('users')
    ->whereColumn([
        ['first_name', '=', 'last_name'],
        ['updated_at', '>', 'created_at'],
    ])->get();
```

<a name="logical-grouping"></a>
### Nhóm điều kiện logic

Đôi khi bạn cần nhóm nhiều mệnh đề "where" trong dấu ngoặc đơn để đạt được cách nhóm logic mong muốn cho truy vấn. Trên thực tế, nhìn chung bạn nên luôn nhóm các lần gọi method `orWhere` trong dấu ngoặc đơn để tránh hành vi truy vấn ngoài mong đợi. Để thực hiện điều này, bạn có thể truyền một closure vào method `where`:

```php
$users = DB::table('users')
    ->where('name', '=', 'John')
    ->where(function (Builder $query) {
        $query->where('votes', '>', 100)
            ->orWhere('title', '=', 'Admin');
    })
    ->get();
```

Như bạn có thể thấy, việc truyền một closure vào method `where` sẽ yêu cầu query builder bắt đầu một nhóm ràng buộc. Closure sẽ nhận một query builder instance mà bạn có thể sử dụng để thiết lập các ràng buộc cần nằm trong nhóm dấu ngoặc đơn. Ví dụ trên sẽ tạo ra câu SQL sau:

```sql
select * from users where name = 'John' and (votes > 100 or title = 'Admin')
```

> [!WARNING]
> Bạn nên luôn nhóm các lần gọi `orWhere` để tránh hành vi ngoài mong đợi khi global scope được áp dụng.

<a name="advanced-where-clauses"></a>
## Các mệnh đề Where nâng cao

<a name="where-exists-clauses"></a>
### Mệnh đề Where Exists

Method `whereExists` cho phép bạn viết các mệnh đề SQL "where exists". Method `whereExists` nhận một closure; closure này sẽ nhận query builder instance, cho phép bạn định nghĩa truy vấn cần được đặt bên trong mệnh đề "exists":

```php
$users = DB::table('users')
    ->whereExists(function (Builder $query) {
        $query->select(DB::raw(1))
            ->from('orders')
            ->whereColumn('orders.user_id', 'users.id');
    })
    ->get();
```

Ngoài ra, bạn có thể truyền một query object vào method `whereExists` thay cho closure:

```php
$orders = DB::table('orders')
    ->select(DB::raw(1))
    ->whereColumn('orders.user_id', 'users.id');

$users = DB::table('users')
    ->whereExists($orders)
    ->get();
```

Cả hai ví dụ trên đều tạo ra câu SQL sau:

```sql
select * from users
where exists (
    select 1
    from orders
    where orders.user_id = users.id
)
```

<a name="subquery-where-clauses"></a>
### Mệnh đề Where với Subquery

Đôi khi bạn cần xây dựng một mệnh đề "where" để so sánh kết quả của một subquery với một giá trị được cung cấp. Bạn có thể thực hiện điều này bằng cách truyền một closure và một giá trị vào method `where`. Ví dụ, truy vấn sau sẽ lấy tất cả user có "membership" gần đây thuộc một loại nhất định:

```php
use App\Models\User;
use Illuminate\Database\Query\Builder;

$users = User::where(function (Builder $query) {
    $query->select('type')
        ->from('membership')
        ->whereColumn('membership.user_id', 'users.id')
        ->orderByDesc('membership.start_date')
        ->limit(1);
}, 'Pro')->get();
```

Hoặc bạn có thể cần xây dựng một mệnh đề "where" để so sánh một cột với kết quả của subquery. Bạn có thể thực hiện điều này bằng cách truyền cột, toán tử và closure vào method `where`. Ví dụ, truy vấn sau sẽ lấy tất cả record thu nhập có số tiền nhỏ hơn mức trung bình:

```php
use App\Models\Income;
use Illuminate\Database\Query\Builder;

$incomes = Income::where('amount', '<', function (Builder $query) {
    $query->selectRaw('avg(i.amount)')->from('incomes as i');
})->get();
```

<a name="full-text-where-clauses"></a>
### Mệnh đề Where Full Text

> [!WARNING]
> Các mệnh đề where full text hiện được MariaDB, MySQL và PostgreSQL hỗ trợ.

Các method `whereFullText` và `orWhereFullText` có thể được sử dụng để thêm mệnh đề "where" full text vào truy vấn đối với các cột có [full text index](/docs/{{version}}/migrations#available-index-types). Laravel sẽ chuyển các method này thành SQL phù hợp với hệ quản trị cơ sở dữ liệu bên dưới. Ví dụ, mệnh đề `MATCH AGAINST` sẽ được tạo cho các ứng dụng sử dụng MariaDB hoặc MySQL:

```php
$users = DB::table('users')
    ->whereFullText('bio', 'web developer')
    ->get();
```

<a name="vector-similarity-clauses"></a>
### Mệnh đề Vector Similarity

> [!NOTE]
> Các mệnh đề vector similarity hiện được hỗ trợ trên kết nối PostgreSQL sử dụng extension `pgvector` và MariaDB 11.7 trở lên. Để biết cách định nghĩa cột vector và index, hãy tham khảo [tài liệu migration](/docs/{{version}}/migrations#available-column-types).

Method `whereVectorSimilarTo` lọc kết quả theo độ tương đồng cosine với một vector được cung cấp và sắp xếp kết quả theo mức độ liên quan. Ngưỡng `minSimilarity` phải là giá trị từ `0.0` đến `1.0`, trong đó `1.0` biểu thị giống hệt nhau:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

Khi đối số vector được truyền dưới dạng chuỗi thông thường, Laravel sẽ tự động tạo embedding cho chuỗi đó bằng [Laravel AI SDK](/docs/{{version}}/ai-sdk#embeddings):

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'Best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

Theo mặc định, `whereVectorSimilarTo` cũng sắp xếp kết quả theo khoảng cách, với kết quả tương đồng nhất đứng trước. Bạn có thể tắt việc sắp xếp này bằng cách truyền `false` cho đối số `order`:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4, order: false)
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();
```

Nếu cần kiểm soát chi tiết hơn, bạn có thể sử dụng độc lập các method `selectVectorDistance`, `whereVectorDistanceLessThan` và `orderByVectorDistance`:

```php
$documents = DB::table('documents')
    ->select('*')
    ->selectVectorDistance('embedding', $queryEmbedding, as: 'distance')
    ->whereVectorDistanceLessThan('embedding', $queryEmbedding, maxDistance: 0.3)
    ->orderByVectorDistance('embedding', $queryEmbedding)
    ->limit(10)
    ->get();
```

Khi sử dụng PostgreSQL, extension `pgvector` phải được nạp trước khi có thể tạo các cột `vector`:

```php
Schema::ensureVectorExtensionExists();
```

<a name="ordering-grouping-limit-and-offset"></a>
## Sắp xếp, nhóm, giới hạn và độ lệch

<a name="ordering"></a>
### Sắp xếp

<a name="orderby"></a>
#### Method `orderBy`

Method `orderBy` cho phép bạn sắp xếp kết quả truy vấn theo một cột được cung cấp. Đối số đầu tiên của `orderBy` là cột bạn muốn dùng để sắp xếp, trong khi đối số thứ hai xác định chiều sắp xếp và có thể là `asc` hoặc `desc`:

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->get();
```

Để sắp xếp theo nhiều cột, bạn chỉ cần gọi `orderBy` nhiều lần theo nhu cầu:

```php
$users = DB::table('users')
    ->orderBy('name', 'desc')
    ->orderBy('email', 'asc')
    ->get();
```

Chiều sắp xếp là tùy chọn và mặc định là tăng dần. Nếu muốn sắp xếp giảm dần, bạn có thể chỉ định tham số thứ hai cho method `orderBy` hoặc sử dụng trực tiếp `orderByDesc`:

```php
$users = DB::table('users')
    ->orderByDesc('verified_at')
    ->get();
```

Cuối cùng, bằng toán tử `->`, kết quả có thể được sắp xếp theo một giá trị nằm bên trong cột JSON:

```php
$corporations = DB::table('corporations')
    ->where('country', 'US')
    ->orderBy('location->state')
    ->get();
```

<a name="latest-oldest"></a>
#### Các method `latest` và `oldest`

Các method `latest` và `oldest` cho phép bạn dễ dàng sắp xếp kết quả theo ngày. Theo mặc định, kết quả sẽ được sắp xếp theo cột `created_at` của bảng. Ngoài ra, bạn có thể truyền tên cột muốn dùng để sắp xếp:

```php
$user = DB::table('users')
    ->latest()
    ->first();
```

<a name="random-ordering"></a>
#### Sắp xếp ngẫu nhiên

Method `inRandomOrder` có thể được sử dụng để sắp xếp ngẫu nhiên kết quả truy vấn. Ví dụ, bạn có thể dùng method này để lấy một user ngẫu nhiên:

```php
$randomUser = DB::table('users')
    ->inRandomOrder()
    ->first();
```

<a name="removing-existing-orderings"></a>
#### Xóa các điều kiện sắp xếp hiện có

Method `reorder` xóa toàn bộ mệnh đề "order by" đã được áp dụng trước đó cho truy vấn:

```php
$query = DB::table('users')->orderBy('name');

$unorderedUsers = $query->reorder()->get();
```

Bạn có thể truyền cột và chiều sắp xếp khi gọi method `reorder` để xóa toàn bộ mệnh đề "order by" hiện có và áp dụng một thứ tự hoàn toàn mới cho truy vấn:

```php
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorder('email', 'desc')->get();
```

Để thuận tiện, bạn có thể sử dụng method `reorderDesc` để sắp xếp lại kết quả truy vấn theo thứ tự giảm dần:

```php
$query = DB::table('users')->orderBy('name');

$usersOrderedByEmail = $query->reorderDesc('email')->get();
```

<a name="grouping"></a>
### Nhóm kết quả

<a name="groupby-having"></a>
#### Các method `groupBy` và `having`

Như bạn có thể dự đoán, các method `groupBy` và `having` có thể được sử dụng để nhóm kết quả truy vấn. Chữ ký của method `having` tương tự method `where`:

```php
$users = DB::table('users')
    ->groupBy('account_id')
    ->having('account_id', '>', 100)
    ->get();
```

Bạn có thể sử dụng method `havingBetween` để lọc kết quả trong một khoảng được cung cấp:

```php
$report = DB::table('orders')
    ->selectRaw('count(id) as number_of_orders, customer_id')
    ->groupBy('customer_id')
    ->havingBetween('number_of_orders', [5, 15])
    ->get();
```

Bạn có thể truyền nhiều đối số vào method `groupBy` để nhóm theo nhiều cột:

```php
$users = DB::table('users')
    ->groupBy('first_name', 'status')
    ->having('account_id', '>', 100)
    ->get();
```

Để xây dựng các câu lệnh `having` nâng cao hơn, hãy xem method [havingRaw](#raw-methods).

<a name="limit-and-offset"></a>
### Limit và Offset

Bạn có thể sử dụng các method `limit` và `offset` để giới hạn số lượng kết quả được trả về từ truy vấn hoặc bỏ qua một số lượng kết quả nhất định:

```php
$users = DB::table('users')
    ->offset(10)
    ->limit(5)
    ->get();
```

<a name="conditional-clauses"></a>
## Các mệnh đề có điều kiện

Đôi khi bạn muốn một số mệnh đề truy vấn chỉ được áp dụng dựa trên một điều kiện khác. Ví dụ, bạn có thể chỉ muốn áp dụng câu lệnh `where` nếu một giá trị input nhất định có trong HTTP request gửi đến. Bạn có thể thực hiện điều này bằng method `when`:

```php
$role = $request->input('role');

$users = DB::table('users')
    ->when($role, function (Builder $query, string $role) {
        $query->where('role_id', $role);
    })
    ->get();
```

Method `when` chỉ thực thi closure được cung cấp khi đối số đầu tiên là `true`. Nếu đối số đầu tiên là `false`, closure sẽ không được thực thi. Vì vậy, trong ví dụ trên, closure truyền vào `when` chỉ được gọi nếu field `role` có trong request gửi đến và được đánh giá là `true`.

Bạn có thể truyền một closure khác làm đối số thứ ba của method `when`. Closure này chỉ được thực thi nếu đối số đầu tiên được đánh giá là `false`. Để minh họa, chúng ta sẽ sử dụng tính năng này để cấu hình thứ tự sắp xếp mặc định của truy vấn:

```php
$sortByVotes = $request->boolean('sort_by_votes');

$users = DB::table('users')
    ->when($sortByVotes, function (Builder $query, bool $sortByVotes) {
        $query->orderBy('votes');
    }, function (Builder $query) {
        $query->orderBy('name');
    })
    ->get();
```

<a name="insert-statements"></a>
## Câu lệnh Insert

Query builder cũng cung cấp method `insert` để chèn record vào bảng cơ sở dữ liệu. Method `insert` nhận một array gồm tên cột và giá trị:

```php
DB::table('users')->insert([
    'email' => 'kayla@example.com',
    'votes' => 0
]);
```

Bạn có thể chèn nhiều record cùng lúc bằng cách truyền một array gồm nhiều array. Mỗi array đại diện cho một record cần được chèn vào bảng:

```php
DB::table('users')->insert([
    ['email' => 'picard@example.com', 'votes' => 0],
    ['email' => 'janeway@example.com', 'votes' => 0],
]);
```

Method `insertOrIgnore` sẽ bỏ qua lỗi trong quá trình chèn record vào cơ sở dữ liệu. Khi sử dụng method này, bạn cần lưu ý rằng lỗi record trùng lặp sẽ bị bỏ qua và các loại lỗi khác cũng có thể bị bỏ qua tùy theo database engine. Ví dụ, `insertOrIgnore` sẽ [bỏ qua strict mode của MySQL](https://dev.mysql.com/doc/refman/en/sql-mode.html#ignore-effect-on-execution):

```php
DB::table('users')->insertOrIgnore([
    ['id' => 1, 'email' => 'sisko@example.com'],
    ['id' => 2, 'email' => 'archer@example.com'],
]);
```

Method `insertUsing` sẽ chèn các record mới vào bảng, đồng thời sử dụng một subquery để xác định dữ liệu cần chèn:

```php
DB::table('pruned_users')->insertUsing([
    'id', 'name', 'email', 'email_verified_at'
], DB::table('users')->select(
    'id', 'name', 'email', 'email_verified_at'
)->where('updated_at', '<=', now()->minus(months: 1)));
```

<a name="auto-incrementing-ids"></a>
#### ID tự tăng

Nếu bảng có ID tự tăng, hãy sử dụng method `insertGetId` để chèn một record rồi lấy ID của record đó:

```php
$id = DB::table('users')->insertGetId(
    ['email' => 'john@example.com', 'votes' => 0]
);
```

> [!WARNING]
> Khi sử dụng PostgreSQL, method `insertGetId` mặc định kỳ vọng cột tự tăng có tên `id`. Nếu muốn lấy ID từ một "sequence" khác, bạn có thể truyền tên cột làm tham số thứ hai của method `insertGetId`.

<a name="upserts"></a>
### Upsert

Method `upsert` sẽ chèn các record chưa tồn tại và cập nhật các record đã tồn tại bằng những giá trị mới mà bạn chỉ định. Đối số đầu tiên chứa các giá trị cần chèn hoặc cập nhật; đối số thứ hai liệt kê các cột dùng để định danh duy nhất record trong bảng tương ứng; đối số thứ ba và cũng là cuối cùng là array các cột cần cập nhật nếu một record khớp đã tồn tại trong cơ sở dữ liệu:

```php
DB::table('flights')->upsert(
    [
        ['departure' => 'Oakland', 'destination' => 'San Diego', 'price' => 99],
        ['departure' => 'Chicago', 'destination' => 'New York', 'price' => 150]
    ],
    ['departure', 'destination'],
    ['price']
);
```

Trong ví dụ trên, Laravel sẽ cố gắng chèn hai record. Nếu đã tồn tại record có cùng giá trị ở các cột `departure` và `destination`, Laravel sẽ cập nhật cột `price` của record đó.

> [!WARNING]
> Tất cả cơ sở dữ liệu ngoại trừ SQL Server đều yêu cầu các cột trong đối số thứ hai của method `upsert` phải có index "primary" hoặc "unique". Ngoài ra, driver MariaDB và MySQL bỏ qua đối số thứ hai của `upsert` và luôn sử dụng các index "primary" và "unique" của bảng để phát hiện record đã tồn tại.

<a name="update-statements"></a>
## Câu lệnh Update

Ngoài việc chèn record vào cơ sở dữ liệu, query builder cũng có thể cập nhật record hiện có bằng method `update`. Tương tự `insert`, method `update` nhận một array gồm các cặp cột và giá trị để chỉ định các cột cần cập nhật. Method `update` trả về số hàng bị ảnh hưởng. Bạn có thể giới hạn truy vấn `update` bằng các mệnh đề `where`:

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['votes' => 1]);
```

<a name="update-or-insert"></a>
#### Update hoặc Insert

Đôi khi bạn muốn cập nhật một record hiện có trong cơ sở dữ liệu hoặc tạo mới nếu không tìm thấy record phù hợp. Trong trường hợp này, có thể sử dụng method `updateOrInsert`. Method `updateOrInsert` nhận hai đối số: một array các điều kiện dùng để tìm record và một array các cặp cột/giá trị chỉ định các cột cần cập nhật.

Method `updateOrInsert` sẽ tìm record phù hợp bằng các cặp cột và giá trị trong đối số đầu tiên. Nếu record tồn tại, nó sẽ được cập nhật bằng các giá trị trong đối số thứ hai. Nếu không tìm thấy record, một record mới sẽ được chèn với các thuộc tính được hợp nhất từ cả hai đối số:

```php
DB::table('users')
    ->updateOrInsert(
        ['email' => 'john@example.com', 'name' => 'John'],
        ['votes' => '2']
    );
```

Bạn có thể truyền một closure vào method `updateOrInsert` để tùy chỉnh các thuộc tính được cập nhật hoặc chèn vào cơ sở dữ liệu dựa trên việc record phù hợp có tồn tại hay không:

```php
DB::table('users')->updateOrInsert(
    ['user_id' => $user_id],
    fn ($exists) => $exists ? [
        'name' => $data['name'],
        'email' => $data['email'],
    ] : [
        'name' => $data['name'],
        'email' => $data['email'],
        'marketable' => true,
    ],
);
```

<a name="updating-json-columns"></a>
### Cập nhật cột JSON

Khi cập nhật cột JSON, bạn nên sử dụng cú pháp `->` để cập nhật key tương ứng trong JSON object. Thao tác này được hỗ trợ trên MariaDB 10.3+, MySQL 5.7+ và PostgreSQL 9.5+:

```php
$affected = DB::table('users')
    ->where('id', 1)
    ->update(['options->enabled' => true]);
```

<a name="increment-and-decrement"></a>
### Tăng và giảm giá trị

Query builder cũng cung cấp các method thuận tiện để tăng hoặc giảm giá trị của một cột. Cả hai method đều nhận ít nhất một đối số là cột cần thay đổi. Có thể truyền đối số thứ hai để chỉ định lượng giá trị cần tăng hoặc giảm:

```php
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5);
```

Nếu cần, bạn cũng có thể chỉ định các cột bổ sung cần cập nhật trong quá trình tăng hoặc giảm:

```php
DB::table('users')->increment('votes', 1, ['name' => 'John']);
```

Ngoài ra, bạn có thể tăng hoặc giảm nhiều cột cùng lúc bằng các method `incrementEach` và `decrementEach`:

```php
DB::table('users')->incrementEach([
    'votes' => 5,
    'balance' => 100,
]);
```

<a name="delete-statements"></a>
## Câu lệnh Delete

Method `delete` của query builder có thể được sử dụng để xóa record khỏi bảng. Method `delete` trả về số hàng bị ảnh hưởng. Bạn có thể giới hạn câu lệnh `delete` bằng cách thêm các mệnh đề "where" trước khi gọi method `delete`:

```php
$deleted = DB::table('users')->delete();

$deleted = DB::table('users')->where('votes', '>', 100)->delete();
```

<a name="pessimistic-locking"></a>
## Pessimistic Locking

Query builder cũng cung cấp một số chức năng giúp bạn thực hiện "pessimistic locking" khi chạy các câu lệnh `select`. Để thực thi câu lệnh với "shared lock", bạn có thể gọi method `sharedLock`. Shared lock ngăn các hàng đã chọn bị thay đổi cho đến khi transaction được commit:

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->sharedLock()
    ->get();
```

Ngoài ra, bạn có thể sử dụng method `lockForUpdate`. Lock "for update" ngăn các record đã chọn bị thay đổi hoặc bị chọn bởi một shared lock khác:

```php
DB::table('users')
    ->where('votes', '>', 100)
    ->lockForUpdate()
    ->get();
```

Dù không bắt buộc, bạn nên đặt pessimistic lock bên trong một [transaction](/docs/{{version}}/database#database-transactions). Điều này đảm bảo dữ liệu được lấy ra không bị thay đổi trong cơ sở dữ liệu cho đến khi toàn bộ thao tác hoàn tất. Nếu xảy ra lỗi, transaction sẽ rollback mọi thay đổi và tự động giải phóng lock:

```php
DB::transaction(function () {
    $sender = DB::table('users')
        ->lockForUpdate()
        ->find(1);

    $receiver = DB::table('users')
        ->lockForUpdate()
        ->find(2);

    if ($sender->balance < 100) {
        throw new RuntimeException('Balance too low.');
    }

    DB::table('users')
        ->where('id', $sender->id)
        ->update([
            'balance' => $sender->balance - 100
        ]);

    DB::table('users')
        ->where('id', $receiver->id)
        ->update([
            'balance' => $receiver->balance + 100
        ]);
});
```

<a name="reusable-query-components"></a>
## Thành phần truy vấn có thể tái sử dụng

Nếu có logic truy vấn lặp lại trong toàn ứng dụng, bạn có thể tách logic đó thành các object có thể tái sử dụng bằng các method `tap` và `pipe` của query builder. Giả sử ứng dụng có hai truy vấn khác nhau sau:

```php
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

$destination = $request->query('destination');

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) {
        $query->where('destination', $destination);
    })
    ->orderByDesc('price')
    ->get();

// ...

$destination = $request->query('destination');

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) {
        $query->where('destination', $destination);
    })
    ->where('user', $request->user()->id)
    ->orderBy('destination')
    ->get();
```

Bạn có thể tách phần lọc theo destination dùng chung giữa các truy vấn thành một object có thể tái sử dụng:

```php
<?php

namespace App\Scopes;

use Illuminate\Database\Query\Builder;

class DestinationFilter
{
    public function __construct(
        private ?string $destination,
    ) {
        //
    }

    public function __invoke(Builder $query): void
    {
        $query->when($this->destination, function (Builder $query) {
            $query->where('destination', $this->destination);
        });
    }
}
```

Sau đó, bạn có thể sử dụng method `tap` của query builder để áp dụng logic của object vào truy vấn:

```php
use App\Scopes\DestinationFilter;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) { // [tl! remove]
        $query->where('destination', $destination); // [tl! remove]
    }) // [tl! remove]
    ->tap(new DestinationFilter($destination)) // [tl! add]
    ->orderByDesc('price')
    ->get();

// ...

DB::table('flights')
    ->when($destination, function (Builder $query, string $destination) { // [tl! remove]
        $query->where('destination', $destination); // [tl! remove]
    }) // [tl! remove]
    ->tap(new DestinationFilter($destination)) // [tl! add]
    ->where('user', $request->user()->id)
    ->orderBy('destination')
    ->get();
```

<a name="query-pipes"></a>
#### Query Pipe

Method `tap` luôn trả về query builder. Nếu muốn tách thành một object thực thi truy vấn và trả về một giá trị khác, bạn có thể sử dụng method `pipe` thay thế.

Hãy xem query object sau, chứa logic [phân trang](/docs/{{version}}/pagination) dùng chung trong toàn ứng dụng. Khác với `DestinationFilter` chỉ áp dụng điều kiện lên truy vấn, object `Paginate` thực thi truy vấn và trả về một paginator instance:

```php
<?php

namespace App\Scopes;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Query\Builder;

class Paginate
{
    public function __construct(
        private string $sortBy = 'timestamp',
        private string $sortDirection = 'desc',
        private int $perPage = 25,
    ) {
        //
    }

    public function __invoke(Builder $query): LengthAwarePaginator
    {
        return $query->orderBy($this->sortBy, $this->sortDirection)
            ->paginate($this->perPage, pageName: 'p');
    }
}
```

Bằng method `pipe` của query builder, chúng ta có thể sử dụng object này để áp dụng logic phân trang dùng chung:

```php
$flights = DB::table('flights')
    ->tap(new DestinationFilter($destination))
    ->pipe(new Paginate);
```

<a name="debugging"></a>
## Debugging

Bạn có thể sử dụng các method `dd` và `dump` trong khi xây dựng truy vấn để hiển thị binding và SQL hiện tại. Method `dd` hiển thị thông tin debug rồi dừng thực thi request. Method `dump` hiển thị thông tin debug nhưng vẫn cho phép request tiếp tục thực thi:

```php
DB::table('users')->where('votes', '>', 100)->dd();

DB::table('users')->where('votes', '>', 100)->dump();
```

Các method `dumpRawSql` và `ddRawSql` có thể được gọi trên truy vấn để hiển thị SQL của truy vấn sau khi tất cả parameter binding đã được thay thế đúng cách:

```php
DB::table('users')->where('votes', '>', 100)->dumpRawSql();

DB::table('users')->where('votes', '>', 100)->ddRawSql();
```

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/queries). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
