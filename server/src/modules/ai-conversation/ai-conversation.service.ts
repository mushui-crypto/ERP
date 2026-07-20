import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiConversation } from '../../database/entities/ai-conversation.entity';

@Injectable()
export class AiConversationService {
  constructor(
    @InjectRepository(AiConversation)
    private aiConversationRepository: Repository<AiConversation>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.aiConversationRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<AiConversation | null> {
    return this.aiConversationRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async create(data: Partial<AiConversation>): Promise<AiConversation> {
    const aiConversation = this.aiConversationRepository.create(data);
    return this.aiConversationRepository.save(aiConversation);
  }

  async update(id: string, data: Partial<AiConversation>): Promise<AiConversation> {
    const aiConversation = await this.findById(id);
    if (!aiConversation) throw new NotFoundException('对话记录不存在');
    Object.assign(aiConversation, data);
    return this.aiConversationRepository.save(aiConversation);
  }

  async remove(id: string): Promise<void> {
    const aiConversation = await this.findById(id);
    if (!aiConversation) throw new NotFoundException('对话记录不存在');
    aiConversation.isDeleted = 1;
    await this.aiConversationRepository.save(aiConversation);
  }
}
