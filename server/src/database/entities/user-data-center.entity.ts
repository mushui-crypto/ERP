import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('sys_user_data_center')
export class UserDataCenter {
  @PrimaryColumn({ name: 'user_id', length: 36, comment: '用户ID' })
  userId: string;

  @PrimaryColumn({ name: 'data_center_id', length: 36, comment: '数据中心ID' })
  dataCenterId: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'GETDATE()', comment: '创建时间' })
  createdAt: Date;
}