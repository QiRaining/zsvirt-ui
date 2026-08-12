import type { TreeResourceType } from "@zstack/zsphere-types";

enum TopTabType {
  IscsiServer = "virtualization.iscsi.server",
  FiberChannelStorage = "virtualization.fiber.channel.storage",
  NvmeServer = "virtualization.nvme.server",
}

export const handleResourceChange = (
  resourceType: string,
  inventory: any,
  activeMenuKey: TopTabType,
  selectedKeys: string[],
  setSelectedKeys: (selectedKeys: string[]) => void,
  loadTreeData: (params: {
    key: string;
    flag: TreeResourceType;
    activeMenuKey: TopTabType;
  }) => void,
) => {
  if (inventory?.actionType === "delete") {
    setSelectedKeys(["-1"]);
  }
  const key = selectedKeys.length > 0 ? selectedKeys[0] : "-1";
  loadTreeData({
    key,
    flag: resourceType as TreeResourceType,
    activeMenuKey,
  });
};
