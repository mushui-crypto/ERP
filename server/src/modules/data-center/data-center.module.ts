import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataCenter } from '../../database/entities/data-center.entity';
import { UserDataCenter } from '../../database/entities/user-data-center.entity';
import { UserOrgRole } from '../../database/entities/user-org-role.entity';
import { Org } from '../../database/entities/org.entity';
import { Role } from '../../database/entities/role.entity';
import { DataCenterService } from './data-center.service';
import { DataCenterController } from './data-center.controller';
import { DataCenterAuthService } from './data-center-auth.service';
import { DataCenterAuthController } from './data-center-auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DataCenter, UserDataCenter, UserOrgRole, Org, Role])],
  controllers: [DataCenterController, DataCenterAuthController],
  providers: [DataCenterService, DataCenterAuthService],
  exports: [DataCenterService, DataCenterAuthService],
})
export class DataCenterModule {}