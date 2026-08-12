import { Tag } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { usePersistFn, useToggle, useUpdateEffect } from "ahooks";
import {
  Dropdown as AntDropdown,
  Row,
  Col,
  Checkbox,
  DropDownProps,
  Radio,
} from "antd";
import VirtualList from "rc-virtual-list";
import React, {
  FC,
  ForwardRefRenderFunction,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../../../_utils/common";
import { Empty } from "../../../../empty";
import Input from "../../../../input";
import Text from "../../../text";
import {
  IOption,
  IDropdown,
  IDropdownRef,
  IDropdownList,
  IDropdownBottomAction,
  IDropdownTopAction,
  IType,
  IDropdownListItem,
  IDropdownListEmpty,
  IDropdownBottomActionClear,
} from "./type";

const DropdownContainer: FC<{ children?: React.ReactNode }> = ({
  children,
}) => <div className={getBaseCls("search-dropdown-container")}>{children}</div>;

const DropdownListItem: ForwardRefRenderFunction<
  HTMLDivElement,
  IDropdownListItem
> = (props, ref) => {
  const { type, option, selectedOptions, onSelect } = props;
  const intl = useIntl();

  const handleSelect = () => {
    onSelect?.(option);
  };

  const renderOption = () => {
    const { key, label, extra } = option;
    const checked = selectedOptions?.some(
      (item) => item.key === key && item.extra?.ownerType === extra?.ownerType,
    );
    switch (type) {
      case "fuzzy": {
        const colon = intl.formatMessage({ id: "colon", defaultMessage: "：" });
        return (
          <Row wrap={false} gutter={6}>
            <Col flex="none">
              <Icon type="search" />
            </Col>
            <Col flex="auto">
              <Text value={`${label}${colon}${extra?.keywords}`} />
            </Col>
          </Row>
        );
      }
      case "singleSelect":
        return label;
      case "multipleSelect":
        return (
          <Row wrap={false} gutter={8}>
            <Col flex="none">
              <Checkbox checked={checked} />
            </Col>
            <Col flex="auto">{label}</Col>
          </Row>
        );
      case "tag":
        return (
          <Row wrap={false} gutter={8}>
            <Col flex="none">
              <Checkbox checked={checked} />
            </Col>
            <Col flex="auto">
              <Row wrap={false} justify="space-between" gutter={4}>
                <Col>
                  {extra?.color ? (
                    <Tag
                      color={extra.color}
                      className={getBaseCls("search-dropdown-list-item-tag")}
                    >
                      {label}
                    </Tag>
                  ) : (
                    label
                  )}
                </Col>
                <Col>{extra?.count}</Col>
              </Row>
            </Col>
          </Row>
        );
      default:
        return label;
    }
  };

  return (
    <div
      ref={ref}
      className={getBaseCls("search-dropdown-list-item")}
      onClick={handleSelect}
    >
      {renderOption()}
    </div>
  );
};

const FowwardDropdownListItem = forwardRef(DropdownListItem);

const DropdownListDivider: FC = () => (
  <div className={getBaseCls("search-dropdown-list-divider")} />
);

const DropdownListNoMatch: FC = () => {
  const intl = useIntl();
  return (
    <div className={getBaseCls("search-dropdown-list-no-match")}>
      {intl.formatMessage({
        id: "no.match.option",
        defaultMessage: "No results found",
      })}
    </div>
  );
};

const DropdownListEmpty: FC<IDropdownListEmpty> = ({ type }) => {
  const intl = useIntl();
  let description: React.ReactNode;
  if (type === "fuzzy") {
    description = intl.formatMessage({
      id: "no.match.option",
      defaultMessage: "No results found",
    });
  }
  return <Empty type="Select" description={description} />;
};

const DropdownList: FC<IDropdownList> = (props) => {
  const {
    type,
    showScroll,
    options = [],
    loading,
    selectedOptions,
    keywords,
    onSelect,
    onScroll,
  } = props;

  if (!loading && options.length === 0) {
    if (keywords) {
      return <DropdownListNoMatch />;
    }
    return <DropdownListEmpty type={type} />;
  }

  const containerHeight = showScroll && options.length >= 6 ? 200 : undefined;

  const handleScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      containerHeight
    ) {
      onScroll?.();
    }
  };

  return (
    <div className={getBaseCls("search-dropdown-list")}>
      <VirtualList
        data={options}
        height={containerHeight}
        itemKey="key"
        onScroll={handleScroll}
      >
        {(item: IOption, index: number) => (
          <>
            <FowwardDropdownListItem
              option={item}
              type={type}
              selectedOptions={selectedOptions}
              onSelect={onSelect}
            />
            {item.key === "none" && index + 1 !== options.length && (
              <DropdownListDivider />
            )}
          </>
        )}
      </VirtualList>
      {loading && (
        <div className={getBaseCls("search-dropdown-list-loading")}>
          <Icon type="loader" />
        </div>
      )}
    </div>
  );
};

const DropdownBottomAction: FC<IDropdownBottomAction> = ({ onClear, onOk }) => {
  const intl = useIntl();
  const handleClear = () => {
    onClear?.();
  };
  const handleOk = () => {
    onOk?.();
  };

  return (
    <div className={getBaseCls("search-dropdown-bottom-action")}>
      <Row justify="space-between">
        <Col
          className={getBaseCls("search-dropdown-bottom-action-clear")}
          onClick={handleClear}
        >
          {intl.formatMessage({
            id: "clear.selected.options",
            defaultMessage: "Unselect",
          })}
        </Col>
        <Col
          className={getBaseCls("search-dropdown-bottom-action-ok")}
          onClick={handleOk}
        >
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Col>
      </Row>
    </div>
  );
};

const DropdownTopAction: FC<IDropdownTopAction> = ({ input, tabs }) => (
  <div className={getBaseCls("search-dropdown-top-action")}>
    {tabs && (
      <Radio.Group
        onChange={(e) => tabs.onChange?.(e.target.value)}
        value={tabs.value}
        className={getBaseCls("search-dropdown-top-action-tabs")}
      >
        {tabs.options?.map((item) => (
          <Radio.Button value={item.key} key={item.key}>
            {item.label}
          </Radio.Button>
        ))}
      </Radio.Group>
    )}
    {input && (
      <Input
        value={input.value}
        className={getBaseCls("search-dropdown-top-action-input")}
        placeholder={input.placeholder}
        suffix={<Icon type="search" />}
        onChange={(e) => input.onChange?.(e.target.value)}
        allowClear
      />
    )}
  </div>
);

const Dropdown: ForwardRefRenderFunction<IDropdownRef, IDropdown> = (
  {
    type,
    options,
    loading,
    placeholder,
    showSearch,
    showTabs,
    showScroll,
    tabs,
    onTabChange,
    onSearch,
    onOk,
    onOpenChange,
    children,
    ...props
  },
  ref,
) => {
  const [visible, { toggle: toggleVisible }] = useToggle(false);
  const [selectedOptions, setSelectedOptions] = useState<IOption[]>([]);
  const [activeTab, setActiveTab] = useState(tabs?.[0].key);
  const [keywords, setKeywords] = useState<string>();
  const [page, setPage] = useState<number>();

  const showTopAction = showTabs || showSearch;
  const showBottomAction = useMemo(() => {
    const isMultiple = (["multipleSelect", "tag"] as IType[]).includes(type);
    const hasOptions = options && options.length > 0;
    return isMultiple && hasOptions;
  }, [type, options]);

  const handleListSelect = (option: IOption) => {
    if (["fuzzy", "singleSelect"].includes(type)) {
      toggleVisible(false);
      onOk?.([option]);
    }
    if (["multipleSelect", "tag"].includes(type)) {
      setSelectedOptions((prevSelected) => {
        const currentKey = option.key;
        const currentOwnerType = option.extra?.ownerType;
        const selectedIndex = prevSelected.findIndex(
          (item) =>
            item.key === currentKey &&
            item.extra?.ownerType === currentOwnerType,
        );
        if (selectedIndex > -1) {
          prevSelected.splice(selectedIndex, 1);
          return [...prevSelected];
        }
        return [...prevSelected, option];
      });
    }
  };

  const handleVisibleChange = (value: boolean) => {
    onOpenChange?.(value);
    toggleVisible(value);
  };

  const handleOk = usePersistFn(() => {
    const result = showTabs
      ? selectedOptions.filter((item) => item.extra?.ownerType === activeTab)
      : selectedOptions;
    toggleVisible(false);
    onOk?.(result);
  });

  const handleClear = usePersistFn((actions?: IDropdownBottomActionClear) => {
    const { clearKeywords = true, clearOptions = true } = actions || {};
    if (clearKeywords) {
      setKeywords("");
      setPage(1);
    }
    if (clearOptions) {
      if (showTabs) {
        setSelectedOptions((prevSelected) =>
          prevSelected.filter((item) => item.extra?.ownerType !== activeTab),
        );
      } else {
        setSelectedOptions([]);
      }
    }
  });

  const handleScroll = () => {
    setPage((prevPage) => (prevPage ? prevPage + 1 : 1));
  };

  const handleRefresh = usePersistFn(() => {
    if (page === 1) {
      onSearch?.(keywords, 1);
    } else {
      setPage(1);
    }
  });

  const handleInputChange = (value: string) => {
    setKeywords(value.trim());
    setPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  useUpdateEffect(() => {
    onSearch?.(keywords, page);
  }, [keywords, page]);

  useImperativeHandle(ref, () => ({
    toggleVisible,
    clear: handleClear,
    refresh: handleRefresh,
  }));

  const overlay = useMemo(() => {
    if (type === "input") {
      return <div />;
    }
    if (type === "fuzzy" && !options) {
      return <div />;
    }
    return (
      <DropdownContainer>
        {showTopAction && (
          <DropdownTopAction
            input={
              showSearch
                ? {
                    value: keywords,
                    onChange: handleInputChange,
                    placeholder,
                  }
                : undefined
            }
            tabs={
              showTabs
                ? {
                    value: activeTab,
                    onChange: handleTabChange,
                    options: tabs,
                  }
                : undefined
            }
          />
        )}
        <DropdownList
          type={type}
          showScroll={showScroll}
          options={options}
          loading={loading}
          selectedOptions={selectedOptions}
          keywords={keywords}
          onSelect={handleListSelect}
          onScroll={handleScroll}
        />
        {showBottomAction && (
          <DropdownBottomAction onOk={handleOk} onClear={handleClear} />
        )}
      </DropdownContainer>
    );
  }, [
    type,
    options,
    loading,
    placeholder,
    showSearch,
    showTabs,
    tabs,
    activeTab,
    keywords,
    selectedOptions,
  ]);

  const getPopupContainer: DropDownProps["getPopupContainer"] = (node) => {
    const container = node.closest(`.${getBaseCls("search-advanced")}`);
    if (container) {
      return container as HTMLElement;
    }
    return document.body;
  };

  return (
    <AntDropdown
      dropdownRender={() => overlay}
      trigger={["click"]}
      open={visible}
      onOpenChange={handleVisibleChange}
      getPopupContainer={getPopupContainer}
      {...props}
      // getPopupContainer={() => document.body}
    >
      {children}
    </AntDropdown>
  );
};

export default forwardRef<IDropdownRef, IDropdown>(Dropdown);
