import { useLazyQuery } from "@apollo/client";
import { templatedVmInstance } from "@zstack/virtualization-resource/src/gql/vm.gql";
import type { ListItem } from "@zstack/zsphere-components";
import {
  SystemTagActionType,
  VGpuType,
  VmQueryType,
} from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { parseNumber } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

export const useTransformPayload = (vmUuid: string, visible: boolean) => {
  const intl = useIntl();
  const [changeKeys, setChangeKeys] = useState<string[]>([]);
  const [confirmList, setConfirmList] = useState<ListItem[]>([]);

  const [run, { data }] = useLazyQuery(templatedVmInstance);

  useEffect(() => {
    if (visible && vmUuid) {
      run({
        variables: {
          condition: [
            {
              uuid: vmUuid,
            },
          ],
          type: VmQueryType.GetVmInstanceTemplate,
        },
      });
    }
  }, [visible, vmUuid, run]);

  const vm = useMemo(() => {
    if (data?.templatedVmInstances?.[0]) {
      return data.templatedVmInstances[0].vmInstance?.[0];
    }
    return null;
  }, [data]);

  const [payload, setPayload] = useState<any>({
    resourceUuid: vm?.uuid,
  });

  useEffect(() => {
    setPayload({
      ...payload,
      resourceUuid: vm?.uuid,
    });
  }, [vm]);

  const resourceUuid = vm?.uuid;

  const commonTransform =
    (
      key: string,
      payloadKey: string,
      uuidKey: string = "uuid",
      formatFn: (value: any) => string | number = (value) => value,
    ) =>
    (value: any, uuid: string = resourceUuid) => {
      if (!payload[payloadKey]) {
        payload[payloadKey] = { [key]: formatFn(value), [uuidKey]: uuid };
      } else {
        payload[payloadKey][key] = formatFn(value);
      }
      setPayload(payload);
    };

  const groupTransform =
    (key: string, payloadKey: string) =>
    (value: any, uuid: string = resourceUuid) => {
      payload[payloadKey] = {
        directoryUuid: value?.value,
        originDirectoryUuid: vm?.group?.uuid || "-2",
        uuid,
      };

      setPayload(payload);
    };

  const resourceConfigTransform =
    (name: string, category: string) =>
    (value: any, uuid: string = resourceUuid) => {
      if (!payload.updateResourceConfigActionParams) {
        payload.updateResourceConfigActionParams = [
          {
            name,
            category,
            value: value.toString(),
            resourceUuid: uuid,
          },
        ];
      } else {
        payload.updateResourceConfigActionParams.push({
          name,
          category,
          value: value.toString(),
          resourceUuid: uuid,
        });
      }
      setPayload(payload);
    };

  const resourceLeveTransform = (
    value: any,
    originVmPriority: string,
    uuid: string = resourceUuid,
  ) => {
    let vmPriority = "High";
    if (value.cpuResourceLevel === "CpuHigh") {
      vmPriority = value.memoryResourceLevel === "High" ? "High" : "CpuHigh";
    } else {
      vmPriority =
        value.memoryResourceLevel === "High" ? "MemoryHigh" : "Normal";
    }
    if (vmPriority !== originVmPriority) {
      payload.updateVmPriorityPayload = [
        {
          priority: vmPriority,
          uuid,
        },
      ];
    }

    setPayload(payload);
  };

  const cpuSocketsTransform = (value: any, _uuid: string, _values: any) => {
    const fn = systemTagTransform("cpuCores");
    fn(`cpuCores::${value}`);
  };

  const systemTagTransform =
    (
      tag: string,
      formatFn: (value: any, values?: any) => string = (value) => value,
      resourceType: string = "VmInstanceVO",
    ) =>
    (value: any, uuid: string = resourceUuid) => {
      if (!payload.setSystemTagPayload) {
        payload.setSystemTagPayload = [];
      }
      payload.setSystemTagPayload.push({
        tag: formatFn(value),
        originTag: tag,
        resourceType,
        resourceUuid: uuid,
        actionType: SystemTagActionType.Update,
      });
      setPayload(payload);
    };

  const generateArrayPayload = (payloadName: string, _payload: any) => {
    if (!payload?.[payloadName]) {
      payload[payloadName] = [];
    }
    payload[payloadName].push(_payload);
    setPayload(payload);
  };

  const volumeTransform = (volumeValues: any, originValues: any, vm: IVM) => {
    const { name } = vm;
    const volumneList = _.groupBy(
      _.keys(volumeValues),
      (key) => key.split("-")[1],
    );
    const originVolumneList = _.groupBy(
      _.keys(originValues),
      (key) => key.split("-")[1],
    );

    const addList = _.difference(
      _.keys(volumneList),
      _.keys(originVolumneList),
    );
    const removeList = _.keys(originVolumneList).filter(
      (key) =>
        originValues?.[`removedisk-${key}`] &&
        originValues?.[`diskUuid-${key}`],
    );
    const updateList = _.keys(originVolumneList).filter(
      (key) => !originValues?.[`removedisk-${key}`],
    );
    addList.forEach((key, index) => {
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
        if (value[`busType-${key}`] && value[`busType-${key}`] !== "virtio") {
          systemTags.push(`capability::${value[`busType-${key}`]}`);
        }
        if (value[`diskSharable-${key}`]) {
          systemTags.push(`ephemeral::shareable`);
        }
        if (value[`allocationType-${key}`]) {
          systemTags.push(
            `volumeProvisioningStrategy::${value[`allocationType-${key}`]}`,
          );
        }
        if (createtype === "new" && primaryStorage?.type === "LocalStorage") {
          systemTags.push(
            `localStorage::hostUuid::${vm.hostUuid ?? vm.lastHostUuid}`,
          );
        }
        payload.createDataVolumeInEditVmPayload = (
          payload.createDataVolumeInEditVmPayload ?? []
        ).concat([
          {
            imageUuid:
              createtype === "image"
                ? value[`diskImage-${key}`]?.[0]?.uuid
                : undefined,
            hostUuid:
              createtype === "image" && primaryStorage?.type === "LocalStorage"
                ? (vm.hostUuid ?? vm.lastHostUuid)
                : undefined,
            name: `create-from-vm-${name}-${key}`,
            diskSize: parseNumber(
              value[`diskSize-${key}`].number,
              value[`diskSize-${key}`].unit,
            ),
            readBandwidth: value?.[`readBandwidth-${key}`]?.number
              ? parseNumber(
                  Number(value?.[`readBandwidth-${key}`]?.number),
                  value?.[`readBandwidth-${key}`]?.unit || "",
                )
              : -1,
            writeBandwidth: value?.[`writeBandwidth-${key}`]?.number
              ? parseNumber(
                  Number(value?.[`writeBandwidth-${key}`]?.number),
                  value?.[`writeBandwidth-${key}`]?.unit || "",
                )
              : -1,
            totalBandwidth: value?.[`totalBandwidth-${key}`]?.number
              ? parseNumber(
                  Number(value?.[`totalBandwidth-${key}`]?.number),
                  value?.[`totalBandwidth-${key}`]?.unit || "",
                )
              : -1,
            readIOPS: Number(value?.[`readingIops-${key}`] || -1),
            writeIOPS: Number(value?.[`writingIops-${key}`] || -1),
            totalIOPS: Number(value?.[`iopsTotal-${key}`] || -1),
            cacheMode: value?.[`cacheMode-${key}`],
            aio: value?.[`aio-${key}`].toString(),
            primaryStorageUuid: primaryStorage?.uuid,
            systemTags,
            index,
          },
        ]);
      }
    });

    removeList.forEach((key) => {
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

    updateList.forEach((key) => {
      const value = _.pick(volumeValues, volumneList[key]);
      const originValue = _.pick(originValues, originVolumneList[key]);
      const updateKeys: string[] = [];
      const volumeUuid = originValue[`diskUuid-${key}`];
      _.keys(value).forEach((_key) => {
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
        const _params: { [prop: string]: number | undefined } = {
          readBandwidth: parseQos(value?.[`readBandwidth-${key}`]),
          writeBandwidth: parseQos(value?.[`writeBandwidth-${key}`]),
          totalBandwidth: parseQos(value?.[`totalBandwidth-${key}`]),
          readIOPS: Number(value?.[`readingIops-${key}`] || 0),
          writeIOPS: Number(value?.[`writingIops-${key}`] || 0),
          totalIOPS: Number(value?.[`iopsTotal-${key}`] || 0),
        };
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
      updateKeys.forEach((_key) => {
        const num = _key.split("-")[1];
        switch (_key.split("-")[0]) {
          case "diskSize":
            const size = parseNumber(
              value?.[_key]?.number,
              value?.[_key]?.unit,
            );
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
          case "cacheMode":
            generateArrayPayload("updateResourceConfigActionParams", {
              name: "vm.cacheMode",
              category: "kvm",
              resourceUuid: volumeUuid,
              value: value[_key],
            });
            break;
          case "aio":
            generateArrayPayload("updateResourceConfigActionParams", {
              name: "aio.native",
              category: "mevoco",
              resourceUuid: volumeUuid,
              value: value[_key].toString(),
            });
            break;
          case "busType":
            generateArrayPayload(
              "setSystemTagPayload",
              num === "0"
                ? {
                    tag: `driver::${value[_key]}`,
                    originTag: `driver::${originValue[_key]}`,
                    resourceType: "VmInstanceVO",
                    resourceUuid: vm?.uuid,
                    actionType:
                      value[_key] === "ide"
                        ? SystemTagActionType.Delete
                        : SystemTagActionType.Update,
                  }
                : {
                    tag: `capability::${value[_key]}`,
                    originTag: `capability::${originValue[_key]}`,
                    resourceType: "VolumeVO",
                    resourceUuid: volumeUuid,
                    actionType:
                      value[_key] === "virtio"
                        ? SystemTagActionType.Delete
                        : SystemTagActionType.Update,
                  },
            );
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

  const nicTransform = (nicValues: any, originValues: any, vm: IVM) => {
    const vmInstanceUuid = vm?.uuid;
    const nicList = _.groupBy(_.keys(nicValues), (key) => key.split("-")[1]);
    const originNicList = _.groupBy(
      _.keys(originValues),
      (key) => key.split("-")[1],
    );

    const addList = _.difference(_.keys(nicList), _.keys(originNicList));
    const removeList = _.keys(originNicList).filter(
      (key) =>
        originValues?.[`removenetcard-${key}`] &&
        originValues?.[`nicUuid-${key}`],
    );
    const updateList = _.keys(originNicList).filter(
      (key) => !originValues?.[`removenetcard-${key}`],
    );

    addList.forEach((key) => {
      setChangeKeys((origin) => origin.concat(key));
      const value = _.pick(nicValues, nicList[key]);
      const systemTags = [];
      if (value[`netmask-${key}`]) {
        systemTags.push(
          `ipv4Netmask::${value[`l3NetworkUuids-${key}`]?.[0]?.uuid}::${value[`netmask-${key}`]}`,
        );
      }
      if (value[`gateway-${key}`]) {
        systemTags.push(
          `ipv4Gateway::${value[`l3NetworkUuids-${key}`]?.[0]?.uuid}::${value[`gateway-${key}`]}`,
        );
      }
      payload.attachL3NetworkToVmNicInEditVmPayload = (
        payload.attachL3NetworkToVmNicInEditVmPayload ?? []
      ).concat([
        {
          l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
          vmInstanceUuid,
          staticIpv4: value[`ipv4-${key}`],
          customMac: value[`customMac-${key}`],
          vmNicParams: JSON.stringify({
            l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
            state: value[`netCardState-${key}`] ? "enable" : "disable",
            outboundBandwidth: value?.[`outboundBandwidth-${key}`]?.number
              ? parseNumber(
                  Number(value?.[`outboundBandwidth-${key}`]?.number),
                  value?.[`outboundBandwidth-${key}`]?.unit || "",
                )
              : undefined,
            inboundBandwidth: value?.[`inboundBandwidth-${key}`]?.number
              ? parseNumber(
                  Number(value?.[`inboundBandwidth-${key}`]?.number),
                  value?.[`inboundBandwidth-${key}`]?.unit || "",
                )
              : undefined,
            multiQueueNum: value[`nicMultiQueueNum-${key}`]
              ? Number(value[`nicMultiQueueNum-${key}`])
              : undefined,
            vfParentUuid: value[`nicDevice-${key}`]?.[0]?.uuid,
          }),
          driverType: value[`nicType-${key}`],
          systemTags,
        },
      ]);
    });

    removeList.forEach((key) => {
      setChangeKeys((origin) => origin.concat(key));
      const value = _.pick(originValues, originNicList[key]);
      payload.detachL3NetworkFromVmPayload = (
        payload.detachL3NetworkFromVmPayload ?? []
      ).concat([
        {
          vmNicUuid: value[`nicUuid-${key}`],
        },
      ]);
    });

    updateList.forEach((key) => {
      const value = _.pick(nicValues, nicList[key]);
      const originValue = _.pick(originValues, originNicList[key]);
      const updateKeys: string[] = [];
      const nicUuid = originValue[`nicUuid-${key}`];
      _.keys(value).forEach((_key) => {
        if (
          !_.isEqual(value[_key], originValue[_key]) &&
          value[_key] !== originValue[_key]
        ) {
          updateKeys.push(_key);
        } // != 用于处理 null 和undefined的比较
      });

      // qos 设置
      const qoskeys = updateKeys.filter(
        (_key) =>
          [
            "outboundBandwidth",
            "inboundBandwidth",
            "netCardQosEnabled",
          ].findIndex((props) => _key.indexOf(props) > -1) > -1,
      );
      if (qoskeys?.length) {
        payload.setNicQosPayload = (payload.setNicQosPayload ?? []).concat([
          {
            uuid: nicUuid,
            outboundBandwidth:
              value?.[`netCardQosEnabled-${key}`] &&
              value?.[`outboundBandwidth-${key}`]?.number
                ? parseNumber(
                    Number(value?.[`outboundBandwidth-${key}`]?.number || 0),
                    value?.[`outboundBandwidth-${key}`]?.unit || "",
                  )
                : undefined,
            inboundBandwidth:
              value?.[`netCardQosEnabled-${key}`] &&
              value?.[`inboundBandwidth-${key}`]?.number
                ? parseNumber(
                    Number(value?.[`inboundBandwidth-${key}`]?.number),
                    value?.[`inboundBandwidth-${key}`]?.unit || "",
                  )
                : undefined,
          },
        ]);
      }

      // 修改网卡网络配置
      if (updateKeys.some((_key) => _key.indexOf("l3NetworkUuids-") === 0)) {
        const systemTags = [];
        const enabledIpSet = value[`appointIp-${key}`];
        if (enabledIpSet && value[`netmask-${key}`]) {
          systemTags.push(
            `ipv4Netmask::${value[`l3NetworkUuids-${key}`]?.[0]?.uuid}::${value[`netmask-${key}`]}`,
          );
        }
        if (enabledIpSet && value[`gateway-${key}`]) {
          systemTags.push(
            `ipv4Gateway::${value[`l3NetworkUuids-${key}`]?.[0]?.uuid}::${value[`gateway-${key}`]}`,
          );
        }
        generateArrayPayload("changeVmNicNetworkPayload", {
          vmNicUuid: nicUuid,
          destL3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
          staticIpv4: value[`ipv4-${key}`],
          systemTags,
          vmNicParams: JSON.stringify({
            l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
            vfParentUuid: value[`nicDevice-${key}`]?.[0]?.uuid,
            driverType: value[`nicType-${key}`],
          }),
        });
      } else {
        // ip 设置
        const ipkeys = updateKeys.filter(
          (_key) =>
            ["appointIp", "ipv4", "netmask", "gateway"].findIndex(
              (props) => _key.indexOf(props) > -1,
            ) > -1,
        );
        if (ipkeys?.length) {
          const systemTags = [];
          const enabledIpSet = value[`appointIp-${key}`];
          if (enabledIpSet && value[`netmask-${key}`]) {
            systemTags.push(
              `ipv4Netmask::${value[`l3NetworkUuids-${key}`]?.[0]?.uuid}::${
                value[`netmask-${key}`]
              }`,
            );
          }
          if (enabledIpSet && value[`gateway-${key}`]) {
            systemTags.push(
              `ipv4Gateway::${value[`l3NetworkUuids-${key}`]?.[0]?.uuid}::${
                value[`gateway-${key}`]
              }`,
            );
          }
          generateArrayPayload("setVmStaticIpPayload", {
            vmNicUuid: nicUuid,
            vmInstanceUuid,
            l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
            ip: value[`ipv4-${key}`],
            systemTags,
          });
        }
      }

      if (
        updateKeys.some((_key) =>
          ["securityGroup", "ingressPolicy", "egressPolicy"].includes(
            _key.split("-")[0],
          ),
        )
      ) {
        generateArrayPayload("setVmNicSecurityGroupInEditPayload", {
          vmNicUuid: nicUuid,
          l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
          securityGroupRefs: value[`securityGroup-${key}`].map(
            (it: any, i: number) => ({
              securityGroupUuid: it.uuid,
              priority: i + 1,
              attachedL3NetworkUuids: it.attachedL3NetworkUuids,
            }),
          ),
          ingressPolicy: value[`ingressPolicy-${key}`],
          egressPolicy: value[`egressPolicy-${key}`],
        });
      }

      updateKeys.forEach((_key) => {
        switch (_key.split("-")[0]) {
          case "customMac":
            generateArrayPayload("updateVmNicMacPayload", {
              vmNicUuid: nicUuid,
              mac: value[`customMac-${key}`],
            });
            break;
          case "nicType":
            generateArrayPayload("updateVmNicDriverPayload", {
              vmInstanceUuid,
              vmNicUuid: nicUuid,
              driverType: value[`nicType-${key}`],
            });
            break;
          case "netCardState":
            generateArrayPayload("changeVmNicStatePayload", {
              vmNicUuid: nicUuid,
              state: value[`netCardState-${key}`] ? "enable" : "disable",
            });
            break;
          case "nicMultiQueueNum":
            generateArrayPayload("updateResourceConfigActionParams", {
              name: "nicMultiQueueNum",
              category: "vm",
              resourceUuid: nicUuid,
              value: value[_key],
            });
            break;
          case "nicDevice":
            generateArrayPayload("changeVmNicNetworkPayload", {
              vmNicUuid: nicUuid,
              destL3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
              vmNicParams: JSON.stringify({
                l3NetworkUuid: value[`l3NetworkUuids-${key}`]?.[0]?.uuid,
                vfParentUuid: value[`nicDevice-${key}`]?.[0]?.uuid,
                driverType: value[`nicType-${key}`],
              }),
            });
            break;
        }
      });
    });
    setPayload(payload);
  };

  const cdromTransform = (
    newValues: any,
    originValues: any,
    vmInstanceUuid: string,
  ) => {
    const list = _.groupBy(_.keys(newValues), (key) => key.split("-")[1]);
    const originCdromList = _.groupBy(
      _.keys(originValues),
      (key) => key.split("-")[1],
    );

    const addList = _.difference(_.keys(list), _.keys(originCdromList));
    const removeList = _.keys(originCdromList).filter(
      (key) =>
        originValues?.[`removecdrom-${key}`] &&
        originValues?.[`cdRomListUuid-${key}`],
    );
    const updateList = _.keys(originCdromList).filter(
      (key) => removeList.indexOf(key) === -1,
    );

    addList.forEach((key) => {
      const value = _.pick(newValues, list[key]);
      if (value[`cdRomList-${key}`]?.[0]?.uuid) {
        setChangeKeys((origin) => origin.concat(key));

        payload.createVmCdRomPayload = (
          payload.createVmCdRomPayload ?? []
        ).concat([
          {
            name: `cdrom-create-for-vm-${vmInstanceUuid}-${key}`,
            vmInstanceUuid,
            isoUuid: value[`cdRomList-${key}`]?.[0]?.uuid,
          },
        ]);
      }
    });

    removeList.forEach((key) => {
      setChangeKeys((origin) => origin.concat(key));
      const value = _.pick(originValues, originCdromList[key]);
      payload.deleteCdRomPayload = (payload.deleteCdRomPayload ?? []).concat([
        {
          uuid: value[`cdRomListUuid-${key}`],
        },
      ]);
    });

    updateList.forEach((key) => {
      const value = _.pick(newValues, list[key]);
      const originValue = _.pick(originValues, originCdromList[key]);
      const updateKeys: string[] = [];
      _.keys(value).forEach((_key) => {
        if (!_.isEqual(value[_key], originValue[_key])) {
          updateKeys.push(_key);
        }
      });

      updateKeys.forEach((_key) => {
        switch (_key.split("-")[0]) {
          case "cdRomList":
            if (value[`cdRomList-${key}`]?.[0]?.uuid) {
              generateArrayPayload("attachIsoToVmInstancePayload", {
                vmInstanceUuid,
                isoUuid: value[`cdRomList-${key}`]?.[0]?.uuid,
              });
              if (originValue[`cdRomList-${key}`]?.[0]?.uuid) {
                generateArrayPayload("detachIsoFromVmInstancePayload", {
                  vmInstanceUuid,
                  isoUuid: originValue[`cdRomList-${key}`]?.[0]?.uuid,
                });
              }
            } else {
              generateArrayPayload("detachIsoFromVmInstancePayload", {
                vmInstanceUuid,
                isoUuid: originValue[`cdRomList-${key}`]?.[0]?.uuid,
              });
            }
            break;
        }
      });
    });
    setPayload(payload);
  };

  const usbTransform = (
    newValues: any,
    originValues: any,
    vmInstanceUuid: string,
  ) => {
    const list = _.groupBy(_.keys(newValues), (key) => key.split("-")[1]);
    const originList = _.groupBy(
      _.keys(originValues),
      (key) => key.split("-")[1],
    );

    const addList = _.difference(_.keys(list), _.keys(originList));
    const removeList = _.keys(originList).filter(
      (key) =>
        originValues?.[`removeusb-${key}`] &&
        originValues?.[`usbDiviceUuid-${key}`],
    );
    const updateList = _.keys(originList).filter(
      (key) => removeList.indexOf(key) === -1,
    );
    addList.forEach((key) => {
      const value = _.pick(newValues, list[key]);

      if (value[`usbDivice-${key}`]?.[0]?.uuid) {
        setChangeKeys((origin) => origin.concat(key));

        payload.attachUsbDeviceToVmPayload = (
          payload.attachUsbDeviceToVmPayload ?? []
        ).concat([
          {
            attachType: value[`usbDiviceType-${key}`],
            vmInstanceUuid,
            usbDeviceUuid: value[`usbDivice-${key}`]?.[0]?.uuid,
          },
        ]);
      }
    });

    removeList.forEach((key) => {
      setChangeKeys((origin) => origin.concat(key));
      const value = _.pick(originValues, originList[key]);
      payload.detachUsbDeviceToVmPayload = (
        payload.detachUsbDeviceToVmPayload ?? []
      ).concat([
        {
          usbDeviceUuid: value[`usbDivice-${key}`]?.[0]?.uuid,
        },
      ]);
    });

    updateList.forEach((key) => {
      const value = _.pick(originValues, originList[key]);
      const newValue = _.pick(newValues, list[key]);
      if (
        value[`usbDivice-${key}`]?.[0]?.uuid !==
        newValue[`usbDivice-${key}`]?.[0]?.uuid
      ) {
        payload.detachUsbDeviceToVmPayload = (
          payload.detachUsbDeviceToVmPayload ?? []
        ).concat([
          {
            usbDeviceUuid: value[`usbDivice-${key}`]?.[0]?.uuid,
          },
        ]);

        if (newValue[`usbDivice-${key}`]?.[0]?.uuid) {
          payload.attachUsbDeviceToVmPayload = (
            payload.attachUsbDeviceToVmPayload ?? []
          ).concat([
            {
              attachType: newValue[`usbDiviceType-${key}`],
              vmInstanceUuid,
              usbDeviceUuid: newValue[`usbDivice-${key}`]?.[0]?.uuid,
            },
          ]);
        }
      }
    });
    setPayload(payload);
  };

  const gpuTransform = (
    newValues: any,
    originValues: any,
    vmInstanceUuid: string,
  ) => {
    const list = _.groupBy(_.keys(newValues), (key) => key.split("-")[1]);
    const originList = _.groupBy(
      _.keys(originValues),
      (key) => key.split("-")[1],
    );

    const addList = _.difference(_.keys(list), _.keys(originList));
    const removeList = _.keys(originList).filter(
      (key) =>
        originValues?.[`removegpu-${key}`] &&
        originValues?.[`gpuDeviceUuid-${key}`],
    );
    const updateList = _.keys(originList).filter(
      (key) => removeList.indexOf(key) === -1,
    );

    addList.forEach((key) => {
      const value = _.pick(newValues, list[key]);
      if (value[`gpuDevice-${key}`]?.[0]?.uuid) {
        setChangeKeys((origin) => origin.concat(key));
        if (value[`gpuDeviceType-${key}`] === "gpu") {
          payload.attachPciDeviceToVMPayloads = (
            payload.attachPciDeviceToVMPayloads ?? []
          ).concat([
            {
              pciDeviceUuid: value[`gpuDevice-${key}`]?.[0]?.uuid,
              vmInstanceUuid,
            },
          ]);
        } else {
          payload.attachVGpuToVmInstancePayloads = (
            payload.attachVGpuToVmInstancePayloads ?? []
          ).concat([
            {
              vGpuDeviceUuid: value[`gpuDevice-${key}`]?.[0]?.uuid,
              vmInstanceUuid,
              type:
                value[`gpuDevice-${key}`]?.[0]?.type === "MdevDevice"
                  ? VGpuType.MdevDevice
                  : VGpuType.PciDevice,
            },
          ]);
        }
      }
    });

    removeList.forEach((key) => {
      setChangeKeys((origin) => origin.concat(key));
      const value = _.pick(originValues, originList[key]);

      if (value[`gpuDeviceType-${key}`] === "gpu") {
        payload.detachPciDeviceFromVMPayloads = (
          payload.detachPciDeviceFromVMPayloads ?? []
        ).concat([
          {
            pciDeviceUuid: value[`gpuDeviceUuid-${key}`],
            vmInstanceUuid,
          },
        ]);
      } else {
        payload.detachVGpuFromVmInstancePayloads = (
          payload.detachVGpuFromVmInstancePayloads ?? []
        ).concat([
          {
            vGpuDeviceUuid: value[`gpuDeviceUuid-${key}`],
            vmInstanceUuid,
            type:
              value[`gpuDevice-${key}`]?.[0]?.type === "MdevDevice"
                ? VGpuType.MdevDevice
                : VGpuType.PciDevice,
          },
        ]);
      }
    });

    updateList.forEach((key) => {
      const value = _.pick(originValues, originList[key]);
      const newValue = _.pick(newValues, list[key]);

      if (
        value[`gpuDeviceUuid-${key}`] !==
        newValue[`gpuDevice-${key}`]?.[0]?.uuid
      ) {
        if (value[`gpuDeviceType-${key}`] === "gpu") {
          payload.detachPciDeviceFromVMPayloads = (
            payload.detachPciDeviceFromVMPayloads ?? []
          ).concat([
            {
              pciDeviceUuid: value[`gpuDeviceUuid-${key}`],
              vmInstanceUuid,
            },
          ]);
        } else {
          payload.detachVGpuFromVmInstancePayloads = (
            payload.detachVGpuFromVmInstancePayloads ?? []
          ).concat([
            {
              vGpuDeviceUuid: value[`gpuDeviceUuid-${key}`],
              vmInstanceUuid,
              type:
                value[`gpuDevice-${key}`]?.[0]?.type === "MdevDevice"
                  ? VGpuType.MdevDevice
                  : VGpuType.PciDevice,
            },
          ]);
        }

        if (
          newValue[`gpuDeviceType-${key}`] === "gpu" &&
          newValue[`gpuDevice-${key}`]?.length
        ) {
          payload.attachPciDeviceToVMPayloads = (
            payload.attachPciDeviceToVMPayloads ?? []
          ).concat([
            {
              pciDeviceUuid: newValue[`gpuDevice-${key}`]?.[0]?.uuid,
              vmInstanceUuid,
            },
          ]);
        } else if (newValue[`gpuDevice-${key}`]?.length) {
          payload.attachVGpuToVmInstancePayloads = (
            payload.attachVGpuToVmInstancePayloads ?? []
          ).concat([
            {
              vGpuDeviceUuid: newValue[`gpuDevice-${key}`]?.[0]?.uuid,
              vmInstanceUuid,
              type:
                newValue[`gpuDevice-${key}`]?.[0]?.type === "MdevDevice"
                  ? VGpuType.MdevDevice
                  : VGpuType.PciDevice,
            },
          ]);
        }
      }
    });
    setPayload(payload);
  };

  const updateKey2Payload: { [key: string]: any } = {
    name: commonTransform("name", "updateVmInstancePayload"),
    guest: commonTransform("platform", "updateVmInstancePayload"),
    group: groupTransform("group", "addResourcesToDirectoryPayload"),
    ha: commonTransform(
      "level",
      "setVmHaLevelPayload",
      "uuid",
      (value: boolean) => (value ? "NeverStop" : "None"),
    ),
    os: commonTransform("guestOsType", "updateVmInstancePayload"),
    // cpu
    totalCoreNum: commonTransform("cpuNum", "updateVmInstancePayload"),
    sockedNum: cpuSocketsTransform,
    CPUMode: resourceConfigTransform("vm.cpuMode", "kvm"),
    vmPriority: resourceLeveTransform,
    hotPlug: resourceConfigTransform("numa", "vm"),
    cpuHideKVMMark: resourceConfigTransform("vm.cpu.hypervisor.feature", "kvm"),

    // memory
    memorySize: commonTransform(
      "memorySize",
      "updateVmInstancePayload",
      "uuid",
      (value: any) => parseNumber(value.number, value.unit),
    ),
    memHotPlug: resourceConfigTransform("hotPlugMemory", "vm"),
    cpuBindListByVCpu: systemTagTransform(
      "vmCpuPinning",
      (value: any) =>
        `vmCpuPinning::${`${value
          .map((item: any) => `${item.vCPU}:${item.pCPUList.join(",")}`)
          .join(";")};`}`,
    ),
    // other
    gpuType: resourceConfigTransform("videoType", "vm"),
    soundCard: resourceConfigTransform("soundType", "vm"),
    totalGPUMemory: commonTransform(
      "vram",
      "setVmQxlMemoryPayload",
      "uuid",
      (value: any) => value * 1024,
    ),
  };

  const getNeedRebootKey = (origianValues: any, values: any) => {
    const _changeKeys = _.keys(origianValues)
      .filter(
        (key: string) =>
          !_.isUndefined(values[key]) &&
          !_.isEqual(origianValues[key], values[key]),
      )
      .concat(changeKeys);
    setChangeKeys(_changeKeys);
    let keys = [
      {
        key: "hotPlug",
        label: intl.formatMessage({
          id: "virtualization.create.instance.cpu.hot.plug",
          defaultMessage: "CPU Hot Plug",
        }),
        type: "cpu",
      },
      {
        key: "CPUMode",
        label: intl.formatMessage({
          id: "virtualization.create.instance.cpu.mode",
          defaultMessage: "CPU Mode",
        }),
        type: "cpu",
      },
      {
        key: "cpuBindListByVCpu",
        label: intl.formatMessage({
          id: "virtualization.create.instance.cpu.bind.physics.cpu",
          defaultMessage: "Bind Physical CPU",
        }),
        type: "cpu",
      },
      {
        key: "nicMultiQueueNum-",
        label: intl.formatMessage({
          id: "virtualization.create.instance.hardware.network.card.nicMultiQueueNum",
          defaultMessage: "NIC Queue Number",
        }),
        type: "netcard",
      },
      {
        key: "nicType-",
        label: intl.formatMessage({
          id: "virtualization.create.instance.hardware.network.card.netcard.type",
          defaultMessage: "NIC Model",
        }),
        type: "netcard",
      },
      {
        key: "busType-",
        label: intl.formatMessage({
          id: "virtualization.create.instance.hardware.disk.busType",
          defaultMessage: "Bus Type",
        }),
        type: "disk",
      },
      {
        key: "gpuType",
        label: intl.formatMessage({
          id: "virtualization.create.instance.other.gpu.type",
          defaultMessage: "Graphics Card Type",
        }),
        type: "other",
      },
      {
        key: "totalGPUMemory",
        label: intl.formatMessage({
          id: "virtualization.create.instance.other.total.gpuMemory",
          defaultMessage: "Total Graphics Memory",
        }),
        type: "other",
      },
    ];
    if (!values.hotPlug) {
      keys = keys.concat([
        {
          key: "totalCoreNum",
          label: intl.formatMessage({
            id: "virtualization.create.instance.cpu.core.num",
            defaultMessage: "Cores",
          }),
          type: "cpu",
        },
        {
          key: "sockedNum",
          label: intl.formatMessage({
            id: "virtualization.create.instance.cpu.socket.num",
            defaultMessage: "Cores per Socket",
          }),
          type: "cpu",
        },
      ]);
    }
    if (!values.memHotPlug) {
      keys.push({
        key: "memHotPlug",
        label: intl.formatMessage({
          id: "virtualization.create.instance.memory.hot.plug",
          defaultMessage: "Memory Hot Plug",
        }),
        type: "memory",
      });
    }

    const needRebootKeys: any[] = [];
    _changeKeys.forEach((key) => {
      const keyConfig = keys.find((item) => key.indexOf(item.key) === 0);
      if (keyConfig) {
        needRebootKeys.push({
          changeKey: key,
          ...keyConfig,
        });
      }
    });
    keys.filter(
      (item) =>
        _changeKeys.findIndex((_key) => _key.indexOf(item.key) === 0) > -1,
    );

    const typeList = [
      {
        key: "cpu",
        label: "CPU",
      },
      {
        key: "memory",
        label: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
      },
      {
        key: "disk",
        label: intl.formatMessage({ id: "hard.disk", defaultMessage: "Disk" }),
      },
      {
        key: "netcard",
        label: intl.formatMessage({ id: "netcard", defaultMessage: "NIC" }),
      },
      {
        key: "other",
        label: intl.formatMessage({
          id: "virtualization.other.hardware",
          defaultMessage: "Other",
        }),
      },
    ];
    const needRebootKeysGroup = _.groupBy(needRebootKeys, "type");

    typeList.forEach((typeItem) => {
      if (needRebootKeysGroup?.[typeItem.key]?.length) {
        if (typeItem.key === "disk") {
          const goups = _.groupBy(
            needRebootKeysGroup?.[typeItem.key],
            (rebootItem) => rebootItem?.changeKey?.split("-")?.[1],
          );
          const listss = _.keys(goups).map((indexKey) => ({
            label: `${typeItem.label}-${indexKey}`,
            value: goups[indexKey].map((item) => item.label),
          }));
          setConfirmList((origin) => origin.concat(listss));
        } else {
          setConfirmList((origin) =>
            origin.concat([
              {
                label: typeItem.label,
                value: needRebootKeysGroup?.[typeItem.key].map(
                  (item) => item.label,
                ),
              },
            ]),
          );
        }
      }
    });

    return { needRebootKeys };
  };

  const resetConfig = () => {
    setChangeKeys([]);
    setConfirmList([]);
    setPayload({
      resourceUuid: vm?.uuid,
    });
  };

  //禁用项
  const getDisabledConfig = (vm: IVM, resourceConfig: any) => {
    return {
      tooltip:
        vm?.state === "Running"
          ? intl.formatMessage({
              id: "disable.vm.edit.action.with.running",
              defaultMessage:
                "Cannot modify this setting when the VM is running. Power off the VM and try again.",
            })
          : undefined,
      disabled: vm?.state === "Running",
      cpuNumDisabled:
        vm?.state === "Running" && resourceConfig?.numa?.value !== "true",
      memoryDisabled:
        vm?.state === "Running" && resourceConfig?.numa?.value !== "true",
      pciDeviceDisabled:
        vm?.state === "Running" &&
        resourceConfig?.hotPlugEnabled?.value !== "true",
    };
  };

  return {
    vmData: vm,
    changeKeys,
    resetConfig,
    confirmList,
    getNeedRebootKey,
    updateKey2Payload,
    payload,
    volumeTransform,
    nicTransform,
    cdromTransform,
    usbTransform,
    gpuTransform,
    getDisabledConfig,
  };
};
