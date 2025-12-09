import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';

// Import các operator của RxJS để xử lý luồng dữ liệu bất đồng bộ (Observables)
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';

// @Injectable() đánh dấu class này có thể được quản lý bởi hệ thống Dependency Injection của NestJS
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // Khởi tạo Logger của NestJS với context name là 'HTTP'.
  // Khi log in ra console, dòng log sẽ có tiền tố màu vàng [HTTP] giúp dễ nhận biết.
  private readonly logger = new Logger('HTTP');

  // Hàm intercept là bắt buộc khi implement interface NestInterceptor.
  // Nhiệm vụ: Chặn request, thực thi logic trước/sau khi vào Controller.
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // --- PHẦN 1: LOGIC TRƯỚC KHI VÀO CONTROLLER (PRE-REQUEST) ---

    // Chuyển đổi execution context sang HTTP context để lấy đối tượng Request của Express
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method; // Ví dụ: GET, POST, DELETE
    const url = request.url; // Ví dụ: /api/v1/users
    const now = Date.now(); // Lưu lại thời điểm bắt đầu request

    // next.handle() sẽ kích hoạt route handler (Controller) xử lý request.
    // Kết quả trả về là một Observable (luồng dữ liệu).
    // Ta dùng .pipe() để gắn thêm các logic xử lý sau khi Controller chạy xong.
    return next.handle().pipe(
      // --- PHẦN 2: LOGIC KHI REQUEST THÀNH CÔNG (POST-REQUEST SUCCESS) ---
      // tap(): Thực hiện hành động phụ (side-effect) mà không làm thay đổi dữ liệu trả về.
      tap(() => {
        const time = Date.now() - now; // Tính thời gian xử lý (ms)
        // Ghi log thông tin request thành công
        this.logger.log(`${method} ${url} -> Success (+${time}ms)`);
      }),

      // --- PHẦN 3: LOGIC KHI REQUEST THẤT BẠI (POST-REQUEST ERROR) ---
      // catchError(): Bắt lỗi nếu Controller hoặc Service ném ra Exception.
      catchError((error: unknown) => {
        const time = Date.now() - now;

        // Trích xuất thông báo lỗi một cách an toàn
        const message = error instanceof Error ? error.message : String(error);

        // Ghi log lỗi (sẽ hiển thị màu đỏ trong console)
        this.logger.error(
          `${method} ${url} -> Failed (+${time}ms) - Error: ${message}`,
        );

        // QUAN TRỌNG: Sau khi log xong, phải ném lỗi (re-throw) ra ngoài
        // để Global Exception Filter của NestJS có thể bắt được và trả về response lỗi chuẩn cho Client.
        return throwError(() => error);
      }),
    );
  }
}
