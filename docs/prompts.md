# Prompts

<a name="introduction"></a>
## Giới thiệu

[Laravel Prompts](https://github.com/laravel/prompts) là một package PHP giúp bổ sung các form đẹp mắt và thân thiện với người dùng vào ứng dụng dòng lệnh, với những tính năng tương tự trình duyệt như placeholder và validation.

<img src="https://laravel.com/img/docs/prompts-example.png">

Laravel Prompts rất phù hợp để nhận dữ liệu đầu vào từ người dùng trong các [lệnh Artisan console](/artisan#writing-commands), nhưng cũng có thể được sử dụng trong bất kỳ dự án PHP dòng lệnh nào.

> [!NOTE]
> Laravel Prompts hỗ trợ macOS, Linux và Windows với WSL. Để biết thêm thông tin, hãy xem tài liệu về [môi trường không được hỗ trợ và cơ chế fallback](#fallbacks).

<a name="installation"></a>
## Cài đặt

Laravel Prompts đã được tích hợp sẵn trong phiên bản Laravel mới nhất.

Bạn cũng có thể cài Laravel Prompts vào các dự án PHP khác bằng Composer:

```shell
composer require laravel/prompts
```

<a name="available-prompts"></a>
## Các prompt có sẵn

<a name="text"></a>
### Text

Hàm `text` sẽ hiển thị câu hỏi được cung cấp cho người dùng, nhận dữ liệu họ nhập và trả về giá trị đó:

```php
use function Laravel\Prompts\text;

$name = text('What is your name?');
```

Bạn cũng có thể cung cấp placeholder, giá trị mặc định và một gợi ý bổ sung thông tin:

```php
$name = text(
    label: 'What is your name?',
    placeholder: 'E.g. Taylor Otwell',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a name="text-required"></a>
#### Giá trị bắt buộc

Nếu bắt buộc người dùng phải nhập giá trị, bạn có thể truyền đối số `required`:

```php
$name = text(
    label: 'What is your name?',
    required: true
);
```

Nếu muốn tùy chỉnh thông báo validation, bạn cũng có thể truyền một chuỗi:

```php
$name = text(
    label: 'What is your name?',
    required: 'Your name is required.'
);
```

<a name="text-validation"></a>
#### Validation bổ sung

Cuối cùng, nếu muốn thực hiện thêm logic validation, bạn có thể truyền một closure vào đối số `validate`:

```php
$name = text(
    label: 'What is your name?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

Closure sẽ nhận giá trị đã được nhập và có thể trả về thông báo lỗi, hoặc `null` nếu validation thành công.

Ngoài ra, bạn có thể tận dụng [validator](/validation) của Laravel. Để làm vậy, hãy truyền vào đối số `validate` một mảng chứa tên attribute và các validation rule mong muốn:

```php
$name = text(
    label: 'What is your name?',
    validate: ['name' => 'required|max:255|unique:users']
);
```

<a name="textarea"></a>
### Textarea

Hàm `textarea` sẽ hiển thị câu hỏi được cung cấp, nhận dữ liệu người dùng nhập qua textarea nhiều dòng và trả về giá trị đó:

```php
use function Laravel\Prompts\textarea;

$story = textarea('Tell me a story.');
```

Bạn cũng có thể cung cấp placeholder, giá trị mặc định và một gợi ý bổ sung thông tin:

```php
$story = textarea(
    label: 'Tell me a story.',
    placeholder: 'This is a story about...',
    hint: 'This will be displayed on your profile.'
);
```

<a name="textarea-required"></a>
#### Giá trị bắt buộc

Nếu bắt buộc người dùng phải nhập giá trị, bạn có thể truyền đối số `required`:

```php
$story = textarea(
    label: 'Tell me a story.',
    required: true
);
```

Nếu muốn tùy chỉnh thông báo validation, bạn cũng có thể truyền một chuỗi:

```php
$story = textarea(
    label: 'Tell me a story.',
    required: 'A story is required.'
);
```

<a name="textarea-validation"></a>
#### Validation bổ sung

Cuối cùng, nếu muốn thực hiện thêm logic validation, bạn có thể truyền một closure vào đối số `validate`:

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: fn (string $value) => match (true) {
        strlen($value) < 250 => 'The story must be at least 250 characters.',
        strlen($value) > 10000 => 'The story must not exceed 10,000 characters.',
        default => null
    }
);
```

Closure sẽ nhận giá trị đã được nhập và có thể trả về thông báo lỗi, hoặc `null` nếu validation thành công.

Ngoài ra, bạn có thể tận dụng [validator](/validation) của Laravel. Để làm vậy, hãy truyền vào đối số `validate` một mảng chứa tên attribute và các validation rule mong muốn:

```php
$story = textarea(
    label: 'Tell me a story.',
    validate: ['story' => 'required|max:10000']
);
```

<a name="number"></a>
### Number

Hàm `number` sẽ hiển thị câu hỏi được cung cấp, nhận giá trị số do người dùng nhập và trả về giá trị đó. Hàm `number` cho phép người dùng sử dụng phím mũi tên lên và xuống để điều chỉnh số:

```php
use function Laravel\Prompts\number;

$number = number('How many copies would you like?');
```

Bạn cũng có thể cung cấp placeholder, giá trị mặc định và một gợi ý bổ sung thông tin:

```php
$name = number(
    label: 'How many copies would you like?',
    placeholder: '5',
    default: 1,
    hint: 'This will be determine how many copies to create.'
);
```

<a name="number-required"></a>
#### Giá trị bắt buộc

Nếu bắt buộc người dùng phải nhập giá trị, bạn có thể truyền đối số `required`:

```php
$copies = number(
    label: 'How many copies would you like?',
    required: true
);
```

Nếu muốn tùy chỉnh thông báo validation, bạn cũng có thể truyền một chuỗi:

```php
$copies = number(
    label: 'How many copies would you like?',
    required: 'A number of copies is required.'
);
```

<a name="number-validation"></a>
#### Validation bổ sung

Cuối cùng, nếu muốn thực hiện thêm logic validation, bạn có thể truyền một closure vào đối số `validate`:

```php
$copies = number(
    label: 'How many copies would you like?',
    validate: fn (?int $value) => match (true) {
        $value < 1 => 'At least one copy is required.',
        $value > 100 => 'You may not create more than 100 copies.',
        default => null
    }
);
```

Closure sẽ nhận giá trị đã được nhập và có thể trả về thông báo lỗi, hoặc `null` nếu validation thành công.

Ngoài ra, bạn có thể tận dụng [validator](/validation) của Laravel. Để làm vậy, hãy truyền vào đối số `validate` một mảng chứa tên attribute và các validation rule mong muốn:

```php
$copies = number(
    label: 'How many copies would you like?',
    validate: ['copies' => 'required|integer|min:1|max:100']
);
```

<a name="password"></a>
### Password

Hàm `password` tương tự hàm `text`, nhưng dữ liệu người dùng nhập sẽ được che khi họ gõ trong console. Điều này hữu ích khi yêu cầu thông tin nhạy cảm như mật khẩu:

```php
use function Laravel\Prompts\password;

$password = password('What is your password?');
```

Bạn cũng có thể cung cấp placeholder và một gợi ý bổ sung thông tin:

```php
$password = password(
    label: 'What is your password?',
    placeholder: 'password',
    hint: 'Minimum 8 characters.'
);
```

<a name="password-required"></a>
#### Giá trị bắt buộc

Nếu bắt buộc người dùng phải nhập giá trị, bạn có thể truyền đối số `required`:

```php
$password = password(
    label: 'What is your password?',
    required: true
);
```

Nếu muốn tùy chỉnh thông báo validation, bạn cũng có thể truyền một chuỗi:

```php
$password = password(
    label: 'What is your password?',
    required: 'The password is required.'
);
```

<a name="password-validation"></a>
#### Validation bổ sung

Cuối cùng, nếu muốn thực hiện thêm logic validation, bạn có thể truyền một closure vào đối số `validate`:

```php
$password = password(
    label: 'What is your password?',
    validate: fn (string $value) => match (true) {
        strlen($value) < 8 => 'The password must be at least 8 characters.',
        default => null
    }
);
```

Closure sẽ nhận giá trị đã được nhập và có thể trả về thông báo lỗi, hoặc `null` nếu validation thành công.

Ngoài ra, bạn có thể tận dụng [validator](/validation) của Laravel. Để làm vậy, hãy truyền vào đối số `validate` một mảng chứa tên attribute và các validation rule mong muốn:

```php
$password = password(
    label: 'What is your password?',
    validate: ['password' => 'min:8']
);
```

<a name="confirm"></a>
### Confirm

Nếu cần yêu cầu người dùng xác nhận "có hoặc không", bạn có thể sử dụng hàm `confirm`. Người dùng có thể dùng các phím mũi tên hoặc nhấn `y` hay `n` để chọn câu trả lời. Hàm này sẽ trả về `true` hoặc `false`.

```php
use function Laravel\Prompts\confirm;

$confirmed = confirm('Do you accept the terms?');
```

Bạn cũng có thể cung cấp giá trị mặc định, tùy chỉnh nội dung cho nhãn "Yes" và "No", cùng một gợi ý bổ sung thông tin:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    default: false,
    yes: 'I accept',
    no: 'I decline',
    hint: 'The terms must be accepted to continue.'
);
```

<a name="confirm-required"></a>
#### Bắt buộc chọn "Yes"

Nếu cần, bạn có thể bắt buộc người dùng chọn "Yes" bằng cách truyền đối số `required`:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: true
);
```

Nếu muốn tùy chỉnh thông báo validation, bạn cũng có thể truyền một chuỗi:

```php
$confirmed = confirm(
    label: 'Do you accept the terms?',
    required: 'You must accept the terms to continue.'
);
```

<a name="select"></a>
### Select

Nếu cần người dùng chọn từ một tập lựa chọn được định nghĩa trước, bạn có thể sử dụng hàm `select`:

```php
use function Laravel\Prompts\select;

$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner']
);
```

Bạn cũng có thể chỉ định lựa chọn mặc định và một gợi ý bổ sung thông tin:

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    default: 'Owner',
    hint: 'The role may be changed at any time.'
);
```

Bạn cũng có thể truyền một associative array vào đối số `options` để nhận về key được chọn thay vì value:

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    default: 'owner'
);
```

Tối đa năm lựa chọn sẽ được hiển thị trước khi danh sách bắt đầu cuộn. Bạn có thể tùy chỉnh số lượng này bằng đối số `scroll`:

```php
$role = select(
    label: 'Which category would you like to assign?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="select-info"></a>
#### Thông tin bổ sung

Đối số `info` có thể được dùng để hiển thị thông tin bổ sung về lựa chọn đang được highlight. Khi cung cấp một closure, closure sẽ nhận value của lựa chọn hiện tại và cần trả về một chuỗi hoặc `null`:

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    info: fn (string $value) => match ($value) {
        'member' => 'Can view and comment.',
        'contributor' => 'Can view, comment, and edit.',
        'owner' => 'Full access to all resources.',
        default => null,
    }
);
```

Bạn cũng có thể truyền một chuỗi tĩnh vào đối số `info` nếu thông tin không phụ thuộc vào lựa chọn đang được highlight:

```php
$role = select(
    label: 'What role should the user have?',
    options: ['Member', 'Contributor', 'Owner'],
    info: 'The role may be changed at any time.'
);
```

<a name="select-validation"></a>
#### Validation bổ sung

Không giống các hàm prompt khác, hàm `select` không nhận đối số `required` vì người dùng không thể không chọn gì. Tuy nhiên, bạn có thể truyền một closure vào đối số `validate` nếu cần hiển thị một lựa chọn nhưng không cho phép lựa chọn đó được chọn:

```php
$role = select(
    label: 'What role should the user have?',
    options: [
        'member' => 'Member',
        'contributor' => 'Contributor',
        'owner' => 'Owner',
    ],
    validate: fn (string $value) =>
        $value === 'owner' && User::where('role', 'owner')->exists()
            ? 'An owner already exists.'
            : null
);
```

Nếu đối số `options` là associative array, closure sẽ nhận key được chọn; nếu không, closure sẽ nhận value được chọn. Closure có thể trả về thông báo lỗi hoặc `null` nếu validation thành công.

<a name="multiselect"></a>
### Multi-select

Nếu cần cho phép người dùng chọn nhiều lựa chọn, bạn có thể sử dụng hàm `multiselect`:

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete']
);
```

Bạn cũng có thể chỉ định các lựa chọn mặc định và một gợi ý bổ sung thông tin:

```php
use function Laravel\Prompts\multiselect;

$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: ['Read', 'Create', 'Update', 'Delete'],
    default: ['Read', 'Create'],
    hint: 'Permissions may be updated at any time.'
);
```

Bạn cũng có thể truyền associative array vào đối số `options` để trả về các key của những lựa chọn được chọn thay vì value của chúng:

```php
$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    default: ['read', 'create']
);
```

Tối đa năm lựa chọn sẽ được hiển thị trước khi danh sách bắt đầu cuộn. Bạn có thể tùy chỉnh số lượng này bằng đối số `scroll`:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    scroll: 10
);
```

<a name="multiselect-info"></a>
#### Thông tin bổ sung

Đối số `info` có thể được dùng để hiển thị thông tin bổ sung về lựa chọn đang được highlight. Khi cung cấp một closure, closure sẽ nhận value của lựa chọn hiện tại và cần trả về một chuỗi hoặc `null`:

```php
$permissions = multiselect(
    label: 'What permissions should be assigned?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    info: fn (string $value) => match ($value) {
        'read' => 'View resources and their properties.',
        'create' => 'Create new resources.',
        'update' => 'Modify existing resources.',
        'delete' => 'Permanently remove resources.',
        default => null,
    }
);
```

<a name="multiselect-required"></a>
#### Bắt buộc có giá trị

Mặc định, người dùng có thể chọn từ không đến nhiều lựa chọn. Bạn có thể truyền đối số `required` để bắt buộc phải chọn ít nhất một lựa chọn:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: true
);
```

Nếu muốn tùy chỉnh thông báo validation, bạn có thể truyền một chuỗi vào đối số `required`:

```php
$categories = multiselect(
    label: 'What categories should be assigned?',
    options: Category::pluck('name', 'id'),
    required: 'You must select at least one category'
);
```

<a name="multiselect-validation"></a>
#### Validation bổ sung

Bạn có thể truyền một closure vào đối số `validate` nếu cần hiển thị một lựa chọn nhưng không cho phép lựa chọn đó được chọn:

```php
$permissions = multiselect(
    label: 'What permissions should the user have?',
    options: [
        'read' => 'Read',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
    ],
    validate: fn (array $values) => ! in_array('read', $values)
        ? 'All users require the read permission.'
        : null
);
```

Nếu đối số `options` là associative array, closure sẽ nhận các key được chọn; nếu không, closure sẽ nhận các value được chọn. Closure có thể trả về thông báo lỗi hoặc `null` nếu validation thành công.

<a name="suggest"></a>
### Suggest

Hàm `suggest` có thể được dùng để cung cấp tính năng tự động hoàn thành cho các lựa chọn có thể có. Người dùng vẫn có thể nhập bất kỳ câu trả lời nào, bất kể các gợi ý tự động hoàn thành:

```php
use function Laravel\Prompts\suggest;

$name = suggest('What is your name?', ['Taylor', 'Dayle']);
```

Ngoài ra, bạn có thể truyền một closure làm đối số thứ hai cho hàm `suggest`. Closure sẽ được gọi mỗi khi người dùng nhập một ký tự. Closure cần nhận một tham số chuỗi chứa nội dung người dùng đã nhập đến thời điểm đó và trả về một mảng các lựa chọn để tự động hoàn thành:

```php
$name = suggest(
    label: 'What is your name?',
    options: fn ($value) => collect(['Taylor', 'Dayle'])
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
)
```

Bạn cũng có thể cung cấp placeholder, giá trị mặc định và một gợi ý bổ sung thông tin:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    placeholder: 'E.g. Taylor',
    default: $user?->name,
    hint: 'This will be displayed on your profile.'
);
```

<a name="suggest-info"></a>
#### Thông tin bổ sung

Đối số `info` có thể được dùng để hiển thị thông tin bổ sung về lựa chọn đang được highlight. Khi cung cấp một closure, closure sẽ nhận value của lựa chọn hiện tại và cần trả về một chuỗi hoặc `null`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    info: fn (string $value) => match ($value) {
        'Taylor' => 'Administrator',
        'Dayle' => 'Contributor',
        default => null,
    }
);
```

<a name="suggest-required"></a>
#### Giá trị bắt buộc

Nếu bắt buộc người dùng phải nhập giá trị, bạn có thể truyền đối số `required`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: true
);
```

Nếu muốn tùy chỉnh thông báo validation, bạn cũng có thể truyền một chuỗi:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    required: 'Your name is required.'
);
```

<a name="suggest-validation"></a>
#### Validation bổ sung

Cuối cùng, nếu muốn thực hiện thêm logic validation, bạn có thể truyền một closure vào đối số `validate`:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

Closure sẽ nhận giá trị đã được nhập và có thể trả về thông báo lỗi, hoặc `null` nếu validation thành công.

Ngoài ra, bạn có thể tận dụng [validator](/validation) của Laravel. Để làm vậy, hãy truyền vào đối số `validate` một mảng chứa tên attribute và các validation rule mong muốn:

```php
$name = suggest(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle'],
    validate: ['name' => 'required|min:3|max:255']
);
```

<a name="search"></a>
### Tìm kiếm

Nếu có nhiều lựa chọn, hàm `search` cho phép người dùng nhập truy vấn tìm kiếm để lọc kết quả trước khi dùng các phím mũi tên để chọn một lựa chọn:

```php
use function Laravel\Prompts\search;

$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

Closure sẽ nhận phần văn bản người dùng đã nhập và phải trả về một mảng các lựa chọn. Nếu trả về mảng kết hợp, key của lựa chọn được chọn sẽ được trả về; nếu không, value của lựa chọn sẽ được trả về.

Khi lọc một mảng mà bạn muốn trả về value, hãy dùng hàm `array_values` hoặc phương thức `values` của Collection để bảo đảm mảng không trở thành mảng kết hợp:

```php
$names = collect(['Taylor', 'Abigail']);

$selected = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => $names
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
        ->values()
        ->all(),
);
```

Bạn cũng có thể cung cấp placeholder và một gợi ý bổ sung thông tin:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

Tối đa năm lựa chọn sẽ được hiển thị trước khi danh sách bắt đầu cuộn. Bạn có thể tùy chỉnh số lượng này bằng đối số `scroll`:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a name="search-info"></a>
#### Thông tin bổ sung

Đối số `info` có thể được dùng để hiển thị thông tin bổ sung về lựa chọn đang được highlight. Khi cung cấp một closure, closure sẽ nhận value của lựa chọn hiện tại và cần trả về một chuỗi hoặc `null`:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    info: fn (int $userId) => User::find($userId)?->email
);
```

<a name="search-validation"></a>
#### Validation bổ sung

Nếu muốn thực hiện thêm logic validation, bạn có thể truyền một closure vào đối số `validate`:

```php
$id = search(
    label: 'Search for the user that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (int|string $value) {
        $user = User::findOrFail($value);

        if ($user->opted_out) {
            return 'This user has opted-out of receiving mail.';
        }
    }
);
```

Nếu closure `options` trả về mảng kết hợp, closure validation sẽ nhận key đã chọn; nếu không, nó sẽ nhận value đã chọn. Closure có thể trả về thông báo lỗi, hoặc `null` nếu validation thành công.

<a name="multisearch"></a>
### Tìm kiếm nhiều lựa chọn

Nếu có nhiều lựa chọn có thể tìm kiếm và cần cho phép người dùng chọn nhiều mục, hàm `multisearch` cho phép nhập truy vấn để lọc kết quả trước khi dùng phím mũi tên và phím cách để chọn các lựa chọn:

```php
use function Laravel\Prompts\multisearch;

$ids = multisearch(
    'Search for users who should receive the mail',
    fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : []
);
```

Closure sẽ nhận phần văn bản người dùng đã nhập và phải trả về một mảng các lựa chọn. Nếu trả về mảng kết hợp, các key của những lựa chọn được chọn sẽ được trả về; nếu không, các value tương ứng sẽ được trả về.

Khi lọc một mảng mà bạn muốn trả về value, hãy dùng hàm `array_values` hoặc phương thức `values` của Collection để bảo đảm mảng không trở thành mảng kết hợp:

```php
$names = collect(['Taylor', 'Abigail']);

$selected = multisearch(
    label: 'Search for users who should receive the mail',
    options: fn (string $value) => $names
        ->filter(fn ($name) => Str::contains($name, $value, ignoreCase: true))
        ->values()
        ->all(),
);
```

Bạn cũng có thể cung cấp placeholder và một gợi ý bổ sung thông tin:

```php
$ids = multisearch(
    label: 'Search for users who should receive the mail',
    placeholder: 'E.g. Taylor Otwell',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    hint: 'The user will receive an email immediately.'
);
```

Tối đa năm lựa chọn sẽ được hiển thị trước khi danh sách bắt đầu cuộn. Bạn có thể tùy chỉnh giới hạn này bằng đối số `scroll`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    scroll: 10
);
```

<a name="multisearch-info"></a>
#### Thông tin bổ sung

Đối số `info` có thể được dùng để hiển thị thông tin bổ sung về lựa chọn đang được highlight. Khi cung cấp một closure, closure sẽ nhận value của lựa chọn hiện tại và cần trả về một chuỗi hoặc `null`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    info: fn (int $userId) => User::find($userId)?->email
);
```

<a name="multisearch-required"></a>
#### Bắt buộc có giá trị

Mặc định, người dùng có thể chọn từ không đến nhiều lựa chọn. Bạn có thể truyền đối số `required` để bắt buộc phải chọn ít nhất một lựa chọn:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: true
);
```

Nếu muốn tùy chỉnh thông báo validation, bạn cũng có thể truyền một chuỗi vào đối số `required`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    required: 'You must select at least one user.'
);
```

<a name="multisearch-validation"></a>
#### Validation bổ sung

Nếu muốn thực hiện thêm logic validation, bạn có thể truyền một closure vào đối số `validate`:

```php
$ids = multisearch(
    label: 'Search for the users that should receive the mail',
    options: fn (string $value) => strlen($value) > 0
        ? User::whereLike('name', "%{$value}%")->pluck('name', 'id')->all()
        : [],
    validate: function (array $values) {
        $optedOut = User::whereLike('name', '%a%')->findMany($values);

        if ($optedOut->isNotEmpty()) {
            return $optedOut->pluck('name')->join(', ', ', and ').' have opted out.';
        }
    }
);
```

Nếu closure `options` trả về mảng kết hợp, closure validation sẽ nhận các key đã chọn; nếu không, nó sẽ nhận các value đã chọn. Closure có thể trả về thông báo lỗi, hoặc `null` nếu validation thành công.

<a name="pause"></a>
### Tạm dừng

Hàm `pause` có thể được dùng để hiển thị thông tin cho người dùng và chờ họ xác nhận muốn tiếp tục bằng cách nhấn phím Enter / Return:

```php
use function Laravel\Prompts\pause;

pause('Press ENTER to continue.');
```

<a name="autocomplete"></a>
### Tự động hoàn thành

Hàm `autocomplete` có thể cung cấp tính năng tự động hoàn thành ngay trong dòng cho các lựa chọn khả dụng. Khi người dùng nhập, những gợi ý khớp với dữ liệu đầu vào sẽ xuất hiện dưới dạng văn bản mờ và có thể được chấp nhận bằng phím `Tab` hoặc mũi tên phải:

```php
use function Laravel\Prompts\autocomplete;

$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim']
);
```

Bạn cũng có thể cung cấp placeholder, giá trị mặc định và một gợi ý bổ sung thông tin:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    placeholder: 'E.g. Taylor',
    default: $user?->name,
    hint: 'Use tab to accept, up/down to cycle.'
);
```

<a name="autocomplete-closure"></a>
#### Tùy chọn động

Bạn cũng có thể truyền một closure để tạo động các lựa chọn dựa trên dữ liệu người dùng nhập. Closure được gọi mỗi khi người dùng nhập một ký tự và phải trả về một mảng lựa chọn dùng cho tự động hoàn thành:

```php
$file = autocomplete(
    label: 'Which file?',
    options: fn (string $value) => collect($files)
        ->filter(fn ($file) => str_starts_with(strtolower($file), strtolower($value)))
        ->values()
        ->all(),
);
```

<a name="autocomplete-required"></a>
#### Giá trị bắt buộc

Nếu bắt buộc người dùng phải nhập giá trị, bạn có thể truyền đối số `required`:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    required: true
);
```

Nếu muốn tùy chỉnh thông báo validation, bạn cũng có thể truyền một chuỗi:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    required: 'Your name is required.'
);
```

<a name="autocomplete-validation"></a>
#### Validation bổ sung

Cuối cùng, nếu muốn thực hiện thêm logic validation, bạn có thể truyền một closure vào đối số `validate`:

```php
$name = autocomplete(
    label: 'What is your name?',
    options: ['Taylor', 'Dayle', 'Jess', 'Nuno', 'Tim'],
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

Closure sẽ nhận giá trị đã được nhập và có thể trả về thông báo lỗi, hoặc `null` nếu validation thành công.

<a name="transforming-input-before-validation"></a>
## Biến đổi dữ liệu đầu vào trước khi validation

Đôi khi bạn có thể muốn biến đổi dữ liệu đầu vào của prompt trước khi validation diễn ra. Ví dụ, bạn có thể muốn loại bỏ khoảng trắng khỏi các chuỗi được cung cấp. Để làm điều này, nhiều hàm prompt cung cấp đối số `transform`, nhận một closure:

```php
$name = text(
    label: 'What is your name?',
    transform: fn (string $value) => trim($value),
    validate: fn (string $value) => match (true) {
        strlen($value) < 3 => 'The name must be at least 3 characters.',
        strlen($value) > 255 => 'The name must not exceed 255 characters.',
        default => null
    }
);
```

<a name="forms"></a>
## Biểu mẫu

Thông thường, bạn sẽ có nhiều prompt được hiển thị tuần tự để thu thập thông tin trước khi thực hiện các hành động tiếp theo. Bạn có thể dùng hàm `form` để tạo một nhóm prompt cho người dùng hoàn thành:

```php
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true)
    ->password('What is your password?', validate: ['password' => 'min:8'])
    ->confirm('Do you accept the terms?')
    ->submit();
```

Phương thức `submit` trả về một mảng đánh index bằng số chứa toàn bộ phản hồi từ các prompt trong form. Tuy nhiên, bạn có thể đặt tên cho từng prompt qua đối số `name`. Khi có tên, phản hồi của prompt có thể được truy cập bằng chính tên đó:

```php
use App\Models\User;
use function Laravel\Prompts\form;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->password(
        label: 'What is your password?',
        validate: ['password' => 'min:8'],
        name: 'password'
    )
    ->confirm('Do you accept the terms?')
    ->submit();

User::create([
    'name' => $responses['name'],
    'password' => $responses['password'],
]);
```

Lợi ích chính của hàm `form` là cho phép người dùng quay lại các prompt trước đó bằng `CTRL + U`. Nhờ vậy, họ có thể sửa lỗi hoặc thay đổi lựa chọn mà không cần hủy và bắt đầu lại toàn bộ form.

Nếu cần kiểm soát chi tiết hơn một prompt trong form, bạn có thể gọi phương thức `add` thay vì gọi trực tiếp một hàm prompt. Phương thức `add` được truyền toàn bộ các phản hồi trước đó của người dùng:

```php
use function Laravel\Prompts\form;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\text;

$responses = form()
    ->text('What is your name?', required: true, name: 'name')
    ->add(function ($responses) {
        return text("How old are you, {$responses['name']}?");
    }, name: 'age')
    ->submit();

outro("Your name is {$responses['name']} and you are {$responses['age']} years old.");
```

<a name="informational-messages"></a>
## Thông báo thông tin

Các hàm `note`, `info`, `warning`, `error` và `alert` có thể được dùng để hiển thị các thông báo thông tin:

```php
use function Laravel\Prompts\info;

info('Package installed successfully.');
```

<a name="callouts"></a>
## Khung thông báo

Hàm `callout` hiển thị một thông báo dạng khung với label và nội dung. Callout hữu ích khi cần làm nổi bật thông tin quan trọng như tóm tắt deployment, chi tiết lỗi hoặc cập nhật trạng thái:

```php
use function Laravel\Prompts\callout;

callout(
    label: 'Environment Configured',
    content: 'Your application is running in production mode with 4 workers.',
);
```

Bạn có thể truyền `warning` hoặc `error` vào đối số `type` để thay đổi kiểu hiển thị của callout:

```php
callout(
    label: 'Deprecation Notice',
    content: 'The `--prefer-stable` flag will be removed in v4.0. Use `--stability=stable` instead.',
    type: 'warning',
);

callout(
    label: 'Database Connection Failed',
    content: 'Could not connect to MySQL on 127.0.0.1:3306.',
    type: 'error',
);
```

Đối số `info` thêm một dòng footer vào callout, hữu ích để hiển thị metadata như ID hoặc timestamp:

```php
callout(
    label: 'Deployment Summary',
    content: 'Your application was deployed to production.',
    info: 'deploy-id: d4f8a2c',
);
```

<a name="callout-rich-content"></a>
#### Nội dung phong phú

Thay vì truyền một chuỗi, bạn có thể truyền một mảng gồm các chuỗi và element để xây dựng callout phong phú, có cấu trúc. Lớp `Element` cung cấp các factory method để tạo heading, danh sách bullet, danh sách đánh số, danh sách key-value và liên kết:

```php
use Laravel\Prompts\Elements\Element;

use function Laravel\Prompts\callout;

callout('Deployment Summary', [
    'Your application was deployed to production at 2024-03-15 14:32 UTC.',
    Element::heading('What Changed'),
    Element::bulletedList([
        'Migrated 3 pending database migrations',
        'Cleared and rebuilt route cache',
        'Restarted 4 queue workers',
    ]),
    Element::heading('Next Steps'),
    Element::numberedList([
        'Verify the health check endpoint at /up',
        'Monitor error rates for the next 15 minutes',
        'Confirm background jobs are processing',
    ]),
]);
```

Bạn cũng có thể dùng `Element::keyValueList` để hiển thị dữ liệu có label:

```php
callout('Database Connection Failed', [
    'Could not connect to the database server.',
    Element::keyValueList([
        'Host' => '127.0.0.1',
        'Port' => '3306',
        'Database' => 'forge',
        'Status' => 'Connection refused',
    ]),
], type: 'error');
```

Phương thức `Element::link` tạo hyperlink có thể nhấp trong các terminal hỗ trợ [OSC 8](https://gist.github.com/egmontkob/eb114294efbcd5adb1944c9f3cb5feda). Bạn có thể chỉ cung cấp URL hoặc cung cấp URL cùng label tùy chỉnh:

```php
callout('Server Health Check', [
    'Multiple services are reporting degraded performance.',
    Element::heading('Affected Services'),
    'Look here: '.Element::link('https://example.com/health', 'Health Dashboard'),
    Element::link('https://example.com/health'),
]);
```

Nếu không cung cấp label, chính URL sẽ được hiển thị làm nội dung liên kết.

<a name="tables"></a>
## Bảng

Hàm `table` giúp hiển thị dữ liệu nhiều hàng và nhiều cột một cách dễ dàng. Bạn chỉ cần cung cấp tên các cột và dữ liệu của bảng:

```php
use function Laravel\Prompts\table;

table(
    headers: ['Name', 'Email'],
    rows: User::all(['name', 'email'])->toArray()
);
```

<a name="spin"></a>
## Spinner

Hàm `spin` hiển thị spinner cùng một thông báo tùy chọn trong khi thực thi callback được chỉ định. Nó cho biết tiến trình đang diễn ra và trả về kết quả của callback khi hoàn tất:

```php
use function Laravel\Prompts\spin;

$response = spin(
    callback: fn () => Http::get('http://example.com'),
    message: 'Fetching response...'
);
```

> [!WARNING]
> Hàm `spin` yêu cầu PHP extension [PCNTL](https://www.php.net/manual/en/book.pcntl.php) để tạo animation cho spinner. Khi extension này không khả dụng, một phiên bản spinner tĩnh sẽ được hiển thị thay thế.

<a name="progress"></a>
## Thanh tiến trình

Với các tác vụ chạy lâu, thanh tiến trình giúp người dùng biết tác vụ đã hoàn thành đến đâu. Khi dùng hàm `progress`, Laravel sẽ hiển thị thanh tiến trình và tăng tiến độ sau mỗi lần lặp qua giá trị iterable được cung cấp:

```php
use function Laravel\Prompts\progress;

$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: fn ($user) => $this->performTask($user)
);
```

Hàm `progress` hoạt động tương tự hàm map và trả về một mảng chứa giá trị trả về của từng lần thực thi callback.

Callback cũng có thể nhận instance `Laravel\Prompts\Progress`, cho phép bạn thay đổi label và hint ở mỗi lần lặp:

```php
$users = progress(
    label: 'Updating users',
    steps: User::all(),
    callback: function ($user, $progress) {
        $progress
            ->label("Updating {$user->name}")
            ->hint("Created on {$user->created_at}");

        return $this->performTask($user);
    },
    hint: 'This may take some time.'
);
```

Đôi khi bạn cần kiểm soát thủ công hơn cách thanh tiến trình được tăng. Trước tiên, hãy xác định tổng số bước của quá trình. Sau đó, gọi phương thức `advance` sau khi xử lý từng mục để tăng thanh tiến trình:

```php
$progress = progress(label: 'Updating users', steps: 10);

$users = User::all();

$progress->start();

foreach ($users as $user) {
    $this->performTask($user);

    $progress->advance();
}

$progress->finish();
```

<a name="task"></a>
## Tác vụ

Hàm `task` hiển thị một tác vụ có label, spinner và vùng output trực tiếp có thể cuộn trong khi callback đang thực thi. Hàm này phù hợp để bao quanh các tiến trình chạy lâu như cài đặt dependency hoặc script deployment, giúp quan sát những gì đang diễn ra theo thời gian thực:

```php
use function Laravel\Prompts\task;

task(
    label: 'Installing dependencies',
    callback: function ($logger) {
        // Long-running process...
    }
);
```

Callback nhận một instance `Logger` mà bạn có thể dùng để hiển thị các dòng log, thông báo trạng thái và văn bản dạng stream trong vùng output của tác vụ.

> [!WARNING]
> Hàm `task` yêu cầu PHP extension [PCNTL](https://www.php.net/manual/en/book.pcntl.php) để tạo animation cho spinner. Khi extension này không khả dụng, một phiên bản tĩnh của tác vụ sẽ được hiển thị thay thế.

<a name="task-logging"></a>
#### Ghi log từng dòng

Phương thức `line` ghi một dòng log vào vùng output có thể cuộn của tác vụ:

```php
task(
    label: 'Installing dependencies',
    callback: function ($logger) {
        $logger->line('Resolving packages...');
        // ...
        $logger->line('Downloading laravel/framework');
        // ...
    }
);
```

<a name="task-status-messages"></a>
#### Thông báo trạng thái

Bạn có thể dùng các phương thức `success`, `warning` và `error` để hiển thị thông báo trạng thái. Các thông báo này được giữ ổn định và làm nổi bật phía trên vùng log cuộn:

```php
task(
    label: 'Deploying application',
    callback: function ($logger) {
        $logger->line('Pulling latest changes...');
        // ...
        $logger->success('Changes pulled!');

        $logger->line('Running migrations...');
        // ...
        $logger->warning('No new migrations to run.');

        $logger->line('Clearing cache...');
        // ...
        $logger->success('Cache cleared!');
    }
);
```

<a name="task-label"></a>
#### Cập nhật label

Phương thức `label` cho phép cập nhật label của tác vụ trong khi tác vụ đang chạy:

```php
task(
    label: 'Starting deployment...',
    callback: function ($logger) {
        $logger->label('Pulling latest changes...');
        // ...
        $logger->label('Running migrations...');
        // ...
        $logger->label('Clearing cache...');
        // ...
    }
);
```

<a name="task-sub-label"></a>
#### Hiển thị sub-label

Phương thức `subLabel` hiển thị một dòng mờ bên dưới label chính của tác vụ, hữu ích để truyền đạt trạng thái tạm thời như bước đang được xử lý. Truyền chuỗi rỗng để xóa sub-label:

```php
task(
    label: 'Deploying',
    callback: function ($logger) {
        $logger->subLabel('Building assets...');
        // ...
        $logger->subLabel('Running migrations...');
        // ...
        $logger->subLabel('');
    }
);
```

Bạn cũng có thể cung cấp sub-label ban đầu qua đối số `subLabel`:

```php
task(
    label: 'Deploying',
    callback: function ($logger) {
        // ...
    },
    subLabel: 'Preparing...'
);
```

<a name="task-streaming"></a>
#### Luồng văn bản văn bản

Với các tiến trình tạo output từng phần, chẳng hạn phản hồi do AI sinh ra, phương thức `partial` cho phép stream văn bản theo từng từ hoặc từng chunk. Khi stream hoàn tất, gọi `commitPartial` để chốt output:

```php
task(
    label: 'Generating response...',
    callback: function ($logger) {
        foreach ($words as $word) {
            $logger->partial($word . ' ');
        }

        $logger->commitPartial();
    }
);
```

<a name="task-limit"></a>
#### Tùy biến giới hạn output

Mặc định, tác vụ hiển thị tối đa 10 dòng output có thể cuộn. Bạn có thể tùy chỉnh giới hạn này qua đối số `limit`:

```php
task(
    label: 'Installing dependencies',
    callback: function ($logger) {
        // ...
    },
    limit: 20
);
```

<a name="task-keep-summary"></a>
#### Giữ lại phần tóm tắt

Mặc định, output của tác vụ sẽ bị xóa khi callback hoàn tất. Nếu muốn giữ các thông báo trạng thái trên màn hình sau khi tác vụ kết thúc, bạn có thể truyền đối số `keepSummary`:

```php
task(
    label: 'Deploying',
    callback: function ($logger) {
        $logger->success('Assets built');
        // ...
        $logger->success('Migrations complete');
    },
    keepSummary: true,
);
```

<a name="stream"></a>
## Luồng văn bản

Hàm `stream` hiển thị văn bản được truyền dần vào terminal, phù hợp để hiển thị nội dung do AI sinh ra hoặc bất kỳ văn bản nào đến theo từng phần:

```php
use function Laravel\Prompts\stream;

$stream = stream();

foreach ($words as $word) {
    $stream->append($word . ' ');
    usleep(25_000); // Simulate delay between chunks...
}

$stream->close();
```

Phương thức `append` thêm văn bản vào stream và render với hiệu ứng hiện dần. Khi toàn bộ nội dung đã được stream, gọi phương thức `close` để hoàn tất output và khôi phục con trỏ.

<a name="terminal-title"></a>
## Tiêu đề terminal

Hàm `title` cập nhật tiêu đề cửa sổ hoặc tab terminal của người dùng:

```php
use function Laravel\Prompts\title;

title('Installing Dependencies');
```

Để đặt lại tiêu đề terminal về mặc định, hãy truyền một chuỗi rỗng:

```php
title('');
```

<a name="clear"></a>
## Xóa nội dung terminal

Hàm `clear` có thể được dùng để xóa nội dung terminal của người dùng:

```php
use function Laravel\Prompts\clear;

clear();
```

<a name="terminal-considerations"></a>
## Các lưu ý về terminal

<a name="terminal-width"></a>
#### Chiều rộng terminal

Nếu độ dài của label, lựa chọn hoặc thông báo validation vượt quá số "cột" của terminal, nội dung sẽ tự động được cắt ngắn để vừa chiều rộng. Hãy cân nhắc giữ các chuỗi này ngắn nếu người dùng có thể sử dụng terminal hẹp. Giới hạn tối đa thường an toàn là 74 ký tự để hỗ trợ terminal rộng 80 ký tự.

<a name="terminal-height"></a>
#### Chiều cao terminal

Với các prompt hỗ trợ đối số `scroll`, giá trị đã cấu hình sẽ tự động được giảm để vừa chiều cao terminal của người dùng, bao gồm cả không gian dành cho thông báo validation.

<a name="fallbacks"></a>
## Môi trường không được hỗ trợ và fallback

Laravel Prompts hỗ trợ macOS, Linux và Windows thông qua WSL. Do các giới hạn của phiên bản PHP trên Windows, hiện không thể sử dụng Laravel Prompts trực tiếp trên Windows bên ngoài WSL.

Vì lý do này, Laravel Prompts hỗ trợ fallback sang implementation thay thế như [Symfony Console Question Helper](https://symfony.com/doc/current/components/console/helpers/questionhelper.html).

> [!NOTE]
> Khi sử dụng Laravel Prompts cùng Laravel framework, fallback cho từng prompt đã được cấu hình sẵn và sẽ tự động được bật trong các môi trường không được hỗ trợ.

<a name="fallback-conditions"></a>
#### Điều kiện fallback

Nếu không sử dụng Laravel hoặc cần tùy chỉnh thời điểm áp dụng fallback, bạn có thể truyền một giá trị boolean vào static method `fallbackWhen` của lớp `Prompt`:

```php
use Laravel\Prompts\Prompt;

Prompt::fallbackWhen(
    ! $input->isInteractive() || windows_os() || app()->runningUnitTests()
);
```

<a name="fallback-behavior"></a>
#### Hành vi fallback

Nếu không sử dụng Laravel hoặc cần tùy chỉnh hành vi fallback, bạn có thể truyền một closure vào static method `fallbackUsing` trên từng lớp prompt:

```php
use Laravel\Prompts\TextPrompt;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;

TextPrompt::fallbackUsing(function (TextPrompt $prompt) use ($input, $output) {
    $question = (new Question($prompt->label, $prompt->default ?: null))
        ->setValidator(function ($answer) use ($prompt) {
            if ($prompt->required && $answer === null) {
                throw new \RuntimeException(
                    is_string($prompt->required) ? $prompt->required : 'Required.'
                );
            }

            if ($prompt->validate) {
                $error = ($prompt->validate)($answer ?? '');

                if ($error) {
                    throw new \RuntimeException($error);
                }
            }

            return $answer;
        });

    return (new SymfonyStyle($input, $output))
        ->askQuestion($question);
});
```

Fallback phải được cấu hình riêng cho từng lớp prompt. Closure sẽ nhận một instance của lớp prompt và phải trả về kiểu dữ liệu phù hợp cho prompt đó.

<a name="testing"></a>
## Kiểm thử

Laravel cung cấp nhiều phương thức để kiểm thử rằng command của bạn hiển thị đúng các thông báo Prompt mong đợi:

```php tab=Pest
test('report generation', function () {
    $this->artisan('report:generate')
        ->expectsPromptsInfo('Welcome to the application!')
        ->expectsPromptsWarning('This action cannot be undone')
        ->expectsPromptsError('Something went wrong')
        ->expectsPromptsAlert('Important notice!')
        ->expectsPromptsIntro('Starting process...')
        ->expectsPromptsOutro('Process completed!')
        ->expectsPromptsTable(
            headers: ['Name', 'Email'],
            rows: [
                ['Taylor Otwell', 'taylor@example.com'],
                ['Jason Beggs', 'jason@example.com'],
            ]
        )
        ->assertExitCode(0);
});
```

```php tab=PHPUnit
public function test_report_generation(): void
{
    $this->artisan('report:generate')
        ->expectsPromptsInfo('Welcome to the application!')
        ->expectsPromptsWarning('This action cannot be undone')
        ->expectsPromptsError('Something went wrong')
        ->expectsPromptsAlert('Important notice!')
        ->expectsPromptsIntro('Starting process...')
        ->expectsPromptsOutro('Process completed!')
        ->expectsPromptsTable(
            headers: ['Name', 'Email'],
            rows: [
                ['Taylor Otwell', 'taylor@example.com'],
                ['Jason Beggs', 'jason@example.com'],
            ]
        )
        ->assertExitCode(0);
}
```
