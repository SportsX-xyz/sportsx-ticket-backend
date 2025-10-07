import { Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { CustomerAuthGuard } from '../core/guards/customer-auth.guard'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ApiTags } from '@nestjs/swagger'
import { Inject } from '@nestjs/common'
import { CUSTOMER_JWT_SERVICE } from '../auth/auth.module'
import { JwtService } from '@nestjs/jwt'
import { OrganizerService } from './organizer.service'
import { FastifyRequest } from 'fastify'
import { CustomerJwtUserData } from '../../../types'
import { SettingsDto } from './dto/settings.dto'
import { Body } from '@nestjs/common'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { AddEventStaffDto } from './dto/add-event-staff'
import { AddEventTicketTypeDto } from './dto/add-event-ticket-type.dto'
import { UpdateEventTicketDto } from './dto/update-event-ticket.dto'
import { AddEventTicketTypeWithTicketsDto } from './dto/add-event-ticket-type-with-tickets-dto'

@UseGuards(CustomerAuthGuard)
@Controller('organizer')
@ApiBearerAuth('jwt')
@ApiTags('Organizer')
export class OrganizerController {
  constructor(
    @Inject(CUSTOMER_JWT_SERVICE)
    private readonly jwtService: JwtService,
    private readonly organizerService: OrganizerService
  ) {}

  @Get('is-organizer')
  @ApiOperation({
    summary: 'Check if the customer is an organizer',
  })
  async isOrganizer(@Req() req: FastifyRequest) {
    return this.organizerService.isOrganizer(
      req.user as unknown as CustomerJwtUserData
    )
  }

  @Post('settings')
  @ApiOperation({
    summary: 'Update organizer settings',
  })
  async updateSettings(@Req() req: FastifyRequest, @Body() dto: SettingsDto) {
    return this.organizerService.updateSettings(
      req.user as unknown as CustomerJwtUserData,
      dto
    )
  }

  @Get('settings')
  @ApiOperation({
    summary: 'Get organizer settings',
  })
  async getSettings(@Req() req: FastifyRequest) {
    return this.organizerService.getSettings(
      req.user as unknown as CustomerJwtUserData
    )
  }

  @Post('event')
  @ApiOperation({
    summary: 'Create an event',
  })
  async createEvent(@Req() req: FastifyRequest, @Body() dto: CreateEventDto) {
    return this.organizerService.createEvent(
      req.user as unknown as CustomerJwtUserData,
      dto
    )
  }

  @Get('events')
  @ApiOperation({
    summary: 'Get organizer events',
  })
  async getEvents(@Req() req: FastifyRequest) {
    return this.organizerService.getEvents(
      req.user as unknown as CustomerJwtUserData
    )
  }

  @Get('event/:id')
  @ApiOperation({
    summary: 'Get an event',
  })
  async getEvent(@Req() req: FastifyRequest, @Param('id') id: string) {
    return this.organizerService.getEvent(
      req.user as unknown as CustomerJwtUserData,
      id
    )
  }

  @Put('event/:id')
  @ApiOperation({
    summary: 'Update an event',
  })
  async updateEvent(
    @Req() req: FastifyRequest,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto
  ) {
    return this.organizerService.updateEvent(
      req.user as unknown as CustomerJwtUserData,
      id,
      dto
    )
  }

  @Post('event/:id/staff')
  @ApiOperation({
    summary: 'Add an event staff',
  })
  async addEventStaff(
    @Req() req: FastifyRequest,
    @Param('id') id: string,
    @Body() dto: AddEventStaffDto
  ) {
    return this.organizerService.addEventStaff(
      req.user as unknown as CustomerJwtUserData,
      id,
      dto
    )
  }

  @Get('event/:id/staffs')
  @ApiOperation({
    summary: 'Get event staffs',
  })
  async getEventStaffs(@Req() req: FastifyRequest, @Param('id') id: string) {
    return this.organizerService.getEventStaffs(
      req.user as unknown as CustomerJwtUserData,
      id
    )
  }

  @Delete('event/:id/staff/:staffId')
  @ApiOperation({
    summary: 'Remove an event staff',
  })
  async removeEventStaff(
    @Req() req: FastifyRequest,
    @Param('id') id: string,
    @Param('staffId') staffId: string
  ) {
    return this.organizerService.removeEventStaff(
      req.user as unknown as CustomerJwtUserData,
      id,
      staffId
    )
  }

  @Post('event/:id/ticket-type-with-tickets')
  @ApiOperation({
    summary: 'Add event ticket type with tickets',
  })
  async addEventTicketTypeWithTickets(
    @Req() req: FastifyRequest,
    @Param('id') id: string,
    @Body() dto: AddEventTicketTypeWithTicketsDto
  ) {
    return this.organizerService.addEventTicketTypeWithTickets(
      req.user as unknown as CustomerJwtUserData,
      id,
      dto
    )
  }

  @Post('event/:id/ticket-type')
  @ApiOperation({
    summary: 'Add event ticket type',
  })
  async addEventTicketType(
    @Req() req: FastifyRequest,
    @Param('id') id: string,
    @Body() dto: AddEventTicketTypeDto
  ) {
    return this.organizerService.addEventTicketType(
      req.user as unknown as CustomerJwtUserData,
      id,
      dto
    )
  }

  @Get('event/:id/ticket-types')
  @ApiOperation({
    summary: 'Get event ticket types',
  })
  async getEventTicketTypes(
    @Req() req: FastifyRequest,
    @Param('id') id: string
  ) {
    return this.organizerService.getEventTicketTypes(
      req.user as unknown as CustomerJwtUserData,
      id
    )
  }

  @Delete('event/:id/ticket-type/:ticketTypeId')
  @ApiOperation({
    summary: 'Remove an event ticket type',
  })
  async removeEventTicketType(
    @Req() req: FastifyRequest,
    @Param('id') id: string,
    @Param('ticketTypeId') ticketTypeId: string
  ) {
    return this.organizerService.removeEventTicketType(
      req.user as unknown as CustomerJwtUserData,
      id,
      ticketTypeId
    )
  }

  @Get('event/:id/tickets')
  @ApiOperation({
    summary: 'Get event tickets',
  })
  async getEventTickets(@Req() req: FastifyRequest, @Param('id') id: string) {
    return this.organizerService.getEventTickets(
      req.user as unknown as CustomerJwtUserData,
      id
    )
  }

  @Put('event/:id/ticket/:ticketId')
  @ApiOperation({
    summary: 'Update an event ticket to new, not exist or not for sale',
  })
  async updateEventTicket(
    @Req() req: FastifyRequest,
    @Param('id') id: string,
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateEventTicketDto
  ) {
    return this.organizerService.updateEventTicket(
      req.user as unknown as CustomerJwtUserData,
      id,
      ticketId,
      dto
    )
  }
}
