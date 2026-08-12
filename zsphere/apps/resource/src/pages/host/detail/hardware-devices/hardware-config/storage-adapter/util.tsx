import { Text } from "@zstack/design";
import { Constant } from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import React from "react";

export function formatType(current: any) {
  if (current.type === "NVMe") {
    return current.transport?.length
      ? current.transport
          .map((item: string) => `NVMe over ${item.toUpperCase()}`)
          .join(" / ")
      : null;
  }
  return current.type;
}

export function renderState(current: any) {
  if (!current?.state) {
    // XXX: 后端暂时不支持获取状态
    return "-";
  }
  let value = ConstantEnum.Unknown;
  if (current.state === "Online") {
    value = ConstantEnum.Normal;
  } else if (current.state) {
    value = ConstantEnum.Abnormal;
  }
  return <Constant value={value} enumType={ConstantType.HardwareState} />;
}

export function renderIdentifier(current: any) {
  if (!current?.identifier) {
    return null;
  }
  if (current.type !== "FC") {
    return <Text>{current.identifier}</Text>;
  }
  const [wwnn, wwpn] = current.identifier.split(",");
  return <Text>{`WWNN: ${wwnn}, WWPN: ${wwpn}`}</Text>;
}
