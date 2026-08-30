# Tìm kiếm

- [Giới thiệu](#introduction)
    - [Tìm kiếm toàn văn](#introduction-full-text-search)
    - [Tìm kiếm ngữ nghĩa / vector](#introduction-semantic-vector-search)
    - [Xếp hạng lại](#introduction-reranking)
    - [Các công cụ tìm kiếm của Scout](#introduction-scout-search-engines)
- [Tìm kiếm toàn văn](#full-text-search)
    - [Thêm chỉ mục toàn văn](#adding-full-text-indexes)
    - [Thực thi truy vấn toàn văn](#running-full-text-queries)
- [Tìm kiếm ngữ nghĩa / vector](#semantic-vector-search)
    - [Tạo embedding](#generating-embeddings)
    - [Lưu trữ và lập chỉ mục vector](#storing-and-indexing-vectors)
    - [Truy vấn theo độ tương đồng](#querying-by-similarity)
- [Xếp hạng lại kết quả](#reranking-results)
- [Laravel Scout](#laravel-scout)
    - [Database Engine](#database-engine)
    - [Các engine bên thứ ba](#third-party-engines)
- [Kết hợp các kỹ thuật](#combining-techniques)

<a name="introduction"></a>
## Giới thiệu

Gần như mọi ứng dụng đều cần chức năng tìm kiếm. Dù người dùng đang tìm các bài viết liên quan trong một knowledge base, duyệt catalog sản phẩm, hay đặt câu hỏi bằng ngôn ngữ tự nhiên trên một tập tài liệu, Laravel đều cung cấp các công cụ tích hợp để xử lý từng tình huống này — và trong nhiều trường hợp bạn không cần bất kỳ dịch vụ bên ngoài nào.

Phần lớn ứng dụng sẽ nhận thấy các tùy chọn tìm kiếm dựa trên database được Laravel tích hợp sẵn là quá đủ — các dịch vụ tìm kiếm bên ngoài chỉ thực sự cần thiết khi bạn cần những tính năng như khả năng chịu lỗi gõ sai, faceted filtering hoặc geo-search ở quy mô rất lớn.

<a name="introduction-full-text-search"></a>
#### Tìm kiếm toàn văn

Khi bạn cần xếp hạng theo mức độ liên quan của từ khóa — tức database chấm điểm và sắp xếp kết quả dựa trên mức độ khớp với các từ tìm kiếm — method `whereFullText` của query builder tận dụng các full-text index native trên MariaDB, MySQL và PostgreSQL. Full-text search hiểu ranh giới từ và stemming, vì vậy tìm kiếm "running" có thể khớp với các record chứa "run". Không cần dịch vụ bên ngoài.

<a name="introduction-semantic-vector-search"></a>
#### Tìm kiếm ngữ nghĩa / vector

Đối với semantic search dựa trên AI, nơi kết quả được khớp theo *ý nghĩa* thay vì từ khóa chính xác, method `whereVectorSimilarTo` của query builder sử dụng vector embedding được lưu trong PostgreSQL với extension `pgvector` hoặc MariaDB. Ví dụ, tìm kiếm "best wineries in Napa Valley" có thể trả về bài viết có tiêu đề "Top Vineyards to Visit" — dù các từ không hề trùng nhau.

Vector search yêu cầu PostgreSQL với extension `pgvector` hoặc MariaDB 11.7 trở lên, đồng thời cần [Laravel AI SDK](/docs/{{version}}/ai-sdk).

<a name="introduction-reranking"></a>
#### Xếp hạng lại

[AI SDK](/docs/{{version}}/ai-sdk) của Laravel cung cấp khả năng reranking, sử dụng AI model để sắp xếp lại bất kỳ tập kết quả nào theo mức độ liên quan ngữ nghĩa với một query. Reranking đặc biệt hiệu quả khi được dùng làm bước thứ hai sau một bước truy xuất ban đầu nhanh như full-text search — nhờ đó bạn có cả tốc độ lẫn độ chính xác ngữ nghĩa.

<a name="introduction-scout-search-engines"></a>
#### Tìm kiếm với Laravel Scout

Đối với các ứng dụng muốn sử dụng trait `Searchable` để tự động giữ search index đồng bộ với Eloquent model, [Laravel Scout](/docs/{{version}}/scout) cung cấp cả database engine tích hợp sẵn lẫn driver cho các dịch vụ bên thứ ba như Algolia, Meilisearch, Typesense và Turbopuffer.

<a name="full-text-search"></a>
## Tìm kiếm toàn văn

Mặc dù truy vấn `LIKE` phù hợp với việc khớp substring đơn giản, chúng không hiểu ngôn ngữ. Một truy vấn `LIKE` cho "running" sẽ không tìm thấy record chứa "run", và kết quả cũng không được xếp hạng theo mức độ liên quan — chúng chỉ được trả về theo thứ tự database tìm thấy. Full-text search giải quyết cả hai vấn đề bằng các index chuyên dụng hiểu ranh giới từ, stemming và relevance scoring, cho phép database trả về các kết quả phù hợp nhất trước tiên.

Tìm kiếm toàn văn tốc độ cao được tích hợp sẵn trong MariaDB, MySQL và PostgreSQL — không cần dịch vụ tìm kiếm bên ngoài. Bạn chỉ cần thêm full-text index vào các column muốn tìm kiếm, rồi sử dụng method `whereFullText` của query builder để tìm trên chúng.

> [!WARNING]
> Hiện tại full-text search được hỗ trợ trên MariaDB, MySQL và PostgreSQL.

<a name="adding-full-text-indexes"></a>
### Thêm chỉ mục toàn văn

Để sử dụng full-text search, trước tiên hãy thêm full-text index vào các column bạn muốn tìm kiếm. Bạn có thể thêm index cho một column đơn, hoặc truyền một array các column để tạo composite index có thể tìm trên nhiều field cùng lúc:

```php
Schema::create('articles', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->timestamps();

    $table->fullText(['title', 'body']);
});
```

Trên PostgreSQL, bạn có thể chỉ định language configuration cho index để kiểm soát cách các từ được stemming:

```php
$table->fullText('body')->language('english');
```

Để biết thêm thông tin về việc tạo index, hãy xem [tài liệu migration](/docs/{{version}}/migrations#available-index-types).

<a name="running-full-text-queries"></a>
### Thực thi truy vấn toàn văn

Sau khi index đã được tạo, hãy sử dụng method `whereFullText` của query builder để tìm kiếm trên index đó. Laravel sẽ sinh SQL phù hợp với database driver của bạn — ví dụ `MATCH(...) AGAINST(...)` trên MariaDB và MySQL, còn PostgreSQL dùng `to_tsvector(...) @@ plainto_tsquery(...)`:

```php
$articles = Article::whereFullText('body', 'web developer')->get();
```

Khi sử dụng MariaDB và MySQL, kết quả được tự động sắp theo relevance score. Trên PostgreSQL, `whereFullText` lọc các record khớp nhưng không sắp xếp chúng theo mức độ liên quan — nếu bạn cần tự động relevance ordering trên PostgreSQL, hãy cân nhắc sử dụng [database engine của Scout](#database-engine), vì engine này xử lý việc đó cho bạn.

Nếu đã tạo composite full-text index trên nhiều column, bạn có thể tìm kiếm trên tất cả các column đó bằng cách truyền cùng array column vào `whereFullText`:

```php
$articles = Article::whereFullText(
    ['title', 'body'], 'web developer'
)->get();
```

Method `orWhereFullText` có thể được dùng để thêm một mệnh đề full-text search dưới dạng điều kiện "or". Để biết đầy đủ chi tiết, hãy xem [tài liệu query builder](/docs/{{version}}/queries#full-text-where-clauses).

<a name="semantic-vector-search"></a>
## Tìm kiếm ngữ nghĩa / vector

Full-text search dựa vào việc khớp từ khóa — các từ trong query phải xuất hiện, dưới một dạng nào đó, trong dữ liệu. Semantic search sử dụng cách tiếp cận hoàn toàn khác: nó dùng vector embedding do AI tạo ra để biểu diễn *ý nghĩa* của văn bản dưới dạng các array số, sau đó tìm các kết quả có ý nghĩa gần nhất với query. Ví dụ, tìm kiếm "best wineries in Napa Valley" có thể trả về bài viết "Top Vineyards to Visit" — dù các từ hoàn toàn không trùng nhau.

Workflow cơ bản của vector search là: tạo embedding (một array số) cho từng phần nội dung và lưu cùng dữ liệu; sau đó, tại thời điểm tìm kiếm, tạo embedding cho query của người dùng rồi tìm các embedding đã lưu có vị trí gần nó nhất trong vector space.

> [!NOTE]
> Vector search yêu cầu [Laravel AI SDK](/docs/{{version}}/ai-sdk) và được hỗ trợ bởi PostgreSQL (cần extension `pgvector`), MariaDB 11.7 trở lên và MongoDB (cần [Laravel MongoDB package](https://laravel.com/docs/13.x/mongodb)). Tất cả PostgreSQL database trên [Laravel Cloud](https://laravel.com/cloud) đều đã cài `pgvector`.

<a name="generating-embeddings"></a>
### Tạo embedding

Embedding là một array số nhiều chiều (thường gồm hàng trăm hoặc hàng nghìn số) biểu diễn ý nghĩa ngữ nghĩa của một đoạn văn bản. Bạn có thể tạo embedding cho string bằng method `toEmbeddings` có sẵn trên class `Stringable` của Laravel:

```php
use Illuminate\Support\Str;

$embedding = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

Để tạo embedding cho nhiều input cùng lúc — hiệu quả hơn tạo từng cái một vì chỉ cần một API call đến embedding provider — hãy sử dụng class `Embeddings`:

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for([
    'Napa Valley has great wine.',
    'Laravel is a PHP framework.',
])->generate();

$response->embeddings; // [[0.123, 0.456, ...], [0.789, 0.012, ...]]
```

Để biết thêm chi tiết về cấu hình embedding provider, tùy chỉnh dimensions và caching, hãy xem [tài liệu AI SDK](/docs/{{version}}/ai-sdk#embeddings).

<a name="storing-and-indexing-vectors"></a>
### Lưu trữ và lập chỉ mục vector

Để lưu vector embedding, hãy định nghĩa column `vector` trong migration và chỉ định số dimensions khớp với output của embedding provider (ví dụ 1536 với model OpenAI `text-embedding-3-small`). Bạn cũng nên gọi `index` trên column để tạo HNSW (Hierarchical Navigable Small World) index, giúp tăng tốc đáng kể similarity search trên dataset lớn:

```php
Schema::ensureVectorExtensionExists();

Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->vector('embedding', dimensions: 1536)->index();
    $table->timestamps();
});
```

Method `Schema::ensureVectorExtensionExists` bảo đảm extension `pgvector` được bật trên PostgreSQL database trước khi tạo table.

Trên Eloquent model, hãy sử dụng cast `AsVector` để Laravel tự động xử lý việc chuyển đổi giữa PHP array và vector format của database:

```php
use Illuminate\Database\Eloquent\Casts\AsVector;

protected function casts(): array
{
    return [
        'embedding' => AsVector::class,
    ];
}
```

Để biết thêm chi tiết về vector column và index, hãy xem [tài liệu migration](/docs/{{version}}/migrations#available-column-types).

<a name="querying-by-similarity"></a>
### Truy vấn theo độ tương đồng

Sau khi đã lưu embedding cho nội dung, bạn có thể tìm các record tương tự bằng method `whereVectorSimilarTo`. Method này so sánh embedding được cung cấp với các vector đã lưu bằng cosine similarity, lọc bỏ các kết quả thấp hơn ngưỡng `minSimilarity`, đồng thời tự động sắp xếp kết quả theo mức độ liên quan — record giống nhất sẽ đứng trước. Threshold phải là giá trị từ `0.0` đến `1.0`, trong đó `1.0` nghĩa là hai vector giống hệt nhau:

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();
```

Để thuận tiện, khi truyền plain string thay vì embedding array, Laravel sẽ tự động tạo embedding cho bạn bằng embedding provider đã cấu hình. Điều này có nghĩa bạn có thể truyền trực tiếp search query của người dùng mà không cần tự chuyển đổi thành embedding trước:

```php
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', 'best wineries in Napa Valley')
    ->limit(10)
    ->get();
```

Nếu cần kiểm soát vector query ở mức thấp hơn, các method `whereVectorDistanceLessThan`, `selectVectorDistance` và `orderByVectorDistance` cũng có sẵn. Các method này cho phép bạn làm việc trực tiếp với distance value thay vì similarity score, select distance đã tính thành một column trong result, hoặc tự kiểm soát việc ordering.

Để biết đầy đủ chi tiết, hãy xem [tài liệu query builder](/docs/{{version}}/queries#vector-similarity-clauses) và [tài liệu AI SDK](/docs/{{version}}/ai-sdk#querying-embeddings).

<a name="reranking-results"></a>
## Xếp hạng lại kết quả

Reranking là kỹ thuật trong đó AI model sắp xếp lại một tập kết quả dựa trên mức độ liên quan ngữ nghĩa của từng kết quả với một query. Khác với vector search, vốn yêu cầu bạn tính trước và lưu embedding, reranking hoạt động trên bất kỳ collection văn bản nào — nó nhận raw content và query làm input rồi trả các item đã được sắp xếp theo relevance.

Reranking đặc biệt hiệu quả khi dùng làm bước thứ hai sau một bước truy xuất ban đầu nhanh. Ví dụ, bạn có thể dùng full-text search để nhanh chóng thu hẹp hàng nghìn record xuống 50 candidate tốt nhất, sau đó dùng reranking để đưa các kết quả phù hợp nhất lên đầu. Pattern "retrieve then rerank" này mang lại cả tốc độ lẫn độ chính xác ngữ nghĩa.

Bạn có thể rerank một array string bằng class `Reranking`:

```php
use Laravel\Ai\Reranking;

$response = Reranking::of([
    'Django is a Python web framework.',
    'Laravel is a PHP web application framework.',
    'React is a JavaScript library for building user interfaces.',
])->rerank('PHP frameworks');

$response->first()->document; // "Laravel is a PHP web application framework."
```

Laravel collection cũng có macro `rerank`, nhận một field name (hoặc closure) và một query, giúp rerank Eloquent result thuận tiện:

```php
$articles = Article::all()
    ->rerank('body', 'Laravel tutorials');
```

Để biết đầy đủ chi tiết về cấu hình reranking provider và các option khả dụng, hãy xem [tài liệu AI SDK](/docs/{{version}}/ai-sdk#reranking).

<a name="laravel-scout"></a>
## Laravel Scout

Các kỹ thuật tìm kiếm được mô tả ở trên đều là các query builder method mà bạn gọi trực tiếp trong code. [Laravel Scout](/docs/{{version}}/scout) có cách tiếp cận khác: nó cung cấp trait `Searchable` để bạn thêm vào Eloquent model, và Scout tự động giữ search index đồng bộ khi record được tạo, cập nhật hoặc xóa. Cách này đặc biệt tiện lợi khi bạn muốn model luôn có thể tìm kiếm mà không phải tự quản lý việc cập nhật index.

<a name="database-engine"></a>
### Database Engine

Database engine tích hợp của Scout thực hiện full-text search và `LIKE` search trên database hiện có của bạn — không cần dịch vụ ngoài hoặc hạ tầng bổ sung. Chỉ cần thêm trait `Searchable` vào model và định nghĩa method `toSearchableArray` trả về các column bạn muốn có thể tìm kiếm.

Bạn có thể dùng PHP attribute để kiểm soát search strategy cho từng column. `SearchUsingFullText` sẽ dùng full-text index của database, `SearchUsingPrefix` chỉ khớp từ đầu string (`example%`), còn các column không có attribute sẽ dùng strategy `LIKE` mặc định với wildcard ở cả hai phía (`%example%`):

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use Searchable;

    #[SearchUsingPrefix(['id'])]
    #[SearchUsingFullText(['title', 'body'])]
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
        ];
    }
}
```

> [!WARNING]
> Trước khi chỉ định một column nên dùng full-text query constraint, hãy bảo đảm column đó đã được gán [full-text index](/docs/{{version}}/migrations#available-index-types).

Sau khi thêm trait, bạn có thể tìm model bằng method `search` của Scout. Database engine của Scout sẽ tự động sắp xếp kết quả theo relevance, kể cả trên PostgreSQL:

```php
$articles = Article::search('Laravel')->get();
```

Database engine là lựa chọn rất phù hợp khi nhu cầu tìm kiếm của bạn ở mức vừa phải và bạn muốn sự tiện lợi của cơ chế tự đồng bộ index của Scout mà không cần triển khai dịch vụ bên ngoài. Nó xử lý tốt các use case tìm kiếm phổ biến nhất, bao gồm filtering, pagination và xử lý soft-deleted record. Để biết đầy đủ chi tiết, hãy xem [tài liệu Scout](/docs/{{version}}/scout#database-engine).

<a name="third-party-engines"></a>
### Các engine bên thứ ba

Scout cũng hỗ trợ các search engine bên thứ ba như [Algolia](https://www.algolia.com/), [Meilisearch](https://www.meilisearch.com) và [Typesense](https://typesense.org). Các dịch vụ tìm kiếm chuyên dụng này cung cấp những tính năng nâng cao như chịu lỗi gõ sai, faceted filtering, geo-search và custom ranking rules — những tính năng trở nên quan trọng ở quy mô rất lớn hoặc khi bạn cần trải nghiệm search-as-you-type được hoàn thiện kỹ lưỡng.

Vì Scout cung cấp một API thống nhất trên tất cả driver, việc chuyển từ database engine sang engine bên thứ ba sau này chỉ cần thay đổi code tối thiểu. Bạn có thể bắt đầu với database engine và chỉ chuyển sang dịch vụ bên thứ ba nếu nhu cầu của ứng dụng vượt quá khả năng database có thể cung cấp.

Để biết đầy đủ chi tiết về cấu hình các engine bên thứ ba, hãy xem [tài liệu Scout](/docs/{{version}}/scout).

> [!NOTE]
> Nhiều ứng dụng sẽ không bao giờ cần search engine bên ngoài. Các kỹ thuật tích hợp sẵn được mô tả trên trang này đã bao phủ phần lớn use case.

<a name="combining-techniques"></a>
## Kết hợp các kỹ thuật

Các kỹ thuật tìm kiếm được mô tả trên trang này không loại trừ lẫn nhau — kết hợp chúng thường mang lại kết quả tốt nhất. Dưới đây là hai pattern phổ biến minh họa cách các công cụ này phối hợp với nhau.

**Truy xuất toàn văn + xếp hạng lại**

Sử dụng full-text search để nhanh chóng thu hẹp dataset lớn xuống một tập candidate, sau đó áp dụng reranking để sắp xếp các candidate đó theo mức độ liên quan ngữ nghĩa. Cách này cho bạn tốc độ của full-text search native trong database cùng độ chính xác của relevance scoring dựa trên AI:

```php
$articles = Article::query()
    ->whereFullText('body', $request->input('query'))
    ->limit(50)
    ->get()
    ->rerank('body', $request->input('query'), limit: 10);
```

**Tìm kiếm vector + bộ lọc truyền thống**

Kết hợp vector similarity với các mệnh đề `where` tiêu chuẩn để giới hạn semantic search trong một tập con record. Cách này hữu ích khi bạn muốn tìm kiếm dựa trên ý nghĩa nhưng vẫn cần giới hạn kết quả theo ownership, category hoặc bất kỳ attribute nào khác:

```php
$documents = Document::query()
    ->where('team_id', $user->team_id)
    ->whereVectorSimilarTo('embedding', $request->input('query'))
    ->limit(10)
    ->get();
```

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/search). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
