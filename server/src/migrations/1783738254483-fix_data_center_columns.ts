import { MigrationInterface, QueryRunner } from "typeorm";

export class FixDataCenterColumns1783738254483 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dbType = queryRunner.connection.driver.options.type;
        
        if (dbType === 'mssql') {
            try {
                await queryRunner.query("ALTER TABLE sys_data_center ADD extra_config TEXT NULL");
            } catch {}
            try {
                await queryRunner.query("ALTER TABLE sys_data_center ADD is_deleted INT DEFAULT 0");
            } catch {}
            try {
                await queryRunner.query("ALTER TABLE sys_data_center ADD created_at DATETIME");
            } catch {}
            try {
                await queryRunner.query("ALTER TABLE sys_data_center ADD updated_at DATETIME");
            } catch {}
            try {
                await queryRunner.query("ALTER TABLE sys_data_center ADD created_by VARCHAR(36) NULL");
            } catch {}
            try {
                await queryRunner.query("ALTER TABLE sys_data_center ADD updated_by VARCHAR(36) NULL");
            } catch {}
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}