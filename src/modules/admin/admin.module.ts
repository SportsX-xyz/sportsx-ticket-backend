import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { RoleModule } from './role/role.module'
import { MenuModule } from './menu/menu.module'
import { ApiModule } from './api/api.module'
import { AuthGuard } from './core/guards'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [AuthModule, UserModule, RoleModule, MenuModule, ApiModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // 权限守卫
    },
  ],
})
export class AdminModule {}
