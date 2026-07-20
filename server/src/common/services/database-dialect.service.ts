import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type DatabaseDialect = 'mysql' | 'postgres' | 'mssql';

@Injectable()
export class DatabaseDialectService {
  private dialect: DatabaseDialect;

  constructor(private dataSource: DataSource) {
    this.detectDialect();
  }

  private detectDialect(): void {
    const driverName = this.dataSource.driver.options.type;
    switch (driverName) {
      case 'mysql':
        this.dialect = 'mysql';
        break;
      case 'postgres':
        this.dialect = 'postgres';
        break;
      case 'mssql':
        this.dialect = 'mssql';
        break;
      default:
        this.dialect = 'mysql';
    }
  }

  getDialect(): DatabaseDialect {
    return this.dialect;
  }

  isMysql(): boolean {
    return this.dialect === 'mysql';
  }

  isPostgres(): boolean {
    return this.dialect === 'postgres';
  }

  isMssql(): boolean {
    return this.dialect === 'mssql';
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  getNowFunction(): string {
    switch (this.dialect) {
      case 'mysql':
        return 'NOW()';
      case 'postgres':
        return 'NOW()';
      case 'mssql':
        return 'GETDATE()';
      default:
        return 'NOW()';
    }
  }

  getDateDiffFunction(start: string, end: string): string {
    switch (this.dialect) {
      case 'mysql':
        return `DATEDIFF(day, ${start}, ${end})`;
      case 'postgres':
        return `DATE_PART('day', ${end} - ${start})`;
      case 'mssql':
        return `DATEDIFF(day, ${start}, ${end})`;
      default:
        return `DATEDIFF(day, ${start}, ${end})`;
    }
  }
}