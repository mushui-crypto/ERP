﻿import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../../database/entities/attendance.entity';
import { CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async findAll(page = 1, pageSize = 20, empId?: string, attendDate?: string) {
    const query = this.attendanceRepository.createQueryBuilder('a')
      .where('a.isDeleted = 0');
    
    if (empId) {
      query.andWhere('a.empId = :empId', { empId });
    }
    if (attendDate) {
      const startDate = new Date(attendDate);
      const endDate = new Date(attendDate);
      endDate.setDate(endDate.getDate() + 1);
      query.andWhere('a.attendDate >= :startDate AND a.attendDate < :endDate', { startDate, endDate });
    }
    
    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('a.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Attendance | null> {
    return this.attendanceRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByEmpId(empId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({ where: { empId, isDeleted: 0 }, order: { attendDate: 'DESC' } });
  }

  async findByDate(attendDate: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { isDeleted: 0 },
      order: { empId: 'ASC' },
    });
  }

  calculateStatus(clockIn: Date, clockOut: Date): number {
    if (!clockIn && !clockOut) return 0;
    if (!clockIn) return 4;
    if (!clockOut) return 4;
    
    const workStartTime = new Date(clockIn);
    workStartTime.setHours(9, 0, 0, 0);
    const workEndTime = new Date(clockOut);
    workEndTime.setHours(18, 0, 0, 0);
    
    if (clockIn > workStartTime) return 2;
    if (clockOut < workEndTime) return 3;
    
    return 1;
  }

  calculateWorkHours(clockIn: Date, clockOut: Date): number {
    if (!clockIn || !clockOut) return 0;
    
    const diff = clockOut.getTime() - clockIn.getTime();
    const hours = diff / (1000 * 60 * 60);
    return Math.round(hours * 100) / 100;
  }

  async clockIn(empId: string): Promise<Attendance> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    let attendance = await this.attendanceRepository.findOne({
      where: {
        empId,
        isDeleted: 0,
      },
    });
    
    if (!attendance) {
      attendance = this.attendanceRepository.create({
        empId,
        attendDate: now,
        clockIn: now,
        status: 0,
      });
    } else {
      attendance.clockIn = now;
    }
    
    return this.attendanceRepository.save(attendance);
  }

  async clockOut(empId: string): Promise<Attendance> {
    const now = new Date();
    
    const attendance = await this.attendanceRepository.findOne({
      where: {
        empId,
        isDeleted: 0,
      },
    });
    
    if (!attendance) {
      throw new BadRequestException('该员工今日未打卡，请先上班打卡');
    }
    
    attendance.clockOut = now;
    attendance.status = this.calculateStatus(attendance.clockIn, now);
    attendance.workHours = this.calculateWorkHours(attendance.clockIn, now);
    
    if (attendance.workHours > 8) {
      attendance.overtimeHours = attendance.workHours - 8;
    }
    
    return this.attendanceRepository.save(attendance);
  }

  async create(dto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepository.create({
      empId: dto.empId,
      attendDate: new Date(dto.attendDate),
      clockIn: dto.clockIn ? new Date(`${dto.attendDate}T${dto.clockIn}`) : null,
      clockOut: dto.clockOut ? new Date(`${dto.attendDate}T${dto.clockOut}`) : null,
      status: 0,
    });
    return this.attendanceRepository.save(attendance);
  }

  async update(id: string, dto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findById(id);
    if (!attendance) throw new NotFoundException('考勤记录不存在');
    
    const updated = { ...attendance, ...dto };
    
    if (dto.clockIn || dto.clockOut) {
      const clockIn = dto.clockIn ? new Date(dto.clockIn) : attendance.clockIn;
      const clockOut = dto.clockOut ? new Date(dto.clockOut) : attendance.clockOut;
      updated.status = this.calculateStatus(clockIn, clockOut);
      updated.workHours = this.calculateWorkHours(clockIn, clockOut);
      
      if (updated.workHours > 8) {
        updated.overtimeHours = updated.workHours - 8;
      }
    }
    
    return this.attendanceRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.findById(id);
    if (!attendance) throw new NotFoundException('考勤记录不存在');
    
    attendance.isDeleted = 1;
    await this.attendanceRepository.save(attendance);
  }

  async getAttendanceSummary(empId?: string, period?: string): Promise<any> {
    const query = this.attendanceRepository.createQueryBuilder('a')
      .select([
        'COUNT(*) as totalDays',
        'SUM(a.workHours) as totalWorkHours',
        'SUM(a.overtimeHours) as totalOvertimeHours',
      ])
      .where('a.isDeleted = 0');
    
    if (empId) {
      query.andWhere('a.empId = :empId', { empId });
    }
    if (period) {
      const [year, month] = period.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      query.andWhere('a.attendDate >= :startDate AND a.attendDate < :endDate', { startDate, endDate });
    }
    
    const result = await query.getRawOne();
    
    return {
      totalDays: result.totalDays || 0,
      totalWorkHours: result.totalWorkHours || 0,
      totalOvertimeHours: result.totalOvertimeHours || 0,
    };
  }
}