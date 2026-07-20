import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { AiKnowledgeBase } from '../../database/entities/ai-knowledge-base.entity';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private knowledgeBaseService: KnowledgeBaseService) {}

  @Get('statistics')
  async getStatistics() {
    return this.knowledgeBaseService.getStatistics();
  }

  @Get()
  async findKnowledgeBases(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('kbType') kbType?: string,
  ) {
    return this.knowledgeBaseService.findKnowledgeBases(page, pageSize, kbType);
  }

  @Get(':id')
  async findKnowledgeBaseById(@Param('id') id: string) {
    return this.knowledgeBaseService.findKnowledgeBaseById(id);
  }

  @Post()
  async createKnowledgeBase(@Body() data: Partial<AiKnowledgeBase>) {
    return this.knowledgeBaseService.createKnowledgeBase(data);
  }

  @Put(':id')
  async updateKnowledgeBase(@Param('id') id: string, @Body() data: Partial<AiKnowledgeBase>) {
    return this.knowledgeBaseService.updateKnowledgeBase(id, data);
  }

  @Delete(':id')
  async deleteKnowledgeBase(@Param('id') id: string) {
    return this.knowledgeBaseService.deleteKnowledgeBase(id);
  }

  @Get(':kbId/documents')
  async findDocuments(
    @Param('kbId') kbId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.knowledgeBaseService.findDocuments(kbId, page, pageSize);
  }

  @Get('documents/:id')
  async findDocumentById(@Param('id') id: string) {
    return this.knowledgeBaseService.findDocumentById(id);
  }

  @Post('documents')
  async uploadDocument(
    @Body('kbId') kbId: string,
    @Body('fileName') fileName: string,
    @Body('filePath') filePath: string,
    @Body('fileType') fileType: string,
    @Body('fileSize') fileSize: number,
    @Body('content') content: string,
    @Body('uploadedBy') uploadedBy: string,
  ) {
    return this.knowledgeBaseService.uploadDocument(kbId, fileName, filePath, fileType, fileSize, content, uploadedBy);
  }

  @Delete('documents/:id')
  async deleteDocument(@Param('id') id: string) {
    return this.knowledgeBaseService.deleteDocument(id);
  }

  @Post('search')
  async search(
    @Body('kbId') kbId: string,
    @Body('query') query: string,
    @Body('topK') topK = 5,
  ) {
    return this.knowledgeBaseService.search(kbId, query, topK);
  }
}