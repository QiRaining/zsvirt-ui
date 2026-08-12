
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useIntl } from "react-intl";

import { useOverlay } from "../../utils/use-overlay";
import { Button } from "./button.tsx";
import { Checkbox } from "./checkbox.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx";
import { Tag } from "./tag.tsx";
import { Text } from "./text.tsx";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * @interface MultiSelectEmptyPlaceholderProps
 * @description 当MultiSelect没有选项时显示的空状态占位符组件的属性接口
 * @property {string} [text] - 空状态下显示的文本，如果未提供则使用默认的"暂无数据"
 */
interface MultiSelectEmptyPlaceholderProps {
  text?: string;
}

const MultiSelectEmptyPlaceholder = (
  props: MultiSelectEmptyPlaceholderProps,
) => {
  const { text } = props;
  const intl = useIntl();
  return (
    <div className="flex h-42 flex-col items-center justify-center">
      <div className="flex h-15 w-15 items-center justify-center rounded-full bg-neutral-100">
        <Icon type="inbox" className="h-6 w-6 text-neutral-300" />
      </div>
      <span className="mt-2 text-xs text-neutral-500">
        {text ||
          intl.formatMessage({
            id: "multiSelect.empty",
            defaultMessage: "暂无数据",
          })}
      </span>
    </div>
  );
};

/**
 * Option type for MultiSelect component
 */
interface MultiSelectOption {
  /** The content to display for the option. Can be a string or React node. */
  label: React.ReactNode;
  /** The unique value associated with the option. */
  value: string;
  /** Optional string used for search filtering. If not provided, label will be used (only if label is a string). */
  searchLabel?: string;
  /** Optional icon component to display alongside the option. */
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: MultiSelectOption[];

  /** 当前选中的值 */
  selectedValues: MultiSelectOption[];

  /** 选中值变化的回调函数 */
  onSelectedValuesChange: (values: MultiSelectOption[]) => void;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string;

  /**
   * Props to pass to the PopoverContent portal.
   * Optional, can be used to specify container for portal rendering.
   */
  popoverPortalProps?: { container?: HTMLElement };

  /**
   * Additional class names to apply to the PopoverContent.
   * Optional, can be used to customize the dropdown content styles.
   */
  popoverContentClassName?: string;

  /**
   * 当options为空数组时显示的文本
   */
  emptyPlaceholderText?: string;

  /**
   * 在输入框中显示的占位符文本（当没有选中项时显示）
   */
  placeholder?: string;
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      selectedValues,
      onSelectedValuesChange,
      variant,
      modalPopover = false,
      className,
      popoverPortalProps,
      popoverContentClassName,
      emptyPlaceholderText,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
    const intl = useIntl();

    const inputRef = React.useRef<HTMLInputElement>(null);

    // 自动管理 z-index
    const { zIndex } = useOverlay({
      type: "popover",
      open: isPopoverOpen,
    });

    React.useEffect(() => {
      if (isPopoverOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isPopoverOpen]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    };

    const filteredOptions = options.filter((option) => {
      const searchText =
        option.searchLabel ??
        (typeof option.label === "string" ? option.label : "");
      return searchText.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === "Enter") {
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          // 如果有高亮项，则选择该项
          toggleOption(filteredOptions[highlightedIndex].value);
          event.preventDefault();
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        onSelectedValuesChange(newSelectedValues);
      }
    };

    const toggleOption = (optionValue: string) => {
      const option = options.find((o) => o.value === optionValue);
      if (!option) {
        return;
      }

      const newSelectedValues = selectedValues.some(
        (v) => v.value === optionValue,
      )
        ? selectedValues.filter((value) => value.value !== optionValue)
        : [...selectedValues, option];

      onSelectedValuesChange(newSelectedValues);
      setSearchQuery("");
      inputRef.current?.focus();
    };

    const handleClear = () => {
      onSelectedValuesChange([]);
      inputRef.current?.focus();
    };

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear();
      } else {
        onSelectedValuesChange([...options]);
      }
      inputRef.current?.focus();
    };

    const isInputVisible =
      isPopoverOpen ||
      isFocused ||
      selectedValues.length === 0 ||
      searchQuery.length > 0;

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <div
            ref={ref}
            className={cn(
              "bg-neutral-0 focus-within:ring-theme-600 focus-within:border-theme-600 focus-within:ring-theme-50 hover:border-theme-600 aria-[invalid=true]:border-danger-500 aria-[invalid=true]:focus-visible:border-danger-500 aria-[invalid=true]:focus-visible:ring-danger-50 aria-[invalid=true]:hover:border-danger-500 box-border flex min-h-8 w-80 min-w-0 gap-1 rounded-xs border border-1 border-solid border-neutral-400 px-3 py-0.75 pr-0 focus-within:ring-2 focus-within:ring-offset-0 focus-within:outline-none",
              className,
            )}
            {...props}
          >
            <div className="flex min-w-0 flex-1 flex-wrap gap-1">
              {selectedValues.length > 0 && (
                <>
                  {selectedValues.map((option) => (
                    <Tag
                      key={option.value}
                      className={cn(
                        "max-w-full",
                        multiSelectVariants({ variant }),
                      )}
                      closable
                      onClose={(event) => {
                        event?.stopPropagation();
                        toggleOption(option.value);
                      }}
                    >
                      {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                      {option.label}
                    </Tag>
                  ))}
                </>
              )}
              <input
                ref={inputRef}
                className={cn(
                  "max-h-8 border-0 placeholder:text-neutral-500 focus:ring-0 focus:ring-offset-0 focus:outline-none",
                  isInputVisible
                    ? "min-w-1 flex-1"
                    : "pointer-events-none m-0 h-0 w-0 min-w-0 p-0 opacity-0",
                )}
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  setSearchQuery("");
                }}
                placeholder={selectedValues.length === 0 ? placeholder : ""}
              />
            </div>
            <div
              className="flex shrink-0 items-center"
              aria-label="toggle dropdown"
            >
              {isPopoverOpen ? (
                <Icon type="arrow-ios-up"
                  className="cursor-pointer text-neutral-700"
                  aria-hidden="true"
                  role="presentation"
                />
              ) : (
                <Icon type="arrow-ios-down"
                  className="cursor-pointer text-neutral-700"
                  aria-hidden="true"
                  role="presentation"
                />
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className={cn("bg-neutral-0 w-80 p-0", popoverContentClassName)}
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
          }}
          popoverPortalProps={popoverPortalProps}
          open={isPopoverOpen}
          zIndex={zIndex}
        >
          {!searchQuery && (
            <div className="border-b-solid flex h-8 items-center justify-between border-b border-b-neutral-300 px-3">
              <div className="text-sm text-neutral-700">
                {intl.formatMessage(
                  {
                    id: "multiSelect.selected",
                    defaultMessage: "已选({count})",
                  },
                  { count: selectedValues.length },
                )}
              </div>
              {selectedValues.length > 0 ? (
                <Button variant="link" onClick={handleClear}>
                  {intl.formatMessage({
                    id: "multiSelect.clear",
                    defaultMessage: "清空",
                  })}
                </Button>
              ) : (
                <Button variant="link" onClick={toggleAll}>
                  {intl.formatMessage({
                    id: "multiSelect.selectAll",
                    defaultMessage: "全选",
                  })}
                </Button>
              )}
            </div>
          )}
          <div className="max-h-80 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = selectedValues.some(
                  (v) => v.value === option.value,
                );
                const isHighlighted = index === highlightedIndex;
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "flex h-8 cursor-pointer items-center px-3 hover:bg-neutral-100",
                      isHighlighted && "bg-neutral-100",
                    )}
                    onClick={() => toggleOption(option.value)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOption(option.value)}
                    />
                    <Text className="ml-2 text-sm text-neutral-700">
                      {option.label}
                    </Text>
                  </div>
                );
              })
            ) : (
              <MultiSelectEmptyPlaceholder text={emptyPlaceholderText} />
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

MultiSelect.displayName = "MultiSelect";

export type { MultiSelectProps, MultiSelectOption };
