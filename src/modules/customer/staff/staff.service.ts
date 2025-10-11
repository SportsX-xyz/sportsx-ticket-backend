import {
  ERROR_CUSTOMER_NOT_ACTIVE,
  ERROR_CUSTOMER_NOT_EVENT_STAFF,
  ERROR_CUSTOMER_NOT_FOUND,
  ERROR_EVENT_ENDED,
  ERROR_EVENT_NOT_FOUND,
} from '@/constants/error-code'
import { ApiException } from '@/exceptions/api.exception'
import { Injectable } from '@nestjs/common'
import { Customer, CustomerStatus } from '@prisma/client'
import { CustomerJwtUserData } from '../../../types'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { CheckinDto } from './dto/checkin.dto'

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}
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
    const events = await this.prisma.eventStaff.findMany({
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
    return events
  }

  async checkIn(user: CustomerJwtUserData, eventId: string, dto: CheckinDto) {
    const { customerId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      throw new ApiException(ERROR_EVENT_NOT_FOUND)
    }

    await this.assertValidEventStaff(customer, eventId)

    // 验证，活动结束不可以checkIn
    if (new Date() > event.endTime) {
      throw new ApiException(ERROR_EVENT_ENDED)
    }

    // TODO: 验证门票，修改票状态

    return true
  }
}
