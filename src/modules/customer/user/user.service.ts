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
  ERROR_PRIVY_LOGIN_FAILED,
} from '../../../constants/error-code'
import { CustomerJwtUserData } from '../../../types'
import { Customer, CustomerStatus } from '@prisma/client'
import { OrganizerService } from '../organizer/organizer.service'
import { StaffService } from '../staff/staff.service'
@Injectable()
export class UserService {
  private readonly privyClient: PrivyClient

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(CUSTOMER_JWT_SERVICE)
    private readonly jwtService: JwtService,
    private readonly organizerService: OrganizerService,
    private readonly staffService: StaffService
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

    return {
      id: customer.id,
      email: customer.email,
      walletId: customer.walletId,
      avatarUrl: customer.avatarUrl,
      createdAt: customer.createdAt,
      isOrganizer,
      isStaff,
    }
  }
}
