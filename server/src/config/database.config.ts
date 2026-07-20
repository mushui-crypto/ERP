import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export function getDatabaseConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const dbType = configService.get<string>('DB_TYPE', 'mysql');

  let dbConfig: TypeOrmModuleOptions;

  switch (dbType) {
    case 'sqlite':
      dbConfig = {
        type: 'sqlite',
        database: 'panshu_erp.db',
      };
      break;

    case 'mysql':
      dbConfig = {
        type: 'mysql',
        host: configService.get<string>('DB_MYSQL_HOST', 'localhost'),
        port: configService.get<number>('DB_MYSQL_PORT', 3306),
        username: configService.get<string>('DB_MYSQL_USERNAME', 'root'),
        password: configService.get<string>('DB_MYSQL_PASSWORD', 'root'),
        database: configService.get<string>('DB_MYSQL_DATABASE', 'panshu_erp'),
        charset: 'utf8mb4',
        timezone: '+08:00',
      };
      break;

    case 'postgres':
      dbConfig = {
        type: 'postgres',
        host: configService.get<string>('DB_POSTGRES_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_POSTGRES_PORT', '5432')),
        username: configService.get<string>('DB_POSTGRES_USERNAME', 'postgres'),
        password: configService.get<string>('DB_POSTGRES_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_POSTGRES_DATABASE', 'panshu_erp'),
        schema: 'public',
        ssl: false,
      };
      break;

    case 'mssql':
      dbConfig = {
        type: 'mssql',
        host: configService.get<string>('DB_MSSQL_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_MSSQL_PORT', '1433')),
        username: configService.get<string>('DB_MSSQL_USERNAME', 'sa'),
        password: configService.get<string>('DB_MSSQL_PASSWORD', 'Sa123456'),
        database: configService.get<string>('DB_MSSQL_DATABASE', 'panshu_erp'),
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      };
      break;

    default:
      throw new Error(`不支持的数据库类型: ${dbType}，请使用 mysql / postgres / mssql`);
  }

  return {
    ...dbConfig,
    entities: [join(__dirname, '../**/*.entity.{ts,js}')],
    migrations: [join(__dirname, '../migrations/*.{ts,js}')],
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    logging: configService.get<string>('NODE_ENV') === 'development',
    retryAttempts: 3,
    retryDelay: 3000,
    keepConnectionAlive: true,
  };
}
