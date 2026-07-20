import { MigrationInterface, QueryRunner } from 'typeorm';

export class PurchaseReturnFlow1784530663663 implements MigrationInterface {
  name = 'PurchaseReturnFlow1784530663663';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') {
      throw new Error('PurchaseReturnFlow1784530663663 当前仅提供 MSSQL 迁移实现');
    }

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_purchase_return_request', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_purchase_return_request (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_purchase_return_request PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          request_no VARCHAR(50) NOT NULL,
          idempotency_key VARCHAR(100) NOT NULL,
          purchase_org_id VARCHAR(36) NOT NULL,
          stock_org_id VARCHAR(36) NOT NULL,
          settle_org_id VARCHAR(36) NULL,
          supplier_id VARCHAR(36) NOT NULL,
          currency_id VARCHAR(36) NULL,
          return_mode VARCHAR(20) NOT NULL,
          request_date DATETIME NOT NULL,
          reason NVARCHAR(500) NOT NULL,
          status INT NOT NULL CONSTRAINT DF_purchase_return_request_status DEFAULT 0,
          approved_at DATETIME NULL,
          approved_by VARCHAR(50) NULL,
          remark NVARCHAR(1000) NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_return_request_created_at DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_return_request_updated_at DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_purchase_return_request_is_deleted DEFAULT 0
        );
      END;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_purchase_return_request') AND name=N'UQ_purchase_return_request_no')
        CREATE UNIQUE INDEX UQ_purchase_return_request_no ON dbo.biz_purchase_return_request(request_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_purchase_return_request') AND name=N'UQ_purchase_return_request_idempotency')
        CREATE UNIQUE INDEX UQ_purchase_return_request_idempotency ON dbo.biz_purchase_return_request(idempotency_key);
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_purchase_return_request_entry', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_purchase_return_request_entry (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_purchase_return_request_entry PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          purchase_return_request_id UNIQUEIDENTIFIER NOT NULL,
          line_no INT NOT NULL,
          source_inventory_in_id VARCHAR(36) NOT NULL,
          source_inventory_in_no VARCHAR(50) NOT NULL,
          source_inventory_in_entry_id VARCHAR(36) NOT NULL,
          source_receive_notice_id VARCHAR(36) NOT NULL,
          source_receive_notice_entry_id VARCHAR(36) NOT NULL,
          source_order_id VARCHAR(36) NOT NULL,
          source_order_entry_id VARCHAR(36) NOT NULL,
          source_request_id VARCHAR(36) NULL,
          source_request_entry_id VARCHAR(36) NULL,
          material_id VARCHAR(36) NOT NULL,
          material_code VARCHAR(50) NOT NULL,
          material_name NVARCHAR(200) NOT NULL,
          material_model NVARCHAR(200) NULL,
          unit_id VARCHAR(36) NOT NULL,
          unit_code VARCHAR(50) NULL,
          unit_name NVARCHAR(50) NULL,
          warehouse_id VARCHAR(36) NOT NULL,
          lot_no VARCHAR(100) NOT NULL CONSTRAINT DF_purchase_return_request_entry_lot_no DEFAULT '',
          request_qty DECIMAL(18,4) NOT NULL,
          returned_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_return_request_entry_returned_qty DEFAULT 0,
          unit_price DECIMAL(18,4) NOT NULL,
          tax_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_purchase_return_request_entry_tax_rate DEFAULT 0,
          amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_return_request_entry_amount DEFAULT 0,
          tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_return_request_entry_tax_amount DEFAULT 0,
          total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_return_request_entry_total_amount DEFAULT 0,
          remark NVARCHAR(500) NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_return_request_entry_created_at DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_return_request_entry_updated_at DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_purchase_return_request_entry_is_deleted DEFAULT 0,
          CONSTRAINT FK_purchase_return_request_entry_header FOREIGN KEY (purchase_return_request_id)
            REFERENCES dbo.biz_purchase_return_request(id) ON DELETE CASCADE
        );
      END;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_purchase_return_request_entry') AND name=N'UQ_purchase_return_request_entry_line')
        CREATE UNIQUE INDEX UQ_purchase_return_request_entry_line ON dbo.biz_purchase_return_request_entry(purchase_return_request_id, line_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_purchase_return_request_entry') AND name=N'IDX_purchase_return_request_entry_inbound')
        CREATE INDEX IDX_purchase_return_request_entry_inbound ON dbo.biz_purchase_return_request_entry(source_inventory_in_entry_id);
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_purchase_return', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_purchase_return (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_purchase_return PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          return_no VARCHAR(50) NOT NULL,
          idempotency_key VARCHAR(100) NOT NULL,
          source_type VARCHAR(30) NOT NULL,
          source_return_request_id VARCHAR(36) NULL,
          source_return_request_no VARCHAR(50) NULL,
          purchase_org_id VARCHAR(36) NOT NULL,
          stock_org_id VARCHAR(36) NOT NULL,
          settle_org_id VARCHAR(36) NULL,
          supplier_id VARCHAR(36) NOT NULL,
          currency_id VARCHAR(36) NULL,
          payment_term_id VARCHAR(36) NULL,
          return_mode VARCHAR(20) NOT NULL,
          return_date DATETIME NOT NULL,
          reason NVARCHAR(500) NOT NULL,
          untaxed_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_return_untaxed_amount DEFAULT 0,
          tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_return_tax_amount DEFAULT 0,
          total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_return_total_amount DEFAULT 0,
          status INT NOT NULL CONSTRAINT DF_purchase_return_status DEFAULT 0,
          approved_at DATETIME NULL,
          approved_by VARCHAR(50) NULL,
          payable_generation_status VARCHAR(30) NOT NULL CONSTRAINT DF_purchase_return_payable_status DEFAULT 'NOT_REQUIRED',
          payable_id VARCHAR(36) NULL,
          payable_no VARCHAR(50) NULL,
          payable_generation_error NVARCHAR(1000) NULL,
          payable_generation_failed_at DATETIME NULL,
          payable_generated_at DATETIME NULL,
          replenish_notice_id VARCHAR(36) NULL,
          replenish_notice_no VARCHAR(50) NULL,
          remark NVARCHAR(1000) NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_return_created_at DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_return_updated_at DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_purchase_return_is_deleted DEFAULT 0
        );
      END;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_purchase_return') AND name=N'UQ_purchase_return_no')
        CREATE UNIQUE INDEX UQ_purchase_return_no ON dbo.biz_purchase_return(return_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_purchase_return') AND name=N'UQ_purchase_return_idempotency')
        CREATE UNIQUE INDEX UQ_purchase_return_idempotency ON dbo.biz_purchase_return(idempotency_key);
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'dbo.biz_purchase_return_entry', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.biz_purchase_return_entry (
          id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_purchase_return_entry PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
          purchase_return_id UNIQUEIDENTIFIER NOT NULL,
          line_no INT NOT NULL,
          source_return_request_entry_id VARCHAR(36) NULL,
          source_inventory_in_id VARCHAR(36) NOT NULL,
          source_inventory_in_no VARCHAR(50) NOT NULL,
          source_inventory_in_entry_id VARCHAR(36) NOT NULL,
          source_receive_notice_id VARCHAR(36) NOT NULL,
          source_receive_notice_entry_id VARCHAR(36) NOT NULL,
          source_order_id VARCHAR(36) NOT NULL,
          source_order_entry_id VARCHAR(36) NOT NULL,
          source_request_id VARCHAR(36) NULL,
          source_request_entry_id VARCHAR(36) NULL,
          material_id VARCHAR(36) NOT NULL,
          material_code VARCHAR(50) NOT NULL,
          material_name NVARCHAR(200) NOT NULL,
          material_model NVARCHAR(200) NULL,
          unit_id VARCHAR(36) NOT NULL,
          unit_code VARCHAR(50) NULL,
          unit_name NVARCHAR(50) NULL,
          warehouse_id VARCHAR(36) NOT NULL,
          lot_no VARCHAR(100) NOT NULL CONSTRAINT DF_purchase_return_entry_lot_no DEFAULT '',
          return_qty DECIMAL(18,4) NOT NULL,
          unit_price DECIMAL(18,4) NOT NULL,
          tax_rate DECIMAL(9,4) NOT NULL CONSTRAINT DF_purchase_return_entry_tax_rate DEFAULT 0,
          amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_return_entry_amount DEFAULT 0,
          tax_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_return_entry_tax_amount DEFAULT 0,
          total_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_purchase_return_entry_total_amount DEFAULT 0,
          inventory_posting_id VARCHAR(36) NULL,
          replenish_notice_entry_id VARCHAR(36) NULL,
          replenished_received_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_return_entry_received_qty DEFAULT 0,
          replenished_stocked_qty DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_return_entry_stocked_qty DEFAULT 0,
          remark NVARCHAR(500) NULL,
          created_by VARCHAR(50) NULL,
          updated_by VARCHAR(50) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_return_entry_created_at DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL CONSTRAINT DF_purchase_return_entry_updated_at DEFAULT GETDATE(),
          is_deleted TINYINT NOT NULL CONSTRAINT DF_purchase_return_entry_is_deleted DEFAULT 0,
          CONSTRAINT FK_purchase_return_entry_header FOREIGN KEY (purchase_return_id)
            REFERENCES dbo.biz_purchase_return(id) ON DELETE CASCADE
        );
      END;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_purchase_return_entry') AND name=N'UQ_purchase_return_entry_line')
        CREATE UNIQUE INDEX UQ_purchase_return_entry_line ON dbo.biz_purchase_return_entry(purchase_return_id, line_no);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_purchase_return_entry') AND name=N'IDX_purchase_return_entry_inbound')
        CREATE INDEX IDX_purchase_return_entry_inbound ON dbo.biz_purchase_return_entry(source_inventory_in_entry_id);
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_purchase_return_entry') AND name=N'IDX_purchase_return_entry_request')
        CREATE INDEX IDX_purchase_return_entry_request ON dbo.biz_purchase_return_entry(source_return_request_entry_id);
    `);

    await this.addColumn(queryRunner, 'inventory_in_entry', 'returned_qty', 'DECIMAL(18,4) NOT NULL CONSTRAINT DF_inventory_in_entry_returned_qty DEFAULT 0');
    await this.addColumn(queryRunner, 'inventory_in_entry', 'source_purchase_return_entry_id', 'VARCHAR(36) NULL');
    await this.addColumn(queryRunner, 'biz_purchase_order_entry', 'returned_qty', 'DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_order_entry_returned_qty DEFAULT 0');
    await this.addColumn(queryRunner, 'biz_purchase_receive_notice', 'source_type', "VARCHAR(40) NOT NULL CONSTRAINT DF_purchase_receive_notice_source_type DEFAULT 'PURCHASE_ORDER'");
    await this.addColumn(queryRunner, 'biz_purchase_receive_notice', 'source_purchase_return_id', 'VARCHAR(36) NULL');
    await this.addColumn(queryRunner, 'biz_purchase_receive_notice', 'source_purchase_return_no', 'VARCHAR(50) NULL');
    await this.addColumn(queryRunner, 'biz_purchase_receive_notice_entry', 'source_purchase_return_entry_id', 'VARCHAR(36) NULL');
    await this.addColumn(queryRunner, 'biz_purchase_receive_notice_entry', 'returned_qty', 'DECIMAL(18,4) NOT NULL CONSTRAINT DF_purchase_receive_notice_entry_returned_qty DEFAULT 0');
    await this.addColumn(queryRunner, 'fin_payable_entry', 'purchase_return_entry_id', 'VARCHAR(36) NULL');

    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.fin_payable_entry') AND name=N'UQ_fin_payable_entry_inventory_in_entry')
        DROP INDEX UQ_fin_payable_entry_inventory_in_entry ON dbo.fin_payable_entry;
      ALTER TABLE dbo.fin_payable_entry ALTER COLUMN inventory_in_entry_id VARCHAR(36) NULL;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.fin_payable_entry') AND name=N'UQ_fin_payable_entry_inventory_in_entry')
        CREATE UNIQUE INDEX UQ_fin_payable_entry_inventory_in_entry ON dbo.fin_payable_entry(inventory_in_entry_id) WHERE inventory_in_entry_id IS NOT NULL;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.fin_payable_entry') AND name=N'UQ_fin_payable_entry_purchase_return_entry')
        CREATE UNIQUE INDEX UQ_fin_payable_entry_purchase_return_entry ON dbo.fin_payable_entry(purchase_return_entry_id) WHERE purchase_return_entry_id IS NOT NULL;
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_purchase_receive_notice') AND name=N'UQ_purchase_receive_notice_return_replenish')
        CREATE UNIQUE INDEX UQ_purchase_receive_notice_return_replenish ON dbo.biz_purchase_receive_notice(source_purchase_return_id) WHERE source_purchase_return_id IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') return;
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_purchase_receive_notice') AND name=N'UQ_purchase_receive_notice_return_replenish') DROP INDEX UQ_purchase_receive_notice_return_replenish ON dbo.biz_purchase_receive_notice;
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.fin_payable_entry') AND name=N'UQ_fin_payable_entry_purchase_return_entry') DROP INDEX UQ_fin_payable_entry_purchase_return_entry ON dbo.fin_payable_entry;
      IF OBJECT_ID(N'dbo.biz_purchase_return_entry', N'U') IS NOT NULL DROP TABLE dbo.biz_purchase_return_entry;
      IF OBJECT_ID(N'dbo.biz_purchase_return', N'U') IS NOT NULL DROP TABLE dbo.biz_purchase_return;
      IF OBJECT_ID(N'dbo.biz_purchase_return_request_entry', N'U') IS NOT NULL DROP TABLE dbo.biz_purchase_return_request_entry;
      IF OBJECT_ID(N'dbo.biz_purchase_return_request', N'U') IS NOT NULL DROP TABLE dbo.biz_purchase_return_request;
    `);
    for (const [table, column] of [
      ['inventory_in_entry', 'source_purchase_return_entry_id'], ['inventory_in_entry', 'returned_qty'],
      ['biz_purchase_order_entry', 'returned_qty'], ['biz_purchase_receive_notice_entry', 'returned_qty'],
      ['biz_purchase_receive_notice_entry', 'source_purchase_return_entry_id'], ['biz_purchase_receive_notice', 'source_purchase_return_no'],
      ['biz_purchase_receive_notice', 'source_purchase_return_id'], ['biz_purchase_receive_notice', 'source_type'],
      ['fin_payable_entry', 'purchase_return_entry_id'],
    ]) await this.dropColumn(queryRunner, table, column);
  }

  private async addColumn(queryRunner: QueryRunner, table: string, column: string, definition: string) {
    await queryRunner.query(`IF COL_LENGTH('dbo.${table}', '${column}') IS NULL ALTER TABLE dbo.${table} ADD ${column} ${definition};`);
  }

  private async dropColumn(queryRunner: QueryRunner, table: string, column: string) {
    await queryRunner.query(`
      IF COL_LENGTH('dbo.${table}', '${column}') IS NOT NULL
      BEGIN
        DECLARE @constraintName NVARCHAR(128);
        SELECT @constraintName=dc.name FROM sys.default_constraints dc JOIN sys.columns c ON c.object_id=dc.parent_object_id AND c.column_id=dc.parent_column_id
        WHERE dc.parent_object_id=OBJECT_ID(N'dbo.${table}') AND c.name=N'${column}';
        IF @constraintName IS NOT NULL EXEC(N'ALTER TABLE dbo.${table} DROP CONSTRAINT [' + @constraintName + N']');
        EXEC(N'ALTER TABLE dbo.${table} DROP COLUMN [${column}]');
      END;
    `);
  }
}
