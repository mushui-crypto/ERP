import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_data_center')
export class DataCenter extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'dc_code', length: 50, comment: '数据中心编码' })
  code: string;

  @Column({ name: 'dc_name', length: 100, comment: '数据中心名称' })
  name: string;

  @Column({ name: 'db_type', length: 20, comment: '数据库类型: mysql/postgres/mssql' })
  dbType: string;

  @Column({ name: 'db_host', length: 200, comment: '数据库主机' })
  dbHost: string;

  @Column({ name: 'db_port', type: 'int', comment: '数据库端口' })
  dbPort: number;

  @Column({ name: 'db_username', length: 100, comment: '数据库用户名' })
  dbUser: string;

  @Column({ name: 'db_password', length: 200, comment: '数据库密码' })
  dbPassword: string;

  @Column({ name: 'db_database', length: 100, comment: '数据库名称' })
  dbName: string;

  @Column({ name: 'charset', length: 50, nullable: true, comment: '字符集' })
  charset?: string;

  @Column({ name: 'max_connections', type: 'int', default: 20, comment: '最大连接数' })
  maxConnections?: number;

  @Column({ name: 'is_readonly', type: 'tinyint', default: 0, comment: '是否只读' })
  isReadonly?: number;

  @Column({ name: 'is_master', type: 'tinyint', default: 0, comment: '是否主库' })
  isMaster?: number;

  @Column({ name: 'last_connect_time', type: 'datetime', nullable: true, comment: '最后连接时间' })
  lastConnectTime?: Date;

  @Column({ name: 'connect_status', type: 'int', default: 0, comment: '连接状态' })
  connectStatus?: number;

  @Column({ name: 'extra_config', type: 'text', nullable: true, comment: '额外配置JSON' })
  extraConfig?: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark?: string;
}