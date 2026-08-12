import { Inject, Injectable } from '@nestjs/common'

import { ValidatePasswordAction } from '@/api/zstack/ValidatePasswordAction'
import { ActionService } from '@/base/action-service'

@Injectable()
export class ValidatePasswordService extends ActionService {
  @Inject() validatePasswordAction: ValidatePasswordAction

  async validatePassword(loginName: string, password: string, loginType: string): Promise<boolean> {
    const { available } = await this.validatePasswordAction.call({
      loginName,
      loginType,
      password
    })
    return available
  }
}
