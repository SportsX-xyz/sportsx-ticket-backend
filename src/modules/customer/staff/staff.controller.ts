import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { CustomerAuthGuard } from '../core/guards/customer-auth.guard'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ApiTags } from '@nestjs/swagger'
import { StaffService } from './staff.service'
import { FastifyRequest } from 'fastify'
import { CustomerJwtUserData } from '../../../types'
import { CheckinDto } from './dto/checkin.dto'

@UseGuards(CustomerAuthGuard)
@Controller('staff')
@ApiBearerAuth('jwt')
@ApiTags('Staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('is-staff')
  @ApiOperation({
    summary: 'Check if the customer is a staff',
  })
  async isStaff(@Req() req: FastifyRequest) {
    return this.staffService.isStaff(req.user as unknown as CustomerJwtUserData)
  }

  @Get('events')
  @ApiOperation({
    summary: 'Get events as staff',
  })
  async events(@Req() req: FastifyRequest) {
    return this.staffService.events(req.user as unknown as CustomerJwtUserData)
  }

  @Post('check-in')
  @ApiOperation({
    summary: 'Check in',
  })
  async checkIn(@Req() req: FastifyRequest, @Body() dto: CheckinDto) {
    return this.staffService.checkIn(
      req.user as unknown as CustomerJwtUserData,
      dto
    )
  }
}
