# Laravel Boost

<a name="introduction"></a>
## Giới thiệu

Laravel Boost tăng tốc quá trình phát triển có AI hỗ trợ bằng cách cung cấp các guideline thiết yếu và agent skill giúp AI agent viết ứng dụng Laravel chất lượng cao, tuân theo các best practice của Laravel.

Boost cũng cung cấp một API tài liệu mạnh mẽ cho hệ sinh thái Laravel, kết hợp MCP tool tích hợp sẵn với kho kiến thức mở rộng chứa hơn 17.000 mục thông tin dành riêng cho Laravel. Tất cả được tăng cường bằng khả năng tìm kiếm ngữ nghĩa sử dụng embedding để trả về kết quả chính xác và phù hợp ngữ cảnh. Boost hướng dẫn các AI agent như Claude Code và Cursor sử dụng API này để tìm hiểu các tính năng Laravel mới nhất và các best practice.

<a name="installation"></a>
## Cài đặt

Có thể cài đặt Laravel Boost thông qua Composer:

```shell
composer require laravel/boost --dev
```

Tiếp theo, hãy cài đặt MCP server và các coding guideline:

```shell
php artisan boost:install
```

Lệnh `boost:install` sẽ tạo các file agent guideline và skill phù hợp cho những coding agent bạn đã chọn trong quá trình cài đặt.

Sau khi Laravel Boost được cài đặt, bạn đã sẵn sàng bắt đầu lập trình với Cursor, Claude Code hoặc AI agent mà bạn lựa chọn.

> [!NOTE]
> Bạn có thể thêm file cấu hình MCP được tạo (`.mcp.json`), các file guideline (`CLAUDE.md`, `AGENTS.md`, `junie/`, v.v.) và file cấu hình `boost.json` vào `.gitignore` của ứng dụng, vì các file này sẽ tự động được tạo lại khi chạy `boost:install` và `boost:update`.

<a name="set-up-your-agents"></a>
### Thiết lập agent

```text tab=Cursor
1. Open the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Press `enter` on "/open MCP Settings"
3. Turn the toggle on for `laravel-boost`
```

```text tab=Claude Code
Claude Code support is typically enabled automatically. If you find it isn't, open a shell in the project's directory and run the following command:

claude mcp add -s local -t stdio laravel-boost php artisan boost:mcp
```

```text tab=Codex
Codex support is typically enabled automatically. If you find it isn't, open a shell in the project's directory and run the following command:

codex mcp add laravel-boost -- php "artisan" "boost:mcp"
```

```text tab=Gemini CLI
Gemini CLI support is typically enabled automatically. If you find it isn't, open a shell in the project's directory and run the following command:

gemini mcp add -s project -t stdio laravel-boost php artisan boost:mcp
```

```text tab=GitHub Copilot (VS Code)
1. Open the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Press `enter` on "MCP: List Servers"
3. Arrow to `laravel-boost` and press `enter`
4. Choose "Start server"
```

```text tab=Junie
1. Press `shift` twice to open the command palette
2. Search "MCP Settings" and press `enter`
3. Check the box next to `laravel-boost`
4. Click "Apply" at the bottom right
```

<a name="keeping-boost-resources-updated"></a>
### Luôn cập nhật tài nguyên Boost

Bạn nên cập nhật định kỳ các tài nguyên Boost cục bộ (AI guideline và skill) để bảo đảm chúng phản ánh phiên bản mới nhất của các package thuộc hệ sinh thái Laravel mà bạn đã cài đặt. Để thực hiện, hãy dùng lệnh Artisan `boost:update`.

```shell
php artisan boost:update
```

Bạn cũng có thể tự động hóa quá trình này bằng cách thêm lệnh vào script Composer `post-update-cmd`:

```json
{
  "scripts": {
    "post-update-cmd": [
      "@php artisan boost:update --ansi"
    ]
  }
}
```

Theo mặc định, lệnh `boost:update` chỉ cập nhật các tài nguyên Boost hiện có đã được publish trong ứng dụng. Nếu muốn Boost quét ứng dụng để tìm các package mới cài đặt và đề xuất publish guideline cùng skill tương ứng, bạn có thể sử dụng tùy chọn `--discover`:

```shell
php artisan boost:update --discover
```

<a name="mcp-server"></a>
## MCP Server

Laravel Boost cung cấp một MCP (Model Context Protocol) server, expose các tool để AI agent tương tác với ứng dụng Laravel. Những tool này cho phép agent kiểm tra cấu trúc ứng dụng, truy vấn cơ sở dữ liệu, thực thi code và nhiều tác vụ khác.

<a name="available-mcp-tools"></a>
### Các MCP tool có sẵn

<div class="overflow-auto">

| Tên                  | Ghi chú                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| Application Info     | Đọc phiên bản PHP và Laravel, database engine, danh sách package hệ sinh thái kèm phiên bản và các model Eloquent |
| Browser Logs         | Đọc log và lỗi từ trình duyệt                                                                                |
| Database Connections | Kiểm tra các kết nối cơ sở dữ liệu khả dụng, bao gồm kết nối mặc định                                        |
| Database Query       | Thực thi truy vấn trên cơ sở dữ liệu                                                                         |
| Database Schema      | Đọc schema cơ sở dữ liệu                                                                                     |
| Get Absolute URL     | Chuyển URI đường dẫn tương đối thành tuyệt đối để agent tạo URL hợp lệ                                       |
| Last Error           | Đọc lỗi gần nhất từ các file log của ứng dụng                                                                |
| Read Log Entries     | Đọc N mục log gần nhất                                                                                       |
| Record Rule          | Ghi một [quy tắc dự án](#project-rules) bền vững vào `.ai/rules` để các agent sau kế thừa                    |
| Search Docs          | Truy vấn dịch vụ API tài liệu do Laravel lưu trữ để lấy tài liệu dựa trên các package đã cài đặt             |

</div>

<a name="manually-registering-the-mcp-server"></a>
### Đăng ký MCP server thủ công

Đôi khi bạn có thể cần đăng ký Laravel Boost MCP server thủ công với editor mình sử dụng. Hãy đăng ký MCP server với các thông tin sau:

<table>
<tr><td><strong>Lệnh</strong></td><td><code>php</code></td></tr>
<tr><td><strong>Đối số</strong></td><td><code>artisan boost:mcp</code></td></tr>
</table>

Ví dụ JSON:

```json
{
    "mcpServers": {
        "laravel-boost": {
            "command": "php",
            "args": ["artisan", "boost:mcp"]
        }
    }
}
```

<a name="ai-guidelines"></a>
## AI Guideline

AI guideline là các file chỉ dẫn có thể kết hợp với nhau, được nạp ngay từ đầu để cung cấp cho AI agent ngữ cảnh thiết yếu về các package trong hệ sinh thái Laravel. Những guideline này chứa các convention cốt lõi, best practice và pattern đặc thù của framework, giúp agent tạo code nhất quán và chất lượng cao.

<a name="available-ai-guidelines"></a>
### AI guideline có sẵn

Laravel Boost bao gồm AI guideline cho các package và framework sau. Guideline `core` cung cấp hướng dẫn tổng quát cho AI về package tương ứng và có thể áp dụng cho mọi phiên bản.

<div class="overflow-auto">

| Package           | Phiên bản được hỗ trợ |
| ----------------- | ---------------------- |
| Core & Boost      | core                   |
| Laravel Framework | core, 10.x, 11.x, 12.x, 13.x |
| Livewire          | core, 2.x, 3.x, 4.x    |
| Flux UI           | core, free, pro        |
| Folio             | core                   |
| Herd              | core                   |
| Inertia Laravel   | core, 1.x, 2.x, 3.x    |
| Inertia React     | core, 1.x, 2.x, 3.x    |
| Inertia Vue       | core, 1.x, 2.x, 3.x    |
| Inertia Svelte    | core, 1.x, 2.x, 3.x    |
| MCP               | core                   |
| Pennant           | core                   |
| Pest              | core, 3.x, 4.x         |
| PHPUnit           | core                   |
| Pint              | core                   |
| Sail              | core                   |
| Tailwind CSS      | core, 3.x, 4.x         |
| Livewire Volt     | core                   |
| Wayfinder         | core                   |
| Enforce Tests     | conditional            |

</div>

> **Lưu ý:** Để luôn cập nhật AI guideline, hãy xem phần [Luôn cập nhật tài nguyên Boost](#keeping-boost-resources-updated).

<a name="adding-custom-ai-guidelines"></a>
### Thêm AI guideline tùy chỉnh

Để bổ sung AI guideline tùy chỉnh của riêng bạn vào Laravel Boost, hãy thêm các file `.blade.php` hoặc `.md` vào thư mục `.ai/guidelines/*` của ứng dụng. Các file này sẽ tự động được đưa vào cùng guideline của Laravel Boost khi bạn chạy `boost:install`.

<a name="overriding-boost-ai-guidelines"></a>
### Ghi đè AI guideline của Boost

Bạn có thể ghi đè AI guideline tích hợp sẵn của Boost bằng cách tạo guideline tùy chỉnh có đường dẫn file tương ứng. Khi guideline tùy chỉnh trùng với đường dẫn của một guideline hiện có trong Boost, Boost sẽ sử dụng phiên bản tùy chỉnh của bạn thay cho phiên bản tích hợp sẵn.

Ví dụ, để ghi đè guideline "Inertia React v2 Form Guidance" của Boost, hãy tạo file tại `.ai/guidelines/inertia-react/2/forms.blade.php`. Khi chạy `boost:install`, Boost sẽ sử dụng guideline tùy chỉnh của bạn thay cho guideline mặc định.

<a name="third-party-package-ai-guidelines"></a>
### AI guideline cho package bên thứ ba

Nếu bạn duy trì một package bên thứ ba và muốn Boost bao gồm AI guideline cho package đó, hãy thêm file `resources/boost/guidelines/core.blade.php` vào package. Khi người dùng package chạy `php artisan boost:install`, Boost sẽ tự động nạp guideline của bạn.

AI guideline nên cung cấp phần tổng quan ngắn về chức năng của package, mô tả cấu trúc file hoặc convention bắt buộc, đồng thời giải thích cách tạo hoặc sử dụng các tính năng chính (kèm command hoặc code snippet ví dụ). Hãy giữ guideline súc tích, có thể áp dụng trực tiếp và tập trung vào best practice để AI có thể tạo code chính xác cho người dùng. Ví dụ:

```php
## Package Name

This package provides [brief description of functionality].

### Features

- Feature 1: [clear & short description].
- Feature 2: [clear & short description]. Example usage:

@verbatim
<code-snippet name="How to use Feature 2" lang="php">
$result = PackageName::featureTwo($param1, $param2);
</code-snippet>
@endverbatim
```

<a name="agent-skills"></a>
## Agent Skill

[Agent Skill](https://agentskills.io/home) là các module kiến thức gọn nhẹ, có mục tiêu cụ thể mà agent có thể kích hoạt theo nhu cầu khi làm việc trong từng domain. Khác với guideline được nạp ngay từ đầu, skill chỉ nạp các pattern chi tiết và best practice khi có liên quan, nhờ đó giảm context dư thừa và tăng độ phù hợp của code do AI tạo ra.

Khi chạy `boost:install` và chọn skill làm một tính năng, các skill sẽ tự động được cài dựa trên những package được phát hiện trong `composer.json`. Ví dụ, nếu project có `livewire/livewire`, skill `livewire-development` sẽ tự động được cài. Các skill đi kèm Boost, chẳng hạn `infer-conventions`, được cài bất kể project đang có package nào.

<a name="available-skills"></a>
### Skill có sẵn

<div class="overflow-auto">

| Skill                      | Package        |
| -------------------------- | -------------- |
| fluxui-development         | Flux UI        |
| folio-routing              | Folio          |
| infer-conventions          | Boost          |
| inertia-react-development  | Inertia React  |
| inertia-svelte-development | Inertia Svelte |
| inertia-vue-development    | Inertia Vue    |
| livewire-development       | Livewire       |
| mcp-development            | MCP            |
| pennant-development        | Pennant        |
| pest-testing               | Pest           |
| tailwindcss-development    | Tailwind CSS   |
| volt-development           | Volt           |
| wayfinder-development      | Wayfinder      |

</div>

> **Lưu ý:** Để luôn cập nhật skill, hãy xem phần [Luôn cập nhật tài nguyên Boost](#keeping-boost-resources-updated).

<a name="custom-skills"></a>
### Skill tùy chỉnh

Để tạo skill tùy chỉnh, hãy thêm file `SKILL.md` vào thư mục `.ai/skills/{skill-name}/` của ứng dụng. Khi chạy `boost:update`, skill tùy chỉnh sẽ được cài cùng các skill tích hợp sẵn của Boost.

Ví dụ, để tạo một skill tùy chỉnh cho domain logic của ứng dụng:

```
.ai/skills/creating-invoices/SKILL.md
```

<a name="overriding-skills"></a>
### Ghi đè skill

Bạn có thể ghi đè skill tích hợp sẵn của Boost bằng cách tạo skill tùy chỉnh có cùng tên. Khi skill tùy chỉnh trùng tên với một skill hiện có của Boost, Boost sẽ sử dụng phiên bản tùy chỉnh thay cho phiên bản tích hợp sẵn.

Ví dụ, để ghi đè skill `livewire-development` của Boost, hãy tạo file `.ai/skills/livewire-development/SKILL.md`. Khi chạy `boost:update`, Boost sẽ sử dụng skill tùy chỉnh của bạn thay cho skill mặc định.

<a name="third-party-package-skills"></a>
### Skill cho package bên thứ ba

Nếu bạn duy trì package bên thứ ba và muốn Boost bao gồm skill cho package đó, hãy thêm file `resources/boost/skills/{skill-name}/SKILL.md` vào package. Khi người dùng chạy `php artisan boost:install`, Boost sẽ tự động cài skill của bạn dựa trên lựa chọn của người dùng.

Boost Skill hỗ trợ [định dạng Agent Skills](https://agentskills.io/what-are-skills) và nên được tổ chức thành một thư mục chứa file `SKILL.md` với YAML frontmatter và hướng dẫn Markdown. File `SKILL.md` bắt buộc phải có frontmatter `name` và `description`, đồng thời có thể tùy chọn kèm script, template và tài liệu tham khảo.

Skill nên mô tả cấu trúc file hoặc convention bắt buộc và giải thích cách tạo hoặc sử dụng các tính năng chính (kèm command hoặc code snippet ví dụ). Hãy giữ nội dung súc tích, có thể áp dụng trực tiếp và tập trung vào best practice để AI tạo code chính xác cho người dùng:

```markdown
---
name: package-name-development
description: Build and work with PackageName features, including components and workflows.
---

# Package Name Development

## Khi nào nên sử dụng skill này
Use this skill when working with PackageName features...

## Features

- Feature 1: [clear & short description].
- Feature 2: [clear & short description]. Example usage:

$result = PackageName::featureTwo($param1, $param2);
```

<a name="guidelines-vs-skills"></a>
## Guideline và Skill

Laravel Boost cung cấp hai cách riêng biệt để cung cấp cho AI agent ngữ cảnh về ứng dụng: **guideline** và **skill**.

**Guideline** được nạp ngay khi AI agent khởi động, cung cấp ngữ cảnh thiết yếu về convention và best practice của Laravel có thể áp dụng rộng khắp codebase.

**Skill** được kích hoạt theo nhu cầu khi xử lý các tác vụ cụ thể và chứa pattern chi tiết cho từng domain, chẳng hạn component Livewire hoặc test Pest. Chỉ nạp skill khi có liên quan giúp giảm context dư thừa và cải thiện chất lượng code.

<div class="overflow-auto">

| Khía cạnh   | Guideline                          | Skill                             |
| ----------- | --------------------------------- | -------------------------------- |
| **Thời điểm nạp** | Nạp từ đầu, luôn hiện diện | Theo nhu cầu, khi có liên quan |
| **Phạm vi** | Rộng, mang tính nền tảng | Tập trung, theo từng tác vụ |
| **Mục đích** | Convention cốt lõi và best practice | Pattern triển khai chi tiết |

</div>

Cả guideline và skill đều mô tả hệ sinh thái Laravel. Để ghi lại convention riêng của ứng dụng, bạn nên sử dụng [quy tắc dự án](#project-rules).

<a name="project-rules"></a>
## Quy tắc dự án

Trong khi guideline và skill hướng dẫn agent cách viết Laravel, quy tắc dự án hướng dẫn chúng cách viết chính ứng dụng của bạn. Một quy tắc có thể là bất kỳ điều gì mà nếu không ghi lại, bạn sẽ phải giải thích lại trong mỗi session mới:

<div class="content-list" markdown="1">

- Các quyết định được đưa ra trong quá trình phát triển bởi bạn, agent hoặc đồng đội.
- Quy chuẩn style và preference mà agent khó tự tuân thủ nhất quán.
- Các bẫy và ràng buộc không thể suy luận từ code xung quanh.

</div>

Các quy tắc được lưu dưới dạng file Markdown trong thư mục `.ai/rules` của ứng dụng và nên được commit vào source control. Khác với memory riêng của agent vốn mang tính cá nhân và chỉ tồn tại trong phạm vi session, các quy tắc này được chia sẻ với cả team và mọi agent làm việc trên ứng dụng.

Mỗi file quy tắc khai báo các file glob mà nó áp dụng trong frontmatter:

```markdown
---
paths:
  - app/Http/Controllers/**
---

# Http Controllers

## Mở rộng BaseController để giới hạn theo tenant

All controllers must extend `App\Http\Controllers\BaseController`, which applies the
current tenant's query scope. Extending Laravel's base controller directly will leak
data across tenants.
```

Ngoài ra, Boost duy trì file `.ai/rules/index.md` để ánh xạ glob tới các file quy tắc tương ứng. Agent được hướng dẫn kiểm tra index này trước khi lập kế hoạch hoặc chỉnh sửa file, nhờ đó một quy tắc chỉ được nạp khi có liên quan:

```markdown
# Project Rules Index

Before planning or editing, find the row whose globs match the file's path and read that rule file.

| Applies to | Rule file |
| --- | --- |
| app/Http/Controllers/** | .ai/rules/controllers.md |
| app/Models/** | .ai/rules/models.md |
```

> [!NOTE]
> Khác với `.mcp.json` và các file guideline được tạo tự động, thư mục `.ai/rules` nên được commit vào source control để các quy tắc được chia sẻ với team.

<a name="recording-rules"></a>
### Ghi lại quy tắc

Để ghi lại một quy tắc, bạn chỉ cần yêu cầu agent ghi nhớ nó:

```text
Remember that all money values are stored as integer cents, never as floats.
```

Agent sẽ gọi MCP tool `record-rule` của Boost với một `glob`, `title` ngắn và `note`. Sau đó Boost sẽ lưu quy tắc vào khu vực phù hợp, tạo file quy tắc nếu cần và cập nhật index.

Bạn nên luôn ghi quy tắc bằng tool `record-rule` thay vì tự tạo file quy tắc thủ công. Boost tạo lại `.ai/rules/index.md` trong quá trình ghi quy tắc và agent dựa vào index này để xác định quy tắc nào áp dụng cho file đang xử lý. File quy tắc được thêm thủ công sẽ không được phát hiện cho đến lần tiếp theo index được tạo lại.

<a name="inferring-your-applications-conventions"></a>
### Suy luận convention của ứng dụng

Ghi từng quy tắc một là cách phù hợp cho các thay đổi về sau; tuy nhiên, một ứng dụng hiện hữu có thể đã chứa nhiều năm convention. Skill `infer-conventions` sẽ khởi tạo bộ quy tắc từ code bạn đã viết. Để bắt đầu, hãy yêu cầu agent sử dụng skill:

```text
Use the infer-conventions skill
```

Skill sẽ quét ứng dụng theo checklist các khía cạnh convention của Laravel, gồm validation, controller, authorization, model, architecture, testing, frontend, database và console; sau đó thực hiện một lượt mở rộng để tìm các pattern như base class, shared trait và module layout.

Skill ghi lại những gì code thực tế đang làm thay vì những gì code nên làm. Nó chỉ ghi các convention không mặc định có bằng chứng rõ ràng, bỏ qua mặc định của framework và những gì Pint hoặc Rector đã enforce, đồng thời báo cáo các pattern thực sự không nhất quán thay vì ghi chúng thành quy tắc. Trước khi ghi bất kỳ quy tắc nào, skill sẽ trình bày từng convention phát hiện được cùng bằng chứng để bạn phê duyệt. Nếu muốn skill ghi lại tất cả convention đã phát hiện mà không cần xác nhận, bạn có thể yêu cầu nó `yolo`.

<a name="disabling-project-rules"></a>
### Tắt quy tắc dự án

Quy tắc dự án được bật mặc định. Để tắt hoàn toàn, hãy khai báo biến môi trường sau. Việc này sẽ loại bỏ MCP tool `record-rule` và ngăn Boost quản lý thư mục `.ai/rules`:

```ini
BOOST_RULES_ENABLED=false
```

<a name="documentation-api"></a>
## API tài liệu

Laravel Boost cung cấp một API tài liệu cho phép AI agent truy cập kho tri thức chuyên biệt về Laravel với hơn 17.000 mục thông tin. API sử dụng tìm kiếm ngữ nghĩa với embedding để trả về kết quả chính xác và phù hợp với ngữ cảnh.

MCP tool `Search Docs` cho phép agent truy vấn dịch vụ API tài liệu do Laravel lưu trữ để lấy tài liệu dựa trên các package đã cài đặt trong ứng dụng. AI guideline và skill của Boost sẽ tự động hướng dẫn coding agent sử dụng API này.

<div class="overflow-auto">

| Package           | Phiên bản được hỗ trợ |
| ----------------- | ------------------ |
| Laravel Framework | 10.x, 11.x, 12.x, 13.x |
| Filament          | 2.x, 3.x, 4.x, 5.x |
| Flux UI           | 2.x Free, 2.x Pro  |
| Inertia           | 1.x, 2.x           |
| Livewire          | 1.x, 2.x, 3.x, 4.x |
| Nova              | 4.x, 5.x           |
| Pest              | 3.x, 4.x           |
| Tailwind CSS      | 3.x, 4.x           |

</div>

<a name="extending-boost"></a>
## Mở rộng Boost

Boost hỗ trợ sẵn nhiều IDE và AI agent phổ biến. Nếu công cụ lập trình của bạn chưa được hỗ trợ, bạn có thể tạo agent riêng và tích hợp agent đó với Boost.

<a name="adding-support-for-other-ides-ai-agents"></a>
### Thêm hỗ trợ cho IDE / AI agent khác

Để thêm hỗ trợ cho một IDE hoặc AI agent mới, hãy tạo một class kế thừa `Laravel\Boost\Install\Agents\Agent` và implement một hoặc nhiều contract sau tùy theo nhu cầu:

- `Laravel\Boost\Contracts\SupportsGuidelines` - Thêm hỗ trợ cho AI guideline.
- `Laravel\Boost\Contracts\SupportsMcp` - Thêm hỗ trợ cho MCP.
- `Laravel\Boost\Contracts\SupportsSkills` - Thêm hỗ trợ cho Agent Skill.

<a name="writing-the-agent"></a>
#### Viết agent

```php
<?php

declare(strict_types=1);

namespace App;

use Laravel\Boost\Contracts\SupportsGuidelines;
use Laravel\Boost\Contracts\SupportsMcp;
use Laravel\Boost\Contracts\SupportsSkills;
use Laravel\Boost\Install\Agents\Agent;

class CustomAgent extends Agent implements SupportsGuidelines, SupportsMcp, SupportsSkills
{
    // Your implementation...
}
```

Để xem ví dụ triển khai, hãy tham khảo [ClaudeCode.php](https://github.com/laravel/boost/blob/main/src/Install/Agents/ClaudeCode.php).

<a name="registering-the-agent"></a>
#### Đăng ký agent

Đăng ký custom agent trong phương thức `boot` của `App\Providers\AppServiceProvider` trong ứng dụng:

```php
use Laravel\Boost\Boost;

public function boot(): void
{
    Boost::registerAgent('customagent', CustomAgent::class);
}
```

Sau khi đăng ký, agent sẽ xuất hiện để bạn lựa chọn khi chạy `php artisan boost:install`.
