import { gql, useLazyQuery } from "@apollo/client";
import { Icon, type IconTypes } from "@zstack/icon";
import { Form, Select } from "@zstack/zsphere-components";
import { ImagePlatform as Platform } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import React, { useContext, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { ConfigContext } from "../../context";
import {
  getNicTypeByOs,
  updateAllNicTypes,
  WINDOWS_NT_OS,
} from "../../nic-utils";

import styles from "./style.module.less";

interface IProps {
  form: any;
  source: any;
}

const { Item } = Form;
const { Option } = Select;

const guestOsTypeList = gql`
  query guestOsTypeList {
    guestOsTypeList {
      list {
        platform
        children {
          guestName
          children {
            uuid
            platform
            name
            osRelease
            version
          }
        }
      }
    }
  }
`;

const platformOptions = [
  { name: "Linux", value: Platform.Linux, iconType: "linux" },
  { name: "Windows", value: Platform.Windows, iconType: "windows" },
];

const Os: React.FC<IProps> = ({ form, source }) => {
  const intl = useIntl();
  const disabledConfig = useContext(ConfigContext);
  const sourceType = source?.__typename ?? "VmInstance";
  const selectDisabled = useMemo(
    () =>
      ["VolumeSnapshotGroup", "BackupData"].includes(sourceType) ||
      disabledConfig.disabled,
    [disabledConfig?.disabled, sourceType],
  );
  const [platformList, setPlatformList] = useState<Array<any>>([{}]);

  const [currentOsOptions, setCurrentOsOptions] = useState<Array<any>>([]);

  const [getGuestOsTypeList] = useLazyQuery(guestOsTypeList, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      const { list } = data?.guestOsTypeList ?? { list: [] };
      const _list = list.map((item: any) => {
        if (item.platform === "Linux") {
          //
          const otherLinux = item.children
            .flatMap((t: any) => t.children)
            .filter((t: any) => t.osRelease !== "Linux");
          const linux = item.children
            .flatMap((t: any) => t.children)
            .filter((t: any) => t.osRelease === "Linux");
          return {
            ...item,
            children: [...linux, ...otherLinux],
          };
        }
        return {
          ...item,
          children: item.children.flatMap((t: any) => t.children),
        };
      });
      //这里怪怪的
      const platform =
        sourceType === "VmInstance"
          ? source?.platform
          : (source?.vmInstance?.platform ?? Platform.Linux);
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
    }
    form.setFields(fileds);
  };

  // 切换 OS 版本时联动所有网卡型号和 CPU 模式（所有场景均生效）
  const handleOsChange = (value: string) => {
    const guest = form.getFieldValue("guest");
    updateAllNicTypes(form, getNicTypeByOs(guest, value));

    // Windows NT 4.0 联动 CPU 模式为 pentium，切走时恢复 none
    if (value === WINDOWS_NT_OS) {
      form.setFieldsValue({ CPUMode: "pentium" });
    } else if (form.getFieldValue("CPUMode") === "pentium") {
      form.setFieldsValue({ CPUMode: "none" });
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
        style={{ marginBottom: 0 }}
      >
        <Select disabled={selectDisabled} width={160} onChange={changePlatform}>
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
        style={{ marginBottom: 0 }}
      >
        <Select
          disabled={selectDisabled}
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
