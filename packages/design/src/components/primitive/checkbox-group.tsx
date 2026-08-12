import React from "react";

import { useId } from "../../utils/use-id.ts";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { Tooltip } from "./tooltip";

export type CheckboxGroupItem = {
  label: React.ReactNode;
  value: string;
  tooltip?: React.ReactNode;
  disabled?: boolean;
};

interface CheckboxGroupProps {
  items: CheckboxGroupItem[];
  value: string[];
  onChange: (value: string[]) => void;
}

const CheckboxGroup = (props: CheckboxGroupProps) => {
  const { items, value, onChange } = props;
  const id = useId();
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map((item, index) => {
        const itemId = `${id}-${index}`;
        const checkboxElement = (
          <div className="flex items-center" key={itemId}>
            <Checkbox
              id={itemId}
              checked={value?.includes(item.value)}
              disabled={item.disabled}
              onCheckedChange={(checked) => {
                return checked
                  ? onChange([...value, item.value])
                  : onChange(value?.filter((value) => value !== item.value));
              }}
              className="peer"
            />
            {/* 设计稿的图标是有间距的，在checkbox这个场景下实际的大小是14*14，但是外面按16*16来算，所以这里的间距是8+2=10*/}
            <Label
              htmlFor={itemId}
              className="cursor-pointer pl-2.5 text-sm text-neutral-700 peer-disabled:cursor-not-allowed peer-disabled:text-neutral-500"
              data-disabled={item.disabled}
            >
              {item.label}
            </Label>
          </div>
        );

        return item.tooltip ? (
          <Tooltip key={itemId} title={item.tooltip}>
            {checkboxElement}
          </Tooltip>
        ) : (
          checkboxElement
        );
      })}
    </div>
  );
};

export { CheckboxGroup };
