import * as React from "react";

export interface FieldGroupProps {
  children: React.ReactNode;
}

export const FieldGroup: React.FC<FieldGroupProps> = (props) => {
  const { children } = props;
  return (
    <div className="box-border flex w-full min-w-0 items-center">
      <div className="group box-border flex w-full grow-0 rounded-xs pr-1">
        <div className="flex w-fit flex-col gap-1 group-hover:bg-neutral-100">
          {children}
        </div>
      </div>
    </div>
  );
};
