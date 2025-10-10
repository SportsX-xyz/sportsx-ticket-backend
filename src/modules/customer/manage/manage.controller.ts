import { Body, Controller, Get, Param, Put, Query, Req } from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { CustomerAuthGuard } from '../core/guards/customer-auth.guard'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ManageService } from './manage.service'
import { FastifyRequest } from 'fastify'
import { CustomerJwtUserData } from '../../../types'
import { CustomerListDto } from './dto/customer-list.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'

@UseGuards(CustomerAuthGuard)
@Controller('manage')
@ApiBearerAuth('jwt')
@ApiTags('Manage')
export class ManageController {
  constructor(private manageService: ManageService) {}

  @Get('is-admin')
  @ApiOperation({
    summary: 'Check if the customer is an admin',
  })
  async isAdmin(@Req() req: FastifyRequest) {
    return this.manageService.isAdmin(
      req.user as unknown as CustomerJwtUserData
    )
  }

  @Get('customers')
  @ApiOperation({
    summary: 'Get all customers',
  })
  async getCustomers(@Query() query: CustomerListDto) {
    return this.manageService.getCustomers(query)
  }

  @Put('customers/:customerId')
  @ApiOperation({
    summary: 'Update customer',
  })
  async updateCustomer(
    @Req() req: FastifyRequest,
    @Param('customerId') customerId: string,
    @Body() dto: UpdateCustomerDto
  ) {
    return this.manageService.updateCustomer(
      req.user as unknown as CustomerJwtUserData,
      customerId,
      dto
    )
  }
}
