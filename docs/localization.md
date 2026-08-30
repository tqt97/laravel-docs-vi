# Đa ngôn ngữ
- [Giới thiệu](#introduction)
    - [Xuất bản các file ngôn ngữ](#publishing-the-language-files)
    - [Cấu hình locale](#configuring-the-locale)
    - [Ngôn ngữ dùng để biến đổi số ít / số nhiều](#pluralization-language)
- [Định nghĩa chuỗi dịch](#defining-translation-strings)
    - [Dùng key ngắn](#using-short-keys)
    - [Dùng chính chuỗi dịch làm key](#using-translation-strings-as-keys)
- [Lấy chuỗi dịch](#retrieving-translation-strings)
    - [Thay thế tham số trong chuỗi dịch](#replacing-parameters-in-translation-strings)
    - [Xử lý số ít / số nhiều](#pluralization)
- [Ghi đè file ngôn ngữ của package](#overriding-package-language-files)
<a name="introduction"></a>
## Giới thiệu
> [!NOTE]
> Mặc định, bộ khung ứng dụng Laravel không có thư mục `lang`. Nếu muốn tùy biến các file ngôn ngữ của Laravel, bạn có thể xuất bản chúng bằng lệnh Artisan `lang:publish`.
Các tính năng bản địa hóa của Laravel cung cấp một cách thuận tiện để truy xuất chuỗi bằng nhiều ngôn ngữ khác nhau, cho phép bạn dễ dàng hỗ trợ nhiều ngôn ngữ trong ứng dụng.
Laravel cung cấp hai cách quản lý chuỗi dịch. Cách thứ nhất là lưu các chuỗi trong các file bên dưới thư mục `lang` của ứng dụng. Trong thư mục này, bạn có thể tạo một thư mục con cho từng ngôn ngữ mà ứng dụng hỗ trợ. Laravel cũng dùng cách này cho các chuỗi tích hợp sẵn, chẳng hạn thông báo lỗi validation:
```text
/lang
    /en
        messages.php
    /es
        messages.php
```
Hoặc, các chuỗi dịch có thể được định nghĩa trong những file JSON nằm trong thư mục `lang`. Với cách này, mỗi ngôn ngữ ứng dụng hỗ trợ sẽ có một file JSON tương ứng. Cách tiếp cận này được khuyến nghị cho các ứng dụng có số lượng lớn chuỗi cần dịch:
```text
/lang
    en.json
    es.json
```
Phần tài liệu này sẽ trình bày chi tiết cả hai cách quản lý chuỗi dịch.
<a name="publishing-the-language-files"></a>
### Xuất bản các file ngôn ngữ
Mặc định, bộ khung ứng dụng Laravel không có thư mục `lang`. Nếu muốn tùy biến các file ngôn ngữ của Laravel hoặc tạo file riêng, bạn có thể tạo cấu trúc thư mục `lang` bằng lệnh Artisan `lang:publish`. Lệnh này sẽ tạo thư mục `lang` và xuất bản bộ file ngôn ngữ mặc định mà Laravel sử dụng:
```shell
php artisan lang:publish
```

<a name="configuring-the-locale"></a>
### Cấu hình locale
Ngôn ngữ mặc định của ứng dụng được lưu trong tùy chọn cấu hình `locale` của file `config/app.php`, thường lấy giá trị từ biến môi trường `APP_LOCALE`. Bạn có thể thay đổi giá trị này theo nhu cầu của ứng dụng.
Bạn cũng có thể cấu hình một "ngôn ngữ dự phòng", được sử dụng khi ngôn ngữ mặc định không chứa chuỗi dịch cần tìm. Tương tự locale mặc định, ngôn ngữ dự phòng được cấu hình trong `config/app.php` và thường lấy giá trị từ biến môi trường `APP_FALLBACK_LOCALE`.
Bạn có thể thay đổi ngôn ngữ mặc định trong thời gian chạy cho một HTTP request bằng method `setLocale` của facade `App`:
```php
use Illuminate\Support\Facades\App;

Route::get('/greeting/{locale}', function (string $locale) {
    if (! in_array($locale, ['en', 'es', 'fr'])) {
        abort(400);
    }

    App::setLocale($locale);

    // ...
});
```

<a name="determining-the-current-locale"></a>
#### Xác định locale hiện tại
Bạn có thể dùng các method `currentLocale` và `isLocale` trên facade `App` để lấy locale hiện tại hoặc kiểm tra locale có bằng một giá trị cụ thể hay không:
```php
use Illuminate\Support\Facades\App;

$locale = App::currentLocale();

if (App::isLocale('en')) {
    // ...
}
```

<a name="pluralization-language"></a>
### Ngôn ngữ dùng để biến đổi số ít / số nhiều

<style>
.code-list-no-flex-break code {
    display: contents !important;
}
</style>

<div class="code-list-no-flex-break">

Bạn có thể yêu cầu bộ biến đổi số ít / số nhiều của Laravel — thành phần được Eloquent và các phần khác của framework sử dụng để chuyển từ dạng số ít sang số nhiều — dùng một ngôn ngữ khác tiếng Anh. Hãy gọi method `useLanguage` trong method `boot` của một service provider trong ứng dụng. Hiện tính năng này hỗ trợ các ngôn ngữ: `french`, `norwegian-bokmal`, `portuguese`, `spanish` và `turkish`:
</div>

```php
use Illuminate\Support\Pluralizer;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Pluralizer::useLanguage('spanish');

    // ...
}
```
> [!WARNING]
> Nếu tùy biến ngôn ngữ dùng để biến đổi số ít / số nhiều, bạn nên khai báo rõ [tên bảng](/docs/{{version}}/eloquent#table-names) cho các Eloquent model.
<a name="defining-translation-strings"></a>
## Định nghĩa chuỗi dịch
<a name="using-short-keys"></a>
### Dùng key ngắn
Thông thường, chuỗi dịch được lưu trong các file dưới thư mục `lang`. Thư mục này nên có một thư mục con cho mỗi ngôn ngữ ứng dụng hỗ trợ. Đây cũng là cách Laravel quản lý các chuỗi tích hợp sẵn, chẳng hạn thông báo lỗi validation:
```text
/lang
    /en
        messages.php
    /es
        messages.php
```
Mỗi file ngôn ngữ trả về một mảng các chuỗi được định danh bằng key. Ví dụ:
```php
<?php

// lang/en/messages.php

return [
    'welcome' => 'Welcome to our application!',
];
```
> [!WARNING]
> Với các ngôn ngữ khác nhau theo vùng lãnh thổ, hãy đặt tên thư mục ngôn ngữ theo chuẩn ISO 15897. Ví dụ, với tiếng Anh Anh hãy dùng `en_GB` thay vì `en-gb`.
<a name="using-translation-strings-as-keys"></a>
### Dùng chính chuỗi dịch làm key
Với ứng dụng có rất nhiều chuỗi cần dịch, việc tự đặt "key ngắn" cho mọi chuỗi có thể khiến phần tham chiếu trong view trở nên khó hiểu, đồng thời bạn phải liên tục nghĩ ra key mới cho từng nội dung.
Vì vậy, Laravel còn hỗ trợ dùng chính bản dịch "mặc định" của chuỗi làm key. Các file theo cách này được lưu dưới dạng JSON trong thư mục `lang`. Ví dụ, nếu ứng dụng có bản dịch tiếng Tây Ban Nha, hãy tạo file `lang/es.json`:
```json
{
    "I love programming.": "Me encanta programar."
}
```
#### Xung đột giữa key và tên file
Không nên định nghĩa key chuỗi dịch trùng với tên file dịch khác. Ví dụ, nếu dịch `__('Action')` cho locale "NL" trong khi tồn tại file `nl/action.php` nhưng không có `nl.json`, translator sẽ trả về toàn bộ nội dung của `nl/action.php`.
<a name="retrieving-translation-strings"></a>
## Lấy chuỗi dịch
Bạn có thể lấy chuỗi dịch từ file ngôn ngữ bằng helper `__`. Nếu dùng "key ngắn", hãy truyền tên file chứa key và chính key đó vào `__` theo cú pháp "dot". Ví dụ, để lấy chuỗi `welcome` từ file `lang/en/messages.php`:
```php
echo __('messages.welcome');
```
Nếu chuỗi dịch được chỉ định không tồn tại, hàm `__` sẽ trả về chính key được truyền vào. Với ví dụ trên, kết quả sẽ là `messages.welcome` nếu không tìm thấy chuỗi tương ứng.
Nếu bạn dùng [chuỗi dịch mặc định làm key](#using-translation-strings-as-keys), hãy truyền chính bản dịch mặc định của chuỗi vào hàm `__`:
```php
echo __('I love programming.');
```
Tương tự, nếu chuỗi dịch không tồn tại, hàm `__` sẽ trả về key đã được truyền vào.
Nếu sử dụng [Blade templating engine](/docs/{{version}}/blade), bạn có thể dùng cú pháp echo `{{ }}` để hiển thị chuỗi dịch:
```blade
{{ __('messages.welcome') }}
```

<a name="replacing-parameters-in-translation-strings"></a>
### Thay thế tham số trong chuỗi dịch
Bạn có thể định nghĩa placeholder trong chuỗi dịch. Mọi placeholder đều bắt đầu bằng `:`. Ví dụ, có thể tạo thông điệp chào mừng chứa placeholder cho tên:
```php
'welcome' => 'Welcome, :name',
```
Để thay thế placeholder khi lấy chuỗi dịch, truyền một mảng các giá trị thay thế làm đối số thứ hai của hàm `__`:
```php
echo __('messages.welcome', ['name' => 'dayle']);
```
Nếu placeholder được viết toàn bộ bằng chữ hoa, hoặc chỉ viết hoa ký tự đầu, giá trị sau khi dịch cũng sẽ được điều chỉnh chữ hoa tương ứng:
```php
'welcome' => 'Welcome, :NAME', // Welcome, DAYLE
'goodbye' => 'Goodbye, :Name', // Goodbye, Dayle
```

<a name="object-replacement-formatting"></a>
#### Định dạng object khi thay thế
Nếu truyền một object làm placeholder cho chuỗi dịch, method `__toString` của object sẽ được gọi. [__toString](https://www.php.net/manual/en/language.oop5.magic.php#object.tostring) là một trong các "magic method" tích hợp của PHP. Tuy nhiên, đôi khi bạn không kiểm soát được `__toString` của class, chẳng hạn class thuộc thư viện bên thứ ba.
Trong trường hợp đó, Laravel cho phép đăng ký formatter tùy chỉnh cho một loại object cụ thể. Hãy gọi method `stringable` của translator. Method này nhận một closure; closure nên type-hint loại object mà nó chịu trách nhiệm format. Thông thường, `stringable` nên được gọi trong method `boot` của class `AppServiceProvider`:
```php
use Illuminate\Support\Facades\Lang;
use Money\Money;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    Lang::stringable(function (Money $money) {
        return $money->formatTo('en_GB');
    });
}
```

<a name="pluralization"></a>
### Xử lý số ít / số nhiều
Việc xử lý số ít / số nhiều là một bài toán phức tạp vì mỗi ngôn ngữ có các quy tắc khác nhau. Laravel cho phép bạn định nghĩa chuỗi dịch khác nhau dựa trên số lượng. Hãy dùng ký tự `|` để phân tách dạng số ít và số nhiều:
```php
'apples' => 'There is one apple|There are many apples',
```
Cơ chế này cũng được hỗ trợ khi bạn [dùng chuỗi dịch làm key](#using-translation-strings-as-keys):
```json
{
    "There is one apple|There are many apples": "Hay una manzana|Hay muchas manzanas"
}
```
Bạn thậm chí có thể định nghĩa các quy tắc phức tạp hơn, với những chuỗi khác nhau cho nhiều khoảng giá trị:
```php
'apples' => '{0} There are none|[1,19] There are some|[20,*] There are many',
```
Sau khi định nghĩa chuỗi có nhiều lựa chọn theo số lượng, bạn có thể dùng hàm `trans_choice` để lấy nội dung phù hợp với một giá trị "count". Trong ví dụ này, vì `count` lớn hơn một nên dạng số nhiều được trả về:
```php
echo trans_choice('messages.apples', 10);
```
Bạn cũng có thể định nghĩa placeholder trong chuỗi xử lý số ít / số nhiều. Các placeholder này được thay thế bằng cách truyền một mảng làm đối số thứ ba của `trans_choice`:
```php
'minutes_ago' => '{1} :value minute ago|[2,*] :value minutes ago',

echo trans_choice('time.minutes_ago', 5, ['value' => 5]);
```
Nếu muốn hiển thị giá trị số nguyên được truyền vào `trans_choice`, bạn có thể dùng placeholder tích hợp `:count`:
```php
'apples' => '{0} There are none|{1} There is one|[2,*] There are :count',
```

<a name="overriding-package-language-files"></a>
## Ghi đè file ngôn ngữ của package
Một số package đi kèm file ngôn ngữ riêng. Thay vì sửa trực tiếp các file lõi của package, bạn có thể ghi đè chúng bằng cách đặt file tương ứng trong thư mục `lang/vendor/{package}/{locale}`.
Ví dụ, nếu cần ghi đè các chuỗi tiếng Anh trong `messages.php` của package `skyrim/hearthfire`, hãy tạo file tại `lang/vendor/hearthfire/en/messages.php`. Trong file này, chỉ cần định nghĩa những chuỗi bạn muốn ghi đè; các chuỗi còn lại vẫn được nạp từ file ngôn ngữ gốc của package.

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/localization). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
