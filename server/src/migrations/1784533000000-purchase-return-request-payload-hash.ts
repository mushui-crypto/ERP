import { MigrationInterface, QueryRunner } from 'typeorm';

export class PurchaseReturnRequestPayloadHash1784533000000 implements MigrationInterface {
  name = 'PurchaseReturnRequestPayloadHash1784533000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') {
      throw new Error('PurchaseReturnRequestPayloadHash1784533000000 当前仅提供 MSSQL 迁移实现');
    }
    await queryRunner.query(`
      IF COL_LENGTH('dbo.biz_purchase_return_request', 'payload_hash') IS NULL
        ALTER TABLE dbo.biz_purchase_return_request ADD payload_hash VARCHAR(64) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') return;
    await queryRunner.query(`
      IF COL_LENGTH('dbo.biz_purchase_return_request', 'payload_hash') IS NOT NULL
        ALTER TABLE dbo.biz_purchase_return_request DROP COLUMN payload_hash;
    `);
  }
}
