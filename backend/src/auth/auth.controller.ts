import { Controller, Post, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException('Thiếu Refresh Token');
    }
    return this.authService.refreshToken(body.refreshToken);
  }
}