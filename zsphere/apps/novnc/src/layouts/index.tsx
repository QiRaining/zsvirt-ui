import { SubAppLayout } from "@zstack/zsphere-components";
import React from "react";

interface IProps {
  children: React.ElementType;
}

export default ({ children }: IProps) => {
  return <SubAppLayout>{children}</SubAppLayout>;
};
