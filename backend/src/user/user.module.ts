import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';

@Module({
  // 1. imports: Nơi khai báo các module phụ thuộc.
  // Quan trọng: TypeOrmModule.forFeature([User])
  // - Lệnh này đăng ký Entity 'User' với TypeORM cho riêng module này.
  // - Nó cho phép NestJS tự động tạo ra một 'Repository' cho bảng User.
  // - Nhờ dòng này, bạn mới có thể sử dụng @InjectRepository(User) trong UserService.
  imports: [TypeOrmModule.forFeature([User])],

  // 2. controllers: Khai báo các Controller thuộc module này.
  // - Giúp NestJS biết đường dẫn (route) nào sẽ do module này xử lý.
  controllers: [UserController],

  // 3. providers: Khai báo các Service (logic nghiệp vụ).
  // - Đăng ký UserService vào hệ thống Dependency Injection (DI).
  // - Nếu không khai báo ở đây, UserController sẽ không thể sử dụng (inject) được UserService.
  providers: [UserService],

  // (Mở rộng) exports:
  // - Nếu bạn muốn module khác (ví dụ AuthModule) sử dụng được UserService,
  // - bạn cần thêm dòng: exports: [UserService]
})
export class UserModule {}
