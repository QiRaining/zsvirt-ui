import { Injectable, Inject } from '@nestjs/common'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateVirtualRouterOfferingAction } from '@/api/zstack/CreateVirtualRouterOfferingAction'
import { GetDatabaseBackupFromImageStoreAction } from '@/api/zstack/GetDatabaseBackupFromImageStoreAction'
import { QueryVirtualRouterOfferingAction } from '@/api/zstack/QueryVirtualRouterOfferingAction'
import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator } from '@/common/zql/index'
import { SharedResourceQueryService } from '@/zsphere-administration/owner/shared-resource-query'

import { VirtualRouterOfferingQueryResp } from './virtual-router-offering.model'
@Injectable()
export class VirtualRouterOfferingService extends ActionService {
  @Inject() queryVirtualRouterOfferingAction: QueryVirtualRouterOfferingAction
  @Inject()
  createVirtualRouterOfferingAction: CreateVirtualRouterOfferingAction
  @Inject() shareResourceAction: ShareResourceAction
  @Inject() revokeResourceAction: RevokeResourceSharingAction
  @Inject() sharedResourceQueryService: SharedResourceQueryService
  @Inject() zqlService: ZQLService
  @Inject()
  getDatabaseBackupFromImageStoreAction: GetDatabaseBackupFromImageStoreAction

  async queryList(params: QueryAction): Promise<VirtualRouterOfferingQueryResp> {
    const { type = 'NORMAL' } = params
    let finalZqlCondition: any = {}
    switch (type) {
      case 'SHARED_RESOURCE':
        finalZqlCondition = await this.sharedResourceQueryService.getSharedResourceList(
          params.extraConditions,
          'InstanceOfferingVO'
        )
        break
    }
    const zql = QueryConditionTranslator.mergeQueryAction(params, {
      tableName: 'virtualRouterOffering',
      condition: finalZqlCondition
    })
    const { results } = await this.zqlService.call(ZQL.stringify(zql))

    return {
      list: results[0].inventories,
      total: results[0].total
    }
  }

  async getDatabaseBackupFromImageStore({ conditions, start = 0, limit = 10 }: QueryAction) {
    const { backups = [] } = await this.getDatabaseBackupFromImageStoreAction.call({
      url: conditions.find(({ key }) => key === 'url').value
    })

    return {
      list: backups.slice(start, start + limit).map((item, i) => ({ ...item, uuid: start + i })),
      total: backups.length
    }
  }
}
