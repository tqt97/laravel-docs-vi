# Laravel Cashier (Paddle)

<a name="introduction"></a>
## Giới thiệu

> [!WARNING]
> Tài liệu này dành cho tích hợp Paddle Billing của Cashier Paddle 2.x. Nếu bạn vẫn đang sử dụng Paddle Classic, hãy dùng [Cashier Paddle 1.x](https://github.com/laravel/cashier-paddle/tree/1.x).

[Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle) cung cấp một giao diện biểu đạt, fluent để làm việc với các dịch vụ thanh toán subscription của [Paddle](https://paddle.com). Cashier xử lý gần như toàn bộ phần mã lặp lại thường gặp khi xây dựng billing cho subscription. Ngoài quản lý subscription cơ bản, Cashier còn hỗ trợ đổi subscription, số lượng (quantity), tạm dừng subscription, grace period khi hủy và nhiều chức năng khác.

Trước khi đi sâu vào Cashier Paddle, bạn cũng nên xem [hướng dẫn khái niệm](https://developer.paddle.com/concepts/overview) và [tài liệu API](https://developer.paddle.com/api-reference/overview) của Paddle.

<a name="upgrading-cashier"></a>
## Nâng cấp Cashier

Khi nâng cấp lên phiên bản Cashier mới, bạn cần đọc kỹ [hướng dẫn nâng cấp](https://github.com/laravel/cashier-paddle/blob/master/UPGRADE.md).

<a name="installation"></a>
## Cài đặt

Trước tiên, cài đặt package Cashier dành cho Paddle bằng Composer:

```shell
composer require laravel/cashier-paddle
```

Tiếp theo, publish các file migration của Cashier bằng lệnh Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Sau đó, chạy các database migration của ứng dụng. Migration của Cashier sẽ tạo bảng `customers` mới. Ngoài ra, các bảng `subscriptions` và `subscription_items` sẽ được tạo để lưu toàn bộ subscription của khách hàng. Cuối cùng, bảng `transactions` sẽ được tạo để lưu các giao dịch Paddle liên quan đến khách hàng:

```shell
php artisan migrate
```

> [!WARNING]
> Để bảo đảm Cashier xử lý đúng mọi event của Paddle, hãy nhớ [thiết lập xử lý webhook của Cashier](#handling-paddle-webhooks).

<a name="paddle-sandbox"></a>
### Paddle Sandbox

Trong quá trình phát triển ở môi trường local và staging, bạn nên [đăng ký tài khoản Paddle Sandbox](https://sandbox-login.paddle.com/signup). Tài khoản này cung cấp môi trường sandbox để kiểm thử và phát triển ứng dụng mà không phát sinh thanh toán thật. Bạn có thể dùng [số thẻ kiểm thử](https://developer.paddle.com/concepts/payment-methods/credit-debit-card#test-payment-method) của Paddle để mô phỏng nhiều tình huống thanh toán khác nhau.

Khi sử dụng môi trường Paddle Sandbox, hãy đặt biến môi trường `PADDLE_SANDBOX` thành `true` trong file `.env` của ứng dụng:

```ini
PADDLE_SANDBOX=true
```

Sau khi hoàn tất phát triển ứng dụng, bạn có thể [đăng ký tài khoản vendor Paddle](https://paddle.com). Trước khi đưa ứng dụng lên production, Paddle cần phê duyệt domain của ứng dụng.

<a name="configuration"></a>
## Cấu hình

<a name="billable-model"></a>
### Model có thể thanh toán

Trước khi sử dụng Cashier, bạn phải thêm trait `Billable` vào model user. Trait này cung cấp nhiều method để thực hiện các tác vụ billing phổ biến, chẳng hạn tạo subscription và cập nhật thông tin phương thức thanh toán:

```php
use Laravel\Paddle\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

Nếu ứng dụng có các entity có thể thanh toán nhưng không phải user, bạn cũng có thể thêm trait này vào các class tương ứng:

```php
use Illuminate\Database\Eloquent\Model;
use Laravel\Paddle\Billable;

class Team extends Model
{
    use Billable;
}
```

<a name="api-keys"></a>
### API key

Tiếp theo, cấu hình các key Paddle trong file `.env` của ứng dụng. Bạn có thể lấy API key Paddle từ bảng điều khiển Paddle:

```ini
PADDLE_CLIENT_SIDE_TOKEN=your-paddle-client-side-token
PADDLE_API_KEY=your-paddle-api-key
PADDLE_RETAIN_KEY=your-paddle-retain-key
PADDLE_WEBHOOK_SECRET="your-paddle-webhook-secret"
PADDLE_SANDBOX=true
```

Biến môi trường `PADDLE_SANDBOX` nên được đặt thành `true` khi bạn sử dụng [môi trường Sandbox của Paddle](#paddle-sandbox). Biến `PADDLE_SANDBOX` nên được đặt thành `false` nếu bạn triển khai ứng dụng lên production và sử dụng môi trường vendor live của Paddle.

`PADDLE_RETAIN_KEY` là tùy chọn và chỉ nên được thiết lập nếu bạn sử dụng Paddle cùng [Retain](https://developer.paddle.com/concepts/retain/overview).

<a name="paddle-js"></a>
### Paddle JS

Paddle sử dụng thư viện JavaScript riêng để khởi tạo widget Paddle checkout. Bạn có thể nạp thư viện này bằng cách đặt Blade directive `@paddleJS` ngay trước thẻ đóng `</head>` trong layout của ứng dụng:

```blade
<head>
    ...

    @paddleJS
</head>
```

<a name="currency-configuration"></a>
### Cấu hình tiền tệ

Bạn có thể chỉ định locale dùng khi định dạng giá trị tiền tệ hiển thị trên hóa đơn. Bên trong, Cashier sử dụng [class `NumberFormatter` của PHP](https://www.php.net/manual/en/class.numberformatter.php) để thiết lập locale tiền tệ:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!WARNING]
> Để sử dụng locale khác `en`, hãy bảo đảm PHP extension `ext-intl` đã được cài đặt và cấu hình trên server.

<a name="overriding-default-models"></a>
### Ghi đè model mặc định

Bạn có thể mở rộng các model mà Cashier sử dụng nội bộ bằng cách định nghĩa model riêng và kế thừa model Cashier tương ứng:

```php
use Laravel\Paddle\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

Sau khi định nghĩa model, bạn có thể yêu cầu Cashier sử dụng custom model thông qua class `Laravel\Paddle\Cashier`. Thông thường, bạn nên khai báo các custom model với Cashier trong method `boot` của class `App\Providers\AppServiceProvider`:

```php
use App\Models\Cashier\Subscription;
use App\Models\Cashier\Transaction;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::useSubscriptionModel(Subscription::class);
    Cashier::useTransactionModel(Transaction::class);
}
```

<a name="quickstart"></a>
## Bắt đầu nhanh

<a name="quickstart-selling-products"></a>
### Bán sản phẩm

> [!NOTE]
> Trước khi sử dụng Paddle Checkout, bạn nên định nghĩa các Product với mức giá cố định trong dashboard Paddle. Ngoài ra, bạn nên [cấu hình xử lý webhook của Paddle](#handling-paddle-webhooks).

Việc cung cấp thanh toán cho sản phẩm và subscription trong ứng dụng có thể khá phức tạp. Tuy nhiên, nhờ Cashier và [Checkout Overlay của Paddle](https://developer.paddle.com/concepts/sell/overlay-checkout), bạn có thể dễ dàng xây dựng các tích hợp thanh toán hiện đại và vững chắc.

Để thu tiền khách hàng cho các sản phẩm thanh toán một lần, không định kỳ, chúng ta sẽ sử dụng Cashier cùng Checkout Overlay của Paddle. Tại đây, khách hàng cung cấp thông tin thanh toán và xác nhận giao dịch mua. Sau khi thanh toán qua Checkout Overlay hoàn tất, khách hàng sẽ được chuyển hướng đến URL thành công mà bạn lựa chọn trong ứng dụng:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout('pri_deluxe_album')
        ->returnTo(route('dashboard'));

    return view('buy', ['checkout' => $checkout]);
})->name('checkout');
```

Như bạn có thể thấy trong ví dụ trên, chúng ta sử dụng phương thức `checkout` do Cashier cung cấp để tạo một đối tượng checkout, qua đó hiển thị Paddle Checkout Overlay cho khách hàng với một "price identifier" cụ thể. Khi sử dụng Paddle, "price" là [mức giá được định nghĩa cho một sản phẩm cụ thể](https://developer.paddle.com/build/products/create-products-prices).

Nếu cần, phương thức `checkout` sẽ tự động tạo customer trong Paddle và liên kết bản ghi customer đó với user tương ứng trong cơ sở dữ liệu của ứng dụng. Sau khi hoàn tất phiên checkout, khách hàng sẽ được chuyển hướng đến trang thành công riêng, nơi bạn có thể hiển thị thông báo cho họ.

Trong view `buy`, chúng ta sẽ thêm một nút để hiển thị Checkout Overlay. Blade component `paddle-button` được cung cấp cùng Cashier Paddle; tuy nhiên, bạn cũng có thể [render overlay checkout thủ công](#manually-rendering-an-overlay-checkout):

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy Product
</x-paddle-button>
```

<a name="providing-meta-data-to-paddle-checkout"></a>
#### Cung cấp metadata cho Paddle Checkout

Khi bán sản phẩm, thông thường bạn sẽ theo dõi các đơn hàng đã hoàn tất và sản phẩm đã mua thông qua các model `Cart` và `Order` do chính ứng dụng định nghĩa. Khi chuyển khách hàng đến Checkout Overlay của Paddle để hoàn tất giao dịch, bạn có thể cần cung cấp mã định danh của đơn hàng hiện có để có thể liên kết giao dịch đã hoàn tất với đơn hàng tương ứng khi khách hàng được chuyển trở lại ứng dụng.

Để thực hiện điều này, bạn có thể truyền một mảng dữ liệu tùy chỉnh vào phương thức `checkout`. Giả sử một `Order` đang chờ xử lý được tạo trong ứng dụng khi user bắt đầu quá trình checkout. Hãy nhớ rằng các model `Cart` và `Order` trong ví dụ này chỉ mang tính minh họa và không được Cashier cung cấp. Bạn có thể tự triển khai các khái niệm này theo nhu cầu của ứng dụng:

```php
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/cart/{cart}/checkout', function (Request $request, Cart $cart) {
    $order = Order::create([
        'cart_id' => $cart->id,
        'price_ids' => $cart->price_ids,
        'status' => 'incomplete',
    ]);

    $checkout = $request->user()->checkout($order->price_ids)
        ->customData(['order_id' => $order->id]);

    return view('billing', ['checkout' => $checkout]);
})->name('checkout');
```

Như ví dụ trên, khi user bắt đầu checkout, chúng ta truyền toàn bộ price identifier của Paddle gắn với cart / order vào phương thức `checkout`. Tất nhiên, ứng dụng của bạn chịu trách nhiệm liên kết các item này với "shopping cart" hoặc đơn hàng khi khách hàng thêm chúng. Chúng ta cũng truyền ID của đơn hàng đến Paddle Checkout Overlay thông qua phương thức `customData`.

Sau khi khách hàng hoàn tất checkout, bạn thường sẽ muốn đánh dấu đơn hàng là "complete". Để làm điều này, bạn có thể lắng nghe các webhook do Paddle gửi và được Cashier phát thành event để lưu thông tin đơn hàng vào cơ sở dữ liệu.

Để bắt đầu, hãy lắng nghe event `TransactionCompleted` do Cashier phát. Thông thường, bạn nên đăng ký event listener trong phương thức `boot` của `AppServiceProvider`:

```php
use App\Listeners\CompleteOrder;
use Illuminate\Support\Facades\Event;
use Laravel\Paddle\Events\TransactionCompleted;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Event::listen(TransactionCompleted::class, CompleteOrder::class);
}
```

Trong ví dụ này, listener `CompleteOrder` có thể có dạng như sau:

```php
namespace App\Listeners;

use App\Models\Order;
use Laravel\Paddle\Cashier;
use Laravel\Paddle\Events\TransactionCompleted;

class CompleteOrder
{
    /**
     * Handle the incoming Cashier webhook event.
     */
    public function handle(TransactionCompleted $event): void
    {
        $orderId = $event->payload['data']['custom_data']['order_id'] ?? null;

        $order = Order::findOrFail($orderId);

        $order->update(['status' => 'completed']);
    }
}
```

Vui lòng tham khảo tài liệu Paddle để biết thêm thông tin về [dữ liệu có trong event `transaction.completed`](https://developer.paddle.com/webhooks/transactions/transaction-completed).

<a name="quickstart-selling-subscriptions"></a>
### Bán subscription

> [!NOTE]
> Trước khi sử dụng Paddle Checkout, bạn nên định nghĩa các Product với mức giá cố định trong dashboard Paddle. Ngoài ra, bạn nên [cấu hình xử lý webhook của Paddle](#handling-paddle-webhooks).

Việc cung cấp thanh toán cho sản phẩm và subscription trong ứng dụng có thể khá phức tạp. Tuy nhiên, nhờ Cashier và [Checkout Overlay của Paddle](https://developer.paddle.com/concepts/sell/overlay-checkout), bạn có thể dễ dàng xây dựng các tích hợp thanh toán hiện đại và vững chắc.

Để tìm hiểu cách bán subscription bằng Cashier và Checkout Overlay của Paddle, hãy xét một dịch vụ subscription đơn giản với gói Basic theo tháng (`price_basic_monthly`) và theo năm (`price_basic_yearly`). Hai price này có thể được nhóm trong product "Basic" (`pro_basic`) trên dashboard Paddle. Ngoài ra, dịch vụ có thể cung cấp gói "Expert" dưới product `pro_expert`.

Trước tiên, hãy xem cách khách hàng đăng ký dịch vụ. Khách hàng có thể nhấn nút "subscribe" cho gói Basic trên trang giá của ứng dụng. Nút này sẽ mở Paddle Checkout Overlay cho gói đã chọn. Để bắt đầu, hãy khởi tạo một phiên checkout thông qua phương thức `checkout`:

```php
use Illuminate\Http\Request;

Route::get('/subscribe', function (Request $request) {
    $checkout = $request->user()->checkout('price_basic_monthly')
        ->returnTo(route('dashboard'));

    return view('subscribe', ['checkout' => $checkout]);
})->name('subscribe');
```

Trong view `subscribe`, chúng ta sẽ thêm một nút để hiển thị Checkout Overlay. Blade component `paddle-button` được cung cấp cùng Cashier Paddle; tuy nhiên, bạn cũng có thể [render overlay checkout thủ công](#manually-rendering-an-overlay-checkout):

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Khi nút Subscribe được nhấn, khách hàng có thể nhập thông tin thanh toán và bắt đầu subscription. Để biết chính xác khi nào subscription thực sự bắt đầu (vì một số phương thức thanh toán cần vài giây để xử lý), bạn cũng nên [cấu hình xử lý webhook của Cashier](#handling-paddle-webhooks).

Khi khách hàng đã có thể bắt đầu subscription, chúng ta cần giới hạn một số phần của ứng dụng để chỉ user đã đăng ký mới truy cập được. Bạn luôn có thể xác định trạng thái subscription hiện tại của user thông qua phương thức `subscribed` do trait `Billable` của Cashier cung cấp:

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

Chúng ta cũng có thể dễ dàng xác định user có đăng ký một product hoặc price cụ thể hay không:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### Xây dựng middleware kiểm tra subscription

Để thuận tiện, bạn có thể tạo một [middleware](/docs/{{version}}/middleware) xác định request đến có phải từ user đã đăng ký hay không. Sau khi middleware được định nghĩa, bạn có thể gán nó cho route để ngăn user chưa đăng ký truy cập:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Subscribed
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->subscribed()) {
            // Redirect user to billing page and ask them to subscribe...
            return redirect('/subscribe');
        }

        return $next($request);
    }
}
```

Sau khi định nghĩa middleware, bạn có thể gán nó cho một route:

```php
use App\Http\Middleware\Subscribed;

Route::get('/dashboard', function () {
    // ...
})->middleware([Subscribed::class]);
```

<a name="quickstart-allowing-customers-to-manage-their-billing-plan"></a>
#### Cho phép khách hàng quản lý gói thanh toán

Khách hàng có thể muốn chuyển subscription sang product hoặc "tier" khác. Trong ví dụ trên, chúng ta muốn cho phép khách hàng chuyển từ subscription theo tháng sang theo năm. Để làm điều này, bạn cần triển khai chẳng hạn một nút dẫn đến route sau:

```php
use Illuminate\Http\Request;

Route::put('/subscription/{price}/swap', function (Request $request, $price) {
    $user->subscription()->swap($price); // With "$price" being "price_basic_yearly" for this example.

    return redirect()->route('dashboard');
})->name('subscription.swap');
```

Ngoài việc đổi gói, bạn cũng cần cho phép khách hàng hủy subscription. Tương tự thao tác đổi gói, hãy cung cấp một nút dẫn đến route sau:

```php
use Illuminate\Http\Request;

Route::put('/subscription/cancel', function (Request $request, $price) {
    $user->subscription()->cancel();

    return redirect()->route('dashboard');
})->name('subscription.cancel');
```

Subscription lúc này sẽ bị hủy vào cuối kỳ thanh toán hiện tại.

> [!NOTE]
> Miễn là bạn đã cấu hình xử lý webhook của Cashier, Cashier sẽ tự động đồng bộ các bảng cơ sở dữ liệu liên quan bằng cách xử lý webhook đến từ Paddle. Ví dụ, khi bạn hủy subscription của khách hàng trên dashboard Paddle, Cashier sẽ nhận webhook tương ứng và đánh dấu subscription là "canceled" trong cơ sở dữ liệu ứng dụng.

<a name="checkout-sessions"></a>
## Phiên checkout

Hầu hết thao tác tính phí khách hàng được thực hiện bằng "checkout" thông qua [Checkout Overlay widget](https://developer.paddle.com/build/checkout/build-overlay-checkout) của Paddle hoặc bằng [inline checkout](https://developer.paddle.com/build/checkout/build-branded-inline-checkout).

Trước khi xử lý thanh toán checkout bằng Paddle, bạn nên định nghĩa [default payment link](https://developer.paddle.com/build/transactions/default-payment-link#set-default-link) của ứng dụng trong phần cài đặt checkout trên dashboard Paddle.

<a name="overlay-checkout"></a>
### Overlay Checkout

Trước khi hiển thị Checkout Overlay widget, bạn phải tạo một phiên checkout bằng Cashier. Phiên checkout cho widget biết thao tác thanh toán cần thực hiện:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Cashier cung cấp [Blade component](/docs/{{version}}/blade#components) `paddle-button`. Bạn có thể truyền phiên checkout vào component dưới dạng "prop". Khi nút được nhấn, checkout widget của Paddle sẽ hiển thị:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Theo mặc định, widget sử dụng style mặc định của Paddle. Bạn có thể tùy chỉnh bằng cách thêm các [attribute được Paddle hỗ trợ](https://developer.paddle.com/paddlejs/html-data-attributes), chẳng hạn `data-theme='light'`, vào component:

```html
<x-paddle-button :checkout="$checkout" class="px-8 py-4" data-theme="light">
    Subscribe
</x-paddle-button>
```

Checkout widget của Paddle hoạt động bất đồng bộ. Khi user tạo subscription trong widget, Paddle sẽ gửi webhook đến ứng dụng để bạn cập nhật đúng trạng thái subscription trong cơ sở dữ liệu. Vì vậy, việc [thiết lập webhook](#handling-paddle-webhooks) đúng cách để xử lý các thay đổi trạng thái từ Paddle là rất quan trọng.

> [!WARNING]
> Sau khi trạng thái subscription thay đổi, độ trễ để nhận webhook tương ứng thường rất nhỏ; tuy nhiên, ứng dụng vẫn nên tính đến khả năng subscription của user chưa khả dụng ngay sau khi checkout hoàn tất.

<a name="manually-rendering-an-overlay-checkout"></a>
#### Render Overlay Checkout thủ công

Bạn cũng có thể render overlay checkout thủ công mà không sử dụng Blade component tích hợp của Laravel. Để bắt đầu, hãy tạo phiên checkout [như các ví dụ trước](#overlay-checkout):

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Tiếp theo, bạn có thể dùng Paddle.js để khởi tạo checkout. Trong ví dụ này, chúng ta tạo một liên kết có class `paddle_button`. Paddle.js sẽ phát hiện class này và hiển thị overlay checkout khi liên kết được nhấn:

```blade
<?php
$items = $checkout->getItems();
$customer = $checkout->getCustomer();
$custom = $checkout->getCustomData();
?>

<a
    href='#!'
    class='paddle_button'
    data-items='{!! json_encode($items) !!}'
    @if ($customer) data-customer-id='{{ $customer->paddle_id }}' @endif
    @if ($custom) data-custom-data='{{ json_encode($custom) }}' @endif
    @if ($returnUrl = $checkout->getReturnUrl()) data-success-url='{{ $returnUrl }}' @endif
>
    Buy Product
</a>
```

<a name="inline-checkout"></a>
### Inline Checkout

Nếu không muốn sử dụng checkout widget kiểu "overlay" của Paddle, bạn cũng có thể hiển thị widget theo dạng inline. Cách này không cho phép chỉnh sửa các trường HTML của checkout nhưng cho phép nhúng widget trực tiếp vào ứng dụng.

Để giúp bạn bắt đầu với inline checkout dễ dàng hơn, Cashier cung cấp Blade component `paddle-checkout`. Trước tiên, bạn nên [tạo một phiên checkout](#overlay-checkout):

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Sau đó, bạn có thể truyền phiên checkout vào attribute `checkout` của component:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" />
```

Để điều chỉnh chiều cao của inline checkout component, bạn có thể truyền attribute `height` cho Blade component:

```blade
<x-paddle-checkout :checkout="$checkout" class="w-full" height="500" />
```

Hãy tham khảo [hướng dẫn Inline Checkout](https://developer.paddle.com/build/checkout/build-branded-inline-checkout) và [các cài đặt checkout khả dụng](https://developer.paddle.com/build/checkout/set-up-checkout-default-settings) của Paddle để biết thêm chi tiết về các tùy chọn tùy chỉnh inline checkout.

<a name="manually-rendering-an-inline-checkout"></a>
#### Render Inline Checkout thủ công

Bạn cũng có thể render inline checkout thủ công mà không dùng Blade component tích hợp của Laravel. Để bắt đầu, hãy tạo phiên checkout [như các ví dụ trước](#inline-checkout):

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $user->checkout('pri_34567')
        ->returnTo(route('dashboard'));

    return view('billing', ['checkout' => $checkout]);
});
```

Tiếp theo, bạn có thể dùng Paddle.js để khởi tạo checkout. Ví dụ này sử dụng [Alpine.js](https://github.com/alpinejs/alpine); tuy nhiên, bạn có thể tự điều chỉnh cho frontend stack của mình:

```blade
<?php
$options = $checkout->options();

$options['settings']['frameTarget'] = 'paddle-checkout';
$options['settings']['frameInitialHeight'] = 366;
?>

<div class="paddle-checkout" x-data="{}" x-init="
    Paddle.Checkout.open(@json($options));
">
</div>
```

<a name="guest-checkouts"></a>
### Checkout cho khách

Đôi khi, bạn cần tạo phiên checkout cho người dùng không cần tài khoản trong ứng dụng. Khi đó, bạn có thể sử dụng phương thức `guest`:

```php
use Illuminate\Http\Request;
use Laravel\Paddle\Checkout;

Route::get('/buy', function (Request $request) {
    $checkout = Checkout::guest(['pri_34567'])
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

Sau đó, bạn có thể truyền phiên checkout vào Blade component [Paddle button](#overlay-checkout) hoặc [inline checkout](#inline-checkout).

<a name="price-previews"></a>
## Xem trước giá

Paddle cho phép bạn tùy chỉnh giá theo từng loại tiền tệ, về cơ bản cho phép cấu hình các mức giá khác nhau cho từng quốc gia. Cashier Paddle cho phép truy xuất tất cả các mức giá này bằng phương thức `previewPrices`. Phương thức này nhận các ID của price mà bạn muốn truy xuất:

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456']);
```

Loại tiền tệ sẽ được xác định dựa trên địa chỉ IP của request; tuy nhiên, bạn cũng có thể cung cấp một quốc gia cụ thể để truy xuất giá:

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], ['address' => [
    'country_code' => 'BE',
    'postal_code' => '1234',
]]);
```

Sau khi truy xuất các mức giá, bạn có thể hiển thị chúng theo bất kỳ cách nào mong muốn:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

Bạn cũng có thể hiển thị riêng subtotal và số tiền thuế:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->subtotal() }} (+ {{ $price->tax() }} tax)</li>
    @endforeach
</ul>
```

Để biết thêm thông tin, hãy tham khảo [tài liệu API của Paddle về xem trước giá](https://developer.paddle.com/api-reference/pricing-preview/preview-prices).

<a name="customer-price-previews"></a>
### Xem trước giá cho khách hàng

Nếu người dùng đã là khách hàng và bạn muốn hiển thị các mức giá áp dụng cho khách hàng đó, bạn có thể truy xuất giá trực tiếp từ instance của khách hàng:

```php
use App\Models\User;

$prices = User::find(1)->previewPrices(['pri_123', 'pri_456']);
```

Ở bên trong, Cashier sẽ sử dụng customer ID của người dùng để truy xuất giá theo loại tiền tệ của họ. Ví dụ, người dùng sống tại Hoa Kỳ sẽ thấy giá bằng đô la Mỹ, trong khi người dùng tại Bỉ sẽ thấy giá bằng Euro. Nếu không tìm thấy loại tiền tệ phù hợp, loại tiền tệ mặc định của sản phẩm sẽ được sử dụng. Bạn có thể tùy chỉnh toàn bộ mức giá của sản phẩm hoặc gói subscription trong bảng điều khiển Paddle.

<a name="price-discounts"></a>
### Giảm giá

Bạn cũng có thể chọn hiển thị giá sau khi áp dụng giảm giá. Khi gọi phương thức `previewPrices`, hãy cung cấp discount ID thông qua tùy chọn `discount_id`:

```php
use Laravel\Paddle\Cashier;

$prices = Cashier::previewPrices(['pri_123', 'pri_456'], [
    'discount_id' => 'dsc_123'
]);
```

Sau đó, hiển thị các mức giá đã được tính toán:

```blade
<ul>
    @foreach ($prices as $price)
        <li>{{ $price->product['name'] }} - {{ $price->total() }}</li>
    @endforeach
</ul>
```

<a name="customers"></a>
## Khách hàng

<a name="customer-defaults"></a>
### Giá trị mặc định của khách hàng

Cashier cho phép bạn định nghĩa một số giá trị mặc định hữu ích cho khách hàng khi tạo checkout session. Việc thiết lập các giá trị này cho phép điền sẵn địa chỉ email và tên của khách hàng để họ có thể chuyển ngay đến phần thanh toán của checkout widget. Bạn có thể thiết lập các giá trị mặc định này bằng cách ghi đè các phương thức sau trên billable model:

```php
/**
 * Get the customer's name to associate with Paddle.
 */
public function paddleName(): string|null
{
    return $this->name;
}

/**
 * Get the customer's email address to associate with Paddle.
 */
public function paddleEmail(): string|null
{
    return $this->email;
}
```

Các giá trị mặc định này sẽ được sử dụng cho mọi thao tác trong Cashier tạo ra một [checkout session](#checkout-sessions).

<a name="retrieving-customers"></a>
### Truy xuất khách hàng

Bạn có thể truy xuất khách hàng bằng Paddle Customer ID thông qua phương thức `Cashier::findBillable`. Phương thức này sẽ trả về một instance của billable model:

```php
use Laravel\Paddle\Cashier;

$user = Cashier::findBillable($customerId);
```

<a name="creating-customers"></a>
### Tạo khách hàng

Đôi khi, bạn có thể muốn tạo một khách hàng Paddle mà chưa bắt đầu subscription. Bạn có thể thực hiện việc này bằng phương thức `createAsCustomer`:

```php
$customer = $user->createAsCustomer();
```

Một instance của `Laravel\Paddle\Customer` sẽ được trả về. Sau khi khách hàng đã được tạo trong Paddle, bạn có thể bắt đầu subscription vào thời điểm sau. Bạn có thể cung cấp mảng `$options` tùy chọn để truyền thêm bất kỳ [tham số tạo khách hàng nào được Paddle API hỗ trợ](https://developer.paddle.com/api-reference/customers/create-customer):

```php
$customer = $user->createAsCustomer($options);
```

<a name="subscriptions"></a>
## Subscription

<a name="creating-subscriptions"></a>
### Tạo subscription

Để tạo subscription, trước tiên hãy truy xuất một instance của billable model từ database, thường là một instance của `App\Models\User`. Sau khi có model instance, bạn có thể sử dụng phương thức `subscribe` để tạo checkout session cho model:

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($premium = 'pri_123', 'default')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

Đối số đầu tiên truyền cho phương thức `subscribe` là price cụ thể mà người dùng đăng ký. Giá trị này phải tương ứng với định danh của price trong Paddle. Phương thức `returnTo` nhận URL mà người dùng sẽ được chuyển hướng đến sau khi hoàn tất checkout thành công. Đối số thứ hai truyền cho `subscribe` là "type" nội bộ của subscription. Nếu ứng dụng chỉ cung cấp một subscription, bạn có thể đặt là `default` hoặc `primary`. Loại subscription này chỉ dùng nội bộ trong ứng dụng và không nhằm hiển thị cho người dùng. Ngoài ra, nó không nên chứa khoảng trắng và không bao giờ nên thay đổi sau khi subscription đã được tạo.

Bạn cũng có thể cung cấp một mảng metadata tùy chỉnh cho subscription bằng phương thức `customData`:

```php
$checkout = $request->user()->subscribe($premium = 'pri_123', 'default')
    ->customData(['key' => 'value'])
    ->returnTo(route('home'));
```

Sau khi checkout session của subscription được tạo, bạn có thể truyền checkout session đó vào [Blade component](#overlay-checkout) `paddle-button` đi kèm Cashier Paddle:

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Subscribe
</x-paddle-button>
```

Sau khi người dùng hoàn tất checkout, Paddle sẽ gửi webhook `subscription_created`. Cashier sẽ nhận webhook này và thiết lập subscription cho khách hàng. Để bảo đảm mọi webhook đều được ứng dụng nhận và xử lý đúng cách, hãy chắc chắn rằng bạn đã [cấu hình xử lý webhook](#handling-paddle-webhooks) chính xác.

<a name="checking-subscription-status"></a>
### Kiểm tra trạng thái subscription

Sau khi người dùng đã đăng ký ứng dụng, bạn có thể kiểm tra trạng thái subscription bằng nhiều phương thức tiện lợi. Trước hết, phương thức `subscribed` trả về `true` nếu người dùng có subscription hợp lệ, kể cả khi subscription hiện vẫn đang trong thời gian dùng thử:

```php
if ($user->subscribed()) {
    // ...
}
```

Nếu ứng dụng cung cấp nhiều subscription, bạn có thể chỉ định subscription khi gọi phương thức `subscribed`:

```php
if ($user->subscribed('default')) {
    // ...
}
```

Phương thức `subscribed` cũng rất phù hợp để sử dụng trong [route middleware](/docs/{{version}}/middleware), cho phép bạn lọc quyền truy cập vào route và controller dựa trên trạng thái subscription của người dùng:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSubscribed
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->subscribed()) {
            // This user is not a paying customer...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

Nếu muốn xác định người dùng có còn trong thời gian dùng thử hay không, bạn có thể sử dụng phương thức `onTrial`. Phương thức này hữu ích khi cần quyết định có nên hiển thị cảnh báo rằng người dùng vẫn đang trong thời gian dùng thử:

```php
if ($user->subscription()->onTrial()) {
    // ...
}
```

Phương thức `subscribedToPrice` có thể được dùng để xác định người dùng có đăng ký một plan nhất định dựa trên Paddle price ID hay không. Trong ví dụ này, chúng ta sẽ xác định subscription `default` của người dùng có đang đăng ký price theo tháng hay không:

```php
if ($user->subscribedToPrice($monthly = 'pri_123', 'default')) {
    // ...
}
```

Phương thức `recurring` có thể được dùng để xác định người dùng hiện có subscription đang hoạt động và không còn trong thời gian dùng thử hoặc grace period:

```php
if ($user->subscription()->recurring()) {
    // ...
}
```

<a name="canceled-subscription-status"></a>
#### Trạng thái subscription đã hủy

Để xác định người dùng từng có subscription đang hoạt động nhưng đã hủy, bạn có thể sử dụng phương thức `canceled`:

```php
if ($user->subscription()->canceled()) {
    // ...
}
```

Bạn cũng có thể xác định người dùng đã hủy subscription nhưng vẫn đang trong "grace period" cho đến khi subscription hết hạn hoàn toàn. Ví dụ, nếu người dùng hủy subscription vào ngày 5 tháng 3 trong khi subscription ban đầu dự kiến hết hạn vào ngày 10 tháng 3, người dùng sẽ ở trong "grace period" đến ngày 10 tháng 3. Trong khoảng thời gian này, phương thức `subscribed` vẫn trả về `true`:

```php
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

<a name="past-due-status"></a>
#### Trạng thái quá hạn thanh toán

Nếu một khoản thanh toán cho subscription thất bại, subscription sẽ được đánh dấu `past_due`. Khi ở trạng thái này, subscription sẽ không hoạt động cho đến khi khách hàng cập nhật thông tin thanh toán. Bạn có thể xác định subscription có quá hạn thanh toán hay không bằng phương thức `pastDue` trên subscription instance:

```php
if ($user->subscription()->pastDue()) {
    // ...
}
```

Khi subscription ở trạng thái quá hạn thanh toán, bạn nên hướng dẫn người dùng [cập nhật thông tin thanh toán](#updating-payment-information).

Nếu muốn subscription vẫn được xem là hợp lệ khi ở trạng thái `past_due`, bạn có thể sử dụng phương thức `keepPastDueSubscriptionsActive` do Cashier cung cấp. Thông thường, phương thức này nên được gọi trong phương thức `register` của `AppServiceProvider`:

```php
use Laravel\Paddle\Cashier;

/**
 * Register any application services.
 */
public function register(): void
{
    Cashier::keepPastDueSubscriptionsActive();
}
```

> [!WARNING]
> Khi subscription ở trạng thái `past_due`, subscription không thể được thay đổi cho đến khi thông tin thanh toán được cập nhật. Vì vậy, các phương thức `swap` và `updateQuantity` sẽ ném exception khi subscription đang ở trạng thái `past_due`.

<a name="subscription-scopes"></a>
#### Subscription scopes

Hầu hết trạng thái subscription cũng có sẵn dưới dạng query scope để bạn dễ dàng truy vấn database cho các subscription đang ở một trạng thái cụ thể:

```php
// Get all valid subscriptions...
$subscriptions = Subscription::query()->valid()->get();

// Get all of the canceled subscriptions for a user...
$subscriptions = $user->subscriptions()->canceled()->get();
```

Danh sách đầy đủ các scope khả dụng được trình bày bên dưới:

```php
Subscription::query()->valid();
Subscription::query()->onTrial();
Subscription::query()->expiredTrial();
Subscription::query()->notOnTrial();
Subscription::query()->active();
Subscription::query()->recurring();
Subscription::query()->pastDue();
Subscription::query()->paused();
Subscription::query()->notPaused();
Subscription::query()->onPausedGracePeriod();
Subscription::query()->notOnPausedGracePeriod();
Subscription::query()->canceled();
Subscription::query()->notCanceled();
Subscription::query()->onGracePeriod();
Subscription::query()->notOnGracePeriod();
```

<a name="subscription-single-charges"></a>
### Khoản thu một lần trên subscription

Khoản thu một lần trên subscription cho phép bạn thu thêm một khoản thanh toán một lần từ người đăng ký ngoài phí subscription. Khi gọi phương thức `charge`, bạn phải cung cấp một hoặc nhiều price ID:

```php
// Charge a single price...
$response = $user->subscription()->charge('pri_123');

// Charge multiple prices at once...
$response = $user->subscription()->charge(['pri_123', 'pri_456']);
```

Phương thức `charge` sẽ chưa thực sự thu tiền khách hàng cho đến kỳ thanh toán tiếp theo của subscription. Nếu muốn lập hóa đơn và thu tiền khách hàng ngay lập tức, bạn có thể sử dụng phương thức `chargeAndInvoice`:

```php
$response = $user->subscription()->chargeAndInvoice('pri_123');
```

<a name="updating-payment-information"></a>
### Cập nhật thông tin thanh toán

Paddle luôn lưu một phương thức thanh toán cho mỗi subscription. Nếu muốn cập nhật phương thức thanh toán mặc định của một subscription, bạn nên chuyển hướng khách hàng đến trang cập nhật phương thức thanh toán do Paddle cung cấp bằng phương thức `redirectToUpdatePaymentMethod` trên subscription model:

```php
use Illuminate\Http\Request;

Route::get('/update-payment-method', function (Request $request) {
    $user = $request->user();

    return $user->subscription()->redirectToUpdatePaymentMethod();
});
```

Sau khi người dùng hoàn tất cập nhật thông tin, Paddle sẽ gửi webhook `subscription_updated` và thông tin chi tiết của subscription sẽ được cập nhật trong database của ứng dụng.

<a name="changing-plans"></a>
### Thay đổi gói

Sau khi người dùng đăng ký ứng dụng, đôi khi họ có thể muốn chuyển sang một gói subscription mới. Để cập nhật gói subscription của người dùng, hãy truyền identifier của Paddle price vào phương thức `swap` của subscription:

```php
use App\Models\User;

$user = User::find(1);

$user->subscription()->swap($premium = 'pri_456');
```

Nếu muốn đổi gói và lập hóa đơn cho người dùng ngay lập tức thay vì chờ đến chu kỳ thanh toán tiếp theo, bạn có thể sử dụng phương thức `swapAndInvoice`:

```php
$user = User::find(1);

$user->subscription()->swapAndInvoice($premium = 'pri_456');
```

<a name="prorations"></a>
#### Proration

Theo mặc định, Paddle sẽ tính proration khi chuyển đổi giữa các gói. Bạn có thể sử dụng phương thức `noProrate` để cập nhật subscription mà không tính proration:

```php
$user->subscription('default')->noProrate()->swap($premium = 'pri_456');
```

Nếu muốn tắt proration và lập hóa đơn cho khách hàng ngay lập tức, bạn có thể kết hợp `swapAndInvoice` với `noProrate`:

```php
$user->subscription('default')->noProrate()->swapAndInvoice($premium = 'pri_456');
```

Hoặc, nếu không muốn tính phí khách hàng cho việc thay đổi subscription, bạn có thể sử dụng phương thức `doNotBill`:

```php
$user->subscription('default')->doNotBill()->swap($premium = 'pri_456');
```

Để biết thêm thông tin về chính sách proration của Paddle, hãy tham khảo [tài liệu proration của Paddle](https://developer.paddle.com/concepts/subscriptions/proration).

<a name="subscription-quantity"></a>
### Số lượng của subscription

Đôi khi subscription chịu ảnh hưởng bởi "quantity". Ví dụ, một ứng dụng quản lý dự án có thể thu 10 USD mỗi tháng cho mỗi dự án. Để dễ dàng tăng hoặc giảm quantity của subscription, hãy sử dụng các phương thức `incrementQuantity` và `decrementQuantity`:

```php
$user = User::find(1);

$user->subscription()->incrementQuantity();

// Add five to the subscription's current quantity...
$user->subscription()->incrementQuantity(5);

$user->subscription()->decrementQuantity();

// Subtract five from the subscription's current quantity...
$user->subscription()->decrementQuantity(5);
```

Ngoài ra, bạn có thể đặt một quantity cụ thể bằng phương thức `updateQuantity`:

```php
$user->subscription()->updateQuantity(10);
```

Bạn có thể sử dụng phương thức `noProrate` để cập nhật quantity của subscription mà không tính proration:

```php
$user->subscription()->noProrate()->updateQuantity(10);
```

<a name="quantities-for-subscription-with-multiple-products"></a>
#### Quantity cho subscription có nhiều sản phẩm

Nếu subscription của bạn là [subscription có nhiều sản phẩm](#subscriptions-with-multiple-products), hãy truyền ID của price mà bạn muốn tăng hoặc giảm quantity làm đối số thứ hai cho các phương thức tăng / giảm:

```php
$user->subscription()->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### Subscription có nhiều sản phẩm

[Subscription có nhiều sản phẩm](https://developer.paddle.com/build/subscriptions/add-remove-products-prices-addons) cho phép bạn gán nhiều sản phẩm tính phí vào một subscription duy nhất. Ví dụ, giả sử bạn đang xây dựng một ứng dụng chăm sóc khách hàng "helpdesk" có giá subscription cơ bản 10 USD mỗi tháng và cung cấp thêm sản phẩm live chat với giá 15 USD mỗi tháng.

Khi tạo checkout session cho subscription, bạn có thể chỉ định nhiều sản phẩm cho một subscription bằng cách truyền một mảng price làm đối số đầu tiên của phương thức `subscribe`:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe([
        'price_monthly',
        'price_chat',
    ]);

    return view('billing', ['checkout' => $checkout]);
});
```

Trong ví dụ trên, khách hàng sẽ có hai price được gắn với subscription `default`. Cả hai price sẽ được tính phí theo kỳ thanh toán tương ứng. Nếu cần, bạn có thể truyền một associative array gồm các cặp key / value để chỉ định quantity cụ thể cho từng price:

```php
$user = User::find(1);

$checkout = $user->subscribe('default', ['price_monthly', 'price_chat' => 5]);
```

Nếu muốn thêm một price khác vào subscription hiện có, bạn phải sử dụng phương thức `swap` của subscription. Khi gọi `swap`, bạn cũng cần bao gồm các price và quantity hiện tại của subscription:

```php
$user = User::find(1);

$user->subscription()->swap(['price_chat', 'price_original' => 2]);
```

Ví dụ trên sẽ thêm price mới, nhưng khách hàng sẽ chưa bị tính phí cho đến chu kỳ thanh toán tiếp theo. Nếu muốn tính phí khách hàng ngay lập tức, bạn có thể sử dụng phương thức `swapAndInvoice`:

```php
$user->subscription()->swapAndInvoice(['price_chat', 'price_original' => 2]);
```

Bạn có thể xóa price khỏi subscription bằng phương thức `swap` và bỏ price mà bạn muốn xóa khỏi danh sách:

```php
$user->subscription()->swap(['price_original' => 2]);
```

> [!WARNING]
> Bạn không thể xóa price cuối cùng khỏi subscription. Thay vào đó, hãy hủy subscription.

<a name="multiple-subscriptions"></a>
### Nhiều subscription

Paddle cho phép khách hàng có nhiều subscription cùng lúc. Ví dụ, bạn có thể vận hành một phòng gym cung cấp subscription bơi lội và subscription tập tạ, mỗi subscription có mức giá khác nhau. Khách hàng có thể đăng ký một hoặc cả hai gói.

Khi ứng dụng tạo subscription, bạn có thể cung cấp loại subscription cho phương thức `subscribe` làm đối số thứ hai. Loại này có thể là bất kỳ chuỗi nào đại diện cho loại subscription mà người dùng đang khởi tạo:

```php
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $checkout = $request->user()->subscribe($swimmingMonthly = 'pri_123', 'swimming');

    return view('billing', ['checkout' => $checkout]);
});
```

Trong ví dụ này, chúng ta đã khởi tạo subscription bơi lội theo tháng cho khách hàng. Tuy nhiên, sau đó họ có thể muốn chuyển sang subscription theo năm. Khi điều chỉnh subscription của khách hàng, chúng ta chỉ cần đổi price trên subscription `swimming`:

```php
$user->subscription('swimming')->swap($swimmingYearly = 'pri_456');
```

Tất nhiên, bạn cũng có thể hủy hoàn toàn subscription:

```php
$user->subscription('swimming')->cancel();
```

<a name="pausing-subscriptions"></a>
### Tạm dừng subscription

Để tạm dừng subscription, hãy gọi phương thức `pause` trên subscription của người dùng:

```php
$user->subscription()->pause();
```

Khi subscription được tạm dừng, Cashier sẽ tự động đặt cột `paused_at` trong database. Cột này được dùng để xác định thời điểm phương thức `paused` bắt đầu trả về `true`. Ví dụ, nếu khách hàng tạm dừng subscription vào ngày 1 tháng 3 nhưng subscription chỉ dự kiến gia hạn vào ngày 5 tháng 3, phương thức `paused` vẫn trả về `false` cho đến ngày 5 tháng 3. Điều này là vì người dùng thường được phép tiếp tục sử dụng ứng dụng cho đến hết chu kỳ thanh toán.

Theo mặc định, việc tạm dừng có hiệu lực ở kỳ thanh toán tiếp theo để khách hàng có thể sử dụng hết thời gian đã thanh toán. Nếu muốn tạm dừng subscription ngay lập tức, bạn có thể sử dụng phương thức `pauseNow`:

```php
$user->subscription()->pauseNow();
```

Với phương thức `pauseUntil`, bạn có thể tạm dừng subscription đến một thời điểm cụ thể:

```php
$user->subscription()->pauseUntil(now()->plus(months: 1));
```

Hoặc, bạn có thể sử dụng `pauseNowUntil` để tạm dừng subscription ngay lập tức cho đến một thời điểm nhất định:

```php
$user->subscription()->pauseNowUntil(now()->plus(months: 1));
```

Bạn có thể xác định người dùng đã tạm dừng subscription nhưng vẫn đang trong "grace period" bằng phương thức `onPausedGracePeriod`:

```php
if ($user->subscription()->onPausedGracePeriod()) {
    // ...
}
```

Để tiếp tục một subscription đã tạm dừng, bạn có thể gọi phương thức `resume` trên subscription:

```php
$user->subscription()->resume();
```

> [!WARNING]
> Không thể thay đổi subscription khi đang tạm dừng. Nếu muốn chuyển sang gói khác hoặc cập nhật quantity, trước tiên bạn phải tiếp tục subscription.

<a name="canceling-subscriptions"></a>
### Hủy subscription

Để hủy subscription, hãy gọi phương thức `cancel` trên subscription của người dùng:

```php
$user->subscription()->cancel();
```

Khi subscription bị hủy, Cashier sẽ tự động đặt cột `ends_at` trong database. Cột này được dùng để xác định thời điểm phương thức `subscribed` bắt đầu trả về `false`. Ví dụ, nếu khách hàng hủy subscription vào ngày 1 tháng 3 nhưng subscription chỉ dự kiến kết thúc vào ngày 5 tháng 3, phương thức `subscribed` vẫn trả về `true` cho đến ngày 5 tháng 3. Điều này là vì người dùng thường được phép tiếp tục sử dụng ứng dụng cho đến hết chu kỳ thanh toán.

Bạn có thể xác định người dùng đã hủy subscription nhưng vẫn đang trong "grace period" bằng phương thức `onGracePeriod`:

```php
if ($user->subscription()->onGracePeriod()) {
    // ...
}
```

Nếu muốn hủy subscription ngay lập tức, bạn có thể gọi phương thức `cancelNow` trên subscription:

```php
$user->subscription()->cancelNow();
```

Để ngăn một subscription đang trong grace period tiếp tục bị hủy, bạn có thể gọi phương thức `stopCancelation`:

```php
$user->subscription()->stopCancelation();
```

> [!WARNING]
> Subscription của Paddle không thể được tiếp tục sau khi đã hủy. Nếu khách hàng muốn đăng ký lại, họ phải tạo một subscription mới.

<a name="subscription-trials"></a>
## Dùng thử subscription

<a name="with-payment-method-up-front"></a>
### Thu thập phương thức thanh toán ngay từ đầu

Nếu muốn cung cấp thời gian dùng thử cho khách hàng nhưng vẫn thu thập thông tin phương thức thanh toán ngay từ đầu, bạn nên thiết lập thời gian dùng thử trong Paddle dashboard trên price mà khách hàng đăng ký. Sau đó, khởi tạo checkout session như bình thường:

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

Khi ứng dụng nhận event `subscription_created`, Cashier sẽ thiết lập ngày kết thúc thời gian dùng thử trên bản ghi subscription trong database của ứng dụng, đồng thời yêu cầu Paddle chưa bắt đầu tính phí khách hàng cho đến sau ngày này.

> [!WARNING]
> Nếu subscription của khách hàng không được hủy trước ngày kết thúc dùng thử, họ sẽ bị tính phí ngay khi thời gian dùng thử hết hạn. Vì vậy, bạn nên đảm bảo thông báo cho người dùng về ngày kết thúc thời gian dùng thử của họ.

Bạn có thể xác định người dùng có đang trong thời gian dùng thử hay không bằng phương thức `onTrial` trên instance người dùng:

```php
if ($user->onTrial()) {
    // ...
}
```

Để xác định một thời gian dùng thử hiện có đã hết hạn hay chưa, bạn có thể sử dụng phương thức `hasExpiredTrial`:

```php
if ($user->hasExpiredTrial()) {
    // ...
}
```

Để xác định người dùng có đang dùng thử một loại subscription cụ thể hay không, bạn có thể truyền loại đó vào phương thức `onTrial` hoặc `hasExpiredTrial`:

```php
if ($user->onTrial('default')) {
    // ...
}

if ($user->hasExpiredTrial('default')) {
    // ...
}
```

<a name="without-payment-method-up-front"></a>
### Không thu thập phương thức thanh toán ngay từ đầu

Nếu muốn cung cấp thời gian dùng thử mà không thu thập thông tin phương thức thanh toán của người dùng ngay từ đầu, bạn có thể đặt cột `trial_ends_at` trên bản ghi customer gắn với người dùng thành ngày kết thúc dùng thử mong muốn. Việc này thường được thực hiện khi đăng ký người dùng:

```php
use App\Models\User;

$user = User::create([
    // ...
]);

$user->createAsCustomer([
    'trial_ends_at' => now()->plus(days: 10)
]);
```

Cashier gọi loại dùng thử này là "generic trial", vì nó không gắn với bất kỳ subscription hiện có nào. Phương thức `onTrial` trên instance `User` sẽ trả về `true` nếu ngày hiện tại chưa vượt quá giá trị `trial_ends_at`:

```php
if ($user->onTrial()) {
    // User is within their trial period...
}
```

Khi đã sẵn sàng tạo subscription thực tế cho người dùng, bạn có thể sử dụng phương thức `subscribe` như bình thường:

```php
use Illuminate\Http\Request;

Route::get('/user/subscribe', function (Request $request) {
    $checkout = $request->user()
        ->subscribe('pri_monthly')
        ->returnTo(route('home'));

    return view('billing', ['checkout' => $checkout]);
});
```

Để lấy ngày kết thúc dùng thử của người dùng, bạn có thể sử dụng phương thức `trialEndsAt`. Phương thức này trả về một instance ngày Carbon nếu người dùng đang dùng thử, hoặc `null` nếu không. Bạn cũng có thể truyền tham số loại subscription tùy chọn nếu muốn lấy ngày kết thúc dùng thử cho một subscription cụ thể khác với subscription mặc định:

```php
if ($user->onTrial('default')) {
    $trialEndsAt = $user->trialEndsAt();
}
```

Bạn có thể sử dụng phương thức `onGenericTrial` nếu muốn biết cụ thể rằng người dùng đang trong thời gian "generic trial" và chưa tạo subscription thực tế:

```php
if ($user->onGenericTrial()) {
    // User is within their "generic" trial period...
}
```

<a name="extend-or-activate-a-trial"></a>
### Gia hạn hoặc kích hoạt thời gian dùng thử

Bạn có thể gia hạn thời gian dùng thử hiện có của một subscription bằng cách gọi phương thức `extendTrial` và chỉ định thời điểm dùng thử sẽ kết thúc:

```php
$user->subscription()->extendTrial(now()->plus(days: 5));
```

Hoặc, bạn có thể kích hoạt subscription ngay lập tức bằng cách kết thúc thời gian dùng thử thông qua phương thức `activate` trên subscription:

```php
$user->subscription()->activate();
```

<a name="handling-paddle-webhooks"></a>
## Xử lý Paddle Webhooks

Paddle có thể thông báo cho ứng dụng của bạn về nhiều loại event thông qua webhook. Theo mặc định, một route trỏ đến webhook controller của Cashier được đăng ký bởi Cashier service provider. Controller này sẽ xử lý tất cả webhook request gửi đến.

Theo mặc định, controller này tự động xử lý việc hủy các subscription có quá nhiều lần tính phí thất bại, cập nhật subscription và thay đổi phương thức thanh toán. Tuy nhiên, như sẽ trình bày ngay sau đây, bạn có thể mở rộng cách xử lý để tiếp nhận bất kỳ Paddle webhook event nào mình muốn.

Để đảm bảo ứng dụng có thể xử lý Paddle webhook, hãy [cấu hình webhook URL trong Paddle control panel](https://vendors.paddle.com/notifications-v2). Theo mặc định, webhook controller của Cashier phản hồi tại URL path `/paddle/webhook`. Danh sách đầy đủ các webhook bạn nên bật trong Paddle control panel gồm:

- Customer Updated
- Transaction Completed
- Transaction Updated
- Subscription Created
- Subscription Updated
- Subscription Paused
- Subscription Canceled

> [!WARNING]
> Hãy đảm bảo bảo vệ các request gửi đến bằng middleware [xác minh chữ ký webhook](/docs/{{version}}/cashier-paddle#verifying-webhook-signatures) đi kèm Cashier.

<a name="webhooks-csrf-protection"></a>
#### Webhook và bảo vệ CSRF

Vì Paddle webhook cần bỏ qua cơ chế [bảo vệ CSRF](/docs/{{version}}/csrf) của Laravel, bạn cần đảm bảo Laravel không cố xác minh CSRF token đối với Paddle webhook gửi đến. Để thực hiện điều này, hãy loại trừ `paddle/*` khỏi bảo vệ CSRF trong file `bootstrap/app.php` của ứng dụng:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(except: [
        'paddle/*',
    ]);
})
```

<a name="webhooks-local-development"></a>
#### Webhook trong môi trường phát triển local

Để Paddle có thể gửi webhook đến ứng dụng trong quá trình phát triển local, bạn cần public ứng dụng thông qua một dịch vụ chia sẻ site như [Ngrok](https://ngrok.com/) hoặc [Expose](https://expose.dev/docs/introduction). Nếu đang phát triển ứng dụng local bằng [Laravel Sail](/docs/{{version}}/sail), bạn có thể sử dụng [lệnh chia sẻ site](/docs/{{version}}/sail#sharing-your-site) của Sail.

<a name="defining-webhook-event-handlers"></a>
### Định nghĩa webhook event handler

Cashier tự động xử lý việc hủy subscription khi tính phí thất bại và các Paddle webhook phổ biến khác. Tuy nhiên, nếu có thêm webhook event muốn xử lý, bạn có thể thực hiện bằng cách lắng nghe các event sau do Cashier dispatch:

- `Laravel\Paddle\Events\WebhookReceived`
- `Laravel\Paddle\Events\WebhookHandled`

Cả hai event đều chứa toàn bộ payload của Paddle webhook. Ví dụ, nếu muốn xử lý webhook `transaction.billed`, bạn có thể đăng ký một [listener](/docs/{{version}}/events#defining-listeners) để xử lý event:

```php
<?php

namespace App\Listeners;

use Laravel\Paddle\Events\WebhookReceived;

class PaddleEventListener
{
    /**
     * Handle received Paddle webhooks.
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['event_type'] === 'transaction.billed') {
            // Handle the incoming event...
        }
    }
}
```

Cashier cũng phát các event riêng tương ứng với loại webhook nhận được. Ngoài toàn bộ payload từ Paddle, các event này còn chứa những model liên quan đã được dùng để xử lý webhook, chẳng hạn billable model, subscription hoặc receipt:

<div class="content-list" markdown="1">

- `Laravel\Paddle\Events\CustomerUpdated`
- `Laravel\Paddle\Events\TransactionCompleted`
- `Laravel\Paddle\Events\TransactionUpdated`
- `Laravel\Paddle\Events\SubscriptionCreated`
- `Laravel\Paddle\Events\SubscriptionUpdated`
- `Laravel\Paddle\Events\SubscriptionPaused`
- `Laravel\Paddle\Events\SubscriptionCanceled`

</div>

Bạn cũng có thể ghi đè webhook route mặc định được tích hợp sẵn bằng cách định nghĩa biến môi trường `CASHIER_WEBHOOK` trong file `.env` của ứng dụng. Giá trị này phải là URL đầy đủ đến webhook route của bạn và cần khớp với URL được thiết lập trong Paddle control panel:

```ini
CASHIER_WEBHOOK=https://example.com/my-paddle-webhook-url
```

<a name="verifying-webhook-signatures"></a>
### Xác minh chữ ký webhook

Để bảo mật webhook, bạn có thể sử dụng [chữ ký webhook của Paddle](https://developer.paddle.com/webhooks/signature-verification). Để thuận tiện, Cashier tự động cung cấp middleware xác thực Paddle webhook request gửi đến là hợp lệ.

Để bật xác minh webhook, hãy đảm bảo biến môi trường `PADDLE_WEBHOOK_SECRET` được định nghĩa trong file `.env` của ứng dụng. Webhook secret có thể được lấy từ dashboard tài khoản Paddle.

<a name="single-charges"></a>
## Khoản thu một lần

<a name="charging-for-products"></a>
### Thu phí sản phẩm

Nếu muốn khởi tạo giao dịch mua sản phẩm cho khách hàng, bạn có thể sử dụng phương thức `checkout` trên instance billable model để tạo checkout session cho giao dịch. Phương thức `checkout` nhận một hoặc nhiều price ID. Khi cần, bạn có thể sử dụng associative array để cung cấp số lượng sản phẩm đang được mua:

```php
use Illuminate\Http\Request;

Route::get('/buy', function (Request $request) {
    $checkout = $request->user()->checkout(['pri_tshirt', 'pri_socks' => 5]);

    return view('buy', ['checkout' => $checkout]);
});
```

Sau khi tạo checkout session, bạn có thể sử dụng [Blade component](#overlay-checkout) `paddle-button` do Cashier cung cấp để cho phép người dùng mở Paddle checkout widget và hoàn tất giao dịch:

```blade
<x-paddle-button :checkout="$checkout" class="px-8 py-4">
    Buy
</x-paddle-button>
```

Checkout session có phương thức `customData`, cho phép bạn truyền dữ liệu tùy chỉnh vào transaction được tạo bên dưới. Hãy tham khảo [tài liệu Paddle](https://developer.paddle.com/build/transactions/custom-data) để tìm hiểu thêm về các tùy chọn khi truyền custom data:

```php
$checkout = $user->checkout('pri_tshirt')
    ->customData([
        'custom_option' => $value,
    ]);
```

<a name="refunding-transactions"></a>
### Hoàn tiền transaction

Hoàn tiền transaction sẽ trả số tiền được hoàn lại về phương thức thanh toán mà khách hàng đã sử dụng tại thời điểm mua. Nếu cần hoàn tiền một giao dịch Paddle, bạn có thể sử dụng phương thức `refund` trên model `Cashier\Paddle\Transaction`. Phương thức này nhận lý do làm đối số đầu tiên và một hoặc nhiều price ID cần hoàn tiền, với số tiền tùy chọn được cung cấp dưới dạng associative array. Bạn có thể lấy các transaction của một billable model nhất định bằng phương thức `transactions`.

Ví dụ, giả sử chúng ta muốn hoàn tiền một transaction cụ thể cho các price `pri_123` và `pri_456`. Ta muốn hoàn toàn bộ `pri_123`, nhưng chỉ hoàn hai đô-la cho `pri_456`:

```php
use App\Models\User;

$user = User::find(1);

$transaction = $user->transactions()->first();

$response = $transaction->refund('Accidental charge', [
    'pri_123', // Fully refund this price...
    'pri_456' => 200, // Only partially refund this price...
]);
```

Ví dụ trên hoàn tiền cho các line item cụ thể trong một transaction. Nếu muốn hoàn toàn bộ transaction, chỉ cần cung cấp lý do:

```php
$response = $transaction->refund('Accidental charge');
```

Để biết thêm thông tin về hoàn tiền, hãy tham khảo [tài liệu hoàn tiền của Paddle](https://developer.paddle.com/build/transactions/create-transaction-adjustments).

> [!WARNING]
> Các khoản hoàn tiền luôn phải được Paddle phê duyệt trước khi được xử lý hoàn tất.

<a name="crediting-transactions"></a>
### Ghi có transaction

Tương tự hoàn tiền, bạn cũng có thể ghi có transaction. Việc ghi có sẽ cộng tiền vào số dư của khách hàng để sử dụng cho các giao dịch mua trong tương lai. Chỉ có thể ghi có đối với transaction được thu thủ công, không áp dụng cho transaction được thu tự động (như subscription), vì Paddle tự động xử lý credit cho subscription:

```php
$transaction = $user->transactions()->first();

// Credit a specific line item fully...
$response = $transaction->credit('Compensation', 'pri_123');
```

Để biết thêm thông tin, hãy [xem tài liệu Paddle về credit](https://developer.paddle.com/build/transactions/create-transaction-adjustments).

> [!WARNING]
> Credit chỉ có thể áp dụng cho transaction được thu thủ công. Transaction được thu tự động sẽ do Paddle tự xử lý credit.

<a name="transactions"></a>
## Transaction

Bạn có thể dễ dàng lấy một mảng các transaction của billable model thông qua thuộc tính `transactions`:

```php
use App\Models\User;

$user = User::find(1);

$transactions = $user->transactions;
```

Transaction đại diện cho các khoản thanh toán cho sản phẩm và giao dịch mua của bạn, đồng thời đi kèm invoice. Chỉ những transaction đã hoàn tất mới được lưu trong database của ứng dụng.

Khi liệt kê transaction của khách hàng, bạn có thể sử dụng các phương thức trên instance transaction để hiển thị thông tin thanh toán liên quan. Ví dụ, bạn có thể liệt kê từng transaction trong một bảng để người dùng dễ dàng tải xuống invoice tương ứng:

```html
<table>
    @foreach ($transactions as $transaction)
        <tr>
            <td>{{ $transaction->billed_at->toFormattedDateString() }}</td>
            <td>{{ $transaction->total() }}</td>
            <td>{{ $transaction->tax() }}</td>
            <td><a href="{{ route('download-invoice', $transaction->id) }}" target="_blank">Download</a></td>
        </tr>
    @endforeach
</table>
```

Route `download-invoice` có thể có dạng như sau:

```php
use Illuminate\Http\Request;
use Laravel\Paddle\Transaction;

Route::get('/download-invoice/{transaction}', function (Request $request, Transaction $transaction) {
    return $transaction->redirectToInvoicePdf();
})->name('download-invoice');
```

<a name="past-and-upcoming-payments"></a>
### Khoản thanh toán trước đây và sắp tới

Bạn có thể sử dụng các phương thức `lastPayment` và `nextPayment` để lấy và hiển thị các khoản thanh toán trước đây hoặc sắp tới của khách hàng đối với subscription định kỳ:

```php
use App\Models\User;

$user = User::find(1);

$subscription = $user->subscription();

$lastPayment = $subscription->lastPayment();
$nextPayment = $subscription->nextPayment();
```

Cả hai phương thức đều trả về instance `Laravel\Paddle\Payment`; tuy nhiên, `lastPayment` trả về `null` khi transaction chưa được đồng bộ bởi webhook, còn `nextPayment` trả về `null` khi billing cycle đã kết thúc (chẳng hạn khi subscription đã bị hủy):

```blade
Next payment: {{ $nextPayment->amount() }} due on {{ $nextPayment->date()->format('d/m/Y') }}
```

<a name="testing"></a>
## Kiểm thử

Khi kiểm thử, bạn nên kiểm tra thủ công billing flow để đảm bảo integration hoạt động như mong đợi.

Đối với automated test, bao gồm các test được chạy trong môi trường CI, bạn có thể sử dụng [HTTP Client của Laravel](/docs/{{version}}/http-client#testing) để giả lập các HTTP call gửi đến Paddle. Mặc dù cách này không kiểm thử response thực tế từ Paddle, nó cung cấp một phương thức để kiểm thử ứng dụng mà không thực sự gọi Paddle API.
