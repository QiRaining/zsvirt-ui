import { Spin as AntSpin } from "antd";
import cls from "classnames";
import React from "react";

import { getBaseCls } from "../_utils/common";
import type { ISpinProps } from "./type";

import "./style.less";

const baseCls = getBaseCls("spin");

const Spin: React.FC<ISpinProps> = ({ className, ...props }) => (
  <AntSpin className={cls(baseCls, className)} delay={300} {...props} />
);

export default Spin;

export type { ISpinProps };
