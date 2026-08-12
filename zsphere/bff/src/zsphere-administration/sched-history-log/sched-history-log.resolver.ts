import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { HostDataloader } from '@/hardware-resource/host/host.dataloader'
import { HostVO } from '@/hardware-resource/host/host.model'
import { OwnerByAccountUuidsDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'

import { CommonOwner } from '../owner/owner.model'
import { SchedHistoryLog, SchedHistoryLogList } from './sched-history-log.model'
import { SchedHistoryLogService } from './sched-history-log.service'

@Resolver(() => SchedHistoryLog)
export class SchedHistoryLogResolver {
  @Inject() schedHistoryLogService: SchedHistoryLogService
  @Inject() hostDataloader: HostDataloader
  @Inject() ownerDataLoader: OwnerByAccountUuidsDataLoader
  @Inject() vmInstanceDataloader: VmInstanceDataloader

  @Query(() => SchedHistoryLogList)
  async schedHistoryLogList(@Args() params: QueryAction) {
    return this.schedHistoryLogService.query(params)
  }

  @ResolveField(() => CommonOwner, { nullable: true })
  async owner(@Parent() schedHistoryLog: SchedHistoryLog) {
    return this.ownerDataLoader.query(schedHistoryLog.accountUuid)
  }

  @ResolveField(() => String, { nullable: true })
  async slbUuid(@Parent() schedHistoryLog: SchedHistoryLog) {
    return this.schedHistoryLogService.querySlbUuid(
      schedHistoryLog.id,
      schedHistoryLog.vmInstanceUuid
    )
  }

  @ResolveField(() => HostVO)
  async preHost(@Parent() schedHistoryLog: SchedHistoryLog) {
    return this.hostDataloader.query(
      `${schedHistoryLog.id}-${schedHistoryLog.lastHostUuid}`,
      schedHistoryLog.lastHostUuid
    )
  }

  @ResolveField(() => HostVO)
  async destHost(@Parent() schedHistoryLog: SchedHistoryLog) {
    return this.hostDataloader.query(
      `${schedHistoryLog.id}-${schedHistoryLog.destHostUuid}`,
      schedHistoryLog.destHostUuid
    )
  }

  @ResolveField(() => VmInstance, { nullable: true, description: '' })
  async vmInstance(@Parent() schedHistoryLog: SchedHistoryLog) {
    const vmInstance = await this.vmInstanceDataloader.query(
      schedHistoryLog.id,
      schedHistoryLog.vmInstanceUuid
    )
    return vmInstance
  }
}
