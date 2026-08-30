# Context

<a name="introduction"></a>
## Giới thiệu
Khả năng "context" của Laravel cho phép bạn ghi nhận, truy xuất và chia sẻ thông tin xuyên suốt các request, job và command đang chạy trong ứng dụng. Thông tin này cũng được đính kèm vào log do ứng dụng ghi ra, giúp bạn hiểu rõ hơn lịch sử thực thi xảy ra trước một log entry và truy vết luồng xử lý trong hệ thống phân tán.
<a name="how-it-works"></a>
### Cơ chế hoạt động
Cách dễ nhất để hiểu context của Laravel là quan sát nó hoạt động cùng hệ thống logging tích hợp sẵn. Trước tiên, bạn có thể [thêm thông tin vào context](#capturing-context) bằng facade `Context`. Trong ví dụ này, một [middleware](/middleware) sẽ thêm URL của request và một trace ID duy nhất vào context cho mỗi request đi vào ứng dụng:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AddContext
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        Context::add('url', $request->url());
        Context::add('trace_id', Str::uuid()->toString());

        return $next($request);
    }
}
```
Thông tin được thêm vào context sẽ tự động được đính kèm dưới dạng metadata cho mọi [log entry](/logging) được ghi trong request. Việc tách context thành metadata giúp phân biệt dữ liệu được truyền trực tiếp cho từng log entry với dữ liệu dùng chung qua `Context`. Ví dụ, giả sử ứng dụng ghi log như sau:
```php
Log::info('User authenticated.', ['auth_id' => Auth::id()]);
```
Log được ghi sẽ chứa `auth_id` truyền trực tiếp vào log entry, đồng thời có thêm `url` và `trace_id` từ context dưới dạng metadata:
```text
User authenticated. {"auth_id":27} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```
Thông tin trong context cũng được chuyển tiếp cho các job được dispatch vào queue. Ví dụ, giả sử ta dispatch job `ProcessPodcast` sau khi thêm một số dữ liệu vào context:
```php
// In our middleware...
Context::add('url', $request->url());
Context::add('trace_id', Str::uuid()->toString());

// In our controller...
ProcessPodcast::dispatch($podcast);
```
Khi job được dispatch, toàn bộ thông tin hiện có trong context được capture và gửi kèm job. Khi job bắt đầu chạy, dữ liệu này được hydrate trở lại context hiện tại. Vì vậy, nếu method `handle` của job ghi log:
```php
class ProcessPodcast implements ShouldQueue
{
    use Queueable;

    // ...

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Processing podcast.', [
            'podcast_id' => $this->podcast->id,
        ]);

        // ...
    }
}
```
Log kết quả sẽ chứa cả thông tin đã được thêm vào context trong request ban đầu đã dispatch job:
```text
Processing podcast. {"podcast_id":95} {"url":"https://example.com/login","trace_id":"e04e1a11-e75c-4db3-b5b5-cfef4ef56697"}
```
Dù các ví dụ trên tập trung vào logging, phần tài liệu tiếp theo sẽ cho thấy context còn cho phép chia sẻ dữ liệu qua ranh giới HTTP request / queued job, cũng như lưu [hidden context data](#hidden-context) không được ghi vào log.
<a name="capturing-context"></a>
## Ghi dữ liệu vào context
Bạn có thể lưu thông tin vào context hiện tại bằng method `add` của facade `Context`:
```php
use Illuminate\Support\Facades\Context;

Context::add('key', 'value');
```
Để thêm nhiều giá trị cùng lúc, truyền một associative array vào method `add`:
```php
Context::add([
    'first_key' => 'value',
    'second_key' => 'value',
]);
```
Method `add` sẽ ghi đè giá trị hiện có nếu trùng key. Nếu chỉ muốn thêm dữ liệu khi key chưa tồn tại, hãy dùng `addIf`:
```php
Context::add('key', 'first');

Context::get('key');
// "first"

Context::addIf('key', 'second');

Context::get('key');
// "first"
```
Context cũng cung cấp các method tiện lợi để tăng hoặc giảm giá trị của một key. Cả hai method đều nhận ít nhất một đối số là key cần theo dõi. Đối số thứ hai có thể được dùng để chỉ định lượng tăng hoặc giảm:
```php
Context::increment('records_added');
Context::increment('records_added', 5);

Context::decrement('records_added');
Context::decrement('records_added', 5);
```

<a name="conditional-context"></a>
#### Context có điều kiện
Method `when` cho phép thêm dữ liệu vào context dựa trên một điều kiện. Closure đầu tiên được gọi khi điều kiện là `true`; closure thứ hai được gọi khi điều kiện là `false`:
```php
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Context;

Context::when(
    Auth::user()->isAdmin(),
    fn ($context) => $context->add('permissions', Auth::user()->permissions),
    fn ($context) => $context->add('permissions', []),
);
```

<a name="scoped-context"></a>
#### Context theo phạm vi
Method `scope` cho phép tạm thời thay đổi context trong thời gian thực thi một callback, rồi khôi phục context về trạng thái ban đầu khi callback kết thúc. Bạn cũng có thể truyền thêm dữ liệu cần merge vào context trong lúc closure chạy thông qua đối số thứ hai và thứ ba.
```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\Log;

Context::add('trace_id', 'abc-999');
Context::addHidden('user_id', 123);

Context::scope(
    function () {
        Context::add('action', 'adding_friend');

        $userId = Context::getHidden('user_id');

        Log::debug("Adding user [{$userId}] to friends list.");
        // Adding user [987] to friends list.  {"trace_id":"abc-999","user_name":"taylor_otwell","action":"adding_friend"}
    },
    data: ['user_name' => 'taylor_otwell'],
    hidden: ['user_id' => 987],
);

Context::all();
// [
//     'trace_id' => 'abc-999',
// ]

Context::allHidden();
// [
//     'user_id' => 123,
// ]
```
> [!WARNING]
> Nếu một object nằm trong context bị thay đổi bên trong scoped closure, mutation đó vẫn được phản ánh ra bên ngoài scope.
<a name="stacks"></a>
### Stacks
Context cho phép tạo "stack" — danh sách dữ liệu được lưu theo đúng thứ tự thêm vào. Bạn có thể đẩy dữ liệu vào stack bằng method `push`:
```php
use Illuminate\Support\Facades\Context;

Context::push('breadcrumbs', 'first_value');

Context::push('breadcrumbs', 'second_value', 'third_value');

Context::get('breadcrumbs');
// [
//     'first_value',
//     'second_value',
//     'third_value',
// ]
```
Stack hữu ích khi cần ghi lại lịch sử xảy ra trong một request. Ví dụ, bạn có thể tạo event listener để push vào stack mỗi khi một query được thực thi, lưu SQL và thời gian chạy query dưới dạng tuple:
```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\DB;

// In AppServiceProvider.php...
DB::listen(function ($event) {
    Context::push('queries', [$event->time, $event->sql]);
});
```
Bạn có thể kiểm tra một giá trị có nằm trong stack hay không bằng các method `stackContains` và `hiddenStackContains`:
```php
if (Context::stackContains('breadcrumbs', 'first_value')) {
    //
}

if (Context::hiddenStackContains('secrets', 'first_value')) {
    //
}
```
`stackContains` và `hiddenStackContains` cũng nhận closure làm đối số thứ hai, giúp kiểm soát chi tiết hơn cách so sánh giá trị:
```php
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Str;

return Context::stackContains('breadcrumbs', function ($value) {
    return Str::startsWith($value, 'query_');
});
```

<a name="retrieving-context"></a>
## Lấy dữ liệu từ context
Bạn có thể lấy thông tin từ context bằng method `get` của facade `Context`:
```php
use Illuminate\Support\Facades\Context;

$value = Context::get('key');
```
Các method `only` và `except` có thể dùng để lấy một tập con dữ liệu trong context:
```php
$data = Context::only(['first_key', 'second_key']);

$data = Context::except(['first_key']);
```
Method `pull` lấy dữ liệu từ context và đồng thời xóa dữ liệu đó ngay lập tức:
```php
$value = Context::pull('key');
```
Nếu dữ liệu context được lưu trong một [stack](#stacks), bạn có thể lấy và loại bỏ phần tử cuối stack bằng method `pop`:
```php
Context::push('breadcrumbs', 'first_value', 'second_value');

Context::pop('breadcrumbs');
// second_value

Context::get('breadcrumbs');
// ['first_value']
```
Các method `remember` và `rememberHidden` cho phép lấy dữ liệu từ context; nếu key chưa tồn tại, context sẽ được gán bằng giá trị trả về từ closure được cung cấp:
```php
$permissions = Context::remember(
    'user-permissions',
    fn () => $user->permissions,
);
```
Nếu muốn lấy toàn bộ dữ liệu đang lưu trong context, hãy gọi method `all`:
```php
$data = Context::all();
```

<a name="determining-item-existence"></a>
### Kiểm tra sự tồn tại của dữ liệu
Bạn có thể dùng `has` và `missing` để xác định context có lưu giá trị cho key đã cho hay không:
```php
use Illuminate\Support\Facades\Context;

if (Context::has('key')) {
    // ...
}

if (Context::missing('key')) {
    // ...
}
```
Method `has` trả về `true` bất kể giá trị được lưu là gì. Vì vậy, một key có giá trị `null` vẫn được xem là đang tồn tại:
```php
Context::add('key', null);

Context::has('key');
// true
```

<a name="removing-context"></a>
## Xóa dữ liệu khỏi context
Method `forget` dùng để xóa một key cùng giá trị của nó khỏi context hiện tại:
```php
use Illuminate\Support\Facades\Context;

Context::add(['first_key' => 1, 'second_key' => 2]);

Context::forget('first_key');

Context::all();

// ['second_key' => 2]
```
Bạn có thể xóa nhiều key cùng lúc bằng cách truyền một array vào `forget`:
```php
Context::forget(['first_key', 'second_key']);
```

<a name="hidden-context"></a>
## Hidden Context
Context cho phép lưu dữ liệu "ẩn". Dữ liệu này không được đính kèm vào log và cũng không thể truy cập bằng các method đọc dữ liệu thông thường đã trình bày phía trên. Laravel cung cấp một nhóm method riêng để thao tác với hidden context:
```php
use Illuminate\Support\Facades\Context;

Context::addHidden('key', 'value');

Context::getHidden('key');
// 'value'

Context::get('key');
// null
```
Các method "hidden" có chức năng tương ứng với các method không ẩn đã trình bày ở trên:
```php
Context::addHidden(/* ... */);
Context::addHiddenIf(/* ... */);
Context::pushHidden(/* ... */);
Context::getHidden(/* ... */);
Context::pullHidden(/* ... */);
Context::popHidden(/* ... */);
Context::onlyHidden(/* ... */);
Context::exceptHidden(/* ... */);
Context::allHidden(/* ... */);
Context::hasHidden(/* ... */);
Context::missingHidden(/* ... */);
Context::forgetHidden(/* ... */);
```

<a name="events"></a>
## Sự kiện
Context dispatch hai event cho phép bạn can thiệp vào quá trình hydration và dehydration của context.
Để hình dung cách dùng các event này, giả sử middleware của ứng dụng đặt giá trị cấu hình `app.locale` dựa trên header `Accept-Language` của HTTP request. Các event của Context cho phép capture giá trị này trong request và khôi phục nó khi chạy queue job, nhờ đó notification gửi từ queue vẫn dùng đúng `app.locale`. Ta có thể kết hợp context events với dữ liệu [hidden](#hidden-context) để thực hiện điều đó.
<a name="dehydrating"></a>
### Dehydrating
Mỗi khi một job được dispatch vào queue, dữ liệu context được "dehydrate" và capture cùng payload của job. Method `Context::dehydrating` cho phép đăng ký một closure sẽ được gọi trong quá trình dehydration. Bên trong closure, bạn có thể thay đổi dữ liệu sẽ được chia sẻ với queued job.
Thông thường, callback `dehydrating` nên được đăng ký trong method `boot` của class `AppServiceProvider`:
```php
use Illuminate\Log\Context\Repository;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Context;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Context::dehydrating(function (Repository $context) {
        $context->addHidden('locale', Config::get('app.locale'));
    });
}
```
> [!NOTE]
> Không nên dùng facade `Context` bên trong callback `dehydrating`, vì thao tác đó sẽ thay đổi context của process hiện tại. Hãy chỉ thay đổi repository được truyền vào callback.
<a name="hydrated"></a>
### Hydrated
Khi queued job bắt đầu chạy, context đã được chia sẻ cùng job sẽ được "hydrate" trở lại context hiện tại. Method `Context::hydrated` cho phép đăng ký closure được gọi trong quá trình hydration.
Thông thường, callback `hydrated` nên được đăng ký trong method `boot` của class `AppServiceProvider`:
```php
use Illuminate\Log\Context\Repository;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Context;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Context::hydrated(function (Repository $context) {
        if ($context->hasHidden('locale')) {
            Config::set('app.locale', $context->getHidden('locale'));
        }
    });
}
```
> [!NOTE]
> Không nên dùng facade `Context` bên trong callback `hydrated`; thay vào đó, chỉ thao tác với repository được truyền vào callback.
