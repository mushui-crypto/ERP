import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiConversationService } from './ai-conversation.service';
import { AiConversationController } from './ai-conversation.controller';
import { AiConversation } from '../../database/entities/ai-conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiConversation])],
  providers: [AiConversationService],
  controllers: [AiConversationController],
  exports: [AiConversationService],
})
export class AiConversationModule {}
