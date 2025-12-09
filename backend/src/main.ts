import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './logging.interceptor';

async function bootstrap() {
  // Khởi tạo instance của ứng dụng NestJS, sử dụng module gốc là AppModule
  // Đây là nơi bắt đầu của toàn bộ cấu trúc Dependency Injection trong NestJS
  const app = await NestFactory.create(AppModule);

  // Kích hoạt CORS (Cross-Origin Resource Sharing)
  // Cấu hình này cực kỳ quan trọng khi Frontend (React) và Backend chạy trên 2 domain/port khác nhau
  // (Ví dụ: React chạy port 5173 gọi API sang NestJS port 3000)
  app.enableCors();

  // Đăng ký một Interceptor hoạt động trên phạm vi toàn cục (Global)
  // 'LoggingInterceptor' sẽ được áp dụng cho TẤT CẢ các route trong ứng dụng
  // Giúp ghi log request/response mà không cần khai báo lại ở từng Controller
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Khởi động HTTP server và lắng nghe các request
  // Sử dụng cổng được định nghĩa trong biến môi trường PORT (process.env.PORT)
  // Toán tử '??' (Nullish coalescing) sẽ lấy giá trị mặc định là 3000 nếu PORT là null hoặc undefined
  await app.listen(process.env.PORT ?? 3000);
}

// Gọi hàm bootstrap để thực thi ứng dụng
bootstrap();
