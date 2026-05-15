/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Query } from '@nestjs/common';
import { CalendarQueryDto } from './dto/calendar-query.dto';

interface AuthRequest extends Request {
  user: {
    id: number;
  };
}

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('faculty') faculty?: string,
  ) {
    return this.eventsService.findAll(+page, +limit, status, category, faculty);
  }
  @Get('calendar')
  getCalendar(@Query() query: CalendarQueryDto) {
    return this.eventsService.getCalendarEvents(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: CreateEventDto, @Request() req: AuthRequest) {
    const eventData = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      registrationDeadline: body.registrationDeadline
        ? new Date(body.registrationDeadline)
        : undefined,
    };
    return this.eventsService.create({
      ...eventData,
      createdBy: req.user.id,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateEventDto) {
    return this.eventsService.update(+id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

  // Import Excel
  @Post(':id/import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return cb(new BadRequestException('Chỉ cho phép file Excel'), false);
        }
        cb(null, true);
      },
    }),
  )
  async importParticipants(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const fileName = file.originalname;
    return await this.eventsService.importParticipants(
      +id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      file.buffer,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.user.id,
      fileName,
    );
  }

  // Xem danh sách đăng ký của event
  @Get(':id/registrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  async getRegistrations(@Param('id') id: string) {
    return await this.eventsService.getRegistrations(+id);
  }

  // Lấy lịch sử import
  @Get(':id/import-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getImportHistory(@Param('id') id: string) {
    return await this.eventsService.getImportHistory(+id);
  }

  // Export Excel
  @Get(':id/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER')
  async exportParticipants(@Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.eventsService.exportParticipants(+id);
  }
}
