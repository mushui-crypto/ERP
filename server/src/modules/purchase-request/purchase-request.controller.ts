import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApprovePurchaseRequestDto,
  CreatePurchaseRequestDto,
  ImportPurchaseRequestDto,
  UpdatePurchaseRequestDto,
} from './dto/purchase-request.dto';
import { PurchaseRequestService } from './purchase-request.service';

@Controller(['purchase-requests', 'purchase-request'])
export class PurchaseRequestController {
  constructor(private readonly purchaseRequestService: PurchaseRequestService) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('requestNo') requestNo?: string,
    @Query('materialCode') materialCode?: string,
    @Query('status') status?: string,
  ) {
    return this.purchaseRequestService.findAll(
      +page,
      +pageSize,
      requestNo,
      materialCode,
      status === undefined || status === '' ? undefined : Number(status),
    );
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: number, @Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.purchaseRequestService.findByStatus(+status, +page, +pageSize);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.purchaseRequestService.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePurchaseRequestDto) {
    return this.purchaseRequestService.create(dto);
  }

  @Post('import')
  importFromExternal(@Body() dto: ImportPurchaseRequestDto) {
    return this.purchaseRequestService.importFromExternal(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseRequestDto) {
    return this.purchaseRequestService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseRequestService.remove(id);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.purchaseRequestService.submit(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ApprovePurchaseRequestDto) {
    return this.purchaseRequestService.approve(id, dto);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.purchaseRequestService.reject(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.purchaseRequestService.cancel(id);
  }

  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.purchaseRequestService.close(id);
  }
}
