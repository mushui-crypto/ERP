import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AssetOutRequestService } from './asset-out-request.service';
import { ApproveAssetOutRequestDto, CreateAssetOutRequestDto, PushAssetOutRequestDto, UpdateAssetOutRequestDto } from './dto/asset-out-request.dto';

@Controller('asset-out-requests')
export class AssetOutRequestController {
  constructor(private readonly service: AssetOutRequestService) {}
  @Get() findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('status') status?: string) {
    return this.service.findAll(Number(page) || 1, Number(pageSize) || 20, status === undefined ? undefined : Number(status));
  }
  @Get(':id') findById(@Param('id') id: string) { return this.service.findById(id); }
  @Post('from-asset-acceptance') create(@Body() dto: CreateAssetOutRequestDto) { return this.service.createFromAssetAcceptance(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateAssetOutRequestDto) { return this.service.update(id, dto); }
  @Post(':id/submit') submit(@Param('id') id: string) { return this.service.submit(id); }
  @Post(':id/approve') approve(@Param('id') id: string, @Body() dto: ApproveAssetOutRequestDto = {}) { return this.service.approve(id, dto); }
  @Post(':id/reject') reject(@Param('id') id: string) { return this.service.reject(id); }
  @Post(':id/cancel') cancel(@Param('id') id: string) { return this.service.cancel(id); }
  @Post(':id/push-inventory-out') push(@Param('id') id: string, @Body() dto: PushAssetOutRequestDto) { return this.service.pushInventoryOut(id, dto); }
}
