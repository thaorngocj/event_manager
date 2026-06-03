import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EVENT_MANAGER', 'SUPER_ADMIN')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách hoạt động gần đây' })
  async getRecentActivities(@Query('limit') limit?: number) {
    const take = limit ? Number(limit) : 10;
    return this.activityLogsService.getRecentActivities(take);
  }
}
