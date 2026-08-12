import { gql, useQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { scsiLunListForZSVInstanceOverView as _scsiLunList } from "@zstack/virtualization-resource/src/gql/scsi-lun.gql";
import { volumeList as _volumeList } from "@zstack/virtualization-resource/src/gql/volume.gql";
import { ResourceName } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { Illustration } from "@zstack/zsphere-illustration";
import {
  Op,
  PrimaryStorageType,
  VolumeProvisioningStrategy,
  VolumeQueryType,
} from "@zstack/zsphere-types";
import { NavView } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  SyncVolumeSizePayload,
} from "@zstack/zsphere-types/graphql";
import { formatBytesToSize, formatStorage } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import { getDiskBusTypeDisplay } from "../../../utils.tsx";

import style from "../style.module.less";

const _syncVolumeSize = gql`
  mutation syncVolumeSize($input: SyncVolumeSizeInput!) {
    syncVolumeSize(input: $input) {
      actionId
    }
  }
`;
function getBandwidthOrIopsValue(
  total: number | undefined | null,
  read: number | undefined | null,
  write: number | undefined | null,
): number | undefined {
  if (total !== null && total !== undefined && total > -1) {
    return total;
  }
  if (read !== null && read !== undefined && read > -1) {
    return read;
  }
  if (write !== null && write !== undefined && write > -1) {
    return write;
  }
  return -1; // 或者返回 undefined
}
export const useVolumeList: any = (vm: IVM) => {
  const intl = useIntl();
  const doAction = useAction();
  const { data: volumeData, refetch: refetchVolume } = useQuery(_volumeList, {
    variables: {
      type: VolumeQueryType.GET_VOLUME_BY_VMINSTANCE_UUID,
      extraConditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vm.uuid }],
      vmInstanceUuid: vm.uuid,
      limit: 24,
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
      limit: 24,
    },
  });

  const refetch = useCallback(() => {
    refetchVolume();
    refetchLun();
  }, [refetchVolume, refetchLun]);

  const refresh = async (volumeUuid: string) => {
    const payload: SyncVolumeSizePayload = { uuid: volumeUuid };
    doAction({
      mutation: _syncVolumeSize,
      payload,
      name: intl.formatMessage({
        id: "sync.volumeSize",
        defaultMessage: "Refresh Disk Storage Usage",
      }),
      total: 1,
      type: "Volume",
    });
  };

  const volumeList = useMemo(() => {
    if (!vm?.uuid) {
      return [];
    }
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
          (scsiLunVmInstanceRef: any) =>
            scsiLunVmInstanceRef.vmInstanceUuid === vm.uuid,
        )?.lastOpDate,
        deviceId: t.scsiLunVmInstanceRefs.filter(
          (scsiLunVmInstanceRef: any) =>
            scsiLunVmInstanceRef.vmInstanceUuid === vm.uuid,
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
        // 使用 getBandwidthOrIopsValue 函数来简化原始代码
        const iopsRead = getBandwidthOrIopsValue(
          disk?.bandwidth?.iopsTotal,
          disk?.bandwidth?.iopsRead,
        );

        const iopsWrite = getBandwidthOrIopsValue(
          disk?.bandwidth?.iopsTotal,
          undefined,
          disk?.bandwidth?.iopsWrite,
        );

        const volumeBandwidthRead = getBandwidthOrIopsValue(
          disk?.bandwidth?.volumeBandwidth,
          disk?.bandwidth?.volumeBandwidthRead,
        );

        const volumeBandwidthWrite = getBandwidthOrIopsValue(
          disk?.bandwidth?.volumeBandwidth,
          undefined,
          disk?.bandwidth?.volumeBandwidthWrite,
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
                  <span
                    onClick={() => refresh(disk.uuid)}
                    className={style.refreshBtn}
                  >
                    {intl.formatMessage({
                      id: "refresh",
                      defaultMessage: "Refresh",
                    })}
                  </span>
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
              // value的算法：
              // 根盘(index === 0)，参考回显逻辑
              // 数据盘（index > 0）：
              value: getDiskBusTypeDisplay(intl, disk, index, vm),
              //show: index > 0s
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
                    {volumeBandwidthRead! > -1
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
                    {volumeBandwidthWrite! > -1
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
                    {iopsRead! > -1
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
                    {iopsWrite! > -1
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
                id: "virtualization.model",
                defaultMessage: "Model",
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
  }, [volumeData, lunData, intl, vm]);

  return [volumeList, refetch];
};
