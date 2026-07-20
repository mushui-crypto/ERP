import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator';

export class RoleDto {
  @ApiProperty({ description: '角色编码', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code?: string;

  @ApiProperty({ description: '角色名称', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: '数据范围: 1-全部 2-本组织 3-本部门 4-本人', required: false })
  @IsOptional()
  @IsNumber()
  dataScope?: number;

  @ApiProperty({ description: '功能权限JSON', required: false })
  @IsOptional()
  @IsString()
  permissions?: string;

  @ApiProperty({ description: '状态: 1-启用 0-禁用', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateRoleDto extends RoleDto {
  @ApiProperty({ description: '角色编码', required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: '角色名称', required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

export class UpdateRoleDto extends RoleDto {}