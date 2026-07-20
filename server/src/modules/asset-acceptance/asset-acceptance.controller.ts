import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AssetAcceptanceService } from './asset-acceptance.service';
import { ApproveAssetAcceptanceDto, CreateAssetAcceptanceDto, UpdateAssetAcceptanceDto } from './dto/asset-acceptance.dto';

@Controller('asset-acceptances')
export class AssetAcceptanceController {
  constructor(private readonly service: AssetAcceptanceService) {}

  @Get()
  findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('businessType') businessType?: string, @Query('status') status?: string) {
    return this.service.findAll(Number(page) || 1, Number(pageSize) || 20, businessType, status === undefined ? undefined : Number(status));
  }

  @Get(':id') findById(@Param('id') id: string) { return this.service.findById(id); }
  @Post('from-receive-notice') createFromReceive(@Body() dto: CreateAssetAcceptanceDto) { return this.service.createFromReceiveNotice(dto); }
  @Post('from-inventory-in') createFromInbound(@Body() dto: CreateAssetAcceptanceDto) { return this.service.createFromInventoryIn(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateAssetAcceptanceDto) { return this.service.update(id, dto); }
  @Post(':id/submit') submit(@Param('id') id: string) { return this.service.submit(id); }
  @Post(':id/approve') approve(@Param('id') id: string, @Body() dto: ApproveAssetAcceptanceDto = {}) { return this.service.approve(id, dto); }
  @Post(':id/reject') reject(@Param('id') id: string) { return this.service.reject(id); }
  @Post(':id/cancel') cancel(@Param('id') id: string) { return this.service.cancel(id); }
  @Post(':id/generate-estimated-payable') generatePayable(@Param('id') id: string) { return this.service.generateEstimatedPayable(id); }
  @Post(':id/generate-asset-cards') generateCards(@Param('id') id: string) { return this.service.generateAssetCards(id); }
}
