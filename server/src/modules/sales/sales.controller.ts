import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesOrderService } from '../sales-order/sales-order.service';
import { SalesQuoteService } from '../sales-quote/sales-quote.service';

@ApiTags('销售管理')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(
    private salesOrderService: SalesOrderService,
    private salesQuoteService: SalesQuoteService,
  ) {}

  @Get('statistics')
  @ApiOperation({ summary: '销售综合统计' })
  async getStatistics(@Query('period') period?: string) {
    const orderStats = await this.salesOrderService.getStatistics(period);
    const quoteStats = await this.getQuoteStatistics(period);

    return {
      order: orderStats,
      quote: quoteStats,
    };
  }

  private async getQuoteStatistics(period?: string): Promise<any> {
    const query = this.salesQuoteService['salesQuoteRepository'].createQueryBuilder('sq')
      .where('sq.isDeleted = 0');

    if (period === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.andWhere('sq.quoteDate >= :startOfMonth', { startOfMonth });
    } else if (period === 'quarter') {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      query.andWhere('sq.quoteDate >= :startOfQuarter', { startOfQuarter });
    }

    const total = await query.getCount();
    
    const byStatus = await query
      .select('sq.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sq.status')
      .getRawMany();

    const totalAmount = await query
      .select('SUM(sq.totalAmount)', 'total')
      .getRawOne();

    return {
      totalQuotes: total,
      totalAmount: Number(totalAmount.total) || 0,
      byStatus: byStatus.map(item => ({
        status: Number(item.status),
        count: Number(item.count),
      })),
    };
  }
}