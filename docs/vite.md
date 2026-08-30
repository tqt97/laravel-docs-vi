# Đóng gói Asset (Vite)

<a name="introduction"></a>
## Giới thiệu

[Vite](https://vitejs.dev) là công cụ build frontend hiện đại, cung cấp môi trường phát triển cực nhanh và đóng gói code để sử dụng trong production. Khi xây dựng ứng dụng Laravel, bạn thường dùng Vite để đóng gói các file CSS và JavaScript của ứng dụng thành asset sẵn sàng cho production.

Laravel tích hợp liền mạch với Vite thông qua plugin chính thức và Blade directive để nạp asset trong cả môi trường development lẫn production.

<a name="installation"></a>
## Cài đặt & Thiết lập

> [!NOTE]
> Phần tài liệu sau trình bày cách cài đặt và cấu hình Laravel Vite plugin theo cách thủ công. Tuy nhiên, các [starter kit](/docs/{{version}}/starter-kits) của Laravel đã bao gồm toàn bộ scaffolding này và là cách nhanh nhất để bắt đầu với Laravel và Vite.

<a name="installing-node"></a>
### Cài đặt Node

Bạn phải bảo đảm Node.js (16+) và NPM đã được cài đặt trước khi chạy Vite và Laravel plugin:

```shell
node -v
npm -v
```

Bạn có thể dễ dàng cài phiên bản Node và NPM mới nhất bằng bộ cài đồ họa từ [website Node chính thức](https://nodejs.org/en/download/). Hoặc nếu đang dùng [Laravel Sail](https://laravel.com/docs/{{version}}/sail), bạn có thể gọi Node và NPM thông qua Sail:

```shell
./vendor/bin/sail node -v
./vendor/bin/sail npm -v
```

<a name="installing-vite-and-laravel-plugin"></a>
### Cài đặt Vite và Laravel Plugin

Trong một bản cài Laravel mới, bạn sẽ thấy file `package.json` ở thư mục gốc của ứng dụng. File `package.json` mặc định đã chứa mọi thứ cần thiết để bắt đầu sử dụng Vite và Laravel plugin. Bạn có thể cài các dependency frontend của ứng dụng thông qua NPM:

```shell
npm install
```

<a name="configuring-vite"></a>
### Cấu hình Vite

Vite được cấu hình thông qua file `vite.config.js` ở thư mục gốc của project. Bạn có thể tùy chỉnh file này theo nhu cầu và cài thêm bất kỳ plugin nào ứng dụng cần, chẳng hạn `@vitejs/plugin-react`, `@sveltejs/vite-plugin-svelte` hoặc `@vitejs/plugin-vue`.

Laravel Vite plugin yêu cầu bạn chỉ định các entry point của ứng dụng. Chúng có thể là file JavaScript hoặc CSS, bao gồm cả các ngôn ngữ cần tiền xử lý như TypeScript, JSX, TSX và Sass.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css',
            'resources/js/app.js',
        ]),
    ],
});
```

Nếu đang xây dựng SPA, bao gồm ứng dụng sử dụng Inertia, Vite hoạt động tốt nhất khi không dùng CSS làm entry point:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel([
            'resources/css/app.css', // [tl! remove]
            'resources/js/app.js',
        ]),
    ],
});
```

Thay vào đó, bạn nên import CSS thông qua JavaScript. Thông thường việc này được thực hiện trong file `resources/js/app.js` của ứng dụng:

```js
import './bootstrap';
import '../css/app.css'; // [tl! add]
```

Laravel plugin cũng hỗ trợ nhiều entry point và các tùy chọn cấu hình nâng cao như [SSR entry point](#ssr).

<a name="working-with-a-secure-development-server"></a>
#### Làm việc với Development Server bảo mật

Nếu web server phát triển cục bộ phục vụ ứng dụng qua HTTPS, bạn có thể gặp vấn đề khi kết nối tới Vite development server.

Nếu dùng [Laravel Herd](https://herd.laravel.com) và đã bật HTTPS cho site, hoặc dùng [Laravel Valet](/docs/{{version}}/valet) và đã chạy [lệnh `secure`](/docs/{{version}}/valet#securing-sites) cho ứng dụng, Laravel Vite plugin sẽ tự động phát hiện và sử dụng TLS certificate đã được tạo.

Nếu bạn bảo mật site bằng host không trùng với tên thư mục ứng dụng, có thể chỉ định host thủ công trong file `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            detectTls: 'my-app.test', // [tl! add]
        }),
    ],
});
```

Khi dùng web server khác, bạn nên tạo certificate đáng tin cậy và cấu hình Vite thủ công để sử dụng certificate đã tạo:

```js
// ...
import fs from 'fs'; // [tl! add]

const host = 'my-app.test'; // [tl! add]

export default defineConfig({
    // ...
    server: { // [tl! add]
        host, // [tl! add]
        hmr: { host }, // [tl! add]
        https: { // [tl! add]
            key: fs.readFileSync(`/path/to/${host}.key`), // [tl! add]
            cert: fs.readFileSync(`/path/to/${host}.crt`), // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

Nếu không thể tạo certificate đáng tin cậy cho hệ thống, bạn có thể cài và cấu hình [plugin @vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl). Khi dùng certificate không đáng tin cậy, bạn cần chấp nhận cảnh báo certificate của Vite development server trong trình duyệt bằng cách mở liên kết "Local" xuất hiện trong console khi chạy `npm run dev`.

<a name="configuring-hmr-in-sail-on-wsl2"></a>
#### Chạy Development Server trong Sail trên WSL2

Khi chạy Vite development server trong [Laravel Sail](/docs/{{version}}/sail) trên Windows Subsystem for Linux 2 (WSL2), bạn nên thêm cấu hình sau vào `vite.config.js` để bảo đảm trình duyệt có thể giao tiếp với development server:

```js
// ...

export default defineConfig({
    // ...
    server: { // [tl! add:start]
        hmr: {
            host: 'localhost',
        },
    }, // [tl! add:end]
});
```

Nếu thay đổi file không được phản ánh trong trình duyệt khi development server đang chạy, bạn có thể cần cấu hình thêm [tùy chọn `server.watch.usePolling`](https://vitejs.dev/config/server-options.html#server-watch) của Vite.

<a name="loading-your-scripts-and-styles"></a>
### Nạp Script và Style

Sau khi cấu hình các Vite entry point, bạn có thể tham chiếu chúng bằng Blade directive `@vite()` được thêm vào `<head>` của root template ứng dụng:

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

Nếu import CSS thông qua JavaScript, bạn chỉ cần thêm JavaScript entry point:

```blade
<!DOCTYPE html>
<head>
    {{-- ... --}}

    @vite('resources/js/app.js')
</head>
```

Directive `@vite` sẽ tự động phát hiện Vite development server và inject Vite client để bật Hot Module Replacement. Ở build mode, directive sẽ nạp các asset đã compile và version, bao gồm cả CSS được import.

Nếu cần, bạn cũng có thể chỉ định build path của asset đã compile khi gọi directive `@vite`:

```blade
<!doctype html>
<head>
    {{-- Given build path is relative to public path. --}}

    @vite('resources/js/app.js', 'vendor/courier/build')
</head>
```

<a name="inline-assets"></a>
#### Asset Inline

Đôi khi bạn cần đưa trực tiếp nội dung thô của asset thay vì liên kết tới URL đã được version. Ví dụ, bạn có thể cần nhúng nội dung asset trực tiếp vào trang khi truyền HTML cho trình tạo PDF. Bạn có thể xuất nội dung Vite asset bằng phương thức `content` do facade `Vite` cung cấp:

```blade
@use('Illuminate\Support\Facades\Vite')

<!doctype html>
<head>
    {{-- ... --}}

    <style>
        {!! Vite::content('resources/css/app.css') !!}
    </style>
    <script>
        {!! Vite::content('resources/js/app.js') !!}
    </script>
</head>
```

<a name="running-vite"></a>
## Chạy Vite

Có hai cách chạy Vite. Bạn có thể chạy development server bằng lệnh `dev`, phù hợp khi phát triển cục bộ. Development server sẽ tự động phát hiện thay đổi trong file và phản ánh chúng ngay lập tức trên các cửa sổ trình duyệt đang mở.

Hoặc chạy lệnh `build` để version và đóng gói asset của ứng dụng, chuẩn bị chúng cho việc deploy lên production:

```shell
# Run the Vite development server...
npm run dev

# Build and version the assets for production...
npm run build
```

Nếu đang chạy development server trong [Sail](/docs/{{version}}/sail) trên WSL2, bạn có thể cần một số [cấu hình bổ sung](#configuring-hmr-in-sail-on-wsl2).

<a name="working-with-scripts"></a>
## Làm việc với JavaScript

<a name="aliases"></a>
### Alias trong Blade

Mặc định, Laravel plugin cung cấp một alias phổ biến để bạn có thể bắt đầu nhanh và import asset của ứng dụng thuận tiện hơn:

```js
{
    '@' => '/resources/js'
}
```

Bạn có thể ghi đè alias `'@'` bằng cách thêm alias riêng vào file cấu hình `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel(['resources/ts/app.tsx']),
    ],
    resolve: {
        alias: {
            '@': '/resources/ts',
        },
    },
});
```

<a name="vue"></a>
### Vue

Nếu muốn xây dựng frontend bằng framework [Vue](https://vuejs.org/), bạn cũng cần cài plugin `@vitejs/plugin-vue`:

```shell
npm install --save-dev @vitejs/plugin-vue
```

Sau đó, bạn có thể thêm plugin vào file cấu hình `vite.config.js`. Khi sử dụng Vue plugin với Laravel, bạn sẽ cần thêm một số tùy chọn:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.js']),
        vue({
            template: {
                transformAssetUrls: {
                    // The Vue plugin will re-write asset URLs, when referenced
                    // in Single File Components, to point to the Laravel web
                    // server. Setting this to `null` allows the Laravel plugin
                    // to instead re-write asset URLs to point to the Vite
                    // server instead.
                    base: null,

                    // The Vue plugin will parse absolute URLs and treat them
                    // as absolute paths to files on disk. Setting this to
                    // `false` will leave absolute URLs un-touched so they can
                    // reference assets in the public directory as expected.
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
```

> [!NOTE]
> [Starter kit](/docs/{{version}}/starter-kits) của Laravel đã bao gồm cấu hình Laravel, Vue và Vite phù hợp. Đây là cách nhanh nhất để bắt đầu với Laravel, Vue và Vite.

<a name="react"></a>
### React

Nếu muốn xây dựng frontend bằng framework [React](https://reactjs.org/), bạn cũng cần cài plugin `@vitejs/plugin-react`:

```shell
npm install --save-dev @vitejs/plugin-react
```

Sau đó, bạn có thể thêm plugin vào file cấu hình `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel(['resources/js/app.jsx']),
        react(),
    ],
});
```

Bạn cần đảm bảo mọi file chứa JSX đều có phần mở rộng `.jsx` hoặc `.tsx`; đồng thời cập nhật entry point nếu cần, như [đã trình bày ở trên](#configuring-vite).

Bạn cũng cần thêm Blade directive `@viteReactRefresh` bên cạnh directive `@vite` hiện có.

```blade
@viteReactRefresh
@vite('resources/js/app.jsx')
```

Directive `@viteReactRefresh` phải được gọi trước directive `@vite`.

> [!NOTE]
> Các [starter kit](/docs/{{version}}/starter-kits) của Laravel đã bao gồm cấu hình phù hợp cho Laravel, React và Vite. Đây là cách nhanh nhất để bắt đầu với Laravel, React và Vite.

<a name="svelte"></a>
### Svelte

Nếu muốn xây dựng frontend bằng framework [Svelte](https://svelte.dev/), bạn cũng cần cài plugin `@sveltejs/vite-plugin-svelte`:

```shell
npm install --save-dev @sveltejs/vite-plugin-svelte
```

Sau đó, bạn có thể thêm plugin vào file cấu hình `vite.config.js`.

```js
import { svelte } from '@sveltejs/vite-plugin-svelte';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.ts'],
      ssr: 'resources/js/ssr.ts',
      refresh: true,
    }),
    svelte(),
  ],
});
```

> [!NOTE]
> Các [starter kit](/docs/{{version}}/starter-kits) của Laravel đã bao gồm cấu hình phù hợp cho Laravel, Svelte và Vite. Đây là cách nhanh nhất để bắt đầu với Laravel, Svelte và Vite.

<a name="inertia"></a>
### Inertia

Laravel Vite plugin cung cấp hàm `resolvePageComponent` tiện dụng để giúp resolve các page component của Inertia. Ví dụ dưới đây sử dụng helper này với Vue 3; tuy nhiên, bạn cũng có thể dùng hàm này với các framework khác như React hoặc Svelte:

```js
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
  resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
});
```

Nếu đang sử dụng tính năng code splitting của Vite với Inertia, bạn nên cấu hình [prefetch asset](#asset-prefetching).

> [!NOTE]
> Các [starter kit](/docs/{{version}}/starter-kits) của Laravel đã bao gồm cấu hình phù hợp cho Laravel, Inertia và Vite. Đây là cách nhanh nhất để bắt đầu với Laravel, Inertia và Vite.

<a name="url-processing"></a>
### Xử lý URL

Khi dùng Vite và tham chiếu asset trong HTML, CSS hoặc JS của ứng dụng, có một vài điểm cần lưu ý. Trước hết, nếu tham chiếu asset bằng absolute path, Vite sẽ không đưa asset đó vào build; vì vậy bạn cần bảo đảm asset tồn tại trong public directory. Bạn nên tránh dùng absolute path khi sử dụng [CSS entrypoint riêng](#configuring-vite), vì trong lúc development browser sẽ cố tải các path này từ Vite development server — nơi CSS được host — thay vì từ public directory của ứng dụng.

Khi tham chiếu asset bằng đường dẫn tương đối, hãy nhớ rằng đường dẫn được tính tương đối từ file chứa tham chiếu đó. Mọi asset được tham chiếu bằng đường dẫn tương đối sẽ được Vite viết lại, gắn phiên bản và bundle.

Hãy xem cấu trúc project sau:

```text
public/
  taylor.png
resources/
  js/
    Pages/
      Welcome.vue
  images/
    abigail.png
```

Ví dụ sau minh họa cách Vite xử lý URL tương đối và tuyệt đối:

```html
<!-- This asset is not handled by Vite and will not be included in the build -->
<img src="/taylor.png">

<!-- This asset will be re-written, versioned, and bundled by Vite -->
<img src="../../images/abigail.png">
```

<a name="working-with-stylesheets"></a>
## Làm việc với stylesheet

> [!NOTE]
> [Starter kit](/docs/{{version}}/starter-kits) của Laravel đã bao gồm cấu hình Tailwind và Vite phù hợp. Hoặc, nếu muốn dùng Tailwind với Laravel mà không dùng starter kit, hãy xem [hướng dẫn cài đặt Tailwind cho Laravel](https://tailwindcss.com/docs/guides/laravel).

Mọi ứng dụng Laravel đều đã bao gồm Tailwind và file `vite.config.js` được cấu hình phù hợp. Vì vậy, bạn chỉ cần khởi động Vite development server hoặc chạy lệnh Composer `dev`; lệnh này sẽ khởi động cả Laravel và Vite development server:

```shell
composer run dev
```

CSS của ứng dụng có thể được đặt trong file `resources/css/app.css`.

<a name="working-with-fonts"></a>
## Làm việc với font

Laravel Vite plugin có thể phục vụ các font self-hosted đã được tối ưu cho ứng dụng. Khi font được cấu hình, plugin sẽ resolve các file font được yêu cầu, xuất chúng thành Vite asset, sinh CSS cho font và ghi font manifest để Blade [`@fonts` directive](/docs/{{version}}/blade#fonts) sử dụng.

Để cấu hình font, hãy import một hoặc nhiều provider helper từ `laravel-vite-plugin/fonts` và thêm chúng vào option `fonts` của Laravel plugin:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { google } from 'laravel-vite-plugin/fonts';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            fonts: [
                google('Inter', {
                    alias: 'sans',
                    weights: [400, 500, 600, 700],
                    styles: ['normal', 'italic'],
                    subsets: ['latin'],
                    display: 'swap',
                    preload: [
                        { weight: 400 },
                        { weight: 700 },
                    ],
                    fallbacks: ['system-ui', 'sans-serif'],
                }),
            ],
        }),
    ],
});
```

Trong ví dụ này, font `Inter` sẽ khả dụng thông qua alias `sans`. Plugin sẽ tạo CSS variable `--font-sans` và utility class `.font-sans` áp dụng font stack đã sinh.

<a name="font-providers"></a>
### Font provider

Laravel Vite plugin cung cấp các provider helper cho Google Fonts, Bunny Fonts, Fontsource và font local:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny, fontsource, google, local } from 'laravel-vite-plugin/fonts';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            fonts: [
                google('Inter', { alias: 'sans' }),
                bunny('Figtree', { alias: 'body' }),
                fontsource('JetBrains Mono', { alias: 'mono' }),
                local('Brand Sans', {
                    alias: 'brand',
                    src: 'resources/fonts/brand-sans',
                }),
            ],
        }),
    ],
});
```

Provider `fontsource` đọc font từ Fontsource package đã cài đặt. Mặc định, package name được suy ra từ font family, chẳng hạn `@fontsource/jetbrains-mono`. Nếu ứng dụng dùng package name khác, bạn có thể chỉ định bằng option `package`.

<a name="local-fonts"></a>
### Font local

Khi dùng local font, option `src` có thể trỏ tới một font file, một directory hoặc một glob pattern. Plugin sẽ tự tìm các font file được hỗ trợ và suy luận weight, style từ filename của chúng:

```js
local('Brand Sans', {
    alias: 'brand',
    src: 'resources/fonts/brand-sans/*.woff2',
})
```

Nếu cần kiểm soát đầy đủ các variant khả dụng, bạn có thể khai báo chúng rõ ràng bằng option `variants`:

```js
local('Brand Sans', {
    alias: 'brand',
    variants: [
        { src: 'resources/fonts/BrandSans-Regular.woff2', weight: 400 },
        { src: 'resources/fonts/BrandSans-Italic.woff2', weight: 400, style: 'italic' },
        { src: ['resources/fonts/BrandSans-Bold.woff2', 'resources/fonts/BrandSans-Bold.ttf'], weight: 700 },
    ],
})
```

<a name="font-options"></a>
### Tùy chọn font

Tùy provider, định nghĩa font có thể chấp nhận nhiều option để bạn tùy biến CSS font được tạo:

<div class="content-list" markdown="1">

- `alias` định nghĩa tên được dùng bởi directive `@fonts` của Blade và mặc định là slug của font family.
- `variable` định nghĩa CSS variable được sinh và mặc định là `--font-{alias}`.
- `weights` định nghĩa các font weight của remote hoặc Fontsource cần resolve và mặc định là `[400]`.
- `styles` định nghĩa các font style của remote hoặc Fontsource cần resolve và mặc định là `['normal']`.
- `subsets` định nghĩa các font subset của remote hoặc Fontsource cần resolve và mặc định là `['latin']`.
- `display` định nghĩa value `font-display` và mặc định là `swap`.
- `preload` kiểm soát WOFF2 font variant nào được preload. Option này có thể là `true`, `false` hoặc một array selector `{ weight, style }`.
- `fallbacks` định nghĩa các fallback font bổ sung được append vào font stack đã sinh.
- `optimizedFallbacks` cố gắng tạo fallback font face đã điều chỉnh metric bằng package tùy chọn `fontaine` và mặc định là `true`.

</div>

Optimized fallback cần package `fontaine`, package này không được cài mặc định. Nếu muốn Laravel tạo fallback font face đã điều chỉnh metric, bạn nên cài `fontaine` làm development dependency:

```shell
npm install --save-dev fontaine
```

Nếu `fontaine` chưa được cài hoặc không đọc được font file, Laravel sẽ bỏ qua optimized fallback cho font đó và tiếp tục dùng các font được cấu hình qua option `fallbacks`.

Local font được resolve từ option `src` hoặc `variants` đã mô tả ở trên thay vì dùng `weights`, `styles` và `subsets`.

<a name="working-with-blade-and-routes"></a>
## Làm việc với Blade và route

<a name="blade-processing-static-assets"></a>
### Xử lý static asset bằng Vite

Khi tham chiếu asset trong JavaScript hoặc CSS, Vite tự động xử lý và version hóa chúng. Ngoài ra, khi xây dựng ứng dụng dùng Blade, Vite cũng có thể xử lý và version hóa các static asset chỉ được tham chiếu trong Blade template.

Để làm được điều đó, bạn cần cho Vite biết các asset của mình bằng cách khai báo chúng trong option `assets` của plugin. Option này dành cho static file mà bạn muốn tham chiếu trực tiếp bằng `Vite::asset`. Nếu muốn Laravel tạo font CSS và preload link, hãy dùng [option `fonts`](#working-with-fonts) thay thế.

Ví dụ, nếu muốn xử lý và version hóa toàn bộ image trong `resources/images` và toàn bộ font trong `resources/fonts`, hãy thêm cấu hình sau vào Vite configuration:

```js
laravel({
    input: 'resources/js/app.js',
    assets: ['resources/images/**', 'resources/fonts/**'],
})
```

Các asset này giờ sẽ được Vite xử lý khi chạy `npm run build`. Sau đó, bạn có thể tham chiếu chúng trong Blade template bằng method `Vite::asset`, method này trả về URL đã version hóa của asset tương ứng:

```blade
<img src="{{ Vite::asset('resources/images/logo.png') }}">
```

> [!NOTE]
> Trước version 3 của Laravel Vite plugin, static asset phải được import trong entry point của ứng dụng bằng `import.meta.glob`. Option `assets` được giới thiệu do các thay đổi trong Vite 8.

<a name="blade-refreshing-on-save"></a>
### Refresh khi lưu

Khi ứng dụng được xây theo kiểu server-side rendering truyền thống bằng Blade, Vite có thể cải thiện development workflow bằng cách tự động refresh browser khi bạn thay đổi view file. Để bắt đầu, chỉ cần đặt option `refresh` thành `true`.

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: true,
        }),
    ],
});
```

Khi option `refresh` là `true`, việc lưu file trong các directory sau sẽ kích hoạt browser full-page refresh trong lúc bạn đang chạy `npm run dev`:

- `app/Livewire/**`
- `app/View/Components/**`
- `lang/**`
- `resources/lang/**`
- `resources/views/**`
- `routes/**`

Theo dõi thư mục `routes/**` sẽ hữu ích nếu bạn đang sử dụng [Ziggy](https://github.com/tighten/ziggy) để tạo các liên kết route trong frontend của ứng dụng.

Nếu các đường dẫn mặc định này không phù hợp với nhu cầu, bạn có thể tự chỉ định danh sách đường dẫn cần theo dõi:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: ['resources/views/**'],
        }),
    ],
});
```

Bên dưới, Laravel Vite plugin sử dụng package [vite-plugin-full-reload](https://github.com/ElMassimo/vite-plugin-full-reload), cung cấp một số tùy chọn cấu hình nâng cao để tinh chỉnh hành vi của tính năng này. Nếu cần mức tùy biến đó, bạn có thể cung cấp cấu hình `config`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            refresh: [{
                paths: ['path/to/watch/**'],
                config: { delay: 300 }
            }],
        }),
    ],
});
```

<a name="blade-aliases"></a>
### Alias trong Blade

Trong các ứng dụng JavaScript, việc [tạo alias](#aliases) cho những thư mục thường xuyên được tham chiếu là khá phổ biến. Tuy nhiên, bạn cũng có thể tạo alias để sử dụng trong Blade bằng phương thức `macro` của class `Illuminate\Support\Facades\Vite`. Thông thường, các "macro" nên được định nghĩa trong phương thức `boot` của một [service provider](/docs/{{version}}/providers):

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::macro('image', fn (string $asset) => $this->asset("resources/images/{$asset}"));
}
```

Sau khi macro được định nghĩa, bạn có thể gọi nó trong template. Ví dụ, có thể sử dụng macro `image` ở trên để tham chiếu đến asset tại `resources/images/logo.png`:

```blade
<img src="{{ Vite::image('logo.png') }}" alt="Laravel Logo">
```

<a name="asset-prefetching"></a>
## Prefetch asset

Khi xây dựng SPA bằng tính năng code splitting của Vite, các asset cần thiết sẽ được tải mỗi khi chuyển trang. Hành vi này có thể khiến việc render UI bị trễ. Nếu đây là vấn đề với frontend framework bạn sử dụng, Laravel cho phép prefetch sớm các asset JavaScript và CSS của ứng dụng ngay trong lần tải trang đầu tiên.

Bạn có thể yêu cầu Laravel prefetch sớm các asset bằng cách gọi phương thức `Vite::prefetch` trong phương thức `boot` của một [service provider](/docs/{{version}}/providers):

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
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
        Vite::prefetch(concurrency: 3);
    }
}
```

Trong ví dụ trên, các asset sẽ được prefetch với tối đa `3` lượt tải đồng thời trong mỗi lần tải trang. Bạn có thể điều chỉnh mức concurrency cho phù hợp với ứng dụng, hoặc không đặt giới hạn nếu muốn tải tất cả asset cùng lúc:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::prefetch();
}
```

Mặc định, quá trình prefetch bắt đầu khi [sự kiện _load_ của trang](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event) được kích hoạt. Nếu muốn tùy chỉnh thời điểm bắt đầu prefetch, bạn có thể chỉ định một event để Vite lắng nghe:

```php
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Vite::prefetch(event: 'vite:prefetch');
}
```

Với đoạn code trên, prefetch sẽ bắt đầu khi bạn chủ động dispatch event `vite:prefetch` trên object `window`. Ví dụ, bạn có thể bắt đầu prefetch sau ba giây kể từ khi trang tải xong:

```html
<script>
    addEventListener('load', () => setTimeout(() => {
        dispatchEvent(new Event('vite:prefetch'))
    }, 3000))
</script>
```

<a name="custom-base-urls"></a>
## URL gốc tùy chỉnh

Nếu các asset được Vite biên dịch được triển khai trên một domain khác với ứng dụng, chẳng hạn thông qua CDN, bạn phải khai báo biến môi trường `ASSET_URL` trong file `.env` của ứng dụng:

```env
ASSET_URL=https://cdn.example.com
```

Sau khi cấu hình asset URL, mọi URL asset được viết lại sẽ được thêm giá trị đã cấu hình vào phía trước:

```text
https://cdn.example.com/build/assets/app.9dce8d17.js
```

Lưu ý rằng [URL tuyệt đối không được Vite viết lại](#url-processing), vì vậy chúng sẽ không được thêm prefix này.

<a name="environment-variables"></a>
## Biến môi trường

Bạn có thể inject biến môi trường vào JavaScript bằng cách thêm prefix `VITE_` cho chúng trong file `.env` của ứng dụng:

```env
VITE_SENTRY_DSN_PUBLIC=http://example.com
```

Bạn có thể truy cập các biến môi trường đã được inject thông qua object `import.meta.env`:

```js
import.meta.env.VITE_SENTRY_DSN_PUBLIC
```

<a name="disabling-vite-in-tests"></a>
## Tắt Vite trong test

Tích hợp Vite của Laravel sẽ cố resolve các asset trong khi chạy test, vì vậy bạn phải chạy Vite development server hoặc build các asset trước.

Nếu muốn mock Vite trong quá trình test, bạn có thể gọi phương thức `withoutVite`, khả dụng cho mọi test kế thừa class `TestCase` của Laravel:

```php tab=Pest
test('without vite example', function () {
    $this->withoutVite();

    // ...
});
```

```php tab=PHPUnit
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_without_vite_example(): void
    {
        $this->withoutVite();

        // ...
    }
}
```

Nếu muốn tắt Vite cho toàn bộ test, bạn có thể gọi phương thức `withoutVite` từ phương thức `setUp` của class `TestCase` cơ sở:

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void// [tl! add:start]
    {
        parent::setUp();

        $this->withoutVite();
    }// [tl! add:end]
}
```

<a name="ssr"></a>
## Server-Side Rendering (SSR)

Laravel Vite plugin giúp việc thiết lập server-side rendering với Vite trở nên đơn giản. Để bắt đầu, hãy tạo SSR entry point tại `resources/js/ssr.js` và chỉ định entry point này thông qua tùy chọn cấu hình truyền vào Laravel plugin:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            ssr: 'resources/js/ssr.js',
        }),
    ],
});
```

Để tránh quên build lại SSR entry point, Laravel khuyến nghị mở rộng script `build` trong `package.json` của ứng dụng để đồng thời tạo SSR build:

```json
"scripts": {
     "dev": "vite",
     "build": "vite build" // [tl! remove]
     "build": "vite build && vite build --ssr" // [tl! add]
}
```

Sau đó, để build và khởi động SSR server, bạn có thể chạy các lệnh sau:

```shell
npm run build
node bootstrap/ssr/ssr.js
```

Nếu đang sử dụng [SSR với Inertia](https://inertiajs.com/server-side-rendering), bạn có thể dùng lệnh Artisan `inertia:start-ssr` để khởi động SSR server:

```shell
php artisan inertia:start-ssr
```

> [!NOTE]
> Các [starter kit](/docs/{{version}}/starter-kits) của Laravel đã bao gồm cấu hình phù hợp cho Laravel, Inertia SSR và Vite. Đây là cách nhanh nhất để bắt đầu với Laravel, Inertia SSR và Vite.

<a name="script-and-style-attributes"></a>
## Thuộc tính của thẻ script và style

<a name="content-security-policy-csp-nonce"></a>
### Nonce cho Content Security Policy (CSP)

Nếu muốn thêm [thuộc tính nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) vào các thẻ script và style như một phần của [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), bạn có thể tạo hoặc chỉ định nonce bằng phương thức `useCspNonce` trong một [middleware](/docs/{{version}}/middleware) tùy chỉnh:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class AddContentSecurityPolicyHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Vite::useCspNonce();

        return $next($request)->withHeaders([
            'Content-Security-Policy' => "script-src 'nonce-".Vite::cspNonce()."'",
        ]);
    }
}
```

Sau khi gọi phương thức `useCspNonce`, Laravel sẽ tự động thêm thuộc tính `nonce` vào mọi thẻ script và style được tạo.

Nếu cần sử dụng nonce ở nơi khác, bao gồm [directive `@route` của Ziggy](https://github.com/tighten/ziggy#using-routes-with-a-content-security-policy) đi kèm [starter kit](/docs/{{version}}/starter-kits) của Laravel, bạn có thể lấy giá trị đó bằng phương thức `cspNonce`:

```blade
@routes(nonce: Vite::cspNonce())
```

Nếu đã có sẵn nonce và muốn Laravel sử dụng giá trị đó, bạn có thể truyền nonce vào phương thức `useCspNonce`:

```php
Vite::useCspNonce($nonce);
```

<a name="subresource-integrity-sri"></a>
### Subresource Integrity (SRI)

Nếu Vite manifest chứa hash `integrity` cho các asset, Laravel sẽ tự động thêm thuộc tính `integrity` vào các thẻ script và style được tạo để thực thi [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). Mặc định, Vite không đưa hash `integrity` vào manifest, nhưng bạn có thể bật tính năng này bằng cách cài NPM plugin [vite-plugin-manifest-sri](https://www.npmjs.com/package/vite-plugin-manifest-sri):

```shell
npm install --save-dev vite-plugin-manifest-sri
```

Sau đó, bạn có thể bật plugin này trong file `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import manifestSRI from 'vite-plugin-manifest-sri';// [tl! add]

export default defineConfig({
    plugins: [
        laravel({
            // ...
        }),
        manifestSRI(),// [tl! add]
    ],
});
```

Nếu cần, bạn cũng có thể tùy chỉnh key trong manifest dùng để lưu integrity hash:

```php
use Illuminate\Support\Facades\Vite;

Vite::useIntegrityKey('custom-integrity-key');
```

Nếu muốn tắt hoàn toàn cơ chế tự động phát hiện này, hãy truyền `false` vào phương thức `useIntegrityKey`:

```php
Vite::useIntegrityKey(false);
```

<a name="arbitrary-attributes"></a>
### Thuộc tính tùy ý

Nếu cần thêm các thuộc tính khác vào thẻ script và style, chẳng hạn thuộc tính [data-turbo-track](https://turbo.hotwired.dev/handbook/drive#reloading-when-assets-change), bạn có thể chỉ định chúng thông qua các phương thức `useScriptTagAttributes` và `useStyleTagAttributes`. Thông thường, các phương thức này nên được gọi từ một [service provider](/docs/{{version}}/providers):

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes([
    'data-turbo-track' => 'reload', // Specify a value for the attribute...
    'async' => true, // Specify an attribute without a value...
    'integrity' => false, // Exclude an attribute that would otherwise be included...
]);

Vite::useStyleTagAttributes([
    'data-turbo-track' => 'reload',
]);
```

Nếu cần thêm thuộc tính theo điều kiện, bạn có thể truyền một callback nhận source path của asset, URL, manifest chunk và toàn bộ manifest:

```php
use Illuminate\Support\Facades\Vite;

Vite::useScriptTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $src === 'resources/js/app.js' ? 'reload' : false,
]);

Vite::useStyleTagAttributes(fn (string $src, string $url, array|null $chunk, array|null $manifest) => [
    'data-turbo-track' => $chunk && $chunk['isEntry'] ? 'reload' : false,
]);
```

> [!WARNING]
> Các tham số `$chunk` và `$manifest` sẽ là `null` khi Vite development server đang chạy.

<a name="advanced-customization"></a>
## Tùy chỉnh nâng cao

Mặc định, Laravel Vite plugin sử dụng các convention hợp lý và phù hợp với phần lớn ứng dụng. Tuy nhiên, đôi khi bạn cần tùy chỉnh hành vi của Vite. Để hỗ trợ các tùy chọn nâng cao hơn, Laravel cung cấp các phương thức và tùy chọn sau có thể dùng thay cho Blade directive `@vite`:

```blade
<!doctype html>
<head>
    {{-- ... --}}

    {{
        Vite::useHotFile(storage_path('vite.hot')) // Customize the "hot" file...
            ->useBuildDirectory('bundle') // Customize the build directory...
            ->useManifestFilename('assets.json') // Customize the manifest filename...
            ->withEntryPoints(['resources/js/app.js']) // Specify the entry points...
            ->createAssetPathsUsing(function (string $path, ?bool $secure) { // Customize the backend path generation for built assets...
                return "https://cdn.example.com/{$path}";
            })
    }}
</head>
```

Sau đó, trong file `vite.config.js`, bạn cần chỉ định cấu hình tương ứng:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            hotFile: 'storage/vite.hot', // Customize the "hot" file...
            buildDirectory: 'bundle', // Customize the build directory...
            input: ['resources/js/app.js'], // Specify the entry points...
        }),
    ],
    build: {
      manifest: 'assets.json', // Customize the manifest filename...
    },
});
```

<a name="cors"></a>
### Cross-Origin Resource Sharing (CORS) của dev server

Nếu gặp lỗi Cross-Origin Resource Sharing (CORS) trên trình duyệt khi tải asset từ Vite dev server, bạn có thể cần cấp quyền cho origin tùy chỉnh truy cập dev server. Vite kết hợp với Laravel plugin cho phép các origin sau mà không cần cấu hình bổ sung:

- `::1`
- `127.0.0.1`
- `localhost`
- `*.test`
- `*.localhost`
- `APP_URL` in the project's `.env`

Cách đơn giản nhất để cho phép một origin tùy chỉnh là bảo đảm biến môi trường `APP_URL` của ứng dụng khớp với origin bạn đang truy cập trên trình duyệt. Ví dụ, nếu truy cập `https://my-app.laravel`, hãy cập nhật `.env` tương ứng:

```env
APP_URL=https://my-app.laravel
```

Nếu cần kiểm soát origin chi tiết hơn, chẳng hạn hỗ trợ nhiều origin, bạn nên sử dụng [cấu hình CORS server tích hợp đầy đủ và linh hoạt của Vite](https://vite.dev/config/server-options.html#server-cors). Ví dụ, có thể chỉ định nhiều origin trong tùy chọn `server.cors.origin` của file `vite.config.js`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
    ],
    server: {  // [tl! add]
        cors: {  // [tl! add]
            origin: [  // [tl! add]
                'https://backend.laravel',  // [tl! add]
                'http://admin.laravel:8566',  // [tl! add]
            ],  // [tl! add]
        },  // [tl! add]
    },  // [tl! add]
});
```

Bạn cũng có thể sử dụng biểu thức chính quy, hữu ích khi muốn cho phép mọi origin thuộc một top-level domain nhất định, chẳng hạn `*.laravel`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
    ],
    server: {  // [tl! add]
        cors: {  // [tl! add]
            origin: [ // [tl! add]
                // Supports: SCHEME://DOMAIN.laravel[:PORT] [tl! add]
                /^https?:\/\/.*\.laravel(:\d+)?$/, //[tl! add]
            ], // [tl! add]
        }, // [tl! add]
    }, // [tl! add]
});
```

<a name="correcting-dev-server-urls"></a>
### Hiệu chỉnh URL của dev server

Một số plugin trong hệ sinh thái Vite giả định rằng URL bắt đầu bằng dấu gạch chéo `/` luôn trỏ đến Vite dev server. Tuy nhiên, do cách Laravel tích hợp với Vite, giả định này không phải lúc nào cũng đúng.

Ví dụ, plugin `vite-imagetools` tạo URL như sau khi Vite đang phục vụ asset:

```html
<img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520">
```

Plugin `vite-imagetools` kỳ vọng URL đầu ra sẽ được Vite chặn lại để plugin xử lý mọi URL bắt đầu bằng `/@imagetools`. Nếu đang sử dụng plugin dựa trên hành vi này, bạn cần hiệu chỉnh URL thủ công. Việc đó có thể được thực hiện trong `vite.config.js` bằng tùy chọn `transformOnServe`.

Trong ví dụ này, URL của dev server sẽ được thêm vào trước mọi lần xuất hiện của `/@imagetools` trong code được tạo:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
    plugins: [
        laravel({
            // ...
            transformOnServe: (code, devServerUrl) => code.replaceAll('/@imagetools', devServerUrl+'/@imagetools'),
        }),
        imagetools(),
    ],
});
```

Khi Vite đang phục vụ asset, URL đầu ra lúc này sẽ trỏ đến Vite dev server:

```html
- <img src="/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! remove] -->
+ <img src="http://[::1]:5173/@imagetools/f0b2f404b13f052c604e632f2fb60381bf61a520"><!-- [tl! add] -->
```
