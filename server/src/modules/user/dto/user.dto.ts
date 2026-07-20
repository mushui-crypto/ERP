import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ description: '真实姓名' })
  @IsString()
  realName: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '组织ID', required: false })
  @IsOptional()
  @IsString()
  orgId?: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '状态: 1-启用 0-禁用', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}

export class UpdateUserDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @ApiProperty({ description: '密码', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ description: '真实姓名', required: false })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '组织ID', required: false })
  @IsOptional()
  @IsString()
  orgId?: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '状态: 1-启用 0-禁用', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}
