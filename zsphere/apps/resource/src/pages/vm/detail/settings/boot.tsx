import { List, ResourceName } from "@zstack/zsphere-components";
import {
  VmBootDevice,
  ImageBootMode,
  ImagePlatform,
} from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IVM;
  resourceConfig: any;
}

const BootSetting: React.FC<IProps> = ({ detail, resourceConfig }) => {
  const intl = useIntl();

  const transformBootOrder = (order: VmBootDevice) => {
    switch (order) {
      case VmBootDevice.CdRom:
        return intl.formatMessage({
          id: "vm.bootOrder.cdrom",
          defaultMessage: "CD/DVD Drive",
        });
      case VmBootDevice.HardDisk:
        return intl.formatMessage({ id: "osd1", defaultMessage: "Disk 1" });
      case VmBootDevice.Network:
        return intl.formatMessage({ id: "network", defaultMessage: "Network" });
    }
  };

  const genBiosMode = (mode: string | undefined) => {
    if (mode === ImageBootMode.UEFI_WITH_CSM) {
      return ImageBootMode.UEFI;
    }
    return mode;
  };

  // 检查是否为 UEFI 模式
  const isUefiMode =
    genBiosMode(detail?.systemTag?.bootMode) === ImageBootMode.UEFI;
  // 获取 Secure Boot 状态：优先使用 VM 级 ResourceConfig(enable.uefi.secure.boot)
  const secureBoot =
    resourceConfig?.["enable.uefi.secure.boot"]?.value === "true";

  const list = React.useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "vm.bootOrder",
          defaultMessage: "Boot Order",
        }),
        value: detail.bootOrder?.orders
          .map((it) => transformBootOrder(it))
          .join(" > "),
      },
      {
        label: intl.formatMessage({
          id: "biosMode",
          defaultMessage: "BIOS Mode",
        }),
        value: (
          <ResourceName value={genBiosMode(detail?.systemTag?.bootMode)} />
        ),
      },
      {
        label: intl.formatMessage({
          id: "secureBoot",
          defaultMessage: "Secure Boot",
        }),
        value: <ResourceName value={secureBoot} />,
        show: isUefiMode,
      },
      {
        label: intl.formatMessage({
          id: "compatibility",
          defaultMessage: "CSM",
        }),
        value: (
          <ResourceName
            value={detail?.systemTag?.bootMode === ImageBootMode.UEFI_WITH_CSM}
          />
        ),
        show: detail?.systemTag?.bootMode === ImageBootMode.UEFI_WITH_CSM,
      },
      {
        label: intl.formatMessage({
          id: "bios.menu.splash.timeout",
          defaultMessage: "BIOS Post Delay",
        }),
        value: (
          <ResourceName
            value={formatSecToPeriod(
              +resourceConfig?.bootMenuSplashTimeout?.value / 1000,
              intl,
            )}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "BIOSSync",
          defaultMessage: "Sync with Host BIOS Time",
        }),
        value: (
          <ResourceName value={detail?.systemTag?.clockTrack === "host"} />
        ),
        show: detail?.platform === ImagePlatform.Windows,
      },
    ];
  }, [intl, detail, resourceConfig, isUefiMode, secureBoot]);

  return <List list={list} />;
};

export default BootSetting;
