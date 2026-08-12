import { Injectable, Inject } from '@nestjs/common'

import { GetTwoFactorAuthenticationStateAction } from '@/api/zstack/GetTwoFactorAuthenticationStateAction'
import { ActionService } from '@/base/action-service'

import { GetTwoFactorAuthenticationStateResp, LoginResp } from '../model/login.model'

@Injectable()
export class LoginService extends ActionService {
  @Inject()
  getTwoFactorAuthenticationStateAction: GetTwoFactorAuthenticationStateAction

  async getTwoFactorAuthenticationState(): Promise<GetTwoFactorAuthenticationStateResp> {
    return this.getTwoFactorAuthenticationStateAction.call({})
  }

  // 第三方免密登录校验
  async getUserBySessionId(sessionId: string): Promise<LoginResp | null> {
    const result: any = await this.getZsSession().findOne({
      where: { sessionId }
    })
    if (result !== null) {
      const currentUser = result.dataValues
      return {
        sessionId: sessionId,
        accountUuid: currentUser.accountId,
        // Compatibility alias: account sessions no longer maintain a separate user UUID.
        userUuid: currentUser.accountId,
        currentIdentity: currentUser.identity
      }
    }
    return null
  }
}
