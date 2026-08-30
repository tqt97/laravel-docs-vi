# Hướng dẫn đóng góp
- [Báo lỗi](#bug-reports)
- [Câu hỏi hỗ trợ](#support-questions)
- [Thảo luận phát triển Core](#core-development-discussion)
- [Nên gửi vào Branch nào?](#which-branch)
- [Compiled Assets](#compiled-assets)
- [Đóng góp có sử dụng AI](#ai-generated-contributions)
- [Lỗ hổng bảo mật](#security-vulnerabilities)
- [Coding Style](#coding-style)
    - [PHPDoc](#phpdoc)
    - [StyleCI](#styleci)
- [Quy tắc ứng xử](#code-of-conduct)
<a name="bug-reports"></a>
## Báo lỗi
Để khuyến khích cộng tác chủ động, Laravel ưu tiên pull request chứ không chỉ bug report. Pull request chỉ được review khi đã được đánh dấu "ready for review" — không còn ở trạng thái "draft" — và toàn bộ test cho feature mới đều pass. Pull request ở trạng thái draft nhưng không còn hoạt động trong vài ngày có thể bị đóng.
Nếu tạo bug report, issue nên có tiêu đề và mô tả vấn đề rõ ràng. Hãy cung cấp càng nhiều thông tin liên quan càng tốt, đồng thời thêm code sample tái hiện lỗi. Mục tiêu của bug report là giúp chính bạn và những người khác có thể tái hiện lỗi dễ dàng rồi phát triển bản sửa.
Hãy nhớ rằng bug report được tạo với kỳ vọng những người gặp cùng vấn đề có thể cùng bạn tìm cách giải quyết. Đừng mặc định rằng issue sẽ tự động được xử lý hoặc sẽ có người lập tức sửa lỗi. Bug report là điểm bắt đầu giúp cộng đồng cùng tiến tới bản fix. Nếu muốn trực tiếp hỗ trợ, bạn có thể sửa [các bug đang được liệt kê trên issue tracker](https://github.com/issues?q=is%3Aopen+is%3Aissue+label%3Abug+user%3Alaravel). Bạn cần đăng nhập GitHub để xem đầy đủ issue của Laravel.
Nếu phát hiện DocBlock không đúng, cảnh báo PHPStan hoặc IDE khi sử dụng Laravel, đừng tạo GitHub issue. Thay vào đó, hãy gửi pull request sửa trực tiếp vấn đề.
Source code Laravel được quản lý trên GitHub, với repository riêng cho từng project của Laravel:
<div class="content-list" markdown="1">

- [Laravel AI SDK](https://github.com/laravel/ai)
- [Laravel Application](https://github.com/laravel/laravel)
- [Laravel Art](https://github.com/laravel/art)
- [Laravel Boost](https://github.com/laravel/boost)
- [Laravel Documentation](https://github.com/laravel/docs)
- [Laravel Dusk](https://github.com/laravel/dusk)
- [Laravel Cashier Stripe](https://github.com/laravel/cashier)
- [Laravel Cashier Paddle](https://github.com/laravel/cashier-paddle)
- [Laravel Echo](https://github.com/laravel/echo)
- [Laravel Envoy](https://github.com/laravel/envoy)
- [Laravel Folio](https://github.com/laravel/folio)
- [Laravel Framework](https://github.com/laravel/framework)
- [Laravel Horizon](https://github.com/laravel/horizon)
- [Laravel Passport](https://github.com/laravel/passport)
- [Laravel Pennant](https://github.com/laravel/pennant)
- [Laravel Pint](https://github.com/laravel/pint)
- [Laravel Prompts](https://github.com/laravel/prompts)
- [Laravel Reverb](https://github.com/laravel/reverb)
- [Laravel Sail](https://github.com/laravel/sail)
- [Laravel Sanctum](https://github.com/laravel/sanctum)
- [Laravel Scout](https://github.com/laravel/scout)
- [Laravel Socialite](https://github.com/laravel/socialite)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [Laravel Livewire Starter Kit](https://github.com/laravel/livewire-starter-kit)
- [Laravel React Starter Kit](https://github.com/laravel/react-starter-kit)
- [Laravel Svelte Starter Kit](https://github.com/laravel/svelte-starter-kit)
- [Laravel Vue Starter Kit](https://github.com/laravel/vue-starter-kit)

</div>

<a name="support-questions"></a>
## Câu hỏi hỗ trợ
GitHub issue tracker của Laravel không dùng để cung cấp trợ giúp hay hỗ trợ sử dụng Laravel. Thay vào đó, hãy dùng một trong các kênh sau:
<div class="content-list" markdown="1">

- [GitHub Discussions](https://github.com/laravel/framework/discussions)
- [Laracasts Forums](https://laracasts.com/discuss)
- [Laravel.io Forums](https://laravel.io/forum)
- [StackOverflow](https://stackoverflow.com/questions/tagged/laravel)
- [Discord](https://discord.gg/laravel)
- [Larachat](https://larachat.co)
- [IRC](https://web.libera.chat/?nick=artisan&channels=#laravel)

</div>

<a name="core-development-discussion"></a>
## Thảo luận phát triển Core
Bạn có thể đề xuất feature mới hoặc cải thiện behavior hiện tại của Laravel trên [GitHub discussion board](https://github.com/laravel/framework/discussions) của framework. Nếu đề xuất feature mới, hãy sẵn sàng triển khai ít nhất một phần code cần thiết để hoàn thiện feature đó.
Các thảo luận không chính thức về bug, feature mới và implementation hiện có diễn ra trong channel `#internals` của [Laravel Discord server](https://discord.gg/laravel). Taylor Otwell, maintainer của Laravel, thường có mặt vào ngày làm việc từ 8:00 đến 17:00 (UTC-06:00 / America/Chicago), và thỉnh thoảng xuất hiện vào những khung giờ khác.
<a name="which-branch"></a>
## Nên gửi vào Branch nào?
**Tất cả** bug fix nên được gửi vào phiên bản mới nhất vẫn còn nhận bug fix (hiện là `13.x`). Bug fix **không nên** gửi vào branch `master` trừ khi nó sửa feature chỉ tồn tại trong bản phát hành sắp tới.
Các feature **minor** và **hoàn toàn tương thích ngược** với bản phát hành hiện tại có thể được gửi vào stable branch mới nhất (hiện là `13.x`).
Feature **major** mới hoặc feature có breaking change luôn nên được gửi vào branch `master`, nơi chứa code của bản phát hành sắp tới.
<a name="compiled-assets"></a>
## Compiled Assets
Nếu thay đổi của bạn ảnh hưởng tới file đã compile — chẳng hạn phần lớn file trong `resources/css` hoặc `resources/js` của repository `laravel/laravel` — đừng commit các file đã compile. Do kích thước lớn, maintainer không thể review chúng một cách thực tế. Đây cũng có thể bị lợi dụng để chèn code độc hại vào Laravel. Vì vậy, toàn bộ compiled file sẽ do maintainer Laravel generate và commit.
<a name="ai-generated-contributions"></a>
## Đóng góp có sử dụng AI
Laravel trân trọng mọi pull request được gửi tới. Tuy nhiên, đóng góp chủ yếu do AI sinh ra mà thiếu quá trình review và cân nhắc kỹ lưỡng của con người là không được chấp nhận.
Nếu sử dụng công cụ AI để hỗ trợ đóng góp, code kết quả **phải** được bạn review kỹ, test và thực sự hiểu trước khi gửi.
Mô tả pull request **phải** do chính contributor viết hoàn toàn. Pull request có mô tả do AI sinh sẽ bị đóng.
**Việc mở hàng loạt issue hoặc pull request hoàn toàn do AI sinh sẽ không được chấp nhận.** Các pull request như vậy sẽ bị đóng mà không review và contributor có thể bị chặn khỏi repository.
Laravel khuyến khích contributor làm quen với codebase hiện có, tương tác với cộng đồng và gửi pull request phản ánh hiểu biết cũng như sự cân nhắc thực tế của chính mình về vấn đề đang giải quyết.
<a name="security-vulnerabilities"></a>
## Lỗ hổng bảo mật
Nếu phát hiện lỗ hổng bảo mật trong Laravel, hãy gửi email cho security team tại <a href="mailto:security@laravel.com">security@laravel.com</a>. Mọi lỗ hổng bảo mật sẽ được xử lý sớm nhất có thể.
<a name="coding-style"></a>
## Coding Style
Laravel tuân theo coding standard [PSR-2](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-2-coding-style-guide.md) và autoloading standard [PSR-4](https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-4-autoloader.md).
<a name="phpdoc"></a>
### PHPDoc
Dưới đây là ví dụ về một documentation block hợp lệ trong Laravel. Lưu ý attribute `@param` được theo sau bởi hai khoảng trắng, type của argument, thêm hai khoảng trắng rồi tới tên variable:
```php
/**
 * Register a binding with the container.
 *
 * @param  string|array  $abstract
 * @param  \Closure|string|null  $concrete
 * @param  bool  $shared
 * @return void
 *
 * @throws \Exception
 */
public function bind($abstract, $concrete = null, $shared = false)
{
    // ...
}
```
Khi attribute `@param` hoặc `@return` trở nên dư thừa vì đã có native type, bạn có thể loại bỏ chúng:
```php
/**
 * Execute the job.
 * [tl! remove]
 * @return void [tl! remove]
 */
public function handle(AudioProcessor $processor): void
{
    // ...
}
```
Tuy nhiên, khi native type là generic, hãy chỉ định generic type thông qua attribute `@param` hoặc `@return`:
```php
/**
 * Get the attachments for the message.
 * [tl! add]
 * @return array<int, \Illuminate\Mail\Mailables\Attachment> [tl! add]
 */
public function attachments(): array
{
    return [
        Attachment::fromStorage('/path/to/file'),
    ];
}
```

<a name="styleci"></a>
### StyleCI
Đừng lo nếu code style chưa hoàn hảo. [StyleCI](https://styleci.io/) sẽ tự động merge các style fix vào repository Laravel sau khi pull request được merge. Điều này giúp team tập trung vào nội dung đóng góp thay vì chi tiết format code.
<a name="code-of-conduct"></a>
## Quy tắc ứng xử
Code of conduct của Laravel được phát triển dựa trên Ruby code of conduct. Mọi vi phạm có thể được báo cho Taylor Otwell (taylor@laravel.com):
<div class="content-list" markdown="1">

- Thành viên cần tôn trọng và chấp nhận những quan điểm trái chiều.
- Ngôn từ và hành động không được chứa công kích cá nhân hoặc nhận xét mang tính hạ thấp người khác.
- Khi diễn giải lời nói và hành động của người khác, hãy mặc định rằng họ có thiện chí.
- Những hành vi có thể được xem là quấy rối sẽ không được chấp nhận.
</div>

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/contributions). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
