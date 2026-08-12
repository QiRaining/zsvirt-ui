import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { getNicTypeByOs } from "@zstack/virtualization-resource/src/pages/vm/create/basic-config/os";
import { Form } from "@zstack/zsphere-components";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { CpuArchitecture, ImageBootMode } from "@zstack/zsphere-types";
import { Dropdown, Tabs } from "antd";
import { keys, range } from "lodash-es";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { CreateInstanceContext } from "../../context";
import CdRomCard from "./cdrom";
import CPUCard from "./cpu";
import DiskCard, { SetDiskQosType } from "./disk";
import GPUCard from "./gpu";
import HardwareItem from "./hardware-Item-for-create";
import { IHardwareType } from "./hardware-Item-for-create/utils";
import MemoryCard from "./memory";
import NetCard from "./netcard";
import OtherCard from "./other";
import PcieCard from "./pcie";
import TpmCard from "./tpm";
import USBCard from "./usb";

import styles from "./style.module.less";

interface IProps {
  form: any;
  visible?: boolean;
}

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

interface HardwareItemInterface {
  label: (index?: number) => React.ReactElement;
  type: string;
  children: React.ReactElement;
  key: string;
  closable?: boolean;
  remove?: "Detach" | "Delete";
}

const HardwareInfo: React.FC<IProps> = ({ form, visible }) => {
  const intl = useIntl();

  const { zoneUuid, realSource: source } = useContext(CreateInstanceContext);

  // 查询可用的密钥提供程序，用于 Win11 自动添加 TPM 的前置条件判断
  const { data: kmsCountData } = useQuery(AVAILABLE_KEY_PROVIDERS);
  const hasAvailableKeyProvider =
    (kmsCountData?.availableKeyProviders?.total ?? 0) > 0;
  // 监听 guest 和 os 字段变化，用于 Win11 自动添加/移除 TPM
  const guest = Form.useWatch("guest", form);
  const os = Form.useWatch("os", form);
  const bootMode = Form.useWatch("bootMode", form);
  const isWin11 = guest === "Windows" && os === "Windows 11";
  const prevIsWin11Ref = useRef(false);
  const win11TpmAddedRef = useRef(false); // 标记是否已因 Win11 自动添加了 TPM

  const [activeKey, setActiveKey] = useState("cpu-0"); //tab激活

  const [removePciVisible, setRemovePciVisible] = useState(false);

  const [removeItemKey, setRemoveItemKey] = useState("");

  //可多个加入资源
  const [volumeItemList, setVolumeItemList] = useState<HardwareItemInterface[]>(
    [
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
    ],
  );
  const [nicItemList, setNicItemList] = useState<HardwareItemInterface[]>([
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
        <NetCard form={form} index={0} zoneUuid={zoneUuid} source={source} />
      ),
      type: "netcard",
      key: "netcard-0",
      closable: false,
    },
  ]);
  const [cdromItemList, setCdromItemList] = useState<HardwareItemInterface[]>([
    {
      label: () => (
        <HardwareItem
          showErrorBackground={true}
          type={IHardwareType.Cdrom}
          form={form}
          flagKey={`${IHardwareType.Cdrom}-0`}
          updateFieldName="cdRomList-0"
          setRemoveItemKey={setRemoveItemKey}
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
  const [usbItemList, setUsbItemList] = useState<HardwareItemInterface[]>([]);
  const [gpuItemList, setGpuItemList] = useState<HardwareItemInterface[]>([]);
  const [pcieItemList, setPcieItemList] = useState<HardwareItemInterface[]>([]);
  const [tpmItemList, setTpmItemList] = useState<HardwareItemInterface[]>([]);

  const [defaultDiskNum, setDefaultDiskNum] = useState<number>(24);

  const [resourceNum, setResourceNum] = useState<any>({
    [IHardwareType.Disk]: 1,
    [IHardwareType.Netcard]: 1,
    [IHardwareType.USB]: 0,
    [IHardwareType.Cdrom]: 1,
    [IHardwareType.PCIe]: 0,
    [IHardwareType.GPU]: 0,
    [IHardwareType.TPM]: 0,
  });

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
      children: <CPUCard form={form} source={source} />,
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
      children: <MemoryCard form={form} />,
      type: "memory",
      key: "memory-0",
      closable: false,
    },
  ];

  const otherDeviceItems: HardwareItemInterface[] = [
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
      children: <OtherCard form={form} source={source} />,
      type: "other",
      key: "other-0",
      closable: false,
    },
  ];

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

  // Win11 联动：自动添加/移除 TPM
  useEffect(() => {
    const runPath = form.getFieldValue("runPath")?.[0];
    const isArm =
      runPath?.architecture === CpuArchitecture.aarch64 ||
      source?.architecture === CpuArchitecture.aarch64;
    if (isArm) {
      return;
    }

    if (isWin11) {
      // Win11 状态下：若满足前置条件且尚未自动添加 TPM，则自动添加
      if (!win11TpmAddedRef.current) {
        const currentBootMode = form.getFieldValue("bootMode");
        const isUefiMode = currentBootMode === ImageBootMode.UEFI;
        const currentTpmNum = tpmItemList.filter((item) => !item.remove).length;
        if (hasAvailableKeyProvider && isUefiMode && currentTpmNum === 0) {
          addHardwareItem(IHardwareType.TPM);
          win11TpmAddedRef.current = true;
        }
      }
      prevIsWin11Ref.current = true;
    } else if (prevIsWin11Ref.current) {
      // 从 Win11 切换为非 Win11：移除 TPM
      prevIsWin11Ref.current = false;
      win11TpmAddedRef.current = false;
      const activeTpmItems = tpmItemList.filter((item) => !item.remove);
      if (activeTpmItems.length > 0) {
        activeTpmItems.forEach((item) => {
          removeHardwareList(IHardwareType.TPM, item.key, "Delete");
        });
      }
    }
  }, [isWin11, hasAvailableKeyProvider, bootMode]);

  const removeHardwareList = (
    type: IHardwareType,
    key: string,
    policy: "Detach" | "Delete" = "Detach",
  ) => {
    const [itemList, setItemList] = getListByType(type);
    itemList.find((it: HardwareItemInterface) => it.key === key)!.remove =
      policy;

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
      case IHardwareType.TPM:
        form.setFields([{ name: "tpmEnabled", value: false }]);
        form.setFields([{ name: "tpmVersion", value: undefined }]);
        break;
    }
    setActiveKey("cpu-0");
  };

  //最多硬盘数量逻辑
  const [queryMaxDiskNum] = useLazyQuery(GLOBAL_CONFIG, {
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
  const getHardwareMenuItems = useCallback(
    (hasVgpuDevice: boolean, disabledPci: boolean, formValues?: any) => {
      const diskNum = volumeItemList?.filter((item) => !item.remove)?.length;
      const cdRomNum = cdromItemList?.filter((item) => !item.remove).length;
      const usbNum = usbItemList?.filter((item) => !item.remove).length;
      const tpmNum = tpmItemList?.filter((item) => !item.remove).length;

      // ARM 架构不支持 TPM，直接隐藏
      const runPath = formValues?.runPath?.[0];
      const isArm =
        runPath?.architecture === CpuArchitecture.aarch64 ||
        source?.architecture === CpuArchitecture.aarch64;
      // TPM 前置条件检查
      const checkTpmConditions = () => {
        if (!formValues) {
          return { disabled: false, tooltip: null };
        }

        // 检查平台是否有可用的密钥提供程序
        const bootMode = formValues?.bootMode;
        const isUefiMode = bootMode === ImageBootMode.UEFI;
        const isDisabled = !hasAvailableKeyProvider || !isUefiMode;

        let tooltipContent = null;
        if (isDisabled && tpmNum === 0) {
          const tooltipText = intl.formatMessage({
            id: "tpm.disabled.tooltip",
            defaultMessage: `Cannot add TPM. Ensure the following requirements are met:

- You have added a valid key provider to the platform. If you are using the native key provider, perform a backup first.
- You have set the virtual machine BIOS mode to UEFI.`,
          });
          tooltipContent = <ReactMarkdown>{tooltipText}</ReactMarkdown>;
        }

        return {
          disabled: isDisabled || tpmNum > 0,
          tooltip: tooltipContent,
        };
      };

      const tpmConditions = checkTpmConditions();

      return [
        {
          key: "disk",
          label: intl.formatMessage(
            {
              id: "virtualization.hardware.to.be.selected.item.name.diskNum",
              defaultMessage: "Disk ({diskNum}/{defaultDiskNum})",
            },
            {
              diskNum,
              defaultDiskNum,
            },
          ),
          disabled: diskNum > 23,
          onClick: () => addHardwareItem(IHardwareType.Disk),
        },
        {
          key: "netcard",
          label: intl.formatMessage({
            id: "virtualization.hardware.to.be.selected.item.name.network.card",
            defaultMessage: "NIC",
          }),
          onClick: () => addHardwareItem(IHardwareType.Netcard),
        },
        {
          key: "cdrom",
          label: intl.formatMessage(
            {
              id: "virtualization.hardware.to.be.selected.item.name.cdRom",
              defaultMessage: "CD/DVD Drive ({cdRomNum}/3)",
            },
            {
              cdRomNum,
            },
          ),
          disabled: cdRomNum > 2,
          onClick: () => addHardwareItem(IHardwareType.Cdrom),
        },
        {
          key: "gpu",
          label: intl.formatMessage({
            id: "virtualization.hardware.to.be.selected.item.name.gpu",
            defaultMessage: "GPU Device",
          }),
          disabled: hasVgpuDevice || disabledPci,
          onClick: () => addHardwareItem(IHardwareType.GPU),
        },
        {
          key: "usb",
          label: intl.formatMessage(
            {
              id: "virtualization.hardware.to.be.selected.item.name.usb",
              defaultMessage: "USB Device ({usbNum}/1)",
            },
            {
              usbNum,
            },
          ),
          disabled: usbNum > 0 || disabledPci,
          onClick: () => addHardwareItem(IHardwareType.USB),
        },
        {
          key: "pcie",
          label: intl.formatMessage({
            id: "virtualization.hardware.to.be.selected.item.name.pcie",
            defaultMessage: "PCIe Device",
          }),
          disabled: disabledPci,
          onClick: () => addHardwareItem(IHardwareType.PCIe),
        },
        {
          key: "tpm",
          label: tpmConditions.disabled ? (
            <Tooltip title={tpmConditions.tooltip}>
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
          ),
          disabled: tpmConditions.disabled,
          onClick: () => addHardwareItem(IHardwareType.TPM),
        },
      ].filter((item) => !(isArm && item.key === "tpm"));
    },
    [
      intl,
      cdromItemList,
      usbItemList,
      volumeItemList,
      nicItemList,
      gpuItemList,
      pcieItemList,
      tpmItemList,
      defaultDiskNum,
      hasAvailableKeyProvider,
    ],
  );

  // 将硬件类型的处理逻辑抽象为单独的函数
  const handleHardwareType = (
    hardwareType: IHardwareType,
    addedNum: number,
  ) => {
    let childElement: JSX.Element | null = null;
    let updateFieldName: string = "";
    let initValue: any = {};

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

    switch (hardwareType) {
      case IHardwareType.Cdrom:
        childElement = (
          <CdRomCard form={form} index={addedNum} zoneUuid={zoneUuid} />
        );
        updateFieldName = `cdRomList-${addedNum}`;
        initValue = {
          [`cdRomList-${addedNum}`]: [],
          [`cdRomName-${addedNum}`]: `cdRomName-${addedNum}`,
        };
        break;
      case IHardwareType.Netcard:
        childElement = (
          <NetCard
            isEdit
            source={source}
            form={form}
            index={addedNum}
            zoneUuid={zoneUuid}
          />
        );
        updateFieldName = `l3NetworkUuids-${addedNum}`;
        initValue = {
          [`netCardState-${addedNum}`]: true,
          [`l3NetworkUuids-${addedNum}`]: [],
          [`nicType-${addedNum}`]: getNicTypeByOs(guest, os),
          [`customMac-${addedNum}`]: undefined,
          [`staticIp-${addedNum}`]: undefined,
          [`securityGroup-${addedNum}`]: [],
          [`nicMultiQueueNum-${addedNum}`]: multiInitNum,
          [`netCardQosEnabled-${addedNum}`]: false,
          [`outboundBandwidth-${addedNum}`]: {
            number: undefined,
            unit: "Mbps",
          },
          [`inboundBandwidth-${addedNum}`]: { number: undefined, unit: "Mbps" },
        };
        break;
      case IHardwareType.Disk:
        childElement = (
          <DiskCard
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
          [`busType-${addedNum}`]: guest === "Other" ? "ide" : "virtio",
          [`allocationType-${addedNum}`]: "ThinProvisioning",
          [`cacheMode-${addedNum}`]: "none",
          [`aio-${addedNum}`]: false,
          [`diskSharable-${addedNum}`]: false,
        };
        break;
      case IHardwareType.USB:
        childElement = (
          <USBCard
            form={form}
            index={addedNum}
            zoneUuid={zoneUuid}
            source={source}
          />
        );
        updateFieldName = `usbDivice-${addedNum}`;
        break;
      case IHardwareType.GPU:
        childElement = <GPUCard form={form} index={addedNum} source={source} />;
        updateFieldName = `gpuDevice-${addedNum}`;
        break;
      case IHardwareType.PCIe:
        childElement = (
          <PcieCard form={form} index={addedNum} source={source} />
        );
        updateFieldName = `pcieDevice-${addedNum}`;
        break;
      case IHardwareType.TPM:
        childElement = <TpmCard form={form} />;
        updateFieldName = "tpmEnabled";
        initValue = {
          tpmEnabled: true,
          tpmVersion: "2.0",
        };
        break;
      // 添加其他硬件类型的处理...
      default:
      // 默认处理逻辑
    }

    return { childElement, updateFieldName, initValue };
  };

  const addHardwareItem = (hardwareType: IHardwareType) => {
    const [_itemList, setItemList] = getListByType(hardwareType) ?? [];
    const addedNum = resourceNum[hardwareType];

    if (addedNum < 0) {
      return;
    }

    const { childElement, updateFieldName, initValue } = handleHardwareType(
      hardwareType,
      addedNum,
    );

    const stableIndex = addedNum;

    setItemList((prevItemList: any) => [
      ...prevItemList,
      {
        label: (index?: number) => (
          <HardwareItem
            type={hardwareType}
            form={form}
            flagKey={`${hardwareType}-${index}`}
            updateFieldName={updateFieldName}
            setRemoveItemKey={() =>
              setRemoveItemKey(`${hardwareType}-${stableIndex}`)
            }
            showErrorBackground={true}
          />
        ),
        children: childElement,
        type: `${hardwareType}-${stableIndex}`,
        key: `${hardwareType}-${stableIndex}`,
        closable: true,
      },
    ]);

    setResourceNum((prevResourceNum: any) => ({
      ...prevResourceNum,
      [hardwareType]: addedNum + 1,
    }));

    requestAnimationFrame(() =>
      form.setFields(
        keys(initValue).map((key: string) => ({
          name: key,
          value: initValue[key],
        })),
      ),
    );
  };

  const onChange = (newActiveKey: string) => setActiveKey(newActiveKey);

  // 生成 Tabs items 数组
  const tabItems = useMemo(() => {
    const items: any[] = [];

    // CPU 和 Memory
    cpuAndMemory.forEach((t) => {
      items.push({
        key: t.key,
        label: t.label(),
        children: t.children,
        forceRender: true,
        className: styles["tabPane-hardware"],
      });
    });

    // 硬盘列表
    volumeItemList
      .filter((item) => !item.remove)
      .forEach((t, index) => {
        items.push({
          key: t.key,
          label: t.label(index),
          children: t.children,
          forceRender: true,
          className: styles["tabPane-hardware"],
        });
      });

    // 网卡列表
    nicItemList
      .filter((item) => !item.remove)
      .forEach((t, index) => {
        items.push({
          key: t.key,
          label: t.label(index),
          children: React.cloneElement(t.children, { displayIndex: index }),
          forceRender: true,
          className: styles["tabPane-hardware"],
        });
      });

    // 光驱列表
    cdromItemList
      .filter((item) => !item.remove)
      .forEach((t, index) => {
        items.push({
          key: t.key,
          label: t.label(index),
          children: t.children,
          forceRender: true,
          className: styles["tabPane-hardware"],
        });
      });

    // GPU 列表
    gpuItemList
      .filter((item) => !item.remove)
      .forEach((t, index) => {
        items.push({
          key: t.key,
          label: t.label(index),
          children: t.children,
          forceRender: true,
          className: styles["tabPane-hardware"],
        });
      });

    // USB 列表
    usbItemList
      .filter((item) => !item.remove)
      .forEach((t, index) => {
        items.push({
          key: t.key,
          label: t.label(index),
          children: t.children,
          forceRender: true,
          className: styles["tabPane-hardware"],
        });
      });

    // PCIe 列表
    pcieItemList
      .filter((item) => !item.remove)
      .forEach((t, index) => {
        items.push({
          key: t.key,
          label: t.label(index),
          children: t.children,
          forceRender: true,
          className: styles["tabPane-hardware"],
        });
      });

    // TPM
    tpmItemList
      .filter((item) => !item.remove)
      .forEach((t, index) => {
        items.push({
          key: t.key,
          label: t.label(index),
          children: t.children,
          forceRender: true,
          className: styles["tabPane-hardware"],
        });
      });

    // 其他设备
    otherDeviceItems.forEach((t) => {
      items.push({
        key: t.key,
        label: t.label(),
        children: t.children,
        forceRender: true,
        className: styles["tabPane-hardware"],
      });
    });

    return items;
  }, [
    cpuAndMemory,
    volumeItemList,
    nicItemList,
    cdromItemList,
    gpuItemList,
    usbItemList,
    pcieItemList,
    tpmItemList,
    otherDeviceItems,
  ]);

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
                const filterKeys = keys(cur).filter(
                  (key) => key.indexOf("gpuDevice") > -1,
                );
                return (
                  filterKeys.some((key) => pre[key] !== cur[key]) ||
                  pre.count !== cur.count ||
                  pre.bootMode !== cur.bootMode
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
                    pcieItemList.some((t) => t.remove !== "Delete"))
                ) {
                  setRemovePciVisible(true);
                }
                return (
                  <Dropdown
                    placement="bottomRight"
                    menu={{
                      items: getHardwareMenuItems(
                        hasVgpuDevice,
                        disabledPci,
                        values,
                      ),
                    }}
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
          onChange={onChange}
          activeKey={activeKey}
          className={styles.tab}
          tabPosition="left"
          items={tabItems}
        />
      </div>

      <DialogWeak
        title={String(
          intl.formatMessage({
            id: "vm.create.form.clear.hardware.modal.title",
            defaultMessage: "The Added Hardware Devices will be Cleared",
          }),
        )}
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
        description={intl.formatMessage({
          id: "vm.create.form.clear.hardware.modal.description",
          defaultMessage:
            "When creating VMs in bulk, adding GPU, USB, or PCIe devices is not supported. The system will clear the added devices. proceed with caution.",
        })}
      />
    </>
  );
};

export default React.memo(HardwareInfo);
