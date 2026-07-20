import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';

@ApiTags('认证管理')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser('userId') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '刷新Token' })
  async refresh() {
    // TODO: 实现刷新Token逻辑
    return { message: '刷新Token功能待实现' };
  }
}
