import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { I18nService } from 'nestjs-i18n'
import { ApiException } from '../exceptions/api.exception'

@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly i18n: I18nService
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const httpContext = host.switchToHttp()

    const request = httpContext.getRequest<FastifyRequest>()
    const response = httpContext.getResponse<FastifyReply>()

    const userAgent = request.headers['user-agent']
    const { ip, method, url } = request

    const statusCode = exception.getStatus()
    const message =
      exception.getResponse() &&
      (exception.getResponse() as { message?: string[] | string }).message
        ? (exception.getResponse() as { message: string[] | string }).message
        : exception.getResponse()

    let data
    if (exception instanceof ApiException) {
      console.log({
        message,
        translated: this.i18n.t(`errors.${message}`),
      })
      data = {
        code: exception.getErrorCode(),
        status: 'error',
        data: {
          message: this.i18n.t(`errors.${message}`) ?? message,
          path: request.url,
        },
      }
    } else {
      data = {
        code: statusCode,
        status: 'error',
        data: {
          message,
          path: request.url,
        },
      }
    }

    const userInfo = request.user?.id
      ? `USER:${request.user?.username}(${request.user?.id})`
      : 'USER:guest'

    this.logger.error(
      `[${method} › ${url}] ${userInfo} IP:${ip} UA:${userAgent} CODE:${
        response.statusCode
      } ERR:${JSON.stringify(data)}`
    )

    response.status(statusCode).send(data)
  }
}
