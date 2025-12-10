import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Get,
  Request,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';

// @Controller('user'): Định nghĩa route gốc (prefix).
// Các API trong này sẽ có dạng: /user/register, /user/profile
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // --- 1. ĐĂNG KÝ (Public Route) ---
  @Post('/register')
  @UsePipes(ValidationPipe)
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  // --- 2. LẤY THÔNG TIN CÁ NHÂN (Protected Route) ---
  // @UseGuards(AuthGuard('jwt')): "Cánh cổng bảo vệ".
  // - Endpoint này yêu cầu phải có Access Token hợp lệ gửi kèm.
  // - Nó sẽ kích hoạt 'JwtStrategy' (file jwt.strategy.ts) để kiểm tra token.
  // - Nếu không có token hoặc token hết hạn -> Trả về lỗi 401 Unauthorized ngay lập tức.
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    // @Request() req: Lấy đối tượng Request.
    // req.user: Dữ liệu này TỰ ĐỘNG có được nhờ hàm 'validate()' trong JwtStrategy.
    // (Nó chứa: { userId: ..., email: ... })
    
    // Gọi DB để lấy thông tin mới nhất (phòng trường hợp user vừa đổi tên/ảnh nhưng token cũ chưa cập nhật)
    const user = await this.userService.findOneByEmail(req.user.email);
    
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Kỹ thuật Destructuring để loại bỏ password ra khỏi kết quả trả về.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user; 
    
    // Trả về object user sạch (không chứa mật khẩu)
    return result;
  }

  // --- 3. CẬP NHẬT THÔNG TIN (Protected Route) ---
  @UseGuards(AuthGuard('jwt')) // Cũng yêu cầu đăng nhập mới được sửa
  @Patch('profile') // @Patch: Dùng khi chỉ muốn sửa một vài trường (Update partial) thay vì thay thế toàn bộ như @Put
  async updateProfile(
    @Request() req, 
    // @Body(): Nhận dữ liệu cần sửa, đã được validate qua UpdateUserDto
    @Body() updateUserDto: UpdateUserDto
  ) {
    // req.user.email: Lấy email từ Token (đảm bảo User A chỉ sửa được profile của User A)
    const user = await this.userService.update(req.user.email, updateUserDto);
    
    // Tiếp tục loại bỏ password trước khi trả về frontend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}