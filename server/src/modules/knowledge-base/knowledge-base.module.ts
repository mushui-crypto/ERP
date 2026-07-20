import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { AiKnowledgeBase } from '../../database/entities/ai-knowledge-base.entity';
import { AiKnowledgeDocument } from '../../database/entities/ai-knowledge-document.entity';
import { AiKnowledgeChunk } from '../../database/entities/ai-knowledge-chunk.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiKnowledgeBase, AiKnowledgeDocument, AiKnowledgeChunk])],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}