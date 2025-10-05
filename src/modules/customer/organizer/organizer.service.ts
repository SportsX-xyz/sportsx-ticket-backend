import { Injectable } from '@nestjs/common'
import { CustomerJwtUserData } from '../../../types'
import { PrismaService } from '@/modules/shared/prisma/prisma.service'
import { ApiException } from '@/exceptions/api.exception'
import {
  ERROR_CUSTOMER_NOT_ACTIVE,
  ERROR_CUSTOMER_NOT_FOUND,
  ERROR_CUSTOMER_NOT_ORGANIZER,
  ERROR_EVENT_NOT_BELONG_TO_YOU,
  ERROR_EVENT_NOT_FOUND,
  ERROR_EVENT_STAFF_ALREADY_EXISTS,
} from '@/constants/error-code'
import { SettingsDto } from './dto/settings.dto'
import { Customer, CustomerStatus, EventStatus } from '@prisma/client'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { AddEventStaffDto } from './dto/add-event-staff'

@Injectable()
export class OrganizerService {
  constructor(private readonly prisma: PrismaService) {}
  assertValidOrganizer(customer: Customer) {
    if (!customer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_FOUND)
    }
    if (!customer.isOrganizer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_ORGANIZER)
    }
    if (customer.status !== CustomerStatus.ACTIVE) {
      throw new ApiException(ERROR_CUSTOMER_NOT_ACTIVE)
    }
  }
  async isOrganizer(user: CustomerJwtUserData) {
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
        customer: {
          connect: {
            id: customerId,
          },
        },
        status: EventStatus.ACTIVE,
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

    return this.prisma.event.findMany({
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
      data: dto,
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
}
