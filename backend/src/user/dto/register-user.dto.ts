// Import các decorator kiểm tra dữ liệu từ thư viện class-validator.
// Thư viện này hoạt động song song với class-transformer để chuyển đổi và kiểm tra dữ liệu JSON gửi lên.
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

// DTO (Data Transfer Object): Đối tượng chuyển đổi dữ liệu.
// Đây là "Hợp đồng" (Contract) giữa Frontend và Backend.
// Nó quy định chính xác Frontend được phép gửi những trường nào lên Server.
// Nếu Frontend gửi thừa trường (ví dụ: gửi thêm 'role: admin'), NestJS có thể tự động loại bỏ (nếu config whitelist: true).
export class RegisterUserDto {
  
  // --- VALIDATE EMAIL ---
  // @IsEmail: Kiểm tra định dạng chuỗi có phải là email hợp lệ không (a@b.c).
  // LƯU Ý QUAN TRỌNG:
  // - Decorator này chỉ kiểm tra ĐỊNH DẠNG (Format).
  // - Nó KHÔNG kiểm tra email đã tồn tại trong Database hay chưa (việc đó là của UserService lo).
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  // --- VALIDATE PASSWORD ---
  // Có thể áp dụng nhiều decorator lên cùng một trường. Chúng sẽ chạy tuần tự.
  
  // 1. @IsNotEmpty: Chặn trường hợp gửi chuỗi rỗng "" hoặc null.
  // Đảm bảo user bắt buộc phải nhập gì đó.
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })

  // 2. @MinLength: Quy định độ dài tối thiểu.
  // Đây là lớp bảo vệ cơ bản. Nếu muốn mạnh hơn (phải có chữ hoa, số...), 
  // bạn có thể dùng thêm @Matches(/regex/) sau này.
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}