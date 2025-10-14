import { Module } from '@nestjs/common'
import { StaffController } from './staff.controller'
import { StaffService } from './staff.service'
import { CustomerAuthModule } from '../auth/auth.module'
import { OrganizerModule } from '../organizer/organizer.module'

@Module({
  controllers: [StaffController],
  providers: [StaffService],
  imports: [CustomerAuthModule, OrganizerModule],
  exports: [StaffService],
})
export class StaffModule {}
