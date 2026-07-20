import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
