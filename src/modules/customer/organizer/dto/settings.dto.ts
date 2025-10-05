import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

export class SettingsDto {
  @ApiProperty({ description: 'Resale Fee Rate' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'resaleFeeRate',
    }),
  })
  @IsNumber()
  resaleFeeRate: number

  @ApiProperty({ description: 'Max Resale Times' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'maxResaleTimes',
    }),
  })
  @IsNumber()
  maxResaleTimes: number
}
