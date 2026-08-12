import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DestroyVmInstanceAction } from '@/api/zstack/DestroyVmInstanceAction'
import { ExpungeVmInstanceAction } from '@/api/zstack/ExpungeVmInstanceAction'
import { QueryGlobalConfigAction } from '@/api/zstack/QueryGlobalConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZOp } from '@/common/zql'

@InputType()
class DeleteMigrationGatewayVmPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteMigrationGatewayVmInput {
  @Field(() => [DeleteMigrationGatewayVmPayload])
  payload: DeleteMigrationGatewayVmPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

/**
 * 删除迁移网关云主机。
 *
 * 行为说明：
 * - 首先调用 DestroyVmInstance 销毁云主机；
 * - 查询全局配置 vm.deletionPolicy：
 *   - 若为 `Direct`（立即删除）：DestroyVmInstance 已执行彻底删除，
 *     此时再调用 ExpungeVmInstance 会失败，因此不再调用；
 *   - 否则（Delay / Never / 未配置）：再调用 ExpungeVmInstance，
 *     以保证迁移网关被彻底删除，而不是停留在回收站中。
 *
 * UI 只需要调用这一个 mutation 即可完成整套删除逻辑。
 */
export class DeleteMigrationGatewayVmService extends ActionService {
  @Inject() private destroyVmInstanceAction: DestroyVmInstanceAction
  @Inject() private expungeVmInstanceAction: ExpungeVmInstanceAction
  @Inject() private queryGlobalConfigAction: QueryGlobalConfigAction

  private async getVmDeletionPolicy(): Promise<string | undefined> {
    const { inventories } = await this.queryGlobalConfigAction.call({
      conditions: [
        { key: 'category', op: ZOp.eq, value: 'vm' },
        { key: 'name', op: ZOp.eq, value: 'deletionPolicy' }
      ]
    })
    return inventories?.[0]?.value
  }

  @Mutation(() => ActionResult)
  deleteMigrationGatewayVm(@Args('input') input: DeleteMigrationGatewayVmInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: DeleteMigrationGatewayVmPayload, taskId: string) => {
        const { uuid } = payload

        // 1. 先销毁云主机
        await this.destroyVmInstanceAction.call({ uuid }, { actionId, taskId })

        // 2. 根据全局配置决定是否需要再做彻底删除
        const policy = await this.getVmDeletionPolicy()
        if (policy !== 'Direct') {
          await this.expungeVmInstanceAction.call({ uuid }, { actionId, taskId })
        }

        return {
          id: payload.uuid,
          inventory: {
            actionType: 'delete',
            id: payload.uuid
          }
        }
      }
    )

    return { actionId }
  }
}
