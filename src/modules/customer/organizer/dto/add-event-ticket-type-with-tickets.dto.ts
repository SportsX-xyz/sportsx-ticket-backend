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
  @ApiProperty({
    description: 'Status',
    enum: ['NEW', 'NOT_EXIST', 'NOT_FOR_SALE'],
  })
  status: 'NEW' | 'NOT_EXIST' | 'NOT_FOR_SALE'
}

export class AddEventTicketTypeWithTicketsDto {
  @ApiProperty({ description: 'TicketTypeId' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'ticketTypeId',
    }),
  })
  @IsString()
  ticketTypeId: string

  @ApiProperty({ description: 'Tickets', type: [TicketItem] })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'tickets',
    }),
  })
  // @ValidateNested({ each: true }) // 验证数组中的每个元素
  tickets: TicketItem[]
}
