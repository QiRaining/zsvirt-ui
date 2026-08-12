"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as React from "react";

import { Input } from "./input.tsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  onSearch?: (value: string) => void;
  value?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      onClear,
      onSearch,
      onChange,
      value: _value,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState<string>(_value || "");

    React.useEffect(() => {
      setValue(_value || "");
    }, [_value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    const handleClear = () => {
      setValue("");
      if (onClear) {
        onClear();
      }
    };

    const handleSearch = () => {
      onSearch?.(value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSearch();
      }
    };

    return (
      <div className={cn("relative", className)}>
        {value && (
          <Icon type="close-circle-fill"
            onClick={handleClear}
            className="parent svg:h-4 svg:w-4 svg:fill-current absolute top-2 right-8 flex cursor-pointer text-neutral-400 hover:text-neutral-500"
          />
        )}
        <Icon type="search"
          onClick={handleSearch}
          className="parent svg:h-4 svg:w-4 absolute top-2 right-3 flex cursor-pointer text-neutral-700"
        />
        <Input
          type={type}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={ref}
          className="w-full"
          {...props}
        />
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
