import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../user.entity';

// Create (admin/super admin only)
export class CreateUserDto {
  @ApiProperty({ example: 'sv001' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @ApiProperty({ example: 'sv001@school.edu.vn' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '217IT01010' })
  @IsOptional()
  @IsString()
  mssv?: string;

  @ApiProperty({ example: 'StrongPass@123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({
    enum: ['STUDENT', 'EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
    default: 'STUDENT',
  })
  @IsOptional()
  @IsEnum(['STUDENT', 'EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'])
  role?: User['role'];
}

// Update role (admin only)
export class UpdateRoleDto {
  @ApiProperty({ enum: ['STUDENT', 'EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'] })
  @IsEnum(['STUDENT', 'EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'])
  role!: User['role'];
}

// Update profile (self or admin)
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'sv001_new' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @ApiPropertyOptional({ example: 'new@school.edu.vn' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '217IT01010' })
  @IsOptional()
  @IsString()
  mssv?: string;

  @ApiPropertyOptional({ example: 'NewPass@123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

// Query / pagination (admin only)
export class QueryUsersDto {
  @ApiPropertyOptional({ description: 'Tìm theo tên hoặc email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['STUDENT', 'EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  })
  @IsOptional()
  @IsEnum(['STUDENT', 'EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'])
  role?: User['role'];

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
