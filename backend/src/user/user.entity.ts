import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

// @Entity(): Decorator quan trọng nhất.
// Nó báo cho TypeORM biết class 'User' này sẽ đại diện cho một bảng trong Database.
// Mặc định, TypeORM sẽ tạo bảng tên là "user" (chữ thường) trong PostgreSQL.
@Entity()
export class User {
  // @PrimaryGeneratedColumn(): Định nghĩa cột khóa chính (Primary Key).
  // TypeORM sẽ tự động sinh giá trị và tự động tăng (Auto Increment) mỗi khi thêm user mới (1, 2, 3...).
  @PrimaryGeneratedColumn()
  id: number;

  // @Column(): Định nghĩa các cột dữ liệu thông thường.
  // Các tùy chọn (options):
  // - unique: true -> Đảm bảo email là duy nhất. Nếu cố tình thêm email trùng, DB sẽ báo lỗi (liên quan đến lỗi 23505 ở user.service).
  // - nullable: false -> Bắt buộc phải có dữ liệu, không được phép để NULL.
  @Column({ unique: true, nullable: false })
  email: string;

  // Cột lưu mật khẩu.
  // Lưu ý: Giá trị lưu ở đây là chuỗi Hash (đã mã hóa) dài ngoằng, KHÔNG PHẢI mật khẩu gốc "123456".
  @Column({ nullable: false })
  password: string;

  // @CreateDateColumn(): Cột đặc biệt dùng để Audit (ghi vết).
  // TypeORM sẽ TỰ ĐỘNG điền thời gian hiện tại ngay khoảnh khắc bản ghi được tạo ra.
  // Bạn không cần phải set giá trị cho trường này thủ công trong code.
  @CreateDateColumn()
  createdAt: Date;
}
