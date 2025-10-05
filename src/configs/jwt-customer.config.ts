import { registerAs } from '@nestjs/config'

export default registerAs('jwt-customer', () => ({
  secret: process.env.CUSTOMER_JWT_SECRET,
  signOptions: {
    expiresIn: '180d', // 默认 30 分钟
  },
}))
