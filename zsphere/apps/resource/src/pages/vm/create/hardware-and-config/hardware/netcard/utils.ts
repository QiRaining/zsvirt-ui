import _ from "lodash-es";

export const nicBandWidthList = ["Kbps", "Mbps", "Gbps"];

export const getValue = (networkOutboundBandwidth: any) =>
  (networkOutboundBandwidth?.number ?? 0) *
  1024 **
    (nicBandWidthList.findIndex(
      (unit) => unit === networkOutboundBandwidth?.unit,
    ) +
      1);
export const isEmpty = (val: string | number) =>
  val === 0 || val === "" || _.isNil(val);

export const validateBandwidth = (val: any, message: string) => {
  const min = getValue({ number: 8, unit: "Kbps" });
  const max = getValue({ number: 30, unit: "Gbps" });
  const value = getValue(val);
  const isOverSize = value < min || value > max;
  return !isOverSize || isEmpty(val.number)
    ? Promise.resolve()
    : Promise.reject(message);
};

const staticNetCardTypes = ["e1000", "rtl8139", "virtio", "pcnet"];
export const getNetCardType = (
  withSRIOV: boolean,
): { label: string; value: string }[] => {
  const netCardType = withSRIOV
    ? staticNetCardTypes.concat(["SR-IOV"])
    : staticNetCardTypes;

  return netCardType.map((item) => ({
    label: item,
    value: item,
  }));
};
