import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsPositive,
  IsDecimal,
} from 'class-validator'
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
  @IsPositive() // 如果价格不能为负数
  @IsDecimal({
    decimal_digits: '0,6', // 允许0到6位小数
    force_decimal: false, // 允许整数
  })
  tierPrice: number

  @ApiProperty({ description: 'Color' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'color',
    }),
  })
  @IsString()
  color: string
}
