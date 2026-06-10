import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFacultyDto {
  @ApiProperty({ example: 'IT' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiProperty({ example: 'Khoa Công nghệ thông tin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
}

export class UpdateFacultyDto {
  @ApiProperty({ example: 'IT' })
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({ example: 'Khoa Công nghệ thông tin' })
  @IsString()
  @MaxLength(255)
  name?: string;
}
