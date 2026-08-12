import React from "react";

interface IProps {
  children: React.ElementType;
}

export default ({ children }: IProps) => {
  return <>{children}</>;
};
