import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseAcceptanceEntry } from '../../database/entities/expense-acceptance-entry.entity';
import { ExpenseAcceptance } from '../../database/entities/expense-acceptance.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { PurchaseReceiveNotice } from '../../database/entities/purchase-receive-notice.entity';
import { PayableModule } from '../payable/payable.module';
import { ExpenseAcceptanceController } from './expense-acceptance.controller';
import { ExpenseAcceptanceService } from './expense-acceptance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpenseAcceptance,
      ExpenseAcceptanceEntry,
      PurchaseReceiveNotice,
      PurchaseReceiveNoticeEntry,
      PurchaseOrder,
    ]),
    PayableModule,
  ],
  controllers: [ExpenseAcceptanceController],
  providers: [ExpenseAcceptanceService],
  exports: [ExpenseAcceptanceService],
})
export class ExpenseAcceptanceModule {}
