import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiConversationService } from './ai-conversation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('AI对话记录')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-conversations')
export class AiConversationController {
  constructor(private readonly aiConversationService: AiConversationService) {}

  @Get()
  @ApiOperation({ summary: '获取对话记录列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.aiConversationService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取对话记录详情' })
  async findOne(@Param('id') id: string) {
    return this.aiConversationService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建对话记录' })
  async create(@Body() data: any) {
    return this.aiConversationService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新对话记录' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.aiConversationService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除对话记录' })
  async remove(@Param('id') id: string) {
    await this.aiConversationService.remove(id);
    return null;
  }
}
