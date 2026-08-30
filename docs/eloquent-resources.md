# Eloquent: API Resource

<a name="introduction"></a>
## Giới thiệu

Khi xây dựng API, bạn có thể cần một lớp chuyển đổi nằm giữa các Eloquent model và JSON response thực sự được trả về cho người dùng ứng dụng. Ví dụ, bạn có thể muốn hiển thị một số thuộc tính cho một nhóm người dùng nhưng không hiển thị cho nhóm khác, hoặc luôn đưa một số quan hệ nhất định vào biểu diễn JSON của model. Các resource class của Eloquent cho phép bạn chuyển đổi model và collection của model thành JSON một cách rõ ràng và thuận tiện.

Tất nhiên, bạn luôn có thể chuyển Eloquent model hoặc collection sang JSON bằng phương thức `toJson`; tuy nhiên, Eloquent resource cung cấp khả năng kiểm soát chi tiết và mạnh mẽ hơn đối với quá trình tuần tự hóa model và các quan hệ của chúng thành JSON.

<a name="generating-resources"></a>
## Tạo Resource

Để tạo một resource class, bạn có thể sử dụng lệnh Artisan `make:resource`. Theo mặc định, resource được đặt trong thư mục `app/Http/Resources` của ứng dụng. Resource kế thừa class `Illuminate\Http\Resources\Json\JsonResource`:

```shell
php artisan make:resource UserResource
```

<a name="generating-resource-collections"></a>
#### Resource Collection

Ngoài resource dùng để chuyển đổi từng model riêng lẻ, bạn có thể tạo resource chịu trách nhiệm chuyển đổi cả collection model. Cách này cho phép JSON response chứa các liên kết và metadata khác áp dụng cho toàn bộ collection của resource đó.

Để tạo resource collection, hãy sử dụng tùy chọn `--collection` khi tạo resource. Hoặc, nếu tên resource chứa từ `Collection`, Laravel sẽ hiểu rằng cần tạo một collection resource. Collection resource kế thừa class `Illuminate\Http\Resources\Json\ResourceCollection`:

```shell
php artisan make:resource User --collection

php artisan make:resource UserCollection
```

<a name="concept-overview"></a>
## Tổng quan khái niệm

> [!NOTE]
> Đây là phần tổng quan ở mức cao về resource và resource collection. Bạn nên đọc các phần còn lại của tài liệu này để hiểu sâu hơn về khả năng tùy biến và sức mạnh mà resource cung cấp.

Trước khi đi sâu vào tất cả tùy chọn khi xây dựng resource, trước tiên hãy xem tổng quan cách resource được sử dụng trong Laravel. Một resource class đại diện cho một model cần được chuyển đổi thành cấu trúc JSON. Ví dụ, dưới đây là một resource class `UserResource` đơn giản:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

Mỗi resource class định nghĩa phương thức `toArray`, phương thức này trả về mảng thuộc tính sẽ được chuyển thành JSON khi resource được trả về dưới dạng response từ route hoặc phương thức controller.

Lưu ý rằng chúng ta có thể truy cập trực tiếp các property của model thông qua biến `$this`. Điều này là do resource class tự động chuyển tiếp việc truy cập property và method đến model bên dưới để thuận tiện sử dụng. Sau khi resource được định nghĩa, bạn có thể trả nó về từ route hoặc controller. Resource nhận instance của model bên dưới thông qua constructor:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return new UserResource(User::findOrFail($id));
});
```

Để thuận tiện, bạn có thể sử dụng phương thức `toResource` của model. Phương thức này sử dụng convention của framework để tự động tìm resource tương ứng với model:

```php
return User::findOrFail($id)->toResource();
```

Khi gọi phương thức `toResource`, Laravel sẽ cố gắng tìm resource có tên khớp với tên model, có thể kèm hậu tố `Resource`, trong namespace `Http\Resources` gần nhất với namespace của model.

Nếu resource class không tuân theo convention đặt tên này hoặc nằm trong namespace khác, bạn có thể chỉ định resource mặc định cho model bằng attribute `UseResource`:

```php
<?php

namespace App\Models;

use App\Http\Resources\CustomUserResource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\UseResource;

#[UseResource(CustomUserResource::class)]
class User extends Model
{
    // ...
}
```

Ngoài ra, bạn có thể chỉ định resource class bằng cách truyền nó vào phương thức `toResource`:

```php
return User::findOrFail($id)->toResource(CustomUserResource::class);
```

<a name="resource-collections"></a>
### Resource Collection

Nếu trả về một collection resource hoặc response có phân trang, bạn nên sử dụng phương thức `collection` do resource class cung cấp khi tạo resource instance trong route hoặc controller:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all());
});
```

Hoặc, để thuận tiện, bạn có thể sử dụng phương thức `toResourceCollection` của Eloquent collection. Phương thức này sử dụng convention của framework để tự động tìm resource collection tương ứng với model:

```php
return User::all()->toResourceCollection();
```

Khi gọi phương thức `toResourceCollection`, Laravel sẽ cố gắng tìm resource collection có tên khớp với tên model và có hậu tố `Collection` trong namespace `Http\Resources` gần nhất với namespace của model.

Nếu resource collection class không tuân theo convention đặt tên này hoặc nằm trong namespace khác, bạn có thể chỉ định resource collection mặc định cho model bằng attribute `UseResourceCollection`:

```php
<?php

namespace App\Models;

use App\Http\Resources\CustomUserCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\UseResourceCollection;

#[UseResourceCollection(CustomUserCollection::class)]
class User extends Model
{
    // ...
}
```

Ngoài ra, bạn có thể chỉ định resource collection class bằng cách truyền nó vào phương thức `toResourceCollection`:

```php
return User::all()->toResourceCollection(CustomUserCollection::class);
```

<a name="custom-resource-collections"></a>
#### Resource Collection tùy chỉnh

Theo mặc định, resource collection không cho phép bổ sung metadata tùy chỉnh cần trả về cùng collection. Nếu muốn tùy biến response của resource collection, bạn có thể tạo một resource chuyên biệt để đại diện cho collection:

```shell
php artisan make:resource UserCollection
```

Sau khi resource collection class được tạo, bạn có thể dễ dàng định nghĩa metadata cần được đưa vào response:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

Sau khi định nghĩa resource collection, bạn có thể trả nó về từ route hoặc controller:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

Hoặc, để thuận tiện, bạn có thể sử dụng phương thức `toResourceCollection` của Eloquent collection. Phương thức này sử dụng convention của framework để tự động tìm resource collection tương ứng với model:

```php
return User::all()->toResourceCollection();
```

Khi gọi phương thức `toResourceCollection`, Laravel sẽ cố gắng tìm resource collection có tên khớp với tên model và có hậu tố `Collection` trong namespace `Http\Resources` gần nhất với namespace của model.

<a name="preserving-collection-keys"></a>
#### Preserving Collection Keys

Khi trả về một resource collection từ route, Laravel sẽ đặt lại các key của collection theo thứ tự số. Tuy nhiên, bạn có thể dùng attribute `PreserveKeys` trên resource class để chỉ định có giữ nguyên các key ban đầu của collection hay không:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Attributes\PreserveKeys;
use Illuminate\Http\Resources\Json\JsonResource;

#[PreserveKeys]
class UserResource extends JsonResource
{
    // ...
}
```

Khi property `preserveKeys` được đặt thành `true`, các key của collection sẽ được giữ nguyên khi collection được trả về từ route hoặc controller:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/users', function () {
    return UserResource::collection(User::all()->keyBy->id);
});
```

<a name="customizing-the-underlying-resource-class"></a>
#### Tùy chỉnh Resource Class cơ sở

Thông thường, thuộc tính `$this->collection` của một resource collection sẽ tự động được điền bằng kết quả ánh xạ từng phần tử trong collection sang resource class dạng số ít tương ứng. Resource class dạng số ít được giả định là tên class của collection sau khi bỏ phần `Collection` ở cuối. Ngoài ra, tùy theo quy ước bạn lựa chọn, resource class dạng số ít có thể có hoặc không có hậu tố `Resource`.

Ví dụ, `UserCollection` sẽ cố gắng ánh xạ các instance user được cung cấp sang resource `UserResource`. Để tùy chỉnh hành vi này, bạn có thể sử dụng attribute `Collects` trên resource collection:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Attributes\Collects;
use Illuminate\Http\Resources\Json\ResourceCollection;

#[Collects(Member::class)]
class UserCollection extends ResourceCollection
{
    // ...
}
```

<a name="writing-resources"></a>
## Viết Resource

> [!NOTE]
> Nếu bạn chưa đọc [tổng quan khái niệm](#concept-overview), bạn nên đọc phần đó trước khi tiếp tục tài liệu này.

Resource chỉ cần chuyển đổi một model được cung cấp thành array. Vì vậy, mỗi resource chứa phương thức `toArray` để chuyển các attribute của model thành một array phù hợp với API và có thể được trả về từ route hoặc controller của ứng dụng:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

Sau khi resource được định nghĩa, bạn có thể trả resource đó trực tiếp từ route hoặc controller:

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toUserResource();
});
```

<a name="relationships"></a>
#### Quan hệ

Nếu muốn đưa các resource liên quan vào response, bạn có thể thêm chúng vào array được trả về bởi phương thức `toArray` của resource. Trong ví dụ này, chúng ta sử dụng phương thức `collection` của `PostResource` để thêm các bài viết của user vào resource response:

```php
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;

/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->posts),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

> [!NOTE]
> Nếu chỉ muốn đưa quan hệ vào response khi chúng đã được load, hãy xem phần [quan hệ có điều kiện](#conditional-relationships).

<a name="writing-resource-collections"></a>
#### Resource Collection

Trong khi resource chuyển đổi một model thành array, resource collection chuyển đổi một collection các model thành array. Tuy nhiên, bạn không nhất thiết phải định nghĩa một resource collection class cho từng model vì mọi Eloquent model collection đều cung cấp phương thức `toResourceCollection` để tạo resource collection linh hoạt ngay khi cần:

```php
use App\Models\User;

Route::get('/users', function () {
    return User::all()->toResourceCollection();
});
```

Tuy nhiên, nếu cần tùy chỉnh metadata được trả về cùng collection, bạn cần định nghĩa resource collection riêng:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'links' => [
                'self' => 'link-value',
            ],
        ];
    }
}
```

Tương tự resource đơn, resource collection có thể được trả trực tiếp từ route hoặc controller:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::all());
});
```

Hoặc, để thuận tiện, bạn có thể sử dụng phương thức `toResourceCollection` của Eloquent collection. Phương thức này sử dụng convention của framework để tự động tìm resource collection tương ứng với model:

```php
return User::all()->toResourceCollection();
```

Khi gọi phương thức `toResourceCollection`, Laravel sẽ cố gắng tìm resource collection có tên khớp với tên model và có hậu tố `Collection` trong namespace `Http\Resources` gần nhất với namespace của model.

<a name="data-wrapping"></a>
### Bao bọc dữ liệu

Theo mặc định, resource ngoài cùng sẽ được bao bọc trong key `data` khi resource response được chuyển thành JSON. Ví dụ, một resource collection response điển hình có dạng sau:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ]
}
```

Nếu muốn tắt việc bao bọc resource ngoài cùng, bạn nên gọi phương thức `withoutWrapping` trên class cơ sở `Illuminate\Http\Resources\Json\JsonResource`. Thông thường, phương thức này nên được gọi từ `AppServiceProvider` hoặc một [service provider](/docs/{{version}}/providers) khác được load trong mọi request của ứng dụng:

```php
<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

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
        JsonResource::withoutWrapping();
    }
}
```

> [!WARNING]
> Phương thức `withoutWrapping` chỉ ảnh hưởng đến response ngoài cùng và không xóa các key `data` mà bạn tự thêm vào resource collection.

<a name="wrapping-nested-resources"></a>
#### Bao bọc Resource lồng nhau

Bạn hoàn toàn có thể quyết định cách bao bọc các quan hệ của resource. Nếu muốn mọi resource collection đều được bao bọc trong key `data` bất kể mức lồng nhau, bạn nên định nghĩa resource collection class cho từng resource và trả collection bên trong key `data`.

Bạn có thể thắc mắc liệu điều này có khiến resource ngoài cùng bị bao bọc bởi hai key `data` hay không. Laravel sẽ không để resource vô tình bị bao bọc hai lần, vì vậy bạn không cần lo về mức độ lồng nhau của resource collection đang chuyển đổi:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CommentsCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return ['data' => $this->collection];
    }
}
```

<a name="data-wrapping-and-pagination"></a>
#### Bao bọc dữ liệu and Pagination

Khi trả về collection đã phân trang thông qua resource response, Laravel vẫn bao bọc dữ liệu resource trong key `data` ngay cả khi đã gọi `withoutWrapping`. Nguyên nhân là response phân trang luôn chứa các key `meta` và `links` mô tả trạng thái của paginator:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="pagination"></a>
### Phân trang

Bạn có thể truyền một instance paginator của Laravel vào phương thức `collection` của resource hoặc vào custom resource collection:

```php
use App\Http\Resources\UserCollection;
use App\Models\User;

Route::get('/users', function () {
    return new UserCollection(User::paginate());
});
```

Hoặc để thuận tiện, bạn có thể dùng phương thức `toResourceCollection` của paginator. Phương thức này sử dụng convention của framework để tự động tìm resource collection cơ sở của model đang được phân trang:

```php
return User::paginate()->toResourceCollection();
```

Response phân trang luôn chứa các key `meta` và `links` với thông tin về trạng thái của paginator:

```json
{
    "data": [
        {
            "id": 1,
            "name": "Eladio Schroeder Sr.",
            "email": "therese28@example.com"
        },
        {
            "id": 2,
            "name": "Liliana Mayert",
            "email": "evandervort@example.com"
        }
    ],
    "links":{
        "first": "http://example.com/users?page=1",
        "last": "http://example.com/users?page=1",
        "prev": null,
        "next": null
    },
    "meta":{
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://example.com/users",
        "per_page": 15,
        "to": 10,
        "total": 10
    }
}
```

<a name="customizing-the-pagination-information"></a>
#### Tùy chỉnh thông tin phân trang

Nếu muốn tùy chỉnh thông tin trong các key `links` hoặc `meta` của response phân trang, bạn có thể định nghĩa phương thức `paginationInformation` trên resource. Phương thức này nhận dữ liệu `$paginated` và array thông tin `$default`, trong đó chứa các key `links` và `meta`:

```php
/**
 * Customize the pagination information for the resource.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  array  $paginated
 * @param  array  $default
 * @return array
 */
public function paginationInformation($request, $paginated, $default)
{
    $default['links']['custom'] = 'https://example.com';

    return $default;
}
```

<a name="conditional-attributes"></a>
### Attribute có điều kiện

Đôi khi bạn chỉ muốn đưa một attribute vào resource response khi một điều kiện nhất định được thỏa mãn. Ví dụ, bạn có thể chỉ muốn đưa một giá trị vào khi user hiện tại là "administrator". Laravel cung cấp nhiều helper method cho trường hợp này. Phương thức `when` có thể được dùng để thêm attribute vào resource response theo điều kiện:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'secret' => $this->when($request->user()->isAdmin(), 'secret-value'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

Trong ví dụ này, key `secret` chỉ xuất hiện trong resource response cuối cùng nếu phương thức `isAdmin` của user đã xác thực trả về `true`. Nếu trả về `false`, key `secret` sẽ bị loại khỏi resource response trước khi gửi đến client. Phương thức `when` giúp bạn định nghĩa resource rõ ràng mà không phải tự viết câu lệnh điều kiện khi xây dựng array.

Phương thức `when` cũng chấp nhận closure làm đối số thứ hai, nhờ đó giá trị kết quả chỉ được tính khi điều kiện là `true`:

```php
'secret' => $this->when($request->user()->isAdmin(), function () {
    return 'secret-value';
}),
```

Phương thức `whenHas` có thể được dùng để đưa attribute vào response nếu attribute đó thực sự tồn tại trên model cơ sở:

```php
'name' => $this->whenHas('name'),
```

Ngoài ra, `whenNotNull` có thể được dùng để đưa attribute vào resource response nếu giá trị của attribute không phải `null`:

```php
'name' => $this->whenNotNull($this->name),
```

<a name="merging-conditional-attributes"></a>
#### Gộp các Attribute có điều kiện

Đôi khi nhiều attribute chỉ nên được đưa vào resource response dựa trên cùng một điều kiện. Trong trường hợp này, bạn có thể dùng `mergeWhen` để chỉ thêm các attribute đó khi điều kiện là `true`:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        $this->mergeWhen($request->user()->isAdmin(), [
            'first-secret' => 'value',
            'second-secret' => 'value',
        ]),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

Tương tự, nếu điều kiện là `false`, các attribute này sẽ bị loại khỏi resource response trước khi gửi đến client.

> [!WARNING]
> Không nên sử dụng `mergeWhen` trong array trộn lẫn key dạng chuỗi và key dạng số. Ngoài ra, cũng không nên dùng phương thức này trong array có key dạng số nhưng không được sắp liên tục.

<a name="conditional-relationships"></a>
### Quan hệ có điều kiện

Ngoài việc đưa attribute vào theo điều kiện, bạn có thể đưa các quan hệ vào resource response tùy theo việc quan hệ đó đã được load trên model hay chưa. Nhờ vậy controller có thể quyết định quan hệ nào cần được load, còn resource chỉ đưa chúng vào khi chúng thực sự đã được load. Cách này giúp tránh vấn đề truy vấn "N+1" trong resource.

Phương thức `whenLoaded` có thể được dùng để đưa quan hệ vào theo điều kiện. Để tránh vô tình load quan hệ không cần thiết, phương thức này nhận tên của quan hệ thay vì chính giá trị quan hệ:

```php
use App\Http\Resources\PostResource;

/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts' => PostResource::collection($this->whenLoaded('posts')),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

Trong ví dụ này, nếu quan hệ chưa được load, key `posts` sẽ bị loại khỏi resource response trước khi gửi đến client.

<a name="conditional-relationship-counts"></a>
#### Số lượng quan hệ có điều kiện

Ngoài việc đưa quan hệ vào theo điều kiện, bạn cũng có thể đưa "số lượng" của quan hệ vào resource response tùy theo việc số lượng đó đã được load trên model hay chưa:

```php
new UserResource($user->loadCount('posts'));
```

Phương thức `whenCounted` có thể được dùng để đưa số lượng của quan hệ vào resource response theo điều kiện. Phương thức này tránh thêm attribute không cần thiết khi số lượng quan hệ chưa có trên model:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'posts_count' => $this->whenCounted('posts'),
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

Trong ví dụ này, nếu số lượng của quan hệ `posts` chưa được load, key `posts_count` sẽ bị loại khỏi resource response trước khi gửi đến client.

Các aggregate khác như `avg`, `sum`, `min` và `max` cũng có thể được đưa vào theo điều kiện bằng phương thức `whenAggregated`:

```php
'words_avg' => $this->whenAggregated('posts', 'words', 'avg'),
'words_sum' => $this->whenAggregated('posts', 'words', 'sum'),
'words_min' => $this->whenAggregated('posts', 'words', 'min'),
'words_max' => $this->whenAggregated('posts', 'words', 'max'),
```

<a name="conditional-pivot-information"></a>
#### Thông tin Pivot có điều kiện

Ngoài việc đưa thông tin quan hệ vào resource response theo điều kiện, bạn có thể đưa dữ liệu từ bảng trung gian của quan hệ many-to-many bằng phương thức `whenPivotLoaded`. Đối số đầu tiên của `whenPivotLoaded` là tên pivot table. Đối số thứ hai là closure trả về giá trị cần sử dụng khi thông tin pivot có sẵn trên model:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoaded('role_user', function () {
            return $this->pivot->expires_at;
        }),
    ];
}
```

Nếu quan hệ của bạn sử dụng [model bảng trung gian tùy chỉnh](/docs/{{version}}/eloquent-relationships#defining-custom-intermediate-table-models), bạn có thể truyền một instance của model bảng trung gian làm đối số đầu tiên cho phương thức `whenPivotLoaded`:

```php
'expires_at' => $this->whenPivotLoaded(new Membership, function () {
    return $this->pivot->expires_at;
}),
```

Nếu bảng trung gian sử dụng accessor khác `pivot`, bạn có thể dùng phương thức `whenPivotLoadedAs`:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'expires_at' => $this->whenPivotLoadedAs('subscription', 'role_user', function () {
            return $this->subscription->expires_at;
        }),
    ];
}
```

<a name="adding-meta-data"></a>
### Thêm Metadata

Một số tiêu chuẩn JSON API yêu cầu bổ sung metadata vào response của resource và resource collection. Thông tin này thường bao gồm `links` trỏ đến resource hoặc các resource liên quan, hoặc metadata về chính resource đó. Nếu cần trả về metadata bổ sung cho resource, hãy đưa dữ liệu đó vào phương thức `toArray`. Ví dụ, bạn có thể thêm thông tin `links` khi chuyển đổi một resource collection:

```php
/**
 * Transform the resource into an array.
 *
 * @return array<string, mixed>
 */
public function toArray(Request $request): array
{
    return [
        'data' => $this->collection,
        'links' => [
            'self' => 'link-value',
        ],
    ];
}
```

Khi trả về metadata bổ sung từ resource, bạn không cần lo việc vô tình ghi đè các key `links` hoặc `meta` mà Laravel tự động thêm vào response có phân trang. Mọi `links` bổ sung do bạn định nghĩa sẽ được hợp nhất với các link do paginator cung cấp.

<a name="top-level-meta-data"></a>
#### Metadata cấp cao nhất

Đôi khi bạn chỉ muốn đưa một số metadata vào resource response khi resource đó là resource ngoài cùng được trả về. Thông thường, đây là metadata mô tả toàn bộ response. Để định nghĩa metadata này, hãy thêm phương thức `with` vào resource class. Phương thức này phải trả về một mảng metadata và dữ liệu chỉ được thêm vào resource response khi resource đang được chuyển đổi là resource ngoài cùng:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'key' => 'value',
            ],
        ];
    }
}
```

<a name="adding-meta-data-when-constructing-resources"></a>
#### Thêm Metadata khi khởi tạo Resource

Bạn cũng có thể thêm dữ liệu cấp cao nhất khi khởi tạo resource instance trong route hoặc controller. Phương thức `additional`, có trên tất cả resource, nhận một mảng dữ liệu cần được thêm vào resource response:

```php
return User::all()
    ->load('roles')
    ->toResourceCollection()
    ->additional(['meta' => [
        'key' => 'value',
    ]]);
```

<a name="jsonapi-resources"></a>
## JSON:API Resource

Laravel cung cấp `JsonApiResource`, một resource class tạo response tuân thủ [đặc tả JSON:API](https://jsonapi.org/). Class này kế thừa `JsonResource` tiêu chuẩn và tự động xử lý cấu trúc resource object, relationship, sparse fieldset, include, việc đánh giá attribute theo cơ chế lazy, đồng thời đặt header `Content-Type` thành `application/vnd.api+json`.

> [!NOTE]
> JSON:API resource của Laravel đảm nhiệm việc serialize response. Nếu bạn cũng cần phân tích các query parameter JSON:API gửi đến, chẳng hạn filter và sort, [Laravel Query Builder của Spatie](https://spatie.be/docs/laravel-query-builder) là một package bổ trợ phù hợp.

<a name="generating-jsonapi-resources"></a>
### Tạo JSON:API Resource

Để tạo JSON:API resource, hãy dùng lệnh Artisan `make:resource` với flag `--json-api`:

```shell
php artisan make:resource PostResource --json-api
```

Class được tạo sẽ kế thừa `Illuminate\Http\Resources\JsonApi\JsonApiResource` và có sẵn các property `$attributes` và `$relationships` để bạn định nghĩa:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class PostResource extends JsonApiResource
{
    /**
     * The resource's attributes.
     */
    public $attributes = [
        // ...
    ];

    /**
     * The resource's relationships.
     */
    public $relationships = [
        // ...
    ];
}
```

JSON:API resource có thể được trả về từ route và controller giống như resource tiêu chuẩn:

```php
use App\Http\Resources\PostResource;
use App\Models\Post;

Route::get('/api/posts/{post}', function (Post $post) {
    return new PostResource($post);
});
```

Hoặc, để thuận tiện, bạn có thể dùng phương thức `toResource` của model:

```php
Route::get('/api/posts/{post}', function (Post $post) {
    return $post->toResource();
});
```

Cách này sẽ tạo response tuân thủ JSON:API:

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World",
            "body": "This is my first post."
        }
    }
}
```

Để trả về một collection JSON:API resource, hãy dùng phương thức `collection` hoặc phương thức tiện ích `toResourceCollection`:

```php
return PostResource::collection(Post::all());

return Post::all()->toResourceCollection();
```

<a name="defining-jsonapi-attributes"></a>
### Định nghĩa Attribute

Có hai cách để định nghĩa những attribute nào được đưa vào JSON:API resource.

Cách đơn giản nhất là định nghĩa property `$attributes` trên resource. Bạn có thể liệt kê tên các attribute dưới dạng value; Laravel sẽ đọc trực tiếp chúng từ model bên dưới:

```php
public $attributes = [
    'title',
    'body',
    'created_at',
];
```

Nếu một attribute tốn nhiều tài nguyên để tính toán, bạn có thể trả về attribute đó từ `toAttributes` dưới dạng closure để nó chỉ được đánh giá khi thực sự cần xuất hiện trong response.

Hoặc, nếu cần toàn quyền kiểm soát các attribute của resource, bạn có thể ghi đè phương thức `toAttributes` trên resource:

```php
/**
 * Get the resource's attributes.
 *
 * @return array<string, mixed>
 */
public function toAttributes(Request $request): array
{
    return [
        'title' => $this->title,
        'body' => $this->body,
        'is_published' => fn () => $this->published_at !== null,
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
    ];
}
```

<a name="defining-jsonapi-relationships"></a>
### Định nghĩa Relationship

JSON:API resource hỗ trợ định nghĩa relationship theo đặc tả JSON:API. Relationship chỉ được serialize khi client yêu cầu thông qua query parameter `include`.

#### Property `$relationships`

Bạn có thể định nghĩa các relationship được phép include thông qua property `$relationships` trên resource:

```php
public $relationships = [
    'author',
    'comments',
];
```

Khi liệt kê tên relationship dưới dạng value, Laravel sẽ resolve Eloquent relationship tương ứng và tự động tìm resource class phù hợp. Nếu cần chỉ định resource class một cách tường minh, bạn có thể định nghĩa relationship dưới dạng cặp key / class:

```php
use App\Http\Resources\UserResource;

public $relationships = [
    'author' => UserResource::class,
    'comments',
];
```

Ngoài ra, bạn có thể ghi đè phương thức `toRelationships` trên resource:

```php
/**
 * Get the resource's relationships.
 */
public function toRelationships(Request $request): array
{
    return [
        'author' => UserResource::class,
        'comments' => fn () => CommentResource::collection(
            $request->user()->is($this->resource)
                ? $this->comments
                : $this->comments->where('is_public', true),
        ),
    ];
}
```

Sử dụng closure giúp bạn kiểm soát relationship payload chi tiết hơn, trong khi relationship vẫn chỉ được resolve khi client yêu cầu.

#### Include Relationship

Client có thể yêu cầu các resource liên quan bằng query parameter `include`:

```
GET /api/posts/1?include=author,comments
```

Response tạo ra sẽ chứa các resource identifier object trong key `relationships` và các resource object đầy đủ trong mảng `included` ở cấp cao nhất:

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World"
        },
        "relationships": {
            "author": {
                "data": {
                    "id": "1",
                    "type": "users"
                }
            },
            "comments": {
                "data": [
                    {
                        "id": "1",
                        "type": "comments"
                    }
                ]
            }
        }
    },
    "included": [
        {
            "id": "1",
            "type": "users",
            "attributes": {
                "name": "Taylor Otwell"
            }
        },
        {
            "id": "1",
            "type": "comments",
            "attributes": {
                "body": "Great post!"
            }
        }
    ]
}
```

Có thể include relationship lồng nhau bằng dot notation:

```
GET /api/posts/1?include=comments.author
```

<a name="jsonapi-relationship-depth"></a>
#### Độ sâu Relationship

Theo mặc định, việc include relationship lồng nhau bị giới hạn ở một độ sâu tối đa. Bạn có thể tùy chỉnh giới hạn này bằng phương thức `maxRelationshipDepth`, thường trong một service provider của ứng dụng:

```php
use Illuminate\Http\Resources\JsonApi\JsonApiResource;

JsonApiResource::maxRelationshipDepth(3);
```

<a name="jsonapi-resource-type-and-id"></a>
### Resource Type và ID

Theo mặc định, `type` của resource được suy ra từ tên resource class. Ví dụ, `PostResource` tạo type `posts`, còn `BlogPostResource` tạo `blog-posts`. `id` của resource được resolve từ primary key của model.

Nếu cần tùy chỉnh các giá trị này, bạn có thể ghi đè các phương thức `toType` và `toId` trên resource:

```php
/**
 * Get the resource's type.
 */
public function toType(Request $request): string
{
    return 'articles';
}

/**
 * Get the resource's ID.
 */
public function toId(Request $request): string
{
    return (string) $this->uuid;
}
```

Điều này đặc biệt hữu ích khi type của resource cần khác với tên class, chẳng hạn `AuthorResource` bao bọc model `User` nhưng cần xuất type `authors`.

<a name="jsonapi-sparse-fieldsets-and-includes"></a>
### Sparse Fieldset và Include

JSON:API resource hỗ trợ [sparse fieldset](https://jsonapi.org/format/#fetching-sparse-fieldsets), cho phép client chỉ yêu cầu những attribute cụ thể cho từng resource type thông qua query parameter `fields`:

```
GET /api/posts?fields[posts]=title,created_at&fields[users]=name
```

Yêu cầu này chỉ đưa các attribute `title` và `created_at` vào resource `posts`, đồng thời chỉ đưa attribute `name` vào resource `users`.

<a name="jsonapi-ignoring-query-string"></a>
#### Bỏ qua Query String

Nếu muốn tắt việc lọc sparse fieldset cho một resource response cụ thể, bạn có thể gọi phương thức `ignoreFieldsAndIncludesInQueryString`:

```php
return $post->toResource()
    ->ignoreFieldsAndIncludesInQueryString();
```

<a name="jsonapi-including-previously-loaded-relationships"></a>
#### Include các Relationship đã được load trước đó

Theo mặc định, relationship chỉ được đưa vào response khi được yêu cầu qua query parameter `include`. Nếu muốn include tất cả relationship đã eager load trước đó bất kể query string, bạn có thể gọi phương thức `includePreviouslyLoadedRelationships`:

```php
return $post->load('author', 'comments')
    ->toResource()
    ->includePreviouslyLoadedRelationships();
```

<a name="jsonapi-links-and-meta"></a>
### Link và Metadata

Bạn có thể thêm link và metadata vào JSON:API resource object bằng cách ghi đè các phương thức `toLinks` và `toMeta` trên resource:

```php
/**
 * Get the resource's links.
 */
public function toLinks(Request $request): array
{
    return [
        'self' => route('api.posts.show', $this->resource),
    ];
}

/**
 * Get the resource's meta information.
 */
public function toMeta(Request $request): array
{
    return [
        'readable_created_at' => $this->created_at->diffForHumans(),
    ];
}
```

Cách này sẽ thêm các key `links` và `meta` vào resource object trong response:

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World"
        },
        "links": {
            "self": "https://example.com/api/posts/1"
        },
        "meta": {
            "readable_created_at": "2 hours ago"
        }
    }
}
```

<a name="resource-responses"></a>
## Resource Response

Như đã trình bày, resource có thể được trả về trực tiếp từ route và controller:

```php
use App\Models\User;

Route::get('/user/{id}', function (string $id) {
    return User::findOrFail($id)->toResource();
});
```

Tuy nhiên, đôi khi bạn cần tùy chỉnh HTTP response trước khi gửi đến client. Có hai cách để thực hiện. Cách thứ nhất là gọi nối tiếp phương thức `response` trên resource. Phương thức này trả về một instance `Illuminate\Http\JsonResponse`, cho phép bạn kiểm soát hoàn toàn các header của response:

```php
use App\Http\Resources\UserResource;
use App\Models\User;

Route::get('/user', function () {
    return User::find(1)
        ->toResource()
        ->response()
        ->header('X-Value', 'True');
});
```

Ngoài ra, bạn có thể định nghĩa phương thức `withResponse` ngay trong resource. Phương thức này sẽ được gọi khi resource được trả về với vai trò resource ngoài cùng của response:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, JsonResponse $response): void
    {
        $response->header('X-Value', 'True');
    }
}
```
