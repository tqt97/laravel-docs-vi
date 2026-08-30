# Phát triển với sự hỗ trợ của AI

- [Giới thiệu](#introduction)
    - [Vì sao Laravel phù hợp cho phát triển với AI?](#why-laravel-for-ai-development)
- [Laravel Boost](#laravel-boost)
    - [Cài đặt](#installation)
    - [Các công cụ có sẵn](#available-tools)
    - [AI Guidelines](#ai-guidelines)
    - [Agent Skills](#agent-skills)
    - [Tìm kiếm tài liệu](#documentation-search)
    - [Tích hợp Agent](#agents-integration)

<a name="introduction"></a>
## Giới thiệu

Laravel có nhiều đặc điểm khiến framework đặc biệt phù hợp với quy trình phát triển có AI hỗ trợ và agentic development. Sự phát triển của các AI coding agent như [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [OpenCode](https://opencode.ai), [Cursor](https://cursor.com) và [GitHub Copilot](https://github.com/features/copilot) đã thay đổi cách developer viết code. Những công cụ này có thể tạo cả một feature, debug vấn đề phức tạp và refactor code với tốc độ rất cao — nhưng hiệu quả của chúng phụ thuộc nhiều vào mức độ hiểu codebase.

<a name="why-laravel-for-ai-development"></a>
### Vì sao Laravel phù hợp cho phát triển với AI?

Các convention rõ ràng và cấu trúc được định nghĩa chặt chẽ của Laravel khiến framework phù hợp với AI-assisted development. Khi bạn yêu cầu AI agent thêm controller, agent có thể biết chính xác file nên nằm ở đâu. Khi cần migration mới, naming convention và vị trí file có tính dự đoán cao. Sự nhất quán này loại bỏ nhiều phỏng đoán thường khiến AI tool gặp khó trong các framework linh hoạt hơn.

Không chỉ ở tổ chức file, syntax giàu tính biểu đạt và documentation đầy đủ của Laravel còn cung cấp context để AI agent sinh code chính xác và đúng phong cách Laravel. Eloquent relationship, form request và middleware đều tuân theo các pattern mà agent có thể hiểu và tái sử dụng một cách đáng tin cậy. Kết quả là code do AI tạo có khả năng gần với cách một Laravel developer có kinh nghiệm sẽ viết, thay vì chỉ ghép các PHP snippet chung chung.

<a name="laravel-boost"></a>
## Laravel Boost

[Laravel Boost](https://github.com/laravel/boost) kết nối AI coding agent với ứng dụng Laravel của bạn. Boost là một MCP (Model Context Protocol) server được trang bị hơn 15 công cụ chuyên biệt, cung cấp cho AI agent thông tin sâu về cấu trúc ứng dụng, database, route và nhiều thành phần khác. Khi cài Boost, một AI coding assistant tổng quát có thể làm việc như một Laravel assistant hiểu context cụ thể của project.

Boost cung cấp ba nhóm khả năng chính: bộ MCP tool để kiểm tra và tương tác với ứng dụng; các AI guideline có thể kết hợp, được xây dựng riêng cho Laravel ecosystem; và documentation API chứa hơn 17.000 đơn vị kiến thức liên quan tới Laravel.

<a name="installation"></a>
### Cài đặt

Boost có thể được cài trong ứng dụng Laravel 10, 11, 12 và 13 chạy PHP 8.1 trở lên. Để bắt đầu, cài Boost dưới dạng development dependency:

```shell
composer require laravel/boost --dev
```

Sau đó chạy installer tương tác:

```shell
php artisan boost:install
```

Installer sẽ tự phát hiện IDE và AI agent của bạn, từ đó cho phép chọn các integration phù hợp với project. Boost sẽ tạo các file cấu hình cần thiết, ví dụ `.mcp.json` cho editor hỗ trợ MCP và các guideline file dùng làm AI context.

> [!NOTE]
> Các file cấu hình được sinh như `.mcp.json`, `CLAUDE.md` và `boost.json` có thể được thêm vào `.gitignore` nếu team muốn mỗi developer tự cấu hình environment riêng.

<a name="available-tools"></a>
### Các công cụ có sẵn

Boost cung cấp một tập công cụ khá đầy đủ cho AI agent thông qua Model Context Protocol. Các tool này cho phép agent hiểu và tương tác sâu hơn với ứng dụng Laravel:

<div class="content-list" markdown="1">

- **Application Introspection** - Truy vấn phiên bản PHP/Laravel, liệt kê package đã cài và kiểm tra configuration hoặc environment variable của ứng dụng.
- **Database Tools** - Kiểm tra database schema, chạy read-only query và hiểu cấu trúc dữ liệu ngay trong cuộc hội thoại.
- **Route Inspection** - Liệt kê route đã đăng ký cùng middleware, controller và parameter.
- **Artisan Commands** - Khám phá các Artisan command và argument hiện có, giúp agent đề xuất hoặc thực thi đúng command cho task.
- **Log Analysis** - Đọc và phân tích log của ứng dụng để hỗ trợ debug.
- **Browser Logs** - Truy cập console log và error của browser khi phát triển với frontend tool của Laravel.
- **Tinker Integration** - Chạy PHP code trong context ứng dụng thông qua Laravel Tinker, giúp agent kiểm tra giả thuyết và xác minh behavior.
- **Documentation Search** - Tìm kiếm documentation trong Laravel ecosystem với kết quả phù hợp phiên bản package đang cài.

</div>

<a name="ai-guidelines"></a>
### AI Guidelines

Boost bao gồm một tập AI guideline được thiết kế riêng cho Laravel ecosystem. Các guideline này hướng dẫn AI agent viết code đúng phong cách Laravel, tuân theo convention của framework và tránh các lỗi phổ biến. Guideline có thể kết hợp và nhận biết version, vì vậy agent nhận instruction phù hợp với chính xác phiên bản package của project.

Guideline có sẵn cho Laravel và hơn 16 package trong ecosystem, bao gồm:

<div class="content-list" markdown="1">

- Livewire (2.x, 3.x và 4.x)
- Inertia.js (React, Svelte và Vue)
- Tailwind CSS (3.x và 4.x)
- Filament (3.x và 4.x)
- PHPUnit
- Pest PHP
- Laravel Pint
- Và nhiều package khác

</div>

Khi chạy `boost:install`, Boost tự phát hiện package mà ứng dụng sử dụng và tổng hợp các guideline liên quan vào AI context file của project.

<a name="agent-skills"></a>
### Agent Skills

[Agent Skills](https://agentskills.io/home) là các module kiến thức nhỏ, tập trung theo từng mục tiêu mà agent có thể kích hoạt khi cần làm việc với một domain cụ thể. Khác với guideline thường được nạp từ đầu, skill cho phép pattern và best practice chi tiết chỉ được nạp khi liên quan, giúp giảm context thừa và tăng độ liên quan của code AI tạo ra.

Skill có sẵn cho nhiều package Laravel phổ biến như Livewire, Inertia, Tailwind CSS, Pest và các package khác. Khi chạy `boost:install` và chọn skills là một feature, Boost tự cài skill dựa trên package phát hiện trong `composer.json`.

<a name="documentation-search"></a>
### Tìm kiếm tài liệu

Boost bao gồm documentation API cung cấp cho AI agent quyền truy cập vào hơn 17.000 phần tài liệu trong Laravel ecosystem. Khác với tìm kiếm web chung, nguồn này đã được index, vectorize và lọc để phù hợp với chính xác version package của project.

Khi agent cần hiểu một feature, nó có thể tìm trong Boost documentation API và nhận thông tin chính xác theo version. Điều này giúp giảm tình trạng AI đề xuất method đã deprecated hoặc syntax thuộc version framework cũ.

<a name="agents-integration"></a>
### Tích hợp Agent

Boost tích hợp với các IDE và AI tool phổ biến hỗ trợ Model Context Protocol. Để xem hướng dẫn cài đặt chi tiết cho Cursor, Claude Code, Codex, Gemini CLI, GitHub Copilot và Junie, hãy xem phần [Set Up Your Agents](/docs/{{version}}/boost#set-up-your-agents) trong tài liệu Boost.

---

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/ai). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
