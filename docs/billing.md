# Laravel Cashier (Stripe)

<a name="introduction"></a>
## Giới thiệu

[Laravel Cashier Stripe](https://github.com/laravel/cashier-stripe) cung cấp một giao diện biểu đạt, fluent để làm việc với các dịch vụ thanh toán theo gói đăng ký của [Stripe](https://stripe.com). Cashier xử lý gần như toàn bộ phần mã thanh toán đăng ký lặp lại mà bạn thường phải tự viết. Ngoài việc quản lý gói đăng ký cơ bản, Cashier còn hỗ trợ coupon, chuyển đổi gói đăng ký, số lượng đăng ký, thời gian gia hạn khi hủy và thậm chí tạo hóa đơn PDF.

<a name="upgrading-cashier"></a>
## Nâng cấp Cashier

Khi nâng cấp lên phiên bản Cashier mới, điều quan trọng là bạn cần xem xét kỹ [hướng dẫn nâng cấp](https://github.com/laravel/cashier-stripe/blob/16.x/UPGRADE.md).

> [!WARNING]
> Để tránh các breaking change, Cashier sử dụng một phiên bản Stripe API cố định. Cashier 16 sử dụng Stripe API phiên bản `2025-06-30.basil`. Phiên bản Stripe API sẽ được cập nhật trong các bản phát hành minor để tận dụng các tính năng và cải tiến mới của Stripe.

<a name="installation"></a>
## Cài đặt

Trước tiên, hãy cài đặt package Cashier cho Stripe bằng trình quản lý package Composer:

```shell
composer require laravel/cashier
```

Sau khi cài đặt package, hãy publish các migration của Cashier bằng lệnh Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-migrations"
```

Sau đó, hãy chạy migration cho cơ sở dữ liệu:

```shell
php artisan migrate
```

Các migration của Cashier sẽ thêm một số cột vào bảng `users`. Chúng cũng tạo bảng `subscriptions` mới để lưu toàn bộ gói đăng ký của khách hàng và bảng `subscription_items` dành cho các gói đăng ký có nhiều mức giá.

Nếu muốn, bạn cũng có thể publish file cấu hình của Cashier bằng lệnh Artisan `vendor:publish`:

```shell
php artisan vendor:publish --tag="cashier-config"
```

Cuối cùng, để bảo đảm Cashier xử lý đúng tất cả sự kiện Stripe, hãy nhớ [cấu hình xử lý webhook của Cashier](#handling-stripe-webhooks).

> [!WARNING]
> Stripe khuyến nghị mọi cột dùng để lưu định danh Stripe nên phân biệt chữ hoa chữ thường. Vì vậy, khi sử dụng MySQL, bạn nên bảo đảm collation của cột `stripe_id` được đặt thành `utf8_bin`. Bạn có thể xem thêm thông tin trong [tài liệu Stripe](https://stripe.com/docs/upgrades#what-changes-does-stripe-consider-to-be-backwards-compatible).

<a name="configuration"></a>
## Cấu hình

<a name="billable-model"></a>
### Model có thể thanh toán

Trước khi sử dụng Cashier, hãy thêm trait `Billable` vào định nghĩa model có thể thanh toán. Thông thường đây sẽ là model `App\Models\User`. Trait này cung cấp nhiều phương thức để thực hiện các tác vụ thanh toán phổ biến như tạo gói đăng ký, áp dụng coupon và cập nhật thông tin phương thức thanh toán:

```php
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use Billable;
}
```

Cashier mặc định model có thể thanh toán của bạn là class `App\Models\User` đi kèm Laravel. Nếu muốn thay đổi, bạn có thể chỉ định model khác thông qua phương thức `useCustomerModel`. Phương thức này thường nên được gọi trong phương thức `boot` của class `AppServiceProvider`:

```php
use App\Models\Cashier\User;
use Laravel\Cashier\Cashier;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::useCustomerModel(User::class);
}
```

> [!WARNING]
> Nếu sử dụng model khác với `App\Models\User` do Laravel cung cấp, bạn cần publish và chỉnh sửa các [migration của Cashier](#installation) để khớp với tên bảng của model thay thế.

<a name="api-keys"></a>
### Khóa API

Tiếp theo, bạn nên cấu hình các khóa Stripe API trong file `.env` của ứng dụng. Bạn có thể lấy các khóa Stripe API từ bảng điều khiển Stripe:

```ini
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

> [!WARNING]
> Bạn cần bảo đảm biến môi trường `STRIPE_WEBHOOK_SECRET` được khai báo trong file `.env` của ứng dụng, vì biến này được dùng để xác minh các webhook gửi đến thực sự đến từ Stripe.

<a name="currency-configuration"></a>
### Cấu hình tiền tệ

Tiền tệ mặc định của Cashier là đô la Mỹ (USD). Bạn có thể thay đổi tiền tệ mặc định bằng cách đặt biến môi trường `CASHIER_CURRENCY` trong file `.env` của ứng dụng:

```ini
CASHIER_CURRENCY=eur
```

Ngoài việc cấu hình tiền tệ của Cashier, bạn cũng có thể chỉ định locale dùng khi định dạng giá trị tiền để hiển thị trên hóa đơn. Bên trong, Cashier sử dụng [class `NumberFormatter` của PHP](https://www.php.net/manual/en/class.numberformatter.php) để thiết lập locale tiền tệ:

```ini
CASHIER_CURRENCY_LOCALE=nl_BE
```

> [!WARNING]
> Để sử dụng locale khác `en`, hãy bảo đảm extension PHP `ext-intl` đã được cài đặt và cấu hình trên máy chủ.

<a name="tax-configuration"></a>
### Cấu hình thuế

Nhờ [Stripe Tax](https://stripe.com/tax), bạn có thể tự động tính thuế cho mọi hóa đơn do Stripe tạo. Bạn có thể bật tính thuế tự động bằng cách gọi phương thức `calculateTaxes` trong phương thức `boot` của class `App\Providers\AppServiceProvider`:

```php
use Laravel\Cashier\Cashier;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::calculateTaxes();
}
```

Sau khi bật tính thuế, mọi gói đăng ký mới và hóa đơn một lần được tạo sẽ được tự động tính thuế.

Để tính năng này hoạt động chính xác, thông tin thanh toán của khách hàng như tên, địa chỉ và mã số thuế cần được đồng bộ với Stripe. Bạn có thể sử dụng các phương thức [đồng bộ dữ liệu khách hàng](#syncing-customer-data-with-stripe) và [Tax ID](#tax-ids) do Cashier cung cấp để thực hiện việc này.

<a name="logging"></a>
### Ghi log

Cashier cho phép bạn chỉ định log channel dùng khi ghi lại các lỗi Stripe nghiêm trọng. Bạn có thể chỉ định log channel bằng biến môi trường `CASHIER_LOGGER` trong file `.env` của ứng dụng:

```ini
CASHIER_LOGGER=stack
```

Các exception phát sinh từ lời gọi API đến Stripe sẽ được ghi qua log channel mặc định của ứng dụng.

<a name="using-custom-models"></a>
### Sử dụng model tùy chỉnh

Bạn có thể mở rộng các model mà Cashier sử dụng nội bộ bằng cách định nghĩa model riêng và kế thừa model Cashier tương ứng:

```php
use Laravel\Cashier\Subscription as CashierSubscription;

class Subscription extends CashierSubscription
{
    // ...
}
```

Sau khi định nghĩa model, bạn có thể yêu cầu Cashier sử dụng model tùy chỉnh thông qua class `Laravel\Cashier\Cashier`. Thông thường, bạn nên khai báo các model tùy chỉnh cho Cashier trong phương thức `boot` của class `App\Providers\AppServiceProvider` của ứng dụng:

```php
use App\Models\Cashier\Subscription;
use App\Models\Cashier\SubscriptionItem;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Cashier::useSubscriptionModel(Subscription::class);
    Cashier::useSubscriptionItemModel(SubscriptionItem::class);
}
```

<a name="quickstart"></a>
## Bắt đầu nhanh

<a name="quickstart-selling-products"></a>
### Bán sản phẩm

> [!NOTE]
> Trước khi sử dụng Stripe Checkout, bạn nên định nghĩa các Product với mức giá cố định trong Stripe dashboard. Ngoài ra, bạn cần [cấu hình xử lý webhook của Cashier](#handling-stripe-webhooks).

Việc cung cấp thanh toán sản phẩm và gói đăng ký trong ứng dụng có thể khá phức tạp. Tuy nhiên, nhờ Cashier và [Stripe Checkout](https://stripe.com/payments/checkout), bạn có thể dễ dàng xây dựng tích hợp thanh toán hiện đại và vững chắc.

Để thu tiền khách hàng cho các sản phẩm thanh toán một lần, không lặp lại, chúng ta sẽ dùng Cashier để chuyển khách hàng đến Stripe Checkout, nơi họ cung cấp thông tin thanh toán và xác nhận giao dịch mua. Sau khi thanh toán qua Checkout hoàn tất, khách hàng sẽ được chuyển hướng đến URL thành công do bạn lựa chọn trong ứng dụng:

```php
use Illuminate\Http\Request;

Route::get('/checkout', function (Request $request) {
    $stripePriceId = 'price_deluxe_album';

    $quantity = 1;

    return $request->user()->checkout([$stripePriceId => $quantity], [
        'success_url' => route('checkout-success'),
        'cancel_url' => route('checkout-cancel'),
    ]);
})->name('checkout');

Route::view('/checkout/success', 'checkout.success')->name('checkout-success');
Route::view('/checkout/cancel', 'checkout.cancel')->name('checkout-cancel');
```

Như ví dụ trên, chúng ta sử dụng phương thức `checkout` do Cashier cung cấp để chuyển khách hàng đến Stripe Checkout với một "price identifier" cụ thể. Trong Stripe, "price" là [mức giá đã được định nghĩa cho một sản phẩm cụ thể](https://stripe.com/docs/products-prices/how-products-and-prices-work).

Nếu cần, phương thức `checkout` sẽ tự động tạo khách hàng trong Stripe và liên kết bản ghi khách hàng Stripe đó với user tương ứng trong cơ sở dữ liệu của ứng dụng. Sau khi hoàn tất phiên checkout, khách hàng sẽ được chuyển đến trang thành công hoặc hủy riêng, nơi bạn có thể hiển thị thông báo phù hợp.

<a name="providing-meta-data-to-stripe-checkout"></a>
#### Cung cấp metadata cho Stripe Checkout

Khi bán sản phẩm, thông thường ứng dụng sẽ theo dõi các đơn hàng đã hoàn tất và sản phẩm đã mua thông qua các model `Cart` và `Order` do chính ứng dụng định nghĩa. Khi chuyển khách hàng đến Stripe Checkout để hoàn tất giao dịch, bạn có thể cần cung cấp định danh của đơn hàng hiện có để liên kết giao dịch đã hoàn tất với đúng đơn hàng khi khách hàng được chuyển trở lại ứng dụng.

Để thực hiện việc này, bạn có thể truyền một mảng `metadata` vào phương thức `checkout`. Giả sử một `Order` ở trạng thái chờ được tạo trong ứng dụng khi user bắt đầu quy trình checkout. Lưu ý rằng các model `Cart` và `Order` trong ví dụ chỉ mang tính minh họa và không được Cashier cung cấp. Bạn có thể tự triển khai các khái niệm này theo nhu cầu của ứng dụng:

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

    return $request->user()->checkout($order->price_ids, [
        'success_url' => route('checkout-success').'?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => route('checkout-cancel'),
        'metadata' => ['order_id' => $order->id],
    ]);
})->name('checkout');
```

Như ví dụ trên, khi user bắt đầu quy trình checkout, chúng ta truyền toàn bộ Stripe price identifier liên quan đến giỏ hàng / đơn hàng vào phương thức `checkout`. Ứng dụng của bạn chịu trách nhiệm liên kết các mục này với "shopping cart" hoặc đơn hàng khi khách hàng thêm chúng. Chúng ta cũng truyền ID của đơn hàng vào phiên Stripe Checkout qua mảng `metadata`. Cuối cùng, biến template `CHECKOUT_SESSION_ID` được thêm vào route thành công của Checkout. Khi Stripe chuyển khách hàng trở lại ứng dụng, biến template này sẽ tự động được điền bằng ID của phiên Checkout.

Tiếp theo, hãy xây dựng route thành công của Checkout. Đây là route mà user được chuyển đến sau khi giao dịch mua hoàn tất qua Stripe Checkout. Trong route này, chúng ta có thể lấy ID phiên Stripe Checkout và instance Stripe Checkout tương ứng để truy cập metadata đã cung cấp và cập nhật đơn hàng của khách hàng:

```php
use App\Models\Order;
use Illuminate\Http\Request;
use Laravel\Cashier\Cashier;

Route::get('/checkout/success', function (Request $request) {
    $sessionId = $request->get('session_id');

    if ($sessionId === null) {
        return;
    }

    $session = Cashier::stripe()->checkout->sessions->retrieve($sessionId);

    if ($session->payment_status !== 'paid') {
        return;
    }

    $orderId = $session['metadata']['order_id'] ?? null;

    $order = Order::findOrFail($orderId);

    $order->update(['status' => 'completed']);

    return view('checkout-success', ['order' => $order]);
})->name('checkout-success');
```

Hãy tham khảo tài liệu Stripe để biết thêm về [dữ liệu có trong đối tượng Checkout session](https://stripe.com/docs/api/checkout/sessions/object).

<a name="quickstart-selling-subscriptions"></a>
### Bán gói đăng ký

> [!NOTE]
> Trước khi sử dụng Stripe Checkout, bạn nên định nghĩa các Product với mức giá cố định trong Stripe dashboard. Ngoài ra, bạn cần [cấu hình xử lý webhook của Cashier](#handling-stripe-webhooks).

Việc cung cấp thanh toán sản phẩm và gói đăng ký trong ứng dụng có thể khá phức tạp. Tuy nhiên, nhờ Cashier và [Stripe Checkout](https://stripe.com/payments/checkout), bạn có thể dễ dàng xây dựng tích hợp thanh toán hiện đại và vững chắc.

Để tìm hiểu cách bán gói đăng ký bằng Cashier và Stripe Checkout, hãy xét một dịch vụ đăng ký đơn giản có gói Basic theo tháng (`price_basic_monthly`) và theo năm (`price_basic_yearly`). Hai mức giá này có thể được nhóm dưới một sản phẩm "Basic" (`pro_basic`) trong Stripe dashboard. Ngoài ra, dịch vụ có thể cung cấp gói Expert dưới dạng `pro_expert`.

Trước tiên, hãy xem cách khách hàng đăng ký dịch vụ. Chẳng hạn, khách hàng có thể nhấn nút "subscribe" cho gói Basic trên trang giá của ứng dụng. Nút hoặc liên kết này nên chuyển user đến một route Laravel để tạo phiên Stripe Checkout cho gói họ đã chọn:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_basic_monthly')
        ->trialDays(5)
        ->allowPromotionCodes()
        ->checkout([
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

Như ví dụ trên, chúng ta chuyển khách hàng đến một phiên Stripe Checkout để họ đăng ký gói Basic. Sau khi checkout thành công hoặc bị hủy, khách hàng sẽ được chuyển trở lại URL đã truyền cho phương thức `checkout`. Để biết chính xác khi nào gói đăng ký thực sự bắt đầu (vì một số phương thức thanh toán cần vài giây để xử lý), chúng ta cũng cần [cấu hình xử lý webhook của Cashier](#handling-stripe-webhooks).

Khi khách hàng đã có thể bắt đầu đăng ký, chúng ta cần giới hạn một số phần của ứng dụng để chỉ user đã đăng ký mới truy cập được. Bạn luôn có thể xác định trạng thái đăng ký hiện tại của user thông qua phương thức `subscribed` do trait `Billable` của Cashier cung cấp:

```blade
@if ($user->subscribed())
    <p>You are subscribed.</p>
@endif
```

Chúng ta cũng có thể dễ dàng xác định user có đăng ký một sản phẩm hoặc mức giá cụ thể hay không:

```blade
@if ($user->subscribedToProduct('pro_basic'))
    <p>You are subscribed to our Basic product.</p>
@endif

@if ($user->subscribedToPrice('price_basic_monthly'))
    <p>You are subscribed to our monthly Basic plan.</p>
@endif
```

<a name="quickstart-building-a-subscribed-middleware"></a>
#### Xây dựng middleware kiểm tra đăng ký

Để thuận tiện, bạn có thể tạo một [middleware](/docs/{{version}}/middleware) để xác định request gửi đến có thuộc về user đã đăng ký hay không. Sau khi định nghĩa middleware, bạn có thể gán nó cho route để ngăn user chưa đăng ký truy cập route đó:

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
            return redirect('/billing');
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

Khách hàng có thể muốn chuyển gói đăng ký sang một sản phẩm hoặc "tier" khác. Cách đơn giản nhất là chuyển họ đến [Customer Billing Portal](https://stripe.com/docs/no-code/customer-portal) của Stripe, giao diện do Stripe host cho phép khách hàng tải hóa đơn, cập nhật phương thức thanh toán và thay đổi gói đăng ký.

Trước tiên, hãy định nghĩa một liên kết hoặc nút trong ứng dụng để chuyển user đến route Laravel dùng để khởi tạo phiên Billing Portal:

```blade
<a href="{{ route('billing') }}">
    Billing
</a>
```

Tiếp theo, hãy định nghĩa route khởi tạo phiên Stripe Customer Billing Portal và chuyển user đến Portal. Phương thức `redirectToBillingPortal` nhận URL mà user sẽ được chuyển về khi rời Portal:

```php
use Illuminate\Http\Request;

Route::get('/billing', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('dashboard'));
})->middleware(['auth'])->name('billing');
```

> [!NOTE]
> Miễn là bạn đã cấu hình xử lý webhook của Cashier, Cashier sẽ tự động giữ các bảng cơ sở dữ liệu liên quan đến Cashier trong ứng dụng đồng bộ bằng cách kiểm tra webhook gửi đến từ Stripe. Ví dụ, khi user hủy gói đăng ký qua Stripe Customer Billing Portal, Cashier sẽ nhận webhook tương ứng và đánh dấu gói đăng ký là "canceled" trong cơ sở dữ liệu của ứng dụng.

<a name="customers"></a>
## Khách hàng

<a name="retrieving-customers"></a>
### Truy xuất khách hàng

Bạn có thể truy xuất khách hàng theo Stripe ID bằng phương thức `Cashier::findBillable`. Phương thức này trả về một instance của model có thể thanh toán:

```php
use Laravel\Cashier\Cashier;

$user = Cashier::findBillable($stripeId);
```

<a name="creating-customers"></a>
### Tạo khách hàng

Đôi khi bạn có thể muốn tạo khách hàng Stripe mà chưa bắt đầu gói đăng ký. Bạn có thể thực hiện việc này bằng phương thức `createAsStripeCustomer`:

```php
$stripeCustomer = $user->createAsStripeCustomer();
```

Sau khi khách hàng được tạo trong Stripe, bạn có thể bắt đầu gói đăng ký vào thời điểm sau. Bạn có thể truyền mảng `$options` tùy chọn chứa các [tham số tạo khách hàng bổ sung được Stripe API hỗ trợ](https://stripe.com/docs/api/customers/create):

```php
$stripeCustomer = $user->createAsStripeCustomer($options);
```

Bạn có thể dùng phương thức `asStripeCustomer` nếu muốn trả về đối tượng khách hàng Stripe cho một model có thể thanh toán:

```php
$stripeCustomer = $user->asStripeCustomer();
```

Có thể dùng phương thức `createOrGetStripeCustomer` khi bạn muốn lấy đối tượng khách hàng Stripe cho một model có thể thanh toán nhưng không chắc model đó đã là khách hàng trong Stripe hay chưa. Phương thức này sẽ tạo khách hàng mới trong Stripe nếu chưa tồn tại:

```php
$stripeCustomer = $user->createOrGetStripeCustomer();
```

<a name="updating-customers"></a>
### Cập nhật khách hàng

Đôi khi bạn có thể muốn cập nhật trực tiếp khách hàng Stripe với thông tin bổ sung. Bạn có thể thực hiện bằng phương thức `updateStripeCustomer`. Phương thức này nhận một mảng [tùy chọn cập nhật khách hàng được Stripe API hỗ trợ](https://stripe.com/docs/api/customers/update):

```php
$stripeCustomer = $user->updateStripeCustomer($options);
```

<a name="balances"></a>
### Số dư

Stripe cho phép bạn ghi có hoặc ghi nợ vào "số dư" của khách hàng. Sau đó, số dư này sẽ được ghi có hoặc ghi nợ trên các hóa đơn mới. Để kiểm tra tổng số dư của khách hàng, bạn có thể dùng phương thức `balance` có trên billable model. Phương thức `balance` trả về chuỗi số dư đã được định dạng theo đơn vị tiền tệ của khách hàng:

```php
$balance = $user->balance();
```

Để ghi có vào số dư của khách hàng, hãy truyền một giá trị cho phương thức `creditBalance`. Nếu muốn, bạn cũng có thể cung cấp mô tả:

```php
$user->creditBalance(500, 'Premium customer top-up.');
```

Truyền một giá trị cho phương thức `debitBalance` sẽ ghi nợ vào số dư của khách hàng:

```php
$user->debitBalance(300, 'Bad usage penalty.');
```

Phương thức `applyBalance` sẽ tạo các giao dịch số dư khách hàng mới. Bạn có thể truy xuất các bản ghi giao dịch này bằng phương thức `balanceTransactions`, hữu ích khi cần cung cấp lịch sử ghi có và ghi nợ để khách hàng xem lại:

```php
// Retrieve all transactions...
$transactions = $user->balanceTransactions();

foreach ($transactions as $transaction) {
    // Transaction amount...
    $amount = $transaction->amount(); // $2.31

    // Retrieve the related invoice when available...
    $invoice = $transaction->invoice();
}
```

<a name="tax-ids"></a>
### Mã số thuế

Cashier cung cấp cách thuận tiện để quản lý Tax ID của khách hàng. Ví dụ, phương thức `taxIds` có thể được dùng để truy xuất tất cả [Tax ID](https://stripe.com/docs/api/customer_tax_ids/object) đã gán cho khách hàng dưới dạng collection:

```php
$taxIds = $user->taxIds();
```

Bạn cũng có thể truy xuất một Tax ID cụ thể của khách hàng theo identifier:

```php
$taxId = $user->findTaxId('txi_belgium');
```

Bạn có thể tạo Tax ID mới bằng cách truyền [type](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-type) hợp lệ và value cho phương thức `createTaxId`:

```php
$taxId = $user->createTaxId('eu_vat', 'BE0123456789');
```

Phương thức `createTaxId` sẽ ngay lập tức thêm VAT ID vào tài khoản khách hàng. [Stripe cũng thực hiện xác minh VAT ID](https://stripe.com/docs/invoicing/customer/tax-ids#validation); tuy nhiên, đây là quá trình bất đồng bộ. Bạn có thể nhận thông báo về cập nhật xác minh bằng cách đăng ký webhook event `customer.tax_id.updated` và kiểm tra [tham số `verification` của VAT ID](https://stripe.com/docs/api/customer_tax_ids/object#tax_id_object-verification). Để biết thêm về xử lý webhook, hãy xem [tài liệu định nghĩa webhook handler](#handling-stripe-webhooks).

Bạn có thể xóa Tax ID bằng phương thức `deleteTaxId`:

```php
$user->deleteTaxId('txi_belgium');
```

<a name="syncing-customer-data-with-stripe"></a>
### Đồng bộ dữ liệu khách hàng với Stripe

Thông thường, khi người dùng cập nhật tên, địa chỉ email hoặc thông tin khác cũng được Stripe lưu trữ, bạn nên thông báo các thay đổi này cho Stripe. Nhờ đó, bản sao dữ liệu tại Stripe sẽ đồng bộ với dữ liệu của ứng dụng.

Để tự động hóa việc này, bạn có thể định nghĩa event listener trên billable model để phản ứng với event `updated` của model. Sau đó, trong event listener, hãy gọi phương thức `syncStripeCustomerDetails` trên model:

```php
use App\Models\User;
use function Illuminate\Events\queueable;

/**
 * The "booted" method of the model.
 */
protected static function booted(): void
{
    static::updated(queueable(function (User $customer) {
        if ($customer->hasStripeId()) {
            $customer->syncStripeCustomerDetails();
        }
    }));
}
```

Từ đây, mỗi khi customer model được cập nhật, thông tin của nó sẽ được đồng bộ với Stripe. Để thuận tiện, Cashier cũng tự động đồng bộ thông tin khách hàng với Stripe khi khách hàng được tạo lần đầu.

Bạn có thể tùy chỉnh các cột dùng để đồng bộ thông tin khách hàng với Stripe bằng cách override nhiều phương thức do Cashier cung cấp. Ví dụ, bạn có thể override phương thức `stripeName` để tùy chỉnh attribute được xem là "tên" khách hàng khi Cashier đồng bộ thông tin với Stripe:

```php
/**
 * Get the customer name that should be synced to Stripe.
 */
public function stripeName(): string|null
{
    return $this->company_name;
}
```

Tương tự, bạn có thể override các phương thức `stripeEmail`, `stripePhone` (tối đa 20 ký tự), `stripeAddress` và `stripePreferredLocales`. Các phương thức này sẽ đồng bộ thông tin vào tham số customer tương ứng khi [cập nhật Stripe customer object](https://stripe.com/docs/api/customers/update). Nếu muốn kiểm soát hoàn toàn quá trình đồng bộ thông tin khách hàng, bạn có thể override phương thức `syncStripeCustomerDetails`.

<a name="billing-portal"></a>
### Cổng thanh toán

Stripe cung cấp [cách thuận tiện để thiết lập billing portal](https://stripe.com/docs/billing/subscriptions/customer-portal), cho phép khách hàng quản lý subscription, phương thức thanh toán và xem lịch sử billing. Bạn có thể chuyển hướng người dùng đến billing portal bằng cách gọi phương thức `redirectToBillingPortal` trên billable model từ controller hoặc route:

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal();
});
```

Theo mặc định, khi người dùng quản lý subscription xong, họ có thể quay lại route `home` của ứng dụng qua một liên kết trong Stripe billing portal. Bạn có thể cung cấp URL tùy chỉnh để người dùng quay lại bằng cách truyền URL làm đối số cho phương thức `redirectToBillingPortal`:

```php
use Illuminate\Http\Request;

Route::get('/billing-portal', function (Request $request) {
    return $request->user()->redirectToBillingPortal(route('billing'));
});
```

Nếu muốn tạo URL đến cổng thanh toán mà không tạo HTTP redirect response, bạn có thể gọi phương thức `billingPortalUrl`:

```php
$url = $request->user()->billingPortalUrl(route('billing'));
```

<a name="payment-methods"></a>
## Phương thức thanh toán

<a name="storing-payment-methods"></a>
### Lưu phương thức thanh toán

Để tạo gói đăng ký hoặc thực hiện các khoản thanh toán "một lần" với Stripe, ứng dụng của bạn cần thu thập thông tin thanh toán của khách hàng một cách an toàn. Cách thực hiện sẽ khác nhau tùy vào việc bạn muốn lưu phương thức thanh toán cho các gói đăng ký trong tương lai hay xử lý ngay một khoản thanh toán đơn lẻ, vì vậy chúng ta sẽ xem xét cả hai trường hợp bên dưới.

Bạn có thể sử dụng [Payment Element](https://stripe.com/docs/payments/payment-element) của Stripe để hỗ trợ nhiều phương thức thanh toán như thẻ, Apple Pay, Google Pay và iDEAL.

<a name="payment-element-for-subscriptions"></a>
#### Payment Element cho gói đăng ký

Trước tiên, hãy tạo một Setup Intent và truyền nó vào view của bạn:

```php
return view('subscribe', [
    'intent' => $user->createSetupIntent()
]);
```

Mount Payment Element bằng `client_secret` của Setup Intent:

```html
<div id="payment-element"></div>
<button id="submit">Subscribe</button>

<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements({
        clientSecret: '{{ $intent->client_secret }}'
    });

    const paymentElement = elements.create('payment');

    paymentElement.mount('#payment-element');

    document.getElementById('submit').addEventListener('click', async () => {
        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: '{{ route("subscription.complete") }}',
            },
        });

        if (error) {
            // Display "error.message" to the user...
        }
    });
</script>
```

Sau khi Stripe chuyển hướng về `return_url`, ID `setup_intent` sẽ có trong tham số query string. Bạn có thể dùng giá trị này để truy xuất phương thức thanh toán và tạo gói đăng ký:

```php
use Illuminate\Http\Request;

Route::get('/subscription/complete', function (Request $request) {
    $setupIntent = $request->user()->findSetupIntent(
        $request->setup_intent
    );

    $paymentMethod = $setupIntent->payment_method;

    $request->user()
        ->newSubscription('default', 'price_xxx')
        ->create($paymentMethod);

    return redirect('/dashboard');
})->name('subscription.complete');
```

Nếu bạn dùng Payment Element để cập nhật phương thức thanh toán mặc định của khách hàng thay vì tạo gói đăng ký, bạn có thể truyền định danh phương thức thanh toán vào phương thức [`updateDefaultPaymentMethod`](#updating-the-default-payment-method).

<a name="payment-element-for-single-charges"></a>
#### Payment Element cho khoản thanh toán một lần

Đối với khoản thanh toán một lần, hãy tạo Payment Intent bằng phương thức `pay` của Cashier. Thông thường, bạn nên lưu ID Payment Intent vào đơn hàng tương ứng trong ứng dụng để có thể truy xuất đơn hàng sau khi Stripe chuyển hướng khách hàng trở lại ứng dụng. Ví dụ sau giả định ứng dụng có model `Order` với các cột `user_id`, `amount`, `status` và `stripe_payment_intent_id`:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $amount = 1000;

    $payment = $request->user()->pay($amount);

    $order = Order::create([
        'user_id' => $request->user()->id,
        'amount' => $amount,
        'status' => 'pending',
        'stripe_payment_intent_id' => $payment->id,
    ]);

    return view('checkout', [
        'clientSecret' => $payment->client_secret,
        'order' => $order,
    ]);
});
```

Sau đó, mount Payment Element và xác nhận thanh toán:

```html
<div id="payment-element"></div>
<button id="submit">Pay Now</button>

<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe('stripe-public-key');

    const elements = stripe.elements({
        clientSecret: '{{ $clientSecret }}'
    });

    const paymentElement = elements.create('payment');

    paymentElement.mount('#payment-element');

    document.getElementById('submit').addEventListener('click', async () => {
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: '{{ route("payment.complete") }}',
            },
        });

        if (error) {
            // Display "error.message" to the user...
        }
    });
</script>
```

Sau khi chuyển hướng, bạn có thể dùng tham số query string `payment_intent` để truy xuất đơn hàng và Payment Intent tương ứng. Trước khi hoàn tất đơn hàng, bạn nên xác minh rằng đơn hàng thuộc về khách hàng đã xác thực, đồng thời Payment Intent cũng thuộc về khách hàng đó và đã thanh toán thành công:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/payment/complete', function (Request $request) {
    $order = Order::where('user_id', $request->user()->id)
        ->where('stripe_payment_intent_id', $request->payment_intent)
        ->firstOrFail();

    $paymentIntent = $request->user()
        ->stripe()
        ->paymentIntents
        ->retrieve($request->payment_intent);

    if ($paymentIntent->customer === $request->user()->stripe_id &&
        $paymentIntent->status === 'succeeded') {
        $order->update(['status' => 'paid']);

        // Fulfill the order...
    }

    return redirect('/dashboard');
})->name('payment.complete');
```

<a name="retrieving-payment-methods"></a>
### Truy xuất phương thức thanh toán

Phương thức `paymentMethods` trên instance model có thể thanh toán trả về một collection các instance `Laravel\Cashier\PaymentMethod`:

```php
$paymentMethods = $user->paymentMethods();
```

Mặc định, phương thức này trả về các phương thức thanh toán thuộc mọi loại. Để truy xuất phương thức thanh toán của một loại cụ thể, bạn có thể truyền `type` làm đối số:

```php
$paymentMethods = $user->paymentMethods('sepa_debit');
```

Để truy xuất phương thức thanh toán mặc định của khách hàng, bạn có thể dùng phương thức `defaultPaymentMethod`:

```php
$paymentMethod = $user->defaultPaymentMethod();
```

Bạn có thể truy xuất một phương thức thanh toán cụ thể đã gắn với model có thể thanh toán bằng phương thức `findPaymentMethod`:

```php
$paymentMethod = $user->findPaymentMethod($paymentMethodId);
```

<a name="payment-method-presence"></a>
### Kiểm tra sự tồn tại của phương thức thanh toán

Để xác định model có thể thanh toán đã có phương thức thanh toán mặc định gắn với tài khoản hay chưa, hãy gọi phương thức `hasDefaultPaymentMethod`:

```php
if ($user->hasDefaultPaymentMethod()) {
    // ...
}
```

Bạn có thể dùng phương thức `hasPaymentMethod` để xác định model có thể thanh toán có ít nhất một phương thức thanh toán gắn với tài khoản hay không:

```php
if ($user->hasPaymentMethod()) {
    // ...
}
```

Phương thức này xác định model có thể thanh toán có bất kỳ phương thức thanh toán nào hay không. Để kiểm tra một phương thức thanh toán thuộc loại cụ thể có tồn tại cho model hay không, bạn có thể truyền `type` làm đối số:

```php
if ($user->hasPaymentMethod('sepa_debit')) {
    // ...
}
```

<a name="updating-the-default-payment-method"></a>
### Cập nhật phương thức thanh toán mặc định

Phương thức `updateDefaultPaymentMethod` có thể được dùng để cập nhật thông tin phương thức thanh toán mặc định của khách hàng. Phương thức này nhận định danh phương thức thanh toán của Stripe và gán phương thức mới làm phương thức thanh toán mặc định:

```php
$user->updateDefaultPaymentMethod($paymentMethod);
```

Để đồng bộ thông tin phương thức thanh toán mặc định với thông tin phương thức thanh toán mặc định của khách hàng trên Stripe, bạn có thể dùng phương thức `updateDefaultPaymentMethodFromStripe`:

```php
$user->updateDefaultPaymentMethodFromStripe();
```

> [!WARNING]
> Phương thức thanh toán mặc định của khách hàng chỉ có thể được dùng để lập hóa đơn và tạo gói đăng ký mới. Do giới hạn của Stripe, phương thức này không thể được dùng cho các khoản thanh toán đơn lẻ.

<a name="adding-payment-methods"></a>
### Thêm phương thức thanh toán

Để thêm phương thức thanh toán mới, bạn có thể gọi phương thức `addPaymentMethod` trên model có thể thanh toán và truyền vào định danh phương thức thanh toán:

```php
$user->addPaymentMethod($paymentMethod);
```

> [!NOTE]
> Để tìm hiểu cách truy xuất định danh phương thức thanh toán, hãy xem [tài liệu về lưu phương thức thanh toán](#storing-payment-methods).

<a name="deleting-payment-methods"></a>
### Xóa phương thức thanh toán

Để xóa một phương thức thanh toán, bạn có thể gọi phương thức `delete` trên instance `Laravel\Cashier\PaymentMethod` mà bạn muốn xóa:

```php
$paymentMethod->delete();
```

Phương thức `deletePaymentMethod` sẽ xóa một phương thức thanh toán cụ thể khỏi model có thể thanh toán:

```php
$user->deletePaymentMethod('pm_visa');
```

Phương thức `deletePaymentMethods` sẽ xóa toàn bộ thông tin phương thức thanh toán của model có thể thanh toán:

```php
$user->deletePaymentMethods();
```

Mặc định, phương thức này sẽ xóa phương thức thanh toán thuộc mọi loại. Để xóa phương thức thanh toán của một loại cụ thể, bạn có thể truyền `type` làm đối số:

```php
$user->deletePaymentMethods('sepa_debit');
```

> [!WARNING]
> Nếu người dùng đang có gói đăng ký hoạt động, ứng dụng của bạn không nên cho phép họ xóa phương thức thanh toán mặc định.

<a name="subscriptions"></a>
## Gói đăng ký

Gói đăng ký cung cấp cách thiết lập các khoản thanh toán định kỳ cho khách hàng. Các gói đăng ký Stripe do Cashier quản lý hỗ trợ nhiều mức giá, số lượng, thời gian dùng thử và nhiều tính năng khác.

<a name="creating-subscriptions"></a>
### Tạo gói đăng ký

Để tạo gói đăng ký, trước tiên hãy truy xuất một instance của model có khả năng thanh toán, thường là một instance của `App\Models\User`. Sau khi có instance model, bạn có thể sử dụng phương thức `newSubscription` để tạo gói đăng ký cho model:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription(
        'default', 'price_monthly'
    )->create($request->paymentMethodId);

    // ...
});
```

Đối số đầu tiên truyền vào phương thức `newSubscription` phải là loại nội bộ của gói đăng ký. Nếu ứng dụng chỉ cung cấp một gói đăng ký, bạn có thể đặt tên là `default` hoặc `primary`. Loại gói đăng ký này chỉ được dùng nội bộ trong ứng dụng và không nhằm hiển thị cho người dùng. Ngoài ra, giá trị này không được chứa khoảng trắng và không nên thay đổi sau khi gói đăng ký đã được tạo. Đối số thứ hai là price cụ thể mà người dùng đăng ký. Giá trị này phải tương ứng với identifier của price trên Stripe.

Phương thức `create`, nhận [identifier của phương thức thanh toán Stripe](#storing-payment-methods) hoặc object `PaymentMethod` của Stripe, sẽ khởi tạo gói đăng ký đồng thời cập nhật cơ sở dữ liệu với Stripe customer ID của model có khả năng thanh toán và các thông tin thanh toán liên quan khác.

> [!WARNING]
> Việc truyền trực tiếp identifier của phương thức thanh toán vào phương thức `create` của gói đăng ký cũng sẽ tự động thêm phương thức đó vào danh sách phương thức thanh toán đã lưu của người dùng.

<a name="collecting-recurring-payments-via-invoice-emails"></a>
#### Thu các khoản thanh toán định kỳ qua email hóa đơn

Thay vì tự động thu các khoản thanh toán định kỳ của khách hàng, bạn có thể yêu cầu Stripe gửi hóa đơn qua email cho khách hàng mỗi khi đến hạn thanh toán định kỳ. Sau đó, khách hàng có thể thanh toán hóa đơn thủ công khi nhận được. Khi thu khoản thanh toán định kỳ qua hóa đơn, khách hàng không cần cung cấp phương thức thanh toán từ trước:

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice();
```

Khoảng thời gian khách hàng có thể thanh toán hóa đơn trước khi gói đăng ký bị hủy được xác định bởi tùy chọn `days_until_due`. Mặc định là 30 ngày; tuy nhiên, bạn có thể cung cấp một giá trị cụ thể cho tùy chọn này:

```php
$user->newSubscription('default', 'price_monthly')->createAndSendInvoice([], [
    'days_until_due' => 30
]);
```

<a name="subscription-quantities"></a>
#### Số lượng

Nếu muốn đặt một [số lượng](https://stripe.com/docs/billing/subscriptions/quantities) cụ thể cho price khi tạo gói đăng ký, bạn nên gọi phương thức `quantity` trên subscription builder trước khi tạo gói đăng ký:

```php
$user->newSubscription('default', 'price_monthly')
    ->quantity(5)
    ->create($paymentMethod);
```

<a name="additional-details"></a>
#### Thông tin bổ sung

Nếu muốn chỉ định thêm các tùy chọn [customer](https://stripe.com/docs/api/customers/create) hoặc [subscription](https://stripe.com/docs/api/subscriptions/create) mà Stripe hỗ trợ, bạn có thể truyền chúng lần lượt làm đối số thứ hai và thứ ba của phương thức `create`:

```php
$user->newSubscription('default', 'price_monthly')->create($paymentMethod, [
    'email' => $email,
], [
    'metadata' => ['note' => 'Some extra information.'],
]);
```

<a name="coupons"></a>
#### Coupon

Nếu muốn áp dụng coupon khi tạo gói đăng ký, bạn có thể sử dụng phương thức `withCoupon`:

```php
$user->newSubscription('default', 'price_monthly')
    ->withCoupon('code')
    ->create($paymentMethod);
```

Hoặc, nếu muốn áp dụng [promotion code của Stripe](https://stripe.com/docs/billing/subscriptions/discounts/codes), bạn có thể sử dụng phương thức `withPromotionCode`:

```php
$user->newSubscription('default', 'price_monthly')
    ->withPromotionCode('promo_code_id')
    ->create($paymentMethod);
```

Promotion code ID được cung cấp phải là Stripe API ID được gán cho promotion code, không phải mã khuyến mãi hiển thị cho khách hàng. Nếu cần tìm promotion code ID dựa trên mã mà khách hàng nhìn thấy, bạn có thể sử dụng phương thức `findPromotionCode`:

```php
// Find a promotion code ID by its customer facing code...
$promotionCode = $user->findPromotionCode('SUMMERSALE');

// Find an active promotion code ID by its customer facing code...
$promotionCode = $user->findActivePromotionCode('SUMMERSALE');
```

Trong ví dụ trên, object `$promotionCode` được trả về là một instance của `Laravel\Cashier\PromotionCode`. Class này bao bọc object `Stripe\PromotionCode` bên dưới. Bạn có thể truy xuất coupon liên quan đến promotion code bằng cách gọi phương thức `coupon`:

```php
$coupon = $user->findPromotionCode('SUMMERSALE')->coupon();
```

Instance coupon cho phép bạn xác định mức giảm giá và coupon đó biểu thị mức giảm cố định hay giảm theo phần trăm:

```php
if ($coupon->isPercentage()) {
    return $coupon->percentOff().'%'; // 21.5%
} else {
    return $coupon->amountOff(); // $5.99
}
```

Bạn cũng có thể truy xuất các khoản giảm giá hiện đang được áp dụng cho khách hàng hoặc gói đăng ký:

```php
$discount = $billable->discount();

$discount = $subscription->discount();
```

Các instance `Laravel\Cashier\Discount` được trả về bao bọc instance object `Stripe\Discount` bên dưới. Bạn có thể truy xuất coupon liên quan đến khoản giảm giá này bằng cách gọi phương thức `coupon`:

```php
$coupon = $subscription->discount()->coupon();
```

Nếu muốn áp dụng coupon hoặc promotion code mới cho khách hàng hay gói đăng ký, bạn có thể thực hiện thông qua các phương thức `applyCoupon` hoặc `applyPromotionCode`:

```php
$billable->applyCoupon('coupon_id');
$billable->applyPromotionCode('promotion_code_id');

$subscription->applyCoupon('coupon_id');
$subscription->applyPromotionCode('promotion_code_id');
```

Hãy nhớ rằng bạn nên sử dụng Stripe API ID được gán cho promotion code, không phải mã khuyến mãi hiển thị cho khách hàng. Tại một thời điểm, chỉ có thể áp dụng một coupon hoặc promotion code cho một khách hàng hay gói đăng ký.

Để biết thêm thông tin về chủ đề này, hãy tham khảo tài liệu Stripe về [coupon](https://stripe.com/docs/billing/subscriptions/coupons) và [promotion code](https://stripe.com/docs/billing/subscriptions/coupons/codes).

<a name="adding-subscriptions"></a>
#### Thêm gói đăng ký

Nếu muốn thêm gói đăng ký cho khách hàng đã có phương thức thanh toán mặc định, bạn có thể gọi phương thức `add` trên subscription builder:

```php
use App\Models\User;

$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->add();
```

<a name="creating-subscriptions-from-the-stripe-dashboard"></a>
#### Tạo gói đăng ký từ Stripe Dashboard

Bạn cũng có thể tạo gói đăng ký trực tiếp từ Stripe Dashboard. Khi đó, Cashier sẽ đồng bộ các gói đăng ký mới được thêm và gán cho chúng loại `default`. Để tùy chỉnh loại gói đăng ký được gán cho các gói tạo từ dashboard, hãy [định nghĩa webhook event handler](#defining-webhook-event-handlers).

Ngoài ra, bạn chỉ có thể tạo một loại gói đăng ký thông qua Stripe Dashboard. Nếu ứng dụng cung cấp nhiều gói đăng ký sử dụng các loại khác nhau, chỉ một loại gói đăng ký có thể được thêm qua Stripe Dashboard.

Cuối cùng, bạn nên luôn bảo đảm chỉ thêm một gói đăng ký đang hoạt động cho mỗi loại gói đăng ký mà ứng dụng cung cấp. Nếu khách hàng có hai gói đăng ký `default`, Cashier chỉ sử dụng gói được thêm gần nhất dù cả hai đều được đồng bộ với cơ sở dữ liệu của ứng dụng.

<a name="checking-subscription-status"></a>
### Kiểm tra trạng thái gói đăng ký

Sau khi khách hàng đăng ký ứng dụng, bạn có thể dễ dàng kiểm tra trạng thái gói đăng ký bằng nhiều phương thức tiện lợi. Trước tiên, phương thức `subscribed` trả về `true` nếu khách hàng có gói đăng ký đang hoạt động, kể cả khi gói đó đang trong thời gian dùng thử. Phương thức `subscribed` nhận loại gói đăng ký làm đối số đầu tiên:

```php
if ($user->subscribed('default')) {
    // ...
}
```

Phương thức `subscribed` cũng rất phù hợp để sử dụng trong [route middleware](/docs/{{version}}/middleware), cho phép bạn lọc quyền truy cập vào route và controller dựa trên trạng thái gói đăng ký của người dùng:

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
        if ($request->user() && ! $request->user()->subscribed('default')) {
            // This user is not a paying customer...
            return redirect('/billing');
        }

        return $next($request);
    }
}
```

Nếu muốn xác định người dùng có còn trong thời gian dùng thử hay không, bạn có thể sử dụng phương thức `onTrial`. Phương thức này hữu ích khi cần quyết định có nên hiển thị cảnh báo rằng người dùng vẫn đang trong thời gian dùng thử hay không:

```php
if ($user->subscription('default')->onTrial()) {
    // ...
}
```

Phương thức `subscribedToProduct` có thể được dùng để xác định người dùng có đăng ký một sản phẩm nhất định dựa trên identifier của Stripe product hay không. Trong Stripe, product là tập hợp các price. Trong ví dụ này, chúng ta sẽ xác định gói đăng ký `default` của người dùng có đang đăng ký sản phẩm "premium" của ứng dụng hay không. Stripe product identifier được cung cấp phải tương ứng với một identifier của sản phẩm trên Stripe Dashboard:

```php
if ($user->subscribedToProduct('prod_premium', 'default')) {
    // ...
}
```

Bằng cách truyền một mảng vào phương thức `subscribedToProduct`, bạn có thể xác định gói đăng ký `default` của người dùng có đang đăng ký sản phẩm "basic" hoặc "premium" của ứng dụng hay không:

```php
if ($user->subscribedToProduct(['prod_basic', 'prod_premium'], 'default')) {
    // ...
}
```

Phương thức `subscribedToPrice` có thể được dùng để xác định gói đăng ký của khách hàng có tương ứng với một price ID nhất định hay không:

```php
if ($user->subscribedToPrice('price_basic_monthly', 'default')) {
    // ...
}
```

Phương thức `recurring` có thể được dùng để xác định người dùng hiện đang đăng ký và không còn trong thời gian dùng thử hay không:

```php
if ($user->subscription('default')->recurring()) {
    // ...
}
```

> [!WARNING]
> Nếu người dùng có hai gói đăng ký cùng loại, phương thức `subscription` sẽ luôn trả về gói đăng ký gần nhất. Ví dụ, người dùng có thể có hai bản ghi gói đăng ký loại `default`; tuy nhiên, một gói có thể đã cũ và hết hạn, trong khi gói còn lại là gói hiện tại đang hoạt động. Gói gần nhất luôn được trả về, còn các gói cũ hơn vẫn được giữ trong cơ sở dữ liệu để tra cứu lịch sử.

<a name="cancelled-subscription-status"></a>
#### Trạng thái gói đăng ký đã hủy

Để xác định người dùng từng là subscriber đang hoạt động nhưng đã hủy gói đăng ký, bạn có thể sử dụng phương thức `canceled`:

```php
if ($user->subscription('default')->canceled()) {
    // ...
}
```

Bạn cũng có thể xác định người dùng đã hủy gói đăng ký nhưng vẫn đang trong "thời gian gia hạn" cho đến khi gói hết hạn hoàn toàn. Ví dụ, nếu người dùng hủy gói vào ngày 5 tháng 3 trong khi gói ban đầu dự kiến hết hạn ngày 10 tháng 3, người dùng sẽ ở trong "thời gian gia hạn" cho đến ngày 10 tháng 3. Lưu ý rằng phương thức `subscribed` vẫn trả về `true` trong khoảng thời gian này:

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

Để xác định người dùng đã hủy gói đăng ký và không còn trong "thời gian gia hạn", bạn có thể sử dụng phương thức `ended`:

```php
if ($user->subscription('default')->ended()) {
    // ...
}
```

<a name="incomplete-and-past-due-status"></a>
#### Trạng thái chưa hoàn tất và quá hạn

Nếu gói đăng ký yêu cầu một hành động thanh toán bổ sung sau khi tạo, gói sẽ được đánh dấu là `incomplete`. Trạng thái gói đăng ký được lưu trong cột `stripe_status` của bảng `subscriptions` do Cashier sử dụng.

Tương tự, nếu cần hành động thanh toán bổ sung khi đổi price, gói đăng ký sẽ được đánh dấu là `past_due`. Khi gói ở một trong hai trạng thái này, nó sẽ không hoạt động cho đến khi khách hàng xác nhận thanh toán. Bạn có thể xác định gói đăng ký có khoản thanh toán chưa hoàn tất hay không bằng phương thức `hasIncompletePayment` trên model có khả năng thanh toán hoặc trên instance gói đăng ký:

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

Khi gói đăng ký có khoản thanh toán chưa hoàn tất, bạn nên chuyển người dùng đến trang xác nhận thanh toán của Cashier và truyền identifier `latestPayment`. Bạn có thể sử dụng phương thức `latestPayment` trên instance gói đăng ký để truy xuất identifier này:

```html
<a href="{{ route('cashier.payment', $subscription->latestPayment()->id) }}">
    Please confirm your payment.
</a>
```

Nếu muốn gói đăng ký vẫn được xem là đang hoạt động khi ở trạng thái `past_due` hoặc `incomplete`, bạn có thể sử dụng các phương thức `keepPastDueSubscriptionsActive` và `keepIncompleteSubscriptionsActive` do Cashier cung cấp. Thông thường, các phương thức này nên được gọi trong phương thức `register` của `App\Providers\AppServiceProvider`:

```php
use Laravel\Cashier\Cashier;

/**
 * Register any application services.
 */
public function register(): void
{
    Cashier::keepPastDueSubscriptionsActive();
    Cashier::keepIncompleteSubscriptionsActive();
}
```

> [!WARNING]
> Khi gói đăng ký ở trạng thái `incomplete`, bạn không thể thay đổi nó cho đến khi khoản thanh toán được xác nhận. Vì vậy, các phương thức `swap` và `updateQuantity` sẽ ném exception khi gói đăng ký đang ở trạng thái `incomplete`.

<a name="subscription-scopes"></a>
#### Scope của gói đăng ký

Hầu hết trạng thái gói đăng ký cũng được cung cấp dưới dạng query scope để bạn có thể dễ dàng truy vấn cơ sở dữ liệu cho các gói đang ở một trạng thái nhất định:

```php
// Get all active subscriptions...
$subscriptions = Subscription::query()->active()->get();

// Get all of the canceled subscriptions for a user...
$subscriptions = $user->subscriptions()->canceled()->get();
```

Danh sách đầy đủ các scope khả dụng được trình bày bên dưới:

```php
Subscription::query()->active();
Subscription::query()->canceled();
Subscription::query()->ended();
Subscription::query()->incomplete();
Subscription::query()->notCanceled();
Subscription::query()->notOnGracePeriod();
Subscription::query()->notOnTrial();
Subscription::query()->onGracePeriod();
Subscription::query()->onTrial();
Subscription::query()->pastDue();
Subscription::query()->recurring();
```

<a name="changing-prices"></a>
### Thay đổi price

Sau khi khách hàng đăng ký ứng dụng, đôi khi họ có thể muốn chuyển sang một price mới. Để chuyển khách hàng sang price mới, hãy truyền identifier của Stripe price vào phương thức `swap`. Khi đổi price, Cashier giả định người dùng muốn kích hoạt lại gói đăng ký nếu trước đó gói đã bị hủy. Price identifier được cung cấp phải tương ứng với một Stripe price identifier có trên Stripe Dashboard:

```php
use App\Models\User;

$user = App\Models\User::find(1);

$user->subscription('default')->swap('price_yearly');
```

Nếu khách hàng đang trong thời gian dùng thử, thời gian dùng thử sẽ được giữ nguyên. Ngoài ra, nếu gói đăng ký có "quantity", số lượng đó cũng sẽ được giữ nguyên.

Nếu muốn đổi price đồng thời hủy thời gian dùng thử hiện tại của khách hàng, bạn có thể gọi phương thức `skipTrial`:

```php
$user->subscription('default')
    ->skipTrial()
    ->swap('price_yearly');
```

Nếu muốn đổi price và lập hóa đơn cho khách hàng ngay lập tức thay vì chờ chu kỳ thanh toán tiếp theo, bạn có thể sử dụng phương thức `swapAndInvoice`:

```php
$user = User::find(1);

$user->subscription('default')->swapAndInvoice('price_yearly');
```

<a name="prorations"></a>
#### Phân bổ theo tỷ lệ

Mặc định, Stripe sẽ phân bổ khoản phí theo tỷ lệ khi chuyển đổi giữa các price. Bạn có thể sử dụng phương thức `noProrate` để cập nhật price của gói đăng ký mà không phân bổ khoản phí theo tỷ lệ:

```php
$user->subscription('default')->noProrate()->swap('price_yearly');
```

Để biết thêm thông tin về phân bổ theo tỷ lệ của gói đăng ký, hãy tham khảo [tài liệu Stripe](https://stripe.com/docs/billing/subscriptions/prorations).

> [!WARNING]
> Việc gọi phương thức `noProrate` trước `swapAndInvoice` sẽ không ảnh hưởng đến việc phân bổ theo tỷ lệ. Hóa đơn vẫn luôn được phát hành.

<a name="subscription-quantity"></a>
### Số lượng gói đăng ký

Đôi khi gói đăng ký chịu ảnh hưởng bởi "quantity". Ví dụ, một ứng dụng quản lý dự án có thể tính phí 10 USD mỗi tháng cho mỗi dự án. Bạn có thể sử dụng các phương thức `incrementQuantity` và `decrementQuantity` để dễ dàng tăng hoặc giảm số lượng của gói đăng ký:

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->incrementQuantity();

// Add five to the subscription's current quantity...
$user->subscription('default')->incrementQuantity(5);

$user->subscription('default')->decrementQuantity();

// Subtract five from the subscription's current quantity...
$user->subscription('default')->decrementQuantity(5);
```

Ngoài ra, bạn có thể đặt một số lượng cụ thể bằng phương thức `updateQuantity`:

```php
$user->subscription('default')->updateQuantity(10);
```

Bạn có thể sử dụng phương thức `noProrate` để cập nhật số lượng gói đăng ký mà không phân bổ khoản phí theo tỷ lệ:

```php
$user->subscription('default')->noProrate()->updateQuantity(10);
```

Để biết thêm thông tin về số lượng gói đăng ký, hãy tham khảo [tài liệu Stripe](https://stripe.com/docs/subscriptions/quantities).

<a name="quantities-for-subscription-with-multiple-products"></a>
#### Số lượng cho gói đăng ký có nhiều sản phẩm

Nếu gói đăng ký là [gói đăng ký có nhiều sản phẩm](#subscriptions-with-multiple-products), bạn nên truyền ID của price cần tăng hoặc giảm số lượng làm đối số thứ hai cho các phương thức tăng / giảm:

```php
$user->subscription('default')->incrementQuantity(1, 'price_chat');
```

<a name="subscriptions-with-multiple-products"></a>
### Gói đăng ký có nhiều sản phẩm

[Gói đăng ký có nhiều sản phẩm](https://stripe.com/docs/billing/subscriptions/multiple-products) cho phép bạn gán nhiều sản phẩm thanh toán vào một gói đăng ký duy nhất. Ví dụ, hãy tưởng tượng bạn đang xây dựng ứng dụng "helpdesk" chăm sóc khách hàng có giá gói cơ bản 10 USD mỗi tháng và cung cấp thêm sản phẩm live chat với giá 15 USD mỗi tháng. Thông tin của các gói đăng ký có nhiều sản phẩm được lưu trong bảng `subscription_items` của Cashier.

Bạn có thể chỉ định nhiều sản phẩm cho một gói đăng ký bằng cách truyền một mảng price làm đối số thứ hai cho phương thức `newSubscription`:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', [
        'price_monthly',
        'price_chat',
    ])->create($request->paymentMethodId);

    // ...
});
```

Trong ví dụ trên, khách hàng sẽ có hai price gắn với gói đăng ký `default`. Cả hai price sẽ được tính phí theo chu kỳ thanh toán tương ứng. Nếu cần, bạn có thể sử dụng phương thức `quantity` để chỉ định số lượng cụ thể cho từng price:

```php
$user = User::find(1);

$user->newSubscription('default', ['price_monthly', 'price_chat'])
    ->quantity(5, 'price_chat')
    ->create($paymentMethod);
```

Nếu muốn thêm một price khác vào gói đăng ký hiện có, bạn có thể gọi phương thức `addPrice` của gói đăng ký:

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat');
```

Ví dụ trên sẽ thêm price mới và khách hàng sẽ được tính phí cho price đó trong chu kỳ thanh toán tiếp theo. Nếu muốn tính phí khách hàng ngay lập tức, bạn có thể sử dụng phương thức `addPriceAndInvoice`:

```php
$user->subscription('default')->addPriceAndInvoice('price_chat');
```

Nếu muốn thêm price với số lượng cụ thể, bạn có thể truyền số lượng làm đối số thứ hai của phương thức `addPrice` hoặc `addPriceAndInvoice`:

```php
$user = User::find(1);

$user->subscription('default')->addPrice('price_chat', 5);
```

Bạn có thể xóa price khỏi gói đăng ký bằng phương thức `removePrice`:

```php
$user->subscription('default')->removePrice('price_chat');
```

> [!WARNING]
> Bạn không thể xóa price cuối cùng của một gói đăng ký. Thay vào đó, bạn nên hủy gói đăng ký.

<a name="swapping-prices"></a>
#### Chuyển đổi price

Bạn cũng có thể thay đổi các price gắn với gói đăng ký có nhiều sản phẩm. Ví dụ, hãy tưởng tượng khách hàng có gói `price_basic` cùng sản phẩm bổ sung `price_chat` và bạn muốn nâng cấp khách hàng từ price `price_basic` lên `price_pro`:

```php
use App\Models\User;

$user = User::find(1);

$user->subscription('default')->swap(['price_pro', 'price_chat']);
```

Khi thực thi ví dụ trên, subscription item bên dưới có `price_basic` sẽ bị xóa và item có `price_chat` được giữ lại. Đồng thời, một subscription item mới cho `price_pro` sẽ được tạo.

Bạn cũng có thể chỉ định các tùy chọn cho subscription item bằng cách truyền một mảng cặp key / value vào phương thức `swap`. Ví dụ, bạn có thể cần chỉ định số lượng cho các price của gói đăng ký:

```php
$user = User::find(1);

$user->subscription('default')->swap([
    'price_pro' => ['quantity' => 5],
    'price_chat'
]);
```

Nếu muốn chuyển đổi một price duy nhất trong gói đăng ký, bạn có thể sử dụng phương thức `swap` ngay trên subscription item. Cách này đặc biệt hữu ích khi bạn muốn giữ nguyên toàn bộ metadata hiện có của các price khác trong gói đăng ký:

```php
$user = User::find(1);

$user->subscription('default')
    ->findItemOrFail('price_basic')
    ->swap('price_pro');
```

<a name="proration"></a>
#### Phân bổ theo tỷ lệ

Mặc định, Stripe sẽ phân bổ khoản phí theo tỷ lệ khi thêm hoặc xóa price khỏi gói đăng ký có nhiều sản phẩm. Nếu muốn điều chỉnh price mà không phân bổ theo tỷ lệ, bạn nên chain phương thức `noProrate` vào thao tác price:

```php
$user->subscription('default')->noProrate()->removePrice('price_chat');
```

<a name="swapping-quantities"></a>
#### Số lượng

Nếu muốn cập nhật số lượng trên từng price riêng lẻ của gói đăng ký, bạn có thể sử dụng [các phương thức số lượng hiện có](#subscription-quantity) và truyền ID của price làm đối số bổ sung cho phương thức:

```php
$user = User::find(1);

$user->subscription('default')->incrementQuantity(5, 'price_chat');

$user->subscription('default')->decrementQuantity(3, 'price_chat');

$user->subscription('default')->updateQuantity(10, 'price_chat');
```

> [!WARNING]
> Khi một gói đăng ký có nhiều price, các thuộc tính `stripe_price` và `quantity` trên model `Subscription` sẽ là `null`. Để truy cập thuộc tính của từng price riêng lẻ, bạn nên sử dụng relationship `items` có trên model `Subscription`.

<a name="subscription-items"></a>
#### Subscription item

Khi một gói đăng ký có nhiều price, nó sẽ có nhiều "item" gói đăng ký được lưu trong bảng `subscription_items` của cơ sở dữ liệu. Bạn có thể truy cập các item này thông qua relationship `items` trên gói đăng ký:

```php
use App\Models\User;

$user = User::find(1);

$subscriptionItem = $user->subscription('default')->items->first();

// Retrieve the Stripe price and quantity for a specific item...
$stripePrice = $subscriptionItem->stripe_price;
$quantity = $subscriptionItem->quantity;
```

Bạn cũng có thể truy xuất một price cụ thể bằng phương thức `findItemOrFail`:

```php
$user = User::find(1);

$subscriptionItem = $user->subscription('default')->findItemOrFail('price_chat');
```

<a name="multiple-subscriptions"></a>
### Nhiều gói đăng ký

Stripe cho phép khách hàng của bạn có nhiều gói đăng ký cùng lúc. Ví dụ, bạn có thể vận hành một phòng gym cung cấp gói đăng ký bơi lội và gói đăng ký tập tạ, mỗi gói có mức giá khác nhau. Tất nhiên, khách hàng có thể đăng ký một hoặc cả hai gói.

Khi ứng dụng tạo gói đăng ký, bạn có thể truyền loại gói đăng ký vào phương thức `newSubscription`. Loại này có thể là bất kỳ chuỗi nào đại diện cho loại gói đăng ký mà người dùng đang khởi tạo:

```php
use Illuminate\Http\Request;

Route::post('/swimming/subscribe', function (Request $request) {
    $request->user()->newSubscription('swimming')
        ->price('price_swimming_monthly')
        ->create($request->paymentMethodId);

    // ...
});
```

Trong ví dụ này, chúng ta đã khởi tạo gói đăng ký bơi theo tháng cho khách hàng. Tuy nhiên, sau đó họ có thể muốn chuyển sang gói theo năm. Khi điều chỉnh gói đăng ký của khách hàng, chúng ta chỉ cần chuyển price trên gói `swimming`:

```php
$user->subscription('swimming')->swap('price_swimming_yearly');
```

Tất nhiên, bạn cũng có thể hủy hoàn toàn gói đăng ký:

```php
$user->subscription('swimming')->cancel();
```

<a name="usage-based-billing"></a>
### Thanh toán dựa trên mức sử dụng

[Thanh toán dựa trên mức sử dụng](https://stripe.com/docs/billing/subscriptions/metered-billing) cho phép bạn tính phí khách hàng dựa trên mức sử dụng sản phẩm của họ trong một chu kỳ thanh toán. Ví dụ, bạn có thể tính phí dựa trên số tin nhắn văn bản hoặc email mà khách hàng gửi mỗi tháng.

Để bắt đầu sử dụng hình thức thanh toán theo mức sử dụng, trước tiên bạn cần tạo một sản phẩm mới trong Stripe dashboard với [mô hình thanh toán dựa trên mức sử dụng](https://docs.stripe.com/billing/subscriptions/usage-based/implementation-guide) và một [meter](https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage#configure-meter). Sau khi tạo meter, hãy lưu tên event và ID meter tương ứng vì bạn sẽ cần chúng để báo cáo và truy xuất mức sử dụng. Sau đó, sử dụng phương thức `meteredPrice` để thêm ID của metered price vào gói đăng ký của khách hàng:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default')
        ->meteredPrice('price_metered')
        ->create($request->paymentMethodId);

    // ...
});
```

Bạn cũng có thể bắt đầu một metered subscription thông qua [Stripe Checkout](#checkout):

```php
$checkout = Auth::user()
    ->newSubscription('default', [])
    ->meteredPrice('price_metered')
    ->checkout();

return view('your-checkout-view', [
    'checkout' => $checkout,
]);
```

<a name="reporting-usage"></a>
#### Báo cáo mức sử dụng

Khi khách hàng sử dụng ứng dụng, bạn sẽ báo cáo mức sử dụng của họ cho Stripe để khoản phí được tính chính xác. Để báo cáo mức sử dụng của một metered event, bạn có thể dùng phương thức `reportMeterEvent` trên model `Billable`:

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent');
```

Mặc định, "usage quantity" bằng 1 sẽ được cộng vào kỳ thanh toán. Ngoài ra, bạn có thể truyền một lượng "usage" cụ thể để cộng vào mức sử dụng của khách hàng trong kỳ thanh toán:

```php
$user = User::find(1);

$user->reportMeterEvent('emails-sent', quantity: 15);
```

Để truy xuất tổng hợp event của khách hàng cho một meter, bạn có thể sử dụng phương thức `meterEventSummaries` trên một instance `Billable`:

```php
$user = User::find(1);

$meterUsage = $user->meterEventSummaries($meterId);

$meterUsage->first()->aggregated_value // 10
```

Hãy tham khảo [tài liệu đối tượng Meter Event Summary](https://docs.stripe.com/api/billing/meter-event_summary/object) của Stripe để biết thêm thông tin về các bản tổng hợp meter event.

Để [liệt kê tất cả meter](https://docs.stripe.com/api/billing/meter/list), bạn có thể sử dụng phương thức `meters` trên một instance `Billable`:

```php
$user = User::find(1);

$user->meters();
```

<a name="subscription-taxes"></a>
### Thuế của gói đăng ký

> [!WARNING]
Thay vì tự tính Tax Rate, bạn có thể [tự động tính thuế bằng Stripe Tax](#tax-configuration)

Để chỉ định các mức thuế mà người dùng phải trả cho một gói đăng ký, bạn nên triển khai phương thức `taxRates` trên billable model và trả về một mảng chứa các Stripe tax rate ID. Bạn có thể định nghĩa các mức thuế này trong [Stripe dashboard](https://dashboard.stripe.com/test/tax-rates):

```php
/**
 * The tax rates that should apply to the customer's subscriptions.
 *
 * @return array<int, string>
 */
public function taxRates(): array
{
    return ['txr_id'];
}
```

Phương thức `taxRates` cho phép bạn áp dụng mức thuế theo từng khách hàng, hữu ích khi tập người dùng trải rộng trên nhiều quốc gia và chịu các mức thuế khác nhau.

Nếu cung cấp gói đăng ký có nhiều sản phẩm, bạn có thể định nghĩa mức thuế khác nhau cho từng price bằng cách triển khai phương thức `priceTaxRates` trên billable model:

```php
/**
 * The tax rates that should apply to the customer's subscriptions.
 *
 * @return array<string, array<int, string>>
 */
public function priceTaxRates(): array
{
    return [
        'price_monthly' => ['txr_id'],
    ];
}
```

> [!WARNING]
Phương thức `taxRates` chỉ áp dụng cho các khoản phí của gói đăng ký. Nếu dùng Cashier để thực hiện khoản phí "một lần", bạn sẽ cần chỉ định mức thuế thủ công tại thời điểm đó.

<a name="syncing-tax-rates"></a>
#### Đồng bộ mức thuế

Khi thay đổi các tax rate ID được hard-code mà phương thức `taxRates` trả về, cấu hình thuế trên các gói đăng ký hiện có của người dùng vẫn giữ nguyên. Nếu muốn cập nhật giá trị thuế cho các gói đăng ký hiện có theo các giá trị `taxRates` mới, bạn nên gọi phương thức `syncTaxRates` trên instance gói đăng ký của người dùng:

```php
$user->subscription('default')->syncTaxRates();
```

Thao tác này cũng đồng bộ mức thuế của từng item đối với gói đăng ký có nhiều sản phẩm. Nếu ứng dụng cung cấp gói đăng ký nhiều sản phẩm, hãy đảm bảo billable model triển khai phương thức `priceTaxRates` [đã trình bày ở trên](#subscription-taxes).

<a name="tax-exemption"></a>
#### Miễn thuế

Cashier cũng cung cấp các phương thức `isNotTaxExempt`, `isTaxExempt` và `reverseChargeApplies` để xác định khách hàng có được miễn thuế hay không. Các phương thức này sẽ gọi Stripe API để xác định trạng thái miễn thuế của khách hàng:

```php
use App\Models\User;

$user = User::find(1);

$user->isTaxExempt();
$user->isNotTaxExempt();
$user->reverseChargeApplies();
```

> [!WARNING]
Các phương thức này cũng có trên mọi đối tượng `Laravel\Cashier\Invoice`. Tuy nhiên, khi được gọi trên đối tượng `Invoice`, chúng sẽ xác định trạng thái miễn thuế tại thời điểm hóa đơn được tạo.

<a name="subscription-anchor-date"></a>
### Ngày neo chu kỳ gói đăng ký

Mặc định, mốc neo chu kỳ thanh toán là ngày gói đăng ký được tạo hoặc, nếu có thời gian dùng thử, là ngày thời gian dùng thử kết thúc. Nếu muốn thay đổi ngày neo thanh toán, bạn có thể sử dụng phương thức `anchorBillingCycleOn`:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $anchor = Carbon::parse('first day of next month');

    $request->user()->newSubscription('default', 'price_monthly')
        ->anchorBillingCycleOn($anchor->startOfDay())
        ->create($request->paymentMethodId);

    // ...
});
```

Để biết thêm thông tin về quản lý chu kỳ thanh toán của gói đăng ký, hãy tham khảo [tài liệu chu kỳ thanh toán của Stripe](https://stripe.com/docs/billing/subscriptions/billing-cycle)

<a name="cancelling-subscriptions"></a>
### Hủy gói đăng ký

Để hủy một gói đăng ký, hãy gọi phương thức `cancel` trên gói đăng ký của người dùng:

```php
$user->subscription('default')->cancel();
```

Khi một gói đăng ký bị hủy, Cashier sẽ tự động thiết lập cột `ends_at` trong bảng `subscriptions` của cơ sở dữ liệu. Cột này được dùng để xác định thời điểm phương thức `subscribed` bắt đầu trả về `false`.

Ví dụ, nếu khách hàng hủy gói đăng ký vào ngày 1 tháng 3 nhưng gói được lên lịch kết thúc vào ngày 5 tháng 3, phương thức `subscribed` vẫn trả về `true` cho đến ngày 5 tháng 3. Điều này là do người dùng thường được phép tiếp tục sử dụng ứng dụng cho đến hết chu kỳ thanh toán.

Bạn có thể dùng phương thức `onGracePeriod` để xác định người dùng đã hủy gói đăng ký nhưng vẫn đang trong "thời gian gia hạn":

```php
if ($user->subscription('default')->onGracePeriod()) {
    // ...
}
```

Nếu muốn hủy gói đăng ký ngay lập tức, hãy gọi phương thức `cancelNow` trên gói đăng ký của người dùng:

```php
$user->subscription('default')->cancelNow();
```

Nếu muốn hủy gói đăng ký ngay lập tức và lập hóa đơn cho phần metered usage chưa được lập hóa đơn còn lại hoặc các proration invoice item mới / đang chờ xử lý, hãy gọi phương thức `cancelNowAndInvoice` trên gói đăng ký của người dùng:

```php
$user->subscription('default')->cancelNowAndInvoice();
```

Bạn cũng có thể chọn hủy gói đăng ký tại một thời điểm cụ thể:

```php
$user->subscription('default')->cancelAt(
    now()->plus(days: 10)
);
```

Cuối cùng, bạn luôn nên hủy các gói đăng ký của người dùng trước khi xóa user model tương ứng:

```php
$user->subscription('default')->cancelNow();

$user->delete();
```

<a name="resuming-subscriptions"></a>
### Tiếp tục gói đăng ký

Nếu khách hàng đã hủy gói đăng ký và bạn muốn tiếp tục gói đó, bạn có thể gọi phương thức `resume` trên gói đăng ký. Khách hàng phải vẫn còn trong "thời gian gia hạn" thì mới có thể tiếp tục gói đăng ký:

```php
$user->subscription('default')->resume();
```

Nếu khách hàng hủy rồi tiếp tục gói đăng ký trước khi gói hết hạn hoàn toàn, họ sẽ không bị tính phí ngay. Thay vào đó, gói đăng ký được kích hoạt lại và khách hàng sẽ được tính phí theo chu kỳ thanh toán ban đầu.

<a name="subscription-trials"></a>
## Thời gian dùng thử gói đăng ký

<a name="with-payment-method-up-front"></a>
### Thu thập phương thức thanh toán từ đầu

Nếu muốn cung cấp thời gian dùng thử cho khách hàng nhưng vẫn thu thập thông tin phương thức thanh toán từ đầu, bạn nên sử dụng phương thức `trialDays` khi tạo gói đăng ký:

```php
use Illuminate\Http\Request;

Route::post('/user/subscribe', function (Request $request) {
    $request->user()->newSubscription('default', 'price_monthly')
        ->trialDays(10)
        ->create($request->paymentMethodId);

    // ...
});
```

Phương thức này sẽ đặt ngày kết thúc thời gian dùng thử trên bản ghi gói đăng ký trong cơ sở dữ liệu và yêu cầu Stripe chưa bắt đầu tính phí khách hàng cho đến sau ngày đó. Khi dùng `trialDays`, Cashier sẽ ghi đè mọi thời gian dùng thử mặc định đã cấu hình cho price trong Stripe.

> [!WARNING]
Nếu gói đăng ký của khách hàng không được hủy trước ngày kết thúc dùng thử, họ sẽ bị tính phí ngay khi thời gian dùng thử hết hạn. Vì vậy, hãy đảm bảo thông báo cho người dùng về ngày kết thúc dùng thử.

Phương thức `trialUntil` cho phép bạn cung cấp một instance `DateTime` để chỉ định thời điểm kết thúc thời gian dùng thử:

```php
use Illuminate\Support\Carbon;

$user->newSubscription('default', 'price_monthly')
    ->trialUntil(Carbon::now()->plus(days: 10))
    ->create($paymentMethod);
```

Bạn có thể xác định người dùng có đang trong thời gian dùng thử hay không bằng phương thức `onTrial` của user instance hoặc phương thức `onTrial` của subscription instance. Hai ví dụ dưới đây tương đương nhau:

```php
if ($user->onTrial('default')) {
    // ...
}

if ($user->subscription('default')->onTrial()) {
    // ...
}
```

Bạn có thể sử dụng phương thức `endTrial` để kết thúc ngay thời gian dùng thử của gói đăng ký:

```php
$user->subscription('default')->endTrial();
```

Để xác định một thời gian dùng thử hiện có đã hết hạn hay chưa, bạn có thể sử dụng các phương thức `hasExpiredTrial`:

```php
if ($user->hasExpiredTrial('default')) {
    // ...
}

if ($user->subscription('default')->hasExpiredTrial()) {
    // ...
}
```

<a name="defining-trial-days-in-stripe-cashier"></a>
#### Định nghĩa số ngày dùng thử trong Stripe / Cashier

Bạn có thể chọn định nghĩa số ngày dùng thử mà price nhận được trong Stripe dashboard hoặc luôn truyền rõ số ngày bằng Cashier. Nếu chọn định nghĩa số ngày dùng thử của price trong Stripe, cần lưu ý rằng các gói đăng ký mới, bao gồm gói mới của khách hàng từng có gói đăng ký trước đây, luôn nhận thời gian dùng thử trừ khi bạn gọi rõ phương thức `skipTrial()`.

<a name="without-payment-method-up-front"></a>
### Không thu thập phương thức thanh toán từ đầu

Nếu muốn cung cấp thời gian dùng thử mà không thu thập thông tin phương thức thanh toán của người dùng từ đầu, bạn có thể đặt cột `trial_ends_at` trên bản ghi người dùng thành ngày kết thúc dùng thử mong muốn. Việc này thường được thực hiện khi đăng ký người dùng:

```php
use App\Models\User;

$user = User::create([
    // ...
    'trial_ends_at' => now()->plus(days: 10),
]);
```

> [!WARNING]
Hãy đảm bảo thêm [date cast](/docs/{{version}}/eloquent-mutators#date-casting) cho thuộc tính `trial_ends_at` trong định nghĩa class của billable model.

Cashier gọi kiểu dùng thử này là "generic trial" vì nó không gắn với bất kỳ gói đăng ký hiện có nào. Phương thức `onTrial` trên instance của billable model sẽ trả về `true` nếu ngày hiện tại chưa vượt quá giá trị `trial_ends_at`:

```php
if ($user->onTrial()) {
    // User is within their trial period...
}
```

Khi đã sẵn sàng tạo gói đăng ký thực tế cho người dùng, bạn có thể sử dụng phương thức `newSubscription` như bình thường:

```php
$user = User::find(1);

$user->newSubscription('default', 'price_monthly')->create($paymentMethod);
```

Để truy xuất ngày kết thúc dùng thử của người dùng, bạn có thể sử dụng phương thức `trialEndsAt`. Phương thức này trả về một instance ngày Carbon nếu người dùng đang dùng thử hoặc `null` nếu không. Bạn cũng có thể truyền tham số loại gói đăng ký tùy chọn nếu muốn lấy ngày kết thúc dùng thử cho một gói cụ thể khác gói mặc định:

```php
if ($user->onTrial()) {
    $trialEndsAt = $user->trialEndsAt('main');
}
```

Bạn cũng có thể dùng phương thức `onGenericTrial` nếu muốn xác định cụ thể rằng người dùng đang trong thời gian "generic trial" và chưa tạo gói đăng ký thực tế:

```php
if ($user->onGenericTrial()) {
    // User is within their "generic" trial period...
}
```

<a name="extending-trials"></a>
### Gia hạn thời gian dùng thử

Phương thức `extendTrial` cho phép bạn gia hạn thời gian dùng thử của gói đăng ký sau khi gói đã được tạo. Nếu thời gian dùng thử đã hết và khách hàng đã bị tính phí cho gói đăng ký, bạn vẫn có thể cung cấp thêm thời gian dùng thử. Khoảng thời gian dùng thử này sẽ được khấu trừ khỏi hóa đơn tiếp theo của khách hàng:

```php
use App\Models\User;

$subscription = User::find(1)->subscription('default');

// End the trial 7 days from now...
$subscription->extendTrial(
    now()->plus(days: 7)
);

// Add an additional 5 days to the trial...
$subscription->extendTrial(
    $subscription->trial_ends_at->plus(days: 5)
);
```

<a name="handling-stripe-webhooks"></a>
## Xử lý Stripe Webhooks

> [!NOTE]
> Bạn có thể sử dụng [Stripe CLI](https://stripe.com/docs/stripe-cli) để hỗ trợ kiểm thử webhook trong quá trình phát triển cục bộ.

Stripe có thể thông báo cho ứng dụng của bạn về nhiều loại sự kiện thông qua webhook. Theo mặc định, service provider của Cashier tự động đăng ký một route trỏ đến webhook controller của Cashier. Controller này sẽ xử lý mọi webhook request gửi đến.

Theo mặc định, webhook controller của Cashier sẽ tự động xử lý việc hủy các gói đăng ký có quá nhiều lần thanh toán thất bại (theo cấu hình Stripe của bạn), cập nhật khách hàng, xóa khách hàng, cập nhật gói đăng ký và thay đổi phương thức thanh toán. Tuy nhiên, bạn có thể mở rộng controller này để xử lý bất kỳ sự kiện Stripe webhook nào mình muốn.

Để bảo đảm ứng dụng có thể xử lý Stripe webhook, hãy cấu hình URL webhook trong bảng điều khiển Stripe. Theo mặc định, webhook controller của Cashier phản hồi tại đường dẫn `/stripe/webhook`. Danh sách đầy đủ các webhook bạn nên bật trong bảng điều khiển Stripe gồm:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.updated`
- `customer.deleted`
- `payment_method.automatically_updated`
- `invoice.payment_action_required`
- `invoice.payment_succeeded`

Để thuận tiện, Cashier cung cấp lệnh Artisan `cashier:webhook`. Lệnh này sẽ tạo một webhook trong Stripe để lắng nghe tất cả sự kiện mà Cashier yêu cầu:

```shell
php artisan cashier:webhook
```

Theo mặc định, webhook được tạo sẽ trỏ đến URL được định nghĩa bởi biến môi trường `APP_URL` và route `cashier.webhook` đi kèm Cashier. Nếu muốn dùng URL khác, bạn có thể truyền tùy chọn `--url` khi chạy lệnh:

```shell
php artisan cashier:webhook --url "https://example.com/stripe/webhook"
```

Webhook được tạo sẽ sử dụng phiên bản Stripe API tương thích với phiên bản Cashier của bạn. Nếu muốn dùng phiên bản Stripe khác, bạn có thể truyền tùy chọn `--api-version`:

```shell
php artisan cashier:webhook --api-version="2019-12-03"
```

Sau khi tạo, webhook sẽ hoạt động ngay lập tức. Nếu muốn tạo webhook nhưng giữ trạng thái vô hiệu hóa cho đến khi sẵn sàng, bạn có thể truyền tùy chọn `--disabled` khi chạy lệnh:

```shell
php artisan cashier:webhook --disabled
```

> [!WARNING]
> Hãy bảo vệ các Stripe webhook request gửi đến bằng middleware [xác minh chữ ký webhook](#verifying-webhook-signatures) đi kèm Cashier.

<a name="webhooks-csrf-protection"></a>
#### Webhook và bảo vệ CSRF

Vì Stripe webhook cần bỏ qua [cơ chế bảo vệ CSRF](/docs/{{version}}/csrf) của Laravel, bạn cần bảo đảm Laravel không cố xác thực CSRF token đối với các Stripe webhook gửi đến. Để thực hiện điều này, hãy loại trừ `stripe/*` khỏi bảo vệ CSRF trong file `bootstrap/app.php` của ứng dụng:

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(except: [
        'stripe/*',
    ]);
})
```

<a name="defining-webhook-event-handlers"></a>
### Định nghĩa trình xử lý sự kiện Webhook

Cashier tự động xử lý việc hủy gói đăng ký do thanh toán thất bại và các sự kiện Stripe webhook phổ biến khác. Tuy nhiên, nếu có thêm các webhook event cần xử lý, bạn có thể lắng nghe những sự kiện sau do Cashier dispatch:

- `Laravel\Cashier\Events\WebhookReceived`
- `Laravel\Cashier\Events\WebhookHandled`

Cả hai sự kiện đều chứa toàn bộ payload của Stripe webhook. Ví dụ, nếu muốn xử lý webhook `invoice.payment_succeeded`, bạn có thể đăng ký một [listener](/docs/{{version}}/events#defining-listeners) để xử lý sự kiện:

```php
<?php

namespace App\Listeners;

use Laravel\Cashier\Events\WebhookReceived;

class StripeEventListener
{
    /**
     * Handle received Stripe webhooks.
     */
    public function handle(WebhookReceived $event): void
    {
        if ($event->payload['type'] === 'invoice.payment_succeeded') {
            // Handle the incoming event...
        }
    }
}
```

<a name="verifying-webhook-signatures"></a>
### Xác minh chữ ký Webhook

Để bảo mật webhook, bạn có thể sử dụng [chữ ký webhook của Stripe](https://stripe.com/docs/webhooks/signatures). Cashier đã tích hợp sẵn middleware để xác minh Stripe webhook request gửi đến là hợp lệ.

Để bật xác minh webhook, hãy bảo đảm biến môi trường `STRIPE_WEBHOOK_SECRET` được thiết lập trong file `.env` của ứng dụng. Bạn có thể lấy `secret` của webhook từ dashboard tài khoản Stripe.

<a name="single-charges"></a>
## Thanh toán một lần

<a name="simple-charge"></a>
### Thanh toán đơn giản

Nếu muốn thực hiện một khoản thanh toán một lần cho khách hàng bằng mã định danh phương thức thanh toán, bạn có thể sử dụng phương thức `charge` trên một billable model. Nếu cần thu thập thông tin thanh toán trước khi xử lý khoản thanh toán một lần, hãy xem tài liệu [Payment Element cho thanh toán một lần](#payment-element-for-single-charges):

```php
use Illuminate\Http\Request;

Route::post('/purchase', function (Request $request) {
    $payment = $request->user()->charge(
        100, $request->paymentMethodId
    );

    // ...
});
```

Phương thức `charge` nhận một mảng làm đối số thứ ba, cho phép bạn truyền các tùy chọn mong muốn xuống quá trình tạo Stripe Payment Intent bên dưới. Thông tin chi tiết về các tùy chọn khi tạo Payment Intent có trong [tài liệu Stripe](https://stripe.com/docs/api/payment_intents/create):

```php
$user->charge(100, $paymentMethod, [
    'custom_option' => $value,
]);
```

Bạn cũng có thể sử dụng `charge` mà không cần customer hoặc user tương ứng. Để làm vậy, hãy gọi `charge` trên một instance mới của billable model trong ứng dụng:

```php
use App\Models\User;

$payment = (new User)->charge(100, $paymentMethod);
```

Phương thức `charge` sẽ ném exception nếu giao dịch thất bại. Nếu thành công, phương thức sẽ trả về một instance của `Laravel\Cashier\Payment`:

```php
try {
    $payment = $user->charge(100, $paymentMethod);
} catch (Exception $e) {
    // ...
}
```

> [!WARNING]
> Phương thức `charge` nhận số tiền theo đơn vị nhỏ nhất của loại tiền tệ mà ứng dụng sử dụng. Ví dụ, nếu khách hàng thanh toán bằng đô la Mỹ, số tiền phải được chỉ định theo cent.

<a name="charge-with-invoice"></a>
### Thanh toán kèm hóa đơn

Đôi khi bạn cần thực hiện một khoản thanh toán một lần đồng thời cung cấp hóa đơn PDF cho khách hàng. Phương thức `invoicePrice` cho phép thực hiện việc này. Ví dụ, hãy lập hóa đơn cho năm chiếc áo mới:

```php
$user->invoicePrice('price_tshirt', 5);
```

Hóa đơn sẽ được thu tiền ngay qua phương thức thanh toán mặc định của người dùng. `invoicePrice` cũng nhận một mảng làm đối số thứ ba chứa các tùy chọn thanh toán cho invoice item. Đối số thứ tư cũng là một mảng chứa các tùy chọn thanh toán cho chính hóa đơn:

```php
$user->invoicePrice('price_tshirt', 5, [
    'discounts' => [
        ['coupon' => 'SUMMER21SALE']
    ],
], [
    'default_tax_rates' => ['txr_id'],
]);
```

Tương tự `invoicePrice`, bạn có thể dùng `tabPrice` để tạo khoản thanh toán một lần cho nhiều mặt hàng (tối đa 250 item mỗi hóa đơn) bằng cách thêm chúng vào "tab" của khách hàng rồi lập hóa đơn. Ví dụ, ta có thể lập hóa đơn cho năm chiếc áo và hai chiếc cốc:

```php
$user->tabPrice('price_tshirt', 5);
$user->tabPrice('price_mug', 2);
$user->invoice();
```

Ngoài ra, bạn có thể dùng `invoiceFor` để thực hiện khoản thu "một lần" trên phương thức thanh toán mặc định của khách hàng:

```php
$user->invoiceFor('One Time Fee', 500);
```

Mặc dù có thể sử dụng `invoiceFor`, bạn nên ưu tiên `invoicePrice` và `tabPrice` với các price được định nghĩa trước. Cách này giúp bạn có dữ liệu và phân tích tốt hơn trong Stripe dashboard về doanh số theo từng sản phẩm.

> [!WARNING]
> Các phương thức `invoice`, `invoicePrice` và `invoiceFor` sẽ tạo Stripe invoice có cơ chế thử lại các lần thu tiền thất bại. Nếu không muốn hóa đơn thử lại, bạn cần đóng hóa đơn bằng Stripe API sau lần thanh toán thất bại đầu tiên.

<a name="creating-payment-intents"></a>
### Tạo Payment Intent

Bạn có thể tạo Stripe Payment Intent mới bằng cách gọi `pay` trên billable model. Phương thức này tạo một Payment Intent được bọc trong instance `Laravel\Cashier\Payment`:

```php
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->pay(
        $request->get('amount')
    );

    return $payment->client_secret;
});
```

Sau khi tạo Payment Intent, bạn có thể trả client secret về frontend để người dùng hoàn tất thanh toán trong trình duyệt. Để tìm hiểu thêm về việc xây dựng toàn bộ luồng thanh toán bằng Stripe Payment Intent, hãy xem [tài liệu Stripe](https://stripe.com/docs/payments/accept-a-payment?platform=web).

Khi sử dụng `pay`, các phương thức thanh toán mặc định được bật trong Stripe dashboard sẽ khả dụng cho khách hàng. Nếu chỉ muốn cho phép một số phương thức thanh toán cụ thể, bạn có thể dùng `payWith`:

```php
use Illuminate\Http\Request;

Route::post('/pay', function (Request $request) {
    $payment = $request->user()->payWith(
        $request->get('amount'), ['card', 'bancontact']
    );

    return $payment->client_secret;
});
```

> [!WARNING]
> Các phương thức `pay` và `payWith` nhận số tiền thanh toán theo đơn vị nhỏ nhất của loại tiền tệ mà ứng dụng sử dụng. Ví dụ, nếu khách hàng thanh toán bằng đô la Mỹ, số tiền phải được chỉ định theo cent.

<a name="refunding-charges"></a>
### Hoàn tiền giao dịch

Nếu cần hoàn tiền một khoản thanh toán Stripe, bạn có thể sử dụng phương thức `refund`. Phương thức này nhận Stripe Payment Intent ID làm đối số đầu tiên:

```php
$payment = $user->charge(100, $paymentMethodId);

$user->refund($payment->id);
```

<a name="invoices"></a>
## Hóa đơn

<a name="retrieving-invoices"></a>
### Truy xuất hóa đơn

Bạn có thể dễ dàng truy xuất các hóa đơn của billable model bằng phương thức `invoices`. Phương thức này trả về một collection các instance `Laravel\Cashier\Invoice`:

```php
$invoices = $user->invoices();
```

Nếu muốn bao gồm cả các hóa đơn đang chờ xử lý trong kết quả, bạn có thể sử dụng `invoicesIncludingPending`:

```php
$invoices = $user->invoicesIncludingPending();
```

Bạn có thể dùng `findInvoice` để truy xuất một hóa đơn cụ thể theo ID:

```php
$invoice = $user->findInvoice($invoiceId);
```

<a name="displaying-invoice-information"></a>
#### Hiển thị thông tin hóa đơn

Khi liệt kê hóa đơn của khách hàng, bạn có thể dùng các phương thức trên invoice để hiển thị thông tin liên quan. Ví dụ, bạn có thể liệt kê mọi hóa đơn trong một bảng để người dùng dễ dàng tải xuống bất kỳ hóa đơn nào:

```blade
<table>
    @foreach ($invoices as $invoice)
        <tr>
            <td>{{ $invoice->date()->toFormattedDateString() }}</td>
            <td>{{ $invoice->total() }}</td>
            <td><a href="/user/invoice/{{ $invoice->id }}">Download</a></td>
        </tr>
    @endforeach
</table>
```

<a name="upcoming-invoices"></a>
### Hóa đơn sắp tới

Để truy xuất hóa đơn sắp tới của khách hàng, bạn có thể sử dụng phương thức `upcomingInvoice`:

```php
$invoice = $user->upcomingInvoice();
```

Tương tự, nếu khách hàng có nhiều gói đăng ký, bạn cũng có thể truy xuất hóa đơn sắp tới của một gói đăng ký cụ thể:

```php
$invoice = $user->subscription('default')->upcomingInvoice();
```

<a name="previewing-subscription-invoices"></a>
### Xem trước hóa đơn gói đăng ký

Bằng phương thức `previewInvoice`, bạn có thể xem trước hóa đơn trước khi thay đổi price. Điều này giúp xác định hóa đơn của khách hàng sẽ trông như thế nào khi áp dụng một thay đổi price cụ thể:

```php
$invoice = $user->subscription('default')->previewInvoice('price_yearly');
```

Bạn có thể truyền một mảng price vào `previewInvoice` để xem trước hóa đơn với nhiều price mới:

```php
$invoice = $user->subscription('default')->previewInvoice(['price_yearly', 'price_metered']);
```

<a name="generating-invoice-pdfs"></a>
### Tạo PDF hóa đơn

Trước khi tạo PDF hóa đơn, bạn nên dùng Composer để cài thư viện Dompdf, đây là invoice renderer mặc định của Cashier:

```shell
composer require dompdf/dompdf
```

Trong route hoặc controller, bạn có thể dùng `downloadInvoice` để tạo bản tải xuống PDF cho một hóa đơn cụ thể. Phương thức này tự động tạo HTTP response phù hợp để tải hóa đơn:

```php
use Illuminate\Http\Request;

Route::get('/user/invoice/{invoice}', function (Request $request, string $invoiceId) {
    return $request->user()->downloadInvoice($invoiceId);
});
```

Theo mặc định, toàn bộ dữ liệu trên hóa đơn được lấy từ dữ liệu customer và invoice lưu trong Stripe. Tên file dựa trên giá trị cấu hình `app.name`. Tuy nhiên, bạn có thể tùy chỉnh một phần dữ liệu bằng cách truyền mảng làm đối số thứ hai cho `downloadInvoice`. Mảng này cho phép tùy chỉnh các thông tin như công ty và chi tiết sản phẩm:

```php
return $request->user()->downloadInvoice($invoiceId, [
    'vendor' => 'Your Company',
    'product' => 'Your Product',
    'street' => 'Main Str. 1',
    'location' => '2000 Antwerp, Belgium',
    'phone' => '+32 499 00 00 00',
    'email' => 'info@example.com',
    'url' => 'https://example.com',
    'vendorVat' => 'BE123456789',
]);
```

`downloadInvoice` cũng cho phép chỉ định tên file tùy chỉnh qua đối số thứ ba. Tên file sẽ tự động được thêm hậu tố `.pdf`:

```php
return $request->user()->downloadInvoice($invoiceId, [], 'my-invoice');
```

<a name="custom-invoice-render"></a>
#### Trình render hóa đơn tùy chỉnh

Cashier cũng cho phép sử dụng invoice renderer tùy chỉnh. Theo mặc định, Cashier dùng implementation `DompdfInvoiceRenderer`, dựa trên thư viện PHP [dompdf](https://github.com/dompdf/dompdf) để tạo hóa đơn của Cashier. Tuy nhiên, bạn có thể dùng bất kỳ renderer nào bằng cách implement interface `Laravel\Cashier\Contracts\InvoiceRenderer`. Ví dụ, bạn có thể render PDF hóa đơn thông qua API của một dịch vụ render PDF bên thứ ba:

```php
use Illuminate\Support\Facades\Http;
use Laravel\Cashier\Contracts\InvoiceRenderer;
use Laravel\Cashier\Invoice;

class ApiInvoiceRenderer implements InvoiceRenderer
{
    /**
     * Render the given invoice and return the raw PDF bytes.
     */
    public function render(Invoice $invoice, array $data = [], array $options = []): string
    {
        $html = $invoice->view($data)->render();

        return Http::get('https://example.com/html-to-pdf', ['html' => $html])->get()->body();
    }
}
```

Sau khi implement contract invoice renderer, hãy cập nhật giá trị cấu hình `cashier.invoices.renderer` trong file `config/cashier.php` của ứng dụng. Giá trị này phải là tên class của implementation renderer tùy chỉnh.

<a name="checkout"></a>
## Checkout

Cashier Stripe cũng hỗ trợ [Stripe Checkout](https://stripe.com/payments/checkout). Stripe Checkout giúp bạn không phải tự xây dựng các trang thanh toán tùy chỉnh bằng cách cung cấp một trang thanh toán dựng sẵn và được Stripe lưu trữ.

Phần tài liệu sau trình bày cách bắt đầu sử dụng Stripe Checkout với Cashier. Để tìm hiểu sâu hơn về Stripe Checkout, bạn cũng nên tham khảo [tài liệu Checkout của Stripe](https://stripe.com/docs/payments/checkout).

<a name="product-checkouts"></a>
### Checkout sản phẩm

Bạn có thể thực hiện checkout cho một sản phẩm hiện có đã được tạo trong Stripe Dashboard bằng phương thức `checkout` trên billable model. Phương thức `checkout` sẽ khởi tạo một Stripe Checkout session mới. Theo mặc định, bạn cần truyền Stripe Price ID:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout('price_tshirt');
});
```

Nếu cần, bạn cũng có thể chỉ định số lượng sản phẩm:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 15]);
});
```

Khi khách hàng truy cập route này, họ sẽ được chuyển hướng đến trang Checkout của Stripe. Theo mặc định, sau khi người dùng hoàn tất hoặc hủy giao dịch mua, họ sẽ được chuyển hướng về route `home`; tuy nhiên, bạn có thể chỉ định URL callback tùy chỉnh bằng các tùy chọn `success_url` và `cancel_url`:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

Khi định nghĩa tùy chọn checkout `success_url`, bạn có thể yêu cầu Stripe thêm checkout session ID dưới dạng tham số query string khi gọi URL của bạn. Để làm điều này, hãy thêm chuỗi literal `{CHECKOUT_SESSION_ID}` vào query string của `success_url`. Stripe sẽ thay placeholder này bằng checkout session ID thực tế:

```php
use Illuminate\Http\Request;
use Stripe\Checkout\Session;
use Stripe\Customer;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()->checkout(['price_tshirt' => 1], [
        'success_url' => route('checkout-success').'?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => route('checkout-cancel'),
    ]);
});

Route::get('/checkout-success', function (Request $request) {
    $checkoutSession = $request->user()->stripe()->checkout->sessions->retrieve($request->get('session_id'));

    return view('checkout.success', ['checkoutSession' => $checkoutSession]);
})->name('checkout-success');
```

<a name="checkout-promotion-codes"></a>
#### Mã khuyến mãi

Theo mặc định, Stripe Checkout không cho phép [người dùng sử dụng mã khuyến mãi](https://stripe.com/docs/billing/subscriptions/discounts/codes). Bạn có thể dễ dàng bật tính năng này cho trang Checkout bằng cách gọi phương thức `allowPromotionCodes`:

```php
use Illuminate\Http\Request;

Route::get('/product-checkout', function (Request $request) {
    return $request->user()
        ->allowPromotionCodes()
        ->checkout('price_tshirt');
});
```

<a name="single-charge-checkouts"></a>
### Checkout thanh toán một lần

Bạn cũng có thể thực hiện một khoản thanh toán đơn giản cho sản phẩm ad-hoc chưa được tạo trong Stripe Dashboard. Để làm điều này, hãy dùng phương thức `checkoutCharge` trên billable model và truyền số tiền cần thu, tên sản phẩm cùng số lượng tùy chọn. Khi khách hàng truy cập route này, họ sẽ được chuyển hướng đến trang Checkout của Stripe:

```php
use Illuminate\Http\Request;

Route::get('/charge-checkout', function (Request $request) {
    return $request->user()->checkoutCharge(1200, 'T-Shirt', 5);
});
```

> [!WARNING]
> Khi sử dụng phương thức `checkoutCharge`, Stripe luôn tạo một product và price mới trong Stripe Dashboard. Vì vậy, chúng tôi khuyến nghị bạn tạo trước các product trong Stripe Dashboard và sử dụng phương thức `checkout` thay thế.

<a name="subscription-checkouts"></a>
### Checkout gói đăng ký

> [!WARNING]
> Việc sử dụng Stripe Checkout cho gói đăng ký yêu cầu bạn bật webhook `customer.subscription.created` trong Stripe Dashboard. Webhook này sẽ tạo bản ghi subscription trong cơ sở dữ liệu và lưu tất cả subscription item liên quan.

Bạn cũng có thể dùng Stripe Checkout để khởi tạo gói đăng ký. Sau khi định nghĩa subscription bằng các phương thức subscription builder của Cashier, bạn có thể gọi phương thức `checkout`. Khi khách hàng truy cập route này, họ sẽ được chuyển hướng đến trang Checkout của Stripe:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout();
});
```

Tương tự checkout sản phẩm, bạn có thể tùy chỉnh URL thành công và URL hủy:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->checkout([
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

Bạn cũng có thể bật mã khuyến mãi cho checkout gói đăng ký:

```php
use Illuminate\Http\Request;

Route::get('/subscription-checkout', function (Request $request) {
    return $request->user()
        ->newSubscription('default', 'price_monthly')
        ->allowPromotionCodes()
        ->checkout();
});
```

> [!WARNING]
> Stripe Checkout không hỗ trợ tất cả tùy chọn billing của subscription khi khởi tạo gói đăng ký. Việc sử dụng `anchorBillingCycleOn` trên subscription builder, thiết lập hành vi proration hoặc payment behavior sẽ không có hiệu lực trong Stripe Checkout session. Hãy tham khảo [tài liệu Stripe Checkout Session API](https://stripe.com/docs/api/checkout/sessions/create) để xem các tham số khả dụng.

<a name="stripe-checkout-trial-periods"></a>
#### Stripe Checkout và thời gian dùng thử

Bạn có thể định nghĩa thời gian dùng thử khi xây dựng subscription sẽ được hoàn tất thông qua Stripe Checkout:

```php
$checkout = Auth::user()->newSubscription('default', 'price_monthly')
    ->trialDays(3)
    ->checkout();
```

Tuy nhiên, thời gian dùng thử phải ít nhất 48 giờ, đây là thời lượng dùng thử tối thiểu mà Stripe Checkout hỗ trợ.

<a name="stripe-checkout-subscriptions-and-webhooks"></a>
#### Gói đăng ký và Webhook

Hãy nhớ rằng Stripe và Cashier cập nhật trạng thái subscription thông qua webhook, vì vậy subscription có thể chưa active ngay khi khách hàng quay lại ứng dụng sau khi nhập thông tin thanh toán. Để xử lý tình huống này, bạn có thể hiển thị thông báo cho người dùng rằng khoản thanh toán hoặc gói đăng ký của họ đang chờ xử lý.

<a name="collecting-tax-ids"></a>
### Thu thập Tax ID

Checkout cũng hỗ trợ thu thập Tax ID của khách hàng. Để bật tính năng này cho checkout session, hãy gọi phương thức `collectTaxIds` khi tạo session:

```php
$checkout = $user->collectTaxIds()->checkout('price_tshirt');
```

Khi phương thức này được gọi, khách hàng sẽ thấy một checkbox mới cho phép họ cho biết giao dịch mua được thực hiện dưới danh nghĩa công ty hay không. Nếu có, họ sẽ có thể cung cấp số Tax ID.

> [!WARNING]
> Nếu bạn đã cấu hình [tự động thu thuế](#tax-configuration) trong service provider của ứng dụng, tính năng này sẽ tự động được bật và bạn không cần gọi phương thức `collectTaxIds`.

<a name="guest-checkouts"></a>
### Checkout cho khách

Sử dụng phương thức `Checkout::guest`, bạn có thể khởi tạo checkout session cho khách truy cập ứng dụng chưa có "tài khoản":

```php
use Illuminate\Http\Request;
use Laravel\Cashier\Checkout;

Route::get('/product-checkout', function (Request $request) {
    return Checkout::guest()->create('price_tshirt', [
        'success_url' => route('your-success-route'),
        'cancel_url' => route('your-cancel-route'),
    ]);
});
```

Tương tự khi tạo checkout session cho người dùng hiện có, bạn có thể sử dụng các phương thức bổ sung trên instance `Laravel\Cashier\CheckoutBuilder` để tùy chỉnh guest checkout session:

```php
use Illuminate\Http\Request;
use Laravel\Cashier\Checkout;

Route::get('/product-checkout', function (Request $request) {
    return Checkout::guest()
        ->withPromotionCode('promo-code')
        ->create('price_tshirt', [
            'success_url' => route('your-success-route'),
            'cancel_url' => route('your-cancel-route'),
        ]);
});
```

Sau khi guest checkout hoàn tất, Stripe có thể gửi webhook event `checkout.session.completed`, vì vậy hãy đảm bảo [cấu hình Stripe webhook](https://dashboard.stripe.com/webhooks) để gửi event này đến ứng dụng. Khi webhook đã được bật trong Stripe Dashboard, bạn có thể [xử lý webhook bằng Cashier](#handling-stripe-webhooks). Object trong webhook payload sẽ là một [checkout object](https://stripe.com/docs/api/checkout/sessions/object) mà bạn có thể kiểm tra để hoàn tất đơn hàng của khách.

<a name="handling-failed-payments"></a>
## Xử lý thanh toán thất bại

Đôi khi thanh toán cho gói đăng ký hoặc khoản thanh toán một lần có thể thất bại. Khi điều này xảy ra, Cashier sẽ ném exception `Laravel\Cashier\Exceptions\IncompletePayment` để thông báo cho bạn. Sau khi bắt exception này, bạn có hai cách để tiếp tục xử lý.

Đầu tiên, bạn có thể chuyển hướng khách hàng đến trang xác nhận thanh toán chuyên dụng đi kèm Cashier. Trang này đã có named route tương ứng được đăng ký thông qua service provider của Cashier. Vì vậy, bạn có thể bắt exception `IncompletePayment` và chuyển người dùng đến trang xác nhận thanh toán:

```php
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $subscription = $user->newSubscription('default', 'price_monthly')
        ->create($paymentMethod);
} catch (IncompletePayment $exception) {
    return redirect()->route(
        'cashier.payment',
        [$exception->payment->id, 'redirect' => route('home')]
    );
}
```

Trên trang xác nhận thanh toán, khách hàng sẽ được yêu cầu nhập lại thông tin thẻ tín dụng và thực hiện các thao tác bổ sung mà Stripe yêu cầu, chẳng hạn xác nhận "3D Secure". Sau khi xác nhận thanh toán, người dùng sẽ được chuyển hướng đến URL được cung cấp qua tham số `redirect` ở trên. Khi chuyển hướng, các biến query string `message` (string) và `success` (integer) sẽ được thêm vào URL. Trang thanh toán hiện hỗ trợ các loại phương thức thanh toán sau:

<div class="content-list" markdown="1">

- Credit Cards
- Alipay
- Bancontact
- BECS Direct Debit
- EPS
- Giropay
- iDEAL
- SEPA Direct Debit

</div>

Ngoài ra, bạn có thể để Stripe xử lý việc xác nhận thanh toán. Trong trường hợp này, thay vì chuyển hướng đến trang xác nhận thanh toán, bạn có thể [thiết lập email billing tự động của Stripe](https://dashboard.stripe.com/account/billing/automatic) trong Stripe Dashboard. Tuy nhiên, nếu bắt được exception `IncompletePayment`, bạn vẫn nên thông báo rằng người dùng sẽ nhận email chứa hướng dẫn xác nhận thanh toán tiếp theo.

Payment exception có thể được ném từ các phương thức `charge`, `invoiceFor` và `invoice` trên model sử dụng trait `Billable`. Khi làm việc với subscription, phương thức `create` trên `SubscriptionBuilder`, cùng các phương thức `incrementAndInvoice` và `swapAndInvoice` trên model `Subscription` và `SubscriptionItem`, có thể ném incomplete payment exception.

Bạn có thể xác định một subscription hiện có có khoản thanh toán chưa hoàn tất hay không bằng phương thức `hasIncompletePayment` trên billable model hoặc subscription instance:

```php
if ($user->hasIncompletePayment('default')) {
    // ...
}

if ($user->subscription('default')->hasIncompletePayment()) {
    // ...
}
```

Bạn có thể xác định trạng thái cụ thể của khoản thanh toán chưa hoàn tất bằng cách kiểm tra property `payment` trên exception instance:

```php
use Laravel\Cashier\Exceptions\IncompletePayment;

try {
    $user->charge(1000, 'pm_card_threeDSecure2Required');
} catch (IncompletePayment $exception) {
    // Get the payment intent status...
    $exception->payment->status;

    // Check specific conditions...
    if ($exception->payment->requiresPaymentMethod()) {
        // ...
    } elseif ($exception->payment->requiresConfirmation()) {
        // ...
    }
}
```

<a name="confirming-payments"></a>
### Xác nhận thanh toán

Một số phương thức thanh toán yêu cầu dữ liệu bổ sung để xác nhận thanh toán. Ví dụ, phương thức thanh toán SEPA yêu cầu thêm dữ liệu "mandate" trong quá trình thanh toán. Bạn có thể cung cấp dữ liệu này cho Cashier bằng phương thức `withPaymentConfirmationOptions`:

```php
$subscription->withPaymentConfirmationOptions([
    'mandate_data' => '...',
])->swap('price_xxx');
```

Bạn có thể tham khảo [tài liệu Stripe API](https://stripe.com/docs/api/payment_intents/confirm) để xem tất cả tùy chọn được chấp nhận khi xác nhận thanh toán.

<a name="strong-customer-authentication"></a>
## Strong Customer Authentication

Nếu doanh nghiệp của bạn hoặc một trong các khách hàng của bạn đặt tại châu Âu, bạn cần tuân thủ quy định Strong Customer Authentication (SCA) của EU. Liên minh châu Âu áp dụng các quy định này từ tháng 9/2019 nhằm ngăn chặn gian lận thanh toán. Stripe và Cashier đã hỗ trợ việc xây dựng ứng dụng tuân thủ SCA.

> [!WARNING]
> Trước khi bắt đầu, hãy xem [hướng dẫn của Stripe về PSD2 và SCA](https://stripe.com/guides/strong-customer-authentication), cũng như [tài liệu về các SCA API mới](https://stripe.com/docs/strong-customer-authentication).

<a name="payments-requiring-additional-confirmation"></a>
### Thanh toán yêu cầu xác nhận bổ sung

Quy định SCA thường yêu cầu xác minh bổ sung để xác nhận và xử lý thanh toán. Khi điều này xảy ra, Cashier sẽ ném exception `Laravel\Cashier\Exceptions\IncompletePayment` để thông báo rằng cần xác minh thêm. Bạn có thể xem thêm cách xử lý exception này trong phần [xử lý thanh toán thất bại](#handling-failed-payments).

Màn hình xác nhận thanh toán do Stripe hoặc Cashier hiển thị có thể được tùy chỉnh theo luồng thanh toán của từng ngân hàng hoặc đơn vị phát hành thẻ, và có thể bao gồm xác nhận thẻ bổ sung, một khoản thu nhỏ tạm thời, xác thực trên thiết bị riêng hoặc các hình thức xác minh khác.

<a name="incomplete-and-past-due-state"></a>
#### Trạng thái Incomplete và Past Due

Khi một khoản thanh toán cần xác nhận bổ sung, subscription sẽ duy trì trạng thái `incomplete` hoặc `past_due`, thể hiện qua cột `stripe_status` trong cơ sở dữ liệu. Cashier sẽ tự động kích hoạt subscription của khách hàng ngay khi xác nhận thanh toán hoàn tất và ứng dụng nhận được thông báo hoàn tất từ Stripe qua webhook.

Để biết thêm về trạng thái `incomplete` và `past_due`, hãy xem [tài liệu bổ sung về các trạng thái này](#incomplete-and-past-due-status).

<a name="off-session-payment-notifications"></a>
### Thông báo thanh toán Off-Session

Vì quy định SCA đôi khi yêu cầu khách hàng xác minh thông tin thanh toán ngay cả khi subscription đang active, Cashier có thể gửi thông báo cho khách hàng khi cần xác nhận thanh toán off-session. Ví dụ, điều này có thể xảy ra khi subscription được gia hạn. Bạn có thể bật payment notification của Cashier bằng cách đặt biến môi trường `CASHIER_PAYMENT_NOTIFICATION` thành một notification class. Theo mặc định, thông báo này bị tắt. Cashier cung cấp sẵn một notification class cho mục đích này, nhưng bạn cũng có thể cung cấp notification class riêng:

```ini
CASHIER_PAYMENT_NOTIFICATION=Laravel\Cashier\Notifications\ConfirmPayment
```

Để đảm bảo thông báo xác nhận thanh toán off-session được gửi, hãy kiểm tra rằng [Stripe webhook đã được cấu hình](#handling-stripe-webhooks) cho ứng dụng và webhook `invoice.payment_action_required` đã được bật trong Stripe Dashboard. Ngoài ra, model `Billable` cũng nên sử dụng trait `Illuminate\Notifications\Notifiable` của Laravel.

> [!WARNING]
> Thông báo vẫn được gửi ngay cả khi khách hàng đang thực hiện thủ công một khoản thanh toán cần xác nhận bổ sung. Stripe không thể biết khoản thanh toán được thực hiện thủ công hay "off-session". Tuy nhiên, nếu khách hàng truy cập trang thanh toán sau khi đã xác nhận khoản thanh toán, họ chỉ thấy thông báo "Payment Successful". Khách hàng sẽ không thể vô tình xác nhận cùng một khoản thanh toán hai lần và bị tính phí lần thứ hai.

<a name="stripe-sdk"></a>
## Stripe SDK

Nhiều object của Cashier là wrapper quanh các object của Stripe SDK. Nếu muốn tương tác trực tiếp với Stripe object, bạn có thể thuận tiện truy xuất chúng bằng phương thức `asStripe`:

```php
$stripeSubscription = $subscription->asStripeSubscription();

$stripeSubscription->application_fee_percent = 5;

$stripeSubscription->save();
```

Bạn cũng có thể dùng phương thức `updateStripeSubscription` để cập nhật trực tiếp Stripe subscription:

```php
$subscription->updateStripeSubscription(['application_fee_percent' => 5]);
```

Bạn có thể gọi phương thức `stripe` trên class `Cashier` nếu muốn sử dụng trực tiếp client `Stripe\StripeClient`. Ví dụ, bạn có thể dùng phương thức này để truy cập instance `StripeClient` và lấy danh sách price từ tài khoản Stripe:

```php
use Laravel\Cashier\Cashier;

$prices = Cashier::stripe()->prices->all();
```

<a name="testing"></a>
## Kiểm thử

Khi kiểm thử ứng dụng sử dụng Cashier, bạn có thể mock các HTTP request thực tế đến Stripe API; tuy nhiên, cách này yêu cầu bạn tự tái hiện một phần hành vi của Cashier. Vì vậy, chúng tôi khuyến nghị cho phép test gọi Stripe API thực tế. Mặc dù chậm hơn, cách này mang lại độ tin cậy cao hơn rằng ứng dụng hoạt động đúng như mong đợi; các test chậm có thể được đặt trong testing group Pest / PHPUnit riêng.

Khi kiểm thử, hãy nhớ rằng bản thân Cashier đã có một test suite rất tốt, vì vậy bạn chỉ nên tập trung kiểm thử luồng subscription và payment của ứng dụng, thay vì kiểm thử lại mọi hành vi nền tảng của Cashier.

Để bắt đầu, hãy thêm phiên bản **testing** của Stripe secret vào file `phpunit.xml`:

```xml
<env name="STRIPE_SECRET" value="sk_test_<your-key>"/>
```

Từ đây, mỗi khi bạn tương tác với Cashier trong lúc kiểm thử, Cashier sẽ gửi API request thực tế đến môi trường Stripe testing. Để thuận tiện, bạn nên tạo sẵn các subscription / price trong tài khoản Stripe testing để sử dụng khi chạy test.

> [!NOTE]
> Để kiểm thử nhiều tình huống billing khác nhau, chẳng hạn thẻ tín dụng bị từ chối hoặc thanh toán thất bại, bạn có thể sử dụng nhiều [số thẻ và token dành cho testing](https://stripe.com/docs/testing) do Stripe cung cấp.
