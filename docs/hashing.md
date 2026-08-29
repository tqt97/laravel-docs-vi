# Hashing

- [Giới thiệu](#introduction)
- [Cấu hình](#configuration)
- [Cách sử dụng cơ bản](#basic-usage)
    - [Hash mật khẩu](#hashing-passwords)
    - [Xác minh mật khẩu khớp với hash](#verifying-that-a-password-matches-a-hash)
    - [Xác định mật khẩu có cần hash lại hay không](#determining-if-a-password-needs-to-be-rehashed)
- [Xác minh thuật toán hash](#hash-algorithm-verification)

<a name="introduction"></a>
## Giới thiệu

[Facade](/docs/{{version}}/facades) `Hash` của Laravel cung cấp khả năng hash an toàn bằng Bcrypt và Argon2 để lưu mật khẩu người dùng. Nếu bạn sử dụng một trong các [Laravel application starter kit](/docs/{{version}}/starter-kits), Bcrypt được dùng mặc định cho quá trình đăng ký và xác thực.

Bcrypt là lựa chọn phù hợp để hash mật khẩu vì "work factor" của nó có thể điều chỉnh. Điều này có nghĩa thời gian cần để tạo hash có thể được tăng lên khi sức mạnh phần cứng ngày càng lớn. Với việc hash mật khẩu, xử lý chậm có chủ đích là điều tốt: thuật toán càng mất nhiều thời gian để hash một mật khẩu, kẻ tấn công càng phải tốn nhiều thời gian để tạo các "rainbow table" chứa những giá trị hash có thể dùng cho tấn công brute-force vào ứng dụng.

<a name="configuration"></a>
## Cấu hình

Mặc định, Laravel sử dụng hashing driver `bcrypt` khi hash dữ liệu. Framework cũng hỗ trợ các driver khác, bao gồm [argon](https://en.wikipedia.org/wiki/Argon2) và [argon2id](https://en.wikipedia.org/wiki/Argon2).

Bạn có thể chỉ định hashing driver của ứng dụng thông qua biến môi trường `HASH_DRIVER`. Nếu muốn tùy chỉnh đầy đủ các tùy chọn của hashing driver trong Laravel, hãy publish file cấu hình `hashing` bằng Artisan command `config:publish`:

```shell
php artisan config:publish hashing
```

<a name="basic-usage"></a>
## Cách sử dụng cơ bản

<a name="hashing-passwords"></a>
### Hash mật khẩu

Bạn có thể hash mật khẩu bằng cách gọi method `make` trên facade `Hash`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    /**
     * Update the password for the user.
     */
    public function update(Request $request): RedirectResponse
    {
        // Validate the new password length...

        $request->user()->fill([
            'password' => Hash::make($request->newPassword)
        ])->save();

        return redirect('/profile');
    }
}
```

<a name="adjusting-the-bcrypt-work-factor"></a>
#### Điều chỉnh Bcrypt Work Factor

Nếu sử dụng thuật toán Bcrypt, method `make` cho phép bạn điều chỉnh work factor của thuật toán thông qua tùy chọn `rounds`. Tuy nhiên, work factor mặc định mà Laravel cấu hình phù hợp với phần lớn ứng dụng:

```php
$hashed = Hash::make('password', [
    'rounds' => 12,
]);
```

<a name="adjusting-the-argon2-work-factor"></a>
#### Điều chỉnh Argon2 Work Factor

Nếu sử dụng thuật toán Argon2, method `make` cho phép bạn điều chỉnh work factor thông qua các tùy chọn `memory`, `time` và `threads`. Các giá trị mặc định do Laravel quản lý phù hợp với phần lớn ứng dụng:

```php
$hashed = Hash::make('password', [
    'memory' => 1024,
    'time' => 2,
    'threads' => 2,
]);
```

> [!NOTE]
> Để tìm hiểu thêm về các tùy chọn này, hãy xem [tài liệu PHP chính thức về Argon hashing](https://secure.php.net/manual/en/function.password-hash.php).

<a name="verifying-that-a-password-matches-a-hash"></a>
### Xác minh mật khẩu khớp với hash

Method `check` của facade `Hash` cho phép bạn kiểm tra một chuỗi plain-text có tương ứng với giá trị hash đã cho hay không:

```php
if (Hash::check('plain-text', $hashedPassword)) {
    // The passwords match...
}
```

<a name="determining-if-a-password-needs-to-be-rehashed"></a>
### Xác định mật khẩu có cần hash lại hay không

Method `needsRehash` của facade `Hash` cho phép xác định work factor mà hasher sử dụng có thay đổi kể từ lúc mật khẩu được hash hay không. Một số ứng dụng thực hiện kiểm tra này trong quá trình xác thực:

```php
if (Hash::needsRehash($hashed)) {
    $hashed = Hash::make('plain-text');
}
```

<a name="hash-algorithm-verification"></a>
## Xác minh thuật toán hash

Để ngăn việc can thiệp vào thuật toán hash, method `Hash::check` của Laravel trước tiên sẽ xác minh hash được cung cấp có được tạo bởi đúng thuật toán hashing mà ứng dụng đã chọn hay không. Nếu hai thuật toán khác nhau, Laravel sẽ ném `RuntimeException`.

Đây là behavior mong đợi đối với phần lớn ứng dụng, nơi thuật toán hashing không thường xuyên thay đổi và sự xuất hiện của một thuật toán khác có thể là dấu hiệu của hành vi tấn công. Tuy nhiên, nếu ứng dụng cần hỗ trợ nhiều thuật toán hashing cùng lúc, chẳng hạn trong quá trình migration từ thuật toán cũ sang thuật toán mới, bạn có thể tắt bước xác minh thuật toán bằng cách đặt biến môi trường `HASH_VERIFY` thành `false`:

```ini
HASH_VERIFY=false
```

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/hashing). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
