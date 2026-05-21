import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsArray,
  IsEmail,
  MaxLength,
  Min,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  EVENT_STATUS,
  EVENT_CATEGORY,
  DISPLAY_CATEGORY,
  SCALE,
} from '../../../constants/event.constants';

import type {
  EventStatus,
  EventCategory,
  DisplayCategory,
  Scale,
} from '../../../constants/event.constants';

export class CreateEventDto {
  @ApiProperty({
    example: 'Workshop NestJS',
  })
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    example: 'Workshop về NestJS nâng cao',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Hall A',
  })
  @IsNotEmpty()
  @MaxLength(500)
  location!: string;

  @ApiProperty({
    example: '2026-05-20T08:00:00.000Z',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    example: '2026-05-20T12:00:00.000Z',
  })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({
    example: '2026-05-19T23:59:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @ApiPropertyOptional({
    enum: EVENT_STATUS,
    example: 'UPCOMING',
  })
  @IsOptional()
  @IsEnum(EVENT_STATUS)
  status?: EventStatus;

  @ApiPropertyOptional({
    enum: DISPLAY_CATEGORY,
    example: 'NORMAL',
  })
  @IsOptional()
  @IsEnum(DISPLAY_CATEGORY)
  displayCategory?: DisplayCategory;

  @ApiPropertyOptional({
    enum: EVENT_CATEGORY,
    example: 'ACADEMIC',
  })
  @IsOptional()
  @IsEnum(EVENT_CATEGORY)
  eventCategory?: EventCategory;

  @ApiPropertyOptional({
    enum: SCALE,
    example: 'SCHOOL',
  })
  @IsOptional()
  @IsEnum(SCALE)
  scale?: Scale;

  @ApiPropertyOptional({
    example: 'CNTT',
  })
  @IsOptional()
  @IsString()
  faculty?: string;

  @ApiPropertyOptional({
    example: 'Đoàn trường',
  })
  @IsOptional()
  @IsString()
  organizer?: string;

  @ApiPropertyOptional({
    example: 'admin@school.edu.vn',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({
    example: '0901234567',
  })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({
    example: 200,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxParticipants?: number;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/banner.jpg',
  })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({
    example: ['nestjs', 'backend'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
