import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { DocumentProcessService } from './document-process.service';

@Controller('document-process')
export class DocumentProcessController {
  constructor(private documentProcessService: DocumentProcessService) {}

  @Post('parse')
  async parseDocument(
    @Body('fileName') fileName: string,
    @Body('content') content: string,
    @Body('processedBy') processedBy: string,
  ) {
    return this.documentProcessService.parseDocument(fileName, content, processedBy);
  }

  @Post('summarize')
  async summarizeDocument(
    @Body('fileName') fileName: string,
    @Body('content') content: string,
    @Body('processedBy') processedBy: string,
    @Body('maxLength') maxLength = 500,
  ) {
    return this.documentProcessService.summarizeDocument(fileName, content, processedBy, maxLength);
  }

  @Post('correct')
  async correctDocument(
    @Body('fileName') fileName: string,
    @Body('content') content: string,
    @Body('processedBy') processedBy: string,
  ) {
    return this.documentProcessService.correctDocument(fileName, content, processedBy);
  }

  @Post('translate')
  async translateDocument(
    @Body('fileName') fileName: string,
    @Body('content') content: string,
    @Body('processedBy') processedBy: string,
    @Body('targetLang') targetLang = 'en',
  ) {
    return this.documentProcessService.translateDocument(fileName, content, processedBy, targetLang);
  }

  @Get()
  async findProcesses(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('processType') processType?: string,
    @Query('status') status?: string,
  ) {
    const stat = status !== undefined ? Number(status) : undefined;
    return this.documentProcessService.findProcesses(page, pageSize, processType, stat);
  }

  @Get(':id')
  async findProcessById(@Param('id') id: string) {
    return this.documentProcessService.findProcessById(id);
  }

  @Delete(':id')
  async deleteProcess(@Param('id') id: string) {
    return this.documentProcessService.deleteProcess(id);
  }
}