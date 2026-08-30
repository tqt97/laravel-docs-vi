# Eloquent: Tuần tự hóa
- [Giới thiệu](#introduction)
- [Tuần tự hóa Model và Collection](#serializing-models-and-collections)
    - [Tuần tự hóa thành Array](#serializing-to-arrays)
    - [Tuần tự hóa thành JSON](#serializing-to-json)
- [Ẩn Attribute khỏi JSON](#hiding-attributes-from-json)
- [Bổ sung giá trị vào JSON](#appending-values-to-json)
- [Tuần tự hóa Date](#date-serialization)
<a name="introduction"></a>
## Giới thiệu
Khi xây dựng API bằng Laravel, bạn thường cần chuyển model và relationship thành array hoặc JSON. Eloquent cung cấp các phương thức thuận tiện cho những chuyển đổi này, đồng thời cho phép kiểm soát attribute nào được đưa vào biểu diễn đã tuần tự hóa của model.
> [!NOTE]
> Nếu cần cách mạnh mẽ hơn để xử lý việc serialize Eloquent model và collection thành JSON, hãy xem tài liệu [Eloquent API Resources](/docs/{{version}}/eloquent-resources).
<a name="serializing-models-and-collections"></a>
## Tuần tự hóa Model và Collection
<a name="serializing-to-arrays"></a>
### Tuần tự hóa thành Array
Để chuyển một model cùng các [relationship](/docs/{{version}}/eloquent-relationships) đã load thành array, hãy dùng phương thức `toArray`. Phương thức này chạy đệ quy, vì vậy mọi attribute và relation — bao gồm relation của relation — đều được chuyển thành array:
```php
use App\Models\User;

$user = User::with('roles')->first();

return $user->toArray();
```
Phương thức `attributesToArray` có thể dùng để chuyển các attribute của model thành array mà không bao gồm relationship:
```php
$user = User::first();

return $user->attributesToArray();
```
Bạn cũng có thể chuyển toàn bộ [collection](/docs/{{version}}/eloquent-collections) model thành array bằng cách gọi `toArray` trên collection instance:
```php
$users = User::all();

return $users->toArray();
```

<a name="serializing-to-json"></a>
### Tuần tự hóa thành JSON
Để chuyển model thành JSON, hãy dùng phương thức `toJson`. Tương tự `toArray`, `toJson` chạy đệ quy nên toàn bộ attribute và relation sẽ được chuyển sang JSON. Bạn cũng có thể truyền các tùy chọn JSON encoding [được PHP hỗ trợ](https://secure.php.net/manual/en/function.json-encode.php):
```php
use App\Models\User;

$user = User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```
Ngoài ra, bạn có thể cast model hoặc collection thành string; thao tác này sẽ tự động gọi `toJson` trên model hoặc collection:
```php
return (string) User::find(1);
```
Vì model và collection được chuyển thành JSON khi cast sang string, bạn có thể trả Eloquent object trực tiếp từ route hoặc controller. Laravel sẽ tự động serialize Eloquent model và collection thành JSON khi chúng được trả về từ route hoặc controller:
```php
Route::get('/users', function () {
    return User::all();
});
```

<a name="relationships"></a>
#### Relationships
Khi một Eloquent model được chuyển thành JSON, các relationship đã load sẽ tự động được đưa vào dưới dạng attribute của JSON object. Ngoài ra, dù relationship method trong Eloquent được định nghĩa theo dạng "camelCase", tên attribute tương ứng trong JSON sẽ ở dạng "snake_case".
<a name="hiding-attributes-from-json"></a>
## Ẩn Attribute khỏi JSON
Đôi khi bạn cần giới hạn những attribute — chẳng hạn password — được đưa vào biểu diễn array hoặc JSON của model. Để làm vậy, có thể dùng attribute `Hidden` trên model. Những attribute nằm trong `Hidden` sẽ không xuất hiện trong dữ liệu serialize:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

#[Hidden(['password'])]
class User extends Model
{
    // ...
}
```


> [!NOTE]
> Để ẩn relationship, hãy thêm tên method của relationship vào attribute `Hidden` trên Eloquent model.
Ngoài ra, bạn có thể dùng attribute `Visible` để định nghĩa danh sách các attribute được phép xuất hiện trong biểu diễn array và JSON. Mọi attribute không có trong `Visible` sẽ bị ẩn khi model được chuyển thành array hoặc JSON:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Visible;
use Illuminate\Database\Eloquent\Model;

#[Visible(['first_name', 'last_name'])]
class User extends Model
{
    // ...
}
```

<a name="temporarily-modifying-attribute-visibility"></a>
#### Tạm thời thay đổi khả năng hiển thị Attribute
Nếu muốn làm cho một số attribute vốn bị ẩn trở nên hiển thị trên một model instance cụ thể, hãy dùng `makeVisible` hoặc `mergeVisible`. Phương thức `makeVisible` trả về chính model instance:
```php
return $user->makeVisible('attribute')->toArray();

return $user->mergeVisible(['name', 'email'])->toArray();
```
Tương tự, nếu muốn ẩn một số attribute vốn đang hiển thị, bạn có thể dùng `makeHidden` hoặc `mergeHidden`:
```php
return $user->makeHidden('attribute')->toArray();

return $user->mergeHidden(['name', 'email'])->toArray();
```
Nếu muốn tạm thời override toàn bộ danh sách attribute visible hoặc hidden, hãy dùng lần lượt `setVisible` và `setHidden`:
```php
return $user->setVisible(['id', 'name'])->toArray();

return $user->setHidden(['email', 'password', 'remember_token'])->toArray();
```

<a name="appending-values-to-json"></a>
## Bổ sung giá trị vào JSON
Đôi khi khi chuyển model thành array hoặc JSON, bạn muốn bổ sung những attribute không có column tương ứng trong database. Trước tiên, hãy định nghĩa một [accessor](/docs/{{version}}/eloquent-mutators) cho value đó:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Determine if the user is an administrator.
     */
    protected function isAdmin(): Attribute
    {
        return new Attribute(
            get: fn () => 'yes',
        );
    }
}
```
Nếu muốn accessor luôn được thêm vào array và JSON representation của model, hãy dùng attribute `Appends`. Lưu ý rằng tên attribute thường được tham chiếu theo dạng "snake case" sau serialize, dù PHP method của accessor được định nghĩa theo "camel case":
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Model;

#[Appends(['is_admin'])]
class User extends Model
{
    // ...
}
```
Sau khi attribute được thêm vào danh sách `appends`, nó sẽ xuất hiện trong cả biểu diễn array và JSON của model. Các attribute trong `appends` cũng tuân theo thiết lập `visible` và `hidden` trên model.
<a name="appending-at-run-time"></a>
#### Bổ sung tại Runtime
Tại runtime, bạn có thể yêu cầu một model instance thêm các attribute bổ sung bằng `append` hoặc `mergeAppends`. Hoặc dùng `setAppends` để override toàn bộ array property được append cho model instance đó:
```php
return $user->append('is_admin')->toArray();

return $user->mergeAppends(['is_admin', 'status'])->toArray();

return $user->setAppends(['is_admin'])->toArray();
```
Tương tự, nếu muốn loại bỏ toàn bộ property đã append khỏi model, hãy dùng `withoutAppends`:
```php
return $user->withoutAppends()->toArray();
```

<a name="date-serialization"></a>
## Tuần tự hóa Date
<a name="customizing-the-default-date-format"></a>
#### Tùy chỉnh định dạng Date mặc định
Bạn có thể tùy chỉnh định dạng tuần tự hóa mặc định bằng cách ghi đè phương thức `serializeDate`. Phương thức này không ảnh hưởng tới cách date được format khi lưu vào database:
```php
/**
 * Prepare a date for array / JSON serialization.
 */
protected function serializeDate(DateTimeInterface $date): string
{
    return $date->format('Y-m-d');
}
```

<a name="customizing-the-date-format-per-attribute"></a>
#### Tùy chỉnh định dạng Date theo từng Attribute
Bạn có thể tùy chỉnh định dạng tuần tự hóa của từng Eloquent date attribute bằng cách chỉ định định dạng date trong [khai báo cast](/docs/{{version}}/eloquent-mutators#attribute-casting) của model:
```php
protected function casts(): array
{
    return [
        'birthday' => 'date:Y-m-d',
        'joined_at' => 'datetime:Y-m-d H:00',
    ];
}
```

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/eloquent-serialization). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
