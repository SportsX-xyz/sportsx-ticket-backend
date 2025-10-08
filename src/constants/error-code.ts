export const ERROR_VALIDATION_FAILED = 10001
export const ERROR_SYSTEM_ERROR = 10002

// Privy
export const ERROR_PRIVY_MISSING_TOKEN = 20001
export const ERROR_PRIVY_LOGIN_FAILED = 20002

// Customer
export const ERROR_CUSTOMER_NOT_FOUND = 21001
export const ERROR_CUSTOMER_NOT_ORGANIZER = 21002
export const ERROR_CUSTOMER_NOT_ACTIVE = 21003

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
}
