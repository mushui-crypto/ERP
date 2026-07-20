import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { MessageService } from './message.service';
import { SysMessage } from '../../database/entities/sys-message.entity';

@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get('statistics/:receiverId')
  async getStatistics(@Param('receiverId') receiverId: string) {
    return this.messageService.getStatistics(receiverId);
  }

  @Get('unread/:receiverId')
  async getUnreadCount(@Param('receiverId') receiverId: string) {
    return { unreadCount: await this.messageService.getUnreadCount(receiverId) };
  }

  @Get(':receiverId')
  async findMessages(
    @Param('receiverId') receiverId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('messageType') messageType?: string,
    @Query('isRead') isRead?: number,
  ) {
    return this.messageService.findMessages(receiverId, page, pageSize, messageType, isRead);
  }

  @Post()
  async sendMessage(@Body() data: Partial<SysMessage>) {
    return this.messageService.sendMessage(data);
  }

  @Post('batch')
  async sendBatchMessage(
    @Body('receiverIds') receiverIds: string[],
    @Body('receiverNames') receiverNames: string[],
    @Body() data: Omit<Partial<SysMessage>, 'receiverId' | 'receiverName'>,
  ) {
    return this.messageService.sendBatchMessage(receiverIds, receiverNames, data);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Body('receiverId') receiverId: string) {
    return this.messageService.markAsRead(id, receiverId);
  }

  @Put('all/read/:receiverId')
  async markAllAsRead(@Param('receiverId') receiverId: string) {
    return this.messageService.markAllAsRead(receiverId);
  }

  @Delete(':id')
  async deleteMessage(@Param('id') id: string, @Body('receiverId') receiverId: string) {
    return this.messageService.deleteMessage(id, receiverId);
  }
}