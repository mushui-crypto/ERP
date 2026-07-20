import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { SystemConfig } from '../../database/entities/system-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig])],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}