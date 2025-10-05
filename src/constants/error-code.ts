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
}
