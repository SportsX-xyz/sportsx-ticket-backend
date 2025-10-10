import { Module } from '@nestjs/common'
import { ManageController } from './manage.controller'
import { CustomerAuthModule } from '../auth/auth.module'
import { ManageService } from './manage.service'

@Module({
  imports: [CustomerAuthModule],
  controllers: [ManageController],
  providers: [ManageService],
  exports: [ManageService],
})
export class ManageModule {}
