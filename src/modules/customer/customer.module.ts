import { Module } from '@nestjs/common'
import { CustomerAuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module';
import { OrganizerModule } from './organizer/organizer.module';

@Module({
  imports: [CustomerAuthModule, UserModule, OrganizerModule],
})
export class CustomerModule {}
