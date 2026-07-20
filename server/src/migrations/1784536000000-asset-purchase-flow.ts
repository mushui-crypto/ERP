import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssetPurchaseFlow1784536000000 implements MigrationInterface {
  name = 'AssetPurchaseFlow1784536000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') throw new Error('AssetPurchaseFlow1784536000000 当前仅提供 MSSQL 迁移实现');

    await queryRunner.query(`
      IF COL_LENGTH('dbo.purchase_request', 'bill_type') IS NULL ALTER TABLE dbo.purchase_request ADD bill_type VARCHAR(30) NOT NULL CONSTRAINT DF_purchase_request_bill_type DEFAULT 'STANDARD_PURCHASE';
      IF COL_LENGTH('dbo.purchase_request', 'business_type') IS NULL ALTER TABLE dbo.purchase_request ADD business_type VARCHAR(30) NOT NULL CONSTRAINT DF_purchase_request_business_type DEFAULT 'STANDARD';
      IF COL_LENGTH('dbo.purchase_request', 'external_source_type') IS NULL ALTER TABLE dbo.purchase_request ADD external_source_type VARCHAR(30) NULL;
      IF COL_LENGTH('dbo.purchase_request', 'external_source_id') IS NULL ALTER TABLE dbo.purchase_request ADD external_source_id VARCHAR(100) NULL;
      IF COL_LENGTH('dbo.purchase_request', 'external_source_no') IS NULL ALTER TABLE dbo.purchase_request ADD external_source_no VARCHAR(100) NULL;
      IF COL_LENGTH('dbo.purchase_request', 'import_payload_hash') IS NULL ALTER TABLE dbo.purchase_request ADD import_payload_hash VARCHAR(64) NULL;
      IF COL_LENGTH('dbo.biz_purchase_order', 'bill_type') IS NULL ALTER TABLE dbo.biz_purchase_order ADD bill_type VARCHAR(30) NOT NULL CONSTRAINT DF_purchase_order_bill_type DEFAULT 'STANDARD_PURCHASE';
      IF COL_LENGTH('dbo.biz_purchase_order', 'business_type') IS NULL ALTER TABLE dbo.biz_purchase_order ADD business_type VARCHAR(30) NOT NULL CONSTRAINT DF_purchase_order_business_type DEFAULT 'STANDARD';
      IF COL_LENGTH('dbo.biz_purchase_receive_notice', 'bill_type') IS NULL ALTER TABLE dbo.biz_purchase_receive_notice ADD bill_type VARCHAR(30) NOT NULL CONSTRAINT DF_receive_notice_bill_type DEFAULT 'STANDARD_PURCHASE';
      IF COL_LENGTH('dbo.biz_purchase_receive_notice', 'business_type') IS NULL ALTER TABLE dbo.biz_purchase_receive_notice ADD business_type VARCHAR(30) NOT NULL CONSTRAINT DF_receive_notice_business_type DEFAULT 'STANDARD';
      IF COL_LENGTH('dbo.biz_purchase_receive_notice_entry', 'asset_accepted_qty') IS NULL ALTER TABLE dbo.biz_purchase_receive_notice_entry ADD asset_accepted_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_receive_entry_asset_accepted DEFAULT 0;
      IF COL_LENGTH('dbo.inventory_in_entry', 'asset_accepted_qty') IS NULL ALTER TABLE dbo.inventory_in_entry ADD asset_accepted_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_in_entry_asset_accepted DEFAULT 0;
      IF COL_LENGTH('dbo.fin_payable_entry', 'asset_acceptance_entry_id') IS NULL ALTER TABLE dbo.fin_payable_entry ADD asset_acceptance_entry_id VARCHAR(36) NULL;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.purchase_request') AND name=N'UQ_purchase_request_external_source')
        CREATE UNIQUE INDEX UQ_purchase_request_external_source ON dbo.purchase_request(external_source_type, external_source_id) WHERE external_source_id IS NOT NULL;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.fin_payable_entry') AND name=N'UQ_fin_payable_entry_asset_acceptance')
        CREATE UNIQUE INDEX UQ_fin_payable_entry_asset_acceptance ON dbo.fin_payable_entry(asset_acceptance_entry_id) WHERE asset_acceptance_entry_id IS NOT NULL;
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.fin_asset_category', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.fin_asset_category (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_fin_asset_category PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          category_code VARCHAR(50) NOT NULL,
          category_name NVARCHAR(200) NOT NULL,
          asset_type VARCHAR(50) NOT NULL,
          useful_life_months INT NOT NULL,
          salvage_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_asset_category_salvage DEFAULT 0,
          depreciation_method VARCHAR(50) NOT NULL CONSTRAINT DF_asset_category_method DEFAULT 'straight_line',
          status INT NOT NULL CONSTRAINT DF_asset_category_status DEFAULT 1,
          remark NVARCHAR(500) NULL,
          created_by VARCHAR(50) NULL, updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_asset_category_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_asset_category_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_asset_category_deleted DEFAULT 0
        );
      END;
    `);
    await queryRunner.query(`IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.fin_asset_category') AND name=N'UQ_fin_asset_category_code') CREATE UNIQUE INDEX UQ_fin_asset_category_code ON dbo.fin_asset_category(category_code);`);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_asset_acceptance', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_asset_acceptance (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_asset_acceptance PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          acceptance_no VARCHAR(50) NOT NULL, idempotency_key VARCHAR(100) NOT NULL, payload_hash VARCHAR(64) NOT NULL,
          business_type VARCHAR(30) NOT NULL, source_type VARCHAR(30) NOT NULL, source_id VARCHAR(36) NOT NULL, source_no VARCHAR(50) NOT NULL,
          org_id VARCHAR(36) NOT NULL, purchase_org_id VARCHAR(36) NOT NULL, stock_org_id VARCHAR(36) NULL, settle_org_id VARCHAR(36) NULL,
          supplier_id VARCHAR(36) NOT NULL, currency_id VARCHAR(36) NULL, payment_term_id VARCHAR(36) NULL,
          acceptance_date DATETIME NOT NULL, department_id VARCHAR(36) NULL, acceptor_id VARCHAR(36) NULL,
          amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_asset_acceptance_amount DEFAULT 0,
          tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_asset_acceptance_tax DEFAULT 0,
          total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_asset_acceptance_total DEFAULT 0,
          status INT NOT NULL CONSTRAINT DF_asset_acceptance_status DEFAULT 0, approved_at DATETIME NULL, approved_by VARCHAR(50) NULL,
          payable_generation_status VARCHAR(30) NOT NULL CONSTRAINT DF_asset_acceptance_payable_status DEFAULT 'NOT_REQUIRED',
          payable_id VARCHAR(36) NULL, payable_no VARCHAR(50) NULL, payable_generation_error NVARCHAR(1000) NULL,
          payable_generation_failed_at DATETIME NULL, payable_generated_at DATETIME NULL,
          asset_card_generation_status VARCHAR(30) NOT NULL CONSTRAINT DF_asset_acceptance_card_status DEFAULT 'NOT_GENERATED',
          asset_card_generation_error NVARCHAR(1000) NULL, asset_card_generation_failed_at DATETIME NULL, asset_card_generated_at DATETIME NULL,
          out_request_id VARCHAR(36) NULL, out_request_no VARCHAR(50) NULL, remark NVARCHAR(1000) NULL,
          created_by VARCHAR(50) NULL, updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_asset_acceptance_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_asset_acceptance_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_asset_acceptance_deleted DEFAULT 0
        );
      END;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_acceptance') AND name=N'UQ_asset_acceptance_no') CREATE UNIQUE INDEX UQ_asset_acceptance_no ON dbo.biz_asset_acceptance(acceptance_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_acceptance') AND name=N'UQ_asset_acceptance_idempotency') CREATE UNIQUE INDEX UQ_asset_acceptance_idempotency ON dbo.biz_asset_acceptance(idempotency_key);
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_asset_acceptance_entry', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_asset_acceptance_entry (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_asset_acceptance_entry PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          asset_acceptance_id UNIQUEIDENTIFIER NOT NULL, line_no INT NOT NULL,
          source_receive_notice_id VARCHAR(36) NULL, source_receive_notice_entry_id VARCHAR(36) NULL,
          source_inventory_in_id VARCHAR(36) NULL, source_inventory_in_entry_id VARCHAR(36) NULL,
          source_order_id VARCHAR(36) NOT NULL, source_order_entry_id VARCHAR(36) NOT NULL,
          source_request_id VARCHAR(36) NULL, source_request_entry_id VARCHAR(36) NULL,
          material_id VARCHAR(36) NOT NULL, material_code VARCHAR(50) NOT NULL, material_name NVARCHAR(200) NOT NULL,
          material_model NVARCHAR(200) NULL, unit_id VARCHAR(36) NOT NULL, unit_code VARCHAR(50) NULL, unit_name NVARCHAR(50) NULL,
          acceptance_qty DECIMAL(18,4) NOT NULL, passed_qty DECIMAL(18,4) NOT NULL,
          failed_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_asset_acceptance_entry_failed DEFAULT 0,
          out_requested_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_asset_acceptance_entry_out DEFAULT 0,
          asset_card_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_asset_acceptance_entry_card DEFAULT 0,
          unit_price DECIMAL(18,4) NOT NULL, tax_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_asset_acceptance_entry_rate DEFAULT 0,
          amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_asset_acceptance_entry_amount DEFAULT 0,
          tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_asset_acceptance_entry_tax DEFAULT 0,
          total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_asset_acceptance_entry_total DEFAULT 0,
          asset_category_code VARCHAR(50) NOT NULL, department_id VARCHAR(36) NULL, custodian_id VARCHAR(36) NULL,
          location NVARCHAR(200) NULL, lot_no VARCHAR(100) NULL, remark NVARCHAR(500) NULL,
          created_by VARCHAR(50) NULL, updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_asset_acceptance_entry_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_asset_acceptance_entry_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_asset_acceptance_entry_deleted DEFAULT 0,
          CONSTRAINT FK_asset_acceptance_entry_header FOREIGN KEY (asset_acceptance_id) REFERENCES dbo.biz_asset_acceptance(id) ON DELETE CASCADE
        );
      END;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_acceptance_entry') AND name=N'UQ_asset_acceptance_entry_line') CREATE UNIQUE INDEX UQ_asset_acceptance_entry_line ON dbo.biz_asset_acceptance_entry(asset_acceptance_id, line_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_acceptance_entry') AND name=N'IDX_asset_acceptance_entry_receive') CREATE INDEX IDX_asset_acceptance_entry_receive ON dbo.biz_asset_acceptance_entry(source_receive_notice_entry_id);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_acceptance_entry') AND name=N'IDX_asset_acceptance_entry_inbound') CREATE INDEX IDX_asset_acceptance_entry_inbound ON dbo.biz_asset_acceptance_entry(source_inventory_in_entry_id);
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_asset_out_request', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_asset_out_request (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_asset_out_request PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          request_no VARCHAR(50) NOT NULL, idempotency_key VARCHAR(100) NOT NULL, payload_hash VARCHAR(64) NOT NULL,
          source_asset_acceptance_id VARCHAR(36) NOT NULL, source_asset_acceptance_no VARCHAR(50) NOT NULL,
          org_id VARCHAR(36) NOT NULL, warehouse_id VARCHAR(36) NOT NULL, department_id VARCHAR(36) NULL, applicant_id VARCHAR(36) NULL,
          request_date DATETIME NOT NULL, status INT NOT NULL CONSTRAINT DF_asset_out_request_status DEFAULT 0,
          approved_at DATETIME NULL, approved_by VARCHAR(50) NULL, inventory_out_id VARCHAR(36) NULL, inventory_out_no VARCHAR(50) NULL,
          remark NVARCHAR(1000) NULL, created_by VARCHAR(50) NULL, updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_asset_out_request_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_asset_out_request_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_asset_out_request_deleted DEFAULT 0
        );
      END;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_out_request') AND name=N'UQ_asset_out_request_no') CREATE UNIQUE INDEX UQ_asset_out_request_no ON dbo.biz_asset_out_request(request_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_out_request') AND name=N'UQ_asset_out_request_idempotency') CREATE UNIQUE INDEX UQ_asset_out_request_idempotency ON dbo.biz_asset_out_request(idempotency_key);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_out_request') AND name=N'UQ_asset_out_request_acceptance') CREATE UNIQUE INDEX UQ_asset_out_request_acceptance ON dbo.biz_asset_out_request(source_asset_acceptance_id);
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_asset_out_request_entry', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_asset_out_request_entry (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_asset_out_request_entry PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          asset_out_request_id UNIQUEIDENTIFIER NOT NULL, line_no INT NOT NULL,
          source_asset_acceptance_entry_id VARCHAR(36) NOT NULL, source_inventory_in_entry_id VARCHAR(36) NOT NULL,
          material_id VARCHAR(36) NOT NULL, material_code VARCHAR(50) NOT NULL, material_name NVARCHAR(200) NOT NULL,
          material_model NVARCHAR(200) NULL, unit_id VARCHAR(36) NOT NULL, unit_code VARCHAR(50) NULL, unit_name NVARCHAR(50) NULL,
          lot_no VARCHAR(100) NULL, request_qty DECIMAL(18,4) NOT NULL,
          out_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_asset_out_request_entry_out DEFAULT 0,
          unit_price DECIMAL(18,4) NOT NULL, amount DECIMAL(18,2) NOT NULL, asset_category_code VARCHAR(50) NOT NULL,
          department_id VARCHAR(36) NULL, custodian_id VARCHAR(36) NULL, location NVARCHAR(200) NULL,
          created_by VARCHAR(50) NULL, updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_asset_out_request_entry_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_asset_out_request_entry_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_asset_out_request_entry_deleted DEFAULT 0,
          CONSTRAINT FK_asset_out_request_entry_header FOREIGN KEY (asset_out_request_id) REFERENCES dbo.biz_asset_out_request(id) ON DELETE CASCADE
        );
      END;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_out_request_entry') AND name=N'UQ_asset_out_request_entry_line') CREATE UNIQUE INDEX UQ_asset_out_request_entry_line ON dbo.biz_asset_out_request_entry(asset_out_request_id, line_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_out_request_entry') AND name=N'UQ_asset_out_request_entry_acceptance') CREATE UNIQUE INDEX UQ_asset_out_request_entry_acceptance ON dbo.biz_asset_out_request_entry(source_asset_acceptance_entry_id);
    `);

    await queryRunner.query(`
      IF COL_LENGTH('dbo.inventory_out', 'push_idempotency_key') IS NULL ALTER TABLE dbo.inventory_out ADD push_idempotency_key VARCHAR(100) NULL;
      IF COL_LENGTH('dbo.inventory_out', 'push_payload_hash') IS NULL ALTER TABLE dbo.inventory_out ADD push_payload_hash VARCHAR(64) NULL;
      IF COL_LENGTH('dbo.inventory_out', 'source_type') IS NULL ALTER TABLE dbo.inventory_out ADD source_type VARCHAR(30) NULL;
      IF COL_LENGTH('dbo.inventory_out', 'business_type') IS NULL ALTER TABLE dbo.inventory_out ADD business_type VARCHAR(30) NULL;
      IF COL_LENGTH('dbo.inventory_out', 'approved_at') IS NULL ALTER TABLE dbo.inventory_out ADD approved_at DATETIME NULL;
      IF COL_LENGTH('dbo.inventory_out', 'approved_by') IS NULL ALTER TABLE dbo.inventory_out ADD approved_by VARCHAR(50) NULL;
      IF COL_LENGTH('dbo.inventory_out', 'asset_card_generation_status') IS NULL ALTER TABLE dbo.inventory_out ADD asset_card_generation_status VARCHAR(30) NOT NULL CONSTRAINT DF_inventory_out_card_status DEFAULT 'NOT_REQUIRED';
      IF COL_LENGTH('dbo.inventory_out', 'asset_card_generation_error') IS NULL ALTER TABLE dbo.inventory_out ADD asset_card_generation_error NVARCHAR(1000) NULL;
      IF COL_LENGTH('dbo.inventory_out', 'asset_card_generation_failed_at') IS NULL ALTER TABLE dbo.inventory_out ADD asset_card_generation_failed_at DATETIME NULL;
      IF COL_LENGTH('dbo.inventory_out', 'asset_card_generated_at') IS NULL ALTER TABLE dbo.inventory_out ADD asset_card_generated_at DATETIME NULL;
    `);
    await queryRunner.query(`IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.inventory_out') AND name=N'UQ_inventory_out_push_idempotency') CREATE UNIQUE INDEX UQ_inventory_out_push_idempotency ON dbo.inventory_out(push_idempotency_key) WHERE push_idempotency_key IS NOT NULL;`);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.inventory_out_entry', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.inventory_out_entry (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_inventory_out_entry PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          inventory_out_id UNIQUEIDENTIFIER NOT NULL, line_no INT NOT NULL, warehouse_id VARCHAR(36) NOT NULL,
          material_id VARCHAR(36) NOT NULL, material_code VARCHAR(50) NOT NULL, material_name NVARCHAR(200) NOT NULL,
          material_model NVARCHAR(200) NULL, unit_id VARCHAR(36) NOT NULL, unit_code VARCHAR(50) NULL, unit_name NVARCHAR(50) NULL,
          quantity DECIMAL(18,4) NOT NULL, unit_price DECIMAL(18,4) NOT NULL, amount DECIMAL(18,2) NOT NULL, lot_no VARCHAR(100) NULL,
          source_asset_out_request_entry_id VARCHAR(36) NULL, source_asset_acceptance_id VARCHAR(36) NULL,
          source_asset_acceptance_entry_id VARCHAR(36) NULL, source_inventory_in_entry_id VARCHAR(36) NULL,
          source_order_id VARCHAR(36) NULL, source_order_entry_id VARCHAR(36) NULL,
          source_request_id VARCHAR(36) NULL, source_request_entry_id VARCHAR(36) NULL,
          asset_category_code VARCHAR(50) NULL, department_id VARCHAR(36) NULL, custodian_id VARCHAR(36) NULL,
          location NVARCHAR(200) NULL, inventory_posting_id VARCHAR(36) NULL,
          created_by VARCHAR(50) NULL, updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_inventory_out_entry_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_inventory_out_entry_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_inventory_out_entry_deleted DEFAULT 0,
          CONSTRAINT FK_inventory_out_entry_header FOREIGN KEY (inventory_out_id) REFERENCES dbo.inventory_out(id) ON DELETE CASCADE
        );
      END;
    `);
    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.inventory_out_entry') AND name=N'UQ_inventory_out_entry_line') CREATE UNIQUE INDEX UQ_inventory_out_entry_line ON dbo.inventory_out_entry(inventory_out_id, line_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.inventory_out_entry') AND name=N'UQ_inventory_out_entry_request') CREATE UNIQUE INDEX UQ_inventory_out_entry_request ON dbo.inventory_out_entry(source_asset_out_request_entry_id) WHERE source_asset_out_request_entry_id IS NOT NULL;
    `);

    await queryRunner.query(`
      IF COL_LENGTH('dbo.fin_fixed_asset', 'source_type') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD source_type VARCHAR(30) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'source_id') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD source_id VARCHAR(36) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'source_no') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD source_no VARCHAR(50) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'source_entry_id') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD source_entry_id VARCHAR(36) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'source_sequence') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD source_sequence INT NOT NULL CONSTRAINT DF_fixed_asset_source_sequence DEFAULT 1;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'asset_acceptance_id') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD asset_acceptance_id VARCHAR(36) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'asset_acceptance_entry_id') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD asset_acceptance_entry_id VARCHAR(36) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'inventory_out_id') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD inventory_out_id VARCHAR(36) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'inventory_out_entry_id') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD inventory_out_entry_id VARCHAR(36) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'purchase_order_id') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD purchase_order_id VARCHAR(36) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'purchase_order_entry_id') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD purchase_order_entry_id VARCHAR(36) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'purchase_request_id') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD purchase_request_id VARCHAR(36) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'purchase_request_entry_id') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD purchase_request_entry_id VARCHAR(36) NULL;
      IF COL_LENGTH('dbo.fin_fixed_asset', 'quantity') IS NULL ALTER TABLE dbo.fin_fixed_asset ADD quantity DECIMAL(18,4) NOT NULL CONSTRAINT DF_fixed_asset_quantity DEFAULT 1;
    `);
    await queryRunner.query(`IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.fin_fixed_asset') AND name=N'UQ_fin_fixed_asset_purchase_source') CREATE UNIQUE INDEX UQ_fin_fixed_asset_purchase_source ON dbo.fin_fixed_asset(source_type, source_entry_id, source_sequence) WHERE source_entry_id IS NOT NULL;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') return;
    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.inventory_out_entry', N'U') IS NOT NULL DROP TABLE dbo.inventory_out_entry;
      IF OBJECT_ID(N'dbo.biz_asset_out_request_entry', N'U') IS NOT NULL DROP TABLE dbo.biz_asset_out_request_entry;
      IF OBJECT_ID(N'dbo.biz_asset_out_request', N'U') IS NOT NULL DROP TABLE dbo.biz_asset_out_request;
      IF OBJECT_ID(N'dbo.biz_asset_acceptance_entry', N'U') IS NOT NULL DROP TABLE dbo.biz_asset_acceptance_entry;
      IF OBJECT_ID(N'dbo.biz_asset_acceptance', N'U') IS NOT NULL DROP TABLE dbo.biz_asset_acceptance;
      IF OBJECT_ID(N'dbo.fin_asset_category', N'U') IS NOT NULL DROP TABLE dbo.fin_asset_category;
    `);
  }
}
