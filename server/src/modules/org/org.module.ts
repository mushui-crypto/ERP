import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgService } from './org.service';
import { OrgController } from './org.controller';
import { Org } from '../../database/entities/org.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Org])],
  providers: [OrgService],
  controllers: [OrgController],
  exports: [OrgService],
})
export class OrgModule {}
