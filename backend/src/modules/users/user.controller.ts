import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import {
  CreateUserDto,
  QueryUsersDto,
  UpdateRoleDto,
  UpdateUserDto,
} from './dto/user.dto';
import { UsersService } from './users.service';
export interface AuthRequest extends Request {
  user: {
    id: number;
    email?: string;
    role?: string;
  };
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // SUPER_ADMIN: tạo user thủ công
  @Post('create')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: '[SUPER_ADMIN] Tạo user mới' })
  @ApiResponse({ status: 201, description: 'User đã được tạo' })
  @ApiResponse({ status: 409, description: 'Email hoặc username đã tồn tại' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  // SUPER_ADMIN / ADMIN: danh sách + tìm kiếm
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary: '[ADMIN+] Danh sách user có phân trang và tìm kiếm',
  })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  // Xem profile của chính mình
  @Get('me')
  @ApiOperation({ summary: 'Xem profile của user đang đăng nhập' })
  getMe(@Request() req: AuthRequest) {
    return this.usersService.findById(req.user.id);
  }

  // SUPER_ADMIN / ADMIN: xem bất kỳ user
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: '[ADMIN+] Xem chi tiết user theo id' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  // User tự cập nhật profile của mình
  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật username/email của chính mình' })
  updateMe(@Request() req: AuthRequest, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(req.user.id, dto);
  }

  // SUPER_ADMIN: cập nhật profile user
  @Patch(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: '[SUPER_ADMIN] Cập nhật thông tin user bất kỳ' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của user cần cập nhật',
  })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  @ApiResponse({ status: 409, description: 'Email hoặc username đã tồn tại' })
  async updateUserByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  // SUPER_ADMIN: đổi role
  @Patch(':id/role')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: '[SUPER_ADMIN] Thay đổi role của user' })
  @ApiParam({ name: 'id', type: Number })
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(id, dto);
  }

  // SUPER_ADMIN: disable / enable user
  @Patch(':id/deactivate')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: '[SUPER_ADMIN] Vô hiệu hoá tài khoản' })
  @ApiParam({ name: 'id', type: Number })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.setActive(id, false);
  }

  @Patch(':id/activate')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: '[SUPER_ADMIN] Kích hoạt lại tài khoản' })
  @ApiParam({ name: 'id', type: Number })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.setActive(id, true);
  }

  // SUPER_ADMIN: xoá vĩnh viễns

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[SUPER_ADMIN] Xoá user vĩnh viễn' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
