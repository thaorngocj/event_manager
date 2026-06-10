import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Faculty } from '../faculties/faculty.entity';
import { UsersController } from './user.controller';

@Module({
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User, Faculty])],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
