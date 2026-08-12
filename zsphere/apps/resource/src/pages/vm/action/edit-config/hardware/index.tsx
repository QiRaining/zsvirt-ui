import { gql, useQuery } from "@apollo/client";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { getNicTypeByOs } from "@zstack/virtualization-resource/src/pages/vm/create/basic-config/os";
import CdRomCard from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/cdrom";
import CPUCard from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/cpu";
import DiskCard from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/disk";
import GPUCard from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/gpu";
import HardwareItem from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/hardware-Item";
import { IHardwareType } from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/hardware-Item/utils";
import MemoryCard from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/memory";
import NetCard from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/netcard";
import OtherCard from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/other";
import PcieCard from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/pcie";
import TpmCard from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/tpm";
import USBCard from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/usb";
import { Form } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { ImageBootMode, VmInstanceState } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  Volume as IVolume,
} from "@zstack/zsphere-types/graphql";
import { formatStorageToObj, ipv6Netmask2prefix } from "@zstack/zsphere-utils";
import { Dropdown, Menu, Tabs } from "antd";
import { orderBy, compact, isNil, keys } from "lodash-es";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { SetDiskQosType } from "zsv_resource_shared/vm/disk/shared-disk-utils";

import { useQueryReleatedResource } from "./hooks";
import type { IRemoveIVolume } from "./removeVolumeModal";
import {
  DeleteDataVolumeModal,
  DetachDataVolumeModal,
} from "./removeVolumeModal";

import styles from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/style.module.less";

const AVAILABLE_KEY_PROVIDERS = gql`
  query availableKeyProviders {
    availableKeyProviders {
      list {
        uuid
        name
        type
      }
      total
    }
  }
`;

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
const { Item } = Menu;

interface HardwareItem {
  label: (index?: number, itemList?: any[]) => React.ReactElement;
  type: string;
  children: React.ReactElement;
  key: string;
  closable?: boolean;
  remove?: "Detach" | "Delete";
}

const HardwareInfo: React.FC<IProps> = ({ setOriginConfig, form, source }) => {
  const intl = useIntl();

  // 查询可用的密钥提供程序，用于 TPM 前置条件判断
  const { data: kmsCountData } = useQuery(AVAILABLE_KEY_PROVIDERS);
  const hasAvailableKeyProvider =
    (kmsCountData?.availableKeyProviders?.total ?? 0) > 0;
  const [volumeModalVisibel, setVolumeModalVisibel] = useState(false);
  const [detachVolumeModalVisibel, setDetachVolumeModalVisibel] =
    useState(false);
  const [deleteVolumeList, setDeleteVolumeList] = useState<IRemoveIVolume[]>(
    [],
  );

  const [activeKey, setActiveKey] = useState("cpu-0"); //tab激活

  const [volumeItemList, setVolumeItemList] = useState<HardwareItem[]>([]);
  const [nicItemList, setNicItemList] = useState<HardwareItem[]>([]);
  const [cdromItemList, setCdromItemList] = useState<HardwareItem[]>([]);
  const [usbItemList, setUsbItemList] = useState<HardwareItem[]>([]);
  const [gpuItemList, setGpuItemList] = useState<HardwareItem[]>([]);
  const [pcieItemList, setPcieItemList] = useState<HardwareItem[]>([]);
  const [tpmItemList, setTpmItemList] = useState<HardwareItem[]>([]);
  const [resourceNum, setResourceNum] = useState<any>({});

  const [removeItemKey, setRemoveItemKey] = useState<string>("");

  const relatedData = useQueryReleatedResource(
    source?.uuid,
    source?.hostUuid ?? source?.lastHostUuid,
    source?.defaultL3NetworkUuid,
    source,
  );

  useEffect(() => {
    if (relatedData) {
      setResourceNum({
        [IHardwareType.Disk]: relatedData?.volumeList?.length,
        [IHardwareType.Netcard]: relatedData?.nicList?.length,
        [IHardwareType.USB]: relatedData?.usbList?.length,
        [IHardwareType.Cdrom]: relatedData?.cdromList?.length,
        [IHardwareType.PCIe]: relatedData?.pcieList?.length,
        [IHardwareType.GPU]: relatedData?.gpuList?.length,
        [IHardwareType.TPM]: (relatedData as any)?.tpmList?.length,
      });
    }
  }, [relatedData]);

  const getListByType = (type: IHardwareType) => {
    const typeToList: any = {
      [IHardwareType.Disk]: [volumeItemList, setVolumeItemList],
      [IHardwareType.Netcard]: [nicItemList, setNicItemList],
      [IHardwareType.USB]: [usbItemList, setUsbItemList],
      [IHardwareType.Cdrom]: [cdromItemList, setCdromItemList],
      [IHardwareType.PCIe]: [pcieItemList, setPcieItemList],
      [IHardwareType.GPU]: [gpuItemList, setGpuItemList],
      [IHardwareType.TPM]: [tpmItemList, setTpmItemList],
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
      children: <CPUCard form={form} source={source} isEdit={true} />,
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
      children: <MemoryCard form={form} />,
      type: "memory",
      key: "memory-0",
      closable: false,
    },
  ];

  const otherDeviceItems: HardwareItem[] = [
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
      case IHardwareType.Disk:
        form.setFields([
          { name: `diskCreateType-${key.split("-")[1]}`, value: "deleted" },
        ]);
        break;
      case IHardwareType.TPM:
        form.setFields([{ name: "tpmEnabled", value: false }]);
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
      return (bandWidth?.volumeBandwidthRead ?? 0) > -1 ||
        (bandWidth?.volumeBandwidthWrite ?? 0) > -1
        ? SetDiskQosType.SetBandwidthWR
        : SetDiskQosType.SetBandwidthTotal;
    }
    if (type === "iopsMode") {
      return (bandWidth?.iopsWrite ?? 0) > -1 || (bandWidth?.iopsRead ?? 0) > -1
        ? SetDiskQosType.SetIopsWR
        : SetDiskQosType.SetIopsTotal;
    }
  };

  const getEditVolumeTooltip = (
    _index: number,
    state?: VmInstanceState,
    volume?: IVolume,
    showRdmTooltip?: boolean,
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
    if (showRdmTooltip) {
      return intl.formatMessage({
        id: "edit.vm.remove.tooltip.secondDiskIsRDM",
        defaultMessage: "Cannot perform Detach Disk or Move to Recycle Bin operations on Disk 1 due to Disk 2 being an RDM disk.",
      });
    }
    return "";
  };

  useEffect(() => {
    if (relatedData) {
      const {
        volumeList,
        nicList,
        vmDnsList,
        gpuList,
        pcieList,
        usbList,
        cdromList,
      } = relatedData;
      const tpmList = (relatedData as any)?.tpmList ?? [];
      setVolumeItemList(
        volumeList.map((volume: any, index: number) => ({
          label: (_index?: number, _volumeItemList?: any[]) => (
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const visibleVolumeItemList = _volumeItemList?.filter(
                  (item) => !item.remove,
                );
                const secondDiskIndex =
                  visibleVolumeItemList?.[1]?.key.split("-")[1];
                const secondDiskType = getFieldValue(
                  `diskCreateType-${secondDiskIndex}`,
                );
                const secondDiskIsRdm = secondDiskType === "rdm";
                const showRdmTooltip = _index === 0 && secondDiskIsRdm;
                return (
                  <HardwareItem
                    showErrorBackground
                    type={IHardwareType.Disk}
                    displayIndex={_index}
                    flagKey={`disk-${index}`}
                    form={form}
                    updateFieldName={`diskSize-${index}`}
                    actions={
                      visibleVolumeItemList?.length === 1
                        ? undefined
                        : [
                            {
                              label: (
                                <Tooltip
                                  title={getEditVolumeTooltip(
                                    index,
                                    source?.state,
                                    undefined,
                                    showRdmTooltip,
                                  )}
                                >
                                  {intl.formatMessage({
                                    id: "detach.disk",
                                    defaultMessage: "Detach Disk",
                                  })}
                                </Tooltip>
                              ),
                              onClick: () => {
                                setDeleteVolumeList([
                                  {
                                    ...volume,
                                    removeKey: `${IHardwareType.Disk}-${index}-Detach`,
                                  },
                                ]);
                                setDetachVolumeModalVisibel(true);
                              },
                              disabled:
                                _index === 0 &&
                                (source.state === "Running" || secondDiskIsRdm),
                              key: "detach",
                            },
                            ...(volume.diskType === "rdm"
                              ? []
                              : [
                                  {
                                    label: (
                                      <Tooltip
                                        title={getEditVolumeTooltip(
                                          index,
                                          source?.state,
                                          volume,
                                          showRdmTooltip,
                                        )}
                                      >
                                        <span>
                                          {isDelay
                                            ? intl.formatMessage({
                                                id: "move.to.recycle.bin",
                                                defaultMessage: "Move to Recycle Bin",
                                              })
                                            : intl.formatMessage({
                                                id: "delete.disk",
                                                defaultMessage: "Delete hard disk.",
                                              })}
                                        </span>
                                      </Tooltip>
                                    ),
                                    onClick: () => {
                                      setDeleteVolumeList([
                                        {
                                          ...volume,
                                          removeKey: `${IHardwareType.Disk}-${index}-Delete`,
                                        },
                                      ]);
                                      setVolumeModalVisibel(true);
                                    },
                                    key: "delete",
                                    disabled:
                                      (_index === 0 &&
                                        (source.state === "Running" ||
                                          secondDiskIsRdm)) ||
                                      volume.isHaveSnapshot,
                                  },
                                ]),
                          ]
                    }
                  />
                );
              }}
            </Form.Item>
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

      setNicItemList(
        nicList.map((nic: any, index: number) => ({
          label: (_index?: number) => (
            <HardwareItem
              showErrorBackground
              type={IHardwareType.Netcard}
              form={form}
              displayIndex={_index}
              flagKey={`netcard-${index}`}
              updateFieldName={`l3NetworkUuids-${index}`}
              setRemoveItemKey={setRemoveItemKey}
              originalValue={nic}
            />
          ),
          children: (
            <NetCard
              isEdit
              source={source}
              form={form}
              index={index}
              zoneUuid={source.zoneUuid ?? ""}
              origin={nic}
            />
          ),
          type: "netcard",
          key: `netcard-${index}`,
          closable: false,
        })),
      );

      setCdromItemList(
        cdromList.map((cdrom, index: number) => ({
          label: (_index?: number) => (
            <HardwareItem
              showErrorBackground
              type={IHardwareType.Cdrom}
              form={form}
              displayIndex={_index}
              flagKey={`cdrom-${index}`}
              updateFieldName={`cdRomList-${index}`}
              dataSource={cdrom}
              setRemoveItemKey={setRemoveItemKey}
              disableRemove={source.state !== VmInstanceState.Stopped}
              disableRemoveTooltip={intl.formatMessage({
                id: "disable.vm.edit.action.with.running",
                defaultMessage:
                  "Cannot modify this setting when the VM is running. Power off the VM and try again.",
              })}
            />
          ),
          children: (
            <CdRomCard
              isEdit
              form={form}
              zoneUuid={source?.zoneUuid}
              index={index}
              originValue={cdrom}
            />
          ),
          type: "cdrom",
          key: `cdrom-${index}`,
          closable: true,
        })),
      );

      setUsbItemList(
        usbList.map((usb, index: number) => ({
          label: () => (
            <HardwareItem
              showErrorBackground
              type={IHardwareType.USB}
              form={form}
              flagKey={`usbDivice-${index}`}
              updateFieldName={`usbDivice-${index}`}
              setRemoveItemKey={setRemoveItemKey}
            />
          ),
          children: (
            <USBCard
              form={form}
              index={index}
              zoneUuid={source.uuid}
              source={source}
            />
          ),
          type: "usbDivice",
          key: `usbDivice-${index}`,
          closable: true,
        })),
      );

      setGpuItemList(
        gpuList.map((gpu, index: number) => ({
          label: (_index?: number) => (
            <HardwareItem
              showErrorBackground
              type={IHardwareType.GPU}
              form={form}
              displayIndex={_index}
              flagKey={`gpu-${index}`}
              updateFieldName={`gpuDevice-${index}`}
              actions={[
                {
                  label: intl.formatMessage({
                    id: "detach.gpu",
                    defaultMessage: "Detach GPU",
                  }),
                  onClick: () =>
                    setRemoveItemKey(`${IHardwareType.GPU}-${index}`),
                  key: "detach",
                  disabled: source?.state === "Running" && gpu.parentUuid, //
                },
              ]}
            />
          ),
          children: (
            <GPUCard
              isEdit
              form={form}
              index={index}
              originValue={gpu}
              source={source}
            />
          ),
          type: "gpu",
          key: `gpu-${index}`,
        })) ?? [],
      );

      setPcieItemList(
        pcieList.map((pcie, index: number) => ({
          label: (_index?: number) => (
            <HardwareItem
              showErrorBackground
              type={IHardwareType.PCIe}
              form={form}
              displayIndex={_index}
              flagKey={`pcie-${index}`}
              updateFieldName={`pcieDevice-${index}`}
              actions={[
                {
                  label: intl.formatMessage({
                    id: "detach.pcie",
                    defaultMessage: "Detach PCIe",
                  }),
                  onClick: () =>
                    setRemoveItemKey(`${IHardwareType.PCIe}-${index}`),
                  key: "detach",
                },
              ]}
            />
          ),
          children: (
            <PcieCard
              isEdit
              form={form}
              index={index}
              originValue={pcie}
              source={source}
            />
          ),
          type: "pcie",
          key: `pcie-${index}`,
        })) ?? [],
      );

      setUsbItemList(
        usbList.map((usb, index: number) => ({
          label: () => (
            <HardwareItem
              showErrorBackground
              type={IHardwareType.USB}
              form={form}
              flagKey={`usb-${index}`}
              updateFieldName={`usbDivice-${index}`}
              actions={[
                {
                  label: intl.formatMessage({
                    id: "detach.usb",
                    defaultMessage: "Unplug USB",
                  }),
                  onClick: () =>
                    setRemoveItemKey(`${IHardwareType.USB}-${index}`),
                  key: "detach",
                },
              ]}
            />
          ),
          children: (
            <USBCard
              form={form}
              index={index}
              zoneUuid={source?.zoneUuid ?? ""}
              isEdit
              originValue={usb}
              source={source}
            />
          ),
          type: IHardwareType.USB,
          key: `usb-${index}`,
          closable: true,
        })),
      );

      let config: any = {};

      nicList.forEach((nic, index: number) => {
        const ipv4 = nic.usedIps?.find((item) => item.ipVersion === 4);
        const ipv6 = nic.usedIps?.find((item) => item.ipVersion === 6);

        config = {
          ...config,
          [`nicUuid-${index}`]: nic.uuid,
          [`netCardState-${index}`]: nic.state === "enable",
          [`l3NetworkUuids-${index}`]: [nic.l3Network],
          [`nicType-${index}`]: nic.driverType,
          [`nicDevice-${index}`]: nic.physicalNic?.uuid
            ? [nic.physicalNic]
            : undefined,
          [`customMac-${index}`]: nic.mac,
          [`ipv4-${index}`]: ipv4?.ip,
          [`ipv6-${index}`]: ipv6?.ip,
          [`appointIpv4-${index}`]: !!ipv4?.ip && !ipv4.l3Network?.enableIPAM,
          [`appointIpv6-${index}`]: !!ipv6?.ip && !ipv6.l3Network?.enableIPAM,
          [`gateway4-${index}`]: ipv4?.gateway,
          [`gateway6-${index}`]: ipv6?.gateway,
          [`netmask-${index}`]: ipv4?.netmask,
          [`prefixLen-${index}`]: ipv6Netmask2prefix(ipv6?.netmask),
          [`securityGroup-${index}`]: orderBy(
            compact(nic.securityGroup),
            "priority",
          ),
          [`ingressPolicy-${index}`]: nic.securityPolicy?.ingressPolicy,
          [`egressPolicy-${index}`]: nic.securityPolicy?.egressPolicy,
          [`netCardQosEnabled-${index}`]: !(
            (isNil(nic.nicBandWidth?.outboundBandwidth) ||
              nic.nicBandWidth?.outboundBandwidth === -1) &&
            (isNil(nic.nicBandWidth?.inboundBandwidth) ||
              nic.nicBandWidth?.inboundBandwidth === -1)
          ),
          [`outboundBandwidth-${index}`]:
            isNil(nic.nicBandWidth?.outboundBandwidth) ||
            nic.nicBandWidth?.outboundBandwidth === -1
              ? { number: undefined, unit: "Mbps" }
              : formatStorageToObj(
                  nic.nicBandWidth.outboundBandwidth,
                  0,
                  "bps",
                ),
          [`inboundBandwidth-${index}`]:
            isNil(nic.nicBandWidth?.inboundBandwidth) ||
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
            busType =
              volume?.systemTag?.capability ??
              (source?.guestOsType === "Other" ? "ide" : "virtio");
          }
          // 处理镜像信息：镜像被删除时显示 UUID
          const { rootImage, rootImageUuid } = volume;

          // 有 rootImage 或 rootImageUuid 时设为 'image' 类型（根盘和数据盘都需要回显 UUID）
          const diskCreateType = rootImage || rootImageUuid ? "image" : "new";

          // 构建镜像值：优先使用 rootImage，否则使用 rootImageUuid 创建占位对象
          const diskImageValue = (() => {
            if (rootImage) {
              return [rootImage];
            }
            if (rootImageUuid) {
              return [{ uuid: rootImageUuid }];
            }
            return [];
          })();

          config = {
            ...config,
            [`diskUuid-${index}`]: volume.uuid,
            [`diskCreateType-${index}`]: diskCreateType,
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
              (volume?.bandwidth?.volumeBandwidth ?? 0) > -1
                ? formatStorageToObj(
                    volume.bandwidth?.volumeBandwidth ?? 0,
                    0,
                    "B/s",
                  )
                : { number: undefined, unit: "MB/s" },
            [`writeBandwidth-${index}`]:
              (volume?.bandwidth?.volumeBandwidthWrite ?? 0) > -1
                ? formatStorageToObj(
                    volume.bandwidth?.volumeBandwidthWrite ?? 0,
                    0,
                    "B/s",
                  )
                : { number: undefined, unit: "MB/s" },
            [`readBandwidth-${index}`]:
              (volume?.bandwidth?.volumeBandwidthRead ?? 0) > -1
                ? formatStorageToObj(
                    volume.bandwidth?.volumeBandwidthRead ?? 0,
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
            [`allocationType-${index}`]:
              volume?.systemTag?.VolumeProvisioningStrategy,
            [`volumeStoragePool-${index}`]: volume?.systemTag?.cephStoragePool,
            [`cacheMode-${index}`]:
              volume?.resourceConfig?.vmcacheMode ?? "none",
            [`aio-${index}`]: volume?.resourceConfig?.aionative === "true",
            [`diskSharable-${index}`]: volume?.isShareable,
            [`diskImage-${index}`]: diskImageValue,
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
        let cdRomIso: Array<{ uuid: string; name: string }> = [];
        if (cdrom?.isoUuid) {
          cdRomIso = [
            { uuid: cdrom.isoUuid, name: cdrom.isoName ?? cdrom.isoUuid },
          ];
        } else if (cdrom?.occupant === "GuestTools") {
          cdRomIso = [
            {
              uuid: `GuestTools-${index}`,
              name: intl.formatMessage({
                id: "vm.cdrom.vmtools.iso.name",
                defaultMessage: "VMTools ISO",
              }),
            },
          ];
        }
        config = {
          ...config,
          [`cdRomListUuid-${index}`]: cdrom.uuid,
          [`cdRomName-${index}`]: `cdRomName-${index}`,
          [`cdRomList-${index}`]: cdRomIso,
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

      pcieList?.forEach((pcie, index) => {
        config = {
          ...config,
          [`pcieDeviceUuid-${index}`]: pcie.uuid,
          [`pcieDevice-${index}`]: [pcie],
        };
      });

      vmDnsList?.forEach(({ dns, vmNicUuid, ipVersion }: any) => {
        if (vmNicUuid) {
          const nicIndex = nicList.findIndex((nic) => nic.uuid === vmNicUuid);
          if (nicIndex !== -1) {
            const dnsList = config[`dnsList${ipVersion}-${nicIndex}`] ?? [];
            dnsList.push(dns);
            config = {
              ...config,
              [`dnsList${ipVersion}-${nicIndex}`]: dnsList,
              [`dnsAllocationType${ipVersion}-${nicIndex}`]: "manual",
            };
          }
        } else {
          const dnsList = config.dnsList ?? [];
          dnsList.push(dns);
          config = {
            ...config,
            dnsList,
            dnsAllocationType: "manual",
          };
        }
      });

      setOriginConfig((origin: any) => ({
        ...origin,
        ...config,
      }));

      if (tpmList && tpmList.length > 0) {
        config = {
          ...config,
          tpmEnabled: true,
          tpmVersion: "2.0",
        };

        setOriginConfig((origin: any) => ({
          ...origin,
          tpmEnabled: true,
          tpmVersion: "2.0",
        }));

        setTpmItemList([
          {
            label: () => (
              <HardwareItem
                showErrorBackground
                type={IHardwareType.TPM}
                form={form}
                flagKey="tpm-0"
                updateFieldName="tpmEnabled"
                setRemoveItemKey={() =>
                  setRemoveItemKey(`${IHardwareType.TPM}-0`)
                }
                disableRemove={source.state !== VmInstanceState.Stopped}
                disableRemoveTooltip={intl.formatMessage({
                  id: "disable.vm.edit.action.with.running",
                  defaultMessage:
                    "Cannot modify this setting when the VM is running. Power off the VM and try again.",
                })}
              />
            ),
            children: <TpmCard form={form} />,
            type: "tpm",
            key: "tpm-0",
            closable: true,
          },
        ]);
      }

      setTimeout(() =>
        form.setFields(
          keys(config).map((key: string) => ({
            name: key,
            value: config[key],
          })),
        ),
      );
    }
  }, [relatedData, source]);

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
  const getHardwareMenu = useCallback(
    (hasVgpuDevice: boolean) => {
      const tpmNum = tpmItemList?.filter((item) => !item.remove)?.length ?? 0;
      // TPM 前置条件：密钥提供程序 + UEFI
      const bootMode = (source?.systemTag as any)?.bootMode as
        | string
        | string[]
        | undefined;
      const isUefiMode = Array.isArray(bootMode)
        ? bootMode.some((m) => String(m).includes(ImageBootMode.UEFI))
        : String(bootMode ?? "").includes(ImageBootMode.UEFI);

      const notMeetTpmPrerequisites = !hasAvailableKeyProvider || !isUefiMode;

      const tpmPrerequisitesTooltip = (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "tpm.field.enabled.tooltip",
            defaultMessage: `To add a TPM, ensure th following requirements are met:

- You have added a valid key provider to the platform. If you are using the native key provider, perform a backup first.
- You have set the virtual machine BIOS mode to UEFI.`,
          })}
        </ReactMarkdown>
      );
      return (
        <Menu>
          <Item
            onClick={() => addHardwareItem(IHardwareType.Disk)}
            disabled={
              volumeItemList?.filter((item) => !item.remove)?.length > 23
            }
          >
            {intl.formatMessage(
              {
                id: "virtualization.hardware.to.be.selected.item.name.disk",
                defaultMessage: "Disk ({diskNum}/24)",
              },
              {
                diskNum: volumeItemList?.filter((item) => !item.remove)?.length,
              },
            )}
          </Item>
          <Item onClick={() => addHardwareItem(IHardwareType.Netcard)}>
            {intl.formatMessage({
              id: "virtualization.hardware.to.be.selected.item.name.network.card",
              defaultMessage: "NIC",
            })}
          </Item>
          <Item
            onClick={() => addHardwareItem(IHardwareType.Cdrom)}
            disabled={
              cdromItemList?.filter((item) => !item.remove)?.length > 2 ||
              source.state !== "Stopped"
            }
          >
            {intl.formatMessage(
              {
                id: "virtualization.hardware.to.be.selected.item.name.cdRom",
                defaultMessage: "CD/DVD Drive ({cdRomNum}/3)",
              },
              {
                cdRomNum: cdromItemList?.filter((item) => !item.remove)?.length,
              },
            )}
          </Item>
          <Item
            onClick={() => addHardwareItem(IHardwareType.GPU)}
            disabled={hasVgpuDevice}
          >
            {intl.formatMessage({
              id: "virtualization.hardware.to.be.selected.item.name.gpu",
              defaultMessage: "GPU Device",
            })}
          </Item>
          <Item
            onClick={() => addHardwareItem(IHardwareType.USB)}
            disabled={usbItemList && usbItemList.some((item) => !item.remove)}
          >
            {intl.formatMessage(
              {
                id: "virtualization.hardware.to.be.selected.item.name.usb",
                defaultMessage: "USB Device ({usbNum}/1)",
              },
              {
                usbNum: usbItemList?.filter((item) => !item.remove).length,
              },
            )}
          </Item>
          <Item onClick={() => addHardwareItem(IHardwareType.PCIe)}>
            {intl.formatMessage({
              id: "virtualization.hardware.to.be.selected.item.name.pcie",
              defaultMessage: "PCIe Device",
            })}
          </Item>
          {source?.architecture !== "aarch64" && (
            <Item
              onClick={() => addHardwareItem(IHardwareType.TPM)}
              disabled={
                tpmNum > 0 ||
                source.state !== "Stopped" ||
                notMeetTpmPrerequisites
              }
            >
              {source.state !== "Stopped" && tpmNum === 0 ? (
                <Tooltip
                  title={intl.formatMessage({
                    id: "disable.vm.edit.action.with.running",
                    defaultMessage:
                      "Cannot modify this setting when the VM is running. Power off the VM and try again.",
                  })}
                >
                  <span>
                    {intl.formatMessage(
                      {
                        id: "virtualization.hardware.to.be.selected.item.name.tpm.with.count",
                        defaultMessage: "TPM({tpmNum}/1)",
                      },
                      { tpmNum },
                    )}
                  </span>
                </Tooltip>
              ) : notMeetTpmPrerequisites && tpmNum === 0 ? (
                <Tooltip title={tpmPrerequisitesTooltip}>
                  <span>
                    {intl.formatMessage(
                      {
                        id: "virtualization.hardware.to.be.selected.item.name.tpm.with.count",
                        defaultMessage: "TPM({tpmNum}/1)",
                      },
                      { tpmNum },
                    )}
                  </span>
                </Tooltip>
              ) : (
                intl.formatMessage(
                  {
                    id: "virtualization.hardware.to.be.selected.item.name.tpm.with.count",
                    defaultMessage: "TPM({tpmNum}/1)",
                  },
                  { tpmNum },
                )
              )}
            </Item>
          )}
        </Menu>
      );
    },
    [
      cdromItemList,
      volumeItemList,
      usbItemList,
      nicItemList,
      gpuItemList,
      pcieItemList,
      tpmItemList,
      source,
    ],
  );

  const addHardwareItem = (hardwareType: IHardwareType) => {
    const [itemList, setItemList] = getListByType(hardwareType) ?? [];
    const addedNum = resourceNum[hardwareType];
    let childEle;
    let updateFieldName: string = "";
    let initValue: any = {};

    if (hardwareType === IHardwareType.Cdrom) {
      childEle = (
        <CdRomCard form={form} index={addedNum} zoneUuid={source?.zoneUuid} />
      );
      updateFieldName = `cdRomList-${addedNum}`;
      initValue = {
        [`cdRomName-${addedNum}`]: `cdRomName-${addedNum}`,
      };
    }

    if (hardwareType === IHardwareType.Netcard) {
      childEle = (
        <NetCard
          isEdit
          source={source}
          form={form}
          index={addedNum}
          zoneUuid={source.zoneUuid ?? ""}
        />
      );
      updateFieldName = `l3NetworkUuids-${addedNum}`;

      const totalCoreNum = form.getFieldValue("totalCoreNum");

      const multiInitNum =
        (totalCoreNum as number) < 12 ? String(totalCoreNum) : "12";

      initValue = {
        [`netCardState-${addedNum}`]: true,
        [`l3NetworkUuids-${addedNum}`]: [],
        [`nicType-${addedNum}`]: getNicTypeByOs(
          form.getFieldValue("guest") ?? source?.platform,
          form.getFieldValue("os") ?? source?.guestOsType,
        ),
        [`customMac-${addedNum}`]: undefined,
        [`staticIp-${addedNum}`]: undefined,
        [`securityGroup-${addedNum}`]: [],
        [`nicMultiQueueNum-${addedNum}`]: multiInitNum,
        [`netCardQosEnabled-${addedNum}`]: false,
        [`outboundBandwidth-${addedNum}`]: { number: undefined, unit: "Mbps" },
        [`inboundBandwidth-${addedNum}`]: { number: undefined, unit: "Mbps" },
      };
    }

    if (hardwareType === IHardwareType.Disk) {
      childEle = (
        <DiskCard
          isEdit
          form={form}
          zoneUuid={source.zoneUuid}
          index={addedNum}
          source={source}
        />
      );
      updateFieldName = `diskSize-${addedNum}`;
      initValue = {
        [`diskCreateType-${addedNum}`]: "new",
        [`diskSize-${addedNum}`]: { number: 40, unit: "GB" },
        [`turnOnQoS-${addedNum}`]: false,
        [`bandwidthMode-${addedNum}`]: SetDiskQosType.SetBandwidthTotal,
        [`totalBandwidth-${addedNum}`]: { number: undefined, unit: "MB/s" },
        [`writeBandwidth-${addedNum}`]: { number: undefined, unit: "MB/s" },
        [`readBandwidth-${addedNum}`]: { number: undefined, unit: "MB/s" },
        [`iopsMode-${addedNum}`]: SetDiskQosType.SetIopsTotal,
        [`iopsTotal-${addedNum}`]: undefined,
        [`iopsRead-${addedNum}`]: undefined,
        [`iopsWrite-${addedNum}`]: undefined,
        [`busType-${addedNum}`]:
          source?.guestOsType === "Other" ? "ide" : "virtio",
        [`allocationType-${addedNum}`]: "ThinProvisioning",
        [`cacheMode-${addedNum}`]: "none",
        [`aio-${addedNum}`]: false,
        [`diskSharable-${addedNum}`]: false,
      };
    }

    if (hardwareType === IHardwareType.USB) {
      childEle = (
        <USBCard
          form={form}
          index={addedNum}
          zoneUuid={source?.zoneUuid ?? ""}
          source={source}
        />
      );
      updateFieldName = `usbDivice-${addedNum}`;
    }

    if (hardwareType === IHardwareType.GPU) {
      childEle = (
        <GPUCard isEdit form={form} index={addedNum} source={source} />
      );
      updateFieldName = `gpuDevice-${addedNum}`;
    }

    if (hardwareType === IHardwareType.PCIe) {
      childEle = (
        <PcieCard isEdit form={form} index={addedNum} source={source} />
      );
      updateFieldName = `pcieDevice-${addedNum}`;
    }

    if (hardwareType === IHardwareType.TPM) {
      childEle = <TpmCard form={form} />;
      updateFieldName = "tpmEnabled";
      initValue = {
        tpmEnabled: true,
        tpmVersion: "2.0",
      };
    }

    setItemList(
      itemList.concat({
        label: (index?: number) => (
          <HardwareItem
            type={hardwareType}
            form={form}
            displayIndex={index}
            flagKey={`${hardwareType}-${addedNum}`}
            updateFieldName={updateFieldName}
            setRemoveItemKey={() =>
              setRemoveItemKey(`${hardwareType}-${addedNum}`)
            }
            showErrorBackground
            disableRemove={source.state !== VmInstanceState.Stopped}
            disableRemoveTooltip={intl.formatMessage({
              id: "disable.vm.edit.action.with.running",
              defaultMessage:
                "Cannot modify this setting when the VM is running. Power off the VM and try again.",
            })}
          />
        ),
        children: childEle,
        type: `${hardwareType}-${addedNum}`,
        key: `${hardwareType}-${addedNum}`,
        closable: true,
      }),
    );

    setResourceNum({
      ...resourceNum,
      [hardwareType]: addedNum + 1,
    });

    setTimeout(() =>
      form.setFields(
        keys(initValue).map((key: string) => ({
          name: key,
          value: initValue[key],
        })),
      ),
    );
  };

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
            <Form.Item
              noStyle
              shouldUpdate={(pre, cur) => {
                const gpuKeys = keys(cur).filter(
                  (key) => key.indexOf("gpuDevice") > -1,
                );
                return gpuKeys.some((key) => pre[key] !== cur[key]);
              }}
            >
              {({ getFieldsValue }) => {
                const values = getFieldsValue();
                const hasVgpuDevice = keys(values)
                  .filter((key) => key.indexOf("gpuDeviceType-") > -1)
                  ?.some((key) => values[key] === "vgpu");
                return (
                  <Dropdown
                    placement="bottomRight"
                    dropdownRender={() => getHardwareMenu(hasVgpuDevice)}
                    trigger={["click"]}
                  >
                    <div className={styles.action}>
                      <Icon type="plus" />
                      {intl.formatMessage({
                        id: "virtualization.add.hardware",
                        defaultMessage: "Add Hardware",
                      })}
                    </div>
                  </Dropdown>
                );
              }}
            </Form.Item>
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
                tab={t.label(index, volumeItemList)}
                key={t.key}
              >
                {React.cloneElement(t.children, { displayIndex: index })}
              </Tabs.TabPane>
            ))}

          {nicItemList
            .filter((item) => !item.remove)
            .map((t, index) => (
              <Tabs.TabPane
                className={styles["tabPane-hardware"]}
                tab={t.label(index)}
                key={t.key}
              >
                {React.cloneElement(t.children, { displayIndex: index })}
              </Tabs.TabPane>
            ))}

          {cdromItemList
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

          {gpuItemList
            .filter((item) => !item.remove)
            .map((t, index) => (
              <Tabs.TabPane
                forceRender
                className={styles["tabPane-hardware"]}
                tab={t.label(index)}
                key={t.key}
              >
                {t.children}
              </Tabs.TabPane>
            ))}

          {usbItemList
            .filter((item) => !item.remove)
            .map((t, index) => (
              <Tabs.TabPane
                forceRender
                className={styles["tabPane-hardware"]}
                tab={t.label(index)}
                key={t.key}
              >
                {t.children}
              </Tabs.TabPane>
            ))}

          {pcieItemList
            .filter((item) => !item.remove)
            .map((t, index) => (
              <Tabs.TabPane
                forceRender
                className={styles["tabPane-hardware"]}
                tab={t.label(index)}
                key={t.key}
              >
                {t.children}
              </Tabs.TabPane>
            ))}

          {tpmItemList
            .filter((item) => !item.remove)
            .map((t, index) => (
              <Tabs.TabPane
                forceRender
                className={styles["tabPane-hardware"]}
                tab={t.label(index)}
                key={t.key}
              >
                {t.children}
              </Tabs.TabPane>
            ))}

          {otherDeviceItems.map((t) => (
            <Tabs.TabPane
              className={styles["tabPane-hardware"]}
              tab={t.label()}
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
