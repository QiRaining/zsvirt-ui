import { gql, useQuery } from "@apollo/client";
import HardwareItem from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/hardware-Item";
import { IHardwareType } from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/hardware-Item/utils";
import OtherCard from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/other";
import type { FormCreateType, VmInstanceState } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  Volume as IVolume,
} from "@zstack/zsphere-types/graphql";
import { formatStorageToObj } from "@zstack/zsphere-utils";
import { Menu, Tabs } from "antd";
import _ from "lodash-es";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";
import { SetDiskQosType } from "zsv_resource_shared/vm/disk/shared-disk-utils";

import CPUCard from "./cpu";
import DiskCard from "./disk";
import { useQueryReleatedResource } from "./hooks";
import MemoryCard from "./memory";
import type { IRemoveIVolume } from "./removeVolumeModal";
import {
  DeleteDataVolumeModal,
  DetachDataVolumeModal,
} from "./removeVolumeModal";

import styles from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  source: IVM;
  setOriginConfig: (val: any) => void;
}
const { _Item } = Menu;

interface HardwareItem {
  label: (index?: number) => React.ReactElement;
  type: string;
  children: React.ReactElement;
  key: string;
  closable?: boolean;
  remove?: "Detach" | "Delete";
}

const HardwareInfo: React.FC<IProps> = ({ setOriginConfig, form, source }) => {
  const intl = useIntl();
  const [volumeModalVisibel, setVolumeModalVisibel] = useState(false);
  const [detachVolumeModalVisibel, setDetachVolumeModalVisibel] =
    useState(false);
  const [deleteVolumeList, _setDeleteVolumeList] = useState<IRemoveIVolume[]>(
    [],
  );

  const [activeKey, setActiveKey] = useState("cpu-0"); //tab激活

  const [volumeItemList, setVolumeItemList] = useState<HardwareItem[]>([]);
  // const [nicItemList, setNicItemList] = useState<HardwareItem[]>([])
  // const [cdromItemList, setCdromItemList] = useState<HardwareItem[]>([])
  // const [usbItemList, setUsbItemList] = useState<HardwareItem[]>([])
  // const [gpuItemList, setGpuItemList] = useState<HardwareItem[]>([])
  const [_resourceNum, setResourceNum] = useState<any>({});

  const [removeItemKey, setRemoveItemKey] = useState<string>("");
  const relatedData = useQueryReleatedResource(source?.uuid);

  useEffect(() => {
    if (relatedData) {
      setResourceNum({
        [IHardwareType.Disk]: relatedData?.volumeList?.length,
        // [IHardwareType.Netcard]: relatedData?.nicList?.length,
        // [IHardwareType.USB]: relatedData?.usbList?.length,
        // [IHardwareType.Cdrom]: relatedData?.cdromList?.length,
        // [IHardwareType.GPU]: relatedData?.gpuList?.length
      });
    }
  }, [relatedData]);

  const getListByType = (type: IHardwareType) => {
    const typeToList: any = {
      [IHardwareType.Disk]: [volumeItemList, setVolumeItemList],
      // [IHardwareType.Netcard]: [nicItemList, setNicItemList],
      // [IHardwareType.USB]: [usbItemList, setUsbItemList],
      // [IHardwareType.Cdrom]: [cdromItemList, setCdromItemList],
      // [IHardwareType.GPU]: [gpuItemList, setGpuItemList]
    };
    return typeToList?.[type];
  };

  const GLOBAL_CONFIG = gql`
    query globalConfig($category: String!, $name: String!) {
      globalConfig(category: $category, name: $name) {
        category
        defaultValue
        description
        name
        value
        uuid
      }
    }
  `;

  const { data: deletionPolicyData, loading: deletionPolicyLoading } = useQuery(
    GLOBAL_CONFIG,
    {
      variables: {
        category: "volume",
        name: "deletionPolicy",
      },
    },
  );

  const isDelay = useMemo(() => {
    if (deletionPolicyLoading) {
      return true;
    }
    return deletionPolicyData?.globalConfig?.value !== "Direct";
  }, [deletionPolicyData, deletionPolicyLoading]);

  //硬件列表
  const initialItems: HardwareItem[] = [
    {
      label: () => (
        <HardwareItem
          showErrorBackground
          type={IHardwareType.CPU}
          form={form}
          updateFieldName="totalCoreNum"
          flagKey="cpu-0"
        />
      ),
      type: "cpu",
      children: <CPUCard form={form} source={source} editFormResource={true} />,
      key: "cpu-0",
      closable: true,
    },
    {
      label: () => (
        <HardwareItem
          showErrorBackground
          type={IHardwareType.Memory}
          form={form}
          flagKey="memory-0"
          updateFieldName="memorySize"
        />
      ),
      children: <MemoryCard form={form} editFormResource={true} />,
      type: "memory",
      key: "memory-0",
      closable: false,
    },
  ];

  const _otherDeviceItems: HardwareItem[] = [
    {
      label: () => (
        <HardwareItem
          type={IHardwareType.Other}
          form={form}
          flagKey="ohter-0"
          updateFieldName=""
        />
      ),
      children: <OtherCard form={form} source={source} />,
      type: "other",
      key: "other-0",
      closable: false,
    },
  ];

  const removeHardwareList = (
    type: IHardwareType,
    key: string,
    policy: "Detach" | "Delete" = "Detach",
  ) => {
    const [itemList, setItemList] = getListByType(type);
    itemList.find((it: HardwareItem) => it.key === key)!.remove = policy;
    setOriginConfig((origin: any) => {
      origin[`remove${key}`] = policy;
      return origin;
    });

    setItemList(itemList);
    switch (type) {
      case "netcard": // 做删除撤销时，这里需要重新设计实现
        form.setFields([
          { name: `l3NetworkUuids-${key.split("-")[1]}`, value: [] },
        ]);
        break;
    }
    setActiveKey("cpu-0");
  };

  const getVolumeBandWidthValue = (type: string, volume: IVolume) => {
    const bandWidth: any = volume?.bandwidth;
    const keys = [
      "iopsRead",
      "iopsTotal",
      "iopsWrite",
      "volumeBandwidth",
      "volumeBandwidthRead",
      "volumeBandwidthReadUpthreshold",
      "volumeBandwidthUpthreshold",
      "volumeBandwidthWrite",
    ];
    if (type === "turnOnQoS") {
      return !keys.map((key) => bandWidth[key]).every((it) => it === -1);
    }
    if (type === "bandwidthMode") {
      return (bandWidth?.volumeBandwidthRead ?? -1) > -1 ||
        (bandWidth?.volumeBandwidthWrite ?? -1) > -1
        ? SetDiskQosType.SetBandwidthWR
        : SetDiskQosType.SetBandwidthTotal;
    }
    if (type === "iopsMode") {
      return (bandWidth?.iopsWrite ?? -1) > -1 ||
        (bandWidth?.iopsRead ?? -1) > -1
        ? SetDiskQosType.SetIopsWR
        : SetDiskQosType.SetIopsTotal;
    }
  };

  const _getEditVolumeTooltip = (
    _index: number,
    state?: VmInstanceState,
    volume?: IVolume,
  ) => {
    if (_index === 0 && state === "Running") {
      return intl.formatMessage({
        id: "edit.vm.remove.root.volume",
        defaultMessage: "To perform Detach Disk or Move to Recycle Bin operations on Disk 1 (system disk), make sure the VM is powered off.",
      });
    }
    //有快照
    if (volume?.isHaveSnapshot) {
      return isDelay
        ? intl.formatMessage({
            id: "edit.vm.remove.have.snapshot.volume.tip",
            defaultMessage: "The current disk has a snapshot and cannot be moved to the recycle bin.",
          })
        : intl.formatMessage({
            id: "edit.vm.delete.have.snapshot.volume.tooltip",
            defaultMessage: "The current disk has a snapshot and cannot be deleted.",
          });
    }
    return "";
  };

  useEffect(() => {
    if (relatedData) {
      const { volumeList, nicList, gpuList, usbList, cdromList } = relatedData;
      setVolumeItemList(
        volumeList.map((volume: any, index: number) => ({
          label: (_index?: number) => (
            <HardwareItem
              showErrorBackground
              type={IHardwareType.Disk}
              flagKey={`disk-${_index}`}
              form={form}
              updateFieldName={`diskSize-${index}`}
              //暂时禁止卸载
              // actions={[
              //   {
              //     label: (
              //       <Tooltip title={getEditVolumeTooltip(index, source?.state)}>
              //         {intl.formatMessage({ id: 'detach.disk', defaultMessage: '卸载硬盘' })}
              //       </Tooltip>
              //     ),
              //     onClick: () => {
              //       setDeleteVolumeList([
              //         { ...volume, removeKey: `${IHardwareType.Disk}-${index}-Detach` }
              //       ])
              //       setDetachVolumeModalVisibel(true)
              //     },
              //     disabled: _index === 0 && source.state === 'Running',
              //     key: 'detach'
              //   },
              //   volume.diskType === 'rdm'
              //     ? undefined
              //     : {
              //         label: (
              //           <Tooltip title={getEditVolumeTooltip(index, source?.state, volume)}>
              //             {isDelay
              //               ? intl.formatMessage({
              //                   id: 'move.to.recycle.bin',
              //                   defaultMessage: '移至回收站'
              //                 })
              //               : intl.formatMessage({ id: 'delete.disk', defaultMessage: '删除硬盘' })}
              //           </Tooltip>
              //         ),
              //         onClick: () => {
              //           setDeleteVolumeList([
              //             { ...volume, removeKey: `${IHardwareType.Disk}-${index}-Delete` }
              //           ])
              //           setVolumeModalVisibel(true)
              //         },
              //         key: 'delete',
              //         disabled:
              //           (_index === 0 && source.state === 'Running') || volume.isHaveSnapshot
              //       }
              // ]}
            />
          ),
          children: (
            <DiskCard
              isEdit
              form={form}
              index={index}
              source={source}
              zoneUuid={source.zoneUuid}
              originValue={volume}
            />
          ),
          type: "disk",
          key: `disk-${index}`,
          closable: false,
        })),
      );

      // setNicItemList(
      //   nicList.map((nic: any, index: number) => ({
      //     label: (_index?: number) => (
      //       <HardwareItem
      //         showErrorBackground
      //         type={IHardwareType.Netcard}
      //         form={form}
      //         flagKey={`netcard-${_index}`}
      //         updateFieldName={`l3NetworkUuids-${index}`}
      //         setRemoveItemKey={setRemoveItemKey}
      //       />
      //     ),
      //     children: (
      //       <NetCard
      //         isEdit
      //         source={source}
      //         form={form}
      //         index={index}
      //         zoneUuid={source.zoneUuid ?? -1}
      //         origin={nic}
      //       />
      //     ),
      //     type: 'netcard',
      //     key: `netcard-${index}`,
      //     closable: false
      //   }))
      // )

      // setCdromItemList(
      //   cdromList.map((cdrom, index: number) => ({
      //     label: (_index?: number) => (
      //       <HardwareItem
      //         showErrorBackground
      //         type={IHardwareType.Cdrom}
      //         form={form}
      //         flagKey={`cdrom-${index}`}
      //         updateFieldName={`cdRomList-${index}`}
      //         setRemoveItemKey={setRemoveItemKey}
      //       />
      //     ),
      //     children: <CdRomCard isEdit form={form} zoneUuid={source?.zoneUuid} index={index} />,
      //     type: 'cdrom',
      //     key: `cdrom-${index}`,
      //     closable: true
      //   }))
      // )

      // setUsbItemList(
      //   usbList.map((usb, index: number) => ({
      //     label: () => (
      //       <HardwareItem
      //         showErrorBackground
      //         type={IHardwareType.USB}
      //         form={form}
      //         flagKey={`usbDivice-${index}`}
      //         updateFieldName={`usbDivice-${index}`}
      //         setRemoveItemKey={setRemoveItemKey}
      //       />
      //     ),
      //     children: <USBCard form={form} index={index} zoneUuid={source.uuid} source={source} />,
      //     type: 'usbDivice',
      //     key: `usbDivice-${index}`,
      //     closable: true
      //   }))
      // )

      // setGpuItemList(
      //   gpuList.map((gpu, index: number) => ({
      //     label: (_index?: number) => (
      //       <HardwareItem
      //         showErrorBackground
      //         type={IHardwareType.GPU}
      //         form={form}
      //         flagKey={`gpu-${_index}`}
      //         updateFieldName={`gpuDevice-${index}`}
      //         actions={[
      //           {
      //             label: intl.formatMessage({ id: 'detach.gpu', defaultMessage: '卸载GPU' }),
      //             onClick: () => setRemoveItemKey(`${IHardwareType.GPU}-${index}`),
      //             key: 'detach'
      //           }
      //         ]}
      //       />
      //     ),
      //     children: <GPUCard isEdit form={form} index={index} originValue={gpu} source={source} />,
      //     type: 'gpu',
      //     key: `gpu-${index}`
      //   })) ?? []
      // )

      // setUsbItemList(
      //   usbList.map((usb, index: number) => ({
      //     label: () => (
      //       <HardwareItem
      //         showErrorBackground
      //         type={IHardwareType.USB}
      //         form={form}
      //         flagKey={`usb-${index}`}
      //         updateFieldName={`usbDivice-${index}`}
      //         actions={[
      //           {
      //             label: intl.formatMessage({ id: 'detach.usb', defaultMessage: '卸载USB' }),
      //             onClick: () => setRemoveItemKey(`${IHardwareType.USB}-${index}`),
      //             key: 'detach'
      //           }
      //         ]}
      //       />
      //     ),
      //     children: (
      //       <USBCard
      //         form={form}
      //         index={index}
      //         zoneUuid={source?.zoneUuid ?? -1}
      //         isEdit
      //         originValue={usb}
      //         source={source}
      //       />
      //     ),
      //     type: IHardwareType.USB,
      //     key: `usb-${index}`,
      //     closable: true
      //   }))
      // )

      let config: any = {};

      nicList.forEach((nic, index: number) => {
        config = {
          ...config,
          [`nicUuid-${index}`]: nic.uuid,
          [`netCardState-${index}`]: nic.state === "enable",
          [`l3NetworkUuids-${index}`]: [nic.l3Network],
          [`nicType-${index}`]: nic.driverType,
          [`nicDevice-${index}`]: [nic.physicalNic],
          [`customMac-${index}`]: nic.mac,
          [`ipv4-${index}`]: nic.ip,
          [`appointIp-${index}`]:
            !!nic.ip && !nic?.usedIps?.[0]?.l3Network?.enableIPAM,
          [`gateway-${index}`]: nic.usedIps?.[0]?.gateway,
          [`netmask-${index}`]: nic.usedIps?.[0]?.netmask,
          [`securityGroup-${index}`]: _.orderBy(
            _.compact(nic.securityGroup),
            "priority",
          ),
          [`ingressPolicy-${index}`]: nic.securityPolicy?.ingressPolicy,
          [`egressPolicy-${index}`]: nic.securityPolicy?.egressPolicy,
          [`netCardQosEnabled-${index}`]: !(
            (_.isNil(nic.nicBandWidth?.inboundBandwidth) ||
              nic.nicBandWidth?.inboundBandwidth === -1) &&
            (_.isNil(nic.nicBandWidth?.outboundBandwidth) ||
              nic.nicBandWidth?.outboundBandwidth === -1)
          ),
          [`outboundBandwidth-${index}`]:
            _.isNil(nic.nicBandWidth?.outboundBandwidth) ||
            nic.nicBandWidth?.outboundBandwidth === -1
              ? { number: undefined, unit: "Mbps" }
              : formatStorageToObj(
                  nic.nicBandWidth.outboundBandwidth,
                  0,
                  "bps",
                ),
          [`inboundBandwidth-${index}`]:
            _.isNil(nic.nicBandWidth?.inboundBandwidth) ||
            nic.nicBandWidth?.inboundBandwidth === -1
              ? { number: undefined, unit: "Mbps" }
              : formatStorageToObj(nic.nicBandWidth.inboundBandwidth, 0, "bps"),
          [`nicMultiQueueNum-${index}`]: nic?.resourceConfig?.nicMultiQueueNum
            ? nic?.resourceConfig?.nicMultiQueueNum.toString()
            : undefined,
        };
      });

      volumeList?.forEach((volume, index) => {
        if (volume.diskType === "volume") {
          let busType;
          if (volume.type === "Root") {
            busType =
              volume?.systemTag?.capability ??
              (source?.systemTag?.vmDriver ? "virtio" : "ide");
          } else {
            busType = volume?.systemTag?.capability ?? "virtio";
          }

          config = {
            ...config,
            [`diskUuid-${index}`]: volume.uuid,
            [`diskCreateType-${index}`]: volume.rootImage ? "image" : "new",
            [`storePath-${index}`]: volume.primaryStorage
              ? [volume.primaryStorage]
              : [],
            [`diskSize-${index}`]: formatStorageToObj(volume.size, 2),
            [`turnOnQoS-${index}`]: getVolumeBandWidthValue(
              "turnOnQoS",
              volume,
            ),
            [`bandwidthMode-${index}`]: getVolumeBandWidthValue(
              "bandwidthMode",
              volume,
            ),
            [`totalBandwidth-${index}`]:
              (volume?.bandwidth?.volumeBandwidth ?? -1) > -1
                ? formatStorageToObj(
                    volume.bandwidth?.volumeBandwidth ?? -1,
                    0,
                    "B/s",
                  )
                : { number: undefined, unit: "MB/s" },
            [`writeBandwidth-${index}`]:
              (volume?.bandwidth?.volumeBandwidthWrite ?? -1) > -1
                ? formatStorageToObj(
                    volume.bandwidth?.volumeBandwidthWrite ?? -1,
                    0,
                    "B/s",
                  )
                : { number: undefined, unit: "MB/s" },
            [`readBandwidth-${index}`]:
              (volume?.bandwidth?.volumeBandwidthRead ?? -1) > -1
                ? formatStorageToObj(
                    volume.bandwidth?.volumeBandwidthRead ?? -1,
                    0,
                    "B/s",
                  )
                : { number: undefined, unit: "MB/s" },
            [`iopsMode-${index}`]: getVolumeBandWidthValue("iopsMode", volume),
            [`iopsTotal-${index}`]:
              volume?.bandwidth?.iopsTotal === -1
                ? undefined
                : volume?.bandwidth?.iopsTotal,
            [`iopsRead-${index}`]:
              volume?.bandwidth?.iopsRead === -1
                ? undefined
                : volume?.bandwidth?.iopsRead,
            [`iopsWrite-${index}`]:
              volume?.bandwidth?.iopsWrite === -1
                ? undefined
                : volume?.bandwidth?.iopsWrite,
            [`busType-${index}`]: busType,
            [`volumeStoragePool-${index}`]: volume?.systemTag?.cephStoragePool,
            [`allocationType-${index}`]:
              volume?.systemTag?.VolumeProvisioningStrategy,
            [`cacheMode-${index}`]: volume?.resourceConfig?.vmcacheMode,
            [`aio-${index}`]: volume?.resourceConfig?.aionative === "true",
            [`diskSharable-${index}`]: volume?.isShareable,
            [`diskImage-${index}`]: volume.rootImage ? [volume.rootImage] : [],
          };
        } else {
          config = {
            ...config,
            [`diskCreateType-${index}`]: "rdm",
            [`diskUuid-${index}`]: volume.uuid,
            [`RDM-${index}`]: [volume],
          };
        }
      });

      cdromList?.forEach((cdrom, index) => {
        config = {
          ...config,
          [`cdRomListUuid-${index}`]: cdrom.uuid,
          [`cdRomList-${index}`]: cdrom?.isoUuid
            ? [{ uuid: cdrom.isoUuid, name: cdrom.isoName }]
            : [],
        };
      });

      usbList?.forEach((usb, index) => {
        config = {
          ...config,
          [`usbDiviceType-${index}`]: usb.attachType,
          [`usbDiviceUuid-${index}`]: usb.uuid,
          [`usbDivice-${index}`]: [usb],
        };
      });

      gpuList?.forEach((gpu, index) => {
        config = {
          ...config,
          [`gpuDeviceUuid-${index}`]: gpu.uuid,
          [`gpuDiviceType-${index}`]: gpu.parentUuid ? "vgpu" : "gpu",
          [`gpuDevice-${index}`]: [gpu],
        };
      });

      setOriginConfig((origin: any) => ({
        ...origin,
        ...config,
      }));

      setTimeout(() =>
        form.setFields(
          _.keys(config).map((key: string) => ({
            name: key,
            value: config[key],
          })),
        ),
      );
    }
  }, [relatedData]);

  useEffect(() => {
    if (removeItemKey) {
      const [type, index, policy] = removeItemKey.split("-");
      removeHardwareList(
        type as IHardwareType,
        `${type}-${index}`,
        (policy as any) ?? "Delete",
      );
    }
  }, [removeItemKey]);

  //现有资源
  //最多资源
  // const getHardwareMenu = useCallback(
  //   (hasVgpuDevice: boolean) => {
  //     return (
  //       <Menu>
  //         <Item
  //           onClick={() => addHardwareItem(IHardwareType.Disk)}
  //           disabled={volumeItemList?.filter(item => !item.remove)?.length > 23}
  //         >
  //           {intl.formatMessage(
  //             {
  //               id: 'virtualization.hardware.to.be.selected.item.name.disk',
  //               defaultMessage: '硬盘 ({diskNum}/24)'
  //             },
  //             {
  //               diskNum: volumeItemList?.filter(item => !item.remove)?.length
  //             }
  //           )}
  //         </Item>
  //         <Item onClick={() => addHardwareItem(IHardwareType.Netcard)}>
  //           {intl.formatMessage({
  //             id: 'virtualization.hardware.to.be.selected.item.name.network.card',
  //             defaultMessage: '网卡'
  //           })}
  //         </Item>
  //         <Item
  //           onClick={() => addHardwareItem(IHardwareType.Cdrom)}
  //           disabled={
  //             cdromItemList?.filter(item => !item.remove)?.length > 2 || source.state !== 'Stopped'
  //           }
  //         >
  //           <Tooltip
  //             title={
  //               source.state !== 'Stopped'
  //                 ? intl.formatMessage({
  //                     id: 'disable.vm.edit.action.with.running',
  //                     defaultMessage: '不支持在运行时进行修改，请在停止状态下进行操作。'
  //                   })
  //                 : undefined
  //             }
  //           >
  //             {intl.formatMessage(
  //               {
  //                 id: 'virtualization.hardware.to.be.selected.item.name.cdRom',
  //                 defaultMessage: '光驱({cdRomNum}/3)'
  //               },
  //               {
  //                 cdRomNum: cdromItemList?.filter(item => !item.remove)?.length
  //               }
  //             )}
  //           </Tooltip>
  //         </Item>
  //         <Item onClick={() => addHardwareItem(IHardwareType.GPU)} disabled={hasVgpuDevice}>
  //           {intl.formatMessage({
  //             id: 'virtualization.hardware.to.be.selected.item.name.gpu',
  //             defaultMessage: 'GPU设备'
  //           })}
  //         </Item>
  //         <Item
  //           onClick={() => addHardwareItem(IHardwareType.USB)}
  //           disabled={usbItemList && usbItemList.filter(item => !item.remove).length > 0}
  //         >
  //           {intl.formatMessage(
  //             {
  //               id: 'virtualization.hardware.to.be.selected.item.name.usb',
  //               defaultMessage: 'USB设备({usbNum}/1)'
  //             },
  //             {
  //               usbNum: usbItemList?.filter(item => !item.remove).length
  //             }
  //           )}
  //         </Item>
  //       </Menu>
  //     )
  //   },
  //   [cdromItemList, volumeItemList, usbItemList, nicItemList, gpuItemList, source]
  // )

  // const addHardwareItem = (hardwareType: IHardwareType) => {
  //   const [itemList, setItemList] = getListByType(hardwareType) ?? []
  //   const addedNum = resourceNum[hardwareType]
  //   let childEle
  //   let updateFieldName: string = ''
  //   let initValue: any = {}

  //   if (hardwareType === IHardwareType.Cdrom) {
  //     childEle = <CdRomCard form={form} index={addedNum} zoneUuid={source?.zoneUuid} />
  //     updateFieldName = `cdRomList-${addedNum}`
  //   }

  //   if (hardwareType === IHardwareType.Netcard) {
  //     childEle = (
  //       <NetCard isEdit source={source} form={form} index={addedNum} zoneUuid={source.zoneUuid ?? -1} />
  //     )
  //     updateFieldName = `l3NetworkUuids-${addedNum}`

  //     const totalCoreNum = form.getFieldValue('totalCoreNum')
  //     //const runPath = form.getFieldValue('runPath')
  //     // let kvmAutoSetVmNicMultiqueue = false
  //     // if (runPath?.[0] && runPath?.[0]?.__typename) {
  //     //   if (runPath?.[0]?.__typename === 'HostVO') {
  //     //     kvmAutoSetVmNicMultiqueue =
  //     //       runPath?.[0]?.cluster?.resourceConfigValue?.kvmAutoSetVmNicMultiqueue !== 'false'
  //     //   }
  //     //   if (runPath?.[0]?.__typename === 'Cluster') {
  //     //     kvmAutoSetVmNicMultiqueue =
  //     //       runPath?.[0]?.resourceConfigValue?.kvmAutoSetVmNicMultiqueue !== 'false'
  //     //   }
  //     // }
  //     const multiInitNum = (totalCoreNum as number) < 12 ? String(totalCoreNum) : '12'

  //     initValue = {
  //       [`netCardState-${addedNum}`]: true,
  //       [`l3NetworkUuids-${addedNum}`]: [],
  //       [`nicType-${addedNum}`]: source?.guestOsType === 'Linux' ? 'virtio' : 'e1000',
  //       [`customMac-${addedNum}`]: undefined,
  //       [`staticIp-${addedNum}`]: undefined,
  //       [`securityGroup-${addedNum}`]: [],
  //       [`nicMultiQueueNum-${addedNum}`]: multiInitNum,
  //       [`netCardQosEnabled-${addedNum}`]: false,
  //       [`outboundBandwidth-${addedNum}`]: { number: undefined, unit: 'Mbps' },
  //       [`inboundBandwidth-${addedNum}`]: { number: undefined, unit: 'Mbps' }
  //     }
  //   }

  //   if (hardwareType === IHardwareType.Disk) {
  //     childEle = (
  //       <DiskCard isEdit form={form} zoneUuid={source.zoneUuid} index={addedNum} source={source} newCreate={true}/>
  //     )
  //     updateFieldName = `diskSize-${addedNum}`
  //     initValue = {
  //       [`diskCreateType-${addedNum}`]: 'new',
  //       [`diskSize-${addedNum}`]: { number: 40, unit: 'GB' },
  //       [`turnOnQoS-${addedNum}`]: false,
  //       [`bandwidthMode-${addedNum}`]: SetDiskQosType.SetBandwidthTotal,
  //       [`totalBandwidth-${addedNum}`]: { number: undefined, unit: 'MB' },
  //       [`writeBandwidth-${addedNum}`]: { number: undefined, unit: 'MB' },
  //       [`readBandwidth-${addedNum}`]: { number: undefined, unit: 'MB' },
  //       [`iopsMode-${addedNum}`]: SetDiskQosType.SetIopsTotal,
  //       [`iopsTotal-${addedNum}`]: undefined,
  //       [`iopsRead-${addedNum}`]: undefined,
  //       [`iopsWrite-${addedNum}`]: undefined,
  //       [`busType-${addedNum}`]: 'virtio',
  //       [`allocationType-${addedNum}`]: 'ThinProvisioning',
  //       [`cacheMode-${addedNum}`]: 'none',
  //       [`aio-${addedNum}`]: false,
  //       [`diskSharable-${addedNum}`]: false
  //     }
  //   }

  //   if (hardwareType === IHardwareType.USB) {
  //     childEle = (
  //       <USBCard form={form} index={addedNum} zoneUuid={source?.zoneUuid ?? -1} source={source} />
  //     )
  //     updateFieldName = `usbDivice-${addedNum}`
  //   }

  //   if (hardwareType === IHardwareType.GPU) {
  //     childEle = <GPUCard isEdit form={form} index={addedNum} source={source} />
  //     updateFieldName = `gpuDevice-${addedNum}`
  //   }

  //   setItemList(
  //     itemList.concat({
  //       label: (index?: number) => (
  //         <HardwareItem
  //           type={hardwareType}
  //           form={form}
  //           flagKey={`${hardwareType}-${index}`}
  //           updateFieldName={updateFieldName}
  //           setRemoveItemKey={() => setRemoveItemKey(`${hardwareType}-${addedNum}`)}
  //           showErrorBackground
  //         />
  //       ),
  //       children: childEle,
  //       type: `${hardwareType}-${addedNum}`,
  //       key: `${hardwareType}-${addedNum}`,
  //       closable: true
  //     })
  //   )

  //   setResourceNum({
  //     ...resourceNum,
  //     [hardwareType]: addedNum + 1
  //   })

  //   setTimeout(() =>
  //     form.setFields(_.keys(initValue).map((key: string) => ({ name: key, value: initValue[key] })))
  //   )
  // }

  const onChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
  };

  return (
    <>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.left}>
            <div className={styles.title}>
              {intl.formatMessage({
                id: "virtualization.hardware.item",
                defaultMessage: "Hardware",
              })}
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.title}>
              {intl.formatMessage({
                id: "virtualization.hardware.config",
                defaultMessage: "Hardware Configurations",
              })}
            </div>
          </div>
        </div>
        <Tabs
          hideAdd
          onChange={onChange}
          activeKey={activeKey}
          className={styles.tab}
          tabPosition="left"
        >
          {initialItems.map((t) => (
            <Tabs.TabPane
              className={styles["tabPane-hardware"]}
              tab={t.label()}
              key={t.key}
            >
              {t.children}
            </Tabs.TabPane>
          ))}

          {volumeItemList
            .filter((item) => !item.remove)
            .map((t, index) => (
              <Tabs.TabPane
                className={styles["tabPane-hardware"]}
                tab={t.label(index)}
                key={t.key}
              >
                {t.children}
              </Tabs.TabPane>
            ))}
        </Tabs>
      </div>
      <DeleteDataVolumeModal
        visible={volumeModalVisibel}
        setVisible={setVolumeModalVisibel}
        selectedList={deleteVolumeList}
        view="edit.vm"
        position="header"
        setRemoveKey={setRemoveItemKey}
      />
      <DetachDataVolumeModal
        visible={detachVolumeModalVisibel}
        setVisible={setDetachVolumeModalVisibel}
        selectedList={deleteVolumeList}
        view="edit.vm"
        position="header"
        setRemoveKey={setRemoveItemKey}
      />
    </>
  );
};

export default React.memo(HardwareInfo);
