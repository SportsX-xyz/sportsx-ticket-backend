import { HttpException } from '@nestjs/common'
import { ErrorCodeMap } from '../constants/error-code'

/**
 * Api业务异常均抛出该异常
 */
export class ApiException extends HttpException {
  /**
   * 业务类型错误代码，非Http返回类型
   */
  private errorCode: number

  constructor(errorCode: number, extraMessage = '', status = 200) {
    const response = extraMessage
      ? ErrorCodeMap[errorCode] + ' ' + extraMessage
      : ErrorCodeMap[errorCode]
    super(response, status)
    this.errorCode = errorCode
  }

  getErrorCode(): number {
    return this.errorCode
  }
}
