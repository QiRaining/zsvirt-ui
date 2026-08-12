import { Constant } from "@zstack/zsphere-components";
import { ConstantType, ConstantEnum } from "@zstack/zsphere-constant";
import type { Sensor } from "@zstack/zsphere-types/graphql";
import React from "react";
import type { IntlShape } from "react-intl";

export function formatValue(intl: IntlShape, { value, type }: Sensor) {
  if (!value) {
    return null;
  }
  let val = parseFloat(value);
  if (Number.isNaN(val)) {
    return null;
  }
  val = Math.round(val * 100) / 100;
  let unit = "";
  switch (type) {
    case "Temperature":
      if (value.endsWith("degrees C")) {
        unit = intl.formatMessage({ id: "celsius", defaultMessage: "Degree Celsius" });
      }
      break;
    case "Voltage":
      if (value.endsWith("Volts")) {
        unit = intl.formatMessage({ id: "volts", defaultMessage: "V" });
      }
      break;
    case "Current":
      if (value.endsWith("Amps")) {
        unit = intl.formatMessage({ id: "amperes", defaultMessage: "A" });
      }
      break;
    case "Fan":
      if (value.endsWith("RPM")) {
        unit = intl.formatMessage({ id: "rpm", defaultMessage: "RPM" });
      }
      break;
  }
  if (unit) {
    return `${val} ${unit}`;
  }
  return value;
}

export function renderStatus(current: Sensor) {
  const status = current.status?.toLowerCase() ?? "";
  let value: ConstantEnum;
  if (status === "ok") {
    value = ConstantEnum.Normal;
  } else if (["nc", "cr", "nr", "uf"].indexOf(status) !== -1) {
    value = ConstantEnum.Abnormal;
  } else {
    value = ConstantEnum.Unknown;
  }
  return <Constant value={value} enumType={ConstantType.HardwareState} />;
}
