# Mã hóa (Encryption)

- [Giới thiệu](#introduction)
- [Cấu hình](#configuration)
    - [Luân chuyển khóa mã hóa an toàn](#gracefully-rotating-encryption-keys)
- [Sử dụng Encrypter](#using-the-encrypter)

<a name="introduction"></a>
## Giới thiệu

Các dịch vụ mã hóa của Laravel cung cấp một interface đơn giản và thuận tiện để mã hóa, giải mã văn bản thông qua OpenSSL với AES-256 và AES-128. Mọi giá trị được Laravel mã hóa đều được ký bằng mã xác thực thông điệp (MAC), nhờ đó dữ liệu gốc không thể bị sửa đổi hoặc can thiệp sau khi đã mã hóa mà không bị phát hiện.

<a name="configuration"></a>
## Cấu hình

Trước khi sử dụng encrypter của Laravel, bạn phải thiết lập tùy chọn `key` trong file cấu hình `config/app.php`. Giá trị này được lấy từ biến môi trường `APP_KEY`. Bạn nên dùng lệnh `php artisan key:generate` để tạo khóa vì lệnh này sử dụng bộ sinh byte ngẫu nhiên an toàn của PHP nhằm tạo ra một khóa đủ mạnh về mặt mật mã cho ứng dụng. Thông thường, biến `APP_KEY` sẽ được tạo sẵn trong quá trình [cài đặt Laravel](/docs/{{version}}/installation).

<a name="gracefully-rotating-encryption-keys"></a>
### Luân chuyển khóa mã hóa an toàn

Nếu bạn thay đổi khóa mã hóa của ứng dụng, toàn bộ session của người dùng đã xác thực sẽ bị đăng xuất. Nguyên nhân là Laravel mã hóa mọi cookie, bao gồm cả session cookie. Ngoài ra, dữ liệu đã được mã hóa bằng khóa cũ cũng sẽ không thể giải mã chỉ với khóa mới.

Để giảm ảnh hưởng của vấn đề này, Laravel cho phép khai báo các khóa mã hóa trước đây thông qua biến môi trường `APP_PREVIOUS_KEYS`. Biến này có thể chứa danh sách các khóa cũ, phân tách bằng dấu phẩy:

```ini
APP_KEY="base64:J63qRTDLub5NuZvP+kb8YIorGS6qFYHKVo6u7179stY="
APP_PREVIOUS_KEYS="base64:2nLsGFGzyoae2ax3EF2Lyq/hH6QghBGLIq5uL+Gp8/w="
```

Khi biến môi trường này được cấu hình, Laravel luôn sử dụng khóa mã hóa "hiện tại" để mã hóa dữ liệu mới. Tuy nhiên khi giải mã, Laravel sẽ thử khóa hiện tại trước; nếu không thành công, framework tiếp tục thử lần lượt các khóa trước đó cho đến khi tìm được khóa có thể giải mã giá trị.

Cách giải mã tương thích với khóa cũ này giúp người dùng tiếp tục sử dụng ứng dụng mà không bị gián đoạn khi bạn luân chuyển khóa mã hóa.

<a name="using-the-encrypter"></a>
## Sử dụng Encrypter

<a name="encrypting-a-value"></a>
#### Mã hóa một giá trị

Bạn có thể mã hóa một giá trị bằng method `encryptString` do facade `Crypt` cung cấp. Mọi giá trị được mã hóa đều sử dụng OpenSSL và cipher AES-256-CBC. Đồng thời, các giá trị này được ký bằng mã xác thực thông điệp (MAC). MAC tích hợp giúp ngăn việc giải mã dữ liệu đã bị người dùng độc hại chỉnh sửa:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class DigitalOceanTokenController extends Controller
{
    /**
     * Store a DigitalOcean API token for the user.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->user()->fill([
            'token' => Crypt::encryptString($request->token),
        ])->save();

        return redirect('/secrets');
    }
}
```

<a name="decrypting-a-value"></a>
#### Giải mã một giá trị

Bạn có thể giải mã dữ liệu bằng method `decryptString` của facade `Crypt`. Nếu giá trị không thể được giải mã hợp lệ, chẳng hạn khi mã xác thực thông điệp không hợp lệ, Laravel sẽ ném exception `Illuminate\Contracts\Encryption\DecryptException`:

```php
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

try {
    $decrypted = Crypt::decryptString($encryptedValue);
} catch (DecryptException $e) {
    // ...
}
```

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/encryption). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
