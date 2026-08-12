import { Icon } from "@zstack/icon";
import {
  Condition as IQueryCondition,
  IQuery,
  Op,
} from "@zstack/zsphere-types";
import { bus } from "@zstack/zsphere-utils";
import { useToggle } from "ahooks";
import { Divider } from "antd";
import cls from "classnames";
import { differenceBy, uniqBy } from "lodash-es";
import React, { FC, useCallback, useMemo, useRef, useState } from "react";

import { getBaseCls } from "../../_utils/common";
import { ConfigContext } from "../config";
import Item from "./item";

import "./style.less";
import Menu from "./menu";
import { ConditionOption, ConditionType, ISearchProps } from "./type";

type IProps = Pick<
  ISearchProps,
  | "conditions"
  | "query"
  | "setQuery"
  | "onChange"
  | "onlySingleSearch"
  | "isDefaultSearch"
> & { toggleVisible: (visible: boolean) => void };

export interface ISelectedCondition {
  key: string;
  label: string;
  type: ConditionType;
  options?: ConditionOption[];
  remote?: boolean;
  searchKey?: string;
  initText?: string;
}

const Box: FC<IProps> = ({
  conditions,
  query,
  setQuery: setInnerQuery,
  onChange: _onChange,
  onlySingleSearch,
  toggleVisible,
  isDefaultSearch = true,
}) => {
  const [menuVisible, { toggle: toggleMenuVisible }] = useToggle(true);
  const [selectedCondtions, setSelectedConditions] = useState<
    ISelectedCondition[]
  >([]);
  const queryRef = useRef<IQuery>(query);
  const { tableList: tableListConfig } = React.useContext(ConfigContext);

  const onChange = React.useMemo(
    () => _onChange ?? tableListConfig?.searchProps?.onChange,
    [_onChange, tableListConfig],
  );
  // 如果在tablelist 设置了 onChange 使用 custom
  const setQuery = React.useCallback(
    (_query: IQuery) => {
      onChange?.(_query, setInnerQuery);
      setInnerQuery(_query);
    },
    [onChange, setInnerQuery],
  );

  const handleConditionSelect = (key: string, initText?: string) => {
    toggleMenuVisible(!!initText);
    const _condition = conditions.find((co) => co.key === key)!;
    const { label, type, options, onSearch, searchKey } = _condition;
    const _item: ISelectedCondition = {
      key,
      label,
      type,
      options,
      searchKey,
      initText,
    };
    if (onSearch) {
      onSearch();
      _item.remote = true;
    }
    const newConditions = [...selectedCondtions, _item];
    setSelectedConditions(newConditions);
  };

  const handleItemChange = useCallback(
    (value: string | string[], item: ISelectedCondition) => {
      const key = item.searchKey ?? item.key;
      let newCondition: IQueryCondition;
      switch (item.type) {
        case "input":
          newCondition = {
            key,
            value: (value as string).trim().replace(/'/g, `''`),
            op: Op.like,
          };
          break;
        case "singleSelect":
          newCondition = {
            key,
            value: value as string,
            op: Op.eq,
          };
          break;
        case "multipleSelect":
        case "searchSelect":
          newCondition = {
            key,
            values: value as string[],
            op: Op.in,
          };
          break;
      }

      let newConditions = [newCondition];
      if (query.conditions?.length) {
        newConditions = uniqBy([newCondition, ...query.conditions], "key");
      }
      setQuery({
        ...query,
        conditions: newConditions,
      });
      if (!onlySingleSearch) {
        toggleMenuVisible(true);
      }
    },
    [query],
  );

  const handleItemsClear = () => {
    setSelectedConditions([]);
    toggleMenuVisible(true);
    setQuery(queryRef.current);
  };

  bus.addListener("CLEAR_SEARCH_BOX", () => {
    handleItemsClear();
    toggleVisible(false);
  });

  const handleItemRemove = useCallback(
    (item: ISelectedCondition) => {
      const newSelectedConditions = selectedCondtions.filter(
        (co) => co.key !== item.key,
      );
      setSelectedConditions(newSelectedConditions);
      toggleMenuVisible(true);
      const key = item.searchKey ?? item.key;
      const newQueryConditions = query.conditions?.filter(
        (co) => co.key !== key,
      );
      setQuery({
        ...query,
        conditions: newQueryConditions,
      });
    },
    [selectedCondtions, query],
  );

  const filteredConditions = useMemo(() => {
    const arr = differenceBy(conditions, selectedCondtions, "key");
    const tagIndex = arr.findIndex((item) => item.key === "tag");
    if (tagIndex > 0) {
      const tagItem = arr.splice(tagIndex, 1)[0];
      const uuidIndex = arr.findIndex((item) => item.key === "uuid");
      if (uuidIndex > -1) {
        arr.splice(uuidIndex + 1, 0, tagItem);
        return arr;
      }
      const nameIndex = arr.findIndex((item) => item.key === "name");
      if (nameIndex > -1) {
        arr.splice(nameIndex + 1, 0, tagItem);
        return arr;
      }
      arr.splice(0, 0, tagItem);
      return arr;
    }
    return arr;
  }, [conditions, selectedCondtions]);

  const selectedItems = useMemo(
    () =>
      selectedCondtions.map((item) => {
        const { key, remote } = item;
        if (remote) {
          const _condition = conditions.find((co) => co.key === key)!;
          const { remoteOptionTextKey, remoteOptionValueKey, remoteOptions } =
            _condition;
          return {
            ...item,
            options: remoteOptions?.map((opt) => ({
              text: opt[remoteOptionTextKey || "name"],
              value: opt[remoteOptionValueKey || "uuid"],
              color: opt.color,
              count: opt.count?.num,
            })),
          };
        }
        return item;
      }),
    [conditions, selectedCondtions],
  );

  return (
    <div className={cls("ant-input", getBaseCls("search-box"))}>
      <div className={getBaseCls("search-box-left-part")}>
        {selectedItems.map((item) => (
          <Item
            type={item.type}
            label={item.label}
            options={item.options}
            onChange={(val) => handleItemChange(val, item)}
            onRemove={() => handleItemRemove(item)}
            key={item.key}
            oKey={item.key}
            initText={item.initText}
          />
        ))}
        {menuVisible && filteredConditions.length > 0 && (
          <Menu
            originConditions={conditions}
            options={filteredConditions}
            onSelect={handleConditionSelect}
            onNameChange={(val, item) => handleItemChange(val, item)}
            isDefaultSearch={isDefaultSearch}
          />
        )}
      </div>
      <div className={getBaseCls("search-box-right-part")}>
        {selectedItems.length > 0 && (
          <Icon
            type="trash"
            className={getBaseCls("icon-trash")}
            onClick={handleItemsClear}
          />
        )}
        <Divider className={getBaseCls("divider")} type="vertical" />
        <Icon
          type="search"
          className={getBaseCls("icon-search")}
          onClick={() => {
            setQuery({ ...query });
          }}
        />
      </div>
    </div>
  );
};

export default Box;
