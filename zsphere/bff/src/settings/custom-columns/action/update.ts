import { Injectable } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import _ from 'lodash'

import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZsProfile } from '@/model/zs-profile.model'

@InputType()
export class UpdateCustomColumnsPayload {
  @Field(() => String)
  path: string

  @Field(() => [String])
  columnKeys: string[]
}

@InputType()
export class UpdateCustomColumnsInput {
  @Field(() => UpdateCustomColumnsPayload)
  payload: UpdateCustomColumnsPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@Injectable()
export class UpdateCustomColumnsService extends ActionService {
  @InjectModel(ZsProfile) private zsProfile: typeof ZsProfile

  @Mutation(() => ActionResult)
  async updateCustomColumns(@Args('input') input: UpdateCustomColumnsInput): Promise<ActionResult> {
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
    this.actionHelper(
      input,
      'CustomColumns',
      async (payload: UpdateCustomColumnsPayload, taskId: string) => {
        const { path, columnKeys } = payload
        const target = await this.zsProfile.findOne({
          where: {
            userId: session.userId,
            identity: session.identity,
            type: 'CustomColumns'
          }
        })
        if (target) {
          await this.zsProfile.update(
            {
              content: target.content
                ? JSON.stringify(
                    _.assign(
                      {},
                      _.isString(target.content) ? JSON.parse(target.content) : target.content,
                      { [path]: columnKeys }
                    )
                  )
                : '{}',
              lastOpDate: new Date()
            },
            {
              where: {
                userId: session.userId,
                identity: session.identity,
                type: 'CustomColumns'
              }
            }
          )
        } else {
          await this.zsProfile.create({
            userId: session.userId,
            identity: session.identity,
            type: 'CustomColumns',
            content: JSON.stringify({ [path]: columnKeys }),
            createDate: new Date(),
            lastOpDate: new Date()
          })
        }
        return {
          id: session.userId
        }
      }
    )
    return { actionId }
  }
}
