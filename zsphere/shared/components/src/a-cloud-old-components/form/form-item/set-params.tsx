import { Icon } from "@zstack/icon";
import { Tooltip } from "antd";
import { get } from "lodash-es";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../../_utils/common";
import Select from "../../select";

import "../style.less";

const mark = "##select_params#";

const baseCls = getBaseCls("form-item");

export const isSelectParams = (value?: any) => {
  if (typeof value !== "string") {
    return false;
  }

  return value.startsWith(mark);
};

const SelectParams: React.FC<{
  paramsList?: Array<any>;
  namePaths?: Array<any>;
  [prop: string]: any;
}> = ({ paramsList, namePaths, ...props }) => {
  return (
    <Select style={{ width: 120 }} {...props}>
      {paramsList?.map((item) => (
        <Select.Option key={item.name} value={`${mark}${item.name}`}>
          {item.name}
        </Select.Option>
      ))}
    </Select>
  );
};

const SetParamsWrapper: React.FC<{
  paramsList?: Array<any>;
  children: any;
  namePaths?: Array<any>;
}> = ({ paramsList, children, namePaths }) => {
  const { children: innerChildren, rules = [], required } = children?.props;

  const [showSelectParamsEle, setShowSelectParamsEle] = useState(
    () => isSelectParams(get({}, namePaths ?? [])) ?? false,
  );

  const intl = useIntl();

  const rulesMemo = useMemo(() => {
    if (!showSelectParamsEle) {
      return rules;
    }

    return required || rules.some((item: any) => item.required)
      ? [
          {
            required: true,
            message: intl.formatMessage({
              id: "pleaseSelectParams",
              defaultMessage: "Select Parameter",
            }),
          },
        ]
      : [];
  }, [intl, required, rules, showSelectParamsEle]);

  const newChildren = React.cloneElement(children, {
    children: showSelectParamsEle ? (
      <SelectParams namePaths={namePaths} paramsList={paramsList} />
    ) : (
      innerChildren
    ),
    rules: rulesMemo,
  });

  const iconType = showSelectParamsEle ? "parameter-off" : "parameter";

  return (
    <div className={`${baseCls}-select-params`}>
      {newChildren}
      <Tooltip
        key={iconType}
        title={
          showSelectParamsEle
            ? intl.formatMessage({
                id: "close.globalParams",
                defaultMessage: "Disable Global Parameters",
              })
            : intl.formatMessage({
                id: "open.globalParams",
                defaultMessage: "Enable Global Parameters",
              })
        }
      >
        <div
          className={`${baseCls}-select-params-icon`}
          onClick={() => setShowSelectParamsEle(!showSelectParamsEle)}
        >
          <Icon type={iconType} />
        </div>
      </Tooltip>
    </div>
  );
};

export default SetParamsWrapper;
