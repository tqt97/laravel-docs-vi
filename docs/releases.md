# Ghi chú phát hành

<a name="versioning-scheme"></a>
## Quy tắc phiên bản

Laravel và các package first-party khác tuân theo [Semantic Versioning](https://semver.org). Các major release của framework được phát hành hằng năm (khoảng Q1), trong khi minor và patch release có thể được phát hành thường xuyên tới mức hằng tuần. Minor và patch release **không bao giờ** nên chứa breaking change.

Khi tham chiếu Laravel framework hoặc các component của nó từ application hay package, bạn luôn nên sử dụng version constraint như `^13.0`, vì các major release của Laravel có bao gồm breaking change. Tuy nhiên, chúng tôi luôn cố gắng bảo đảm bạn có thể nâng cấp lên một major release mới trong vòng một ngày hoặc ít hơn.

<a name="named-arguments"></a>
#### Named arguments

[Named arguments](https://www.php.net/manual/en/functions.arguments.php#functions.named-arguments) không nằm trong các nguyên tắc backward compatibility của Laravel. Khi cần thiết, chúng tôi có thể đổi tên function argument để cải thiện Laravel codebase. Vì vậy, khi gọi Laravel method bằng named argument, bạn nên thận trọng và hiểu rằng parameter name có thể thay đổi trong tương lai.

<a name="support-policy"></a>
## Chính sách hỗ trợ

Đối với mọi Laravel release, bug fix được cung cấp trong 18 tháng và security fix được cung cấp trong 2 năm. Với tất cả library bổ sung, chỉ major release mới nhất nhận bug fix. Ngoài ra, vui lòng xem các phiên bản database [được Laravel hỗ trợ](/docs/{{version}}/database#introduction).

<div class="overflow-auto">

| Phiên bản | PHP (*)   | Phát hành           | Bug fix đến          | Security fix đến     |
| --------- |-----------| ------------------- | -------------------- | -------------------- |
| 10        | 8.1 - 8.3 | February 14th, 2023 | August 6th, 2024     | February 4th, 2025   |
| 11        | 8.2 - 8.4 | March 12th, 2024    | September 3rd, 2025  | March 12th, 2026     |
| 12        | 8.2 - 8.5 | February 24th, 2025 | August 13th, 2026    | February 24th, 2027  |
| 13        | 8.3 - 8.5 | March 17th, 2026    | Q3 2027              | March 17th, 2028     |

</div>

<div class="version-colors">
    <div class="end-of-life">
        <div class="color-box"></div>
        <div>End of life</div>
    </div>
    <div class="security-fixes">
        <div class="color-box"></div>
        <div>Security fixes only</div>
    </div>
</div>

(*) Các phiên bản PHP được hỗ trợ

<a name="laravel-13"></a>
## Laravel 13

Laravel 13 tiếp tục nhịp phát hành hằng năm của Laravel với trọng tâm vào workflow AI-native, các default mạnh mẽ hơn và developer API biểu đạt tốt hơn. Release này bao gồm các primitive AI first-party, JSON:API resource, khả năng semantic / vector search và những cải tiến tăng dần trên queue, cache và security.

<a name="minimal-breaking-changes"></a>
### Breaking change tối thiểu

Phần lớn trọng tâm của chúng tôi trong chu kỳ phát hành này là giảm thiểu breaking change. Thay vào đó, chúng tôi tập trung phát hành liên tục các cải tiến về chất lượng trải nghiệm trong suốt năm mà không làm hỏng application hiện có.

Vì vậy, xét về công sức nâng cấp, Laravel 13 là một bản nâng cấp tương đối nhẹ nhưng vẫn mang lại nhiều khả năng mới đáng kể. Nhờ đó, phần lớn application Laravel có thể nâng cấp lên Laravel 13 mà không cần thay đổi nhiều application code.

<a name="php-8"></a>
### PHP 8.3

Laravel 13.x yêu cầu PHP tối thiểu phiên bản 8.3.

<a name="ai-sdk"></a>
### Laravel AI SDK

Laravel 13 giới thiệu [Laravel AI SDK](https://laravel.com/ai) first-party, cung cấp API thống nhất cho text generation, agent gọi tool, embedding, audio, image và tích hợp vector store.

Với AI SDK, bạn có thể xây dựng các tính năng AI không phụ thuộc provider trong khi vẫn giữ trải nghiệm developer nhất quán, theo phong cách Laravel native.

Ví dụ, một agent cơ bản có thể được prompt chỉ bằng một call:

```php
use App\Ai\Agents\SalesCoach;

$response = SalesCoach::make()->prompt('Analyze this sales transcript...');

return (string) $response;
```

Laravel AI SDK cũng có thể tạo image, audio và embedding:

Với use case tạo hình ảnh, SDK cung cấp API gọn gàng để tạo image từ prompt bằng ngôn ngữ tự nhiên:

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')->generate();
$rawContent = (string) $image;
```

Đối với trải nghiệm giọng nói, bạn có thể tổng hợp audio tự nhiên từ text cho assistant, narration và các tính năng accessibility:

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')->generate();

$rawContent = (string) $audio;
```

Và đối với workflow semantic search và retrieval, bạn có thể tạo embedding trực tiếp từ string:

```php
use Illuminate\Support\Str;

$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

<a name="json-api"></a>
### JSON:API Resources

Laravel giờ đây bao gồm [JSON:API resource](/docs/{{version}}/eloquent-resources#jsonapi-resources) first-party, giúp việc trả về response tuân theo JSON:API specification trở nên đơn giản.

JSON:API resource xử lý serialization resource object, inclusion relationship, sparse fieldset, link và response header tuân theo JSON:API.

<a name="request-forgery-protection"></a>
### Bảo vệ chống giả mạo request

Vì lý do security, middleware [request forgery protection](/docs/{{version}}/csrf#preventing-csrf-requests) của Laravel đã được tăng cường và chính thức hóa thành `PreventRequestForgery`, bổ sung cơ chế xác minh request có xét origin trong khi vẫn giữ compatibility với CSRF protection dựa trên token.

<a name="queue-routing"></a>
### Queue Routing

Laravel 13 bổ sung [queue routing theo class](/docs/{{version}}/queues#queue-routing) thông qua `Queue::route(...)`, cho phép bạn định nghĩa default queue / connection routing rule cho các job cụ thể tại một nơi tập trung:

```php
Queue::route(ProcessPodcast::class, connection: 'redis', queue: 'podcasts');
```

<a name="php-attributes"></a>
### Mở rộng PHP Attributes

Laravel 13 tiếp tục mở rộng hỗ trợ PHP attribute first-party trên toàn framework, giúp các concern về configuration và behavior phổ biến trở nên declarative hơn và nằm gần class/method liên quan.

Các bổ sung đáng chú ý gồm controller và authorization attribute như [`#[Middleware]`](/docs/{{version}}/controllers#controller-middleware) và [`#[Authorize]`](/docs/{{version}}/controllers#authorization-attributes), cùng các cơ chế kiểm soát job liên quan queue như [`#[Tries]`](/docs/{{version}}/queues#max-job-attempts-and-timeout), [`#[Backoff]`](/docs/{{version}}/queues#dealing-with-failed-jobs), [`#[Timeout]`](/docs/{{version}}/queues#max-job-attempts-and-timeout) và [`#[FailOnTimeout]`](/docs/{{version}}/queues#failing-on-timeout).

Ví dụ, controller middleware và policy check giờ có thể được khai báo trực tiếp trên class và method:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Routing\Attributes\Controllers\Authorize;
use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth')]
class CommentController
{
    #[Middleware('subscribed')]
    #[Authorize('create', [Comment::class, 'post'])]
    public function store(Post $post)
    {
        // ...
    }
}
```

Các attribute bổ sung cũng đã được giới thiệu trên Eloquent, event, notification, validation, testing và resource serialization API, mang đến một lựa chọn attribute-first nhất quán hơn ở nhiều khu vực của framework.

<a name="cache-touch"></a>
### Gia hạn Cache TTL

Laravel giờ bao gồm [`Cache::touch(...)`](/docs/{{version}}/cache), cho phép bạn gia hạn TTL của một cache item hiện có mà không cần retrieve rồi lưu lại value.

<a name="semantic-search"></a>
### Tìm kiếm ngữ nghĩa / vector

Laravel 13 mở rộng mạnh hơn khả năng semantic search với hỗ trợ vector query native, workflow embedding và các API liên quan được mô tả trong [search](/docs/{{version}}/search#semantic-vector-search), [queries](/docs/{{version}}/queries#vector-similarity-clauses) và [AI SDK](/docs/{{version}}/ai-sdk#embeddings).

Các tính năng này giúp việc xây dựng trải nghiệm tìm kiếm dựa trên AI với PostgreSQL + `pgvector` trở nên đơn giản, bao gồm similarity search trên embedding được tạo trực tiếp từ string.

Ví dụ, bạn có thể thực thi semantic similarity search trực tiếp từ query builder:

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'Best wineries in Napa Valley')
    ->limit(10)
    ->get();
```
