import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAnalysisModel } from '../../database/entities/ai-analysis-model.entity';

@Injectable()
export class AnalysisModelService {
  constructor(
    @InjectRepository(AiAnalysisModel)
    private modelRepository: Repository<AiAnalysisModel>,
  ) {}

  async generateModelCode(): Promise<string> {
    const now = new Date();
    const prefix = 'AM';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.modelRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createModel(data: Partial<AiAnalysisModel>): Promise<AiAnalysisModel> {
    const modelCode = await this.generateModelCode();
    
    const existing = await this.modelRepository.findOne({
      where: { modelCode, isDeleted: 0 },
    });
    if (existing) {
      throw new BadRequestException('模型编码已存在');
    }

    const model = this.modelRepository.create({
      ...data,
      modelCode,
      trainStatus: 'pending',
      trainProgress: 0,
      isEnabled: 1,
      callCount: 0,
    });
    return this.modelRepository.save(model);
  }

  async updateModel(id: string, data: Partial<AiAnalysisModel>): Promise<AiAnalysisModel> {
    const model = await this.modelRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!model) throw new NotFoundException('模型不存在');
    Object.assign(model, data);
    return this.modelRepository.save(model);
  }

  async deleteModel(id: string): Promise<void> {
    const model = await this.modelRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!model) throw new NotFoundException('模型不存在');
    model.isDeleted = 1;
    await this.modelRepository.save(model);
  }

  async findModels(page = 1, pageSize = 20, modelType?: string, trainStatus?: string): Promise<any> {
    const query = this.modelRepository.createQueryBuilder('model')
      .where('model.is_deleted = 0');

    if (modelType) {
      query.andWhere('model.modelType = :modelType', { modelType });
    }

    if (trainStatus) {
      query.andWhere('model.trainStatus = :trainStatus', { trainStatus });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('model.created_at', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findModelById(id: string): Promise<AiAnalysisModel | null> {
    return this.modelRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async getStatistics(): Promise<any> {
    const total = await this.modelRepository.count({ where: { isDeleted: 0 } });
    const training = await this.modelRepository.count({ where: { isDeleted: 0, trainStatus: 'training' } });
    const completed = await this.modelRepository.count({ where: { isDeleted: 0, trainStatus: 'completed' } });
    const pending = await this.modelRepository.count({ where: { isDeleted: 0, trainStatus: 'pending' } });
    const failed = await this.modelRepository.count({ where: { isDeleted: 0, trainStatus: 'failed' } });

    return {
      total,
      training,
      completed,
      pending,
      failed,
    };
  }

  async startTraining(id: string): Promise<AiAnalysisModel> {
    const model = await this.modelRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!model) throw new NotFoundException('模型不存在');
    
    model.trainStatus = 'training';
    model.trainProgress = 0;
    model.trainEpochs = 0;
    
    return this.modelRepository.save(model);
  }

  async completeTraining(id: string, metrics: { accuracy?: number, recall?: number, f1Score?: number, trainLoss?: number, valLoss?: number }): Promise<AiAnalysisModel> {
    const model = await this.modelRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!model) throw new NotFoundException('模型不存在');
    
    model.trainStatus = 'completed';
    model.trainProgress = 100;
    model.trainEpochs = model.totalEpochs;
    
    if (metrics.accuracy !== undefined) model.accuracy = metrics.accuracy;
    if (metrics.recall !== undefined) model.recall = metrics.recall;
    if (metrics.f1Score !== undefined) model.f1Score = metrics.f1Score;
    if (metrics.trainLoss !== undefined) model.trainLoss = metrics.trainLoss;
    if (metrics.valLoss !== undefined) model.valLoss = metrics.valLoss;
    
    return this.modelRepository.save(model);
  }

  async updateTrainingProgress(id: string, progress: number, epoch: number): Promise<AiAnalysisModel> {
    const model = await this.modelRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!model) throw new NotFoundException('模型不存在');
    
    model.trainProgress = progress;
    model.trainEpochs = epoch;
    
    return this.modelRepository.save(model);
  }

  async deployModel(id: string): Promise<AiAnalysisModel> {
    const model = await this.modelRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!model) throw new NotFoundException('模型不存在');
    
    if (model.trainStatus !== 'completed') {
      throw new BadRequestException('只有已完成训练的模型才能部署');
    }
    
    model.deployPath = `/api/v1/model/${model.modelCode.toLowerCase()}`;
    model.isEnabled = 1;
    
    return this.modelRepository.save(model);
  }
}
