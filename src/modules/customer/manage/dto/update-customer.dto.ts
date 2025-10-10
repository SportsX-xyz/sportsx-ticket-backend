import { CustomerStatus } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsOptional } from 'class-validator'

export class UpdateCustomerDto {
  @ApiProperty({
    enum: Object.values(CustomerStatus),
    required: false,
  })
  @IsEnum(CustomerStatus)
  @IsOptional()
  status?: CustomerStatus

  @ApiProperty({
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isOrganizer?: boolean
}
