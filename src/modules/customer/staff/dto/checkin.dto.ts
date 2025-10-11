import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

export class CheckinDto {
  @ApiProperty({ description: 'TicketCode' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'ticketCode',
    }),
  })
  @IsString()
  ticketCode: string
}
