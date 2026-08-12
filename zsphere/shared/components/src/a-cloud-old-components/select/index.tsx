import { Tag } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import { useDebounceEffect, useSelections, useUpdateEffect } from "ahooks";
import type { SelectProps } from "antd";
import {
  Select as AntSelect,
  Button,
  Checkbox,
  Col,
  Divider,
  Dropdown,
  Menu,
  Row,
  Space,
  Tooltip,
} from "antd";
import cls from "classnames";
import {
  difference as _difference,
  intersection as _intersection,
  isEmpty as _isEmpty,
  isUndefined as _isUndefined,
} from "lodash-es";
import React, { FC, ReactNode, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../_utils/common";
import { ConfigEmptyProvider, customRenderEmpty } from "../../empty";
import Spin from "../../spin";
import Text from "../text";

import "./style.less";

type ISize = "xs" | "s" | "m" | "l" | number;

type IRawValue = string | number;
type DefaultValueType = IRawValue | IRawValue[];

export interface IActionBtn<VT extends DefaultValueType = DefaultValueType> {
  text: ReactNode;
  type?: "primary" | "disabled" | "text";
  onClick?: (value?: VT) => void;
}

export interface IOption<T extends IRawValue = IRawValue> {
  label: string;
  value: T;
  extra?: IRawValue | IRawValue[];
  disabled?: boolean;
  color?: string;
  options?: {
    label: string;
    value: T;
    extra?: IRawValue | IRawValue[];
    disabled?: boolean;
    color?: string;
  }[];
}

export interface ISelectProps<
  VT extends DefaultValueType = DefaultValueType,
> extends Omit<SelectProps<VT>, "options" | "onChange"> {
  options?: IOption[];
  onChange?: (value: VT) => void;
  width?: ISize;
  dropdownWidth?: ISize;
  checkable?: boolean;
  showToggleAll?: boolean;
  bottomActions?: IActionBtn<VT>[];
  limit?: number;
}

const getPopupContainer = (node: HTMLElement) => {
  if (node.closest(".zstack-table-list")) {
    return node.closest(".zstack-table-list") as HTMLElement;
  }
  if (node.closest("table")) {
    return node.closest("table") as HTMLElement;
  }
  if (node.closest(".ant-modal")) {
    return document.body;
  }
  if (node.parentElement) {
    return node.parentElement;
  }
  return document.body;
};

function CheckableSelect({
  value: currentValue,
  onChange,
  options = [],
  onSearch,
  showToggleAll,
  optionLabelProp,
  bottomActions,
  children,
  ...props
}: ISelectProps<IRawValue[]>) {
  const intl = useIntl();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");

  const filteredOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    // 过滤掉无效的选项
    const validOptions = options.filter(
      (option) =>
        option &&
        option.value != null &&
        option.value !== undefined &&
        option.value !== "",
    );

    if (searchValue) {
      const _filteredOptions: IOption[] = [];
      validOptions.forEach((option) => {
        if (option?.label?.match(searchValue)) {
          _filteredOptions.push(option);
        } else if (option?.options) {
          const _filteredSubOptions = option.options.filter(
            (subOption) =>
              subOption &&
              subOption.value != null &&
              subOption.value !== undefined &&
              subOption.value !== "" &&
              subOption?.label?.match(searchValue),
          );
          if (_filteredSubOptions.length > 0) {
            _filteredOptions.push({
              ...option,
              options: _filteredSubOptions,
            });
          }
        }
      });
      return _filteredOptions;
    }
    return validOptions;
  }, [searchValue, options]);

  const valueList = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options
      .filter(
        (item) =>
          item &&
          item.value != null &&
          item.value !== undefined &&
          item.value !== "",
      )
      .map((item) => item.value);
  }, [options]);

  const { selected, isSelected, noneSelected, setSelected } =
    useSelections<IRawValue>(valueList, currentValue ?? undefined);

  useUpdateEffect(() => {
    if (currentValue) {
      setSelected(currentValue);
    }
    setSearchValue("");
  }, [currentValue]);

  const toggleActionBar = showToggleAll !== false && !searchValue && (
    <>
      <div className={getBaseCls("select-action-bar")}>
        <span>
          {intl.formatMessage({ id: "selected", defaultMessage: "Selected" })} (
          {selected.length})
        </span>
        <span
          className={cls(
            getBaseCls("select-action-btn"),
            getBaseCls("select-action-btn-primary"),
          )}
          onClick={() => {
            const disabledOptionValues = options.reduce(
              (arr, curr) => (curr.disabled ? arr.concat(curr.value) : arr),
              [] as IRawValue[],
            );

            if (noneSelected) {
              onChange?.(_difference(valueList, disabledOptionValues));
            } else {
              const disabledIntersectionValues = _intersection(
                selected,
                disabledOptionValues,
              );
              if (!_isEmpty(disabledIntersectionValues)) {
                onChange?.(disabledIntersectionValues);
              } else {
                onChange?.([]);
              }
            }
          }}
        >
          {noneSelected
            ? intl.formatMessage({
                id: "selectAll",
                defaultMessage: "Select All",
              })
            : intl.formatMessage({ id: "clear", defaultMessage: "Clear" })}
        </span>
      </div>
      <Divider className={getBaseCls("select-divider")} />
    </>
  );

  const renderOption = (option: IOption) => {
    // 防护：确保 option 和 value 有效
    if (
      !option ||
      option.value == null ||
      option.value === undefined ||
      option.value === ""
    ) {
      return null;
    }

    const { label: _label, value: _value, extra, disabled, color } = option;
    const label = _label || _value;

    const labelEle = color ? (
      <Tag color={color}>{label}</Tag>
    ) : (
      <Text value={label} />
    );

    if (!_isUndefined(extra)) {
      if (Array.isArray(extra) && extra.length > 0) {
        return (
          <Row gutter={8} wrap={false}>
            <Col>
              <Checkbox checked={isSelected(_value)} disabled={disabled} />
            </Col>
            <Col>
              <div className={getBaseCls("select-option-text")}>{labelEle}</div>
              <Space
                className={getBaseCls("select-option-extra-bottom")}
                size={4}
                split={<Divider type="vertical" />}
              >
                {extra.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </Space>
            </Col>
          </Row>
        );
      }
      return (
        <Row justify="space-between" align="middle" wrap={false}>
          <Col>
            <Checkbox checked={isSelected(_value)} disabled={disabled}>
              {labelEle}
            </Checkbox>
          </Col>
          <Col className={getBaseCls("select-option-extra-right")}>{extra}</Col>
        </Row>
      );
    }

    return (
      <Checkbox checked={isSelected(_value)} disabled={disabled}>
        {labelEle}
      </Checkbox>
    );
  };

  // 如果有自定义触发元素，则使用Dropdown+Menu
  if (children) {
    return (
      <Dropdown
        dropdownRender={() => (
          <Menu>
            {filteredOptions.length > 0 ? (
              <>
                {toggleActionBar}
                <div className={getBaseCls("select-list")}>
                  <Menu>
                    {filteredOptions.map((option) =>
                      option.options ? (
                        <Menu.ItemGroup
                          title={option.label}
                          className={getBaseCls("select-group-title")}
                          key={option.value}
                        >
                          {option.options.map((subOption) => (
                            <Menu.Item
                              className={cls(
                                getBaseCls("select-option"),
                                getBaseCls("checkable-select-option"),
                              )}
                              key={subOption.value}
                              disabled={subOption.disabled}
                              onClick={(e) => {
                                e.domEvent.preventDefault();
                                if (currentValue) {
                                  const selectedValueList = [...currentValue];
                                  const index = selectedValueList.indexOf(
                                    subOption.value,
                                  );
                                  if (index > -1) {
                                    selectedValueList.splice(index, 1);
                                  } else {
                                    selectedValueList.push(subOption.value);
                                  }
                                  onChange?.(selectedValueList);
                                }
                              }}
                            >
                              {renderOption(subOption)}
                            </Menu.Item>
                          ))}
                        </Menu.ItemGroup>
                      ) : (
                        <Menu.Item
                          className={cls(
                            getBaseCls("select-option"),
                            getBaseCls("checkable-select-option"),
                          )}
                          key={option.value}
                          disabled={option.disabled}
                          onClick={(e) => {
                            e.domEvent.preventDefault();
                            if (currentValue) {
                              const selectedVal = [...currentValue];
                              const index = selectedVal.indexOf(option.value);
                              if (index > -1) {
                                selectedVal.splice(index, 1);
                              } else {
                                selectedVal.push(option.value);
                              }
                              onChange?.(selectedVal);
                            }
                          }}
                        >
                          {renderOption(option)}
                        </Menu.Item>
                      ),
                    )}
                  </Menu>
                </div>
                {bottomActions && (
                  <>
                    <Divider className={getBaseCls("select-divider")} />
                    <div className={getBaseCls("select-bottom-action-btn")}>
                      {bottomActions.map((action, index) => (
                        <Button
                          type="text"
                          key={`${action.text}-${index}`}
                          onClick={() => {
                            action.onClick?.(selected);
                            setDropdownVisible(false);
                          }}
                          className={cls(getBaseCls("select-action-btn"), {
                            [getBaseCls("select-action-btn-primary")]:
                              action.type === "primary",
                            [getBaseCls("select-action-btn-disabled")]:
                              action.type === "disabled",
                          })}
                        >
                          {action.text}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              customRenderEmpty({ type: "Select" })
            )}
          </Menu>
        )}
        overlayStyle={props.dropdownStyle}
        trigger={["click"]}
        open={dropdownVisible}
        onOpenChange={(visible) => {
          props.onDropdownVisibleChange?.(visible);
          setDropdownVisible(visible);
        }}
        align={props.dropdownAlign as any}
        getPopupContainer={getPopupContainer}
      >
        {props.showArrow ? (
          <Space size={4} align="center">
            {children}
            {props.suffixIcon}
          </Space>
        ) : (
          children
        )}
      </Dropdown>
    );
  }

  // 默认使用Select
  return (
    <AntSelect
      menuItemSelectedIcon={null}
      dropdownRender={(menu) => {
        if (props?.loading) {
          return (
            <Spin>
              <div className={getBaseCls("select-loading-checkable")} />
            </Spin>
          );
        }
        return options.length > 0 ? (
          <div>
            {toggleActionBar}
            <div className={getBaseCls("select-list")}>{menu}</div>
          </div>
        ) : (
          menu
        );
      }}
      tagRender={(tagProps) => {
        const {
          value: tagValue,
          closable,
          onClose,
          label: _label,
          ...restTagProps
        } = tagProps;

        // 防护：确保 tagValue 有效
        if (tagValue == null || tagValue === undefined || tagValue === "") {
          return <Tag {...(restTagProps as any)} />;
        }

        const currentOption = options.find(
          (item) => item && item.value === tagValue,
        );
        const label =
          currentOption?.[(optionLabelProp ?? "label") as keyof IOption];
        const color = currentOption?.color;
        return (
          <Tag
            closable={closable}
            onClose={onClose}
            color={color}
            {...(restTagProps as any)}
          >
            {label}
          </Tag>
        );
      }}
      value={currentValue}
      onChange={(v) => onChange?.(v)}
      filterOption={false}
      searchValue={searchValue}
      onSearch={(keywords) => {
        onSearch?.(keywords);
        setSearchValue(keywords);
      }}
      {...props}
    >
      {filteredOptions.map((option) =>
        option.options ? (
          <AntSelect.OptGroup label={option.label} key={option.value}>
            {option.options
              .filter(
                (subOption) =>
                  subOption &&
                  subOption.value != null &&
                  subOption.value !== undefined &&
                  subOption.value !== "",
              )
              .map((subOption) => (
                <AntSelect.Option
                  className={cls(
                    getBaseCls("select-option"),
                    getBaseCls("checkable-select-option"),
                  )}
                  key={subOption.value}
                  value={subOption.value}
                  disabled={subOption.disabled}
                >
                  {renderOption(subOption)}
                </AntSelect.Option>
              ))}
          </AntSelect.OptGroup>
        ) : (
          <AntSelect.Option
            className={cls(
              getBaseCls("select-option"),
              getBaseCls("checkable-select-option"),
            )}
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {renderOption(option)}
          </AntSelect.Option>
        ),
      )}
    </AntSelect>
  );
}

const BasicOption: FC<{
  option: IOption;
  dropdownVisible: boolean;
}> = ({ option, dropdownVisible }) => {
  const optionRef = useRef<HTMLSpanElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // 防护：确保 option 和 value 有效
  if (
    !option ||
    option.value == null ||
    option.value === undefined ||
    option.value === ""
  ) {
    return null;
  }

  const { label: _label, extra, value } = option;
  const label = _label || value;

  // dropdown显示后需要延迟一会才能读到dom的实际宽度
  useDebounceEffect(
    () => {
      if (
        optionRef.current &&
        dropdownVisible &&
        option &&
        option.value != null &&
        option.value !== undefined &&
        option.value !== ""
      ) {
        const { current } = optionRef;
        const currentWrappper = current.closest(
          ".ant-select-item-option-content",
        );
        if (
          currentWrappper &&
          currentWrappper.scrollWidth > currentWrappper.clientWidth
        ) {
          setTooltipVisible(true);
        } else {
          setTooltipVisible(false);
        }
      }
    },
    [dropdownVisible, option],
    {
      wait: 10,
    },
  );

  if (extra) {
    if (Array.isArray(extra) && extra.length > 0) {
      return (
        <div>
          <div className={getBaseCls("select-option-extra-label")}>{label}</div>
          <Space
            className={getBaseCls("select-option-extra-bottom")}
            size={4}
            split={<Divider type="vertical" />}
          >
            {extra.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </Space>
        </div>
      );
    }
    return (
      <Row justify="space-between" align="middle">
        <Col>{label}</Col>
        <Col className={getBaseCls("select-option-extra-right")}>{extra}</Col>
      </Row>
    );
  }

  return tooltipVisible ? (
    // tooltip需要让鼠标事件穿透过去,否则会造成遮挡
    <Tooltip
      title={option.label}
      overlayClassName={getBaseCls("select-tooltip")}
    >
      <span ref={optionRef}>{label}</span>
    </Tooltip>
  ) : (
    <span ref={optionRef}>{label}</span>
  );
};

function BasicSelect({ options, ...props }: ISelectProps<IRawValue>) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  if (props?.loading) {
    return (
      <AntSelect
        onChange={(v) => props.onChange?.(v)}
        dropdownRender={() => (
          <Spin>
            <div className={getBaseCls("select-loading-basic")} />
          </Spin>
        )}
        {...props}
      />
    );
  }
  if (options && options.length > 0) {
    // 过滤掉无效的选项
    const validOptions = options.filter(
      (option) =>
        option &&
        option.value != null &&
        option.value !== undefined &&
        option.value !== "",
    );

    return (
      <AntSelect onDropdownVisibleChange={setDropdownVisible} {...props}>
        {validOptions.map((option) =>
          option.options ? (
            <AntSelect.OptGroup label={option.label} key={option.value}>
              {option.options
                .filter(
                  (subOption) =>
                    subOption &&
                    subOption.value != null &&
                    subOption.value !== undefined &&
                    subOption.value !== "",
                )
                .map((subOption) => (
                  <AntSelect.Option
                    className={getBaseCls("select-option")}
                    key={subOption.value}
                    value={subOption.value}
                    disabled={subOption.disabled}
                  >
                    <BasicOption
                      option={subOption}
                      dropdownVisible={dropdownVisible}
                    />
                  </AntSelect.Option>
                ))}
            </AntSelect.OptGroup>
          ) : (
            <AntSelect.Option
              className={getBaseCls("select-option")}
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              <BasicOption option={option} dropdownVisible={dropdownVisible} />
            </AntSelect.Option>
          ),
        )}
      </AntSelect>
    );
  }

  return <AntSelect {...props} />;
}

function Select<VT extends DefaultValueType = DefaultValueType>({
  width,
  dropdownWidth,
  style,
  dropdownStyle,
  checkable,
  mode,
  limit,
  ...props
}: ISelectProps<VT>) {
  const [suffixIcon, setSuffixIcon] = useState<IconTypes>("arrow-ios-down");
  const getWidth = (size: ISize) => {
    switch (size) {
      case "xs":
        return 80;
      case "s":
        return 160;
      case "m":
        return 240;
      case "l":
        return 320;
      default:
        return size;
    }
  };

  const newStyle = useMemo(() => {
    if (width) {
      return {
        width: getWidth(width),
        ...style,
      };
    }
    return style;
  }, [style, width]);

  const newDropdownStyle = useMemo(() => {
    if (dropdownWidth) {
      return {
        minWidth: getWidth(dropdownWidth),
        ...dropdownStyle,
      };
    }
    return dropdownStyle;
  }, [dropdownStyle, dropdownWidth]);

  const basicProps = {
    suffixIcon: <Icon type={suffixIcon} />,
    clearIcon: <Icon type="close-circle-fill" />,
    getPopupContainer,
    style: newStyle,
    dropdownStyle: newDropdownStyle,
    className: getBaseCls("select"),
    popupClassName: getBaseCls("select-dropdown"),
    listHeight: 320,
    mode,
  };
  const onDropdownVisibleChangeWithSuffixIconChange = (open: boolean) => {
    open ? setSuffixIcon("arrow-ios-up") : setSuffixIcon("arrow-ios-down");
    if (props?.onDropdownVisibleChange) {
      props.onDropdownVisibleChange(open);
    }
  };

  const renderSelect = useMemo(() => {
    if (mode === "multiple" && limit) {
      const currentValue = props.value as IRawValue[];
      props.options?.forEach((item) => {
        item.disabled =
          currentValue?.length >= limit && !currentValue?.includes(item.value);
      });
      props.showToggleAll = false;
    }
    if (mode === "multiple" && checkable) {
      return (
        <CheckableSelect
          {...basicProps}
          {...(props as ISelectProps<IRawValue[]>)}
          onDropdownVisibleChange={onDropdownVisibleChangeWithSuffixIconChange}
        />
      );
    }
    return (
      <BasicSelect
        menuItemSelectedIcon={<Icon type="checkmark" />}
        {...basicProps}
        {...(props as ISelectProps<IRawValue>)}
        onDropdownVisibleChange={onDropdownVisibleChangeWithSuffixIconChange}
      />
    );
  }, [mode, checkable, limit, props, basicProps]);

  return <ConfigEmptyProvider>{renderSelect}</ConfigEmptyProvider>;
}

Select.Option = AntSelect.Option;
Select.OptGroup = AntSelect.OptGroup;

export default Select;
