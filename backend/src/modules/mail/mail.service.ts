import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'test@gmail.com',
        pass: process.env.SMTP_PASS || 'password',
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const mailOptions = {
      from: `"Event Manager" <${process.env.SMTP_USER || 'no-reply@event.com'}>`,
      to: to,
      subject: 'Yêu cầu đặt lại mật khẩu',
      html: `
        <h3>Xin chào!</h3>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình trên hệ thống Quản lý Ngày Rèn Luyện.</p>
        <p>Vui lòng click vào đường dẫn bên dưới để đặt lại mật khẩu (link có hiệu lực trong 1 giờ):</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending password reset email', error);
      throw error;
    }
  }

  async sendEventRegistrationNotification(to: string, eventTitle: string, qrCode: string) {
    const mailOptions = {
      from: `"Event Manager" <${process.env.SMTP_USER || 'no-reply@event.com'}>`,
      to: to,
      subject: `Đăng ký thành công sự kiện: ${eventTitle}`,
      html: `
        <h3>Chúc mừng!</h3>
        <p>Bạn đã đăng ký thành công sự kiện <strong>${eventTitle}</strong>.</p>
        <p>Dưới đây là mã QR điểm danh của bạn, vui lòng lưu lại để sử dụng khi tham gia sự kiện:</p>
        <div style="text-align: center; margin: 20px 0;">
          <img src="${qrCode}" alt="QR Code Điểm Danh" style="max-width: 200px;" />
        </div>
        <p>Vui lòng đăng nhập vào hệ thống nếu bạn cần xem chi tiết sự kiện.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Event registration email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending event registration email', error);
    }
  }
}
