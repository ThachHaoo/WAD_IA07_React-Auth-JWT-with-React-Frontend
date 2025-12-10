import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
// Import thư viện bcrypt để so sánh mật khẩu đã mã hóa
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Inject UserService để tìm user trong DB
  // Inject JwtService để tạo (sign) và xác thực (verify) token
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // --- 1. KIỂM TRA TÀI KHOẢN (Validate) ---
  // Hàm này được gọi bởi LocalStrategy (nếu dùng) hoặc gọi trực tiếp từ AuthController khi user login.
  async validateUser(email: string, pass: string): Promise<any> {
    // Bước 1: Tìm user trong database theo email
    const user = await this.userService.findOneByEmail(email);
    
    // Bước 2: Nếu user tồn tại, dùng bcrypt để so sánh mật khẩu người dùng nhập (pass) 
    // với mật khẩu đã mã hóa trong database (user.password).
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Bước 3: Nếu khớp, loại bỏ trường password ra khỏi object kết quả để bảo mật
      // (Dùng kỹ thuật destructuring: lấy password ra riêng, còn lại gộp vào biến result)
      const { password, ...result } = user;
      return result;
    }
    
    // Nếu không tìm thấy user hoặc sai mật khẩu -> Trả về null
    return null;
  }

  // --- 2. XỬ LÝ ĐĂNG NHẬP (Login) ---
  async login(user: any) {
    // Sau khi validate thành công, tiến hành tạo cặp Access/Refresh Token
    const tokens = await this.getTokens(user.id, user.email);
    
    // Trả về object gồm thông tin user cơ bản và tokens
    return {
      user: { id: user.id, email: user.email }, // Trả thêm info user để frontend hiển thị (ví dụ trên Header)
      ...tokens,
    };
  }

  // --- 3. TẠO TOKENS (Sign JWT) ---
  // Hàm helper để tạo cùng lúc Access Token và Refresh Token
  async getTokens(userId: number, email: string) {
    // Payload là dữ liệu sẽ được gói bên trong Token (Frontend có thể decode để xem)
    const payload = { sub: userId, email };

    // Dùng Promise.all để chạy song song 2 tác vụ ký token giúp tăng tốc độ
    const [accessToken, refreshToken] = await Promise.all([
      // Tạo Access Token: Thời hạn ngắn (VD: 15p), dùng Secret Key riêng
      this.jwtService.signAsync(payload as any, {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: process.env.JWT_ACCESS_EXPIRATION! as any,
      }),
      // Tạo Refresh Token: Thời hạn dài (VD: 7 ngày), dùng Secret Key riêng
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

  // --- 4. LÀM MỚI ACCESS TOKEN (Refresh Logic) ---
  // Hàm này được gọi khi Access Token hết hạn, Frontend gửi Refresh Token lên để xin cấp mới
  async refreshToken(token: string) {
    try {
      // Bước 1: Xác thực Refresh Token gửi lên có hợp lệ không (có đúng secret key và còn hạn không)
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });

      // Bước 2: Nếu token hợp lệ, lấy thông tin từ payload cũ để tạo Access Token mới.
      // Lưu ý: Ở đây ta chỉ cấp lại Access Token. Refresh Token vẫn giữ nguyên (cho đến khi nó hết hạn).
      const newAccessToken = await this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email } as any,
        {
          secret: process.env.JWT_ACCESS_SECRET!,
          expiresIn: process.env.JWT_ACCESS_EXPIRATION! as any,
        },
      );

      return { accessToken: newAccessToken };
    } catch (e) {
      // Nếu Refresh Token không hợp lệ (hết hạn, giả mạo...) -> Ném lỗi 401 bắt user đăng nhập lại
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }
}