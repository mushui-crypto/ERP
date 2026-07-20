import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { SysMessage } from '../../database/entities/sys-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SysMessage])],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}