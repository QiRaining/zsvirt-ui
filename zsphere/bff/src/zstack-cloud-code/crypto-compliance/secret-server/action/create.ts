import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int, ID } from '@nestjs/graphql'

import { CreateAiSiNoSecretResourcePoolAction } from '@/api/zstack/CreateAiSiNoSecretResourcePoolAction'
import { CreateHaiTaiSecretResourcePoolAction } from '@/api/zstack/CreateHaiTaiSecretResourcePoolAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { SecretResourcePoolModel } from '../../secret-resource-pool/secret-resource-pool.model'
import { SecurityMachineType } from '../../security-machine/security-machine.model'

@InputType()
export class AddSecretServerPayload {
  @Field(() => ID)
  zoneUuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => SecretResourcePoolModel)
  model: SecretResourcePoolModel

  @Field(() => SecurityMachineType, {
    defaultValue: SecurityMachineType.CloudSecurityResourceService
  })
  type: SecurityMachineType

  @Field(() => Int, { defaultValue: 6 })
  heartbeatInterval: number

  @Field(() => String)
  managementIp: string

  @Field(() => Int)
  port: number

  @Field(() => String, { nullable: true })
  realm?: string

  @Field(() => String, { nullable: true })
  route?: string

  @Field(() => String, { nullable: true })
  appId?: string

  @Field(() => String, { nullable: true })
  clientID?: string

  @Field(() => String, { nullable: true })
  clientSecrete?: string

  @Field(() => String, { nullable: true })
  keyNumSM2?: string

  @Field(() => String, { nullable: true })
  keyNumSM4?: string
}

@InputType()
export class AddSecretServerInput {
  @Field(() => AddSecretServerPayload)
  payload: AddSecretServerPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddSecretServerService extends ActionService {
  @Inject()
  createAiSiNoSecretResourcePoolAction: CreateAiSiNoSecretResourcePoolAction
  @Inject()
  createHaiTaiSecretResourcePoolAction: CreateHaiTaiSecretResourcePoolAction

  private readonly invokeSecretServerService = async (
    payload: AddSecretServerPayload,
    action: {
      actionId: string
      taskId: string
    }
  ) => {
    if (payload.model === SecretResourcePoolModel.HaiTai) {
      return await this.createHaiTaiSecretResourcePoolAction.call(payload, action)
    }
    if (payload.model === SecretResourcePoolModel.AiSiNo) {
      return await this.createAiSiNoSecretResourcePoolAction.call(payload, action)
    }
  }

  @Mutation(() => ActionResult)
  addSecretServer(@Args('input') input: AddSecretServerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SecretServer',
      async (payload: AddSecretServerPayload, taskId: string) => {
        const result = await this.invokeSecretServerService(payload, {
          actionId,
          taskId
        })

        return {
          id: result.inventory.uuid
        }
      }
    )
    return { actionId }
  }
}
