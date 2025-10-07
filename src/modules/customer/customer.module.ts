import { Module } from '@nestjs/common'
import { CustomerAuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module';
import { OrganizerModule } from './organizer/organizer.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { StaffModule } from './staff/staff.module';

@Module({
  imports: [CustomerAuthModule, UserModule, OrganizerModule, MarketplaceModule, StaffModule],
})
export class CustomerModule {}
