import cls from "classnames";
import React, { useEffect, useRef } from "react";

interface IErrorFieldProps {
  value?: React.ReactNode;
  className?: string;
}

export const ErrorField = ({ value, className }: IErrorFieldProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      divRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [value]);

  if (!value) {
    return null;
  }
  return (
    <div
      ref={divRef}
      className={cls(
        "ant-form-item-explain ant-form-item-explain-error",
        className,
      )}
    >
      {value}
    </div>
  );
};
