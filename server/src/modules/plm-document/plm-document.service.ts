import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlmDocument } from '../../database/entities/plm-document.entity';

@Injectable()
export class PlmDocumentService {
  constructor(
    @InjectRepository(PlmDocument)
    private documentRepository: Repository<PlmDocument>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.documentRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<PlmDocument | null> {
    return this.documentRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async create(data: Partial<PlmDocument>): Promise<PlmDocument> {
    const document = this.documentRepository.create(data);
    return this.documentRepository.save(document);
  }

  async update(id: string, data: Partial<PlmDocument>): Promise<PlmDocument> {
    const document = await this.findById(id);
    if (!document) throw new NotFoundException('PLM文档不存在');
    Object.assign(document, data);
    return this.documentRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const document = await this.findById(id);
    if (!document) throw new NotFoundException('PLM文档不存在');
    document.isDeleted = 1;
    await this.documentRepository.save(document);
  }
}
