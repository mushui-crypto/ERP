import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseDialectService } from './services/database-dialect.service';
import { OrgScopeSubscriber } from './subscribers/org-scope.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [DatabaseDialectService, OrgScopeSubscriber],
  exports: [DatabaseDialectService],
})
export class CommonModule {}