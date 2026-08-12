import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAction } from '@/common/model/action-query.model'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'

import { PciDeviceSpec, PciDeviceSpecList } from './pci-device-spec.model'
import { PciDeviceSpecService } from './pci-device-spec.service'

@Resolver(() => PciDeviceSpec)
export class PciDeviceSpecResolver {
  @Inject() pciDeviceSpecService: PciDeviceSpecService
  @Inject() ownerDataLoader: OwnerDataLoader

  @Query(() => PciDeviceSpecList)
  async pciDeviceSpecList(@Args() queryArgs: QueryAction) {
    return await this.pciDeviceSpecService.queryPciDeviceSpec(queryArgs)
  }

  @Query(() => PciDeviceSpec)
  async pciDeviceSpec(
    @Args({ name: 'uuid', type: () => String }) uuid: string,
    @Args({ name: 'type', type: () => String }) type: string
  ) {
    const queryArgs: IQueryAction = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ],
      type
    }
    const result = await this.pciDeviceSpecService.queryPciDeviceSpec(queryArgs)
    return result.list[0]
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() pciDeviceSpec: PciDeviceSpec): Promise<ShareType> {
    return await this.ownerDataLoader.queryResourceShareType(pciDeviceSpec.uuid)
  }
}
