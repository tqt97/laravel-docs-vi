# Frontend

<a name="introduction"></a>
## Giới thiệu
Laravel là framework backend cung cấp đầy đủ tính năng cần thiết để xây dựng ứng dụng web hiện đại như [routing](/docs/{{version}}/routing), [validation](/docs/{{version}}/validation), [caching](/docs/{{version}}/cache), [queues](/docs/{{version}}/queues), [file storage](/docs/{{version}}/filesystem) và nhiều hơn nữa. Tuy nhiên, Laravel cũng hướng tới trải nghiệm full-stack hoàn chỉnh, bao gồm các cách mạnh mẽ để xây dựng frontend.
Có hai hướng chính khi phát triển frontend cho ứng dụng Laravel. Lựa chọn phụ thuộc vào việc bạn muốn tận dụng PHP hay dùng JavaScript framework như React, Svelte hoặc Vue. Phần dưới đây trình bày cả hai để bạn có thể chọn cách phù hợp với ứng dụng.
<a name="using-php"></a>
## Sử dụng PHP
<a name="php-and-blade"></a>
### PHP và Blade
Trước đây, phần lớn ứng dụng PHP render HTML ra browser bằng các template HTML đơn giản xen kẽ câu lệnh PHP `echo` để hiển thị data được lấy từ database trong request:
```blade
<div>
    <?php foreach ($users as $user): ?>
        Hello, <?php echo $user->name; ?> <br />
    <?php endforeach; ?>
</div>
```
Trong Laravel, cách render HTML này vẫn được hỗ trợ thông qua [views](/docs/{{version}}/views) và [Blade](/docs/{{version}}/blade). Blade là templating language rất nhẹ, cung cấp syntax ngắn gọn để hiển thị data, lặp qua data và nhiều thao tác khác:
```blade
<div>
    @foreach ($users as $user)
        Hello, {{ $user->name }} <br />
    @endforeach
</div>
```
Khi xây dựng ứng dụng theo hướng này, việc gửi biểu mẫu và các tương tác trên trang thường nhận về một tài liệu HTML hoàn toàn mới từ máy chủ, sau đó trình duyệt render lại toàn bộ trang. Ngay cả hiện nay, nhiều ứng dụng vẫn rất phù hợp với frontend được xây bằng Blade template đơn giản.
<a name="growing-expectations"></a>
#### Kỳ vọng ngày càng cao
Khi kỳ vọng của người dùng đối với ứng dụng web tăng lên, nhiều lập trình viên cần xây dựng frontend động hơn với trải nghiệm tương tác mượt mà, hoàn thiện hơn. Vì vậy, một số nhóm lựa chọn framework JavaScript như React, Svelte hoặc Vue.
Những lập trình viên muốn tiếp tục sử dụng ngôn ngữ backend quen thuộc cũng đã xây dựng các giải pháp cho phép tạo giao diện web hiện đại mà vẫn chủ yếu dùng ngôn ngữ backend. Ví dụ trong hệ sinh thái [Rails](https://rubyonrails.org/), điều này dẫn tới các library như [Turbo](https://turbo.hotwired.dev/), [Hotwire](https://hotwired.dev/) và [Stimulus](https://stimulus.hotwired.dev/).
Trong hệ sinh thái Laravel, nhu cầu tạo frontend hiện đại, động nhưng chủ yếu dùng PHP đã dẫn tới [Laravel Livewire](https://livewire.laravel.com) và [Alpine.js](https://alpinejs.dev/).
<a name="livewire"></a>
### Livewire
[Laravel Livewire](https://livewire.laravel.com) là framework xây frontend chạy trên Laravel nhưng vẫn mang cảm giác động và hiện đại tương tự frontend dùng React, Svelte hoặc Vue.
Khi dùng Livewire, bạn tạo các "component" render một phần UI riêng biệt và expose method cùng data để frontend có thể tương tác. Ví dụ, một component "Counter" đơn giản có thể như sau:
```php
<?php

use Livewire\Component;

new class extends Component
{
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }
};
?>

<div>
    <button wire:click="increment">+</button>
    <h1>{{ $count }}</h1>
</div>

```
Livewire cho phép viết thuộc tính HTML như `wire:click` để kết nối frontend với backend Laravel. Đồng thời, trạng thái hiện tại của component có thể được render bằng một biểu thức Blade đơn giản.
Với nhiều lập trình viên, Livewire thay đổi đáng kể cách phát triển frontend Laravel: họ vẫn ở trong hệ sinh thái Laravel nhưng có thể xây dựng ứng dụng web hiện đại và có tính tương tác cao. Thông thường developer dùng Livewire cũng dùng [Alpine.js](https://alpinejs.dev/) để bổ sung JavaScript ở nơi thực sự cần, chẳng hạn render dialog.
Nếu mới học Laravel, trước tiên hãy làm quen với [views](/docs/{{version}}/views) và [Blade](/docs/{{version}}/blade), sau đó xem [tài liệu Laravel Livewire](https://livewire.laravel.com/docs) chính thức để học cách xây component tương tác.
<a name="php-starter-kits"></a>
### Starter Kits
Nếu muốn xây frontend bằng PHP và Livewire, bạn có thể dùng [Livewire starter kit](/docs/{{version}}/starter-kits) để khởi động project nhanh hơn.
<a name="using-react-svelte-or-vue"></a>
## Sử dụng React, Svelte hoặc Vue
Dù Laravel + Livewire có thể xây dựng frontend hiện đại, nhiều lập trình viên vẫn muốn tận dụng sức mạnh của framework JavaScript như React, Svelte hoặc Vue. Điều này mở ra hệ sinh thái package và công cụ phong phú từ NPM.
Tuy nhiên, nếu không có công cụ bổ sung, việc kết hợp Laravel với React, Svelte hoặc Vue buộc bạn phải giải quyết nhiều vấn đề phức tạp như routing phía client, data hydration và authentication. Routing phía client thường được đơn giản hóa bằng các framework có convention rõ ràng như [Next](https://nextjs.org/) hay [Nuxt](https://nuxt.com/), nhưng hydration và authentication vẫn là bài toán phức tạp khi ghép frontend framework với backend framework như Laravel.
Ngoài ra, lập trình viên phải duy trì hai repository riêng, thường xuyên phối hợp việc bảo trì, phát hành và triển khai giữa cả hai. Các vấn đề này hoàn toàn có thể giải quyết, nhưng đây không phải lúc nào cũng là cách phát triển hiệu quả hoặc dễ chịu.
<a name="inertia"></a>
### Inertia
[Inertia](https://inertiajs.com) kết nối Laravel với frontend React, Svelte hoặc Vue, cho phép xây frontend hiện đại đầy đủ bằng JavaScript framework nhưng vẫn dùng route và controller Laravel cho routing, data hydration và authentication — tất cả trong cùng một repository mã nguồn. Cách này cho phép tận dụng đầy đủ sức mạnh của cả Laravel và React / Svelte / Vue mà không làm suy giảm khả năng của bên nào.
Sau khi cài Inertia vào ứng dụng Laravel, bạn vẫn viết route và controller như bình thường. Tuy nhiên, thay vì trả Blade template từ controller, bạn trả một Inertia page:
```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Show the profile for a given user.
     */
    public function show(string $id): Response
    {
        return Inertia::render('users/show', [
            'user' => User::findOrFail($id)
        ]);
    }
}
```
Một trang Inertia tương ứng với một component React, Svelte hoặc Vue, thường nằm trong `resources/js/pages`. Dữ liệu truyền qua `Inertia::render` được dùng để hydrate các "props" của page component:
```jsx
import Layout from '@/layouts/authenticated';
import { Head } from '@inertiajs/react';

export default function Show({ user }) {
    return (
        <Layout>
            <Head title="Welcome" />
            <h1>Welcome</h1>
            <p>Hello {user.name}, welcome to Inertia.</p>
        </Layout>
    )
}
```
Như vậy, Inertia cho phép tận dụng toàn bộ sức mạnh của React, Svelte hoặc Vue cho frontend, đồng thời cung cấp một cầu nối nhẹ giữa backend Laravel và frontend JavaScript.
#### Render phía máy chủ
Nếu ứng dụng cần server-side rendering, Inertia có [hỗ trợ SSR](https://inertiajs.com/server-side-rendering). Khi deploy qua [Laravel Cloud](https://cloud.laravel.com) hoặc [Laravel Forge](https://forge.laravel.com), việc đảm bảo process SSR của Inertia luôn chạy cũng tương đối đơn giản.
<a name="inertia-starter-kits"></a>
### Starter Kits
Nếu muốn xây frontend bằng Inertia và React / Svelte / Vue, bạn có thể dùng [starter kit React, Svelte hoặc Vue](/docs/{{version}}/starter-kits). Các starter kit scaffold flow authentication cho cả backend và frontend bằng Inertia, React / Svelte / Vue, [Tailwind](https://tailwindcss.com) và [Vite](https://vitejs.dev), giúp bạn bắt đầu feature ứng dụng nhanh hơn.
<a name="bundling-assets"></a>
## Đóng gói tài nguyên
Dù chọn Blade + Livewire hay React / Svelte / Vue + Inertia, bạn thường vẫn cần đóng gói CSS thành tài nguyên sẵn sàng cho môi trường production. Nếu dùng React, Svelte hoặc Vue, bạn cũng cần bundle component thành JavaScript asset mà browser có thể chạy.
Mặc định Laravel dùng [Vite](https://vitejs.dev) để đóng gói tài nguyên. Vite cho thời gian build rất nhanh và Hot Module Replacement (HMR) gần như tức thời khi phát triển local. Trong mọi ứng dụng Laravel mới, bao gồm starter kit, bạn sẽ thấy file `vite.config.js` nạp Laravel Vite plugin gọn nhẹ để tích hợp Vite thuận tiện với Laravel.
Cách nhanh nhất để bắt đầu Laravel + Vite là dùng [application starter kit](/docs/{{version}}/starter-kits), vốn đã cung cấp scaffolding authentication cho frontend và backend.
> [!NOTE]
> Để tìm hiểu chi tiết cách dùng Vite với Laravel, hãy xem [tài liệu Vite dành riêng cho asset bundling](/docs/{{version}}/vite).
