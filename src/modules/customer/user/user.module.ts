import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CustomerAuthModule } from '../auth/auth.module'

@Module({
  imports: [CustomerAuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
