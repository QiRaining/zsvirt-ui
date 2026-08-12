import { Module } from '@nestjs/common'

import { BackupStorageModule } from './backup-storage/backup-storage.module'
import { BondModule } from './bond/bond.module'
import { CbdMdsModule } from './cbd-mds/cbd-mds.module'
import { CBDPrimaryStoragePoolModule } from './cbd-primary-storage-pool/cbd-primary-storage-pool.module'
import { CephMonModule } from './ceph-mon/ceph-mon.module'
import { CephPrimaryStoragePoolQueryService } from './ceph-primary-storage-pool/ceph-primary-storage-pool-query/ceph-primary-storage-pool-query.service'
import { CephPrimaryStoragePoolModule } from './ceph-primary-storage-pool/ceph-primary-storage-pool.module'
import { CephPrimaryStoragePoolService } from './ceph-primary-storage-pool/ceph-primary-storage-pool.service'
import { ClusterModule } from './cluster/cluster.module'
import { ConfigFileModule } from './config-file/config-file.module'
import { CPUModule } from './cpu/cpu.module'
import { DiskModule } from './disk/disk.module'
import { FanModule } from './fan/fan.module'
import { FiberChannelLunModule } from './fiber-channel-lun/fiber-channel-lun.module'
import { FiberChannelStorageModule } from './fiber-channel-storage/fiber-channel-storage.module'
import { HostKernelInterfaceModule } from './host-kernel-interface/host-kernel-interface.module'
import { HostModule } from './host/host.module'
import { IscsiLunModule } from './iscsi-lun/iscsi-lun.module'
import { IscsiServerModule } from './iscsi-server/iscsi-server.module'
import { L2NetworkModule } from './l2-network/l2.network.module'
import { MemoryModule } from './memory/memory.module'
import { NVMeLunModule } from './nvme-lun/nvme-lun.module'
import { NvmeServerModule } from './nvme-server/nvme-server.module'
import { NvmeTargetModule } from './nvme-storage/nvme-storage.module'
import { PciDevicModule } from './pci-device/pci-device.module'
import { PhysicalNetworkBondModule } from './physical-network-bond/physical-network-bond.module'
import { PhysicalNetworkInterfaceModule } from './physical-network-interface/physical-network-interface.module'
import { PhysicalNetworkModule } from './physical-network/physical-network.module'
import { PowerSupplyModule } from './power-supply/power-supply.module'
import { PrimaryStorageModule } from './primary-storage/primary-storage.module'
import { RaidModule } from './raid/raid.module'
import { ScsiLunModule } from './scsi-lun/scsi-lun.module'
import { SeDeviceModule } from './se-device/se.device.module'
import { SensorModule } from './sensor/sensor.module'
import { SharedBlockModule } from './shared-block/shared-block.module'
import { StorageAdapterModule } from './storage-adapter/storage-adapter.module'
import { TpmModule } from './tpm/tpm.module'
import { TrashModule } from './trash/trash.module'
import { UplinkGroupModule } from './uplink-group/uplink-group.module'
import { UsbDeviceModule } from './usb-device/usb.device.module'
import { VGpuDeviceModule } from './vgpu-device/vgpu-device.module'
import { WebSSHModule } from './web-ssh/web-ssh.module'
import { ZoneModule } from './zone/zone.module'

@Module({
  imports: [
    ClusterModule,
    HostModule,
    BondModule,
    ZoneModule,
    PrimaryStorageModule,
    BackupStorageModule,
    L2NetworkModule,
    PciDevicModule,
    UsbDeviceModule,
    TpmModule,
    SeDeviceModule,
    VGpuDeviceModule,
    CephPrimaryStoragePoolModule,
    TrashModule,
    CephMonModule,
    IscsiServerModule,
    IscsiLunModule,
    FiberChannelStorageModule,
    ScsiLunModule,
    SharedBlockModule,
    StorageAdapterModule,
    FiberChannelLunModule,

    MemoryModule,
    FanModule,
    NvmeTargetModule,
    NvmeServerModule,
    PowerSupplyModule,
    NVMeLunModule,
    DiskModule,
    SensorModule,
    RaidModule,
    CPUModule,
    WebSSHModule,
    PhysicalNetworkModule,
    PhysicalNetworkBondModule,
    PhysicalNetworkInterfaceModule,
    HostKernelInterfaceModule,
    UplinkGroupModule,
    CBDPrimaryStoragePoolModule,
    CbdMdsModule,
    ConfigFileModule
  ],
  providers: [CephPrimaryStoragePoolQueryService, CephPrimaryStoragePoolService]
})
export class HardwareResourceModule {}
