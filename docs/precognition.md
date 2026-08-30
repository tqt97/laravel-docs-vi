# Precognition
- [Giới thiệu](#introduction)
- [Live validation](#live-validation)
    - [Dùng Vue](#using-vue)
    - [Dùng React](#using-react)
    - [Dùng Alpine và Blade](#using-alpine)
    - [Cấu hình Axios](#configuring-axios)
- [Validate array](#validating-arrays)
- [Tùy biến validation rule](#customizing-validation-rules)
- [Xử lý file upload](#handling-file-uploads)
- [Quản lý side effect](#managing-side-effects)
- [Testing](#testing)
<a name="introduction"></a>
## Giới thiệu
Laravel Precognition cho phép "dự đoán" kết quả của một HTTP request trong tương lai. Use case chính là cung cấp live validation cho frontend JavaScript mà không cần viết lại validation rule của backend ở phía frontend.
Khi Laravel nhận một "precognitive request", framework sẽ chạy toàn bộ middleware của route và resolve dependency của controller, bao gồm validate [form request](/docs/{{version}}/validation#form-request-validation), nhưng **không thực sự gọi controller method** của route.
> [!NOTE]
> Từ Inertia 2.3, Precognition đã được hỗ trợ tích hợp. Xem [tài liệu Inertia Forms](https://inertiajs.com/forms) để biết thêm. Inertia phiên bản cũ hơn cần Precognition 0.x.
<a name="live-validation"></a>
## Live validation
<a name="using-vue"></a>
### Dùng Vue
Với Laravel Precognition, bạn có thể cung cấp live validation mà không phải nhân đôi validation rule trong frontend Vue. Để minh họa, ta sẽ tạo form thêm user mới.
Trước tiên, thêm middleware `HandlePrecognitiveRequests` vào route để bật Precognition. Bạn cũng nên tạo [form request](/docs/{{version}}/validation#form-request-validation) chứa validation rule của route:
```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```
Tiếp theo, cài frontend helper của Laravel Precognition cho Vue qua NPM:
```shell
npm install laravel-precognition-vue
```
Sau khi cài package, tạo form object bằng function `useForm` của Precognition, truyền HTTP method (`post`), target URL (`/users`) và dữ liệu ban đầu của form.
Để bật live validation, gọi method `validate` của form trong event `change` của từng input và truyền tên input:
```vue
<script setup>
import { useForm } from 'laravel-precognition-vue';

const form = useForm('post', '/users', {
    name: '',
    email: '',
});

const submit = () => form.submit();
</script>

<template>
    <form @submit.prevent="submit">
        <label for="name">Name</label>
        <input
            id="name"
            v-model="form.name"
            @change="form.validate('name')"
        />
        <div v-if="form.invalid('name')">
            {{ form.errors.name }}
        </div>

        <label for="email">Email</label>
        <input
            id="email"
            type="email"
            v-model="form.email"
            @change="form.validate('email')"
        />
        <div v-if="form.invalid('email')">
            {{ form.errors.email }}
        </div>

        <button :disabled="form.processing">
            Create User
        </button>
    </form>
</template>
```
Khi người dùng điền form, Precognition trả live validation dựa trực tiếp trên rule trong form request của route. Khi input thay đổi, một precognitive validation request có debounce được gửi tới Laravel. Bạn có thể cấu hình thời gian debounce bằng `setValidationTimeout`:
```js
form.setValidationTimeout(3000);
```
Trong lúc validation request đang chạy, property `validating` của form là `true`:
```html
<div v-if="form.validating">
    Validating...
</div>
```
Validation error trả về từ validation request hoặc form submission sẽ tự động được đưa vào object `errors` của form:
```html
<div v-if="form.invalid('email')">
    {{ form.errors.email }}
</div>
```
Bạn có thể kiểm tra form có lỗi hay không bằng property `hasErrors`:
```html
<div v-if="form.hasErrors">
    <!-- ... -->
</div>
```
Bạn cũng có thể kiểm tra input đã pass hoặc fail validation bằng các function `valid` và `invalid`, truyền tên input tương ứng:
```html
<span v-if="form.valid('email')">
    ✅
</span>

<span v-else-if="form.invalid('email')">
    ❌
</span>
```
> [!WARNING]
> Input chỉ được đánh dấu valid hoặc invalid sau khi nó đã thay đổi và ứng dụng nhận được validation response.
Nếu chỉ validate một phần input bằng Precognition, đôi khi cần chủ động xóa error cũ. Dùng function `forgetError` để thực hiện:
```html
<input
    id="avatar"
    type="file"
    @change="(e) => {
        form.avatar = e.target.files[0]

        form.forgetError('avatar')
    }"
>
```
Ngoài việc validate từng input khi người dùng tương tác, bạn có thể cần validate cả input chưa được chạm tới. Tình huống này phổ biến với form "wizard", khi cần validate toàn bộ input đang hiển thị trước khi chuyển bước.
Để làm điều này, gọi `validate` và truyền các field cần kiểm tra vào option `only`. Kết quả có thể được xử lý bằng callback `onSuccess` hoặc `onValidationError`:
```html
<button
    type="button"
    @click="form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })"
>Next Step</button>
```
Bạn cũng có thể chạy code theo response của form submission. Function `submit` trả về Axios request promise, giúp truy cập response payload, reset input khi submit thành công hoặc xử lý request thất bại:
```js
const submit = () => form.submit()
    .then(response => {
        form.reset();

        alert('User created.');
    })
    .catch(error => {
        alert('An error occurred.');
    });
```
Để biết form submission đang chạy hay không, kiểm tra property `processing`:
```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="using-react"></a>
### Dùng React
Với Laravel Precognition, bạn có thể cung cấp live validation mà không cần nhân đôi validation rule trong frontend React. Ví dụ sau xây dựng form tạo user mới.
Trước tiên, thêm middleware `HandlePrecognitiveRequests` vào route và tạo [form request](/docs/{{version}}/validation#form-request-validation) chứa validation rule:
```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```
Tiếp theo, cài frontend helper của Laravel Precognition cho React qua NPM:
```shell
npm install laravel-precognition-react
```
Sau khi cài package, tạo form object bằng `useForm`, truyền HTTP method (`post`), target URL (`/users`) và dữ liệu ban đầu.
Để bật live validation, lắng nghe event `change` và `blur` của từng input. Trong `change`, dùng `setData` để cập nhật tên field và giá trị mới. Trong `blur`, gọi `validate` với tên input:
```jsx
import { useForm } from 'laravel-precognition-react';

export default function Form() {
    const form = useForm('post', '/users', {
        name: '',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        form.submit();
    };

    return (
        <form onSubmit={submit}>
            <label htmlFor="name">Name</label>
            <input
                id="name"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                onBlur={() => form.validate('name')}
            />
            {form.invalid('name') && <div>{form.errors.name}</div>}

            <label htmlFor="email">Email</label>
            <input
                id="email"
                value={form.data.email}
                onChange={(e) => form.setData('email', e.target.value)}
                onBlur={() => form.validate('email')}
            />
            {form.invalid('email') && <div>{form.errors.email}</div>}

            <button disabled={form.processing}>
                Create User
            </button>
        </form>
    );
};
```
Khi người dùng điền form, Precognition cung cấp live validation dựa trên rule của form request. Một precognitive request có debounce được gửi về Laravel; có thể điều chỉnh timeout bằng `setValidationTimeout`:
```js
form.setValidationTimeout(3000);
```
Khi validation request đang chạy, `validating` là `true`:
```jsx
{form.validating && <div>Validating...</div>}
```
Validation error từ validation request hoặc form submission tự động được đưa vào `errors`:
```jsx
{form.invalid('email') && <div>{form.errors.email}</div>}
```
Kiểm tra form có error bằng property `hasErrors`:
```jsx
{form.hasErrors && <div><!-- ... --></div>}
```
Kiểm tra từng input pass / fail validation bằng `valid` và `invalid`:
```jsx
{form.valid('email') && <span>✅</span>}

{form.invalid('email') && <span>❌</span>}
```
> [!WARNING]
> Input chỉ được xem là valid hoặc invalid sau khi đã thay đổi và nhận validation response.
Nếu chỉ validate một phần field, bạn có thể dùng `forgetError` để chủ động xóa error:
```jsx
<input
    id="avatar"
    type="file"
    onChange={(e) => {
        form.setData('avatar', e.target.files[0]);

        form.forgetError('avatar');
    }}
>
```
Bạn cũng có thể cần validate input chưa được người dùng tương tác, đặc biệt với form wizard cần xác minh tất cả field đang hiển thị trước khi chuyển bước.
Gọi `validate` với các field cần kiểm tra trong option `only`, rồi xử lý kết quả bằng `onSuccess` hoặc `onValidationError`:
```jsx
<button
    type="button"
    onClick={() => form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })}
>Next Step</button>
```
Function `submit` trả về Axios request promise, nhờ đó có thể đọc response payload, reset form sau khi submit thành công hoặc xử lý lỗi request:
```js
const submit = (e) => {
    e.preventDefault();

    form.submit()
        .then(response => {
            form.reset();

            alert('User created.');
        })
        .catch(error => {
            alert('An error occurred.');
        });
};
```
Kiểm tra property `processing` để biết form submission đang chạy:
```html
<button disabled={form.processing}>
    Submit
</button>
```

<a name="using-alpine"></a>
### Dùng Alpine và Blade
Với Laravel Precognition, frontend Alpine cũng có thể live validate mà không cần nhân đôi rule backend. Ví dụ sau xây dựng form tạo user mới.
Trước tiên, thêm middleware `HandlePrecognitiveRequests` vào route và tạo [form request](/docs/{{version}}/validation#form-request-validation) chứa rule:
```php
use App\Http\Requests\CreateUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (CreateUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```
Tiếp theo, cài frontend helper Precognition cho Alpine qua NPM:
```shell
npm install laravel-precognition-alpine
```
Sau đó đăng ký plugin Precognition với Alpine trong `resources/js/app.js`:
```js
import Alpine from 'alpinejs';
import Precognition from 'laravel-precognition-alpine';

window.Alpine = Alpine;

Alpine.plugin(Precognition);
Alpine.start();
```
Sau khi package được cài và đăng ký, tạo form object bằng `$form` "magic" của Precognition, truyền HTTP method (`post`), target URL (`/users`) và dữ liệu ban đầu.
Để bật live validation, bind dữ liệu form với input tương ứng và lắng nghe event `change`. Trong handler, gọi `validate` với tên input:
```html
<form x-data="{
    form: $form('post', '/register', {
        name: '',
        email: '',
    }),
}">
    @csrf
    <label for="name">Name</label>
    <input
        id="name"
        name="name"
        x-model="form.name"
        @change="form.validate('name')"
    />
    <template x-if="form.invalid('name')">
        <div x-text="form.errors.name"></div>
    </template>

    <label for="email">Email</label>
    <input
        id="email"
        name="email"
        x-model="form.email"
        @change="form.validate('email')"
    />
    <template x-if="form.invalid('email')">
        <div x-text="form.errors.email"></div>
    </template>

    <button :disabled="form.processing">
        Create User
    </button>
</form>
```
Khi người dùng điền form, Precognition gửi precognitive validation request có debounce về Laravel và trả kết quả dựa trên form request rule. Có thể chỉnh debounce bằng `setValidationTimeout`:
```js
form.setValidationTimeout(3000);
```
Khi validation request đang chạy, property `validating` là `true`:
```html
<template x-if="form.validating">
    <div>Validating...</div>
</template>
```
Validation error từ validation request hoặc submit tự động đi vào object `errors`:
```html
<template x-if="form.invalid('email')">
    <div x-text="form.errors.email"></div>
</template>
```
Kiểm tra form có error bằng `hasErrors`:
```html
<template x-if="form.hasErrors">
    <div><!-- ... --></div>
</template>
```
Kiểm tra input pass / fail validation bằng `valid` và `invalid`:
```html
<template x-if="form.valid('email')">
    <span>✅</span>
</template>

<template x-if="form.invalid('email')">
    <span>❌</span>
</template>
```
> [!WARNING]
> Input chỉ được xem là valid hoặc invalid sau khi đã thay đổi và nhận validation response.
Ngoài input đã tương tác, đôi khi bạn cần validate cả input chưa được chạm tới, ví dụ trong form wizard trước khi chuyển bước.
Gọi `validate`, truyền field cần kiểm tra vào `only`, rồi xử lý kết quả bằng `onSuccess` hoặc `onValidationError`:
```html
<button
    type="button"
    @click="form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })"
>Next Step</button>
```
Kiểm tra `processing` để biết form submission đang chạy:
```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="repopulating-old-form-data"></a>
#### Khôi phục dữ liệu form cũ
Trong ví dụ tạo user ở trên, Precognition được dùng cho live validation nhưng form cuối cùng vẫn submit theo cách server-side truyền thống. Vì vậy, form nên được điền lại bằng "old" input và validation error mà server trả về:
```html
<form x-data="{
    form: $form('post', '/register', {
        name: '{{ old('name') }}',
        email: '{{ old('email') }}',
    }).setErrors({{ Js::from($errors->messages()) }}),
}">
```
Nếu muốn submit form bằng XHR, có thể dùng function `submit`, trả về Axios request promise:
```html
<form
    x-data="{
        form: $form('post', '/register', {
            name: '',
            email: '',
        }),
        submit() {
            this.form.submit()
                .then(response => {
                    this.form.reset();

                    alert('User created.')
                })
                .catch(error => {
                    alert('An error occurred.');
                });
        },
    }"
    @submit.prevent="submit"
>
```

<a name="configuring-axios"></a>
### Cấu hình Axios
Các validation library của Precognition dùng HTTP client [Axios](https://github.com/axios/axios) để gửi request tới backend. Khi cần, bạn có thể tùy biến Axios instance. Ví dụ với `laravel-precognition-vue`, có thể thêm request header cho mọi request đi ra trong `resources/js/app.js`:
```js
import { client } from 'laravel-precognition-vue';

client.axios().defaults.headers.common['Authorization'] = authToken;
```
Nếu ứng dụng đã có Axios instance được cấu hình sẵn, bạn có thể yêu cầu Precognition dùng instance đó:
```js
import Axios from 'axios';
import { client } from 'laravel-precognition-vue';

window.axios = Axios.create()
window.axios.defaults.headers.common['Authorization'] = authToken;

client.use(window.axios)
```

<a name="validating-arrays"></a>
## Validate array
Bạn có thể dùng wildcard để validate field bên trong array hoặc nested object. Mỗi `*` khớp với một path segment:
```js
// Validate email for all users in an array...
form.validate('users.*.email');

// Validate all fields in a profile object...
form.validate('profile.*');

// Validate all fields for all users...
form.validate('users.*.*');
```

<a name="customizing-validation-rules"></a>
## Tùy biến validation rule
Bạn có thể tùy biến validation rule chạy trong precognitive request bằng method `isPrecognitive` của request.
Ví dụ, trong form tạo user, có thể chỉ kiểm tra password có bị compromise hay không ở lần submit cuối. Với precognitive request, chỉ cần validate password bắt buộc và tối thiểu 8 ký tự. Method `isPrecognitive` cho phép điều chỉnh rule trong form request:
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    protected function rules()
    {
        return [
            'password' => [
                'required',
                $this->isPrecognitive()
                    ? Password::min(8)
                    : Password::min(8)->uncompromised(),
            ],
            // ...
        ];
    }
}
```

<a name="handling-file-uploads"></a>
## Xử lý file upload
Mặc định, Laravel Precognition không upload hoặc validate file trong precognitive validation request. Điều này tránh upload file lớn nhiều lần không cần thiết.
Vì vậy, hãy [tùy biến validation rule của form request](#customizing-validation-rules) để field file chỉ bắt buộc ở lần submit đầy đủ:
```php
/**
 * Get the validation rules that apply to the request.
 *
 * @return array
 */
protected function rules()
{
    return [
        'avatar' => [
            ...$this->isPrecognitive() ? [] : ['required'],
            'image',
            'mimes:jpg,png',
            'dimensions:ratio=3/2',
        ],
        // ...
    ];
}
```
Nếu muốn đưa file vào mọi validation request, gọi function `validateFiles` trên client-side form instance:
```js
form.validateFiles();
```

<a name="managing-side-effects"></a>
## Quản lý side effect
Khi thêm middleware `HandlePrecognitiveRequests` vào route, hãy xem các middleware *khác* có side effect nào cần bỏ qua trong precognitive request hay không.
Ví dụ, một middleware có thể tăng số "interaction" của user với ứng dụng, nhưng bạn không muốn precognitive request được tính là interaction. Khi đó, kiểm tra `isPrecognitive` trước khi tăng counter:
```php
<?php

namespace App\Http\Middleware;

use App\Facades\Interaction;
use Closure;
use Illuminate\Http\Request;

class InteractionMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        if (! $request->isPrecognitive()) {
            Interaction::incrementFor($request->user());
        }

        return $next($request);
    }
}
```

<a name="testing"></a>
## Testing
Nếu muốn tạo precognitive request trong test, `TestCase` của Laravel có helper `withPrecognition` để thêm request header `Precognition`.
Để assert precognitive request thành công, ví dụ không trả validation error, dùng method `assertSuccessfulPrecognition` trên response:
```php tab=Pest
it('validates registration form with precognition', function () {
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();

    expect(User::count())->toBe(0);
});
```

```php tab=PHPUnit
public function test_it_validates_registration_form_with_precognition()
{
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();
    $this->assertSame(0, User::count());
}
```

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/precognition). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
