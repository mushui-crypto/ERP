import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysMessage } from '../../database/entities/sys-message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(SysMessage)
    private messageRepository: Repository<SysMessage>,
  ) {}

  async generateMessageNo(): Promise<string> {
    const now = new Date();
    const prefix = 'MSG';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.messageRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async sendMessage(data: Partial<SysMessage>): Promise<SysMessage> {
    const messageNo = await this.generateMessageNo();
    const message = this.messageRepository.create({
      ...data,
      messageNo,
      isRead: 0,
      isPinned: 0,
    });
    return this.messageRepository.save(message);
  }

  async sendBatchMessage(receiverIds: string[], receiverNames: string[], data: Omit<Partial<SysMessage>, 'receiverId' | 'receiverName'>): Promise<SysMessage[]> {
    const results: SysMessage[] = [];
    for (let i = 0; i < receiverIds.length; i++) {
      const messageNo = await this.generateMessageNo();
      const message = this.messageRepository.create({
        ...data,
        messageNo,
        receiverId: receiverIds[i],
        receiverName: receiverNames[i] || '',
        isRead: 0,
        isPinned: 0,
      });
      results.push(await this.messageRepository.save(message));
    }
    return results;
  }

  async findMessages(receiverId: string, page = 1, pageSize = 20, messageType?: string, isRead?: number): Promise<any> {
    const query = this.messageRepository.createQueryBuilder('m')
      .where('m.isDeleted = 0 AND m.receiverId = :receiverId', { receiverId });

    if (messageType) {
      query.andWhere('m.messageType = :messageType', { messageType });
    }
    if (isRead !== undefined) {
      query.andWhere('m.isRead = :isRead', { isRead });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('m.isPinned', 'DESC')
      .addOrderBy('m.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async markAsRead(messageId: string, receiverId: string): Promise<SysMessage> {
    const message = await this.messageRepository.findOne({ where: { id: messageId, receiverId, isDeleted: 0 } });
    if (!message) throw new NotFoundException('消息不存在');

    message.isRead = 1;
    message.readTime = new Date();
    return this.messageRepository.save(message);
  }

  async markAllAsRead(receiverId: string): Promise<void> {
    await this.messageRepository.update(
      { receiverId, isRead: 0, isDeleted: 0 },
      { isRead: 1, readTime: new Date() },
    );
  }

  async deleteMessage(messageId: string, receiverId: string): Promise<void> {
    const message = await this.messageRepository.findOne({ where: { id: messageId, receiverId, isDeleted: 0 } });
    if (!message) throw new NotFoundException('消息不存在');

    message.isDeleted = 1;
    await this.messageRepository.save(message);
  }

  async getUnreadCount(receiverId: string): Promise<number> {
    return this.messageRepository.count({ where: { receiverId, isRead: 0, isDeleted: 0 } });
  }

  async getStatistics(receiverId: string): Promise<any> {
    const totalCount = await this.messageRepository.count({ where: { receiverId, isDeleted: 0 } });
    const unreadCount = await this.getUnreadCount(receiverId);
    
    const typeStats = await this.messageRepository.createQueryBuilder('m')
      .select(['m.messageType', 'COUNT(*) as count'])
      .where('m.receiverId = :receiverId AND m.isDeleted = 0', { receiverId })
      .groupBy('m.messageType')
      .getRawMany();

    return {
      totalCount,
      unreadCount,
      readCount: totalCount - unreadCount,
      typeDistribution: typeStats,
    };
  }
}