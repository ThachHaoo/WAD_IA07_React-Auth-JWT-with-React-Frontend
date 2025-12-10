import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserProfile } from './user-profile.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

// Định nghĩa kiểu dữ liệu cho lỗi Postgres
type PgError = {
  code?: string;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // --- 1. TÌM USER THEO EMAIL ---
  // Hàm này dùng chung cho cả Login, Get Profile và Update Profile.
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      // relations: ['profile'] -> Yêu cầu TypeORM Join với bảng UserProfile để lấy thông tin chi tiết.
      // (Nếu bên Entity đã để eager: true thì dòng này có thể bỏ qua, nhưng khai báo rõ ràng vẫn tốt hơn).
      relations: ['profile'] 
    });
  }
  
  // --- 2. CẬP NHẬT THÔNG TIN (Logic quan trọng) ---
  async update(email: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Bước 1: Tìm User đang muốn sửa trong DB
    const user = await this.findOneByEmail(email);

    // Kiểm tra an toàn: Nếu không tìm thấy (về lý thuyết khó xảy ra vì đã qua AuthGuard) -> Báo lỗi.
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    // Bước 2: Xử lý trường hợp User chưa có Profile cũ.
    // Nếu user.profile đang là null/undefined -> Khởi tạo một đối tượng Profile rỗng mới.
    if (!user.profile) {
      user.profile = new UserProfile();
    }

    // Bước 3: Cập nhật dữ liệu từ DTO vào entity Profile
    // Chỉ cập nhật những trường mà Frontend có gửi lên (check if).
    if (updateUserDto.fullName) user.profile.fullName = updateUserDto.fullName;
    if (updateUserDto.address) user.profile.address = updateUserDto.address;
    
    // Lưu ý: Dữ liệu ngày tháng từ JSON gửi lên thường là chuỗi (string), cần ép kiểu về Date object.
    if (updateUserDto.dateOfBirth) user.profile.dateOfBirth = new Date(updateUserDto.dateOfBirth);

    // Bước 4: Lưu User xuống Database.
    // TẠI SAO LƯU USER MÀ PROFILE CŨNG ĐƯỢC LƯU?
    // -> Nhờ cấu hình { cascade: true } trong file user.entity.ts.
    // -> Khi lưu User, TypeORM tự động phát hiện sự thay đổi bên trong user.profile và lưu luôn bảng Profile.
    return this.userRepository.save(user);
  }

  // --- 3. ĐĂNG KÝ USER MỚI ---
  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password } = registerUserDto;

    // Hash mật khẩu
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo instance User (chưa lưu)
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    try {
      // Lưu vào DB
      const saved = await this.userRepository.save(user);
      
      // Loại bỏ password khỏi kết quả trả về (Spread Operator)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = saved;
      return result as User;
      
    } catch (error: unknown) {
      // Xử lý lỗi trùng lặp Email (Mã lỗi Postgres: 23505)
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const { code } = error as PgError;
        if (code === '23505') {
          throw new ConflictException('Email đã tồn tại');
        }
      }
      throw new InternalServerErrorException();
    }
  }
}