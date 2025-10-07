import { Controller, Get, Req } from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { CustomerAuthGuard } from '../core/guards/customer-auth.guard'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ApiTags } from '@nestjs/swagger'
import { StaffService } from './staff.service'
import { FastifyRequest } from 'fastify'
import { CustomerJwtUserData } from '../../../types'

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
}
