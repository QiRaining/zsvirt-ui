import { gql, useLazyQuery } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { getNicTypeByOs } from "@zstack/virtualization-resource/src/pages/vm/create/basic-config/os";
import { CreateInstanceContext } from "@zstack/virtualization-resource/src/pages/vm/create/context";
import { Form, Spin } from "@zstack/zsphere-components";
import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import type { Volume as IVolume } from "@zstack/zsphere-types/graphql";
import { formatStorageToObj, ipv6Netmask2prefix } from "@zstack/zsphere-utils";
import { Dropdown, Menu, Tabs } from "antd";
import { orderBy, compact, isNil, keys, range, flatten } from "lodash-es";
import React, { useCallback, useContext, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import CdRomCard from "./cdrom";
import CPUCard from "./cpu";
import DiskCard, { SetDiskQosType } from "./disk";
import GPUCard from "./gpu";
import HardwareItem from "./hardware-Item-for-create";
import { IHardwareType } from "./hardware-Item-for-create/utils";
import { useQueryReleatedResource } from "./hooks";
import MemoryCard from "./memory";
import NetCard from "./netcard";
import OtherCard from "./other";
import PcieCard from "./pcie";
import TpmCard, { TpmConfigMethodEnum } from "./tpm";
import USBCard from "./usb";

import styles from "./style.module.less";

const GET_GLOBAL_CONFIG = gql`
  query getGlobalConfig($category: String!, $name: String!) {
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

interface IProps {
  form: any;
  visible?: boolean;
  vmTemplate: any;
}

const { Item } = Menu;

interface HardwareItem {
  label: (index?: number) => React.ReactElement;
  type: string;
  children: React.ReactElement;
  key: string;
  closable?: boolean;
  remove?: "Detach" | "Delete";
}

const SPIN_POSITION_RELATIVE_STYLE = { position: "relative" } as const;

const HardwareInfo: React.FC<IProps> = ({ form, visible, vmTemplate }) => {
  const intl = useIntl();

  const [loading, setLoading] = useState(true);

  const { zoneUuid, realSource: source } = useContext(CreateInstanceContext);

  const [activeKey, setActiveKey] = useState("cpu-0"); //tab激活

  const [removePciVisible, setRemovePciVisible] = useState(false);

  const [removeItemKey, setRemoveItemKey] = useState("");

  const relatedData = useQueryReleatedResource(
    source,
    vmTemplate?.[0]?.uuid || "",
    vmTemplate?.[0]?.defaultL3NetworkUuid,
  );

  useEffect(() => {
    if (vmTemplate?.[0]?.uuid) {
      setLoading(true);
    }
  }, [vmTemplate?.[0]?.uuid]);

  //可多个加入资源
  const [volumeItemList, setVolumeItemList] = useState<HardwareItem[]>([
    {
      label: () => (
        <HardwareItem
          showErrorBackground={true}
          type={IHardwareType.Disk}
          flagKey={`${IHardwareType.Disk}-0`}
          form={form}
          updateFieldName="diskSize-0"
        />
      ),
      children: (
        <DiskCard form={form} index={0} zoneUuid={zoneUuid} source={source} />
      ),
      type: "disk",
      key: "disk-0",
      closable: false,
    },
  ]);
  const [nicItemList, setNicItemList] = useState<HardwareItem[]>([
    {
      label: () => (
        <HardwareItem
          showErrorBackground={true}
          type={IHardwareType.Netcard}
          form={form}
          flagKey={`${IHardwareType.Netcard}-0`}
          updateFieldName="l3NetworkUuids-0"
          setRemoveItemKey={setRemoveItemKey}
        />
      ),
      children: (
        <NetCard
          form={form}
          index={0}
          zoneUuid={zoneUuid}
          source={source}
          vmTemplate={vmTemplate}
        />
      ),
      type: "netcard",
      key: "netcard-0",
      closable: false,
    },
  ]);
  const [cdromItemList, setCdromItemList] = useState<HardwareItem[]>([
    {
      label: () => (
        <HardwareItem
          showErrorBackground={true}
          type={IHardwareType.Cdrom}
          form={form}
          flagKey={`${IHardwareType.Cdrom}-0`}
          updateFieldName="cdRomList-0"
        />
      ),
      children: (
        <CdRomCard form={form} index={0} zoneUuid={zoneUuid} source={source} />
      ),
      type: "cdrom",
      key: "cdrom-0",
      closable: false,
    },
  ]);
  const [usbItemList, setUsbItemList] = useState<HardwareItem[]>([]);
  const [gpuItemList, setGpuItemList] = useState<HardwareItem[]>([]);
  const [pcieItemList, setPcieItemList] = useState<HardwareItem[]>([]);
  const [tpmItemList, setTpmItemList] = useState<HardwareItem[]>([]);

  const [defaultDiskNum, setDefaultDiskNum] = useState<number>(24);

  const [resourceNum, setResourceNum] = useState<Record<string, number>>({
    [IHardwareType.USB]: 0,
    [IHardwareType.PCIe]: 0,
    [IHardwareType.GPU]: 0,
    [IHardwareType.TPM]: 0,
  });

  useEffect(() => {
    if (relatedData) {
      setResourceNum((prev) => ({
        ...prev,
        [IHardwareType.Disk]: relatedData?.volumeList?.length,
        [IHardwareType.Netcard]: relatedData?.nicList?.length,
        [IHardwareType.Cdrom]: relatedData?.cdromList?.length,
      }));
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

  //硬件列表
  const cpuAndMemory = [
    {
      label: () => (
        <HardwareItem
          showErrorBackground={true}
          type={IHardwareType.CPU}
          form={form}
          updateFieldName="totalCoreNum"
          flagKey={`${IHardwareType.CPU}-0`}
        />
      ),
      children: <CPUCard form={form} source={relatedData?.vmList?.[0]} />,
      type: "cpu",
      key: "cpu-0",
      closable: false,
    },
    {
      label: () => (
        <HardwareItem
          showErrorBackground={true}
          type={IHardwareType.Memory}
          form={form}
          flagKey={`${IHardwareType.Memory}-0`}
          updateFieldName="memorySize"
        />
      ),
      children: <MemoryCard form={form} source={relatedData?.vmList?.[0]} />,
      type: "memory",
      key: "memory-0",
      closable: false,
    },
  ];

  const otherDeviceItems: HardwareItem[] = [
    {
      label: () => (
        <HardwareItem
          showErrorBackground={true}
          type={IHardwareType.Other}
          form={form}
          flagKey={`${IHardwareType.Other}-0`}
          updateFieldName="name"
        />
      ),
      children: <OtherCard form={form} source={relatedData?.vmList?.[0]} />,
      type: "other",
      key: "other-0",
      closable: false,
    },
  ];

  useEffect(() => {
    if (relatedData) {
      const {
        volumeList,
        nicList,
        dnsList,
        gpuList,
        usbList,
        pcieList,
        cdromList,
      } = relatedData;
      //2024/4/20 现阶段不允许删除已有资源
      const flag20240429 = false;

      setVolumeItemList(
        volumeList.map((volume: any, index: number) => ({
          label: (_index?: number) => (
            <HardwareItem
              showErrorBackground
              type={IHardwareType.Disk}
              flagKey={`disk-${_index}`}
              form={form}
              updateFieldName={`diskSize-${index}`}
              canDelete={flag20240429}
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
              newCreate={false}
              createdVolumeUuid={volume.uuid}
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
              canDelete={flag20240429}
              showErrorBackground
              type={IHardwareType.Netcard}
              form={form}
              flagKey={`netcard-${_index}`}
              updateFieldName={`l3NetworkUuids-${index}`}
              setRemoveItemKey={setRemoveItemKey}
              origin={nic}
            />
          ),
          children: (
            <NetCard
              isEdit
              source={source}
              vmTemplate={vmTemplate}
              form={form}
              index={index}
              zoneUuid={zoneUuid}
              origin={nic}
              newCreate={false}
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
              canDelete={flag20240429}
              showErrorBackground
              type={IHardwareType.Cdrom}
              form={form}
              flagKey={`cdrom-${index}`}
              updateFieldName={`cdRomList-${index}`}
              setRemoveItemKey={setRemoveItemKey}
            />
          ),
          children: (
            <CdRomCard
              isEdit
              form={form}
              zoneUuid={source?.zoneUuid}
              index={index}
              newCreate={false}
            />
          ),
          type: "cdrom",
          key: `cdrom-${index}`,
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
            (isNil(nic.nicBandWidth?.inboundBandwidth) ||
              nic.nicBandWidth?.inboundBandwidth === -1) &&
            (isNil(nic.nicBandWidth?.outboundBandwidth) ||
              nic.nicBandWidth?.outboundBandwidth === -1)
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

      dnsList.forEach(({ dns, vmNicUuid, ipVersion }: any) => {
        if (vmNicUuid) {
          const nicIndex = nicList.findIndex((nic) => nic.uuid === vmNicUuid);
          if (nicIndex !== -1) {
            const list = config[`dnsList${ipVersion}-${nicIndex}`] ?? [];
            list.push(dns);
            config = {
              ...config,
              [`dnsList${ipVersion}-${nicIndex}`]: list,
              [`dnsAllocationType${ipVersion}-${nicIndex}`]: "manual",
            };
          }
        } else {
          const list = config.dnsList ?? [];
          list.push(dns);
          config = {
            ...config,
            dnsList: list,
            dnsAllocationType: "manual",
          };
        }
      });

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

      volumeList?.forEach((volume, index) => {
        if (volume.diskType === "volume") {
          let busType;
          if (volume.type === "Root") {
            busType =
              volume?.systemTag?.capability ??
              (vmTemplate?.[0]?.systemTag?.vmDriver ? "virtio" : "ide");
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
                    volume.bandwidth?.volumeBandwidth ?? 0,
                    0,
                    "B/s",
                  )
                : { number: undefined, unit: "MB/s" },
            [`writeBandwidth-${index}`]:
              (volume?.bandwidth?.volumeBandwidthWrite ?? -1) > -1
                ? formatStorageToObj(
                    volume.bandwidth?.volumeBandwidthWrite ?? 0,
                    0,
                    "B/s",
                  )
                : { number: undefined, unit: "MB/s" },
            [`readBandwidth-${index}`]:
              (volume?.bandwidth?.volumeBandwidthRead ?? -1) > -1
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

      const hasPcieDevice =
        gpuList?.length > 0 || usbList?.length > 0 || pcieList?.length > 0;
      // 检查模版是否有TPM
      const templateData = vmTemplate?.[0];
      const isArm =
        (templateData?.architecture || source?.architecture) === "aarch64";
      const hasTpm = templateData?.tpmList?.length > 0 && !isArm;
      if (hasTpm) {
        config = {
          ...config,
          tpmConfigMethod: TpmConfigMethodEnum.Retain,
          tpmVersion: "2.0",
        };
        setResourceNum((prev) => ({
          ...prev,
          [IHardwareType.TPM]: 1,
        }));
        setTpmItemList([
          {
            label: () => (
              <HardwareItem
                showErrorBackground={true}
                type={IHardwareType.TPM}
                form={form}
                flagKey={`${IHardwareType.TPM}-0`}
                updateFieldName="tpmConfigMethod"
              />
            ),
            children: <TpmCard form={form} />,
            type: "tpm",
            key: "tpm-0",
            closable: false,
          },
        ]);
      } else {
        setTpmItemList([]);
        setResourceNum((prev) => ({
          ...prev,
          [IHardwareType.TPM]: 0,
        }));
      }

      setTimeout(() => {
        form.setFields(
          keys(config).map((key: string) => ({
            name: key,
            value: config[key],
          })),
        );
        form.setFieldsValue({ hasPcieDevice });
      });
      // give some buffer time to set fields,1800 is a magic number
      setTimeout(() => {
        setLoading(false);
      }, 1800);
    }
    // 使用 vmTemplate?.[0]?.uuid 作为依赖，避免数组引用变化导致 useEffect 重复执行
  }, [relatedData, vmTemplate?.[0]?.uuid]);

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

  const removeHardwareList = (
    type: IHardwareType,
    key: string,
    policy: "Detach" | "Delete" = "Detach",
  ) => {
    const [itemList, setItemList] = getListByType(type);
    itemList.find((it: HardwareItem) => it.key === key)!.remove = policy;

    setItemList(itemList);
    switch (type) {
      case IHardwareType.Netcard:
        form.setFields([
          { name: `l3NetworkUuids-${key.split("-")[1]}`, value: [] },
        ]);
        break;
      case IHardwareType.Disk:
        form.setFields([
          { name: `diskCreateType-${key.split("-")[1]}`, value: "deleted" },
        ]);
        break;
      case IHardwareType.Cdrom:
        form.setFields([{ name: `cdRomList-${key.split("-")[1]}`, value: [] }]);
        form.setFields([
          { name: `cdRomName-${key.split("-")[1]}`, value: "deleted" },
        ]);
        break;
      case IHardwareType.USB:
        form.setFields([
          { name: `usbDiviceType-${key.split("-")[1]}`, value: "deleted" },
        ]);
        break;
      case IHardwareType.GPU:
        form.setFields([
          { name: `gpuDeviceType-${key.split("-")[1]}`, value: "deleted" },
        ]);
        break;
      case IHardwareType.PCIe:
        form.setFields([
          { name: `pcieDevice-${key.split("-")[1]}`, value: [] },
        ]);
        break;
    }
    setActiveKey("cpu-0");
  };

  //最多硬盘数量逻辑
  const [queryMaxDiskNum] = useLazyQuery(GET_GLOBAL_CONFIG, {
    variables: {
      category: "kvm",
      name: "dataVolume.maxNum",
    },
    onCompleted: (data) => {
      setDefaultDiskNum(data?.globalConfig?.value);
    },
  });

  useEffect(() => {
    if (visible) {
      queryMaxDiskNum();
    }
  }, [visible]);

  //现有资源
  //最多资源
  const getHardwareMenu = useCallback(
    (hasVgpuDevice: boolean, disabledPci: boolean) => {
      const diskNum = volumeItemList?.filter((item) => !item.remove)?.length;
      const cdRomNum = cdromItemList?.filter((item) => !item.remove).length;
      const usbNum = usbItemList?.filter((item) => !item.remove).length;

      return (
        <Menu>
          <Item
            onClick={() => addHardwareItem(IHardwareType.Disk)}
            disabled={diskNum > 23}
          >
            {intl.formatMessage(
              {
                id: "virtualization.hardware.to.be.selected.item.name.diskNum",
                defaultMessage: "Disk ({diskNum}/{defaultDiskNum})",
              },
              {
                diskNum,
                defaultDiskNum,
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
            disabled={cdRomNum > 2}
          >
            {intl.formatMessage(
              {
                id: "virtualization.hardware.to.be.selected.item.name.cdRom",
                defaultMessage: "CD/DVD Drive ({cdRomNum}/3)",
              },
              {
                cdRomNum,
              },
            )}
          </Item>
          <Item
            onClick={() => addHardwareItem(IHardwareType.GPU)}
            disabled={hasVgpuDevice || disabledPci}
          >
            {intl.formatMessage({
              id: "virtualization.hardware.to.be.selected.item.name.gpu",
              defaultMessage: "GPU Device",
            })}
          </Item>
          <Item
            onClick={() => addHardwareItem(IHardwareType.USB)}
            disabled={usbNum > 0 || disabledPci}
          >
            {intl.formatMessage(
              {
                id: "virtualization.hardware.to.be.selected.item.name.usb",
                defaultMessage: "USB Device ({usbNum}/1)",
              },
              {
                usbNum,
              },
            )}
          </Item>
          <Item
            onClick={() => addHardwareItem(IHardwareType.PCIe)}
            disabled={disabledPci}
          >
            {intl.formatMessage({
              id: "virtualization.hardware.to.be.selected.item.name.pcie",
              defaultMessage: "PCIe Device",
            })}
          </Item>
        </Menu>
      );
    },
    [
      cdromItemList,
      intl,
      usbItemList,
      volumeItemList,
      nicItemList,
      gpuItemList,
      pcieItemList,
      defaultDiskNum,
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
        <CdRomCard
          form={form}
          index={addedNum}
          zoneUuid={zoneUuid}
          newCreate={true}
        />
      );
      updateFieldName = `cdRomList-${addedNum}`;
    }

    if (hardwareType === IHardwareType.Netcard) {
      childEle = (
        <NetCard
          isEdit
          source={source}
          vmTemplate={vmTemplate}
          form={form}
          index={addedNum}
          zoneUuid={zoneUuid}
          newCreate={true}
        />
      );
      updateFieldName = `l3NetworkUuids-${addedNum}`;
      const totalCoreNum = form.getFieldValue("totalCoreNum");
      const runPath = form.getFieldValue("runPath");
      //
      let kvmAutoSetVmNicMultiqueue = false;
      if (runPath?.[0] && runPath?.[0]?.__typename) {
        if (runPath?.[0]?.__typename === "HostVO") {
          kvmAutoSetVmNicMultiqueue =
            runPath?.[0]?.cluster?.resourceConfigValue
              ?.kvmAutoSetVmNicMultiqueue !== "false";
        }
        if (runPath?.[0]?.__typename === "Cluster") {
          kvmAutoSetVmNicMultiqueue =
            runPath?.[0]?.resourceConfigValue?.kvmAutoSetVmNicMultiqueue !==
            "false";
        }
      }
      const guest = form.getFieldValue("guest");
      const os = form.getFieldValue("os");

      let multiInitNum = "1";

      if (kvmAutoSetVmNicMultiqueue) {
        multiInitNum =
          (totalCoreNum as number) < 12 ? String(totalCoreNum) : "12";
      }

      initValue = {
        [`netCardState-${addedNum}`]: true,
        [`l3NetworkUuids-${addedNum}`]: [],
        [`nicType-${addedNum}`]: getNicTypeByOs(guest, os),
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
          zoneUuid={zoneUuid}
          index={addedNum}
          source={source}
          newCreate={true}
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
        [`busType-${addedNum}`]: "virtio",
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
          zoneUuid={zoneUuid}
          source={source}
          newCreate={true}
        />
      );
      updateFieldName = `usbDivice-${addedNum}`;
    }

    if (hardwareType === IHardwareType.GPU) {
      childEle = (
        <GPUCard
          isEdit
          form={form}
          index={addedNum}
          source={source}
          newCreate={true}
        />
      );
      updateFieldName = `gpuDevice-${addedNum}`;
    }

    if (hardwareType === IHardwareType.PCIe) {
      childEle = (
        <PcieCard isEdit form={form} index={addedNum} source={source} />
      );
      updateFieldName = `pcieDevice-${addedNum}`;
    }

    setItemList(
      itemList.concat({
        label: (index?: number) => (
          <HardwareItem
            type={hardwareType}
            form={form}
            flagKey={`${hardwareType}-${index}`}
            updateFieldName={updateFieldName}
            setRemoveItemKey={() =>
              setRemoveItemKey(`${hardwareType}-${addedNum}`)
            }
            showErrorBackground={true}
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
    //最好有表单校验事件
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
                return (
                  gpuKeys.some((key) => pre[key] !== cur[key]) ||
                  pre.count !== cur.count
                );
              }}
            >
              {({ getFieldsValue }) => {
                const values = getFieldsValue();
                const hasVgpuDevice = keys(values)
                  .filter((key) => key.indexOf("gpuDeviceType-") > -1)
                  ?.some((key) => values[key] === "vgpu");

                const disabledPci = values.count > 1;

                if (
                  disabledPci &&
                  (gpuItemList.some((t) => t.remove !== "Delete") ||
                    usbItemList.some((t) => t.remove !== "Delete") ||
                    pcieItemList.some((t) => t.remove !== "Delete") ||
                    nicItemList.some((item, index) => {
                      return (
                        item.remove !== "Delete" &&
                        (values[`customMac-${index}`] ||
                          values[`appointIpv4-${index}`] ||
                          values[`appointIpv6-${index}`] ||
                          values[`ipv4-${index}`] ||
                          values[`ipv6-${index}`])
                      );
                    }))
                ) {
                  setRemovePciVisible(true);
                }
                return (
                  <Dropdown
                    placement="bottomRight"
                    dropdownRender={() =>
                      getHardwareMenu(hasVgpuDevice, disabledPci)
                    }
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
        {loading ? (
          <Spin spinning={loading} style={SPIN_POSITION_RELATIVE_STYLE} />
        ) : (
          <Tabs
            hideAdd
            onChange={onChange}
            activeKey={activeKey}
            className={styles.tab}
            tabPosition="left"
          >
            <>
              {cpuAndMemory.map((t) => (
                <Tabs.TabPane
                  forceRender
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
                    forceRender
                    className={styles["tabPane-hardware"]}
                    tab={t.label(index)}
                    key={t.key}
                  >
                    {t.children}
                  </Tabs.TabPane>
                ))}

              {nicItemList
                .filter((item) => !item.remove)
                .map((t, index) => (
                  <Tabs.TabPane
                    forceRender
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
                    forceRender
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
                .map((t) => (
                  <Tabs.TabPane
                    forceRender
                    className={styles["tabPane-hardware"]}
                    tab={t.label()}
                    key={t.key}
                  >
                    {t.children}
                  </Tabs.TabPane>
                ))}

              {otherDeviceItems.map((t) => (
                <Tabs.TabPane
                  forceRender
                  className={styles["tabPane-hardware"]}
                  tab={t.label()}
                  key={t.key}
                >
                  {t.children}
                </Tabs.TabPane>
              ))}
            </>
          </Tabs>
        )}
      </div>
      <DialogWeakP1
        title={intl.formatMessage({
          id: "template.create.vm.remove.config.confirm.title",
          defaultMessage: "Configurations Will Be Cleared",
        })}
        type="warning"
        onConfirm={() => {
          setGpuItemList((gpuList) =>
            gpuList.map((t) => {
              return { ...t, remove: "Delete" };
            }),
          );
          setUsbItemList((usbList) =>
            usbList.map((t) => {
              return { ...t, remove: "Delete" };
            }),
          );
          setPcieItemList((pcieList) =>
            pcieList.map((t) => {
              return { ...t, remove: "Delete" };
            }),
          );
          form.setFields([
            ...range(resourceNum[IHardwareType.GPU]).map((idx) => ({
              name: `gpuDeviceType-${idx}`,
              value: "deleted",
            })),
            ...range(resourceNum[IHardwareType.USB]).map((idx) => ({
              name: `usbDiviceType-${idx}`,
              value: "deleted",
            })),
            ...range(resourceNum[IHardwareType.PCIe]).map((idx) => ({
              name: `pcieDevice-${idx}`,
              value: [],
            })),
            ...flatten(
              range(resourceNum[IHardwareType.Netcard]).map((idx) => [
                {
                  name: `customMac-${idx}`,
                  value: "",
                },
                {
                  name: `ipv4-${idx}`,
                  value: "",
                },
                {
                  name: `ipv6-${idx}`,
                  value: "",
                },
                {
                  name: `appointIpv4-${idx}`,
                  value: false,
                },
                {
                  name: `appointIpv6-${idx}`,
                  value: false,
                },
              ]),
            ),
          ]);
          if (
            activeKey.startsWith(IHardwareType.GPU) ||
            activeKey.startsWith(IHardwareType.USB) ||
            activeKey.startsWith(IHardwareType.PCIe)
          ) {
            setActiveKey("cpu-0");
          }
          setRemoveItemKey("");
          setRemovePciVisible(false);
        }}
        onCancel={() => {
          form.setFieldsValue({ count: 1 });
          setRemovePciVisible(false);
        }}
        visible={removePciVisible}
        setVisible={setRemovePciVisible}
        description={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "template.create.vm.remove.config.confirm.description",
              defaultMessage:
                "When creating multiple virtual machines from a template, the following configurations will be cleared:\n\n\n- Added GPU, USB, and PCIe devices\n- Manually specified IP addresses",
            })}
          </ReactMarkdown>
        }
      />
    </>
  );
};

export default React.memo(HardwareInfo);
