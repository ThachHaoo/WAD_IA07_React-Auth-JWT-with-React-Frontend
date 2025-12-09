import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// @Controller(): Decorator đánh dấu class này là một Controller.
// Nhiệm vụ: Tiếp nhận request từ client, điều phối xử lý và trả về response.
// Tham số bên trong @Controller('...') sẽ là tiền tố (prefix) cho đường dẫn.
// Nếu để trống @Controller(), nó sẽ xử lý route gốc (root path: "/").
// -> Ví dụ URL: http://localhost:3000/
@Controller()
export class AppController {
  // Constructor sử dụng cơ chế Dependency Injection (DI) của NestJS.
  // NestJS sẽ tự động tìm instance của AppService (đã được khai báo trong Module)
  // và "tiêm" vào biến 'appService' để chúng ta sử dụng.
  // 'private readonly': Cú pháp ngắn gọn của TypeScript để vừa khai báo thuộc tính, vừa gán giá trị.
  constructor(private readonly appService: AppService) {}

  // @Get(): Decorator định nghĩa đây là Route Handler cho phương thức HTTP GET.
  // Vì @Controller() ở trên là gốc, và @Get() này không có tham số thêm,
  // nên hàm này sẽ chạy khi user truy cập đúng vào đường dẫn gốc.
  // -> Request: GET http://localhost:3000/
  @Get()
  getHello(): string {
    // Controller thường không nên chứa logic nghiệp vụ phức tạp (Business Logic).
    // Nó chỉ đóng vai trò trung gian: Gọi sang Service để xử lý và trả kết quả về cho Client.
    return this.appService.getHello();
  }
}
