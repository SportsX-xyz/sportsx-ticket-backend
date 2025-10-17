import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsOptional } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

export class PayDto {
  @ApiProperty({ description: 'Transaction Hash' })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.notEmpty', {
      field: 'txHash',
    }),
  })
  @IsString()
  txHash: string

  @ApiProperty({ description: 'NFT Token' })
  @IsString()
  @IsOptional()
  nftToken?: string
}
