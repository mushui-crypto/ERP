import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDataCenterColumns1783737947323 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbType = queryRunner.connection.driver.options.type;

        if (dbType === 'mysql') {
            await queryRunner.query("ALTER TABLE sys_org ADD COLUMN IF NOT EXISTS data_center_id VARCHAR(36) NULL");
            await queryRunner.query("ALTER TABLE sys_user ADD COLUMN IF NOT EXISTS data_center_id VARCHAR(36) NULL");
            await queryRunner.query("ALTER TABLE sys_role ADD COLUMN IF NOT EXISTS org_id VARCHAR(36) NULL");
        } else if (dbType === 'postgres') {
            await queryRunner.query("ALTER TABLE sys_org ADD COLUMN IF NOT EXISTS data_center_id VARCHAR(36) NULL");
            await queryRunner.query("ALTER TABLE sys_user ADD COLUMN IF NOT EXISTS data_center_id VARCHAR(36) NULL");
            await queryRunner.query("ALTER TABLE sys_role ADD COLUMN IF NOT EXISTS org_id VARCHAR(36) NULL");
        } else if (dbType === 'mssql') {
            try {
                await queryRunner.query("ALTER TABLE sys_org ADD data_center_id VARCHAR(36) NULL");
            } catch {}
            try {
                await queryRunner.query("ALTER TABLE sys_user ADD data_center_id VARCHAR(36) NULL");
            } catch {}
            try {
                await queryRunner.query("ALTER TABLE sys_role ADD org_id VARCHAR(36) NULL");
            } catch {}
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const dbType = queryRunner.connection.driver.options.type;
        
        if (dbType === 'mysql') {
            await queryRunner.query("ALTER TABLE sys_org DROP COLUMN data_center_id");
            await queryRunner.query("ALTER TABLE sys_user DROP COLUMN data_center_id");
            await queryRunner.query("ALTER TABLE sys_role DROP COLUMN org_id");
        } else if (dbType === 'postgres') {
            await queryRunner.query("ALTER TABLE sys_org DROP COLUMN data_center_id");
            await queryRunner.query("ALTER TABLE sys_user DROP COLUMN data_center_id");
            await queryRunner.query("ALTER TABLE sys_role DROP COLUMN org_id");
        } else if (dbType === 'mssql') {
            await queryRunner.query("ALTER TABLE sys_org DROP COLUMN data_center_id");
            await queryRunner.query("ALTER TABLE sys_user DROP COLUMN data_center_id");
            await queryRunner.query("ALTER TABLE sys_role DROP COLUMN org_id");
        }
    }

}