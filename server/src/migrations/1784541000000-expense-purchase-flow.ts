import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpensePurchaseFlow1784541000000 implements MigrationInterface {
  name = 'ExpensePurchaseFlow1784541000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') {
      throw new Error('ExpensePurchaseFlow1784541000000 当前仅提供 MSSQL 迁移实现');
    }

    await queryRunner.query(`
      IF COL_LENGTH('dbo.purchase_request_entry', 'expense_item_code') IS NULL
        ALTER TABLE dbo.purchase_request_entry ADD expense_item_code VARCHAR(50) NULL;
      IF COL_LENGTH('dbo.purchase_request_entry', 'expense_item_name') IS NULL
        ALTER TABLE dbo.purchase_request_entry ADD expense_item_name VARCHAR(200) NULL;
      IF COL_LENGTH('dbo.biz_purchase_order_entry', 'expense_item_code') IS NULL
        ALTER TABLE dbo.biz_purchase_order_entry ADD expense_item_code VARCHAR(50) NULL;
      IF COL_LENGTH('dbo.biz_purchase_order_entry', 'expense_item_name') IS NULL
        ALTER TABLE dbo.biz_purchase_order_entry ADD expense_item_name VARCHAR(200) NULL;
      IF COL_LENGTH('dbo.biz_purchase_receive_notice_entry', 'expense_item_code') IS NULL
        ALTER TABLE dbo.biz_purchase_receive_notice_entry ADD expense_item_code VARCHAR(50) NULL;
      IF COL_LENGTH('dbo.biz_purchase_receive_notice_entry', 'expense_item_name') IS NULL
        ALTER TABLE dbo.biz_purchase_receive_notice_entry ADD expense_item_name VARCHAR(200) NULL;
      IF COL_LENGTH('dbo.biz_purchase_receive_notice_entry', 'expense_accepted_qty') IS NULL
        ALTER TABLE dbo.biz_purchase_receive_notice_entry
          ADD expense_accepted_qty DECIMAL(18,4) NOT NULL
          CONSTRAINT DF_receive_entry_expense_accepted DEFAULT 0;
      IF COL_LENGTH('dbo.fin_payable_entry', 'expense_acceptance_entry_id') IS NULL
        ALTER TABLE dbo.fin_payable_entry ADD expense_acceptance_entry_id VARCHAR(36) NULL;
      IF COL_LENGTH('dbo.fin_payable_entry', 'expense_item_code') IS NULL
        ALTER TABLE dbo.fin_payable_entry ADD expense_item_code VARCHAR(50) NULL;
      IF COL_LENGTH('dbo.fin_payable_entry', 'expense_item_name') IS NULL
        ALTER TABLE dbo.fin_payable_entry ADD expense_item_name VARCHAR(200) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE dbo.purchase_request_entry ALTER COLUMN material_id VARCHAR(36) NULL;
      ALTER TABLE dbo.purchase_request_entry ALTER COLUMN material_code VARCHAR(50) NULL;
      ALTER TABLE dbo.purchase_request_entry ALTER COLUMN material_name VARCHAR(200) NULL;
      ALTER TABLE dbo.purchase_request_entry ALTER COLUMN unit_id VARCHAR(36) NULL;
      ALTER TABLE dbo.biz_purchase_order_entry ALTER COLUMN material_id VARCHAR(36) NULL;
      ALTER TABLE dbo.biz_purchase_order_entry ALTER COLUMN material_code VARCHAR(50) NULL;
      ALTER TABLE dbo.biz_purchase_order_entry ALTER COLUMN material_name VARCHAR(200) NULL;
      ALTER TABLE dbo.biz_purchase_order_entry ALTER COLUMN unit_id VARCHAR(36) NULL;
      ALTER TABLE dbo.biz_purchase_receive_notice_entry ALTER COLUMN material_id VARCHAR(36) NULL;
      ALTER TABLE dbo.biz_purchase_receive_notice_entry ALTER COLUMN material_code VARCHAR(50) NULL;
      ALTER TABLE dbo.biz_purchase_receive_notice_entry ALTER COLUMN material_name VARCHAR(200) NULL;
      ALTER TABLE dbo.biz_purchase_receive_notice_entry ALTER COLUMN unit_id VARCHAR(36) NULL;
      ALTER TABLE dbo.fin_payable_entry ALTER COLUMN material_id VARCHAR(36) NULL;
      ALTER TABLE dbo.fin_payable_entry ALTER COLUMN material_code VARCHAR(50) NULL;
      ALTER TABLE dbo.fin_payable_entry ALTER COLUMN material_name VARCHAR(200) NULL;
      ALTER TABLE dbo.fin_payable_entry ALTER COLUMN unit_id VARCHAR(36) NULL;
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_expense_acceptance', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_expense_acceptance (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_expense_acceptance PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          acceptance_no VARCHAR(50) NOT NULL,
          idempotency_key VARCHAR(100) NOT NULL,
          payload_hash VARCHAR(64) NOT NULL,
          business_type VARCHAR(30) NOT NULL CONSTRAINT DF_expense_acceptance_business DEFAULT 'EXPENSE_PURCHASE',
          source_receive_notice_id VARCHAR(36) NOT NULL,
          source_receive_notice_no VARCHAR(50) NOT NULL,
          org_id VARCHAR(36) NOT NULL,
          purchase_org_id VARCHAR(36) NOT NULL,
          settle_org_id VARCHAR(36) NOT NULL,
          supplier_id VARCHAR(36) NOT NULL,
          currency_id VARCHAR(36) NOT NULL,
          payment_term_id VARCHAR(36) NOT NULL,
          acceptance_date DATETIME NOT NULL,
          department_id VARCHAR(36) NULL,
          acceptor_id VARCHAR(36) NULL,
          amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_expense_acceptance_amount DEFAULT 0,
          tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_expense_acceptance_tax DEFAULT 0,
          total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_expense_acceptance_total DEFAULT 0,
          status INT NOT NULL CONSTRAINT DF_expense_acceptance_status DEFAULT 0,
          approved_at DATETIME NULL,
          approved_by VARCHAR(50) NULL,
          payable_generation_status VARCHAR(30) NOT NULL CONSTRAINT DF_expense_acceptance_payable_status DEFAULT 'NOT_GENERATED',
          payable_id VARCHAR(36) NULL,
          payable_no VARCHAR(50) NULL,
          payable_generation_error VARCHAR(1000) NULL,
          payable_generation_failed_at DATETIME NULL,
          payable_generated_at DATETIME NULL,
          remark VARCHAR(1000) NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_expense_acceptance_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_expense_acceptance_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_expense_acceptance_deleted DEFAULT 0
        );
      END;
    `);

    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.biz_expense_acceptance')
          AND name = N'UQ_expense_acceptance_no'
      )
        CREATE UNIQUE INDEX UQ_expense_acceptance_no
          ON dbo.biz_expense_acceptance(acceptance_no);
      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.biz_expense_acceptance')
          AND name = N'UQ_expense_acceptance_idempotency'
      )
        CREATE UNIQUE INDEX UQ_expense_acceptance_idempotency
          ON dbo.biz_expense_acceptance(idempotency_key);
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_expense_acceptance_entry', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_expense_acceptance_entry (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_expense_acceptance_entry PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          expense_acceptance_id UNIQUEIDENTIFIER NOT NULL,
          line_no INT NOT NULL,
          source_receive_notice_id VARCHAR(36) NOT NULL,
          source_receive_notice_entry_id VARCHAR(36) NOT NULL,
          source_order_id VARCHAR(36) NOT NULL,
          source_order_entry_id VARCHAR(36) NOT NULL,
          source_request_id VARCHAR(36) NULL,
          source_request_entry_id VARCHAR(36) NULL,
          expense_item_code VARCHAR(50) NULL,
          expense_item_name VARCHAR(200) NOT NULL,
          material_id VARCHAR(36) NULL,
          material_code VARCHAR(50) NULL,
          material_name VARCHAR(200) NULL,
          material_model VARCHAR(200) NULL,
          unit_id VARCHAR(36) NULL,
          unit_code VARCHAR(50) NULL,
          unit_name VARCHAR(50) NULL,
          acceptance_qty DECIMAL(18,4) NOT NULL,
          unit_price DECIMAL(18,4) NOT NULL,
          tax_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_expense_acceptance_entry_rate DEFAULT 0,
          amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_expense_acceptance_entry_amount DEFAULT 0,
          tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_expense_acceptance_entry_tax DEFAULT 0,
          total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_expense_acceptance_entry_total DEFAULT 0,
          department_id VARCHAR(36) NULL,
          remark VARCHAR(500) NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_expense_acceptance_entry_created DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_expense_acceptance_entry_updated DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_expense_acceptance_entry_deleted DEFAULT 0,
          CONSTRAINT FK_expense_acceptance_entry_header
            FOREIGN KEY (expense_acceptance_id)
            REFERENCES dbo.biz_expense_acceptance(id) ON DELETE CASCADE
        );
      END;
    `);

    await queryRunner.query(`
      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.biz_expense_acceptance_entry')
          AND name = N'UQ_expense_acceptance_entry_line'
      )
        CREATE UNIQUE INDEX UQ_expense_acceptance_entry_line
          ON dbo.biz_expense_acceptance_entry(expense_acceptance_id, line_no);
      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.biz_expense_acceptance_entry')
          AND name = N'IDX_expense_acceptance_entry_receive'
      )
        CREATE INDEX IDX_expense_acceptance_entry_receive
          ON dbo.biz_expense_acceptance_entry(source_receive_notice_entry_id);
      IF NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.fin_payable_entry')
          AND name = N'UQ_fin_payable_entry_expense_acceptance'
      )
        CREATE UNIQUE INDEX UQ_fin_payable_entry_expense_acceptance
          ON dbo.fin_payable_entry(expense_acceptance_entry_id)
          WHERE expense_acceptance_entry_id IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') return;

    await queryRunner.query(`
      DELETE FROM dbo.fin_payable_entry
        WHERE expense_acceptance_entry_id IS NOT NULL;
      DELETE FROM dbo.fin_payable
        WHERE payable_type = 'ESTIMATED' AND source_type = 'EXPENSE_ACCEPTANCE';
      IF OBJECT_ID(N'dbo.biz_expense_acceptance_entry', N'U') IS NOT NULL
        DROP TABLE dbo.biz_expense_acceptance_entry;
      IF OBJECT_ID(N'dbo.biz_expense_acceptance', N'U') IS NOT NULL
        DROP TABLE dbo.biz_expense_acceptance;
    `);

    await queryRunner.query(`
      DELETE entry
        FROM dbo.biz_purchase_receive_notice_entry entry
        INNER JOIN dbo.biz_purchase_receive_notice header
          ON header.id = entry.purchase_receive_notice_id
        WHERE header.business_type = 'EXPENSE_PURCHASE';
      DELETE FROM dbo.biz_purchase_receive_notice
        WHERE business_type = 'EXPENSE_PURCHASE';
      DELETE entry
        FROM dbo.biz_purchase_order_entry entry
        INNER JOIN dbo.biz_purchase_order header
          ON header.id = entry.purchase_order_id
        WHERE header.business_type = 'EXPENSE_PURCHASE';
      DELETE FROM dbo.biz_purchase_order
        WHERE business_type = 'EXPENSE_PURCHASE';
      DELETE entry
        FROM dbo.purchase_request_entry entry
        INNER JOIN dbo.purchase_request header
          ON header.id = entry.purchase_request_id
        WHERE header.business_type = 'EXPENSE_PURCHASE';
      DELETE FROM dbo.purchase_request
        WHERE business_type = 'EXPENSE_PURCHASE';
    `);

    await queryRunner.query(`
      IF EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE object_id = OBJECT_ID(N'dbo.fin_payable_entry')
          AND name = N'UQ_fin_payable_entry_expense_acceptance'
      )
        DROP INDEX UQ_fin_payable_entry_expense_acceptance ON dbo.fin_payable_entry;
      IF COL_LENGTH('dbo.fin_payable_entry', 'expense_acceptance_entry_id') IS NOT NULL
        ALTER TABLE dbo.fin_payable_entry DROP COLUMN expense_acceptance_entry_id;
      IF COL_LENGTH('dbo.fin_payable_entry', 'expense_item_code') IS NOT NULL
        ALTER TABLE dbo.fin_payable_entry DROP COLUMN expense_item_code;
      IF COL_LENGTH('dbo.fin_payable_entry', 'expense_item_name') IS NOT NULL
        ALTER TABLE dbo.fin_payable_entry DROP COLUMN expense_item_name;
      IF COL_LENGTH('dbo.biz_purchase_receive_notice_entry', 'expense_accepted_qty') IS NOT NULL
        ALTER TABLE dbo.biz_purchase_receive_notice_entry DROP CONSTRAINT DF_receive_entry_expense_accepted;
      IF COL_LENGTH('dbo.biz_purchase_receive_notice_entry', 'expense_accepted_qty') IS NOT NULL
        ALTER TABLE dbo.biz_purchase_receive_notice_entry DROP COLUMN expense_accepted_qty;
      IF COL_LENGTH('dbo.biz_purchase_receive_notice_entry', 'expense_item_code') IS NOT NULL
        ALTER TABLE dbo.biz_purchase_receive_notice_entry DROP COLUMN expense_item_code;
      IF COL_LENGTH('dbo.biz_purchase_receive_notice_entry', 'expense_item_name') IS NOT NULL
        ALTER TABLE dbo.biz_purchase_receive_notice_entry DROP COLUMN expense_item_name;
      IF COL_LENGTH('dbo.biz_purchase_order_entry', 'expense_item_code') IS NOT NULL
        ALTER TABLE dbo.biz_purchase_order_entry DROP COLUMN expense_item_code;
      IF COL_LENGTH('dbo.biz_purchase_order_entry', 'expense_item_name') IS NOT NULL
        ALTER TABLE dbo.biz_purchase_order_entry DROP COLUMN expense_item_name;
      IF COL_LENGTH('dbo.purchase_request_entry', 'expense_item_code') IS NOT NULL
        ALTER TABLE dbo.purchase_request_entry DROP COLUMN expense_item_code;
      IF COL_LENGTH('dbo.purchase_request_entry', 'expense_item_name') IS NOT NULL
        ALTER TABLE dbo.purchase_request_entry DROP COLUMN expense_item_name;
    `);

    await queryRunner.query(`
      ALTER TABLE dbo.purchase_request_entry ALTER COLUMN material_id VARCHAR(36) NOT NULL;
      ALTER TABLE dbo.purchase_request_entry ALTER COLUMN material_code VARCHAR(50) NOT NULL;
      ALTER TABLE dbo.purchase_request_entry ALTER COLUMN material_name VARCHAR(200) NOT NULL;
      ALTER TABLE dbo.purchase_request_entry ALTER COLUMN unit_id VARCHAR(36) NOT NULL;
      ALTER TABLE dbo.biz_purchase_order_entry ALTER COLUMN material_id VARCHAR(36) NOT NULL;
      ALTER TABLE dbo.biz_purchase_order_entry ALTER COLUMN material_code VARCHAR(50) NOT NULL;
      ALTER TABLE dbo.biz_purchase_order_entry ALTER COLUMN material_name VARCHAR(200) NOT NULL;
      ALTER TABLE dbo.biz_purchase_order_entry ALTER COLUMN unit_id VARCHAR(36) NOT NULL;
      ALTER TABLE dbo.biz_purchase_receive_notice_entry ALTER COLUMN material_id VARCHAR(36) NOT NULL;
      ALTER TABLE dbo.biz_purchase_receive_notice_entry ALTER COLUMN material_code VARCHAR(50) NOT NULL;
      ALTER TABLE dbo.biz_purchase_receive_notice_entry ALTER COLUMN material_name VARCHAR(200) NOT NULL;
      ALTER TABLE dbo.biz_purchase_receive_notice_entry ALTER COLUMN unit_id VARCHAR(36) NOT NULL;
      ALTER TABLE dbo.fin_payable_entry ALTER COLUMN material_id VARCHAR(36) NOT NULL;
      ALTER TABLE dbo.fin_payable_entry ALTER COLUMN material_code VARCHAR(50) NOT NULL;
      ALTER TABLE dbo.fin_payable_entry ALTER COLUMN material_name VARCHAR(200) NOT NULL;
      ALTER TABLE dbo.fin_payable_entry ALTER COLUMN unit_id VARCHAR(36) NOT NULL;
    `);
  }
}
