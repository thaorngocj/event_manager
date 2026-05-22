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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Query } from '@nestjs/common';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';

interface AuthRequest extends Request {
  user: {
    id: number;
  };
}

@ApiTags('events')
@ApiBearerAuth()
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

  @Get('import-template')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Tải file Excel mẫu để import danh sách tham dự' })
  async downloadTemplate(@Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const buffer = await this.eventsService.getImportTemplate();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Import_Participants_Template.xlsx',
    );
    res.send(buffer);
  }

  @Get('import-template-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async downloadEventTemplate(@Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const buffer = await this.eventsService.getEventImportTemplate();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Import_Events_Template.xlsx',
    );
    res.send(buffer);
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

  // Import Events hàng loạt
  @Post('import')
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
  async importEvents(@UploadedFile() file: any, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return await this.eventsService.importEvents(file.buffer, req.user.id, file.originalname);
  }

  // Import Excel
  @Post(':id/import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Import danh sách tham dự từ file Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File Excel (.xlsx hoặc .xls)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
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
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file upload');
    }
    return await this.eventsService.importParticipants(
      +id,
      file.buffer,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.user.id,
      file.originalname,
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
  async exportParticipants(@Param('id') id: string, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const buffer = await this.eventsService.exportParticipants(+id);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Event_${id}_Participants.xlsx`,
    );
    res.send(buffer);
  }
}
