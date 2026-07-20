import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';

@Controller('ai-analysis')
export class AiAnalysisController {
  constructor(private aiAnalysisService: AiAnalysisService) {}

  @Post('generate/production')
  async generateProductionReport(
    @Body('periodType') periodType: string,
    @Body('periodStart') periodStart: Date,
    @Body('periodEnd') periodEnd: Date,
    @Body('generatedBy') generatedBy: string,
  ) {
    return this.aiAnalysisService.generateProductionReport(periodType, periodStart, periodEnd, generatedBy);
  }

  @Post('generate/quality')
  async generateQualityReport(
    @Body('periodType') periodType: string,
    @Body('periodStart') periodStart: Date,
    @Body('periodEnd') periodEnd: Date,
    @Body('generatedBy') generatedBy: string,
  ) {
    return this.aiAnalysisService.generateQualityReport(periodType, periodStart, periodEnd, generatedBy);
  }

  @Post('generate/cost')
  async generateCostReport(
    @Body('periodType') periodType: string,
    @Body('periodStart') periodStart: Date,
    @Body('periodEnd') periodEnd: Date,
    @Body('generatedBy') generatedBy: string,
  ) {
    return this.aiAnalysisService.generateCostReport(periodType, periodStart, periodEnd, generatedBy);
  }

  @Post('generate/inventory')
  async generateInventoryReport(
    @Body('periodType') periodType: string,
    @Body('periodStart') periodStart: Date,
    @Body('periodEnd') periodEnd: Date,
    @Body('generatedBy') generatedBy: string,
  ) {
    return this.aiAnalysisService.generateInventoryReport(periodType, periodStart, periodEnd, generatedBy);
  }

  @Post('generate/finance')
  async generateFinanceReport(
    @Body('periodType') periodType: string,
    @Body('periodStart') periodStart: Date,
    @Body('periodEnd') periodEnd: Date,
    @Body('generatedBy') generatedBy: string,
  ) {
    return this.aiAnalysisService.generateFinanceReport(periodType, periodStart, periodEnd, generatedBy);
  }

  @Post('generate/hr')
  async generateHRReport(
    @Body('periodType') periodType: string,
    @Body('periodStart') periodStart: Date,
    @Body('periodEnd') periodEnd: Date,
    @Body('generatedBy') generatedBy: string,
  ) {
    return this.aiAnalysisService.generateHRReport(periodType, periodStart, periodEnd, generatedBy);
  }

  @Get()
  async findReports(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('reportType') reportType?: string,
    @Query('periodType') periodType?: string,
  ) {
    return this.aiAnalysisService.findReports(page, pageSize, reportType, periodType);
  }

  @Get(':id')
  async findReportById(@Param('id') id: string) {
    return this.aiAnalysisService.findReportById(id);
  }

  @Get(':id/data')
  async getReportData(@Param('id') id: string) {
    return this.aiAnalysisService.getReportData(id);
  }

  @Delete(':id')
  async deleteReport(@Param('id') id: string) {
    return this.aiAnalysisService.deleteReport(id);
  }
}