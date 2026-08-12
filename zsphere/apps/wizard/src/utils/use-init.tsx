import type { IInputUnitProps } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";

export interface IUnitMap {
  second: string;
  minute: string;
  hour: string;
  [key: string]: string;
}

export const useUnit = () => {
  const intl = useIntl();

  const unitMap: IUnitMap = {
    second: intl.formatMessage({ id: "second", defaultMessage: " seconds" }),
    minute: intl.formatMessage({ id: "minute", defaultMessage: "minutes" }),
    hour: intl.formatMessage({ id: "hours", defaultMessage: "hours" }),
  };
  const unitList = Object.values(unitMap) as IInputUnitProps["unitList"];

  const getUnitValue = (unit: string) => {
    let unitValue;
    for (const _unit in unitMap) {
      if (unitMap[_unit] === unit) {
        unitValue = _unit;
        break;
      }
    }

    return unitValue;
  };

  return { unitMap, unitList, getUnitValue };
};
