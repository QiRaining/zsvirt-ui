import { useLazyQuery } from "@apollo/client";
import { Icon, type IconTypes } from "@zstack/icon";
import { guestOsTypeList } from "@zstack/virtualization-resource/src/gql/image.gql";
import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import { Form, Select } from "@zstack/zsphere-components";
import { ImagePlatform as Platform } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import React, { useContext, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

// 需要 CPU 兼容模式的 OS 列表
export const CPU_COMPAT_OS_LIST = new Set([
  "Rocky Linux 9",
  "openEuler 24.03",
  "RHEL 10",
  "WindowsServer 2025",
]);

// Windows NT 4.0 需要使用 pcnet 网卡型号
const WINDOWS_NT_OS = "Windows NT 4.0";

/** 根据平台和具体 OS 版本获取默认网卡型号 */
export const getNicTypeByOs = (
  platform: string,
  osRelease?: string,
): string => {
  if (platform === Platform.Linux) {
    return "virtio";
  }
  if (osRelease === WINDOWS_NT_OS) {
    return "pcnet";
  }
  return "e1000";
};

/** 批量更新表单中所有网卡的 nicType */
const updateAllNicTypes = (form: any, nicType: string) => {
  const allValues = form.getFieldsValue();
  const updates: Record<string, string> = {};
  for (const key of Object.keys(allValues)) {
    if (key.startsWith("nicType-")) {
      updates[key] = nicType;
    }
  }
  if (Object.keys(updates).length > 0) {
    form.setFieldsValue(updates);
  }
};

interface IProps {
  form: any;
  source: any;
}

const { Item } = Form;
const { Option } = Select;

const MARGIN_BOTTOM_0_STYLE = { marginBottom: 0 } as const;

const platformOptions = [
  { name: "Linux", value: Platform.Linux, iconType: "linux" },
  { name: "Windows", value: Platform.Windows, iconType: "windows" },
  { name: "Other", value: Platform.Other, iconType: "file-fill" },
];

const Os: React.FC<IProps> = ({ form, source }) => {
  const intl = useIntl();
  const disabledConfig = useContext(ConfigContext);
  const sourceType = source?.__typename ?? "VmInstance";

  const [platformList, setPlatformList] = useState<Array<any>>([{}]);

  const [currentOsOptions, setCurrentOsOptions] = useState<Array<any>>([]);

  const [getGuestOsTypeList] = useLazyQuery(guestOsTypeList, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      const { list } = data?.guestOsTypeList ?? {};
      const _list = list.map((item: any) => {
        if (item.platform === "Linux") {
          //
          const otherLinux: any[] = item.children
            .map((t: any) => t.children)
            .reduce((acc: any[], val: any[]) => acc.concat(val), [])
            .filter((t: any) => t.osRelease !== "Linux");

          const linux: any[] = item.children
            .map((t: any) => t.children)
            .reduce((acc: any[], val: any[]) => acc.concat(val), [])
            .filter((t: any) => t.osRelease === "Linux");

          return {
            ...item,
            children: [...linux, ...otherLinux],
          };
        }

        if (item.platform === Platform.Other) {
          const othersOs: any[] = item.children
            .map((t: any) => t.children)
            .reduce((acc: any[], val: any[]) => acc.concat(val), [])
            .filter((t: any) => t.osRelease !== Platform.Other);

          const other: any[] = item.children
            .map((t: any) => t.children)
            .reduce((acc: any[], val: any[]) => acc.concat(val), [])
            .filter((t: any) => t.osRelease === Platform.Other);

          return {
            ...item,
            children: [...other, ...othersOs],
          };
        }
        return {
          ...item,
          children: item.children
            .map((t: any) => t.children)
            .reduce((acc: any[], val: any[]) => acc.concat(val), []),
        };
      });
      //这里怪怪的
      const platform =
        sourceType === "VmInstance" ? source?.platform : Platform.Linux;
      const initOsOptions =
        _list?.filter((t: any) => t.platform === platform)?.[0]?.children ?? [];
      setPlatformList(_list || []);
      setCurrentOsOptions(initOsOptions);
    },
  });

  useMount(() => {
    getGuestOsTypeList();
  });

  //切换平台时默认选中os
  const changePlatform = (platform: Platform) => {
    const initOsOptions =
      platformList?.filter((t) => t.platform === platform)?.[0]?.children ?? [];
    setCurrentOsOptions(initOsOptions);
    const defaultOs = initOsOptions?.[0]?.osRelease;
    const nicType = getNicTypeByOs(platform, defaultOs);
    let fileds = [
      { name: "guest", value: platform },
      { name: "os", value: defaultOs },
    ];
    updateAllNicTypes(form, nicType);

    // Windows NT 4.0 联动 CPU 模式为 pentium
    if (defaultOs === WINDOWS_NT_OS) {
      fileds.push({ name: "CPUMode", value: "pentium" });
    }

    if (sourceType !== "VmInstance") {
      fileds = fileds.concat([
        {
          name: "busType-0",
          value: platform === Platform.Linux ? "virtio" : "ide",
        },
      ]);
      if (platform === Platform.Windows) {
        fileds.push({ name: "emulateHyperV", value: true });
      } else {
        const runPath = form.getFieldValue("runPath")?.[0];
        let emulateHyperV = false;
        if (runPath?.__typename === "HostVO") {
          emulateHyperV =
            runPath?.cluster?.resourceConfigValue?.vmEmulateHyperV === "true";
        } else if (runPath?.__typename === "Cluster") {
          emulateHyperV =
            runPath?.resourceConfigValue?.vmEmulateHyperV === "true";
        }
        fileds.push({ name: "emulateHyperV", value: emulateHyperV });
      }
    }
    form.setFields(fileds);
  };

  useEffect(() => {
    if (currentOsOptions && sourceType !== "VmInstance") {
      form.setFieldsValue({
        guest: currentOsOptions?.[0]?.platform,
        os: currentOsOptions?.[0]?.osRelease,
      });
    }
  }, [currentOsOptions, sourceType]);

  const handleOsChange = (value: string) => {
    // OS 版本变化联动所有网卡型号（创建和修改配置均生效）
    const guest = form.getFieldValue("guest");
    updateAllNicTypes(form, getNicTypeByOs(guest, value));

    // Windows NT 4.0 联动 CPU 模式为 pentium，切走时恢复 none
    if (value === WINDOWS_NT_OS) {
      form.setFieldsValue({ CPUMode: "pentium" });
    } else if (form.getFieldValue("CPUMode") === "pentium") {
      form.setFieldsValue({ CPUMode: "none" });
    }

    if (sourceType !== "VmInstance") {
      const cpuMode = form.getFieldValue("CPUMode");
      if (
        (!cpuMode || cpuMode.toLowerCase() === "none") &&
        CPU_COMPAT_OS_LIST.has(value)
      ) {
        form.setFieldsValue({ CPUMode: "host-model" });
      }
    }
  };

  return (
    <Item
      label={intl.formatMessage({
        id: "guestOsType",
        defaultMessage: "OS",
      })}
      className={styles.guestOsItem}
    >
      <Item
        tooltip={disabledConfig.tooltip}
        name="guest"
        style={MARGIN_BOTTOM_0_STYLE}
      >
        <Select
          disabled={disabledConfig.disabled}
          width={160}
          onChange={changePlatform}
        >
          {platformOptions.map((it) => (
            <Option value={it.value} key={it.value}>
              <Icon
                className={styles.fixIcon}
                type={it.iconType as IconTypes}
                color="neutral"
              />
              {it.name}
            </Option>
          ))}
        </Select>
      </Item>
      <Item
        tooltip={disabledConfig.tooltip}
        name="os"
        shouldUpdate={(pre, cur) => pre.guest !== cur.guest}
        style={MARGIN_BOTTOM_0_STYLE}
      >
        <Select
          disabled={disabledConfig.disabled}
          width={236}
          listHeight={320}
          onChange={handleOsChange}
        >
          {currentOsOptions?.map((it) => (
            <Option key={it.osRelease} value={it.osRelease}>
              {it.osRelease}
            </Option>
          ))}
        </Select>
      </Item>
    </Item>
  );
};

export default React.memo(Os);
