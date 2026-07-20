import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { AiQaService } from './ai-qa.service';

@Controller('ai-qa')
export class AiQaController {
  constructor(private aiQaService: AiQaService) {}

  @Post('ask')
  async ask(
    @Body('question') question: string,
    @Body('userId') userId: string,
    @Body('sessionId') sessionId?: string,
    @Body('moduleType') moduleType?: string,
  ) {
    return this.aiQaService.ask(question, userId, sessionId, moduleType);
  }

  @Get('conversation/:sessionId')
  async getConversation(@Param('sessionId') sessionId: string) {
    return this.aiQaService.getConversation(sessionId);
  }

  @Get('history')
  async getConversationHistory(
    @Query('userId') userId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.aiQaService.getConversationHistory(userId, page, pageSize);
  }

  @Delete('conversation/:sessionId')
  async deleteConversation(@Param('sessionId') sessionId: string) {
    return this.aiQaService.deleteConversation(sessionId);
  }
}