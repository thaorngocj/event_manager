import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EventsModule } from './modules/events/events.module';
import { RegistrationsModule } from './modules/registrations/registration.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { UploadModule } from './modules/upload/upload.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { MailModule } from './modules/mail/mail.module';
import { LoggerModule } from './common/logger/logger.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'test',
      extra: {
        options: '-c TimeZone=Asia/Ho_Chi_Minh',
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 phút
        limit: 100, // tối đa 100 request/phút
      },
    ]),
    LoggerModule,
    AuthModule,
    UsersModule,
    EventsModule,
    RegistrationsModule,
    StatisticsModule,
    UploadModule,
    MailModule,
    ActivityLogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
