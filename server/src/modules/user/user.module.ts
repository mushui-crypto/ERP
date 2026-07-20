import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserRoleService } from './user-role.service';
import { UserController } from './user.controller';
import { User } from '../../database/entities/user.entity';
import { SysUserRole } from '../../database/entities/sys-user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, SysUserRole])],
  providers: [UserService, UserRoleService],
  controllers: [UserController],
  exports: [UserService, UserRoleService],
})
export class UserModule {}