import { Controller, Post, Body, UnauthorizedException, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    
    const data = await this.authService.login(user);

    // 1. Gửi Refresh Token xuống Cookie (HTTP Only)
    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true, // JavaScript không đọc được (Chống XSS)
      secure: false, // Để false khi chạy localhost (True khi deploy https)
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
    });

    // 2. Chỉ trả về Access Token và User Info trong Body
    return {
      accessToken: data.accessToken,
      user: data.user,
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    // 3. Lấy Refresh Token từ Cookie (thay vì Body)
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token không tồn tại');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // 4. Xóa Cookie khi logout
    res.clearCookie('refreshToken');
    return { message: 'Đăng xuất thành công' };
  }
}