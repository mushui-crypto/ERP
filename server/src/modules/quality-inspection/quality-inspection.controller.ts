import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApproveQualityInspectionDto,
  CreateIncomingInspectionDto,
  UpdateQualityInspectionDto,
} from './dto/quality-inspection.dto';
import { QualityInspectionService } from './quality-inspection.service';

@ApiTags('质量检验')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quality-inspections')
export class QualityInspectionController {
  constructor(private readonly qualityInspectionService: QualityInspectionService) {}

  @Get()
  @ApiOperation({ summary: '获取质量检验单列表' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('inspectionNo') inspectionNo?: string,
    @Query('materialCode') materialCode?: string,
    @Query('inspectionType') inspectionType?: string,
  ) {
    return this.qualityInspectionService.findAll(
      Number(page) || 1,
      Number(pageSize) || 20,
      inspectionNo,
      materialCode,
      inspectionType === undefined ? undefined : Number(inspectionType),
    );
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取检验统计' })
  getStatistics(@Query('inspectionType') inspectionType?: string, @Query('period') period?: string) {
    return this.qualityInspectionService.getStatistics(
      inspectionType === undefined ? undefined : Number(inspectionType),
      period,
    );
  }

  @Get('type/:inspectionType')
  @ApiOperation({ summary: '按类型查询检验单' })
  findByType(@Param('inspectionType') inspectionType: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.qualityInspectionService.findByType(Number(inspectionType), Number(page) || 1, Number(pageSize) || 20);
  }

  @Get('result/:result')
  @ApiOperation({ summary: '按结果查询检验单' })
  findByResult(@Param('result') result: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.qualityInspectionService.findByResult(Number(result), Number(page) || 1, Number(pageSize) || 20);
  }

  @Get('source/:sourceType/:sourceId')
  @ApiOperation({ summary: '按来源查询检验单' })
  findBySource(@Param('sourceType') sourceType: string, @Param('sourceId') sourceId: string) {
    return this.qualityInspectionService.findBySource(sourceType, sourceId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取检验单详情' })
  findOne(@Param('id') id: string) {
    return this.qualityInspectionService.findById(id);
  }

  @Post('incoming/from-receive-entry')
  @ApiOperation({ summary: '收料通知明细下推来料检验单' })
  createIncoming(@Body() dto: CreateIncomingInspectionDto) {
    return this.qualityInspectionService.createIncoming(dto);
  }

  @Post()
  @ApiOperation({ summary: '创建通用检验单' })
  create(@Body() data: any) {
    return this.qualityInspectionService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新草稿或已驳回来料检验单' })
  update(@Param('id') id: string, @Body() dto: UpdateQualityInspectionDto) {
    return this.qualityInspectionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通用草稿检验单；标准采购来料检验单不允许删除' })
  async remove(@Param('id') id: string) {
    await this.qualityInspectionService.remove(id);
    return null;
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '提交检验单' })
  submit(@Param('id') id: string) {
    return this.qualityInspectionService.submit(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审核检验单并反写收料明细检验结果' })
  approve(@Param('id') id: string, @Body() dto: ApproveQualityInspectionDto) {
    return this.qualityInspectionService.approve(id, dto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '驳回检验单；允许修改后重新提交' })
  reject(@Param('id') id: string) {
    return this.qualityInspectionService.reject(id);
  }
}
