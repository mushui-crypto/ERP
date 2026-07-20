import { Injectable, Logger } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DataCenter } from '../../database/entities/data-center.entity';

@Injectable()
export class DatabaseConnectionPoolService {
  private readonly logger = new Logger(DatabaseConnectionPoolService.name);
  private connections: Map<string, DataSource> = new Map();

  async getConnection(dataCenterId: string, dataCenter?: DataCenter): Promise<DataSource> {
    let connection = this.connections.get(dataCenterId);
    
    if (!connection || !connection.isInitialized) {
      if (!dataCenter) {
        throw new Error('数据中心配置不存在');
      }
      connection = await this.createConnection(dataCenter);
      this.connections.set(dataCenterId, connection);
    }
    
    return connection;
  }

  async createConnection(dataCenter: DataCenter): Promise<DataSource> {
    const options: DataSourceOptions = {
      type: dataCenter.dbType as any,
      host: dataCenter.dbHost,
      port: dataCenter.dbPort,
      username: dataCenter.dbUser,
      password: dataCenter.dbPassword,
      database: dataCenter.dbName,
      entities: [__dirname + '/../**/*.entity.{ts,js}'],
      migrations: [__dirname + '/../migrations/*.{ts,js}'],
      synchronize: false,
      logging: false,
    };

    if (dataCenter.dbType === 'mssql') {
      options['options'] = {
        encrypt: false,
        trustServerCertificate: true,
      };
    }

    if (dataCenter.dbType === 'postgres') {
      options['schema'] = 'public';
    }

    if (dataCenter.dbType === 'mysql') {
      options['charset'] = 'utf8mb4';
      options['timezone'] = '+08:00';
    }

    const dataSource = new DataSource(options);
    await dataSource.initialize();
    
    this.logger.log(`数据库连接创建成功: ${dataCenter.code} (${dataCenter.dbType})`);
    return dataSource;
  }

  async createDatabase(dataCenter: DataCenter): Promise<void> {
    let adminOptions: DataSourceOptions;
    
    switch (dataCenter.dbType) {
      case 'mysql':
        adminOptions = {
          type: 'mysql',
          host: dataCenter.dbHost,
          port: dataCenter.dbPort,
          username: dataCenter.dbUser,
          password: dataCenter.dbPassword,
          database: 'mysql',
        };
        break;
      case 'postgres':
        adminOptions = {
          type: 'postgres',
          host: dataCenter.dbHost,
          port: dataCenter.dbPort,
          username: dataCenter.dbUser,
          password: dataCenter.dbPassword,
          database: 'postgres',
        };
        break;
      case 'mssql':
        adminOptions = {
          type: 'mssql',
          host: dataCenter.dbHost,
          port: dataCenter.dbPort,
          username: dataCenter.dbUser,
          password: dataCenter.dbPassword,
          database: 'master',
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
        };
        break;
      default:
        throw new Error(`不支持的数据库类型: ${dataCenter.dbType}`);
    }

    const adminDataSource = new DataSource(adminOptions);
    await adminDataSource.initialize();

    try {
      let createDbSql: string;
      
      switch (dataCenter.dbType) {
        case 'mysql':
          createDbSql = `CREATE DATABASE IF NOT EXISTS \`${dataCenter.dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
          break;
        case 'postgres':
          createDbSql = `CREATE DATABASE IF NOT EXISTS "${dataCenter.dbName}"`;
          break;
        case 'mssql':
          createDbSql = `IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dataCenter.dbName}') CREATE DATABASE [${dataCenter.dbName}]`;
          break;
        default:
          throw new Error(`不支持的数据库类型: ${dataCenter.dbType}`);
      }

      await adminDataSource.query(createDbSql);
      this.logger.log(`数据库创建成功: ${dataCenter.dbName}`);
    } finally {
      await adminDataSource.destroy();
    }
  }

  async runMigrations(dataCenter: DataCenter): Promise<void> {
    const dataSource = await this.createConnection(dataCenter);
    
    try {
      await dataSource.runMigrations();
      this.logger.log(`数据库迁移执行成功: ${dataCenter.dbName}`);
    } finally {
      await dataSource.destroy();
    }
  }

  async testConnection(dataCenter: DataCenter): Promise<any> {
    const startTime = Date.now();
    
    let testOptions: DataSourceOptions;
    
    switch (dataCenter.dbType) {
      case 'mysql':
        testOptions = {
          type: 'mysql',
          host: dataCenter.dbHost,
          port: dataCenter.dbPort,
          username: dataCenter.dbUser,
          password: dataCenter.dbPassword,
          database: 'mysql',
        };
        break;
      case 'postgres':
        testOptions = {
          type: 'postgres',
          host: dataCenter.dbHost,
          port: dataCenter.dbPort,
          username: dataCenter.dbUser,
          password: dataCenter.dbPassword,
          database: 'postgres',
        };
        break;
      case 'mssql':
        testOptions = {
          type: 'mssql',
          host: dataCenter.dbHost,
          port: dataCenter.dbPort,
          username: dataCenter.dbUser,
          password: dataCenter.dbPassword,
          database: 'master',
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
        };
        break;
      default:
        return { success: false, message: `不支持的数据库类型: ${dataCenter.dbType}` };
    }

    const testDataSource = new DataSource(testOptions);
    
    try {
      await testDataSource.initialize();
      
      let version = '';
      try {
        if (dataCenter.dbType === 'mysql') {
          const result = await testDataSource.query('SELECT VERSION() as version');
          version = result[0]?.version || 'MySQL';
        } else if (dataCenter.dbType === 'postgres') {
          const result = await testDataSource.query('SELECT version() as version');
          version = result[0]?.version || 'PostgreSQL';
        } else if (dataCenter.dbType === 'mssql') {
          const result = await testDataSource.query('SELECT @@VERSION as version');
          version = result[0]?.version || 'SQL Server';
        }
      } catch (e) {
        version = dataCenter.dbType.toUpperCase();
      }
      
      const responseTime = Date.now() - startTime;
      
      await testDataSource.destroy();
      
      return {
        success: true,
        message: '连接测试成功',
        data: {
          host: dataCenter.dbHost,
          port: dataCenter.dbPort,
          version: version,
          responseTime: responseTime,
          timestamp: new Date().toLocaleString('zh-CN'),
        },
      };
    } catch (error) {
      try {
        await testDataSource.destroy();
      } catch (e) {}
      
      return {
        success: false,
        message: error.message || '连接测试失败',
      };
    }
  }

  async closeConnection(dataCenterId: string): Promise<void> {
    const connection = this.connections.get(dataCenterId);
    if (connection) {
      await connection.destroy();
      this.connections.delete(dataCenterId);
      this.logger.log(`数据库连接已关闭: ${dataCenterId}`);
    }
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  getConnectionInfo(): string[] {
    return Array.from(this.connections.entries()).map(([id, conn]) => 
      `${id}: ${conn.options.type} - ${conn.isInitialized ? '已连接' : '未连接'}`
    );
  }
}