# Blade Template

<a name="introduction"></a>
## Giới thiệu

Blade là template engine đơn giản nhưng mạnh mẽ được tích hợp sẵn trong Laravel. Không giống một số PHP template engine khác, Blade không hạn chế bạn sử dụng mã PHP thuần trong template. Trên thực tế, mọi Blade template đều được biên dịch thành mã PHP thuần và được cache cho đến khi chúng thay đổi, vì vậy Blade hầu như không tạo thêm overhead cho ứng dụng. Các file Blade template sử dụng phần mở rộng `.blade.php` và thường được lưu trong thư mục `resources/views`.

Blade view có thể được trả về từ route hoặc controller bằng helper toàn cục `view`. Như đã đề cập trong tài liệu về [view](/docs/{{version}}/views), bạn có thể truyền dữ liệu vào Blade view thông qua đối số thứ hai của helper `view`:

```php
Route::get('/', function () {
    return view('greeting', ['name' => 'Finn']);
});
```

<a name="supercharging-blade-with-livewire"></a>
### Tăng sức mạnh cho Blade với Livewire

Bạn muốn nâng Blade template lên một tầm cao hơn và dễ dàng xây dựng giao diện động? Hãy xem [Laravel Livewire](https://livewire.laravel.com). Livewire cho phép bạn viết các Blade component được bổ sung khả năng động vốn thường chỉ có thể thực hiện bằng các frontend framework như React, Svelte hoặc Vue. Đây là một cách hiệu quả để xây dựng frontend hiện đại, reactive mà không phải đối mặt với độ phức tạp, client-side rendering hay các bước build thường gặp ở nhiều JavaScript framework.

<a name="displaying-data"></a>
## Hiển thị dữ liệu

Bạn có thể hiển thị dữ liệu được truyền vào Blade view bằng cách đặt biến bên trong cặp dấu ngoặc nhọn. Ví dụ, với route sau:

```php
Route::get('/', function () {
    return view('welcome', ['name' => 'Samantha']);
});
```

Bạn có thể hiển thị nội dung của biến `name` như sau:

```blade
Hello, {{ $name }}.
```

> [!NOTE]
> Các câu lệnh echo `{{ }}` của Blade tự động được xử lý qua hàm `htmlspecialchars` của PHP để ngăn chặn các cuộc tấn công XSS.

Bạn không chỉ bị giới hạn ở việc hiển thị nội dung của các biến được truyền vào view. Bạn cũng có thể echo kết quả của bất kỳ hàm PHP nào. Thực tế, bạn có thể đặt bất kỳ mã PHP nào mong muốn bên trong một câu lệnh echo của Blade:

```blade
The current UNIX timestamp is {{ time() }}.
```

<a name="html-entity-encoding"></a>
### Mã hóa HTML entity

Theo mặc định, Blade (và hàm `e` của Laravel) sẽ mã hóa kép các HTML entity. Nếu muốn tắt việc mã hóa kép, hãy gọi phương thức `Blade::withoutDoubleEncoding` từ phương thức `boot` của `AppServiceProvider`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Blade::withoutDoubleEncoding();
    }
}
```

<a name="displaying-unescaped-data"></a>
#### Hiển thị dữ liệu không escape

Theo mặc định, các câu lệnh `{{ }}` của Blade tự động được xử lý qua hàm `htmlspecialchars` của PHP để ngăn chặn tấn công XSS. Nếu không muốn dữ liệu được escape, bạn có thể sử dụng cú pháp sau:

```blade
Hello, {!! $name !!}.
```

> [!WARNING]
> Hãy đặc biệt cẩn thận khi echo nội dung do người dùng ứng dụng cung cấp. Thông thường, bạn nên sử dụng cú pháp hai dấu ngoặc nhọn có escape để ngăn chặn tấn công XSS khi hiển thị dữ liệu do người dùng cung cấp.

<a name="blade-and-javascript-frameworks"></a>
### Blade và các JavaScript framework

Vì nhiều JavaScript framework cũng sử dụng dấu ngoặc nhọn để biểu thị một biểu thức cần được hiển thị trong trình duyệt, bạn có thể dùng ký hiệu `@` để thông báo cho Blade rendering engine rằng biểu thức đó cần được giữ nguyên. Ví dụ:

```blade
<h1>Laravel</h1>

Hello, @{{ name }}.
```

Trong ví dụ này, ký hiệu `@` sẽ được Blade loại bỏ; tuy nhiên, biểu thức `{{ name }}` vẫn được Blade engine giữ nguyên, nhờ đó JavaScript framework của bạn có thể render biểu thức này.

Ký hiệu `@` cũng có thể được dùng để escape các Blade directive:

```blade
{{-- Blade template --}}
@@if()

<!-- HTML output -->
@if()
```

<a name="rendering-json"></a>
#### Render JSON

Đôi khi bạn có thể truyền một mảng vào view với mục đích render nó thành JSON để khởi tạo một biến JavaScript. Ví dụ:

```php
<script>
    var app = <?php echo json_encode($array); ?>;
</script>
```

Tuy nhiên, thay vì gọi `json_encode` thủ công, bạn có thể sử dụng phương thức `Illuminate\Support\Js::from`. Phương thức `from` nhận các đối số giống hàm `json_encode` của PHP, đồng thời đảm bảo JSON tạo ra được escape đúng cách để nhúng bên trong dấu nháy HTML. Phương thức `from` trả về một chuỗi câu lệnh JavaScript `JSON.parse`, dùng để chuyển object hoặc array đã cho thành một JavaScript object hợp lệ:

```blade
<script>
    var app = {{ Illuminate\Support\Js::from($array) }};
</script>
```

Các phiên bản mới nhất của Laravel application skeleton bao gồm facade `Js`, giúp truy cập chức năng này thuận tiện ngay trong Blade template:

```blade
<script>
    var app = {{ Js::from($array) }};
</script>
```

> [!WARNING]
> Bạn chỉ nên sử dụng phương thức `Js::from` để render các biến hiện có thành JSON. Cơ chế template của Blade dựa trên biểu thức chính quy, vì vậy việc cố truyền một biểu thức phức tạp vào directive có thể gây ra lỗi ngoài mong đợi.

<a name="the-at-verbatim-directive"></a>
#### Directive `@verbatim`

Nếu bạn hiển thị biến JavaScript trong một phần lớn của template, bạn có thể bọc HTML bằng directive `@verbatim` để không phải thêm ký hiệu `@` trước từng câu lệnh echo của Blade:

```blade
@verbatim
    <div class="container">
        Hello, {{ name }}.
    </div>
@endverbatim
```

<a name="blade-directives"></a>
## Blade directive

Ngoài kế thừa template và hiển thị dữ liệu, Blade còn cung cấp các cú pháp rút gọn tiện lợi cho những cấu trúc điều khiển PHP phổ biến như câu lệnh điều kiện và vòng lặp. Các cú pháp này giúp làm việc với cấu trúc điều khiển PHP một cách gọn gàng, súc tích nhưng vẫn quen thuộc như cú pháp PHP tương ứng.

<a name="if-statements"></a>
### Câu lệnh If

Bạn có thể xây dựng câu lệnh `if` bằng các directive `@if`, `@elseif`, `@else` và `@endif`. Các directive này hoạt động tương tự các cấu trúc tương ứng trong PHP:

```blade
@if (count($records) === 1)
    I have one record!
@elseif (count($records) > 1)
    I have multiple records!
@else
    I don't have any records!
@endif
```

Để thuận tiện, Blade cũng cung cấp directive `@unless`:

```blade
@unless (Auth::check())
    You are not signed in.
@endunless
```

Ngoài các directive điều kiện đã đề cập, `@isset` và `@empty` có thể được dùng như cú pháp rút gọn tiện lợi cho các hàm PHP tương ứng:

```blade
@isset($records)
    // $records is defined and is not null...
@endisset

@empty($records)
    // $records is "empty"...
@endempty
```

<a name="authentication-directives"></a>
#### Directive xác thực

Các directive `@auth` và `@guest` có thể được dùng để nhanh chóng xác định người dùng hiện tại đã [xác thực](/docs/{{version}}/authentication) hay đang là khách:

```blade
@auth
    // The user is authenticated...
@endauth

@guest
    // The user is not authenticated...
@endguest
```

Nếu cần, bạn có thể chỉ định authentication guard cần kiểm tra khi sử dụng các directive `@auth` và `@guest`:

```blade
@auth('admin')
    // The user is authenticated...
@endauth

@guest('admin')
    // The user is not authenticated...
@endguest
```

<a name="environment-directives"></a>
#### Directive môi trường

Bạn có thể kiểm tra ứng dụng có đang chạy trong môi trường production hay không bằng directive `@production`:

```blade
@production
    // Production specific content...
@endproduction
```

Hoặc, bạn có thể xác định ứng dụng có đang chạy trong một môi trường cụ thể hay không bằng directive `@env`:

```blade
@env('staging')
    // The application is running in "staging"...
@endenv

@env(['staging', 'production'])
    // The application is running in "staging" or "production"...
@endenv
```

<a name="section-directives"></a>
#### Directive section

Bạn có thể xác định một section kế thừa của template có nội dung hay không bằng directive `@hasSection`:

```blade
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

Bạn có thể sử dụng directive `sectionMissing` để xác định một section không có nội dung:

```blade
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

<a name="session-directives"></a>
#### Directive session

Directive `@session` có thể được dùng để xác định một giá trị [session](/docs/{{version}}/session) có tồn tại hay không. Nếu giá trị session tồn tại, nội dung template nằm giữa `@session` và `@endsession` sẽ được thực thi. Bên trong nội dung của directive `@session`, bạn có thể echo biến `$value` để hiển thị giá trị session:

```blade
@session('status')
    <div class="p-4 bg-green-100">
        {{ $value }}
    </div>
@endsession
```

<a name="context-directives"></a>
#### Directive context

Directive `@context` có thể được dùng để xác định một giá trị [context](/docs/{{version}}/context) có tồn tại hay không. Nếu giá trị context tồn tại, nội dung template nằm giữa `@context` và `@endcontext` sẽ được thực thi. Bên trong nội dung của directive `@context`, bạn có thể echo biến `$value` để hiển thị giá trị context:

```blade
@context('canonical')
    <link href="{{ $value }}" rel="canonical">
@endcontext
```

<a name="switch-statements"></a>
### Câu lệnh Switch

Câu lệnh switch có thể được xây dựng bằng các directive `@switch`, `@case`, `@break`, `@default` và `@endswitch`:

```blade
@switch($i)
    @case(1)
        First case...
        @break

    @case(2)
        Second case...
        @break

    @default
        Default case...
@endswitch
```

<a name="loops"></a>
### Vòng lặp

Ngoài câu lệnh điều kiện, Blade cung cấp các directive đơn giản để làm việc với cấu trúc vòng lặp của PHP. Tương tự, mỗi directive này hoạt động giống cấu trúc PHP tương ứng:

```blade
@for ($i = 0; $i < 10; $i++)
    The current value is {{ $i }}
@endfor

@foreach ($users as $user)
    <p>This is user {{ $user->id }}</p>
@endforeach

@forelse ($users as $user)
    <li>{{ $user->name }}</li>
@empty
    <p>No users</p>
@endforelse

@while (true)
    <p>I'm looping forever.</p>
@endwhile
```

> [!NOTE]
> Khi lặp qua một vòng `foreach`, bạn có thể sử dụng [biến loop](#the-loop-variable) để lấy các thông tin hữu ích về vòng lặp, chẳng hạn đang ở lần lặp đầu tiên hay cuối cùng.

Khi sử dụng vòng lặp, bạn cũng có thể bỏ qua lần lặp hiện tại hoặc kết thúc vòng lặp bằng các directive `@continue` và `@break`:

```blade
@foreach ($users as $user)
    @if ($user->type == 1)
        @continue
    @endif

    <li>{{ $user->name }}</li>

    @if ($user->number == 5)
        @break
    @endif
@endforeach
```

Bạn cũng có thể đặt trực tiếp điều kiện tiếp tục hoặc thoát vòng lặp trong khai báo directive:

```blade
@foreach ($users as $user)
    @continue($user->type == 1)

    <li>{{ $user->name }}</li>

    @break($user->number == 5)
@endforeach
```

<a name="the-loop-variable"></a>
### Biến Loop

Khi lặp qua một vòng `foreach`, biến `$loop` sẽ khả dụng bên trong vòng lặp. Biến này cung cấp nhiều thông tin hữu ích, chẳng hạn index hiện tại và liệu đây có phải lần lặp đầu tiên hoặc cuối cùng hay không:

```blade
@foreach ($users as $user)
    @if ($loop->first)
        This is the first iteration.
    @endif

    @if ($loop->last)
        This is the last iteration.
    @endif

    <p>This is user {{ $user->id }}</p>
@endforeach
```

Nếu đang ở trong vòng lặp lồng nhau, bạn có thể truy cập biến `$loop` của vòng lặp cha thông qua thuộc tính `parent`:

```blade
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

Biến `$loop` còn chứa nhiều thuộc tính hữu ích khác:

<div class="overflow-auto">

| Thuộc tính          | Mô tả                                                  |
| ------------------ | ------------------------------------------------------ |
| `$loop->index`     | Chỉ số của lần lặp hiện tại (bắt đầu từ 0). |
| `$loop->iteration` | Số thứ tự của lần lặp hiện tại (bắt đầu từ 1). |
| `$loop->remaining` | Số lần lặp còn lại trong vòng lặp. |
| `$loop->count`     | Tổng số phần tử trong mảng đang được lặp. |
| `$loop->first`     | Cho biết đây có phải là lần lặp đầu tiên của vòng lặp hay không. |
| `$loop->last`      | Cho biết đây có phải là lần lặp cuối cùng của vòng lặp hay không. |
| `$loop->even`      | Cho biết đây có phải là lần lặp chẵn hay không. |
| `$loop->odd`       | Cho biết đây có phải là lần lặp lẻ hay không. |
| `$loop->depth`     | Mức lồng nhau của vòng lặp hiện tại. |
| `$loop->parent`    | Khi ở trong vòng lặp lồng nhau, đây là biến vòng lặp của vòng lặp cha. |

</div>

<a name="conditional-classes"></a>
### Class và style có điều kiện

Directive `@class` biên dịch chuỗi CSS class theo điều kiện. Directive nhận một mảng class, trong đó key chứa class hoặc các class bạn muốn thêm và value là một biểu thức boolean. Nếu phần tử mảng có key dạng số, class đó sẽ luôn được đưa vào danh sách class được render:

```blade
@php
    $isActive = false;
    $hasError = true;
@endphp

<span @class([
    'p-4',
    'font-bold' => $isActive,
    'text-gray-500' => ! $isActive,
    'bg-red' => $hasError,
])></span>

<span class="p-4 text-gray-500 bg-red"></span>
```

Tương tự, directive `@style` có thể được dùng để thêm CSS inline vào một phần tử HTML theo điều kiện:

```blade
@php
    $isActive = true;
@endphp

<span @style([
    'background-color: red',
    'font-weight: bold' => $isActive,
])></span>

<span style="background-color: red; font-weight: bold;"></span>
```

<a name="additional-attributes"></a>
### Các thuộc tính bổ sung

Để thuận tiện, bạn có thể sử dụng directive `@checked` để xác định một checkbox HTML có ở trạng thái `checked` hay không. Directive này sẽ xuất `checked` nếu điều kiện được cung cấp trả về `true`:

```blade
<input
    type="checkbox"
    name="active"
    value="active"
    @checked(old('active', $user->active))
/>
```

Tương tự, directive `@selected` có thể được dùng để xác định một option của select có nên ở trạng thái `selected` hay không:

```blade
<select name="version">
    @foreach ($product->versions as $version)
        <option value="{{ $version }}" @selected(old('version') == $version)>
            {{ $version }}
        </option>
    @endforeach
</select>
```

Ngoài ra, directive `@disabled` có thể được dùng để xác định một phần tử có nên ở trạng thái `disabled` hay không:

```blade
<button type="submit" @disabled($errors->isNotEmpty())>Submit</button>
```

Directive `@readonly` có thể được dùng để xác định một phần tử có nên ở trạng thái `readonly` hay không:

```blade
<input
    type="email"
    name="email"
    value="email@laravel.com"
    @readonly($user->isNotAdmin())
/>
```

Directive `@required` có thể được dùng để xác định một phần tử có nên ở trạng thái `required` hay không:

```blade
<input
    type="text"
    name="title"
    value="title"
    @required($user->isAdmin())
/>
```

<a name="including-subviews"></a>
### Include subview

> [!NOTE]
> Mặc dù bạn có thể sử dụng directive `@include`, [component](#components) của Blade cung cấp chức năng tương tự cùng một số lợi ích bổ sung, chẳng hạn binding dữ liệu và thuộc tính.

Directive `@include` của Blade cho phép include một Blade view từ bên trong một view khác. Tất cả biến khả dụng trong view cha cũng sẽ khả dụng trong view được include:

```blade
<div>
    @include('shared.errors')

    <form>
        <!-- Form Contents -->
    </form>
</div>
```

Mặc dù view được include sẽ kế thừa toàn bộ dữ liệu khả dụng trong view cha, bạn cũng có thể truyền thêm một mảng dữ liệu để cung cấp cho view đó:

```blade
@include('view.name', ['status' => 'complete'])
```

Nếu bạn cố `@include` một view không tồn tại, Laravel sẽ phát sinh lỗi. Nếu muốn include một view có thể tồn tại hoặc không, hãy sử dụng directive `@includeIf`:

```blade
@includeIf('view.name', ['status' => 'complete'])
```

Nếu muốn `@include` một view dựa trên việc một biểu thức boolean trả về `true` hoặc `false`, bạn có thể sử dụng các directive `@includeWhen` và `@includeUnless`:

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

Để include view đầu tiên tồn tại trong một mảng view cho trước, bạn có thể sử dụng directive `includeFirst`:

```blade
@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])
```

Nếu muốn include một view mà không kế thừa bất kỳ biến nào từ view cha, bạn có thể sử dụng directive `@includeIsolated`. View được include chỉ có thể truy cập các biến mà bạn truyền vào một cách tường minh:

```blade
@includeIsolated('view.name', ['user' => $user])
```

> [!WARNING]
> Bạn nên tránh sử dụng các hằng `__DIR__` và `__FILE__` trong Blade view vì chúng sẽ trỏ tới vị trí của view đã được biên dịch và cache.

<a name="rendering-views-for-collections"></a>
#### Render view cho Collection

Bạn có thể kết hợp vòng lặp và include trên một dòng bằng directive `@each` của Blade:

```blade
@each('view.name', $jobs, 'job')
```

Đối số đầu tiên của directive `@each` là view cần render cho từng phần tử trong array hoặc collection. Đối số thứ hai là array hoặc collection cần lặp, còn đối số thứ ba là tên biến được gán cho phần tử hiện tại bên trong view. Ví dụ, khi lặp qua một mảng `jobs`, thông thường bạn sẽ truy cập từng job thông qua biến `job` trong view. Key của phần tử hiện tại sẽ khả dụng thông qua biến `key`.

Bạn cũng có thể truyền đối số thứ tư cho directive `@each`. Đối số này xác định view sẽ được render nếu mảng được cung cấp rỗng.

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

> [!WARNING]
> Các view được render qua `@each` không kế thừa biến từ view cha. Nếu view con cần các biến này, bạn nên sử dụng `@foreach` kết hợp với `@include`.

<a name="the-once-directive"></a>
### Directive `@once`

Directive `@once` cho phép bạn định nghĩa một phần template chỉ được thực thi một lần trong mỗi chu kỳ render. Điều này hữu ích khi đẩy một đoạn JavaScript vào phần header của trang bằng [stack](#stacks). Ví dụ, nếu render một [component](#components) trong vòng lặp, bạn có thể chỉ muốn đẩy JavaScript vào header ở lần đầu component được render:

```blade
@once
    @push('scripts')
        <script>
            // Your custom JavaScript...
        </script>
    @endpush
@endonce
```

Vì directive `@once` thường được dùng cùng `@push` hoặc `@prepend`, Blade cung cấp thêm các directive `@pushOnce` và `@prependOnce` để thuận tiện hơn:

```blade
@pushOnce('scripts')
    <script>
        // Your custom JavaScript...
    </script>
@endPushOnce
```

Nếu bạn push nội dung trùng lặp từ hai Blade template khác nhau, hãy cung cấp một định danh duy nhất làm đối số thứ hai của directive `@pushOnce` để đảm bảo nội dung chỉ được render một lần:

```blade
<!-- pie-chart.blade.php -->
@pushOnce('scripts', 'chart.js')
    <script src="/chart.js"></script>
@endPushOnce

<!-- line-chart.blade.php -->
@pushOnce('scripts', 'chart.js')
    <script src="/chart.js"></script>
@endPushOnce
```

<a name="raw-php"></a>
### PHP thuần

Trong một số trường hợp, việc nhúng mã PHP vào view là hữu ích. Bạn có thể sử dụng directive `@php` của Blade để thực thi một khối PHP thuần bên trong template:

```blade
@php
    $counter = 1;
@endphp
```

Hoặc, nếu chỉ cần dùng PHP để import một class, bạn có thể sử dụng directive `@use`:

```blade
@use('App\Models\Flight')
```

Bạn có thể truyền đối số thứ hai cho directive `@use` để đặt alias cho class được import:

```blade
@use('App\Models\Flight', 'FlightModel')
```

Nếu có nhiều class trong cùng namespace, bạn có thể nhóm các import của chúng:

```blade
@use('App\Models\{Flight, Airport}')
```

Directive `@use` cũng hỗ trợ import hàm và hằng PHP bằng cách thêm modifier `function` hoặc `const` trước đường dẫn import:

```blade
@use(function App\Helpers\format_currency)
@use(const App\Constants\MAX_ATTEMPTS)
```

Tương tự import class, alias cũng được hỗ trợ cho hàm và hằng:

```blade
@use(function App\Helpers\format_currency, 'formatMoney')
@use(const App\Constants\MAX_ATTEMPTS, 'MAX_TRIES')
```

Import theo nhóm cũng được hỗ trợ với cả modifier `function` và `const`, cho phép import nhiều symbol từ cùng namespace trong một directive:

```blade
@use(function App\Helpers\{format_currency, format_date})
@use(const App\Constants\{MAX_ATTEMPTS, DEFAULT_TIMEOUT})
```

<a name="fonts"></a>
### Font

Khi sử dụng [tính năng tối ưu font của Laravel với Vite](/docs/{{version}}/vite#working-with-fonts), bạn có thể dùng directive `@fonts` để render các liên kết preload font đã cấu hình và CSS font inline trong layout của ứng dụng:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    @fonts
    @vite('resources/js/app.js')
</head>
```

Directive `@fonts` render tất cả font family được cấu hình trong file `vite.config.js`. Thông thường, directive này nên được đặt trong `<head>` của root layout, trước mọi nội dung sử dụng các font đó.

Nếu một trang chỉ cần một số font đã cấu hình, bạn có thể truyền một hoặc nhiều alias của font vào directive:

```blade
{{-- Load a single font alias... --}}
@fonts('sans')

{{-- Load multiple font aliases... --}}
@fonts(['sans', 'mono'])
```

Alias của font được cấu hình bằng tùy chọn `alias` khi định nghĩa font trong cấu hình Vite. Directive `@fonts` gọi phương thức `fonts` do facade `Vite` cung cấp; bạn cũng có thể gọi trực tiếp phương thức này:

```blade
{{ Vite::fonts(['sans', 'mono']) }}
```

<a name="comments"></a>
### Comment

Blade cũng cho phép định nghĩa comment trong view. Tuy nhiên, khác với comment HTML, comment của Blade không xuất hiện trong HTML mà ứng dụng trả về:

```blade
{{-- This comment will not be present in the rendered HTML --}}
```

<a name="components"></a>
## Component

Component và slot mang lại lợi ích tương tự section, layout và include; tuy nhiên, với nhiều người, mô hình tư duy của component và slot dễ hiểu hơn. Có hai cách xây dựng component: component dựa trên class và component ẩn danh.

Để tạo component dựa trên class, bạn có thể sử dụng lệnh Artisan `make:component`. Để minh họa cách sử dụng component, chúng ta sẽ tạo một component `Alert` đơn giản. Lệnh `make:component` sẽ đặt component trong thư mục `app/View/Components`:

```shell
php artisan make:component Alert
```

Lệnh `make:component` cũng tạo view template cho component. View được đặt trong thư mục `resources/views/components`. Khi xây dựng component cho chính ứng dụng của bạn, Laravel tự động phát hiện component trong `app/View/Components` và `resources/views/components`, vì vậy thông thường không cần đăng ký thêm.

Bạn cũng có thể tạo component trong các thư mục con:

```shell
php artisan make:component Forms/Input
```

Lệnh trên tạo component `Input` trong thư mục `app/View/Components/Forms` và đặt view tương ứng trong `resources/views/components/forms`.

<a name="manually-registering-package-components"></a>
#### Đăng ký component của package theo cách thủ công

Khi xây dựng component cho chính ứng dụng của bạn, Laravel tự động phát hiện component trong các thư mục `app/View/Components` và `resources/views/components`.

Tuy nhiên, nếu đang xây dựng một package sử dụng Blade component, bạn cần đăng ký thủ công class của component và alias thẻ HTML tương ứng. Thông thường, bạn nên đăng ký các component trong phương thức `boot` của service provider thuộc package:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::component('package-alert', Alert::class);
}
```

Sau khi component được đăng ký, bạn có thể render nó bằng alias của thẻ:

```blade
<x-package-alert/>
```

Ngoài ra, bạn có thể sử dụng phương thức `componentNamespace` để tự động tải các class component theo convention. Ví dụ, package `Nightshade` có thể có các component `Calendar` và `ColorPicker` nằm trong namespace `Package\Views\Components`:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

Điều này cho phép sử dụng component của package thông qua vendor namespace với cú pháp `package-name::`:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade sẽ tự động xác định class liên kết với component bằng cách chuyển tên component sang PascalCase. Các thư mục con cũng được hỗ trợ thông qua ký hiệu dấu chấm.

<a name="rendering-components"></a>
### Render component

Để hiển thị một component, bạn có thể sử dụng thẻ Blade component trong template Blade. Thẻ component của Blade bắt đầu bằng `x-`, theo sau là tên class component ở dạng kebab-case:

```blade
<x-alert/>

<x-user-profile/>
```

Nếu class component nằm sâu hơn trong thư mục `app/View/Components`, bạn có thể dùng ký tự `.` để biểu thị cấu trúc thư mục lồng nhau. Ví dụ, nếu component nằm tại `app/View/Components/Inputs/Button.php`, bạn có thể render như sau:

```blade
<x-inputs.button/>
```

Nếu muốn render component theo điều kiện, bạn có thể định nghĩa phương thức `shouldRender` trên class component. Nếu `shouldRender` trả về `false`, component sẽ không được render:

```php
use Illuminate\Support\Str;

/**
 * Whether the component should be rendered
 */
public function shouldRender(): bool
{
    return Str::length($this->message) > 0;
}
```

<a name="index-components"></a>
### Index component

Đôi khi các component thuộc cùng một nhóm và bạn muốn gom những component liên quan vào một thư mục. Ví dụ, hãy hình dung component "card" có cấu trúc class như sau:

```text
App\Views\Components\Card\Card
App\Views\Components\Card\Header
App\Views\Components\Card\Body
```

Vì component gốc `Card` nằm trong thư mục `Card`, bạn có thể nghĩ rằng phải render nó bằng `<x-card.card>`. Tuy nhiên, khi tên file component trùng với tên thư mục chứa component, Laravel tự động xem đó là component "gốc" và cho phép render mà không cần lặp lại tên thư mục:

```blade
<x-card>
    <x-card.header>...</x-card.header>
    <x-card.body>...</x-card.body>
</x-card>
```

<a name="passing-data-to-components"></a>
### Truyền dữ liệu vào component

Bạn có thể truyền dữ liệu vào Blade component bằng HTML attribute. Các giá trị nguyên thủy được viết cố định có thể truyền bằng chuỗi HTML attribute thông thường. Biểu thức và biến PHP nên được truyền qua attribute có ký tự `:` ở đầu:

```blade
<x-alert type="error" :message="$message"/>
```

Bạn nên định nghĩa toàn bộ data attribute của component trong constructor của class. Mọi public property trên component sẽ tự động khả dụng trong view của component. Không cần truyền dữ liệu vào view từ phương thức `render` của component:

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;
use Illuminate\View\View;

class Alert extends Component
{
    /**
     * Create the component instance.
     */
    public function __construct(
        public string $type,
        public string $message,
    ) {}

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View
    {
        return view('components.alert');
    }
}
```

Khi component được render, bạn có thể hiển thị giá trị của các public variable bằng cách echo trực tiếp biến theo tên:

```blade
<div class="alert alert-{{ $type }}">
    {{ $message }}
</div>
```

<a name="casing"></a>
#### Quy tắc viết hoa/thường

Đối số constructor của component nên được khai báo bằng `camelCase`, trong khi `kebab-case` được dùng khi tham chiếu tên đối số trong HTML attribute. Ví dụ, với constructor component sau:

```php
/**
 * Create the component instance.
 */
public function __construct(
    public string $alertType,
) {}
```

Đối số `$alertType` có thể được truyền vào component như sau:

```blade
<x-alert alert-type="danger" />
```

<a name="short-attribute-syntax"></a>
#### Cú pháp attribute rút gọn

Khi truyền attribute vào component, bạn cũng có thể sử dụng cú pháp "attribute rút gọn". Cú pháp này thường tiện lợi vì tên attribute thường trùng với tên biến tương ứng:

```blade
{{-- Short attribute syntax... --}}
<x-profile :$userId :$name />

{{-- Is equivalent to... --}}
<x-profile :user-id="$userId" :name="$name" />
```

<a name="escaping-attribute-rendering"></a>
#### Escape khi render attribute

Vì một số JavaScript framework như Alpine.js cũng sử dụng attribute có tiền tố dấu hai chấm, bạn có thể dùng tiền tố hai dấu hai chấm (`::`) để cho Blade biết rằng attribute đó không phải là một biểu thức PHP. Ví dụ, với component sau:

```blade
<x-button ::class="{ danger: isDeleting }">
    Submit
</x-button>
```

Blade sẽ render HTML sau:

```blade
<button :class="{ danger: isDeleting }">
    Submit
</button>
```

<a name="component-methods"></a>
#### Phương thức của component

Ngoài các public variable có thể sử dụng trong template của component, mọi public method của component cũng có thể được gọi. Ví dụ, giả sử một component có phương thức `isSelected`:

```php
/**
 * Determine if the given option is the currently selected option.
 */
public function isSelected(string $option): bool
{
    return $option === $this->selected;
}
```

Bạn có thể thực thi phương thức này từ template của component bằng cách gọi biến có tên tương ứng với tên phương thức:

```blade
<option {{ $isSelected($value) ? 'selected' : '' }} value="{{ $value }}">
    {{ $label }}
</option>
```

<a name="using-attributes-slots-within-component-class"></a>
#### Truy cập attribute và slot bên trong class component

Blade component cũng cho phép bạn truy cập tên component, các attribute và slot bên trong phương thức `render` của class. Tuy nhiên, để truy cập dữ liệu này, bạn nên trả về một closure từ phương thức `render` của component:

```php
use Closure;

/**
 * Get the view / contents that represent the component.
 */
public function render(): Closure
{
    return function () {
        return '<div {{ $attributes }}>Components content</div>';
    };
}
```

Closure được phương thức `render` của component trả về cũng có thể nhận mảng `$data` làm đối số duy nhất. Mảng này chứa một số phần tử cung cấp thông tin về component:

```php
return function (array $data) {
    // $data['componentName'];
    // $data['attributes'];
    // $data['slot'];

    return '<div {{ $attributes }}>Components content</div>';
}
```

> [!WARNING]
> Không bao giờ nên nhúng trực tiếp các phần tử trong mảng `$data` vào chuỗi Blade được phương thức `render` trả về, vì điều này có thể cho phép thực thi mã từ xa thông qua nội dung attribute độc hại.

`componentName` chính là tên được dùng trong HTML tag sau tiền tố `x-`. Vì vậy, `componentName` của `<x-alert />` sẽ là `alert`. Phần tử `attributes` chứa tất cả attribute có trên HTML tag. Phần tử `slot` là một instance của `Illuminate\Support\HtmlString` chứa nội dung slot của component.

Closure phải trả về một chuỗi. Nếu chuỗi trả về tương ứng với một view hiện có, view đó sẽ được render; nếu không, chuỗi trả về sẽ được đánh giá như một inline Blade view.

<a name="additional-dependencies"></a>
#### Dependency bổ sung

Nếu component cần các dependency từ [service container](/docs/{{version}}/container) của Laravel, bạn có thể khai báo chúng trước các data attribute của component và container sẽ tự động inject chúng:

```php
use App\Services\AlertCreator;

/**
 * Create the component instance.
 */
public function __construct(
    public AlertCreator $creator,
    public string $type,
    public string $message,
) {}
```

<a name="hiding-attributes-and-methods"></a>
#### Ẩn attribute / phương thức

Nếu muốn ngăn một số public method hoặc property được expose thành biến cho template của component, bạn có thể thêm chúng vào property mảng `$except` trên component:

```php
<?php

namespace App\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    /**
     * The properties / methods that should not be exposed to the component template.
     *
     * @var array
     */
    protected $except = ['type'];

    /**
     * Create the component instance.
     */
    public function __construct(
        public string $type,
    ) {}
}
```

<a name="component-attributes"></a>
### Attribute của component

Chúng ta đã xem cách truyền data attribute vào component; tuy nhiên, đôi khi bạn cần chỉ định thêm các HTML attribute, chẳng hạn `class`, không thuộc phần dữ liệu cần thiết để component hoạt động. Thông thường, bạn sẽ muốn truyền các attribute bổ sung này xuống phần tử gốc của template component. Ví dụ, giả sử chúng ta muốn render component `alert` như sau:

```blade
<x-alert type="error" :message="$message" class="mt-4"/>
```

Tất cả attribute không thuộc constructor của component sẽ tự động được thêm vào "attribute bag" của component. Attribute bag này tự động có sẵn trong component thông qua biến `$attributes`. Bạn có thể render toàn bộ các attribute bằng cách echo biến này:

```blade
<div {{ $attributes }}>
    <!-- Component content -->
</div>
```

> [!WARNING]
> Hiện tại, Blade chưa hỗ trợ sử dụng các directive như `@env` bên trong thẻ component. Ví dụ, `<x-alert :live="@env('production')"/>` sẽ không được biên dịch.

<a name="default-merged-attributes"></a>
#### Attribute mặc định / được merge

Đôi khi bạn cần chỉ định giá trị mặc định cho attribute hoặc merge thêm giá trị vào một số attribute của component. Để làm điều này, bạn có thể sử dụng phương thức `merge` của attribute bag. Phương thức này đặc biệt hữu ích khi định nghĩa một tập CSS class mặc định luôn được áp dụng cho component:

```blade
<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

Giả sử component này được sử dụng như sau:

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

HTML cuối cùng được render từ component sẽ như sau:

```blade
<div class="alert alert-error mb-4">
    <!-- Contents of the $message variable -->
</div>
```

<a name="conditionally-merge-classes"></a>
#### Merge class theo điều kiện

Đôi khi bạn muốn merge class khi một điều kiện nhất định là `true`. Bạn có thể thực hiện bằng phương thức `class`, phương thức này nhận một mảng class, trong đó key chứa class hoặc các class cần thêm còn value là một biểu thức boolean. Nếu phần tử mảng có key dạng số, phần tử đó luôn được đưa vào danh sách class được render:

```blade
<div {{ $attributes->class(['p-4', 'bg-red' => $hasError]) }}>
    {{ $message }}
</div>
```

Nếu cần merge các attribute khác vào component, bạn có thể chain phương thức `merge` sau phương thức `class`:

```blade
<button {{ $attributes->class(['p-4'])->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

> [!NOTE]
> Nếu cần biên dịch class theo điều kiện trên các phần tử HTML khác không nhận các attribute được merge, bạn có thể sử dụng [directive `@class`](#conditional-classes).

<a name="non-class-attribute-merging"></a>
#### Merge attribute không phải `class`

Khi merge các attribute không phải `class`, các giá trị truyền vào phương thức `merge` sẽ được xem là giá trị "mặc định" của attribute. Tuy nhiên, khác với attribute `class`, các attribute này sẽ không được merge với giá trị attribute được truyền vào mà sẽ bị ghi đè. Ví dụ, component `button` có thể được triển khai như sau:

```blade
<button {{ $attributes->merge(['type' => 'button']) }}>
    {{ $slot }}
</button>
```

Để render component button với `type` tùy chỉnh, bạn có thể chỉ định `type` khi sử dụng component. Nếu không chỉ định, `button` sẽ được dùng làm type mặc định:

```blade
<x-button type="submit">
    Submit
</x-button>
```

HTML được render của component `button` trong ví dụ này sẽ là:

```blade
<button type="submit">
    Submit
</button>
```

Nếu muốn một attribute khác `class` kết hợp giá trị mặc định với các giá trị được truyền vào, bạn có thể sử dụng phương thức `prepends`. Trong ví dụ này, attribute `data-controller` luôn bắt đầu bằng `profile-controller`, và mọi giá trị `data-controller` bổ sung được truyền vào sẽ được đặt sau giá trị mặc định này:

```blade
<div {{ $attributes->merge(['data-controller' => $attributes->prepends('profile-controller')]) }}>
    {{ $slot }}
</div>
```

<a name="filtering-attributes"></a>
#### Lấy và lọc attribute

Bạn có thể lọc attribute bằng phương thức `filter`. Phương thức này nhận một closure và closure phải trả về `true` nếu bạn muốn giữ attribute đó trong attribute bag:

```blade
{{ $attributes->filter(fn (string $value, string $key) => $key == 'foo') }}
```

Để thuận tiện, bạn có thể dùng phương thức `whereStartsWith` để lấy tất cả attribute có key bắt đầu bằng một chuỗi cho trước:

```blade
{{ $attributes->whereStartsWith('wire:model') }}
```

Ngược lại, phương thức `whereDoesntStartWith` có thể được dùng để loại bỏ tất cả attribute có key bắt đầu bằng một chuỗi cho trước:

```blade
{{ $attributes->whereDoesntStartWith('wire:model') }}
```

Với phương thức `first`, bạn có thể render attribute đầu tiên trong một attribute bag:

```blade
{{ $attributes->whereStartsWith('wire:model')->first() }}
```

Nếu muốn kiểm tra một attribute có tồn tại trên component hay không, bạn có thể dùng phương thức `has`. Phương thức này nhận tên attribute làm đối số duy nhất và trả về boolean cho biết attribute có tồn tại hay không:

```blade
@if ($attributes->has('class'))
    <div>Class attribute is present</div>
@endif
```

Nếu truyền một mảng vào phương thức `has`, phương thức sẽ xác định liệu tất cả attribute được chỉ định có tồn tại trên component hay không:

```blade
@if ($attributes->has(['name', 'class']))
    <div>All of the attributes are present</div>
@endif
```

Phương thức `hasAny` có thể được dùng để xác định liệu có bất kỳ attribute nào trong số các attribute được chỉ định tồn tại trên component hay không:

```blade
@if ($attributes->hasAny(['href', ':href', 'v-bind:href']))
    <div>One of the attributes is present</div>
@endif
```

Bạn có thể lấy giá trị của một attribute cụ thể bằng phương thức `get`:

```blade
{{ $attributes->get('class') }}
```

Phương thức `only` có thể được dùng để chỉ lấy các attribute có key được chỉ định:

```blade
{{ $attributes->only(['class']) }}
```

Phương thức `except` có thể được dùng để lấy tất cả attribute ngoại trừ các attribute có key được chỉ định:

```blade
{{ $attributes->except(['class']) }}
```

<a name="reserved-keywords"></a>
### Từ khóa dành riêng

Theo mặc định, một số từ khóa được dành riêng cho Blade sử dụng nội bộ khi render component. Các từ khóa sau không thể được định nghĩa làm public property hoặc tên phương thức trong component:

<div class="content-list" markdown="1">

- `data`
- `render`
- `resolve`
- `resolveView`
- `shouldRender`
- `view`
- `withAttributes`
- `withName`

</div>

<a name="slots"></a>
### Slot

Bạn thường cần truyền thêm nội dung vào component thông qua "slot". Slot của component được render bằng cách echo biến `$slot`. Để tìm hiểu khái niệm này, giả sử component `alert` có markup sau:

```blade
<!-- /resources/views/components/alert.blade.php -->

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

Chúng ta có thể truyền nội dung vào `slot` bằng cách đặt nội dung bên trong component:

```blade
<x-alert>
    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

Đôi khi component cần render nhiều slot khác nhau tại các vị trí khác nhau. Hãy sửa component alert để cho phép truyền thêm slot "title":

```blade
<!-- /resources/views/components/alert.blade.php -->

<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    {{ $slot }}
</div>
```

Bạn có thể định nghĩa nội dung của named slot bằng tag `x-slot`. Mọi nội dung không nằm trong một tag `x-slot` tường minh sẽ được truyền vào component qua biến `$slot`:

```xml
<x-alert>
    <x-slot:title>
        Server Error
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

Bạn có thể gọi phương thức `isEmpty` của slot để xác định slot có chứa nội dung hay không:

```blade
<span class="alert-title">{{ $title }}</span>

<div class="alert alert-danger">
    @if ($slot->isEmpty())
        This is default content if the slot is empty.
    @else
        {{ $slot }}
    @endif
</div>
```

Ngoài ra, phương thức `hasActualContent` có thể được dùng để xác định slot có chứa nội dung "thực sự" nào không phải HTML comment hay không:

```blade
@if ($slot->hasActualContent())
    The scope has non-comment content.
@endif
```

<a name="scoped-slots"></a>
#### Scoped Slot

Nếu từng sử dụng JavaScript framework như Vue, bạn có thể quen với "scoped slot", cho phép truy cập dữ liệu hoặc phương thức của component ngay bên trong slot. Trong Laravel, bạn có thể đạt được hành vi tương tự bằng cách định nghĩa public method hoặc property trên component và truy cập component trong slot thông qua biến `$component`. Trong ví dụ này, giả sử component `x-alert` có public method `formatAlert` được định nghĩa trên class component:

```blade
<x-alert>
    <x-slot:title>
        {{ $component->formatAlert('Server Error') }}
    </x-slot>

    <strong>Whoops!</strong> Something went wrong!
</x-alert>
```

<a name="slot-attributes"></a>
#### Attribute của slot

Tương tự Blade component, bạn có thể gán thêm [attribute](#component-attributes) cho slot, chẳng hạn tên CSS class:

```xml
<x-card class="shadow-sm">
    <x-slot:heading class="font-bold">
        Heading
    </x-slot>

    Content

    <x-slot:footer class="text-sm">
        Footer
    </x-slot>
</x-card>
```

Để thao tác với attribute của slot, bạn có thể truy cập property `attributes` của biến slot. Để biết thêm thông tin về cách làm việc với attribute, hãy xem tài liệu về [attribute của component](#component-attributes):

```blade
@props([
    'heading',
    'footer',
])

<div {{ $attributes->class(['border']) }}>
    <h1 {{ $heading->attributes->class(['text-lg']) }}>
        {{ $heading }}
    </h1>

    {{ $slot }}

    <footer {{ $footer->attributes->class(['text-gray-700']) }}>
        {{ $footer }}
    </footer>
</div>
```

<a name="inline-component-views"></a>
### View component inline

Với các component rất nhỏ, việc quản lý đồng thời class component và template view của component có thể khá rườm rà. Vì vậy, bạn có thể trả về trực tiếp markup của component từ phương thức `render`:

```php
/**
 * Get the view / contents that represent the component.
 */
public function render(): string
{
    return <<<'blade'
        <div class="alert alert-danger">
            {{ $slot }}
        </div>
    blade;
}
```

<a name="generating-inline-view-components"></a>
#### Tạo component sử dụng view inline

Để tạo component render một view inline, bạn có thể sử dụng tùy chọn `inline` khi chạy lệnh `make:component`:

```shell
php artisan make:component Alert --inline
```

<a name="dynamic-components"></a>
### Component động

Đôi khi bạn cần render một component nhưng chỉ đến runtime mới biết component nào cần được render. Trong trường hợp này, bạn có thể sử dụng component `dynamic-component` tích hợp sẵn của Laravel để render component dựa trên một giá trị hoặc biến tại runtime:

```blade
// $componentName = "secondary-button";

<x-dynamic-component :component="$componentName" class="mt-4" />
```

<a name="manually-registering-components"></a>
### Đăng ký component thủ công

> [!WARNING]
> Phần tài liệu sau về đăng ký component thủ công chủ yếu dành cho những người đang viết package Laravel có chứa view component. Nếu bạn không viết package, phần này có thể không liên quan đến bạn.

Khi xây dựng component cho chính ứng dụng của bạn, Laravel tự động phát hiện component trong các thư mục `app/View/Components` và `resources/views/components`.

Tuy nhiên, nếu bạn đang xây dựng package sử dụng Blade component hoặc đặt component trong các thư mục không theo convention, bạn cần đăng ký thủ công class component và alias thẻ HTML của nó để Laravel biết nơi tìm component. Thông thường, bạn nên đăng ký component trong phương thức `boot` của service provider thuộc package:

```php
use Illuminate\Support\Facades\Blade;
use VendorPackage\View\Components\AlertComponent;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::component('package-alert', AlertComponent::class);
}
```

Sau khi component được đăng ký, bạn có thể render nó bằng alias của thẻ:

```blade
<x-package-alert/>
```

#### Tự động tải component của package

Ngoài ra, bạn có thể sử dụng phương thức `componentNamespace` để tự động tải các class component theo convention. Ví dụ, package `Nightshade` có thể có các component `Calendar` và `ColorPicker` nằm trong namespace `Package\Views\Components`:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap your package's services.
 */
public function boot(): void
{
    Blade::componentNamespace('Nightshade\\Views\\Components', 'nightshade');
}
```

Điều này cho phép sử dụng component của package thông qua vendor namespace với cú pháp `package-name::`:

```blade
<x-nightshade::calendar />
<x-nightshade::color-picker />
```

Blade sẽ tự động xác định class liên kết với component bằng cách chuyển tên component sang PascalCase. Các thư mục con cũng được hỗ trợ thông qua ký hiệu dấu chấm.

<a name="anonymous-components"></a>
## Component ẩn danh

Tương tự component inline, component ẩn danh cung cấp cơ chế quản lý component chỉ bằng một file. Tuy nhiên, component ẩn danh sử dụng một file view duy nhất và không có class đi kèm. Để định nghĩa component ẩn danh, bạn chỉ cần đặt một Blade template trong thư mục `resources/views/components`. Ví dụ, giả sử bạn đã định nghĩa component tại `resources/views/components/alert.blade.php`, bạn có thể render nó như sau:

```blade
<x-alert/>
```

Bạn có thể sử dụng ký tự `.` để biểu thị component nằm sâu hơn trong thư mục `components`. Ví dụ, nếu component được định nghĩa tại `resources/views/components/inputs/button.blade.php`, bạn có thể render như sau:

```blade
<x-inputs.button/>
```

Để tạo component ẩn danh bằng Artisan, bạn có thể sử dụng cờ `--view` khi gọi lệnh `make:component`:

```shell
php artisan make:component forms.input --view
```

Lệnh trên sẽ tạo file Blade tại `resources/views/components/forms/input.blade.php`, có thể được render dưới dạng component bằng `<x-forms.input />`.

<a name="anonymous-index-components"></a>
### Component index ẩn danh

Đôi khi, khi một component gồm nhiều Blade template, bạn có thể muốn nhóm các template của component đó trong cùng một thư mục. Ví dụ, hãy hình dung một component "accordion" có cấu trúc thư mục sau:

```text
/resources/views/components/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

Cấu trúc thư mục này cho phép bạn render component accordion và item của nó như sau:

```blade
<x-accordion>
    <x-accordion.item>
        ...
    </x-accordion.item>
</x-accordion>
```

Tuy nhiên, để render component accordion bằng `x-accordion`, chúng ta buộc phải đặt template component "index" của accordion trong thư mục `resources/views/components` thay vì đặt nó bên trong thư mục `accordion` cùng các template liên quan khác.

May mắn là Blade cho phép bạn đặt một file có tên trùng với thư mục component ngay bên trong chính thư mục đó. Khi template này tồn tại, nó có thể được render như phần tử "gốc" của component dù đang nằm trong một thư mục con. Vì vậy, chúng ta vẫn có thể sử dụng cú pháp Blade như ví dụ trên, nhưng điều chỉnh cấu trúc thư mục như sau:

```text
/resources/views/components/accordion/accordion.blade.php
/resources/views/components/accordion/item.blade.php
```

<a name="data-properties-attributes"></a>
### Property dữ liệu / Attribute

Vì component ẩn danh không có class đi kèm, bạn có thể thắc mắc làm thế nào để phân biệt dữ liệu nào nên được truyền vào component dưới dạng biến và attribute nào nên được đặt trong [attribute bag](#component-attributes) của component.

Bạn có thể chỉ định attribute nào được xem là biến dữ liệu bằng directive `@props` ở đầu Blade template của component. Mọi attribute khác trên component sẽ có sẵn thông qua attribute bag. Nếu muốn cung cấp giá trị mặc định cho một biến dữ liệu, hãy dùng tên biến làm key của mảng và giá trị mặc định làm value:

```blade
<!-- /resources/views/components/alert.blade.php -->

@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

Với định nghĩa component ở trên, chúng ta có thể render component như sau:

```blade
<x-alert type="error" :message="$message" class="mb-4"/>
```

<a name="accessing-parent-data"></a>
### Truy cập dữ liệu của component cha

Đôi khi bạn muốn truy cập dữ liệu của component cha từ bên trong component con. Trong trường hợp này, bạn có thể sử dụng directive `@aware`. Ví dụ, hãy hình dung chúng ta đang xây dựng một menu phức tạp gồm component cha `<x-menu>` và component con `<x-menu.item>`:

```blade
<x-menu color="purple">
    <x-menu.item>...</x-menu.item>
    <x-menu.item>...</x-menu.item>
</x-menu>
```

Component `<x-menu>` có thể được triển khai như sau:

```blade
<!-- /resources/views/components/menu/index.blade.php -->

@props(['color' => 'gray'])

<ul {{ $attributes->merge(['class' => 'bg-'.$color.'-200']) }}>
    {{ $slot }}
</ul>
```

Vì prop `color` chỉ được truyền vào component cha (`<x-menu>`), nó sẽ không có sẵn bên trong `<x-menu.item>`. Tuy nhiên, nếu sử dụng directive `@aware`, chúng ta cũng có thể làm cho giá trị này khả dụng trong `<x-menu.item>`:

```blade
<!-- /resources/views/components/menu/item.blade.php -->

@aware(['color' => 'gray'])

<li {{ $attributes->merge(['class' => 'text-'.$color.'-800']) }}>
    {{ $slot }}
</li>
```

> [!WARNING]
> Directive `@aware` không thể truy cập dữ liệu của component cha nếu dữ liệu đó không được truyền rõ ràng vào component cha thông qua HTML attribute. Các giá trị mặc định của `@props` không được truyền rõ ràng vào component cha cũng không thể được `@aware` truy cập.

<a name="anonymous-component-paths"></a>
### Đường dẫn component ẩn danh

Như đã đề cập, component ẩn danh thường được định nghĩa bằng cách đặt Blade template trong thư mục `resources/views/components`. Tuy nhiên, đôi khi bạn có thể muốn đăng ký thêm các đường dẫn component ẩn danh khác với Laravel bên cạnh đường dẫn mặc định.

Phương thức `anonymousComponentPath` nhận "path" đến vị trí component ẩn danh làm đối số thứ nhất và một "namespace" tùy chọn cho các component làm đối số thứ hai. Thông thường, phương thức này nên được gọi từ `boot` của một [service provider](/docs/{{version}}/providers) trong ứng dụng:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Blade::anonymousComponentPath(__DIR__.'/../components');
}
```

Khi đường dẫn component được đăng ký mà không chỉ định prefix như ví dụ trên, các component cũng có thể được render trong Blade mà không cần prefix tương ứng. Ví dụ, nếu component `panel.blade.php` tồn tại trong đường dẫn đã đăng ký ở trên, bạn có thể render như sau:

```blade
<x-panel />
```

Bạn có thể cung cấp "namespace" dạng prefix làm đối số thứ hai cho phương thức `anonymousComponentPath`:

```php
Blade::anonymousComponentPath(__DIR__.'/../components', 'dashboard');
```

Khi có prefix, các component trong "namespace" đó có thể được render bằng cách thêm namespace của component vào trước tên component:

```blade
<x-dashboard::panel />
```

<a name="building-layouts"></a>
## Xây dựng layout

<a name="layouts-using-components"></a>
### Layout sử dụng component

Hầu hết ứng dụng web duy trì cùng một bố cục tổng thể trên nhiều trang. Nếu phải lặp lại toàn bộ HTML của layout trong mọi view, ứng dụng sẽ rất cồng kềnh và khó bảo trì. May mắn là chúng ta có thể định nghĩa layout này dưới dạng một [Blade component](#components) duy nhất rồi sử dụng xuyên suốt ứng dụng.

<a name="defining-the-layout-component"></a>
#### Định nghĩa layout component

Ví dụ, hãy hình dung chúng ta đang xây dựng ứng dụng danh sách "todo". Ta có thể định nghĩa component `layout` như sau:

```blade
<!-- resources/views/components/layout.blade.php -->

<html>
    <head>
        <title>{{ $title ?? 'Todo Manager' }}</title>
    </head>
    <body>
        <h1>Todos</h1>
        <hr/>
        {{ $slot }}
    </body>
</html>
```

<a name="applying-the-layout-component"></a>
#### Áp dụng layout component

Sau khi component `layout` được định nghĩa, chúng ta có thể tạo Blade view sử dụng component này. Trong ví dụ sau, ta sẽ định nghĩa một view đơn giản để hiển thị danh sách task:

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    @foreach ($tasks as $task)
        <div>{{ $task }}</div>
    @endforeach
</x-layout>
```

Hãy nhớ rằng nội dung được đưa vào component sẽ được cung cấp cho biến `$slot` mặc định bên trong component `layout`. Như bạn có thể thấy, `layout` cũng sử dụng slot `$title` nếu được cung cấp; nếu không, tiêu đề mặc định sẽ được hiển thị. Chúng ta có thể truyền tiêu đề tùy chỉnh từ view danh sách task bằng cú pháp slot tiêu chuẩn đã trình bày trong [tài liệu component](#components):

```blade
<!-- resources/views/tasks.blade.php -->

<x-layout>
    <x-slot:title>
        Custom Title
    </x-slot>

    @foreach ($tasks as $task)
        <div>{{ $task }}</div>
    @endforeach
</x-layout>
```

Sau khi đã định nghĩa layout và view danh sách task, chúng ta chỉ cần trả về view `task` từ một route:

```php
use App\Models\Task;

Route::get('/tasks', function () {
    return view('tasks', ['tasks' => Task::all()]);
});
```

<a name="layouts-using-template-inheritance"></a>
### Layout sử dụng kế thừa template

<a name="defining-a-layout"></a>
#### Định nghĩa layout

Layout cũng có thể được tạo bằng "kế thừa template". Đây từng là cách chính để xây dựng ứng dụng trước khi [component](#components) được giới thiệu.

Để bắt đầu, hãy xem một ví dụ đơn giản. Trước tiên, chúng ta sẽ xem xét layout của một trang. Vì hầu hết ứng dụng web duy trì cùng một bố cục tổng thể trên nhiều trang, việc định nghĩa layout này thành một Blade view duy nhất sẽ thuận tiện hơn:

```blade
<!-- resources/views/layouts/app.blade.php -->

<html>
    <head>
        <title>App Name - @yield('title')</title>
    </head>
    <body>
        @section('sidebar')
            This is the master sidebar.
        @show

        <div class="container">
            @yield('content')
        </div>
    </body>
</html>
```

Như bạn thấy, file này chứa markup HTML thông thường. Tuy nhiên, hãy chú ý đến các directive `@section` và `@yield`. Đúng như tên gọi, `@section` định nghĩa một phần nội dung, còn `@yield` được dùng để hiển thị nội dung của một section cụ thể.

Sau khi đã định nghĩa layout cho ứng dụng, hãy định nghĩa một trang con kế thừa layout đó.

<a name="extending-a-layout"></a>
#### Kế thừa layout

Khi định nghĩa view con, hãy sử dụng directive Blade `@extends` để chỉ định layout mà view con sẽ "kế thừa". Các view kế thừa Blade layout có thể đưa nội dung vào các section của layout bằng directive `@section`. Như trong ví dụ trên, nội dung của các section này sẽ được hiển thị trong layout bằng `@yield`:

```blade
<!-- resources/views/child.blade.php -->

@extends('layouts.app')

@section('title', 'Page Title')

@section('sidebar')
    @@parent

    <p>This is appended to the master sidebar.</p>
@endsection

@section('content')
    <p>This is my body content.</p>
@endsection
```

Trong ví dụ này, section `sidebar` sử dụng directive `@@parent` để nối thêm nội dung vào sidebar của layout thay vì ghi đè. Directive `@@parent` sẽ được thay thế bằng nội dung tương ứng của layout khi view được render.

> [!NOTE]
> Khác với ví dụ trước, section `sidebar` này kết thúc bằng `@endsection` thay vì `@show`. Directive `@endsection` chỉ định nghĩa section, trong khi `@show` vừa định nghĩa vừa **hiển thị ngay** section đó.

Directive `@yield` cũng nhận giá trị mặc định làm tham số thứ hai. Giá trị này sẽ được render nếu section cần hiển thị chưa được định nghĩa:

```blade
@yield('content', 'Default content')
```

<a name="forms"></a>
## Biểu mẫu

<a name="csrf-field"></a>
### Trường CSRF

Mỗi khi định nghĩa một HTML form trong ứng dụng, bạn nên thêm trường CSRF token ẩn để middleware [bảo vệ CSRF](/docs/{{version}}/csrf) có thể xác thực request. Bạn có thể dùng directive Blade `@csrf` để tạo trường token:

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

<a name="method-field"></a>
### Trường phương thức

Vì HTML form không thể gửi trực tiếp request `PUT`, `PATCH` hoặc `DELETE`, bạn cần thêm trường `_method` ẩn để giả lập các HTTP verb này. Directive Blade `@method` có thể tạo trường đó cho bạn:

```blade
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

<a name="validation-errors"></a>
### Lỗi validation

Directive `@error` có thể được dùng để nhanh chóng kiểm tra xem một attribute có [thông báo lỗi validation](/docs/{{version}}/validation#quick-displaying-the-validation-errors) hay không. Bên trong `@error`, bạn có thể xuất biến `$message` để hiển thị thông báo lỗi:

```blade
<!-- /resources/views/post/create.blade.php -->

<label for="title">Post Title</label>

<input
    id="title"
    type="text"
    class="@error('title') is-invalid @enderror"
/>

@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

Vì directive `@error` được biên dịch thành câu lệnh "if", bạn có thể sử dụng `@else` để render nội dung khi attribute không có lỗi:

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email') is-invalid @else is-valid @enderror"
/>
```

Bạn có thể truyền [tên của một error bag cụ thể](/docs/{{version}}/validation#named-error-bags) làm tham số thứ hai cho directive `@error` để lấy thông báo lỗi validation trên các trang chứa nhiều form:

```blade
<!-- /resources/views/auth.blade.php -->

<label for="email">Email address</label>

<input
    id="email"
    type="email"
    class="@error('email', 'login') is-invalid @enderror"
/>

@error('email', 'login')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror
```

<a name="stacks"></a>
## Stack

Blade cho phép bạn đẩy nội dung vào các stack có tên, sau đó render chúng ở vị trí khác trong một view hoặc layout. Điều này đặc biệt hữu ích khi chỉ định các thư viện JavaScript mà view con cần:

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

Nếu muốn `@push` nội dung khi một biểu thức boolean được đánh giá là `true`, bạn có thể sử dụng directive `@pushIf`:

```blade
@pushIf($shouldPush, 'scripts')
    <script src="/example.js"></script>
@endPushIf
```

Bạn có thể push vào một stack bao nhiêu lần tùy ý. Để render toàn bộ nội dung stack, hãy truyền tên stack cho directive `@stack`:

```blade
<head>
    <!-- Head Contents -->

    @stack('scripts')
</head>
```

Nếu muốn chèn nội dung vào đầu stack, hãy sử dụng directive `@prepend`:

```blade
@push('scripts')
    This will be second...
@endpush

// Later...

@prepend('scripts')
    This will be first...
@endprepend
```

Directive `@hasstack` có thể được dùng để xác định một stack có rỗng hay không:

```blade
@hasstack('list')
    <ul>
        @stack('list')
    </ul>
@endif
```

<a name="service-injection"></a>
## Inject service

Directive `@inject` có thể được dùng để lấy một service từ [service container](/docs/{{version}}/container) của Laravel. Đối số thứ nhất truyền vào `@inject` là tên biến sẽ chứa service, còn đối số thứ hai là tên class hoặc interface của service bạn muốn resolve:

```blade
@inject('metrics', 'App\Services\MetricsService')

<div>
    Monthly Revenue: {{ $metrics->monthlyRevenue() }}.
</div>
```

<a name="rendering-inline-blade-templates"></a>
## Render Blade template inline

Đôi khi bạn cần chuyển một chuỗi Blade template thô thành HTML hợp lệ. Bạn có thể thực hiện việc này bằng phương thức `render` của facade `Blade`. Phương thức `render` nhận chuỗi Blade template và một mảng dữ liệu tùy chọn để cung cấp cho template:

```php
use Illuminate\Support\Facades\Blade;

return Blade::render('Hello, {{ $name }}', ['name' => 'Julian Bashir']);
```

Laravel render Blade template inline bằng cách ghi chúng vào thư mục `storage/framework/views`. Nếu muốn Laravel xóa các file tạm này sau khi render Blade template, bạn có thể truyền đối số `deleteCachedView` cho phương thức:

```php
return Blade::render(
    'Hello, {{ $name }}',
    ['name' => 'Julian Bashir'],
    deleteCachedView: true
);
```

<a name="rendering-blade-fragments"></a>
## Render Blade fragment

Khi sử dụng frontend framework như [Turbo](https://turbo.hotwired.dev/) và [htmx](https://htmx.org/), đôi khi bạn chỉ cần trả về một phần của Blade template trong HTTP response. Blade "fragment" cho phép bạn làm điều đó. Để bắt đầu, hãy đặt một phần Blade template giữa các directive `@fragment` và `@endfragment`:

```blade
@fragment('user-list')
    <ul>
        @foreach ($users as $user)
            <li>{{ $user->name }}</li>
        @endforeach
    </ul>
@endfragment
```

Sau đó, khi render view sử dụng template này, bạn có thể gọi phương thức `fragment` để chỉ định rằng HTTP response trả về chỉ chứa fragment đã chọn:

```php
return view('dashboard', ['users' => $users])->fragment('user-list');
```

Phương thức `fragmentIf` cho phép trả về có điều kiện một fragment của view dựa trên điều kiện cho trước. Nếu điều kiện không thỏa mãn, toàn bộ view sẽ được trả về:

```php
return view('dashboard', ['users' => $users])
    ->fragmentIf($request->hasHeader('HX-Request'), 'user-list');
```

Các phương thức `fragments` và `fragmentsIf` cho phép trả về nhiều fragment của view trong response. Các fragment sẽ được nối lại với nhau:

```php
view('dashboard', ['users' => $users])
    ->fragments(['user-list', 'comment-list']);

view('dashboard', ['users' => $users])
    ->fragmentsIf(
        $request->hasHeader('HX-Request'),
        ['user-list', 'comment-list']
    );
```

<a name="extending-blade"></a>
## Mở rộng Blade

Blade cho phép bạn định nghĩa directive tùy chỉnh bằng phương thức `directive`. Khi Blade compiler gặp directive tùy chỉnh, nó sẽ gọi callback được cung cấp với biểu thức nằm trong directive đó.

Ví dụ sau tạo directive `@datetime($var)` để định dạng `$var`, trong đó `$var` phải là một instance của `DateTime`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
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
        Blade::directive('datetime', function (string $expression) {
            return "<?php echo ($expression)->format('m/d/Y H:i'); ?>";
        });
    }
}
```

Như bạn thấy, phương thức `format` sẽ được chain vào biểu thức được truyền cho directive. Vì vậy, trong ví dụ này, PHP cuối cùng được directive sinh ra sẽ là:

```php
<?php echo ($var)->format('m/d/Y H:i'); ?>
```

> [!WARNING]
> Sau khi cập nhật logic của một Blade directive, bạn cần xóa toàn bộ Blade view đã cache. Bạn có thể xóa chúng bằng lệnh Artisan `view:clear`.

<a name="custom-echo-handlers"></a>
### Trình xử lý echo tùy chỉnh

Nếu bạn "echo" một object bằng Blade, phương thức `__toString` của object sẽ được gọi. [__toString](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) là một trong các "magic method" tích hợp sẵn của PHP. Tuy nhiên, đôi khi bạn không kiểm soát được `__toString` của một class, chẳng hạn khi class đó thuộc thư viện bên thứ ba.

Trong các trường hợp này, Blade cho phép đăng ký trình xử lý echo tùy chỉnh cho loại object cụ thể. Để thực hiện, hãy gọi phương thức `stringable` của Blade. Phương thức này nhận một closure; closure cần type-hint loại object mà nó chịu trách nhiệm render. Thông thường, `stringable` nên được gọi trong phương thức `boot` của class `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Blade;
use Money\Money;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Blade::stringable(function (Money $money) {
        return $money->formatTo('en_GB');
    });
}
```

Sau khi trình xử lý echo tùy chỉnh được định nghĩa, bạn có thể trực tiếp echo object trong Blade template:

```blade
Cost: {{ $money }}
```

<a name="custom-if-statements"></a>
### Câu lệnh if tùy chỉnh

Việc lập trình một directive tùy chỉnh đôi khi phức tạp hơn mức cần thiết nếu bạn chỉ muốn định nghĩa một điều kiện tùy chỉnh đơn giản. Vì vậy, Blade cung cấp phương thức `Blade::if`, cho phép nhanh chóng định nghĩa directive điều kiện tùy chỉnh bằng closure. Ví dụ, hãy định nghĩa một điều kiện kiểm tra "disk" mặc định đã cấu hình cho ứng dụng. Ta có thể thực hiện trong phương thức `boot` của `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Blade;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Blade::if('disk', function (string $value) {
        return config('filesystems.default') === $value;
    });
}
```

Sau khi điều kiện tùy chỉnh được định nghĩa, bạn có thể sử dụng nó trong các template:

```blade
@disk('local')
    <!-- The application is using the local disk... -->
@elsedisk('s3')
    <!-- The application is using the s3 disk... -->
@else
    <!-- The application is using some other disk... -->
@enddisk

@unlessdisk('local')
    <!-- The application is not using the local disk... -->
@enddisk
```
