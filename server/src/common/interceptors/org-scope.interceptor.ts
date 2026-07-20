import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class OrgScopeInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    
    const orgId = request.user?.orgId;
    const dataCenterId = request.user?.dataCenterId;
    
    if (orgId) {
      const queryRunner = this.dataSource.createQueryRunner();
      request.orgScope = {
        orgId,
        dataCenterId,
        queryRunner,
      };
    }
    
    return next.handle();
  }
}