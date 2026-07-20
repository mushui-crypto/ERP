import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmOpportunityController } from './crm-opportunity.controller';
import { CrmOpportunityService } from './crm-opportunity.service';
import { CrmOpportunity } from '../../database/entities/crm-opportunity.entity';
import { CrmSalesStage } from '../../database/entities/crm-sales-stage.entity';
import { CrmOpportunityActivity } from '../../database/entities/crm-opportunity-activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CrmOpportunity, CrmSalesStage, CrmOpportunityActivity])],
  controllers: [CrmOpportunityController],
  providers: [CrmOpportunityService],
})
export class CrmOpportunityModule {}