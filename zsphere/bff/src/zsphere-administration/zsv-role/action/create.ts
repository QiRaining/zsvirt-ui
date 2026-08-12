import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import dayjs from 'dayjs'

import { CreateRoleAction } from '@/api/zstack/CreateRoleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZsRolePrivilege } from '@/model/zs-role-privilege.model'
import { genUuid } from '@/utils'

import { ZsvRolePoliciesInput, ZsvRoleUIPrivilegeInput } from '../zsv-role.model'
import { formateUiPrivilege } from './utils'

@InputType()
class CreateRolePayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [ZsvRolePoliciesInput], { nullable: true })
  policies?: ZsvRolePoliciesInput[]

  @Field(() => [ZsvRoleUIPrivilegeInput], { nullable: true })
  uiPrivilege: ZsvRoleUIPrivilegeInput[]
}

@InputType()
class CreateRoleInput {
  @Field(() => CreateRolePayload)
  payload: CreateRolePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateRoleService extends ActionService {
  @Inject() createRoleAction: CreateRoleAction
  @InjectModel(ZsRolePrivilege) private zsRolePrivilege: typeof ZsRolePrivilege

  @Mutation(() => ActionResult)
  createRole(@Args('input') input: CreateRoleInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: CreateRolePayload, taskId: string) => {
      const { name, description, policies, uiPrivilege } = payload

      const roleUuid = genUuid()
      await this.createRoleAction.call(
        {
          name,
          description,
          policies,
          resourceUuid: roleUuid
        },
        { actionId, taskId }
      )
      try {
        await this.zsRolePrivilege.create({
          uuid: genUuid(),
          roleUuid: roleUuid,
          privilege: formateUiPrivilege(uiPrivilege),
          version: 1,
          createDate: dayjs().toDate(),
          lastOpDate: dayjs().toDate()
        })
      } catch (e) {
        console.error(e)
      }
      return {
        id: roleUuid
      }
    }

    this.actionHelper(input, 'Role', actionFn)
    return { actionId }
  }
}
