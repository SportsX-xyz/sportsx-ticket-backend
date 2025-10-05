import { Controller, Get, Post, Req } from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { CustomerAuthGuard } from '../core/guards/customer-auth.guard'
import { Public } from '../core/decorators'
import { JwtService } from '@nestjs/jwt'
import { Inject } from '@nestjs/common'
import { CUSTOMER_JWT_SERVICE } from '../auth/auth.module'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { FastifyRequest } from 'fastify'
import { Body } from '@nestjs/common'
import { PrivyDto } from './dto/privy.dto'
import { UserService } from './user.service'
import { ApiTags } from '@nestjs/swagger'
import { CustomerJwtUserData } from '../../../types'

@UseGuards(CustomerAuthGuard)
@Controller('customer')
@ApiBearerAuth('jwt')
@ApiTags('Customer')
export class UserController {
  constructor(
    @Inject(CUSTOMER_JWT_SERVICE)
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  // @Get('info')
  // async info(@Req() req: FastifyRequest) {
  //   console.log('req.user', req.user)
  //   return req.user
  // }

  // @Post('token')
  // @Public()
  // async sign() {
  //   return this.jwtService.sign({
  //     a: 1,
  //   })
  // }

  @Post('privy')
  @Public()
  @ApiOperation({
    summary: 'Login with privy',
  })
  async privy(@Body() dto: PrivyDto) {
    return this.userService.privy(dto)
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user info',
  })
  async me(@Req() req: FastifyRequest) {
    return this.userService.me(req.user as unknown as CustomerJwtUserData)
  }
}
