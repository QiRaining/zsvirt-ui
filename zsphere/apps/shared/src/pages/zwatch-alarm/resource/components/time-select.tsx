import { Divider } from "@zstack/design";
import type { IInputUnitProps, ISelectProps } from "@zstack/zsphere-components";
import { InputUnit, Select } from "@zstack/zsphere-components";
import { useToggle, useControllableValue } from "ahooks";
import cls from "classnames";
import { get } from "lodash-es";
import React, { useState, useMemo, useCallback } from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const { Option } = Select;

export interface IProps extends Pick<
  ISelectProps,
  "width" | "className" | "dropdownMatchSelectWidth"
> {
  value?: any;
  onChange?: any;
  items: any;
  type?: any;
  unitList?: readonly ["s" | "min" | "hour"];
}
export interface ValueProps {
  number?: number | string;
  unit?: string;
}

export const checkRepeatIntervalRule = (
  value: { number?: number; unit?: string },
  intl: IntlShape,
) => {
  const { number: numberValue = 0, unit = "min" } = value;
  let finalnumber = 0;
  const maxDateTime = 60 * 60 * 24 * 365;
  switch (unit) {
    case "s":
      finalnumber = Number(numberValue);
      break;
    case "min":
      finalnumber = Number(numberValue) * 60;
      break;
    case "hour":
      finalnumber = Number(numberValue) * 60 * 60;
      break;
  }

  if (Number.isNaN(finalnumber)) {
    return Promise.reject(
      intl.formatMessage({
        id: "please.input.number",
        defaultMessage: "Enter a number.",
      }),
    );
  }

  if (finalnumber > maxDateTime) {
    return Promise.reject(
      intl.formatMessage({
        id: "please.input.number.max",
        defaultMessage: "The duration cannot be longer than 1 year.",
      }),
    );
  }
  return Promise.resolve();
};

export const timeSelectValidator = (intl: IntlShape) => {
  return {
    validator: (rule: any, value: any) => {
      return checkRepeatIntervalRule(value, intl);
    },
  };
};

const CustomSelect: React.FC<IProps> = ({
  items,
  value,
  onChange,
  type,
  unitList: propUnitList = ["s", "min", "hour"],
  ...props
}) => {
  const [visible, { toggle: toggleVisible }] = useToggle(false);
  const intl = useIntl();
  const currentLang = intl.locale;
  const every = intl.formatMessage({
    id: "zwatch.time.every",
    defaultMessage: `every`,
  });
  const only = intl.formatMessage({
    id: "zwatch.time.only",
    defaultMessage: `Only`,
  });
  const once = intl.formatMessage({
    id: "zwatch.time.once",
    defaultMessage: `time`,
  });
  const hour = intl.formatMessage({
    id: "zwatch.time.hour",
    defaultMessage: `hours`,
  });
  const min = intl.formatMessage({
    id: "zwatch.time.minute",
    defaultMessage: "minutes",
  });
  const s = intl.formatMessage({
    id: "zwatch.time.second",
    defaultMessage: "seconds",
  });

  const isEn = useMemo(() => currentLang === "en-US", [currentLang]);

  const timeMap = (number: any, unit: any) => {
    let result = "";
    const formatnumber = (_number: any) =>
      isEn ? ` ${_number} ` : `${_number}`;

    switch (unit) {
      case "hour":
        result = type
          ? `${every}${formatnumber(number)}${hour}`
          : `${formatnumber(number)}${hour}`;
        break;
      case "min":
        result = type
          ? `${every}${formatnumber(number)}${min}`
          : `${formatnumber(number)}${min}`;
        break;
      case "s":
        result = type
          ? `${every}${formatnumber(number)}${s}`
          : `${formatnumber(number)}${s}`;
        break;
      case "once":
        result = `${only}${formatnumber(1)}${once}`;
        break;
    }

    return result;
  };
  const [state, setState] = useControllableValue(
    { value, onChange },
    {
      defaultValue: {} as ValueProps,
    },
  );
  const [defaultTime, setDefaultTime] = useState<IInputUnitProps["value"]>({
    number: undefined,
    unit: propUnitList.includes("min") ? "min" : propUnitList[0],
  });
  const [max, setMax] = useState<number>(31536000);
  const setDefault = useCallback((v) => {
    setDefaultTime(v);
    let max = 31536000;
    if (v?.unit === "min") {
      max /= 60;
    } else if (v?.unit === "hour") {
      max /= 60 * 60;
    }
    setMax(max);
  }, []);
  const unitList: IInputUnitProps["unitList"] = [
    { value: "s", displayName: s },
    { value: "min", displayName: min },
    { value: "hour", displayName: hour },
  ].filter((it) => propUnitList.includes(it.value as "s"));

  const handleSelectChange = (str: any) => {
    const num = str?.replace(/[^\d.]/g, "");
    let units = "";
    if (str.indexOf(s) !== -1) {
      units = "s";
    }
    if (str.indexOf(min) !== -1) {
      units = "min";
    }
    if (str.indexOf(hour) !== -1) {
      units = "hour";
    }
    if (str.indexOf(once) !== -1) {
      units = "once";
    }
    setState({ number: num, unit: units });
  };

  const handleInputChange = useCallback(
    (_defaultTime: IInputUnitProps["value"]) => {
      setState({
        ..._defaultTime,
        unit: _defaultTime?.unit
          ? _defaultTime?.unit
          : get(unitList, ["0", "value"]),
      });
    },
    [unitList],
  );

  const limitDecimals = (v: any) => {
    return v?.toString()?.replace(/^(0+)|[^\d]+/g, "");
  };

  const inputUnitSuffixUnit = useMemo(() => {
    if (unitList?.length === 1) {
      return {
        value: undefined,
        suffix: (
          <span style={{ marginLeft: 8 }}>
            {get(unitList, ["0", "displayName"], s)}
          </span>
        ),
      };
    }

    return {
      unitList,
    };
  }, [unitList?.length, intl]);

  const dropdownEle = useCallback(
    (menu) => (
      <div>
        {menu}
        <Divider style={{ margin: "4px 0" }} />
        <div
          className="flex items-center justify-between"
          style={{ padding: "4px 12px" }}
        >
          <div>
            <InputUnit
              min={1}
              max={max}
              formatter={limitDecimals}
              parser={limitDecimals}
              value={defaultTime}
              onChange={setDefault}
              {...inputUnitSuffixUnit}
            />
          </div>
          <div style={{ marginLeft: 8 }}>
            <a
              onClick={() => {
                if (defaultTime && Number(defaultTime.number) > 0) {
                  handleInputChange(defaultTime);
                  toggleVisible(false);
                }
              }}
            >
              {intl.formatMessage({
                id: "zwatch.time.choose",
                defaultMessage: `Select`,
              })}
            </a>
          </div>
        </div>
      </div>
    ),
    [defaultTime, inputUnitSuffixUnit, intl],
  );

  return (
    <Select
      width="m"
      {...props}
      className={cls(style["time-select"], props.className)}
      value={timeMap(
        Number(Number(state?.number || 0)?.toFixed(2)),
        state?.unit,
      )}
      onChange={handleSelectChange}
      open={visible}
      onDropdownVisibleChange={toggleVisible}
      dropdownRender={dropdownEle}
    >
      {items.map((item: any, index: number) => (
        <Option key={index} value={timeMap(item.number, item.unit)}>
          {timeMap(item.number, item.unit)}
        </Option>
      ))}
    </Select>
  );
};
export default CustomSelect;
