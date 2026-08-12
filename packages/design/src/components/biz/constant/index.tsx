"use client";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { ConfigContext } from "../config";
import type { IStateProps } from "../state";
import { State } from "../state";

export interface IConstant extends Partial<IStateProps> {
  value: string;
  enumType?: string;
}

export const useConstant = (value: string, enumType?: string) => {
  const { constant } = React.useContext(ConfigContext);

  const intl = useIntl();

  // 当i18n改变时，需要重新拿一下最新的翻译
  return useMemo(() => {
    const originProps: IStateProps = { name: value, contentType: "text" };
    if (enumType) {
      return (
        constant?.constantGroupMap?.get(`${enumType}-${value}`) || originProps
      );
    }
    return constant?.constantMap?.get(value) || originProps;
  }, [value, enumType, intl]);
};

export const Constant: React.FC<IConstant> = ({ value, enumType, ...rest }) => {
  const stateProps = useConstant(value, enumType);
  return <State {...stateProps} {...rest} />;
};
