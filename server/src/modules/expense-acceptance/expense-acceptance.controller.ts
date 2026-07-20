import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApproveExpenseAcceptanceDto,
  CreateExpenseAcceptanceDto,
  UpdateExpenseAcceptanceDto,
} from './dto/expense-acceptance.dto';
import { ExpenseAcceptanceService } from './expense-acceptance.service';

@Controller('expense-acceptances')
export class ExpenseAcceptanceController {
  constructor(private readonly service: ExpenseAcceptanceService) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(
      Number(page) || 1,
      Number(pageSize) || 20,
      status === undefined ? undefined : Number(status),
    );
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post('from-receive-notice')
  createFromReceiveNotice(@Body() dto: CreateExpenseAcceptanceDto) {
    return this.service.createFromReceiveNotice(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseAcceptanceDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.service.submit(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ApproveExpenseAcceptanceDto = {}) {
    return this.service.approve(id, dto);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.service.reject(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Post(':id/generate-estimated-payable')
  generateEstimatedPayable(@Param('id') id: string) {
    return this.service.generateEstimatedPayable(id);
  }
}
