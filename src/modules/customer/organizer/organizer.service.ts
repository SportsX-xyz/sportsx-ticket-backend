import { Injectable } from '@nestjs/common'
import { CustomerJwtUserData } from '../../../types'
import { PrismaService } from '@/modules/shared/prisma/prisma.service'
import { ApiException } from '@/exceptions/api.exception'
import {
  ERROR_CUSTOMER_NOT_ACTIVE,
  ERROR_CUSTOMER_NOT_FOUND,
  ERROR_CUSTOMER_NOT_ORGANIZER,
  ERROR_EVENT_ACTIVE,
  ERROR_EVENT_NOT_BELONG_TO_YOU,
  ERROR_EVENT_NOT_FOUND,
  ERROR_EVENT_STAFF_ALREADY_EXISTS,
  ERROR_EVENT_TICKET_NOT_FOUND,
  ERROR_EVENT_TICKET_STATUS_NOT_ALLOWED_UPDATE,
  ERROR_EVENT_TICKET_TYPE_HAS_TICKETS,
  ERROR_EVENT_TICKET_TYPE_NOT_FOUND,
} from '@/constants/error-code'
import { SettingsDto } from './dto/settings.dto'
import {
  Customer,
  CustomerStatus,
  EventStatus,
  TicketStatus,
  TicketTypeStatus,
} from '@prisma/client'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { AddEventStaffDto } from './dto/add-event-staff'
import { AddEventTicketTypeDto } from './dto/add-event-ticket-type.dto'
import { delay } from '../../../utils'
import { UpdateEventTicketDto } from './dto/update-event-ticket.dto'
import { AddEventTicketTypeWithTicketsDto } from './dto/add-event-ticket-type-with-tickets-dto'

@Injectable()
export class OrganizerService {
  constructor(private readonly prisma: PrismaService) {}
  assertValidOrganizer(customer: Customer) {
    if (!customer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_FOUND)
    }
    if (customer.status !== CustomerStatus.ACTIVE) {
      throw new ApiException(ERROR_CUSTOMER_NOT_ACTIVE)
    }
    if (!customer.isOrganizer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_ORGANIZER)
    }
  }
  async isOrganizer(
    user: CustomerJwtUserData
  ): Promise<{ isOrganizer: boolean }> {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    if (!customer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_FOUND)
    }

    if (!customer.isOrganizer) {
      return {
        isOrganizer: false,
      }
    }

    return {
      isOrganizer: true,
    }
  }

  async updateSettings(user: CustomerJwtUserData, dto: SettingsDto) {
    const { customerId, walletId } = user
    const { resaleFeeRate, maxResaleTimes } = dto
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    await this.prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        resaleFeeRate,
        maxResaleTimes,
      },
    })
  }

  async getSettings(user: CustomerJwtUserData) {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    return {
      resaleFeeRate: customer.resaleFeeRate,
      maxResaleTimes: customer.maxResaleTimes,
    }
  }

  async createEvent(user: CustomerJwtUserData, dto: CreateEventDto) {
    const { customerId, walletId } = user
    const {
      name,
      address,
      startTime,
      endTime,
      ticketReleaseTime,
      stopSaleBefore,
      description,
      resaleFeeRate,
      maxResaleTimes,
      ipfsUri,
    } = dto
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.create({
      data: {
        name,
        address,
        startTime,
        endTime,
        ticketReleaseTime,
        stopSaleBefore,
        description,
        resaleFeeRate,
        maxResaleTimes,
        ipfsUri: ipfsUri || null,
        customer: {
          connect: {
            id: customerId,
          },
        },

        // 默认为未开始，因为还要配置活动类型，生成票数据
        status: EventStatus.INACTIVE,
      },
    })

    return event
  }

  async getEvents(user: CustomerJwtUserData) {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const events = this.prisma.event.findMany({
      where: {
        customerId,
        status: {
          in: [EventStatus.ACTIVE, EventStatus.INACTIVE],
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    })

    return events
  }

  async getEvent(user: CustomerJwtUserData, eventId: string) {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    if (event.customerId !== customerId) {
      throw new ApiException(ERROR_EVENT_NOT_BELONG_TO_YOU)
    }

    return event
  }

  async updateEvent(
    user: CustomerJwtUserData,
    eventId: string,
    dto: UpdateEventDto
  ) {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    if (event.customerId !== customerId) {
      throw new ApiException(ERROR_EVENT_NOT_BELONG_TO_YOU)
    }

    return this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        ...dto,
      },
    })
  }

  async addEventStaff(
    user: CustomerJwtUserData,
    eventId: string,
    dto: AddEventStaffDto
  ) {
    const { customerId, walletId } = user
    const { email } = dto
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    if (event.customerId !== customerId) {
      throw new ApiException(ERROR_EVENT_NOT_BELONG_TO_YOU)
    }

    const staffCustomer = await this.prisma.customer.findUnique({
      where: {
        email,
      },
    })

    if (!staffCustomer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_FOUND)
    }

    const findExistEventStaff = await this.prisma.eventStaff.findUnique({
      where: {
        eventId_staffId: {
          eventId,
          staffId: staffCustomer.id,
        },
      },
    })

    if (findExistEventStaff) {
      throw new ApiException(ERROR_EVENT_STAFF_ALREADY_EXISTS)
    }

    return this.prisma.eventStaff.create({
      data: {
        event: {
          connect: {
            id: eventId,
          },
        },
        staff: {
          connect: {
            id: staffCustomer.id,
          },
        },
        operator: {
          connect: {
            id: customerId,
          },
        },
      },
    })
  }

  async getEventStaffs(user: CustomerJwtUserData, eventId: string) {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    if (event.customerId !== customerId) {
      throw new ApiException(ERROR_EVENT_NOT_BELONG_TO_YOU)
    }

    return this.prisma.eventStaff.findMany({
      where: {
        eventId,
      },
      include: {
        event: true,
        staff: {
          select: {
            email: true,
          },
        },
        operator: {
          select: {
            email: true,
          },
        },
      },
    })
  }

  async removeEventStaff(
    user: CustomerJwtUserData,
    eventId: string,
    staffId: string
  ) {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    if (event.customerId !== customerId) {
      throw new ApiException(ERROR_EVENT_NOT_BELONG_TO_YOU)
    }

    return this.prisma.eventStaff.delete({
      where: {
        eventId_staffId: {
          eventId,
          staffId,
        },
      },
    })
  }

  async addEventTicketTypeWithTickets(
    user: CustomerJwtUserData,
    eventId: string,
    dto: AddEventTicketTypeWithTicketsDto
  ) {
    const { customerId, walletId } = user
    const { tierName, tierPrice, tickets } = dto
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    if (event.customerId !== customerId) {
      throw new ApiException(ERROR_EVENT_NOT_BELONG_TO_YOU)
    }

    let eventTicketType = await this.prisma.eventTicketType.create({
      data: {
        event: {
          connect: {
            id: eventId,
          },
        },
        tierName,
        tierPrice,
        initStatus: TicketTypeStatus.NEW,
      },
    })

    for (let ticket of tickets) {
      await this.prisma.eventTicket.create({
        data: {
          event: {
            connect: {
              id: eventId,
            },
          },
          ticketType: {
            connect: {
              id: eventTicketType.id,
            },
          },
          rowNumber: ticket.rowNumber,
          columnNumber: ticket.columnNumber,
          name: ticket.name,
          initialPrice: ticket.price,
          previousPrice: ticket.price,
          price: ticket.price,

          // 基于放票时间
          saleStartTime: event.ticketReleaseTime,

          // 用活动结束时间减去活动结束前多少分钟停止放票
          saleEndTime: new Date(
            event.endTime.getTime() - event.stopSaleBefore * 60000
          ),
          status: ticket.status,
        },
      })
      await delay(10)
    }

    return eventTicketType
  }

  async addEventTicketType(
    user: CustomerJwtUserData,
    eventId: string,
    dto: AddEventTicketTypeDto
  ) {
    const { customerId, walletId } = user
    const { tierName, tierPrice, tierRows, tierColumns } = dto
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    if (event.customerId !== customerId) {
      throw new ApiException(ERROR_EVENT_NOT_BELONG_TO_YOU)
    }

    let eventTicketType = await this.prisma.eventTicketType.create({
      data: {
        event: {
          connect: {
            id: eventId,
          },
        },
        tierName,
        tierPrice,
        tierRows,
        tierColumns,
        initStatus: TicketTypeStatus.NEW,
      },
    })

    // 初始化票数据，生成所有票，阻塞执行
    for (let i = 1; i <= tierRows; i++) {
      for (let j = 1; j <= tierColumns; j++) {
        await this.prisma.eventTicket.create({
          data: {
            event: {
              connect: {
                id: eventId,
              },
            },
            ticketType: {
              connect: {
                id: eventTicketType.id,
              },
            },
            rowNumber: i,
            columnNumber: j,
            name: `${i}-${j}`,
            initialPrice: tierPrice,
            previousPrice: tierPrice,
            price: tierPrice,

            // 基于放票时间
            saleStartTime: event.ticketReleaseTime,

            // 用活动结束时间减去活动结束前多少分钟停止放票
            saleEndTime: new Date(
              event.endTime.getTime() - event.stopSaleBefore * 60000
            ),
            status: TicketStatus.NEW,
          },
        })
        await delay(10)
      }
    }

    // 更新 initStatus
    eventTicketType = await this.prisma.eventTicketType.update({
      where: {
        id: eventTicketType.id,
      },
      data: {
        initStatus: TicketTypeStatus.DONE,
      },
    })

    return eventTicketType
  }

  async getEventTicketTypes(user: CustomerJwtUserData, eventId: string) {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    if (event.customerId !== customerId) {
      throw new ApiException(ERROR_EVENT_NOT_BELONG_TO_YOU)
    }

    const eventTicketTypes: any[] = await this.prisma.eventTicketType.findMany({
      where: {
        eventId,
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

  async removeEventTicketType(
    user: CustomerJwtUserData,
    eventId: string,
    ticketTypeId: string
  ) {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    if (event.customerId !== customerId) {
      throw new ApiException(ERROR_EVENT_NOT_BELONG_TO_YOU)
    }

    // 判断如果当前活动处于 ACTIVE状态，则不允许删除
    if (event.status === EventStatus.ACTIVE) {
      throw new ApiException(ERROR_EVENT_ACTIVE)
    }

    // 判断如果存在任何票处于SOLD, RESALE, USED 状态，则不允许删除
    const eventTicket = await this.prisma.eventTicket.findFirst({
      where: {
        ticketTypeId,
        status: {
          in: [TicketStatus.SOLD, TicketStatus.RESALE, TicketStatus.USED],
        },
      },
    })

    if (eventTicket) {
      throw new ApiException(ERROR_EVENT_TICKET_TYPE_HAS_TICKETS)
    }

    // TODO: 判断订单表里有关联票的订单数据，则不允许删除，此时可能用户尚未支付，还处于NEW的状态，仍然是不允许删除的

    // 如果没有被使用的票数据，则这里会删除所有此类型的票数据
    await this.prisma.eventTicket.deleteMany({
      where: {
        ticketTypeId,
      },
    })

    // 删除票类型
    const eventTicketType = await this.prisma.eventTicketType.delete({
      where: {
        id: ticketTypeId,
      },
    })

    return eventTicketType
  }

  async getEventTickets(user: CustomerJwtUserData, eventId: string) {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    if (event.customerId !== customerId) {
      throw new ApiException(ERROR_EVENT_NOT_BELONG_TO_YOU)
    }

    return this.prisma.eventTicket.findMany({
      where: {
        eventId,
      },
      include: {
        ticketType: true,
      },
      orderBy: [
        {
          rowNumber: 'asc',
        },
        {
          columnNumber: 'asc',
        },
      ],
    })
  }

  // 更新票数据，暂定只能更新状态，而且只能有条件的更新为
  // NEW, NOT_EXIST, NOT_FOR_SALE
  async updateEventTicket(
    user: CustomerJwtUserData,
    eventId: string,
    ticketId: string,
    dto: UpdateEventTicketDto
  ) {
    const { customerId, walletId } = user
    const { status, name } = dto
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidOrganizer(customer)

    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    if (event.customerId !== customerId) {
      throw new ApiException(ERROR_EVENT_NOT_BELONG_TO_YOU)
    }

    const eventTicket = await this.prisma.eventTicket.findUnique({
      where: {
        id: ticketId,
      },
    })

    if (!eventTicket) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_FOUND)
    }

    if (eventTicket.eventId !== eventId) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_FOUND)
    }

    // 只有活动处于 INACTIVE 状态时才允许修改票数据
    if (event.status !== EventStatus.INACTIVE) {
      throw new ApiException(ERROR_EVENT_ACTIVE)
    }

    // 这里意味着只有票处于这3个状态时才允许修改，也只能修改为这3个状态
    if (
      ![
        TicketStatus.NEW,
        TicketStatus.NOT_EXIST,
        TicketStatus.NOT_FOR_SALE,
      ].includes(status)
    ) {
      throw new ApiException(ERROR_EVENT_TICKET_STATUS_NOT_ALLOWED_UPDATE)
    }

    return this.prisma.eventTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        status: dto.status,
        name: name || eventTicket.name,
      },
    })
  }
}
