import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { SelectQueryBuilder } from 'typeorm';
import { ValidationError } from 'class-validator';


function patchSqlitePessimisticLocks() {
  if ((process.env.DB_TYPE || '').toLowerCase() !== 'sqlite') return;
  const prototype = SelectQueryBuilder.prototype as any;
  if (prototype.__hubErpSqliteLockPatchApplied) return;
  const original = prototype.createLockExpression;
  prototype.createLockExpression = function (...args: any[]) {
    const dbType = this?.connection?.options?.type;
    if (dbType === 'sqlite' || dbType === 'better-sqlite3') return '';
    return original.apply(this, args);
  };
  prototype.__hubErpSqliteLockPatchApplied = true;
}

const VALIDATION_FIELD_LABELS: Record<string, string> = {
  supplierId: '供应商ID',
  supplierName: '供应商名称',
  purchaseOrgId: '采购组织ID',
  purchaseOrgName: '采购组织名称',
  settleOrgId: '结算组织ID',
  settleOrgName: '结算组织名称',
  currencyId: '币别ID',
  currencyName: '币别名称',
  materialId: '物料ID',
  materialCode: '物料编码',
  materialName: '物料名称',
  unitId: '单位ID',
  unitName: '单位名称',
  warehouseId: '仓库ID',
  warehouseName: '仓库名称',
  idempotencyKey: '幂等键',
  requestId: '采购申请ID',
  requestEntryId: '采购申请明细ID',
  orderId: '采购订单ID',
  orderEntryId: '采购订单明细ID',
  receiveNoticeId: '收料通知ID',
  receiveNoticeEntryId: '收料通知明细ID',
  inventoryInId: '采购入库ID',
  inventoryInEntryId: '采购入库明细ID',
  returnRequestId: '采购退料申请ID',
  returnRequestEntryId: '采购退料申请明细ID',
  purchaseOrderId: '采购订单ID',
  purchaseOrderEntryId: '采购订单明细ID',
  expenseAcceptanceId: '费用验收ID',
  businessType: '采购业务类型',
  contractNo: '合同号',
  orderDate: '订单日期',
  requestDate: '申请日期',
  receiveDate: '收料日期',
  inventoryDate: '入库日期',
  returnDate: '退料日期',
  acceptanceDate: '验收日期',
  reconciliationDate: '对账日期',
  periodStart: '对账期间开始日期',
  periodEnd: '对账期间结束日期',
  quantity: '数量',
  requestQty: '申请数量',
  approveQty: '批准数量',
  orderQty: '订单数量',
  receiveQty: '收料数量',
  inventoryQty: '入库数量',
  returnQty: '退料数量',
  unitPrice: '单价',
  amount: '金额',
  totalAmount: '总金额',
  taxRate: '税率',
  taxAmount: '税额',
  lines: '明细行',
  entries: '明细行',
  reason: '原因',
  remark: '备注',
  operatedBy: '操作人',
  entryId: '明细ID',
  confirmedBy: '确认人',
  canceledBy: '取消人',
  confirmedQty: '供应商确认数量',
  confirmedUnitPrice: '供应商确认单价',
  confirmedUntaxedAmount: '供应商确认未税金额',
  confirmedTaxAmount: '供应商确认税额',
  confirmedTotalAmount: '供应商确认价税合计',
  differenceReason: '差异原因',
  username: '用户名',
  password: '密码',
  name: '名称',
  code: '编码',
  status: '状态',
  page: '页码',
  pageSize: '每页条数',
};

function fieldLabel(path: string): string {
  const normalized = path.replace(/\.children\./g, '.');
  return normalized
    .split('.')
    .map((part) => {
      if (/^\d+$/.test(part)) return `第${Number(part) + 1}行`;
      return VALIDATION_FIELD_LABELS[part] || part;
    })
    .join('.');
}

function validationConstraintMessage(constraint: string, original: string): string {
  const messages: Record<string, string> = {
    isNotEmpty: '不能为空',
    isString: '必须是字符串',
    isNumber: '必须是数字',
    isInt: '必须是整数',
    isBoolean: '必须是布尔值',
    isDateString: '必须是日期格式',
    isArray: '必须是数组',
    arrayMinSize: '至少需要一行',
    min: '不能小于允许的最小值',
    max: '不能大于允许的最大值',
    minLength: '长度不足',
    maxLength: '长度超出限制',
    isEnum: '不在允许范围内',
    isUUID: '必须是UUID',
    whitelistValidation: '不是允许提交的字段',
  };
  return messages[constraint] || original || '校验未通过';
}

function collectValidationMessages(errors: ValidationError[], parent = ''): string[] {
  const result: string[] = [];
  for (const error of errors) {
    const path = parent ? `${parent}.${error.property}` : error.property;
    if (error.constraints) {
      const label = fieldLabel(path);
      const missing = error.value === undefined || error.value === null || error.value === '';
      if (error.constraints.isNotEmpty || missing) {
        result.push(`${label}不能为空`);
        continue;
      }
      for (const [key, value] of Object.entries(error.constraints)) {
        result.push(`${fieldLabel(path)}${validationConstraintMessage(key, value)}`);
      }
    }
    if (error.children?.length) {
      result.push(...collectValidationMessages(error.children, path));
    }
  }
  return result;
}

async function bootstrap() {
  patchSqlitePessimisticLocks();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 3001);
  const prefix = configService.get<string>('APP_PREFIX', '/api');

  // 安全中间件 - 配置CSP允许内联脚本和事件处理器
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'http://localhost:3001'],
          scriptSrcAttr: ["'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'http://localhost:3001'],
          fontSrc: ["'self'"],
        },
      },
    }),
  );
  app.use(compression());

  // 全局前缀
  app.setGlobalPrefix(prefix);

  // 跨域
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = collectValidationMessages(errors);
        return new BadRequestException({
          code: 400,
          message: messages.length ? messages.join('；') : '请求参数校验失败',
          detail: messages,
        });
      },
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('磐枢工业智能平台 API')
    .setDescription('ERP / MES / PLM / WMS / HR 一体化平台接口文档')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  await app.listen(port);
  logger.log(`应用已启动: http://localhost:${port}${prefix}`);
  logger.log(`API文档地址: http://localhost:${port}${prefix}/docs`);
  logger.log(`数据库类型: ${configService.get('DB_TYPE')}`);
}

bootstrap();
