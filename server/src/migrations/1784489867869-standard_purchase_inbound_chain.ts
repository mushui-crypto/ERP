import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 标准采购主链 P0：收料通知下推采购入库、库存过账、采购入库审核生成暂估应付。
 * 当前生产数据库为 MSSQL；迁移使用条件 DDL，便于在已有 ERP 表上安全补列。
 */
export class StandardPurchaseInboundChain1784489867869 implements MigrationInterface {
  name = 'StandardPurchaseInboundChain1784489867869';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') {
      throw new Error('StandardPurchaseInboundChain1784489867869 当前仅提供 MSSQL 迁移实现');
    }

    await this.extendInventoryInHeader(queryRunner);
    await this.createInventoryInEntry(queryRunner);
    await this.extendInventoryAndCreatePosting(queryRunner);
    await this.extendPayable(queryRunner);
    await this.createPayableEntry(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') return;

    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.fin_payable') AND name = N'UQ_fin_payable_estimate_source')
        DROP INDEX UQ_fin_payable_estimate_source ON dbo.fin_payable;
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.inventory_in') AND name = N'UQ_inventory_in_push_idempotency_key')
        DROP INDEX UQ_inventory_in_push_idempotency_key ON dbo.inventory_in;
      IF OBJECT_ID(N'dbo.fin_payable_entry', N'U') IS NOT NULL DROP TABLE dbo.fin_payable_entry;
      IF OBJECT_ID(N'dbo.biz_inventory_posting', N'U') IS NOT NULL DROP TABLE dbo.biz_inventory_posting;
      IF OBJECT_ID(N'dbo.inventory_in_entry', N'U') IS NOT NULL DROP TABLE dbo.inventory_in_entry;
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_inventory') AND name = N'UQ_biz_inventory_dimension_key')
        DROP INDEX UQ_biz_inventory_dimension_key ON dbo.biz_inventory;
    `);

    await this.dropColumns(queryRunner, 'inventory_in', [
      'push_idempotency_key', 'push_payload_hash', 'stock_org_id', 'purchase_org_id', 'settle_org_id',
      'owner_type', 'owner_id', 'business_type', 'source_type', 'currency_id', 'payment_term_id',
      'tax_amount', 'total_amount', 'approved_at', 'approved_by', 'payable_generation_status',
      'payable_id', 'payable_no', 'payable_generation_error', 'payable_generation_failed_at', 'payable_generated_at',
    ]);
    await this.dropColumns(queryRunner, 'biz_inventory', ['dimension_key']);
    await this.dropColumns(queryRunner, 'fin_payable', [
      'payable_type', 'source_no', 'currency_id', 'settle_org_id', 'payment_term_id', 'untaxed_amount', 'tax_amount',
    ]);
  }

  private async extendInventoryInHeader(queryRunner: QueryRunner) {
    const additions: Array<[string, string]> = [
      ['push_idempotency_key', 'VARCHAR(100) NULL'],
      ['push_payload_hash', 'VARCHAR(64) NULL'],
      ['stock_org_id', 'VARCHAR(36) NULL'],
      ['purchase_org_id', 'VARCHAR(36) NULL'],
      ['settle_org_id', 'VARCHAR(36) NULL'],
      ['owner_type', 'VARCHAR(50) NULL'],
      ['owner_id', 'VARCHAR(36) NULL'],
      ['business_type', 'VARCHAR(50) NULL'],
      ['source_type', 'VARCHAR(50) NULL'],
      ['currency_id', 'VARCHAR(36) NULL'],
      ['payment_term_id', 'VARCHAR(36) NULL'],
      ['tax_amount', 'DECIMAL(18,2) NOT NULL CONSTRAINT DF_inventory_in_tax_amount DEFAULT 0'],
      ['total_amount', 'DECIMAL(18,2) NOT NULL CONSTRAINT DF_inventory_in_total_amount DEFAULT 0'],
      ['approved_at', 'DATETIME NULL'],
      ['approved_by', 'VARCHAR(50) NULL'],
      ['payable_generation_status', "VARCHAR(30) NOT NULL CONSTRAINT DF_inventory_in_payable_generation_status DEFAULT 'NOT_GENERATED'"],
      ['payable_id', 'VARCHAR(36) NULL'],
      ['payable_no', 'VARCHAR(50) NULL'],
      ['payable_generation_error', 'NVARCHAR(1000) NULL'],
      ['payable_generation_failed_at', 'DATETIME NULL'],
      ['payable_generated_at', 'DATETIME NULL'],
    ];
    for (const [column, definition] of additions) {
      await this.addColumnIfMissing(queryRunner, 'inventory_in', column, definition);
    }

    await queryRunner.query(`
      IF COL_LENGTH('dbo.inventory_in', 'total_amount') IS NOT NULL
        UPDATE dbo.inventory_in SET total_amount = ISNULL(amount, 0) WHERE total_amount IS NULL OR total_amount = 0;
      IF COL_LENGTH('dbo.inventory_in', 'payable_generation_status') IS NOT NULL
        UPDATE dbo.inventory_in SET payable_generation_status = 'NOT_GENERATED' WHERE payable_generation_status IS NULL OR payable_generation_status = '';
    `);

    const nullableCompatibilityColumns: Array<[string, string]> = [
      ['warehouse_id', 'VARCHAR(36) NULL'],
      ['warehouse_code', 'VARCHAR(50) NULL'],
      ['warehouse_name', 'VARCHAR(200) NULL'],
      ['source_id', 'VARCHAR(36) NULL'],
      ['source_no', 'VARCHAR(50) NULL'],
      ['supplier_id', 'VARCHAR(36) NULL'],
      ['supplier_code', 'VARCHAR(50) NULL'],
      ['supplier_name', 'VARCHAR(200) NULL'],
      ['material_id', 'VARCHAR(36) NULL'],
      ['material_code', 'VARCHAR(50) NULL'],
      ['material_name', 'VARCHAR(200) NULL'],
      ['spec', 'VARCHAR(200) NULL'],
      ['unit_id', 'VARCHAR(36) NULL'],
      ['unit_code', 'VARCHAR(50) NULL'],
      ['unit_name', 'VARCHAR(50) NULL'],
      ['quantity', 'DECIMAL(18,4) NULL'],
      ['unit_price', 'DECIMAL(18,4) NULL'],
      ['lot_no', 'VARCHAR(50) NULL'],
      ['expire_date', 'DATETIME NULL'],
      ['location', 'VARCHAR(100) NULL'],
    ];
    for (const [column, definition] of nullableCompatibilityColumns) {
      await this.alterColumnIfPresent(queryRunner, 'inventory_in', column, definition);
    }

    await queryRunner.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.inventory_in') AND name = N'UQ_inventory_in_push_idempotency_key')
        CREATE UNIQUE INDEX UQ_inventory_in_push_idempotency_key
          ON dbo.inventory_in(push_idempotency_key)
          WHERE push_idempotency_key IS NOT NULL;
    `);
  }

  private async createInventoryInEntry(queryRunner: QueryRunner) {
    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.inventory_in_entry', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.inventory_in_entry (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_inventory_in_entry PRIMARY KEY,
          inventory_in_id UNIQUEIDENTIFIER NOT NULL,
          line_no INT NOT NULL,
          warehouse_id VARCHAR(36) NOT NULL,
          warehouse_code VARCHAR(50) NULL,
          warehouse_name VARCHAR(200) NULL,
          material_id VARCHAR(36) NOT NULL,
          material_code VARCHAR(50) NOT NULL,
          material_name VARCHAR(200) NOT NULL,
          material_model VARCHAR(200) NULL,
          unit_id VARCHAR(36) NOT NULL,
          unit_code VARCHAR(50) NULL,
          unit_name VARCHAR(50) NULL,
          quantity DECIMAL(18,4) NOT NULL,
          unit_price DECIMAL(18,4) NOT NULL,
          tax_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_inventory_in_entry_tax_rate DEFAULT 0,
          amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_inventory_in_entry_amount DEFAULT 0,
          tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_inventory_in_entry_tax_amount DEFAULT 0,
          total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_inventory_in_entry_total_amount DEFAULT 0,
          lot_no VARCHAR(100) NULL,
          produce_date DATETIME NULL,
          expiry_date DATETIME NULL,
          location VARCHAR(100) NULL,
          source_receive_notice_id VARCHAR(36) NOT NULL,
          source_receive_notice_no VARCHAR(50) NOT NULL,
          source_receive_notice_entry_id VARCHAR(36) NOT NULL,
          source_order_id VARCHAR(36) NOT NULL,
          source_order_no VARCHAR(50) NOT NULL,
          source_order_entry_id VARCHAR(36) NOT NULL,
          source_request_id VARCHAR(36) NULL,
          source_request_no VARCHAR(50) NULL,
          source_request_entry_id VARCHAR(36) NULL,
          inventory_posting_id VARCHAR(36) NULL,
          remark VARCHAR(500) NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME NOT NULL CONSTRAINT DF_inventory_in_entry_created_at DEFAULT GETDATE(),
          updated_at DATETIME NOT NULL CONSTRAINT DF_inventory_in_entry_updated_at DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_inventory_in_entry_is_deleted DEFAULT 0,
          CONSTRAINT FK_inventory_in_entry_header FOREIGN KEY (inventory_in_id) REFERENCES dbo.inventory_in(id) ON DELETE CASCADE
        );
      END;

      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.inventory_in_entry') AND name = N'UQ_inventory_in_entry_header_line')
        CREATE UNIQUE INDEX UQ_inventory_in_entry_header_line ON dbo.inventory_in_entry(inventory_in_id, line_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.inventory_in_entry') AND name = N'IDX_inventory_in_entry_receive_entry')
        CREATE INDEX IDX_inventory_in_entry_receive_entry ON dbo.inventory_in_entry(source_receive_notice_entry_id);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.inventory_in_entry') AND name = N'IDX_inventory_in_entry_order_entry')
        CREATE INDEX IDX_inventory_in_entry_order_entry ON dbo.inventory_in_entry(source_order_entry_id);
    `);
  }

  private async extendInventoryAndCreatePosting(queryRunner: QueryRunner) {
    await this.addColumnIfMissing(queryRunner, 'biz_inventory', 'dimension_key', 'VARCHAR(255) NULL');
    await this.alterColumnIfPresent(queryRunner, 'biz_inventory', 'batch_no', 'VARCHAR(100) NULL');

    await queryRunner.query(`
      IF COL_LENGTH('dbo.biz_inventory', 'dimension_key') IS NOT NULL
      BEGIN
        UPDATE dbo.biz_inventory
        SET dimension_key = CONCAT(
          warehouse_id, '::', material_id, '::', ISNULL(batch_no, ''),
          CASE WHEN ISNULL(is_deleted, 0) <> 0 THEN CONCAT('::deleted::', id) ELSE '' END
        )
        WHERE dimension_key IS NULL OR dimension_key = '';

        IF EXISTS (
          SELECT dimension_key FROM dbo.biz_inventory
          GROUP BY dimension_key HAVING COUNT(1) > 1
        )
          THROW 50001, 'biz_inventory 存在重复仓库+物料+批次维度，请清理重复库存后重试迁移', 1;

        IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_inventory') AND name = N'UQ_biz_inventory_dimension_key')
          DROP INDEX UQ_biz_inventory_dimension_key ON dbo.biz_inventory;
        ALTER TABLE dbo.biz_inventory ALTER COLUMN dimension_key VARCHAR(255) NOT NULL;
        CREATE UNIQUE INDEX UQ_biz_inventory_dimension_key ON dbo.biz_inventory(dimension_key);
      END;
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_inventory_posting', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_inventory_posting (
          id VARCHAR(36) NOT NULL CONSTRAINT PK_biz_inventory_posting PRIMARY KEY,
          source_type VARCHAR(50) NOT NULL,
          source_id VARCHAR(36) NOT NULL,
          source_entry_id VARCHAR(36) NOT NULL,
          inventory_id VARCHAR(36) NOT NULL,
          warehouse_id VARCHAR(36) NOT NULL,
          material_id VARCHAR(36) NOT NULL,
          batch_no VARCHAR(100) NOT NULL CONSTRAINT DF_biz_inventory_posting_batch_no DEFAULT '',
          quantity DECIMAL(18,4) NOT NULL,
          amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_biz_inventory_posting_amount DEFAULT 0,
          posted_at DATETIME NOT NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME NOT NULL CONSTRAINT DF_biz_inventory_posting_created_at DEFAULT GETDATE(),
          updated_at DATETIME NOT NULL CONSTRAINT DF_biz_inventory_posting_updated_at DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_biz_inventory_posting_is_deleted DEFAULT 0
        );
      END;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.biz_inventory_posting') AND name = N'UQ_biz_inventory_posting_source_entry')
        CREATE UNIQUE INDEX UQ_biz_inventory_posting_source_entry ON dbo.biz_inventory_posting(source_type, source_entry_id);
    `);
  }

  private async extendPayable(queryRunner: QueryRunner) {
    const additions: Array<[string, string]> = [
      ['payable_type', "VARCHAR(30) NOT NULL CONSTRAINT DF_fin_payable_payable_type DEFAULT 'STANDARD'"],
      ['source_type', "VARCHAR(50) NOT NULL CONSTRAINT DF_fin_payable_source_type DEFAULT 'LEGACY'"],
      ['source_id', 'VARCHAR(36) NULL'],
      ['source_no', 'VARCHAR(50) NULL'],
      ['currency_id', 'VARCHAR(36) NULL'],
      ['settle_org_id', 'VARCHAR(36) NULL'],
      ['payment_term_id', 'VARCHAR(36) NULL'],
      ['untaxed_amount', 'DECIMAL(18,2) NOT NULL CONSTRAINT DF_fin_payable_untaxed_amount DEFAULT 0'],
      ['tax_amount', 'DECIMAL(18,2) NOT NULL CONSTRAINT DF_fin_payable_tax_amount DEFAULT 0'],
    ];
    for (const [column, definition] of additions) {
      await this.addColumnIfMissing(queryRunner, 'fin_payable', column, definition);
    }

    await queryRunner.query(`
      UPDATE dbo.fin_payable SET payable_type = 'STANDARD' WHERE payable_type IS NULL OR payable_type = '';
      UPDATE dbo.fin_payable SET source_type = 'LEGACY' WHERE source_type IS NULL OR source_type = '';
      UPDATE dbo.fin_payable SET source_id = id WHERE source_id IS NULL OR source_id = '';
      UPDATE dbo.fin_payable SET untaxed_amount = ISNULL(amount, 0) WHERE untaxed_amount IS NULL OR untaxed_amount = 0;
      UPDATE dbo.fin_payable SET tax_amount = 0 WHERE tax_amount IS NULL;

      IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.fin_payable') AND name = N'UQ_fin_payable_estimate_source')
        DROP INDEX UQ_fin_payable_estimate_source ON dbo.fin_payable;

      DECLARE @payableTypeDefault NVARCHAR(128);
      SELECT @payableTypeDefault = dc.name
      FROM sys.default_constraints dc
      JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
      WHERE dc.parent_object_id = OBJECT_ID(N'dbo.fin_payable') AND c.name = N'payable_type';
      IF @payableTypeDefault IS NOT NULL
        EXEC(N'ALTER TABLE dbo.fin_payable DROP CONSTRAINT [' + @payableTypeDefault + N']');

      DECLARE @sourceTypeDefault NVARCHAR(128);
      SELECT @sourceTypeDefault = dc.name
      FROM sys.default_constraints dc
      JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
      WHERE dc.parent_object_id = OBJECT_ID(N'dbo.fin_payable') AND c.name = N'source_type';
      IF @sourceTypeDefault IS NOT NULL
        EXEC(N'ALTER TABLE dbo.fin_payable DROP CONSTRAINT [' + @sourceTypeDefault + N']');

      DECLARE @sourceIdDefault NVARCHAR(128);
      SELECT @sourceIdDefault = dc.name
      FROM sys.default_constraints dc
      JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
      WHERE dc.parent_object_id = OBJECT_ID(N'dbo.fin_payable') AND c.name = N'source_id';
      IF @sourceIdDefault IS NOT NULL
        EXEC(N'ALTER TABLE dbo.fin_payable DROP CONSTRAINT [' + @sourceIdDefault + N']');

      ALTER TABLE dbo.fin_payable ALTER COLUMN payable_type VARCHAR(30) NOT NULL;
      ALTER TABLE dbo.fin_payable ALTER COLUMN source_type VARCHAR(50) NOT NULL;
      ALTER TABLE dbo.fin_payable ALTER COLUMN source_id VARCHAR(36) NOT NULL;

      IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID(N'dbo.fin_payable') AND c.name = N'payable_type'
      )
        ALTER TABLE dbo.fin_payable ADD CONSTRAINT DF_fin_payable_payable_type DEFAULT 'STANDARD' FOR payable_type;

      IF NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID(N'dbo.fin_payable') AND c.name = N'source_type'
      )
        ALTER TABLE dbo.fin_payable ADD CONSTRAINT DF_fin_payable_source_type DEFAULT 'LEGACY' FOR source_type;

      IF EXISTS (
        SELECT payable_type, source_type, source_id FROM dbo.fin_payable
        GROUP BY payable_type, source_type, source_id HAVING COUNT(1) > 1
      )
        THROW 50002, 'fin_payable 存在重复来源，请清理后重试迁移', 1;

      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.fin_payable') AND name = N'UQ_fin_payable_estimate_source')
        CREATE UNIQUE INDEX UQ_fin_payable_estimate_source ON dbo.fin_payable(payable_type, source_type, source_id);
    `);
  }

  private async createPayableEntry(queryRunner: QueryRunner) {
    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.fin_payable_entry', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.fin_payable_entry (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_fin_payable_entry PRIMARY KEY DEFAULT NEWID(),
          payable_id UNIQUEIDENTIFIER NOT NULL,
          line_no INT NOT NULL,
          inventory_in_entry_id VARCHAR(36) NOT NULL,
          source_receive_notice_entry_id VARCHAR(36) NOT NULL,
          source_order_entry_id VARCHAR(36) NOT NULL,
          source_request_entry_id VARCHAR(36) NULL,
          material_id VARCHAR(36) NOT NULL,
          material_code VARCHAR(50) NOT NULL,
          material_name NVARCHAR(200) NOT NULL,
          material_model NVARCHAR(200) NULL,
          unit_id VARCHAR(36) NOT NULL,
          unit_code VARCHAR(50) NULL,
          unit_name NVARCHAR(50) NULL,
          quantity DECIMAL(18,4) NOT NULL,
          unit_price DECIMAL(18,4) NOT NULL,
          tax_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_fin_payable_entry_tax_rate DEFAULT 0,
          untaxed_amount DECIMAL(18,2) NOT NULL,
          tax_amount DECIMAL(18,2) NOT NULL,
          total_amount DECIMAL(18,2) NOT NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME NOT NULL CONSTRAINT DF_fin_payable_entry_created_at DEFAULT GETDATE(),
          updated_at DATETIME NOT NULL CONSTRAINT DF_fin_payable_entry_updated_at DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_fin_payable_entry_is_deleted DEFAULT 0,
          CONSTRAINT FK_fin_payable_entry_payable FOREIGN KEY (payable_id) REFERENCES dbo.fin_payable(id) ON DELETE CASCADE
        );
      END;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.fin_payable_entry') AND name = N'UQ_fin_payable_entry_header_line')
        CREATE UNIQUE INDEX UQ_fin_payable_entry_header_line ON dbo.fin_payable_entry(payable_id, line_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.fin_payable_entry') AND name = N'UQ_fin_payable_entry_inventory_in_entry')
        CREATE UNIQUE INDEX UQ_fin_payable_entry_inventory_in_entry ON dbo.fin_payable_entry(inventory_in_entry_id);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.fin_payable_entry') AND name = N'IDX_fin_payable_entry_order_entry')
        CREATE INDEX IDX_fin_payable_entry_order_entry ON dbo.fin_payable_entry(source_order_entry_id);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.fin_payable_entry') AND name = N'IDX_fin_payable_entry_request_entry')
        CREATE INDEX IDX_fin_payable_entry_request_entry ON dbo.fin_payable_entry(source_request_entry_id);
    `);
  }

  private async addColumnIfMissing(queryRunner: QueryRunner, table: string, column: string, definition: string) {
    await queryRunner.query(`
      IF COL_LENGTH('dbo.${table}', '${column}') IS NULL
        ALTER TABLE dbo.${table} ADD ${column} ${definition};
    `);
  }

  private async alterColumnIfPresent(queryRunner: QueryRunner, table: string, column: string, definition: string) {
    await queryRunner.query(`
      IF COL_LENGTH('dbo.${table}', '${column}') IS NOT NULL
        ALTER TABLE dbo.${table} ALTER COLUMN ${column} ${definition};
    `);
  }

  private async dropColumns(queryRunner: QueryRunner, table: string, columns: string[]) {
    for (const column of columns) {
      await queryRunner.query(`
        IF COL_LENGTH('dbo.${table}', '${column}') IS NOT NULL
        BEGIN
          DECLARE @constraintName NVARCHAR(128);
          SELECT @constraintName = dc.name
          FROM sys.default_constraints dc
          JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
          WHERE dc.parent_object_id = OBJECT_ID(N'dbo.${table}') AND c.name = N'${column}';
          IF @constraintName IS NOT NULL EXEC(N'ALTER TABLE dbo.${table} DROP CONSTRAINT [' + @constraintName + ']');
          EXEC(N'ALTER TABLE dbo.${table} DROP COLUMN [${column}]');
        END;
      `);
    }
  }
}
