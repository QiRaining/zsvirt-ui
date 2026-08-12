import { Injectable } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'

import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZsProfile } from '@/model/zs-profile.model'

import { ProfileType } from '../personalization-config.model'

@InputType()
export class UpdatePersonalizationConfigPayload {
  @Field(() => ProfileType, { description: '配置类型' })
  profileType: ProfileType

  @Field(() => String, { description: '资源类型' })
  resourceType: string

  @Field(() => String)
  value?: string
}

@InputType()
export class UpdatePersonalizationConfigInput {
  @Field(() => UpdatePersonalizationConfigPayload)
  payload: UpdatePersonalizationConfigPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@Injectable()
export class UpdatePersonalizationConfigService extends ActionService {
  @InjectModel(ZsProfile) private zsProfile: typeof ZsProfile

  @Mutation(() => ActionResult)
  async updatePersonalizationConfig(
    @Args('input') input: UpdatePersonalizationConfigInput
  ): Promise<ActionResult> {
    const { actionId } = input.action
    const sessionId = this.getSessionId()
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    const { profileType } = input.payload
    // console.log(input)
    this.actionHelper(
      input,
      profileType,
      async (payload: UpdatePersonalizationConfigPayload, taskId: string) => {
        const { resourceType, value } = payload
        const target = await this.zsProfile.findOne({
          where: {
            userId: session.userId,
            identity: session.identity,
            type: profileType
          }
        })
        if (target) {
          await this.zsProfile.update(
            {
              content: target.content
                ? JSON.stringify(
                    Object.assign({}, JSON.parse(target.content), {
                      [resourceType]: value
                    })
                  )
                : '{}',
              lastOpDate: new Date()
            },
            {
              where: {
                userId: session.userId,
                identity: session.identity,
                type: profileType
              }
            }
          )
        } else {
          await this.zsProfile.create({
            userId: session.userId,
            identity: session.identity,
            type: profileType,
            content: JSON.stringify({ [resourceType]: value }) as any,
            createDate: new Date(),
            lastOpDate: new Date()
          })
        }
        return {
          id: session.userId
        }
      },
      {
        record: false
      }
    )
    return { actionId }
  }
}
