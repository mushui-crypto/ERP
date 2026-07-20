import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDictAndConfigTables1783739473704 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const dbType = queryRunner.connection.options.type;

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_dict_type')
      CREATE TABLE sys_dict_type (
        id VARCHAR(36) PRIMARY KEY,
        dict_code VARCHAR(50) NOT NULL,
        dict_name VARCHAR(200) NOT NULL,
        description VARCHAR(500),
        is_system BIT DEFAULT 0,
        status INT DEFAULT 1,
        sort_order INT DEFAULT 0,
        remark TEXT,
        created_by VARCHAR(50),
        updated_by VARCHAR(50),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        is_deleted BIT DEFAULT 0
      )
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sys_dict_type_dict_code' AND object_id = OBJECT_ID('sys_dict_type'))
      CREATE UNIQUE INDEX IX_sys_dict_type_dict_code ON sys_dict_type(dict_code)
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_dict_data')
      CREATE TABLE sys_dict_data (
        id VARCHAR(36) PRIMARY KEY,
        dict_code VARCHAR(50) NOT NULL,
        dict_value VARCHAR(200) NOT NULL,
        dict_label VARCHAR(200) NOT NULL,
        parent_value VARCHAR(200),
        level INT DEFAULT 0,
        sort_order INT DEFAULT 0,
        status INT DEFAULT 1,
        remark TEXT,
        created_by VARCHAR(50),
        updated_by VARCHAR(50),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        is_deleted BIT DEFAULT 0
      )
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sys_dict_data_dict_code' AND object_id = OBJECT_ID('sys_dict_data'))
      CREATE INDEX IX_sys_dict_data_dict_code ON sys_dict_data(dict_code)
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sys_config')
      CREATE TABLE sys_config (
        id VARCHAR(36) PRIMARY KEY,
        config_group VARCHAR(50) NOT NULL,
        config_key VARCHAR(100) NOT NULL,
        config_value TEXT,
        config_name VARCHAR(200) NOT NULL,
        value_type VARCHAR(20) DEFAULT 'string',
        description VARCHAR(500),
        is_editable BIT DEFAULT 1,
        is_system BIT DEFAULT 0,
        status INT DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_by VARCHAR(50),
        updated_by VARCHAR(50),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        is_deleted BIT DEFAULT 0
      )
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sys_config_config_key' AND object_id = OBJECT_ID('sys_config'))
      CREATE UNIQUE INDEX IX_sys_config_config_key ON sys_config(config_key)
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sys_config_config_group' AND object_id = OBJECT_ID('sys_config'))
      CREATE INDEX IX_sys_config_config_group ON sys_config(config_group)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS sys_config');
    await queryRunner.query('DROP TABLE IF EXISTS sys_dict_data');
    await queryRunner.query('DROP TABLE IF EXISTS sys_dict_type');
  }
}