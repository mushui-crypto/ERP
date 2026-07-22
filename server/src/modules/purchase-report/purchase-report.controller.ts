import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PurchaseReportQueryDto } from './dto/purchase-report-query.dto';
import { PurchaseReportService } from './purchase-report.service';

@ApiTags('采购执行与统计报表')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-reports')
export class PurchaseReportController {
  constructor(private readonly service: PurchaseReportService) {}

  @Get('order-execution-summary')
  @ApiOperation({ summary: '采购订单执行汇总' })
  orderExecutionSummary(@Query() query: PurchaseReportQueryDto) {
    return this.service.orderExecutionSummary(query);
  }

  @Get('order-execution-detail')
  @ApiOperation({ summary: '采购订单执行明细' })
  orderExecutionDetail(@Query() query: PurchaseReportQueryDto) {
    return this.service.orderExecutionDetail(query);
  }

  @Get('consume-summary')
  @ApiOperation({ summary: '采购消耗与金额汇总' })
  consumeSummary(@Query() query: PurchaseReportQueryDto) {
    return this.service.consumeSummary(query);
  }

  @Get('overview')
  @ApiOperation({ summary: '采购基础分析概览' })
  overview(@Query() query: PurchaseReportQueryDto) {
    return this.service.overview(query);
  }
}
