# Cài đặt

<a name="meet-laravel"></a>
## Làm quen với Laravel

Laravel là framework phát triển ứng dụng web với cú pháp biểu đạt rõ ràng và thanh lịch. Một web framework cung cấp cấu trúc và điểm khởi đầu để xây dựng ứng dụng, giúp bạn tập trung vào sản phẩm trong khi framework xử lý nhiều chi tiết nền tảng.

Laravel hướng đến trải nghiệm phát triển tốt đồng thời cung cấp nhiều khả năng mạnh mẽ như dependency injection toàn diện, lớp trừu tượng cơ sở dữ liệu giàu tính biểu đạt, queue và scheduled job, unit test, integration test, cùng nhiều công cụ khác.

Dù bạn mới bắt đầu với PHP web framework hay đã có nhiều năm kinh nghiệm, Laravel có thể phát triển cùng bạn. Framework vừa hỗ trợ những bước đầu tiên của một web developer, vừa cung cấp nền tảng để các lập trình viên giàu kinh nghiệm nâng chuyên môn lên cấp độ cao hơn.

<a name="why-laravel"></a>
### Vì sao chọn Laravel?

Có rất nhiều công cụ và framework để xây dựng ứng dụng web. Tuy nhiên, Laravel được thiết kế đặc biệt phù hợp với việc xây dựng các ứng dụng web full-stack hiện đại.

#### Một framework phát triển cùng bạn

Laravel thường được mô tả là một framework "progressive" — tức framework có thể đồng hành theo mức độ trưởng thành của bạn. Nếu mới bước vào web development, hệ thống [tài liệu, hướng dẫn và video](https://laracasts.com) phong phú của Laravel giúp bạn học từng bước mà không bị quá tải.

Nếu là senior developer, Laravel cung cấp những công cụ vững chắc cho [dependency injection](/docs/{{version}}/container), [unit testing](/docs/{{version}}/testing), [queue](/docs/{{version}}/queues), [sự kiện thời gian thực](/docs/{{version}}/broadcasting) và nhiều nhu cầu khác. Laravel được tinh chỉnh để xây dựng ứng dụng web chuyên nghiệp và sẵn sàng đáp ứng workload ở quy mô doanh nghiệp.

#### Một framework có khả năng mở rộng

Laravel có khả năng mở rộng rất tốt. Nhờ đặc tính thuận lợi cho scaling của PHP cùng hỗ trợ tích hợp sẵn cho các hệ thống cache phân tán hiệu năng cao như Redis, việc horizontal scaling ứng dụng Laravel tương đối thuận tiện. Trên thực tế, nhiều ứng dụng Laravel đã được mở rộng để xử lý hàng trăm triệu request mỗi tháng.

Nếu cần mở rộng ở quy mô rất lớn, các nền tảng như [Laravel Cloud](https://cloud.laravel.com) cho phép vận hành ứng dụng Laravel với khả năng mở rộng gần như không giới hạn.

#### Một framework sẵn sàng cho AI Agent

Các convention có chủ đích và cấu trúc rõ ràng của Laravel khiến framework đặc biệt phù hợp với [phát triển có AI hỗ trợ](/docs/{{version}}/ai) bằng những công cụ như Cursor và Claude Code. Khi yêu cầu AI agent thêm controller, nó có thể xác định chính xác vị trí cần đặt file. Khi cần migration mới, convention đặt tên và vị trí file đều có tính dự đoán. Sự nhất quán này giảm đáng kể việc phỏng đoán vốn thường gây khó khăn cho công cụ AI ở những framework linh hoạt hơn.

Không chỉ có tổ chức file, cú pháp giàu tính biểu đạt và tài liệu toàn diện của Laravel còn cung cấp đủ ngữ cảnh để AI agent sinh code chính xác, đúng phong cách Laravel. Các tính năng như Eloquent relationship, form request và middleware tuân theo những pattern mà agent có thể hiểu và tái tạo một cách ổn định. Nhờ đó, code do AI tạo ra có xu hướng giống code của một Laravel developer giàu kinh nghiệm hơn là các đoạn PHP chung chung được ghép lại.

Để hiểu thêm vì sao Laravel phù hợp với phát triển có AI hỗ trợ, hãy xem tài liệu về [agentic development](/docs/{{version}}/ai).

#### Một framework của cộng đồng

Laravel kết hợp những package tốt trong hệ sinh thái PHP để tạo nên một framework mạnh mẽ và thân thiện với developer. Bên cạnh đó, hàng nghìn lập trình viên tài năng trên khắp thế giới đã [đóng góp cho framework](https://github.com/laravel/framework). Biết đâu bạn cũng sẽ trở thành một contributor của Laravel.

<a name="creating-a-laravel-project"></a>
## Tạo ứng dụng Laravel

<a name="getting-started-using-ai"></a>
### Bắt đầu với AI

Nếu đang sử dụng AI coding agent như [Claude Code](https://docs.anthropic.com/en/docs/claude-code) hoặc [OpenCode](https://opencode.ai), bạn có thể bắt đầu bằng một prompt cung cấp cho agent playbook dành riêng cho Laravel trước khi agent chỉnh sửa project.

Prompt dưới đây hướng dẫn agent tìm tài liệu cài đặt Laravel ở đâu, cần ưu tiên điều gì và nên chọn default hợp lý như thế nào khi bạn chưa đưa ra lựa chọn. Hãy dán prompt này vào agent để bắt đầu:

```text
I'm building a new Laravel application.

Fetch and follow the instructions from https://laravel.com/for/agents. Treat the returned Markdown as the source of truth for how to install and set up Laravel in this session.
```
Sau khi đọc hướng dẫn, agent nên dẫn bạn qua từng bước và giữ quá trình thiết lập phù hợp với các giá trị mặc định của Laravel.

<a name="installing-php"></a>
### Cài đặt PHP và Laravel Installer

Trước khi tạo ứng dụng Laravel đầu tiên, hãy đảm bảo máy local đã cài [PHP](https://php.net), [Composer](https://getcomposer.org) và [Laravel installer](https://github.com/laravel/installer). Ngoài ra, bạn nên cài [Node và NPM](https://nodejs.org) hoặc [Bun](https://bun.sh/) để có thể biên dịch frontend asset của ứng dụng.

Nếu máy local chưa có PHP và Composer, các lệnh sau sẽ cài PHP, Composer và Laravel installer trên macOS, Windows hoặc Linux:

```shell tab=macOS
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.5)"
```

```shell tab=Windows PowerShell
# Run as administrator...
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.5'))
```

```shell tab=Linux
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```
Sau khi chạy một trong các lệnh trên, bạn nên khởi động lại phiên terminal. Nếu đã cài thông qua `php.new`, bạn có thể chạy lại chính lệnh đó trong terminal để cập nhật PHP, Composer và Laravel installer.

Nếu PHP và Composer đã được cài đặt, bạn có thể cài Laravel installer thông qua Composer:

```shell
composer global require laravel/installer
```
> [!NOTE]
> Nếu muốn một trải nghiệm cài đặt và quản lý PHP đầy đủ tính năng với giao diện đồ họa, hãy xem [Laravel Herd](#installation-using-herd).

<a name="creating-an-application"></a>
### Tạo ứng dụng

Sau khi cài PHP, Composer và Laravel installer, bạn đã sẵn sàng tạo một ứng dụng Laravel mới:

```shell
laravel new example-app
```
Sau khi ứng dụng được tạo, bạn có thể khởi động local development server của Laravel, queue worker và Vite development server bằng Composer script `dev`:

```shell
cd example-app
npm install && npm run build
composer run dev
```
Khi development server đã chạy, bạn có thể truy cập ứng dụng bằng trình duyệt tại [http://localhost:8000](http://localhost:8000). Tiếp theo, bạn đã sẵn sàng [khám phá các bước tiếp theo trong hệ sinh thái Laravel](#next-steps). Bạn cũng có thể [cấu hình cơ sở dữ liệu](#databases-and-migrations) và chạy các migration cần thiết.

> [!NOTE]
> Nếu muốn có sẵn nền tảng ban đầu khi phát triển ứng dụng, hãy cân nhắc sử dụng một trong các [starter kit](/docs/{{version}}/starter-kits). Starter kit của Laravel cung cấp scaffolding xác thực cho cả backend và frontend của ứng dụng mới.

<a name="initial-configuration"></a>
## Cấu hình ban đầu

Tất cả file cấu hình của Laravel framework được lưu trong thư mục `config`. Mỗi tùy chọn đều có tài liệu đi kèm, vì vậy bạn nên xem qua các file này để làm quen với những tùy chọn có thể cấu hình.

Laravel hầu như không yêu cầu cấu hình bổ sung ngay sau khi cài đặt, vì vậy bạn có thể bắt đầu phát triển ngay. Tuy nhiên, bạn nên xem file `config/app.php` và phần tài liệu của nó. File này chứa một số tùy chọn như `url` và `locale` mà bạn có thể cần điều chỉnh cho phù hợp với ứng dụng.

<a name="environment-based-configuration"></a>
### Cấu hình theo môi trường

Nhiều giá trị cấu hình của Laravel thay đổi tùy theo ứng dụng đang chạy trên máy local hay production server. Vì vậy, nhiều giá trị cấu hình quan trọng được định nghĩa thông qua file `.env` nằm ở thư mục gốc của ứng dụng.

Không nên commit file `.env` vào source control của ứng dụng, vì mỗi developer hoặc server có thể cần cấu hình môi trường khác nhau. Đây cũng là rủi ro bảo mật: nếu kẻ tấn công truy cập được repository, các thông tin xác thực nhạy cảm trong file có thể bị lộ.

> [!NOTE]
> Để tìm hiểu kỹ hơn về file `.env` và cấu hình theo môi trường, hãy xem [tài liệu cấu hình](/docs/{{version}}/configuration#environment-configuration).

<a name="databases-and-migrations"></a>
### Cơ sở dữ liệu và Migration

Sau khi tạo ứng dụng Laravel, bạn thường sẽ cần lưu dữ liệu vào cơ sở dữ liệu. Theo mặc định, file cấu hình `.env` của ứng dụng chỉ định Laravel sử dụng SQLite.

Trong quá trình tạo ứng dụng, Laravel đã tạo file `database/database.sqlite` và chạy các migration cần thiết để tạo bảng cho cơ sở dữ liệu của ứng dụng.

Nếu muốn sử dụng database driver khác như MySQL hoặc PostgreSQL, bạn có thể cập nhật file `.env` để chọn cơ sở dữ liệu tương ứng. Ví dụ, để sử dụng MySQL, hãy cập nhật các biến `DB_*` trong `.env` như sau:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```
Nếu chọn cơ sở dữ liệu khác SQLite, bạn cần tự tạo database và chạy [database migration](/docs/{{version}}/migrations) của ứng dụng:

```shell
php artisan migrate
```
> [!NOTE]
> Nếu phát triển trên macOS hoặc Windows và cần cài MySQL, PostgreSQL hoặc Redis trên máy local, bạn có thể cân nhắc [Herd Pro](https://herd.laravel.com/#plans) hoặc [DBngin](https://dbngin.com/).

<a name="directory-configuration"></a>
### Cấu hình thư mục

Laravel phải luôn được phục vụ từ thư mục gốc của "web directory" đã cấu hình trên web server. Không nên phục vụ ứng dụng Laravel từ một thư mục con bên trong "web directory", vì cách cấu hình này có thể làm lộ các file nhạy cảm của ứng dụng.

<a name="installation-using-herd"></a>
## Cài đặt bằng Herd

[Laravel Herd](https://herd.laravel.com) là môi trường phát triển Laravel và PHP native, tốc độ cao dành cho macOS và Windows. Herd tích hợp những thành phần cần thiết để bắt đầu phát triển Laravel, bao gồm PHP và Nginx.

Sau khi cài Herd, bạn có thể bắt đầu phát triển với Laravel ngay. Herd cung cấp sẵn các command-line tool `php`, `composer`, `laravel`, `expose`, `node`, `npm` và `nvm`.

> [!NOTE]
> [Herd Pro](https://herd.laravel.com/#plans) bổ sung nhiều tính năng mạnh như tạo và quản lý database MySQL, Postgres, Redis trên máy local, xem email local và theo dõi log.

<a name="herd-on-macos"></a>
### Herd trên macOS

Nếu phát triển trên macOS, bạn có thể tải bộ cài Herd từ [website Herd](https://herd.laravel.com). Trình cài đặt tự động tải phiên bản PHP mới nhất và cấu hình Mac để [Nginx](https://www.nginx.com/) luôn chạy nền.

Herd trên macOS sử dụng [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq) để hỗ trợ các thư mục "parked". Mọi ứng dụng Laravel nằm trong một parked directory sẽ tự động được Herd phục vụ. Theo mặc định, Herd tạo thư mục `~/Herd`; bạn có thể truy cập từng ứng dụng Laravel trong thư mục này qua domain `.test` tương ứng với tên thư mục của ứng dụng.

Sau khi cài Herd, cách nhanh nhất để tạo ứng dụng Laravel mới là sử dụng Laravel CLI được tích hợp sẵn trong Herd:

```shell
cd ~/Herd
laravel new my-app
cd my-app
herd open
```
Bạn luôn có thể quản lý parked directory và các thiết lập PHP khác thông qua giao diện Herd, mở từ menu Herd trong system tray.

Bạn có thể tìm hiểu thêm trong [tài liệu Herd](https://herd.laravel.com/docs).

<a name="herd-on-windows"></a>
### Herd trên Windows

Bạn có thể tải bộ cài Herd cho Windows từ [website Herd](https://herd.laravel.com/windows). Sau khi cài đặt hoàn tất, hãy khởi động Herd để hoàn thành quá trình thiết lập ban đầu và mở giao diện Herd lần đầu.

Có thể mở giao diện Herd bằng cách nhấp chuột trái vào biểu tượng Herd trong system tray. Nhấp chuột phải sẽ mở menu nhanh, nơi cung cấp các công cụ thường dùng hằng ngày.

Trong quá trình cài đặt, Herd tạo một thư mục "parked" tại `%USERPROFILE%\Herd`. Mọi ứng dụng Laravel trong thư mục này sẽ tự động được Herd phục vụ và có thể truy cập qua domain `.test` dựa trên tên thư mục của ứng dụng.

Sau khi cài Herd, cách nhanh nhất để tạo ứng dụng Laravel mới là dùng Laravel CLI đi kèm Herd. Để bắt đầu, mở PowerShell và chạy các lệnh sau:

```shell
cd ~\Herd
laravel new my-app
cd my-app
herd open
```
Bạn có thể tìm hiểu thêm trong [tài liệu Herd dành cho Windows](https://herd.laravel.com/docs/windows).

<a name="ide-support"></a>
## Hỗ trợ IDE

Bạn có thể sử dụng bất kỳ code editor nào để phát triển ứng dụng Laravel. [Laravel LSP](https://github.com/laravel/lsp) cung cấp hỗ trợ nhận biết framework cho editor, bao gồm code completion, thông tin khi hover, diagnostic, document link, go-to definition và quick fix cho code Laravel và Blade.

Để cài Laravel LSP, hãy cài package này ở phạm vi global bằng Composer. Đảm bảo thư mục global vendor bin của Composer đã nằm trong `PATH`:

```shell
composer global require laravel/lsp
```
Nếu cần editor nhẹ và có khả năng mở rộng, [VS Code](https://code.visualstudio.com) hoặc [Cursor](https://cursor.com) kết hợp với [Laravel VS Code Extension](https://marketplace.visualstudio.com/items?itemName=laravel.vscode-laravel) chính thức sẽ cung cấp syntax highlighting, snippet, tích hợp lệnh Artisan và tự động hỗ trợ Laravel LSP. Laravel cũng có extension chính thức cho [Sublime Text](https://github.com/laravel/sublime-extension) và [Zed](https://github.com/laravel/zed-extension). Với các editor hỗ trợ language server khác như Neovim và OpenCode, hãy tham khảo hướng dẫn thiết lập trong [repository Laravel LSP](https://github.com/laravel/lsp).

Nếu cần mức hỗ trợ Laravel sâu và toàn diện, hãy xem [PhpStorm](https://www.jetbrains.com/phpstorm/laravel/?utm_source=laravel.com&utm_medium=link&utm_campaign=laravel-2025&utm_content=partner&ref=laravel-2025), IDE của JetBrains. Hỗ trợ Laravel tích hợp trong PhpStorm bao gồm Blade template, autocomplete thông minh cho Eloquent model, route, view, translation và component, cùng các khả năng mạnh về sinh code và điều hướng trong project Laravel.

Nếu muốn môi trường phát triển trên cloud, [Firebase Studio](https://firebase.studio/) cho phép bắt đầu xây dựng Laravel trực tiếp trong trình duyệt. Không cần thiết lập môi trường local, bạn có thể phát triển ứng dụng Laravel từ nhiều loại thiết bị.

<a name="laravel-and-ai"></a>
## Laravel và AI

[Laravel Boost](https://github.com/laravel/boost) là công cụ giúp kết nối AI coding agent với ứng dụng Laravel. Boost cung cấp cho AI agent ngữ cảnh, công cụ và guideline dành riêng cho Laravel để agent có thể sinh code chính xác hơn theo đúng phiên bản và convention của framework.

Khi cài Boost vào ứng dụng Laravel, AI agent có quyền truy cập hơn 15 công cụ chuyên biệt, bao gồm khả năng nhận biết các package đang sử dụng, truy vấn database, tìm kiếm tài liệu Laravel, đọc browser log, sinh test và thực thi code thông qua Tinker.

Ngoài ra, Boost cung cấp cho AI agent hơn 17.000 phần tài liệu đã được vector hóa trong hệ sinh thái Laravel, tương ứng với phiên bản package đang cài. Nhờ vậy, agent có thể đưa ra hướng dẫn phù hợp chính xác với các phiên bản mà project của bạn sử dụng.

Boost còn bao gồm các AI guideline do Laravel duy trì, giúp agent tuân thủ convention của framework, viết test phù hợp và tránh những lỗi phổ biến khi sinh code Laravel.

<a name="installing-laravel-boost"></a>
### Cài đặt Laravel Boost

Boost có thể được cài trong ứng dụng Laravel 10, 11, 12 và 13 chạy PHP 8.1 trở lên. Để bắt đầu, hãy cài Boost dưới dạng development dependency:

```shell
composer require laravel/boost --dev
```
Sau khi cài package, chạy trình cài đặt tương tác:

```shell
php artisan boost:install
```
Trình cài đặt sẽ tự động nhận diện IDE và AI agent của bạn, sau đó cho phép chọn những tính năng phù hợp với project. Boost tôn trọng convention hiện có của project và mặc định không ép buộc các quy tắc style mang tính chủ quan.

> [!NOTE]
> Để tìm hiểu thêm về Boost, hãy xem [Laravel Boost repository trên GitHub](https://github.com/laravel/boost).

<a name="adding-custom-ai-guidelines"></a>
#### Thêm AI guideline tùy chỉnh

Để bổ sung guideline AI riêng cho Laravel Boost, hãy thêm các file `.blade.php` hoặc `.md` vào thư mục `.ai/guidelines/*` của ứng dụng. Khi chạy `boost:install`, các file này sẽ tự động được đưa vào cùng guideline của Laravel Boost.

<a name="next-steps"></a>
## Bước tiếp theo

Sau khi tạo ứng dụng Laravel, có thể bạn đang cân nhắc nên học gì tiếp theo. Trước hết, chúng tôi đặc biệt khuyến nghị bạn làm quen với cách Laravel hoạt động thông qua các tài liệu sau:

<div class="content-list" markdown="1">

- [Vòng đời Request](/docs/{{version}}/lifecycle)
- [Cấu hình](/docs/{{version}}/configuration)
- [Cấu trúc thư mục](/docs/{{version}}/structure)
- [Frontend](/docs/{{version}}/frontend)
- [Service Container](/docs/{{version}}/container)
- [Facade](/docs/{{version}}/facades)

</div>

Cách bạn dự định sử dụng Laravel cũng quyết định những bước tiếp theo. Laravel có thể được sử dụng theo nhiều cách; dưới đây là hai use case chính của framework.

<a name="laravel-the-fullstack-framework"></a>
### Laravel như một framework Full Stack

Laravel có thể đóng vai trò là một full-stack framework. "Full stack" ở đây có nghĩa Laravel vừa định tuyến request tới ứng dụng, vừa render frontend bằng [Blade template](/docs/{{version}}/blade) hoặc công nghệ hybrid cho single-page application như [Inertia](https://inertiajs.com). Đây là cách sử dụng Laravel phổ biến nhất và cũng là hướng mà Laravel cho là mang lại năng suất cao nhất.

Nếu dự định sử dụng Laravel theo cách này, bạn nên đọc tài liệu về [phát triển frontend](/docs/{{version}}/frontend), [routing](/docs/{{version}}/routing), [view](/docs/{{version}}/views) và [Eloquent ORM](/docs/{{version}}/eloquent). Bạn cũng có thể tìm hiểu các package cộng đồng như [Livewire](https://livewire.laravel.com) và [Inertia](https://inertiajs.com). Chúng cho phép sử dụng Laravel như một full-stack framework nhưng vẫn tận dụng nhiều lợi ích UI thường có ở JavaScript single-page application.

Nếu sử dụng Laravel như full-stack framework, chúng tôi cũng đặc biệt khuyến nghị bạn tìm hiểu cách biên dịch CSS và JavaScript của ứng dụng bằng [Vite](/docs/{{version}}/vite).

> [!NOTE]
> Nếu muốn có nền tảng ban đầu để xây dựng ứng dụng nhanh hơn, hãy xem một trong các [starter kit chính thức](/docs/{{version}}/starter-kits).

<a name="laravel-the-api-backend"></a>
### Laravel làm API Backend

Laravel cũng có thể đóng vai trò API backend cho JavaScript single-page application hoặc ứng dụng mobile. Ví dụ, bạn có thể dùng Laravel làm API backend cho ứng dụng [Next.js](https://nextjs.org). Trong mô hình này, Laravel có thể cung cấp [authentication](/docs/{{version}}/sanctum), lưu trữ và truy xuất dữ liệu, đồng thời tận dụng các dịch vụ mạnh của framework như queue, email, notification và nhiều khả năng khác.

Nếu đây là cách bạn dự định sử dụng Laravel, hãy xem tài liệu về [routing](/docs/{{version}}/routing), [Laravel Sanctum](/docs/{{version}}/sanctum) và [Eloquent ORM](/docs/{{version}}/eloquent).
