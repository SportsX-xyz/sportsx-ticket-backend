import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

export class AddEventStaffDto {
  @ApiProperty({ description: 'StaffEmail' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'email',
    }),
  })
  @IsString()
  email: string
}
