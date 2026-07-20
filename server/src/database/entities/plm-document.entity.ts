import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('plm_document')
export class PlmDocument extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'doc_code', length: 50, comment: '文档编号' })
  docCode: string;

  @Column({ name: 'doc_name', length: 200, comment: '文档名称' })
  docName: string;

  @Column({ name: 'doc_type', type: 'int', comment: '文档类型: 1-设计图 2-工艺文件 3-技术规范 4-测试报告 5-变更通知' })
  docType: number;

  @Column({ name: 'project_id', length: 36, nullable: true, comment: '项目ID' })
  projectId: string;

  @Column({ name: 'material_id', length: 36, nullable: true, comment: '物料ID' })
  materialId: string;

  @Column({ length: 20, default: '1.0', comment: '版本' })
  version: string;

  @Column({ name: 'file_size', type: 'int', default: 0, comment: '文件大小' })
  fileSize: number;

  @Column({ name: 'file_path', length: 500, nullable: true, comment: '文件路径' })
  filePath: string;

  @Column({ name: 'uploader_id', length: 36, nullable: true, comment: '上传人ID' })
  uploaderId: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-草稿 2-审核中 3-已发布 4-已归档' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
