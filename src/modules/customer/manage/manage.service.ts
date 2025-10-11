import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { ApiException } from '@/exceptions/api.exception'
import {
  ERROR_CUSTOMER_ALREADY_EXISTS,
  ERROR_CUSTOMER_NOT_ACTIVE,
  ERROR_CUSTOMER_NOT_ADMIN,
  ERROR_CUSTOMER_NOT_FOUND,
  ERROR_CUSTOMER_NOT_ORGANIZER,
} from '@/constants/error-code'
import { CustomerJwtUserData } from '@/types'
import { Customer, CustomerStatus, Prisma } from '@prisma/client'
import { createPaginationParams, createSingleFieldFilter } from '../../../utils'
import { CustomerListDto } from './dto/customer-list.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { CreateCustomerDto } from './dto/create-customer.dto'

@Injectable()
export class ManageService {
  constructor(private readonly prisma: PrismaService) {}

  assertValidAdmin(customer: Customer) {
    if (!customer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_FOUND)
    }
    if (customer.status !== CustomerStatus.ACTIVE) {
      throw new ApiException(ERROR_CUSTOMER_NOT_ACTIVE)
    }
    if (!customer.isAdmin) {
      throw new ApiException(ERROR_CUSTOMER_NOT_ADMIN)
    }
  }

  async isAdmin(user: CustomerJwtUserData): Promise<{ isAdmin: boolean }> {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    if (!customer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_FOUND)
    }

    if (!customer.isAdmin) {
      return {
        isAdmin: false,
      }
    }

    return {
      isAdmin: true,
    }
  }

  async getCustomers(query: CustomerListDto) {
    const { page, pageSize, keyword } = query
    const queryOptions: Prisma.CustomerFindManyArgs = {
      where: {
        ...createSingleFieldFilter({
          field: 'email',
          value: keyword,
          isFuzzy: true,
        }),
      },
      select: {
        id: true,
        email: true,
        isOrganizer: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }

    const [list, total] = await this.prisma.getPaginatedList(
      this.prisma.customer,
      queryOptions,
      createPaginationParams(page, pageSize)
    )

    return { list, total }
  }

  async updateCustomer(
    user: CustomerJwtUserData,
    customerIdForUpdate: string,
    dto: UpdateCustomerDto
  ) {
    const { customerId, walletId } = user
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidAdmin(customer)

    return this.prisma.customer.update({
      where: {
        id: customerIdForUpdate,
      },
      data: {
        // 去掉里面值为空的key
        ...dto,
      },
    })
  }

  async createCustomer(user: CustomerJwtUserData, dto: CreateCustomerDto) {
    const { customerId, walletId } = user
    const { email } = dto
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    })

    this.assertValidAdmin(customer)
    const customerByEmail = await this.prisma.customer.findUnique({
      where: {
        email,
      },
    })

    if (customerByEmail) {
      throw new ApiException(ERROR_CUSTOMER_ALREADY_EXISTS)
    }

    return this.prisma.customer.create({
      data: {
        ...dto,
      },
    })
  }
}
