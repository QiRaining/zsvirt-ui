import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddEmailAddressToSNSEmailEndpointAction } from '@/api/zstack/AddEmailAddressToSNSEmailEndpointAction'
import { AddSNSDingTalkAtPersonAction } from '@/api/zstack/AddSNSDingTalkAtPersonAction'
import { AddSNSFeiShuAtPersonAction } from '@/api/zstack/AddSNSFeiShuAtPersonAction'
import { AddSNSSmsReceiverAction } from '@/api/zstack/AddSNSSmsReceiverAction'
import { AddSNSWeComAtPersonAction } from '@/api/zstack/AddSNSWeComAtPersonAction'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { DeleteEmailAddressOfSNSEmailEndpointAction } from '@/api/zstack/DeleteEmailAddressOfSNSEmailEndpointAction'
import { RemoveSNSDingTalkAtPersonAction } from '@/api/zstack/RemoveSNSDingTalkAtPersonAction'
import { RemoveSNSFeiShuAtPersonAction } from '@/api/zstack/RemoveSNSFeiShuAtPersonAction'
import { RemoveSNSSmsReceiverAction } from '@/api/zstack/RemoveSNSSmsReceiverAction'
import { RemoveSNSWeComAtPersonAction } from '@/api/zstack/RemoveSNSWeComAtPersonAction'
import {
  UpdateSNSApplicationEndpointResult,
  UpdateSNSApplicationEndpointAction
} from '@/api/zstack/UpdateSNSApplicationEndpointAction'
import { UpdateSNSDingTalkEndpointAction } from '@/api/zstack/UpdateSNSDingTalkEndpointAction'
import { UpdateSNSFeiShuEndpointAction } from '@/api/zstack/UpdateSNSFeiShuEndpointAction'
import { UpdateSNSTopicAction } from '@/api/zstack/UpdateSNSTopicAction'
import { UpdateSNSWeComEndpointAction } from '@/api/zstack/UpdateSNSWeComEndpointAction'
import { ActionService } from '@/base/action-service'
import { SmsReceiverType } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { AtPersonInput } from './create-feishu-endpoint'
// import { ModifyDingTalkAtPersonPayload } from './modify-dingtalk-at-person'
import { DeleteEmailAddressToEndpointPayload } from './delete-email-address-of-endpoint'

@InputType()
class UpdateEndpointPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  topicUuid?: string

  @Field(() => String, { nullable: true })
  platformUuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  locale?: string

  @Field(() => String, { nullable: true })
  secret?: string

  @Field(() => Boolean, {
    nullable: true,
    description: `提示群成员：@所有人 / @指定人 / 无
                  true => @所有人，
                  false => @指定人或者无，
                  当 atPersonList 为空时，则为无，否则为@指定人`
  })
  atAll?: boolean
}

@InputType()
export class ModifyEmailAddressOfEndpointPayload {
  @Field(() => [DeleteEmailAddressToEndpointPayload])
  oldEmailAddress: DeleteEmailAddressToEndpointPayload[]

  @Field(() => [String])
  emailAddress: string[]

  @Field(() => String)
  endpointUuid: string
}

@InputType()
export class ModifyAtPersonPayload {
  @Field(() => [AtPersonInput], {
    nullable: true,
    description: '即将被添加的@人员'
  })
  atPersonList?: AtPersonInput[]

  @Field(() => String)
  endpointUuid: string
}

@InputType()
class UpdateEndpointAllPayload {
  @Field(() => UpdateEndpointPayload, { nullable: true })
  updateEndpointPayload: UpdateEndpointPayload

  @Field(() => ModifyAtPersonPayload, { nullable: true })
  modifyDingTalkAtPersonPayload?: ModifyAtPersonPayload

  @Field(() => ModifyEmailAddressOfEndpointPayload, { nullable: true })
  modifyEmailAddressOfEndpointPayload?: ModifyEmailAddressOfEndpointPayload

  @Field(() => ModifyAtPersonPayload, { nullable: true })
  modifyFeishuAtPersonPayload?: ModifyAtPersonPayload

  @Field(() => ModifyAtPersonPayload, { nullable: true })
  modifyWecomAtPersonPayload?: ModifyAtPersonPayload

  @Field(() => ModifyAtPersonPayload, { nullable: true })
  modifySmsAtPersonPayload?: ModifyAtPersonPayload
}

@InputType()
class UpdateEndpointAllInput {
  @Field(() => UpdateEndpointAllPayload)
  payload: UpdateEndpointAllPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
class UpdateEndpointInput {
  @Field(() => UpdateEndpointPayload)
  payload: UpdateEndpointPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateEndpointService extends ActionService {
  @Inject()
  updateSNSApplicationEndpointAction: UpdateSNSApplicationEndpointAction
  @Inject() updateSNSTopicAction: UpdateSNSTopicAction

  @Inject() addSNSDingTalkAtPersonAction: AddSNSDingTalkAtPersonAction
  @Inject() removeSNSDingTalkAtPersonAction: RemoveSNSDingTalkAtPersonAction
  @Inject() updateSNSDingTalkEndpointAction: UpdateSNSDingTalkEndpointAction

  @Inject() addSNSFeiShuAtPersonAction: AddSNSFeiShuAtPersonAction
  @Inject() removeSNSFeiShuAtPersonAction: RemoveSNSFeiShuAtPersonAction
  @Inject() updateSNSFeiShuEndpointAction: UpdateSNSFeiShuEndpointAction

  @Inject() addSNSWeComAtPersonAction: AddSNSWeComAtPersonAction
  @Inject() removeSNSWeComAtPersonAction: RemoveSNSWeComAtPersonAction
  @Inject() updateSNSWeComEndpointAction: UpdateSNSWeComEndpointAction
  @Inject()
  deleteEmailAddressOfEndpointAction: DeleteEmailAddressOfSNSEmailEndpointAction
  @Inject()
  addEmailAddressToSNSEmailEndpointAction: AddEmailAddressToSNSEmailEndpointAction

  @Inject() addSNSSmsReceiverAction: AddSNSSmsReceiverAction
  @Inject() removeSNSSmsReceiverAction: RemoveSNSSmsReceiverAction

  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  updateSNSApplicationEndpoint(@Args('input') input: UpdateEndpointInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'EndPoint', async (payload: UpdateEndpointPayload, taskId: string) => {
      const { uuid, locale } = payload
      if (locale) {
        await this.updateSNSTopicAction.call({ uuid, locale }, { actionId, taskId })
      }
      const result: UpdateSNSApplicationEndpointResult =
        await this.updateSNSApplicationEndpointAction.call(payload, {
          actionId,
          taskId
        })
      return {
        id: uuid,
        fields: 'name, description',
        inventory: result?.inventory
      }
    })
    return { actionId }
  }

  @Mutation(() => ActionResult)
  updateEndpointAll(@Args('input') input: UpdateEndpointAllInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'EndPoint',
      async (payload: UpdateEndpointAllPayload, taskId: string) => {
        const {
          updateEndpointPayload,
          modifyDingTalkAtPersonPayload,
          modifyEmailAddressOfEndpointPayload,
          modifyFeishuAtPersonPayload,
          modifyWecomAtPersonPayload,
          modifySmsAtPersonPayload
        } = payload
        const { uuid, locale, topicUuid } = updateEndpointPayload
        if (locale) {
          await this.updateSNSTopicAction.call({ uuid: topicUuid, locale }, { actionId, taskId })
        }
        const result: UpdateSNSApplicationEndpointResult =
          await this.updateSNSApplicationEndpointAction.call(updateEndpointPayload, {
            actionId,
            taskId
          })

        if (modifyDingTalkAtPersonPayload) {
          await this.updateDingTalk(
            updateEndpointPayload,
            modifyDingTalkAtPersonPayload,
            actionId,
            taskId
          )
        }

        if (modifyFeishuAtPersonPayload) {
          await this.updateFeishu(
            updateEndpointPayload,
            modifyFeishuAtPersonPayload,
            actionId,
            taskId
          )
        }

        if (modifyWecomAtPersonPayload) {
          await this.updateWecom(
            updateEndpointPayload,
            modifyWecomAtPersonPayload,
            actionId,
            taskId
          )
        }

        if (modifyEmailAddressOfEndpointPayload) {
          await this.updateEmail(
            updateEndpointPayload,
            modifyEmailAddressOfEndpointPayload,
            actionId,
            taskId
          )
        }

        if (modifySmsAtPersonPayload) {
          await this.updatedSms(updateEndpointPayload, modifySmsAtPersonPayload, actionId, taskId)
        }

        return {
          id: uuid,
          fields: 'name, description',
          inventory: result?.inventory
        }
      }
    )
    return { actionId }
  }
  async updateDingTalk(
    updateEndpointPayload: UpdateEndpointPayload,
    modifyDingTalkAtPersonPayload: ModifyAtPersonPayload,
    actionId: string,
    taskId: string
  ) {
    const { uuid } = updateEndpointPayload

    /**
     * 若修改了提示群成员，此时需要删掉所有人，否则 atPersonList 还会返回数据到 ui，导致 ui 渲染出错，
     * 因为 ui 上渲染提示群成员的类型是 无 的逻辑是依据 atPersonList 为空且 atAll 为 false
     *
     * 1. 指定人改成无时，atAll = false, atPersonLis = []
     * 2. 指定人改成所有人时，atAll = true
     */
    if (updateEndpointPayload.hasOwnProperty('atAll')) {
      const willBeRemovedAtPersonList = await this.getWillBeRemovedAtPersonList(
        uuid,
        'SNSDingTalkAtPerson',
        ['phoneNumber']
      )

      if (willBeRemovedAtPersonList) {
        await Promise.all(
          willBeRemovedAtPersonList.map(({ phoneNumber }) =>
            this.removeSNSDingTalkAtPersonAction.call(
              {
                phoneNumber,
                endpointUuid: uuid
              },
              { actionId, taskId }
            )
          )
        )
      }

      if (modifyDingTalkAtPersonPayload.atPersonList?.length) {
        await Promise.all(
          modifyDingTalkAtPersonPayload.atPersonList.map(item =>
            this.addSNSDingTalkAtPersonAction.call(
              {
                remark: item.remark,
                phoneNumber: item.phoneNumber,
                endpointUuid: uuid
              },
              { actionId, taskId }
            )
          )
        )
      }
    }

    await this.updateSNSDingTalkEndpointAction.call({
      uuid: uuid,
      ...updateEndpointPayload
    })
  }
  async updateFeishu(
    updateEndpointPayload: UpdateEndpointPayload,
    modifyFeishuAtPersonPayload: ModifyAtPersonPayload,
    actionId: string,
    taskId: string
  ) {
    const { uuid } = updateEndpointPayload

    /**
     * 若修改了提示群成员，此时需要删掉所有人，否则 atPersonList 还会返回数据到 ui，导致 ui 渲染出错，
     * 因为 ui 上渲染提示群成员的类型是 无 的逻辑是依据 atPersonList 为空且 atAll 为 false
     *
     * 1. 指定人改成无时，atAll = false, atPersonLis = []
     * 2. 指定人改成所有人时，atAll = true
     */
    if (updateEndpointPayload.hasOwnProperty('atAll')) {
      const willBeRemovedAtPersonList = await this.getWillBeRemovedAtPersonList(
        uuid,
        'SNSFeiShuAtPerson',
        ['userId']
      )

      if (willBeRemovedAtPersonList) {
        await Promise.all(
          willBeRemovedAtPersonList.map(({ userId }) => {
            return this.removeSNSFeiShuAtPersonAction.call(
              {
                userId: encodeURIComponent(userId),
                endpointUuid: uuid
              },
              { actionId, taskId }
            )
          })
        )
      }

      if (modifyFeishuAtPersonPayload.atPersonList?.length) {
        await Promise.all(
          modifyFeishuAtPersonPayload.atPersonList.map(item =>
            this.addSNSFeiShuAtPersonAction.call(
              {
                userId: item.userId,
                remark: item.remark,
                endpointUuid: uuid
              },
              { actionId, taskId }
            )
          )
        )
      }
    }

    await this.updateSNSFeiShuEndpointAction.call({
      uuid: uuid,
      ...updateEndpointPayload
    })
  }

  async updateWecom(
    updateEndpointPayload: UpdateEndpointPayload,
    modifyWecomAtPersonPayload: ModifyAtPersonPayload,
    actionId: string,
    taskId: string
  ) {
    const { uuid } = updateEndpointPayload

    /**
     * 若修改了提示群成员，此时需要删掉所有人，否则 atPersonList 还会返回数据到 ui，导致 ui 渲染出错，
     * 因为 ui 上渲染提示群成员的类型是 无 的逻辑是依据 atPersonList 为空且 atAll 为 false
     *
     * 1. 指定人改成无时，atAll = false, atPersonLis = []
     * 2. 指定人改成所有人时，atAll = true
     */
    if (updateEndpointPayload.hasOwnProperty('atAll')) {
      const willBeRemovedAtPersonList = await this.getWillBeRemovedAtPersonList(
        uuid,
        'SNSWeComAtPerson',
        ['userId']
      )

      if (willBeRemovedAtPersonList) {
        await Promise.all(
          willBeRemovedAtPersonList.map(({ userId }) => {
            return this.removeSNSWeComAtPersonAction.call(
              {
                userId: encodeURIComponent(userId),
                endpointUuid: uuid
              },
              { actionId, taskId }
            )
          })
        )
      }

      if (modifyWecomAtPersonPayload.atPersonList?.length) {
        await Promise.all(
          modifyWecomAtPersonPayload.atPersonList.map(item =>
            this.addSNSWeComAtPersonAction.call(
              {
                userId: item.userId,
                remark: item.remark,
                endpointUuid: uuid
              },
              { actionId, taskId }
            )
          )
        )
      }
    }

    await this.updateSNSWeComEndpointAction.call({
      uuid: uuid,
      ...updateEndpointPayload
    })
  }

  async updatedSms(
    updateEndpointPayload: UpdateEndpointPayload,
    modifySmsAtPersonPayload: ModifyAtPersonPayload,
    actionId: string,
    taskId: string
  ) {
    const { uuid } = updateEndpointPayload
    const willBeRemovedAtPersonList = await this.getWillBeRemovedAtPersonList(
      uuid,
      'SNSSmsReceiver',
      ['phoneNumber']
    )

    if (willBeRemovedAtPersonList) {
      await Promise.all(
        willBeRemovedAtPersonList.map(({ phoneNumber }) =>
          this.removeSNSSmsReceiverAction.call(
            {
              phoneNumber,
              endpointUuid: uuid
            },
            { actionId, taskId }
          )
        )
      )
    }

    if (modifySmsAtPersonPayload.atPersonList?.length) {
      await Promise.all(
        modifySmsAtPersonPayload.atPersonList.map(item =>
          this.addSNSSmsReceiverAction.call(
            {
              phoneNumber: item.phoneNumber,
              endpointUuid: uuid,
              type: SmsReceiverType.AliyunSms
            },
            { actionId, taskId }
          )
        )
      )
    }
  }

  async getWillBeRemovedAtPersonList(
    endpointUuid: string,
    tableName: string,
    fields: string[]
  ): Promise<AtPersonInput[]> {
    try {
      const zqlObject: ZqlObject = {
        tableName: tableName,
        fields: fields,
        condition: {
          endpointUuid
        }
      }
      const zql = ZQL.stringify(zqlObject)

      const { results } = await this.zqlService.call(zql)
      return results?.[0]?.inventories ?? []
    } catch (error) {}
  }

  async updateEmail(
    updateEndpointPayload: UpdateEndpointPayload,
    modifyEmailAddressOfEndpointPayload: ModifyEmailAddressOfEndpointPayload,
    actionId: string,
    taskId: string
  ) {
    const { uuid } = updateEndpointPayload
    await Promise.all(
      modifyEmailAddressOfEndpointPayload?.oldEmailAddress?.map(it =>
        this.deleteEmailAddressOfEndpointAction.call(it, { actionId, taskId })
      )
    )
    await Promise.all(
      modifyEmailAddressOfEndpointPayload?.emailAddress?.map(it =>
        this.addEmailAddressToSNSEmailEndpointAction.call(
          {
            emailAddress: it,
            endpointUuid: uuid
          },
          { actionId, taskId }
        )
      )
    )
  }
}
