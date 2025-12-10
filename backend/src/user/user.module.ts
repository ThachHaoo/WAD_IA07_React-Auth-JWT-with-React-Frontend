import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserProfile } from './user-profile.entity';

@Module({
  // 1. imports: Nơi khai báo các module phụ thuộc.
  // Quan trọng: TypeOrmModule.forFeature([User, UserProfile])
  // - Lệnh này đăng ký Entity 'User' VÀ 'UserProfile' với TypeORM cho riêng module này.
  // - Nó cho phép NestJS tự động tạo ra Repository cho cả 2 bảng.
  // - Nhờ đó, trong UserService bạn có thể dùng @InjectRepository(User) 
  //   hoặc @InjectRepository(UserProfile) (nếu cần).
  imports: [TypeOrmModule.forFeature([User, UserProfile])],

  // 2. controllers: Khai báo các Controller thuộc module này.
  // - Giúp NestJS biết đường dẫn (route) nào sẽ do module này xử lý (ví dụ /user/profile).
  controllers: [UserController],

  // 3. providers: Khai báo các Service (logic nghiệp vụ).
  // - Đăng ký UserService vào hệ thống Dependency Injection (DI) của module này.
  // - Nếu không khai báo ở đây, UserController sẽ không thể sử dụng (inject) được UserService.
  providers: [UserService],

  // 4. exports: Chia sẻ Provider cho các Module khác sử dụng.
  // - Đây là phần CỰC KỲ QUAN TRỌNG khi làm tính năng Login.
  // - Lý do: AuthModule cần gọi hàm 'validateUser' bên trong UserService để kiểm tra mật khẩu.
  // - Nếu bạn không export UserService tại đây, AuthModule sẽ báo lỗi "Nest can't resolve dependencies".
  exports: [UserService],
})
export class UserModule {}