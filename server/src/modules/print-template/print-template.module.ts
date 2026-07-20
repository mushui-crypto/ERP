import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrintTemplateService } from './print-template.service';
import { PrintTemplateController } from './print-template.controller';
import { PrintTemplate } from '../../database/entities/print-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrintTemplate])],
  providers: [PrintTemplateService],
  controllers: [PrintTemplateController],
  exports: [PrintTemplateService],
})
export class PrintTemplateModule {}
