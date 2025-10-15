export const ERROR_VALIDATION_FAILED = 10001
export const ERROR_SYSTEM_ERROR = 10002

// Privy
export const ERROR_PRIVY_MISSING_TOKEN = 20001
export const ERROR_PRIVY_LOGIN_FAILED = 20002

// Customer
export const ERROR_CUSTOMER_NOT_FOUND = 21001
export const ERROR_CUSTOMER_NOT_ORGANIZER = 21002
export const ERROR_CUSTOMER_NOT_ACTIVE = 21003
export const ERROR_CUSTOMER_NOT_ADMIN = 21004
export const ERROR_CUSTOMER_ALREADY_EXISTS = 21005
export const ERROR_CUSTOMER_NOT_EVENT_STAFF = 21006

// Event
export const ERROR_EVENT_NOT_FOUND = 22001
export const ERROR_EVENT_NOT_BELONG_TO_YOU = 22002
export const ERROR_EVENT_STAFF_ALREADY_EXISTS = 22003
export const ERROR_EVENT_TICKET_TYPE_HAS_TICKETS = 22004
export const ERROR_EVENT_ACTIVE = 22005
export const ERROR_EVENT_NOT_ACTIVE = 22006
export const ERROR_EVENT_TICKET_TYPE_NOT_FOUND = 22007
export const ERROR_EVENT_TICKET_NOT_FOUND = 22008
export const ERROR_EVENT_TICKET_NOT_READY_FOR_SALE = 22009
export const ERROR_EVENT_TICKET_STATUS_NOT_ALLOWED_UPDATE = 22010
export const ERROR_EVENT_STOP_SALE = 22011
export const ERROR_EVENT_TICKET_NOT_OWNED_BY_CUSTOMER = 22012
export const ERROR_EVENT_TICKET_NOT_READY_FOR_RESALE = 22013
export const ERROR_EVENT_UPDATE_NOT_ALLOWED = 22014
export const ERROR_EVENT_TICKET_TYPE_UPDATE_NOT_ALLOWED = 22015
export const ERROR_EVENT_TICKET_UPDATE_NOT_ALLOWED = 22016
export const ERROR_EVENT_TICKET_TYPE_HAS_SOLD_TICKETS = 22017
export const ERROR_EVENT_ENDED = 22018
export const ERROR_EVENT_TICKET_TYPE_NOT_MATCH_EVENT = 22019
export const ERROR_EVENT_AVATAR_NOT_FOUND = 22020
export const ERROR_EVENT_AVATAR_INVALID = 22021
export const ERROR_EVENT_PINATA_AVATAR_DUPLICATE = 22022
export const ERROR_EVENT_PINATA_JSON_DUPLICATE = 22023
export const ERROR_EVENT_PINATA_AVATAR_INVALID = 22024
export const ERROR_EVENT_PINATA_JSON_INVALID = 22025
export const ERROR_EVENT_TICKET_NOT_READY_FOR_UNLIST = 22026
export const ERROR_EVENT_TICKET_ONLY_ONE_PER_EVENT = 22027
export const ERROR_EVENT_IPFS_URI_NOT_FOUND = 22028
export const ERROR_EVENT_SOLANA_TX_HASH_NOT_FOUND = 22029
export const ERROR_EVENT_SYMBOL_NOT_FOUND = 22030

export const ErrorCodeMap = {
  // 10000-19999 系统内部错误
  [ERROR_VALIDATION_FAILED]: 'validation.failed',
  [ERROR_SYSTEM_ERROR]: 'system.error',

  // 20000+ 业务错误

  // Privy
  [ERROR_PRIVY_MISSING_TOKEN]: 'privy.missing.token',
  [ERROR_PRIVY_LOGIN_FAILED]: 'privy.login.failed',

  // Customer
  [ERROR_CUSTOMER_NOT_FOUND]: 'customer.not.found',
  [ERROR_CUSTOMER_NOT_ORGANIZER]: 'customer.not.organizer',
  [ERROR_CUSTOMER_NOT_ACTIVE]: 'customer.not.active',
  [ERROR_CUSTOMER_NOT_ADMIN]: 'customer.not.admin',
  [ERROR_CUSTOMER_ALREADY_EXISTS]: 'customer.already.exists',
  [ERROR_CUSTOMER_NOT_EVENT_STAFF]: 'customer.not.event.staff',

  // Event
  [ERROR_EVENT_NOT_FOUND]: 'event.not.found',
  [ERROR_EVENT_NOT_BELONG_TO_YOU]: 'event.not.belong.to.you',
  [ERROR_EVENT_STAFF_ALREADY_EXISTS]: 'event.staff.already.exists',
  [ERROR_EVENT_TICKET_TYPE_HAS_TICKETS]: 'event.ticket.type.has.tickets',
  [ERROR_EVENT_ACTIVE]: 'event.active',
  [ERROR_EVENT_NOT_ACTIVE]: 'event.not.active',
  [ERROR_EVENT_TICKET_TYPE_NOT_FOUND]: 'event.ticket.type.not.found',
  [ERROR_EVENT_TICKET_NOT_FOUND]: 'event.ticket.not.found',
  [ERROR_EVENT_TICKET_NOT_READY_FOR_SALE]: 'event.ticket.not.ready.for.sale',
  [ERROR_EVENT_TICKET_STATUS_NOT_ALLOWED_UPDATE]:
    'event.ticket.status.not.allowed.update',
  [ERROR_EVENT_STOP_SALE]: 'event.stop.sale',
  [ERROR_EVENT_TICKET_NOT_OWNED_BY_CUSTOMER]:
    'event.ticket.not.owned.by.customer',
  [ERROR_EVENT_TICKET_NOT_READY_FOR_RESALE]:
    'event.ticket.not.ready.for.resale',
  [ERROR_EVENT_UPDATE_NOT_ALLOWED]: 'event.update.not.allowed',
  [ERROR_EVENT_TICKET_TYPE_UPDATE_NOT_ALLOWED]:
    'event.ticket.type.update.not.allowed',
  [ERROR_EVENT_TICKET_UPDATE_NOT_ALLOWED]: 'event.ticket.update.not.allowed',
  [ERROR_EVENT_TICKET_TYPE_HAS_SOLD_TICKETS]:
    'event.ticket.type.has.sold.tickets',
  [ERROR_EVENT_ENDED]: 'event.ended',
  [ERROR_EVENT_TICKET_TYPE_NOT_MATCH_EVENT]:
    'event.ticket.type.not.match.event',
  [ERROR_EVENT_AVATAR_NOT_FOUND]: 'event.avatar.not.found',
  [ERROR_EVENT_AVATAR_INVALID]: 'event.avatar.invalid',
  [ERROR_EVENT_PINATA_AVATAR_DUPLICATE]: 'event.pinata.avatar.duplicate',
  [ERROR_EVENT_PINATA_JSON_DUPLICATE]: 'event.pinata.json.duplicate',
  [ERROR_EVENT_PINATA_AVATAR_INVALID]: 'event.pinata.avatar.invalid',
  [ERROR_EVENT_PINATA_JSON_INVALID]: 'event.pinata.json.invalid',
  [ERROR_EVENT_TICKET_NOT_READY_FOR_UNLIST]:
    'event.ticket.not.ready.for.unlist',
  [ERROR_EVENT_TICKET_ONLY_ONE_PER_EVENT]: 'event.ticket.only.one.per.event',
  [ERROR_EVENT_IPFS_URI_NOT_FOUND]: 'event.ipfs.uri.not.found',
  [ERROR_EVENT_SOLANA_TX_HASH_NOT_FOUND]: 'event.solana.tx.hash.not.found',
  [ERROR_EVENT_SYMBOL_NOT_FOUND]: 'event.symbol.not.found',
}
