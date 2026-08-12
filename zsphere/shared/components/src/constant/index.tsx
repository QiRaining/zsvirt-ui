import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import React, { FC, useContext } from "react";

import { ConfigContext } from "../a-cloud-old-components/config";
import type { IStateProps } from "../a-cloud-old-components/state";
import State from "../a-cloud-old-components/state";

interface IConstant extends Partial<IStateProps> {
  value: ConstantEnum;
  enumType?: ConstantType;
}

function useConstant(value: ConstantEnum, enumType?: ConstantType) {
  const { constant } = useContext(ConfigContext);
  const originProps: IStateProps = { name: value, contentType: "text" };
  if (enumType) {
    return (
      constant?.constantGroupMap?.get(`${enumType}-${value}`) || originProps
    );
  }
  return constant?.constantMap?.get(value) || originProps;
}

const Constant: FC<IConstant> = ({ value, enumType, ...restProps }) => {
  const stateProps = useConstant(value, enumType) || {
    name: value,
    contentType: "text",
  };
  return <State {...stateProps} {...restProps} />;
};

export default Constant;
