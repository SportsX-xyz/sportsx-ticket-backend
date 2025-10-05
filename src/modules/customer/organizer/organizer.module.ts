import { Module } from '@nestjs/common'
import { OrganizerController } from './organizer.controller'
import { OrganizerService } from './organizer.service'
import { CustomerAuthModule } from '../auth/auth.module'

@Module({
  controllers: [OrganizerController],
  providers: [OrganizerService],
  imports: [CustomerAuthModule],
})
export class OrganizerModule {}
