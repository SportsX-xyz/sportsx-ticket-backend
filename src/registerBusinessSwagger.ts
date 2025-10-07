import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Module } from '@nestjs/common'
import { UserModule } from '@/modules/customer/user/user.module'
import { OrganizerModule } from '@/modules/customer/organizer/organizer.module'
import { AppModule } from './app.module'
import { MarketplaceModule } from '@/modules/customer/marketplace/marketplace.module'
import { StaffModule } from './modules/customer/staff/staff.module'
// Create an empty module
@Module({})
class EmptyModule {}

export const registerBusinessSwagger = (app: NestFastifyApplication) => {
  const builder = new DocumentBuilder()
    .setTitle('Hypergate API')

    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: '基于 jwt 的认证',
        in: 'header',
      },
      'jwt'
    )

  // const config = builder.setDescription('Hypergate API 接口文档').build()
  const config = builder.build()
  const document = SwaggerModule.createDocument(app, config, {
    include: [
      AppModule,
      UserModule,
      OrganizerModule,
      MarketplaceModule,
      StaffModule,
    ],
  })
  SwaggerModule.setup('api-doc', app, document)
}
