import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CustomerAuthModule } from '../auth/auth.module'
import { OrganizerModule } from '../organizer/organizer.module'
import { StaffModule } from '../staff/staff.module'

@Module({
  imports: [CustomerAuthModule, OrganizerModule, StaffModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
