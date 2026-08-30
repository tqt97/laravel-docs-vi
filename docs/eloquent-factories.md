# Eloquent: Factories
- [Giới thiệu](#introduction)
- [Định nghĩa model factory](#defining-model-factories)
    - [Tạo factory](#generating-factories)
    - [Factory state](#factory-states)
    - [Factory callback](#factory-callbacks)
- [Tạo model bằng factory](#creating-models-using-factories)
    - [Khởi tạo model](#instantiating-models)
    - [Lưu model](#persisting-models)
    - [Sequences](#sequences)
- [Relationship trong factory](#factory-relationships)
    - [Has Many](#has-many-relationships)
    - [Belongs To](#belongs-to-relationships)
    - [Nhiều - nhiều](#many-to-many-relationships)
    - [Polymorphic relationship](#polymorphic-relationships)
    - [Định nghĩa relationship trong factory](#defining-relationships-within-factories)
    - [Tái sử dụng model có sẵn cho relationship](#recycling-an-existing-model-for-relationships)
<a name="introduction"></a>
## Giới thiệu
Khi test ứng dụng hoặc seed database, bạn thường cần chèn một số record mẫu. Thay vì tự chỉ định giá trị cho từng column, Laravel cho phép định nghĩa tập attribute mặc định cho mỗi [Eloquent model](/docs/{{version}}/eloquent) bằng model factory.
Để xem ví dụ về factory, hãy mở file `database/factories/UserFactory.php` trong ứng dụng. Factory này có sẵn trong mọi ứng dụng Laravel mới và chứa định nghĩa tương tự sau:
```php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
```
Ở dạng cơ bản nhất, factory là class extends base factory class của Laravel và định nghĩa method `definition`. Method này trả về tập giá trị attribute mặc định được áp dụng khi tạo model thông qua factory.
Thông qua helper `fake`, factory có quyền truy cập thư viện PHP [Faker](https://github.com/FakerPHP/Faker), giúp sinh nhiều loại dữ liệu ngẫu nhiên thuận tiện cho test và seeding.
> [!NOTE]
> Bạn có thể đổi locale của Faker bằng option `faker_locale` trong file `config/app.php`.
<a name="defining-model-factories"></a>
## Định nghĩa model factory
<a name="generating-factories"></a>
### Tạo factory
Để tạo factory, hãy chạy [Artisan command](/docs/{{version}}/artisan) `make:factory`:
```shell
php artisan make:factory PostFactory
```
Factory class mới sẽ được đặt trong thư mục `database/factories`.
<a name="factory-and-model-discovery-conventions"></a>
#### Convention khám phá model và factory
Sau khi định nghĩa factory, bạn có thể dùng static method `factory` được trait `Illuminate\Database\Eloquent\Factories\HasFactory` cung cấp trên model để tạo factory instance tương ứng.
Method `factory` của trait `HasFactory` dùng convention để xác định factory phù hợp. Cụ thể, Laravel tìm class trong namespace `Database\Factories` có tên khớp model và hậu tố `Factory`. Nếu convention này không phù hợp với ứng dụng, bạn có thể thêm attribute `UseFactory` vào model để chỉ định factory thủ công:
```php
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Database\Factories\Administration\FlightFactory;

#[UseFactory(FlightFactory::class)]
class Flight extends Model
{
    // ...
}
```
Ngoài ra, bạn có thể override method `newFactory` trên model để trả về trực tiếp factory instance tương ứng:
```php
use Database\Factories\Administration\FlightFactory;

/**
 * Create a new factory instance for the model.
 */
protected static function newFactory()
{
    return FlightFactory::new();
}
```
Sau đó dùng attribute `UseModel` trên factory tương ứng để chỉ định model:
```php
use App\Administration\Flight;
use Illuminate\Database\Eloquent\Factories\Attributes\UseModel;
use Illuminate\Database\Eloquent\Factories\Factory;

#[UseModel(Flight::class)]
class FlightFactory extends Factory
{
    // ...
}
```

<a name="factory-states"></a>
### Factory state
State manipulation method cho phép định nghĩa các thay đổi độc lập có thể áp dụng lên factory theo bất kỳ tổ hợp nào. Ví dụ, `Database\Factories\UserFactory` có thể có method state `suspended` để thay đổi một attribute mặc định.
State transformation method thường gọi method `state` của base factory class. `state` nhận closure với raw attribute array của factory và closure phải trả về mảng attribute cần thay đổi:
```php
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Indicate that the user is suspended.
 */
public function suspended(): Factory
{
    return $this->state(function (array $attributes) {
        return [
            'account_status' => 'suspended',
        ];
    });
}
```

<a name="trashed-state"></a>
#### State "Trashed"
Nếu Eloquent model hỗ trợ [soft delete](/docs/{{version}}/eloquent#soft-deleting), bạn có thể gọi state tích hợp `trashed` để model được tạo sẵn ở trạng thái "soft deleted". Không cần tự định nghĩa state này vì nó có sẵn cho mọi factory:
```php
use App\Models\User;

$user = User::factory()->trashed()->create();
```

<a name="factory-callbacks"></a>
### Factory callback
Factory callback được đăng ký bằng `afterMaking` và `afterCreating`, cho phép chạy tác vụ bổ sung sau khi make hoặc create model. Hãy đăng ký callback trong method `configure` của factory class; Laravel tự gọi method này khi factory được instantiate:
```php
namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (User $user) {
            // ...
        })->afterCreating(function (User $user) {
            // ...
        });
    }

    // ...
}
```
Bạn cũng có thể đăng ký factory callback bên trong state method để thực hiện tác vụ chỉ dành cho state đó:
```php
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Indicate that the user is suspended.
 */
public function suspended(): Factory
{
    return $this->state(function (array $attributes) {
        return [
            'account_status' => 'suspended',
        ];
    })->afterMaking(function (User $user) {
        // ...
    })->afterCreating(function (User $user) {
        // ...
    });
}
```

<a name="creating-models-using-factories"></a>
## Tạo model bằng factory
<a name="instantiating-models"></a>
### Khởi tạo model
Sau khi định nghĩa factory, dùng static method `factory` từ trait `HasFactory` để tạo factory instance. Trước tiên, method `make` tạo model nhưng **không lưu vào database**:
```php
use App\Models\User;

$user = User::factory()->make();
```
Bạn có thể tạo collection gồm nhiều model bằng method `count`:
```php
$users = User::factory()->count(3)->make();
```

<a name="applying-states"></a>
#### Áp dụng state
Bạn có thể áp dụng bất kỳ [state](#factory-states) nào lên model. Nếu cần nhiều state transformation, chỉ cần chain các state method trực tiếp:
```php
$users = User::factory()->count(5)->suspended()->make();
```

<a name="overriding-attributes"></a>
#### Override attribute
Nếu muốn override một số giá trị mặc định, truyền mảng giá trị vào method `make`. Chỉ các attribute được chỉ định bị thay thế; phần còn lại vẫn dùng giá trị mặc định từ factory:
```php
$user = User::factory()->make([
    'name' => 'Abigail Otwell',
]);
```
Ngoài ra, bạn có thể gọi trực tiếp method `state` trên factory instance để tạo inline state transformation:
```php
$user = User::factory()->state([
    'name' => 'Abigail Otwell',
])->make();
```
> [!NOTE]
> [Mass assignment protection](/docs/{{version}}/eloquent#mass-assignment) tự động được tắt khi tạo model bằng factory.
<a name="persisting-models"></a>
### Lưu model
Method `create` khởi tạo model instance và persist vào database bằng method `save` của Eloquent:
```php
use App\Models\User;

// Create a single App\Models\User instance...
$user = User::factory()->create();

// Create three App\Models\User instances...
$users = User::factory()->count(3)->create();
```
Bạn có thể override attribute mặc định bằng cách truyền mảng attribute vào `create`:
```php
$user = User::factory()->create([
    'name' => 'Abigail',
]);
```

<a name="sequences"></a>
### Sequences
Đôi khi bạn muốn luân phiên giá trị một attribute cho từng model được tạo. Có thể thực hiện bằng state transformation dạng sequence. Ví dụ, luân phiên column `admin` giữa `Y` và `N` cho các user được tạo:
```php
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;

$users = User::factory()
    ->count(10)
    ->state(new Sequence(
        ['admin' => 'Y'],
        ['admin' => 'N'],
    ))
    ->create();
```
Trong ví dụ này, năm user có `admin=Y` và năm user có `admin=N`.
Khi cần, sequence value có thể là closure. Closure được gọi mỗi khi sequence cần giá trị mới:
```php
use Illuminate\Database\Eloquent\Factories\Sequence;

$users = User::factory()
    ->count(10)
    ->state(new Sequence(
        fn (Sequence $sequence) => ['role' => UserRoles::all()->random()],
    ))
    ->create();
```
Bên trong sequence closure, bạn có thể truy cập property `$index` trên sequence instance được inject. `$index` cho biết số lần sequence đã lặp tới thời điểm hiện tại:
```php
$users = User::factory()
    ->count(10)
    ->state(new Sequence(
        fn (Sequence $sequence) => ['name' => 'Name '.$sequence->index],
    ))
    ->create();
```
Để thuận tiện, sequence cũng có thể áp dụng bằng method `sequence`, về bản chất gọi `state` bên trong. Method nhận closure hoặc các mảng attribute theo thứ tự:
```php
$users = User::factory()
    ->count(2)
    ->sequence(
        ['name' => 'First User'],
        ['name' => 'Second User'],
    )
    ->create();
```

<a name="factory-relationships"></a>
## Relationship trong factory
<a name="has-many-relationships"></a>
### Has Many
Tiếp theo, hãy xây dựng Eloquent relationship bằng fluent factory API. Giả sử ứng dụng có model `App\Models\User` và `App\Models\Post`, trong đó `User` định nghĩa relationship `hasMany` với `Post`. Ta có thể tạo một user có ba post bằng method `has`; method này nhận một factory instance:
```php
use App\Models\Post;
use App\Models\User;

$user = User::factory()
    ->has(Post::factory()->count(3))
    ->create();
```
Theo convention, khi truyền factory của `Post` vào `has`, Laravel giả định model `User` có method relationship `posts`. Nếu cần, bạn có thể chỉ định rõ tên relationship muốn thao tác:
```php
$user = User::factory()
    ->has(Post::factory()->count(3), 'posts')
    ->create();
```
Bạn có thể áp dụng state cho related model. Ngoài ra, state transformation có thể là closure nếu thay đổi cần truy cập parent model:
```php
$user = User::factory()
    ->has(
        Post::factory()
            ->count(3)
            ->state(function (array $attributes, User $user) {
                return ['user_type' => $user->type];
            })
    )
    ->create();
```

<a name="has-many-relationships-using-magic-methods"></a>
#### Dùng magic method
Để thuận tiện, Laravel cung cấp magic factory relationship method. Ví dụ sau dựa vào convention để xác định related model phải được tạo qua relationship `posts` trên `User`:
```php
$user = User::factory()
    ->hasPosts(3)
    ->create();
```
Khi dùng magic method để tạo relationship, bạn có thể truyền mảng attribute để override trên related model:
```php
$user = User::factory()
    ->hasPosts(3, [
        'published' => false,
    ])
    ->create();
```
Bạn cũng có thể truyền nhiều mảng attribute để tạo related model với state riêng cho từng model. Laravel áp dụng từng mảng theo thứ tự:
```php
$user = User::factory()
    ->hasPosts(
        ['title' => 'First Post'],
        ['title' => 'Second Post'],
        ['title' => 'Third Post'],
    )
    ->create();
```
Nếu state transformation cần parent model, hãy truyền closure:
```php
$user = User::factory()
    ->hasPosts(3, function (array $attributes, User $user) {
        return ['user_type' => $user->type];
    })
    ->create();
```

<a name="belongs-to-relationships"></a>
### Belongs To
Sau khi xem cách tạo "has many", hãy xem chiều ngược lại. Method `for` định nghĩa parent model mà các model được factory tạo thuộc về. Ví dụ, ta có thể tạo ba `Post` cùng thuộc một user:
```php
use App\Models\Post;
use App\Models\User;

$posts = Post::factory()
    ->count(3)
    ->for(User::factory()->state([
        'name' => 'Jessica Archer',
    ]))
    ->create();
```
Nếu đã có parent model instance cần liên kết với model đang tạo, hãy truyền instance đó vào `for`:
```php
$user = User::factory()->create();

$posts = Post::factory()
    ->count(3)
    ->for($user)
    ->create();
```

<a name="belongs-to-relationships-using-magic-methods"></a>
#### Dùng magic method
Laravel cũng cung cấp magic method để định nghĩa "belongs to". Ví dụ sau dùng convention để xác định ba post phải thuộc relationship `user` trên model `Post`:
```php
$posts = Post::factory()
    ->count(3)
    ->forUser([
        'name' => 'Jessica Archer',
    ])
    ->create();
```

<a name="many-to-many-relationships"></a>
### Nhiều - nhiều
Tương tự [has many](#has-many-relationships), relationship "many to many" có thể được tạo bằng method `has`:
```php
use App\Models\Role;
use App\Models\User;

$user = User::factory()
    ->has(Role::factory()->count(3))
    ->create();
```

<a name="pivot-table-attributes"></a>
#### Attribute trên pivot table
Nếu cần đặt attribute trên pivot / intermediate table liên kết hai model, hãy dùng method `hasAttached`. Đối số thứ hai là mảng tên và giá trị attribute của pivot table:
```php
use App\Models\Role;
use App\Models\User;

$user = User::factory()
    ->hasAttached(
        Role::factory()->count(3),
        ['active' => true]
    )
    ->create();
```
Nếu thay đổi state cần truy cập related model, bạn có thể truyền state transformation dạng closure:
```php
$user = User::factory()
    ->hasAttached(
        Role::factory()
            ->count(3)
            ->state(function (array $attributes, User $user) {
                return ['name' => $user->name.' Role'];
            }),
        ['active' => true]
    )
    ->create();
```
Bạn cũng có thể truyền mảng các pivot array để cung cấp dữ liệu pivot riêng cho từng related model:
```php
$user = User::factory()
    ->hasAttached(
        Role::factory(),
        [
            ['active' => true],
            ['active' => false],
        ]
    )
    ->create();
```
Nếu đã có model instance muốn attach vào các model đang tạo, hãy truyền instance vào `hasAttached`. Trong ví dụ này, cùng ba role sẽ được attach cho cả ba user:
```php
$roles = Role::factory()->count(3)->create();

$users = User::factory()
    ->count(3)
    ->hasAttached($roles, ['active' => true])
    ->create();
```

<a name="many-to-many-relationships-using-magic-methods"></a>
#### Dùng magic method
Bạn có thể dùng magic factory relationship method cho many-to-many. Ví dụ sau dựa vào convention để tạo related model thông qua relationship `roles` trên `User`:
```php
$user = User::factory()
    ->hasRoles(1, [
        'name' => 'Editor'
    ])
    ->create();
```

<a name="polymorphic-relationships"></a>
### Polymorphic relationship
[Polymorphic relationship](/docs/{{version}}/eloquent-relationships#polymorphic-relationships) cũng có thể được tạo bằng factory. Polymorphic `morphMany` được tạo tương tự `hasMany`. Ví dụ nếu `Post` có relationship `morphMany` với `Comment`:
```php
use App\Models\Post;

$post = Post::factory()->hasComments(3)->create();
```

<a name="morph-to-relationships"></a>
#### Morph To
Magic method không thể dùng để tạo relationship `morphTo`. Thay vào đó, bạn phải gọi trực tiếp `for` và chỉ định rõ tên relationship. Ví dụ, nếu `Comment` có method `commentable` định nghĩa `morphTo`, ta có thể tạo ba comment thuộc một post bằng cách gọi `for` trực tiếp:
```php
$comments = Comment::factory()->count(3)->for(
    Post::factory(), 'commentable'
)->create();
```

<a name="polymorphic-many-to-many-relationships"></a>
#### Đa hình nhiều - nhiều
Polymorphic "many to many" (`morphToMany` / `morphedByMany`) được tạo tương tự relationship many-to-many thông thường:
```php
use App\Models\Tag;
use App\Models\Video;

$video = Video::factory()
    ->hasAttached(
        Tag::factory()->count(3),
        ['public' => true]
    )
    ->create();
```
Magic method `has` cũng có thể dùng để tạo polymorphic many-to-many:
```php
$video = Video::factory()
    ->hasTags(3, ['public' => true])
    ->create();
```

<a name="defining-relationships-within-factories"></a>
### Định nghĩa relationship trong factory
Để định nghĩa relationship ngay trong model factory, thông thường bạn gán một factory instance mới cho foreign key của relationship. Cách này thường dùng cho relationship "inverse" như `belongsTo` và `morphTo`. Ví dụ, nếu muốn tự tạo user mới khi tạo post:
```php
use App\Models\User;

/**
 * Define the model's default state.
 *
 * @return array<string, mixed>
 */
public function definition(): array
{
    return [
        'user_id' => User::factory(),
        'title' => fake()->title(),
        'content' => fake()->paragraph(),
    ];
}
```
Nếu column của relationship phụ thuộc vào factory đang định nghĩa nó, bạn có thể gán closure cho attribute. Closure nhận evaluated attribute array của factory:
```php
/**
 * Define the model's default state.
 *
 * @return array<string, mixed>
 */
public function definition(): array
{
    return [
        'user_id' => User::factory(),
        'user_type' => function (array $attributes) {
            return User::find($attributes['user_id'])->type;
        },
        'title' => fake()->title(),
        'content' => fake()->paragraph(),
    ];
}
```

<a name="recycling-an-existing-model-for-relationships"></a>
### Tái sử dụng model có sẵn cho relationship
Nếu nhiều model có chung relationship với một model khác, bạn có thể dùng method `recycle` để đảm bảo cùng một related model instance được tái sử dụng cho toàn bộ relationship do factory tạo.
Ví dụ, giả sử có các model `Airline`, `Flight` và `Ticket`; ticket thuộc airline và flight, còn flight cũng thuộc airline. Khi tạo ticket, bạn thường muốn airline của ticket và flight là cùng một record, vì vậy có thể truyền airline instance vào `recycle`:
```php
Ticket::factory()
    ->recycle(Airline::factory()->create())
    ->create();
```
Method `recycle` đặc biệt hữu ích khi nhiều model cùng thuộc một user hoặc team.
`recycle` cũng nhận collection các model có sẵn. Khi truyền collection, factory sẽ chọn ngẫu nhiên một model trong collection mỗi khi cần model thuộc type đó:
```php
Ticket::factory()
    ->recycle($airlines)
    ->create();
```

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/eloquent-factories). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
