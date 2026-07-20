import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiQaController } from './ai-qa.controller';
import { AiQaService } from './ai-qa.service';
import { AiConversation } from '../../database/entities/ai-conversation.entity';
import { AiKnowledgeChunk } from '../../database/entities/ai-knowledge-chunk.entity';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';

@Module({
  imports: [TypeOrmModule.forFeature([AiConversation, AiKnowledgeChunk]), KnowledgeBaseModule],
  controllers: [AiQaController],
  providers: [AiQaService],
})
export class AiQaModule {}