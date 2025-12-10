import { IsString, IsOptional, IsDateString } from 'class-validator';

// DTO này dùng cho API cập nhật thông tin (PATCH /user/profile).
export class UpdateUserDto {
  
  // --- @IsOptional(): Decorator quan trọng nhất trong Update DTO ---
  // Cơ chế hoạt động:
  // 1. Nếu Frontend KHÔNG gửi trường 'fullName' lên -> NestJS bỏ qua, không báo lỗi.
  // 2. Nếu Frontend CÓ gửi trường 'fullName' -> NestJS mới chạy tiếp @IsString() để kiểm tra.
  // -> Rất phù hợp với phương thức PATCH (chỉ sửa những gì cần sửa).
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  fullName?: string; // Dấu '?' đánh dấu cho TypeScript biết biến này có thể undefined

  @IsOptional()
  // @IsDateString(): Kiểm tra chuỗi gửi lên có đúng chuẩn ngày tháng quốc tế (ISO 8601) không.
  // Ví dụ hợp lệ: "2003-10-24" hoặc "2023-10-24T10:00:00Z".
  // Lưu ý: Dữ liệu nhận được tại đây vẫn là STRING.
  // Việc chuyển đổi thành Date Object (new Date(...)) sẽ do UserService thực hiện.
  @IsDateString({}, { message: 'Ngày sinh không đúng định dạng (YYYY-MM-DD)' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;
}