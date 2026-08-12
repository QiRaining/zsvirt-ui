import { Icon } from "@zstack/icon";
import { useControllableValue } from "ahooks";
import { Drawer, Button } from "antd";
import React, { useRef, FC } from "react";
import { useIntl } from "react-intl";

import { DrawerFormProps, DrawerFormRefType } from "../type";

export const DrawerForm: FC<DrawerFormProps> = (props) => {
  const intl = useIntl();
  const { children, title, className } = props;
  const refForm = useRef<DrawerFormRefType>();

  const [open, setOpen] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: "open",
    trigger: "setOpen",
  });

  const resetForm = () => {
    if (props?.resetForm) {
      const { form } = refForm.current || {};
      form?.resetFields();
    }
  };

  const onOk = () => {
    const { submit, form } = refForm.current || {};
    if (!form) setOpen(false);
    return form
      ?.validateFields()
      .then((values: any) => {
        submit?.(values);
        setOpen(false);
        resetForm();
      })
      .catch((err) => console.error(err));
  };

  const onClose = () => {
    setOpen(false);
    resetForm();
  };
  const footer = (
    <div
      style={{
        textAlign: "left",
      }}
    >
      <Button onClick={onOk} type="primary" style={{ marginRight: 8 }}>
        {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
      </Button>
      <Button onClick={() => setOpen(false)}>
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
    </div>
  );

  const ch = React.cloneElement(children, { ref: refForm });
  return React.createElement(
    Drawer,
    {
      title,
      footer,
      closeIcon: <Icon type="close" />,
      width: 600,
      onClose,
      open: open,
      placement: "right",
      className,
      destroyOnClose: true,
    } as any,
    ch,
  );
};
