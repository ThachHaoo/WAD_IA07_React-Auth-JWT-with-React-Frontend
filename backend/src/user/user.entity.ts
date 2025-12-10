import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';

// @Entity(): Decorator báo cho TypeORM biết đây là một bảng trong Database.
@Entity()
export class User {
  // @PrimaryGeneratedColumn(): Khóa chính tự động tăng (1, 2, 3...).
  @PrimaryGeneratedColumn()
  id: number;

  // @Column(): Cột Email, bắt buộc duy nhất (unique) và không được rỗng.
  @Column({ unique: true, nullable: false })
  email: string;

  // Cột Password: Lưu chuỗi hash, không lưu plain-text.
  @Column({ nullable: false })
  password: string;

  // --- QUAN HỆ ONE-TO-ONE (1-1) ---
  // Định nghĩa mối quan hệ: Một User chỉ có một Profile duy nhất.
  // - Tham số 1: Chỉ định Entity đích (UserProfile).
  // - Tham số 2: Chỉ định trường đối ứng bên Entity đích (profile.user).
  @OneToOne(() => UserProfile, (profile) => profile.user, {
    
    // cascade: true -> "Hiệu ứng lan truyền".
    // Khi bạn lưu (save) User, nếu trong object User có chứa thông tin Profile,
    // TypeORM sẽ TỰ ĐỘNG insert/update luôn bảng Profile.
    // -> Giúp bạn không cần gọi lệnh save 2 lần cho 2 bảng.
    cascade: true, 
    
    // eager: true -> "Tải ngay lập tức".
    // Khi bạn dùng lệnh findOne (lấy User), TypeORM sẽ tự động JOIN với bảng Profile
    // để lấy luôn dữ liệu profile về.
    // -> Rất tiện lợi, không cần phải khai báo .relations: ['profile'] thủ công.
    eager: true,   
  })
  
  // @JoinColumn(): Đánh dấu đây là "Bên sở hữu" (Owner Side) của quan hệ.
  // Kết quả trong Database: Bảng 'user' sẽ có thêm một cột tên là "profileId" (khóa ngoại).
  // (Nếu không có @JoinColumn, TypeORM sẽ không biết đặt khóa ngoại ở bảng nào).
  @JoinColumn() 
  profile: UserProfile;

  // @CreateDateColumn(): Tự động ghi lại thời điểm tạo bản ghi.
  @CreateDateColumn()
  createdAt: Date;
}