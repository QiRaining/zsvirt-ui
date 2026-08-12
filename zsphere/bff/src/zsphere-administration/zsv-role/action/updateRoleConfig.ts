import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'
import { UpdateRoleAction, UpdateRoleResult } from '@/api/zstack/UpdateRoleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZsRolePrivilege } from '@/model/zs-role-privilege.model'
import { genUuid } from '@/utils'

import { ZsvRoleUIPrivilegeInput } from '../zsv-role.model'
import { formateUiPrivilege } from './utils'

@InputType()
class UpdateRoleConfigPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [ZsvRoleUIPrivilegeInput], { nullable: true })
  uiPrivilege?: ZsvRoleUIPrivilegeInput[]
}

@InputType()
class UpdateRoleConfigInput {
  @Field(() => UpdateRoleConfigPayload)
  payload: UpdateRoleConfigPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateRoleConfigService extends ActionService {
  @Inject() updateRoleAction: UpdateRoleAction
  @InjectModel(ZsRolePrivilege) private zsRolePrivilege: typeof ZsRolePrivilege
  @Inject() zstackApiBase: ZStackApiBase

  @Mutation(() => ActionResult)
  updateRoleConfig(@Args('input') input: UpdateRoleConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Role', async (payload: UpdateRoleConfigPayload, taskId: string) => {
      const { name, description, uuid, uiPrivilege } = payload

      const result: UpdateRoleResult = await this.updateRoleAction.call(
        { uuid, name, description },
        { actionId, taskId }
      )

      try {
        const apiRecord = await this.zstackApiBase.recordStart(
          { uuid },
          { actionId, taskId, apiId: genUuid() },
          'UPDATE_ROLE_UI_PRIVILEGE'
        )
        await this.zstackApiBase.recordSuccess({ success: true }, apiRecord)
        const privilege = await this.zsRolePrivilege.findOne({
          where: {
            roleUuid: uuid
          }
        })

        if (privilege) {
          const privilege = formateUiPrivilege(uiPrivilege)

          const params = {
            privilege,
            lastOpDate: new Date()
          }

          await this.zsRolePrivilege.update(params, {
            where: {
              roleUuid: uuid
            }
          })
        } else {
          await this.zsRolePrivilege.create({
            uuid: genUuid(),
            roleUuid: uuid,
            version: 1,
            privilege: formateUiPrivilege(uiPrivilege),
            createDate: new Date(),
            lastOpDate: new Date()
          })
        }
      } catch (e) {
        console.log(e)
      }

      return {
        id: uuid,
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
