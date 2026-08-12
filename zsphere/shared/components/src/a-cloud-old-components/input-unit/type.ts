import { InputNumberProps } from "antd/lib/input-number";

import { ITooltipProps } from "../field/type";

export interface IInputUnitProps
  extends
    Omit<InputNumberProps, "value" | "onChange" | "prefix">,
    Pick<
      React.DOMAttributes<HTMLInputElement>,
      "onMouseEnter" | "onMouseLeave"
    > {
  value?: ValueProps;
  onChange?: (value: ValueProps) => void;
  unitList?: (string | UnitProps)[];
  inputWidth?: number;
  selectWidth?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  tooltip?: ITooltipProps;
  disabled?: boolean;
}

export interface ValueProps {
  number?: number;
  unit?: string;
}

export interface UnitProps {
  value: string;
  displayName?: string;
  disabled?: boolean;
  tooltip?: string | React.ReactNode;
}
