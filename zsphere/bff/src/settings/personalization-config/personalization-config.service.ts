import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { ActionService } from '@/base/action-service'
import { ZsProfile } from '@/model/zs-profile.model'

import { ProfileType } from './personalization-config.model'

@Injectable()
export class PersonalizationConfigService extends ActionService {
  @InjectModel(ZsProfile) private zsProfile: typeof ZsProfile

  async query(profileType: ProfileType, resourceType: string) {
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
        type: profileType
      }
    })

    // 处理 content 可能是字符串或对象的情况
    let contentObj = res?.content
    if (typeof contentObj === 'string') {
      try {
        const parsed = JSON.parse(contentObj)
        contentObj = parsed
      } catch {
        // 如果解析失败，说明 content 本身就是字符串值，保持原样
      }
    }

    // 获取对应 resourceType 的值
    const value =
      typeof contentObj === 'object' && contentObj !== null
        ? ((contentObj as Record<string, unknown>)[resourceType] ?? '')
        : (contentObj ?? '')

    return {
      userId: session.userId,
      profileType,
      resourceType,
      value
    } as any
  }
}
