import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'

import { VGpuDeviceSpec, VGpuDeviceSpecList } from './vgpu-device-spec.model'
import { VGpuDeviceSpecService } from './vgpu-device-spec.service'

@Resolver(() => VGpuDeviceSpec)
export class VGpuDeviceSpecResolver {
  @Inject() vGpuDeviceSpecService: VGpuDeviceSpecService
  @Inject() ownerDataLoader: OwnerDataLoader

  @Query(() => VGpuDeviceSpecList)
  async vgpuDeviceSpecList(@Args() queryArgs: IQueryAction) {
    return this.vGpuDeviceSpecService.queryVGpuDeviceSpec(queryArgs)
  }

  @Query(() => VGpuDeviceSpec)
  async vgpuDeviceSpec(@Args('uuid') uuid: string) {
    const queryArgs: IQueryAction = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }
    const result = await this.vGpuDeviceSpecService.queryVGpuDeviceSpec(queryArgs)
    return result.list[0]
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() vgpuDeviceSpec: VGpuDeviceSpec): Promise<ShareType> {
    return await this.ownerDataLoader.queryResourceShareType(vgpuDeviceSpec.uuid)
  }
}
