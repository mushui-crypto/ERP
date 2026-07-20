import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Org } from './entities/org.entity';
import { Menu } from './entities/menu.entity';
import { SysUserRole } from './entities/sys-user-role.entity';

const dataSource = new DataSource({
  type: 'mssql',
  host: 'localhost',
  port: 1433,
  username: 'sa',
  password: '191413',
  database: 'panshu_erp',
  entities: [User, Role, Org, Menu, SysUserRole],
  synchronize: true,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
} as any);

async function seed() {
  await dataSource.initialize();
  console.log('数据库连接成功，开始初始化系统数据...');

  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);
  const orgRepo = dataSource.getRepository(Org);
  const menuRepo = dataSource.getRepository(Menu);
  const userRoleRepo = dataSource.getRepository(SysUserRole);

  let orgId: string;

  const orgExists = await orgRepo.findOne({ where: { code: 'PANSHU' } });
  if (!orgExists) {
    const org = await orgRepo.save({
      name: '磐枢集团',
      code: 'PANSHU',
      orgType: 1,
      fullName: '磐枢工业智能集团有限公司',
      shortName: '磐枢集团',
      contact: '系统管理员',
      phone: '',
      address: '',
      status: 1,
      sortOrder: 1,
      isDeleted: 0,
    });
    orgId = org.id;
    console.log('系统组织创建成功');
  } else {
    orgId = orgExists.id;
    console.log('系统组织已存在');
  }

  let roleId: string;
  const roleExists = await roleRepo.findOne({ where: { code: 'ADMIN' } });
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
    console.log('系统角色创建成功: 系统管理员');
  } else {
    roleId = roleExists.id;
    console.log('系统角色已存在');
  }

  let adminUserId: string;
  const adminExists = await userRepo.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const admin = await userRepo.save({
      username: 'admin',
      password: hashedPassword,
      realName: '系统管理员',
      email: '',
      phone: '',
      orgId: orgId,
      avatar: '',
      status: 1,
      isDeleted: 0,
    });
    adminUserId = admin.id;
    console.log('管理员账号创建成功: admin / 123456');
  } else {
    adminUserId = adminExists.id;
    console.log('管理员账号已存在');
  }

  const adminRoleExists = await userRoleRepo.findOne({ where: { userId: adminUserId, roleId } });
  if (!adminRoleExists) {
    await userRoleRepo.save({
      userId: adminUserId,
      roleId,
    });
    console.log('管理员角色分配成功');
  } else {
    console.log('管理员角色已分配');
  }

  // 菜单数据：先软删除旧菜单，再创建完整菜单
  await menuRepo.createQueryBuilder().update().set({ isDeleted: 1 }).execute();
  console.log('已清空旧菜单数据');

  // 一级菜单（与应用端index.html完全对应）
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
  console.log(`一级菜单创建成功: ${savedTopMenus.length} 个`);

  // 二级菜单数据
  const findTop = (name: string) => savedTopMenus.find(m => m.name === name);

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

  let subMenuCount = 0;
  for (const def of subMenuDefs) {
    const parent = findTop(def.parent);
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
    subMenuCount += subMenus.length;
  }
  console.log(`二级菜单创建成功: ${subMenuCount} 个`);
  console.log('系统菜单初始化完成');

  console.log('系统初始化完成！');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('初始化失败:', err);
  process.exit(1);
});