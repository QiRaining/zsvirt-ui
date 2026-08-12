import { Module, forwardRef } from '@nestjs/common'

import { L3NetworkModule } from '../network-resource/l3-network/l3-network.module'
import { AffinityGroupModule } from './affinity-group/affinity-group.module'
import { BaremetalModule } from './baremetal/baremetal.module'
import { BlockSnapshotModule } from './block-snapshot/block-snapshot.module'
import { BlockVolumeModule } from './block-volume/block-volume.module'
import { CdRomsModule } from './cdroms/cdroms.module'
import { HostGroupModule } from './host-group/host-group.module'
import { ImageModule } from './image/image.module'
import { InstanceOfferingModule } from './instance-offering/instance-offering.module'
import { KmsProviderModule } from './kms-provider/kms-provider.module'
import { MdevDeviceSpecModule } from './mdev-device-spec/mdev-device-spec.module'
import { PciDeviceSpecModule } from './pci-device-spec/pci-device-spec.module'
import { VmRelatedResourceModule } from './related-resource/related-resource.module'
import { ResourcesnapshotModule } from './resource-snapshot/resource-snapshot.module'
import { SpecialTreeModule } from './special-tree/special-tree.module'
import { SshKeyPairModule } from './ssh-key-pair/ssh-key-pair.module'
import { VGpuDeviceSpecModule } from './vgpu-device-spec/vgpu-device-spec.module'
import { VmDirectoryGroupModule } from './vm-directory-group/vm-directory-group.module'
import { VmGroupModule } from './vm-group/vm-group.module'
import { VmInstanceModule } from './vm-instance/vm-instance.module'
import { VmNicModule } from './vm-nic/vm-nic.module'
import { VmSchedulingRuleModule } from './vm-scheduling-rule/vm-scheduling-rule.module'
import { VmSpecModule } from './vm-spec/vm-spec.module'
import { VmTemplateModule } from './vm-template/vm-template.module'
import { VolumeModule } from './volume/volume.module'

@Module({
  imports: [
    BaremetalModule,
    SpecialTreeModule,
    VolumeModule,
    forwardRef(() => VmInstanceModule),

    AffinityGroupModule,
    CdRomsModule,
    L3NetworkModule,
    VmNicModule,
    ImageModule,
    InstanceOfferingModule,
    ResourcesnapshotModule,
    PciDeviceSpecModule,
    MdevDeviceSpecModule,
    VGpuDeviceSpecModule,
    VmRelatedResourceModule,
    HostGroupModule,
    VmSchedulingRuleModule,
    VmDirectoryGroupModule,
    VmRelatedResourceModule,
    BlockSnapshotModule,
    BlockVolumeModule,
    SshKeyPairModule,
    VmTemplateModule,
    VmSpecModule,
    KmsProviderModule,
    VmGroupModule
  ]
})
export class VirtualResourceModule {}
