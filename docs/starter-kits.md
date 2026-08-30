# Starter Kit

<a name="introduction"></a>
## Giới thiệu

Để giúp bạn bắt đầu xây dựng ứng dụng Laravel mới nhanh hơn, Laravel cung cấp các [starter kit cho ứng dụng](https://laravel.com/starter-kits). Các starter kit này cung cấp sẵn những thành phần nền tảng cho ứng dụng Laravel tiếp theo của bạn, bao gồm route, controller và view cần thiết để đăng ký và xác thực người dùng. Các starter kit sử dụng [Laravel Fortify](/fortify) để cung cấp chức năng xác thực.

Bạn có thể sử dụng các starter kit này, nhưng chúng không bắt buộc. Bạn hoàn toàn có thể xây dựng ứng dụng từ đầu bằng cách cài đặt một bản Laravel mới. Dù chọn cách nào, bạn vẫn có toàn quyền xây dựng ứng dụng theo nhu cầu của mình.

<a name="creating-an-application"></a>
## Tạo ứng dụng bằng Starter Kit

Để tạo ứng dụng Laravel mới bằng một trong các starter kit, trước tiên bạn nên [cài đặt PHP và công cụ Laravel CLI](/installation#installing-php). Nếu đã cài PHP và Composer, bạn có thể cài Laravel installer CLI thông qua Composer:

```shell
composer global require laravel/installer
```

Sau đó, tạo ứng dụng Laravel mới bằng Laravel installer CLI. Laravel installer sẽ yêu cầu bạn chọn starter kit mong muốn:

```shell
laravel new my-app
```

Sau khi tạo ứng dụng Laravel, bạn chỉ cần cài các dependency frontend bằng NPM và khởi động development server của Laravel:

```shell
cd my-app
npm install && npm run build
composer run dev
```

Sau khi development server của Laravel được khởi động, bạn có thể truy cập ứng dụng bằng trình duyệt tại [http://localhost:8000](http://localhost:8000).

<a name="available-starter-kits"></a>
## Các Starter Kit hiện có

<a name="react"></a>
### React

React starter kit cung cấp một nền tảng khởi đầu hiện đại và vững chắc để xây dựng ứng dụng Laravel có frontend React bằng [Inertia](https://inertiajs.com).

Inertia cho phép bạn xây dựng ứng dụng React single-page hiện đại nhưng vẫn sử dụng routing và controller phía server theo cách truyền thống. Nhờ đó, bạn có thể kết hợp sức mạnh frontend của React với năng suất backend của Laravel và tốc độ biên dịch rất nhanh của Vite.

React starter kit sử dụng React 19, TypeScript, Tailwind và thư viện component [shadcn/ui](https://ui.shadcn.com).

<a name="svelte"></a>
### Svelte

Svelte starter kit cung cấp một nền tảng khởi đầu hiện đại và vững chắc để xây dựng ứng dụng Laravel có frontend Svelte bằng [Inertia](https://inertiajs.com).

Inertia cho phép bạn xây dựng ứng dụng Svelte single-page hiện đại nhưng vẫn sử dụng routing và controller phía server theo cách truyền thống. Nhờ đó, bạn có thể kết hợp sức mạnh frontend của Svelte với năng suất backend của Laravel và tốc độ biên dịch rất nhanh của Vite.

Svelte starter kit sử dụng Svelte 5, TypeScript, Tailwind và thư viện component [shadcn-svelte](https://www.shadcn-svelte.com/).

<a name="vue"></a>
### Vue

Vue starter kit cung cấp một nền tảng khởi đầu tốt để xây dựng ứng dụng Laravel có frontend Vue bằng [Inertia](https://inertiajs.com).

Inertia cho phép bạn xây dựng ứng dụng Vue single-page hiện đại nhưng vẫn sử dụng routing và controller phía server theo cách truyền thống. Nhờ đó, bạn có thể kết hợp sức mạnh frontend của Vue với năng suất backend của Laravel và tốc độ biên dịch rất nhanh của Vite.

Vue starter kit sử dụng Vue Composition API, TypeScript, Tailwind và thư viện component [shadcn-vue](https://www.shadcn-vue.com/).

<a name="livewire"></a>
### Livewire

Livewire starter kit cung cấp nền tảng khởi đầu phù hợp để xây dựng ứng dụng Laravel với frontend sử dụng [Laravel Livewire](https://livewire.laravel.com).

Livewire là một cách mạnh mẽ để xây dựng giao diện frontend động và reactive chỉ bằng PHP. Đây là lựa chọn phù hợp cho các đội ngũ chủ yếu sử dụng Blade template và muốn một giải pháp đơn giản hơn so với các SPA framework dựa trên JavaScript như React, Svelte và Vue.

Livewire starter kit sử dụng Livewire, Tailwind và thư viện component [Flux UI](https://fluxui.dev).

<a name="starter-kit-customization"></a>
## Tùy chỉnh Starter Kit

<a name="react-customization"></a>
### React

React starter kit được xây dựng với Inertia 3, React 19, Tailwind 4 và [shadcn/ui](https://ui.shadcn.com). Tương tự tất cả starter kit khác, toàn bộ mã backend và frontend đều nằm trong ứng dụng của bạn để bạn có thể tùy chỉnh hoàn toàn.

Phần lớn mã frontend nằm trong thư mục `resources/js`. Bạn có thể sửa bất kỳ phần mã nào để tùy chỉnh giao diện và hành vi của ứng dụng:

```text
resources/js/
├── components/    # Reusable React components
├── hooks/         # React hooks
├── layouts/       # Application layouts
├── lib/           # Utility functions and configuration
├── pages/         # Page components
└── types/         # TypeScript definitions
```

Để thêm các component shadcn khác, trước tiên hãy [tìm component bạn muốn thêm](https://ui.shadcn.com). Sau đó, thêm component bằng `npx`:

```shell
npx shadcn@latest add switch
```

Trong ví dụ này, lệnh sẽ thêm component Switch vào `resources/js/components/ui/switch.tsx`. Sau khi component được thêm, bạn có thể sử dụng nó trong bất kỳ page nào:

```jsx
import { Switch } from "@/components/ui/switch"

const MyPage = () => {
  return (
    <div>
      <Switch />
    </div>
  );
};

export default MyPage;
```

<a name="react-available-layouts"></a>
#### Các layout hiện có

React starter kit cung cấp hai layout chính để bạn lựa chọn: layout "sidebar" và layout "header". Sidebar là layout mặc định, nhưng bạn có thể chuyển sang header bằng cách thay đổi layout được import ở đầu file `resources/js/layouts/app-layout.tsx` của ứng dụng:

```js
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout'; // [tl! remove]
import AppLayoutTemplate from '@/layouts/app/app-header-layout'; // [tl! add]
```

<a name="react-sidebar-variants"></a>
#### Các biến thể Sidebar

Layout sidebar có ba biến thể: sidebar mặc định, "inset" và "floating". Bạn có thể chọn biến thể phù hợp bằng cách sửa component `resources/js/components/app-sidebar.tsx`:

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="react-authentication-page-layout-variants"></a>
#### Các biến thể layout trang xác thực

Các trang xác thực trong React starter kit, chẳng hạn trang đăng nhập và đăng ký, cũng cung cấp ba biến thể layout: "simple", "card" và "split".

Để thay đổi layout xác thực, hãy sửa layout được import ở đầu file `resources/js/layouts/auth-layout.tsx` của ứng dụng:

```js
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout'; // [tl! remove]
import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout'; // [tl! add]
```

<a name="svelte-customization"></a>
### Svelte

Svelte starter kit được xây dựng với Inertia 3, Svelte 5, Tailwind và [shadcn-svelte](https://www.shadcn-svelte.com/). Tương tự tất cả starter kit khác, toàn bộ mã backend và frontend đều nằm trong ứng dụng của bạn để bạn có thể tùy chỉnh hoàn toàn.

Phần lớn mã frontend nằm trong thư mục `resources/js`. Bạn có thể sửa bất kỳ phần mã nào để tùy chỉnh giao diện và hành vi của ứng dụng:

```text
resources/js/
├── components/    # Reusable Svelte components
├── layouts/       # Application layouts
├── lib/           # Utility functions and configuration and Svelte rune modules
├── pages/         # Page components
└── types/         # TypeScript definitions
```

Để thêm các component shadcn-svelte khác, trước tiên hãy [tìm component bạn muốn thêm](https://www.shadcn-svelte.com). Sau đó, thêm component bằng `npx`:

```shell
npx shadcn-svelte@latest add switch
```

Trong ví dụ này, lệnh sẽ thêm component Switch vào `resources/js/components/ui/switch/switch.svelte`. Sau khi component được thêm, bạn có thể sử dụng nó trong bất kỳ page nào:

```svelte
<script lang="ts">
    import { Switch } from '@/components/ui/switch'
</script>

<div>
    <Switch />
</div>
```

<a name="svelte-available-layouts"></a>
#### Các layout hiện có

Svelte starter kit cung cấp hai layout chính để bạn lựa chọn: layout "sidebar" và layout "header". Sidebar là layout mặc định, nhưng bạn có thể chuyển sang header bằng cách thay đổi layout được import ở đầu file `resources/js/layouts/AppLayout.svelte` của ứng dụng:

```js
import AppLayout from '@/layouts/app/AppSidebarLayout.svelte'; // [tl! remove]
import AppLayout from '@/layouts/app/AppHeaderLayout.svelte'; // [tl! add]
```

<a name="svelte-sidebar-variants"></a>
#### Các biến thể Sidebar

Layout sidebar có ba biến thể: sidebar mặc định, "inset" và "floating". Bạn có thể chọn biến thể phù hợp bằng cách sửa component `resources/js/components/AppSidebar.svelte`:

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="svelte-authentication-page-layout-variants"></a>
#### Các biến thể layout trang xác thực

Các trang xác thực trong Svelte starter kit, chẳng hạn trang đăng nhập và đăng ký, cũng cung cấp ba biến thể layout: "simple", "card" và "split".

Để thay đổi layout xác thực, hãy sửa layout được import ở đầu file `resources/js/layouts/AuthLayout.svelte` của ứng dụng:

```js
import AuthLayout from '@/layouts/auth/AuthSimpleLayout.svelte'; // [tl! remove]
import AuthLayout from '@/layouts/auth/AuthSplitLayout.svelte'; // [tl! add]
```

<a name="vue-customization"></a>
### Vue

Vue starter kit được xây dựng với Inertia 3, Vue 3 Composition API, Tailwind và [shadcn-vue](https://www.shadcn-vue.com/). Tương tự tất cả starter kit khác, toàn bộ mã backend và frontend đều nằm trong ứng dụng của bạn để bạn có thể tùy chỉnh hoàn toàn.

Phần lớn mã frontend nằm trong thư mục `resources/js`. Bạn có thể sửa bất kỳ phần mã nào để tùy chỉnh giao diện và hành vi của ứng dụng:

```text
resources/js/
├── components/    # Reusable Vue components
├── composables/   # Vue composables / hooks
├── layouts/       # Application layouts
├── lib/           # Utility functions and configuration
├── pages/         # Page components
└── types/         # TypeScript definitions
```

Để thêm các component shadcn-vue khác, trước tiên hãy [tìm component bạn muốn thêm](https://www.shadcn-vue.com). Sau đó, thêm component bằng `npx`:

```shell
npx shadcn-vue@latest add switch
```

Trong ví dụ này, lệnh sẽ thêm component Switch vào `resources/js/components/ui/Switch.vue`. Sau khi component được thêm, bạn có thể sử dụng nó trong bất kỳ page nào:

```vue
<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>

<template>
    <div>
        <Switch />
    </div>
</template>
```

<a name="vue-available-layouts"></a>
#### Các layout hiện có

Vue starter kit cung cấp hai layout chính để bạn lựa chọn: layout "sidebar" và layout "header". Sidebar là layout mặc định, nhưng bạn có thể chuyển sang header bằng cách thay đổi layout được import ở đầu file `resources/js/layouts/AppLayout.vue` của ứng dụng:

```js
import AppLayout from '@/layouts/app/AppSidebarLayout.vue'; // [tl! remove]
import AppLayout from '@/layouts/app/AppHeaderLayout.vue'; // [tl! add]
```

<a name="vue-sidebar-variants"></a>
#### Các biến thể Sidebar

Layout sidebar có ba biến thể: sidebar mặc định, "inset" và "floating". Bạn có thể chọn biến thể phù hợp bằng cách sửa component `resources/js/components/AppSidebar.vue`:

```text
<Sidebar collapsible="icon" variant="sidebar"> [tl! remove]
<Sidebar collapsible="icon" variant="inset"> [tl! add]
```

<a name="vue-authentication-page-layout-variants"></a>
#### Các biến thể layout trang xác thực

Các trang xác thực trong Vue starter kit, chẳng hạn trang đăng nhập và đăng ký, cũng cung cấp ba biến thể layout: "simple", "card" và "split".

Để thay đổi layout xác thực, hãy sửa layout được import ở đầu file `resources/js/layouts/AuthLayout.vue` của ứng dụng:

```js
import AuthLayout from '@/layouts/auth/AuthSimpleLayout.vue'; // [tl! remove]
import AuthLayout from '@/layouts/auth/AuthSplitLayout.vue'; // [tl! add]
```

<a name="livewire-customization"></a>
### Livewire

Livewire starter kit được xây dựng với Livewire 4, Tailwind và [Flux UI](https://fluxui.dev/). Tương tự tất cả starter kit khác, toàn bộ mã backend và frontend đều nằm trong ứng dụng của bạn để bạn có thể tùy chỉnh hoàn toàn.

Phần lớn mã frontend nằm trong thư mục `resources/views`. Bạn có thể sửa bất kỳ phần mã nào để tùy chỉnh giao diện và hành vi của ứng dụng:

```text
resources/views
├── components            # Reusable components
├── flux                  # Customized Flux components
├── layouts               # Application layouts
├── pages                 # Livewire pages
├── partials              # Reusable Blade partials
├── dashboard.blade.php   # Authenticated user dashboard
├── welcome.blade.php     # Guest user welcome page
```

<a name="livewire-available-layouts"></a>
#### Các layout hiện có

Livewire starter kit cung cấp hai layout chính để bạn lựa chọn: layout "sidebar" và layout "header". Sidebar là layout mặc định, nhưng bạn có thể chuyển sang header bằng cách sửa layout được sử dụng trong file `resources/views/layouts/app.blade.php`. Ngoài ra, bạn nên thêm attribute `container` vào component Flux chính:

```blade
<x-layouts::app.header>
    <flux:main container>
        {{ $slot }}
    </flux:main>
</x-layouts::app.header>
```

<a name="livewire-authentication-page-layout-variants"></a>
#### Các biến thể layout trang xác thực

Các trang xác thực trong Livewire starter kit, chẳng hạn trang đăng nhập và đăng ký, cũng cung cấp ba biến thể layout: "simple", "card" và "split".

Để thay đổi layout xác thực, hãy sửa layout được sử dụng trong file `resources/views/layouts/auth.blade.php` của ứng dụng:

```blade
<x-layouts::auth.split>
    {{ $slot }}
</x-layouts::auth.split>
```

<a name="authentication"></a>
## Xác thực

Tất cả starter kit đều sử dụng [Laravel Fortify](/fortify) để xử lý xác thực. Fortify cung cấp route, controller và logic cho đăng nhập, đăng ký, đặt lại mật khẩu, xác minh email và nhiều chức năng khác.

Fortify tự động đăng ký các route xác thực sau dựa trên những tính năng được bật trong file cấu hình `config/fortify.php` của ứng dụng:

<div class="overflow-auto">

| Route                              | Phương thức | Mô tả                         |
| ---------------------------------- | ------ | ----------------------------------- |
| `/login`                           | `GET`    | Hiển thị form đăng nhập                  |
| `/login`                           | `POST`   | Xác thực người dùng                   |
| `/logout`                          | `POST`   | Đăng xuất người dùng                        |
| `/register`                        | `GET`    | Hiển thị form đăng ký           |
| `/register`                        | `POST`   | Tạo người dùng mới                     |
| `/forgot-password`                 | `GET`    | Hiển thị form yêu cầu đặt lại mật khẩu |
| `/forgot-password`                 | `POST`   | Gửi liên kết đặt lại mật khẩu            |
| `/reset-password/{token}`          | `GET`    | Hiển thị form đặt lại mật khẩu         |
| `/reset-password`                  | `POST`   | Cập nhật mật khẩu                     |
| `/email/verify`                    | `GET`    | Hiển thị thông báo xác minh email   |
| `/email/verify/{id}/{hash}`        | `GET`    | Xác minh địa chỉ email                |
| `/email/verification-notification` | `POST`   | Gửi lại email xác minh           |
| `/user/confirm-password`           | `GET`    | Hiển thị form xác nhận mật khẩu  |
| `/user/confirm-password`           | `POST`   | Xác nhận mật khẩu                    |
| `/two-factor-challenge`            | `GET`    | Hiển thị form thử thách 2FA          |
| `/two-factor-challenge`            | `POST`   | Xác minh mã 2FA                     |

</div>

Bạn có thể dùng lệnh Artisan `php artisan route:list` để hiển thị toàn bộ route trong ứng dụng.

<a name="enabling-and-disabling-features"></a>
### Bật và tắt tính năng

Bạn có thể kiểm soát những tính năng Fortify nào được bật trong file cấu hình `config/fortify.php` của ứng dụng:

```php
use Laravel\Fortify\Features;

'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]),
],
```

Để tắt một tính năng, hãy comment hoặc xóa mục tương ứng khỏi mảng `features`. Ví dụ, xóa `Features::registration()` để tắt đăng ký công khai.

Khi sử dụng starter kit [React](#react), [Svelte](#svelte) hoặc [Vue](#vue), bạn cũng cần xóa mọi tham chiếu trong mã frontend tới các route của tính năng đã tắt. Ví dụ, nếu tắt xác minh email, bạn nên xóa các import và tham chiếu tới route `verification` trong component React, Svelte hoặc Vue. Điều này là cần thiết vì các starter kit này sử dụng Wayfinder cho type-safe routing; Wayfinder tạo định nghĩa route tại thời điểm build. Nếu mã frontend tham chiếu tới route không còn tồn tại, quá trình build ứng dụng sẽ thất bại.

<a name="customizing-actions"></a>
### Tùy chỉnh việc tạo người dùng và đặt lại mật khẩu

Khi người dùng đăng ký hoặc đặt lại mật khẩu, Fortify gọi các action class nằm trong thư mục `app/Actions/Fortify` của ứng dụng:

<div class="overflow-auto">

| File                          | Mô tả                           |
| ----------------------------- | ------------------------------------- |
| `CreateNewUser.php`           | Validate và tạo người dùng mới       |
| `ResetUserPassword.php`       | Validate và cập nhật mật khẩu người dùng  |
| `PasswordValidationRules.php` | Định nghĩa các rule validation mật khẩu     |

</div>

Ví dụ, để tùy chỉnh logic đăng ký của ứng dụng, bạn nên sửa action `CreateNewUser`:

```php
public function create(array $input): User
{
    Validator::make($input, [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255', 'unique:users'],
        'phone' => ['required', 'string', 'max:20'], // [tl! add]
        'password' => $this->passwordRules(),
    ])->validate();

    return User::create([
        'name' => $input['name'],
        'email' => $input['email'],
        'phone' => $input['phone'], // [tl! add]
        'password' => Hash::make($input['password']),
    ]);
}
```

<a name="two-factor-authentication"></a>
### Xác thực hai yếu tố

Các starter kit tích hợp sẵn xác thực hai yếu tố (2FA), cho phép người dùng bảo vệ tài khoản bằng bất kỳ ứng dụng xác thực nào tương thích TOTP. 2FA được bật mặc định thông qua `Features::twoFactorAuthentication()` trong file cấu hình `config/fortify.php` của ứng dụng.

Tùy chọn `confirm` yêu cầu người dùng xác minh một mã trước khi 2FA được bật hoàn toàn, còn `confirmPassword` yêu cầu xác nhận mật khẩu trước khi bật hoặc tắt 2FA. Để biết thêm chi tiết, hãy xem [tài liệu xác thực hai yếu tố của Fortify](/fortify#two-factor-authentication).

<a name="rate-limiting"></a>
### Giới hạn tần suất

Rate limiting giúp ngăn brute-force và các lần đăng nhập lặp lại làm quá tải endpoint xác thực. Bạn có thể tùy chỉnh hành vi rate limiting của Fortify trong `FortifyServiceProvider` của ứng dụng:

```php
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;

RateLimiter::for('login', function ($request) {
    return Limit::perMinute(5)->by($request->email.$request->ip());
});
```

<a name="teams"></a>
## Team

Các starter kit React, Svelte, Vue và Livewire cũng có thể được tạo với hỗ trợ team. Khi tính năng team được bật, mỗi người dùng thuộc một hoặc nhiều team và có một team hiện tại. Khi đăng ký, người dùng mới tự động được tạo một personal team. Starter kit cũng cung cấp các màn hình quản lý team để tạo team, chuyển đổi team, mời thành viên và cập nhật thông tin team.

Khi một route được giới hạn theo team hiện tại, slug của team hiện tại sẽ được đưa vào URL. Ví dụ, route dashboard trở thành `/{current_team}/dashboard`, còn các trang quản lý team sử dụng route như `settings/teams/{team}`. Khi dùng các route parameter `{current_team}` và `{team}`, starter kit tự động đảm bảo người dùng đã xác thực thuộc team được yêu cầu trước khi cho phép truy cập route.

Để việc tạo URL theo team thuận tiện hơn, starter kit đăng ký URL default cho team hiện tại của người dùng đã xác thực. Nhờ đó, khi gọi helper như `route('dashboard')`, slug của team hiện tại sẽ tự động được thêm vào. Khi người dùng đăng nhập, đăng ký hoặc chuyển team, starter kit cập nhật team hiện tại và làm mới các URL default này để những link được tạo tiếp tục sử dụng đúng ngữ cảnh team.

Khi tạo hoặc đổi tên team, starter kit cũng ngăn người dùng chọn các tên dành riêng có thể tạo ra route segment không an toàn hoặc xung đột. Ví dụ, không thể sử dụng những tên xung đột với route prefix như `settings`, `login` hoặc `dashboard`.

<a name="workos"></a>
## Xác thực bằng WorkOS AuthKit

Theo mặc định, các starter kit React, Svelte, Vue và Livewire đều sử dụng hệ thống xác thực tích hợp của Laravel để cung cấp đăng nhập, đăng ký, đặt lại mật khẩu, xác minh email và nhiều chức năng khác. Ngoài ra, mỗi starter kit còn có một biến thể sử dụng [WorkOS AuthKit](https://authkit.com), cung cấp:

<div class="content-list" markdown="1">

- Xác thực qua mạng xã hội (Google, Microsoft, GitHub và Apple)
- Xác thực bằng passkey
- "Magic Auth" dựa trên email
- SSO

</div>

Việc sử dụng WorkOS làm nhà cung cấp xác thực [yêu cầu tài khoản WorkOS](https://workos.com). WorkOS cung cấp xác thực miễn phí cho các ứng dụng có tối đa 1 triệu người dùng hoạt động hàng tháng.

Để sử dụng WorkOS AuthKit làm nhà cung cấp xác thực cho ứng dụng, hãy chọn tùy chọn WorkOS khi tạo ứng dụng mới bằng starter kit thông qua `laravel new`.

<a name="configuring-your-workos-starter-kit"></a>
### Cấu hình WorkOS Starter Kit

Sau khi tạo ứng dụng mới bằng starter kit sử dụng WorkOS, bạn nên thiết lập các biến môi trường `WORKOS_CLIENT_ID`, `WORKOS_API_KEY` và `WORKOS_REDIRECT_URL` trong file `.env` của ứng dụng. Các biến này phải khớp với giá trị được cung cấp trong WorkOS dashboard của ứng dụng:

```ini
WORKOS_CLIENT_ID=your-client-id
WORKOS_API_KEY=your-api-key
WORKOS_REDIRECT_URL="${APP_URL}/authenticate"
```

Ngoài ra, bạn nên cấu hình URL trang chủ của ứng dụng trong WorkOS dashboard. Người dùng sẽ được chuyển hướng tới URL này sau khi đăng xuất khỏi ứng dụng.

<a name="configuring-authkit-authentication-methods"></a>
#### Cấu hình phương thức xác thực AuthKit

Khi sử dụng starter kit dựa trên WorkOS, Laravel khuyến nghị tắt xác thực "Email + Password" trong phần cấu hình WorkOS AuthKit của ứng dụng, để người dùng chỉ xác thực thông qua nhà cung cấp social authentication, passkey, "Magic Auth" và SSO. Nhờ đó, ứng dụng có thể hoàn toàn không phải xử lý mật khẩu của người dùng.

<a name="configuring-authkit-session-timeouts"></a>
#### Cấu hình thời gian hết hạn session của AuthKit

Ngoài ra, Laravel khuyến nghị cấu hình thời gian hết hạn do không hoạt động của session WorkOS AuthKit khớp với ngưỡng timeout session đã cấu hình trong ứng dụng Laravel, thường là hai giờ.

<a name="inertia-ssr"></a>
### Inertia SSR

Các starter kit React, Svelte và Vue tương thích với khả năng [server-side rendering](https://inertiajs.com/server-side-rendering) của Inertia. Để build bundle tương thích Inertia SSR cho ứng dụng, hãy chạy lệnh `build:ssr`:

```shell
npm run build:ssr
```

Để thuận tiện, lệnh `composer dev:ssr` cũng được cung cấp. Sau khi build bundle tương thích SSR cho ứng dụng, lệnh này sẽ khởi động Laravel development server và Inertia SSR server, cho phép bạn kiểm thử ứng dụng cục bộ bằng server-side rendering engine của Inertia:

```shell
composer dev:ssr
```

<a name="community-maintained-starter-kits"></a>
### Starter Kit do cộng đồng duy trì

Khi tạo ứng dụng Laravel mới bằng Laravel installer, bạn có thể truyền bất kỳ starter kit nào do cộng đồng duy trì và có trên Packagist vào option `--using`:

```shell
laravel new my-app --using=example/starter-kit
```

<a name="creating-starter-kits"></a>
#### Tạo Starter Kit

Để starter kit của bạn có thể được người khác sử dụng, bạn cần publish nó lên [Packagist](https://packagist.org). Starter kit nên khai báo các biến môi trường bắt buộc trong file `.env.example`, và mọi lệnh cần chạy sau khi cài đặt nên được liệt kê trong mảng `post-create-project-cmd` của file `composer.json`.

<a name="faqs"></a>
### Câu hỏi thường gặp

<a name="faq-upgrade"></a>
#### Làm thế nào để nâng cấp?

Mỗi starter kit cung cấp một nền tảng vững chắc để bắt đầu ứng dụng tiếp theo. Vì bạn sở hữu toàn bộ mã nguồn, bạn có thể điều chỉnh, tùy chỉnh và phát triển ứng dụng chính xác theo nhu cầu. Tuy nhiên, bạn không cần cập nhật bản thân starter kit.

<a name="faq-enable-email-verification"></a>
#### Làm thế nào để bật xác minh email?

Bạn có thể bật xác minh email bằng cách bỏ comment phần import `MustVerifyEmail` trong model `App/Models/User.php` và đảm bảo model implement interface `MustVerifyEmail`:

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
// ...

class User extends Authenticatable implements MustVerifyEmail
{
    // ...
}
```

Sau khi đăng ký, người dùng sẽ nhận được email xác minh. Để hạn chế quyền truy cập vào một số route cho đến khi địa chỉ email của người dùng được xác minh, hãy thêm middleware `verified` vào các route:

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});
```

> [!NOTE]
> Không cần xác minh email khi sử dụng biến thể [WorkOS](#workos) của starter kit.

<a name="faq-modify-email-template"></a>
#### Làm thế nào để sửa mẫu email mặc định?

Bạn có thể muốn tùy chỉnh mẫu email mặc định để phù hợp hơn với thương hiệu của ứng dụng. Để sửa mẫu này, hãy publish các email view vào ứng dụng bằng lệnh sau:

```shell
php artisan vendor:publish --tag=laravel-mail
```

Lệnh này sẽ tạo một số file trong `resources/views/vendor/mail`. Bạn có thể sửa bất kỳ file nào trong số đó, cũng như file `resources/views/vendor/mail/themes/default.css`, để thay đổi giao diện của mẫu email mặc định.
