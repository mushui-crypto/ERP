import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_analysis_model')
export class AiAnalysisModel extends BaseEntity {
  @Index({ unique: true })
  @Column({ length: 50, comment: '模型编码' })
  modelCode: string;

  @Column({ length: 200, comment: '模型名称' })
  modelName: string;

  @Column({ length: 50, comment: '模型类型: prediction-预测 classification-分类 clustering-聚类 regression-回归' })
  modelType: string;

  @Column({ type: 'text', nullable: true, comment: '模型描述' })
  description: string;

  @Column({ type: 'text', nullable: true, comment: '训练数据选择(JSON)' })
  trainingData: string;

  @Column({ type: 'text', nullable: true, comment: '参数配置(JSON)' })
  paramsConfig: string;

  @Column({ length: 50, default: 'pending', comment: '训练状态: pending-待训练 training-训练中 completed-已完成 failed-失败' })
  trainStatus: string;

  @Column({ type: 'float', nullable: true, comment: '准确率' })
  accuracy: number;

  @Column({ type: 'float', nullable: true, comment: '召回率' })
  recall: number;

  @Column({ type: 'float', nullable: true, comment: 'F1分数' })
  f1Score: number;

  @Column({ type: 'float', nullable: true, comment: '训练损失' })
  trainLoss: number;

  @Column({ type: 'float', nullable: true, comment: '验证损失' })
  valLoss: number;

  @Column({ type: 'int', nullable: true, comment: '训练轮数' })
  trainEpochs: number;

  @Column({ type: 'int', default: 100, comment: '总训练轮数' })
  totalEpochs: number;

  @Column({ type: 'float', default: 0, comment: '训练进度(0-100)' })
  trainProgress: number;

  @Column({ type: 'int', default: 1, comment: '是否启用: 1-启用 0-禁用' })
  isEnabled: number;

  @Column({ length: 500, nullable: true, comment: '部署路径' })
  deployPath: string;

  @Column({ type: 'int', default: 0, comment: '调用次数' })
  callCount: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}
