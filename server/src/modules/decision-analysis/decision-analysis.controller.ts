import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DecisionAnalysisService } from './decision-analysis.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('决策分析')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('decision-analysis')
export class DecisionAnalysisController {
  constructor(private readonly decisionAnalysisService: DecisionAnalysisService) {}

  @Get('dashboards')
  @ApiOperation({ summary: '获取仪表盘列表' })
  async findDashboards(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.decisionAnalysisService.findDashboards(pageNum, pageSizeNum, category);
  }

  @Get('dashboards/:id')
  @ApiOperation({ summary: '获取仪表盘详情' })
  async findDashboardById(@Param('id') id: string) {
    return this.decisionAnalysisService.findDashboardById(id);
  }

  @Get('dashboards/:id/with-widgets')
  @ApiOperation({ summary: '获取仪表盘及组件' })
  async getDashboardWithWidgets(@Param('id') id: string) {
    return this.decisionAnalysisService.getDashboardWithWidgets(id);
  }

  @Post('dashboards')
  @ApiOperation({ summary: '创建仪表盘' })
  async createDashboard(@Body() data: any) {
    return this.decisionAnalysisService.createDashboard(data);
  }

  @Put('dashboards/:id')
  @ApiOperation({ summary: '更新仪表盘' })
  async updateDashboard(@Param('id') id: string, @Body() data: any) {
    return this.decisionAnalysisService.updateDashboard(id, data);
  }

  @Delete('dashboards/:id')
  @ApiOperation({ summary: '删除仪表盘' })
  async deleteDashboard(@Param('id') id: string) {
    await this.decisionAnalysisService.deleteDashboard(id);
    return null;
  }

  @Get('widgets')
  @ApiOperation({ summary: '获取组件列表' })
  async findWidgets(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('widgetType') widgetType?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.decisionAnalysisService.findWidgets(pageNum, pageSizeNum, widgetType);
  }

  @Get('widgets/:id')
  @ApiOperation({ summary: '获取组件详情' })
  async findWidgetById(@Param('id') id: string) {
    return this.decisionAnalysisService.findWidgetById(id);
  }

  @Get('widgets/:id/data')
  @ApiOperation({ summary: '获取组件数据' })
  async getWidgetData(@Param('id') id: string, @Query() params?: any) {
    return this.decisionAnalysisService.getWidgetData(id, params);
  }

  @Post('widgets')
  @ApiOperation({ summary: '创建组件' })
  async createWidget(@Body() data: any) {
    return this.decisionAnalysisService.createWidget(data);
  }

  @Put('widgets/:id')
  @ApiOperation({ summary: '更新组件' })
  async updateWidget(@Param('id') id: string, @Body() data: any) {
    return this.decisionAnalysisService.updateWidget(id, data);
  }

  @Delete('widgets/:id')
  @ApiOperation({ summary: '删除组件' })
  async deleteWidget(@Param('id') id: string) {
    await this.decisionAnalysisService.deleteWidget(id);
    return null;
  }

  @Get('analysis/production')
  @ApiOperation({ summary: '生产分析报告' })
  async getProductionAnalysis(@Query() params?: any) {
    return this.decisionAnalysisService.getProductionAnalysis(params);
  }

  @Get('analysis/quality')
  @ApiOperation({ summary: '质量分析报告' })
  async getQualityAnalysis(@Query() params?: any) {
    return this.decisionAnalysisService.getQualityAnalysis(params);
  }

  @Get('analysis/inventory')
  @ApiOperation({ summary: '库存分析报告' })
  async getInventoryAnalysis(@Query() params?: any) {
    return this.decisionAnalysisService.getInventoryAnalysis(params);
  }

  @Get('analysis/finance')
  @ApiOperation({ summary: '财务分析报告' })
  async getFinanceAnalysis(@Query() params?: any) {
    return this.decisionAnalysisService.getFinanceAnalysis(params);
  }

  @Get('analysis/sales')
  @ApiOperation({ summary: '销售分析报告' })
  async getSalesAnalysis(@Query() params?: any) {
    return this.decisionAnalysisService.getSalesAnalysis(params);
  }
}