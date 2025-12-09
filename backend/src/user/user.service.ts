import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
// Import thư viện bcrypt để mã hóa mật khẩu
import * as bcrypt from 'bcrypt';

// Định nghĩa kiểu dữ liệu cho lỗi trả về từ PostgreSQL
// Giúp TypeScript hiểu được cấu trúc object lỗi để chúng ta lấy ra mã lỗi (code)
type PgError = {
  code?: string;
};

@Injectable()
export class UserService {
  // Constructor: Tiêm (Inject) Repository của User vào để thao tác với Database
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Hàm xử lý đăng ký người dùng mới
  // Nhận vào DTO (Data Transfer Object) chứa email và password
  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password } = registerUserDto;

    // --- BƯỚC 1: MÃ HÓA MẬT KHẨU (Hashing) ---
    // Tạo "salt" ngẫu nhiên để tăng độ khó khi mã hóa
    const salt = await bcrypt.genSalt();
    // Mã hóa mật khẩu với salt vừa tạo
    // (Tuyệt đối không bao giờ lưu password dạng plain-text trong database)
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- BƯỚC 2: CHUẨN BỊ DỮ LIỆU ---
    // Tạo đối tượng User mới nhưng CHƯA lưu vào DB
    const user = this.userRepository.create({
      email,
      password: hashedPassword, // Lưu password đã mã hóa
    });

    try {
      // --- BƯỚC 3: LƯU VÀO DATABASE ---
      const saved = await this.userRepository.save(user);
      // Trả về thông tin user đã lưu, loại bỏ trường password khỏi kết quả trả về
      const { password, ...result } = saved;
      return result as User;
    } catch (error: unknown) {
      // --- BƯỚC 4: XỬ LÝ LỖI ---

      // Kiểm tra xem lỗi có phải là object và có mã lỗi (code) hay không
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const { code } = error as PgError;

        // Mã lỗi '23505' là mã lỗi đặc trưng của PostgreSQL cho việc vi phạm tính duy nhất (Unique constraint)
        // Nghĩa là: Email này đã có trong bảng users rồi.
        if (code === '23505') {
          // Ném ra lỗi 409 Conflict để Frontend biết
          throw new ConflictException('Email đã tồn tại');
        }
      }

      // Nếu gặp các lỗi khác không xác định (mất kết nối DB, lỗi cú pháp...), ném lỗi 500
      throw new InternalServerErrorException();
    }
  }
}
