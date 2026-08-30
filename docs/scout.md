# Laravel Scout

<a name="introduction"></a>
## Giới thiệu

[Laravel Scout](https://github.com/laravel/scout) cung cấp một giải pháp đơn giản dựa trên driver để bổ sung tìm kiếm full-text cho [Eloquent model](/eloquent). Bằng cách sử dụng model observer, Scout sẽ tự động giữ các search index đồng bộ với các bản ghi Eloquent của bạn.

Scout đi kèm `database` engine tích hợp sẵn, sử dụng full-text index của MySQL / PostgreSQL và các mệnh đề `LIKE` để tìm kiếm trực tiếp trong database hiện có — không cần dịch vụ bên ngoài. Với phần lớn ứng dụng, đây là tất cả những gì bạn cần. Để xem tổng quan về các lựa chọn tìm kiếm có sẵn trong Laravel, hãy tham khảo [tài liệu search](/search).

Scout cũng bao gồm các driver cho [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com), [Typesense](https://typesense.org) và [Turbopuffer](https://turbopuffer.com) khi bạn cần các tính năng như chịu lỗi chính tả, lọc theo facet, vector search hoặc geo-search ở quy mô rất lớn. Driver `collection` cũng có sẵn cho phát triển local, và bạn cũng có thể tự viết [custom engine](#custom-engines).

<a name="installation"></a>
## Cài đặt

Trước tiên, hãy cài đặt Scout thông qua Composer:

```shell
composer require laravel/scout
```

Sau khi cài đặt Scout, bạn nên publish file cấu hình Scout bằng lệnh Artisan `vendor:publish`. Lệnh này sẽ publish file cấu hình `scout.php` vào thư mục `config` của ứng dụng:

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

Cuối cùng, thêm trait `Laravel\Scout\Searchable` vào model mà bạn muốn có khả năng tìm kiếm. Trait này sẽ đăng ký một model observer để tự động giữ model đồng bộ với search driver:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;
}
```

<a name="queueing"></a>
### Đưa vào hàng đợi

Khi sử dụng engine không phải `database` hoặc `collection`, bạn nên cân nhắc nghiêm túc việc cấu hình một [queue driver](/queues) trước khi dùng thư viện. Chạy queue worker cho phép Scout đưa vào hàng đợi mọi thao tác đồng bộ thông tin model với search index, nhờ đó cải thiện đáng kể thời gian phản hồi của giao diện web.

Sau khi cấu hình queue driver, hãy đặt giá trị tùy chọn `queue` trong file `config/scout.php` thành `true`:

```php
'queue' => true,
```

Ngay cả khi tùy chọn `queue` được đặt thành `false`, cần nhớ rằng một số Scout driver như Algolia và Meilisearch luôn index bản ghi theo cách bất đồng bộ. Nói cách khác, dù thao tác index đã hoàn tất bên trong ứng dụng Laravel, search engine có thể chưa phản ánh ngay các bản ghi mới hoặc vừa được cập nhật.

Để chỉ định connection và queue mà các Scout job sử dụng, bạn có thể định nghĩa tùy chọn cấu hình `queue` dưới dạng mảng:

```php
'queue' => [
    'connection' => 'redis',
    'queue' => 'scout'
],
```

Dĩ nhiên, nếu tùy chỉnh connection và queue mà Scout job sử dụng, bạn nên chạy queue worker để xử lý job trên connection và queue đó:

```shell
php artisan queue:work redis --queue=scout
```

<a name="unique-jobs"></a>
#### Job duy nhất

Trong các ứng dụng có lượng ghi lớn, bạn có thể muốn ngăn Scout đưa các job trùng lặp cho cùng bản ghi model vào queue. Bạn có thể bật cơ chế indexing job duy nhất bằng cách đăng ký các class job `MakeSearchableUniquely` và `RemoveFromSearchUniquely`, thường trong phương thức `boot` của service provider:

```php
use Laravel\Scout\Jobs\MakeSearchableUniquely;
use Laravel\Scout\Jobs\RemoveFromSearchUniquely;
use Laravel\Scout\Scout;

Scout::makeSearchableUsing(MakeSearchableUniquely::class);
Scout::removeFromSearchUsing(RemoveFromSearchUniquely::class);
```

Các job này sử dụng [unique job lock](/queues#unique-jobs) của Laravel để tránh dispatch các thao tác indexing trùng lặp cho cùng bản ghi model có thể tìm kiếm trong khi một job tương ứng đã nằm trong queue.

<a name="driver-prerequisites"></a>
## Điều kiện tiên quyết của driver

<a name="algolia"></a>
### Algolia

Khi sử dụng Algolia driver, bạn nên cấu hình thông tin xác thực `id` và `secret` của Algolia trong file `config/scout.php`. Sau khi cấu hình thông tin xác thực, bạn cũng cần cài Algolia PHP SDK thông qua Composer:

```shell
composer require algolia/algoliasearch-client-php
```

<a name="meilisearch"></a>
### Meilisearch

[Meilisearch](https://www.meilisearch.com) là một search engine mã nguồn mở, tốc độ cao. Nếu chưa chắc cách cài Meilisearch trên máy local, bạn có thể sử dụng [Laravel Sail](/sail#meilisearch), môi trường phát triển Docker được Laravel hỗ trợ chính thức.

Khi sử dụng Meilisearch driver, bạn cần cài Meilisearch PHP SDK thông qua Composer:

```shell
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

Sau đó, đặt biến môi trường `SCOUT_DRIVER` cùng thông tin `host` và `key` của Meilisearch trong file `.env` của ứng dụng:

```ini
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_KEY=masterKey
```

Để biết thêm thông tin về Meilisearch, hãy tham khảo [tài liệu Meilisearch](https://docs.meilisearch.com/learn/getting_started/quick_start.html).

Ngoài ra, bạn nên bảo đảm phiên bản `meilisearch/meilisearch-php` được cài tương thích với phiên bản binary Meilisearch bằng cách xem [tài liệu của Meilisearch về khả năng tương thích binary](https://github.com/meilisearch/meilisearch-php#-compatibility-with-meilisearch).

> [!WARNING]
> Khi nâng cấp Scout trên ứng dụng sử dụng Meilisearch, bạn luôn nên [xem xét mọi breaking change bổ sung](https://github.com/meilisearch/Meilisearch/releases) của chính dịch vụ Meilisearch.

<a name="typesense"></a>
### Typesense

[Typesense](https://typesense.org) là search engine mã nguồn mở có tốc độ rất cao, hỗ trợ tìm kiếm từ khóa, semantic search, geo search và vector search.

Bạn có thể [tự host](https://typesense.org/docs/guide/install-typesense.html#option-2-local-machine-self-hosting) Typesense hoặc sử dụng [Typesense Cloud](https://cloud.typesense.org).

Để bắt đầu sử dụng Typesense với Scout, hãy cài Typesense PHP SDK thông qua Composer:

```shell
composer require typesense/typesense-php
```

Sau đó, đặt biến môi trường `SCOUT_DRIVER` cùng host và API key của Typesense trong file `.env` của ứng dụng:

```ini
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=masterKey
TYPESENSE_HOST=localhost
```

Nếu đang sử dụng [Laravel Sail](/sail), bạn có thể cần điều chỉnh biến môi trường `TYPESENSE_HOST` để khớp với tên Docker container. Bạn cũng có thể tùy chọn chỉ định port, path và protocol của bản cài đặt:

```ini
TYPESENSE_PORT=8108
TYPESENSE_PATH=
TYPESENSE_PROTOCOL=http
```

Các thiết lập và định nghĩa schema bổ sung cho collection Typesense có thể được tìm thấy trong file cấu hình `config/scout.php` của ứng dụng. Để biết thêm thông tin, hãy tham khảo [tài liệu Typesense](https://typesense.org/docs/guide/#quick-start).

<a name="turbopuffer"></a>
### Turbopuffer

[Turbopuffer](https://turbopuffer.com) là search engine hỗ trợ full-text, semantic và hybrid search. Để sử dụng Turbopuffer driver, hãy đặt biến môi trường `SCOUT_DRIVER` và cung cấp API key Turbopuffer:

```ini
SCOUT_DRIVER=turbopuffer
TURBOPUFFER_API_KEY=tpuf_...
TURBOPUFFER_REGION=gcp-us-central1
```

Biến môi trường `TURBOPUFFER_REGION` là tùy chọn và mặc định là `gcp-us-central1`.

<a name="configuration"></a>
## Cấu hình

<a name="configuring-searchable-data"></a>
### Cấu hình dữ liệu có thể tìm kiếm

Theo mặc định, toàn bộ dữ liệu dạng `toArray` của model sẽ được lưu vào search index. Nếu muốn tùy chỉnh dữ liệu được đồng bộ tới search index, bạn có thể override phương thức `toSearchableArray` trên model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * Get the indexable data array for the model.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        $array = $this->toArray();

        // Customize the data array...

        return $array;
    }
}
```

<a name="configuring-search-engines-per-model"></a>
#### Cấu hình engine cho model

Khi tìm kiếm, Scout thường sử dụng search engine mặc định được chỉ định trong file cấu hình `scout` của ứng dụng. Tuy nhiên, bạn có thể thay đổi search engine cho một model cụ thể bằng cách override phương thức `searchableUsing` trên model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Engines\Engine;
use Laravel\Scout\Scout;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * Get the engine used to index the model.
     */
    public function searchableUsing(): Engine
    {
        return Scout::engine('meilisearch');
    }
}
```

<a name="database-and-collection-engines"></a>
## Engine Database / Collection

<a name="database-engine"></a>
### Database Engine

> [!WARNING]
> Database engine hiện hỗ trợ MySQL và PostgreSQL; cả hai đều hỗ trợ full-text index trên cột với hiệu năng cao.

Engine `database` sử dụng full-text index của MySQL / PostgreSQL và các mệnh đề `LIKE` để tìm kiếm trực tiếp trong database hiện có. Với nhiều ứng dụng, đây là cách đơn giản và thực tế nhất để bổ sung tìm kiếm — không cần dịch vụ bên ngoài hay hạ tầng bổ sung.

Để sử dụng database engine, đặt biến môi trường `SCOUT_DRIVER` thành `database`:

```ini
SCOUT_DRIVER=database
```

Sau khi cấu hình, bạn có thể [định nghĩa dữ liệu có thể tìm kiếm](#configuring-searchable-data) và bắt đầu [thực thi truy vấn tìm kiếm](#searching) trên các model. Không giống engine bên thứ ba, database engine không cần bước indexing riêng — nó tìm kiếm trực tiếp trên các bảng database.

<a name="database-semantic-and-hybrid-search"></a>
#### Tìm kiếm semantic và hybrid

Database engine hỗ trợ semantic và hybrid search khi dùng PostgreSQL với extension `pgvector`. Để bắt đầu, hãy thêm một cột vector nullable và một full-text index vào bảng của model. Cột vector phải nullable vì Scout lưu embedding sau khi model đã được persist:

```php
Schema::ensureVectorExtensionExists();

Schema::table('articles', function (Blueprint $table) {
    // ...

    $table->vector('embedding', dimensions: 1536)->nullable();
    $table->vectorIndex('embedding');
    $table->fullText(['title', 'body']);
});
```

Tiếp theo, định nghĩa phương thức `toSearchableEmbedding` trên model. Phương thức này có thể trả về văn bản nguồn mà Scout cần tạo embedding hoặc một mảng embedding đã tính sẵn. Theo mặc định Scout lưu embedding trong cột `embedding`; để dùng cột khác, hãy định nghĩa phương thức `searchableEmbeddingColumn` trên model.

#### Tùy chỉnh chiến lược tìm kiếm database

Theo mặc định, database engine thực thi truy vấn `LIKE` trên mọi thuộc tính model mà bạn đã [cấu hình có thể tìm kiếm](#configuring-searchable-data). Tuy nhiên, bạn có thể gán chiến lược tìm kiếm hiệu quả hơn cho các cột cụ thể. Attribute `SearchUsingFullText` sử dụng full-text index của database cho cột đó, còn `SearchUsingPrefix` chỉ khớp phần đầu chuỗi (`example%`) thay vì tìm kiếm trong toàn bộ chuỗi (`%example%`).

Để định nghĩa hành vi này, hãy gán PHP attribute cho phương thức `toSearchableArray` của model. Các cột không có attribute sẽ tiếp tục sử dụng chiến lược `LIKE` mặc định:

```php
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;

/**
 * Get the indexable data array for the model.
 *
 * @return array<string, mixed>
 */
#[SearchUsingPrefix(['id', 'email'])]
#[SearchUsingFullText(['bio'])]
public function toSearchableArray(): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'bio' => $this->bio,
    ];
}
```

> [!WARNING]
> Trước khi chỉ định một cột sử dụng ràng buộc truy vấn full-text, hãy bảo đảm cột đó đã được gán [full-text index](/migrations#available-index-types).

<a name="collection-engine"></a>
### Collection Engine

Engine `collection` dành cho prototype nhanh, tập dữ liệu cực nhỏ (vài trăm bản ghi) hoặc chạy test. Nó lấy toàn bộ bản ghi có thể có từ database và sử dụng helper `Str::is` của Laravel để lọc bằng PHP, vì vậy không cần indexing hay tính năng đặc thù của database. Với các trường hợp vượt quá nhu cầu đơn giản, bạn nên dùng [database engine](#database-engine).

Để sử dụng collection engine, bạn chỉ cần đặt biến môi trường `SCOUT_DRIVER` thành `collection`, hoặc chỉ định trực tiếp driver `collection` trong file cấu hình `scout` của ứng dụng:

```ini
SCOUT_DRIVER=collection
```

Sau khi chọn collection driver làm driver ưu tiên, bạn có thể bắt đầu [thực thi truy vấn tìm kiếm](#searching) trên các model. Việc indexing search engine, chẳng hạn indexing cần để seed index Algolia, Meilisearch hoặc Typesense, là không cần thiết khi dùng collection engine.

#### Khác biệt so với Database Engine

Trong khi database engine sử dụng full-text index và mệnh đề `LIKE` để tìm bản ghi khớp một cách hiệu quả, collection engine lấy toàn bộ bản ghi rồi lọc bằng PHP. Collection engine có tính di động cao nhất vì hoạt động với mọi relational database được Laravel hỗ trợ (bao gồm SQLite và SQL Server); tuy nhiên, nó kém hiệu quả hơn đáng kể so với database engine và không nên dùng với tập dữ liệu lớn.

<a name="third-party-engine-configuration"></a>
## Cấu hình engine bên thứ ba

Các tùy chọn cấu hình sau chỉ liên quan khi sử dụng search engine bên thứ ba như Algolia, Meilisearch hoặc Typesense. Nếu đang dùng [database engine](#database-engine), bạn có thể bỏ qua phần này.

<a name="configuring-model-indexes"></a>
### Cấu hình index của model

Khi sử dụng engine bên thứ ba, mỗi Eloquent model được đồng bộ với một search `index` chứa tất cả bản ghi có thể tìm kiếm của model đó. Theo mặc định, mỗi model được lưu vào index có tên tương ứng với tên `table` thông thường của model, thường là dạng số nhiều của tên model; tuy nhiên, bạn có thể tùy chỉnh index của model bằng cách override phương thức `searchableAs`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'posts_index';
    }
}
```

> [!NOTE]
> Phương thức `searchableAs` không có tác dụng khi sử dụng database engine vì engine này luôn tìm kiếm trực tiếp trên bảng database của model.

<a name="configuring-the-model-id"></a>
#### Cấu hình ID của model

Theo mặc định, Scout sử dụng primary key của model làm ID / key duy nhất được lưu trong search index. Nếu cần tùy chỉnh hành vi này khi dùng engine bên thứ ba, bạn có thể override các phương thức `getScoutKey` và `getScoutKeyName` trên model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class User extends Model
{
    use Searchable;

    /**
     * Get the value used to index the model.
     */
    public function getScoutKey(): mixed
    {
        return $this->email;
    }

    /**
     * Get the key name used to index the model.
     */
    public function getScoutKeyName(): mixed
    {
        return 'email';
    }
}
```

> [!NOTE]
> Các phương thức `getScoutKey` và `getScoutKeyName` không có tác dụng khi sử dụng database engine vì engine này luôn dùng primary key của model.

<a name="algolia-configuration"></a>
### Algolia

<a name="algolia-index-settings"></a>
#### Thiết lập index

Đôi khi bạn có thể muốn cấu hình thêm các thiết lập cho Algolia index. Mặc dù có thể quản lý chúng qua giao diện Algolia, việc quản lý trực tiếp trạng thái cấu hình index mong muốn trong file `config/scout.php` của ứng dụng đôi khi hiệu quả hơn.

Cách tiếp cận này cho phép deploy các thiết lập thông qua pipeline triển khai tự động của ứng dụng, tránh cấu hình thủ công và bảo đảm tính nhất quán giữa nhiều môi trường. Bạn có thể cấu hình thuộc tính có thể lọc, ranking, faceting hoặc [bất kỳ thiết lập nào khác được hỗ trợ](https://www.algolia.com/doc/rest-api/search/#tag/Indices/operation/setSettings).

Để bắt đầu, hãy thêm thiết lập cho từng index trong file cấu hình `config/scout.php` của ứng dụng:

```php
use App\Models\User;
use App\Models\Flight;

'algolia' => [
    'id' => env('ALGOLIA_APP_ID', ''),
    'secret' => env('ALGOLIA_SECRET', ''),
    'index-settings' => [
        User::class => [
            'searchableAttributes' => ['id', 'name', 'email'],
            'attributesForFaceting'=> ['filterOnly(email)'],
            // Other settings fields...
        ],
        Flight::class => [
            'searchableAttributes'=> ['id', 'destination'],
        ],
    ],
],
```

Nếu model đứng sau một index hỗ trợ soft delete và được đưa vào mảng `index-settings`, Scout sẽ tự động bổ sung hỗ trợ faceting cho các model đã soft delete trên index đó. Nếu không có thuộc tính faceting nào khác cần định nghĩa cho index của model hỗ trợ soft delete, bạn chỉ cần thêm một entry rỗng vào mảng `index-settings` cho model đó:

```php
'index-settings' => [
    Flight::class => []
],
```

Sau khi cấu hình các thiết lập index của ứng dụng, bạn phải chạy lệnh Artisan `scout:sync-index-settings`. Lệnh này sẽ thông báo cho Algolia về các thiết lập index hiện được cấu hình. Để thuận tiện, bạn có thể đưa lệnh này vào quy trình deployment:

```shell
php artisan scout:sync-index-settings
```

<a name="algolia-identifying-users"></a>
#### Nhận diện người dùng

Scout cho phép tự động nhận diện người dùng khi sử dụng Algolia. Việc liên kết người dùng đã xác thực với các thao tác tìm kiếm có thể hữu ích khi xem phân tích tìm kiếm trong dashboard của Algolia. Bạn có thể bật nhận diện người dùng bằng cách đặt biến môi trường `SCOUT_IDENTIFY` thành `true` trong file `.env` của ứng dụng:

```ini
SCOUT_IDENTIFY=true
```

Khi bật tính năng này, địa chỉ IP của request và định danh chính của người dùng đã xác thực cũng sẽ được gửi đến Algolia, để dữ liệu này được liên kết với mọi yêu cầu tìm kiếm do người dùng thực hiện.

<a name="meilisearch-configuration"></a>
### Meilisearch

<a name="meilisearch-index-settings"></a>
#### Thiết lập index

Meilisearch yêu cầu bạn định nghĩa trước các thiết lập tìm kiếm của index, chẳng hạn các thuộc tính có thể lọc, các thuộc tính có thể sắp xếp và [các trường thiết lập được hỗ trợ khác](https://docs.meilisearch.com/reference/api/settings.html).

Thuộc tính có thể lọc là những thuộc tính bạn dự định dùng để lọc khi gọi phương thức `where` của Scout, còn thuộc tính có thể sắp xếp là những thuộc tính bạn dự định dùng để sắp xếp khi gọi `orderBy`. Để định nghĩa thiết lập index, hãy điều chỉnh phần `index-settings` trong cấu hình `meilisearch` của file cấu hình `scout`:

```php
use App\Models\User;
use App\Models\Flight;

'meilisearch' => [
    'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
    'key' => env('MEILISEARCH_KEY', null),
    'index-settings' => [
        User::class => [
            'filterableAttributes'=> ['id', 'name', 'email'],
            'sortableAttributes' => ['created_at'],
            // Other settings fields...
        ],
        Flight::class => [
            'filterableAttributes'=> ['id', 'destination'],
            'sortableAttributes' => ['updated_at'],
        ],
    ],
],
```

Nếu model đứng sau một index sử dụng soft delete và được khai báo trong mảng `index-settings`, Scout sẽ tự động hỗ trợ lọc các model đã soft delete trên index đó. Nếu không có thuộc tính lọc hoặc sắp xếp nào khác cần định nghĩa cho index của model soft delete, bạn chỉ cần thêm một entry rỗng vào mảng `index-settings` cho model đó:

```php
'index-settings' => [
    Flight::class => []
],
```

Sau khi cấu hình các thiết lập index của ứng dụng, bạn phải chạy lệnh Artisan `scout:sync-index-settings`. Lệnh này sẽ đồng bộ các thiết lập index hiện tại sang Meilisearch. Để thuận tiện, bạn có thể đưa lệnh này vào quy trình deployment:

```shell
php artisan scout:sync-index-settings
```

<a name="meilisearch-semantic-and-hybrid-search"></a>
#### Tìm kiếm semantic và hybrid

Để sử dụng semantic search hoặc hybrid search với Meilisearch, hãy cấu hình embedder trong thiết lập index và thiết lập embedding cho từng model có thể tìm kiếm:

```php
'meilisearch' => [
    // ...
    'index-settings' => [
        Article::class => [
            'embedders' => [
                'default' => [
                    'source' => 'userProvided',
                    'dimensions' => 1536,
                ],
            ],
        ],
    ],
    'model-settings' => [
        Article::class => [
            'embedding' => [
                'embedder' => 'default',
                'dimensions' => 1536,
            ],
        ],
    ],
],
```

Phương thức `toSearchableEmbedding` của model có thể trả về văn bản nguồn để Scout tạo embedding bằng [Laravel AI SDK](/ai-sdk), hoặc trả về một mảng embedding đã được tính trước. Sau khi cập nhật cấu hình, hãy chạy lệnh `scout:sync-index-settings`.

<a name="meilisearch-data-types"></a>
#### Kiểu dữ liệu có thể tìm kiếm

Meilisearch chỉ thực hiện các phép lọc (`>`, `<`, v.v.) trên dữ liệu có đúng kiểu. Khi tùy chỉnh dữ liệu có thể tìm kiếm, bạn nên bảo đảm các giá trị số được ép sang đúng kiểu:

```php
public function toSearchableArray()
{
    return [
        'id' => (int) $this->id,
        'name' => $this->name,
        'price' => (float) $this->price,
    ];
}
```

<a name="typesense-configuration"></a>
### Typesense

<a name="typesense-searchable-data"></a>
#### Chuẩn bị dữ liệu có thể tìm kiếm

Khi sử dụng Typesense, các model có thể tìm kiếm phải định nghĩa phương thức `toSearchableArray` để ép primary key của model thành chuỗi và ngày tạo thành UNIX timestamp:

```php
/**
 * Get the indexable data array for the model.
 *
 * @return array<string, mixed>
 */
public function toSearchableArray(): array
{
    return array_merge($this->toArray(),[
        'id' => (string) $this->id,
        'created_at' => $this->created_at->timestamp,
    ]);
}
```

Bạn cũng nên định nghĩa schema cho các collection Typesense trong file `config/scout.php` của ứng dụng. Collection schema mô tả kiểu dữ liệu của từng trường có thể tìm kiếm qua Typesense. Để biết thêm về tất cả tùy chọn schema, hãy tham khảo [tài liệu Typesense](https://typesense.org/docs/latest/api/collections.html#schema-parameters).

Nếu cần thay đổi schema của collection Typesense sau khi đã định nghĩa, bạn có thể chạy `scout:flush` rồi `scout:import`; thao tác này sẽ xóa toàn bộ dữ liệu đã index và tạo lại schema. Hoặc, bạn có thể dùng API của Typesense để sửa schema collection mà không xóa dữ liệu đã index.

Nếu model có thể tìm kiếm sử dụng soft delete, bạn nên định nghĩa trường `__soft_deleted` trong schema Typesense tương ứng của model trong file cấu hình `config/scout.php`:

```php
User::class => [
    'collection-schema' => [
        'fields' => [
            // ...
            [
                'name' => '__soft_deleted',
                'type' => 'int32',
                'optional' => true,
            ],
        ],
    ],
],
```

<a name="typesense-dynamic-search-parameters"></a>
#### Tham số tìm kiếm động

Typesense cho phép bạn thay đổi động các [tham số tìm kiếm](https://typesense.org/docs/latest/api/search.html#search-parameters) khi thực hiện tìm kiếm thông qua phương thức `options`:

```php
use App\Models\Todo;

Todo::search('Groceries')->options([
    'query_by' => 'title, description'
])->get();
```

<a name="turbopuffer-configuration"></a>
### Turbopuffer

Turbopuffer yêu cầu schema và các thuộc tính có thể tìm kiếm cho từng model. Hãy định nghĩa chúng trong mảng `model-settings` của cấu hình `turbopuffer` bên trong file cấu hình `scout`:

```php
use App\Models\Article;

'turbopuffer' => [
    // ...
    'model-settings' => [
        Article::class => [
            'searchable-attributes' => [
                'title' => 3,
                'body' => 1,
            ],
            'schema' => [
                'title' => ['type' => 'string', 'full_text_search' => true],
                'body' => ['type' => 'string', 'full_text_search' => true],
                'status' => ['type' => 'string'],
            ],
        ],
    ],
],
```

Các giá trị số gán cho `searchable-attributes` là trọng số BM25 tương đối. Trong ví dụ trên, kết quả khớp ở tiêu đề bài viết đóng góp điểm số gấp ba lần kết quả khớp trong nội dung.

Để bật semantic search và hybrid search, hãy thêm thiết lập `embedding` và vector schema vào cấu hình của model:

```php
'turbopuffer' => [
    // ...
    'model-settings' => [
        Article::class => [
            'searchable-attributes' => [
                'title' => 3,
                'body' => 1,
            ],
            'embedding' => [
                'attribute' => 'embedding',
                'dimensions' => 1536,
            ],
            'schema' => [
                'title' => ['type' => 'string', 'full_text_search' => true],
                'body' => ['type' => 'string', 'full_text_search' => true],
                'embedding' => ['type' => '[1536]f32', 'ann' => true],
            ],
        ],
    ],
],
```

Phương thức `toSearchableEmbedding` của model nên trả về văn bản nguồn mà Scout cần tạo embedding hoặc một mảng embedding đã được tính trước. Scout tạo embedding từ văn bản nguồn bằng [Laravel AI SDK](/ai-sdk).

Ngoài ra, bạn có thể sử dụng embedding native của Turbopuffer mà không cần cài Laravel AI SDK hoặc định nghĩa phương thức `toSearchableEmbedding`. Hãy đặt embedding driver thành `turbopuffer` và cấu hình schema `embed` trên thuộc tính nguồn có thể tìm kiếm:

```php
'embedding' => [
    'driver' => 'turbopuffer',
    'attribute' => 'embedding_text',
],

'schema' => [
    // ...
    'embedding_text' => [
        'type' => 'string',
        'embed' => [
            'model' => 'voyage/voyage-4',
            'dimensions' => 1024,
            'attribute' => 'embedding',
        ],
    ],
],
```

Thuộc tính nguồn phải được bao gồm trong output của phương thức `toSearchableArray` trên model.

<a name="indexing"></a>
## Indexing với engine bên thứ ba

> [!NOTE]
> Các tính năng indexing được mô tả trong phần này chủ yếu áp dụng khi sử dụng engine bên thứ ba (Algolia, Meilisearch, Typesense hoặc Turbopuffer). Database engine tìm kiếm trực tiếp trong các bảng database nên không yêu cầu quản lý index thủ công.

<a name="batch-import"></a>
### Import hàng loạt

Nếu cài Scout vào một project hiện có, bạn có thể đã có các bản ghi database cần import vào index. Scout cung cấp lệnh Artisan `scout:import` để import toàn bộ các bản ghi hiện có vào search index:

```shell
php artisan scout:import "App\Models\Post"
```

Lệnh `scout:queue-import` có thể được dùng để import toàn bộ bản ghi hiện có bằng [queued job](/queues):

```shell
php artisan scout:queue-import "App\Models\Post" --chunk=500
```

Lệnh `flush` có thể được dùng để xóa toàn bộ bản ghi của một model khỏi search index:

```shell
php artisan scout:flush "App\Models\Post"
```

<a name="modifying-the-import-query"></a>
#### Điều chỉnh query import

Nếu muốn điều chỉnh query dùng để lấy toàn bộ model phục vụ import hàng loạt, bạn có thể định nghĩa phương thức `makeAllSearchableUsing` trên model. Đây là vị trí phù hợp để thêm eager loading cho các relationship cần thiết trước khi import model:

```php
use Illuminate\Database\Eloquent\Builder;

/**
 * Modify the query used to retrieve models when making all of the models searchable.
 */
protected function makeAllSearchableUsing(Builder $query): Builder
{
    return $query->with('author');
}
```

> [!WARNING]
> Phương thức `makeAllSearchableUsing` có thể không áp dụng khi sử dụng queue để import model hàng loạt. Các relationship [không được khôi phục](/queues#handling-relationships) khi collection model được xử lý bởi job.

<a name="adding-records"></a>
### Thêm bản ghi

Sau khi thêm trait `Laravel\Scout\Searchable` vào model, bạn chỉ cần `save` hoặc `create` một instance của model và nó sẽ tự động được thêm vào search index. Nếu đã cấu hình Scout [sử dụng queue](#queueing), thao tác này sẽ được queue worker thực hiện ở background:

```php
use App\Models\Order;

$order = new Order;

// ...

$order->save();
```

<a name="adding-records-via-query"></a>
#### Thêm bản ghi via Query

Nếu muốn thêm một collection model vào search index thông qua Eloquent query, bạn có thể chain phương thức `searchable` vào query. Phương thức `searchable` sẽ [chia kết quả thành các chunk](/eloquent#chunking-results) và thêm các bản ghi vào search index. Nếu đã cấu hình Scout dùng queue, toàn bộ chunk sẽ được các queue worker import ở background:

```php
use App\Models\Order;

Order::where('price', '>', 100)->searchable();
```

Bạn cũng có thể gọi phương thức `searchable` trên một instance Eloquent relationship:

```php
$user->orders()->searchable();
```

Hoặc, nếu bạn đã có một collection các Eloquent model trong memory, bạn có thể gọi method `searchable` trên collection instance để thêm các model instance vào index tương ứng:

```php
$orders->searchable();
```

> [!NOTE]
> Phương thức `searchable` có thể được xem là thao tác "upsert". Nói cách khác, nếu bản ghi model đã tồn tại trong index thì nó sẽ được cập nhật; nếu chưa tồn tại trong search index thì nó sẽ được thêm vào index.

<a name="updating-records"></a>
### Cập nhật bản ghi

Để cập nhật một model có thể tìm kiếm, bạn chỉ cần cập nhật các thuộc tính của instance model rồi `save` model vào database. Scout sẽ tự động ghi các thay đổi vào search index:

```php
use App\Models\Order;

$order = Order::find(1);

// Update the order...

$order->save();
```

Bạn cũng có thể gọi phương thức `searchable` trên một Eloquent query để cập nhật một collection model. Nếu các model chưa tồn tại trong search index, chúng sẽ được tạo:

```php
Order::where('price', '>', 100)->searchable();
```

Nếu muốn cập nhật các bản ghi search index cho toàn bộ model trong một relationship, bạn có thể gọi `searchable` trên instance relationship:

```php
$user->orders()->searchable();
```

Hoặc, nếu đã có một collection các Eloquent model trong bộ nhớ, bạn có thể gọi phương thức `searchable` trên instance collection để cập nhật các model instance trong index tương ứng:

```php
$orders->searchable();
```

<a name="modifying-records-before-importing"></a>
#### Điều chỉnh bản ghi trước khi import

Đôi khi bạn cần chuẩn bị collection model trước khi chúng được đưa vào trạng thái có thể tìm kiếm. Ví dụ, bạn có thể muốn eager load một relationship để dữ liệu relationship được thêm vào search index hiệu quả. Để thực hiện, hãy định nghĩa phương thức `makeSearchableUsing` trên model tương ứng:

```php
use Illuminate\Database\Eloquent\Collection;

/**
 * Modify the collection of models being made searchable.
 */
public function makeSearchableUsing(Collection $models): Collection
{
    return $models->load('author');
}
```

<a name="conditionally-updating-the-search-index"></a>
#### Cập nhật search index theo điều kiện

Theo mặc định, Scout sẽ reindex một model đã cập nhật bất kể thuộc tính nào được thay đổi. Nếu muốn tùy chỉnh hành vi này, bạn có thể định nghĩa phương thức `searchIndexShouldBeUpdated` trên model:

```php
/**
 * Determine if the search index should be updated.
 */
public function searchIndexShouldBeUpdated(): bool
{
    return $this->wasRecentlyCreated || $this->wasChanged(['title', 'body']);
}
```

<a name="removing-records"></a>
### Xóa bản ghi

Để xóa một bản ghi khỏi index, bạn chỉ cần `delete` model khỏi database. Điều này vẫn có thể thực hiện khi sử dụng model [soft delete](/eloquent#soft-deleting):

```php
use App\Models\Order;

$order = Order::find(1);

$order->delete();
```

Nếu không muốn truy xuất model trước khi xóa bản ghi, bạn có thể sử dụng phương thức `unsearchable` trên một Eloquent query:

```php
Order::where('price', '>', 100)->unsearchable();
```

Nếu muốn xóa các bản ghi search index của toàn bộ model trong một relationship, bạn có thể gọi `unsearchable` trên instance relationship:

```php
$user->orders()->unsearchable();
```

Hoặc, nếu đã có một collection các Eloquent model trong bộ nhớ, bạn có thể gọi phương thức `unsearchable` trên instance collection để xóa các model instance khỏi index tương ứng:

```php
$orders->unsearchable();
```

Để xóa toàn bộ bản ghi model khỏi index tương ứng, bạn có thể gọi phương thức `removeAllFromSearch`:

```php
Order::removeAllFromSearch();
```

<a name="pausing-indexing"></a>
### Tạm dừng lập chỉ mục

Đôi khi bạn cần thực hiện một loạt thao tác Eloquent trên model mà không đồng bộ dữ liệu model sang search index. Bạn có thể dùng phương thức `withoutSyncingToSearch`. Phương thức này nhận một closure và thực thi ngay; mọi thao tác model diễn ra bên trong closure sẽ không được đồng bộ vào index của model:

```php
use App\Models\Order;

Order::withoutSyncingToSearch(function () {
    // Perform model actions...
});
```

<a name="conditionally-searchable-model-instances"></a>
### Instance model có thể tìm kiếm theo điều kiện

Đôi khi bạn chỉ muốn một model có thể tìm kiếm khi đáp ứng các điều kiện nhất định. Ví dụ, giả sử model `App\Models\Post` có thể ở một trong hai trạng thái: "draft" và "published". Bạn có thể chỉ muốn các bài viết "published" được tìm kiếm. Để thực hiện, hãy định nghĩa phương thức `shouldBeSearchable` trên model:

```php
/**
 * Determine if the model should be searchable.
 */
public function shouldBeSearchable(): bool
{
    return $this->isPublished();
}
```

Phương thức `shouldBeSearchable` chỉ được áp dụng khi thao tác model thông qua các phương thức `save`, `create`, query hoặc relationship. Việc trực tiếp làm cho model hoặc collection có thể tìm kiếm bằng phương thức `searchable` sẽ ghi đè kết quả của phương thức `shouldBeSearchable`.

> [!WARNING]
> Phương thức `shouldBeSearchable` không áp dụng khi sử dụng engine "database" của Scout, vì toàn bộ dữ liệu có thể tìm kiếm luôn được lưu trong database. Để đạt được hành vi tương tự khi sử dụng database engine, bạn nên dùng [mệnh đề where](#where-clauses) thay thế.

<a name="searching"></a>
## Tìm kiếm

Bạn có thể bắt đầu tìm kiếm một model bằng phương thức `search`. Phương thức `search` nhận một chuỗi duy nhất dùng để tìm kiếm các model. Sau đó, bạn nên nối phương thức `get` vào truy vấn tìm kiếm để truy xuất các Eloquent model khớp với truy vấn đã cho:

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->get();
```

Vì kết quả tìm kiếm của Scout trả về một collection các Eloquent model, bạn thậm chí có thể trả kết quả trực tiếp từ route hoặc controller và chúng sẽ tự động được chuyển đổi thành JSON:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/search', function (Request $request) {
    return Order::search($request->search)->get();
});
```

Nếu muốn lấy kết quả tìm kiếm thô trước khi chúng được chuyển đổi thành Eloquent model, bạn có thể sử dụng phương thức `raw`:

```php
$orders = Order::search('Star Trek')->raw();
```

<a name="semantic-search"></a>
### Tìm kiếm semantic

Các engine database, Meilisearch và Turbopuffer hỗ trợ tìm kiếm semantic, cho phép khớp bản ghi dựa trên ý nghĩa của truy vấn. Khi Scout tạo embeddings, tìm kiếm semantic và hybrid yêu cầu [Laravel AI SDK](/ai-sdk). [Native embeddings](#turbopuffer-configuration) của Turbopuffer và các query vector được tính toán trước không yêu cầu Laravel AI SDK.

Sau khi cấu hình embeddings cho engine đã chọn, hãy gọi phương thức `semantic` trên truy vấn tìm kiếm:

```php
$articles = Article::search('staying cool in the summer')
    ->semantic()
    ->get();
```

Bạn có thể cung cấp ngưỡng tương đồng tối thiểu khi engine được chọn hỗ trợ:

```php
$articles = Article::search('renewable energy storage')
    ->semantic(minSimilarity: 0.6)
    ->get();
```

Để kết hợp tìm kiếm full-text và semantic, hãy sử dụng phương thức `hybrid`. Hai đối số đầu tiên của phương thức này kiểm soát trọng số tương đối của kết quả text và semantic:

```php
$articles = Article::search('renewable energy storage')
    ->hybrid(textWeight: 1, semanticWeight: 2)
    ->get();
```

<a name="custom-indexes"></a>
#### Index tùy chỉnh

Khi tìm kiếm bằng engine bên thứ ba, truy vấn thường được thực hiện trên index do phương thức [searchableAs](#configuring-model-indexes) của model chỉ định. Tuy nhiên, bạn có thể sử dụng phương thức `within` để chỉ định một index tùy chỉnh cần được tìm kiếm thay thế:

```php
$orders = Order::search('Star Trek')
    ->within('tv_shows_popularity_desc')
    ->get();
```

<a name="where-clauses"></a>
### Mệnh đề Where

Scout cho phép bạn thêm các mệnh đề "where" vào truy vấn tìm kiếm. Ví dụ, kiểm tra bằng nhau cơ bản hữu ích khi giới hạn phạm vi truy vấn tìm kiếm theo ID của chủ sở hữu:

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->where('user_id', 1)->get();
```

Bạn cũng có thể sử dụng các toán tử so sánh `=`, `!=`, `<`, `>`, `>=`, `<=` để xây dựng truy vấn nâng cao hơn:

```php
Order::search('Star Trek')
  ->where('status', '=', 'completed')
  ->where('is_refunded', '!=', true)
  ->where('total_price', '>', 100)
  ->where('shipping_cost', '<', 20)
  ->where('discount_percent', '>=', 10)
  ->where('item_count', '<=', 5)
  ->get();
```

Ngoài ra, phương thức `whereIn` có thể được dùng để xác minh giá trị của một cột có nằm trong mảng đã cho hay không:

```php
$orders = Order::search('Star Trek')->whereIn(
    'status', ['open', 'paid']
)->get();
```

Phương thức `whereNotIn` xác minh rằng giá trị của cột đã cho không nằm trong mảng đã cung cấp:

```php
$orders = Order::search('Star Trek')->whereNotIn(
    'status', ['closed']
)->get();
```

> [!WARNING]
> Nếu ứng dụng của bạn sử dụng Meilisearch, bạn phải cấu hình [filterable attributes](#meilisearch-index-settings) của ứng dụng trước khi sử dụng các mệnh đề "where" của Scout.

<a name="customizing-the-eloquent-results-query"></a>
#### Tùy chỉnh truy vấn kết quả Eloquent

Sau khi Scout lấy danh sách các Eloquent model khớp từ search engine của ứng dụng, Eloquent được dùng để truy xuất toàn bộ model tương ứng theo primary key. Bạn có thể tùy chỉnh truy vấn này bằng cách gọi phương thức `query`. Phương thức `query` nhận một closure, closure này sẽ nhận Eloquent query builder instance làm đối số:

```php
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;

$orders = Order::search('Star Trek')
    ->query(fn (Builder $query) => $query->with('invoices'))
    ->get();
```

Khi sử dụng engine bên thứ ba, callback này được gọi sau khi các model liên quan đã được lấy từ search engine, vì vậy không nên dùng nó để "lọc" kết quả — hãy sử dụng [mệnh đề where của Scout](#where-clauses) thay thế. Tuy nhiên, khi sử dụng database engine, các ràng buộc của phương thức `query` được áp dụng trực tiếp vào database query, nên bạn cũng có thể dùng nó để lọc.

<a name="pagination"></a>
### Phân trang

Ngoài việc truy xuất một collection các model, bạn có thể phân trang kết quả tìm kiếm bằng phương thức `paginate`. Phương thức này trả về một instance `Illuminate\Pagination\LengthAwarePaginator`, tương tự như khi bạn [phân trang một truy vấn Eloquent thông thường](/pagination):

```php
use App\Models\Order;

$orders = Order::search('Star Trek')->paginate();
```

Bạn có thể chỉ định số lượng model cần lấy trên mỗi trang bằng cách truyền số lượng làm đối số đầu tiên cho phương thức `paginate`:

```php
$orders = Order::search('Star Trek')->paginate(15);
```

Khi sử dụng database engine, bạn cũng có thể dùng phương thức `simplePaginate`. Khác với `paginate`, vốn truy xuất tổng số bản ghi khớp để có thể hiển thị số trang, `simplePaginate` chỉ xác định liệu còn kết quả sau trang hiện tại hay không — nhờ đó hiệu quả hơn với tập dữ liệu lớn khi bạn chỉ cần liên kết "trước" và "tiếp theo":

```php
$orders = Order::search('Star Trek')->simplePaginate(15);
```

Sau khi truy xuất kết quả, bạn có thể hiển thị chúng và render các liên kết phân trang bằng [Blade](/blade), giống như khi phân trang một truy vấn Eloquent thông thường:

```html
<div class="container">
    @foreach ($orders as $order)
        {{ $order->price }}
    @endforeach
</div>

{{ $orders->links() }}
```

Dĩ nhiên, nếu muốn lấy kết quả phân trang dưới dạng JSON, bạn có thể trả paginator instance trực tiếp từ route hoặc controller:

```php
use App\Models\Order;
use Illuminate\Http\Request;

Route::get('/orders', function (Request $request) {
    return Order::search($request->input('query'))->paginate(15);
});
```

> [!WARNING]
> Vì search engine không biết các định nghĩa global scope của Eloquent model, bạn không nên sử dụng global scope trong các ứng dụng dùng phân trang của Scout. Hoặc, bạn nên tái tạo các ràng buộc của global scope khi tìm kiếm qua Scout.

<a name="soft-deleting"></a>
### Soft Delete

Nếu các model đã được index của bạn sử dụng [soft delete](/eloquent#soft-deleting) và bạn cần tìm kiếm cả các model đã soft delete, hãy đặt tùy chọn `soft_delete` trong file cấu hình `config/scout.php` thành `true`:

```php
'soft_delete' => true,
```

Khi tùy chọn cấu hình này là `true`, Scout sẽ không xóa các model đã soft delete khỏi search index. Thay vào đó, Scout đặt thuộc tính ẩn `__soft_deleted` trên bản ghi đã index. Sau đó, bạn có thể sử dụng các phương thức `withTrashed` hoặc `onlyTrashed` để truy xuất các bản ghi đã soft delete khi tìm kiếm:

```php
use App\Models\Order;

// Include trashed records when retrieving results...
$orders = Order::search('Star Trek')->withTrashed()->get();

// Only include trashed records when retrieving results...
$orders = Order::search('Star Trek')->onlyTrashed()->get();
```

> [!NOTE]
> Khi một model đã soft delete bị xóa vĩnh viễn bằng `forceDelete`, Scout sẽ tự động xóa model đó khỏi search index.

<a name="customizing-engine-searches"></a>
### Tùy chỉnh tìm kiếm của engine

Nếu cần tùy chỉnh nâng cao hành vi tìm kiếm của một engine, bạn có thể truyền một closure làm đối số thứ hai cho phương thức `search`. Ví dụ, bạn có thể dùng callback này để thêm dữ liệu vị trí địa lý vào các tùy chọn tìm kiếm trước khi truy vấn được chuyển đến Algolia:

```php
use Algolia\AlgoliaSearch\SearchIndex;
use App\Models\Order;

Order::search(
    'Star Trek',
    function (SearchIndex $algolia, string $query, array $options) {
        $options['body']['query']['bool']['filter']['geo_distance'] = [
            'distance' => '1000km',
            'location' => ['lat' => 36, 'lon' => 111],
        ];

        return $algolia->search($query, $options);
    }
)->get();
```

<a name="custom-engines"></a>
## Engine tùy chỉnh

<a name="writing-the-engine"></a>
#### Viết engine

Nếu không engine tìm kiếm tích hợp sẵn nào của Scout phù hợp với nhu cầu, bạn có thể tự viết engine tùy chỉnh và đăng ký nó với Scout. Engine của bạn phải kế thừa abstract class `Laravel\Scout\Engines\Engine`. Abstract class này chứa tám phương thức mà engine tùy chỉnh phải triển khai:

```php
use Laravel\Scout\Builder;

abstract public function update($models);
abstract public function delete($models);
abstract public function search(Builder $builder);
abstract public function paginate(Builder $builder, $perPage, $page);
abstract public function mapIds($results);
abstract public function map(Builder $builder, $results, $model);
abstract public function getTotalCount($results);
abstract public function flush($model);
```

Bạn có thể tham khảo cách triển khai các phương thức này trong class `Laravel\Scout\Engines\AlgoliaEngine`. Class này là điểm khởi đầu hữu ích để tìm hiểu cách triển khai từng phương thức trong engine của riêng bạn.

<a name="registering-the-engine"></a>
#### Đăng ký engine

Sau khi viết engine tùy chỉnh, bạn có thể đăng ký nó với Scout bằng phương thức `extend` của Scout engine manager. Scout engine manager có thể được resolve từ Laravel service container. Bạn nên gọi phương thức `extend` từ phương thức `boot` của class `App\Providers\AppServiceProvider` hoặc bất kỳ service provider nào khác mà ứng dụng sử dụng:

```php
use App\ScoutExtensions\MySqlSearchEngine;
use Laravel\Scout\EngineManager;

/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    resolve(EngineManager::class)->extend('mysql', function () {
        return new MySqlSearchEngine;
    });
}
```

Sau khi engine được đăng ký, bạn có thể chỉ định nó làm `driver` Scout mặc định trong file cấu hình `config/scout.php` của ứng dụng:

```php
'driver' => 'mysql',
```
