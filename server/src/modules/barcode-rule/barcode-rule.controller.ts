import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BarcodeRuleService } from './barcode-rule.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('条码管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('barcode-rules')
export class BarcodeRuleController {
  constructor(private readonly barcodeRuleService: BarcodeRuleService) {}

  @Get('statistics')
  @ApiOperation({ summary: '获取条码统计' })
  async getBarcodeStatistics() {
    return this.barcodeRuleService.getBarcodeStatistics();
  }

  @Get()
  @ApiOperation({ summary: '获取条码规则列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('ruleType') ruleType?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    const type = ruleType !== undefined ? Number(ruleType) : undefined;
    return this.barcodeRuleService.findAll(pageNum, pageSizeNum, type);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取条码规则详情' })
  async findOne(@Param('id') id: string) {
    return this.barcodeRuleService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建条码规则' })
  async create(@Body() data: any) {
    return this.barcodeRuleService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新条码规则' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.barcodeRuleService.update(id, data);
  }

  @Put(':id/enable')
  @ApiOperation({ summary: '启用条码规则' })
  async enable(@Param('id') id: string) {
    return this.barcodeRuleService.enable(id);
  }

  @Put(':id/disable')
  @ApiOperation({ summary: '禁用条码规则' })
  async disable(@Param('id') id: string) {
    return this.barcodeRuleService.disable(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除条码规则' })
  async remove(@Param('id') id: string) {
    await this.barcodeRuleService.remove(id);
    return null;
  }

  @Post('generate')
  @ApiOperation({ summary: '生成条码' })
  async generateBarcode(
    @Body('ruleCode') ruleCode: string,
    @Body('targetType') targetType: string,
    @Body('targetId') targetId?: string,
    @Body('targetCode') targetCode?: string,
    @Body('targetName') targetName?: string,
    @Body('batchNo') batchNo?: string,
    @Body('expiryDate') expiryDate?: Date,
  ) {
    const barcode = await this.barcodeRuleService.generateBarcode(
      ruleCode,
      targetType,
      targetId,
      targetCode,
      targetName,
      batchNo,
      expiryDate,
    );
    return { barcode };
  }

  @Post('generate-batch')
  @ApiOperation({ summary: '批量生成条码' })
  async generateBatchBarcodes(
    @Body('ruleCode') ruleCode: string,
    @Body('count') count: number,
    @Body('targetType') targetType: string,
    @Body('targetId') targetId?: string,
    @Body('targetCode') targetCode?: string,
    @Body('targetName') targetName?: string,
  ) {
    const barcodes = await this.barcodeRuleService.generateBatchBarcodes(
      ruleCode,
      count,
      targetType,
      targetId,
      targetCode,
      targetName,
    );
    return { barcodes };
  }

  @Post('scan')
  @ApiOperation({ summary: '扫描条码' })
  async scanBarcode(@Body('barcode') barcode: string) {
    return this.barcodeRuleService.scanBarcode(barcode);
  }

  @Post('verify')
  @ApiOperation({ summary: '验证条码' })
  async verifyBarcode(@Body('barcode') barcode: string) {
    return this.barcodeRuleService.verifyBarcode(barcode);
  }

  @Get('barcodes')
  @ApiOperation({ summary: '获取条码列表' })
  async findBarcodes(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('ruleCode') ruleCode?: string,
    @Query('targetType') targetType?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    const stat = status !== undefined ? Number(status) : undefined;
    return this.barcodeRuleService.findBarcodes(pageNum, pageSizeNum, ruleCode, targetType, stat);
  }
}