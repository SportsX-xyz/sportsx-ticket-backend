import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

export class AddEventTicketTypeDto {
  @ApiProperty({ description: 'TierName' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'tierName',
    }),
  })
  @IsString()
  tierName: string

  @ApiProperty({ description: 'TierPrice' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'tierPrice',
    }),
  })
  @IsNumber()
  tierPrice: number

  @ApiProperty({ description: 'TierRows' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'tierRows',
    }),
  })
  @IsNumber()
  tierRows: number

  @ApiProperty({ description: 'TierColumns' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'tierColumns',
    }),
  })
  @IsNumber()
  tierColumns: number
}
