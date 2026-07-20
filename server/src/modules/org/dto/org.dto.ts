import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator';

export class OrgDto {
  @ApiProperty({ description: '组织名称', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: '组织编码', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code?: string;

  @ApiProperty({ description: '父级ID', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: '组织类型: 1-集团 2-公司 3-工厂 4-车间 5-班组', required: false })
  @IsOptional()
  @IsNumber()
  orgType?: number;

  @ApiProperty({ description: '全称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @ApiProperty({ description: '简称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shortName?: string;

  @ApiProperty({ description: '联系人', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contact?: string;

  @ApiProperty({ description: '联系电话', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ description: '地址', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty({ description: '状态: 1-启用 0-禁用', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateOrgDto extends OrgDto {
  @ApiProperty({ description: '组织名称', required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '组织编码', required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code: string;
}

export class UpdateOrgDto extends OrgDto {}