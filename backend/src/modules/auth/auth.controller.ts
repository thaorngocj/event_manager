import {
  Controller,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Sai email hoặc mật khẩu' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  // Thêm endpoint refresh token mới
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Làm mới access token bằng refresh token' })
  @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } })
  @ApiResponse({ status: 200, description: 'Làm mới token thành công' })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }
    return await this.authService.refreshToken(refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', example: 'admin@school.edu.vn' }, clientUrl: { type: 'string' } }, required: ['email'] } })
  @ApiResponse({ status: 200, description: 'Gửi email thành công' })
  async forgotPassword(
    @Body('email') email: string,
    @Body('clientUrl') clientUrl?: string
  ) {
    if (!email) throw new UnauthorizedException('Email required');
    return await this.authService.forgotPassword(email, clientUrl);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đặt lại mật khẩu với token' })
  @ApiBody({ schema: { type: 'object', properties: { token: { type: 'string' }, newPassword: { type: 'string' } }, required: ['token', 'newPassword'] } })
  @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công' })
  @ApiResponse({
    status: 400,
    description: 'Token không hợp lệ hoặc đã hết hạn',
  })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!token || !newPassword) {
      throw new UnauthorizedException('Token and newPassword required');
    }
    return await this.authService.resetPassword(token, newPassword);
  }
}
