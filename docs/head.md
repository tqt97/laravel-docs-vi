# Laravel Head

- [Giới thiệu](#introduction)
- [Cài đặt](#installation)
- [Bắt đầu nhanh](#quickstart)
- [Thứ tự ưu tiên khi phân giải](#resolution-precedence)
- [Định nghĩa metadata](#defining-metadata)
    - [Giá trị mặc định](#defaults)
    - [Metadata của route](#route-metadata)
    - [Metadata tại runtime](#runtime-metadata)
    - [Trang lỗi](#error-pages)
- [Open Graph](#open-graph)
    - [X / Twitter Cards](#twitter-cards)
- [Theme Colors](#theme-colors)
- [Application Metadata and Icons](#app-metadata-and-icons)
- [Progressive Web Apps](#progressive-web-apps)
- [Hiệu năng và khả năng khám phá](#performance-and-discovery)
- [Custom tag](#custom-tags)
- [Schema](#schemas)
    - [Breadcrumb](#breadcrumbs)
    - [FAQ](#faqs)
    - [Schema tùy chỉnh](#custom-schemas)
- [Render](#rendering)
    - [Blade](#blade)
    - [Livewire](#livewire)
    - [Inertia](#inertia)

<a name="introduction"></a>
## Giới thiệu

[Laravel Head](https://github.com/laravel/head) cung cấp một fluent API để quản lý phần tử `<head>` của tài liệu trong ứng dụng, bao gồm title và meta tag, metadata Open Graph, canonical URL, chỉ thị robots, gợi ý hiệu năng và structured data. Laravel Head hoạt động với Blade, Livewire và Inertia.

<a name="installation"></a>
## Cài đặt

Bạn có thể cài đặt Laravel Head bằng trình quản lý package Composer:

```shell
composer require laravel/head
```

<a name="quickstart"></a>
## Bắt đầu nhanh

Đăng ký các giá trị mặc định dùng cho toàn site trong một service provider:

```php
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(fn (HeadBuilder $head) => $head
    ->title('Laravel', suffix: ' - Laravel')
    ->description('Build something great.'));
```

Thiết lập metadata riêng cho từng trang tại runtime:

```php
Head::title($post->title)
    ->description($post->description);
```

Render các tag đã được phân giải trong layout:

```blade
<head>
    @head
</head>
```

<a name="resolution-precedence"></a>
## Thứ tự ưu tiên khi phân giải

Metadata của trang được phân giải từ năm lớp, được liệt kê theo thứ tự ưu tiên từ thấp đến cao:

1. Giá trị mặc định của trang
2. Metadata của route group
3. Metadata của route
4. Metadata tại runtime
5. Metadata lỗi

Các lớp có mức ưu tiên cao hơn sẽ thay thế các lớp thấp hơn theo từng field. Ví dụ, title tại runtime sẽ thay thế title của route nhưng không thay thế description của route. Các phần tiếp theo mô tả cách thiết lập metadata ở từng lớp. Để biết cách render metadata đã được phân giải trong Blade, Livewire và Inertia, xem [Rendering](#rendering).

<a name="defining-metadata"></a>
## Định nghĩa metadata

Laravel Head cho phép bạn định nghĩa metadata bằng các giá trị mặc định dùng cho toàn site, metadata của route, các lời gọi tại runtime và định nghĩa cho trang lỗi.

<a name="defaults"></a>
### Giá trị mặc định

Đăng ký các giá trị mặc định của trang trong một service provider:

```php
use Laravel\Head\Enums\OgType;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(function (HeadBuilder $head) {
    $head
        ->title('Laravel', suffix: ' - Laravel')
        ->description('Build something great.')
        ->canonical()
        ->og(siteName: 'Laravel', type: OgType::Website)
        ->searchableByRobots()
        ->preconnect('https://fonts.example.com');
});
```

Các giá trị mặc định là lớp metadata của trang có mức ưu tiên thấp nhất. Nếu metadata của route, runtime hoặc lỗi không thiết lập title, `Laravel` sẽ được render nguyên trạng. Khi một lớp cao hơn thiết lập title của trang, suffix được kế thừa sẽ được áp dụng, vì vậy `Head::title('About')` sẽ render thành `About - Laravel`. Truyền `exact: true` cho những title cần bỏ qua prefix hoặc suffix được kế thừa.

Gọi `Head::canonical()` sẽ render canonical URL dựa trên URL của request hiện tại. Để thiết lập URL cụ thể, hãy truyền một chuỗi như `Head::canonical('/about')`. Theo mặc định, canonical URL được chuẩn hóa sang `https`; truyền `forceHttps: false` để giữ nguyên scheme của request.

Chỉ thị robots có thể được truyền dưới dạng chuỗi thô, các case của enum `RobotsRule`, hoặc một danh sách kết hợp cả hai dạng. Danh sách được render thành các chỉ thị phân tách bằng dấu phẩy, vì vậy `Head::robots([RobotsRule::NoIndex, RobotsRule::NoFollow])` sẽ render `noindex, nofollow`.

Để thuận tiện, method `searchableByRobots` render `all`, trong khi method `hiddenFromRobots` render `none`.

<a name="route-metadata"></a>
### Metadata của route

Bạn có thể định nghĩa metadata trực tiếp trên route, đặc biệt hữu ích với các trang bán tĩnh có metadata đã biết trước.

<a name="routes-and-groups"></a>
#### Route và group

```php
Route::view('/contact', 'contact')
    ->name('contact')
    ->withHead(
        title: 'Contact Us',
        description: 'Get in touch.',
    );
```

Metadata dùng chung cho các route có thể được áp dụng cho một group tại bất kỳ vị trí nào trong chuỗi gọi:

```php
Route::withHead(robots: 'noindex, nofollow')
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', DashboardController::class)
            ->name('dashboard')
            ->withHead(title: 'Dashboard');
    });
```

Bạn cũng có thể định nghĩa metadata cho resource route và singleton route:

```php
Route::resource('posts', PostController::class)->withHead(
    robots: 'index, follow',
);

Route::singleton('profile', ProfileController::class)->withHead(
    title: 'Your Profile',
);
```

Method `withHead` lưu các array thuần thông qua route metadata API native của Laravel. Cách này tương đương với việc gọi method `metadata` với các attribute được lồng dưới key `head`, nhờ đó metadata vẫn tương thích với route cache.

Các named argument được chủ đích giới hạn ở những route property tích hợp sẵn của Laravel Head để editor và static analysis có thể phát hiện tên bị viết sai. Các route attribute được đăng ký bởi custom tag builder có thể được truyền qua `extensions`:

```php
Route::get('/article', ArticleController::class)->withHead(
    title: 'Article',
    extensions: ['readingTime' => 4],
);
```

<a name="supported-properties"></a>
#### Các property được hỗ trợ

Các route property được hỗ trợ ánh xạ tới cùng tên với các method của fluent builder:

| Danh mục | Property |
| --- | --- |
| Tài liệu | `title`, `description`, `canonical`, `robots` |
| Metadata ứng dụng | `themeColor`, `applicationName`, `colorScheme`, `referrer`, `viewport`, `appleWebAppTitle`, `webAppCapable`, `appleWebAppStatusBarStyle` |
| Mạng xã hội | `og`, `ogImage`, `ogVideo`, `ogAudio`, `twitter`, `twitterImage` |
| Hiệu năng | `preload`, `prefetch`, `preconnect`, `dnsPrefetch` |
| Khám phá | `alternates`, `feed`, `icon`, `favicon`, `appleTouchIcon`, `appleTouchStartupImage`, `maskIcon`, `manifest` |
| Structured data | `schema` |
| Custom tag | `meta`, `link` |

Tên các option lồng nhau sử dụng cùng quy ước `camelCase` như fluent API, chẳng hạn `forceHttps`, `siteName` và `secureUrl`.

Các property có thể lặp lại như `ogImage`, `preload`, `feed`, `schema`, `icon` và `appleTouchStartupImage` chấp nhận một giá trị đơn hoặc một danh sách.

<a name="runtime-metadata"></a>
### Metadata tại runtime

Khi một giá trị chỉ được biết sau khi request đến, chẳng hạn title của bài viết đang được xem, bạn có thể thiết lập giá trị đó tại runtime:

```php
use Laravel\Head\Facades\Head;

public function __invoke(Post $post): Response
{
    Head::title($post->title);

    // ...
}
```

Các lời gọi runtime thông qua facade `Head` sẽ ghi đè metadata của route đối với dữ liệu phụ thuộc vào request. Controller và action là những nơi phổ biến nhất để thực hiện các lời gọi này:

```php
use App\Models\Post;
use Laravel\Head\Facades\Head;

public function show(Post $post)
{
    Head::title($post->title)
        ->description($post->description);

    return view('posts.show', ['post' => $post]);
}
```

Nhiều lời gọi runtime được merge theo thứ tự thực thi. Với các field đơn giá trị như title, description, canonical URL và chỉ thị robots, lời gọi sau sẽ được ưu tiên. Các field có thể lặp lại vẫn giữ nhiều entry, nhưng việc thêm lại cùng key sẽ cập nhật entry trước đó. Với method `ogImage`, URL chính là key:

```php
Head::ogImage('/images/cover.jpg', alt: 'Draft cover')
    ->ogImage('/images/gallery.jpg', alt: 'Gallery image')
    ->ogImage('/images/cover.jpg', alt: 'Final cover', width: 1200, height: 630);
```

```html
<meta property="og:image" content="/images/cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Final cover">
<meta property="og:image" content="/images/gallery.jpg">
<meta property="og:image:alt" content="Gallery image">
```

Media Open Graph được kế thừa từ các giá trị mặc định đóng vai trò fallback. Khi metadata của route, runtime hoặc lỗi định nghĩa media riêng cùng loại, media mặc định sẽ bị thay thế thay vì được merge, vì vậy `og:image` của trang được ưu tiên hơn ảnh mặc định dùng cho toàn site.

Bạn có thể định nghĩa metadata có điều kiện theo fluent style bằng các method `when` và `unless`:

```php
Head::title($post->title)
    ->when($post->isDraft(), fn ($head) => $head->hiddenFromRobots());
```

<a name="error-pages"></a>
### Trang lỗi

Thông thường, bạn nên đăng ký metadata lỗi trong method `boot` của class `AppServiceProvider` trong ứng dụng:

```php
use Laravel\Head\ErrorPages;
use Laravel\Head\Facades\Head;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Head::errors(function (ErrorPages $errors) {
        $errors->defaults(robots: 'noindex, follow');

        $errors->status(
            404,
            title: 'Page Not Found',
            description: 'The page you are looking for could not be found.',
        );
    });
}
```

Các method `defaults` và `status` cũng chấp nhận cùng fluent builder callback được sử dụng bởi `Head::defaults()`:

```php
use Laravel\Head\ErrorPages;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::errors(function (ErrorPages $errors) {
    $errors->status(404, fn (HeadBuilder $head) => $head
        ->title('Page Not Found')
        ->description('The page you are looking for could not be found.'));
});
```

Khi response được render cho một HTTP status lỗi đã đăng ký, metadata đó sẽ được ưu tiên hơn mọi lớp khác.

Laravel tự động phát hiện status của response khi render error view hoặc thực thi hook ở giai đoạn respond như method `handleExceptionsUsing()` của Inertia. Nếu bạn render error response bên trong callback `$exceptions->render()`, hãy gọi `Head::status(404)` trước khi render để metadata lỗi được áp dụng.

<a name="open-graph"></a>
## Open Graph

Bạn có thể thiết lập các thuộc tính Open Graph bằng method `og`. Các media có thể lặp lại có thể được thêm bằng các method cấp cao nhất, những method này nhận trực tiếp các named argument:

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\OgType;

Head::og(type: OgType::Article, title: $post->title)
    ->ogImage($post->hero_image_url)
    ->ogImage(
        $post->gallery_image_url,
        alt: $post->gallery_image_alt,
        width: 1200,
        height: 630,
        type: ImageType::Jpeg,
    );
```

Các method `ogImage`, `ogVideo` và `ogAudio` nhận URL làm argument đầu tiên, cùng các named argument tùy chọn như `alt`, `width`, `height`, `type` và `secureUrl` khi được đặc tả Open Graph hỗ trợ.

Bạn có thể truyền MIME type của hình ảnh dưới dạng các case của enum `ImageType` ở bất kỳ nơi nào API nhận `type` của hình ảnh, chẳng hạn `ImageType::Svg`, `ImageType::Png`, `ImageType::Jpeg` và `ImageType::Webp`.

> [!NOTE]
> `title` và `description` của document sẽ tự động điền các giá trị `og:title` và `og:description` còn thiếu.

Với một hình ảnh Open Graph duy nhất và không có thuộc tính nào khác, bạn có thể truyền named argument `image` vào method `og`:

```php
Head::og(
    type: OgType::Website,
    title: $page->title,
    description: $page->description,
    image: $page->og_image_url,
);
```

Các lời gọi `og(image: ...)` và `ogImage(...)` ghi vào cùng một danh sách hình ảnh bên dưới, vì vậy bạn có thể dùng cách nào diễn đạt rõ hơn tại nơi gọi. Bạn có thể dùng method [`meta`](#custom-tags) cho các phần mở rộng Open Graph tùy chỉnh như thuộc tính product hoặc article.

<a name="twitter-cards"></a>
### X / Twitter Cards

Để render X / Twitter Cards từ cùng title, description và image được Open Graph sử dụng, hãy đăng ký `twitter()` trong các giá trị mặc định:

```php
use Laravel\Head\Enums\TwitterCard;
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::defaults(fn (HeadBuilder $head) => $head->twitter(
    card: TwitterCard::SummaryWithLargeImage,
));
```

Sau đó thiết lập metadata ở cấp trang:

```php
Head::title('Introducing Laravel Head')
    ->description('A fluent API for Laravel document head metadata.')
    ->ogImage('https://example.com/social.jpg', alt: 'Introducing Laravel Head');
```

Thao tác này render các thẻ Twitter tương ứng:

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Introducing Laravel Head">
<meta name="twitter:description" content="A fluent API for Laravel document head metadata.">
<meta name="twitter:image" content="https://example.com/social.jpg">
<meta name="twitter:image:alt" content="Introducing Laravel Head">
```

Bạn có thể tùy chỉnh từng trang bằng các giá trị Twitter tường minh:

```php
Head::twitter(title: $post->social_title)
    ->twitterImage($post->social_image_url, alt: $post->title);
```

Metadata của route chấp nhận `twitter` và `twitterImage`.

<a name="theme-colors"></a>
## Màu theme

Bạn có thể thiết lập màu theme ở phạm vi toàn cục, theo từng route hoặc tại runtime:

```php
Head::themeColor('#0f172a');
```

Thao tác này render thẻ `<meta name="theme-color">`. Với màu theme dành riêng cho từng media, bạn có thể dùng enum `Media`:

```php
use Laravel\Head\Enums\Media;

Head::themeColor('#ffffff', media: Media::Light)
    ->themeColor('#111827', media: Media::Dark);
```

Enum `Media` cũng bao gồm `Portrait` và `Landscape`. Argument `media` cũng chấp nhận một chuỗi media query tùy chỉnh.

Metadata của route hỗ trợ một màu theme duy nhất thông qua cùng key `camelCase`:

```php
Route::view('/dashboard', 'dashboard')->withHead(
    themeColor: '#0f172a',
);
```

<a name="app-metadata-and-icons"></a>
## Metadata và icon của ứng dụng

Laravel Head cung cấp các method cho metadata phổ biến của trình duyệt và ứng dụng:

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\Media;

Head::applicationName('Laravel')
    ->colorScheme('light dark')
    ->referrer('strict-origin-when-cross-origin')
    ->viewport('width=device-width, initial-scale=1')
    ->appleWebAppTitle('Laravel')
    ->webAppCapable()
    ->appleWebAppStatusBarStyle('black')
    ->favicon('/favicon.svg', type: ImageType::Svg)
    ->icon('/favicon-32x32.png', type: ImageType::Png, sizes: '32x32')
    ->appleTouchIcon('/apple-touch-icon.png', sizes: '180x180')
    ->appleTouchStartupImage('/launch.png', media: Media::Portrait)
    ->maskIcon('/safari-pinned-tab.svg', color: '#111827')
    ->manifest('/site.webmanifest');
```

Method `favicon` là alias của method `icon` và nhận cùng các argument `type`, `sizes` và `media`.

Metadata của route sử dụng cùng các tên này:

```php
use Laravel\Head\Enums\ImageType;
use Laravel\Head\Enums\Media;

Route::view('/dashboard', 'dashboard')->withHead(
    applicationName: 'Laravel',
    colorScheme: 'light dark',
    appleWebAppTitle: 'Laravel',
    webAppCapable: true,
    appleWebAppStatusBarStyle: 'black',
    favicon: [
        ['href' => '/favicon.svg', 'type' => ImageType::Svg],
        ['href' => '/favicon-32x32.png', 'type' => ImageType::Png, 'sizes' => '32x32'],
    ],
    appleTouchIcon: ['href' => '/apple-touch-icon.png', 'sizes' => '180x180'],
    appleTouchStartupImage: ['href' => '/launch.png', 'media' => Media::Portrait],
    manifest: '/site.webmanifest',
);
```

<a name="progressive-web-apps"></a>
## Progressive Web Apps

Method `pwa` cấu hình các thẻ `<head>` phổ biến của document cần thiết cho một web app có thể cài đặt:

```php
Head::pwa(
    name: 'Laravel',
    manifest: '/site.webmanifest',
    themeColor: '#0f172a',
    appleTouchIcon: '/apple-touch-icon.png',
    appleWebAppStatusBarStyle: 'black',
);
```

Thao tác này render tên ứng dụng, liên kết web application manifest và metadata standalone của iOS. Nếu được cung cấp, màu theme, kiểu status bar của Apple và Apple touch icon cũng được render. Việc tạo web application manifest và đăng ký service worker vẫn là trách nhiệm của ứng dụng của bạn.

Bạn có thể dùng method `pwa` trong metadata mặc định hoặc metadata tại runtime. Metadata của route hỗ trợ từng property riêng lẻ được trình bày ở trên.

<a name="performance-and-discovery"></a>
## Hiệu năng và khả năng khám phá

Laravel Head render các gợi ý hiệu năng, liên kết phân trang, URL thay thế theo locale và thông tin khám phá feed:

```php
Head::preload(asset('fonts/inter.woff2'), as: 'font', crossorigin: true)
    ->prefetch(asset('images/next.webp'))
    ->preconnect('https://cdn.example.com')
    ->dnsPrefetch('https://analytics.example.com')
    ->paginate($posts)
    ->alternates([
        'en' => 'https://example.com/en/about',
        'fr' => 'https://example.com/fr/about',
        'x-default' => 'https://example.com/about',
    ])
    ->feed('/feed', title: 'Laravel RSS')
    ->feed('/feed.atom', type: 'atom', title: 'Laravel Atom');
```

Với asset cục bộ, `preloadAsset()` và `prefetchAsset()` phân giải URL thông qua helper `asset()` và tự phát hiện attribute `as` từ phần mở rộng của file. Các font được preload sẽ tự động bao gồm `crossorigin`, vì đặc tả preload yêu cầu attribute này ngay cả với font cùng origin:

```php
Head::preloadAsset('fonts/inter.woff2')
    ->prefetchAsset('images/next.webp');
```

```html
<link rel="preload" href="https://example.com/fonts/inter.woff2" as="font" crossorigin>
<link rel="prefetch" href="https://example.com/images/next.webp" as="image">
```

Bạn có thể truyền `as` tường minh để ghi đè cơ chế tự phát hiện. Method `preloadAsset` sẽ ném exception khi không thể xác định attribute `as` từ phần mở rộng, vì trình duyệt bỏ qua preload nếu thiếu attribute này; còn method `prefetchAsset` sẽ đơn giản bỏ qua attribute đó.

<a name="custom-tags"></a>
## Custom tag

Với các tag không có method chuyên dụng, hãy sử dụng `meta()` và `link()`:

```php
Head::meta('format-detection', 'telephone=no')
    ->meta('article:author', $post->author->name)
    ->link('search', '/opensearch.xml', [
        'type' => 'application/opensearchdescription+xml',
        'title' => 'Laravel Search',
    ])
    ->link('me', 'https://social.example.com/@laravel');
```

Bạn có thể thêm media query vào meta tag khi trình duyệt chỉ nên áp dụng tag đó trong các điều kiện phù hợp:

```php
use Laravel\Head\Enums\Media;

Head::meta('theme-color', '#ffffff', media: Media::Light)
    ->meta('theme-color', '#111827', media: Media::Dark);
```

Method `meta` sử dụng attribute `name` cho các meta tag thông thường. Với các key thường sử dụng attribute `property`, chẳng hạn Open Graph (`og:`) hoặc metadata bài viết (`article:`), method sẽ tự động chuyển đổi:

```php
Head::meta('description', 'About Laravel')
    ->meta('og:title', 'About Laravel');
```

```html
<meta name="description" content="About Laravel">
<meta property="og:title" content="About Laravel">
```

Bạn có thể truyền `property: true` hoặc `property: false` để chọn tường minh attribute cần sử dụng.

<a name="schemas"></a>
## Schema

Các schema builder tích hợp sẵn hỗ trợ những kiểu JSON-LD phổ biến:

```php
use Laravel\Head\Enums\OfferAvailability;
use Laravel\Head\Facades\Schema;

Head::schema(
    Schema::product()
        ->name($product->name)
        ->offers(
            Schema::offer()
                ->price($product->price)
                ->currency('USD')
                ->availability(OfferAvailability::InStock)
        )
);
```

Các factory method tích hợp sẵn gồm `article`, `blogPosting`, `product`, `offer`, `brand`, `breadcrumbs`, `faq`, `organization`, `person`, `webPage` và `webSite`. Factory method không xác định sẽ tạo một schema object tổng quát, vì vậy bạn vẫn có thể biểu diễn các kiểu schema.org tùy chỉnh.

Khi dữ liệu schema JSON-LD không hợp lệ, Laravel Head sẽ ném exception trong môi trường không phải production và ghi warning vào log trong production.

<a name="breadcrumbs"></a>
### Breadcrumbs

Các breadcrumb item có thể được thêm từng mục hoặc thêm hàng loạt. Vị trí được tự động gán theo thứ tự các item được thêm vào:

```php
Head::schema(
    Schema::breadcrumbs()->items([
        'Home' => route('home'),
        'Shop' => route('shop.index'),
        'Shoes' => route('shop.category', 'shoes'),
    ])
);
```

Bạn có thể sử dụng method `item` để thêm một breadcrumb item:

```php
Schema::breadcrumbs()
    ->item('Home', route('home'))
    ->item('Shop', route('shop.index'));
```

<a name="faqs"></a>
### FAQ

Các mục FAQ tuân theo cùng một mẫu. Bạn có thể thêm từng mục bằng method `question` hoặc thêm hàng loạt bằng method `questions`:

```php
Head::schema(
    Schema::faq()->questions([
        'What is Laravel Head?' => 'A fluent API for managing the document head.',
        'Is it free?' => 'Yes, it is open source.',
    ])
);
```

<a name="custom-schemas"></a>
### Schema tùy chỉnh

Bạn có thể đăng ký tường minh các kiểu schema tùy chỉnh:

```php
use DateTimeInterface;
use Laravel\Head\Facades\Schema;
use Laravel\Head\Schema\SchemaObject;
use Laravel\Head\SchemaType;

#[SchemaType('JobPosting')]
class JobPosting extends SchemaObject
{
    public function title(string $title): static
    {
        return $this->set('title', $title);
    }

    public function datePosted(DateTimeInterface|string $date): static
    {
        return $this->date('datePosted', $date);
    }
}

Schema::register(JobPosting::class);

Head::schema(
    Schema::jobPosting()
        ->title('Senior Laravel Developer')
        ->datePosted(now())
);
```

<a name="rendering"></a>
## Render

Laravel Head phân giải metadata của trang thành các tag cho response hiện tại. Cách các tag này được render phụ thuộc vào stack của ứng dụng.

HTML renderer cung cấp cơ chế cho directive `@head` và các element đã render mà Laravel Head chia sẻ với Inertia thông qua prop `head`. Array renderer cung cấp `Head::toArray()` cho các ứng dụng cần metadata đã phân giải dưới dạng dữ liệu có cấu trúc.

<a name="blade"></a>
### Blade

Render các tag đã tích lũy trong phần `<head>` của layout bằng directive `@head`:

```blade
<head>
    <meta charset="utf-8">
    @head
</head>
```

Directive `@head` render đồng bộ, vì vậy bạn nên định nghĩa metadata của trang trước khi layout được render.

<a name="livewire"></a>
### Livewire

Ứng dụng Livewire sử dụng cùng directive `@head` trong document layout:

```blade
<head>
    @head
</head>

<body>
    {{ $slot }}

    @livewireScripts
</body>
```

Không cần cấu hình riêng cho Livewire. Metadata của Laravel Head được phân giải theo từng request và resolver có scope theo request. Vì vậy, mỗi lần điều hướng bằng `wire:navigate` sẽ lấy một document mới mà output `@head` phản ánh metadata của route đích. Các trang được truy cập bằng `wire:navigate` nhận đúng metadata của route, runtime và lỗi mà không cần code head ở cấp component.

<a name="inertia"></a>
### Inertia

Sử dụng cùng directive `@head` trong root template của Inertia, cùng với các component của chính Inertia:

```blade
<html>
<head>
    <meta charset="utf-8">
    @head

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    <x-inertia::head />
</head>
<body>
    <x-inertia::app />
</body>
</html>
```

Khi Inertia được cài đặt, Laravel Head tự động chia sẻ phần head do trang quản lý dưới dạng một mảng các chuỗi element đã render trong prop `head` của mỗi page object:

```json
{
    "props": {
        "head": [
            "<title data-inertia=\"title\">Dashboard - Laravel</title>",
            "<meta data-inertia=\"description\" name=\"description\" content=\"Your application overview.\">"
        ]
    }
}
```

Bật option `serverHead` của Inertia ở mọi nơi ứng dụng gọi `createInertiaApp()`. Option này có từ Inertia 3.5 trở lên:

```js
createInertiaApp({
    // ...
    serverHead: true,
});
```

Mỗi element do trang quản lý có một key `data-inertia` ổn định. Directive `@head` render document ban đầu, sau đó Inertia tiếp quản các element đó và giữ chúng đồng bộ trong các lần truy cập thông thường, [instant visit](https://inertiajs.com/docs/v3/the-basics/instant-visits), cũng như khi điều hướng back và forward. Các element có mặt trong HTML response ban đầu, vì vậy crawler và bot tạo link preview có thể đọc chúng mà không cần thực thi JavaScript. Không cần component `<Head>` phía client.

Cơ chế này hoạt động cả khi có hoặc không có [server-side rendering (SSR)](https://inertiajs.com/docs/v3/advanced/server-side-rendering). Nếu ứng dụng có entry point SSR riêng, hãy bật `serverHead` tại đó. Laravel Head tự động loại bỏ các element trùng lặp do trang quản lý giữa `@head` và `<x-inertia::head />`, bất kể thứ tự của chúng, đồng thời vẫn giữ các head element khác do JavaScript SSR tạo ra.

> [!NOTE]
> Khi thêm Laravel Head vào một ứng dụng Inertia hiện có, hãy xóa các title callback khỏi `resources/js/app.tsx` và `resources/js/ssr.tsx` để Laravel Head có thể quản lý title cuối cùng của document, đồng thời chuyển các tag do [`<Head>` component](https://inertiajs.com/docs/v3/the-basics/title-and-meta) của Inertia quản lý sang Laravel Head để hai bên không bao giờ định nghĩa cùng một element.

Prop `head` được bỏ khỏi các partial reload response, vì vậy Inertia giữ lại head của trang đầy đủ gần nhất. Instant visit cũng giữ head hiện tại cho đến khi background response trả về. Nếu ứng dụng đã sử dụng prop `head`, hãy đổi tên prop này trong một service provider:

```php
use Laravel\Head\Facades\Head;

public function boot(): void
{
    Head::inertia(prop: '_head');
}
```

Sau đó cấu hình Inertia sử dụng cùng prop đó với `serverHead: '_head'`.

<a name="static-inertia-tags"></a>
#### Inertia tag tĩnh

Phần lớn tag nên nằm trong defaults, metadata của route hoặc metadata tại runtime để Laravel Head có thể phân giải đúng giá trị cho từng trang. Chỉ sử dụng Inertia globals cho các document tag được render trong HTML response đầu tiên và được Inertia giữ nguyên trong phần còn lại của session.

Đăng ký chúng trong một service provider bằng `Head::inertiaGlobals()`:

```php
use Laravel\Head\Facades\Head;
use Laravel\Head\HeadBuilder;

Head::inertiaGlobals(function (HeadBuilder $head) {
    $head
        ->viewport('width=device-width, initial-scale=1')
        ->colorScheme('light dark')
        ->icon('/favicon.svg', type: 'image/svg+xml')
        ->appleTouchIcon('/apple-touch-icon.png', sizes: '180x180')
        ->manifest('/site.webmanifest');
});
```

Inertia globals không được đưa vào prop `head`, được render mà không có attribute ownership `data-inertia`, và không bao giờ được cập nhật sau response đầu tiên. Các global này phù hợp với những browser hint ổn định như viewport, color scheme, favicon, touch icon và manifest. Nếu một tag dành riêng cho từng trang, liên quan đến SEO hoặc có thể bị ghi đè về sau, hãy đặt nó trong `defaults`, metadata của route hoặc metadata tại runtime.

Các ứng dụng cần metadata đã phân giải dưới dạng dữ liệu có cấu trúc thay vì các tag đã render có thể gọi `Head::toArray()`. Dữ liệu trả về bao gồm title, giá trị Open Graph, schema JSON-LD và các metadata đã phân giải khác.

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/head). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
