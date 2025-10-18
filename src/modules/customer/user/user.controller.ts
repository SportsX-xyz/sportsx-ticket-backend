import { Controller, Get, Param, Post, Req, Put } from '@nestjs/common'
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
import { ResaleDto } from './dto/resale.dto'
import { PayDto } from './dto/pay.dto'

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

  @Get('tickets')
  @ApiOperation({
    summary: 'Get current user tickets',
  })
  async tickets(@Req() req: FastifyRequest) {
    return this.userService.tickets(req.user as unknown as CustomerJwtUserData)
  }

  @Get('upcoming-tickets')
  @ApiOperation({
    summary: 'Get current user upcoming tickets',
  })
  async upcomingTickets(@Req() req: FastifyRequest) {
    return this.userService.upcomingTickets(
      req.user as unknown as CustomerJwtUserData
    )
  }

  @Post('resale/:ticketId')
  @ApiOperation({
    summary: 'Resale ticket',
  })
  async resale(
    @Req() req: FastifyRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: ResaleDto
  ) {
    return this.userService.resale(
      req.user as unknown as CustomerJwtUserData,
      ticketId,
      dto
    )
  }

  @Post('unlist/:ticketId')
  @ApiOperation({
    summary: 'Unlist ticket',
  })
  async unlist(
    @Req() req: FastifyRequest,
    @Param('ticketId') ticketId: string
  ) {
    return this.userService.unlist(
      req.user as unknown as CustomerJwtUserData,
      ticketId
    )
  }

  @Get('resales')
  @ApiOperation({
    summary: 'Get current user resales',
  })
  async resales(@Req() req: FastifyRequest) {
    return this.userService.resales(req.user as unknown as CustomerJwtUserData)
  }

  @Post('checkout-ticket/:ticketId')
  @ApiOperation({
    summary: 'Checkout ticket',
  })
  async checkoutTicket(
    @Req() req: FastifyRequest,
    @Param('ticketId') ticketId: string
  ) {
    return this.userService.checkoutTicket(
      req.user as unknown as CustomerJwtUserData,
      ticketId
    )
  }

  @Get('orders/buyer')
  @ApiOperation({
    summary: 'Get current user orders as buyer',
  })
  async ordersBuyer(@Req() req: FastifyRequest) {
    return this.userService.ordersBuyer(
      req.user as unknown as CustomerJwtUserData
    )
  }

  @Get('orders/seller')
  @ApiOperation({
    summary: 'Get current user orders as seller',
  })
  async ordersSeller(@Req() req: FastifyRequest) {
    return this.userService.ordersSeller(
      req.user as unknown as CustomerJwtUserData
    )
  }

  @Put('order/:orderId')
  @ApiOperation({
    summary: 'Update order',
  })
  async updateOrder(
    @Req() req: FastifyRequest,
    @Param('orderId') orderId: string,
    @Body() dto: PayDto
  ) {
    return this.userService.updateOrder(
      req.user as unknown as CustomerJwtUserData,
      orderId,
      dto
    )
  }

  @Post('pay/:orderId')
  @ApiOperation({
    summary: 'Pay order',
  })
  async pay(@Req() req: FastifyRequest, @Param('orderId') orderId: string) {
    return this.userService.pay(
      req.user as unknown as CustomerJwtUserData,
      orderId
    )
  }
}
