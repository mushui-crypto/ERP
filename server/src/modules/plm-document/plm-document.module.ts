import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlmDocumentService } from './plm-document.service';
import { PlmDocumentController } from './plm-document.controller';
import { PlmDocument } from '../../database/entities/plm-document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlmDocument])],
  providers: [PlmDocumentService],
  controllers: [PlmDocumentController],
  exports: [PlmDocumentService],
})
export class PlmDocumentModule {}
