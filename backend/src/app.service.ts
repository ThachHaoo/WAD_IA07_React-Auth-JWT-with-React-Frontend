import { Injectable } from '@nestjs/common';

// @Injectable(): Decorator này đánh dấu class AppService là một "Provider".
// Điều này cho phép hệ thống Dependency Injection (DI) của NestJS quản lý nó.
// NestJS sẽ tự động khởi tạo và "tiêm" (inject) service này vào các Controller hoặc Service khác khi cần (thông qua constructor).
@Injectable()
export class AppService {
  // Đây là phương thức chứa logic nghiệp vụ thực tế.
  // Trong mô hình kiến trúc của NestJS:
  // - Controller: Chỉ nhận request, gọi Service và trả về response.
  // - Service: Thực hiện tính toán, gọi Database, xử lý dữ liệu phức tạp...
  getHello(): string {
    return 'Hello World!';
  }
}
