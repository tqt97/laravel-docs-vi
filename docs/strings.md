# Chuỗi

- [Giới thiệu](#introduction)
- [Các phương thức có sẵn](#available-methods)

<a name="introduction"></a>
## Giới thiệu

Laravel cung cấp nhiều hàm tiện ích để thao tác với giá trị chuỗi. Nhiều hàm trong số này được chính framework sử dụng nội bộ; tuy vậy, bạn hoàn toàn có thể dùng chúng trong ứng dụng của mình khi thấy phù hợp.

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

<a name="strings-method-list"></a>
### Chuỗi

<div class="collection-method-list" markdown="1">

[\__](#method-__)
[class_basename](#method-class-basename)
[e](#method-e)
[preg_replace_array](#method-preg-replace-array)
[Str::after](#method-str-after)
[Str::afterLast](#method-str-after-last)
[Str::apa](#method-str-apa)
[Str::ascii](#method-str-ascii)
[Str::before](#method-str-before)
[Str::beforeLast](#method-str-before-last)
[Str::between](#method-str-between)
[Str::betweenFirst](#method-str-between-first)
[Str::camel](#method-camel-case)
[Str::charAt](#method-char-at)
[Str::chopStart](#method-str-chop-start)
[Str::chopEnd](#method-str-chop-end)
[Str::contains](#method-str-contains)
[Str::containsAll](#method-str-contains-all)
[Str::counted](#method-str-counted)
[Str::doesntContain](#method-str-doesnt-contain)
[Str::doesntEndWith](#method-str-doesnt-end-with)
[Str::doesntStartWith](#method-str-doesnt-start-with)
[Str::deduplicate](#method-deduplicate)
[Str::endsWith](#method-ends-with)
[Str::excerpt](#method-excerpt)
[Str::finish](#method-str-finish)
[Str::fromBase64](#method-str-from-base64)
[Str::headline](#method-str-headline)
[Str::initials](#method-str-initials)
[Str::inlineMarkdown](#method-str-inline-markdown)
[Str::is](#method-str-is)
[Str::isAscii](#method-str-is-ascii)
[Str::isJson](#method-str-is-json)
[Str::isUlid](#method-str-is-ulid)
[Str::isUrl](#method-str-is-url)
[Str::isUuid](#method-str-is-uuid)
[Str::kebab](#method-kebab-case)
[Str::lcfirst](#method-str-lcfirst)
[Str::length](#method-str-length)
[Str::limit](#method-str-limit)
[Str::lower](#method-str-lower)
[Str::markdown](#method-str-markdown)
[Str::mask](#method-str-mask)
[Str::match](#method-str-match)
[Str::matchAll](#method-str-match-all)
[Str::isMatch](#method-str-is-match)
[Str::orderedUuid](#method-str-ordered-uuid)
[Str::padBoth](#method-str-padboth)
[Str::padLeft](#method-str-padleft)
[Str::padRight](#method-str-padright)
[Str::password](#method-str-password)
[Str::plural](#method-str-plural)
[Str::pluralStudly](#method-str-plural-studly)
[Str::position](#method-str-position)
[Str::random](#method-str-random)
[Str::remove](#method-str-remove)
[Str::repeat](#method-str-repeat)
[Str::replace](#method-str-replace)
[Str::replaceArray](#method-str-replace-array)
[Str::replaceFirst](#method-str-replace-first)
[Str::replaceLast](#method-str-replace-last)
[Str::replaceMatches](#method-str-replace-matches)
[Str::replaceStart](#method-str-replace-start)
[Str::replaceEnd](#method-str-replace-end)
[Str::reverse](#method-str-reverse)
[Str::singular](#method-str-singular)
[Str::slug](#method-str-slug)
[Str::snake](#method-snake-case)
[Str::squish](#method-str-squish)
[Str::start](#method-str-start)
[Str::startsWith](#method-starts-with)
[Str::studly](#method-studly-case)
[Str::substr](#method-str-substr)
[Str::substrCount](#method-str-substrcount)
[Str::substrReplace](#method-str-substrreplace)
[Str::swap](#method-str-swap)
[Str::take](#method-take)
[Str::title](#method-title-case)
[Str::toBase64](#method-str-to-base64)
[Str::transliterate](#method-str-transliterate)
[Str::trim](#method-str-trim)
[Str::ltrim](#method-str-ltrim)
[Str::rtrim](#method-str-rtrim)
[Str::ucfirst](#method-str-ucfirst)
[Str::ucsplit](#method-str-ucsplit)
[Str::ucwords](#method-str-ucwords)
[Str::upper](#method-str-upper)
[Str::ulid](#method-str-ulid)
[Str::unwrap](#method-str-unwrap)
[Str::uuid](#method-str-uuid)
[Str::uuid7](#method-str-uuid7)
[Str::wordCount](#method-str-word-count)
[Str::wordWrap](#method-str-word-wrap)
[Str::words](#method-str-words)
[Str::wrap](#method-str-wrap)
[str](#method-str)
[trans](#method-trans)
[trans_choice](#method-trans-choice)

</div>

<a name="fluent-strings-method-list"></a>
### Chuỗi dạng fluent

<div class="collection-method-list" markdown="1">

[after](#method-fluent-str-after)
[afterLast](#method-fluent-str-after-last)
[apa](#method-fluent-str-apa)
[append](#method-fluent-str-append)
[ascii](#method-fluent-str-ascii)
[basename](#method-fluent-str-basename)
[before](#method-fluent-str-before)
[beforeLast](#method-fluent-str-before-last)
[between](#method-fluent-str-between)
[betweenFirst](#method-fluent-str-between-first)
[camel](#method-fluent-str-camel)
[charAt](#method-fluent-str-char-at)
[classBasename](#method-fluent-str-class-basename)
[chopStart](#method-fluent-str-chop-start)
[chopEnd](#method-fluent-str-chop-end)
[contains](#method-fluent-str-contains)
[containsAll](#method-fluent-str-contains-all)
[counted](#method-fluent-str-counted)
[decrypt](#method-fluent-str-decrypt)
[deduplicate](#method-fluent-str-deduplicate)
[dirname](#method-fluent-str-dirname)
[doesntContain](#method-fluent-str-doesnt-contain)
[doesntEndWith](#method-fluent-str-doesnt-end-with)
[doesntStartWith](#method-fluent-str-doesnt-start-with)
[encrypt](#method-fluent-str-encrypt)
[endsWith](#method-fluent-str-ends-with)
[exactly](#method-fluent-str-exactly)
[excerpt](#method-fluent-str-excerpt)
[explode](#method-fluent-str-explode)
[finish](#method-fluent-str-finish)
[fromBase64](#method-fluent-str-from-base64)
[hash](#method-fluent-str-hash)
[headline](#method-fluent-str-headline)
[initials](#method-fluent-str-initials)
[inlineMarkdown](#method-fluent-str-inline-markdown)
[is](#method-fluent-str-is)
[isAscii](#method-fluent-str-is-ascii)
[isEmpty](#method-fluent-str-is-empty)
[isNotEmpty](#method-fluent-str-is-not-empty)
[isJson](#method-fluent-str-is-json)
[isUlid](#method-fluent-str-is-ulid)
[isUrl](#method-fluent-str-is-url)
[isUuid](#method-fluent-str-is-uuid)
[kebab](#method-fluent-str-kebab)
[lcfirst](#method-fluent-str-lcfirst)
[length](#method-fluent-str-length)
[limit](#method-fluent-str-limit)
[lower](#method-fluent-str-lower)
[markdown](#method-fluent-str-markdown)
[mask](#method-fluent-str-mask)
[match](#method-fluent-str-match)
[matchAll](#method-fluent-str-match-all)
[isMatch](#method-fluent-str-is-match)
[newLine](#method-fluent-str-new-line)
[padBoth](#method-fluent-str-padboth)
[padLeft](#method-fluent-str-padleft)
[padRight](#method-fluent-str-padright)
[pipe](#method-fluent-str-pipe)
[plural](#method-fluent-str-plural)
[position](#method-fluent-str-position)
[prepend](#method-fluent-str-prepend)
[remove](#method-fluent-str-remove)
[repeat](#method-fluent-str-repeat)
[replace](#method-fluent-str-replace)
[replaceArray](#method-fluent-str-replace-array)
[replaceFirst](#method-fluent-str-replace-first)
[replaceLast](#method-fluent-str-replace-last)
[replaceMatches](#method-fluent-str-replace-matches)
[replaceStart](#method-fluent-str-replace-start)
[replaceEnd](#method-fluent-str-replace-end)
[scan](#method-fluent-str-scan)
[singular](#method-fluent-str-singular)
[slug](#method-fluent-str-slug)
[snake](#method-fluent-str-snake)
[split](#method-fluent-str-split)
[squish](#method-fluent-str-squish)
[start](#method-fluent-str-start)
[startsWith](#method-fluent-str-starts-with)
[stripTags](#method-fluent-str-strip-tags)
[studly](#method-fluent-str-studly)
[substr](#method-fluent-str-substr)
[substrReplace](#method-fluent-str-substrreplace)
[swap](#method-fluent-str-swap)
[take](#method-fluent-str-take)
[tap](#method-fluent-str-tap)
[test](#method-fluent-str-test)
[title](#method-fluent-str-title)
[toBase64](#method-fluent-str-to-base64)
[toHtmlString](#method-fluent-str-to-html-string)
[toUri](#method-fluent-str-to-uri)
[transliterate](#method-fluent-str-transliterate)
[trim](#method-fluent-str-trim)
[ltrim](#method-fluent-str-ltrim)
[rtrim](#method-fluent-str-rtrim)
[ucfirst](#method-fluent-str-ucfirst)
[ucsplit](#method-fluent-str-ucsplit)
[ucwords](#method-fluent-str-ucwords)
[unwrap](#method-fluent-str-unwrap)
[upper](#method-fluent-str-upper)
[when](#method-fluent-str-when)
[whenContains](#method-fluent-str-when-contains)
[whenContainsAll](#method-fluent-str-when-contains-all)
[whenDoesntEndWith](#method-fluent-str-when-doesnt-end-with)
[whenDoesntStartWith](#method-fluent-str-when-doesnt-start-with)
[whenEmpty](#method-fluent-str-when-empty)
[whenNotEmpty](#method-fluent-str-when-not-empty)
[whenStartsWith](#method-fluent-str-when-starts-with)
[whenEndsWith](#method-fluent-str-when-ends-with)
[whenExactly](#method-fluent-str-when-exactly)
[whenNotExactly](#method-fluent-str-when-not-exactly)
[whenIs](#method-fluent-str-when-is)
[whenIsAscii](#method-fluent-str-when-is-ascii)
[whenIsUlid](#method-fluent-str-when-is-ulid)
[whenIsUuid](#method-fluent-str-when-is-uuid)
[whenTest](#method-fluent-str-when-test)
[wordCount](#method-fluent-str-word-count)
[words](#method-fluent-str-words)
[wrap](#method-fluent-str-wrap)

</div>

<a name="strings"></a>
## Chuỗi

<a name="method-__"></a>
#### `__()` {.collection-method}

Hàm `__` dịch chuỗi hoặc khóa bản dịch được cung cấp bằng các [file ngôn ngữ](/docs/{{version}}/localization) của ứng dụng:

```php
echo __('Welcome to our application');

echo __('messages.welcome');
```

Nếu chuỗi hoặc khóa bản dịch được chỉ định không tồn tại, hàm `__` sẽ trả về chính giá trị được truyền vào. Vì vậy, với ví dụ trên, `__` sẽ trả về `messages.welcome` nếu khóa bản dịch đó không tồn tại.

<a name="method-class-basename"></a>
#### `class_basename()` {.collection-method}

Hàm `class_basename` trả về tên class của class được cung cấp sau khi loại bỏ namespace:

```php
$class = class_basename('Foo\Bar\Baz');

// Baz
```

<a name="method-e"></a>
#### `e()` {.collection-method}

Hàm `e` gọi hàm `htmlspecialchars` của PHP, với tùy chọn `double_encode` mặc định được đặt thành `true`:

```php
echo e('<html>foo</html>');

// &lt;html&gt;foo&lt;/html&gt;
```

<a name="method-preg-replace-array"></a>
#### `preg_replace_array()` {.collection-method}

Hàm `preg_replace_array` lần lượt thay thế pattern được chỉ định trong chuỗi bằng các giá trị từ một mảng:

```php
$string = 'The event will take place between :start and :end';

$replaced = preg_replace_array('/:[a-z_]+/', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a name="method-str-after"></a>
#### `Str::after()` {.collection-method}

Phương thức `Str::after` trả về toàn bộ phần nằm sau giá trị được chỉ định trong chuỗi. Nếu giá trị đó không xuất hiện trong chuỗi, toàn bộ chuỗi sẽ được trả về:

```php
use Illuminate\Support\Str;

$slice = Str::after('This is my name', 'This is');

// ' my name'
```

<a name="method-str-after-last"></a>
#### `Str::afterLast()` {.collection-method}

Phương thức `Str::afterLast` trả về toàn bộ phần nằm sau lần xuất hiện cuối cùng của giá trị được chỉ định trong chuỗi. Nếu giá trị đó không xuất hiện trong chuỗi, toàn bộ chuỗi sẽ được trả về:

```php
use Illuminate\Support\Str;

$slice = Str::afterLast('App\Http\Controllers\Controller', '\\');

// 'Controller'
```

<a name="method-str-apa"></a>
#### `Str::apa()` {.collection-method}

Phương thức `Str::apa` chuyển chuỗi được cung cấp sang dạng viết hoa tiêu đề theo [quy tắc APA](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case):

```php
use Illuminate\Support\Str;

$title = Str::apa('Creating A Project');

// 'Creating a Project'
```

<a name="method-str-ascii"></a>
#### `Str::ascii()` {.collection-method}

Phương thức `Str::ascii` cố gắng chuyển tự chuỗi sang biểu diễn ASCII tương ứng:

```php
use Illuminate\Support\Str;

$slice = Str::ascii('û');

// 'u'
```

<a name="method-str-before"></a>
#### `Str::before()` {.collection-method}

Phương thức `Str::before` trả về toàn bộ phần nằm trước giá trị được chỉ định trong chuỗi:

```php
use Illuminate\Support\Str;

$slice = Str::before('This is my name', 'my name');

// 'This is '
```

<a name="method-str-before-last"></a>
#### `Str::beforeLast()` {.collection-method}

Phương thức `Str::beforeLast` trả về toàn bộ phần nằm trước lần xuất hiện cuối cùng của giá trị được chỉ định trong chuỗi:

```php
use Illuminate\Support\Str;

$slice = Str::beforeLast('This is my name', 'is');

// 'This '
```

<a name="method-str-between"></a>
#### `Str::between()` {.collection-method}

Phương thức `Str::between` trả về phần chuỗi nằm giữa hai giá trị được chỉ định:

```php
use Illuminate\Support\Str;

$slice = Str::between('This is my name', 'This', 'name');

// ' is my '
```

<a name="method-str-between-first"></a>
#### `Str::betweenFirst()` {.collection-method}

Phương thức `Str::betweenFirst` trả về phần chuỗi ngắn nhất có thể nằm giữa hai giá trị được chỉ định:

```php
use Illuminate\Support\Str;

$slice = Str::betweenFirst('[a] bc [d]', '[', ']');

// 'a'
```

<a name="method-camel-case"></a>
#### `Str::camel()` {.collection-method}

Phương thức `Str::camel` chuyển chuỗi được cung cấp sang dạng `camelCase`:

```php
use Illuminate\Support\Str;

$converted = Str::camel('foo_bar');

// 'fooBar'
```

<a name="method-char-at"></a>
#### `Str::charAt()` {.collection-method}

Phương thức `Str::charAt` trả về ký tự tại chỉ số được chỉ định. Nếu chỉ số nằm ngoài phạm vi chuỗi, phương thức trả về `false`:

```php
use Illuminate\Support\Str;

$character = Str::charAt('This is my name.', 6);

// 's'
```

<a name="method-str-chop-start"></a>
#### `Str::chopStart()` {.collection-method}

Phương thức `Str::chopStart` loại bỏ lần xuất hiện đầu tiên của giá trị được chỉ định, nhưng chỉ khi giá trị đó nằm ở đầu chuỗi:

```php
use Illuminate\Support\Str;

$url = Str::chopStart('https://laravel.com', 'https://');

// 'laravel.com'
```

Bạn cũng có thể truyền một mảng làm đối số thứ hai. Nếu chuỗi bắt đầu bằng bất kỳ giá trị nào trong mảng, giá trị đó sẽ bị loại bỏ khỏi chuỗi:

```php
use Illuminate\Support\Str;

$url = Str::chopStart('http://laravel.com', ['https://', 'http://']);

// 'laravel.com'
```

<a name="method-str-chop-end"></a>
#### `Str::chopEnd()` {.collection-method}

Phương thức `Str::chopEnd` loại bỏ lần xuất hiện cuối cùng của giá trị được chỉ định, nhưng chỉ khi giá trị đó nằm ở cuối chuỗi:

```php
use Illuminate\Support\Str;

$url = Str::chopEnd('app/Models/Photograph.php', '.php');

// 'app/Models/Photograph'
```

Bạn cũng có thể truyền một mảng làm đối số thứ hai. Nếu chuỗi kết thúc bằng bất kỳ giá trị nào trong mảng, giá trị đó sẽ bị loại bỏ khỏi chuỗi:

```php
use Illuminate\Support\Str;

$url = Str::chopEnd('laravel.com/index.php', ['/index.html', '/index.php']);

// 'laravel.com'
```

<a name="method-str-contains"></a>
#### `Str::contains()` {.collection-method}

Phương thức `Str::contains` xác định chuỗi được cung cấp có chứa giá trị chỉ định hay không. Mặc định, phép kiểm tra có phân biệt chữ hoa và chữ thường:

```php
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', 'my');

// true
```

Bạn cũng có thể truyền một mảng giá trị để kiểm tra chuỗi có chứa ít nhất một giá trị trong mảng hay không:

```php
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', ['my', 'foo']);

// true
```

Bạn có thể bỏ phân biệt chữ hoa và chữ thường bằng cách đặt đối số `ignoreCase` thành `true`:

```php
use Illuminate\Support\Str;

$contains = Str::contains('This is my name', 'MY', ignoreCase: true);

// true
```

<a name="method-str-contains-all"></a>
#### `Str::containsAll()` {.collection-method}

Phương thức `Str::containsAll` xác định chuỗi được cung cấp có chứa toàn bộ các giá trị trong mảng hay không:

```php
use Illuminate\Support\Str;

$containsAll = Str::containsAll('This is my name', ['my', 'name']);

// true
```

Bạn có thể bỏ phân biệt chữ hoa và chữ thường bằng cách đặt đối số `ignoreCase` thành `true`:

```php
use Illuminate\Support\Str;

$containsAll = Str::containsAll('This is my name', ['MY', 'NAME'], ignoreCase: true);

// true
```

<a name="method-str-doesnt-contain"></a>
#### `Str::doesntContain()` {.collection-method}

Phương thức `Str::doesntContain` xác định chuỗi được cung cấp không chứa giá trị chỉ định. Mặc định, phép kiểm tra có phân biệt chữ hoa và chữ thường:

```php
use Illuminate\Support\Str;

$doesntContain = Str::doesntContain('This is name', 'my');

// true
```

Bạn cũng có thể truyền một mảng giá trị để kiểm tra chuỗi không chứa bất kỳ giá trị nào trong mảng:

```php
use Illuminate\Support\Str;

$doesntContain = Str::doesntContain('This is name', ['my', 'framework']);

// true
```

Bạn có thể bỏ phân biệt chữ hoa và chữ thường bằng cách đặt đối số `ignoreCase` thành `true`:

```php
use Illuminate\Support\Str;

$doesntContain = Str::doesntContain('This is name', 'MY', ignoreCase: true);

// true
```

<a name="method-deduplicate"></a>
#### `Str::deduplicate()` {.collection-method}

Phương thức `Str::deduplicate` thay các ký tự giống nhau xuất hiện liên tiếp bằng một ký tự duy nhất. Mặc định, phương thức loại bỏ các khoảng trắng lặp liên tiếp:

```php
use Illuminate\Support\Str;

$result = Str::deduplicate('The   Laravel   Framework');

// The Laravel Framework
```

Bạn có thể chỉ định một ký tự khác cần loại bỏ lặp bằng cách truyền ký tự đó làm đối số thứ hai:

```php
use Illuminate\Support\Str;

$result = Str::deduplicate('The---Laravel---Framework', '-');

// The-Laravel-Framework
```

<a name="method-str-doesnt-end-with"></a>
#### `Str::doesntEndWith()` {.collection-method}

Phương thức `Str::doesntEndWith` xác định chuỗi được cung cấp không kết thúc bằng giá trị chỉ định:

```php
use Illuminate\Support\Str;

$result = Str::doesntEndWith('This is my name', 'dog');

// true
```

Bạn cũng có thể truyền một mảng giá trị để kiểm tra chuỗi không kết thúc bằng bất kỳ giá trị nào trong mảng:

```php
use Illuminate\Support\Str;

$result = Str::doesntEndWith('This is my name', ['this', 'foo']);

// true

$result = Str::doesntEndWith('This is my name', ['name', 'foo']);

// false
```

<a name="method-str-doesnt-start-with"></a>
#### `Str::doesntStartWith()` {.collection-method}

Phương thức `Str::doesntStartWith` xác định chuỗi được cung cấp không bắt đầu bằng giá trị chỉ định:

```php
use Illuminate\Support\Str;

$result = Str::doesntStartWith('This is my name', 'That');

// true
```

Nếu truyền vào một mảng các giá trị có thể có, `doesntStartWith` sẽ trả về `true` khi chuỗi không bắt đầu bằng bất kỳ giá trị nào trong mảng:

```php
$result = Str::doesntStartWith('This is my name', ['What', 'That', 'There']);

// true
```

<a name="method-ends-with"></a>
#### `Str::endsWith()` {.collection-method}

Phương thức `Str::endsWith` xác định chuỗi được cung cấp có kết thúc bằng giá trị chỉ định hay không:

```php
use Illuminate\Support\Str;

$result = Str::endsWith('This is my name', 'name');

// true
```

Bạn cũng có thể truyền một mảng giá trị để kiểm tra chuỗi có kết thúc bằng ít nhất một giá trị trong mảng hay không:

```php
use Illuminate\Support\Str;

$result = Str::endsWith('This is my name', ['name', 'foo']);

// true

$result = Str::endsWith('This is my name', ['this', 'foo']);

// false
```

<a name="method-excerpt"></a>
#### `Str::excerpt()` {.collection-method}

Phương thức `Str::excerpt` trích xuất một đoạn ngắn quanh lần xuất hiện đầu tiên của cụm từ được chỉ định trong chuỗi:

```php
use Illuminate\Support\Str;

$excerpt = Str::excerpt('This is my name', 'my', [
    'radius' => 3
]);

// '...is my na...'
```

Tùy chọn `radius`, mặc định là `100`, cho phép xác định số ký tự xuất hiện ở mỗi phía của phần chuỗi được rút gọn.

Ngoài ra, bạn có thể dùng tùy chọn `omission` để xác định chuỗi sẽ được thêm vào trước và sau phần nội dung bị rút gọn:

```php
use Illuminate\Support\Str;

$excerpt = Str::excerpt('This is my name', 'name', [
    'radius' => 3,
    'omission' => '(...) '
]);

// '(...) my name'
```

<a name="method-str-finish"></a>
#### `Str::finish()` {.collection-method}

Phương thức `Str::finish` thêm đúng một lần giá trị được chỉ định vào cuối chuỗi nếu chuỗi chưa kết thúc bằng giá trị đó:

```php
use Illuminate\Support\Str;

$adjusted = Str::finish('this/string', '/');

// this/string/

$adjusted = Str::finish('this/string/', '/');

// this/string/
```

<a name="method-str-from-base64"></a>
#### `Str::fromBase64()` {.collection-method}

Phương thức `Str::fromBase64` giải mã chuỗi Base64 được cung cấp:

```php
use Illuminate\Support\Str;

$decoded = Str::fromBase64('TGFyYXZlbA==');

// Laravel
```

<a name="method-str-headline"></a>
#### `Str::headline()` {.collection-method}

Phương thức `Str::headline` chuyển chuỗi được phân tách bởi kiểu viết hoa, dấu gạch ngang hoặc dấu gạch dưới thành chuỗi phân tách bằng khoảng trắng, đồng thời viết hoa chữ cái đầu của mỗi từ:

```php
use Illuminate\Support\Str;

$headline = Str::headline('steve_jobs');

// Steve Jobs

$headline = Str::headline('EmailNotificationSent');

// Email Notification Sent
```

<a name="method-str-initials"></a>
#### `Str::initials()` {.collection-method}

Phương thức `Str::initials` trả về các chữ cái đầu của chuỗi được cung cấp và có thể tùy chọn chuyển chúng thành chữ hoa:

```php
use Illuminate\Support\Str;

$initials = Str::initials('taylor otwell');

// to

$initials = Str::initials('taylor otwell', capitalize: true);

// TO
```

<a name="method-str-inline-markdown"></a>
#### `Str::inlineMarkdown()` {.collection-method}

Phương thức `Str::inlineMarkdown` chuyển Markdown theo phong cách GitHub thành HTML nội tuyến bằng [CommonMark](https://commonmark.thephpleague.com/). Tuy nhiên, khác với phương thức `markdown`, nó không bọc toàn bộ HTML được tạo ra trong một phần tử cấp khối:

```php
use Illuminate\Support\Str;

$html = Str::inlineMarkdown('**Laravel**');

// <strong>Laravel</strong>
```

#### Bảo mật Markdown

Mặc định, Markdown hỗ trợ HTML thô. Nếu sử dụng trực tiếp dữ liệu đầu vào không tin cậy từ người dùng, điều này có thể tạo ra lỗ hổng Cross-Site Scripting (XSS). Theo [tài liệu bảo mật của CommonMark](https://commonmark.thephpleague.com/security/), bạn có thể dùng tùy chọn `html_input` để escape hoặc loại bỏ HTML thô, đồng thời dùng `allow_unsafe_links` để xác định có cho phép liên kết không an toàn hay không. Nếu cần cho phép một phần HTML thô, bạn nên đưa Markdown sau khi biên dịch qua một HTML Purifier:

```php
use Illuminate\Support\Str;

Str::inlineMarkdown('Inject: <script>alert("Hello XSS!");</script>', [
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// Inject: alert(&quot;Hello XSS!&quot;);
```

<a name="method-str-is"></a>
#### `Str::is()` {.collection-method}

Phương thức `Str::is` xác định chuỗi được cung cấp có khớp với pattern chỉ định hay không. Dấu hoa thị có thể được dùng làm ký tự đại diện:

```php
use Illuminate\Support\Str;

$matches = Str::is('foo*', 'foobar');

// true

$matches = Str::is('baz*', 'foobar');

// false
```

Bạn có thể bỏ phân biệt chữ hoa và chữ thường bằng cách đặt đối số `ignoreCase` thành `true`:

```php
use Illuminate\Support\Str;

$matches = Str::is('*.jpg', 'photo.JPG', ignoreCase: true);

// true
```

<a name="method-str-is-ascii"></a>
#### `Str::isAscii()` {.collection-method}

Phương thức `Str::isAscii` xác định chuỗi được cung cấp có phải là ASCII 7-bit hay không:

```php
use Illuminate\Support\Str;

$isAscii = Str::isAscii('Taylor');

// true

$isAscii = Str::isAscii('ü');

// false
```

<a name="method-str-is-json"></a>
#### `Str::isJson()` {.collection-method}

Phương thức `Str::isJson` xác định chuỗi được cung cấp có phải JSON hợp lệ hay không:

```php
use Illuminate\Support\Str;

$result = Str::isJson('[1,2,3]');

// true

$result = Str::isJson('{"first": "John", "last": "Doe"}');

// true

$result = Str::isJson('{first: "John", last: "Doe"}');

// false
```

<a name="method-str-is-url"></a>
#### `Str::isUrl()` {.collection-method}

Phương thức `Str::isUrl` xác định chuỗi được cung cấp có phải URL hợp lệ hay không:

```php
use Illuminate\Support\Str;

$isUrl = Str::isUrl('http://example.com');

// true

$isUrl = Str::isUrl('laravel');

// false
```

Phương thức `isUrl` mặc định xem nhiều giao thức là hợp lệ. Tuy nhiên, bạn có thể giới hạn tập giao thức được chấp nhận bằng cách truyền danh sách giao thức vào `isUrl`:

```php
$isUrl = Str::isUrl('http://example.com', ['http', 'https']);
```

<a name="method-str-is-ulid"></a>
#### `Str::isUlid()` {.collection-method}

Phương thức `Str::isUlid` xác định chuỗi được cung cấp có phải ULID hợp lệ hay không:

```php
use Illuminate\Support\Str;

$isUlid = Str::isUlid('01gd6r360bp37zj17nxb55yv40');

// true

$isUlid = Str::isUlid('laravel');

// false
```

<a name="method-str-is-uuid"></a>
#### `Str::isUuid()` {.collection-method}

Phương thức `Str::isUuid` xác định chuỗi được cung cấp có phải UUID hợp lệ hay không:

```php
use Illuminate\Support\Str;

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de');

// true

$isUuid = Str::isUuid('laravel');

// false
```

Bạn cũng có thể xác thực UUID theo phiên bản cụ thể của chuẩn UUID (1, 3, 4, 5, 6, 7 hoặc 8):

```php
use Illuminate\Support\Str;

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de', version: 4);

// true

$isUuid = Str::isUuid('a0a2a2d2-0b87-4a18-83f2-2529882be2de', version: 1);

// false
```

<a name="method-kebab-case"></a>
#### `Str::kebab()` {.collection-method}

Phương thức `Str::kebab` chuyển chuỗi được cung cấp sang dạng `kebab-case`:

```php
use Illuminate\Support\Str;

$converted = Str::kebab('fooBar');

// foo-bar
```

<a name="method-str-lcfirst"></a>
#### `Str::lcfirst()` {.collection-method}

Phương thức `Str::lcfirst` trả về chuỗi với ký tự đầu tiên được chuyển thành chữ thường:

```php
use Illuminate\Support\Str;

$string = Str::lcfirst('Foo Bar');

// foo Bar
```

<a name="method-str-length"></a>
#### `Str::length()` {.collection-method}

Phương thức `Str::length` trả về độ dài của chuỗi được cung cấp:

```php
use Illuminate\Support\Str;

$length = Str::length('Laravel');

// 7
```

<a name="method-str-limit"></a>
#### `Str::limit()` {.collection-method}

Phương thức `Str::limit` rút gọn chuỗi được cung cấp về độ dài chỉ định:

```php
use Illuminate\Support\Str;

$truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20);

// The quick brown fox...
```

Bạn có thể truyền đối số thứ ba để thay đổi chuỗi được thêm vào cuối nội dung đã rút gọn:

```php
$truncated = Str::limit('The quick brown fox jumps over the lazy dog', 20, ' (...)');

// The quick brown fox (...)
```

Nếu muốn giữ nguyên các từ hoàn chỉnh khi rút gọn chuỗi, bạn có thể sử dụng đối số `preserveWords`. Khi đối số này là `true`, chuỗi sẽ được cắt tại ranh giới từ hoàn chỉnh gần nhất:

```php
$truncated = Str::limit('The quick brown fox', 12, preserveWords: true);

// The quick...
```

<a name="method-str-lower"></a>
#### `Str::lower()` {.collection-method}

Phương thức `Str::lower` chuyển chuỗi được cung cấp thành chữ thường:

```php
use Illuminate\Support\Str;

$converted = Str::lower('LARAVEL');

// laravel
```

<a name="method-str-markdown"></a>
#### `Str::markdown()` {.collection-method}

Phương thức `Str::markdown` chuyển Markdown theo phong cách GitHub thành HTML bằng [CommonMark](https://commonmark.thephpleague.com/):

```php
use Illuminate\Support\Str;

$html = Str::markdown('# Laravel');

// <h1>Laravel</h1>

$html = Str::markdown('# Taylor <b>Otwell</b>', [
    'html_input' => 'strip',
]);

// <h1>Taylor Otwell</h1>
```

#### Bảo mật Markdown

Mặc định, Markdown hỗ trợ HTML thô. Nếu sử dụng trực tiếp dữ liệu đầu vào không tin cậy từ người dùng, điều này có thể tạo ra lỗ hổng Cross-Site Scripting (XSS). Theo [tài liệu bảo mật của CommonMark](https://commonmark.thephpleague.com/security/), bạn có thể dùng tùy chọn `html_input` để escape hoặc loại bỏ HTML thô, đồng thời dùng `allow_unsafe_links` để xác định có cho phép liên kết không an toàn hay không. Nếu cần cho phép một phần HTML thô, bạn nên đưa Markdown sau khi biên dịch qua một HTML Purifier:

```php
use Illuminate\Support\Str;

Str::markdown('Inject: <script>alert("Hello XSS!");</script>', [
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// <p>Inject: alert(&quot;Hello XSS!&quot;);</p>
```

<a name="method-str-mask"></a>
#### `Str::mask()` {.collection-method}

Phương thức `Str::mask` che một phần chuỗi bằng cách lặp lại một ký tự. Phương thức này hữu ích khi cần làm mờ các phần dữ liệu như địa chỉ email hoặc số điện thoại:

```php
use Illuminate\Support\Str;

$string = Str::mask('taylor@example.com', '*', 3);

// tay***************
```

Khi cần, bạn có thể truyền một số âm làm đối số thứ ba của `mask`; khi đó phương thức sẽ bắt đầu che dữ liệu từ vị trí cách cuối chuỗi một khoảng tương ứng:

```php
$string = Str::mask('taylor@example.com', '*', -15, 3);

// tay***@example.com
```

<a name="method-str-match"></a>
#### `Str::match()` {.collection-method}

Phương thức `Str::match` trả về phần của chuỗi khớp với regular expression được chỉ định:

```php
use Illuminate\Support\Str;

$result = Str::match('/bar/', 'foo bar');

// 'bar'

$result = Str::match('/foo (.*)/', 'foo bar');

// 'bar'
```

<a name="method-str-match-all"></a>
#### `Str::matchAll()` {.collection-method}

Phương thức `Str::matchAll` trả về một collection chứa các phần của chuỗi khớp với regular expression được chỉ định:

```php
use Illuminate\Support\Str;

$result = Str::matchAll('/bar/', 'bar foo bar');

// collect(['bar', 'bar'])
```

Nếu bạn chỉ định một nhóm bắt giữ trong biểu thức, Laravel sẽ trả về collection chứa các kết quả khớp của nhóm bắt giữ đầu tiên:

```php
use Illuminate\Support\Str;

$result = Str::matchAll('/f(\w*)/', 'bar fun bar fly');

// collect(['un', 'ly']);
```

Nếu không tìm thấy kết quả khớp, một collection rỗng sẽ được trả về.

<a name="method-str-is-match"></a>
#### `Str::isMatch()` {.collection-method}

Phương thức `Str::isMatch` trả về `true` nếu chuỗi khớp với regular expression được chỉ định:

```php
use Illuminate\Support\Str;

$result = Str::isMatch('/foo (.*)/', 'foo bar');

// true

$result = Str::isMatch('/foo (.*)/', 'laravel');

// false
```

<a name="method-str-ordered-uuid"></a>
#### `Str::orderedUuid()` {.collection-method}

Phương thức `Str::orderedUuid` tạo UUID theo kiểu "timestamp first", phù hợp để lưu hiệu quả trong cột database có index. Mỗi UUID được tạo bằng phương thức này sẽ có thứ tự sắp xếp sau các UUID đã được tạo trước đó bằng cùng phương thức:

```php
use Illuminate\Support\Str;

return (string) Str::orderedUuid();
```

<a name="method-str-padboth"></a>
#### `Str::padBoth()` {.collection-method}

Phương thức `Str::padBoth` bọc hàm `str_pad` của PHP, thêm chuỗi đệm vào cả hai phía cho đến khi chuỗi kết quả đạt độ dài mong muốn:

```php
use Illuminate\Support\Str;

$padded = Str::padBoth('James', 10, '_');

// '__James___'

$padded = Str::padBoth('James', 10);

// '  James   '
```

<a name="method-str-padleft"></a>
#### `Str::padLeft()` {.collection-method}

Phương thức `Str::padLeft` bọc hàm `str_pad` của PHP, thêm chuỗi đệm vào bên trái cho đến khi chuỗi kết quả đạt độ dài mong muốn:

```php
use Illuminate\Support\Str;

$padded = Str::padLeft('James', 10, '-=');

// '-=-=-James'

$padded = Str::padLeft('James', 10);

// '     James'
```

<a name="method-str-padright"></a>
#### `Str::padRight()` {.collection-method}

Phương thức `Str::padRight` bọc hàm `str_pad` của PHP, thêm chuỗi đệm vào bên phải cho đến khi chuỗi kết quả đạt độ dài mong muốn:

```php
use Illuminate\Support\Str;

$padded = Str::padRight('James', 10, '-');

// 'James-----'

$padded = Str::padRight('James', 10);

// 'James     '
```

<a name="method-str-password"></a>
#### `Str::password()` {.collection-method}

Phương thức `Str::password` có thể dùng để tạo mật khẩu ngẫu nhiên an toàn với độ dài chỉ định. Mật khẩu được tạo từ tổ hợp chữ cái, chữ số, ký hiệu và khoảng trắng. Mặc định, mật khẩu dài 32 ký tự:

```php
use Illuminate\Support\Str;

$password = Str::password();

// 'EbJo2vE-AS:U,$%_gkrV4n,q~1xy/-_4'

$password = Str::password(12);

// 'qwuar>#V|i]N'
```

<a name="method-str-counted"></a>
#### `Str::counted()` {.collection-method}

Phương thức `Str::counted` chuyển một từ ở dạng số ít sang dạng số ít hoặc số nhiều tùy theo số lượng được cung cấp, đồng thời thêm số lượng đã được định dạng vào phía trước kết quả:

```php
use Illuminate\Support\Str;

$label = Str::counted('order', 1);

// 1 order

$label = Str::counted('order', 1000);

// 1,000 orders
```

<a name="method-str-plural"></a>
#### `Str::plural()` {.collection-method}

Phương thức `Str::plural` chuyển một từ ở dạng số ít sang dạng số nhiều. Phương thức này hỗ trợ [mọi ngôn ngữ được pluralizer của Laravel hỗ trợ](/docs/{{version}}/localization#pluralization-language):

```php
use Illuminate\Support\Str;

$plural = Str::plural('car');

// cars

$plural = Str::plural('child');

// children
```

Bạn có thể truyền một số nguyên làm đối số thứ hai để nhận về dạng số ít hoặc số nhiều tương ứng của chuỗi:

```php
use Illuminate\Support\Str;

$plural = Str::plural('child', 2);

// children

$singular = Str::plural('child', 1);

// child
```

Bạn có thể truyền đối số `prependCount` để thêm giá trị `$count` đã định dạng vào phía trước chuỗi sau khi chuyển số nhiều:

```php
use Illuminate\Support\Str;

$label = Str::plural('car', 1000, prependCount: true);

// 1,000 cars
```

<a name="method-str-plural-studly"></a>
#### `Str::pluralStudly()` {.collection-method}

Phương thức `Str::pluralStudly` chuyển chuỗi từ dạng số ít được định dạng theo `StudlyCase` sang dạng số nhiều. Phương thức này hỗ trợ [mọi ngôn ngữ được pluralizer của Laravel hỗ trợ](/docs/{{version}}/localization#pluralization-language):

```php
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman');

// VerifiedHumans

$plural = Str::pluralStudly('UserFeedback');

// UserFeedback
```

Bạn có thể truyền một số nguyên làm đối số thứ hai để nhận về dạng số ít hoặc số nhiều tương ứng của chuỗi:

```php
use Illuminate\Support\Str;

$plural = Str::pluralStudly('VerifiedHuman', 2);

// VerifiedHumans

$singular = Str::pluralStudly('VerifiedHuman', 1);

// VerifiedHuman
```

<a name="method-str-position"></a>
#### `Str::position()` {.collection-method}

Phương thức `Str::position` trả về vị trí của lần xuất hiện đầu tiên của một chuỗi con trong chuỗi. Nếu chuỗi con không tồn tại, phương thức trả về `false`:

```php
use Illuminate\Support\Str;

$position = Str::position('Hello, World!', 'Hello');

// 0

$position = Str::position('Hello, World!', 'W');

// 7
```

<a name="method-str-random"></a>
#### `Str::random()` {.collection-method}

Phương thức `Str::random` tạo một chuỗi ngẫu nhiên với độ dài được chỉ định. Phương thức này sử dụng hàm `random_bytes` của PHP:

```php
use Illuminate\Support\Str;

$random = Str::random(40);
```

Trong quá trình testing, đôi khi bạn cần giả lập giá trị trả về từ `Str::random`. Khi đó, bạn có thể sử dụng phương thức `createRandomStringsUsing`:

```php
Str::createRandomStringsUsing(function () {
    return 'fake-random-string';
});
```

Để đưa `random` trở lại cơ chế tạo chuỗi ngẫu nhiên thông thường, bạn có thể gọi phương thức `createRandomStringsNormally`:

```php
Str::createRandomStringsNormally();
```

<a name="method-str-remove"></a>
#### `Str::remove()` {.collection-method}

Phương thức `Str::remove` loại bỏ giá trị hoặc mảng giá trị được chỉ định khỏi chuỗi:

```php
use Illuminate\Support\Str;

$string = 'Peter Piper picked a peck of pickled peppers.';

$removed = Str::remove('e', $string);

// Ptr Pipr pickd a pck of pickld ppprs.
```

Bạn cũng có thể truyền `false` làm đối số thứ ba của `remove` để bỏ phân biệt chữ hoa và chữ thường khi loại bỏ chuỗi.

<a name="method-str-repeat"></a>
#### `Str::repeat()` {.collection-method}

Phương thức `Str::repeat` lặp lại chuỗi được cung cấp:

```php
use Illuminate\Support\Str;

$string = 'a';

$repeat = Str::repeat($string, 5);

// aaaaa
```

<a name="method-str-replace"></a>
#### `Str::replace()` {.collection-method}

Phương thức `Str::replace` thay thế một chuỗi con được chỉ định trong chuỗi:

```php
use Illuminate\Support\Str;

$string = 'Laravel 11.x';

$replaced = Str::replace('11.x', '12.x', $string);

// Laravel 12.x
```

Phương thức `replace` cũng nhận đối số `caseSensitive`. Mặc định, phép thay thế có phân biệt chữ hoa và chữ thường:

```php
$replaced = Str::replace(
    'php',
    'Laravel',
    'PHP Framework for Web Artisans',
    caseSensitive: false
);

// Laravel Framework for Web Artisans
```

<a name="method-str-replace-array"></a>
#### `Str::replaceArray()` {.collection-method}

Phương thức `Str::replaceArray` lần lượt thay thế giá trị được chỉ định trong chuỗi bằng các phần tử từ một mảng:

```php
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::replaceArray('?', ['8:30', '9:00'], $string);

// The event will take place between 8:30 and 9:00
```

<a name="method-str-replace-first"></a>
#### `Str::replaceFirst()` {.collection-method}

Phương thức `Str::replaceFirst` thay thế lần xuất hiện đầu tiên của giá trị được chỉ định trong chuỗi:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceFirst('the', 'a', 'the quick brown fox jumps over the lazy dog');

// a quick brown fox jumps over the lazy dog
```

<a name="method-str-replace-last"></a>
#### `Str::replaceLast()` {.collection-method}

Phương thức `Str::replaceLast` thay thế lần xuất hiện cuối cùng của giá trị được chỉ định trong chuỗi:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceLast('the', 'a', 'the quick brown fox jumps over the lazy dog');

// the quick brown fox jumps over a lazy dog
```

<a name="method-str-replace-matches"></a>
#### `Str::replaceMatches()` {.collection-method}

Phương thức `Str::replaceMatches` thay thế mọi phần của chuỗi khớp với pattern bằng chuỗi thay thế được cung cấp:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceMatches(
    pattern: '/[^A-Za-z0-9]++/',
    replace: '',
    subject: '(+1) 501-555-1000'
)

// '15015551000'
```

Phương thức `replaceMatches` cũng chấp nhận một closure. Closure này sẽ được gọi cho từng phần của chuỗi khớp với pattern, cho phép bạn tự thực hiện logic thay thế và trả về giá trị mới:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceMatches('/\d/', function (array $matches) {
    return '['.$matches[0].']';
}, '123');

// '[1][2][3]'
```

<a name="method-str-replace-start"></a>
#### `Str::replaceStart()` {.collection-method}

Phương thức `Str::replaceStart` chỉ thay thế lần xuất hiện đầu tiên của giá trị được chỉ định khi giá trị đó nằm ở đầu chuỗi:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceStart('Hello', 'Laravel', 'Hello World');

// Laravel World

$replaced = Str::replaceStart('World', 'Laravel', 'Hello World');

// Hello World
```

<a name="method-str-replace-end"></a>
#### `Str::replaceEnd()` {.collection-method}

Phương thức `Str::replaceEnd` chỉ thay thế lần xuất hiện cuối cùng của giá trị được chỉ định khi giá trị đó nằm ở cuối chuỗi:

```php
use Illuminate\Support\Str;

$replaced = Str::replaceEnd('World', 'Laravel', 'Hello World');

// Hello Laravel

$replaced = Str::replaceEnd('Hello', 'Laravel', 'Hello World');

// Hello World
```

<a name="method-str-reverse"></a>
#### `Str::reverse()` {.collection-method}

Phương thức `Str::reverse` đảo ngược chuỗi được cung cấp:

```php
use Illuminate\Support\Str;

$reversed = Str::reverse('Hello World');

// dlroW olleH
```

<a name="method-str-singular"></a>
#### `Str::singular()` {.collection-method}

Phương thức `Str::singular` chuyển chuỗi sang dạng số ít. Phương thức này hỗ trợ [mọi ngôn ngữ được pluralizer của Laravel hỗ trợ](/docs/{{version}}/localization#pluralization-language):

```php
use Illuminate\Support\Str;

$singular = Str::singular('cars');

// car

$singular = Str::singular('children');

// child
```

<a name="method-str-slug"></a>
#### `Str::slug()` {.collection-method}

Phương thức `Str::slug` tạo một `slug` thân thiện với URL từ chuỗi được cung cấp:

```php
use Illuminate\Support\Str;

$slug = Str::slug('Laravel 5 Framework', '-');

// laravel-5-framework
```

<a name="method-snake-case"></a>
#### `Str::snake()` {.collection-method}

Phương thức `Str::snake` chuyển chuỗi được cung cấp sang dạng `snake_case`:

```php
use Illuminate\Support\Str;

$converted = Str::snake('fooBar');

// foo_bar

$converted = Str::snake('fooBar', '-');

// foo-bar
```

<a name="method-str-squish"></a>
#### `Str::squish()` {.collection-method}

Phương thức `Str::squish` loại bỏ các khoảng trắng dư thừa trong chuỗi, kể cả khoảng trắng dư giữa các từ:

```php
use Illuminate\Support\Str;

$string = Str::squish('    laravel    framework    ');

// laravel framework
```

<a name="method-str-start"></a>
#### `Str::start()` {.collection-method}

Phương thức `Str::start` thêm đúng một lần giá trị được chỉ định vào đầu chuỗi nếu chuỗi chưa bắt đầu bằng giá trị đó:

```php
use Illuminate\Support\Str;

$adjusted = Str::start('this/string', '/');

// /this/string

$adjusted = Str::start('/this/string', '/');

// /this/string
```

<a name="method-starts-with"></a>
#### `Str::startsWith()` {.collection-method}

Phương thức `Str::startsWith` xác định chuỗi được cung cấp có bắt đầu bằng giá trị chỉ định hay không:

```php
use Illuminate\Support\Str;

$result = Str::startsWith('This is my name', 'This');

// true
```

Nếu truyền vào một mảng các giá trị có thể có, `startsWith` sẽ trả về `true` khi chuỗi bắt đầu bằng ít nhất một giá trị trong mảng:

```php
$result = Str::startsWith('This is my name', ['This', 'That', 'There']);

// true
```

<a name="method-studly-case"></a>
#### `Str::studly()` {.collection-method}

Phương thức `Str::studly` chuyển chuỗi được cung cấp sang dạng `StudlyCase`:

```php
use Illuminate\Support\Str;

$converted = Str::studly('foo_bar');

// FooBar
```

<a name="method-str-substr"></a>
#### `Str::substr()` {.collection-method}

Phương thức `Str::substr` trả về phần chuỗi được xác định bởi tham số vị trí bắt đầu và độ dài:

```php
use Illuminate\Support\Str;

$converted = Str::substr('The Laravel Framework', 4, 7);

// Laravel
```

<a name="method-str-substrcount"></a>
#### `Str::substrCount()` {.collection-method}

Phương thức `Str::substrCount` trả về số lần giá trị được chỉ định xuất hiện trong chuỗi:

```php
use Illuminate\Support\Str;

$count = Str::substrCount('If you like ice cream, you will like snow cones.', 'like');

// 2
```

<a name="method-str-substrreplace"></a>
#### `Str::substrReplace()` {.collection-method}

Phương thức `Str::substrReplace` thay thế nội dung trong một phần của chuỗi, bắt đầu từ vị trí được chỉ định bởi đối số thứ ba và thay số ký tự được chỉ định bởi đối số thứ tư. Nếu truyền `0` làm đối số thứ tư, chuỗi mới sẽ được chèn vào vị trí chỉ định mà không thay thế ký tự hiện có nào:

```php
use Illuminate\Support\Str;

$result = Str::substrReplace('1300', ':', 2);
// 13:

$result = Str::substrReplace('1300', ':', 2, 0);
// 13:00
```

<a name="method-str-swap"></a>
#### `Str::swap()` {.collection-method}

Phương thức `Str::swap` thay thế nhiều giá trị trong chuỗi bằng hàm `strtr` của PHP:

```php
use Illuminate\Support\Str;

$string = Str::swap([
    'Tacos' => 'Burritos',
    'great' => 'fantastic',
], 'Tacos are great!');

// Burritos are fantastic!
```

<a name="method-take"></a>
#### `Str::take()` {.collection-method}

Phương thức `Str::take` trả về số ký tự được chỉ định tính từ đầu chuỗi:

```php
use Illuminate\Support\Str;

$taken = Str::take('Build something amazing!', 5);

// Build
```

<a name="method-title-case"></a>
#### `Str::title()` {.collection-method}

Phương thức `Str::title` chuyển chuỗi được cung cấp sang dạng `Title Case`:

```php
use Illuminate\Support\Str;

$converted = Str::title('a nice title uses the correct case');

// A Nice Title Uses The Correct Case
```

<a name="method-str-to-base64"></a>
#### `Str::toBase64()` {.collection-method}

Phương thức `Str::toBase64` mã hóa chuỗi được cung cấp sang Base64:

```php
use Illuminate\Support\Str;

$base64 = Str::toBase64('Laravel');

// TGFyYXZlbA==
```

<a name="method-str-transliterate"></a>
#### `Str::transliterate()` {.collection-method}

Phương thức `Str::transliterate` cố gắng chuyển chuỗi được cung cấp sang biểu diễn ASCII gần nhất:

```php
use Illuminate\Support\Str;

$email = Str::transliterate('ⓣⓔⓢⓣ@ⓛⓐⓡⓐⓥⓔⓛ.ⓒⓞⓜ');

// 'test@laravel.com'
```

<a name="method-str-trim"></a>
#### `Str::trim()` {.collection-method}

Phương thức `Str::trim` loại bỏ khoảng trắng (hoặc các ký tự khác) ở đầu và cuối chuỗi. Khác với hàm `trim` nguyên bản của PHP, `Str::trim` cũng loại bỏ các ký tự khoảng trắng Unicode:

```php
use Illuminate\Support\Str;

$string = Str::trim(' foo bar ');

// 'foo bar'
```

<a name="method-str-ltrim"></a>
#### `Str::ltrim()` {.collection-method}

Phương thức `Str::ltrim` loại bỏ khoảng trắng (hoặc các ký tự khác) ở đầu chuỗi. Khác với hàm `ltrim` nguyên bản của PHP, `Str::ltrim` cũng loại bỏ các ký tự khoảng trắng Unicode:

```php
use Illuminate\Support\Str;

$string = Str::ltrim('  foo bar  ');

// 'foo bar  '
```

<a name="method-str-rtrim"></a>
#### `Str::rtrim()` {.collection-method}

Phương thức `Str::rtrim` loại bỏ khoảng trắng (hoặc các ký tự khác) ở cuối chuỗi. Khác với hàm `rtrim` nguyên bản của PHP, `Str::rtrim` cũng loại bỏ các ký tự khoảng trắng Unicode:

```php
use Illuminate\Support\Str;

$string = Str::rtrim('  foo bar  ');

// '  foo bar'
```

<a name="method-str-ucfirst"></a>
#### `Str::ucfirst()` {.collection-method}

Phương thức `Str::ucfirst` trả về chuỗi với ký tự đầu tiên được chuyển thành chữ hoa:

```php
use Illuminate\Support\Str;

$string = Str::ucfirst('foo bar');

// Foo bar
```

<a name="method-str-ucsplit"></a>
#### `Str::ucsplit()` {.collection-method}

Phương thức `Str::ucsplit` tách chuỗi thành một mảng dựa trên các ký tự viết hoa:

```php
use Illuminate\Support\Str;

$segments = Str::ucsplit('FooBar');

// [0 => 'Foo', 1 => 'Bar']
```

<a name="method-str-ucwords"></a>
#### `Str::ucwords()` {.collection-method}

Phương thức `Str::ucwords` chuyển ký tự đầu tiên của mỗi từ trong chuỗi thành chữ hoa:

```php
use Illuminate\Support\Str;

$string = Str::ucwords('laravel framework');

// Laravel Framework
```

<a name="method-str-upper"></a>
#### `Str::upper()` {.collection-method}

Phương thức `Str::upper` chuyển chuỗi thành chữ hoa:

```php
use Illuminate\Support\Str;

$string = Str::upper('laravel');

// LARAVEL
```

<a name="method-str-ulid"></a>
#### `Str::ulid()` {.collection-method}

Phương thức `Str::ulid` tạo một ULID, là định danh duy nhất nhỏ gọn và có thứ tự theo thời gian:

```php
use Illuminate\Support\Str;

return (string) Str::ulid();

// 01gd6r360bp37zj17nxb55yv40
```

Nếu muốn lấy một instance ngày `Illuminate\Support\Carbon` biểu diễn ngày và thời điểm một ULID được tạo, bạn có thể sử dụng phương thức `createFromId` do tích hợp Carbon của Laravel cung cấp:

```php
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

$date = Carbon::createFromId((string) Str::ulid());
```

Trong quá trình kiểm thử, đôi khi bạn cần "giả lập" giá trị do phương thức `Str::ulid` trả về. Để thực hiện việc này, bạn có thể dùng phương thức `createUlidsUsing`:

```php
use Symfony\Component\Uid\Ulid;

Str::createUlidsUsing(function () {
    return new Ulid('01HRDBNHHCKNW2AK4Z29SN82T9');
});
```

Để yêu cầu phương thức `ulid` quay lại tạo ULID theo cách thông thường, bạn có thể gọi phương thức `createUlidsNormally`:

```php
Str::createUlidsNormally();
```

<a name="method-str-unwrap"></a>
#### `Str::unwrap()` {.collection-method}

Phương thức `Str::unwrap` loại bỏ các chuỗi được chỉ định khỏi đầu và cuối chuỗi đã cho:

```php
use Illuminate\Support\Str;

Str::unwrap('-Laravel-', '-');

// Laravel

Str::unwrap('{framework: "Laravel"}', '{', '}');

// framework: "Laravel"
```

<a name="method-str-uuid"></a>
#### `Str::uuid()` {.collection-method}

Phương thức `Str::uuid` tạo một UUID (phiên bản 4):

```php
use Illuminate\Support\Str;

return (string) Str::uuid();
```

Trong quá trình kiểm thử, đôi khi bạn cần "giả lập" giá trị do phương thức `Str::uuid` trả về. Để thực hiện việc này, bạn có thể dùng phương thức `createUuidsUsing`:

```php
use Ramsey\Uuid\Uuid;

Str::createUuidsUsing(function () {
    return Uuid::fromString('eadbfeac-5258-45c2-bab7-ccb9b5ef74f9');
});
```

Để yêu cầu phương thức `uuid` quay lại tạo UUID theo cách thông thường, bạn có thể gọi phương thức `createUuidsNormally`:

```php
Str::createUuidsNormally();
```

<a name="method-str-uuid7"></a>
#### `Str::uuid7()` {.collection-method}

Phương thức `Str::uuid7` tạo một UUID (phiên bản 7):

```php
use Illuminate\Support\Str;

return (string) Str::uuid7();
```

Bạn có thể truyền một `DateTimeInterface` làm tham số tùy chọn để dùng khi tạo ordered UUID:

```php
return (string) Str::uuid7(time: now());
```

<a name="method-str-word-count"></a>
#### `Str::wordCount()` {.collection-method}

Phương thức `Str::wordCount` trả về số lượng từ có trong chuỗi:

```php
use Illuminate\Support\Str;

Str::wordCount('Hello, world!'); // 2
```

<a name="method-str-word-wrap"></a>
#### `Str::wordWrap()` {.collection-method}

Phương thức `Str::wordWrap` ngắt dòng chuỗi theo số ký tự được chỉ định:

```php
use Illuminate\Support\Str;

$text = "The quick brown fox jumped over the lazy dog."

Str::wordWrap($text, characters: 20, break: "<br />\n");

/*
The quick brown fox<br />
jumped over the lazy<br />
dog.
*/
```

<a name="method-str-words"></a>
#### `Str::words()` {.collection-method}

Phương thức `Str::words` giới hạn số lượng từ trong chuỗi. Bạn có thể truyền thêm một chuỗi qua đối số thứ ba để chỉ định nội dung sẽ được nối vào cuối chuỗi sau khi rút gọn:

```php
use Illuminate\Support\Str;

return Str::words('Perfectly balanced, as all things should be.', 3, ' >>>');

// Perfectly balanced, as >>>
```

<a name="method-str-wrap"></a>
#### `Str::wrap()` {.collection-method}

Phương thức `Str::wrap` bao chuỗi đã cho bằng một chuỗi bổ sung hoặc một cặp chuỗi:

```php
use Illuminate\Support\Str;

Str::wrap('Laravel', '"');

// "Laravel"

Str::wrap('is', before: 'This ', after: ' Laravel!');

// This is Laravel!
```

<a name="method-str"></a>
#### `str()` {.collection-method}

Hàm `str` trả về một instance `Illuminate\Support\Stringable` mới cho chuỗi đã cho. Hàm này tương đương với phương thức `Str::of`:

```php
$string = str('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

Nếu không truyền đối số cho hàm `str`, hàm sẽ trả về một instance của `Illuminate\Support\Str`:

```php
$snake = str()->snake('FooBar');

// 'foo_bar'
```

<a name="method-trans"></a>
#### `trans()` {.collection-method}

Hàm `trans` dịch translation key đã cho bằng các [file ngôn ngữ](/docs/{{version}}/localization) của ứng dụng:

```php
echo trans('messages.welcome');
```

Nếu translation key được chỉ định không tồn tại, hàm `trans` sẽ trả về chính key đó. Vì vậy, với ví dụ trên, `trans` sẽ trả về `messages.welcome` nếu translation key không tồn tại.

<a name="method-trans-choice"></a>
#### `trans_choice()` {.collection-method}

Hàm `trans_choice` dịch translation key đã cho với khả năng biến đổi theo số lượng:

```php
echo trans_choice('messages.notifications', $unreadCount);
```

Nếu translation key được chỉ định không tồn tại, hàm `trans_choice` sẽ trả về chính key đó. Vì vậy, với ví dụ trên, `trans_choice` sẽ trả về `messages.notifications` nếu translation key không tồn tại.

<a name="fluent-strings"></a>
## Fluent Strings

Fluent Strings cung cấp giao diện hướng đối tượng mạch lạc hơn để làm việc với giá trị chuỗi, cho phép bạn nối nhiều thao tác xử lý chuỗi với nhau bằng cú pháp dễ đọc hơn so với cách xử lý chuỗi truyền thống.

<a name="method-fluent-str-after"></a>
#### `after` {.collection-method}

Phương thức `after` trả về toàn bộ nội dung nằm sau giá trị đã cho trong chuỗi. Nếu giá trị đó không tồn tại trong chuỗi, toàn bộ chuỗi sẽ được trả về:

```php
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->after('This is');

// ' my name'
```

<a name="method-fluent-str-after-last"></a>
#### `afterLast` {.collection-method}

Phương thức `afterLast` trả về toàn bộ nội dung nằm sau lần xuất hiện cuối cùng của giá trị đã cho trong chuỗi. Nếu giá trị đó không tồn tại, toàn bộ chuỗi sẽ được trả về:

```php
use Illuminate\Support\Str;

$slice = Str::of('App\Http\Controllers\Controller')->afterLast('\\');

// 'Controller'
```

<a name="method-fluent-str-apa"></a>
#### `apa` {.collection-method}

Phương thức `apa` chuyển chuỗi đã cho sang kiểu viết hoa tiêu đề theo [hướng dẫn của APA](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case):

```php
use Illuminate\Support\Str;

$converted = Str::of('a nice title uses the correct case')->apa();

// A Nice Title Uses the Correct Case
```

<a name="method-fluent-str-append"></a>
#### `append` {.collection-method}

Phương thức `append` nối các giá trị đã cho vào cuối chuỗi:

```php
use Illuminate\Support\Str;

$string = Str::of('Taylor')->append(' Otwell');

// 'Taylor Otwell'
```

<a name="method-fluent-str-ascii"></a>
#### `ascii` {.collection-method}

Phương thức `ascii` sẽ cố gắng chuyển tự chuỗi thành giá trị ASCII:

```php
use Illuminate\Support\Str;

$string = Str::of('ü')->ascii();

// 'u'
```

<a name="method-fluent-str-basename"></a>
#### `basename` {.collection-method}

Phương thức `basename` trả về thành phần tên ở cuối chuỗi đã cho:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->basename();

// 'baz'
```

Nếu cần, bạn có thể truyền một "extension" để loại bỏ phần mở rộng đó khỏi thành phần cuối:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz.jpg')->basename('.jpg');

// 'baz'
```

<a name="method-fluent-str-before"></a>
#### `before` {.collection-method}

Phương thức `before` trả về toàn bộ nội dung nằm trước giá trị đã cho trong chuỗi:

```php
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->before('my name');

// 'This is '
```

<a name="method-fluent-str-before-last"></a>
#### `beforeLast` {.collection-method}

Phương thức `beforeLast` trả về toàn bộ nội dung nằm trước lần xuất hiện cuối cùng của giá trị đã cho trong chuỗi:

```php
use Illuminate\Support\Str;

$slice = Str::of('This is my name')->beforeLast('is');

// 'This '
```

<a name="method-fluent-str-between"></a>
#### `between` {.collection-method}

Phương thức `between` trả về phần của chuỗi nằm giữa hai giá trị:

```php
use Illuminate\Support\Str;

$converted = Str::of('This is my name')->between('This', 'name');

// ' is my '
```

<a name="method-fluent-str-between-first"></a>
#### `betweenFirst` {.collection-method}

Phương thức `betweenFirst` trả về phần nhỏ nhất có thể của chuỗi nằm giữa hai giá trị:

```php
use Illuminate\Support\Str;

$converted = Str::of('[a] bc [d]')->betweenFirst('[', ']');

// 'a'
```

<a name="method-fluent-str-camel"></a>
#### `camel` {.collection-method}

Phương thức `camel` chuyển chuỗi đã cho sang dạng `camelCase`:

```php
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->camel();

// 'fooBar'
```

<a name="method-fluent-str-char-at"></a>
#### `charAt` {.collection-method}

Phương thức `charAt` trả về ký tự tại chỉ mục được chỉ định. Nếu chỉ mục nằm ngoài phạm vi, phương thức trả về `false`:

```php
use Illuminate\Support\Str;

$character = Str::of('This is my name.')->charAt(6);

// 's'
```

<a name="method-fluent-str-class-basename"></a>
#### `classBasename` {.collection-method}

Phương thức `classBasename` trả về tên class của class đã cho sau khi loại bỏ namespace:

```php
use Illuminate\Support\Str;

$class = Str::of('Foo\Bar\Baz')->classBasename();

// 'Baz'
```

<a name="method-fluent-str-chop-start"></a>
#### `chopStart` {.collection-method}

Phương thức `chopStart` loại bỏ lần xuất hiện đầu tiên của giá trị đã cho, nhưng chỉ khi giá trị đó nằm ở đầu chuỗi:

```php
use Illuminate\Support\Str;

$url = Str::of('https://laravel.com')->chopStart('https://');

// 'laravel.com'
```

Bạn cũng có thể truyền một mảng. Nếu chuỗi bắt đầu bằng bất kỳ giá trị nào trong mảng, giá trị đó sẽ được loại khỏi chuỗi:

```php
use Illuminate\Support\Str;

$url = Str::of('http://laravel.com')->chopStart(['https://', 'http://']);

// 'laravel.com'
```

<a name="method-fluent-str-chop-end"></a>
#### `chopEnd` {.collection-method}

Phương thức `chopEnd` loại bỏ lần xuất hiện cuối cùng của giá trị đã cho, nhưng chỉ khi giá trị đó nằm ở cuối chuỗi:

```php
use Illuminate\Support\Str;

$url = Str::of('https://laravel.com')->chopEnd('.com');

// 'https://laravel'
```

Bạn cũng có thể truyền một mảng. Nếu chuỗi kết thúc bằng bất kỳ giá trị nào trong mảng, giá trị đó sẽ được loại khỏi chuỗi:

```php
use Illuminate\Support\Str;

$url = Str::of('http://laravel.com')->chopEnd(['.com', '.io']);

// 'http://laravel'
```

<a name="method-fluent-str-contains"></a>
#### `contains` {.collection-method}

Phương thức `contains` xác định chuỗi đã cho có chứa giá trị được chỉ định hay không. Theo mặc định, phương thức này phân biệt chữ hoa và chữ thường:

```php
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains('my');

// true
```

Bạn cũng có thể truyền một mảng giá trị để kiểm tra chuỗi có chứa ít nhất một giá trị trong mảng hay không:

```php
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains(['my', 'foo']);

// true
```

Bạn có thể tắt việc phân biệt chữ hoa và chữ thường bằng cách đặt đối số `ignoreCase` thành `true`:

```php
use Illuminate\Support\Str;

$contains = Str::of('This is my name')->contains('MY', ignoreCase: true);

// true
```

<a name="method-fluent-str-contains-all"></a>
#### `containsAll` {.collection-method}

Phương thức `containsAll` xác định chuỗi đã cho có chứa tất cả giá trị trong mảng được chỉ định hay không:

```php
use Illuminate\Support\Str;

$containsAll = Str::of('This is my name')->containsAll(['my', 'name']);

// true
```

Bạn có thể tắt việc phân biệt chữ hoa và chữ thường bằng cách đặt đối số `ignoreCase` thành `true`:

```php
use Illuminate\Support\Str;

$containsAll = Str::of('This is my name')->containsAll(['MY', 'NAME'], ignoreCase: true);

// true
```

<a name="method-fluent-str-decrypt"></a>
#### `decrypt` {.collection-method}

Phương thức `decrypt` [giải mã](/docs/{{version}}/encryption) chuỗi đã được mã hóa:

```php
use Illuminate\Support\Str;

$decrypted = $encrypted->decrypt();

// 'secret'
```

Để thực hiện thao tác ngược với `decrypt`, hãy xem phương thức [encrypt](#method-fluent-str-encrypt).

<a name="method-fluent-str-deduplicate"></a>
#### `deduplicate` {.collection-method}

Phương thức `deduplicate` thay thế các lần xuất hiện liên tiếp của một ký tự bằng một lần xuất hiện duy nhất của ký tự đó trong chuỗi. Theo mặc định, phương thức loại bỏ các khoảng trắng lặp liên tiếp:

```php
use Illuminate\Support\Str;

$result = Str::of('The   Laravel   Framework')->deduplicate();

// The Laravel Framework
```

Bạn có thể chỉ định một ký tự khác cần loại bỏ lặp bằng cách truyền ký tự đó làm đối số thứ hai:

```php
use Illuminate\Support\Str;

$result = Str::of('The---Laravel---Framework')->deduplicate('-');

// The-Laravel-Framework
```

<a name="method-fluent-str-dirname"></a>
#### `dirname` {.collection-method}

Phương thức `dirname` trả về phần thư mục cha của chuỗi đã cho:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname();

// '/foo/bar'
```

Nếu cần, bạn có thể chỉ định số cấp thư mục muốn loại bỏ khỏi chuỗi:

```php
use Illuminate\Support\Str;

$string = Str::of('/foo/bar/baz')->dirname(2);

// '/foo'
```

<a name="method-fluent-str-doesnt-contain"></a>
#### `doesntContain()` {.collection-method}

Phương thức `doesntContain` xác định chuỗi đã cho không chứa giá trị được chỉ định hay không. Đây là thao tác ngược với phương thức [contains](#method-fluent-str-contains). Theo mặc định, phương thức này phân biệt chữ hoa và chữ thường:

```php
use Illuminate\Support\Str;

$doesntContain = Str::of('This is name')->doesntContain('my');

// true
```

Bạn cũng có thể truyền một mảng giá trị để xác định chuỗi đã cho có không chứa bất kỳ giá trị nào trong mảng hay không:

```php
use Illuminate\Support\Str;

$doesntContain = Str::of('This is name')->doesntContain(['my', 'framework']);

// true
```

Bạn có thể bỏ phân biệt chữ hoa và chữ thường bằng cách đặt đối số `ignoreCase` thành `true`:

```php
use Illuminate\Support\Str;

$doesntContain = Str::of('This is my name')->doesntContain('MY', ignoreCase: true);

// false
```

<a name="method-fluent-str-doesnt-end-with"></a>
#### `doesntEndWith` {.collection-method}

Phương thức `doesntEndWith` xác định chuỗi đã cho có không kết thúc bằng giá trị được chỉ định hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntEndWith('dog');

// true
```

Bạn cũng có thể truyền một mảng giá trị để kiểm tra chuỗi không kết thúc bằng bất kỳ giá trị nào trong mảng:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntEndWith(['this', 'foo']);

// true

$result = Str::of('This is my name')->doesntEndWith(['name', 'foo']);

// false
```

<a name="method-fluent-str-doesnt-start-with"></a>
#### `doesntStartWith` {.collection-method}

Phương thức `doesntStartWith` xác định chuỗi đã cho có không bắt đầu bằng giá trị được chỉ định hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntStartWith('That');

// true
```

Bạn cũng có thể truyền một mảng giá trị để xác định chuỗi đã cho có không bắt đầu bằng bất kỳ giá trị nào trong mảng hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->doesntStartWith(['What', 'That', 'There']);

// true
```

<a name="method-fluent-str-encrypt"></a>
#### `encrypt` {.collection-method}

Phương thức `encrypt` [mã hóa](/docs/{{version}}/encryption) chuỗi:

```php
use Illuminate\Support\Str;

$encrypted = Str::of('secret')->encrypt();
```

Để thực hiện thao tác ngược với `encrypt`, hãy xem phương thức [decrypt](#method-fluent-str-decrypt).

<a name="method-fluent-str-ends-with"></a>
#### `endsWith` {.collection-method}

Phương thức `endsWith` xác định chuỗi đã cho có kết thúc bằng giá trị được chỉ định hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith('name');

// true
```

Bạn cũng có thể truyền một mảng giá trị để kiểm tra chuỗi có kết thúc bằng ít nhất một giá trị trong mảng hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->endsWith(['name', 'foo']);

// true

$result = Str::of('This is my name')->endsWith(['this', 'foo']);

// false
```

<a name="method-fluent-str-exactly"></a>
#### `exactly` {.collection-method}

Phương thức `exactly` xác định chuỗi đã cho có khớp chính xác với một chuỗi khác hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('Laravel')->exactly('Laravel');

// true
```

<a name="method-fluent-str-excerpt"></a>
#### `excerpt` {.collection-method}

Phương thức `excerpt` trích xuất một đoạn văn quanh lần xuất hiện đầu tiên của một cụm từ trong chuỗi:

```php
use Illuminate\Support\Str;

$excerpt = Str::of('This is my name')->excerpt('my', [
    'radius' => 3
]);

// '...is my na...'
```

Tùy chọn `radius`, mặc định là `100`, cho phép xác định số ký tự xuất hiện ở mỗi phía của phần chuỗi được rút gọn.

Ngoài ra, bạn có thể dùng tùy chọn `omission` để thay đổi chuỗi được thêm vào đầu và cuối phần nội dung đã rút gọn:

```php
use Illuminate\Support\Str;

$excerpt = Str::of('This is my name')->excerpt('name', [
    'radius' => 3,
    'omission' => '(...) '
]);

// '(...) my name'
```

<a name="method-fluent-str-explode"></a>
#### `explode` {.collection-method}

Phương thức `explode` tách chuỗi theo delimiter đã cho và trả về một collection chứa từng phần sau khi tách:

```php
use Illuminate\Support\Str;

$collection = Str::of('foo bar baz')->explode(' ');

// collect(['foo', 'bar', 'baz'])
```

<a name="method-fluent-str-finish"></a>
#### `finish` {.collection-method}

Phương thức `finish` thêm đúng một lần giá trị đã cho vào cuối chuỗi nếu chuỗi chưa kết thúc bằng giá trị đó:

```php
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->finish('/');

// this/string/

$adjusted = Str::of('this/string/')->finish('/');

// this/string/
```

<a name="method-fluent-str-from-base64"></a>
#### `fromBase64` {.collection-method}

Phương thức `fromBase64` giải mã chuỗi Base64 đã cho:

```php
use Illuminate\Support\Str;

$decoded = Str::of('TGFyYXZlbA==')->fromBase64();

// Laravel
```

<a name="method-fluent-str-hash"></a>
#### `hash` {.collection-method}

Phương thức `hash` băm chuỗi bằng [thuật toán](https://www.php.net/manual/en/function.hash-algos.php) đã cho:

```php
use Illuminate\Support\Str;

$hashed = Str::of('secret')->hash(algorithm: 'sha256');

// '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b'
```

<a name="method-fluent-str-headline"></a>
#### `headline` {.collection-method}

Phương thức `headline` chuyển chuỗi được phân tách bởi kiểu viết hoa, dấu gạch ngang hoặc dấu gạch dưới thành chuỗi phân tách bằng khoảng trắng, đồng thời viết hoa chữ cái đầu của mỗi từ:

```php
use Illuminate\Support\Str;

$headline = Str::of('taylor_otwell')->headline();

// Taylor Otwell

$headline = Str::of('EmailNotificationSent')->headline();

// Email Notification Sent
```

<a name="method-fluent-str-initials"></a>
#### `initials` {.collection-method}

Phương thức `initials` chuyển chuỗi thành các chữ cái đầu của từng từ:

```php
use Illuminate\Support\Str;

$initials = Str::of('Taylor Otwell')->initials()->upper();

// TO
```

<a name="method-fluent-str-inline-markdown"></a>
#### `inlineMarkdown` {.collection-method}

Phương thức `inlineMarkdown` chuyển Markdown theo cú pháp GitHub thành HTML inline bằng [CommonMark](https://commonmark.thephpleague.com/). Tuy nhiên, khác với phương thức `markdown`, phương thức này không bọc toàn bộ HTML được tạo trong một phần tử cấp block:

```php
use Illuminate\Support\Str;

$html = Str::of('**Laravel**')->inlineMarkdown();

// <strong>Laravel</strong>
```

#### Bảo mật Markdown

Mặc định, Markdown hỗ trợ HTML thô. Nếu sử dụng trực tiếp dữ liệu đầu vào không tin cậy từ người dùng, điều này có thể tạo ra lỗ hổng Cross-Site Scripting (XSS). Theo [tài liệu bảo mật của CommonMark](https://commonmark.thephpleague.com/security/), bạn có thể dùng tùy chọn `html_input` để escape hoặc loại bỏ HTML thô, đồng thời dùng `allow_unsafe_links` để xác định có cho phép liên kết không an toàn hay không. Nếu cần cho phép một phần HTML thô, bạn nên đưa Markdown sau khi biên dịch qua một HTML Purifier:

```php
use Illuminate\Support\Str;

Str::of('Inject: <script>alert("Hello XSS!");</script>')->inlineMarkdown([
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// Inject: alert(&quot;Hello XSS!&quot;);
```

<a name="method-fluent-str-is"></a>
#### `is` {.collection-method}

Phương thức `is` xác định chuỗi có khớp với mẫu đã cho hay không. Có thể sử dụng dấu sao làm ký tự đại diện:

```php
use Illuminate\Support\Str;

$matches = Str::of('foobar')->is('foo*');

// true

$matches = Str::of('foobar')->is('baz*');

// false
```

<a name="method-fluent-str-is-ascii"></a>
#### `isAscii` {.collection-method}

Phương thức `isAscii` xác định chuỗi đã cho có phải là chuỗi ASCII hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('Taylor')->isAscii();

// true

$result = Str::of('ü')->isAscii();

// false
```

<a name="method-fluent-str-is-empty"></a>
#### `isEmpty` {.collection-method}

Phương thức `isEmpty` xác định chuỗi đã cho có rỗng hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isEmpty();

// true

$result = Str::of('Laravel')->trim()->isEmpty();

// false
```

<a name="method-fluent-str-is-not-empty"></a>
#### `isNotEmpty` {.collection-method}

Phương thức `isNotEmpty` xác định chuỗi đã cho có khác rỗng hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('  ')->trim()->isNotEmpty();

// false

$result = Str::of('Laravel')->trim()->isNotEmpty();

// true
```

<a name="method-fluent-str-is-json"></a>
#### `isJson` {.collection-method}

Phương thức `isJson` xác định chuỗi đã cho có phải JSON hợp lệ hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('[1,2,3]')->isJson();

// true

$result = Str::of('{"first": "John", "last": "Doe"}')->isJson();

// true

$result = Str::of('{first: "John", last: "Doe"}')->isJson();

// false
```

<a name="method-fluent-str-is-ulid"></a>
#### `isUlid` {.collection-method}

Phương thức `isUlid` xác định chuỗi đã cho có phải là ULID hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('01gd6r360bp37zj17nxb55yv40')->isUlid();

// true

$result = Str::of('Taylor')->isUlid();

// false
```

<a name="method-fluent-str-is-url"></a>
#### `isUrl` {.collection-method}

Phương thức `isUrl` xác định chuỗi đã cho có phải là URL hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('http://example.com')->isUrl();

// true

$result = Str::of('Taylor')->isUrl();

// false
```

Phương thức `isUrl` mặc định xem nhiều giao thức là hợp lệ. Tuy nhiên, bạn có thể giới hạn tập giao thức được chấp nhận bằng cách truyền danh sách giao thức vào `isUrl`:

```php
$result = Str::of('http://example.com')->isUrl(['http', 'https']);
```

<a name="method-fluent-str-is-uuid"></a>
#### `isUuid` {.collection-method}

Phương thức `isUuid` xác định chuỗi đã cho có phải là UUID hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('5ace9ab9-e9cf-4ec6-a19d-5881212a452c')->isUuid();

// true

$result = Str::of('Taylor')->isUuid();

// false
```

Bạn cũng có thể xác thực UUID theo phiên bản cụ thể của chuẩn UUID (1, 3, 4, 5, 6, 7 hoặc 8):

```php
use Illuminate\Support\Str;

$isUuid = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->isUuid(version: 4);

// true

$isUuid = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->isUuid(version: 1);

// false
```

<a name="method-fluent-str-kebab"></a>
#### `kebab` {.collection-method}

Phương thức `kebab` chuyển chuỗi đã cho sang dạng `kebab-case`:

```php
use Illuminate\Support\Str;

$converted = Str::of('fooBar')->kebab();

// foo-bar
```

<a name="method-fluent-str-lcfirst"></a>
#### `lcfirst` {.collection-method}

Phương thức `lcfirst` trả về chuỗi đã cho với ký tự đầu tiên được chuyển thành chữ thường:

```php
use Illuminate\Support\Str;

$string = Str::of('Foo Bar')->lcfirst();

// foo Bar
```

<a name="method-fluent-str-length"></a>
#### `length` {.collection-method}

Phương thức `length` trả về độ dài của chuỗi đã cho:

```php
use Illuminate\Support\Str;

$length = Str::of('Laravel')->length();

// 7
```

<a name="method-fluent-str-limit"></a>
#### `limit` {.collection-method}

Phương thức `limit` cắt ngắn chuỗi đã cho đến độ dài được chỉ định:

```php
use Illuminate\Support\Str;

$truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20);

// The quick brown fox...
```

Bạn cũng có thể truyền đối số thứ hai để thay đổi chuỗi được nối vào cuối chuỗi sau khi rút gọn:

```php
$truncated = Str::of('The quick brown fox jumps over the lazy dog')->limit(20, ' (...)');

// The quick brown fox (...)
```

Nếu muốn giữ nguyên các từ hoàn chỉnh khi rút gọn chuỗi, bạn có thể sử dụng đối số `preserveWords`. Khi đối số này là `true`, chuỗi sẽ được cắt tại ranh giới từ hoàn chỉnh gần nhất:

```php
$truncated = Str::of('The quick brown fox')->limit(12, preserveWords: true);

// The quick...
```

<a name="method-fluent-str-lower"></a>
#### `lower` {.collection-method}

Phương thức `lower` chuyển chuỗi đã cho thành chữ thường:

```php
use Illuminate\Support\Str;

$result = Str::of('LARAVEL')->lower();

// 'laravel'
```

<a name="method-fluent-str-markdown"></a>
#### `markdown` {.collection-method}

Phương thức `markdown` chuyển Markdown theo cú pháp GitHub Flavored Markdown thành HTML:

```php
use Illuminate\Support\Str;

$html = Str::of('# Laravel')->markdown();

// <h1>Laravel</h1>

$html = Str::of('# Taylor <b>Otwell</b>')->markdown([
    'html_input' => 'strip',
]);

// <h1>Taylor Otwell</h1>
```

#### Bảo mật Markdown

Mặc định, Markdown hỗ trợ HTML thô. Nếu sử dụng trực tiếp dữ liệu đầu vào không tin cậy từ người dùng, điều này có thể tạo ra lỗ hổng Cross-Site Scripting (XSS). Theo [tài liệu bảo mật của CommonMark](https://commonmark.thephpleague.com/security/), bạn có thể dùng tùy chọn `html_input` để escape hoặc loại bỏ HTML thô, đồng thời dùng `allow_unsafe_links` để xác định có cho phép liên kết không an toàn hay không. Nếu cần cho phép một phần HTML thô, bạn nên đưa Markdown sau khi biên dịch qua một HTML Purifier:

```php
use Illuminate\Support\Str;

Str::of('Inject: <script>alert("Hello XSS!");</script>')->markdown([
    'html_input' => 'strip',
    'allow_unsafe_links' => false,
]);

// <p>Inject: alert(&quot;Hello XSS!&quot;);</p>
```

<a name="method-fluent-str-mask"></a>
#### `mask` {.collection-method}

Phương thức `mask` che một phần chuỗi bằng một ký tự lặp lại và có thể dùng để ẩn các phần của chuỗi như địa chỉ email hoặc số điện thoại:

```php
use Illuminate\Support\Str;

$string = Str::of('taylor@example.com')->mask('*', 3);

// tay***************
```

Nếu cần, bạn có thể truyền số âm làm đối số thứ ba hoặc thứ tư cho `mask`; khi đó phương thức sẽ bắt đầu che tại khoảng cách tương ứng tính từ cuối chuỗi:

```php
$string = Str::of('taylor@example.com')->mask('*', -15, 3);

// tay***@example.com

$string = Str::of('taylor@example.com')->mask('*', 4, -4);

// tayl**********.com
```

<a name="method-fluent-str-match"></a>
#### `match` {.collection-method}

Phương thức `match` trả về phần của chuỗi khớp với biểu thức chính quy đã cho:

```php
use Illuminate\Support\Str;

$result = Str::of('foo bar')->match('/bar/');

// 'bar'

$result = Str::of('foo bar')->match('/foo (.*)/');

// 'bar'
```

<a name="method-fluent-str-match-all"></a>
#### `matchAll` {.collection-method}

Phương thức `matchAll` trả về một collection chứa các phần của chuỗi khớp với biểu thức chính quy đã cho:

```php
use Illuminate\Support\Str;

$result = Str::of('bar foo bar')->matchAll('/bar/');

// collect(['bar', 'bar'])
```

Nếu bạn chỉ định một nhóm bắt giữ trong biểu thức, Laravel sẽ trả về collection chứa các kết quả khớp của nhóm bắt giữ đầu tiên:

```php
use Illuminate\Support\Str;

$result = Str::of('bar fun bar fly')->matchAll('/f(\w*)/');

// collect(['un', 'ly']);
```

Nếu không tìm thấy kết quả khớp, một collection rỗng sẽ được trả về.

<a name="method-fluent-str-is-match"></a>
#### `isMatch` {.collection-method}

Phương thức `isMatch` trả về `true` nếu chuỗi khớp với biểu thức chính quy đã cho:

```php
use Illuminate\Support\Str;

$result = Str::of('foo bar')->isMatch('/foo (.*)/');

// true

$result = Str::of('laravel')->isMatch('/foo (.*)/');

// false
```

<a name="method-fluent-str-new-line"></a>
#### `newLine` {.collection-method}

Phương thức `newLine` nối thêm ký tự "xuống dòng" vào chuỗi:

```php
use Illuminate\Support\Str;

$padded = Str::of('Laravel')->newLine()->append('Framework');

// 'Laravel
//  Framework'
```

<a name="method-fluent-str-padboth"></a>
#### `padBoth` {.collection-method}

Phương thức `padBoth` bao bọc hàm `str_pad` của PHP, thêm chuỗi đệm vào cả hai phía cho đến khi chuỗi cuối đạt độ dài mong muốn:

```php
use Illuminate\Support\Str;

$padded = Str::of('James')->padBoth(10, '_');

// '__James___'

$padded = Str::of('James')->padBoth(10);

// '  James   '
```

<a name="method-fluent-str-padleft"></a>
#### `padLeft` {.collection-method}

Phương thức `padLeft` bao bọc hàm `str_pad` của PHP, thêm chuỗi đệm vào phía trái cho đến khi chuỗi cuối đạt độ dài mong muốn:

```php
use Illuminate\Support\Str;

$padded = Str::of('James')->padLeft(10, '-=');

// '-=-=-James'

$padded = Str::of('James')->padLeft(10);

// '     James'
```

<a name="method-fluent-str-padright"></a>
#### `padRight` {.collection-method}

Phương thức `padRight` bao bọc hàm `str_pad` của PHP, thêm chuỗi đệm vào phía phải cho đến khi chuỗi cuối đạt độ dài mong muốn:

```php
use Illuminate\Support\Str;

$padded = Str::of('James')->padRight(10, '-');

// 'James-----'

$padded = Str::of('James')->padRight(10);

// 'James     '
```

<a name="method-fluent-str-pipe"></a>
#### `pipe` {.collection-method}

Phương thức `pipe` cho phép biến đổi chuỗi bằng cách truyền giá trị hiện tại của nó vào callable đã cho:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$hash = Str::of('Laravel')->pipe('md5')->prepend('Checksum: ');

// 'Checksum: a5c95b86291ea299fcbe64458ed12702'

$closure = Str::of('foo')->pipe(function (Stringable $str) {
    return 'bar';
});

// 'bar'
```

<a name="method-fluent-str-counted"></a>
#### `counted` {.collection-method}

Phương thức `counted` chuyển một chuỗi từ dạng số ít sang dạng số ít hoặc số nhiều dựa trên số lượng đã cho, đồng thời thêm số lượng đã định dạng vào đầu kết quả:

```php
use Illuminate\Support\Str;

$label = Str::of('order')->counted(1);

// 1 order

$label = Str::of('order')->counted(1000);

// 1,000 orders
```

<a name="method-fluent-str-plural"></a>
#### `plural` {.collection-method}

Phương thức `plural` chuyển chuỗi từ dạng số ít sang dạng số nhiều. Hàm này hỗ trợ [mọi ngôn ngữ được bộ pluralizer của Laravel hỗ trợ](/docs/{{version}}/localization#pluralization-language):

```php
use Illuminate\Support\Str;

$plural = Str::of('car')->plural();

// cars

$plural = Str::of('child')->plural();

// children
```

Bạn có thể truyền một đối số số nguyên để nhận dạng số ít hoặc số nhiều phù hợp của chuỗi:

```php
use Illuminate\Support\Str;

$plural = Str::of('child')->plural(2);

// children

$plural = Str::of('child')->plural(1);

// child
```

Bạn có thể truyền đối số `prependCount` để thêm `$count` đã định dạng vào đầu chuỗi sau khi chuyển dạng số nhiều:

```php
use Illuminate\Support\Str;

$label = Str::of('car')->plural(1000, prependCount: true);

// 1,000 cars
```

<a name="method-fluent-str-position"></a>
#### `position` {.collection-method}

Phương thức `position` trả về vị trí xuất hiện đầu tiên của chuỗi con trong chuỗi. Nếu chuỗi con không tồn tại, phương thức trả về `false`:

```php
use Illuminate\Support\Str;

$position = Str::of('Hello, World!')->position('Hello');

// 0

$position = Str::of('Hello, World!')->position('W');

// 7
```

<a name="method-fluent-str-prepend"></a>
#### `prepend` {.collection-method}

Phương thức `prepend` thêm các giá trị đã cho vào đầu chuỗi:

```php
use Illuminate\Support\Str;

$string = Str::of('Framework')->prepend('Laravel ');

// Laravel Framework
```

<a name="method-fluent-str-remove"></a>
#### `remove` {.collection-method}

Phương thức `remove` loại bỏ giá trị hoặc mảng giá trị đã cho khỏi chuỗi:

```php
use Illuminate\Support\Str;

$string = Str::of('Arkansas is quite beautiful!')->remove('quite ');

// Arkansas is beautiful!
```

Bạn cũng có thể truyền `false` làm tham số thứ hai để không phân biệt chữ hoa và chữ thường khi loại bỏ chuỗi.

<a name="method-fluent-str-repeat"></a>
#### `repeat` {.collection-method}

Phương thức `repeat` lặp lại chuỗi đã cho:

```php
use Illuminate\Support\Str;

$repeated = Str::of('a')->repeat(5);

// aaaaa
```

<a name="method-fluent-str-replace"></a>
#### `replace` {.collection-method}

Phương thức `replace` thay thế một chuỗi đã cho bên trong chuỗi:

```php
use Illuminate\Support\Str;

$replaced = Str::of('Laravel 6.x')->replace('6.x', '7.x');

// Laravel 7.x
```

Phương thức `replace` cũng nhận đối số `caseSensitive`. Mặc định, phép thay thế có phân biệt chữ hoa và chữ thường:

```php
$replaced = Str::of('macOS 13.x')->replace(
    'macOS', 'iOS', caseSensitive: false
);
```

<a name="method-fluent-str-replace-array"></a>
#### `replaceArray` {.collection-method}

Phương thức `replaceArray` lần lượt thay thế một giá trị trong chuỗi bằng các phần tử của một mảng:

```php
use Illuminate\Support\Str;

$string = 'The event will take place between ? and ?';

$replaced = Str::of($string)->replaceArray('?', ['8:30', '9:00']);

// The event will take place between 8:30 and 9:00
```

<a name="method-fluent-str-replace-first"></a>
#### `replaceFirst` {.collection-method}

Phương thức `replaceFirst` thay thế lần xuất hiện đầu tiên của giá trị đã cho trong chuỗi:

```php
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceFirst('the', 'a');

// a quick brown fox jumps over the lazy dog
```

<a name="method-fluent-str-replace-last"></a>
#### `replaceLast` {.collection-method}

Phương thức `replaceLast` thay thế lần xuất hiện cuối cùng của giá trị đã cho trong chuỗi:

```php
use Illuminate\Support\Str;

$replaced = Str::of('the quick brown fox jumps over the lazy dog')->replaceLast('the', 'a');

// the quick brown fox jumps over a lazy dog
```

<a name="method-fluent-str-replace-matches"></a>
#### `replaceMatches` {.collection-method}

Phương thức `replaceMatches` thay thế mọi phần của chuỗi khớp với pattern bằng chuỗi thay thế đã cho:

```php
use Illuminate\Support\Str;

$replaced = Str::of('(+1) 501-555-1000')->replaceMatches('/[^A-Za-z0-9]++/', '')

// '15015551000'
```

Phương thức `replaceMatches` cũng chấp nhận một closure. Closure này sẽ được gọi cho từng phần của chuỗi khớp với pattern, cho phép bạn tự thực hiện logic thay thế và trả về giá trị mới:

```php
use Illuminate\Support\Str;

$replaced = Str::of('123')->replaceMatches('/\d/', function (array $matches) {
    return '['.$matches[0].']';
});

// '[1][2][3]'
```

<a name="method-fluent-str-replace-start"></a>
#### `replaceStart` {.collection-method}

Phương thức `replaceStart` chỉ thay thế lần xuất hiện đầu tiên của giá trị đã cho nếu giá trị đó nằm ở đầu chuỗi:

```php
use Illuminate\Support\Str;

$replaced = Str::of('Hello World')->replaceStart('Hello', 'Laravel');

// Laravel World

$replaced = Str::of('Hello World')->replaceStart('World', 'Laravel');

// Hello World
```

<a name="method-fluent-str-replace-end"></a>
#### `replaceEnd` {.collection-method}

Phương thức `replaceEnd` chỉ thay thế lần xuất hiện cuối cùng của giá trị đã cho nếu giá trị đó nằm ở cuối chuỗi:

```php
use Illuminate\Support\Str;

$replaced = Str::of('Hello World')->replaceEnd('World', 'Laravel');

// Hello Laravel

$replaced = Str::of('Hello World')->replaceEnd('Hello', 'Laravel');

// Hello World
```

<a name="method-fluent-str-scan"></a>
#### `scan` {.collection-method}

Phương thức `scan` phân tích dữ liệu từ chuỗi thành một collection theo định dạng được [hàm `sscanf` của PHP](https://www.php.net/manual/en/function.sscanf.php) hỗ trợ:

```php
use Illuminate\Support\Str;

$collection = Str::of('filename.jpg')->scan('%[^.].%s');

// collect(['filename', 'jpg'])
```

<a name="method-fluent-str-singular"></a>
#### `singular` {.collection-method}

Phương thức `singular` chuyển chuỗi sang dạng số ít. Hàm này hỗ trợ [mọi ngôn ngữ được bộ pluralizer của Laravel hỗ trợ](/docs/{{version}}/localization#pluralization-language):

```php
use Illuminate\Support\Str;

$singular = Str::of('cars')->singular();

// car

$singular = Str::of('children')->singular();

// child
```

<a name="method-fluent-str-slug"></a>
#### `slug` {.collection-method}

Phương thức `slug` tạo một "slug" thân thiện với URL từ chuỗi đã cho:

```php
use Illuminate\Support\Str;

$slug = Str::of('Laravel Framework')->slug('-');

// laravel-framework
```

<a name="method-fluent-str-snake"></a>
#### `snake` {.collection-method}

Phương thức `snake` chuyển chuỗi đã cho sang dạng `snake_case`:

```php
use Illuminate\Support\Str;

$converted = Str::of('fooBar')->snake();

// foo_bar
```

<a name="method-fluent-str-split"></a>
#### `split` {.collection-method}

Phương thức `split` tách chuỗi thành một collection bằng biểu thức chính quy:

```php
use Illuminate\Support\Str;

$segments = Str::of('one, two, three')->split('/[\s,]+/');

// collect(["one", "two", "three"])
```

<a name="method-fluent-str-squish"></a>
#### `squish` {.collection-method}

Phương thức `squish` loại bỏ toàn bộ khoảng trắng dư thừa khỏi chuỗi, bao gồm cả khoảng trắng thừa giữa các từ:

```php
use Illuminate\Support\Str;

$string = Str::of('    laravel    framework    ')->squish();

// laravel framework
```

<a name="method-fluent-str-start"></a>
#### `start` {.collection-method}

Phương thức `start` thêm đúng một lần giá trị đã cho vào đầu chuỗi nếu chuỗi chưa bắt đầu bằng giá trị đó:

```php
use Illuminate\Support\Str;

$adjusted = Str::of('this/string')->start('/');

// /this/string

$adjusted = Str::of('/this/string')->start('/');

// /this/string
```

<a name="method-fluent-str-starts-with"></a>
#### `startsWith` {.collection-method}

Phương thức `startsWith` xác định chuỗi đã cho có bắt đầu bằng giá trị đã cho hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->startsWith('This');

// true
```

Bạn cũng có thể truyền một mảng giá trị để xác định chuỗi có bắt đầu bằng bất kỳ giá trị nào trong mảng hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('This is my name')->startsWith(['This', 'That']);

// true
```

<a name="method-fluent-str-strip-tags"></a>
#### `stripTags` {.collection-method}

Phương thức `stripTags` loại bỏ toàn bộ thẻ HTML và PHP khỏi chuỗi:

```php
use Illuminate\Support\Str;

$result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags();

// Taylor Otwell

$result = Str::of('<a href="https://laravel.com">Taylor <b>Otwell</b></a>')->stripTags('<b>');

// Taylor <b>Otwell</b>
```

<a name="method-fluent-str-studly"></a>
#### `studly` {.collection-method}

Phương thức `studly` chuyển chuỗi đã cho sang dạng `StudlyCase`:

```php
use Illuminate\Support\Str;

$converted = Str::of('foo_bar')->studly();

// FooBar
```

<a name="method-fluent-str-substr"></a>
#### `substr` {.collection-method}

Phương thức `substr` trả về phần của chuỗi được xác định bởi tham số vị trí bắt đầu và độ dài:

```php
use Illuminate\Support\Str;

$string = Str::of('Laravel Framework')->substr(8);

// Framework

$string = Str::of('Laravel Framework')->substr(8, 5);

// Frame
```

<a name="method-fluent-str-substrreplace"></a>
#### `substrReplace` {.collection-method}

Phương thức `substrReplace` thay thế văn bản trong một phần của chuỗi, bắt đầu tại vị trí do đối số thứ hai xác định và thay thế số ký tự do đối số thứ ba chỉ định. Truyền `0` làm đối số thứ ba sẽ chèn chuỗi tại vị trí đã chỉ định mà không thay thế bất kỳ ký tự hiện có nào:

```php
use Illuminate\Support\Str;

$string = Str::of('1300')->substrReplace(':', 2);

// 13:

$string = Str::of('The Framework')->substrReplace(' Laravel', 3, 0);

// The Laravel Framework
```

<a name="method-fluent-str-swap"></a>
#### `swap` {.collection-method}

Phương thức `swap` thay thế nhiều giá trị trong chuỗi bằng hàm `strtr` của PHP:

```php
use Illuminate\Support\Str;

$string = Str::of('Tacos are great!')
    ->swap([
        'Tacos' => 'Burritos',
        'great' => 'fantastic',
    ]);

// Burritos are fantastic!
```

<a name="method-fluent-str-take"></a>
#### `take` {.collection-method}

Phương thức `take` trả về số lượng ký tự được chỉ định tính từ đầu chuỗi:

```php
use Illuminate\Support\Str;

$taken = Str::of('Build something amazing!')->take(5);

// Build
```

<a name="method-fluent-str-tap"></a>
#### `tap` {.collection-method}

Phương thức `tap` truyền chuỗi vào closure đã cho, cho phép bạn kiểm tra và tương tác với chuỗi mà không làm thay đổi chính chuỗi đó. `tap` luôn trả về chuỗi ban đầu bất kể closure trả về giá trị gì:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('Laravel')
    ->append(' Framework')
    ->tap(function (Stringable $string) {
        dump('String after append: '.$string);
    })
    ->upper();

// LARAVEL FRAMEWORK
```

<a name="method-fluent-str-test"></a>
#### `test` {.collection-method}

Phương thức `test` xác định chuỗi có khớp với pattern biểu thức chính quy đã cho hay không:

```php
use Illuminate\Support\Str;

$result = Str::of('Laravel Framework')->test('/Laravel/');

// true
```

<a name="method-fluent-str-title"></a>
#### `title` {.collection-method}

Phương thức `title` chuyển chuỗi đã cho sang dạng `Title Case`:

```php
use Illuminate\Support\Str;

$converted = Str::of('a nice title uses the correct case')->title();

// A Nice Title Uses The Correct Case
```

<a name="method-fluent-str-to-base64"></a>
#### `toBase64` {.collection-method}

Phương thức `toBase64` chuyển chuỗi đã cho sang Base64:

```php
use Illuminate\Support\Str;

$base64 = Str::of('Laravel')->toBase64();

// TGFyYXZlbA==
```

<a name="method-fluent-str-to-html-string"></a>
#### `toHtmlString` {.collection-method}

Phương thức `toHtmlString` chuyển chuỗi đã cho thành một instance của `Illuminate\Support\HtmlString`; giá trị này sẽ không bị escape khi render trong template Blade:

```php
use Illuminate\Support\Str;

$htmlString = Str::of('Nuno Maduro')->toHtmlString();
```

<a name="method-fluent-str-to-uri"></a>
#### `toUri` {.collection-method}

Phương thức `toUri` chuyển chuỗi đã cho thành một instance của [Illuminate\Support\Uri](/docs/{{version}}/helpers#uri):

```php
use Illuminate\Support\Str;

$uri = Str::of('https://example.com')->toUri();
```

<a name="method-fluent-str-transliterate"></a>
#### `transliterate` {.collection-method}

Phương thức `transliterate` cố gắng chuyển chuỗi đã cho sang biểu diễn ASCII gần nhất:

```php
use Illuminate\Support\Str;

$email = Str::of('ⓣⓔⓢⓣ@ⓛⓐⓡⓐⓥⓔⓛ.ⓒⓞⓜ')->transliterate()

// 'test@laravel.com'
```

<a name="method-fluent-str-trim"></a>
#### `trim` {.collection-method}

Phương thức `trim` cắt khoảng trắng ở hai đầu chuỗi. Khác với hàm `trim` nguyên bản của PHP, `trim` của Laravel cũng loại bỏ các ký tự khoảng trắng Unicode:

```php
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->trim();

// 'Laravel'

$string = Str::of('/Laravel/')->trim('/');

// 'Laravel'
```

<a name="method-fluent-str-ltrim"></a>
#### `ltrim` {.collection-method}

Phương thức `ltrim` cắt khoảng trắng ở phía trái chuỗi. Khác với hàm `ltrim` nguyên bản của PHP, `ltrim` của Laravel cũng loại bỏ các ký tự khoảng trắng Unicode:

```php
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->ltrim();

// 'Laravel  '

$string = Str::of('/Laravel/')->ltrim('/');

// 'Laravel/'
```

<a name="method-fluent-str-rtrim"></a>
#### `rtrim` {.collection-method}

Phương thức `rtrim` cắt khoảng trắng ở phía phải của chuỗi đã cho. Khác với hàm `rtrim` nguyên bản của PHP, phương thức `rtrim` của Laravel cũng loại bỏ các ký tự khoảng trắng Unicode:

```php
use Illuminate\Support\Str;

$string = Str::of('  Laravel  ')->rtrim();

// '  Laravel'

$string = Str::of('/Laravel/')->rtrim('/');

// '/Laravel'
```

<a name="method-fluent-str-ucfirst"></a>
#### `ucfirst` {.collection-method}

Phương thức `ucfirst` trả về chuỗi đã cho với ký tự đầu tiên được viết hoa:

```php
use Illuminate\Support\Str;

$string = Str::of('foo bar')->ucfirst();

// Foo bar
```

<a name="method-fluent-str-ucsplit"></a>
#### `ucsplit` {.collection-method}

Phương thức `ucsplit` tách chuỗi đã cho thành một collection dựa trên các ký tự viết hoa:

```php
use Illuminate\Support\Str;

$string = Str::of('Foo Bar')->ucsplit();

// collect(['Foo ', 'Bar'])
```

<a name="method-fluent-str-ucwords"></a>
#### `ucwords` {.collection-method}

Phương thức `ucwords` chuyển ký tự đầu tiên của mỗi từ trong chuỗi sang chữ hoa:

```php
use Illuminate\Support\Str;

$string = Str::of('laravel framework')->ucwords();

// Laravel Framework
```

<a name="method-fluent-str-unwrap"></a>
#### `unwrap` {.collection-method}

Phương thức `unwrap` loại bỏ các chuỗi được chỉ định khỏi đầu và cuối chuỗi đã cho:

```php
use Illuminate\Support\Str;

Str::of('-Laravel-')->unwrap('-');

// Laravel

Str::of('{framework: "Laravel"}')->unwrap('{', '}');

// framework: "Laravel"
```

<a name="method-fluent-str-upper"></a>
#### `upper` {.collection-method}

Phương thức `upper` chuyển chuỗi đã cho sang chữ hoa:

```php
use Illuminate\Support\Str;

$adjusted = Str::of('laravel')->upper();

// LARAVEL
```

<a name="method-fluent-str-when"></a>
#### `when` {.collection-method}

Phương thức `when` gọi closure đã cho nếu điều kiện là `true`. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('Taylor')
    ->when(true, function (Stringable $string) {
        return $string->append(' Otwell');
    });

// 'Taylor Otwell'
```

Nếu cần, bạn có thể truyền thêm một closure làm tham số thứ ba cho `when`. Closure này sẽ được thực thi nếu điều kiện được đánh giá là `false`.

<a name="method-fluent-str-when-contains"></a>
#### `whenContains` {.collection-method}

Phương thức `whenContains` gọi closure đã cho nếu chuỗi chứa giá trị được chỉ định. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('tony stark')
    ->whenContains('tony', function (Stringable $string) {
        return $string->title();
    });

// 'Tony Stark'
```

Nếu cần, bạn có thể truyền thêm một closure làm tham số thứ ba. Closure này sẽ được gọi nếu chuỗi không chứa giá trị đã cho.

Bạn cũng có thể truyền một mảng giá trị để kiểm tra chuỗi có chứa ít nhất một giá trị trong mảng hay không:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('tony stark')
    ->whenContains(['tony', 'hulk'], function (Stringable $string) {
        return $string->title();
    });

// Tony Stark
```

<a name="method-fluent-str-when-contains-all"></a>
#### `whenContainsAll` {.collection-method}

Phương thức `whenContainsAll` gọi closure đã cho nếu chuỗi chứa tất cả các chuỗi con được chỉ định. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('tony stark')
    ->whenContainsAll(['tony', 'stark'], function (Stringable $string) {
        return $string->title();
    });

// 'Tony Stark'
```

Nếu cần, bạn có thể truyền thêm một closure làm tham số thứ ba. Closure này sẽ được gọi nếu điều kiện được đánh giá là `false`.

<a name="method-fluent-str-when-doesnt-end-with"></a>
#### `whenDoesntEndWith` {.collection-method}

Phương thức `whenDoesntEndWith` gọi closure đã cho nếu chuỗi không kết thúc bằng chuỗi con được chỉ định. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('disney world')->whenDoesntEndWith('land', function (Stringable $string) {
    return $string->title();
});

// 'Disney World'
```

<a name="method-fluent-str-when-doesnt-start-with"></a>
#### `whenDoesntStartWith` {.collection-method}

Phương thức `whenDoesntStartWith` gọi closure đã cho nếu chuỗi không bắt đầu bằng chuỗi con được chỉ định. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('disney world')->whenDoesntStartWith('sea', function (Stringable $string) {
    return $string->title();
});

// 'Disney World'
```

<a name="method-fluent-str-when-empty"></a>
#### `whenEmpty` {.collection-method}

Phương thức `whenEmpty` gọi closure đã cho nếu chuỗi rỗng. Nếu closure trả về một giá trị, `whenEmpty` cũng trả về giá trị đó. Nếu closure không trả về giá trị, instance fluent string sẽ được trả về:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('  ')->trim()->whenEmpty(function (Stringable $string) {
    return $string->prepend('Laravel');
});

// 'Laravel'
```

<a name="method-fluent-str-when-not-empty"></a>
#### `whenNotEmpty` {.collection-method}

Phương thức `whenNotEmpty` gọi closure đã cho nếu chuỗi không rỗng. Nếu closure trả về một giá trị, `whenNotEmpty` cũng trả về giá trị đó. Nếu closure không trả về giá trị, instance fluent string sẽ được trả về:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('Framework')->whenNotEmpty(function (Stringable $string) {
    return $string->prepend('Laravel ');
});

// 'Laravel Framework'
```

<a name="method-fluent-str-when-starts-with"></a>
#### `whenStartsWith` {.collection-method}

Phương thức `whenStartsWith` gọi closure đã cho nếu chuỗi bắt đầu bằng chuỗi con được chỉ định. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('disney world')->whenStartsWith('disney', function (Stringable $string) {
    return $string->title();
});

// 'Disney World'
```

<a name="method-fluent-str-when-ends-with"></a>
#### `whenEndsWith` {.collection-method}

Phương thức `whenEndsWith` gọi closure đã cho nếu chuỗi kết thúc bằng chuỗi con được chỉ định. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('disney world')->whenEndsWith('world', function (Stringable $string) {
    return $string->title();
});

// 'Disney World'
```

<a name="method-fluent-str-when-exactly"></a>
#### `whenExactly` {.collection-method}

Phương thức `whenExactly` gọi closure đã cho nếu chuỗi khớp chính xác với chuỗi được chỉ định. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('laravel')->whenExactly('laravel', function (Stringable $string) {
    return $string->title();
});

// 'Laravel'
```

<a name="method-fluent-str-when-not-exactly"></a>
#### `whenNotExactly` {.collection-method}

Phương thức `whenNotExactly` gọi closure đã cho nếu chuỗi không khớp chính xác với chuỗi được chỉ định. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('framework')->whenNotExactly('laravel', function (Stringable $string) {
    return $string->title();
});

// 'Framework'
```

<a name="method-fluent-str-when-is"></a>
#### `whenIs` {.collection-method}

Phương thức `whenIs` gọi closure đã cho nếu chuỗi khớp với pattern được chỉ định. Có thể dùng dấu hoa thị làm wildcard. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('foo/bar')->whenIs('foo/*', function (Stringable $string) {
    return $string->append('/baz');
});

// 'foo/bar/baz'
```

<a name="method-fluent-str-when-is-ascii"></a>
#### `whenIsAscii` {.collection-method}

Phương thức `whenIsAscii` gọi closure đã cho nếu chuỗi là ASCII 7-bit. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('laravel')->whenIsAscii(function (Stringable $string) {
    return $string->title();
});

// 'Laravel'
```

<a name="method-fluent-str-when-is-ulid"></a>
#### `whenIsUlid` {.collection-method}

Phương thức `whenIsUlid` gọi closure đã cho nếu chuỗi là ULID hợp lệ. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;

$string = Str::of('01gd6r360bp37zj17nxb55yv40')->whenIsUlid(function (Stringable $string) {
    return $string->substr(0, 8);
});

// '01gd6r36'
```

<a name="method-fluent-str-when-is-uuid"></a>
#### `whenIsUuid` {.collection-method}

Phương thức `whenIsUuid` gọi closure đã cho nếu chuỗi là UUID hợp lệ. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('a0a2a2d2-0b87-4a18-83f2-2529882be2de')->whenIsUuid(function (Stringable $string) {
    return $string->substr(0, 8);
});

// 'a0a2a2d2'
```

<a name="method-fluent-str-when-test"></a>
#### `whenTest` {.collection-method}

Phương thức `whenTest` gọi closure đã cho nếu chuỗi khớp với biểu thức chính quy được chỉ định. Closure sẽ nhận instance fluent string:

```php
use Illuminate\Support\Str;
use Illuminate\Support\Stringable;

$string = Str::of('laravel framework')->whenTest('/laravel/', function (Stringable $string) {
    return $string->title();
});

// 'Laravel Framework'
```

<a name="method-fluent-str-word-count"></a>
#### `wordCount` {.collection-method}

Phương thức `wordCount` trả về số lượng từ có trong chuỗi:

```php
use Illuminate\Support\Str;

Str::of('Hello, world!')->wordCount(); // 2
```

<a name="method-fluent-str-words"></a>
#### `words` {.collection-method}

Phương thức `words` giới hạn số lượng từ trong chuỗi. Nếu cần, bạn có thể chỉ định thêm một chuỗi để nối vào cuối chuỗi sau khi rút gọn:

```php
use Illuminate\Support\Str;

$string = Str::of('Perfectly balanced, as all things should be.')->words(3, ' >>>');

// Perfectly balanced, as >>>
```

<a name="method-fluent-str-wrap"></a>
#### `wrap` {.collection-method}

Phương thức `wrap` bao chuỗi đã cho bằng một chuỗi bổ sung hoặc một cặp chuỗi:

```php
use Illuminate\Support\Str;

Str::of('Laravel')->wrap('"');

// "Laravel"

Str::is('is')->wrap(before: 'This ', after: ' Laravel!');

// This is Laravel!
```

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/strings). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
