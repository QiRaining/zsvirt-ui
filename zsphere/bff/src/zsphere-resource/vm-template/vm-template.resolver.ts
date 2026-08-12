import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { ClusterDataloader } from '@/hardware-resource/cluster/cluster.dataloader'
import { Cluster } from '@/hardware-resource/cluster/cluster.model'
import { HostDataloader } from '@/hardware-resource/host/host.dataloader'
import { HostVO } from '@/hardware-resource/host/host.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'

import { VMGroupDirectory } from '../vm-directory-group/vm-directory-group.model'
import { VmInstanceQueryService } from '../vm-instance/vm-instance-query/vm-instance-query.service'
import { VmInstanceDataloader } from '../vm-instance/vm-instance.dataloader'
import { VmInstanceSystemTag } from '../vm-instance/vm-instance.model'
import { VmTemplateService } from './query/query.service'
import { QueryVmTemplateArgs, VmTemplate, VmTemplateQueryResp } from './vm-template.model'
@Resolver(() => VmTemplate)
export class VmTemplateResolver {
  @Inject() vmTemplateService: VmTemplateService
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() clusterDataloader: ClusterDataloader
  @Inject() zqlService: ZQLService
  @Inject() hostDataloader: HostDataloader
  @Inject() vmInstanceQueryService: VmInstanceQueryService

  @Query(() => VmTemplate, { nullable: true })
  async vmTemplate(@Args('uuid') uuid: string) {
    return await this.vmTemplateService.queryByUuid(uuid)
  }

  @Query(() => VmTemplateQueryResp)
  async vmTemplateList(@Args() queryArgs: QueryVmTemplateArgs): Promise<VmTemplateQueryResp> {
    return this.vmTemplateService.query(queryArgs)
  }

  @Query(() => VmTemplate)
  async vmTemplateByUuid(@Args('uuid') uuid: string): Promise<VmTemplate> {
    return this.vmTemplateService.queryByUuid(uuid)
  }

  @ResolveField(() => Cluster)
  async cluster(@Parent() vt: VmTemplate) {
    return this.clusterDataloader.query(vt.uuid, vt.vm.clusterUuid)
  }

  @ResolveField(() => Cluster)
  async vmInstanceUuid(@Parent() vt: VmTemplate) {
    return vt.uuid
  }

  @ResolveField(() => HostVO)
  async host(@Parent() vt: VmTemplate) {
    const hostUuid = vt?.vm?.hostUuid || vt?.vm?.lastHostUuid
    // if (vt.vm?.state === VmInstanceState.Stopped) {
    //   const zqlObject = {
    //     tableName: 'LocalStorageResourceRef',
    //     fields: 'hostUuid',
    //     condition: {
    //       resourceType: 'VolumeVO',
    //       resourceUuid: vt.vm?.rootVolumeUuid
    //     }
    //   }
    //   const zql = ZQL.stringify(zqlObject)
    //   const { results } = await this.zqlService.call(zql)
    //   hostUuid = _.get(
    //     results,
    //     ['0', 'inventories', '0', 'hostUuid'],
    //     vt.vm?.hostUuid
    //   )
    // }
    return this.hostDataloader.query(`${vt.vm.uuid}-${hostUuid}`, hostUuid)
  }

  @ResolveField(() => VMGroupDirectory, {
    nullable: true,
    description: '云主机目录'
  })
  async group(@Parent() vt: VmTemplate) {
    return this.vmInstanceQueryService.getVmGroupPath(vt.vm.uuid)
  }

  @ResolveField(() => VmInstanceSystemTag, { description: '云主机系统标签' })
  async systemTag(@Parent() vt: VmTemplate) {
    return this.vmInstanceQueryService.getVmInstanceSystemTag(vt.vm.uuid)
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() vt: VmTemplate): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(vt.uuid)
  }

  //   @ResolveField(() => PrimaryStorage)
  //   async primaryStorage(@Parent() bm: BlockVolume) {
  //     return this.primaryStorageDataloader.query(bm.uuid, bm.primaryStorageUuid)
  //   }

  //   @ResolveField()
  //   async instance(@Parent() volume: BlockVolume) {
  //     return this.blockVolumeService.getVmInstance(volume.uuid)
  //   }

  //   @ResolveField()
  //   async lastVmInstance(@Parent() { uuid, lastVmInstanceUuid }: BlockVolume) {
  //     if (!lastVmInstanceUuid) return null

  //     return await this.vmInstanceDataloader.query(uuid, lastVmInstanceUuid)
  //   }
}
