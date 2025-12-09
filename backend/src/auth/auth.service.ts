import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // 1. Kiểm tra tài khoản khi đăng nhập
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 2. Hàm đăng nhập -> Trả về cặp Token
  async login(user: any) {
    const tokens = await this.getTokens(user.id, user.email);
    return {
      user: { id: user.id, email: user.email }, // Trả thêm info user cho tiện
      ...tokens,
    };
  }

  // 3. Hàm tạo cặp Access & Refresh Token
  async getTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as any, {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: process.env.JWT_ACCESS_EXPIRATION! as any,
      }),
      this.jwtService.signAsync(payload as any, {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION! as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // 4. Logic Refresh Token (Cấp lại Access Token mới)
  async refreshToken(token: string) {
    try {
      // Xác thực Refresh Token có hợp lệ không
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });

      // Nếu hợp lệ, cấp lại cặp token mới (hoặc chỉ access token tùy logic)
      // Ở đây ta cấp lại Access Token mới
      const newAccessToken = await this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email } as any,
        {
          secret: process.env.JWT_ACCESS_SECRET!,
          expiresIn: process.env.JWT_ACCESS_EXPIRATION! as any,
        },
      );

      return { accessToken: newAccessToken };
    } catch (e) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }
}