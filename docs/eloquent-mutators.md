# Eloquent: Mutator và Ép kiểu

<a name="introduction"></a>
## Giới thiệu

Accessor, mutator và attribute casting cho phép bạn biến đổi giá trị thuộc tính Eloquent khi đọc hoặc gán chúng trên các instance của model. Ví dụ, bạn có thể sử dụng [cơ chế mã hóa của Laravel](/docs/{{version}}/encryption) để mã hóa một giá trị khi lưu trong cơ sở dữ liệu, sau đó tự động giải mã thuộc tính khi truy cập nó trên Eloquent model. Hoặc, bạn có thể chuyển một chuỗi JSON đang lưu trong cơ sở dữ liệu thành mảng khi truy cập thông qua Eloquent model.

<a name="accessors-and-mutators"></a>
## Accessor và Mutator

<a name="defining-an-accessor"></a>
### Định nghĩa Accessor

Accessor biến đổi giá trị của một thuộc tính Eloquent khi thuộc tính đó được truy cập. Để định nghĩa accessor, hãy tạo một method `protected` trên model đại diện cho thuộc tính cần truy cập. Khi phù hợp, tên method này phải tương ứng với dạng "camel case" của thuộc tính model / cột cơ sở dữ liệu thực tế bên dưới.

Trong ví dụ này, chúng ta sẽ định nghĩa accessor cho thuộc tính `first_name`. Eloquent sẽ tự động gọi accessor khi cần lấy giá trị của thuộc tính `first_name`. Tất cả method accessor / mutator của thuộc tính phải khai báo return type-hint là `Illuminate\Database\Eloquent\Casts\Attribute`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the user's first name.
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucfirst($value),
        );
    }
}
```

Mọi accessor method đều trả về một instance `Attribute`, dùng để định nghĩa cách thuộc tính được đọc và, nếu cần, được thay đổi. Trong ví dụ này, chúng ta chỉ định nghĩa cách đọc thuộc tính bằng cách truyền đối số `get` vào constructor của class `Attribute`.

Như bạn có thể thấy, giá trị gốc của cột được truyền vào accessor để bạn có thể xử lý rồi trả về giá trị mong muốn. Để lấy giá trị qua accessor, bạn chỉ cần truy cập thuộc tính `first_name` trên một model instance:

```php
use App\Models\User;

$user = User::find(1);

$firstName = $user->first_name;
```

> [!NOTE]
> Nếu muốn các giá trị được tính toán này xuất hiện trong biểu diễn array / JSON của model, [bạn cần append chúng](/docs/{{version}}/eloquent-serialization#appending-values-to-json).

<a name="building-value-objects-from-multiple-attributes"></a>
#### Tạo Value Object từ nhiều thuộc tính

Đôi khi accessor cần biến đổi nhiều thuộc tính của model thành một "value object" duy nhất. Khi đó, closure `get` có thể nhận đối số thứ hai là `$attributes`. Laravel tự động truyền đối số này vào closure dưới dạng mảng chứa toàn bộ thuộc tính hiện tại của model:

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Interact with the user's address.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    );
}
```

<a name="accessor-caching"></a>
#### Cache Accessor

Khi accessor trả về value object, mọi thay đổi trên object đó sẽ tự động được đồng bộ trở lại model trước khi model được lưu. Điều này thực hiện được vì Eloquent giữ lại instance do accessor trả về, nhờ đó có thể trả về chính instance đó mỗi lần accessor được gọi:

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Line 1 Value';
$user->address->lineTwo = 'Updated Address Line 2 Value';

$user->save();
```

Tuy nhiên, đôi khi bạn có thể muốn bật cache cho các giá trị primitive như string và boolean, đặc biệt khi việc tính toán chúng tốn nhiều tài nguyên. Để làm điều này, hãy gọi method `shouldCache` khi định nghĩa accessor:

```php
protected function hash(): Attribute
{
    return Attribute::make(
        get: fn (string $value) => bcrypt(gzuncompress($value)),
    )->shouldCache();
}
```

Nếu muốn tắt cơ chế cache object của thuộc tính, bạn có thể gọi method `withoutObjectCaching` khi định nghĩa thuộc tính:

```php
/**
 * Interact with the user's address.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
    )->withoutObjectCaching();
}
```

<a name="defining-a-mutator"></a>
### Định nghĩa Mutator

Mutator biến đổi giá trị của một thuộc tính Eloquent khi giá trị được gán. Để định nghĩa mutator, bạn có thể cung cấp đối số `set` khi định nghĩa thuộc tính. Hãy định nghĩa mutator cho thuộc tính `first_name`. Mutator này sẽ tự động được gọi khi chúng ta gán giá trị cho `first_name` trên model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Interact with the user's first name.
     */
    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => ucfirst($value),
            set: fn (string $value) => strtolower($value),
        );
    }
}
```

Closure của mutator nhận giá trị đang được gán cho thuộc tính, cho phép bạn xử lý và trả về giá trị sau khi biến đổi. Để sử dụng mutator này, chúng ta chỉ cần gán thuộc tính `first_name` trên Eloquent model:

```php
use App\Models\User;

$user = User::find(1);

$user->first_name = 'Sally';
```

Trong ví dụ này, callback `set` được gọi với giá trị `Sally`. Mutator sau đó áp dụng hàm `strtolower` cho tên và đặt kết quả vào mảng `$attributes` nội bộ của model.

<a name="mutating-multiple-attributes"></a>
#### Thay đổi nhiều thuộc tính

Đôi khi mutator cần gán nhiều thuộc tính trên model bên dưới. Khi đó, bạn có thể trả về một mảng từ closure `set`. Mỗi key trong mảng phải tương ứng với một thuộc tính / cột cơ sở dữ liệu của model:

```php
use App\Support\Address;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Interact with the user's address.
 */
protected function address(): Attribute
{
    return Attribute::make(
        get: fn (mixed $value, array $attributes) => new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two'],
        ),
        set: fn (Address $value) => [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ],
    );
}
```

<a name="attribute-casting"></a>
## Ép kiểu thuộc tính

Attribute casting cung cấp chức năng tương tự accessor và mutator nhưng không yêu cầu định nghĩa thêm method trên model. Thay vào đó, method `casts` của model cung cấp cách thuận tiện để chuyển đổi thuộc tính sang các kiểu dữ liệu thông dụng.

Method `casts` phải trả về một mảng, trong đó key là tên thuộc tính cần cast và value là kiểu dữ liệu mà bạn muốn ép cột đó sang. Các kiểu cast được hỗ trợ gồm:

<div class="content-list" markdown="1">

- `array`
- `AsFluent::class`
- `AsStringable::class`
- `AsUri::class`
- `AsVector::class`
- `boolean`
- `collection`
- `date`
- `datetime`
- `immutable_date`
- `immutable_datetime`
- <code>decimal:&lt;precision&gt;</code>
- `double`
- `encrypted`
- `encrypted:array`
- `encrypted:collection`
- `encrypted:object`
- `float`
- `hashed`
- `integer`
- `object`
- `real`
- `string`
- `timestamp`

</div>

Để minh họa attribute casting, hãy cast thuộc tính `is_admin`, vốn được lưu trong cơ sở dữ liệu dưới dạng integer (`0` hoặc `1`), thành giá trị boolean:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_admin' => 'boolean',
        ];
    }
}
```

Sau khi định nghĩa cast, thuộc tính `is_admin` luôn được chuyển thành boolean khi truy cập, ngay cả khi giá trị bên dưới được lưu trong cơ sở dữ liệu dưới dạng integer:

```php
$user = App\Models\User::find(1);

if ($user->is_admin) {
    // ...
}
```

Nếu cần thêm cast tạm thời tại runtime, bạn có thể sử dụng method `mergeCasts`. Các định nghĩa cast này sẽ được bổ sung vào những cast đã có trên model:

```php
$user->mergeCasts([
    'is_admin' => 'integer',
    'options' => 'object',
]);
```

> [!WARNING]
> Các thuộc tính có giá trị `null` sẽ không được cast. Ngoài ra, bạn không nên định nghĩa cast (hoặc thuộc tính) trùng tên với một relationship, cũng không nên gán cast cho primary key của model.

<a name="stringable-casting"></a>
#### Ép kiểu Stringable

Bạn có thể sử dụng cast class `Illuminate\Database\Eloquent\Casts\AsStringable` để cast một thuộc tính model thành [object `Illuminate\Support\Stringable` dạng fluent](/docs/{{version}}/strings#fluent-strings-method-list):

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsStringable;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'directory' => AsStringable::class,
        ];
    }
}
```

<a name="array-and-json-casting"></a>
### Ép kiểu Array và JSON

Cast `array` đặc biệt hữu ích khi làm việc với các cột lưu JSON đã được tuần tự hóa. Ví dụ, nếu cơ sở dữ liệu có field kiểu `JSON` hoặc `TEXT` chứa JSON, việc thêm cast `array` cho thuộc tính sẽ tự động deserialize thuộc tính thành mảng PHP khi bạn truy cập nó trên Eloquent model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => 'array',
        ];
    }
}
```

Sau khi định nghĩa cast, bạn có thể truy cập thuộc tính `options` và nó sẽ tự động được deserialize từ JSON thành mảng PHP. Khi gán giá trị cho `options`, mảng được cung cấp sẽ tự động được serialize trở lại JSON để lưu trữ:

```php
use App\Models\User;

$user = User::find(1);

$options = $user->options;

$options['key'] = 'value';

$user->options = $options;

$user->save();
```

Để cập nhật một field riêng lẻ của thuộc tính JSON bằng cú pháp ngắn gọn hơn, bạn có thể [cho phép mass assignment đối với thuộc tính](/docs/{{version}}/eloquent#mass-assignment-json-columns) và sử dụng toán tử `->` khi gọi method `update`:

```php
$user = User::find(1);

$user->update(['options->key' => 'value']);
```

<a name="json-and-unicode"></a>
#### JSON và Unicode

Nếu muốn lưu thuộc tính array dưới dạng JSON mà không escape các ký tự Unicode, bạn có thể sử dụng cast `json:unicode`:

```php
/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => 'json:unicode',
    ];
}
```

<a name="array-object-and-collection-casting"></a>
#### Ép kiểu Array Object và Collection

Mặc dù cast `array` tiêu chuẩn đủ dùng cho nhiều ứng dụng, nó vẫn có một số hạn chế. Vì cast `array` trả về kiểu primitive, bạn không thể thay đổi trực tiếp một offset của mảng. Ví dụ, đoạn code sau sẽ gây lỗi PHP:

```php
$user = User::find(1);

$user->options['key'] = $value;
```

Để giải quyết vấn đề này, Laravel cung cấp cast `AsArrayObject`, chuyển thuộc tính JSON thành class [ArrayObject](https://www.php.net/manual/en/class.arrayobject.php). Tính năng này được triển khai bằng cơ chế [custom cast](#custom-casts) của Laravel, cho phép framework cache và biến đổi object một cách phù hợp để từng offset có thể được chỉnh sửa mà không gây lỗi PHP. Để sử dụng `AsArrayObject`, chỉ cần gán cast này cho thuộc tính:

```php
use Illuminate\Database\Eloquent\Casts\AsArrayObject;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsArrayObject::class,
    ];
}
```

Tương tự, Laravel cung cấp cast `AsCollection` để chuyển thuộc tính JSON thành một instance [Collection](/docs/{{version}}/collections) của Laravel:

```php
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsCollection::class,
    ];
}
```

Nếu muốn `AsCollection` khởi tạo một custom collection class thay vì base collection class của Laravel, bạn có thể truyền tên collection class làm đối số cho cast:

```php
use App\Collections\OptionCollection;
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsCollection::using(OptionCollection::class),
    ];
}
```

Method `of` có thể được dùng để chỉ định rằng các phần tử của collection phải được map sang một class cụ thể thông qua [method `mapInto`](/docs/{{version}}/collections#method-mapinto) của collection:

```php
use App\ValueObjects\Option;
use Illuminate\Database\Eloquent\Casts\AsCollection;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'options' => AsCollection::of(Option::class)
    ];
}
```

Khi map collection thành object, object nên implement các interface `Illuminate\Contracts\Support\Arrayable` và `JsonSerializable` để xác định cách các instance được serialize thành JSON khi lưu vào cơ sở dữ liệu:

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Support\Arrayable;
use JsonSerializable;

class Option implements Arrayable, JsonSerializable
{
    public string $name;
    public mixed $value;
    public bool $isLocked;

    /**
     * Create a new Option instance.
     */
    public function __construct(array $data)
    {
        $this->name = $data['name'];
        $this->value = $data['value'];
        $this->isLocked = $data['is_locked'];
    }

    /**
     * Get the instance as an array.
     *
     * @return array{name: string, data: string, is_locked: bool}
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'value' => $this->value,
            'is_locked' => $this->isLocked,
        ];
    }

    /**
     * Specify the data which should be serialized to JSON.
     *
     * @return array{name: string, data: string, is_locked: bool}
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
```

<a name="vector-casting"></a>
### Ép kiểu Vector

Bạn có thể sử dụng cast class `Illuminate\Database\Eloquent\Casts\AsVector` để chuyển đổi hai chiều giữa cột vector trong cơ sở dữ liệu và mảng PHP:

```php
use Illuminate\Database\Eloquent\Casts\AsVector;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'embedding' => AsVector::class,
    ];
}
```

Khi gán thuộc tính, cast chấp nhận mảng PHP hoặc instance `Arrayable`, chẳng hạn Laravel collection. Khi đọc thuộc tính, cast trả về một mảng các số float.

<a name="binary-casting"></a>
### Ép kiểu Binary

Nếu Eloquent model có cột `uuid` hoặc `ulid` dạng [binary](/docs/{{version}}/migrations#column-method-binary) bên cạnh cột ID tự tăng, bạn có thể dùng cast `AsBinary` để tự động chuyển đổi hai chiều giữa giá trị và biểu diễn binary của nó:

```php
use Illuminate\Database\Eloquent\Casts\AsBinary;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'uuid' => AsBinary::uuid(),
        'ulid' => AsBinary::ulid(),
    ];
}
```

Sau khi định nghĩa cast trên model, bạn có thể gán giá trị thuộc tính UUID / ULID bằng một object instance hoặc string. Eloquent sẽ tự động chuyển giá trị sang biểu diễn binary. Khi đọc thuộc tính, bạn luôn nhận được giá trị string dạng plain text:

```php
use Illuminate\Support\Str;

$user->uuid = Str::uuid();

return $user->uuid;

// "6e8cdeed-2f32-40bd-b109-1e4405be2140"
```

<a name="date-casting"></a>
### Ép kiểu Date

Mặc định, Eloquent cast các cột `created_at` và `updated_at` thành instance của [Carbon](https://github.com/briannesbitt/Carbon), class mở rộng `DateTime` của PHP và cung cấp nhiều method hữu ích. Bạn có thể cast thêm các thuộc tính ngày tháng bằng cách khai báo thêm date cast trong method `casts` của model. Thông thường, ngày tháng nên sử dụng kiểu cast `datetime` hoặc `immutable_datetime`.

Khi định nghĩa cast `date` hoặc `datetime`, bạn cũng có thể chỉ định format của ngày. Format này được sử dụng khi [model được serialize thành array hoặc JSON](/docs/{{version}}/eloquent-serialization):

```php
/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'created_at' => 'datetime:Y-m-d',
    ];
}
```

Khi một cột được cast thành date, bạn có thể gán thuộc tính model tương ứng bằng UNIX timestamp, date string (`Y-m-d`), date-time string hoặc instance `DateTime` / `Carbon`. Giá trị ngày sẽ được chuyển đổi chính xác và lưu vào cơ sở dữ liệu.

Bạn có thể tùy chỉnh format serialize mặc định cho toàn bộ ngày tháng của model bằng cách định nghĩa method `serializeDate`. Method này không ảnh hưởng đến format dùng để lưu ngày tháng trong cơ sở dữ liệu:

```php
/**
 * Prepare a date for array / JSON serialization.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

Để chỉ định format thực sự được dùng khi lưu ngày tháng của model vào cơ sở dữ liệu, hãy sử dụng đối số `dateFormat` trên attribute `Table` của model:

```php
use Illuminate\Database\Eloquent\Attributes\Table;

#[Table(dateFormat: 'U')]
class Flight extends Model
{
    // ...
}
```

<a name="date-casting-and-timezones"></a>
#### Ép kiểu Date, Serialization, and Timezones

Mặc định, các cast `date` và `datetime` serialize ngày thành chuỗi UTC ISO-8601 (`YYYY-MM-DDTHH:MM:SS.uuuuuuZ`), bất kể múi giờ được cấu hình trong tùy chọn `timezone` của ứng dụng. Bạn được khuyến nghị mạnh mẽ luôn sử dụng format serialize này và lưu ngày tháng của ứng dụng theo UTC bằng cách giữ nguyên giá trị mặc định `UTC` của cấu hình `timezone`. Việc sử dụng UTC nhất quán trong toàn bộ ứng dụng mang lại khả năng tương tác tốt nhất với các thư viện xử lý ngày tháng khác viết bằng PHP và JavaScript.

Nếu áp dụng custom format cho cast `date` hoặc `datetime`, chẳng hạn `datetime:Y-m-d H:i:s`, múi giờ bên trong instance Carbon sẽ được dùng khi serialize ngày. Thông thường đây là múi giờ được chỉ định trong cấu hình `timezone` của ứng dụng. Tuy nhiên, cần lưu ý rằng các cột `timestamp` như `created_at` và `updated_at` không tuân theo hành vi này và luôn được format theo UTC, bất kể cấu hình múi giờ của ứng dụng.

<a name="enum-casting"></a>
### Ép kiểu Enum

Eloquent cũng cho phép cast giá trị thuộc tính sang [Enum](https://www.php.net/manual/en/language.enumerations.backed.php) của PHP. Để thực hiện, hãy chỉ định thuộc tính và enum cần cast trong method `casts` của model:

```php
use App\Enums\ServerStatus;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'status' => ServerStatus::class,
    ];
}
```

Sau khi định nghĩa cast trên model, thuộc tính được chỉ định sẽ tự động được chuyển đổi hai chiều với enum khi bạn tương tác với thuộc tính đó:

```php
if ($server->status == ServerStatus::Provisioned) {
    $server->status = ServerStatus::Ready;

    $server->save();
}
```

<a name="casting-arrays-of-enums"></a>
#### Ép kiểu mảng Enum

Đôi khi model cần lưu một mảng các giá trị enum trong cùng một cột. Khi đó, bạn có thể sử dụng cast `AsEnumArrayObject` hoặc `AsEnumCollection` do Laravel cung cấp:

```php
use App\Enums\ServerStatus;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;

/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'statuses' => AsEnumCollection::of(ServerStatus::class),
    ];
}
```

<a name="encrypted-casting"></a>
### Ép kiểu mã hóa

Cast `encrypted` mã hóa giá trị thuộc tính của model bằng tính năng [mã hóa](/docs/{{version}}/encryption) tích hợp sẵn của Laravel. Ngoài ra, các cast `encrypted:array`, `encrypted:collection`, `encrypted:object`, `AsEncryptedArrayObject` và `AsEncryptedCollection` hoạt động tương tự phiên bản không mã hóa tương ứng; tuy nhiên, giá trị bên dưới sẽ được mã hóa khi lưu vào cơ sở dữ liệu.

Do độ dài cuối cùng của dữ liệu đã mã hóa không thể dự đoán và dài hơn plain text tương ứng, hãy bảo đảm cột cơ sở dữ liệu liên quan có kiểu `TEXT` hoặc lớn hơn. Ngoài ra, vì giá trị được mã hóa trong cơ sở dữ liệu, bạn sẽ không thể query hoặc tìm kiếm theo các giá trị thuộc tính đã mã hóa.

<a name="key-rotation"></a>
#### Xoay vòng khóa

Laravel mã hóa string bằng giá trị cấu hình `key` trong file cấu hình `app` của ứng dụng. Thông thường, giá trị này tương ứng với biến môi trường `APP_KEY`. Nếu cần xoay vòng khóa mã hóa của ứng dụng, bạn có thể [thực hiện an toàn](/docs/{{version}}/encryption#gracefully-rotating-encryption-keys).

<a name="query-time-casting"></a>
### Ép kiểu tại thời điểm truy vấn

Đôi khi bạn cần áp dụng cast ngay trong lúc thực thi query, chẳng hạn khi select một raw value từ bảng. Ví dụ, hãy xem query sau:

```php
use App\Models\Post;
use App\Models\User;

$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
        ->whereColumn('user_id', 'users.id')
])->get();
```

Thuộc tính `last_posted_at` trong kết quả của query này sẽ chỉ là một string. Nếu muốn áp dụng cast `datetime` cho thuộc tính ngay khi thực thi query, bạn có thể sử dụng method `withCasts`:

```php
$users = User::select([
    'users.*',
    'last_posted_at' => Post::selectRaw('MAX(created_at)')
        ->whereColumn('user_id', 'users.id')
])->withCasts([
    'last_posted_at' => 'datetime'
])->get();
```

<a name="custom-casts"></a>
## Custom Cast

Laravel cung cấp nhiều kiểu cast tích hợp hữu ích; tuy nhiên, đôi khi bạn cần tự định nghĩa kiểu cast riêng. Để tạo cast, hãy chạy lệnh Artisan `make:cast`. Class cast mới sẽ được đặt trong thư mục `app/Casts`:

```shell
php artisan make:cast AsJson
```

Mọi custom cast class đều implement interface `CastsAttributes`. Class implement interface này phải định nghĩa method `get` và `set`. Method `get` chịu trách nhiệm biến đổi raw value từ cơ sở dữ liệu thành giá trị đã cast, còn `set` biến đổi giá trị cast thành raw value có thể lưu trong cơ sở dữ liệu. Ví dụ sau sẽ triển khai lại kiểu cast `json` tích hợp dưới dạng custom cast:

```php
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class AsJson implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function get(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): array {
        return json_decode($value, true);
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): string {
        return json_encode($value);
    }
}
```

Sau khi định nghĩa custom cast, bạn có thể gắn nó vào một thuộc tính model bằng tên class:

```php
<?php

namespace App\Models;

use App\Casts\AsJson;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => AsJson::class,
        ];
    }
}
```

<a name="value-object-casting"></a>
### Ép kiểu Value Object

Bạn không bị giới hạn ở việc cast giá trị sang kiểu primitive mà còn có thể cast sang object. Việc định nghĩa custom cast cho object tương tự cast sang primitive; tuy nhiên, nếu value object bao gồm nhiều cột cơ sở dữ liệu, method `set` phải trả về mảng các cặp key / value dùng để gán raw value có thể lưu vào model. Nếu value object chỉ tác động đến một cột, bạn chỉ cần trả về giá trị có thể lưu.

Ví dụ, chúng ta sẽ định nghĩa custom cast class để cast nhiều giá trị của model thành một value object `Address`. Giả sử `Address` có hai public property là `lineOne` và `lineTwo`:

```php
<?php

namespace App\Casts;

use App\ValueObjects\Address;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

class AsAddress implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): Address {
        return new Address(
            $attributes['address_line_one'],
            $attributes['address_line_two']
        );
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, string>
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): array {
        if (! $value instanceof Address) {
            throw new InvalidArgumentException('The given value is not an Address instance.');
        }

        return [
            'address_line_one' => $value->lineOne,
            'address_line_two' => $value->lineTwo,
        ];
    }
}
```

Khi cast sang value object, mọi thay đổi trên value object sẽ tự động được đồng bộ trở lại model trước khi model được lưu:

```php
use App\Models\User;

$user = User::find(1);

$user->address->lineOne = 'Updated Address Value';

$user->save();
```

> [!NOTE]
> Nếu dự định serialize Eloquent model chứa value object thành JSON hoặc array, bạn nên implement các interface `Illuminate\Contracts\Support\Arrayable` và `JsonSerializable` trên value object.

<a name="value-object-caching"></a>
#### Cache Value Object

Khi thuộc tính được cast sang value object được resolve, Eloquent sẽ cache chúng. Vì vậy, nếu truy cập lại thuộc tính, cùng một object instance sẽ được trả về.

Nếu muốn tắt cơ chế cache object của custom cast class, bạn có thể khai báo public property `withoutObjectCaching` trên custom cast class:

```php
class AsAddress implements CastsAttributes
{
    public bool $withoutObjectCaching = true;

    // ...
}
```

<a name="array-json-serialization"></a>
### Tuần tự hóa Array / JSON

Khi Eloquent model được chuyển thành array hoặc JSON bằng method `toArray` và `toJson`, các value object của custom cast thường cũng được serialize nếu chúng implement `Illuminate\Contracts\Support\Arrayable` và `JsonSerializable`. Tuy nhiên, với value object do thư viện bên thứ ba cung cấp, bạn có thể không thể bổ sung các interface này vào object.

Vì vậy, bạn có thể chỉ định custom cast class chịu trách nhiệm serialize value object. Để làm điều này, custom cast class phải implement interface `Illuminate\Contracts\Database\Eloquent\SerializesCastableAttributes`. Interface này yêu cầu class có method `serialize` trả về biểu diễn đã serialize của value object:

```php
/**
 * Get the serialized representation of the value.
 *
 * @param  array<string, mixed>  $attributes
 */
public function serialize(
    Model $model,
    string $key,
    mixed $value,
    array $attributes,
): string {
    return (string) $value;
}
```

<a name="inbound-casting"></a>
### Inbound Casting

Đôi khi bạn cần viết custom cast class chỉ biến đổi giá trị khi chúng được gán vào model và không thực hiện thao tác nào khi thuộc tính được đọc từ model.

Custom cast chỉ xử lý inbound nên implement interface `CastsInboundAttributes`, interface này chỉ yêu cầu định nghĩa method `set`. Bạn có thể gọi lệnh Artisan `make:cast` với tùy chọn `--inbound` để tạo inbound-only cast class:

```shell
php artisan make:cast AsHash --inbound
```

Ví dụ điển hình của inbound-only cast là cast dùng để "hash". Chẳng hạn, chúng ta có thể định nghĩa cast hash các giá trị đầu vào bằng một thuật toán được chỉ định:

```php
<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsInboundAttributes;
use Illuminate\Database\Eloquent\Model;

class AsHash implements CastsInboundAttributes
{
    /**
     * Create a new cast class instance.
     */
    public function __construct(
        protected string|null $algorithm = null,
    ) {}

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(
        Model $model,
        string $key,
        mixed $value,
        array $attributes,
    ): string {
        return is_null($this->algorithm)
            ? bcrypt($value)
            : hash($this->algorithm, $value);
    }
}
```

<a name="cast-parameters"></a>
### Tham số của Cast

Khi gắn custom cast vào model, bạn có thể chỉ định tham số cast bằng cách ngăn cách chúng với tên class bằng ký tự `:` và dùng dấu phẩy để phân tách nhiều tham số. Các tham số sẽ được truyền vào constructor của cast class:

```php
/**
 * Get the attributes that should be cast.
 *
 * @return array<string, string>
 */
protected function casts(): array
{
    return [
        'secret' => AsHash::class.':sha256',
    ];
}
```

<a name="comparing-cast-values"></a>
### So sánh giá trị Cast

Nếu muốn định nghĩa cách so sánh hai giá trị cast để xác định chúng có thay đổi hay không, custom cast class có thể implement interface `Illuminate\Contracts\Database\Eloquent\ComparesCastableAttributes`. Điều này cho phép bạn kiểm soát chi tiết những giá trị nào Eloquent xem là đã thay đổi và vì thế cần lưu vào cơ sở dữ liệu khi model được cập nhật.

Interface này yêu cầu class có method `compare`, trả về `true` nếu các giá trị được cung cấp được xem là bằng nhau:

```php
/**
 * Determine if the given values are equal.
 *
 * @param  \Illuminate\Database\Eloquent\Model  $model
 * @param  string  $key
 * @param  mixed  $firstValue
 * @param  mixed  $secondValue
 * @return bool
 */
public function compare(
    Model $model,
    string $key,
    mixed $firstValue,
    mixed $secondValue
): bool {
    return $firstValue === $secondValue;
}
```

<a name="castables"></a>
### Castable

Bạn có thể muốn cho phép value object của ứng dụng tự định nghĩa custom cast class của chính nó. Thay vì gắn custom cast class vào model, bạn có thể gắn một value object class implement interface `Illuminate\Contracts\Database\Eloquent\Castable`:

```php
use App\ValueObjects\Address;

protected function casts(): array
{
    return [
        'address' => Address::class,
    ];
}
```

Object implement interface `Castable` phải định nghĩa method `castUsing`, method này trả về tên class của custom caster chịu trách nhiệm cast hai chiều với class `Castable`:

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use App\Casts\AsAddress;

class Address implements Castable
{
    /**
     * Get the name of the caster class to use when casting from / to this cast target.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): string
    {
        return AsAddress::class;
    }
}
```

Khi sử dụng class `Castable`, bạn vẫn có thể truyền đối số trong định nghĩa method `casts`. Các đối số sẽ được truyền vào method `castUsing`:

```php
use App\ValueObjects\Address;

protected function casts(): array
{
    return [
        'address' => Address::class.':argument',
    ];
}
```

<a name="anonymous-cast-classes"></a>
#### Castable & Anonymous Cast Classes

Bằng cách kết hợp "castable" với [anonymous class](https://www.php.net/manual/en/language.oop5.anonymous.php) của PHP, bạn có thể định nghĩa value object và logic casting của nó trong một castable object duy nhất. Để thực hiện, hãy trả về một anonymous class từ method `castUsing` của value object. Anonymous class này phải implement interface `CastsAttributes`:

```php
<?php

namespace App\ValueObjects;

use Illuminate\Contracts\Database\Eloquent\Castable;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class Address implements Castable
{
    // ...

    /**
     * Get the caster class to use when casting from / to this cast target.
     *
     * @param  array<string, mixed>  $arguments
     */
    public static function castUsing(array $arguments): CastsAttributes
    {
        return new class implements CastsAttributes
        {
            public function get(
                Model $model,
                string $key,
                mixed $value,
                array $attributes,
            ): Address {
                return new Address(
                    $attributes['address_line_one'],
                    $attributes['address_line_two']
                );
            }

            public function set(
                Model $model,
                string $key,
                mixed $value,
                array $attributes,
            ): array {
                return [
                    'address_line_one' => $value->lineOne,
                    'address_line_two' => $value->lineTwo,
                ];
            }
        };
    }
}
```
