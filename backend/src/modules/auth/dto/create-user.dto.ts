import { IsEmail, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  password!: string;

  @IsOptional()
  mssv?: string;

  @IsOptional()
  @IsIn(['STUDENT', 'EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'])
  role?: 'STUDENT' | 'EVENT_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
}
