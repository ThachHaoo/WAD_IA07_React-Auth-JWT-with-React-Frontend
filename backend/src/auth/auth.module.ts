import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // Import UserModule
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // 1. Import UserModule:
    // AuthModule cần "nhờ" UserModule tìm kiếm người dùng trong Database (kiểm tra email, lấy password hash).
    // Nếu không import UserModule, bạn sẽ không thể Inject 'UserService' vào 'AuthService' được.
    UserModule, 

    // 2. Đăng ký JwtModule:
    // Đây là module cung cấp các công cụ để tạo (sign) và xác thực (verify) JSON Web Token.
    // .register({}) đang để object rỗng vì:
    // - Chúng ta muốn cấu hình Secret Key và Expiration Time một cách linh hoạt bên trong AuthService (dùng ConfigService).
    // - Hoặc cấu hình riêng cho từng loại token (Access Token 15p, Refresh Token 7 ngày).
    JwtModule.register({}), 
  ],
  controllers: [AuthController], // Đăng ký Controller để nhận request (/auth/login...)
  
  providers: [
    AuthService, // Chứa logic chính: Kiểm tra pass, tạo token.

    // 3. JwtStrategy:
    // Đây là thành phần cực kỳ quan trọng của thư viện Passport.
    // Nó định nghĩa "luật" để kiểm tra xem một Token gửi lên có hợp lệ hay không.
    // (Nó sẽ được dùng tự động khi bạn gắn @UseGuards(JwtAuthGuard) vào các route bảo mật).
    JwtStrategy,
  ],
  
  exports: [AuthService], // Cho phép các module khác dùng ké AuthService (nếu cần).
})
export class AuthModule {}