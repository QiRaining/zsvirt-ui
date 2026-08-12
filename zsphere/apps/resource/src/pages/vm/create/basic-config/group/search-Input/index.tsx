import { Divider } from "@zstack/design";
import { Icon } from "@zstack/icon";
import type { InputProps } from "antd";
import { Input } from "antd";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

interface IProps extends InputProps {
  viewType: string;
  serachGroupTree: Function;
  setFilterValue: Function;
}

const SearchInput: React.FC<IProps> = ({
  viewType: _viewType,
  serachGroupTree,
  setFilterValue,
  ...props
}) => {
  const [searchValue, setSearchValue] = useState<null | string>(null);
  const intl = useIntl();

  return (
    <Input
      className={style["group-search"]}
      allowClear
      placeholder={intl.formatMessage({
        id: "search.vm.group.name",
        defaultMessage: "Search by group name",
      })}
      value={props.value || (searchValue as any)}
      onChange={(e) => {
        const value = e.target.value;
        setSearchValue(value);
        serachGroupTree(value);
        setFilterValue(value);
      }}
      suffix={
        <div className={style.suffix}>
          <Divider type="vertical" className={style.divider} />
          <Icon type="search" className={style["search-icon"]} />
        </div>
      }
      {...props}
    />
  );
};

export default SearchInput;
