import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { DetachL3NetworkFromVmAction } from '@/api/zstack/DetachL3NetworkFromVmAction'
import { QueryVmNicAction } from '@/api/zstack/QueryVmNicAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'

@InputType()
export class DetachL3NetworkFromVmPayload {
  @Field(() => String, { nullable: true, description: 'l3Network.uuid' })
  uuid?: string

  @Field(() => String, { nullable: true, description: 'vmNic.uuid' })
  vmNicUuid?: string
}

@InputType()
export class DetachL3NetworkFromVmInput {
  @Field(() => [DetachL3NetworkFromVmPayload])
  payload: DetachL3NetworkFromVmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachL3NetworkFromVmService extends ActionService {
  @Inject() detachL3NetworkFromVmAction: DetachL3NetworkFromVmAction
  @Inject() queryVmNicAction: QueryVmNicAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  detachL3NetworkFromVm(@Args('input') input: DetachL3NetworkFromVmInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DetachL3NetworkFromVmPayload, taskId: string) => {
      let vmNicUuid
      if (!payload.vmNicUuid) {
        const zqlObject = {
          tableName: 'VmNic',
          condition: {
            vmInstanceUuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'VpcRouterVm.uuid',
                  condition: {
                    applianceVmType: 'vpcvrouter',
                    haStatus: {
                      [ZOp.ne]: 'Backup'
                    }
                  }
                }
              }
            },
            'l3Network.uuid': payload.uuid
          }
        }
        const zql = ZQL.stringify(zqlObject)
        const {
          results: [{ inventories = [] }]
        } = await this.zqlService.call(zql)

        vmNicUuid = inventories?.[0]?.uuid
      } else {
        vmNicUuid = payload.vmNicUuid
      }

      await this.detachL3NetworkFromVmAction.call(
        { vmNicUuid },
        {
          actionId,
          taskId
        }
      )

      return {
        id: payload.uuid,
        fields: 'vpcVRouter',
        inventory: {
          vpcVRouter: null
        }
      }
    }

    this.actionHelper(input, 'VmNic', actionFn)
    return { actionId }
  }
}
