# Laravel Pint

<a name="introduction"></a>
## Giới thiệu
[Laravel Pint](https://github.com/laravel/pint) là PHP code style fixer theo convention rõ ràng, hướng tới sự tối giản. Pint được xây trên [PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer), giúp giữ code style sạch và nhất quán một cách đơn giản.
Pint được cài tự động trong mọi ứng dụng Laravel mới nên bạn có thể sử dụng ngay. Mặc định Pint không yêu cầu cấu hình và sẽ sửa các vấn đề code style theo coding style được Laravel quy định.
<a name="installation"></a>
## Cài đặt
Pint đã được bao gồm trong các phiên bản Laravel gần đây nên thường không cần cài thêm. Với ứng dụng cũ hơn, bạn có thể cài Laravel Pint qua Composer:
```shell
composer require laravel/pint --dev
```

<a name="running-pint"></a>
## Chạy Pint
Bạn có thể yêu cầu Pint sửa code style bằng cách chạy binary `pint` nằm trong thư mục `vendor/bin` của project:
```shell
./vendor/bin/pint
```
Nếu muốn Pint chạy ở parallel mode (thử nghiệm) để tăng hiệu năng, hãy dùng option `--parallel`:
```shell
./vendor/bin/pint --parallel
```
Parallel mode còn cho phép chỉ định số process tối đa qua `--max-processes`. Nếu không truyền option này, Pint dùng toàn bộ core khả dụng trên máy:
```shell
./vendor/bin/pint --parallel --max-processes=4
```
Bạn cũng có thể chạy Pint trên file hoặc directory cụ thể:
```shell
./vendor/bin/pint app/Models

./vendor/bin/pint app/Models/User.php
```
Mặc định Pint không format Blade template. Nếu muốn format cả file `.blade.php`, dùng option `--blade`; option này bật rule [`Pint/laravel_blade`](#laravel-blade) cho lần chạy hiện tại mà không sửa `pint.json`:
```shell
./vendor/bin/pint --blade
```
Pint hiển thị danh sách đầy đủ các file đã cập nhật. Để xem chi tiết hơn về thay đổi, truyền option `-v` khi chạy Pint:
```shell
./vendor/bin/pint -v
```
Nếu chỉ muốn Pint kiểm tra lỗi style mà không sửa file, dùng option `--test`. Pint trả exit code khác 0 nếu phát hiện vấn đề code style:
```shell
./vendor/bin/pint --test
```
Nếu chỉ muốn Pint sửa các file khác với branch được chỉ định theo Git, dùng option `--diff=[branch]`. Cách này hữu ích trong CI như GitHub Actions vì chỉ cần kiểm tra file mới hoặc đã thay đổi:
```shell
./vendor/bin/pint --diff=main
```
Nếu chỉ muốn Pint sửa các file có uncommitted change theo Git, dùng option `--dirty`:
```shell
./vendor/bin/pint --dirty
```
Nếu muốn Pint sửa file có lỗi code style nhưng đồng thời trả exit code khác 0 nếu có lỗi đã được sửa, dùng option `--repair`:
```shell
./vendor/bin/pint --repair
```

<a name="configuring-pint"></a>
## Cấu hình Pint
Như đã nói, Pint không bắt buộc cấu hình. Tuy nhiên, nếu muốn tùy chỉnh preset, rule hoặc folder được kiểm tra, bạn có thể tạo file `pint.json` ở thư mục root của project:
```json
{
    "preset": "laravel"
}
```
Nếu muốn dùng `pint.json` từ một directory cụ thể, truyền option `--config` khi chạy Pint:
```shell
./vendor/bin/pint --config vendor/my-company/coding-style/pint.json
```

<a name="presets"></a>
### Presets
Preset định nghĩa một tập rule dùng để sửa code style. Mặc định Pint dùng preset `laravel`, áp dụng coding style do Laravel quy định. Bạn có thể chọn preset khác bằng option `--preset`:
```shell
./vendor/bin/pint --preset psr12
```
Bạn cũng có thể đặt preset trong file `pint.json` của project:
```json
{
    "preset": "psr12"
}
```
Các preset Pint hiện hỗ trợ gồm: `laravel`, `per`, `psr12`, `symfony` và `empty`.
<a name="rules"></a>
### Rules
Rule là các hướng dẫn style mà Pint dùng để sửa code. Preset là nhóm rule được định nghĩa sẵn và phù hợp với phần lớn PHP project, vì vậy thông thường bạn không cần quan tâm từng rule riêng lẻ.
Nếu cần, bạn có thể bật / tắt rule cụ thể trong `pint.json` hoặc dùng preset `empty` rồi tự định nghĩa rule từ đầu:
```json
{
    "preset": "laravel",
    "rules": {
        "simplified_null_return": true,
        "array_indentation": false,
        "new_with_parentheses": {
            "anonymous_class": true,
            "named_class": true
        }
    }
}
```
Pint được xây trên [PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer), vì vậy bạn có thể dùng bất kỳ rule nào của công cụ này để sửa code style: [PHP CS Fixer Configurator](https://mlocati.github.io/php-cs-fixer-configurator).
<a name="custom-rules"></a>
#### Custom Rules
Ngoài rule từ PHP CS Fixer, Pint cung cấp custom rule có prefix `Pint/`. Các rule này không bật mặc định nhưng bạn có thể bật trong `pint.json`.
<a name="laravel-blade"></a>
##### `Pint/laravel_blade`

Rule này format Blade template, áp dụng indentation, spacing và attribute formatting nhất quán cho file `.blade.php`. Mặc định Pint không format Blade nên bạn phải chủ động bật rule trong `pint.json`:
```json
{
    "preset": "laravel",
    "rules": {
        "Pint/laravel_blade": true
    }
}
```
Khi đã bật, Pint sẽ format Blade template cùng với PHP file mỗi lần chạy:
```shell
./vendor/bin/pint
```
Ngoài ra, nếu chỉ muốn bật rule này cho một lần chạy mà không sửa `pint.json`, dùng option `--blade`:
```shell
./vendor/bin/pint --blade
```
Bên dưới, rule này dùng [Prettier](https://prettier.io) cùng plugin `prettier-plugin-blade` và `prettier-plugin-tailwindcss`, vì vậy máy cần cài [Node.js](https://nodejs.org). Lần đầu chạy Pint với rule này, Pint sẽ phát hiện dependency Prettier còn thiếu và hỏi bạn có muốn cài hay không.
> [!NOTE]
> Rule này tự động bỏ qua những file thường có quy tắc format riêng, chẳng hạn guideline của [Laravel Boost](https://github.com/laravel/boost) và email view trong `resources/views/emails` hoặc `resources/views/mail`.
<a name="phpdoc-type-annotations-only"></a>
##### `Pint/phpdoc_type_annotations_only`

Rule này xóa toàn bộ comment và prose trong docblock, chỉ giữ các dòng chứa annotation bắt đầu bằng `@` như `@param`, `@return`, `@var`, `@phpstan-type`, v.v.:
```php
/**
 * Get the posts for the user. [tl! remove]
 * [tl! remove]
 * @return HasMany<Post, $this>
 */
public function posts(): HasMany
```
Single-line comment và block comment không có annotation `@` sẽ bị xóa hoàn toàn. Nếu muốn giữ một comment cụ thể, bạn có thể thêm prefix `@note`, `@warning` hoặc `@todo`:
```php
// @note This comment will be preserved.
```
Để bật rule này, hãy thêm nó vào `pint.json`:
```json
{
    "preset": "laravel",
    "rules": {
        "Pint/phpdoc_type_annotations_only": true
    }
}
```
> [!NOTE]
> Rule này tự động bỏ qua file trong directory `config`, vì configuration file thường dựa vào comment để làm tài liệu.
<a name="excluding-files-or-folders"></a>
### Loại trừ File / Folder
Mặc định Pint kiểm tra mọi file `.php` trong project ngoại trừ directory `vendor`. Nếu muốn loại trừ thêm folder, dùng option cấu hình `exclude`:
```json
{
    "exclude": [
        "my-specific/folder"
    ]
}
```
Nếu muốn loại trừ toàn bộ file có name pattern nhất định, dùng option `notName`:
```json
{
    "notName": [
        "*-my-file.php"
    ]
}
```
Nếu muốn loại trừ file bằng exact path, dùng option `notPath`:
```json
{
    "notPath": [
        "path/to/excluded-file.php"
    ]
}
```

<a name="continuous-integration"></a>
## Continuous Integration
<a name="running-tests-on-github-actions"></a>
### GitHub Actions
Để tự động lint project bằng Laravel Pint, bạn có thể cấu hình [GitHub Actions](https://github.com/features/actions) chạy Pint mỗi khi code mới được push lên GitHub. Trước tiên, hãy cấp "Read and write permissions" cho workflow tại **Settings > Actions > General > Workflow permissions**. Sau đó tạo file `.github/workflows/lint.yml` với nội dung sau:
```yaml
name: Fix Code Style

on: [push]

jobs:
  lint:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: true
      matrix:
        php: [8.4]

    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php }}
          tools: pint

      - name: Run Pint
        run: pint

      - name: Commit linted files
        uses: stefanzweifel/git-auto-commit-action@v6
```
