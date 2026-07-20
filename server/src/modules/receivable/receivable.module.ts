import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivableService } from './receivable.service';
import { ReceivableController } from './receivable.controller';
import { Receivable } from '../../database/entities/receivable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Receivable])],
  providers: [ReceivableService],
  controllers: [ReceivableController],
  exports: [ReceivableService],
})
export class ReceivableModule {}
