import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { CreateVmBackupAction } from '@/api/zstack/CreateVmBackupAction'
import { CreateVolumeBackupAction } from '@/api/zstack/CreateVolumeBackupAction'
import { DoLongjobAction } from '@/api/zstack/DoLongjobAction'
import { SubmitLongJobAction } from '@/api/zstack/SubmitLongJobAction'
import { SyncBackupFromImageStoreBackupStorageAction } from '@/api/zstack/SyncBackupFromImageStoreBackupStorageAction'
import { SyncVmBackupFromImageStoreBackupStorageAction } from '@/api/zstack/SyncVmBackupFromImageStoreBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateBackupPayload {
  @Field(() => String, { description: '资源名称' })
  name: string

  @Field(() => String, { description: '云盘UUID' })
  volumeUuid: string

  @Field(() => String, { description: '全量备份', nullable: true })
  mode?: string

  @Field(() => Boolean, { description: '同时备份已加载的云盘', nullable: true })
  backupWithDataVolume?: boolean

  @Field(() => String, { description: '本地备份服务器UUID' })
  backupStorageUuid: string

  @Field(() => Boolean, {
    description: '同步到远端备份服务器',
    nullable: true,
    defaultValue: false
  })
  sync?: boolean

  @Field(() => String, { description: '远端备份服务器UUID', nullable: true })
  remoteBackupStorageUuid?: string

  @Field(() => Boolean, {
    description: '备份云主机',
    nullable: true,
    defaultValue: true
  })
  isBackupVm?: boolean

  @Field(() => String)
  volumeUuidForTargetResourceUuid?: string
}

@InputType()
class CreateBackupInput {
  @Field(() => CreateBackupPayload)
  payload: CreateBackupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateBackupDataService extends ActionService {
  @Inject() submitLongJobAction: SubmitLongJobAction
  @Inject() doLongjobAction: DoLongjobAction

  @Mutation(() => ActionResult)
  async createBackupData(@Args('input') input: CreateBackupInput) {
    const actionId = input.action.actionId

    const isBackupVm = input.payload.isBackupVm
    const type = isBackupVm ? 'LocalBackupDataVmInstance' : 'LocalBackupDataVolume'

    this.actionHelper(input, type, async (payload: CreateBackupPayload, taskId: string) => {
      const {
        name,
        sync,
        volumeUuid,
        mode,
        backupStorageUuid,
        backupWithDataVolume,
        remoteBackupStorageUuid,
        isBackupVm,
        volumeUuidForTargetResourceUuid
      } = payload

      if (isBackupVm) {
        let jobData: any = {
          name,
          backupStorageUuid
        }
        const jobName = backupWithDataVolume ? 'APICreateVmBackupMsg' : 'APICreateVolumeBackupMsg'

        if (mode === 'full') {
          jobData = {
            ...jobData,
            mode: 'full'
          }
        }

        if (backupWithDataVolume) {
          jobData = {
            ...jobData,
            rootVolumeUuid: volumeUuid
          }
        } else {
          jobData = {
            ...jobData,
            volumeUuid
          }
        }
        if (sync) {
          jobData = {
            ...jobData,
            remoteBackupStorageUuid
          }
        }

        await this.doLongjobAction.call(
          {
            actionName: input.action.name,
            jobName: jobName,
            jobData: JSON.stringify(jobData),
            resourceType: type,
            targetResourceUuid: volumeUuidForTargetResourceUuid
          },
          { actionId, taskId }
        )

        // await this.submitLongJobAction.call(
        //   {
        //     jobData: JSON.stringify(jobData),
        //     jobName,
        //     targetResourceUuid: volumeUuidForTargetResourceUuid
        //   },
        //   {
        //     taskId,
        //     actionId
        //   }
        // )
      } else {
        let jobData: any = {
          name,
          backupStorageUuid,
          volumeUuid
        }
        const jobName = 'APICreateVolumeBackupMsg'
        if (mode === 'full') {
          jobData = {
            ...jobData,
            mode: 'full'
          }
        }
        if (sync) {
          jobData = {
            ...jobData,
            remoteBackupStorageUuid
          }
        }

        await this.doLongjobAction.call(
          {
            actionName: input.action.name,
            jobName: jobName,
            jobData: JSON.stringify(jobData),
            resourceType: type,
            targetResourceUuid: volumeUuidForTargetResourceUuid
          },
          { actionId, taskId }
        )

        // await this.submitLongJobAction.call(
        //   {
        //     jobData: JSON.stringify(jobData),
        //     jobName,
        //     targetResourceUuid: volumeUuidForTargetResourceUuid
        //   },
        //   {
        //     taskId,
        //     actionId
        //   }
        // )
      }

      return {
        id: actionId
      }
    })

    return { actionId }
  }

  action(actionId, type) {
    return async (payload: CreateBackupPayload, taskId: string) => {
      const {
        name,
        sync,
        volumeUuid,
        mode,
        backupStorageUuid,
        backupWithDataVolume,
        remoteBackupStorageUuid,
        isBackupVm,
        volumeUuidForTargetResourceUuid
      } = payload

      if (isBackupVm) {
        let jobData: any = {
          name,
          backupStorageUuid
        }
        const jobName = backupWithDataVolume ? 'APICreateVmBackupMsg' : 'APICreateVolumeBackupMsg'

        if (mode === 'full') {
          jobData = {
            ...jobData,
            mode: 'full'
          }
        }

        if (backupWithDataVolume) {
          jobData = {
            ...jobData,
            rootVolumeUuid: volumeUuid
          }
        } else {
          jobData = {
            ...jobData,
            volumeUuid
          }
        }
        if (sync) {
          jobData = {
            ...jobData,
            remoteBackupStorageUuid
          }
        }

        await this.submitLongJobAction.call(
          {
            jobData: JSON.stringify(jobData),
            jobName,
            targetResourceUuid: volumeUuidForTargetResourceUuid
          },
          {
            taskId,
            actionId
          }
        )
      } else {
        let jobData: any = {
          name,
          backupStorageUuid,
          volumeUuid
        }
        const jobName = 'APICreateVolumeBackupMsg'
        if (mode === 'full') {
          jobData = {
            ...jobData,
            mode: 'full'
          }
        }
        if (sync) {
          jobData = {
            ...jobData,
            remoteBackupStorageUuid
          }
        }

        await this.submitLongJobAction.call(
          {
            jobData: JSON.stringify(jobData),
            jobName,
            targetResourceUuid: volumeUuidForTargetResourceUuid
          },
          {
            taskId,
            actionId
          }
        )
      }

      // if (backupWithDataVolume !== true) {
      //   const { inventory } = await this.createVolumeBackupAction.call(
      //     {
      //       name,
      //       mode,
      //       volumeUuid,
      //       backupStorageUuid
      //     },
      //     {
      //       actionId,
      //       taskId
      //     }
      //   )
      //   backupDataList = inventory
      // } else {
      //   const { inventories } = await this.createVmBackupAction.call(
      //     {
      //       name,
      //       mode,
      //       rootVolumeUuid: volumeUuid,
      //       backupStorageUuid
      //     },
      //     {
      //       actionId,
      //       taskId
      //     }
      //   )
      //   backupDataList = inventories
      // }
      // let backupDataResult = Array.isArray(backupDataList)
      //   ? backupDataList
      //   : [backupDataList]

      // let tasks
      // if (sync === true) {
      //   if (backupDataResult.some(({ type }) => type === 'Root')) {
      //     backupDataResult = backupDataResult.filter(
      //       ({ type }) => type === 'Root'
      //     )
      //   }
      //   tasks = backupDataResult?.map(({ type, uuid, groupUuid = '' }) => {
      //     if (groupUuid && type === 'Root') {
      //       return this.syncVmBackupFromImageStoreBackupStorageAction.call(
      //         {
      //           groupUuid,
      //           srcBackupStorageUuid: backupStorageUuid,
      //           dstBackupStorageUuid: remoteBackupStorageUuid
      //         },
      //         {
      //           actionId,
      //           taskId
      //         }
      //       )
      //     } else {
      //       return this.syncBackupFromImageStoreBackupStorageAction.call(
      //         {
      //           uuid,
      //           srcBackupStorageUuid: backupStorageUuid,
      //           dstBackupStorageUuid: remoteBackupStorageUuid
      //         },
      //         {
      //           actionId,
      //           taskId
      //         }
      //       )
      //     }
      //   })
      //   await Promise.all(tasks)
      // }
      return {
        id: actionId
      }
    }
  }
}
