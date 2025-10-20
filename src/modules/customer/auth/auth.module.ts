import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

export const CUSTOMER_JWT_SERVICE = 'CUSTOMER_JWT_SERVICE'
export const CUSTOMER_JWT_CHECKIN_SERVICE = 'CUSTOMER_JWT_CHECKIN_SERVICE'
@Module({
  imports: [
    ConfigModule,
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     ...(await configService.get('jwt-customer')), // 使用不同的配置键名
    //   }),
    // }),
  ],
  providers: [
    {
      provide: CUSTOMER_JWT_SERVICE,
      // useExisting: JwtService, // This will use the JwtService instance from the current module
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // 获取第一个配置
        const jwtConfig = await configService.get('jwt-customer')
        // 手动创建 JwtService 实例
        return new JwtService(jwtConfig)
      },
    },
    {
      provide: CUSTOMER_JWT_CHECKIN_SERVICE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // 获取第二个配置（假设键名为 jwt-customer-checkin）
        const checkinJwtConfig = await configService.get('jwt-customer-checkin')
        // 手动创建另一个 JwtService 实例
        return new JwtService(checkinJwtConfig)
      },
    },
  ],
  exports: [CUSTOMER_JWT_SERVICE, CUSTOMER_JWT_CHECKIN_SERVICE],
})
export class CustomerAuthModule {}
