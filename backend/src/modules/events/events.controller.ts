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
  @ApiOperation({
    summary: 'Lấy danh sách tất cả các sự kiện (có phân trang và lọc)',
  })
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
  @ApiOperation({ summary: 'Lấy danh sách sự kiện hiển thị trên lịch' })
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
  @ApiOperation({ summary: 'Tải file Excel mẫu để import danh sách sự kiện' })
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
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một sự kiện' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Tạo sự kiện mới' })
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
  @ApiOperation({ summary: 'Cập nhật thông tin sự kiện' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
    @Request() req: AuthRequest,
  ) {
    return this.eventsService.update(+id, body, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sự kiện' })
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.eventsService.remove(+id, req.user.id);
  }

  // Import Events hàng loạt
  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Import danh sách sự kiện hàng loạt từ file Excel' })
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
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
          return cb(new BadRequestException('Chỉ cho phép file Excel'), false);
        }
        cb(null, true);
      },
    }),
  )
  async importEvents(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthRequest,
  ) {
    return await this.eventsService.importEvents(
      file.buffer,
      req.user.id,
      file.originalname,
    );
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
    @Request() req: AuthRequest,
  ) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file upload');
    }
    return await this.eventsService.importParticipants(
      +id,
      file.buffer,
      req.user.id,
      file.originalname,
    );
  }

  // Xem danh sách đăng ký của event
  @Get(':id/registrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Xem danh sách sinh viên đã đăng ký sự kiện' })
  async getRegistrations(@Param('id') id: string) {
    return await this.eventsService.getRegistrations(+id);
  }

  // Lấy lịch sử import
  @Get(':id/import-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Xem lịch sử import file của sự kiện' })
  async getImportHistory(@Param('id') id: string) {
    return await this.eventsService.getImportHistory(+id);
  }

  // Export Excel
  @Get(':id/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER')
  @ApiOperation({ summary: 'Xuất danh sách sinh viên tham dự ra file Excel' })
  async exportParticipants(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Res() res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const buffer = await this.eventsService.exportParticipants(
      +id,
      req.user.id,
    );
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
