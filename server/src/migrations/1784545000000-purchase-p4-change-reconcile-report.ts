import { MigrationInterface, QueryRunner } from 'typeorm';

export class PurchaseP4ChangeReconcileReport1784545000000 implements MigrationInterface {
  name = 'PurchaseP4ChangeReconcileReport1784545000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') {
      throw new Error('PurchaseP4ChangeReconcileReport1784545000000 当前仅提供 MSSQL 迁移实现');
    }

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_purchase_order_change', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_purchase_order_change (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_purchase_order_change PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          change_no VARCHAR(50) NOT NULL,
          idempotency_key VARCHAR(100) NOT NULL,
          payload_hash VARCHAR(64) NOT NULL,
          active_order_key VARCHAR(36) NULL,
          source_order_id VARCHAR(36) NOT NULL,
          source_order_no NVARCHAR(50) NOT NULL,
          purchase_org_id VARCHAR(36) NOT NULL,
          supplier_id VARCHAR(36) NOT NULL,
          currency_id VARCHAR(36) NULL,
          bill_type VARCHAR(30) NOT NULL,
          business_type VARCHAR(30) NOT NULL,
          change_date DATETIME NOT NULL,
          change_reason NVARCHAR(500) NOT NULL,
          status INT NOT NULL CONSTRAINT DF_purchase_order_change_status DEFAULT 0,
          effective_status VARCHAR(20) NOT NULL CONSTRAINT DF_purchase_order_change_effective DEFAULT 'NOT_EFFECTIVE',
          effective_at DATETIME NULL,
          effective_by VARCHAR(50) NULL,
          approved_at DATETIME NULL,
          approved_by VARCHAR(50) NULL,
          rejected_at DATETIME NULL,
          rejected_by VARCHAR(50) NULL,
          reject_reason NVARCHAR(500) NULL,
          canceled_at DATETIME NULL,
          canceled_by VARCHAR(50) NULL,
          cancel_reason NVARCHAR(500) NULL,
          remark NVARCHAR(1000) NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_order_change_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_order_change_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_purchase_order_change_deleted DEFAULT 0
        );
      END;

      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_order_change') AND name = N'UQ_purchase_order_change_no')
        CREATE UNIQUE INDEX UQ_purchase_order_change_no ON dbo.biz_purchase_order_change(change_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_order_change') AND name = N'UQ_purchase_order_change_idempotency')
        CREATE UNIQUE INDEX UQ_purchase_order_change_idempotency ON dbo.biz_purchase_order_change(idempotency_key);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_order_change') AND name = N'UQ_purchase_order_change_active_order')
        CREATE UNIQUE INDEX UQ_purchase_order_change_active_order ON dbo.biz_purchase_order_change(active_order_key) WHERE active_order_key IS NOT NULL;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_order_change') AND name = N'IDX_purchase_order_change_source_order')
        CREATE INDEX IDX_purchase_order_change_source_order ON dbo.biz_purchase_order_change(source_order_id, created_at);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_order_change') AND name = N'IDX_purchase_order_change_status')
        CREATE INDEX IDX_purchase_order_change_status ON dbo.biz_purchase_order_change(status, created_at);
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_purchase_order_change_entry', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_purchase_order_change_entry (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_purchase_order_change_entry PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          purchase_order_change_id UNIQUEIDENTIFIER NOT NULL,
          line_no INT NOT NULL,
          source_order_id VARCHAR(36) NOT NULL,
          source_order_no NVARCHAR(50) NOT NULL,
          source_order_entry_id VARCHAR(36) NOT NULL,
          source_request_id VARCHAR(36) NULL,
          source_request_entry_id VARCHAR(36) NULL,
          expense_item_code VARCHAR(50) NULL,
          expense_item_name NVARCHAR(200) NULL,
          material_id VARCHAR(36) NULL,
          material_code VARCHAR(50) NULL,
          material_name NVARCHAR(200) NULL,
          material_model NVARCHAR(200) NULL,
          unit_id VARCHAR(36) NULL,
          unit_code VARCHAR(50) NULL,
          unit_name NVARCHAR(50) NULL,
          snapshot_received_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_order_change_entry_received DEFAULT 0,
          snapshot_stocked_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_order_change_entry_stocked DEFAULT 0,
          snapshot_returned_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_order_change_entry_returned DEFAULT 0,
          old_order_qty DECIMAL(18,4) NOT NULL,
          new_order_qty DECIMAL(18,4) NOT NULL,
          old_unit_price DECIMAL(18,4) NOT NULL,
          new_unit_price DECIMAL(18,4) NOT NULL,
          tax_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_order_change_entry_tax_rate DEFAULT 0,
          old_delivery_date DATETIME NULL,
          new_delivery_date DATETIME NULL,
          old_warehouse_id VARCHAR(36) NULL,
          new_warehouse_id VARCHAR(36) NULL,
          old_remark NVARCHAR(500) NULL,
          new_remark NVARCHAR(500) NULL,
          change_type NVARCHAR(200) NOT NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_order_change_entry_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_order_change_entry_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_order_change_entry_deleted DEFAULT 0,
          CONSTRAINT FK_purchase_order_change_entry_header FOREIGN KEY (purchase_order_change_id)
            REFERENCES dbo.biz_purchase_order_change(id) ON DELETE CASCADE
        );
      END;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_order_change_entry') AND name = N'UQ_purchase_order_change_entry_line')
        CREATE UNIQUE INDEX UQ_purchase_order_change_entry_line ON dbo.biz_purchase_order_change_entry(purchase_order_change_id, line_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_order_change_entry') AND name = N'IDX_purchase_order_change_entry_order')
        CREATE INDEX IDX_purchase_order_change_entry_order ON dbo.biz_purchase_order_change_entry(source_order_entry_id);
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_purchase_reconciliation', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_purchase_reconciliation (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_purchase_reconciliation PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          reconciliation_no VARCHAR(50) NOT NULL,
          idempotency_key VARCHAR(100) NOT NULL,
          payload_hash VARCHAR(64) NOT NULL,
          scope_key VARCHAR(64) NOT NULL,
          active_scope_key VARCHAR(64) NULL,
          supplier_id VARCHAR(36) NOT NULL,
          purchase_org_id VARCHAR(36) NOT NULL,
          settle_org_id VARCHAR(36) NOT NULL,
          currency_id VARCHAR(36) NOT NULL,
          period_start DATETIME NOT NULL,
          period_end DATETIME NOT NULL,
          purchase_order_id VARCHAR(36) NULL,
          purchase_order_no NVARCHAR(50) NULL,
          reconciliation_date DATETIME NOT NULL,
          initiator VARCHAR(30) NOT NULL CONSTRAINT DF_purchase_reconciliation_initiator DEFAULT 'PURCHASE_ORG',
          include_generated_payables BIT NOT NULL CONSTRAINT DF_purchase_reconciliation_include_payables DEFAULT 1,
          status INT NOT NULL CONSTRAINT DF_purchase_reconciliation_status DEFAULT 0,
          business_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_reconciliation_business_qty DEFAULT 0,
          business_untaxed_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_reconciliation_business_amount DEFAULT 0,
          business_tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_reconciliation_business_tax DEFAULT 0,
          business_total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_reconciliation_business_total DEFAULT 0,
          payable_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_reconciliation_payable_qty DEFAULT 0,
          payable_untaxed_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_reconciliation_payable_amount DEFAULT 0,
          payable_tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_reconciliation_payable_tax DEFAULT 0,
          payable_total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_reconciliation_payable_total DEFAULT 0,
          difference_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_reconciliation_difference_qty DEFAULT 0,
          difference_untaxed_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_reconciliation_difference_amount DEFAULT 0,
          difference_tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_reconciliation_difference_tax DEFAULT 0,
          difference_total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_reconciliation_difference_total DEFAULT 0,
          confirmed_qty DECIMAL(18,4) NULL,
          confirmed_untaxed_amount DECIMAL(18,2) NULL,
          confirmed_tax_amount DECIMAL(18,2) NULL,
          confirmed_total_amount DECIMAL(18,2) NULL,
          confirmed_at DATETIME NULL,
          confirmed_by VARCHAR(50) NULL,
          canceled_at DATETIME NULL,
          canceled_by VARCHAR(50) NULL,
          cancel_reason NVARCHAR(500) NULL,
          remark NVARCHAR(1000) NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_reconciliation_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_reconciliation_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_purchase_reconciliation_deleted DEFAULT 0
        );
      END;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_reconciliation') AND name = N'UQ_purchase_reconciliation_no')
        CREATE UNIQUE INDEX UQ_purchase_reconciliation_no ON dbo.biz_purchase_reconciliation(reconciliation_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_reconciliation') AND name = N'UQ_purchase_reconciliation_idempotency')
        CREATE UNIQUE INDEX UQ_purchase_reconciliation_idempotency ON dbo.biz_purchase_reconciliation(idempotency_key);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_reconciliation') AND name = N'UQ_purchase_reconciliation_active_scope')
        CREATE UNIQUE INDEX UQ_purchase_reconciliation_active_scope ON dbo.biz_purchase_reconciliation(active_scope_key) WHERE active_scope_key IS NOT NULL;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_reconciliation') AND name = N'IDX_purchase_reconciliation_dimensions')
        CREATE INDEX IDX_purchase_reconciliation_dimensions ON dbo.biz_purchase_reconciliation(supplier_id, purchase_org_id, period_start, period_end, status);
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_purchase_reconciliation_entry', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_purchase_reconciliation_entry (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_purchase_reconciliation_entry PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          purchase_reconciliation_id UNIQUEIDENTIFIER NOT NULL,
          line_no INT NOT NULL,
          business_source_type VARCHAR(30) NOT NULL,
          business_source_id VARCHAR(36) NOT NULL,
          business_source_no NVARCHAR(50) NOT NULL,
          business_source_entry_id VARCHAR(36) NOT NULL,
          business_date DATETIME NOT NULL,
          source_order_id VARCHAR(36) NOT NULL,
          source_order_no NVARCHAR(50) NOT NULL,
          source_order_entry_id VARCHAR(36) NOT NULL,
          source_request_id VARCHAR(36) NULL,
          source_request_entry_id VARCHAR(36) NULL,
          payable_id VARCHAR(36) NULL,
          payable_no NVARCHAR(50) NULL,
          payable_entry_id VARCHAR(36) NULL,
          payable_type VARCHAR(30) NULL,
          expense_item_code VARCHAR(50) NULL,
          expense_item_name NVARCHAR(200) NULL,
          material_id VARCHAR(36) NULL,
          material_code VARCHAR(50) NULL,
          material_name NVARCHAR(200) NULL,
          material_model NVARCHAR(200) NULL,
          unit_id VARCHAR(36) NULL,
          unit_code VARCHAR(50) NULL,
          unit_name NVARCHAR(50) NULL,
          warehouse_id VARCHAR(36) NULL,
          business_qty DECIMAL(18,4) NOT NULL,
          business_unit_price DECIMAL(18,4) NOT NULL,
          business_tax_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_reconciliation_entry_business_rate DEFAULT 0,
          business_untaxed_amount DECIMAL(18,2) NOT NULL,
          business_tax_amount DECIMAL(18,2) NOT NULL,
          business_total_amount DECIMAL(18,2) NOT NULL,
          payable_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_reconciliation_entry_payable_qty DEFAULT 0,
          payable_unit_price DECIMAL(18,4) NOT NULL CONSTRAINT DF_reconciliation_entry_payable_price DEFAULT 0,
          payable_tax_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_reconciliation_entry_payable_rate DEFAULT 0,
          payable_untaxed_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_reconciliation_entry_payable_amount DEFAULT 0,
          payable_tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_reconciliation_entry_payable_tax DEFAULT 0,
          payable_total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_reconciliation_entry_payable_total DEFAULT 0,
          confirmed_qty DECIMAL(18,4) NULL,
          confirmed_unit_price DECIMAL(18,4) NULL,
          confirmed_untaxed_amount DECIMAL(18,2) NULL,
          confirmed_tax_amount DECIMAL(18,2) NULL,
          confirmed_total_amount DECIMAL(18,2) NULL,
          difference_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_reconciliation_entry_difference_qty DEFAULT 0,
          difference_untaxed_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_reconciliation_entry_difference_amount DEFAULT 0,
          difference_tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_reconciliation_entry_difference_tax DEFAULT 0,
          difference_total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_reconciliation_entry_difference_total DEFAULT 0,
          difference_reason NVARCHAR(500) NULL,
          confirm_remark NVARCHAR(500) NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_reconciliation_entry_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_reconciliation_entry_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_purchase_reconciliation_entry_deleted DEFAULT 0,
          CONSTRAINT FK_purchase_reconciliation_entry_header FOREIGN KEY (purchase_reconciliation_id)
            REFERENCES dbo.biz_purchase_reconciliation(id) ON DELETE CASCADE
        );
      END;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_reconciliation_entry') AND name = N'UQ_purchase_reconciliation_entry_line')
        CREATE UNIQUE INDEX UQ_purchase_reconciliation_entry_line ON dbo.biz_purchase_reconciliation_entry(purchase_reconciliation_id, line_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_reconciliation_entry') AND name = N'IDX_purchase_reconciliation_entry_business')
        CREATE INDEX IDX_purchase_reconciliation_entry_business ON dbo.biz_purchase_reconciliation_entry(business_source_type, business_source_entry_id);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_purchase_reconciliation_entry') AND name = N'IDX_purchase_reconciliation_entry_order')
        CREATE INDEX IDX_purchase_reconciliation_entry_order ON dbo.biz_purchase_reconciliation_entry(source_order_entry_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') return;
    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_purchase_reconciliation_entry', N'U') IS NOT NULL DROP TABLE dbo.biz_purchase_reconciliation_entry;
      IF OBJECT_ID(N'dbo.biz_purchase_reconciliation', N'U') IS NOT NULL DROP TABLE dbo.biz_purchase_reconciliation;
      IF OBJECT_ID(N'dbo.biz_purchase_order_change_entry', N'U') IS NOT NULL DROP TABLE dbo.biz_purchase_order_change_entry;
      IF OBJECT_ID(N'dbo.biz_purchase_order_change', N'U') IS NOT NULL DROP TABLE dbo.biz_purchase_order_change;
    `);
  }
}
