import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Lấy token từ Header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!, // Dùng Access Secret để check
    });
  }

  async validate(payload: any) {
    // Trả về thông tin user đã giải mã, NestJS sẽ gán vào request.user
    return { userId: payload.sub, email: payload.email };
  }
}