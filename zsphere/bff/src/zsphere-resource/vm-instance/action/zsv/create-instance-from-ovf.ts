import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, ObjectType } from '@nestjs/graphql'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { get } from 'lodash'

import {
  ExportVmOvaPackageAction,
  ExportVmOvaPackageActionParam
} from '@/api/zstack/ExportVmOvaPackageAction'
import { QueryLongJobAction } from '@/api/zstack/QueryLongJobAction'
import { SubmitLongJobActionParam } from '@/api/zstack/SubmitLongJobAction'
import { ActionService } from '@/base/action-service'
import { LongJobService } from '@/common/long-job/long-job.service'
import {
  ActionInput,
  ActionResult,
  ActionTaskResult,
  ActionTaskState
} from '@/common/model/action.model'

import { CreateInstancePayload, CreateInstanceService } from './create-instance'

@ObjectType()
export class OvfInfo extends ActionResult {
  @Field(() => String, { nullable: true })
  jobResult: string
}

@InputType()
class CreateInstanceFromOvfPayload {
  @Field(() => CreateInstancePayload)
  jsonCreateVmParam: CreateInstancePayload

  @Field(() => String)
  xmlBase64: string

  @Field(() => String)
  backupStorageUuid: string
}

@InputType()
export class CreateInstanceFromOvfInput {
  @Field(() => CreateInstanceFromOvfPayload)
  payload: CreateInstanceFromOvfPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@InputType()
export class ExportVmInstanceFromOvfPayload {
  @Field(() => String)
  vmUuid: string

  @Field(() => String)
  backupStorageUuid: string

  @Field(() => String, { nullable: true })
  name: string
}

@InputType()
export class ExportVmInstanceFromOvfInput {
  @Field(() => [ExportVmInstanceFromOvfPayload])
  payload: ExportVmInstanceFromOvfPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateInstanceFromOvfService extends LongJobService {
  @Inject() queryLongJobAction: QueryLongJobAction
  @Inject() schedulerRegistry: SchedulerRegistry
  @Inject() createVmInstanceService: CreateInstanceService

  sessionId: string
  result: Promise<any>
  constructor() {
    super()
    // this.sessionId = (this._context as any).req.headers['x-session-id']
  }
  async record(jobName, jobData, clientJobUuid, longJobUuid, resourceType): Promise<any> {
    this.sessionId = (this._context as any).req.headers['x-session-id']
    const currSession = await this._zsSession.findOne({
      where: { sessionId: this.sessionId }
    })
    await this.zsLongJob.create({
      longJobUuid,
      clientJobUuid,
      jobName,
      resourceType,
      data: jobData,
      progress: 0,
      state: 'RUNNING',
      userId: currSession.userId,
      createDate: new Date(),
      lastOpDate: new Date()
    })
  }

  async interval(longJobUuid, resolve: any) {
    const cronId = `ovfInterval${longJobUuid}`
    const cronJob = this.schedulerRegistry.getCronJob(`ovfInterval${longJobUuid}`)
    const longJobResp = await this.queryLongJobAction.call(
      { conditions: [{ key: 'apiId', value: longJobUuid }] },
      { sessionId: this.sessionId }
    )
    if (longJobResp.inventories) {
      const longJob = longJobResp.inventories.find(ele => {
        return ele.name === 'APICreateVmInstanceFromOvfMsg'
      })
      let result = longJob.jobResult
      result = JSON.parse(result)
      if (result.stage !== 'imageUploadRequired') {
        return
      }
      cronJob.stop()
      this.schedulerRegistry.deleteCronJob(cronId)
      result.realUuid = longJobResp.inventories[0].uuid
      resolve(JSON.stringify(result))
    }
    if (longJobResp.inventories[0] && longJobResp.inventories[0].state !== 'Running') {
      cronJob.stop()
      this.schedulerRegistry.deleteCronJob(cronId)
    }
  }

  async create(
    jobId: string,
    jobName: string,
    jobData: string,
    actionName: string,
    resourceType: string
  ): Promise<any> {
    await this.recordActionService.recordActionStart(jobData, jobId, actionName)
    await this.recordActionService.recordTaskStart(jobId, jobId)
    const param: SubmitLongJobActionParam = {
      jobName,
      jobData
    }
    let payload: ActionTaskResult
    try {
      this.sessionId = (this._context as any).req.headers['x-session-id']
      const resp = await this.submitLongJobAction.call(param, {
        taskId: jobId,
        actionId: jobId
      })

      const result: {
        actionId?: string
        jobResult?: string
        transit?: string
      } = {}

      const promise = new Promise((r, j) => {
        const job = new CronJob(`*/1 * * * * *`, () => {
          this.interval(resp.inventory.apiId, r)
        })
        this.schedulerRegistry.addCronJob(`ovfInterval${resp.inventory.apiId}`, job as any)
        job.start()
      })

      const job = await promise

      result.jobResult = job as string
      result.actionId = jobId
      result.transit = `${process.env.HOST}:${process.env.BASE_PORT}`

      payload = {
        sessionId: this.sessionId,
        actionId: jobId,
        state: ActionTaskState.success,
        type: resourceType,
        listenerType: 'createInstance'
      }

      this.record(jobName, jobData, jobId, resp.inventory.uuid, resourceType)

      return result
    } catch (e) {
      await this.recordActionService.recordActionFailed(jobId)
      await this.recordActionService.recordTaskFailed(jobId)
      payload = {
        state: ActionTaskState.fail,
        sessionId: this.sessionId,
        actionId: jobId,
        listenerType: 'createInstance',
        error: JSON.stringify(e)
      }
    }
    this.pubSubService.response(payload)
  }

  @Mutation(() => OvfInfo)
  createInstanceFromOvf(
    @Args('input')
    input: CreateInstanceFromOvfInput
  ) {
    const actionId = input.action.actionId
    const jobName = 'APICreateVmInstanceFromOvfMsg'
    const l3NetworkUuids = []
    const systemTags: string[] = this.createVmInstanceService.getVmBaseSystemTag(
      input.payload.jsonCreateVmParam
    )

    //
    if (input.payload.jsonCreateVmParam?.rootPrimaryStorageUuid) {
      systemTags.push(
        `primaryStorageUuidForDataVolume::${input.payload.jsonCreateVmParam.rootPrimaryStorageUuid}`
      )
    }

    const rootVolumeSystemTags = get(input.payload.jsonCreateVmParam, 'rootVolumeSystemTags', [])
    const dataVolumeSystemTags = get(input.payload.jsonCreateVmParam, 'dataVolumeSystemTags', [])

    const { rootPoolName, dataPoolName } = input.payload.jsonCreateVmParam
    delete input.payload.jsonCreateVmParam.rootPoolName
    delete input.payload.jsonCreateVmParam.dataPoolName

    if (rootPoolName) {
      rootVolumeSystemTags.push(`ceph::rootPoolName::${rootPoolName}`)
    }
    if (dataPoolName) {
      dataVolumeSystemTags.push(`ceph::pool::${dataPoolName}`)
    }

    input.payload.jsonCreateVmParam.vmNicConfig.forEach(vmNic => {
      l3NetworkUuids.push(vmNic.l3NetworkUuid)

      if (vmNic.enableSRIOV) {
        systemTags.push(`enableSRIOV::${vmNic.l3NetworkUuid}`)
      }

      if (vmNic?.securityGroupList?.length > 0) {
        const { l3NetworkUuid, securityGroupList } = vmNic
        systemTags.push(`l3::${l3NetworkUuid}::SecurityGroupUuids::${securityGroupList.join(',')}`)
      }
    })
    delete input.payload.jsonCreateVmParam.vmNicConfig

    systemTags.push('vmPriority::Normal')
    systemTags.push('cleanTraffic::false')

    const jsonCreateVmParam = JSON.stringify({
      ...input.payload.jsonCreateVmParam,
      rootVolumeSystemTags,
      dataVolumeSystemTags,
      primaryStorageUuidForRootVolume: input.payload?.jsonCreateVmParam?.rootPrimaryStorageUuid,
      l3NetworkUuids,
      systemTags
    })

    const jobData = JSON.stringify({
      ...input.payload,
      deleteImageOnFail: false, //For analysis
      jsonCreateVmParam,
      jsonImageInfos: '[]'
    })
    const actionName = input.action.name
    return this.create(actionId, jobName, jobData, actionName, 'VmInstance')
  }
}

// 导出 OVA 模板
export class ExportOvfService extends ActionService {
  @Inject() exportVmOvaPackageAction: ExportVmOvaPackageAction

  @Mutation(() => ActionResult)
  exportOvf(@Args('input') input: ExportVmInstanceFromOvfInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: ExportVmInstanceFromOvfPayload, taskId: string) => {
        const { vmUuid, backupStorageUuid, name } = payload
        const params: ExportVmOvaPackageActionParam = {
          vmUuid,
          backupStorageUuid,
          name
        }

        const result = await this.exportVmOvaPackageAction.call(params, {
          actionId,
          taskId
        })

        return {
          id: vmUuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
