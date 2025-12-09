import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsDateString() // Kiểm tra chuỗi ngày tháng (YYYY-MM-DD)
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;
}