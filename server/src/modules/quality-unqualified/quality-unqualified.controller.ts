import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { QualityUnqualifiedService } from './quality-unqualified.service';

@Controller('quality-unqualified')
export class QualityUnqualifiedController {
  constructor(private qualityUnqualifiedService: QualityUnqualifiedService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('unqualifiedNo') unqualifiedNo?: string,
    @Query('materialCode') materialCode?: string,
    @Query('status') status?: number,
  ) {
    return this.qualityUnqualifiedService.findAll(+page, +pageSize, unqualifiedNo, materialCode, status);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.qualityUnqualifiedService.findById(id);
  }

  @Get('inspection/:inspectionId')
  async findByInspectionId(@Param('inspectionId') inspectionId: string) {
    return this.qualityUnqualifiedService.findByInspectionId(inspectionId);
  }

  @Get('statistics')
  async getStatistics(@Query('period') period?: string) {
    return this.qualityUnqualifiedService.getStatistics(period);
  }

  @Post()
  async create(@Body() data: any) {
    return this.qualityUnqualifiedService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.qualityUnqualifiedService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.qualityUnqualifiedService.remove(id);
  }

  @Post(':id/dispose')
  async dispose(
    @Param('id') id: string,
    @Body('disposalMethod') disposalMethod: number,
    @Body('disposalQty') disposalQty: number,
    @Body('disposalPerson') disposalPerson: string,
  ) {
    return this.qualityUnqualifiedService.dispose(id, disposalMethod, disposalQty, disposalPerson);
  }

  @Post(':id/complete')
  async complete(
    @Param('id') id: string,
    @Body('correctiveAction') correctiveAction?: string,
    @Body('preventiveAction') preventiveAction?: string,
  ) {
    return this.qualityUnqualifiedService.complete(id, correctiveAction, preventiveAction);
  }

  @Post(':id/close')
  async close(@Param('id') id: string) {
    return this.qualityUnqualifiedService.close(id);
  }
}