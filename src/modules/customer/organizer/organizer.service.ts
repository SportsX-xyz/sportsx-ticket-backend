import { Injectable } from '@nestjs/common'
import { CustomerJwtUserData } from '../../../types'
import { PrismaService } from '@/modules/shared/prisma/prisma.service'
import { ApiException } from '@/exceptions/api.exception'
import {
  ERROR_CUSTOMER_NOT_ACTIVE,
  ERROR_CUSTOMER_NOT_FOUND,
  ERROR_CUSTOMER_NOT_ORGANIZER,
  ERROR_EVENT_ACTIVE,
  ERROR_EVENT_AVATAR_INVALID,
  ERROR_EVENT_AVATAR_NOT_FOUND,
  ERROR_EVENT_NOT_BELONG_TO_YOU,
  ERROR_EVENT_NOT_FOUND,
  ERROR_EVENT_PINATA_AVATAR_DUPLICATE,
  ERROR_EVENT_PINATA_AVATAR_INVALID,
  ERROR_EVENT_PINATA_JSON_DUPLICATE,
  ERROR_EVENT_PINATA_JSON_INVALID,
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
  Event,
} from '@prisma/client'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { AddEventStaffDto } from './dto/add-event-staff.dto'
import { AddEventTicketTypeDto } from './dto/add-event-ticket-type.dto'
import { delay, processBase64Image } from '../../../utils'
import { UpdateEventTicketDto } from './dto/update-event-ticket.dto'
import { AddEventTicketTypeWithTicketsDto } from './dto/add-event-ticket-type-with-tickets.dto'
import { PreviewEventDto } from './dto/preview-event.dto'
import { UpdateEventTicketTypeDto } from './dto/update-event-ticket-type.dto'
import { PinataSDK } from 'pinata'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class OrganizerService {
  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async uploadEventJsonToPinata(event, avatarCid: string) {
    const pinataGateway = this.configService.get('PINATA_GATEWAY')
    const pinataJWT = this.configService.get('PINATA_JWT')
    const pinata = new PinataSDK({
      pinataJwt: pinataJWT,
      pinataGateway: pinataGateway,
    })
    const image = await pinata.gateways.public.convert(avatarCid)
    const json = {
      name: event.name,
      description: event.description,
      // external_url: event.external_url,
      image,
      attributes: [
        {
          trait_type: 'Event ID',
          value: event.id,
        },
        {
          trait_type: 'Event Address',
          value: event.address,
        },
        {
          trait_type: 'Event Start Time',
          value: event.startTime,
        },
      ],
    }
    const blob = new Blob([JSON.stringify(json)], {
      type: 'application/json',
    })
    const file = new File([blob], `${event.id}.json`, {
      type: 'application/json',
    })
    const uploadEventJson = await pinata.upload.public.file(file)
    // @ts-ignore
    if (uploadEventJson.is_duplicate) {
      throw new ApiException(ERROR_EVENT_PINATA_JSON_DUPLICATE)
    }
    const jsonCid = uploadEventJson.cid
    const jsonUrl = await pinata.gateways.public.convert(jsonCid)
    return jsonUrl
  }

  async uploadBase64AvatarToPinata(base64String: string, name: string) {
    const pinataGateway = this.configService.get('PINATA_GATEWAY')
    const pinataJWT = this.configService.get('PINATA_JWT')
    const pinata = new PinataSDK({
      pinataJwt: pinataJWT,
      pinataGateway: pinataGateway,
    })

    const { mime, body } = processBase64Image(base64String)
    const binaryString = atob(body) // 解码 base64 为二进制字符串
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i) // 转换为字节数组
    }
    const blob = new Blob([bytes], { type: mime }) // 创建 Blob，指定 MIME 类型
    const file = new File([blob], name, {
      type: mime,
    }) // 自定义文件名和 MIME 类型

    const upload = await pinata.upload.public.file(file)
    // @ts-ignore
    if (upload.is_duplicate) {
      throw new ApiException(ERROR_EVENT_PINATA_AVATAR_DUPLICATE)
    }
    return upload
  }

  async testPinata() {
    const pinataGateway = this.configService.get('PINATA_GATEWAY')
    const pinataJWT = this.configService.get('PINATA_JWT')
    const pinata = new PinataSDK({
      pinataJwt: pinataJWT,
      pinataGateway: pinataGateway,
    })

    try {
      const base64String =
        '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'

      const binaryString = atob(base64String) // 解码 base64 为二进制字符串
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i) // 转换为字节数组
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' }) // 创建 Blob，指定 MIME 类型
      const file = new File([blob], 'my-custom-image.png', {
        type: 'image/png',
      }) // 自定义文件名和 MIME 类型

      const upload = await pinata.upload.public.file(file)
      console.log('upload', upload)

      // const cid = 'bafkreihelssbyatcyprapljotubwkkueqcnixlipweymhp3fvvucfe5u64'
      // const url = await pinata.gateways.public.convert(cid)
      // console.log('url', url)

      // const url = await pinata.gateways.convert(
      //   'bafkreib4pqtikzdjlj4zigobmd63lig7u6oxlug24snlr6atjlmlza45dq'
      // )
      // console.log(`https://${pinataGateway}/ipfs/${cid}`)
    } catch (error) {
      console.error(error)
    }
  }
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

    // check eventAvatar
    if (eventAvatar) {
      const { mime, body } = processBase64Image(eventAvatar)
      if (!mime || !body) {
        throw new ApiException(ERROR_EVENT_AVATAR_INVALID)
      }
    }

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

    const events: any[] = await this.prisma.event.findMany({
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

    // 给每个event添加一个stage的计算属性
    for (let event of events) {
      event.stage = this.getEventStage(event)
    }

    return events
  }

  getEventStage(event: Event) {
    if (event.status === EventStatus.PREVIEW) {
      return 'PREVIEW'
    } else if (event.status === EventStatus.DRAFT) {
      return 'DRAFT'
    } else if (event.status === EventStatus.DISABLED) {
      return 'DISABLED'
    } else {
      // 判断时间，小于ticketReleaseTime，返回PREVIEW
      if (new Date() < event.ticketReleaseTime) {
        return 'PREVIEW'
      }
      // 判断时间，小于event.startTime，大于 releaseTime，返回ONSALE
      else if (
        new Date() < event.startTime &&
        new Date() >= event.ticketReleaseTime
      ) {
        return 'ONSALE'
      }

      // 判断时间处于event.startTime和event.endTime之间，返回ONSALE
      else if (new Date() >= event.startTime && new Date() < event.endTime) {
        return 'LIVE'
      }
      // 判断时间，超过event.endTime，返回ENDED
      else if (new Date() >= event.endTime) {
        return 'ENDED'
      }
    }
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
    event.stage = this.getEventStage(event)

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

  async previewEvent(user: CustomerJwtUserData, eventId: string) {
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

    // TODO: 把eventAvata上传成ipfs文件
    if (!event.eventAvatar) {
      throw new ApiException(ERROR_EVENT_AVATAR_NOT_FOUND)
    }

    const uploadAvatar = await this.uploadBase64AvatarToPinata(
      event.eventAvatar,
      event.id
    )
    const avatarCid = uploadAvatar.cid
    const ipfsUri = await this.uploadEventJsonToPinata(event, avatarCid)

    return this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        status: EventStatus.PREVIEW,
        ipfsUri,
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
