import { Controller, Post, Body, UnauthorizedException, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';

// Controller này quản lý các endpoint liên quan đến xác thực: Login, Logout, Refresh Token.
// Prefix đường dẫn sẽ là: /auth (ví dụ: POST /auth/login)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // --- 1. ĐĂNG NHẬP ---
  @Post('login')
  async login(
    @Body() body, 
    // @Res({ passthrough: true }): Quan trọng!
    // Mặc định nếu dùng @Res, NestJS sẽ đợi bạn tự gửi response (res.send).
    // Dùng passthrough: true giúp bạn vẫn thao tác được với Response (để set Cookie)
    // nhưng vẫn có thể return object JSON ở cuối hàm như bình thường.
    @Res({ passthrough: true }) res: Response
  ) {
    // Gọi Service để kiểm tra email/password
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    
    // Tạo cặp token (Access Token & Refresh Token)
    const data = await this.authService.login(user);

    // --- BẢO MẬT: Gửi Refresh Token xuống Cookie ---
    // Thay vì trả Refresh Token trong body để Frontend lưu vào LocalStorage,
    // ta lưu vào Cookie với cờ HttpOnly.
    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true, // QUAN TRỌNG: JavaScript phía Client KHÔNG THỂ đọc được cookie này -> Chống hacker lấy cắp token (XSS).
      secure: true,   // Nếu true: Chỉ gửi cookie qua HTTPS. (Lưu ý: set false nếu chạy localhost http thường, set true khi deploy).
      sameSite: 'none', // Cho phép gửi cookie giữa các domain khác nhau (nếu Frontend và Backend khác domain).
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Cookie tự hết hạn sau 7 ngày.
    });

    // --- TRẢ VỀ DỮ LIỆU ---
    // Chỉ trả về Access Token (để Frontend dùng gọi API) và thông tin User.
    // Frontend không cần biết Refresh Token là gì, trình duyệt sẽ tự quản lý nó.
    return {
      accessToken: data.accessToken,
      user: data.user,
    };
  }

  // --- 2. LÀM MỚI TOKEN (Refresh) ---
  @Post('refresh')
  async refresh(@Req() req: Request) {
    // Lấy Refresh Token từ Cookie gửi lên (thay vì lấy từ Body JSON)
    // Lưu ý: Cần cài đặt thư viện 'cookie-parser' trong main.ts để đọc được req.cookies
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token không tồn tại');
    }
    
    // Gọi Service để cấp lại Access Token mới
    return this.authService.refreshToken(refreshToken);
  }

  // --- 3. ĐĂNG XUẤT ---
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Xóa Cookie chứa Refresh Token để người dùng không thể refresh phiên đăng nhập được nữa
    res.clearCookie('refreshToken');
    return { message: 'Đăng xuất thành công' };
  }
}