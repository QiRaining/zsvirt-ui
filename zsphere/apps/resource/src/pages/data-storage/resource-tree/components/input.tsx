import { Icon } from "@zstack/icon";
import { Input } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import { getPlaceholderText } from "../hooks/constant";

enum TopTabType {
  IscsiServer = "virtualization.iscsi.server",
  FiberChannelStorage = "virtualization.fiber.channel.storage",
  NvmeServer = "virtualization.nvme.server",
}

interface IInputProps {
  searchText: string;
  handleSearch: (value: string) => void;
  activeMenuKey: TopTabType;
}

const TreeInput: React.FC<IInputProps> = ({
  searchText,
  handleSearch,
  activeMenuKey,
}) => {
  const intl = useIntl();
  return (
    <Input
      placeholder={getPlaceholderText(activeMenuKey, intl)}
      allowClear
      value={searchText}
      onChange={(e) => handleSearch(e.target.value)}
      suffix={<Icon type="search" />}
    />
  );
};

export default TreeInput;
