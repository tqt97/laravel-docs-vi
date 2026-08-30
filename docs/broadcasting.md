# Broadcasting (Phát sóng sự kiện)

- [Giới thiệu](#introduction)
- [Bắt đầu nhanh](#quickstart)
- [Cài đặt phía server](#server-side-installation)
    - [Reverb](#reverb)
    - [Pusher Channels](#pusher-channels)
    - [Ably](#ably)
- [Cài đặt phía client](#client-side-installation)
    - [Reverb](#client-reverb)
    - [Pusher Channels](#client-pusher-channels)
    - [Ably](#client-ably)
- [Tổng quan khái niệm](#concept-overview)
        - [Sử dụng ứng dụng ví dụ](#using-example-application)
- [Định nghĩa broadcast event](#defining-broadcast-events)
        - [Tên broadcast](#broadcast-name)
        - [Dữ liệu broadcast](#broadcast-data)
        - [Broadcast queue](#broadcast-queue)
        - [Điều kiện broadcast](#broadcast-conditions)
        - [Broadcasting và database transaction](#broadcasting-and-database-transactions)
- [Ủy quyền channel](#authorizing-channels)
        - [Định nghĩa authorization callback](#defining-authorization-callbacks)
        - [Định nghĩa channel class](#defining-channel-classes)
- [Broadcast event](#broadcasting-events)
        - [Chỉ broadcast tới người khác](#only-to-others)
        - [Tùy chỉnh connection](#customizing-the-connection)
        - [Event ẩn danh](#anonymous-events)
        - [Xử lý lỗi khi broadcast](#rescuing-broadcasts)
- [Nhận broadcast](#receiving-broadcasts)
        - [Lắng nghe event](#listening-for-events)
        - [Rời channel](#leaving-a-channel)
        - [Namespace](#namespaces)
        - [Sử dụng React, Vue hoặc Svelte](#using-react-or-vue)
- [Presence channel](#presence-channels)
        - [Ủy quyền presence channel](#authorizing-presence-channels)
        - [Tham gia presence channel](#joining-presence-channels)
        - [Broadcast tới presence channel](#broadcasting-to-presence-channels)
- [Model Broadcasting](#model-broadcasting)
        - [Quy ước Model Broadcasting](#model-broadcasting-conventions)
        - [Lắng nghe Model Broadcast](#listening-for-model-broadcasts)
- [Client event](#client-events)
- [Notification](#notifications)

<a name="introduction"></a>
## Giới thiệu

Trong nhiều ứng dụng web hiện đại, WebSocket được sử dụng để xây dựng giao diện người dùng realtime và tự động cập nhật. Khi dữ liệu trên server thay đổi, một thông điệp thường được gửi qua kết nối WebSocket để client xử lý. WebSocket là giải pháp hiệu quả hơn so với việc liên tục polling server của ứng dụng để kiểm tra những thay đổi dữ liệu cần phản ánh lên giao diện.

Ví dụ, giả sử ứng dụng có thể xuất dữ liệu của người dùng thành file CSV và gửi file đó qua email. Tuy nhiên, việc tạo file CSV mất vài phút, vì vậy bạn chọn tạo và gửi CSV trong một [queued job](/docs/{{version}}/queues). Khi CSV đã được tạo và gửi cho người dùng, chúng ta có thể sử dụng event broadcasting để phát một event `App\Events\UserDataExported` cho JavaScript của ứng dụng nhận. Sau khi nhận event, ứng dụng có thể hiển thị thông báo rằng CSV đã được gửi qua email mà người dùng không cần tải lại trang.

Để hỗ trợ xây dựng các tính năng như vậy, Laravel giúp bạn dễ dàng "broadcast" các [event](/docs/{{version}}/events) phía server qua kết nối WebSocket. Broadcasting event của Laravel cho phép ứng dụng Laravel phía server và ứng dụng JavaScript phía client dùng chung tên event và dữ liệu.

Các khái niệm cốt lõi của broadcasting khá đơn giản: client kết nối tới các channel có tên ở frontend, trong khi ứng dụng Laravel broadcast event tới các channel đó ở backend. Các event này có thể chứa bất kỳ dữ liệu bổ sung nào bạn muốn cung cấp cho frontend.

<a name="supported-drivers"></a>
#### Driver được hỗ trợ

Mặc định, Laravel cung cấp ba broadcasting driver phía server để bạn lựa chọn: [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels) và [Ably](https://ably.com).

> [!NOTE]
> Trước khi tìm hiểu sâu về event broadcasting, hãy chắc chắn rằng bạn đã đọc tài liệu Laravel về [event và listener](/docs/{{version}}/events).

<a name="quickstart"></a>
## Bắt đầu nhanh

Mặc định, broadcasting không được bật trong các ứng dụng Laravel mới. Bạn có thể bật broadcasting bằng lệnh Artisan `install:broadcasting`:

```shell
php artisan install:broadcasting
```

Lệnh `install:broadcasting` sẽ hỏi bạn muốn sử dụng dịch vụ event broadcasting nào. Ngoài ra, lệnh sẽ tạo file cấu hình `config/broadcasting.php` và file `routes/channels.php`, nơi bạn có thể đăng ký các route và callback dùng để authorization broadcast của ứng dụng.

Laravel hỗ trợ sẵn nhiều broadcast driver: [Laravel Reverb](/docs/{{version}}/reverb), [Pusher Channels](https://pusher.com/channels), [Ably](https://ably.com), cùng driver `log` dành cho phát triển local và debug. Ngoài ra còn có driver `null`, cho phép tắt broadcasting trong quá trình test. File cấu hình `config/broadcasting.php` có sẵn ví dụ cấu hình cho từng driver này.

Toàn bộ cấu hình event broadcasting của ứng dụng được lưu trong file `config/broadcasting.php`. Nếu file này chưa tồn tại trong ứng dụng thì cũng không cần lo lắng; nó sẽ được tạo khi bạn chạy lệnh Artisan `install:broadcasting`.

<a name="quickstart-next-steps"></a>
#### Bước tiếp theo

Sau khi bật event broadcasting, bạn có thể tìm hiểu thêm về [định nghĩa broadcast event](#defining-broadcast-events) và [lắng nghe event](#listening-for-events). Nếu đang sử dụng [starter kit](/docs/{{version}}/starter-kits) React, Vue hoặc Svelte của Laravel, bạn có thể lắng nghe event bằng [hook useEcho](#using-react-or-vue) của Echo.

> [!NOTE]
> Trước khi broadcast bất kỳ event nào, trước tiên bạn nên cấu hình và chạy một [queue worker](/docs/{{version}}/queues). Toàn bộ event broadcasting được thực hiện thông qua queued job để thời gian phản hồi của ứng dụng không bị ảnh hưởng đáng kể bởi quá trình broadcast event.

<a name="server-side-installation"></a>
## Cài đặt phía server

Để bắt đầu sử dụng event broadcasting của Laravel, chúng ta cần thực hiện một số cấu hình trong ứng dụng Laravel và cài đặt một vài package.

Event broadcasting được thực hiện bởi broadcasting driver phía server, driver này broadcast các Laravel event để Laravel Echo (một thư viện JavaScript) có thể nhận chúng trong browser client. Phần dưới đây sẽ hướng dẫn từng bước của quá trình cài đặt.

<a name="reverb"></a>
### Reverb

Để nhanh chóng bật hỗ trợ các tính năng broadcasting của Laravel khi sử dụng Reverb làm event broadcaster, hãy chạy lệnh Artisan `install:broadcasting` với tùy chọn `--reverb`. Lệnh này sẽ cài các package Composer và NPM cần thiết cho Reverb, đồng thời cập nhật file `.env` của ứng dụng với các biến phù hợp:

```shell
php artisan install:broadcasting --reverb
```

<a name="reverb-manual-installation"></a>
#### Cài đặt thủ công

Khi chạy lệnh `install:broadcasting`, bạn sẽ được hỏi có muốn cài [Laravel Reverb](/docs/{{version}}/reverb) hay không. Bạn cũng có thể cài Reverb thủ công bằng Composer:

```shell
composer require laravel/reverb
```

Sau khi package được cài đặt, bạn có thể chạy lệnh cài đặt của Reverb để publish cấu hình, thêm các environment variable cần thiết cho Reverb và bật event broadcasting trong ứng dụng:

```shell
php artisan reverb:install
```

Bạn có thể xem hướng dẫn chi tiết về cài đặt và sử dụng Reverb trong [tài liệu Reverb](/docs/{{version}}/reverb).

<a name="pusher-channels"></a>
### Pusher Channels

Để nhanh chóng bật hỗ trợ các tính năng broadcasting của Laravel khi sử dụng Pusher làm event broadcaster, hãy chạy lệnh Artisan `install:broadcasting` với tùy chọn `--pusher`. Lệnh Artisan này sẽ yêu cầu thông tin xác thực Pusher, cài đặt các SDK Pusher cho PHP và JavaScript, đồng thời cập nhật file `.env` của ứng dụng với các biến phù hợp:

```shell
php artisan install:broadcasting --pusher
```

<a name="pusher-manual-installation"></a>
#### Cài đặt thủ công

Để cài đặt hỗ trợ Pusher theo cách thủ công, bạn nên cài đặt Pusher Channels PHP SDK bằng trình quản lý package Composer:

```shell
composer require pusher/pusher-php-server
```

Tiếp theo, bạn nên cấu hình thông tin xác thực Pusher Channels trong file cấu hình `config/broadcasting.php`. File này đã bao gồm sẵn một cấu hình Pusher Channels mẫu, cho phép bạn nhanh chóng chỉ định key, secret và application ID. Thông thường, bạn nên cấu hình thông tin xác thực Pusher Channels trong file `.env` của ứng dụng:

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"
```

Cấu hình `pusher` trong file `config/broadcasting.php` cũng cho phép bạn chỉ định thêm các `options` được Channels hỗ trợ, chẳng hạn như cluster.

Sau đó, đặt biến môi trường `BROADCAST_CONNECTION` thành `pusher` trong file `.env` của ứng dụng:

```ini
BROADCAST_CONNECTION=pusher
```

Cuối cùng, bạn đã sẵn sàng cài đặt và cấu hình [Laravel Echo](#client-side-installation), thành phần sẽ nhận các broadcast event ở phía client.

<a name="ably"></a>
### Ably

> [!NOTE]
> Tài liệu dưới đây trình bày cách sử dụng Ably ở chế độ "tương thích Pusher". Tuy nhiên, đội ngũ Ably khuyến nghị và duy trì một broadcaster cùng Echo client có thể tận dụng các khả năng riêng của Ably. Để biết thêm thông tin về việc sử dụng các driver do Ably duy trì, hãy [tham khảo tài liệu Laravel broadcaster của Ably](https://github.com/ably/laravel-broadcaster).

Để nhanh chóng bật hỗ trợ các tính năng broadcasting của Laravel khi sử dụng [Ably](https://ably.com) làm event broadcaster, hãy chạy lệnh Artisan `install:broadcasting` với tùy chọn `--ably`. Lệnh này sẽ yêu cầu thông tin xác thực Ably, cài đặt các SDK Ably cho PHP và JavaScript, đồng thời cập nhật file `.env` của ứng dụng với các biến phù hợp:

```shell
php artisan install:broadcasting --ably
```

**Trước khi tiếp tục, bạn nên bật hỗ trợ giao thức Pusher trong phần cài đặt ứng dụng Ably. Bạn có thể bật tính năng này tại mục "Protocol Adapter Settings" trong dashboard cài đặt của ứng dụng Ably.**

<a name="ably-manual-installation"></a>
#### Cài đặt thủ công

Để cài đặt hỗ trợ Ably theo cách thủ công, bạn nên cài đặt Ably PHP SDK bằng trình quản lý package Composer:

```shell
composer require ably/ably-php
```

Tiếp theo, bạn nên cấu hình thông tin xác thực Ably trong file cấu hình `config/broadcasting.php`. File này đã bao gồm sẵn một cấu hình Ably mẫu, cho phép bạn nhanh chóng chỉ định key. Thông thường, giá trị này nên được thiết lập thông qua [biến môi trường](/docs/{{version}}/configuration#environment-configuration) `ABLY_KEY`:

```ini
ABLY_KEY=your-ably-key
```

Sau đó, đặt biến môi trường `BROADCAST_CONNECTION` thành `ably` trong file `.env` của ứng dụng:

```ini
BROADCAST_CONNECTION=ably
```

Cuối cùng, bạn đã sẵn sàng cài đặt và cấu hình [Laravel Echo](#client-side-installation), thành phần sẽ nhận các broadcast event ở phía client.

<a name="client-side-installation"></a>
## Cài đặt phía client

<a name="client-reverb"></a>
### Reverb

[Laravel Echo](https://github.com/laravel/echo) là một thư viện JavaScript giúp việc subscribe vào các channel và lắng nghe event được broadcast bởi broadcasting driver phía server trở nên đơn giản.

Khi cài đặt Laravel Reverb bằng lệnh Artisan `install:broadcasting`, scaffolding và cấu hình của Reverb cùng Echo sẽ tự động được thêm vào ứng dụng. Tuy nhiên, nếu muốn cấu hình Laravel Echo thủ công, bạn có thể làm theo hướng dẫn bên dưới.

<a name="reverb-client-manual-installation"></a>
#### Cài đặt thủ công

Để cấu hình Laravel Echo thủ công cho frontend của ứng dụng, trước tiên hãy cài package `pusher-js` vì Reverb sử dụng giao thức Pusher cho WebSocket subscription, channel và message:

```shell
npm install --save-dev laravel-echo pusher-js
```

Sau khi Echo được cài đặt, bạn có thể tạo một instance Echo mới trong JavaScript của ứng dụng. Một vị trí phù hợp để thực hiện việc này là cuối file `resources/js/app.js` đi kèm Laravel framework:

```js tab=JavaScript
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

```js tab=React
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "reverb",
    // key: import.meta.env.VITE_REVERB_APP_KEY,
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
});
```

```js tab=Vue
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "reverb",
    // key: import.meta.env.VITE_REVERB_APP_KEY,
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
});
```

```js tab=Svelte
import { configureEcho } from "@laravel/echo-svelte";

configureEcho({
    broadcaster: "reverb",
    // key: import.meta.env.VITE_REVERB_APP_KEY,
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
    // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
});
```

Tiếp theo, bạn nên biên dịch asset của ứng dụng:

```shell
npm run build
```

> [!WARNING]
> Broadcaster `reverb` của Laravel Echo yêu cầu laravel-echo v1.16.0 trở lên.

<a name="client-pusher-channels"></a>
### Pusher Channels

[Laravel Echo](https://github.com/laravel/echo) là một thư viện JavaScript giúp việc subscribe vào các channel và lắng nghe event được broadcast bởi broadcasting driver phía server trở nên đơn giản.

Khi cài đặt hỗ trợ broadcasting bằng lệnh Artisan `install:broadcasting --pusher`, scaffolding và cấu hình của Pusher cùng Echo sẽ tự động được thêm vào ứng dụng. Tuy nhiên, nếu muốn cấu hình Laravel Echo thủ công, bạn có thể làm theo hướng dẫn bên dưới.

<a name="pusher-client-manual-installation"></a>
#### Cài đặt thủ công

Để cấu hình Laravel Echo thủ công cho frontend của ứng dụng, trước tiên hãy cài các package `laravel-echo` và `pusher-js`, vốn sử dụng giao thức Pusher cho WebSocket subscription, channel và message:

```shell
npm install --save-dev laravel-echo pusher-js
```

Sau khi Echo được cài đặt, bạn có thể tạo một instance Echo mới trong file `resources/js/app.js` của ứng dụng:

```js tab=JavaScript
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true
});
```

```js tab=React
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "pusher",
    // key: import.meta.env.VITE_PUSHER_APP_KEY,
    // cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    // forceTLS: true,
    // wsHost: import.meta.env.VITE_PUSHER_HOST,
    // wsPort: import.meta.env.VITE_PUSHER_PORT,
    // wssPort: import.meta.env.VITE_PUSHER_PORT,
    // enabledTransports: ["ws", "wss"],
});
```

```js tab=Vue
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "pusher",
    // key: import.meta.env.VITE_PUSHER_APP_KEY,
    // cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    // forceTLS: true,
    // wsHost: import.meta.env.VITE_PUSHER_HOST,
    // wsPort: import.meta.env.VITE_PUSHER_PORT,
    // wssPort: import.meta.env.VITE_PUSHER_PORT,
    // enabledTransports: ["ws", "wss"],
});
```

```js tab=Svelte
import { configureEcho } from "@laravel/echo-svelte";

configureEcho({
    broadcaster: "pusher",
    // key: import.meta.env.VITE_PUSHER_APP_KEY,
    // cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    // forceTLS: true,
    // wsHost: import.meta.env.VITE_PUSHER_HOST,
    // wsPort: import.meta.env.VITE_PUSHER_PORT,
    // wssPort: import.meta.env.VITE_PUSHER_PORT,
    // enabledTransports: ["ws", "wss"],
});
```

Tiếp theo, bạn nên khai báo các giá trị phù hợp cho những biến môi trường Pusher trong file `.env` của ứng dụng. Nếu các biến này chưa tồn tại trong file `.env`, hãy thêm chúng:

```ini
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

Sau khi điều chỉnh cấu hình Echo theo nhu cầu của ứng dụng, bạn có thể biên dịch asset của ứng dụng:

```shell
npm run build
```

> [!NOTE]
> Để tìm hiểu thêm về cách biên dịch JavaScript asset của ứng dụng, hãy tham khảo tài liệu về [Vite](/docs/{{version}}/vite).

<a name="using-an-existing-client-instance"></a>
#### Sử dụng client instance hiện có

Nếu đã có một Pusher Channels client instance được cấu hình sẵn và muốn Echo sử dụng instance đó, bạn có thể truyền nó cho Echo thông qua tùy chọn cấu hình `client`:

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const options = {
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY
}

window.Echo = new Echo({
    ...options,
    client: new Pusher(options.key, options)
});
```

<a name="client-ably"></a>
### Ably

> [!NOTE]
> Tài liệu dưới đây trình bày cách sử dụng Ably ở chế độ "tương thích Pusher". Tuy nhiên, đội ngũ Ably khuyến nghị và duy trì một broadcaster cùng Echo client có thể tận dụng các khả năng riêng của Ably. Để biết thêm thông tin về việc sử dụng các driver do Ably duy trì, hãy [tham khảo tài liệu Laravel broadcaster của Ably](https://github.com/ably/laravel-broadcaster).

[Laravel Echo](https://github.com/laravel/echo) là một thư viện JavaScript giúp việc subscribe vào các channel và lắng nghe event được broadcast bởi broadcasting driver phía server trở nên đơn giản.

Khi cài đặt hỗ trợ broadcasting bằng lệnh Artisan `install:broadcasting --ably`, scaffolding và cấu hình của Ably cùng Echo sẽ tự động được thêm vào ứng dụng. Tuy nhiên, nếu muốn cấu hình Laravel Echo thủ công, bạn có thể làm theo hướng dẫn bên dưới.

<a name="ably-client-manual-installation"></a>
#### Cài đặt thủ công

Để cấu hình Laravel Echo thủ công cho frontend của ứng dụng, trước tiên hãy cài các package `laravel-echo` và `pusher-js`, vốn sử dụng giao thức Pusher cho WebSocket subscription, channel và message:

```shell
npm install --save-dev laravel-echo pusher-js
```

**Trước khi tiếp tục, bạn nên bật hỗ trợ giao thức Pusher trong phần cài đặt ứng dụng Ably. Bạn có thể bật tính năng này tại mục "Protocol Adapter Settings" trong dashboard cài đặt của ứng dụng Ably.**

Sau khi Echo được cài đặt, bạn có thể tạo một instance Echo mới trong file `resources/js/app.js` của ứng dụng:

```js tab=JavaScript
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    wsHost: 'realtime-pusher.ably.io',
    wsPort: 443,
    disableStats: true,
    encrypted: true,
});
```

```js tab=React
import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "ably",
    // key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    // wsHost: "realtime-pusher.ably.io",
    // wsPort: 443,
    // disableStats: true,
    // encrypted: true,
});
```

```js tab=Vue
import { configureEcho } from "@laravel/echo-vue";

configureEcho({
    broadcaster: "ably",
    // key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    // wsHost: "realtime-pusher.ably.io",
    // wsPort: 443,
    // disableStats: true,
    // encrypted: true,
});
```

```js tab=Svelte
import { configureEcho } from "@laravel/echo-svelte";

configureEcho({
    broadcaster: "ably",
    // key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    // wsHost: "realtime-pusher.ably.io",
    // wsPort: 443,
    // disableStats: true,
    // encrypted: true,
});
```

Bạn có thể nhận thấy cấu hình Ably Echo tham chiếu đến biến môi trường `VITE_ABLY_PUBLIC_KEY`. Giá trị của biến này phải là public key của Ably. Public key là phần trong Ably key nằm trước ký tự `:`.

Sau khi điều chỉnh cấu hình Echo theo nhu cầu, bạn có thể biên dịch asset của ứng dụng:

```shell
npm run dev
```

> [!NOTE]
> Để tìm hiểu thêm về cách biên dịch JavaScript asset của ứng dụng, hãy tham khảo tài liệu về [Vite](/docs/{{version}}/vite).

<a name="concept-overview"></a>
## Tổng quan khái niệm

Event broadcasting của Laravel cho phép bạn broadcast các Laravel event phía server đến ứng dụng JavaScript phía client bằng cách tiếp cận WebSocket dựa trên driver. Hiện tại, Laravel đi kèm các driver [Laravel Reverb](https://reverb.laravel.com), [Pusher Channels](https://pusher.com/channels) và [Ably](https://ably.com). Các event có thể được xử lý dễ dàng ở phía client bằng package JavaScript [Laravel Echo](#client-side-installation).

Event được broadcast qua các "channel", có thể được xác định là public hoặc private. Bất kỳ người truy cập nào cũng có thể subscribe vào public channel mà không cần authentication hay authorization; tuy nhiên, để subscribe vào private channel, người dùng phải được xác thực và được cấp quyền lắng nghe channel đó.

<a name="using-example-application"></a>
### Sử dụng ứng dụng ví dụ

Trước khi đi sâu vào từng thành phần của event broadcasting, hãy xem tổng quan ở mức cao thông qua ví dụ về một cửa hàng thương mại điện tử.

Trong ứng dụng, giả sử chúng ta có một trang cho phép người dùng xem trạng thái vận chuyển của đơn hàng. Đồng thời giả sử event `OrderShipmentStatusUpdated` được phát khi ứng dụng xử lý một cập nhật trạng thái vận chuyển:

```php
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="the-shouldbroadcast-interface"></a>
#### Interface `ShouldBroadcast`

Khi người dùng đang xem một đơn hàng, chúng ta không muốn họ phải refresh trang để thấy các cập nhật trạng thái. Thay vào đó, chúng ta muốn broadcast các cập nhật tới ứng dụng ngay khi chúng được tạo. Vì vậy, cần đánh dấu event `OrderShipmentStatusUpdated` bằng interface `ShouldBroadcast`. Điều này chỉ dẫn Laravel broadcast event khi nó được phát:

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class OrderShipmentStatusUpdated implements ShouldBroadcast
{
    /**
     * The order instance.
     *
     * @var \App\Models\Order
     */
    public $order;
}
```

Interface `ShouldBroadcast` yêu cầu event định nghĩa phương thức `broadcastOn`. Phương thức này chịu trách nhiệm trả về các channel mà event sẽ được broadcast tới. Một stub rỗng của phương thức này đã được định nghĩa sẵn trên các event class được tạo, vì vậy chúng ta chỉ cần bổ sung chi tiết. Chúng ta chỉ muốn người tạo đơn hàng có thể xem cập nhật trạng thái, nên sẽ broadcast event trên một private channel gắn với đơn hàng:

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channel the event should broadcast on.
 */
public function broadcastOn(): Channel
{
    return new PrivateChannel('orders.'.$this->order->id);
}
```

Nếu muốn event được broadcast trên nhiều channel, bạn có thể trả về một `array` thay thế:

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channels the event should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(): array
{
    return [
        new PrivateChannel('orders.'.$this->order->id),
        // ...
    ];
}
```

<a name="example-application-authorizing-channels"></a>
#### Cấp quyền cho channel

Hãy nhớ rằng người dùng phải được cấp quyền để lắng nghe private channel. Chúng ta có thể định nghĩa các quy tắc authorization cho channel trong file `routes/channels.php` của ứng dụng. Trong ví dụ này, cần xác minh rằng bất kỳ người dùng nào cố gắng lắng nghe private channel `orders.1` thực sự là người tạo đơn hàng:

```php
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

Phương thức `channel` nhận hai đối số: tên channel và một callback trả về `true` hoặc `false` để cho biết người dùng có được phép lắng nghe channel hay không.

Mọi authorization callback đều nhận người dùng hiện đang được xác thực làm đối số đầu tiên và các wildcard parameter bổ sung làm các đối số tiếp theo. Trong ví dụ này, placeholder `{orderId}` cho biết phần "ID" của tên channel là một wildcard.

<a name="listening-for-event-broadcasts"></a>
#### Lắng nghe event được broadcast

Tiếp theo, việc còn lại là lắng nghe event trong ứng dụng JavaScript. Chúng ta có thể thực hiện bằng [Laravel Echo](#client-side-installation). Các hook React, Vue và Svelte tích hợp sẵn của Laravel Echo giúp bắt đầu dễ dàng; theo mặc định, tất cả public property của event sẽ được đưa vào event được broadcast:

```js tab=React
import { useEcho } from "@laravel/echo-react";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

<a name="defining-broadcast-events"></a>
## Định nghĩa sự kiện broadcast

Để cho Laravel biết một sự kiện cần được broadcast, bạn phải triển khai interface `Illuminate\Contracts\Broadcasting\ShouldBroadcast` trên lớp sự kiện. Interface này đã được import sẵn vào mọi lớp sự kiện do framework tạo, vì vậy bạn có thể dễ dàng thêm nó vào bất kỳ sự kiện nào.

Interface `ShouldBroadcast` yêu cầu bạn triển khai một phương thức duy nhất: `broadcastOn`. Phương thức `broadcastOn` phải trả về một channel hoặc một mảng channel mà sự kiện sẽ được broadcast tới. Các channel phải là instance của `Channel`, `PrivateChannel` hoặc `PresenceChannel`. Instance của `Channel` đại diện cho public channel mà bất kỳ người dùng nào cũng có thể subscribe, trong khi `PrivateChannel` và `PresenceChannel` đại diện cho private channel yêu cầu [ủy quyền channel](#authorizing-channels):

```php
<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ServerCreated implements ShouldBroadcast
{
    use SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public User $user,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->user->id),
        ];
    }
}
```

Sau khi triển khai interface `ShouldBroadcast`, bạn chỉ cần [phát sự kiện](/docs/{{version}}/events) như bình thường. Khi sự kiện đã được phát, một [queued job](/docs/{{version}}/queues) sẽ tự động broadcast sự kiện bằng broadcast driver mà bạn đã cấu hình.

<a name="broadcast-name"></a>
### Tên broadcast

Theo mặc định, Laravel broadcast sự kiện bằng tên lớp của sự kiện. Tuy nhiên, bạn có thể tùy chỉnh tên broadcast bằng cách định nghĩa phương thức `broadcastAs` trên sự kiện:

```php
/**
 * The event's broadcast name.
 */
public function broadcastAs(): string
{
    return 'server.created';
}
```

Nếu tùy chỉnh tên broadcast bằng phương thức `broadcastAs`, hãy đăng ký listener với ký tự `.` ở đầu. Điều này yêu cầu Echo không thêm namespace của ứng dụng vào trước tên sự kiện:

```javascript
.listen('.server.created', function (e) {
    // ...
});
```

<a name="broadcast-data"></a>
### Dữ liệu broadcast

Khi một sự kiện được broadcast, mọi thuộc tính `public` của nó sẽ tự động được serialize và broadcast dưới dạng payload của sự kiện, cho phép ứng dụng JavaScript truy cập dữ liệu public đó. Ví dụ, nếu sự kiện có một thuộc tính public `$user` chứa Eloquent model, payload broadcast của sự kiện sẽ là:

```json
{
    "user": {
        "id": 1,
        "name": "Patrick Stewart"
        ...
    }
}
```

Tuy nhiên, nếu muốn kiểm soát payload broadcast chi tiết hơn, bạn có thể thêm phương thức `broadcastWith` vào sự kiện. Phương thức này phải trả về mảng dữ liệu mà bạn muốn broadcast làm payload của sự kiện:

```php
/**
 * Get the data to broadcast.
 *
 * @return array<string, mixed>
 */
public function broadcastWith(): array
{
    return ['id' => $this->user->id];
}
```

<a name="broadcast-queue"></a>
### Queue broadcast

Theo mặc định, mỗi sự kiện broadcast được đưa vào queue mặc định của queue connection mặc định được chỉ định trong file cấu hình `queue.php`. Bạn có thể tùy chỉnh queue connection và tên queue mà broadcaster sử dụng bằng các attribute `Connection` và `Queue` trên lớp sự kiện:

```php
use Illuminate\Queue\Attributes\Connection;
use Illuminate\Queue\Attributes\Queue;

#[Connection('redis')]
#[Queue('default')]
class ServerCreated implements ShouldBroadcast
{
    // ...
}
```

Ngoài ra, bạn có thể tùy chỉnh tên queue bằng cách định nghĩa phương thức `broadcastQueue` trên sự kiện:

```php
/**
 * The name of the queue on which to place the broadcasting job.
 */
public function broadcastQueue(): string
{
    return 'default';
}
```

Nếu muốn broadcast sự kiện bằng queue `sync` thay vì queue driver mặc định, bạn có thể triển khai interface `ShouldBroadcastNow` thay cho `ShouldBroadcast`:

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class OrderShipmentStatusUpdated implements ShouldBroadcastNow
{
    // ...
}
```

<a name="broadcast-conditions"></a>
### Điều kiện broadcast

Đôi khi bạn chỉ muốn broadcast sự kiện khi một điều kiện nhất định là đúng. Bạn có thể định nghĩa điều kiện này bằng cách thêm phương thức `broadcastWhen` vào lớp sự kiện:

```php
/**
 * Determine if this event should broadcast.
 */
public function broadcastWhen(): bool
{
    return $this->order->value > 100;
}
```

<a name="broadcasting-and-database-transactions"></a>
#### Broadcast và transaction cơ sở dữ liệu

Khi các sự kiện broadcast được dispatch bên trong transaction cơ sở dữ liệu, queue có thể xử lý chúng trước khi transaction được commit. Khi đó, các cập nhật đối với model hoặc bản ghi trong transaction có thể chưa được phản ánh trong cơ sở dữ liệu. Ngoài ra, các model hoặc bản ghi được tạo trong transaction có thể vẫn chưa tồn tại trong cơ sở dữ liệu. Nếu sự kiện phụ thuộc vào những model này, lỗi ngoài dự kiến có thể xảy ra khi job broadcast sự kiện được xử lý.

Nếu tùy chọn cấu hình `after_commit` của queue connection được đặt thành `false`, bạn vẫn có thể chỉ định rằng một sự kiện broadcast cụ thể chỉ được dispatch sau khi mọi transaction cơ sở dữ liệu đang mở đã commit bằng cách triển khai interface `ShouldDispatchAfterCommit` trên lớp sự kiện:

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Queue\SerializesModels;

class ServerCreated implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use SerializesModels;
}
```

> [!NOTE]
> Để tìm hiểu thêm về cách xử lý các vấn đề này, hãy xem tài liệu về [queued job và database transaction](/docs/{{version}}/queues#jobs-and-database-transactions).

<a name="authorizing-channels"></a>
## Ủy quyền channel

Private channel yêu cầu bạn xác thực rằng người dùng hiện đã đăng nhập thực sự được phép lắng nghe channel. Việc này được thực hiện bằng một HTTP request tới ứng dụng Laravel kèm tên channel, để ứng dụng quyết định người dùng có được phép lắng nghe channel đó hay không. Khi sử dụng [Laravel Echo](#client-side-installation), HTTP request dùng để ủy quyền việc subscribe private channel sẽ được thực hiện tự động.

Khi broadcasting được cài đặt, Laravel sẽ cố gắng tự động đăng ký route `/broadcasting/auth` để xử lý các authorization request. Nếu Laravel không thể tự động đăng ký route này, bạn có thể đăng ký thủ công trong file `/bootstrap/app.php` của ứng dụng:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    channels: __DIR__.'/../routes/channels.php',
    health: '/up',
)
```

<a name="defining-authorization-callbacks"></a>
### Định nghĩa callback ủy quyền

Tiếp theo, chúng ta cần định nghĩa logic để xác định người dùng hiện đang được xác thực có được phép lắng nghe một channel cụ thể hay không. Logic này được đặt trong file `routes/channels.php` do lệnh Artisan `install:broadcasting` tạo ra. Trong file này, bạn có thể sử dụng phương thức `Broadcast::channel` để đăng ký các callback authorization cho channel:

```php
use App\Models\User;

Broadcast::channel('orders.{orderId}', function (User $user, int $orderId) {
    return $user->id === Order::findOrNew($orderId)->user_id;
});
```

Phương thức `channel` nhận hai đối số: tên channel và một callback trả về `true` hoặc `false` để cho biết người dùng có được phép lắng nghe channel hay không.

Mọi authorization callback đều nhận người dùng hiện đang được xác thực làm đối số đầu tiên và các wildcard parameter bổ sung làm các đối số tiếp theo. Trong ví dụ này, placeholder `{orderId}` cho biết phần "ID" của tên channel là một wildcard.

Bạn có thể xem danh sách các broadcast authorization callback của ứng dụng bằng lệnh Artisan `channel:list`:

```shell
php artisan channel:list
```

<a name="authorization-callback-model-binding"></a>
#### Authorization Callback Model Binding

Tương tự HTTP route, channel route cũng có thể tận dụng [route model binding](/docs/{{version}}/routing#route-model-binding) implicit và explicit. Ví dụ, thay vì nhận order ID dạng chuỗi hoặc số, bạn có thể yêu cầu trực tiếp một instance của model `Order`:

```php
use App\Models\Order;
use App\Models\User;

Broadcast::channel('orders.{order}', function (User $user, Order $order) {
    return $user->id === $order->user_id;
});
```

> [!WARNING]
> Không giống HTTP route model binding, channel model binding không hỗ trợ tự động [giới hạn phạm vi implicit model binding](/docs/{{version}}/routing#implicit-model-binding-scoping). Tuy nhiên, điều này hiếm khi gây vấn đề vì hầu hết channel có thể được giới hạn phạm vi dựa trên primary key duy nhất của một model.

<a name="authorization-callback-authentication"></a>
#### Authorization Callback Authentication

Private channel và presence channel xác thực người dùng hiện tại thông qua authentication guard mặc định của ứng dụng. Nếu người dùng chưa được xác thực, authorization cho channel sẽ tự động bị từ chối và callback authorization sẽ không được thực thi. Tuy nhiên, khi cần, bạn có thể chỉ định nhiều custom guard để xác thực request gửi đến:

```php
Broadcast::channel('channel', function () {
    // ...
}, ['guards' => ['web', 'admin']]);
```

<a name="defining-channel-classes"></a>
### Định nghĩa lớp channel

Nếu ứng dụng sử dụng nhiều channel khác nhau, file `routes/channels.php` có thể trở nên cồng kềnh. Thay vì dùng closure để authorize channel, bạn có thể sử dụng channel class. Để tạo channel class, hãy dùng lệnh Artisan `make:channel`. Lệnh này sẽ tạo channel class mới trong thư mục `App/Broadcasting`.

```shell
php artisan make:channel OrderChannel
```

Tiếp theo, đăng ký channel trong file `routes/channels.php`:

```php
use App\Broadcasting\OrderChannel;

Broadcast::channel('orders.{order}', OrderChannel::class);
```

Cuối cùng, bạn có thể đặt logic authorization của channel trong phương thức `join` của channel class. Phương thức `join` này chứa cùng logic mà thông thường bạn sẽ đặt trong closure authorization của channel. Bạn cũng có thể tận dụng channel model binding:

```php
<?php

namespace App\Broadcasting;

use App\Models\Order;
use App\Models\User;

class OrderChannel
{
    /**
     * Create a new channel instance.
     */
    public function __construct() {}

    /**
     * Authenticate the user's access to the channel.
     */
    public function join(User $user, Order $order): array|bool
    {
        return $user->id === $order->user_id;
    }
}
```

> [!NOTE]
> Tương tự nhiều class khác trong Laravel, channel class sẽ tự động được resolve bởi [service container](/docs/{{version}}/container). Vì vậy, bạn có thể type-hint bất kỳ dependency nào mà channel cần trong constructor.

<a name="broadcasting-events"></a>
## Broadcast sự kiện

Sau khi đã định nghĩa event và đánh dấu nó bằng interface `ShouldBroadcast`, bạn chỉ cần kích hoạt event bằng phương thức dispatch của event. Event dispatcher sẽ nhận biết event triển khai `ShouldBroadcast` và đưa event vào queue để broadcast:

```php
use App\Events\OrderShipmentStatusUpdated;

OrderShipmentStatusUpdated::dispatch($order);
```

<a name="only-to-others"></a>
### Chỉ broadcast tới người khác

Khi xây dựng ứng dụng sử dụng event broadcasting, đôi lúc bạn cần broadcast một event tới tất cả subscriber của một channel ngoại trừ người dùng hiện tại. Bạn có thể thực hiện việc này bằng helper `broadcast` và phương thức `toOthers`:

```php
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->toOthers();
```

Để hiểu rõ hơn khi nào nên sử dụng phương thức `toOthers`, hãy hình dung một ứng dụng danh sách công việc nơi người dùng có thể tạo task mới bằng cách nhập tên task. Để tạo task, ứng dụng có thể gửi request tới URL `/task`; endpoint này broadcast việc task được tạo và trả về biểu diễn JSON của task mới. Khi ứng dụng JavaScript nhận response từ endpoint, nó có thể trực tiếp thêm task mới vào danh sách như sau:

```js
axios.post('/task', task)
    .then((response) => {
        this.tasks.push(response.data);
    });
```

Tuy nhiên, hãy nhớ rằng chúng ta cũng broadcast việc task được tạo. Nếu ứng dụng JavaScript đồng thời lắng nghe event này để thêm task vào danh sách, danh sách sẽ xuất hiện task trùng lặp: một task đến từ endpoint và một task đến từ broadcast. Bạn có thể giải quyết bằng phương thức `toOthers` để yêu cầu broadcaster không broadcast event tới người dùng hiện tại.

> [!WARNING]
> Event của bạn phải sử dụng trait `Illuminate\Broadcasting\InteractsWithSockets` để có thể gọi phương thức `toOthers`.

<a name="only-to-others-configuration"></a>
#### Cấu hình

Khi khởi tạo một instance Laravel Echo, connection sẽ được gán một socket ID. Nếu bạn sử dụng instance [Axios](https://github.com/axios/axios) toàn cục để gửi HTTP request từ ứng dụng JavaScript, socket ID sẽ tự động được đính kèm vào mọi request gửi đi dưới dạng header `X-Socket-ID`. Khi bạn gọi `toOthers`, Laravel sẽ lấy socket ID từ header và yêu cầu broadcaster không broadcast tới bất kỳ connection nào có socket ID đó.

Nếu không sử dụng instance Axios toàn cục, bạn cần tự cấu hình ứng dụng JavaScript để gửi header `X-Socket-ID` cùng mọi request gửi đi. Bạn có thể lấy socket ID bằng phương thức `Echo.socketId`:

```js
var socketId = Echo.socketId();
```

<a name="customizing-the-connection"></a>
### Tùy chỉnh connection

Nếu ứng dụng tương tác với nhiều broadcast connection và bạn muốn broadcast event bằng một broadcaster khác với mặc định, có thể chỉ định connection nhận event bằng phương thức `via`:

```php
use App\Events\OrderShipmentStatusUpdated;

broadcast(new OrderShipmentStatusUpdated($update))->via('pusher');
```

Ngoài ra, bạn có thể chỉ định broadcast connection của event bằng cách gọi phương thức `broadcastVia` trong constructor của event. Trước khi thực hiện, hãy bảo đảm event class sử dụng trait `InteractsWithBroadcasting`:

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class OrderShipmentStatusUpdated implements ShouldBroadcast
{
    use InteractsWithBroadcasting;

    /**
     * Create a new event instance.
     */
    public function __construct()
    {
        $this->broadcastVia('pusher');
    }
}
```

<a name="anonymous-events"></a>
### Sự kiện ẩn danh

Đôi khi bạn muốn broadcast một event đơn giản tới frontend mà không cần tạo event class riêng. Để hỗ trợ trường hợp này, facade `Broadcast` cho phép broadcast "anonymous event":

```php
Broadcast::on('orders.'.$order->id)->send();
```

Ví dụ trên sẽ broadcast event sau:

```json
{
    "event": "AnonymousEvent",
    "data": "[]",
    "channel": "orders.1"
}
```

Bạn có thể tùy chỉnh tên và dữ liệu của event bằng các phương thức `as` và `with`:

```php
Broadcast::on('orders.'.$order->id)
    ->as('OrderPlaced')
    ->with($order)
    ->send();
```

Ví dụ trên sẽ broadcast một event như sau:

```json
{
    "event": "OrderPlaced",
    "data": "{ id: 1, total: 100 }",
    "channel": "orders.1"
}
```

Nếu muốn broadcast anonymous event trên private hoặc presence channel, bạn có thể sử dụng các phương thức `private` và `presence`:

```php
Broadcast::private('orders.'.$order->id)->send();
Broadcast::presence('channels.'.$channel->id)->send();
```

Khi broadcast anonymous event bằng phương thức `send`, event sẽ được dispatch tới [queue](/docs/{{version}}/queues) của ứng dụng để xử lý. Tuy nhiên, nếu muốn broadcast event ngay lập tức, bạn có thể sử dụng phương thức `sendNow`:

```php
Broadcast::on('orders.'.$order->id)->sendNow();
```

Để broadcast event tới tất cả subscriber của channel ngoại trừ người dùng hiện đang được xác thực, bạn có thể gọi phương thức `toOthers`:

```php
Broadcast::on('orders.'.$order->id)
    ->toOthers()
    ->send();
```

<a name="rescuing-broadcasts"></a>
### Cứu lỗi khi broadcast

Khi queue server của ứng dụng không khả dụng hoặc Laravel gặp lỗi trong lúc broadcast event, một exception sẽ được ném ra và thường khiến người dùng cuối nhìn thấy lỗi ứng dụng. Vì event broadcasting thường chỉ bổ trợ cho chức năng cốt lõi, bạn có thể ngăn các exception này làm gián đoạn trải nghiệm người dùng bằng cách triển khai interface `ShouldRescue` trên event.

Các event triển khai interface `ShouldRescue` sẽ tự động sử dụng [helper `rescue`](/docs/{{version}}/helpers#method-rescue) của Laravel trong quá trình broadcast. Helper này bắt mọi exception, báo cáo chúng tới exception handler của ứng dụng để ghi log và cho phép ứng dụng tiếp tục thực thi bình thường mà không làm gián đoạn luồng thao tác của người dùng:

```php
<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldRescue;

class ServerCreated implements ShouldBroadcast, ShouldRescue
{
    // ...
}
```

<a name="receiving-broadcasts"></a>
## Nhận broadcast

<a name="listening-for-events"></a>
### Lắng nghe sự kiện

Sau khi [cài đặt và khởi tạo Laravel Echo](#client-side-installation), bạn có thể bắt đầu lắng nghe các event được broadcast từ ứng dụng Laravel. Trước tiên, dùng phương thức `channel` để lấy một channel instance, sau đó gọi `listen` để lắng nghe event được chỉ định:

```js
Echo.channel(`orders.${this.order.id}`)
    .listen('OrderShipmentStatusUpdated', (e) => {
        console.log(e.order.name);
    });
```

Nếu muốn lắng nghe event trên private channel, hãy dùng phương thức `private`. Bạn có thể tiếp tục chain các lời gọi `listen` để lắng nghe nhiều event trên cùng một channel:

```js
Echo.private(`orders.${this.order.id}`)
    .listen(/* ... */)
    .listen(/* ... */)
    .listen(/* ... */);
```

<a name="stop-listening-for-events"></a>
#### Dừng lắng nghe sự kiện

Nếu muốn ngừng lắng nghe một event mà không [rời khỏi channel](#leaving-a-channel), bạn có thể dùng phương thức `stopListening`:

```js
Echo.private(`orders.${this.order.id}`)
    .stopListening('OrderShipmentStatusUpdated');
```

<a name="leaving-a-channel"></a>
### Rời channel

Để rời khỏi một channel, bạn có thể gọi phương thức `leaveChannel` trên instance Echo:

```js
Echo.leaveChannel(`orders.${this.order.id}`);
```

Nếu muốn rời khỏi một channel đồng thời rời cả các private và presence channel liên quan, bạn có thể gọi phương thức `leave`:

```js
Echo.leave(`orders.${this.order.id}`);
```
<a name="namespaces"></a>
### Namespace

Bạn có thể nhận thấy trong các ví dụ trên chúng ta không chỉ định namespace đầy đủ `App\Events` cho các event class. Đó là vì Echo mặc định giả định các event nằm trong namespace `App\Events`. Tuy nhiên, bạn có thể cấu hình root namespace khi khởi tạo Echo bằng option cấu hình `namespace`:

```js
window.Echo = new Echo({
    broadcaster: 'pusher',
    // ...
    namespace: 'App.Other.Namespace'
});
```

Ngoài ra, khi subscribe event bằng Echo, bạn có thể thêm tiền tố `.` vào event class. Cách này cho phép bạn luôn chỉ định tên class đầy đủ namespace:

```js
Echo.channel('orders')
    .listen('.Namespace\\Event\\Class', (e) => {
        // ...
    });
```

<a name="using-react-or-vue"></a>
### Sử dụng React, Vue hoặc Svelte

Laravel Echo cung cấp các hook cho React, Vue và Svelte giúp việc lắng nghe event trở nên đơn giản. Để bắt đầu, hãy gọi hook `useEcho`, được dùng để lắng nghe private event. Hook `useEcho` sẽ tự động rời channel khi component sử dụng hook bị unmount:

```js tab=React
import { useEcho } from "@laravel/echo-react";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);
</script>
```

Bạn có thể lắng nghe nhiều event bằng cách truyền một mảng event cho `useEcho`:

```js
useEcho(
    `orders.${orderId}`,
    ["OrderShipmentStatusUpdated", "OrderShipped"],
    (e) => {
        console.log(e.order);
    },
);
```

Bạn cũng có thể chỉ định cấu trúc dữ liệu payload của broadcast event để tăng type safety và thuận tiện hơn khi chỉnh sửa code:

```ts
type OrderData = {
    order: {
        id: number;
        user: {
            id: number;
            name: string;
        };
        created_at: string;
    };
};

useEcho<OrderData>(`orders.${orderId}`, "OrderShipmentStatusUpdated", (e) => {
    console.log(e.order.id);
    console.log(e.order.user.id);
});
```

Hook `useEcho` sẽ tự động rời channel khi component sử dụng hook bị unmount; tuy nhiên, khi cần bạn có thể sử dụng các function được trả về để chủ động dừng hoặc bắt đầu lắng nghe channel bằng code:

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { leaveChannel, leave, stopListening, listen } = useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);

// Stop listening without leaving channel...
stopListening();

// Start listening again...
listen();

// Leave channel...
leaveChannel();

// Leave a channel and also its associated private and presence channels...
leave();
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { leaveChannel, leave, stopListening, listen } = useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);

// Stop listening without leaving channel...
stopListening();

// Start listening again...
listen();

// Leave channel...
leaveChannel();

// Leave a channel and also its associated private and presence channels...
leave();
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

const { leaveChannel, leave, stopListening, listen } = useEcho(
    `orders.${orderId}`,
    "OrderShipmentStatusUpdated",
    (e) => {
        console.log(e.order);
    },
);

// Stop listening without leaving channel...
stopListening();

// Start listening again...
listen();

// Leave channel...
leaveChannel();

// Leave a channel and also its associated private and presence channels...
leave();
</script>
```

<a name="react-vue-connecting-to-public-channels"></a>
#### Kết nối public channel

Để kết nối tới public channel, bạn có thể sử dụng hook `useEchoPublic`:

```js tab=React
import { useEchoPublic } from "@laravel/echo-react";

useEchoPublic("posts", "PostPublished", (e) => {
    console.log(e.post);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoPublic } from "@laravel/echo-vue";

useEchoPublic("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoPublic } from "@laravel/echo-svelte";

useEchoPublic("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

<a name="react-vue-connecting-to-presence-channels"></a>
#### Kết nối presence channel

Để kết nối tới presence channel, bạn có thể sử dụng hook `useEchoPresence`:

```js tab=React
import { useEchoPresence } from "@laravel/echo-react";

useEchoPresence("posts", "PostPublished", (e) => {
    console.log(e.post);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoPresence } from "@laravel/echo-vue";

useEchoPresence("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoPresence } from "@laravel/echo-svelte";

useEchoPresence("posts", "PostPublished", (e) => {
    console.log(e.post);
});
</script>
```

<a name="react-vue-connection-status"></a>
#### Trạng thái kết nối

Bạn có thể lấy trạng thái kết nối WebSocket hiện tại bằng hook `useConnectionStatus`. Hook này cung cấp trạng thái reactive và tự động cập nhật khi trạng thái kết nối thay đổi:

```js tab=React
import { useConnectionStatus } from "@laravel/echo-react";

function ConnectionIndicator() {
    const status = useConnectionStatus();

    return <div>Connection: {status}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useConnectionStatus } from "@laravel/echo-vue";

const status = useConnectionStatus();
</script>

<template>
    <div>Connection: {{ status }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useConnectionStatus } from "@laravel/echo-svelte";

const status = useConnectionStatus();
</script>

<div>Connection: {status()}</div>
```

Các giá trị trạng thái có thể có:

<div class="content-list" markdown="1">

- `connected` - Đã kết nối thành công tới WebSocket server.
- `connecting` - Đang thực hiện lần kết nối ban đầu.
- `reconnecting` - Đang cố gắng kết nối lại sau khi bị ngắt kết nối.
- `disconnected` - Chưa kết nối và hiện không thử kết nối lại.
- `failed` - Kết nối thất bại và sẽ không thử lại.

</div>

<a name="react-vue-socket-id"></a>
#### Socket ID

Bạn có thể lấy WebSocket socket ID hiện tại bằng hook `useSocketId`. Hook này cung cấp một giá trị reactive và tự động cập nhật khi connection kết nối lại với socket ID mới:

```js tab=React
import { useSocketId } from "@laravel/echo-react";

function SocketIndicator() {
    const socketId = useSocketId();

    return <div>Socket ID: {socketId}</div>;
}
```

```vue tab=Vue
<script setup lang="ts">
import { useSocketId } from "@laravel/echo-vue";

const socketId = useSocketId();
</script>

<template>
    <div>Socket ID: {{ socketId }}</div>
</template>
```

```svelte tab=Svelte
<script>
import { useSocketId } from "@laravel/echo-svelte";

const socketId = useSocketId();
</script>

<div>Socket ID: {socketId()}</div>
```

<a name="presence-channels"></a>
## Presence channel

Presence channel xây dựng trên cơ chế bảo mật của private channel, đồng thời bổ sung khả năng nhận biết những ai đang subscribe channel. Nhờ đó, bạn có thể dễ dàng xây dựng các tính năng cộng tác mạnh mẽ, chẳng hạn thông báo khi người dùng khác đang xem cùng một trang hoặc liệt kê những người đang có mặt trong phòng chat.

<a name="authorizing-presence-channels"></a>
### Phân quyền presence channel

Mọi presence channel cũng đồng thời là private channel; vì vậy người dùng phải được [phân quyền để truy cập](#authorizing-channels). Tuy nhiên, khi định nghĩa authorization callback cho presence channel, bạn không trả về `true` khi người dùng được phép tham gia channel. Thay vào đó, hãy trả về một mảng dữ liệu về người dùng.

Dữ liệu do authorization callback trả về sẽ được cung cấp cho các presence channel event listener trong ứng dụng JavaScript. Nếu người dùng không được phép tham gia presence channel, bạn nên trả về `false` hoặc `null`:

```php
use App\Models\User;

Broadcast::channel('chat.{roomId}', function (User $user, int $roomId) {
    if ($user->canJoinRoom($roomId)) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
```

<a name="joining-presence-channels"></a>
### Tham gia presence channel

Để tham gia presence channel, bạn có thể sử dụng phương thức `join` của Echo. Phương thức `join` trả về một implementation của `PresenceChannel`; ngoài phương thức `listen`, đối tượng này còn cho phép subscribe các event `here`, `joining` và `leaving`.

```js
Echo.join(`chat.${roomId}`)
    .here((users) => {
        // ...
    })
    .joining((user) => {
        console.log(user.name);
    })
    .leaving((user) => {
        console.log(user.name);
    })
    .error((error) => {
        console.error(error);
    });
```

Callback `here` sẽ được thực thi ngay sau khi tham gia channel thành công và nhận một mảng chứa thông tin của tất cả người dùng khác hiện đang subscribe channel. Phương thức `joining` được thực thi khi người dùng mới tham gia channel, còn `leaving` được thực thi khi một người dùng rời channel. Phương thức `error` được thực thi khi authentication endpoint trả về HTTP status code khác 200 hoặc khi có lỗi trong quá trình parse JSON trả về.

<a name="broadcasting-to-presence-channels"></a>
### Broadcast event tới presence channel

Presence channel có thể nhận event giống như public hoặc private channel. Với ví dụ phòng chat, chúng ta có thể muốn broadcast event `NewMessage` tới presence channel của phòng. Để thực hiện, hãy trả về một instance `PresenceChannel` từ phương thức `broadcastOn` của event:

```php
/**
 * Get the channels the event should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(): array
{
    return [
        new PresenceChannel('chat.'.$this->message->room_id),
    ];
}
```

Tương tự các event khác, bạn có thể sử dụng helper `broadcast` và phương thức `toOthers` để loại người dùng hiện tại khỏi danh sách nhận broadcast:

```php
broadcast(new NewMessage($message));

broadcast(new NewMessage($message))->toOthers();
```

Tương tự các loại event khác, bạn có thể lắng nghe event được gửi tới presence channel bằng phương thức `listen` của Echo:

```js
Echo.join(`chat.${roomId}`)
    .here(/* ... */)
    .joining(/* ... */)
    .leaving(/* ... */)
    .listen('NewMessage', (e) => {
        // ...
    });
```

<a name="model-broadcasting"></a>
## Broadcast Model

> [!WARNING]
> Trước khi đọc phần tài liệu về broadcast model bên dưới, bạn nên làm quen với các khái niệm tổng quát về dịch vụ broadcast model của Laravel, cũng như cách tạo và lắng nghe broadcast event theo cách thủ công.

Việc broadcast event khi [Eloquent model](/docs/{{version}}/eloquent) của ứng dụng được tạo, cập nhật hoặc xóa là nhu cầu phổ biến. Bạn có thể thực hiện điều này bằng cách tự [định nghĩa custom event cho các thay đổi trạng thái của Eloquent model](/docs/{{version}}/eloquent#events) và đánh dấu các event đó bằng interface `ShouldBroadcast`.

Tuy nhiên, nếu các event này không được dùng cho mục đích nào khác trong ứng dụng, việc tạo riêng các event class chỉ để broadcast có thể khá rườm rà. Để giải quyết vấn đề này, Laravel cho phép bạn chỉ định để Eloquent model tự động broadcast các thay đổi trạng thái của nó.

Để bắt đầu, Eloquent model của bạn cần sử dụng trait `Illuminate\Database\Eloquent\BroadcastsEvents`. Ngoài ra, model cần định nghĩa phương thức `broadcastOn`, trả về một mảng các channel mà event của model sẽ được broadcast tới:

```php
<?php

namespace App\Models;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\BroadcastsEvents;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use BroadcastsEvents, HasFactory;

    /**
     * Get the user that the post belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the channels that model events should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>
     */
    public function broadcastOn(string $event): array
    {
        return [$this, $this->user];
    }
}
```

Sau khi model sử dụng trait này và định nghĩa các broadcast channel, model sẽ tự động broadcast event khi một instance được tạo, cập nhật, xóa, đưa vào thùng rác hoặc khôi phục.

Ngoài ra, bạn có thể nhận thấy phương thức `broadcastOn` nhận đối số chuỗi `$event`. Đối số này chứa loại event đã xảy ra trên model và có một trong các giá trị `created`, `updated`, `deleted`, `trashed` hoặc `restored`. Bằng cách kiểm tra giá trị của biến này, bạn có thể xác định model nên broadcast tới channel nào (nếu có) đối với từng event cụ thể:

```php
/**
 * Get the channels that model events should broadcast on.
 *
 * @return array<string, array<int, \Illuminate\Broadcasting\Channel|\Illuminate\Database\Eloquent\Model>>
 */
public function broadcastOn(string $event): array
{
    return match ($event) {
        'deleted' => [],
        default => [$this, $this->user],
    };
}
```

<a name="customizing-model-broadcasting-event-creation"></a>
#### Tùy chỉnh việc tạo event broadcast của model

Đôi khi, bạn có thể muốn tùy chỉnh cách Laravel tạo event nền tảng dùng để broadcast model. Bạn có thể thực hiện điều này bằng cách định nghĩa phương thức `newBroadcastableEvent` trên Eloquent model. Phương thức này cần trả về một instance `Illuminate\Database\Eloquent\BroadcastableModelEventOccurred`:

```php
use Illuminate\Database\Eloquent\BroadcastableModelEventOccurred;

/**
 * Create a new broadcastable model event for the model.
 */
protected function newBroadcastableEvent(string $event): BroadcastableModelEventOccurred
{
    return (new BroadcastableModelEventOccurred(
        $this, $event
    ))->dontBroadcastToCurrentUser();
}
```

<a name="model-broadcasting-conventions"></a>
### Broadcast Model Conventions

<a name="model-broadcasting-channel-conventions"></a>
#### Quy ước channel

Như bạn có thể nhận thấy, phương thức `broadcastOn` trong ví dụ model ở trên không trả về các instance `Channel`. Thay vào đó, các Eloquent model được trả về trực tiếp. Nếu phương thức `broadcastOn` trả về một instance Eloquent model (hoặc instance đó nằm trong mảng được phương thức trả về), Laravel sẽ tự động tạo một private channel cho model, sử dụng tên class và giá trị primary key của model làm tên channel.

Vì vậy, model `App\Models\User` có `id` bằng `1` sẽ được chuyển thành instance `Illuminate\Broadcasting\PrivateChannel` có tên `App.Models.User.1`. Ngoài việc trả về các Eloquent model từ phương thức `broadcastOn`, bạn cũng có thể trả về trực tiếp các instance `Channel` để kiểm soát hoàn toàn tên channel của model:

```php
use Illuminate\Broadcasting\PrivateChannel;

/**
 * Get the channels that model events should broadcast on.
 *
 * @return array<int, \Illuminate\Broadcasting\Channel>
 */
public function broadcastOn(string $event): array
{
    return [
        new PrivateChannel('user.'.$this->id)
    ];
}
```

Nếu muốn trả về tường minh một channel instance từ phương thức `broadcastOn` của model, bạn có thể truyền một Eloquent model instance vào constructor của channel. Khi đó, Laravel sẽ sử dụng quy ước channel của model đã trình bày ở trên để chuyển Eloquent model thành chuỗi tên channel:

```php
return [new Channel($this->user)];
```

Nếu cần xác định tên channel của một model, bạn có thể gọi phương thức `broadcastChannel` trên bất kỳ model instance nào. Ví dụ, phương thức này trả về chuỗi `App.Models.User.1` đối với model `App\Models\User` có `id` bằng `1`:

```php
$user->broadcastChannel();
```

<a name="model-broadcasting-event-conventions"></a>
#### Quy ước event

Vì các model broadcast event không gắn với một event "thực" trong thư mục `App\Events` của ứng dụng, tên và payload của chúng được xác định theo quy ước. Laravel sử dụng tên class của model (không gồm namespace) kết hợp với tên model event đã kích hoạt việc broadcast.

Ví dụ, khi model `App\Models\Post` được cập nhật, một event có tên `PostUpdated` sẽ được broadcast tới ứng dụng phía client với payload sau:

```json
{
    "model": {
        "id": 1,
        "title": "My first post"
        ...
    },
    ...
    "socket": "someSocketId"
}
```

Việc xóa model `App\Models\User` sẽ broadcast một event có tên `UserDeleted`.

Nếu muốn, bạn có thể định nghĩa tên broadcast và payload tùy chỉnh bằng cách thêm các phương thức `broadcastAs` và `broadcastWith` vào model. Các phương thức này nhận tên model event / thao tác đang diễn ra, cho phép bạn tùy chỉnh tên event và payload cho từng thao tác trên model. Nếu `broadcastAs` trả về `null`, Laravel sẽ sử dụng quy ước đặt tên model broadcast event đã trình bày ở trên:

```php
/**
 * The model event's broadcast name.
 */
public function broadcastAs(string $event): string|null
{
    return match ($event) {
        'created' => 'post.created',
        default => null,
    };
}

/**
 * Get the data to broadcast for the model.
 *
 * @return array<string, mixed>
 */
public function broadcastWith(string $event): array
{
    return match ($event) {
        'created' => ['title' => $this->title],
        default => ['model' => $this],
    };
}
```

<a name="listening-for-model-broadcasts"></a>
### Lắng nghe broadcast của model

Sau khi thêm trait `BroadcastsEvents` vào model và định nghĩa phương thức `broadcastOn`, bạn có thể bắt đầu lắng nghe các model event được broadcast trong ứng dụng phía client. Trước khi bắt đầu, bạn nên tham khảo tài liệu đầy đủ về [lắng nghe event](#listening-for-events).

Trước tiên, sử dụng phương thức `private` để lấy một channel instance, sau đó gọi `listen` để lắng nghe event cụ thể. Thông thường, tên channel truyền cho `private` cần tuân theo [quy ước broadcast model](#model-broadcasting-conventions) của Laravel.

Sau khi có channel instance, bạn có thể dùng phương thức `listen` để lắng nghe một event cụ thể. Vì model broadcast event không gắn với event "thực" trong thư mục `App\Events` của ứng dụng, [tên event](#model-broadcasting-event-conventions) phải có tiền tố `.` để biểu thị rằng nó không thuộc một namespace cụ thể. Mỗi model broadcast event có thuộc tính `model` chứa tất cả thuộc tính của model có thể được broadcast:

```js
Echo.private(`App.Models.User.${this.user.id}`)
    .listen('.UserUpdated', (e) => {
        console.log(e.model);
    });
```

<a name="model-broadcasts-with-react-or-vue"></a>
#### Sử dụng React, Vue hoặc Svelte

Nếu đang sử dụng React, Vue hoặc Svelte, bạn có thể dùng hook `useEchoModel` đi kèm Laravel Echo để dễ dàng lắng nghe broadcast của model:

```js tab=React
import { useEchoModel } from "@laravel/echo-react";

useEchoModel("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoModel } from "@laravel/echo-vue";

useEchoModel("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoModel } from "@laravel/echo-svelte";

useEchoModel("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model);
});
</script>
```

Bạn cũng có thể chỉ định cấu trúc dữ liệu payload của model event để tăng type safety và thuận tiện hơn khi chỉnh sửa code:

```ts
type User = {
    id: number;
    name: string;
    email: string;
};

useEchoModel<User, "App.Models.User">("App.Models.User", userId, ["UserUpdated"], (e) => {
    console.log(e.model.id);
    console.log(e.model.name);
});
```

<a name="client-events"></a>
## Client Event

> [!NOTE]
> Khi sử dụng [Pusher Channels](https://pusher.com/channels), bạn phải bật tùy chọn "Client Events" trong phần "App Settings" của [dashboard ứng dụng](https://dashboard.pusher.com/) để có thể gửi client event.

Đôi khi, bạn có thể muốn broadcast event tới các client đang kết nối khác mà không cần gửi request tới ứng dụng Laravel. Điều này đặc biệt hữu ích với các tính năng như thông báo "đang nhập", khi bạn muốn báo cho người dùng biết một người khác đang nhập nội dung trên màn hình hiện tại.

Để broadcast client event, bạn có thể sử dụng phương thức `whisper` của Echo:

```js tab=JavaScript
Echo.private(`chat.${roomId}`)
    .whisper('typing', {
        name: this.user.name
    });
```

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().whisper('typing', { name: user.name });
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().whisper('typing', { name: user.name });
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().whisper('typing', { name: user.name });
</script>
```

Để lắng nghe client event, bạn có thể sử dụng phương thức `listenForWhisper`:

```js tab=JavaScript
Echo.private(`chat.${roomId}`)
    .listenForWhisper('typing', (e) => {
        console.log(e.name);
    });
```

```js tab=React
import { useEcho } from "@laravel/echo-react";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().listenForWhisper('typing', (e) => {
    console.log(e.name);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEcho } from "@laravel/echo-vue";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().listenForWhisper('typing', (e) => {
    console.log(e.name);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEcho } from "@laravel/echo-svelte";

const { channel } = useEcho(`chat.${roomId}`, ['update'], (e) => {
    console.log('Chat event received:', e);
});

channel().listenForWhisper('typing', (e) => {
    console.log(e.name);
});
</script>
```

<a name="notifications"></a>
## Notification

Bằng cách kết hợp event broadcasting với [notification](/docs/{{version}}/notifications), ứng dụng JavaScript có thể nhận notification mới ngay khi chúng xuất hiện mà không cần tải lại trang. Trước khi bắt đầu, hãy đọc tài liệu về cách sử dụng [broadcast notification channel](/docs/{{version}}/notifications#broadcast-notifications).

Sau khi cấu hình notification sử dụng broadcast channel, bạn có thể lắng nghe các broadcast event bằng phương thức `notification` của Echo. Hãy nhớ rằng tên channel phải khớp với tên class của entity nhận notification:

```js tab=JavaScript
Echo.private(`App.Models.User.${userId}`)
    .notification((notification) => {
        console.log(notification.type);
    });
```

```js tab=React
import { useEchoModel } from "@laravel/echo-react";

const { channel } = useEchoModel('App.Models.User', userId);

channel().notification((notification) => {
    console.log(notification.type);
});
```

```vue tab=Vue
<script setup lang="ts">
import { useEchoModel } from "@laravel/echo-vue";

const { channel } = useEchoModel('App.Models.User', userId);

channel().notification((notification) => {
    console.log(notification.type);
});
</script>
```

```svelte tab=Svelte
<script>
import { useEchoModel } from "@laravel/echo-svelte";

const { channel } = useEchoModel('App.Models.User', userId);

channel().notification((notification) => {
    console.log(notification.type);
});
</script>
```

Trong ví dụ này, mọi notification được gửi tới các instance `App\Models\User` qua channel `broadcast` sẽ được callback nhận. Callback authorization cho channel `App.Models.User.{id}` được định nghĩa trong file `routes/channels.php` của ứng dụng.

<a name="stop-listening-for-notifications"></a>
#### Dừng lắng nghe notification

Nếu muốn dừng lắng nghe notification mà không [rời channel](#leaving-a-channel), bạn có thể sử dụng phương thức `stopListeningForNotification`:

```js
const callback = (notification) => {
    console.log(notification.type);
}

// Start listening...
Echo.private(`App.Models.User.${userId}`)
    .notification(callback);

// Stop listening (callback must be the same)...
Echo.private(`App.Models.User.${userId}`)
    .stopListeningForNotification(callback);
```

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/broadcasting). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
