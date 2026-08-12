import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { GetZMigrateGatewayVmInstancesAction } from '@/api/zstack/GetZMigrateGatewayVmInstancesAction'
import { QueryAlarmRecordAction } from '@/api/zstack/QueryAlarmRecordAction'
import { QueryEventRecordAction } from '@/api/zstack/QueryEventRecordAction'
import { Op } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import { SystemTagDataloader } from '@/common/system-tag/system-tag.dataloader'
import {
  AckDataInAlarmHistories,
  AlarmHistories,
  GetCountByNamespaceResp,
  QueryAlarmHistoriesArgs,
  QueryAlarmHistoriesResp,
  ResourceInAlarmHistories,
  AlarmSummary
} from '@/maintenance/zwatch-alarm-histories/zwatch-alarm-histories.model'
import { AlarmHistoriesService } from '@/maintenance/zwatch-alarm-histories/zwatch-alarm-histories.service'
import { OwnerByAccountUuidDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { TagDataloader } from '@/zsphere-administration/tag/tag.dataloader'

import { AlertAckDataloader } from './query/alert-ack-data.dataloader'
import {
  IsVcenterResourceLoader,
  NamespaceToResource,
  ResourceNameloader
} from './query/resource.dataloader'

@Resolver(() => AlarmHistories)
export class AlarmHistoriesResolver {
  @Inject() alarmHistoriesService: AlarmHistoriesService
  @Inject() alertAckDataloader: AlertAckDataloader
  @Inject() resourceNameloader: ResourceNameloader
  @Inject() isVcenterResourceLoader: IsVcenterResourceLoader
  @Inject() queryEventRecordAction: QueryEventRecordAction
  @Inject() queryAlarmRecordAction: QueryAlarmRecordAction
  @Inject() systemTagDataloader: SystemTagDataloader
  @Inject() ownerLoader: OwnerByAccountUuidDataLoader
  @Inject() getZMigrateGatewayVmInstancesAction: GetZMigrateGatewayVmInstancesAction

  private async getGatewayVmName(resourceUuid: string): Promise<string | null> {
    try {
      const result = await this.getZMigrateGatewayVmInstancesAction.call({})
      const gatewayVm = (result?.gatewayVmInstances ?? []).find(
        (vm: any) => vm.uuid === resourceUuid
      )
      return gatewayVm?.name ?? null
    } catch {
      return null
    }
  }

  @Query(() => QueryAlarmHistoriesResp)
  async getAlarmHistoriesList(@Args() queryArgs: QueryAlarmHistoriesArgs) {
    return this.alarmHistoriesService.queryList(queryArgs)
  }

  @Query(() => GetCountByNamespaceResp)
  async getCountByNamespace(@Args() queryArgs: QueryAction) {
    return this.alarmHistoriesService.countByNamespace(queryArgs.conditions)
  }

  @Query(() => AlarmSummary)
  async getAlarmSummary() {
    return this.alarmHistoriesService.getAlarmSummary()
  }

  @Query(() => AlarmHistories)
  async getAlarmHistories(@Args('uuid') uuid: string) {
    const res = await this.alarmHistoriesService.queryList({
      conditions: [
        {
          key: 'dataUuid',
          value: uuid
        }
      ]
    })
    return res?.list?.[0]
  }

  @ResolveField()
  async alarmZhName(@Parent() alarm: AlarmHistories) {
    if (!alarm.alarmUuid) {
      return null
    }
    const res = await this.systemTagDataloader.query(alarm.alarmUuid, {
      info: { splitIndex: 2 }
    })
    return res?.name
  }

  @ResolveField()
  async ackData(@Parent() alarm: AlarmHistories) {
    return this.alertAckDataloader.query(alarm.uuid)
  }

  @ResolveField()
  async resource(@Parent() alarm: AlarmHistories) {
    return {
      uuid: alarm.resourceUuid,
      type: alarm.resourceType,
      tagType: 'mine'
    }
  }

  @ResolveField()
  async firstTime(@Parent() alarm: AlarmHistories) {
    const queryFnMap = {
      alarm: this.queryAlarmRecordAction,
      event: this.queryEventRecordAction
    }
    const sameKeys = this.alarmHistoriesService.getSameKeys(alarm.type as 'alarm')
    const conditions = sameKeys
      .map(key => {
        const _value = alarm[key]
        if (!_value) {
          return { value: undefined }
        }
        if (key === 'labels') {
          return {
            key,
            op: Op.like, // use like
            value: _value
              .replace(/\\/g, '\\\\') // replace \ with \\
              .replace(/"/g, '\\"') // replace " with \"
              .replace(/'/g, '%') // replace ' with %
          }
        }
        return {
          key,
          value: _value
        }
      })
      .filter(({ value }) => value)

    const res = await queryFnMap[alarm.type as 'alarm'].call({
      conditions,
      limit: 1,
      sortDirection: 'asc'
    })

    return res.inventories?.[0]?.createTime
  }

  @ResolveField()
  async namespace(@Parent() alarm: AlarmHistories) {
    if (['ZStack/KVMHost', 'ZStack/XDragonHost'].includes(alarm.namespace)) {
      return 'ZStack/Host'
    }
    return alarm.namespace
  }

  @ResolveField()
  async canLink(@Parent() alarm: AlarmHistories) {
    if (!alarm.resourceUuid) {
      return false
    }
    const tableName = NamespaceToResource[alarm.namespace]
    if (!tableName) {
      return false
    }

    // 这些资源需要判断是不是vcenter资源，如果是，前端限制链接跳转。
    const vcenterList = ['backupstorage', 'primarystorage', 'host', 'cluster']
    if (vcenterList.includes(tableName)) {
      const isVcenter = !!(await this.isVcenterResourceLoader.query(
        alarm.resourceUuid,
        alarm.namespace
      ))
      if (isVcenter) {
        return false
      }
    }

    const res = await this.resourceNameloader.query(alarm.resourceUuid, alarm.namespace)
    if (res?.name) {
      return true
    }
    // 普通 vminstance 表查不到时，回退查询 gateway VM
    if (alarm.namespace === 'ZStack/VM') {
      const gatewayVmName = await this.getGatewayVmName(alarm.resourceUuid)
      return !!gatewayVmName
    }
    return false
  }

  @ResolveField()
  async resourceName(@Parent() alarm: AlarmHistories) {
    if (!!alarm.resourceName) {
      return alarm.resourceName
    }
    // if (alarm.type === 'event') return null
    if (alarm.namespace === 'ZStack/License') {
      return null
    }
    const tableName = NamespaceToResource[alarm.namespace]
    if (!tableName) {
      return null
    }
    if (!alarm.resourceUuid) {
      return null
    }
    const res = await this.resourceNameloader.query(alarm.resourceUuid, alarm.namespace)
    if (res?.name) {
      return res.name
    }
    // 普通 vminstance 表查不到时，回退查询 gateway VM
    if (alarm.namespace === 'ZStack/VM') {
      return this.getGatewayVmName(alarm.resourceUuid)
    }
    return null
  }

  @ResolveField()
  async operatorAccount(@Parent() alarm: AlarmHistories) {
    if (!alarm.operatorAccountUuid) {
      return null
    }
    return this.ownerLoader.query(alarm.operatorAccountUuid)
  }

  @ResolveField()
  async isGatewayVm(@Parent() alarm: AlarmHistories) {
    if (alarm.namespace !== 'ZStack/VM' || !alarm.resourceUuid) {
      return false
    }
    const res = await this.resourceNameloader.query(alarm.resourceUuid, alarm.namespace)
    if (res?.name) {
      return false
    }
    // 普通 vminstance 表查不到，检查是否为 gateway VM
    const gatewayVmName = await this.getGatewayVmName(alarm.resourceUuid)
    return !!gatewayVmName
  }
}

@Resolver(() => ResourceInAlarmHistories)
export class ResourceInAlarmHistoriesResolver {
  @Inject() tagDataloader: TagDataloader

  @ResolveField()
  async tags(@Parent() resource: ResourceInAlarmHistories) {
    return this.tagDataloader.query(resource)
  }
}

@Resolver(() => AckDataInAlarmHistories)
export class AckDataResolver {
  @Inject() ownerLoader: OwnerByAccountUuidDataLoader

  @ResolveField()
  async owner(@Parent() ackData: AckDataInAlarmHistories) {
    return this.ownerLoader.query(ackData.operatorAccountUuid)
  }
}
