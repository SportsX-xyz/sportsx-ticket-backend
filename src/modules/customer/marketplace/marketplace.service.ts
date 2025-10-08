import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { EventStatus, TicketStatus } from '@prisma/client'
import { ApiException } from '@/exceptions/api.exception'
import {
  ERROR_EVENT_NOT_ACTIVE,
  ERROR_EVENT_NOT_FOUND,
  ERROR_EVENT_STOP_SALE,
} from '@/constants/error-code'

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents() {
    const events: any[] = await this.prisma.event.findMany({
      where: {
        status: EventStatus.ACTIVE,
      },
    })

    // 统计每个event下有多少可售余票
    for (let event of events) {
      const ticketsLeft = await this.prisma.eventTicket.count({
        where: {
          eventId: event.id,
          status: {
            in: [TicketStatus.NEW, TicketStatus.RESALE],
          },
        },
      })
      event.ticketsLeft = ticketsLeft
    }

    return events
  }

  async getEventTicketTypes(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })
    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }
    if (event.status !== EventStatus.ACTIVE) {
      throw new ApiException(ERROR_EVENT_NOT_ACTIVE)
    }
    const eventTicketTypes: any[] = await this.prisma.eventTicketType.findMany({
      where: {
        eventId,
      },
      select: {
        id: true,
        tierName: true,
      },
    })

    // 统计每种类型的总票数和已售票数
    for (let eventTicketType of eventTicketTypes) {
      const totalTickets = await this.prisma.eventTicket.count({
        where: {
          ticketTypeId: eventTicketType.id,
          status: {
            in: [
              TicketStatus.NEW,
              TicketStatus.SOLD,
              TicketStatus.NOT_FOR_SALE,
              TicketStatus.RESALE,
              TicketStatus.USED,
            ],
          },
        },
      })
      const soldTickets = await this.prisma.eventTicket.count({
        where: {
          ticketTypeId: eventTicketType.id,
          status: {
            in: [TicketStatus.SOLD, TicketStatus.USED, TicketStatus.RESALE],
          },
        },
      })
      eventTicketType.totalTickets = totalTickets
      eventTicketType.soldTickets = soldTickets
    }

    return eventTicketTypes
  }

  async getEventTickets(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })
    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }
    if (event.status !== EventStatus.ACTIVE) {
      throw new ApiException(ERROR_EVENT_NOT_ACTIVE)
    }

    // 判断是否已经停止售票
    // if (
    //   new Date(event.endTime.getTime() - event.stopSaleBefore * 60 * 1000) <
    //   new Date()
    // ) {
    //   throw new ApiException(ERROR_EVENT_STOP_SALE)
    // }

    const eventTickets = await this.prisma.eventTicket.findMany({
      where: {
        eventId,
      },
      select: {
        id: true,
        name: true,
        rowNumber: true,
        columnNumber: true,
        price: true,
        status: true,
        ticketType: {
          select: {
            id: true,
            tierName: true,
          },
        },
      },
    })
    return eventTickets
  }
}
