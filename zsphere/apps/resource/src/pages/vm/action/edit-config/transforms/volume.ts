import { SetDiskQosType } from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/disk/utils-common";
import { SystemTagActionType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { parseNumber } from "@zstack/zsphere-utils";
import * as _ from "lodash-es";

import type { TransformContext } from "./types";

export const volumeTransform = (
  ctx: TransformContext,
  generateArrayPayload: (payloadName: string, _payload: any) => void,
  volumeValues: any,
  originValues: any,
  vm: IVM,
) => {
  const { payload, setPayload, setChangeKeys, resourceUuid } = ctx;
  const { name } = vm;
  const volumneList = _.groupBy(
    _.keys(volumeValues),
    (key: string) => key.split("-")[1],
  );
  const originVolumneList = _.groupBy(
    _.keys(originValues),
    (key: string) => key.split("-")[1],
  );

  const addList = _.difference(_.keys(volumneList), _.keys(originVolumneList));
  const removeList = _.keys(originVolumneList).filter(
    (key: string) =>
      originValues?.[`removedisk-${key}`] && originValues?.[`diskUuid-${key}`],
  );
  const updateList = _.keys(originVolumneList).filter(
    (key: string) => !originValues?.[`removedisk-${key}`],
  );

  // 统计需要命名的新增数据盘数量（排除已有盘和rdm盘）
  const namableAddDisks = addList.filter((key) => {
    const value = _.pick(volumeValues, volumneList[key]);
    const createtype = value[`diskCreateType-${key}`];
    return createtype === "new" || createtype === "image";
  });
  const isMultiDisk = namableAddDisks.length > 1;
  let letterIndex = 0;

  addList.forEach((key: string, index: number) => {
    setChangeKeys((origin) => origin.concat(key));

    const value = _.pick(volumeValues, volumneList[key]);
    const createtype = value[`diskCreateType-${key}`];
    if (createtype === "created") {
      payload.attachDataVolumeToVmPayload = (
        payload.attachDataVolumeToVmPayload ?? []
      ).concat([
        {
          vmInstanceUuid: resourceUuid,
          volumeUuid: value[`createDisk-${key}`]?.[0]?.uuid,
          index,
        },
      ]);
    } else if (createtype === "rdm") {
      payload.attachScsiLunToVmInstancePayloads = (
        payload.attachScsiLunToVmInstancePayloads ?? []
      ).concat([
        {
          vmInstanceUuid: resourceUuid,
          uuid: value[`RDM-${key}`]?.[0]?.uuid,
          index,
        },
      ]);
    } else {
      const systemTags = [];
      const primaryStorage = _.get(value, [`storePath-${key}`, "0"], {}); // value[`storePath-${key}`]
      if (
        value[`busType-${key}`] &&
        value[`busType-${key}`] !== "virtio" &&
        value[`busType-${key}`] !== "ide"
      ) {
        systemTags.push(`capability::${value[`busType-${key}`]}`);
      }

      if (value[`diskSharable-${key}`]) {
        systemTags.push(`ephemeral::shareable`);
      }

      if (value[`allocationType-${key}`] && !_.isEmpty(primaryStorage)) {
        systemTags.push(
          `volumeProvisioningStrategy::${value[`allocationType-${key}`]}`,
        );
      }

      if (createtype === "new" && primaryStorage?.type === "LocalStorage") {
        systemTags.push(
          `localStorage::hostUuid::${vm.hostUuid ?? vm.lastHostUuid}`,
        );
      }

      if (value[`volumeStoragePool-${key}`]) {
        systemTags.push(
          `ceph::pool::${value[`volumeStoragePool-${key}`]?.[0]?.poolName}`,
        );
      }

      // ZSV-8991: 通过硬盘镜像创建, 后端不支持 psUuid 为空
      //
      const primaryStorageForVolumeImage = primaryStorage?.uuid
        ? primaryStorage
        : vm.primaryStorage;
      payload.createDataVolumeInEditVmPayload = (
        payload.createDataVolumeInEditVmPayload ?? []
      ).concat([
        {
          imageUuid:
            createtype === "image"
              ? value[`diskImage-${key}`]?.[0]?.uuid
              : undefined,
          hostUuid:
            createtype === "image" &&
            primaryStorageForVolumeImage?.type === "LocalStorage"
              ? (vm.hostUuid ?? vm.lastHostUuid)
              : undefined,
          name: isMultiDisk
            ? `Data-for-${name}-${String.fromCharCode(97 + letterIndex++)}`
            : `Data-for-${name}`,
          diskSize: parseNumber(
            value[`diskSize-${key}`].number,
            value[`diskSize-${key}`].unit,
          ),
          readBandwidth:
            value[`turnOnQoS-${key}`] &&
            value[`bandwidthMode-${key}`] === SetDiskQosType.SetBandwidthWR &&
            value[`readBandwidth-${key}`]?.number
              ? parseNumber(
                  Number(value[`readBandwidth-${key}`].number),
                  value[`readBandwidth-${key}`].unit || "",
                )
              : undefined,
          writeBandwidth:
            value[`turnOnQoS-${key}`] &&
            value[`bandwidthMode-${key}`] === SetDiskQosType.SetBandwidthWR &&
            value[`writeBandwidth-${key}`]?.number
              ? parseNumber(
                  Number(value[`writeBandwidth-${key}`].number),
                  value[`writeBandwidth-${key}`].unit || "",
                )
              : undefined,
          totalBandwidth:
            value[`turnOnQoS-${key}`] &&
            value[`bandwidthMode-${key}`] ===
              SetDiskQosType.SetBandwidthTotal &&
            value[`totalBandwidth-${key}`]?.number
              ? parseNumber(
                  Number(value[`totalBandwidth-${key}`].number),
                  value[`totalBandwidth-${key}`].unit || "",
                )
              : undefined,
          readIOPS:
            value[`turnOnQoS-${key}`] &&
            value[`iopsMode-${key}`] === SetDiskQosType.SetIopsWR &&
            value[`iopsRead-${key}`]
              ? Number(value[`iopsRead-${key}`])
              : undefined,
          writeIOPS:
            value[`turnOnQoS-${key}`] &&
            value[`iopsMode-${key}`] === SetDiskQosType.SetIopsWR &&
            value[`iopsWrite-${key}`]
              ? Number(value[`iopsWrite-${key}`])
              : undefined,
          totalIOPS:
            value[`turnOnQoS-${key}`] &&
            value[`iopsMode-${key}`] === SetDiskQosType.SetIopsTotal &&
            value[`iopsTotal-${key}`]
              ? Number(value[`iopsTotal-${key}`])
              : undefined,
          cacheMode: value?.[`cacheMode-${key}`],
          aio: value?.[`aio-${key}`].toString(),
          primaryStorageUuid:
            createtype === "image"
              ? primaryStorageForVolumeImage?.uuid
              : primaryStorage?.uuid,
          systemTags,
          index,
        },
      ]);
    }
  });

  removeList.forEach((key: string) => {
    setChangeKeys((origin) => origin.concat(key));
    const value = _.pick(originValues, originVolumneList[key]);
    if (value[`diskCreateType-${key}`] === "rdm") {
      payload.detachScsiLunFromVmInstancePayloads = (
        payload.detachScsiLunFromVmInstancePayloads ?? []
      ).concat([
        {
          uuid: originValues[`RDM-${key}`]?.[0]?.uuid,
          vmInstanceUuid: resourceUuid,
        },
      ]);
    } else if (value[`removedisk-${key}`] === "Delete") {
      payload.deleteDataVolumePayload = (
        payload.deleteDataVolumePayload ?? []
      ).concat([
        {
          uuid: value[`diskUuid-${key}`],
        },
      ]);
    } else {
      payload.detachDataVolumeFromVmPayload = (
        payload.detachDataVolumeFromVmPayload ?? []
      ).concat([
        {
          uuid: value[`diskUuid-${key}`],
          vmUuid: resourceUuid,
        },
      ]);
    }
  });

  // 更换系统盘
  if (
    payload.detachDataVolumeFromVmPayload?.some(
      ({ uuid }: { uuid: string }) => uuid === vm.rootVolumeUuid,
    ) ||
    payload.deleteDataVolumePayload?.some(
      ({ uuid }: { uuid: string }) => uuid === vm.rootVolumeUuid,
    )
  ) {
    let volumeUuid = "";
    if (updateList.length) {
      const firstKey = updateList
        .map((item) => Number(item))
        .sort((a, b) => a - b)[0];
      volumeUuid = originValues[`diskUuid-${firstKey}`];
    } else if (addList.length) {
      volumeUuid = "__newDisk__";
    }
    if (volumeUuid) {
      payload.setVmBootVolumePayload = {
        volumeUuid,
        vmInstanceUuid: resourceUuid,
      };
    }
  }

  const volumeQosProps = [
    "turnOnQoS",
    "bandwidthMode",
    "totalBandwidth",
    "writeBandwidth",
    "readBandwidth",
    "iopsMode",
    "iopsTotal",
    "iopsRead",
    "iopsWrite",
  ];

  const parseQos = (qos: { number: string | number; unit: string }) => {
    if (!qos.number) {
      return;
    }
    return parseNumber(Number(qos?.number || 0), qos?.unit || "");
  };

  updateList.forEach((key: string) => {
    const value = _.pick(volumeValues, volumneList[key]);
    const originValue = _.pick(originValues, originVolumneList[key]);
    const updateKeys: string[] = [];
    const volumeUuid = originValue[`diskUuid-${key}`];
    _.keys(value).forEach((_key: string) => {
      if (!_.isEqual(value[_key], originValue[_key])) {
        updateKeys.push(_key);
      }
    });
    // qos 设置
    const qoskeys = updateKeys.filter(
      (_key) =>
        volumeQosProps.findIndex((props) => _key.indexOf(props) > -1) > -1,
    );
    if (qoskeys.includes(`turnOnQoS-${key}`) && !value[`turnOnQoS-${key}`]) {
      // 取消qos
      payload.deleteVolumeQosPayload = (
        payload.deleteVolumeQosPayload ?? []
      ).concat([
        {
          uuid: volumeUuid,
        },
      ]);
    } else if (value[`turnOnQoS-${key}`] && qoskeys?.length) {
      const bandwidthMode = value[`bandwidthMode-${key}`];
      const iopsMode = value[`iopsMode-${key}`];
      const _params: Record<string, number | undefined> = {};
      if (bandwidthMode === SetDiskQosType.SetBandwidthTotal) {
        _params.totalBandwidth = parseQos(value[`totalBandwidth-${key}`]);
      } else {
        _params.readBandwidth = parseQos(value[`readBandwidth-${key}`]);
        _params.writeBandwidth = parseQos(value[`writeBandwidth-${key}`]);
      }
      if (iopsMode === SetDiskQosType.SetIopsTotal) {
        _params.totalIOPS = value[`iopsTotal-${key}`]
          ? Number(value[`iopsTotal-${key}`])
          : undefined;
      } else {
        _params.readIOPS = value[`iopsRead-${key}`]
          ? Number(value[`iopsRead-${key}`])
          : undefined;
        _params.writeIOPS = value[`iopsWrite-${key}`]
          ? Number(value[`iopsWrite-${key}`])
          : undefined;
      }
      for (const key in _params) {
        if (_params[key] === -1 || !_params[key]) {
          delete _params[key];
        }
      }
      if (_.keys(_params)?.length) {
        payload.setVolumeQosPayload = (
          payload.setVolumeQosPayload ?? []
        ).concat([
          {
            uuid: volumeUuid,
            ..._params,
          },
        ]);
      } else if (
        qoskeys.filter((_key) => _key !== `turnOnQoS-${key}`)?.length
      ) {
        // 取消qos
        payload.deleteVolumeQosPayload = (
          payload.deleteVolumeQosPayload ?? []
        ).concat([
          {
            uuid: volumeUuid,
          },
        ]);
      }
    }
    // disksize
    updateKeys.forEach((_key: string) => {
      const num = _key.split("-")[1];
      switch (_key.split("-")[0]) {
        case "diskSize": {
          const size = parseNumber(value?.[_key]?.number, value?.[_key]?.unit);
          if (
            updateKeys.indexOf(`diskImage-${num}`) === -1 ||
            value[`diskImage-${num}`]?.[0]?.size !== size
          ) {
            generateArrayPayload(
              key === "0"
                ? "resizeRootVolumePayload"
                : "resizeDataVolumePayload",
              {
                uuid: volumeUuid,
                size,
              },
            );
          }
          break;
        }
        case "cacheMode":
          generateArrayPayload("updateCacheModeAndAioParams", {
            name: "vm.cacheMode",
            category: "kvm",
            resourceUuid: volumeUuid,
            value: value[_key],
          });
          break;
        case "aio":
          generateArrayPayload("updateCacheModeAndAioParams", {
            name: "aio.native",
            category: "mevoco",
            resourceUuid: volumeUuid,
            value: value[_key].toString(),
          });
          break;
        case "busType":
          //
          if (num === "0") {
            if (["virtio-scsi", "scsi"].includes(value[_key])) {
              generateArrayPayload("setSystemTagPayload", {
                tag: `driver::${value[_key]}`,
                originTag: `driver::${originValue[_key]}`,
                resourceType: "VmInstanceVO",
                resourceUuid: vm.uuid,
                actionType: SystemTagActionType.Delete,
              });
              generateArrayPayload("setSystemTagPayload", {
                tag: `capability::${value[_key]}`,
                originTag: `capability::${originValue[_key]}`,
                resourceType: "VolumeVO",
                resourceUuid: volumeUuid,
                actionType: SystemTagActionType.Update,
              });
            } else if (["virtio-scsi", "scsi"].includes(originValue[_key])) {
              generateArrayPayload("setSystemTagPayload", {
                tag: `capability::${value[_key]}`,
                originTag: `capability::${originValue[_key]}`,
                resourceType: "VolumeVO",
                resourceUuid: volumeUuid,
                actionType: SystemTagActionType.Delete,
              });
              generateArrayPayload("setSystemTagPayload", {
                tag: `driver::${value[_key]}`,
                originTag: `capability::${originValue[_key]}`,
                resourceType: "VmInstanceVO",
                resourceUuid: vm.uuid,
                actionType:
                  value[_key] === "ide"
                    ? SystemTagActionType.Delete
                    : SystemTagActionType.Update,
              });
            } else {
              generateArrayPayload("setSystemTagPayload", {
                tag: `driver::${value[_key]}`,
                originTag: `driver::${originValue[_key]}`,
                resourceType: "VmInstanceVO",
                resourceUuid: vm.uuid,
                actionType:
                  value[_key] === "ide"
                    ? SystemTagActionType.Delete
                    : SystemTagActionType.Update,
              });
            }
          } else {
            generateArrayPayload("setSystemTagPayload", {
              tag: `capability::${value[_key]}`,
              originTag: `capability::${originValue[_key]}`,
              resourceType: "VolumeVO",
              resourceUuid: volumeUuid,
              actionType:
                value[_key] === "virtio" || value[_key] === "ide"
                  ? SystemTagActionType.Delete
                  : SystemTagActionType.Update,
            });
          }
          break;
        case "diskSharable":
          generateArrayPayload("setSystemTagPayload", {
            tag: `ephemeral::shareable`,
            originTag: `ephemeral::shareable`,
            resourceType: "VolumeVO",
            resourceUuid: volumeUuid,
            actionType: originValue[_key]
              ? SystemTagActionType.Delete
              : SystemTagActionType.Create,
          });
          break;
        case "allocationType":
          generateArrayPayload("setSystemTagPayload", {
            tag: `volumeProvisioningStrategy::${value[_key]}`,
            originTag: `volumeProvisioningStrategy::${originValue[_key]}`,
            resourceType: "VolumeVO",
            resourceUuid: volumeUuid,
            actionType: SystemTagActionType.Update,
          });
          break;

        case "diskImage":
          if (key === "0") {
            payload.changeVmImagePayload = {
              vmInstanceUuid: resourceUuid,
              imageUuid: value[_key]?.[0]?.uuid,
            };
          }
      }
    });
  });
  setPayload(payload);
};
