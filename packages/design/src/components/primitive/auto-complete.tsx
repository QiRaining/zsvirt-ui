"use client";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as React from "react";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";

import { useOverlay } from "../../utils/use-overlay";
import { Input } from "./input";

export interface AutoCompleteOption {
  value: string;
  label: string;
  i18nKey?: string;
}

export type TriggerMode = "search" | "focus";

export interface AutoCompleteProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "onSelect"
> {
  options: AutoCompleteOption[];
  onChange?: (value: string) => void;
  onSelect?: (option: AutoCompleteOption) => void;
  /**
   * 控制下拉框的触发方式
   * @default "search" - 只有在用户输入内容时才显示下拉框
   * "focus" - 在输入框获得焦点时就显示下拉框
   */
  triggerMode?: TriggerMode;
}

const AutoComplete = React.forwardRef<HTMLInputElement, AutoCompleteProps>(
  (
    {
      className,
      options,
      onChange,
      onSelect,
      triggerMode = "search",
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState((props.value as string) || "");
    const [filteredOptions, setFilteredOptions] =
      useState<AutoCompleteOption[]>(options);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [position, setPosition] = useState<{
      width?: number;
    }>({});
    const [lastSelectedValue, setLastSelectedValue] = useState<string | null>(
      null,
    );
    const justSelectedRef = useRef(false);
    const filteredOptionsCount = filteredOptions.length;

    // 自动管理 z-index
    const { zIndex } = useOverlay({
      type: "popover",
      open,
    });

    const combinedRef = useCallback(
      (element: HTMLInputElement | null) => {
        if (inputRef.current !== element) {
          inputRef.current = element;
        }
        if (typeof ref === "function") {
          ref(element);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            element;
        }
      },
      [ref],
    );

    // 每次过滤选项时重置选项refs数组
    useEffect(() => {
      optionRefs.current = filteredOptions.map(() => null);
    }, [filteredOptions]);

    // 更新默认选项
    useEffect(() => {
      setFilteredOptions(options);
    }, [options]);

    // 点击外部关闭下拉框
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 计算下拉框位置
    useEffect(() => {
      if (open && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          width: rect.width,
        });
      }
    }, [open]);

    const scrollHighlightedOptionIntoView = useCallback((index: number) => {
      if (
        index >= 0 &&
        index < optionRefs.current.length &&
        optionRefs.current[index] &&
        dropdownRef.current
      ) {
        const highlightedOption = optionRefs.current[index];
        if (!highlightedOption) {
          return;
        }

        const dropdownContainer = dropdownRef.current;

        const optionTop = highlightedOption.offsetTop;
        const optionBottom = optionTop + highlightedOption.offsetHeight;
        const containerTop = dropdownContainer.scrollTop;
        const containerBottom = containerTop + dropdownContainer.clientHeight;

        if (optionTop < containerTop) {
          dropdownContainer.scrollTop = optionTop;
        } else if (optionBottom > containerBottom) {
          dropdownContainer.scrollTop =
            optionBottom - dropdownContainer.clientHeight;
        }
      }
    }, []);

    const setHighlightedIndexWithScroll = useCallback(
      (index: number) => {
        setHighlightedIndex(index);
        requestAnimationFrame(() => {
          scrollHighlightedOptionIntoView(index);
        });
      },
      [scrollHighlightedOptionIntoView],
    );

    // 过滤选项的计算逻辑
    const filterOptions = useCallback(
      (value: string) => {
        if (value.trim() === "") {
          if (triggerMode === "focus") {
            setFilteredOptions(options);
            setOpen(true);
          } else {
            setFilteredOptions(options);
            setOpen(false);
          }
          setHighlightedIndex(-1);
          return;
        }

        const filtered = options.filter((option) =>
          option.label.toLowerCase().includes(value.toLowerCase()),
        );

        setFilteredOptions(filtered);

        if (filtered.length === 0) {
          setHighlightedIndex(-1);
          setLastSelectedValue(null);
          setOpen(false);
        } else {
          setOpen(true);

          if (lastSelectedValue) {
            const index = filtered.findIndex(
              (option) => option.value === lastSelectedValue,
            );
            setHighlightedIndexWithScroll(index !== -1 ? index : -1);
          } else {
            setHighlightedIndex(-1);
          }
        }
      },
      [options, triggerMode, lastSelectedValue, setHighlightedIndexWithScroll],
    );

    // 处理输入值变化
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        // 当用户清空输入时，清除上次选中的值
        if (value.trim() === "") {
          setLastSelectedValue(null);
        }
        filterOptions(value);
        onChange?.(value);
      },
      [filterOptions, onChange],
    );

    // 处理选项选择
    const handleOptionSelect = useCallback(
      (option: AutoCompleteOption, e?: React.MouseEvent) => {
        if (e) {
          e.preventDefault();
        }

        const value = option.label;

        setInputValue(value);
        setOpen(false);
        setLastSelectedValue(option.value);
        onSelect?.(option);

        const filtered = options.filter((option) =>
          option.label.toLowerCase().includes(value.toLowerCase()),
        );

        setFilteredOptions(filtered);
        onChange?.(value);

        justSelectedRef.current = true;

        if (inputRef.current) {
          inputRef.current.focus();
        }

        requestAnimationFrame(() => {
          justSelectedRef.current = false;
        });
      },
      [onSelect],
    );

    // 处理键盘导航
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open) {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            if (triggerMode === "focus") {
              setOpen(true);
              e.preventDefault();
              return;
            }

            if (inputValue.trim() !== "" && filteredOptionsCount > 0) {
              setOpen(true);
              e.preventDefault();
            }
          }
          return;
        }

        switch (e.key) {
          case "ArrowDown":
            setHighlightedIndexWithScroll(
              highlightedIndex < filteredOptionsCount - 1
                ? highlightedIndex + 1
                : highlightedIndex,
            );
            e.preventDefault();
            break;
          case "ArrowUp":
            setHighlightedIndexWithScroll(
              highlightedIndex > 0 ? highlightedIndex - 1 : 0,
            );
            e.preventDefault();
            break;
          case "Enter":
            if (
              highlightedIndex >= 0 &&
              highlightedIndex < filteredOptionsCount
            ) {
              handleOptionSelect(filteredOptions[highlightedIndex]);
              e.preventDefault();
            }
            break;
          case "Escape":
            setOpen(false);
            e.preventDefault();
            break;
        }
      },
      [
        open,
        triggerMode,
        inputValue,
        filteredOptionsCount,
        highlightedIndex,
        handleOptionSelect,
        setHighlightedIndexWithScroll,
      ],
    );

    // 处理聚焦事件
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        if (justSelectedRef.current) {
          return;
        }

        if (triggerMode === "focus") {
          setOpen(true);
        } else {
          if (inputValue.trim() !== "" && filteredOptionsCount > 0) {
            setOpen(true);
          }
        }

        props.onFocus?.(e);
      },
      [triggerMode, options, inputValue, filteredOptionsCount, props.onFocus],
    );

    // 处理点击事件
    const handleClick = useCallback(() => {
      if (triggerMode === "focus") {
        setHighlightedIndexWithScroll(-1);
        setOpen(true);
      } else if (
        lastSelectedValue ||
        (inputValue.trim() !== "" && filteredOptionsCount > 0)
      ) {
        setHighlightedIndexWithScroll(-1);
        setOpen(true);
      }
    }, [
      triggerMode,
      options,
      inputValue,
      filteredOptionsCount,
      lastSelectedValue,
    ]);

    // 计算下拉框样式
    const dropdownStyle = useMemo(
      () => ({
        width: position.width,
      }),
      [position],
    );

    return (
      <div className="relative w-fit" ref={containerRef}>
        <Input
          {...props}
          className={cn(className)}
          ref={combinedRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        />

        {open && filteredOptionsCount > 0 && (
          <div
            className="bg-neutral-0 shadow-light animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 absolute mt-1 rounded-xs border border-solid border-neutral-300 py-1"
            style={{ ...dropdownStyle, zIndex }}
          >
            <div className="max-h-50 overflow-y-auto" ref={dropdownRef}>
              {filteredOptions.map((option, index) => (
                <div
                  key={`auto-complete-${option.value}`}
                  ref={(el) => (optionRefs.current[index] = el)}
                  className={`flex max-h-8 cursor-pointer items-center justify-between px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 ${highlightedIndex === index ? "bg-neutral-100" : ""} ${lastSelectedValue === option.value ? "bg-theme-50" : ""} `}
                  onClick={(e) => handleOptionSelect(option, e)}
                >
                  <span className="mr-2">{option.label}</span>
                  {lastSelectedValue === option.value && (
                    <Icon type="checkmark" className="text-theme-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

AutoComplete.displayName = "AutoComplete";

export { AutoComplete };
