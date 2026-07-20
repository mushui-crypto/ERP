import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceRequestService } from './service-request.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('售后服务')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('service-request')
export class ServiceRequestController {
  constructor(private readonly serviceRequestService: ServiceRequestService) {}

  @Get('statistics')
  @ApiOperation({ summary: '获取服务统计' })
  async getServiceStatistics() {
    return this.serviceRequestService.getServiceStatistics();
  }

  @Get()
  @ApiOperation({ summary: '获取服务请求列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('serviceType') serviceType?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    const type = serviceType !== undefined ? Number(serviceType) : undefined;
    const stat = status !== undefined ? Number(status) : undefined;
    return this.serviceRequestService.findAll(pageNum, pageSizeNum, type, stat);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取服务请求详情' })
  async findOne(@Param('id') id: string) {
    return this.serviceRequestService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建服务请求' })
  async create(@Body() data: any) {
    return this.serviceRequestService.create(data);
  }

  @Put(':id/assign')
  @ApiOperation({ summary: '派工' })
  async assign(@Param('id') id: string, @Body('assigneeId') assigneeId: string) {
    return this.serviceRequestService.assign(id, assigneeId);
  }

  @Put(':id/start')
  @ApiOperation({ summary: '开始处理' })
  async startProcess(@Param('id') id: string) {
    return this.serviceRequestService.startProcess(id);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: '完成处理' })
  async complete(@Param('id') id: string, @Body('completedDate') completedDate?: Date) {
    return this.serviceRequestService.complete(id, completedDate);
  }

  @Put(':id/close')
  @ApiOperation({ summary: '关闭服务请求' })
  async close(@Param('id') id: string) {
    return this.serviceRequestService.close(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新服务请求' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.serviceRequestService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除服务请求' })
  async remove(@Param('id') id: string) {
    await this.serviceRequestService.remove(id);
    return null;
  }

  @Get('orders')
  @ApiOperation({ summary: '获取服务订单列表' })
  async findServiceOrders(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    const stat = status !== undefined ? Number(status) : undefined;
    return this.serviceRequestService.findServiceOrders(pageNum, pageSizeNum, stat);
  }

  @Post('orders')
  @ApiOperation({ summary: '创建服务订单' })
  async createServiceOrder(@Body('requestId') requestId: string, @Body() data: any) {
    return this.serviceRequestService.createServiceOrder(requestId, data);
  }

  @Put('orders/:orderId/assign')
  @ApiOperation({ summary: '分配技术员' })
  async assignTechnician(
    @Param('orderId') orderId: string,
    @Body('technicianId') technicianId: string,
    @Body('technicianName') technicianName: string,
  ) {
    return this.serviceRequestService.assignTechnician(orderId, technicianId, technicianName);
  }

  @Put('orders/:orderId/start')
  @ApiOperation({ summary: '开始服务' })
  async startService(@Param('orderId') orderId: string, @Body('serviceDate') serviceDate: Date) {
    return this.serviceRequestService.startService(orderId, serviceDate);
  }

  @Put('orders/:orderId/complete')
  @ApiOperation({ summary: '完成服务' })
  async completeService(@Param('orderId') orderId: string, @Body('serviceRecord') serviceRecord: string) {
    return this.serviceRequestService.completeService(orderId, serviceRecord);
  }

  @Put('orders/:orderId/settle')
  @ApiOperation({ summary: '结算服务订单' })
  async settleOrder(@Param('orderId') orderId: string) {
    return this.serviceRequestService.settleOrder(orderId);
  }

  @Get('complaints')
  @ApiOperation({ summary: '获取投诉列表' })
  async findComplaints(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('complaintType') complaintType?: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    const type = complaintType !== undefined ? Number(complaintType) : undefined;
    const stat = status !== undefined ? Number(status) : undefined;
    const sev = severity !== undefined ? Number(severity) : undefined;
    return this.serviceRequestService.findComplaints(pageNum, pageSizeNum, type, stat, sev);
  }

  @Post('complaints')
  @ApiOperation({ summary: '创建投诉' })
  async createComplaint(@Body() data: any) {
    return this.serviceRequestService.createComplaint(data);
  }

  @Put('complaints/:id/handle')
  @ApiOperation({ summary: '处理投诉' })
  async handleComplaint(@Param('id') id: string, @Body('assigneeId') assigneeId: string) {
    return this.serviceRequestService.handleComplaint(id, assigneeId);
  }

  @Put('complaints/:id/resolve')
  @ApiOperation({ summary: '解决投诉' })
  async resolveComplaint(
    @Param('id') id: string,
    @Body('solution') solution: string,
    @Body('compensationAmount') compensationAmount?: number,
  ) {
    return this.serviceRequestService.resolveComplaint(id, solution, compensationAmount);
  }

  @Put('complaints/:id/close')
  @ApiOperation({ summary: '关闭投诉' })
  async closeComplaint(@Param('id') id: string) {
    return this.serviceRequestService.closeComplaint(id);
  }
}