import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

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
  @IsOptional()
  status?: 'NEW' | 'NOT_EXIST' | 'NOT_FOR_SALE'

  @ApiProperty({ description: 'Ticket Name' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'name',
    }),
  })
  @IsString()
  @IsOptional()
  name?: string
}
