import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { StatisticsService } from './statistics.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('statistics')
@ApiBearerAuth()
@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('overview')
  @ApiOperation({
    summary:
      'Lấy tổng quan thống kê hệ thống (Events, Students, Registrations)',
  })
  async getOverview() {
    return this.statisticsService.getOverview();
  }

  @Get('events-by-category-month')
  @ApiOperation({ summary: 'Thống kê số lượng sự kiện theo tháng và thể loại' })
  async getEventsCountByCategoryAndMonth() {
    return this.statisticsService.getEventsCountByCategoryAndMonth();
  }

  @Get('registrations-by-category')
  @ApiOperation({
    summary: 'Thống kê số lượng người đăng ký theo thể loại sự kiện',
  })
  async getRegistrationsCountByCategory() {
    return this.statisticsService.getRegistrationsCountByCategory();
  }

  @Get('events/:eventId')
  @ApiOperation({ summary: 'Lấy thống kê chi tiết của một sự kiện' })
  async getEventStats(@Param('eventId') eventId: string) {
    return this.statisticsService.getEventStats(+eventId);
  }

  @Get('students/top')
  @ApiOperation({
    summary: 'Lấy danh sách top sinh viên tham gia nhiều sự kiện nhất',
  })
  async getTopStudents() {
    return this.statisticsService.getTopStudents();
  }
}
