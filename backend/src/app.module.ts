import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Import ConfigModule để quản lý biến môi trường (.env)
import { ConfigModule } from '@nestjs/config';
// Import TypeOrmModule để kết nối và làm việc với Database
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './user/user-profile.entity';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 1. Cấu hình ConfigModule
    // Giúp ứng dụng đọc được các biến trong file .env (như DB_HOST, DB_PASSWORD...)
    // isGlobal: true -> Biến môi trường sẽ dùng được ở mọi nơi (UserModule, AuthModule...) mà không cần import lại ConfigModule.
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    // 2. Import Module tính năng (Feature Module)
    // Đăng ký UserModule: Quản lý CRUD User, Profile.
    UserModule,

    // --- QUAN TRỌNG: Đăng ký AuthModule ---
    // Đây là module chứa các route Login, Refresh Token mà bạn vừa viết.
    // Nếu quên import vào đây, gọi API /auth/login sẽ bị báo lỗi 404 Not Found.
    AuthModule,

    // 3. Cấu hình kết nối Database (PostgreSQL)
    TypeOrmModule.forRoot({
      type: 'postgres', // Loại database sử dụng

      // Lấy thông tin kết nối từ biến môi trường (process.env)
      // Việc này giúp bảo mật thông tin và dễ dàng thay đổi khi deploy (ví dụ đổi từ DB local sang DB cloud).
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!), // Chuyển đổi port từ chuỗi sang số (parseInt)
      username: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,

      // --- DANH SÁCH ENTITY ---
      // Mọi Entity (bảng) muốn TypeORM tạo ra trong database đều phải liệt kê ở đây.
      // Bạn đang có 2 bảng: User (tài khoản) và UserProfile (thông tin chi tiết).
      entities: [User, UserProfile],

      // --- CỰC KỲ QUAN TRỌNG ---
      // synchronize: true -> Tự động tạo/sửa bảng trong DB dựa trên code Entity.
      // Ví dụ: Bạn thêm cột "phone" vào file user.entity.ts -> TypeORM tự thêm cột đó vào DB.
      // LƯU Ý: Chỉ để 'true' khi đang Dev. Lên Production phải để 'false' để tránh mất dữ liệu quan trọng.
      synchronize: true,

      // Cấu hình SSL (Secure Sockets Layer)
      // Thường bắt buộc khi kết nối với các Database trên Cloud (như Neon, Supabase, Render...).
      // Nếu chạy DB Local (máy cá nhân), đôi khi cần set 'ssl: false' hoặc comment đoạn này lại nếu gặp lỗi kết nối.
      ssl: {
        rejectUnauthorized: false, // Cho phép kết nối dù chứng chỉ SSL tự ký
      },
    }),
  ],
  controllers: [AppController], // Đăng ký Controller gốc
  providers: [AppService], // Đăng ký Service gốc
})
export class AppModule {}