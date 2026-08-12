import { Icon } from "@zstack/icon";
import type {
  VolumeSnapshot as IVolumeSnapshot,
  VolumeSnapshotGroup as IVolumeSnapshotGroup,
  Volume as IVolume,
} from "@zstack/zsphere-types/graphql";
import { formatStorageToObj } from "@zstack/zsphere-utils";
import { Tabs } from "antd";
import { keys as _keys } from "lodash-es";
import React, { useContext, useEffect, useState, useRef } from "react";
import { useIntl } from "react-intl";

import { CreateInstanceContext } from "../../../context";
import CPUCard from "./cpu";
import DiskCard, { SetDiskQosType } from "./disk";
import HardwareItem from "./hardware-Item-for-create";
import { IHardwareType } from "./hardware-Item-for-create/utils";
import { useQueryReleatedResource } from "./hooks";
import MemoryCard from "./memory";
import NetCard from "./netcard";
import OtherCard from "./other";
import TpmCard, { TpmConfigMethodEnum } from "./tpm";

import styles from "./style.module.less";

interface IProps {
  form: any;
  visible?: boolean;
  source?: IVolumeSnapshot | IVolumeSnapshotGroup;
}

interface HardwareItem {
  label: (index?: number) => React.ReactElement;
  type: string;
  children: React.ReactElement;
  key: string;
  closable?: boolean;
  remove?: "Detach" | "Delete";
}

const HardwareInfo: React.FC<IProps> = ({ form, visible }) => {
  const intl = useIntl();
  const initializedRef = useRef(false);

  const { zoneUuid, realSource: source } = useContext(CreateInstanceContext);
  const { volumeSnapshotRefs = [] } = source.group ?? source;
  const vmUuid = source?.group?.vmInstanceUuid ?? source?.vmInstanceUuid;
  const volumeUuids: string[] = volumeSnapshotRefs.map(
    (it: any) => it.volumeUuid,
  );
  const [activeKey, setActiveKey] = useState<string>("cpu-0"); //tab激活
  const [removeItemKey, setRemoveItemKey] = useState<string>("");
  const [volumeItemList, setVolumeItemList] = useState<HardwareItem[]>([]);
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
        <NetCard form={form} index={0} zoneUuid={zoneUuid} source={source} />
      ),
      type: "netcard",
      key: "netcard-0",
      closable: false,
    },
  ]);
  const [resourceNum, setResourceNum] = useState<any>({});
  const [tpmItemList, setTpmItemList] = useState<HardwareItem[]>([]);
  const relatedData = useQueryReleatedResource(vmUuid, volumeUuids);

  useEffect(() => {
    if (relatedData?.volumeList) {
      setResourceNum({
        [IHardwareType.Disk]: relatedData?.volumeList?.length,
        [IHardwareType.Netcard]: 1,
      });
    }
  }, [relatedData?.volumeList]);

  const getListByType = (type: IHardwareType) => {
    const typeToList: any = {
      [IHardwareType.Disk]: [volumeItemList, setVolumeItemList],
      [IHardwareType.Netcard]: [nicItemList, setNicItemList],
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

  const otherHardware = {
    label: () => (
      <HardwareItem
        showErrorBackground={true}
        type={IHardwareType.Other}
        form={form}
        flagKey={`${IHardwareType.Other}-0`}
        updateFieldName="motherboardType"
      />
    ),
    children: <OtherCard form={form} source={source} />,
    type: "other",
    key: "other-0",
    closable: false,
  };

  useEffect(() => {
    if (
      visible &&
      !initializedRef.current &&
      relatedData.volumeList.length > 0
    ) {
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

      const { volumeList } = relatedData;

      setVolumeItemList(
        volumeList.map((volume: any, index: number) => ({
          label: (_index?: number) => (
            <HardwareItem
              showErrorBackground
              type={IHardwareType.Disk}
              flagKey={`disk-${_index}`}
              form={form}
              updateFieldName={`diskSize-${index}`}
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

      let config: any = {};

      volumeList?.forEach((volume, index) => {
        if (volume.diskType === "volume") {
          //目前 快照创建虚拟机 busType 还未支持， 默认先写死为 virtio
          // let busType
          // if (volume.type === 'Root') busType = source?.systemTag?.vmDriver ? 'virtio' : 'ide'
          // else busType = volume?.systemTag?.capability ?? 'virtio'

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
            [`busType-${index}`]: "virtio",
            [`allocationType-${index}`]:
              volume?.systemTag?.VolumeProvisioningStrategy,
            [`cacheMode-${index}`]: volume?.resourceConfig?.vmcacheMode,
            [`aio-${index}`]: volume?.resourceConfig?.aionative === "true",
            [`diskSharable-${index}`]: volume?.isShareable,
            [`diskImage-${index}`]: volume.rootImage ? [volume.rootImage] : [],
          };
        }
      });
      // 检查虚拟机是否有TPM
      const isArm = source?.vmInstance?.architecture === "aarch64";
      const hasTpm = source?.vmInstance?.tpmList?.length > 0 && !isArm;
      if (hasTpm) {
        config = {
          ...config,
          tpmConfigMethod: TpmConfigMethodEnum.Retain,
          tpmVersion: "2.0",
        };
        setResourceNum((prev: any) => ({
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
        setResourceNum((prev: any) => ({
          ...prev,
          [IHardwareType.TPM]: 0,
        }));
      }

      const timeoutId = setTimeout(() => {
        form.setFields(
          _keys(config).map((key: string) => ({
            name: key,
            value: config[key],
          })),
        );
        initializedRef.current = true;
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [relatedData?.volumeList, visible, form, source]);

  useEffect(() => {
    if (!visible) {
      console.log(visible);
      initializedRef.current = false;
    }
  }, [visible]);

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
    }
    setActiveKey("cpu-0");
  };

  const addHardwareItem = (hardwareType: IHardwareType) => {
    const [itemList, setItemList] = getListByType(hardwareType) ?? [];
    const addedNum = resourceNum[hardwareType];

    let childEle;
    let updateFieldName: string = "";
    let initValue: any = {};

    if (hardwareType === IHardwareType.Netcard) {
      childEle = (
        <NetCard
          isEdit
          source={source}
          form={form}
          index={addedNum}
          zoneUuid={zoneUuid}
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

      let multiInitNum = "1";

      if (kvmAutoSetVmNicMultiqueue) {
        multiInitNum =
          (totalCoreNum as number) < 12 ? String(totalCoreNum) : "12";
      }

      initValue = {
        [`netCardState-${addedNum}`]: true,
        [`l3NetworkUuids-${addedNum}`]: [],
        [`nicType-${addedNum}`]: guest === "Linux" ? "virtio" : "e1000",
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
        />
      );
      updateFieldName = `diskSize-${addedNum}`;
      initValue = {
        [`diskCreateType-${addedNum}`]: "new",
        [`diskSize-${addedNum}`]: { number: 40, unit: "GB" },
        [`turnOnQoS-${addedNum}`]: false,
        [`bandwidthMode-${addedNum}`]: SetDiskQosType.SetBandwidthTotal,
        [`totalBandwidth-${addedNum}`]: { number: undefined, unit: "MB" },
        [`writeBandwidth-${addedNum}`]: { number: undefined, unit: "MB" },
        [`readBandwidth-${addedNum}`]: { number: undefined, unit: "MB" },
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
        _keys(initValue).map((key: string) => ({
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

            <div
              className={styles.action}
              onClick={() => addHardwareItem(IHardwareType.Netcard)}
            >
              <Icon type="plus" />
              {intl.formatMessage({
                id: "virtualization.add.nic",
                defaultMessage: "Add NIC",
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

          <Tabs.TabPane
            forceRender
            className={styles["tabPane-hardware"]}
            tab={otherHardware.label()}
            key={otherHardware.key}
          >
            {otherHardware.children}
          </Tabs.TabPane>

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
        </Tabs>
      </div>
    </>
  );
};

export default React.memo(HardwareInfo);
