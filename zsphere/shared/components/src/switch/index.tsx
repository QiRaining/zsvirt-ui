import { Icon } from "@zstack/icon";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useToggle } from "ahooks";
import { Switch as AntSwitch, Popconfirm } from "antd";
import { SwitchProps } from "antd/lib/switch";
import React, { FC } from "react";

import "./style.less";
import { getBaseCls } from "../_utils/common";

export interface ISwitchProps
  extends
    Omit<SwitchProps, "title">,
    Pick<React.DOMAttributes<HTMLDivElement>, "onMouseEnter" | "onMouseLeave"> {
  title?: React.ReactNode;
  desc?: React.ReactChild;
  onConfirm?: (e?: React.MouseEvent<HTMLElement>) => void;
}
const baseSwitchCls = getBaseCls("switch");
const basePopCls = getBaseCls("popconfirm");

const BasicSwitch: FC<
  SwitchProps & Pick<ISwitchProps, "onMouseEnter" | "onMouseLeave">
> = ({ onMouseEnter, onMouseLeave, ...props }) => (
  <span
    className={baseSwitchCls}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <AntSwitch
      size="small"
      checkedChildren={<Icon size={12} type="checkmark" />}
      unCheckedChildren={<Icon size={12} type="close" />}
      {...props}
    />
  </span>
);

const Switch: FC<ISwitchProps> = ({ title, desc, onConfirm, ...props }) => {
  const [visible, { toggle: toggleVisible }] = useToggle(false);

  const onOk = () => {
    toggleVisible(false);
    onConfirm?.();
  };

  const getPopupContainer = (node: HTMLElement) => {
    if (node.parentElement) {
      return node.parentElement;
    }
    return document.body;
  };

  if (title && !desc) {
    const { disabled } = props;
    return (
      <Popconfirm
        title={title}
        onConfirm={onConfirm}
        placement="right"
        icon={<Icon color="alert" colorNumber={500} type="alert-triangle-fill" />}
        okButtonProps={{
          type: "primary",
          size: "middle",
        }}
        cancelButtonProps={{
          type: "text",
          size: "middle",
        }}
        disabled={disabled}
        getPopupContainer={getPopupContainer}
        overlayClassName={basePopCls}
      >
        <BasicSwitch {...props} />
      </Popconfirm>
    );
  }

  if (title && desc) {
    return (
      <>
        <BasicSwitch {...props} onClick={() => toggleVisible(true)} />
        <DialogWeak
          type="warning"
          visible={visible}
          setVisible={toggleVisible}
          title={String(title)}
          description={desc}
          onConfirm={onOk}
        />
      </>
    );
  }

  return <BasicSwitch {...props} />;
};

export default Switch;
