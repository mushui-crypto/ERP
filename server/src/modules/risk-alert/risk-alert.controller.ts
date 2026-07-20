import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiskAlertService } from './risk-alert.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('风险预警')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('risk-alerts')
export class RiskAlertController {
  constructor(private readonly riskAlertService: RiskAlertService) {}

  @Get()
  @ApiOperation({ summary: '获取风险预警列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('alertType') alertType?: string,
    @Query('alertLevel') alertLevel?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    const type = alertType !== undefined ? Number(alertType) : undefined;
    const level = alertLevel !== undefined ? Number(alertLevel) : undefined;
    const stat = status !== undefined ? Number(status) : undefined;
    return this.riskAlertService.findAll(pageNum, pageSizeNum, type, level, stat);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取风险预警统计' })
  async getStatistics() {
    return this.riskAlertService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取风险预警详情' })
  async findOne(@Param('id') id: string) {
    return this.riskAlertService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建风险预警' })
  async create(@Body() data: any) {
    return this.riskAlertService.create(data);
  }

  @Post('detect')
  @ApiOperation({ summary: '检测所有风险' })
  async detectAllRisks() {
    return this.riskAlertService.detectAllRisks();
  }

  @Put(':id')
  @ApiOperation({ summary: '更新风险预警' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.riskAlertService.update(id, data);
  }

  @Put(':id/handle')
  @ApiOperation({ summary: '处理风险预警' })
  async handleAlert(@Param('id') id: string, @Body() body: { handledBy: string; remark?: string }) {
    return this.riskAlertService.handleAlert(id, body.handledBy, body.remark);
  }

  @Put(':id/ignore')
  @ApiOperation({ summary: '忽略风险预警' })
  async ignoreAlert(@Param('id') id: string, @Body() body: { handledBy: string; remark?: string }) {
    return this.riskAlertService.ignoreAlert(id, body.handledBy, body.remark);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除风险预警' })
  async remove(@Param('id') id: string) {
    await this.riskAlertService.remove(id);
    return null;
  }
}