import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './logging.interceptor';
// Import thư viện cookie-parser (đừng quên cài đặt: npm i cookie-parser)
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // Khởi tạo instance của ứng dụng NestJS, sử dụng module gốc là AppModule
  const app = await NestFactory.create(AppModule);

  // --- 1. KÍCH HOẠT COOKIE PARSER ---
  // Middleware này giúp NestJS đọc được header "Cookie" từ request gửi lên
  // và chuyển đổi nó thành object `req.cookies`.
  // -> Nếu thiếu dòng này: `req.cookies['refreshToken']` trong AuthController sẽ trả về undefined.
  app.use(cookieParser());

  // --- 2. CẤU HÌNH CORS (Cross-Origin Resource Sharing) ---
  // Đây là phần quan trọng nhất để Frontend (React) giao tiếp được với Backend (NestJS)
  // khi chúng chạy trên 2 domain hoặc port khác nhau.
  app.enableCors({
    // origin: Danh sách Whitelist các domain được phép gọi API.
    // LƯU Ý QUAN TRỌNG:
    // - Khi dùng Authentication bằng Cookie (credentials: true), bạn KHÔNG ĐƯỢC dùng ký tự '*' (wildcard).
    // - Bạn bắt buộc phải liệt kê cụ thể từng domain.
    origin: [
      'http://localhost:5173', // Cho phép React chạy Local
      'https://wad-ia-07-react-auth-jwt-with-react.vercel.app', // Cho phép React chạy trên Vercel (Production)
    ], 
    
    // credentials: true
    // - Cho phép Backend gửi Set-Cookie header xuống trình duyệt.
    // - Cho phép Trình duyệt gửi kèm Cookie (chứa Refresh Token) trong các request tiếp theo.
    credentials: true, 
  });

  // Đăng ký Interceptor toàn cục (Global) để log lại mọi request ra console
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Khởi động HTTP server
  // Sử dụng biến môi trường PORT, nếu không có thì mặc định dùng cổng 3000
  await app.listen(process.env.PORT ?? 3000);
}

// Gọi hàm bootstrap để thực thi ứng dụng
bootstrap();