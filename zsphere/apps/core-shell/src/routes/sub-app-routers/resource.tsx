import React from "react";
import { Route } from "react-router";

import { SuspenseWrapper } from "../components/suspense-wrapper.tsx";
const ResourceLayout = React.lazy(() => import("zsv_resource/layouts"));

// // Index page
const ResourceIndex = React.lazy(() => import("zsv_resource/index"));

// // 主体资源
const RootNodeIndex = React.lazy(() => import("zsv_resource/root-node"));
const ZoneListIndex = React.lazy(() => import("zsv_resource/zone/list"));
const ClusterListIndex = React.lazy(() => import("zsv_resource/cluster/list"));
const HostListIndex = React.lazy(() => import("zsv_resource/host/list"));
const VmIndex = React.lazy(() => import("zsv_resource/vm/index"));

// // 资源分组/目录
// const DirectoryListIndex = React.lazy(() => import("zsv_resource/pages/directory/list/index"));

// // 镜像与模板
// const BackupStorageListIndex = React.lazy(() => import("zsv_resource/pages/backup-storage/list/index"));
// const ImageListIndex = React.lazy(() => import("zsv_resource/pages/image/list/index"));
// const VmTemplateListIndex = React.lazy(() => import("zsv_resource/pages/vm-template/list/index"));

// // 存储
// const PrimaryStorageListIndex = React.lazy(() => import("zsv_resource/pages/primary-storage/list/index"));
// const CephPrimaryStoragePoolListIndex = React.lazy(() => import("zsv_resource/pages/ceph-primary-storage-pool/list/index"));
// const CbdPrimaryStoragePoolListIndex = React.lazy(() => import("zsv_resource/pages/cbd-primary-storage-pool/list/index"));
// const VhostPrimaryStoragePoolListIndex = React.lazy(() => import("zsv_resource/pages/vhost-primary-storage-pool/list/index"));
// const SharedBlockListIndex = React.lazy(() => import("zsv_resource/pages/shared-block/list/index"));
// const SharedBlockCandidateListIndex = React.lazy(() => import("zsv_resource/pages/shared-block-candidate/list/index"));
// const VolumeListIndex = React.lazy(() => import("zsv_resource/pages/volume/list/index"));

// // 存储 - iSCSI
// const IscsiServerListIndex = React.lazy(() => import("zsv_resource/pages/iscsi-server/list/index"));
// const IscsiLunListIndex = React.lazy(() => import("zsv_resource/pages/iscsi-lun/list/index"));

// // 存储 - Fiber Channel
// const FiberChannelStorageListIndex = React.lazy(() => import("zsv_resource/pages/fiber-channel-storage/list/index"));
// const FiberChannelLunListIndex = React.lazy(() => import("zsv_resource/pages/fiber-channel-lun/list/index"));

// // 存储 - SCSI
// const ScsiLunListIndex = React.lazy(() => import("zsv_resource/pages/scsi-lun/list/index"));

// // 存储 - NVMe
// const NvmeLunListIndex = React.lazy(() => import("zsv_resource/pages/nvme-lun/list/index"));
// const NvmeServerListIndex = React.lazy(() => import("zsv_resource/pages/nvme-server/list/index"));

// // 存储 - Ceph
// const CephMonListIndex = React.lazy(() => import("zsv_resource/pages/ceph-mon/list/index"));

// // 存储 - ZBS
// const ZbsMdsListIndex = React.lazy(() => import("zsv_resource/pages/zbs-mds/list/index"));

// // 网络
// const L2NetworkListIndex = React.lazy(() => import("zsv_resource/pages/l2-network/list/index"));
// const L3NetworkListIndex = React.lazy(() => import("zsv_resource/pages/l3-network/list/index"));
// const SecurityGroupListIndex = React.lazy(() => import("zsv_resource/pages/security-group/list/index"));
// const IpRangeListListIndex = React.lazy(() => import("zsv_resource/pages/ip-range-list/list/index"));
// const UplinkGroupListIndex = React.lazy(() => import("zsv_resource/pages/uplink-group/list/index"));
// const BondListIndex = React.lazy(() => import("zsv_resource/pages/bond/list/index"));
// const PhysicalNicListIndex = React.lazy(() => import("zsv_resource/pages/physical-nic/list/index"));

// // 主机硬件设备
// const HostKernelInterfaceListIndex = React.lazy(() => import("zsv_resource/pages/host-kernel-interface/list/index"));
// const GpuDeviceListIndex = React.lazy(() => import("zsv_resource/pages/gpu-device/list/index"));
// const VgpuDeviceListIndex = React.lazy(() => import("zsv_resource/pages/vgpu-device/list/index"));
// const PciDeviceListIndex = React.lazy(() => import("zsv_resource/pages/pci-device/list/index"));
// const UsbListIndex = React.lazy(() => import("zsv_resource/pages/usb/list/index"));

// // 裸金属
// const BaremetalClusterListIndex = React.lazy(() => import("zsv_resource/pages/baremetal-cluster/list/index"));
// const BaremetalChassisListIndex = React.lazy(() => import("zsv_resource/pages/baremetal-chassis/list/index"));
// const BaremetalInstanceListIndex = React.lazy(() => import("zsv_resource/pages/baremetal-instance/list/index"));
// const BaremetalTemplateListIndex = React.lazy(() => import("zsv_resource/pages/baremetal-pre-config-template/list/index"));
// const BaremetalPxeServerListIndex = React.lazy(() => import("zsv_resource/pages/baremetal-pxe-server/list/index"));

// // 虚拟机规范
// const VmSpecListIndex = React.lazy(() => import("zsv_resource/pages/vm-spec/list/index"));

// // 其他
// const TrashListIndex = React.lazy(() => import("zsv_resource/pages/trash/list/index"));

// // 详情页
const RootNodeDetail = React.lazy(
  () => import("zsv_resource/root-node/detail"),
);
const ZoneDetail = React.lazy(() => import("zsv_resource/zone/detail"));
const ClusterDetail = React.lazy(() => import("zsv_resource/cluster/detail"));
const HostDetail = React.lazy(() => import("zsv_resource/host/detail"));
const VmDetail = React.lazy(() => import("zsv_resource/vm/detail"));
const DirectoryDetail = React.lazy(
  () => import("zsv_resource/directory/detail"),
);
const BackupStorageDetail = React.lazy(
  () => import("zsv_resource/backup-storage/detail"),
);
const ImageDetail = React.lazy(() => import("zsv_resource/image/detail"));
const VmTemplateDetail = React.lazy(
  () => import("zsv_resource/vm-template/detail"),
);
const VmSpecDetail = React.lazy(() => import("zsv_resource/vm-spec/detail"));
const PrimaryStorageDetail = React.lazy(
  () => import("zsv_resource/primary-storage/detail"),
);
const L2NetworkDetail = React.lazy(
  () => import("zsv_resource/l2-network/detail"),
);
const L3NetworkDetail = React.lazy(
  () => import("zsv_resource/l3-network/detail"),
);
const SecurityGroupDetail = React.lazy(
  () => import("zsv_resource/security-group/detail/index"),
);
const BaremetalClusterDetail = React.lazy(
  () => import("zsv_baremetal/baremetal-cluster/detail"),
);
const BaremetalChassisDetail = React.lazy(
  () => import("zsv_baremetal/baremetal-chassis/detail"),
);
const BaremetalInstanceDetail = React.lazy(
  () => import("zsv_baremetal/baremetal-instance/detail"),
);
const BaremetalTemplateDetail = React.lazy(
  () => import("zsv_baremetal/baremetal-pre-config-template/detail"),
);
const BaremetalPxeServerDetail = React.lazy(
  () => import("zsv_baremetal/baremetal-pxe-server/detail"),
);
const SharedBlockDetail = React.lazy(
  () => import("zsv_resource/shared-block/detail"),
);
const PhysicalNicDetail = React.lazy(
  () => import("zsv_resource/physical-nic/detail"),
);
const HostKernelInterfaceDetail = React.lazy(
  () => import("zsv_resource/host-kernel-interface/detail"),
);
const GpuDeviceDetail = React.lazy(
  () => import("zsv_resource/gpu-device/detail"),
);
const BondDetail = React.lazy(() => import("zsv_resource/bond/detail"));

// // 404 页面
// const Exception404 = React.lazy(() => import("zsv_resource/pages/404"));

export const resourceRoutes = (
  <Route
    path="virtualization-resource"
    element={
      <SuspenseWrapper>
        <ResourceLayout />
      </SuspenseWrapper>
    }
  >
    <Route
      index
      element={
        <SuspenseWrapper>
          <ResourceIndex />
        </SuspenseWrapper>
      }
    />

    {/* 主体资源 */}
    <Route path="root-node">
      <Route
        index
        element={
          <SuspenseWrapper>
            <RootNodeIndex />
          </SuspenseWrapper>
        }
      />
      <Route
        path="detail"
        element={
          <SuspenseWrapper>
            <RootNodeDetail />
          </SuspenseWrapper>
        }
      />
    </Route>
    <Route
      path="zone"
      element={
        <SuspenseWrapper>
          <ZoneListIndex />
        </SuspenseWrapper>
      }
    />
    <Route
      path="cluster"
      element={
        <SuspenseWrapper>
          <ClusterListIndex />
        </SuspenseWrapper>
      }
    />
    <Route
      path="host"
      element={
        <SuspenseWrapper>
          <HostListIndex />
        </SuspenseWrapper>
      }
    />
    <Route
      path="vm"
      element={
        <SuspenseWrapper>
          <VmIndex />
        </SuspenseWrapper>
      }
    />

    {/* 资源分组/目录 */}
    {/* <Route
            path="directory"
            element={
                <SuspenseWrapper>
                    <DirectoryListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 镜像与模板 */}
    {/* <Route
            path="backup-storage"
            element={
                <SuspenseWrapper>
                    <BackupStorageListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="image"
            element={
                <SuspenseWrapper>
                    <ImageListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="vm-template"
            element={
                <SuspenseWrapper>
                    <VmTemplateListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 存储 - 主存储 */}
    {/* <Route
            path="primary-storage"
            element={
                <SuspenseWrapper>
                    <PrimaryStorageListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="ceph-primary-storage-pool"
            element={
                <SuspenseWrapper>
                    <CephPrimaryStoragePoolListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="cbd-primary-storage-pool"
            element={
                <SuspenseWrapper>
                    <CbdPrimaryStoragePoolListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="vhost-primary-storage-pool"
            element={
                <SuspenseWrapper>
                    <VhostPrimaryStoragePoolListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="shared-block"
            element={
                <SuspenseWrapper>
                    <SharedBlockListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="shared-block-candidate"
            element={
                <SuspenseWrapper>
                    <SharedBlockCandidateListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="volume"
            element={
                <SuspenseWrapper>
                    <VolumeListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 存储 - iSCSI */}
    {/* <Route
            path="iscsi-server"
            element={
                <SuspenseWrapper>
                    <IscsiServerListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="iscsi-lun"
            element={
                <SuspenseWrapper>
                    <IscsiLunListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 存储 - Fiber Channel */}
    {/* <Route
            path="fiber-channel-storage"
            element={
                <SuspenseWrapper>
                    <FiberChannelStorageListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="fiber-channel-lun"
            element={
                <SuspenseWrapper>
                    <FiberChannelLunListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 存储 - SCSI */}
    {/* <Route
            path="scsi-lun"
            element={
                <SuspenseWrapper>
                    <ScsiLunListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 存储 - NVMe */}
    {/* <Route
            path="nvme-lun"
            element={
                <SuspenseWrapper>
                    <NvmeLunListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="nvme-server"
            element={
                <SuspenseWrapper>
                    <NvmeServerListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 存储 - Ceph */}
    {/* <Route
            path="ceph-mon"
            element={
                <SuspenseWrapper>
                    <CephMonListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 存储 - ZBS */}
    {/* <Route
            path="zbs-mds"
            element={
                <SuspenseWrapper>
                    <ZbsMdsListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 网络 */}
    {/* <Route
            path="l2-network"
            element={
                <SuspenseWrapper>
                    <L2NetworkListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="l3-network"
            element={
                <SuspenseWrapper>
                    <L3NetworkListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="security-group"
            element={
                <SuspenseWrapper>
                    <SecurityGroupListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="ip-range-list"
            element={
                <SuspenseWrapper>
                    <IpRangeListListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="uplink-group"
            element={
                <SuspenseWrapper>
                    <UplinkGroupListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="bond"
            element={
                <SuspenseWrapper>
                    <BondListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="physical-nic"
            element={
                <SuspenseWrapper>
                    <PhysicalNicListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 主机硬件设备 */}
    {/* <Route
            path="host-kernel-interface"
            element={
                <SuspenseWrapper>
                    <HostKernelInterfaceListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="gpu-device"
            element={
                <SuspenseWrapper>
                    <GpuDeviceListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="vgpu-device"
            element={
                <SuspenseWrapper>
                    <VgpuDeviceListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="pci-device"
            element={
                <SuspenseWrapper>
                    <PciDeviceListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="usb"
            element={
                <SuspenseWrapper>
                    <UsbListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 裸金属 */}
    {/* <Route
            path="baremetal-cluster"
            element={
                <SuspenseWrapper>
                    <BaremetalClusterListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="baremetal-chassis"
            element={
                <SuspenseWrapper>
                    <BaremetalChassisListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="baremetal-instance"
            element={
                <SuspenseWrapper>
                    <BaremetalInstanceListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="baremetal-template"
            element={
                <SuspenseWrapper>
                    <BaremetalTemplateListIndex />
                </SuspenseWrapper>
            }
        />
        <Route
            path="baremetal-pxe-server"
            element={
                <SuspenseWrapper>
                    <BaremetalPxeServerListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 虚拟机规范 */}
    {/* <Route
            path="vm-spec"
            element={
                <SuspenseWrapper>
                    <VmSpecListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 其他 */}
    {/* <Route
            path="trash"
            element={
                <SuspenseWrapper>
                    <TrashListIndex />
                </SuspenseWrapper>
            }
        /> */}

    {/* 详情页路由 */}

    <Route
      path="zone/detail"
      element={
        <SuspenseWrapper>
          <ZoneDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="cluster/detail"
      element={
        <SuspenseWrapper>
          <ClusterDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="host/detail"
      element={
        <SuspenseWrapper>
          <HostDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="vm/detail"
      element={
        <SuspenseWrapper>
          <VmDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="directory/detail"
      element={
        <SuspenseWrapper>
          <DirectoryDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="backup-storage/detail"
      element={
        <SuspenseWrapper>
          <BackupStorageDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="image/detail"
      element={
        <SuspenseWrapper>
          <ImageDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="vm-template/detail"
      element={
        <SuspenseWrapper>
          <VmTemplateDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="vm-spec/detail"
      element={
        <SuspenseWrapper>
          <VmSpecDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="primary-storage/detail"
      element={
        <SuspenseWrapper>
          <PrimaryStorageDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="l2-network/detail"
      element={
        <SuspenseWrapper>
          <L2NetworkDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="l3-network/detail"
      element={
        <SuspenseWrapper>
          <L3NetworkDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="security-group/detail"
      element={
        <SuspenseWrapper>
          <SecurityGroupDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="baremetal-cluster/detail"
      element={
        <SuspenseWrapper>
          <BaremetalClusterDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="baremetal-chassis/detail"
      element={
        <SuspenseWrapper>
          <BaremetalChassisDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="baremetal-instance/detail"
      element={
        <SuspenseWrapper>
          <BaremetalInstanceDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="baremetal-template/detail"
      element={
        <SuspenseWrapper>
          <BaremetalTemplateDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="baremetal-pxe-server/detail"
      element={
        <SuspenseWrapper>
          <BaremetalPxeServerDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="shared-block/detail"
      element={
        <SuspenseWrapper>
          <SharedBlockDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="physical-nic/detail"
      element={
        <SuspenseWrapper>
          <PhysicalNicDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="host-kernel-interface/detail"
      element={
        <SuspenseWrapper>
          <HostKernelInterfaceDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="gpu-device/detail"
      element={
        <SuspenseWrapper>
          <GpuDeviceDetail />
        </SuspenseWrapper>
      }
    />
    <Route
      path="bond/detail"
      element={
        <SuspenseWrapper>
          <BondDetail />
        </SuspenseWrapper>
      }
    />
  </Route>
);
