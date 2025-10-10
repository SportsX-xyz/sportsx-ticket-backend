import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CustomerAuthModule } from '../auth/auth.module'
import { OrganizerModule } from '../organizer/organizer.module'
import { StaffModule } from '../staff/staff.module'
import { ManageModule } from '../manage/manage.module'

@Module({
  imports: [CustomerAuthModule, OrganizerModule, StaffModule, ManageModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
