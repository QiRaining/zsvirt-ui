import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'

import { DeleteRoleAction, DeleteRoleResult } from '@/api/zstack/DeleteRoleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZsRolePrivilege } from '@/model/zs-role-privilege.model'

@InputType()
class DeleteRolePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteRoleInput {
  @Field(() => [DeleteRolePayload])
  payload: DeleteRolePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteRoleService extends ActionService {
  @Inject()
  deleteRoleAction: DeleteRoleAction
  @InjectModel(ZsRolePrivilege) private zsRolePrivilege: typeof ZsRolePrivilege

  @Mutation(() => ActionResult)
  deleteRole(@Args('input') input: DeleteRoleInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Role', async (payload: DeleteRolePayload, taskId: string) => {
      const { uuid } = payload
      await this.deleteRoleAction.call(
        {
          uuid
        },
        { actionId, taskId }
      )
      try {
        await this.zsRolePrivilege.destroy({
          where: {
            roleUuid: uuid
          }
        })
      } catch (e) {
        console.error(e)
      }
      return {
        id: actionId
      }
    })
    return { actionId }
  }
}
