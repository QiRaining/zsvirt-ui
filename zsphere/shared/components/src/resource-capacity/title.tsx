import { Illustration, IllustrationTypes } from "@zstack/zsphere-illustration";
import { Space } from "antd";
import React, { FC } from "react";
import { useIntl } from "react-intl";

import type { ITitleProps } from "./type";

const Title: FC<ITitleProps> = ({ type }) => {
  const intl = useIntl();
  let icon: IllustrationTypes = "cpu";
  let title = "";

  switch (type) {
    case "cpu":
      icon = "cpu";
      title = "CPU";
      break;
    case "memory":
      icon = "memory";
      title = intl.formatMessage({ id: "memory", defaultMessage: "Memory" });
      break;
    case "storage":
      icon = "disk";
      title = intl.formatMessage({ id: "storage", defaultMessage: "Storage" });
      break;
  }
  return (
    <Space size={10} align="center">
      <Illustration type={icon} size={24} />
      <span>{title}</span>
    </Space>
  );
};

export default Title;
