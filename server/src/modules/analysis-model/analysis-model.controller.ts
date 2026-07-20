import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { AnalysisModelService } from './analysis-model.service';
import { AiAnalysisModel } from '../../database/entities/ai-analysis-model.entity';

@Controller('analysis-model')
export class AnalysisModelController {
  constructor(private analysisModelService: AnalysisModelService) {}

  @Get('statistics')
  async getStatistics() {
    return this.analysisModelService.getStatistics();
  }

  @Get()
  async findModels(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('modelType') modelType?: string,
    @Query('trainStatus') trainStatus?: string,
  ) {
    return this.analysisModelService.findModels(page, pageSize, modelType, trainStatus);
  }

  @Get(':id')
  async findModelById(@Param('id') id: string) {
    return this.analysisModelService.findModelById(id);
  }

  @Post()
  async createModel(@Body() data: Partial<AiAnalysisModel>) {
    return this.analysisModelService.createModel(data);
  }

  @Put(':id')
  async updateModel(@Param('id') id: string, @Body() data: Partial<AiAnalysisModel>) {
    return this.analysisModelService.updateModel(id, data);
  }

  @Delete(':id')
  async deleteModel(@Param('id') id: string) {
    return this.analysisModelService.deleteModel(id);
  }

  @Post(':id/train')
  async startTraining(@Param('id') id: string) {
    return this.analysisModelService.startTraining(id);
  }

  @Put(':id/train/progress')
  async updateTrainingProgress(
    @Param('id') id: string,
    @Body('progress') progress: number,
    @Body('epoch') epoch: number,
  ) {
    return this.analysisModelService.updateTrainingProgress(id, progress, epoch);
  }

  @Put(':id/train/complete')
  async completeTraining(
    @Param('id') id: string,
    @Body() metrics: { accuracy?: number, recall?: number, f1Score?: number, trainLoss?: number, valLoss?: number },
  ) {
    return this.analysisModelService.completeTraining(id, metrics);
  }

  @Post(':id/deploy')
  async deployModel(@Param('id') id: string) {
    return this.analysisModelService.deployModel(id);
  }
}
