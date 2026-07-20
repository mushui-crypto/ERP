import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'created_by', length: 50, nullable: true, comment: '创建人' })
  createdBy: string;

  @Column({ name: 'updated_by', length: 50, nullable: true, comment: '更新人' })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0, comment: '是否删除' })
  isDeleted: number;
}
