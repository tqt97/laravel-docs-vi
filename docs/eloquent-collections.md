# Eloquent: Collection
- [Giới thiệu](#introduction)
- [Các phương thức có sẵn](#available-methods)
- [Collection tùy chỉnh](#custom-collections)
<a name="introduction"></a>
## Giới thiệu
Mọi phương thức Eloquent trả về nhiều model đều trả về một instance của class `Illuminate\Database\Eloquent\Collection`, bao gồm kết quả được lấy bằng phương thức `get` hoặc thông qua relationship. Eloquent collection kế thừa [collection cơ sở](/docs/{{version}}/collections) của Laravel, vì vậy nó tự động cung cấp hàng chục phương thức để xử lý linh hoạt tập hợp model Eloquent bên trong. Hãy xem tài liệu Collection của Laravel để tìm hiểu đầy đủ các phương thức hữu ích này.
Mọi collection cũng hoạt động như một iterator, vì vậy bạn có thể lặp qua chúng tương tự như với một array PHP thông thường:
```php
use App\Models\User;

$users = User::where('active', 1)->get();

foreach ($users as $user) {
    echo $user->name;
}
```
Tuy nhiên, collection mạnh hơn array rất nhiều và cung cấp nhiều phép toán như map / reduce có thể nối chuỗi thông qua một API trực quan. Ví dụ, ta có thể loại bỏ tất cả model không hoạt động rồi lấy tên của từng user còn lại:
```php
$names = User::all()->reject(function (User $user) {
    return $user->active === false;
})->map(function (User $user) {
    return $user->name;
});
```

<a name="eloquent-collection-conversion"></a>
#### Chuyển đổi Eloquent collection
Trong khi phần lớn phương thức của Eloquent collection trả về một Eloquent collection mới, các phương thức `collapse`, `flatten`, `flip`, `keys`, `pluck` và `zip` trả về một instance [collection cơ sở](/docs/{{version}}/collections). Tương tự, nếu thao tác `map` tạo ra một collection không còn chứa bất kỳ Eloquent model nào, kết quả sẽ được chuyển thành collection cơ sở.
<a name="available-methods"></a>
## Các phương thức có sẵn
Mọi Eloquent collection đều kế thừa [collection cơ sở của Laravel](/docs/{{version}}/collections#available-methods), vì vậy chúng có toàn bộ các phương thức mạnh mẽ của class collection cơ sở.
Ngoài ra, class `Illuminate\Database\Eloquent\Collection` cung cấp thêm một tập hợp phương thức chuyên biệt để quản lý collection model. Phần lớn các phương thức trả về instance `Illuminate\Database\Eloquent\Collection`; tuy nhiên, một số phương thức như `modelKeys` trả về `Illuminate\Support\Collection`.
<style>
    .collection-method-list > p {
        columns: 14.4em 1; -moz-columns: 14.4em 1; -webkit-columns: 14.4em 1;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<div class="collection-method-list" markdown="1">

[append](#method-append)
[contains](#method-contains)
[diff](#method-diff)
[except](#method-except)
[find](#method-find)
[findOrFail](#method-find-or-fail)
[fresh](#method-fresh)
[intersect](#method-intersect)
[load](#method-load)
[loadMissing](#method-loadMissing)
[modelKeys](#method-modelKeys)
[makeVisible](#method-makeVisible)
[makeHidden](#method-makeHidden)
[mergeVisible](#method-mergeVisible)
[mergeHidden](#method-mergeHidden)
[only](#method-only)
[partition](#method-partition)
[setAppends](#method-setAppends)
[setVisible](#method-setVisible)
[setHidden](#method-setHidden)
[toQuery](#method-toquery)
[unique](#method-unique)
[withoutAppends](#method-withoutAppends)

</div>

<a name="method-append"></a>
#### `append($attributes)` {.collection-method .first-collection-method}

Phương thức `append` dùng để chỉ định một attribute cần được [append](/docs/{{version}}/eloquent-serialization#appending-values-to-json) vào mọi model trong collection. Phương thức nhận một array attribute hoặc một attribute đơn:
```php
$users->append('team');

$users->append(['team', 'is_admin']);
```

<a name="method-contains"></a>
#### `contains($key, $operator = null, $value = null)` {.collection-method}

Phương thức `contains` dùng để xác định collection có chứa model instance đã cho hay không. Bạn có thể truyền primary key hoặc model instance:
```php
$users->contains(1);

$users->contains(User::find(1));
```

<a name="method-diff"></a>
#### `diff($items)` {.collection-method}

Phương thức `diff` trả về toàn bộ model không xuất hiện trong collection được truyền vào:
```php
use App\Models\User;

$users = $users->diff(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-except"></a>
#### `except($keys)` {.collection-method}

Phương thức `except` trả về toàn bộ model không có primary key nằm trong danh sách đã cho:
```php
$users = $users->except([1, 2, 3]);
```

<a name="method-find"></a>
#### `find($key)` {.collection-method}

Phương thức `find` trả về model có primary key khớp với key được truyền vào. Nếu `$key` là model instance, `find` cố tìm model có cùng primary key. Nếu `$key` là array key, `find` trả về tất cả model có primary key nằm trong array đó:
```php
$users = User::all();

$user = $users->find(1);
```

<a name="method-find-or-fail"></a>
#### `findOrFail($key)` {.collection-method}

Phương thức `findOrFail` trả về model có primary key khớp với key đã cho, hoặc throw exception `Illuminate\Database\Eloquent\ModelNotFoundException` nếu collection không chứa model phù hợp:
```php
$users = User::all();

$user = $users->findOrFail(1);
```

<a name="method-fresh"></a>
#### `fresh($with = [])` {.collection-method}

Phương thức `fresh` lấy lại instance mới nhất của từng model trong collection từ database. Ngoài ra, các relationship được chỉ định cũng sẽ được eager load:
```php
$users = $users->fresh();

$users = $users->fresh('comments');
```

<a name="method-intersect"></a>
#### `intersect($items)` {.collection-method}

Phương thức `intersect` trả về tất cả model đồng thời xuất hiện trong collection được truyền vào:
```php
use App\Models\User;

$users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-load"></a>
#### `load($relations)` {.collection-method}

Phương thức `load` eager load các relationship đã cho cho toàn bộ model trong collection:
```php
$users->load(['comments', 'posts']);

$users->load('comments.author');

$users->load(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-loadMissing"></a>
#### `loadMissing($relations)` {.collection-method}

Phương thức `loadMissing` eager load các relationship đã cho cho toàn bộ model trong collection nếu relationship đó chưa được load:
```php
$users->loadMissing(['comments', 'posts']);

$users->loadMissing('comments.author');

$users->loadMissing(['comments', 'posts' => fn ($query) => $query->where('active', 1)]);
```

<a name="method-modelKeys"></a>
#### `modelKeys()` {.collection-method}

Phương thức `modelKeys` trả về primary key của tất cả model trong collection:
```php
$users->modelKeys();

// [1, 2, 3, 4, 5]
```

<a name="method-makeVisible"></a>
#### `makeVisible($attributes)` {.collection-method}

Phương thức `makeVisible` làm cho các attribute vốn thường bị "ẩn" trên từng model trong collection trở nên [hiển thị](/docs/{{version}}/eloquent-serialization#hiding-attributes-from-json):
```php
$users = $users->makeVisible(['address', 'phone_number']);
```

<a name="method-makeHidden"></a>
#### `makeHidden($attributes)` {.collection-method}

Phương thức `makeHidden` [ẩn các attribute](/docs/{{version}}/eloquent-serialization#hiding-attributes-from-json) vốn thường đang hiển thị trên từng model trong collection:
```php
$users = $users->makeHidden(['address', 'phone_number']);
```

<a name="method-mergeVisible"></a>
#### `mergeVisible($attributes)` {.collection-method}

Phương thức `mergeVisible` [bổ sung các attribute hiển thị](/docs/{{version}}/eloquent-serialization#hiding-attributes-from-json) mà vẫn giữ lại danh sách visible hiện tại:
```php
$users = $users->mergeVisible(['middle_name']);
```

<a name="method-mergeHidden"></a>
#### `mergeHidden($attributes)` {.collection-method}

Phương thức `mergeHidden` [bổ sung các attribute bị ẩn](/docs/{{version}}/eloquent-serialization#hiding-attributes-from-json) mà vẫn giữ lại danh sách hidden hiện tại:
```php
$users = $users->mergeHidden(['last_login_at']);
```

<a name="method-only"></a>
#### `only($keys)` {.collection-method}

Phương thức `only` trả về toàn bộ model có primary key nằm trong danh sách đã cho:
```php
$users = $users->only([1, 2, 3]);
```

<a name="method-partition"></a>
#### `partition` {.collection-method}

Phương thức `partition` trả về instance `Illuminate\Support\Collection` chứa các instance collection `Illuminate\Database\Eloquent\Collection`:
```php
$partition = $users->partition(fn ($user) => $user->age > 18);

dump($partition::class);    // Illuminate\Support\Collection
dump($partition[0]::class); // Illuminate\Database\Eloquent\Collection
dump($partition[1]::class); // Illuminate\Database\Eloquent\Collection
```

<a name="method-setAppends"></a>
#### `setAppends($attributes)` {.collection-method}

Phương thức `setAppends` tạm thời ghi đè toàn bộ [attribute được append](/docs/{{version}}/eloquent-serialization#appending-values-to-json) trên từng model trong collection:
```php
$users = $users->setAppends(['is_admin']);
```

<a name="method-setVisible"></a>
#### `setVisible($attributes)` {.collection-method}

Phương thức `setVisible` [tạm thời ghi đè](/docs/{{version}}/eloquent-serialization#temporarily-modifying-attribute-visibility) toàn bộ attribute hiển thị trên từng model trong collection:
```php
$users = $users->setVisible(['id', 'name']);
```

<a name="method-setHidden"></a>
#### `setHidden($attributes)` {.collection-method}

Phương thức `setHidden` [tạm thời ghi đè](/docs/{{version}}/eloquent-serialization#temporarily-modifying-attribute-visibility) toàn bộ attribute bị ẩn trên từng model trong collection:
```php
$users = $users->setHidden(['email', 'password', 'remember_token']);
```

<a name="method-toquery"></a>
#### `toQuery()` {.collection-method}

Phương thức `toQuery` trả về một Eloquent query builder có ràng buộc `whereIn` trên primary key của các model trong collection:
```php
use App\Models\User;

$users = User::where('status', 'VIP')->get();

$users->toQuery()->update([
    'status' => 'Administrator',
]);
```

<a name="method-unique"></a>
#### `unique($key = null, $strict = false)` {.collection-method}

Phương thức `unique` trả về các model duy nhất trong collection. Model có cùng primary key với một model khác trong collection sẽ bị loại bỏ:
```php
$users = $users->unique();
```

<a name="method-withoutAppends"></a>
#### `withoutAppends()` {.collection-method}

Phương thức `withoutAppends` tạm thời loại bỏ toàn bộ [appended attribute](/docs/{{version}}/eloquent-serialization#appending-values-to-json) khỏi từng model trong collection:
```php
$users = $users->withoutAppends();
```

<a name="custom-collections"></a>
## Collection tùy chỉnh
Nếu muốn sử dụng object `Collection` tùy chỉnh khi làm việc với một model cụ thể, bạn có thể thêm attribute `CollectedBy` vào model:
```php
<?php

namespace App\Models;

use App\Support\UserCollection;
use Illuminate\Database\Eloquent\Attributes\CollectedBy;
use Illuminate\Database\Eloquent\Model;

#[CollectedBy(UserCollection::class)]
class User extends Model
{
    // ...
}
```
Ngoài ra, bạn có thể định nghĩa phương thức `newCollection` trên model:
```php
<?php

namespace App\Models;

use App\Support\UserCollection;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Create a new Eloquent Collection instance.
     *
     * @param  array<int, \Illuminate\Database\Eloquent\Model>  $models
     * @return \Illuminate\Database\Eloquent\Collection<int, \Illuminate\Database\Eloquent\Model>
     */
    public function newCollection(array $models = []): Collection
    {
        $collection = new UserCollection($models);

        if (Model::isAutomaticallyEagerLoadingRelationships()) {
            $collection->withRelationshipAutoloading();
        }

        return $collection;
    }
}
```
Sau khi định nghĩa `newCollection` hoặc thêm attribute `CollectedBy`, bất cứ khi nào Eloquent thông thường trả về `Illuminate\Database\Eloquent\Collection`, bạn sẽ nhận được một instance của collection tùy chỉnh.
Nếu muốn sử dụng collection tùy chỉnh cho mọi model trong ứng dụng, hãy định nghĩa `newCollection` trên class model cơ sở mà tất cả model của ứng dụng kế thừa.
## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/eloquent-collections). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
