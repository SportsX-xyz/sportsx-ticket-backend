import databaseConfig from './database.config'
import jwtAdminConfig from './jwt-admin.config'
import jwtCustomerConfig from './jwt-customer.config'
import jwtCustomerCheckinConfig from './jwt-customer-checkin.config'
import throttlerConfig from './throttler.config'

export default [
  databaseConfig,
  jwtAdminConfig,
  jwtCustomerConfig,
  jwtCustomerCheckinConfig,
  throttlerConfig,
]
