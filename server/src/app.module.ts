import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { getDatabaseConfig } from './config/database.config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { OrgModule } from './modules/org/org.module';
import { MenuModule } from './modules/menu/menu.module';
import { DataCenterModule } from './modules/data-center/data-center.module';
import { DictModule } from './modules/dict/dict.module';
import { ConfigModule } from './modules/config/config.module';
import { CommonModule } from './common/common.module';
import { MetaEntityModule } from './modules/meta-entity/meta-entity.module';
import { MetaFieldModule } from './modules/meta-field/meta-field.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { PrintTemplateModule } from './modules/print-template/print-template.module';
import { UnitModule } from './modules/unit/unit.module';
import { MaterialCategoryModule } from './modules/material-category/material-category.module';
import { MaterialModule } from './modules/material/material.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { DepartmentModule } from './modules/department/department.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { PositionModule } from './modules/position/position.module';
import { PaymentTermModule } from './modules/payment-term/payment-term.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { CustomerModule } from './modules/customer/customer.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { InventoryInModule } from './modules/inventory-in/inventory-in.module';
import { InventoryOutModule } from './modules/inventory-out/inventory-out.module';
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module';
import { PurchaseRequestModule } from './modules/purchase-request/purchase-request.module';
import { PurchaseReceiveNoticeModule } from './modules/purchase-receive-notice/purchase-receive-notice.module';
import { SalesOrderModule } from './modules/sales-order/sales-order.module';
import { BomModule } from './modules/bom/bom.module';
import { BomDetailModule } from './modules/bom-detail/bom-detail.module';
import { ProductionOrderModule } from './modules/production-order/production-order.module';
import { QualityInspectionModule } from './modules/quality-inspection/quality-inspection.module';
import { AccountingVoucherModule } from './modules/accounting-voucher/accounting-voucher.module';
import { ReceivableModule } from './modules/receivable/receivable.module';
import { PayableModule } from './modules/payable/payable.module';
import { CostManagementModule } from './modules/cost-management/cost-management.module';
import { BudgetManagementModule } from './modules/budget-management/budget-management.module';
import { FixedAssetModule } from './modules/fixed-asset/fixed-asset.module';
import { PlmDocumentModule } from './modules/plm-document/plm-document.module';
import { PlmEcnModule } from './modules/plm-ecn/plm-ecn.module';
import { PlmProductModule } from './modules/plm-product/plm-product.module';
import { PlmMaterialModule } from './modules/plm-material/plm-material.module';
import { ServiceRequestModule } from './modules/service-request/service-request.module';
import { BarcodeRuleModule } from './modules/barcode-rule/barcode-rule.module';
import { BiReportModule } from './modules/bi-report/bi-report.module';
import { DecisionAnalysisModule } from './modules/decision-analysis/decision-analysis.module';

import { AttendanceModule } from './modules/attendance/attendance.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { TrainingModule } from './modules/training/training.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { CrmCustomerModule } from './modules/crm-customer/crm-customer.module';
import { CrmOpportunityModule } from './modules/crm-opportunity/crm-opportunity.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { EquipmentMaintenanceModule } from './modules/equipment-maintenance/equipment-maintenance.module';
import { AiConversationModule } from './modules/ai-conversation/ai-conversation.module';
import { RiskAlertModule } from './modules/risk-alert/risk-alert.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { AiQaModule } from './modules/ai-qa/ai-qa.module';
import { AiAnalysisModule } from './modules/ai-analysis/ai-analysis.module';
import { AnalysisModelModule } from './modules/analysis-model/analysis-model.module';
import { OptimizationModule } from './modules/optimization/optimization.module';
import { DocumentProcessModule } from './modules/document-process/document-process.module';
import { MessageModule } from './modules/message/message.module';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [
    // 环境变量配置
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    // 数据库配置（多数据库支持）
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // 定时任务
    ScheduleModule.forRoot(),

    // 静态文件服务 - 提供前端页面
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'traewordp'),
      serveRoot: '/',
      exclude: ['/api*'],
      serveStaticOptions: {
        setHeaders: function(res, path) {
          if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=UTF-8');
          } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
          } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=UTF-8');
          } else if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json; charset=UTF-8');
          }
        },
      },
    }),

    // 业务模块
    AuthModule,
    UserModule,
    RoleModule,
    OrgModule,
    MenuModule,
    DataCenterModule,
    DictModule,
    ConfigModule,
    CommonModule,
    // 低代码平台模块
    MetaEntityModule,
    MetaFieldModule,
    WorkflowModule,
    PrintTemplateModule,
    // 基础资料扩展模块
    UnitModule,
    MaterialCategoryModule,
    MaterialModule,
    WarehouseModule,
    DepartmentModule,
    EmployeeModule,
    PositionModule,
    PaymentTermModule,
    CurrencyModule,
    SupplierModule,
    CustomerModule,
    InventoryModule,
    InventoryInModule,
    InventoryOutModule,
    // 供应链+生产+质量模块
    PurchaseOrderModule,
    PurchaseRequestModule,
    PurchaseReceiveNoticeModule,
    SalesOrderModule,
    BomModule,
    BomDetailModule,
    ProductionOrderModule,
    QualityInspectionModule,
    // HR模块
    AttendanceModule,
    PayrollModule,
    RecruitmentModule,
    TrainingModule,
    PerformanceModule,
    // CRM模块
    CrmCustomerModule,
    CrmOpportunityModule,
    // 设备管理模块
    EquipmentModule,
    EquipmentMaintenanceModule,
    // 智能体应用模块
    AiConversationModule,
    RiskAlertModule,
    KnowledgeBaseModule,
    AiQaModule,
    AiAnalysisModule,
    AnalysisModelModule,
    OptimizationModule,
    DocumentProcessModule,
    // 消息通知模块
    MessageModule,
    // 任务管理模块
    TaskModule,
    // 财务模块
    AccountingVoucherModule,
    ReceivableModule,
    PayableModule,
    CostManagementModule,
    BudgetManagementModule,
    FixedAssetModule,
    // PLM模块
    PlmDocumentModule,
    PlmEcnModule,
    PlmProductModule,
    PlmMaterialModule,
    // 售后服务模块
    ServiceRequestModule,
    // 系统扩展模块
    BarcodeRuleModule,
    BiReportModule,
    DecisionAnalysisModule,
  ],
  providers: [
    // 全局拦截器
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    // 全局异常过滤
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // 全局JWT守卫（可选，按需开启）
    // { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
