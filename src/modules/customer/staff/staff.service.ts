import {
  ERROR_CUSTOMER_NOT_ACTIVE,
  ERROR_CUSTOMER_NOT_EVENT_STAFF,
  ERROR_CUSTOMER_NOT_FOUND,
  ERROR_EVENT_ENDED,
  ERROR_EVENT_NOT_FOUND,
  ERROR_EVENT_TICKET_NOT_FOUND,
  ERROR_EVENT_TICKET_NOT_OWNED_BY_CUSTOMER,
  ERROR_EVENT_TICKET_NOT_SOLD,
} from '@/constants/error-code'
import { ApiException } from '@/exceptions/api.exception'
import { Injectable, Inject } from '@nestjs/common'
import { Customer, CustomerStatus, TicketStatus } from '@prisma/client'
import { CustomerJwtUserData } from '../../../types'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { CheckinDto, CheckinVerifyDto } from './dto/checkin.dto'
import { OrganizerService } from '../organizer/organizer.service'
import { CUSTOMER_JWT_CHECKIN_SERVICE } from '@/modules/customer/auth/auth.module'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class StaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizerService: OrganizerService,
    @Inject(CUSTOMER_JWT_CHECKIN_SERVICE)
    private readonly checkInJwtService: JwtService
  ) {}
  async assertValidEventStaff(customer: Customer, eventId: string) {
    if (!customer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_FOUND)
    }
    if (customer.status !== CustomerStatus.ACTIVE) {
      throw new ApiException(ERROR_CUSTOMER_NOT_ACTIVE)
    }

    const { isEventStaff } = await this.isEventStaff(
      {
        customerId: customer.id,
        walletId: customer.walletId,
      },
      eventId
    )

    if (!isEventStaff) {
      throw new ApiException(ERROR_CUSTOMER_NOT_EVENT_STAFF)
    }
  }

  async isStaff(user: CustomerJwtUserData): Promise<{ isStaff: boolean }> {
    const { customerId } = user

    // staff 就是关联了event的用户，在EventStaff表里
    const eventStaff = await this.prisma.eventStaff.findFirst({
      where: {
        staffId: customerId,
      },
    })

    if (!eventStaff) {
      return {
        isStaff: false,
      }
    }

    return {
      isStaff: true,
    }
  }

  async isEventStaff(
    user: CustomerJwtUserData,
    eventId: string
  ): Promise<{ isEventStaff: boolean }> {
    const { customerId } = user

    // staff 就是关联了event的用户，在EventStaff表里
    const eventStaff = await this.prisma.eventStaff.findFirst({
      where: {
        staffId: customerId,
        eventId,
      },
    })

    if (!eventStaff) {
      return {
        isEventStaff: false,
      }
    }

    return {
      isEventStaff: true,
    }
  }

  async events(user: CustomerJwtUserData) {
    const { customerId } = user
    const events: any[] = await this.prisma.eventStaff.findMany({
      where: {
        staffId: customerId,
      },
      include: {
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    for (const staffEvent of events) {
      staffEvent.event.stage = this.organizerService.getEventStage(
        staffEvent.event
      )
      staffEvent.event.checkable = this.organizerService.getCheckable(
        staffEvent.event
      )
    }
    return events
  }

  async checkIn(user: CustomerJwtUserData, dto: CheckinDto) {
    const { customerId } = user
    const { ticketCode, checkInTxHash } = dto

    const payload = await this.checkInJwtService.verifyAsync(ticketCode)

    const ticket = await this.prisma.eventTicket.findUnique({
      where: {
        id: payload.ticketId,
      },
      include: {
        event: true,
      },
    })

    if (!ticket) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_FOUND)
    }

    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })
    await this.assertValidEventStaff(customer, ticket.eventId)

    // 验证，活动结束不可以checkIn
    if (new Date() > ticket.event.endTime) {
      throw new ApiException(ERROR_EVENT_ENDED)
    }

    const userCustomer = await this.prisma.customer.findUnique({
      where: {
        id: payload.customerId,
        status: CustomerStatus.ACTIVE,
      },
    })
    if (!userCustomer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_FOUND)
    }
    if (ticket.ownerId !== userCustomer.id) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_OWNED_BY_CUSTOMER)
    }
    if (ticket.status !== TicketStatus.SOLD) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_SOLD)
    }

    // TODO: 在链上验证人票关系

    // TODO: 在链上把NFT状态改为 isScanned = true
    // 这里暂时因为不知道怎样从后端发起合约调用，改为前端调用，把txHash传过来
    // 暂时不验证txHash是否有效

    const updatedTicket = await this.prisma.eventTicket.update({
      where: {
        id: ticket.id,
      },
      data: {
        status: TicketStatus.USED,
        staffId: customerId,
        checkInAt: new Date(),
        checkInTxHash,
      },
      include: {
        event: true,
      },
    })

    return updatedTicket
  }

  async checkInVerify(user: CustomerJwtUserData, dto: CheckinVerifyDto) {
    const { customerId } = user
    const { ticketCode } = dto

    const payload = await this.checkInJwtService.verifyAsync(ticketCode)

    const ticket = await this.prisma.eventTicket.findUnique({
      where: {
        id: payload.ticketId,
      },
      include: {
        event: true,
      },
    })

    if (!ticket) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_FOUND)
    }

    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })
    await this.assertValidEventStaff(customer, ticket.eventId)

    // 验证，活动结束不可以checkIn
    if (new Date() > ticket.event.endTime) {
      throw new ApiException(ERROR_EVENT_ENDED)
    }

    const userCustomer = await this.prisma.customer.findUnique({
      where: {
        id: payload.customerId,
        status: CustomerStatus.ACTIVE,
      },
    })
    if (!userCustomer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_FOUND)
    }
    if (ticket.ownerId !== userCustomer.id) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_OWNED_BY_CUSTOMER)
    }
    if (ticket.status !== TicketStatus.SOLD) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_SOLD)
    }

    return ticket
  }
}
