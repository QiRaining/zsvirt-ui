import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { GetHostWebSshUrlAction } from '@/api/zstack/GetHostWebSshUrlAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class GetHostWebSshUrlPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  https: boolean
}

@InputType()
export class GetHostWebSshUrlInput {
  @Field(() => [GetHostWebSshUrlPayload])
  payload: GetHostWebSshUrlPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class GetHostWebSshUrlService extends ActionService {
  @Inject() getHostWebSshUrlAction: GetHostWebSshUrlAction

  @Mutation(() => ActionResult)
  getHostWebSshUrl(@Args('input') input: GetHostWebSshUrlInput) {
    const actionId = input.action.actionId
    // 个人觉得这里用Mutation本来也不是太合理，
    // 刚好新feature修改了这段逻辑，这里先注释掉。
    // this.actionHelper(
    //   input,
    //   'WebSsh',
    //   async (payload: GetHostWebSshUrlPayload, taskId: string) => {
    //     const { uuid, https } = payload
    //     const { url } = await this.getHostWebSshUrlAction.call(
    //       { uuid, https },
    //       {
    //         actionId,
    //         taskId
    //       }
    //     )
    //
    //     return {
    //       id: actionId,
    //       inventory: {
    //         uuid,
    //         webSshSocketUrl: url
    //       }
    //     }
    //   }
    // )
    return { actionId }
  }
}
