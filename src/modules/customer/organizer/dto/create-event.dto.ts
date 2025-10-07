import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  IsOptional,
} from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'
import { Type } from 'class-transformer'

export class CreateEventDto {
  @ApiProperty({ description: 'Resale Fee Rate' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'name',
    }),
  })
  @IsString()
  name: string

  @ApiProperty({ description: 'Address' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'address',
    }),
  })
  @IsString()
  address: string

  @ApiProperty({ description: 'Start Time' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'startTime',
    }),
  })
  @Type(() => Date)
  @IsDate()
  startTime: Date

  @ApiProperty({ description: 'End Time' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'endTime',
    }),
  })
  @Type(() => Date)
  @IsDate()
  endTime: Date

  @ApiProperty({ description: 'Ticket Release Time' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'ticketReleaseTime',
    }),
  })
  @Type(() => Date)
  @IsDate()
  ticketReleaseTime: Date

  @ApiProperty({ description: 'Stop Sale Before, in minutes' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'stopSaleBefore',
    }),
  })
  @Type(() => Number)
  @IsNumber()
  stopSaleBefore: number

  @ApiProperty({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string

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
