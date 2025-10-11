import { AddEventTicketTypeDto } from './add-event-ticket-type.dto'
import { PartialType } from '@nestjs/mapped-types'

export class UpdateEventTicketTypeDto extends PartialType(
  AddEventTicketTypeDto
) {}
