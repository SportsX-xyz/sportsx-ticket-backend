import { PageDto } from '../../../../common/dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CustomerListDto extends PageDto {
  @ApiProperty({
    description: 'Keyworld',
    required: false,
  })
  @IsString()
  @IsOptional()
  keyword?: string
}
