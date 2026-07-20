import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as mysql from 'mysql2/promise';
import { Client } from 'pg';
import * as mssql from 'mssql';
import * as bcrypt from 'bcryptjs';
import { join } from 'path';
import { DataCenter } from '../../database/entities/data-center.entity';
import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role.entity';
import { Menu } from '../../database/entities/menu.entity';
import { SysUserRole } from '../../database/entities/sys-user-role.entity';
import { CreateDataCenterDto, UpdateDataCenterDto } from './dto/data-center.dto';

@Injectable()
export class DataCenterService {
  constructor(
    @InjectRepository(DataCenter)
    private dataCenterRepository: Repository<DataCenter>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.dataCenterRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<DataCenter | null> {
    return this.dataCenterRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCode(code: string): Promise<DataCenter | null> {
    return this.dataCenterRepository.findOne({ where: { code, isDeleted: 0 } });
  }

  async create(dto: CreateDataCenterDto): Promise<any> {
    const existing = await this.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('数据中心编码已存在');
    }

    await this.createDatabase(
      dto.dbType,
      dto.dbHost,
      dto.dbPort,
      dto.dbName,
      dto.dbUser,
      dto.dbPassword
    );

    await this.syncTables(
      dto.dbType,
      dto.dbHost,
      dto.dbPort,
      dto.dbName,
      dto.dbUser,
      dto.dbPassword
    );

    await this.initializeData(
      dto.dbType,
      dto.dbHost,
      dto.dbPort,
      dto.dbName,
      dto.dbUser,
      dto.dbPassword
    );

    const dataCenter = new DataCenter();
    dataCenter.code = dto.code || '';
    dataCenter.name = dto.name || '';
    dataCenter.dbType = dto.dbType || '';
    dataCenter.dbHost = dto.dbHost || '';
    dataCenter.dbPort = dto.dbPort || 0;
    dataCenter.dbName = dto.dbName || '';
    dataCenter.dbUser = dto.dbUser || '';
    dataCenter.dbPassword = dto.dbPassword || '';
    
    await this.dataCenterRepository.save(dataCenter);

    return { code: 200, message: '创建成功', data: dataCenter };
  }

  private async syncTables(dbType: string, host: string, port: number, database: string, user: string, password: string): Promise<void> {
    const typeMap: Record<string, 'mysql' | 'postgres' | 'mssql'> = {
      mysql: 'mysql',
      postgres: 'postgres',
      mssql: 'mssql',
    };

    const dataSource = new DataSource({
      type: typeMap[dbType],
      host,
      port,
      username: user,
      password,
      database,
      entities: [join(__dirname, '../../**/*.entity.{ts,js}')],
      synchronize: true,
      logging: false,
      ...(dbType === 'mssql' ? {
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      } : {}),
    });

    try {
      await dataSource.initialize();
      await dataSource.synchronize();
    } finally {
      try {
        if (dataSource.isInitialized) {
          await dataSource.destroy();
        }
      } catch (e) {}
    }
  }

  private async initializeData(dbType: string, host: string, port: number, database: string, user: string, password: string): Promise<void> {
    const typeMap: Record<string, 'mysql' | 'postgres' | 'mssql'> = {
      mysql: 'mysql',
      postgres: 'postgres',
      mssql: 'mssql',
    };

    const dataSource = new DataSource({
      type: typeMap[dbType],
      host,
      port,
      username: user,
      password,
      database,
      entities: [User, Role, Menu, SysUserRole],
      synchronize: true,
      logging: false,
      ...(dbType === 'mssql' ? {
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      } : {}),
    });

    try {
      await dataSource.initialize();

      const userRepo = dataSource.getRepository(User);
      const roleRepo = dataSource.getRepository(Role);
      const menuRepo = dataSource.getRepository(Menu);
      const userRoleRepo = dataSource.getRepository(SysUserRole);

      const roleExists = await roleRepo.findOne({ where: { code: 'ADMIN' } });
      let roleId: string;
      if (!roleExists) {
        const role = await roleRepo.save({
          name: '系统管理员',
          code: 'ADMIN',
          dataScope: 1,
          permissions: JSON.stringify(['*']),
          status: 1,
          remark: '系统超级管理员，拥有所有权限',
          isDeleted: 0,
        });
        roleId = role.id;
      } else {
        roleId = roleExists.id;
      }

      const adminExists = await userRepo.findOne({ where: { username: 'admin' } });
      let adminUserId: string;
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        const admin = await userRepo.save({
          username: 'admin',
          password: hashedPassword,
          realName: '系统管理员',
          email: '',
          phone: '',
          orgId: '',
          avatar: '',
          status: 1,
          isDeleted: 0,
        });
        adminUserId = admin.id;
      } else {
        adminUserId = adminExists.id;
      }

      const adminRoleExists = await userRoleRepo.findOne({ where: { userId: adminUserId, roleId } });
      if (!adminRoleExists) {
        await userRoleRepo.save({
          userId: adminUserId,
          roleId,
        });
      }

      await menuRepo.createQueryBuilder().update().set({ isDeleted: 1 }).execute();

      const topMenus = [
        { name: '首页工作台', icon: 'home', menuType: 2, path: '/index', component: 'index', sortOrder: 1, isVisible: 1, isCache: 1, status: 1, isDeleted: 0 },
        { name: '供应链', icon: 'shopping-cart', menuType: 1, path: '/supply-chain', sortOrder: 2, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: '生产制造', icon: 'tool', menuType: 1, path: '/production', sortOrder: 3, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: 'MES执行', icon: 'check-circle', menuType: 1, path: '/mes', sortOrder: 4, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: '质量管理', icon: 'safety-certificate', menuType: 1, path: '/quality', sortOrder: 5, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: '财务会计', icon: 'money-collect', menuType: 1, path: '/finance', sortOrder: 6, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: '驾驶舱', icon: 'dashboard', menuType: 2, path: '/dashboard', component: 'dashboard', sortOrder: 7, isVisible: 1, isCache: 1, status: 1, isDeleted: 0 },
        { name: 'HR人力', icon: 'team', menuType: 1, path: '/hr', sortOrder: 8, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: '设备管理', icon: 'control', menuType: 1, path: '/equipment', sortOrder: 9, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: 'CRM客户', icon: 'contacts', menuType: 1, path: '/crm', sortOrder: 10, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: 'BI报表', icon: 'bar-chart', menuType: 1, path: '/bi', sortOrder: 11, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: '基础资料', icon: 'database', menuType: 1, path: '/base-data', sortOrder: 12, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: '业务规则', icon: 'file-text', menuType: 2, path: '/business-rule', component: 'business-rule', sortOrder: 13, isVisible: 1, isCache: 1, status: 1, isDeleted: 0 },
        { name: '辅助资料', icon: 'folder', menuType: 2, path: '/aux-data', component: 'aux-data', sortOrder: 14, isVisible: 1, isCache: 1, status: 1, isDeleted: 0 },
        { name: '风险预警中心', icon: 'alert', menuType: 2, path: '/risk-center', component: 'risk-center', sortOrder: 15, isVisible: 1, isCache: 1, status: 1, isDeleted: 0 },
        { name: '优化建议中心', icon: 'check', menuType: 2, path: '/optimization', component: 'optimization', sortOrder: 16, isVisible: 1, isCache: 1, status: 1, isDeleted: 0 },
        { name: 'PLM管理', icon: 'cube', menuType: 1, path: '/plm', sortOrder: 17, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: '售后管理', icon: 'customer-service', menuType: 1, path: '/service', sortOrder: 18, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: '条码管理', icon: 'scan', menuType: 1, path: '/barcode', sortOrder: 19, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: '决策大屏', icon: 'line-chart', menuType: 1, path: '/decision', sortOrder: 20, isVisible: 1, isCache: 0, status: 1, isDeleted: 0 },
        { name: 'AI智能助手', icon: 'robot', menuType: 2, path: '/ai', component: 'ai-assistant', sortOrder: 21, isVisible: 1, isCache: 1, status: 1, isDeleted: 0 },
        { name: '智能分析中心', icon: 'area-chart', menuType: 2, path: '/ai-analysis', component: 'ai-analysis', sortOrder: 22, isVisible: 1, isCache: 1, status: 1, isDeleted: 0 },
        { name: '系统设置', icon: 'setting', menuType: 2, path: '/settings', component: 'settings', sortOrder: 23, isVisible: 1, isCache: 1, status: 1, isDeleted: 0 },
      ];

      const savedTopMenus = await menuRepo.save(topMenus);

      const subMenuDefs: { parent: string; items: { name: string; path: string; component: string; sortOrder: number }[] }[] = [
        { parent: '供应链', items: [
          { name: '销售管理', path: '/supply-chain/sales', component: 'sales', sortOrder: 1 },
          { name: '采购管理', path: '/supply-chain/purchase', component: 'purchase', sortOrder: 2 },
          { name: '库存管理', path: '/supply-chain/inventory', component: 'inventory', sortOrder: 3 },
          { name: '计划管理', path: '/supply-chain/planning', component: 'planning', sortOrder: 4 },
        ]},
        { parent: '生产制造', items: [
          { name: '工程数据', path: '/production/engineering', component: 'engineering', sortOrder: 1 },
          { name: '生产管理', path: '/production/management', component: 'production', sortOrder: 2 },
          { name: '委外管理', path: '/production/outsource', component: 'outsource', sortOrder: 3 },
        ]},
        { parent: 'MES执行', items: [
          { name: '智慧车间', path: '/mes/workshop', component: 'mes-workshop', sortOrder: 1 },
          { name: '设备云', path: '/mes/equipment', component: 'mes-equipment', sortOrder: 2 },
        ]},
        { parent: '质量管理', items: [
          { name: '日常检验', path: '/quality/inspect', component: 'quality', sortOrder: 1 },
          { name: '不良品处理', path: '/quality/ncr', component: 'quality-ncr', sortOrder: 2 },
          { name: 'MRB评审', path: '/quality/mrb', component: 'quality-mrb', sortOrder: 3 },
          { name: '请检管理', path: '/quality/inspect-request', component: 'quality-inspect', sortOrder: 4 },
          { name: '质量报表', path: '/quality/report', component: 'quality-report', sortOrder: 5 },
          { name: '基础资料', path: '/quality/master', component: 'quality-master', sortOrder: 6 },
          { name: '国标资料', path: '/quality/std', component: 'quality-std', sortOrder: 7 },
          { name: '参数设置', path: '/quality/param', component: 'quality-param', sortOrder: 8 },
        ]},
        { parent: '财务会计', items: [
          { name: '总账', path: '/finance/gl', component: 'finance-gl', sortOrder: 1 },
          { name: '报表', path: '/finance/report', component: 'finance-report', sortOrder: 2 },
          { name: '应收管理', path: '/finance/ar', component: 'finance-ar', sortOrder: 3 },
          { name: '应付管理', path: '/finance/ap', component: 'finance-ap', sortOrder: 4 },
          { name: '出纳管理', path: '/finance/cashier', component: 'finance-cashier', sortOrder: 5 },
          { name: '费用管理', path: '/finance/expense', component: 'finance-expense', sortOrder: 6 },
          { name: '合并报表', path: '/finance/merge', component: 'finance-merge', sortOrder: 7 },
          { name: '存货核算', path: '/finance/inventory', component: 'finance-inventory', sortOrder: 8 },
          { name: '成本核算', path: '/finance/cost', component: 'finance-cost', sortOrder: 9 },
          { name: '固定资产', path: '/finance/fa', component: 'finance-fa', sortOrder: 10 },
          { name: '会计平台', path: '/finance/platform', component: 'finance-platform', sortOrder: 11 },
        ]},
        { parent: 'HR人力', items: [
          { name: '员工管理', path: '/hr/employee', component: 'hr-employee', sortOrder: 1 },
          { name: '组织架构', path: '/hr/org', component: 'hr-org', sortOrder: 2 },
          { name: '考勤管理', path: '/hr/attendance', component: 'hr-attendance', sortOrder: 3 },
          { name: '绩效考核', path: '/hr/performance', component: 'hr-performance', sortOrder: 4 },
          { name: '薪酬管理', path: '/hr/compensation', component: 'hr-compensation', sortOrder: 5 },
          { name: '招聘管理', path: '/hr/recruitment', component: 'hr-recruitment', sortOrder: 6 },
          { name: '合同管理', path: '/hr/contract', component: 'hr-contract', sortOrder: 7 },
          { name: '社保管理', path: '/hr/social-insurance', component: 'hr-social-insurance', sortOrder: 8 },
          { name: '个税管理', path: '/hr/tax', component: 'hr-tax', sortOrder: 9 },
          { name: '培训管理', path: '/hr/training', component: 'hr-training', sortOrder: 10 },
        ]},
        { parent: '设备管理', items: [
          { name: '设备保养', path: '/equipment/maintenance', component: 'equipment-maintenance', sortOrder: 1 },
          { name: '设备点检', path: '/equipment/check', component: 'equipment-check', sortOrder: 2 },
          { name: '设备校准', path: '/equipment/calibration', component: 'equipment-calibration', sortOrder: 3 },
          { name: '设备统计', path: '/equipment/statistics', component: 'equipment-statistics', sortOrder: 4 },
        ]},
        { parent: 'CRM客户', items: [
          { name: '客户管理', path: '/crm/customer', component: 'crm-customer', sortOrder: 1 },
          { name: '联系人', path: '/crm/contact', component: 'crm-contact', sortOrder: 2 },
          { name: '商机管理', path: '/crm/opportunity', component: 'crm-opportunity', sortOrder: 3 },
          { name: '销售管道', path: '/crm/pipeline', component: 'crm-pipeline', sortOrder: 4 },
          { name: '客户360视图', path: '/crm/customer-360', component: 'crm-customer-360', sortOrder: 5 },
          { name: '活动管理', path: '/crm/activity', component: 'crm-activity', sortOrder: 6 },
        ]},
        { parent: 'BI报表', items: [
          { name: '报表设计器', path: '/bi/report-designer', component: 'bi-report-designer', sortOrder: 1 },
          { name: '自定义看板', path: '/bi/dashboard', component: 'bi-dashboard', sortOrder: 2 },
          { name: '报表订阅', path: '/bi/subscription', component: 'bi-subscription', sortOrder: 3 },
        ]},
        { parent: '基础资料', items: [
          { name: '物料管理', path: '/base-data/material', component: 'master-material', sortOrder: 1 },
          { name: '客户管理', path: '/base-data/customer', component: 'master-customer', sortOrder: 2 },
          { name: '供应商管理', path: '/base-data/supplier', component: 'master-supplier', sortOrder: 3 },
          { name: '部门管理', path: '/base-data/department', component: 'base-department', sortOrder: 4 },
          { name: '员工管理', path: '/base-data/employee', component: 'base-employee', sortOrder: 5 },
          { name: '计量单位', path: '/base-data/unit', component: 'base-unit', sortOrder: 6 },
        ]},
        { parent: 'PLM管理', items: [
          { name: '编码管理', path: '/plm/coding', component: 'plm-coding', sortOrder: 1 },
          { name: '研发物料', path: '/plm/rd-material', component: 'plm-rd-material', sortOrder: 2 },
          { name: '项目管理', path: '/plm/project', component: 'plm-project', sortOrder: 3 },
          { name: '工艺设计', path: '/plm/process-design', component: 'plm-process-design', sortOrder: 4 },
          { name: '图文档管理', path: '/plm/document', component: 'plm-document', sortOrder: 5 },
          { name: '变更管理', path: '/plm/ecr', component: 'plm-ecr', sortOrder: 6 },
          { name: '知识库', path: '/plm/knowledge-base', component: 'plm-knowledge-base', sortOrder: 7 },
        ]},
        { parent: '售后管理', items: [
          { name: '售后申请', path: '/service/request', component: 'service-request', sortOrder: 1 },
          { name: '派工管理', path: '/service/dispatch', component: 'service-dispatch', sortOrder: 2 },
          { name: '服务记录', path: '/service/record', component: 'service-record', sortOrder: 3 },
          { name: '售后退货', path: '/service/return', component: 'service-return', sortOrder: 4 },
          { name: '售后报表', path: '/service/report', component: 'service-report', sortOrder: 5 },
        ]},
        { parent: '条码管理', items: [
          { name: '条码配置', path: '/barcode/config', component: 'barcode-config', sortOrder: 1 },
          { name: '条码打印', path: '/barcode/print', component: 'barcode-print', sortOrder: 2 },
          { name: '扫码作业', path: '/barcode/scan', component: 'barcode-scan', sortOrder: 3 },
          { name: '条码追溯', path: '/barcode/trace', component: 'barcode-trace', sortOrder: 4 },
        ]},
        { parent: '决策大屏', items: [
          { name: '销售决策', path: '/decision/sales', component: 'decision-sales', sortOrder: 1 },
          { name: '生产决策', path: '/decision/production', component: 'decision-production', sortOrder: 2 },
          { name: '质量决策', path: '/decision/quality', component: 'decision-quality', sortOrder: 3 },
          { name: '库存决策', path: '/decision/inventory', component: 'decision-inventory', sortOrder: 4 },
          { name: '财务决策', path: '/decision/finance', component: 'decision-finance', sortOrder: 5 },
        ]},
      ];

      for (const def of subMenuDefs) {
        const parent = savedTopMenus.find(m => m.name === def.parent);
        if (!parent) continue;
        const subMenus = def.items.map(item => ({
          parentId: parent.id,
          name: item.name,
          menuType: 2,
          path: item.path,
          component: item.component,
          sortOrder: item.sortOrder,
          isVisible: 1,
          isCache: 1,
          status: 1,
          isDeleted: 0,
        }));
        await menuRepo.save(subMenus);
      }

    } finally {
      try {
        if (dataSource.isInitialized) {
          await dataSource.destroy();
        }
      } catch (e) {}
    }
  }

  private async createDatabase(dbType: string, host: string, port: number, database: string, user: string, password: string): Promise<void> {
    try {
      switch (dbType) {
        case 'mysql': {
          const connection = await mysql.createConnection({
            host,
            port,
            user,
            password,
            connectTimeout: 30000,
          });
          await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
          await connection.end();
          break;
        }
        case 'postgres': {
          const client = new Client({
            host,
            port,
            user,
            password,
            database: 'postgres',
            connectionTimeoutMillis: 30000,
          });
          await client.connect();
          await client.query(`CREATE DATABASE "${database}"`);
          await client.end();
          break;
        }
        case 'mssql': {
          const pool = await mssql.connect({
            server: host,
            port,
            user,
            password,
            database: 'master',
            options: {
              encrypt: false,
              trustServerCertificate: true,
            },
            connectionTimeout: 30000,
          });
          await pool.query(`IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${database}') CREATE DATABASE [${database}]`);
          await pool.close();
          break;
        }
        default:
          throw new Error(`不支持的数据库类型: ${dbType}`);
      }
    } catch (error: any) {
      throw new Error(`创建数据库失败: ${error.message}`);
    }
  }

  async update(id: string, dto: UpdateDataCenterDto): Promise<any> {
    const dataCenter = await this.findById(id);
    if (!dataCenter) throw new NotFoundException('数据中心不存在');

    if (dto.code && dto.code !== dataCenter.code) {
      const existing = await this.findByCode(dto.code);
      if (existing) {
        throw new ConflictException('数据中心编码已存在');
      }
    }

    const { backupPath, charset, poolSize, timeout, sslEnabled, sslCertPath, readWriteSeparate, masterHost, slaveHosts, ...baseFields } = dto;
    
    Object.assign(dataCenter, baseFields);
    
    const extraConfig: Record<string, any> = {};
    if (backupPath !== undefined) extraConfig.backupPath = backupPath;
    if (charset !== undefined) extraConfig.charset = charset;
    if (poolSize !== undefined) extraConfig.poolSize = poolSize;
    if (timeout !== undefined) extraConfig.timeout = timeout;
    if (sslEnabled !== undefined) extraConfig.sslEnabled = sslEnabled;
    if (sslCertPath !== undefined) extraConfig.sslCertPath = sslCertPath;
    if (readWriteSeparate !== undefined) extraConfig.readWriteSeparate = readWriteSeparate;
    if (masterHost !== undefined) extraConfig.masterHost = masterHost;
    if (slaveHosts !== undefined) extraConfig.slaveHosts = slaveHosts;
    
    if (Object.keys(extraConfig).length > 0) {
      let currentExtra: Record<string, any> = {};
      if (dataCenter.extraConfig) {
        try {
          currentExtra = JSON.parse(dataCenter.extraConfig);
        } catch (e) {}
      }
      dataCenter.extraConfig = JSON.stringify({ ...currentExtra, ...extraConfig });
    }
    
    const updated = await this.dataCenterRepository.save(dataCenter);

    return { code: 200, message: '更新成功', data: updated };
  }

  async remove(id: string): Promise<void> {
    const dataCenter = await this.findById(id);
    if (!dataCenter) throw new NotFoundException('数据中心不存在');

    dataCenter.isDeleted = 1;
    await this.dataCenterRepository.save(dataCenter);
  }

  async testConnection(id: string): Promise<any> {
    const dataCenter = await this.findById(id);
    if (!dataCenter) throw new NotFoundException('数据中心不存在');

    return this.performConnectionTest(
      dataCenter.dbType,
      dataCenter.dbHost,
      dataCenter.dbPort,
      dataCenter.dbName,
      dataCenter.dbUser,
      dataCenter.dbPassword
    );
  }

  async testConnectionBeforeSave(dto: CreateDataCenterDto): Promise<any> {
    return this.performConnectionTest(
      dto.dbType,
      dto.dbHost,
      dto.dbPort,
      dto.dbName,
      dto.dbUser,
      dto.dbPassword
    );
  }

  private async performConnectionTest(dbType: string, host: string, port: number, database: string, user: string, password: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      let version = '';
      let dbExists = true;
      
      switch (dbType) {
        case 'mysql': {
          try {
            const connection = await mysql.createConnection({
              host,
              port,
              user,
              password,
              database,
              connectTimeout: 10000,
            });
            const [rows] = await connection.execute('SELECT VERSION() as version');
            version = (rows as any[])[0].version;
            await connection.end();
          } catch (e: any) {
            if (e.code === 'ER_BAD_DB_ERROR') {
              dbExists = false;
              const connection = await mysql.createConnection({
                host,
                port,
                user,
                password,
                database: 'mysql',
                connectTimeout: 10000,
              });
              const [rows] = await connection.execute('SELECT VERSION() as version');
              version = (rows as any[])[0].version;
              await connection.end();
            } else {
              throw e;
            }
          }
          break;
        }
        case 'postgres': {
          try {
            const client = new Client({
              host,
              port,
              user,
              password,
              database,
              connectionTimeoutMillis: 10000,
            });
            await client.connect();
            const result = await client.query('SELECT version() as version');
            version = result.rows[0].version;
            await client.end();
          } catch (e: any) {
            if (e.message?.includes('database') && e.message?.includes('does not exist')) {
              dbExists = false;
              const client = new Client({
                host,
                port,
                user,
                password,
                database: 'postgres',
                connectionTimeoutMillis: 10000,
              });
              await client.connect();
              const result = await client.query('SELECT version() as version');
              version = result.rows[0].version;
              await client.end();
            } else {
              throw e;
            }
          }
          break;
        }
        case 'mssql': {
          const pool = await mssql.connect({
            server: host,
            port,
            user,
            password,
            database: 'master',
            options: {
              encrypt: false,
              trustServerCertificate: true,
            },
            connectionTimeout: 10000,
          });
          const versionResult = await pool.query('SELECT @@VERSION as version');
          version = versionResult.recordset[0].version;
          
          const dbExistsResult = await pool.query(`SELECT COUNT(*) as cnt FROM sys.databases WHERE name = '${database}'`);
          dbExists = dbExistsResult.recordset[0].cnt > 0;
          
          await pool.close();
          break;
        }
        default:
          throw new Error(`不支持的数据库类型: ${dbType}`);
      }

      const responseTime = Date.now() - startTime;
      return {
        success: true,
        message: dbExists ? '连接成功' : '数据库不存在，将在保存时创建',
        data: {
          host,
          port,
          version,
          responseTime,
          timestamp: new Date().toISOString(),
          dbExists,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '连接失败',
      };
    }
  }

  async getConnectionStats(): Promise<any> {
    return {
      activeConnections: 0,
      connections: [],
    };
  }
}