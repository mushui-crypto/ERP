import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseOrderService } from '../purchase-order/purchase-order.service';
import { PurchaseRequestService } from '../purchase-request/purchase-request.service';

@ApiTags('采购管理')
@ApiBearerAuth()
@Controller('purchase')
export class PurchaseController {
  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private purchaseRequestService: PurchaseRequestService,
  ) {}

  @Get('statistics')
  @ApiOperation({ summary: '采购综合统计' })
  async getStatistics(@Query('period') period?: string) {
    const orderStats = await this.purchaseOrderService.getStatistics(period);
    const requestStats = await this.getRequestStatistics(period);

    return {
      order: orderStats,
      request: requestStats,
    };
  }

  private async getRequestStatistics(period?: string): Promise<any> {
    const query = this.purchaseRequestService['purchaseRequestRepository'].createQueryBuilder('pr')
      .where('pr.isDeleted = 0');

    if (period === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.andWhere('pr.requestDate >= :startOfMonth', { startOfMonth });
    } else if (period === 'quarter') {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      query.andWhere('pr.requestDate >= :startOfQuarter', { startOfQuarter });
    }

    const total = await query.getCount();
    
    const byStatus = await query
      .select('pr.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('pr.status')
      .getRawMany();

    const totalAmount = await query
      .select('SUM(pr.estimatedAmount)', 'total')
      .getRawOne();

    return {
      totalRequests: total,
      totalAmount: Number(totalAmount.total) || 0,
      byStatus: byStatus.map(item => ({
        status: Number(item.status),
        count: Number(item.count),
      })),
    };
  }
}