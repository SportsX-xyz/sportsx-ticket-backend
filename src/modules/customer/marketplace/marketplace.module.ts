import { Module } from '@nestjs/common'
import { MarketplaceController } from './marketplace.controller'
import { CustomerAuthModule } from '../auth/auth.module'
import { MarketplaceService } from './marketplace.service';

@Module({
  controllers: [MarketplaceController],
  imports: [CustomerAuthModule],
  providers: [MarketplaceService],
})
export class MarketplaceModule {}
