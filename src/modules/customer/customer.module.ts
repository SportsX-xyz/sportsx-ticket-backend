import { Module } from '@nestjs/common'
import { CustomerAuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { OrganizerModule } from './organizer/organizer.module'
import { MarketplaceModule } from './marketplace/marketplace.module'
import { StaffModule } from './staff/staff.module'
import { ManageModule } from './manage/manage.module'

@Module({
  imports: [
    CustomerAuthModule,
    UserModule,
    OrganizerModule,
    MarketplaceModule,
    StaffModule,
    ManageModule,
  ],
})
export class CustomerModule {}
