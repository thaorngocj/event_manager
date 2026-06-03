import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.colorize(),
            winston.format.printf((info) => {
              const timestamp = String(info.timestamp);
              const level = String(info.level);
              const message = String(info.message);
              const context =
                typeof info.context === 'string' ? `[${info.context}]` : '';

              return `[${timestamp}] [${level}] ${context} ${message}`;
            }),
          ),
        }),

        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),

        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
