import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('registrations')
@ApiBearerAuth()
@Controller('registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  @Post('events/:eventId/register')
  @Roles('STUDENT')
  async register(
    @Request() req: { user: { id: number } },
    @Param('eventId') eventId: string,
  ) {
    return await this.registrationService.register(req.user.id, +eventId);
  }

  @Post('events/:eventId/checkin')
  @Roles('EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  async checkIn(
    @Param('eventId') eventId: string,
    @Body('qrData') qrData: any,
    @Request() req: { user: { id: number } },
  ) {
    const qrDataString =
      typeof qrData === 'string' ? qrData : JSON.stringify(qrData);
    return await this.registrationService.checkIn(
      +eventId,
      qrDataString,
      req.user.id,
    );
  }

  @Get('my-events')
  @Roles('STUDENT')
  async getMyEvents(@Request() req: { user: { id: number } }) {
    return await this.registrationService.getUserRegistrations(req.user.id);
  }

  @Delete(':id/cancel')
  @Roles('STUDENT')
  async cancelRegistration(
    @Param('id') id: string,
    @Request() req: { user: { id: number } },
  ) {
    return await this.registrationService.cancelRegistration(+id, req.user.id);
  }

  @Post('events/:eventId/manual-checkin')
  @Roles('EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  async manualCheckIn(
    @Param('eventId') eventId: string,
    @Body('email') email: string,
    @Request() req: { user: { id: number } },
  ) {
    return this.registrationService.manualCheckIn(+eventId, email, req.user.id);
  }
}
