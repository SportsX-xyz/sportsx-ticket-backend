import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CreateEventDto } from './create-event.dto'
import { IsNotEmpty, IsString } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'
import { EventStatus } from '@prisma/client'

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiProperty({ description: 'Event Status' })
  @ApiProperty({
    description: 'status',
    enum: ['ACTIVE', 'INACTIVE'],
    required: false,
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'status',
    }),
  })
  @IsString()
  status?: EventStatus
}
