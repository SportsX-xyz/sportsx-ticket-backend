import { ApiModule } from '@/modules/admin/api/api.module'
import { AuthModule } from '@/modules/admin/auth/auth.module'
import { MenuModule } from '@/modules/admin/menu/menu.module'
import { RoleModule } from '@/modules/admin/role/role.module'
import { UserModule } from '@/modules/admin/user/user.module'
import { Module } from '@nestjs/common'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

// Create an empty module
@Module({})
class EmptyModule {}

export const registerAdminSwagger = (app: NestFastifyApplication) => {
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
    include: [AuthModule, UserModule, RoleModule, MenuModule, ApiModule],
  })
  SwaggerModule.setup('admin-api-doc', app, document)
}
