# Laravel AI SDK

<a name="introduction"></a>
## Giới thiệu

[Laravel AI SDK](https://github.com/laravel/ai) cung cấp một API thống nhất, giàu tính biểu đạt để tương tác với các AI provider như OpenAI, Anthropic, Gemini và nhiều provider khác. Với AI SDK, bạn có thể xây dựng các agent thông minh có tool và đầu ra có cấu trúc, tạo hình ảnh, tổng hợp và phiên âm âm thanh, tạo vector embedding và nhiều hơn nữa — tất cả thông qua một giao diện nhất quán, thân thiện với Laravel.

<a name="installation"></a>
## Cài đặt

Bạn có thể cài đặt Laravel AI SDK thông qua Composer:

```shell
composer require laravel/ai
```

Tiếp theo, bạn nên publish các file cấu hình và migration của AI SDK bằng lệnh Artisan `vendor:publish`:

```shell
php artisan vendor:publish --provider="Laravel\Ai\AiServiceProvider"
```

Cuối cùng, bạn nên chạy các database migration của ứng dụng. Thao tác này sẽ tạo các bảng `agent_conversations` và `agent_conversation_messages` mà AI SDK sử dụng để lưu trữ hội thoại:

```shell
php artisan migrate
```

<a name="configuration"></a>
### Cấu hình

Bạn có thể khai báo thông tin xác thực của AI provider trong file cấu hình `config/ai.php` của ứng dụng hoặc dưới dạng biến môi trường trong file `.env`:

```ini
ANTHROPIC_API_KEY=
AZURE_OPENAI_API_KEY=
COHERE_API_KEY=
DEEPSEEK_API_KEY=
ELEVENLABS_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
MISTRAL_API_KEY=
OLLAMA_API_KEY=
OPENAI_API_KEY=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_URL=
OPENROUTER_API_KEY=
JINA_API_KEY=
VOYAGEAI_API_KEY=
XAI_API_KEY=
```

Các model mặc định dùng cho văn bản, hình ảnh, âm thanh, phiên âm và embedding cũng có thể được cấu hình trong file `config/ai.php` của ứng dụng.

<a name="custom-base-urls"></a>
### Base URL tùy chỉnh

Theo mặc định, Laravel AI SDK kết nối trực tiếp tới API endpoint công khai của từng provider. Tuy nhiên, bạn có thể cần định tuyến request qua một endpoint khác — ví dụ khi sử dụng proxy service để tập trung quản lý API key, triển khai rate limiting hoặc định tuyến traffic qua gateway của doanh nghiệp.

Bạn có thể cấu hình base URL tùy chỉnh bằng cách thêm tham số `url` vào cấu hình provider:

```php
'providers' => [
    'openai' => [
        'driver' => 'openai',
        'key' => env('OPENAI_API_KEY'),
        'url' => env('OPENAI_URL'),
    ],

    'anthropic' => [
        'driver' => 'anthropic',
        'key' => env('ANTHROPIC_API_KEY'),
        'url' => env('ANTHROPIC_BASE_URL'),
    ],
],
```

Điều này hữu ích khi định tuyến request qua proxy service (chẳng hạn LiteLLM hoặc Azure OpenAI Gateway) hoặc khi sử dụng endpoint thay thế.

Base URL tùy chỉnh được hỗ trợ cho các provider sau: OpenAI, Anthropic, Gemini, Groq, Cohere, DeepSeek, xAI và OpenRouter.

<a name="openai-compatible-providers"></a>
### Provider tương thích OpenAI

Nếu đang sử dụng một API tương thích OpenAI như LM Studio, vLLM, Together, Fireworks hoặc local gateway, bạn có thể cấu hình provider `openai-compatible`. Tùy chọn `url` là bắt buộc, còn `key` là tùy chọn và sẽ được gửi dưới dạng bearer token khi có:

```php
'providers' => [
    'local' => [
        'driver' => 'openai-compatible',
        'url' => env('LOCAL_AI_URL'),
        'key' => env('LOCAL_AI_API_KEY'),
    ],
],
```

Sau khi cấu hình, bạn có thể sử dụng provider đã đặt tên giống như bất kỳ provider nào khác:

```php
agent()->prompt('What is Laravel?', provider: 'local', model: 'local-model');
```

Bạn cũng có thể cấu hình model văn bản mặc định cho provider để không cần truyền model một cách tường minh:

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'models' => [
        'text' => [
            'default' => env('LOCAL_AI_MODEL'),
        ],
    ],
],
```

Bạn có thể thêm HTTP header tùy chỉnh vào mọi request gửi đi của provider bằng cách khai báo mảng `headers` trong cấu hình. Điều này hữu ích khi endpoint yêu cầu thêm header định danh hoặc xác thực ngoài bearer token:

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'headers' => [
        'X-Tenant-Id' => env('LOCAL_AI_TENANT_ID'),
    ],
],
```

Các provider tương thích OpenAI hỗ trợ tạo văn bản, streaming, tool, đầu ra có cấu trúc, tệp hình ảnh đính kèm, embedding và phiên âm. Nếu endpoint của bạn yêu cầu thêm các trường trong request body, hãy cung cấp chúng thông qua [provider options](#provider-options).

<a name="openai-compatible-embeddings"></a>
#### Embedding tương thích OpenAI

Vì các endpoint tùy ý không có model đã biết trước, bạn phải cấu hình một embedding model mặc định để sử dụng `embeddings()` với provider tương thích OpenAI. Bạn cũng có thể cấu hình giá trị dimensions cố định; nếu bỏ qua, request sẽ được gửi mà không có tham số `dimensions` và dimensions gốc của model sẽ được sử dụng.

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'models' => [
        'embeddings' => [
            'default' => 'text-embedding-qwen3-embedding-0.6b',
            'dimensions' => 1024, // optional
        ],
    ],
],
```

<a name="openai-compatible-transcriptions"></a>
#### Phiên âm tương thích OpenAI

Tương tự, bạn phải cấu hình một transcription model mặc định để sử dụng `Transcription` với provider tương thích OpenAI. Audio sẽ được upload tới route `/audio/transcriptions` của endpoint dưới dạng multipart request tiêu chuẩn:

```php
'local' => [
    'driver' => 'openai-compatible',
    'url' => env('LOCAL_AI_URL'),
    'key' => env('LOCAL_AI_API_KEY'),
    'models' => [
        'transcription' => [
            'default' => 'whisper-1',
        ],
    ],
],
```

> [!NOTE]
> Các provider tương thích OpenAI và Groq không hỗ trợ diarization. Việc gọi phương thức `diarize` khi sử dụng các provider này sẽ ném ra exception.

<a name="provider-support"></a>
### Hỗ trợ provider

AI SDK hỗ trợ nhiều provider trên các tính năng khác nhau. Bảng sau tóm tắt những provider khả dụng cho từng tính năng:

<div class="overflow-auto">

| Feature | Providers |
|---|---|
| Text | OpenAI, OpenAI Compatible, Anthropic, Gemini, Azure, Bedrock, Groq, xAI, DeepSeek, Mistral, Ollama, OpenRouter |
| Images | OpenAI, Gemini, xAI, Azure, Bedrock, OpenRouter |
| TTS | OpenAI, ElevenLabs, Gemini |
| STT | OpenAI, OpenAI Compatible, ElevenLabs, Groq, Mistral, Gemini |
| Embeddings | OpenAI, OpenAI Compatible, Gemini, Azure, Bedrock, Cohere, Mistral, Jina, VoyageAI, Ollama, OpenRouter |
| Reranking | Cohere, Jina, VoyageAI |
| Files | OpenAI, Anthropic, Gemini, Azure |

</div>

Enum `Laravel\Ai\Enums\Lab` có thể được dùng để tham chiếu provider trong toàn bộ code thay vì sử dụng chuỗi thuần túy:

```php
use Laravel\Ai\Enums\Lab;

Lab::Anthropic;
Lab::OpenAI;
Lab::OpenAiCompatible;
Lab::Gemini;
// ...
```

<a name="agents"></a>
## Agent

Agent là khối xây dựng nền tảng để tương tác với AI provider trong Laravel AI SDK. Mỗi agent là một PHP class chuyên biệt đóng gói instructions, ngữ cảnh hội thoại, tool và output schema cần thiết để tương tác với large language model. Có thể xem agent như một trợ lý chuyên biệt — sales coach, công cụ phân tích tài liệu hoặc support bot — mà bạn cấu hình một lần rồi gửi prompt khi cần trong toàn bộ ứng dụng.

Bạn có thể tạo agent bằng lệnh Artisan `make:agent`:

```shell
php artisan make:agent SalesCoach

php artisan make:agent SalesCoach --structured
```

Trong agent class được tạo, bạn có thể định nghĩa system prompt / instructions, message context, các tool khả dụng và output schema (nếu áp dụng):

```php
<?php

namespace App\Ai\Agents;

use App\Ai\Tools\RetrievePreviousTranscripts;
use App\Models\History;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class SalesCoach implements Agent, Conversational, HasTools, HasStructuredOutput
{
    use Promptable;

    public function __construct(public User $user) {}

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return 'You are a sales coach, analyzing transcripts and providing feedback and an overall sales strength score.';
    }

    /**
     * Get the list of messages comprising the conversation so far.
     */
    public function messages(): iterable
    {
        return History::where('user_id', $this->user->id)
            ->latest()
            ->limit(50)
            ->get()
            ->reverse()
            ->map(function ($message) {
                return new Message($message->role, $message->content);
            })->all();
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new RetrievePreviousTranscripts,
        ];
    }

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'feedback' => $schema->string()->required(),
            'score' => $schema->integer()->min(1)->max(10)->required(),
        ];
    }
}
```

<a name="prompting"></a>
### Gửi prompt

Để gửi prompt cho agent, trước tiên hãy tạo instance bằng phương thức `make` hoặc khởi tạo theo cách thông thường, sau đó gọi `prompt`:

```php
$response = (new SalesCoach)
    ->prompt('Analyze this sales transcript...');

return (string) $response;
```

Phương thức `make` resolve agent từ container, cho phép dependency injection tự động. Bạn cũng có thể truyền argument vào constructor của agent:

```php
$agent = SalesCoach::make(user: $user);
```

Bằng cách truyền thêm argument vào phương thức `prompt`, bạn có thể ghi đè provider, model hoặc HTTP timeout mặc định khi gửi prompt:

```php
$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: Lab::Anthropic,
    model: 'claude-sonnet-5',
    timeout: 120,
);
```

<a name="raw-http-responses"></a>
#### Phản hồi HTTP thô

Mỗi phản hồi do agent sinh văn bản trả về đều cung cấp phản hồi HTTP thô từ lời gọi API của provider bên dưới thông qua thuộc tính `raw`. Nhờ đó, bạn có thể truy cập thông tin riêng của provider không nằm trong phản hồi tổng quát của AI SDK, chẳng hạn header rate-limit, request ID hoặc các trường payload chính xác khác:

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...');

$response->raw; // Illuminate\Http\Client\Response|null

$response->raw->header('X-RateLimit-Remaining-Requests');
$response->raw->json('id');
```

Trong vòng lặp gọi tool, mỗi bước giữ lại phản hồi thô của chính request tương ứng:

```php
foreach ($response->steps as $step) {
    $step->raw?->header('X-RateLimit-Remaining-Requests');
}
```

> **Lưu ý:** Thuộc tính `raw` là `null` khi stream phản hồi, khi sử dụng provider Bedrock (provider này thực hiện lời gọi API thông qua AWS SDK thay vì HTTP client), và trên các phản hồi giả lập trừ khi phản hồi thô được cung cấp tường minh qua `withRawResponse`.

<a name="conversation-context"></a>
### Ngữ cảnh hội thoại

Nếu agent triển khai interface `Conversational`, bạn có thể sử dụng phương thức `messages` để trả về ngữ cảnh hội thoại trước đó, nếu có:

```php
use App\Models\History;
use Laravel\Ai\Messages\Message;

/**
 * Get the list of messages comprising the conversation so far.
 */
public function messages(): iterable
{
    return History::where('user_id', $this->user->id)
        ->latest()
        ->limit(50)
        ->get()
        ->reverse()
        ->map(function ($message) {
            return new Message($message->role, $message->content);
        })->all();
}
```

<a name="remembering-conversations"></a>
#### Ghi nhớ hội thoại

> **Cảnh báo:** Trước khi sử dụng trait `RemembersConversations`, bạn nên publish và chạy migration của AI SDK bằng lệnh Artisan `vendor:publish`. Các migration này sẽ tạo những bảng cơ sở dữ liệu cần thiết để lưu hội thoại.

Nếu muốn Laravel tự động lưu và truy xuất lịch sử hội thoại cho agent, bạn có thể sử dụng trait `RemembersConversations`. Trait này cung cấp cách đơn giản để lưu bền vững các message hội thoại vào cơ sở dữ liệu mà không cần tự triển khai interface `Conversational`:

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, Conversational
{
    use Promptable, RemembersConversations;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): string
    {
        return 'You are a sales coach...';
    }
}
```

Khi sử dụng trait `RemembersConversations`, không tự định nghĩa phương thức `messages` trong class agent. Nếu phương thức `messages` tồn tại, nó sẽ được ưu tiên hơn phần triển khai của trait và lịch sử hội thoại sẽ không được tải từ cơ sở dữ liệu.

Để bắt đầu hội thoại mới cho một user, hãy gọi phương thức `forUser` trước khi gửi prompt:

```php
$response = (new SalesCoach)->forUser($user)->prompt('Hello!');

$conversationId = $response->conversationId;
```

Conversation ID được trả về trong response và có thể được lưu để tham chiếu sau này. Nếu muốn truy xuất toàn bộ hội thoại của một user bằng Eloquent, bạn có thể thêm trait `HasConversations` vào model user:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Ai\Concerns\HasConversations;

class User extends Authenticatable
{
    use HasConversations;
}
```

Sau khi thêm trait vào model, bạn có thể truy xuất và query các hội thoại của user thông qua relationship `conversations`:

```php
$conversations = $user->conversations()
    ->latest('updated_at')
    ->paginate(20);
```

Để tiếp tục một hội thoại hiện có, hãy sử dụng phương thức `continue`:

```php
$response = (new SalesCoach)
    ->continue($conversationId, as: $user)
    ->prompt('Tell me more about that.');
```

Khi sử dụng trait `RemembersConversations`, các message trước đó sẽ tự động được tải và đưa vào ngữ cảnh hội thoại khi gửi prompt. Các message mới (cả user và assistant) cũng tự động được lưu sau mỗi lần tương tác.

<a name="conversation-participants"></a>
#### Người tham gia hội thoại

Mặc dù user là đối tượng tham gia hội thoại phổ biến nhất, hội thoại có thể thuộc về bất kỳ model Eloquent nào. Sử dụng phương thức `forParticipant` để bắt đầu hội thoại cho một loại model khác:

```php
$response = (new SalesCoach)
    ->forParticipant($team)
    ->prompt('Review our latest sales results.');
```

Morph class và primary key của participant được lưu cùng hội thoại. Vì vậy, các model khác loại nhưng có cùng primary key, chẳng hạn `User` ID `1` và `Team` ID `1`, vẫn có lịch sử hội thoại riêng biệt. Phương thức `forUser` là alias của `forParticipant`.

Bạn có thể tiếp tục hội thoại gần nhất của participant bằng phương thức `continueLastConversation`:

```php
$response = (new SalesCoach)
    ->continueLastConversation($team)
    ->prompt('Tell me more about that.');
```

Khi tiếp tục một hội thoại cụ thể, hãy truyền participant vào phương thức `continue`:

```php
$response = (new SalesCoach)
    ->continue($conversationId, as: $team)
    ->prompt('Tell me more about that.');
```

Trait `HasConversations` có thể được thêm vào bất kỳ model Eloquent nào tham gia hội thoại. Relationship `conversations` tạo ra là một polymorphic relationship được giới hạn theo loại model và primary key của model đó. Bạn cũng có thể truy cập participant sở hữu hội thoại thông qua inverse relationship:

```php
$conversations = $team->conversations;

$participant = $conversation->participant;
```

Nếu ứng dụng sử dụng nhiều loại model participant, bạn nên cân nhắc định nghĩa [Eloquent morph map](/eloquent-relationships#custom-polymorphic-types) để loại participant được lưu không bị phụ thuộc vào tên class model.

> [!WARNING]
> Phương thức `continue` không xác minh participant được truyền vào có sở hữu hội thoại hay không. Ứng dụng của bạn nên phân quyền truy cập hội thoại trước khi tiếp tục.

<a name="structured-output"></a>
### Đầu ra có cấu trúc

Nếu muốn agent trả về đầu ra có cấu trúc, hãy triển khai interface `HasStructuredOutput`; interface này yêu cầu agent định nghĩa phương thức `schema`:

```php
<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasStructuredOutput
{
    use Promptable;

    // ...

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'score' => $schema->integer()->required(),
        ];
    }
}
```

Khi gửi prompt đến agent trả về đầu ra có cấu trúc, bạn có thể truy cập `StructuredAgentResponse` được trả về giống như một array:

```php
$response = (new SalesCoach)->prompt('Analyze this sales transcript...');

return $response['score'];
```

<a name="structured-output-nested-objects"></a>
#### Object lồng nhau

Để định nghĩa đầu ra có cấu trúc lồng nhau, hãy sử dụng phương thức `object` cùng một closure:

```php
<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasStructuredOutput
{
    use Promptable;

    // ...

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'score' => $schema->integer()->required(),
            'metadata' => $schema->object(fn ($schema) => [
                'confidence' => $schema->string()->enum(['low', 'medium', 'high'])->required(),
                'language' => $schema->string()->required(),
            ])->required(),
        ];
    }
}
```

<a name="structured-output-arrays-of-objects"></a>
#### Mảng object

Nếu agent cần trả về danh sách các phần tử có cấu trúc, hãy kết hợp các phương thức `array` và `object`:

```php
public function schema(JsonSchema $schema): array
{
    return [
        'feedback' => $schema->array()
            ->items(
                $schema->object(fn ($schema) => [
                    'comment' => $schema->string()->required(),
                    'score' => $schema->integer()->required(),
                ])
            )
            ->required(),
    ];
}
```

Nếu một giá trị có thể khớp với một trong nhiều schema, hãy sử dụng phương thức `anyOf`:

```php
public function schema(JsonSchema $schema): array
{
    return [
        'content' => $schema->anyOf([
            $schema->object(fn ($schema) => [
                'type' => $schema->string()->enum(['article'])->required(),
                'title' => $schema->string()->required(),
            ]),
            $schema->object(fn ($schema) => [
                'type' => $schema->string()->enum(['image'])->required(),
                'url' => $schema->string()->required(),
            ]),
        ])->required(),
    ];
}
```

<a name="attachments"></a>
### Tệp đính kèm

Khi gửi prompt, bạn cũng có thể truyền tệp đính kèm cùng prompt để model có thể kiểm tra hình ảnh và tài liệu:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Files;

$response = (new SalesCoach)->prompt(
    'Analyze the attached sales transcript...',
    attachments: [
        Files\Document::fromStorage('transcript.pdf'), // Attach a document from a filesystem disk...
        Files\Document::fromPath('/home/laravel/transcript.md'), // Attach a document from a local path...
        $request->file('transcript'), // Attach an uploaded file...
    ]
);
```

Tương tự, class `Laravel\Ai\Files\Image` có thể được sử dụng để đính kèm hình ảnh vào prompt:

```php
use App\Ai\Agents\ImageAnalyzer;
use Laravel\Ai\Files;

$response = (new ImageAnalyzer)->prompt(
    'What is in this image?',
    attachments: [
        Files\Image::fromStorage('photo.jpg'), // Attach an image from a filesystem disk...
        Files\Image::fromPath('/home/laravel/photo.jpg'), // Attach an image from a local path...
        $request->file('photo'), // Attach an uploaded file...
    ]
);
```

<a name="streaming"></a>
### Streaming

Bạn có thể stream phản hồi của agent bằng cách gọi phương thức `stream`. `StreamableAgentResponse` được trả về có thể được trả trực tiếp từ route để tự động gửi phản hồi dạng streaming (SSE) tới client:

```php
use App\Ai\Agents\SalesCoach;

Route::get('/coach', function () {
    return (new SalesCoach)->stream('Analyze this sales transcript...');
});
```

Phương thức `then` có thể được dùng để cung cấp một closure sẽ được gọi sau khi toàn bộ phản hồi đã được stream tới client:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Responses\StreamedAgentResponse;

Route::get('/coach', function () {
    return (new SalesCoach)
        ->stream('Analyze this sales transcript...')
        ->then(function (StreamedAgentResponse $response) {
            // $response->text, $response->events, $response->usage...
        });
});
```

Ngoài ra, bạn có thể tự lặp qua các event được stream:

```php
$stream = (new SalesCoach)->stream('Analyze this sales transcript...');

foreach ($stream as $event) {
    // ...
}
```

<a name="streaming-using-the-vercel-ai-sdk-protocol"></a>
#### Streaming bằng giao thức Vercel AI SDK

Bạn có thể stream các event bằng [giao thức stream của Vercel AI SDK](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol) bằng cách gọi phương thức `usingVercelDataProtocol` trên phản hồi có khả năng stream:

```php
use App\Ai\Agents\SalesCoach;

Route::get('/coach', function () {
    return (new SalesCoach)
        ->stream('Analyze this sales transcript...')
        ->usingVercelDataProtocol();
});
```

<a name="broadcasting"></a>
### Broadcasting

Bạn có thể broadcast các event được stream theo một số cách khác nhau. Trước tiên, bạn có thể gọi trực tiếp phương thức `broadcast` hoặc `broadcastNow` trên một event được stream:

```php
use App\Ai\Agents\SalesCoach;
use Illuminate\Broadcasting\Channel;

$stream = (new SalesCoach)->stream('Analyze this sales transcript...');

foreach ($stream as $event) {
    $event->broadcast(new Channel('channel-name'));
}
```

Hoặc, bạn có thể gọi phương thức `broadcastOnQueue` của agent để đưa thao tác của agent vào queue và broadcast các event được stream ngay khi chúng sẵn sàng:

```php
(new SalesCoach)->broadcastOnQueue(
    'Analyze this sales transcript...'
    new Channel('channel-name'),
);
```

<a name="skipping-oversized-events"></a>
#### Bỏ qua các event quá lớn

Một số nền tảng broadcasting giới hạn message WebSocket ở khoảng 10KB. Các stream event chứa nhiều dữ liệu, chẳng hạn kết quả tool lớn, có thể vượt giới hạn này và khiến broadcasting thất bại. Bạn có thể loại trừ các loại event cụ thể khỏi broadcasting bằng attribute `WithoutBroadcasting`:

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\WithoutBroadcasting;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;
use Laravel\Ai\Streaming\Events\ToolCall;
use Laravel\Ai\Streaming\Events\ToolResult;

#[WithoutBroadcasting(ToolCall::class, ToolResult::class)]
class SearchAgent implements Agent, HasTools
{
    use Promptable;

    // ...
}
```

Các event bị loại trừ sẽ không bao giờ được broadcast, nhưng vẫn được lưu vào bảng `agent_conversation_messages`, nhờ đó frontend có thể tải đầy đủ dữ liệu tool sau khi stream hoàn tất. Cơ chế này hoạt động với cả broadcasting qua queue (`broadcastOnQueue`) lẫn đồng bộ (`broadcast` / `broadcastNow`).

<a name="queueing"></a>
### Đưa vào queue

Bằng phương thức `queue` của agent, bạn có thể gửi prompt cho agent nhưng cho phép nó xử lý phản hồi ở background, giúp ứng dụng luôn nhanh và phản hồi tốt. Các phương thức `then` và `catch` có thể được dùng để đăng ký closure sẽ được gọi khi có phản hồi hoặc khi xảy ra exception:

```php
use Illuminate\Http\Request;
use Laravel\Ai\Responses\AgentResponse;
use Throwable;

Route::post('/coach', function (Request $request) {
    (new SalesCoach)
        ->queue($request->input('transcript'))
        ->then(function (AgentResponse $response) {
            // ...
        })
        ->catch(function (Throwable $e) {
            // ...
        });

    return back();
});
```

<a name="tools"></a>
### Tools

Tool có thể được dùng để cung cấp thêm chức năng cho agent trong quá trình phản hồi prompt. Bạn có thể tạo tool bằng lệnh Artisan `make:tool`:

```shell
php artisan make:tool RandomNumberGenerator
```

Tool được tạo sẽ nằm trong thư mục `app/Ai/Tools` của ứng dụng. Mỗi tool chứa phương thức `handle`, phương thức này sẽ được agent gọi khi cần sử dụng tool:

```php
<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class RandomNumberGenerator implements Tool
{
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'This tool may be used to generate cryptographically secure random numbers.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        return (string) random_int($request['min'], $request['max']);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'min' => $schema->integer()->min(0)->required(),
            'max' => $schema->integer()->required(),
        ];
    }
}
```

Sau khi định nghĩa tool, bạn có thể trả về tool đó từ phương thức `tools` của bất kỳ agent nào:

```php
use App\Ai\Tools\RandomNumberGenerator;

/**
 * Get the tools available to the agent.
 *
 * @return Tool[]
 */
public function tools(): iterable
{
    return [
        new RandomNumberGenerator,
    ];
}
```

<a name="repairing-tool-calls"></a>
#### Sửa chữa lời gọi tool

Sử dụng attribute `RepairToolCalls` để cho phép agent phục hồi khi model gọi một local tool không tồn tại. Laravel trả lời gọi thất bại về cho model cùng tên các local tool hiện có, cho phép model sửa lại lời gọi:

```php
use Laravel\Ai\Attributes\RepairToolCalls;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;

#[RepairToolCalls]
class SupportAgent implements Agent, HasTools
{
    use Promptable;

    // ...
}
```

Khi Laravel tự động xác định số bước tối đa, attribute này bổ sung thêm một bước cho lời gọi được sửa. Các giới hạn `MaxSteps` được khai báo tường minh không thay đổi.

<a name="similarity-search"></a>
#### Tìm kiếm tương đồng

Tool `SimilaritySearch` cho phép agent tìm các tài liệu tương đồng với một truy vấn cho trước bằng vector embedding được lưu trong database. Điều này hữu ích cho retrieval-augmented generation (RAG) khi bạn muốn cho agent khả năng tìm kiếm dữ liệu của ứng dụng.

Cách đơn giản nhất để tạo tool tìm kiếm tương đồng là sử dụng phương thức `usingModel` với một Eloquent model có vector embedding:

```php
use App\Models\Document;
use Laravel\Ai\Tools\SimilaritySearch;

public function tools(): iterable
{
    return [
        SimilaritySearch::usingModel(Document::class, 'embedding'),
    ];
}
```

Đối số đầu tiên là class Eloquent model và đối số thứ hai là cột chứa vector embedding.

Bạn cũng có thể cung cấp ngưỡng tương đồng tối thiểu từ `0.0` đến `1.0` và một closure để tùy chỉnh query:

```php
SimilaritySearch::usingModel(
    model: Document::class,
    column: 'embedding',
    minSimilarity: 0.7,
    limit: 10,
    query: fn ($query) => $query->where('published', true),
),
```

Để kiểm soát nhiều hơn, bạn có thể tạo tool tìm kiếm tương đồng với một closure tùy chỉnh trả về kết quả tìm kiếm:

```php
use App\Models\Document;
use Laravel\Ai\Tools\SimilaritySearch;

public function tools(): iterable
{
    return [
        new SimilaritySearch(using: function (string $query) {
            return Document::query()
                ->where('user_id', $this->user->id)
                ->whereVectorSimilarTo('embedding', $query)
                ->limit(10)
                ->get();
        }),
    ];
}
```

Bạn có thể tùy chỉnh mô tả của tool bằng phương thức `withDescription`:

```php
SimilaritySearch::usingModel(Document::class, 'embedding')
    ->withDescription('Search the knowledge base for relevant articles.'),
```

<a name="deferred-tool-loading"></a>
### Tải tool trì hoãn

Mặc định, mọi tool mà agent cung cấp đều được gửi tới provider trong mỗi request. Khi agent có số lượng lớn tool, việc này tiêu tốn token và có thể làm giảm độ chính xác khi model lựa chọn tool. Khi sử dụng provider tool `ToolSearch` với OpenAI hoặc Anthropic, bạn có thể trì hoãn các định nghĩa tool để provider chỉ tải chúng khi cần:

```php
use App\Ai\Tools\RefundOrder;
use App\Ai\Tools\SearchInvoices;
use App\Ai\Tools\Weather;
use Laravel\Ai\Providers\Tools\ToolSearch;

public function tools(): iterable
{
    return [
        new Weather,
        new ToolSearch(tools: [
            new SearchInvoices,
            new RefundOrder,
        ]),
    ];
}
```

Các tool được bọc không cần sửa đổi. Provider sẽ tìm và tải chúng khi chúng liên quan đến prompt, sau đó agent có thể gọi chúng như bất kỳ tool nào khác.

Khi sử dụng Anthropic, đối số `strategy` có thể được dùng để xác định cách provider tìm kiếm các tool được trì hoãn. Các strategy được hỗ trợ là `regex` (mặc định) và `bm25`:

```php
new ToolSearch(tools: [new SearchInvoices], strategy: 'bm25'),
```

Khi sử dụng Anthropic, các tùy chọn bổ sung dành riêng cho provider có thể được truyền vào search tool bằng phương thức `withProviderOptions`:

```php
(new ToolSearch(tools: [new SearchInvoices]))
    ->withProviderOptions(['cache_control' => ['type' => 'ephemeral']]),
```

> [!WARNING]
> Các provider không hỗ trợ tool search sẽ ném exception thay vì âm thầm bỏ qua các tool được trì hoãn. Ngoài ra, Anthropic yêu cầu phải có ít nhất một tool được cung cấp bên ngoài wrapper `ToolSearch`.

<a name="file-storage-tools"></a>
### Tool lưu trữ file

Factory tool `FileStorage` cho phép bạn cấp cho agent quyền truy cập một [filesystem disk](/filesystem) của Laravel. Phương thức `all` trả về các tool cho phép agent liệt kê, đọc, kiểm tra, tạo URL, ghi, xóa và sao chép file trên disk đã cho:

```php
use Laravel\Ai\Tools\FileStorage;

public function tools(): iterable
{
    return FileStorage::all('local');
}
```

Nếu agent chỉ nên có khả năng kiểm tra file, hãy sử dụng phương thức `readOnly`:

```php
return FileStorage::readOnly('local');
```

Các phương thức này trả về một `Illuminate\Support\Collection`, cho phép bạn tiếp tục lọc các tool được cung cấp cho agent:

```php
use Laravel\Ai\Tools\Filesystem\DeleteFile;

return FileStorage::all('s3')
    ->reject(fn ($tool) => $tool instanceof DeleteFile);
```

<a name="mcp-tools"></a>
### MCP Tools

Nếu ứng dụng sử dụng [Laravel MCP](/mcp), bạn có thể cung cấp cho agent các tool được expose bởi server [Model Context Protocol](https://modelcontextprotocol.io). Với [Laravel MCP client](/mcp#client), bạn có thể kết nối tới MCP server từ xa hoặc cục bộ và truyền trực tiếp các tool của server cho agent.

> [!NOTE]
> MCP tools yêu cầu package [Laravel MCP](/mcp) được cài đặt trong ứng dụng.

Vì phương thức `tools` của MCP client trả về một collection, hãy trải collection này vào mảng `tools` của agent bằng toán tử `...`:

```php
use App\Ai\Tools\RandomNumberGenerator;
use Laravel\Mcp\Client;

/**
 * Get the tools available to the agent.
 *
 * @return Tool[]
 */
public function tools(): iterable
{
    return [
        ...Client::web('https://mcp.example.com')
            ->withToken($token)
            ->tools(),

        new RandomNumberGenerator,
    ];
}
```

AI SDK tự động bọc từng MCP tool để agent có thể gọi nó giống như bất kỳ tool nào khác. Bạn cũng có thể sử dụng một [named MCP client](/mcp#named-clients):

```php
use Laravel\Mcp\Facades\Mcp;

public function tools(): iterable
{
    return [
        ...Mcp::client('github')->tools(),
    ];
}
```

Hoặc kết nối tới một [MCP server cục bộ](/mcp#client-connecting):

```php
use Laravel\Mcp\Client;

public function tools(): iterable
{
    return [
        ...Client::local('php', ['artisan', 'mcp:start'])->tools(),
    ];
}
```

Để biết thêm thông tin về việc tạo và xác thực MCP client, bao gồm bearer token và OAuth, hãy xem [tài liệu MCP client](/mcp#client).

<a name="provider-tools"></a>
### Provider Tools

Provider tool là các tool đặc biệt được AI provider triển khai native, cung cấp các khả năng như tìm kiếm web, tải URL và tìm kiếm file. Khác với tool thông thường, provider tool được chính provider thực thi thay vì ứng dụng của bạn.

Provider tool có thể được trả về từ phương thức `tools` của agent.

<a name="web-search"></a>
#### Tìm kiếm web

Provider tool `WebSearch` cho phép agent tìm kiếm thông tin theo thời gian thực trên web. Điều này hữu ích khi trả lời câu hỏi về sự kiện hiện tại, dữ liệu gần đây hoặc các chủ đề có thể đã thay đổi kể từ thời điểm kết thúc dữ liệu huấn luyện của model.

**Provider được hỗ trợ:** Anthropic, OpenAI, Azure, Gemini, xAI, OpenRouter

```php
use Laravel\Ai\Providers\Tools\WebSearch;

public function tools(): iterable
{
    return [
        new WebSearch,
    ];
}
```

Bạn có thể cấu hình tool tìm kiếm web để giới hạn số lần tìm kiếm hoặc giới hạn kết quả trong các domain cụ thể:

```php
(new WebSearch)->max(5)->allow(['laravel.com', 'php.net']),
```

Để tinh chỉnh kết quả tìm kiếm dựa trên vị trí người dùng, hãy sử dụng phương thức `location`:

```php
(new WebSearch)->location(
    city: 'New York',
    region: 'NY',
    country: 'US'
);
```

<a name="web-fetch"></a>
#### Web Fetch

Provider tool `WebFetch` cho phép agent tải và đọc nội dung của các trang web. Điều này hữu ích khi bạn cần agent phân tích các URL cụ thể hoặc truy xuất thông tin chi tiết từ những trang web đã biết.

**Provider được hỗ trợ:** Anthropic, Gemini, OpenRouter

```php
use Laravel\Ai\Providers\Tools\WebFetch;

public function tools(): iterable
{
    return [
        new WebFetch,
    ];
}
```

Bạn có thể cấu hình tool tải web để giới hạn số lần tải hoặc giới hạn trong các domain cụ thể:

```php
(new WebFetch)->max(3)->allow(['docs.laravel.com']),
```

<a name="file-search"></a>
#### File Search

Provider tool `FileSearch` cho phép agent tìm kiếm trong các [file](#files) được lưu trong [vector store](#vector-stores). Cơ chế này hỗ trợ retrieval-augmented generation (RAG) bằng cách cho phép agent tìm thông tin liên quan trong các tài liệu bạn đã tải lên.

**Supported providers:** OpenAI, Gemini, xAI

```php
use Laravel\Ai\Providers\Tools\FileSearch;

public function tools(): iterable
{
    return [
        new FileSearch(stores: ['store_id']),
    ];
}
```

Bạn có thể cung cấp nhiều vector store ID để tìm kiếm trên nhiều store:

```php
new FileSearch(stores: ['store_1', 'store_2']);
```

Nếu các file có [metadata](#adding-files-to-stores), bạn có thể lọc kết quả tìm kiếm bằng cách cung cấp argument `where`. Với các điều kiện bằng đơn giản, hãy truyền một array:

```php
new FileSearch(stores: ['store_id'], where: [
    'author' => 'Taylor Otwell',
    'year' => 2026,
]);
```

Với các bộ lọc phức tạp hơn, bạn có thể truyền một closure nhận instance `FileSearchQuery`:

```php
use Laravel\Ai\Providers\Tools\FileSearchQuery;

new FileSearch(stores: ['store_id'], where: fn (FileSearchQuery $query) =>
    $query->where('author', 'Taylor Otwell')
        ->whereNot('status', 'draft')
        ->whereIn('category', ['news', 'updates'])
);
```

<a name="sub-agents"></a>
### Sub-Agents

Một agent cũng có thể được trả về từ phương thức `tools` của một agent khác. Khi agent được trả về dưới dạng tool, agent cha có thể giao một tác vụ cụ thể cho sub-agent và sử dụng phản hồi của sub-agent khi trả lời prompt ban đầu. Cách này hữu ích khi một agent đa dụng cần truy cập các agent chuyên biệt có instruction, tool, cấu hình model hoặc lựa chọn provider riêng.

Ví dụ, agent hỗ trợ khách hàng có thể giao các câu hỏi về điều kiện hoàn tiền cho một agent chuyên xử lý hoàn tiền:

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;

class CustomerSupportAgent implements Agent, HasTools
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): string
    {
        return 'You help customers with account, order, and billing questions. Delegate refund policy questions to the refunds specialist.';
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new RefundsAgent,
        ];
    }
}
```

Để tùy chỉnh cách sub-agent được cung cấp cho agent cha, hãy triển khai interface `CanActAsTool` trên sub-agent và định nghĩa tên cùng mô tả dành cho tool:

```php
<?php

namespace App\Ai\Agents;

use App\Ai\Tools\LookupOrder;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\CanActAsTool;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

#[Provider(Lab::Anthropic)]
class RefundsAgent implements Agent, CanActAsTool, HasTools
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): string
    {
        return 'You are a refunds specialist. Use order details and the refund policy to give concise eligibility guidance.';
    }

    /**
     * Get the agent's tool name.
     */
    public function name(): string
    {
        return 'refunds_specialist';
    }

    /**
     * Get the agent's tool description.
     */
    public function description(): string
    {
        return 'Determine whether an order is eligible for a refund and explain the next step.';
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new LookupOrder,
        ];
    }
}
```

Nếu sub-agent không triển khai `CanActAsTool`, Laravel sẽ sử dụng basename của class agent làm tên tool và một mô tả chung yêu cầu agent cha truyền vào mô tả tác vụ rõ ràng, độc lập. Mỗi lần gọi sub-agent chạy độc lập và không nhận lịch sử hội thoại của agent cha.

<a name="middleware"></a>
### Middleware

Agent hỗ trợ middleware, cho phép bạn chặn và chỉnh sửa prompt trước khi chúng được gửi tới provider. Có thể tạo middleware bằng lệnh Artisan `make:agent-middleware`:

```shell
php artisan make:agent-middleware LogPrompts
```

Middleware được tạo sẽ nằm trong thư mục `app/Ai/Middleware` của ứng dụng. Để thêm middleware vào agent, hãy triển khai interface `HasMiddleware` và định nghĩa phương thức `middleware` trả về một mảng các class middleware:

```php
<?php

namespace App\Ai\Agents;

use App\Ai\Middleware\LogPrompts;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasMiddleware;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasMiddleware
{
    use Promptable;

    // ...

    /**
     * Get the agent's middleware.
     */
    public function middleware(): array
    {
        return [
            new LogPrompts,
        ];
    }
}
```

Mỗi class middleware nên định nghĩa phương thức `handle`, nhận `AgentPrompt` và một `Closure` để chuyển prompt sang middleware tiếp theo:

```php
<?php

namespace App\Ai\Middleware;

use Closure;
use Laravel\Ai\Prompts\AgentPrompt;

class LogPrompts
{
    /**
     * Handle the incoming prompt.
     */
    public function handle(AgentPrompt $prompt, Closure $next)
    {
        Log::info('Prompting agent', ['prompt' => $prompt->prompt]);

        return $next($prompt);
    }
}
```

Bạn có thể sử dụng phương thức `then` trên response để thực thi code sau khi agent xử lý xong. Cơ chế này hoạt động với cả response đồng bộ và streaming:

```php
public function handle(AgentPrompt $prompt, Closure $next)
{
    return $next($prompt)->then(function (AgentResponse $response) {
        Log::info('Agent responded', ['text' => $response->text]);
    });
}
```

<a name="anonymous-agents"></a>
### Agent ẩn danh

Đôi khi bạn có thể muốn tương tác nhanh với model mà không cần tạo một class agent riêng. Bạn có thể tạo một agent ẩn danh, ad-hoc bằng hàm `agent`:

```php
use function Laravel\Ai\{agent};

$response = agent(
    instructions: 'You are an expert at software development.',
    messages: [],
    tools: [],
)->prompt('Tell me about Laravel')
```

Agent ẩn danh cũng có thể tạo structured output:

```php
use Illuminate\Contracts\JsonSchema\JsonSchema;

use function Laravel\Ai\{agent};

$response = agent(
    schema: fn (JsonSchema $schema) => [
        'number' => $schema->integer()->required(),
    ],
)->prompt('Generate a random number less than 100')
```

<a name="agent-configuration"></a>
### Cấu hình agent

Bạn có thể cấu hình các tùy chọn sinh văn bản cho agent bằng PHP attribute. Các attribute sau được hỗ trợ:

- `MaxSteps`: Số bước tối đa agent có thể thực hiện khi sử dụng tool.
- `MaxTokens`: Số token tối đa model có thể sinh.
- `Model`: Model mà agent sẽ sử dụng.
- `Provider`: AI provider (hoặc các provider dùng cho failover) mà agent sẽ sử dụng.
- `Temperature`: Sampling temperature dùng khi sinh nội dung (0.0 đến 1.0).
- `Timeout`: HTTP timeout tính bằng giây cho request của agent (mặc định: 60).
- `TopP`: Xác suất nucleus sampling dùng khi sinh nội dung (0.0 đến 1.0).
- `UseCheapestModel`: Sử dụng text model rẻ nhất của provider để tối ưu chi phí.
- `UseSmartestModel`: Sử dụng text model mạnh nhất của provider cho các tác vụ phức tạp.

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Attributes\TopP;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

#[Provider(Lab::Anthropic)]
#[Model('claude-sonnet-5')]
#[MaxSteps(10)]
#[MaxTokens(4096)]
#[Temperature(0.7)]
#[Timeout(120)]
#[TopP(0.9)]
class SalesCoach implements Agent
{
    use Promptable;

    // ...
}
```

Các attribute `UseCheapestModel` và `UseSmartestModel` cho phép tự động chọn model tiết kiệm chi phí nhất hoặc mạnh nhất của một provider mà không cần chỉ định tên model. Điều này hữu ích khi bạn muốn tối ưu chi phí hoặc năng lực trên nhiều provider:

```php
use Laravel\Ai\Attributes\UseCheapestModel;
use Laravel\Ai\Attributes\UseSmartestModel;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

#[UseCheapestModel]
class SimpleSummarizer implements Agent
{
    use Promptable;

    // Will use the cheapest model (e.g., Haiku)...
}

#[UseSmartestModel]
class ComplexReasoner implements Agent
{
    use Promptable;

    // Will use the most capable model (e.g., Opus)...
}
```

> [!NOTE]
> Model thực tế được `UseCheapestModel` và `UseSmartestModel` chọn có thể thay đổi giữa các phiên bản Laravel AI SDK khi provider phát hành model mới. Việc đổi model có thể dẫn đến thay đổi hành vi, tham số bị deprecated và chênh lệch chi phí đáng kể. Nếu cần model và mức giá ổn định, có thể dự đoán, hãy chỉ định model rõ ràng bằng attribute `Model`.

<a name="provider-options"></a>
### Tùy chọn provider

Nếu agent cần truyền các tùy chọn riêng của provider (chẳng hạn reasoning effort hoặc penalty setting của OpenAI), hãy triển khai contract `HasProviderOptions` và định nghĩa phương thức `providerOptions`:

```php
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasProviderOptions;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

class SalesCoach implements Agent, HasProviderOptions
{
    use Promptable;

    // ...

    /**
     * Get provider-specific generation options.
     */
    public function providerOptions(Lab|string $provider): array
    {
        return match ($provider) {
            Lab::OpenAI => [
                'reasoning' => ['effort' => 'low'],
                'frequency_penalty' => 0.5,
                'presence_penalty' => 0.3,
            ],
            Lab::Anthropic => [
                'thinking' => ['budget_tokens' => 1024],
                'cache_control' => ['type' => 'ephemeral'],
            ],
            default => [],
        };
    }
}
```

Phương thức `providerOptions` nhận provider hiện đang được sử dụng (`Lab` enum hoặc string), cho phép bạn trả về các tùy chọn khác nhau cho từng provider. Điều này đặc biệt hữu ích khi dùng [failover](#failover), vì mỗi fallback provider có thể nhận cấu hình riêng.

Ví dụ Anthropic ở trên cũng bật [prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) thông qua `cache_control`.

<a name="human-tool-approval"></a>
## Phê duyệt tool bởi con người

> [!WARNING]
> Việc phê duyệt tool yêu cầu một agent `Conversational` có lịch sử hội thoại được lưu bền vững để lời gọi đang tạm dừng có thể tiếp tục. Trait `RemembersConversations` cung cấp cơ chế lưu trữ cần thiết.

Các tool thực hiện hành động nhạy cảm hoặc không thể hoàn tác có thể cần con người phê duyệt trước khi được thực thi. Để một tool có thể yêu cầu phê duyệt, hãy triển khai contract `Approvable` và sử dụng trait `InteractsWithApprovals`. Theo mặc định, các tool approvable sẽ yêu cầu phê duyệt:

```php
<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Concerns\InteractsWithApprovals;
use Laravel\Ai\Contracts\Approvable;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class DeleteFile implements Approvable, Tool
{
    use InteractsWithApprovals;

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Delete a file from storage.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        Storage::delete($request['path']);

        return "Deleted [{$request['path']}].";
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'path' => $schema->string()->required(),
        ];
    }
}
```

Để xác định có cần phê duyệt dựa trên các argument của lời gọi tool hay không, hãy định nghĩa phương thức `needsApproval` trên tool. Phương thức này có thể trả về boolean hoặc một instance `Approval` chứa lý do yêu cầu phê duyệt:

```php
use Laravel\Ai\Approvals\Approval;

/**
 * Determine whether the tool needs approval for the given request.
 */
protected function needsApproval(Request $request): Approval|bool
{
    return str_starts_with($request['path'], 'temporary/')
        ? false
        : Approval::required('This will permanently delete a file.');
}
```

Bạn có thể ghi đè yêu cầu phê duyệt của tool khi trả về tool đó từ phương thức `tools` của agent:

```php
public function tools(): iterable
{
    return [
        (new SendNotification)->withoutApproval(),
        (new DeleteFile)->requireApproval('Deletion review required.'),
    ];
}
```

Khi một approvable tool được gọi, agent sẽ tạm dừng trước khi thực thi. Bạn có thể kiểm tra các phê duyệt đang chờ trong response; mỗi mục chứa ID lời gọi tool, tên tool, argument và lý do phê duyệt:

```php
$response = (new FileAssistant)
    ->forUser($user)
    ->prompt('Delete the old invoice.');

if ($response->hasPendingApprovals()) {
    foreach ($response->pendingApprovals as $approval) {
        // $approval->id
        // $approval->tool
        // $approval->arguments
        // $approval->reason
    }
}
```

Để tiếp tục agent, hãy tiếp tục hội thoại và cung cấp một instance `Decisions` chứa quyết định cho từng lời gọi tool đang chờ. Quyết định có thể chấp thuận, từ chối hoặc chỉnh sửa argument trước khi thực thi:

```php
use Laravel\Ai\Approvals\Decision;
use Laravel\Ai\Approvals\Decisions;

$response = (new FileAssistant)
    ->continue($conversationId, as: $user)
    ->prompt(Decisions::from([
        'call_abc' => Decision::approve(),
        'call_ghi' => Decision::reject('The invoice must be retained.'),
    ]));
```

Có thể dùng các giá trị boolean `true` và `false` làm dạng viết tắt cho chấp thuận và từ chối. Mọi lời gọi tool đang chờ đều phải nhận một quyết định. ID lời gọi tool không xác định, bị thiếu hoặc đã được xử lý trước đó sẽ khiến `ApprovalMismatchException` được throw. Bạn có thể cung cấp quyết định mặc định cho các lời gọi không có quyết định rõ ràng bằng phương thức `approveRemaining` hoặc `rejectRemaining`:

```php
$decisions = Decisions::from([
    'call_abc' => true,
])->rejectRemaining('Not approved.');

$response = (new FileAssistant)
    ->continue($conversationId, as: $user)
    ->prompt($decisions);
```

Một quyết định từ chối có result, chẳng hạn `Decision::reject('Not approved.')`, sẽ được trả lại cho model để model có thể tiếp tục phản hồi. Từ chối không có result sẽ dừng vòng lặp sinh nội dung sau khi ghi nhận quyết định từ chối.

Phê duyệt tool được hỗ trợ bởi các phương thức `prompt`, `stream`, `queue`, `broadcast`, `broadcastNow` và `broadcastOnQueue`.

Trong quá trình streaming và broadcasting, trạng thái tạm dừng được biểu diễn bằng event `tool_approval_request`. Khi sử dụng [Vercel AI SDK stream protocol](#streaming-using-the-vercel-ai-sdk-protocol), yêu cầu và kết quả phê duyệt được phát bằng các phần tool approval native của protocol.

Đối với agent chạy qua queue, response kết quả được truyền vào callback `then`, đồng thời Laravel cũng dispatch event `ToolApprovalRequested`.

Laravel lưu kết quả của tool đã được phê duyệt trước khi yêu cầu model tiếp tục. Nếu quá trình sinh nội dung sau đó thất bại, phê duyệt đã được xử lý. Hãy tiếp tục hội thoại bằng một text prompt bình thường thay vì gửi lại cùng các quyết định phê duyệt.

<a name="complete-approval-flow"></a>
### Luồng phê duyệt hoàn chỉnh

Các route sau minh họa một luồng phê duyệt hoàn chỉnh. Route `GET` trả về màn hình chat, còn route `POST` nhận một text prompt mới hoặc các quyết định phê duyệt từ màn hình chat. Ví dụ này giả định model `User` của ứng dụng sử dụng trait `HasConversations`:

```php
use App\Ai\Agents\FileAssistant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Laravel\Ai\Approvals\Decision;
use Laravel\Ai\Approvals\Decisions;
use Laravel\Ai\Models\Conversation;

Route::get('/chat/{conversation}', function (Request $request, Conversation $conversation) {
    Gate::authorize('view', $conversation);

    return view('chat', [
        'conversation' => $conversation,
    ]);
})->middleware('auth');

Route::post('/chat/{conversation}', function (Request $request, Conversation $conversation) {
    Gate::authorize('view', $conversation);

    $validated = $request->validate([
        'message' => ['nullable', 'string', 'required_without:decisions', 'prohibited_with:decisions'],
        'decisions' => ['nullable', 'array', 'required_without:message', 'prohibited_with:message'],
        'decisions.*.action' => ['required_with:decisions', Rule::in(['approve', 'reject'])],
        'decisions.*.result' => ['nullable', 'string'],
    ]);

    $prompt = isset($validated['decisions'])
        ? Decisions::from($validated->collect('decisions')->map(
            fn (array $decision) => match ($decision['action']) {
                'approve' => Decision::approve(),
                'reject' => Decision::reject($decision['result'] ?? null),
            }
        )->all())
        : $validated['message'];

    $response = (new FileAssistant)
        ->continue($conversation->id, as: $request->user())
        ->prompt($prompt);

    return [
        'conversation_id' => $response->conversationId,
        'status' => $response->hasPendingApprovals() ? 'awaiting_approval' : 'complete',
        'message' => $response->text,
        'approvals' => $response->pendingApprovals,
    ];
})->middleware('auth');
```

Khi trạng thái response là `awaiting_approval`, màn hình chat nên render các phê duyệt đang chờ và gửi lựa chọn của người dùng tới cùng endpoint, sử dụng ID lời gọi tool làm key cho từng quyết định:

```json
{
    "decisions": {
        "call_abc": {
            "action": "approve"
        },
        "call_def": {
            "action": "reject",
            "result": "The invoice must be retained."
        }
    }
}
```

Đối với một tin nhắn chat thông thường, màn hình có thể gửi giá trị `message` thay thế:

```json
{
    "message": "Delete the old invoice."
}
```

<a name="images"></a>
## Hình ảnh

Lớp `Laravel\Ai\Image` có thể được sử dụng để tạo hình ảnh bằng các provider `openai`, `gemini` hoặc `xai`:

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')->generate();

$rawContent = (string) $image;
```

Các phương thức `square`, `portrait` và `landscape` có thể được dùng để kiểm soát tỷ lệ khung hình, trong khi phương thức `quality` hướng dẫn model về chất lượng hình ảnh cuối cùng (`high`, `medium`, `low`). Phương thức `timeout` cho phép chỉ định HTTP timeout theo giây:

```php
use Laravel\Ai\Image;

$image = Image::of('A donut sitting on the kitchen counter')
    ->quality('high')
    ->landscape()
    ->timeout(120)
    ->generate();
```

Bạn có thể đính kèm hình ảnh tham chiếu bằng phương thức `attachments`:

```php
use Laravel\Ai\Files;
use Laravel\Ai\Image;

$image = Image::of('Update this photo of me to be in the style of an impressionist painting.')
    ->attachments([
        Files\Image::fromStorage('photo.jpg'),
        // Files\Image::fromPath('/home/laravel/photo.jpg'),
        // Files\Image::fromUrl('https://example.com/photo.jpg'),
        // $request->file('photo'),
    ])
    ->landscape()
    ->generate();
```

Hình ảnh đã tạo có thể dễ dàng được lưu trên disk mặc định được cấu hình trong file `config/filesystems.php` của ứng dụng:

```php
$image = Image::of('A donut sitting on the kitchen counter');

$path = $image->store();
$path = $image->storeAs('image.jpg');
$path = $image->storePublicly();
$path = $image->storePubliclyAs('image.jpg');
```

Việc tạo hình ảnh cũng có thể được đưa vào queue:

```php
use Laravel\Ai\Image;
use Laravel\Ai\Responses\ImageResponse;

Image::of('A donut sitting on the kitchen counter')
    ->portrait()
    ->queue()
    ->then(function (ImageResponse $image) {
        $path = $image->store();

        // ...
    });
```

<a name="audio"></a>
## Âm thanh

Lớp `Laravel\Ai\Audio` có thể được sử dụng để tạo âm thanh từ văn bản được cung cấp:

```php
use Laravel\Ai\Audio;

$audio = Audio::of('I love coding with Laravel.')->generate();

$rawContent = (string) $audio;
```

Bạn cũng có thể tạo âm thanh từ một chuỗi bằng phương thức `toAudio` có sẵn thông qua lớp `Stringable` của Laravel:

```php
use Illuminate\Support\Str;

$audio = Str::of('I love coding with Laravel.')->toAudio();
```

Các phương thức `male`, `female` và `voice` có thể được dùng để xác định giọng nói của âm thanh được tạo:

```php
$audio = Audio::of('I love coding with Laravel.')
    ->female()
    ->generate();

$audio = Audio::of('I love coding with Laravel.')
    ->voice('voice-id-or-name')
    ->generate();
```

Tương tự, phương thức `instructions` có thể được dùng để hướng dẫn động cho model về cách âm thanh được tạo nên phát ra:

```php
$audio = Audio::of('I love coding with Laravel.')
    ->female()
    ->instructions('Said like a pirate')
    ->generate();
```

Âm thanh đã tạo có thể dễ dàng được lưu trên disk mặc định được cấu hình trong file `config/filesystems.php` của ứng dụng:

```php
$audio = Audio::of('I love coding with Laravel.')->generate();

$path = $audio->store();
$path = $audio->storeAs('audio.mp3');
$path = $audio->storePublicly();
$path = $audio->storePubliclyAs('audio.mp3');
```

Việc tạo âm thanh cũng có thể được đưa vào queue:

```php
use Laravel\Ai\Audio;
use Laravel\Ai\Responses\AudioResponse;

Audio::of('I love coding with Laravel.')
    ->queue()
    ->then(function (AudioResponse $audio) {
        $path = $audio->store();

        // ...
    });
```

<a name="transcription"></a>
## Phiên âm

Lớp `Laravel\Ai\Transcription` có thể được sử dụng để tạo bản phiên âm từ âm thanh được cung cấp:

```php
use Laravel\Ai\Transcription;

$transcript = Transcription::fromPath('/home/laravel/audio.mp3')->generate();
$transcript = Transcription::fromStorage('audio.mp3')->generate();
$transcript = Transcription::fromUpload($request->file('audio'))->generate();

return (string) $transcript;
```

Phương thức `diarize` có thể được dùng để yêu cầu response bao gồm bản phiên âm đã phân tách người nói bên cạnh bản phiên âm văn bản thô, cho phép bạn truy cập các đoạn phiên âm theo từng người nói:

```php
$transcript = Transcription::fromStorage('audio.mp3')
    ->diarize()
    ->generate();
```

Việc tạo bản phiên âm cũng có thể được đưa vào queue:

```php
use Laravel\Ai\Transcription;
use Laravel\Ai\Responses\TranscriptionResponse;

Transcription::fromStorage('audio.mp3')
    ->queue()
    ->then(function (TranscriptionResponse $transcript) {
        // ...
    });
```

<a name="text-summarization"></a>
## Tóm tắt văn bản

Bạn có thể tóm tắt văn bản bằng phương thức `summarize` có sẵn thông qua lớp `Stringable` của Laravel. Theo mặc định, bản tóm tắt sẽ không quá ba câu và được tạo bằng text model rẻ nhất của provider đã cấu hình:

```php
use Illuminate\Support\Str;

$summary = Str::of($article)->summarize();
```

Bạn có thể chỉ định số câu tối đa, provider, model và timeout dùng để tạo bản tóm tắt. Lớp `Str` cũng cung cấp phiên bản static của phương thức này:

```php
use Laravel\Ai\Enums\Lab;

$summary = Str::of($article)->summarize(
    sentences: 4,
    provider: Lab::Anthropic,
    model: 'claude-sonnet-5',
    timeout: 30,
);

$summary = Str::summarize($article, sentences: 4);
```

<a name="embeddings"></a>
## Embeddings

Bạn có thể dễ dàng tạo vector embedding cho bất kỳ chuỗi nào bằng phương thức `toEmbeddings` mới có sẵn thông qua lớp `Stringable` của Laravel:

```php
use Illuminate\Support\Str;

$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

Ngoài ra, bạn có thể dùng lớp `Embeddings` để tạo embedding cho nhiều input cùng lúc:

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for([
    'Napa Valley has great wine.',
    'Laravel is a PHP framework.',
])->generate();

$response->embeddings; // [[0.123, 0.456, ...], [0.789, 0.012, ...]]
```

Bạn có thể chỉ định số chiều và provider cho các embedding:

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->dimensions(1536)
    ->generate(Lab::OpenAI, 'text-embedding-3-small');
```

<a name="multimodal-embeddings"></a>
### Embedding đa phương thức

Ngoài chuỗi, phương thức `Embeddings::for` chấp nhận input hình ảnh, âm thanh, tài liệu và video, cho phép bạn tạo embedding cho nội dung không phải văn bản. Gemini hỗ trợ embedding hình ảnh, âm thanh, tài liệu và video, trong khi VoyageAI hỗ trợ embedding hình ảnh và video:

```php
use Laravel\Ai\Embeddings;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Image;
use Laravel\Ai\Files\Video;

$response = Embeddings::for([
    'A vineyard at sunset.',
    Image::fromStorage('vineyard.jpg'),
    Video::fromPath('/home/laravel/tour.mp4'),
])->generate(Lab::Gemini);
```

Input đa phương thức sử dụng cùng các [lớp file dùng cho attachment](#attachments). Các file này có thể được tạo từ đường dẫn local, filesystem disk, URL từ xa hoặc nội dung mã hóa Base64. Hình ảnh, tài liệu và video cũng có thể được tạo từ file upload, còn tài liệu có thể được tạo từ nội dung chuỗi thô:

```php
use Laravel\Ai\Files\Audio;
use Laravel\Ai\Files\Document;
use Laravel\Ai\Files\Image;
use Laravel\Ai\Files\Video;

Image::fromPath('/home/laravel/photo.jpg');
Image::fromStorage('photo.jpg');
Image::fromUpload($request->file('photo'));

Audio::fromPath('/home/laravel/clip.mp3');
Audio::fromStorage('clip.mp3');
Audio::fromUpload($request->file('clip.mp3'));

Video::fromPath('/home/laravel/video.mp4');
Video::fromStorage('video.mp4');
Video::fromUpload($request->file('video'));

Document::fromUrl('https://example.com/report.pdf');
Document::fromString('Laravel is a PHP framework.', 'text/plain');
Document::fromUpload($request->file('report'));
```

> [!NOTE]
> VoyageAI không cho phép trộn media từ URL từ xa và media mã hóa Base64 trong cùng một request. File local, file đã lưu và file upload được gửi dưới dạng nội dung mã hóa Base64, còn input văn bản có thể kết hợp với một trong hai nguồn media. Hãy tham khảo tài liệu của provider để xác định model đa phương thức và loại input nào khả dụng.

<a name="querying-embeddings"></a>
### Truy vấn embedding

Sau khi tạo embedding, thông thường bạn sẽ lưu chúng trong một cột `vector` của database để truy vấn sau này. Laravel hỗ trợ native cho cột vector trên PostgreSQL thông qua extension `pgvector` và trên MariaDB. Để bắt đầu, hãy định nghĩa cột `vector` trong migration và chỉ định số chiều:

```php
Schema::ensureVectorExtensionExists();

Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->vector('embedding', dimensions: 1536);
    $table->timestamps();
});
```

Bạn cũng có thể thêm vector index để tăng tốc tìm kiếm tương đồng. Khi gọi `index` trên cột vector, Laravel sẽ tự động tạo HNSW index với cosine distance:

```php
$table->vector('embedding', dimensions: 1536)->index();
```

Trên Eloquent model, bạn nên cast cột vector bằng cast `AsVector`:

```php
use Illuminate\Database\Eloquent\Casts\AsVector;

protected function casts(): array
{
    return [
        'embedding' => AsVector::class,
    ];
}
```

Để truy vấn các record tương đồng, hãy dùng phương thức `whereVectorSimilarTo`. Phương thức này lọc kết quả theo cosine similarity tối thiểu (từ `0.0` đến `1.0`, trong đó `1.0` là giống hệt) và sắp xếp kết quả theo độ tương đồng:

```php
use App\Models\Document;

$documents = Document::query()
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

`$queryEmbedding` có thể là một mảng số thực hoặc một chuỗi thuần. Khi truyền chuỗi, Laravel sẽ tự động tạo embedding cho chuỗi đó:

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', 'best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

Nếu cần kiểm soát chi tiết hơn, bạn có thể sử dụng độc lập các phương thức cấp thấp `whereVectorDistanceLessThan`, `selectVectorDistance` và `orderByVectorDistance`:

```php
$documents = Document::query()
    ->select('*')
    ->selectVectorDistance('embedding', $queryEmbedding, as: 'distance')
    ->whereVectorDistanceLessThan('embedding', $queryEmbedding, maxDistance: 0.3)
    ->orderByVectorDistance('embedding', $queryEmbedding)
    ->limit(10)
    ->get();
```

Nếu muốn cung cấp cho agent khả năng thực hiện tìm kiếm tương đồng dưới dạng một tool, hãy xem tài liệu tool [Similarity Search](#similarity-search).

> [!NOTE]
> Truy vấn vector hiện được hỗ trợ trên kết nối PostgreSQL sử dụng extension `pgvector` và MariaDB 11.7 trở lên.

<a name="caching-embeddings"></a>
### Cache embedding

Việc tạo embedding có thể được cache để tránh các API call dư thừa cho input giống nhau. Để bật cache, hãy đặt tùy chọn cấu hình `ai.caching.embeddings.cache` thành `true`:

```php
'caching' => [
    'embeddings' => [
        'cache' => true,
        'store' => env('CACHE_STORE', 'database'),
        // ...
    ],
],
```

Khi cache được bật, embedding được cache trong 30 ngày. Cache key dựa trên provider, model, số chiều và nội dung input, bảo đảm request giống nhau trả về kết quả đã cache trong khi cấu hình khác sẽ tạo embedding mới.

Bạn cũng có thể bật cache cho một request cụ thể bằng phương thức `cache`, ngay cả khi cache toàn cục đang tắt:

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->cache()
    ->generate();
```

Bạn có thể chỉ định thời lượng cache tùy chỉnh theo giây:

```php
$response = Embeddings::for(['Napa Valley has great wine.'])
    ->cache(seconds: 3600) // Cache for 1 hour
    ->generate();
```

Phương thức `toEmbeddings` của Stringable cũng chấp nhận đối số `cache`:

```php
// Cache with default duration...
$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings(cache: true);

// Cache for a specific duration...
$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings(cache: 3600);
```

<a name="reranking"></a>
## Reranking

Reranking cho phép bạn sắp xếp lại danh sách tài liệu dựa trên mức độ liên quan với một truy vấn nhất định. Điều này hữu ích để cải thiện kết quả tìm kiếm bằng khả năng hiểu ngữ nghĩa:

Lớp `Laravel\Ai\Reranking` có thể được sử dụng để rerank tài liệu:

```php
use Laravel\Ai\Reranking;

$response = Reranking::of([
    'Django is a Python web framework.',
    'Laravel is a PHP web application framework.',
    'React is a JavaScript library for building user interfaces.',
])->rerank('PHP frameworks');

// Access the top result...
$response->first()->document; // "Laravel is a PHP web application framework."
$response->first()->score;    // 0.95
$response->first()->index;    // 1 (original position)
```

Phương thức `limit` có thể được dùng để giới hạn số lượng kết quả trả về:

```php
$response = Reranking::of($documents)
    ->limit(5)
    ->rerank('search query');
```

<a name="reranking-collections"></a>
### Rerank collection

Để thuận tiện, Laravel collection có thể được rerank bằng macro `rerank`. Đối số đầu tiên chỉ định field nào được dùng để rerank, còn đối số thứ hai là truy vấn:

```php
// Rerank by a single field...
$posts = Post::all()
    ->rerank('body', 'Laravel tutorials');

// Rerank by multiple fields (sent as JSON)...
$reranked = $posts->rerank(['title', 'body'], 'Laravel tutorials');

// Rerank using a closure to build the document...
$reranked = $posts->rerank(
    fn ($post) => $post->title.': '.$post->body,
    'Laravel tutorials'
);
```

Bạn cũng có thể giới hạn số lượng kết quả và chỉ định provider:

```php
$reranked = $posts->rerank(
    by: 'content',
    query: 'Laravel tutorials',
    limit: 10,
    provider: Lab::Cohere
);
```

<a name="files"></a>
## File

Lớp `Laravel\Ai\Files` hoặc từng lớp file riêng lẻ có thể được dùng để lưu file với AI provider nhằm sử dụng lại trong các cuộc hội thoại sau. Điều này hữu ích với tài liệu lớn hoặc file bạn muốn tham chiếu nhiều lần mà không cần upload lại:

```php
use Laravel\Ai\Files\Document;
use Laravel\Ai\Files\Image;

// Store a file from a local path...
$response = Document::fromPath('/home/laravel/document.pdf')->put();
$response = Image::fromPath('/home/laravel/photo.jpg')->put();

// Store a file that is stored on a filesystem disk...
$response = Document::fromStorage('document.pdf', disk: 'local')->put();
$response = Image::fromStorage('photo.jpg', disk: 'local')->put();

// Store a file that is stored on a remote URL...
$response = Document::fromUrl('https://example.com/document.pdf')->put();
$response = Image::fromUrl('https://example.com/photo.jpg')->put();

return $response->id;
```

Bạn cũng có thể lưu nội dung thô hoặc file đã upload:

```php
use Laravel\Ai\Files;
use Laravel\Ai\Files\Document;

// Store raw content...
$stored = Document::fromString('Hello, World!', 'text/plain')->put();

// Store an uploaded file...
$stored = Document::fromUpload($request->file('document'))->put();
```

Sau khi file đã được lưu, bạn có thể tham chiếu file khi tạo văn bản thông qua agent thay vì upload lại file:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Files;

$response = (new SalesCoach)->prompt(
    'Analyze the attached sales transcript...'
    attachments: [
        Files\Document::fromId('file-id') // Attach a stored document...
    ]
);
```

Để lấy một file đã lưu trước đó, hãy dùng phương thức `get` trên file instance:

```php
use Laravel\Ai\Files\Document;

$file = Document::fromId('file-id')->get();

$file->id;
$file->mimeType();
```

Để xóa file khỏi provider, hãy dùng phương thức `delete`:

```php
Document::fromId('file-id')->delete();
```

Theo mặc định, lớp `Files` sử dụng AI provider mặc định được cấu hình trong file `config/ai.php` của ứng dụng. Với hầu hết thao tác, bạn có thể chỉ định provider khác bằng đối số `provider`:

```php
$response = Document::fromPath(
    '/home/laravel/document.pdf'
)->put(provider: Lab::Anthropic);
```

Bạn có thể truyền các tùy chọn upload dành riêng cho provider bằng phương thức `withProviderOptions`. Ví dụ, bạn có thể đặt `purpose` cho file của OpenAI:

```php
use Laravel\Ai\Files\Document;

$response = Document::fromPath('/home/laravel/knowledge.txt')
    ->withProviderOptions(['purpose' => 'assistants'])
    ->put();
```

Để giới hạn tùy chọn theo từng provider, hãy truyền một closure nhận provider hiện tại:

```php
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Document;

$response = Document::fromPath('/home/laravel/training.jsonl')
    ->withProviderOptions(fn (Lab|string $provider) => match ($provider) {
        Lab::OpenAI => ['purpose' => 'fine-tune'],
        default => [],
    })
    ->put();
```

<a name="using-stored-files-in-conversations"></a>
### Sử dụng file đã lưu trong hội thoại

Sau khi file đã được lưu với provider, bạn có thể tham chiếu nó trong hội thoại của agent bằng phương thức `fromId` trên các lớp `Document` hoặc `Image`:

```php
use App\Ai\Agents\DocumentAnalyzer;
use Laravel\Ai\Files;
use Laravel\Ai\Files\Document;

$stored = Document::fromPath('/path/to/report.pdf')->put();

$response = (new DocumentAnalyzer)->prompt(
    'Summarize this document.',
    attachments: [
        Document::fromId($stored->id),
    ],
);
```

Tương tự, hình ảnh đã lưu có thể được tham chiếu bằng lớp `Image`:

```php
use Laravel\Ai\Files;
use Laravel\Ai\Files\Image;

$stored = Image::fromPath('/path/to/photo.jpg')->put();

$response = (new ImageAnalyzer)->prompt(
    'What is in this image?',
    attachments: [
        Image::fromId($stored->id),
    ],
);
```

<a name="vector-stores"></a>
## Vector store

Vector store cho phép bạn tạo các collection file có thể tìm kiếm để sử dụng cho retrieval-augmented generation (RAG). Lớp `Laravel\Ai\Stores` cung cấp các phương thức để tạo, lấy và xóa vector store:

```php
use Laravel\Ai\Stores;

// Create a new vector store...
$store = Stores::create('Knowledge Base');

// Create a store with additional options...
$store = Stores::create(
    name: 'Knowledge Base',
    description: 'Documentation and reference materials.',
    expiresWhenIdleFor: days(30),
);

return $store->id;
```

Để lấy một vector store hiện có theo ID, hãy dùng phương thức `get`:

```php
use Laravel\Ai\Stores;

$store = Stores::get('store_id');

$store->id;
$store->name;
$store->fileCounts;
$store->ready;
```

Để xóa vector store, hãy dùng phương thức `delete` trên lớp `Stores` hoặc store instance:

```php
use Laravel\Ai\Stores;

// Delete by ID...
Stores::delete('store_id');

// Or delete via a store instance...
$store = Stores::get('store_id');

$store->delete();
```

<a name="adding-files-to-stores"></a>
### Thêm file vào store

Sau khi có vector store, bạn có thể thêm [file](#files) vào đó bằng phương thức `add`. File được thêm vào store sẽ tự động được index để tìm kiếm ngữ nghĩa bằng [file search provider tool](#file-search):

```php
use Laravel\Ai\Files\Document;
use Laravel\Ai\Stores;

$store = Stores::get('store_id');

// Add a file that has already been stored with the provider...
$document = $store->add('file_id');
$document = $store->add(Document::fromId('file_id'));

// Or, store and add a file in one step...
$document = $store->add(Document::fromPath('/path/to/document.pdf'));
$document = $store->add(Document::fromStorage('manual.pdf'));
$document = $store->add($request->file('document'));

$document->id;
$document->fileId;
```

> **Lưu ý:** Thông thường, khi thêm file đã lưu trước đó vào vector store, document ID trả về sẽ trùng với ID đã được gán cho file; tuy nhiên, một số vector storage provider có thể trả về một "document ID" mới và khác. Vì vậy, bạn nên luôn lưu cả hai ID trong database để tham chiếu về sau.

Bạn có thể gắn metadata vào file khi thêm chúng vào store. Metadata này sau đó có thể được dùng để lọc kết quả tìm kiếm khi sử dụng [file search provider tool](#file-search):

```php
$store->add(Document::fromPath('/path/to/document.pdf'), metadata: [
    'author' => 'Taylor Otwell',
    'department' => 'Engineering',
    'year' => 2026,
]);
```

Để gỡ file khỏi store, hãy dùng phương thức `remove`:

```php
$store->remove('file_id');
```

Việc gỡ file khỏi vector store không xóa file đó khỏi [file storage](#files) của provider. Để gỡ file khỏi vector store đồng thời xóa vĩnh viễn khỏi file storage, hãy dùng đối số `deleteFile`:

```php
$store->remove('file_abc123', deleteFile: true);
```

<a name="failover"></a>
## Failover

Khi prompt hoặc tạo media khác, bạn có thể cung cấp một mảng provider / model để tự động failover sang provider / model dự phòng nếu provider chính gặp gián đoạn dịch vụ hoặc rate limit:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Image;

$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: [Lab::OpenAI, Lab::Anthropic],
);

$image = Image::of('A donut sitting on the kitchen counter')
    ->generate(provider: [Lab::Gemini, Lab::xAI]);
```

Failover chỉ xảy ra khi `FailoverableException` được throw — chẳng hạn rate limit (`RateLimitedException`), provider quá tải hoặc không khả dụng (`ProviderOverloadedException`), hay không đủ credit (`InsufficientCreditsException`). Các lỗi thông thường như validation error hoặc bad request sẽ không kích hoạt failover.

Khi truyền danh sách provider thuần như `[Lab::OpenAI, Lab::Anthropic]`, mỗi provider sử dụng model mặc định của nó. Để chỉ định model cụ thể cho từng provider trong chuỗi failover, hãy truyền associative array với key là provider, sử dụng `value` của enum `Lab` làm key (enum case không thể được dùng trực tiếp làm PHP array key):

```php
use Laravel\Ai\Enums\Lab;

$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: [
        Lab::Gemini->value => 'gemini-3-flash-preview',
        Lab::DeepSeek->value => 'deepseek-v4-pro',
    ],
);
```

<a name="testing"></a>
## Kiểm thử

Khi giả lập việc tạo hình ảnh, âm thanh, phiên âm hoặc embedding đã được đưa vào queue, mọi callback `then` đã đăng ký trên tác vụ tạo trong queue sẽ được gọi với response giả lập, cho phép bạn kiểm thử logic bên trong callback. Nếu không muốn các callback này được gọi, bạn cũng có thể giả lập queue bằng `Queue::fake()`.

<a name="testing-agents"></a>
### Agent

Để giả lập response của agent trong quá trình kiểm thử, hãy gọi phương thức `fake` trên class agent. Bạn có thể tùy chọn cung cấp một mảng response hoặc một closure:

```php
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Prompts\AgentPrompt;

// Automatically generate a fixed response for every prompt...
SalesCoach::fake();

// Provide a list of prompt responses...
SalesCoach::fake([
    'First response',
    'Second response',
]);

// Dynamically handle prompt responses based on the incoming prompt...
SalesCoach::fake(function (AgentPrompt $prompt) {
    return 'Response for: '.$prompt->prompt;
});
```

Khi giả lập một agent trả về structured output, bạn có thể cung cấp các mảng làm response. Agent sẽ trả về một structured response chứa dữ liệu đã cho:

```php
SalesCoach::fake([
    ['score' => 87],
]);
```

Bạn cũng có thể giả lập một response đang chờ phê duyệt tool:

```php
use Laravel\Ai\Approvals\PendingApproval;
use Laravel\Ai\Responses\AgentResponse;

FileAssistant::fake([
    AgentResponse::fakeWithPendingApprovals([
        new PendingApproval(
            id: 'call_abc',
            tool: 'DeleteFile',
            arguments: ['path' => 'invoice.pdf'],
            reason: 'This will permanently delete a file.',
        ),
    ]),
]);

$response = (new FileAssistant)->prompt('Delete the invoice.');

$response->hasPendingApprovals(); // true
```

> **Lưu ý:** Khi `Agent::fake()` được gọi trên một agent trả về structured output và fake output không được cung cấp rõ ràng, Laravel sẽ tự động tạo dữ liệu giả phù hợp với output schema đã định nghĩa của agent.

Sau khi gửi prompt cho agent, bạn có thể thực hiện các assertion đối với những prompt đã nhận:

```php
use Laravel\Ai\Prompts\AgentPrompt;

SalesCoach::assertPrompted('Analyze this...');

SalesCoach::assertPrompted(function (AgentPrompt $prompt) {
    return $prompt->contains('Analyze');
});

SalesCoach::assertPromptedTimes(3);

SalesCoach::assertNotPrompted('Missing prompt');

SalesCoach::assertNeverPrompted();
```

Khi assertion một lần tiếp tục sau phê duyệt, bạn có thể kiểm tra các quyết định phê duyệt của prompt:

```php
use Laravel\Ai\Approvals\Decisions;
use Laravel\Ai\Prompts\AgentPrompt;

FileAssistant::fake();

(new FileAssistant)->prompt(Decisions::from([
    'call_abc' => true,
]));

FileAssistant::assertPrompted(function (AgentPrompt $prompt) {
    return $prompt->hasApprovalDecisions()
        && $prompt->approvalDecisions->get('call_abc')->isApproved();
});
```

Đối với các lần gọi agent qua queue, hãy sử dụng các phương thức assertion dành cho queue:

```php
use Laravel\Ai\QueuedAgentPrompt;

SalesCoach::assertQueued('Analyze this...');

SalesCoach::assertQueued(function (QueuedAgentPrompt $prompt) {
    return $prompt->contains('Analyze');
});

SalesCoach::assertNotQueued('Missing prompt');

SalesCoach::assertNeverQueued();
```

Để bảo đảm mọi lần gọi agent đều có fake response tương ứng, bạn có thể sử dụng `preventStrayPrompts`. Nếu một agent được gọi mà không có fake response đã định nghĩa, một exception sẽ được ném ra:

```php
SalesCoach::fake()->preventStrayPrompts();
```

<a name="testing-images"></a>
### Hình ảnh

Việc tạo hình ảnh có thể được giả lập bằng cách gọi phương thức `fake` trên class `Image`. Sau khi đã giả lập hình ảnh, bạn có thể thực hiện nhiều assertion đối với các prompt tạo hình ảnh đã được ghi lại:

```php
use Laravel\Ai\Image;
use Laravel\Ai\Prompts\ImagePrompt;
use Laravel\Ai\Prompts\QueuedImagePrompt;

// Automatically generate a fixed response for every prompt...
Image::fake();

// Provide a list of prompt responses...
Image::fake([
    base64_encode($firstImage),
    base64_encode($secondImage),
]);

// Dynamically handle prompt responses based on the incoming prompt...
Image::fake(function (ImagePrompt $prompt) {
    return base64_encode('...');
});
```

Sau khi tạo hình ảnh, bạn có thể thực hiện các assertion đối với những prompt đã nhận:

```php
Image::assertGenerated(function (ImagePrompt $prompt) {
    return $prompt->contains('sunset') && $prompt->isLandscape();
});

Image::assertNotGenerated('Missing prompt');

Image::assertNothingGenerated();
```

Đối với việc tạo hình ảnh qua queue, hãy sử dụng các phương thức assertion dành cho queue:

```php
Image::assertQueued(
    fn (QueuedImagePrompt $prompt) => $prompt->contains('sunset')
);

Image::assertNotQueued('Missing prompt');

Image::assertNothingQueued();
```

Để bảo đảm mọi lần tạo hình ảnh đều có fake response tương ứng, bạn có thể sử dụng `preventStrayImages`. Nếu một hình ảnh được tạo mà không có fake response đã định nghĩa, một exception sẽ được ném ra:

```php
Image::fake()->preventStrayImages();
```

<a name="testing-audio"></a>
### Âm thanh

Việc tạo âm thanh có thể được giả lập bằng cách gọi phương thức `fake` trên class `Audio`. Sau khi đã giả lập âm thanh, bạn có thể thực hiện nhiều assertion đối với các prompt tạo âm thanh đã được ghi lại:

```php
use Laravel\Ai\Audio;
use Laravel\Ai\Prompts\AudioPrompt;
use Laravel\Ai\Prompts\QueuedAudioPrompt;

// Automatically generate a fixed response for every prompt...
Audio::fake();

// Provide a list of prompt responses...
Audio::fake([
    base64_encode($firstAudio),
    base64_encode($secondAudio),
]);

// Dynamically handle prompt responses based on the incoming prompt...
Audio::fake(function (AudioPrompt $prompt) {
    return base64_encode('...');
});
```

Sau khi tạo âm thanh, bạn có thể thực hiện các assertion đối với những prompt đã nhận:

```php
Audio::assertGenerated(function (AudioPrompt $prompt) {
    return $prompt->contains('Hello') && $prompt->isFemale();
});

Audio::assertNotGenerated('Missing prompt');

Audio::assertNothingGenerated();
```

Đối với việc tạo âm thanh qua queue, hãy sử dụng các phương thức assertion dành cho queue:

```php
Audio::assertQueued(
    fn (QueuedAudioPrompt $prompt) => $prompt->contains('Hello')
);

Audio::assertNotQueued('Missing prompt');

Audio::assertNothingQueued();
```

Để bảo đảm mọi lần tạo âm thanh đều có fake response tương ứng, bạn có thể sử dụng `preventStrayAudio`. Nếu âm thanh được tạo mà không có fake response đã định nghĩa, một exception sẽ được ném ra:

```php
Audio::fake()->preventStrayAudio();
```

<a name="testing-transcriptions"></a>
### Phiên âm

Việc tạo phiên âm có thể được giả lập bằng cách gọi phương thức `fake` trên class `Transcription`. Sau khi đã giả lập phiên âm, bạn có thể thực hiện nhiều assertion đối với các prompt tạo phiên âm đã được ghi lại:

```php
use Laravel\Ai\Transcription;
use Laravel\Ai\Prompts\TranscriptionPrompt;
use Laravel\Ai\Prompts\QueuedTranscriptionPrompt;

// Automatically generate a fixed response for every prompt...
Transcription::fake();

// Provide a list of prompt responses...
Transcription::fake([
    'First transcription text.',
    'Second transcription text.',
]);

// Dynamically handle prompt responses based on the incoming prompt...
Transcription::fake(function (TranscriptionPrompt $prompt) {
    return 'Transcribed text...';
});
```

Sau khi tạo phiên âm, bạn có thể thực hiện các assertion đối với những prompt đã nhận:

```php
Transcription::assertGenerated(function (TranscriptionPrompt $prompt) {
    return $prompt->language === 'en' && $prompt->isDiarized();
});

Transcription::assertNotGenerated(
    fn (TranscriptionPrompt $prompt) => $prompt->language === 'fr'
);

Transcription::assertNothingGenerated();
```

Đối với việc tạo phiên âm qua queue, hãy sử dụng các phương thức assertion dành cho queue:

```php
Transcription::assertQueued(
    fn (QueuedTranscriptionPrompt $prompt) => $prompt->isDiarized()
);

Transcription::assertNotQueued(
    fn (QueuedTranscriptionPrompt $prompt) => $prompt->language === 'fr'
);

Transcription::assertNothingQueued();
```

Để bảo đảm mọi lần tạo phiên âm đều có fake response tương ứng, bạn có thể sử dụng `preventStrayTranscriptions`. Nếu một phiên âm được tạo mà không có fake response đã định nghĩa, một exception sẽ được ném ra:

```php
Transcription::fake()->preventStrayTranscriptions();
```

<a name="testing-embeddings"></a>
### Embeddings

Việc tạo embedding có thể được giả lập bằng cách gọi phương thức `fake` trên class `Embeddings`. Sau khi đã giả lập embedding, bạn có thể thực hiện nhiều assertion đối với các prompt tạo embedding đã được ghi lại:

```php
use Laravel\Ai\Embeddings;
use Laravel\Ai\Prompts\EmbeddingsPrompt;
use Laravel\Ai\Prompts\QueuedEmbeddingsPrompt;

// Automatically generate fake embeddings of the proper dimensions for every prompt...
Embeddings::fake();

// Provide a list of prompt responses...
Embeddings::fake([
    [$firstEmbeddingVector],
    [$secondEmbeddingVector],
]);

// Dynamically handle prompt responses based on the incoming prompt...
Embeddings::fake(function (EmbeddingsPrompt $prompt) {
    return array_map(
        fn () => Embeddings::fakeEmbedding($prompt->dimensions),
        $prompt->inputs
    );
});
```

Sau khi tạo embedding, bạn có thể thực hiện các assertion đối với những prompt đã nhận:

```php
Embeddings::assertGenerated(function (EmbeddingsPrompt $prompt) {
    return $prompt->contains('Laravel') && $prompt->dimensions === 1536;
});

Embeddings::assertNotGenerated(
    fn (EmbeddingsPrompt $prompt) => $prompt->contains('Other')
);

Embeddings::assertNothingGenerated();
```

Đối với việc tạo embedding qua queue, hãy sử dụng các phương thức assertion dành cho queue:

```php
Embeddings::assertQueued(
    fn (QueuedEmbeddingsPrompt $prompt) => $prompt->contains('Laravel')
);

Embeddings::assertNotQueued(
    fn (QueuedEmbeddingsPrompt $prompt) => $prompt->contains('Other')
);

Embeddings::assertNothingQueued();
```

Để bảo đảm mọi lần tạo embedding đều có fake response tương ứng, bạn có thể sử dụng `preventStrayEmbeddings`. Nếu embedding được tạo mà không có fake response đã định nghĩa, một exception sẽ được ném ra:

```php
Embeddings::fake()->preventStrayEmbeddings();
```

<a name="testing-reranking"></a>
### Reranking

Các thao tác reranking có thể được giả lập bằng cách gọi phương thức `fake` trên class `Reranking`:

```php
use Laravel\Ai\Reranking;
use Laravel\Ai\Prompts\RerankingPrompt;
use Laravel\Ai\Responses\Data\RankedDocument;

// Automatically generate a fake reranked responses...
Reranking::fake();

// Provide custom responses...
Reranking::fake([
    [
        new RankedDocument(index: 0, document: 'First', score: 0.95),
        new RankedDocument(index: 1, document: 'Second', score: 0.80),
    ],
]);
```

Sau khi reranking, bạn có thể thực hiện các assertion đối với những thao tác đã được thực hiện:

```php
Reranking::assertReranked(function (RerankingPrompt $prompt) {
    return $prompt->contains('Laravel') && $prompt->limit === 5;
});

Reranking::assertNotReranked(
    fn (RerankingPrompt $prompt) => $prompt->contains('Django')
);

Reranking::assertNothingReranked();
```

<a name="testing-files"></a>
### File

Các thao tác file có thể được giả lập bằng cách gọi phương thức `fake` trên class `Files`:

```php
use Laravel\Ai\Files;

Files::fake();
```

Sau khi các thao tác file đã được giả lập, bạn có thể thực hiện các assertion đối với những lần upload và xóa đã xảy ra:

```php
use Laravel\Ai\Contracts\Files\StorableFile;
use Laravel\Ai\Files\Document;

// Store files...
Document::fromString('Hello, Laravel!', mimeType: 'text/plain')
    ->as('hello.txt')
    ->put();

// Make assertions...
Files::assertStored(fn (StorableFile $file) =>
    (string) $file === 'Hello, Laravel!' &&
        $file->mimeType() === 'text/plain';
);

Files::assertNotStored(fn (StorableFile $file) =>
    (string) $file === 'Hello, World!'
);

Files::assertNothingStored();
```

Để assertion việc xóa file, bạn có thể truyền vào ID của file:

```php
Files::assertDeleted('file-id');
Files::assertNotDeleted('file-id');
Files::assertNothingDeleted();
```

<a name="testing-vector-stores"></a>
### Vector store

Các thao tác vector store có thể được giả lập bằng cách gọi phương thức `fake` trên class `Stores`. Việc giả lập store cũng sẽ tự động giả lập [các thao tác file](#files):

```php
use Laravel\Ai\Stores;

Stores::fake();
```

Sau khi các thao tác store đã được giả lập, bạn có thể thực hiện các assertion đối với những store đã được tạo hoặc xóa:

```php
use Laravel\Ai\Stores;

// Create store...
$store = Stores::create('Knowledge Base');

// Make assertions...
Stores::assertCreated('Knowledge Base');

Stores::assertCreated(fn (string $name, ?string $description) =>
    $name === 'Knowledge Base'
);

Stores::assertNotCreated('Other Store');

Stores::assertNothingCreated();
```

Để assertion việc xóa store, bạn có thể cung cấp ID của store:

```php
Stores::assertDeleted('store_id');
Stores::assertNotDeleted('other_store_id');
Stores::assertNothingDeleted();
```

Để assertion rằng file đã được thêm vào hoặc xóa khỏi một store, hãy sử dụng các phương thức assertion trên instance `Store` tương ứng:

```php
Stores::fake();

$store = Stores::get('store_id');

// Add / remove files...
$store->add('added_id');
$store->remove('removed_id');

// Make assertions...
$store->assertAdded('added_id');
$store->assertRemoved('removed_id');

$store->assertNotAdded('other_file_id');
$store->assertNotRemoved('other_file_id');
```

Nếu một file được lưu trong [file storage](#files) của provider và được thêm vào vector store trong cùng một request, bạn có thể không biết provider ID của file. Trong trường hợp này, bạn có thể truyền một closure vào phương thức `assertAdded` để assertion dựa trên nội dung của file đã thêm:

```php
use Laravel\Ai\Contracts\Files\StorableFile;
use Laravel\Ai\Files\Document;

$store->add(Document::fromString('Hello, World!', 'text/plain')->as('hello.txt'));

$store->assertAdded(fn (StorableFile $file) => $file->name() === 'hello.txt');
$store->assertAdded(fn (StorableFile $file) => $file->content() === 'Hello, World!');
```

<a name="events"></a>
## Events

Laravel AI SDK dispatch nhiều [event](/events), bao gồm:

- `AddingFileToStore`
- `AgentFailed`
- `AgentFailedOver`
- `AgentPrompted`
- `AgentStreamed`
- `AudioGenerated`
- `CreatingStore`
- `EmbeddingsGenerated`
- `FileAddedToStore`
- `FileDeleted`
- `FileRemovedFromStore`
- `FileStored`
- `GeneratingAudio`
- `GeneratingEmbeddings`
- `GeneratingImage`
- `GeneratingTranscription`
- `ImageGenerated`
- `InvokingTool`
- `PromptingAgent`
- `ProviderFailedOver`
- `RemovingFileFromStore`
- `Reranked`
- `Reranking`
- `StartingStep`
- `StepCompleted`
- `StepFailed`
- `StoreCreated`
- `StoreDeleted`
- `StoringFile`
- `StreamingAgent`
- `ToolApprovalRequested`
- `ToolApprovalResolved`
- `ToolFailed`
- `ToolInvoked`
- `TranscriptionGenerated`

Bạn có thể lắng nghe bất kỳ event nào trong số này để ghi log hoặc lưu trữ thông tin sử dụng AI SDK.
