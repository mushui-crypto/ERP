import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator';

export class MenuDto {
  @ApiProperty({ description: '父级菜单ID', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: '菜单名称', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ description: '菜单图标', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @ApiProperty({ description: '菜单类型: 1-目录 2-菜单 3-按钮', required: false })
  @IsOptional()
  @IsNumber()
  menuType?: number;

  @ApiProperty({ description: '路由路径', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;

  @ApiProperty({ description: '组件路径', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  component?: string;

  @ApiProperty({ description: '权限标识', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  permission?: string;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: '是否可见', required: false })
  @IsOptional()
  @IsNumber()
  isVisible?: number;

  @ApiProperty({ description: '是否缓存', required: false })
  @IsOptional()
  @IsNumber()
  isCache?: number;

  @ApiProperty({ description: '状态: 1-启用 0-禁用', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}

export class CreateMenuDto extends MenuDto {
  @ApiProperty({ description: '菜单名称', required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}

export class UpdateMenuDto extends MenuDto {}