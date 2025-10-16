import { Injectable } from '@nestjs/common'
import { PrivyDto } from './dto/privy.dto'
import { ConfigService } from '@nestjs/config'
import { PrivyClient } from '@privy-io/server-auth'
import { PrismaService } from '@/modules/shared/prisma/prisma.service'
import { Inject } from '@nestjs/common'
import { CUSTOMER_JWT_SERVICE } from '../auth/auth.module'
import { JwtService } from '@nestjs/jwt'
import { ApiException } from '../../../exceptions/api.exception'
import {
  ERROR_CUSTOMER_NOT_ACTIVE,
  ERROR_CUSTOMER_NOT_FOUND,
  ERROR_EVENT_TICKET_NOT_FOUND,
  ERROR_EVENT_TICKET_NOT_OWNED_BY_CUSTOMER,
  ERROR_EVENT_TICKET_NOT_READY_FOR_RESALE,
  ERROR_EVENT_TICKET_NOT_READY_FOR_SALE,
  ERROR_EVENT_TICKET_NOT_READY_FOR_UNLIST,
  ERROR_EVENT_TICKET_ONLY_ONE_PER_EVENT,
  ERROR_PRIVY_LOGIN_FAILED,
} from '../../../constants/error-code'
import { CustomerJwtUserData } from '../../../types'
import {
  Customer,
  CustomerStatus,
  EventStatus,
  OrderStatus,
  TicketStatus,
} from '@prisma/client'
import { OrganizerService } from '../organizer/organizer.service'
import { StaffService } from '../staff/staff.service'
import { Prisma } from '@prisma/client'
import { ResaleDto } from './dto/resale.dto'
import { ManageService } from '../manage/manage.service'
import { SolanaService } from '@/modules/shared/solana/solana.service'

@Injectable()
export class UserService {
  private readonly privyClient: PrivyClient

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(CUSTOMER_JWT_SERVICE)
    private readonly jwtService: JwtService,
    private readonly organizerService: OrganizerService,
    private readonly staffService: StaffService,
    private readonly manageService: ManageService,
    private readonly solanaService: SolanaService
  ) {
    const appId = this.configService.get('PRIVY_APP_ID')
    const appSecret = this.configService.get('PRIVY_APP_SECRET')
    if (!appId || !appSecret) {
      console.warn('[Privy] Missing PRIVY_APP_ID / PRIVY_APP_SECRET in env')
    }
    this.privyClient = new PrivyClient(appId, appSecret)
  }

  assertValidCustomer(customer: Customer) {
    if (!customer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_FOUND)
    }
    if (customer.status !== CustomerStatus.ACTIVE) {
      throw new ApiException(ERROR_CUSTOMER_NOT_ACTIVE)
    }
  }

  // 取邮箱（若没有就返回 null）
  getEmailFromPrivy(p) {
    return p.email?.address
  }

  // 取所有钱包地址（数组，可能包含 embedded wallet 等）
  getWalletsFromPrivy(p) {
    const addrs = new Set()
    if (p?.wallet?.address) addrs.add(p.wallet.address)
    if (Array.isArray(p?.linkedAccounts)) {
      for (const a of p.linkedAccounts) {
        if (a?.address) addrs.add(a.address)
      }
    }
    return [...addrs]
  }

  async privy(dto: PrivyDto) {
    const { privyToken } = dto

    try {
      const claims = await this.privyClient.verifyAuthToken(privyToken)

      const p: any = await this.privyClient.getUserById(claims.userId) // ← 不要再用 getUser(userId: string)
      // 取邮箱/钱包
      const emailFromPrivy = this.getEmailFromPrivy(p)
      const wallets = this.getWalletsFromPrivy(p)
      console.log('wallets', wallets)
      const walletId = wallets[0] || (null as string | null)

      // 你的 users.email 是 not null，没邮箱时兜底
      const safeEmail = emailFromPrivy

      let user,
        registered = true
      if (walletId) {
        user = await this.prisma.customer.findFirst({
          where: {
            walletId,
          },
        })
      }

      if (!user && emailFromPrivy) {
        user = await this.prisma.customer.findFirst({
          where: {
            email: emailFromPrivy,
          },
        })
      }

      if (!user) {
        registered = false
        user = await this.prisma.customer.create({
          data: {
            email: safeEmail,
            walletId: walletId as string,
            avatarUrl: p?.picture_url || null,
          },
        })
      } else {
        // 补齐缺失信息（有些老用户可能没有 wallet_id / avatar_url）
        const patch: any = {}
        if (!user.walletId) patch.walletId = walletId
        if (!user.avatarUrl && p?.picture_url) patch.avatarUrl = p.picture_url
        if (Object.keys(patch).length)
          await this.prisma.customer.update({
            where: {
              id: user.id,
            },
            data: patch,
          })
      }

      user = await this.prisma.customer.findUnique({
        where: {
          id: user.id,
        },
      })

      const appToken = this.jwtService.sign({
        customerId: user.id,
        walletId: user.walletId,
      })

      return {
        registered,
        user: {
          id: user.id,
          email: user.email,
          walletId: user.walletId,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
        wallets, // 返回所有钱包地址给前端展示 “Server Wallet”
        token: appToken,
      }
    } catch (error) {
      console.error('loginWithPrivy error:', error)
      throw new ApiException(ERROR_PRIVY_LOGIN_FAILED)
    }
  }

  async me(user: CustomerJwtUserData) {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })
    this.assertValidCustomer(customer)

    const { isOrganizer } = await this.organizerService.isOrganizer(user)
    const { isStaff } = await this.staffService.isStaff(user)
    const { isAdmin } = await this.manageService.isAdmin(user)

    return {
      id: customer.id,
      email: customer.email,
      walletId: customer.walletId,
      avatarUrl: customer.avatarUrl,
      createdAt: customer.createdAt,
      isOrganizer,
      isStaff,
      isAdmin,
    }
  }

  async tickets(user: CustomerJwtUserData) {
    const { customerId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })
    this.assertValidCustomer(customer)

    return this.prisma.eventTicket.findMany({
      select: {
        id: true,
        event: {
          select: {
            id: true,
            name: true,
            address: true,
            description: true,
            startTime: true,
            endTime: true,
          },
        },
        ticketType: {
          select: {
            id: true,
            tierName: true,
          },
        },
        lastOrder: {
          select: {
            id: true,
            price: true,
            txHash: true,
            createdAt: true,
          },
        },
        name: true,
        status: true,
        price: true,
        rowNumber: true,
        columnNumber: true,
      },
      where: {
        ownerId: customer.id,
        status: {
          in: [TicketStatus.SOLD, TicketStatus.USED],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async resales(user: CustomerJwtUserData) {
    const { customerId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })
    this.assertValidCustomer(customer)

    const tickets = await this.prisma.$queryRaw`
    SELECT
      t.id,
      t.name,
      t.status,
      t."price",
      t."rowNumber",
      t."columnNumber",
      json_build_object(
        'id', e.id,
        'name', e.name,
        'address', e.address,
        'description', e.description,
        'endTime', e."endTime",
        'stopSaleBefore', e."stopSaleBefore"
      ) AS event,
      json_build_object(
        'id', tt.id,
        'tierName', tt."tierName"
      ) AS "ticketType"
    FROM "EventTicket" t
    INNER JOIN "Event" e ON t."eventId" = e.id
    INNER JOIN "EventTicketType" tt ON t."ticketTypeId" = tt.id
    WHERE
      t."ownerId" = ${customerId}
      AND t.status IN (${TicketStatus.RESALE}::"TicketStatus",
        ${TicketStatus.LOCK}::"TicketStatus")
      -- AND NOW() < (e."endTime" - INTERVAL '1 minute' * e."stopSaleBefore")
    ORDER BY
      t."createdAt" DESC
  `

    return tickets
  }

  async checkoutTicket(user: CustomerJwtUserData, ticketId: string) {
    const { customerId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })
    this.assertValidCustomer(customer)
    const ticket = await this.prisma.eventTicket.findUnique({
      where: {
        id: ticketId,
      },
    })
    if (!ticket) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_FOUND)
    }
    if (
      ![TicketStatus.NEW, TicketStatus.RESALE].includes(ticket.status as any)
    ) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_READY_FOR_SALE)
    }

    // TODO:验证，每个用户每个活动只能买一张票
    // const hasTicket = await this.prisma.eventTicket.findFirst({
    //   where: {
    //     eventId: ticket.eventId,
    //     ownerId: customer.id,
    //     status: {
    //       in: [TicketStatus.SOLD, TicketStatus.USED, TicketStatus.RESALE],
    //     },
    //   },
    // })
    // if (hasTicket) {
    //   throw new ApiException(ERROR_EVENT_TICKET_ONLY_ONE_PER_EVENT)
    // }

    // TODO: 去链上验证票的所属权， 万一发现所属权有问题，怎样处理线下数据。
    const partialSignedTx = await this.solanaService.mintPartialSign(
      customerId,
      ticketId
    )

    // TODO: 应该使用事务的方式
    // await this.prisma.eventTicket.update({
    //   where: {
    //     id: ticket.id,
    //   },
    //   data: {
    //     status: TicketStatus.LOCK,
    //   },
    // })

    const order: any = await this.prisma.eventTicketOrder.create({
      data: {
        ticketId: ticket.id,
        buyerId: customer.id,
        sellerId: ticket.ownerId || null,
        price: ticket.price,
      },
    })

    order.partialSignedTx = partialSignedTx

    return order
  }

  async resale(user: CustomerJwtUserData, ticketId: string, dto: ResaleDto) {
    const { customerId } = user
    const { price } = dto
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })
    this.assertValidCustomer(customer)
    const ticket = await this.prisma.eventTicket.findUnique({
      where: {
        id: ticketId,
      },
    })
    if (!ticket) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_FOUND)
    }
    if (ticket.ownerId !== customer.id) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_OWNED_BY_CUSTOMER)
    }
    if (
      ![TicketStatus.SOLD, TicketStatus.RESALE].includes(ticket.status as any)
    ) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_READY_FOR_RESALE)
    }

    const updatedTicket = await this.prisma.eventTicket.update({
      where: {
        id: ticket.id,
      },
      data: {
        status: TicketStatus.RESALE,
        previousPrice: ticket.price,
        price,
      },
    })

    return updatedTicket
  }

  async unlist(user: CustomerJwtUserData, ticketId: string) {
    const { customerId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })
    this.assertValidCustomer(customer)
    const ticket = await this.prisma.eventTicket.findUnique({
      where: {
        id: ticketId,
      },
    })
    if (!ticket) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_FOUND)
    }
    if (ticket.ownerId !== customer.id) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_OWNED_BY_CUSTOMER)
    }
    if (![TicketStatus.RESALE].includes(ticket.status as any)) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_READY_FOR_UNLIST)
    }

    const updatedTicket = await this.prisma.eventTicket.update({
      where: {
        id: ticket.id,
      },
      data: {
        status: TicketStatus.SOLD,
      },
    })

    return updatedTicket
  }

  async ordersBuyer(user: CustomerJwtUserData) {
    return this.orders(user, 'buyer')
  }

  async ordersSeller(user: CustomerJwtUserData) {
    return this.orders(user, 'seller')
  }

  async orders(user: CustomerJwtUserData, type: 'buyer' | 'seller') {
    const { customerId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })
    this.assertValidCustomer(customer)

    return this.prisma.eventTicketOrder.findMany({
      where: {
        [type === 'buyer' ? 'buyerId' : 'sellerId']: customer.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async pay(user: CustomerJwtUserData, orderId: string) {
    const { customerId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })
    this.assertValidCustomer(customer)
    const order = await this.prisma.eventTicketOrder.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        ticketId: true,
        ticket: {
          select: {
            id: true,
            ownerId: true,
            resaleTimes: true,
            status: true,
          },
        },
      },
    })

    // TODO: 支付业务逻辑

    // 修改订单状态
    let updatedOrder = await this.prisma.eventTicketOrder.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.PAID,
      },
    })

    // 修改订单状态 TO TRANSFERED
    updatedOrder = await this.prisma.eventTicketOrder.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.TRANSFERED,
      },
    })

    // TODO: 更新ticket，的ownerId, lastOrderId
    await this.prisma.eventTicket.update({
      where: {
        id: order.ticketId,
      },
      data: {
        status: TicketStatus.SOLD,
        resaleTimes: order.ticket.resaleTimes + 1,
        ownerId: customer.id,
        lastOrderId: order.id,
      },
    })
    // TODO: 计算分账？
    return updatedOrder
  }
}
