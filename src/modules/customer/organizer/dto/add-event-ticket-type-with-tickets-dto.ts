import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { i18nValidationMessage } from 'nestjs-i18n'

export class TicketItem {
  @ApiProperty({ description: 'RowNumber' })
  @IsNumber()
  rowNumber: number
  @ApiProperty({ description: 'ColumnNumber' })
  @IsNumber()
  columnNumber: number
  @ApiProperty({ description: 'Name' })
  @IsString()
  name: string
  @ApiProperty({ description: 'Price' })
  @IsNumber()
  price: number
  @ApiProperty({ description: 'Status', enum: ['NEW', 'NOT_FOR_SALE'] })
  status: 'NEW' | 'NOT_FOR_SALE'
}

export class AddEventTicketTypeWithTicketsDto {
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

  @ApiProperty({ description: 'Tickets', type: [TicketItem] })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'tickets',
    }),
  })
  @ValidateNested({ each: true }) // 验证数组中的每个元素
  tickets: TicketItem[]
}
