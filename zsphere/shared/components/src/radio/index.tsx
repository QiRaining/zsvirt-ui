import { Radio as AntRadio, Tooltip } from "antd";
import { RadioProps } from "antd/es/radio";
import classnames from "classnames";
import React from "react";

import { getBaseCls } from "../_utils/common";

import "./style.less";

const tooltipWrapperCls = getBaseCls("tooltip-wrapper");
const radioWrapperCls = getBaseCls("radio-wrapper");

interface IProps extends RadioProps {
  tooltip?: React.ReactNode;
}

type InternalRadioProps = IProps;

const InternalRadio: React.FC<InternalRadioProps> = ({
  disabled,
  tooltip,
  children,
  ...props
}) => {
  const radio = disabled ? (
    <span style={{ pointerEvents: "none" }}>
      {/* https://github.com/ant-design/ant-design/pull/4865/files */}
      <AntRadio disabled={disabled} {...props}>
        {children}
      </AntRadio>
    </span>
  ) : (
    <AntRadio {...props}>{children}</AntRadio>
  );

  const radioWrapper = (ele: React.ReactNode): React.ReactNode => (
    <div className={classnames(radioWrapperCls)}>{ele}</div>
  );

  return (
    <div className={classnames(tooltipWrapperCls)}>
      <Tooltip title={tooltip}>{radioWrapper(radio)}</Tooltip>
    </div>
  );
};

type IWrapperInternalRadio = IProps;

const WrapperInternalRadio: React.FC<IWrapperInternalRadio> = ({
  tooltip,
  ...rest
}) =>
  tooltip ? (
    <InternalRadio tooltip={tooltip} {...rest} />
  ) : (
    <AntRadio {...rest} />
  );

type Radio = typeof WrapperInternalRadio & IWrapperInternalRadio;

interface IRadio extends Radio {
  Group: typeof AntRadio.Group;
  Button: typeof AntRadio.Button;
}

const Radio: IRadio = WrapperInternalRadio as IRadio;

Radio.Group = AntRadio.Group;
Radio.Button = AntRadio.Button;

Radio.displayName = "Radio";

export default Radio;
