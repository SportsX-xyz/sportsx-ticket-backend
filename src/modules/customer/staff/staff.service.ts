import { Injectable } from '@nestjs/common'
import { CustomerJwtUserData } from '../../../types'
import { PrismaService } from '../../shared/prisma/prisma.service'

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}
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
}
