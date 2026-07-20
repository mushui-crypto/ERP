import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentProcessController } from './document-process.controller';
import { DocumentProcessService } from './document-process.service';
import { AiDocumentProcess } from '../../database/entities/ai-document-process.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiDocumentProcess])],
  controllers: [DocumentProcessController],
  providers: [DocumentProcessService],
})
export class DocumentProcessModule {}