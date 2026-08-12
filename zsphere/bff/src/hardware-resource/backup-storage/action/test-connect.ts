import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import {
  GetPhysicalMachineBlockDevicesAction,
  GetPhysicalMachineBlockDevicesActionParam
} from '@/api/zstack/GetPhysicalMachineBlockDevicesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { genUuid } from '@/utils'
import { Decrypt } from '@/utils/aesCipher'

@InputType()
class TestConnectionPayload {
  @Field(() => String)
  hostName: string

  @Field(() => String)
  username: string

  @Field(() => String)
  password: string

  @Field(() => Int)
  sshPort: number
}

@InputType()
class TestConnectionInput {
  @Field(() => TestConnectionPayload)
  payload: TestConnectionPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class TestConnectionService extends ActionService {
  @Inject()
  getPhysicalMachineBlockDevicesAction: GetPhysicalMachineBlockDevicesAction

  @Mutation(() => ActionResult)
  async testConnection(@Args('input') input: TestConnectionInput) {
    const actionId = input.action.actionId
    const apiId = genUuid()
    this.actionHelper(
      input,
      'backupStorage',
      async (payload: TestConnectionPayload, taskId: string) => {
        const { blockDevices } = await this.getPhysicalMachineBlockDevicesAction.call(
          {
            ...payload,
            password: Decrypt(payload.password),
            excludedTypes: ['rom']
          } as GetPhysicalMachineBlockDevicesActionParam,
          { actionId, taskId, apiId }
        )

        if (blockDevices) {
          return {
            id: actionId,
            inventory: {
              success: true
            }
          }
        } else {
          await this.getPhysicalMachineBlockDevicesAction.recordFailed(
            { success: false, msg: 'Failed to connect to backup storage' },
            {
              apiId
            }
          )

          throw {
            name: 'apiError',
            reason: {
              success: false,
              message: 'Failed to connect to backup storage'
            }
          }
        }
      }
    )
    return { actionId }
  }
}
