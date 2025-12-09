import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';

// @Controller('user'): Định nghĩa route gốc (prefix) cho toàn bộ Controller này.
// Tất cả các endpoint bên trong sẽ bắt đầu bằng "/user".
@Controller('user')
export class UserController {
  // Inject UserService thông qua Constructor để sử dụng các logic nghiệp vụ (lưu DB, hash password...).
  constructor(private userService: UserService) {}

  // @Post('/register'): Định nghĩa endpoint với phương thức POST.
  // -> Kết hợp với prefix ở trên, đường dẫn đầy đủ của API này là:
  //    POST http://localhost:3000/user/register
  // (Đây chính là đường dẫn mà axiosClient bên React đang gọi).
  @Post('/register')

  // @UsePipes(ValidationPipe): Kích hoạt bộ lọc kiểm tra dữ liệu (Validation) của NestJS.
  // Cơ chế hoạt động:
  // 1. Nhận dữ liệu JSON từ body request.
  // 2. Đối chiếu với các quy tắc (rules) trong file DTO (RegisterUserDto).
  // 3. Nếu dữ liệu sai (ví dụ: email rỗng, password < 6 ký tự) -> Tự động trả về lỗi 400 Bad Request kèm thông báo chi tiết.
  // 4. Nếu dữ liệu đúng -> Mới cho phép chạy tiếp vào hàm bên dưới.
  @UsePipes(ValidationPipe)
  async register(@Body() registerUserDto: RegisterUserDto) {
    // @Body(): Decorator giúp lấy dữ liệu từ body của request và map vào biến registerUserDto.

    // Gọi sang Service để thực hiện logic đăng ký (Hash password -> Lưu xuống DB).
    return this.userService.register(registerUserDto);
  }
}
