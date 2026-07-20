import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 标准采购主链 P0：为生产环境补齐采购申请、采购订单、收料/请检通知、
 * 来料检验的核心表，并补充采购组织与申请下推订单幂等字段。
 *
 * 约束：
 * - 当前实现只支持 MSSQL；生产环境不得依赖 synchronize。
 * - 缺表时按当前实体创建完整表；已有表时只补本批明确新增的字段。
 * - 所有 DDL 均带存在性保护，可安全重复执行。
 */
export class StandardPurchaseCoreChain1784513128193 implements MigrationInterface {
  name = 'StandardPurchaseCoreChain1784513128193';

  private readonly markerName = 'HubErpMigration';
  private readonly markerValue = this.name;

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.assertMssql(queryRunner);
    await this.ensurePurchaseRequest(queryRunner);
    await this.ensurePurchaseRequestEntry(queryRunner);
    await this.ensurePurchaseOrder(queryRunner);
    await this.ensurePurchaseOrderEntry(queryRunner);
    await this.ensurePurchaseReceiveNotice(queryRunner);
    await this.ensurePurchaseReceiveNoticeReversalColumns(queryRunner);
    await this.ensurePurchaseReceiveNoticeEntry(queryRunner);
    await this.ensurePurchaseReceiveNoticeReversal(queryRunner);
    await this.ensurePurchaseReceiveNoticeReversalEntry(queryRunner);
    await this.ensureQualityInspection(queryRunner);
    await this.ensureIndexes(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.assertMssql(queryRunner);

    // 仅删除带有本迁移标记的对象，避免误删部署前已经存在的业务表、字段和索引。
    await this.dropMarkedIndex(
      queryRunner,
      'biz_purchase_receive_notice_reversal_entry',
      'IDX_biz_purchase_receive_notice_reversal_entry_order_entry',
    );
    await this.dropMarkedIndex(
      queryRunner,
      'biz_purchase_receive_notice_reversal_entry',
      'UQ_biz_purchase_receive_notice_reversal_entry_source_entry',
    );
    await this.dropMarkedIndex(
      queryRunner,
      'biz_purchase_receive_notice_reversal_entry',
      'UQ_biz_purchase_receive_notice_reversal_entry_header_line',
    );
    await this.dropMarkedIndex(
      queryRunner,
      'biz_purchase_receive_notice_reversal',
      'UQ_biz_purchase_receive_notice_reversal_idempotency_key',
    );
    await this.dropMarkedIndex(
      queryRunner,
      'biz_purchase_receive_notice_reversal',
      'UQ_biz_purchase_receive_notice_reversal_source_notice',
    );
    await this.dropMarkedIndex(
      queryRunner,
      'biz_purchase_receive_notice_reversal',
      'UQ_biz_purchase_receive_notice_reversal_no',
    );
    await this.dropMarkedIndex(queryRunner, 'biz_quality_inspection', 'UQ_biz_quality_inspection_receive_entry');
    await this.dropMarkedIndex(queryRunner, 'biz_quality_inspection', 'UQ_biz_quality_inspection_no');
    await this.dropMarkedIndex(
      queryRunner,
      'biz_purchase_receive_notice_entry',
      'IDX_biz_purchase_receive_notice_entry_request_entry',
    );
    await this.dropMarkedIndex(
      queryRunner,
      'biz_purchase_receive_notice_entry',
      'IDX_biz_purchase_receive_notice_entry_order_entry',
    );
    await this.dropMarkedIndex(
      queryRunner,
      'biz_purchase_receive_notice_entry',
      'UQ_biz_purchase_receive_notice_entry_header_line',
    );
    await this.dropMarkedIndex(
      queryRunner,
      'biz_purchase_receive_notice',
      'UQ_biz_purchase_receive_notice_order_batch',
    );
    await this.dropMarkedIndex(queryRunner, 'biz_purchase_receive_notice', 'UQ_biz_purchase_receive_notice_no');
    await this.dropMarkedIndex(queryRunner, 'biz_purchase_order_entry', 'IDX_biz_purchase_order_entry_request_entry');
    await this.dropMarkedIndex(queryRunner, 'biz_purchase_order_entry', 'UQ_biz_purchase_order_entry_header_line');
    await this.dropMarkedIndex(queryRunner, 'biz_purchase_order', 'UQ_biz_purchase_order_push_idempotency_key');
    await this.dropMarkedIndex(queryRunner, 'biz_purchase_order', 'UQ_biz_purchase_order_no');
    await this.dropMarkedIndex(queryRunner, 'purchase_request_entry', 'UQ_purchase_request_entry_header_line');
    await this.dropMarkedIndex(queryRunner, 'purchase_request', 'UQ_purchase_request_no');

    await this.dropMarkedColumn(queryRunner, 'biz_purchase_order', 'push_payload_hash');
    await this.dropMarkedColumn(queryRunner, 'biz_purchase_order', 'push_idempotency_key');
    await this.dropMarkedColumn(queryRunner, 'biz_purchase_order', 'purchase_org_id');
    await this.dropMarkedColumn(queryRunner, 'purchase_request_entry', 'purchase_org_id');

    // 子表优先，且仅在整张表由本迁移创建时删除。
    await this.dropMarkedTable(queryRunner, 'biz_purchase_receive_notice_reversal_entry');
    await this.dropMarkedTable(queryRunner, 'biz_purchase_receive_notice_reversal');

    await this.dropMarkedColumn(queryRunner, 'biz_purchase_receive_notice', 'reversed_by');
    await this.dropMarkedColumn(queryRunner, 'biz_purchase_receive_notice', 'reversed_at');
    await this.dropMarkedColumn(queryRunner, 'biz_purchase_receive_notice', 'reversal_no');
    await this.dropMarkedColumn(queryRunner, 'biz_purchase_receive_notice', 'reversal_id');

    await this.dropMarkedTable(queryRunner, 'biz_quality_inspection');
    await this.dropMarkedTable(queryRunner, 'biz_purchase_receive_notice_entry');
    await this.dropMarkedTable(queryRunner, 'biz_purchase_receive_notice');
    await this.dropMarkedTable(queryRunner, 'biz_purchase_order_entry');
    await this.dropMarkedTable(queryRunner, 'biz_purchase_order');
    await this.dropMarkedTable(queryRunner, 'purchase_request_entry');
    await this.dropMarkedTable(queryRunner, 'purchase_request');
  }

  private async ensurePurchaseRequest(queryRunner: QueryRunner): Promise<void> {
    await this.createMarkedTableIfMissing(
      queryRunner,
      'purchase_request',
      `CREATE TABLE dbo.purchase_request (
      id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_purchase_request PRIMARY KEY DEFAULT NEWID(),
      request_no VARCHAR(50) NOT NULL,
      org_id VARCHAR(36) NOT NULL,
      department_id VARCHAR(36) NULL,
      applicant_id VARCHAR(36) NULL,
      applicant_name VARCHAR(50) NULL,
      request_type VARCHAR(30) NOT NULL CONSTRAINT DF_purchase_request_request_type DEFAULT 'STANDARD',
      request_date DATETIME NOT NULL,
      status INT NOT NULL CONSTRAINT DF_purchase_request_status DEFAULT 0,
      reason VARCHAR(500) NULL,
      remark NVARCHAR(MAX) NULL,
      material_id VARCHAR(36) NULL,
      material_code VARCHAR(50) NULL,
      material_name VARCHAR(200) NULL,
      unit_id VARCHAR(36) NULL,
      unit_code VARCHAR(50) NULL,
      unit_name VARCHAR(50) NULL,
      quantity DECIMAL(18,4) NULL,
      purchasedQty DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_request_purchasedQty DEFAULT 0,
      estimatedPrice DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_request_estimatedPrice DEFAULT 0,
      estimatedAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_request_estimatedAmount DEFAULT 0,
      required_date DATETIME NULL,
      supplier_id VARCHAR(36) NULL,
      supplier_code VARCHAR(50) NULL,
      supplier_name VARCHAR(200) NULL,
      warehouse_id VARCHAR(36) NULL,
      source_id VARCHAR(36) NULL,
      source_no VARCHAR(50) NULL,
      created_by VARCHAR(50) NULL,
      updated_by VARCHAR(50) NULL,
      created_at DATETIME NOT NULL CONSTRAINT DF_purchase_request_created_at DEFAULT GETDATE(),
      updated_at DATETIME NOT NULL CONSTRAINT DF_purchase_request_updated_at DEFAULT GETDATE(),
      is_deleted TINYINT NOT NULL CONSTRAINT DF_purchase_request_is_deleted DEFAULT 0
    );`,
    );
  }

  private async ensurePurchaseRequestEntry(queryRunner: QueryRunner): Promise<void> {
    await this.createMarkedTableIfMissing(
      queryRunner,
      'purchase_request_entry',
      `CREATE TABLE dbo.purchase_request_entry (
      id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_purchase_request_entry PRIMARY KEY DEFAULT NEWID(),
      purchase_request_id UNIQUEIDENTIFIER NOT NULL,
      line_no INT NOT NULL,
      purchase_org_id VARCHAR(36) NOT NULL,
      material_id VARCHAR(36) NOT NULL,
      material_code VARCHAR(50) NOT NULL,
      material_name VARCHAR(200) NOT NULL,
      material_model VARCHAR(200) NULL,
      unit_id VARCHAR(36) NOT NULL,
      unit_code VARCHAR(50) NULL,
      unit_name VARCHAR(50) NULL,
      request_qty DECIMAL(18,4) NOT NULL,
      approve_qty DECIMAL(18,4) NULL,
      purchased_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_request_entry_purchased_qty DEFAULT 0,
      estimated_price DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_request_entry_estimated_price DEFAULT 0,
      estimated_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_request_entry_estimated_amount DEFAULT 0,
      required_date DATETIME NULL,
      supplier_id VARCHAR(36) NULL,
      supplier_code VARCHAR(50) NULL,
      supplier_name VARCHAR(200) NULL,
      warehouse_id VARCHAR(36) NULL,
      contract_no VARCHAR(100) NULL,
      remark VARCHAR(500) NULL,
      created_by VARCHAR(50) NULL,
      updated_by VARCHAR(50) NULL,
      created_at DATETIME NOT NULL CONSTRAINT DF_purchase_request_entry_created_at DEFAULT GETDATE(),
      updated_at DATETIME NOT NULL CONSTRAINT DF_purchase_request_entry_updated_at DEFAULT GETDATE(),
      is_deleted TINYINT NOT NULL CONSTRAINT DF_purchase_request_entry_is_deleted DEFAULT 0,
      CONSTRAINT FK_purchase_request_entry_header FOREIGN KEY (purchase_request_id)
        REFERENCES dbo.purchase_request(id) ON DELETE CASCADE
    );`,
    );
    await this.addMarkedColumnIfMissing(queryRunner, 'purchase_request_entry', 'purchase_org_id', 'VARCHAR(36) NULL');
  }

  private async ensurePurchaseOrder(queryRunner: QueryRunner): Promise<void> {
    await this.createMarkedTableIfMissing(
      queryRunner,
      'biz_purchase_order',
      `CREATE TABLE dbo.biz_purchase_order (
      id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_biz_purchase_order PRIMARY KEY DEFAULT NEWID(),
      order_no VARCHAR(50) NOT NULL,
      supplier_id VARCHAR(36) NOT NULL,
      purchase_org_id VARCHAR(36) NOT NULL,
      source_type VARCHAR(30) NOT NULL CONSTRAINT DF_biz_purchase_order_source_type DEFAULT 'MANUAL',
      push_idempotency_key VARCHAR(100) NULL,
      push_payload_hash VARCHAR(64) NULL,
      contract_no VARCHAR(100) NOT NULL,
      order_date DATETIME NOT NULL,
      delivery_date DATETIME NULL,
      warehouse_id VARCHAR(36) NULL,
      total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_biz_purchase_order_total_amount DEFAULT 0,
      total_tax DECIMAL(18,2) NOT NULL CONSTRAINT DF_biz_purchase_order_total_tax DEFAULT 0,
      total_net_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_biz_purchase_order_total_net_amount DEFAULT 0,
      currency_id VARCHAR(36) NULL,
      payment_term_id VARCHAR(36) NULL,
      buyer_id VARCHAR(36) NULL,
      status INT NOT NULL CONSTRAINT DF_biz_purchase_order_status DEFAULT 0,
      remark NVARCHAR(MAX) NULL,
      source_id VARCHAR(36) NULL,
      source_no VARCHAR(50) NULL,
      material_id VARCHAR(36) NULL,
      material_code VARCHAR(50) NULL,
      material_name VARCHAR(200) NULL,
      quantity DECIMAL(18,4) NULL,
      unit_price DECIMAL(18,4) NULL,
      created_by VARCHAR(50) NULL,
      updated_by VARCHAR(50) NULL,
      created_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_order_created_at DEFAULT GETDATE(),
      updated_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_order_updated_at DEFAULT GETDATE(),
      is_deleted TINYINT NOT NULL CONSTRAINT DF_biz_purchase_order_is_deleted DEFAULT 0
    );`,
    );
    await this.addMarkedColumnIfMissing(queryRunner, 'biz_purchase_order', 'purchase_org_id', 'VARCHAR(36) NULL');
    await this.addMarkedColumnIfMissing(queryRunner, 'biz_purchase_order', 'push_idempotency_key', 'VARCHAR(100) NULL');
    await this.addMarkedColumnIfMissing(queryRunner, 'biz_purchase_order', 'push_payload_hash', 'VARCHAR(64) NULL');
  }

  private async ensurePurchaseOrderEntry(queryRunner: QueryRunner): Promise<void> {
    await this.createMarkedTableIfMissing(
      queryRunner,
      'biz_purchase_order_entry',
      `CREATE TABLE dbo.biz_purchase_order_entry (
      id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_biz_purchase_order_entry PRIMARY KEY DEFAULT NEWID(),
      purchase_order_id UNIQUEIDENTIFIER NOT NULL,
      line_no INT NOT NULL,
      supplier_id VARCHAR(36) NOT NULL,
      material_id VARCHAR(36) NOT NULL,
      material_code VARCHAR(50) NOT NULL,
      material_name VARCHAR(200) NOT NULL,
      material_model VARCHAR(200) NULL,
      unit_id VARCHAR(36) NOT NULL,
      unit_code VARCHAR(50) NULL,
      unit_name VARCHAR(50) NULL,
      order_qty DECIMAL(18,4) NOT NULL,
      received_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_purchase_order_entry_received_qty DEFAULT 0,
      stocked_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_purchase_order_entry_stocked_qty DEFAULT 0,
      unit_price DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_purchase_order_entry_unit_price DEFAULT 0,
      amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_biz_purchase_order_entry_amount DEFAULT 0,
      tax_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_biz_purchase_order_entry_tax_rate DEFAULT 0,
      tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_biz_purchase_order_entry_tax_amount DEFAULT 0,
      net_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_biz_purchase_order_entry_net_amount DEFAULT 0,
      delivery_date DATETIME NULL,
      warehouse_id VARCHAR(36) NULL,
      check_incoming BIT NOT NULL CONSTRAINT DF_biz_purchase_order_entry_check_incoming DEFAULT 1,
      source_request_id VARCHAR(36) NULL,
      source_request_no VARCHAR(50) NULL,
      source_request_entry_id VARCHAR(36) NULL,
      remark VARCHAR(500) NULL,
      created_by VARCHAR(50) NULL,
      updated_by VARCHAR(50) NULL,
      created_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_order_entry_created_at DEFAULT GETDATE(),
      updated_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_order_entry_updated_at DEFAULT GETDATE(),
      is_deleted TINYINT NOT NULL CONSTRAINT DF_biz_purchase_order_entry_is_deleted DEFAULT 0,
      CONSTRAINT FK_biz_purchase_order_entry_header FOREIGN KEY (purchase_order_id)
        REFERENCES dbo.biz_purchase_order(id) ON DELETE CASCADE
    );`,
    );
  }

  private async ensurePurchaseReceiveNotice(queryRunner: QueryRunner): Promise<void> {
    await this.createMarkedTableIfMissing(
      queryRunner,
      'biz_purchase_receive_notice',
      `CREATE TABLE dbo.biz_purchase_receive_notice (
      id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_biz_purchase_receive_notice PRIMARY KEY DEFAULT NEWID(),
      notice_no VARCHAR(50) NOT NULL,
      receive_batch_no VARCHAR(100) NOT NULL,
      purchase_order_id VARCHAR(36) NOT NULL,
      purchase_order_no VARCHAR(50) NOT NULL,
      stock_org_id VARCHAR(36) NOT NULL,
      purchase_org_id VARCHAR(36) NOT NULL,
      supplier_id VARCHAR(36) NOT NULL,
      receive_date DATETIME NOT NULL,
      send_bill_no VARCHAR(100) NULL,
      lad_bill_no VARCHAR(100) NULL,
      need_check BIT NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_need_check DEFAULT 1,
      receiver_id VARCHAR(36) NULL,
      receive_department_id VARCHAR(36) NULL,
      status INT NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_status DEFAULT 0,
      approved_at DATETIME NULL,
      approved_by VARCHAR(50) NULL,
      reversal_id VARCHAR(36) NULL,
      reversal_no VARCHAR(50) NULL,
      reversed_at DATETIME NULL,
      reversed_by VARCHAR(50) NULL,
      remark NVARCHAR(MAX) NULL,
      created_by VARCHAR(50) NULL,
      updated_by VARCHAR(50) NULL,
      created_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_created_at DEFAULT GETDATE(),
      updated_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_updated_at DEFAULT GETDATE(),
      is_deleted TINYINT NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_is_deleted DEFAULT 0
    );`,
    );
  }

  private async ensurePurchaseReceiveNoticeReversalColumns(queryRunner: QueryRunner): Promise<void> {
    await this.addMarkedColumnIfMissing(queryRunner, 'biz_purchase_receive_notice', 'reversal_id', 'VARCHAR(36) NULL');
    await this.addMarkedColumnIfMissing(queryRunner, 'biz_purchase_receive_notice', 'reversal_no', 'VARCHAR(50) NULL');
    await this.addMarkedColumnIfMissing(queryRunner, 'biz_purchase_receive_notice', 'reversed_at', 'DATETIME NULL');
    await this.addMarkedColumnIfMissing(queryRunner, 'biz_purchase_receive_notice', 'reversed_by', 'VARCHAR(50) NULL');
  }

  private async ensurePurchaseReceiveNoticeEntry(queryRunner: QueryRunner): Promise<void> {
    await this.createMarkedTableIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_entry',
      `CREATE TABLE dbo.biz_purchase_receive_notice_entry (
      id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_biz_purchase_receive_notice_entry PRIMARY KEY DEFAULT NEWID(),
      purchase_receive_notice_id UNIQUEIDENTIFIER NOT NULL,
      line_no INT NOT NULL,
      source_order_id VARCHAR(36) NOT NULL,
      source_order_no VARCHAR(50) NOT NULL,
      source_order_entry_id VARCHAR(36) NOT NULL,
      source_request_id VARCHAR(36) NULL,
      source_request_no VARCHAR(50) NULL,
      source_request_entry_id VARCHAR(36) NULL,
      material_id VARCHAR(36) NOT NULL,
      material_code VARCHAR(50) NOT NULL,
      material_name VARCHAR(200) NOT NULL,
      material_model VARCHAR(200) NULL,
      unit_id VARCHAR(36) NOT NULL,
      unit_code VARCHAR(50) NULL,
      unit_name VARCHAR(50) NULL,
      receive_qty DECIMAL(18,4) NOT NULL,
      inspected_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_inspected_qty DEFAULT 0,
      qualified_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_qualified_qty DEFAULT 0,
      concession_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_concession_qty DEFAULT 0,
      unqualified_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_unqualified_qty DEFAULT 0,
      stocked_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_stocked_qty DEFAULT 0,
      check_incoming BIT NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_check_incoming DEFAULT 1,
      warehouse_id VARCHAR(36) NULL,
      unit_price DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_unit_price DEFAULT 0,
      amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_amount DEFAULT 0,
      tax_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_tax_rate DEFAULT 0,
      tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_tax_amount DEFAULT 0,
      net_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_net_amount DEFAULT 0,
      supplier_lot VARCHAR(100) NULL,
      produce_date DATETIME NULL,
      expiry_date DATETIME NULL,
      remark VARCHAR(500) NULL,
      created_by VARCHAR(50) NULL,
      updated_by VARCHAR(50) NULL,
      created_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_created_at DEFAULT GETDATE(),
      updated_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_updated_at DEFAULT GETDATE(),
      is_deleted TINYINT NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_entry_is_deleted DEFAULT 0,
      CONSTRAINT FK_biz_purchase_receive_notice_entry_header FOREIGN KEY (purchase_receive_notice_id)
        REFERENCES dbo.biz_purchase_receive_notice(id) ON DELETE CASCADE
    );`,
    );
  }

  private async ensurePurchaseReceiveNoticeReversal(queryRunner: QueryRunner): Promise<void> {
    await this.createMarkedTableIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_reversal',
      `CREATE TABLE dbo.biz_purchase_receive_notice_reversal (
      id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_biz_purchase_receive_notice_reversal PRIMARY KEY DEFAULT NEWID(),
      reversal_no VARCHAR(50) NOT NULL,
      source_notice_id VARCHAR(36) NOT NULL,
      source_notice_no VARCHAR(50) NOT NULL,
      purchase_order_id VARCHAR(36) NOT NULL,
      purchase_order_no VARCHAR(50) NOT NULL,
      purchase_org_id VARCHAR(36) NOT NULL,
      stock_org_id VARCHAR(36) NOT NULL,
      supplier_id VARCHAR(36) NOT NULL,
      reversal_date DATETIME NOT NULL,
      reason VARCHAR(500) NOT NULL,
      operated_by VARCHAR(50) NULL,
      idempotency_key VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_reversal_status DEFAULT 'COMPLETED',
      created_by VARCHAR(50) NULL,
      updated_by VARCHAR(50) NULL,
      created_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_reversal_created_at DEFAULT GETDATE(),
      updated_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_reversal_updated_at DEFAULT GETDATE(),
      is_deleted TINYINT NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_reversal_is_deleted DEFAULT 0
    );`,
    );
  }

  private async ensurePurchaseReceiveNoticeReversalEntry(queryRunner: QueryRunner): Promise<void> {
    await this.createMarkedTableIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_reversal_entry',
      `CREATE TABLE dbo.biz_purchase_receive_notice_reversal_entry (
      id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_biz_purchase_receive_notice_reversal_entry PRIMARY KEY DEFAULT NEWID(),
      reversal_id VARCHAR(36) NOT NULL,
      line_no INT NOT NULL,
      source_notice_entry_id VARCHAR(36) NOT NULL,
      source_order_entry_id VARCHAR(36) NOT NULL,
      material_id VARCHAR(36) NOT NULL,
      unit_id VARCHAR(36) NOT NULL,
      reversal_qty DECIMAL(18,4) NOT NULL,
      before_received_qty DECIMAL(18,4) NOT NULL,
      after_received_qty DECIMAL(18,4) NOT NULL,
      created_by VARCHAR(50) NULL,
      updated_by VARCHAR(50) NULL,
      created_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_reversal_entry_created_at DEFAULT GETDATE(),
      updated_at DATETIME NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_reversal_entry_updated_at DEFAULT GETDATE(),
      is_deleted TINYINT NOT NULL CONSTRAINT DF_biz_purchase_receive_notice_reversal_entry_is_deleted DEFAULT 0
    );`,
    );
  }

  private async ensureQualityInspection(queryRunner: QueryRunner): Promise<void> {
    await this.createMarkedTableIfMissing(
      queryRunner,
      'biz_quality_inspection',
      `CREATE TABLE dbo.biz_quality_inspection (
      id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_biz_quality_inspection PRIMARY KEY DEFAULT NEWID(),
      inspection_no VARCHAR(50) NOT NULL,
      inspection_type INT NOT NULL,
      source_type VARCHAR(50) NULL,
      source_id VARCHAR(36) NULL,
      source_receive_notice_id VARCHAR(36) NULL,
      source_receive_notice_no VARCHAR(50) NULL,
      source_receive_notice_entry_id VARCHAR(36) NULL,
      material_id VARCHAR(36) NULL,
      material_code VARCHAR(50) NULL,
      material_name VARCHAR(200) NULL,
      supplier_id VARCHAR(36) NULL,
      batch_no VARCHAR(50) NULL,
      inspection_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_quality_inspection_inspection_qty DEFAULT 0,
      sample_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_quality_inspection_sample_qty DEFAULT 0,
      qualified_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_quality_inspection_qualified_qty DEFAULT 0,
      unqualified_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_quality_inspection_unqualified_qty DEFAULT 0,
      concession_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_biz_quality_inspection_concession_qty DEFAULT 0,
      inspector VARCHAR(50) NULL,
      inspection_date DATETIME NOT NULL,
      result INT NOT NULL CONSTRAINT DF_biz_quality_inspection_result DEFAULT 0,
      status INT NOT NULL CONSTRAINT DF_biz_quality_inspection_status DEFAULT 0,
      approved_by VARCHAR(50) NULL,
      approved_at DATETIME NULL,
      result_applied_at DATETIME NULL,
      remark NVARCHAR(MAX) NULL,
      created_by VARCHAR(50) NULL,
      updated_by VARCHAR(50) NULL,
      created_at DATETIME NOT NULL CONSTRAINT DF_biz_quality_inspection_created_at DEFAULT GETDATE(),
      updated_at DATETIME NOT NULL CONSTRAINT DF_biz_quality_inspection_updated_at DEFAULT GETDATE(),
      is_deleted TINYINT NOT NULL CONSTRAINT DF_biz_quality_inspection_is_deleted DEFAULT 0
    );`,
    );
  }

  private async ensureIndexes(queryRunner: QueryRunner): Promise<void> {
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'purchase_request',
      'UQ_purchase_request_no',
      'CREATE UNIQUE INDEX UQ_purchase_request_no ON dbo.purchase_request(request_no)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'purchase_request_entry',
      'UQ_purchase_request_entry_header_line',
      'CREATE UNIQUE INDEX UQ_purchase_request_entry_header_line ON dbo.purchase_request_entry(purchase_request_id, line_no)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_order',
      'UQ_biz_purchase_order_no',
      'CREATE UNIQUE INDEX UQ_biz_purchase_order_no ON dbo.biz_purchase_order(order_no)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_order',
      'UQ_biz_purchase_order_push_idempotency_key',
      `CREATE UNIQUE INDEX UQ_biz_purchase_order_push_idempotency_key
       ON dbo.biz_purchase_order(push_idempotency_key) WHERE push_idempotency_key IS NOT NULL`,
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_order_entry',
      'UQ_biz_purchase_order_entry_header_line',
      'CREATE UNIQUE INDEX UQ_biz_purchase_order_entry_header_line ON dbo.biz_purchase_order_entry(purchase_order_id, line_no)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_order_entry',
      'IDX_biz_purchase_order_entry_request_entry',
      'CREATE INDEX IDX_biz_purchase_order_entry_request_entry ON dbo.biz_purchase_order_entry(source_request_entry_id)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_receive_notice',
      'UQ_biz_purchase_receive_notice_no',
      'CREATE UNIQUE INDEX UQ_biz_purchase_receive_notice_no ON dbo.biz_purchase_receive_notice(notice_no)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_receive_notice',
      'UQ_biz_purchase_receive_notice_order_batch',
      'CREATE UNIQUE INDEX UQ_biz_purchase_receive_notice_order_batch ON dbo.biz_purchase_receive_notice(purchase_order_id, receive_batch_no)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_entry',
      'UQ_biz_purchase_receive_notice_entry_header_line',
      'CREATE UNIQUE INDEX UQ_biz_purchase_receive_notice_entry_header_line ON dbo.biz_purchase_receive_notice_entry(purchase_receive_notice_id, line_no)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_entry',
      'IDX_biz_purchase_receive_notice_entry_order_entry',
      'CREATE INDEX IDX_biz_purchase_receive_notice_entry_order_entry ON dbo.biz_purchase_receive_notice_entry(source_order_entry_id)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_entry',
      'IDX_biz_purchase_receive_notice_entry_request_entry',
      'CREATE INDEX IDX_biz_purchase_receive_notice_entry_request_entry ON dbo.biz_purchase_receive_notice_entry(source_request_entry_id)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_reversal',
      'UQ_biz_purchase_receive_notice_reversal_no',
      'CREATE UNIQUE INDEX UQ_biz_purchase_receive_notice_reversal_no ON dbo.biz_purchase_receive_notice_reversal(reversal_no)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_reversal',
      'UQ_biz_purchase_receive_notice_reversal_source_notice',
      'CREATE UNIQUE INDEX UQ_biz_purchase_receive_notice_reversal_source_notice ON dbo.biz_purchase_receive_notice_reversal(source_notice_id)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_reversal',
      'UQ_biz_purchase_receive_notice_reversal_idempotency_key',
      'CREATE UNIQUE INDEX UQ_biz_purchase_receive_notice_reversal_idempotency_key ON dbo.biz_purchase_receive_notice_reversal(idempotency_key)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_reversal_entry',
      'UQ_biz_purchase_receive_notice_reversal_entry_header_line',
      'CREATE UNIQUE INDEX UQ_biz_purchase_receive_notice_reversal_entry_header_line ON dbo.biz_purchase_receive_notice_reversal_entry(reversal_id, line_no)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_reversal_entry',
      'UQ_biz_purchase_receive_notice_reversal_entry_source_entry',
      'CREATE UNIQUE INDEX UQ_biz_purchase_receive_notice_reversal_entry_source_entry ON dbo.biz_purchase_receive_notice_reversal_entry(source_notice_entry_id)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_purchase_receive_notice_reversal_entry',
      'IDX_biz_purchase_receive_notice_reversal_entry_order_entry',
      'CREATE INDEX IDX_biz_purchase_receive_notice_reversal_entry_order_entry ON dbo.biz_purchase_receive_notice_reversal_entry(source_order_entry_id)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_quality_inspection',
      'UQ_biz_quality_inspection_no',
      'CREATE UNIQUE INDEX UQ_biz_quality_inspection_no ON dbo.biz_quality_inspection(inspection_no)',
    );
    await this.createMarkedIndexIfMissing(
      queryRunner,
      'biz_quality_inspection',
      'UQ_biz_quality_inspection_receive_entry',
      `CREATE UNIQUE INDEX UQ_biz_quality_inspection_receive_entry
       ON dbo.biz_quality_inspection(source_receive_notice_entry_id)
       WHERE source_receive_notice_entry_id IS NOT NULL`,
    );
  }

  private assertMssql(queryRunner: QueryRunner): void {
    if (queryRunner.connection.options.type !== 'mssql') {
      throw new Error(`${this.name} 当前仅提供 MSSQL 迁移实现`);
    }
  }

  private async createMarkedTableIfMissing(queryRunner: QueryRunner, table: string, createSql: string): Promise<void> {
    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.${table}', N'U') IS NULL
      BEGIN
        ${createSql}
        EXEC sys.sp_addextendedproperty
          @name=N'${this.markerName}', @value=N'${this.markerValue}',
          @level0type=N'SCHEMA', @level0name=N'dbo',
          @level1type=N'TABLE', @level1name=N'${table}';
      END;
    `);
  }

  private async addMarkedColumnIfMissing(
    queryRunner: QueryRunner,
    table: string,
    column: string,
    definition: string,
  ): Promise<void> {
    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.${table}', N'U') IS NOT NULL
         AND COL_LENGTH('dbo.${table}', '${column}') IS NULL
      BEGIN
        ALTER TABLE dbo.${table} ADD ${column} ${definition};
        EXEC sys.sp_addextendedproperty
          @name=N'${this.markerName}', @value=N'${this.markerValue}',
          @level0type=N'SCHEMA', @level0name=N'dbo',
          @level1type=N'TABLE', @level1name=N'${table}',
          @level2type=N'COLUMN', @level2name=N'${column}';
      END;
    `);
  }

  private async createMarkedIndexIfMissing(
    queryRunner: QueryRunner,
    table: string,
    index: string,
    createSql: string,
  ): Promise<void> {
    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.${table}', N'U') IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM sys.indexes
           WHERE object_id=OBJECT_ID(N'dbo.${table}') AND name=N'${index}'
         )
      BEGIN
        ${createSql};
        EXEC sys.sp_addextendedproperty
          @name=N'${this.markerName}', @value=N'${this.markerValue}',
          @level0type=N'SCHEMA', @level0name=N'dbo',
          @level1type=N'TABLE', @level1name=N'${table}',
          @level2type=N'INDEX', @level2name=N'${index}';
      END;
    `);
  }

  private async dropMarkedIndex(queryRunner: QueryRunner, table: string, index: string): Promise<void> {
    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.${table}', N'U') IS NOT NULL
         AND EXISTS (
           SELECT 1 FROM sys.fn_listextendedproperty(
             N'${this.markerName}', N'SCHEMA', N'dbo', N'TABLE', N'${table}', N'INDEX', N'${index}'
           ) WHERE CAST(value AS NVARCHAR(128))=N'${this.markerValue}'
         )
         AND EXISTS (
           SELECT 1 FROM sys.indexes
           WHERE object_id=OBJECT_ID(N'dbo.${table}') AND name=N'${index}'
         )
        DROP INDEX [${index}] ON dbo.${table};
    `);
  }

  private async dropMarkedColumn(queryRunner: QueryRunner, table: string, column: string): Promise<void> {
    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.${table}', N'U') IS NOT NULL
         AND COL_LENGTH('dbo.${table}', '${column}') IS NOT NULL
         AND EXISTS (
           SELECT 1 FROM sys.fn_listextendedproperty(
             N'${this.markerName}', N'SCHEMA', N'dbo', N'TABLE', N'${table}', N'COLUMN', N'${column}'
           ) WHERE CAST(value AS NVARCHAR(128))=N'${this.markerValue}'
         )
      BEGIN
        DECLARE @defaultConstraint NVARCHAR(128);
        SELECT @defaultConstraint=dc.name
        FROM sys.default_constraints dc
        JOIN sys.columns c ON c.object_id=dc.parent_object_id AND c.column_id=dc.parent_column_id
        WHERE dc.parent_object_id=OBJECT_ID(N'dbo.${table}') AND c.name=N'${column}';
        IF @defaultConstraint IS NOT NULL
          EXEC(N'ALTER TABLE dbo.${table} DROP CONSTRAINT [' + @defaultConstraint + ']');
        ALTER TABLE dbo.${table} DROP COLUMN [${column}];
      END;
    `);
  }

  private async dropMarkedTable(queryRunner: QueryRunner, table: string): Promise<void> {
    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.${table}', N'U') IS NOT NULL
         AND EXISTS (
           SELECT 1 FROM sys.fn_listextendedproperty(
             N'${this.markerName}', N'SCHEMA', N'dbo', N'TABLE', N'${table}', NULL, NULL
           ) WHERE CAST(value AS NVARCHAR(128))=N'${this.markerValue}'
         )
        DROP TABLE dbo.${table};
    `);
  }
}
