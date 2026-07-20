import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class DataCenterDto {
  @ApiProperty({ description: '数据中心编码', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '数据中心名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '数据库类型', required: false })
  @IsOptional()
  @IsString()
  dbType?: string;

  @ApiProperty({ description: '数据库主机', required: false })
  @IsOptional()
  @IsString()
  dbHost?: string;

  @ApiProperty({ description: '数据库端口', required: false })
  @IsOptional()
  @IsNumber()
  dbPort?: number;

  @ApiProperty({ description: '数据库名称', required: false })
  @IsOptional()
  @IsString()
  dbName?: string;

  @ApiProperty({ description: '数据库用户名', required: false })
  @IsOptional()
  @IsString()
  dbUser?: string;

  @ApiProperty({ description: '数据库密码', required: false })
  @IsOptional()
  @IsString()
  dbPassword?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '备份路径', required: false })
  @IsOptional()
  @IsString()
  backupPath?: string;

  @ApiProperty({ description: '字符集', required: false })
  @IsOptional()
  @IsString()
  charset?: string;

  @ApiProperty({ description: '连接池大小', required: false })
  @IsOptional()
  @IsNumber()
  poolSize?: number;

  @ApiProperty({ description: '超时时间', required: false })
  @IsOptional()
  @IsNumber()
  timeout?: number;

  @ApiProperty({ description: 'SSL启用', required: false })
  @IsOptional()
  @IsNumber()
  sslEnabled?: boolean;

  @ApiProperty({ description: 'SSL证书路径', required: false })
  @IsOptional()
  @IsString()
  sslCertPath?: string;

  @ApiProperty({ description: '读写分离', required: false })
  @IsOptional()
  @IsNumber()
  readWriteSeparate?: boolean;

  @ApiProperty({ description: '主库地址', required: false })
  @IsOptional()
  @IsString()
  masterHost?: string;

  @ApiProperty({ description: '从库地址', required: false })
  @IsOptional()
  @IsString()
  slaveHosts?: string;
}

export class CreateDataCenterDto extends DataCenterDto {
  @ApiProperty({ description: '数据中心编码', required: true })
  @IsString()
  code: string;

  @ApiProperty({ description: '数据中心名称', required: true })
  @IsString()
  name: string;

  @ApiProperty({ description: '数据库类型', required: true })
  @IsString()
  dbType: string;

  @ApiProperty({ description: '数据库主机', required: true })
  @IsString()
  dbHost: string;

  @ApiProperty({ description: '数据库端口', required: true })
  @IsNumber()
  dbPort: number;

  @ApiProperty({ description: '数据库名称', required: true })
  @IsString()
  dbName: string;

  @ApiProperty({ description: '数据库用户名', required: true })
  @IsString()
  dbUser: string;

  @ApiProperty({ description: '数据库密码', required: true })
  @IsString()
  dbPassword: string;
}

export class UpdateDataCenterDto extends DataCenterDto {}