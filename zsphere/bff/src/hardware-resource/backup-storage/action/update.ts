import { Inject } from '@nestjs/common'
import { Int, Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { AddMonToCephBackupStorageAction } from '@/api/zstack/AddMonToCephBackupStorageAction'
import { Op } from '@/api/zstack/base/query-base'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { ReconnectBackupStorageAction } from '@/api/zstack/ReconnectBackupStorageAction'
import { RemoveMonFromCephBackupStorageAction } from '@/api/zstack/RemoveMonFromCephBackupStorageAction'
import { UpdateAliyunEbsBackupStorageAction } from '@/api/zstack/UpdateAliyunEbsBackupStorageAction'
import { UpdateBackupStorageAction } from '@/api/zstack/UpdateBackupStorageAction'
import { UpdateCephBackupStorageMonAction } from '@/api/zstack/UpdateCephBackupStorageMonAction'
import { UpdateImageStoreBackupStorageAction } from '@/api/zstack/UpdateImageStoreBackupStorageAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { UpdateSftpBackupStorageAction } from '@/api/zstack/UpdateSftpBackupStorageAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateImageStoreBackupStoragePayload {
  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => Int, { nullable: true })
  sshPort?: number

  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  systemTags?: any[]

  @Field(() => [String], { nullable: true })
  preSystemTags?: any[]

  @Field(() => String, { nullable: true })
  reservedCapacity?: string

  @Field(() => String, { nullable: true })
  blobUploadConcurrency?: string

  @Field(() => String, { nullable: true })
  blobDownloadConcurrency?: string
}

@InputType()
class UpdateImageStoreBackupStorageInput {
  @Field(() => UpdateImageStoreBackupStoragePayload)
  payload: UpdateImageStoreBackupStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
class UpdateSftpBackupStoragePayload {
  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => Int, { nullable: true })
  sshPort?: number

  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  systemTags?: any[]
}

@InputType()
class UpdateSftpBackupStorageInput {
  @Field(() => UpdateSftpBackupStoragePayload)
  payload: UpdateSftpBackupStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
class UpdateAliyunEbsBackupStoragePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  systemTags?: any[]
}

@InputType()
class UpdateAliyunEbsBackupStorageInput {
  @Field(() => UpdateAliyunEbsBackupStoragePayload)
  payload: UpdateAliyunEbsBackupStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
class UpdateCephBackupStorageMon {
  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => Int, { nullable: true })
  sshPort?: number

  @Field(() => String, { nullable: true })
  sshUsername?: string

  @Field(() => String, { nullable: true })
  sshPassword?: string

  @Field(() => String, { nullable: true })
  monUuid?: string
}

@InputType()
class UpdateCephBackupStoragePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  systemTags?: any[]

  @Field(() => [String], { nullable: true })
  preSystemTags?: string[]

  @Field(() => [UpdateCephBackupStorageMon], { nullable: true })
  mons?: UpdateCephBackupStorageMon[]

  @Field(() => [UpdateCephBackupStorageMon], { nullable: true })
  preMons?: UpdateCephBackupStorageMon[]

  @Field(() => String, { nullable: true })
  reservedCapacity?: string

  @Field(() => String, { nullable: true })
  blobUploadConcurrency?: string

  @Field(() => String, { nullable: true })
  blobDownloadConcurrency?: string
}

@InputType()
class UpdateCephBackupStorageInput {
  @Field(() => UpdateCephBackupStoragePayload)
  payload: UpdateCephBackupStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
class CreateBSSystemTagPayload {
  @Field(() => String)
  resourceType: string

  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  tag: string
}

@InputType()
class CreateBSSystemTagInput {
  @Field(() => CreateBSSystemTagPayload)
  payload: CreateBSSystemTagPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
class DeleteBSSystemTagPayload {
  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  oldTag: string
}

@InputType()
class DeleteBSSystemTagInput {
  @Field(() => DeleteBSSystemTagPayload)
  payload: DeleteBSSystemTagPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
class UpdateBSSystemTagPayload {
  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  oldTag: string

  @Field(() => String)
  tag: string
}

@InputType()
class UpdateBSSystemTagInput {
  @Field(() => UpdateBSSystemTagPayload)
  payload: UpdateBSSystemTagPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateBackupStorageService extends ActionService {
  @Inject()
  updateImageStoreBackupStorageAction: UpdateImageStoreBackupStorageAction
  @Inject()
  updateAliyunEbsBackupStorageAction: UpdateAliyunEbsBackupStorageAction
  @Inject() updateSftpBackupStorageAction: UpdateSftpBackupStorageAction
  @Inject() updateBackupStorageAction: UpdateBackupStorageAction
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject() deleteTagAction: DeleteTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction
  @Inject() addMonToCephBackupStorageAction: AddMonToCephBackupStorageAction
  @Inject()
  removeMonFromCephBackupStorageAction: RemoveMonFromCephBackupStorageAction
  @Inject() updateCephBackupStorageMonAction: UpdateCephBackupStorageMonAction
  @Inject() reconnectBackupStorageAction: ReconnectBackupStorageAction

  async handleBSSystemTags({
    preSystemTags,
    curSystemTags,
    actionId,
    taskId,
    resourceUuid,
    bsType = 'ImageStore'
  }) {
    const handleTagAction = async tagPrefix => {
      const preTag = preSystemTags?.find(tag => tag?.includes(tagPrefix))
      const curTag = curSystemTags?.find(tag => tag?.includes(tagPrefix))
      // 新增
      if (!preTag && curTag) {
        await this.createSystemTagAction.call(
          { tag: curTag, resourceType: 'BackupStorageVO', resourceUuid },
          { actionId, taskId }
        )
      }
      let tagUuid
      if (preTag) {
        tagUuid = await this.querySystemTags(resourceUuid, preTag)
      }
      // 删除
      if (preTag && !curTag && tagUuid) {
        await this.deleteTagAction.call({ uuid: tagUuid }, { actionId, taskId })
      }
      // 更新
      if (preTag && curTag && tagUuid && preTag !== curTag) {
        await this.updateSystemTagAction.call({ uuid: tagUuid, tag: curTag }, { actionId, taskId })
      }
    }
    const curDataNetwork =
      curSystemTags
        ?.find(tag => tag?.includes('backupStorage::data::network::cidr::'))
        ?.split('backupStorage::data::network::cidr::')?.[1] || ''
    const curImageSyncNetwork =
      curSystemTags
        ?.find(tag => tag?.includes('sync::network::cidr::'))
        ?.split('sync::network::cidr::')?.[1] || ''
    await handleTagAction('backupStorage::data::network::cidr::')
    if (bsType === 'ImageStore') {
      await handleTagAction('sync::network::cidr::')
      return { curDataNetwork, curImageSyncNetwork }
    }
    return { curDataNetwork }
  }

  async handleMons({ curMons, preMons, backupStorageUuid, actionId, taskId }) {
    // 逐一对比增删改
    let changeCount = 0
    const preHostnames = preMons?.map(it => it?.hostname)
    const curHostnames = curMons?.map(it => it?.hostname)
    curMons?.forEach(async cur => {
      if (preHostnames?.includes(cur?.hostname)) {
        // 更新
        const preMon = preMons?.find(pre => pre?.hostname === cur?.hostname)
        if (
          !_.isEqual(cur, _.pick(preMon, ['hostname', 'sshPassword', 'sshPort', 'sshUsername']))
        ) {
          changeCount += 1
          await this.updateCephBackupStorageMonAction.call(
            {
              ...cur,
              monUuid: preMon?.monUuid
            },
            {
              actionId,
              taskId
            }
          )
        }
      } else {
        // 新增
        changeCount += 1
        const { hostname, sshUsername, sshPassword, sshPort } = cur
        await this.addMonToCephBackupStorageAction.call(
          {
            uuid: backupStorageUuid,
            monUrls: [`${sshUsername}:${sshPassword}@${hostname}:${sshPort}`]
          },
          {
            actionId,
            taskId
          }
        )
      }
    })
    preMons?.forEach(async pre => {
      if (!curHostnames?.includes(pre?.hostname)) {
        // 删除
        changeCount += 1
        await this.removeMonFromCephBackupStorageAction.call(
          {
            uuid: backupStorageUuid,
            monHostnames: [pre?.hostname]
          },
          {
            actionId,
            taskId
          }
        )
      }
    })
    return { reconnect: changeCount > 0 }
  }

  async handleResourceConfig({
    reservedCapacity,
    blobUploadConcurrency,
    blobDownloadConcurrency,
    resourceUuid,
    actionId,
    taskId
  }) {
    if (reservedCapacity) {
      await this.updateResourceConfigAction.call(
        {
          resourceUuid,
          name: 'reservedCapacity',
          category: 'backupStorage',
          value: reservedCapacity
        },
        { actionId, taskId }
      )
    }
    if (blobUploadConcurrency) {
      await this.updateResourceConfigAction.call(
        {
          resourceUuid,
          name: 'blob.upload.concurrency',
          category: 'imagestore',
          value: blobUploadConcurrency
        },
        { actionId, taskId }
      )
    }
    if (blobDownloadConcurrency) {
      await this.updateResourceConfigAction.call(
        {
          resourceUuid,
          name: 'blob.download.concurrency',
          category: 'imagestore',
          value: blobDownloadConcurrency
        },
        { actionId, taskId }
      )
    }
  }

  @Mutation(() => ActionResult)
  updateImageStoreBackupStorage(@Args('input') input: UpdateImageStoreBackupStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BackupStorage',
      async (payload: UpdateImageStoreBackupStoragePayload, taskId: string) => {
        const {
          reservedCapacity,
          blobUploadConcurrency,
          blobDownloadConcurrency,
          uuid,
          systemTags,
          preSystemTags,
          ...updateBSPayload
        } = payload
        const result = await this.updateImageStoreBackupStorageAction.call(
          { ...updateBSPayload, uuid },
          { actionId, taskId }
        )
        // 处理‘数据网络’、‘镜像同步网络’的增删改
        const { curDataNetwork = '', curImageSyncNetwork = '' } = await this.handleBSSystemTags({
          preSystemTags,
          curSystemTags: systemTags,
          resourceUuid: uuid,
          actionId,
          taskId
        })
        // 处理高级设置
        await this.handleResourceConfig({
          reservedCapacity,
          blobUploadConcurrency,
          blobDownloadConcurrency,
          resourceUuid: uuid,
          actionId,
          taskId
        })
        // 处理 'ip'、'端口'、'用户名'、'密码' 如果其中一项有修改，都需要触发重连
        const { hostname, sshPort, username, password } = updateBSPayload
        if (hostname || sshPort || username || password) {
          await this.reconnectBackupStorageAction.call({ uuid }, { actionId, taskId })
        }
        return {
          id: payload.uuid,
          fields: 'name,description,hostname,dataNetwork,syncImageNetwork,status',
          inventory: {
            ...result?.inventory,
            dataNetwork: curDataNetwork,
            syncImageNetwork: curImageSyncNetwork
          }
        }
      }
    )
    return { actionId }
  }

  @Mutation(() => ActionResult)
  updateSftpBackupStorage(@Args('input') input: UpdateSftpBackupStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BackupStorage',
      async (payload: UpdateSftpBackupStoragePayload, taskId: string) => {
        await this.updateSftpBackupStorageAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }

  @Mutation(() => ActionResult)
  updateAliyunEbsBackupStorage(@Args('input') input: UpdateAliyunEbsBackupStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BackupStorage',
      async (payload: UpdateAliyunEbsBackupStoragePayload, taskId: string) => {
        await this.updateAliyunEbsBackupStorageAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }

  @Mutation(() => ActionResult)
  updateCephBackupStorage(@Args('input') input: UpdateCephBackupStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BackupStorage',
      async (payload: UpdateCephBackupStoragePayload, taskId: string) => {
        const {
          reservedCapacity,
          blobUploadConcurrency,
          blobDownloadConcurrency,
          uuid,
          mons,
          preMons,
          preSystemTags,
          systemTags,
          ...updateBSPayload
        } = payload
        const result = await this.updateBackupStorageAction.call(
          { ...updateBSPayload, uuid },
          { actionId, taskId }
        )
        // 处理‘数据网络’、‘镜像同步网络’的增删改
        const { curDataNetwork = '' } = await this.handleBSSystemTags({
          preSystemTags,
          curSystemTags: systemTags,
          resourceUuid: uuid,
          bsType: 'Ceph',
          actionId,
          taskId
        })
        // 处理高级设置
        await this.handleResourceConfig({
          reservedCapacity,
          blobUploadConcurrency,
          blobDownloadConcurrency,
          resourceUuid: uuid,
          actionId,
          taskId
        })
        // 处理‘监控节点’的增删改
        const { reconnect = false } = await this.handleMons({
          curMons: mons,
          preMons,
          actionId,
          taskId,
          backupStorageUuid: uuid
        })
        // 如果mon节点有变化则重连
        if (reconnect) {
          await this.reconnectBackupStorageAction.call({ uuid }, { actionId, taskId })
        }
        return {
          id: payload.uuid,
          fields: 'name,description,dataNetwork,mons,status',
          inventory: { ...result?.inventory, dataNetwork: curDataNetwork }
        }
      }
    )
    return { actionId }
  }

  @Mutation(() => ActionResult)
  createBSTag(@Args('input') input: CreateBSSystemTagInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BackupStorage',
      async (payload: CreateBSSystemTagPayload, taskId: string) => {
        await this.createSystemTagAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.resourceUuid
        }
      }
    )
    return { actionId }
  }

  @Mutation(() => ActionResult)
  async deleteBSTag(@Args('input') input: DeleteBSSystemTagInput) {
    const actionId = input.action.actionId
    const { resourceUuid, oldTag } = input.payload
    const uuid = await this.querySystemTags(resourceUuid, oldTag)
    this.actionHelper(input, 'BackupStorage', async (payload, taskId: string) => {
      await this.deleteTagAction.call({ uuid }, { actionId, taskId })
      return {
        id: payload.resourceUuid
      }
    })
    return { actionId }
  }

  @Mutation(() => ActionResult)
  async updateBSTag(@Args('input') input: UpdateBSSystemTagInput) {
    const actionId = input.action.actionId
    const { resourceUuid, oldTag, tag } = input.payload
    const uuid = await this.querySystemTags(resourceUuid, oldTag)
    this.actionHelper(input, 'BackupStorage', async (payload, taskId: string) => {
      await this.updateSystemTagAction.call({ uuid, tag }, { actionId, taskId })
      return {
        id: payload.resourceUuid
      }
    })
    return { actionId }
  }

  async querySystemTags(resourceUuid, oldTag) {
    const params = {
      conditions: [
        {
          key: 'resourceUuid',
          op: Op.eq,
          value: resourceUuid
        },
        {
          key: 'tag',
          op: Op.eq,
          value: oldTag
        }
      ]
    }
    const { inventories } = await this.querySystemTagAction.call(params)
    return inventories?.[0]?.uuid
  }
}
