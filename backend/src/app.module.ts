import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Import ConfigModule để quản lý biến môi trường (.env)
import { ConfigModule } from '@nestjs/config';
// Import TypeOrmModule để kết nối và làm việc với Database
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // 1. Cấu hình ConfigModule
    // Giúp ứng dụng đọc được các biến trong file .env (như DB_HOST, DB_PASSWORD...)
    ConfigModule.forRoot({
      isGlobal: true, // Đặt là true để có thể dùng biến môi trường ở mọi module khác mà không cần import lại
    }),

    // 2. Import Module tính năng (Feature Module)
    // Đăng ký UserModule vào ứng dụng chính
    UserModule,

    // 3. Cấu hình kết nối Database (PostgreSQL)
    TypeOrmModule.forRoot({
      type: 'postgres', // Loại database sử dụng

      // Lấy thông tin kết nối từ biến môi trường (process.env)
      // Việc này giúp bảo mật thông tin và dễ dàng thay đổi khi deploy
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!), // Chuyển đổi port từ chuỗi sang số (parseInt)
      username: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,

      // Danh sách các Entity (bảng) sẽ được nạp vào kết nối này
      entities: [User],

      // --- CỰC KỲ QUAN TRỌNG ---
      // synchronize: true -> Tự động tạo/sửa bảng trong DB dựa trên code Entity.
      // LƯU Ý: Chỉ để 'true' khi đang Dev (phát triển).
      // Khi lên Production (chạy thật), phải đổi thành 'false' để tránh mất dữ liệu do sửa đổi cấu trúc bảng.
      synchronize: true,

      // Cấu hình SSL (Secure Sockets Layer)
      // Thường bắt buộc khi kết nối với các Database trên Cloud (như Neon, Supabase, Render, Heroku...)
      ssl: {
        rejectUnauthorized: false, // Cho phép kết nối dù chứng chỉ SSL tự ký (thường dùng cho dev/free tier)
      },
    }),
  ],
  controllers: [AppController], // Đăng ký Controller gốc
  providers: [AppService], // Đăng ký Service gốc
})
export class AppModule {}
