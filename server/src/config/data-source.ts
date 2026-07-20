import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const dbType = process.env.DB_TYPE || 'mysql';

let dbConfig: any;

switch (dbType) {
  case 'mysql':
    dbConfig = {
      type: 'mysql',
      host: process.env.DB_MYSQL_HOST || 'localhost',
      port: parseInt(process.env.DB_MYSQL_PORT || '3306'),
      username: process.env.DB_MYSQL_USERNAME || 'root',
      password: process.env.DB_MYSQL_PASSWORD || 'root',
      database: process.env.DB_MYSQL_DATABASE || 'panshu_erp',
    };
    break;

  case 'postgres':
    dbConfig = {
      type: 'postgres',
      host: process.env.DB_POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.DB_POSTGRES_PORT || '5432'),
      username: process.env.DB_POSTGRES_USERNAME || 'postgres',
      password: process.env.DB_POSTGRES_PASSWORD || 'postgres',
      database: process.env.DB_POSTGRES_DATABASE || 'panshu_erp',
    };
    break;

  case 'mssql':
    dbConfig = {
      type: 'mssql',
      host: process.env.DB_MSSQL_HOST || 'localhost',
      port: parseInt(process.env.DB_MSSQL_PORT || '1433'),
      username: process.env.DB_MSSQL_USERNAME || 'sa',
      password: process.env.DB_MSSQL_PASSWORD || 'Sa123456',
      database: process.env.DB_MSSQL_DATABASE || 'panshu_erp',
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };
    break;

  default:
    throw new Error(`不支持的数据库类型: ${dbType}`);
}

export const AppDataSource = new DataSource({
  ...dbConfig,
  entities: [join(__dirname, '../**/*.entity.{ts,js}')],
  migrations: [join(__dirname, '../migrations/*.{ts,js}')],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});