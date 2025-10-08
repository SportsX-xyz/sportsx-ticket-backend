import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

export class SettingsDto {
  @ApiProperty({ description: 'Resale Fee Rate' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'resaleFeeRate',
    }),
  })
  @IsNumber()
  @Min(1, {
    message: i18nValidationMessage('validation.min', {
      field: 'resaleFeeRate',
      min: 1,
    }),
  })
  resaleFeeRate: number

  @ApiProperty({ description: 'Max Resale Times' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'maxResaleTimes',
    }),
  })
  @IsNumber()
  @Min(1, {
    message: i18nValidationMessage('validation.min', {
      field: 'maxResaleTimes',
      min: 1,
    }),
  })
  maxResaleTimes: number
}
