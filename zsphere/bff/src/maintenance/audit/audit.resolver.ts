import { Inject } from '@nestjs/common'
import { Resolver, Args, Query, ResolveField, Parent } from '@nestjs/graphql'

import { SystemTagDataloader } from '@/common/system-tag/system-tag.dataloader'
import { Audit, AuditResp, GetCurrentTime, QueryAuditArgs } from '@/maintenance/audit/audit.model'
import { AuditService } from '@/maintenance/audit/audit.service'
import { DataProtectionService } from '@/zstack-cloud-code/crypto-compliance/data-protection/data-protection.service'

@Resolver(() => Audit)
export class AuditResolver {
  @Inject() auditService: AuditService
  @Inject() dataProtectionService: DataProtectionService
  @Inject() systemTagDataloader: SystemTagDataloader

  /**
   * 审计列表
   * @param queryArgs
   */
  @Query(() => AuditResp)
  async queryAuditList(@Args() args: QueryAuditArgs): Promise<AuditResp> {
    return this.auditService.queryAuditList(args) as Promise<AuditResp>
  }

  /**
   * 审计子项
   * @param audit 审计 subField
   */
  @ResolveField()
  async operatorAccountName(@Parent() audit: Audit) {
    return await this.auditService.getOperator(audit.requestUuid, audit.operatorAccountUuid)
  }

  @ResolveField(() => Boolean)
  async isValid(@Parent() audit: Audit) {
    return await this.dataProtectionService.checkDataIntegrity(audit.id, 'AuditsVO')
  }

  @ResolveField()
  async currentResourceName(@Parent() audit: Audit) {
    const { resourceUuid } = audit
    if (!resourceUuid) {
      return undefined
    }
    const result = await this.auditService.getCurrentResourceName(resourceUuid)
    return result?.resourceName
  }

  @ResolveField()
  async alarmZhName(@Parent() audit: Audit) {
    if (
      audit.resourceUuid &&
      (audit.resourceType === 'EventSubscriptionVO' || audit.resourceType === 'AlarmVO')
    ) {
      const res = await this.systemTagDataloader.query(audit.resourceUuid, {
        info: { splitIndex: 2 }
      })
      return res?.name
    }
  }

  /**
   * 获取当前时间
   */
  @Query(() => GetCurrentTime)
  async getCurrentTime(): Promise<GetCurrentTime> {
    return await this.auditService.getCurrentTime()
  }
}
