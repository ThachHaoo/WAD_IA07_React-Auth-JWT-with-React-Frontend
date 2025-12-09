// Import các decorator (bộ kiểm tra) từ thư viện class-validator.
// Thư viện này kết hợp với ValidationPipe (trong controller) để tự động kiểm tra dữ liệu.
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

// DTO (Data Transfer Object): Đối tượng chuyển đổi dữ liệu.
// Class này định nghĩa cấu trúc dữ liệu mà Client (React) BẮT BUỘC phải gửi lên khi gọi API đăng ký.
export class RegisterUserDto {
  // @IsEmail: Kiểm tra xem chuỗi string này có đúng định dạng email không (phải có @, domain, v.v.).
  // Tham số thứ 2 là options: { message: '...' } để tùy chỉnh thông báo lỗi trả về cho Frontend.
  // -> Nếu sai, API sẽ trả về lỗi 400 Bad Request ngay lập tức.
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  // Kết hợp nhiều decorator cho một trường:

  // 1. @IsNotEmpty: Đảm bảo người dùng không gửi chuỗi rỗng "" hoặc null/undefined.
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })

  // 2. @MinLength: Đảm bảo độ dài tối thiểu là 6 ký tự.
  // Đây là lớp bảo mật cơ bản để tránh user đặt mật khẩu quá yếu.
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}
