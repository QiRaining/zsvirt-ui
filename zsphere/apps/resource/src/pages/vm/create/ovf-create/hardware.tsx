import { Icon } from "@zstack/icon";
import { Tabs } from "antd";
import { keys } from "lodash-es";
import React, { useContext, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import { CreateInstanceContext } from "../context";
import HardwareItem from "../hardware-and-config/hardware/hardware-Item-for-create/import-instance";
import { IHardwareType } from "../hardware-and-config/hardware/hardware-Item-for-create/utils";
import NetCard from "./netcard";

import styles from "./style.module.less";

interface IProps {
  form: any;
  visible?: boolean;
}

interface HardwareItemInterface {
  label: (index?: number) => React.ReactElement;
  type: string;
  children: React.ReactElement;
  key: string;
  closable?: boolean;
  remove?: "Detach" | "Delete";
}

const HardwareInfo: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();

  const { zoneUuid, realSource: source } = useContext(CreateInstanceContext);

  const [activeKey, setActiveKey] = useState("netcard-0"); //tab激活

  const [removeItemKey, setRemoveItemKey] = useState("");

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

  const [resourceNum, setResourceNum] = useState<any>({
    [IHardwareType.Netcard]: 1,
  });

  const getListByType = (type: IHardwareType) => {
    const typeToList: any = {
      [IHardwareType.Netcard]: [nicItemList, setNicItemList],
    };
    return typeToList?.[type];
  };

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
    policy: "Delete",
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
    }
    setActiveKey("netcard-0");
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
      // const guest = form.getFieldValue('guest')

      let multiInitNum = "1";

      if (kvmAutoSetVmNicMultiqueue) {
        multiInitNum =
          (totalCoreNum as number) < 12 ? String(totalCoreNum) : "12";
      }

      initValue = {
        [`netCardState-${addedNum}`]: true,
        [`l3NetworkUuids-${addedNum}`]: [],
        [`nicType-${addedNum}`]: "virtio",
        [`customMac-${addedNum}`]: undefined,
        [`staticIp-${addedNum}`]: undefined,
        [`securityGroup-${addedNum}`]: [],
        [`nicMultiQueueNum-${addedNum}`]: multiInitNum,
        [`netCardQosEnabled-${addedNum}`]: false,
        [`outboundBandwidth-${addedNum}`]: { number: undefined, unit: "Mbps" },
        [`inboundBandwidth-${addedNum}`]: { number: undefined, unit: "Mbps" },
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
            role="none"
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
        items={nicItemList
          .filter((item) => !item.remove)
          .map((t, index) => {
            return {
              forceRender: true,
              label: t.label(index),
              key: t.key,
              children: t.children,
            };
          })}
      />
    </div>
  );
};

export default React.memo(HardwareInfo);
