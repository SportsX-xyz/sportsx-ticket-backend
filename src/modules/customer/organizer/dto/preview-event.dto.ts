import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

export class PreviewEventDto {
  @ApiProperty({ description: 'IPFS URI' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'ipfsUri',
    }),
  })
  @IsString()
  ipfsUri: string
}
