import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

export class ResaleDto {
  @ApiProperty({ description: 'Price' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'price',
    }),
  })
  @IsNumber()
  @Min(1, {
    message: i18nValidationMessage('validation.min', {
      field: 'price',
      min: 1,
    }),
  })
  price: number
}
