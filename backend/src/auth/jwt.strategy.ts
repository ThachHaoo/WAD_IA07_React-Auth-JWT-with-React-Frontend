import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
// Class này kế thừa từ PassportStrategy, sử dụng chiến thuật 'jwt'
// Đây là tiêu chuẩn để tích hợp xác thực JWT vào NestJS một cách clean nhất.
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 1. Cấu hình nơi lấy Token:
      // Frontend sẽ gửi token lên qua Header theo chuẩn: "Authorization: Bearer <token_string>"
      // Hàm này giúp NestJS tự động tìm và trích xuất chuỗi token đó ra để kiểm tra.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // 2. Kiểm tra hạn sử dụng (Expiration):
      // ignoreExpiration: false -> Nếu token đã hết hạn (dựa trên trường 'exp'), 
      // NestJS sẽ lập tức trả về lỗi 401 Unauthorized mà không cần chạy vào hàm validate bên dưới.
      ignoreExpiration: false,
      
      // 3. Khóa bí mật (Secret Key):
      // Phải dùng đúng cái key mà bạn đã dùng để tạo (sign) token bên auth.service.ts.
      // Mục đích: Để đảm bảo token này do chính server mình cấp, không bị hacker giả mạo.
      secretOrKey: process.env.JWT_ACCESS_SECRET!, 
    });
  }

  // Hàm này CHỈ chạy khi token đã được xác thực chữ ký (verify signature) và còn hạn (not expired).
  // payload: Là dữ liệu JSON đã được giải mã từ token (VD: { sub: 1, email: 'a@b.com', ... })
  async validate(payload: any) {
    // QUAN TRỌNG: Giá trị return tại đây sẽ được NestJS tự động gán vào "request.user".
    // Nhờ đó, tại Controller bạn có thể dùng @Req() req -> req.user để biết ai đang gọi API.
    return { userId: payload.sub, email: payload.email };
  }
}