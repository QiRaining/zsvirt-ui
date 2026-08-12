import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { ActionService } from '@/base/action-service'
import { Condition, QueryAction } from '@/common/model/action-query.model'
import { ZsProfile } from '@/model/zs-profile.model'

@Injectable()
export class CustomColumnsService extends ActionService {
  @InjectModel(ZsProfile) private zsProfile: typeof ZsProfile

  async query() {
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
        type: 'CustomColumns'
      }
    })

    return {
      userId: session.userId,
      customColumnConfig: JSON.stringify(res?.content || '{}')
    }
  }
}
