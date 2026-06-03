import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EVENT_CATEGORY } from '../../../constants/event.constants';
import type { EventCategory } from '../../../constants/event.constants';
export class CalendarQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsEnum(EVENT_CATEGORY)
  category?: EventCategory;
}
