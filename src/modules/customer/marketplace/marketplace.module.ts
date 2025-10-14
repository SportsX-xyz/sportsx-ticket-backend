import { Module } from '@nestjs/common'
import { MarketplaceController } from './marketplace.controller'
import { CustomerAuthModule } from '../auth/auth.module'
import { MarketplaceService } from './marketplace.service'
import { OrganizerModule } from '../organizer/organizer.module'

@Module({
  controllers: [MarketplaceController],
  imports: [CustomerAuthModule, OrganizerModule],
  providers: [MarketplaceService],
})
export class MarketplaceModule {}
