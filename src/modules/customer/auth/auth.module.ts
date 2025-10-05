import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

export const CUSTOMER_JWT_SERVICE = 'CUSTOMER_JWT_SERVICE'
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...(await configService.get('jwt-customer')), // 使用不同的配置键名
      }),
    }),
  ],
  providers: [
    {
      provide: CUSTOMER_JWT_SERVICE,
      useExisting: JwtService, // This will use the JwtService instance from the current module
    },
  ],
  exports: [CUSTOMER_JWT_SERVICE, JwtModule],
})
export class CustomerAuthModule {}
