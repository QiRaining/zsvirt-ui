"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import { isNumber, isString } from "lodash-es";
import * as React from "react";
import type { RefObject } from "react";
import { useRef } from "react";

import { Input, type InputProps } from "./input";

export interface InputNumberProps extends InputProps {
  value: number | "";
  onValueChange: (value: number | "") => void;
  max?: number;
  min?: number;
  step?: number;
  controls?: boolean;
  /**
   * 自定义小数点后保留位数
   * 如果不设置，则根据 step 自动计算
   */
  precision?: number;
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      className,
      type,
      value,
      onValueChange,
      max = 10,
      min = 1,
      step = 1,
      controls = true,
      precision,
      ...props
    },
    ref?,
  ) => {
    const _inputRef = useRef<HTMLInputElement>(null);

    const inputRef = (ref || _inputRef) as RefObject<HTMLInputElement>;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const _text = e.target.value;
      const value = parseText(_text);

      if (value || value === 0) {
        onValueChange?.(value as number);
      }

      if (value === "") {
        onValueChange?.("");
      }
    };

    const handleClickUp = () => {
      inputRef.current!.focus();
      const v = changeValue("+", value, max, min, step, precision);
      onValueChange?.(v);
    };

    const handleClickDown = () => {
      inputRef.current!.focus();
      const v = changeValue("-", value, max, min, step, precision);
      onValueChange?.(v);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleClickUp();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleClickDown();
      }
    };

    const parseText = (text: string) => {
      if (isNumber(text)) {
        const num = Number(text);
        if (num === Infinity || num === -Infinity || isNaN(num)) {
          return "";
        }
        return text;
      }

      if (isString(text)) {
        text = text.trim();

        if (!text) {
          return "";
        }

        // Allow decimal point input
        if (text === "." || text.endsWith(".")) {
          return text;
        }

        const num = parseFloat(text);

        if (!isNaN(num)) {
          if (num === Infinity || num === -Infinity) {
            return "";
          }
          return num;
        }
      }

      return "";
    };

    const changeValue = (
      mod: "+" | "-",
      value: number | "",
      max: number,
      min: number,
      step: number,
      precision?: number,
    ) => {
      if (value === "") {
        if (isNumber(min)) {
          return min;
        }
        return "";
      }

      value = mod === "+" ? value + step : value - step;

      if (isNumber(max) && value > max) {
        return max;
      }
      if (isNumber(min) && value < min) {
        return min;
      }

      // 优先使用自定义 precision，否则根据 step 计算
      const p =
        precision !== undefined
          ? precision
          : (step.toString().split(".")[1] || []).length;
      if (p) {
        return parseFloat(value.toFixed(p));
      }

      return value;
    };

    return (
      <div
        className={cn(
          "bg-neutral-0 group relative box-border inline-block overflow-hidden rounded-xs before:box-border after:box-border",
          className,
        )}
      >
        {controls && (
          <div className="!border-l-solid pointer-events-none absolute top-px right-px z-1000 m-0 box-border flex h-[calc(100%-2px)] w-5.5 flex-col !border-0 !border-l !border-neutral-300 p-0 !opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:!opacity-100">
            <span
              className="!border-b-solid hover:!text-theme-600 relative box-border block flex h-1/2 cursor-pointer items-center justify-center !border-0 !border-b !border-neutral-300 !text-neutral-400"
              onClick={handleClickUp}
            >
              <Icon type="arrow-ios-up" className="h-3 w-3" />
            </span>
            <span
              className="hover:!text-theme-600 relative box-border block flex h-1/2 cursor-pointer items-center justify-center !border-0 !text-neutral-400"
              onClick={handleClickDown}
            >
              <Icon type="arrow-ios-down" className="h-3 w-3" />
            </span>
          </div>
        )}
        <Input
          type={type}
          className="group-hover:border-theme-600 z-999 box-border block w-full bg-transparent"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          {...props}
        />
      </div>
    );
  },
);

InputNumber.displayName = "InputNumber";

export { InputNumber };
