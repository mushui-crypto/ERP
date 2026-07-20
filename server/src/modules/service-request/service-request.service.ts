import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from '../../database/entities/service-request.entity';
import { SvcServiceOrder } from '../../database/entities/svc-service-order.entity';
import { SvcComplaint } from '../../database/entities/svc-complaint.entity';

@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestRepository: Repository<ServiceRequest>,
    @InjectRepository(SvcServiceOrder)
    private serviceOrderRepository: Repository<SvcServiceOrder>,
    @InjectRepository(SvcComplaint)
    private complaintRepository: Repository<SvcComplaint>,
  ) {}

  async generateServiceNo(): Promise<string> {
    const now = new Date();
    const prefix = 'SR';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.serviceRequestRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateOrderNo(): Promise<string> {
    const now = new Date();
    const prefix = 'SO';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.serviceOrderRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateComplaintNo(): Promise<string> {
    const now = new Date();
    const prefix = 'CP';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.complaintRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(page = 1, pageSize = 20, serviceType?: number, status?: number): Promise<any> {
    const query = this.serviceRequestRepository.createQueryBuilder('sr')
      .where('sr.isDeleted = 0');

    if (serviceType !== undefined && serviceType !== null) {
      query.andWhere('sr.serviceType = :serviceType', { serviceType });
    }
    if (status !== undefined && status !== null) {
      query.andWhere('sr.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('sr.priority', 'ASC')
      .addOrderBy('sr.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<any> {
    const request = await this.serviceRequestRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!request) return null;

    const order = await this.serviceOrderRepository.findOne({ where: { serviceId: id, isDeleted: 0 } });

    return {
      ...request,
      serviceOrder: order,
    };
  }

  async create(data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const serviceNo = await this.generateServiceNo();
    
    const request = this.serviceRequestRepository.create({
      ...data,
      serviceNo,
      status: 0,
      requestDate: new Date(),
    });

    return this.serviceRequestRepository.save(request);
  }

  async assign(id: string, assigneeId: string): Promise<ServiceRequest> {
    const request = await this.serviceRequestRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!request) throw new NotFoundException('服务请求不存在');
    if (request.status !== 0) throw new BadRequestException('只能派工待派工状态的服务请求');

    request.assigneeId = assigneeId;
    request.status = 1;
    return this.serviceRequestRepository.save(request);
  }

  async startProcess(id: string): Promise<ServiceRequest> {
    const request = await this.serviceRequestRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!request) throw new NotFoundException('服务请求不存在');
    if (request.status !== 1) throw new BadRequestException('只能开始已派工状态的服务请求');

    request.status = 2;
    return this.serviceRequestRepository.save(request);
  }

  async complete(id: string, completedDate?: Date): Promise<ServiceRequest> {
    const request = await this.serviceRequestRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!request) throw new NotFoundException('服务请求不存在');
    if (request.status !== 2) throw new BadRequestException('只能完成处理中的服务请求');

    request.status = 3;
    request.completedDate = completedDate || new Date();
    return this.serviceRequestRepository.save(request);
  }

  async close(id: string): Promise<ServiceRequest> {
    const request = await this.serviceRequestRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!request) throw new NotFoundException('服务请求不存在');
    if (request.status !== 3) throw new BadRequestException('只能关闭已完成状态的服务请求');

    request.status = 4;
    return this.serviceRequestRepository.save(request);
  }

  async update(id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const request = await this.serviceRequestRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!request) throw new NotFoundException('服务请求不存在');
    
    Object.assign(request, data);
    return this.serviceRequestRepository.save(request);
  }

  async remove(id: string): Promise<void> {
    const request = await this.serviceRequestRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!request) throw new NotFoundException('服务请求不存在');
    request.isDeleted = 1;
    await this.serviceRequestRepository.save(request);
  }

  async createServiceOrder(requestId: string, data: Partial<SvcServiceOrder>): Promise<SvcServiceOrder> {
    const request = await this.serviceRequestRepository.findOne({ where: { id: requestId, isDeleted: 0 } });
    if (!request) throw new NotFoundException('服务请求不存在');

    const orderNo = await this.generateOrderNo();

    const order = this.serviceOrderRepository.create({
      ...data,
      orderNo,
      serviceId: requestId,
      serviceNo: request.serviceNo,
      customerId: request.customerId,
      contactPerson: request.contactPerson,
      contactPhone: request.contactPhone,
      productId: request.productId,
      serviceType: request.serviceType,
      status: 0,
    });

    const savedOrder = await this.serviceOrderRepository.save(order);

    request.status = 1;
    request.assigneeId = data.technicianId;
    await this.serviceRequestRepository.save(request);

    return savedOrder;
  }

  async assignTechnician(orderId: string, technicianId: string, technicianName: string): Promise<SvcServiceOrder> {
    const order = await this.serviceOrderRepository.findOne({ where: { id: orderId, isDeleted: 0 } });
    if (!order) throw new NotFoundException('服务订单不存在');

    order.technicianId = technicianId;
    order.technicianName = technicianName;
    order.status = 1;
    return this.serviceOrderRepository.save(order);
  }

  async startService(orderId: string, serviceDate: Date): Promise<SvcServiceOrder> {
    const order = await this.serviceOrderRepository.findOne({ where: { id: orderId, isDeleted: 0 } });
    if (!order) throw new NotFoundException('服务订单不存在');

    order.serviceDate = serviceDate;
    order.status = 3;
    return this.serviceOrderRepository.save(order);
  }

  async completeService(orderId: string, serviceRecord: string): Promise<SvcServiceOrder> {
    const order = await this.serviceOrderRepository.findOne({ where: { id: orderId, isDeleted: 0 } });
    if (!order) throw new NotFoundException('服务订单不存在');

    order.serviceRecord = serviceRecord;
    order.status = 4;
    return this.serviceOrderRepository.save(order);
  }

  async settleOrder(orderId: string): Promise<SvcServiceOrder> {
    const order = await this.serviceOrderRepository.findOne({ where: { id: orderId, isDeleted: 0 } });
    if (!order) throw new NotFoundException('服务订单不存在');

    order.status = 5;
    return this.serviceOrderRepository.save(order);
  }

  async findServiceOrders(page = 1, pageSize = 20, status?: number): Promise<any> {
    const query = this.serviceOrderRepository.createQueryBuilder('so')
      .where('so.isDeleted = 0');

    if (status !== undefined && status !== null) {
      query.andWhere('so.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('so.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async createComplaint(data: Partial<SvcComplaint>): Promise<SvcComplaint> {
    const complaintNo = await this.generateComplaintNo();

    const complaint = this.complaintRepository.create({
      ...data,
      complaintNo,
      status: 0,
    });

    return this.complaintRepository.save(complaint);
  }

  async handleComplaint(id: string, assigneeId: string): Promise<SvcComplaint> {
    const complaint = await this.complaintRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!complaint) throw new NotFoundException('投诉不存在');

    complaint.assigneeId = assigneeId;
    complaint.status = 1;
    return this.complaintRepository.save(complaint);
  }

  async resolveComplaint(id: string, solution: string, compensationAmount?: number): Promise<SvcComplaint> {
    const complaint = await this.complaintRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!complaint) throw new NotFoundException('投诉不存在');

    complaint.solution = solution;
    if (compensationAmount !== undefined) {
      complaint.compensationAmount = compensationAmount;
    }
    complaint.status = 2;
    return this.complaintRepository.save(complaint);
  }

  async closeComplaint(id: string): Promise<SvcComplaint> {
    const complaint = await this.complaintRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!complaint) throw new NotFoundException('投诉不存在');

    complaint.status = 3;
    return this.complaintRepository.save(complaint);
  }

  async findComplaints(page = 1, pageSize = 20, complaintType?: number, status?: number, severity?: number): Promise<any> {
    const query = this.complaintRepository.createQueryBuilder('c')
      .where('c.isDeleted = 0');

    if (complaintType !== undefined && complaintType !== null) {
      query.andWhere('c.complaintType = :complaintType', { complaintType });
    }
    if (status !== undefined && status !== null) {
      query.andWhere('c.status = :status', { status });
    }
    if (severity !== undefined && severity !== null) {
      query.andWhere('c.severity = :severity', { severity });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('c.severity', 'ASC')
      .addOrderBy('c.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async getServiceStatistics(): Promise<any> {
    const totalRequests = await this.serviceRequestRepository.count({ where: { isDeleted: 0 } });
    const pendingRequests = await this.serviceRequestRepository.count({ where: { isDeleted: 0, status: 0 } });
    const processingRequests = await this.serviceRequestRepository.count({ where: { isDeleted: 0, status: 2 } });
    const completedRequests = await this.serviceRequestRepository.count({ where: { isDeleted: 0, status: 3 } });
    const closedRequests = await this.serviceRequestRepository.count({ where: { isDeleted: 0, status: 4 } });

    const totalOrders = await this.serviceOrderRepository.count({ where: { isDeleted: 0 } });
    const totalComplaints = await this.complaintRepository.count({ where: { isDeleted: 0 } });
    const pendingComplaints = await this.complaintRepository.count({ where: { isDeleted: 0, status: 0 } });

    const typeStats = await this.serviceRequestRepository.createQueryBuilder('sr')
      .select('sr.serviceType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('sr.isDeleted = 0')
      .groupBy('sr.serviceType')
      .getRawMany();

    const complaintTypeStats = await this.complaintRepository.createQueryBuilder('c')
      .select('c.complaintType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('c.isDeleted = 0')
      .groupBy('c.complaintType')
      .getRawMany();

    return {
      totalRequests,
      pendingRequests,
      processingRequests,
      completedRequests,
      closedRequests,
      totalOrders,
      totalComplaints,
      pendingComplaints,
      typeStats,
      complaintTypeStats,
    };
  }
}