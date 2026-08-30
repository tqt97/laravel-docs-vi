# Eloquent: Quan hệ

<a name="introduction"></a>
## Giới thiệu

Các bảng trong cơ sở dữ liệu thường có quan hệ với nhau. Ví dụ, một bài viết blog có thể có nhiều bình luận, hoặc một đơn hàng có thể liên quan đến người dùng đã đặt đơn hàng đó. Eloquent giúp việc quản lý và làm việc với các quan hệ này trở nên dễ dàng, đồng thời hỗ trợ nhiều kiểu quan hệ phổ biến:

<div class="content-list" markdown="1">

- [Một-một](#one-to-one)
- [Một-nhiều](#one-to-many)
- [Nhiều-nhiều](#many-to-many)
- [Một qua trung gian](#has-one-through)
- [Nhiều qua trung gian](#has-many-through)
- [Một-một (đa hình)](#one-to-one-polymorphic-relations)
- [Một-nhiều (đa hình)](#one-to-many-polymorphic-relations)
- [Nhiều-nhiều (đa hình)](#many-to-many-polymorphic-relations)

</div>

<a name="defining-relationships"></a>
## Định nghĩa quan hệ

Các quan hệ Eloquent được định nghĩa dưới dạng phương thức trên các lớp model Eloquent. Vì quan hệ cũng hoạt động như những [query builder](/docs/{{version}}/queries) mạnh mẽ, việc định nghĩa quan hệ dưới dạng phương thức mang lại khả năng nối chuỗi phương thức và truy vấn linh hoạt. Ví dụ, ta có thể nối thêm các điều kiện truy vấn vào quan hệ `posts` này:

```php
$user->posts()->where('active', 1)->get();
```

Tuy nhiên, trước khi đi sâu vào cách sử dụng quan hệ, hãy tìm hiểu cách định nghĩa từng kiểu quan hệ mà Eloquent hỗ trợ.

<a name="one-to-one"></a>
### Một-một / Has One

Quan hệ một-một là một kiểu quan hệ cơ sở dữ liệu rất cơ bản. Ví dụ, một model `User` có thể được liên kết với một model `Phone`. Để định nghĩa quan hệ này, ta sẽ thêm phương thức `phone` vào model `User`. Phương thức `phone` cần gọi phương thức `hasOne` và trả về kết quả của nó. Phương thức `hasOne` có sẵn trên model thông qua lớp cơ sở `Illuminate\Database\Eloquent\Model`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    /**
     * Get the phone associated with the user.
     */
    public function phone(): HasOne
    {
        return $this->hasOne(Phone::class);
    }
}
```

Đối số đầu tiên truyền vào phương thức `hasOne` là tên lớp của model liên quan. Sau khi quan hệ được định nghĩa, ta có thể truy xuất bản ghi liên quan bằng thuộc tính động của Eloquent. Thuộc tính động cho phép truy cập các phương thức quan hệ như thể chúng là các thuộc tính được định nghĩa trên model:

```php
$phone = User::find(1)->phone;
```

Eloquent xác định khóa ngoại của quan hệ dựa trên tên model cha. Trong trường hợp này, model `Phone` được mặc định là có khóa ngoại `user_id`. Nếu muốn ghi đè quy ước này, bạn có thể truyền đối số thứ hai vào phương thức `hasOne`:

```php
return $this->hasOne(Phone::class, 'foreign_key');
```

Ngoài ra, Eloquent giả định giá trị của khóa ngoại phải khớp với cột khóa chính của model cha. Nói cách khác, Eloquent sẽ tìm giá trị của cột `id` của người dùng trong cột `user_id` của bản ghi `Phone`. Nếu muốn quan hệ sử dụng một giá trị khóa cục bộ khác `id` hoặc khác khóa chính của model, bạn có thể truyền đối số thứ ba vào phương thức `hasOne`:

```php
return $this->hasOne(Phone::class, 'foreign_key', 'local_key');
```

<a name="one-to-one-defining-the-inverse-of-the-relationship"></a>
#### Định nghĩa quan hệ nghịch đảo

Như vậy, ta có thể truy cập model `Phone` từ model `User`. Tiếp theo, hãy định nghĩa một quan hệ trên model `Phone` để có thể truy cập người dùng sở hữu điện thoại. Ta có thể định nghĩa quan hệ nghịch đảo của `hasOne` bằng phương thức `belongsTo`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Phone extends Model
{
    /**
     * Get the user that owns the phone.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

Khi gọi phương thức `user`, Eloquent sẽ tìm một model `User` có `id` khớp với cột `user_id` trên model `Phone`.

Eloquent xác định tên khóa ngoại bằng cách lấy tên phương thức quan hệ và thêm hậu tố `_id`. Vì vậy, trong trường hợp này Eloquent giả định model `Phone` có cột `user_id`. Tuy nhiên, nếu khóa ngoại trên model `Phone` không phải `user_id`, bạn có thể truyền tên khóa tùy chỉnh làm đối số thứ hai cho phương thức `belongsTo`:

```php
/**
 * Get the user that owns the phone.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key');
}
```

Nếu model cha không sử dụng `id` làm khóa chính, hoặc bạn muốn tìm model liên kết bằng một cột khác, có thể truyền đối số thứ ba vào `belongsTo` để chỉ định khóa tùy chỉnh của bảng cha:

```php
/**
 * Get the user that owns the phone.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'foreign_key', 'owner_key');
}
```

<a name="one-to-many"></a>
### Một-nhiều / Has Many

Quan hệ một-nhiều được dùng khi một model đóng vai trò cha của một hoặc nhiều model con. Ví dụ, một bài viết blog có thể có rất nhiều bình luận. Giống các quan hệ Eloquent khác, quan hệ một-nhiều được định nghĩa bằng một phương thức trên model Eloquent:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * Get the comments for the blog post.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

Eloquent sẽ tự động xác định cột khóa ngoại phù hợp cho model `Comment`. Theo quy ước, Eloquent lấy tên model cha ở dạng "snake case" rồi thêm hậu tố `_id`. Vì vậy, trong ví dụ này Eloquent giả định cột khóa ngoại trên model `Comment` là `post_id`.

Sau khi phương thức quan hệ được định nghĩa, ta có thể truy cập [collection](/docs/{{version}}/eloquent-collections) các bình luận liên quan thông qua thuộc tính `comments`. Vì Eloquent cung cấp "thuộc tính quan hệ động", ta có thể truy cập phương thức quan hệ như thể đó là thuộc tính được định nghĩa trên model:

```php
use App\Models\Post;

$comments = Post::find(1)->comments;

foreach ($comments as $comment) {
    // ...
}
```

Vì mọi quan hệ cũng hoạt động như query builder, bạn có thể bổ sung điều kiện cho truy vấn quan hệ bằng cách gọi phương thức `comments` rồi tiếp tục nối chuỗi các điều kiện vào truy vấn:

```php
$comment = Post::find(1)->comments()
    ->where('title', 'foo')
    ->first();
```

Tương tự `hasOne`, bạn cũng có thể ghi đè khóa ngoại và khóa cục bộ bằng cách truyền thêm đối số vào phương thức `hasMany`:

```php
return $this->hasMany(Comment::class, 'foreign_key');

return $this->hasMany(Comment::class, 'foreign_key', 'local_key');
```

<a name="automatically-hydrating-parent-models-on-children"></a>
#### Tự động hydrate model cha vào model con

Ngay cả khi sử dụng eager loading của Eloquent, vấn đề truy vấn "N + 1" vẫn có thể xảy ra nếu bạn truy cập model cha từ model con trong lúc lặp qua các model con:

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->post->title;
    }
}
```

Trong ví dụ trên, vấn đề truy vấn "N + 1" xuất hiện vì dù các comment đã được eager load cho mọi model `Post`, Eloquent không tự động hydrate model cha `Post` vào từng model con `Comment`.

Nếu muốn Eloquent tự động hydrate model cha vào các model con, bạn có thể gọi phương thức `chaperone` khi định nghĩa quan hệ `hasMany`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    /**
     * Get the comments for the blog post.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->chaperone();
    }
}
```

Hoặc, nếu muốn chủ động bật cơ chế tự động hydrate model cha tại thời điểm chạy, bạn có thể gọi `chaperone` khi eager load quan hệ:

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-to-many-inverse"></a>
### One to Many (Nghịch đảo) / Belongs To

Bây giờ chúng ta đã có thể truy cập tất cả comment của một post, hãy định nghĩa quan hệ để một comment có thể truy cập post cha của nó. Để định nghĩa quan hệ nghịch đảo của `hasMany`, hãy tạo một relationship method trên model con và gọi phương thức `belongsTo`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    /**
     * Get the post that owns the comment.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

Sau khi định nghĩa quan hệ, chúng ta có thể lấy post cha của comment bằng cách truy cập "dynamic relationship property" `post`:

```php
use App\Models\Comment;

$comment = Comment::find(1);

return $comment->post->title;
```

Trong ví dụ trên, Eloquent sẽ tìm một model `Post` có `id` khớp với cột `post_id` trên model `Comment`.

Eloquent xác định tên foreign key mặc định dựa trên tên relationship method, sau đó nối `_` và tên cột primary key của model cha. Vì vậy, trong ví dụ này, Eloquent giả định foreign key của model `Post` trên bảng `comments` là `post_id`.

Tuy nhiên, nếu foreign key của quan hệ không tuân theo quy ước này, bạn có thể truyền tên foreign key tùy chỉnh làm đối số thứ hai của `belongsTo`:

```php
/**
 * Get the post that owns the comment.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key');
}
```

Nếu model cha không dùng `id` làm primary key, hoặc bạn muốn tìm model liên kết bằng một cột khác, hãy truyền đối số thứ ba cho `belongsTo` để chỉ định key tùy chỉnh trên bảng cha:

```php
/**
 * Get the post that owns the comment.
 */
public function post(): BelongsTo
{
    return $this->belongsTo(Post::class, 'foreign_key', 'owner_key');
}
```

<a name="default-models"></a>
#### Model mặc định

Các quan hệ `belongsTo`, `hasOne`, `hasOneThrough` và `morphOne` cho phép bạn định nghĩa một model mặc định được trả về khi quan hệ là `null`. Mẫu này thường được gọi là [Null Object pattern](https://en.wikipedia.org/wiki/Null_Object_pattern) và giúp loại bỏ các kiểm tra điều kiện trong code. Trong ví dụ sau, quan hệ `user` sẽ trả về một model `App\Models\User` rỗng nếu không có user nào được gắn với model `Post`:

```php
/**
 * Get the author of the post.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault();
}
```

Để gán các attribute cho model mặc định, bạn có thể truyền một array hoặc closure vào `withDefault`:

```php
/**
 * Get the author of the post.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault([
        'name' => 'Guest Author',
    ]);
}

/**
 * Get the author of the post.
 */
public function user(): BelongsTo
{
    return $this->belongsTo(User::class)->withDefault(function (User $user, Post $post) {
        $user->name = 'Guest Author';
    });
}
```

<a name="querying-belongs-to-relationships"></a>
#### Truy vấn quan hệ Belongs To

Khi truy vấn các model con của quan hệ "belongs to", bạn có thể tự xây dựng mệnh đề `where` để lấy các Eloquent model tương ứng:

```php
use App\Models\Post;

$posts = Post::where('user_id', $user->id)->get();
```

Tuy nhiên, sử dụng `whereBelongsTo` thường thuận tiện hơn vì phương thức này tự động xác định quan hệ và foreign key phù hợp cho model được cung cấp:

```php
$posts = Post::whereBelongsTo($user)->get();
```

Bạn cũng có thể truyền một instance [collection](/docs/{{version}}/eloquent-collections) vào `whereBelongsTo`. Khi đó, Laravel sẽ lấy các model thuộc về bất kỳ model cha nào trong collection:

```php
$users = User::where('vip', true)->get();

$posts = Post::whereBelongsTo($users)->get();
```

Mặc định, Laravel xác định quan hệ liên kết với model dựa trên tên class của model. Tuy nhiên, bạn có thể chỉ định tên quan hệ thủ công bằng đối số thứ hai của `whereBelongsTo`:

```php
$posts = Post::whereBelongsTo($user, 'author')->get();
```

<a name="has-one-of-many"></a>
### Một trong nhiều

Đôi khi một model có nhiều model liên quan nhưng bạn muốn dễ dàng lấy model "mới nhất" hoặc "cũ nhất" trong quan hệ. Ví dụ, một `User` có thể liên kết với nhiều `Order`, nhưng bạn muốn có cách thuận tiện để làm việc với đơn hàng gần nhất của user. Bạn có thể thực hiện điều này bằng quan hệ `hasOne` kết hợp với các phương thức `ofMany`:

```php
/**
 * Get the user's most recent order.
 */
public function latestOrder(): HasOne
{
    return $this->hasOne(Order::class)->latestOfMany();
}
```

Tương tự, bạn có thể định nghĩa phương thức để lấy model liên quan "cũ nhất", hay model đầu tiên của quan hệ:

```php
/**
 * Get the user's oldest order.
 */
public function oldestOrder(): HasOne
{
    return $this->hasOne(Order::class)->oldestOfMany();
}
```

Mặc định, `latestOfMany` và `oldestOfMany` lấy model liên quan mới nhất hoặc cũ nhất dựa trên primary key của model; key này phải có khả năng sắp xếp. Tuy nhiên, đôi khi bạn muốn lấy một model duy nhất từ một quan hệ lớn hơn bằng tiêu chí sắp xếp khác.

Ví dụ, với `ofMany`, bạn có thể lấy đơn hàng có giá trị lớn nhất của user. `ofMany` nhận cột có thể sắp xếp làm đối số thứ nhất và hàm aggregate (`min` hoặc `max`) cần áp dụng khi truy vấn model liên quan làm đối số thứ hai:

```php
/**
 * Get the user's largest order.
 */
public function largestOrder(): HasOne
{
    return $this->hasOne(Order::class)->ofMany('price', 'max');
}
```

> [!WARNING]
> Vì PostgreSQL không hỗ trợ thực thi hàm `MAX` trên cột UUID, hiện tại không thể sử dụng quan hệ one-of-many kết hợp với cột UUID của PostgreSQL.

<a name="converting-many-relationships-to-has-one-relationships"></a>
#### Chuyển quan hệ "Many" thành quan hệ Has One

Thông thường, khi lấy một model duy nhất bằng `latestOfMany`, `oldestOfMany` hoặc `ofMany`, bạn đã có sẵn quan hệ "has many" cho cùng model. Laravel cho phép chuyển quan hệ này thành "has one" một cách thuận tiện bằng cách gọi `one` trên quan hệ:

```php
/**
 * Get the user's orders.
 */
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}

/**
 * Get the user's largest order.
 */
public function largestOrder(): HasOne
{
    return $this->orders()->one()->ofMany('price', 'max');
}
```

Bạn cũng có thể dùng `one` để chuyển quan hệ `HasManyThrough` thành `HasOneThrough`:

```php
public function latestDeployment(): HasOneThrough
{
    return $this->deployments()->one()->latestOfMany();
}
```

<a name="advanced-has-one-of-many-relationships"></a>
#### Quan hệ Has One of Many nâng cao

Bạn có thể xây dựng các quan hệ "has one of many" nâng cao hơn. Ví dụ, một model `Product` có thể có nhiều model `Price` liên kết và các mức giá cũ vẫn được giữ lại trong hệ thống sau khi giá mới được công bố. Ngoài ra, dữ liệu giá mới có thể được công bố trước để có hiệu lực vào một thời điểm trong tương lai thông qua cột `published_at`.

Tóm lại, chúng ta cần lấy mức giá đã công bố mới nhất mà ngày công bố không nằm trong tương lai. Nếu hai mức giá có cùng ngày công bố, mức giá có ID lớn hơn sẽ được ưu tiên. Để làm điều này, hãy truyền vào `ofMany` một array chứa các cột có thể sắp xếp dùng để xác định mức giá mới nhất. Đồng thời, truyền một closure làm đối số thứ hai để bổ sung ràng buộc về ngày công bố cho truy vấn quan hệ:

```php
/**
 * Get the current pricing for the product.
 */
public function currentPricing(): HasOne
{
    return $this->hasOne(Price::class)->ofMany([
        'published_at' => 'max',
        'id' => 'max',
    ], function (Builder $query) {
        $query->where('published_at', '<', now());
    });
}
```

<a name="has-one-through"></a>
### Một qua trung gian

Quan hệ "has-one-through" định nghĩa quan hệ one-to-one với một model khác. Điểm khác biệt là model khai báo quan hệ sẽ được liên kết với một instance của model đích bằng cách đi _thông qua_ model thứ ba.

Ví dụ, trong ứng dụng quản lý xưởng sửa xe, mỗi model `Mechanic` có thể liên kết với một model `Car`, và mỗi model `Car` có thể liên kết với một model `Owner`. Dù mechanic và owner không có quan hệ trực tiếp trong database, mechanic vẫn có thể truy cập owner _thông qua_ model `Car`. Hãy xem các table cần thiết để định nghĩa relationship này:

```text
mechanics
    id - integer
    name - string

cars
    id - integer
    model - string
    mechanic_id - integer

owners
    id - integer
    name - string
    car_id - integer
```

Sau khi đã xem cấu trúc table của relationship, hãy định nghĩa relationship trên model `Mechanic`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Mechanic extends Model
{
    /**
     * Get the car's owner.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(Owner::class, Car::class);
    }
}
```

Argument đầu tiên truyền cho method `hasOneThrough` là tên model cuối cùng mà chúng ta muốn truy cập, còn argument thứ hai là tên model trung gian.

Hoặc, nếu các relationship liên quan đã được định nghĩa trên tất cả model tham gia, bạn có thể định nghĩa relationship "has-one-through" theo fluent API bằng cách gọi method `through` và truyền tên các relationship đó. Ví dụ, nếu model `Mechanic` có relationship `cars` và model `Car` có relationship `owner`, bạn có thể định nghĩa relationship "has-one-through" nối mechanic với owner như sau:

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

<a name="has-one-through-key-conventions"></a>
#### Quy ước key

Khi thực hiện query cho relationship, Eloquent sẽ dùng convention foreign key thông thường. Nếu muốn tùy biến các key của relationship, bạn có thể truyền chúng làm argument thứ ba và thứ tư cho method `hasOneThrough`. Argument thứ ba là tên foreign key trên model trung gian. Argument thứ tư là tên foreign key trên model cuối cùng. Argument thứ năm là local key, còn argument thứ sáu là local key của model trung gian:

```php
class Mechanic extends Model
{
    /**
     * Get the car's owner.
     */
    public function carOwner(): HasOneThrough
    {
        return $this->hasOneThrough(
            Owner::class,
            Car::class,
            'mechanic_id', // Foreign key on the cars table...
            'car_id', // Foreign key on the owners table...
            'id', // Local key on the mechanics table...
            'id' // Local key on the cars table...
        );
    }
}
```

Hoặc, như đã trình bày ở trên, nếu các relationship liên quan đã được định nghĩa trên tất cả model tham gia, bạn có thể định nghĩa relationship "has-one-through" theo fluent API bằng cách gọi method `through` và truyền tên các relationship đó. Cách này có ưu điểm là tái sử dụng convention key đã được định nghĩa trên các relationship hiện có:

```php
// String based syntax...
return $this->through('cars')->has('owner');

// Dynamic syntax...
return $this->throughCars()->hasOwner();
```

<a name="has-many-through"></a>
### Nhiều qua trung gian

Relationship "has-many-through" cung cấp cách thuận tiện để truy cập các relation ở xa thông qua một relation trung gian. Ví dụ, giả sử chúng ta đang xây một deployment platform như [Laravel Cloud](https://cloud.laravel.com). Model `Application` có thể truy cập nhiều model `Deployment` thông qua model trung gian `Environment`. Với ví dụ này, bạn có thể dễ dàng lấy toàn bộ deployment của một application. Hãy xem các table cần thiết để định nghĩa relationship này:

```text
applications
    id - integer
    name - string

environments
    id - integer
    application_id - integer
    name - string

deployments
    id - integer
    environment_id - integer
    commit_hash - string
```

Sau khi đã xem cấu trúc table của relationship, hãy định nghĩa relationship trên model `Application`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Application extends Model
{
    /**
     * Get all of the deployments for the application.
     */
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(Deployment::class, Environment::class);
    }
}
```

Argument đầu tiên truyền cho method `hasManyThrough` là tên model cuối cùng mà chúng ta muốn truy cập, còn argument thứ hai là tên model trung gian.

Hoặc, nếu các relationship liên quan đã được định nghĩa trên tất cả model tham gia, bạn có thể định nghĩa relationship "has-many-through" theo fluent API bằng cách gọi method `through` và truyền tên các relationship đó. Ví dụ, nếu model `Application` có relationship `environments` và model `Environment` có relationship `deployments`, bạn có thể định nghĩa relationship "has-many-through" nối application với các deployment như sau:

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

Dù table của model `Deployment` không có column `application_id`, relation `hasManyThrough` vẫn cho phép truy cập các deployment của application thông qua `$application->deployments`. Để lấy các model này, Eloquent kiểm tra column `application_id` trên table của model trung gian `Environment`. Sau khi tìm được các environment ID liên quan, Eloquent dùng chúng để query table của model `Deployment`.

<a name="has-many-through-key-conventions"></a>
#### Quy ước key

Khi thực hiện query cho relationship, Eloquent sẽ dùng convention foreign key thông thường. Nếu muốn tùy biến các key của relationship, bạn có thể truyền chúng làm argument thứ ba và thứ tư cho method `hasManyThrough`. Argument thứ ba là tên foreign key trên model trung gian. Argument thứ tư là tên foreign key trên model cuối cùng. Argument thứ năm là local key, còn argument thứ sáu là local key của model trung gian:

```php
class Application extends Model
{
    public function deployments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Deployment::class,
            Environment::class,
            'application_id', // Foreign key on the environments table...
            'environment_id', // Foreign key on the deployments table...
            'id', // Local key on the applications table...
            'id' // Local key on the environments table...
        );
    }
}
```

Hoặc, như đã trình bày ở trên, nếu các relationship liên quan đã được định nghĩa trên tất cả model tham gia, bạn có thể định nghĩa relationship "has-many-through" theo fluent API bằng cách gọi method `through` và truyền tên các relationship đó. Cách này có ưu điểm là tái sử dụng convention key đã được định nghĩa trên các relationship hiện có:

```php
// String based syntax...
return $this->through('environments')->has('deployments');

// Dynamic syntax...
return $this->throughEnvironments()->hasDeployments();
```

<a name="scoped-relationships"></a>
### Quan hệ có phạm vi

Việc thêm các phương thức vào model để áp dụng ràng buộc cho quan hệ là rất phổ biến. Ví dụ, bạn có thể thêm `featuredPosts` vào model `User` để giới hạn quan hệ `posts` bằng một điều kiện `where` bổ sung:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * Get the user's posts.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class)->latest();
    }

    /**
     * Get the user's featured posts.
     */
    public function featuredPosts(): HasMany
    {
        return $this->posts()->where('featured', true);
    }
}
```

Tuy nhiên, nếu tạo model thông qua `featuredPosts`, attribute `featured` sẽ không tự động được đặt thành `true`. Nếu muốn tạo model qua relationship method đồng thời chỉ định các attribute phải được thêm vào mọi model được tạo qua quan hệ đó, bạn có thể dùng `withAttributes` khi xây dựng relationship query:

```php
/**
 * Get the user's featured posts.
 */
public function featuredPosts(): HasMany
{
    return $this->posts()->withAttributes(['featured' => true]);
}
```

`withAttributes` sẽ thêm các điều kiện `where` vào query dựa trên các attribute được cung cấp, đồng thời thêm các attribute đó vào mọi model được tạo thông qua relationship method:

```php
$post = $user->featuredPosts()->create(['title' => 'Featured Post']);

$post->featured; // true
```

Để yêu cầu `withAttributes` không thêm điều kiện `where` vào query, hãy đặt đối số `asConditions` thành `false`:

```php
return $this->posts()->withAttributes(['featured' => true], asConditions: false);
```

<a name="many-to-many"></a>
## Quan hệ Many to Many

Quan hệ many-to-many phức tạp hơn một chút so với `hasOne` và `hasMany`. Một ví dụ là user có nhiều role và các role đó cũng được dùng chung bởi những user khác trong ứng dụng. Chẳng hạn, một user có thể được gán role "Author" và "Editor", đồng thời các role này cũng có thể được gán cho user khác. Vì vậy, một user có nhiều role và một role có nhiều user.

<a name="many-to-many-table-structure"></a>
#### Cấu trúc bảng

Để định nghĩa quan hệ này, cần ba bảng database: `users`, `roles` và `role_user`. Tên bảng `role_user` được tạo theo thứ tự alphabet của tên các model liên quan và chứa các cột `user_id`, `role_id`. Đây là bảng trung gian liên kết user với role.

Do một role có thể thuộc về nhiều user, chúng ta không thể đơn giản đặt cột `user_id` trên bảng `roles`, vì như vậy mỗi role chỉ có thể thuộc về một user. Để hỗ trợ gán một role cho nhiều user, cần có bảng `role_user`. Cấu trúc bảng của quan hệ có thể tóm tắt như sau:

```text
users
    id - integer
    name - string

roles
    id - integer
    name - string

role_user
    user_id - integer
    role_id - integer
```

<a name="many-to-many-model-structure"></a>
#### Cấu trúc model

Quan hệ many-to-many được định nghĩa bằng một method trả về kết quả của `belongsToMany`. Phương thức `belongsToMany` được cung cấp bởi base class `Illuminate\Database\Eloquent\Model` mà mọi Eloquent model trong ứng dụng đều sử dụng. Ví dụ, hãy định nghĩa method `roles` trên model `User`. Đối số đầu tiên là tên class của model liên quan:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Model
{
    /**
     * The roles that belong to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
```

Sau khi định nghĩa quan hệ, bạn có thể truy cập các role của user thông qua dynamic relationship property `roles`:

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    // ...
}
```

Vì mọi relationship cũng hoạt động như query builder, bạn có thể thêm các ràng buộc vào relationship query bằng cách gọi method `roles` rồi tiếp tục chain các điều kiện:

```php
$roles = User::find(1)->roles()->orderBy('name')->get();
```

Để xác định tên bảng trung gian, Eloquent ghép tên hai model liên quan theo thứ tự alphabet. Tuy nhiên, bạn có thể ghi đè quy ước này bằng cách truyền đối số thứ hai cho `belongsToMany`:

```php
return $this->belongsToMany(Role::class, 'role_user');
```

Ngoài việc tùy chỉnh tên bảng trung gian, bạn cũng có thể tùy chỉnh tên các cột key trên bảng bằng các đối số bổ sung của `belongsToMany`. Đối số thứ ba là tên foreign key của model đang khai báo quan hệ, còn đối số thứ tư là tên foreign key của model được liên kết:

```php
return $this->belongsToMany(Role::class, 'role_user', 'user_id', 'role_id');
```

<a name="many-to-many-defining-the-inverse-of-the-relationship"></a>
#### Định nghĩa quan hệ nghịch đảo

Để định nghĩa quan hệ "nghịch đảo" của many-to-many, hãy định nghĩa một method trên model liên quan cũng trả về kết quả của `belongsToMany`. Để hoàn chỉnh ví dụ user / role, hãy định nghĩa method `users` trên model `Role`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * The users that belong to the role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
```

Như bạn thấy, quan hệ được định nghĩa giống hệt phía model `User`, ngoại trừ việc tham chiếu tới model `App\Models\User`. Vì tiếp tục sử dụng `belongsToMany`, mọi tùy chọn tùy chỉnh bảng và key thông thường đều khả dụng khi định nghĩa quan hệ many-to-many nghịch đảo.

<a name="retrieving-intermediate-table-columns"></a>
### Lấy các cột của bảng trung gian

Như đã biết, làm việc với quan hệ many-to-many cần một bảng trung gian. Eloquent cung cấp nhiều cách thuận tiện để tương tác với bảng này. Ví dụ, giả sử model `User` liên kết với nhiều model `Role`. Sau khi truy cập quan hệ, chúng ta có thể truy cập dữ liệu bảng trung gian thông qua attribute `pivot` trên các model:

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->roles as $role) {
    echo $role->pivot->created_at;
}
```

Lưu ý rằng mỗi model `Role` được truy xuất sẽ tự động được gán attribute `pivot`. Attribute này chứa một model đại diện cho bảng trung gian.

Mặc định, model `pivot` chỉ chứa các key của model. Nếu bảng trung gian có thêm attribute, bạn phải chỉ định chúng khi định nghĩa quan hệ:

```php
return $this->belongsToMany(Role::class)->withPivot('active', 'created_by');
```

Nếu muốn bảng trung gian có các timestamp `created_at` và `updated_at` được Eloquent tự động duy trì, hãy gọi phương thức `withTimestamps` khi định nghĩa quan hệ:

```php
return $this->belongsToMany(Role::class)->withTimestamps();
```

> [!WARNING]
> Các bảng trung gian sử dụng timestamp do Eloquent tự động duy trì bắt buộc phải có cả hai cột timestamp `created_at` và `updated_at`.

<a name="customizing-the-pivot-attribute-name"></a>
#### Tùy chỉnh tên attribute `pivot`

Như đã đề cập, các attribute từ bảng trung gian có thể được truy cập trên model thông qua attribute `pivot`. Tuy nhiên, bạn có thể tùy chỉnh tên của attribute này để phản ánh rõ hơn mục đích của nó trong ứng dụng.

Ví dụ, nếu ứng dụng có các user có thể đăng ký podcast, bạn có thể có quan hệ many-to-many giữa user và podcast. Trong trường hợp này, bạn có thể đổi tên attribute của bảng trung gian thành `subscription` thay vì `pivot`. Có thể thực hiện điều này bằng phương thức `as` khi định nghĩa quan hệ:

```php
return $this->belongsToMany(Podcast::class)
    ->as('subscription')
    ->withTimestamps();
```

Sau khi chỉ định attribute tùy chỉnh cho bảng trung gian, bạn có thể truy cập dữ liệu của bảng trung gian bằng tên đã tùy chỉnh:

```php
$users = User::with('podcasts')->get();

foreach ($users->flatMap->podcasts as $podcast) {
    echo $podcast->subscription->created_at;
}
```

<a name="filtering-queries-via-intermediate-table-columns"></a>
### Lọc truy vấn thông qua các cột của bảng trung gian

Bạn cũng có thể lọc kết quả trả về từ truy vấn quan hệ `belongsToMany` bằng các phương thức `wherePivot`, `wherePivotIn`, `wherePivotNotIn`, `wherePivotBetween`, `wherePivotNotBetween`, `wherePivotNull` và `wherePivotNotNull` khi định nghĩa quan hệ:

```php
return $this->belongsToMany(Role::class)
    ->wherePivot('approved', 1);

return $this->belongsToMany(Role::class)
    ->wherePivotIn('priority', [1, 2]);

return $this->belongsToMany(Role::class)
    ->wherePivotNotIn('priority', [1, 2]);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNotBetween('created_at', ['2020-01-01 00:00:00', '2020-12-31 00:00:00']);

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNull('expired_at');

return $this->belongsToMany(Podcast::class)
    ->as('subscriptions')
    ->wherePivotNotNull('expired_at');
```

`wherePivot` thêm ràng buộc mệnh đề where vào truy vấn, nhưng không tự thêm giá trị đã chỉ định khi tạo model mới thông qua quan hệ. Nếu cần vừa truy vấn vừa tạo quan hệ với một giá trị pivot cụ thể, bạn có thể sử dụng phương thức `withPivotValue`:

```php
return $this->belongsToMany(Role::class)
    ->withPivotValue('approved', 1);
```

<a name="ordering-queries-via-intermediate-table-columns"></a>
### Sắp xếp truy vấn thông qua các cột của bảng trung gian

Bạn có thể sắp xếp kết quả trả về từ truy vấn quan hệ `belongsToMany` bằng các phương thức `orderByPivot` và `orderByPivotDesc`. Trong ví dụ sau, chúng ta sẽ lấy tất cả badge mới nhất của user:

```php
return $this->belongsToMany(Badge::class)
    ->where('rank', 'gold')
    ->orderByPivotDesc('created_at');
```

<a name="defining-custom-intermediate-table-models"></a>
### Định nghĩa model tùy chỉnh cho bảng trung gian

Nếu muốn định nghĩa một model tùy chỉnh đại diện cho bảng trung gian của quan hệ many-to-many, bạn có thể gọi phương thức `using` khi định nghĩa quan hệ. Custom pivot model cho phép bạn bổ sung hành vi cho pivot model, chẳng hạn như các phương thức và cast.

Custom pivot model cho quan hệ many-to-many nên kế thừa class `Illuminate\Database\Eloquent\Relations\Pivot`, trong khi custom pivot model cho quan hệ polymorphic many-to-many nên kế thừa class `Illuminate\Database\Eloquent\Relations\MorphPivot`. Ví dụ, chúng ta có thể định nghĩa model `Role` sử dụng custom pivot model `RoleUser`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    /**
     * The users that belong to the role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->using(RoleUser::class);
    }
}
```

Khi định nghĩa model `RoleUser`, bạn nên kế thừa class `Illuminate\Database\Eloquent\Relations\Pivot`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RoleUser extends Pivot
{
    // ...
}
```

> [!WARNING]
> Pivot model không thể sử dụng trait `SoftDeletes`. Nếu cần soft delete các bản ghi pivot, hãy cân nhắc chuyển pivot model thành một Eloquent model thực sự.

<a name="custom-pivot-models-and-incrementing-ids"></a>
#### Custom Pivot Model và ID tự tăng

Nếu bạn đã định nghĩa quan hệ many-to-many sử dụng custom pivot model và pivot model đó có primary key tự tăng, hãy đảm bảo class custom pivot model sử dụng attribute `Table` với `incrementing` được đặt thành `true`:

```php
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Table(incrementing: true)]
class RoleUser extends Pivot
{
    // ...
}
```

<a name="polymorphic-relationships"></a>
## Quan hệ Polymorphic

Quan hệ polymorphic cho phép model con thuộc về nhiều loại model khác nhau thông qua một liên kết duy nhất. Ví dụ, hãy hình dung bạn đang xây dựng ứng dụng cho phép user chia sẻ bài blog và video. Trong ứng dụng như vậy, model `Comment` có thể thuộc cả model `Post` lẫn `Video`.

<a name="one-to-one-polymorphic-relations"></a>
### Một-một đa hình (Polymorphic)

<a name="one-to-one-polymorphic-table-structure"></a>
#### Cấu trúc bảng

Quan hệ one-to-one polymorphic tương tự quan hệ one-to-one thông thường; tuy nhiên, model con có thể thuộc về nhiều loại model thông qua một liên kết duy nhất. Ví dụ, một `Post` blog và một `User` có thể cùng có quan hệ polymorphic với model `Image`. Quan hệ one-to-one polymorphic cho phép bạn dùng một bảng image duy nhất để liên kết image với cả post và user. Trước tiên, hãy xem cấu trúc bảng:

```text
posts
    id - integer
    name - string

users
    id - integer
    name - string

images
    id - integer
    url - string
    imageable_type - string
    imageable_id - integer
```

Hãy chú ý hai cột `imageable_id` và `imageable_type` trên bảng `images`. Cột `imageable_id` chứa giá trị ID của post hoặc user, còn `imageable_type` chứa tên class của model cha. Eloquent sử dụng cột `imageable_type` để xác định "loại" model cha cần trả về khi truy cập quan hệ `imageable`. Trong trường hợp này, cột sẽ chứa `App\Models\Post` hoặc `App\Models\User`.

<a name="one-to-one-polymorphic-model-structure"></a>
#### Cấu trúc model

Tiếp theo, hãy xem các định nghĩa model cần thiết để xây dựng quan hệ này:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Image extends Model
{
    /**
     * Get the parent imageable model (user or post).
     */
    public function imageable(): MorphTo
    {
        return $this->morphTo();
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Post extends Model
{
    /**
     * Get the post's image.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class User extends Model
{
    /**
     * Get the user's image.
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }
}
```

<a name="one-to-one-polymorphic-retrieving-the-relationship"></a>
#### Truy xuất quan hệ

Sau khi bảng database và các model đã được định nghĩa, bạn có thể truy cập quan hệ thông qua model. Ví dụ, để lấy image của một post, chúng ta có thể truy cập dynamic relationship property `image`:

```php
use App\Models\Post;

$post = Post::find(1);

$image = $post->image;
```

Bạn có thể lấy model cha của polymorphic model bằng cách truy cập tên phương thức thực hiện lời gọi `morphTo`. Trong trường hợp này, đó là phương thức `imageable` trên model `Image`. Vì vậy, chúng ta sẽ truy cập phương thức đó dưới dạng dynamic relationship property:

```php
use App\Models\Image;

$image = Image::find(1);

$imageable = $image->imageable;
```

Quan hệ `imageable` trên model `Image` sẽ trả về instance `Post` hoặc `User`, tùy loại model đang sở hữu image.

<a name="morph-one-to-one-key-conventions"></a>
#### Quy ước key

Nếu cần, bạn có thể chỉ định tên các cột "id" và "type" được polymorphic child model sử dụng. Khi làm vậy, hãy đảm bảo luôn truyền tên quan hệ làm đối số đầu tiên cho phương thức `morphTo`. Thông thường giá trị này nên trùng với tên phương thức, vì vậy bạn có thể dùng hằng `__FUNCTION__` của PHP:

```php
/**
 * Get the model that the image belongs to.
 */
public function imageable(): MorphTo
{
    return $this->morphTo(__FUNCTION__, 'imageable_type', 'imageable_id');
}
```

<a name="one-to-many-polymorphic-relations"></a>
### Một-nhiều đa hình (Polymorphic)

<a name="one-to-many-polymorphic-table-structure"></a>
#### Cấu trúc bảng

Quan hệ one-to-many polymorphic tương tự quan hệ one-to-many thông thường; tuy nhiên, model con có thể thuộc về nhiều loại model thông qua một liên kết duy nhất. Ví dụ, giả sử user trong ứng dụng có thể "comment" vào cả post và video. Với polymorphic relationship, bạn có thể dùng một bảng `comments` duy nhất để lưu comment cho cả post lẫn video. Trước tiên, hãy xem cấu trúc bảng cần thiết để xây dựng quan hệ này:

```text
posts
    id - integer
    title - string
    body - text

videos
    id - integer
    title - string
    url - string

comments
    id - integer
    body - text
    commentable_type - string
    commentable_id - integer
```

<a name="one-to-many-polymorphic-model-structure"></a>
#### Cấu trúc model

Tiếp theo, hãy xem các định nghĩa model cần thiết để xây dựng quan hệ này:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Comment extends Model
{
    /**
     * Get the parent commentable model (post or video).
     */
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Post extends Model
{
    /**
     * Get all of the post's comments.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Video extends Model
{
    /**
     * Get all of the video's comments.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
```

<a name="one-to-many-polymorphic-retrieving-the-relationship"></a>
#### Truy xuất quan hệ

Sau khi bảng database và các model đã được định nghĩa, bạn có thể truy cập quan hệ thông qua dynamic relationship property của model. Ví dụ, để truy cập tất cả comment của một post, chúng ta có thể sử dụng dynamic property `comments`:

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->comments as $comment) {
    // ...
}
```

Bạn cũng có thể lấy model cha của polymorphic child model bằng cách truy cập tên phương thức thực hiện lời gọi `morphTo`. Trong trường hợp này, đó là phương thức `commentable` trên model `Comment`. Vì vậy, chúng ta truy cập phương thức này dưới dạng dynamic relationship property để lấy model cha của comment:

```php
use App\Models\Comment;

$comment = Comment::find(1);

$commentable = $comment->commentable;
```

Quan hệ `commentable` trên model `Comment` sẽ trả về instance `Post` hoặc `Video`, tùy loại model đang là model cha của comment.

<a name="polymorphic-automatically-hydrating-parent-models-on-children"></a>
#### Tự động hydrate model cha vào model con

Ngay cả khi sử dụng eager loading của Eloquent, vấn đề truy vấn "N + 1" vẫn có thể xảy ra nếu bạn truy cập model cha từ model con trong lúc lặp qua các model con:

```php
$posts = Post::with('comments')->get();

foreach ($posts as $post) {
    foreach ($post->comments as $comment) {
        echo $comment->commentable->title;
    }
}
```

Trong ví dụ trên, vấn đề truy vấn "N + 1" xuất hiện vì dù các comment đã được eager load cho mọi model `Post`, Eloquent không tự động hydrate model cha `Post` vào từng model con `Comment`.

Nếu muốn Eloquent tự động hydrate model cha vào các model con, bạn có thể gọi phương thức `chaperone` khi định nghĩa quan hệ `morphMany`:

```php
class Post extends Model
{
    /**
     * Get all of the post's comments.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')->chaperone();
    }
}
```

Hoặc, nếu muốn chủ động bật cơ chế tự động hydrate model cha tại thời điểm chạy, bạn có thể gọi `chaperone` khi eager load quan hệ:

```php
use App\Models\Post;

$posts = Post::with([
    'comments' => fn ($comments) => $comments->chaperone(),
])->get();
```

<a name="one-of-many-polymorphic-relations"></a>
### Một trong nhiều đa hình (Polymorphic)

Đôi khi một model có nhiều model liên quan nhưng bạn muốn dễ dàng lấy model liên quan "mới nhất" hoặc "cũ nhất" của quan hệ. Ví dụ, model `User` có thể liên kết với nhiều model `Image`, nhưng bạn muốn có cách thuận tiện để làm việc với image gần đây nhất mà user đã tải lên. Bạn có thể thực hiện điều này bằng loại quan hệ `morphOne` kết hợp với các phương thức `ofMany`:

```php
/**
 * Get the user's most recent image.
 */
public function latestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->latestOfMany();
}
```

Tương tự, bạn có thể định nghĩa phương thức để lấy model liên quan "cũ nhất", hay model đầu tiên của quan hệ:

```php
/**
 * Get the user's oldest image.
 */
public function oldestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->oldestOfMany();
}
```

Mặc định, `latestOfMany` và `oldestOfMany` lấy model liên quan mới nhất hoặc cũ nhất dựa trên primary key của model; key này phải có khả năng sắp xếp. Tuy nhiên, đôi khi bạn muốn lấy một model duy nhất từ một quan hệ lớn hơn bằng tiêu chí sắp xếp khác.

Ví dụ, bằng phương thức `ofMany`, bạn có thể lấy image được "like" nhiều nhất của user. Phương thức `ofMany` nhận cột có thể sắp xếp làm đối số đầu tiên và hàm aggregate (`min` hoặc `max`) cần áp dụng khi truy vấn model liên quan:

```php
/**
 * Get the user's most popular image.
 */
public function bestImage(): MorphOne
{
    return $this->morphOne(Image::class, 'imageable')->ofMany('likes', 'max');
}
```

> [!NOTE]
> Có thể xây dựng các quan hệ "one of many" nâng cao hơn. Để biết thêm thông tin, hãy xem [tài liệu has one of many](#advanced-has-one-of-many-relationships).

<a name="many-to-many-polymorphic-relations"></a>
### Nhiều-nhiều đa hình (Polymorphic)

<a name="many-to-many-polymorphic-table-structure"></a>
#### Cấu trúc bảng

Quan hệ many-to-many polymorphic phức tạp hơn một chút so với quan hệ "morph one" và "morph many". Ví dụ, model `Post` và model `Video` có thể cùng có quan hệ polymorphic với model `Tag`. Sử dụng quan hệ many-to-many polymorphic trong trường hợp này cho phép ứng dụng có một bảng tag duy nhất, trong đó mỗi tag có thể được liên kết với post hoặc video. Trước tiên, hãy xem cấu trúc bảng cần thiết để xây dựng quan hệ này:

```text
posts
    id - integer
    name - string

videos
    id - integer
    name - string

tags
    id - integer
    name - string

taggables
    tag_id - integer
    taggable_type - string
    taggable_id - integer
```

> [!NOTE]
> Trước khi đi sâu vào quan hệ polymorphic many-to-many, bạn nên đọc tài liệu về [quan hệ many-to-many](#many-to-many) thông thường.

<a name="many-to-many-polymorphic-model-structure"></a>
#### Cấu trúc model

Tiếp theo, chúng ta có thể định nghĩa các quan hệ trên model. Cả model `Post` và `Video` đều sẽ có phương thức `tags` gọi phương thức `morphToMany` do lớp model Eloquent cơ sở cung cấp.

Phương thức `morphToMany` nhận tên của model liên quan cùng với "tên quan hệ". Dựa trên tên bảng trung gian và các khóa mà chúng ta đã định nghĩa, quan hệ này sẽ được gọi là "taggable":

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Post extends Model
{
    /**
     * Get all of the tags for the post.
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-defining-the-inverse-of-the-relationship"></a>
#### Định nghĩa quan hệ nghịch đảo

Tiếp theo, trên model `Tag`, bạn nên định nghĩa một phương thức cho từng model cha có thể có. Vì vậy, trong ví dụ này, chúng ta sẽ định nghĩa phương thức `posts` và phương thức `videos`. Cả hai phương thức đều trả về kết quả của phương thức `morphedByMany`.

Phương thức `morphedByMany` nhận tên của model liên quan cùng với "tên quan hệ". Dựa trên tên bảng trung gian và các khóa mà bảng chứa, chúng ta sẽ gọi quan hệ này là "taggable":

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Tag extends Model
{
    /**
     * Get all of the posts that are assigned this tag.
     */
    public function posts(): MorphToMany
    {
        return $this->morphedByMany(Post::class, 'taggable');
    }

    /**
     * Get all of the videos that are assigned this tag.
     */
    public function videos(): MorphToMany
    {
        return $this->morphedByMany(Video::class, 'taggable');
    }
}
```

<a name="many-to-many-polymorphic-retrieving-the-relationship"></a>
#### Truy xuất quan hệ

Sau khi bảng database và các model đã được định nghĩa, bạn có thể truy cập quan hệ thông qua model. Ví dụ, để lấy tất cả tag của một post, bạn có thể sử dụng dynamic relationship property `tags`:

```php
use App\Models\Post;

$post = Post::find(1);

foreach ($post->tags as $tag) {
    // ...
}
```

Bạn có thể lấy model cha của một quan hệ polymorphic từ model con bằng cách truy cập tên phương thức thực hiện lời gọi `morphedByMany`. Trong trường hợp này, đó là phương thức `posts` hoặc `videos` trên model `Tag`:

```php
use App\Models\Tag;

$tag = Tag::find(1);

foreach ($tag->posts as $post) {
    // ...
}

foreach ($tag->videos as $video) {
    // ...
}
```

<a name="custom-polymorphic-types"></a>
### Tùy chỉnh kiểu Polymorphic

Mặc định, Laravel sử dụng fully qualified class name để lưu "type" của model liên quan. Ví dụ, với quan hệ one-to-many ở trên, nơi model `Comment` có thể thuộc về model `Post` hoặc `Video`, giá trị mặc định của `commentable_type` tương ứng sẽ là `App\Models\Post` hoặc `App\Models\Video`. Tuy nhiên, bạn có thể muốn tách các giá trị này khỏi cấu trúc nội bộ của ứng dụng.

Ví dụ, thay vì dùng tên model làm "type", chúng ta có thể dùng các chuỗi đơn giản như `post` và `video`. Nhờ đó, giá trị trong cột "type" polymorphic của database vẫn hợp lệ ngay cả khi các model được đổi tên:

```php
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'post' => 'App\Models\Post',
    'video' => 'App\Models\Video',
]);
```

Bạn có thể gọi phương thức `enforceMorphMap` trong phương thức `boot` của lớp `App\Providers\AppServiceProvider`, hoặc tạo một service provider riêng nếu muốn.

Bạn có thể xác định morph alias của một model tại runtime bằng phương thức `getMorphClass` của model. Ngược lại, bạn có thể xác định fully qualified class name tương ứng với một morph alias bằng phương thức `Relation::getMorphedModel`:

```php
use Illuminate\Database\Eloquent\Relations\Relation;

$alias = $post->getMorphClass();

$class = Relation::getMorphedModel($alias);
```

> [!WARNING]
> Khi thêm "morph map" vào ứng dụng hiện có, mọi giá trị trong column `*_type` có thể morph trong database mà vẫn chứa fully-qualified class name cần được chuyển sang tên tương ứng trong "map".

<a name="dynamic-relationships"></a>
### Quan hệ động

Bạn có thể dùng method `resolveRelationUsing` để định nghĩa relation giữa các Eloquent model tại runtime. Dù thường không được khuyến nghị cho việc phát triển ứng dụng thông thường, cách này đôi khi hữu ích khi phát triển package Laravel.

Method `resolveRelationUsing` nhận tên relationship mong muốn làm argument đầu tiên. Argument thứ hai phải là một closure nhận model instance và trả về một định nghĩa Eloquent relationship hợp lệ. Thông thường, bạn nên cấu hình dynamic relationship trong method `boot` của một [service provider](/docs/{{version}}/providers):

```php
use App\Models\Order;
use App\Models\Customer;

Order::resolveRelationUsing('customer', function (Order $orderModel) {
    return $orderModel->belongsTo(Customer::class, 'customer_id');
});
```

> [!WARNING]
> Khi định nghĩa dynamic relationship, luôn truyền rõ key name vào các Eloquent relationship method.

<a name="querying-relations"></a>
## Truy vấn quan hệ

Vì mọi Eloquent relationship đều được định nghĩa thông qua method, bạn có thể gọi các method đó để lấy instance của relationship mà không thực sự chạy query để load related model. Ngoài ra, mọi loại Eloquent relationship cũng hoạt động như [query builder](/docs/{{version}}/queries), cho phép bạn tiếp tục chain constraint vào relationship query trước khi cuối cùng thực thi SQL query với database.

Ví dụ, hãy tưởng tượng một ứng dụng blog trong đó model `User` có nhiều model `Post` liên kết:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    /**
     * Get all of the posts for the user.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

Bạn có thể query relationship `posts` và thêm constraint vào relationship như sau:

```php
use App\Models\User;

$user = User::find(1);

$user->posts()->where('active', 1)->get();
```

Bạn có thể dùng bất kỳ method nào của [query builder](/docs/{{version}}/queries) Laravel trên relationship, vì vậy hãy tham khảo tài liệu query builder để nắm toàn bộ method khả dụng.

<a name="chaining-orwhere-clauses-after-relationships"></a>
#### Nối các mệnh đề `orWhere` sau quan hệ

Như ví dụ trên, bạn có thể tự do thêm constraint vào relationship khi query. Tuy nhiên, cần cẩn thận khi chain clause `orWhere` vào relationship vì các clause `orWhere` sẽ được group logic ở cùng cấp với relationship constraint:

```php
$user->posts()
    ->where('active', 1)
    ->orWhere('votes', '>=', 100)
    ->get();
```

Ví dụ trên sẽ tạo SQL sau. Như bạn thấy, clause `or` yêu cầu query trả về _mọi_ post có số vote lớn hơn 100. Query lúc này không còn bị giới hạn theo một user cụ thể:

```sql
select *
from posts
where user_id = ? and active = 1 or votes >= 100
```

Trong hầu hết trường hợp, bạn nên dùng [logical group](/docs/{{version}}/queries#logical-grouping) để nhóm các điều kiện trong cặp dấu ngoặc đơn:

```php
use Illuminate\Database\Eloquent\Builder;

$user->posts()
    ->where(function (Builder $query) {
        return $query->where('active', 1)
            ->orWhere('votes', '>=', 100);
    })
    ->get();
```

Ví dụ trên sẽ tạo SQL sau. Lưu ý logical grouping đã nhóm constraint đúng cách và query vẫn bị giới hạn theo một user cụ thể:

```sql
select *
from posts
where user_id = ? and (active = 1 or votes >= 100)
```

<a name="relationship-methods-vs-dynamic-properties"></a>
### Phương thức quan hệ và Dynamic Property

Nếu không cần thêm constraint vào truy vấn quan hệ Eloquent, bạn có thể truy cập quan hệ như một property. Ví dụ, tiếp tục với các model `User` và `Post`, chúng ta có thể truy cập tất cả post của một user như sau:

```php
use App\Models\User;

$user = User::find(1);

foreach ($user->posts as $post) {
    // ...
}
```

Dynamic relationship property thực hiện "lazy loading", nghĩa là dữ liệu quan hệ chỉ được tải khi bạn thực sự truy cập property đó. Vì vậy, developer thường sử dụng [eager loading](#eager-loading) để tải trước những quan hệ mà họ biết sẽ được truy cập sau khi model được tải. Eager loading giúp giảm đáng kể số lượng truy vấn SQL cần thực thi để tải các quan hệ của model.

<a name="querying-relationship-existence"></a>
### Truy vấn sự tồn tại của quan hệ

Khi truy xuất các bản ghi model, bạn có thể muốn giới hạn kết quả dựa trên sự tồn tại của một quan hệ. Ví dụ, giả sử bạn muốn lấy tất cả blog post có ít nhất một comment. Để thực hiện, hãy truyền tên quan hệ vào phương thức `has` hoặc `orHas`:

```php
use App\Models\Post;

// Retrieve all posts that have at least one comment...
$posts = Post::has('comments')->get();
```

Bạn cũng có thể chỉ định operator và số lượng để tùy chỉnh truy vấn sâu hơn:

```php
// Retrieve all posts that have three or more comments...
$posts = Post::has('comments', '>=', 3)->get();
```

Các biểu thức `has` lồng nhau có thể được xây dựng bằng ký pháp "dot". Ví dụ, bạn có thể lấy tất cả post có ít nhất một comment và comment đó có ít nhất một image:

```php
// Retrieve posts that have at least one comment with images...
$posts = Post::has('comments.images')->get();
```

Nếu cần khả năng truy vấn mạnh hơn, bạn có thể sử dụng `whereHas` và `orWhereHas` để định nghĩa thêm constraint cho truy vấn `has`, chẳng hạn kiểm tra nội dung của comment:

```php
use Illuminate\Database\Eloquent\Builder;

// Retrieve posts with at least one comment containing words like code%...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();

// Retrieve posts with at least ten comments containing words like code%...
$posts = Post::whereHas('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
}, '>=', 10)->get();
```

> [!WARNING]
> Hiện tại Eloquent không hỗ trợ truy vấn sự tồn tại của quan hệ giữa các database khác nhau. Các quan hệ phải nằm trong cùng một database.

<a name="many-to-many-relationship-existence-queries"></a>
#### Truy vấn sự tồn tại của quan hệ Many to Many

Phương thức `whereAttachedTo` có thể được dùng để truy vấn các model có liên kết many-to-many với một model hoặc một collection model:

```php
$users = User::whereAttachedTo($role)->get();
```

Bạn cũng có thể truyền một instance [collection](/docs/{{version}}/eloquent-collections) vào phương thức `whereAttachedTo`. Khi đó, Laravel sẽ lấy các model được liên kết với bất kỳ model nào trong collection:

```php
$tags = Tag::whereLike('name', '%laravel%')->get();

$posts = Post::whereAttachedTo($tags)->get();
```

<a name="inline-relationship-existence-queries"></a>
#### Truy vấn sự tồn tại của quan hệ dạng inline

Nếu muốn truy vấn sự tồn tại của quan hệ với một điều kiện `where` đơn giản duy nhất gắn vào truy vấn quan hệ, bạn có thể thuận tiện hơn khi dùng các phương thức `whereRelation`, `orWhereRelation`, `whereMorphRelation` và `orWhereMorphRelation`. Ví dụ, chúng ta có thể truy vấn tất cả post có comment chưa được duyệt:

```php
use App\Models\Post;

$posts = Post::whereRelation('comments', 'is_approved', false)->get();
```

Tương tự phương thức `where` của query builder, bạn cũng có thể chỉ định operator:

```php
$posts = Post::whereRelation(
    'comments', 'created_at', '>=', now()->minus(hours: 1)
)->get();
```

<a name="querying-relationship-absence"></a>
### Truy vấn sự vắng mặt của quan hệ

Khi truy xuất các bản ghi model, bạn có thể muốn giới hạn kết quả dựa trên việc một quan hệ không tồn tại. Ví dụ, giả sử bạn muốn lấy tất cả blog post **không có** comment nào. Để thực hiện, hãy truyền tên quan hệ vào phương thức `doesntHave` hoặc `orDoesntHave`:

```php
use App\Models\Post;

$posts = Post::doesntHave('comments')->get();
```

Nếu cần khả năng truy vấn mạnh hơn, bạn có thể sử dụng `whereDoesntHave` và `orWhereDoesntHave` để thêm constraint vào truy vấn `doesntHave`, chẳng hạn kiểm tra nội dung comment:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments', function (Builder $query) {
    $query->where('content', 'like', 'code%');
})->get();
```

Bạn có thể dùng ký pháp "dot" để truy vấn một quan hệ lồng nhau. Ví dụ, truy vấn sau sẽ lấy tất cả post không có comment, đồng thời lấy các post có comment nhưng không comment nào đến từ user bị cấm:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::whereDoesntHave('comments.author', function (Builder $query) {
    $query->where('banned', 1);
})->get();
```

<a name="querying-morph-to-relationships"></a>
### Truy vấn quan hệ Morph To

Để truy vấn sự tồn tại của quan hệ "morph to", bạn có thể sử dụng `whereHasMorph` và `whereDoesntHaveMorph`. Đối số đầu tiên của các phương thức này là tên quan hệ. Tiếp theo là tên các model liên quan mà bạn muốn đưa vào truy vấn. Cuối cùng, bạn có thể truyền một closure để tùy chỉnh truy vấn quan hệ:

```php
use App\Models\Comment;
use App\Models\Post;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;

// Retrieve comments associated to posts or videos with a title like code%...
$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();

// Retrieve comments associated to posts with a title not like code%...
$comments = Comment::whereDoesntHaveMorph(
    'commentable',
    Post::class,
    function (Builder $query) {
        $query->where('title', 'like', 'code%');
    }
)->get();
```

Đôi khi bạn cần thêm constraint dựa trên "type" của polymorphic model liên quan. Closure truyền vào `whereHasMorph` có thể nhận giá trị `$type` làm đối số thứ hai. Đối số này cho phép bạn kiểm tra "type" của truy vấn đang được xây dựng:

```php
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph(
    'commentable',
    [Post::class, Video::class],
    function (Builder $query, string $type) {
        $column = $type === Post::class ? 'content' : 'title';

        $query->where($column, 'like', 'code%');
    }
)->get();
```

Đôi khi bạn muốn truy vấn các model con của model cha trong quan hệ "morph to". Bạn có thể thực hiện bằng `whereMorphedTo` và `whereNotMorphedTo`; các phương thức này tự động xác định morph type mapping phù hợp cho model được truyền vào. Đối số đầu tiên là tên quan hệ `morphTo`, đối số thứ hai là model cha liên quan:

```php
$comments = Comment::whereMorphedTo('commentable', $post)
    ->orWhereMorphedTo('commentable', $video)
    ->get();
```

<a name="querying-all-morph-to-related-models"></a>
#### Truy vấn tất cả model liên quan

Thay vì truyền mảng các polymorphic model có thể có, bạn có thể truyền `*` làm wildcard. Laravel khi đó sẽ lấy tất cả polymorphic type có thể có từ database. Laravel sẽ thực thi thêm một truy vấn để thực hiện thao tác này:

```php
use Illuminate\Database\Eloquent\Builder;

$comments = Comment::whereHasMorph('commentable', '*', function (Builder $query) {
    $query->where('title', 'like', 'foo%');
})->get();
```

<a name="aggregating-related-models"></a>
## Tổng hợp dữ liệu từ các model liên quan

<a name="counting-related-models"></a>
### Đếm các model liên quan

Đôi khi bạn muốn đếm số related model của một relationship mà không thực sự load các model đó. Bạn có thể dùng method `withCount`. Method `withCount` sẽ đặt attribute `{relation}_count` trên các model kết quả:

```php
use App\Models\Post;

$posts = Post::withCount('comments')->get();

foreach ($posts as $post) {
    echo $post->comments_count;
}
```

Bằng cách truyền một mảng vào phương thức `withCount`, bạn có thể thêm số lượng cho nhiều quan hệ đồng thời áp dụng các ràng buộc bổ sung cho từng truy vấn:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount(['votes', 'comments' => function (Builder $query) {
    $query->where('content', 'like', 'code%');
}])->get();

echo $posts[0]->votes_count;
echo $posts[0]->comments_count;
```

Bạn cũng có thể đặt alias cho kết quả đếm quan hệ, nhờ đó có thể thực hiện nhiều phép đếm khác nhau trên cùng một quan hệ:

```php
use Illuminate\Database\Eloquent\Builder;

$posts = Post::withCount([
    'comments',
    'comments as pending_comments_count' => function (Builder $query) {
        $query->where('approved', false);
    },
])->get();

echo $posts[0]->comments_count;
echo $posts[0]->pending_comments_count;
```

<a name="deferred-count-loading"></a>
#### Tải số lượng theo kiểu trì hoãn

Với phương thức `loadCount`, bạn có thể tải số lượng của một quan hệ sau khi model cha đã được truy xuất:

```php
$book = Book::first();

$book->loadCount('genres');
```

Nếu cần thêm ràng buộc cho truy vấn đếm, bạn có thể truyền một mảng có key là tên các quan hệ cần đếm. Giá trị của mảng là các closure nhận vào instance query builder:

```php
$book->loadCount(['reviews' => function (Builder $query) {
    $query->where('rating', 5);
}])
```

<a name="relationship-counting-and-custom-select-statements"></a>
#### Đếm quan hệ và câu lệnh Select tùy chỉnh

Nếu kết hợp `withCount` với câu lệnh `select`, hãy bảo đảm gọi `withCount` sau phương thức `select`:

```php
$posts = Post::select(['title', 'body'])
    ->withCount('comments')
    ->get();
```

<a name="other-aggregate-functions"></a>
### Các hàm tổng hợp khác

Ngoài phương thức `withCount`, Eloquent còn cung cấp các phương thức `withMin`, `withMax`, `withAvg`, `withSum` và `withExists`. Các phương thức này sẽ thêm một thuộc tính `{relation}_{function}_{column}` vào các model kết quả:

```php
use App\Models\Post;

$posts = Post::withSum('comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->comments_sum_votes;
}
```

Nếu muốn truy cập kết quả của hàm tổng hợp bằng một tên khác, bạn có thể chỉ định alias riêng:

```php
$posts = Post::withSum('comments as total_comments', 'votes')->get();

foreach ($posts as $post) {
    echo $post->total_comments;
}
```

Tương tự `loadCount`, các phương thức này cũng có phiên bản trì hoãn. Bạn có thể thực hiện các phép tổng hợp bổ sung này trên những Eloquent model đã được truy xuất:

```php
$post = Post::first();

$post->loadSum('comments', 'votes');
```

Nếu kết hợp các phương thức tổng hợp này với câu lệnh `select`, hãy bảo đảm gọi các phương thức tổng hợp sau phương thức `select`:

```php
$posts = Post::select(['title', 'body'])
    ->withExists('comments')
    ->get();
```

<a name="counting-related-models-on-morph-to-relationships"></a>
### Đếm model liên quan trên quan hệ Morph To

Nếu muốn eager load một quan hệ "morph to" đồng thời lấy số lượng model liên quan cho từng loại thực thể mà quan hệ đó có thể trả về, bạn có thể kết hợp phương thức `with` với `morphWithCount` của quan hệ `morphTo`.

Trong ví dụ này, giả sử các model `Photo` và `Post` có thể tạo model `ActivityFeed`. Model `ActivityFeed` định nghĩa quan hệ "morph to" tên `parentable`, cho phép truy xuất model cha `Photo` hoặc `Post` của một instance `ActivityFeed`. Đồng thời, giả sử model `Photo` "has many" model `Tag`, còn model `Post` "has many" model `Comment`.

Bây giờ, giả sử chúng ta muốn truy xuất các instance `ActivityFeed` và eager load model cha `parentable` cho từng instance. Đồng thời, chúng ta muốn lấy số lượng tag liên kết với từng photo cha và số lượng comment liên kết với từng post cha:

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$activities = ActivityFeed::with([
    'parentable' => function (MorphTo $morphTo) {
        $morphTo->morphWithCount([
            Photo::class => ['tags'],
            Post::class => ['comments'],
        ]);
    }])->get();
```

<a name="morph-to-deferred-count-loading"></a>
#### Tải số lượng theo kiểu trì hoãn

Giả sử chúng ta đã truy xuất một tập các model `ActivityFeed` và giờ muốn tải số lượng quan hệ lồng nhau cho các model `parentable` khác nhau gắn với những activity feed này. Bạn có thể dùng phương thức `loadMorphCount` để thực hiện:

```php
$activities = ActivityFeed::with('parentable')->get();

$activities->loadMorphCount('parentable', [
    Photo::class => ['tags'],
    Post::class => ['comments'],
]);
```

<a name="eager-loading"></a>
## Eager Loading

Khi truy cập quan hệ Eloquent dưới dạng property, các model liên quan sẽ được "lazy load". Nghĩa là dữ liệu quan hệ chỉ thực sự được tải khi bạn truy cập property lần đầu. Tuy nhiên, Eloquent có thể "eager load" quan hệ ngay khi truy vấn model cha. Eager loading giúp giảm vấn đề truy vấn "N + 1". Để minh họa, hãy xét model `Book` có quan hệ "belongs to" với model `Author`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * Get the author that wrote the book.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }
}
```

Bây giờ, hãy truy xuất tất cả sách cùng tác giả của chúng:

```php
use App\Models\Book;

$books = Book::all();

foreach ($books as $book) {
    echo $book->author->name;
}
```

Vòng lặp này sẽ thực thi một truy vấn để lấy toàn bộ sách trong bảng database, sau đó thực thi thêm một truy vấn cho từng cuốn sách để lấy tác giả. Vì vậy, nếu có 25 cuốn sách, đoạn code trên sẽ chạy 26 truy vấn: một truy vấn lấy danh sách sách ban đầu và 25 truy vấn bổ sung để lấy tác giả của từng cuốn.

May mắn là chúng ta có thể dùng eager loading để giảm thao tác này xuống chỉ còn hai truy vấn. Khi xây dựng truy vấn, bạn có thể chỉ định các quan hệ cần eager load bằng phương thức `with`:

```php
$books = Book::with('author')->get();

foreach ($books as $book) {
    echo $book->author->name;
}
```

Với thao tác này, chỉ hai truy vấn được thực thi: một truy vấn lấy toàn bộ sách và một truy vấn lấy toàn bộ tác giả tương ứng với các sách đó:

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

<a name="eager-loading-multiple-relationships"></a>
#### Eager load nhiều quan hệ

Đôi khi bạn cần eager load nhiều quan hệ khác nhau. Khi đó, chỉ cần truyền một mảng tên quan hệ vào phương thức `with`:

```php
$books = Book::with(['author', 'publisher'])->get();
```

<a name="nested-eager-loading"></a>
#### Eager loading lồng nhau

Để eager load các quan hệ bên trong một quan hệ, bạn có thể dùng cú pháp "dot". Ví dụ, hãy eager load tác giả của từng cuốn sách và toàn bộ liên hệ cá nhân của tác giả:

```php
$books = Book::with('author.contacts')->get();
```

Ngoài ra, bạn có thể khai báo các quan hệ eager load lồng nhau bằng cách truyền mảng lồng nhau cho phương thức `with`; cách này thuận tiện khi cần eager load nhiều quan hệ lồng nhau:

```php
$books = Book::with([
    'author' => [
        'contacts',
        'publisher',
    ],
])->get();
```

<a name="nested-eager-loading-morphto-relationships"></a>
#### Eager loading lồng nhau cho quan hệ `morphTo`

Nếu muốn eager load một quan hệ `morphTo` cùng các quan hệ lồng nhau trên những loại thực thể khác nhau mà quan hệ đó có thể trả về, bạn có thể kết hợp phương thức `with` với phương thức `morphWith` của quan hệ `morphTo`. Hãy xét model sau để minh họa:

```php
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * Get the parent of the activity feed record.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

Trong ví dụ này, giả sử các model `Event`, `Photo` và `Post` có thể tạo model `ActivityFeed`. Đồng thời, model `Event` thuộc về một model `Calendar`, model `Photo` liên kết với các model `Tag`, còn model `Post` thuộc về một model `Author`.

Với các định nghĩa model và quan hệ này, chúng ta có thể truy xuất các instance `ActivityFeed`, đồng thời eager load toàn bộ model `parentable` cùng các quan hệ lồng nhau tương ứng:

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$activities = ActivityFeed::query()
    ->with(['parentable' => function (MorphTo $morphTo) {
        $morphTo->morphWith([
            Event::class => ['calendar'],
            Photo::class => ['tags'],
            Post::class => ['author'],
        ]);
    }])->get();
```

<a name="eager-loading-specific-columns"></a>
#### Eager load các cột cụ thể

Không phải lúc nào bạn cũng cần mọi cột từ quan hệ đang truy xuất. Vì vậy, Eloquent cho phép chỉ định các cột của quan hệ mà bạn muốn lấy:

```php
$books = Book::with('author:id,name,book_id')->get();
```

> [!WARNING]
> Khi sử dụng tính năng này, bạn luôn nên đưa cột `id` và mọi cột foreign key liên quan vào danh sách cột cần truy xuất.

<a name="eager-loading-by-default"></a>
#### Eager load mặc định

Đôi khi bạn muốn luôn tải một số quan hệ mỗi khi truy xuất model. Để làm điều này, bạn có thể định nghĩa property `$with` trên model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = ['author'];

    /**
     * Get the author that wrote the book.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * Get the genre of the book.
     */
    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }
}
```

Nếu muốn loại một quan hệ trong `$with` khỏi một truy vấn cụ thể, bạn có thể dùng phương thức `without`:

```php
$books = Book::without('author')->get();
```

Nếu muốn ghi đè toàn bộ các quan hệ trong `$with` cho một truy vấn cụ thể, bạn có thể dùng phương thức `withOnly`:

```php
$books = Book::withOnly('genre')->get();
```

<a name="constraining-eager-loads"></a>
### Thêm ràng buộc cho Eager Loading

Đôi khi bạn muốn eager load một quan hệ nhưng đồng thời cần thêm điều kiện cho truy vấn eager loading. Bạn có thể truyền một mảng quan hệ vào phương thức `with`, trong đó key là tên quan hệ và value là closure dùng để bổ sung các ràng buộc cho truy vấn eager loading:

```php
use App\Models\User;

$users = User::with(['posts' => function ($query) {
    $query->where('title', 'like', '%code%');
}])->get();
```

Trong ví dụ này, Eloquent chỉ eager load các post có cột `title` chứa từ `code`. Bạn có thể gọi thêm các phương thức của [query builder](/docs/{{version}}/queries) để tùy chỉnh thao tác eager loading:

```php
$users = User::with(['posts' => function ($query) {
    $query->orderBy('created_at', 'desc');
}])->get();
```

<a name="constraining-eager-loading-of-morph-to-relationships"></a>
#### Thêm ràng buộc khi Eager Loading quan hệ `morphTo`

Khi eager load một quan hệ `morphTo`, Eloquent sẽ chạy nhiều truy vấn để lấy từng loại model liên quan. Bạn có thể thêm ràng buộc riêng cho từng truy vấn bằng phương thức `constrain` của quan hệ `MorphTo`:

```php
use Illuminate\Database\Eloquent\Relations\MorphTo;

$comments = Comment::with(['commentable' => function (MorphTo $morphTo) {
    $morphTo->constrain([
        Post::class => function ($query) {
            $query->whereNull('hidden_at');
        },
        Video::class => function ($query) {
            $query->where('type', 'educational');
        },
    ]);
}])->get();
```

Trong ví dụ này, Eloquent chỉ eager load các post chưa bị ẩn và các video có giá trị `type` là `educational`.

<a name="constraining-eager-loads-with-relationship-existence"></a>
#### Thêm ràng buộc cho Eager Loading With Relationship Existence

Đôi khi bạn cần vừa kiểm tra sự tồn tại của một quan hệ, vừa tải quan hệ đó theo cùng điều kiện. Ví dụ, bạn chỉ muốn truy xuất các model `User` có model con `Post` thỏa một điều kiện truy vấn nhất định, đồng thời eager load chính các post phù hợp. Bạn có thể thực hiện bằng phương thức `withWhereHas`:

```php
use App\Models\User;

$users = User::withWhereHas('posts', function ($query) {
    $query->where('featured', true);
})->get();
```

<a name="lazy-eager-loading"></a>
### Lazy Eager Loading

Đôi khi bạn cần eager load một quan hệ sau khi model cha đã được truy xuất. Cách này hữu ích khi cần quyết định động xem có tải các model liên quan hay không:

```php
use App\Models\Book;

$books = Book::all();

if ($condition) {
    $books->load('author', 'publisher');
}
```

Nếu cần thêm ràng buộc cho truy vấn eager loading, bạn có thể truyền một mảng có key là tên các quan hệ cần tải. Giá trị của mảng là các closure nhận vào instance truy vấn:

```php
$author->load(['books' => function ($query) {
    $query->orderBy('published_date', 'asc');
}]);
```

Để chỉ tải một quan hệ khi quan hệ đó chưa được tải, hãy dùng phương thức `loadMissing`:

```php
$book->loadMissing('author');
```

<a name="nested-lazy-eager-loading-morphto"></a>
#### Lazy Eager Loading lồng nhau với `morphTo`

Nếu muốn eager load một quan hệ `morphTo` cùng các quan hệ lồng nhau trên những loại thực thể khác nhau mà quan hệ đó có thể trả về, bạn có thể dùng phương thức `loadMorph`.

Phương thức này nhận tên quan hệ `morphTo` làm đối số thứ nhất và một mảng các cặp model / quan hệ làm đối số thứ hai. Hãy xét model sau để minh họa:

```php
<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityFeed extends Model
{
    /**
     * Get the parent of the activity feed record.
     */
    public function parentable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

Trong ví dụ này, giả sử các model `Event`, `Photo` và `Post` có thể tạo model `ActivityFeed`. Đồng thời, model `Event` thuộc về một model `Calendar`, model `Photo` liên kết với các model `Tag`, còn model `Post` thuộc về một model `Author`.

Với các định nghĩa model và quan hệ này, chúng ta có thể truy xuất các instance `ActivityFeed`, đồng thời eager load toàn bộ model `parentable` cùng các quan hệ lồng nhau tương ứng:

```php
$activities = ActivityFeed::with('parentable')
    ->get()
    ->loadMorph('parentable', [
        Event::class => ['calendar'],
        Photo::class => ['tags'],
        Post::class => ['author'],
    ]);
```

<a name="automatic-eager-loading"></a>
### Tự động Eager Loading

Trong nhiều trường hợp, Laravel có thể tự động eager load các quan hệ mà bạn truy cập. Để bật tính năng này, hãy gọi phương thức `Model::automaticallyEagerLoadRelationships` trong phương thức `boot` của `AppServiceProvider`:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::automaticallyEagerLoadRelationships();
}
```

Khi tính năng này được bật, Laravel sẽ cố gắng tự động tải bất kỳ quan hệ nào bạn truy cập nhưng chưa được tải trước đó. Ví dụ:

```php
use App\Models\User;

$users = User::all();

foreach ($users as $user) {
    foreach ($user->posts as $post) {
        foreach ($post->comments as $comment) {
            echo $comment->content;
        }
    }
}
```

Thông thường, đoạn code trên sẽ chạy một truy vấn cho từng user để lấy các post của họ, rồi thêm một truy vấn cho từng post để lấy comment. Tuy nhiên, khi bật `automaticallyEagerLoadRelationships`, Laravel sẽ tự động [lazy eager load](#lazy-eager-loading) các post cho toàn bộ user trong collection ngay khi bạn truy cập post của bất kỳ user nào đã truy xuất. Tương tự, khi truy cập comment của bất kỳ post nào, toàn bộ comment sẽ được lazy eager load cho tất cả post đã được truy xuất ban đầu.

Nếu không muốn bật automatic eager loading trên toàn ứng dụng, bạn vẫn có thể bật tính năng này cho một instance Eloquent collection cụ thể bằng phương thức `withRelationshipAutoloading`:

```php
$users = User::where('vip', true)->get();

return $users->withRelationshipAutoloading();
```

<a name="preventing-lazy-loading"></a>
### Ngăn Lazy Loading

Như đã đề cập, eager loading quan hệ thường mang lại lợi ích đáng kể về hiệu năng. Vì vậy, bạn có thể yêu cầu Laravel luôn ngăn việc lazy load các quan hệ. Để làm điều này, hãy gọi phương thức `preventLazyLoading` của lớp Eloquent model cơ sở. Thông thường, phương thức này nên được gọi trong `boot` của `AppServiceProvider`.

Phương thức `preventLazyLoading` nhận một đối số boolean tùy chọn để xác định có ngăn lazy loading hay không. Ví dụ, bạn có thể chỉ vô hiệu hóa lazy loading ở môi trường không phải production, nhờ đó production vẫn hoạt động bình thường nếu code vô tình chứa một quan hệ được lazy load:

```php
use Illuminate\Database\Eloquent\Model;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

Sau khi ngăn lazy loading, Eloquent sẽ ném exception `Illuminate\Database\LazyLoadingViolationException` khi ứng dụng cố gắng lazy load bất kỳ quan hệ Eloquent nào.

Bạn có thể tùy chỉnh cách xử lý vi phạm lazy loading bằng phương thức `handleLazyLoadingViolationsUsing`. Ví dụ, có thể chỉ ghi log vi phạm thay vì làm gián đoạn quá trình thực thi của ứng dụng bằng exception:

```php
Model::handleLazyLoadingViolationUsing(function (Model $model, string $relation) {
    $class = $model::class;

    info("Attempted to lazy load [{$relation}] on model [{$class}].");
});
```

<a name="inserting-and-updating-related-models"></a>
## Thêm và cập nhật các model liên quan

<a name="the-save-method"></a>
### Phương thức `save`

Eloquent cung cấp các phương thức thuận tiện để thêm model mới vào quan hệ. Ví dụ, khi cần thêm comment mới cho một post, thay vì tự gán thuộc tính `post_id` trên model `Comment`, bạn có thể thêm comment thông qua phương thức `save` của quan hệ:

```php
use App\Models\Comment;
use App\Models\Post;

$comment = new Comment(['message' => 'A new comment.']);

$post = Post::find(1);

$post->comments()->save($comment);
```

Lưu ý rằng chúng ta không truy cập quan hệ `comments` dưới dạng dynamic property. Thay vào đó, phương thức `comments` được gọi để lấy instance của quan hệ. Phương thức `save` sẽ tự động gán giá trị `post_id` phù hợp cho model `Comment` mới.

Nếu cần lưu nhiều model liên quan, bạn có thể dùng phương thức `saveMany`:

```php
$post = Post::find(1);

$post->comments()->saveMany([
    new Comment(['message' => 'A new comment.']),
    new Comment(['message' => 'Another new comment.']),
]);
```

Method `save` và `saveMany` sẽ persist các model instance đã cho, nhưng không thêm các model vừa persist vào những in-memory relationship đã được load trên parent model. Nếu dự định truy cập relationship sau khi dùng `save` hoặc `saveMany`, bạn nên dùng method `refresh` để load lại model và các relationship:

```php
$post->comments()->save($comment);

$post->refresh();

// All comments, including the newly saved comment...
$post->comments;
```

<a name="the-push-method"></a>
#### Lưu đệ quy model và các quan hệ

Nếu muốn `save` model cùng toàn bộ quan hệ liên quan, bạn có thể dùng phương thức `push`. Trong ví dụ này, model `Post`, các comment của nó và tác giả của các comment đều được lưu:

```php
$post = Post::find(1);

$post->comments[0]->message = 'Message';
$post->comments[0]->author->name = 'Author Name';

$post->push();
```

Có thể dùng `pushQuietly` để lưu model và các quan hệ liên quan mà không phát sinh event:

```php
$post->pushQuietly();
```

<a name="the-create-method"></a>
### Phương thức `create`

Ngoài method `save` và `saveMany`, bạn cũng có thể dùng method `create`. Method này nhận một array attribute, tạo model và insert vào database. Khác biệt giữa `save` và `create` là `save` nhận một Eloquent model instance đầy đủ, còn `create` nhận PHP `array` thuần. Model vừa tạo sẽ được method `create` trả về:

```php
use App\Models\Post;

$post = Post::find(1);

$comment = $post->comments()->create([
    'message' => 'A new comment.',
]);
```

Bạn có thể dùng phương thức `createMany` để tạo nhiều model liên quan:

```php
$post = Post::find(1);

$post->comments()->createMany([
    ['message' => 'A new comment.'],
    ['message' => 'Another new comment.'],
]);
```

Có thể dùng `createQuietly` và `createManyQuietly` để tạo một hoặc nhiều model mà không dispatch event:

```php
$user = User::find(1);

$user->posts()->createQuietly([
    'title' => 'Post title.',
]);

$user->posts()->createManyQuietly([
    ['title' => 'First post.'],
    ['title' => 'Second post.'],
]);
```

Bạn cũng có thể dùng các phương thức `findOrNew`, `firstOrNew`, `firstOrCreate` và `updateOrCreate` để [tạo và cập nhật model thông qua quan hệ](/docs/{{version}}/eloquent#upserts).

> [!NOTE]
> Trước khi dùng phương thức `create`, hãy đọc tài liệu về [mass assignment](/docs/{{version}}/eloquent#mass-assignment).

<a name="updating-belongs-to-relationships"></a>
### Quan hệ Belongs To

Nếu muốn gán một model con cho model cha mới, bạn có thể dùng phương thức `associate`. Trong ví dụ này, model `User` định nghĩa quan hệ `belongsTo` với model `Account`. Phương thức `associate` sẽ thiết lập foreign key trên model con:

```php
use App\Models\Account;

$account = Account::find(10);

$user->account()->associate($account);

$user->save();
```

Để gỡ model cha khỏi model con, bạn có thể dùng phương thức `dissociate`. Phương thức này sẽ đặt foreign key của quan hệ thành `null`:

```php
$user->account()->dissociate();

$user->save();
```

<a name="updating-many-to-many-relationships"></a>
### Quan hệ Many to Many

<a name="attaching-detaching"></a>
#### Attach / Detach

Eloquent cung cấp các phương thức giúp làm việc với quan hệ many-to-many thuận tiện hơn. Ví dụ, một user có thể có nhiều role và một role có thể thuộc nhiều user. Bạn có thể dùng `attach` để gắn một role cho user bằng cách chèn một bản ghi vào bảng trung gian của quan hệ:

```php
use App\Models\User;

$user = User::find(1);

$user->roles()->attach($roleId);
```

Khi gắn quan hệ vào model, bạn cũng có thể truyền thêm một mảng dữ liệu để chèn vào bảng trung gian:

```php
$user->roles()->attach($roleId, ['expires' => $expires]);
```

Đôi khi bạn cần gỡ một role khỏi user. Để xóa bản ghi quan hệ many-to-many, hãy dùng phương thức `detach`. Phương thức này xóa bản ghi tương ứng khỏi bảng trung gian nhưng cả hai model vẫn được giữ trong database:

```php
// Detach a single role from the user...
$user->roles()->detach($roleId);

// Detach all roles from the user...
$user->roles()->detach();
```

Để thuận tiện, `attach` và `detach` cũng chấp nhận mảng ID làm đầu vào:

```php
$user = User::find(1);

$user->roles()->detach([1, 2, 3]);

$user->roles()->attach([
    1 => ['expires' => $expires],
    2 => ['expires' => $expires],
]);
```

<a name="syncing-associations"></a>
#### Đồng bộ liên kết

Bạn cũng có thể dùng phương thức `sync` để thiết lập các liên kết many-to-many. `sync` nhận một mảng ID cần tồn tại trong bảng trung gian. Mọi ID không có trong mảng được truyền vào sẽ bị xóa khỏi bảng trung gian. Vì vậy, sau khi thao tác hoàn tất, bảng trung gian chỉ còn các ID trong mảng đã cung cấp:

```php
$user->roles()->sync([1, 2, 3]);
```

Bạn cũng có thể truyền các giá trị bổ sung cho bảng trung gian cùng với các ID:

```php
$user->roles()->sync([1 => ['expires' => true], 2, 3]);
```

Nếu muốn chèn cùng một tập giá trị bảng trung gian cho mỗi model ID được đồng bộ, bạn có thể dùng phương thức `syncWithPivotValues`:

```php
$user->roles()->syncWithPivotValues([1, 2, 3], ['active' => true]);
```

Nếu không muốn detach các ID hiện có nhưng không xuất hiện trong mảng được truyền vào, bạn có thể dùng phương thức `syncWithoutDetaching`:

```php
$user->roles()->syncWithoutDetaching([1, 2, 3]);
```

<a name="toggling-associations"></a>
#### Chuyển đổi trạng thái liên kết

Quan hệ many-to-many cũng cung cấp phương thức `toggle` để đảo trạng thái liên kết của các model ID được cung cấp. Nếu một ID đang được attach, nó sẽ bị detach; ngược lại, nếu đang detach, nó sẽ được attach:

```php
$user->roles()->toggle([1, 2, 3]);
```

Bạn cũng có thể truyền các giá trị bổ sung cho bảng trung gian cùng với các ID:

```php
$user->roles()->toggle([
    1 => ['expires' => true],
    2 => ['expires' => true],
]);
```

<a name="transactional-pivot-operations"></a>
#### Thao tác Pivot trong transaction

Mỗi thao tác pivot ở trên đều có biến thể `OrFail` (`attachOrFail`, `detachOrFail`, `syncOrFail`, `syncWithoutDetachingOrFail` và `toggleOrFail`) thực thi thao tác trong database transaction, nhờ đó mọi thay đổi sẽ tự động rollback nếu có exception:

```php
$user->roles()->attachOrFail([1, 2, 3]);

$user->roles()->syncOrFail([1, 2, 3]);
```

<a name="updating-a-record-on-the-intermediate-table"></a>
#### Cập nhật bản ghi trên bảng trung gian

Nếu cần cập nhật một hàng đã tồn tại trong bảng trung gian của quan hệ, bạn có thể dùng phương thức `updateExistingPivot`. Phương thức này nhận foreign key của bản ghi trung gian và một mảng thuộc tính cần cập nhật:

```php
$user = User::find(1);

$user->roles()->updateExistingPivot($roleId, [
    'active' => false,
]);
```

<a name="touching-parent-timestamps"></a>
## Cập nhật timestamp của model cha

Khi một model định nghĩa quan hệ `belongsTo` hoặc `belongsToMany` với model khác, chẳng hạn `Comment` thuộc về `Post`, đôi khi sẽ hữu ích nếu timestamp của model cha được cập nhật mỗi khi model con thay đổi.

Ví dụ, khi model `Comment` được cập nhật, bạn có thể muốn tự động "touch" timestamp `updated_at` của `Post` sở hữu comment để đặt nó thành ngày giờ hiện tại. Để thực hiện, hãy dùng attribute `Touches` trên model con và truyền tên các quan hệ cần cập nhật timestamp `updated_at` khi model con thay đổi:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Touches;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Touches(['post'])]
class Comment extends Model
{
    /**
     * Get the post that the comment belongs to.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
```

> [!WARNING]
> Timestamp của model cha chỉ được cập nhật nếu model con được cập nhật bằng phương thức `save` của Eloquent.
