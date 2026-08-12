import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import { ApolloError } from 'apollo-server-errors'

import { CreateAccessKeyAction } from '@/api/zstack/CreateAccessKeyAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZsSession } from '@/model/zs-session.model'
import { PrivilegeService } from '@/privilege/privilege.service'

@InputType()
class CreateAccessKeyPayload {
  @Field(() => String)
  name: string
}
@InputType()
class CreateAccessKeyInput {
  @Field(() => CreateAccessKeyPayload)
  payload: CreateAccessKeyPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateAccessKeyService extends ActionService {
  @Inject() createAccessKeyAction: CreateAccessKeyAction
  @InjectModel(ZsSession) private zsSessions: typeof ZsSession
  @Inject() privilegeService: PrivilegeService

  @Mutation(() => ActionResult)
  async createAccessKey(@Args('input') input: CreateAccessKeyInput) {
    const sessionId = this.getSessionId()
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    const hasPrivilege = await this.privilegeService.hasPrivilege()
    if (!hasPrivilege) {
      throw new ApolloError('无UI权限', 'FORBIDDEN', { statusCode: 403 })
    }
    const actionId = input.action.actionId
    this.actionHelper(input, 'AccessKey', async (payload: string, taskId: string) => {
      const sessionId = this.getSessionId()
      const session = await this.zsSessions.findOne({
        where: {
          sessionId
        }
      })
      const params = {
        accountUuid: session?.accountId,
        userUuid: session?.userId
      }
      await this.createAccessKeyAction.call(params, { actionId, taskId })
      return {
        id: actionId
      }
    })
    return { actionId }
  }
}
