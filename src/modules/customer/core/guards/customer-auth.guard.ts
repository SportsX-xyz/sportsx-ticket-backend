// src/modules/customer/guards/customer-auth.guard.ts
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { Inject } from '@nestjs/common'
import { CUSTOMER_JWT_SERVICE } from '../../auth/auth.module'
import { IS_PUBLIC_KEY } from '@/modules/admin/core/decorators'
import { I18nService } from 'nestjs-i18n'

@Injectable()
export class CustomerAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject(CUSTOMER_JWT_SERVICE)
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
    private readonly i18n: I18nService
  ) {
    super()
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    if (request.url.startsWith('/admin/')) {
      return true // 如果是 /admin/ 开头的路径，直接放行
    }

    // 检查是否是公开接口
    const isPublic =
      this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false

    if (isPublic) {
      return true
    }
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException(this.i18n.t('common.tokenInvalid'))
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.configService.get('jwt-customer')
      )
      request.user = payload
      return true
    } catch {
      throw new UnauthorizedException(this.i18n.t('common.tokenExpired'))
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
