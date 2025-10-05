import { registerAs } from '@nestjs/config'

export default registerAs('jwt-admin', () => ({
  secret: process.env.ADMIN_JWT_SECRET,
  signOptions: {
    expiresIn: '30m', // 默认 30 分钟
  },
}))
