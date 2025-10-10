import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Email',
    example: 'test@example.com',
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'email',
    }),
  })
  @IsEmail()
  email: string
}
