import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email not found');
    if (user.isActive === false) throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');

    const valid = await this.usersService.validatePassword(user, password);
    if (!valid) throw new UnauthorizedException('Invalid password');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken, role: user.role, email: user.email };
  }

  // Thêm method refresh token mới
  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<{
        sub: number;
        email: string;
        role: string;
      }>(token);

      const user = await this.usersService.findById(payload.sub);
      
      if (user.isActive === false) throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '1h',
      });

      const refreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return {
        message:
          'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour

    await this.usersService.setResetToken(user.id, token, expires);
    await this.mailService.sendPasswordResetEmail(user.email, token);

    return {
      message:
        'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);

    if (
      !user ||
      !user.resetPasswordExpires ||
      new Date() > user.resetPasswordExpires
    ) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePasswordAndClearToken(user.id, hashed);

    return { message: 'Đặt lại mật khẩu thành công' };
  }
}
