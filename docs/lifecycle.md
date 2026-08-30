# Vòng đời request
- [Giới thiệu](#introduction)
- [Tổng quan Lifecycle](#lifecycle-overview)
    - [Các bước đầu tiên](#first-steps)
    - [HTTP / Console Kernels](#http-console-kernels)
    - [Service Providers](#service-providers)
    - [Routing](#routing)
    - [Hoàn tất Request](#finishing-up)
- [Tập trung vào Service Providers](#focus-on-service-providers)
<a name="introduction"></a>
## Giới thiệu
Khi sử dụng bất kỳ công cụ nào trong thực tế, bạn sẽ tự tin hơn nếu hiểu công cụ đó hoạt động như thế nào. Phát triển ứng dụng cũng vậy. Khi hiểu cách công cụ phát triển vận hành, bạn sẽ thoải mái và chủ động hơn khi sử dụng chúng.
Mục tiêu của tài liệu này là cung cấp cái nhìn tổng quan ở mức cao về cách Laravel framework hoạt động. Khi hiểu bức tranh tổng thể, framework sẽ bớt cảm giác "ma thuật" và bạn sẽ tự tin hơn khi xây dựng ứng dụng. Nếu chưa hiểu ngay tất cả thuật ngữ, đừng lo; trước tiên hãy nắm luồng cơ bản, rồi kiến thức sẽ dần đầy lên khi bạn đọc các phần tài liệu khác.
<a name="lifecycle-overview"></a>
## Tổng quan vòng đời
<a name="first-steps"></a>
### Các bước đầu tiên
Entry point cho mọi request gửi tới ứng dụng Laravel là file `public/index.php`. Cấu hình web server (Apache / Nginx) sẽ chuyển toàn bộ request tới file này. `index.php` không chứa nhiều code; nó chủ yếu đóng vai trò điểm bắt đầu để load phần còn lại của framework.
File `index.php` load autoloader do Composer sinh ra, sau đó lấy instance ứng dụng Laravel từ `bootstrap/app.php`. Hành động đầu tiên của chính Laravel là tạo instance application / [service container](/docs/{{version}}/container).
<a name="http-console-kernels"></a>
### HTTP / Console Kernels
Tiếp theo, request được gửi tới HTTP kernel hoặc console kernel thông qua phương thức `handleRequest` hoặc `handleCommand` của application instance, tùy loại request đi vào ứng dụng. Hai kernel là điểm trung tâm mà mọi request đi qua. Trong phần này, ta tập trung vào HTTP kernel, một instance của `Illuminate\Foundation\Http\Kernel`.
HTTP kernel định nghĩa một array `bootstrappers` được chạy trước khi request được xử lý. Các bootstrapper cấu hình error handling, logging, [xác định environment của ứng dụng](/docs/{{version}}/configuration#environment-configuration) và thực hiện những tác vụ khác cần hoàn tất trước khi xử lý request. Thông thường đây là cấu hình nội bộ của Laravel mà bạn không cần can thiệp.
HTTP kernel cũng chịu trách nhiệm đưa request đi qua middleware stack của ứng dụng. Các middleware này xử lý việc đọc / ghi [HTTP session](/docs/{{version}}/session), xác định ứng dụng có ở maintenance mode hay không, [xác minh CSRF token](/docs/{{version}}/csrf) và nhiều công việc khác.
Signature của phương thức `handle` trên HTTP kernel rất đơn giản: nhận một `Request` và trả về `Response`. Có thể hình dung kernel như một "hộp đen" lớn đại diện cho toàn bộ ứng dụng: đưa HTTP request vào và nhận HTTP response ở đầu ra.
<a name="service-providers"></a>
### Service provider
Một trong những bước bootstrap quan trọng nhất của kernel là load các [service provider](/docs/{{version}}/providers) của ứng dụng. Service provider chịu trách nhiệm bootstrap nhiều component của framework như database, queue, validation và routing.
Laravel duyệt qua danh sách provider và khởi tạo từng provider. Sau đó, phương thức `register` được gọi trên tất cả provider. Khi toàn bộ provider đã được đăng ký, Laravel mới gọi `boot` trên từng provider. Trình tự này đảm bảo khi `boot` chạy, mọi container binding cần thiết đã được đăng ký và sẵn sàng để provider phụ thuộc vào.
Gần như mọi feature lớn của Laravel đều được bootstrap và cấu hình bởi service provider. Vì chịu trách nhiệm khởi tạo và cấu hình rất nhiều feature, service provider là một trong những phần quan trọng nhất của toàn bộ quá trình Laravel bootstrap.
Framework sử dụng hàng chục service provider nội bộ, đồng thời bạn cũng có thể tạo provider riêng. Danh sách service provider do ứng dụng hoặc package third-party đăng ký nằm trong file `bootstrap/providers.php`.
<a name="routing"></a>
### Định tuyến
Sau khi application đã bootstrap và toàn bộ service provider được đăng ký, `Request` được chuyển cho router để dispatch. Router sẽ dispatch request tới route hoặc controller phù hợp, đồng thời chạy các route-specific middleware.
Middleware cung cấp cơ chế thuận tiện để lọc hoặc kiểm tra HTTP request đi vào ứng dụng. Ví dụ, Laravel có middleware kiểm tra người dùng đã xác thực hay chưa. Nếu chưa, middleware redirect người dùng tới màn hình login; nếu đã xác thực, request được phép tiếp tục đi sâu hơn vào ứng dụng. Một số middleware như `PreventRequestsDuringMaintenance` áp dụng cho toàn bộ route, trong khi những middleware khác chỉ gắn với route hoặc route group cụ thể. Để tìm hiểu đầy đủ, hãy xem [tài liệu Middleware](/docs/{{version}}/middleware).
Nếu request đi qua toàn bộ middleware của route thành công, route hoặc controller method sẽ được thực thi. Response do route / controller trả về sau đó được gửi ngược trở lại qua chuỗi middleware của route.
<a name="finishing-up"></a>
### Hoàn tất request
Sau khi route hoặc controller trả về response, response đi ngược ra ngoài qua middleware của route, cho phép ứng dụng tiếp tục chỉnh sửa hoặc kiểm tra response trước khi gửi đi.
Cuối cùng, sau khi response đi ngược qua middleware, phương thức `handle` của HTTP kernel trả response object về `handleRequest` của application instance; phương thức này gọi `send` trên response. `send` gửi nội dung response tới trình duyệt người dùng. Đến đây toàn bộ hành trình của một Laravel request đã hoàn tất.
<a name="focus-on-service-providers"></a>
## Tập trung vào service provider
Service provider thực sự là chìa khóa của quá trình bootstrap ứng dụng Laravel. Application instance được tạo, service provider được đăng ký, rồi request được đưa vào application đã bootstrap. Về bản chất, luồng chính chỉ đơn giản như vậy.
Nắm chắc cách ứng dụng Laravel được xây dựng và bootstrap qua service provider rất có giá trị. Các service provider do ứng dụng tự định nghĩa được lưu trong thư mục `app/Providers`.
Mặc định, `AppServiceProvider` khá trống. Đây là nơi phù hợp để thêm logic bootstrap và service container binding riêng của ứng dụng. Với ứng dụng lớn, bạn có thể tạo nhiều service provider, mỗi provider phụ trách bootstrap chi tiết cho một nhóm service cụ thể.

## Tài liệu chính thức

Bản dịch này được đối chiếu với [Laravel 13 Documentation chính thức](https://laravel.com/docs/13.x/lifecycle). Khi có khác biệt, tài liệu chính thức của Laravel là nguồn tham chiếu ưu tiên.
