# Collection

- [Giới thiệu](#introduction)
    - [Tạo Collection](#creating-collections)
    - [Mở rộng Collection](#extending-collections)
- [Các method khả dụng](#available-methods)
- [Higher Order Messages](#higher-order-messages)
- [Lazy Collection](#lazy-collections)
    - [Giới thiệu](#lazy-collection-introduction)
    - [Tạo Lazy Collection](#creating-lazy-collections)
    - [Contract Enumerable](#the-enumerable-contract)
    - [Các method của Lazy Collection](#lazy-collection-methods)

<a name="introduction"></a>
## Giới thiệu

Class `Illuminate\Support\Collection` cung cấp một wrapper thuận tiện theo phong cách fluent để làm việc với các mảng dữ liệu. Ví dụ, hãy xem đoạn code sau. Chúng ta sử dụng helper `collect` để tạo một collection mới từ mảng, chạy hàm `strtoupper` trên từng phần tử, rồi loại bỏ tất cả phần tử rỗng:

```php
$collection = collect(['Taylor', 'Abigail', null])->map(function (?string $name) {
    return strtoupper($name);
})->reject(function (string $name) {
    return empty($name);
});
```

Như bạn có thể thấy, class `Collection` cho phép chain các method để thực hiện mapping và reducing trên mảng bên dưới theo phong cách fluent. Nhìn chung, collection là immutable, nghĩa là mỗi method của `Collection` trả về một instance `Collection` hoàn toàn mới.

<a name="creating-collections"></a>
### Tạo Collection

Như đã đề cập ở trên, helper `collect` trả về một instance `Illuminate\Support\Collection` mới cho mảng được cung cấp. Vì vậy, việc tạo collection đơn giản như sau:

```php
$collection = collect([1, 2, 3]);
```

Bạn cũng có thể tạo collection bằng các method [make](#method-make) và [fromJson](#method-fromjson).

> [!NOTE]
> Kết quả của các truy vấn [Eloquent](/docs/{{version}}/eloquent) luôn được trả về dưới dạng instance `Collection`.

<a name="extending-collections"></a>
### Mở rộng Collection

Collection hỗ trợ "macroable", cho phép bạn bổ sung method vào class `Collection` tại runtime. Method `macro` của class `Illuminate\Support\Collection` nhận một closure sẽ được thực thi khi macro được gọi. Closure của macro có thể truy cập các method khác của collection thông qua `$this`, giống như một method thực sự của class collection. Ví dụ, đoạn code sau thêm method `toUpper` vào class `Collection`:

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

Collection::macro('toUpper', function () {
    return $this->map(function (string $value) {
        return Str::upper($value);
    });
});

$collection = collect(['first', 'second']);

$upper = $collection->toUpper();

// ['FIRST', 'SECOND']
```

Thông thường, bạn nên khai báo các collection macro trong method `boot` của một [service provider](/docs/{{version}}/providers).

<a name="macro-arguments"></a>
#### Tham số của Macro

Nếu cần, bạn có thể định nghĩa macro nhận thêm tham số:

```php
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Lang;

Collection::macro('toLocale', function (string $locale) {
    return $this->map(function (string $value) use ($locale) {
        return Lang::get($value, [], $locale);
    });
});

$collection = collect(['first', 'second']);

$translated = $collection->toLocale('es');

// ['primero', 'segundo'];
```

<a name="available-methods"></a>
## Các method khả dụng

Trong phần lớn nội dung còn lại của tài liệu collection, chúng ta sẽ lần lượt tìm hiểu từng method có trên class `Collection`. Hãy nhớ rằng tất cả các method này có thể được chain để thao tác mảng bên dưới theo phong cách fluent. Ngoài ra, gần như mọi method đều trả về một instance `Collection` mới, cho phép bạn giữ nguyên collection ban đầu khi cần:

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

<div class="collection-method-list" markdown="1">

[after](#method-after)
[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[before](#method-before)
[chunk](#method-chunk)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collapseWithKeys](#method-collapsewithkeys)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffAssocUsing](#method-diffassocusing)
[diffKeys](#method-diffkeys)
[doesntContain](#method-doesntcontain)
[doesntContainStrict](#method-doesntcontainstrict)
[dot](#method-dot)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[ensure](#method-ensure)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forget](#method-forget)
[forPage](#method-forpage)
[fromJson](#method-fromjson)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[hasAny](#method-hasany)
[hasMany](#method-hasmany)
[hasSole](#method-hassole)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectUsing](#method-intersectusing)
[intersectAssoc](#method-intersectAssoc)
[intersectAssocUsing](#method-intersectassocusing)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[lazy](#method-lazy)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[multiply](#method-multiply)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[percentage](#method-percentage)
[pipe](#method-pipe)
[pipeInto](#method-pipeinto)
[pipeThrough](#method-pipethrough)
[pluck](#method-pluck)
[pop](#method-pop)
[prepend](#method-prepend)
[pull](#method-pull)
[push](#method-push)
[put](#method-put)
[random](#method-random)
[range](#method-range)
[reduce](#method-reduce)
[reduceInto](#method-reduce-into)
[reduceSpread](#method-reduce-spread)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[select](#method-select)
[shift](#method-shift)
[shuffle](#method-shuffle)
[skip](#method-skip)
[skipUntil](#method-skipuntil)
[skipWhile](#method-skipwhile)
[slice](#method-slice)
[sliding](#method-sliding)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortDesc](#method-sortdesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[sortKeysUsing](#method-sortkeysusing)
[splice](#method-splice)
[split](#method-split)
[splitIn](#method-splitin)
[sum](#method-sum)
[take](#method-take)
[takeUntil](#method-takeuntil)
[takeWhile](#method-takewhile)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[toPrettyJson](#method-to-pretty-json)
[transform](#method-transform)
[undot](#method-undot)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[value](#method-value)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[whereNotNull](#method-wherenotnull)
[whereNull](#method-wherenull)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

<a name="method-listing"></a>
## Danh sách method

<style>
    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<a name="method-after"></a>
#### `after()` {.collection-method .first-collection-method}

Method `after` trả về phần tử đứng sau phần tử được cung cấp. `null` được trả về nếu không tìm thấy phần tử đó hoặc nếu nó là phần tử cuối cùng:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->after(3);

// 4

$collection->after(5);

// null
```

Method này tìm phần tử được cung cấp bằng phép so sánh "loose", nghĩa là chuỗi chứa một giá trị số nguyên sẽ được xem là bằng với số nguyên có cùng giá trị. Để dùng phép so sánh "strict", bạn có thể truyền tham số `strict` cho method:

```php
collect([2, 4, 6, 8])->after('4', strict: true);

// null
```

Ngoài ra, bạn có thể cung cấp closure của riêng mình để tìm phần tử đầu tiên thỏa điều kiện kiểm tra đã cho:

```php
collect([2, 4, 6, 8])->after(function (int $item, int $key) {
    return $item > 5;
});

// 8
```

<a name="method-all"></a>
#### `all()` {.collection-method}

Method `all` trả về mảng bên dưới mà collection đại diện:

```php
collect([1, 2, 3])->all();

// [1, 2, 3]
```

<a name="method-average"></a>
#### `average()` {.collection-method}

Alias của method [avg](#method-avg).

<a name="method-avg"></a>
#### `avg()` {.collection-method}

Method `avg` trả về [giá trị trung bình](https://en.wikipedia.org/wiki/Average) của key được cung cấp:

```php
$average = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->avg('foo');

// 20

$average = collect([1, 1, 2, 4])->avg();

// 2
```

<a name="method-before"></a>
#### `before()` {.collection-method}

Method `before` là phép ngược lại của method [after](#method-after). Nó trả về phần tử đứng trước phần tử được cung cấp. `null` được trả về nếu không tìm thấy phần tử đó hoặc nếu nó là phần tử đầu tiên:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->before(3);

// 2

$collection->before(1);

// null

collect([2, 4, 6, 8])->before('4', strict: true);

// null

collect([2, 4, 6, 8])->before(function (int $item, int $key) {
    return $item > 5;
});

// 4
```

<a name="method-chunk"></a>
#### `chunk()` {.collection-method}

Method `chunk` chia collection thành nhiều collection nhỏ hơn với kích thước được chỉ định:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7]);

$chunks = $collection->chunk(4);

$chunks->all();

// [[1, 2, 3, 4], [5, 6, 7]]
```

Method này đặc biệt hữu ích trong [view](/docs/{{version}}/views) khi làm việc với hệ thống grid như [Bootstrap](https://getbootstrap.com/docs/5.3/layout/grid/). Ví dụ, giả sử bạn có một collection các model [Eloquent](/docs/{{version}}/eloquent) và muốn hiển thị chúng theo dạng grid:

```blade
@foreach ($products->chunk(3) as $chunk)
    <div class="row">
        @foreach ($chunk as $product)
            <div class="col-xs-4">{{ $product->name }}</div>
        @endforeach
    </div>
@endforeach
```

<a name="method-chunkwhile"></a>
#### `chunkWhile()` {.collection-method}

Method `chunkWhile` chia collection thành nhiều collection nhỏ hơn dựa trên kết quả đánh giá của callback được cung cấp. Biến `$chunk` truyền vào closure có thể được dùng để kiểm tra phần tử trước đó:

```php
$collection = collect(str_split('AABBCCCD'));

$chunks = $collection->chunkWhile(function (string $value, int $key, Collection $chunk) {
    return $value === $chunk->last();
});

$chunks->all();

// [['A', 'A'], ['B', 'B'], ['C', 'C', 'C'], ['D']]
```

<a name="method-collapse"></a>
#### `collapse()` {.collection-method}

Method `collapse` gộp một collection gồm các array hoặc collection thành một collection phẳng duy nhất:

```php
$collection = collect([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]);

$collapsed = $collection->collapse();

$collapsed->all();

// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

<a name="method-collapsewithkeys"></a>
#### `collapseWithKeys()` {.collection-method}

Method `collapseWithKeys` làm phẳng một collection gồm các array hoặc collection thành một collection duy nhất, đồng thời giữ nguyên các key ban đầu. Nếu collection vốn đã phẳng, method sẽ trả về một collection rỗng:

```php
$collection = collect([
    ['first'  => collect([1, 2, 3])],
    ['second' => [4, 5, 6]],
    ['third'  => collect([7, 8, 9])]
]);

$collapsed = $collection->collapseWithKeys();

$collapsed->all();

// [
//     'first'  => [1, 2, 3],
//     'second' => [4, 5, 6],
//     'third'  => [7, 8, 9],
// ]
```

<a name="method-collect"></a>
#### `collect()` {.collection-method}

Method `collect` trả về một instance `Collection` mới chứa các phần tử hiện có trong collection:

```php
$collectionA = collect([1, 2, 3]);

$collectionB = $collectionA->collect();

$collectionB->all();

// [1, 2, 3]
```

Method `collect` chủ yếu hữu ích khi chuyển [lazy collection](#lazy-collections) thành instance `Collection` thông thường:

```php
$lazyCollection = LazyCollection::make(function () {
    yield 1;
    yield 2;
    yield 3;
});

$collection = $lazyCollection->collect();

$collection::class;

// 'Illuminate\Support\Collection'

$collection->all();

// [1, 2, 3]
```

> [!NOTE]
Method `collect` đặc biệt hữu ích khi bạn có một instance của `Enumerable` và cần một instance collection không lazy. Vì `collect()` là một phần của contract `Enumerable`, bạn có thể sử dụng nó một cách an toàn để lấy instance `Collection`.

<a name="method-combine"></a>
#### `combine()` {.collection-method}

Method `combine` dùng các value của collection làm key và kết hợp chúng với các value của một array hoặc collection khác:

```php
$collection = collect(['name', 'age']);

$combined = $collection->combine(['George', 29]);

$combined->all();

// ['name' => 'George', 'age' => 29]
```

<a name="method-concat"></a>
#### `concat()` {.collection-method}

Method `concat` nối các value của array hoặc collection được cung cấp vào cuối collection khác:

```php
$collection = collect(['John Doe']);

$concatenated = $collection->concat(['Jane Doe'])->concat(['name' => 'Johnny Doe']);

$concatenated->all();

// ['John Doe', 'Jane Doe', 'Johnny Doe']
```

Method `concat` đánh lại key dạng số cho các phần tử được nối vào collection ban đầu. Để giữ nguyên key trong associative collection, hãy xem method [merge](#method-merge).

<a name="method-contains"></a>
#### `contains()` {.collection-method}

Method `contains` xác định collection có chứa một phần tử được cung cấp hay không. Bạn có thể truyền closure vào `contains` để xác định có phần tử nào trong collection thỏa điều kiện kiểm tra hay không:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->contains(function (int $value, int $key) {
    return $value > 5;
});

// false
```

Ngoài ra, bạn có thể truyền một chuỗi cho method `contains` để xác định collection có chứa giá trị phần tử đã cho hay không:

```php
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->contains('Desk');

// true

$collection->contains('New York');

// false
```

Bạn cũng có thể truyền một cặp key / value vào method `contains`; method sẽ xác định cặp đó có tồn tại trong collection hay không:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->contains('product', 'Bookcase');

// false
```

Method `contains` sử dụng phép so sánh "loose" khi kiểm tra value, nghĩa là chuỗi chứa giá trị số nguyên sẽ được xem là bằng với số nguyên có cùng giá trị. Hãy dùng method [containsStrict](#method-containsstrict) để kiểm tra bằng phép so sánh "strict".

Để thực hiện phép ngược lại với `contains`, hãy xem method [doesntContain](#method-doesntcontain).

<a name="method-containsstrict"></a>
#### `containsStrict()` {.collection-method}

Method này có cùng signature với method [contains](#method-contains); tuy nhiên, tất cả value đều được so sánh bằng phép so sánh "strict".

> [!NOTE]
Hành vi của method này được thay đổi khi sử dụng [Eloquent Collections](/docs/{{version}}/eloquent-collections#method-contains).

<a name="method-count"></a>
#### `count()` {.collection-method}

Method `count` trả về tổng số phần tử trong collection:

```php
$collection = collect([1, 2, 3, 4]);

$collection->count();

// 4
```

<a name="method-countBy"></a>
#### `countBy()` {.collection-method}

Method `countBy` đếm số lần xuất hiện của các value trong collection. Theo mặc định, method đếm số lần xuất hiện của từng phần tử, cho phép bạn đếm một số "loại" phần tử nhất định trong collection:

```php
$collection = collect([1, 2, 2, 2, 3]);

$counted = $collection->countBy();

$counted->all();

// [1 => 1, 2 => 3, 3 => 1]
```

Bạn có thể truyền closure vào method `countBy` để đếm tất cả phần tử theo một giá trị tùy chỉnh:

```php
$collection = collect(['alice@gmail.com', 'bob@yahoo.com', 'carlos@gmail.com']);

$counted = $collection->countBy(function (string $email) {
    return substr(strrchr($email, '@'), 1);
});

$counted->all();

// ['gmail.com' => 2, 'yahoo.com' => 1]
```

<a name="method-crossjoin"></a>
#### `crossJoin()` {.collection-method}

Method `crossJoin` thực hiện cross join các value của collection với các array hoặc collection được cung cấp, trả về tích Descartes chứa mọi tổ hợp có thể:

```php
$collection = collect([1, 2]);

$matrix = $collection->crossJoin(['a', 'b']);

$matrix->all();

/*
    [
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]
*/

$collection = collect([1, 2]);

$matrix = $collection->crossJoin(['a', 'b'], ['I', 'II']);

$matrix->all();

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

<a name="method-dd"></a>
#### `dd()` {.collection-method}

Method `dd` dump các phần tử của collection và kết thúc thực thi script:

```php
$collection = collect(['John Doe', 'Jane Doe']);

$collection->dd();

/*
    array:2 [
        0 => "John Doe"
        1 => "Jane Doe"
    ]
*/
```

Nếu không muốn dừng thực thi script, hãy dùng method [dump](#method-dump) thay thế.

<a name="method-diff"></a>
#### `diff()` {.collection-method}

Method `diff` so sánh collection với một collection khác hoặc một PHP `array` thông thường dựa trên value. Method trả về các value trong collection ban đầu không xuất hiện trong collection được cung cấp:

```php
$collection = collect([1, 2, 3, 4, 5]);

$diff = $collection->diff([2, 4, 6, 8]);

$diff->all();

// [1, 3, 5]
```

> [!NOTE]
Hành vi của method này được thay đổi khi sử dụng [Eloquent Collections](/docs/{{version}}/eloquent-collections#method-diff).

<a name="method-diffassoc"></a>
#### `diffAssoc()` {.collection-method}

Method `diffAssoc` so sánh collection với một collection khác hoặc một PHP `array` thông thường dựa trên cả key và value. Method trả về các cặp key / value trong collection ban đầu không xuất hiện trong collection được cung cấp:

```php
$collection = collect([
    'color' => 'orange',
    'type' => 'fruit',
    'remain' => 6,
]);

$diff = $collection->diffAssoc([
    'color' => 'yellow',
    'type' => 'fruit',
    'remain' => 3,
    'used' => 6,
]);

$diff->all();

// ['color' => 'orange', 'remain' => 6]
```

<a name="method-diffassocusing"></a>
#### `diffAssocUsing()` {.collection-method}

Khác với `diffAssoc`, `diffAssocUsing` nhận một callback do người dùng cung cấp để so sánh các index:

```php
$collection = collect([
    'color' => 'orange',
    'type' => 'fruit',
    'remain' => 6,
]);

$diff = $collection->diffAssocUsing([
    'Color' => 'yellow',
    'Type' => 'fruit',
    'Remain' => 3,
], 'strnatcasecmp');

$diff->all();

// ['color' => 'orange', 'remain' => 6]
```

Callback phải là một hàm so sánh trả về số nguyên nhỏ hơn, bằng hoặc lớn hơn 0. Để biết thêm thông tin, hãy tham khảo tài liệu PHP về [array_diff_uassoc](https://www.php.net/array_diff_uassoc#refsect1-function.array-diff-uassoc-parameters), đây là hàm PHP mà method `diffAssocUsing` sử dụng bên trong.

<a name="method-diffkeys"></a>
#### `diffKeys()` {.collection-method}

Method `diffKeys` so sánh collection với một collection khác hoặc PHP `array` thông thường dựa trên key. Method trả về các cặp key / value trong collection ban đầu không xuất hiện trong collection được cung cấp:

```php
$collection = collect([
    'one' => 10,
    'two' => 20,
    'three' => 30,
    'four' => 40,
    'five' => 50,
]);

$diff = $collection->diffKeys([
    'two' => 2,
    'four' => 4,
    'six' => 6,
    'eight' => 8,
]);

$diff->all();

// ['one' => 10, 'three' => 30, 'five' => 50]
```

<a name="method-doesntcontain"></a>
#### `doesntContain()` {.collection-method}

Method `doesntContain` xác định collection không chứa một phần tử được cung cấp hay không. Bạn có thể truyền closure vào `doesntContain` để xác định không tồn tại phần tử nào trong collection thỏa điều kiện kiểm tra được cung cấp:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->doesntContain(function (int $value, int $key) {
    return $value < 5;
});

// false
```

Ngoài ra, bạn có thể truyền một chuỗi cho method `doesntContain` để xác định collection không chứa giá trị phần tử đã cho:

```php
$collection = collect(['name' => 'Desk', 'price' => 100]);

$collection->doesntContain('Table');

// true

$collection->doesntContain('Desk');

// false
```

Bạn cũng có thể truyền cặp key / value vào method `doesntContain`; method sẽ xác định cặp đó không tồn tại trong collection hay không:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->doesntContain('product', 'Bookcase');

// true
```

Method `doesntContain` sử dụng phép so sánh "loose" khi kiểm tra value, nghĩa là chuỗi chứa giá trị số nguyên sẽ được xem là bằng với số nguyên có cùng giá trị.

<a name="method-doesntcontainstrict"></a>
#### `doesntContainStrict()` {.collection-method}

Method này có cùng signature với method [doesntContain](#method-doesntcontain); tuy nhiên, tất cả value đều được so sánh bằng phép so sánh "strict".

<a name="method-dot"></a>
#### `dot()` {.collection-method}

Method `dot` làm phẳng collection nhiều chiều thành collection một cấp sử dụng ký pháp "dot" để biểu thị độ sâu:

```php
$collection = collect(['products' => ['desk' => ['price' => 100]]]);

$flattened = $collection->dot();

$flattened->all();

// ['products.desk.price' => 100]
```

<a name="method-dump"></a>
#### `dump()` {.collection-method}

Method `dump` dump các phần tử của collection:

```php
$collection = collect(['John Doe', 'Jane Doe']);

$collection->dump();

/*
    array:2 [
        0 => "John Doe"
        1 => "Jane Doe"
    ]
*/
```

Nếu muốn dừng thực thi script sau khi dump collection, hãy dùng method [dd](#method-dd) thay thế.

<a name="method-duplicates"></a>
#### `duplicates()` {.collection-method}

Method `duplicates` lấy và trả về các value bị trùng trong collection:

```php
$collection = collect(['a', 'b', 'a', 'c', 'b']);

$collection->duplicates();

// [2 => 'a', 4 => 'b']
```

Nếu collection chứa array hoặc object, bạn có thể truyền key của attribute mà bạn muốn kiểm tra value trùng lặp:

```php
$employees = collect([
    ['email' => 'abigail@example.com', 'position' => 'Developer'],
    ['email' => 'james@example.com', 'position' => 'Designer'],
    ['email' => 'victoria@example.com', 'position' => 'Developer'],
]);

$employees->duplicates('position');

// [2 => 'Developer']
```

<a name="method-duplicatesstrict"></a>
#### `duplicatesStrict()` {.collection-method}

Method này có cùng signature với method [duplicates](#method-duplicates); tuy nhiên, tất cả value đều được so sánh bằng phép so sánh "strict".

<a name="method-each"></a>
#### `each()` {.collection-method}

Method `each` lặp qua các phần tử trong collection và truyền từng phần tử vào closure:

```php
$collection = collect([1, 2, 3, 4]);

$collection->each(function (int $item, int $key) {
    // ...
});
```

Nếu muốn dừng quá trình lặp, bạn có thể trả về `false` từ closure:

```php
$collection->each(function (int $item, int $key) {
    if (/* condition */) {
        return false;
    }
});
```

<a name="method-eachspread"></a>
#### `eachSpread()` {.collection-method}

Method `eachSpread` lặp qua các phần tử của collection và truyền từng value lồng nhau vào callback được cung cấp:

```php
$collection = collect([['John Doe', 35], ['Jane Doe', 33]]);

$collection->eachSpread(function (string $name, int $age) {
    // ...
});
```

Bạn có thể dừng quá trình lặp bằng cách trả về `false` từ callback:

```php
$collection->eachSpread(function (string $name, int $age) {
    return false;
});
```

<a name="method-ensure"></a>
#### `ensure()` {.collection-method}

Method `ensure` có thể được dùng để xác minh tất cả phần tử của collection thuộc một type hoặc danh sách type được chỉ định. Nếu không, `UnexpectedValueException` sẽ được throw:

```php
return $collection->ensure(User::class);

return $collection->ensure([User::class, Customer::class]);
```

Các primitive type như `string`, `int`, `float`, `bool`, và `array` cũng có thể được chỉ định:

```php
return $collection->ensure('int');
```

> [!WARNING]
Method `ensure` không đảm bảo rằng các phần tử thuộc type khác sẽ không được thêm vào collection ở thời điểm sau.

<a name="method-every"></a>
#### `every()` {.collection-method}

Method `every` có thể được dùng để xác minh tất cả phần tử của collection đều thỏa điều kiện kiểm tra được cung cấp:

```php
collect([1, 2, 3, 4])->every(function (int $value, int $key) {
    return $value > 2;
});

// false
```

Nếu collection rỗng, method `every` sẽ trả về `true`:

```php
$collection = collect([]);

$collection->every(function (int $value, int $key) {
    return $value > 2;
});

// true
```

<a name="method-except"></a>
#### `except()` {.collection-method}

Method `except` trả về tất cả phần tử trong collection ngoại trừ các phần tử có key được chỉ định:

```php
$collection = collect(['product_id' => 1, 'price' => 100, 'discount' => false]);

$filtered = $collection->except(['price', 'discount']);

$filtered->all();

// ['product_id' => 1]
```

Để thực hiện phép ngược lại với `except`, hãy xem method [only](#method-only).

> [!NOTE]
Hành vi của method này được thay đổi khi sử dụng [Eloquent Collections](/docs/{{version}}/eloquent-collections#method-except).

<a name="method-filter"></a>
#### `filter()` {.collection-method}

Method `filter` lọc collection bằng callback được cung cấp, chỉ giữ lại những phần tử thỏa điều kiện kiểm tra:

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->filter(function (int $value, int $key) {
    return $value > 2;
});

$filtered->all();

// [3, 4]
```

Nếu không cung cấp callback, mọi phần tử trong collection tương đương với `false` sẽ bị loại bỏ:

```php
$collection = collect([1, 2, 3, null, false, '', 0, []]);

$collection->filter()->all();

// [1, 2, 3]
```

Để thực hiện phép ngược lại với `filter`, hãy xem method [reject](#method-reject).

<a name="method-first"></a>
#### `first()` {.collection-method}

Method `first` trả về phần tử đầu tiên trong collection thỏa điều kiện kiểm tra được cung cấp:

```php
collect([1, 2, 3, 4])->first(function (int $value, int $key) {
    return $value > 2;
});

// 3
```

Bạn cũng có thể gọi method `first` mà không truyền đối số để lấy phần tử đầu tiên trong collection. Nếu collection rỗng, `null` sẽ được trả về:

```php
collect([1, 2, 3, 4])->first();

// 1
```

<a name="method-first-or-fail"></a>
#### `firstOrFail()` {.collection-method}

Method `firstOrFail` hoạt động giống `first`; tuy nhiên, nếu không tìm thấy kết quả, exception `Illuminate\Support\ItemNotFoundException` sẽ được throw:

```php
collect([1, 2, 3, 4])->firstOrFail(function (int $value, int $key) {
    return $value > 5;
});

// Throws ItemNotFoundException...
```

Bạn cũng có thể gọi method `firstOrFail` mà không truyền đối số để lấy phần tử đầu tiên trong collection. Nếu collection rỗng, exception `Illuminate\Support\ItemNotFoundException` sẽ được throw:

```php
collect([])->firstOrFail();

// Throws ItemNotFoundException...
```

<a name="method-first-where"></a>
#### `firstWhere()` {.collection-method}

Method `firstWhere` trả về phần tử đầu tiên trong collection có cặp key / value được chỉ định:

```php
$collection = collect([
    ['name' => 'Regena', 'age' => null],
    ['name' => 'Linda', 'age' => 14],
    ['name' => 'Diego', 'age' => 23],
    ['name' => 'Linda', 'age' => 84],
]);

$collection->firstWhere('name', 'Linda');

// ['name' => 'Linda', 'age' => 14]
```

Bạn cũng có thể gọi method `firstWhere` với một toán tử so sánh:

```php
$collection->firstWhere('age', '>=', 18);

// ['name' => 'Diego', 'age' => 23]
```

Tương tự method [where](#method-where), bạn có thể truyền một đối số cho `firstWhere`. Trong trường hợp này, `firstWhere` sẽ trả về item đầu tiên mà giá trị của key được chỉ định là "truthy":

```php
$collection->firstWhere('age');

// ['name' => 'Linda', 'age' => 14]
```

<a name="method-flatmap"></a>
#### `flatMap()` {.collection-method}

Method `flatMap` duyệt qua collection và truyền từng value vào closure được cung cấp. Closure có thể sửa item rồi trả về item đó, từ đó tạo thành một collection mới gồm các item đã được biến đổi. Sau đó, array được làm phẳng một cấp:

```php
$collection = collect([
    ['name' => 'Sally'],
    ['school' => 'Arkansas'],
    ['age' => 28]
]);

$flattened = $collection->flatMap(function (array $values) {
    return array_map('strtoupper', $values);
});

$flattened->all();

// ['name' => 'SALLY', 'school' => 'ARKANSAS', 'age' => '28'];
```

<a name="method-flatten"></a>
#### `flatten()` {.collection-method}

Method `flatten` làm phẳng một collection đa chiều thành một chiều:

```php
$collection = collect([
    'name' => 'Taylor',
    'languages' => [
        'PHP', 'JavaScript'
    ]
]);

$flattened = $collection->flatten();

$flattened->all();

// ['Taylor', 'PHP', 'JavaScript'];
```

Nếu cần, bạn có thể truyền đối số "depth" cho method `flatten`:

```php
$collection = collect([
    'Apple' => [
        [
            'name' => 'iPhone 6S',
            'brand' => 'Apple'
        ],
    ],
    'Samsung' => [
        [
            'name' => 'Galaxy S7',
            'brand' => 'Samsung'
        ],
    ],
]);

$products = $collection->flatten(1);

$products->values()->all();

/*
    [
        ['name' => 'iPhone 6S', 'brand' => 'Apple'],
        ['name' => 'Galaxy S7', 'brand' => 'Samsung'],
    ]
*/
```

Trong ví dụ này, nếu gọi `flatten` mà không cung cấp depth, các array lồng nhau cũng sẽ bị làm phẳng, cho kết quả `['iPhone 6S', 'Apple', 'Galaxy S7', 'Samsung']`. Việc cung cấp depth cho phép bạn chỉ định số cấp của array lồng nhau sẽ được làm phẳng.

<a name="method-flip"></a>
#### `flip()` {.collection-method}

Method `flip` hoán đổi các key của collection với value tương ứng:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$flipped = $collection->flip();

$flipped->all();

// ['Taylor' => 'name', 'Laravel' => 'framework']
```

<a name="method-forget"></a>
#### `forget()` {.collection-method}

Method `forget` xóa một item khỏi collection theo key:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

// Forget a single key...
$collection->forget('name');

// ['framework' => 'Laravel']

// Forget multiple keys...
$collection->forget(['name', 'framework']);

// []
```

> [!WARNING]
> Không giống phần lớn method khác của collection, `forget` không trả về một collection mới đã được sửa đổi; nó thay đổi và trả về chính collection mà method được gọi trên đó.

<a name="method-forpage"></a>
#### `forPage()` {.collection-method}

Method `forPage` trả về một collection mới chứa các item sẽ xuất hiện ở số trang được chỉ định. Method nhận số trang làm đối số thứ nhất và số item hiển thị trên mỗi trang làm đối số thứ hai:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunk = $collection->forPage(2, 3);

$chunk->all();

// [4, 5, 6]
```

<a name="method-fromjson"></a>
#### `fromJson()` {.collection-method}

Static method `fromJson` tạo một collection instance mới bằng cách decode chuỗi JSON được cung cấp thông qua hàm PHP `json_decode`:

```php
use Illuminate\Support\Collection;

$json = json_encode([
    'name' => 'Taylor Otwell',
    'role' => 'Developer',
    'status' => 'Active',
]);

$collection = Collection::fromJson($json);
```

<a name="method-get"></a>
#### `get()` {.collection-method}

Method `get` trả về item tại key được chỉ định. Nếu key không tồn tại, `null` sẽ được trả về:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$value = $collection->get('name');

// Taylor
```

Bạn có thể tùy chọn truyền giá trị mặc định làm đối số thứ hai:

```php
$collection = collect(['name' => 'Taylor', 'framework' => 'Laravel']);

$value = $collection->get('age', 34);

// 34
```

Bạn thậm chí có thể truyền callback làm giá trị mặc định của method. Kết quả của callback sẽ được trả về nếu key được chỉ định không tồn tại:

```php
$collection->get('email', function () {
    return 'taylor@example.com';
});

// taylor@example.com
```

<a name="method-groupby"></a>
#### `groupBy()` {.collection-method}

Method `groupBy` nhóm các item của collection theo key được chỉ định:

```php
$collection = collect([
    ['account_id' => 'account-x10', 'product' => 'Chair'],
    ['account_id' => 'account-x10', 'product' => 'Bookcase'],
    ['account_id' => 'account-x11', 'product' => 'Desk'],
]);

$grouped = $collection->groupBy('account_id');

$grouped->all();

/*
    [
        'account-x10' => [
            ['account_id' => 'account-x10', 'product' => 'Chair'],
            ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ],
        'account-x11' => [
            ['account_id' => 'account-x11', 'product' => 'Desk'],
        ],
    ]
*/
```

Thay vì truyền một `key` dạng chuỗi, bạn có thể truyền callback. Callback cần trả về giá trị mà bạn muốn dùng để nhóm:

```php
$grouped = $collection->groupBy(function (array $item, int $key) {
    return substr($item['account_id'], -3);
});

$grouped->all();

/*
    [
        'x10' => [
            ['account_id' => 'account-x10', 'product' => 'Chair'],
            ['account_id' => 'account-x10', 'product' => 'Bookcase'],
        ],
        'x11' => [
            ['account_id' => 'account-x11', 'product' => 'Desk'],
        ],
    ]
*/
```

Có thể truyền nhiều tiêu chí nhóm dưới dạng array. Mỗi phần tử của array sẽ được áp dụng cho cấp tương ứng trong array đa chiều:

```php
$data = new Collection([
    10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
    20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
    30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
    40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
]);

$result = $data->groupBy(['skill', function (array $item) {
    return $item['roles'];
}], preserveKeys: true);

/*
[
    1 => [
        'Role_1' => [
            10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
            20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        ],
        'Role_2' => [
            20 => ['user' => 2, 'skill' => 1, 'roles' => ['Role_1', 'Role_2']],
        ],
        'Role_3' => [
            10 => ['user' => 1, 'skill' => 1, 'roles' => ['Role_1', 'Role_3']],
        ],
    ],
    2 => [
        'Role_1' => [
            30 => ['user' => 3, 'skill' => 2, 'roles' => ['Role_1']],
        ],
        'Role_2' => [
            40 => ['user' => 4, 'skill' => 2, 'roles' => ['Role_2']],
        ],
    ],
];
*/
```

<a name="method-has"></a>
#### `has()` {.collection-method}

Method `has` xác định một key được chỉ định có tồn tại trong collection hay không:

```php
$collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

$collection->has('product');

// true

$collection->has(['product', 'amount']);

// true

$collection->has(['amount', 'price']);

// false
```

<a name="method-hasany"></a>
#### `hasAny()` {.collection-method}

Method `hasAny` xác định có bất kỳ key nào trong số các key được cung cấp tồn tại trong collection hay không:

```php
$collection = collect(['account_id' => 1, 'product' => 'Desk', 'amount' => 5]);

$collection->hasAny(['product', 'price']);

// true

$collection->hasAny(['name', 'price']);

// false
```

<a name="method-hasmany"></a>
#### `hasMany()` {.collection-method}

Method `hasMany` xác định collection có chứa nhiều item hay không:

```php
collect([])->hasMany();

// false

collect(['1'])->hasMany();

// false

collect([1, 2, 3])->hasMany();

// true

collect([
    ['age' => 2],
    ['age' => 3],
])->hasMany(fn ($item) => $item['age'] === 2)

// false
```

<a name="method-hassole"></a>
#### `hasSole()` {.collection-method}

Method `hasSole` xác định collection có chứa đúng một item hay không, đồng thời có thể tùy chọn kiểm tra item đó theo tiêu chí được cung cấp:

```php
collect([])->hasSole();

// false

collect(['1'])->hasSole();

// true

collect([1, 2, 3])->hasSole(fn (int $item) => $item === 2);

// true
```

<a name="method-implode"></a>
#### `implode()` {.collection-method}

Method `implode` nối các item trong collection. Các đối số của method phụ thuộc vào kiểu item trong collection. Nếu collection chứa array hoặc object, bạn nên truyền key của attribute muốn nối và chuỗi "glue" muốn đặt giữa các value:

```php
$collection = collect([
    ['account_id' => 1, 'product' => 'Desk'],
    ['account_id' => 2, 'product' => 'Chair'],
]);

$collection->implode('product', ', ');

// 'Desk, Chair'
```

Nếu collection chứa các chuỗi đơn giản hoặc giá trị số, bạn chỉ cần truyền "glue" làm đối số duy nhất cho method:

```php
collect([1, 2, 3, 4, 5])->implode('-');

// '1-2-3-4-5'
```

Bạn có thể truyền closure cho method `implode` nếu muốn định dạng các value trước khi nối:

```php
$collection->implode(function (array $item, int $key) {
    return strtoupper($item['product']);
}, ', ');

// 'DESK, CHAIR'
```

<a name="method-intersect"></a>
#### `intersect()` {.collection-method}

Method `intersect` loại bỏ khỏi collection gốc mọi value không có trong array hoặc collection được cung cấp. Collection kết quả sẽ giữ nguyên các key của collection gốc:

```php
$collection = collect(['Desk', 'Sofa', 'Chair']);

$intersect = $collection->intersect(['Desk', 'Chair', 'Bookcase']);

$intersect->all();

// [0 => 'Desk', 2 => 'Chair']
```

> [!NOTE]
> Hành vi của method này được thay đổi khi sử dụng [Eloquent Collections](/docs/{{version}}/eloquent-collections#method-intersect).

<a name="method-intersectusing"></a>
#### `intersectUsing()` {.collection-method}

Method `intersectUsing` loại bỏ khỏi collection gốc mọi value không có trong array hoặc collection được cung cấp, sử dụng callback tùy chỉnh để so sánh các value. Collection kết quả sẽ giữ nguyên các key của collection gốc:

```php
$collection = collect(['Desk', 'Sofa', 'Chair']);

$intersect = $collection->intersectUsing(['desk', 'chair', 'bookcase'], function (string $a, string $b) {
    return strcasecmp($a, $b);
});

$intersect->all();

// [0 => 'Desk', 2 => 'Chair']
```

<a name="method-intersectAssoc"></a>
#### `intersectAssoc()` {.collection-method}

Method `intersectAssoc` so sánh collection gốc với một collection hoặc array khác, rồi trả về các cặp key / value có mặt trong tất cả collection được cung cấp:

```php
$collection = collect([
    'color' => 'red',
    'size' => 'M',
    'material' => 'cotton'
]);

$intersect = $collection->intersectAssoc([
    'color' => 'blue',
    'size' => 'M',
    'material' => 'polyester'
]);

$intersect->all();

// ['size' => 'M']
```

<a name="method-intersectassocusing"></a>
#### `intersectAssocUsing()` {.collection-method}

Method `intersectAssocUsing` so sánh collection gốc với một collection hoặc array khác, trả về các cặp key / value có mặt ở cả hai và sử dụng callback so sánh tùy chỉnh để xác định tính bằng nhau của cả key lẫn value:

```php
$collection = collect([
    'color' => 'red',
    'Size' => 'M',
    'material' => 'cotton',
]);

$intersect = $collection->intersectAssocUsing([
    'color' => 'blue',
    'size' => 'M',
    'material' => 'polyester',
], function (string $a, string $b) {
    return strcasecmp($a, $b);
});

$intersect->all();

// ['Size' => 'M']
```

<a name="method-intersectbykeys"></a>
#### `intersectByKeys()` {.collection-method}

Method `intersectByKeys` loại bỏ khỏi collection gốc mọi key cùng value tương ứng nếu key đó không có trong array hoặc collection được cung cấp:

```php
$collection = collect([
    'serial' => 'UX301', 'type' => 'screen', 'year' => 2009,
]);

$intersect = $collection->intersectByKeys([
    'reference' => 'UX404', 'type' => 'tab', 'year' => 2011,
]);

$intersect->all();

// ['type' => 'screen', 'year' => 2009]
```

<a name="method-isempty"></a>
#### `isEmpty()` {.collection-method}

Method `isEmpty` trả về `true` nếu collection rỗng; ngược lại trả về `false`:

```php
collect([])->isEmpty();

// true
```

<a name="method-isnotempty"></a>
#### `isNotEmpty()` {.collection-method}

Method `isNotEmpty` trả về `true` nếu collection không rỗng; ngược lại trả về `false`:

```php
collect([])->isNotEmpty();

// false
```

<a name="method-join"></a>
#### `join()` {.collection-method}

Method `join` nối các value của collection bằng một chuỗi. Thông qua đối số thứ hai, bạn cũng có thể chỉ định cách phần tử cuối cùng được nối vào chuỗi:

```php
collect(['a', 'b', 'c'])->join(', '); // 'a, b, c'
collect(['a', 'b', 'c'])->join(', ', ', and '); // 'a, b, and c'
collect(['a', 'b'])->join(', ', ' and '); // 'a and b'
collect(['a'])->join(', ', ' and '); // 'a'
collect([])->join(', ', ' and '); // ''
```

<a name="method-keyby"></a>
#### `keyBy()` {.collection-method}

Method `keyBy` thiết lập key cho collection theo key được cung cấp. Nếu nhiều item có cùng key, chỉ item cuối cùng xuất hiện trong collection mới:

```php
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$keyed = $collection->keyBy('product_id');

$keyed->all();

/*
    [
        'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

Bạn cũng có thể truyền callback cho method. Callback cần trả về value sẽ được dùng làm key cho collection:

```php
$keyed = $collection->keyBy(function (array $item, int $key) {
    return strtoupper($item['product_id']);
});

$keyed->all();

/*
    [
        'PROD-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
        'PROD-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
    ]
*/
```

<a name="method-keys"></a>
#### `keys()` {.collection-method}

Method `keys` trả về tất cả key của collection:

```php
$collection = collect([
    'prod-100' => ['product_id' => 'prod-100', 'name' => 'Desk'],
    'prod-200' => ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$keys = $collection->keys();

$keys->all();

// ['prod-100', 'prod-200']
```

<a name="method-last"></a>
#### `last()` {.collection-method}

Method `last` trả về phần tử cuối cùng trong collection thỏa điều kiện kiểm tra được cung cấp:

```php
collect([1, 2, 3, 4])->last(function (int $value, int $key) {
    return $value < 3;
});

// 2
```

Bạn cũng có thể gọi method `last` mà không truyền đối số để lấy phần tử cuối cùng trong collection. Nếu collection rỗng, `null` sẽ được trả về:

```php
collect([1, 2, 3, 4])->last();

// 4
```

<a name="method-lazy"></a>
#### `lazy()` {.collection-method}

Method `lazy` trả về một instance [LazyCollection](#lazy-collections) mới từ array item bên dưới:

```php
$lazyCollection = collect([1, 2, 3, 4])->lazy();

$lazyCollection::class;

// Illuminate\Support\LazyCollection

$lazyCollection->all();

// [1, 2, 3, 4]
```

Điều này đặc biệt hữu ích khi bạn cần thực hiện các phép biến đổi trên một `Collection` rất lớn chứa nhiều item:

```php
$count = $hugeCollection
    ->lazy()
    ->where('country', 'FR')
    ->where('balance', '>', '100')
    ->count();
```

Bằng cách chuyển collection thành `LazyCollection`, chúng ta tránh phải cấp phát một lượng lớn bộ nhớ bổ sung. Dù collection gốc vẫn giữ _các_ value của nó trong bộ nhớ, các filter tiếp theo thì không. Vì vậy, gần như không có thêm bộ nhớ nào được cấp phát khi lọc kết quả của collection.

<a name="method-macro"></a>
#### `macro()` {.collection-method}

Static method `macro` cho phép bạn thêm method vào class `Collection` tại runtime. Xem tài liệu về [mở rộng collection](#extending-collections) để biết thêm thông tin.

<a name="method-make"></a>
#### `make()` {.collection-method}

Static method `make` tạo một collection instance mới. Xem phần [Tạo Collection](#creating-collections).

```php
use Illuminate\Support\Collection;

$collection = Collection::make([1, 2, 3]);
```

<a name="method-map"></a>
#### `map()` {.collection-method}

Method `map` duyệt qua collection và truyền từng value vào callback được cung cấp. Callback có thể sửa item rồi trả về item đó, từ đó tạo thành một collection mới gồm các item đã được biến đổi:

```php
$collection = collect([1, 2, 3, 4, 5]);

$multiplied = $collection->map(function (int $item, int $key) {
    return $item * 2;
});

$multiplied->all();

// [2, 4, 6, 8, 10]
```

> [!WARNING]
> Giống phần lớn method khác của collection, `map` trả về một collection instance mới; nó không thay đổi collection mà method được gọi trên đó. Nếu muốn biến đổi collection gốc, hãy dùng method [transform](#method-transform).

<a name="method-mapinto"></a>
#### `mapInto()` {.collection-method}

Method `mapInto()` duyệt qua collection, tạo một instance mới của class được cung cấp bằng cách truyền value vào constructor:

```php
class Currency
{
    /**
     * Create a new currency instance.
     */
    function __construct(
        public string $code,
    ) {}
}

$collection = collect(['USD', 'EUR', 'GBP']);

$currencies = $collection->mapInto(Currency::class);

$currencies->all();

// [Currency('USD'), Currency('EUR'), Currency('GBP')]
```

<a name="method-mapspread"></a>
#### `mapSpread()` {.collection-method}

Method `mapSpread` duyệt qua các item của collection và truyền từng value của item lồng nhau vào closure được cung cấp. Closure có thể sửa item rồi trả về item đó, từ đó tạo thành một collection mới gồm các item đã được biến đổi:

```php
$collection = collect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

$chunks = $collection->chunk(2);

$sequence = $chunks->mapSpread(function (int $even, int $odd) {
    return $even + $odd;
});

$sequence->all();

// [1, 5, 9, 13, 17]
```

<a name="method-maptogroups"></a>
#### `mapToGroups()` {.collection-method}

Method `mapToGroups` nhóm các item của collection theo closure được cung cấp. Closure cần trả về một associative array chứa một cặp key / value duy nhất, từ đó tạo thành collection mới gồm các value đã được nhóm:

```php
$collection = collect([
    [
        'name' => 'John Doe',
        'department' => 'Sales',
    ],
    [
        'name' => 'Jane Doe',
        'department' => 'Sales',
    ],
    [
        'name' => 'Johnny Doe',
        'department' => 'Marketing',
    ]
]);

$grouped = $collection->mapToGroups(function (array $item, int $key) {
    return [$item['department'] => $item['name']];
});

$grouped->all();

/*
    [
        'Sales' => ['John Doe', 'Jane Doe'],
        'Marketing' => ['Johnny Doe'],
    ]
*/

$grouped->get('Sales')->all();

// ['John Doe', 'Jane Doe']
```

<a name="method-mapwithkeys"></a>
#### `mapWithKeys()` {.collection-method}

Method `mapWithKeys` duyệt qua collection và truyền từng value vào callback được cung cấp. Callback cần trả về một associative array chứa một cặp key / value duy nhất:

```php
$collection = collect([
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
]);

$keyed = $collection->mapWithKeys(function (array $item, int $key) {
    return [$item['email'] => $item['name']];
});

$keyed->all();

/*
    [
        'john@example.com' => 'John',
        'jane@example.com' => 'Jane',
    ]
*/
```

<a name="method-max"></a>
#### `max()` {.collection-method}

Method `max` trả về giá trị lớn nhất của key được chỉ định:

```php
$max = collect([
    ['foo' => 10],
    ['foo' => 20]
])->max('foo');

// 20

$max = collect([1, 2, 3, 4, 5])->max();

// 5
```

<a name="method-median"></a>
#### `median()` {.collection-method}

Method `median` trả về [giá trị trung vị](https://en.wikipedia.org/wiki/Median) của key được chỉ định:

```php
$median = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->median('foo');

// 15

$median = collect([1, 1, 2, 4])->median();

// 1.5
```

<a name="method-merge"></a>
#### `merge()` {.collection-method}

Method `merge` hợp nhất array hoặc collection được cung cấp với collection gốc. Nếu một string key trong các item được cung cấp trùng với string key trong collection gốc, value của item được cung cấp sẽ ghi đè value trong collection gốc:

```php
$collection = collect(['product_id' => 1, 'price' => 100]);

$merged = $collection->merge(['price' => 200, 'discount' => false]);

$merged->all();

// ['product_id' => 1, 'price' => 200, 'discount' => false]
```

Nếu key của các item được cung cấp là số, các value sẽ được nối vào cuối collection:

```php
$collection = collect(['Desk', 'Chair']);

$merged = $collection->merge(['Bookcase', 'Door']);

$merged->all();

// ['Desk', 'Chair', 'Bookcase', 'Door']
```

<a name="method-mergerecursive"></a>
#### `mergeRecursive()` {.collection-method}

Method `mergeRecursive` hợp nhất đệ quy array hoặc collection được cung cấp với collection gốc. Nếu một string key trong các item được cung cấp trùng với string key trong collection gốc, các value của những key này sẽ được hợp nhất thành một array và quá trình đó được thực hiện đệ quy:

```php
$collection = collect(['product_id' => 1, 'price' => 100]);

$merged = $collection->mergeRecursive([
    'product_id' => 2,
    'price' => 200,
    'discount' => false
]);

$merged->all();

// ['product_id' => [1, 2], 'price' => [100, 200], 'discount' => false]
```

<a name="method-min"></a>
#### `min()` {.collection-method}

Method `min` trả về giá trị nhỏ nhất của key được chỉ định:

```php
$min = collect([
    ['foo' => 10],
    ['foo' => 20]
])->min('foo');

// 10

$min = collect([1, 2, 3, 4, 5])->min();

// 1
```

<a name="method-mode"></a>
#### `mode()` {.collection-method}

Method `mode` trả về [giá trị mode](https://en.wikipedia.org/wiki/Mode_(statistics)) của key được chỉ định:

```php
$mode = collect([
    ['foo' => 10],
    ['foo' => 10],
    ['foo' => 20],
    ['foo' => 40]
])->mode('foo');

// [10]

$mode = collect([1, 1, 2, 4])->mode();

// [1]

$mode = collect([1, 1, 2, 2])->mode();

// [1, 2]
```

<a name="method-multiply"></a>
#### `multiply()` {.collection-method}

Phương thức `multiply` tạo số lượng bản sao được chỉ định cho tất cả phần tử trong collection:

```php
$users = collect([
    ['name' => 'User #1', 'email' => 'user1@example.com'],
    ['name' => 'User #2', 'email' => 'user2@example.com'],
])->multiply(3);

/*
    [
        ['name' => 'User #1', 'email' => 'user1@example.com'],
        ['name' => 'User #2', 'email' => 'user2@example.com'],
        ['name' => 'User #1', 'email' => 'user1@example.com'],
        ['name' => 'User #2', 'email' => 'user2@example.com'],
        ['name' => 'User #1', 'email' => 'user1@example.com'],
        ['name' => 'User #2', 'email' => 'user2@example.com'],
    ]
*/
```

<a name="method-nth"></a>
#### `nth()` {.collection-method}

Phương thức `nth` tạo một collection mới gồm mỗi phần tử thứ n:

```php
$collection = collect(['a', 'b', 'c', 'd', 'e', 'f']);

$collection->nth(4);

// ['a', 'e']
```

Bạn có thể tùy chọn truyền offset bắt đầu làm đối số thứ hai:

```php
$collection->nth(4, 1);

// ['b', 'f']
```

<a name="method-only"></a>
#### `only()` {.collection-method}

Phương thức `only` trả về các phần tử trong collection có các key được chỉ định:

```php
$collection = collect([
    'product_id' => 1,
    'name' => 'Desk',
    'price' => 100,
    'discount' => false
]);

$filtered = $collection->only(['product_id', 'name']);

$filtered->all();

// ['product_id' => 1, 'name' => 'Desk']
```

Để thực hiện thao tác ngược với `only`, hãy xem phương thức [except](#method-except).

> [!NOTE]
> Hành vi của method này được thay đổi khi sử dụng [Eloquent Collections](/docs/{{version}}/eloquent-collections#method-only).

<a name="method-pad"></a>
#### `pad()` {.collection-method}

Phương thức `pad` sẽ điền giá trị đã cho vào mảng cho đến khi mảng đạt kích thước được chỉ định. Phương thức này hoạt động tương tự hàm PHP [array_pad](https://secure.php.net/manual/en/function.array-pad.php).

Để thêm phần tử đệm về bên trái, hãy chỉ định kích thước âm. Việc đệm sẽ không diễn ra nếu giá trị tuyệt đối của kích thước đã cho nhỏ hơn hoặc bằng độ dài của mảng:

```php
$collection = collect(['A', 'B', 'C']);

$filtered = $collection->pad(5, 0);

$filtered->all();

// ['A', 'B', 'C', 0, 0]

$filtered = $collection->pad(-5, 0);

$filtered->all();

// [0, 0, 'A', 'B', 'C']
```

<a name="method-partition"></a>
#### `partition()` {.collection-method}

Phương thức `partition` có thể kết hợp với cú pháp destructuring mảng của PHP để tách các phần tử thỏa điều kiện kiểm tra khỏi các phần tử không thỏa:

```php
$collection = collect([1, 2, 3, 4, 5, 6]);

[$underThree, $equalOrAboveThree] = $collection->partition(function (int $i) {
    return $i < 3;
});

$underThree->all();

// [1, 2]

$equalOrAboveThree->all();

// [3, 4, 5, 6]
```

> [!NOTE]
> Hành vi của method này được thay đổi khi làm việc với [Eloquent collections](/docs/{{version}}/eloquent-collections#method-partition).

<a name="method-percentage"></a>
#### `percentage()` {.collection-method}

Phương thức `percentage` có thể được dùng để nhanh chóng xác định tỷ lệ phần trăm các phần tử trong collection thỏa một điều kiện kiểm tra cho trước:

```php
$collection = collect([1, 1, 2, 2, 2, 3]);

$percentage = $collection->percentage(fn (int $value) => $value === 1);

// 33.33
```

Mặc định, tỷ lệ phần trăm sẽ được làm tròn đến hai chữ số thập phân. Tuy nhiên, bạn có thể tùy chỉnh hành vi này bằng cách truyền đối số thứ hai cho phương thức:

```php
$percentage = $collection->percentage(fn (int $value) => $value === 1, precision: 3);

// 33.333
```

<a name="method-pipe"></a>
#### `pipe()` {.collection-method}

Phương thức `pipe` truyền collection vào closure đã cho và trả về kết quả thực thi closure:

```php
$collection = collect([1, 2, 3]);

$piped = $collection->pipe(function (Collection $collection) {
    return $collection->sum();
});

// 6
```

<a name="method-pipeinto"></a>
#### `pipeInto()` {.collection-method}

Phương thức `pipeInto` tạo một instance mới của class đã cho và truyền collection vào constructor:

```php
class ResourceCollection
{
    /**
     * Create a new ResourceCollection instance.
     */
    public function __construct(
        public Collection $collection,
    ) {}
}

$collection = collect([1, 2, 3]);

$resource = $collection->pipeInto(ResourceCollection::class);

$resource->collection->all();

// [1, 2, 3]
```

<a name="method-pipethrough"></a>
#### `pipeThrough()` {.collection-method}

Phương thức `pipeThrough` truyền collection lần lượt qua mảng các closure đã cho và trả về kết quả sau khi các closure được thực thi:

```php
use Illuminate\Support\Collection;

$collection = collect([1, 2, 3]);

$result = $collection->pipeThrough([
    function (Collection $collection) {
        return $collection->merge([4, 5]);
    },
    function (Collection $collection) {
        return $collection->sum();
    },
]);

// 15
```

<a name="method-pluck"></a>
#### `pluck()` {.collection-method}

Phương thức `pluck` lấy tất cả giá trị của một key đã cho:

```php
$collection = collect([
    ['product_id' => 'prod-100', 'name' => 'Desk'],
    ['product_id' => 'prod-200', 'name' => 'Chair'],
]);

$plucked = $collection->pluck('name');

$plucked->all();

// ['Desk', 'Chair']
```

Bạn cũng có thể chỉ định cách đặt key cho collection kết quả:

```php
$plucked = $collection->pluck('name', 'product_id');

$plucked->all();

// ['prod-100' => 'Desk', 'prod-200' => 'Chair']
```

Phương thức `pluck` cũng hỗ trợ lấy các giá trị lồng nhau bằng ký hiệu "dot":

```php
$collection = collect([
    [
        'name' => 'Laracon',
        'speakers' => [
            'first_day' => ['Rosa', 'Judith'],
        ],
    ],
    [
        'name' => 'VueConf',
        'speakers' => [
            'first_day' => ['Abigail', 'Joey'],
        ],
    ],
]);

$plucked = $collection->pluck('speakers.first_day');

$plucked->all();

// [['Rosa', 'Judith'], ['Abigail', 'Joey']]
```

Nếu tồn tại các key trùng nhau, phần tử khớp cuối cùng sẽ được đưa vào collection kết quả của `pluck`:

```php
$collection = collect([
    ['brand' => 'Tesla',  'color' => 'red'],
    ['brand' => 'Pagani', 'color' => 'white'],
    ['brand' => 'Tesla',  'color' => 'black'],
    ['brand' => 'Pagani', 'color' => 'orange'],
]);

$plucked = $collection->pluck('color', 'brand');

$plucked->all();

// ['Tesla' => 'black', 'Pagani' => 'orange']
```

<a name="method-pop"></a>
#### `pop()` {.collection-method}

Phương thức `pop` xóa và trả về phần tử cuối cùng của collection. Nếu collection rỗng, `null` sẽ được trả về:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop();

// 5

$collection->all();

// [1, 2, 3, 4]
```

Bạn có thể truyền một số nguyên vào phương thức `pop` để xóa và trả về nhiều phần tử từ cuối collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->pop(3);

// collect([5, 4, 3])

$collection->all();

// [1, 2]
```

<a name="method-prepend"></a>
#### `prepend()` {.collection-method}

Phương thức `prepend` thêm một phần tử vào đầu collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->prepend(0);

$collection->all();

// [0, 1, 2, 3, 4, 5]
```

Bạn cũng có thể truyền đối số thứ hai để chỉ định key cho phần tử được thêm vào đầu:

```php
$collection = collect(['one' => 1, 'two' => 2]);

$collection->prepend(0, 'zero');

$collection->all();

// ['zero' => 0, 'one' => 1, 'two' => 2]
```

<a name="method-pull"></a>
#### `pull()` {.collection-method}

Phương thức `pull` xóa và trả về một phần tử khỏi collection theo key của phần tử đó:

```php
$collection = collect(['product_id' => 'prod-100', 'name' => 'Desk']);

$collection->pull('name');

// 'Desk'

$collection->all();

// ['product_id' => 'prod-100']
```

<a name="method-push"></a>
#### `push()` {.collection-method}

Phương thức `push` thêm một phần tử vào cuối collection:

```php
$collection = collect([1, 2, 3, 4]);

$collection->push(5);

$collection->all();

// [1, 2, 3, 4, 5]
```

Bạn cũng có thể cung cấp nhiều phần tử để thêm vào cuối collection:

```php
$collection = collect([1, 2, 3, 4]);

$collection->push(5, 6, 7);
 
$collection->all();
 
// [1, 2, 3, 4, 5, 6, 7]
```

<a name="method-put"></a>
#### `put()` {.collection-method}

Phương thức `put` thiết lập key và value đã cho trong collection:

```php
$collection = collect(['product_id' => 1, 'name' => 'Desk']);

$collection->put('price', 100);

$collection->all();

// ['product_id' => 1, 'name' => 'Desk', 'price' => 100]
```

<a name="method-random"></a>
#### `random()` {.collection-method}

Phương thức `random` trả về một phần tử ngẫu nhiên từ collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->random();

// 4 - (retrieved randomly)
```

Bạn có thể truyền một số nguyên vào `random` để chỉ định số lượng phần tử muốn lấy ngẫu nhiên. Khi truyền rõ số lượng phần tử cần nhận, phương thức luôn trả về một collection:

```php
$random = $collection->random(3);

$random->all();

// [2, 4, 5] - (retrieved randomly)
```

Nếu instance collection có ít phần tử hơn số lượng được yêu cầu, phương thức `random` sẽ ném `InvalidArgumentException`.

Phương thức `random` cũng chấp nhận một closure; closure này sẽ nhận instance collection hiện tại:

```php
use Illuminate\Support\Collection;

$random = $collection->random(fn (Collection $items) => min(10, count($items)));

$random->all();

// [1, 2, 3, 4, 5] - (retrieved randomly)
```

<a name="method-range"></a>
#### `range()` {.collection-method}

Phương thức `range` trả về một collection chứa các số nguyên trong khoảng được chỉ định:

```php
$collection = collect()->range(3, 6);

$collection->all();

// [3, 4, 5, 6]
```

<a name="method-reduce"></a>
#### `reduce()` {.collection-method}

Phương thức `reduce` rút gọn collection thành một giá trị duy nhất bằng cách truyền kết quả của mỗi vòng lặp sang vòng lặp tiếp theo:

```php
$collection = collect([1, 2, 3]);

$total = $collection->reduce(function (?int $carry, int $item) {
    return $carry + $item;
});

// 6
```

Giá trị của `$carry` ở vòng lặp đầu tiên là `null`; tuy nhiên, bạn có thể chỉ định giá trị khởi tạo bằng cách truyền đối số thứ hai cho `reduce`:

```php
$collection->reduce(function (int $carry, int $item) {
    return $carry + $item;
}, 4);

// 10
```

Phương thức `reduce` cũng truyền các key của mảng vào callback đã cho:

```php
$collection = collect([
    'usd' => 1400,
    'gbp' => 1200,
    'eur' => 1000,
]);

$ratio = [
    'usd' => 1,
    'gbp' => 1.37,
    'eur' => 1.22,
];

$collection->reduce(function (int $carry, int $value, string $key) use ($ratio) {
    return $carry + ($value * $ratio[$key]);
}, 0);

// 4264
```

<a name="method-reduce-into"></a>
#### `reduceInto()` {.collection-method}

Phương thức `reduceInto` rút gọn collection thành một giá trị duy nhất bằng cách thay đổi trực tiếp giá trị khởi tạo đã cho. Khác với phương thức `reduce`, callback không cần trả về giá trị tích lũy:

```php
class OrderStats
{
    public int $total = 0;

    public int $count = 0;
}

$orders = collect([
    ['amount' => 100],
    ['amount' => 250],
    ['amount' => 50],
]);

$stats = $orders->reduceInto(new OrderStats, function (OrderStats $stats, array $order) {
    $stats->total += $order['amount'];
    $stats->count++;
});

$stats->total;

// 400
```

Khi rút gọn vào một scalar hoặc mảng, bạn nên nhận giá trị đó theo tham chiếu trong callback để các thay đổi được áp dụng lên giá trị gốc:

```php
$collection = collect([1, 2, 3, 4, 5]);

$even = $collection->reduceInto([], function (array &$result, int $value) {
    if ($value % 2 === 0) {
        $result[] = $value;
    }
});

// [2, 4]
```

<a name="method-reduce-spread"></a>
#### `reduceSpread()` {.collection-method}

Phương thức `reduceSpread` rút gọn collection thành một mảng giá trị và truyền kết quả của mỗi vòng lặp sang vòng lặp tiếp theo. Phương thức này tương tự `reduce`, nhưng có thể nhận nhiều giá trị khởi tạo:

```php
[$creditsRemaining, $batch] = Image::where('status', 'unprocessed')
    ->get()
    ->reduceSpread(function (int $creditsRemaining, Collection $batch, Image $image) {
        if ($creditsRemaining >= $image->creditsRequired()) {
            $batch->push($image);

            $creditsRemaining -= $image->creditsRequired();
        }

        return [$creditsRemaining, $batch];
    }, $creditsAvailable, collect());
```

<a name="method-reject"></a>
#### `reject()` {.collection-method}

Phương thức `reject` lọc collection bằng closure đã cho. Closure nên trả về `true` nếu phần tử cần bị loại khỏi collection kết quả:

```php
$collection = collect([1, 2, 3, 4]);

$filtered = $collection->reject(function (int $value, int $key) {
    return $value > 2;
});

$filtered->all();

// [1, 2]
```

Để thực hiện thao tác ngược với phương thức `reject`, hãy xem phương thức [filter](#method-filter).

<a name="method-replace"></a>
#### `replace()` {.collection-method}

Phương thức `replace` hoạt động tương tự `merge`; tuy nhiên, ngoài việc ghi đè các phần tử khớp có key dạng chuỗi, `replace` còn ghi đè các phần tử trong collection có key dạng số trùng khớp:

```php
$collection = collect(['Taylor', 'Abigail', 'James']);

$replaced = $collection->replace([1 => 'Victoria', 3 => 'Finn']);

$replaced->all();

// ['Taylor', 'Victoria', 'James', 'Finn']
```

<a name="method-replacerecursive"></a>
#### `replaceRecursive()` {.collection-method}

Phương thức `replaceRecursive` hoạt động tương tự `replace`, nhưng sẽ đệ quy vào các mảng và áp dụng cùng quy trình thay thế cho các giá trị bên trong:

```php
$collection = collect([
    'Taylor',
    'Abigail',
    [
        'James',
        'Victoria',
        'Finn'
    ]
]);

$replaced = $collection->replaceRecursive([
    'Charlie',
    2 => [1 => 'King']
]);

$replaced->all();

// ['Charlie', 'Abigail', ['James', 'King', 'Finn']]
```

<a name="method-reverse"></a>
#### `reverse()` {.collection-method}

Phương thức `reverse` đảo ngược thứ tự các phần tử trong collection đồng thời giữ nguyên các key ban đầu:

```php
$collection = collect(['a', 'b', 'c', 'd', 'e']);

$reversed = $collection->reverse();

$reversed->all();

/*
    [
        4 => 'e',
        3 => 'd',
        2 => 'c',
        1 => 'b',
        0 => 'a',
    ]
*/
```

<a name="method-search"></a>
#### `search()` {.collection-method}

Phương thức `search` tìm giá trị đã cho trong collection và trả về key nếu tìm thấy. Nếu không tìm thấy phần tử, phương thức trả về `false`:

```php
$collection = collect([2, 4, 6, 8]);

$collection->search(4);

// 1
```

Việc tìm kiếm sử dụng phép so sánh "loose", nghĩa là chuỗi chứa một giá trị số nguyên sẽ được xem là bằng với số nguyên có cùng giá trị. Để dùng phép so sánh "strict", hãy truyền `true` làm đối số thứ hai của phương thức:

```php
collect([2, 4, 6, 8])->search('4', strict: true);

// false
```

Ngoài ra, bạn có thể cung cấp closure của riêng mình để tìm phần tử đầu tiên thỏa điều kiện kiểm tra đã cho:

```php
collect([2, 4, 6, 8])->search(function (int $item, int $key) {
    return $item > 5;
});

// 2
```

<a name="method-select"></a>
#### `select()` {.collection-method}

Phương thức `select` chọn các key đã cho từ collection, tương tự câu lệnh SQL `SELECT`:

```php
$users = collect([
    ['name' => 'Taylor Otwell', 'role' => 'Developer', 'status' => 'active'],
    ['name' => 'Victoria Faith', 'role' => 'Researcher', 'status' => 'active'],
]);

$users->select(['name', 'role']);

/*
    [
        ['name' => 'Taylor Otwell', 'role' => 'Developer'],
        ['name' => 'Victoria Faith', 'role' => 'Researcher'],
    ],
*/
```

<a name="method-shift"></a>
#### `shift()` {.collection-method}

Phương thức `shift` xóa và trả về phần tử đầu tiên của collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift();

// 1

$collection->all();

// [2, 3, 4, 5]
```

Bạn có thể truyền một số nguyên vào phương thức `shift` để xóa và trả về nhiều phần tử từ đầu collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->shift(3);

// collect([1, 2, 3])

$collection->all();

// [4, 5]
```

<a name="method-shuffle"></a>
#### `shuffle()` {.collection-method}

Phương thức `shuffle` xáo trộn ngẫu nhiên các phần tử trong collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$shuffled = $collection->shuffle();

$shuffled->all();

// [3, 2, 5, 1, 4] - (generated randomly)
```

<a name="method-skip"></a>
#### `skip()` {.collection-method}

Phương thức `skip` trả về một collection mới sau khi loại bỏ số lượng phần tử được chỉ định khỏi đầu collection:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$collection = $collection->skip(4);

$collection->all();

// [5, 6, 7, 8, 9, 10]
```

<a name="method-skipuntil"></a>
#### `skipUntil()` {.collection-method}

Phương thức `skipUntil` bỏ qua các phần tử trong collection khi callback đã cho còn trả về `false`. Ngay khi callback trả về `true`, toàn bộ phần tử còn lại sẽ được trả về dưới dạng một collection mới:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(function (int $item) {
    return $item >= 3;
});

$subset->all();

// [3, 4]
```

Bạn cũng có thể truyền một giá trị đơn giản vào phương thức `skipUntil` để bỏ qua tất cả phần tử cho đến khi tìm thấy giá trị đã cho:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipUntil(3);

$subset->all();

// [3, 4]
```

> [!WARNING]
> Nếu không tìm thấy giá trị đã cho hoặc callback không bao giờ trả về `true`, method `skipUntil` sẽ trả về một collection rỗng.

<a name="method-skipwhile"></a>
#### `skipWhile()` {.collection-method}

Phương thức `skipWhile` bỏ qua các phần tử trong collection khi callback đã cho còn trả về `true`. Ngay khi callback trả về `false`, toàn bộ phần tử còn lại sẽ được trả về dưới dạng một collection mới:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->skipWhile(function (int $item) {
    return $item <= 3;
});

$subset->all();

// [4]
```

> [!WARNING]
> Nếu callback không bao giờ trả về `false`, method `skipWhile` sẽ trả về một collection rỗng.

<a name="method-slice"></a>
#### `slice()` {.collection-method}

Phương thức `slice` trả về một phần của collection bắt đầu tại index đã cho:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$slice = $collection->slice(4);

$slice->all();

// [5, 6, 7, 8, 9, 10]
```

Nếu muốn giới hạn kích thước phần được trả về, hãy truyền kích thước mong muốn làm đối số thứ hai của phương thức:

```php
$slice = $collection->slice(4, 2);

$slice->all();

// [5, 6]
```

Mặc định, phần được trả về sẽ giữ nguyên các key. Nếu không muốn giữ các key ban đầu, bạn có thể dùng phương thức [values](#method-values) để đánh lại index.

<a name="method-sliding"></a>
#### `sliding()` {.collection-method}

Phương thức `sliding` trả về một collection mới gồm các chunk biểu diễn dạng xem "sliding window" của các phần tử trong collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(2);

$chunks->toArray();

// [[1, 2], [2, 3], [3, 4], [4, 5]]
```

Điều này đặc biệt hữu ích khi kết hợp với phương thức [eachSpread](#method-eachspread):

```php
$transactions->sliding(2)->eachSpread(function (Collection $previous, Collection $current) {
    $current->total = $previous->total + $current->amount;
});
```

Bạn có thể tùy chọn truyền giá trị "step" thứ hai để xác định khoảng cách giữa phần tử đầu tiên của mỗi chunk:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunks = $collection->sliding(3, step: 2);

$chunks->toArray();

// [[1, 2, 3], [3, 4, 5]]
```

<a name="method-sole"></a>
#### `sole()` {.collection-method}

Phương thức `sole` trả về phần tử đầu tiên trong collection thỏa điều kiện kiểm tra đã cho, nhưng chỉ khi điều kiện đó khớp chính xác một phần tử:

```php
collect([1, 2, 3, 4])->sole(function (int $value, int $key) {
    return $value === 2;
});

// 2
```

Bạn cũng có thể truyền một cặp key / value vào phương thức `sole`; phương thức sẽ trả về phần tử đầu tiên trong collection khớp với cặp đã cho, nhưng chỉ khi có chính xác một phần tử khớp:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
]);

$collection->sole('product', 'Chair');

// ['product' => 'Chair', 'price' => 100]
```

Ngoài ra, bạn cũng có thể gọi phương thức `sole` mà không truyền đối số để lấy phần tử đầu tiên nếu collection chỉ có duy nhất một phần tử:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
]);

$collection->sole();

// ['product' => 'Desk', 'price' => 200]
```

Nếu collection không có phần tử nào để phương thức `sole` trả về, exception `\Illuminate\Collections\ItemNotFoundException` sẽ được ném. Nếu có nhiều hơn một phần tử có thể được trả về, `\Illuminate\Collections\MultipleItemsFoundException` sẽ được ném.

<a name="method-some"></a>
#### `some()` {.collection-method}

Alias của phương thức [contains](#method-contains).

<a name="method-sort"></a>
#### `sort()` {.collection-method}

Phương thức `sort` sắp xếp collection. Collection sau khi sắp xếp vẫn giữ các key ban đầu của mảng, vì vậy trong ví dụ sau chúng ta sẽ dùng phương thức [values](#method-values) để đặt lại key thành các index liên tiếp:

```php
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sort();

$sorted->values()->all();

// [1, 2, 3, 4, 5]
```

Nếu nhu cầu sắp xếp phức tạp hơn, bạn có thể truyền một callback chứa thuật toán của riêng mình vào `sort`. Hãy tham khảo tài liệu PHP về [uasort](https://secure.php.net/manual/en/function.uasort.php#refsect1-function.uasort-parameters), đây là hàm mà phương thức `sort` của collection sử dụng bên trong.

> [!NOTE]
> Nếu cần sắp xếp một collection gồm các array hoặc object lồng nhau, hãy xem các method [sortBy](#method-sortby) và [sortByDesc](#method-sortbydesc).

<a name="method-sortby"></a>
#### `sortBy()` {.collection-method}

Phương thức `sortBy` sắp xếp collection theo key đã cho. Collection sau khi sắp xếp vẫn giữ các key ban đầu của mảng, vì vậy trong ví dụ sau chúng ta sẽ dùng phương thức [values](#method-values) để đặt lại key thành các index liên tiếp:

```php
$collection = collect([
    ['name' => 'Desk', 'price' => 200],
    ['name' => 'Chair', 'price' => 100],
    ['name' => 'Bookcase', 'price' => 150],
]);

$sorted = $collection->sortBy('price');

$sorted->values()->all();

/*
    [
        ['name' => 'Chair', 'price' => 100],
        ['name' => 'Bookcase', 'price' => 150],
        ['name' => 'Desk', 'price' => 200],
    ]
*/
```

Phương thức `sortBy` chấp nhận [sort flags](https://www.php.net/manual/en/function.sort.php) làm đối số thứ hai:

```php
$collection = collect([
    ['title' => 'Item 1'],
    ['title' => 'Item 12'],
    ['title' => 'Item 3'],
]);

$sorted = $collection->sortBy('title', SORT_NATURAL);

$sorted->values()->all();

/*
    [
        ['title' => 'Item 1'],
        ['title' => 'Item 3'],
        ['title' => 'Item 12'],
    ]
*/
```

Ngoài ra, bạn có thể truyền closure của riêng mình để xác định cách sắp xếp các giá trị trong collection:

```php
$collection = collect([
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$sorted = $collection->sortBy(function (array $product, int $key) {
    return count($product['colors']);
});

$sorted->values()->all();

/*
    [
        ['name' => 'Chair', 'colors' => ['Black']],
        ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
        ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
    ]
*/
```

Nếu muốn sắp xếp collection theo nhiều thuộc tính, bạn có thể truyền một mảng các thao tác sắp xếp vào phương thức `sortBy`. Mỗi thao tác sắp xếp phải là một mảng gồm thuộc tính cần sắp xếp và hướng sắp xếp mong muốn:

```php
$collection = collect([
    ['name' => 'Taylor Otwell', 'age' => 34],
    ['name' => 'Abigail Otwell', 'age' => 30],
    ['name' => 'Taylor Otwell', 'age' => 36],
    ['name' => 'Abigail Otwell', 'age' => 32],
]);

$sorted = $collection->sortBy([
    ['name', 'asc'],
    ['age', 'desc'],
]);

$sorted->values()->all();

/*
    [
        ['name' => 'Abigail Otwell', 'age' => 32],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Taylor Otwell', 'age' => 34],
    ]
*/
```

Khi sắp xếp collection theo nhiều thuộc tính, bạn cũng có thể cung cấp các closure để định nghĩa từng thao tác sắp xếp:

```php
$collection = collect([
    ['name' => 'Taylor Otwell', 'age' => 34],
    ['name' => 'Abigail Otwell', 'age' => 30],
    ['name' => 'Taylor Otwell', 'age' => 36],
    ['name' => 'Abigail Otwell', 'age' => 32],
]);

$sorted = $collection->sortBy([
    fn (array $a, array $b) => $a['name'] <=> $b['name'],
    fn (array $a, array $b) => $b['age'] <=> $a['age'],
]);

$sorted->values()->all();

/*
    [
        ['name' => 'Abigail Otwell', 'age' => 32],
        ['name' => 'Abigail Otwell', 'age' => 30],
        ['name' => 'Taylor Otwell', 'age' => 36],
        ['name' => 'Taylor Otwell', 'age' => 34],
    ]
*/
```

<a name="method-sortbydesc"></a>
#### `sortByDesc()` {.collection-method}

Method này có cùng signature với method [sortBy](#method-sortby), nhưng sẽ sắp xếp collection theo thứ tự ngược lại.

<a name="method-sortdesc"></a>
#### `sortDesc()` {.collection-method}

Method này sẽ sắp xếp collection theo thứ tự ngược với method [sort](#method-sort):

```php
$collection = collect([5, 3, 1, 2, 4]);

$sorted = $collection->sortDesc();

$sorted->values()->all();

// [5, 4, 3, 2, 1]
```

Khác với `sort`, bạn không thể truyền closure cho `sortDesc`. Thay vào đó, hãy sử dụng method [sort](#method-sort) và đảo ngược phép so sánh.

<a name="method-sortkeys"></a>
#### `sortKeys()` {.collection-method}

Method `sortKeys` sắp xếp collection theo các key của associative array bên dưới:

```php
$collection = collect([
    'id' => 22345,
    'first' => 'John',
    'last' => 'Doe',
]);

$sorted = $collection->sortKeys();

$sorted->all();

/*
    [
        'first' => 'John',
        'id' => 22345,
        'last' => 'Doe',
    ]
*/
```

<a name="method-sortkeysdesc"></a>
#### `sortKeysDesc()` {.collection-method}

Method này có cùng signature với method [sortKeys](#method-sortkeys), nhưng sẽ sắp xếp collection theo thứ tự ngược lại.

<a name="method-sortkeysusing"></a>
#### `sortKeysUsing()` {.collection-method}

Method `sortKeysUsing` sắp xếp collection theo các key của associative array bên dưới bằng một callback:

```php
$collection = collect([
    'ID' => 22345,
    'first' => 'John',
    'last' => 'Doe',
]);

$sorted = $collection->sortKeysUsing('strnatcasecmp');

$sorted->all();

/*
    [
        'first' => 'John',
        'ID' => 22345,
        'last' => 'Doe',
    ]
*/
```

Callback phải là một hàm so sánh trả về số nguyên nhỏ hơn, bằng hoặc lớn hơn 0. Để biết thêm thông tin, hãy tham khảo tài liệu PHP về [uksort](https://www.php.net/manual/en/function.uksort.php#refsect1-function.uksort-parameters), đây là hàm PHP được method `sortKeysUsing` sử dụng nội bộ.

<a name="method-splice"></a>
#### `splice()` {.collection-method}

Method `splice` xóa và trả về một phần các phần tử bắt đầu từ index được chỉ định:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2);

$chunk->all();

// [3, 4, 5]

$collection->all();

// [1, 2]
```

Bạn có thể truyền đối số thứ hai để giới hạn kích thước của collection kết quả:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 4, 5]
```

Ngoài ra, bạn có thể truyền đối số thứ ba chứa các phần tử mới để thay thế những phần tử đã bị xóa khỏi collection:

```php
$collection = collect([1, 2, 3, 4, 5]);

$chunk = $collection->splice(2, 1, [10, 11]);

$chunk->all();

// [3]

$collection->all();

// [1, 2, 10, 11, 4, 5]
```

<a name="method-split"></a>
#### `split()` {.collection-method}

Method `split` chia một collection thành số lượng nhóm được chỉ định:

```php
$collection = collect([1, 2, 3, 4, 5]);

$groups = $collection->split(3);

$groups->all();

// [[1, 2], [3, 4], [5]]
```

<a name="method-splitin"></a>
#### `splitIn()` {.collection-method}

Method `splitIn` chia một collection thành số lượng nhóm được chỉ định, điền đầy hoàn toàn các nhóm không phải nhóm cuối trước khi phân bổ phần còn lại cho nhóm cuối:

```php
$collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

$groups = $collection->splitIn(3);

$groups->all();

// [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]
```

<a name="method-sum"></a>
#### `sum()` {.collection-method}

Method `sum` trả về tổng của tất cả phần tử trong collection:

```php
collect([1, 2, 3, 4, 5])->sum();

// 15
```

Nếu collection chứa các array hoặc object lồng nhau, bạn nên truyền key dùng để xác định các giá trị cần tính tổng:

```php
$collection = collect([
    ['name' => 'JavaScript: The Good Parts', 'pages' => 176],
    ['name' => 'JavaScript: The Definitive Guide', 'pages' => 1096],
]);

$collection->sum('pages');

// 1272
```

Ngoài ra, bạn có thể truyền closure riêng để xác định các giá trị trong collection cần tính tổng:

```php
$collection = collect([
    ['name' => 'Chair', 'colors' => ['Black']],
    ['name' => 'Desk', 'colors' => ['Black', 'Mahogany']],
    ['name' => 'Bookcase', 'colors' => ['Red', 'Beige', 'Brown']],
]);

$collection->sum(function (array $product) {
    return count($product['colors']);
});

// 6
```

<a name="method-take"></a>
#### `take()` {.collection-method}

Method `take` trả về một collection mới với số lượng phần tử được chỉ định:

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(3);

$chunk->all();

// [0, 1, 2]
```

Bạn cũng có thể truyền một số nguyên âm để lấy số lượng phần tử được chỉ định từ cuối collection:

```php
$collection = collect([0, 1, 2, 3, 4, 5]);

$chunk = $collection->take(-2);

$chunk->all();

// [4, 5]
```

<a name="method-takeuntil"></a>
#### `takeUntil()` {.collection-method}

Method `takeUntil` trả về các phần tử trong collection cho đến khi callback đã cho trả về `true`:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(function (int $item) {
    return $item >= 3;
});

$subset->all();

// [1, 2]
```

Bạn cũng có thể truyền một giá trị đơn giản cho method `takeUntil` để lấy các phần tử cho đến khi tìm thấy giá trị đã cho:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeUntil(3);

$subset->all();

// [1, 2]
```

> [!WARNING]
> Nếu không tìm thấy giá trị đã cho hoặc callback không bao giờ trả về `true`, method `takeUntil` sẽ trả về tất cả phần tử trong collection.

<a name="method-takewhile"></a>
#### `takeWhile()` {.collection-method}

Method `takeWhile` trả về các phần tử trong collection cho đến khi callback đã cho trả về `false`:

```php
$collection = collect([1, 2, 3, 4]);

$subset = $collection->takeWhile(function (int $item) {
    return $item < 3;
});

$subset->all();

// [1, 2]
```

> [!WARNING]
> Nếu callback không bao giờ trả về `false`, method `takeWhile` sẽ trả về tất cả phần tử trong collection.

<a name="method-tap"></a>
#### `tap()` {.collection-method}

Method `tap` truyền collection vào callback đã cho, cho phép bạn "can thiệp" vào collection tại một thời điểm cụ thể và thực hiện thao tác với các phần tử mà không ảnh hưởng đến chính collection. Sau đó, method `tap` trả về collection:

```php
collect([2, 4, 3, 1, 5])
    ->sort()
    ->tap(function (Collection $collection) {
        Log::debug('Values after sorting', $collection->values()->all());
    })
    ->shift();

// 1
```

<a name="method-times"></a>
#### `times()` {.collection-method}

Method static `times` tạo một collection mới bằng cách gọi closure đã cho với số lần được chỉ định:

```php
$collection = Collection::times(10, function (int $number) {
    return $number * 9;
});

$collection->all();

// [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
```

<a name="method-toarray"></a>
#### `toArray()` {.collection-method}

Method `toArray` chuyển collection thành một PHP `array` thuần. Nếu các giá trị trong collection là model [Eloquent](/docs/{{version}}/eloquent), các model cũng sẽ được chuyển thành array:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toArray();

/*
    [
        ['name' => 'Desk', 'price' => 200],
    ]
*/
```

> [!WARNING]
> `toArray` cũng chuyển tất cả object lồng nhau trong collection có implement `Arrayable` thành array. Nếu muốn lấy raw array bên dưới collection, hãy sử dụng method [all](#method-all).

<a name="method-tojson"></a>
#### `toJson()` {.collection-method}

Method `toJson` chuyển collection thành một chuỗi JSON đã serialize:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toJson();

// '{"name":"Desk", "price":200}'
```

<a name="method-to-pretty-json"></a>
#### `toPrettyJson()` {.collection-method}

Method `toPrettyJson` chuyển collection thành chuỗi JSON đã được định dạng bằng option `JSON_PRETTY_PRINT`:

```php
$collection = collect(['name' => 'Desk', 'price' => 200]);

$collection->toPrettyJson();
```

<a name="method-transform"></a>
#### `transform()` {.collection-method}

Method `transform` lặp qua collection và gọi callback đã cho với từng phần tử. Các phần tử trong collection sẽ được thay thế bằng những giá trị do callback trả về:

```php
$collection = collect([1, 2, 3, 4, 5]);

$collection->transform(function (int $item, int $key) {
    return $item * 2;
});

$collection->all();

// [2, 4, 6, 8, 10]
```

> [!WARNING]
> Khác với hầu hết các method collection khác, `transform` thay đổi trực tiếp collection. Nếu muốn tạo một collection mới, hãy sử dụng method [map](#method-map).

<a name="method-undot"></a>
#### `undot()` {.collection-method}

Method `undot` mở rộng một collection một chiều sử dụng ký pháp "dot" thành collection đa chiều:

```php
$person = collect([
    'name.first_name' => 'Marie',
    'name.last_name' => 'Valentine',
    'address.line_1' => '2992 Eagle Drive',
    'address.line_2' => '',
    'address.suburb' => 'Detroit',
    'address.state' => 'MI',
    'address.postcode' => '48219'
]);

$person = $person->undot();

$person->toArray();

/*
    [
        "name" => [
            "first_name" => "Marie",
            "last_name" => "Valentine",
        ],
        "address" => [
            "line_1" => "2992 Eagle Drive",
            "line_2" => "",
            "suburb" => "Detroit",
            "state" => "MI",
            "postcode" => "48219",
        ],
    ]
*/
```

<a name="method-union"></a>
#### `union()` {.collection-method}

Method `union` thêm array đã cho vào collection. Nếu array đã cho chứa các key đã tồn tại trong collection ban đầu, các giá trị của collection ban đầu sẽ được ưu tiên:

```php
$collection = collect([1 => ['a'], 2 => ['b']]);

$union = $collection->union([3 => ['c'], 1 => ['d']]);

$union->all();

// [1 => ['a'], 2 => ['b'], 3 => ['c']]
```

<a name="method-unique"></a>
#### `unique()` {.collection-method}

Method `unique` trả về tất cả phần tử duy nhất trong collection. Collection trả về vẫn giữ các key mảng ban đầu, vì vậy trong ví dụ sau chúng ta sẽ dùng method [values](#method-values) để đặt lại key thành các index liên tiếp:

```php
$collection = collect([1, 1, 2, 2, 3, 4, 2]);

$unique = $collection->unique();

$unique->values()->all();

// [1, 2, 3, 4]
```

Khi làm việc với các array hoặc object lồng nhau, bạn có thể chỉ định key dùng để xác định tính duy nhất:

```php
$collection = collect([
    ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
    ['name' => 'iPhone 5', 'brand' => 'Apple', 'type' => 'phone'],
    ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
    ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
    ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
]);

$unique = $collection->unique('brand');

$unique->values()->all();

/*
    [
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
    ]
*/
```

Cuối cùng, bạn cũng có thể truyền closure riêng cho method `unique` để chỉ định giá trị nào sẽ quyết định tính duy nhất của một phần tử:

```php
$unique = $collection->unique(function (array $item) {
    return $item['brand'].$item['type'];
});

$unique->values()->all();

/*
    [
        ['name' => 'iPhone 6', 'brand' => 'Apple', 'type' => 'phone'],
        ['name' => 'Apple Watch', 'brand' => 'Apple', 'type' => 'watch'],
        ['name' => 'Galaxy S6', 'brand' => 'Samsung', 'type' => 'phone'],
        ['name' => 'Galaxy Gear', 'brand' => 'Samsung', 'type' => 'watch'],
    ]
*/
```

Method `unique` sử dụng phép so sánh "loose" khi kiểm tra giá trị phần tử, nghĩa là một chuỗi biểu diễn số nguyên sẽ được xem là bằng với số nguyên có cùng giá trị. Hãy sử dụng method [uniqueStrict](#method-uniquestrict) để lọc bằng phép so sánh "strict".

> [!NOTE]
> Hành vi của method này được thay đổi khi sử dụng [Eloquent Collections](/docs/{{version}}/eloquent-collections#method-unique).

<a name="method-uniquestrict"></a>
#### `uniqueStrict()` {.collection-method}

Method này có cùng signature với method [unique](#method-unique); tuy nhiên, tất cả giá trị được so sánh bằng phép so sánh "strict".

<a name="method-unless"></a>
#### `unless()` {.collection-method}

Method `unless` sẽ thực thi callback đã cho trừ khi đối số đầu tiên truyền vào method được đánh giá là `true`. Instance collection và đối số đầu tiên truyền vào method `unless` sẽ được cung cấp cho closure:

```php
$collection = collect([1, 2, 3]);

$collection->unless(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
});

$collection->unless(false, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

Có thể truyền callback thứ hai cho method `unless`. Callback thứ hai sẽ được thực thi khi đối số đầu tiên truyền vào method `unless` được đánh giá là `true`:

```php
$collection = collect([1, 2, 3]);

$collection->unless(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
}, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

Để thực hiện thao tác ngược với `unless`, hãy xem method [when](#method-when).

<a name="method-unlessempty"></a>
#### `unlessEmpty()` {.collection-method}

Alias của method [whenNotEmpty](#method-whennotempty).

<a name="method-unlessnotempty"></a>
#### `unlessNotEmpty()` {.collection-method}

Alias của method [whenEmpty](#method-whenempty).

<a name="method-unwrap"></a>
#### `unwrap()` {.collection-method}

Method static `unwrap` trả về các phần tử bên dưới collection từ giá trị đã cho khi phù hợp:

```php
Collection::unwrap(collect('John Doe'));

// ['John Doe']

Collection::unwrap(['John Doe']);

// ['John Doe']

Collection::unwrap('John Doe');

// 'John Doe'
```

<a name="method-value"></a>
#### `value()` {.collection-method}

Method `value` lấy một giá trị đã cho từ phần tử đầu tiên của collection:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Speaker', 'price' => 400],
]);

$value = $collection->value('price');

// 200
```

<a name="method-values"></a>
#### `values()` {.collection-method}

Method `values` trả về một collection mới với các key được đặt lại thành các số nguyên liên tiếp:

```php
$collection = collect([
    10 => ['product' => 'Desk', 'price' => 200],
    11 => ['product' => 'Speaker', 'price' => 400],
]);

$values = $collection->values();

$values->all();

/*
    [
        0 => ['product' => 'Desk', 'price' => 200],
        1 => ['product' => 'Speaker', 'price' => 400],
    ]
*/
```

<a name="method-when"></a>
#### `when()` {.collection-method}

Method `when` sẽ thực thi callback đã cho khi đối số đầu tiên truyền vào method được đánh giá là `true`. Instance collection và đối số đầu tiên truyền vào method `when` sẽ được cung cấp cho closure:

```php
$collection = collect([1, 2, 3]);

$collection->when(true, function (Collection $collection, bool $value) {
    return $collection->push(4);
});

$collection->when(false, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 4]
```

Có thể truyền callback thứ hai cho method `when`. Callback thứ hai sẽ được thực thi khi đối số đầu tiên truyền vào method `when` được đánh giá là `false`:

```php
$collection = collect([1, 2, 3]);

$collection->when(false, function (Collection $collection, bool $value) {
    return $collection->push(4);
}, function (Collection $collection, bool $value) {
    return $collection->push(5);
});

$collection->all();

// [1, 2, 3, 5]
```

Để thực hiện thao tác ngược với `when`, hãy xem method [unless](#method-unless).

<a name="method-whenempty"></a>
#### `whenEmpty()` {.collection-method}

Method `whenEmpty` sẽ thực thi callback đã cho khi collection rỗng:

```php
$collection = collect(['Michael', 'Tom']);

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Michael', 'Tom']

$collection = collect();

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Adam']
```

Có thể truyền closure thứ hai cho method `whenEmpty`; closure này sẽ được thực thi khi collection không rỗng:

```php
$collection = collect(['Michael', 'Tom']);

$collection->whenEmpty(function (Collection $collection) {
    return $collection->push('Adam');
}, function (Collection $collection) {
    return $collection->push('Taylor');
});

$collection->all();

// ['Michael', 'Tom', 'Taylor']
```

Để thực hiện thao tác ngược với `whenEmpty`, hãy xem method [whenNotEmpty](#method-whennotempty).

<a name="method-whennotempty"></a>
#### `whenNotEmpty()` {.collection-method}

Method `whenNotEmpty` sẽ thực thi callback đã cho khi collection không rỗng:

```php
$collection = collect(['Michael', 'Tom']);

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// ['Michael', 'Tom', 'Adam']

$collection = collect();

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('Adam');
});

$collection->all();

// []
```

Có thể truyền closure thứ hai cho method `whenNotEmpty`; closure này sẽ được thực thi khi collection rỗng:

```php
$collection = collect();

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('Adam');
}, function (Collection $collection) {
    return $collection->push('Taylor');
});

$collection->all();

// ['Taylor']
```

Để thực hiện thao tác ngược với `whenNotEmpty`, hãy xem method [whenEmpty](#method-whenempty).

<a name="method-where"></a>
#### `where()` {.collection-method}

Method `where` lọc collection theo một cặp key / value đã cho:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->where('price', 100);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

Method `where` sử dụng phép so sánh "loose" khi kiểm tra giá trị phần tử, nghĩa là một chuỗi biểu diễn số nguyên sẽ được xem là bằng với số nguyên có cùng giá trị. Hãy sử dụng method [whereStrict](#method-wherestrict) để lọc bằng phép so sánh "strict", hoặc các method [whereNull](#method-wherenull) và [whereNotNull](#method-wherenotnull) để lọc các giá trị `null`.

Bạn có thể tùy chọn truyền toán tử so sánh làm tham số thứ hai. Các toán tử được hỗ trợ gồm: '===', '!==', '!=', '==', '=', '<>', '>', '<', '>=', và '<=':

```php
$collection = collect([
    ['name' => 'Jim', 'platform' => 'Mac'],
    ['name' => 'Sally', 'platform' => 'Mac'],
    ['name' => 'Sue', 'platform' => 'Linux'],
]);

$filtered = $collection->where('platform', '!=', 'Linux');

$filtered->all();

/*
    [
        ['name' => 'Jim', 'platform' => 'Mac'],
        ['name' => 'Sally', 'platform' => 'Mac'],
    ]
*/
```

<a name="method-wherestrict"></a>
#### `whereStrict()` {.collection-method}

Method này có cùng signature với method [where](#method-where); tuy nhiên, tất cả giá trị được so sánh bằng phép so sánh "strict".

<a name="method-wherebetween"></a>
#### `whereBetween()` {.collection-method}

Method `whereBetween` lọc collection bằng cách xác định xem giá trị của phần tử được chỉ định có nằm trong khoảng đã cho hay không:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 80],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Pencil', 'price' => 30],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereBetween('price', [100, 200]);

$filtered->all();

/*
    [
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Bookcase', 'price' => 150],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

<a name="method-wherein"></a>
#### `whereIn()` {.collection-method}

Method `whereIn` loại khỏi collection các phần tử có giá trị được chỉ định không nằm trong array đã cho:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereIn('price', [150, 200]);

$filtered->all();

/*
    [
        ['product' => 'Desk', 'price' => 200],
        ['product' => 'Bookcase', 'price' => 150],
    ]
*/
```

Method `whereIn` sử dụng phép so sánh "loose" khi kiểm tra giá trị phần tử, nghĩa là một chuỗi biểu diễn số nguyên sẽ được xem là bằng với số nguyên có cùng giá trị. Hãy sử dụng method [whereInStrict](#method-whereinstrict) để lọc bằng phép so sánh "strict".

<a name="method-whereinstrict"></a>
#### `whereInStrict()` {.collection-method}

Method này có cùng signature với method [whereIn](#method-wherein); tuy nhiên, tất cả giá trị được so sánh bằng phép so sánh "strict".

<a name="method-whereinstanceof"></a>
#### `whereInstanceOf()` {.collection-method}

Method `whereInstanceOf` lọc collection theo class type đã cho:

```php
use App\Models\User;
use App\Models\Post;

$collection = collect([
    new User,
    new User,
    new Post,
]);

$filtered = $collection->whereInstanceOf(User::class);

$filtered->all();

// [App\Models\User, App\Models\User]
```

<a name="method-wherenotbetween"></a>
#### `whereNotBetween()` {.collection-method}

Method `whereNotBetween` lọc collection bằng cách xác định xem giá trị của phần tử được chỉ định có nằm ngoài khoảng đã cho hay không:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 80],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Pencil', 'price' => 30],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereNotBetween('price', [100, 200]);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 80],
        ['product' => 'Pencil', 'price' => 30],
    ]
*/
```

<a name="method-wherenotin"></a>
#### `whereNotIn()` {.collection-method}

Method `whereNotIn` loại khỏi collection các phần tử có giá trị được chỉ định nằm trong array đã cho:

```php
$collection = collect([
    ['product' => 'Desk', 'price' => 200],
    ['product' => 'Chair', 'price' => 100],
    ['product' => 'Bookcase', 'price' => 150],
    ['product' => 'Door', 'price' => 100],
]);

$filtered = $collection->whereNotIn('price', [150, 200]);

$filtered->all();

/*
    [
        ['product' => 'Chair', 'price' => 100],
        ['product' => 'Door', 'price' => 100],
    ]
*/
```

Method `whereNotIn` sử dụng phép so sánh "loose" khi kiểm tra giá trị phần tử, nghĩa là một chuỗi biểu diễn số nguyên sẽ được xem là bằng với số nguyên có cùng giá trị. Hãy sử dụng method [whereNotInStrict](#method-wherenotinstrict) để lọc bằng phép so sánh "strict".

<a name="method-wherenotinstrict"></a>
#### `whereNotInStrict()` {.collection-method}

Method này có cùng signature với method [whereNotIn](#method-wherenotin); tuy nhiên, tất cả giá trị được so sánh bằng phép so sánh "strict".

<a name="method-wherenotnull"></a>
#### `whereNotNull()` {.collection-method}

Method `whereNotNull` trả về các phần tử trong collection mà key đã cho không phải `null`:

```php
$collection = collect([
    ['name' => 'Desk'],
    ['name' => null],
    ['name' => 'Bookcase'],
    ['name' => 0],
    ['name' => ''],
]);

$filtered = $collection->whereNotNull('name');

$filtered->all();

/*
    [
        ['name' => 'Desk'],
        ['name' => 'Bookcase'],
        ['name' => 0],
        ['name' => ''],
    ]
*/
```

<a name="method-wherenull"></a>
#### `whereNull()` {.collection-method}

Method `whereNull` trả về các phần tử trong collection mà key đã cho là `null`:

```php
$collection = collect([
    ['name' => 'Desk'],
    ['name' => null],
    ['name' => 'Bookcase'],
    ['name' => 0],
    ['name' => ''],
]);

$filtered = $collection->whereNull('name');

$filtered->all();

/*
    [
        ['name' => null],
    ]
*/
```

<a name="method-wrap"></a>
#### `wrap()` {.collection-method}

Method static `wrap` bọc giá trị đã cho trong một collection khi phù hợp:

```php
use Illuminate\Support\Collection;

$collection = Collection::wrap('John Doe');

$collection->all();

// ['John Doe']

$collection = Collection::wrap(['John Doe']);

$collection->all();

// ['John Doe']

$collection = Collection::wrap(collect('John Doe'));

$collection->all();

// ['John Doe']
```

<a name="method-zip"></a>
#### `zip()` {.collection-method}

Method `zip` ghép các giá trị của array đã cho với các giá trị của collection ban đầu tại index tương ứng:

```php
$collection = collect(['Chair', 'Desk']);

$zipped = $collection->zip([100, 200]);

$zipped->all();

// [['Chair', 100], ['Desk', 200]]
```

<a name="higher-order-messages"></a>
## Higher Order Messages

Collections cũng hỗ trợ "higher order messages", là các cách viết tắt để thực hiện những thao tác phổ biến trên collection. Các method collection hỗ trợ higher order messages gồm: [average](#method-average), [avg](#method-avg), [contains](#method-contains), [each](#method-each), [every](#method-every), [filter](#method-filter), [first](#method-first), [flatMap](#method-flatmap), [groupBy](#method-groupby), [keyBy](#method-keyby), [map](#method-map), [max](#method-max), [min](#method-min), [partition](#method-partition), [reject](#method-reject), [skipUntil](#method-skipuntil), [skipWhile](#method-skipwhile), [some](#method-some), [sortBy](#method-sortby), [sortByDesc](#method-sortbydesc), [sum](#method-sum), [takeUntil](#method-takeuntil), [takeWhile](#method-takewhile), và [unique](#method-unique).

Mỗi higher order message có thể được truy cập như một dynamic property trên instance collection. Ví dụ, hãy dùng higher order message `each` để gọi một method trên từng object trong collection:

```php
use App\Models\User;

$users = User::where('votes', '>', 500)->get();

$users->each->markAsVip();
```

Tương tự, chúng ta có thể dùng higher order message `sum` để tính tổng số "votes" của một collection người dùng:

```php
$users = User::where('group', 'Development')->get();

return $users->sum->votes;
```

<a name="lazy-collections"></a>
## Lazy Collection

<a name="lazy-collection-introduction"></a>
### Giới thiệu

> [!WARNING]
> Trước khi tìm hiểu sâu hơn về lazy collections của Laravel, hãy dành thời gian làm quen với [PHP generators](https://www.php.net/manual/en/language.generators.overview.php).

Để bổ sung cho class `Collection` vốn đã rất mạnh, class `LazyCollection` tận dụng [generators](https://www.php.net/manual/en/language.generators.overview.php) của PHP để cho phép bạn làm việc với các tập dữ liệu rất lớn mà vẫn giữ mức sử dụng bộ nhớ thấp.

Ví dụ, hãy tưởng tượng ứng dụng cần xử lý một file log có kích thước nhiều gigabyte đồng thời tận dụng các method collection của Laravel để phân tích log. Thay vì đọc toàn bộ file vào bộ nhớ cùng lúc, lazy collections có thể được dùng để chỉ giữ một phần nhỏ của file trong bộ nhớ tại mỗi thời điểm:

```php
use App\Models\LogEntry;
use Illuminate\Support\LazyCollection;

LazyCollection::make(function () {
    $handle = fopen('log.txt', 'r');

    while (($line = fgets($handle)) !== false) {
        yield $line;
    }

    fclose($handle);
})->chunk(4)->map(function (array $lines) {
    return LogEntry::fromLines($lines);
})->each(function (LogEntry $logEntry) {
    // Process the log entry...
});
```

Hoặc, hãy tưởng tượng bạn cần lặp qua 10.000 Eloquent model. Khi sử dụng collection Laravel truyền thống, toàn bộ 10.000 Eloquent model phải được nạp vào bộ nhớ cùng lúc:

```php
use App\Models\User;

$users = User::all()->filter(function (User $user) {
    return $user->id > 500;
});
```

Tuy nhiên, method `cursor` của query builder trả về một instance `LazyCollection`. Điều này cho phép bạn vẫn chỉ chạy một query duy nhất tới database nhưng tại mỗi thời điểm chỉ giữ một Eloquent model trong bộ nhớ. Trong ví dụ này, callback `filter` chưa được thực thi cho đến khi chúng ta thực sự lặp qua từng user, nhờ đó giảm đáng kể mức sử dụng bộ nhớ:

```php
use App\Models\User;

$users = User::cursor()->filter(function (User $user) {
    return $user->id > 500;
});

foreach ($users as $user) {
    echo $user->id;
}
```

<a name="creating-lazy-collections"></a>
### Tạo Lazy Collection

Để tạo một instance lazy collection, bạn nên truyền một PHP generator function vào method `make` của collection:

```php
use Illuminate\Support\LazyCollection;

LazyCollection::make(function () {
    $handle = fopen('log.txt', 'r');

    while (($line = fgets($handle)) !== false) {
        yield $line;
    }

    fclose($handle);
});
```

<a name="the-enumerable-contract"></a>
### Contract Enumerable

Hầu hết các method có trên class `Collection` cũng có trên class `LazyCollection`. Cả hai class đều implement contract `Illuminate\Support\Enumerable`, contract này định nghĩa các method sau:

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

<div class="collection-method-list" markdown="1">

[all](#method-all)
[average](#method-average)
[avg](#method-avg)
[chunk](#method-chunk)
[chunkWhile](#method-chunkwhile)
[collapse](#method-collapse)
[collect](#method-collect)
[combine](#method-combine)
[concat](#method-concat)
[contains](#method-contains)
[containsStrict](#method-containsstrict)
[count](#method-count)
[countBy](#method-countBy)
[crossJoin](#method-crossjoin)
[dd](#method-dd)
[diff](#method-diff)
[diffAssoc](#method-diffassoc)
[diffKeys](#method-diffkeys)
[dump](#method-dump)
[duplicates](#method-duplicates)
[duplicatesStrict](#method-duplicatesstrict)
[each](#method-each)
[eachSpread](#method-eachspread)
[every](#method-every)
[except](#method-except)
[filter](#method-filter)
[first](#method-first)
[firstOrFail](#method-first-or-fail)
[firstWhere](#method-first-where)
[flatMap](#method-flatmap)
[flatten](#method-flatten)
[flip](#method-flip)
[forPage](#method-forpage)
[get](#method-get)
[groupBy](#method-groupby)
[has](#method-has)
[implode](#method-implode)
[intersect](#method-intersect)
[intersectAssoc](#method-intersectAssoc)
[intersectByKeys](#method-intersectbykeys)
[isEmpty](#method-isempty)
[isNotEmpty](#method-isnotempty)
[join](#method-join)
[keyBy](#method-keyby)
[keys](#method-keys)
[last](#method-last)
[macro](#method-macro)
[make](#method-make)
[map](#method-map)
[mapInto](#method-mapinto)
[mapSpread](#method-mapspread)
[mapToGroups](#method-maptogroups)
[mapWithKeys](#method-mapwithkeys)
[max](#method-max)
[median](#method-median)
[merge](#method-merge)
[mergeRecursive](#method-mergerecursive)
[min](#method-min)
[mode](#method-mode)
[nth](#method-nth)
[only](#method-only)
[pad](#method-pad)
[partition](#method-partition)
[pipe](#method-pipe)
[pluck](#method-pluck)
[random](#method-random)
[reduce](#method-reduce)
[reduceInto](#method-reduce-into)
[reject](#method-reject)
[replace](#method-replace)
[replaceRecursive](#method-replacerecursive)
[reverse](#method-reverse)
[search](#method-search)
[shuffle](#method-shuffle)
[skip](#method-skip)
[slice](#method-slice)
[sole](#method-sole)
[some](#method-some)
[sort](#method-sort)
[sortBy](#method-sortby)
[sortByDesc](#method-sortbydesc)
[sortKeys](#method-sortkeys)
[sortKeysDesc](#method-sortkeysdesc)
[split](#method-split)
[sum](#method-sum)
[take](#method-take)
[tap](#method-tap)
[times](#method-times)
[toArray](#method-toarray)
[toJson](#method-tojson)
[union](#method-union)
[unique](#method-unique)
[uniqueStrict](#method-uniquestrict)
[unless](#method-unless)
[unlessEmpty](#method-unlessempty)
[unlessNotEmpty](#method-unlessnotempty)
[unwrap](#method-unwrap)
[values](#method-values)
[when](#method-when)
[whenEmpty](#method-whenempty)
[whenNotEmpty](#method-whennotempty)
[where](#method-where)
[whereStrict](#method-wherestrict)
[whereBetween](#method-wherebetween)
[whereIn](#method-wherein)
[whereInStrict](#method-whereinstrict)
[whereInstanceOf](#method-whereinstanceof)
[whereNotBetween](#method-wherenotbetween)
[whereNotIn](#method-wherenotin)
[whereNotInStrict](#method-wherenotinstrict)
[wrap](#method-wrap)
[zip](#method-zip)

</div>

> [!WARNING]
> Các method làm thay đổi collection (chẳng hạn `shift`, `pop`, `prepend`, v.v.) **không** có trên class `LazyCollection`.

<a name="lazy-collection-methods"></a>
### Các method của Lazy Collection

Ngoài các method được định nghĩa trong contract `Enumerable`, class `LazyCollection` còn có các method sau:

<a name="method-takeUntilTimeout"></a>
#### `takeUntilTimeout()` {.collection-method}

Method `takeUntilTimeout` trả về một lazy collection mới sẽ liệt kê các giá trị cho đến thời điểm được chỉ định. Sau thời điểm đó, collection sẽ dừng việc liệt kê:

```php
$lazyCollection = LazyCollection::times(INF)
    ->takeUntilTimeout(now()->plus(minutes: 1));

$lazyCollection->each(function (int $number) {
    dump($number);

    sleep(1);
});

// 1
// 2
// ...
// 58
// 59
```

Để minh họa cách sử dụng method này, hãy tưởng tượng một ứng dụng gửi invoice từ database bằng cursor. Bạn có thể định nghĩa một [scheduled task](/docs/{{version}}/scheduling) chạy mỗi 15 phút và chỉ xử lý invoice trong tối đa 14 phút:

```php
use App\Models\Invoice;
use Illuminate\Support\Carbon;

Invoice::pending()->cursor()
    ->takeUntilTimeout(
        Carbon::createFromTimestamp(LARAVEL_START)->add(14, 'minutes')
    )
    ->each(fn (Invoice $invoice) => $invoice->submit());
```

<a name="method-tapEach"></a>
#### `tapEach()` {.collection-method}

Trong khi method `each` gọi callback đã cho ngay lập tức cho từng phần tử trong collection, method `tapEach` chỉ gọi callback khi các phần tử lần lượt được lấy ra khỏi danh sách:

```php
// Nothing has been dumped so far...
$lazyCollection = LazyCollection::times(INF)->tapEach(function (int $value) {
    dump($value);
});

// Three items are dumped...
$array = $lazyCollection->take(3)->all();

// 1
// 2
// 3
```

<a name="method-throttle"></a>
#### `throttle()` {.collection-method}

Method `throttle` sẽ giới hạn tốc độ lazy collection để mỗi giá trị được trả về sau số giây được chỉ định. Method này đặc biệt hữu ích trong các tình huống bạn tương tác với external API có giới hạn tốc độ request gửi đến:

```php
use App\Models\User;

User::where('vip', true)
    ->cursor()
    ->throttle(seconds: 1)
    ->each(function (User $user) {
        // Call external API...
    });
```

<a name="method-remember"></a>
#### `remember()` {.collection-method}

Method `remember` trả về một lazy collection mới có khả năng ghi nhớ các giá trị đã được liệt kê và không lấy lại chúng trong những lần liệt kê collection tiếp theo:

```php
// No query has been executed yet...
$users = User::cursor()->remember();

// The query is executed...
// The first 5 users are hydrated from the database...
$users->take(5)->all();

// First 5 users come from the collection's cache...
// The rest are hydrated from the database...
$users->take(20)->all();
```

<a name="method-with-heartbeat"></a>
#### `withHeartbeat()` {.collection-method}

Method `withHeartbeat` cho phép bạn thực thi callback theo các khoảng thời gian đều đặn trong khi lazy collection đang được liệt kê. Điều này đặc biệt hữu ích cho các thao tác chạy lâu cần thực hiện tác vụ bảo trì định kỳ, chẳng hạn gia hạn lock hoặc gửi cập nhật tiến độ:

```php
use Carbon\CarbonInterval;
use Illuminate\Support\Facades\Cache;

$lock = Cache::lock('generate-reports', seconds: 60 * 5);

if ($lock->get()) {
    try {
        Report::where('status', 'pending')
            ->lazy()
            ->withHeartbeat(
                CarbonInterval::minutes(4),
                fn () => $lock->extend(CarbonInterval::minutes(5))
            )
            ->each(fn ($report) => $report->process());
    } finally {
        $lock->release();
    }
}
```

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/collections). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
