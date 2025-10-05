import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

export class PrivyDto {
  @ApiProperty({ description: 'Privy Token' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'privyToken',
    }),
  })
  @IsString()
  privyToken: string
}
