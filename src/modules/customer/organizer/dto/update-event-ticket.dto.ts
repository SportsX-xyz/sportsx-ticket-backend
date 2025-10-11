import { ApiProperty } from '@nestjs/swagger'
import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'
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

  @ApiProperty({ description: 'Ticket Price' })
  @IsNumber()
  @IsOptional()
  @IsPositive() // 如果价格不能为负数
  @IsDecimal({
    decimal_digits: '0,6', // 允许0到6位小数
    force_decimal: false, // 允许整数
  })
  price?: number

  @ApiProperty({ description: 'Ticket Type Id' })
  @IsString()
  @IsOptional()
  ticketTypeId?: string
}
