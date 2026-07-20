import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAssetOutRequestRecreate1784537000000 implements MigrationInterface {
  name = 'FixAssetOutRequestRecreate1784537000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') {
      throw new Error('FixAssetOutRequestRecreate1784537000000 当前仅提供 MSSQL 迁移实现');
    }
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_out_request') AND name=N'UQ_asset_out_request_acceptance')
        DROP INDEX UQ_asset_out_request_acceptance ON dbo.biz_asset_out_request;
      CREATE UNIQUE INDEX UQ_asset_out_request_acceptance
        ON dbo.biz_asset_out_request(source_asset_acceptance_id) WHERE status <> 4;
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_out_request_entry') AND name=N'UQ_asset_out_request_entry_acceptance')
        DROP INDEX UQ_asset_out_request_entry_acceptance ON dbo.biz_asset_out_request_entry;
      CREATE INDEX IDX_asset_out_request_entry_acceptance
        ON dbo.biz_asset_out_request_entry(source_asset_acceptance_entry_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mssql') return;
    await queryRunner.query(`
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_out_request') AND name=N'UQ_asset_out_request_acceptance')
        DROP INDEX UQ_asset_out_request_acceptance ON dbo.biz_asset_out_request;
      CREATE UNIQUE INDEX UQ_asset_out_request_acceptance
        ON dbo.biz_asset_out_request(source_asset_acceptance_id);
      IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID(N'dbo.biz_asset_out_request_entry') AND name=N'IDX_asset_out_request_entry_acceptance')
        DROP INDEX IDX_asset_out_request_entry_acceptance ON dbo.biz_asset_out_request_entry;
      CREATE UNIQUE INDEX UQ_asset_out_request_entry_acceptance
        ON dbo.biz_asset_out_request_entry(source_asset_acceptance_entry_id);
    `);
  }
}
