import { split, find } from "lodash-es";

const speedUnits = [
  {
    displayName: "KB/s",
    value: "KB",
  },
  {
    displayName: "MB/s",
    value: "MB",
  },
  {
    displayName: "GB/s",
    value: "GB",
  },
  {
    displayName: "TB/s",
    value: "TB",
  },
];
export const useTranslateSpeed = () => {
  return (values: string) => {
    const [number, unit] = split(values, /\s+/);
    const _unit = find(speedUnits, (it) => it.value === unit);
    if (_unit) {
      return `${number} ${_unit.displayName}`;
    }
    return values;
  };
};
