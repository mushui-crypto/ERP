import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrintTemplate } from '../../database/entities/print-template.entity';

@Injectable()
export class PrintTemplateService {
  constructor(
    @InjectRepository(PrintTemplate)
    private printTemplateRepository: Repository<PrintTemplate>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.printTemplateRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<PrintTemplate | null> {
    return this.printTemplateRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async create(data: Partial<PrintTemplate>): Promise<PrintTemplate> {
    const template = this.printTemplateRepository.create(data);
    return this.printTemplateRepository.save(template);
  }

  async update(id: string, data: Partial<PrintTemplate>): Promise<PrintTemplate> {
    const template = await this.findById(id);
    if (!template) throw new NotFoundException('套打模板不存在');
    Object.assign(template, data);
    return this.printTemplateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findById(id);
    if (!template) throw new NotFoundException('套打模板不存在');
    template.isDeleted = 1;
    await this.printTemplateRepository.save(template);
  }
}
