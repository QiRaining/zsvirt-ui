import { Icon } from "@zstack/icon";
import { Space } from "antd";
import React, { FC, useEffect, useState } from "react";

import { getBaseCls } from "../../../../_utils/common";
import Text from "../../../text";
import Dropdown from "./dropdown";
import { ILeftMenu, IOption } from "./type";

const LeftMenu: FC<ILeftMenu> = ({ options, onChange }) => {
  const [value, setValue] = useState<IOption>();

  const handleDropdownOk = (values: IOption[]) => {
    const _value = values[0];
    setValue(_value);
    onChange?.(_value);
  };

  useEffect(() => {
    if (options.length > 0) {
      if (!value) {
        const newValue = options[0];
        setValue(newValue);
      } else {
        const newValue = options.find((item) => item.key === value.key);
        setValue(newValue);
      }
    }
  }, [options]);

  return (
    <Dropdown
      type="singleSelect"
      options={options}
      showScroll={false}
      onOk={handleDropdownOk}
      overlayClassName={getBaseCls("search-left-menu-overlay")}
    >
      <div className={getBaseCls("search-left-menu")}>
        <Space wrap={false} size={4}>
          <Icon
            type="bar-chart-2-invert"
            className={getBaseCls("search-menu-icon")}
          />
          <div className={getBaseCls("search-menu-text")}>
            <Text value={value?.label} />
          </div>
        </Space>
      </div>
    </Dropdown>
  );
};

export default LeftMenu;
