import helmet from '@fastify/helmet'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { registerBusinessSwagger } from './registerBusinessSwagger'
import { AppModule } from './app.module'
import { registerAdminSwagger } from './registerAdminSwagger'

async function bootstrap() {
  const adapter = new FastifyAdapter()
  adapter.enableCors({
    origin: [
      // localhost 所有端口
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
      // *.tortorcoin 所有子域名
      /^https?:\/\/[^.]*\.tortorcoin\.com$/,
      /^https?:\/\/tortorcoin\.com$/,
      // *.sportsx.fun 所有子域名
      /^https?:\/\/[^.]*\.sportsx\.fun$/,
      /^https?:\/\/sportsx\.fun$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'x-lang',
    ],
    maxAge: 86400, // 预检请求结果缓存时间（秒）
  })

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter
  )

  // Set global prefix
  // app.setGlobalPrefix('api')

  await app.register(helmet)

  // 使用 Winston logger 作为全局日志
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))

  registerBusinessSwagger(app)
  registerAdminSwagger(app)

  const configService = app.get(ConfigService)

  const port = configService.get('NEST_SERVER_PORT')
    ? Number.parseInt(configService.get('NEST_SERVER_PORT'), 10)
    : 3000

  await app.listen(port, '0.0.0.0')
}

bootstrap()
