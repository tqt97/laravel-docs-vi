# Hàm hỗ trợ

<a name="introduction"></a>
## Giới thiệu

Laravel cung cấp nhiều hàm PHP "helper" toàn cục. Nhiều hàm trong số này được chính framework sử dụng; tuy nhiên, bạn hoàn toàn có thể dùng chúng trong ứng dụng của mình nếu thấy thuận tiện.

<a name="available-methods"></a>
## Các phương thức có sẵn

<style>
    .collection-method-list > p {
        columns: 10.8em 3; -moz-columns: 10.8em 3; -webkit-columns: 10.8em 3;
    }

    .collection-method-list a {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

<a name="arrays-and-objects-method-list"></a>
### Mảng và đối tượng

<div class="collection-method-list" markdown="1">

[Arr::accessible](#method-array-accessible)
[Arr::add](#method-array-add)
[Arr::array](#method-array-array)
[Arr::boolean](#method-array-boolean)
[Arr::collapse](#method-array-collapse)
[Arr::crossJoin](#method-array-crossjoin)
[Arr::divide](#method-array-divide)
[Arr::dot](#method-array-dot)
[Arr::every](#method-array-every)
[Arr::except](#method-array-except)
[Arr::exceptValues](#method-array-except-values)
[Arr::exists](#method-array-exists)
[Arr::first](#method-array-first)
[Arr::flatten](#method-array-flatten)
[Arr::float](#method-array-float)
[Arr::forget](#method-array-forget)
[Arr::from](#method-array-from)
[Arr::get](#method-array-get)
[Arr::has](#method-array-has)
[Arr::hasAll](#method-array-hasall)
[Arr::hasAny](#method-array-hasany)
[Arr::integer](#method-array-integer)
[Arr::isAssoc](#method-array-isassoc)
[Arr::isList](#method-array-islist)
[Arr::join](#method-array-join)
[Arr::keyBy](#method-array-keyby)
[Arr::last](#method-array-last)
[Arr::map](#method-array-map)
[Arr::mapSpread](#method-array-map-spread)
[Arr::mapWithKeys](#method-array-map-with-keys)
[Arr::only](#method-array-only)
[Arr::onlyValues](#method-array-only-values)
[Arr::partition](#method-array-partition)
[Arr::pluck](#method-array-pluck)
[Arr::prepend](#method-array-prepend)
[Arr::prependKeysWith](#method-array-prependkeyswith)
[Arr::pull](#method-array-pull)
[Arr::push](#method-array-push)
[Arr::query](#method-array-query)
[Arr::random](#method-array-random)
[Arr::reject](#method-array-reject)
[Arr::select](#method-array-select)
[Arr::set](#method-array-set)
[Arr::shuffle](#method-array-shuffle)
[Arr::sole](#method-array-sole)
[Arr::some](#method-array-some)
[Arr::sort](#method-array-sort)
[Arr::sortDesc](#method-array-sort-desc)
[Arr::sortRecursive](#method-array-sort-recursive)
[Arr::string](#method-array-string)
[Arr::take](#method-array-take)
[Arr::toCssClasses](#method-array-to-css-classes)
[Arr::toCssStyles](#method-array-to-css-styles)
[Arr::undot](#method-array-undot)
[Arr::where](#method-array-where)
[Arr::whereNotNull](#method-array-where-not-null)
[Arr::wrap](#method-array-wrap)
[data_fill](#method-data-fill)
[data_get](#method-data-get)
[data_set](#method-data-set)
[data_forget](#method-data-forget)
[head](#method-head)
[last](#method-last)
</div>

<a name="numbers-method-list"></a>
### Số

<div class="collection-method-list" markdown="1">

[Number::abbreviate](#method-number-abbreviate)
[Number::clamp](#method-number-clamp)
[Number::currency](#method-number-currency)
[Number::defaultCurrency](#method-default-currency)
[Number::defaultLocale](#method-default-locale)
[Number::fileSize](#method-number-file-size)
[Number::forHumans](#method-number-for-humans)
[Number::format](#method-number-format)
[Number::ordinal](#method-number-ordinal)
[Number::pairs](#method-number-pairs)
[Number::parse](#method-number-parse)
[Number::parseInt](#method-number-parse-int)
[Number::parseFloat](#method-number-parse-float)
[Number::percentage](#method-number-percentage)
[Number::spell](#method-number-spell)
[Number::spellOrdinal](#method-number-spell-ordinal)
[Number::trim](#method-number-trim)
[Number::useLocale](#method-number-use-locale)
[Number::withLocale](#method-number-with-locale)
[Number::useCurrency](#method-number-use-currency)
[Number::withCurrency](#method-number-with-currency)

</div>

<a name="paths-method-list"></a>
### Đường dẫn

<div class="collection-method-list" markdown="1">

[app_path](#method-app-path)
[base_path](#method-base-path)
[config_path](#method-config-path)
[database_path](#method-database-path)
[lang_path](#method-lang-path)
[public_path](#method-public-path)
[resource_path](#method-resource-path)
[storage_path](#method-storage-path)

</div>

<a name="urls-method-list"></a>
### URL

<div class="collection-method-list" markdown="1">

[action](#method-action)
[asset](#method-asset)
[route](#method-route)
[secure_asset](#method-secure-asset)
[secure_url](#method-secure-url)
[to_action](#method-to-action)
[to_route](#method-to-route)
[uri](#method-uri)
[url](#method-url)

</div>

<a name="miscellaneous-method-list"></a>
### Khác

<div class="collection-method-list" markdown="1">

[abort](#method-abort)
[abort_if](#method-abort-if)
[abort_unless](#method-abort-unless)
[app](#method-app)
[auth](#method-auth)
[back](#method-back)
[bcrypt](#method-bcrypt)
[blank](#method-blank)
[broadcast](#method-broadcast)
[broadcast_if](#method-broadcast-if)
[broadcast_unless](#method-broadcast-unless)
[cache](#method-cache)
[class_uses_recursive](#method-class-uses-recursive)
[collect](#method-collect)
[config](#method-config)
[context](#method-context)
[cookie](#method-cookie)
[csrf_field](#method-csrf-field)
[csrf_token](#method-csrf-token)
[decrypt](#method-decrypt)
[dd](#method-dd)
[dispatch](#method-dispatch)
[dispatch_sync](#method-dispatch-sync)
[dump](#method-dump)
[encrypt](#method-encrypt)
[env](#method-env)
[event](#method-event)
[fake](#method-fake)
[filled](#method-filled)
[info](#method-info)
[literal](#method-literal)
[logger](#method-logger)
[method_field](#method-method-field)
[now](#method-now)
[old](#method-old)
[once](#method-once)
[optional](#method-optional)
[policy](#method-policy)
[redirect](#method-redirect)
[report](#method-report)
[report_if](#method-report-if)
[report_unless](#method-report-unless)
[request](#method-request)
[rescue](#method-rescue)
[resolve](#method-resolve)
[response](#method-response)
[retry](#method-retry)
[session](#method-session)
[tap](#method-tap)
[throw_if](#method-throw-if)
[throw_unless](#method-throw-unless)
[today](#method-today)
[trait_uses_recursive](#method-trait-uses-recursive)
[transform](#method-transform)
[validator](#method-validator)
[value](#method-value)
[view](#method-view)
[with](#method-with)
[when](#method-when)

</div>

<a name="arrays"></a>
## Mảng và đối tượng

<a name="method-array-accessible"></a>
#### `Arr::accessible()` {.collection-method .first-collection-method}

Phương thức `Arr::accessible` xác định giá trị đã cho có thể được truy cập như một mảng hay không:

```php
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

$isAccessible = Arr::accessible(['a' => 1, 'b' => 2]);

// true

$isAccessible = Arr::accessible(new Collection);

// true

$isAccessible = Arr::accessible('abc');

// false

$isAccessible = Arr::accessible(new stdClass);

// false
```

<a name="method-array-add"></a>
#### `Arr::add()` {.collection-method}

Phương thức `Arr::add` thêm một cặp khóa / giá trị vào mảng nếu khóa đó chưa tồn tại trong mảng hoặc đang có giá trị `null`:

```php
use Illuminate\Support\Arr;

$array = Arr::add(['name' => 'Desk'], 'price', 100);

// ['name' => 'Desk', 'price' => 100]

$array = Arr::add(['name' => 'Desk', 'price' => null], 'price', 100);

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-array"></a>
#### `Arr::array()` {.collection-method}

Phương thức `Arr::array` lấy một giá trị từ mảng lồng sâu bằng ký pháp "dot" (tương tự [Arr::get()](#method-array-get)), nhưng sẽ ném `InvalidArgumentException` nếu giá trị được yêu cầu không phải là `array`:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$value = Arr::array($array, 'languages');

// ['PHP', 'Ruby']

$value = Arr::array($array, 'name');

// throws InvalidArgumentException
```

<a name="method-array-boolean"></a>
#### `Arr::boolean()` {.collection-method}

Phương thức `Arr::boolean` lấy một giá trị từ mảng lồng sâu bằng ký pháp "dot" (tương tự [Arr::get()](#method-array-get)), nhưng sẽ ném `InvalidArgumentException` nếu giá trị được yêu cầu không phải là `boolean`:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'available' => true];

$value = Arr::boolean($array, 'available');

// true

$value = Arr::boolean($array, 'name');

// throws InvalidArgumentException
```


<a name="method-array-collapse"></a>
#### `Arr::collapse()` {.collection-method}

Phương thức `Arr::collapse` gộp một mảng gồm các mảng hoặc collection thành một mảng duy nhất:

```php
use Illuminate\Support\Arr;

$array = Arr::collapse([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-array-crossjoin"></a>
#### `Arr::crossJoin()` {.collection-method}

Phương thức `Arr::crossJoin` thực hiện phép cross join trên các mảng đã cho, trả về tích Descartes chứa mọi tổ hợp có thể:

```php
use Illuminate\Support\Arr;

$matrix = Arr::crossJoin([1, 2], ['a', 'b']);

/*
    [
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]
*/

$matrix = Arr::crossJoin([1, 2], ['a', 'b'], ['I', 'II']);

/*
    [
        [1, 'a', 'I'],
        [1, 'a', 'II'],
        [1, 'b', 'I'],
        [1, 'b', 'II'],
        [2, 'a', 'I'],
        [2, 'a', 'II'],
        [2, 'b', 'I'],
        [2, 'b', 'II'],
    ]
*/
```

<a name="method-array-divide"></a>
#### `Arr::divide()` {.collection-method}

Phương thức `Arr::divide` trả về hai mảng: một mảng chứa các khóa và mảng còn lại chứa các giá trị của mảng đã cho:

```php
use Illuminate\Support\Arr;

[$keys, $values] = Arr::divide(['name' => 'Desk']);

// $keys: ['name']

// $values: ['Desk']
```

<a name="method-array-dot"></a>
#### `Arr::dot()` {.collection-method}

Phương thức `Arr::dot` làm phẳng một mảng đa chiều thành mảng một cấp, sử dụng ký pháp "dot" để biểu thị độ sâu:

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$flattened = Arr::dot($array);

// ['products.desk.price' => 100]
```

<a name="method-array-every"></a>
#### `Arr::every()` {.collection-method}

Phương thức `Arr::every` kiểm tra rằng tất cả giá trị trong mảng đều thỏa điều kiện kiểm tra đã cho:

```php
use Illuminate\Support\Arr;

$array = [1, 2, 3];

Arr::every($array, fn ($i) => $i > 0);

// true

Arr::every($array, fn ($i) => $i > 2);

// false
```

<a name="method-array-except"></a>
#### `Arr::except()` {.collection-method}

Phương thức `Arr::except` loại bỏ các cặp khóa / giá trị đã chỉ định khỏi mảng:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$filtered = Arr::except($array, ['price']);

// ['name' => 'Desk']
```

<a name="method-array-except-values"></a>
#### `Arr::exceptValues()` {.collection-method}

Phương thức `Arr::exceptValues` loại bỏ các giá trị đã chỉ định khỏi mảng:

```php
use Illuminate\Support\Arr;

$array = ['foo', 'bar', 'baz', 'qux'];

$filtered = Arr::exceptValues($array, ['foo', 'baz']);

// ['bar', 'qux']
```

Bạn cũng có thể truyền `true` cho tham số `strict` để sử dụng phép so sánh kiểu nghiêm ngặt khi lọc:

```php
use Illuminate\Support\Arr;

$array = [1, '1', 2, '2'];

$filtered = Arr::exceptValues($array, [1, 2], strict: true);

// ['1', '2']
```

<a name="method-array-exists"></a>
#### `Arr::exists()` {.collection-method}

Phương thức `Arr::exists` kiểm tra khóa đã cho có tồn tại trong mảng hay không:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'John Doe', 'age' => 17];

$exists = Arr::exists($array, 'name');

// true

$exists = Arr::exists($array, 'salary');

// false
```

<a name="method-array-first"></a>
#### `Arr::first()` {.collection-method}

Phương thức `Arr::first` trả về phần tử đầu tiên của mảng thỏa điều kiện kiểm tra đã cho:

```php
use Illuminate\Support\Arr;

$array = [100, 200, 300];

$first = Arr::first($array, function (int $value, int $key) {
    return $value >= 150;
});

// 200
```

Bạn cũng có thể truyền giá trị mặc định làm tham số thứ ba. Giá trị này sẽ được trả về nếu không có phần tử nào thỏa điều kiện kiểm tra:

```php
use Illuminate\Support\Arr;

$first = Arr::first($array, $callback, $default);
```

<a name="method-array-flatten"></a>
#### `Arr::flatten()` {.collection-method}

Phương thức `Arr::flatten` làm phẳng một mảng đa chiều thành mảng một cấp:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$flattened = Arr::flatten($array);

// ['Joe', 'PHP', 'Ruby']
```

<a name="method-array-float"></a>
#### `Arr::float()` {.collection-method}

Phương thức `Arr::float` lấy một giá trị từ mảng lồng sâu bằng ký pháp "dot" (tương tự [Arr::get()](#method-array-get)), nhưng sẽ ném `InvalidArgumentException` nếu giá trị được yêu cầu không phải là `float`:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'balance' => 123.45];

$value = Arr::float($array, 'balance');

// 123.45

$value = Arr::float($array, 'name');

// throws InvalidArgumentException
```

<a name="method-array-forget"></a>
#### `Arr::forget()` {.collection-method}

Phương thức `Arr::forget` loại bỏ các cặp khóa / giá trị đã cho khỏi mảng lồng sâu bằng ký pháp "dot":

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::forget($array, 'products.desk');

// ['products' => []]
```

<a name="method-array-from"></a>
#### `Arr::from()` {.collection-method}

Phương thức `Arr::from` chuyển đổi nhiều kiểu đầu vào thành một mảng PHP thông thường. Phương thức hỗ trợ nhiều kiểu dữ liệu, bao gồm mảng, đối tượng và một số interface Laravel phổ biến như `Arrayable`, `Enumerable`, `Jsonable` và `JsonSerializable`. Ngoài ra, nó còn xử lý các instance `Traversable` và `WeakMap`:

```php
use Illuminate\Support\Arr;

Arr::from((object) ['foo' => 'bar']); // ['foo' => 'bar']

class TestJsonableObject implements Jsonable
{
    public function toJson($options = 0)
    {
        return json_encode(['foo' => 'bar']);
    }
}

Arr::from(new TestJsonableObject); // ['foo' => 'bar']
```

<a name="method-array-get"></a>
#### `Arr::get()` {.collection-method}

Phương thức `Arr::get` lấy một giá trị từ mảng lồng sâu bằng ký pháp "dot":

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

$price = Arr::get($array, 'products.desk.price');

// 100
```

Phương thức `Arr::get` cũng chấp nhận một giá trị mặc định; giá trị này sẽ được trả về nếu khóa được chỉ định không tồn tại trong mảng:

```php
use Illuminate\Support\Arr;

$discount = Arr::get($array, 'products.desk.discount', 0);

// 0
```

<a name="method-array-has"></a>
#### `Arr::has()` {.collection-method}

Phương thức `Arr::has` kiểm tra một hoặc nhiều phần tử có tồn tại trong mảng bằng ký pháp "dot" hay không:

```php
use Illuminate\Support\Arr;

$array = ['product' => ['name' => 'Desk', 'price' => 100]];

$contains = Arr::has($array, 'product.name');

// true

$contains = Arr::has($array, ['product.price', 'product.discount']);

// false
```

<a name="method-array-hasall"></a>
#### `Arr::hasAll()` {.collection-method}

Phương thức `Arr::hasAll` xác định tất cả các khóa được chỉ định có tồn tại trong mảng bằng ký pháp "dot" hay không:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Taylor', 'language' => 'PHP'];

Arr::hasAll($array, ['name']); // true
Arr::hasAll($array, ['name', 'language']); // true
Arr::hasAll($array, ['name', 'IDE']); // false
```

<a name="method-array-hasany"></a>
#### `Arr::hasAny()` {.collection-method}

Phương thức `Arr::hasAny` kiểm tra có bất kỳ phần tử nào trong tập khóa đã cho tồn tại trong mảng bằng ký pháp "dot" hay không:

```php
use Illuminate\Support\Arr;

$array = ['product' => ['name' => 'Desk', 'price' => 100]];

$contains = Arr::hasAny($array, 'product.name');

// true

$contains = Arr::hasAny($array, ['product.name', 'product.discount']);

// true

$contains = Arr::hasAny($array, ['category', 'product.discount']);

// false
```

<a name="method-array-integer"></a>
#### `Arr::integer()` {.collection-method}

Phương thức `Arr::integer` lấy một giá trị từ mảng lồng sâu bằng ký pháp "dot" (tương tự [Arr::get()](#method-array-get)), nhưng sẽ ném `InvalidArgumentException` nếu giá trị được yêu cầu không phải là `int`:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'age' => 42];

$value = Arr::integer($array, 'age');

// 42

$value = Arr::integer($array, 'name');

// throws InvalidArgumentException
```

<a name="method-array-isassoc"></a>
#### `Arr::isAssoc()` {.collection-method}

Phương thức `Arr::isAssoc` trả về `true` nếu mảng đã cho là mảng kết hợp. Một mảng được xem là "kết hợp" khi các khóa số của nó không liên tiếp bắt đầu từ 0:

```php
use Illuminate\Support\Arr;

$isAssoc = Arr::isAssoc(['product' => ['name' => 'Desk', 'price' => 100]]);

// true

$isAssoc = Arr::isAssoc([1, 2, 3]);

// false
```

<a name="method-array-islist"></a>
#### `Arr::isList()` {.collection-method}

Phương thức `Arr::isList` trả về `true` nếu các khóa của mảng là các số nguyên liên tiếp bắt đầu từ 0:

```php
use Illuminate\Support\Arr;

$isList = Arr::isList(['foo', 'bar', 'baz']);

// true

$isList = Arr::isList(['product' => ['name' => 'Desk', 'price' => 100]]);

// false
```

<a name="method-array-join"></a>
#### `Arr::join()` {.collection-method}

Phương thức `Arr::join` nối các phần tử của mảng bằng một chuỗi. Với tham số thứ ba, bạn cũng có thể chỉ định chuỗi nối riêng cho phần tử cuối cùng của mảng:

```php
use Illuminate\Support\Arr;

$array = ['Tailwind', 'Alpine', 'Laravel', 'Livewire'];

$joined = Arr::join($array, ', ');

// Tailwind, Alpine, Laravel, Livewire

$joined = Arr::join($array, ', ', ', and ');

// Tailwind, Alpine, Laravel, and Livewire
```

<a name="method-array-keyby"></a>
#### `Arr::keyBy()` {.collection-method}

Phương thức `Arr::keyBy` đánh khóa cho mảng theo khóa đã cho. Nếu nhiều phần tử có cùng khóa, chỉ phần tử cuối cùng xuất hiện trong mảng mới:

```php
use Illuminate\Support\Arr;

$array = [
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
];

$keyed = Arr::keyBy($array, 'product_id');

/*
    [
        'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

<a name="method-array-last"></a>
#### `Arr::last()` {.collection-method}

Phương thức `Arr::last` trả về phần tử cuối cùng của mảng thỏa điều kiện kiểm tra đã cho:

```php
use Illuminate\Support\Arr;

$array = [100, 200, 300, 110];

$last = Arr::last($array, function (int $value, int $key) {
    return $value >= 150;
});

// 300
```

Có thể truyền giá trị mặc định làm tham số thứ ba của phương thức. Giá trị này sẽ được trả về nếu không có phần tử nào thỏa điều kiện kiểm tra:

```php
use Illuminate\Support\Arr;

$last = Arr::last($array, $callback, $default);
```

<a name="method-array-map"></a>
#### `Arr::map()` {.collection-method}

Phương thức `Arr::map` duyệt qua mảng và truyền từng giá trị cùng khóa vào callback đã cho. Giá trị trong mảng sẽ được thay bằng giá trị mà callback trả về:

```php
use Illuminate\Support\Arr;

$array = ['first' => 'james', 'last' => 'kirk'];

$mapped = Arr::map($array, function (string $value, string $key) {
    return ucfirst($value);
});

// ['first' => 'James', 'last' => 'Kirk']
```

<a name="method-array-map-spread"></a>
#### `Arr::mapSpread()` {.collection-method}

Phương thức `Arr::mapSpread` duyệt qua mảng và truyền từng giá trị của phần tử lồng nhau vào closure đã cho. Closure có thể chỉnh sửa phần tử rồi trả về, từ đó tạo thành một mảng mới gồm các phần tử đã được biến đổi:

```php
use Illuminate\Support\Arr;

$array = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
];

$mapped = Arr::mapSpread($array, function (int $even, int $odd) {
    return $even + $odd;
});

/*
    [1, 5, 9, 13, 17]
*/
```

<a name="method-array-map-with-keys"></a>
#### `Arr::mapWithKeys()` {.collection-method}

Phương thức `Arr::mapWithKeys` duyệt qua mảng và truyền từng giá trị vào callback đã cho. Callback cần trả về một mảng kết hợp chứa một cặp khóa / giá trị duy nhất:

```php
use Illuminate\Support\Arr;

$array = [
    [
        'name' => 'John',
        'department' => 'Sales',
        'email' => 'john@example.com',
    ],
    [
        'name' => 'Jane',
        'department' => 'Marketing',
        'email' => 'jane@example.com',
    ]
];

$mapped = Arr::mapWithKeys($array, function (array $item, int $key) {
    return [$item['email'] => $item['name']];
});

/*
    [
        'john@example.com' => 'John',
        'jane@example.com' => 'Jane',
    ]
*/
```

<a name="method-array-only"></a>
#### `Arr::only()` {.collection-method}

Phương thức `Arr::only` chỉ trả về các cặp khóa / giá trị được chỉ định từ mảng đã cho:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100, 'orders' => 10];

$slice = Arr::only($array, ['name', 'price']);

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-only-values"></a>
#### `Arr::onlyValues()` {.collection-method}

Phương thức `Arr::onlyValues` chỉ trả về các giá trị được chỉ định từ mảng:

```php
use Illuminate\Support\Arr;

$array = ['foo', 'bar', 'baz', 'qux'];

$filtered = Arr::onlyValues($array, ['foo', 'baz']);

// ['foo', 'baz']
```

Bạn cũng có thể truyền `true` cho tham số `strict` để sử dụng phép so sánh kiểu nghiêm ngặt khi lọc:

```php
use Illuminate\Support\Arr;

$array = [1, '1', 2, '2'];

$filtered = Arr::onlyValues($array, [1, 2], strict: true);

// [1, 2]
```

<a name="method-array-partition"></a>
#### `Arr::partition()` {.collection-method}

Phương thức `Arr::partition` có thể kết hợp với cú pháp destructuring mảng của PHP để tách các phần tử thỏa điều kiện kiểm tra khỏi các phần tử không thỏa:

```php
<?php

use Illuminate\Support\Arr;

$numbers = [1, 2, 3, 4, 5, 6];

[$underThree, $equalOrAboveThree] = Arr::partition($numbers, function (int $i) {
    return $i < 3;
});

dump($underThree);

// [1, 2]

dump($equalOrAboveThree);

// [3, 4, 5, 6]
```

<a name="method-array-pluck"></a>
#### `Arr::pluck()` {.collection-method}

Phương thức `Arr::pluck` lấy tất cả giá trị ứng với một key nhất định từ mảng:

```php
use Illuminate\Support\Arr;

$array = [
    ['developer' => ['id' => 1, 'name' => 'Taylor']],
    ['developer' => ['id' => 2, 'name' => 'Abigail']],
];

$names = Arr::pluck($array, 'developer.name');

// ['Taylor', 'Abigail']
```

Bạn cũng có thể chỉ định cách đánh key cho danh sách kết quả:

```php
use Illuminate\Support\Arr;

$names = Arr::pluck($array, 'developer.name', 'developer.id');

// [1 => 'Taylor', 2 => 'Abigail']
```

<a name="method-array-prepend"></a>
#### `Arr::prepend()` {.collection-method}

Phương thức `Arr::prepend` thêm một phần tử vào đầu mảng:

```php
use Illuminate\Support\Arr;

$array = ['one', 'two', 'three', 'four'];

$array = Arr::prepend($array, 'zero');

// ['zero', 'one', 'two', 'three', 'four']
```

Nếu cần, bạn có thể chỉ định key sẽ được dùng cho giá trị:

```php
use Illuminate\Support\Arr;

$array = ['price' => 100];

$array = Arr::prepend($array, 'Desk', 'name');

// ['name' => 'Desk', 'price' => 100]
```

<a name="method-array-prependkeyswith"></a>
#### `Arr::prependKeysWith()` {.collection-method}

Phương thức `Arr::prependKeysWith` thêm prefix đã cho vào đầu tất cả tên key của một mảng kết hợp:

```php
use Illuminate\Support\Arr;

$array = [
    'name' => 'Desk',
    'price' => 100,
];

$keyed = Arr::prependKeysWith($array, 'product.');

/*
    [
        'product.name' => 'Desk',
        'product.price' => 100,
    ]
*/
```

<a name="method-array-pull"></a>
#### `Arr::pull()` {.collection-method}

Phương thức `Arr::pull` trả về đồng thời xóa một cặp key / value khỏi mảng:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Desk', 'price' => 100];

$name = Arr::pull($array, 'name');

// $name: Desk

// $array: ['price' => 100]
```

Có thể truyền giá trị mặc định làm tham số thứ ba. Giá trị này sẽ được trả về nếu key không tồn tại:

```php
use Illuminate\Support\Arr;

$value = Arr::pull($array, $key, $default);
```

<a name="method-array-push"></a>
#### `Arr::push()` {.collection-method}

Phương thức `Arr::push` thêm một phần tử vào mảng bằng ký pháp "dot". Nếu tại key đã cho chưa có mảng, mảng đó sẽ được tạo:

```php
use Illuminate\Support\Arr;

$array = [];

Arr::push($array, 'office.furniture', 'Desk');

// $array: ['office' => ['furniture' => ['Desk']]]
```

<a name="method-array-query"></a>
#### `Arr::query()` {.collection-method}

Phương thức `Arr::query` chuyển mảng thành query string:

```php
use Illuminate\Support\Arr;

$array = [
    'name' => 'Taylor',
    'order' => [
        'column' => 'created_at',
        'direction' => 'desc'
    ]
];

Arr::query($array);

// name=Taylor&order[column]=created_at&order[direction]=desc
```

<a name="method-array-random"></a>
#### `Arr::random()` {.collection-method}

Phương thức `Arr::random` trả về một giá trị ngẫu nhiên từ mảng:

```php
use Illuminate\Support\Arr;

$array = [1, 2, 3, 4, 5];

$random = Arr::random($array);

// 4 - (retrieved randomly)
```

Bạn cũng có thể chỉ định số lượng phần tử cần trả về bằng tham số thứ hai tùy chọn. Lưu ý rằng khi truyền tham số này, phương thức luôn trả về một mảng ngay cả khi chỉ yêu cầu một phần tử:

```php
use Illuminate\Support\Arr;

$items = Arr::random($array, 2);

// [2, 5] - (retrieved randomly)
```

<a name="method-array-reject"></a>
#### `Arr::reject()` {.collection-method}

Phương thức `Arr::reject` loại các phần tử khỏi mảng bằng closure đã cho:

```php
use Illuminate\Support\Arr;

$array = [100, '200', 300, '400', 500];

$filtered = Arr::reject($array, function (string|int $value, int $key) {
    return is_string($value);
});

// [0 => 100, 2 => 300, 4 => 500]
```

<a name="method-array-select"></a>
#### `Arr::select()` {.collection-method}

Phương thức `Arr::select` chọn một tập các giá trị từ mảng:

```php
use Illuminate\Support\Arr;

$array = [
    ['id' => 1, 'name' => 'Desk', 'price' => 200],
    ['id' => 2, 'name' => 'Table', 'price' => 150],
    ['id' => 3, 'name' => 'Chair', 'price' => 300],
];

Arr::select($array, ['name', 'price']);

// [['name' => 'Desk', 'price' => 200], ['name' => 'Table', 'price' => 150], ['name' => 'Chair', 'price' => 300]]
```

<a name="method-array-set"></a>
#### `Arr::set()` {.collection-method}

Phương thức `Arr::set` gán một giá trị trong mảng lồng sâu bằng ký pháp "dot":

```php
use Illuminate\Support\Arr;

$array = ['products' => ['desk' => ['price' => 100]]];

Arr::set($array, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

<a name="method-array-shuffle"></a>
#### `Arr::shuffle()` {.collection-method}

Phương thức `Arr::shuffle` xáo trộn ngẫu nhiên các phần tử trong mảng:

```php
use Illuminate\Support\Arr;

$array = Arr::shuffle([1, 2, 3, 4, 5]);

// [3, 2, 5, 1, 4] - (generated randomly)
```

<a name="method-array-sole"></a>
#### `Arr::sole()` {.collection-method}

Phương thức `Arr::sole` lấy duy nhất một giá trị từ mảng bằng closure đã cho. Nếu có nhiều hơn một giá trị trong mảng thỏa điều kiện kiểm tra, exception `Illuminate\Support\MultipleItemsFoundException` sẽ được ném ra. Nếu không có giá trị nào thỏa điều kiện, exception `Illuminate\Support\ItemNotFoundException` sẽ được ném ra:

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$value = Arr::sole($array, fn (string $value) => $value === 'Desk');

// 'Desk'
```

<a name="method-array-some"></a>
#### `Arr::some()` {.collection-method}

Phương thức `Arr::some` kiểm tra rằng có ít nhất một giá trị trong mảng thỏa điều kiện đã cho:

```php
use Illuminate\Support\Arr;

$array = [1, 2, 3];

Arr::some($array, fn ($i) => $i > 2);

// true
```

<a name="method-array-sort"></a>
#### `Arr::sort()` {.collection-method}

Phương thức `Arr::sort` sắp xếp mảng theo các giá trị của nó:

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sort($array);

// ['Chair', 'Desk', 'Table']
```

Bạn cũng có thể sắp xếp mảng theo kết quả của closure đã cho:

```php
use Illuminate\Support\Arr;

$array = [
    ['name' => 'Desk'],
    ['name' => 'Table'],
    ['name' => 'Chair'],
];

$sorted = array_values(Arr::sort($array, function (array $value) {
    return $value['name'];
}));

/*
    [
        ['name' => 'Chair'],
        ['name' => 'Desk'],
        ['name' => 'Table'],
    ]
*/
```

<a name="method-array-sort-desc"></a>
#### `Arr::sortDesc()` {.collection-method}

Phương thức `Arr::sortDesc` sắp xếp mảng theo giá trị theo thứ tự giảm dần:

```php
use Illuminate\Support\Arr;

$array = ['Desk', 'Table', 'Chair'];

$sorted = Arr::sortDesc($array);

// ['Table', 'Desk', 'Chair']
```

Bạn cũng có thể sắp xếp mảng theo kết quả của closure đã cho:

```php
use Illuminate\Support\Arr;

$array = [
    ['name' => 'Desk'],
    ['name' => 'Table'],
    ['name' => 'Chair'],
];

$sorted = array_values(Arr::sortDesc($array, function (array $value) {
    return $value['name'];
}));

/*
    [
        ['name' => 'Table'],
        ['name' => 'Desk'],
        ['name' => 'Chair'],
    ]
*/
```

<a name="method-array-sort-recursive"></a>
#### `Arr::sortRecursive()` {.collection-method}

Phương thức `Arr::sortRecursive` sắp xếp mảng theo cách đệ quy, sử dụng hàm `sort` cho các mảng con có index dạng số và hàm `ksort` cho các mảng con kết hợp:

```php
use Illuminate\Support\Arr;

$array = [
    ['Roman', 'Taylor', 'Li'],
    ['PHP', 'Ruby', 'JavaScript'],
    ['one' => 1, 'two' => 2, 'three' => 3],
];

$sorted = Arr::sortRecursive($array);

/*
    [
        ['JavaScript', 'PHP', 'Ruby'],
        ['one' => 1, 'three' => 3, 'two' => 2],
        ['Li', 'Roman', 'Taylor'],
    ]
*/
```

Nếu muốn kết quả được sắp xếp giảm dần, bạn có thể sử dụng phương thức `Arr::sortRecursiveDesc`.

```php
$sorted = Arr::sortRecursiveDesc($array);
```

<a name="method-array-string"></a>
#### `Arr::string()` {.collection-method}

Phương thức `Arr::string` lấy một giá trị từ mảng lồng sâu bằng ký pháp "dot" (tương tự [Arr::get()](#method-array-get)), nhưng sẽ ném `InvalidArgumentException` nếu giá trị được yêu cầu không phải là `string`:

```php
use Illuminate\Support\Arr;

$array = ['name' => 'Joe', 'languages' => ['PHP', 'Ruby']];

$value = Arr::string($array, 'name');

// Joe

$value = Arr::string($array, 'languages');

// throws InvalidArgumentException
```

<a name="method-array-take"></a>
#### `Arr::take()` {.collection-method}

Phương thức `Arr::take` trả về một mảng mới với số lượng phần tử được chỉ định:

```php
use Illuminate\Support\Arr;

$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, 3);

// [0, 1, 2]
```

Bạn cũng có thể truyền số nguyên âm để lấy số lượng phần tử tương ứng tính từ cuối mảng:

```php
$array = [0, 1, 2, 3, 4, 5];

$chunk = Arr::take($array, -2);

// [4, 5]
```

<a name="method-array-to-css-classes"></a>
#### `Arr::toCssClasses()` {.collection-method}

Phương thức `Arr::toCssClasses` biên dịch có điều kiện một chuỗi CSS class. Phương thức nhận một mảng class, trong đó key chứa class hoặc các class bạn muốn thêm, còn value là một biểu thức boolean. Nếu phần tử mảng có key dạng số, phần tử đó luôn được đưa vào danh sách class được render:

```php
use Illuminate\Support\Arr;

$isActive = false;
$hasError = true;

$array = ['p-4', 'font-bold' => $isActive, 'bg-red' => $hasError];

$classes = Arr::toCssClasses($array);

/*
    'p-4 bg-red'
*/
```

<a name="method-array-to-css-styles"></a>
#### `Arr::toCssStyles()` {.collection-method}

Phương thức `Arr::toCssStyles` biên dịch có điều kiện một chuỗi CSS style. Phương thức nhận một mảng khai báo CSS, trong đó key chứa khai báo CSS bạn muốn thêm, còn value là một biểu thức boolean. Nếu phần tử mảng có key dạng số, phần tử đó luôn được đưa vào chuỗi CSS style đã biên dịch:

```php
use Illuminate\Support\Arr;

$hasColor = true;

$array = ['background-color: blue', 'color: blue' => $hasColor];

$classes = Arr::toCssStyles($array);

/*
    'background-color: blue; color: blue;'
*/
```

Phương thức này là nền tảng cho khả năng [merge class với attribute bag của Blade component](/docs/{{version}}/blade#conditionally-merge-classes), cũng như [Blade directive](/docs/{{version}}/blade#conditional-classes) `@class` của Laravel.

<a name="method-array-undot"></a>
#### `Arr::undot()` {.collection-method}

Phương thức `Arr::undot` mở rộng một mảng một chiều sử dụng ký pháp "dot" thành mảng đa chiều:

```php
use Illuminate\Support\Arr;

$array = [
    'user.name' => 'Kevin Malone',
    'user.occupation' => 'Accountant',
];

$array = Arr::undot($array);

// ['user' => ['name' => 'Kevin Malone', 'occupation' => 'Accountant']]
```

<a name="method-array-where"></a>
#### `Arr::where()` {.collection-method}

Phương thức `Arr::where` lọc mảng bằng closure đã cho:

```php
use Illuminate\Support\Arr;

$array = [100, '200', 300, '400', 500];

$filtered = Arr::where($array, function (string|int $value, int $key) {
    return is_string($value);
});

// [1 => '200', 3 => '400']
```

<a name="method-array-where-not-null"></a>
#### `Arr::whereNotNull()` {.collection-method}

Phương thức `Arr::whereNotNull` loại bỏ tất cả giá trị `null` khỏi mảng đã cho:

```php
use Illuminate\Support\Arr;

$array = [0, null];

$filtered = Arr::whereNotNull($array);

// [0 => 0]
```

<a name="method-array-wrap"></a>
#### `Arr::wrap()` {.collection-method}

Phương thức `Arr::wrap` bọc giá trị đã cho trong một mảng. Nếu giá trị đó vốn đã là mảng, nó sẽ được trả về mà không thay đổi:

```php
use Illuminate\Support\Arr;

$string = 'Laravel';

$array = Arr::wrap($string);

// ['Laravel']
```

Nếu giá trị đã cho là `null`, một mảng rỗng sẽ được trả về:

```php
use Illuminate\Support\Arr;

$array = Arr::wrap(null);

// []
```

<a name="method-data-fill"></a>
#### `data_fill()` {.collection-method}

Hàm `data_fill` gán một giá trị còn thiếu trong mảng hoặc object lồng nhau bằng ký pháp "dot":

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_fill($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 100]]]

data_fill($data, 'products.desk.discount', 10);

// ['products' => ['desk' => ['price' => 100, 'discount' => 10]]]
```

Hàm này cũng chấp nhận dấu hoa thị làm wildcard và sẽ điền giá trị vào các target tương ứng:

```php
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2'],
    ],
];

data_fill($data, 'products.*.price', 200);

/*
    [
        'products' => [
            ['name' => 'Desk 1', 'price' => 100],
            ['name' => 'Desk 2', 'price' => 200],
        ],
    ]
*/
```

<a name="method-data-get"></a>
#### `data_get()` {.collection-method}

Hàm `data_get` lấy một giá trị từ mảng hoặc object lồng nhau bằng ký pháp "dot":

```php
$data = ['products' => ['desk' => ['price' => 100]]];

$price = data_get($data, 'products.desk.price');

// 100
```

Hàm `data_get` cũng chấp nhận một giá trị mặc định; giá trị này sẽ được trả về nếu không tìm thấy key được chỉ định:

```php
$discount = data_get($data, 'products.desk.discount', 0);

// 0
```

Hàm cũng chấp nhận wildcard bằng dấu hoa thị, có thể khớp với bất kỳ key nào của mảng hoặc object:

```php
$data = [
    'product-one' => ['name' => 'Desk 1', 'price' => 100],
    'product-two' => ['name' => 'Desk 2', 'price' => 150],
];

data_get($data, '*.name');

// ['Desk 1', 'Desk 2'];
```

Có thể sử dụng placeholder `{first}` và `{last}` để lấy phần tử đầu tiên hoặc cuối cùng trong mảng:

```php
$flight = [
    'segments' => [
        ['from' => 'LHR', 'departure' => '9:00', 'to' => 'IST', 'arrival' => '15:00'],
        ['from' => 'IST', 'departure' => '16:00', 'to' => 'PKX', 'arrival' => '20:00'],
    ],
];

data_get($flight, 'segments.{first}.arrival');

// 15:00
```

<a name="method-data-set"></a>
#### `data_set()` {.collection-method}

Hàm `data_set` gán một giá trị trong mảng hoặc object lồng nhau bằng ký pháp "dot":

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200);

// ['products' => ['desk' => ['price' => 200]]]
```

Hàm này cũng chấp nhận wildcard bằng dấu hoa thị và sẽ gán giá trị trên các target tương ứng:

```php
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2', 'price' => 150],
    ],
];

data_set($data, 'products.*.price', 200);

/*
    [
        'products' => [
            ['name' => 'Desk 1', 'price' => 200],
            ['name' => 'Desk 2', 'price' => 200],
        ],
    ]
*/
```

Mặc định, mọi giá trị hiện có sẽ bị ghi đè. Nếu chỉ muốn gán khi giá trị chưa tồn tại, bạn có thể truyền `false` làm tham số thứ tư của hàm:

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_set($data, 'products.desk.price', 200, overwrite: false);

// ['products' => ['desk' => ['price' => 100]]]
```

<a name="method-data-forget"></a>
#### `data_forget()` {.collection-method}

Hàm `data_forget` xóa một giá trị trong mảng hoặc object lồng nhau bằng ký pháp "dot":

```php
$data = ['products' => ['desk' => ['price' => 100]]];

data_forget($data, 'products.desk.price');

// ['products' => ['desk' => []]]
```

Hàm này cũng chấp nhận wildcard bằng dấu hoa thị và sẽ xóa giá trị trên các target tương ứng:

```php
$data = [
    'products' => [
        ['name' => 'Desk 1', 'price' => 100],
        ['name' => 'Desk 2', 'price' => 150],
    ],
];

data_forget($data, 'products.*.price');

/*
    [
        'products' => [
            ['name' => 'Desk 1'],
            ['name' => 'Desk 2'],
        ],
    ]
*/
```

<a name="method-head"></a>
#### `head()` {.collection-method}

Hàm `head` trả về phần tử đầu tiên trong mảng đã cho. Nếu mảng rỗng, `false` sẽ được trả về:

```php
$array = [100, 200, 300];

$first = head($array);

// 100
```

<a name="method-last"></a>
#### `last()` {.collection-method}

Hàm `last` trả về phần tử cuối cùng trong mảng đã cho. Nếu mảng rỗng, `false` sẽ được trả về:

```php
$array = [100, 200, 300];

$last = last($array);

// 300
```

<a name="numbers"></a>
## Số

<a name="method-number-abbreviate"></a>
#### `Number::abbreviate()` {.collection-method}

Phương thức `Number::abbreviate` trả về dạng dễ đọc của giá trị số đã cho, với đơn vị được viết tắt:

```php
use Illuminate\Support\Number;

$number = Number::abbreviate(1000);

// 1K

$number = Number::abbreviate(489939);

// 490K

$number = Number::abbreviate(1230000, precision: 2);

// 1.23M
```

<a name="method-number-clamp"></a>
#### `Number::clamp()` {.collection-method}

Phương thức `Number::clamp` đảm bảo một số luôn nằm trong khoảng được chỉ định. Nếu số nhỏ hơn giá trị tối thiểu, giá trị tối thiểu sẽ được trả về. Nếu số lớn hơn giá trị tối đa, giá trị tối đa sẽ được trả về:

```php
use Illuminate\Support\Number;

$number = Number::clamp(105, min: 10, max: 100);

// 100

$number = Number::clamp(5, min: 10, max: 100);

// 10

$number = Number::clamp(10, min: 10, max: 100);

// 10

$number = Number::clamp(20, min: 10, max: 100);

// 20
```

<a name="method-number-currency"></a>
#### `Number::currency()` {.collection-method}

Phương thức `Number::currency` trả về biểu diễn tiền tệ của giá trị đã cho dưới dạng chuỗi:

```php
use Illuminate\Support\Number;

$currency = Number::currency(1000);

// $1,000.00

$currency = Number::currency(1000, in: 'EUR');

// €1,000.00

$currency = Number::currency(1000, in: 'EUR', locale: 'de');

// 1.000,00 €

$currency = Number::currency(1000, in: 'EUR', locale: 'de', precision: 0);

// 1.000 €
```

<a name="method-default-currency"></a>
#### `Number::defaultCurrency()` {.collection-method}

Phương thức `Number::defaultCurrency` trả về loại tiền tệ mặc định đang được class `Number` sử dụng:

```php
use Illuminate\Support\Number;

$currency = Number::defaultCurrency();

// USD
```

<a name="method-default-locale"></a>
#### `Number::defaultLocale()` {.collection-method}

Phương thức `Number::defaultLocale` trả về locale mặc định đang được class `Number` sử dụng:

```php
use Illuminate\Support\Number;

$locale = Number::defaultLocale();

// en
```

<a name="method-number-file-size"></a>
#### `Number::fileSize()` {.collection-method}

Phương thức `Number::fileSize` trả về biểu diễn kích thước file của giá trị byte đã cho dưới dạng chuỗi:

```php
use Illuminate\Support\Number;

$size = Number::fileSize(1024);

// 1 KB

$size = Number::fileSize(1024 * 1024);

// 1 MB

$size = Number::fileSize(1024, precision: 2);

// 1.00 KB
```

<a name="method-number-for-humans"></a>
#### `Number::forHumans()` {.collection-method}

Phương thức `Number::forHumans` trả về dạng dễ đọc của giá trị số đã cho:

```php
use Illuminate\Support\Number;

$number = Number::forHumans(1000);

// 1 thousand

$number = Number::forHumans(489939);

// 490 thousand

$number = Number::forHumans(1230000, precision: 2);

// 1.23 million
```

<a name="method-number-format"></a>
#### `Number::format()` {.collection-method}

Phương thức `Number::format` định dạng số đã cho thành chuỗi theo locale:

```php
use Illuminate\Support\Number;

$number = Number::format(100000);

// 100,000

$number = Number::format(100000, precision: 2);

// 100,000.00

$number = Number::format(100000.123, maxPrecision: 2);

// 100,000.12

$number = Number::format(100000, locale: 'de');

// 100.000
```

<a name="method-number-ordinal"></a>
#### `Number::ordinal()` {.collection-method}

Phương thức `Number::ordinal` trả về biểu diễn số thứ tự của một số:

```php
use Illuminate\Support\Number;

$number = Number::ordinal(1);

// 1st

$number = Number::ordinal(2);

// 2nd

$number = Number::ordinal(21);

// 21st
```

<a name="method-number-pairs"></a>
#### `Number::pairs()` {.collection-method}

Phương thức `Number::pairs` tạo một mảng các cặp số (các khoảng con) dựa trên khoảng và bước nhảy được chỉ định. Phương thức này hữu ích khi chia một khoảng số lớn thành các khoảng con nhỏ, dễ quản lý hơn, chẳng hạn cho phân trang hoặc xử lý tác vụ theo batch. Phương thức `pairs` trả về một mảng các mảng, trong đó mỗi mảng con biểu diễn một cặp (khoảng con) số:

```php
use Illuminate\Support\Number;

$result = Number::pairs(25, 10);

// [[0, 9], [10, 19], [20, 25]]

$result = Number::pairs(25, 10, offset: 0);

// [[0, 10], [10, 20], [20, 25]]
```

<a name="method-number-parse"></a>
#### `Number::parse()` {.collection-method}

Phương thức `Number::parse` phân tích một chuỗi số đã được bản địa hóa bằng `NumberFormatter` của PHP:

```php
use Illuminate\Support\Number;

$result = Number::parse('10,123', locale: 'en');

// 10123.0

$result = Number::parse('10,123', locale: 'fr');

// 10.123
```

<a name="method-number-parse-int"></a>
#### `Number::parseInt()` {.collection-method}

Phương thức `Number::parseInt` phân tích một chuỗi thành số nguyên theo locale được chỉ định:

```php
use Illuminate\Support\Number;

$result = Number::parseInt('10.123');

// (int) 10

$result = Number::parseInt('10,123', locale: 'fr');

// (int) 10
```

<a name="method-number-parse-float"></a>
#### `Number::parseFloat()` {.collection-method}

Phương thức `Number::parseFloat` phân tích một chuỗi thành số thực theo locale được chỉ định:

```php
use Illuminate\Support\Number;

$result = Number::parseFloat('10');

// (float) 10.0

$result = Number::parseFloat('10', locale: 'fr');

// (float) 10.0
```

<a name="method-number-percentage"></a>
#### `Number::percentage()` {.collection-method}

Phương thức `Number::percentage` trả về biểu diễn phần trăm của giá trị đã cho dưới dạng chuỗi:

```php
use Illuminate\Support\Number;

$percentage = Number::percentage(10);

// 10%

$percentage = Number::percentage(10, precision: 2);

// 10.00%

$percentage = Number::percentage(10.123, maxPrecision: 2);

// 10.12%

$percentage = Number::percentage(10, precision: 2, locale: 'de');

// 10,00%
```

<a name="method-number-spell"></a>
#### `Number::spell()` {.collection-method}

Phương thức `Number::spell` chuyển số đã cho thành chuỗi chữ:

```php
use Illuminate\Support\Number;

$number = Number::spell(102);

// one hundred and two

$number = Number::spell(88, locale: 'fr');

// quatre-vingt-huit
```

Đối số `after` cho phép chỉ định một giá trị mà sau giá trị đó tất cả các số sẽ được viết bằng chữ:

```php
$number = Number::spell(10, after: 10);

// 10

$number = Number::spell(11, after: 10);

// eleven
```

Đối số `until` cho phép chỉ định một giá trị mà trước giá trị đó tất cả các số sẽ được viết bằng chữ:

```php
$number = Number::spell(5, until: 10);

// five

$number = Number::spell(10, until: 10);

// 10
```

<a name="method-number-spell-ordinal"></a>
#### `Number::spellOrdinal()` {.collection-method}

Phương thức `Number::spellOrdinal` trả về biểu diễn số thứ tự của số dưới dạng chuỗi chữ:

```php
use Illuminate\Support\Number;

$number = Number::spellOrdinal(1);

// first

$number = Number::spellOrdinal(2);

// second

$number = Number::spellOrdinal(21);

// twenty-first
```

<a name="method-number-trim"></a>
#### `Number::trim()` {.collection-method}

Phương thức `Number::trim` loại bỏ các chữ số 0 ở cuối phần thập phân của số đã cho:

```php
use Illuminate\Support\Number;

$number = Number::trim(12.0);

// 12

$number = Number::trim(12.30);

// 12.3
```

<a name="method-number-use-locale"></a>
#### `Number::useLocale()` {.collection-method}

Phương thức `Number::useLocale` thiết lập locale mặc định cho số trên phạm vi toàn cục, ảnh hưởng đến cách các lần gọi phương thức `Number` sau đó định dạng số và tiền tệ:

```php
use Illuminate\Support\Number;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Number::useLocale('de');
}
```

<a name="method-number-with-locale"></a>
#### `Number::withLocale()` {.collection-method}

Phương thức `Number::withLocale` thực thi closure đã cho bằng locale được chỉ định, sau đó khôi phục locale ban đầu khi callback thực thi xong:

```php
use Illuminate\Support\Number;

$number = Number::withLocale('de', function () {
    return Number::format(1500);
});
```

<a name="method-number-use-currency"></a>
#### `Number::useCurrency()` {.collection-method}

Phương thức `Number::useCurrency` thiết lập loại tiền tệ mặc định trên phạm vi toàn cục, ảnh hưởng đến cách các lần gọi phương thức `Number` sau đó định dạng tiền tệ:

```php
use Illuminate\Support\Number;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Number::useCurrency('GBP');
}
```

<a name="method-number-with-currency"></a>
#### `Number::withCurrency()` {.collection-method}

Phương thức `Number::withCurrency` thực thi closure đã cho bằng loại tiền tệ được chỉ định, sau đó khôi phục loại tiền tệ ban đầu khi callback thực thi xong:

```php
use Illuminate\Support\Number;

$number = Number::withCurrency('GBP', function () {
    // ...
});
```

<a name="paths"></a>
## Paths

<a name="method-app-path"></a>
#### `app_path()` {.collection-method}

Hàm `app_path` trả về đường dẫn đầy đủ đến thư mục `app` của ứng dụng. Bạn cũng có thể dùng `app_path` để tạo đường dẫn đầy đủ đến một file tương đối so với thư mục ứng dụng:

```php
$path = app_path();

$path = app_path('Http/Controllers/Controller.php');
```

<a name="method-base-path"></a>
#### `base_path()` {.collection-method}

Hàm `base_path` trả về đường dẫn đầy đủ đến thư mục gốc của ứng dụng. Bạn cũng có thể dùng `base_path` để tạo đường dẫn đầy đủ đến một file tương đối so với thư mục gốc của project:

```php
$path = base_path();

$path = base_path('vendor/bin');
```

<a name="method-config-path"></a>
#### `config_path()` {.collection-method}

Hàm `config_path` trả về đường dẫn đầy đủ đến thư mục `config` của ứng dụng. Bạn cũng có thể dùng `config_path` để tạo đường dẫn đầy đủ đến một file trong thư mục cấu hình của ứng dụng:

```php
$path = config_path();

$path = config_path('app.php');
```

<a name="method-database-path"></a>
#### `database_path()` {.collection-method}

Hàm `database_path` trả về đường dẫn đầy đủ đến thư mục `database` của ứng dụng. Bạn cũng có thể dùng `database_path` để tạo đường dẫn đầy đủ đến một file trong thư mục database:

```php
$path = database_path();

$path = database_path('factories/UserFactory.php');
```

<a name="method-lang-path"></a>
#### `lang_path()` {.collection-method}

Hàm `lang_path` trả về đường dẫn đầy đủ đến thư mục `lang` của ứng dụng. Bạn cũng có thể dùng `lang_path` để tạo đường dẫn đầy đủ đến một file trong thư mục này:

```php
$path = lang_path();

$path = lang_path('en/messages.php');
```

> [!NOTE]
> Theo mặc định, bộ khung ứng dụng Laravel không bao gồm thư mục `lang`. Nếu muốn tùy chỉnh các file ngôn ngữ của Laravel, bạn có thể publish chúng bằng lệnh Artisan `lang:publish`.

<a name="method-public-path"></a>
#### `public_path()` {.collection-method}

Hàm `public_path` trả về đường dẫn đầy đủ đến thư mục `public` của ứng dụng. Bạn cũng có thể dùng `public_path` để tạo đường dẫn đầy đủ đến một file trong thư mục public:

```php
$path = public_path();

$path = public_path('css/app.css');
```

<a name="method-resource-path"></a>
#### `resource_path()` {.collection-method}

Hàm `resource_path` trả về đường dẫn đầy đủ đến thư mục `resources` của ứng dụng. Bạn cũng có thể dùng `resource_path` để tạo đường dẫn đầy đủ đến một file trong thư mục resources:

```php
$path = resource_path();

$path = resource_path('sass/app.scss');
```

<a name="method-storage-path"></a>
#### `storage_path()` {.collection-method}

Hàm `storage_path` trả về đường dẫn đầy đủ đến thư mục `storage` của ứng dụng. Bạn cũng có thể dùng `storage_path` để tạo đường dẫn đầy đủ đến một file trong thư mục storage:

```php
$path = storage_path();

$path = storage_path('app/file.txt');
```

<a name="urls"></a>
## URLs

<a name="method-action"></a>
#### `action()` {.collection-method}

Hàm `action` tạo URL cho controller action đã cho:

```php
use App\Http\Controllers\HomeController;

$url = action([HomeController::class, 'index']);
```

Nếu method chấp nhận route parameter, bạn có thể truyền chúng làm đối số thứ hai cho method:

```php
$url = action([UserController::class, 'profile'], ['id' => 1]);
```

<a name="method-asset"></a>
#### `asset()` {.collection-method}

Hàm `asset` tạo URL cho một asset bằng scheme hiện tại của request (HTTP hoặc HTTPS):

```php
$url = asset('img/photo.jpg');
```

Bạn có thể cấu hình host cho URL asset bằng cách đặt biến `ASSET_URL` trong file `.env`. Điều này hữu ích khi bạn lưu asset trên một dịch vụ bên ngoài như Amazon S3 hoặc một CDN khác:

```php
// ASSET_URL=http://example.com/assets

$url = asset('img/photo.jpg'); // http://example.com/assets/img/photo.jpg
```

<a name="method-route"></a>
#### `route()` {.collection-method}

Hàm `route` tạo URL cho một [named route](/docs/{{version}}/routing#named-routes) đã cho:

```php
$url = route('route.name');
```

Nếu route chấp nhận parameter, bạn có thể truyền chúng làm đối số thứ hai cho hàm:

```php
$url = route('route.name', ['id' => 1]);
```

Theo mặc định, hàm `route` tạo URL tuyệt đối. Nếu muốn tạo URL tương đối, bạn có thể truyền `false` làm đối số thứ ba:

```php
$url = route('route.name', ['id' => 1], false);
```

<a name="method-secure-asset"></a>
#### `secure_asset()` {.collection-method}

Hàm `secure_asset` tạo URL HTTPS cho một asset:

```php
$url = secure_asset('img/photo.jpg');
```

<a name="method-secure-url"></a>
#### `secure_url()` {.collection-method}

Hàm `secure_url` tạo URL HTTPS đầy đủ đến đường dẫn đã cho. Có thể truyền thêm các segment URL trong đối số thứ hai của hàm:

```php
$url = secure_url('user/profile');

$url = secure_url('user/profile', [1]);
```

<a name="method-to-action"></a>
#### `to_action()` {.collection-method}

Hàm `to_action` tạo [HTTP redirect response](/docs/{{version}}/responses#redirects) cho controller action đã cho:

```php
use App\Http\Controllers\UserController;

return to_action([UserController::class, 'show'], ['user' => 1]);
```

Nếu cần, bạn có thể truyền HTTP status code cho redirect và các response header bổ sung làm đối số thứ ba và thứ tư của `to_action`:

```php
return to_action(
    [UserController::class, 'show'],
    ['user' => 1],
    302,
    ['X-Framework' => 'Laravel']
);
```

<a name="method-to-route"></a>
#### `to_route()` {.collection-method}

Hàm `to_route` tạo [HTTP redirect response](/docs/{{version}}/responses#redirects) cho một [named route](/docs/{{version}}/routing#named-routes) đã cho:

```php
return to_route('users.show', ['user' => 1]);
```

Nếu cần, bạn có thể truyền HTTP status code cho redirect và các response header bổ sung làm đối số thứ ba và thứ tư của `to_route`:

```php
return to_route('users.show', ['user' => 1], 302, ['X-Framework' => 'Laravel']);
```

<a name="method-uri"></a>
#### `uri()` {.collection-method}

Hàm `uri` tạo một [fluent URI instance](#uri) cho URI đã cho:

```php
$uri = uri('https://example.com')
    ->withPath('/users')
    ->withQuery(['page' => 1]);
```

Nếu hàm `uri` nhận một mảng chứa cặp controller callable và method, hàm sẽ tạo instance `Uri` cho route path của controller method đó:

```php
use App\Http\Controllers\UserController;

$uri = uri([UserController::class, 'show'], ['user' => $user]);
```

Nếu controller là invokable, bạn chỉ cần cung cấp tên class controller:

```php
use App\Http\Controllers\UserIndexController;

$uri = uri(UserIndexController::class);
```

Nếu giá trị truyền cho hàm `uri` khớp với tên của một [named route](/docs/{{version}}/routing#named-routes), instance `Uri` sẽ được tạo cho path của route đó:

```php
$uri = uri('users.show', ['user' => $user]);
```

<a name="method-url"></a>
#### `url()` {.collection-method}

Hàm `url` tạo URL đầy đủ đến đường dẫn đã cho:

```php
$url = url('user/profile');

$url = url('user/profile', [1]);
```

Nếu không cung cấp path, một instance `Illuminate\Routing\UrlGenerator` sẽ được trả về:

```php
$current = url()->current();

$full = url()->full();

$previous = url()->previous();
```

Để biết thêm thông tin về cách làm việc với hàm `url`, hãy tham khảo [tài liệu tạo URL](/docs/{{version}}/urls#generating-urls).

<a name="miscellaneous"></a>
## Miscellaneous

<a name="method-abort"></a>
#### `abort()` {.collection-method}

Hàm `abort` ném ra [HTTP exception](/docs/{{version}}/errors#http-exceptions), exception này sẽ được render bởi [exception handler](/docs/{{version}}/errors#handling-exceptions):

```php
abort(403);
```

Bạn cũng có thể cung cấp message của exception và các HTTP response header tùy chỉnh cần gửi đến trình duyệt:

```php
abort(403, 'Unauthorized.', $headers);
```

<a name="method-abort-if"></a>
#### `abort_if()` {.collection-method}

Hàm `abort_if` ném ra HTTP exception nếu biểu thức boolean đã cho được đánh giá là `true`:

```php
abort_if(! Auth::user()->isAdmin(), 403);
```

Tương tự method `abort`, bạn cũng có thể cung cấp nội dung response của exception làm đối số thứ ba và mảng response header tùy chỉnh làm đối số thứ tư cho hàm.

<a name="method-abort-unless"></a>
#### `abort_unless()` {.collection-method}

Hàm `abort_unless` ném ra HTTP exception nếu biểu thức boolean đã cho được đánh giá là `false`:

```php
abort_unless(Auth::user()->isAdmin(), 403);
```

Tương tự method `abort`, bạn cũng có thể cung cấp nội dung response của exception làm đối số thứ ba và mảng response header tùy chỉnh làm đối số thứ tư cho hàm.

<a name="method-app"></a>
#### `app()` {.collection-method}

Hàm `app` trả về instance [service container](/docs/{{version}}/container):

```php
$container = app();
```

Bạn có thể truyền tên class hoặc interface để resolve nó từ container:

```php
$api = app('HelpSpot\API');
```

<a name="method-auth"></a>
#### `auth()` {.collection-method}

Hàm `auth` trả về một instance [authenticator](/docs/{{version}}/authentication). Bạn có thể dùng hàm này thay cho facade `Auth`:

```php
$user = auth()->user();
```

Nếu cần, bạn có thể chỉ định instance guard muốn truy cập:

```php
$user = auth('admin')->user();
```

<a name="method-back"></a>
#### `back()` {.collection-method}

Hàm `back` tạo [HTTP redirect response](/docs/{{version}}/responses#redirects) về vị trí trước đó của người dùng:

```php
return back($status = 302, $headers = [], $fallback = '/');

return back();
```

<a name="method-bcrypt"></a>
#### `bcrypt()` {.collection-method}

Hàm `bcrypt` [hash](/docs/{{version}}/hashing) giá trị đã cho bằng Bcrypt. Bạn có thể dùng hàm này thay cho facade `Hash`:

```php
$password = bcrypt('my-secret-password');
```

<a name="method-blank"></a>
#### `blank()` {.collection-method}

Hàm `blank` xác định giá trị đã cho có "trống" hay không:

```php
blank('');
blank('   ');
blank(null);
blank(collect());

// true

blank(0);
blank(true);
blank(false);

// false
```

Để kiểm tra điều kiện ngược lại với `blank`, hãy xem hàm [filled](#method-filled).

<a name="method-broadcast"></a>
#### `broadcast()` {.collection-method}

Hàm `broadcast` [broadcast](/docs/{{version}}/broadcasting) [event](/docs/{{version}}/events) đã cho đến các listener của nó:

```php
broadcast(new UserRegistered($user));

broadcast(new UserRegistered($user))->toOthers();
```

<a name="method-broadcast-if"></a>
#### `broadcast_if()` {.collection-method}

Hàm `broadcast_if` [broadcast](/docs/{{version}}/broadcasting) [event](/docs/{{version}}/events) đã cho đến các listener nếu biểu thức boolean được đánh giá là `true`:

```php
broadcast_if($user->isActive(), new UserRegistered($user));

broadcast_if($user->isActive(), new UserRegistered($user))->toOthers();
```

<a name="method-broadcast-unless"></a>
#### `broadcast_unless()` {.collection-method}

Hàm `broadcast_unless` [broadcast](/docs/{{version}}/broadcasting) [event](/docs/{{version}}/events) đã cho đến các listener nếu biểu thức boolean được đánh giá là `false`:

```php
broadcast_unless($user->isBanned(), new UserRegistered($user));

broadcast_unless($user->isBanned(), new UserRegistered($user))->toOthers();
```

<a name="method-cache"></a>
#### `cache()` {.collection-method}

Hàm `cache` có thể được dùng để lấy giá trị từ [cache](/docs/{{version}}/cache). Nếu key đã cho không tồn tại trong cache, giá trị mặc định tùy chọn sẽ được trả về:

```php
$value = cache('key');

$value = cache('key', 'default');
```

Bạn có thể thêm item vào cache bằng cách truyền một mảng các cặp key / value cho hàm. Đồng thời, hãy truyền số giây hoặc khoảng thời gian mà giá trị cache được xem là hợp lệ:

```php
cache(['key' => 'value'], 300);

cache(['key' => 'value'], now()->plus(seconds: 10));
```

<a name="method-class-uses-recursive"></a>
#### `class_uses_recursive()` {.collection-method}

Hàm `class_uses_recursive` trả về tất cả trait được một class sử dụng, bao gồm cả các trait được sử dụng bởi mọi class cha của nó:

```php
$traits = class_uses_recursive(App\Models\User::class);
```

<a name="method-collect"></a>
#### `collect()` {.collection-method}

Hàm `collect` tạo một instance [collection](/docs/{{version}}/collections) từ giá trị đã cho:

```php
$collection = collect(['Taylor', 'Abigail']);
```

<a name="method-config"></a>
#### `config()` {.collection-method}

Hàm `config` lấy giá trị của một biến [configuration](/docs/{{version}}/configuration). Có thể truy cập giá trị cấu hình bằng cú pháp "dot", gồm tên file và option muốn truy cập. Bạn cũng có thể cung cấp giá trị mặc định để trả về nếu option cấu hình không tồn tại:

```php
$value = config('app.timezone');

$value = config('app.timezone', $default);
```

Bạn có thể thiết lập biến cấu hình tại runtime bằng cách truyền một mảng các cặp key / value. Tuy nhiên, hàm này chỉ ảnh hưởng đến giá trị cấu hình của request hiện tại và không cập nhật các giá trị cấu hình thực tế:

```php
config(['app.debug' => true]);
```

<a name="method-context"></a>
#### `context()` {.collection-method}

Hàm `context` lấy giá trị từ [context](/docs/{{version}}/context) hiện tại. Bạn cũng có thể cung cấp giá trị mặc định để trả về nếu context key không tồn tại:

```php
$value = context('trace_id');

$value = context('trace_id', $default);
```

Bạn có thể thiết lập các giá trị context bằng cách truyền một mảng các cặp key / value:

```php
use Illuminate\Support\Str;

context(['trace_id' => Str::uuid()->toString()]);
```

<a name="method-cookie"></a>
#### `cookie()` {.collection-method}

Hàm `cookie` tạo một instance [cookie](/docs/{{version}}/requests#cookies) mới:

```php
$cookie = cookie('name', 'value', $minutes);
```

<a name="method-csrf-field"></a>
#### `csrf_field()` {.collection-method}

Hàm `csrf_field` tạo một input HTML `hidden` chứa giá trị CSRF token. Ví dụ, khi dùng [cú pháp Blade](/docs/{{version}}/blade):

```blade
{{ csrf_field() }}
```

<a name="method-csrf-token"></a>
#### `csrf_token()` {.collection-method}

Hàm `csrf_token` lấy giá trị CSRF token hiện tại:

```php
$token = csrf_token();
```

<a name="method-decrypt"></a>
#### `decrypt()` {.collection-method}

Hàm `decrypt` [giải mã](/docs/{{version}}/encryption) giá trị đã cho. Bạn có thể dùng hàm này thay cho facade `Crypt`:

```php
$password = decrypt($value);
```

Để thực hiện thao tác ngược với `decrypt`, hãy xem hàm [encrypt](#method-encrypt).

<a name="method-dd"></a>
#### `dd()` {.collection-method}

Hàm `dd` dump các biến đã cho và kết thúc việc thực thi script:

```php
dd($value);

dd($value1, $value2, $value3, ...);
```

Nếu không muốn dừng việc thực thi script, hãy dùng hàm [dump](#method-dump) thay thế.

<a name="method-dispatch"></a>
#### `dispatch()` {.collection-method}

Hàm `dispatch` đẩy [job](/docs/{{version}}/queues#creating-jobs) đã cho vào [job queue](/docs/{{version}}/queues) của Laravel:

```php
dispatch(new App\Jobs\SendEmails);
```

<a name="method-dispatch-sync"></a>
#### `dispatch_sync()` {.collection-method}

Hàm `dispatch_sync` đẩy job đã cho vào queue [sync](/docs/{{version}}/queues#synchronous-dispatching) để được xử lý ngay lập tức:

```php
dispatch_sync(new App\Jobs\SendEmails);
```

<a name="method-dump"></a>
#### `dump()` {.collection-method}

Hàm `dump` dump các biến đã cho:

```php
dump($value);

dump($value1, $value2, $value3, ...);
```

Nếu muốn dừng thực thi script sau khi dump các biến, hãy dùng hàm [dd](#method-dd) thay thế.

<a name="method-encrypt"></a>
#### `encrypt()` {.collection-method}

Hàm `encrypt` [mã hóa](/docs/{{version}}/encryption) giá trị đã cho. Bạn có thể dùng hàm này thay cho facade `Crypt`:

```php
$secret = encrypt('my-secret-value');
```

Để thực hiện thao tác ngược với `encrypt`, hãy xem hàm [decrypt](#method-decrypt).

<a name="method-env"></a>
#### `env()` {.collection-method}

Hàm `env` lấy giá trị của một [biến môi trường](/docs/{{version}}/configuration#environment-configuration) hoặc trả về giá trị mặc định:

```php
$env = env('APP_ENV');

$env = env('APP_ENV', 'production');
```

> [!WARNING]
> Nếu chạy lệnh `config:cache` trong quá trình deployment, hãy bảo đảm chỉ gọi hàm `env` từ bên trong các file cấu hình. Khi cấu hình đã được cache, file `.env` sẽ không được load và mọi lời gọi `env` sẽ trả về các biến môi trường bên ngoài như biến cấp server, cấp hệ thống hoặc `null`.

<a name="method-event"></a>
#### `event()` {.collection-method}

Hàm `event` dispatch [event](/docs/{{version}}/events) đã cho đến các listener của nó:

```php
event(new UserRegistered($user));
```

<a name="method-fake"></a>
#### `fake()` {.collection-method}

Hàm `fake` resolve một singleton [Faker](https://github.com/FakerPHP/Faker) từ container, hữu ích khi tạo dữ liệu giả trong model factory, database seeding, test và prototype view:

```blade
@for ($i = 0; $i < 10; $i++)
    <dl>
        <dt>Name</dt>
        <dd>{{ fake()->name() }}</dd>

        <dt>Email</dt>
        <dd>{{ fake()->unique()->safeEmail() }}</dd>
    </dl>
@endfor
```

Theo mặc định, hàm `fake` sử dụng option cấu hình `app.faker_locale` trong `config/app.php`. Thông thường option này được thiết lập qua biến môi trường `APP_FAKER_LOCALE`. Bạn cũng có thể chỉ định locale bằng cách truyền vào hàm `fake`. Mỗi locale sẽ resolve một singleton riêng:

```php
fake('nl_NL')->name()
```

<a name="method-filled"></a>
#### `filled()` {.collection-method}

Hàm `filled` xác định giá trị đã cho có không "trống" hay không:

```php
filled(0);
filled(true);
filled(false);

// true

filled('');
filled('   ');
filled(null);
filled(collect());

// false
```

Để kiểm tra điều kiện ngược lại với `filled`, hãy xem hàm [blank](#method-blank).

<a name="method-info"></a>
#### `info()` {.collection-method}

Hàm `info` sẽ ghi thông tin vào [log](/docs/{{version}}/logging) của ứng dụng:

```php
info('Some helpful information!');
```

Bạn cũng có thể truyền một mảng dữ liệu ngữ cảnh vào hàm:

```php
info('User login attempt failed.', ['id' => $user->id]);
```

<a name="method-literal"></a>
#### `literal()` {.collection-method}

Hàm `literal` tạo một instance [stdClass](https://www.php.net/manual/en/class.stdclass.php) mới, trong đó các named argument được dùng làm thuộc tính:

```php
$obj = literal(
    name: 'Joe',
    languages: ['PHP', 'Ruby'],
);

$obj->name; // 'Joe'
$obj->languages; // ['PHP', 'Ruby']
```

<a name="method-logger"></a>
#### `logger()` {.collection-method}

Hàm `logger` có thể được dùng để ghi message ở level `debug` vào [log](/docs/{{version}}/logging):

```php
logger('Debug message');
```

Bạn cũng có thể truyền một mảng dữ liệu ngữ cảnh vào hàm:

```php
logger('User has logged in.', ['id' => $user->id]);
```

Nếu không truyền giá trị vào hàm, một instance [logger](/docs/{{version}}/logging) sẽ được trả về:

```php
logger()->error('You are not allowed here.');
```

<a name="method-method-field"></a>
#### `method_field()` {.collection-method}

Hàm `method_field` tạo một input HTML `hidden` chứa giá trị giả lập HTTP verb của form. Ví dụ, khi dùng [cú pháp Blade](/docs/{{version}}/blade):

```blade
<form method="POST">
    {{ method_field('DELETE') }}
</form>
```

<a name="method-now"></a>
#### `now()` {.collection-method}

Hàm `now` tạo một instance `Illuminate\Support\Carbon` mới cho thời điểm hiện tại:

```php
$now = now();
```

<a name="method-old"></a>
#### `old()` {.collection-method}

Hàm `old` [lấy](/docs/{{version}}/requests#retrieving-input) một giá trị [old input](/docs/{{version}}/requests#old-input) đã được flash vào session:

```php
$value = old('value');

$value = old('value', 'default');
```

Vì "giá trị mặc định" truyền vào đối số thứ hai của hàm `old` thường là một thuộc tính của Eloquent model, Laravel cho phép bạn truyền trực tiếp toàn bộ Eloquent model làm đối số thứ hai. Khi đó, Laravel sẽ xem đối số thứ nhất của `old` là tên thuộc tính Eloquent cần dùng làm "giá trị mặc định":

```blade
{{ old('name', $user->name) }}

// Is equivalent to...

{{ old('name', $user) }}
```

<a name="method-once"></a>
#### `once()` {.collection-method}

Hàm `once` thực thi callback được cung cấp và cache kết quả trong bộ nhớ trong suốt vòng đời request. Các lần gọi `once` tiếp theo với cùng callback sẽ trả về kết quả đã được cache trước đó:

```php
function random(): int
{
    return once(function () {
        return random_int(1, 1000);
    });
}

random(); // 123
random(); // 123 (cached result)
random(); // 123 (cached result)
```

Khi `once` được thực thi bên trong một object instance, kết quả cache sẽ là riêng biệt cho chính instance đó:

```php
<?php

class NumberService
{
    public function all(): array
    {
        return once(fn () => [1, 2, 3]);
    }
}

$service = new NumberService;

$service->all();
$service->all(); // (cached result)

$secondService = new NumberService;

$secondService->all();
$secondService->all(); // (cached result)
```
<a name="method-optional"></a>
#### `optional()` {.collection-method}

Hàm `optional` nhận bất kỳ đối số nào và cho phép truy cập thuộc tính hoặc gọi method trên object đó. Nếu object được truyền vào là `null`, việc truy cập thuộc tính hoặc method sẽ trả về `null` thay vì gây lỗi:

```php
return optional($user->address)->street;

{!! old('name', optional($user)->name) !!}
```

Hàm `optional` cũng nhận closure làm đối số thứ hai. Closure sẽ được gọi nếu giá trị ở đối số thứ nhất không phải `null`:

```php
return optional(User::find($id), function (User $user) {
    return $user->name;
});
```

<a name="method-policy"></a>
#### `policy()` {.collection-method}

Hàm `policy` lấy instance [policy](/docs/{{version}}/authorization#creating-policies) cho class được chỉ định:

```php
$policy = policy(App\Models\User::class);
```

<a name="method-redirect"></a>
#### `redirect()` {.collection-method}

Hàm `redirect` trả về một [HTTP redirect response](/docs/{{version}}/responses#redirects), hoặc trả về redirector instance nếu được gọi không có đối số:

```php
return redirect($to = null, $status = 302, $headers = [], $secure = null);

return redirect('/home');

return redirect()->route('route.name');
```

<a name="method-report"></a>
#### `report()` {.collection-method}

Hàm `report` báo cáo exception thông qua [exception handler](/docs/{{version}}/errors#handling-exceptions) của ứng dụng:

```php
report($e);
```

Hàm `report` cũng chấp nhận một chuỗi làm đối số. Khi truyền chuỗi, hàm sẽ tạo exception với chuỗi đó làm message:

```php
report('Something went wrong.');
```

<a name="method-report-if"></a>
#### `report_if()` {.collection-method}

Hàm `report_if` sẽ báo cáo exception qua [exception handler](/docs/{{version}}/errors#handling-exceptions) nếu biểu thức boolean được cung cấp cho kết quả `true`:

```php
report_if($shouldReport, $e);

report_if($shouldReport, 'Something went wrong.');
```

<a name="method-report-unless"></a>
#### `report_unless()` {.collection-method}

Hàm `report_unless` sẽ báo cáo exception qua [exception handler](/docs/{{version}}/errors#handling-exceptions) nếu biểu thức boolean được cung cấp cho kết quả `false`:

```php
report_unless($reportingDisabled, $e);

report_unless($reportingDisabled, 'Something went wrong.');
```

<a name="method-request"></a>
#### `request()` {.collection-method}

Hàm `request` trả về instance [request](/docs/{{version}}/requests) hiện tại hoặc lấy giá trị một input field từ request hiện tại:

```php
$request = request();

$value = request('key', $default);
```

<a name="method-rescue"></a>
#### `rescue()` {.collection-method}

Hàm `rescue` thực thi closure được cung cấp và bắt mọi exception phát sinh trong quá trình thực thi. Tất cả exception bị bắt sẽ được gửi tới [exception handler](/docs/{{version}}/errors#handling-exceptions); tuy nhiên request vẫn tiếp tục được xử lý:

```php
return rescue(function () {
    return $this->method();
});
```

Bạn cũng có thể truyền đối số thứ hai cho `rescue`. Đối số này là giá trị "mặc định" được trả về nếu exception xảy ra khi thực thi closure:

```php
return rescue(function () {
    return $this->method();
}, false);

return rescue(function () {
    return $this->method();
}, function () {
    return $this->failure();
});
```

Bạn có thể truyền argument `report` cho function `rescue` để quyết định exception có được report thông qua function `report` hay không:

```php
return rescue(function () {
    return $this->method();
}, report: function (Throwable $throwable) {
    return $throwable instanceof InvalidArgumentException;
});
```

<a name="method-resolve"></a>
#### `resolve()` {.collection-method}

Hàm `resolve` phân giải tên class hoặc interface thành một instance bằng [service container](/docs/{{version}}/container):

```php
$api = resolve('HelpSpot\API');
```

<a name="method-response"></a>
#### `response()` {.collection-method}

Hàm `response` tạo một instance [response](/docs/{{version}}/responses) hoặc lấy instance của response factory:

```php
return response('Hello World', 200, $headers);

return response()->json(['foo' => 'bar'], 200, $headers);
```

<a name="method-retry"></a>
#### `retry()` {.collection-method}

Hàm `retry` cố gắng thực thi callback cho đến khi đạt số lần thử tối đa được chỉ định. Nếu callback không ném exception, giá trị trả về của callback sẽ được trả về. Nếu callback ném exception, nó sẽ tự động được thử lại. Khi vượt quá số lần thử tối đa, exception sẽ được ném ra:

```php
return retry(5, function () {
    // Attempt 5 times while resting 100ms between attempts...
}, 100);
```

Thời lượng chờ cũng chấp nhận một instance `CarbonInterval`:

```php
use function Illuminate\Support\seconds;

return retry(5, function () {
    // Attempt 5 times while resting 5 seconds between attempts...
}, seconds(5));
```

Nếu muốn tự tính số mili giây cần chờ giữa các lần thử, bạn có thể truyền một closure làm đối số thứ ba cho hàm `retry`:

```php
use Exception;

return retry(5, function () {
    // ...
}, function (int $attempt, Exception $exception) {
    return $attempt * 100;
});
```

Để thuận tiện, bạn có thể truyền một mảng làm đối số đầu tiên cho hàm `retry`. Mảng này được dùng để xác định số mili giây cần chờ giữa các lần thử kế tiếp:

```php
return retry([100, 200], function () {
    // Sleep for 100ms on first retry, 200ms on second retry...
});
```

Để chỉ thử lại trong những điều kiện cụ thể, bạn có thể truyền một closure làm đối số thứ tư cho hàm `retry`:

```php
use App\Exceptions\TemporaryException;
use Exception;

return retry(5, function () {
    // ...
}, 100, function (Exception $exception) {
    return $exception instanceof TemporaryException;
});
```

<a name="method-session"></a>
#### `session()` {.collection-method}

Hàm `session` có thể được dùng để lấy hoặc thiết lập các giá trị [session](/docs/{{version}}/session):

```php
$value = session('key');
```

Bạn có thể thiết lập giá trị bằng cách truyền vào hàm một mảng các cặp key / value:

```php
session(['chairs' => 7, 'instruments' => 3]);
```

Session store sẽ được trả về nếu không truyền giá trị cho hàm:

```php
$value = session()->get('key');

session()->put('key', $value);
```

<a name="method-tap"></a>
#### `tap()` {.collection-method}

Hàm `tap` nhận hai đối số: một `$value` bất kỳ và một closure. `$value` được truyền vào closure rồi được chính `tap` trả về; giá trị trả về của closure không được sử dụng:

```php
$user = tap(User::first(), function (User $user) {
    $user->name = 'Taylor';

    $user->save();
});
```

Nếu không truyền closure cho hàm `tap`, bạn có thể gọi bất kỳ method nào trên `$value` đã cho. Giá trị trả về của method được gọi sẽ luôn là `$value`, bất kể method đó thực tế được định nghĩa trả về gì. Ví dụ, method `update` của Eloquent thường trả về một số nguyên. Tuy nhiên, ta có thể buộc chuỗi gọi trả về chính model bằng cách gọi `update` thông qua hàm `tap`:

```php
$user = tap($user)->update([
    'name' => $name,
    'email' => $email,
]);
```

Để thêm method `tap` vào một class, bạn có thể dùng trait `Illuminate\Support\Traits\Tappable`. Method `tap` của trait này nhận một Closure làm đối số duy nhất. Chính object instance sẽ được truyền vào Closure và sau đó được method `tap` trả về:

```php
return $user->tap(function (User $user) {
    // ...
});
```

<a name="method-throw-if"></a>
#### `throw_if()` {.collection-method}

Hàm `throw_if` ném exception được cung cấp nếu biểu thức boolean cho kết quả `true`:

```php
throw_if(! Auth::user()->isAdmin(), AuthorizationException::class);

throw_if(
    ! Auth::user()->isAdmin(),
    AuthorizationException::class,
    'You are not allowed to access this page.'
);
```

<a name="method-throw-unless"></a>
#### `throw_unless()` {.collection-method}

Hàm `throw_unless` ném exception được cung cấp nếu biểu thức boolean cho kết quả `false`:

```php
throw_unless(Auth::user()->isAdmin(), AuthorizationException::class);

throw_unless(
    Auth::user()->isAdmin(),
    AuthorizationException::class,
    'You are not allowed to access this page.'
);
```

<a name="method-today"></a>
#### `today()` {.collection-method}

Hàm `today` tạo một instance `Illuminate\Support\Carbon` mới cho ngày hiện tại:

```php
$today = today();
```

<a name="method-trait-uses-recursive"></a>
#### `trait_uses_recursive()` {.collection-method}

Hàm `trait_uses_recursive` trả về tất cả trait được một trait sử dụng:

```php
$traits = trait_uses_recursive(\Illuminate\Notifications\Notifiable::class);
```

<a name="method-transform"></a>
#### `transform()` {.collection-method}

Hàm `transform` thực thi closure với giá trị được cung cấp nếu giá trị đó không [blank](#method-blank), sau đó trả về kết quả của closure:

```php
$callback = function (int $value) {
    return $value * 2;
};

$result = transform(5, $callback);

// 10
```

Bạn có thể truyền default value hoặc closure làm argument thứ ba cho function. Giá trị này sẽ được trả về nếu value đã cho là blank:

```php
$result = transform(null, $callback, 'The value is blank');

// The value is blank
```

<a name="method-validator"></a>
#### `validator()` {.collection-method}

Hàm `validator` tạo một instance [validator](/docs/{{version}}/validation) mới với các đối số được cung cấp. Bạn có thể dùng hàm này thay cho facade `Validator`:

```php
$validator = validator($data, $rules, $messages);
```

<a name="method-value"></a>
#### `value()` {.collection-method}

Hàm `value` trả về giá trị được truyền vào. Tuy nhiên, nếu truyền một closure, closure sẽ được thực thi và kết quả của nó sẽ được trả về:

```php
$result = value(true);

// true

$result = value(function () {
    return false;
});

// false
```

Bạn có thể truyền thêm argument cho function `value`. Nếu argument đầu tiên là closure thì các parameter bổ sung sẽ được truyền vào closure; nếu không, chúng sẽ bị bỏ qua:

```php
$result = value(function (string $name) {
    return $name;
}, 'Taylor');

// 'Taylor'
```

<a name="method-view"></a>
#### `view()` {.collection-method}

Hàm `view` lấy một instance [view](/docs/{{version}}/views):

```php
return view('auth.login');
```

<a name="method-with"></a>
#### `with()` {.collection-method}

Hàm `with` trả về giá trị được truyền vào. Nếu đối số thứ hai là closure, closure sẽ được thực thi và kết quả của nó được trả về:

```php
$callback = function (mixed $value) {
    return is_numeric($value) ? $value * 2 : 0;
};

$result = with(5, $callback);

// 10

$result = with(null, $callback);

// 0

$result = with(5, null);

// 5
```

<a name="method-when"></a>
#### `when()` {.collection-method}

Hàm `when` trả về giá trị được truyền vào nếu điều kiện cho kết quả `true`; nếu không, `null` được trả về. Nếu đối số thứ hai là closure, closure sẽ được thực thi và kết quả của nó được trả về:

```php
$value = when(true, 'Hello World');

$value = when(true, fn () => 'Hello World');
```

Hàm `when` đặc biệt hữu ích khi render có điều kiện các thuộc tính HTML:

```blade
<div {!! when($condition, 'wire:poll="calculate"') !!}>
    ...
</div>
```

<a name="other-utilities"></a>
## Other Utilities

<a name="benchmarking"></a>
### Benchmarking

Đôi khi bạn cần nhanh chóng kiểm tra hiệu năng của một số phần trong ứng dụng. Khi đó, bạn có thể dùng support class `Benchmark` để đo số mili giây mà các callback được cung cấp cần để hoàn thành:

```php
<?php

use App\Models\User;
use Illuminate\Support\Benchmark;

Benchmark::dd(fn () => User::find(1)); // 0.1 ms

Benchmark::dd([
    'Scenario 1' => fn () => User::count(), // 0.5 ms
    'Scenario 2' => fn () => User::all()->count(), // 20.0 ms
]);
```

Mặc định, các callback được cung cấp sẽ được thực thi một lần (một iteration), và thời gian thực thi sẽ được hiển thị trong browser / console.

Để gọi callback nhiều hơn một lần, bạn có thể truyền số lần lặp làm đối số thứ hai của method. Khi callback được thực thi nhiều lần, class `Benchmark` sẽ trả về số mili giây trung bình cần để thực thi callback qua tất cả các lần lặp:

```php
Benchmark::dd(fn () => User::count(), iterations: 10); // 0.5 ms
```

Đôi khi bạn muốn benchmark việc thực thi callback nhưng vẫn lấy được giá trị mà callback trả về. Method `value` trả về một tuple gồm giá trị của callback và số mili giây cần để thực thi callback:

```php
[$count, $duration] = Benchmark::value(fn () => User::count());
```

<a name="dates"></a>
### Ngày và thời gian

Laravel tích hợp [Carbon](https://carbon.nesbot.com/guide/getting-started/introduction.html), một thư viện mạnh mẽ để thao tác ngày và giờ. Để tạo một instance `Carbon` mới, bạn có thể gọi hàm `now`. Hàm này khả dụng toàn cục trong ứng dụng Laravel:

```php
$now = now();
```

Hoặc, bạn có thể tạo một instance `Carbon` mới bằng class `Illuminate\Support\Carbon`:

```php
use Illuminate\Support\Carbon;

$now = Carbon::now();
```

Laravel cũng bổ sung các method `plus` và `minus` cho instance `Carbon`, giúp thao tác ngày và giờ của instance thuận tiện hơn:

```php
return now()->plus(minutes: 5);
return now()->plus(hours: 8);
return now()->plus(weeks: 4);

return now()->minus(minutes: 5);
return now()->minus(hours: 8);
return now()->minus(weeks: 4);
```

Để tìm hiểu đầy đủ về Carbon và các tính năng của thư viện này, hãy tham khảo [tài liệu Carbon chính thức](https://carbon.nesbot.com/guide/getting-started/introduction.html).

<a name="interval-functions"></a>
#### Interval Functions

Laravel còn cung cấp các hàm `milliseconds`, `seconds`, `minutes`, `hours`, `days`, `weeks`, `months` và `years`, trả về các instance `CarbonInterval` mở rộng class [DateInterval](https://www.php.net/manual/en/class.dateinterval.php) của PHP. Bạn có thể dùng các hàm này ở bất kỳ nơi nào Laravel chấp nhận một instance `DateInterval`:

```php
use Illuminate\Support\Facades\Cache;

use function Illuminate\Support\{minutes};

Cache::put('metrics', $metrics, minutes(10));
```

<a name="deferred-functions"></a>
### Deferred Functions

Mặc dù [queued job](/docs/{{version}}/queues) của Laravel cho phép đưa tác vụ vào queue để xử lý nền, đôi khi bạn chỉ có các tác vụ đơn giản cần trì hoãn mà không muốn cấu hình hoặc duy trì một queue worker chạy lâu dài.

Deferred function cho phép trì hoãn việc thực thi một closure cho tới sau khi HTTP response đã được gửi về người dùng, giúp ứng dụng luôn phản hồi nhanh và mượt. Để trì hoãn một closure, chỉ cần truyền closure đó vào function `Illuminate\Support\defer`:

```php
use App\Services\Metrics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use function Illuminate\Support\defer;

Route::post('/orders', function (Request $request) {
    // Create order...

    defer(fn () => Metrics::reportOrder($order));

    return $order;
});
```

Mặc định, deferred function chỉ được thực thi nếu HTTP response, Artisan command hoặc queued job nơi `Illuminate\Support\defer` được gọi hoàn tất thành công. Điều này có nghĩa deferred function sẽ không chạy nếu request trả về HTTP response `4xx` hoặc `5xx`. Nếu muốn deferred function luôn được thực thi, bạn có thể chain method `always`:

```php
defer(fn () => Metrics::reportOrder($order))->always();
```

> [!WARNING]
> Nếu đã cài [Swoole PHP extension](https://www.php.net/manual/en/book.swoole.php), hàm `defer` của Laravel có thể xung đột với hàm `defer` global của Swoole và gây lỗi web server. Hãy bảo đảm bạn gọi helper `defer` của Laravel bằng namespace tường minh: `use function Illuminate\Support\defer;`

<a name="cancelling-deferred-functions"></a>
#### Cancelling Deferred Functions

Nếu cần hủy một deferred function trước khi nó được thực thi, bạn có thể dùng method `forget` để hủy function theo tên. Để đặt tên cho deferred function, hãy truyền đối số thứ hai cho hàm `Illuminate\Support\defer`:

```php
defer(fn () => Metrics::report(), 'reportMetrics');

defer()->forget('reportMetrics');
```

<a name="disabling-deferred-functions-in-tests"></a>
#### Tắt deferred function trong test

Khi viết test, đôi lúc bạn cần vô hiệu hóa cơ chế defer. Bạn có thể gọi `withoutDefer` trong test để yêu cầu Laravel thực thi ngay tất cả deferred function:

```php tab=Pest
test('without defer', function () {
    $this->withoutDefer();

    // ...
});
```

```php tab=PHPUnit
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_without_defer(): void
    {
        $this->withoutDefer();

        // ...
    }
}
```

Nếu muốn vô hiệu hóa deferred function cho toàn bộ test trong một test case, bạn có thể gọi method `withoutDefer` từ method `setUp` trên class `TestCase` cơ sở:

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void// [tl! add:start]
    {
        parent::setUp();

        $this->withoutDefer();
    }// [tl! add:end]
}
```

<a name="lottery"></a>
### Lottery

Lottery class của Laravel có thể dùng để thực thi callback dựa trên tỷ lệ xác suất được chỉ định. Cơ chế này đặc biệt hữu ích khi bạn chỉ muốn chạy code cho một tỷ lệ nhất định trong số request đi vào:

```php
use Illuminate\Support\Lottery;

Lottery::odds(1, 20)
    ->winner(fn () => $user->won())
    ->loser(fn () => $user->lost())
    ->choose();
```

Bạn có thể kết hợp class lottery của Laravel với các tính năng Laravel khác. Ví dụ, bạn có thể chỉ muốn báo cáo một tỷ lệ nhỏ các query chậm tới exception handler. Vì class lottery có thể được gọi như callable, ta có thể truyền một instance của class này vào bất kỳ method nào chấp nhận callable:

```php
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Lottery;

DB::whenQueryingForLongerThan(
    CarbonInterval::seconds(2),
    Lottery::odds(1, 100)->winner(fn () => report('Querying > 2 seconds.')),
);
```

<a name="testing-lotteries"></a>
#### Testing Lotteries

Laravel cung cấp một số method đơn giản để bạn dễ dàng kiểm thử các lần gọi lottery trong ứng dụng:

```php
// Lottery will always win...
Lottery::alwaysWin();

// Lottery will always lose...
Lottery::alwaysLose();

// Lottery will win then lose, and finally return to normal behavior...
Lottery::fix([true, false]);

// Lottery will return to normal behavior...
Lottery::determineResultsNormally();
```

<a name="pipeline"></a>
### Pipeline

Facade `Pipeline` của Laravel cung cấp cách thuận tiện để "pipe" một input qua chuỗi invokable class, closure hoặc callable; mỗi bước có cơ hội kiểm tra hoặc thay đổi input rồi gọi callable tiếp theo trong pipeline:

```php
use Closure;
use App\Models\User;
use Illuminate\Support\Facades\Pipeline;

$user = Pipeline::send($user)
    ->through([
        function (User $user, Closure $next) {
            // ...

            return $next($user);
        },
        function (User $user, Closure $next) {
            // ...

            return $next($user);
        },
    ])
    ->then(fn (User $user) => $user);
```

Như bạn thấy, mỗi invokable class hoặc closure trong pipeline nhận input và một closure `$next`. Khi gọi closure `$next`, callable tiếp theo trong pipeline sẽ được thực thi. Cơ chế này rất giống [middleware](/docs/{{version}}/middleware).

Khi callable cuối cùng trong pipeline gọi closure `$next`, callable được truyền cho method `then` sẽ được thực thi. Thông thường, callable này chỉ trả về input đã nhận. Nếu chỉ muốn trả về input sau khi đã được xử lý, bạn có thể dùng method `thenReturn`.

Dĩ nhiên, như đã đề cập, bạn không bị giới hạn ở closure khi cung cấp các bước cho pipeline. Bạn cũng có thể truyền invokable class. Nếu truyền tên class, class đó sẽ được khởi tạo thông qua [service container](/docs/{{version}}/container) của Laravel, vì vậy dependency có thể được inject vào invokable class:

```php
$user = Pipeline::send($user)
    ->through([
        GenerateProfilePhoto::class,
        ActivateSubscription::class,
        SendWelcomeEmail::class,
    ])
    ->thenReturn();
```

Bạn có thể gọi method `withinTransaction` trên pipeline để tự động bao toàn bộ các bước của pipeline trong một database transaction duy nhất:

```php
$user = Pipeline::send($user)
    ->withinTransaction()
    ->through([
        ProcessOrder::class,
        TransferFunds::class,
        UpdateInventory::class,
    ])
    ->thenReturn();
```

<a name="sleep"></a>
### Sleep

Class `Sleep` của Laravel là một wrapper nhẹ quanh các hàm native `sleep` và `usleep` của PHP, giúp code dễ kiểm thử hơn đồng thời cung cấp API thân thiện để làm việc với thời gian:

```php
use Illuminate\Support\Sleep;

$waiting = true;

while ($waiting) {
    Sleep::for(1)->second();

    $waiting = /* ... */;
}
```

Class `Sleep` cung cấp nhiều method để làm việc với các đơn vị thời gian khác nhau:

```php
// Return a value after sleeping...
$result = Sleep::for(1)->second()->then(fn () => 1 + 1);

// Sleep while a given value is true...
Sleep::for(1)->second()->while(fn () => shouldKeepSleeping());

// Pause execution for 90 seconds...
Sleep::for(1.5)->minutes();

// Pause execution for 2 seconds...
Sleep::for(2)->seconds();

// Pause execution for 500 milliseconds...
Sleep::for(500)->milliseconds();

// Pause execution for 5,000 microseconds...
Sleep::for(5000)->microseconds();

// Pause execution until a given time...
Sleep::until(now()->plus(minutes: 1));

// Alias of PHP's native "sleep" function...
Sleep::sleep(2);

// Alias of PHP's native "usleep" function...
Sleep::usleep(5000);
```

Để dễ dàng kết hợp nhiều đơn vị thời gian, bạn có thể dùng method `and`:

```php
Sleep::for(1)->second()->and(10)->milliseconds();
```

<a name="testing-sleep"></a>
#### Testing Sleep

Khi kiểm thử code sử dụng class `Sleep` hoặc các hàm sleep native của PHP, test sẽ thực sự tạm dừng thực thi. Điều này khiến test suite chậm đi đáng kể. Ví dụ, giả sử bạn đang kiểm thử đoạn code sau:

```php
$waiting = /* ... */;

$seconds = 1;

while ($waiting) {
    Sleep::for($seconds++)->seconds();

    $waiting = /* ... */;
}
```

Thông thường, việc kiểm thử đoạn code này sẽ mất _ít nhất_ một giây. May mắn là class `Sleep` cho phép ta "fake" việc sleep để test suite vẫn chạy nhanh:

```php tab=Pest
it('waits until ready', function () {
    Sleep::fake();

    // ...
});
```

```php tab=PHPUnit
public function test_it_waits_until_ready()
{
    Sleep::fake();

    // ...
}
```

Khi fake class `Sleep`, khoảng dừng thực thi thực tế sẽ được bỏ qua, giúp test chạy nhanh hơn đáng kể.

Sau khi class `Sleep` được fake, bạn có thể assertion các lần "sleep" dự kiến phải xảy ra. Ví dụ, giả sử ta kiểm thử code tạm dừng ba lần, mỗi lần tăng thêm một giây. Với method `assertSequence`, ta có thể xác nhận code đã "sleep" đúng khoảng thời gian mà vẫn giữ test chạy nhanh:

```php tab=Pest
it('checks if ready three times', function () {
    Sleep::fake();

    // ...

    Sleep::assertSequence([
        Sleep::for(1)->second(),
        Sleep::for(2)->seconds(),
        Sleep::for(3)->seconds(),
    ]);
}
```

```php tab=PHPUnit
public function test_it_checks_if_ready_three_times()
{
    Sleep::fake();

    // ...

    Sleep::assertSequence([
        Sleep::for(1)->second(),
        Sleep::for(2)->seconds(),
        Sleep::for(3)->seconds(),
    ]);
}
```

Class `Sleep` cũng cung cấp nhiều assertion khác mà bạn có thể sử dụng khi testing:

```php
use Carbon\CarbonInterval as Duration;
use Illuminate\Support\Sleep;

// Assert that sleep was called 3 times...
Sleep::assertSleptTimes(3);

// Assert against the duration of sleep...
Sleep::assertSlept(function (Duration $duration): bool {
    return /* ... */;
}, times: 1);

// Assert that the Sleep class was never invoked...
Sleep::assertNeverSlept();

// Assert that, even if Sleep was called, no execution paused occurred...
Sleep::assertInsomniac();
```

Đôi khi bạn cần thực hiện một hành động mỗi khi fake sleep xảy ra. Để làm điều này, bạn có thể truyền callback cho method `whenFakingSleep`. Trong ví dụ sau, ta dùng [helper thao tác thời gian](/docs/{{version}}/mocking#interacting-with-time) của Laravel để lập tức tiến thời gian thêm đúng khoảng thời lượng của mỗi lần sleep:

```php
use Carbon\CarbonInterval as Duration;

$this->freezeTime();

Sleep::fake();

Sleep::whenFakingSleep(function (Duration $duration) {
    // Progress time when faking sleep...
    $this->travel($duration->totalMilliseconds)->milliseconds();
});
```

Vì việc làm thời gian tiến lên là nhu cầu phổ biến, method `fake` chấp nhận argument `syncWithCarbon` để giữ Carbon đồng bộ khi sleep trong test:

```php
Sleep::fake(syncWithCarbon: true);

$start = now();

Sleep::for(1)->second();

$start->diffForHumans(); // 1 second ago
```

Laravel sử dụng class `Sleep` nội bộ mỗi khi cần tạm dừng thực thi. Ví dụ, helper [retry](#method-retry) dùng `Sleep` khi chờ giữa các lần thử, nhờ đó việc kiểm thử helper này thuận tiện hơn.

<a name="timebox"></a>
### Timebox

Class `Timebox` của Laravel đảm bảo callback được cung cấp luôn mất một khoảng thời gian cố định để thực thi, ngay cả khi việc thực thi thực tế hoàn thành sớm hơn. Điều này đặc biệt hữu ích cho các thao tác mật mã và kiểm tra xác thực người dùng, nơi kẻ tấn công có thể khai thác chênh lệch thời gian thực thi để suy đoán thông tin nhạy cảm.

Nếu thời gian thực thi vượt quá khoảng cố định, `Timebox` không có tác dụng. Developer cần chọn khoảng thời gian cố định đủ dài để bao quát trường hợp xấu nhất.

Method `call` nhận một closure và giới hạn thời gian tính bằng microsecond, sau đó thực thi closure và chờ cho đến khi đạt giới hạn thời gian:

```php
use Illuminate\Support\Timebox;

(new Timebox)->call(function ($timebox) {
    // ...
}, microseconds: 10000);
```

Nếu closure ném ra exception, class này vẫn tuân theo khoảng delay đã định nghĩa và ném lại exception sau khi hết delay.

<a name="uri"></a>
### URI

Class `Uri` của Laravel cung cấp interface fluent và thuận tiện để tạo và thao tác URI. Class này bao bọc chức năng của package League URI bên dưới và tích hợp liền mạch với hệ thống routing của Laravel.

Bạn có thể dễ dàng tạo một instance `Uri` bằng các static method:

```php
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvokableController;
use Illuminate\Support\Uri;

// Generate a URI instance from the given string...
$uri = Uri::of('https://example.com/path');

// Generate URI instances to paths, named routes, or controller actions...
$uri = Uri::to('/dashboard');
$uri = Uri::route('users.show', ['user' => 1]);
$uri = Uri::signedRoute('users.show', ['user' => 1]);
$uri = Uri::temporarySignedRoute('user.index', now()->plus(minutes: 5));
$uri = Uri::action([UserController::class, 'index']);
$uri = Uri::action(InvokableController::class);

// Generate a URI instance from the current request URL...
$uri = $request->uri();
```

Sau khi có một instance URI, bạn có thể chỉnh sửa nó theo fluent API:

```php
$uri = Uri::of('https://example.com')
    ->withScheme('http')
    ->withHost('test.com')
    ->withPort(8000)
    ->withPath('/users')
    ->withQuery(['page' => 2])
    ->withFragment('section-1');
```

<a name="inspecting-uris"></a>
#### Inspecting URIs

Class `Uri` cũng cho phép bạn dễ dàng kiểm tra các thành phần khác nhau của URI bên dưới:

```php
$scheme = $uri->scheme();
$authority = $uri->authority();
$host = $uri->host();
$port = $uri->port();
$path = $uri->path();
$segments = $uri->pathSegments();
$query = $uri->query();
$fragment = $uri->fragment();
```

<a name="manipulating-query-strings"></a>
#### Manipulating Query Strings

Class `Uri` cung cấp một số method để thao tác query string của URI. Method `withQuery` có thể được dùng để merge thêm các tham số query string vào query string hiện có:

```php
$uri = $uri->withQuery(['sort' => 'name']);
```

Method `withQueryIfMissing` có thể được dùng để merge thêm các tham số vào query string hiện có nếu các key được cung cấp chưa tồn tại trong query string:

```php
$uri = $uri->withQueryIfMissing(['page' => 1]);
```

Method `replaceQuery` có thể được dùng để thay thế hoàn toàn query string hiện có bằng query string mới:

```php
$uri = $uri->replaceQuery(['page' => 1]);
```

Method `pushOntoQuery` có thể được dùng để thêm các giá trị vào một tham số query string có giá trị dạng mảng:

```php
$uri = $uri->pushOntoQuery('filter', ['active', 'pending']);
```

Method `withoutQuery` có thể được dùng để loại bỏ các tham số khỏi query string:

```php
$uri = $uri->withoutQuery(['page']);
```

<a name="generating-responses-from-uris"></a>
#### Tạo response từ URI

Method `redirect` có thể được dùng để tạo một instance `RedirectResponse` tới URI được chỉ định:

```php
$uri = Uri::of('https://example.com');

return $uri->redirect();
```

Hoặc, bạn có thể đơn giản return instance `Uri` từ route hay controller action; Laravel sẽ tự động tạo redirect response tới URI được trả về:

```php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Uri;

Route::get('/redirect', function () {
    return Uri::to('/index')
        ->withQuery(['sort' => 'name']);
});
```
