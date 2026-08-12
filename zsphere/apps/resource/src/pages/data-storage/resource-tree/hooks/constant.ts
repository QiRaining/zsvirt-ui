import type { VirtualizationDirDataNode } from "@zstack/zsphere-types";
import type { IntlShape } from "react-intl";

import type { ITreeStatus } from "./types";

export const ROOT_UUID = "-1";
export const initData: VirtualizationDirDataNode[] = [];

enum TopTabType {
  IscsiServer = "virtualization.iscsi.server",
  FiberChannelStorage = "virtualization.fiber.channel.storage",
  NvmeServer = "virtualization.nvme.server",
}

export const initLocalStorageData = {
  expandedKeys: [],
  selectedKey: "-1",
  selectedResource: "",
} as ITreeStatus;

export const getPlaceholderText = (
  activeMenuKey: TopTabType,
  intl: IntlShape,
) => {
  switch (activeMenuKey) {
    case TopTabType.IscsiServer:
      return intl.formatMessage({
        id: "iscsi.server.placeholder",
        defaultMessage: "Search iSCSI Storage",
      });
    case TopTabType.FiberChannelStorage:
      return intl.formatMessage({
        id: "fiber.channel.placeholder",
        defaultMessage: "Search FC Storage",
      });
    case TopTabType.NvmeServer:
      return intl.formatMessage({
        id: "nvme.server.placeholder",
        defaultMessage: "Search NVMe Storage",
      });
    default:
      return intl.formatMessage({
        id: "iscsi.server.placeholder",
        defaultMessage: "Search iSCSI Storage",
      });
  }
};
