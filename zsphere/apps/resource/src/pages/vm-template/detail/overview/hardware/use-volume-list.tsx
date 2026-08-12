import { useQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { scsiLunListForZSVInstanceOverView as _scsiLunList } from "@zstack/virtualization-resource/src/gql/scsi-lun.gql";
import { volumeList as _volumeList } from "@zstack/virtualization-resource/src/gql/volume.gql";
import { ResourceName } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { Illustration } from "@zstack/zsphere-illustration";
import {
  Op,
  PrimaryStorageType,
  VolumeProvisioningStrategy,
  VolumeQueryType,
} from "@zstack/zsphere-types";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatBytesToSize, formatStorage } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import style from "../style.module.less";

const getBandwidthValue = (total: number, specific: number) => {
  if (total > -1) {
    return total;
  }
  if (specific > -1) {
    return specific;
  }
  return -1;
};

export const useVolumeList: any = (vm: IVM) => {
  const intl = useIntl();

  const { data: volumeData, refetch: refetchVolume } = useQuery(_volumeList, {
    variables: {
      type: VolumeQueryType.GET_VOLUME_BY_VMINSTANCE_UUID,
      extraConditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vm.uuid }],
      vmInstanceUuid: vm.uuid,
      limit: 100,
    },
  });

  const { data: lunData, refetch: refetchLun } = useQuery(_scsiLunList, {
    variables: {
      conditions: [
        {
          key: "scsiLunVmInstanceRef.vmInstanceUuid",
          op: Op.eq,
          value: vm.uuid,
        },
      ],
      limit: 100,
    },
  });

  const refetch = useCallback(() => {
    refetchVolume();
    refetchLun();
  }, [refetchVolume, refetchLun]);

  const volumeList = useMemo(() => {
    if (!volumeData?.volumeList?.list?.length) {
      return [];
    }

    const lunDataList = lunData?.scsiLunList?.list ?? [];
    const volumeList = volumeData?.volumeList?.list ?? [];
    const formatedVolumeData = volumeList.map((t: any) => {
      return {
        ...t,
        diskType: "volume",
      };
    });

    const formatedLunData = lunDataList.map((t: any) => {
      return {
        ...t,
        lastAttachDate: t.scsiLunVmInstanceRefs.filter(
          (t: any) => t.vmInstanceUuid === vm.uuid,
        )?.lastOpDate,
        deviceId: t.scsiLunVmInstanceRefs.filter(
          (t: any) => t.vmInstanceUuid === vm.uuid,
        )?.deviceId,
        diskType: "rdm",
      };
    });

    const formatedData = formatedVolumeData.concat(formatedLunData);

    const list =
      _.sortBy(formatedData ?? [], [
        (disk) => new Date(disk.lastAttachDate).valueOf(),
        "deviceId",
      ]) ?? [];

    return list.map((disk: any, index: number) => {
      if (disk.diskType === "volume") {
        const iopsRead = getBandwidthValue(
          disk?.bandwidth?.iopsTotal ?? -1,
          disk?.bandwidth?.iopsRead ?? -1,
        );
        const iopsWrite = getBandwidthValue(
          disk?.bandwidth?.iopsTotal ?? -1,
          disk?.bandwidth?.iopsWrite ?? -1,
        );

        const volumeBandwidthRead = getBandwidthValue(
          disk?.bandwidth?.volumeBandwidth ?? -1,
          disk?.bandwidth?.volumeBandwidthRead ?? -1,
        );
        const volumeBandwidthWrite = getBandwidthValue(
          disk?.bandwidth?.volumeBandwidth ?? -1,
          disk?.bandwidth?.volumeBandwidthWrite ?? -1,
        );

        return {
          label: (
            <>
              <Illustration type="disk" size={16} />
              {intl.formatMessage({
                id: "volume",
                defaultMessage: "Disk",
              })}{" "}
              {index + 1}
            </>
          ),
          value: formatBytesToSize(disk.size),
          children: [
            {
              label: intl.formatMessage({
                id: "disk.size",
                defaultMessage: "Capacity",
              }),
              value: formatBytesToSize(disk.size),
            },
            {
              label: intl.formatMessage({
                id: "storage.occupation",
                defaultMessage: "Storage Usage",
              }),
              value: (
                <div className={style.actualSizeValue}>
                  <span>{formatStorage(disk.actualSize, 2)}</span>
                </div>
              ),
            },
            {
              label: intl.formatMessage({
                id: "storage.position",
                defaultMessage: "Storage Location",
              }),
              value: (
                <ResourceName
                  value={disk.primaryStorage?.name}
                  link={{
                    leftnav: LeftNavType.DataStorage,
                    uuid: disk.primaryStorage?.uuid,
                    to: "/primary-storage",
                    microAppName: "virtualization-resource",
                  }}
                />
              ),
            },
            {
              label: intl.formatMessage({
                id: "storage.pool",
                defaultMessage: "Storage Pool",
              }),
              value: <Text>{disk.systemTag?.cephStoragePool}</Text>,
              show: disk?.primaryStorage?.type === "Ceph",
            },
            {
              label: intl.formatMessage({
                id: "installPath",
                defaultMessage: "Installation Path",
              }),
              value: <CopyableText>{disk.installPath}</CopyableText>,
            },
            {
              label: intl.formatMessage({
                id: "image",
                defaultMessage: "Image",
              }),
              value: (
                <ResourceName
                  value={disk?.rootImage?.name}
                  link={{
                    leftnav: LeftNavType.TemplateVm,
                    uuid: disk?.rootImageUuid,
                    to: "/image",
                    microAppName: "virtualization-resource",
                    navView: NavView.Resource,
                  }}
                />
              ),
            },
            {
              label: intl.formatMessage({
                id: "disk.type",
                defaultMessage: "Disk Format",
              }),
              value: disk.format,
            },
            {
              label: intl.formatMessage({
                id: "io.type",
                defaultMessage: "Bus Type",
              }),
              //
              value:
                index === 0
                  ? (disk?.systemTag?.capability ??
                    (vm?.systemTag?.vmDriver ? "virtio" : "ide"))
                  : disk?.systemTag?.capability || "virtio",
            },
            {
              label: intl.formatMessage({
                id: "volumeAllocationPolicy",
                defaultMessage: "Provision Method",
              }),
              value:
                disk?.systemTag?.VolumeProvisioningStrategy ===
                VolumeProvisioningStrategy.ThinProvisioning
                  ? intl.formatMessage({
                      id: "thinProvisioning",
                      defaultMessage: "Thin Provision",
                    })
                  : intl.formatMessage({
                      id: "thickProvisioning",
                      defaultMessage: "Thick Provision",
                    }),
              show: ![
                PrimaryStorageType.Addon,
                PrimaryStorageType.Ceph,
              ].includes(disk?.primaryStorage?.type),
            },
            {
              label: intl.formatMessage({
                id: "cache.mode",
                defaultMessage: "Cache Mode",
              }),
              value: disk?.resourceConfig?.vmcacheMode || "none",
            },
            {
              label: intl.formatMessage({
                id: "virtualization.create.instance.hardware.disk.aio.speed.up",
                defaultMessage: "AIO Acceleration",
              }),
              value:
                disk?.resourceConfig?.aionative === "true"
                  ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
                  : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
            },
            {
              label: intl.formatMessage({
                id: "volumeTotalBandwidth",
                defaultMessage: "Disk Bandwidth",
              }),
              auth: {
                authKey: "volumeReadBandwidth",
                type: "block",
                resource: "volume",
              },
              value: (
                <>
                  <div>
                    {intl.formatMessage({
                      id: "diskt.read.maxLimit",
                      defaultMessage: "Read Limit",
                    })}
                    :{" "}
                    {(volumeBandwidthRead ?? -1) > -1
                      ? `${formatStorage(Number(volumeBandwidthRead), 2)}/s`
                      : intl.formatMessage({
                          id: "volumeBandwidthNolimit",
                          defaultMessage: "Unlimited",
                        })}
                  </div>
                  <div>
                    {intl.formatMessage({
                      id: "diskt.write.maxLimit",
                      defaultMessage: "Write limit",
                    })}
                    :{" "}
                    {(volumeBandwidthWrite ?? -1) > -1
                      ? `${formatStorage(Number(volumeBandwidthWrite), 2)}/s`
                      : intl.formatMessage({
                          id: "volumeBandwidthNolimit",
                          defaultMessage: "Unlimited",
                        })}
                  </div>
                </>
              ),
            },
            {
              label: intl.formatMessage({
                id: "volume.iops",
                defaultMessage: "Disk IOPS",
              }),
              auth: {
                authKey: "volumeReadBandwidth",
                type: "block",
                resource: "volume",
              },
              value: (
                <>
                  <div>
                    {intl.formatMessage({
                      id: "disk.read.maxLimit",
                      defaultMessage: "Read-only limit.",
                    })}
                    :{" "}
                    {(iopsRead ?? -1) > -1
                      ? `${iopsRead} IOPS`
                      : intl.formatMessage({
                          id: "volumeBandwidthNolimit",
                          defaultMessage: "Unlimited",
                        })}
                  </div>
                  <div>
                    {intl.formatMessage({
                      id: "diskt.write.maxLimit",
                      defaultMessage: "Write limit",
                    })}
                    :{" "}
                    {(iopsWrite ?? -1) > -1
                      ? `${iopsWrite} IOPS`
                      : intl.formatMessage({
                          id: "volumeBandwidthNolimit",
                          defaultMessage: "Unlimited",
                        })}
                  </div>
                </>
              ),
            },
            {
              label: intl.formatMessage({
                id: "virtualization.create.instance.hardware.shareable.disk",
                defaultMessage: "Shared Disk",
              }),
              value: disk.isShareable
                ? intl.formatMessage({ id: "yes", defaultMessage: "Yes" })
                : intl.formatMessage({ id: "no", defaultMessage: "No" }),
            },
            {
              label: "UUID",
              value: <CopyableText>{disk.uuid}</CopyableText>,
            },
          ],
        };
      }

      if (disk.diskType === "rdm") {
        return {
          label: (
            <>
              <Illustration type="disk" size={16} />
              {intl.formatMessage({
                id: "volume",
                defaultMessage: "Disk",
              })}{" "}
              {index + 1}
            </>
          ),
          value: formatBytesToSize(disk.size),
          children: [
            {
              label: intl.formatMessage({
                id: "disk.size",
                defaultMessage: "Capacity",
              }),
              value: formatBytesToSize(disk.size),
            },
            {
              label: intl.formatMessage({
                id: "disk.rdm.modal",
                defaultMessage: "Vendor",
              }),
              value: <Text>{disk?.vendor}</Text>,
            },
            {
              label: intl.formatMessage({
                id: "disk.rdm.modal",
                defaultMessage: "Vendor",
              }),
              value: <Text>{disk?.model}</Text>,
            },
            {
              label: "WWN",
              value: <CopyableText>{disk?.wwn}</CopyableText>,
            },
            {
              label: "WWID",
              value: <CopyableText>{disk?.wwid}</CopyableText>,
            },
            {
              label: intl.formatMessage({
                id: "disk.rdm.attachedVMCount",
                defaultMessage: "Number of Virtual Machines Mounted",
              }),
              value: <Text>{disk?.scsiLunVmInstanceRefs?.length}</Text>,
            },
            {
              label: intl.formatMessage({
                id: "disk.rdm.source",
                defaultMessage: "Source",
              }),
              value: <CopyableText>{disk?.source}</CopyableText>,
            },
          ],
        };
      }
    });
  }, [volumeData, lunData]);

  return [volumeList, refetch];
};
