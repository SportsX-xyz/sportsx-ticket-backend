import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'
import { TicketStatus } from '@prisma/client'

export class UpdateEventTicketDto {
  @ApiProperty({ description: 'Ticket Status' })
  @ApiProperty({
    description: 'status',
    enum: ['NEW', 'NOT_EXIST', 'NOT_FOR_SALE'],
    required: false,
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'status',
    }),
  })
  @IsString()
  status?: 'NEW' | 'NOT_EXIST' | 'NOT_FOR_SALE'
}
