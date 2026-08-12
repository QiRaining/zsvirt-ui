import { Inject, Logger } from '@nestjs/common'
import { Resolver, Args, Query, Parent, ResolveField } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { GetZMigrateGatewayVmInstancesAction } from '@/api/zstack/GetZMigrateGatewayVmInstancesAction'
import { SystemTagDataloader } from '@/common/system-tag/system-tag.dataloader'
import { ZOp } from '@/common/zql'
import {
  ZWatchAlarmVO,
  MetricLabelResp,
  ZWatchAlarmVoResp,
  QueryZWatchAlarmArgs,
  QueryMetricLabelListArgs
} from '@/maintenance/zwatch-alarm/zwatch.alarm.model'
import { ZWatchAlarmService } from '@/maintenance/zwatch-alarm/zwatch.alarm.service'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { BasicOwner } from '@/zsphere-administration/owner/owner.model'
import { TagForAlarmDataloader } from '@/zsphere-administration/tag/tag.dataloader'
import { Tag } from '@/zsphere-administration/tag/tag.model'

import { ThirdpartyPlatformDataloader } from '../zwatch-thirdparty-platform/zwatch-thirdparty-platform.dataloader'
import { ThirdpartyPlatform } from '../zwatch-thirdparty-platform/zwatch-thirdparty-platform.model'
import { ZWatchAlarmQueryService } from './zwatch-alarm-query/zwatch-alarm-query.service'

@Resolver(() => ZWatchAlarmVO)
export class ZWatchAlarmResolver {
  @Inject() zwatchAlarmService: ZWatchAlarmService
  @Inject() tagForAlarmDataloader: TagForAlarmDataloader
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() zwatchAlarmQueryService: ZWatchAlarmQueryService
  @Inject() thirdpartyPlatformDataloader: ThirdpartyPlatformDataloader
  @Inject() zhNameDataloader: SystemTagDataloader
  @Inject('resourceTypeSystemTagDataloader')
  resourceTypeDataloader: SystemTagDataloader
  @Inject() getZMigrateGatewayVmInstancesAction: GetZMigrateGatewayVmInstancesAction
  private readonly logger = new Logger(ZWatchAlarmResolver.name)

  /**
   * @param queryArgs
   */
  @Query(() => ZWatchAlarmVoResp)
  async zwatchAlarmList(@Args() queryArgs: QueryZWatchAlarmArgs) {
    return await this.zwatchAlarmService.queryZwatchAlarm(queryArgs)
  }

  @Query(() => ZWatchAlarmVO)
  async zwatchAlarmDetail(@Args('uuid') uuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }

    const result = await this.zwatchAlarmService.queryZwatchAlarm(queryArgs)
    const zwatchAlarm = result.list[0] ?? {}
    return zwatchAlarm
  }

  @ResolveField(() => [Tag])
  async userTag(@Parent() alarm: ZWatchAlarmVO) {
    return await this.tagForAlarmDataloader.query({
      uuid: alarm.uuid
    })
  }

  @ResolveField(() => Number)
  async filteredAlarmResourceCount(@Parent() alarm: ZWatchAlarmVO) {
    if (alarm?.namespace === 'ZStack/VM') {
      const vmCount = await this.zwatchAlarmQueryService.getFilteredAlarmResourceCount(
        alarm?.uuid,
        alarm.labels
      )

      // Count gateway VMs that match the alarm's label UUIDs
      let gatewayVmCount = 0
      try {
        const alarmVmUuids = (alarm.labels ?? [])
          .map(label => label.value)
          .filter(Boolean)
          .flatMap(value => value.split('|'))

        if (alarmVmUuids.length > 0) {
          const gatewayVmResult = await this.getZMigrateGatewayVmInstancesAction.call({})
          const gatewayVmInstances = gatewayVmResult?.gatewayVmInstances ?? []
          gatewayVmCount = gatewayVmInstances.filter(vm => alarmVmUuids.includes(vm.uuid)).length
        }
      } catch (err) {
        this.logger.warn(
          `Failed to get gateway VM count for alarm ${alarm?.uuid}: ${err?.message ?? err}`
        )
      }

      return vmCount + gatewayVmCount
    }
    return 0
  }

  @ResolveField(() => String)
  async zhName(@Parent() alarm: ZWatchAlarmVO) {
    const res = await this.zhNameDataloader.query(alarm.uuid, {
      condition: {
        tag: {
          [ZOp.like]: 'name::cn::%'
        }
      },
      info: {
        splitIndex: 2
      }
    })
    return res?.name || ''
  }

  @ResolveField(() => BasicOwner)
  async owner(@Parent() alarm: ZWatchAlarmVO) {
    return await this.ownerDataLoader.query(alarm.uuid)
  }

  @ResolveField(() => String)
  async namespace(@Parent() alarm: ZWatchAlarmVO) {
    if (['ZStack/KVMHost', 'ZStack/XDragonHost'].includes(alarm.namespace)) {
      return 'ZStack/Host'
    }
    if (alarm.namespace === 'ZStack/BackupStorage') {
      const tag = await this.resourceTypeDataloader.query(alarm.uuid, {
        condition: {
          tag: {
            [ZOp.eq]: 'resourceName::DisasterRecoveryStorage'
          }
        }
      })
      if (tag?.resourceName) {
        return 'ZStack/DisasterRecoveryStorage'
      }
      return 'ZStack/BackupStorage'
    }
    return alarm.namespace
  }

  @ResolveField(() => ThirdpartyPlatform)
  async platform(@Parent() alarm: ZWatchAlarmVO) {
    return await this.thirdpartyPlatformDataloader.query(alarm.uuid, alarm.labels?.[0]?.value || '')
  }

  @ResolveField()
  async thirdpartyPlatformName(@Parent() alarm: ZWatchAlarmVO) {
    return await this.zwatchAlarmQueryService.getThirdpartyPlatformName(
      alarm.uuid,
      alarm.labels?.[0]?.value || ''
    )
  }

  /**
   * 获取 MetricLabels
   * @param QueryMetricLabelListArgs
   */
  @Query(() => MetricLabelResp)
  async metricLabelList(@Args() queryArgs: QueryMetricLabelListArgs) {
    return await this.zwatchAlarmService.queryMetricLabelList(queryArgs)
  }
}
