import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { ActionService } from '@/base/action-service'
import { ZsProfile } from '@/model/zs-profile.model'

@Injectable()
export class DashboardHomepageLayoutsConfigService extends ActionService {
  @InjectModel(ZsProfile) private zsProfile: typeof ZsProfile

  getDashboardHomepageLayoutsConfig = async () => {
    const sessionId = this.getSessionId()
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    const res = await this.zsProfile.findOne({
      where: {
        userId: session.userId,
        identity: session.identity,
        type: 'HomepageLayoutConfig'
      }
    })

    return {
      userId: session.userId,
      layoutConfig: res?.content || ''
    }
  }

  getWelcomeConfig = async () => {
    const sessionId = this.getSessionId()
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    const res = await this.zsProfile.findOne({
      where: {
        userId: session.userId,
        identity: session.identity,
        type: 'WelcomeConfig'
      }
    })

    return {
      userId: session.userId,
      welcomeConfig: res?.content || ''
    }
  }
}
