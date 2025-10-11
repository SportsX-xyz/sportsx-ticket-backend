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
  ERROR_EVENT_TICKET_TYPE_NOT_MATCH_EVENT,
  ERROR_EVENT_TICKET_TYPE_UPDATE_NOT_ALLOWED,
  ERROR_EVENT_TICKET_UPDATE_NOT_ALLOWED,
  ERROR_EVENT_UPDATE_NOT_ALLOWED,
} from '@/constants/error-code'
import { SettingsDto } from './dto/settings.dto'
import {
  Customer,
  CustomerStatus,
  EventStatus,
  TicketStatus,
} from '@prisma/client'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { AddEventStaffDto } from './dto/add-event-staff.dto'
import { AddEventTicketTypeDto } from './dto/add-event-ticket-type.dto'
import { delay } from '../../../utils'
import { UpdateEventTicketDto } from './dto/update-event-ticket.dto'
import { AddEventTicketTypeWithTicketsDto } from './dto/add-event-ticket-type-with-tickets.dto'
import { PreviewEventDto } from './dto/preview-event.dto'
import { UpdateEventTicketTypeDto } from './dto/update-event-ticket-type.dto'

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
      checkInBefore,
      description,
      eventAvatar,
      resaleFeeRate,
      maxResaleTimes,
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
        checkInBefore,
        description,
        eventAvatar: eventAvatar || null,
        resaleFeeRate,
        maxResaleTimes,
        customer: {
          connect: {
            id: customerId,
          },
        },

        // 默认为DRAFT，因为还要配置活动类型，生成票数据
        status: EventStatus.DRAFT,
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
          in: [EventStatus.ACTIVE, EventStatus.PREVIEW, EventStatus.DRAFT],
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

    const event: any = await this.prisma.event.findUnique({
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

    // 添加关联ticket里的max rowNumber和maxColumnNumber
    const result = await this.prisma.eventTicket.aggregate({
      where: {
        eventId,
      },
      _max: {
        rowNumber: true,
        columnNumber: true,
      },
    })

    event.maxRow = result._max.rowNumber
    event.maxColumn = result._max.columnNumber

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

    if (event.status !== EventStatus.DRAFT) {
      throw new ApiException(ERROR_EVENT_UPDATE_NOT_ALLOWED)
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

  async previewEvent(
    user: CustomerJwtUserData,
    eventId: string,
    dto: PreviewEventDto
  ) {
    const { customerId, walletId } = user
    const { ipfsUri } = dto
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

    if (event.status !== EventStatus.DRAFT) {
      throw new ApiException(ERROR_EVENT_UPDATE_NOT_ALLOWED)
    }

    return this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        ipfsUri,
        status: EventStatus.PREVIEW,
      },
    })
  }

  async publishEvent(user: CustomerJwtUserData, eventId: string) {
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

    if (event.status !== EventStatus.PREVIEW) {
      throw new ApiException(ERROR_EVENT_UPDATE_NOT_ALLOWED)
    }

    return this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        status: EventStatus.ACTIVE,
      },
    })
  }

  async deleteEvent(user: CustomerJwtUserData, eventId: string) {
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

    if (event.status !== EventStatus.DRAFT) {
      throw new ApiException(ERROR_EVENT_UPDATE_NOT_ALLOWED)
    }

    // 检查是否有非NEW状态的票，有则不允许删除
    const eventTicket = await this.prisma.eventTicket.findFirst({
      where: {
        eventId,
        status: {
          in: [
            TicketStatus.LOCK,
            TicketStatus.SOLD,
            TicketStatus.RESALE,
            TicketStatus.USED,
          ],
        },
      },
    })

    if (eventTicket) {
      throw new ApiException(ERROR_EVENT_TICKET_TYPE_HAS_TICKETS)
    }

    // 上面的判断应该可以覆盖订单表，所以暂时不扫描订单表查找该事件。

    // 删除这个Event关联的所有的票
    await this.prisma.eventTicket.deleteMany({
      where: {
        eventId,
      },
    })

    // 删除这个Event关联的所有的票类型
    await this.prisma.eventTicketType.deleteMany({
      where: {
        eventId,
      },
    })

    return this.prisma.event.delete({
      where: {
        id: eventId,
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
    const { ticketTypeId, tickets } = dto
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

    if (
      event.status !== EventStatus.DRAFT &&
      event.status !== EventStatus.PREVIEW
    ) {
      throw new ApiException(ERROR_EVENT_TICKET_TYPE_UPDATE_NOT_ALLOWED)
    }

    let eventTicketType = await this.prisma.eventTicketType.findUnique({
      where: {
        id: ticketTypeId,
      },
    })

    if (!eventTicketType) {
      throw new ApiException(ERROR_EVENT_TICKET_TYPE_NOT_FOUND)
    }

    if (eventTicketType.eventId !== eventId) {
      throw new ApiException(ERROR_EVENT_TICKET_TYPE_NOT_MATCH_EVENT)
    }

    for (let ticket of tickets) {
      // 检查票的状态，DRAFT和PREVIEW阶段添加的票只能是 NEW, NOT_FOR_SALE, NOT_EXIST
      if (
        ![
          TicketStatus.NEW,
          TicketStatus.NOT_EXIST,
          TicketStatus.NOT_FOR_SALE,
        ].includes(ticket.status)
      ) {
        // 忽略，继续处理
        continue
      }

      // 检查坐标，如果相同坐标已经有票，则忽略
      const findTicket = await this.prisma.eventTicket.findFirst({
        where: {
          rowNumber: ticket.rowNumber,
          columnNumber: ticket.columnNumber,
          ticketTypeId: ticketTypeId,
        },
      })
      if (findTicket) {
        continue
      }

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
          price: ticket.price <= 0 ? eventTicketType.tierPrice : ticket.price,

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
    const { tierName, tierPrice, color } = dto
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

    if (
      event.status !== EventStatus.DRAFT &&
      event.status !== EventStatus.PREVIEW
    ) {
      throw new ApiException(ERROR_EVENT_TICKET_TYPE_UPDATE_NOT_ALLOWED)
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
        color,
      },
    })

    return eventTicketType
  }

  async updateEventTicketType(
    user: CustomerJwtUserData,
    eventId: string,
    ticketTypeId: string,
    dto: UpdateEventTicketTypeDto
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

    if (
      event.status !== EventStatus.DRAFT &&
      event.status !== EventStatus.PREVIEW
    ) {
      throw new ApiException(ERROR_EVENT_TICKET_TYPE_UPDATE_NOT_ALLOWED)
    }

    let eventTicketType = await this.prisma.eventTicketType.update({
      where: {
        id: ticketTypeId,
      },
      data: dto,
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

    // 判断如果当前活动不处于 DRAFT或PREVIEW状态，则抛出错误
    if (
      event.status !== EventStatus.DRAFT &&
      event.status !== EventStatus.PREVIEW
    ) {
      throw new ApiException(ERROR_EVENT_TICKET_TYPE_UPDATE_NOT_ALLOWED)
    }

    // 判断如果存在任何票处于LOCK, SOLD, RESALE, USED 状态，则不允许删除
    const eventTicket = await this.prisma.eventTicket.findFirst({
      where: {
        ticketTypeId,
        status: {
          in: [
            TicketStatus.LOCK,
            TicketStatus.SOLD,
            TicketStatus.RESALE,
            TicketStatus.USED,
          ],
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
    const { status, ticketTypeId } = dto
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

    // 只有活动处于 DRAFT或PREVIEW状态时才允许修改票数据
    if (
      event.status !== EventStatus.DRAFT &&
      event.status !== EventStatus.PREVIEW
    ) {
      throw new ApiException(ERROR_EVENT_TICKET_UPDATE_NOT_ALLOWED)
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

    if (ticketTypeId) {
      const ticketType = await this.prisma.eventTicketType.findUnique({
        where: {
          id: ticketTypeId,
        },
      })

      if (!ticketType) {
        throw new ApiException(ERROR_EVENT_TICKET_TYPE_NOT_FOUND)
      }

      if (ticketType.eventId !== eventId) {
        throw new ApiException(ERROR_EVENT_TICKET_TYPE_NOT_MATCH_EVENT)
      }
    }

    return this.prisma.eventTicket.update({
      where: {
        id: ticketId,
      },
      data: dto,
    })
  }
}
