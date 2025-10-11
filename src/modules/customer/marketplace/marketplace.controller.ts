import { Controller, Get, Param } from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { CustomerAuthGuard } from '../core/guards/customer-auth.guard'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ApiTags } from '@nestjs/swagger'
import { MarketplaceService } from './marketplace.service'
import { Public } from '../core/decorators'

@UseGuards(CustomerAuthGuard)
@Controller('marketplace')
@ApiBearerAuth('jwt')
@ApiTags('Marketplace')
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  @Get('events')
  @Public()
  @ApiOperation({
    summary: 'Get marketplace events',
  })
  async getEvents() {
    return this.marketplaceService.getEvents()
  }

  @Get('event/:eventId')
  @Public()
  @ApiOperation({
    summary: 'Get marketplace event',
  })
  async getEvent(@Param('eventId') eventId: string) {
    return this.marketplaceService.getEvent(eventId)
  }

  @Get('event/:eventId/types')
  @Public()
  @ApiOperation({
    summary: 'Get marketplace event ticket types',
  })
  async getEventTicketTypes(@Param('eventId') eventId: string) {
    return this.marketplaceService.getEventTicketTypes(eventId)
  }

  @Get('event/:eventId/tickets')
  @Public()
  @ApiOperation({
    summary: 'Get marketplace event tickets',
  })
  async getEventTickets(@Param('eventId') eventId: string) {
    return this.marketplaceService.getEventTickets(eventId)
  }
}
