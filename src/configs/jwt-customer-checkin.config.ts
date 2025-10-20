import { registerAs } from '@nestjs/config'

export default registerAs('jwt-customer-checkin', () => ({
  secret: process.env.CUSTOMER_JWT_CHECKIN_SECRET,
  signOptions: {
    expiresIn: '5m', // 默认 5 分钟
  },
}))
