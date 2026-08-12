import { Inject, Injectable } from '@nestjs/common'
import { Args, Field, Float, InputType, Mutation } from '@nestjs/graphql'

import { AddIscsiServerAction } from '@/api/zstack/AddIscsiServerAction'
import { AttachIscsiServerToClusterAction } from '@/api/zstack/AttachIscsiServerToClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddIscsiServerPayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  ip: string

  @Field(() => Float)
  port: number

  @Field(() => String, { nullable: true })
  chapUserName?: string

  @Field(() => String, { nullable: true })
  chapUserPassword?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string
}

@InputType()
class AddIscsiServerInput {
  @Field(() => AddIscsiServerPayload)
  payload: AddIscsiServerPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@Injectable()
export class AddIscsiServerService extends ActionService {
  @Inject() private addIscsiServerAction: AddIscsiServerAction
  @Inject()
  private attachIscsiServerToClusterAction: AttachIscsiServerToClusterAction

  @Mutation(() => ActionResult)
  addIscsiServer(@Args('input') input: AddIscsiServerInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'IscsiServer',
      async ({ clusterUuid, ...payload }: AddIscsiServerPayload, taskId: string) => {
        const result = await this.addIscsiServerAction.call(
          {
            ...payload
          },
          { actionId, taskId }
        )

        if (clusterUuid) {
          await this.attachIscsiServerToClusterAction.call(
            {
              uuid: result?.inventory?.uuid,
              clusterUuid
            },
            { actionId, taskId }
          )
        }

        return {
          id: result?.inventory?.uuid
        }
      }
    )

    return { actionId }
  }
}

// @Injectable()
// export class AddIscsiServerService extends ActionService {
//   @Inject() private addIscsiServerTaskService: AddIscsiServerTaskService
//   @Inject()
//   private attachIscsiServerToClusterTaskService: AttachIscsiServerToClusterTaskService
//   @Inject()
//   private addIscsiServerTaskHandlerService: AddIscsiServerTaskHandlerService
//   @Inject()
//   private addIscsiServerActionHandlerService: AddIscsiServerActionHandlerService

//   @Mutation(() => ActionResult)
//   addIscsiServer(@Args('input') input: AddIscsiServerInput) {
//     const actionId = input.action.actionId

//     const { iscsiServerParam, attachServerToClusterParam } = this.buildParams(
//       input.payload
//     )

//     this.recordActionService.recordActionStart(
//       input.payload,
//       actionId,
//       input.action.name
//     )

//     const flow = parallel(
//       iscsiServerParam.map(serverParm => {
//         const taskId = genUuid()
//         const info = {
//           actionId: input.action.actionId,
//           taskId
//         }
//         this.recordActionService.recordTaskStart(taskId, actionId)
//         return serial(
//           [
//             {
//               service: AddIscsiServerTaskService.name,
//               input: { param: serverParm, info }
//             },
//             parallel([
//               attachServerToClusterParam.map(attachParam => {
//                 return {
//                   service: AttachIscsiServerToClusterTaskService.name,
//                   input: { param: attachParam, info }
//                 }
//               })
//             ])
//           ],
//           { info }
//         )
//       }),
//       {
//         onSubTaskFinished: AddIscsiServerTaskHandlerService.name,
//         onAllFinished: AddIscsiServerActionHandlerService.name
//       }
//     )

//     this.flowManagerService.initServices({
//       [AddIscsiServerTaskService.name]: this.addIscsiServerTaskService,
//       [AttachIscsiServerToClusterTaskService.name]: this
//         .attachIscsiServerToClusterTaskService,
//       [AddIscsiServerTaskHandlerService.name]: this
//         .addIscsiServerTaskHandlerService,
//       [AddIscsiServerActionHandlerService.name]: this
//         .addIscsiServerActionHandlerService
//     })

//     this.flowManagerService
//       .run(flow, actionId, { allowAbort: true })
//       .catch(error => {
//         this.recordActionService.recordActionFailed(actionId)
//         console.log(error)
//       })

//     return { actionId }
//   }

//   buildParams(
//     actionParam: AddIscsiServerPayload
//   ): {
//     iscsiServerParam: AddIscsiServerTaskParam[]
//     attachServerToClusterParam: AttachIscsiServerToClusterParam[]
//   } {
//     const addIscsiServerParams: AddIscsiServerTaskParam = {
//       name: actionParam.name,
//       ip: actionParam.ip,
//       port: actionParam.port,
//       chapUserName: actionParam.chapUserName,
//       chapUserPassword: actionParam.chapUserPassword
//     }
//     if (actionParam.chapUserName) {
//       addIscsiServerParams.chapUserName = actionParam.chapUserName
//     }
//     if (actionParam.chapUserPassword) {
//       addIscsiServerParams.chapUserPassword = actionParam.chapUserPassword
//     }
//     const iscsiServerParam: AddIscsiServerTaskParam[] = [addIscsiServerParams]
//     const attachServerToClusterParam: AttachIscsiServerToClusterParam[] = []

//     if (actionParam?.clusterUuid) {
//       attachServerToClusterParam.push({
//         clusterUuid: actionParam?.clusterUuid
//       })
//     }

//     return {
//       iscsiServerParam,
//       attachServerToClusterParam
//     }
//   }
// }

// export interface AttachIscsiServerToClusterParam {
//   clusterUuid: string
// }
